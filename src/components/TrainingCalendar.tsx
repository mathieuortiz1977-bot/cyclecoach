"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { generatePlan } from "@/lib/periodization";
import { DAY_FROM_INDEX } from "@/lib/constants";

interface WorkoutData {
  id: string;
  date: string;
  completed: boolean;
  sessionTitle?: string;
  avgPower?: number;
  duration?: number;
  rpe?: number;
  feelings?: string[];
  notes?: string;
  compliance?: number;
  plannedSession?: {
    title: string;
    duration: number;
    targetPower: number;
    sessionType: string;
  };
  performanceGrade?: string;
}

interface Props {
  trainingDays?: string[];
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TrainingCalendar({ trainingDays = ["MON", "TUE", "THU", "FRI", "SAT"] }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [selectedDate, setSelectedDate] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan] = useState(() => generatePlan(4));

  useEffect(() => {
    loadWorkoutData();
  }, [currentMonth]);

  const loadWorkoutData = async () => {
    try {
      const [workoutRes, riderRes] = await Promise.all([
        fetch("/api/workouts"),
        fetch("/api/rider")
      ]);
      
      const [workoutData, riderData] = await Promise.all([
        workoutRes.json(),
        riderRes.json()
      ]);

      if (workoutData.workouts) {
        // Only consider workouts after the program start date
        const programStartDate = riderData.rider?.programStartDate ? new Date(riderData.rider.programStartDate) : null;
        
        const enrichedWorkouts = workoutData.workouts
          .filter((w: any) => {
            // For program completion tracking, only count program sessions
            if (!w.isProgramSession) return false;
            
            // Only count workouts after program start date
            if (programStartDate && new Date(w.createdAt) < programStartDate) return false;
            
            return true;
          })
          .map((w: any) => ({
            id: w.id,
            date: w.completedAt || w.createdAt,
            completed: w.completed,
            sessionTitle: w.sessionTitle,
            avgPower: w.avgPower,
            duration: w.actualDuration,
            rpe: w.rpe,
            feelings: w.feelings,
            notes: w.notes,
            compliance: w.compliance,
            plannedSession: findPlannedSession(w.completedAt, w.dayOfWeek),
            performanceGrade: gradePerformance(w, riderData.rider?.ftp || 190),
            isProgramSession: w.isProgramSession
          }));
        setWorkouts(enrichedWorkouts);
      }
    } catch (error) {
      console.error("Failed to load workout data:", error);
    }
    setLoading(false);
  };

  const findPlannedSession = (date: string, dayOfWeek: string) => {
    // Find matching planned session from the training plan
    // This is a simplified version - in reality you'd match to the exact week/block
    const dayKey = dayOfWeek?.toUpperCase();
    if (!dayKey || !trainingDays.includes(dayKey)) return null;

    // For demo, return a sample planned session based on day
    const sessionsByDay = {
      MON: { title: "VO2max Intervals", duration: 60, targetPower: 120, sessionType: "INDOOR" },
      TUE: { title: "Threshold Build", duration: 75, targetPower: 105, sessionType: "INDOOR" },
      THU: { title: "Sweet Spot", duration: 90, targetPower: 88, sessionType: "INDOOR" },
      FRI: { title: "Race Simulation", duration: 60, targetPower: 95, sessionType: "INDOOR" },
      SAT: { title: "Long Endurance", duration: 180, targetPower: 65, sessionType: "OUTDOOR" }
    };

    return sessionsByDay[dayKey as keyof typeof sessionsByDay] || null;
  };

