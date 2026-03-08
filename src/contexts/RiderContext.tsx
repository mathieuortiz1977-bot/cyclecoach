'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { RiderProfile } from '@/types';

/**
 * RiderContext provides global access to rider/profile data
 * Eliminates prop drilling for rider info across the app
 */

interface RiderContextType {
  rider: RiderProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateRider: (updates: Partial<RiderProfile>) => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

interface RiderProviderProps {
  children: ReactNode;
}

export function RiderProvider({ children }: RiderProviderProps) {
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.rider.get();
      
      if (response.data?.rider) {
        setRider(response.data.rider);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rider profile');
      console.error('Error loading rider:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRider = useCallback(async (updates: Partial<RiderProfile>) => {
    try {
      setError(null);
      const response = await api.rider.update(updates);
      
      if (response.data?.rider) {
        setRider(response.data.rider);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rider profile';
      setError(message);
      throw err;
    }
  }, []);

  // Load rider on mount
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

  const value: RiderContextType = {
    rider,
    loading,
    error,
    refetch,
    updateRider,
  };

  return (
    <RiderContext.Provider value={value}>
      {children}
    </RiderContext.Provider>
  );
}

/**
 * Hook to access rider context
 * Must be used within RiderProvider
 */
export function useRiderContext() {
  const context = useContext(RiderContext);
  
  if (!context) {
    throw new Error('useRiderContext must be used within RiderProvider');
  }
  
  return context;
}
