import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, getContextualErrorMessage, isRetryable, getRetryDelay } from '@/lib/error-messages';

/**
 * Hook for making API calls with automatic error notifications
 * 
 * Usage:
 * ```tsx
 * const apiWithToast = useApi();
 * 
 * const loadData = async () => {
 *   const response = await apiWithToast.call(
 *     () => api.workouts.list(),
 *     'Load workouts' // operation name for error messages
 *   );
 *   
 *   if (response.success) {
 *     // Use response.data
 *   }
 * };
 * ```
 */
export function useApi() {
  const toast = useToast();

  /**
   * Make an API call with automatic error handling
   * Shows toast on error
   */
  const call = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      operationName: string,
      options?: {
        showSuccess?: boolean;
        showError?: boolean;
        successMessage?: string;
      }
    ) => {
      const { showSuccess = false, showError = true, successMessage } = options || {};

      try {
        const result = await apiCall();

        if (showSuccess) {
          toast.success(successMessage || `${operationName} completed successfully`);
        }

        return result;
      } catch (error) {
        if (showError) {
          const status = (error as any)?.status;
          const message = getContextualErrorMessage(
            status,
            operationName,
            (error as Error)?.message
          );
          toast.error(message);
        }

        throw error;
      }
    },
    [toast]
  );

  /**
   * Make an API call with retry logic
   * Automatically retries on transient failures
   */
  const callWithRetry = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      operationName: string,
      options?: {
        maxRetries?: number;
        showSuccess?: boolean;
        showError?: boolean;
        onRetry?: (attempt: number) => void;
      }
    ) => {
      const { maxRetries = 3, showSuccess = false, showError = true, onRetry } = options || {};

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await apiCall();

          if (attempt > 0 && showSuccess) {
            toast.success(`${operationName} succeeded after ${attempt} retries`);
          }

          return result;
        } catch (error) {
          lastError = error as Error;
          const status = (error as any)?.status;

          if (!isRetryable(status)) {
            // Not retryable, show error immediately
            if (showError) {
              const message = getContextualErrorMessage(
                status,
                operationName,
                lastError.message
              );
              toast.error(message);
            }
            throw error;
          }

          if (attempt < maxRetries) {
            // Will retry
            const delay = getRetryDelay(attempt, status);
            onRetry?.(attempt + 1);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            // Out of retries
            if (showError) {
              const message = getContextualErrorMessage(
                status,
                operationName,
                `${lastError.message} (after ${maxRetries} retries)`
              );
              toast.error(message);
            }
            throw error;
          }
        }
      }

      throw lastError;
    },
    [toast]
  );

  return {
    call,
    callWithRetry,
  };
}

/**
 * Hook for notifying success/error without API call
 * Useful for other async operations
 */
export function useNotification() {
  const toast = useToast();

  const success = useCallback(
    (message: string) => {
      toast.success(message);
    },
    [toast]
  );

  const error = useCallback(
    (message: string | Error, status?: number) => {
      const text = typeof message === 'string' 
        ? message 
        : getErrorMessage(status, message.message);
      toast.error(text);
    },
    [toast]
  );

  const warning = useCallback(
    (message: string) => {
      toast.warning(message);
    },
    [toast]
  );

  const info = useCallback(
    (message: string) => {
      toast.info(message);
    },
    [toast]
  );

  return { success, error, warning, info };
}
