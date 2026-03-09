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
  previousTemplates: Partial<Record<DayOfWeek, WorkoutTemplate>> = {}
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
      session = generateIndoorSession(
        blockType, 
        weekType, 
        day,
        weekInBlock,
        previousTemplates
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
  BASE: [
    {
      id: "base-steady",
      title: "Base Workout", 
      description: "Steady aerobic base building",
      purpose: "Build aerobic base with steady effort",
      zone: "Z2",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base Steady", 3600, 65, 75, "Build aerobic engine with steady effort", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-progressive", 
      title: "Base Workout",
      description: "Progressive aerobic build",
      purpose: "Build aerobic capacity with progressive effort",
      zone: "Z2",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base Build 1", 1200, 60, 70, "Start easy, build gradually", "endurance"),
        interval("Base Build 2", 1200, 70, 75, "Increase effort slightly", "endurance"), 
        interval("Base Build 3", 1200, 75, 80, "Final progression", "endurance"),
        cooldown(),
      ],
    },
    {
      id: "base-tempo",
      title: "Base Workout", 
      description: "Base with tempo pickups",
      purpose: "Aerobic base with tempo accents",
      zone: "Z2",
      duration: 75,
      intervals: () => [
        warmup(),
        interval("Base", 1200, 65, 70, "Aerobic base effort", "endurance"),
        interval("Tempo", 300, 80, 85, "Tempo pickup", "tempo"),
        interval("Base", 1200, 65, 70, "Return to base", "endurance"),
        interval("Tempo", 300, 80, 85, "Second pickup", "tempo"),
        interval("Base", 900, 65, 70, "Finish with base", "endurance"),
        cooldown(),
      ],
    },
  ],
  
  THRESHOLD: [
    {
      id: "threshold-steady",
      title: "Threshold Workout",
      description: "Sustained threshold efforts", 
      purpose: "Build threshold power with sustained efforts",
      zone: "Z4",
      duration: 60,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 900, 88, 95, "First threshold block", "threshold"),
        restInterval(300),
        interval("Threshold 2", 900, 88, 95, "Second threshold block", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-pyramid",
      title: "Threshold Workout", 
      description: "Pyramid threshold structure",
      purpose: "Progressive threshold building",
      zone: "Z4", 
      duration: 60,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 360, 88, 95, "Build up", "threshold"),
        restInterval(120),
        interval("Threshold 2", 420, 88, 95, "Extend effort", "threshold"),
        restInterval(180),
        interval("Threshold 3", 480, 88, 95, "Peak effort", "threshold"),
        restInterval(180),
        interval("Threshold 4", 420, 88, 95, "Come down", "threshold"),
        restInterval(120),
        interval("Threshold 5", 360, 88, 95, "Finish strong", "threshold"),
        cooldown(),
      ],
    },
    {
      id: "threshold-micro",
      title: "Threshold Workout",
      description: "Micro threshold intervals",
      purpose: "Threshold power with frequent recovery",
      zone: "Z4",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(8).fill(0).flatMap(() => [
          interval("Threshold", 120, 88, 95, "Short threshold effort", "threshold"),
          restInterval(60),
        ]),
        cooldown(),
      ],
    },
    {
      id: "threshold-descending", 
      title: "Threshold Workout",
      description: "Descending threshold intervals",
      purpose: "Sustained power as intervals get shorter",
      zone: "Z4",
      duration: 60,
      intervals: () => [
        warmup(),
        interval("Threshold 1", 600, 88, 95, "Long effort", "threshold"),
        restInterval(240),
        interval("Threshold 2", 480, 88, 95, "Medium effort", "threshold"), 
        restInterval(180),
        interval("Threshold 3", 360, 88, 95, "Shorter effort", "threshold"),
        restInterval(120),
        interval("Threshold 4", 240, 88, 95, "Final sprint", "threshold"),
        cooldown(),
      ],
    },
  ],
  
  VO2MAX: [
    {
      id: "vo2-steady",
      title: "VO2 Max Workout",
      description: "Sustained VO2 max efforts",
      purpose: "Build maximal aerobic power",
      zone: "Z5", 
      duration: 60,
      intervals: () => [
        warmup(),
        interval("VO2 Max 1", 300, 105, 115, "First VO2 effort", "vo2max"),
        restInterval(300),
        interval("VO2 Max 2", 300, 105, 115, "Second VO2 effort", "vo2max"), 
        restInterval(300),
        interval("VO2 Max 3", 300, 105, 115, "Third VO2 effort", "vo2max"),
        cooldown(),
      ],
    },
    {
      id: "vo2-pyramid",
      title: "VO2 Max Workout",
      description: "Pyramid VO2 max structure", 
      purpose: "Progressive VO2 max building",
      zone: "Z5",
      duration: 60,
      intervals: () => [
        warmup(),
        interval("VO2 1", 120, 105, 115, "Build up", "vo2max"),
        restInterval(120),
        interval("VO2 2", 180, 105, 115, "Extend", "vo2max"),
        restInterval(180),
        interval("VO2 3", 240, 105, 115, "Peak", "vo2max"),
        restInterval(240),
        interval("VO2 4", 180, 105, 115, "Come down", "vo2max"),
        restInterval(120),
        interval("VO2 5", 120, 105, 115, "Finish", "vo2max"),
        cooldown(),
      ],
    },
    {
      id: "vo2-short",
      title: "VO2 Max Workout", 
      description: "Short VO2 max repeats",
      purpose: "High power VO2 max development",
      zone: "Z5",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(6).fill(0).flatMap(() => [
          interval("VO2 Max", 90, 110, 120, "Short high power", "vo2max"),
          restInterval(180),
        ]),
        cooldown(),
      ],
    },
    {
      id: "vo2-mixed",
      title: "VO2 Max Workout",
      description: "Mixed VO2 max intervals", 
      purpose: "Varied VO2 max stimulation",
      zone: "Z5",
      duration: 60,
      intervals: () => [
        warmup(),
        interval("VO2 Max 1", 180, 105, 115, "Moderate duration", "vo2max"),
        restInterval(180), 
        interval("VO2 Max 2", 120, 110, 120, "Higher power", "vo2max"),
        restInterval(240),
        interval("VO2 Max 3", 240, 100, 110, "Longer effort", "vo2max"),
        restInterval(180),
        interval("VO2 Max 4", 90, 115, 125, "Final burst", "vo2max"),
        cooldown(),
      ],
    },
  ],
  
  ANAEROBIC: [
    {
      id: "anaerobic-repeats", 
      title: "Anaerobic Workout",
      description: "Anaerobic power repeats",
      purpose: "Build anaerobic power and capacity",
      zone: "Z6",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(6).fill(0).flatMap(() => [
          interval("Anaerobic", 45, 120, 150, "High power effort", "anaerobic"),
          restInterval(180),
        ]),
        cooldown(),
      ],
    },
    {
      id: "anaerobic-twitchy",
      title: "Anaerobic Workout", 
      description: "Short anaerobic bursts",
      purpose: "Neuromuscular power development",
      zone: "Z6",
      duration: 60,
      intervals: () => [
        warmup(),
        ...Array(10).fill(0).flatMap(() => [
          interval("Anaerobic", 20, 130, 180, "Explosive effort", "anaerobic"),
          restInterval(120),
        ]),
        cooldown(),
      ],
    },
    {
      id: "anaerobic-mixed",
      title: "Anaerobic Workout",
      description: "Mixed anaerobic efforts",
      purpose: "Complete anaerobic system development", 
      zone: "Z6",
      duration: 60,
      intervals: () => [
        warmup(),
        interval("Anaerobic 1", 60, 120, 140, "Long anaerobic", "anaerobic"),
        restInterval(240),
        interval("Anaerobic 2", 30, 140, 160, "Medium burst", "anaerobic"),
        restInterval(180),
        interval("Anaerobic 3", 15, 160, 200, "Short sprint", "anaerobic"),
        restInterval(240),
        interval("Anaerobic 4", 45, 125, 145, "Final effort", "anaerobic"),
        cooldown(),
      ],
    },
  ],
};

