"use client";
import { AppProviders } from "@/components/AppProviders";

/**
 * SessionProvider - Root provider for the entire app
 * 
 * This now delegates to AppProviders which handles all context setup
 * Kept for backward compatibility with layout.tsx
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
