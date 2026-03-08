// CycleCoach Service Worker — Offline Support with Cache Versioning
// 
// Cache Strategy:
// - STATIC: App shell (manifest, icons) - updated on SW version change
// - RUNTIME: API responses and pages - network-first, cache fallback
// - _next/static: Immutable assets - cache-first (forever)

// Version: Updated on every deploy to force cache invalidation
// Set this from build process (git commit, timestamp, etc.)
const SW_VERSION = "20260308-001"; // Format: YYYYMMDD-NNN

const STATIC_CACHE = `cyclecoach-static-${SW_VERSION}`;
const RUNTIME_CACHE = `cyclecoach-runtime-${SW_VERSION}`;
const IMMUTABLE_CACHE = `cyclecoach-immutable-${SW_VERSION}`;

// Core app shell to pre-cache (only public assets, NOT protected routes)
const APP_SHELL = [
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.svg",
  "/"
];

// Protected routes that should NOT be cached (auth, personal data)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/plan",
  "/settings",
  "/segments",
  "/profile",
  "/auth/",
  "/api/auth/"
];

// ============================================================================
// INSTALL: Pre-cache app shell on first load or version update
// ============================================================================
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing version ${SW_VERSION}`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log(`[SW] Caching app shell to ${STATIC_CACHE}`);
      return cache.addAll(APP_SHELL).catch((error) => {
        console.warn("[SW] Some app shell assets failed to cache:", error);
        // Don't fail install, some assets might be missing in dev
        return cache.addAll(APP_SHELL.filter(url => url !== "/"));
      });
    })
  );
  
  // Skip waiting — activate immediately instead of waiting for all tabs to close
  self.skipWaiting();
  console.log("[SW] Skipping waiting phase — will activate immediately");
});

// ============================================================================
// ACTIVATE: Clean up old cache versions
// ============================================================================
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating version ${SW_VERSION}`);
  
  event.waitUntil(
    caches.keys().then((keys) => {
      const oldCaches = keys.filter((key) => {
        // Keep only current version caches
        const isCurrentStatic = key === STATIC_CACHE;
        const isCurrentRuntime = key === RUNTIME_CACHE;
        const isCurrentImmutable = key === IMMUTABLE_CACHE;
        
        const shouldDelete = !isCurrentStatic && !isCurrentRuntime && !isCurrentImmutable;
        
        if (shouldDelete) {
          console.log(`[SW] Deleting old cache: ${key}`);
        }
        
        return shouldDelete;
      });
      
      return Promise.all(oldCaches.map((key) => caches.delete(key)));
    })
  );
  
  // Claim all clients immediately — pages will start using new SW right away
  self.clients.claim();
  console.log("[SW] Claiming all clients — pages now using new SW");
});

// ============================================================================
// MESSAGE: Handle cache update requests from clients
// ============================================================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] SKIP_WAITING message received");
    self.skipWaiting();
  }
});

// ============================================================================
// FETCH: Network-first strategy with intelligent caching
// ============================================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests
  if (request.method !== "GET") {
    return;
  }

  // Only cache HTTP(S)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // ─────────────────────────────────────────────────────────────────────
  // PROTECTED ROUTES: Never cache (let auth/redirects work normally)
  // ─────────────────────────────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isProtected) {
    // Bypass cache entirely
    return event.respondWith(fetch(request));
  }

  // ─────────────────────────────────────────────────────────────────────
  // IMMUTABLE ASSETS: Cache-first (hashed _next/static/ files)
  // ─────────────────────────────────────────────────────────────────────
  if (url.pathname.startsWith("/_next/static/")) {
    return event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          console.log(`[SW] Immutable asset from cache: ${url.pathname}`);
          return cached;
        }

        return fetch(request).then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          const clone = response.clone();
          caches
            .open(IMMUTABLE_CACHE)
            .then((cache) => cache.put(request, clone));

          return response;
        });
      })
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // API REQUESTS: Network-first (always try fresh data)
  // ─────────────────────────────────────────────────────────────────────
  if (url.pathname.startsWith("/api/")) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses for offline fallback
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: return cached response if available
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log(`[SW] API offline, returning cached: ${url.pathname}`);
              return cached;
            }

            // No cache available
            return new Response(
              JSON.stringify({ error: "Offline - no cached response available" }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PAGES & STATIC ASSETS: Stale-while-revalidate
  // ─────────────────────────────────────────────────────────────────────
  return event.respondWith(
    caches.match(request).then((cached) => {
      // Start network request in background
      const fetchPromise = fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Don't cache redirects (they might be auth errors)
          if (response.type === "redirect") {
            return response;
          }

          // Cache the response for offline use
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clone);
          });

          return response;
        })
        .catch(() => {
          // Network error: return cached or offline page
          if (cached) {
            console.log(`[SW] Network error, using cached: ${url.pathname}`);
            return cached;
          }

          // Fallback to dashboard if available
          return caches.match("/dashboard").then((fallback) => {
            if (fallback) {
              console.log("[SW] No cache available, returning dashboard fallback");
              return fallback;
            }

            // Last resort: offline page
            return new Response(
              "You are offline. Please check your connection and try again.",
              {
                status: 503,
                headers: { "Content-Type": "text/plain" },
              }
            );
          });
        });

      // Return cached version immediately, fetch fresh in background
      return cached || fetchPromise;
    })
  );
});

// ============================================================================
// LOG: Service Worker startup
// ============================================================================
console.log(`[SW] Service Worker loaded - Version: ${SW_VERSION}`);
console.log(`[SW] Cache names:`);
console.log(`     Static: ${STATIC_CACHE}`);
console.log(`     Runtime: ${RUNTIME_CACHE}`);
console.log(`     Immutable: ${IMMUTABLE_CACHE}`);
