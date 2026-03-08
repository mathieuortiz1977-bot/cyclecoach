"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UpdateBanner } from "@/components/UpdateBanner";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ErrorBoundary level="page">
        <UpdateBanner />
        {children}
      </ErrorBoundary>
    </NextAuthSessionProvider>
  );
}
