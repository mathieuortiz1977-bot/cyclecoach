'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { TrainingPlan } from '@/types';

/**
 * PlanContext provides global access to training plan data
 * Eliminates prop drilling for plan info across the app
 */

interface PlanContextType {
  plan: TrainingPlan | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  regenerate: (blocks?: number) => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: ReactNode;
}

export function PlanProvider({ children }: PlanProviderProps) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.plan.get();
      
      if (response.data?.plan) {
        setPlan(response.data.plan);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training plan');
      console.error('Error loading plan:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(async (blocks?: number) => {
    try {
      setError(null);
      const response = await api.plan.regenerate(blocks);
      
      if (response.data?.plan) {
        setPlan(response.data.plan);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate plan';
      setError(message);
      throw err;
    }
  }, []);

  // Load plan on mount
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

  const value: PlanContextType = {
    plan,
    loading,
    error,
    refetch,
    regenerate,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

/**
 * Hook to access plan context
 * Must be used within PlanProvider
 */
export function usePlanContext() {
  const context = useContext(PlanContext);
  
  if (!context) {
    throw new Error('usePlanContext must be used within PlanProvider');
  }
  
  return context;
}
