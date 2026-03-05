"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZoneTable } from "@/components/ZoneTable";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ftp, setFtp] = useState(200);
  const [weight, setWeight] = useState(75);
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [tone, setTone] = useState("MIXED");
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    // In production, save to API
    // For now, redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`}
            />
          ))}
        </div>

        {/* Step 1: FTP & Weight */}
        {step === 1 && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
            <div className="text-center">
              <span className="text-4xl">⚡</span>
              <h2 className="text-2xl font-bold mt-2">Your Numbers</h2>
              <p className="text-[var(--muted)] text-sm">These drive your entire training plan</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">FTP (watts)</label>
                <input
                  type="number"
                  value={ftp}
                  onChange={(e) => setFtp(Math.max(50, parseInt(e.target.value) || 50))}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-2xl font-bold text-[var(--accent)] text-center focus:outline-none focus:border-[var(--accent)]"
                />
                <p className="text-xs text-[var(--muted)] mt-1 text-center">Don&apos;t know? Start with 200W and adjust after your first week.</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 50)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-center focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="text-center">
                <p className="text-[var(--muted)] text-sm">W/kg:</p>
                <p className="text-3xl font-bold text-[var(--accent)]">{(ftp / weight).toFixed(2)}</p>
              </div>
            </div>

            <ZoneTable ftp={ftp} />

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
            <div className="text-center">
              <span className="text-4xl">🚴</span>
              <h2 className="text-2xl font-bold mt-2">Your Experience</h2>
              <p className="text-[var(--muted)] text-sm">This adjusts workout complexity and progression</p>
            </div>

            <div className="space-y-3">
              {[
                { value: "BEGINNER", emoji: "🌱", title: "Beginner", desc: "New to structured training. Less than 1 year of consistent cycling." },
                { value: "INTERMEDIATE", emoji: "💪", title: "Intermediate", desc: "1-3 years training. Familiar with intervals and zones." },
                { value: "ADVANCED", emoji: "🔥", title: "Advanced", desc: "3+ years. Races, knows their body, ready for aggressive plans." },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperience(level.value)}
                  className={`w-full p-4 rounded-lg text-left transition-colors border ${
                    experience === level.value
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--card-border)] hover:border-[var(--muted)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <p className="font-semibold">{level.title}</p>
                      <p className="text-xs text-[var(--muted)]">{level.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-white transition-colors">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Coach Personality */}
        {step === 3 && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
            <div className="text-center">
              <span className="text-4xl">🎭</span>
              <h2 className="text-2xl font-bold mt-2">Your Coach</h2>
              <p className="text-[var(--muted)] text-sm">Pick the voice that keeps you going</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "DARK_HUMOR", emoji: "💀", title: "Dark Humor", desc: "Suffering with a smile", sample: "\"If your legs don't hurt, you're doing it wrong.\"" },
                { value: "MOTIVATIONAL", emoji: "🔥", title: "Motivational", desc: "Believe in yourself", sample: "\"This is where champions are made.\"" },
                { value: "TECHNICAL", emoji: "🔬", title: "Technical", desc: "Just the science", sample: "\"Aerobic decoupling at 3.2% — good efficiency.\"" },
                { value: "MIXED", emoji: "🎲", title: "Mixed", desc: "A bit of everything", sample: "\"Push hard. Recover harder. Eat cake.\"" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`p-4 rounded-lg text-left transition-colors border ${
                    tone === t.value
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--card-border)] hover:border-[var(--muted)]"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <p className="font-semibold text-sm mt-2">{t.title}</p>
                  <p className="text-xs text-[var(--muted)]">{t.desc}</p>
                  <p className="text-xs italic text-[var(--accent)] mt-2">{t.sample}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-white transition-colors">
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? "Setting up..." : "Start Training 🚴"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
