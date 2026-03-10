'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WorkoutTemplate, IntervalDef } from '@/lib/periodization';
import { getZoneColor } from '@/lib/zones';

interface WorkoutDetailProps {
  workout: WorkoutTemplate;
  userFtp?: number;
  onClose?: () => void;
}

interface ScaledInterval extends IntervalDef {
  scaledDuration: number;
}

export function WorkoutDetail({
  workout,
  userFtp = 250,
  onClose,
}: WorkoutDetailProps) {
  const [selectedDuration, setSelectedDuration] = useState(workout.duration || 60);
  const durationOptions = [45, 60, 75, 90];

  // Scale intervals based on selected duration
  const scaleInterval = (interval: IntervalDef): ScaledInterval => {
    const originalDuration = workout.duration || 60;
    const scaleFactor = selectedDuration / originalDuration;

    const originalSecs = interval.durationSecs || 0;
    const scaledDuration = Math.round(originalSecs * scaleFactor);

    return {
      ...interval,
      scaledDuration,
    };
  };

  const scaledIntervals = (workout.intervals || []).map(scaleInterval);
  const totalScaledSecs = scaledIntervals.reduce((sum, i) => sum + i.scaledDuration, 0);
  const totalScaledMins = Math.round(totalScaledSecs / 60);

  const getTrainingZoneInfo = (zone: string) => {
    const zoneMap: Record<string, { min: number; max: number; name: string }> = {
      Z1: { min: 50, max: 60, name: 'Recovery' },
      Z2: { min: 60, max: 75, name: 'Endurance' },
      Z3: { min: 75, max: 90, name: 'Tempo' },
      Z4: { min: 90, max: 105, name: 'Threshold' },
      Z5: { min: 105, max: 120, name: 'VO2max' },
      Z6: { min: 120, max: 150, name: 'Anaerobic' },
    };
    return zoneMap[zone] || { min: 0, max: 100, name: 'Unknown' };
  };

  return (
    <motion.div
      className="bg-dark border border-accent/30 rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-light">{workout.title}</h2>
          <div className="flex gap-2 mt-2">
            <span className="text-sm bg-accent/20 text-accent px-2 py-1 rounded">
              {workout.category}
            </span>
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
              {workout.source}
            </span>
            <span className="text-sm bg-success/20 text-success px-2 py-1 rounded">
              {workout.primaryZone}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-light/50 hover:text-light text-2xl transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-dark/40 border border-accent/20 rounded-lg p-4">
        <div>
          <div className="text-light/60 text-sm">Original Duration</div>
          <div className="text-lg font-semibold text-light">{workout.duration} min</div>
        </div>
        <div>
          <div className="text-light/60 text-sm">TSS</div>
          <div className="text-lg font-semibold text-light">{workout.tss || 'N/A'}</div>
        </div>
        <div>
          <div className="text-light/60 text-sm">Difficulty</div>
          <div className="text-lg font-semibold text-light">
            {workout.difficulty}/10
          </div>
        </div>
        <div>
          <div className="text-light/60 text-sm">Intervals</div>
          <div className="text-lg font-semibold text-light">
            {workout.intervals?.length || 0}
          </div>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="mb-6">
        <label className="text-light/70 text-sm block mb-2">
          Scaled Duration (Scaled Total: {totalScaledMins} min)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {durationOptions.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`py-2 rounded font-semibold transition ${
                selectedDuration === duration
                  ? 'bg-accent text-dark'
                  : 'bg-dark/40 border border-accent/30 text-light hover:border-accent'
              }`}
            >
              {duration}m
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      {workout.description && (
        <div className="mb-6 p-4 bg-dark/40 border border-accent/20 rounded-lg">
          <p className="text-light/70 text-sm">{workout.description}</p>
        </div>
      )}

      {/* Intervals List */}
      <div className="space-y-3">
        <h3 className="text-light font-semibold text-lg">Intervals</h3>

        {scaledIntervals.map((interval, idx) => {
          const zoneInfo = getTrainingZoneInfo(
            interval.intensity?.zone?.split('-')[0] || 'Z2'
          );
          const powerLow = Math.round(
            (interval.intensity?.powerLow || 0) * (userFtp / 100)
          );
          const powerHigh = Math.round(
            (interval.intensity?.powerHigh || 0) * (userFtp / 100)
          );

          return (
            <motion.div
              key={idx}
              className="bg-dark/40 border border-accent/20 rounded-lg p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Interval Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: getZoneColor(
                        interval.intensity?.zone || 'Z2'
                      ),
                    }}
                  />
                  <div>
                    <h4 className="text-light font-semibold">{interval.name}</h4>
                    <p className="text-light/60 text-sm">{interval.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-light">
                    {Math.round(interval.scaledDuration / 60)}:{String(
                      interval.scaledDuration % 60
                    ).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-light/50">{interval.intensity?.zone}</div>
                </div>
              </div>

              {/* Power & Zone Info */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-light/60">Power: </span>
                  <span className="text-light font-semibold">
                    {powerLow}-{powerHigh}W
                  </span>
                </div>
                <div>
                  <span className="text-light/60">RPE: </span>
                  <span className="text-light font-semibold">
                    {interval.intensity?.rpe || 'N/A'}/10
                  </span>
                </div>
              </div>

              {/* Instruction */}
              {interval.instruction && (
                <div className="bg-dark/60 border border-accent/10 rounded p-3 mb-3">
                  <p className="text-light/70 text-sm italic">
                    {interval.instruction}
                  </p>
                </div>
              )}

              {/* Coaching Notes */}
              {interval.coachingNotes && (
                <div className="text-xs text-light/50 space-y-1">
                  {interval.coachingNotes.TECHNICAL && (
                    <p>💡 {interval.coachingNotes.TECHNICAL}</p>
                  )}
                  {interval.coachingNotes.MOTIVATIONAL && (
                    <p>🔥 {interval.coachingNotes.MOTIVATIONAL}</p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-accent/20 flex gap-2">
        <button className="flex-1 py-2 bg-accent text-dark font-semibold rounded hover:bg-accent-light transition">
          Add to Plan
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-dark/40 border border-accent/30 text-light font-semibold rounded hover:border-accent transition"
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  );
}
