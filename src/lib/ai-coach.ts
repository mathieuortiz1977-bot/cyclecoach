// AI Coach Engine — Dynamic commentary powered by Claude
// Generates personalized, context-aware coaching notes

import type { SessionDef, IntervalDef, BlockType, WeekType } from "./periodization";
import type { WorkoutScore, AdaptationDecision } from "./adaptation";
import type { DailyMetric } from "./fitness";

export type CoachPersonality = "DARK_HUMOR" | "MOTIVATIONAL" | "TECHNICAL" | "MIXED";

// ─── Prompt Builders ─────────────────────────────────────────────────

export function buildIntervalPrompt(
  interval: IntervalDef,
  session: SessionDef,
  blockType: BlockType,
  weekType: WeekType,
  ftp: number,
  personality: CoachPersonality
): string {
  const wattsLow = Math.round(ftp * interval.powerLow / 100);
  const wattsHigh = Math.round(ftp * interval.powerHigh / 100);

  return `You are CycleCoach, an AI cycling coach with a strong personality. Generate a single coach note for this interval.

PERSONALITY: ${personalityDescription(personality)}

CONTEXT:
- Training Block: ${blockType} (${blockDescription(blockType)})
- Week Type: ${weekType}
- Session: ${session.title} (${session.sessionType}, ${session.duration}min)
- Interval: "${interval.name}"
- Duration: ${Math.round(interval.durationSecs / 60)} minutes ${interval.durationSecs % 60 > 0 ? `${interval.durationSecs % 60}s` : ""}
- Power Target: ${wattsLow}-${wattsHigh}W (${interval.powerLow}-${interval.powerHigh}% FTP)
- Zone: ${interval.zone}
- Purpose: ${interval.purpose}
${interval.cadenceLow ? `- Cadence: ${interval.cadenceLow}-${interval.cadenceHigh} RPM` : ""}
${interval.rpe ? `- RPE: ${interval.rpe}/10` : ""}

RULES:
- Write exactly ONE short paragraph (2-3 sentences max)
- Be specific to THIS interval and its purpose
- Match the personality tone
- Include the physiological WHY when possible
- For recovery/warmup intervals, keep it light
- For hard intervals, acknowledge the suffering
- Never use generic motivational clichés
- Reference cycling culture, races, or relatable situations when natural
- Do NOT include the interval name or targets in the note (rider already sees those)`;
}

export function buildPostRidePrompt(
  score: WorkoutScore,
  session: SessionDef,
  ftp: number,
  personality: CoachPersonality,
  weekContext?: { weekType: WeekType; sessionsCompleted: number; totalSessions: number }
): string {
  return `You are CycleCoach, an AI cycling coach. Generate a post-ride debrief for this completed session.

PERSONALITY: ${personalityDescription(personality)}

WORKOUT RESULTS:
- Session: ${session.title}
- Compliance: ${score.compliance}%
- Power Accuracy: ${score.powerAccuracy}%
- Duration Accuracy: ${score.durationAccuracy}%
- Rating: ${score.overallRating}
- Fatigue Signal: ${score.fatigueSignal}
- HR Drift: ${score.hrDrift}%
- Power Fade: ${score.powerFade}%
- FTP: ${ftp}W

${weekContext ? `WEEK CONTEXT:
- Week Type: ${weekContext.weekType}
- Sessions Completed: ${weekContext.sessionsCompleted}/${weekContext.totalSessions}
` : ""}

RULES:
- Write 2-4 sentences
- Be specific about what went well and what needs attention
- If power fade > 5%, mention fueling or pacing
- If HR drift > 8%, mention possible fatigue or dehydration
- If compliance > 95%, celebrate but keep it real
- If compliance < 70%, be supportive not harsh — acknowledge the effort
- Include one actionable tip for next session
- Match the personality tone throughout`;
}

