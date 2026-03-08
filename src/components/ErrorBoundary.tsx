'use client';

import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  level?: 'page' | 'section' | 'component';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches errors in child components and displays a fallback UI
 * Supports different error levels:
 * - 'page': Full page replacement (typically at app level)
 * - 'section': Section-level error with context preserved
 * - 'component': Small inline error message
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    // Call optional error handler (e.g., for error tracking services)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallbacks by level
      const level = this.props.level || 'section';

      if (level === 'page') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="max-w-md w-full mx-auto p-6 space-y-4">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-[var(--danger)]">⚠️</h1>
                <h2 className="text-2xl font-bold mt-4">Something Went Wrong</h2>
                <p className="text-[var(--muted)] mt-2">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>
              </div>

              <div className="bg-[var(--card-border)] rounded-lg p-4 mt-6">
                <p className="text-xs font-mono text-[var(--muted)] break-words">
                  {this.state.error.message}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.reset}
                  className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="flex-1 bg-[var(--card-border)] hover:bg-[var(--foreground)]/10 text-[var(--foreground)] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'section') {
        return (
          <div className="glass p-6 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5">
            <div className="flex gap-4">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--danger)]">Section Error</h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  This section encountered an error and couldn't load properly.
                </p>
                <p className="text-xs font-mono text-[var(--muted)] mt-2 break-words">
                  {this.state.error.message}
                </p>
                <button
                  onClick={this.reset}
                  className="mt-3 text-sm bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white px-3 py-1 rounded transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        );
      }

      // component level (default)
      return (
        <div className="inline-block text-sm text-[var(--danger)]">
          ⚠️ {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
