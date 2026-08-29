/**
 * Ubora World service worker.
 *
 * DELIBERATELY MINIMAL. Chrome requires a service worker with a fetch handler
 * before it will offer to install the app. This one does exactly that and
 * nothing more.
 *
 * It does NOT cache pages, API responses, question banks or summary PDFs.
 * That is intentional:
 *   - Summaries and CBT questions are paid, subscription-gated content.
 *     Caching them on the device would put them on disk outside the auth
 *     checks in /api/summaries/[summaryId] and the CBT routes.
 *   - A stale cached page could show a student the wrong question bank or
 *     an out-of-date summary after content is re-approved.
 *
 * Offline support is a separate decision. If it is wanted later, cache only
 * the static shell (CSS, fonts, icons) and never authenticated responses.
 */

const VERSION = "ubora-v1";

self.addEventListener("install", () => {
  // Take over immediately rather than waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clear any caches left by a previous version of this worker.
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== VERSION).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Pass everything straight through to the network. Required for the
  // install prompt to appear; caching is deliberately not done here.
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});
