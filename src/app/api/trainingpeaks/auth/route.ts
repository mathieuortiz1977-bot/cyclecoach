import { NextResponse } from "next/server";
import { getTPAuthUrl } from "@/lib/trainingpeaks";

export async function GET() {
  const clientId = process.env.TP_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "TP_CLIENT_ID not configured" }, { status: 500 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/trainingpeaks/callback`;
  const authUrl = getTPAuthUrl(clientId, redirectUri);

  return NextResponse.redirect(authUrl);
}
