"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { DAY_FROM_INDEX } from "@/lib/constants";

type DayStatus = "completed" | "partial" | "missed" | "rest" | "future";

interface Props {
  trainingDays?: string[];
}

const statusColors: Record<DayStatus, string> = {
  completed: "#22c55e",
  partial: "#f97316", 
  missed: "#ef4444",
  rest: "#374151",
  future: "#1f2937",
};

const statusLabels: Record<DayStatus, string> = {
  completed: "Completed",
  partial: "Partial", 
  missed: "Missed",
  rest: "Rest",
  future: "Upcoming",
};

function generateCalendarData(weeks: number, trainingDays: string[]): { date: Date; status: DayStatus }[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const grid: { date: Date; status: DayStatus }[][] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekDays: { date: Date; status: DayStatus }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - w * 7 - (6 - d));

      const dayKey = DAY_FROM_INDEX[date.getDay()];
      const isTrainingDay = trainingDays.includes(dayKey);
      const isFuture = date > today;

      let status: DayStatus;
      if (isFuture) {
        status = "future";
      } else if (!isTrainingDay) {
        status = "rest";
      } else {
        // Simulate realistic training pattern: 70% completed, 20% partial, 10% missed
        const rand = Math.random();
        status = rand < 0.7 ? "completed" : rand < 0.9 ? "partial" : "missed";
      }

      weekDays.push({ date, status });
    }
    grid.push(weekDays);
  }

  return grid;
}

export function StreakCalendar({ trainingDays = ["MON", "TUE", "THU", "FRI", "SAT"] }: Props) {
  const grid = useMemo(() => generateCalendarData(12, trainingDays), [trainingDays]);

  // Calculate metrics
  const allDays = grid.flat().filter((d) => d.status !== "future");
  const trainingDaysOnly = allDays.filter((d) => d.status !== "rest");
  
  // Current streak (consecutive completed/partial from the end)
  let currentStreak = 0;
  for (let i = trainingDaysOnly.length - 1; i >= 0; i--) {
    if (trainingDaysOnly[i].status === "completed" || trainingDaysOnly[i].status === "partial") {
      currentStreak++;
    } else {
      break;
    }
  }

  // Best streak in the period
  let bestStreak = 0;
  let tempStreak = 0;
  for (const day of trainingDaysOnly) {
    if (day.status === "completed" || day.status === "partial") {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const completedCount = trainingDaysOnly.filter((d) => d.status === "completed").length;
  const partialCount = trainingDaysOnly.filter((d) => d.status === "partial").length;
  const totalTraining = trainingDaysOnly.length;
  const completionRate = totalTraining > 0 ? Math.round(((completedCount + partialCount * 0.5) / totalTraining) * 100) : 0;

  // This week's progress
  const thisWeek = grid[grid.length - 1];
  const thisWeekTraining = thisWeek.filter((d) => trainingDays.includes(DAY_FROM_INDEX[d.date.getDay()]) && d.status !== "future");
  const thisWeekCompleted = thisWeekTraining.filter((d) => d.status === "completed" || d.status === "partial").length;
  const thisWeekProgress = thisWeekTraining.length > 0 ? Math.round((thisWeekCompleted / thisWeekTraining.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-6"
    >
      {/* Header with main metrics */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold gradient-text mb-1">Training Streak</h2>
          <p className="text-sm text-[var(--muted)]">Last 12 weeks</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <span className="text-3xl font-black text-[var(--accent)]">{currentStreak}</span>
            </div>
            <p className="text-xs text-[var(--muted)] font-medium">Current Streak</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-green-400 mb-1">{completionRate}%</div>
            <p className="text-xs text-[var(--muted)] font-medium">Completion</p>
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[var(--background)]/50 rounded-xl">
        <div className="text-center">
          <div className="text-lg font-bold text-[var(--foreground)]">{bestStreak}</div>
          <div className="text-xs text-[var(--muted)]">Best Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{thisWeekProgress}%</div>
          <div className="text-xs text-[var(--muted)]">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{completedCount}</div>
          <div className="text-xs text-[var(--muted)]">Total Sessions</div>
        </div>
      </div>

      {/* Improved heatmap grid */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-1 min-w-[400px] p-2">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: (wi * 7 + di) * 0.002,
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className="w-4 h-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: statusColors[day.status],
                    opacity: day.status === "future" ? 0.3 : 1,
                    boxShadow: day.status === "completed" ? "0 0 8px rgba(34, 197, 94, 0.3)" : undefined
                  }}
                  title={`${day.date.toLocaleDateString()} — ${statusLabels[day.status]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced legend with counts */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--card-border)]">
        <div className="flex gap-4 text-xs">
          {(["rest", "missed", "partial", "completed"] as DayStatus[]).map((s) => {
            const count = allDays.filter(d => d.status === s).length;
            return (
              <div key={s} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-md shadow-sm" 
                  style={{ backgroundColor: statusColors[s] }} 
                />
                <span className="text-[var(--muted)] font-medium">{statusLabels[s]}</span>
                <span className="text-[var(--foreground)] font-bold">({count})</span>
              </div>
            );
          })}
        </div>
        
        {/* Trend indicator */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <span>📈</span>
            <span className="font-medium">On fire!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}