'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error tracking service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md w-full mx-auto p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--danger)]">⚠️</h1>
          <h2 className="text-2xl font-bold mt-4">Page Error</h2>
          <p className="text-[var(--muted)] mt-2">
            This page encountered an error and couldn't load properly.
          </p>
        </div>

        <div className="bg-[var(--card-border)] rounded-lg p-4">
          <p className="text-xs font-mono text-[var(--muted)] break-words">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="flex-1 text-center bg-[var(--card-border)] hover:bg-[var(--foreground)]/10 text-[var(--foreground)] px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
