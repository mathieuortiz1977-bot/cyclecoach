export interface PowerZone {
  zone: string;
  name: string;
  min: number;
  max: number;
  minPct: number;
  maxPct: number;
  color: string;
}

export function calculateZones(ftp: number): PowerZone[] {
  return [
    { zone: "Z1", name: "Recovery",   minPct: 0,   maxPct: 55,  min: 0,                    max: Math.round(ftp * 0.55), color: "#6b7280" },
    { zone: "Z2", name: "Endurance",  minPct: 56,  maxPct: 75,  min: Math.round(ftp * 0.56), max: Math.round(ftp * 0.75), color: "#3b82f6" },
    { zone: "Z3", name: "Tempo",      minPct: 76,  maxPct: 87,  min: Math.round(ftp * 0.76), max: Math.round(ftp * 0.87), color: "#22c55e" },
    { zone: "Z4", name: "Threshold",  minPct: 88,  maxPct: 95,  min: Math.round(ftp * 0.88), max: Math.round(ftp * 0.95), color: "#eab308" },
    { zone: "Z5", name: "VO2max",     minPct: 96,  maxPct: 120, min: Math.round(ftp * 0.96), max: Math.round(ftp * 1.20), color: "#f97316" },
    { zone: "Z6", name: "Anaerobic",  minPct: 121, maxPct: 150, min: Math.round(ftp * 1.21), max: Math.round(ftp * 1.50), color: "#ef4444" },
  ];
}

export function getZoneColor(zone: string): string {
  const colors: Record<string, string> = {
    Z1: "#6b7280", Z2: "#3b82f6", Z3: "#22c55e",
    Z4: "#eab308", Z5: "#f97316", Z6: "#ef4444",
  };
  return colors[zone] || "#6b7280";
}

/**
 * Get color based on power percentage (handles super-high power like 200%+)
 * @param powerLowPct - Low end of power range (% of FTP)
 * @param powerHighPct - High end of power range (% of FTP)
 * @returns Color hex code
 */
export function getColorForPowerRange(powerLowPct: number, powerHighPct: number): string {
  // Use average power percentage
  const avgPowerPct = (powerLowPct + powerHighPct) / 2;
  
  // For 200%+ FTP (supra-anaerobic), use purple
  if (avgPowerPct >= 200) {
    return "#a855f7"; // Purple for extreme efforts
  }
  
  // For 150-200% FTP, use red
  if (avgPowerPct >= 150) {
    return "#ef4444"; // Red (Anaerobic+)
  }
  
  // Otherwise use standard zone color
  const zone = getZoneForPower(avgPowerPct);
  return getZoneColor(zone);
}

export function getZoneForPower(powerPct: number): string {
  if (powerPct <= 55) return "Z1";
  if (powerPct <= 75) return "Z2";
  if (powerPct <= 87) return "Z3";
  if (powerPct <= 95) return "Z4";
  if (powerPct <= 120) return "Z5";
  return "Z6";
}
