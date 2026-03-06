"use client";
import { useState } from "react";
import type { SessionDef, BlockType, WeekType } from "@/lib/periodization";
import {
  buildIntervalPrompt,
  buildSaturdayBriefingPrompt,
  type CoachPersonality,
} from "@/lib/ai-coach";

interface Props {
  session: SessionDef;
  blockType: BlockType;
  weekType: WeekType;
  ftp: number;
  personality?: CoachPersonality;
}

export function AICoachPanel({ session, blockType, weekType, ftp, personality = "MIXED" }: Props) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const generateNote = async (intervalIdx: number) => {
    const interval = session.intervals[intervalIdx];
    if (!interval) return;

    setLoading((prev) => ({ ...prev, [intervalIdx]: true }));

    try {
      const prompt = buildIntervalPrompt(interval, session, blockType, weekType, ftp, personality);
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxTokens: 150 }),
      });
      const data = await res.json();
      setNotes((prev) => ({ ...prev, [intervalIdx]: data.text }));
    } catch {
      setNotes((prev) => ({ ...prev, [intervalIdx]: "Coach is unavailable. Using backup notes." }));
    }

    setLoading((prev) => ({ ...prev, [intervalIdx]: false }));
  };

  const generateAllNotes = async () => {
    for (let i = 0; i < session.intervals.length; i++) {
      await generateNote(i);
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const generateBriefing = async () => {
    if (session.sessionType !== "OUTDOOR" || !session.route) return;
    setBriefingLoading(true);

    try {
      const prompt = buildSaturdayBriefingPrompt(
        session.route.name,
        session.route.distance,
        session.route.elevation,
        weekType,
        blockType,
        ftp,
        personality
      );
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxTokens: 250 }),
      });
      const data = await res.json();
      setBriefing(data.text);
    } catch {
      setBriefing("Briefing unavailable. Ride safe, fuel well, and enjoy the mountains.");
    }

    setBriefingLoading(false);
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🤖 AI Coach
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
              Powered by Claude
            </span>
          </h2>
          <p className="text-xs text-[var(--muted)]">Dynamic, personalized coaching notes</p>
        </div>
        <div className="flex gap-2">
          {session.sessionType === "OUTDOOR" && session.route && (
            <button
              onClick={generateBriefing}
              disabled={briefingLoading}
              className="px-3 py-1.5 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {briefingLoading ? "Writing..." : "🗺️ Ride Briefing"}
            </button>
          )}
          <button
            onClick={generateAllNotes}
            className="px-3 py-1.5 rounded-lg text-xs bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            ✨ Generate All Notes
          </button>
        </div>
      </div>

      {/* Saturday Briefing */}
      {briefing && (
        <div className="bg-green-900/10 border border-green-800/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-400 mb-1">🗺️ Pre-Ride Briefing</p>
          <p className="text-sm leading-relaxed">{briefing}</p>
        </div>
      )}

      {/* Interval AI Notes */}
      <div className="space-y-2">
        {session.intervals.map((interval, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[var(--muted)]">{interval.name}</span>
                <button
                  onClick={() => generateNote(idx)}
                  disabled={loading[idx]}
                  className="text-[10px] px-2 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {loading[idx] ? "..." : notes[idx] ? "🔄" : "✨ AI"}
                </button>
              </div>
              {notes[idx] ? (
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-md px-3 py-2 text-sm">
                  🤖 {notes[idx]}
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)] italic">
                  💬 {interval.coachNote}
                  <span className="text-[10px] ml-1">(static)</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted)]">
        💡 Requires ANTHROPIC_API_KEY in .env. Without it, falls back to static commentary.
      </p>
    </div>
  );
}
