// Auto-complete engine — matches Strava activities to planned sessions
import type { SessionDef, DayOfWeek } from "./periodization";
import { getPlannedAvgPowerPct, DAY_ORDER } from "./constants";

export interface ExternalActivity {
  source: "strava" | "trainingpeaks";
  externalId: string;
  name: string;
  date: string; // ISO date
  dayOfWeek: DayOfWeek;
  movingTime: number; // seconds
  elapsedTime: number; // seconds
  distance?: number; // meters
  avgPower?: number;
  normalizedPower?: number;
  maxPower?: number;
  avgHr?: number;
  maxHr?: number;
  avgCadence?: number;
  elevationGain?: number;
  tss?: number; // calculated from power data
  type: string; // "Ride", "VirtualRide", etc.
}

export interface MatchResult {
  session: SessionDef;
  sessionIndex: number;
  activity: ExternalActivity;
  confidence: number; // 0-100
  matchReason: string;
  autoData: {
    avgPower?: number;
    normalizedPower?: number;
    duration: number;
    avgHr?: number;
    maxHr?: number;
    tss?: number;
    completed: boolean;
  };
}

/**
 * Match external activities to planned sessions.
 * Matching logic:
 * 1. Same day of week
 * 2. Activity type matches (Ride/VirtualRide = indoor, Ride with distance = outdoor)
 * 3. Duration within ±30% of planned
 * 4. Power zone alignment (if power data available)
 */
export function matchActivitiesToSessions(
  activities: ExternalActivity[],
  sessions: SessionDef[],
  ftp: number
): MatchResult[] {
  const results: MatchResult[] = [];
  const usedActivities = new Set<string>();
  const usedSessions = new Set<number>();

  // Sort by confidence — try best matches first
  const candidates: { sessionIdx: number; activity: ExternalActivity; score: number; reason: string }[] = [];

  for (let si = 0; si < sessions.length; si++) {
    const session = sessions[si];
    for (const activity of activities) {
      if (!isCyclingActivity(activity.type)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Day match (strongest signal)
      if (activity.dayOfWeek === session.dayOfWeek) {
        score += 40;
        reasons.push("same day");
      } else {
        // Adjacent day (±1) gets partial credit
        const planned = DAY_ORDER.indexOf(session.dayOfWeek);
        const actual = DAY_ORDER.indexOf(activity.dayOfWeek);
        if (Math.abs(planned - actual) === 1) {
          score += 15;
          reasons.push("adjacent day");
        } else {
          continue; // Skip if more than 1 day off
        }
      }

      // Type match
      const isOutdoor = session.sessionType === "OUTDOOR";
      const activityIsOutdoor = activity.distance && activity.distance > 15000; // >15km = outdoor
      if (isOutdoor === !!activityIsOutdoor) {
        score += 20;
        reasons.push("type match");
      } else {
        score += 5;
      }

      // Duration match
      const plannedDuration = session.duration * 60;
      const durationRatio = activity.movingTime / plannedDuration;
      if (durationRatio >= 0.7 && durationRatio <= 1.3) {
        score += 20;
        reasons.push(`duration ${Math.round(durationRatio * 100)}%`);
      } else if (durationRatio >= 0.5 && durationRatio <= 1.5) {
        score += 10;
        reasons.push(`duration ${Math.round(durationRatio * 100)}%`);
      }

      // Power zone alignment
      if (activity.avgPower && ftp > 0) {
        const plannedAvgPct = getPlannedAvgPowerPct(session.intervals);
        const actualPct = (activity.avgPower / ftp) * 100;
        const powerDiff = Math.abs(actualPct - plannedAvgPct);
        if (powerDiff < 10) {
          score += 20;
          reasons.push("power zone match");
        } else if (powerDiff < 20) {
          score += 10;
          reasons.push("power zone close");
        }
      }

      candidates.push({ sessionIdx: si, activity, score, reason: reasons.join(", ") });
    }
  }

  // Sort by score descending and greedily assign
  candidates.sort((a, b) => b.score - a.score);

  for (const c of candidates) {
    if (usedActivities.has(c.activity.externalId) || usedSessions.has(c.sessionIdx)) continue;
    if (c.score < 30) continue; // Minimum threshold

    usedActivities.add(c.activity.externalId);
    usedSessions.add(c.sessionIdx);

    results.push({
      session: sessions[c.sessionIdx],
      sessionIndex: c.sessionIdx,
      activity: c.activity,
      confidence: c.score,
      matchReason: c.reason,
      autoData: {
        avgPower: c.activity.avgPower,
        normalizedPower: c.activity.normalizedPower,
        duration: c.activity.movingTime,
        avgHr: c.activity.avgHr,
        maxHr: c.activity.maxHr,
        tss: c.activity.tss || calculateTSS(c.activity, ftp),
        completed: c.activity.movingTime >= sessions[c.sessionIdx].duration * 60 * 0.7,
      },
    });
  }

  return results;
}

function isCyclingActivity(type: string): boolean {
  return ["Ride", "VirtualRide", "EBikeRide"].includes(type);
}

function calculateTSS(activity: ExternalActivity, ftp: number): number | undefined {
  if (!activity.normalizedPower || !ftp) return undefined;
  const intensity = activity.normalizedPower / ftp;
  return Math.round((activity.movingTime * activity.normalizedPower * intensity) / (ftp * 3600) * 100);
}
