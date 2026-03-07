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

export interface SessionDef {
  dayOfWeek: DayOfWeek;
  sessionType: "INDOOR" | "OUTDOOR";
  duration: number; // minutes
  title: string;
  description: string;
  intervals: IntervalDef[];
  route?: RouteData;
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

// ─── BASE Block Sessions ─────────────────────────────────────────────

function baseMonday(weekType: WeekType): SessionDef {
  const mult = weekType === "RECOVERY" ? 0.85 : weekType === "OVERREACH" ? 1.1 : 1;
  const dur = weekType === "RECOVERY" ? 50 : 60;
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: dur,
    title: "Endurance + Tempo Bursts",
    description: "Build aerobic base with controlled tempo surges. The bread and butter of base training.",
    intervals: [
      warmup(),
      interval("Z2 Endurance", 600, 56, 70, "Aerobic base building — fat oxidation and capillary development", "endurance", { rpe: 3 }),
      interval("Tempo Burst", Math.round(180 * mult), 76, 85, "Teach the body to handle pace changes without panic", "tempo", { rpe: 5, cadenceLow: 90, cadenceHigh: 100 }),
      interval("Z2 Endurance", 480, 56, 70, "Return to base — clear the mild fatigue from tempo", "endurance", { rpe: 3 }),
      interval("Tempo Burst", Math.round(180 * mult), 76, 85, "Second surge — building repeatability", "tempo", { rpe: 5, cadenceLow: 90, cadenceHigh: 100 }),
      interval("Z2 Endurance", 480, 56, 70, "Steady state aerobic work", "endurance", { rpe: 3 }),
      interval("Tempo Burst", Math.round(180 * mult), 76, 85, "Final surge — finish strong", "tempo", { rpe: 6 }),
      cooldown(),
    ],
  };
}

