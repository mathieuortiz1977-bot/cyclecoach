"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionDef } from "@/lib/periodization";
// Lazy-load confetti (only needed on good sessions)
const fireConfetti = () => import("canvas-confetti").then((m) => {
  m.default({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#f97316", "#eab308", "#22c55e"],
  });
});

const rpeDescriptions: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: "Very Easy", emoji: "😴", color: "#22c55e" },
  2: { label: "Easy", emoji: "😌", color: "#22c55e" },
  3: { label: "Light", emoji: "🙂", color: "#84cc16" },
  4: { label: "Moderate", emoji: "😐", color: "#84cc16" },
  5: { label: "Challenging", emoji: "😤", color: "#eab308" },
  6: { label: "Hard", emoji: "😓", color: "#eab308" },
  7: { label: "Very Hard", emoji: "🥵", color: "#f97316" },
  8: { label: "Brutal", emoji: "😵", color: "#f97316" },
  9: { label: "Maximal", emoji: "💀", color: "#ef4444" },
  10: { label: "All-out", emoji: "☠️", color: "#ef4444" },
};

const feelOptions = [
  { id: "legs_heavy", label: "Legs heavy", icon: "🦵" },
  { id: "legs_fresh", label: "Legs fresh", icon: "💪" },
  { id: "breathing_fine", label: "Breathing fine", icon: "😤" },
  { id: "breathing_hard", label: "Out of breath", icon: "🫁" },
  { id: "motivated", label: "Motivated", icon: "🔥" },
  { id: "low_energy", label: "Low energy", icon: "🔋" },
  { id: "cramping", label: "Cramping", icon: "⚡" },
  { id: "saddle_sore", label: "Saddle sore", icon: "🪑" },
  { id: "great_session", label: "Great session!", icon: "🎉" },
  { id: "wanted_to_quit", label: "Wanted to quit", icon: "🏳️" },
];

interface Props {
  session: SessionDef;
  ftp: number;
  onComplete: (data: CompletionData) => void;
  onDismiss: () => void;
}

export interface CompletionData {
  rpe: number;
  feelings: string[];
  actualPower?: number;
  actualDuration?: number;
  notes: string;
  completed: boolean;
}

export function WorkoutCompletion({ session, ftp, onComplete, onDismiss }: Props) {
  const [step, setStep] = useState(1);
  const [rpe, setRpe] = useState(5);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [actualPower, setActualPower] = useState<string>("");
  const [actualDuration, setActualDuration] = useState<string>(session.duration.toString());
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(true);

  const toggleFeel = (id: string) => {
    setFeelings((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const data: CompletionData = {
      rpe,
      feelings,
      actualPower: actualPower ? parseInt(actualPower) : undefined,
      actualDuration: actualDuration ? parseInt(actualDuration) : undefined,
      notes,
      completed,
    };
    onComplete(data);

    // Confetti for good sessions
    if (rpe <= 7 && completed) {
      fireConfetti();
    }
  };

  const rpeInfo = rpeDescriptions[rpe];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--card)] rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 1.5rem), 1.5rem)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--accent)] font-medium">Session Complete</p>
              <h3 className="font-bold text-lg">{session.title}</h3>
            </div>
            <button onClick={onDismiss} className="text-[var(--muted)] text-xl">✕</button>
          </div>

          {/* Step 1: Did you complete it? + RPE */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Completed toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCompleted(true)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    completed ? "border-green-500 bg-green-500/10 text-green-400" : "border-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  ✅ Completed
                </button>
                <button
                  onClick={() => setCompleted(false)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    !completed ? "border-red-500 bg-red-500/10 text-red-400" : "border-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  ❌ Cut Short
                </button>
              </div>

              {/* RPE Slider */}
              <div>
                <p className="text-sm text-[var(--muted)] mb-3">How hard was it? (RPE)</p>
                <div className="text-center mb-3">
                  <span className="text-4xl">{rpeInfo.emoji}</span>
                  <p className="text-lg font-bold mt-1" style={{ color: rpeInfo.color }}>{rpe}/10</p>
                  <p className="text-sm text-[var(--muted)]">{rpeInfo.label}</p>
                </div>
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
                  <span>Moderate</span>
                  <span>Max</span>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                Next →
              </button>
            </motion.div>
          )}

          {/* Step 2: How did you feel? */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <p className="text-sm text-[var(--muted)] mb-3">How did you feel? (select all that apply)</p>
                <div className="grid grid-cols-2 gap-2">
                  {feelOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleFeel(opt.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                        feelings.includes(opt.id)
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                          : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Data + Notes */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-sm text-[var(--muted)]">Optional — add actual data if you have it</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Avg Power (W)</label>
                  <input
                    type="number"
                    value={actualPower}
                    onChange={(e) => setActualPower(e.target.value)}
                    placeholder={`~${Math.round(ftp * 0.75)}`}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth remembering about this session..."
                  rows={3}
                  className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)]"
                />
              </div>

              <p className="text-xs text-[var(--muted)] italic">
                💡 If Strava/TrainingPeaks is connected, power and duration will be auto-filled from your ride data.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  ← Back
                </button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                  Log Workout ✅
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
