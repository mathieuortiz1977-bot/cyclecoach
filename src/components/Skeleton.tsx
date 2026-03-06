"use client";

interface Props {
  className?: string;
  variant?: "card" | "text" | "circle" | "chart";
}

export function Skeleton({ className = "", variant = "text" }: Props) {
  if (variant === "card") {
    return (
      <div className={`glass p-6 space-y-4 ${className}`}>
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-24 w-full rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-1/4 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={`glass p-6 space-y-4 ${className}`}>
        <div className="skeleton h-4 w-1/4 rounded" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "circle") {
    return <div className={`skeleton rounded-full ${className}`} />;
  }

  return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero skeleton */}
      <div className="glass p-8 space-y-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-1/2 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex gap-4 mt-4">
          <div className="skeleton h-12 w-20 rounded-lg" />
          <div className="skeleton h-12 w-20 rounded-lg" />
          <div className="skeleton h-12 w-20 rounded-lg" />
        </div>
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton variant="card" className="lg:col-span-2" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="chart" className="md:col-span-2" />
      </div>
    </div>
  );
}
