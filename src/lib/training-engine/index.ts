/**
 * Training Session Generation Engine — Public API
 * 
 * Simple factory functions for generating training sessions from athlete profiles
 */

import {
  AthleteProfile,
  IntervalBlock,
  IntervalSet,
  ProgressionBlock,
  SessionBuilderConfig,
  SessionGoal,
  TrainingSession,
} from "./types";
import { SessionBuilder, ProgressionPlanner } from "./session";

// ─── PUBLIC API ──────────────────────────────────────────────────

/**
 * Create a single training session
 * @param athlete Athlete profile (FTP, weight, HR, level)
 * @param goal Training goal (VO2Max, Threshold, etc.)
 * @param protocol Optional: override protocol
 * @returns Complete TrainingSession with all calculations
 */
export function createSession(
  athlete: AthleteProfile,
  goal: SessionGoal,
  protocol?: string,
): TrainingSession {
  const config: SessionBuilderConfig = {
    athlete,
    goal,
    protocol: protocol as any,
  };

  return new SessionBuilder(config).build(config);
}

/**
 * Create a 4-week progression block
 * @param athlete Athlete profile
 * @param goal Training goal
 * @returns ProgressionBlock with 4 weeks of sessions
 */
export function buildProgressionBlock(athlete: AthleteProfile, goal: SessionGoal): ProgressionBlock {
  const config: SessionBuilderConfig = {
    athlete,
    goal,
  };

  return new ProgressionPlanner(athlete).buildBlock(config);
}

/**
 * Format and print a session to console
 */
export function printSession(athlete: AthleteProfile, goal: SessionGoal): void {
  const session = createSession(athlete, goal);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  TRAINING SESSION — ${goal}
╚══════════════════════════════════════════════════════════════╝

ATHLETE PROFILE
  FTP: ${athlete.ftp}W | Weight: ${athlete.weight}kg | Max HR: ${athlete.maxHr}bpm | Level: ${athlete.level}

SESSION OVERVIEW
  Protocol: ${session.protocol}
  Duration: ${session.totalDurationMinutes} minutes (${Math.floor(session.totalDurationSeconds / 60)}:${(session.totalDurationSeconds % 60).toString().padStart(2, "0")})
  
METRICS
  TSS: ${session.tss}
  Normalized Power: ${session.np}W
  Intensity Factor: ${session.intensityFactor}
  Energy: ${session.totalKj}kJ (${session.totalKcal}kcal)
  Carbs Needed: ${session.carbsNeeded}g

WARMUP (${sumDuration(session.warmup)} min)
${formatBlocks(session.warmup)}

MAIN SETS (${sumDuration(session.mainSets.flatMap((s) => s.blocks))} min)
${formatSets(session.mainSets)}

COOLDOWN (${sumDuration(session.cooldown)} min)
${formatBlocks(session.cooldown)}

COACHING NOTES
${session.coachingNotes?.map((note) => `  • ${note}`).join("\n")}
`);
}

/**
 * Print a full 4-week progression block
 */
export function printProgressionBlock(athlete: AthleteProfile, goal: SessionGoal): void {
  const block = buildProgressionBlock(athlete, goal);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  4-WEEK PROGRESSION BLOCK — ${goal}
╚══════════════════════════════════════════════════════════════╝

ATHLETE: ${athlete.level} (FTP: ${athlete.ftp}W)

`);

  block.weeks.forEach((week) => {
    console.log(`─── WEEK ${week.weekNumber}: ${week.weekType.toUpperCase()} ───\n`);
    week.sessions.forEach((session) => {
      console.log(`Protocol: ${session.protocol}`);
      console.log(`Duration: ${session.totalDurationMinutes}min | TSS: ${session.tss} | NP: ${session.np}W`);
      console.log(`Energy: ${session.totalKj}kJ | Carbs: ${session.carbsNeeded}g\n`);
    });
  });

  console.log(`TOTAL BLOCK TSS: ${block.blockTss}`);
  console.log(`\nBlock progression: Baseline → +15% → Peak → Recovery\n`);
}

// ─── HELPERS ──────────────────────────────────────────────────

function sumDuration(blocks: IntervalBlock[]): number {
  const totalSecs = blocks.reduce((sum, b) => sum + b.durationSeconds, 0);
  return Math.round(totalSecs / 60);
}

function formatBlocks(blocks: IntervalBlock[]): string {
  return blocks
    .map((b) => {
      const mins = Math.floor(b.durationSeconds / 60);
      const secs = b.durationSeconds % 60;
      const duration = `${mins}:${secs.toString().padStart(2, "0")}`;
      return `  ${b.name.padEnd(20)} ${duration.padEnd(8)} ${b.targetWattsMin}–${b.targetWattsMax}W | HR: ${b.targetHrMin}–${b.targetHrMax}bpm | RPE: ${b.rpe || "-"}`;
    })
    .join("\n");
}

function formatSets(sets: IntervalSet[]): string {
  return sets
    .map((set, idx) => {
      const blockStr = set.blocks
        .map((b) => {
          const mins = Math.floor(b.durationSeconds / 60);
          const secs = b.durationSeconds % 60;
          const duration = `${mins}:${secs.toString().padStart(2, "0")}`;
          return `${b.name} ${duration} @ ${b.targetWattsMin}–${b.targetWattsMax}W`;
        })
        .join(" + ");

      const restStr = set.restBetweenSets ? ` + ${set.restBetweenSets}s rest` : "";
      return `  ${set.repetitions}x [${blockStr}]${restStr}`;
    })
    .join("\n");
}

// ─── RE-EXPORTS ──────────────────────────────────────────────

export * from "./types";
export { PowerCalculator, TssCalculator } from "./zones";
export { SessionBuilder, IntervalBlockFactory, ProtocolLibrary, ProgressionPlanner } from "./session";
