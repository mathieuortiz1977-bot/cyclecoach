import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET() {
  try {
    const rider = await getCurrentRiderWithStrava();

    if (!rider) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all Strava activities for this rider
    const activities = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: {
        id: true,
        stravaId: true,
        name: true,
        startDate: true,
        distance: true,
        type: true,
        movingTime: true,
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
