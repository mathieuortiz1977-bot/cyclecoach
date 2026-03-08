'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // ms, 0 = never auto-dismiss
}

// Global toast state (can be improved with Context for production)
let toastId = 0;
const toasts: Map<string, Toast> = new Map();
const listeners: Set<(toasts: Toast[]) => void> = new Set();

/**
 * Show a toast notification
 */
export function showToast(message: string, type: ToastType = 'info', duration = 4000): string {
  const id = String(++toastId);
  const toast: Toast = { id, message, type, duration };
  
  toasts.set(id, toast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(id: string): void {
  toasts.delete(id);
  notifyListeners();
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  toasts.clear();
  notifyListeners();
}

/**
 * Subscribe to toast changes
 */
function notifyListeners(): void {
  const current = Array.from(toasts.values());
  listeners.forEach((listener) => listener(current));
}

export function subscribeToToasts(listener: (toasts: Toast[]) => void): () => void {
  listeners.add(listener);
  // Immediately call with current toasts
  listener(Array.from(toasts.values()));
  
  return () => {
    listeners.delete(listener);
  };
}

// ============================================================================
// Toast Container Component
// ============================================================================

export function ToastContainer() {
  const [displayedToasts, setDisplayedToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts(setDisplayedToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {displayedToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Individual Toast Component
// ============================================================================

interface ToastProps {
  toast: Toast;
}

function Toast({ toast }: ToastProps) {
  const { id, message, type } = toast;

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
    info: 'bg-blue-600',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10, x: 100 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="pointer-events-auto mb-3"
    >
      <div className={`${bgColor} text-white rounded-lg p-4 shadow-lg flex items-start gap-3`}>
        <span className="text-lg flex-shrink-0">{icon}</span>
        <p className="text-sm flex-1">{message}</p>
        <button
          onClick={() => dismissToast(id)}
          className="text-white/60 hover:text-white flex-shrink-0 text-lg leading-none transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
