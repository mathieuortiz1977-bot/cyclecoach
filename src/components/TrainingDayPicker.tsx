"use client";

// Add slider styling
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--background);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--background);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-webkit-slider-track {
    background: var(--card-border);
    border-radius: 4px;
  }
  
  .slider::-moz-range-track {
    background: var(--card-border);
    border-radius: 4px;
  }
`;

const ALL_DAYS = [
  { key: "MON", label: "Monday", short: "Mon" },
  { key: "TUE", label: "Tuesday", short: "Tue" },
  { key: "WED", label: "Wednesday", short: "Wed" },
  { key: "THU", label: "Thursday", short: "Thu" },
  { key: "FRI", label: "Friday", short: "Fri" },
  { key: "SAT", label: "Saturday", short: "Sat" },
  { key: "SUN", label: "Sunday", short: "Sun" },
];

interface Props {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  outdoorDay: string;
  onOutdoorDayChange: (day: string) => void;
  sundayDuration: number;
  onSundayDurationChange: (duration: number) => void;
}

export function TrainingDayPicker({ selectedDays, onChange, outdoorDay, onOutdoorDayChange, sundayDuration, onSundayDurationChange }: Props) {
  const toggle = (day: string) => {
    if (selectedDays.includes(day)) {
      // Don't allow less than 3 days
      if (selectedDays.length <= 3) return;
      const next = selectedDays.filter((d) => d !== day);
      // If removing the outdoor day, reset it
      if (day === outdoorDay) {
        onOutdoorDayChange(next.includes("SAT") ? "SAT" : next[next.length - 1]);
      }
      onChange(next);
    } else {
      // Don't allow more than 6 days
      if (selectedDays.length >= 6) return;
      onChange([...selectedDays, day]);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div className="space-y-4">
      {/* Day selection */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">
          Select your training days ({selectedDays.length}/7 — min 3, max 6)
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {ALL_DAYS.map((day) => {
            const selected = selectedDays.includes(day.key);
            const isOutdoor = day.key === outdoorDay;
            return (
              <button
                key={day.key}
                onClick={() => toggle(day.key)}
                className={`relative flex flex-col items-center py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all border ${
                  selected
                    ? isOutdoor
                      ? "border-green-500 bg-green-500/15 text-green-400"
                      : "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                <span className="text-[10px] md:text-xs">{day.short}</span>
                {selected && (
                  <span className="text-[9px] mt-0.5">
                    {isOutdoor ? "🌄" : "🏠"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outdoor day selection */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">
          Which day is your long outdoor ride? 🌄
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedDays.map((day) => {
            const dayInfo = ALL_DAYS.find((d) => d.key === day)!;
            return (
              <button
                key={day}
                onClick={() => onOutdoorDayChange(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  outdoorDay === day
                    ? "border-green-500 bg-green-500/15 text-green-400"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                {dayInfo.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--muted)] mt-1.5">
          All other selected days will be indoor sessions (50–90 min). The outdoor day is a free ride (100km+).
        </p>
      </div>

      {/* Sunday Duration Slider - only show when Sunday is selected */}
      {selectedDays.includes("SUN") && (
        <div>
          <label className="block text-sm text-[var(--muted)] mb-2">
            🕐 Average Sunday Ride Duration
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="60"
                max="180"
                step="15"
                value={sundayDuration}
                onChange={(e) => onSundayDurationChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-medium text-[var(--accent)] min-w-[4rem]">
                {Math.floor(sundayDuration / 60)}h {sundayDuration % 60}m
              </span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>1h</span>
              <span className="text-[var(--foreground)]">Perfect for long Sunday rides</span>
              <span>3h</span>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5">
            Set your typical Sunday ride duration for better training plan customization.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-[var(--background)] rounded-lg p-3 text-xs text-[var(--muted)] space-y-1">
        <p><strong className="text-[var(--foreground)]">{selectedDays.length - 1}</strong> indoor sessions + <strong className="text-green-400">1</strong> outdoor ride per week</p>
        <p>
          Rest days: {ALL_DAYS.filter((d) => !selectedDays.includes(d.key)).map((d) => d.short).join(", ") || "None (not recommended!)"}
        </p>
      </div>
    </div>
    </>
  );
}
