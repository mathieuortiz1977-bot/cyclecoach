'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { WorkoutData, StravaActivity } from '@/types';

/**
 * TrainingDataContext provides global access to workout and Strava activity data
 * Eliminates prop drilling for training history across the app
 */

interface TrainingDataContextType {
  workouts: WorkoutData[];
  activities: StravaActivity[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncStrava: () => Promise<void>;
  refetchWorkouts: () => Promise<void>;
  refetchActivities: () => Promise<void>;
  addWorkout: (workout: Partial<WorkoutData>) => Promise<void>;
  cancelWorkout: (id: string, reason: string) => Promise<void>;
  rescheduleWorkout: (id: string, newDate: string) => Promise<void>;
}

const TrainingDataContext = createContext<TrainingDataContextType | undefined>(undefined);

interface TrainingDataProviderProps {
  children: ReactNode;
}

export function TrainingDataProvider({ children }: TrainingDataProviderProps) {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchWorkouts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.workouts.list();
      
      if (response.data?.workouts && Array.isArray(response.data.workouts)) {
        setWorkouts(response.data.workouts);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workouts';
      setError(message);
      console.error('Error loading workouts:', err);
    }
  }, []);

  const refetchActivities = useCallback(async () => {
    try {
      setError(null);
      const response = await api.strava.getActivities();
      
      if (response.data?.activities && Array.isArray(response.data.activities)) {
        setActivities(response.data.activities);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Strava activities';
      setError(message);
      console.error('Error loading activities:', err);
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [workoutResponse, activityResponse] = await Promise.all([
        api.workouts.list(),
        api.strava.getActivities(),
      ]);
      
      if (workoutResponse.data?.workouts) {
        setWorkouts(workoutResponse.data.workouts);
      }
      
      if (activityResponse.data?.activities) {
        setActivities(activityResponse.data.activities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training data');
      console.error('Error loading training data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncStrava = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      const response = await api.strava.sync();
      
      if (response.data?.activities) {
        setActivities(response.data.activities);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync Strava';
      setError(message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  const addWorkout = useCallback(async (workout: Partial<WorkoutData>) => {
    try {
      setError(null);
      const response = await api.workouts.create(workout as any);
      
      if (response.data?.workout) {
        setWorkouts((prev) => [...prev, response.data.workout]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add workout';
      setError(message);
      throw err;
    }
  }, []);

  const cancelWorkout = useCallback(async (id: string, reason: string) => {
    try {
      setError(null);
      await api.workouts.cancel(id, reason);
      // Refetch workouts after cancellation
      await refetchWorkouts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel workout';
      setError(message);
      throw err;
    }
  }, [refetchWorkouts]);

  const rescheduleWorkout = useCallback(async (id: string, newDate: string) => {
    try {
      setError(null);
      await api.workouts.reschedule(id, newDate);
      // Refetch workouts after rescheduling
      await refetchWorkouts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reschedule workout';
      setError(message);
      throw err;
    }
  }, [refetchWorkouts]);

  // Load data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const value: TrainingDataContextType = {
    workouts,
    activities,
    loading,
    syncing,
    error,
    refetch,
    syncStrava,
    refetchWorkouts,
    refetchActivities,
    addWorkout,
    cancelWorkout,
    rescheduleWorkout,
  };

  return (
    <TrainingDataContext.Provider value={value}>
      {children}
    </TrainingDataContext.Provider>
  );
}

/**
 * Hook to access training data context
 * Must be used within TrainingDataProvider
 */
export function useTrainingDataContext() {
  const context = useContext(TrainingDataContext);
  
  if (!context) {
    throw new Error('useTrainingDataContext must be used within TrainingDataProvider');
  }
  
  return context;
}
