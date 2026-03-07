"use client";
import { useEffect, useRef } from "react";

interface PolylineMapProps {
  polyline: string;
  className?: string;
}

export function PolylineMap({ polyline, className = "w-full h-48" }: PolylineMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!polyline || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Decode Google polyline
    const points = decodePolyline(polyline);
    if (points.length < 2) return;

    // Find bounds
    const bounds = {
      minLat: Math.min(...points.map(p => p[0])),
      maxLat: Math.max(...points.map(p => p[0])),
      minLng: Math.min(...points.map(p => p[1])),
      maxLng: Math.max(...points.map(p => p[1]))
    };

    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Map coordinates to canvas
    const mapPoint = (lat: number, lng: number) => {
      const x = ((lng - bounds.minLng) / lngRange) * rect.width;
      const y = ((bounds.maxLat - lat) / latRange) * rect.height;
      return [x, y];
    };

    // Draw background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw route
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    points.forEach((point, i) => {
      const [x, y] = mapPoint(point[0], point[1]);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw start/end markers
    const startPoint = mapPoint(points[0][0], points[0][1]);
    const endPoint = mapPoint(points[points.length - 1][0], points[points.length - 1][1]);

    // Start marker (green)
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(startPoint[0], startPoint[1], 6, 0, 2 * Math.PI);
    ctx.fill();

    // End marker (red)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(endPoint[0], endPoint[1], 6, 0, 2 * Math.PI);
    ctx.fill();

  }, [polyline]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg bg-gray-900"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}

// Decode Google polyline algorithm
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}