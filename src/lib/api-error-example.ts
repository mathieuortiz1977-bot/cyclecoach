/**
 * EXAMPLE: How to use API error notifications in components
 * 
 * Delete this file after reviewing - it's just for reference
 */

// ============================================================================
// EXAMPLE 1: Simple error handling in a page
// ============================================================================

/*
'use client';
import { useState } from 'react';
import { useApi, useNotification } from '@/hooks/useApi';
import { api } from '@/lib/api';

export default function MyPage() {
  const [loading, setLoading] = useState(false);
  const apiWithToast = useApi();
  const notify = useNotification();

  const handleLoadData = async () => {
    setLoading(true);
    try {
      // This will show error toast if it fails
      const data = await apiWithToast.call(
        () => api.workouts.list(),
        'Load workouts',
        { showSuccess: true, successMessage: 'Workouts loaded!' }
      );
      // Use data...
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLoadData} disabled={loading}>
      {loading ? 'Loading...' : 'Load Workouts'}
    </button>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Using retry logic for unreliable connections
// ============================================================================

/*
'use client';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';

export function SyncButton() {
  const apiWithToast = useApi();

  const handleSync = async () => {
    try {
      // Will retry up to 3 times on transient failures
      await apiWithToast.callWithRetry(
        () => api.strava.sync(),
        'Sync with Strava',
        {
          maxRetries: 3,
          showSuccess: true,
          onRetry: (attempt) => console.log(`Retrying... attempt ${attempt}`),
        }
      );
    } catch (error) {
      console.error('Sync failed after retries:', error);
    }
  };

  return <button onClick={handleSync}>Sync Strava</button>;
}
*/

// ============================================================================
// EXAMPLE 3: Manual notification for non-API operations
// ============================================================================

/*
'use client';
import { useNotification } from '@/hooks/useApi';

export function SaveButton() {
  const notify = useNotification();

  const handleSave = async () => {
    try {
      // Do some work...
      await someAsyncOperation();
      
      // Show success
      notify.success('Settings saved successfully!');
    } catch (error) {
      // Show error
      notify.error(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
*/

// ============================================================================
// EXAMPLE 4: Handling different error types
// ============================================================================

/*
'use client';
import { useApi, useNotification } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { categorizeError } from '@/lib/error-messages';

export function DeleteButton() {
  const apiWithToast = useApi();
  const notify = useNotification();

  const handleDelete = async (id: string) => {
    try {
      await apiWithToast.call(
        () => api.workouts.cancel(id),
        'Delete workout'
      );
    } catch (error) {
      const errorCategory = categorizeError((error as any)?.status);
      
      // Handle specific error types
      switch (errorCategory) {
        case 'auth':
          // Handle auth error - maybe redirect to login
          notify.warning('Your session expired. Please log in again.');
          break;
        case 'notfound':
          // Item already deleted?
          notify.info('This item was not found. It may have been deleted.');
          break;
        case 'permission':
          // User doesn't have permission
          notify.error('You do not have permission to delete this item.');
          break;
        default:
          // Generic error already shown by useApi
          break;
      }
    }
  };

  return <button onClick={() => handleDelete('123')}>Delete</button>;
}
*/

// ============================================================================
// Notes:
//
// 1. useApi().call() - Simple error handling with toast
//    - Use for most API calls
//    - Automatically shows error toast
//    - Optional success toast
//
// 2. useApi().callWithRetry() - Retry on transient failures
//    - Use for important operations (sync, upload)
//    - Automatically retries 3 times
//    - Waits longer between retries (exponential backoff)
//
// 3. useNotification() - Manual notifications
//    - Use for non-API operations
//    - Use for custom error handling
//    - Use when you need fine-grained control
//
// 4. Error Messages:
//    - getErrorMessage(status) - Generic message
//    - getContextualErrorMessage(status, operation) - Operation-specific message
//    - categorizeError(status) - Get error type for custom handling
// ============================================================================
