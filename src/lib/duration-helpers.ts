/**
 * Duration Helpers: Convert percentage-based durations to seconds
 * 
 * Allows workouts to be defined once and scaled automatically
 * based on total workout duration.
 */

/**
 * Convert percentage of total workout duration to seconds
 * @param percent - Percentage of total duration (0-100)
 * @param totalDurationMinutes - Total workout duration in minutes
 * @returns Duration in seconds
 */
export function percentToSeconds(percent: number, totalDurationMinutes: number): number {
  return Math.round((percent / 100) * totalDurationMinutes * 60);
}

/**
 * Percentage-based interval definition
 * Use this instead of durationSecs for auto-scaling
 */
export interface PercentInterval {
  name: string;
  durationPercent: number;  // % of total workout time
  powerLow: number;
  powerHigh: number;
  zone: string;
  rpe?: number;
  purpose?: string;
  coachNote?: string;
}

/**
 * Helper to create warm-up as percentage of total
 * @param percent - % of total workout time (typical: 10-15%)
 */
export function warmupPercent(percent: number = 15) {
  return (totalMinutes: number): PercentInterval[] => [
    {
      name: 'Warm-up',
      durationPercent: percent,
      powerLow: 40,
      powerHigh: 65,
      zone: 'Z1-Z2',
      rpe: 2,
      purpose: 'Prepare system',
      coachNote: 'Build gradually',
    },
  ];
}

/**
 * Helper to create cool-down as percentage of total
 * @param percent - % of total workout time (typical: 10-15%)
 */
export function cooldownPercent(percent: number = 15) {
  return (totalMinutes: number): PercentInterval[] => [
    {
      name: 'Cool-down',
      durationPercent: percent,
      powerLow: 40,
      powerHigh: 55,
      zone: 'Z1',
      rpe: 1,
      purpose: 'Recovery',
      coachNote: 'Spin easy',
    },
  ];
}

/**
 * Helper to create work intervals at power level
 * @param name - Interval name
 * @param percent - % of total workout time
 * @param powerLow - Low power %FTP
 * @param powerHigh - High power %FTP
 * @param zone - Training zone
 * @param purpose - Training purpose
 */
export function workPercent(
  name: string,
  percent: number,
  powerLow: number,
  powerHigh: number,
  zone: string,
  purpose: string,
  coachNote: string = ''
): (totalMinutes: number) => PercentInterval[] {
  return (totalMinutes: number) => [
    {
      name,
      durationPercent: percent,
      powerLow,
      powerHigh,
      zone,
      rpe: Math.ceil((powerLow + powerHigh) / 2 / 15),
      purpose,
      coachNote,
    },
  ];
}

/**
 * Helper to create repeating work blocks
 * @param count - Number of repeats
 * @param workPercent - % of total for work interval
 * @param restPercent - % of total for rest interval
 * @param powerLow - Low power %FTP
 * @param powerHigh - High power %FTP
 * @param zone - Training zone
 */
export function repeatingWorkPercent(
  count: number,
  workPercent: number,
  restPercent: number,
  powerLow: number,
  powerHigh: number,
  zone: string,
  purpose: string,
  coachNote: string = ''
): (totalMinutes: number) => PercentInterval[] {
  return (totalMinutes: number) => {
    const intervals: PercentInterval[] = [];
    for (let i = 0; i < count; i++) {
      intervals.push({
        name: `Work ${i + 1}`,
        durationPercent: workPercent,
        powerLow,
        powerHigh,
        zone,
        rpe: Math.ceil((powerLow + powerHigh) / 2 / 15),
        purpose,
        coachNote,
      });
      if (i < count - 1) {
        intervals.push({
          name: `Rest ${i + 1}`,
          durationPercent: restPercent,
          powerLow: 40,
          powerHigh: 50,
          zone: 'Z1',
          rpe: 1,
          purpose: 'Recovery',
          coachNote: 'Easy',
        });
      }
    }
    return intervals;
  };
}

/**
 * Convert percentage-based intervals to fixed second-based intervals
 * @param percentIntervals - Intervals using durationPercent
 * @param totalDurationMinutes - Total workout duration
 * @returns Intervals with durationSecs
 */
export function convertPercentsToSeconds(
  percentIntervals: PercentInterval[],
  totalDurationMinutes: number
): Array<{
  name: string;
  durationSecs: number;
  powerLow: number;
  powerHigh: number;
  zone: string;
  rpe?: number;
  purpose?: string;
  coachNote?: string;
}> {
  return percentIntervals.map((interval) => ({
    name: interval.name,
    durationSecs: percentToSeconds(interval.durationPercent, totalDurationMinutes),
    powerLow: interval.powerLow,
    powerHigh: interval.powerHigh,
    zone: interval.zone,
    rpe: interval.rpe,
    purpose: interval.purpose,
    coachNote: interval.coachNote,
  }));
}

/**
 * Validate that percentages add up correctly
 * @param intervals - Intervals using durationPercent
 * @returns { valid: boolean, total: number, message: string }
 */
export function validatePercents(
  intervals: PercentInterval[]
): { valid: boolean; total: number; message: string } {
  const total = intervals.reduce((sum, i) => sum + i.durationPercent, 0);

  // Allow ±2% tolerance for rounding
  const valid = total >= 98 && total <= 102;

  return {
    valid,
    total,
    message: valid
      ? `✓ Percentages sum to ${total}% (valid)`
      : `✗ Percentages sum to ${total}% (should be ~100%)`,
  };
}

/**
 * Example: Convert a percentage-based workout to fixed durations
 * 
 * const intervals = [
 *   { name: 'Warm-up', durationPercent: 15, powerLow: 40, powerHigh: 65, ... },
 *   { name: 'Work', durationPercent: 70, powerLow: 90, powerHigh: 90, ... },
 *   { name: 'Cool-down', durationPercent: 15, powerLow: 40, powerHigh: 55, ... },
 * ];
 * 
 * const totalMinutes = 60;
 * const fixed = convertPercentsToSeconds(intervals, totalMinutes);
 * 
 * // Result: 
 * // { name: 'Warm-up', durationSecs: 900, ... }
 * // { name: 'Work', durationSecs: 2520, ... }
 * // { name: 'Cool-down', durationSecs: 900, ... }
 */
