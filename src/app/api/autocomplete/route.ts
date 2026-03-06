import { NextResponse } from "next/server";
import { matchActivitiesToSessions, type ExternalActivity } from "@/lib/autocomplete";
import { generatePlan } from "@/lib/periodization";
import { DAY_FROM_INDEX } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { activities, blockIdx = 0, weekIdx = 0, ftp = 190 } = await req.json() as {
      activities?: ExternalActivity[];
      blockIdx?: number;
      weekIdx?: number;
      ftp?: number;
    };

    // If no activities provided, try to fetch from Strava
    let externalActivities: ExternalActivity[] = activities || [];

    if (!externalActivities.length) {
      // TODO: Fetch from Strava API using stored tokens
      // const rider = await prisma.rider.findFirst({ where: { userId: session.user.id } });
      // externalActivities = await fetchStravaActivities(rider.stravaAccessToken);

      // For now, return empty if no activities provided
      return NextResponse.json({
        matches: [],
        message: "No activities provided. Connect Strava to auto-detect rides.",
      });
    }

    // Ensure dayOfWeek is set
    externalActivities = externalActivities.map((a) => ({
      ...a,
      dayOfWeek: a.dayOfWeek || DAY_FROM_INDEX[new Date(a.date).getDay()],
    }));

    // Get planned sessions for the week
    const plan = generatePlan(4);
    const block = plan.blocks[blockIdx];
    const week = block?.weeks[weekIdx];

    if (!week) {
      return NextResponse.json({ error: "Invalid block/week index" }, { status: 400 });
    }

    // Match activities to sessions
    const matches = matchActivitiesToSessions(externalActivities, week.sessions, ftp);

    return NextResponse.json({
      matches: matches.map((m) => ({
        sessionTitle: m.session.title,
        sessionDay: m.session.dayOfWeek,
        sessionIndex: m.sessionIndex,
        activityName: m.activity.name,
        activitySource: m.activity.source,
        confidence: m.confidence,
        matchReason: m.matchReason,
        autoData: m.autoData,
      })),
      unmatched: externalActivities
        .filter((a) => !matches.some((m) => m.activity.externalId === a.externalId))
        .map((a) => ({ name: a.name, date: a.date, source: a.source })),
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ error: "Failed to match activities" }, { status: 500 });
  }
}
