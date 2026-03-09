"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionDef, IntervalDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";
import { DAY_LABELS, DAY_ORDER, getTodayKey } from "@/lib/constants";

type SessionStatus = "completed" | "today" | "upcoming";

interface IntervalDetailModal {
  interval: IntervalDef;
  index: number;
  ftp: number;
}

const statusConfig: Record<SessionStatus, { badge: string; label: string; glow: string }> = {
  completed: { badge: "✅", label: "Done", glow: "glow-success" },
  today: { badge: "⏳", label: "Today", glow: "glow-accent" },
  upcoming: { badge: "🔒", label: "Upcoming", glow: "" },
};

function getSessionStatus(
  dayOfWeek: string, 
  completedWorkouts: any[] = [],
  stravaActivities: any[] = []
): SessionStatus {
  const today = getTodayKey();
  const todayIdx = DAY_ORDER.indexOf(today);
  const sessionIdx = DAY_ORDER.indexOf(dayOfWeek);

  // Calculate what date this session would be (this week or next)
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
  
  // Adjust for Monday = 0 logic
  const dayOffset = DAY_ORDER.indexOf(dayOfWeek);
  const sessionDate = new Date(currentWeekStart);
  sessionDate.setDate(currentWeekStart.getDate() + dayOffset);
  const sessionDateISO = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if completed via program session
  const hasProgramSession = completedWorkouts?.some(w => {
    const workoutDate = new Date(w.date);
    const workoutDateISO = workoutDate.toISOString().split('T')[0];
    return workoutDateISO === sessionDateISO && w.completed;
  });
  
  // Check if completed via Strava ride
  const hasStravaRide = stravaActivities?.some(a => a.date === sessionDateISO);
  
  if (hasProgramSession || hasStravaRide) return "completed";
  
  if (sessionIdx === todayIdx) return "today";
  if (sessionIdx < todayIdx) return "upcoming"; // Past days without completion show as upcoming
  return "upcoming";
}

export function SessionCard({ 
  session, 
  blockIdx, 
  weekIdx, 
  sessionIdx, 
  completedWorkouts = [],
  stravaActivities = []
}: {
  session: SessionDef;
  blockIdx: number;
  weekIdx: number;
  sessionIdx: number;
  completedWorkouts?: any[];
  stravaActivities?: any[];
}) {
  const [selectedInterval, setSelectedInterval] = useState<IntervalDetailModal | null>(null);
  const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
  const href = `/workout/${blockIdx}-${weekIdx}-${sessionIdx}`;
  
  // Calculate session date for this day
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  const dayOffset = DAY_ORDER.indexOf(session.dayOfWeek);
  const sessionDate = new Date(currentWeekStart);
  sessionDate.setDate(currentWeekStart.getDate() + dayOffset);
  const sessionDateISO = sessionDate.toISOString().split('T')[0];
  
  // Find the actual completion data if exists
  const completedWorkout = completedWorkouts?.find(w => {
    const workoutDate = new Date(w.date);
    const workoutDateISO = workoutDate.toISOString().split('T')[0];
    return workoutDateISO === sessionDateISO && w.completed;
  });
  
  const stravaRide = stravaActivities?.find(a => a.date === sessionDateISO);
  
  const status = getSessionStatus(session.dayOfWeek, completedWorkouts, stravaActivities);
  const config = statusConfig[status];
  
  // Debug logging
  console.log("[SessionCard]", session.dayOfWeek, {
    status,
    completedWorkoutsCount: completedWorkouts?.length,
    stravaCount: stravaActivities?.length,
    sessionDate: sessionDateISO,
    hasCompleted: completedWorkout ? "yes" : "no",
    hasStrava: stravaRide ? "yes" : "no"
  });

  const handleIntervalClick = (interval: IntervalDef, index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedInterval({ interval, index, ftp: 190 }); // TODO: Get real FTP from context
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
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

            {/* Mini interval bars — animated & interactive */}
            <div className="flex items-end gap-[1px] h-10 mb-2 bg-[var(--background)] rounded-lg p-1.5 relative group">
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
                    className="cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: getZoneColor(interval.zone),
                      borderRadius: "2px 2px 0 0",
                      minWidth: "2px",
                    }}
                    onClick={(e) => handleIntervalClick(interval, idx, e)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                );
              })}
              
              {/* Mobile tap hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:hidden pointer-events-none">
                <span className="text-[8px] text-[var(--muted)] bg-black/50 px-1 rounded">Tap bars</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>{session.duration} min</span>
              {session.route && <span>{session.route.distance}km / {session.route.elevation}m ↑</span>}
            </div>

            {/* Completion Stats */}
            {status === "completed" && (completedWorkout || stravaRide) && (
              <div className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-1">
                <div className="text-[10px] text-green-400 font-medium">✅ Completed</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {stravaRide && (
                    <>
                      {stravaRide.avgPower && (
                        <div>
                          <span className="text-[var(--muted)]">Avg Power</span>
                          <div className="font-semibold text-white">{Math.round(stravaRide.avgPower)}W</div>
                        </div>
                      )}
                      {stravaRide.tss && (
                        <div>
                          <span className="text-[var(--muted)]">TSS</span>
                          <div className="font-semibold text-white">{Math.round(stravaRide.tss)}</div>
                        </div>
                      )}
                      {stravaRide.normalizedPower && (
                        <div>
                          <span className="text-[var(--muted)]">NP</span>
                          <div className="font-semibold text-white">{Math.round(stravaRide.normalizedPower)}W</div>
                        </div>
                      )}
                      {stravaRide.avgHr && (
                        <div>
                          <span className="text-[var(--muted)]">Avg HR</span>
                          <div className="font-semibold text-white">{Math.round(stravaRide.avgHr)} bpm</div>
                        </div>
                      )}
                    </>
                  )}
                  {completedWorkout && !stravaRide && (
                    <>
                      <div>
                        <span className="text-[var(--muted)]">Status</span>
                        <div className="font-semibold text-white">Logged</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Mobile Interval Detail Modal */}
      <AnimatePresence>
        {selectedInterval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInterval(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-sm w-full p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--accent)]">#{selectedInterval.index + 1}</h3>
                  <p className="text-sm font-semibold">{selectedInterval.interval.name}</p>
                </div>
                <button
                  onClick={() => setSelectedInterval(null)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                  <div className="text-blue-400 mb-1">⏱️</div>
                  <div className="font-semibold">{formatTime(selectedInterval.interval.durationSecs)}</div>
                </div>

                {selectedInterval.interval.powerHigh > 0 && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-[var(--accent)] mb-1">⚡</div>
                    <div className="font-semibold text-xs">
                      {Math.round(selectedInterval.ftp * selectedInterval.interval.powerLow / 100)}–{Math.round(selectedInterval.ftp * selectedInterval.interval.powerHigh / 100)}W
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      Zone {selectedInterval.interval.zone}
                    </div>
                  </div>
                )}

                {selectedInterval.interval.cadenceLow && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-purple-400 mb-1">🔄</div>
                    <div className="font-semibold">{selectedInterval.interval.cadenceLow} rpm</div>
                  </div>
                )}

                {selectedInterval.interval.rpe && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 mb-1">💪</div>
                    <div className="font-semibold">RPE {selectedInterval.interval.rpe}</div>
                  </div>
                )}
              </div>

              {selectedInterval.interval.purpose && (
                <div className="bg-[var(--accent)]/10 rounded-lg p-2">
                  <p className="text-xs text-[var(--muted)] mb-1">Purpose</p>
                  <p className="text-xs">{selectedInterval.interval.purpose}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}