// Heart Rate Zone Calculator
// Supports both percentage-based and Karvonen (HRR) methods

export interface HRZone {
  zone: string;
  name: string;
  minHr: number;
  maxHr: number;
  minPct: number;
  maxPct: number;
  color: string;
  description: string;
}

// Standard 5-zone model based on % of Max HR
export function calculateHRZonesPercentage(maxHr: number): HRZone[] {
  return [
    { zone: "Z1", name: "Recovery",   minPct: 50, maxPct: 60, minHr: Math.round(maxHr * 0.50), maxHr: Math.round(maxHr * 0.60), color: "#6b7280", description: "Easy recovery, active rest" },
    { zone: "Z2", name: "Aerobic",    minPct: 60, maxPct: 70, minHr: Math.round(maxHr * 0.60), maxHr: Math.round(maxHr * 0.70), color: "#3b82f6", description: "Base endurance, fat burning" },
    { zone: "Z3", name: "Tempo",      minPct: 70, maxPct: 80, minHr: Math.round(maxHr * 0.70), maxHr: Math.round(maxHr * 0.80), color: "#22c55e", description: "Aerobic capacity, steady effort" },
    { zone: "Z4", name: "Threshold",  minPct: 80, maxPct: 90, minHr: Math.round(maxHr * 0.80), maxHr: Math.round(maxHr * 0.90), color: "#eab308", description: "Lactate threshold, race pace" },
    { zone: "Z5", name: "VO2max",     minPct: 90, maxPct: 100, minHr: Math.round(maxHr * 0.90), maxHr: maxHr, color: "#ef4444", description: "Maximum effort, anaerobic" },
  ];
}

// Karvonen method: uses Heart Rate Reserve (HRR = MaxHR - RestingHR)
export function calculateHRZonesKarvonen(maxHr: number, restingHr: number): HRZone[] {
  const hrr = maxHr - restingHr;
  const calc = (pct: number) => Math.round(restingHr + hrr * (pct / 100));
  return [
    { zone: "Z1", name: "Recovery",   minPct: 50, maxPct: 60, minHr: calc(50), maxHr: calc(60), color: "#6b7280", description: "Easy recovery, active rest" },
    { zone: "Z2", name: "Aerobic",    minPct: 60, maxPct: 70, minHr: calc(60), maxHr: calc(70), color: "#3b82f6", description: "Base endurance, fat burning" },
    { zone: "Z3", name: "Tempo",      minPct: 70, maxPct: 80, minHr: calc(70), maxHr: calc(80), color: "#22c55e", description: "Aerobic capacity, steady effort" },
    { zone: "Z4", name: "Threshold",  minPct: 80, maxPct: 90, minHr: calc(80), maxHr: calc(90), color: "#eab308", description: "Lactate threshold, race pace" },
    { zone: "Z5", name: "VO2max",     minPct: 90, maxPct: 100, minHr: calc(90), maxHr: maxHr, color: "#ef4444", description: "Maximum effort, anaerobic" },
  ];
}

// LTHR-based zones (Joe Friel method)
export function calculateHRZonesLTHR(lthr: number): HRZone[] {
  return [
    { zone: "Z1", name: "Recovery",   minPct: 0, maxPct: 81, minHr: 0, maxHr: Math.round(lthr * 0.81), color: "#6b7280", description: "Easy recovery" },
    { zone: "Z2", name: "Aerobic",    minPct: 81, maxPct: 89, minHr: Math.round(lthr * 0.81), maxHr: Math.round(lthr * 0.89), color: "#3b82f6", description: "Aerobic endurance" },
    { zone: "Z3", name: "Tempo",      minPct: 90, maxPct: 93, minHr: Math.round(lthr * 0.90), maxHr: Math.round(lthr * 0.93), color: "#22c55e", description: "High aerobic / tempo" },
    { zone: "Z4", name: "SubThreshold", minPct: 94, maxPct: 99, minHr: Math.round(lthr * 0.94), maxHr: Math.round(lthr * 0.99), color: "#eab308", description: "Sub-lactate threshold" },
    { zone: "Z5a", name: "Threshold",  minPct: 100, maxPct: 102, minHr: lthr, maxHr: Math.round(lthr * 1.02), color: "#f97316", description: "Lactate threshold" },
    { zone: "Z5b", name: "VO2max",     minPct: 103, maxPct: 106, minHr: Math.round(lthr * 1.03), maxHr: Math.round(lthr * 1.06), color: "#ef4444", description: "Aerobic capacity" },
    { zone: "Z5c", name: "Anaerobic",  minPct: 106, maxPct: 115, minHr: Math.round(lthr * 1.06), maxHr: Math.round(lthr * 1.15), color: "#dc2626", description: "Anaerobic capacity" },
  ];
}

// Estimate max HR from age (rough but useful)
export function estimateMaxHR(age: number): number {
  return Math.round(220 - age); // Tanaka: 208 - 0.7 * age is more accurate
}

export function estimateMaxHRTanaka(age: number): number {
  return Math.round(208 - 0.7 * age);
}

// Get HR zone for a given heart rate
export function getHRZone(hr: number, zones: HRZone[]): HRZone | null {
  for (let i = zones.length - 1; i >= 0; i--) {
    if (hr >= zones[i].minHr) return zones[i];
  }
  return zones[0];
}

// Calculate time in each HR zone from an array of HR readings
export function calculateTimeInZones(
  hrReadings: number[],
  zones: HRZone[],
  intervalSeconds: number = 1
): { zone: string; name: string; seconds: number; percentage: number; color: string }[] {
  const counts: Record<string, number> = {};
  zones.forEach((z) => (counts[z.zone] = 0));

  hrReadings.forEach((hr) => {
    const zone = getHRZone(hr, zones);
    if (zone) counts[zone.zone]++;
  });

  const total = hrReadings.length;
  return zones.map((z) => ({
    zone: z.zone,
    name: z.name,
    seconds: counts[z.zone] * intervalSeconds,
    percentage: total > 0 ? Math.round((counts[z.zone] / total) * 100) : 0,
    color: z.color,
  }));
}

// Cardiac drift detection: compare HR in first half vs second half at similar power
export function detectCardiacDrift(
  firstHalfAvgHr: number,
  secondHalfAvgHr: number,
  firstHalfAvgPower: number,
  secondHalfAvgPower: number
): { driftPct: number; isSignificant: boolean; message: string } {
  // Cardiac drift = change in HR:Power ratio
  const ratio1 = firstHalfAvgHr / firstHalfAvgPower;
  const ratio2 = secondHalfAvgHr / secondHalfAvgPower;
  const driftPct = ((ratio2 - ratio1) / ratio1) * 100;

  return {
    driftPct: Math.round(driftPct * 10) / 10,
    isSignificant: Math.abs(driftPct) > 5, // >5% is noteworthy
    message:
      driftPct > 5
        ? `⚠️ Cardiac drift of ${driftPct.toFixed(1)}% detected. Your HR climbed relative to power — possible dehydration, heat stress, or insufficient aerobic base.`
        : driftPct > 3
          ? `📊 Mild cardiac drift of ${driftPct.toFixed(1)}%. Within normal range but worth monitoring.`
          : `✅ Minimal cardiac drift (${driftPct.toFixed(1)}%). Good aerobic efficiency.`,
  };
}
