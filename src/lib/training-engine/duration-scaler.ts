/**
 * Duration-Aware Session Scaling
 * Intelligently scales intervals to fit user's requested time
 */

import { IntervalBlock, IntervalSet, TrainingSession } from "./types";

/**
 * Scale a session to fit a target duration
 * Adjusts interval durations proportionally while maintaining structure
 */
export function scaleSessionToDuration(
  session: TrainingSession,
  targetDurationMinutes: number,
): TrainingSession {
  const targetDurationSeconds = targetDurationMinutes * 60;
  const currentDurationSeconds = session.totalDurationSeconds;
  
  // If already close to target, don't scale
  if (Math.abs(currentDurationSeconds - targetDurationSeconds) < 60) {
    return session;
  }
  
  // Calculate scale factor
  const scaleFactor = targetDurationSeconds / currentDurationSeconds;
  
  // Scale all blocks
  const scaledWarmup = scaleBlocks(session.warmup, scaleFactor);
  const scaledMainSets = scaleIntervalSets(session.mainSets, scaleFactor);
  const scaledCooldown = scaleBlocks(session.cooldown, scaleFactor);
  
  // Rebuild session with scaled intervals
  const allScaledBlocks = [...scaledWarmup, ...scaledMainSets.flatMap(s => s.blocks), ...scaledCooldown];
  const newTotalDurationSeconds = allScaledBlocks.reduce((sum, b) => sum + b.durationSeconds, 0);
  
  return {
    ...session,
    warmup: scaledWarmup,
    mainSets: scaledMainSets,
    cooldown: scaledCooldown,
    totalDurationSeconds: newTotalDurationSeconds,
    totalDurationMinutes: Math.round(newTotalDurationSeconds / 60),
  };
}

/**
 * Scale a set of interval blocks
 */
function scaleBlocks(blocks: IntervalBlock[], scaleFactor: number): IntervalBlock[] {
  return blocks.map(block => ({
    ...block,
    durationSeconds: Math.round(block.durationSeconds * scaleFactor),
  }));
}

/**
 * Scale interval sets (reps + blocks)
 */
function scaleIntervalSets(sets: IntervalSet[], scaleFactor: number): IntervalSet[] {
  return sets.map(set => ({
    ...set,
    blocks: scaleBlocks(set.blocks, scaleFactor),
    restBetweenSets: set.restBetweenSets ? Math.round(set.restBetweenSets * scaleFactor) : undefined,
  }));
}

/**
 * Intelligent duration-based interval design
 * For building sessions that FIT a target time, not just scaling
 */
export function designIntervalsForDuration(
  targetDurationMinutes: number,
  goalType: "threshold" | "vo2max" | "anaerobic" | "endurance"
): {
  warmupMinutes: number;
  mainSetMinutes: number;
  cooldownMinutes: number;
  recommendedStructure: string;
} {
  const total = targetDurationMinutes;
  
  // Standard warmup/cooldown ratios
  const warmupMinutes = Math.max(10, Math.round(total * 0.15)); // 15% for warmup
  const cooldownMinutes = Math.max(5, Math.round(total * 0.08)); // 8% for cooldown
  const mainSetMinutes = total - warmupMinutes - cooldownMinutes;
  
  // Recommend structure based on available time
  let recommendedStructure = "";
  
  if (goalType === "threshold") {
    if (mainSetMinutes <= 20) {
      recommendedStructure = "Single 15-20min effort";
    } else if (mainSetMinutes <= 35) {
      recommendedStructure = "2 × 15min with 5min rest";
    } else if (mainSetMinutes <= 50) {
      recommendedStructure = "3 × 12min with 4min rest";
    } else {
      recommendedStructure = "2 × 20min with 5min rest";
    }
  }
  
  if (goalType === "vo2max") {
    if (mainSetMinutes <= 20) {
      recommendedStructure = "Single 4-5min effort";
    } else if (mainSetMinutes <= 30) {
      recommendedStructure = "4 × 5min with 3min rest";
    } else if (mainSetMinutes <= 40) {
      recommendedStructure = "4 × 8min with 3min rest";
    } else {
      recommendedStructure = "5 × 8min with 3min rest";
    }
  }
  
  if (goalType === "anaerobic") {
    if (mainSetMinutes <= 15) {
      recommendedStructure = "6 × 30s with 2min rest";
    } else if (mainSetMinutes <= 25) {
      recommendedStructure = "Tabata (8 × 20s/10s) × 2 sets";
    } else {
      recommendedStructure = "Pyramid: 30-60-90-120-90-60-30s";
    }
  }
  
  if (goalType === "endurance") {
    recommendedStructure = `Single ${mainSetMinutes}min steady effort`;
  }
  
  return {
    warmupMinutes,
    mainSetMinutes,
    cooldownMinutes,
    recommendedStructure,
  };
}
