/**
 * Génère le service worker `plagiat/sw.js` avec la liste exacte des ressources
 * à précharger et une version dérivée de leur contenu.
 *
 * Le service worker rend l'application **installable et pleinement hors ligne** :
 * une fois visitée, elle fonctionne sans connexion, comme une application native.
 * La version change automatiquement dès qu'un fichier change, ce qui déclenche
 * la mise à jour du cache, jamais de version figée.
 *
 *   node tools/make-sw.mjs
 *
 * @module tools/make-sw
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const APP = join(ROOT, 'plagiat');

/** Extensions préchargées (le reste est mis en cache à la volée). */
const PRECACHE_EXT = new Set(['.html', '.css', '.js', '.mjs', '.webmanifest', '.png', '.svg', '.ico']);

/** Parcourt récursivement un dossier et renvoie les fichiers pertinents. */
async function walk(dir, base = dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full, base)));
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'));
      if (PRECACHE_EXT.has(ext) && entry.name !== 'sw.js') {
        out.push(relative(base, full).split('\\').join('/'));
      }
    }
  }
  return out;
}

async function main() {
  const assets = (await walk(APP)).sort();
  // Le logo de la page vit un cran au-dessus : on le rapatrie dans le cache.
  const external = ['../logo.png'];

  // Version = hachage du contenu de toutes les ressources préchargées.
  const hash = createHash('sha256');
  for (const rel of assets) {
    hash.update(rel);
    hash.update(await readFile(join(APP, rel)));
  }
  for (const rel of external) {
    try {
      hash.update(await readFile(join(APP, rel)));
    } catch {
      /* logo facultatif */
    }
  }
  const version = hash.digest('hex').slice(0, 12);

  const precache = ['./', ...assets.map((a) => `./${a}`), ...external];

  const sw = `/**
 * Service worker de Veritex, GÉNÉRÉ AUTOMATIQUEMENT.
 * Ne pas modifier à la main : lancer \`node tools/make-sw.mjs\`.
 *
 * Stratégie : préchargement de l'intégralité de l'application à l'installation,
 * puis « cache d'abord » pour toute ressource de même origine. L'application
 * fonctionne donc entièrement hors ligne. Les requêtes vers les moteurs de
 * recherche (autres origines) ne sont jamais interceptées : elles passent
 * directement au réseau, et échouent proprement si la connexion manque.
 */

const CACHE = 'elite-plagiat-${version}';

const PRECACHE = ${JSON.stringify(precache, null, 2)};

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
        keys.filter((k) => k.startsWith('elite-plagiat-') && k !== CACHE).map((k) => caches.delete(k)),
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
`;

  await writeFile(join(APP, 'sw.js'), sw, 'utf8');
  console.log(`plagiat/sw.js, version ${version}, ${precache.length} ressources préchargées`);
}

main();
