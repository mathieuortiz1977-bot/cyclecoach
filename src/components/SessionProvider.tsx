"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UpdateBanner } from "@/components/UpdateBanner";
import { ToastContainer } from "@/components/Toast";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ErrorBoundary level="page">
        <UpdateBanner />
        <ToastContainer />
        {children}
      </ErrorBoundary>
    </NextAuthSessionProvider>
  );
}
