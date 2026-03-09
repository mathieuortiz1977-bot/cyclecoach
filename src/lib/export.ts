// Workout Export — .zwo (Zwift), .mrc (Generic), .erg (TrainerRoad/Wahoo)
import type { SessionDef, IntervalDef } from "./periodization";

// ─── Zwift .zwo Format ───────────────────────────────────────────────

export function exportToZWO(session: SessionDef, ftp: number): string {
  const intervals = session.intervals.map((i, idx) => 
    intervalToZwoXml(i, ftp, {
      isFirst: idx === 0,
      sessionPurpose: session.purpose,
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
const GREETINGS = [
  // Classic Motivational (1-10)
  "🚀 Let's go!",
  "💪 Time to suffer... I mean train!",
  "⚡ Ready to get stronger?",
  "🎯 Mission: become unstoppable",
  "🔥 Let's light up your fitness",
  "🏆 Championship mentality starts now",
  "🚴 Time to earn those watts",
  "💯 Leave it all out there",
  "🌟 Your future self will thank you",
  "⚙️ Time to tune the engine",
  
  // Funny/Sarcastic (11-30)
  "😂 Remember: I'm getting paid in hot cocoa to watch you suffer",
  "☕ While I sip my latte, you're about to suffer",
  "🍰 I'm having dessert. You? Lactate.",
  "🛋️ I'm getting comfy. Hope you are too... at FTP!",
  "📱 I'll be here cheering while you suffer",
  "😎 I'm so comfortable right now",
  "🎬 This is my favorite part of the day",
  "🍕 Just ordered pizza. You getting VO2?",
  "🧘 Namaste. Now go suffer.",
  "😤 I'm relaxing. You better be working.",
  "☀️ Beautiful day for your suffering",
  "🎵 The suffering playlist is ready",
  "⏱️ 60 minutes of you questioning your life choices",
  "🎭 Your suffering is my theater",
  "📊 Let's make those watts hurt",
  "🌋 Let's find your pain threshold",
  "⚔️ Battle time",
  "🎪 The show is about to begin",
  "🍷 I'm sipping wine. Make it count.",
  "😈 Let the games begin",
  
  // Dark/Honest (31-50)
  "🖤 I'm warm and cozy. Time for you to earn it.",
  "😑 Yeah, I'm sitting down. You won't be.",
  "🎯 Suffering is just your body adapting",
  "💀 This is where fitness is built",
  "🔪 Time to hurt. Productively.",
  "⚰️ Your comfort zone called. I hung up.",
  "🌑 Welcome to the dark side of training",
  "😶 I can already hear your breathing get heavy",
  "🧛 Let me watch you suffer. For science.",
  "🎪 Enjoy your private suffering show",
  "🥶 This is going to be cold and hard",
  "🔗 Chains don't break. Neither do legs that suffer.",
  "💔 No pain, no athletic gain",
  "🚨 Critical threshold approaching",
  "🌪️ A storm is coming",
  "📍 Welcome to your new normal",
  "🎰 Luck has nothing to do with this",
  "🏜️ Welcome to the desert",
  "🎨 We're about to paint a masterpiece... in lactate",
  "🧪 Let's run an experiment on your limits",
  
  // Coach Relaxing Vibes (51-70)
  "☕ I'm having my 3rd coffee. You're on your 1st interval.",
  "🛏️ Just getting my bed fluffed. You getting yours made? (Of suffering)",
  "📺 Great day for streaming... your power meter",
  "🧦 Getting cozy socks on. You getting cozy at threshold.",
  "🎬 Popcorn ready. Let's watch you suffer.",
  "🛁 I'm gonna take a bath after this. You'll earn yours.",
  "📚 Reading a book. You're writing yours. (Of pain)",
  "🎧 Podcast time for me. Suffering symphony for you.",
  "🍪 Cookie break for me. Cookie break = 0 for you.",
  "💆 Spa day energy. Sprinting energy for you.",
  "🎮 Gaming time soon. But first, you suffer.",
  "🌴 Island vibes for me. Island of pain for you.",
  "😴 Nap incoming. First, your nap isn't coming.",
  "🎵 Chill music. Hard intervals for you.",
  "🕯️ Aromatherapy candles. Your nose is doing HR training.",
  "👔 Work day over for me. Work day just started for you.",
  "🍷 Wine o'clock? More like your whine o'clock.",
  "📞 Friend called. I'll call them back. You? No time.",
  "🎁 Gift to myself: watching you suffer",
  "⏰ Clock says relax. Your legs say RUN.",
  
  // Psychological Game (71-85)
  "🧠 Mind over matter. Let's test yours.",
  "💭 Think you can? Prove it.",
  "🎯 No shortcuts. Only shortcuts to quitting.",
  "🚪 Door to improvement is right there",
  "🏅 Medal or couch? Your choice today.",
  "🤔 Ever wonder what your ceiling is?",
  "🎲 Let's roll the dice on your potential",
  "🧗 Mountain time",
  "🌊 Wave of hurt incoming",
  "🎪 Center ring: YOU",
  "🔓 Let's unlock something today",
  "💎 Diamonds form under pressure",
  "🌱 Plant the seeds. Suffer the harvest.",
  "🎭 Showtime",
  "🗺️ New territory today",
  
  // Brutally Honest (86-100)
  "😑 Still sitting. You won't be.",
  "🎯 Pain is just weakness leaving your body... loudly",
  "🔥 The oven is preheated",
  "⚡ 60 minutes of questioning everything",
  "🧊 Hot cocoa time for me. Cold reality for you.",
  "🎬 Best part of my day starts now",
  "🛀 Bubble bath calling. Bubble trouble calling you.",
  "😴 Almost nap time. Not for you though.",
  "🌙 Moon's coming up. So is your HR.",
  "🎊 Party mood! (Just kidding, suffer mood)",
  "🧘 Zen activated. Zen eliminated for you.",
  "☕ Espresso me. Despair you.",
  "🎪 The circus is open",
  "🌟 Star power activated... it's you suffering",
  "🔮 I see a lot of suffering in your future",
];


interface IntervalXmlOptions {
  isFirst?: boolean;
  sessionPurpose?: string;
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
