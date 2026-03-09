import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET(request: NextRequest) {
  try {
    console.log("[GET /api/strava/activities] START");
    
    // Check for query param: ?weeks=20 to load 20 weeks (default) or more
    const searchParams = request.nextUrl.searchParams;
    const weeksParam = searchParams.get("weeks");
    const weeks = weeksParam ? parseInt(weeksParam, 10) : 20; // Default: 20 weeks (~5 months)
    
    console.log(`[GET /api/strava/activities] Loading activities for last ${weeks} weeks`);
    
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

    // Get Strava activities for this rider - smart pagination
    // Default: last 20 weeks (~140 rides, fast response)
    // Can be overridden with ?weeks=100 for full history
    // NOTE: Always include full current and previous months to avoid missing rides
    const cutoffDate = new Date();
    const weeksToSubtract = Math.max(weeks, 12); // Always go back at least 12 weeks (3 months)
    cutoffDate.setDate(cutoffDate.getDate() - (weeksToSubtract * 7)); // Convert weeks to days
    
    console.log(`[GET /api/strava/activities] Fetching activities since ${cutoffDate.toISOString()} (${weeks} weeks requested, ${weeksToSubtract} weeks actual)`);

    console.log(`[GET /api/strava/activities] Running query for rider ${rider.id}, cutoff: ${cutoffDate.toISOString()}`);
    
    try {
      const rawActivities = await prisma.stravaActivity.findMany({
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

      // Convert BigInt stravaId to string for JSON serialization
      const activities = rawActivities.map(a => ({
        ...a,
        stravaId: a.stravaId.toString() // Convert BigInt to string
      }));

      console.log(`[GET /api/strava/activities] Query successful, fetched ${activities.length} activities`);
      
      if (activities.length > 0) {
        console.log("[GET /api/strava/activities] First activity:", {
          id: activities[0].id,
          name: activities[0].name,
          date: activities[0].startDate
        });
      } else {
        console.log("[GET /api/strava/activities] WARNING: No activities found!");
        console.log("[GET /api/strava/activities] Rider ID:", rider.id);
        console.log("[GET /api/strava/activities] Cutoff date:", cutoffDate.toISOString());
        
        // Debug: count ALL activities for this rider (no date filter)
        const totalCount = await prisma.stravaActivity.count({
          where: { riderId: rider.id }
        });
        console.log("[GET /api/strava/activities] Total activities in DB for this rider:", totalCount);
      }

      console.log("[GET /api/strava/activities] RETURNING:", {
        success: true,
        activities: activities.length,
        total: activities.length
      });

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
