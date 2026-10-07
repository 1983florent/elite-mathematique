/*
 * Espace enseignant : fiches d'exercices imprimables (avec corrigé) et partageables par lien.
 * Une fiche est entièrement décrite par son lien : chaque élève retrouve exactement les mêmes exercices
 * et peut la faire en version interactive, corrigée automatiquement.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  function qs(obj) {
    return Object.keys(obj).filter(function (k) { return obj[k] !== '' && obj[k] != null; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
  }

  EM.views.enseignant = function (main, parts, query) {
    var P = EM.programme;
    var k = query.classe || EM.store.classe() || '3e';
    var cl = P.classes[k] || P.classes['3e'];
    var chs = cl.chapitres.filter(function (id) { return EM.gen.forChapter(id).length; });
    var html = EM.ui.enTete('enseignant', 'Ressources', 'Espace enseignant', 'Créez en quelques secondes une fiche d\'exercices avec corrigé, à imprimer ou à partager par lien.') +
      '<div class="card"><h2>1. Classe</h2><div class="classes">' + P.listeClasses().map(function (c) {
        return EM.gensClasse(c).length ? '<a class="classe-btn' + (c === cl.id ? ' active' : '') + '" style="--c:' + P.classes[c].couleur + '" href="#/enseignant?classe=' + c + '">' + esc(P.classes[c].nom) + '<small>&nbsp;</small></a>' : '';
      }).join('') + '</div></div>' +
      '<form class="card" id="f"><h2>2. Chapitres</h2>' +
      (chs.length ? '<div class="row small" style="margin-bottom:6px"><button type="button" class="linkbtn" data-all="1">Tout cocher</button> · <button type="button" class="linkbtn" data-all="0">Tout décocher</button></div>' +
        '<div class="grid g2" style="gap:0 14px">' + chs.map(function (id) {
          return '<label class="check"><input type="checkbox" name="ch" value="' + id + '"> <span>' + esc(P.chapitres[id].titre) + ' <span class="muted small">(' + EM.gen.forChapter(id).length + ')</span></span></label>';
        }).join('') + '</div>' : '<p class="muted">Pas encore d\'exercices pour cette classe.</p>') +
      '<h2 style="margin-top:16px">3. Réglages</h2><div class="grid g3">' +
      '<label class="field">Exercices par chapitre<select name="n" class="inp"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>' +
      '<label class="field">Difficulté<select name="lv" class="inp"><option value="1">Niveau 1 — application</option><option value="2" selected>Niveau 2 — entraînement</option><option value="3">Niveau 3 — approfondissement</option><option value="0">Mélangée</option></select></label>' +
      '<label class="field">Titre<input name="t" class="inp" value="Fiche d\'exercices"></label>' +
      '<label class="field">Établissement<input name="e" class="inp" placeholder="Ex. : CEM de Thiès"></label>' +
      '<label class="field">Professeur<input name="p" class="inp" placeholder="Ex. : M. Diallo"></label>' +
      '<label class="field">Numéro de fiche (code)<input name="s" class="inp" inputmode="numeric" value="' + (Math.floor(Math.random() * 90000) + 10000) + '"></label></div>' +
      '<label class="check"><input type="checkbox" name="corr" checked> Ajouter le corrigé détaillé à la fin</label>' +
      '<div class="row" style="margin-top:10px"><button class="btn gold" type="submit">Créer la fiche</button></div></form>' +
      '<div class="card"><h2>Astuces</h2><ul><li>Le même numéro de fiche redonne toujours les mêmes exercices : donnez le lien à vos élèves, ils feront la fiche sur leur téléphone et seront corrigés automatiquement.</li>' +
      '<li>Changez le numéro pour obtenir une autre version (par exemple une version par rangée pour éviter la copie).</li>' +
      '<li>Pour un sujet complet de type examen, utilisez <a href="#/examens">les examens blancs</a> : ils ont aussi un code.</li>' +
      '<li>Pour enregistrer en PDF : bouton « Imprimer », puis « Enregistrer au format PDF ».</li></ul></div>';
    main.innerHTML = html;
    var f = main.querySelector('#f');
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-all]');
      if (!b) return;
      Array.prototype.forEach.call(f.querySelectorAll('input[name="ch"]'), function (c) { c.checked = b.getAttribute('data-all') === '1'; });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var sel = Array.prototype.filter.call(f.querySelectorAll('input[name="ch"]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (!sel.length) { EM.ui.toast('Coche au moins un chapitre.'); return; }
      var fd = new FormData(f);
      EM.go('#/fiche?' + qs({ c: cl.id, ch: sel.join(','), n: fd.get('n'), lv: fd.get('lv'), t: fd.get('t'), e: fd.get('e'), p: fd.get('p'), s: parseInt(fd.get('s'), 10) || 1, corr: fd.get('corr') ? 1 : 0 }));
    });
  };

  function construireFiche(q) {
    var chs = (q.ch || '').split(',').filter(function (id) { return EM.programme.chapitres[id] && EM.gen.forChapter(id).length; });
    var n = Math.max(1, Math.min(6, parseInt(q.n, 10) || 2));
    var lv = parseInt(q.lv, 10) || 0;
    var rng = new EM.RNG('fiche:' + q.s + ':' + q.ch + ':' + n + ':' + lv);
    var exos = [];
    chs.forEach(function (id) {
      var gens = rng.shuffle(EM.gen.forChapter(id));
      for (var i = 0; i < n; i++) {
        var g = gens[i % gens.length];
        var niv = lv ? Math.min(lv, g.niveaux) : rng.int(1, g.niveaux);
        exos.push({ g: g, ex: EM.gen.make(g.id, rng.int(1, 99999), niv), ch: id });
      }
    });
    return exos;
  }

  EM.views.fiche = function (main, parts, query) {
    var P = EM.programme;
    var cl = P.classes[query.c] || { nom: '', long: '' };
    var exos = construireFiche(query);
    if (!exos.length) { main.innerHTML = '<div class="card"><p>Fiche vide ou lien incomplet.</p><a class="btn" href="#/enseignant">Créer une fiche</a></div>'; return; }
    var eleve = query.mode === 'eleve';
    var lien = location.href.split('#')[0] + '#/fiche?' + qs(Object.assign({}, query, { mode: '' }));
    var lienEleve = location.href.split('#')[0] + '#/fiche?' + qs(Object.assign({}, query, { mode: 'eleve' }));
    var dateTxt = new Date().toLocaleDateString('fr-FR');

    var head = '<div class="sheet-head"><div><strong>' + esc(query.e || 'Établissement : ………………………') + '</strong><br>' +
      (query.p ? 'Professeur : ' + esc(query.p) + '<br>' : '') + 'Classe : ' + esc(cl.nom) + '</div>' +
      '<div style="text-align:right">Fiche n° ' + esc(query.s) + '<br>' + dateTxt + '</div>' +
      '<div style="grid-column:1/-1;text-align:center"><h1 style="font-size:1.4rem;margin:6px 0 0">' + esc(query.t || 'Fiche d\'exercices') + '</h1></div>' +
      (eleve ? '' : '<div style="grid-column:1/-1">Nom et prénom : ……………………………………………………</div>') + '</div>';

    var tools = '<div class="row no-print" style="margin-bottom:14px"><a class="btn ghost sm" href="#/enseignant?classe=' + esc(query.c || '') + '">← Modifier</a>' +
      (eleve ? '<a class="btn ghost sm" href="' + esc(lien.replace(location.href.split('#')[0], '')) + '">Version papier</a>'
        : (EM.MODE_EN_LIGNE ? '' : '<button class="btn sm" data-act="print">' + EM.icon('imprimer') + 'Imprimer / PDF</button>') +
          (EM.MODE_EN_LIGNE ? '' : '<button class="btn sm ghost" data-act="lien">' + EM.icon('lien') + 'Copier le lien élève</button>') +
          '<a class="btn sm ghost" href="' + esc(lienEleve.replace(location.href.split('#')[0], '')) + '">' + EM.icon('telephone') + 'Version interactive</a>') + '</div>';

    if (!eleve) {
      var html = tools + '<div class="card sheet">' + head + exos.map(function (x, i) { return EM.ui.exercicePapier(x.ex, i + 1); }).join('');
      if (query.corr === '1') {
        html += '<div class="page-break"></div><h2 style="text-align:center">Corrigé — fiche n° ' + esc(query.s) + '</h2>' +
          exos.map(function (x, i) { return EM.ui.correctionPapier(x.ex, i + 1); }).join('');
      }
      main.innerHTML = html + '</div>';
      if (main.querySelector('[data-act="print"]')) main.querySelector('[data-act="print"]').addEventListener('click', function () {
        if (window.AndroidBridge && window.AndroidBridge.imprimer) window.AndroidBridge.imprimer((query.t || 'Fiche') + ' ' + query.s);
        else window.print();
      });
      if (main.querySelector('[data-act="lien"]')) main.querySelector('[data-act="lien"]').addEventListener('click', function () { EM.ui.copy(lienEleve, 'Lien élève copié : partagez-le à la classe'); });
      return;
    }

    // version interactive pour l'élève
    var html2 = tools + '<div class="card">' + head + '</div>';
    exos.forEach(function (x, i) { html2 += '<div class="card exo" data-i="' + i + '"></div>'; });
    html2 += '<div class="card center"><button class="btn gold" data-act="fin">Terminer et voir ma note</button><div class="res"></div></div>';
    main.innerHTML = html2;
    var ctls = exos.map(function (x, i) {
      return EM.ui.exercice(main.querySelector('.exo[data-i="' + i + '"]'), x.ex, {
        mode: 'pratique', numero: 'Exercice ' + (i + 1),
        onResult: function (r) { EM.store.reponse({ gen: x.g.id, chapitres: [x.ch], niveau: x.ex.niveau, ok: r.ok, indices: r.indices, solutionVue: r.solutionVue }); }
      });
    });
    main.querySelector('[data-act="fin"]').addEventListener('click', function () {
      var ok = 0;
      ctls.forEach(function (c) { if (c.grade().ok && !c.state.solutionVue) ok++; c.reveal(true); });
      var nom = EM.store.nom() || 'Élève';
      var txt = nom + ' — ' + (query.t || 'Fiche') + ' n° ' + query.s + ' (' + cl.nom + ') : ' + ok + '/' + exos.length + ' exercices réussis';
      main.querySelector('.res').innerHTML = '<div class="score-big" style="margin-top:12px">' + ok + '/' + exos.length + '</div>' +
        '<p class="muted">Envoie ton résultat à ton professeur :</p><p><code>' + esc(txt) + '</code></p>' +
        '<div class="row" style="justify-content:center"><button class="btn sm ghost" data-copy>Copier</button><a class="btn sm ok" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(txt) + '">WhatsApp</a></div>';
      main.querySelector('[data-copy]').addEventListener('click', function () { EM.ui.copy(txt, 'Résultat copié'); });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
