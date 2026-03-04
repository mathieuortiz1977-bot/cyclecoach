import { NextRequest, NextResponse } from "next/server";

// Strava Webhook — receives push notifications when activities are created/updated
// Setup: https://developers.strava.com/docs/webhooks/

// GET = webhook validation (Strava sends this during subscription setup)
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || "cyclecoach_verify";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Strava webhook subscription validated");
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST = webhook event (new activity, update, delete)
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log("Strava webhook event:", JSON.stringify(event));

    // Event types: create, update, delete
    // Object types: activity, athlete
    if (event.object_type === "activity") {
      if (event.aspect_type === "create" || event.aspect_type === "update") {
        // Trigger a sync for this athlete
        // In production, you'd queue this job
        console.log(`Activity ${event.aspect_type}: ${event.object_id} by athlete ${event.owner_id}`);

        // For now, we'll let the periodic sync handle it
        // TODO: Implement real-time single-activity sync
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
