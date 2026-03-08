// Strava API Integration
// Docs: https://developers.strava.com/docs/reference/

const STRAVA_API = "https://www.strava.com/api/v3";
const STRAVA_AUTH = "https://www.strava.com/oauth";

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  profile_medium: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  moving_time: number;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  kilojoules?: number;
  suffer_score?: number;
  calories?: number;
  average_speed?: number;
  max_speed?: number;
  has_heartrate: boolean;
  device_watts: boolean;
  map?: {
    summary_polyline: string;
  };
}

export interface StravaDetailedActivity extends StravaActivity {
  laps?: StravaLap[];
  splits_metric?: StravaSplit[];
  best_efforts?: StravaBestEffort[];
  segment_efforts?: StravaSegmentEffort[];
}

export interface StravaLap {
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_heartrate?: number;
  average_watts?: number;
  pace_zone: number;
}

export interface StravaBestEffort {
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
}

export interface StravaSegmentEffort {
  id: number;
  name: string;
  segment: {
    id: number;
    name: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
  };
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_watts?: number;
  max_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  pr_rank?: number; // Rank among local leaderboard (1 = PR)
  achievements?: any[];
}

// ─── OAuth ───────────────────────────────────────────────────────────

export function getStravaAuthUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all,profile:read_all",
    ...(state ? { state } : {}),
  });
  return `${STRAVA_AUTH}/authorize?${params}`;
}

export async function exchangeStravaCode(
  clientId: string,
  clientSecret: string,
  code: string
): Promise<StravaTokens> {
  const res = await fetch(`${STRAVA_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  return res.json();
}

export async function refreshStravaToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<StravaTokens> {
  const res = await fetch(`${STRAVA_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  return res.json();
}

// ─── API Calls ───────────────────────────────────────────────────────

async function stravaGet<T>(accessToken: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${STRAVA_API}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava API error ${res.status}: ${path}`);
  return res.json();
}

export async function getStravaAthlete(accessToken: string): Promise<StravaAthlete> {
  return stravaGet<StravaAthlete>(accessToken, "/athlete");
}

export async function getStravaActivities(
  accessToken: string,
  opts: { after?: number; before?: number; page?: number; perPage?: number } = {}
): Promise<StravaActivity[]> {
  const params: Record<string, string> = {};
  if (opts.after) params.after = String(opts.after);
  if (opts.before) params.before = String(opts.before);
  if (opts.page) params.page = String(opts.page);
  params.per_page = String(opts.perPage || 50);
  return stravaGet<StravaActivity[]>(accessToken, "/athlete/activities", params);
}

export async function getStravaActivity(accessToken: string, activityId: number): Promise<StravaDetailedActivity> {
  return stravaGet<StravaDetailedActivity>(accessToken, `/activities/${activityId}`);
}

export async function getStravaActivityZones(accessToken: string, activityId: number) {
  return stravaGet(accessToken, `/activities/${activityId}/zones`);
}

// ─── TSS Calculation ─────────────────────────────────────────────────

export function calculateTSS(normalizedPower: number, ftp: number, durationSeconds: number): number {
  if (!normalizedPower || !ftp || !durationSeconds) return 0;
  const intensityFactor = normalizedPower / ftp;
  return (durationSeconds * normalizedPower * intensityFactor) / (ftp * 3600) * 100;
}

export function calculateIF(normalizedPower: number, ftp: number): number {
  if (!normalizedPower || !ftp) return 0;
  return normalizedPower / ftp;
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() / 1000 >= expiresAt - 60; // 60s buffer
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function metersToKm(meters: number): number {
  return Math.round(meters / 10) / 100;
}

export function mpsToKph(mps: number): number {
  return Math.round(mps * 3.6 * 10) / 10;
}
