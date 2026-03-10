// Periodization Engine — generates complete training plans
import { getCoachNote, resetCommentaryIndex } from "./coach";
import { getRouteForWeek, type RouteData } from "./routes";
import { getZoneForPower } from "./zones";
import { MASTER_WORKOUTS, getMasterWorkoutsSync } from "./sessions-data-all";
// Legacy imports still available for reference
import { MASTER_WORKOUTS as CLASSIFIED } from "./sessions-data-classified";

// CRITICAL: Force load workouts when module loads (for API server context ONLY)
// This ensures MASTER_WORKOUTS is populated before any plan generation
// GUARD: Only run on server-side (not in browser)
let _workoutsInitialized = false;
function ensureWorkoutsLoaded() {
  // GUARD: Don't try to load on client-side
  if (typeof window !== 'undefined') {
    console.log('[periodization] Client-side detected, skipping workout loading');
    return;
  }
  
  if (!_workoutsInitialized && MASTER_WORKOUTS.length === 0) {
    console.log('[periodization] SERVER-SIDE: Forcing workout initialization...');
    try {
      const loaded = getMasterWorkoutsSync();
      console.log('[periodization] Workouts loaded:', loaded.length);
      _workoutsInitialized = true;
    } catch (err) {
      console.error('[periodization] Failed to load workouts:', err);
    }
  }
}

export type BlockType = "BASE" | "THRESHOLD" | "VO2MAX" | "RACE_SIM";
export type WeekType = "BUILD" | "BUILD_PLUS" | "OVERREACH" | "RECOVERY";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface IntervalDef {
  name: string;
  durationSecs: number;  // Always converted from durationSecs or durationPercent
  powerLow: number;  // % FTP
  powerHigh: number; // % FTP
  cadenceLow?: number;
  cadenceHigh?: number;
  rpe?: number;
  zone: string;
  purpose: string;
  coachNote: string;
}

// Internal type for raw intervals that may have durationPercent
export interface RawIntervalDef extends Omit<IntervalDef, 'durationSecs'> {
  durationSecs?: number;
  durationPercent?: number;
}

/**
 * Normalize intervals: convert durationPercent to durationSecs
 * @param intervals Raw intervals (may have durationPercent)
 * @param totalDurationMinutes Total workout duration (for percent calculation)
 * @returns Normalized intervals with durationSecs always defined
 * 
 * EXPORTED: Used in testing and integration
 */
export function normalizeIntervals(intervals: (IntervalDef | RawIntervalDef)[], totalDurationMinutes: number): IntervalDef[] {
  const totalSecs = totalDurationMinutes * 60;
  
  return intervals.map(interval => {
    // If already has durationSecs, use it
    if ('durationSecs' in interval && (interval as any).durationSecs !== undefined) {
      return interval as IntervalDef;
    }
    
    // If has durationPercent, convert to durationSecs
    if ('durationPercent' in interval && (interval as any).durationPercent !== undefined) {
      return {
        ...interval,
        durationSecs: Math.round(((interval as any).durationPercent / 100) * totalSecs)
      } as IntervalDef;
    }
    
    // Fallback (shouldn't happen)
    return {
      ...interval,
      durationSecs: 600  // Default to 10 minutes
    } as IntervalDef;
  });
}

/**
 * ISSUE #10 FIX: Rescale intervals proportionally if session duration changes
 * Used when fixSessionDuration changes the duration from what intervals were normalized to
 */
function rescaleIntervals(intervals: IntervalDef[], originalDurationMinutes: number, newDurationMinutes: number): IntervalDef[] {
  if (originalDurationMinutes === newDurationMinutes || originalDurationMinutes === 0) {
    return intervals; // No rescaling needed
  }
  
  // Calculate scale factor
  const scaleFactor = newDurationMinutes / originalDurationMinutes;
  
  return intervals.map(interval => ({
    ...interval,
    durationSecs: Math.round(interval.durationSecs * scaleFactor)
  }));
}

export type WorkoutStructure = "steady" | "pyramid" | "ladder" | "micro" | "descend" | "twitchy" | "mixed";
export type CadenceProfile = "low" | "normal" | "high" | "mixed";

export interface SessionDef {
  dayOfWeek: DayOfWeek;
  sessionType: "INDOOR" | "OUTDOOR";
  duration: number; // minutes
  title: string;
  description: string;
  purpose?: string; // The main purpose of this session (e.g., "Gradually raise heart rate and muscle temperature")
  intervals: IntervalDef[];
  route?: RouteData;
  
  // NEW: Periodization & Intensity Factors (Option B)
  intensityFactor?: number; // IF as % (e.g., 0.85 = 85% FTP)
  userTargetDuration?: number; // User's selected baseline duration (anchor point)
  periodizationWeekType?: WeekType; // Which week type this is from
  
  // NEW: Variety tracking fields
  structure?: WorkoutStructure;
  cadenceProfile?: CadenceProfile;
  themeCategory?: string;
  psychologicalMessage?: string;
  previousWeekStructure?: WorkoutStructure;
  templateId?: string; // For tracking which template was used (avoids repetition)
}

export interface WeekDef {
  weekNumber: number;
  weekType: WeekType;
  sessions: SessionDef[];
}

export interface BlockDef {
  blockNumber: number;
  type: BlockType;
  weeks: WeekDef[];
}

export interface PlanDef {
  blocks: BlockDef[];
}

const BLOCK_SEQUENCE: BlockType[] = ["BASE", "THRESHOLD", "VO2MAX", "RACE_SIM"];
const WEEK_SEQUENCE: WeekType[] = ["BUILD", "BUILD_PLUS", "OVERREACH", "RECOVERY"];

// ─── PHASE 1: Workout Structure Variety Matrix ──────────────────────

/**
 * Available workout structures for each energy zone
 * Prevents repetitive session feeling by varying interval patterns
 */
const STRUCTURES_BY_ZONE: Record<string, WorkoutStructure[]> = {
  // Recovery/Base (Z1-Z2)
  "BASE": ["steady", "mixed", "steady", "steady", "mixed"],
  
  // Sweet Spot/Threshold (Z3)
  "THRESHOLD": ["steady", "pyramid", "ladder", "micro", "descend"],
  
  // VO2 Max (Z4)
  "VO2MAX": ["steady", "pyramid", "twitchy", "descend", "ladder"],
  
  // Anaerobic (Z5-Z6)
  "ANAEROBIC": ["steady", "twitchy", "descend", "mixed", "ladder"],
};

/**
 * Cadence profiles by week in block
 * Week 1: Normal (baseline)
 * Week 2: Low (strength emphasis)
 * Week 3: High (efficiency emphasis)
 * Week 4: Mixed (varied within session)
 */
const CADENCE_SCHEDULE_BY_WEEK: Record<number, CadenceProfile> = {
  1: "normal",
  2: "low",
  3: "high",
  4: "mixed",
};

/**
 * Psychological themes by block type
 * Creates narrative around each block
 */
const BLOCK_THEMES: Record<BlockType, string> = {
  "BASE": "Foundation Building",
  "THRESHOLD": "Attack & Respond",
  "VO2MAX": "Race Preparation",
  "RACE_SIM": "Championship Mode",
};

/**
 * PHASE 4: Seasonal Themes
 * Customize block themes based on training season
 */
export type Season = "winter" | "spring" | "summer" | "fall";

const SEASONAL_BLOCK_THEMES: Record<Season, Record<BlockType, string>> = {
  "winter": {
    "BASE": "Winter Base Building",
    "THRESHOLD": "Indoor Power",
    "VO2MAX": "Peak Indoor Preparation",
    "RACE_SIM": "Indoor Championship",
  },
  "spring": {
    "BASE": "Spring Awakening",
    "THRESHOLD": "Attack Training",
    "VO2MAX": "Spring Racing Prep",
    "RACE_SIM": "Spring Classics Mode",
  },
  "summer": {
    "BASE": "Summer Endurance",
    "THRESHOLD": "Heat Adaptation",
    "VO2MAX": "Summer Peak",
    "RACE_SIM": "Grand Tour Training",
  },
  "fall": {
    "BASE": "Fall Base",
    "THRESHOLD": "Fall Fitness",
    "VO2MAX": "Fall Peak",
    "RACE_SIM": "Fall Championship",
  },
};

/**
 * PHASE 4: Race-Specific Templates
 * Customize plan based on goal race
 */
export interface RaceTemplate {
  name: string;
  blockTypes: BlockType[];
  focusZones: string[];
  peakWeek: number;
  taper: number; // weeks
  description: string;
}

const RACE_TEMPLATES: Record<string, RaceTemplate> = {
  "criterium": {
    name: "Criterium Racing",
    blockTypes: ["BASE", "THRESHOLD", "VO2MAX", "RACE_SIM"],
    focusZones: ["Z4", "Z5", "Z6"],
    peakWeek: 16,
    taper: 1,
    description: "High cadence, short power, repeated efforts",
  },
  "road_race": {
    name: "Road Race",
    blockTypes: ["BASE", "THRESHOLD", "VO2MAX", "RACE_SIM"],
    focusZones: ["Z3", "Z4", "Z5"],
    peakWeek: 16,
    taper: 1,
    description: "Sustained power, tactical awareness, group dynamics",
  },
  "gran_fondo": {
    name: "Gran Fondo / Century Ride",
    blockTypes: ["BASE", "THRESHOLD", "RACE_SIM"],
    focusZones: ["Z1", "Z2", "Z3"],
    peakWeek: 20,
    taper: 2,
    description: "Long endurance, pacing strategy, fueling",
  },
  "mtb_xc": {
    name: "MTB Cross-Country",
    blockTypes: ["BASE", "VO2MAX", "RACE_SIM"],
    focusZones: ["Z2", "Z3", "Z4"],
    peakWeek: 16,
    taper: 1,
    description: "Technical climbing, varied terrain, short bursts",
  },
};

