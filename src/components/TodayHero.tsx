"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SessionDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";
import { getTodayKey } from "@/lib/constants";

interface Props {
  plan: { blocks: { weeks: { sessions: SessionDef[] }[] }[] };
  blockIdx: number;
  weekIdx: number;
}

const restDayQuips = [
  "Rest day. Your legs called — they said thanks. 🛋️",
  "No workout today. Recovery is training too. 🧘",
  "Off day. Go eat carbs and feel zero guilt. 🍕",
  "Rest. Netflix. Stretch. In that order. 📺",
  "Your muscles are rebuilding themselves. Don't interrupt them. 💤",
];

export function TodayHero({ plan, blockIdx, weekIdx }: Props) {
  const today = getTodayKey();
  const week = plan.blocks[blockIdx].weeks[weekIdx];
  const sessionIdx = week.sessions.findIndex((s) => s.dayOfWeek === today);
  const session = sessionIdx >= 0 ? week.sessions[sessionIdx] : null;

  if (!session) {
    const quip = restDayQuips[new Date().getDate() % restDayQuips.length];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="text-5xl md:text-6xl">😴</div>
          <div className="flex-1">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Today</p>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Rest Day</h2>
            <p className="text-[var(--muted)]">{quip}</p>
          </div>
        </div>

        {/* Rest day tips */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "🧘", title: "Stretch", desc: "15 min mobility work" },
            { icon: "💧", title: "Hydrate", desc: "3+ liters today" },
            { icon: "😴", title: "Sleep", desc: "8 hours minimum" },
          ].map((tip) => (
            <div key={tip.title} className="bg-[var(--background)] rounded-lg p-3 text-center">
              <span className="text-xl">{tip.icon}</span>
              <p className="text-xs font-medium mt-1">{tip.title}</p>
              <p className="text-[10px] text-[var(--muted)]">{tip.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  const mainSetIntervals = session.intervals.filter((i) => i.zone !== "Z1" && i.zone !== "Z2" && i.name !== "Warmup" && i.name !== "Cooldown");
  const peakZone = mainSetIntervals.length > 0
    ? mainSetIntervals.reduce((a, b) => (a.powerHigh > b.powerHigh ? a : b)).zone
    : "Z2";
  const href = `/workout/${blockIdx}-${weekIdx}-${sessionIdx}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border-2 border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--accent)]/5 p-6 md:p-8"
    >
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          {/* Left: Info */}
          <div className="flex-1">
            <p className="text-xs text-[var(--accent)] uppercase tracking-wider font-medium mb-1">Today&apos;s Workout</p>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{session.title}</h2>
            <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">{session.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-5">
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{session.duration}<span className="text-sm font-normal text-[var(--muted)]"> min</span></p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: getZoneColor(peakZone) }}>{peakZone}</p>
                <p className="text-[10px] text-[var(--muted)]">Peak Zone</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{session.intervals.length}</p>
                <p className="text-[10px] text-[var(--muted)]">Intervals</p>
              </div>
              {session.route && (
                <div>
                  <p className="text-2xl font-bold text-green-400">{session.route.distance}<span className="text-sm font-normal text-[var(--muted)]"> km</span></p>
                  <p className="text-[10px] text-[var(--muted)]">{session.route.elevation}m ↑</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-hover)] transition-colors text-sm"
            >
              <span>Start Workout</span>
              <span>→</span>
            </Link>
          </div>

          {/* Right: Mini interval chart */}
          <div className="w-full md:w-64 shrink-0">
            <p className="text-xs text-[var(--muted)] mb-2">Workout Profile</p>
            <div className="flex items-end gap-[2px] h-20 bg-[var(--background)] rounded-lg p-2">
              {session.intervals.map((interval, idx) => {
                const widthPct = (interval.durationSecs / totalSecs) * 100;
                const avgPower = (interval.powerLow + interval.powerHigh) / 2;
                const heightPct = avgPower > 0 ? Math.min((avgPower / 130) * 100, 100) : 10;
                return (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 8)}%` }}
                    transition={{ delay: idx * 0.03, duration: 0.4, ease: "easeOut" }}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: getZoneColor(interval.zone),
                      borderRadius: "2px 2px 0 0",
                      minWidth: "3px",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
