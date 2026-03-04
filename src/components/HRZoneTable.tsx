"use client";
import { calculateHRZonesPercentage, calculateHRZonesKarvonen, calculateHRZonesLTHR, type HRZone } from "@/lib/hr-zones";

interface Props {
  maxHr: number;
  restingHr?: number;
  lthr?: number;
  method: "PERCENTAGE" | "KARVONEN" | "LTHR";
}

export function HRZoneTable({ maxHr, restingHr, lthr, method }: Props) {
  let zones: HRZone[];

  if (method === "LTHR" && lthr) {
    zones = calculateHRZonesLTHR(lthr);
  } else if (method === "KARVONEN" && restingHr) {
    zones = calculateHRZonesKarvonen(maxHr, restingHr);
  } else {
    zones = calculateHRZonesPercentage(maxHr);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--card-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--card-border)]">
            <th className="px-4 py-2 text-left">Zone</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">HR (bpm)</th>
            <th className="px-4 py-2 text-left">Description</th>
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
              <td className="px-4 py-2 font-mono">{z.minHr}–{z.maxHr} bpm</td>
              <td className="px-4 py-2 text-xs text-[var(--muted)]">{z.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
