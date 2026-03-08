/**
 * PERFORMANCE OPTIMIZATION EXAMPLES
 *
 * Examples for implementing performance optimizations:
 * 1. Code Splitting & Lazy Loading
 * 2. Component Memoization
 * 3. Request Deduplication
 * 4. Debouncing & Throttling
 * 5. Resource Preloading
 * 6. Bundle Size Reduction
 *
 * Delete this file after reviewing - it's reference documentation
 */

// ============================================================================
// 1. CODE SPLITTING & LAZY LOADING
// ============================================================================

/*
// Lazy load route components
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/Skeletons';

const DashboardPage = dynamic(
  () => import('./dashboard'),
  {
    loading: () => <PageSkeleton />,
    ssr: true, // Enable SSR for SEO
  }
);

const SettingsPage = dynamic(
  () => import('./settings'),
  {
    loading: () => <PageSkeleton />,
  }
);

// Modal with lazy loaded content
const RaceEventPlanner = dynamic(
  () => import('@/components/RaceEventPlanner'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false, // Client-only modal
  }
);

export default function App() {
  const [page, setPage] = useState('dashboard');

  if (page === 'dashboard') return <DashboardPage />;
  if (page === 'settings') return <SettingsPage />;
  
  return <DashboardPage />; // Lazy-loaded components
}
*/

// ============================================================================
// 2. COMPONENT MEMOIZATION
// ============================================================================

/*
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive component
export const WorkoutCard = memo(function WorkoutCard({ workout }) {
  return (
    <div className="card">
      <h3>{workout.title}</h3>
      <p>{workout.duration} minutes</p>
    </div>
  );
});

// Memoize expensive computation
export function Dashboard({ workouts }) {
  const stats = useMemo(() => {
    return {
      total: workouts.length,
      completed: workouts.filter(w => w.completed).length,
      avgDuration: workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length,
    };
  }, [workouts]);

  // Memoize callback to prevent child re-renders
  const handleDelete = useCallback((id) => {
    // Delete logic...
  }, []);

  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Completed: {stats.completed}</div>
      <WorkoutList workouts={workouts} onDelete={handleDelete} />
    </div>
  );
}
*/

// ============================================================================
// 3. REQUEST DEDUPLICATION
// ============================================================================

/*
import { deduplicateRequest } from '@/lib/performance';

async function loadWorkoutData() {
  // Multiple components requesting same data won't make duplicate API calls
  const workouts = await deduplicateRequest(
    'load-workouts',
    () => api.workouts.list()
  );
  return workouts;
}

// Usage in multiple components:
// Component 1: const workouts = await loadWorkoutData();
// Component 2: const workouts = await loadWorkoutData();
// Result: Only one API call made, both components share result
*/

// ============================================================================
// 4. DEBOUNCING & THROTTLING
// ============================================================================

/*
import { debounce, throttle } from '@/lib/performance';

// Debounce search input (wait until user stops typing)
export function SearchWorkouts() {
  const handleSearch = useCallback(
    debounce((query) => {
      api.workouts.search(query);
    }, 300), // Wait 300ms after last keystroke
    []
  );

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search workouts..."
    />
  );
}

// Throttle scroll events (max once per 100ms)
export function ScrollHandler() {
  const handleScroll = useCallback(
    throttle(() => {
      // Update UI on scroll
    }, 100), // Update at most once per 100ms
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
*/

// ============================================================================
// 5. RESOURCE PRELOADING
// ============================================================================

/*
import { preloadResource, prefetchResource, dnsPrefetch } from '@/lib/performance';

// In your root layout or app component:
export default function RootLayout({ children }) {
  useEffect(() => {
    // Preload critical fonts
    preloadResource('/fonts/inter.woff2', 'font');
    preloadResource('/fonts/mono.woff2', 'font');

    // Prefetch critical pages
    prefetchResource('/api/plan');
    prefetchResource('/api/rider');

    // DNS prefetch for external services
    dnsPrefetch('https://api.strava.com');
    dnsPrefetch('https://fonts.googleapis.com');
  }, []);

  return <>{children}</>;
}
*/

// ============================================================================
// 6. IMAGE OPTIMIZATION
// ============================================================================

/*
import Image from 'next/image';

// Good: Uses Next.js Image component
export function ProfilePicture({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      priority={false} // Set to true for above-fold images
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={85} // Reduce for smaller file size (default 75)
      loading="lazy" // Lazy load below-fold images
    />
  );
}

// Bad: Using regular img tag
// <img src={src} alt={alt} /> // Unoptimized, no lazy loading
*/

// ============================================================================
// 7. BUNDLE SIZE REDUCTION
// ============================================================================

/*
// Instead of importing entire library:
import * as moment from 'moment'; // ~67KB

// Import only what you need:
import { formatDistance } from 'date-fns'; // Smaller & tree-shakeable

// Or use date-fns functions directly:
import formatDistance from 'date-fns/formatDistance'; // ~3KB

// Tree-shaking: Ensure package.json has "sideEffects": false
*/

