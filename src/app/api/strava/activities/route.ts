import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

// GET: Fetch Strava activities for calendar display
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const rider = await getCurrentRiderWithStrava();
    if (!rider?.stravaConnection) {
      return NextResponse.json({ activities: [] });
    }

    // Get activities from database (already synced via /api/strava/sync)
    const activities = rider.stravaActivities.map(activity => ({
      id: activity.stravaId.toString(),
      name: activity.name,
      date: activity.startDate.toISOString(),
      type: activity.type,
      duration: activity.movingTime,
      distance: activity.distance / 1000, // Convert to km
      elevation: activity.totalElevation,
      avgPower: activity.averageWatts,
      normalizedPower: activity.weightedAvgWatts,
      avgHr: activity.averageHeartrate,
      maxHr: activity.maxHeartrate,
      kilojoules: activity.kilojoules,
      tss: activity.tss,
      mapPolyline: activity.mapPolyline,
      averageSpeed: activity.averageSpeed ? activity.averageSpeed * 3.6 : null, // Convert m/s to km/h
    }));

    return NextResponse.json({ activities });
  } catch (err) {
    console.error("Failed to fetch Strava activities:", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}