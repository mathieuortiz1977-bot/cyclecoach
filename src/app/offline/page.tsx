"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center space-y-4">
        <span className="text-6xl">🚴‍♂️💨</span>
        <h1 className="text-2xl font-bold">You're Offline</h1>
        <p className="text-[var(--muted)] max-w-sm">
          No internet connection. Your training plan is cached — check back when you're connected for live data.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