/**
 * Psychological messages that explain the "why" behind each structure
 * Motivates riders by connecting workout to broader goal
 */
const PSYCHOLOGY_MESSAGES: Record<string, Record<WorkoutStructure, string>> = {
  "Foundation Building": {
    steady: "Build your aerobic base. Consistency over intensity.",
    pyramid: "Gentle progression. Test your rhythm.",
    ladder: "Varied paces. Find your sweet spot.",
    micro: "High volume, easy effort. Accumulate time.",
    descend: "Descending power. Practice pacing.",
    twitchy: "Light tactical work. Recovery mode.",
    mixed: "Mix of efforts. Stay adaptable.",
  },
  "Attack & Respond": {
    steady: "Sustained threshold. Build metabolic fitness.",
    pyramid: "Attack simulation. Climb & respond.",
    ladder: "Varied duration. Prevent adaptation staleness.",
    micro: "Tactical repeats. High frequency learning.",
    descend: "Controlled power. Practice finishing strong.",
    twitchy: "Short bursts. Neuromuscular recruitment.",
    mixed: "Mixed efforts. Race-like variability.",
  },
  "Race Preparation": {
    steady: "High intensity repeats. Build VO2 capacity.",
    pyramid: "Escalating power. Climb attack training.",
    ladder: "Varied repeats. Tactical variety.",
    micro: "Punchy repeats. Short power work.",
    descend: "Descending efforts. Practice pacing.",
    twitchy: "40sec efforts. Anaerobic threshold training.",
    mixed: "Race simulation. Mixed intensity efforts.",
  },
  "Championship Mode": {
    steady: "Race-specific fitness. Peak performance.",
    pyramid: "Final push. Test your limits.",
    ladder: "Competition simulation. Varied attacks.",
    micro: "High intensity. Championship-level effort.",
    descend: "Controlled power. Execute when ready.",
    twitchy: "Final power test. Sprint preparation.",
    mixed: "Full race simulation. Everything you've trained.",
  },
};

/**
 * Technical thematic workout titles
 * Clear what the workout IS + technical description of structure
 * Prevents repetition while staying logical and descriptive
 */
const THEMATIC_TITLES: Record<string, Record<WorkoutStructure, string>> = {
  "Foundation Building": {
    steady: "Base Steady-State",
    pyramid: "Base Pyramid",
    ladder: "Base Ladder",
    micro: "Base Micro-Intervals",
    descend: "Base Descending",
    twitchy: "Base Tactical",
    mixed: "Base Mixed",
  },
  "Attack & Respond": {
    steady: "Threshold Steady-State",
    pyramid: "Threshold Pyramid",
    ladder: "Threshold Ladder",
    micro: "Threshold Micro-Intervals",
    descend: "Threshold Descending",
    twitchy: "Threshold Twitchy",
    mixed: "Threshold Mixed",
  },
  "Race Preparation": {
    steady: "VO2 Max Steady",
    pyramid: "VO2 Max Pyramid",
    ladder: "VO2 Max Ladder",
    micro: "VO2 Max Repeats",
    descend: "VO2 Max Descending",
    twitchy: "VO2 Max Short",
    mixed: "VO2 Max Mixed",
  },
  "Championship Mode": {
    steady: "Anaerobic Steady",
    pyramid: "Anaerobic Pyramid",
    ladder: "Anaerobic Ladder",
    micro: "Anaerobic Repeats",
    descend: "Anaerobic Descending",
    twitchy: "Anaerobic Twitchy",
    mixed: "Anaerobic Mixed",
  },
};

// ─── PHASE 2: Helper Functions for Variety ─────────────────────────

/**
 * Select a workout structure that avoids repetition from last week
 * Uses randomness within valid options
 */
function selectWorkoutStructure(
  zoneCategory: string,
  previousStructure?: WorkoutStructure
): WorkoutStructure {
  const availableStructures = STRUCTURES_BY_ZONE[zoneCategory] || ["steady"];
  
  // Filter out last week's structure if provided
  let validStructures = availableStructures;
  if (previousStructure) {
    validStructures = availableStructures.filter(s => s !== previousStructure);
  }
  
  // Pick randomly from valid structures
  return validStructures[Math.floor(Math.random() * validStructures.length)];
}

/**
 * Get cadence profile based on week number (1-4 in block)
 */
function getCadenceProfile(weekInBlock: number): CadenceProfile {
  return CADENCE_SCHEDULE_BY_WEEK[weekInBlock] || "normal";
}

/**
 * Get psychological message for a workout
 */
function getPsychologicalMessage(
  blockTheme: string,
  structure: WorkoutStructure
): string {
  return PSYCHOLOGY_MESSAGES[blockTheme]?.[structure] || "Time to work.";
}

/**
 * Get thematic title for a workout
 */
function getThematicTitle(
  blockTheme: string,
  structure: WorkoutStructure
): string {
  return THEMATIC_TITLES[blockTheme]?.[structure] || "Workout";
}

/**
 * PHASE 4: Get seasonal theme for a block
 */
function getSeasonalBlockTheme(blockType: BlockType, season?: Season): string {
  if (!season) return BLOCK_THEMES[blockType];
  return SEASONAL_BLOCK_THEMES[season]?.[blockType] || BLOCK_THEMES[blockType];
}

/**
 * PHASE 4: AI-Powered Workout Naming Hook
 * Framework for Claude API integration to generate creative names
 * Can be async in future implementation
 */
export async function generateAIWorkoutName(
  baseTitle: string,
  psychMessage: string,
  structure: WorkoutStructure,
  _useAI: boolean = false
): Promise<string> {
  // Future: call Claude API for creative naming
  // For now, use template-based naming
  if (_useAI) {
    // Placeholder for Claude API call
    // const response = await claude.messages.create({
    //   model: "claude-opus-4-6",
    //   max_tokens: 50,
    //   messages: [{
    //     role: "user",
    //     content: `Generate a creative 2-3 word cycling workout name for: ${baseTitle}. Keep it punchy and motivational.`
    //   }]
    // });
    // return response.content[0].text;
  }
  return baseTitle;
}

/**
 * PHASE 4: Get race-specific focus zones
 */
function getRaceFocusZones(raceType?: string): string[] {
  if (!raceType) return ["Z1", "Z2", "Z3", "Z4"];
  return RACE_TEMPLATES[raceType]?.focusZones || ["Z1", "Z2", "Z3", "Z4"];
}

/**
 * PHASE 2: Apply variety enhancement to a generated session
 * Adds structure, cadence, theme, and psychology
 */
function applyVarietyToSession(
  session: SessionDef,
  blockType: BlockType,
  blockTheme: string,
  weekInBlock: number,
  previousStructure?: WorkoutStructure
): SessionDef {
  // Determine zone category from session
  let zoneCategory = "BASE";
  if (session.intervals.length > 0) {
    const mainZone = session.intervals[0].zone;
    if (mainZone === "Z3") zoneCategory = "THRESHOLD";
    else if (mainZone === "Z4") zoneCategory = "VO2MAX";
    else if (mainZone === "Z5" || mainZone === "Z6") zoneCategory = "ANAEROBIC";
  }
  
  // Skip variety for rest days and outdoor sessions
  if (session.title === "Rest Day" || session.sessionType === "OUTDOOR") {
    return session;
  }
  
  // Select workout structure avoiding repetition
  const structure = selectWorkoutStructure(zoneCategory, previousStructure);
  const cadenceProfile = getCadenceProfile(weekInBlock);
  const psychMessage = getPsychologicalMessage(blockTheme, structure);
  const technicalTitle = getThematicTitle(blockTheme, structure);
  
  // PHASE 3: Logging for testing & verification
  if (typeof window === "undefined") { // Only log server-side
    console.log(`[PlanVariety] ${session.dayOfWeek} | Zone: ${zoneCategory} | Structure: ${structure} | Cadence: ${cadenceProfile} | Title: ${technicalTitle}`);
  }
  
  // KEEP ORIGINAL SIMPLE TITLES: "Threshold Workout", "VO2 Max", etc.
  // Variety comes from different interval structures, not titles
  return {
    ...session,
    structure,
    cadenceProfile,
    themeCategory: blockTheme,
    psychologicalMessage: psychMessage,
    previousWeekStructure: previousStructure,
  };
}

// ─── Interval Templates ─────────────────────────────────────────────

function warmup(): IntervalDef {
  return {
    name: "Warmup", durationSecs: 600, powerLow: 40, powerHigh: 55,
    cadenceLow: 85, cadenceHigh: 95, rpe: 2, zone: "Z1",
    purpose: "Gradually raise heart rate and muscle temperature",
    coachNote: getCoachNote("warmup"),
  };
}

function cooldown(): IntervalDef {
  return {
    name: "Cooldown", durationSecs: 300, powerLow: 30, powerHigh: 50,
    cadenceLow: 80, cadenceHigh: 90, rpe: 1, zone: "Z1",
    purpose: "Flush metabolic waste, begin recovery process",
    coachNote: getCoachNote("cooldown"),
  };
}

function interval(
  name: string, secs: number, low: number, high: number,
  purpose: string, type: "endurance" | "sweetspot" | "tempo" | "threshold" | "vo2max" | "anaerobic" | "sprint" | "cadence" | "recovery",
  opts?: { cadenceLow?: number; cadenceHigh?: number; rpe?: number }
): IntervalDef {
  return {
    name, durationSecs: secs, powerLow: low, powerHigh: high,
    cadenceLow: opts?.cadenceLow, cadenceHigh: opts?.cadenceHigh,
    rpe: opts?.rpe ?? 5, zone: getZoneForPower((low + high) / 2),
    purpose, coachNote: getCoachNote(type),
  };
}

