"use client";
import { useState, useMemo, useEffect } from "react";
import { exportToZWO, downloadFile } from "@/lib/export";
import { BLOCK_META, WEEK_LABELS } from "@/lib/constants";
import { useRider } from "@/hooks/useRider";
import type { PlanDef } from "@/lib/periodization";
import { DashboardSkeleton } from "@/components/Skeleton";

const emptyPlan = { blocks: [] as any[] };

export default function ZwiftSync() {
  const { rider } = useRider();
  const ftp = rider?.ftp || 190;
  
  const [plan, setPlan] = useState<PlanDef>(emptyPlan);
  const [loading, setLoading] = useState(true);

  // Fetch plan from API instead of generating client-side
  useEffect(() => {
    fetch("/api/plan?t=" + Date.now(), { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data?.plan) {
          setPlan(data.plan);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  const [activeBlock, setActiveBlock] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [coachNotesStyle, setCoachNotesStyle] = useState<"MOTIVATIONAL" | "TOUGH_LOVE" | "DARK_HUMOR" | "MIXED" | "TECHNICAL">("MOTIVATIONAL");

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (plan.blocks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-[var(--muted)]">No training plan found. Go to Settings to create one.</p>
      </div>
    );
  }

  const block = plan.blocks[activeBlock];
  const week = block.weeks[activeWeek];
  const bt = BLOCK_META[block.type];

  // Only indoor sessions can go to Zwift
  const zwiftSessions = week.sessions.filter(
    (s) => s.sessionType === "INDOOR"
  );

  const handleDownload = (session: typeof zwiftSessions[0], idx: number) => {
    const zwo = exportToZWO(session, ftp, coachNotesStyle);
    const filename = `CycleCoach_B${activeBlock + 1}W${activeWeek + 1}_${session.dayOfWeek}_${session.title.replace(/[^a-zA-Z0-9]/g, "_")}.zwo`;
    downloadFile(zwo, filename, "application/xml");
    setDownloaded((prev) => new Set([...prev, `${activeBlock}-${activeWeek}-${idx}`]));
  };

  const handleDownloadAll = () => {
    // Show confirmation of selected coaching notes style
    const styleNames: Record<string, string> = {
      MOTIVATIONAL: "🔥 Motivational",
      TOUGH_LOVE: "💪 Tough Love",
      DARK_HUMOR: "💀 Dark Humor",
      TECHNICAL: "🔬 Technical",
      MIXED: "🎲 Mixed"
    };
    
    const confirmed = window.confirm(
      `Download ${zwiftSessions.length} workouts with ${styleNames[coachNotesStyle]} coaching notes?\n\nWorkouts will be saved to your Downloads folder.`
    );
    
    if (confirmed) {
      zwiftSessions.forEach((session, idx) => {
        setTimeout(() => {
          handleDownload(session, idx);
        }, idx * 300); // stagger downloads
      });
    }
  };

  const handleDownloadWeekZip = async () => {
    // Download all as individual files (ZIP would need a library)
    handleDownloadAll();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="glass p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏠</span>
          <div>
            <h1 className="text-xl font-bold gradient-text">Zwift Workout Sync</h1>
            <p className="text-sm text-[var(--muted)]">
              Download structured workouts for Zwift indoor training
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass p-5 space-y-3">
        <h2 className="font-semibold text-sm flex items-center gap-2">📋 How it works</h2>
        <ol className="text-sm text-[var(--muted)] space-y-2 list-decimal list-inside">
          <li>Download <code className="text-[var(--accent)]">.zwo</code> files for your upcoming workouts below</li>
          <li>
            Move them to your Zwift custom workouts folder:
            <div className="mt-1 bg-[var(--background)] rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span>🍎 macOS:</span>
                <code>Documents/Zwift/Workouts/&lt;YourZwiftID&gt;/</code>
              </div>
              <div className="flex items-center gap-2">
                <span>🪟 Windows:</span>
                <code>Documents\Zwift\Workouts\&lt;YourZwiftID&gt;\</code>
              </div>
            </div>
          </li>
          <li>Open Zwift → Training → Custom Workouts → your workout appears!</li>
          <li>After riding, Zwift auto-syncs to Strava → CycleCoach auto-completes the session ✨</li>
        </ol>
        <p className="text-xs text-[var(--muted)] italic">
          💡 Your Zwift ID is the number in your Zwift profile URL or the folder name in Documents/Zwift/Workouts/
        </p>
      </div>

      {/* Block/Week Selector */}
      <div className="glass p-5 space-y-4">
        <h2 className="font-semibold text-sm">📅 Select Training Week</h2>

        {/* Block tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.blocks.map((b, i) => {
            const meta = BLOCK_META[b.type];
            return (
              <button
                key={i}
                onClick={() => { setActiveBlock(i); setActiveWeek(0); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  i === activeBlock
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {meta.emoji} Block {i + 1}: {meta.label}
              </button>
            );
          })}
        </div>

        {/* Week tabs */}
        <div className="flex gap-2">
          {block.weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => setActiveWeek(i)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                i === activeWeek
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {WEEK_LABELS[w.weekType] || w.weekType}
            </button>
          ))}
        </div>
      </div>

      {/* Coaching Notes Style Selection */}
      <div className="glass p-5 space-y-4">
        <h2 className="font-semibold text-sm">🎯 Coaching Notes Style</h2>
        <p className="text-xs text-[var(--muted)]">Choose the tone of coaching messages in your Zwift workouts:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { value: "MOTIVATIONAL", emoji: "🔥", label: "Motivational" },
            { value: "TOUGH_LOVE", emoji: "💪", label: "Tough Love" },
            { value: "DARK_HUMOR", emoji: "💀", label: "Dark Humor" },
            { value: "TECHNICAL", emoji: "🔬", label: "Technical" },
            { value: "MIXED", emoji: "🎲", label: "Mixed" },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => setCoachNotesStyle(style.value as any)}
              className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
                coachNotesStyle === style.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="block text-lg mb-1">{style.emoji}</span>
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workout List */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            🚴 Indoor Workouts — {bt.emoji} {bt.label} / {WEEK_LABELS[week.weekType]}
          </h2>
          {zwiftSessions.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-colors"
            >
              📥 Download All ({zwiftSessions.length})
            </button>
          )}
        </div>

        {zwiftSessions.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            No indoor sessions this week — it&apos;s all outdoor riding! 🌄
          </p>
        ) : (
          <div className="space-y-3">
            {zwiftSessions.map((session, idx) => {
              const key = `${activeBlock}-${activeWeek}-${idx}`;
              const isDownloaded = downloaded.has(key);

              return (
                <div
                  key={idx}
                  className="border border-[var(--card-border)] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[var(--accent)]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                        {session.dayOfWeek}
                      </span>
                      <h3 className="font-semibold text-sm truncate">{session.title}</h3>
                    </div>
                    
                    {session.purpose && (
                      <div className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                        <span className="text-sm flex-shrink-0">📌</span>
                        <p className="text-xs font-medium text-[var(--accent)] leading-snug">
                          <span className="text-[var(--accent)] font-semibold">Purpose:</span> {session.purpose}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mb-2">{session.description}</p>
                    
                    <div className="flex gap-3 text-xs text-[var(--muted)] flex-wrap">
                      <span>⏱ {session.duration} min</span>
                      <span>⚡ {session.intervals.length} intervals</span>
                      {session.intervals.some((i) => i.powerHigh > 100) && (
                        <span className="text-[var(--accent)]">
                          🔥 Up to {Math.max(...session.intervals.map((i) => i.powerHigh))}% FTP
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(session, idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isDownloaded
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-[var(--accent)] text-white hover:opacity-90"
                    }`}
                  >
                    {isDownloaded ? "✅ Downloaded" : "📥 .zwo"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FTP Display */}
      <div className="glass p-4 text-center">
        <p className="text-xs text-[var(--muted)]">
          Workouts generated for FTP: <span className="font-bold text-[var(--accent)]">{ftp}W</span>
          {" "}— Zwift will use ERG mode to hit the target watts
        </p>
      </div>
    </div>
  );
}
