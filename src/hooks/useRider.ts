import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface Rider {
  id: string;
  ftp: number;
  weight: number;
  experience: string;
  coachTone: string;
  maxHr?: number;
  restingHr?: number;
  lthr?: number;
  trainingDays?: string;
  outdoorDay?: string;
  programStartDate?: string;
}

interface UseRiderReturn {
  rider: Rider | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRider(): UseRiderReturn {
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRider = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.rider.get();
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch rider");
      }
      
      setRider(response.data?.rider || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRider(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRider();
  }, [fetchRider]);

  return { rider, loading, error, refetch: fetchRider };
}

export default useRider;
