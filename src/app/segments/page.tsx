"use client";
import { Suspense } from "react";
import { StravaSegments } from "@/components/StravaSegments";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function SegmentsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <StravaSegments />
        </Suspense>
      </div>
    </main>
  );
}