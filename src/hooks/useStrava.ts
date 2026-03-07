import { useState, useEffect } from "react";

interface StravaActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: number;
  distance?: number;
  elevation?: number;
  avgPower?: number;
  normalizedPower?: number;
  avgHr?: number;
  maxHr?: number;
  tss?: number;
  mapPolyline?: string;
  averageSpeed?: number;
  kilojoules?: number;
}

interface UseStravaReturn {
  activities: StravaActivity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStrava(): UseStravaReturn {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/strava/activities");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Strava activities");
      }
      
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return { activities, loading, error, refetch: fetchActivities };
}

export default useStrava;