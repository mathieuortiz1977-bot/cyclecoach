// Adaptive Engine — adjusts training based on completed workout data
// The brain of CycleCoach

import type { SessionDef, IntervalDef } from "./periodization";

// ─── Types ───────────────────────────────────────────────────────────

export interface CompletedWorkout {
  sessionId: string;
  plannedSession: SessionDef;
  actualData: {
    avgPower?: number;
    normalizedPower?: number;
    avgHr?: number;
    maxHr?: number;
    duration: number; // actual seconds
    tss?: number;
    rpe?: number; // rider-reported RPE 1-10
    completed: boolean;
    notes?: string;
  };
  ftp: number;
  date: string;
}

export interface WorkoutScore {
  compliance: number;       // 0-100: how well did you hit targets?
  powerAccuracy: number;    // 0-100: power targets hit?
  durationAccuracy: number; // 0-100: duration match?
  overallRating: string;    // "crushed_it" | "on_target" | "struggled" | "underperformed" | "missed"
  hrDrift: number;          // % cardiac drift
  powerFade: number;        // % power fade over session
  fatigueSignal: "fresh" | "normal" | "fatigued" | "overreached";
  coachFeedback: string;    // AI-generated feedback
}

export interface AdaptationDecision {
  action: "maintain" | "increase" | "decrease" | "recovery" | "retest";
  adjustmentPct: number;    // how much to adjust intensity (-20 to +10)
  reason: string;
  nextSessionMods: SessionModification[];
  ftpSuggestion?: { newFtp: number; confidence: string; reason: string };
}

export interface SessionModification {
  type: "power" | "duration" | "intervals" | "recovery" | "swap";
  description: string;
  value: number; // adjustment value
}

// ─── Workout Scoring ─────────────────────────────────────────────────

export function scoreWorkout(completed: CompletedWorkout): WorkoutScore {
  const { plannedSession, actualData, ftp } = completed;

  if (!actualData.completed) {
    return {
      compliance: 0,
      powerAccuracy: 0,
      durationAccuracy: 0,
      overallRating: "missed",
      hrDrift: 0,
      powerFade: 0,
      fatigueSignal: "normal",
      coachFeedback: "Missed session. Life happens. We'll adjust the plan — but don't make it a habit.",
    };
  }

  // Duration accuracy
  const plannedDuration = plannedSession.duration * 60; // to seconds
  const durationRatio = actualData.duration / plannedDuration;
  const durationAccuracy = Math.max(0, 100 - Math.abs(1 - durationRatio) * 100);

  // Power accuracy (compare actual avg to planned weighted average)
  let powerAccuracy = 100;
  if (actualData.avgPower && ftp) {
    const plannedAvgPct = getPlannedAvgPowerPct(plannedSession);
    const actualPct = (actualData.avgPower / ftp) * 100;
    const diff = Math.abs(actualPct - plannedAvgPct);
    powerAccuracy = Math.max(0, 100 - diff * 3); // 3% penalty per % off target
  }

  // Overall compliance
  const compliance = Math.round(powerAccuracy * 0.6 + durationAccuracy * 0.4);

  // Power fade estimation
  const powerFade = actualData.normalizedPower && actualData.avgPower
    ? ((actualData.normalizedPower - actualData.avgPower) / actualData.normalizedPower) * 100
    : 0;

  // HR drift estimation (simplified — ideally from stream data)
  const hrDrift = actualData.avgHr && actualData.maxHr
    ? ((actualData.maxHr - actualData.avgHr) / actualData.avgHr) * 100
    : 0;

  // Fatigue signal
  const fatigueSignal = detectFatigue(compliance, powerFade, hrDrift, actualData.rpe);

  // Overall rating
  const overallRating = getOverallRating(compliance, fatigueSignal);

  // Coach feedback
  const coachFeedback = generateFeedback(overallRating, compliance, powerFade, hrDrift, fatigueSignal);

  return {
    compliance,
    powerAccuracy: Math.round(powerAccuracy),
    durationAccuracy: Math.round(durationAccuracy),
    overallRating,
    hrDrift: Math.round(hrDrift * 10) / 10,
    powerFade: Math.round(powerFade * 10) / 10,
    fatigueSignal,
    coachFeedback,
  };
}

