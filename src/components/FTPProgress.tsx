"use client";
import { motion } from "framer-motion";
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

// Generate sample progression data
function generateSampleData(currentFtp: number): FTPDataPoint[] {
  const points: FTPDataPoint[] = [];
  const startFtp = Math.round(currentFtp * 0.85);
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const progress = (12 - i) / 12;
    const noise = (Math.random() - 0.5) * 6;
    const ftp = Math.round(startFtp + (currentFtp - startFtp) * progress + noise);
    points.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ftp: Math.max(ftp, startFtp),
      source: i % 4 === 0 ? "test" : "estimated",
    });
  }

  // Ensure last point is current FTP
  points[points.length - 1].ftp = currentFtp;
  return points;
}

export function FTPProgress({ data, currentFtp }: Props) {
  const chartData = data || generateSampleData(currentFtp);
  const minFtp = Math.min(...chartData.map((d) => d.ftp)) - 5;
  const maxFtp = Math.max(...chartData.map((d) => d.ftp)) + 5;
  const firstFtp = chartData[0]?.ftp || currentFtp;
  const gain = currentFtp - firstFtp;
  const gainPct = ((gain / firstFtp) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--card)] rounded-lg border border-[var(--card-border)] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">FTP Progression</h2>
          <p className="text-sm text-[var(--muted)]">
            {gain >= 0 ? `+${gain}W (+${gainPct}%)` : `${gain}W (${gainPct}%)`} over {chartData.length} weeks
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
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}W`, "FTP"]}
            />
            <ReferenceLine y={currentFtp} stroke="var(--accent)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="ftp" stroke="#f97316" strokeWidth={2} fill="url(#ftpGradient)" dot={{ fill: "#f97316", r: 3 }} activeDot={{ r: 5, fill: "#f97316" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
