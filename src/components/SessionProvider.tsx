"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ErrorBoundary level="page">
        {children}
      </ErrorBoundary>
    </NextAuthSessionProvider>
  );
}
