"use client";
import { useMemo, useState, useEffect } from "react";
import { generatePlan } from "@/lib/periodization";
import Link from "next/link";
import { getZoneColor } from "@/lib/zones";
import { BLOCK_META, DAY_LABELS } from "@/lib/constants";

const weekTypeLabels: Record<string, { label: string; color: string }> = {
  BUILD: { label: "Build", color: "#22c55e" },
  BUILD_PLUS: { label: "Build+", color: "#eab308" },
  OVERREACH: { label: "Overreach", color: "#f97316" },
  RECOVERY: { label: "Recovery", color: "#3b82f6" },
};

export default function PlanPage() {
  const [plan, setPlan] = useState(() => generatePlan(4));
  const [programStartDate, setProgramStartDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        const [riderRes, planRes] = await Promise.all([
          fetch("/api/rider"),
          fetch("/api/plan"),
        ]);

        const riderData = await riderRes.json();
        const planData = await planRes.json();

        if (riderData.rider?.programStartDate) {
          setProgramStartDate(new Date(riderData.rider.programStartDate));
        }

        if (planData.plan) {
          // Transform DB plan to match shape
          const dbPlan = {
            blocks: planData.plan.blocks.map((b: any) => ({
              blockNumber: b.blockNumber,
              type: b.type,
              weeks: b.weeks.map((w: any) => ({
                weekNumber: w.weekNumber,
                weekType: w.weekType,
                sessions: w.sessions.map((s: any) => ({
                  dayOfWeek: s.dayOfWeek,
                  sessionType: s.sessionType,
                  duration: s.duration,
                  title: s.title,
                  description: s.description,
                  intervals: s.intervals.map((i: any) => ({
                    name: i.name,
                    durationSecs: i.durationSecs,
                    powerLow: i.powerLow,
                    powerHigh: i.powerHigh,
                    zone: i.zone,
                  })),
                })),
              })),
            })),
            totalWeeks: planData.plan.blocks.reduce((sum: number, b: any) => sum + b.weeks.length, 0),
          };
          setPlan(dbPlan);
        }
      } catch (error) {
        console.error("Failed to load plan:", error);
      }
      setLoading(false);
    };

    loadPlanData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <div className="text-center">
          <div className="inline-block p-3 rounded-lg bg-[var(--card-border)] animate-pulse">
            <p className="text-[var(--muted)]">Loading your training plan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Training Plan</h1>
        <p className="text-[var(--muted)]">16 weeks of structured progression. Base → Threshold → VO2max → Race Sim. Always building shape.</p>
      </div>

      {/* Program dates */}
      {programStartDate && (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Program starts:</strong> {programStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            16 weeks of training • Ends {new Date(programStartDate.getTime() + 16 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Spiral visualization with dates */}
      <div className="flex gap-2 mb-6">
        {plan.blocks.map((block, bi) => {
          const bt = BLOCK_META[block.type];
          if (!programStartDate) return null;
          
          const blockStartDate = new Date(programStartDate);
          blockStartDate.setDate(blockStartDate.getDate() + bi * 28); // 4 weeks per block
          const blockEndDate = new Date(blockStartDate);
          blockEndDate.setDate(blockEndDate.getDate() + 27);
          
          return (
            <div key={bi} className="flex-1">
              <div
                className="rounded-lg p-3 border border-[var(--card-border)] text-center"
                style={{ borderTopWidth: 3, borderTopColor: bt.color }}
              >
                <span className="text-lg">{bt.emoji}</span>
                <p className="text-xs font-semibold mt-1">{bt.label}</p>
                <p className="text-[10px] text-[var(--muted)]">Weeks {bi * 4 + 1}–{bi * 4 + 4}</p>
                <p className="text-[9px] text-[var(--muted)] mt-1">
                  {blockStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {blockEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Block details */}
      {plan.blocks.map((block, bi) => {
        const bt = BLOCK_META[block.type];
        return (
          <div key={bi} className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: bt.color }}>
              {bt.emoji} Block {block.blockNumber}: {bt.label}
            </h2>

            {block.weeks.map((week, wi) => {
              const wt = weekTypeLabels[week.weekType];
              let weekDateRange = "";
              
              if (programStartDate) {
                const weekStartDate = new Date(programStartDate);
                weekStartDate.setDate(weekStartDate.getDate() + (bi * 4 + week.weekNumber - 1) * 7);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);
                
                weekDateRange = `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              }
              
              return (
                <div key={wi} className="glass p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: wt.color }}
                    >
                      {wt.label}
                    </span>
                    <div>
                      <h3 className="font-semibold">Week {bi * 4 + week.weekNumber}</h3>
                      {weekDateRange && (
                        <p className="text-xs text-[var(--muted)]">{weekDateRange}</p>
                      )}
                    </div>
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
                            <span className="text-xs font-bold text-[var(--muted)]">{DAY_LABELS[session.dayOfWeek]}</span>
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
