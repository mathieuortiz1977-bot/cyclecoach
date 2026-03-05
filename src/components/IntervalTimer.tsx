"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { IntervalDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";

interface Props {
  intervals: IntervalDef[];
  ftp: number;
}

type TimerState = "idle" | "running" | "paused" | "finished";

export function IntervalTimer({ intervals, ftp }: Props) {
  const [state, setState] = useState<TimerState>("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0); // seconds elapsed in current interval
  const [totalElapsed, setTotalElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const current = intervals[currentIdx];
  const nextInterval = intervals[currentIdx + 1];
  const totalDuration = intervals.reduce((s, i) => s + i.durationSecs, 0);
  const remaining = current ? current.durationSecs - elapsed : 0;
  const currentDurationRef = useRef(current?.durationSecs ?? 0);
  currentDurationRef.current = current?.durationSecs ?? 0;

  // Beep sound
  const playBeep = useCallback((freq: number = 800, duration: number = 200) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {}
  }, []);

  // Timer tick
  useEffect(() => {
    if (state !== "running") return;

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        setTotalElapsed((t) => t + 1);

        // 3-2-1 countdown beeps
        const remaining = currentDurationRef.current - next;
        if (remaining === 3 || remaining === 2 || remaining === 1) {
          playBeep(600, 100);
        }

        // Interval complete
        if (next >= currentDurationRef.current) {
          playBeep(1000, 400); // Long beep for interval change
          if (currentIdx < intervals.length - 1) {
            setCurrentIdx((i) => i + 1);
            return 0;
          } else {
            setState("finished");
            playBeep(1200, 800); // Victory beep
            return next;
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, currentIdx, current, intervals.length, playBeep]);

  const start = () => setState("running");
  const pause = () => setState("paused");
  const resume = () => setState("running");
  const reset = () => {
    setState("idle");
    setCurrentIdx(0);
    setElapsed(0);
    setTotalElapsed(0);
  };
  const skip = () => {
    if (currentIdx < intervals.length - 1) {
      setCurrentIdx((i) => i + 1);
      setElapsed(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = current ? (elapsed / current.durationSecs) * 100 : 0;
  const totalProgressPct = (totalElapsed / totalDuration) * 100;
  const color = current ? getZoneColor(current.zone) : "#6b7280";
  const wattsLow = current ? Math.round(ftp * current.powerLow / 100) : 0;
  const wattsHigh = current ? Math.round(ftp * current.powerHigh / 100) : 0;

  if (state === "idle") {
    return (
      <button
        onClick={start}
        className="w-full py-4 rounded-lg border-2 border-dashed border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all text-lg font-semibold"
      >
        ▶ Start Workout Timer
      </button>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-xl border border-[var(--card-border)] overflow-hidden">
      {/* Total progress bar */}
      <div className="h-1 bg-[var(--card-border)]">
        <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${totalProgressPct}%` }} />
      </div>

      {/* Main display */}
      <div className="p-6 text-center" style={{ borderLeft: `4px solid ${color}` }}>
        {state === "finished" ? (
          <div className="space-y-4">
            <p className="text-5xl">🎉</p>
            <h2 className="text-2xl font-bold text-[var(--accent)]">Workout Complete!</h2>
            <p className="text-[var(--muted)]">Total time: {formatTime(totalElapsed)}</p>
            <p className="text-sm italic text-[var(--muted)]">&quot;You did the thing. The thing is done. Go eat.&quot;</p>
            <button onClick={reset} className="px-6 py-2 rounded-lg bg-[var(--card-border)] text-sm hover:bg-[var(--muted)] transition-colors">
              Reset
            </button>
          </div>
        ) : (
          <>
            {/* Interval info */}
            <div className="mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: color }}>
                {current.zone}
              </span>
              <h2 className="text-xl font-bold mt-2">{current.name}</h2>
              <p className="text-sm text-[var(--muted)]">
                {currentIdx + 1} of {intervals.length}
                {nextInterval && <span> · Next: {nextInterval.name}</span>}
              </p>
            </div>

            {/* Big timer */}
            <div className="mb-4">
              <p className="text-6xl font-mono font-bold tabular-nums" style={{ color }}>
                {formatTime(remaining)}
              </p>
              <p className="text-sm text-[var(--muted)] mt-1">remaining</p>
            </div>

            {/* Interval progress ring */}
            <div className="h-2 bg-[var(--card-border)] rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%`, backgroundColor: color }}
              />
            </div>

            {/* Targets */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {current.powerHigh > 0 && (
                <div>
                  <p className="text-xs text-[var(--muted)]">Power</p>
                  <p className="text-lg font-bold font-mono" style={{ color }}>
                    {wattsLow}-{wattsHigh}W
                  </p>
                </div>
              )}
              {current.cadenceLow && (
                <div>
                  <p className="text-xs text-[var(--muted)]">Cadence</p>
                  <p className="text-lg font-bold font-mono">{current.cadenceLow}-{current.cadenceHigh}</p>
                </div>
              )}
              {current.rpe && (
                <div>
                  <p className="text-xs text-[var(--muted)]">RPE</p>
                  <p className="text-lg font-bold font-mono">{current.rpe}/10</p>
                </div>
              )}
            </div>

            {/* Coach note */}
            <div className="bg-[var(--card)] rounded-lg px-4 py-3 mb-4 text-sm italic text-left">
              💬 {current.coachNote}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {state === "running" ? (
                <button onClick={pause} className="px-6 py-2 rounded-lg bg-[var(--card-border)] text-sm hover:bg-[var(--muted)] transition-colors">
                  ⏸ Pause
                </button>
              ) : (
                <button onClick={resume} className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors">
                  ▶ Resume
                </button>
              )}
              <button onClick={skip} className="px-6 py-2 rounded-lg bg-[var(--card-border)] text-sm hover:bg-[var(--muted)] transition-colors">
                ⏭ Skip
              </button>
              <button onClick={reset} className="px-6 py-2 rounded-lg bg-[var(--card-border)] text-sm hover:bg-[var(--muted)] transition-colors">
                ⏹ Stop
              </button>
            </div>

            {/* Total time */}
            <p className="text-xs text-[var(--muted)] mt-4">
              Total: {formatTime(totalElapsed)} / {formatTime(totalDuration)}
            </p>
          </>
        )}
      </div>

      {/* Mini interval overview */}
      <div className="flex h-8 border-t border-[var(--card-border)]">
        {intervals.map((interval, idx) => {
          const widthPct = (interval.durationSecs / totalDuration) * 100;
          const isCurrent = idx === currentIdx;
          const isDone = idx < currentIdx;
          return (
            <div
              key={idx}
              className={`relative transition-opacity ${isDone ? "opacity-40" : ""}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: getZoneColor(interval.zone),
                minWidth: "2px",
              }}
            >
              {isCurrent && (
                <div className="absolute inset-0 border-2 border-white animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