function baseTuesday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 1 : weekType === "BUILD" ? 2 : weekType === "BUILD_PLUS" ? 2 : 3;
  const repDur = weekType === "RECOVERY" ? 900 : weekType === "OVERREACH" ? 1200 : 1200;
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: `Sweet Spot ${reps}x${repDur / 60}min`,
    description: `Sweet spot intervals: maximum training stimulus for minimum recovery cost. ${reps} blocks of focused work.`,
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Sweet Spot #${i + 1}`, repDur, 88, 93, "Build sustained power at high aerobic intensity", "sweetspot", { rpe: 7, cadenceLow: 85, cadenceHigh: 95 }),
        ...(i < reps - 1 ? [restInterval(300)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function baseThursday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 2 : weekType === "OVERREACH" ? 4 : 3;
  const dur = weekType === "RECOVERY" ? 600 : 900;
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: `Tempo Repeats ${reps}x${dur / 60}min`,
    description: "Sustained tempo work to build muscular endurance and lactate clearance.",
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Tempo #${i + 1}`, dur, 76, 87, "Muscular endurance and lactate processing", "tempo", { rpe: 6, cadenceLow: 85, cadenceHigh: 95 }),
        ...(i < reps - 1 ? [restInterval(240)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function baseFriday(weekType: WeekType): SessionDef {
  const dur = weekType === "RECOVERY" ? 50 : 60;
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: dur,
    title: "Cadence & Technique",
    description: "Lighter day before Saturday. Focus on pedaling efficiency and neuromuscular activation.",
    intervals: [
      warmup(),
      interval("High Cadence Drill", 300, 56, 70, "Improve pedaling efficiency at high RPM", "cadence", { cadenceLow: 105, cadenceHigh: 120, rpe: 3 }),
      interval("Z2 Endurance", 360, 56, 70, "Recovery between drills", "endurance", { rpe: 3 }),
      interval("Single Leg Focus", 300, 50, 65, "Eliminate dead spots in pedal stroke", "cadence", { cadenceLow: 70, cadenceHigh: 80, rpe: 4 }),
      interval("Z2 Endurance", 360, 56, 70, "Recovery between drills", "endurance", { rpe: 3 }),
      interval("Spin-ups", 300, 56, 75, "Progressive cadence increase to 130 RPM", "cadence", { cadenceLow: 90, cadenceHigh: 130, rpe: 4 }),
      interval("Z2 Endurance", 300, 56, 65, "Easy spinning to finish", "endurance", { rpe: 2 }),
      cooldown(),
    ],
  };
}

// ─── THRESHOLD Block Sessions ────────────────────────────────────────

function thresholdMonday(weekType: WeekType): SessionDef {
  const sets = weekType === "RECOVERY" ? 2 : weekType === "OVERREACH" ? 4 : 3;
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: `Over-Unders ${sets} sets`,
    description: "Alternating above and below FTP. Teaches your body to clear lactate while still working hard.",
    intervals: [
      warmup(),
      ...Array.from({ length: sets }, (_, i) => [
        interval(`Over #${i + 1}`, 120, 100, 108, "Push above threshold — accumulate lactate", "threshold", { rpe: 8 }),
        interval(`Under #${i + 1}`, 180, 85, 92, "Clear lactate while maintaining effort", "sweetspot", { rpe: 6 }),
        interval(`Over #${i + 1}b`, 120, 100, 108, "Second surge — can you clear and push?", "threshold", { rpe: 8 }),
        ...(i < sets - 1 ? [restInterval(300)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function thresholdTuesday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 1 : weekType === "OVERREACH" ? 3 : 2;
  const dur = weekType === "RECOVERY" ? 900 : 1200;
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: `FTP Blocks ${reps}x${dur / 60}min`,
    description: `Sustained threshold work. This is where your FTP ceiling gets pushed higher.`,
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Threshold #${i + 1}`, dur, 95, 100, "Sustained work at FTP — the gold standard of threshold training", "threshold", { rpe: 8, cadenceLow: 85, cadenceHigh: 95 }),
        ...(i < reps - 1 ? [restInterval(300)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function thresholdThursday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 3 : weekType === "OVERREACH" ? 5 : 4;
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: `Threshold Repeats ${reps}x10min`,
    description: "Shorter threshold intervals with recovery. Build the ability to repeat hard efforts.",
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Threshold #${i + 1}`, 600, 95, 100, "Repeat threshold efforts — race simulation", "threshold", { rpe: 8 }),
        ...(i < reps - 1 ? [restInterval(180)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function thresholdFriday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 55,
    title: "Neuromuscular + Openers",
    description: "Short sprints to keep the snap in your legs, plus easy spinning before Saturday.",
    intervals: [
      warmup(),
      interval("Z2 Endurance", 360, 56, 70, "Settle into rhythm before sprints", "endurance", { rpe: 3 }),
      ...(weekType === "RECOVERY" ? [] : Array.from({ length: 4 }, (_, i) => [
        interval(`Sprint #${i + 1}`, 15, 130, 150, "Neuromuscular activation — keep the fast-twitch fibers awake", "sprint", { rpe: 9 }),
        restInterval(165),
      ]).flat()),
      interval("Z2 Endurance", 600, 56, 68, "Easy spinning to recover", "endurance", { rpe: 2 }),
      cooldown(),
    ],
  };
}

// ─── VO2MAX Block Sessions ───────────────────────────────────────────

function vo2Monday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 3 : weekType === "OVERREACH" ? 6 : 5;
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: `VO2max ${reps}x3min`,
    description: "Classic VO2max intervals. Short, brutal, effective. Your lungs will file a restraining order.",
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`VO2max #${i + 1}`, 180, 115, 120, "Maximize oxygen uptake — expand your aerobic ceiling", "vo2max", { rpe: 9, cadenceLow: 95, cadenceHigh: 110 }),
        restInterval(180),
      ]).flat(),
      cooldown(),
    ],
  };
}

function vo2Tuesday(weekType: WeekType): SessionDef {
  const sets = weekType === "RECOVERY" ? 2 : weekType === "OVERREACH" ? 4 : 3;
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: `Tabata-Style ${sets} sets`,
    description: "30/30 intervals: 30 seconds on, 30 seconds off. Sounds easy. It's not.",
    intervals: [
      warmup(),
      ...Array.from({ length: sets }, (_, s) => [
        ...Array.from({ length: 8 }, (_, i) => [
          interval(`Set ${s + 1} - On #${i + 1}`, 30, 120, 130, "Maximum aerobic stimulus in minimal time", "vo2max", { rpe: 9 }),
          restInterval(30),
        ]).flat(),
        ...(s < sets - 1 ? [restInterval(300)] : []),
      ]).flat(),
      cooldown(),
    ],
  };
}

function vo2Thursday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 3 : weekType === "OVERREACH" ? 5 : 4;
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: `Billats ${reps}x4min`,
    description: "4-minute VO2max intervals. Long enough to reach peak oxygen uptake. Long enough to suffer.",
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Billat #${i + 1}`, 240, 108, 115, "Extended VO2max stimulus — time at peak oxygen uptake", "vo2max", { rpe: 9, cadenceLow: 90, cadenceHigh: 105 }),
        restInterval(240),
      ]).flat(),
      cooldown(),
    ],
  };
}

