# CycleCoach Performance Optimization Guide

## Overview

This guide covers performance optimization strategies implemented in CycleCoach, including:
- Bundle size reduction
- Code splitting & lazy loading
- Caching strategies
- Component memoization
- Request deduplication
- Performance monitoring

## Files

### Core Performance Module
- `src/lib/performance.ts` - Core performance utilities
  - Performance metrics tracking
  - Request deduplication
  - Debouncing & throttling
  - Resource hints (preload, prefetch, dns-prefetch)
  - Memory optimization (object pools)
  - Lazy loading helpers
  - Performance budgets

### Configuration
- `next.config.performance.js` - Recommended Next.js configuration
  - Bundle analysis setup
  - Image optimization
  - Caching headers
  - Webpack optimization
  - SWC minification

### Documentation & Examples
- `src/lib/performance-examples.ts` - Implementation examples
  - Code splitting with dynamic imports
  - Component memoization patterns
  - Request deduplication usage
  - Debouncing & throttling
  - Resource preloading
  - Database query optimization
  - Performance budgets

## Quick Start

### 1. Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check results in generated report
```

### 2. Monitor Performance

```typescript
import { reportWebVitals, areMetricsHealthy } from '@/lib/performance';

// In your root layout
useEffect(() => {
  const interval = setInterval(() => {
    const { healthy, issues } = areMetricsHealthy();
    if (!issues) console.log('Performance is healthy');
    else console.warn('Performance issues:', issues);
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### 3. Lazy Load Components

```typescript
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/Skeletons';

const DashboardPage = dynamic(
  () => import('./dashboard'),
  { loading: () => <PageSkeleton /> }
);
```

### 4. Debounce Search

```typescript
import { debounce } from '@/lib/performance';

const handleSearch = useCallback(
  debounce((query) => api.workouts.search(query), 300),
  []
);
```

## Performance Budgets

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| JS Bundle | < 250KB | TBD |
| CSS Bundle | < 50KB | TBD |
| Images | < 100KB each | TBD |
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| TTFB | < 600ms | TBD |
| API Response | < 500ms | TBD |

### How to Check

```bash
# Run Lighthouse audit
npm run build && npm run start
# Open Chrome DevTools > Lighthouse > Run audit

# Check bundle size
ANALYZE=true npm run build
# Open generated HTML report in .next/analyze

# Monitor real user metrics
# Use Google Analytics 4 with Web Vitals measurement
```

## Optimization Strategies

### 1. Code Splitting

Break code into smaller chunks that load on-demand:

```typescript
// ❌ Bad: Loads all features at once
import Dashboard from './dashboard';
import Settings from './settings';
import Analytics from './analytics';

// ✅ Good: Load only when needed
const Dashboard = dynamic(() => import('./dashboard'));
const Settings = dynamic(() => import('./settings'));
const Analytics = dynamic(() => import('./analytics'));
```

### 2. Image Optimization

Use Next.js Image component with proper sizing:

```typescript
// ❌ Bad: Unoptimized, no lazy loading
<img src="/activity.png" alt="Activity" />

// ✅ Good: Optimized, lazy-loaded
<Image
  src="/activity.png"
  alt="Activity"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### 3. Component Memoization

Prevent unnecessary re-renders:

```typescript
// ❌ Bad: Recalculates on every render
function Dashboard({ workouts }) {
  const stats = {
    total: workouts.length,
    completed: workouts.filter(w => w.completed).length,
  };
  return <div>{stats.total}</div>;
}

// ✅ Good: Memoized computation
function Dashboard({ workouts }) {
  const stats = useMemo(() => ({
    total: workouts.length,
    completed: workouts.filter(w => w.completed).length,
  }), [workouts]);
  return <div>{stats.total}</div>;
}
```

### 4. Request Deduplication

Prevent duplicate API calls:

```typescript
import { deduplicateRequest } from '@/lib/performance';

// Multiple callers, single request
const data = await deduplicateRequest(
  'load-workouts',
  () => api.workouts.list()
);
```

### 5. Debouncing & Throttling

Reduce event handler calls:

```typescript
import { debounce, throttle } from '@/lib/performance';

// Debounce: Wait for user to stop typing
const search = debounce((query) => api.search(query), 300);

// Throttle: Limit scroll updates
const handleScroll = throttle(() => updateUI(), 100);
```

### 6. Resource Preloading

Preload critical resources:

```typescript
import { preloadResource, prefetchResource } from '@/lib/performance';

// Preload fonts
preloadResource('/fonts/inter.woff2', 'font');

// Prefetch pages
prefetchResource('/api/plan');
```

### 7. Caching

Implement proper cache headers:

```
// Static assets (forever)
Cache-Control: public, max-age=31536000, immutable

// API responses (1 minute + CDN cache)
Cache-Control: public, max-age=60, s-maxage=120

// HTML pages (always validate)
Cache-Control: public, max-age=0, must-revalidate
```

## Monitoring

### Core Web Vitals

Track essential performance metrics:

```typescript
import { reportWebVitals } from '@/lib/performance';

// Report when metrics are available
export function reportWebVitals(metric) {
  reportWebVitals({
    name: metric.name,      // LCP, FID, CLS, FCP, TTFB
    value: metric.value,    // actual value in milliseconds
    rating: metric.rating,  // 'good', 'needs-improvement', 'poor'
  });
}
```

### Performance Budgets

Set and enforce limits:

```typescript
import { checkPerformanceBudget } from '@/lib/performance';

// Check if bundle meets budget
const passes = checkPerformanceBudget(
  'jsBundle',
  bundleSize,
  { jsBundle: 250 } // 250KB budget
);

if (!passes) {
  console.error('Bundle exceeds performance budget');
}
```

## Database Optimization

### Avoid N+1 Queries

```typescript
// ❌ Bad: Multiple database queries
const workouts = await db.workouts.findMany();
const enriched = await Promise.all(
  workouts.map(w => db.rider.findUnique({ where: { id: w.riderId } }))
);

// ✅ Good: Single query with JOIN
const enriched = await db.workouts.findMany({
  include: { rider: true }
});
```

### Use Indexes

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);
```

## Tools

### Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

Then set `ANALYZE=true npm run build` to generate report.

### Lighthouse

- Chrome DevTools > Lighthouse tab
- Run audit for Performance, Accessibility, Best Practices, SEO

### Web Vitals

```bash
npm install web-vitals
```

## Checklist

- [ ] Run bundle analyzer and identify large chunks
- [ ] Implement code splitting for route components
- [ ] Convert large images to next/image
- [ ] Set performance budgets in CI/CD
- [ ] Monitor Core Web Vitals with analytics
- [ ] Implement caching headers
- [ ] Use request deduplication for API calls
- [ ] Memoize expensive computations
- [ ] Profile slow pages with DevTools
- [ ] Set up performance monitoring

## References

- [Next.js Performance Optimization](https://nextjs.org/learn/seo/web-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis](https://nextjs.org/docs/advanced-features/bundle-analysis)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)

## Notes

Performance optimization is an ongoing process. Monitor metrics regularly and adjust strategies based on real-world usage patterns.

Current status: **Framework in place, ready for monitoring and tuning**
