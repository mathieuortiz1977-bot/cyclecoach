// Workout Export — .zwo (Zwift), .mrc (Generic), .erg (TrainerRoad/Wahoo)
import type { SessionDef, IntervalDef } from "./periodization";

// ─── Zwift .zwo Format ───────────────────────────────────────────────

export function exportToZWO(session: SessionDef, ftp: number): string {
  const intervals = session.intervals.map((i) => intervalToZwoXml(i, ftp)).join("\n        ");
  
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

function intervalToZwoXml(interval: IntervalDef, ftp: number): string {
  const powerLow = interval.powerLow / 100;
  const powerHigh = interval.powerHigh / 100;
  const dur = interval.durationSecs;
  const cadence = interval.cadenceLow ? ` Cadence="${interval.cadenceLow}"` : "";
  const note = escapeXml(interval.coachNote);

  // Determine Zwift interval type
  const isLast = false; // caller doesn't pass index, so cooldown detection is name-based
  const nameLower = interval.name.toLowerCase();

  if (nameLower === "cooldown" || nameLower === "cool down") {
    return `<Cooldown Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${note}"/>
        </Cooldown>`;
  }

  if (nameLower.includes("rest") || nameLower.includes("recovery")) {
    // Rest intervals are steady-state at low power, NOT cooldown
    const avgPower = (powerLow + powerHigh) / 2;
    return `<SteadyState Duration="${dur}" Power="${avgPower}"${cadence}>
            <textevent timeoffset="0" message="${note}"/>
        </SteadyState>`;
  }

  if (nameLower.includes("warmup") || nameLower.includes("warm")) {
    return `<Warmup Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${note}"/>
        </Warmup>`;
  }

  if (Math.abs(powerLow - powerHigh) < 0.05) {
    // Steady state
    return `<SteadyState Duration="${dur}" Power="${(powerLow + powerHigh) / 2}"${cadence}>
            <textevent timeoffset="0" message="${note}"/>
        </SteadyState>`;
  }

  // Ramp
  return `<Ramp Duration="${dur}" PowerLow="${powerLow}" PowerHigh="${powerHigh}"${cadence}>
            <textevent timeoffset="0" message="${note}"/>
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
