import { requireAuth } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildWeeklyRecapPrompt, type CoachPersonality } from "@/lib/ai-coach";
import type { WorkoutScore, AdaptationDecision } from "@/lib/adaptation";
import type { BlockType, WeekType } from "@/lib/periodization";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { scores, adaptation, blockType, weekType, ftp, personality, fitnessMetrics } = body as {
      scores: WorkoutScore[];
      adaptation: AdaptationDecision;
      blockType: BlockType;
      weekType: WeekType;
      ftp: number;
      personality: CoachPersonality;
      fitnessMetrics?: { ctl: number; atl: number; tsb: number };
    };

    const prompt = buildWeeklyRecapPrompt(scores, adaptation, blockType, weekType, ftp, personality, fitnessMetrics);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: `Week complete. ${scores.length} sessions logged. Adaptation: ${adaptation.action}. ${adaptation.reason}`,
        model: "static",
      });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: "You are CycleCoach, an AI cycling coach. Write a weekly training recap that feels like a conversation with a trusted coach.",
      prompt,
      maxOutputTokens: 400,
      temperature: 0.8,
    });

    return NextResponse.json({
      text: result.text,
      model: "claude-sonnet-4-20250514",
      tokensUsed: result.usage?.totalTokens,
    });
  } catch (err) {
    console.error("Weekly recap AI error:", err);
    return NextResponse.json({ text: "Recap unavailable", model: "error" }, { status: 500 });
  }
}
