"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionDef, IntervalDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";
import { getTodayKey, DAY_FROM_INDEX } from "@/lib/constants";

interface IntervalDetailModal {
  interval: IntervalDef;
  index: number;
  ftp: number;
}

interface Props {
  plan: { blocks: { weeks: { sessions: SessionDef[] }[] }[] };
  blockIdx: number;
  weekIdx: number;
  programStartDate?: string;
  stravaActivities?: any[]; // Strava rides (for auto-completion detection)
  completedWorkouts?: any[]; // Completed program sessions
}

const restDayQuips = [
  "Rest day. Your legs called — they said thanks. 🛋️",
  "No workout today. Recovery is training too. 🧘",
  "Off day. Go eat carbs and feel zero guilt. 🍕",
  "Rest. Netflix. Stretch. In that order. 📺",
  "Your muscles are rebuilding themselves. Don't interrupt them. 💤",
];

export function TodayHero({ 
  plan, 
  blockIdx, 
  weekIdx, 
  programStartDate,
  stravaActivities = [],
  completedWorkouts = []
}: Props) {
  const [selectedInterval, setSelectedInterval] = useState<IntervalDetailModal | null>(null);
  const today = getTodayKey();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  // Check if program has started
  const programStart = programStartDate ? new Date(programStartDate) : null;
  if (programStart) {
    programStart.setHours(0, 0, 0, 0);
  }
  
  const programHasStarted = !programStart || todayDate >= programStart;
  
  // Get week data for all logic
  const week = plan.blocks[blockIdx].weeks[weekIdx];

  // Helper: Check if a session is completed (via Strava ride or program session)
  const isSessionCompleted = (dayOfWeek: string, dateToCheck: Date): boolean => {
    // Check for completed program session on this day
    const hasProgramSession = completedWorkouts.some(w => {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === dateToCheck.getTime() && w.completed;
    });
    if (hasProgramSession) return true;

    // Check for Strava ride matching this day
    const dateISO = dateToCheck.toISOString().split('T')[0]; // YYYY-MM-DD
    const hasStravaRide = stravaActivities.some(a => a.date === dateISO);
    return hasStravaRide;
  };

  // Helper: Find next upcoming unfinished session
  const getNextUnsafeSession = (): { session: SessionDef; date: Date; daysFromNow: number } | null => {
    let checkDate = new Date(todayDate);
    
    // Check up to 14 days ahead
    for (let i = 0; i < 14; i++) {
      const dayIndex = checkDate.getDay();
      const dayKey = DAY_FROM_INDEX[dayIndex];
      
      // Find session for this day in the current week
      const sessionForDay = week.sessions.find(s => s.dayOfWeek === dayKey);
      
      if (sessionForDay && !isSessionCompleted(dayKey, checkDate)) {
        return {
          session: sessionForDay,
          date: new Date(checkDate),
          daysFromNow: i
        };
      }
      
      // Move to next day
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return null;
  };
  
  // If program hasn't started, show upcoming workout preview
  if (!programHasStarted && programStart) {
    // Find the first workout when program starts
    const programStartDay = DAY_FROM_INDEX[programStart.getDay()];
    const firstWorkoutIdx = week.sessions.findIndex((s) => s.dayOfWeek === programStartDay);
    const firstWorkout = firstWorkoutIdx >= 0 ? week.sessions[firstWorkoutIdx] : null;
    
    // Ensure intervals is an array (handle edge case where it might be a function)
    const firstWorkoutIntervalsArray = firstWorkout && Array.isArray(firstWorkout.intervals) 
      ? firstWorkout.intervals 
      : [];
    
    if (firstWorkout) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border-2 border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--accent)]/5 p-6 md:p-8"
        >
          {/* Upcoming workout indicator */}
          <div className="absolute top-4 right-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-[var(--accent)]">UPCOMING</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">🗓️</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Your First Workout</h2>
                  <p className="text-sm text-[var(--muted)]">
                    Program starts {programStart.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-border)]/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{firstWorkout.title}</h3>
              <p className="text-sm text-[var(--muted)] mb-3">{firstWorkout.description}</p>
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{firstWorkout.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💪</span>
                  <span>{firstWorkout.sessionType}</span>
                </div>
                {firstWorkoutIntervalsArray.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>⚡</span>
                    <span>{Math.round((firstWorkoutIntervalsArray[0].powerLow + firstWorkoutIntervalsArray[0].powerHigh) / 2)}% FTP</span>
                  </div>
                )}
              </div>

              {/* Interval preview */}
              {firstWorkoutIntervalsArray && firstWorkoutIntervalsArray.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <p className="text-xs text-[var(--muted)] mb-2">Key intervals:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {firstWorkoutIntervalsArray.slice(0, 4).map((interval, idx) => (
                      <div key={idx} className="bg-[var(--background)]/50 rounded p-2 text-center">
                        <div className="text-xs text-[var(--muted)]">{Math.round(interval.durationSecs / 60)}'</div>
                        <div className="text-sm font-medium">{interval.powerLow}-{interval.powerHigh}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-[var(--muted)] mb-2">Get ready to start your journey!</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-border)] rounded-lg text-sm">
                <span>📋 Review and prepare</span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Fallback if no workout found
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border-2 border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--accent)]/5 p-6 md:p-8"
      >
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">🗓️</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Program Starts Soon!</h2>
          <p className="text-lg font-semibold text-[var(--accent)] mb-4">
            {programStart.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </motion.div>
    );
  }
  
  // Determine which session to show
  const todaySessionIdx = week.sessions.findIndex((s) => s.dayOfWeek === today);
  const todaySession = todaySessionIdx >= 0 ? week.sessions[todaySessionIdx] : null;
  
  // Check if today's session is already completed
  let session = null;
  let isShowingUpcoming = false;
  let daysUntilSession = 0;
  
  if (todaySession && isSessionCompleted(today, todayDate)) {
    // Today's session is done! Find next unfinished one
    console.log("[TodayHero] Today's session is completed, finding next upcoming...");
    const nextSession = getNextUnsafeSession();
    if (nextSession) {
      session = nextSession.session;
      isShowingUpcoming = true;
      daysUntilSession = nextSession.daysFromNow;
      console.log("[TodayHero] Next upcoming session:", session.title, "in", daysUntilSession, "days");
    }
  } else if (todaySession) {
    // Today's session is not completed, show it
    session = todaySession;
    console.log("[TodayHero] Showing today's session:", session.title);
  }

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

  // Ensure intervals is an array (handle edge case where it might be a function)
  const intervalsArray = Array.isArray(session.intervals) ? session.intervals : [];

  const totalSecs = intervalsArray.reduce((s, i) => s + i.durationSecs, 0);
  const mainSetIntervals = intervalsArray.filter((i) => i.zone !== "Z1" && i.zone !== "Z2" && i.name !== "Warmup" && i.name !== "Cooldown");
  const peakZone = mainSetIntervals.length > 0
    ? mainSetIntervals.reduce((a, b) => (a.powerHigh > b.powerHigh ? a : b)).zone
    : "Z2";
  
  // Find the index of this session in the week
  const sessionIdx = week.sessions.findIndex(s => s.dayOfWeek === session.dayOfWeek);
  const href = `/workout/${blockIdx}-${weekIdx}-${sessionIdx}`;

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
        className="relative overflow-hidden rounded-xl border-2 border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--accent)]/5 p-6 md:p-8"
      >
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          {/* Left: Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-[var(--accent)] uppercase tracking-wider font-medium">
                {isShowingUpcoming ? "Upcoming Workout" : "Today's Workout"}
              </p>
              {isShowingUpcoming && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  In {daysUntilSession} day{daysUntilSession !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{session.title}</h2>
            <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">{session.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-5">
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{Math.round((session.intervals || []).reduce((sum: number, i: any) => sum + i.durationSecs, 0) / 60)}<span className="text-sm font-normal text-[var(--muted)]"> min</span></p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: getZoneColor(peakZone) }}>{peakZone}</p>
                <p className="text-[10px] text-[var(--muted)]">Peak Zone</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{intervalsArray.length}</p>
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
            <div className="flex items-end gap-[2px] h-20 bg-[var(--background)] rounded-lg p-2 relative group">
              {intervalsArray.map((interval, idx) => {
                const widthPct = (interval.durationSecs / totalSecs) * 100;
                const avgPower = (interval.powerLow + interval.powerHigh) / 2;
                const heightPct = avgPower > 0 ? Math.min((avgPower / 130) * 100, 100) : 10;
                const color = getZoneColor(interval.zone);
                return (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 8)}%` }}
                    transition={{ delay: idx * 0.03, duration: 0.4, ease: "easeOut" }}
                    className="cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: color,
                      borderRadius: "2px 2px 0 0",
                      minWidth: "3px",
                    }}
                    onClick={(e) => handleIntervalClick(interval, idx, e)}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 0 8px ${color}50`
                    }}
                    whileTap={{ scale: 0.95 }}
                  />
                );
              })}
              
              {/* Mobile tap hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:hidden pointer-events-none">
                <span className="text-[8px] text-[var(--muted)] bg-black/50 px-1 rounded">Tap bars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Interval Detail Modal */}
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

            {selectedInterval.interval.coachNote && (
              <div className="bg-[var(--accent)]/10 rounded-lg p-2">
                <p className="text-xs text-[var(--muted)] mb-1">Coach Note</p>
                <p className="text-xs">{selectedInterval.interval.coachNote}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
