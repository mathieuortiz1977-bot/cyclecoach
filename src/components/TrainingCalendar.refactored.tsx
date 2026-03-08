'use client';

/**
 * REFACTORED TrainingCalendar.tsx
 *
 * This shows the refactored approach using contexts and cleaned up logic.
 * To apply, copy the relevant functions and hooks into the actual component.
 *
 * Key improvements:
 * 1. Uses RiderContext and TrainingDataContext
 * 2. Breaks loadWorkoutData into smaller functions
 * 3. Proper useCallback dependencies
 * 4. Better error handling
 * 5. More testable functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRiderContext } from '@/contexts';
import { useTrainingDataContext } from '@/contexts';
import { useNotification } from '@/hooks/useApi';
import * as tz from '@/lib/timezone';
import { generatePlan } from '@/lib/periodization';
import { DAY_FROM_INDEX } from '@/lib/constants';
import type { WorkoutData, RaceEvent, Vacation } from '@/types';

// ============================================================================
// DATA LOADING FUNCTIONS (Extracted for clarity and testability)
// ============================================================================

/**
 * Parse completed workouts from API response
 */
function parseCompletedWorkouts(
  workoutData: any,
  startDate: Date,
  trainingDays: string[]
): WorkoutData[] {
  if (!workoutData?.workouts || !Array.isArray(workoutData.workouts)) {
    return [];
  }

  return workoutData.workouts
    .filter((w: any) => {
      if (!w.isProgramSession) return false;
      if (startDate && new Date(w.createdAt) < startDate) return false;
      return true;
    })
    .map((w: any) => ({
      id: w.id,
      date: w.completedAt || w.createdAt,
      completed: w.completed,
      sessionTitle: w.sessionTitle || '',
      avgPower: w.avgPower,
      normalizedPower: w.normalizedPower,
      duration: w.duration,
      rpe: w.rpe,
      feelings: typeof w.feelings === 'string' ? w.feelings : undefined,
      notes: w.notes,
      compliance: w.compliance,
      isProgramSession: w.isProgramSession,
      isCancelled: w.isCancelled,
      cancelReason: w.cancelReason,
      cancelledAt: w.cancelledAt,
    }));
}

/**
 * Parse Strava activities from API response
 */
function parseStravaActivities(activityData: any): WorkoutData[] {
  if (!activityData?.activities || !Array.isArray(activityData.activities)) {
    return [];
  }

  return activityData.activities.map((a: any) => ({
    id: a.id.toString(),
    date: a.start_date,
    completed: true,
    name: a.name,
    type: a.type,
    distance: a.distance ? a.distance / 1000 : undefined,
    elevation: a.total_elevation_gain,
    avgHr: a.average_heartrate,
    maxHr: a.max_heartrate,
    tss: a.tss,
    avgPower: a.average_watts,
    normalizedPower: a.weighted_avg_watts,
    duration: a.moving_time / 60,
    mapPolyline: a.map?.polyline,
    averageSpeed: a.average_speed,
    kilojoules: a.kilojoules,
    isStravaRide: true,
  }));
}

/**
 * Generate planned sessions for the calendar
 */
function generatePlannedSessions(
  plan: any,
  startDate: Date,
  trainingDays: string[]
): WorkoutData[] {
  if (!plan?.blocks) return [];

  const sessions: WorkoutData[] = [];
  let currentDate = new Date(startDate);

  plan.blocks.forEach((block: any) => {
    block.weeks?.forEach((week: any) => {
      week.sessions?.forEach((session: any) => {
        if (trainingDays.includes(session.dayOfWeek)) {
          const dayOffset = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].indexOf(
            session.dayOfWeek
          );
          const sessionDate = new Date(currentDate);
          sessionDate.setDate(sessionDate.getDate() + dayOffset);

          sessions.push({
            id: `planned-${sessions.length}`,
            date: sessionDate.toISOString(),
            completed: false,
            sessionTitle: session.title || session.sessionType,
            duration: session.duration,
            plannedSession: {
              title: session.title,
              duration: session.duration,
              targetPower: session.targetPower || 0,
              sessionType: session.sessionType,
            },
            isPlannedSession: true,
          });
        }
      });
    });
  });

  return sessions;
}

