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
  normalizedPower?: number;
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
  isProgramSession?: boolean;
  // Strava ride data
  isStravaRide?: boolean;
  name?: string;
  type?: string;
  distance?: number;
  elevation?: number;
  avgHr?: number;
  maxHr?: number;
  tss?: number;
  mapPolyline?: string;
  averageSpeed?: number;
  kilojoules?: number;
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
  const [stravaActivities, setStravaActivities] = useState<WorkoutData[]>([]);
  const [selectedDate, setSelectedDate] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [programStartDate, setProgramStartDate] = useState<Date | null>(null);
  const [plan] = useState(() => generatePlan(4));

  useEffect(() => {
    loadWorkoutData();
  }, [currentMonth]);

  const loadWorkoutData = async () => {
    try {
      const [workoutRes, riderRes, stravaRes] = await Promise.all([
        fetch("/api/workouts"),
        fetch("/api/rider"),
        fetch("/api/strava/activities")
      ]);
      
      const [workoutData, riderData, stravaData] = await Promise.all([
        workoutRes.json(),
        riderRes.json(), 
        stravaRes.json()
      ]);

      // Set program start date
      const startDate = riderData.rider?.programStartDate ? new Date(riderData.rider.programStartDate) : null;
      setProgramStartDate(startDate);

      // Load program sessions
      if (workoutData.workouts) {
        const enrichedWorkouts = workoutData.workouts
          .filter((w: any) => {
            // For program completion tracking, only count program sessions
            if (!w.isProgramSession) return false;
            
            // Only count workouts after program start date
            if (startDate && new Date(w.createdAt) < startDate) return false;
            
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

      // Load Strava activities
      if (stravaData.activities) {
        const stravaWorkouts = stravaData.activities
          .filter((a: any) => {
            // Only include cycling activities
            return ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(a.type);
          })
          .map((a: any) => ({
            id: `strava-${a.id}`,
            date: a.date,
            completed: true,
            name: a.name,
            type: a.type,
            avgPower: a.avgPower,
            normalizedPower: a.normalizedPower,
            duration: Math.round(a.duration / 60), // Convert to minutes
            distance: a.distance,
            elevation: a.elevation,
            avgHr: a.avgHr,
            maxHr: a.maxHr,
            tss: a.tss,
            mapPolyline: a.mapPolyline,
            averageSpeed: a.averageSpeed,
            kilojoules: a.kilojoules,
            isStravaRide: true,
            performanceGrade: gradeStravaRide(a, riderData.rider?.ftp || 190)
          }));
        setStravaActivities(stravaWorkouts);
      }
    } catch (error) {
      console.error("Failed to load workout data:", error);
    }
    setLoading(false);
  };

  const findPlannedSession = (date: string, dayOfWeek: string) => {
    // Find matching planned session from the training plan
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

  const gradeStravaRide = (activity: any, ftp: number): string => {
    if (!activity.avgPower || !ftp) return "";
    
    const intensityFactor = activity.avgPower / ftp;
    const duration = activity.duration / 60; // minutes
    
    if (intensityFactor >= 0.85 && duration >= 60) return "A High Quality";
    if (intensityFactor >= 0.75 && duration >= 45) return "B Good Effort";
    if (intensityFactor >= 0.65 && duration >= 30) return "C Steady Ride";
    return "D Easy Ride";
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
      // Find program session for this day
      const dayWorkout = workouts.find(w => 
        new Date(w.date).toDateString() === current.toDateString()
      );
      
      // Find Strava ride for this day
      const stravaRide = stravaActivities.find(a =>
        new Date(a.date).toDateString() === current.toDateString()
      );
      
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const dayKey = DAY_FROM_INDEX[current.getDay()];
      const isTrainingDay = trainingDays.includes(dayKey);

      // Determine what to show - program session or Strava ride
      let displayData = null;
      if (dayWorkout) {
        displayData = dayWorkout;
      } else if (stravaRide) {
        displayData = stravaRide;
      }

      days.push({
        date: new Date(current),
        workout: displayData,
        isCurrentMonth,
        isToday,
        isTrainingDay,
        hasStravaRide: !!stravaRide,
        hasProgramSession: !!dayWorkout
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDateStatus = (day: any) => {
    if (!day.isCurrentMonth) return "other-month";
    
    const dayDate = day.date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    
    // If program hasn't started, don't show "missed"
    const programHasStarted = programStartDate && dayDate >= programStartDate;
    
    if (!day.isTrainingDay) return "rest";
    
    if (day.hasProgramSession) return "completed";
    if (day.hasStravaRide && !programHasStarted) return "completed"; // Show Strava rides as completed if no program yet
    if (day.hasStravaRide && programHasStarted) return "partial"; // Show as partial if it's a ride but not planned session
    
    // Only show "missed" if program has started and it's a past training day
    if (programHasStarted && dayDate < today && day.isTrainingDay) return "missed";
    
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
  const allWorkouts = [...workouts, ...stravaActivities];
  const stats = {
    streak: calculateStreak(allWorkouts),
    completion: calculateCompletion(workouts),
    thisMonth: allWorkouts.filter(w => new Date(w.date).getMonth() === currentMonth.getMonth()).length
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: any) => {
    if (day.workout) {
      setSelectedDate(day.workout);
    }
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
            <p className="text-sm text-[var(--muted)]">Click dates to see ride details</p>
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
                onClick={() => handleDateClick(day)}
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

                {/* Show both Strava and program indicators */}
                {day.hasStravaRide && day.hasProgramSession && (
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full" />
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
              <span className="text-[var(--muted)] capitalize">
                {status === "partial" ? "Strava Only" : status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ride Detail Modal */}
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
              className="glass max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedDate.isStravaRide ? selectedDate.name : selectedDate.sessionTitle || "Workout"}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(selectedDate.date).toLocaleDateString()}
                  </p>
                  {selectedDate.isStravaRide && (
                    <span className="inline-block text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mt-1">
                      📱 Strava Ride
                    </span>
                  )}
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

              {selectedDate.performanceGrade && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-400">{selectedDate.performanceGrade}</p>
                  <p className="text-xs text-[var(--muted)]">Performance Grade</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedDate.duration && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-blue-400 text-lg mb-1">⏱️</div>
                    <div className="font-semibold">{Math.round(selectedDate.duration)} min</div>
                    <div className="text-xs text-[var(--muted)]">Duration</div>
                  </div>
                )}
                
                {(selectedDate.avgPower || selectedDate.normalizedPower) && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-[var(--accent)] text-lg mb-1">⚡</div>
                    <div className="font-semibold">
                      {Math.round(selectedDate.normalizedPower || selectedDate.avgPower || 0)}W
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {selectedDate.normalizedPower ? "Normalized Power" : "Avg Power"}
                    </div>
                  </div>
                )}

                {selectedDate.distance && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-green-400 text-lg mb-1">🚴</div>
                    <div className="font-semibold">{selectedDate.distance.toFixed(1)} km</div>
                    <div className="text-xs text-[var(--muted)]">Distance</div>
                  </div>
                )}

                {selectedDate.elevation && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-purple-400 text-lg mb-1">⛰️</div>
                    <div className="font-semibold">{Math.round(selectedDate.elevation)}m</div>
                    <div className="text-xs text-[var(--muted)]">Elevation</div>
                  </div>
                )}

                {selectedDate.tss && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-red-400 text-lg mb-1">🔥</div>
                    <div className="font-semibold">{selectedDate.tss}</div>
                    <div className="text-xs text-[var(--muted)]">TSS</div>
                  </div>
                )}

                {selectedDate.avgHr && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-pink-400 text-lg mb-1">❤️</div>
                    <div className="font-semibold">{Math.round(selectedDate.avgHr)} bpm</div>
                    <div className="text-xs text-[var(--muted)]">Avg HR</div>
                  </div>
                )}
              </div>

              {/* Map for Strava rides */}
              {selectedDate.isStravaRide && selectedDate.mapPolyline && (
                <div className="bg-[var(--background)]/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[var(--accent)] mb-2">🗺️ Route Map</h4>
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=auto&destination=auto&waypoints=enc:${selectedDate.mapPolyline}:&mode=bicycling`}
                      width="100%"
                      height="100%"
                      className="rounded-lg"
                      loading="lazy"
                      title="Ride Route"
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">
                    📍 View on <a href={`https://www.strava.com/activities/${selectedDate.id.replace('strava-', '')}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Strava</a>
                  </p>
                </div>
              )}

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

function calculateCompletion(programWorkouts: WorkoutData[]): number {
  if (programWorkouts.length === 0) return 0;
  const completed = programWorkouts.filter(w => w.completed).length;
  return Math.round((completed / programWorkouts.length) * 100);
}