// ─── SESSION SELECTION ───────────────────────────────────────────────

function selectWorkoutTemplate(
  zone: string, 
  previousTemplateId?: string
): WorkoutTemplate {
  const templates = SESSION_TEMPLATES[zone] || SESSION_TEMPLATES.BASE;
  
  // Filter out previous template to avoid repetition
  const availableTemplates = previousTemplateId 
    ? templates.filter(t => t.id !== previousTemplateId)
    : templates;
    
  // Select random template
  const randomIndex = Math.floor(Math.random() * availableTemplates.length);
  return availableTemplates[randomIndex] || templates[0];
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
  previousTemplates?: Partial<Record<DayOfWeek, WorkoutTemplate>>
): SessionDef {
  // Map day to existing session generators to get the base structure + zone
  const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
  
  let baseSession: SessionDef;
  let zone: string;
  
  switch (blockType) {
    case "BASE":
      if (dayIndex === 0) baseSession = baseMonday(weekType);
      else if (dayIndex === 1) baseSession = baseTuesday(weekType);
      else if (dayIndex === 3) baseSession = baseThursday(weekType);
      else if (dayIndex === 4) baseSession = baseFriday(weekType);
      else baseSession = generateRestDay(day);
      zone = "BASE";
      break;
    case "THRESHOLD":
      if (dayIndex === 0) baseSession = thresholdMonday(weekType);
      else if (dayIndex === 1) baseSession = thresholdTuesday(weekType);
      else if (dayIndex === 3) baseSession = thresholdThursday(weekType);
      else if (dayIndex === 4) baseSession = thresholdFriday(weekType);
      else baseSession = generateRestDay(day);
      zone = "THRESHOLD";
      break;
    case "VO2MAX":
      if (dayIndex === 0) baseSession = vo2Monday(weekType);
      else if (dayIndex === 1) baseSession = vo2Tuesday(weekType);
      else if (dayIndex === 3) baseSession = vo2Thursday(weekType);
      else if (dayIndex === 4) baseSession = vo2Friday(weekType);
      else baseSession = generateRestDay(day);
      zone = "VO2MAX";
      break;
    case "RACE_SIM":
      if (dayIndex === 0) baseSession = raceSimMonday(weekType);
      else if (dayIndex === 1) baseSession = raceSimTuesday(weekType);
      else if (dayIndex === 3) baseSession = raceSimThursday(weekType);
      else if (dayIndex === 4) baseSession = raceSimFriday(weekType);
      else baseSession = generateRestDay(day);
      zone = "ANAEROBIC";
      break;
    default:
      baseSession = generateRestDay(day);
      zone = "BASE";
  }
  
  // Skip template selection for rest days
  if (baseSession.title === "Rest Day") {
    return baseSession;
  }
  
  // Select a template for this zone, avoiding previous week's template
  const previousTemplate = previousTemplates?.[day];
  const template = selectWorkoutTemplate(zone, previousTemplate?.id);
  
  // Build intervals from template
  const intervals = template.intervals();
  
  // Construct full session with template-generated intervals
  return {
    ...baseSession,
    title: template.title,
    description: template.description,
    purpose: template.purpose,
    duration: template.duration,
    intervals,
    templateId: template.id,
  };
}