  const gradePerformance = (workout: any, ftp: number): string => {
    if (!workout.completed || !workout.rpe || !workout.compliance) return "";
    
    const rpe = workout.rpe;
    const compliance = workout.compliance;
    
    if (compliance >= 95 && rpe <= 7) return "A+ Excellent";
    if (compliance >= 90 && rpe <= 8) return "A Good";
    if (compliance >= 80 && rpe <= 8) return "B Acceptable";
    if (compliance >= 70) return "C Below Target";
    return "D Struggled";
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayWorkout = workouts.find(w => 
        new Date(w.date).toDateString() === current.toDateString()
      );
      
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const dayKey = DAY_FROM_INDEX[current.getDay()];
      const isTrainingDay = trainingDays.includes(dayKey);

      days.push({
        date: new Date(current),
        workout: dayWorkout,
        isCurrentMonth,
        isToday,
        isTrainingDay
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDateStatus = (day: any) => {
    if (!day.isCurrentMonth) return "other-month";
    if (!day.isTrainingDay) return "rest";
    if (day.workout?.completed) return "completed";
    if (day.workout && !day.workout.completed) return "partial";
    if (day.date < new Date()) return "missed";
    return "upcoming";
  };

  const statusColors = {
    completed: "#22c55e",
    partial: "#f97316",
    missed: "#ef4444",
    rest: "#6b7280",
    upcoming: "#374151",
    "other-month": "#1f2937"
  };

  const days = getDaysInMonth();
  const stats = {
    streak: calculateStreak(workouts),
    completion: workouts.length > 0 ? Math.round((workouts.filter(w => w.completed).length / workouts.length) * 100) : 0,
    thisMonth: workouts.filter(w => new Date(w.date).getMonth() === currentMonth.getMonth()).length
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-40"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold gradient-text">Training Calendar</h2>
            <p className="text-sm text-[var(--muted)]">Click dates to see workout details</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🔥</span>
                <span className="text-2xl font-bold text-[var(--accent)]">{stats.streak}</span>
              </div>
              <p className="text-xs text-[var(--muted)]">Current Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.completion}%</div>
              <p className="text-xs text-[var(--muted)]">Completion</p>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-[var(--muted)] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const status = getDateStatus(day);
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => day.workout && setSelectedDate(day.workout)}
                className="relative h-10 w-full rounded-lg transition-all duration-200 text-sm font-medium"
                style={{ 
                  backgroundColor: statusColors[status],
                  opacity: day.isCurrentMonth ? 1 : 0.3,
                  color: status === "upcoming" || status === "other-month" ? "#9ca3af" : "white"
                }}
                disabled={!day.workout}
              >
                {day.date.getDate()}
                
                {day.isToday && (
                  <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none" />
                )}
                
                {day.workout?.performanceGrade && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full text-[8px] flex items-center justify-center font-bold">
                    {day.workout.performanceGrade[0]}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-[var(--card-border)]">
          {(["rest", "missed", "partial", "completed"] as const).map((status) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: statusColors[status] }}
              />
              <span className="text-[var(--muted)] capitalize">{status}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Workout Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedDate.sessionTitle || "Workout"}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(selectedDate.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              </div>

              {selectedDate.plannedSession && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-400 mb-1">📋 Planned Session</p>
                  <p className="text-xs text-[var(--muted)]">{selectedDate.plannedSession.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    Target: {selectedDate.plannedSession.duration} min @ {selectedDate.plannedSession.targetPower}% FTP
                  </p>
                </div>
              )}

              {selectedDate.completed && (
                <>
                  {selectedDate.performanceGrade && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-400">{selectedDate.performanceGrade}</p>
                      <p className="text-xs text-[var(--muted)]">Performance Grade</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedDate.duration && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Duration</p>
                        <p className="font-semibold">{Math.round(selectedDate.duration)} min</p>
                      </div>
                    )}
                    {selectedDate.avgPower && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Avg Power</p>
                        <p className="font-semibold">{Math.round(selectedDate.avgPower)}W</p>
                      </div>
                    )}
                    {selectedDate.rpe && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">RPE</p>
                        <p className="font-semibold">{selectedDate.rpe}/10</p>
                      </div>
                    )}
                    {selectedDate.compliance && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">Compliance</p>
                        <p className="font-semibold">{Math.round(selectedDate.compliance)}%</p>
                      </div>
                    )}
                  </div>

                  {selectedDate.feelings && selectedDate.feelings.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--muted)] mb-1">Feelings</p>
                      <div className="flex gap-1 flex-wrap">
                        {selectedDate.feelings.map((feeling, i) => (
                          <span key={i} className="text-xs bg-[var(--card-border)] rounded-full px-2 py-0.5">
                            {feeling}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate.notes && (
                    <div>
                      <p className="text-xs text-[var(--muted)] mb-1">Notes</p>
                      <p className="text-sm bg-[var(--background)] rounded-lg p-3">{selectedDate.notes}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function calculateStreak(workouts: WorkoutData[]): number {
  const sorted = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  for (const workout of sorted) {
    if (workout.completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}