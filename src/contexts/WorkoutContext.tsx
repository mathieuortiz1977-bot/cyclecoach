'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { useTrainingDataContext } from './TrainingDataContext';
import { useRiderContext } from './RiderContext';
import type { WorkoutData } from '@/types';

/**
 * WorkoutContext - Unified workout state management
 * Consolidates workout data across Dashboard, Calendar, Plan
 * Eliminates data fetching duplication
 */

interface WorkoutStats {
  total: number;
  completed: number;
  completionRate: number;
  avgDuration: number;
  avgPower?: number;
}

interface WorkoutContextType {
  // Data
  workouts: WorkoutData[];
  stats: WorkoutStats;
  loading: boolean;
  error: string | null;

  // Operations
  refetch: () => Promise<void>;
  getWorkoutsForDate: (date: Date) => WorkoutData[];
  getWorkoutsForWeek: (startDate: Date) => WorkoutData[];
  getWorkoutsForMonth: (year: number, month: number) => WorkoutData[];
  
  // Filtering
  filterByCompleted: (completed: boolean) => WorkoutData[];
  filterByType: (type: string) => WorkoutData[];
  filterByDateRange: (startDate: Date, endDate: Date) => WorkoutData[];

  // Actions
  cancelWorkout: (id: string, reason: string) => Promise<void>;
  rescheduleWorkout: (id: string, newDate: string) => Promise<void>;
  addWorkout: (workout: Partial<WorkoutData>) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const { workouts, refetch: refetchData, loading, error, cancelWorkout, rescheduleWorkout, addWorkout } = useTrainingDataContext();
  const { rider } = useRiderContext();
  const [stats, setStats] = useState<WorkoutStats>({
    total: 0,
    completed: 0,
    completionRate: 0,
    avgDuration: 0,
  });

  // Calculate stats whenever workouts change
  useEffect(() => {
    if (workouts.length === 0) {
      setStats({
        total: 0,
        completed: 0,
        completionRate: 0,
        avgDuration: 0,
      });
      return;
    }

    const completed = workouts.filter((w) => w.completed).length;
    const avgDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length;
    const avgPower = workouts.reduce((sum, w) => sum + (w.avgPower || 0), 0) / workouts.filter((w) => w.avgPower).length || undefined;

    setStats({
      total: workouts.length,
      completed,
      completionRate: (completed / workouts.length) * 100,
      avgDuration,
      avgPower,
    });
  }, [workouts]);

  const getWorkoutsForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return workouts.filter((w) => w.date.startsWith(dateStr));
    },
    [workouts]
  );

  const getWorkoutsForWeek = useCallback(
    (startDate: Date) => {
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setDate(end.getDate() + 6);

      return workouts.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= start && workoutDate <= end;
      });
    },
    [workouts]
  );

  const getWorkoutsForMonth = useCallback(
    (year: number, month: number) => {
      return workouts.filter((w) => {
        const date = new Date(w.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
    },
    [workouts]
  );

  const filterByCompleted = useCallback(
    (completed: boolean) => {
      return workouts.filter((w) => w.completed === completed);
    },
    [workouts]
  );

  const filterByType = useCallback(
    (type: string) => {
      return workouts.filter((w) => {
        const workoutType = w.type || w.sessionTitle || '';
        return workoutType.toLowerCase().includes(type.toLowerCase());
      });
    },
    [workouts]
  );

  const filterByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return workouts.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    },
    [workouts]
  );

  const value: WorkoutContextType = {
    workouts,
    stats,
    loading,
    error,
    refetch: refetchData,
    getWorkoutsForDate,
    getWorkoutsForWeek,
    getWorkoutsForMonth,
    filterByCompleted,
    filterByType,
    filterByDateRange,
    cancelWorkout,
    rescheduleWorkout,
    addWorkout,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutContext must be used within WorkoutProvider');
  }
  return context;
}
