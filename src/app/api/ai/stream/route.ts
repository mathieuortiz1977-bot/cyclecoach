import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const SYSTEM_PROMPT = `You are CycleCoach, an AI cycling training coach. Provide personalized coaching commentary. Be concise, specific, and match the requested personality tone. Never use generic motivational clichés.`;

export async function POST(request: NextRequest) {
  const { prompt, maxOutputTokens = 300 } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("AI Coach not configured", { status: 500 });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    prompt,
    maxOutputTokens,
    temperature: 0.8,
  });

  return result.toTextStreamResponse();
}
