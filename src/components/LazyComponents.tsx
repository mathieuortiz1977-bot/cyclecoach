"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "./Skeleton";

// Lazy-load heavy components that are below the fold
// This prevents framer-motion from loading in the initial bundle for these

const ChartSkeleton = () => <Skeleton variant="chart" />;
const CardSkeleton = () => <Skeleton variant="card" />;

export const LazyFitnessChart = dynamic(
  () => import("./FitnessChart").then((m) => ({ default: m.FitnessChart })),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyAdaptationPanel = dynamic(
  () => import("./AdaptationPanel").then((m) => ({ default: m.AdaptationPanel })),
  { loading: CardSkeleton, ssr: false }
);

export const LazyFTPProgress = dynamic(
  () => import("./FTPProgress").then((m) => ({ default: m.FTPProgress })),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyStreakCalendar = dynamic(
  () => import("./StreakCalendar").then((m) => ({ default: m.StreakCalendar })),
  { loading: CardSkeleton, ssr: false }
);

export const LazyWeeklyDigest = dynamic(
  () => import("./WeeklyDigest").then((m) => ({ default: m.WeeklyDigest })),
  { loading: CardSkeleton, ssr: false }
);

export const LazyShareCard = dynamic(
  () => import("./ShareCard").then((m) => ({ default: m.ShareCard })),
  { ssr: false }
);

export const LazyWorkoutCompletion = dynamic(
  () => import("./WorkoutCompletion").then((m) => ({ default: m.WorkoutCompletion })),
  { ssr: false }
);
