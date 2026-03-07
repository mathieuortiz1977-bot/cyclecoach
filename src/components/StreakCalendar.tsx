"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Props {
  trainingDays?: string[];
}

interface WorkoutData {
  date: string;
  completed: boolean;
  partial?: boolean;
}

export function StreakCalendar({ trainingDays = ["MON", "TUE", "THU", "FRI", "SAT"] }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load real workout completion data
    fetch("/api/workouts")
      .then((res) => res.json())
      .then((data) => {
        if (data.workouts) {
          setWorkouts(data.workouts.map((w: any) => ({
            date: w.completedAt || w.createdAt,
            completed: w.completed,
            partial: w.rpe > 8 || !w.completed, // partial if RPE too high or not completed
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (workouts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 text-center"
      >
        <div className="mb-4">
          <span className="text-4xl mb-2 block">📊</span>
          <h2 className="text-lg font-semibold mb-2">Training Streak</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Complete your first workout to start building your streak!
          </p>
        </div>
        
        <div className="bg-[var(--background)]/50 rounded-xl p-4 mb-4">
          <p className="text-xs text-[var(--muted)]">
            Your training history will appear here as you complete workouts.
          </p>
        </div>

        <div className="flex justify-center gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#22c55e]"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#f97316]"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#374151]"></div>
            <span>Rest</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // If we have real data, show minimal version focusing on actual streak
  const currentStreak = calculateCurrentStreak(workouts);
  const totalCompleted = workouts.filter(w => w.completed).length;
  const completionRate = Math.round((totalCompleted / workouts.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold gradient-text mb-1">Training Streak</h2>
          <p className="text-sm text-[var(--muted)]">Based on completed workouts</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <span className="text-3xl font-black text-[var(--accent)]">{currentStreak}</span>
            </div>
            <p className="text-xs text-[var(--muted)]">Current Streak</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-green-400 mb-1">{completionRate}%</div>
            <p className="text-xs text-[var(--muted)]">Completion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--background)]/50 rounded-xl">
        <div className="text-center">
          <div className="text-lg font-bold text-[var(--foreground)]">{totalCompleted}</div>
          <div className="text-xs text-[var(--muted)]">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{workouts.length}</div>
          <div className="text-xs text-[var(--muted)]">All Activities</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">
            {workouts.filter(w => w.partial).length}
          </div>
          <div className="text-xs text-[var(--muted)]">Partial</div>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
            <span>🔥</span>
            <span className="font-medium">Keep it going!</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function calculateCurrentStreak(workouts: WorkoutData[]): number {
  // Sort by date, most recent first
  const sorted = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  for (const workout of sorted) {
    if (workout.completed || workout.partial) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}