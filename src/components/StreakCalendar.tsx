"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

type DayStatus = "completed" | "partial" | "missed" | "rest" | "future";

interface Props {
  trainingDays?: string[];
}

const statusColors: Record<DayStatus, string> = {
  completed: "#22c55e",
  partial: "#f97316",
  missed: "#ef4444",
  rest: "var(--card-border)",
  future: "var(--background)",
};

const statusLabels: Record<DayStatus, string> = {
  completed: "Completed",
  partial: "Partial",
  missed: "Missed",
  rest: "Rest",
  future: "Upcoming",
};

function generateCalendarData(weeks: number, trainingDays: string[]): { date: Date; status: DayStatus }[][] {
  const dayMap: Record<number, string> = { 0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const grid: { date: Date; status: DayStatus }[][] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekDays: { date: Date; status: DayStatus }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - w * 7 - (6 - d));

      const dayKey = dayMap[date.getDay()];
      const isTrainingDay = trainingDays.includes(dayKey);
      const isFuture = date > today;
      const isToday = date.getTime() === today.getTime();

      let status: DayStatus;
      if (isFuture) {
        status = "future";
      } else if (!isTrainingDay) {
        status = "rest";
      } else if (isToday) {
        status = "future"; // today hasn't happened yet
      } else {
        // Simulate: 75% completed, 15% partial, 10% missed
        const rand = Math.random();
        status = rand < 0.75 ? "completed" : rand < 0.9 ? "partial" : "missed";
      }

      weekDays.push({ date, status });
    }
    grid.push(weekDays);
  }

  return grid;
}

export function StreakCalendar({ trainingDays = ["MON", "TUE", "THU", "FRI", "SAT"] }: Props) {
  const grid = useMemo(() => generateCalendarData(12, trainingDays), [trainingDays]);

  // Calculate streak
  const allDays = grid.flat().filter((d) => d.status === "completed" || d.status === "partial" || d.status === "missed");
  let streak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].status === "completed" || allDays[i].status === "partial") {
      streak++;
    } else {
      break;
    }
  }

  const totalCompleted = allDays.filter((d) => d.status === "completed").length;
  const totalTraining = allDays.length;
  const completionRate = totalTraining > 0 ? Math.round((totalCompleted / totalTraining) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Training Streak</h2>
          <p className="text-sm text-[var(--muted)]">Last 12 weeks</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-2xl font-bold text-[var(--accent)]">🔥 {streak}</p>
            <p className="text-[10px] text-[var(--muted)]">Current Streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
            <p className="text-[10px] text-[var(--muted)]">Completion</p>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
        <div className="flex gap-[3px] min-w-[300px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.005 }}
                  className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm"
                  style={{ backgroundColor: statusColors[day.status] }}
                  title={`${day.date.toLocaleDateString()} — ${statusLabels[day.status]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-3 text-[10px] text-[var(--muted)]">
        {(["rest", "missed", "partial", "completed"] as DayStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: statusColors[s] }} />
            <span>{statusLabels[s]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
