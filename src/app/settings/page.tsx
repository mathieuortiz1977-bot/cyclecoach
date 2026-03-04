"use client";
import { useState } from "react";
import { ZoneTable } from "@/components/ZoneTable";

export default function SettingsPage() {
  const [ftp, setFtp] = useState(190);
  const [weight, setWeight] = useState(75);
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [tone, setTone] = useState("MIXED");
  const [duration, setDuration] = useState(60);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--muted)]">Configure your profile and training preferences.</p>
      </div>

      {/* Rider Profile */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Rider Profile</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">FTP (watts)</label>
            <input
              type="number"
              value={ftp}
              onChange={(e) => setFtp(Math.max(50, parseInt(e.target.value) || 50))}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-xl font-bold text-[var(--accent)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 50)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">W/kg</label>
          <p className="text-2xl font-bold text-[var(--accent)]">{(ftp / weight).toFixed(2)} W/kg</p>
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Experience Level</label>
          <div className="flex gap-2">
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
              <button
                key={level}
                onClick={() => setExperience(level)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                  experience === level
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Power Zones */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Power Zones</h2>
        <ZoneTable ftp={ftp} />
      </div>

      {/* Coach Personality */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Coach Personality</h2>
        <p className="text-sm text-[var(--muted)]">Choose the tone of your workout commentary.</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "DARK_HUMOR", label: "💀 Dark Humor", desc: "Suffering with a smile" },
            { value: "MOTIVATIONAL", label: "🔥 Motivational", desc: "You've got this, champion" },
            { value: "TECHNICAL", label: "🔬 Technical", desc: "Just the science" },
            { value: "MIXED", label: "🎲 Mixed", desc: "A bit of everything" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`p-3 rounded-lg text-left transition-colors border ${
                tone === t.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--card-border)] hover:border-[var(--muted)]"
              }`}
            >
              <p className="font-semibold text-sm">{t.label}</p>
              <p className="text-xs text-[var(--muted)]">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Training Preferences */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Training Preferences</h2>
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Default Indoor Session Duration (min)</label>
          <input
            type="range"
            min={50}
            max={90}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <p className="text-sm font-mono text-[var(--accent)]">{duration} minutes</p>
        </div>
      </div>

      {/* Connections */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Connections</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-3 p-4 rounded-lg border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors">
            <span className="text-2xl">🟠</span>
            <div className="text-left">
              <p className="font-semibold text-sm">Strava</p>
              <p className="text-xs text-[var(--muted)]">Connect to sync rides</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 rounded-lg border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors">
            <span className="text-2xl">📈</span>
            <div className="text-left">
              <p className="font-semibold text-sm">TrainingPeaks</p>
              <p className="text-xs text-[var(--muted)]">Sync CTL/ATL/TSB</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
