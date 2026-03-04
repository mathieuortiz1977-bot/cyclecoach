// TrainingPeaks API Integration
// Docs: https://developers.trainingpeaks.com/

const TP_API = "https://api.trainingpeaks.com/v1";
const TP_AUTH = "https://oauth.trainingpeaks.com/oauth";

export interface TPTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TPAthlete {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  DateOfBirth: string;
  Weight: number; // kg
  ThresholdPower: number; // FTP
  ThresholdHeartRate: number; // LTHR
}

export interface TPWorkout {
  WorkoutId: number;
  WorkoutDay: string;
  Title: string;
  WorkoutType: string;
  Description: string;
  TotalTime: number; // seconds
  TotalTimePlanned: number;
  TSSActual: number;
  TSSPlanned: number;
  IF: number;
  NormalizedPower: number;
  AverageHeartRate: number;
  MaxHeartRate: number;
  Completed: boolean;
}

export interface TPMetrics {
  AthleteId: number;
  MetricsDate: string;
  CTL: number;  // Chronic Training Load (fitness)
  ATL: number;  // Acute Training Load (fatigue)
  TSB: number;  // Training Stress Balance (form)
  TSS: number;  // Daily TSS
}

// ─── OAuth ───────────────────────────────────────────────────────────

export function getTPAuthUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "athlete:profile workouts:read workouts:write metrics:read",
    ...(state ? { state } : {}),
  });
  return `${TP_AUTH}/authorize?${params}`;
}

export async function exchangeTPCode(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<TPTokens> {
  const res = await fetch(`${TP_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`TP token exchange failed: ${res.status}`);
  return res.json();
}

export async function refreshTPToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<TPTokens> {
  const res = await fetch(`${TP_AUTH}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`TP token refresh failed: ${res.status}`);
  return res.json();
}

// ─── API Calls ───────────────────────────────────────────────────────

async function tpGet<T>(accessToken: string, path: string): Promise<T> {
  const res = await fetch(`${TP_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`TP API error ${res.status}: ${path}`);
  return res.json();
}

export async function getTPAthlete(accessToken: string): Promise<TPAthlete> {
  return tpGet<TPAthlete>(accessToken, "/athlete/profile");
}

export async function getTPWorkouts(
  accessToken: string,
  startDate: string, // YYYY-MM-DD
  endDate: string
): Promise<TPWorkout[]> {
  return tpGet<TPWorkout[]>(accessToken, `/workouts/${startDate}/${endDate}`);
}

export async function getTPMetrics(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<TPMetrics[]> {
  return tpGet<TPMetrics[]>(accessToken, `/athlete/metrics/${startDate}/${endDate}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function formatTPDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
