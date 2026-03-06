import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { requireAuth } from "@/lib/api-auth";

const SYSTEM_PROMPT = `You are CycleCoach, an AI cycling training coach built into a training app. 

Your job is to provide personalized, context-aware coaching commentary for individual intervals, post-ride debriefs, and weekly recaps.

Key traits:
- You understand cycling physiology deeply (power zones, periodization, adaptation, fatigue)
- You have a strong personality — never generic or corporate
- You care about the rider but you're not a pushover
- You reference real cycling culture (races, riders, equipment, terrain)
- You keep it concise — every word earns its place
- You know Medellín's cycling routes and the unique challenges of training at altitude

Never start with "Great question!" or similar filler. Just coach.`;

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { prompt, maxOutputTokens = 200 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: "AI Coach not configured. Add ANTHROPIC_API_KEY to .env to enable dynamic commentary.",
        model: "fallback",
      });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens,
      temperature: 0.8, // More creative for coaching notes
    });

    return NextResponse.json({
      text: result.text,
      model: "claude-sonnet-4-20250514",
      tokensUsed: result.usage?.totalTokens,
    });
  } catch (err) {
    console.error("AI Coach error:", err);
    return NextResponse.json({
      text: "Coach is thinking... (AI temporarily unavailable). Using static commentary.",
      model: "error",
    }, { status: 500 });
  }
}