function restInterval(secs: number): IntervalDef {
  return {
    name: "Rest", durationSecs: secs, powerLow: 30, powerHigh: 45,
    cadenceLow: 75, cadenceHigh: 85, rpe: 1, zone: "Z1",
    purpose: "Active recovery between efforts",
    coachNote: "Spin easy. Let the legs flush. Next one's coming.",
  };
}

// ─── Session Purpose Helper ─────────────────────────────────────────

function getPurposeFromTitle(title: string, blockType?: BlockType): string {
  const lower = title.toLowerCase();
  
  // Warmup/cooldown
  if (lower.includes("warmup") || lower.includes("warm up")) return "Gradually raise heart rate and muscle temperature";
  if (lower.includes("cooldown") || lower.includes("cool down")) return "Flush metabolic waste and begin recovery process";
  
  // Endurance
  if (lower.includes("endurance")) return "Build aerobic base and improve fat oxidation capacity";
  if (lower.includes("tempo")) return "Build muscular endurance and lactate clearance";
  if (lower.includes("sweet spot")) return "Build sustained power at high aerobic intensity with minimal recovery demand";
  
  // Threshold
  if (lower.includes("threshold")) return "Improve lactate threshold and train near race-pace intensity";
  if (lower.includes("threshold repeats")) return "Develop repeatable threshold efforts with managed recovery";
  
  // VO2Max
  if (lower.includes("vo2") || lower.includes("v02") || lower.includes("vo²max")) return "Improve maximum oxygen uptake and aerobic power";
  if (lower.includes("vo2 repeats")) return "Build VO₂ max capacity through intense interval work";
  
  // Sprint
  if (lower.includes("sprint")) return "Develop explosive power and neuromuscular coordination";
  
  // Cadence
  if (lower.includes("cadence")) return "Improve pedaling efficiency and neuromuscular efficiency";
  
  // Recovery
  if (lower.includes("recovery")) return "Active recovery to flush metabolic byproducts and aid adaptation";
  if (lower.includes("cruise")) return "Steady-state work to reinforce pacing and build steadiness";
  
  // Race sim
  if (lower.includes("race") || lower.includes("simulation")) return "Apply training efforts to racing scenarios and build race-specific fitness";
  
  // Outdoor
  if (lower.includes("outdoor") || lower.includes("road")) return "Apply indoor work to real-world conditions and reinforce training adaptations";
  
  // Default based on block type
  if (blockType === "BASE") return "Build aerobic foundation and develop cycling economy";
  if (blockType === "THRESHOLD") return "Develop lactate threshold and sustainable pace";
  if (blockType === "VO2MAX") return "Improve maximum aerobic power and oxygen utilization";
  if (blockType === "RACE_SIM") return "Practice race pacing and tactical execution";
  
  return "Apply structured training stimulus to develop fitness";
}

// ─── SESSION TEMPLATES DATABASE ──────────────────────────────────────
// Real variety through different interval structures, not just naming
// Each template has unique structure while maintaining energy zone

export interface SessionTemplate {
  name: string;
  zone: string;
  structure: WorkoutStructure;
  repsCount: number;
  repDuration: number; // seconds for main efforts
  recoveryDuration: number; // seconds between reps
  description: string;
  intervalBuilder: (weekType: WeekType) => IntervalDef[];
}

// Base Zone Templates (Z1-Z2: 56-70% FTP)
const BASE_TEMPLATES: SessionTemplate[] = [
  {
    name: "Base Steady-State",
    zone: "BASE",
    structure: "steady",
    repsCount: 1,
    repDuration: 1800,
    recoveryDuration: 0,
    description: "Long steady aerobic work to build base and fat oxidation",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 1 : 1;
      const dur = weekType === "RECOVERY" ? 1800 : 2400;
      return [
        warmup(),
        interval("Z2 Steady", dur, 56, 70, "Long aerobic effort — build base and fat oxidation capacity", "endurance", { rpe: 3 }),
        cooldown(),
      ];
    }
  },
  {
    name: "Base Pyramid",
    zone: "BASE",
    structure: "pyramid",
    repsCount: 3,
    repDuration: 600,
    recoveryDuration: 300,
    description: "Progressive intensity: 5min, 8min, 5min with recovery between",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Z2 Pyramid Start", 300, 56, 70, "Begin pyramid build", "endurance", { rpe: 3 }),
      restInterval(180),
      interval("Z2 Pyramid Mid", 480, 60, 75, "Sustain effort — middle of the pyramid", "endurance", { rpe: 4 }),
      restInterval(180),
      interval("Z2 Pyramid End", 300, 56, 70, "Return to base intensity", "endurance", { rpe: 3 }),
      cooldown(),
    ]
  },
  {
    name: "Base Ladder",
    zone: "BASE",
    structure: "ladder",
    repsCount: 4,
    repDuration: 300,
    recoveryDuration: 120,
    description: "Ascending ladder: 3min, 4min, 5min, 6min efforts with short recovery",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Z2 Ladder 1", 180, 56, 70, "3 minute effort", "endurance", { rpe: 3 }),
      restInterval(120),
      interval("Z2 Ladder 2", 240, 58, 72, "4 minute effort — building", "endurance", { rpe: 3 }),
      restInterval(120),
      interval("Z2 Ladder 3", 300, 60, 75, "5 minute effort — climb", "endurance", { rpe: 4 }),
      restInterval(120),
      interval("Z2 Ladder 4", 360, 62, 77, "6 minute effort — top of ladder", "endurance", { rpe: 4 }),
      cooldown(),
    ]
  },
  {
    name: "Base Tempo Pickups",
    zone: "BASE",
    structure: "mixed",
    repsCount: 3,
    repDuration: 180,
    recoveryDuration: 480,
    description: "Long Z2 base with 3-minute tempo pickups to teach pace changes",
    intervalBuilder: (weekType) => {
      const mult = weekType === "RECOVERY" ? 0.85 : 1;
      return [
        warmup(),
        interval("Z2 Base", 600, 56, 70, "Steady aerobic base", "endurance", { rpe: 3 }),
        interval("Tempo Pickup", Math.round(180 * mult), 76, 85, "Teach the body to handle pace changes", "tempo", { rpe: 5 }),
        interval("Z2 Base", 480, 56, 70, "Return to base intensity", "endurance", { rpe: 3 }),
        interval("Tempo Pickup", Math.round(180 * mult), 76, 85, "Second surge — building repeatability", "tempo", { rpe: 5 }),
        interval("Z2 Base", 480, 56, 70, "Settle back to steady", "endurance", { rpe: 3 }),
        interval("Tempo Pickup", Math.round(180 * mult), 76, 85, "Final surge — finish strong", "tempo", { rpe: 6 }),
        cooldown(),
      ];
    }
  },
  {
    name: "Base Sweet Spot Mix",
    zone: "BASE",
    structure: "mixed",
    repsCount: 2,
    repDuration: 900,
    recoveryDuration: 300,
    description: "Alternating Z2 endurance and Z3 sweet spot blocks",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 1 : 2;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Sweet Spot #${i + 1}`, 900, 88, 93, "Build sustained power at high aerobic intensity", "sweetspot", { rpe: 7 }),
          ...(i < reps - 1 ? [restInterval(300)] : []),
        ]).flat(),
        cooldown(),
      ];
    }
  }
];

// Threshold Zone Templates (Z3: 85-100% FTP)
const THRESHOLD_TEMPLATES: SessionTemplate[] = [
  {
    name: "Threshold Steady-State",
    zone: "THRESHOLD",
    structure: "steady",
    repsCount: 1,
    repDuration: 1200,
    recoveryDuration: 0,
    description: "Single long threshold block. Raise FTP ceiling with sustained effort.",
    intervalBuilder: (weekType) => {
      const dur = weekType === "RECOVERY" ? 600 : 1200;
      return [
        warmup(),
        interval("Threshold Block", dur, 95, 100, "Sustained work at FTP — the gold standard", "threshold", { rpe: 8 }),
        cooldown(),
      ];
    }
  },
  {
    name: "Threshold Pyramid",
    zone: "THRESHOLD",
    structure: "pyramid",
    repsCount: 3,
    repDuration: 600,
    recoveryDuration: 300,
    description: "Build & descend: 5min, 8min, 5min threshold with structured recovery",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Threshold Pyramid Start", 300, 92, 98, "Begin threshold pyramid", "threshold", { rpe: 7 }),
      restInterval(300),
      interval("Threshold Pyramid Peak", 480, 95, 100, "Peak of the pyramid — sustained threshold", "threshold", { rpe: 8 }),
      restInterval(300),
      interval("Threshold Pyramid End", 300, 92, 98, "Descend back down", "threshold", { rpe: 7 }),
      cooldown(),
    ]
  },
  {
    name: "Threshold Ladder",
    zone: "THRESHOLD",
    structure: "ladder",
    repsCount: 4,
    repDuration: 600,
    recoveryDuration: 180,
    description: "Ascending threshold ladder: 5min, 6min, 7min, 8min with short recovery",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Threshold Ladder 1", 300, 92, 98, "5 minute threshold effort", "threshold", { rpe: 7 }),
      restInterval(180),
      interval("Threshold Ladder 2", 360, 93, 99, "6 minute — sustain effort", "threshold", { rpe: 7 }),
      restInterval(180),
      interval("Threshold Ladder 3", 420, 94, 100, "7 minute — push harder", "threshold", { rpe: 8 }),
      restInterval(180),
      interval("Threshold Ladder 4", 480, 95, 100, "8 minute peak — hold strong", "threshold", { rpe: 8 }),
      cooldown(),
    ]
  },
  {
    name: "Threshold Micro-Intervals",
    zone: "THRESHOLD",
    structure: "micro",
    repsCount: 8,
    repDuration: 120,
    recoveryDuration: 60,
    description: "Many short threshold efforts: 2min on, 1min off. Tactical learning.",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 4 : 6;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Threshold Micro #${i + 1}`, 120, 95, 100, "Short sharp threshold effort", "threshold", { rpe: 8 }),
          restInterval(60),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "Threshold Descending",
    zone: "THRESHOLD",
    structure: "descend",
    repsCount: 3,
    repDuration: 900,
    recoveryDuration: 300,
    description: "Start hard, finish harder: 9min, 8min, 7min at increasing intensity",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Descending Block 1", 540, 92, 98, "Start at threshold", "threshold", { rpe: 7 }),
      restInterval(300),
      interval("Descending Block 2", 480, 94, 99, "Hold intensity as fatigue builds", "threshold", { rpe: 8 }),
      restInterval(300),
      interval("Descending Block 3", 420, 96, 100, "Final push — finish strong", "threshold", { rpe: 8 }),
      cooldown(),
    ]
  }
];

