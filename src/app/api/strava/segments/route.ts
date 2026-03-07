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
        completedWorkouts: {
          orderBy: { createdAt: "desc" },
          take: 20, // Last 20 workouts
        },
      },
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Calculate current form score (0-100)
    const formScore = calculateFormScore(rider);

    // Get segments from Strava (would be stored in a real database)
    // For now, return sample structure
    const segments = [
      {
        segment: {
          id: "1",
          name: "Climb Example",
          distance: 2400,
          elevation: 180,
          avgGrade: 7.5,
          attempts: 12,
          bestTime: 642,
          bestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          recentAvgTime: 720,
          improvement: -78,
          improvementPercent: -12.1,
        },
        attempts: [],
        trend: "declining" as const,
        proPotential: calculatePRPotential(formScore, "declining"),
      },
    ];

    return NextResponse.json({
      success: true,
      segments: segments,
      formScore: formScore,
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
function calculatePRPotential(formScore: number, trend: string): number {
  let potential = formScore;

  // Trend multiplier
  if (trend === "improving") {
    potential += 20;
  } else if (trend === "declining") {
    potential -= 15;
  }

  // Cap between 0-100
  return Math.min(Math.max(potential, 0), 100);
}
