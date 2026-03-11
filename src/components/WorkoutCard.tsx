'use client';

import type { WorkoutTemplate } from '@/lib/periodization';
import { getZoneColor } from '@/lib/zones';

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  ftp?: number;
}

export function WorkoutCard({ workout, ftp = 200 }: WorkoutCardProps) {
  const intervals = typeof workout.intervals === 'function' ? workout.intervals() : workout.intervals;
  const DISPLAY_DURATION_MINS = 60; // Standard 60-minute display duration
  
  // Helper: Extract power from nested or flat structure
  const getPower = (interval: any, field: 'powerLow' | 'powerHigh') => {
    // Try nested structure first (from JSON files)
    if (interval.intensity && typeof interval.intensity === 'object') {
      return interval.intensity[field];
    }
    // Try flat structure (from generated code)
    return interval[field];
  };

  // Helper: Extract zone from nested or flat structure
  const getZone = (interval: any) => {
    if (interval.intensity && typeof interval.intensity === 'object') {
      return interval.intensity.zone;
    }
    return interval.zone;
  };

  // Helper: Extract duration in seconds
  const getDurationSecs = (interval: any) => {
    // Try nested structure first (from JSON files)
    if (interval.duration && typeof interval.duration === 'object') {
      return interval.duration.absoluteSecs || ((interval.duration.percent / 100) * (DISPLAY_DURATION_MINS * 60));
    }
    // Try flat structure
    if (interval.durationSecs) {
      return interval.durationSecs;
    }
    if (interval.durationPercent) {
      return (interval.durationPercent / 100) * (DISPLAY_DURATION_MINS * 60);
    }
    return 0;
  };
  
  // Calculate total duration: handle both structures
  const totalDurationSecs = intervals.reduce((sum, i: any) => sum + getDurationSecs(i), 0);
  const totalDurationMins = Math.round(totalDurationSecs / 60) || DISPLAY_DURATION_MINS;

  // Calculate max power for chart scaling
  const maxPower = Math.max(...intervals.map((i: any) => getPower(i, 'powerHigh') || 0)) || 100;

  return (
    <div className="glass rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">{workout.title}</h3>
        <p className="text-sm text-[var(--muted)]">{workout.category}</p>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 text-sm">
        <div>
          <p className="text-[var(--muted)]">Duration</p>
          <p className="font-semibold text-[var(--accent)]">{DISPLAY_DURATION_MINS} min</p>
        </div>
        <div>
          <p className="text-[var(--muted)]">Intervals</p>
          <p className="font-semibold text-[var(--accent)]">{intervals.length}</p>
        </div>
        <div>
          <p className="text-[var(--muted)]">Avg FTP</p>
          <p className="font-semibold text-[var(--accent)]">
            {intervals.length > 0 
              ? Math.round(intervals.reduce((sum, i) => {
                  const low = getPower(i, 'powerLow') || 0;
                  const high = getPower(i, 'powerHigh') || 0;
                  return sum + (low + high) / 2;
                }, 0) / intervals.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Description */}
      {workout.description && (
        <p className="text-sm text-[var(--muted)] line-clamp-2">{workout.description}</p>
      )}

      {/* Interval Chart */}
      <div className="space-y-2 w-full overflow-hidden">
        <p className="text-xs font-semibold text-[var(--muted)]">Interval Breakdown</p>
        <div className="flex gap-1 h-16 bg-[var(--surface)] rounded p-2 overflow-x-auto">
          {intervals && intervals.length > 0 ? (
            intervals.map((interval: any, idx) => {
              const zone = getZone(interval);
              const color = getZoneColor(zone);
              const powerHigh = getPower(interval, 'powerHigh') || 50;
              const powerLow = getPower(interval, 'powerLow') || 0;
              const heightPercent = Math.min((powerHigh / maxPower) * 100, 100);
              
              // Calculate width: use helper function to get duration
              const durationSecs = getDurationSecs(interval) || ((DISPLAY_DURATION_MINS * 60) / intervals.length);
              
              // Guard against division by zero
              const totalSecs = totalDurationSecs || (DISPLAY_DURATION_MINS * 60);
              const widthPercent = totalSecs > 0 
                ? (durationSecs / totalSecs) * 100 
                : (100 / intervals.length);

              return (
                <div
                  key={idx}
                  className="flex-shrink-0 rounded transition-all hover:opacity-80"
                  style={{
                    width: `${Math.max(widthPercent, 2)}%`,
                    height: `${Math.max(heightPercent, 10)}%`,
                    backgroundColor: color,
                    minWidth: '4px',
                    alignSelf: 'flex-end',
                  }}
                  title={`${interval.name}: ${Math.round(durationSecs / 60)}m @ ${powerLow}-${powerHigh}% FTP`}
                />
              );
            })
          ) : (
            <div className="w-full flex items-center justify-center text-[var(--muted)] text-xs">
              No interval data
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>0:00</span>
          <span>{DISPLAY_DURATION_MINS} min</span>
        </div>
      </div>

      {/* Export Options */}
      <div className="pt-4 border-t border-[var(--border)]">
        <p className="text-xs font-semibold text-[var(--muted)] mb-3">Export</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="text-xs px-3 py-2 rounded bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-black transition-colors">
            📱 Zwift
          </button>
          <button className="text-xs px-3 py-2 rounded bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-black transition-colors">
            ⚙️ Wahoo
          </button>
          <button className="text-xs px-3 py-2 rounded bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-black transition-colors">
            📊 JSON
          </button>
          <button className="text-xs px-3 py-2 rounded bg-[var(--surface)] hover:bg-[var(--accent)] hover:text-black transition-colors">
            🏎️ ERG
          </button>
        </div>
      </div>

      {/* Coach Note */}
      {intervals.length > 0 && (
        (() => {
          const firstInterval = intervals[0];
          const coachNote = firstInterval.coachNote || 
            (firstInterval.coachingNotes?.MIXED) ||
            (firstInterval.coachingNotes?.MOTIVATIONAL) ||
            null;
          
          return coachNote ? (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs italic text-[var(--muted)]">
                💭 "{coachNote}"
              </p>
            </div>
          ) : null;
        })()
      )}
    </div>
  );
}
