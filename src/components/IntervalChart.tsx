"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getZoneColor } from "@/lib/zones";
import type { IntervalDef } from "@/lib/periodization";

interface IntervalDetailModal {
  interval: IntervalDef;
  ftp: number;
  index: number;
}

export function IntervalChart({ intervals, ftp }: { intervals: IntervalDef[]; ftp: number }) {
  const [selectedInterval, setSelectedInterval] = useState<IntervalDetailModal | null>(null);
  const totalSecs = intervals.reduce((s, i) => s + i.durationSecs, 0);
  const maxPower = Math.max(...intervals.map((i) => i.powerHigh), 100);
  const chartHeight = 200;

  const handleBarClick = (interval: IntervalDef, index: number) => {
    setSelectedInterval({ interval, ftp, index });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="glass p-4">
        <div className="flex items-end gap-[1px]" style={{ height: chartHeight }}>
          {intervals.map((interval, idx) => {
            const widthPct = (interval.durationSecs / totalSecs) * 100;
            const avgPower = (interval.powerLow + interval.powerHigh) / 2;
            const heightPct = maxPower > 0 ? (avgPower / maxPower) * 100 : 10;
            const color = getZoneColor(interval.zone);

            return (
              <motion.div
                key={idx}
                className="relative group cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  width: `${widthPct}%`,
                  height: `${Math.max(heightPct, 5)}%`,
                  backgroundColor: color,
                  borderRadius: "2px 2px 0 0",
                  minWidth: "4px",
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `0 0 8px ${color}50`
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBarClick(interval, idx)}
              >
                {/* Desktop hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover:block z-10 w-48">
                  <div className="bg-[#111] border border-[var(--card-border)] rounded-lg p-2 text-xs shadow-xl backdrop-blur-md">
                    <p className="font-bold text-white">{interval.name}</p>
                    <p className="text-[var(--muted)]">{formatTime(interval.durationSecs)}</p>
                    {interval.powerHigh > 0 && (
                      <p style={{ color }}>
                        {Math.round(ftp * interval.powerLow / 100)}–{Math.round(ftp * interval.powerHigh / 100)}W
                        ({interval.powerLow}–{interval.powerHigh}%)
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile tap indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity md:hidden">
                  <div className="bg-white/20 rounded-full p-1">
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Time axis */}
        <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
          <span>0:00</span>
          <span>{Math.round(totalSecs / 60)} min</span>
        </div>

        {/* Mobile hint */}
        <p className="text-xs text-[var(--muted)] text-center mt-2 md:hidden">
          Tap bars for interval details
        </p>
      </div>

      {/* Mobile Interval Detail Modal */}
      <AnimatePresence>
        {selectedInterval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInterval(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-sm w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold gradient-text">Interval {selectedInterval.index + 1}</h3>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {selectedInterval.interval.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInterval(null)}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Interval Bar Preview */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-12 rounded"
                  style={{ 
                    backgroundColor: getZoneColor(selectedInterval.interval.zone)
                  }}
                />
                <div>
                  <p className="text-sm text-[var(--muted)]">Zone {selectedInterval.interval.zone}</p>
                  <p className="text-xs text-[var(--muted)]">{selectedInterval.interval.purpose}</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">⏱️</div>
                  <div className="text-lg font-semibold">{formatTime(selectedInterval.interval.durationSecs)}</div>
                  <div className="text-xs text-[var(--muted)]">Duration</div>
                </div>

                {/* Power Range */}
                {selectedInterval.interval.powerHigh > 0 && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-[var(--accent)]">⚡</div>
                    <div className="text-lg font-semibold">
                      {Math.round(selectedInterval.ftp * selectedInterval.interval.powerLow / 100)}–{Math.round(selectedInterval.ftp * selectedInterval.interval.powerHigh / 100)}W
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {selectedInterval.interval.powerLow}–{selectedInterval.interval.powerHigh}% FTP
                    </div>
                  </div>
                )}

                {/* Cadence */}
                {selectedInterval.interval.cadenceLow && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-400">🔄</div>
                    <div className="text-lg font-semibold">
                      {selectedInterval.interval.cadenceLow}
                      {selectedInterval.interval.cadenceHigh && selectedInterval.interval.cadenceHigh !== selectedInterval.interval.cadenceLow 
                        ? `–${selectedInterval.interval.cadenceHigh}` 
                        : ''}
                    </div>
                    <div className="text-xs text-[var(--muted)]">Cadence (rpm)</div>
                  </div>
                )}

                {/* RPE */}
                {selectedInterval.interval.rpe && (
                  <div className="bg-[var(--background)]/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-yellow-400">💪</div>
                    <div className="text-lg font-semibold">{selectedInterval.interval.rpe}/10</div>
                    <div className="text-xs text-[var(--muted)]">RPE</div>
                  </div>
                )}
              </div>

              {/* Coach Note */}
              {selectedInterval.interval.coachNote && (
                <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-[var(--accent)] mb-1">💬 Coach Note</p>
                  <p className="text-sm text-[var(--foreground)]">{selectedInterval.interval.coachNote}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}