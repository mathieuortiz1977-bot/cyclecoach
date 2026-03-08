/**
 * Performance Monitoring & Optimization Utilities
 *
 * Tracks and monitors performance metrics across the app
 */

// ============================================================================
// PERFORMANCE METRICS TRACKING
// ============================================================================

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint (ms)
  fid?: number; // First Input Delay (ms)
  cls?: number; // Cumulative Layout Shift (0-1)
  ttfb?: number; // Time to First Byte (ms)
  fcp?: number; // First Contentful Paint (ms)

  // Custom metrics
  apiResponseTime?: number; // Average API response time (ms)
  renderTime?: number; // Component render time (ms)
  routeChangeTime?: number; // Navigation time (ms)
}

const metrics: PerformanceMetrics = {};

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  threshold?: number
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (threshold && duration > threshold) {
    console.warn(
      `[Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  } else {
    console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async function performance
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  threshold?: number
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (threshold && duration > threshold) {
    console.warn(
      `[Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  } else {
    console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(metric: any) {
  const { name, value } = metric;

  switch (name) {
    case 'LCP':
      metrics.lcp = value;
      console.debug(`[Core Web Vitals] LCP: ${value}ms`);
      break;
    case 'FID':
      metrics.fid = value;
      console.debug(`[Core Web Vitals] FID: ${value}ms`);
      break;
    case 'CLS':
      metrics.cls = value;
      console.debug(`[Core Web Vitals] CLS: ${value}`);
      break;
    case 'FCP':
      metrics.fcp = value;
      console.debug(`[Core Web Vitals] FCP: ${value}ms`);
      break;
    case 'TTFB':
      metrics.ttfb = value;
      console.debug(`[Core Web Vitals] TTFB: ${value}ms`);
      break;
  }
}

/**
 * Get current metrics
 */
export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Check if metrics are healthy
 */
export function areMetricsHealthy(): {
  healthy: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // LCP should be < 2.5s
  if (metrics.lcp && metrics.lcp > 2500) {
    issues.push(`LCP too high: ${metrics.lcp}ms (target: <2500ms)`);
  }

  // FID should be < 100ms
  if (metrics.fid && metrics.fid > 100) {
    issues.push(`FID too high: ${metrics.fid}ms (target: <100ms)`);
  }

  // CLS should be < 0.1
  if (metrics.cls && metrics.cls > 0.1) {
    issues.push(`CLS too high: ${metrics.cls} (target: <0.1)`);
  }

  // TTFB should be < 600ms
  if (metrics.ttfb && metrics.ttfb > 600) {
    issues.push(`TTFB too high: ${metrics.ttfb}ms (target: <600ms)`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

const pendingRequests = new Map<string, Promise<any>>();

/**
 * Deduplicate identical requests
 * Prevents multiple identical API calls in flight
 */
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // Return existing promise if request in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Start new request
  const promise = fn()
    .then((result) => {
      pendingRequests.delete(key);
      return result;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, promise);
  return promise;
}

// ============================================================================
// DEBOUNCING & THROTTLING
// ============================================================================

/**
 * Debounce a function (call after delay, cancel if called again)
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, delay);
  };
}

/**
 * Throttle a function (call at most once per interval)
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      fn(...args);
      lastCall = now;
    }
  };
}

// ============================================================================
// RESOURCE HINTS
// ============================================================================

/**
 * Preload critical resource
 */
export function preloadResource(url: string, as: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Prefetch resource for later use
 */
export function prefetchResource(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * DNS-prefetch for external domains
 */
export function dnsPrefetch(domain: string) {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
}

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

/**
 * Create object pool for frequently allocated objects
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    const obj = this.available.pop() || this.factory();
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

// ============================================================================
// LAZY LOADING HELPERS
// ============================================================================

/**
 * Lazy load component
 */
export function lazyLoadComponent(
  importFn: () => Promise<{ default: any }>
) {
  return {
    lazy: true,
    load: importFn,
  };
}

/**
 * Intersection Observer for lazy loading images
 */
export function setupLazyImageLoading() {
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported');
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

// ============================================================================
// PERFORMANCE BUDGETS
// ============================================================================

export interface PerformanceBudget {
  jsBundle: number; // KB
  cssBundle: number; // KB
  imageSize: number; // KB per image
  apiResponseTime: number; // ms
  renderTime: number; // ms
}

const DEFAULT_BUDGET: PerformanceBudget = {
  jsBundle: 250, // 250KB for main bundle
  cssBundle: 50, // 50KB for CSS
  imageSize: 100, // 100KB per image
  apiResponseTime: 500, // 500ms for API calls
  renderTime: 16, // 16ms for 60fps
};

/**
 * Check if resource meets performance budget
 */
export function checkPerformanceBudget(
  metric: keyof PerformanceBudget,
  value: number,
  budget: PerformanceBudget = DEFAULT_BUDGET
): boolean {
  const limit = budget[metric];
  const exceeded = value > limit;

  if (exceeded) {
    console.warn(
      `[Budget] ${metric}: ${value} exceeds budget of ${limit}`
    );
  }

  return !exceeded;
}
