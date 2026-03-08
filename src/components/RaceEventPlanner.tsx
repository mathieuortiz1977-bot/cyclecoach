"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface RaceEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  priority: "A" | "B" | "C";
  location?: string;
  distance?: string;
  description?: string;
  peakDate?: string;
  taperWeeks?: number;
}

interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEventScheduled: (event: RaceEvent) => void;
  existingEvents: RaceEvent[];
  trainingProgram: TrainingProgram;
}

const EVENT_TYPES = [
  { id: "road_race", label: "Road Race", icon: "🚴", description: "Mass start road racing" },
  { id: "time_trial", label: "Time Trial", icon: "⏱️", description: "Individual race against the clock" },
  { id: "criterium", label: "Criterium", icon: "🏁", description: "Short circuit racing" },
  { id: "gran_fondo", label: "Gran Fondo", icon: "🏔️", description: "Long distance sportive" },
  { id: "stage_race", label: "Stage Race", icon: "🎯", description: "Multi-day racing" },
  { id: "cyclocross", label: "Cyclocross", icon: "🌿", description: "Off-road racing" },
  { id: "track", label: "Track Racing", icon: "🏟️", description: "Velodrome racing" },
  { id: "triathlon", label: "Triathlon", icon: "🏊", description: "Multi-sport event" }
];

const PRIORITY_LEVELS = [
  {
    id: "A" as const,
    label: "A Priority",
    description: "Primary goal - full periodization",
    icon: "🥇",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/40"
  },
  {
    id: "B" as const,
    label: "B Priority", 
    description: "Secondary goal - mini peak",
    icon: "🥈",
    color: "text-gray-300",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/40"
  },
  {
    id: "C" as const,
    label: "C Priority",
    description: "Training race - maintain fitness",
    icon: "🥉",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/40"
  }
];

