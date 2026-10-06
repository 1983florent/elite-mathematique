/*
 * Tableau de bord : points, rang, série de jours, activité, carte de maîtrise du programme, badges,
 * historique des examens, sauvegarde et transfert de la progression.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  EM.views.progres = function (main) {
    var P = EM.programme, S = EM.store, d = S.data();
    var rang = S.rang();
    var totalOk = 0, totalTent = 0;
    Object.keys(d.gens).forEach(function (g) { totalOk += d.gens[g].ok; totalTent += d.gens[g].tent; });
    var maitrises = Object.keys(d.chap).filter(function (c) { return d.chap[c].m >= 0.7; }).length;

    // activité des 14 derniers jours
    var jours = [];
    for (var i = 13; i >= 0; i--) {
      var j = S.addDays(S.today(), -i);
      jours.push({ j: j, n: (d.jours[j] || {}).tent || 0, ok: (d.jours[j] || {}).ok || 0 });
    }
    var maxJ = Math.max.apply(null, jours.map(function (x) { return x.n; }).concat([1]));
    var fig = EM.fig.create({ w: 420, h: 130, xmin: -0.5, xmax: 13.5, ymin: -maxJ * 0.2, ymax: maxJ * 1.15 });
    jours.forEach(function (x, idx) {
      if (x.n) fig.rect(idx - 0.35, 0, 0.7, x.n, { light: true });
      if (x.ok) fig.rect(idx - 0.35, 0, 0.7, x.ok);
      if (idx % 2 === 1 || idx === 13) fig.text([idx, -maxJ * 0.14], x.j.slice(8) + '/' + x.j.slice(5, 7), { small: true });
    });
    fig.title = 'Exercices des 14 derniers jours';

    var progressPct = rang.seuil ? Math.round((d.xp - rang.min) / (rang.seuil - rang.min) * 100) : 100;
    var html = '<div class="page-head"><div><h1>🏆 Mes progrès</h1><p class="muted" style="margin:0">Tout est enregistré sur cet appareil.</p></div>' +
      '<div class="row"><label class="field" style="font-weight:400">Mon prénom ou pseudo<input class="inp" id="nom" maxlength="40" value="' + esc(S.nom() || '') + '" placeholder="Ex. : Awa"></label></div></div>' +
      '<div class="kpis"><div class="kpi"><strong>' + d.xp + '</strong><span>points</span></div>' +
      '<div class="kpi"><strong>' + esc(rang.nom) + '</strong><span>rang</span></div>' +
      '<div class="kpi"><strong>🔥 ' + d.serie.n + '</strong><span>jours de suite (record ' + d.serie.record + ')</span></div>' +
      '<div class="kpi"><strong>' + totalOk + '</strong><span>exercices réussis' + (totalTent ? ' (' + Math.round(totalOk / totalTent * 100) + ' %)' : '') + '</span></div>' +
      '<div class="kpi"><strong>' + maitrises + '</strong><span>chapitres maîtrisés</span></div>' +
      '<div class="kpi"><strong>' + d.revues + '</strong><span>cartes révisées</span></div></div>' +
      '<div class="card" style="margin-top:16px"><div class="row between"><strong>Prochain rang : ' + esc(rang.suivant || '—') + '</strong><span class="small muted">' + (rang.seuil ? d.xp + ' / ' + rang.seuil + ' points' : 'Rang maximal atteint !') + '</span></div>' +
      '<div class="meter" style="margin-top:8px"><i style="width:' + progressPct + '%"></i></div></div>' +
      '<div class="card"><h2>Activité</h2><div class="exo-figure">' + fig.svg() + '</div><p class="small muted center">En foncé : exercices réussis ; en clair : exercices tentés.</p></div>';

    // carte de maîtrise
    html += '<div class="card"><h2>Carte de maîtrise du programme</h2><p class="small muted">Chaque case est un chapitre : ' +
      '<span class="state-dot"></span> pas commencé · <span class="state-dot s1"></span> découverte · <span class="state-dot s2"></span> en progrès · <span class="state-dot s3"></span> maîtrisé. Touche une case pour ouvrir le chapitre.</p>';
    P.listeClasses().forEach(function (k) {
      var cl = P.classes[k];
      html += '<div class="row" style="margin:8px 0;align-items:flex-start"><strong style="width:64px;flex:none">' + esc(cl.nom) + '</strong><div class="heat">' +
        cl.chapitres.map(function (id) {
          var e = S.etat(id);
          return '<a class="h' + e + '" href="#/chapitre/' + id + '?classe=' + k + '" title="' + esc(P.chapitres[id].titre) + ' — ' + Math.round(S.maitrise(id) * 100) + ' %" aria-label="' + esc(P.chapitres[id].titre) + '"></a>';
        }).join('') + '</div></div>';
    });
    html += '</div>';

    // badges
    html += '<div class="card"><h2>Badges</h2><div class="badges">' + S.badgesDef.map(function (b) {
      var got = d.badges[b.id];
      return '<div class="badge-card' + (got ? '' : ' locked') + '"><div class="b-ico">' + b.ico + '</div><strong>' + esc(b.nom) + '</strong><span>' + esc(b.desc) + (got ? '<br>✓ ' + esc(got.split('-').reverse().join('/')) : '') + '</span></div>';
    }).join('') + '</div></div>';

    if (d.examens.length) {
      html += '<div class="card"><h2>Examens blancs</h2><div class="table-wrap"><table class="t"><tr><th>Date</th><th>Examen</th><th>Code</th><th>Note</th><th>Mention</th></tr>' +
        d.examens.map(function (h) {
          return '<tr><td>' + esc(h.date.split('-').reverse().join('/')) + '</td><td>' + esc(h.nom) + '</td><td><code>' + esc(h.code || '') + '</code></td><td><strong>' + EM.T.txt(h.note) + '/20</strong></td><td>' + esc(EM.ui.mention(h.note)) + '</td></tr>';
        }).join('') + '</table></div></div>';
    }

    html += '<div class="card"><h2>Sauvegarde</h2><p class="small muted">Exporte ta progression pour la garder ou la transférer sur un autre appareil (par exemple par WhatsApp ou Bluetooth), puis importe le fichier. Dans l\'application Android, l\'export ouvre le menu de partage : enregistre le texte reçu dans un fichier .json pour l\'importer.</p>' +
      '<div class="row"><button class="btn" data-act="export">⬇️ Exporter</button><label class="btn ghost" style="cursor:pointer">⬆️ Importer<input type="file" accept="application/json,.json" data-act="import" hidden></label>' +
      '<button class="btn danger" data-act="reset">Tout effacer</button></div></div>';
    main.innerHTML = html;

    main.querySelector('#nom').addEventListener('change', function () { S.setNom(this.value); EM.ui.toast('Enregistré'); });
    main.querySelector('[data-act="export"]').addEventListener('click', function () {
      if (window.AndroidBridge && window.AndroidBridge.partager) {
        // dans l'application Android : on partage le fichier de progression (WhatsApp, Bluetooth, e-mail…)
        window.AndroidBridge.partager(S.exporter(), 'Progression ELITE MATHÉMATIQUE');
        return;
      }
      if (EM.MODE_EN_LIGNE) {
        // page en ligne : pas de téléchargement possible, on affiche le texte à copier
        EM.ui.modal('Exporter ma progression', '<p class="small muted">Copie ce texte et garde-le dans un fichier .json (ou envoie-le-toi par WhatsApp) pour l\'importer ailleurs.</p>' +
          '<textarea class="inp" id="exp-txt" readonly style="min-height:180px;font-family:monospace;font-size:.8rem"></textarea>' +
          '<div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn" data-copier>Copier</button></div>', function (body) {
          var ta = body.querySelector('#exp-txt');
          ta.value = S.exporter();
          body.querySelector('[data-copier]').addEventListener('click', function () { ta.select(); EM.ui.copy(ta.value, 'Progression copiée'); });
        });
        return;
      }
      var blob = new Blob([S.exporter()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'elite-mathematique-' + (S.nom() || 'progression').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-' + S.today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    main.querySelector('[data-act="import"]').addEventListener('change', function () {
      var f = this.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { S.importer(rd.result); EM.ui.toast('Progression importée'); EM.route(); } catch (e) { EM.ui.toast('Fichier invalide'); }
      };
      rd.readAsText(f);
    });
    main.querySelector('[data-act="reset"]').addEventListener('click', function () {
      EM.ui.confirmer('Tout effacer ?', 'Toute ta progression (points, badges, maîtrise, examens) sera supprimée de cet appareil. Cette action est définitive.', 'Tout effacer', function () { S.reinitialiser(); EM.route(); }, true);
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
