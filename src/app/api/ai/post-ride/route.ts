import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildPostRidePrompt, type CoachPersonality } from "@/lib/ai-coach";
import type { WorkoutScore } from "@/lib/adaptation";
import type { SessionDef } from "@/lib/periodization";
import type { WeekType } from "@/lib/periodization";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, session, ftp, personality, weekContext } = body as {
      score: WorkoutScore;
      session: SessionDef;
      ftp: number;
      personality: CoachPersonality;
      weekContext?: { weekType: WeekType; sessionsCompleted: number; totalSessions: number };
    };

    const prompt = buildPostRidePrompt(score, session, ftp, personality, weekContext);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback to static feedback from score
      return NextResponse.json({
        text: score.coachFeedback,
        model: "static",
      });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: "You are CycleCoach, an AI cycling coach. Write a post-ride analysis.",
      prompt,
      maxOutputTokens: 250,
      temperature: 0.7,
    });

    return NextResponse.json({
      text: result.text,
      model: "claude-sonnet-4-20250514",
      tokensUsed: result.usage?.totalTokens,
    });
  } catch (err) {
    console.error("Post-ride AI error:", err);
    return NextResponse.json({ text: "Analysis unavailable", model: "error" }, { status: 500 });
  }
}
