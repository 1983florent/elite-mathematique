/*
 * Service worker : rend ELITE MATHÉMATIQUE utilisable sans connexion.
 * Stratégie : on sert la version en cache tout de suite, puis on la met à jour en arrière-plan
 * (la nouvelle version est utilisée à l'ouverture suivante).
 * La liste ASSETS est vérifiée par tests/run.js : tout fichier chargé par index.html doit y figurer.
 */
'use strict';
var CACHE = 'elite-maths-v2';
var ASSETS = [
    './',
    'index.html',
    'manifest.webmanifest',
    'css/style.css',
    'icons/logo.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'vendor/katex/katex.min.css',
    'vendor/katex/katex.min.js',
    'vendor/fonts/bricolage-grotesque.woff2',
    'vendor/fonts/lexend.woff2',
    'vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
    'vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
    'vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Main-Bold.woff2',
    'vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
    'vendor/katex/fonts/KaTeX_Main-Italic.woff2',
    'vendor/katex/fonts/KaTeX_Main-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
    'vendor/katex/fonts/KaTeX_Math-Italic.woff2',
    'vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
    'vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
    'vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Script-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
    'vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2',
    'js/lib/core.js',
    'js/lib/parser.js',
    'js/lib/render.js',
    'js/lib/figures.js',
    'js/lib/icons.js',
    'js/lib/motif.js',
    'js/data/programme.js',
    'js/data/contenu-cm2-6e.js',
    'js/data/contenu-5e-4e.js',
    'js/data/contenu-3e-2l.js',
    'js/data/contenu-2s-1l.js',
    'js/data/contenu-1s.js',
    'js/data/contenu-tle.js',
    'js/data/afrique.js',
    'js/data/guides.js',
    'js/data/histoire.js',
    'js/gen/00-reference.js',
    'js/gen/cm2-6e.js',
    'js/gen/5e-4e.js',
    'js/gen/3e-2l.js',
    'js/gen/2s-1l.js',
    'js/gen/1s.js',
    'js/gen/tle.js',
    'js/gen/plus-college.js',
    'js/gen/plus-lycee.js',
    'js/gen/missions.js',
    'js/demos.js',
    'js/store.js',
    'js/ui.js',
    'js/views/accueil.js',
    'js/views/programme.js',
    'js/views/exercice.js',
    'js/views/examen.js',
    'js/views/revision.js',
    'js/views/progres.js',
    'js/views/enseignant.js',
    'js/views/decouvrir.js',
    'js/tools/grapheur.js',
    'js/tools/outils.js',
    'js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (cached) {
      var reseau = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || reseau;
    });
  }));
});
