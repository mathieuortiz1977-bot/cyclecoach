/**
 * Training Session Generation Engine — Type System
 * Strict TypeScript types for athlete profiles, intervals, and sessions
 */

// ─── ENUMS & STRING UNIONS ────────────────────────────────────────

export type TrainingZone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6" | "Z7";
export type SessionGoal = "VO2Max" | "LactateThreshold" | "SweetSpot" | "Anaerobic" | "SprintPower" | "Endurance";
export type IntervalProtocol = "30_30" | "40_20" | "4x8" | "3x10" | "2x20" | "Tabata" | "Pyramid";
export type AthleteLevel = "Beginner" | "Intermediate" | "Advanced" | "Elite";

// ─── ATHLETE PROFILE ──────────────────────────────────────────────

export interface AthleteProfile {
  /** Functional Threshold Power in watts */
  ftp: number;
  
  /** Body weight in kg */
  weight: number;
  
  /** Maximum heart rate in bpm */
  maxHr: number;
  
  /** Resting heart rate in bpm */
  restingHr: number;
  
  /** Training level/experience */
  level: AthleteLevel;
}

// ─── INTERVAL BLOCK ──────────────────────────────────────────────

export interface IntervalBlock {
  /** Block name/purpose */
  name: string;
  
  /** Duration in seconds */
  durationSeconds: number;
  
  /** Target power range (% of FTP) */
  targetPowerMin: number;
  targetPowerMax: number;
  
  /** Target power range (watts) - calculated */
  targetWattsMin?: number;
  targetWattsMax?: number;
  
  /** Training zone */
  zone: TrainingZone;
  
  /** Cadence range (rpm) */
  cadenceLow?: number;
  cadenceHigh?: number;
  
  /** Heart rate targets (bpm) - calculated */
  targetHrMin?: number;
  targetHrMax?: number;
  
  /** RPE 1-10 */
  rpe?: number;
  
  /** Coach notes/cues */
  coachNote?: string;
  
  /** Power kJ for block - calculated */
  kj?: number;
  
  /** Energy kcal for block - calculated */
  kcal?: number;
  
  /** Average power for NP calculation - calculated */
  avgPower?: number;
}

// ─── INTERVAL SET (REPEATS) ──────────────────────────────────────

export interface IntervalSet {
  /** Number of repetitions */
  repetitions: number;
  
  /** Blocks within each rep (the actual work) */
  blocks: IntervalBlock[];
  
  /** Rest between sets in seconds */
  restBetweenSets?: number;
}

// ─── TRAINING SESSION ────────────────────────────────────────────

export interface TrainingSession {
  /** Session goal */
  goal: SessionGoal;
  
  /** Protocol used */
  protocol: IntervalProtocol;
  
  /** Athlete this is for */
  athleteProfile: AthleteProfile;
  
  /** Warmup blocks */
  warmup: IntervalBlock[];
  
  /** Main interval set(s) */
  mainSets: IntervalSet[];
  
  /** Cooldown blocks */
  cooldown: IntervalBlock[];
  
  /** Total session duration in seconds */
  totalDurationSeconds: number;
  
  /** Total session duration in minutes - calculated */
  totalDurationMinutes?: number;
  
  /** Training Stress Score - calculated */
  tss?: number;
  
  /** Normalized Power - calculated */
  np?: number;
  
  /** Intensity Factor (NP/FTP) - calculated */
  intensityFactor?: number;
  
  /** Total energy kJ - calculated */
  totalKj?: number;
  
  /** Total energy kcal - calculated */
  totalKcal?: number;
  
  /** Carbs needed (grams) - calculated */
  carbsNeeded?: number;
  
  /** Goal-specific coaching notes */
  coachingNotes?: string[];
}

// ─── SESSION BUILDER CONFIG ──────────────────────────────────────

export interface SessionBuilderConfig {
  /** Athlete to build for */
  athlete: AthleteProfile;
  
  /** Training goal */
  goal: SessionGoal;
  
  /** Optional: override protocol (else use default for goal) */
  protocol?: IntervalProtocol;
  
  /** TARGET DURATION IN MINUTES - SCALES ENTIRE SESSION TO THIS TIME */
  targetDurationMinutes?: number;
  
  /** Optional: override warmup duration (seconds) */
  warmupDuration?: number;
  
  /** Optional: override cooldown duration (seconds) */
  cooldownDuration?: number;
  
  /** Optional: volume multiplier (1.0 = baseline) */
  volumeMultiplier?: number;
}

// ─── PROGRESSION WEEK ───────────────────────────────────────────

export interface ProgressionWeek {
  /** Week number (1-4) */
  weekNumber: number;
  
  /** Week type in progression */
  weekType: "Baseline" | "Build" | "Peak" | "Recovery";
  
  /** Sessions for this week (one per day, or select days) */
  sessions: TrainingSession[];
  
  /** Total weekly TSS - calculated */
  weeklyTss?: number;
}

// ─── PROGRESSION BLOCK ──────────────────────────────────────────

export interface ProgressionBlock {
  /** Block goal */
  goal: SessionGoal;
  
  /** 4-week progression */
  weeks: ProgressionWeek[];
  
  /** Total block TSS - calculated */
  blockTss?: number;
}
