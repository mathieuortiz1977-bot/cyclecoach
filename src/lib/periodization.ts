// Periodization Engine — generates complete training plans
import { getCoachNote, resetCommentaryIndex } from "./coach";
import { getRouteForWeek, type RouteData } from "./routes";
import { getZoneForPower } from "./zones";

export type BlockType = "BASE" | "THRESHOLD" | "VO2MAX" | "RACE_SIM";
export type WeekType = "BUILD" | "BUILD_PLUS" | "OVERREACH" | "RECOVERY";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface IntervalDef {
  name: string;
  durationSecs: number;
  powerLow: number;  // % FTP
  powerHigh: number; // % FTP
  cadenceLow?: number;
  cadenceHigh?: number;
  rpe?: number;
  zone: string;
  purpose: string;
  coachNote: string;
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
  trainingDays: DayOfWeek[] = ["MON", "TUE", "THU", "FRI", "SAT"],
  outdoorDay: DayOfWeek = "SAT",
  blockTheme: string = "Foundation Building",
  weekInBlock: number = 1,
  previousStructures: Partial<Record<DayOfWeek, WorkoutStructure>> = {},
  previousTemplates: Partial<Record<DayOfWeek, WorkoutTemplate>> = {},
  userSeed?: string // For per-user variation (Monday stays locked, other days can vary)
): SessionDef[] {
  // Generate full week sessions (7 days)
  const allDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const sessions: SessionDef[] = [];

  for (const day of allDays) {
    let session: SessionDef;
    
    if (!trainingDays.includes(day)) {
      // Rest day
      session = generateRestDay(day);
    } else if (day === outdoorDay) {
      // Outdoor day (usually longer ride)
      session = generateOutdoorSession(weekType, blockNum, day);
    } else {
      // Indoor training day - use template-based generation
      // Monday is sacred (stick to plan), other days use userSeed for variation
      session = generateIndoorSession(
        blockType, 
        weekType, 
        day,
        weekInBlock,
        previousTemplates,
        userSeed
      );
    }
    
    sessions.push(session);
  }

  return sessions;
}

// ─── SESSION TEMPLATES DATABASE ──────────────────────────────────────
// Multiple variations per zone for REAL workout variety

interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  purpose: string;
  zone: string;
  duration: number;
  intervals: () => IntervalDef[];
}

