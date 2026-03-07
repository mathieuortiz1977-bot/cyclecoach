"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SegmentAttempt {
  id?: string;
  segmentId?: string;
  segmentName?: string;
  attemptDate?: string;
  date?: string;
  elapsedTime: number;
  movingTime?: number;
  avgCadence?: number;
  averageCadence?: number;
  avgWatts?: number;
  avgPower?: number;
  maxPower?: number;
  maxWatts?: number;
  avgHr?: number;
  average_heartrate?: number;
  maxHr?: number;
  max_heartrate?: number;
  isPR?: boolean;
}

interface SegmentStats {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  avgGrade: number;
  attempts: number;
  bestTime: number;
  bestDate: string;
  recentAvgTime?: number;
  improvement?: number;
  improvementPercent?: number;
  isPROpportunity?: boolean;
  formScore?: number;
}

interface SegmentPerformance {
  segment: SegmentStats;
  attempts: SegmentAttempt[];
  trend: "improving" | "declining" | "stable";
  proPotential: number; // 0-100 score for PR likelihood
}

export function StravaSegments() {
  const [segments, setSegments] = useState<SegmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pr-opportunity" | "improving" | "declining">("all");
  const [selectedSegment, setSelectedSegment] = useState<SegmentPerformance | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  // Load segment data
  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/strava/segments");
      const data = await response.json();

      if (data.success) {
        setSegments(data.segments || []);
        setLastSyncDate(new Date(data.lastSync) || new Date());
      }
    } catch (error) {
      console.error("Failed to load segments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync 5 years of Strava rides
  const handleFullSync = async () => {
    try {
      setSyncProgress(0);
      const response = await fetch("/api/strava/sync-5years", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setLastSyncDate(new Date());
        setSyncProgress(100);
        await loadSegments();
        setTimeout(() => setSyncProgress(0), 2000);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  // Filter segments
  const filteredSegments = segments.filter((seg) => {
    if (filter === "all") return true;
    if (filter === "pr-opportunity") return seg.proPotential > 70;
    if (filter === "improving") return seg.trend === "improving";
    if (filter === "declining") return seg.trend === "declining";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">🏔️ Segment Tracker</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Track your performance on popular segments and optimize for PRs
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={handleFullSync}
            disabled={loading || syncProgress > 0}
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {syncProgress > 0 ? `Syncing... ${syncProgress}%` : "Sync 5-Year History"}
          </button>
          {lastSyncDate && (
            <p className="text-xs text-[var(--muted)]">
              Last synced: {lastSyncDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pr-opportunity", "improving", "declining"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "all" && `All (${segments.length})`}
            {tab === "pr-opportunity" && `🎯 PR Opportunities (${segments.filter(s => s.proPotential > 70).length})`}
            {tab === "improving" && `📈 Improving (${segments.filter(s => s.trend === "improving").length})`}
            {tab === "declining" && `📉 Declining (${segments.filter(s => s.trend === "declining").length})`}
          </button>
        ))}
      </div>

      {/* Segments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[var(--card-border)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredSegments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)]">No segments found. Click "Sync 5-Year History" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredSegments.map((segPerf, idx) => (
              <motion.div
                key={segPerf.segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedSegment(segPerf)}
                className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 cursor-pointer hover:border-[var(--accent)] transition-colors"
              >
                {/* PR Badge */}
                {segPerf.proPotential > 70 && (
                  <div className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 rounded-lg px-2 py-1">
                    <span className="text-xs font-bold text-red-400">🎯 PR READY</span>
                  </div>
                )}

                {/* Segment Header */}
                <div className="mb-3">
                  <h3 className="font-semibold text-base">{segPerf.segment.name}</h3>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {(segPerf.segment.distance / 1000).toFixed(2)} km • {segPerf.segment.elevation}m elevation
                  </div>
                </div>

                {/* Best Time */}
                <div className="bg-[var(--background)] rounded-lg p-3 mb-3">
                  <div className="text-xs text-[var(--muted)] mb-1">Best Time (PR)</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      {Math.floor(segPerf.segment.bestTime / 60)}:{String(segPerf.segment.bestTime % 60).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(segPerf.segment.bestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Performance Trend */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Attempts */}
                  <div className="bg-[var(--background)] rounded-lg p-2">
                    <div className="text-xs text-[var(--muted)]">Attempts</div>
                    <div className="text-lg font-semibold">{segPerf.segment.attempts}</div>
                  </div>

                  {/* Form Score */}
                  <div className="bg-[var(--background)] rounded-lg p-2">
                    <div className="text-xs text-[var(--muted)]">Form Score</div>
                    <div className="text-lg font-semibold text-[var(--accent)]">
                      {segPerf.proPotential}%
                    </div>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {segPerf.trend === "improving" && (
                    <>
                      <span className="text-green-500">📈</span>
                      <span className="text-green-500">
                        {segPerf.segment.improvementPercent?.toFixed(1)}% faster
                      </span>
                    </>
                  )}
                  {segPerf.trend === "declining" && (
                    <>
                      <span className="text-red-500">📉</span>
                      <span className="text-red-500">
                        {Math.abs(segPerf.segment.improvementPercent || 0).toFixed(1)}% slower
                      </span>
                    </>
                  )}
                  {segPerf.trend === "stable" && (
                    <>
                      <span className="text-yellow-500">⚡</span>
                      <span className="text-yellow-500">Consistent</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Segment Detail Modal */}
      <AnimatePresence>
        {selectedSegment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSegment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedSegment.segment.name}</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <div className="text-sm text-[var(--muted)]">Distance</div>
                  <div className="text-xl font-bold">
                    {(selectedSegment.segment.distance / 1000).toFixed(2)} km
                  </div>
                </div>
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <div className="text-sm text-[var(--muted)]">Elevation</div>
                  <div className="text-xl font-bold">{selectedSegment.segment.elevation}m</div>
                </div>
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <div className="text-sm text-[var(--muted)]">Avg Grade</div>
                  <div className="text-xl font-bold">{selectedSegment.segment.avgGrade.toFixed(1)}%</div>
                </div>
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <div className="text-sm text-[var(--muted)]">Attempts</div>
                  <div className="text-xl font-bold">{selectedSegment.segment.attempts}</div>
                </div>
              </div>

              {/* Attempt History */}
              <h3 className="font-semibold text-lg mb-3">Attempt History</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedSegment.attempts.slice().reverse().map((attempt, idx) => (
                  <div key={idx} className="bg-[var(--background)] rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {Math.floor(attempt.elapsedTime / 60)}:{String(attempt.elapsedTime % 60).padStart(2, "0")}
                        {attempt.isPR && <span className="ml-2 text-xs bg-yellow-500/20 px-2 py-1 rounded text-yellow-400">PR</span>}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {new Date(attempt.attemptDate || attempt.date || new Date()).toLocaleDateString()}
                      </div>
                    </div>
                    {attempt.avgPower && (
                      <div className="text-right">
                        <div className="font-medium">{Math.round(attempt.avgPower)}W</div>
                        <div className="text-xs text-[var(--muted)]">
                          ⚡ {Math.round(attempt.avgHr || 0)} bpm
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PR Recommendation */}
              {selectedSegment.proPotential > 70 && (
                <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">🎯 PR Opportunity</h4>
                  <p className="text-sm text-[var(--muted)]">
                    Your current training form score is {selectedSegment.proPotential}%. This is an excellent time to attempt a PR on this segment!
                    Make sure you're well-rested and attempt it during optimal conditions.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedSegment(null)}
                className="w-full mt-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}