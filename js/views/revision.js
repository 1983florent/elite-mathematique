/*
 * Révision espacée (méthode des boîtes de Leitner) des définitions, formules et propriétés.
 * Une carte sue passe dans la boîte suivante et revient plus tard (1, 3, 7, 14 puis 30 jours) ;
 * une carte oubliée retourne dans la boîte 1.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  function cartesDe(chapitres) {
    var out = [];
    chapitres.forEach(function (id) {
      ((EM.contenu[id] || {}).flashcards || []).forEach(function (c, i) { out.push({ id: id + '#' + i, ch: id, q: c.q, r: c.r }); });
    });
    return out;
  }

  EM.views.revision = function (main, parts, query) {
    var P = EM.programme, S = EM.store;
    var k = query.classe || S.classe();
    var chapitres, titre;
    if (query.chapitre && P.chapitres[query.chapitre]) {
      chapitres = [query.chapitre];
      titre = P.chapitres[query.chapitre].titre;
    } else {
      if (!k || !P.classes[k]) {
        main.innerHTML = '<div class="card"><h1>🗂️ Révision espacée</h1><p>Choisis ta classe pour réviser ses cartes.</p>' + EM.classesPicker() + '</div>';
        main.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { S.setClasse(b.getAttribute('data-k')); EM.route(); } });
        return;
      }
      chapitres = P.classes[k].chapitres.slice();
      if (query.avant) {
        // ajoute les prérequis des classes précédentes
        chapitres.forEach(function (id) { P.prerequisRecursifs(id).forEach(function (p) { if (chapitres.indexOf(p) < 0) chapitres.push(p); }); });
      }
      titre = P.classes[k].long + (query.avant ? ' + prérequis' : '');
    }
    var cartes = cartesDe(chapitres);
    var ids = cartes.map(function (c) { return c.id; });
    var parId = {};
    cartes.forEach(function (c) { parId[c.id] = c; });
    var boites = S.boites(ids);
    var dues = S.cartesDues(ids, 12);
    var max = Math.max.apply(null, boites.concat([1]));

    var html = '<div class="page-head"><div><h1>🗂️ Révision espacée</h1><p class="muted" style="margin:0">' + esc(titre) + ' · ' + cartes.length + ' cartes</p></div>' +
      (query.chapitre ? '' : '<div class="row"><a class="btn sm ghost" href="#/revision?classe=' + k + (query.avant ? '' : '&avant=1') + '">' + (query.avant ? 'Seulement ma classe' : 'Inclure les prérequis') + '</a></div>') + '</div>' +
      '<div class="card"><div class="row between"><div><strong>' + dues.length + '</strong> carte' + (dues.length > 1 ? 's' : '') + ' à réviser aujourd\'hui</div>' +
      '<span class="small muted">Boîtes de Leitner : 1 = à revoir souvent, 5 = bien ancrée</span></div>' +
      '<div class="leitner" style="margin-top:26px">' + boites.map(function (n, i) {
        return '<div style="height:' + Math.max(6, n / max * 100) + '%;' + (i === 0 ? 'background:var(--surface-2)' : '') + '" title="' + (i ? 'Boîte ' + i : 'Jamais vues') + ' : ' + n + '"><span>' + (i ? 'B' + i : 'Nouv.') + ' · ' + n + '</span></div>';
      }).join('') + '</div></div><div class="session"></div>';
    main.innerHTML = html;
    var zone = main.querySelector('.session');
    if (!cartes.length) { zone.innerHTML = '<div class="card">Les cartes de cette classe sont en préparation.</div>'; return; }
    if (!dues.length) {
      zone.innerHTML = '<div class="card center"><p style="font-size:2rem;margin:0">🎉</p><p>Tout est à jour ! Reviens demain, ou entraîne-toi sur des exercices.</p><a class="btn" href="#/serie/' + (k || '') + '">Série d\'exercices</a></div>';
      return;
    }
    var file = new EM.RNG().shuffle(dues), i = 0, sues = 0;
    function montrer() {
      if (i >= file.length) {
        zone.innerHTML = '<div class="card center"><h2>Séance terminée</h2><p>' + sues + ' / ' + file.length + ' cartes sues.</p><div class="row" style="justify-content:center"><button class="btn" data-act="re">Continuer</button><a class="btn ghost" href="#/">Accueil</a></div></div>';
        zone.querySelector('[data-act="re"]').addEventListener('click', function () { EM.route(); });
        return;
      }
      var c = parId[file[i]];
      zone.innerHTML = '<p class="small muted">Carte ' + (i + 1) + ' / ' + file.length + ' · <a href="#/chapitre/' + c.ch + '">' + esc(P.chapitres[c.ch].titre) + '</a></p>' +
        '<div class="flash"><button class="flash-card" data-act="flip" style="width:100%"><span><span class="flash-side">Question</span><br>' + EM.md(c.q) + '<br><span class="small muted">(touche pour voir la réponse)</span></span></button></div>' +
        '<div class="row hidden" style="justify-content:center;margin-top:14px" data-rep><button class="btn danger" data-act="non">✗ À revoir</button><button class="btn ok" data-act="oui">✓ Je savais</button></div>';
      zone.querySelector('[data-act="flip"]').addEventListener('click', function () {
        var card = this;
        card.classList.add('back');
        card.innerHTML = '<span><span class="flash-side">Réponse</span><br>' + EM.md(c.r) + '</span>';
        zone.querySelector('[data-rep]').classList.remove('hidden');
      });
      zone.querySelector('[data-act="oui"]').addEventListener('click', function () { sues++; EM.ui.badges(S.revoir(c.id, true)); i++; montrer(); });
      zone.querySelector('[data-act="non"]').addEventListener('click', function () { EM.ui.badges(S.revoir(c.id, false)); file.push(c.id); i++; montrer(); });
    }
    montrer();
  };
})(typeof window !== 'undefined' ? window : globalThis);
