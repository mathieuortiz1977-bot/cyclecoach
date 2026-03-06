"use client";
import { useEffect, useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Line,
} from "recharts";
import { getTrainingStatus } from "@/lib/fitness";
import type { DailyMetric } from "@/lib/fitness";

export function FitnessChart() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [source, setSource] = useState<string>("loading");

  useEffect(() => {
    fetch("/api/fitness")
      .then((r) => r.json())
      .then((data) => {
        setMetrics(data.metrics || []);
        setSource(data.source || "unknown");
      })
      .catch(() => {
        // Generate client-side sample if API fails
        import("@/lib/fitness").then(({ generateSamplePMC }) => {
          setMetrics(generateSamplePMC(12));
          setSource("sample");
        });
      });
  }, []);

  if (metrics.length === 0) return null;

  const latest = metrics[metrics.length - 1];
  const status = getTrainingStatus(latest?.tsb || 0);

  // Format dates for display
  const chartData = metrics.map((m) => ({
    ...m,
    dateLabel: new Date(m.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Performance Management Chart</h2>
          <p className="text-xs text-[var(--muted)]">
            {source === "sample" ? "📊 Sample data — connect Strava for real metrics" :
             source === "strava" ? "🟠 Calculated from Strava activities" :
             source === "real" ? "📈 From Strava" : "Loading..."}
          </p>
        </div>
        {latest && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg">{status.emoji}</span>
              <span className="font-semibold" style={{ color: status.color }}>{status.status}</span>
            </div>
            <p className="text-xs text-[var(--muted)]">{status.description}</p>
          </div>
        )}
      </div>

      {/* Current metrics cards */}
      {latest && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">CTL (Fitness)</p>
            <p className="text-xl font-bold text-[#3b82f6]">{latest.ctl}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">ATL (Fatigue)</p>
            <p className="text-xl font-bold text-[#ef4444]">{latest.atl}</p>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-3">
            <p className="text-xs text-[var(--muted)]">TSB (Form)</p>
            <p className="text-xl font-bold" style={{ color: status.color }}>{latest.tsb}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(17, 17, 17, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "#ededed", fontWeight: 600 }}
          />
          <ReferenceLine y={0} stroke="var(--card-border)" />
          <Bar dataKey="tss" fill="var(--card-border)" opacity={0.3} name="Daily TSS" />
          <Line type="monotone" dataKey="ctl" stroke="#3b82f6" strokeWidth={2} dot={false} name="CTL (Fitness)" />
          <Line type="monotone" dataKey="atl" stroke="#ef4444" strokeWidth={2} dot={false} name="ATL (Fatigue)" />
          <Line type="monotone" dataKey="tsb" stroke="#22c55e" strokeWidth={2} dot={false} name="TSB (Form)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
