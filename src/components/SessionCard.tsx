"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SessionDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";
import { DAY_LABELS, DAY_ORDER, getTodayKey } from "@/lib/constants";

type SessionStatus = "completed" | "today" | "upcoming";

const statusConfig: Record<SessionStatus, { badge: string; label: string; glow: string }> = {
  completed: { badge: "✅", label: "Done", glow: "glow-success" },
  today: { badge: "⏳", label: "Today", glow: "glow-accent" },
  upcoming: { badge: "🔒", label: "Upcoming", glow: "" },
};

function getSessionStatus(dayOfWeek: string): SessionStatus {
  const today = getTodayKey();
  const todayIdx = DAY_ORDER.indexOf(today);
  const sessionIdx = DAY_ORDER.indexOf(dayOfWeek);

  if (sessionIdx < todayIdx) return "completed"; // sample
  if (sessionIdx === todayIdx) return "today";
  return "upcoming";
}

export function SessionCard({ session, blockIdx, weekIdx, sessionIdx }: {
  session: SessionDef;
  blockIdx: number;
  weekIdx: number;
  sessionIdx: number;
}) {
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  const href = `/workout/${blockIdx}-${weekIdx}-${sessionIdx}`;
  const status = getSessionStatus(session.dayOfWeek);
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sessionIdx * 0.08 }}
    >
      <Link href={href} className="block">
        <div className={`glass glass-hover p-4 relative overflow-hidden ${status === "today" ? "glow-accent border-[var(--accent)]/30" : ""}`}>
          {/* Status badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <span className="text-xs">{config.badge}</span>
            <span className="text-[10px] text-[var(--muted)]">{config.label}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[var(--muted)]">{DAY_LABELS[session.dayOfWeek]}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--card-border)]">
              {session.sessionType === "OUTDOOR" ? "🌄 Outdoor" : "🏠 Indoor"}
            </span>
          </div>
          <h3 className="font-semibold text-sm mb-1 pr-16">{session.title}</h3>
          <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">{session.description}</p>

          {/* Mini interval bars — animated */}
          <div className="flex items-end gap-[1px] h-10 mb-2 bg-[var(--background)] rounded-lg p-1.5">
            {session.intervals.map((interval, idx) => {
              const widthPct = (interval.durationSecs / totalSecs) * 100;
              const avgPower = (interval.powerLow + interval.powerHigh) / 2;
              const heightPct = avgPower > 0 ? Math.min((avgPower / 130) * 100, 100) : 10;
              return (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 8)}%` }}
                  transition={{ delay: 0.3 + idx * 0.02, duration: 0.4, ease: "easeOut" }}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: getZoneColor(interval.zone),
                    borderRadius: "2px 2px 0 0",
                    minWidth: "2px",
                  }}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{session.duration} min</span>
            {session.route && <span>{session.route.distance}km / {session.route.elevation}m ↑</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