export function buildWeeklyRecapPrompt(
  scores: WorkoutScore[],
  adaptation: AdaptationDecision,
  blockType: BlockType,
  weekType: WeekType,
  ftp: number,
  personality: CoachPersonality,
  fitnessMetrics?: { ctl: number; atl: number; tsb: number }
): string {
  const avgCompliance = scores.reduce((s, w) => s + w.compliance, 0) / scores.length;
  const missedCount = scores.filter((s) => s.overallRating === "missed").length;
  const crushedCount = scores.filter((s) => s.overallRating === "crushed_it").length;

  return `You are CycleCoach, an AI cycling coach. Write a weekly training recap.

PERSONALITY: ${personalityDescription(personality)}

WEEK SUMMARY:
- Block: ${blockType} | Week Type: ${weekType}
- Sessions Completed: ${scores.length - missedCount}/${scores.length}
- Average Compliance: ${avgCompliance.toFixed(1)}%
- Crushed: ${crushedCount} | Missed: ${missedCount}
- FTP: ${ftp}W
${fitnessMetrics ? `- CTL: ${fitnessMetrics.ctl} | ATL: ${fitnessMetrics.atl} | TSB: ${fitnessMetrics.tsb}` : ""}

ADAPTATION DECISION: ${adaptation.action} (${adaptation.adjustmentPct > 0 ? "+" : ""}${adaptation.adjustmentPct}%)
Reason: ${adaptation.reason}

SESSION DETAILS:
${scores.map((s, i) => `  ${i + 1}. ${s.overallRating} — ${s.compliance}% compliance, fatigue: ${s.fatigueSignal}`).join("\n")}

RULES:
- Write 4-6 sentences as a weekly debrief
- Summarize the training week narrative (not just numbers)
- Explain what the adaptation decision means for next week
- Include one insight about their fitness trajectory
- If ${weekType === "OVERREACH" ? "acknowledge the hard week and preview recovery" : weekType === "RECOVERY" ? "validate the recovery and preview the next build" : "connect this week to the bigger picture"}
- End with one sentence previewing next week
- Match the personality tone`;
}

export function buildSaturdayBriefingPrompt(
  routeName: string,
  distance: number,
  elevation: number,
  weekType: WeekType,
  blockType: BlockType,
  ftp: number,
  personality: CoachPersonality,
  weekScores?: WorkoutScore[]
): string {
  const weekCompliance = weekScores
    ? weekScores.reduce((s, w) => s + w.compliance, 0) / weekScores.length
    : null;

  return `You are CycleCoach, an AI cycling coach. Write a Saturday ride briefing for an outdoor free ride.

PERSONALITY: ${personalityDescription(personality)}

RIDE DETAILS:
- Route: ${routeName}
- Distance: ${distance}km
- Elevation: ${elevation}m
- Location: Medellín, Colombia
- Block: ${blockType} | Week: ${weekType}
- FTP: ${ftp}W
${weekCompliance ? `- This week's indoor compliance: ${weekCompliance.toFixed(0)}%` : ""}
${weekScores?.some((s) => s.fatigueSignal === "fatigued") ? "- ⚠️ Fatigue signals detected during indoor sessions this week" : ""}

RULES:
- Write 3-5 sentences
- Include pacing advice based on the week's fatigue
- Mention the specific route and terrain character
- Give nutrition/hydration reminders for a ${distance}km ride in Colombian mountains
- If fatigue detected this week, advise a more conservative pace
- If it's a recovery week, emphasize enjoyment over intensity
- Reference the altitude and climbing if relevant
- Match the personality tone`;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function personalityDescription(tone: CoachPersonality): string {
  switch (tone) {
    case "DARK_HUMOR":
      return "Dark humor — sardonic, witty, self-deprecating about the suffering of cycling. Think of a coach who acknowledges the absurdity of choosing to suffer on a bike. Sarcastic but caring underneath.";
    case "MOTIVATIONAL":
      return "Motivational — positive, energetic, believes in the rider. Think of a coach who sees potential in every pedal stroke. Encouraging without being cheesy.";
    case "TECHNICAL":
      return "Technical — scientific, precise, data-driven. Think of a sports scientist who explains the physiology behind every effort. Informative but not boring.";
    case "MIXED":
      return "Mixed — alternate between dark humor, motivation, and technical insights. Unpredictable but always authentic. Sometimes funny, sometimes serious, always helpful.";
  }
}

function blockDescription(block: BlockType): string {
  switch (block) {
    case "BASE": return "Building aerobic foundation, endurance, and efficiency";
    case "THRESHOLD": return "Raising FTP ceiling, sustained power development";
    case "VO2MAX": return "High intensity, expanding aerobic ceiling, climbing power";
    case "RACE_SIM": return "Race-specific preparation, mixed intensity, putting it all together";
  }
}

// ─── API Call Helper ─────────────────────────────────────────────────

export interface AICoachResponse {
  text: string;
  model: string;
  tokensUsed?: number;
}

export async function callAICoach(prompt: string): Promise<AICoachResponse> {
  const res = await fetch("/api/ai/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`AI Coach API error: ${res.status}`);
  }

  return res.json();
}
