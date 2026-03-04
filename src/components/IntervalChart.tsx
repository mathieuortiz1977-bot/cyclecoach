"use client";
import { getZoneColor } from "@/lib/zones";
import type { IntervalDef } from "@/lib/periodization";

export function IntervalChart({ intervals, ftp }: { intervals: IntervalDef[]; ftp: number }) {
  const totalSecs = intervals.reduce((s, i) => s + i.durationSecs, 0);
  const maxPower = Math.max(...intervals.map((i) => i.powerHigh), 100);
  const chartHeight = 200;

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-4">
      <div className="flex items-end gap-[1px]" style={{ height: chartHeight }}>
        {intervals.map((interval, idx) => {
          const widthPct = (interval.durationSecs / totalSecs) * 100;
          const avgPower = (interval.powerLow + interval.powerHigh) / 2;
          const heightPct = maxPower > 0 ? (avgPower / maxPower) * 100 : 10;
          const color = getZoneColor(interval.zone);

          return (
            <div
              key={idx}
              className="relative group cursor-pointer transition-opacity hover:opacity-80"
              style={{
                width: `${widthPct}%`,
                height: `${Math.max(heightPct, 5)}%`,
                backgroundColor: color,
                borderRadius: "2px 2px 0 0",
                minWidth: "4px",
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                <div className="bg-[#111] border border-[var(--card-border)] rounded-lg p-2 text-xs shadow-xl">
                  <p className="font-bold text-white">{interval.name}</p>
                  <p className="text-[var(--muted)]">{Math.round(interval.durationSecs / 60)}min</p>
                  {interval.powerHigh > 0 && (
                    <p style={{ color }}>
                      {Math.round(ftp * interval.powerLow / 100)}–{Math.round(ftp * interval.powerHigh / 100)}W
                      ({interval.powerLow}–{interval.powerHigh}%)
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Time axis */}
      <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
        <span>0:00</span>
        <span>{Math.round(totalSecs / 60)} min</span>
      </div>
    </div>
  );
}
