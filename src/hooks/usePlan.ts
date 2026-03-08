import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface PlanSession {
  dayOfWeek: string;
  sessionType: string;
  duration: number;
  title: string;
  description: string;
  intervals?: any[];
  route?: any;
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
  totalWeeks?: number;
}

interface UsePlanReturn {
  plan: Plan | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  regenerate: (blocks?: number) => Promise<boolean>;
}

export function usePlan(): UsePlanReturn {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.plan.get();
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch plan");
      }
      
      // Handle nested plan response
      const planData = response.data?.plan || response.data;
      setPlan(planData || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(async (blocks?: number): Promise<boolean> => {
    try {
      const response = await api.plan.regenerate(blocks);
      
      if (!response.success) {
        setError(response.error || "Failed to regenerate plan");
        return false;
      }
      
      // Update plan with new data
      const planData = response.data?.plan || response.data;
      setPlan(planData || null);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch: fetchPlan, regenerate };
}

export default usePlan;