const SESSION_TEMPLATES: Record<string, WorkoutTemplate[]> = {
  // ─── FTP TEST (Baseline Testing) ──────────────────────────────────
  FTP_TEST: [
    {
      id: "ftp-test-standard",
      title: "FTP Test",
      description: "Establish baseline functional threshold power",
      purpose: "Determine FTP for power zone calibration - Coggan 20-min protocol",
      zone: "Z4",
      duration: 35,
      intervals: () => [
        interval("Easy Warmup 1", 300, 50, 60, "Gentle start", "recovery"),
        interval("Build 1", 300, 60, 70, "Build gradually", "endurance"),
        interval("Build 2", 300, 70, 80, "Continue building", "endurance"),
        interval("Surge 1", 120, 85, 95, "First surge", "tempo"),
        restInterval(300),
        interval("Surge 2", 120, 85, 95, "Second surge", "tempo"),
        restInterval(600),
        // Main 20-minute FTP test
        interval("FTP Test Effort", 1200, 95, 105, "20-minute steady max effort at threshold", "threshold"),
        restInterval(600),
        // Cool down with 2x2min sprints to test leg freshness
        interval("Sprint 1", 120, 100, 150, "2-min post-test effort", "anaerobic"),
        restInterval(300),
        interval("Sprint 2", 120, 100, 150, "2-min final effort", "anaerobic"),
        interval("Easy Cooldown", 300, 40, 50, "Easy spin recovery", "recovery"),
      ],
    },
  ],

  BASE: [
    // ─── Endurance Base (Z1-Z2): Aerobic Development ─────────────────
    {
      id: "base-steady-60",
      title: "Base Workout", 
      description: "Steady aerobic base building (60 min)",
      purpose: "Build aerobic base with steady Z2 effort - Coggan/Allen methodology",
      zone: "Z2",
      duration: 65, // 10min warmup + 45min endurance + 5min cooldown = 60min actual
      intervals: () => [
        warmup(), // 10 min (600 secs)
        interval("Endurance", 2700, 56, 70, "Steady aerobic base - focus on fat oxidation", "endurance"), // 45 min
        cooldown(), // 5 min (300 secs)
      ],
    },
    {
      id: "base-steady-90",
      title: "Base Workout", 
      description: "Extended aerobic base building (90 min)",
      purpose: "Extended aerobic base - Seiler Zone 1 equivalent",
      zone: "Z2",
      duration: 100,
      intervals: () => [
        warmup(),
        interval("Extended Endurance", 5400, 56, 68, "Long steady effort for aerobic adaptation", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-progressive", 
      title: "Base Workout",
      description: "Progressive aerobic build",
      purpose: "Progressive base build - Friel foundation method",
      zone: "Z2",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base Build 1", 1200, 56, 65, "Start in low Z2", "endurance"),
        interval("Base Build 2", 1200, 65, 72, "Progress to upper Z2", "endurance"), 
        interval("Base Build 3", 1200, 70, 78, "Touch low tempo", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-tempo-accents",
      title: "Base Workout", 
      description: "Base with tempo pickups",
      purpose: "Aerobic base with tempo training - Hunter Allen prescription",
      zone: "Z2",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base", 1200, 60, 68, "Aerobic base foundation", "endurance"),
        interval("Tempo", 300, 76, 84, "First tempo accent", "tempo"),
        restInterval(300),
        interval("Base", 900, 60, 68, "Return to aerobic", "endurance"),
        interval("Tempo", 300, 76, 84, "Second tempo accent", "tempo"),
        restInterval(300),
        interval("Base", 600, 60, 68, "Finish aerobic", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-cadence-work",
      title: "Base Workout",
      description: "Base with cadence development",
      purpose: "Aerobic base + neuromuscular efficiency - TrainingPeaks methodology",
      zone: "Z2",
      duration: 80,
      intervals: () => [
        warmup(),
        interval("Base", 1200, 60, 68, "Easy spinning base", "endurance", {cadenceLow: 85, cadenceHigh: 95}),
        ...Array(6).fill(0).flatMap(() => [
          interval("High Cadence", 180, 58, 66, "High cadence drill", "cadence", {cadenceLow: 100, cadenceHigh: 110}),
          interval("Recovery", 120, 56, 62, "Return to normal cadence", "recovery", {cadenceLow: 85, cadenceHigh: 95}),
        ]),
        interval("Base", 900, 60, 68, "Finish with steady base", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-sweet-spot",
      title: "Base Workout",
      description: "Sweet spot intervals",
      purpose: "Sweet spot training (Z3) - Coggan sweet spot methodology", 
      zone: "Z3",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Sweet Spot 1", 1200, 84, 90, "First sweet spot effort", "sweetspot"),
        restInterval(300),
        interval("Sweet Spot 2", 1200, 84, 90, "Second sweet spot effort", "sweetspot"),
        restInterval(300),
        interval("Sweet Spot 3", 900, 84, 90, "Final sweet spot effort", "sweetspot"),
        cooldown(),
      ],
    },
    {
      id: "base-recovery",
      title: "Base Workout",
      description: "Active recovery ride", 
      purpose: "Active recovery - Seiler easy day prescription",
      zone: "Z1",
      duration: 45,
      intervals: () => [
        interval("Easy Spin", 300, 40, 50, "Gentle warmup", "recovery"),
        interval("Active Recovery", 2100, 45, 60, "Easy spinning for recovery", "recovery"),
        interval("Cool Spin", 300, 40, 50, "Gentle finish", "recovery"),
      ],
    },
    {
      id: "base-fartlek",
      title: "Base Workout",
      description: "Aerobic base with random surges",
      purpose: "Unstructured base + surges - Seiler/Norwegian method variation",
      zone: "Z2", 
      duration: 90,
      intervals: () => [
        warmup(),
        interval("Base", 900, 60, 68, "Aerobic foundation", "endurance"),
        interval("Surge 1", 30, 90, 110, "Random surge", "tempo"),
        interval("Base", 600, 60, 68, "Back to base", "endurance"),
        interval("Surge 2", 45, 85, 95, "Medium surge", "tempo"),
        interval("Base", 1200, 60, 68, "Aerobic pace", "endurance"),
        interval("Surge 3", 60, 95, 115, "Bigger surge", "threshold"),
        interval("Base", 900, 60, 68, "Return to base", "endurance"),
        interval("Surge 4", 20, 100, 130, "Short punch", "vo2max"),
        interval("Base", 600, 60, 68, "Finish aerobic", "endurance"),
        cooldown(),
      ],
    },
  ],
  
  THRESHOLD: [
    // ─── Threshold (Z4): Lactate Threshold & FTP Development ────────
    {
      id: "threshold-2x20",
      title: "Threshold Workout",
      description: "Classic 2x20 threshold intervals", 
      purpose: "FTP development - Coggan/Allen gold standard",
      zone: "Z4",
      duration: 65, // 10min warmup + 20min + 10min rest + 20min + 5min cooldown
      intervals: () => [
        warmup(),
        interval("Threshold 1", 1200, 88, 94, "First 20-min threshold block", "threshold"),
        restInterval(600),
        interval("Threshold 2", 1200, 88, 94, "Second 20-min threshold block", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-3x15",
      title: "Threshold Workout",
      description: "3x15 threshold intervals",
      purpose: "Threshold power with moderate recovery - TrainingPeaks classic",
      zone: "Z4",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 900, 88, 94, "First 15-min effort", "threshold"),
        restInterval(300),
        interval("Threshold 2", 900, 88, 94, "Second 15-min effort", "threshold"),
        restInterval(300),
        interval("Threshold 3", 900, 88, 94, "Third 15-min effort", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-4x10",
      title: "Threshold Workout",
      description: "4x10 threshold intervals",
      purpose: "Threshold adaptation with shorter blocks - Friel Build phase",
      zone: "Z4",
      duration: 70,
      intervals: () => [
        warmup(),
        ...Array(4).fill(0).flatMap((_, i) => [
          interval(`Threshold ${i+1}`, 600, 88, 94, `10-min threshold effort ${i+1}`, "threshold"),
          ...(i < 3 ? [restInterval(180)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "threshold-pyramid",
      title: "Threshold Workout", 
      description: "Threshold pyramid: 6-7-8-7-6",
      purpose: "Progressive threshold building - European coaching method",
      zone: "Z4", 
      duration: 70,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 360, 88, 94, "6-min build", "threshold"),
        restInterval(120),
        interval("Threshold 2", 420, 88, 94, "7-min extend", "threshold"),
        restInterval(150),
        interval("Threshold 3", 480, 88, 94, "8-min peak", "threshold"),
        restInterval(150),
        interval("Threshold 4", 420, 88, 94, "7-min descend", "threshold"),
        restInterval(120),
        interval("Threshold 5", 360, 88, 94, "6-min finish", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-micro-8x2",
      title: "Threshold Workout",
      description: "8x2 threshold micro-intervals",
      purpose: "Threshold with frequent recovery - Seiler 4x8 variation",
      zone: "Z4",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Threshold ${i+1}`, 120, 88, 94, `2-min threshold effort`, "threshold"),
          ...(i < 7 ? [restInterval(60)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "threshold-ladder",
      title: "Threshold Workout",
      description: "Threshold ladder: 5-7-10-7-5",
      purpose: "Variable threshold stress - Hunter Allen ladder method",
      zone: "Z4",
      duration: 70,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 300, 88, 94, "5-min start", "threshold"),
        restInterval(120),
        interval("Threshold 2", 420, 88, 94, "7-min build", "threshold"),
        restInterval(180),
        interval("Threshold 3", 600, 88, 94, "10-min peak", "threshold"),
        restInterval(180),
        interval("Threshold 4", 420, 88, 94, "7-min descend", "threshold"),
        restInterval(120),
        interval("Threshold 5", 300, 88, 94, "5-min finish", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-descending",
      title: "Threshold Workout",
      description: "Descending threshold: 12-8-6-4",
      purpose: "Descending threshold intervals - British Cycling method",
      zone: "Z4",
      duration: 65,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 720, 88, 94, "12-min long effort", "threshold"),
        restInterval(360),
        interval("Threshold 2", 480, 88, 94, "8-min medium effort", "threshold"), 
        restInterval(240),
        interval("Threshold 3", 360, 88, 94, "6-min shorter effort", "threshold"),
        restInterval(180),
        interval("Threshold 4", 240, 88, 94, "4-min final effort", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-over-under",
      title: "Threshold Workout",
      description: "Over-under threshold intervals",
      purpose: "Lactate tolerance at threshold - Coggan over-under protocol",
      zone: "Z4",
      duration: 65,
      intervals: () => [
        warmup(),
        ...Array(3).fill(0).flatMap((_, setIndex) => [
          ...Array(4).fill(0).flatMap((_, repIndex) => [
            interval("Under", 150, 88, 92, "Under threshold", "threshold"),
            interval("Over", 90, 98, 105, "Over threshold", "vo2max"),
          ]),
          ...(setIndex < 2 ? [restInterval(480)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "threshold-tempo-build",
      title: "Threshold Workout", 
      description: "Tempo to threshold progression",
      purpose: "Progressive threshold development - Joe Friel progression",
      zone: "Z3-Z4",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Tempo", 900, 76, 84, "15-min tempo foundation", "tempo"),
        restInterval(300),
        interval("Sweet Spot", 600, 84, 90, "10-min sweet spot", "sweetspot"),
        restInterval(300),
        interval("Threshold", 600, 88, 94, "10-min threshold peak", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-cruise-intervals",
      title: "Threshold Workout",
      description: "Cruise intervals: 6x5 threshold",
      purpose: "Classic cruise intervals - Daniels running adapted for cycling",
      zone: "Z4",
      duration: 65,
      intervals: () => [
        warmup(),
        ...Array(6).fill(0).flatMap((_, i) => [
          interval(`Cruise ${i+1}`, 300, 88, 94, `5-min cruise interval`, "threshold"),
          ...(i < 5 ? [restInterval(120)] : []),
        ]),
        cooldown(),
      ],
    },
  ],
  
  VO2MAX: [
    // ─── VO2 Max (Z5): Maximal Aerobic Power Development ────────────
    {
      id: "vo2-classic-5x5",
      title: "VO2 Max Workout",
      description: "Classic 5x5 VO2 max intervals",
      purpose: "VO2 max development - Coggan/Allen classic protocol",
      zone: "Z5", 
      duration: 75,
      intervals: () => [
        warmup(),
        ...Array(5).fill(0).flatMap((_, i) => [
          interval(`VO2 Max ${i+1}`, 300, 106, 120, "5-min VO2 max effort", "vo2max"),
          ...(i < 4 ? [restInterval(300)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-6x4",
      title: "VO2 Max Workout",
      description: "6x4 VO2 max intervals",
      purpose: "Shorter VO2 max blocks - British Cycling method",
      zone: "Z5",
      duration: 70,
      intervals: () => [
        warmup(),
        ...Array(6).fill(0).flatMap((_, i) => [
          interval(`VO2 Max ${i+1}`, 240, 106, 120, "4-min VO2 max effort", "vo2max"),
          ...(i < 5 ? [restInterval(240)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-4x8",
      title: "VO2 Max Workout",
      description: "4x8 VO2 max intervals - Seiler protocol",
      purpose: "Long VO2 max intervals - Seiler 4x8 research protocol",
      zone: "Z5",
      duration: 80,
      intervals: () => [
        warmup(),
        ...Array(4).fill(0).flatMap((_, i) => [
          interval(`VO2 Max ${i+1}`, 480, 104, 115, "8-min VO2 max effort", "vo2max"),
          ...(i < 3 ? [restInterval(240)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-pyramid",
      title: "VO2 Max Workout",
      description: "VO2 max pyramid: 2-3-4-3-2", 
      purpose: "Progressive VO2 max building - European method",
      zone: "Z5",
      duration: 65,
      intervals: () => [
        warmup(),
        interval("VO2 1", 120, 106, 120, "2-min build", "vo2max"),
        restInterval(120),
        interval("VO2 2", 180, 106, 120, "3-min extend", "vo2max"),
        restInterval(180),
        interval("VO2 3", 240, 106, 120, "4-min peak", "vo2max"),
        restInterval(240),
        interval("VO2 4", 180, 106, 120, "3-min descend", "vo2max"),
        restInterval(120),
        interval("VO2 5", 120, 106, 120, "2-min finish", "vo2max"),
        cooldown(),
      ],
    },
    {
      id: "vo2-short-power",
      title: "VO2 Max Workout", 
      description: "Short high-power VO2 max repeats",
      purpose: "Neuromuscular + VO2 max - TrainingPeaks high power protocol",
      zone: "Z5",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`VO2 ${i+1}`, 90, 115, 130, "90s high power", "vo2max"),
          ...(i < 7 ? [restInterval(270)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-tabata-style",
      title: "VO2 Max Workout",
      description: "Tabata-style VO2 max intervals", 
      purpose: "VO2 max + anaerobic - Tabata protocol adapted for cycling",
      zone: "Z5-Z6",
      duration: 50,
      intervals: () => [
        warmup(),
        // First set
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Tabata ${i+1}`, 20, 130, 150, "20s max effort", "anaerobic"),
          restInterval(10),
        ]),
        restInterval(300),
        // Second set
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Tabata ${i+9}`, 20, 130, 150, "20s max effort", "anaerobic"),
          restInterval(10),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-mixed-durations",
      title: "VO2 Max Workout",
      description: "Mixed duration VO2 max intervals", 
      purpose: "Varied VO2 max stress - Hunter Allen variation method",
      zone: "Z5",
      duration: 70,
      intervals: () => [
        warmup(),
        interval("VO2 Max 1", 180, 106, 118, "3-min moderate", "vo2max"),
        restInterval(180), 
        interval("VO2 Max 2", 120, 110, 125, "2-min higher power", "vo2max"),
        restInterval(240),
        interval("VO2 Max 3", 300, 104, 115, "5-min sustained", "vo2max"),
        restInterval(300),
        interval("VO2 Max 4", 90, 115, 130, "90s final burst", "vo2max"),
        cooldown(),
      ],
    },
    {
      id: "vo2-billats",
      title: "VO2 Max Workout",
      description: "Billat 30-30 intervals",
      purpose: "VO2 max via intermittent method - Billat research protocol",
      zone: "Z5",
      duration: 60,
      intervals: () => [
        warmup(),
        // First set: 12x 30s on/30s off
        ...Array(12).fill(0).flatMap((_, i) => [
          interval(`Billat ${i+1}`, 30, 110, 125, "30s VO2 max effort", "vo2max"),
          restInterval(30),
        ]),
        restInterval(600), // 10 min recovery
        // Second set: 12x 30s on/30s off  
        ...Array(12).fill(0).flatMap((_, i) => [
          interval(`Billat ${i+13}`, 30, 110, 125, "30s VO2 max effort", "vo2max"),
          restInterval(30),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-micro-intervals",
      title: "VO2 Max Workout",
      description: "VO2 max micro-intervals: 15s on/15s off",
      purpose: "VO2 max via micro-interval method - Laursen protocol variation",
      zone: "Z5",
      duration: 55,
      intervals: () => [
        warmup(),
        ...Array(24).fill(0).flatMap((_, i) => [
          interval(`Micro ${i+1}`, 15, 120, 140, "15s max effort", "vo2max"),
          restInterval(15),
        ]),
        restInterval(600), // Recovery
        ...Array(16).fill(0).flatMap((_, i) => [
          interval(`Micro ${i+25}`, 15, 120, 140, "15s max effort", "vo2max"),
          restInterval(15),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-climbing-simulation",
      title: "VO2 Max Workout",
      description: "Climbing VO2 max simulation",
      purpose: "VO2 max with climbing specificity - mountain bike/climbing focus",
      zone: "Z5",
      duration: 75,
      intervals: () => [
        warmup(),
        ...Array(4).fill(0).flatMap((_, i) => [
          interval(`Climb ${i+1}`, 360, 104, 115, "6-min climbing effort", "vo2max", {cadenceLow: 70, cadenceHigh: 80}),
          ...(i < 3 ? [restInterval(360)] : []),
        ]),
        cooldown(),
      ],
    },
  ],
  
  ANAEROBIC: [
    // ─── Anaerobic/Sprint (Z6): Power & Neuromuscular Development ──
    {
      id: "anaerobic-classic-repeats", 
      title: "Anaerobic Workout",
      description: "Classic anaerobic power repeats",
      purpose: "Anaerobic power & capacity - Coggan/Allen Z6 protocol",
      zone: "Z6",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(6).fill(0).flatMap((_, i) => [
          interval(`Anaerobic ${i+1}`, 45, 121, 150, "45s high power effort", "anaerobic"),
          ...(i < 5 ? [restInterval(225)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "sprint-neuromuscular",
      title: "Anaerobic Workout", 
      description: "Sprint neuromuscular power",
      purpose: "Neuromuscular power development - TrainingPeaks sprint protocol",
      zone: "Z6",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Sprint ${i+1}`, 15, 150, 200, "15s maximal sprint", "sprint"),
          ...(i < 7 ? [restInterval(225)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "anaerobic-hill-repeats",
      title: "Anaerobic Workout",
      description: "Hill repeat simulation", 
      purpose: "Climbing power - British Cycling hill repeat protocol",
      zone: "Z6",
      duration: 65,
      intervals: () => [
        warmup(),
        ...Array(5).fill(0).flatMap((_, i) => [
          interval(`Hill ${i+1}`, 90, 125, 145, "90s climbing power", "anaerobic", {cadenceLow: 70, cadenceHigh: 85}),
          ...(i < 4 ? [restInterval(360)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "anaerobic-lactate-tolerance",
      title: "Anaerobic Workout",
      description: "Lactate tolerance intervals",
      purpose: "Lactate buffering capacity - Laursen lactate tolerance protocol", 
      zone: "Z6",
      duration: 70,
      intervals: () => [
        warmup(),
        ...Array(4).fill(0).flatMap((_, i) => [
          interval(`Lactate ${i+1}`, 120, 115, 135, "2-min lactate tolerance", "anaerobic"),
          ...(i < 3 ? [restInterval(480)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "sprint-mixed-durations",
      title: "Anaerobic Workout",
      description: "Mixed duration sprint intervals",
      purpose: "Complete power curve development - Hunter Allen mixed method", 
      zone: "Z6",
      duration: 65,
      intervals: () => [
        warmup(),
        interval("Sprint 1", 10, 160, 220, "10s neuromuscular", "sprint"),
        restInterval(300),
        interval("Sprint 2", 20, 140, 180, "20s peak power", "sprint"),
        restInterval(360),
        interval("Sprint 3", 45, 125, 155, "45s anaerobic", "anaerobic"),
        restInterval(480),
        interval("Sprint 4", 90, 115, 140, "90s lactate", "anaerobic"),
        restInterval(600),
        interval("Sprint 5", 15, 150, 200, "Final 15s max", "sprint"),
        cooldown(),
      ],
    },
    {
      id: "criterium-simulation",
      title: "Anaerobic Workout",
      description: "Criterium race simulation",
      purpose: "Race-specific power - criterium/circuit race preparation",
      zone: "Z4-Z6",
      duration: 75,
      intervals: () => [
        warmup(),
        // Base tempo with surges
        interval("Tempo Base", 600, 76, 84, "Tempo foundation", "tempo"),
        ...Array(6).fill(0).flatMap((_, i) => [
          interval(`Attack ${i+1}`, 15, 140, 180, "Attack simulation", "sprint"),
          interval("Recovery", 45, 60, 70, "Soft pedal recovery", "recovery"),
        ]),
        interval("Tempo Base", 600, 76, 84, "Return to tempo", "tempo"),
        ...Array(3).fill(0).flatMap((_, i) => [
          interval(`Final Sprint ${i+1}`, 30, 130, 170, "Final sprint", "sprint"),
          ...(i < 2 ? [restInterval(120)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "anaerobic-wingate-style",
      title: "Anaerobic Workout",
      description: "Wingate-style max efforts",
      purpose: "Peak anaerobic power - Wingate test protocol adaptation",
      zone: "Z6",
      duration: 55,
      intervals: () => [
        warmup(),
        ...Array(4).fill(0).flatMap((_, i) => [
          interval(`Wingate ${i+1}`, 30, 140, 200, "30s all-out effort", "anaerobic"),
          ...(i < 3 ? [restInterval(600)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "track-sprint-progression",
      title: "Anaerobic Workout", 
      description: "Track sprint progression",
      purpose: "Sprint development - track cycling methodology",
      zone: "Z6",
      duration: 70,
      intervals: () => [
        warmup(),
        // Build sprints
        interval("Sprint Build 1", 8, 120, 160, "8s build", "sprint"),
        restInterval(300),
        interval("Sprint Build 2", 12, 130, 170, "12s extend", "sprint"),
        restInterval(360),
        interval("Sprint Build 3", 15, 140, 180, "15s peak", "sprint"),
        restInterval(480),
        // Flying sprints
        interval("Flying 1", 6, 150, 200, "6s flying sprint", "sprint"),
        restInterval(600),
        interval("Flying 2", 6, 150, 200, "6s flying sprint", "sprint"),
        cooldown(),
      ],
    },
  ],

  // ─── MORE BASE SPECIALIZATION ───────────────────────────────────
  BASE_EXTENDED: [
    {
      id: "base-motorpacing-simulation",
      title: "Base Workout",
      description: "Motorpacing simulation",
      purpose: "Aerobic adaptation with steady high cadence - motorpacing method",
      zone: "Z2",
      duration: 85,
      intervals: () => [
        warmup(),
        interval("Motorpace Sim", 4200, 65, 75, "Steady high cadence pace line", "endurance", {cadenceLow: 95, cadenceHigh: 105}),
        cooldown(),
      ],
    },
    {
      id: "base-long-endurance",
      title: "Base Workout",
      description: "Long endurance ride",
      purpose: "Extended aerobic capacity - Seiler long easy day",
      zone: "Z1-Z2",
      duration: 150,
      intervals: () => [
        interval("Easy Warmup", 300, 50, 60, "Gentle start", "recovery"),
        interval("Long Endurance", 8700, 56, 68, "Extended aerobic effort", "endurance"),
        interval("Cool Spin", 300, 50, 60, "Easy finish", "recovery"),
      ],
    },
  ],
  
  // ─── TEMPO/SWEETSPOT SPECIALIZATION ──────────────────────────────
  TEMPO: [
    {
      id: "tempo-steady",
      title: "Tempo Workout",
      description: "Steady tempo efforts",
      purpose: "Tempo power development - Coggan Z3 training",
      zone: "Z3",
      duration: 70,
      intervals: () => [
        warmup(),
        interval("Tempo 1", 1200, 76, 84, "First tempo block", "tempo"),
        restInterval(300),
        interval("Tempo 2", 1200, 76, 84, "Second tempo block", "tempo"),
        restInterval(300),
        interval("Tempo 3", 900, 76, 84, "Final tempo block", "tempo"),
        cooldown(),
      ],
    },
    {
      id: "tempo-3x10",
      title: "Tempo Workout",
      description: "3x10 tempo intervals",
      purpose: "Tempo power with shorter blocks",
      zone: "Z3",
      duration: 70,
      intervals: () => [
        warmup(),
        ...Array(3).fill(0).flatMap((_, i) => [
          interval(`Tempo ${i+1}`, 600, 76, 84, "10-min tempo effort", "tempo"),
          ...(i < 2 ? [restInterval(240)] : []),
        ]),
        cooldown(),
      ],
    },
    {
      id: "tempo-pyramid-3-4-5",
      title: "Tempo Workout",
      description: "Tempo pyramid 3-4-5",
      purpose: "Progressive tempo building",
      zone: "Z3",
      duration: 65,
      intervals: () => [
        warmup(),
        interval("Tempo 1", 180, 76, 84, "3-min start", "tempo"),
        restInterval(180),
        interval("Tempo 2", 240, 76, 84, "4-min build", "tempo"),
        restInterval(240),
        interval("Tempo 3", 300, 76, 84, "5-min peak", "tempo"),
        restInterval(240),
        interval("Tempo 4", 240, 76, 84, "4-min descend", "tempo"),
        restInterval(180),
        interval("Tempo 5", 180, 76, 84, "3-min finish", "tempo"),
        cooldown(),
      ],
    },
  ],
  
  // ─── ROAD RACE SPECIALIZATION ───────────────────────────────────
  ROAD_RACE: [
    {
      id: "road-tempo-surges",
      title: "Road Race Workout",
      description: "Tempo with attacking surges",
      purpose: "Road race specific - constant attacks in breakaway",
      zone: "Z3-Z4",
      duration: 90,
      intervals: () => [
        warmup(),
        interval("Tempo Base", 1200, 76, 84, "Tempo pace line", "tempo"),
        ...Array(6).fill(0).flatMap((_, i) => [
          interval(`Attack ${i+1}`, 30, 110, 130, "Short attack", "vo2max"),
          interval("Recovery", 60, 76, 84, "Back to tempo", "tempo"),
        ]),
        interval("Final Tempo", 900, 76, 84, "Tempo finish", "tempo"),
        cooldown(),
      ],
    },
    {
      id: "road-climb-descent",
      title: "Road Race Workout",
      description: "Climb + descent simulation",
      purpose: "Road race climbing specificity",
      zone: "Z4-Z5",
      duration: 80,
      intervals: () => [
        warmup(),
        ...Array(3).fill(0).flatMap((_, i) => [
          interval(`Climb ${i+1}`, 300, 104, 115, "Climbing effort", "vo2max", {cadenceLow: 70, cadenceHigh: 80}),
          interval(`Descent Recovery ${i+1}`, 180, 60, 70, "Recovery spin", "recovery", {cadenceLow: 90, cadenceHigh: 100}),
        ]),
        cooldown(),
      ],
    },
    {
      id: "road-long-threshold",
      title: "Road Race Workout",
      description: "Extended threshold for road racing",
      purpose: "Road race threshold - sustained effort on climbs",
      zone: "Z4",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Threshold", 1800, 88, 94, "30-min sustained threshold", "threshold"),
        cooldown(),
      ],
    },
  ],
  
  // ─── MOUNTAIN BIKE SPECIALIZATION ───────────────────────────────
  MTB: [
    {
      id: "mtb-pedaling-power",
      title: "MTB Workout",
      description: "Variable cadence climbing",
      purpose: "MTB specific - variable cadence power",
      zone: "Z4-Z5",
      duration: 75,
      intervals: () => [
        warmup(),
        ...Array(5).fill(0).flatMap((_, i) => [
          interval(`High Cadence Climb ${i+1}`, 120, 105, 115, "High cadence climbing", "vo2max", {cadenceLow: 85, cadenceHigh: 95}),
          interval(`Low Cadence Grind ${i+1}`, 120, 100, 110, "Low cadence power", "vo2max", {cadenceLow: 60, cadenceHigh: 70}),
          restInterval(180),
        ]),
        cooldown(),
      ],
    },
    {
      id: "mtb-short-sharp",
      title: "MTB Workout",
      description: "Short sharp climbs",
      purpose: "MTB technical climbing - repeated efforts",
      zone: "Z5-Z6",
      duration: 70,
      intervals: () => [
        warmup(),
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Climb ${i+1}`, 60, 110, 125, "Short sharp climb", "vo2max", {cadenceLow: 70, cadenceHigh: 80}),
          interval(`Recovery ${i+1}`, 120, 60, 70, "Recovery spin", "recovery"),
        ]),
        cooldown(),
      ],
    },
  ],
  
  // ─── GRAVEL/CYCLOCROSS SPECIALIZATION ──────────────────────────
  GRAVEL: [
    {
      id: "gravel-mixed-terrain",
      title: "Gravel Workout",
      description: "Mixed terrain power",
      purpose: "Gravel specific - varied power on technical terrain",
      zone: "Z3-Z5",
      duration: 90,
      intervals: () => [
        warmup(),
        interval("Tempo Base", 900, 76, 84, "Gravel pace - steady", "tempo"),
        ...Array(5).fill(0).flatMap((_, i) => [
          interval(`Technical Effort ${i+1}`, 180, 100, 115, "Technical terrain push", "vo2max"),
          interval("Recovery", 120, 60, 70, "Recovery spin", "recovery"),
        ]),
        interval("Tempo Finish", 600, 76, 84, "Return to tempo", "tempo"),
        cooldown(),
      ],
    },
    {
      id: "gravel-long-varied",
      title: "Gravel Workout",
      description: "Long varied terrain ride",
      purpose: "Gravel endurance with varied effort",
      zone: "Z2-Z3",
      duration: 120,
      intervals: () => [
        interval("Base Start", 1200, 60, 70, "Easy aerobic base", "endurance"),
        interval("Tempo Section", 900, 76, 84, "Tempo effort", "tempo"),
        interval("Base", 1200, 60, 70, "Back to easy", "endurance"),
        interval("Tempo Section", 900, 76, 84, "Second tempo", "tempo"),
        interval("Base Finish", 900, 60, 70, "Easy finish", "endurance"),
      ],
    },
  ],
  
  // ─── TRACK CYCLING SPECIALIZATION ───────────────────────────────
  TRACK: [
    {
      id: "track-pursuit-simulation",
      title: "Track Workout",
      description: "Pursuit race simulation",
      purpose: "Track pursuit - sustained high power",
      zone: "Z4-Z5",
      duration: 30,
      intervals: () => [
        warmup(),
        interval("Pursuit Effort", 1200, 110, 125, "4-min pursuit pace", "vo2max"),
        cooldown(),
      ],
    },
    {
      id: "track-scratch-simulation",
      title: "Track Workout",
      description: "Scratch race simulation",
      purpose: "Track scratch - varied pace with surges",
      zone: "Z3-Z6",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base Pace", 600, 76, 84, "Scratch race pace", "tempo"),
        ...Array(8).fill(0).flatMap((_, i) => [
          interval(`Attack ${i+1}`, 20, 150, 200, "Sprint attack", "sprint"),
          interval(`Recovery ${i+1}`, 60, 76, 84, "Return to pace", "tempo"),
        ]),
        cooldown(),
      ],
    },
  ],
};

// ─── SESSION SELECTION ───────────────────────────────────────────────

function selectWorkoutTemplate(
  zone: string, 
  previousTemplateId?: string,
  specialization?: string
): WorkoutTemplate {
  // Map zone to template category
  let templateZone = zone;
  
  // If a sport specialization is specified, use it
  if (specialization && SESSION_TEMPLATES[specialization]) {
    templateZone = specialization;
  }
  
  const templates = SESSION_TEMPLATES[templateZone] || SESSION_TEMPLATES.BASE;
  
  // Filter out previous template to avoid repetition
  const availableTemplates = previousTemplateId 
    ? templates.filter(t => t.id !== previousTemplateId)
    : templates;
    
  // Select random template
  const randomIndex = Math.floor(Math.random() * availableTemplates.length);
  return availableTemplates[randomIndex] || templates[0];
}

// ─── GENERATION ENGINE INTEGRATION ──────────────────────────────────
// Use training engine instead of hardcoded templates for duration-aware sessions

import { createSession } from "./training-engine";
import { scaleSessionToDuration } from "./training-engine/duration-scaler";
import type { AthleteProfile, SessionGoal } from "./training-engine/types";

/**
 * Map block type to training goal for generation engine
 */
function blockTypeToGoal(blockType: BlockType): SessionGoal {
  const goalMap: Record<BlockType, SessionGoal> = {
    BASE: "Endurance",
    THRESHOLD: "LactateThreshold",
    VO2MAX: "VO2Max",
    RACE_SIM: "SprintPower",
  };
  return goalMap[blockType];
}

/**
 * Create athlete profile for generation engine
 */
function createAthleteProfile(): AthleteProfile {
  // Using standard athlete profile
  // In production, would come from user's FTP test + profile
  return {
    ftp: 280, // Default/placeholder
    weight: 75,
    maxHr: 190,
    restingHr: 60,
    level: "Intermediate",
  };
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

function generateIndoorSession(
  blockType: BlockType, 
  weekType: WeekType, 
  day: DayOfWeek,
  weekNum?: number,
  previousTemplates?: Partial<Record<DayOfWeek, WorkoutTemplate>>,
  userSeed?: string // For per-user variation
): SessionDef {
  const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
  
  let zone: string;
  let isMonday = dayIndex === 0;
  
  // MONDAY IS SACRED: Always stick to the planned block type
  // Other days can vary more freely within the energy system
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
      zone = "ANAEROBIC";
      break;
    default:
      zone = "BASE";
  }
  
  // Skip rest days
  if (dayIndex === 2 || dayIndex === 5 || dayIndex === 6) {
    // These are typically rest days (Wed, Sat, Sun)
    // Only generate sessions for Mon, Tue, Thu, Fri
    const baseSession = generateRestDay(day);
    return baseSession;
  }
  
  // For non-Monday sessions, allow some variation in zone selection
  // (but keep it reasonable - stay within the same energy system)
  let selectedZone = zone;
  if (!isMonday && userSeed) {
    // Seed the random variation per user (so same user gets consistent variety)
    // but different users get different workouts
    const userRandomizer = Math.abs(
      userSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    ) % 100;
    
    // Small chance to swap to a complementary zone on non-Monday days
    if (userRandomizer < 20) {
      // 20% chance to use a complementary zone on non-Monday days
      if (zone === "BASE") selectedZone = "TEMPO";
      else if (zone === "THRESHOLD") selectedZone = "TEMPO";
      else if (zone === "VO2MAX") selectedZone = "THRESHOLD";
      else if (zone === "ANAEROBIC") selectedZone = "VO2MAX";
    }
  }
  
  // Select a template for this zone/day, avoiding previous week's template
  const previousTemplate = previousTemplates?.[day];
  const template = selectWorkoutTemplate(selectedZone, previousTemplate?.id);
  
  // Build intervals from template
  const intervals = template.intervals();
  
  // Construct full session with template-generated intervals
  // NOTE: Duration is calculated from actual intervals by fixSessionDuration()
  // Do NOT copy template.duration or baseSession.duration - let them be recalculated
  return {
    dayOfWeek: day,
    sessionType: "INDOOR",
    title: template.title,
    description: template.description,
    purpose: template.purpose,
    duration: 0, // Placeholder - will be set by fixSessionDuration()
    intervals,
    templateId: template.id,
  };
}

// ─── Duration Fix ────────────────────────────────────────────────────

function fixSessionDuration(session: SessionDef, weekType?: WeekType): SessionDef {
  if (session.sessionType === "OUTDOOR") return session; // Outdoor durations are set by route
  
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  let durationMins = Math.round(totalSecs / 60);
  
  // Adjust duration based on periodization phase
  if (weekType) {
    switch (weekType) {
      case "RECOVERY":
        // Recovery weeks: shorter sessions (target 45-50 min)
        if (durationMins > 50) {
          durationMins = Math.round(durationMins * 0.85); // Reduce by 15%
        }
        break;
      case "BUILD":
        // Build weeks: standard duration (target 55-65 min)
        // Keep as calculated
        break;
      case "BUILD_PLUS":
        // Build+ weeks: longer sessions (target 65-75 min)
        if (durationMins < 65) {
          durationMins = Math.round(durationMins * 1.1); // Increase by 10%
        }
        break;
      case "OVERREACH":
        // Overreach weeks: longest sessions (target 75+ min)
        if (durationMins < 75) {
          durationMins = Math.round(durationMins * 1.25); // Increase by 25%
        }
        break;
    }
  }
  
  return { ...session, duration: durationMins };
}

// ─── Full Plan Generator ─────────────────────────────────────────────

/**
 * PHASE 4: Extended plan generation with personalization options
 * Now uses SESSION_TEMPLATES database for real variety
 */
export function generatePlan(
  numBlocks: number = 4,
  trainingDays: DayOfWeek[] = ["MON", "TUE", "THU", "FRI", "SAT"],
  outdoorDay: DayOfWeek = "SAT",
  season?: Season,
  raceType?: string,
  useAINames?: boolean,
  riderId?: string, // For per-user variation (Monday locked, other days vary by user)
  includeInitialFTPTest: boolean = true // Always start with FTP test to establish baselines
): PlanDef {
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
    const firstBlock: BlockDef = {
      blockNumber: 1,
      type: "BASE",
      weeks: [
        {
          weekNumber: 1,
          weekType: "BUILD",
          sessions: [
            // MONDAY: FTP Test (20-minute Coggan protocol)
            {
              dayOfWeek: "MON",
              sessionType: "INDOOR",
              title: "FTP Test",
              description: "Establish baseline functional threshold power for zone calibration",
              purpose: "Determine FTP for all power zones - Coggan 20-minute protocol",
              duration: 35,
              intervals: [
                interval("Easy Warmup 1", 300, 50, 60, "Gentle start", "recovery"),
                interval("Build 1", 300, 60, 70, "Build gradually", "endurance"),
                interval("Build 2", 300, 70, 80, "Continue building", "endurance"),
                interval("Surge 1", 120, 85, 95, "First surge", "tempo"),
                restInterval(300),
                interval("Surge 2", 120, 85, 95, "Second surge", "tempo"),
                restInterval(600),
                // Main 20-minute FTP test
                interval("FTP Test Effort", 1200, 95, 105, "20-minute steady max effort at threshold", "threshold"),
                restInterval(600),
                // Cool down with efforts to test leg freshness
                interval("Sprint 1", 120, 100, 150, "2-min post-test effort", "anaerobic"),
                restInterval(300),
                interval("Sprint 2", 120, 100, 150, "2-min final effort", "anaerobic"),
                interval("Easy Cooldown", 300, 40, 50, "Easy spin recovery", "recovery"),
              ],
            },
            // REST OF WEEK: Recovery days only
            generateRestDay("TUE"),
            generateRestDay("WED"),
            {
              dayOfWeek: "THU",
              sessionType: "INDOOR",
              title: "Easy Recovery Spin",
              description: "Light spinning recovery after FTP test",
              purpose: "Active recovery - flush metabolic waste",
              duration: 45,
              intervals: [
                interval("Recovery Spin", 2700, 45, 60, "Easy aerobic spinning", "recovery"),
              ],
            },
            generateRestDay("FRI"),
            {
              dayOfWeek: "SAT",
              sessionType: "OUTDOOR",
              title: "Easy Outdoor Recovery",
              description: "Light outdoor ride to recover from testing day",
              purpose: "Easy active recovery",
              duration: 90,
              intervals: [],
            },
            generateRestDay("SUN"),
          ],
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
            riderId
          ).map(s => fixSessionDuration(s, weekType));
          
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
      
      // Generate sessions with template-based variety
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
        riderId  // Pass rider ID for per-user variation
      ).map(s => fixSessionDuration(s, weekType)); // Apply duration scaling based on week type
      
      // Track templates for next week's variety (avoid same template week-to-week)
      sessions.forEach(s => {
        // Store template by name to avoid repetition
        const templateKey = s.title;
        const matchingTemplate = Object.values(SESSION_TEMPLATES)
          .flat()
          .find(t => t.title === templateKey);
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

    blocks.push({ blockNumber: blockNum + 1, type: blockType, weeks });
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
