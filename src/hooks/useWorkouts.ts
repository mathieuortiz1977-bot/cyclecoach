import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface Workout {
  id: string;
  date: string;
  sessionTitle?: string;
  avgPower?: number;
  normalizedPower?: number;
  duration?: number;
  actualDuration?: number;
  rpe?: number;
  feelings?: string[];
  notes?: string;
  completed: boolean;
  compliance?: number;
}

interface UseWorkoutsReturn {
  workouts: Workout[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  create: (workout: Partial<Workout>) => Promise<boolean>;
  cancel: (workoutId: string, reason: string) => Promise<boolean>;
  reschedule: (workoutId: string, newDate: string) => Promise<boolean>;
}

export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.workouts.list();
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch workouts");
      }
      
      setWorkouts(response.data?.workouts || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setWorkouts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (workout: Partial<Workout>): Promise<boolean> => {
    try {
      const response = await api.workouts.create(workout as any);
      
      if (!response.success) {
        setError(response.error || "Failed to create workout");
        return false;
      }
      
      // Refetch workouts after creating
      await fetchWorkouts();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, [fetchWorkouts]);

  const cancel = useCallback(async (workoutId: string, reason: string): Promise<boolean> => {
    try {
      const response = await api.workouts.cancel(workoutId, reason);
      
      if (!response.success) {
        setError(response.error || "Failed to cancel workout");
        return false;
      }
      
      // Refetch workouts after cancelling
      await fetchWorkouts();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, [fetchWorkouts]);

  const reschedule = useCallback(async (workoutId: string, newDate: string): Promise<boolean> => {
    try {
      const response = await api.workouts.reschedule(workoutId, newDate);
      
      if (!response.success) {
        setError(response.error || "Failed to reschedule workout");
        return false;
      }
      
      // Refetch workouts after rescheduling
      await fetchWorkouts();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    loading,
    error,
    refetch: fetchWorkouts,
    create,
    cancel,
    reschedule,
  };
}

export default useWorkouts;
