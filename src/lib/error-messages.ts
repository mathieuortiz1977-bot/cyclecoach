/**
 * User-friendly error messages for common API failures
 * Maps HTTP status codes and error types to helpful messages
 */

export interface ApiError {
  status?: number;
  message: string;
  isDev?: boolean; // Whether to show technical details in development
}

/**
 * Get user-friendly error message for HTTP status code
 */
export function getErrorMessage(status: number | undefined, originalMessage?: string): string {
  switch (status) {
    // 400 - Client errors
    case 400:
      return 'Invalid request. Please check your input and try again.';
    
    case 401:
      return 'Your session has expired. Please log in again.';
    
    case 403:
      return 'You do not have permission to perform this action.';
    
    case 404:
      return 'The requested resource was not found.';
    
    case 409:
      return 'This action conflicts with existing data. Please refresh and try again.';
    
    case 422:
      return 'The data you provided is invalid. Please check and try again.';
    
    // 500 - Server errors
    case 500:
      return 'Server error. Please try again later.';
    
    case 502:
      return 'Server is temporarily unavailable. Please try again shortly.';
    
    case 503:
      return 'Service is temporarily down for maintenance. Please try again later.';
    
    // Network errors
    case 0:
    case 503: // Often used for offline
      return 'Network error. Please check your connection and try again.';
    
    // Unknown
    default:
      if (originalMessage) {
        return originalMessage;
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Get contextual error message for specific API operations
 */
export function getContextualErrorMessage(
  status: number | undefined,
  operation: string,
  originalMessage?: string
): string {
  // Check for specific error cases first
  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 403) {
    return `You don't have permission to ${operation}.`;
  }

  if (status === 404) {
    return `The ${operation} failed because the resource was not found. Please refresh and try again.`;
  }

  if (status === 409) {
    return `Cannot ${operation} due to a conflict. Please refresh and try again.`;
  }

  if (status === 422) {
    return `Invalid data for ${operation}. Please check your input and try again.`;
  }

  if (!status || status >= 500) {
    return `Server error during ${operation}. Please try again later.`;
  }

  return getErrorMessage(status, originalMessage);
}

/**
 * Error categories for better error handling
 */
export type ErrorCategory = 'network' | 'auth' | 'permission' | 'notfound' | 'conflict' | 'validation' | 'server' | 'unknown';

/**
 * Categorize error for specific handling
 */
export function categorizeError(status: number | undefined): ErrorCategory {
  if (!status || status === 0) return 'network';
  if (status === 401 || status === 403) return 'auth';
  if (status === 403) return 'permission';
  if (status === 404) return 'notfound';
  if (status === 409) return 'conflict';
  if (status >= 400 && status < 500) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

/**
 * Determine if error is retryable
 */
export function isRetryable(status: number | undefined): boolean {
  if (!status || status === 0) return true; // Network errors are retryable
  if (status === 408) return true; // Request timeout
  if (status === 429) return true; // Rate limit
  if (status >= 500) return true; // Server errors are retryable
  return false;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attempt: number, status?: number): number {
  if (status === 429) {
    // Rate limit: wait longer
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
  
  // Exponential backoff with jitter
  const baseDelay = 1000 * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(baseDelay + jitter, 10000);
}

/**
 * Format error response for logging
 */
export function formatErrorForLogging(
  status: number | undefined,
  message: string,
  context?: Record<string, any>
): string {
  const parts = [];
  
  if (status) {
    parts.push(`[${status}]`);
  }
  
  parts.push(message);
  
  if (context) {
    parts.push(`(${JSON.stringify(context)})`);
  }
  
  return parts.join(' ');
}
