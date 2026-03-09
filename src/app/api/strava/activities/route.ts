import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET() {
  try {
    console.log("[GET /api/strava/activities] START");
    
    const rider = await getCurrentRiderWithStrava();

    if (!rider) {
      console.error("[GET /api/strava/activities] Not authenticated - no session");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("[GET /api/strava/activities] Rider found:", {
      id: rider.id,
      userId: rider.userId,
      name: rider.name
    });

    // Get all Strava activities for this rider - simplified query
    // Only select fields actually needed by the UI
    const activities = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: {
        id: true,
        stravaId: true,
        name: true,
        type: true,
        startDate: true,
        movingTime: true,
        elapsedTime: true,
        distance: true,
        totalElevation: true,
        averageWatts: true,
        maxWatts: true,
        weightedAvgWatts: true,
        averageHeartrate: true,
        maxHeartrate: true,
        tss: true,
      },
      orderBy: { startDate: "desc" },
      take: 10000, // Reasonable limit to prevent huge transfers
    });

    console.log(`[GET /api/strava/activities] Fetched ${activities.length} activities`);
    
    if (activities.length > 0) {
      console.log("[GET /api/strava/activities] First activity:", {
        id: activities[0].id,
        name: activities[0].name,
        date: activities[0].startDate
      });
    }

    return NextResponse.json({
      success: true,
      activities,
      total: activities.length,
    });
  } catch (err) {
    console.error("[GET /api/strava/activities] ERROR:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ 
      error: "Failed to get activities", 
      details: errorMsg,
      success: false
    }, { status: 500 });
  }
}