// ─── Duration Fix ────────────────────────────────────────────────────

function fixSessionDuration(session: SessionDef): SessionDef {
  if (session.sessionType === "OUTDOOR") return session; // Outdoor durations are set by route
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  return { ...session, duration: Math.round(totalSecs / 60) };
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
  useAINames?: boolean
): PlanDef {
  resetCommentaryIndex();
  const blocks: BlockDef[] = [];
  let previousWeekStructures: Partial<Record<DayOfWeek, WorkoutStructure>> = {};
  let previousWeekTemplates: Partial<Record<DayOfWeek, WorkoutTemplate>> = {};

  for (let b = 0; b < numBlocks; b++) {
    const blockType = BLOCK_SEQUENCE[b % BLOCK_SEQUENCE.length];
    // PHASE 4: Use seasonal theme if provided
    const blockTheme = getSeasonalBlockTheme(blockType, season);
    const weeks: WeekDef[] = [];

    for (let w = 0; w < 4; w++) {
      const weekType = WEEK_SEQUENCE[w];
      const weekNum = w + 1;
      
      // Generate sessions with template-based variety
      let sessions = generateWeekSessions(
        blockType, 
        weekType, 
        b, 
        trainingDays, 
        outdoorDay,
        blockTheme,
        weekNum,
        previousWeekStructures,
        previousWeekTemplates  // Pass template tracking
      ).map(fixSessionDuration);
      
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

    blocks.push({ blockNumber: b + 1, type: blockType, weeks });
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
