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
  
  // Calculate total duration: handle both durationSecs and durationPercent
  const totalDurationSecs = intervals.reduce((sum, i: any) => {
    if (i.durationSecs) {
      return sum + i.durationSecs; // Direct seconds value
    } else if (i.durationPercent) {
      // Convert percentage to seconds (based on 60-min display duration)
      return sum + (i.durationPercent / 100) * (DISPLAY_DURATION_MINS * 60);
    }
    return sum;
  }, 0);
  
  const totalDurationMins = Math.round(totalDurationSecs / 60);

  // Calculate max power for chart scaling
  const maxPower = Math.max(...intervals.map(i => i.powerHigh)) || 100;

  return (
    <div className="glass rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow">
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
              ? Math.round(intervals.reduce((sum, i) => sum + ((i.powerLow || 0) + (i.powerHigh || 0)) / 2, 0) / intervals.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Description */}
      {workout.description && (
        <p className="text-sm text-[var(--muted)] line-clamp-2">{workout.description}</p>
      )}

      {/* Interval Chart */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--muted)]">Interval Breakdown</p>
        <div className="flex gap-1 h-16 bg-[var(--surface)] rounded p-2">
          {intervals && intervals.length > 0 ? (
            intervals.map((interval: any, idx) => {
              const color = getZoneColor(interval.zone);
              const powerHigh = interval.powerHigh || 50; // Default to 50% if missing
              const heightPercent = Math.min((powerHigh / maxPower) * 100, 100);
              
              // Calculate width: handle both durationSecs and durationPercent
              let durationSecs = interval.durationSecs || 0;
              if (!durationSecs && interval.durationPercent) {
                durationSecs = (interval.durationPercent / 100) * (DISPLAY_DURATION_MINS * 60);
              }
              // Fallback: if no duration, estimate evenly
              if (!durationSecs) {
                durationSecs = (DISPLAY_DURATION_MINS * 60) / intervals.length;
              }
              
              // BUG #1 FIX: Guard against division by zero
              const totalDurationSecs = totalDurationMins * 60 || (DISPLAY_DURATION_MINS * 60);
              const widthPercent = totalDurationSecs > 0 
                ? (durationSecs / totalDurationSecs) * 100 
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
                  title={`${interval.name}: ${Math.round(durationSecs / 60)}m @ ${interval.powerLow || 0}-${powerHigh}% FTP`}
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
      {intervals.length > 0 && intervals[0].coachNote && (
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-xs italic text-[var(--muted)]">
            💭 "{intervals[0].coachNote}"
          </p>
        </div>
      )}
    </div>
  );
}
