"use client";
import { useState, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { generatePlan, planStats } from "@/lib/periodization";
import { SessionCard } from "@/components/SessionCard";
import { ZoneTable } from "@/components/ZoneTable";
import { FitnessChart } from "@/components/FitnessChart";
import { AdaptationPanel } from "@/components/AdaptationPanel";
import { TodayHero } from "@/components/TodayHero";
import { FTPProgress } from "@/components/FTPProgress";
import { StreakCalendar } from "@/components/StreakCalendar";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { WorkoutCompletion, type CompletionData } from "@/components/WorkoutCompletion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ProgressRing } from "@/components/ProgressRing";
import { DashboardSkeleton } from "@/components/Skeleton";

const blockTypeLabels: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  BASE: { label: "Base / Aerobic", emoji: "🏗️", color: "#3b82f6", gradient: "var(--gradient-base)" },
  THRESHOLD: { label: "Threshold / FTP", emoji: "⚡", color: "#eab308", gradient: "var(--gradient-threshold)" },
  VO2MAX: { label: "VO2max / Punch", emoji: "🔥", color: "#f97316", gradient: "var(--gradient-vo2max)" },
  RACE_SIM: { label: "Race Simulation", emoji: "🏁", color: "#ef4444", gradient: "var(--gradient-racesim)" },
};

const weekTypeLabels: Record<string, string> = {
  BUILD: "Build", BUILD_PLUS: "Build+", OVERREACH: "Overreach", RECOVERY: "Recovery 🧘",
};

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
};

export default function Dashboard() {
  const [ftp, setFtp] = useState(190);
  const plan = useMemo(() => generatePlan(4), []);
  const stats = planStats(plan);

  const [activeBlock, setActiveBlock] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);

  const block = plan.blocks[activeBlock];
  const week = block.weeks[activeWeek];
  const bt = blockTypeLabels[block.type];

  // Sample completion for demo
  const weekCompletionPct = 60; // 3/5 sessions done

  const handleCompleteWorkout = (data: CompletionData) => {
    console.log("Workout logged:", data);
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
            <p className="text-xs text-[var(--muted)]">{weekTypeLabels[week.weekType]}</p>
          </div>
        </div>
      </motion.div>

      {/* Today's Workout Hero — full width */}
      <motion.div variants={stagger.item}>
        <TodayHero plan={plan} blockIdx={activeBlock} weekIdx={activeWeek} />
      </motion.div>

      {/* Bento Grid — Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weekly Digest — spans 2 cols on large */}
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <WeeklyDigest />
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
          <StreakCalendar />
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
            const bti = blockTypeLabels[b.type];
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
                W{w.weekNumber}: {weekTypeLabels[w.weekType]}
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
