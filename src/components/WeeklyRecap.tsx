"use client";
import { useState } from "react";
import type { WorkoutScore, AdaptationDecision } from "@/lib/adaptation";

interface Props {
  scores: WorkoutScore[];
  adaptation: AdaptationDecision | null;
  blockType: string;
  weekType: string;
  ftp: number;
}

export function WeeklyRecap({ scores, adaptation, blockType, weekType, ftp }: Props) {
  const [recap, setRecap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecap = async () => {
    if (!adaptation) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/weekly-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores,
          adaptation,
          blockType,
          weekType,
          ftp,
          personality: "MIXED",
        }),
      });
      const data = await res.json();
      setRecap(data.text);
    } catch {
      const avgCompliance = scores.reduce((s, w) => s + w.compliance, 0) / scores.length;
      setRecap(`Week done. Average compliance: ${avgCompliance.toFixed(0)}%. Adaptation: ${adaptation.action}. ${adaptation.reason}`);
    }

    setLoading(false);
  };

  if (scores.length === 0) return null;

  const avgCompliance = scores.reduce((s, w) => s + w.compliance, 0) / scores.length;
  const completed = scores.filter((s) => s.overallRating !== "missed").length;

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">📝 Weekly Recap</h2>
          <p className="text-xs text-[var(--muted)]">
            {completed}/{scores.length} sessions | avg {avgCompliance.toFixed(0)}% compliance
          </p>
        </div>
        <button
          onClick={generateRecap}
          disabled={loading || !adaptation}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading ? "Writing..." : recap ? "🔄 Regenerate" : "✨ Generate Recap"}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {scores.map((score, i) => {
          const colors: Record<string, string> = {
            crushed_it: "#22c55e", on_target: "#3b82f6",
            struggled: "#eab308", underperformed: "#f97316", missed: "#ef4444",
          };
          const emojis: Record<string, string> = {
            crushed_it: "🔥", on_target: "✅", struggled: "😤",
            underperformed: "📉", missed: "❌",
          };
          return (
            <div key={i} className="bg-[var(--background)] rounded-lg p-2 text-center">
              <span className="text-lg">{emojis[score.overallRating]}</span>
              <p className="text-sm font-bold" style={{ color: colors[score.overallRating] }}>
                {score.compliance}%
              </p>
              <p className="text-[10px] text-[var(--muted)]">{score.fatigueSignal}</p>
            </div>
          );
        })}
      </div>

      {/* AI Recap */}
      {recap && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg p-4">
          <p className="text-xs font-semibold text-[var(--accent)] mb-2">🤖 Coach&apos;s Weekly Debrief</p>
          <p className="text-sm leading-relaxed whitespace-pre-line">{recap}</p>
        </div>
      )}
    </div>
  );
}
