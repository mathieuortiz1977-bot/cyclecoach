"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRider } from "@/hooks/useRider";
import { IntervalChart } from "@/components/IntervalChart";
import { getZoneColor } from "@/lib/zones";
import Link from "next/link";
import { WorkoutCompletion } from "@/components/WorkoutCompletion";
import { AICoachPanel } from "@/components/AICoachPanel";
import { IntervalTimer } from "@/components/IntervalTimer";
import { ExportButtons } from "@/components/ExportButtons";
import { RouteMap } from "@/components/RouteMap";
import { ShareCard } from "@/components/ShareCard";
import { DAY_LABELS } from "@/lib/constants";

export default function WorkoutPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blockIdx, weekIdx, sessionIdx] = (id || "0-0-0").split("-").map(Number);
  const [ftp, setFtp] = useState(190);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { rider } = useRider();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load FTP from DB (useRider already provides this)
  useEffect(() => {
    if (rider?.ftp) setFtp(rider.ftp);
  }, [rider?.ftp]);

  // Load PERSISTED plan from database (not regenerated!)
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const response = await fetch("/api/plan", { cache: "no-store" });
        const data = await response.json();
        
        if (data.plan) {
          // Use persisted plan from DB
          const dbPlan = {
            blocks: data.plan.blocks.map((b: any) => ({
              blockNumber: b.blockNumber,
              type: b.type,
              weeks: b.weeks.map((w: any) => ({
                weekNumber: w.weekNumber,
                weekType: w.weekType,
                sessions: w.sessions.map((s: any) => ({
                  dayOfWeek: s.dayOfWeek,
                  sessionType: s.sessionType,
                  duration: s.duration,
                  title: s.title,
                  description: s.description,
                  purpose: s.purpose,
                  intervals: s.intervals.map((i: any) => ({
                    name: i.name,
                    durationSecs: i.durationSecs,
                    powerLow: i.powerLow,
                    powerHigh: i.powerHigh,
                    zone: i.zone,
                    rpe: i.rpe,
                    purpose: i.purpose,
                    coachNote: i.coachNote,
                  })),
                })),
              })),
            })),
          };
          setPlan(dbPlan);
        }
      } catch (error) {
        console.error("Failed to load plan:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []); // Load once on mount (not on trainingDays/outdoorDay change)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-[var(--muted)]">Loading workout...</p>
      </div>
    );
  }

  const block = plan?.blocks[blockIdx];
  const week = block?.weeks[weekIdx];
  const session = week?.sessions[sessionIdx];

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-[var(--muted)]">Workout not found.</p>
        <Link href="/dashboard" className="text-[var(--accent)] hover:underline">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <span>/</span>
        <span>Block {block.blockNumber} ({block.type})</span>
        <span>/</span>
        <span>Week {week.weekNumber}</span>
        <span>/</span>
        <span className="text-white">{DAY_LABELS[session.dayOfWeek]}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{session.sessionType === "OUTDOOR" ? "🌄" : "🏠"}</span>
          <h1 className="text-2xl font-bold">{session.title}</h1>
        </div>
        <p className="text-[var(--muted)]">{session.description}</p>
        <div className="flex gap-4 mt-2 text-sm text-[var(--muted)]">
          <span>⏱ {Math.round((session.intervals || []).reduce((sum: number, i: any) => sum + i.durationSecs, 0) / 60)} min</span>
          <span>{session.intervals.length} intervals</span>
          {session.route && (
            <>
              <span>📏 {session.route.distance}km</span>
              <span>⛰ {session.route.elevation}m</span>
            </>
          )}
        </div>
      </div>

      {/* FTP Quick Adjust */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--muted)]">FTP:</span>
        <input
          type="number"
          value={ftp}
          onChange={(e) => setFtp(Math.max(50, parseInt(e.target.value) || 50))}
          className="bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-1 w-20 text-center font-mono text-[var(--accent)] focus:outline-none focus:border-[var(--accent)]"
        />
        <span className="text-[var(--muted)]">W</span>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--muted)]">Export:</span>
        <ExportButtons session={session} ftp={ftp} />
      </div>

      {/* Interval Timer */}
      {session.sessionType === "INDOOR" && (
        <IntervalTimer intervals={session.intervals} ftp={ftp} />
      )}

      {/* Interval Chart */}
      <IntervalChart intervals={session.intervals} ftp={ftp} />

      {/* Route Map + Info (Saturday only) */}
      {session.route && (
        <div className="space-y-4">
          <RouteMap route={session.route} />
          <div className="glass p-4">
            <p className="text-sm text-[var(--muted)] italic">{session.route.description}</p>
          </div>
        </div>
      )}

      {/* Interval Detail List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Interval Breakdown</h2>
        {session.intervals.map((interval: any, idx: number) => {
          const color = getZoneColor(interval.zone);
          const wattsLow = Math.round(ftp * interval.powerLow / 100);
          const wattsHigh = Math.round(ftp * interval.powerHigh / 100);
          const mins = Math.floor(interval.durationSecs / 60);
          const secs = interval.durationSecs % 60;

          return (
            <div
              key={idx}
              className="glass p-4"
              style={{ borderLeftWidth: 4, borderLeftColor: color }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: color }}
                  >
                    {interval.zone}
                  </span>
                  <h3 className="font-semibold text-sm">{interval.name}</h3>
                </div>
                <span className="text-sm font-mono text-[var(--muted)]">
                  {mins}:{secs.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Targets */}
              {interval.powerHigh > 0 && (
                <div className="flex gap-4 text-xs text-[var(--muted)] mb-2">
                  <span>
                    ⚡ <span className="font-mono text-white">{wattsLow}–{wattsHigh}W</span>
                    {" "}({interval.powerLow}–{interval.powerHigh}%)
                  </span>
                  {interval.cadenceLow && (
                    <span>🔄 {interval.cadenceLow}–{interval.cadenceHigh} RPM</span>
                  )}
                  {interval.rpe && <span>💪 RPE {interval.rpe}/10</span>}
                </div>
              )}

              {/* Purpose */}
              <p className="text-xs text-[var(--muted)] mb-2">
                <span className="text-[var(--accent)]">🎯 Purpose:</span> {interval.purpose}
              </p>

              {/* Coach Note */}
              <div className="bg-[var(--background)] rounded-md px-3 py-2 text-sm italic text-[var(--foreground)]">
                💬 {interval.coachNote}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Coach */}
      <AICoachPanel
        session={session}
        blockType={block.type as "BASE" | "THRESHOLD" | "VO2MAX" | "RACE_SIM"}
        weekType={week.weekType as "BUILD" | "BUILD_PLUS" | "OVERREACH" | "RECOVERY"}
        ftp={ftp}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowCompletion(true)}
          className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          ✅ Log Workout
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="px-6 py-3 rounded-xl glass text-[var(--foreground)] font-medium hover:bg-[var(--card-border)] transition-colors"
        >
          📤 Share
        </button>
      </div>
      {showCompletion && (
        <WorkoutCompletion
          session={session}
          ftp={ftp}
          onComplete={(data) => { console.log("Logged:", data); setShowCompletion(false); }}
          onDismiss={() => setShowCompletion(false)}
        />
      )}

      {showShare && (
        <ShareCard session={session} ftp={ftp} onClose={() => setShowShare(false)} />
      )}

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-block text-sm text-[var(--accent)] hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