function getPlannedAvgPowerPct(session: SessionDef): number {
  let totalPower = 0;
  let totalTime = 0;
  for (const interval of session.intervals) {
    const avg = (interval.powerLow + interval.powerHigh) / 2;
    totalPower += avg * interval.durationSecs;
    totalTime += interval.durationSecs;
  }
  return totalTime > 0 ? totalPower / totalTime : 60;
}

function detectFatigue(
  compliance: number,
  powerFade: number,
  hrDrift: number,
  rpe?: number
): "fresh" | "normal" | "fatigued" | "overreached" {
  let score = 0;

  if (compliance < 70) score += 2;
  else if (compliance < 85) score += 1;

  if (powerFade > 8) score += 2;
  else if (powerFade > 5) score += 1;

  if (hrDrift > 10) score += 2;
  else if (hrDrift > 5) score += 1;

  if (rpe && rpe >= 9) score += 2;
  else if (rpe && rpe >= 7) score += 1;

  if (score >= 6) return "overreached";
  if (score >= 4) return "fatigued";
  if (score >= 2) return "normal";
  return "fresh";
}

function getOverallRating(compliance: number, fatigue: string): string {
  if (compliance >= 95) return "crushed_it";
  if (compliance >= 80) return "on_target";
  if (compliance >= 60) return "struggled";
  if (fatigue === "overreached") return "struggled";
  return "underperformed";
}