// VO2 Max Zone Templates (Z4: 105-120% FTP)
const VO2MAX_TEMPLATES: SessionTemplate[] = [
  {
    name: "VO2 Max Steady",
    zone: "VO2MAX",
    structure: "steady",
    repsCount: 5,
    repDuration: 180,
    recoveryDuration: 180,
    description: "Classic VO2max intervals: 3min hard, 3min recovery. Expand your aerobic ceiling.",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 3 : 5;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`VO2max #${i + 1}`, 180, 115, 120, "Peak oxygen uptake effort", "vo2max", { rpe: 9 }),
          restInterval(180),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "VO2 Max Pyramid",
    zone: "VO2MAX",
    structure: "pyramid",
    repsCount: 4,
    repDuration: 240,
    recoveryDuration: 180,
    description: "Build VO2 capacity: 2min, 4min, 3min, 2min with equal recovery",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("VO2 Pyramid 1", 120, 115, 120, "Quick start — 2 minutes", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("VO2 Pyramid Peak", 240, 110, 120, "Peak of effort — 4 minutes", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("VO2 Pyramid 3", 180, 115, 120, "Sustain — 3 minutes", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("VO2 Pyramid 4", 120, 115, 120, "Finish — 2 minutes", "vo2max", { rpe: 9 }),
      cooldown(),
    ]
  },
  {
    name: "VO2 Max Short Repeats",
    zone: "VO2MAX",
    structure: "twitchy",
    repsCount: 8,
    repDuration: 120,
    recoveryDuration: 120,
    description: "Punchy repeats: 2min hard, 2min easy. High frequency, high stimulus.",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 4 : weekType === "OVERREACH" ? 10 : 6;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Repeat #${i + 1}`, 120, 115, 130, "Short sharp VO2max effort", "vo2max", { rpe: 9 }),
          restInterval(120),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "VO2 Max Mixed",
    zone: "VO2MAX",
    structure: "mixed",
    repsCount: 6,
    repDuration: 240,
    recoveryDuration: 120,
    description: "Varied VO2max: 3min steady + 1min high + 2min recovery, repeated",
    intervalBuilder: (weekType) => {
      const sets = weekType === "RECOVERY" ? 2 : 3;
      return [
        warmup(),
        ...Array.from({ length: sets }, (_, s) => [
          interval(`VO2 Mixed Set ${s + 1} - Steady`, 180, 110, 115, "VO2max steady effort", "vo2max", { rpe: 8 }),
          interval(`VO2 Mixed Set ${s + 1} - Surge`, 60, 125, 135, "Brief surge within effort", "anaerobic", { rpe: 9 }),
          restInterval(120),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "VO2 Max Descending",
    zone: "VO2MAX",
    structure: "descend",
    repsCount: 4,
    repDuration: 240,
    recoveryDuration: 180,
    description: "Descending duration: 5min, 4min, 3min, 2min — maintain intensity as recovery shrinks",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Descend Block 1", 300, 110, 118, "5 minute VO2max effort", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("Descend Block 2", 240, 112, 120, "4 minute — intensity rising", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("Descend Block 3", 180, 115, 122, "3 minute — push harder", "vo2max", { rpe: 9 }),
      restInterval(180),
      interval("Descend Block 4", 120, 118, 125, "2 minute — all-in finish", "vo2max", { rpe: 10 }),
      cooldown(),
    ]
  }
];

// Anaerobic Zone Templates (Z5-Z6: 130%+ FTP)
const ANAEROBIC_TEMPLATES: SessionTemplate[] = [
  {
    name: "Anaerobic Repeats",
    zone: "ANAEROBIC",
    structure: "steady",
    repsCount: 6,
    repDuration: 120,
    recoveryDuration: 180,
    description: "Short hard repeats: 2min all-out, 3min recovery. Build peak power.",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 3 : weekType === "OVERREACH" ? 8 : 5;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Anaerobic #${i + 1}`, 120, 130, 150, "All-out sprint effort", "anaerobic", { rpe: 9 }),
          restInterval(180),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "Anaerobic Twitchy",
    zone: "ANAEROBIC",
    structure: "twitchy",
    repsCount: 10,
    repDuration: 60,
    recoveryDuration: 90,
    description: "Ultra-short efforts: 1min bursts, 1.5min recovery. Neuromuscular overload.",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 4 : weekType === "OVERREACH" ? 10 : 6;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Burst #${i + 1}`, 60, 135, 160, "Explosive short burst", "anaerobic", { rpe: 9 }),
          restInterval(90),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "Anaerobic Hill Repeats",
    zone: "ANAEROBIC",
    structure: "mixed",
    repsCount: 5,
    repDuration: 180,
    recoveryDuration: 240,
    description: "Simulated hill efforts: 3min strong climb efforts at low cadence",
    intervalBuilder: (weekType) => {
      const reps = weekType === "RECOVERY" ? 3 : 5;
      return [
        warmup(),
        ...Array.from({ length: reps }, (_, i) => [
          interval(`Hill #${i + 1}`, 180, 120, 140, "Hill climbing effort — low cadence strength", "anaerobic", { rpe: 8, cadenceLow: 60, cadenceHigh: 75 }),
          restInterval(240),
        ]).flat(),
        cooldown(),
      ];
    }
  },
  {
    name: "Anaerobic Ladder",
    zone: "ANAEROBIC",
    structure: "ladder",
    repsCount: 4,
    repDuration: 120,
    recoveryDuration: 120,
    description: "Ascending power: 1min, 2min, 3min, 2min at maximum power output",
    intervalBuilder: (weekType) => [
      warmup(),
      interval("Ladder 1", 60, 130, 155, "1 minute all-out", "anaerobic", { rpe: 9 }),
      restInterval(120),
      interval("Ladder 2", 120, 132, 157, "2 minute sustained power", "anaerobic", { rpe: 9 }),
      restInterval(120),
      interval("Ladder 3", 180, 135, 160, "3 minute peak effort", "anaerobic", { rpe: 10 }),
      restInterval(120),
      interval("Ladder 4", 120, 140, 165, "2 minute final push", "anaerobic", { rpe: 10 }),
      cooldown(),
    ]
  },
  {
    name: "Anaerobic Mixed",
    zone: "ANAEROBIC",
    structure: "mixed",
    repsCount: 6,
    repDuration: 120,
    recoveryDuration: 120,
    description: "Varied anaerobic: mix of 30sec sprints, 2min efforts, and recovery",
    intervalBuilder: (weekType) => {
      const sets = weekType === "RECOVERY" ? 2 : 3;
      return [
        warmup(),
        ...Array.from({ length: sets }, (_, s) => [
          interval(`Set ${s + 1} - Sprint`, 30, 150, 170, "30 second all-out sprint", "sprint", { rpe: 10 }),
          interval(`Set ${s + 1} - Sustain`, 120, 125, 145, "2 minute sustained hard effort", "anaerobic", { rpe: 8 }),
          restInterval(120),
        ]).flat(),
        cooldown(),
      ];
    }
  }
];

// Combine all templates by zone
const SESSION_TEMPLATES_BY_ZONE: Record<string, SessionTemplate[]> = {
  "BASE": BASE_TEMPLATES,
  "THRESHOLD": THRESHOLD_TEMPLATES,
  "VO2MAX": VO2MAX_TEMPLATES,
  "ANAEROBIC": ANAEROBIC_TEMPLATES,
};

/**
 * Select a random template for a zone, avoiding the previous week's template
 */
function selectSessionTemplate(
  zone: string,
  previousTemplate?: SessionTemplate
): SessionTemplate {
  const templates = SESSION_TEMPLATES_BY_ZONE[zone] || SESSION_TEMPLATES_BY_ZONE["BASE"];
  
  // Filter out last week's template if provided
  let validTemplates = templates;
  if (previousTemplate) {
    validTemplates = templates.filter(t => t.name !== previousTemplate.name);
  }
  
  // If we filtered out everything (unlikely), use all
  if (validTemplates.length === 0) validTemplates = templates;
  
  // Pick randomly from valid templates
  return validTemplates[Math.floor(Math.random() * validTemplates.length)];
}

// ─── BASE Block Sessions ─────────────────────────────────────────────

function baseMonday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: "Base Workout",
    description: "Build aerobic foundation with varied intensity structure.",
    purpose: "Build aerobic base and teach the body to handle pace changes",
    intervals: [],
  };
}

function baseTuesday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: "Base Workout",
    description: "Sweet spot and sustained base-zone work.",
    purpose: "Build sustained power at high aerobic intensity with minimal recovery demand",
    intervals: [],
  };
}