function vo2Friday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 50,
    title: "Active Recovery + Openers",
    description: "Easy day. Your legs need it after this week. A few openers to stay sharp for Saturday.",
    intervals: [
      warmup(),
      interval("Z1 Recovery", 600, 40, 55, "Active recovery — promote blood flow", "recovery", { rpe: 2 }),
      interval("Z2 Endurance", 600, 56, 68, "Gentle aerobic work", "endurance", { rpe: 3 }),
      ...(weekType === "RECOVERY" ? [] : [
        interval("Opener", 30, 105, 115, "Brief effort to activate the legs for tomorrow", "vo2max", { rpe: 7 }),
        restInterval(120),
        interval("Opener", 30, 105, 115, "One more snap to keep the legs honest", "vo2max", { rpe: 7 }),
      ]),
      interval("Z1 Easy", 300, 35, 50, "Wind down", "recovery", { rpe: 1 }),
      cooldown(),
    ],
  };
}

// ─── RACE SIM Block Sessions ─────────────────────────────────────────

function raceSimMonday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "MON", sessionType: "INDOOR", duration: 60,
    title: "Race Simulation — Attacks",
    description: "Simulate race surges: threshold base with VO2max attacks. Because races aren't steady-state.",
    intervals: [
      warmup(),
      interval("Race Pace", 480, 85, 92, "Settle into race tempo", "sweetspot", { rpe: 6 }),
      interval("Attack!", 60, 115, 130, "Simulate a race surge — bridge a gap or launch an attack", "vo2max", { rpe: 9 }),
      interval("Recover in Pack", 240, 70, 80, "Recover while maintaining group speed", "tempo", { rpe: 5 }),
      interval("Attack!", 60, 115, 130, "Second surge — the race doesn't wait for you to recover", "vo2max", { rpe: 9 }),
      interval("Race Pace", 480, 85, 92, "Back to race tempo — can you hold it after those surges?", "sweetspot", { rpe: 7 }),
      interval("Final Sprint", 30, 140, 150, "Sprint finish — empty everything", "sprint", { rpe: 10 }),
      cooldown(),
    ],
  };
}

function raceSimTuesday(weekType: WeekType): SessionDef {
  const reps = weekType === "RECOVERY" ? 2 : 3;
  return {
    dayOfWeek: "TUE", sessionType: "INDOOR", duration: 60,
    title: `Climbing Repeats ${reps}x8min`,
    description: "Simulate repeated climbs at threshold. What Saturday feels like, but without the view.",
    intervals: [
      warmup(),
      ...Array.from({ length: reps }, (_, i) => [
        interval(`Climb #${i + 1}`, 480, 92, 100, "Sustained climbing effort — threshold on gradient", "threshold", { rpe: 8, cadenceLow: 70, cadenceHigh: 85 }),
        restInterval(300),
      ]).flat(),
      cooldown(),
    ],
  };
}

function raceSimThursday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "THU", sessionType: "INDOOR", duration: 60,
    title: "Mixed Intensity — Kitchen Sink",
    description: "Everything in one session. Endurance, tempo, threshold, VO2max. Like a race, you never know what's coming.",
    intervals: [
      warmup(),
      interval("Tempo", 600, 76, 87, "Build into the session", "tempo", { rpe: 5 }),
      interval("Threshold", 480, 92, 98, "Push to race pace", "threshold", { rpe: 7 }),
      restInterval(120),
      interval("VO2max Surge", 120, 110, 120, "Attack simulation", "vo2max", { rpe: 9 }),
      interval("Recovery", 180, 50, 60, "Brief recovery — not full, just enough", "recovery", { rpe: 2 }),
      interval("Sweet Spot", 600, 88, 93, "Return to sustained hard effort", "sweetspot", { rpe: 7 }),
      interval("Sprint Finish", 30, 135, 150, "All-out. Leave nothing.", "sprint", { rpe: 10 }),
      cooldown(),
    ],
  };
}

