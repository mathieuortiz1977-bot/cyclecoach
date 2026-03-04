"use client";
import { calculateZones } from "@/lib/zones";

export function ZoneTable({ ftp }: { ftp: number }) {
  const zones = calculateZones(ftp);
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--card-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--card-border)]">
            <th className="px-4 py-2 text-left">Zone</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">% FTP</th>
            <th className="px-4 py-2 text-left">Power (W)</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.zone} className="border-t border-[var(--card-border)]">
              <td className="px-4 py-2">
                <span
                  className="inline-block w-8 h-8 rounded-md text-center leading-8 font-bold text-white text-xs"
                  style={{ backgroundColor: z.color }}
                >
                  {z.zone}
                </span>
              </td>
              <td className="px-4 py-2 font-medium">{z.name}</td>
              <td className="px-4 py-2 text-[var(--muted)]">{z.minPct}–{z.maxPct}%</td>
              <td className="px-4 py-2 font-mono">{z.min}–{z.max}W</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
