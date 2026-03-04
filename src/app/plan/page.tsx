"use client";
import { useMemo } from "react";
import { generatePlan } from "@/lib/periodization";
import Link from "next/link";
import { getZoneColor } from "@/lib/zones";

const blockTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  BASE: { label: "Base / Aerobic", emoji: "🏗️", color: "#3b82f6" },
  THRESHOLD: { label: "Threshold / FTP", emoji: "⚡", color: "#eab308" },
  VO2MAX: { label: "VO2max / Punch", emoji: "🔥", color: "#f97316" },
  RACE_SIM: { label: "Race Simulation", emoji: "🏁", color: "#ef4444" },
};

const weekTypeLabels: Record<string, { label: string; color: string }> = {
  BUILD: { label: "Build", color: "#22c55e" },
  BUILD_PLUS: { label: "Build+", color: "#eab308" },
  OVERREACH: { label: "Overreach", color: "#f97316" },
  RECOVERY: { label: "Recovery", color: "#3b82f6" },
};

const dayLabels: Record<string, string> = {
  MON: "Mon", TUE: "Tue", THU: "Thu", FRI: "Fri", SAT: "Sat",
};

export default function PlanPage() {
  const plan = useMemo(() => generatePlan(4), []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Training Plan</h1>
        <p className="text-[var(--muted)]">16 weeks of structured progression. Base → Threshold → VO2max → Race Sim. Always building shape.</p>
      </div>

      {/* Spiral visualization */}
      <div className="flex gap-2 mb-6">
        {plan.blocks.map((block, bi) => {
          const bt = blockTypeLabels[block.type];
          return (
            <div key={bi} className="flex-1">
              <div
                className="rounded-lg p-3 border border-[var(--card-border)] text-center"
                style={{ borderTopWidth: 3, borderTopColor: bt.color }}
              >
                <span className="text-lg">{bt.emoji}</span>
                <p className="text-xs font-semibold mt-1">{bt.label}</p>
                <p className="text-[10px] text-[var(--muted)]">Weeks {bi * 4 + 1}–{bi * 4 + 4}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Block details */}
      {plan.blocks.map((block, bi) => {
        const bt = blockTypeLabels[block.type];
        return (
          <div key={bi} className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: bt.color }}>
              {bt.emoji} Block {block.blockNumber}: {bt.label}
            </h2>

            {block.weeks.map((week, wi) => {
              const wt = weekTypeLabels[week.weekType];
              return (
                <div key={wi} className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: wt.color }}
                    >
                      {wt.label}
                    </span>
                    <h3 className="font-semibold">Week {bi * 4 + week.weekNumber}</h3>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {week.sessions.map((session, si) => {
                      const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
                      return (
                        <Link
                          key={si}
                          href={`/workout/${bi}-${wi}-${si}`}
                          className="bg-[var(--background)] rounded-md p-3 hover:ring-1 hover:ring-[var(--accent)] transition-all"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[var(--muted)]">{dayLabels[session.dayOfWeek]}</span>
                            <span className="text-[10px]">{session.sessionType === "OUTDOOR" ? "🌄" : "🏠"}</span>
                          </div>
                          <p className="text-xs font-medium mb-2 line-clamp-1">{session.title}</p>

                          {/* Mini bars */}
                          <div className="flex items-end gap-[1px] h-6">
                            {session.intervals.map((interval, idx) => {
                              const widthPct = (interval.durationSecs / totalSecs) * 100;
                              const avgPower = (interval.powerLow + interval.powerHigh) / 2;
                              const heightPct = avgPower > 0 ? Math.min((avgPower / 130) * 100, 100) : 10;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: `${widthPct}%`,
                                    height: `${Math.max(heightPct, 8)}%`,
                                    backgroundColor: getZoneColor(interval.zone),
                                    borderRadius: "1px 1px 0 0",
                                    minWidth: "1px",
                                  }}
                                />
                              );
                            })}
                          </div>

                          <p className="text-[10px] text-[var(--muted)] mt-1">{session.duration}min</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