// ============================================================================
// 8. PERFORMANCE MONITORING
// ============================================================================

/*
import { reportWebVitals, areMetricsHealthy, getMetrics } from '@/lib/performance';

// In pages/_app.tsx or root layout:
export function RootLayout({ children }) {
  useEffect(() => {
    // Report Core Web Vitals
    if ('web-vital' in window) {
      window.addEventListener('web-vital', (e) => {
        reportWebVitals(e.detail);
      });
    }

    // Check metrics periodically
    const interval = setInterval(() => {
      const { healthy, issues } = areMetricsHealthy();
      
      if (!healthy) {
        console.warn('Performance issues:', issues);
        // Send to analytics/monitoring service
      }

      const metrics = getMetrics();
      console.log('Current metrics:', metrics);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
*/

// ============================================================================
// 9. DATABASE QUERY OPTIMIZATION
// ============================================================================

/*
// Bad: N+1 query problem
async function getWorkoutsWithRider() {
  const workouts = await db.workouts.findMany();
  
  // This queries database N times (once per workout)!
  const enriched = await Promise.all(
    workouts.map(async (w) => ({
      ...w,
      rider: await db.rider.findUnique({ where: { id: w.riderId } })
    }))
  );
  
  return enriched;
}

// Good: Use JOIN or include
async function getWorkoutsWithRider() {
  // Single query with JOIN
  return db.workouts.findMany({
    include: { rider: true } // Prisma will handle JOIN
  });
}

// Good: Batch queries
async function getWorkoutsWithRiders(workoutIds: string[]) {
  // Single query for all riders
  const workouts = await db.workouts.findMany({
    where: { id: { in: workoutIds } }
  });
  
  const riderIds = [...new Set(workouts.map(w => w.riderId))];
  const riders = await db.rider.findMany({
    where: { id: { in: riderIds } }
  });
  
  // Combine results
  const riderMap = new Map(riders.map(r => [r.id, r]));
  return workouts.map(w => ({
    ...w,
    rider: riderMap.get(w.riderId)
  }));
}
*/

// ============================================================================
// 10. PERFORMANCE BUDGETS
// ============================================================================

/*
import { checkPerformanceBudget, DEFAULT_BUDGET } from '@/lib/performance';

// In your build process or CI/CD:
export async function checkBuildPerformance(bundleStats) {
  const jsBudget = checkPerformanceBudget('jsBundle', bundleStats.jsSize);
  const cssBudget = checkPerformanceBudget('cssBundle', bundleStats.cssSize);
  
  if (!jsBudget || !cssBudget) {
    console.error('Build exceeded performance budgets');
    process.exit(1);
  }
  
  console.log('✅ Build passed performance budgets');
}

// Custom budgets:
const customBudget = {
  jsBundle: 300, // 300KB
  cssBundle: 60, // 60KB
  imageSize: 150, // 150KB
  apiResponseTime: 400, // 400ms
  renderTime: 16, // 16ms (60fps)
};

const passes = checkPerformanceBudget('jsBundle', 280, customBudget);
*/

// ============================================================================
// KEY PERFORMANCE TIPS
// ============================================================================

/*
1. REDUCE BUNDLE SIZE
   ✅ Use code splitting and lazy loading
   ✅ Remove unused dependencies
   ✅ Use lighter alternatives (date-fns vs moment)
   ✅ Tree-shake unused code
   ✅ Enable compression (gzip, brotli)

2. OPTIMIZE IMAGES
   ✅ Use Next.js Image component
   ✅ Serve modern formats (WebP, AVIF)
   ✅ Set appropriate sizes and quality
   ✅ Lazy load below-fold images
   ✅ Use responsive images

3. CACHE EFFECTIVELY
   ✅ Cache static assets forever
   ✅ Use versioned URLs (_next/static)
   ✅ Set appropriate cache headers
   ✅ Use HTTP caching headers
   ✅ Implement request deduplication

4. OPTIMIZE RENDERING
   ✅ Use useMemo for expensive computations
   ✅ Use useCallback for callbacks
   ✅ Memoize components to prevent re-renders
   ✅ Split large components
   ✅ Use React.lazy for code splitting

5. DATABASE OPTIMIZATION
   ✅ Avoid N+1 queries
   ✅ Use joins instead of separate queries
   ✅ Add database indexes
   ✅ Use pagination for large datasets
   ✅ Cache frequently accessed data

6. NETWORK OPTIMIZATION
   ✅ Debounce high-frequency events
   ✅ Throttle scroll/resize events
   ✅ Deduplicate identical requests
   ✅ Implement request queuing
   ✅ Use compression for APIs

7. MONITORING
   ✅ Track Core Web Vitals
   ✅ Set performance budgets
   ✅ Monitor real user metrics
   ✅ Measure function performance
   ✅ Use bundle analyzers
*/
