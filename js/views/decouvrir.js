/*
 * Rubriques : Missions Sénégal, démonstrations interactives, guides « Réussir son examen »,
 * grands noms des mathématiques, mémento (aide-mémoire par classe), calcul mental chronométré.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  var I = function (n, o) { return EM.icon(n, o); };
  EM.views = EM.views || {};

  function chipsChapitres(ids, max) {
    var P = EM.programme;
    return (ids || []).filter(function (c) { return P.chapitres[c]; }).slice(0, max || 3).map(function (c) {
      return '<span class="chip">' + esc(P.chapitres[c].titre) + '</span>';
    }).join('');
  }
  function lsGet(k, def) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? def : v; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* rien */ } }

  /* =================== Missions Sénégal =================== */
  EM.views.missions = function (main, parts, query) {
    var P = EM.programme;
    var toutes = EM.gen.list().filter(function (g) { return g.mission; });
    var k = EM.store.classe();
    var filtre = query.cycle || 'tous';
    var cycles = [['tous', 'Toutes'], ['elementaire', 'Élémentaire'], ['moyen', 'Collège'], ['secondaire', 'Lycée']];
    var liste = toutes.filter(function (g) { return filtre === 'tous' || g.cycle === filtre; });
    // la classe de l'élève d'abord
    liste.sort(function (a, b) {
      var ka = a.classe === k ? 0 : 1, kb = b.classe === k ? 0 : 1;
      if (ka !== kb) return ka - kb;
      return P.listeClasses().indexOf(a.classe) - P.listeClasses().indexOf(b.classe);
    });
    var html = EM.ui.enTete('missions', 'Apprendre', 'Missions Sénégal',
      'Des projets concrets de la vie au Sénégal, résolus en plusieurs étapes : chaque mission mobilise plusieurs chapitres du programme. Les données changent à chaque nouvelle tentative.') +
      '<div class="row" style="margin-bottom:16px">' + cycles.map(function (c) {
        return '<a class="chip' + (filtre === c[0] ? ' gold' : '') + '" href="#/missions?cycle=' + c[0] + '">' + c[1] + '</a>';
      }).join('') + '</div>';
    if (!liste.length) {
      html += '<div class="card"><p class="muted">Les missions de cette catégorie sont en préparation.</p></div>';
    } else {
      html += '<div class="grid g3">' + liste.map(function (g) {
        var cl = P.classes[g.classe];
        return '<a class="mission-card" href="#/exo/' + g.id + '"><p class="eyebrow" style="margin:0">' + esc(cl ? cl.long : '') + (g.classe === k ? ' · ta classe' : '') + '</p>' +
          '<h3>' + EM.md(g.titre) + '</h3><p>' + EM.md(g.resume || '') + '</p><div class="row">' + chipsChapitres(g.chapitres, 2) + '</div></a>';
      }).join('') + '</div>';
    }
    main.innerHTML = html;
  };

  /* =================== Démonstrations =================== */
  EM.views.demos = function (main) {
    var demos = EM.demos ? EM.demos.list() : [];
    var html = EM.ui.enTete('demos', 'Apprendre', 'Démonstrations animées',
      'Fais bouger les figures, déplace les curseurs : les propriétés restent vraies sous tes yeux. Idéal pour comprendre un théorème avant de l\'appliquer.');
    if (!demos.length) html += '<div class="card"><p class="muted">Les démonstrations sont en préparation.</p></div>';
    else html += '<div class="grid g3">' + demos.map(function (d) {
      return '<a class="demo-card" href="#/demo/' + d.id + '"><span class="ico-box" style="margin-bottom:6px">' + I('curseurs') + '</span><h3>' + EM.md(d.titre) + '</h3>' +
        '<p>' + EM.md(d.resume || '') + '</p><div class="row" style="margin-top:8px">' + chipsChapitres(d.chapitres, 2) + '</div></a>';
    }).join('') + '</div>';
    main.innerHTML = html;
  };

  EM.views.demo = function (main, parts, query) {
    var d = EM.demos && EM.demos.get(parts[0]);
    if (!d) return EM.views.introuvable(main);
    var P = EM.programme;
    var autres = EM.demos.list().filter(function (x) { return x.id !== d.id; }).slice(0, 6);
    main.innerHTML = '<div class="crumbs"><a href="#/demos">' + I('gauche', { taille: 14 }) + 'Démonstrations</a>' +
      (query.ch && P.chapitres[query.ch] ? I('droite', { taille: 14 }) + '<a href="#/chapitre/' + query.ch + '">' + esc(P.chapitres[query.ch].titre) + '</a>' : '') + '</div>' +
      '<div class="page-head"><div><p class="eyebrow">Démonstration interactive</p><h1>' + EM.md(d.titre) + '</h1><p class="muted">' + EM.md(d.resume || '') + '</p></div></div>' +
      '<div class="chap-layout"><div class="demo-zone" style="min-width:0"></div><aside class="chap-aside">' +
      ((d.chapitres || []).length ? '<div class="card"><h3>Dans le programme</h3><div class="aside-links">' + d.chapitres.filter(function (c) { return P.chapitres[c]; }).map(function (c) {
        return '<a href="#/chapitre/' + c + '">' + I('livre') + '<span>' + esc(P.chapitres[c].titre) + ' <span class="muted small">· ' + esc(P.classes[P.chapitres[c].classes[0]].nom) + '</span></span></a>';
      }).join('') + '</div></div>' : '') +
      (autres.length ? '<div class="card"><h3>Autres démonstrations</h3><div class="aside-links">' + autres.map(function (x) {
        return '<a href="#/demo/' + x.id + '">' + I('curseurs') + '<span>' + EM.md(x.titre) + '</span></a>';
      }).join('') + '</div></div>' : '') + '</aside></div>';
    var zone = main.querySelector('.demo-zone');
    var nettoyage = null;
    try { nettoyage = d.render(zone); } catch (e) {
      console.error(e);
      zone.innerHTML = '<p class="muted">Cette démonstration ne peut pas s\'afficher sur cet appareil.</p>';
    }
    return typeof nettoyage === 'function' ? nettoyage : null;
  };

  /* =================== Réussir son examen =================== */
  EM.views.guides = function (main) {
    var gs = EM.guides || [];
    var k = EM.store.classe();
    var html = EM.ui.enTete('guides', 'Ressources', 'Réussir son examen',
      'Comprendre l\'épreuve, gérer son temps, rédiger une solution complète, éviter les erreurs qui coûtent des points, et la check-list de la veille et du jour J.');
    if (!gs.length) html += '<div class="card"><p class="muted">Les guides sont en préparation.</p></div>';
    else html += '<div class="grid g2">' + gs.map(function (g) {
      var cl = g.classe && EM.programme.classes[g.classe];
      var pourMoi = (g.classes || [g.classe]).indexOf(k) >= 0;
      return '<a class="tile" href="#/guide/' + g.id + '"' + (pourMoi ? ' style="border-color:var(--gold)"' : '') + '><span class="ico-box ' + (cl ? 'or' : '') + '">' + I(cl ? 'copie' : 'boussole') + '</span>' +
        '<span><h3>' + esc(g.titre) + (pourMoi ? ' <span class="chip gold">ta classe</span>' : '') + '</h3><p>' + EM.md(g.resume || '') + '</p><p class="small" style="margin-top:6px">' + (g.sections || []).length + ' sections' +
        (g.classes ? ' · ' + g.classes.map(function (c) { return esc(EM.programme.classes[c] ? EM.programme.classes[c].nom : c); }).join(', ') : cl ? ' · ' + esc(cl.nom) : '') + '</p></span></a>';
    }).join('') + '</div>';
    main.innerHTML = html;
  };

  EM.views.guide = function (main, parts) {
    var g = (EM.guides || []).filter(function (x) { return x.id === parts[0]; })[0];
    if (!g) return EM.views.introuvable(main);
    var cle = 'em.guide.' + g.id, coches = lsGet(cle, {});
    var html = '<div class="crumbs"><a href="#/guides">' + I('gauche', { taille: 14 }) + 'Réussir son examen</a></div>' +
      EM.ui.enTete('guide:' + g.id, 'Guide', esc(g.titre), g.resume ? EM.md(g.resume) : '') +
      '<div class="chap-layout"><div style="min-width:0">';
    (g.sections || []).forEach(function (s, i) {
      html += '<section class="card guide-section" id="g-' + i + '"><h2>' + EM.md(s.titre) + '</h2><div>' + EM.md(s.texte || '') + '</div>' +
        ((s.points || []).length ? '<ul>' + s.points.map(function (p) { return '<li>' + EM.md(p) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
    });
    if ((g.erreurs || []).length) {
      html += '<h2 class="section-title">' + I('attention') + 'Les erreurs qui coûtent des points</h2>' + g.erreurs.map(function (e) { return '<div class="pitfall"><div>' + EM.md(e) + '</div></div>'; }).join('');
    }
    html += '</div><aside class="chap-aside"><div class="card"><h3>Sommaire</h3><nav class="guide-toc">' + (g.sections || []).map(function (s, i) {
      return '<a href="#g-' + i + '" data-ancre="g-' + i + '">' + EM.md(s.titre) + '</a>';
    }).join('') + '</nav></div>' +
      ((g.checklist || []).length ? '<div class="card"><h3>Check-list</h3><ul class="checklist">' + g.checklist.map(function (c, i) {
        return '<li><label class="check"><input type="checkbox" data-c="' + i + '"' + (coches[i] ? ' checked' : '') + '> <span>' + EM.md(c) + '</span></label></li>';
      }).join('') + '</ul></div>' : '') + '</aside></div>';
    main.innerHTML = html;
    main.addEventListener('click', function (e) {
      var a = e.target.closest('[data-ancre]');
      if (!a) return;
      e.preventDefault();
      var cible = main.querySelector('#' + a.getAttribute('data-ancre'));
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    main.addEventListener('change', function (e) {
      var c = e.target.closest('[data-c]');
      if (!c) return;
      coches[c.getAttribute('data-c')] = c.checked;
      lsSet(cle, coches);
    });
  };

  /* =================== Grands noms des mathématiques =================== */
  EM.views.histoire = function (main, parts, query) {
    var tous = EM.histoire || [];
    var P = EM.programme;
    var regions = EM.util.uniq(tous.map(function (h) { return h.region; }).filter(Boolean));
    var region = query.region && regions.indexOf(query.region) >= 0 ? query.region : '';
    var hs = tous;
    var html = EM.ui.enTete('histoire', 'Ressources', 'Grands noms des mathématiques',
      'De l\'os d\'Ishango à l\'AIMS de Mbour : des femmes et des hommes, d\'Afrique et du monde entier, qui ont construit les mathématiques que tu apprends.');
    if (regions.length) {
      html += '<div class="row" style="margin-bottom:16px"><a class="chip' + (region ? '' : ' gold') + '" href="#/histoire">Toutes (' + tous.length + ')</a>' + regions.map(function (r) {
        var n = tous.filter(function (h) { return h.region === r; }).length;
        return '<a class="chip' + (region === r ? ' gold' : '') + '" href="#/histoire?region=' + encodeURIComponent(r) + '">' + esc(r) + ' (' + n + ')</a>';
      }).join('') + '</div>';
    }
    if (!hs.length) {
      html += '<div class="grid g2">' + (EM.afrique || []).map(function (f) {
        return '<div class="history"><h3>' + esc(f.titre) + '</h3><p>' + EM.md(f.texte) + '</p></div>';
      }).join('') + '</div>';
    } else {
      html += '<div class="grid g2">' + hs.map(function (h, i) {
        if (region && h.region !== region) return '';
        return '<article class="portrait" id="p-' + i + '"' + (String(query.p) === String(i) ? ' style="border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-soft)"' : '') + '>' +
          '<div class="portrait-head"><div class="monogramme">' + EM.motif('portrait:' + h.nom, { cols: 3, rows: 3, titre: '' }) + '<span>' + esc(EM.initiales(h.nom)) + '</span></div>' +
          '<div><h3>' + esc(h.nom) + '</h3><div class="meta">' + esc([h.epoque, h.lieu, h.domaine].filter(Boolean).join(' · ')) + '</div></div></div>' +
          '<div>' + EM.md(h.texte) + '</div>' + (h.anecdote ? '<p class="small" style="margin:0;padding-left:12px;border-left:3px solid var(--gold)">' + EM.md(h.anecdote) + '</p>' : '') +
          ((h.chapitres || []).length ? '<div class="row">' + h.chapitres.filter(function (c) { return P.chapitres[c]; }).slice(0, 3).map(function (c) {
            return '<a class="chip" href="#/chapitre/' + c + '">' + I('livre') + esc(P.chapitres[c].titre) + '</a>';
          }).join('') + '</div>' : '') + '</article>';
      }).join('') + '</div>';
    }
    main.innerHTML = html;
    if (query.p != null) {
      var cible = main.querySelector('#p-' + query.p);
      if (cible) setTimeout(function () { cible.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
    }
  };

  /* =================== Mémento (aide-mémoire par classe) =================== */
  var KIND = { definition: 'Définition', theoreme: 'Théorème', propriete: 'Propriété', formule: 'Formule' };
  EM.views.memento = function (main, parts) {
    var P = EM.programme;
    var k = parts[0] || EM.store.classe() || '3e';
    var cl = P.classes[k];
    if (!cl) return EM.views.introuvable(main);
    var html = EM.ui.enTete('memento:' + k, 'Outils · Aide-mémoire', 'Mémento ' + esc(cl.long),
      'Toutes les définitions, propriétés, théorèmes et formules de l\'année, rassemblés sur une seule page pour réviser vite.',
      EM.MODE_EN_LIGNE ? '' : '<button class="btn sm ghost" data-act="imprimer">' + I('imprimer') + 'Imprimer / PDF</button>') +
      '<div class="row no-print" style="margin-bottom:18px">' + P.listeClasses().map(function (c) {
        return '<a class="chip' + (c === k ? ' gold' : '') + '" href="#/memento/' + c + '">' + esc(P.classes[c].nom) + '</a>';
      }).join('') + '</div><div class="memento">';
    cl.chapitres.forEach(function (id) {
      var c = EM.contenu[id] || {};
      var blocs = (c.cours || []).filter(function (b) { return KIND[b.type || 'definition']; });
      if (!blocs.length) return;
      html += '<div class="memento-chap"><h3><a href="#/chapitre/' + id + '?classe=' + k + '" style="color:inherit;text-decoration:none">' + esc(P.chapitres[id].titre) + '</a></h3>' +
        blocs.map(function (b) {
          var kind = b.type || 'definition';
          return '<div class="bloc ' + kind + '"><h4><span class="kind">' + KIND[kind] + '</span>' + EM.md(b.titre || '') + '</h4><div>' + EM.md(b.texte || '') + '</div></div>';
        }).join('') + '</div>';
    });
    html += '</div>';
    main.innerHTML = html;
    var bp = main.querySelector('[data-act="imprimer"]');
    if (bp) bp.addEventListener('click', function () {
      if (root.AndroidBridge && root.AndroidBridge.imprimer) root.AndroidBridge.imprimer('Mémento ' + cl.nom); else root.print();
    });
  };

  /* =================== Calcul mental =================== */
  var NIVEAUX_MENTAL = [
    { id: 'tables', nom: 'Tables et additions', pour: 'CM2 · 6e' },
    { id: 'decimaux', nom: 'Décimaux', pour: '6e · 5e' },
    { id: 'relatifs', nom: 'Relatifs et priorités', pour: '5e · 4e' },
    { id: 'expert', nom: 'Carrés, racines, puissances, pourcentages', pour: '3e · lycée' }
  ];
  function question(niv, rng) {
    var a, b, c;
    switch (niv) {
      case 'tables':
        if (rng.bool(0.65)) { a = rng.int(2, 10); b = rng.int(2, 10); return { q: a + ' \\times ' + b, r: a * b }; }
        a = rng.int(11, 79); b = rng.int(6, 99 - a); return { q: a + ' + ' + b, r: a + b };
      case 'decimaux':
        switch (rng.int(0, 3)) {
          case 0: a = rng.int(11, 99) / 10; b = rng.int(11, 99) / 10; return { q: EM.T.num(a) + ' + ' + EM.T.num(b), r: EM.ar.round(a + b, 2) };
          case 1: a = rng.int(101, 999) / 100; c = rng.pick([10, 100]); return { q: EM.T.num(a) + ' \\times ' + c, r: EM.ar.round(a * c, 2) };
          case 2: a = rng.int(12, 980); c = rng.pick([10, 100]); return { q: a + ' \\div ' + c, r: EM.ar.round(a / c, 3) };
          default: a = rng.int(3, 49) * 2 + 1; return { q: '\\text{la moitié de } ' + a, r: a / 2 };
        }
      case 'relatifs':
        switch (rng.int(0, 2)) {
          case 0: a = rng.nz(-12, 12); b = rng.nz(-12, 12); return { q: EM.T.par(a) + ' \\times ' + EM.T.par(b), r: a * b };
          case 1: a = rng.int(-30, 30); b = rng.int(-30, 30); return { q: EM.T.num(a) + ' - ' + EM.T.par(b), r: a - b };
          default: a = rng.int(-9, 9); b = rng.int(2, 9); c = rng.int(-9, 9); return { q: EM.T.num(a) + ' + ' + b + ' \\times ' + EM.T.par(c), r: a + b * c };
        }
      default:
        switch (rng.int(0, 3)) {
          case 0: a = rng.int(11, 20); return { q: a + '^2', r: a * a };
          case 1: a = rng.int(2, 15); return { q: '\\sqrt{' + a * a + '}', r: a };
          case 2: a = rng.int(2, 10); return { q: '2^{' + a + '}', r: Math.pow(2, a) };
          default: a = rng.pick([10, 20, 25, 50, 75]); b = rng.pick([40, 60, 80, 120, 200, 400]); return { q: a + '\\,\\% \\text{ de } ' + b, r: a * b / 100 };
        }
    }
  }
  EM.views.mental = function (main, parts, query) {
    var d = EM.store.data();
    d.mental = d.mental || {};
    var niv = query.niveau && NIVEAUX_MENTAL.some(function (n) { return n.id === query.niveau; }) ? query.niveau : 'tables';
    var DUREE = 60;
    main.innerHTML = EM.ui.enTete('calcul-mental', 'S\'entraîner', 'Calcul mental', 'Une minute pour enchaîner le plus de calculs justes possible. Écris le résultat : dès qu\'il est juste, la question suivante arrive.') +
      '<div class="row" style="margin-bottom:16px">' + NIVEAUX_MENTAL.map(function (n) {
        return '<a class="chip' + (n.id === niv ? ' gold' : '') + '" href="#/calcul-mental?niveau=' + n.id + '">' + esc(n.nom) + ' <span class="muted">· ' + esc(n.pour) + '</span></a>';
      }).join('') + '</div>' +
      '<div class="card mental-zone"><p class="eyebrow">Record : <span class="num" id="rec">' + (d.mental[niv] || 0) + '</span> · Temps : <span class="num" id="t">' + DUREE + '</span> s · Score : <span class="num" id="sc">0</span></p>' +
      '<div class="mental-q" id="q">Prêt ?</div><input class="mental-input" id="rep" inputmode="' + (niv === 'relatifs' ? 'text' : 'decimal') + '" autocomplete="off" aria-label="Ta réponse" disabled>' +
      '<div class="mental-barre"><i id="barre" style="width:100%"></i></div><div class="row" style="justify-content:center;margin-top:18px"><button class="btn gold" id="go">' + I('lecture') + 'Commencer</button></div>' +
      '<div id="bilan" class="small muted" style="margin-top:10px"></div></div>';
    var rng = new EM.RNG(), cur = null, score = 0, fin = 0, timer = null, erreurs = [];
    var q = main.querySelector('#q'), rep = main.querySelector('#rep'), go = main.querySelector('#go');
    function suivante() {
      cur = question(niv, rng);
      q.innerHTML = EM.render.tex(cur.q + ' = \\,?');
      rep.value = '';
      rep.focus();
    }
    function tick() {
      var reste = Math.max(0, (fin - Date.now()) / 1000);
      main.querySelector('#t').textContent = Math.ceil(reste);
      main.querySelector('#barre').style.width = (reste / DUREE * 100) + '%';
      if (reste <= 0) arreter();
    }
    function arreter() {
      clearInterval(timer); timer = null;
      rep.disabled = true;
      var record = score > (d.mental[niv] || 0);
      if (record) { d.mental[niv] = score; EM.store.save(); }
      main.querySelector('#rec').textContent = d.mental[niv] || 0;
      q.innerHTML = '<span class="num">' + score + '</span> <span class="muted" style="font-size:1.2rem">calcul' + (score > 1 ? 's' : '') + ' juste' + (score > 1 ? 's' : '') + '</span>';
      main.querySelector('#bilan').innerHTML = (record ? '<span class="chip gold">' + I('medaille') + 'Nouveau record !</span> ' : '') +
        (erreurs.length ? 'À retravailler : ' + erreurs.slice(0, 4).map(function (e) { return EM.render.tex(e.q + ' = ' + EM.T.num(e.r)); }).join(' · ') : '');
      go.innerHTML = I('rafraichir') + 'Rejouer';
      go.hidden = false;
    }
    go.addEventListener('click', function () {
      score = 0; erreurs = [];
      main.querySelector('#sc').textContent = '0';
      main.querySelector('#bilan').innerHTML = '';
      rep.disabled = false;
      go.hidden = true;
      fin = Date.now() + DUREE * 1000;
      timer = setInterval(tick, 200);
      suivante();
    });
    rep.addEventListener('input', function () {
      if (!cur || rep.disabled) return;
      var r = EM.check({ type: 'number', reponse: cur.r }, rep.value);
      if (r.ok) { score++; main.querySelector('#sc').textContent = score; suivante(); }
    });
    rep.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !cur || rep.disabled) return;
      var r = EM.check({ type: 'number', reponse: cur.r }, rep.value);
      if (!r.ok) { erreurs.push(cur); suivante(); }
    });
    return function () { if (timer) clearInterval(timer); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
