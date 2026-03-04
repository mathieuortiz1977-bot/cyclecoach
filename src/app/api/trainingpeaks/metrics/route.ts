import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTPMetrics, refreshTPToken, formatTPDate } from "@/lib/trainingpeaks";

export async function GET() {
  try {
    const rider = await prisma.rider.findFirst({
      include: { trainingPeaksConnection: true },
    });

    if (!rider?.trainingPeaksConnection) {
      return NextResponse.json({ error: "No TrainingPeaks connection" }, { status: 400 });
    }

    let { accessToken, refreshToken, expiresAt } = rider.trainingPeaksConnection;

    // Refresh if needed
    if (Date.now() / 1000 >= expiresAt - 60) {
      const clientId = process.env.TP_CLIENT_ID!;
      const clientSecret = process.env.TP_CLIENT_SECRET!;
      const tokens = await refreshTPToken(clientId, clientSecret, refreshToken);
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token;
      expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

      await prisma.trainingPeaksConnection.update({
        where: { riderId: rider.id },
        data: { accessToken, refreshToken, expiresAt },
      });
    }

    // Fetch last 90 days of metrics
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const metrics = await getTPMetrics(
      accessToken,
      formatTPDate(startDate),
      formatTPDate(endDate)
    );

    // Store in DB
    for (const m of metrics) {
      await prisma.fitnessMetric.upsert({
        where: {
          riderId_date: {
            riderId: rider.id,
            date: new Date(m.MetricsDate),
          },
        },
        update: {
          ctl: m.CTL,
          atl: m.ATL,
          tsb: m.TSB,
          tss: m.TSS,
          source: "trainingpeaks",
        },
        create: {
          riderId: rider.id,
          date: new Date(m.MetricsDate),
          ctl: m.CTL,
          atl: m.ATL,
          tsb: m.TSB,
          tss: m.TSS,
          source: "trainingpeaks",
        },
      });
    }

    return NextResponse.json({
      success: true,
      metricsCount: metrics.length,
      latest: metrics.length > 0 ? {
        date: metrics[metrics.length - 1].MetricsDate,
        ctl: metrics[metrics.length - 1].CTL,
        atl: metrics[metrics.length - 1].ATL,
        tsb: metrics[metrics.length - 1].TSB,
      } : null,
    });
  } catch (err) {
    console.error("TP metrics error:", err);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
