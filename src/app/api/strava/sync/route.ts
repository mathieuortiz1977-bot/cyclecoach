import { NextResponse } from "next/server";
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

export async function POST() {
  try {
    console.log("[SYNC] Starting Strava sync...");
    const rider = await getCurrentRiderWithStrava();
    console.log("[SYNC] Rider loaded:", rider?.id);

    if (!rider?.stravaConnection) {
      console.log("[SYNC] No Strava connection found");
      return NextResponse.json({ error: "No Strava connection found" }, { status: 400 });
    }
    console.log("[SYNC] Strava connection found");

    const conn = rider.stravaConnection;
    let plainAccess = isEncrypted(conn.accessToken) ? decrypt(conn.accessToken) : conn.accessToken;
    let plainRefresh = isEncrypted(conn.refreshToken) ? decrypt(conn.refreshToken) : conn.refreshToken;
    let { expiresAt } = conn;

    // Refresh token if expired
    console.log("[SYNC] Token expired?", isTokenExpired(expiresAt));
    if (isTokenExpired(expiresAt)) {
      console.log("[SYNC] Refreshing token...");
      const clientId = process.env.STRAVA_CLIENT_ID!;
      const clientSecret = process.env.STRAVA_CLIENT_SECRET!;
      const tokens = await refreshStravaToken(clientId, clientSecret, plainRefresh);

      plainAccess = tokens.access_token;
      plainRefresh = tokens.refresh_token;
      expiresAt = tokens.expires_at;

      // Store encrypted
      await prisma.stravaConnection.update({
        where: { riderId: rider.id },
        data: {
          accessToken: encrypt(plainAccess),
          refreshToken: encrypt(plainRefresh),
          expiresAt,
        },
      });
      console.log("[SYNC] Token refreshed");
    }

    // Smart sync: only fetch new/modified activities
    // Find the most recent activity we have
    const latestActivity = await prisma.stravaActivity.findFirst({
      where: { riderId: rider.id },
      orderBy: { startDate: "desc" },
      select: { startDate: true },
    });

    let afterTimestamp: number;
    
    if (latestActivity?.startDate) {
      // Incremental sync: go back 2 hours from latest to catch edits
      console.log("[SYNC] Latest activity found, doing incremental sync");
      const syncDate = new Date(latestActivity.startDate);
      syncDate.setHours(syncDate.getHours() - 2);
      afterTimestamp = Math.floor(syncDate.getTime() / 1000);
      console.log("[SYNC] Fetching activities since:", syncDate.toISOString());
    } else {
      // First sync: get last 7 days only (safe from rate limit)
      // User can fetch full history using year buttons in Settings
      console.log("[SYNC] No previous activities found - initial sync, getting last 7 days");
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      afterTimestamp = Math.floor(sevenDaysAgo.getTime() / 1000);
      console.log("[SYNC] Fetching activities since:", sevenDaysAgo.toISOString());
    }
    
    let allActivities = [];
    let page = 1;
    const perPage = 200; // Max per request
    
    while (true) {
      console.log(`[SYNC] Fetching page ${page}...`);
      const activities = await getStravaActivities(plainAccess, {
        after: afterTimestamp,
        perPage,
        page
      });
      
      console.log(`[SYNC] Got ${activities.length} activities on page ${page}`);
      if (activities.length === 0) break;
      allActivities.push(...activities);
      
      // If we got less than perPage, we're done
      if (activities.length < perPage) break;
      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 50) break; // Max ~10,000 activities
    }
    
    console.log(`[SYNC] Total activities fetched: ${allActivities.length}`);

    // Filter to cycling activities
    const rides = allActivities.filter((a) =>
      ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(a.type)
    );

    console.log(`[SYNC] Cycling rides found: ${rides.length}`);

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

        // Use start_date_local instead of start_date to get the correct local time
        // start_date is UTC, start_date_local is already in athlete's timezone
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
        console.error(`[SYNC] Error syncing activity ${activity.id}:`, actErr);
        throw actErr;
      }
    }
    
    console.log(`[SYNC] Complete: synced=${synced}, skipped=${skipped}`);

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      total: rides.length,
      totalActivities: allActivities.length,
      dateRange: "Since January 1st, 2020",
      message: `Synced ${synced} new rides, skipped ${skipped} existing. Found ${allActivities.length} total activities (6 years of data).`
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[SYNC] ERROR:", errorMsg);
    console.error("[SYNC] STACK:", errorStack);
    return NextResponse.json({ 
      error: "Sync failed",
      message: errorMsg 
    }, { status: 500 });
  }
}
