/*
 * Entraînement : exercice seul (partageable par code), série adaptative, défi du jour, diagnostic.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  function newSeed() { return Math.floor(Math.random() * 90000) + 10000; }

  function recordAndNotify(g, ex, r, chapitres) {
    var res = EM.store.reponse({ gen: g.id, chapitres: chapitres || g.chapitres, niveau: ex.niveau, ok: r.ok, indices: r.indices, solutionVue: r.solutionVue });
    if (res.xp) EM.ui.toast('+' + res.xp + ' points');
    EM.ui.badges(res.badges);
    return res;
  }

  /* ---------- exercice seul ---------- */
  EM.views.exo = function (main, parts, query) {
    var g = EM.gen.get(parts[0]);
    if (!g) return EM.views.introuvable(main);
    var P = EM.programme;
    var chId = query.ch && P.chapitres[query.ch] ? query.ch : g.chapitres[0];
    var ch = P.chapitres[chId];
    var niveau = Math.max(1, Math.min(g.niveaux, parseInt(query.n, 10) || EM.store.niveauConseille(g.id)));
    var seed = parseInt(query.s, 10);
    if (!(seed >= 0)) {
      seed = newSeed();
      try { history.replaceState(null, '', '#/exo/' + g.id + '?n=' + niveau + '&s=' + seed + (query.ch ? '&ch=' + query.ch : '')); } catch (e) { /* rien */ }
    }
    var reussitesDeSuite = parseInt(query.r, 10) || 0;
    var ex;
    try { ex = EM.gen.make(g.id, seed, niveau); } catch (e) {
      main.innerHTML = '<div class="card"><p>Impossible de produire cet exercice : ' + esc(e.message) + '</p></div>';
      return;
    }
    var code = g.id + '-' + niveau + '-' + seed;
    var html = '<div class="crumbs"><a href="#/programme">Programme</a> › ' + (ch ? '<a href="#/chapitre/' + chId + '?onglet=exercices">' + esc(ch.titre) + '</a> › ' : '') + 'Exercice</div>' +
      '<div class="row between" style="margin-bottom:10px"><div class="levels" role="group" aria-label="Niveau de difficulté">';
    for (var n = 1; n <= g.niveaux; n++) html += '<button data-lv="' + n + '" aria-pressed="' + (n === niveau) + '" title="' + EM.ui.niveauNom(n) + '">Niveau ' + n + '</button>';
    html += '</div><div class="row small"><span class="muted">Code :</span> <code>' + esc(code) + '</code>' +
      '<button class="btn sm ghost" data-act="share" title="Copier le lien de cet exercice">🔗 Partager</button></div></div>' +
      '<div class="card exo"></div>';
    main.innerHTML = html;

    var ctl = EM.ui.exercice(main.querySelector('.exo'), ex, {
      mode: 'pratique',
      onResult: function (r) {
        recordAndNotify(g, ex, r, query.ch ? [query.ch] : g.chapitres);
        if (r.ok) reussitesDeSuite++; else reussitesDeSuite = 0;
      },
      onNext: function () {
        var lv = niveau;
        if (ctl.state.verifie && !ctl.state.solutionVue && reussitesDeSuite >= 2 && lv < g.niveaux) { lv++; EM.ui.toast('Niveau ' + lv + ' : on monte d\'un cran ! 💪'); reussitesDeSuite = 0; }
        EM.go('#/exo/' + g.id + '?n=' + lv + '&s=' + newSeed() + '&r=' + reussitesDeSuite + (query.ch ? '&ch=' + query.ch : ''));
      }
    });
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lv]');
      if (b) EM.go('#/exo/' + g.id + '?n=' + b.getAttribute('data-lv') + '&s=' + newSeed() + (query.ch ? '&ch=' + query.ch : ''));
      if (e.target.closest('[data-act="share"]')) {
        if (EM.MODE_EN_LIGNE) { EM.ui.copy(code, 'Code copié : ' + code); return; }
        var url = location.href.split('#')[0] + '#/exo/' + g.id + '?n=' + niveau + '&s=' + seed;
        EM.ui.copy(url, 'Lien de l\'exercice copié : envoie-le à tes camarades !');
      }
    });
  };

  /* ---------- série de 10 exercices (adaptative) ---------- */
  function choisirSerie(gens, chapitresCibles, n, rng) {
    // pondération : plus un chapitre est faible, plus il revient souvent
    var pool = [];
    gens.forEach(function (g) {
      var chs = g.chapitres.filter(function (c) { return !chapitresCibles || chapitresCibles.indexOf(c) >= 0; });
      var m = chs.length ? Math.min.apply(null, chs.map(EM.store.maitrise)) : 0.5;
      var w = 1 + Math.round((1 - m) * 3);
      for (var i = 0; i < w; i++) pool.push(g);
    });
    var out = [], last = null;
    for (var j = 0; j < n && pool.length; j++) {
      var g, guard = 0;
      do { g = rng.pick(pool); guard++; } while (g === last && guard < 10 && gens.length > 1);
      out.push(g);
      last = g;
    }
    return out;
  }

  EM.views.serie = function (main, parts) {
    var P = EM.programme, gens, titre, cibles = null, retour;
    if (parts[0] === 'chapitre') {
      var ch = P.chapitres[parts[1]];
      if (!ch) return EM.views.introuvable(main);
      gens = EM.gen.forChapter(parts[1]);
      cibles = [parts[1]];
      titre = ch.titre;
      retour = '#/chapitre/' + parts[1] + '?onglet=exercices';
    } else {
      var k = parts[0] || EM.store.classe();
      if (!k || !P.classes[k]) { EM.choisirClasse(function (kk) { EM.go('#/serie/' + kk); }); return; }
      gens = EM.gensClasse(k);
      titre = 'Série ' + P.classes[k].nom;
      retour = '#/classe/' + k;
    }
    if (!gens.length) {
      main.innerHTML = '<div class="card"><h1>' + esc(titre) + '</h1><p>Pas encore d\'exercices générés ici.</p><a class="btn" href="' + retour + '">Retour</a></div>';
      return;
    }
    var rng = new EM.RNG();
    var N = 10;
    var liste = choisirSerie(gens, cibles, N, rng);
    var i = 0, score = 0, resultats = [], xp = 0;

    main.innerHTML = '<div class="crumbs"><a href="' + retour + '">← Retour</a></div>' +
      '<div class="card"><div class="row between"><h1 style="margin:0">♾️ ' + esc(titre) + '</h1><span class="chip gold" id="sc"></span></div>' +
      '<div class="meter" style="margin-top:10px"><i id="pb" style="width:0"></i></div></div><div class="card exo"></div>';
    var box = main.querySelector('.exo');

    function maj() {
      main.querySelector('#sc').textContent = 'Question ' + Math.min(i + 1, N) + '/' + N + ' · ' + score + ' ✓';
      main.querySelector('#pb').style.width = (i / N * 100) + '%';
    }
    function suivant() {
      if (i >= N) return fin();
      maj();
      var g = liste[i];
      var ex = EM.gen.make(g.id, newSeed(), EM.store.niveauConseille(g.id));
      EM.ui.exercice(box, ex, {
        mode: 'pratique',
        numero: (i + 1) + '/' + N,
        onResult: function (r) {
          var res = recordAndNotify(g, ex, r, cibles || g.chapitres);
          xp += res.xp;
          if (r.ok && !r.solutionVue) score++;
          resultats.push({ g: g, ok: r.ok && !r.solutionVue });
          // niveau conseillé : on monte après une réussite sans indice
          var st = EM.store.data().gens[g.id];
          if (r.ok && !r.indices && !r.solutionVue && ex.niveau < g.niveaux) st.niv = ex.niveau + 1;
          else if (!r.ok && ex.niveau > 1) st.niv = ex.niveau - 1;
          EM.store.save();
          maj();
        },
        onNext: function () {
          if (resultats.length <= i) resultats.push({ g: g, ok: false, saute: true });
          i++;
          suivant();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
    function fin() {
      main.querySelector('#pb').style.width = '100%';
      main.querySelector('#sc').textContent = score + '/' + N;
      var rates = resultats.filter(function (r) { return !r.ok; });
      var chFaibles = EM.util.uniq([].concat.apply([], rates.map(function (r) { return r.g.chapitres; }))).filter(function (c) { return P.chapitres[c]; }).slice(0, 5);
      box.innerHTML = '<div class="center"><div class="score-big">' + score + '/' + N + '</div><p class="mention">' +
        (score >= 9 ? 'Exceptionnel ! 🏆' : score >= 7 ? 'Très bon travail ! 👏' : score >= 5 ? 'C\'est bien, continue ! 💪' : 'Ne lâche rien : chaque erreur t\'apprend quelque chose. 🌱') +
        '</p><p class="muted">+' + xp + ' points gagnés</p></div>' +
        (chFaibles.length ? '<h3>À retravailler</h3><ul>' + chFaibles.map(function (c) { return '<li><a href="#/chapitre/' + c + '">' + esc(P.chapitres[c].titre) + '</a></li>'; }).join('') + '</ul>' : '') +
        '<div class="row"><button class="btn" data-act="again">Nouvelle série</button><a class="btn ghost" href="' + retour + '">Retour</a></div>';
      box.querySelector('[data-act="again"]').addEventListener('click', function () { EM.route(); });
    }
    suivant();
  };

  /* ---------- défi du jour ---------- */
  EM.views.defi = function (main) {
    var k = EM.store.classe();
    if (!k) { EM.choisirClasse(function () { EM.go('#/defi'); }); main.innerHTML = '<div class="card">Choisis ta classe pour voir le défi du jour.</div>'; return; }
    var cl = EM.programme.classes[k];
    var d = EM.defiDuJour(k);
    if (!d) { main.innerHTML = '<div class="card">Pas encore de défi pour cette classe.</div>'; return; }
    var ex = EM.gen.make(d.gen.id, d.seed, d.niveau);
    var jour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    main.innerHTML = '<div class="card senegal"><h1 style="margin:0">☀️ Défi du jour — ' + esc(cl.nom) + '</h1><p class="muted" style="margin:4px 0 0">' + esc(jour) +
      ' · le même exercice pour tous les élèves de ' + esc(cl.nom) + ' aujourd\'hui</p></div><div class="card exo"></div><div class="card share hidden"></div>';
    EM.ui.exercice(main.querySelector('.exo'), ex, {
      mode: 'pratique',
      onResult: function (r) {
        recordAndNotify(d.gen, ex, r);
        var sh = main.querySelector('.share');
        if (r.ok && !r.solutionVue) {
          EM.ui.badges(EM.store.defiReussi());
          EM.ui.toast('Défi réussi ! +20 points bonus ☀️');
          var txt = 'J\'ai relevé le défi du jour ELITE MATHÉMATIQUE (' + cl.nom + ', ' + EM.store.today().split('-').reverse().join('/') + ') ! Et toi, tu y arrives ? ' + location.href.split('#')[0] + '#/defi';
          sh.innerHTML = '<h2>Bravo ! Partage ta réussite</h2><p class="muted">Lance le défi à tes camarades de classe.</p><div class="row">' +
            '<a class="btn ok" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(txt) + '">Partager sur WhatsApp</a>' +
            '<button class="btn ghost" data-copy>Copier le message</button></div>';
          sh.classList.remove('hidden');
          sh.querySelector('[data-copy]').addEventListener('click', function () { EM.ui.copy(txt, 'Message copié'); });
        }
      }
    });
  };

  /* ---------- diagnostic ---------- */
  EM.views.diagnostic = function (main, parts, query) {
    var P = EM.programme;
    var k = parts[0] || EM.store.classe();
    if (!k || !P.classes[k]) { EM.choisirClasse(function (kk) { EM.go('#/diagnostic/' + kk); }); return; }
    var cl = P.classes[k];
    var prerequis = !!query.prerequis;
    var chapitres;
    if (prerequis) {
      var set = {};
      cl.chapitres.forEach(function (id) {
        P.chapitres[id].prerequis.forEach(function (p) { if (P.chapitres[p] && P.chapitres[p].classes.indexOf(k) < 0) set[p] = true; });
      });
      chapitres = Object.keys(set).sort(function (a, b) { return P.chapitres[a].ordre - P.chapitres[b].ordre; });
    } else chapitres = cl.chapitres.slice();
    chapitres = chapitres.filter(function (id) { return EM.gen.forChapter(id).length; });
    var rng = new EM.RNG();
    if (chapitres.length > 12) chapitres = rng.sample(chapitres, 12).sort(function (a, b) { return P.chapitres[a].ordre - P.chapitres[b].ordre; });
    var titre = prerequis ? 'Test des prérequis pour la ' + cl.nom : 'Diagnostic ' + cl.nom;

    if (!chapitres.length) {
      main.innerHTML = '<div class="card"><h1>' + esc(titre) + '</h1><p>Pas assez d\'exercices disponibles pour ce diagnostic.</p><a class="btn" href="#/classe/' + k + '">Retour</a></div>';
      return;
    }
    main.innerHTML = '<div class="crumbs"><a href="#/classe/' + k + '">← ' + esc(cl.nom) + '</a></div>' +
      '<div class="card"><h1>🩺 ' + esc(titre) + '</h1><p>' + chapitres.length + ' questions, une par chapitre' + (prerequis ? ' des classes précédentes utile cette année' : '') +
      '. Réponds sans aide : le but est de repérer ce qui est solide et ce qui est à revoir. Compte environ ' + Math.max(5, chapitres.length * 2) + ' minutes.</p>' +
      '<button class="btn" data-act="go">Commencer</button></div>';
    var i = 0, res = {}, items = [];
    main.querySelector('[data-act="go"]').addEventListener('click', etape);

    function etape() {
      if (i >= chapitres.length) return bilan();
      var id = chapitres[i], g = rng.pick(EM.gen.forChapter(id));
      var ex = EM.gen.make(g.id, newSeed(), 1);
      main.innerHTML = '<div class="card"><div class="row between"><strong>' + esc(titre) + '</strong><span class="chip">' + (i + 1) + '/' + chapitres.length + '</span></div>' +
        '<div class="meter" style="margin-top:8px"><i style="width:' + (i / chapitres.length * 100) + '%"></i></div><p class="small muted" style="margin:8px 0 0">Chapitre : ' + esc(P.chapitres[id].titre) + '</p></div>' +
        '<div class="card exo"></div><div class="row"><button class="btn" data-act="val">Valider et continuer</button><button class="btn ghost" data-act="skip">Je ne sais pas</button></div>';
      var ctl = EM.ui.exercice(main.querySelector('.exo'), ex, { mode: 'examen', numero: 'Question ' + (i + 1) });
      function valider(skip) {
        var r = skip ? { ok: false } : ctl.grade();
        res[id] = r.ok;
        items.push({ id: id, g: g, ex: ex, ok: r.ok });
        EM.store.reponse({ gen: g.id, chapitres: [id], niveau: 1, ok: r.ok });
        i++;
        etape();
      }
      main.querySelector('[data-act="val"]').addEventListener('click', function () { valider(false); });
      main.querySelector('[data-act="skip"]').addEventListener('click', function () { valider(true); });
    }
    function bilan() {
      EM.ui.badges(EM.store.diagnostic(k + (prerequis ? '-prerequis' : ''), res));
      var ok = chapitres.filter(function (id) { return res[id]; }), ko = chapitres.filter(function (id) { return !res[id]; });
      var pct = Math.round(ok.length / chapitres.length * 100);
      var html = '<div class="card"><h1>Bilan — ' + esc(titre) + '</h1><div class="row" style="gap:16px"><div class="ring" style="--p:' + pct + '"><span>' + pct + ' %</span></div>' +
        '<p style="margin:0;flex:1">' + ok.length + ' chapitre' + (ok.length > 1 ? 's' : '') + ' réussi' + (ok.length > 1 ? 's' : '') + ' sur ' + chapitres.length + '. ' +
        (ko.length ? 'Voici ton parcours personnalisé, dans l\'ordre conseillé :' : 'Excellent : tu es prêt(e) pour la suite !') + '</p></div></div>';
      if (ko.length) {
        html += '<div class="card"><h2>🧭 Ton parcours de remédiation</h2><ol class="stack">' + ko.map(function (id) {
          return '<li><strong>' + esc(P.chapitres[id].titre) + '</strong> <span class="muted small">(' + esc(P.classes[P.chapitres[id].classes[0]].nom) + ')</span><div class="row" style="margin-top:6px">' +
            '<a class="btn sm ghost" href="#/chapitre/' + id + '">📖 Revoir le cours</a><a class="btn sm" href="#/serie/chapitre/' + id + '">♾️ S\'entraîner</a></div></li>';
        }).join('') + '</ol></div>';
      }
      if (ok.length) html += '<div class="card"><h2>✅ Points solides</h2><div class="row">' + ok.map(function (id) { return '<span class="chip ok">' + esc(P.chapitres[id].titre) + '</span>'; }).join('') + '</div></div>';
      html += '<div class="card"><h2>Les questions et leurs corrections</h2><div class="corr"></div></div><a class="btn" href="#/classe/' + k + '">Retour à la classe</a>';
      main.innerHTML = html;
      var corr = main.querySelector('.corr');
      items.forEach(function (it, j) {
        var d = document.createElement('details');
        d.innerHTML = '<summary>' + (it.ok ? '✅' : '❌') + ' Question ' + (j + 1) + ' — ' + esc(P.chapitres[it.id].titre) + '</summary><div class="exo" style="margin:10px 0"></div>';
        corr.appendChild(d);
        d.querySelector('.exo').innerHTML = EM.ui.enonceEtCorrection(it.ex);
      });
      window.scrollTo(0, 0);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
