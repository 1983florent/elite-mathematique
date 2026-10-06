/*
 * Démarrage de l'application : navigation (barre latérale, onglets du bas, menu « Plus »),
 * routeur (#/…), thème, choix de la classe, recherche, mode hors ligne.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  var I = function (n, o) { return EM.icon(n, o); };
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
    'enseignant': 'enseignant', 'fiche': 'fiche', 'labo': 'labo', 'recherche': 'recherche', 'a-propos': 'apropos',
    'missions': 'missions', 'demos': 'demos', 'demo': 'demo', 'guides': 'guides', 'guide': 'guide',
    'histoire': 'histoire', 'memento': 'memento', 'calcul-mental': 'mental'
  };

  /* Navigation : [clé, lien, libellé, icône] */
  var NAV_GROUPES = [
    { titre: 'Apprendre', items: [['accueil', '#/', 'Accueil', 'accueil'], ['programme', '#/programme', 'Programme', 'programme'],
      ['missions', '#/missions', 'Missions Sénégal', 'carte'], ['demos', '#/demos', 'Démonstrations', 'curseurs']] },
    { titre: 'S\'entraîner', items: [['examens', '#/examens', 'Examens blancs', 'copie'], ['revision', '#/revision', 'Révision espacée', 'cartes'],
      ['mental', '#/calcul-mental', 'Calcul mental', 'chrono']] },
    { titre: 'Outils', items: [['labo', '#/labo', 'Laboratoire', 'fiole'], ['memento', '#/memento', 'Mémento', 'memento']] },
    { titre: 'Ressources', items: [['guides', '#/guides', 'Réussir son examen', 'boussole'], ['histoire', '#/histoire', 'Grands mathématiciens', 'colonnes'],
      ['enseignant', '#/enseignant', 'Espace enseignant', 'tableau']] },
    { titre: 'Moi', items: [['progres', '#/progres', 'Mes progrès', 'trophee']] }
  ];
  var BAS = [['accueil', '#/', 'Accueil', 'accueil'], ['programme', '#/programme', 'Cours', 'livre'], ['examens', '#/examens', 'Examens', 'copie'],
    ['labo', '#/labo', 'Labo', 'fiole']];
  var NAV = {
    accueil: 'accueil', programme: 'programme', classe: 'programme', chapitre: 'programme', exo: 'programme', serie: 'programme',
    diagnostic: 'programme', defi: 'accueil', examens: 'examens', examen: 'examens', revision: 'revision', progres: 'progres',
    enseignant: 'enseignant', fiche: 'enseignant', labo: 'labo', recherche: '', apropos: '', missions: 'missions', demos: 'demos', demo: 'demos',
    guides: 'guides', guide: 'guides', histoire: 'histoire', memento: 'memento', mental: 'mental'
  };

  function construireNavigation() {
    var side = document.getElementById('sidebar');
    if (side) {
      side.innerHTML = '<a class="side-brand" href="#/" aria-label="Accueil ELITE MATHÉMATIQUE"><img src="icons/logo.svg" alt="">' +
        '<span class="brand-name">ELITE<span>MATHÉMATIQUE</span></span></a>' +
        '<button class="side-classe" id="side-classe" type="button"></button>' +
        NAV_GROUPES.map(function (g) {
          return '<div class="side-group"><span>' + esc(g.titre) + '</span>' + g.items.map(function (it) {
            return '<a class="side-link" data-nav="' + it[0] + '" href="' + it[1] + '">' + I(it[3]) + '<span>' + esc(it[2]) + '</span></a>';
          }).join('') + '</div>';
        }).join('') +
        '<div class="side-foot"><span class="side-streak" id="side-streak"></span>' +
        '<span><button class="icon-btn" data-act="recherche" title="Rechercher" aria-label="Rechercher">' + I('recherche') + '</button>' +
        '<button class="icon-btn" data-act="theme" title="Mode clair ou sombre" aria-label="Changer de thème">' + I('lune') + '</button></span></div>';
      side.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (b && b.getAttribute('data-act') === 'theme') toggleTheme();
        if (b && b.getAttribute('data-act') === 'recherche') EM.go('#/recherche');
      });
      side.querySelector('#side-classe').addEventListener('click', function () { EM.choisirClasse(); });
    }
    var bas = document.getElementById('bottomnav');
    if (bas) {
      bas.innerHTML = BAS.map(function (it) {
        return '<a data-nav="' + it[0] + '" href="' + it[1] + '">' + I(it[3]) + '<span>' + esc(it[2]) + '</span></a>';
      }).join('') + '<button type="button" data-nav="plus" id="btn-plus">' + I('plus') + '<span>Plus</span></button>';
      bas.querySelector('#btn-plus').addEventListener('click', menuPlus);
    }
    document.getElementById('btn-recherche').innerHTML = I('recherche');
    document.getElementById('btn-theme').innerHTML = I('lune');
  }

  /** Menu « Plus » sur téléphone : toutes les rubriques qui ne sont pas dans la barre du bas. */
  function menuPlus() {
    var dejaEnBas = BAS.map(function (b) { return b[0]; });
    var items = [];
    NAV_GROUPES.forEach(function (g) { g.items.forEach(function (it) { if (dejaEnBas.indexOf(it[0]) < 0) items.push(it); }); });
    items.push(['recherche', '#/recherche', 'Rechercher', 'recherche'], ['apropos', '#/a-propos', 'À propos', 'info']);
    EM.ui.modal('Toutes les rubriques', '<div class="sheet-menu">' + items.map(function (it) {
      return '<a href="' + it[1] + '">' + I(it[3]) + '<span>' + esc(it[2]) + '</span></a>';
    }).join('') + '</div>', function (body) {
      body.addEventListener('click', function (e) { if (e.target.closest('a')) EM.ui.closeModal(); });
    });
  }

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
    majEtat();
    if (!r.query.garder) window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  EM.route = route;

  EM.go = function (hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  };

  /* ---------- classe courante, série de jours ---------- */
  function majEtat() {
    var k = EM.store.classe(), cl = k ? EM.programme.classes[k] : null;
    document.getElementById('btn-classe').innerHTML = esc(cl ? cl.nom : 'Ma classe') + I('bas');
    var sc = document.getElementById('side-classe');
    if (sc) sc.innerHTML = '<span><small>Ma classe</small><strong>' + esc(cl ? cl.long : 'Choisir') + '</strong></span>' + I('bas');
    var st = document.getElementById('side-streak');
    if (st) {
      var n = EM.store.data().serie.n;
      st.innerHTML = I('flamme') + '<strong>' + n + '</strong> jour' + (n > 1 ? 's' : '') + ' de suite';
    }
  }
  EM.majEtat = majEtat;

  EM.choisirClasse = function (then) {
    var P = EM.programme, cur = EM.store.classe();
    var html = '<p class="muted">Choisis ta classe : l\'accueil, les révisions et les examens s\'adaptent.</p>' +
      P.cycles.map(function (c) {
        return '<div class="cycle"><h3>' + esc(c.nom) + '</h3><div class="classes">' + c.classes.map(function (k) {
          var cl = P.classes[k];
          return '<button class="classe-btn' + (k === cur ? ' active' : '') + '" data-k="' + k + '">' + esc(cl.nom) +
            (cl.examen ? '<small>' + esc(cl.examen) + '</small>' : '<small>&nbsp;</small>') + '</button>';
        }).join('') + '</div></div>';
      }).join('');
    EM.ui.modal('Ma classe', html, function (body) {
      body.addEventListener('click', function (e) {
        var b = e.target.closest('[data-k]');
        if (!b) return;
        EM.store.setClasse(b.getAttribute('data-k'));
        EM.ui.closeModal();
        majEtat();
        if (then) then(b.getAttribute('data-k')); else route();
      });
    });
  };

  /* ---------- thème ---------- */
  function themeSombre() {
    var cur = document.documentElement.getAttribute('data-theme');
    return cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() {
    var next = themeSombre() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('em.theme', next); } catch (e) { /* rien */ }
    majIconeTheme();
  }
  function majIconeTheme() {
    var ico = I(themeSombre() ? 'soleil' : 'lune');
    Array.prototype.forEach.call(document.querySelectorAll('#btn-theme, [data-act="theme"]'), function (b) { b.innerHTML = ico; });
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
      index.push({ titre: ch.titre, sous: 'Chapitre · ' + cls, href: '#/chapitre/' + id, txt: plain(ch.titre + ' ' + (c.resume || '') + ' ' + (c.objectifs || []).join(' ')), poids: 3 });
      (c.cours || []).forEach(function (b) {
        index.push({ titre: (b.titre || ch.titre), sous: ch.titre + ' · ' + cls, href: '#/chapitre/' + id, txt: plain((b.titre || '') + ' ' + b.texte), poids: 2 });
      });
    });
    EM.gen.list().forEach(function (g) {
      var ch = P.chapitres[g.chapitres[0]];
      index.push({ titre: (g.mission ? 'Mission : ' : 'Exercice : ') + g.titre, sous: ch ? ch.titre : '', href: '#/exo/' + g.id, txt: plain(g.titre + ' ' + (g.resume || '')), poids: 1 });
    });
    (EM.demos ? EM.demos.list() : []).forEach(function (d) {
      index.push({ titre: 'Démonstration : ' + d.titre, sous: d.resume || '', href: '#/demo/' + d.id, txt: plain(d.titre + ' ' + (d.resume || '')), poids: 2 });
    });
    (EM.histoire || []).forEach(function (h, i) {
      index.push({ titre: h.nom, sous: 'Grands mathématiciens · ' + (h.epoque || ''), href: '#/histoire?p=' + i, txt: plain(h.nom + ' ' + (h.domaine || '') + ' ' + h.texte), poids: 2 });
    });
    (EM.guides || []).forEach(function (g) {
      index.push({ titre: g.titre, sous: 'Réussir son examen', href: '#/guide/' + g.id, txt: plain(g.titre + ' ' + (g.resume || '')), poids: 2 });
    });
    return index;
  }
  EM.views.recherche = function (main, parts, query) {
    main.innerHTML = '<div class="page-head"><div><h1>Rechercher</h1><p class="muted">Chapitres, notions du cours, exercices, démonstrations, mathématiciens.</p></div></div>' +
      '<input class="search-input" type="search" placeholder="Ex. : Thalès, discriminant, PGCD, logarithme…" aria-label="Rechercher" value="' + esc(query.q || '') + '">' +
      '<ul class="search-res"></ul>';
    var inp = main.querySelector('input'), ul = main.querySelector('.search-res');
    function run() {
      var q = plain(inp.value).trim();
      if (q.length < 2) { ul.innerHTML = '<li class="muted small">Tape au moins deux lettres.</li>'; return; }
      var words = q.split(/\s+/);
      var res = buildIndex().map(function (it) {
        var s = 0;
        words.forEach(function (w) { if (it.txt.indexOf(w) >= 0) s += it.poids; if (plain(it.titre).indexOf(w) >= 0) s += 3; });
        return { it: it, s: words.every(function (w) { return it.txt.indexOf(w) >= 0 || plain(it.titre).indexOf(w) >= 0; }) ? s : 0 };
      }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 40);
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
    construireNavigation();
    majIconeTheme();
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
