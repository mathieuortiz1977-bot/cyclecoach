'use client';

import { motion } from 'framer-motion';

/**
 * Skeleton loading components for different content types
 * Used while data is loading to provide visual feedback
 */

const skeletonAnimation = {
  initial: { opacity: 0.6 },
  animate: { opacity: 1 },
  transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' as const },
};

// ============================================================================
// GENERIC SKELETON
// ============================================================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  className = '',
  circle = false,
}: SkeletonProps) {
  return (
    <motion.div
      {...skeletonAnimation}
      className={`bg-gray-300 dark:bg-gray-700 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// ============================================================================
// CARD SKELETON
// ============================================================================

export function CardSkeleton() {
  return (
    <div className="p-4 space-y-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <Skeleton width="60%" height="24px" />
      <div className="space-y-3">
        <Skeleton height="16px" />
        <Skeleton width="80%" height="16px" />
        <Skeleton width="70%" height="16px" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton width="40%" height="32px" />
        <Skeleton width="40%" height="32px" />
      </div>
    </div>
  );
}

// ============================================================================
// TEXT SKELETON
// ============================================================================

interface TextSkeletonProps {
  lines?: number;
  lastLineWidth?: string;
}

export function TextSkeleton({ lines = 3, lastLineWidth = '70%' }: TextSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} height="16px" />
      ))}
      <Skeleton height="16px" width={lastLineWidth} />
    </div>
  );
}

// ============================================================================
// AVATAR SKELETON
// ============================================================================

interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: '32px',
  md: '48px',
  lg: '64px',
  xl: '96px',
};

export function AvatarSkeleton({ size = 'md' }: AvatarSkeletonProps) {
  const dimension = sizeMap[size];
  return <Skeleton width={dimension} height={dimension} circle />;
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height="20px" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="grid gap-2 p-4 border border-gray-200 dark:border-gray-800 rounded" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={`cell-${rowIdx}-${colIdx}`} height="16px" width={Math.random() > 0.5 ? '70%' : '100%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// LIST SKELETON
// ============================================================================

interface ListSkeletonProps {
  items?: number;
  hasAvatar?: boolean;
}

export function ListSkeleton({ items = 5, hasAvatar = false }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          {hasAvatar && <AvatarSkeleton size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="16px" />
            <Skeleton width="80%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// GRID SKELETON
// ============================================================================

interface GridSkeletonProps {
  columns?: number;
  items?: number;
}

export function GridSkeleton({ columns = 3, items = 6 }: GridSkeletonProps) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))` }}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// FORM SKELETON
// ============================================================================

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Form fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width="40%" height="16px" />
          <Skeleton height="40px" />
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Skeleton width="30%" height="40px" />
        <Skeleton width="30%" height="40px" />
      </div>
    </div>
  );
}

// ============================================================================
// CHART SKELETON
// ============================================================================

export function ChartSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <Skeleton width="40%" height="20px" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${Math.random() * 80 + 20}px`}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE SKELETON
// ============================================================================

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="50%" height="32px" />
        <Skeleton width="70%" height="16px" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
            <Skeleton width="60%" height="16px" />
            <Skeleton height="24px" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* List */}
      <ListSkeleton items={4} hasAvatar />
    </div>
  );
}
