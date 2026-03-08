"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  type: "complete_break" | "light_activity" | "cross_training";
  description?: string;
  reason?: string;
  location?: string;
}

interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
  upcomingGoals: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVacationScheduled: (vacation: Vacation) => void;
  existingVacations: Vacation[];
  trainingProgram: TrainingProgram;
}

const VACATION_TYPES = [
  {
    id: "complete_break",
    label: "Complete Break",
    description: "No training at all - total rest and recovery",
    icon: "🏖️",
    maintenance: "None - full detraining expected"
  },
  {
    id: "light_activity",
    label: "Light Activity",
    description: "Easy walking, gentle swimming, recreational cycling",
    icon: "🚶",
    maintenance: "Minimal - some fitness retention"
  },
  {
    id: "cross_training",
    label: "Cross Training",
    description: "Running, swimming, hiking - maintain cardiovascular fitness",
    icon: "🏃",
    maintenance: "Moderate - good fitness retention"
  }
];

export function VacationPlanner({ isOpen, onClose, onVacationScheduled, existingVacations, trainingProgram }: Props) {
  const [step, setStep] = useState<"dates" | "type" | "details" | "analysis">("dates");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vacationType, setVacationType] = useState<Vacation['type']>("complete_break");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [programAnalysis, setProgramAnalysis] = useState<any>(null);

  // Calculate vacation duration
  const vacationDays = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  // Analyze program impact
  const analyzeVacationImpact = async () => {
    if (!startDate || !endDate || vacationDays < 3) return;

    setIsAnalyzing(true);
    
    try {
      const response = await api.ai.vacationAnalysis({
        vacation: {
          startDate,
          endDate,
          type: vacationType,
          duration: vacationDays,
          description,
          location
        },
        trainingProgram,
        riderFtp: 250 // This should come from rider context
      });

      if (response.success) {
        setProgramAnalysis(response.data?.analysis || response.data);
        setStep("analysis");
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Vacation analysis failed:", error);
      // Show simplified analysis
      setProgramAnalysis({
        impact: getSimpleImpactAnalysis(),
        recommendations: getSimpleRecommendations(),
        programAdjustments: getSimpleProgramAdjustments()
      });
      setStep("analysis");
    }
    
    setIsAnalyzing(false);
  };

  // Fallback analysis functions
  const getSimpleImpactAnalysis = () => {
    if (vacationDays <= 7) {
      return {
        fitnessLoss: "Minimal (0-5%)",
        detrainingLevel: "Low",
        recoveryTime: "1-2 weeks",
        description: "Short break - minimal fitness impact expected"
      };
    } else if (vacationDays <= 14) {
      return {
        fitnessLoss: "Moderate (5-15%)",
        detrainingLevel: "Moderate", 
        recoveryTime: "2-4 weeks",
        description: "Moderate break - some fitness loss but manageable"
      };
    } else {
      return {
        fitnessLoss: "Significant (15-25%)",
        detrainingLevel: "High",
        recoveryTime: "4-6 weeks",
        description: "Extended break - significant program adjustments needed"
      };
    }
  };

  const getSimpleRecommendations = () => {
    const recs = [];
    
    if (vacationDays >= 7) {
      recs.push("Consider 1-2 light sessions per week if possible");
    }
    if (vacationType === "complete_break") {
      recs.push("Focus on complete rest and recovery");
    }
    if (vacationDays >= 14) {
      recs.push("Plan conservative 2-week ramp-up post-vacation");
    }
    
    return recs;
  };

  const getSimpleProgramAdjustments = () => {
    return {
      preVacation: "Light taper week before departure",
      duringVacation: vacationType === "complete_break" ? "Complete rest" : "Optional light activity",
      postVacation: "2-week progressive ramp-up",
      programExtension: Math.ceil(vacationDays / 7) + " weeks"
    };
  };

  const handleScheduleVacation = () => {
    const vacation: Vacation = {
      id: `vacation-${Date.now()}`,
      startDate,
      endDate,
      type: vacationType,
      description,
      location,
      reason: "Planned vacation"
    };

    onVacationScheduled(vacation);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep("dates");
    setStartDate("");
    setEndDate("");
    setVacationType("complete_break");
    setDescription("");
    setLocation("");
    setProgramAnalysis(null);
  };

  const isDateOverlapping = (start: string, end: string): boolean => {
    return existingVacations.some(vacation => {
      const vStart = new Date(vacation.startDate);
      const vEnd = new Date(vacation.endDate);
      const newStart = new Date(start);
      const newEnd = new Date(end);
      
      return (newStart <= vEnd && newEnd >= vStart);
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
          {step === "dates" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🏖️ Plan Vacation</h2>
                <p className="text-sm text-[var(--muted)]">
                  Schedule extended breaks and let AI adapt your training program
                </p>
              </div>

              <div className="bg-[var(--background)] rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3">📊 Current Program Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--muted)]">Block:</span>
                    <span className="ml-2 font-medium">{trainingProgram.currentBlock}/{trainingProgram.totalBlocks}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Week:</span>
                    <span className="ml-2 font-medium">{trainingProgram.currentWeek}/{trainingProgram.totalWeeks}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--muted)]">Current Focus:</span>
                    <span className="ml-2 font-medium">{trainingProgram.currentFocus}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vacation Dates</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--muted)] mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted)] mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  {vacationDays > 0 && (
                    <p className="text-sm text-[var(--accent)] mt-2">
                      Duration: {vacationDays} day{vacationDays > 1 ? 's' : ''}
                      {vacationDays < 3 && (
                        <span className="text-[var(--muted)] ml-2">(Use cancellation for shorter breaks)</span>
                      )}
                    </p>
                  )}

                  {startDate && endDate && isDateOverlapping(startDate, endDate) && (
                    <p className="text-sm text-red-400 mt-2">
                      ⚠️ Overlaps with existing vacation
                    </p>
                  )}
                </div>

                {existingVacations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Existing Vacations</h4>
                    <div className="space-y-2">
                      {existingVacations.map((vacation) => (
                        <div key={vacation.id} className="bg-[var(--background)] rounded-lg p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>{new Date(vacation.startDate).toLocaleDateString()} - {new Date(vacation.endDate).toLocaleDateString()}</span>
                            <span className="text-xs text-[var(--muted)]">{VACATION_TYPES.find(t => t.id === vacation.type)?.icon}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                  onClick={() => setStep("type")}
                  disabled={!startDate || !endDate || vacationDays < 3 || isDateOverlapping(startDate, endDate)}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Activity Level
                </button>
              </div>
            </div>
          )}

          {step === "type" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🏃 Activity Level</h2>
                <p className="text-sm text-[var(--muted)]">
                  What type of activity do you plan during your {vacationDays}-day break?
                </p>
              </div>

              <div className="space-y-3">
                {VACATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setVacationType(type.id as Vacation['type'])}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      vacationType === type.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{type.label}</h3>
                        <p className="text-xs text-[var(--muted)] mb-2">{type.description}</p>
                        <p className="text-xs text-[var(--accent)]">Fitness retention: {type.maintenance}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("dates")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("details")}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Details
                </button>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">📝 Vacation Details</h2>
                <p className="text-sm text-[var(--muted)]">
                  Optional details to help AI optimize your program adjustments
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Beach in Mexico, Mountain hiking in Colorado..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    placeholder="Any additional context about your vacation activities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-medium text-sm text-blue-400 mb-2">🤖 AI Program Analysis</h3>
                <p className="text-xs text-[var(--muted)]">
                  The AI coach will analyze your vacation timing, current program phase, and activity level 
                  to suggest optimal pre/post-vacation adjustments and program modifications.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("type")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={analyzeVacationImpact}
                  disabled={isAnalyzing}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isAnalyzing ? "Analyzing..." : "🤖 Analyze Impact"}
                </button>
              </div>
            </div>
          )}

          {step === "analysis" && programAnalysis && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🤖 AI Analysis</h2>
                <p className="text-sm text-[var(--muted)]">
                  Smart program adjustments for your {vacationDays}-day vacation
                </p>
              </div>

              {programAnalysis.impact && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">📊 Fitness Impact Assessment</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">Expected Fitness Loss:</span>
                      <span className="ml-2 font-medium">{programAnalysis.impact.fitnessLoss}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Recovery Time:</span>
                      <span className="ml-2 font-medium">{programAnalysis.impact.recoveryTime}</span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[var(--muted)]">{programAnalysis.impact.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {programAnalysis.recommendations && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">💡 AI Recommendations</h3>
                  <ul className="space-y-2">
                    {programAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-[var(--muted)] flex items-start gap-2">
                        <span className="text-[var(--accent)]">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {programAnalysis.programAdjustments && (
                <div className="bg-[var(--background)] rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">🔄 Program Adjustments</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-[var(--accent)]">Pre-Vacation:</span>
                      <p className="text-sm text-[var(--muted)]">{programAnalysis.programAdjustments.preVacation}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[var(--accent)]">During Vacation:</span>
                      <p className="text-sm text-[var(--muted)]">{programAnalysis.programAdjustments.duringVacation}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[var(--accent)]">Post-Vacation:</span>
                      <p className="text-sm text-[var(--muted)]">{programAnalysis.programAdjustments.postVacation}</p>
                    </div>
                    {programAnalysis.programAdjustments.programExtension && (
                      <div>
                        <span className="text-xs font-medium text-[var(--accent)]">Program Extension:</span>
                        <p className="text-sm text-[var(--muted)]">{programAnalysis.programAdjustments.programExtension}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  onClick={() => setStep("details")}
                  className="flex-1 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back to Details
                </button>
                <button
                  onClick={handleScheduleVacation}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  ✅ Schedule Vacation
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}