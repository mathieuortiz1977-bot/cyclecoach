"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutData {
  id: string;
  date: string;
  completed: boolean;
  sessionTitle?: string;
  duration?: number;
  plannedSession?: {
    title: string;
    duration: number;
    targetPower: number;
    sessionType: string;
  };
  isPlannedSession?: boolean;
  isCancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
}

interface WeeklyGoals {
  totalTSS: number;
  zoneDistribution: { [zone: string]: number };
  keyWorkouts: string[];
  totalDuration: number;
}

interface Props {
  workout: WorkoutData;
  weekWorkouts: WorkoutData[];
  onCancel: (workoutId: string, reason: string) => void;
  onReschedule: (newSchedule: WorkoutData[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CANCEL_REASONS = [
  "Feeling unwell",
  "Schedule conflict", 
  "Weather conditions",
  "Equipment issues",
  "Recovery needed",
  "Other"
];

export function WorkoutCancellation({ workout, weekWorkouts, onCancel, onReschedule, onClose, isOpen }: Props) {
  const [step, setStep] = useState<"reason" | "reschedule">("reason");
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedSchedule, setSuggestedSchedule] = useState<WorkoutData[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals | null>(null);

  // Count existing cancellations this week
  const cancellationsThisWeek = weekWorkouts.filter(w => w.isCancelled).length;
  const canCancel = cancellationsThisWeek < 2;

  const analyzeWeeklyGoals = (workouts: WorkoutData[]): WeeklyGoals => {
    let totalTSS = 0;
    let totalDuration = 0;
    const zoneDistribution: { [zone: string]: number } = {};
    const keyWorkouts: string[] = [];

    workouts.forEach(w => {
      if (w.plannedSession && !w.isCancelled) {
        totalDuration += w.plannedSession.duration;
        
        // Estimate TSS based on session type and duration
        const sessionType = w.plannedSession.sessionType.toLowerCase();
        let intensityFactor = 0.7; // Default
        
        if (sessionType.includes("vo2") || sessionType.includes("threshold")) {
          intensityFactor = 0.85;
          keyWorkouts.push(w.plannedSession.title);
        } else if (sessionType.includes("interval") || sessionType.includes("sweet")) {
          intensityFactor = 0.8;
        } else if (sessionType.includes("endurance") || sessionType.includes("base")) {
          intensityFactor = 0.65;
        }

        const estimatedTSS = Math.round((w.plannedSession.duration / 60) * intensityFactor * 100);
        totalTSS += estimatedTSS;

        // Zone distribution (simplified)
        const zone = sessionType.includes("vo2") ? "Zone 5" : 
                    sessionType.includes("threshold") ? "Zone 4" :
                    sessionType.includes("tempo") ? "Zone 3" : "Zone 2";
        zoneDistribution[zone] = (zoneDistribution[zone] || 0) + w.plannedSession.duration;
      }
    });

    return { totalTSS, totalDuration, zoneDistribution, keyWorkouts };
  };

  const generateReschedule = async (cancelledWorkout: WorkoutData, reason: string) => {
    setIsAnalyzing(true);
    
    try {
      // Analyze current weekly goals
      const goals = analyzeWeeklyGoals(weekWorkouts);
      setWeeklyGoals(goals);
      
      // Get remaining workouts (excluding cancelled one)
      const remainingWorkouts = weekWorkouts.filter(w => 
        w.id !== cancelledWorkout.id && !w.isCancelled && w.isPlannedSession
      );

      // Call AI to suggest rescheduling
      const response = await fetch("/api/ai/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancelledWorkout,
          remainingWorkouts,
          weeklyGoals: goals,
          cancelReason: reason,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestedSchedule(data.reschedule);
        setStep("reschedule");
      } else {
        throw new Error(data.error || "Failed to generate reschedule");
      }
    } catch (error) {
      console.error("Rescheduling failed:", error);
      // Fallback: simple redistribution
      const fallbackSchedule = redistributeSimple(weekWorkouts, workout);
      setSuggestedSchedule(fallbackSchedule);
      setStep("reschedule");
    }
    
    setIsAnalyzing(false);
  };

  // Simple fallback redistribution logic
  const redistributeSimple = (workouts: WorkoutData[], cancelled: WorkoutData): WorkoutData[] => {
    const remaining = workouts.filter(w => w.id !== cancelled.id && !w.isCancelled);
    
    // Find the longest remaining workout to extend slightly
    const longestWorkout = remaining
      .filter(w => w.plannedSession)
      .sort((a, b) => (b.plannedSession?.duration || 0) - (a.plannedSession?.duration || 0))[0];
    
    if (longestWorkout && cancelled.plannedSession) {
      const redistributedMinutes = Math.round(cancelled.plannedSession.duration * 0.6); // Redistribute 60% of cancelled duration
      
      return remaining.map(w => {
        if (w.id === longestWorkout.id && w.plannedSession) {
          return {
            ...w,
            plannedSession: {
              ...w.plannedSession,
              duration: w.plannedSession.duration + redistributedMinutes,
              title: `${w.plannedSession.title} (Extended)`
            }
          };
        }
        return w;
      });
    }
    
    return remaining;
  };

  const handleCancel = async () => {
    const reason = cancelReason === "Other" ? customReason : cancelReason;
    
    if (!reason.trim()) return;
    
    // Cancel the workout
    onCancel(workout.id, reason);
    
    // Ask about rescheduling
    await generateReschedule(workout, reason);
  };

  const handleRescheduleAccept = () => {
    onReschedule(suggestedSchedule);
    onClose();
  };

  const handleRescheduleDecline = () => {
    // Just cancel without rescheduling
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        >
          {step === "reason" && (
            <div className="p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Cancel Workout</h2>
                <p className="text-sm text-[var(--muted)]">
                  {workout.plannedSession?.title || "Planned Session"} - {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {!canCancel && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm text-red-400">
                    ⚠️ You've already cancelled {cancellationsThisWeek} workout{cancellationsThisWeek > 1 ? 's' : ''} this week. Maximum 2 cancellations per week allowed.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium">Why are you cancelling?</label>
                <div className="grid grid-cols-1 gap-2">
                  {CANCEL_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      className={`p-3 text-left text-sm rounded-lg border transition-colors ${
                        cancelReason === reason
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--card-border)] hover:border-[var(--muted)]"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                {cancelReason === "Other" && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Keep Workout
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason || (cancelReason === "Other" && !customReason.trim()) || !canCancel || isAnalyzing}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isAnalyzing ? "Analyzing..." : "Cancel Workout"}
                </button>
              </div>
            </div>
          )}

          {step === "reschedule" && (
            <div className="p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🤖 AI Coach Suggestion</h2>
                <p className="text-sm text-[var(--muted)]">
                  Would you like to reschedule this week to maintain your training goals?
                </p>
              </div>

              {weeklyGoals && (
                <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-sm">📊 Week Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--muted)]">Target TSS:</span>
                      <span className="ml-2 font-medium">{weeklyGoals.totalTSS}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Duration:</span>
                      <span className="ml-2 font-medium">{Math.round(weeklyGoals.totalDuration / 60)}h {weeklyGoals.totalDuration % 60}m</span>
                    </div>
                  </div>
                  {weeklyGoals.keyWorkouts.length > 0 && (
                    <div>
                      <span className="text-[var(--muted)] text-xs">Key Sessions:</span>
                      <span className="ml-2 text-xs">{weeklyGoals.keyWorkouts.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium text-sm">📅 Suggested Changes</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {suggestedSchedule.map((workout, index) => (
                    <div key={workout.id || index} className="bg-[var(--background)] rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{workout.plannedSession?.title}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short' })} - {workout.plannedSession?.duration}min
                          </p>
                        </div>
                        <div className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
                          Modified
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={handleRescheduleDecline}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  No Thanks
                </button>
                <button
                  onClick={handleRescheduleAccept}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Accept Changes
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}