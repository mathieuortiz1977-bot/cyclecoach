"use client";
import { motion } from "framer-motion";

interface DigestData {
  weekNumber: number;
  sessionsCompleted: number;
  sessionsPlanned: number;
  totalDuration: number; // minutes
  totalTSS: number;
  avgCompliance: number;
  ftpTrend: number; // +/- watts
  nextWeekFocus: string;
  saturdayRoute?: { name: string; distance: number; elevation: number };
  coachSummary: string;
}

interface Props {
  digest?: DigestData;
}

function generateSampleDigest(): DigestData {
  return {
    weekNumber: 3,
    sessionsCompleted: 4,
    sessionsPlanned: 5,
    totalDuration: 285,
    totalTSS: 342,
    avgCompliance: 88,
    ftpTrend: 3,
    nextWeekFocus: "Overreach week — pushing limits before recovery",
    saturdayRoute: { name: "Alto de Las Palmas", distance: 105, elevation: 1850 },
    coachSummary: "Strong week. 4 out of 5 sessions done, 88% average compliance. Your threshold intervals are getting cleaner — less power fade in the final sets. FTP trending up +3W. Next week is overreach: expect higher volume. Saturday's ride is Alto de Las Palmas — fuel early and save matches for the final 5km.",
  };
}

export function WeeklyDigest({ digest }: Props) {
  const d = digest || generateSampleDigest();
  const completionPct = Math.round((d.sessionsCompleted / d.sessionsPlanned) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">📋 Weekly Digest</h2>
          <p className="text-sm text-[var(--muted)]">Week {d.weekNumber} summary</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--foreground)]">{d.sessionsCompleted}/{d.sessionsPlanned}</p>
          <p className="text-[10px] text-[var(--muted)]">Sessions</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">Completion</p>
          <p className="text-lg font-bold" style={{ color: completionPct >= 80 ? "#22c55e" : completionPct >= 60 ? "#eab308" : "#ef4444" }}>
            {completionPct}%
          </p>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">Duration</p>
          <p className="text-lg font-bold text-[var(--foreground)]">{Math.floor(d.totalDuration / 60)}h {d.totalDuration % 60}m</p>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">TSS</p>
          <p className="text-lg font-bold text-[var(--foreground)]">{d.totalTSS}</p>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">FTP Trend</p>
          <p className="text-lg font-bold" style={{ color: d.ftpTrend >= 0 ? "#22c55e" : "#ef4444" }}>
            {d.ftpTrend >= 0 ? "+" : ""}{d.ftpTrend}W
          </p>
        </div>
      </div>

      {/* Coach summary */}
      <div className="bg-[var(--background)] rounded-lg p-4 mb-4">
        <p className="text-xs text-[var(--accent)] font-medium mb-1">🎯 Coach Notes</p>
        <p className="text-sm text-[var(--foreground)] leading-relaxed">{d.coachSummary}</p>
      </div>

      {/* Next week preview */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)] mb-1">Next Week</p>
          <p className="text-sm font-medium text-[var(--foreground)]">{d.nextWeekFocus}</p>
        </div>
        {d.saturdayRoute && (
          <div className="flex-1 bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)] mb-1">Saturday Ride 🌄</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{d.saturdayRoute.name}</p>
            <p className="text-xs text-[var(--muted)]">{d.saturdayRoute.distance}km · {d.saturdayRoute.elevation}m ↑</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