function generateFeedback(
  rating: string,
  compliance: number,
  powerFade: number,
  hrDrift: number,
  fatigue: string
): string {
  const feedbacks: Record<string, string[]> = {
    crushed_it: [
      `Compliance: ${compliance}%. You nailed it. Every interval, every watt. This is what consistency looks like.`,
      `${compliance}% compliance. Chef's kiss. Your training plan just sent you a thank-you card.`,
      `Perfect execution (${compliance}%). Your legs did exactly what your brain told them. That's rare. Enjoy it.`,
    ],
    on_target: [
      `Compliance: ${compliance}%. Solid session. Not perfect, but perfect isn't the goal — consistent is.`,
      `${compliance}% target accuracy. Good work. The adaptation will come. Trust the process.`,
      `Strong session (${compliance}%). A few watts off here and there, but the training effect is there.`,
    ],
    struggled: [
      `Compliance: ${compliance}%. Tough day. ${powerFade > 5 ? `Power faded ${powerFade.toFixed(1)}% — might need more fueling or recovery.` : ""} ${hrDrift > 8 ? `HR drift of ${hrDrift.toFixed(1)}% suggests cardiac fatigue.` : ""} We'll dial it back.`,
      `${compliance}% — below target. ${fatigue === "fatigued" ? "Your body is talking. Time to listen." : "Not your best, but you showed up. That counts."}`,
    ],
    underperformed: [
      `Compliance: ${compliance}%. Something's off. ${fatigue === "overreached" ? "Multiple fatigue signals detected — forced recovery incoming." : "Could be sleep, nutrition, stress. Check in with yourself."}`,
      `${compliance}% today. That's data, not judgment. We'll adjust the plan. Recovery is training too.`,
    ],
    missed: [
      "Missed session. Life happens. We'll restructure the week — but the comeback has to be real.",
    ],
  };

  const pool = feedbacks[rating] || feedbacks.on_target;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Adaptation Logic ────────────────────────────────────────────────

export function generateAdaptation(
  recentScores: WorkoutScore[],
  currentFtp: number,
  weekType: string
): AdaptationDecision {
  if (recentScores.length === 0) {
    return {
      action: "maintain",
      adjustmentPct: 0,
      reason: "No completed workouts to analyze yet. Following the plan as written.",
      nextSessionMods: [],
    };
  }

  const avgCompliance = recentScores.reduce((s, w) => s + w.compliance, 0) / recentScores.length;
  const missedCount = recentScores.filter((w) => w.overallRating === "missed").length;
  const crushedCount = recentScores.filter((w) => w.overallRating === "crushed_it").length;
  const struggledCount = recentScores.filter((w) => w.overallRating === "struggled" || w.overallRating === "underperformed").length;
  const fatigueSignals = recentScores.filter((w) => w.fatigueSignal === "fatigued" || w.fatigueSignal === "overreached").length;

  // If recovery week, don't adjust much
  if (weekType === "RECOVERY") {
    return {
      action: "maintain",
      adjustmentPct: 0,
      reason: "Recovery week — hold steady. The adaptation happens while you rest.",
      nextSessionMods: [],
    };
  }

  // Multiple missed sessions
  if (missedCount >= 2) {
    return {
      action: "decrease",
      adjustmentPct: -15,
      reason: `${missedCount} missed sessions this week. Reducing volume and intensity to get you back on track.`,
      nextSessionMods: [
        { type: "duration", description: "Shorten indoor sessions by 10 minutes", value: -10 },
        { type: "power", description: "Reduce interval targets by 5%", value: -5 },
        { type: "recovery", description: "Add extra recovery between intervals", value: 30 },
      ],
    };
  }

  // Fatigue overload
  if (fatigueSignals >= 2) {
    return {
      action: "recovery",
      adjustmentPct: -20,
      reason: "Multiple fatigue signals detected. Your body needs recovery — pushing through will lead to plateau or injury.",
      nextSessionMods: [
        { type: "swap", description: "Replace next hard session with Z2 endurance", value: 0 },
        { type: "power", description: "Cap all efforts at 85% FTP", value: -15 },
        { type: "duration", description: "Reduce session duration by 15 minutes", value: -15 },
      ],
    };
  }

  // Crushing it consistently
  if (crushedCount >= 3 && avgCompliance > 92) {
    const ftpBump = Math.round(currentFtp * 0.02); // suggest 2% FTP increase
    return {
      action: "increase",
      adjustmentPct: 5,
      reason: `${crushedCount} sessions crushed this week (avg ${avgCompliance.toFixed(0)}% compliance). Time to push harder.`,
      nextSessionMods: [
        { type: "power", description: "Increase interval targets by 3%", value: 3 },
        { type: "intervals", description: "Add one extra rep to main set", value: 1 },
      ],
      ftpSuggestion: {
        newFtp: currentFtp + ftpBump,
        confidence: "moderate",
        reason: `Consistently exceeding targets. Consider updating FTP from ${currentFtp}W to ${currentFtp + ftpBump}W.`,
      },
    };
  }

  // Good compliance, slight progression
  if (avgCompliance >= 80 && struggledCount <= 1) {
    return {
      action: "maintain",
      adjustmentPct: 2,
      reason: `Avg compliance: ${avgCompliance.toFixed(0)}%. Right in the sweet spot. Slight bump for progression.`,
      nextSessionMods: [
        { type: "power", description: "Nudge interval targets up by 1-2%", value: 2 },
      ],
    };
  }

  // Struggling — ease off
  if (avgCompliance < 70 || struggledCount >= 2) {
    return {
      action: "decrease",
      adjustmentPct: -10,
      reason: `Avg compliance: ${avgCompliance.toFixed(0)}% with ${struggledCount} tough sessions. Pulling back to rebuild.`,
      nextSessionMods: [
        { type: "power", description: "Reduce interval targets by 5%", value: -5 },
        { type: "recovery", description: "Extend recovery intervals by 30s", value: 30 },
      ],
    };
  }

  return {
    action: "maintain",
    adjustmentPct: 0,
    reason: `Avg compliance: ${avgCompliance.toFixed(0)}%. Steady progress. Keep doing what you're doing.`,
    nextSessionMods: [],
  };
}

// ─── FTP Detection ───────────────────────────────────────────────────

export interface FTPEstimate {
  estimatedFtp: number;
  confidence: "low" | "medium" | "high";
  method: string;
  reason: string;
}

/**
 * Estimate FTP from recent ride data
 * Uses multiple methods and takes the most conservative
 */
export function estimateFTPFromRides(
  rides: {
    normalizedPower?: number;
    avgPower?: number;
    duration: number; // seconds
    maxPower20min?: number; // 20-min peak power if available
  }[],
  currentFtp: number
): FTPEstimate | null {
  const estimates: number[] = [];

  for (const ride of rides) {
    // Method 1: 95% of 20-min peak power (gold standard)
    if (ride.maxPower20min && ride.maxPower20min > 0) {
      estimates.push(Math.round(ride.maxPower20min * 0.95));
    }

    // Method 2: NP from rides > 60 min (rough estimate)
    if (ride.normalizedPower && ride.duration > 3600) {
      // For long rides, NP ≈ FTP (very rough)
      estimates.push(Math.round(ride.normalizedPower * 0.95));
    }

    // Method 3: If consistently beating FTP targets
    if (ride.avgPower && ride.duration > 1200) {
      const avgPct = (ride.avgPower / currentFtp) * 100;
      if (avgPct > 100) {
        estimates.push(Math.round(ride.avgPower * 0.98));
      }
    }
  }

  if (estimates.length === 0) return null;

  // Take conservative estimate (median)
  estimates.sort((a, b) => a - b);
  const median = estimates[Math.floor(estimates.length / 2)];
  const diff = median - currentFtp;
  const diffPct = (diff / currentFtp) * 100;

  if (Math.abs(diffPct) < 2) return null; // Not significant enough

  return {
    estimatedFtp: median,
    confidence: estimates.length >= 3 ? "high" : estimates.length >= 2 ? "medium" : "low",
    method: `Based on ${estimates.length} data points from recent rides`,
    reason: diff > 0
      ? `Your recent data suggests FTP of ~${median}W (+${diff}W / +${diffPct.toFixed(1)}%). You're getting stronger! 💪`
      : `Recent data suggests FTP may have dropped to ~${median}W (${diff}W / ${diffPct.toFixed(1)}%). Could be fatigue — consider a retest after recovery.`,
  };
}

// ─── Missed Session Rescheduler ──────────────────────────────────────

export interface RescheduleResult {
  action: "skip" | "swap" | "compress" | "extend";
  description: string;
  modifications: string[];
}

export function rescheduleMissedSession(
  missedDay: string,
  remainingDays: string[],
  weekType: string,
  missedSessionTitle: string
): RescheduleResult {
  // Recovery week: just skip it
  if (weekType === "RECOVERY") {
    return {
      action: "skip",
      description: "Recovery week — missing a session is fine. Your body needed it anyway.",
      modifications: ["No changes needed"],
    };
  }

  // If Saturday missed, can't really reschedule a 100km ride
  if (missedDay === "SAT") {
    return {
      action: "skip",
      description: "Missed the Saturday ride. Can't cram 100km into a weekday. Focus on next week.",
      modifications: ["Consider an extra 30min Z2 on Sunday if legs feel good"],
    };
  }

  // If there are remaining training days, compress
  if (remainingDays.length >= 2) {
    return {
      action: "compress",
      description: `Missed ${missedDay} (${missedSessionTitle}). Folding key intervals into remaining sessions.`,
      modifications: [
        "Add 10 minutes to next indoor session",
        "Include the main interval set from the missed session",
        "Extend warmup to compensate for back-to-back loading",
      ],
    };
  }

  // Only one day left — swap to get the most important work in
  if (remainingDays.length === 1) {
    return {
      action: "swap",
      description: `Only ${remainingDays[0]} left. Replacing with the highest-priority work from the week.`,
      modifications: [
        `Replace ${remainingDays[0]} session with the missed ${missedSessionTitle} main set`,
        "Cut warmup/cooldown shorter to fit key intervals",
      ],
    };
  }

  return {
    action: "skip",
    description: "No training days left this week. Move on — next week is a fresh start.",
    modifications: ["Focus on recovery and nutrition for Saturday's ride"],
  };
}
