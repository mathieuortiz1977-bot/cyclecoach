/**
 * Service Worker Registration & Update Management
 * 
 * Handles:
 * - SW registration on app load
 * - Checking for updates periodically
 * - Notifying user about available updates
 * - Forcing update installation
 */

export interface SWUpdateEvent {
  type: 'update-available' | 'update-activated' | 'registration-error';
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

let updateCheckInterval: NodeJS.Timeout | null = null;

/**
 * Register the service worker
 * Called once on app initialization
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Registry] Service Workers not supported');
    return null;
  }

  try {
    console.log('[SW Registry] Registering service worker');

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      // Force update check on every page load
      updateViaCache: 'none',
    });

    console.log('[SW Registry] Service worker registered:', registration.scope);

    // Start checking for updates periodically
    startUpdateChecks(registration);

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Registry] New service worker activated');
      notifyUpdate('update-activated');
    });

    return registration;
  } catch (error) {
    console.error('[SW Registry] Service worker registration failed:', error);
    notifyUpdate('registration-error', error as Error);
    return null;
  }
}

/**
 * Start checking for SW updates periodically
 * Default: Every 30 seconds
 */
function startUpdateChecks(
  registration: ServiceWorkerRegistration,
  intervalMs: number = 30000
): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
  }

  console.log(
    `[SW Registry] Starting update checks every ${intervalMs / 1000}s`
  );

  // Check immediately on registration
  checkForUpdates(registration);

  // Then check periodically
  updateCheckInterval = setInterval(() => {
    checkForUpdates(registration);
  }, intervalMs);
}

/**
 * Check for service worker updates
 * Called:
 * - On registration
 * - Periodically (every 30 seconds)
 * - When app comes into focus
 */
export async function checkForUpdates(
  registration?: ServiceWorkerRegistration
): Promise<void> {
  if (!registration) {
    registration = await navigator.serviceWorker.ready;
  }

  try {
    console.log('[SW Registry] Checking for updates...');

    // Fetch update check — returns new registration if update available
    await registration.update();

    console.log('[SW Registry] Update check complete');
  } catch (error) {
    console.warn('[SW Registry] Update check failed:', error);
  }
}

/**
 * Check for updates when page comes into focus
 * Users switching back to tab should get prompt about available update
 */
export function enableAutoUpdateOnFocus(): void {
  window.addEventListener('focus', () => {
    navigator.serviceWorker.ready.then((registration) => {
      checkForUpdates(registration);
    });
  });
}

/**
 * Force install waiting service worker
 * Call when user clicks "Update" button
 */
export function acceptUpdate(): void {
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting) {
      console.log('[SW Registry] Sending SKIP_WAITING to waiting worker');

      // Send message to waiting SW
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload after a short delay to let SW activate
      setTimeout(() => {
        console.log('[SW Registry] Reloading page with new SW');
        window.location.reload();
      }, 500);
    }
  });
}

/**
 * Internal: Notify about SW events
 * Can be extended to show toast notifications, etc.
 */
function notifyUpdate(type: SWUpdateEvent['type'], error?: Error): void {
  const event = new CustomEvent('sw-update', {
    detail: { type, error },
  });

  window.dispatchEvent(event);

  // Log to console
  switch (type) {
    case 'update-available':
      console.log('[SW Registry] Update available - notify user');
      break;
    case 'update-activated':
      console.log('[SW Registry] Update activated - page reloaded');
      break;
    case 'registration-error':
      console.error('[SW Registry] Registration failed:', error?.message);
      break;
  }
}

/**
 * Listen for SW update events in components
 * 
 * Usage in React component:
 * ```tsx
 * useEffect(() => {
 *   const handler = (event: Event) => {
 *     const customEvent = event as CustomEvent<SWUpdateEvent>;
 *     if (customEvent.detail.type === 'update-available') {
 *       // Show toast: "Update available, reload to apply"
 *     }
 *   };
 *   
 *   window.addEventListener('sw-update', handler);
 *   return () => window.removeEventListener('sw-update', handler);
 * }, []);
 * ```
 */
export function onSWUpdate(
  callback: (event: SWUpdateEvent) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<SWUpdateEvent>;
    callback(customEvent.detail);
  };

  window.addEventListener('sw-update', handler);

  return () => {
    window.removeEventListener('sw-update', handler);
  };
}

/**
 * Cleanup on page unload
 * Clear update check interval
 */
export function cleanupSW(): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}
