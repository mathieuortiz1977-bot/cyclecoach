'use client';

import type { WorkoutTemplate } from '@/lib/periodization';
import { getZoneColor } from '@/lib/zones';

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  ftp?: number;
}

export function WorkoutCard({ workout, ftp = 200 }: WorkoutCardProps) {
  const intervals = workout.intervals();
  const totalDurationMins = Math.round(
    intervals.reduce((sum, i) => sum + i.durationSecs, 0) / 60
  );

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
          <p className="font-semibold text-[var(--accent)]">{totalDurationMins} min</p>
        </div>
        <div>
          <p className="text-[var(--muted)]">Intervals</p>
          <p className="font-semibold text-[var(--accent)]">{intervals.length}</p>
        </div>
        <div>
          <p className="text-[var(--muted)]">Avg FTP</p>
          <p className="font-semibold text-[var(--accent)]">
            {Math.round(intervals.reduce((sum, i) => sum + (i.powerLow + i.powerHigh) / 2, 0) / intervals.length)}%
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
          {intervals.map((interval, idx) => {
            const color = getZoneColor(interval.zone);
            const heightPercent = (interval.powerHigh / maxPower) * 100;
            const widthPercent = (interval.durationSecs / (totalDurationMins * 60)) * 100;

            return (
              <div
                key={idx}
                className="flex-shrink-0 rounded transition-all hover:opacity-80"
                style={{
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  backgroundColor: color,
                  minWidth: '4px',
                  alignSelf: 'flex-end',
                }}
                title={`${interval.name}: ${Math.round(interval.durationSecs / 60)}m @ ${interval.powerLow}-${interval.powerHigh}% FTP`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>0:00</span>
          <span>{totalDurationMins} min</span>
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
