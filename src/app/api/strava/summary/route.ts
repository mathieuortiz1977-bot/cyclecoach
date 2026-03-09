import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET() {
  try {
    console.log("[GET /api/strava/summary] START");
    
    const rider = await getCurrentRiderWithStrava();

    if (!rider) {
      console.error("[GET /api/strava/summary] Not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("[GET /api/strava/summary] Rider:", rider.id);

    // Count total activities
    const totalCount = await prisma.stravaActivity.count({
      where: { riderId: rider.id },
    });
    
    console.log(`[GET /api/strava/summary] Total activities: ${totalCount}`);

    // Get earliest and latest dates
    const dateRange = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: { startDate: true },
      orderBy: { startDate: "asc" },
      take: 1, // Just get the first one for earliest
    });

    const latestDateRange = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: { startDate: true },
      orderBy: { startDate: "desc" },
      take: 1, // Just get the first one for latest
    });

    const earliestDate = dateRange.length > 0 ? dateRange[0].startDate : null;
    const latestDate = latestDateRange.length > 0 ? latestDateRange[0].startDate : null;

    console.log("[GET /api/strava/summary] Date range:", { earliestDate, latestDate });

    // Format earliest date for display
    let dateSince = "";
    if (earliestDate) {
      const d = new Date(earliestDate);
      dateSince = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    return NextResponse.json({
      success: true,
      total: totalCount,
      earliestDate,
      latestDate,
      dateSince,
      summary: totalCount > 0 
        ? `Since ${dateSince}... ${totalCount} ${totalCount === 1 ? 'ride' : 'rides'} in the DB`
        : "No rides imported yet"
    });
  } catch (err) {
    console.error("[GET /api/strava/summary] ERROR:", err);
    return NextResponse.json({ error: "Failed to get summary", details: String(err) }, { status: 500 });
  }
}
