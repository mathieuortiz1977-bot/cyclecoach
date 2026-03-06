import { NextRequest, NextResponse } from "next/server";
import { generateAdaptation, type WorkoutScore } from "@/lib/adaptation";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { scores, currentFtp, weekType } = body as {
      scores: WorkoutScore[];
      currentFtp: number;
      weekType: string;
    };

    const decision = generateAdaptation(scores, currentFtp, weekType);
    return NextResponse.json(decision);
  } catch (err) {
    console.error("Adaptation error:", err);
    return NextResponse.json({ error: "Failed to generate adaptation" }, { status: 400 });
  }
}
