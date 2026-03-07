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
  programStartDate?: string;
  workoutData?: any[];
  stravaData?: any[];
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

export function WeeklyDigest({ digest, programStartDate, workoutData = [], stravaData = [] }: Props) {
  const today = new Date();
  const programStart = programStartDate ? new Date(programStartDate) : null;
  
  // Check if program has started
  const programHasStarted = programStart && today >= programStart;
  
  // Calculate this week's data (using local timezone)
  const getWeekData = () => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    if (programHasStarted) {
      // Program mode: show program completion metrics
      const programWorkouts = workoutData.filter((w: any) => {
        const workoutDate = new Date(w.createdAt || w.date);
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek && w.isProgramSession;
      });
      
      const completedSessions = programWorkouts.filter((w: any) => w.completed).length;
      const totalSessions = 5; // Typical weekly sessions
      
      return {
        mode: 'program',
        sessionsCompleted: completedSessions,
        sessionsPlanned: totalSessions,
        totalDuration: programWorkouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0),
        totalTSS: programWorkouts.reduce((sum: number, w: any) => sum + (w.tss || 0), 0)
      };
    } else {
      // Non-program mode: show ride count and activity
      const allActivities = [
        ...workoutData.filter((w: any) => {
          const workoutDate = new Date(w.createdAt || w.date);
          return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
        }),
        ...stravaData.filter((s: any) => {
          const stravaDate = new Date(s.date);
          return stravaDate >= startOfWeek && stravaDate <= endOfWeek;
        })
      ];
      
      return {
        mode: 'rides',
        ridesCount: allActivities.length,
        totalDuration: allActivities.reduce((sum: number, a: any) => sum + (a.duration || 0), 0),
        totalDistance: allActivities.reduce((sum: number, a: any) => sum + (a.distance || 0), 0),
        totalElevation: allActivities.reduce((sum: number, a: any) => sum + (a.elevation || 0), 0)
      };
    }
  };
  
  const weekData = getWeekData();
  const d = digest || generateSampleDigest();

  if (weekData.mode === 'rides') {
    // Non-program mode: show ride activity
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">🚴 Weekly Activity</h2>
            <p className="text-sm text-[var(--muted)]">Your rides this week</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--foreground)]">{(weekData as any).ridesCount}</p>
            <p className="text-[10px] text-[var(--muted)]">Rides</p>
          </div>
        </div>

        {/* Activity stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">Duration</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {Math.floor((weekData as any).totalDuration / 60)}h {(weekData as any).totalDuration % 60}m
            </p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">Distance</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {Math.round((weekData as any).totalDistance / 1000)}km
            </p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">Elevation</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {Math.round((weekData as any).totalElevation)}m
            </p>
          </div>
        </div>

        {/* Motivation message */}
        <div className="bg-[var(--background)] rounded-lg p-4">
          <p className="text-xs text-[var(--accent)] font-medium mb-1">
            {(weekData as any).ridesCount > 0 ? "🌟 Keep it up!" : "🚴 Ready to ride?"}
          </p>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {(weekData as any).ridesCount > 0 
              ? `Great week! You've completed ${(weekData as any).ridesCount} ride${(weekData as any).ridesCount > 1 ? 's' : ''} so far. Every ride counts toward building your fitness.`
              : programStart 
                ? `Your training program starts ${programStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Consider getting some base miles in before then!`
                : "Ready to start riding? Set up your training program or just log some rides to build fitness."
            }
          </p>
        </div>
      </motion.div>
    );
  }

  // Program mode: show structured training progress
  const completionPct = (weekData as any).sessionsPlanned > 0 ? 
    Math.round(((weekData as any).sessionsCompleted / (weekData as any).sessionsPlanned) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">📋 Weekly Progress</h2>
          <p className="text-sm text-[var(--muted)]">Training program week</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--foreground)]">{(weekData as any).sessionsCompleted}/{(weekData as any).sessionsPlanned}</p>
          <p className="text-[10px] text-[var(--muted)]">Sessions</p>
        </div>
      </div>

      {/* Program stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">Completion</p>
          <p className="text-lg font-bold" style={{ color: completionPct >= 80 ? "#22c55e" : completionPct >= 60 ? "#eab308" : "#ef4444" }}>
            {completionPct}%
          </p>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">Duration</p>
          <p className="text-lg font-bold text-[var(--foreground)]">
            {Math.floor((weekData as any).totalDuration / 60)}h {(weekData as any).totalDuration % 60}m
          </p>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted)]">TSS</p>
          <p className="text-lg font-bold text-[var(--foreground)]">{(weekData as any).totalTSS || 0}</p>
        </div>
      </div>

      {/* Program progress summary */}
      <div className="bg-[var(--background)] rounded-lg p-4 mb-4">
        <p className="text-xs text-[var(--accent)] font-medium mb-1">📊 This Week</p>
        <p className="text-sm text-[var(--foreground)] leading-relaxed">
          {completionPct >= 80 
            ? `Excellent progress! You've completed ${(weekData as any).sessionsCompleted} out of ${(weekData as any).sessionsPlanned} planned sessions this week. Stay consistent!`
            : completionPct >= 60
            ? `Good progress! ${(weekData as any).sessionsCompleted} out of ${(weekData as any).sessionsPlanned} sessions done. You're ${(weekData as any).sessionsPlanned - (weekData as any).sessionsCompleted} session${(weekData as any).sessionsPlanned - (weekData as any).sessionsCompleted > 1 ? 's' : ''} away from a complete week.`
            : (weekData as any).sessionsCompleted > 0
            ? `You've completed ${(weekData as any).sessionsCompleted} session${(weekData as any).sessionsCompleted > 1 ? 's' : ''} this week. Every session counts toward your fitness goals!`
            : "Ready to start this week's training? Check your planned sessions and get riding!"
          }
        </p>
      </div>

      {/* Motivation footer */}
      <div className="bg-[var(--background)] rounded-lg p-3">
        <p className="text-xs text-[var(--muted)] mb-1">💪 Keep Going</p>
        <p className="text-sm font-medium text-[var(--foreground)]">
          {completionPct >= 80 ? "You're crushing it this week!" : "Consistency is key — every session matters!"}
        </p>
      </div>
    </motion.div>
  );
}
