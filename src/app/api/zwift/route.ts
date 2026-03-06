import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRider } from "@/lib/get-rider";
import { generatePlan } from "@/lib/periodization";
import { exportToZWO } from "@/lib/export";

// GET: Generate .zwo files for a specific block/week
// Query params: block (0-3), week (0-3)
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const rider = await getCurrentRider();
  const ftp = rider?.ftp || 190;

  const blockIdx = parseInt(request.nextUrl.searchParams.get("block") || "0");
  const weekIdx = parseInt(request.nextUrl.searchParams.get("week") || "0");

  const plan = generatePlan(4);
  const block = plan.blocks[blockIdx];
  if (!block) return NextResponse.json({ error: "Invalid block index" }, { status: 400 });

  const week = block.weeks[weekIdx];
  if (!week) return NextResponse.json({ error: "Invalid week index" }, { status: 400 });

  const indoorSessions = week.sessions.filter((s) => s.sessionType === "INDOOR");

  const workouts = indoorSessions.map((session) => ({
    filename: `CycleCoach_B${blockIdx + 1}W${weekIdx + 1}_${session.dayOfWeek}_${session.title.replace(/[^a-zA-Z0-9]/g, "_")}.zwo`,
    title: session.title,
    day: session.dayOfWeek,
    duration: session.duration,
    intervals: session.intervals.length,
    zwoContent: exportToZWO(session, ftp),
  }));

  return NextResponse.json({
    block: blockIdx,
    week: weekIdx,
    blockType: block.type,
    weekType: week.weekType,
    ftp,
    workouts,
  });
}