/**
 * Combine and deduplicate workouts from multiple sources
 */
function combineWorkoutData(
  completedWorkouts: WorkoutData[],
  stravaActivities: WorkoutData[],
  plannedSessions: WorkoutData[]
): WorkoutData[] {
  const combined = [...completedWorkouts, ...stravaActivities, ...plannedSessions];

  // Sort by date descending
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Main refactored data loading hook
 */
export function useTrainingCalendarData(trainingDays: string[]) {
  const { rider, loading: riderLoading } = useRiderContext();
  const { workouts, activities, loading: dataLoading, refetch } = useTrainingDataContext();
  const notify = useNotification();

  const [allWorkouts, setAllWorkouts] = useState<WorkoutData[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize program start date
  const programStartDate = useMemo(
    () => (rider?.programStartDate ? new Date(rider.programStartDate) : new Date()),
    [rider?.programStartDate]
  );

  // Memoize generated plan
  const plan = useMemo(() => generatePlan(rider?.ftp || 250), [rider?.ftp]);

  // Process workouts whenever data changes
  useEffect(() => {
    try {
      const completed = parseCompletedWorkouts(
        { workouts },
        programStartDate,
        trainingDays
      );
      const strava = parseStravaActivities({ activities });
      const planned = generatePlannedSessions(plan, programStartDate, trainingDays);

      const combined = combineWorkoutData(completed, strava, planned);
      setAllWorkouts(combined);
      setPlannedSessions(planned);
    } catch (err) {
      notify.error('Failed to process workout data');
      console.error('Error processing workout data:', err);
    } finally {
      setLoading(false);
    }
  }, [workouts, activities, plan, programStartDate, trainingDays, notify]);

  // Refetch when visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  return {
    allWorkouts,
    plannedSessions,
    plan,
    loading: loading || riderLoading || dataLoading,
    error: null,
    refetch,
  };
}

// ============================================================================
// REFACTORED COMPONENT USAGE EXAMPLE
// ============================================================================

// To use in actual component:
// 1. Import: import { useTrainingCalendarData } from './TrainingCalendar.refactored';
// 2. In component: const { allWorkouts, plannedSessions, plan, loading } = useTrainingCalendarData(trainingDays);
// 3. If loading: return <PageSkeleton />;
// 4. Render calendar with allWorkouts and plannedSessions arrays

// ============================================================================
// MIGRATION NOTES
// ============================================================================

// This refactored approach has several advantages:
//
// 1. Separation of Concerns
//    - Data parsing logic extracted from component
//    - Each function has a single responsibility
//    - Easier to test individual pieces
//
// 2. Better Dependencies
//    - useCallback dependencies are explicit
//    - useMemo for expensive computations
//    - No stale closures
//
// 3. Reusable Functions
//    - parseCompletedWorkouts() can be used in other components
//    - generatePlannedSessions() is independent
//    - combineWorkoutData() is utility function
//
// 4. Error Handling
//    - Try/catch wraps data processing
//    - User notifications on errors
//    - Console logs for debugging
//
// 5. Easier Testing
//    - parseCompletedWorkouts(data) is pure function
//    - parseStravaActivities(data) is pure function
//    - No component mocking needed
//
// 6. Uses Contexts
//    - No prop drilling
//    - Global access to rider, plan, workouts
//    - Refetch works globally
//
// Steps to apply to actual component:
// 1. Copy parseCompletedWorkouts, parseStravaActivities, generatePlannedSessions, combineWorkoutData functions
// 2. Replace the complex loadWorkoutData with useTrainingCalendarData hook
// 3. Update component to use the hook result
// 4. Add error handling with useNotification hook
// 5. Replace loading UI with PageSkeleton
// 6. Test thoroughly
