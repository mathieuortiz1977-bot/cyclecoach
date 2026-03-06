import { requireAuth } from "@/lib/api-auth";
import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const SYSTEM_PROMPT = `You are CycleCoach, an AI cycling training coach. Provide personalized coaching commentary. Be concise, specific, and match the requested personality tone. Never use generic motivational clichés.`;

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { prompt, maxOutputTokens = 300 } = await request.json();

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response("AI Coach not configured. Add ANTHROPIC_API_KEY to enable.", { status: 503 });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens,
      temperature: 0.8,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("AI stream error:", err);
    return new Response("AI streaming failed", { status: 500 });
  }
}