function baseThursday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: "Base Workout",
    description: "Tempo and muscular endurance work in the base zone.",
    purpose: "Build muscular endurance and improve lactate clearance capacity",
    intervals: [],
  };
}

function baseFriday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 55,
    title: "Base Workout",
    description: "Lighter base work with technical focus.",
    purpose: "Improve pedaling efficiency and prepare for Saturday's long ride",
    intervals: [],
  };
}

// ─── THRESHOLD Block Sessions ────────────────────────────────────────

function thresholdMonday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: "Threshold Workout",
    description: "Work at threshold with varied structure to improve lactate clearance.",
    purpose: "Improve lactate clearance and train the body to recover while maintaining effort",
    intervals: [],
  };
}

function thresholdTuesday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: "Threshold Workout",
    description: "Sustained threshold work to raise FTP ceiling.",
    purpose: "Raise your FTP ceiling with sustained work at your current threshold",
    intervals: [],
  };
}

function thresholdThursday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: "Threshold Workout",
    description: "Repeated threshold efforts to build repeatability.",
    intervals: [],
  };
}

function thresholdFriday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 55,
    title: "Threshold Workout",
    description: "Light work with neuromuscular activation.",
    intervals: [],
  };
}

// ─── VO2MAX Block Sessions ───────────────────────────────────────────

function vo2Monday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: "VO2 Max Workout",
    description: "High-intensity intervals to expand your aerobic ceiling.",
    intervals: [],
  };
}

function vo2Tuesday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: "VO2 Max Workout",
    description: "Maximum aerobic stimulus with varied intensity structure.",
    intervals: [],
  };
}

function vo2Thursday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: "VO2 Max Workout",
    description: "Extended VO2max intervals to build aerobic power.",
    intervals: [],
  };
}

function vo2Friday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 50,
    title: "VO2 Max Workout",
    description: "Light recovery work with neuromuscular activation.",
    intervals: [],
  };
}

// ─── RACE SIM Block Sessions ─────────────────────────────────────────

function raceSimMonday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: "Anaerobic Workout",
    description: "Race-simulation work with attacks and surges.",
    intervals: [],
  };
}

function raceSimTuesday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: "Anaerobic Workout",
    description: "Climbing and sustained power repeats.",
    intervals: [],
  };
}

function raceSimThursday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: "Anaerobic Workout",
    description: "Mixed intensity race-simulation work.",
    intervals: [],
  };
}

function raceSimFriday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 50,
    title: "Anaerobic Workout",
    description: "Light work with neuromuscular activation before race day.",
    intervals: [],
  };
}

// ─── Saturday Outdoor Sessions ───────────────────────────────────────

function saturdayRide(weekType: WeekType, blockNum: number): SessionDef {
  const route = getRouteForWeek(weekType, blockNum);
  const dur = weekType === "RECOVERY" ? 240 : weekType === "OVERREACH" ? 330 : 270;
  return {
    dayOfWeek: "SAT", sessionType: "OUTDOOR", duration: dur,
    title: `Free Ride: ${route.name}`,
    description: route.description,
    route,
    intervals: [
      {
        name: "Free Ride", durationSecs: dur * 60,
        powerLow: 0, powerHigh: 0,
        zone: "MIXED", purpose: "Apply the week's indoor work to the road. Ride by feel, respect the route.",
        coachNote: getCoachNote("saturday"),
      },
    ],
  };
}

// ─── Dynamic Week Generator ──────────────────────────────────────────

function generateWeekSessions(
  blockType: BlockType, 
  weekType: WeekType, 
  blockNum: number,
  trainingDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], // All days are training days by default (Carlos requirement)
  outdoorDay: DayOfWeek = "SAT",
  blockTheme: string = "Foundation Building",
  weekInBlock: number = 1,
  previousStructures: Partial<Record<DayOfWeek, WorkoutStructure>> = {},
  previousTemplates: Partial<Record<DayOfWeek, WorkoutTemplate>> = {},
  userSeed?: string, // For per-user variation (Monday stays locked, other days can vary)
  targetDurationMinutes?: number, // USER'S REQUESTED SESSION DURATION (default for all days)
  targetSundayDurationMinutes?: number, // OPTIONAL: Different duration for Sunday
  targetFridayDurationMinutes: number = 50 // OPTIONAL: Different duration for Friday (default 50 min)
): SessionDef[] {
  // Generate full week sessions (7 days)
  const allDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const sessions: SessionDef[] = [];
  const usedThisWeekIds: string[] = []; // Track workouts used THIS WEEK for variety

  for (const day of allDays) {
    let session: SessionDef;
    
    // Determine what type of session this day should be
    if (!trainingDays.includes(day)) {
      // Rest day (not a training day)
      session = generateRestDay(day);
    } else if (day === outdoorDay) {
      // Outdoor day (usually longer ride) - is a training day
      session = generateOutdoorSession(weekType, blockNum, day);
    } else {
      // Indoor training day - use generation engine for duration-aware sessions
      // Use day-specific durations: Friday (50 min default) → Sunday → general target
      const dayDuration = (day === "FRI" && targetFridayDurationMinutes !== undefined) 
        ? targetFridayDurationMinutes
        : (day === "SUN" && targetSundayDurationMinutes !== undefined) 
          ? targetSundayDurationMinutes 
          : targetDurationMinutes;
      
      session = generateIndoorSession(
        blockType, 
        weekType, 
        day,
        weekInBlock,
        previousTemplates,
        userSeed,
        dayDuration, // Use day-specific duration
        usedThisWeekIds // Pass already-used workouts to avoid repeats THIS WEEK
      );
      
      // Track this workout's template ID for variety
      if (session.templateId) {
        usedThisWeekIds.push(session.templateId);
      }
    }
    
    sessions.push(session);
  }

  return sessions;
}

// ─── SESSION TEMPLATES DATABASE ──────────────────────────────────────
// Multiple variations per zone for REAL workout variety

export interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  purpose: string;
  zone?: string;
  duration: number;
  intervals: any[] | (() => any[]);  // Can be array or function
  
  // NEW: Classification fields for smart selection
  category: string;              // "BASE", "THRESHOLD", "VO2MAX", "ANAEROBIC", "SPRINT", "RECOVERY", etc.
  source?: string;               // "carlos", "zwift", "research-v1", "research-v2"
  protocol?: string;             // "Seiler 4x8", "Billat 30/30", "Coggan 2x20", etc.
  researcher?: string;           // "Seiler", "Billat", "Rønnestad", "Coggan", "Laursen"
  structure?: string;            // "repeats", "pyramid", "ladder", "steady", "mixed", "alternating"
  difficultyScore?: number;      // 1-10 (1=easy recovery, 10=max effort)
  difficulty?: number;           // Alternative name for difficulty (from JSON files)
  sportVariant?: string;         // "Road", "MTB", "Gravel", "Track", or undefined for all
  primaryZone?: string;          // "Z1", "Z2", "Z3", etc. (from JSON)
  tss?: number;                  // Training Stress Score (from JSON)
  scalable?: boolean;            // Whether workout can be scaled to different durations
}

// ─── HELPER FUNCTIONS (Phase 3 Refactoring) ──────────────────────────

/**
 * LOGIC BUG #2 FIX: Better difficulty filter with intelligent fallback
 * Ensures minimum difficulty is enforced even if exact range has no matches
 */
function filterByDifficulty(
  candidates: WorkoutTemplate[],
  minDifficulty: number,
  maxDifficulty: number
): WorkoutTemplate[] {
  // Try exact range first
  const exact = candidates.filter((w: WorkoutTemplate) => {
    const score = w.difficultyScore ?? w.difficulty ?? 5;
    return score >= minDifficulty && score <= maxDifficulty;
  });
  
  if (exact.length > 0) return exact;
  
  // If no exact match, at least enforce minimum difficulty
  const minEnforced = candidates.filter((w: WorkoutTemplate) => {
    const score = w.difficultyScore ?? w.difficulty ?? 5;
    return score >= minDifficulty;
  });
  return minEnforced.length > 0 ? minEnforced : candidates;
}

/**
 * TYPE ISSUE #2 FIX: Validate optional arrays before using .includes()
 */
function safeIncludes<T>(arr: T[] | undefined, item: T): boolean {
  return (arr || []).includes(item);
}

/**
 * ERROR MISSING #1 FIX: Validate input to fixSessionDuration
 */
function validateSessionInput(session: SessionDef | null, weekType: WeekType | undefined): boolean {
  if (!session) {
    console.error('[validateSessionInput] Session is null/undefined');
    return false;
  }
  if (!weekType) {
    console.error('[validateSessionInput] WeekType is null/undefined');
    return false;
  }
  if (typeof session.duration === 'number' && session.duration < 0) {
    console.error('[validateSessionInput] Duration is negative:', session.duration);
    return false;
  }
  return true;
}

// ─── SESSION SELECTION ───────────────────────────────────────────────

/**
 * Smart Workout Selection with Classification (STEP 3)
 * 
 * Filters by:
 * 1. CATEGORY (BASE, THRESHOLD, VO2MAX, RECOVERY, etc.) ← MOST IMPORTANT
 * 2. Week type (BUILD, OVERREACH, RECOVERY) → difficulty matching
 * 3. Sport variant (Road, MTB, Gravel, Track)
 * 4. Difficulty score (appropriate to training phase)
 * 5. Avoid repetition (exclude previous week's workout)
 */

