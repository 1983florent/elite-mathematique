/**
 * Service worker de Veritex, GÉNÉRÉ AUTOMATIQUEMENT.
 * Ne pas modifier à la main : lancer `node tools/make-sw.mjs`.
 *
 * Stratégie : préchargement de l'intégralité de l'application à l'installation,
 * puis « cache d'abord » pour toute ressource de même origine. L'application
 * fonctionne donc entièrement hors ligne. Les requêtes vers les moteurs de
 * recherche (autres origines) ne sont jamais interceptées : elles passent
 * directement au réseau, et échouent proprement si la connexion manque.
 */

const CACHE = 'veritex-ebf534dd9167';

const PRECACHE = [
  "./",
  "./css/app.css",
  "./icons/veritex-emblem-192.png",
  "./icons/veritex-emblem-32.png",
  "./icons/veritex-emblem-512.png",
  "./icons/veritex-emblem-64.png",
  "./icons/veritex-logo-640.png",
  "./index.html",
  "./js/app.js",
  "./js/core/ai-detector.js",
  "./js/core/branding.js",
  "./js/core/certificate.js",
  "./js/core/citations.js",
  "./js/core/compare.js",
  "./js/core/docx-reader.js",
  "./js/core/docx-writer.js",
  "./js/core/errors.js",
  "./js/core/forensics.js",
  "./js/core/humanizer.js",
  "./js/core/i18n.js",
  "./js/core/inflate.js",
  "./js/core/license.js",
  "./js/core/matcher.js",
  "./js/core/net.js",
  "./js/core/pipeline.js",
  "./js/core/providers.js",
  "./js/core/report.js",
  "./js/core/runner.js",
  "./js/core/store.js",
  "./js/core/text.js",
  "./js/core/zip-reader.js",
  "./js/core/zip-writer.js",
  "./js/data/locales.js",
  "./js/data/synonyms.js",
  "./js/ui/dom.js",
  "./js/ui/paywall.js",
  "./js/ui/pwa.js",
  "./js/ui/results.js",
  "./js/workers/analyzer.worker.js",
  "./js/workers/humanizer.worker.js",
  "./manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // addAll échoue en bloc si une seule ressource manque : on tolère les
      // absences (le logo par exemple) en mettant en cache une par une.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) await cache.put(url, response);
          } catch {
            /* ressource indisponible : ignorée */
          }
        }),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => (k.startsWith('veritex-') || k.startsWith('elite-plagiat-')) && k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Seules les ressources de l'application (même origine) sont servies par le
  // cache. Les moteurs de recherche restent sur le réseau.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request, { ignoreSearch: false });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        // Hors ligne : pour une navigation, on sert la page d'accueil.
        if (request.mode === 'navigate') {
          const shell = await cache.match('./index.html');
          if (shell) return shell;
        }
        throw err;
      }
    })(),
  );
});

// Permet à la page de forcer l'activation d'une nouvelle version.
self.addEventListener('message', (event) => {
  if (event.data === 'ignorer-attente') self.skipWaiting();
});
