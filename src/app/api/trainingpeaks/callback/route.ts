import { NextRequest, NextResponse } from "next/server";
import { exchangeTPCode, getTPAthlete } from "@/lib/trainingpeaks";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/settings?tp=error", request.url));
  }

  const clientId = process.env.TP_CLIENT_ID!;
  const clientSecret = process.env.TP_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/trainingpeaks/callback`;

  try {
    const tokens = await exchangeTPCode(clientId, clientSecret, code, redirectUri);

    // Get or create default rider
    let rider = await prisma.rider.findFirst();
    if (!rider) {
      rider = await prisma.rider.create({
        data: { name: "Rider", ftp: 190 },
      });
    }

    // Get athlete info
    let athleteId: number | null = null;
    try {
      const athlete = await getTPAthlete(tokens.access_token);
      athleteId = athlete.Id;

      // Update rider FTP/weight from TP if available
      if (athlete.ThresholdPower) {
        await prisma.rider.update({
          where: { id: rider.id },
          data: {
            ftp: Math.round(athlete.ThresholdPower),
            ...(athlete.Weight ? { weight: athlete.Weight } : {}),
            ...(athlete.ThresholdHeartRate ? { lthr: Math.round(athlete.ThresholdHeartRate) } : {}),
          },
        });
      }
    } catch (e) {
      console.warn("Could not fetch TP athlete profile:", e);
    }

    const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

    await prisma.trainingPeaksConnection.upsert({
      where: { riderId: rider.id },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        athleteId,
      },
      create: {
        riderId: rider.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        athleteId,
      },
    });

    return NextResponse.redirect(new URL("/settings?tp=connected", request.url));
  } catch (err) {
    console.error("TP OAuth error:", err);
    return NextResponse.redirect(new URL("/settings?tp=error", request.url));
  }
}
