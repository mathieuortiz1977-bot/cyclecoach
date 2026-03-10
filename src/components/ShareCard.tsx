"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionDef } from "@/lib/periodization";
import { getZoneColor } from "@/lib/zones";

interface Props {
  session: SessionDef;
  ftp: number;
  rpe?: number;
  compliance?: number;
  onClose: () => void;
}

export function ShareCard({ session, ftp, rpe = 7, compliance = 88, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Ensure intervals is an array (handle edge case where it might be a function)
  const intervalsArray = Array.isArray(session.intervals) ? session.intervals : [];

  const totalSecs = intervalsArray.reduce((s, i) => s + i.durationSecs, 0);
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CycleCoach — ${session.title}`,
          text: `Just completed: ${session.title}\n⚡ FTP: ${ftp}W | RPE: ${rpe}/10 | Compliance: ${compliance}%\n🕐 ${session.duration} min | ${intervalsArray.length} intervals\n\n#CycleCoach #cycling`,
        });
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy text
      const text = `Just completed: ${session.title}\n⚡ FTP: ${ftp}W | RPE: ${rpe}/10 | Compliance: ${compliance}%\n🕐 ${session.duration} min | ${intervalsArray.length} intervals\n\n#CycleCoach #cycling`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          {/* The Card */}
          <div
            ref={cardRef}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a0f05 100%)",
              border: "1px solid rgba(249, 115, 22, 0.2)",
            }}
          >
            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  <span className="text-sm font-bold gradient-text">CycleCoach</span>
                </div>
                <span className="text-xs text-[#6b7280]">{date}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{session.title}</h3>
              <p className="text-xs text-[#6b7280]">{session.sessionType === "OUTDOOR" ? "🌄 Outdoor Ride" : "🏠 Indoor Session"}</p>
            </div>

            {/* Interval visualization */}
            <div className="px-5">
              <div className="flex items-end gap-[2px] h-16 bg-[#111] rounded-lg p-2">
                {intervalsArray.map((interval, idx) => {
                  const widthPct = (interval.durationSecs / totalSecs) * 100;
                  const avgPower = (interval.powerLow + interval.powerHigh) / 2;
                  const heightPct = avgPower > 0 ? Math.min((avgPower / 130) * 100, 100) : 10;
                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${widthPct}%`,
                        height: `${Math.max(heightPct, 8)}%`,
                        backgroundColor: getZoneColor(interval.zone),
                        borderRadius: "2px 2px 0 0",
                        minWidth: "2px",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 p-5">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{session.duration}</p>
                <p className="text-[10px] text-[#6b7280]">minutes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#f97316]">{ftp}</p>
                <p className="text-[10px] text-[#6b7280]">FTP (W)</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{rpe}/10</p>
                <p className="text-[10px] text-[#6b7280]">RPE</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#22c55e]">{compliance}%</p>
                <p className="text-[10px] text-[#6b7280]">compliance</p>
              </div>
            </div>

            {session.route && (
              <div className="px-5 pb-4">
                <div className="bg-[#111] rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
                  <span>🗺️</span>
                  <span className="text-[#6b7280]">{session.route.name}</span>
                  <span className="text-[#6b7280]">·</span>
                  <span className="text-white">{session.route.distance}km</span>
                  <span className="text-[#6b7280]">·</span>
                  <span className="text-white">{session.route.elevation}m ↑</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors text-sm"
            >
              {copied ? "Copied! ✅" : typeof navigator !== "undefined" && "share" in navigator ? "Share 📤" : "Copy Text 📋"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl glass text-[var(--muted)] text-sm hover:text-[var(--foreground)]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
