/*
 * Accueil : présentation, tableau de bord de la classe, défi du jour, accès aux fonctions, soutien du projet.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.views = EM.views || {};

  /** Lien de téléchargement de l'APK (publié par GitHub Actions depuis la branche principale). */
  EM.APK_URL = 'https://github.com/1983florent/elite-mathematique/releases/download/android/elite-mathematique.apk';
  /** Le logiciel tourne-t-il dans l'application Android ? */
  EM.estAndroid = function () { return !!(root.AndroidBridge && root.AndroidBridge.estAndroid); };

  /** Générateurs d'une classe (sans doublon). */
  EM.gensClasse = function (k, filtre) {
    var cl = EM.programme.classes[k], seen = {}, out = [];
    if (!cl) return out;
    cl.chapitres.forEach(function (id) {
      EM.gen.forChapter(id).forEach(function (g) {
        if (seen[g.id]) return;
        if (filtre && !filtre(g)) return;
        seen[g.id] = true;
        out.push(g);
      });
    });
    return out;
  };

  /** Chapitre conseillé : le premier chapitre avec exercices, non maîtrisé, dont les prérequis de la classe sont travaillés. */
  EM.chapitreConseille = function (k) {
    var cl = EM.programme.classes[k];
    if (!cl) return null;
    var avec = cl.chapitres.filter(function (id) { return EM.gen.forChapter(id).length; });
    var enCours = avec.filter(function (id) { var e = EM.store.etat(id); return e === 1 || e === 2; });
    if (enCours.length) return enCours.sort(function (a, b) { return EM.store.maitrise(a) - EM.store.maitrise(b); })[0];
    var nouveau = avec.filter(function (id) { return EM.store.etat(id) === 0; })[0];
    return nouveau || avec[0] || cl.chapitres[0];
  };

  /** Défi du jour : même exercice pour tous les élèves d'une classe, le même jour. */
  EM.defiDuJour = function (k) {
    var gens = EM.gensClasse(k, function (g) { return g.examen; });
    if (!gens.length) gens = EM.gensClasse(k);
    if (!gens.length) return null;
    var jour = EM.store.today();
    var rng = new EM.RNG('defi:' + k + ':' + jour);
    var g = rng.pick(gens);
    return { gen: g, seed: EM.hashSeed(jour) % 100000, niveau: Math.min(g.niveaux, 2) };
  };

  function featureTiles(k) {
    var cl = k ? EM.programme.classes[k] : null;
    var tiles = [
      ['📚', 'Programme officiel', 'Tous les chapitres, du CM2 à la Terminale : cours, méthodes, pièges et exemples.', '#/programme'],
      ['♾️', 'Exercices à l\'infini', 'Chaque exercice est généré au hasard, avec indices et correction détaillée.', k ? '#/serie/' + k : '#/programme'],
      ['📝', 'Examens blancs', 'CFEE, BFEM, BAC S1, S2, L : sujets complets, chronométrés et notés sur 20.', '#/examens'],
      ['🩺', 'Diagnostic', 'Un test rapide repère tes points faibles et te propose un parcours.', k ? '#/diagnostic/' + k : '#/programme'],
      ['🗂️', 'Révision espacée', 'Les cartes reviennent au bon moment pour ne plus rien oublier.', '#/revision'],
      ['🧪', 'Laboratoire', 'Grapheur, calculatrice, solveurs, statistiques, probabilités, complexes…', '#/labo'],
      ['👩🏾‍🏫', 'Espace enseignant', 'Fiches d\'exercices imprimables avec corrigé, partageables par code.', '#/enseignant'],
      ['🏆', 'Mes progrès', 'Maîtrise par chapitre, badges, série de jours, historique des examens.', '#/progres']
    ];
    if (cl && cl.examen) tiles[2][2] = 'Prépare le ' + cl.examen + ' : sujets complets, chronométrés, notés sur 20.';
    return '<div class="grid g3">' + tiles.map(function (t) {
      return '<a class="tile" href="' + t[3] + '"><span class="ico" aria-hidden="true">' + t[0] + '</span><span><h3>' + t[1] + '</h3><p>' + t[2] + '</p></span></a>';
    }).join('') + '</div>';
  }

  EM.views.accueil = function (main) {
    var P = EM.programme, S = EM.store, d = S.data();
    var k = S.classe();
    var cl = k ? P.classes[k] : null;
    var nbGen = EM.gen.list().length;
    var nbChap = P.ordre.length;
    var nbCartes = P.ordre.reduce(function (s, id) { return s + ((EM.contenu[id] || {}).flashcards || []).length; }, 0);

    var statsHtml = '<div class="stats-strip"><div><strong>' + nbChap + '</strong>chapitres</div><div><strong>' + nbGen + '</strong>types d\'exercices</div>' +
      '<div><strong>∞</strong>exercices corrigés</div><div><strong>' + nbCartes + '</strong>cartes de révision</div><div><strong>100 %</strong>hors ligne</div></div>';
    var html;
    if (cl) {
      // élève qui revient : accueil compact, son tableau de bord reste visible sur le premier écran
      var nom = S.nom();
      html = '<section class="hero hero-compact"><div class="hero-deco" aria-hidden="true">∑π√</div>' +
        '<p class="hero-kicker">Bonjour' + (nom ? ' ' + esc(nom) : '') + ' 👋</p>' +
        '<h1>' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h1>' +
        '<div class="row small hero-chips"><span class="chip gold">🔥 ' + d.serie.n + ' jour' + (d.serie.n > 1 ? 's' : '') + ' de suite</span>' +
        '<span class="chip">⭐ ' + d.xp + ' pts · ' + esc(S.rang().nom) + '</span></div>' +
        '<div class="row"><a class="btn gold" href="#/classe/' + k + '">Continuer en ' + esc(cl.nom) + ' →</a><button class="btn ghost" data-act="classe">Changer de classe</button></div></section>';
    } else {
      html = '<section class="hero"><div class="hero-deco" aria-hidden="true">∑π√</div>' +
        '<h1>Les mathématiques du programme sénégalais, du CM2 à la Terminale</h1>' +
        '<p>Cours clairs, exercices corrigés à l\'infini, examens blancs du CFEE, du BFEM et du BAC, outils de calcul : tout fonctionne sur téléphone, même sans connexion.</p>' +
        '<div class="row"><button class="btn gold" data-act="classe">Choisir ma classe</button><a class="btn ghost" href="#/programme">Voir le programme</a></div>' +
        statsHtml + '</section>';
    }

    if (cl) {
      var prog = Math.round(S.progresClasse(k) * 100);
      var rang = S.rang();
      var conseil = EM.chapitreConseille(k);
      var cartes = [];
      cl.chapitres.forEach(function (id) { ((EM.contenu[id] || {}).flashcards || []).forEach(function (c, i) { cartes.push(id + '#' + i); }); });
      var dues = S.cartesDues(cartes, 10).length;
      html += '<div class="grid g2">' +
        '<div class="card"><div class="row" style="gap:16px"><div class="ring" style="--p:' + prog + '"><span>' + prog + ' %</span></div>' +
        '<div><h2 style="margin:0">Ma progression</h2><div class="muted small">Maîtrise moyenne des chapitres de ' + esc(cl.nom) + '</div>' +
        (rang.suivant ? '<div class="small" style="margin-top:6px">Prochain rang : <strong>' + esc(rang.suivant) + '</strong> à ' + rang.seuil + ' pts</div>' : '') + '</div></div>' +
        (conseil ? '<p style="margin-top:14px" class="small muted">Chapitre conseillé :</p><a class="tile" href="#/chapitre/' + conseil + '"><span class="ico">🎯</span><span><h3>' + esc(P.chapitres[conseil].titre) + '</h3><p>Maîtrise : ' + Math.round(S.maitrise(conseil) * 100) + ' %</p></span></a>' : '') +
        '<div class="row" style="margin-top:12px"><a class="btn sm" href="#/serie/' + k + '">Série de 10 exercices</a>' +
        '<a class="btn sm ghost" href="#/revision">Réviser (' + dues + ' carte' + (dues > 1 ? 's' : '') + ')</a>' +
        (cl.examen ? '<a class="btn sm ghost" href="#/examens">Examen blanc ' + esc(cl.examen) + '</a>' : '') + '</div></div>';

      var defi = EM.defiDuJour(k);
      if (defi) {
        var fait = S.defiFait();
        html += '<div class="card senegal"><h2>☀️ Défi du jour</h2><p>Le même exercice pour tous les élèves de ' + esc(cl.nom) + ' du Sénégal aujourd\'hui. Relève-le et partage-le avec ta classe !</p>' +
          '<p><strong>' + EM.md(defi.gen.titre) + '</strong></p>' +
          (fait ? '<p class="chip ok">✓ Défi réussi aujourd\'hui</p> ' : '') +
          '<a class="btn" href="#/defi">' + (fait ? 'Revoir le défi' : 'Relever le défi (+20 pts)') + '</a></div>';
      }
      html += '</div>';
    } else {
      html += '<div class="card"><h2>Pour commencer, choisis ta classe</h2>' + classesPicker() + '</div>';
    }

    html += '<h2 class="section-title">Tout ce qu\'il faut pour réussir</h2>' + (cl ? '<div class="stats-card">' + statsHtml + '</div>' : '') + featureTiles(k);

    var faits = EM.afrique || [];
    if (faits.length) {
      var jour = new Date();
      var f = faits[(jour.getFullYear() * 400 + jour.getMonth() * 31 + jour.getDate()) % faits.length];
      html += '<h2 class="section-title">💡 Le saviez-vous ?</h2><div class="card history"><h3>' + esc(f.titre) + '</h3><p>' + EM.md(f.texte) + '</p>' +
        '<button class="linkbtn small" data-act="fait">Une autre anecdote</button></div>';
    }

    html += '<h2 class="section-title">💖 Soutenir le projet</h2><div class="card support">' +
      '<p>ELITE MATHÉMATIQUE est gratuit pour tous les élèves. Vous pouvez soutenir son développement :</p>' +
      '<p><strong>Wave / Orange Money :</strong> (+221) 70 601 31 69<br><strong>E-mail :</strong> <a href="mailto:maths.florent@gmail.com">maths.florent@gmail.com</a></p>' +
      '<img class="qr-img" src="qr-code.png" alt="QR code pour soutenir le projet" onerror="this.remove()">' +
      (EM.estAndroid() ? '' : '<p><a class="btn sm gold" href="' + EM.APK_URL + '">📱 Télécharger l\'application Android</a></p>') +
      '<div class="row"><button class="btn sm" data-act="copier">Copier le numéro</button><a class="btn sm ghost" href="mailto:maths.florent@gmail.com">Envoyer un message</a>' +
      '<a class="btn sm ghost" href="#/a-propos">À propos</a></div></div>' +
      '<p class="footer">© ' + new Date().getFullYear() + ' ELITE MATHÉMATIQUE — conforme aux programmes de mathématiques du Sénégal.</p>';

    main.innerHTML = html;
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (b) {
        var act = b.getAttribute('data-act');
        if (act === 'classe') EM.choisirClasse();
        if (act === 'copier') EM.ui.copy('+221706013169', 'Numéro copié');
        if (act === 'fait') {
          var box = b.closest('.history');
          var f2 = faits[Math.floor(Math.random() * faits.length)];
          box.querySelector('h3').textContent = f2.titre;
          box.querySelector('p').innerHTML = EM.md(f2.texte);
        }
      }
      var kb = e.target.closest('.classe-btn[data-k]');
      if (kb) { EM.store.setClasse(kb.getAttribute('data-k')); EM.route(); }
    });
  };

  function classesPicker() {
    var P = EM.programme;
    return P.cycles.map(function (c) {
      return '<div class="cycle"><h3>' + esc(c.nom) + '</h3><div class="classes">' + c.classes.map(function (k) {
        var cl = P.classes[k];
        return '<button class="classe-btn" style="--c:' + cl.couleur + '" data-k="' + k + '">' + esc(cl.nom) + '<small>' + (cl.examen ? esc(cl.examen) : '&nbsp;') + '</small></button>';
      }).join('') + '</div></div>';
    }).join('');
  }
  EM.classesPicker = classesPicker;

  /* ---------- À propos ---------- */
  EM.views.apropos = function (main) {
    main.innerHTML = '<div class="card"><h1>À propos d\'ELITE MATHÉMATIQUE</h1>' +
      '<p>ELITE MATHÉMATIQUE transforme le programme officiel de mathématiques du Sénégal en un logiciel interactif, gratuit et utilisable partout, même sans connexion internet.</p>' +
      '<h2>Ce qui le rend unique</h2><ul>' +
      '<li><strong>Exercices à l\'infini</strong> : chaque exercice est créé au hasard, avec des nombres différents, des indices progressifs et une correction détaillée étape par étape.</li>' +
      '<li><strong>Un code par exercice</strong> : le même code redonne exactement le même exercice. Un professeur peut donner une fiche, et chaque élève la retrouve sur son téléphone.</li>' +
      '<li><strong>Défi du jour national</strong> : le même exercice pour tous les élèves d\'une classe, le même jour.</li>' +
      '<li><strong>Examens blancs</strong> du CFEE, du BFEM et du BAC (S1, S2, L), chronométrés et notés avec mention.</li>' +
      '<li><strong>Diagnostic et prérequis</strong> : le logiciel repère les chapitres fragiles et remonte aux notions des classes précédentes.</li>' +
      '<li><strong>Révision espacée</strong> (boîtes de Leitner) des définitions et formules.</li>' +
      '<li><strong>Problèmes ancrés dans la vie au Sénégal</strong> : marchés, pêche, transport, agriculture, francs CFA.</li>' +
      '<li><strong>Laboratoire</strong> : grapheur, calculatrice, solveurs pas à pas, statistiques, probabilités, nombres complexes.</li></ul>' +
      '<h2>Installer l\'application</h2>' + (EM.estAndroid() ? '<p>Tu utilises déjà l\'application Android : tout fonctionne sans connexion.</p>' :
        '<p><a class="btn" href="' + EM.APK_URL + '">📱 Télécharger l\'application Android (APK)</a></p>' +
        '<p>Après le téléchargement, ouvre le fichier et autorise l\'installation (« sources inconnues ») si ton téléphone le demande. L\'application fonctionne sans connexion, sur Android 5.0 ou plus. ' +
        'Autre possibilité : dans Chrome, menu ⋮ puis « Installer l\'application ». Le dossier du logiciel peut aussi être copié sur une clé USB : il suffit d\'ouvrir <code>index.html</code>.</p>') +
      '<h2>Tes données</h2><p>Ta progression reste sur ton appareil. Tu peux l\'exporter dans « Mes progrès » pour la transférer sur un autre téléphone.</p>' +
      '<h2>Contact et soutien</h2><p><strong>Wave / Orange Money :</strong> (+221) 70 601 31 69 · <a href="mailto:maths.florent@gmail.com">maths.florent@gmail.com</a></p>' +
      '<p class="small muted">Affichage des formules : KaTeX (licence MIT). Contributions : voir <code>docs/CONTRIBUER.md</code>.</p></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
