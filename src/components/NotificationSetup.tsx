"use client";
import { useState, useEffect } from "react";

export function NotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [reminderTime, setReminderTime] = useState("07:00");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("cyclecoach-notifications");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEnabled(parsed.enabled);
      setReminderTime(parsed.reminderTime || "07:00");
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setEnabled(true);
      localStorage.setItem("cyclecoach-notifications", JSON.stringify({ enabled: true, reminderTime }));
      // Show test notification
      new Notification("CycleCoach 🚴", {
        body: "Notifications enabled! You'll get reminders before training days.",
        icon: "/icons/icon-192x192.png",
      });
    }
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("cyclecoach-notifications", JSON.stringify({ enabled: next, reminderTime }));
  };

  const updateTime = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("cyclecoach-notifications", JSON.stringify({ enabled, reminderTime: time }));
  };

  return (
    <div className="glass p-6 space-y-4">
      <h2 className="text-lg font-semibold">🔔 Notifications</h2>

      {permission === "denied" ? (
        <p className="text-sm text-[var(--danger)]">
          Notifications are blocked. Enable them in your browser settings.
        </p>
      ) : permission === "granted" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Training Reminders</p>
              <p className="text-xs text-[var(--muted)]">Get notified before each training day</p>
            </div>
            <button
              onClick={toggleEnabled}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          {enabled && (
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Reminder Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => updateTime(e.target.value)}
                className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={requestPermission}
          className="px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Enable Notifications
        </button>
      )}
    </div>
  );
}
