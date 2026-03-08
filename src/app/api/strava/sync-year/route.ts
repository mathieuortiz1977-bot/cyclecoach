import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getStravaActivities,
  refreshStravaToken,
  isTokenExpired,
  calculateTSS,
  calculateIF,
} from "@/lib/strava";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";
import { encrypt, decrypt, isEncrypted } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { year } = await request.json();
    
    if (!year || year < 2000 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    console.log(`[SYNC-YEAR] Fetching Strava data for year ${year}`);

    const rider = await getCurrentRiderWithStrava();
    console.log("[SYNC-YEAR] Rider loaded:", rider?.id);

    if (!rider?.stravaConnection) {
      console.log("[SYNC-YEAR] No Strava connection found");
      return NextResponse.json({ error: "No Strava connection found" }, { status: 400 });
    }
    console.log("[SYNC-YEAR] Strava connection found");

    const conn = rider.stravaConnection;
    let plainAccess = isEncrypted(conn.accessToken) ? decrypt(conn.accessToken) : conn.accessToken;
    let plainRefresh = isEncrypted(conn.refreshToken) ? decrypt(conn.refreshToken) : conn.refreshToken;
    let { expiresAt } = conn;

    // Refresh token if expired
    console.log("[SYNC-YEAR] Token expired?", isTokenExpired(expiresAt));
    if (isTokenExpired(expiresAt)) {
      console.log("[SYNC-YEAR] Refreshing token...");
      const clientId = process.env.STRAVA_CLIENT_ID!;
      const clientSecret = process.env.STRAVA_CLIENT_SECRET!;
      const tokens = await refreshStravaToken(clientId, clientSecret, plainRefresh);

      plainAccess = tokens.access_token;
      plainRefresh = tokens.refresh_token;
      expiresAt = tokens.expires_at;

      await prisma.stravaConnection.update({
        where: { riderId: rider.id },
        data: {
          accessToken: encrypt(plainAccess),
          refreshToken: encrypt(plainRefresh),
          expiresAt,
        },
      });
      console.log("[SYNC-YEAR] Token refreshed");
    }

    // Fetch activities for the entire year
    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31, 23, 59, 59);
    const afterTimestamp = Math.floor(jan1.getTime() / 1000);
    const beforeTimestamp = Math.floor(dec31.getTime() / 1000);

    console.log(`[SYNC-YEAR] Fetching activities from ${jan1.toISOString()} to ${dec31.toISOString()}`);

    let allActivities = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      console.log(`[SYNC-YEAR] Fetching page ${page}...`);
      const activities = await getStravaActivities(plainAccess, {
        after: afterTimestamp,
        before: beforeTimestamp,
        perPage,
        page
      });

      console.log(`[SYNC-YEAR] Got ${activities.length} activities on page ${page}`);
      if (activities.length === 0) break;
      allActivities.push(...activities);

      if (activities.length < perPage) break;
      page++;

      if (page > 50) break;
    }

    console.log(`[SYNC-YEAR] Total activities fetched: ${allActivities.length}`);

    // Filter to cycling activities
    const rides = allActivities.filter((a) =>
      ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(a.type)
    );

    console.log(`[SYNC-YEAR] Cycling rides found: ${rides.length}`);

    let synced = 0;
    let skipped = 0;

    for (const activity of rides) {
      try {
        const existing = await prisma.stravaActivity.findUnique({
          where: { stravaId: BigInt(activity.id) },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const np = activity.weighted_average_watts || activity.average_watts || 0;
        const tss = np && rider.ftp ? calculateTSS(np, rider.ftp, activity.moving_time) : null;
        const intensityFactor = np && rider.ftp ? calculateIF(np, rider.ftp) : null;

        const localStartDate = activity.start_date_local
          ? new Date(activity.start_date_local)
          : new Date(activity.start_date);

        await prisma.stravaActivity.create({
          data: {
            stravaId: BigInt(activity.id),
            riderId: rider.id,
            name: activity.name,
            type: activity.type,
            startDate: localStartDate,
            movingTime: activity.moving_time,
            elapsedTime: activity.elapsed_time,
            distance: activity.distance,
            totalElevation: activity.total_elevation_gain,
            averageWatts: activity.average_watts || null,
            maxWatts: activity.max_watts || null,
            weightedAvgWatts: activity.weighted_average_watts || null,
            averageHeartrate: activity.average_heartrate || null,
            maxHeartrate: activity.max_heartrate || null,
            averageCadence: activity.average_cadence || null,
            kilojoules: activity.kilojoules || null,
            sufferScore: activity.suffer_score || null,
            calories: activity.calories || null,
            averageSpeed: activity.average_speed || null,
            maxSpeed: activity.max_speed || null,
            hasHeartrate: activity.has_heartrate,
            hasPower: activity.device_watts,
            mapPolyline: activity.map?.summary_polyline || null,
            tss: tss ? Math.round(tss) : null,
            intensityFactor: intensityFactor ? Math.round(intensityFactor * 100) / 100 : null,
          },
        });
        synced++;
      } catch (actErr) {
        console.error(`[SYNC-YEAR] Error syncing activity ${activity.id}:`, actErr);
        throw actErr;
      }
    }

    console.log(`[SYNC-YEAR] Complete: synced=${synced}, skipped=${skipped}`);

    return NextResponse.json({
      success: true,
      year,
      synced,
      skipped,
      total: rides.length,
      message: `Synced ${synced} new rides from ${year}, skipped ${skipped} existing.`
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[SYNC-YEAR] ERROR:", errorMsg);
    console.error("[SYNC-YEAR] STACK:", errorStack);
    return NextResponse.json({
      error: "Sync failed",
      message: errorMsg
    }, { status: 500 });
  }
}
