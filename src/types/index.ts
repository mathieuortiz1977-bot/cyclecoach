/**
 * Comprehensive TypeScript type definitions for CycleCoach
 * Eliminates all implicit `any` types across the application
 */

// ============================================================================
// TRAINING PLAN TYPES
// ============================================================================

export type BlockType = "BASE" | "THRESHOLD" | "VO2MAX" | "RACE_SIM";
export type WeekType = "BUILD" | "BUILD_PLUS" | "OVERREACH" | "RECOVERY";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface TrainingInterval {
  name: string;
  durationSecs: number;
  powerLow: number;
  powerHigh: number;
  cadenceLow?: number;
  cadenceHigh?: number;
  rpe?: number;
  zone: string;
  purpose: string;
  coachNote: string;
}

export interface TrainingSession {
  dayOfWeek: DayOfWeek;
  sessionType: "INDOOR" | "OUTDOOR";
  duration: number;
  title: string;
  description: string;
  intervals: TrainingInterval[];
  route?: any;
}

export interface TrainingWeek {
  weekNumber: number;
  weekType: WeekType;
  sessions: TrainingSession[];
}

export interface TrainingBlock {
  blockNumber: number;
  type: BlockType;
  weeks: TrainingWeek[];
}

export interface TrainingPlan {
  blocks: TrainingBlock[];
}

// ============================================================================
// WORKOUT TYPES
// ============================================================================

export interface WorkoutSession {
  dayOfWeek: string;
  sessionType: "INDOOR" | "OUTDOOR" | "MIXED";
  duration: number;
  title: string;
  description: string;
  targetPower?: number;
}

export interface CompletedWorkout {
  id: string;
  isProgramSession: boolean;
  sessionTitle: string;
  dayOfWeek: string;
  sessionType: "INDOOR" | "OUTDOOR" | "MIXED";
  plannedDuration: number;
  actualDuration?: number;
  avgPower?: number;
  normalizedPower?: number;
  rpe?: number;
  compliance?: number;
  feelings?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  targetPower?: number;
  hrDrift?: number;
  powerFade?: number;
}

export interface WorkoutData {
  id: string;
  date: string;
  completed: boolean;
  sessionTitle?: string;
  avgPower?: number;
  normalizedPower?: number;
  duration?: number;
  rpe?: number;
  feelings?: string | string[];
  notes?: string;
  compliance?: number;
  plannedSession?: {
    title: string;
    duration: number;
    targetPower: number;
    sessionType: string;
  };
  performanceGrade?: string;
  isProgramSession?: boolean;
  isPlannedSession?: boolean;
  isCancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
  name?: string;
  type?: string;
  distance?: number;
  elevation?: number;
  avgHr?: number;
  maxHr?: number;
  tss?: number;
  mapPolyline?: string;
  averageSpeed?: number;
  kilojoules?: number;
  isStravaRide?: boolean;
  isAutoCompleted?: boolean; // True if Strava ride auto-completed a planned workout
}

// ============================================================================
// STRAVA TYPES
// ============================================================================

export interface StravaSegmentEffort {
  id: string;
  segmentId: string;
  segmentName: string;
  effortTime: number;
  elapsedTime: number;
  prRank: number | null;
  movingTime: number;
  distance: number;
  avgCadence?: number;
  avgWatts?: number;
  deviceWatts?: boolean;
  avgHeartrate?: number;
  maxHeartrate?: number;
}

export interface StravaActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  avgPower?: number;
  normalizedPower?: number;
  duration: number;
  distance: number;
  elevation?: number;
  avgHr?: number;
  maxHr?: number;
  tss?: number;
  mapPolyline?: string;
  averageSpeed?: number;
  kilojoules?: number;
  segment_efforts?: StravaSegmentEffort[];
}

export interface SegmentStat {
  id: string;
  segmentId: string;
  name?: string;
  segmentName: string;
  distance: number;
  avgGrade?: number;
  elevation?: number;
  attempts: number;
  bestTime: number;
  lastAttemptTime?: number;
  improvementPct: number;
  distanceFromPr?: number;
  trend?: number | "improving" | "declining" | "stable";
  formScore: number;
  isPR: boolean;
  activityType?: string;
}

// ============================================================================
// RIDER TYPES
// ============================================================================

