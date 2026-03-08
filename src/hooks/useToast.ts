import { useCallback } from 'react';
import { showToast, dismissToast, dismissAllToasts, type ToastType } from '@/components/Toast';

/**
 * Hook for showing toast notifications
 * 
 * Usage:
 * ```tsx
 * const toast = useToast();
 * 
 * // Show error
 * toast.error('Failed to load data');
 * 
 * // Show success
 * toast.success('Saved successfully!');
 * 
 * // Show warning
 * toast.warning('This action cannot be undone');
 * 
 * // Show info
 * toast.info('Your plan was updated');
 * 
 * // Custom duration (0 = never auto-dismiss)
 * toast.show('Keep this visible', 'info', 0);
 * ```
 */
export function useToast() {
  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    return showToast(message, type, duration);
  }, []);

  const success = useCallback((message: string, duration = 3000) => {
    return showToast(message, 'success', duration);
  }, []);

  const error = useCallback((message: string, duration = 5000) => {
    return showToast(message, 'error', duration);
  }, []);

  const warning = useCallback((message: string, duration = 4000) => {
    return showToast(message, 'warning', duration);
  }, []);

  const info = useCallback((message: string, duration = 3000) => {
    return showToast(message, 'info', duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
}
