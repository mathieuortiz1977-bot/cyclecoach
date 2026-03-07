import { useState, useEffect } from "react";

interface PlanInterval {
  duration: number;
  targetPower: number;
  description: string;
}

interface PlanSession {
  dayOfWeek: string;
  sessionType: string;
  duration: number;
  title: string;
  description: string;
  intervals: PlanInterval[];
  targetPower: number;
}

interface PlanWeek {
  weekNumber: number;
  weekType: string;
  sessions: PlanSession[];
}

interface PlanBlock {
  blockNumber: number;
  type: string;
  weeks: PlanWeek[];
}

interface Plan {
  blocks: PlanBlock[];
  totalWeeks: number;
}

interface UsePlanReturn {
  plan: Plan | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlan(): UsePlanReturn {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/plan");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch plan");
      }
      
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return { plan, loading, error, refetch: fetchPlan };
}

export default usePlan;