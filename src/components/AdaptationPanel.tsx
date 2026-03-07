"use client";
import { useState, useEffect } from "react";
import type { WorkoutScore, AdaptationDecision } from "@/lib/adaptation";

const ratingColors: Record<string, string> = {
  crushed_it: "#22c55e",
  on_target: "#3b82f6", 
  struggled: "#eab308",
  underperformed: "#f97316",
  missed: "#ef4444",
};

const ratingEmoji: Record<string, string> = {
  crushed_it: "🔥",
  on_target: "✅",
  struggled: "😤", 
  underperformed: "📉",
  missed: "❌",
};

const fatigueColors: Record<string, string> = {
  fresh: "#22c55e",
  normal: "#3b82f6",
  fatigued: "#eab308", 
  overreached: "#ef4444",
};

export function AdaptationPanel() {
  const [scores, setScores] = useState<WorkoutScore[]>([]);
  const [adaptation, setAdaptation] = useState<AdaptationDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingScores, setLoadingScores] = useState(true);

  useEffect(() => {
    // Load real workout scores from completed sessions
    fetch("/api/workouts")
      .then((res) => res.json())
      .then((data) => {
        if (data.workouts) {
          // Convert completed workouts to scores for analysis
          const recentWorkouts = data.workouts
            .filter((w: any) => w.completed && w.rpe && w.compliance != null)
            .slice(0, 5) // Last 5 completed workouts
            .map((w: any) => ({
              compliance: w.compliance || 0,
              powerAccuracy: w.avgPower ? Math.min(100, (w.avgPower / (w.targetPower || w.avgPower)) * 100) : 0,
              durationAccuracy: w.actualDuration ? Math.min(100, (w.actualDuration / w.plannedDuration) * 100) : 100,
              overallRating: getRatingFromRPE(w.rpe),
              hrDrift: w.hrDrift || 0,
              powerFade: w.powerFade || 0,
              fatigueSignal: getFatigueFromRPE(w.rpe),
              coachFeedback: generateFeedback(w.compliance, w.rpe, w.feelings),
            }));
          setScores(recentWorkouts);
        }
        setLoadingScores(false);
      })
      .catch(() => setLoadingScores(false));
  }, []);

  const getAdaptation = async () => {
    if (scores.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/adapt/decide", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, currentFtp: 190, weekType: "BUILD" }),
      });
      const data = await res.json();
      setAdaptation(data);
    } catch {
      // Fallback: generate client-side
      const { generateAdaptation } = await import("@/lib/adaptation");
      setAdaptation(generateAdaptation(scores, 190, "BUILD"));
    }
    setLoading(false);
  };

  if (loadingScores) {
    return (
      <div className="glass p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl mb-2 block">🧠</span>
          <h2 className="text-lg font-semibold mb-2">Adaptive Engine</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Complete workouts with RPE and compliance data to enable adaptive analysis
          </p>
        </div>
        
        <div className="bg-[var(--background)]/50 rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-3">
            The adaptive engine analyzes your workout performance to suggest plan adjustments:
          </p>
          <div className="text-xs text-[var(--muted)] space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span>📈</span> Increase intensity when you're crushing workouts
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>📉</span> Reduce load when fatigue builds up
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🧘</span> Add recovery when overreached
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">🧠 Adaptive Engine</h2>
          <p className="text-xs text-[var(--muted)]">Analysis based on your {scores.length} recent sessions</p>
        </div>
        <button
          onClick={getAdaptation}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Performance"}
        </button>
      </div>

      {/* Recent Workout Scores */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--muted)]">Recent Sessions</h3>
        {scores.map((score, i) => (
          <div key={i} className="bg-[var(--background)] rounded-lg p-3 flex items-center gap-4">
            <div className="text-2xl">{ratingEmoji[score.overallRating]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm" style={{ color: ratingColors[score.overallRating] }}>
                  {score.compliance}% compliance
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: fatigueColors[score.fatigueSignal] + "20", color: fatigueColors[score.fatigueSignal] }}
                >
                  {score.fatigueSignal}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] italic">{score.coachFeedback}</p>
            </div>
            <div className="text-right text-xs text-[var(--muted)]">
              <p>⚡ {Math.round(score.powerAccuracy)}%</p>
              <p>⏱ {Math.round(score.durationAccuracy)}%</p>
              <p>❤️ drift {score.hrDrift}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Adaptation Decision */}
      {adaptation && (
        <div className="border border-[var(--accent)] rounded-lg p-4 bg-[var(--accent)]/5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {adaptation.action === "increase" ? "📈" :
               adaptation.action === "decrease" ? "📉" :
               adaptation.action === "recovery" ? "🧘" :
               adaptation.action === "retest" ? "🧪" : "➡️"}
            </span>
            <h3 className="font-semibold">
              Decision: <span className="text-[var(--accent)] uppercase">{adaptation.action}</span>
              {adaptation.adjustmentPct !== 0 && (
                <span className="text-sm ml-2">
                  ({adaptation.adjustmentPct > 0 ? "+" : ""}{adaptation.adjustmentPct}%)
                </span>
              )}
            </h3>
          </div>
          <p className="text-sm">{adaptation.reason}</p>

          {adaptation.nextSessionMods.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted)] mb-1">Next Session Modifications:</p>
              <ul className="space-y-1">
                {adaptation.nextSessionMods.map((mod, i) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <span className="text-[var(--accent)]">→</span>
                    {mod.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {adaptation.ftpSuggestion && (
            <div className="bg-[var(--background)] rounded-lg p-3">
              <p className="text-sm font-semibold text-[var(--accent)]">
                💡 FTP Update Suggested: {adaptation.ftpSuggestion.newFtp}W
              </p>
              <p className="text-xs text-[var(--muted)]">{adaptation.ftpSuggestion.reason}</p>
              <p className="text-xs text-[var(--muted)]">Confidence: {adaptation.ftpSuggestion.confidence}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions for converting workout data to scores
function getRatingFromRPE(rpe: number): string {
  if (rpe <= 6) return "crushed_it";
  if (rpe <= 7) return "on_target"; 
  if (rpe <= 8) return "struggled";
  return "underperformed";
}

function getFatigueFromRPE(rpe: number): string {
  if (rpe <= 6) return "fresh";
  if (rpe <= 7) return "normal";
  if (rpe <= 8) return "fatigued";
  return "overreached";
}

function generateFeedback(compliance: number, rpe: number, feelings: string[]): string {
  if (compliance >= 95 && rpe <= 7) {
    return `${compliance}% compliance at RPE ${rpe}. Excellent execution.`;
  }
  if (compliance >= 85) {
    return `${compliance}% compliance. Solid session with RPE ${rpe}.`;
  }
  return `${compliance}% compliance at RPE ${rpe}. ${feelings?.includes("tired") ? "Fatigue evident." : "Room for improvement."}`;
}