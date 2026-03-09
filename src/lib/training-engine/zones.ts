/**
 * Power and HR Zone Calculations
 * Pure, stateless calculators using Coggan methodology
 */

import { AthleteProfile, IntervalBlock, TrainingZone } from "./types";

// ─── COGGAN POWER ZONES (% OF FTP) ────────────────────────────────
// Source: Hunter Allen & Andrew Coggan methodology

const POWER_ZONES: Record<TrainingZone, { min: number; max: number; label: string }> = {
  Z1: { min: 0, max: 55, label: "Active Recovery" },
  Z2: { min: 55, max: 75, label: "Endurance" },
  Z3: { min: 75, max: 90, label: "Tempo" },
  Z4: { min: 90, max: 105, label: "Threshold" },
  Z5: { min: 105, max: 120, label: "VO2 Max" },
  Z6: { min: 120, max: 150, label: "Anaerobic" },
  Z7: { min: 150, max: 200, label: "Sprint" },
};

// ─── POWER CALCULATOR ────────────────────────────────────────────

export class PowerCalculator {
  constructor(private athlete: AthleteProfile) {}

  /**
   * Get power range (watts) for a zone
   */
  getPowerRange(zone: TrainingZone): { min: number; max: number } {
    const zoneDef = POWER_ZONES[zone];
    return {
      min: Math.round((zoneDef.min / 100) * this.athlete.ftp),
      max: Math.round((zoneDef.max / 100) * this.athlete.ftp),
    };
  }

  /**
   * Get power range for a percentage range
   */
  getPowerForPercentage(minPercent: number, maxPercent: number): { min: number; max: number } {
    return {
      min: Math.round((minPercent / 100) * this.athlete.ftp),
      max: Math.round((maxPercent / 100) * this.athlete.ftp),
    };
  }

  /**
   * Get HR targets using Karvonen method (HR reserve based)
   */
  getHrRange(zone: TrainingZone): { min: number; max: number } {
    const zoneDef = POWER_ZONES[zone];
    const hrReserve = this.athlete.maxHr - this.athlete.restingHr;
    const minHr = this.athlete.restingHr + (hrReserve * zoneDef.min) / 100;
    const maxHr = this.athlete.restingHr + (hrReserve * zoneDef.max) / 100;
    return {
      min: Math.round(minHr),
      max: Math.round(maxHr),
    };
  }

  /**
   * Calculate power per kg for a given power and athlete weight
   */
  getPowerPerKg(watts: number): number {
    return parseFloat((watts / this.athlete.weight).toFixed(2));
  }

  /**
   * Calculate kJ for a power/duration combo
   */
  getKiloJoules(avgWatts: number, durationSeconds: number): number {
    return parseFloat(((avgWatts * durationSeconds) / 1000).toFixed(1));
  }

  /**
   * Calculate kcal from kJ (assuming 24% mechanical efficiency, rest is heat)
   */
  getKiloCalories(kj: number): number {
    const efficiency = 0.24;
    return parseFloat((kj / efficiency).toFixed(0));
  }

  /**
   * Calculate carb needs based on intensity and duration
   */
  getCarbNeeds(avgWatts: number, durationSeconds: number): number {
    const durationHours = durationSeconds / 3600;
    const percentFtp = (avgWatts / this.athlete.ftp) * 100;

    let carbPerHour = 0;
    if (percentFtp < 85) {
      carbPerHour = 30;
    } else if (percentFtp < 95) {
      carbPerHour = 45;
    } else {
      carbPerHour = 60;
    }

    return Math.round(carbPerHour * durationHours);
  }
}

// ─── TSS CALCULATOR ──────────────────────────────────────────────

export class TssCalculator {
  constructor(private athlete: AthleteProfile) {}

  /**
   * Calculate Normalized Power (4th power mean)
   * NP = (mean of 30s rolling average power^4)^0.25
   * Approximation: we'll use average of all block avgPowers
   */
  calculateNormalizedPower(blockAvgPowers: number[]): number {
    if (blockAvgPowers.length === 0) return 0;

    // Simplified: 4th power mean of average power values
    const sumOfFourthPowers = blockAvgPowers.reduce((sum, power) => sum + Math.pow(power, 4), 0);
    const meanOfFourthPowers = sumOfFourthPowers / blockAvgPowers.length;
    const np = Math.pow(meanOfFourthPowers, 0.25);

    return parseFloat(np.toFixed(0));
  }

  /**
   * Calculate Intensity Factor (NP / FTP)
   */
  calculateIntensityFactor(np: number): number {
    return parseFloat((np / this.athlete.ftp).toFixed(2));
  }

  /**
   * Calculate TSS (Training Stress Score)
   * TSS = (duration_seconds × NP × IF) / (FTP × 3600) × 100
   */
  calculateTss(durationSeconds: number, np: number): number {
    const if_ = this.calculateIntensityFactor(np);
    const tss = (durationSeconds * np * if_) / (this.athlete.ftp * 3600) * 100;
    return parseFloat(tss.toFixed(1));
  }

  /**
   * Calculate all session metrics at once
   */
  calculateSessionMetrics(
    durationSeconds: number,
    blockAvgPowers: number[],
  ): {
    np: number;
    if: number;
    tss: number;
  } {
    const np = this.calculateNormalizedPower(blockAvgPowers);
    const if_ = this.calculateIntensityFactor(np);
    const tss = this.calculateTss(durationSeconds, np);

    return { np, if: if_, tss };
  }
}

/**
 * Helper to populate calculated fields on an IntervalBlock
 */
export function enrichBlockWithCalculations(
  block: IntervalBlock,
  athlete: AthleteProfile,
): IntervalBlock {
  const powerCalc = new PowerCalculator(athlete);

  // Power targets
  const powerRange = powerCalc.getPowerForPercentage(block.targetPowerMin, block.targetPowerMax);
  block.targetWattsMin = powerRange.min;
  block.targetWattsMax = powerRange.max;

  // HR targets
  const hrRange = powerCalc.getHrRange(block.zone);
  block.targetHrMin = hrRange.min;
  block.targetHrMax = hrRange.max;

  // Energy metrics
  const avgWatts = (block.targetWattsMin + block.targetWattsMax) / 2;
  block.avgPower = parseFloat(avgWatts.toFixed(0));
  block.kj = powerCalc.getKiloJoules(avgWatts, block.durationSeconds);
  block.kcal = powerCalc.getKiloCalories(block.kj);

  return block;
}
