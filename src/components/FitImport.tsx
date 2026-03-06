"use client";
import { useState, useRef } from "react";

interface ImportResult {
  name: string;
  date: string;
  movingTime: number;
  avgPower?: number;
  normalizedPower?: number;
  avgHr?: number;
  distance: number;
}

export function FitImport() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    setImporting(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data.ride);
      }
    } catch {
      setError("Network error");
    }
    setImporting(false);
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">📁 Import Ride</h2>
          <p className="text-sm text-[var(--muted)]">Upload .fit files from Zwift, Garmin, or Wahoo</p>
        </div>
        <span className="text-2xl">🏋️</span>
      </div>

      <div
        className="border-2 border-dashed border-[var(--card-border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--accent)]"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-[var(--accent)]"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-[var(--accent)]");
          const file = e.dataTransfer.files[0];
          if (file) handleImport(file);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".fit"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
        />
        {importing ? (
          <div className="space-y-2">
            <div className="text-2xl animate-spin inline-block">⏳</div>
            <p className="text-sm text-[var(--muted)]">Parsing...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">📂</div>
            <p className="text-sm text-[var(--foreground)]">Drop .fit file here or click to browse</p>
            <p className="text-xs text-[var(--muted)]">Works with Zwift, Garmin Connect, Wahoo ELEMNT exports</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-green-400">✅ Ride imported!</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <p className="text-[var(--muted)]">Duration</p>
              <p className="font-medium">{Math.round(result.movingTime / 60)} min</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Distance</p>
              <p className="font-medium">{(result.distance / 1000).toFixed(1)} km</p>
            </div>
            {result.avgPower && (
              <div>
                <p className="text-[var(--muted)]">Avg Power</p>
                <p className="font-medium">{result.avgPower}W</p>
              </div>
            )}
            {result.normalizedPower && (
              <div>
                <p className="text-[var(--muted)]">NP</p>
                <p className="font-medium">{result.normalizedPower}W</p>
              </div>
            )}
            {result.avgHr && (
              <div>
                <p className="text-[var(--muted)]">Avg HR</p>
                <p className="font-medium">{result.avgHr} bpm</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
