"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

interface FTPDataPoint {
  date: string;
  ftp: number;
  source: string; // "manual" | "estimated" | "test"
}

interface Props {
  data?: FTPDataPoint[];
  currentFtp: number;
}

export function FTPProgress({ data, currentFtp }: Props) {
  const [ftpHistory, setFtpHistory] = useState<FTPDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load FTP progression data from API
    fetch("/api/rider/ftp-history")
      .then((res) => res.json())
      .then((response) => {
        if (response.history) {
          setFtpHistory(response.history);
        }
        setLoading(false);
      })
      .catch(() => {
        // If API doesn't exist yet, just use current FTP as single data point
        setFtpHistory([{
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          ftp: currentFtp,
          source: "current"
        }]);
        setLoading(false);
      });
  }, [currentFtp]);

  const chartData = data || ftpHistory;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 text-center"
      >
        <div className="mb-4">
          <span className="text-4xl mb-2 block">📈</span>
          <h2 className="text-lg font-semibold mb-2">FTP Progression</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Track your power improvements over time
          </p>
        </div>
        
        <div className="bg-[var(--background)]/50 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">{currentFtp}W</div>
            <div className="text-xs text-[var(--muted)]">Current FTP</div>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Complete workouts with power data or update your FTP manually to see progression here.
          </p>
        </div>
      </motion.div>
    );
  }

  if (chartData.length === 1) {
    // Show single data point state
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">FTP Progression</h2>
            <p className="text-sm text-[var(--muted)]">Starting to track your power</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--accent)]">{currentFtp}W</p>
            <p className="text-xs text-[var(--muted)]">Current FTP</p>
          </div>
        </div>

        <div className="bg-[var(--background)]/50 rounded-xl p-4 text-center">
          <p className="text-sm text-[var(--muted)]">
            📊 Complete more workouts to see your progression chart
          </p>
        </div>
      </motion.div>
    );
  }

  // Show full chart with progression
  const minFtp = Math.min(...chartData.map((d) => d.ftp)) - 5;
  const maxFtp = Math.max(...chartData.map((d) => d.ftp)) + 5;
  const firstFtp = chartData[0]?.ftp || currentFtp;
  const gain = currentFtp - firstFtp;
  const gainPct = firstFtp > 0 ? ((gain / firstFtp) * 100).toFixed(1) : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">FTP Progression</h2>
          <p className="text-sm text-[var(--muted)]">
            {gain >= 0 ? `+${gain}W (+${gainPct}%)` : `${gain}W (${gainPct}%)`} over time
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--accent)]">{currentFtp}W</p>
          <p className="text-xs text-[var(--muted)]">Current FTP</p>
        </div>
      </div>

      <div className="h-48 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ftpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minFtp, maxFtp]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 17, 17, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              formatter={(value) => [`${value}W`, "FTP"]}
            />
            <ReferenceLine 
              y={currentFtp} 
              stroke="var(--accent)" 
              strokeDasharray="4 4" 
              strokeOpacity={0.5} 
            />
            <Area 
              type="monotone" 
              dataKey="ftp" 
              stroke="#f97316" 
              strokeWidth={2} 
              fill="url(#ftpGradient)" 
              dot={{ fill: "#f97316", r: 3 }} 
              activeDot={{ r: 5, fill: "#f97316" }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}