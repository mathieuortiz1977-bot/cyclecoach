"use client";
import Link from "next/link";
import type { SessionDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";

const dayLabels: Record<string, string> = {
  MON: "Monday", TUE: "Tuesday", THU: "Thursday", FRI: "Friday", SAT: "Saturday",
};

export function SessionCard({ session, blockIdx, weekIdx, sessionIdx }: {
  session: SessionDef;
  blockIdx: number;
  weekIdx: number;
  sessionIdx: number;
}) {
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  const href = `/workout/${blockIdx}-${weekIdx}-${sessionIdx}`;

  return (
    <Link href={href} className="block">
      <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--accent)] transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)]">{dayLabels[session.dayOfWeek]}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--card-border)]">
            {session.sessionType === "OUTDOOR" ? "🌄 Outdoor" : "🏠 Indoor"}
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">{session.title}</h3>
        <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">{session.description}</p>

        {/* Mini interval bars */}
        <div className="flex items-end gap-[1px] h-8 mb-2">
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
  );
}
