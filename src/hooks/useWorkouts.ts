import { useState, useEffect } from "react";

interface WorkoutData {
  id: string;
  completed: boolean;
  sessionTitle: string;
  avgPower?: number;
  actualDuration?: number;
  rpe?: number;
  feelings?: string[];
  notes?: string;
  compliance?: number;
  isProgramSession?: boolean;
  createdAt: string;
  completedAt?: string;
  dayOfWeek?: string;
}

interface UseWorkoutsReturn {
  workouts: WorkoutData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/workouts");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch workouts");
      }
      
      setWorkouts(data.workouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return { workouts, loading, error, refetch: fetchWorkouts };
}

export default useWorkouts;