"use client";
import { useState } from "react";
import { generateTrainingEvents, downloadCalendar, generateICS, type CalendarEvent } from "@/lib/calendar-sync";

interface Props {
  plan: any;
  programStartDate: string;
  trainingDays: string[];
}

export function CalendarSync({ plan, programStartDate, trainingDays }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const startDate = new Date(programStartDate);
      const events = generateTrainingEvents(plan, startDate, trainingDays);
      
      downloadCalendar(events, 'cyclecoach-training-plan.ics');
      
      // Show success message briefly
      setTimeout(() => setExporting(false), 2000);
    } catch (error) {
      console.error('Calendar export failed:', error);
      setExporting(false);
    }
  };

  const shareToCalendar = async () => {
    if (navigator.share) {
      try {
        const startDate = new Date(programStartDate);
        const events = generateTrainingEvents(plan, startDate, trainingDays);
        const icsContent = generateICS(events);
        
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const file = new File([blob], 'training-plan.ics', { type: 'text/calendar' });
        
        await navigator.share({
          title: 'CycleCoach Training Plan',
          text: 'My personalized training schedule',
          files: [file]
        });
      } catch (error) {
        // Fallback to download if share fails
        handleExport();
      }
    } else {
      handleExport();
    }
  };

  return (
    <div className="glass p-6 space-y-4">
      <h2 className="text-lg font-semibold">📅 Calendar Integration</h2>
      <p className="text-sm text-[var(--muted)]">
        Sync your training plan with your phone's calendar app.
      </p>

      <div className="space-y-3">
        {/* Export to Calendar */}
        <button
          onClick={shareToCalendar}
          disabled={exporting}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Calendar...
            </>
          ) : (
            <>
              📱 Add to iPhone/Android Calendar
            </>
          )}
        </button>

        {/* Information */}
        <div className="text-xs text-[var(--muted)] space-y-1">
          <p>• Downloads .ics file that works with all calendar apps</p>
          <p>• Includes workout times, descriptions, and indoor/outdoor info</p>
          <p>• Respects your custom training days and start date</p>
          <p>• Updates automatically when you modify your schedule</p>
        </div>
      </div>

      {/* Quick Share Options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'CycleCoach Training Plan',
                text: `My ${plan.blocks?.length * 4}-week cycling training plan starts ${new Date(programStartDate).toLocaleDateString()}`,
                url: window.location.origin
              });
            }
          }}
          className="text-sm bg-[var(--card-border)] hover:bg-[var(--foreground)]/10 px-3 py-2 rounded-lg transition-colors"
        >
          📤 Share Plan Link
        </button>
        
        <button
          onClick={handleExport}
          className="text-sm bg-[var(--card-border)] hover:bg-[var(--foreground)]/10 px-3 py-2 rounded-lg transition-colors"
        >
          💾 Download .ics
        </button>
      </div>
    </div>
  );
}