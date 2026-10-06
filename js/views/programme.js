/*
 * Programme : vue d'ensemble des classes, page d'une classe, page d'un chapitre.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  var KIND = { definition: 'Définition', theoreme: 'Théorème', propriete: 'Propriété', formule: 'Formule', remarque: 'Remarque', methode: 'Méthode' };
  var ETATS = ['Pas commencé', 'Découverte', 'En progrès', 'Maîtrisé'];

  function meter(p, ok) {
    return '<div class="meter' + (ok ? ' ok' : '') + '" role="img" aria-label="Maîtrise ' + Math.round(p * 100) + ' %"><i style="width:' + Math.round(p * 100) + '%"></i></div>';
  }
  EM.meter = meter;

  /* ---------- vue d'ensemble ---------- */
  EM.views.programme = function (main) {
    var P = EM.programme, S = EM.store, cur = S.classe();
    var html = '<div class="page-head"><div><h1>Le programme de mathématiques</h1><p class="muted" style="margin:0">Programme officiel du Sénégal, de l\'élémentaire au secondaire.</p></div>' +
      '<a class="btn ghost sm" href="#/recherche">🔍 Rechercher une notion</a></div>';
    P.cycles.forEach(function (c) {
      html += '<h2 class="section-title">' + esc(c.nom) + '</h2><div class="grid g3">';
      c.classes.forEach(function (k) {
        var cl = P.classes[k];
        var nbEx = EM.gensClasse(k).length;
        var p = S.progresClasse(k);
        html += '<a class="tile" href="#/classe/' + k + '" style="' + (k === cur ? 'border-color:var(--primary)' : '') + '">' +
          '<span class="ico" style="background:' + cl.couleur + ';color:#fff;font-weight:800;font-size:1rem">' + esc(cl.nom) + '</span>' +
          '<span style="flex:1"><h3>' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h3>' +
          '<p>' + cl.chapitres.length + ' chapitres · ' + nbEx + ' types d\'exercices</p>' + meter(p, p >= 0.7) + '</span></a>';
      });
      html += '</div>';
    });
    main.innerHTML = html;
  };

  /* ---------- une classe ---------- */
  EM.views.classe = function (main, parts) {
    var P = EM.programme, S = EM.store;
    var k = parts[0], cl = P.classes[k];
    if (!cl) return EM.views.introuvable(main);
    if (S.classe() !== k && !S.classe()) S.setClasse(k);
    var prog = Math.round(S.progresClasse(k) * 100);
    var html = '<div class="crumbs"><a href="#/programme">Programme</a> › ' + esc(cl.nom) + '</div>' +
      '<div class="card"><div class="row" style="gap:16px"><div class="ring" style="--p:' + prog + '"><span>' + prog + ' %</span></div>' +
      '<div style="flex:1;min-width:200px"><h1 style="margin:0">' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h1>' +
      '<p class="muted" style="margin:4px 0 0">' + cl.chapitres.length + ' chapitres — maîtrise moyenne ' + prog + ' %</p></div></div>' +
      '<div class="row" style="margin-top:14px">' +
      '<a class="btn" href="#/serie/' + k + '">♾️ Série de 10 exercices</a>' +
      '<a class="btn ghost" href="#/diagnostic/' + k + '">🩺 Diagnostic</a>' +
      '<a class="btn ghost" href="#/diagnostic/' + k + '?prerequis=1">↩️ Tester mes prérequis</a>' +
      '<a class="btn ghost" href="#/revision?classe=' + k + '">🗂️ Réviser</a>' +
      (cl.examen ? '<a class="btn gold" href="#/examens">📝 Examen blanc ' + esc(cl.examen) + '</a>' : '') + '</div></div>';

    var byDom = {};
    cl.chapitres.forEach(function (id) {
      var d = P.chapitres[id].domaine;
      (byDom[d] = byDom[d] || []).push(id);
    });
    var num = 0;
    Object.keys(P.domaines).forEach(function (d) {
      if (!byDom[d]) return;
      html += '<h2 class="section-title"><span aria-hidden="true">' + P.domaines[d].icone + '</span>' + esc(P.domaines[d].nom) + '</h2><ul class="chap-list">';
      byDom[d].forEach(function (id) {
        num++;
        var ch = P.chapitres[id], nbg = EM.gen.forChapter(id).length, e = S.etat(id), m = S.maitrise(id);
        html += '<li class="chap-item"><a href="#/chapitre/' + id + '?classe=' + k + '"><span class="chap-num">' + num + '</span>' +
          '<span><strong>' + esc(ch.titre) + '</strong><br><span class="meta"><span class="state-dot s' + e + '"></span> ' + ETATS[e] +
          (nbg ? ' · ' + nbg + ' exercice' + (nbg > 1 ? 's' : '') + ' générés' : '') + (EM.contenu[id] ? '' : ' · cours en préparation') + '</span></span>' +
          meter(m, e === 3) + '</a></li>';
      });
      html += '</ul>';
    });
    main.innerHTML = html;
  };

  /* ---------- un chapitre ---------- */
  function coursHtml(c) {
    var h = '';
    if (c.objectifs && c.objectifs.length) {
      h += '<div class="card flat"><h3>🎯 Objectifs</h3><ul>' + c.objectifs.map(function (o) { return '<li>' + EM.md(o) + '</li>'; }).join('') + '</ul></div>';
    }
    (c.cours || []).forEach(function (b) {
      var kind = b.type || 'definition';
      h += '<div class="bloc ' + esc(kind) + '"><h4><span class="kind">' + (KIND[kind] || esc(kind)) + '</span>' + EM.md(b.titre || '') + '</h4><div>' + EM.md(b.texte || '') + '</div></div>';
    });
    if (c.histoire) h += '<div class="history" style="margin-top:14px"><strong>📜 Un peu d\'histoire.</strong> ' + EM.md(c.histoire) + '</div>';
    return h || '<p class="muted">Le cours de ce chapitre est en préparation.</p>';
  }
  function methodesHtml(c) {
    var h = '';
    (c.methodes || []).forEach(function (m) {
      h += '<div class="card flat method"><h3>🛠️ ' + EM.md(m.titre) + '</h3><ol>' + (m.etapes || []).map(function (e) { return '<li>' + EM.md(e) + '</li>'; }).join('') + '</ol></div>';
    });
    if (c.exemple) {
      h += '<div class="card flat"><h3>✍️ Exemple corrigé</h3><div>' + EM.md(c.exemple.enonce) + '</div>' +
        '<details style="margin-top:10px"><summary class="btn sm ghost" style="display:inline-flex">Voir la correction</summary><div class="solution"><ol>' +
        (c.exemple.solution || []).map(function (s) { return '<li>' + EM.md(s) + '</li>'; }).join('') + '</ol></div></details></div>';
    }
    if (c.erreurs && c.erreurs.length) {
      h += '<h3>⚠️ Pièges fréquents</h3>' + c.erreurs.map(function (e) { return '<div class="pitfall">' + EM.md(e) + '</div>'; }).join('');
    }
    return h || '<p class="muted">Les méthodes de ce chapitre sont en préparation.</p>';
  }
  function exercicesHtml(id) {
    var gens = EM.gen.forChapter(id);
    if (!gens.length) return '<p class="muted">Pas encore d\'exercices générés pour ce chapitre. Utilise l\'exemple corrigé et le problème « Au Sénégal ».</p>';
    var h = '<div class="row" style="margin-bottom:12px"><a class="btn" href="#/serie/chapitre/' + id + '">♾️ Série de 10 exercices du chapitre</a></div><div class="grid g2">';
    gens.forEach(function (g) {
      var st = EM.store.data().gens[g.id];
      var conseil = EM.store.niveauConseille(g.id);
      h += '<div class="card flat"><h3>' + EM.md(g.titre) + '</h3><p class="small muted">' + (st ? st.ok + ' réussi' + (st.ok > 1 ? 's' : '') + ' sur ' + st.tent : 'Jamais fait') +
        (g.examen ? ' · <span class="chip gold">type examen</span>' : '') + '</p><div class="row">';
      for (var n = 1; n <= g.niveaux; n++) {
        h += '<a class="btn sm ' + (n === conseil ? '' : 'ghost') + '" href="#/exo/' + g.id + '?n=' + n + '&ch=' + id + '" title="' + EM.ui.niveauNom(n) + '">Niveau ' + n + '</a>';
      }
      h += '</div></div>';
    });
    return h + '</div>';
  }
  function senegalHtml(c) {
    if (!c.contexte) return '<p class="muted">Problème en préparation.</p>';
    return '<div class="senegal"><h3>🇸🇳 ' + EM.md(c.contexte.titre || 'Problème') + '</h3><div>' + EM.md(c.contexte.enonce) + '</div>' +
      '<details style="margin-top:10px"><summary class="btn sm ghost" style="display:inline-flex">Voir la solution</summary><div class="solution"><ol>' +
      (c.contexte.solution || []).map(function (s) { return '<li>' + EM.md(s) + '</li>'; }).join('') + '</ol></div></details></div>';
  }
  function cartesHtml(id, c) {
    var fc = c.flashcards || [];
    if (!fc.length) return '<p class="muted">Pas encore de cartes.</p>';
    return '<p class="muted small">Touche une carte pour voir la réponse. Pour mémoriser durablement, utilise la <a href="#/revision?chapitre=' + id + '">révision espacée</a>.</p><div class="grid g2">' +
      fc.map(function (f) {
        return '<button class="flash-card" style="min-height:120px;font-size:1rem" data-flip><span><span class="flash-side">Question</span><br>' + EM.md(f.q) +
          '</span><span class="hidden"><span class="flash-side">Réponse</span><br>' + EM.md(f.r) + '</span></button>';
      }).join('') + '</div>';
  }

  EM.views.chapitre = function (main, parts, query) {
    var P = EM.programme, S = EM.store;
    var id = parts[0], ch = P.chapitres[id];
    if (!ch) return EM.views.introuvable(main);
    var c = EM.contenu[id] || {};
    var k = query.classe && ch.classes.indexOf(query.classe) >= 0 ? query.classe : (ch.classes.indexOf(S.classe()) >= 0 ? S.classe() : ch.classes[0]);
    var cl = P.classes[k];
    S.marquerVu(id);
    var e = S.etat(id), m = S.maitrise(id);

    var pre = ch.prerequis.filter(function (p) { return P.chapitres[p]; });
    var fragiles = pre.filter(function (p) { var st = S.etat(p); return st === 1; });
    var idx = cl.chapitres.indexOf(id);
    var prev = cl.chapitres[idx - 1], next = cl.chapitres[idx + 1];

    var tabs = [['cours', '📖 Cours'], ['methodes', '🛠️ Méthodes'], ['exercices', '♾️ Exercices'], ['senegal', '🇸🇳 Au Sénégal'], ['cartes', '🗂️ Cartes']];
    var tab = query.onglet && tabs.some(function (t) { return t[0] === query.onglet; }) ? query.onglet : 'cours';

    var html = '<div class="crumbs"><a href="#/programme">Programme</a> › <a href="#/classe/' + k + '">' + esc(cl.nom) + '</a> › ' + esc(ch.titre) + '</div>' +
      '<div class="card"><div class="row between"><div style="flex:1;min-width:220px"><h1 style="margin-bottom:6px">' + esc(ch.titre) + '</h1>' +
      (c.resume ? '<p class="muted" style="margin:0">' + EM.md(c.resume) + '</p>' : '') + '</div>' +
      '<div style="min-width:150px"><div class="small muted"><span class="state-dot s' + e + '"></span> ' + ETATS[e] + ' · ' + Math.round(m * 100) + ' %</div>' + meter(m, e === 3) + '</div></div>' +
      '<div class="row small" style="margin-top:10px"><span class="muted">Classe' + (ch.classes.length > 1 ? 's' : '') + ' :</span>' +
      ch.classes.map(function (x) { return '<a class="chip" href="#/classe/' + x + '">' + esc(P.classes[x].nom) + '</a>'; }).join('') +
      '<span class="chip">' + P.domaines[ch.domaine].icone + ' ' + esc(P.domaines[ch.domaine].nom) + '</span></div>';
    if (pre.length) {
      html += '<div class="row small" style="margin-top:8px"><span class="muted">Prérequis :</span>' + pre.map(function (p) {
        var st = S.etat(p);
        return '<a class="chip ' + (st === 3 ? 'ok' : st === 1 ? 'ko' : '') + '" href="#/chapitre/' + p + '"><span class="state-dot s' + st + '"></span>' + esc(P.chapitres[p].titre) +
          ' <span class="muted">(' + esc(P.classes[P.chapitres[p].classes[0]].nom) + ')</span></a>';
      }).join('') + '</div>';
      if (fragiles.length) html += '<p class="pitfall small" style="margin:10px 0 0">Conseil : tes résultats montrent des difficultés sur « ' + esc(P.chapitres[fragiles[0]].titre) + ' ». Revois ce prérequis pour avancer plus facilement.</p>';
    }
    html += '</div><div class="tabs" role="tablist">' + tabs.map(function (t) {
      return '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>';
    }).join('') + '</div><div class="tab-body"></div>' +
      '<div class="row between" style="margin-top:20px">' +
      (prev ? '<a class="btn ghost sm" href="#/chapitre/' + prev + '?classe=' + k + '">← ' + esc(P.chapitres[prev].titre) + '</a>' : '<span></span>') +
      (next ? '<a class="btn ghost sm" href="#/chapitre/' + next + '?classe=' + k + '">' + esc(P.chapitres[next].titre) + ' →</a>' : '') + '</div>';
    main.innerHTML = html;

    var body = main.querySelector('.tab-body');
    function show(t) {
      tab = t;
      Array.prototype.forEach.call(main.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === t); });
      body.innerHTML = t === 'cours' ? coursHtml(c) : t === 'methodes' ? methodesHtml(c) : t === 'exercices' ? exercicesHtml(id) : t === 'senegal' ? senegalHtml(c) : cartesHtml(id, c);
      try { history.replaceState(null, '', '#/chapitre/' + id + '?classe=' + k + '&onglet=' + t); } catch (err) { /* rien */ }
    }
    main.querySelector('.tabs').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tab]');
      if (b) show(b.getAttribute('data-tab'));
    });
    body.addEventListener('click', function (ev) {
      var f = ev.target.closest('[data-flip]');
      if (!f) return;
      var sp = f.children;
      sp[0].classList.toggle('hidden');
      sp[1].classList.toggle('hidden');
      f.classList.toggle('back');
    });
    show(tab);
  };
})(typeof window !== 'undefined' ? window : globalThis);