// ISSUE #11 FIX: Category fallback mapping for when primary category has no workouts
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  "RECOVERY": ["BASE", "TECHNIQUE", "MIXED", "SWEET_SPOT"],     // RECOVERY → base/technique (only 3 RECOVERY exist)
  "RACE_SIM": ["ANAEROBIC", "VO2MAX", "THRESHOLD"],              // RACE_SIM → hard efforts (only 2 exist)
  "TECHNIQUE": ["BASE", "SWEET_SPOT", "MIXED"],                  // TECHNIQUE → easy + drills (5 exist)
  "FTP_TEST": ["BASE", "THRESHOLD", "VO2MAX"],                   // FTP_TEST → hard baseline (3 exist)
  "COMBO": ["MIXED", "SWEET_SPOT", "TEMPO"],                     // COMBO → mixed efforts (1 exists)
};

function selectWorkoutTemplate(
  category: string,               // "BASE", "THRESHOLD", "VO2MAX", etc.
  weekType?: WeekType,            // BUILD, BUILD_PLUS, OVERREACH, RECOVERY
  previousTemplateId?: string,    // Avoid using this again
  specialization?: string,        // "Road", "MTB", "Gravel", "Track"
  usedThisWeekIds: string[] = [] // Exclude workouts already used THIS WEEK
): WorkoutTemplate {
  
  // CRITICAL FIX: Only try to load workouts on server-side
  if (typeof window === 'undefined') {
    // Server-side: ensure workouts are loaded
    ensureWorkoutsLoaded();
  }
  
  let candidates = MASTER_WORKOUTS;
  
  // Debug logging
  if (candidates.length === 0) {
    console.error('[selectWorkoutTemplate] ERROR: MASTER_WORKOUTS is empty!', {
      category,
      weekType,
      specialization,
      masterWorkoutsLength: MASTER_WORKOUTS.length,
    });
  }
  
  // STEP 1: Filter by CATEGORY (most important)
  // ISSUE #11 FIX: Use smart fallback if category has insufficient workouts
  let categorySearch = category;
  candidates = candidates.filter(w => w.category === categorySearch);
  
  // If no workouts found, try fallback categories
  if (candidates.length === 0) {
    const fallbacks = CATEGORY_FALLBACKS[category] || [category];
    console.log(`[selectWorkoutTemplate] Category "${category}" has 0 workouts, trying fallbacks:`, fallbacks);
    
    for (const fallbackCategory of fallbacks) {
      candidates = MASTER_WORKOUTS.filter(w => w.category === fallbackCategory);
      if (candidates.length > 0) {
        console.log(`[selectWorkoutTemplate] Using fallback category "${fallbackCategory}" (${candidates.length} workouts)`);
        break;
      }
    }
  }
  
  // Final fallback: use BASE if nothing found
  if (candidates.length === 0) {
    console.warn(`[selectWorkoutTemplate] No workouts found for category "${category}" or fallbacks, using BASE`);
    candidates = MASTER_WORKOUTS.filter(w => w.category === "BASE");
  }
  
  // STEP 2: Filter by difficulty based on week type
  let difficultyCandidates = candidates;
  if (weekType) {
    let minDifficulty = 1;
    let maxDifficulty = 10;
    
    switch (weekType) {
      case "BUILD":
      case "BUILD_PLUS":
        minDifficulty = 3;  // Medium+
        maxDifficulty = 8;  // Not peak
        break;
      case "OVERREACH":
        minDifficulty = 8;  // Hard only
        maxDifficulty = 10; // Peak
        break;
      case "RECOVERY":
        minDifficulty = 1;  // Easy only
        maxDifficulty = 3;  // Very easy
        break;
    }
    
    // LOGIC BUG #2 FIX: Use better fallback logic with intelligent minimum enforcement
    candidates = filterByDifficulty(candidates, minDifficulty, maxDifficulty);
  }
  
  // STEP 3: Filter by sport variant if specified
  if (specialization) {
    const variantMatches = candidates.filter(w => 
      !w.sportVariant || w.sportVariant === specialization
    );
    if (variantMatches.length > 0) {
      candidates = variantMatches;
    }
  }
  
  // STEP 4: Exclude workouts already used THIS WEEK (variety within week!)
  if (usedThisWeekIds.length > 0) {
    const weeklyUniqueOnly = candidates.filter(w => !usedThisWeekIds.includes(w.id));
    if (weeklyUniqueOnly.length > 0) {
      candidates = weeklyUniqueOnly;
    }
  }
  
  // STEP 5: Exclude previous workout from LAST WEEK to avoid repetition across weeks
  if (previousTemplateId) {
    const nonRepeatCandidates = candidates.filter(w => w.id !== previousTemplateId);
    if (nonRepeatCandidates.length > 0) {
      candidates = nonRepeatCandidates;
    }
  }
  
  // FALLBACK: If somehow no candidates, return first from pool
  // BUG #8 FIX: Guard against empty MASTER_WORKOUTS
  if (candidates.length === 0) {
    if (MASTER_WORKOUTS.length === 0) {
      console.error('[selectWorkoutTemplate] CRITICAL: MASTER_WORKOUTS is empty! Database failed to load.');
      throw new Error('Database failed to load - no workouts available');
    }
    candidates = MASTER_WORKOUTS;
  }
  
  // STEP 6: Random selection from filtered candidates
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selected = candidates[randomIndex];
  
  if (!selected) {
    console.error('[selectWorkoutTemplate] ERROR: Selected undefined workout');
    throw new Error('Workout selection returned undefined');
  }
  
  return selected;
}



// ─── Custom Session Generators ──────────────────────────────────────

function generateRestDay(day: DayOfWeek): SessionDef {
  return {
    dayOfWeek: day,
    sessionType: "INDOOR",
    duration: 0,
    title: "Rest Day",
    description: "Complete rest and recovery. Stay hydrated and get quality sleep.",
    intervals: [],
  };
}

function generateOutdoorSession(weekType: WeekType, blockNum: number, day: DayOfWeek): SessionDef {
  // Use existing Saturday ride logic but for any day
  const weekNum = blockNum * 4 + (weekType === "BUILD" ? 1 : weekType === "BUILD_PLUS" ? 2 : weekType === "OVERREACH" ? 3 : 4);
  const route = getRouteForWeek(weekType, weekNum);
  const baseDuration = weekType === "RECOVERY" ? 120 : 180;
  const intensity = weekType === "RECOVERY" ? 60 : 65;
  
  const duration = route ? Math.round(route.distance * 3) : baseDuration; // ~3 min per km estimate
  
  return {
    dayOfWeek: day,
    sessionType: "OUTDOOR",
    duration,
    title: route ? route.name : "Endurance Ride",
    description: route ? route.description : "Long outdoor ride focusing on aerobic base building. Maintain a comfortable conversation pace.",
    intervals: [{
      name: route ? route.name : "Endurance Ride",
      durationSecs: duration * 60,
      powerLow: intensity,
      powerHigh: intensity,
      zone: "Z2",
      purpose: "Aerobic base building",
      coachNote: getCoachNote("saturday")
    }],
    route,
  };
}

// Track selected templates to avoid repetition week-to-week
const selectedTemplates: Map<string, WorkoutTemplate> = new Map();

/**
 * Generate indoor session using SESSION_TEMPLATES database
 * Back to proven, high-quality session designs with coaching notes
 */
function generateIndoorSession(
  blockType: BlockType, 
  weekType: WeekType, 
  day: DayOfWeek,
  weekNum?: number,
  previousTemplates?: Partial<Record<DayOfWeek, WorkoutTemplate>>,
  userSeed?: string, // For per-user variation
  targetDurationMinutes?: number, // USER'S REQUESTED DURATION
  usedThisWeekIds: string[] = [] // Workouts already selected THIS WEEK
): SessionDef {
  // Validate duration (BUG #5 fix)
  if (targetDurationMinutes !== undefined && targetDurationMinutes < 30) {
    console.warn(`[generateIndoorSession] Duration ${targetDurationMinutes}min is too short, using 60min default`);
    targetDurationMinutes = 60;
  }

  const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
  
  // BUG #10 FIX: Validate day is valid
  if (dayIndex === -1) {
    console.error(`[generateIndoorSession] CRITICAL: Invalid day '${day}' received`);
    throw new Error(`Invalid day of week: ${day}`);
  }
  
  let zone: string;
  let isMonday = dayIndex === 0;
  
  // MONDAY IS SACRED: Always stick to the planned block type
  switch (blockType) {
    case "BASE":
      zone = "BASE";
      break;
    case "THRESHOLD":
      zone = "THRESHOLD";
      break;
    case "VO2MAX":
      zone = "VO2MAX";
      break;
    case "RACE_SIM":
      zone = "RACE_SIM";  // Use RACE_SIM category directly
      break;
    default:
      zone = "BASE";
  }
  
  // Note: generateIndoorSession should only be called for days in trainingDays (see generateWeekSessions)
  // No hardcoded rest days here - all logic respects the trainingDays array
  
  // For non-Monday sessions, intelligently rotate through ALL 10 categories
  // This ensures variety while maintaining periodization structure
  let selectedZone = zone;
  if (!isMonday) {
    // Create a seeded randomizer from user + day + week info
    const dayOffset = dayIndex * 10;
    const weekOffset = (weekNum || 1) * 100;
    const userHash = userSeed ? Math.abs(
      userSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    ) : 0;
    const seed = (dayOffset + weekOffset + userHash) % 1000;
    
    // Map days to category rotations (ensures all 10+ categories distributed throughout week)
    // Each day gets diverse category options to guarantee variety
    // TECHNIQUE: pedal economy, skill work (good for any day)
    // STRENGTH: force development, power (good for harder or recovery days with activation)
    const categoryRotations: Record<number, string[]> = {
      1: ["SWEET_SPOT", "TEMPO", "TECHNIQUE", "SPRINT", "RECOVERY"],  // TUE: Sweet spot + skill + options
      2: ["RECOVERY", "BASE", "TECHNIQUE", "SWEET_SPOT", "STRENGTH"],    // WED: Recovery-focused, skill work, or light strength
      3: ["THRESHOLD", "STRENGTH", "VO2MAX", "SPRINT", "TEMPO"],     // THU: Hard effort + strength
      4: ["SPRINT", "ANAEROBIC", "STRENGTH", "FTP_TEST", "RECOVERY"],// FRI: Specialty/testing + neuromuscular strength
    };
    
    const dayRotation = categoryRotations[dayIndex];
    if (dayRotation && dayRotation.length > 0) {
      // Rotate based on seeded randomness
      const categoryIndex = seed % dayRotation.length;
      const rotatedZone = dayRotation[categoryIndex];
      
      // Prefer the rotated category, but fall back to primary if needed
      selectedZone = rotatedZone;
    }
  }
  
  // Select a template for this category/day, avoiding previous week's template and THIS WEEK's already-used workouts
  const previousTemplate = previousTemplates?.[day];
  const template = selectWorkoutTemplate(selectedZone, weekType, previousTemplate?.id, undefined, usedThisWeekIds);
  
  // Build intervals from template
  // ISSUE #4 FIX: Use template's own duration for interval normalization (will be adjusted after)
  const templateDuration = template.duration;
  const rawIntervals = typeof template.intervals === 'function' ? template.intervals() : template.intervals;
  const intervals = normalizeIntervals(rawIntervals, templateDuration);
  
  // Use user's target duration if provided, otherwise template duration
  const finalDuration = targetDurationMinutes || templateDuration;
  
  return {
    dayOfWeek: day,
    sessionType: "INDOOR",
    title: template.title,
    description: template.description,
    purpose: template.purpose,
    duration: finalDuration, // Respect user's requested duration
    intervals,
    templateId: template.id,
  };
}

