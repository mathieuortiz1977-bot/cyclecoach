"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { generatePlan } from "@/lib/periodization";
import { DAY_FROM_INDEX } from "@/lib/constants";
import * as tz from "@/lib/timezone";
import { api } from "@/lib/api";
import { PolylineMap } from "./PolylineMap";
import { WorkoutCancellation } from "./WorkoutCancellation";
import { VacationPlanner } from "./VacationPlanner";
import { RaceEventPlanner } from "./RaceEventPlanner";

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
  isPlannedSession?: boolean;
  // Cancellation data
  isCancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
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

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  type: "complete_break" | "light_activity" | "cross_training";
  description?: string;
  location?: string;
  isActive: boolean;
  isApplied: boolean;
  expectedFitnessLoss?: string;
  recoveryTime?: string;
}

interface RaceEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  priority: "A" | "B" | "C";
  location?: string;
  distance?: string;
  description?: string;
  peakDate?: string;
  taperWeeks?: number;
  isActive: boolean;
  isComplete: boolean;
}

interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
  upcomingGoals: string[];
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
  const [currentMonth, setCurrentMonth] = useState(tz.today());
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [stravaActivities, setStravaActivities] = useState<WorkoutData[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<WorkoutData[]>([]);
  const [selectedDate, setSelectedDate] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [programStartDate, setProgramStartDate] = useState<Date | null>(null);
  const [plan, setPlan] = useState(() => generatePlan(4));
  
  // Cancellation state
  const [showCancellation, setShowCancellation] = useState(false);
  const [workoutToCancel, setWorkoutToCancel] = useState<WorkoutData | null>(null);
  
  // Vacation state
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [showVacationPlanner, setShowVacationPlanner] = useState(false);
  const [trainingProgram, setTrainingProgram] = useState<TrainingProgram | null>(null);
  
  // Race events state
  const [raceEvents, setRaceEvents] = useState<RaceEvent[]>([]);
  const [showEventPlanner, setShowEventPlanner] = useState(false);

  useEffect(() => {
    loadWorkoutData();
  }, [currentMonth]);

  // Refetch plan when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - refetch to catch any updates
        loadWorkoutData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadWorkoutData = async () => {
    try {
      const [workoutResponse, riderResponse, stravaResponse, planResponse, vacationResponse, eventsResponse] = await Promise.all([
        api.workouts.list(),
        api.rider.get(),
        api.strava.getActivities(),
        api.plan.get(),
        api.vacations.list(),
        api.events.list()
      ]);
      
      const workoutData = workoutResponse.data || {};
      const riderData = riderResponse.data || {};
      const stravaData = stravaResponse.data || {};
      const planData = planResponse.data || {};
      const vacationData = vacationResponse.data || {};
      const eventsData = eventsResponse.data || {};

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

      // Generate planned sessions from training plan
      let actualPlan = planData.plan;
      if (planData.plan && startDate) {
        const trainingDays = riderData.rider?.trainingDays ? 
          riderData.rider.trainingDays.split(',') : 
          ["MON", "TUE", "THU", "FRI", "SAT"];
        
        const plannedWorkouts = generatePlannedSessions(planData.plan, startDate, trainingDays);
        setPlannedSessions(plannedWorkouts);
        setPlan(planData.plan);
        actualPlan = planData.plan;
      } else if (!planData.plan && startDate) {
        // No plan exists yet - generate one client-side temporarily for display
        const trainingDays = riderData.rider?.trainingDays ? 
          riderData.rider.trainingDays.split(',') : 
          ["MON", "TUE", "THU", "FRI", "SAT"];
        const generatedPlan = generatePlan(4, trainingDays as any, riderData.rider?.outdoorDay || "SAT");
        const plannedWorkouts = generatePlannedSessions(generatedPlan, startDate, trainingDays);
        setPlannedSessions(plannedWorkouts);
        setPlan(generatedPlan);
        actualPlan = generatedPlan;
      }

      // Load vacation data
      if (vacationData.success) {
        setVacations(vacationData.vacations || []);
      }

      // Load race events data
      if (eventsData.success) {
        setRaceEvents(eventsData.events || []);
      }

      // Set training program data for vacation/race event planners (always set if startDate exists)
      if (startDate && actualPlan) {
        const programEndDate = new Date(startDate);
        programEndDate.setDate(programEndDate.getDate() + (actualPlan.totalWeeks ? actualPlan.totalWeeks * 7 : 16 * 7));
        
        setTrainingProgram({
          currentBlock: actualPlan.blocks?.length ? getCurrentBlock(actualPlan, startDate) : 1,
          currentWeek: getCurrentWeek(actualPlan, startDate),
          totalBlocks: actualPlan.blocks?.length || 4,
          totalWeeks: actualPlan.totalWeeks || 16,
          programStartDate: startDate.toISOString(),
          programEndDate: programEndDate.toISOString(),
          currentFocus: getCurrentFocus(actualPlan, startDate),
          upcomingGoals: getUpcomingGoals(actualPlan, startDate)
        });
      }
    } catch (error) {
      console.error("Failed to load workout data:", error);
    }
    setLoading(false);
  };

  const generatePlannedSessions = (plan: any, startDate: Date, trainingDays: string[]): WorkoutData[] => {
    const sessions: WorkoutData[] = [];
    let currentDate = new Date(startDate);

    plan.blocks.forEach((block: any) => {
      block.weeks.forEach((week: any) => {
        week.sessions.forEach((session: any) => {
          if (trainingDays.includes(session.dayOfWeek)) {
            // Calculate the date for this session
            const targetDayIndex = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].indexOf(session.dayOfWeek);
            const currentDayIndex = currentDate.getDay();
            const daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
            
            const sessionDate = new Date(currentDate);
            sessionDate.setDate(sessionDate.getDate() + daysToAdd);

            sessions.push({
              id: `planned-${block.blockNumber}-${week.weekNumber}-${session.dayOfWeek}`,
              date: sessionDate.toISOString(),
              completed: false,
              sessionTitle: session.title,
              duration: session.duration,
              plannedSession: {
                title: session.title,
                duration: session.duration,
                targetPower: session.intervals.length > 0 ? 
                  Math.round((session.intervals[0].powerLow + session.intervals[0].powerHigh) / 2) : 
                  65,
                sessionType: session.sessionType
              },
              isPlannedSession: true
            });
          }
        });
        currentDate.setDate(currentDate.getDate() + 7);
      });
    });

    return sessions;
  };

  const findPlannedSession = (date: string, dayOfWeek: string) => {
    // Find matching planned session from the actual training plan
    const dayKey = dayOfWeek?.toUpperCase();
    if (!dayKey || !trainingDays.includes(dayKey)) return null;

    // TODO: Integrate with actual plan data from /api/plan
    // For now, return null to avoid showing incorrect demo data
    return null;
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
    const year = tz.getYear(currentMonth);
    const month = tz.getMonth(currentMonth);
    
    // Get first day of month in UTC-5
    const firstDayDate = new Date();
    firstDayDate.setUTCFullYear(year, month, 1);
    firstDayDate.setUTCHours(5, 0, 0, 0);
    
    // Get the Monday of the week containing the first day
    const startDate = tz.getWeekStart(firstDayDate);

    const days = [];
    let current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const currentISO = tz.formatAsISO(current);
      
      // Find program session for this day
      const dayWorkout = workouts.find(w => 
        tz.formatAsISO(new Date(w.date)) === currentISO
      );
      
      // Find Strava ride for this day
      const stravaRide = stravaActivities.find(a =>
        tz.formatAsISO(new Date(a.date)) === currentISO
      );
      
      // Find planned session for this day
      const plannedSession = plannedSessions.find(p =>
        tz.formatAsISO(new Date(p.date)) === currentISO
      );
      
      const currentMonth_utc = tz.getMonth(current);
      const isCurrentMonth = currentMonth_utc === month;
      const isToday = tz.isSameDay(current, tz.today());
      const dayKey = DAY_FROM_INDEX[tz.getDayOfWeek(current)];
      const isTrainingDay = trainingDays.includes(dayKey);

      // Determine what to show - priority: completed workout > Strava ride > planned session
      let displayData = null;
      if (dayWorkout) {
        displayData = dayWorkout;
      } else if (stravaRide) {
        displayData = stravaRide;
      } else if (plannedSession) {
        displayData = plannedSession;
      }

      days.push({
        date: new Date(current),
        workout: displayData,
        isCurrentMonth,
        isToday,
        isTrainingDay,
        hasStravaRide: !!stravaRide,
        hasProgramSession: !!dayWorkout,
        hasPlannedSession: !!plannedSession
      });

      current = tz.addDays(current, 1);
    }

    return days;
  };

  const getDateStatus = (day: any) => {
    if (!day.isCurrentMonth) return "other-month";
    
    const dayDate = day.date;
    const todayDate = tz.today();
    
    // If program hasn't started, don't show "missed"
    const programHasStarted = programStartDate && dayDate >= programStartDate;
    
    if (!day.isTrainingDay) return "rest";
    
    // Completed program session takes priority
    if (day.hasProgramSession) return "completed";
    
    // Strava ride without program session
    if (day.hasStravaRide && !programHasStarted) return "completed"; // Show Strava rides as completed if no program yet
    if (day.hasStravaRide && programHasStarted) return "partial"; // Show as partial if it's a ride but not planned session
    
    // Planned session (upcoming workout)
    if (day.hasPlannedSession && !tz.isPast(dayDate)) return "planned";
    
    // Only show "missed" if program has started and it's a past training day without any activity
    if (programHasStarted && tz.isPast(dayDate) && day.isTrainingDay && !day.hasStravaRide) return "missed";
    
    return "upcoming";
  };

  const statusColors = {
    completed: "#22c55e",
    partial: "#f97316", 
    missed: "#ef4444",
    planned: "#3b82f6",
    rest: "#c0c0c0",
    upcoming: "#374151",
    "other-month": "#1f2937"
  };

  const days = getDaysInMonth();
  const allWorkouts = [...workouts, ...stravaActivities];
  const allPlannedAndCompleted = [...workouts, ...stravaActivities, ...plannedSessions];
  const stats = {
    streak: calculateStreak(allWorkouts),
    completion: calculateCompletion(workouts),
    thisMonth: allWorkouts.filter(w => new Date(w.date).getMonth() === currentMonth.getMonth()).length,
    upcomingThisMonth: plannedSessions.filter(p => {
      const sessionDate = new Date(p.date);
      const today = new Date();
      return sessionDate.getMonth() === currentMonth.getMonth() && sessionDate >= today;
    }).length
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

  // Cancellation handlers
  const handleCancelWorkout = (workout: WorkoutData) => {
    setWorkoutToCancel(workout);
    setShowCancellation(true);
    setSelectedDate(null); // Close the detail modal
  };

  const handleWorkoutCancelled = async (workoutId: string, reason: string) => {
    try {
      // Update the workout as cancelled
      const response = await api.workouts.cancel(workoutId, reason);

      if (response.success) {
        // Reload data to reflect the cancellation
        await loadWorkoutData();
      }
    } catch (error) {
      console.error("Failed to cancel workout:", error);
    }
  };

  const handleWorkoutReschedule = async (newSchedule: WorkoutData[]) => {
    try {
      // Apply the new schedule - reschedule each workout to its new date
      for (const workout of newSchedule) {
        const originalWorkout = workouts.find(w => w.id === workout.id);
        if (originalWorkout && workout.date !== originalWorkout.date) {
          const response = await api.workouts.reschedule(workout.id, tz.formatAsISO(new Date(workout.date)));
          if (!response.success) {
            console.error(`Failed to reschedule workout ${workout.id}`);
          }
        }
      }
      // Reload data to reflect the changes
      await loadWorkoutData();
    } catch (error) {
      console.error("Failed to apply reschedule:", error);
    }
  };

  // Vacation handlers
  const handleVacationScheduled = async (vacation: Omit<Vacation, 'id' | 'isActive' | 'isApplied'>) => {
    try {
      const response = await api.vacations.create({
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        type: vacation.type as any,
        description: vacation.description,
        location: vacation.location
      });

      if (response.success) {
        // Reload data to include new vacation
        await loadWorkoutData();
        setShowVacationPlanner(false);
      } else {
        console.error("Failed to schedule vacation:", response.error);
        alert(`Failed to schedule vacation: ${response.error}`);
      }
    } catch (error) {
      console.error("Vacation scheduling error:", error);
      alert("Failed to schedule vacation. Please try again.");
    }
  };

  const isDateInVacation = (date: string): Vacation | null => {
    const dateObj = new Date(date);
    return vacations.find(vacation => {
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      return dateObj >= startDate && dateObj <= endDate;
    }) || null;
  };

  const isDateRaceEvent = (date: string): RaceEvent | null => {
    const dateObj = new Date(date);
    return raceEvents.find(event => {
      const eventDate = new Date(event.date);
      return dateObj.toDateString() === eventDate.toDateString();
    }) || null;
  };

  // Race event handlers
  const handleEventScheduled = async (event: Omit<RaceEvent, 'id' | 'isActive' | 'isComplete'>) => {
    try {
      const response = await api.events.create({
        name: event.name,
        date: event.date,
        type: event.type,
        priority: event.priority,
        location: event.location,
        distance: event.distance,
        description: event.description,
        peakDate: event.peakDate,
        taperWeeks: event.taperWeeks
      });

      if (response.success) {
        // Reload data to include new event
        await loadWorkoutData();
        setShowEventPlanner(false);
      } else {
        console.error("Failed to schedule event:", response.error);
        alert(`Failed to schedule event: ${response.error}`);
      }
    } catch (error) {
      console.error("Event scheduling error:", error);
      alert("Failed to schedule event. Please try again.");
    }
  };

  // Get workouts for the current week (for cancellation context)
  const getCurrentWeekWorkouts = (selectedWorkout: WorkoutData): WorkoutData[] => {
    const selectedDate = new Date(selectedWorkout.date);
    const startOfWeek = tz.getWeekStart(selectedDate);
    const endOfWeek = tz.getWeekEnd(selectedDate);
    
    return [...workouts, ...plannedSessions].filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    });
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

        {/* Planning buttons - Mobile prominent placement */}
        <div className="grid grid-cols-2 gap-2 mb-4 sm:hidden">
          <button
            onClick={() => setShowVacationPlanner(true)}
            className="w-full px-3 py-2.5 text-sm font-medium bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 text-[var(--accent)] rounded-lg border border-[var(--accent)]/20 hover:border-[var(--accent)]/30 transition-colors"
          >
            🏖️ Vacation
          </button>
          <button
            onClick={() => setShowEventPlanner(true)}
            className="w-full px-3 py-2.5 text-sm font-medium bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg border border-yellow-500/20 hover:border-yellow-500/30 transition-colors"
          >
            🏆 Races
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors"
            >
              ←
            </button>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => setShowVacationPlanner(true)}
                className="px-3 py-1.5 text-xs bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 text-[var(--accent)] rounded-lg border border-[var(--accent)]/20 hover:border-[var(--accent)]/30 transition-colors"
              >
                🏖️ Plan Vacation
              </button>
              <button
                onClick={() => setShowEventPlanner(true)}
                className="px-3 py-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg border border-yellow-500/20 hover:border-yellow-500/30 transition-colors"
              >
                🏆 Race Events
              </button>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center flex-1">
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
                  color: status === "upcoming" || status === "other-month" || status === "rest" ? "#374151" : "white"
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

                {/* Vacation indicator */}
                {isDateInVacation(day.date.toISOString()) && (
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-lg border-2 border-yellow-500/40 flex items-center justify-center">
                    <span className="text-xs">🏖️</span>
                  </div>
                )}

                {/* Race event indicator */}
                {(() => {
                  const raceEvent = isDateRaceEvent(day.date.toISOString());
                  if (raceEvent) {
                    const priorityColors = {
                      A: "bg-yellow-400/30 border-yellow-400/50 text-yellow-400",
                      B: "bg-gray-400/30 border-gray-400/50 text-gray-300", 
                      C: "bg-orange-400/30 border-orange-400/50 text-orange-400"
                    };
                    const priorityIcons = { A: "🥇", B: "🥈", C: "🥉" };
                    
                    return (
                      <div className={`absolute inset-0 rounded-lg border-2 flex items-center justify-center ${priorityColors[raceEvent.priority]}`}>
                        <span className="text-xs">{priorityIcons[raceEvent.priority]}</span>
                      </div>
                    );
                  }
                })()}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-[var(--card-border)] flex-wrap">
          {(["rest", "planned", "completed", "partial", "missed"] as const).map((status) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: statusColors[status] }}
              />
              <span className="text-[var(--muted)] capitalize">
                {status === "partial" ? "Strava Only" : 
                 status === "planned" ? "Scheduled" : status}
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
              className="glass max-w-sm w-full p-4 space-y-3 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="text-base font-semibold leading-tight">
                    {selectedDate.isStravaRide ? selectedDate.name : selectedDate.sessionTitle || "Workout"}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(selectedDate.date).toLocaleDateString()}
                  </p>
                  {selectedDate.isStravaRide && (
                    <span className="inline-block text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full mt-1">
                      📱 Strava
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg"
                >
                  ✕
                </button>
              </div>

              {selectedDate.plannedSession && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <p className="text-xs font-medium text-blue-400 mb-1">📋 Planned</p>
                  <p className="text-[10px] text-[var(--muted)] leading-tight">
                    {selectedDate.plannedSession.title} • {selectedDate.plannedSession.duration}min @ {selectedDate.plannedSession.targetPower}% FTP
                  </p>
                </div>
              )}

              {selectedDate.performanceGrade && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-green-400">{selectedDate.performanceGrade}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {selectedDate.duration && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400 text-sm mb-0.5">⏱️</div>
                    <div className="text-sm font-semibold">{Math.round(selectedDate.duration)} min</div>
                  </div>
                )}
                
                {(selectedDate.avgPower || selectedDate.normalizedPower) && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-[var(--accent)] text-sm mb-0.5">⚡</div>
                    <div className="text-sm font-semibold">
                      {Math.round(selectedDate.normalizedPower || selectedDate.avgPower || 0)}W
                    </div>
                  </div>
                )}

                {selectedDate.distance && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-sm mb-0.5">🚴</div>
                    <div className="text-sm font-semibold">{selectedDate.distance.toFixed(1)} km</div>
                  </div>
                )}

                {selectedDate.elevation && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-purple-400 text-sm mb-0.5">⛰️</div>
                    <div className="text-sm font-semibold">{Math.round(selectedDate.elevation)}m</div>
                  </div>
                )}

                {selectedDate.tss && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-sm mb-0.5">🔥</div>
                    <div className="text-sm font-semibold">{selectedDate.tss}</div>
                  </div>
                )}

                {selectedDate.avgHr && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-2 text-center">
                    <div className="text-pink-400 text-sm mb-0.5">❤️</div>
                    <div className="text-sm font-semibold">{Math.round(selectedDate.avgHr)} bpm</div>
                  </div>
                )}
              </div>

              {/* Map for Strava rides */}
              {selectedDate.isStravaRide && selectedDate.mapPolyline && (
                <div className="bg-[var(--background)]/50 rounded-lg p-2">
                  <h4 className="text-xs font-medium text-[var(--accent)] mb-1">🗺️ Route</h4>
                  <PolylineMap polyline={selectedDate.mapPolyline} className="w-full h-32" />
                  <div className="flex justify-between items-center mt-1 text-[10px] text-[var(--muted)]">
                    <span>🟢→🔴</span>
                    <a 
                      href={`https://www.strava.com/activities/${selectedDate.id.replace('strava-', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[var(--accent)] hover:underline"
                    >
                      Strava
                    </a>
                  </div>
                </div>
              )}

              {selectedDate.feelings && selectedDate.feelings.length > 0 && (
                <div>
                  <p className="text-[10px] text-[var(--muted)] mb-1">Feelings</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedDate.feelings.map((feeling, i) => (
                      <span key={i} className="text-[10px] bg-[var(--card-border)] rounded-full px-1.5 py-0.5">
                        {feeling}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate.notes && (
                <div>
                  <p className="text-[10px] text-[var(--muted)] mb-1">Notes</p>
                  <p className="text-xs bg-[var(--background)] rounded-lg p-2">{selectedDate.notes}</p>
                </div>
              )}

              {/* Cancel button for planned sessions */}
              {selectedDate.isPlannedSession && !selectedDate.completed && !selectedDate.isCancelled && (
                <div className="pt-3 border-t border-[var(--card-border)]">
                  <button
                    onClick={() => handleCancelWorkout(selectedDate)}
                    className="w-full py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-colors"
                  >
                    ❌ Cancel Workout
                  </button>
                  <p className="text-[9px] text-[var(--muted)] text-center mt-1">
                    Max 2 cancellations per week
                  </p>
                </div>
              )}

              {selectedDate.isCancelled && (
                <div className="pt-3 border-t border-[var(--card-border)]">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <p className="text-xs text-red-400 font-medium">❌ Cancelled</p>
                    {selectedDate.cancelReason && (
                      <p className="text-[9px] text-[var(--muted)] mt-1">{selectedDate.cancelReason}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Cancellation Modal */}
      {workoutToCancel && (
        <WorkoutCancellation
          workout={workoutToCancel}
          weekWorkouts={getCurrentWeekWorkouts(workoutToCancel)}
          onCancel={handleWorkoutCancelled}
          onReschedule={handleWorkoutReschedule}
          onClose={() => {
            setShowCancellation(false);
            setWorkoutToCancel(null);
          }}
          isOpen={showCancellation}
        />
      )}

      {/* Vacation Planner Modal */}
      {trainingProgram && (
        <VacationPlanner
          isOpen={showVacationPlanner}
          onClose={() => setShowVacationPlanner(false)}
          onVacationScheduled={handleVacationScheduled}
          existingVacations={vacations}
          trainingProgram={trainingProgram}
        />
      )}

      {/* Race Event Planner Modal */}
      {trainingProgram && (
        <RaceEventPlanner
          isOpen={showEventPlanner}
          onClose={() => setShowEventPlanner(false)}
          onEventScheduled={handleEventScheduled}
          existingEvents={raceEvents}
          trainingProgram={trainingProgram}
        />
      )}
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

// Helper functions for training program status
function getCurrentBlock(plan: any, startDate: Date): number {
  const daysSinceStart = tz.daysBetween(startDate, tz.today());
  const weeksSinceStart = Math.floor(daysSinceStart / 7);
  
  let currentBlock = 1;
  let weeksAccumulated = 0;
  
  for (let i = 0; i < plan.blocks.length; i++) {
    if (weeksAccumulated + plan.blocks[i].weeks.length > weeksSinceStart) {
      currentBlock = i + 1;
      break;
    }
    weeksAccumulated += plan.blocks[i].weeks.length;
  }
  
  return currentBlock;
}

function getCurrentWeek(plan: any, startDate: Date): number {
  const daysSinceStart = tz.daysBetween(startDate, tz.today());
  return Math.floor(daysSinceStart / 7) + 1;
}

function getCurrentFocus(plan: any, startDate: Date): string {
  const currentBlock = getCurrentBlock(plan, startDate);
  if (currentBlock <= plan.blocks.length) {
    return plan.blocks[currentBlock - 1]?.focus || "Base Building";
  }
  return "Maintenance";
}

function getUpcomingGoals(plan: any, startDate: Date): string[] {
  // Simple implementation - in real world would be more sophisticated
  const currentBlock = getCurrentBlock(plan, startDate);
  const goals = [];
  
  if (currentBlock === 1) {
    goals.push("Build aerobic base", "Establish training routine");
  } else if (currentBlock === 2) {
    goals.push("Increase training intensity", "Develop lactate threshold");
  } else if (currentBlock === 3) {
    goals.push("Peak fitness", "Race preparation");
  } else {
    goals.push("Maintain fitness", "Active recovery");
  }
  
  return goals;
}