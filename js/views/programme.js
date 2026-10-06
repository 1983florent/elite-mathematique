/*
 * Programme : vue d'ensemble des classes, page d'une classe, page d'un chapitre.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  var I = function (n, o) { return EM.icon(n, o); };
  EM.views = EM.views || {};

  var KIND = { definition: 'Définition', theoreme: 'Théorème', propriete: 'Propriété', formule: 'Formule', remarque: 'Remarque', methode: 'Méthode' };
  var ETATS = ['Pas commencé', 'Découverte', 'En progrès', 'Maîtrisé'];
  var ICO_DOMAINE = { nombres: 'calculatrice', algebre: 'sigma', analyse: 'courbe', geometrie: 'cercle', mesures: 'regle', stats: 'barres', arith: 'diese' };
  EM.ICO_DOMAINE = ICO_DOMAINE;

  function meter(p, ok) {
    return '<div class="meter' + (ok ? ' ok' : '') + '" role="img" aria-label="Maîtrise ' + Math.round(p * 100) + ' %"><i style="width:' + Math.round(p * 100) + '%"></i></div>';
  }
  EM.meter = meter;

  /* ---------- vue d'ensemble ---------- */
  EM.views.programme = function (main) {
    var P = EM.programme, S = EM.store, cur = S.classe();
    var html = EM.bandeau('programme', '<p class="eyebrow">Programme officiel du Sénégal</p><h1>Le programme de mathématiques</h1>' +
      '<p style="max-width:58ch">' + P.ordre.length + ' chapitres, du CM2 à la Terminale. Choisis une classe sur la ligne ou dans la liste.</p>' +
      '<a class="btn sm ghost" href="#/recherche">' + I('recherche') + 'Rechercher une notion</a>');
    html += '<section class="parcours">' + EM.parcoursHtml(cur) + '</section>';
    P.cycles.forEach(function (c) {
      html += '<h2 class="section-title">' + I(c.id === 'secondaire' ? 'ecole' : 'livre') + esc(c.nom) + '</h2><div class="grid g3">';
      c.classes.forEach(function (k) {
        var cl = P.classes[k];
        var nbEx = EM.gensClasse(k).length;
        var p = S.progresClasse(k);
        html += '<a class="tile" href="#/classe/' + k + '"' + (k === cur ? ' style="border-color:var(--gold)"' : '') + '>' +
          '<span class="ico-box' + (cl.examen ? ' or' : '') + '" style="font-family:var(--font-display);font-weight:800;font-size:.86rem">' + esc(cl.nom.replace(/ (S1|S2|S|L)$/, '')) + '</span>' +
          '<span style="flex:1;min-width:0"><h3>' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h3>' +
          '<p class="num">' + cl.chapitres.length + ' chapitres · ' + nbEx + ' types d\'exercices</p><div style="margin-top:8px">' + meter(p, p >= 0.7) + '</div></span></a>';
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
    if (!S.classe()) S.setClasse(k);
    var prog = Math.round(S.progresClasse(k) * 100);
    var nbEx = EM.gensClasse(k).length;
    var html = EM.bandeau(k, '<div class="crumbs"><a href="#/programme">Programme</a>' + I('droite', { taille: 14 }) + esc(cl.nom) + '</div>' +
      '<div class="salut"><div class="ring" style="--p:' + prog + '"><span class="num">' + prog + ' %</span></div>' +
      '<div><h1 style="margin:0">' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h1>' +
      '<p style="margin:6px 0 0" class="num">' + cl.chapitres.length + ' chapitres · ' + nbEx + ' types d\'exercices · maîtrise moyenne ' + prog + ' %</p></div></div>' +
      '<div class="row" style="margin-top:16px"><a class="btn gold" href="#/serie/' + k + '">' + I('infini') + 'Série de 10 exercices</a>' +
      '<a class="btn ghost" href="#/diagnostic/' + k + '">' + I('pouls') + 'Diagnostic</a>' +
      '<a class="btn ghost" href="#/diagnostic/' + k + '?prerequis=1">' + I('rafraichir') + 'Tester mes prérequis</a>' +
      '<a class="btn ghost" href="#/memento/' + k + '">' + I('memento') + 'Mémento</a>' +
      (cl.examen ? '<a class="btn ghost" href="#/examens">' + I('copie') + 'Examen blanc ' + esc(cl.examen) + '</a>' : '') + '</div>');

    var byDom = {};
    cl.chapitres.forEach(function (id) {
      var d = P.chapitres[id].domaine;
      (byDom[d] = byDom[d] || []).push(id);
    });
    var num = 0;
    Object.keys(P.domaines).forEach(function (d) {
      if (!byDom[d]) return;
      html += '<h2 class="section-title">' + I(ICO_DOMAINE[d] || 'livre') + esc(P.domaines[d].nom) + '</h2><ul class="chap-list">';
      byDom[d].forEach(function (id) {
        num++;
        var ch = P.chapitres[id], nbg = EM.gen.forChapter(id).length, e = S.etat(id), m = S.maitrise(id);
        var nbd = EM.demos ? EM.demos.forChapter(id).length : 0;
        html += '<li class="chap-item"><a href="#/chapitre/' + id + '?classe=' + k + '"><span class="chap-num num">' + num + '</span>' +
          '<span style="min-width:0"><strong>' + esc(ch.titre) + '</strong><br><span class="meta"><span class="state-dot s' + e + '"></span> ' + ETATS[e] +
          (nbg ? ' · ' + nbg + ' exercice' + (nbg > 1 ? 's' : '') : '') + (nbd ? ' · ' + nbd + ' démo' + (nbd > 1 ? 's' : '') : '') + '</span></span>' +
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
      h += '<div class="objectifs"><h3>' + I('cible') + 'Objectifs du chapitre</h3><ul>' + c.objectifs.map(function (o) { return '<li>' + EM.md(o) + '</li>'; }).join('') + '</ul></div>';
    }
    (c.cours || []).forEach(function (b) {
      var kind = b.type || 'definition';
      h += '<div class="bloc ' + esc(kind) + '"><h4><span class="kind">' + (KIND[kind] || esc(kind)) + '</span>' + EM.md(b.titre || '') + '</h4><div>' + EM.md(b.texte || '') + '</div></div>';
    });
    if (c.histoire) h += '<div class="history" style="margin-top:16px"><p class="eyebrow">Un peu d\'histoire</p>' + EM.md(c.histoire) + '</div>';
    return h || '<p class="muted">Le cours de ce chapitre est en préparation.</p>';
  }
  function methodesHtml(c) {
    var h = '';
    (c.methodes || []).forEach(function (m) {
      h += '<div class="card method"><h3>' + I('crayon') + EM.md(m.titre) + '</h3><ol>' + (m.etapes || []).map(function (e) { return '<li>' + EM.md(e) + '</li>'; }).join('') + '</ol></div>';
    });
    if (c.exemple) {
      h += '<div class="card"><h3 style="display:flex;gap:8px;align-items:center">' + I('copie') + 'Exemple corrigé</h3><div>' + EM.md(c.exemple.enonce) + '</div>' +
        '<details style="margin-top:12px"><summary class="btn sm ghost">' + I('oeil') + 'Voir la correction</summary><div class="solution"><ol>' +
        (c.exemple.solution || []).map(function (s) { return '<li>' + EM.md(s) + '</li>'; }).join('') + '</ol></div></details></div>';
    }
    if (c.erreurs && c.erreurs.length) {
      h += '<h3 class="section-title" style="margin-top:20px">' + I('attention') + 'Pièges fréquents</h3>' + c.erreurs.map(function (e) { return '<div class="pitfall"><div>' + EM.md(e) + '</div></div>'; }).join('');
    }
    return h || '<p class="muted">Les méthodes de ce chapitre sont en préparation.</p>';
  }
  function exercicesHtml(id) {
    var gens = EM.gen.forChapter(id).filter(function (g) { return !g.mission; });
    if (!gens.length) return '<p class="muted">Pas encore d\'exercices générés pour ce chapitre. Utilise l\'exemple corrigé et le problème « Au Sénégal ».</p>';
    var h = '<div class="row" style="margin-bottom:14px"><a class="btn" href="#/serie/chapitre/' + id + '">' + I('infini') + 'Série de 10 exercices du chapitre</a></div><div class="grid g2">';
    gens.forEach(function (g) {
      var st = EM.store.data().gens[g.id];
      var conseil = EM.store.niveauConseille(g.id);
      h += '<div class="card" style="margin:0"><h3>' + EM.md(g.titre) + '</h3><p class="small muted num">' + (st ? st.ok + ' réussi' + (st.ok > 1 ? 's' : '') + ' sur ' + st.tent : 'Pas encore fait') +
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
    return '<div class="senegal"><p class="eyebrow">Au Sénégal</p><h3>' + EM.md(c.contexte.titre || 'Problème') + '</h3><div>' + EM.md(c.contexte.enonce) + '</div>' +
      '<details style="margin-top:12px"><summary class="btn sm ghost">' + I('oeil') + 'Voir la solution</summary><div class="solution"><ol>' +
      (c.contexte.solution || []).map(function (s) { return '<li>' + EM.md(s) + '</li>'; }).join('') + '</ol></div></details></div>';
  }
  function cartesHtml(id, c) {
    var fc = c.flashcards || [];
    if (!fc.length) return '<p class="muted">Pas encore de cartes.</p>';
    return '<p class="muted small">Touche une carte pour voir la réponse. Pour mémoriser durablement, utilise la <a href="#/revision?chapitre=' + id + '">révision espacée</a>.</p><div class="grid g2">' +
      fc.map(function (f) {
        return '<button class="flash-card" style="min-height:130px;font-size:1rem" data-flip><span><span class="flash-side">Question</span><br>' + EM.md(f.q) +
          '</span><span class="hidden"><span class="flash-side">Réponse</span><br>' + EM.md(f.r) + '</span></button>';
      }).join('') + '</div>';
  }

  function asideHtml(id, ch, k) {
    var P = EM.programme, S = EM.store;
    var e = S.etat(id), m = S.maitrise(id);
    var gens = EM.gen.forChapter(id).filter(function (g) { return !g.mission; });
    var missions = EM.gen.forChapter(id).filter(function (g) { return g.mission; });
    var demos = EM.demos ? EM.demos.forChapter(id) : [];
    var portraits = (EM.histoire || []).map(function (h, i) { return { h: h, i: i }; }).filter(function (x) { return (x.h.chapitres || []).indexOf(id) >= 0; });
    var pre = ch.prerequis.filter(function (p) { return P.chapitres[p]; });
    var h = '<div class="card"><h3>Ma maîtrise</h3><div class="row" style="justify-content:space-between"><span class="small"><span class="state-dot s' + e + '"></span> ' + ETATS[e] + '</span>' +
      '<strong class="num" style="font-family:var(--font-display)">' + Math.round(m * 100) + ' %</strong></div><div style="margin:8px 0 12px">' + meter(m, e === 3) + '</div>' +
      (gens.length ? '<a class="btn sm block" href="#/serie/chapitre/' + id + '">' + I('infini') + 'S\'entraîner (' + gens.length + ' types)</a>' : '') + '</div>';
    if (demos.length) {
      h += '<div class="card"><h3>Démonstrations</h3><div class="aside-links">' + demos.map(function (d) {
        return '<a href="#/demo/' + d.id + '?ch=' + id + '">' + I('curseurs') + '<span>' + EM.md(d.titre) + '</span></a>';
      }).join('') + '</div></div>';
    }
    if (missions.length) {
      h += '<div class="card"><h3>Missions Sénégal</h3><div class="aside-links">' + missions.map(function (g) {
        return '<a href="#/exo/' + g.id + '?ch=' + id + '">' + I('carte') + '<span>' + EM.md(g.titre) + '</span></a>';
      }).join('') + '</div></div>';
    }
    if (pre.length) {
      h += '<div class="card"><h3>Prérequis</h3><div class="aside-links">' + pre.map(function (p) {
        var st = S.etat(p);
        return '<a href="#/chapitre/' + p + '"><span class="state-dot s' + st + '"></span><span>' + esc(P.chapitres[p].titre) + ' <span class="muted small">· ' + esc(P.classes[P.chapitres[p].classes[0]].nom) + '</span></span></a>';
      }).join('') + '</div></div>';
    }
    if (portraits.length) {
      h += '<div class="card"><h3>Dans l\'histoire</h3><div class="aside-links">' + portraits.slice(0, 3).map(function (x) {
        return '<a href="#/histoire?p=' + x.i + '">' + I('colonnes') + '<span>' + esc(x.h.nom) + '</span></a>';
      }).join('') + '</div></div>';
    }
    return h;
  }

  EM.views.chapitre = function (main, parts, query) {
    var P = EM.programme, S = EM.store;
    var id = parts[0], ch = P.chapitres[id];
    if (!ch) return EM.views.introuvable(main);
    var c = EM.contenu[id] || {};
    var k = query.classe && ch.classes.indexOf(query.classe) >= 0 ? query.classe : (ch.classes.indexOf(S.classe()) >= 0 ? S.classe() : ch.classes[0]);
    var cl = P.classes[k];
    S.marquerVu(id);

    var pre = ch.prerequis.filter(function (p) { return P.chapitres[p]; });
    var fragiles = pre.filter(function (p) { return S.etat(p) === 1; });
    var idx = cl.chapitres.indexOf(id);
    var prev = cl.chapitres[idx - 1], next = cl.chapitres[idx + 1];

    var tabs = [['cours', 'Cours', 'livre'], ['methodes', 'Méthodes', 'crayon'], ['exercices', 'Exercices', 'infini'], ['senegal', 'Au Sénégal', 'carte'], ['cartes', 'Cartes', 'cartes']];
    var tab = query.onglet && tabs.some(function (t) { return t[0] === query.onglet; }) ? query.onglet : 'cours';

    var html = EM.bandeau(id, '<div class="crumbs"><a href="#/programme">Programme</a>' + I('droite', { taille: 14 }) + '<a href="#/classe/' + k + '">' + esc(cl.long) + '</a></div>' +
      '<p class="eyebrow">' + esc(P.domaines[ch.domaine].nom) + '</p><h1 style="margin-bottom:8px;font-size:clamp(1.6rem,1.2rem+1.6vw,2.4rem)">' + esc(ch.titre) + '</h1>' +
      (c.resume ? '<p style="max-width:60ch;margin:0">' + EM.md(c.resume) + '</p>' : '') +
      '<div class="row small" style="margin-top:12px">' + ch.classes.map(function (x) { return '<a class="chip" href="#/classe/' + x + '">' + esc(P.classes[x].nom) + '</a>'; }).join('') + '</div>',
      { rows: 3 });
    if (fragiles.length) html += '<div class="pitfall small"><div>Tes résultats montrent des difficultés sur le prérequis « <a href="#/chapitre/' + fragiles[0] + '">' + esc(P.chapitres[fragiles[0]].titre) + '</a> ». Le revoir t\'aidera à avancer.</div></div>';
    html += '<div class="chap-layout"><div style="min-width:0"><div class="tabs" role="tablist">' + tabs.map(function (t) {
      return '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + I(t[2]) + t[1] + '</button>';
    }).join('') + '</div><div class="tab-body"></div>' +
      '<div class="row between" style="margin-top:24px">' +
      (prev ? '<a class="btn ghost sm" href="#/chapitre/' + prev + '?classe=' + k + '">' + I('gauche') + esc(P.chapitres[prev].titre) + '</a>' : '<span></span>') +
      (next ? '<a class="btn ghost sm" href="#/chapitre/' + next + '?classe=' + k + '">' + esc(P.chapitres[next].titre) + I('droite') + '</a>' : '') + '</div></div>' +
      '<aside class="chap-aside">' + asideHtml(id, ch, k) + '</aside></div>';
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
