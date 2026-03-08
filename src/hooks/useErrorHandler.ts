import { useCallback, useState } from 'react';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  message: string;
}

/**
 * Custom hook for consistent error handling
 * Provides error state management and recovery utilities
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('Error handled:', errorObj);
    setError(errorObj);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (err) {
        handleError(err);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isError: error !== null,
    message: error?.message || '',
    handleError,
    clearError,
    withErrorHandling,
  };
}
