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

    // Fetch activities from January 1st, 2020 (6 years of data)
    const jan1st2020 = Math.floor(new Date('2020-01-01T00:00:00Z').getTime() / 1000);
    
    // Fetch all activities since Jan 1st 2020, handling pagination
    let allActivities = [];
    let page = 1;
    const perPage = 200; // Max per request
    
    while (true) {
      const activities = await getStravaActivities(plainAccess, {
        after: jan1st2020,
        perPage,
        page
      });
      
      if (activities.length === 0) break;
      allActivities.push(...activities);
      
      // If we got less than perPage, we're done
      if (activities.length < perPage) break;
      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 50) break; // Max ~10,000 activities
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

      await prisma.stravaActivity.create({
        data: {
          stravaId: BigInt(activity.id),
          riderId: rider.id,
          name: activity.name,
          type: activity.type,
          startDate: new Date(activity.start_date),
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
      dateRange: "Since January 1st, 2020",
      message: `Synced ${synced} new rides, skipped ${skipped} existing. Found ${allActivities.length} total activities (6 years of data).`
    });
  } catch (err) {
    console.error("Strava sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
