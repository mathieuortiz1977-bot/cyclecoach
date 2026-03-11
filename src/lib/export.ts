// Workout Export — .zwo (Zwift), .mrc (Generic), .erg (TrainerRoad/Wahoo)
import type { SessionDef, IntervalDef } from "./periodization";

// ─── Zwift .zwo Format ───────────────────────────────────────────────

export function exportToZWO(session: SessionDef, ftp: number, coachNotesStyle?: string): string {
  const intervals = session.intervals.map((i, idx) => 
    intervalToZwoXml(i, ftp, {
      isFirst: idx === 0,
      sessionPurpose: session.purpose,
      coachNotesStyle,
    })
  ).join("\n        ");
  
  // Include purpose in description if available
  const fullDescription = session.purpose
    ? `📌 Purpose: ${session.purpose}\n\n${session.description}`
    : session.description;

  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
    <author>CycleCoach</author>
    <name>${escapeXml(session.title)}</name>
    <description>${escapeXml(fullDescription)}</description>
    <sportType>bike</sportType>
    <durationType>time</durationType>
    <tags>
        <tag name="CycleCoach"/>
    </tags>
    <workout>
        ${intervals}
    </workout>
</workout_file>`;
}

// Greeting messages for first interval (100 possibilities!)
// SHORTENED: Fits Zwift display (60 chars max)
const GREETINGS = [
  "🚀 Let's go!",
  "💪 Time to suffer!",
  "⚡ Get stronger!",
  "🎯 Become unstoppable",
  "🔥 Light up your fitness",
  "🏆 Championship mode",
  "🚴 Earn those watts",
  "💯 Leave it all out there",
  "🌟 Future you thanks you",
  "⚙️ Tune the engine",
  "😂 I'm cozy. You? Not yet.",
  "☕ Sipping coffee. You suffer.",
  "🍰 Dessert me. Lactate you.",
  "🛋️ Comfy here. Go FTP!",
  "📱 Cheering while you suffer",
  "😎 So comfortable right now",
  "🎬 Best part of my day",
  "🍕 Pizza for me. VO2 for you.",
  "🧘 Namaste. Now suffer.",
  "😤 Relaxing. You? Working.",
  "☀️ Perfect day for suffering",
  "🎵 Suffering playlist ready",
  "🎭 Your suffering = my show",
  "📊 Let's hurt those watts",
  "🌋 Find your pain",
  "⚔️ Battle time",
  "🎪 The show begins",
  "🍷 Wine time. You? Count.",
  "😈 Games begin",
  "🔥 Burn it down",
  "🖤 I'm warm. You earn it.",
  "😑 I sit. You don't.",
  "🎯 Suffering = adaptation",
  "💀 Fitness built here",
  "🔪 Time to hurt. Productively.",
  "⚰️ Comfort zone: gone.",
  "🌑 Dark side of training",
  "😶 Your breathing gets heavy",
  "🧛 Watch you suffer. Science.",
  "🥶 Cold & hard incoming",
  "🔗 Chains don't break",
  "💔 No pain, no gain",
  "🚨 Threshold approaching",
  "🌪️ Storm coming",
  "📍 Your new normal",
  "🎨 Lactate masterpiece",
  "🧪 Experiment on your limits",
  "⚡ 60 min questioning life",
  "🌊 Wave of hurt",
  "🏜️ Desert awaits",
  "☕ Coffee 3. You? Interval 1.",
  "🛏️ Fluffing pillow. You? Hurt.",
  "📺 Streaming your power meter",
  "🧦 Cozy socks. You? Threshold.",
  "🎬 Popcorn ready. Watch burn.",
  "🛁 Bath later. You? Earn it.",
  "📚 Reading. You? Writing pain.",
  "🎧 Podcast. Suffer symphony you.",
  "🍪 Cookie me. Zero you.",
  "💆 Spa. Sprint. Pick one.",
  "🎮 Gaming soon. First suffer.",
  "🌴 Island vibes. Pain for you.",
  "😴 Nap soon. Not for you.",
  "🎵 Chill music. Hard efforts.",
  "🕯️ Candles. HR training you.",
  "👔 Work done. Your shift starts.",
  "🍷 Wine. You? Whine.",
  "🎁 Enjoying this immensely",
  "⏰ Relax vs. RUN",
  "🌟 Your moment to shine",
  "🧠 Mind over matter test",
  "💭 Prove it",
  "🎯 No shortcuts",
  "🚪 Improvement awaits",
  "🏅 Medal or couch?",
  "🤔 What's your ceiling?",
  "🎲 Roll the dice",
  "🧗 Mountain time",
  "🌊 Hurt wave",
  "🎪 Center ring: YOU",
  "🔓 Unlock something",
  "💎 Pressure forges diamonds",
  "🌱 Suffer the harvest",
  "🎭 Showtime",
  "🗺️ New territory",
  "😑 I sit. You don't.",
  "🎯 Weakness exits loud.",
  "🔥 Oven preheated",
  "⚡ Question everything",
  "🧊 Reality check time",
  "🎬 My favorite moment",
  "🛀 Bubble trouble",
  "😴 Your nap isn't coming",
  "🌙 HR climbs",
  "🎊 Party = suffering",
  "🧘 Zen: eliminated",
  "☕ Espresso vs. Despair",
  "🎪 Circus open",
  "🔮 I see suffering",
  "💪 You got this",
]


interface IntervalXmlOptions {
  isFirst?: boolean;
  sessionPurpose?: string;
  coachNotesStyle?: string;
}

function generateSessionGreeting(sessionPurpose?: string): string {
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  
  if (sessionPurpose) {
    return `${greeting} Today we're ${sessionPurpose.toLowerCase()}. Let's go! 🔥`;
  }
  
  return greeting;
}

function intervalToZwoXml(interval: IntervalDef, ftp: number, opts: IntervalXmlOptions = {}): string {
  const powerLow = interval.powerLow / 100;
  const powerHigh = interval.powerHigh / 100;
  const dur = interval.durationSecs;
  const cadence = interval.cadenceLow ? ` Cadence="${interval.cadenceLow}"` : "";
  
  // Build message: greeting (if first) + interval purpose + coaching note
  let message: string;
  if (opts.isFirst) {
    const greeting = generateSessionGreeting(opts.sessionPurpose);
    message = escapeXml(`${greeting}\n\n📌 ${interval.purpose}\n${interval.coachNote}`);
  } else {
    message = escapeXml(`📌 ${interval.purpose}\n${interval.coachNote}`);
  }
  
  // Message display duration: 15 seconds (allows full read of longer messages)
  const messageDuration = 15;

  // Determine Zwift interval type
  const nameLower = interval.name.toLowerCase();

  if (nameLower === "cooldown" || nameLower === "cool down") {
    return `<Cooldown Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${message}" duration="${messageDuration}"/>
        </Cooldown>`;
  }

  if (nameLower.includes("rest") || nameLower.includes("recovery")) {
    // Rest intervals are steady-state at low power, NOT cooldown
    const avgPower = (powerLow + powerHigh) / 2;
    return `<SteadyState Duration="${dur}" Power="${avgPower}"${cadence}>
            <textevent timeoffset="0" message="${message}" duration="${messageDuration}"/>
        </SteadyState>`;
  }

  if (nameLower.includes("warmup") || nameLower.includes("warm")) {
    return `<Warmup Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${message}" duration="${messageDuration}"/>
        </Warmup>`;
  }

  if (Math.abs(powerLow - powerHigh) < 0.05) {
    // Steady state
    return `<SteadyState Duration="${dur}" Power="${(powerLow + powerHigh) / 2}"${cadence}>
            <textevent timeoffset="0" message="${message}" duration="${messageDuration}"/>
        </SteadyState>`;
  }

  // Ramp
  return `<Ramp Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${message}" duration="${messageDuration}"/>
        </Ramp>`;
}

// ─── .MRC Format (Golden Cheetah / Generic) ──────────────────────────

export function exportToMRC(session: SessionDef): string {
  let time = 0;
  const lines: string[] = [
    `[COURSE HEADER]`,
    `VERSION = 2`,
    `UNITS = ENGLISH`,
    `DESCRIPTION = ${session.title} - ${session.description}`,
    `FILE NAME = ${session.title.replace(/[^a-zA-Z0-9]/g, "_")}`,
    `MINUTES PERCENT`,
    `[END COURSE HEADER]`,
    `[COURSE DATA]`,
  ];

  for (const interval of session.intervals) {
    const startMin = time / 60;
    const avgPower = (interval.powerLow + interval.powerHigh) / 2;

    // Start of interval
    lines.push(`${startMin.toFixed(2)}\t${avgPower.toFixed(0)}`);

    time += interval.durationSecs;
    const endMin = time / 60;

    // End of interval (if power changes)
    const endPower = interval.powerHigh;
    lines.push(`${endMin.toFixed(2)}\t${endPower.toFixed(0)}`);
  }

  lines.push(`[END COURSE DATA]`);

  // Add text events
  lines.push(`[COURSE TEXT]`);
  time = 0;
  for (const interval of session.intervals) {
    const startMin = time / 60;
    lines.push(`${startMin.toFixed(2)}\t${interval.coachNote}`);
    time += interval.durationSecs;
  }
  lines.push(`[END COURSE TEXT]`);

  return lines.join("\n");
}

// ─── .ERG Format (Wahoo / CompuTrainer) ──────────────────────────────

export function exportToERG(session: SessionDef, ftp: number): string {
  let time = 0;
  const lines: string[] = [
    `[COURSE HEADER]`,
    `FTP = ${ftp}`,
    `DESCRIPTION = ${session.title}`,
    `MINUTES WATTS`,
    `[END COURSE HEADER]`,
    `[COURSE DATA]`,
  ];

  for (const interval of session.intervals) {
    const startMin = time / 60;
    const wattsStart = Math.round(ftp * interval.powerLow / 100);
    const wattsEnd = Math.round(ftp * interval.powerHigh / 100);

    lines.push(`${startMin.toFixed(2)}\t${wattsStart}`);
    time += interval.durationSecs;
    lines.push(`${(time / 60).toFixed(2)}\t${wattsEnd}`);
  }

  lines.push(`[END COURSE DATA]`);
  return lines.join("\n");
}

// ─── JSON Export (for backup/sharing) ────────────────────────────────

export function exportToJSON(session: SessionDef, ftp: number): string {
  return JSON.stringify({
    app: "CycleCoach",
    version: "1.0",
    exportDate: new Date().toISOString(),
    ftp,
    session: {
      ...session,
      intervals: session.intervals.map((i) => ({
        ...i,
        wattsLow: Math.round(ftp * i.powerLow / 100),
        wattsHigh: Math.round(ftp * i.powerHigh / 100),
      })),
    },
  }, null, 2);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function downloadFile(content: string, filename: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke to let the browser initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
