import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { estimateFTPFromRides } from "@/lib/adaptation";
import { getCurrentRider } from "@/lib/get-rider";

// GET: Estimate FTP from recent Strava rides
export async function GET() {
  try {
    const rider = await getCurrentRider();
    if (!rider) {
      return NextResponse.json({ error: "No rider profile" }, { status: 400 });
    }

    // Get recent rides with power data
    const recentRides = await prisma.stravaActivity.findMany({
      where: {
        riderId: rider.id,
        hasPower: true,
        startDate: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
      },
      orderBy: { startDate: "desc" },
      take: 10,
    });

    if (recentRides.length === 0) {
      return NextResponse.json({
        estimate: null,
        message: "No recent rides with power data. Connect Strava and sync your rides.",
      });
    }

    const estimate = estimateFTPFromRides(
      recentRides.map((r) => ({
        normalizedPower: r.weightedAvgWatts || undefined,
        avgPower: r.averageWatts || undefined,
        duration: r.movingTime,
      })),
      rider.ftp
    );

    return NextResponse.json({
      currentFtp: rider.ftp,
      estimate,
      ridesAnalyzed: recentRides.length,
    });
  } catch (err) {
    console.error("FTP estimate error:", err);
    return NextResponse.json({ error: "Failed to estimate FTP" }, { status: 500 });
  }
}
