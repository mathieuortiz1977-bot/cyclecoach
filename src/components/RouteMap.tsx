"use client";
import type { RouteData } from "@/lib/routes";

interface Props {
  route: RouteData;
}

export function RouteMap({ route }: Props) {
  // Build a static map URL using OpenStreetMap tiles
  // For Medellín routes, center on the city
  const lat = 6.2442;
  const lng = -75.5812;
  const zoom = 10;

  // Using OpenStreetMap static map via iframe
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.3}%2C${lat - 0.2}%2C${lng + 0.3}%2C${lat + 0.2}&layer=cyclemap&marker=${lat}%2C${lng}`;

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--card-border)]">
      {/* Map */}
      <div className="relative bg-[var(--card)] h-48 md:h-64">
        <iframe
          src={osmUrl}
          className="w-full h-full border-0 opacity-80"
          loading="lazy"
          title={`Route map: ${route.name}`}
        />
        {/* Overlay with route info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="font-bold text-white text-sm">{route.name}</h3>
          <div className="flex gap-4 text-xs text-white/80 mt-1">
            <span>📏 {route.distance} km</span>
            <span>⛰ {route.elevation} m</span>
            <span>📍 {route.region}</span>
          </div>
        </div>
      </div>

      {/* Elevation profile placeholder */}
      <div className="bg-[var(--card)] p-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
          <span>Elevation Profile</span>
          <span>{route.elevation}m total climbing</span>
        </div>
        <div className="h-12 flex items-end gap-[1px]">
          {generateElevationProfile(route.distance, route.elevation).map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-green-600/40 rounded-t-sm transition-all hover:bg-green-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
          <span>0 km</span>
          <span>{Math.round(route.distance / 2)} km</span>
          <span>{route.distance} km</span>
        </div>
      </div>
    </div>
  );
}

// Generate a fake but realistic-looking elevation profile
function generateElevationProfile(distance: number, totalElevation: number): number[] {
  const points = 40;
  const profile: number[] = [];
  const intensity = totalElevation / 2000; // Higher elevation = more dramatic

  for (let i = 0; i < points; i++) {
    const x = i / points;
    // Create rolling hills with some peaks
    const base = 20 + intensity * 30;
    const hill1 = Math.sin(x * Math.PI * 2) * 25 * intensity;
    const hill2 = Math.sin(x * Math.PI * 4 + 1) * 15 * intensity;
    const peak = x > 0.3 && x < 0.7 ? Math.sin((x - 0.3) / 0.4 * Math.PI) * 40 * intensity : 0;
    const noise = (Math.sin(i * 7.3) * 5);

    profile.push(Math.max(5, Math.min(100, base + hill1 + hill2 + peak + noise)));
  }

  return profile;
}
