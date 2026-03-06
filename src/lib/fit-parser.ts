// Parse .fit files from Zwift, Garmin, Wahoo, etc.
// Extracts key cycling metrics

export interface FitRideSummary {
  source: "fit_file";
  name: string;
  date: string;
  movingTime: number; // seconds
  distance: number; // meters
  avgPower?: number;
  normalizedPower?: number;
  maxPower?: number;
  avgHr?: number;
  maxHr?: number;
  avgCadence?: number;
  elevationGain?: number;
  calories?: number;
  avgSpeed?: number;
  maxSpeed?: number;
}

export async function parseFitFile(buffer: ArrayBuffer): Promise<FitRideSummary> {
  const FitParser = (await import("fit-file-parser")).default;
  const parser = new FitParser({ force: true, mode: "list" });

  return new Promise((resolve, reject) => {
    parser.parse(buffer, (error: any, data: any) => {
      if (error) return reject(error);

      const sessions = data?.sessions || [];
      const session = sessions[0];
      const records = data?.records || [];

      if (!session && records.length === 0) {
        return reject(new Error("No session data found in .fit file"));
      }

      // Calculate NP from records if available
      let normalizedPower: number | undefined;
      if (records.length > 0) {
        const powers = records
          .filter((r: any) => r.power !== undefined && r.power > 0)
          .map((r: any) => r.power as number);

        if (powers.length > 30) {
          // 30-second rolling average, then 4th power
          const windowSize = 30;
          const rollingAvgs: number[] = [];
          for (let i = windowSize - 1; i < powers.length; i++) {
            const window = powers.slice(i - windowSize + 1, i + 1);
            rollingAvgs.push(window.reduce((a: number, b: number) => a + b, 0) / windowSize);
          }
          const fourthPowerAvg = rollingAvgs.reduce((sum: number, p: number) => sum + Math.pow(p, 4), 0) / rollingAvgs.length;
          normalizedPower = Math.round(Math.pow(fourthPowerAvg, 0.25));
        }
      }

      const summary: FitRideSummary = {
        source: "fit_file",
        name: session?.sport || "Zwift Ride",
        date: session?.start_time || session?.timestamp || new Date().toISOString(),
        movingTime: session?.total_timer_time || session?.total_elapsed_time || 0,
        distance: session?.total_distance || 0,
        avgPower: session?.avg_power || undefined,
        normalizedPower: normalizedPower || session?.normalized_power || undefined,
        maxPower: session?.max_power || undefined,
        avgHr: session?.avg_heart_rate || undefined,
        maxHr: session?.max_heart_rate || undefined,
        avgCadence: session?.avg_cadence || undefined,
        elevationGain: session?.total_ascent || undefined,
        calories: session?.total_calories || undefined,
        avgSpeed: session?.avg_speed || undefined,
        maxSpeed: session?.max_speed || undefined,
      };

      resolve(summary);
    });
  });
}
