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
    const rider = await getCurrentRiderWithStrava();

    if (!rider?.stravaConnection) {
      return NextResponse.json({ error: "No Strava connection found" }, { status: 400 });
    }

    const conn = rider.stravaConnection;
    let plainAccess = isEncrypted(conn.accessToken) ? decrypt(conn.accessToken) : conn.accessToken;
    let plainRefresh = isEncrypted(conn.refreshToken) ? decrypt(conn.refreshToken) : conn.refreshToken;
    let { expiresAt } = conn;

    // Refresh token if expired
    if (isTokenExpired(expiresAt)) {
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
    }

    // Determine sync start time
    // Find the most recent activity we already have
    const latestActivity = await prisma.stravaActivity.findFirst({
      where: { riderId: rider.id },
      orderBy: { startDate: "desc" },
      select: { startDate: true },
    });

    let afterTimestamp: number;
    
    if (latestActivity?.startDate) {
      // Existing activities: go back 1 hour from latest to catch modifications
      const syncStartDate = new Date(latestActivity.startDate);
      syncStartDate.setHours(syncStartDate.getHours() - 1);
      afterTimestamp = Math.floor(syncStartDate.getTime() / 1000);
    } else {
      // First sync or after deletion: fetch from Jan 1st, 2020
      const jan1st2020 = new Date('2020-01-01T00:00:00Z');
      afterTimestamp = Math.floor(jan1st2020.getTime() / 1000);
    }
    
    // Fetch all NEW activities since last sync, handling pagination
    let allActivities = [];
    let page = 1;
    const perPage = 200; // Max per request
    
    try {
      while (true) {
        const activities = await getStravaActivities(plainAccess, {
          after: afterTimestamp,
          perPage,
          page
        });
        
        if (!Array.isArray(activities)) {
          console.error("Strava API returned non-array:", activities);
          throw new Error("Strava API returned invalid data");
        }
        
        if (activities.length === 0) break;
        allActivities.push(...activities);
        
        // If we got less than perPage, we're done
        if (activities.length < perPage) break;
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 50) break; // Max ~10,000 activities
      }
    } catch (stravErr) {
      console.error("Error fetching from Strava API:", stravErr);
      throw new Error(`Strava API error: ${stravErr instanceof Error ? stravErr.message : "Unknown"}`);
    }

    // Filter to cycling activities
    const rides = allActivities.filter((a) =>
      ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(a.type)
    );

    let synced = 0;
    let skipped = 0;

    for (const activity of rides) {
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
    }

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      total: rides.length,
      totalActivities: allActivities.length,
      message: `Synced ${synced} new rides, skipped ${skipped} existing. Only fetched rides newer than your last sync.`
    });
  } catch (err) {
    console.error("Strava sync error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("Error details:", errorMessage, errorStack);
    return NextResponse.json({ 
      error: "Sync failed",
      details: errorMessage 
    }, { status: 500 });
  }
}
