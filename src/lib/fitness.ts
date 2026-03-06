// Fitness Metrics Calculator — CTL/ATL/TSB (Performance Management Chart)
// Based on the Banister Impulse-Response model (PMC)

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  tss: number;
  ctl: number; // Chronic Training Load (42-day EMA) = fitness
  atl: number; // Acute Training Load (7-day EMA) = fatigue
  tsb: number; // Training Stress Balance = form (CTL - ATL)
}

const CTL_DAYS = 42; // Fitness time constant
const ATL_DAYS = 7;  // Fatigue time constant

/**
 * Calculate CTL/ATL/TSB from daily TSS values
 * @param dailyTSS - array of { date, tss } sorted by date ascending
 * @param startingCTL - initial CTL (default 0)
 * @param startingATL - initial ATL (default 0)
 */
export function calculatePMC(
  dailyTSS: { date: string; tss: number }[],
  startingCTL: number = 0,
  startingATL: number = 0
): DailyMetric[] {
  const ctlDecay = Math.exp(-1 / CTL_DAYS);
  const atlDecay = Math.exp(-1 / ATL_DAYS);

  let ctl = startingCTL;
  let atl = startingATL;

  return dailyTSS.map(({ date, tss }) => {
    ctl = ctl * ctlDecay + tss * (1 - ctlDecay);
    atl = atl * atlDecay + tss * (1 - atlDecay);
    const tsb = ctl - atl;
    return {
      date,
      tss,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
    };
  });
}

/**
 * Estimate TSS from HR when power isn't available
 * Based on heart rate TSS (hrTSS) formula
 */
export function estimateHRTSS(
  durationSeconds: number,
  avgHR: number,
  maxHR: number,
  restingHR: number,
  lthr: number,
  gender: "male" | "female" = "male"
): number {
  const hrReserve = maxHR - restingHR;
  const lthrReserve = lthr - restingHR;
  const avgHRR = (avgHR - restingHR) / hrReserve;
  const lthrHRR = (lthr - restingHR) / hrReserve;

  // TRIMP exponential weighting factor
  const k = gender === "male" ? 1.92 : 1.67;
  const trimp = (durationSeconds / 60) * avgHRR * 0.64 * Math.exp(k * avgHRR);
  const trimpLTHR = 60 * lthrHRR * 0.64 * Math.exp(k * lthrHRR);

  return Math.round((trimp / trimpLTHR) * 100);
}

/**
 * Get training status based on TSB
 */
export function getTrainingStatus(tsb: number): {
  status: string;
  color: string;
  description: string;
  emoji: string;
} {
  if (tsb > 25) return { status: "Transition", color: "#6b7280", emoji: "😴", description: "Detraining zone — you're losing fitness. Time to get back to work." };
  if (tsb > 15) return { status: "Fresh", color: "#22c55e", emoji: "🟢", description: "Peak form for racing. Your body is rested and adapted." };
  if (tsb > 5) return { status: "Optimal", color: "#3b82f6", emoji: "🔵", description: "Good balance of fitness and freshness. Ready to perform." };
  if (tsb > -10) return { status: "Grey Zone", color: "#eab308", emoji: "🟡", description: "Neutral — not fresh, not overreached. Steady training zone." };
  if (tsb > -30) return { status: "Overreaching", color: "#f97316", emoji: "🟠", description: "Functional overreach — building fitness but accumulating fatigue." };
  return { status: "Overtrained", color: "#ef4444", emoji: "🔴", description: "Danger zone. Recovery needed. This is where injuries happen." };
}

/**
 * Calculate weekly TSS summary
 */
export function weeklyTSS(metrics: DailyMetric[]): { weekStart: string; totalTSS: number; avgCTL: number; avgATL: number }[] {
  const weeks: Record<string, { tss: number; ctl: number[]; atl: number[] }> = {};

  metrics.forEach((m) => {
    const d = new Date(m.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay()); // Sunday start
    const key = weekStart.toISOString().split("T")[0];

    if (!weeks[key]) weeks[key] = { tss: 0, ctl: [], atl: [] };
    weeks[key].tss += m.tss;
    weeks[key].ctl.push(m.ctl);
    weeks[key].atl.push(m.atl);
  });

  return Object.entries(weeks).map(([weekStart, data]) => ({
    weekStart,
    totalTSS: Math.round(data.tss),
    avgCTL: Math.round(data.ctl.reduce((a, b) => a + b, 0) / data.ctl.length * 10) / 10,
    avgATL: Math.round(data.atl.reduce((a, b) => a + b, 0) / data.atl.length * 10) / 10,
  }));
}

/**
 * Generate sample PMC data for demo/testing
 */
export function generateSamplePMC(weeks: number = 12): DailyMetric[] {
  const dailyTSS: { date: string; tss: number }[] = [];
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    const weekNum = Math.floor(i / 7);
    const isRecoveryWeek = weekNum % 4 === 3;

    let tss = 0;
    if (dayOfWeek === 0) { // Sunday rest
      tss = 0;
    } else if (dayOfWeek === 3) { // Wednesday rest
      tss = 0;
    } else if (dayOfWeek === 6) { // Saturday long ride
      tss = isRecoveryWeek ? 120 : 180 + Math.random() * 80;
    } else { // Indoor training days
      tss = isRecoveryWeek ? 40 + Math.random() * 20 : 65 + Math.random() * 35;
    }

    dailyTSS.push({
      date: d.toISOString().split("T")[0],
      tss: Math.round(tss),
    });
  }

  return calculatePMC(dailyTSS);
}
