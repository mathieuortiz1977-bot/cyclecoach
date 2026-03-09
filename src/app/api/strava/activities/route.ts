import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET(request: NextRequest) {
  try {
    console.log("[GET /api/strava/activities] START");
    
    // Check for query param: ?years=5 to load 5 years instead of default 2
    const searchParams = request.nextUrl.searchParams;
    const yearsParam = searchParams.get("years");
    const years = yearsParam ? parseInt(yearsParam, 10) : 2;
    
    console.log(`[GET /api/strava/activities] Loading activities for last ${years} years`);
    
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

    // Get Strava activities for this rider - paginated to prevent timeouts
    // Default: last 2 years (most relevant for current training)
    // Can be overridden with ?years=5 etc
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    
    console.log(`[GET /api/strava/activities] Fetching activities since ${cutoffDate.toISOString()}`);

    console.log(`[GET /api/strava/activities] Running query for rider ${rider.id}, cutoff: ${cutoffDate.toISOString()}`);
    
    try {
      const activities = await prisma.stravaActivity.findMany({
        where: { 
          riderId: rider.id,
          startDate: { gte: cutoffDate } // Only last N years (default 2)
        },
        select: {
          id: true,
          stravaId: true,
          name: true,
          type: true,
          startDate: true,
          movingTime: true,
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
        take: 500, // Max 500 rides (last 2 years usually ~250-300)
      });

      console.log(`[GET /api/strava/activities] Query successful, fetched ${activities.length} activities`);
      
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
    } catch (queryErr) {
      console.error("[GET /api/strava/activities] QUERY ERROR:", queryErr);
      throw queryErr;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[GET /api/strava/activities] CATCH ERROR:", errorMsg);
    console.error("[GET /api/strava/activities] STACK:", errorStack);
    console.error("[GET /api/strava/activities] FULL ERROR:", err);
    
    return NextResponse.json({ 
      error: "Failed to get activities", 
      details: errorMsg,
      success: false
    }, { status: 500 });
  }
}
