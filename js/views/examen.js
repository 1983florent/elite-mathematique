/*
 * Examens blancs : CFEE, BFEM, BAC S1, S2, L et devoir surveillé pour toute classe.
 * Chaque sujet est produit à partir d'un code : le même code donne le même sujet
 * (un professeur peut faire composer toute sa classe sur le même sujet).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  var NUM = ['nombres', 'algebre', 'analyse', 'stats', 'arith'];
  var GEO = ['geometrie', 'mesures'];

  var EXAMENS = {
    cfee: {
      nom: 'CFEE', long: "Certificat de fin d'études élémentaires", classe: 'cm2', duree: 60,
      parties: [{ titre: 'Mathématiques', points: [4, 4, 4, 4, 4] }]
    },
    bfem: {
      nom: 'BFEM', long: "Brevet de fin d'études moyennes", classe: '3e', duree: 120,
      parties: [
        { titre: 'Activités numériques', points: [3, 3, 4], domaines: NUM },
        { titre: 'Activités géométriques', points: [3, 3, 4], domaines: GEO }
      ]
    },
    'bac-s2': {
      nom: 'BAC S2', long: 'Baccalauréat, série S2', classe: 'tle-s2', duree: 240,
      parties: [
        { titre: 'Exercice 1', points: [4], chapitres: ['ts-complexes', 'ts-similitudes'] },
        { titre: 'Exercice 2', points: [4], chapitres: ['ts-probabilites', 'ts-statistiques'] },
        { titre: 'Problème', points: [3, 3, 3, 3], domaines: ['analyse'] }
      ]
    },
    'bac-s1': {
      nom: 'BAC S1', long: 'Baccalauréat, série S1', classe: 'tle-s1', duree: 240,
      parties: [
        { titre: 'Exercice 1', points: [4], chapitres: ['ts1-arithmetique', 'ts-complexes'] },
        { titre: 'Exercice 2', points: [4], chapitres: ['ts-similitudes', 'ts1-coniques', 'ts1-espace', 'ts-probabilites'] },
        { titre: 'Problème', points: [3, 3, 3, 3], domaines: ['analyse'] }
      ]
    },
    'bac-l': {
      nom: 'BAC L', long: 'Baccalauréat, série L', classe: 'tle-l', duree: 120,
      parties: [
        { titre: 'Exercice 1', points: [5], chapitres: ['tl-suites'] },
        { titre: 'Exercice 2', points: [5], chapitres: ['tl-statistiques', 'tl-probabilites'] },
        { titre: 'Problème', points: [5, 5], chapitres: ['tl-fonctions', 'tl-logarithme-exponentielle'] }
      ]
    }
  };
  EM.EXAMENS = EXAMENS;

  /** Construit le sujet (liste d'exercices) d'un examen à partir d'un code. */
  function construire(type, k, seed) {
    var def = type === 'ds'
      ? { nom: 'Devoir', long: 'Devoir surveillé — ' + EM.programme.classes[k].long, classe: k, duree: 60, parties: [{ titre: 'Exercices', points: [4, 4, 4, 4, 4] }] }
      : EXAMENS[type];
    var rng = new EM.RNG('examen:' + type + ':' + def.classe + ':' + seed);
    var tous = EM.gensClasse(def.classe, function (g) { return !g.mission; });
    var dejaPris = {};
    var parties = def.parties.map(function (p) {
      var candidats = tous.filter(function (g) {
        if (p.chapitres) return g.chapitres.some(function (c) { return p.chapitres.indexOf(c) >= 0; });
        if (p.domaines) return g.chapitres.some(function (c) { var ch = EM.programme.chapitres[c]; return ch && ch.classes.indexOf(def.classe) >= 0 && p.domaines.indexOf(ch.domaine) >= 0; });
        return true;
      });
      var exam = candidats.filter(function (g) { return g.examen; });
      if (exam.length >= p.points.length) candidats = exam;
      if (!candidats.length) candidats = tous;
      var choisis = [], chapitresVus = {};
      var melange = rng.shuffle(candidats);
      // d'abord des chapitres différents, ensuite on complète
      melange.forEach(function (g) {
        if (choisis.length >= p.points.length || dejaPris[g.id]) return;
        if (chapitresVus[g.chapitres[0]]) return;
        choisis.push(g); chapitresVus[g.chapitres[0]] = true; dejaPris[g.id] = true;
      });
      melange.forEach(function (g) {
        if (choisis.length >= p.points.length || dejaPris[g.id]) return;
        choisis.push(g); dejaPris[g.id] = true;
      });
      while (choisis.length < p.points.length && candidats.length) choisis.push(rng.pick(candidats));
      var exos = choisis.map(function (g, i) {
        var niv = type === 'cfee' ? 1 : Math.min(g.niveaux, p.titre === 'Problème' ? 3 : 2);
        return { g: g, ex: EM.gen.make(g.id, rng.int(1, 99999), niv), points: p.points[i] };
      });
      return { titre: p.titre, exos: exos, total: p.points.slice(0, exos.length).reduce(function (a, b) { return a + b; }, 0) };
    });
    return { def: def, parties: parties, seed: seed, type: type };
  }
  EM.construireExamen = construire;

  function fmtDuree(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h ? h + ' h' : '') + (m ? (h ? ' ' : '') + m + ' min' : '');
  }

  /* ---------- choix de l'examen ---------- */
  EM.views.examens = function (main) {
    var P = EM.programme, k = EM.store.classe();
    var hist = EM.store.data().examens;
    var html = EM.ui.enTete('examens', 'S\'entraîner', 'Examens blancs', 'Sujets complets du CFEE, du BFEM et du BAC, chronométrés, notés sur 20 avec mention, et corrigés en détail. Chaque sujet a un code : toute une classe peut composer sur le même.') + '<div class="grid g2">';
    Object.keys(EXAMENS).forEach(function (t) {
      var e = EXAMENS[t], nb = EM.gensClasse(e.classe).length;
      html += '<div class="card' + (k === e.classe ? '" style="border-color:var(--primary)' : '') + '"><h2>' + esc(e.nom) + ' <span class="chip">' + esc(P.classes[e.classe].nom) + '</span></h2>' +
        '<p class="muted">' + esc(e.long) + ' · durée indicative ' + fmtDuree(e.duree) + '</p><p class="small">' + e.parties.map(function (p) { return esc(p.titre) + ' (' + p.points.reduce(function (a, b) { return a + b; }, 0) + ' pts)'; }).join(' · ') + '</p>' +
        (nb ? '<a class="btn" href="#/examen/' + t + '">Composer un sujet</a>' : '<span class="muted small">Sujets en préparation</span>') + '</div>';
    });
    html += '</div><div class="card"><h2>Devoir surveillé</h2><p class="muted">Un devoir de 5 exercices sur tout le programme d\'une classe.</p><div class="classes">' +
      P.listeClasses().map(function (c) {
        return EM.gensClasse(c).length ? '<a class="classe-btn" style="--c:' + P.classes[c].couleur + '" href="#/examen/ds?classe=' + c + '">' + esc(P.classes[c].nom) + '<small>devoir</small></a>' : '';
      }).join('') + '</div></div>' +
      '<div class="card"><h2>Composer avec un code</h2><p class="muted small">Le professeur donne un code de sujet : toute la classe compose sur les mêmes exercices.</p>' +
      '<div class="row"><input class="inp" id="code" placeholder="ex. BFEM-48213" aria-label="Code du sujet"><button class="btn" data-act="code">Ouvrir</button></div></div>';
    if (hist.length) {
      html += '<div class="card"><h2>Mes derniers examens</h2><div class="table-wrap"><table class="t"><tr><th>Date</th><th>Examen</th><th>Note</th><th>Mention</th></tr>' +
        hist.slice(0, 10).map(function (h) {
          return '<tr><td>' + esc(h.date.split('-').reverse().join('/')) + '</td><td>' + esc(h.nom) + '</td><td><strong>' + EM.T.txt(h.note) + '/20</strong></td><td>' + esc(EM.ui.mention(h.note)) + '</td></tr>';
        }).join('') + '</table></div></div>';
    }
    main.innerHTML = html;
    main.querySelector('[data-act="code"]').addEventListener('click', function () {
      var v = main.querySelector('#code').value.trim();
      var m = /^([a-z0-9-]+?)-(\d+)(?:-([a-z0-9-]+))?$/i.exec(v);
      if (!m) { EM.ui.toast('Code invalide. Exemple : BFEM-48213'); return; }
      var t = m[1].toLowerCase(), cls = m[3] ? m[3].toLowerCase() : null;
      if (t.indexOf('ds') === 0) EM.go('#/examen/ds?classe=' + (cls || EM.store.classe() || '3e') + '&s=' + m[2]);
      else if (EXAMENS[t]) EM.go('#/examen/' + t + '?s=' + m[2]);
      else EM.ui.toast('Examen inconnu : ' + m[1]);
    });
  };

  /* ---------- composition ---------- */
  EM.views.examen = function (main, parts, query) {
    var type = parts[0];
    var k = type === 'ds' ? (query.classe || EM.store.classe()) : (EXAMENS[type] && EXAMENS[type].classe);
    if (!k || !EM.programme.classes[k] || (type !== 'ds' && !EXAMENS[type])) return EM.views.introuvable(main);
    var seed = parseInt(query.s, 10);
    if (!(seed > 0)) seed = Math.floor(Math.random() * 90000) + 10000;
    var sujet = construire(type, k, seed);
    var code = (type === 'ds' ? 'DS' : sujet.def.nom.replace(/\s+/g, '-')) + '-' + seed + (type === 'ds' ? '-' + k : '');
    var nbEx = sujet.parties.reduce(function (s, p) { return s + p.exos.length; }, 0);
    if (!nbEx) { main.innerHTML = '<div class="card"><p>Pas encore assez d\'exercices pour composer ce sujet.</p><a class="btn" href="#/examens">Retour</a></div>'; return; }

    main.innerHTML = '<div class="crumbs"><a href="#/examens">' + EM.icon('gauche', { taille: 14 }) + 'Examens blancs</a></div>' +
      '<div class="entete-epreuve"><div><small>Épreuve blanche</small><strong>Mathématiques</strong></div><div><small>Examen</small><strong>' + esc(sujet.def.nom) + '</strong></div>' +
      '<div><small>Classe</small><strong>' + esc(EM.programme.classes[k].nom) + '</strong></div><div><small>Durée indicative</small><strong>' + fmtDuree(sujet.def.duree) + '</strong></div>' +
      '<div><small>Code du sujet</small><strong class="num">' + esc(code) + '</strong></div></div>' +
      '<div class="card"><h1 style="font-size:1.6rem">' + esc(sujet.def.long) + '</h1>' +
      '<p><button class="btn sm ghost" data-act="copy">' + EM.icon('copier') + 'Copier le code du sujet</button></p>' +
      '<ul><li>' + nbEx + ' exercices, notés sur 20.</li><li>Durée indicative : ' + fmtDuree(sujet.def.duree) + '.</li>' +
      '<li>Pas d\'indice ni de correction pendant l\'épreuve : tout est corrigé quand tu rends ta copie.</li>' +
      '<li>Une calculatrice est permise. Garde un brouillon à côté de toi.</li></ul>' +
      '<div class="row"><button class="btn gold" data-act="start" data-chrono="1">' + EM.icon('chrono') + 'Commencer avec chronomètre</button><button class="btn ghost" data-act="start">Sans chronomètre</button></div></div>';
    main.querySelector('[data-act="copy"]').addEventListener('click', function () { EM.ui.copy(code, 'Code copié : ' + code); });

    var timer = null;
    Array.prototype.forEach.call(main.querySelectorAll('[data-act="start"]'), function (b) {
      b.addEventListener('click', function () { composer(!!b.getAttribute('data-chrono')); });
    });

    function composer(chrono) {
      var debut = Date.now(), fin = debut + sujet.def.duree * 60000;
      var html = '<div class="exam-bar"><strong style="font-family:var(--font-display)">' + esc(sujet.def.nom) + ' · ' + esc(code) + '</strong><span class="timer" id="timer">' + (chrono ? '' : 'Sans chrono') + '</span>' +
        '<button class="btn sm gold" data-act="rendre">Rendre ma copie</button></div>';
      var n = 0;
      sujet.parties.forEach(function (p, pi) {
        html += '<div class="exam-part">' + esc(p.titre) + ' — ' + p.total + ' points</div>';
        p.exos.forEach(function (e, ei) {
          n++;
          html += '<div class="card exo" data-p="' + pi + '" data-e="' + ei + '"></div>';
        });
      });
      html += '<div class="row" style="justify-content:center"><button class="btn gold" data-act="rendre">Rendre ma copie</button></div>';
      main.innerHTML = html;
      var ctls = [];
      n = 0;
      sujet.parties.forEach(function (p, pi) {
        p.exos.forEach(function (e, ei) {
          n++;
          var el = main.querySelector('.exo[data-p="' + pi + '"][data-e="' + ei + '"]');
          ctls.push({ ctl: EM.ui.exercice(el, e.ex, { mode: 'examen', numero: (sujet.parties.length > 1 && p.exos.length === 1 ? p.titre : 'Exercice ' + n), points: e.points }), e: e, p: pi });
        });
      });
      if (chrono) {
        var t = main.querySelector('#timer');
        var tick = function () {
          var reste = Math.max(0, fin - Date.now());
          var mn = Math.floor(reste / 60000), s = Math.floor(reste / 1000) % 60;
          t.textContent = (mn >= 60 ? Math.floor(mn / 60) + ' h ' + String(mn % 60).padStart(2, '0') : mn) + ' min ' + String(s).padStart(2, '0') + ' s';
          t.classList.toggle('low', reste < 5 * 60000);
          if (reste <= 0) { clearInterval(timer); EM.ui.toast('Temps écoulé : copie ramassée !'); rendre(); }
        };
        tick();
        timer = setInterval(tick, 1000);
      }
      main.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-act="rendre"]')) {
          EM.ui.confirmer('Rendre ta copie ?', 'Tu ne pourras plus modifier tes réponses. La correction s\'affichera sous chaque exercice.', 'Rendre ma copie', function () { rendre(); });
        }
      });

      var rendu = false;
      function rendre() {
        if (rendu) return;
        rendu = true;
        if (timer) clearInterval(timer);
        var parPartie = sujet.parties.map(function () { return 0; }), total = 0;
        ctls.forEach(function (c) {
          var g = c.ctl.grade();
          var pts = Math.round(c.e.points * g.score * 4) / 4;
          parPartie[c.p] += pts;
          total += pts;
          c.ctl.lock();
          c.ctl.reveal(true);
          var el = main.querySelectorAll('.exo')[ctls.indexOf(c)];
          var tag = document.createElement('div');
          tag.className = 'result-banner ' + (g.ok ? 'ok' : 'ko');
          tag.textContent = 'Note : ' + EM.T.txt(pts) + ' / ' + c.e.points;
          el.insertBefore(tag, el.firstChild);
          EM.store.reponse({ gen: c.e.g.id, chapitres: c.e.g.chapitres, niveau: c.e.ex.niveau, ok: g.ok });
        });
        var note = Math.round(total * 4) / 4;
        var minutes = Math.round((Date.now() - debut) / 60000);
        var badges = EM.store.examen({ type: type, nom: sujet.def.nom + (type === 'ds' ? ' ' + EM.programme.classes[k].nom : ''), classe: k, note: note, date: EM.store.today(), duree: minutes, code: code });
        EM.ui.badges(badges);
        var bar = main.querySelector('.exam-bar');
        var res = document.createElement('div');
        res.className = 'card center';
        res.innerHTML = '<p class="muted">' + esc(sujet.def.long) + ' · code ' + esc(code) + '</p><div class="score-big">' + EM.T.txt(note) + '<span class="muted" style="font-size:1.4rem">/20</span></div>' +
          '<p class="mention">Mention : ' + esc(EM.ui.mention(note)) + '</p>' +
          '<div class="table-wrap"><table class="t"><tr>' + sujet.parties.map(function (p) { return '<th>' + esc(p.titre) + '</th>'; }).join('') + '</tr><tr>' +
          sujet.parties.map(function (p, i) { return '<td>' + EM.T.txt(parPartie[i]) + ' / ' + p.total + '</td>'; }).join('') + '</tr></table></div>' +
          '<p class="small muted" style="margin-top:10px">Temps utilisé : ' + minutes + ' min. Les corrections sont affichées sous chaque exercice.</p>' +
          '<div class="row" style="justify-content:center"><a class="btn" href="#/examen/' + type + (type === 'ds' ? '?classe=' + k : '') + '">Nouveau sujet</a><a class="btn ghost" href="#/progres">Mes progrès</a></div>';
        bar.replaceWith(res);
        Array.prototype.forEach.call(main.querySelectorAll('[data-act="rendre"]'), function (b) { b.remove(); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    return function () { if (timer) clearInterval(timer); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
