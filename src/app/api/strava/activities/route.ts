import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET() {
  try {
    const rider = await getCurrentRiderWithStrava();

    if (!rider) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    return NextResponse.json({
      success: true,
      activities,
      total: activities.length,
    });
  } catch (err) {
    console.error("Get activities error:", err);
    return NextResponse.json({ error: "Failed to get activities" }, { status: 500 });
  }
}
