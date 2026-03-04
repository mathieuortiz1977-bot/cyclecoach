"use client";
import { useState, useMemo } from "react";
import { generatePlan, planStats } from "@/lib/periodization";
import { SessionCard } from "@/components/SessionCard";
import { ZoneTable } from "@/components/ZoneTable";
import { FitnessChart } from "@/components/FitnessChart";
import { AdaptationPanel } from "@/components/AdaptationPanel";

const blockTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  BASE: { label: "Base / Aerobic", emoji: "🏗️", color: "#3b82f6" },
  THRESHOLD: { label: "Threshold / FTP", emoji: "⚡", color: "#eab308" },
  VO2MAX: { label: "VO2max / Punch", emoji: "🔥", color: "#f97316" },
  RACE_SIM: { label: "Race Simulation", emoji: "🏁", color: "#ef4444" },
};

const weekTypeLabels: Record<string, string> = {
  BUILD: "Build", BUILD_PLUS: "Build+", OVERREACH: "Overreach", RECOVERY: "Recovery 🧘",
};

export default function Dashboard() {
  const [ftp, setFtp] = useState(190);
  const plan = useMemo(() => generatePlan(4), []);
  const stats = planStats(plan);

  // Show first block, first week by default
  const [activeBlock, setActiveBlock] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);

  const block = plan.blocks[activeBlock];
  const week = block.weeks[activeWeek];
  const bt = blockTypeLabels[block.type];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-[var(--muted)]">
          {stats.blocks} blocks · {stats.sessions} sessions · {stats.intervals} intervals · All with coach commentary
        </p>
      </div>

      {/* FTP & Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Your FTP</h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="number"
              value={ftp}
              onChange={(e) => setFtp(Math.max(50, parseInt(e.target.value) || 50))}
              className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 w-32 text-2xl font-bold text-center text-[var(--accent)] focus:outline-none focus:border-[var(--accent)]"
            />
            <span className="text-[var(--muted)] text-lg">watts</span>
          </div>
          <p className="text-sm text-[var(--muted)]">All workout targets are calculated as % of your FTP. Update this and every interval adjusts automatically.</p>
        </div>
        <ZoneTable ftp={ftp} />
      </div>

      {/* Fitness Chart (PMC) */}
      <FitnessChart />

      {/* Adaptive Engine */}
      <AdaptationPanel />

      {/* Block Selector */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Training Blocks</h2>
        <div className="flex gap-2 mb-4">
          {plan.blocks.map((b, i) => {
            const bt = blockTypeLabels[b.type];
            return (
              <button
                key={i}
                onClick={() => { setActiveBlock(i); setActiveWeek(0); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border ${
                  activeBlock === i
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                <span>{bt.emoji}</span>
                <span>Block {b.blockNumber}: {bt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Selector */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            <span style={{ color: bt.color }}>{bt.emoji} {bt.label}</span> — Week {week.weekNumber}
          </h2>
          <div className="flex gap-1">
            {block.weeks.map((w, i) => (
              <button
                key={i}
                onClick={() => setActiveWeek(i)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeWeek === i
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card-border)] text-[var(--muted)] hover:text-white"
                }`}
              >
                W{w.weekNumber}: {weekTypeLabels[w.weekType]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {week.sessions.map((session, i) => (
          <SessionCard
            key={i}
            session={session}
            blockIdx={activeBlock}
            weekIdx={activeWeek}
            sessionIdx={i}
          />
        ))}
      </div>
    </div>
  );
}