export function RaceEventPlanner({ isOpen, onClose, onEventScheduled, existingEvents, trainingProgram }: Props) {
  const [step, setStep] = useState<"events" | "details" | "priority" | "analysis" | "apply-plan">("events");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("road_race");
  const [eventPriority, setEventPriority] = useState<"A" | "B" | "C">("A");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [periodizationAnalysis, setPeriodizationAnalysis] = useState<any>(null);
  const [isRegeneratingPlan, setIsRegeneratingPlan] = useState(false);
  const [shouldApplyPlanChanges, setShouldApplyPlanChanges] = useState(false);
  const [planChangesSummary, setPlanChangesSummary] = useState<string>("");

  // Count events by priority
  const priorityCounts = {
    A: existingEvents.filter(e => e.priority === "A").length,
    B: existingEvents.filter(e => e.priority === "B").length,
    C: existingEvents.filter(e => e.priority === "C").length
  };

  // Calculate weeks until event
  const weeksUntilEvent = eventDate ? 
    Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0;

  // AI periodization analysis
  const analyzeEventPeriodization = async () => {
    if (!eventDate || !eventName) return;

    setIsAnalyzing(true);
    
    try {
      const response = await api.ai.eventPeriodization({
        event: {
          name: eventName,
          date: eventDate,
          type: eventType,
          priority: eventPriority,
          location,
          distance,
          description,
          weeksUntilEvent
        },
        trainingProgram,
        existingEvents
      });

      if (response.success) {
        setPeriodizationAnalysis(response.data?.analysis || response.data);
        setStep("analysis");
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Periodization analysis failed:", error);
      // Show simplified analysis
      setPeriodizationAnalysis({
        periodization: getSimplePeriodizationPlan(),
        peakTiming: getSimplePeakTiming(),
        programImpact: getSimpleProgramImpact()
      });
      setStep("analysis");
    }
    
    setIsAnalyzing(false);
  };

  // Fallback analysis functions
  const getSimplePeriodizationPlan = () => {
    const tapering = eventPriority === "A" ? 3 : eventPriority === "B" ? 2 : 1;
    const peakDate = new Date(eventDate);
    peakDate.setDate(peakDate.getDate() - 7); // Peak 1 week before
    
    return {
      taperWeeks: tapering,
      peakDate: peakDate.toISOString(),
      phases: {
        base: weeksUntilEvent > 12 ? `${weeksUntilEvent - 8} weeks` : "Minimal",
        build: weeksUntilEvent > 8 ? "4-6 weeks" : "2-3 weeks", 
        peak: `${tapering} weeks`,
        recover: "1-2 weeks post-event"
      }
    };
  };

  const getSimplePeakTiming = () => {
    return {
      optimalPeakDate: new Date(new Date(eventDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      reasoning: eventPriority === "A" 
        ? "Full taper for maximum performance"
        : "Shortened taper to maintain training momentum",
      formPrediction: eventPriority === "A" ? "Peak form expected" : "Good form expected"
    };
  };

  const getSimpleProgramImpact = () => {
    return {
      currentProgramAdjustment: weeksUntilEvent < 12 
        ? "Immediate build phase focus" 
        : "Extend base phase, then targeted build",
      conflictsWith: [],
      recommendations: [
        `Plan ${eventPriority}-priority periodization around ${new Date(eventDate).toLocaleDateString()}`,
        weeksUntilEvent > 16 ? "Plenty of time for full periodization cycle" : "Compressed periodization needed",
        `Target peak form ${Math.floor(weeksUntilEvent - (eventPriority === "A" ? 1 : 0.5))} weeks from now`
      ]
    };
  };

  const handleScheduleEvent = async () => {
    const event: RaceEvent = {
      id: `event-${Date.now()}`,
      name: eventName,
      date: eventDate,
      type: eventType,
      priority: eventPriority,
      location,
      distance,
      description,
      peakDate: periodizationAnalysis?.peakTiming?.optimalPeakDate,
      taperWeeks: periodizationAnalysis?.periodization?.taperWeeks || (eventPriority === "A" ? 3 : eventPriority === "B" ? 2 : 1)
    };

    // Save the event to database
    try {
      const response = await api.events.create(event as any);

      if (!response.success) {
        throw new Error(response.error || "Failed to save event");
      }

      // Check if we should regenerate the plan
      if (periodizationAnalysis?.shouldRegeneratePlan) {
        setShouldApplyPlanChanges(true);
        setPlanChangesSummary(periodizationAnalysis.planChangesSummary || "");
        setStep("apply-plan");
      } else {
        // No plan changes needed, just close
        onEventScheduled(event);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleApplyPlanChanges = async () => {
    setIsRegeneratingPlan(true);
    try {
      const response = await api.plan.regenerate();
      
      if (response.success) {
        onEventScheduled({
          id: `event-${Date.now()}`,
          name: eventName,
          date: eventDate,
          type: eventType,
          priority: eventPriority,
          location,
          distance,
          description,
          peakDate: periodizationAnalysis?.peakTiming?.optimalPeakDate,
          taperWeeks: periodizationAnalysis?.periodization?.taperWeeks || (eventPriority === "A" ? 3 : eventPriority === "B" ? 2 : 1)
        });
        onClose();
        resetForm();
        alert("✅ Race event added and training plan regenerated!");
      } else {
        throw new Error("Failed to regenerate plan");
      }
    } catch (error) {
      console.error("Failed to regenerate plan:", error);
      alert("Plan regeneration failed, but event was saved.");
      onClose();
      resetForm();
    }
    setIsRegeneratingPlan(false);
  };

  const resetForm = () => {
    setStep("events");
    setEventName("");
    setEventDate("");
    setEventType("road_race");
    setEventPriority("A");
    setLocation("");
    setDistance("");
    setDescription("");
    setPeriodizationAnalysis(null);
  };

  const isDateConflicting = (date: string): boolean => {
    const eventDate = new Date(date);
    return existingEvents.some(event => {
      const existingDate = new Date(event.date);
      const diffDays = Math.abs(eventDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays < 14; // Warn if events within 2 weeks
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {step === "events" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🏆 Plan Race Events</h2>
                <p className="text-sm text-[var(--muted)]">
                  Schedule up to 4 racing events and let AI optimize your training peaks
                </p>
              </div>

              <div className="bg-[var(--background)] rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3">📊 Current Event Schedule</h3>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{priorityCounts.A}/2</div>
                    <div className="text-xs text-[var(--muted)]">A Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-300">{priorityCounts.B}/2</div>
                    <div className="text-xs text-[var(--muted)]">B Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-400">{priorityCounts.C}/4</div>
                    <div className="text-xs text-[var(--muted)]">C Priority</div>
                  </div>
                </div>
                
                {existingEvents.length > 0 && (
                  <div className="space-y-2">
                    {existingEvents
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event) => (
                        <div key={event.id} className="bg-[var(--card)] rounded-lg p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span>{PRIORITY_LEVELS.find(p => p.id === event.priority)?.icon}</span>
                              <span className="font-medium">{event.name}</span>
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-xs text-[var(--muted)] mt-1">
                            {EVENT_TYPES.find(t => t.id === event.type)?.label} • {event.priority} Priority
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {existingEvents.length === 0 && (
                  <div className="text-center py-4 text-sm text-[var(--muted)]">
                    No events scheduled yet
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Details</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Event name (e.g., Local Criterium Championships)"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[var(--muted)] mb-1">Event Date</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                        />
                        {weeksUntilEvent > 0 && (
                          <p className="text-xs text-[var(--accent)] mt-1">
                            {weeksUntilEvent} weeks away
                          </p>
                        )}
                        {eventDate && isDateConflicting(eventDate) && (
                          <p className="text-xs text-orange-400 mt-1">
                            ⚠️ Close to existing event
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted)] mb-1">Event Type</label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                        >
                          {EVENT_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {existingEvents.length >= 4 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                    ⚠️ Maximum 4 events per year. Remove an existing event to add a new one.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("details")}
                  disabled={!eventName || !eventDate || existingEvents.length >= 4}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Details
                </button>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">📝 Event Details</h2>
                <p className="text-sm text-[var(--muted)]">
                  Additional information to help AI optimize your training
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Medellín, Colombia"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Distance (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 100km, 40 miles, 1 hour"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    placeholder="Course details, elevation, race strategy notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-medium text-sm text-blue-400 mb-2">🏁 Event Preview</h3>
                <div className="text-sm space-y-1">
                  <p><strong>{eventName}</strong></p>
                  <p className="text-[var(--muted)]">
                    {EVENT_TYPES.find(t => t.id === eventType)?.icon} {EVENT_TYPES.find(t => t.id === eventType)?.label} 
                    {distance && ` • ${distance}`}
                    {location && ` • ${location}`}
                  </p>
                  <p className="text-[var(--muted)]">
                    📅 {new Date(eventDate).toLocaleDateString()} ({weeksUntilEvent} weeks)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("events")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("priority")}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Priority
                </button>
              </div>
            </div>
          )}

          {step === "priority" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🎯 Event Priority</h2>
                <p className="text-sm text-[var(--muted)]">
                  Set the importance level to optimize periodization strategy
                </p>
              </div>

              <div className="space-y-3">
                {PRIORITY_LEVELS.map((priority) => {
                  const isMaxed = 
                    (priority.id === "A" && priorityCounts.A >= 2) ||
                    (priority.id === "B" && priorityCounts.B >= 2) ||
                    (priority.id === "C" && priorityCounts.C >= 4);
                  
                  return (
                    <button
                      key={priority.id}
                      onClick={() => setEventPriority(priority.id)}
                      disabled={isMaxed}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        eventPriority === priority.id
                          ? `${priority.borderColor} ${priority.bgColor}`
                          : "border-[var(--card-border)] hover:border-[var(--muted)]"
                      } ${isMaxed ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{priority.icon}</span>
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm mb-1 ${priority.color}`}>
                            {priority.label}
                            {isMaxed && <span className="ml-2 text-xs text-red-400">(Max reached)</span>}
                          </h3>
                          <p className="text-xs text-[var(--muted)] mb-2">{priority.description}</p>
                          
                          <div className="text-xs text-[var(--muted)]">
                            {priority.id === "A" && `Full periodization: Base → Build → Peak → Taper (3 weeks)`}
                            {priority.id === "B" && `Mini-peak: Focused build → Short taper (2 weeks)`}
                            {priority.id === "C" && `Maintenance: Continue training → Brief freshen (1 week)`}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[var(--background)] rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3">📈 Periodization Preview</h3>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-500/20 rounded">
                    <div className="font-medium text-green-400">BASE</div>
                    <div className="text-[var(--muted)]">
                      {weeksUntilEvent > 12 ? `${weeksUntilEvent - 8}w` : "Short"}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-orange-500/20 rounded">
                    <div className="font-medium text-orange-400">BUILD</div>
                    <div className="text-[var(--muted)]">
                      {weeksUntilEvent > 8 ? "6w" : "3w"}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-red-500/20 rounded">
                    <div className="font-medium text-red-400">PEAK</div>
                    <div className="text-[var(--muted)]">
                      {eventPriority === "A" ? "3w" : eventPriority === "B" ? "2w" : "1w"}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-blue-500/20 rounded">
                    <div className="font-medium text-blue-400">RACE</div>
                    <div className="text-[var(--muted)]">📅</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("details")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={analyzeEventPeriodization}
                  disabled={isAnalyzing || (eventPriority === "A" && priorityCounts.A >= 2) || 
                           (eventPriority === "B" && priorityCounts.B >= 2) || 
                           (eventPriority === "C" && priorityCounts.C >= 4)}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isAnalyzing ? "Analyzing..." : "🤖 Analyze Periodization"}
                </button>
              </div>
            </div>
          )}

          {step === "analysis" && periodizationAnalysis && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🤖 AI Periodization Plan</h2>
                <p className="text-sm text-[var(--muted)]">
                  Optimized training plan for peak performance at {eventName}
                </p>
              </div>

              {periodizationAnalysis.periodization && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">📊 Training Phases</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">Taper Duration:</span>
                      <span className="ml-2 font-medium">{periodizationAnalysis.periodization.taperWeeks} weeks</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Peak Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(periodizationAnalysis.periodization.peakDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="space-y-2">
                        {Object.entries(periodizationAnalysis.periodization.phases).map(([phase, duration]) => (
                          <div key={phase} className="flex justify-between text-xs">
                            <span className="capitalize font-medium">{phase} Phase:</span>
                            <span className="text-[var(--muted)]">{duration as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {periodizationAnalysis.peakTiming && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">🎯 Peak Form Strategy</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">Optimal Peak:</span>
                      <span className="ml-2 font-medium">
                        {new Date(periodizationAnalysis.peakTiming.optimalPeakDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">{periodizationAnalysis.peakTiming.reasoning}</p>
                    <div className="mt-2 px-2 py-1 bg-[var(--accent)]/20 rounded text-xs text-[var(--accent)]">
                      {periodizationAnalysis.peakTiming.formPrediction}
                    </div>
                  </div>
                </div>
              )}

              {periodizationAnalysis.programImpact && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">🔄 Program Adjustments</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-[var(--accent)]">Current Program:</span>
                      <p className="text-sm text-[var(--muted)]">{periodizationAnalysis.programImpact.currentProgramAdjustment}</p>
                    </div>
                    
                    {periodizationAnalysis.programImpact.recommendations && (
                      <div>
                        <span className="text-xs font-medium text-[var(--accent)]">Recommendations:</span>
                        <ul className="space-y-1 mt-1">
                          {periodizationAnalysis.programImpact.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-[var(--muted)] flex items-start gap-2">
                              <span className="text-[var(--accent)]">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("priority")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back to Priority
                </button>
                <button
                  onClick={handleScheduleEvent}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  🏁 Schedule Event
                </button>
              </div>
            </div>
          )}

          {step === "apply-plan" && shouldApplyPlanChanges && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">⚡ Training Program Update</h2>
                <p className="text-sm text-[var(--muted)]">Your race event requires training plan adjustments</p>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span>💡</span> Recommended Changes
                </h3>
                <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">
                  {planChangesSummary || periodizationAnalysis?.planChangesSummary || "Your training program will be regenerated to optimize for this race event."}
                </p>
              </div>

              <div className="bg-[var(--background)] rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">📋 What will happen:</h3>
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Training blocks will be adjusted for optimal periodization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Taper and peak phases will align with race date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Weekly workouts will be regenerated automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Completed workouts will not be affected</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShouldApplyPlanChanges(false);
                    setStep("analysis");
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors border border-[var(--card-border)] rounded-lg"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleApplyPlanChanges}
                  disabled={isRegeneratingPlan}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isRegeneratingPlan ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>⚡ Update Training Plan</>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}