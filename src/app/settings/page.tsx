"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as tz from "@/lib/timezone";
import { api } from "@/lib/api";
import { ZoneTable } from "@/components/ZoneTable";
import { HRZoneTable } from "@/components/HRZoneTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrainingDayPicker } from "@/components/TrainingDayPicker";
import { NotificationSetup } from "@/components/NotificationSetup";
import { FitImport } from "@/components/FitImport";
import { CalendarSync } from "@/components/CalendarSync";
import { useRider } from "@/hooks/useRider";
import { usePlan } from "@/hooks/usePlan";

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
  const [sundayDuration, setSundayDuration] = useState(90); // Default 90 minutes
  const [startDate, setStartDate] = useState(() => {
    const daysUntilMonday = (8 - tz.getDayOfWeek(tz.today())) % 7 || 7;
    const nextMonday = tz.addDays(tz.today(), daysUntilMonday);
    return tz.formatAsISO(nextMonday);
  });

  // HR settings
  const [maxHr, setMaxHr] = useState(185);
  const [restingHr, setRestingHr] = useState(60);
  const [lthr, setLthr] = useState(165);
  const [hrMethod, setHrMethod] = useState<"PERCENTAGE" | "KARVONEN" | "LTHR">("PERCENTAGE");

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Use custom hooks to fetch data instead of duplicating API calls
  const { rider, loading: riderLoading } = useRider();
  const { plan, loading: planLoading } = usePlan();

  // Initialize state from rider data
  useEffect(() => {
    if (rider && !riderLoading) {
      setFtp(rider.ftp);
      setWeight(rider.weight);
      setExperience(rider.experience);
      setTone(rider.coachTone);
      if (rider.maxHr) setMaxHr(rider.maxHr);
      if (rider.restingHr) setRestingHr(rider.restingHr);
      if (rider.lthr) setLthr(rider.lthr);
      
      // Load training schedule
      if (rider.trainingDays) {
        setTrainingDays(rider.trainingDays.split(','));
      }
      if (rider.outdoorDay) {
        setOutdoorDay(rider.outdoorDay);
      }
      if (rider.programStartDate) {
        setStartDate(tz.formatAsISO(new Date(rider.programStartDate)));
      }
      if ((rider as any).sundayDuration) {
        setSundayDuration((rider as any).sundayDuration);
      }
      
      setLoaded(true);
    }
  }, [rider, riderLoading]);

  // Save rider profile to DB (debounced)
  const saveProfile = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.rider.update(updates as any);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  }, []);

  // Strava sync
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [extractingSegments, setExtractingSegments] = useState(false);
  const [extractResult, setExtractResult] = useState<string | null>(null);
  const [deletingRides, setDeletingRides] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncingRange, setSyncingRange] = useState(false);
  const [rangeSyncResult, setRangeSyncResult] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [importedRides, setImportedRides] = useState<Array<{ id: string; name: string; date: string; distance: number }>>([]);
  const [stravaSummary, setStravaSummary] = useState<{ total: number; dateSince: string; summary: string } | null>(null);

  const handleStravaSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await api.strava.sync();
      if (response.success) {
        setSyncResult(`✅ Synced ${response.data?.synced || 0} new rides (${response.data?.skipped || 0} already synced)`);
      } else {
        setSyncResult(`❌ ${response.error}`);
      }
    } catch {
      setSyncResult("❌ Sync failed");
    }
    setSyncing(false);
  };

  const handleExtractSegments = async () => {
    setExtractingSegments(true);
    setExtractResult(null);
    try {
      const response = await api.strava.extractSegments();
      if (response.success) {
        setExtractResult(
          `✅ Extracted ${response.data?.extracted || 0} activities with ${response.data?.segments || 0} new segments. ` +
          `Check the /segments page to see your PR opportunities!`
        );
      } else {
        setExtractResult(`❌ ${response.error}`);
      }
    } catch {
      setExtractResult("❌ Extraction failed");
    }
    setExtractingSegments(false);
  };

  const handleDeleteAllRides = async () => {
    setDeletingRides(true);
    setDeleteResult(null);
    try {
      const response = await fetch("/api/strava/delete-all", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setDeleteResult(`✅ Deleted ${data.deleted || 0} rides from database. You can now sync fresh data with the correct dates.`);
        setShowDeleteConfirm(false);
      } else {
        setDeleteResult(`❌ ${data.error || "Failed to delete rides"}`);
      }
    } catch (error) {
      setDeleteResult("❌ Delete failed");
      console.error("Delete rides error:", error);
    }
    setDeletingRides(false);
  };

  const handleSyncRange = async () => {
    setSyncingRange(true);
    setRangeSyncResult(null);
    console.log("[Settings] Starting sync with dates:", { fromDate, toDate });
    try {
      const response = await fetch("/api/strava/sync-range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate, toDate }),
      });
      const data = await response.json();
      
      console.log("[Settings] Sync response:", data);
      
      if (data.success) {
        setRangeSyncResult(`✅ Synced ${data.synced} new rides (${data.skipped} already synced)`);
        // Wait a moment for database to update, then refresh the imported rides list and summary
        setTimeout(() => {
          console.log("[Settings] Refreshing rides list and summary after sync...");
          loadImportedRides();
          loadStravaSummary();
        }, 500);
      } else {
        setRangeSyncResult(`❌ ${data.error || "Failed to sync"}`);
      }
    } catch (error) {
      setRangeSyncResult("❌ Sync failed");
      console.error("[Settings] Sync range error:", error);
    }
    setSyncingRange(false);
  };

  const loadStravaSummary = useCallback(async () => {
    try {
      console.log("[Settings] Loading Strava summary...");
      const response = await fetch("/api/strava/summary");
      if (!response.ok) {
        console.error("[Settings] Summary API error:", response.status);
        setStravaSummary(null);
        return;
      }
      const data = await response.json();
      
      console.log("[Settings] Summary response:", data);
      
      if (data.success) {
        setStravaSummary(data);
      }
    } catch (error) {
      console.error("[Settings] Failed to load Strava summary:", error);
      setStravaSummary(null);
    }
  }, []);

  const loadImportedRides = useCallback(async () => {
    try {
      console.log("[Settings] Loading imported rides...");
      const response = await fetch("/api/strava/activities");
      if (!response.ok) {
        console.error("[Settings] Activities API error:", response.status, response.statusText);
        setImportedRides([]);
        return;
      }
      const data = await response.json();
      
      console.log("[Settings] API response:", data);
      
      if (data.success && data.activities && data.activities.length > 0) {
        // Sort by startDate first (before formatting), then format for display
        const rides = data.activities
          .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .map((activity: any) => ({
            id: activity.stravaId?.toString() || activity.id,
            name: activity.name,
            date: new Date(activity.startDate).toLocaleDateString(),
            distance: (activity.distance / 1000).toFixed(1), // Convert meters to km
          }));
        
        console.log("[Settings] Formatted rides:", rides);
        setImportedRides(rides);
      } else if (data.success && (!data.activities || data.activities.length === 0)) {
        console.log("[Settings] No activities found in database");
        setImportedRides([]);
      } else {
        console.error("[Settings] API error:", data.error);
        setImportedRides([]);
      }
    } catch (error) {
      console.error("[Settings] Failed to load imported rides:", error);
      setImportedRides([]);
    }
  }, []);

  // Load both on mount (with proper dependency array)
  useEffect(() => {
    loadStravaSummary();
    loadImportedRides();
  }, [loadStravaSummary, loadImportedRides]);

  // Training schedule update
  const [scheduleUpdating, setScheduleUpdating] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);

  const handleScheduleUpdate = async () => {
    setScheduleUpdating(true);
    setScheduleResult(null);
    try {
      // Save training schedule to rider profile
      const riderResponse = await api.rider.update({
        trainingDays: trainingDays.join(','),
        outdoorDay: outdoorDay,
        programStartDate: tz.parseISO(startDate).toISOString(),
        sundayDuration: sundayDuration,
      });
      
      if (!riderResponse.success) {
        throw new Error(riderResponse.error || "Failed to save schedule");
      }

      // Regenerate the training plan based on new schedule
      const planResponse = await api.plan.regenerate();
      
      if (planResponse.success) {
        setScheduleResult(
          "✅ Training schedule updated! Your 16-week plan has been regenerated. " +
          "View it in the dashboard or calendar. The changes will appear when you navigate there."
        );
      } else {
        setScheduleResult(`❌ Error: ${planResponse.error}`);
      }
    } catch (err) {
      console.error("Schedule update failed:", err);
      setScheduleResult(`❌ Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
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
          ✅ Strava connected successfully! Click "Sync Rides" to import all your activities since January 1st, 2020 (6 years of data).
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
          sundayDuration={sundayDuration}
          onSundayDurationChange={setSundayDuration}
        />

        {/* Sunday Duration Slider - Training Preference */}
        {trainingDays.includes("SUN") && (
          <div className="bg-[var(--background)] rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold">🚴 Sunday Ride Duration</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-[var(--muted)]">Duration</label>
                <span className="font-semibold text-[var(--accent)]">{sundayDuration} min</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                step="15"
                value={sundayDuration}
                onChange={(e) => setSundayDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>60 min</span>
                <span>180 min</span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Adjust your Sunday ride duration. This will affect your weekly training load.
            </p>
          </div>
        )}

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

      {/* Training Preferences - moved here to be after Training Schedule */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">⏱ Training Preferences</h2>
        <div>
          <label className="block text-sm text-[var(--muted)] mb-2">Default Indoor Session Duration (min)</label>
          <input
            type="range"
            min={50}
            max={90}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <p className="text-sm font-mono text-[var(--accent)]">{duration} minutes</p>
          <p className="text-xs text-[var(--muted)] mt-2">
            Indoor sessions default to this duration. Adjust based on your typical training session length.
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

      {/* Connections */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold">🔌 Connections</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Strava */}
          <div className="border border-[var(--card-border)] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟠</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">Strava</p>
                <p className="text-xs text-[var(--muted)]">
                  {stravaStatus === "connected" ? "✅ Connected" : "Sync rides since 2020 and power data"}
                </p>
              </div>
            </div>

            {/* Database Summary */}
            {stravaSummary && stravaSummary.total > 0 && (
              <div className="px-3 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                <p className="text-xs text-[var(--accent)] font-medium">
                  📊 {stravaSummary.summary}
                </p>
              </div>
            )}
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
            {stravaStatus === "connected" && (
              <>
                <button
                  onClick={handleExtractSegments}
                  disabled={extractingSegments}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-50 text-[var(--accent)]"
                >
                  {extractingSegments ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin inline-block mr-2" />
                      Extracting...
                    </>
                  ) : (
                    "🎯 Extract Segments & PRs"
                  )}
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deletingRides}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-red-500/50 hover:border-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 text-red-400"
                >
                  {deletingRides ? "Deleting..." : "🗑️ Clear All Rides"}
                </button>

                {/* Historical Data Sync */}
                <div className="pt-3 border-t border-[var(--card-border)] space-y-3">
                  <p className="text-xs font-semibold text-[var(--muted)]">📅 Import By Date Range</p>
                  
                  {/* Date Range Inputs */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-[var(--muted)] block mb-1">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        disabled={syncingRange}
                        className="w-full px-2 py-1 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text)] disabled:opacity-50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[var(--muted)] block mb-1">To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        disabled={syncingRange}
                        className="w-full px-2 py-1 rounded text-xs bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text)] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSyncRange}
                    disabled={syncingRange}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-50 text-[var(--accent)] font-medium"
                  >
                    {syncingRange ? (
                      <>
                        <div className="w-3 h-3 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin inline-block mr-2" />
                        Importing...
                      </>
                    ) : (
                      "📥 Import Rides"
                    )}
                  </button>

                  {rangeSyncResult && (
                    <p className={`text-xs ${rangeSyncResult.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                      {rangeSyncResult}
                    </p>
                  )}

                  {/* Imported Rides List */}
                  <div className="pt-3 border-t border-[var(--card-border)]">
                    <p className="text-xs font-semibold text-[var(--muted)] mb-2">
                      🚴 Imported Rides ({importedRides.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)] p-2 space-y-1">
                      {importedRides.length === 0 ? (
                        <p className="text-xs text-[var(--muted)] py-3 text-center">No rides imported yet</p>
                      ) : (
                        importedRides.map((ride) => (
                          <div
                            key={ride.id}
                            className="text-xs flex justify-between items-center p-2 rounded bg-[var(--card-bg)] border border-[var(--card-border)]/50 hover:border-[var(--accent)]/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text)] truncate">{ride.name}</p>
                              <p className="text-[var(--muted)] text-[10px]">{ride.date}</p>
                            </div>
                            <p className="text-[var(--accent)] font-semibold ml-2">{ride.distance} km</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {syncResult && <p className="text-xs text-green-400">{syncResult}</p>}
            {extractResult && <p className="text-xs text-blue-400">{extractResult}</p>}
            {deleteResult && <p className={`text-xs ${deleteResult.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{deleteResult}</p>}
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

      {/* Calendar Integration */}
      {plan && (
        <CalendarSync 
          plan={plan}
          programStartDate={startDate}
          trainingDays={trainingDays}
        />
      )}

      {/* Delete All Rides Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 max-w-md w-full mx-4 space-y-4 border border-[var(--card-border)]">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Delete All Strava Rides?</h3>
              <p className="text-sm text-[var(--muted)]">
                This will permanently delete all {deletingRides ? '...' : 'your Strava'} rides from the database. You can re-sync them with the correct dates afterward.
              </p>
            </div>
            
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
              <p className="text-xs text-red-400">
                ⚠️ This action cannot be undone. All segment data will also be cleared.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingRides}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllRides}
                disabled={deletingRides}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {deletingRides ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
