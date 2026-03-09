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

    // Count total activities in database for this rider
    const totalCount = await prisma.stravaActivity.count({
      where: { riderId: rider.id },
    });
    
    console.log(`[GET /api/strava/activities] Total activities in DB for rider ${rider.id}:`, totalCount);

    // Get all Strava activities for this rider (return all fields needed by calendar)
    const activities = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: {
        id: true,
        stravaId: true,
        name: true,
        type: true,
        startDate: true, // UTC-5 (Bogota) from start_date_local
        movingTime: true,
        elapsedTime: true,
        distance: true,
        totalElevation: true,
        averageWatts: true,
        maxWatts: true,
        weightedAvgWatts: true,
        averageHeartrate: true,
        maxHeartrate: true,
        averageCadence: true,
        tss: true,
        intensityFactor: true,
        hasHeartrate: true,
        hasPower: true,
      },
      orderBy: { startDate: "desc" },
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
    return NextResponse.json({ error: "Failed to get activities", details: String(err) }, { status: 500 });
  }
}
