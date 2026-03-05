import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePMC, generateSamplePMC } from "@/lib/fitness";
import { getCurrentRider } from "@/lib/get-rider";

export async function GET() {
  try {
    const rider = await getCurrentRider();
    if (!rider) {
      // Return sample data for demo/unauthenticated
      return NextResponse.json({
        metrics: generateSamplePMC(),
        source: "sample",
      });
    }

    // Get fitness metrics from DB
    const metrics = await prisma.fitnessMetric.findMany({
      where: { riderId: rider.id },
      orderBy: { date: "asc" },
      take: 90, // last 90 days
    });

    if (metrics.length === 0) {
      // Try to calculate from Strava activities
      const activities = await prisma.stravaActivity.findMany({
        where: { riderId: rider.id, tss: { not: null } },
        orderBy: { startDate: "asc" },
      });

      if (activities.length > 0) {
        const dailyTSS = activities.map((a) => ({
          date: a.startDate.toISOString().split("T")[0],
          tss: a.tss || 0,
        }));

        const pmc = calculatePMC(dailyTSS);
        return NextResponse.json({ metrics: pmc, source: "calculated" });
      }

      return NextResponse.json({
        metrics: generateSamplePMC(),
        source: "sample",
      });
    }

    return NextResponse.json({
      metrics: metrics.map((m) => ({
        date: m.date,
        tss: m.tss,
        ctl: m.ctl,
        atl: m.atl,
        tsb: m.tsb,
      })),
      source: "stored",
    });
  } catch (err) {
    console.error("Fitness metrics error:", err);
    return NextResponse.json({ error: "Failed to load fitness data" }, { status: 500 });
  }
}
