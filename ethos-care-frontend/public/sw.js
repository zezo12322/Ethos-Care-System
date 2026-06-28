/*
 * Offline service worker for the Ethos Care dashboard.
 *
 * Strategy:
 *   - Static assets (/_next/static, fonts, images): cache-first (content-hashed, immutable).
 *   - Navigations (HTML documents): network-first, falling back to the cached page,
 *     then the cached dashboard/offline shell — this is what lets the app OPEN with no network.
 *   - The cross-origin backend API and same-origin /api routes are never intercepted,
 *     so authenticated data requests always hit the network and are never served stale.
 */

const CACHE = "ethos-shell-v1";
const PRECACHE_URLS = ["/", "/login", "/dashboard", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Best-effort: a single failing/redirected URL must not abort installation.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isCacheable(response) {
  return (
    response &&
    response.ok &&
    !response.redirected &&
    (response.type === "basic" || response.type === "default")
  );
}

async function putInCache(request, response) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(request, response);
  } catch {
    /* opaque / redirected responses can't be cached — ignore */
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Only manage same-origin requests. The backend API (cross-origin) passes through.
  if (url.origin !== self.location.origin) return;

  // Never intercept API routes — they must always be fresh and authenticated.
  if (url.pathname.startsWith("/api")) return;

  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|svg|ico|webp|gif)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (isCacheable(response)) {
              putInCache(request, response.clone());
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            putInCache(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/dashboard")) ||
            (await caches.match("/offline")) ||
            (await caches.match("/")) ||
            new Response(
              "<!doctype html><meta charset='utf-8'><body style='font-family:sans-serif;text-align:center;padding:40px' dir='rtl'>أنت غير متصل بالإنترنت.</body>",
              {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              },
            )
          );
        }),
    );
  }
});