export interface RiderProfile {
  id: string;
  ftp: number;
  weight: number;
  experience: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE";
  coachTone: "MIXED" | "MOTIVATIONAL" | "TOUGH_LOVE" | "DATA_DRIVEN";
  maxHr?: number;
  restingHr?: number;
  lthr?: number;
  trainingDays?: string;
  outdoorDay?: string;
  programStartDate?: string;
  sundayDuration?: number;
}

// ============================================================================
// VACATION & RACE EVENT TYPES
// ============================================================================

export interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  type: string; // "FULL_REST" | "LIGHT_TRAINING" | "CROSS_TRAINING" or custom
  duration?: number;
  description?: string;
  location?: string;
  reason?: string;
  analysis?: VacationAnalysis;
  createdAt?: string;
}

export interface VacationAnalysis {
  impact?: string | any;
  recommendations?: string[] | any;
  programAdjustments?: ProgramAdjustment[] | any;
}

export interface RaceEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  priority: "A" | "B" | "C";
  distance?: number | string;
  elevation?: number;
  location?: string;
  description?: string;
  createdAt?: string;
  periodizationAnalysis?: PeriodizationAnalysis;
  peakDate?: string;
  taperWeeks?: number;
  [key: string]: any; // Allow additional properties
}

export interface PeriodizationAnalysis {
  periodization: any; // Can be detailed plan or simplified version
  peakTiming: any;
  programImpact: any;
  shouldRegeneratePlan?: boolean;
  planChangesSummary?: string;
}

export interface PeriodizationPlan {
  basePhase?: string;
  buildPhase?: string;
  peakPhase?: string;
  recoveryPhase?: string;
  taperWeeks?: number;
  peakDate?: string;
  phases?: Record<string, string>;
}

export interface PeakTiming {
  optimalPeakDate: string;
  taperStartDate?: string;
  currentForm?: string;
}

export interface ProgramImpact {
  affectedBlocks?: number;
  affectedSessions?: number;
  estimatedFitnessGain?: string;
}

export interface ProgramAdjustment {
  type: string;
  description: string;
  startDate: string;
  endDate: string;
}

// ============================================================================
// TRAINING PROGRAM TYPES
// ============================================================================

export interface TrainingProgram {
  currentBlock: number;
  currentWeek: number;
  totalBlocks: number;
  totalWeeks: number;
  programStartDate: string;
  programEndDate: string;
  currentFocus: string;
  upcomingGoals: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkoutResponse extends ApiResponse {
  workouts?: CompletedWorkout[];
}

export interface RiderResponse extends ApiResponse {
  rider?: RiderProfile;
}

export interface PlanResponse extends ApiResponse {
  plan?: TrainingPlan;
  source?: "database" | "generated";
}

export interface ActivitiesResponse extends ApiResponse {
  activities?: StravaActivity[];
}

export interface SegmentsResponse extends ApiResponse {
  segments?: SegmentStat[];
  lastSync?: string;
}

export interface VacationsResponse extends ApiResponse {
  vacations?: Vacation[];
}

export interface EventsResponse extends ApiResponse {
  events?: RaceEvent[];
}

// ============================================================================
// FITNESS TRACKING TYPES
// ============================================================================

export interface FitnessMetric {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
  tss?: number;
}

export interface FTPHistory {
  date: string;
  ftp: number;
  source: "current" | "calculated" | "measured";
}

// ============================================================================
// SEGMENT EFFORT TYPES
// ============================================================================

export interface SegmentAttempt {
  date: string;
  time: number;
  effortId: string;
  isFromStrava: boolean;
}

// ============================================================================
// FILTER CALLBACK TYPES (For map/filter operations)
// ============================================================================

export type WorkoutFilter = (workout: CompletedWorkout) => boolean;
export type ActivityFilter = (activity: StravaActivity) => boolean;
export type SessionMapper = (session: TrainingSession) => WorkoutData;
export type BlockMapper = (block: TrainingBlock) => any;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type Theme = "dark" | "light";

// ============================================================================
// CALENDAR DAY TYPES
// ============================================================================

export interface CalendarDay {
  date: Date;
  workout?: WorkoutData | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isTrainingDay: boolean;
  hasStravaRide: boolean;
  hasProgramSession: boolean;
  hasPlannedSession: boolean;
  plannedSession?: any; // Actual planned session object (if exists)
  isAutoCompleted?: boolean; // True if Strava ride auto-completed a planned workout
}
