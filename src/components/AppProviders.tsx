'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UpdateBanner } from '@/components/UpdateBanner';
import { ToastContainer } from '@/components/Toast';
import {
  RiderProvider,
  PlanProvider,
  TrainingDataProvider,
  UIProvider,
  WorkoutProvider,
} from '@/contexts';

/**
 * AppProviders - Composite root provider
 * 
 * Wraps all context and session providers in the correct order:
 * 1. NextAuth SessionProvider (authentication)
 * 2. ErrorBoundary (error catching)
 * 3. UIProvider (UI state - no dependencies)
 * 4. RiderProvider (rider data)
 * 5. PlanProvider (plan data)
 * 6. TrainingDataProvider (workouts + activities)
 * 7. WorkoutProvider (unified workout operations)
 * 8. Updates & notifications (UpdateBanner, ToastContainer)
 * 
 * Usage in layout.tsx:
 * ```tsx
 * <AppProviders>{children}</AppProviders>
 * ```
 */

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextAuthSessionProvider>
      <ErrorBoundary level="page">
        <UIProvider>
          <RiderProvider>
            <PlanProvider>
              <TrainingDataProvider>
                <WorkoutProvider>
                  <UpdateBanner />
                  <ToastContainer />
                  {children}
                </WorkoutProvider>
              </TrainingDataProvider>
            </PlanProvider>
          </RiderProvider>
        </UIProvider>
      </ErrorBoundary>
    </NextAuthSessionProvider>
  );
}
