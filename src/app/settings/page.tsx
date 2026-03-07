"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ZoneTable } from "@/components/ZoneTable";
import { HRZoneTable } from "@/components/HRZoneTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrainingDayPicker } from "@/components/TrainingDayPicker";
import { NotificationSetup } from "@/components/NotificationSetup";
import { FitImport } from "@/components/FitImport";

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)] p-8">Loading settings...</div>}>
      <SettingsPage />
    </Suspense>
  );
}

function SettingsPage() {
  const searchParams = useSearchParams();
  const stravaStatus = searchParams?.get("strava");
  // TrainingPeaks removed — using Zwift via .zwo files

  const [ftp, setFtp] = useState(190);
  const [weight, setWeight] = useState(75);
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [tone, setTone] = useState("MIXED");
  const [duration, setDuration] = useState(60);

  // Training schedule
  const [trainingDays, setTrainingDays] = useState(["MON", "TUE", "THU", "FRI", "SAT"]);
  const [outdoorDay, setOutdoorDay] = useState("SAT");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  });

  // HR settings
  const [maxHr, setMaxHr] = useState(185);
  const [restingHr, setRestingHr] = useState(60);
  const [lthr, setLthr] = useState(165);
  const [hrMethod, setHrMethod] = useState<"PERCENTAGE" | "KARVONEN" | "LTHR">("PERCENTAGE");

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load rider profile from DB
  useEffect(() => {
    fetch("/api/rider").then(r => r.json()).then(data => {
      if (data.rider) {
        setFtp(data.rider.ftp);
        setWeight(data.rider.weight);
        setExperience(data.rider.experience);
        setTone(data.rider.coachTone);
        if (data.rider.maxHr) setMaxHr(data.rider.maxHr);
        if (data.rider.restingHr) setRestingHr(data.rider.restingHr);
        if (data.rider.lthr) setLthr(data.rider.lthr);
        
        // Load training schedule
        if (data.rider.trainingDays) {
          setTrainingDays(data.rider.trainingDays.split(','));
        }
        if (data.rider.outdoorDay) {
          setOutdoorDay(data.rider.outdoorDay);
        }
        if (data.rider.programStartDate) {
          setStartDate(new Date(data.rider.programStartDate).toISOString().split('T')[0]);
        }
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Save rider profile to DB (debounced)
  const saveProfile = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      await fetch("/api/rider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  }, []);

  // Strava sync
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleStravaSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`✅ Synced ${data.synced} new rides (${data.skipped} already synced)`);
      } else {
        setSyncResult(`❌ ${data.error}`);
      }
    } catch {
      setSyncResult("❌ Sync failed");
    }
    setSyncing(false);
  };

  // Training schedule update
  const [scheduleUpdating, setScheduleUpdating] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);

  const handleScheduleUpdate = async () => {
    setScheduleUpdating(true);
    setScheduleResult(null);
    try {
      // Save training schedule to rider profile
      await fetch("/api/rider", {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingDays: trainingDays.join(','),
          outdoorDay: outdoorDay,
          programStartDate: new Date(startDate).toISOString(),
        }),
      });

      // Regenerate the training plan based on new schedule
      const planRes = await fetch("/api/plan", { method: "POST" });
      const planData = await planRes.json();
      
      if (planData.plan) {
        setScheduleResult("✅ Training schedule updated and plan regenerated!");
      } else {
        setScheduleResult("❌ Failed to regenerate plan");
      }
    } catch (err) {
      console.error("Schedule update failed:", err);
      setScheduleResult("❌ Update failed");
    }
    setScheduleUpdating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--muted)]">Configure your profile, zones, and connections.</p>
      </div>

      {/* Status messages */}
      {stravaStatus === "connected" && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 text-sm text-green-400">
          ✅ Strava connected successfully! Click "Sync Rides" to import all your activities since January 1st, 2026.
        </div>
      )}
      {stravaStatus === "error" && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
          ❌ Strava connection failed. Check your API credentials.
        </div>
      )}


      {/* Rider Profile */}
      <div className="glass p-6 space-y-4">
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

      {/* Save Button */}
      <button
        onClick={() => saveProfile({ ftp, weight, experience, coachTone: tone, maxHr, restingHr, lthr })}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "💾 Save Profile"}
      </button>

      {/* Power Zones */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">⚡ Power Zones</h2>
        <ZoneTable ftp={ftp} />
      </div>

      {/* Training Schedule */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">📅 Training Schedule</h2>
        <p className="text-sm text-[var(--muted)]">
          Choose which days you train and when your program starts. Changes here will regenerate your plan.
        </p>

        <TrainingDayPicker
          selectedDays={trainingDays}
          onChange={setTrainingDays}
          outdoorDay={outdoorDay}
          onOutdoorDayChange={setOutdoorDay}
        />

        <div>
          <label className="block text-sm text-[var(--muted)] mb-2">Program Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-64 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)]"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Your 16-week plan will start from this date.
          </p>
        </div>

        {/* Update Button */}
        <div className="pt-4 border-t border-[var(--card-border)]">
          <button
            onClick={handleScheduleUpdate}
            disabled={scheduleUpdating}
            className="bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {scheduleUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating Schedule...
              </>
            ) : (
              <>
                🔄 Update Training Schedule
              </>
            )}
          </button>
          {scheduleResult && (
            <p className={`text-sm mt-2 ${scheduleResult.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {scheduleResult}
            </p>
          )}
          <p className="text-xs text-[var(--muted)] mt-2">
            This will save your schedule and regenerate your entire 16-week program.
          </p>
        </div>
      </div>

      {/* Heart Rate Configuration */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">❤️ Heart Rate Settings</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Max HR (bpm)</label>
            <input
              type="number"
              value={maxHr}
              onChange={(e) => setMaxHr(Math.max(100, parseInt(e.target.value) || 100))}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Resting HR (bpm)</label>
            <input
              type="number"
              value={restingHr}
              onChange={(e) => setRestingHr(Math.max(30, parseInt(e.target.value) || 30))}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">LTHR (bpm)</label>
            <input
              type="number"
              value={lthr}
              onChange={(e) => setLthr(Math.max(100, parseInt(e.target.value) || 100))}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-2">Zone Calculation Method</label>
          <div className="flex gap-2">
            {[
              { value: "PERCENTAGE" as const, label: "% Max HR", desc: "Simple, widely used" },
              { value: "KARVONEN" as const, label: "Karvonen (HRR)", desc: "Uses resting HR" },
              { value: "LTHR" as const, label: "Joe Friel (LTHR)", desc: "Most precise, 7 zones" },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setHrMethod(m.value)}
                className={`flex-1 p-3 rounded-lg text-left transition-colors border ${
                  hrMethod === m.value
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--muted)]"
                }`}
              >
                <p className="font-semibold text-sm">{m.label}</p>
                <p className="text-xs text-[var(--muted)]">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HR Zones */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">❤️ Heart Rate Zones</h2>
        <HRZoneTable maxHr={maxHr} restingHr={restingHr} lthr={lthr} method={hrMethod} />
      </div>

      {/* Coach Personality */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">🎭 Coach Personality</h2>
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
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">⏱ Training Preferences</h2>
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
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">🔌 Connections</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Strava */}
          <div className="border border-[var(--card-border)] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟠</span>
              <div>
                <p className="font-semibold text-sm">Strava</p>
                <p className="text-xs text-[var(--muted)]">
                  {stravaStatus === "connected" ? "✅ Connected" : "Sync all 2026 rides and power data"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/api/strava/auth"
                className="flex-1 text-center px-3 py-2 rounded-lg text-sm bg-[#fc4c02] text-white hover:bg-[#e34402] transition-colors"
              >
                {stravaStatus === "connected" ? "Reconnect" : "Connect Strava"}
              </a>
              {stravaStatus === "connected" && (
                <button
                  onClick={handleStravaSync}
                  disabled={syncing}
                  className="flex-1 px-3 py-2 rounded-lg text-sm border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {syncing ? "Syncing..." : "Sync Rides"}
                </button>
              )}
            </div>
            {syncResult && <p className="text-xs">{syncResult}</p>}
            <p className="text-[10px] text-[var(--muted)]">
              Requires STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in .env
            </p>
          </div>

          {/* Zwift */}
          <div className="border border-[var(--card-border)] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold text-sm">Zwift</p>
                <p className="text-xs text-[var(--muted)]">Download workouts as .zwo files for Zwift</p>
              </div>
            </div>
            <a
              href="/zwift"
              className="block text-center px-3 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-colors"
            >
              📥 Zwift Workout Sync
            </a>
            <p className="text-[10px] text-[var(--muted)]">
              Export your weekly workouts to Zwift&apos;s custom workout folder
            </p>
          </div>
        </div>
      </div>


      {/* Appearance */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <ThemeToggle />
      </div>

      {/* Import */}
      <FitImport />

      {/* Notifications */}
      <NotificationSetup />
    </div>
  );
}
