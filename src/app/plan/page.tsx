"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import type { TrainingBlock, TrainingWeek, TrainingSession, TrainingInterval } from "@/types";
import Link from "next/link";
import * as tz from "@/lib/timezone";
import { getZoneColor } from "@/lib/zones";
import { BLOCK_META, DAY_LABELS } from "@/lib/constants";

const weekTypeLabels: Record<string, { label: string; color: string }> = {
  BUILD: { label: "Build", color: "#22c55e" },
  BUILD_PLUS: { label: "Build+", color: "#eab308" },
  OVERREACH: { label: "Overreach", color: "#f97316" },
  RECOVERY: { label: "Recovery", color: "#3b82f6" },
};

// Default empty plan structure
const emptyPlan: { blocks: TrainingBlock[] } = {
  blocks: [],
};

export default function PlanPage() {
  const [plan, setPlan] = useState<{ blocks: TrainingBlock[] }>(emptyPlan);
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
            blocks: planData.plan.blocks.map((b: TrainingBlock) => ({
              blockNumber: b.blockNumber,
              type: b.type,
              weeks: b.weeks.map((w: TrainingWeek) => ({
                weekNumber: w.weekNumber,
                weekType: w.weekType,
                sessions: w.sessions.map((s: TrainingSession) => ({
                  dayOfWeek: s.dayOfWeek,
                  sessionType: s.sessionType,
                  duration: s.duration,
                  title: s.title,
                  description: s.description,
                  intervals: s.intervals.map((i: TrainingInterval) => ({
                    name: i.name,
                    // Handle both nested and flat duration structures
                    durationSecs: (i as any).duration?.absoluteSecs ?? i.durationSecs ?? 600,
                    // Handle both nested and flat structures for power
                    powerLow: (i as any).intensity?.powerLow ?? i.powerLow ?? 0,
                    powerHigh: (i as any).intensity?.powerHigh ?? i.powerHigh ?? 0,
                    zone: (i as any).intensity?.zone ?? i.zone ?? 'Z2',
                  })),
                })),
              })),
            })),
            totalWeeks: planData.plan.blocks.reduce((sum: number, b: TrainingBlock) => sum + b.weeks.length, 0),
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
            <strong>Program starts:</strong> {tz.formatForDisplay(programStartDate)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            16 weeks of training • Ends {tz.formatForDisplay(tz.addWeeks(programStartDate, 16))}
          </p>
        </div>
      )}

      {/* Spiral visualization with dates */}
      <div className="flex gap-2 mb-6">
        {plan.blocks.map((block, bi) => {
          const bt = BLOCK_META[block.type];
          if (!programStartDate) return null;
          
          const blockStartDate = tz.addWeeks(programStartDate, bi * 4); // 4 weeks per block
          const blockEndDate = tz.addDays(blockStartDate, 27);
          
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
                  {tz.formatAsISO(blockStartDate).split('-').slice(1).join('-')} - {tz.formatAsISO(blockEndDate).split('-').slice(1).join('-')}
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
                const weekStartDate = tz.addDays(programStartDate, (bi * 4 + week.weekNumber - 1) * 7);
                const weekEndDate = tz.addDays(weekStartDate, 6);
                
                weekDateRange = `${tz.formatAsISO(weekStartDate).split('-').slice(1).join('-')} - ${tz.formatAsISO(weekEndDate).split('-').slice(1).join('-')}`;
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
                      const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0) || 1; // Avoid division by zero
                      const maxPower = Math.max(...session.intervals.map(i => i.powerHigh || 0), 100); // Default to 100 if empty
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
                            {session.intervals && session.intervals.length > 0 ? (
                              session.intervals.map((interval, idx) => {
                                const widthPct = (interval.durationSecs / totalSecs) * 100;
                                const avgPower = ((interval.powerLow ?? 0) + (interval.powerHigh ?? 0)) / 2;
                                const heightPct = avgPower > 0 ? Math.min((avgPower / maxPower) * 100, 100) : 10;
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      width: `${Math.max(widthPct, 2)}%`,
                                      height: `${Math.max(heightPct, 8)}%`,
                                      backgroundColor: getZoneColor(interval.zone),
                                      borderRadius: "1px 1px 0 0",
                                      minWidth: "1px",
                                    }}
                                  />
                                );
                              })
                            ) : (
                              <div className="w-full h-2 bg-[var(--muted)] rounded opacity-30" />
                            )}
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
