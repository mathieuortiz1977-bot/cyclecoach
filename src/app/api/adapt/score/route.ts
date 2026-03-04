import { NextRequest, NextResponse } from "next/server";
import { scoreWorkout, type CompletedWorkout } from "@/lib/adaptation";

// POST: Score a completed workout against its plan
export async function POST(request: NextRequest) {
  try {
    const body: CompletedWorkout = await request.json();
    const score = scoreWorkout(body);
    return NextResponse.json(score);
  } catch (err) {
    console.error("Score error:", err);
    return NextResponse.json({ error: "Failed to score workout" }, { status: 400 });
  }
}
