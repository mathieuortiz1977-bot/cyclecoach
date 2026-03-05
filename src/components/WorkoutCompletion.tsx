"use client";
import { useState } from "react";
import type { WorkoutScore } from "@/lib/adaptation";

interface Props {
  sessionTitle: string;
  plannedSession?: import("@/lib/periodization").SessionDef;
  ftp?: number;
  onScore?: (score: WorkoutScore) => void;
}

export function WorkoutCompletion({ sessionTitle, plannedSession, ftp: propFtp, onScore }: Props) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(true);
  const [avgPower, setAvgPower] = useState<number | undefined>();
  const [np, setNp] = useState<number | undefined>();
  const [avgHr, setAvgHr] = useState<number | undefined>();
  const [maxHr, setMaxHr] = useState<number | undefined>();
  const [duration, setDuration] = useState(60);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState<WorkoutScore | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Score locally
      const { scoreWorkout } = await import("@/lib/adaptation");
      const fallbackSession = {
        dayOfWeek: "MON" as const,
        sessionType: "INDOOR" as const,
        duration: 60,
        title: sessionTitle,
        description: "",
        intervals: [
          { name: "Session", durationSecs: 3600, powerLow: 70, powerHigh: 90, zone: "Z3", purpose: "", coachNote: "" },
        ],
      };

      const result = scoreWorkout({
        sessionId: "manual",
        plannedSession: plannedSession || fallbackSession,
        actualData: {
          avgPower,
          normalizedPower: np,
          avgHr,
          maxHr,
          duration: duration * 60,
          rpe,
          completed,
          notes: notes || undefined,
        },
        ftp: propFtp || 190,
        date: new Date().toISOString().split("T")[0],
      });

      setScore(result);
      onScore?.(result);
    } catch (err) {
      console.error("Scoring error:", err);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-lg border border-dashed border-[var(--card-border)] text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
      >
        ✅ Log Completed Workout
      </button>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
      <h3 className="font-semibold">Log: {sessionTitle}</h3>

      {/* Completed toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setCompleted(true)}
          className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
            completed ? "border-green-500 bg-green-500/10 text-green-400" : "border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          ✅ Completed
        </button>
        <button
          onClick={() => setCompleted(false)}
          className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
            !completed ? "border-red-500 bg-red-500/10 text-red-400" : "border-[var(--card-border)] text-[var(--muted)]"
          }`}
        >
          ❌ Missed
        </button>
      </div>

      {completed && (
        <>
          {/* Power data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Avg Power (W)</label>
              <input
                type="number"
                value={avgPower || ""}
                onChange={(e) => setAvgPower(parseInt(e.target.value) || undefined)}
                placeholder="e.g. 165"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Normalized Power (W)</label>
              <input
                type="number"
                value={np || ""}
                onChange={(e) => setNp(parseInt(e.target.value) || undefined)}
                placeholder="e.g. 178"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* HR data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Avg HR (bpm)</label>
              <input
                type="number"
                value={avgHr || ""}
                onChange={(e) => setAvgHr(parseInt(e.target.value) || undefined)}
                placeholder="e.g. 152"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Max HR (bpm)</label>
              <input
                type="number"
                value={maxHr || ""}
                onChange={(e) => setMaxHr(parseInt(e.target.value) || undefined)}
                placeholder="e.g. 178"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Duration & RPE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">RPE (1-10): {rpe}</label>
              <input
                type="range"
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>Easy</span>
                <span>Max</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any issues?"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {loading ? "Scoring..." : "Submit & Get Feedback"}
      </button>

      {/* Score Result */}
      {score && (
        <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {score.overallRating === "crushed_it" ? "🔥" :
               score.overallRating === "on_target" ? "✅" :
               score.overallRating === "struggled" ? "😤" :
               score.overallRating === "missed" ? "❌" : "📉"}
            </span>
            <span className="font-bold text-[var(--accent)]">{score.compliance}% compliance</span>
          </div>
          <p className="text-sm italic">{score.coachFeedback}</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
            <div>⚡ Power: {score.powerAccuracy}%</div>
            <div>⏱ Duration: {score.durationAccuracy}%</div>
            <div>Fatigue: <span style={{ color: score.fatigueSignal === "fresh" ? "#22c55e" : score.fatigueSignal === "fatigued" ? "#eab308" : "#3b82f6" }}>{score.fatigueSignal}</span></div>
          </div>
        </div>
      )}

      <button
        onClick={() => { setOpen(false); setScore(null); }}
        className="text-xs text-[var(--muted)] hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}
