/*
 * Démarrage de l'application : routeur (#/…), thème, choix de la classe, recherche, mode hors ligne.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  /** Lit le fragment : #/chapitre/3e-thales?onglet=cours -> { parts, query } */
  function parseHash() {
    var h = (location.hash || '#/').replace(/^#\/?/, '');
    var q = {}, i = h.indexOf('?');
    if (i >= 0) {
      h.slice(i + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
      });
      h = h.slice(0, i);
    }
    return { parts: h.split('/').filter(Boolean).map(decodeURIComponent), query: q };
  }
  EM.parseHash = parseHash;

  var ROUTES = {
    '': 'accueil', 'programme': 'programme', 'classe': 'classe', 'chapitre': 'chapitre',
    'exo': 'exo', 'serie': 'serie', 'defi': 'defi', 'diagnostic': 'diagnostic',
    'examens': 'examens', 'examen': 'examen', 'revision': 'revision', 'progres': 'progres',
    'enseignant': 'enseignant', 'fiche': 'fiche', 'labo': 'labo', 'recherche': 'recherche', 'a-propos': 'apropos'
  };
  var NAV = {
    accueil: 'accueil', programme: 'programme', classe: 'programme', chapitre: 'programme', exo: 'programme', serie: 'programme',
    diagnostic: 'programme', defi: 'accueil', examens: 'examens', examen: 'examens', revision: 'revision', progres: 'progres',
    enseignant: 'enseignant', fiche: 'enseignant', labo: 'labo', recherche: '', apropos: ''
  };

  var cleanup = null;
  function route() {
    var r = parseHash();
    var name = ROUTES[r.parts[0] || ''] || 'introuvable';
    var main = document.getElementById('main');
    if (cleanup) { try { cleanup(); } catch (e) { /* rien */ } cleanup = null; }
    var view = EM.views[name] || EM.views.introuvable;
    main.innerHTML = '';
    try {
      cleanup = view(main, r.parts.slice(1), r.query) || null;
    } catch (e) {
      console.error(e);
      main.innerHTML = '<div class="card"><h2>Oups…</h2><p>Une erreur est survenue en affichant cette page.</p><pre class="small muted" style="white-space:pre-wrap">' +
        esc(e && e.message) + '</pre><a class="btn" href="#/">Retour à l\'accueil</a></div>';
    }
    var nav = NAV[name];
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === nav);
    });
    updateClasseChip();
    if (!r.query.garder) window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  EM.route = route;

  EM.go = function (hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  };

  /* ---------- classe courante ---------- */
  function updateClasseChip() {
    var k = EM.store.classe();
    var b = document.getElementById('btn-classe');
    b.textContent = (k ? EM.programme.classes[k].nom : 'Ma classe') + ' ▾';
  }
  EM.choisirClasse = function (then) {
    var P = EM.programme, cur = EM.store.classe();
    var html = '<p class="muted">Choisis ta classe : l\'accueil, les révisions et les examens s\'adaptent.</p>' +
      P.cycles.map(function (c) {
        return '<div class="cycle"><h3>' + esc(c.nom) + '</h3><div class="classes">' + c.classes.map(function (k) {
          var cl = P.classes[k];
          return '<button class="classe-btn' + (k === cur ? ' active' : '') + '" style="--c:' + cl.couleur + '" data-k="' + k + '">' + esc(cl.nom) +
            (cl.examen ? '<small>' + esc(cl.examen) + '</small>' : '<small>&nbsp;</small>') + '</button>';
        }).join('') + '</div></div>';
      }).join('');
    EM.ui.modal('Ma classe', html, function (body) {
      body.addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]');
        if (!b) return;
        EM.store.setClasse(b.getAttribute('data-k'));
        EM.ui.closeModal();
        updateClasseChip();
        if (then) then(b.getAttribute('data-k')); else route();
      });
    });
  };

  /* ---------- thème ---------- */
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('em.theme', next); } catch (e) { /* rien */ }
  }

  /* ---------- recherche ---------- */
  function plain(s) {
    return String(s || '').replace(/\$[^$]*\$/g, ' ').replace(/<[^>]+>/g, ' ').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  var index = null;
  function buildIndex() {
    if (index) return index;
    index = [];
    var P = EM.programme;
    P.ordre.forEach(function (id) {
      var ch = P.chapitres[id], c = EM.contenu[id] || {};
      var cls = ch.classes.map(function (k) { return P.classes[k].nom; }).join(', ');
      index.push({ titre: ch.titre, sous: cls, href: '#/chapitre/' + id, txt: plain(ch.titre + ' ' + (c.resume || '') + ' ' + (c.objectifs || []).join(' ')), poids: 3 });
      (c.cours || []).forEach(function (b) {
        index.push({ titre: (b.titre || ch.titre), sous: ch.titre + ' · ' + cls, href: '#/chapitre/' + id, txt: plain((b.titre || '') + ' ' + b.texte), poids: 2 });
      });
    });
    EM.gen.list().forEach(function (g) {
      var ch = P.chapitres[g.chapitres[0]];
      index.push({ titre: 'Exercice : ' + g.titre, sous: ch ? ch.titre : '', href: '#/exo/' + g.id, txt: plain(g.titre), poids: 1 });
    });
    return index;
  }
  EM.views.recherche = function (main, parts, query) {
    main.innerHTML = '<div class="card"><h1>Rechercher</h1>' +
      '<input class="search-input" type="search" placeholder="Ex. : Thalès, discriminant, PGCD, logarithme…" aria-label="Rechercher" value="' + esc(query.q || '') + '">' +
      '<ul class="search-res"></ul></div>';
    var inp = main.querySelector('input'), ul = main.querySelector('.search-res');
    function run() {
      var q = plain(inp.value).trim();
      if (q.length < 2) { ul.innerHTML = '<li class="muted small">Tape au moins deux lettres.</li>'; return; }
      var words = q.split(/\s+/);
      var res = buildIndex().map(function (it) {
        var s = 0;
        words.forEach(function (w) { if (it.txt.indexOf(w) >= 0) s += it.poids; if (plain(it.titre).indexOf(w) >= 0) s += 3; });
        return { it: it, s: words.every(function (w) { return it.txt.indexOf(w) >= 0 || plain(it.titre).indexOf(w) >= 0; }) ? s : 0 };
      }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 30);
      ul.innerHTML = res.length ? res.map(function (r) {
        return '<li><a href="' + r.it.href + '"><strong>' + esc(r.it.titre) + '</strong><br><span class="small muted">' + esc(r.it.sous) + '</span></a></li>';
      }).join('') : '<li class="muted">Aucun résultat.</li>';
    }
    inp.addEventListener('input', run);
    inp.focus();
    if (query.q) run();
  };

  EM.views.introuvable = function (main) {
    main.innerHTML = '<div class="card"><h1>Page introuvable</h1><p>Cette page n\'existe pas (ou plus).</p><a class="btn" href="#/">Retour à l\'accueil</a></div>';
  };

  /* ---------- démarrage ---------- */
  function start() {
    document.getElementById('btn-classe').addEventListener('click', function () { EM.choisirClasse(); });
    document.getElementById('btn-theme').addEventListener('click', toggleTheme);
    document.getElementById('btn-recherche').addEventListener('click', function () { EM.go('#/recherche'); });
    window.addEventListener('hashchange', function () {
      // une ancre simple (#main, lien d'évitement) n'est pas une page : on ne change pas de vue
      if (location.hash && location.hash.indexOf('#/') !== 0) return;
      route();
    });
    route();
    // mode hors ligne (seulement en http/https)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !EM.MODE_EN_LIGNE) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* pas grave */ });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(typeof window !== 'undefined' ? window : globalThis);