// ─── Duration Fix ────────────────────────────────────────────────────

/**
 * Fix session duration by recalculating from intervals
 * If targetDurationWasApplied=true, skip week-type adjustments (target already respected)
 */
// ─── PART 1: Smart Duration Scaling (Option B with 3-Part Strategy) ──────

/**
 * Calculate smart duration based on:
 * 1. User's selected baseline (anchor)
 * 2. Week type (BUILD, BUILD_PLUS, OVERREACH, RECOVERY)
 * 3. Day of week (MON, WED, SAT = different roles)
 * 
 * Research: Issurin, Seiler, Coggan, Friel
 * Key: Intensity varies MORE than duration; duration provides context
 */
function calculateSmartDuration(
  userTargetDuration: number,  // User's selected duration (e.g., 60)
  weekType: WeekType,
  dayOfWeek: DayOfWeek,
  baseTemplateDuration: number  // Template's base duration
): number {
  // Step 1: Week-type multiplier (how much to adjust from target)
  let weekMultiplier = 1.0;
  
  switch (weekType) {
    case "BUILD":
      weekMultiplier = 1.0;      // Baseline (BUILD week = anchor)
      break;
    case "BUILD_PLUS":
      weekMultiplier = 1.05;     // +5% duration (build up)
      break;
    case "OVERREACH":
      weekMultiplier = 1.0;      // Same duration, peak intensity (not longer)
      break;
    case "RECOVERY":
      weekMultiplier = 0.80;     // -20% duration (recovery)
      break;
  }
  
  // Step 2: Day-specific multiplier (some days are key sessions, some are supporting)
  let dayMultiplier = 1.0;
  
  switch (dayOfWeek) {
    case "MON":
      // Monday: Key structured session (100%)
      dayMultiplier = 1.0;
      break;
    case "TUE":
      // Tuesday: Secondary session (-15%)
      dayMultiplier = 0.85;
      break;
    case "WED":
      // Wednesday: Support session (-25%)
      dayMultiplier = 0.75;
      break;
    case "THU":
      // Thursday: Recovery/optional (-30%)
      dayMultiplier = 0.70;
      break;
    case "FRI":
      // Friday: Easy/preparation (-20%)
      dayMultiplier = 0.80;
      break;
    case "SAT":
      // Saturday: Long ride or key session (+20-25% in BUILD weeks, same in OVERREACH)
      if (weekType === "OVERREACH" || weekType === "RECOVERY") {
        dayMultiplier = 1.0;     // Even on SAT, keep reasonable in peak
      } else {
        dayMultiplier = 1.25;    // Long rides in build phases
      }
      break;
    case "SUN":
      // Sunday: Optional/flex (-20%)
      dayMultiplier = 0.80;
      break;
  }
  
  // Step 3: Calculate final duration
  // Anchor to user's target, apply multipliers, but keep within reasonable bounds
  let finalDuration = Math.round(userTargetDuration * weekMultiplier * dayMultiplier);
  
  // Safeguards: don't go too extreme
  const minDuration = Math.max(20, userTargetDuration * 0.5);  // Never below 50% of target
  const maxDuration = userTargetDuration * 1.5;                // Never above 150% of target
  
  finalDuration = Math.max(minDuration, Math.min(maxDuration, finalDuration));
  
  return finalDuration;
}

// ─── PART 2: Intensity Factor (IF) Scaling ──────────────────────────────

/**
 * Calculate Intensity Factor (IF) as % of FTP based on:
 * 1. Week type (periodization phase)
 * 2. Workout type (threshold vs. VO2max vs. easy)
 * 
 * Used for TSS calculation: TSS = (secs × NP × IF) / (FTP × 3600) × 100
 */
function calculateIntensityFactor(
  weekType: WeekType,
  workoutPurpose?: string  // "threshold", "vo2max", "easy", etc.
): number {
  // Base IF by workout type
  let baseIF = 0.75;  // Default easy
  
  if (workoutPurpose) {
    const purpose = workoutPurpose.toLowerCase();
    if (purpose.includes("threshold") || purpose.includes("ftp") || purpose.includes("tempo")) {
      baseIF = 0.95;  // ~95% FTP for threshold work
    } else if (purpose.includes("vo2") || purpose.includes("vo2max") || purpose.includes("anaerobic")) {
      baseIF = 1.08;  // ~108% FTP for VO2max work
    } else if (purpose.includes("sprint") || purpose.includes("power")) {
      baseIF = 1.10;  // ~110% FTP for sprint/power
    } else if (purpose.includes("recovery") || purpose.includes("easy")) {
      baseIF = 0.65;  // ~65% FTP for easy
    }
  }
  
  // Adjust IF by week type
  switch (weekType) {
    case "BUILD":
      // Standard intensity
      return baseIF;
      
    case "BUILD_PLUS":
      // Slightly higher intensity (+5%)
      return baseIF * 1.05;
      
    case "OVERREACH":
      // PEAK intensity (+15-25% depending on type)
      if (baseIF >= 1.0) {
        // Hard sessions get very hard (supra-TH, supra-VO2max)
        return Math.min(1.20, baseIF * 1.15);  // Cap at 120%
      } else {
        // Easy sessions stay easy
        return 0.75;
      }
      
    case "RECOVERY":
      // Easy weeks: all intensity reduced (65% max)
      return Math.min(0.70, baseIF * 0.75);
  }
  
  return baseIF;
}

// ─── PART 3: Apply Smart Scaling to Session ──────────────────────────────

/**
 * Main function: Apply Option B scaling (duration + intensity) to a session
 * 
 * INPUT:
 * - session: The generated session
 * - weekType: Which week of the block (BUILD, BUILD_PLUS, OVERREACH, RECOVERY)
 * - userTargetDuration: User's selected baseline duration (60 min, 45 min, 90 min, etc.)
 * - targetDurationWasApplied: Was user target already baked in?
 * - userSundayDuration: Sunday-specific duration (optional)
 * - userFridayDuration: Friday-specific duration (optional, default 50 min)
 * 
 * OUTPUT:
 * - Modified session with smart duration AND intensity factor
 */
