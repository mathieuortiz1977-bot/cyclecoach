import { NextRequest, NextResponse } from "next/server";
import { scoreWorkout, type CompletedWorkout } from "@/lib/adaptation";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body: CompletedWorkout = await request.json();
    const score = scoreWorkout(body);
    return NextResponse.json(score);
  } catch (err) {
    console.error("Score error:", err);
    return NextResponse.json({ error: "Failed to score workout" }, { status: 400 });
  }
}
