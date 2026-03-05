"use client";
import { useEffect, useState } from "react";

export function PWAInstall() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA] SW registered:", reg.scope))
        .catch((err) => console.error("[PWA] SW registration failed:", err));
    }

    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Show install banner after 30 seconds if not installed
    if (!standalone) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 3600 * 1000) {
        const timer = setTimeout(() => setShowBanner(true), 30000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom">
      <div className="bg-[var(--card)] border border-[var(--accent)] rounded-xl p-4 shadow-2xl shadow-orange-500/10">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚴</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">Install CycleCoach</p>
            {isIOS ? (
              <p className="text-xs text-[var(--muted)] mt-1">
                Tap <span className="text-white">Share</span> → <span className="text-white">Add to Home Screen</span> for the full app experience
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-1">
                Install for offline access and a native app experience
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-[var(--muted)] hover:text-white text-lg leading-none">×</button>
        </div>
      </div>
    </div>
  );
}
