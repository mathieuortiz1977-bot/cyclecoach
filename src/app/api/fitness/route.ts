import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSamplePMC } from "@/lib/fitness";

export async function GET() {
  try {
    const rider = await prisma.rider.findFirst();

    if (!rider) {
      // Return sample data for demo
      return NextResponse.json({
        source: "sample",
        metrics: generateSamplePMC(12),
      });
    }

    // Try to get real metrics from DB
    const metrics = await prisma.fitnessMetric.findMany({
      where: { riderId: rider.id },
      orderBy: { date: "asc" },
      take: 90,
    });

    if (metrics.length > 0) {
      return NextResponse.json({
        source: "real",
        metrics: metrics.map((m) => ({
          date: m.date.toISOString().split("T")[0],
          tss: m.tss || 0,
          ctl: m.ctl,
          atl: m.atl,
          tsb: m.tsb,
        })),
      });
    }

    // No real data yet — generate from Strava activities if available
    const activities = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      orderBy: { startDate: "asc" },
    });

    if (activities.length > 0) {
      // Calculate PMC from Strava TSS
      const { calculatePMC } = await import("@/lib/fitness");
      const dailyTSS: Record<string, number> = {};

      activities.forEach((a) => {
        const date = a.startDate.toISOString().split("T")[0];
        dailyTSS[date] = (dailyTSS[date] || 0) + (a.tss || 0);
      });

      // Fill gaps with zero TSS days
      const dates = Object.keys(dailyTSS).sort();
      if (dates.length > 0) {
        const start = new Date(dates[0]);
        const end = new Date(dates[dates.length - 1]);
        const filled: { date: string; tss: number }[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().split("T")[0];
          filled.push({ date: key, tss: dailyTSS[key] || 0 });
        }

        return NextResponse.json({
          source: "strava",
          metrics: calculatePMC(filled),
        });
      }
    }

    // Fallback to sample
    return NextResponse.json({
      source: "sample",
      metrics: generateSamplePMC(12),
    });
  } catch (err) {
    console.error("Fitness API error:", err);
    return NextResponse.json({
      source: "sample",
      metrics: generateSamplePMC(12),
    });
  }
}
