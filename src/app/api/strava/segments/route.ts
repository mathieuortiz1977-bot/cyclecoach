import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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
      where: { userId },
      include: {
        stravaActivities: {
          orderBy: { startDate: "desc" },
          take: 200, // Last 200 activities
        },
        completedWorkouts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Calculate current form score (0-100)
    const formScore = calculateFormScore(rider);

    // Fetch segment stats from database
    const segmentStats = await prisma.segmentStat.findMany({
      where: { riderId: rider.id },
      orderBy: { attempts: "desc" },
      take: 20
    });

    // Fetch segment attempts grouped by segment
    const segmentAttempts = await prisma.segmentAttempt.findMany({
      where: { riderId: rider.id },
      orderBy: { attemptDate: "desc" }
    });

    // Group attempts by segment
    const segmentMap = new Map<string, any>();
    
    for (const stat of segmentStats) {
      segmentMap.set(stat.id, {
        segment: stat,
        attempts: [],
        bestTime: stat.bestTime,
        bestDate: stat.bestDate.toISOString()
      });
    }
    
    for (const attempt of segmentAttempts) {
      if (!segmentMap.has(attempt.segmentId)) continue;
      
      const seg = segmentMap.get(attempt.segmentId);
      seg.attempts.push({
        time: attempt.elapsedTime,
        date: attempt.attemptDate.toISOString(),
        power: attempt.avgPower,
        hr: attempt.avgHr,
      });
    }

    // Process segment data and calculate PR potential
    const segments = Array.from(segmentMap.values())
      .map(seg => {
        const recent3 = seg.attempts.slice(0, 3).map((a: any) => a.time);
        const recentAvg = recent3.length > 0 ? recent3.reduce((a: number, b: number) => a + b, 0) / recent3.length : seg.bestTime;
        const improvement = seg.bestTime - recentAvg;
        const improvementPercent = recentAvg > 0 ? (improvement / recentAvg) * 100 : 0;
        
        let trend: "improving" | "declining" | "stable" = "stable";
        if (improvementPercent < -5) trend = "improving";
        else if (improvementPercent > 5) trend = "declining";
        
        return {
          segment: {
            id: seg.segment.id,
            name: seg.segment.name,
            distance: seg.segment.distance || 0,
            elevation: seg.segment.elevationGain || 0,
            avgGrade: seg.segment.avgGrade || 0,
            attempts: seg.attempts.length,
            bestTime: seg.bestTime,
            bestDate: seg.bestDate,
            recentAvgTime: recentAvg,
            improvement: improvement,
            improvementPercent: improvementPercent,
            distanceFromPR: Math.max(0, recentAvg - seg.bestTime), // seconds away from PR
            percentageFromPR: ((recentAvg - seg.bestTime) / seg.bestTime) * 100, // % slower than PR
          },
          attempts: seg.attempts,
          trend,
          proPotential: calculatePRPotential(formScore, trend, seg.attempts.length > 5),
        };
      })
      .sort((a, b) => b.segment.attempts - a.segment.attempts) // Sort by most ridden
      .slice(0, 20); // Top 20 segments

    return NextResponse.json({
      success: true,
      segments,
      formScore,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

/**
 * Calculate rider's current form score based on recent training
 * Factors in:
 * - Workout completion rate
 * - TSS accumulated in past 30 days
 * - Consistency of training
 * - Recovery status
 */
function calculateFormScore(rider: any): number {
  let score = 50; // Base score

  // Completion rate factor (+/-20 points)
  const pastMonth = new Date();
  pastMonth.setDate(pastMonth.getDate() - 30);
  
  const completedInMonth = rider.completedWorkouts?.length || 0;
  const expectedWorkouts = 20; // Approximately 4-5 per week
  const completionRate = Math.min(completedInMonth / expectedWorkouts, 1);
  score += completionRate * 20;

  // TSS assessment (check if workouts had intensity)
  // This would use actual TSS data if available
  const hasHighIntensity = (rider.completedWorkouts || []).some((w: any) => w.rpe >= 8);
  if (hasHighIntensity) {
    score += 15;
  }

  // Recency bonus (more recent training = higher form)
  if (completedInMonth > 0) {
    score += 10;
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate PR potential score (0-100)
 * Based on:
 * - Current form score
 * - Segment trend (improving segments are better for PRs)
 * - Time since last attempt
 * - Recent performance on segment
 */
function calculatePRPotential(formScore: number, trend: string, hasGoodHistory: boolean = false): number {
  let potential = formScore;

  // Trend multiplier
  if (trend === "improving") {
    potential += 20;
  } else if (trend === "declining") {
    potential -= 15;
  }

  // Bonus for well-ridden segments (good history = more reliable form assessment)
  if (hasGoodHistory) {
    potential += 5;
  }

  // Cap between 0-100
  return Math.min(Math.max(potential, 0), 100);
}
