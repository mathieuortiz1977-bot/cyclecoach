import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { getStravaActivity } from "@/lib/strava";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "No user id" }, { status: 400 });
  }

  try {
    // Get rider and Strava connection
    const rider = await prisma.rider.findUnique({
      where: { userId },
      include: {
        stravaConnection: true,
        stravaActivities: {
          orderBy: { startDate: "desc" },
          // No limit - extract segments from ALL activities
        },
      },
    });

    if (!rider?.stravaConnection) {
      return NextResponse.json({ error: "Strava not connected" }, { status: 400 });
    }

    // Decrypt access token
    const plainAccess = decrypt(rider.stravaConnection.accessToken);

    let extractedCount = 0;
    let segmentCount = 0;
    const errors: string[] = [];

    // For each activity, fetch detailed data and extract segments
    for (const activity of rider.stravaActivities) {
      try {
        // Get detailed activity (includes segment_efforts)
        const detailedActivity = await getStravaActivity(plainAccess, Number(activity.stravaId));

        if (!detailedActivity.segment_efforts || detailedActivity.segment_efforts.length === 0) {
          continue;
        }

        extractedCount++;

        // Process each segment effort
        for (const effort of detailedActivity.segment_efforts) {
          const segment = effort.segment;
          
          // Calculate elevation gain
          const elevationGain = segment.elevation_high - segment.elevation_low;

          // Create or update SegmentStat
          let segmentStat = await prisma.segmentStat.findUnique({
            where: {
              riderId_stravaSegmentId: {
                riderId: rider.id,
                stravaSegmentId: segment.id.toString(),
              },
            },
          });

          if (!segmentStat) {
            segmentStat = await prisma.segmentStat.create({
              data: {
                riderId: rider.id,
                stravaSegmentId: segment.id.toString(),
                name: segment.name,
                distance: Math.round(segment.distance),
                elevation: Math.round(elevationGain),
                avgGrade: segment.average_grade,
                attempts: 1,
                bestTime: effort.elapsed_time,
                bestDate: activity.startDate,
              },
            });
            segmentCount++;
          } else {
            // Update existing segment stat
            const isPR = effort.elapsed_time < segmentStat.bestTime;
            const attemptCount = segmentStat.attempts + 1;

            // Calculate trend
            const recentAvg = segmentStat.recentAvgTime || segmentStat.bestTime;
            const improvement = segmentStat.bestTime - effort.elapsed_time;
            const improvementPercent =
              recentAvg > 0 ? (improvement / recentAvg) * 100 : 0;

            let trend = "stable";
            if (improvementPercent < -5) trend = "improving";
            else if (improvementPercent > 5) trend = "declining";

            await prisma.segmentStat.update({
              where: { id: segmentStat.id },
              data: {
                attempts: attemptCount,
                bestTime: isPR ? effort.elapsed_time : segmentStat.bestTime,
                bestDate: isPR ? activity.startDate : segmentStat.bestDate,
                recentAvgTime: Math.round(
                  ((segmentStat.recentAvgTime || segmentStat.bestTime) * (attemptCount - 1) +
                    effort.elapsed_time) /
                    attemptCount
                ),
                improvement: improvement,
                improvementPercent: improvementPercent,
                trend: trend,
              },
            });
          }

          // Create SegmentAttempt record
          const existingAttempt = await prisma.segmentAttempt.findFirst({
            where: {
              riderId: rider.id,
              segmentId: segmentStat.id,
              stravaActivityId: activity.id,
            },
          });

          if (!existingAttempt) {
            await prisma.segmentAttempt.create({
              data: {
                riderId: rider.id,
                segmentId: segmentStat.id,
                stravaActivityId: activity.id,
                attemptDate: activity.startDate,
                elapsedTime: effort.elapsed_time,
                movingTime: effort.moving_time,
                avgPower: effort.average_watts || undefined,
                maxPower: effort.max_watts || undefined,
                avgHr: effort.average_heartrate ? Math.round(effort.average_heartrate) : undefined,
                maxHr: effort.max_heartrate ? Math.round(effort.max_heartrate) : undefined,
                avgCadence: effort.average_cadence || undefined,
                isPR: effort.pr_rank === 1, // pr_rank of 1 means it's a PR
              },
            });
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Activity ${activity.stravaId}: ${errorMsg}`);
        // Continue with next activity on error
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      extracted: extractedCount,
      segments: segmentCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Extracted ${extractedCount} activities with segment data, found ${segmentCount} new segments`,
    });
  } catch (err) {
    console.error("Segment extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
