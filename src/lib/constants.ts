// Shared constants — single source of truth for labels, maps, and config
import type { DayOfWeek } from "./periodization";

// ─── Day mappings ────────────────────────────────────────────────────

export const DAY_LABELS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

export const DAY_FROM_INDEX: Record<number, string> = {
  0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT",
};

export const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function getTodayKey(): string {
  return DAY_FROM_INDEX[new Date().getDay()];
}

// ─── Block & Week labels ─────────────────────────────────────────────

export interface BlockMeta {
  label: string;
  emoji: string;
  color: string;
  gradient: string;
}

export const BLOCK_META: Record<string, BlockMeta> = {
  BASE: { label: "Base / Aerobic", emoji: "🏗️", color: "#3b82f6", gradient: "var(--gradient-base)" },
  THRESHOLD: { label: "Threshold / FTP", emoji: "⚡", color: "#eab308", gradient: "var(--gradient-threshold)" },
  VO2MAX: { label: "VO2max / Punch", emoji: "🔥", color: "#f97316", gradient: "var(--gradient-vo2max)" },
  RACE_SIM: { label: "Race Simulation", emoji: "🏁", color: "#ef4444", gradient: "var(--gradient-racesim)" },
};

export const WEEK_LABELS: Record<string, string> = {
  BUILD: "Build",
  BUILD_PLUS: "Build+",
  OVERREACH: "Overreach",
  RECOVERY: "Recovery 🧘",
};

// ─── Shared utility ──────────────────────────────────────────────────

export function getPlannedAvgPowerPct(intervals: { powerLow: number; powerHigh: number; durationSecs: number }[]): number {
  let totalPower = 0;
  let totalTime = 0;
  for (const interval of intervals) {
    const avg = (interval.powerLow + interval.powerHigh) / 2;
    totalPower += avg * interval.durationSecs;
    totalTime += interval.durationSecs;
  }
  return totalTime > 0 ? totalPower / totalTime : 60;
}
