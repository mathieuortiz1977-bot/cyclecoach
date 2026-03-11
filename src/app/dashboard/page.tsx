"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import type { TrainingBlock, TrainingWeek, TrainingSession, TrainingInterval, CompletedWorkout, StravaActivity } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { planStats } from "@/lib/periodization";
import { SessionCard } from "@/components/SessionCard";
import { ZoneTable } from "@/components/ZoneTable";
import { TodayHero } from "@/components/TodayHero";
import {
  LazyFitnessChart as FitnessChart,
  LazyAdaptationPanel as AdaptationPanel,
  LazyFTPProgress as FTPProgress,
  LazyTrainingCalendar as TrainingCalendar,
  LazyWeeklyDigest as WeeklyDigest,
  LazyWorkoutCompletion as WorkoutCompletion,
} from "@/components/LazyComponents";
import type { CompletionData } from "@/components/WorkoutCompletion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ProgressRing } from "@/components/ProgressRing";
import { DashboardSkeleton } from "@/components/Skeleton";
import { BLOCK_META, WEEK_LABELS } from "@/lib/constants";

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
};

// Default empty plan structure
const emptyPlan = { blocks: [] as TrainingBlock[] };

export default function Dashboard() {
  const [ftp, setFtp] = useState(190);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<{ blocks: TrainingBlock[] }>(emptyPlan);
  const [programStartDate, setProgramStartDate] = useState<string | undefined>();
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [stravaData, setStravaData] = useState<any[]>([]);

  const [activeBlock, setActiveBlock] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);

  // Load rider profile + plan + workout data from DB
  const loadDashboardData = useCallback(async () => {
    // Force fresh fetches by disabling cache (for plan regeneration scenarios)
    const cacheKey = `?t=${Date.now()}`;
    const [riderData, planData, workoutResponse, stravaResponse] = await Promise.all([
      fetch("/api/rider" + cacheKey, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/plan" + cacheKey, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/workouts" + cacheKey, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/strava/activities" + cacheKey, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);
    
    return { riderData, planData, workoutResponse, stravaResponse };
  }, []);

  useEffect(() => {
    loadDashboardData().then(({ riderData, planData, workoutResponse, stravaResponse }) => {
      if (riderData?.rider?.ftp) setFtp(riderData.rider.ftp);
      if (riderData?.rider?.programStartDate) setProgramStartDate(riderData.rider.programStartDate);

      if (planData?.plan && planData.source === "database") {
        // Transform DB plan to match PlanDef shape
        const dbPlan = {
          blocks: planData.plan.blocks.map((b: TrainingBlock) => ({
            blockNumber: b.blockNumber,
            type: b.type,
            weeks: b.weeks.map((w: TrainingWeek) => ({
              weekNumber: w.weekNumber,
              weekType: w.weekType,
              sessions: w.sessions.map((s: TrainingSession) => ({
                dayOfWeek: s.dayOfWeek,
                sessionType: s.sessionType,
                duration: s.duration,
                title: s.title,
                description: s.description,
                intervals: s.intervals.map((i: TrainingInterval) => ({
                  name: i.name,
                  durationSecs: i.durationSecs,
                  powerLow: i.powerLow,
                  powerHigh: i.powerHigh,
                  cadenceLow: i.cadenceLow,
                  cadenceHigh: i.cadenceHigh,
                  rpe: i.rpe,
                  zone: i.zone,
                  purpose: i.purpose,
                  coachNote: i.coachNote,
                })),
                route: s.route || undefined,
              })),
            })),
          })),
        };
        setPlan(dbPlan);
      }

      // Load workout data for WeeklyDigest
      if (workoutResponse?.workouts) {
        setWorkoutData(workoutResponse.workouts);
      }

      // Load Strava data for WeeklyDigest
      if (stravaResponse?.activities) {
        setStravaData(stravaResponse.activities);
      }

      setLoading(false);
    });
  }, [loadDashboardData]);

  // Refetch data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page came back into focus - refetch plan and data
        loadDashboardData().then(({ riderData, planData, workoutResponse, stravaResponse }) => {
          if (riderData?.rider?.ftp) setFtp(riderData.rider.ftp);
          if (riderData?.rider?.programStartDate) setProgramStartDate(riderData.rider.programStartDate);

          if (planData?.plan) {
            const dbPlan = {
              blocks: planData.plan.blocks.map((b: TrainingBlock) => ({
                blockNumber: b.blockNumber,
                type: b.type,
                weeks: b.weeks.map((w: TrainingWeek) => ({
                  weekNumber: w.weekNumber,
                  weekType: w.weekType,
                  sessions: w.sessions.map((s: TrainingSession) => ({
                    dayOfWeek: s.dayOfWeek,
                    sessionType: s.sessionType,
                    duration: s.duration,
                    title: s.title,
                    description: s.description,
                    intervals: s.intervals.map((i: TrainingInterval) => ({
                      name: i.name,
                      durationSecs: i.durationSecs,
                      powerLow: i.powerLow,
                      powerHigh: i.powerHigh,
                      cadenceLow: i.cadenceLow,
                      cadenceHigh: i.cadenceHigh,
                      rpe: i.rpe,
                      zone: i.zone,
                      purpose: i.purpose,
                      coachNote: i.coachNote,
                    })),
                    route: s.route || undefined,
                  })),
                })),
              })),
              totalWeeks: planData.plan.blocks.reduce((sum: number, b: any) => sum + b.weeks.length, 0),
            };
            setPlan(dbPlan);
          }

          if (workoutResponse?.workouts) {
            setWorkoutData(workoutResponse.workouts);
          }

          if (stravaResponse?.activities) {
            setStravaData(stravaResponse.activities);
          }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadDashboardData]);

  const stats = useMemo(() => planStats(plan), [plan]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);

  // Guard against empty plan
  const block = plan.blocks[activeBlock];
  const week = block?.weeks[activeWeek];
  const bt = block ? BLOCK_META[block.type] : undefined;
  
  // If no plan loaded yet, show loading
  if (plan.blocks.length === 0 && loading === false) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <div className="glass p-8 space-y-4">
          <p className="text-[var(--muted)]">No training plan found.</p>
          <p className="text-sm text-[var(--muted)]">Go to <Link href="/settings" className="text-[var(--accent)] hover:underline">Settings</Link> to create a training plan.</p>
        </div>
      </div>
    );
  }
  
  // If blocks exist but block/week are undefined, show loading
  if (!block || !week || !bt) {
    return <DashboardSkeleton />;
  }

  // Calculate real completion percentage
  const [weeklyProgress, setWeeklyProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  
  useEffect(() => {
    // Only run this if week is properly loaded
    if (!week || !week.sessions || week.sessions.length === 0) {
      return;
    }
    
    // Load this week's completion data
    fetch("/api/workouts")
      .then((res) => res.json())
      .then((data) => {
        if (data.workouts && week.sessions) {
          const thisWeek = data.workouts.filter((w: CompletedWorkout) => {
            // Only count program sessions for completion tracking
            if (!w.isProgramSession) return false;
            
            const workoutDate = new Date(w.createdAt);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of this week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // End of this week
            return workoutDate >= weekStart && workoutDate <= weekEnd;
          });
          
          const completed = thisWeek.filter((w: CompletedWorkout) => w.completed && w.isProgramSession).length;
          const total = week.sessions.length;
          setWeeklyProgress({ completed, total });
        }
      })
      .catch(() => {});
  }, [activeBlock, activeWeek, week]);

  const weekCompletionPct = weeklyProgress.total > 0 
    ? Math.round((weeklyProgress.completed / weeklyProgress.total) * 100) 
    : 0;

  if (loading) return <DashboardSkeleton />;

  const handleCompleteWorkout = async (data: CompletionData) => {
    const session = week.sessions[selectedSessionIdx];
    try {
      await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTitle: session.title,
          dayOfWeek: session.dayOfWeek,
          sessionType: session.sessionType,
          plannedDuration: session.duration,
          actualDuration: data.actualDuration,
          avgPower: data.actualPower,
          rpe: data.rpe,
          feelings: data.feelings,
          notes: data.notes,
          completed: data.completed,
          blockIdx: activeBlock,
          weekIdx: activeWeek,
          sessionIdx: selectedSessionIdx,
        }),
      });
    } catch (e) {
      console.error("Failed to log workout:", e);
    }
    setShowCompletion(false);
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      variants={stagger.container}
      initial="initial"
      animate="animate"
    >
      {/* Header with animated stats */}
      <motion.div variants={stagger.item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">
            <AnimatedCounter value={stats.sessions} className="font-semibold text-[var(--foreground)]" /> sessions ·{" "}
            <AnimatedCounter value={stats.intervals} className="font-semibold text-[var(--foreground)]" /> intervals
          </p>
        </div>
        {/* Week progress ring */}
        <div className="flex items-center gap-3">
          <ProgressRing progress={weekCompletionPct} size={48} strokeWidth={3}>
            <span className="text-xs font-bold">{weekCompletionPct}%</span>
          </ProgressRing>
          <div className="text-right">
            <p className="text-sm font-semibold">Week {week.weekNumber}</p>
            <p className="text-xs text-[var(--muted)]">{WEEK_LABELS[week.weekType]}</p>
          </div>
        </div>
      </motion.div>

      {/* Today's Workout Hero — full width */}
      <motion.div variants={stagger.item}>
        <TodayHero 
          plan={plan} 
          blockIdx={activeBlock} 
          weekIdx={activeWeek} 
          programStartDate={programStartDate}
          stravaActivities={stravaData || []}
          completedWorkouts={workoutData}
        />
      </motion.div>

      {/* Bento Grid — Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weekly Digest — spans 2 cols on large */}
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <WeeklyDigest 
            programStartDate={programStartDate}
            workoutData={workoutData}
            stravaData={stravaData}
          />
        </motion.div>

        {/* FTP Quick Card */}
        <motion.div variants={stagger.item}>
          <div className="glass p-6 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Functional Threshold Power</p>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={ftp} className="text-4xl font-bold gradient-text" />
                <span className="text-lg text-[var(--muted)]">W</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div>
                <AnimatedCounter value={parseFloat((ftp / 75).toFixed(2))} decimals={2} className="text-lg font-bold text-[var(--foreground)]" />
                <p className="text-[10px] text-[var(--muted)]">W/kg</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">+3W</p>
                <p className="text-[10px] text-[var(--muted)]">This month</p>
              </div>
            </div>
            <input
              type="range"
              min={100}
              max={400}
              value={ftp}
              onChange={(e) => setFtp(parseInt(e.target.value))}
              className="mt-4 w-full accent-[var(--accent)]"
            />
          </div>
        </motion.div>
      </div>

      {/* Bento Grid — Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={stagger.item}>
          <FTPProgress currentFtp={ftp} />
        </motion.div>
        <motion.div variants={stagger.item}>
          <TrainingCalendar />
        </motion.div>
      </div>

      {/* Zones */}
      <motion.div variants={stagger.item}>
        <ZoneTable ftp={ftp} />
      </motion.div>

      {/* Fitness Chart */}
      <motion.div variants={stagger.item}>
        <FitnessChart />
      </motion.div>

      {/* Adaptive Engine */}
      <motion.div variants={stagger.item}>
        <AdaptationPanel />
      </motion.div>

      {/* Block Selector — pill style */}
      <motion.div variants={stagger.item}>
        <h2 className="text-lg font-semibold mb-3">Training Blocks</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
          {plan.blocks.map((b, i) => {
            const bti = BLOCK_META[b.type];
            const isActive = activeBlock === i;
            return (
              <button
                key={i}
                onClick={() => { setActiveBlock(i); setActiveWeek(0); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? "text-white font-medium shadow-lg border-transparent"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)] bg-transparent"
                }`}
                style={isActive ? { background: bti.gradient, boxShadow: `0 4px 15px ${bti.color}33` } : {}}
              >
                <span>{bti.emoji}</span>
                <span className="hidden sm:inline">Block {b.blockNumber}: </span>
                <span>{bti.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Week Selector */}
      <motion.div variants={stagger.item}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <h2 className="text-base md:text-lg font-semibold">
            <span style={{ backgroundImage: bt.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {bt.emoji} {bt.label}
            </span>
            <span className="text-[var(--foreground)]"> — Week {week.weekNumber}</span>
          </h2>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {block.weeks.map((w, i) => (
              <button
                key={i}
                onClick={() => setActiveWeek(i)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 ${
                  activeWeek === i
                    ? "text-white font-medium shadow-md"
                    : "bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                style={activeWeek === i ? { background: bt.gradient } : {}}
              >
                W{w.weekNumber}: {WEEK_LABELS[w.weekType]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {week.sessions.map((session, i) => (
          <div key={i} className="relative">
            <SessionCard
              session={session}
              blockIdx={activeBlock}
              weekIdx={activeWeek}
              sessionIdx={i}
              completedWorkouts={workoutData}
              stravaActivities={stravaData}
            />
            <button
              onClick={(e) => { e.preventDefault(); setSelectedSessionIdx(i); setShowCompletion(true); }}
              className="absolute top-2 right-14 w-8 h-8 rounded-full bg-[var(--accent)] text-white text-sm flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/30 z-10 hover:scale-110"
              title="Log workout"
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <WorkoutCompletion
          session={week.sessions[selectedSessionIdx]}
          ftp={ftp}
          onComplete={handleCompleteWorkout}
          onDismiss={() => setShowCompletion(false)}
        />
      )}
    </motion.div>
  );
}
