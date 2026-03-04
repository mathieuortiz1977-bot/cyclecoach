"use client";
import { useState } from "react";
import type { WorkoutScore, AdaptationDecision } from "@/lib/adaptation";

// Sample scores to demonstrate the adaptive engine
const sampleScores: WorkoutScore[] = [
  {
    compliance: 94, powerAccuracy: 96, durationAccuracy: 92,
    overallRating: "on_target", hrDrift: 3.2, powerFade: 2.1,
    fatigueSignal: "normal",
    coachFeedback: "94% compliance. Solid session. Not perfect, but perfect isn't the goal — consistent is.",
  },
  {
    compliance: 98, powerAccuracy: 99, durationAccuracy: 97,
    overallRating: "crushed_it", hrDrift: 1.8, powerFade: 1.2,
    fatigueSignal: "fresh",
    coachFeedback: "98% compliance. You nailed it. Every interval, every watt. This is what consistency looks like.",
  },
  {
    compliance: 72, powerAccuracy: 68, durationAccuracy: 78,
    overallRating: "struggled", hrDrift: 8.5, powerFade: 6.3,
    fatigueSignal: "fatigued",
    coachFeedback: "72% — below target. HR drift of 8.5% suggests cardiac fatigue. We'll dial it back.",
  },
];

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
  const [scores] = useState<WorkoutScore[]>(sampleScores);
  const [adaptation, setAdaptation] = useState<AdaptationDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const getAdaptation = async () => {
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

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">🧠 Adaptive Engine</h2>
          <p className="text-xs text-[var(--muted)]">How the plan adjusts based on your performance</p>
        </div>
        <button
          onClick={getAdaptation}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Week"}
        </button>
      </div>

      {/* Recent Workout Scores */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--muted)]">This Week&apos;s Sessions</h3>
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
              <p>⚡ {score.powerAccuracy}%</p>
              <p>⏱ {score.durationAccuracy}%</p>
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