function fixSessionDuration(
  session: SessionDef,
  weekType?: WeekType,
  targetDurationWasApplied: boolean = false,
  userTargetDuration?: number,
  userSundayDuration?: number,      // NEW: Sunday-specific duration
  userFridayDuration: number = 50   // NEW: Friday-specific duration (default 50 min)
): SessionDef {
  // ERROR MISSING #1 FIX: Validate inputs early
  if (!validateSessionInput(session, weekType)) {
    console.error('[fixSessionDuration] Invalid input - returning session unchanged');
    return session;
  }
  
  // ISSUE #9 FIX: Don't apply duration to rest days
  if (session.title === "Rest Day" || session.duration === 0) {
    return session; // Rest days keep duration 0
  }
  
  if (session.sessionType === "OUTDOOR") return session; // Outdoor durations are set by route
  
  // If no week type provided, return as-is
  if (!weekType) {
    return session;
  }
  
  // GENERAL FIX: User-selected durations are SACRED
  // When a user explicitly selects a duration (any day, any week), use it WITHOUT day multipliers
  // Day multipliers affect INTENSITY only, not the user's duration selection
  
  // Check if user provided an explicit duration for this day
  // Priority: Friday-specific > Sunday-specific > General target
  let userProvidedDuration: number | undefined;
  
  if (session.dayOfWeek === "FRI") {
    // Friday: Use Friday-specific duration (default 50 min)
    userProvidedDuration = userFridayDuration;
  } else if (session.dayOfWeek === "SUN") {
    // Sunday: Use Sunday-specific duration if provided, otherwise general target
    userProvidedDuration = userSundayDuration !== undefined ? userSundayDuration : userTargetDuration;
  } else {
    // Other days: Use general target
    userProvidedDuration = userTargetDuration;
  }
  
  if (userProvidedDuration && userProvidedDuration > 0) {
    // User explicitly selected a duration - RESPECT IT EXACTLY (no day multipliers)
    const intensityFactor = calculateIntensityFactor(weekType, session.purpose);
    
    // ISSUE #10 FIX: Rescale intervals if user duration differs from current duration
    const currentDurationMinutes = session.duration;
    const rescaledIntervals = rescaleIntervals(session.intervals, currentDurationMinutes, userProvidedDuration);
    
    return {
      ...session,
      duration: userProvidedDuration,          // Use user's exact selection
      intervals: rescaledIntervals,            // Rescaled intervals
      intensityFactor,                         // But apply intensity variation
      userTargetDuration: userProvidedDuration,
      periodizationWeekType: weekType,
    };
  }
  
  // No user duration provided - fall back to template duration
  // Calculate base duration from intervals
  // BUG #9 FIX: Handle null/undefined intervals (e.g., rest days)
  const totalSecs = (session.intervals || []).reduce((s, i) => s + i.durationSecs, 0);
  const baseTemplateDuration = Math.round(totalSecs / 60) || 0;
  
  // Use template duration as anchor (no user selection provided)
  const anchor = baseTemplateDuration || 60;
  
  // For template-based sessions (user didn't select duration), apply smart scaling
  const smartDuration = calculateSmartDuration(
    anchor,
    weekType,
    session.dayOfWeek,
    baseTemplateDuration
  );
  
  // Calculate intensity factor (Part 2)
  const intensityFactor = calculateIntensityFactor(weekType, session.purpose);
  
  // ISSUE #10 FIX: Rescale intervals if smart duration differs from current duration
  const rescaledIntervals = rescaleIntervals(session.intervals, anchor, smartDuration);
  
  // Return session with both duration AND intensity applied
  return {
    ...session,
    duration: smartDuration,
    intervals: rescaledIntervals,              // Rescaled intervals
    intensityFactor,                          // NEW: store IF
    userTargetDuration: anchor,               // NEW: store original target
    periodizationWeekType: weekType,          // NEW: store week type for reference
  };
}

// ─── Full Plan Generator ─────────────────────────────────────────────

/**
 * PHASE 4: Extended plan generation with personalization options
 * Now uses SESSION_TEMPLATES database for real variety
 */
export function generatePlan(
  numBlocks: number = 4,
  trainingDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], // All days training by default
  outdoorDay: DayOfWeek = "SAT",
  season?: Season,
  raceType?: string,
  useAINames?: boolean,
  riderId?: string, // For per-user variation (Monday locked, other days vary by user)
  includeInitialFTPTest: boolean = true, // Always start with FTP test to establish baselines
  targetDurationMinutes?: number, // USER'S REQUESTED SESSION DURATION (default for all days)
  targetSundayDurationMinutes?: number, // OPTIONAL: Different duration for Sunday
  targetFridayDurationMinutes: number = 50 // OPTIONAL: Different duration for Friday (default 50 min)
): PlanDef {
  console.log('🚀 [generatePlan] START - Initializing plan generation');
  
  // GUARD: generatePlan should ONLY be called on server-side (API routes)
  // Client-side pages should call the API instead
  if (typeof window !== 'undefined') {
    console.error('❌ [generatePlan] ERROR: generatePlan was called on CLIENT-SIDE!');
    console.error('❌ [generatePlan] Client-side pages should call /api/plan instead');
    throw new Error('generatePlan can only be called on server-side. Use /api/plan endpoint from client.');
  }
  
  // CRITICAL FIX: Ensure workouts are loaded FIRST
  ensureWorkoutsLoaded();
  console.log('✅ [generatePlan] Workouts ready:', MASTER_WORKOUTS.length, 'available');
  
  // Validate duration (BUG #5 fix)
  if (targetDurationMinutes !== undefined && targetDurationMinutes < 30) {
    console.warn(`[generatePlan] Duration ${targetDurationMinutes}min is too short, using 60min default`);
    targetDurationMinutes = 60;
  }

  resetCommentaryIndex();
  const blocks: BlockDef[] = [];
  
  // Initialize tracking variables for variety (no-repeat logic)
  let previousWeekStructures: Partial<Record<DayOfWeek, WorkoutStructure>> = {};
  let previousWeekTemplates: Partial<Record<DayOfWeek, WorkoutTemplate>> = {};
  
  // CRITICAL: Integrate FTP Test into Week 1 of Block 1
  // Monday: FTP Test
  // Rest of week: Recovery
  // Then Blocks 2-5: Actual training
  
  let blockStartNum = 0;
  
  if (includeInitialFTPTest) {
    // FTP Test is just Week 1 Monday of Block 1 - not a special recovery week
    // Rest of the week continues normal BASE training
    // Generate full Week 1 (no FTP test - user will build one separately)
    const week1Sessions = generateWeekSessions(
      "BASE",
      "BUILD",
      0,
      trainingDays,
      outdoorDay,
      "Foundation Building",
      1,
      previousWeekStructures,
      previousWeekTemplates,
      riderId,
      targetDurationMinutes,
      targetSundayDurationMinutes,
      targetFridayDurationMinutes
    )
    .map(s => {
      // Apply duration scaling (with Friday and Sunday-specific duration support)
      return fixSessionDuration(s, "BUILD", !!targetDurationMinutes, targetDurationMinutes, targetSundayDurationMinutes, targetFridayDurationMinutes);
    });
    
    const firstBlock: BlockDef = {
      blockNumber: 1,
      type: "BASE",
      weeks: [
        {
          weekNumber: 1,
          weekType: "BUILD",
          sessions: week1Sessions,
        },
        // WEEKS 2-4: Regular BASE block progression
        ...Array(3).fill(0).map((_, weekIdx) => {
          const weekType = WEEK_SEQUENCE[weekIdx + 1]; // START FROM WEEK 2 (index 1)
          const weekNum = 2 + weekIdx;
          
          let sessions = generateWeekSessions(
            "BASE",
            weekType,
            0, // Block 1 (first actual training block)
            trainingDays,
            outdoorDay,
            "Foundation Building",
            weekNum,
            previousWeekStructures,
            previousWeekTemplates,
            riderId,
            targetDurationMinutes,
            targetSundayDurationMinutes,
            targetFridayDurationMinutes
          ).map(s => {
            // Apply duration scaling (with Friday and Sunday-specific duration support)
            return fixSessionDuration(s, weekType, !!targetDurationMinutes, targetDurationMinutes, targetSundayDurationMinutes, targetFridayDurationMinutes);
          });
          
          return {
            weekNumber: weekNum,
            weekType,
            sessions,
          };
        }),
      ],
    };
    
    blocks.push(firstBlock);
    blockStartNum = 1; // Start actual training blocks from Block 2
  }

  // Generate remaining training blocks
  // If FTP test included, Block 1 is already done (BASE+FTP week 1 + recovery weeks 2-4)
  // So we generate numBlocks-1 more blocks (THRESHOLD, VO2MAX, RACE_SIM, BASE...)
  // If no FTP test, generate all numBlocks (BASE, THRESHOLD, VO2MAX, RACE_SIM)
  
  const remainingBlocks = includeInitialFTPTest ? numBlocks - 1 : numBlocks;
  const firstBlockIndex = includeInitialFTPTest ? 1 : 0; // Start from THRESHOLD if FTP test included
  
  for (let b = 0; b < remainingBlocks; b++) {
    const blockSequenceIndex = (firstBlockIndex + b) % BLOCK_SEQUENCE.length;
    const blockType = BLOCK_SEQUENCE[blockSequenceIndex];
    const blockNum = (includeInitialFTPTest ? 2 : 1) + b;
    // PHASE 4: Use seasonal theme if provided
    const blockTheme = getSeasonalBlockTheme(blockType, season);
    const weeks: WeekDef[] = [];

    for (let w = 0; w < 4; w++) {
      const weekType = WEEK_SEQUENCE[w];
      const weekNum = w + 1;
      
      // Generate sessions with generation engine (duration-aware)
      // Monday stays locked to plan, other days vary per riderId
      let sessions = generateWeekSessions(
        blockType, 
        weekType, 
        blockNum, // Use adjusted block number (accounts for FTP test week)
        trainingDays, 
        outdoorDay,
        blockTheme,
        weekNum,
        previousWeekStructures,
        previousWeekTemplates,  // Pass template tracking
        riderId,  // Pass rider ID for per-user variation
        targetDurationMinutes,
        targetSundayDurationMinutes,
        targetFridayDurationMinutes
      ).map(s => {
        // Apply duration scaling (with Friday and Sunday-specific duration support)
        return fixSessionDuration(s, weekType, !!targetDurationMinutes, targetDurationMinutes, targetSundayDurationMinutes, targetFridayDurationMinutes);
      });
      
      // Track templates for next week's variety (avoid same template week-to-week)
      sessions.forEach(s => {
        // Store template by name to avoid repetition
        const templateKey = s.templateId;
        const matchingTemplate = MASTER_WORKOUTS
          .find(t => t.id === templateKey);
        if (matchingTemplate) {
          previousWeekTemplates[s.dayOfWeek] = matchingTemplate;
        }
        previousWeekStructures[s.dayOfWeek] = s.structure;
      });
      
      weeks.push({
        weekNumber: weekNum,
        weekType,
        sessions,
      });
    }

    blocks.push({ blockNumber: blockNum, type: blockType, weeks });
  }

  return { blocks };
}

// Helper: count total sessions & intervals
export function planStats(plan: PlanDef) {
  let sessions = 0, intervals = 0;
  for (const b of plan.blocks) for (const w of b.weeks) for (const s of w.sessions) {
    sessions++;
    intervals += s.intervals.length;
  }
  return { blocks: plan.blocks.length, sessions, intervals };
}
