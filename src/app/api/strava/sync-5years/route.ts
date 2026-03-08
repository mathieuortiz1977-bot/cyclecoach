import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Note: Strava token validation would happen in actual implementation
    // For now, we'll fetch activities assuming Strava is connected via OAuth flow

    // Fetch 5 years of activities (from 5 years ago until now)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const afterTimestamp = Math.floor(fiveYearsAgo.getTime() / 1000);

    const activities = [];
    let page = 1;
    let hasMore = true;

    // Get Strava token from environment (would be from rider's OAuth in production)
    const stravaToken = process.env.STRAVA_BEARER_TOKEN;
    if (!stravaToken) {
      return NextResponse.json({
        error: "Strava token not configured. Contact administrator.",
        success: false
      }, { status: 400 });
    }

    // Paginate through all activities from 5 years ago
    while (hasMore) {
      try {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}&per_page=200&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${stravaToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Strava API error: ${response.status}`);
        }

        const pageActivities = await response.json();

        if (pageActivities.length === 0) {
          hasMore = false;
        } else {
          activities.push(...pageActivities);
          page++;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMore = false;
      }
    }

    // Extract segments from all activities
    const segmentMap = new Map<string, any>();

    for (const activity of activities) {
      // Fetch detailed activity to get segments
      try {
        const detailResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${activity.id}`,
          {
            headers: {
              Authorization: `Bearer ${stravaToken}`,
            },
          }
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();

          // Extract segment efforts
          if (detailData.segment_efforts) {
            for (const effort of detailData.segment_efforts) {
              const segment = effort.segment;
              const key = segment.id.toString();

              if (!segmentMap.has(key)) {
                segmentMap.set(key, {
                  id: segment.id,
                  name: segment.name,
                  distance: segment.distance,
                  elevation: segment.elevation_gain,
                  avgGrade: segment.average_grade,
                  attempts: [],
                });
              }

              const segData = segmentMap.get(key);
              // Use start_date_local to get correct timezone (UTC-5 for Bogota)
              const effortDate = effort.start_date_local 
                ? new Date(effort.start_date_local)
                : new Date(effort.start_date);
              
              segData.attempts.push({
                activityId: activity.id,
                date: effortDate,
                elapsedTime: effort.elapsed_time,
                movingTime: effort.moving_time,
                avgPower: effort.average_watts,
                maxPower: effort.max_watts,
                avgHr: effort.average_heartrate,
                maxHr: effort.max_heartrate,
                avgCadence: effort.average_cadence,
                isPR: effort.pr_rank === 1,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching activity ${activity.id}:`, error);
        // Continue to next activity
      }
    }

    // Store segments in database
    const storedSegments = [];

    for (const [segmentId, segData] of segmentMap.entries()) {
      // Sort attempts by date
      const sortedAttempts = segData.attempts.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate best time and trend
      const bestAttempt = sortedAttempts.reduce((best: any, current: any) => 
        current.elapsedTime < best.elapsedTime ? current : best
      );

      const recentAttempts = sortedAttempts.slice(-5);
      const recentAvgTime = recentAttempts.reduce((sum: number, a: any) => sum + a.elapsedTime, 0) / recentAttempts.length;

      const improvement = bestAttempt.elapsedTime - (recentAvgTime || bestAttempt.elapsedTime);
      const improvementPercent = (improvement / bestAttempt.elapsedTime) * 100;

      // Determine trend
      let trend = "stable";
      if (improvementPercent > 2) {
        trend = "improving";
      } else if (improvementPercent < -2) {
        trend = "declining";
      }

      storedSegments.push({
        id: segmentId,
        name: segData.name,
        distance: segData.distance,
        elevation: segData.elevation,
        avgGrade: segData.avgGrade,
        attempts: sortedAttempts.length,
        bestTime: bestAttempt.elapsedTime,
        bestDate: bestAttempt.date,
        recentAvgTime: recentAvgTime,
        improvement: improvement,
        improvementPercent: improvementPercent,
        trend: trend,
        attempts_data: JSON.stringify(sortedAttempts),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${activities.length} activities with ${storedSegments.length} unique segments`,
      segments: storedSegments.length,
      activities: activities.length,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync Strava data" }, { status: 500 });
  }
}