function raceSimFriday(weekType: WeekType): SessionDef {
  return {
    dayOfWeek: "FRI", sessionType: "INDOOR", duration: 50,
    title: "Pre-Race Openers",
    description: "Light session with sharp efforts. Get the legs ready for Saturday without fatiguing them.",
    intervals: [
      warmup(),
      interval("Z2 Spin", 600, 56, 68, "Easy aerobic work", "endurance", { rpe: 3 }),
      interval("Opener 1", 45, 105, 115, "Sharp effort — wake the legs up", "vo2max", { rpe: 7 }),
      restInterval(180),
      interval("Opener 2", 45, 105, 115, "One more — crisp and controlled", "vo2max", { rpe: 7 }),
      restInterval(180),
      ...(weekType !== "RECOVERY" ? [
        interval("Opener 3", 30, 120, 135, "Final snap — you're ready", "anaerobic", { rpe: 8 }),
        restInterval(120),
      ] : []),
      interval("Z1 Easy", 480, 40, 55, "Wind down. Tomorrow is the day.", "recovery", { rpe: 1 }),
      cooldown(),
    ],
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
  outdoorDay: DayOfWeek = "SAT"
): SessionDef[] {
  // Generate full week sessions (7 days)
  const allDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const sessions: SessionDef[] = [];

  for (const day of allDays) {
    if (!trainingDays.includes(day)) {
      // Rest day
      sessions.push(generateRestDay(day));
    } else if (day === outdoorDay) {
      // Outdoor day (usually longer ride)
      sessions.push(generateOutdoorSession(weekType, blockNum, day));
    } else {
      // Indoor training day
      sessions.push(generateIndoorSession(blockType, weekType, day));
    }
  }

  return sessions;
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

function generateIndoorSession(blockType: BlockType, weekType: WeekType, day: DayOfWeek): SessionDef {
  // Map day to existing session generators based on typical training structure
  const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
  
  switch (blockType) {
    case "BASE":
      if (dayIndex === 0) return baseMonday(weekType);
      if (dayIndex === 1) return baseTuesday(weekType);
      if (dayIndex === 3) return baseThursday(weekType);
      if (dayIndex === 4) return baseFriday(weekType);
      break;
    case "THRESHOLD":
      if (dayIndex === 0) return thresholdMonday(weekType);
      if (dayIndex === 1) return thresholdTuesday(weekType);
      if (dayIndex === 3) return thresholdThursday(weekType);
      if (dayIndex === 4) return thresholdFriday(weekType);
      break;
    case "VO2MAX":
      if (dayIndex === 0) return vo2Monday(weekType);
      if (dayIndex === 1) return vo2Tuesday(weekType);
      if (dayIndex === 3) return vo2Thursday(weekType);
      if (dayIndex === 4) return vo2Friday(weekType);
      break;
    case "RACE_SIM":
      if (dayIndex === 0) return raceSimMonday(weekType);
      if (dayIndex === 1) return raceSimTuesday(weekType);
      if (dayIndex === 3) return raceSimThursday(weekType);
      if (dayIndex === 4) return raceSimFriday(weekType);
      break;
  }
  
  // Fallback: easy endurance session
  return {
    dayOfWeek: day,
    sessionType: "INDOOR",
    duration: 60,
    title: "Easy Endurance",
    description: "Easy aerobic ride to maintain fitness.",
    intervals: [{
      name: "Easy Endurance",
      durationSecs: 3600,
      powerLow: 60,
      powerHigh: 65,
      zone: "Z2",
      purpose: "Active recovery",
      coachNote: getCoachNote("recovery")
    }],
  };
}

// ─── Duration Fix ────────────────────────────────────────────────────

function fixSessionDuration(session: SessionDef): SessionDef {
  if (session.sessionType === "OUTDOOR") return session; // Outdoor durations are set by route
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  return { ...session, duration: Math.round(totalSecs / 60) };
}

// ─── Full Plan Generator ─────────────────────────────────────────────

export function generatePlan(
  numBlocks: number = 4,
  trainingDays: DayOfWeek[] = ["MON", "TUE", "THU", "FRI", "SAT"],
  outdoorDay: DayOfWeek = "SAT"
): PlanDef {
  resetCommentaryIndex();
  const blocks: BlockDef[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const blockType = BLOCK_SEQUENCE[b % BLOCK_SEQUENCE.length];
    const weeks: WeekDef[] = [];

    for (let w = 0; w < 4; w++) {
      const weekType = WEEK_SEQUENCE[w];
      const sessions = generateWeekSessions(blockType, weekType, b, trainingDays, outdoorDay).map(fixSessionDuration);
      weeks.push({
        weekNumber: w + 1,
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
