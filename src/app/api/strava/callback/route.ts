import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/settings?strava=error", request.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID!;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET!;

  try {
    const tokens = await exchangeStravaCode(clientId, clientSecret, code);

    // Get authenticated user's rider, or fall back to first rider
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;

    let rider;
    if (userId) {
      rider = await prisma.rider.findUnique({ where: { userId } });
    }
    if (!rider) {
      rider = await prisma.rider.findFirst();
    }
    if (!rider) {
      rider = await prisma.rider.create({
        data: { name: tokens.athlete?.firstname || "Rider", ftp: 190, userId: userId || undefined },
      });
    }

    // Upsert Strava connection
    await prisma.stravaConnection.upsert({
      where: { riderId: rider.id },
      update: {
        athleteId: tokens.athlete?.id || 0,
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        expiresAt: tokens.expires_at,
        athleteName: tokens.athlete ? `${tokens.athlete.firstname} ${tokens.athlete.lastname}` : null,
        athletePhoto: tokens.athlete?.profile || null,
      },
      create: {
        riderId: rider.id,
        athleteId: tokens.athlete?.id || 0,
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        expiresAt: tokens.expires_at,
        athleteName: tokens.athlete ? `${tokens.athlete.firstname} ${tokens.athlete.lastname}` : null,
        athletePhoto: tokens.athlete?.profile || null,
      },
    });

    return NextResponse.redirect(new URL("/settings?strava=connected", request.url));
  } catch (err) {
    console.error("Strava OAuth error:", err);
    return NextResponse.redirect(new URL("/settings?strava=error", request.url));
  }
}
