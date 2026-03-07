import { useState, useEffect } from "react";

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

  const fetchRider = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/rider");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rider");
      }
      
      setRider(data.rider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRider();
  }, []);

  return { rider, loading, error, refetch: fetchRider };
}

export default useRider;