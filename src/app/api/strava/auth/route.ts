import { NextResponse } from "next/server";
import { getStravaAuthUrl } from "@/lib/strava";

export async function GET(request: Request) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID not configured" }, { status: 500 });
  }

  // Determine the base URL from the request or environment
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl) {
    // Fall back to constructing from request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    baseUrl = `${protocol}://${host}`;
  }

  const redirectUri = `${baseUrl}/api/strava/callback`;
  const authUrl = getStravaAuthUrl(clientId, redirectUri);

  return NextResponse.redirect(authUrl);
}
