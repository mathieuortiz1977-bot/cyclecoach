import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface StravaActivity {
  id: string;
  name: string;
  type: string;
  startDate: string;
  distance: number;
  elevationGain: number;
  movingTime: number;
  elapsedTime: number;
  avgPower?: number;
  avgHeartrate?: number;
  mapPolyline?: string;
}

interface UseStravaReturn {
  activities: StravaActivity[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  sync: () => Promise<boolean>;
  extractSegments: () => Promise<boolean>;
}

export function useStrava(): UseStravaReturn {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.strava.getActivities();
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch Strava activities");
      }
      
      setActivities(response.data?.activities || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setActivities(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.strava.sync();
      
      if (!response.success) {
        setError(response.error || "Failed to sync Strava");
        return false;
      }
      
      // Refetch activities after sync
      await fetchActivities();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, [fetchActivities]);

  const extractSegments = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.strava.extractSegments();
      
      if (!response.success) {
        setError(response.error || "Failed to extract segments");
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities, sync, extractSegments };
}

export default useStrava;
