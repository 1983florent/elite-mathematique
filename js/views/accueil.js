/*
 * Accueil : en-tête de présentation (avec un mini-exercice à essayer), ligne du parcours scolaire,
 * tableau de bord de l'élève, accès aux rubriques, soutien du projet.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  var I = function (n, o) { return EM.icon(n, o); };
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

  /** Chapitre conseillé : le chapitre en cours le plus fragile, sinon le premier non commencé. */
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
    var gens = EM.gensClasse(k, function (g) { return g.examen && !g.mission; });
    if (!gens.length) gens = EM.gensClasse(k);
    if (!gens.length) return null;
    var jour = EM.store.today();
    var rng = new EM.RNG('defi:' + k + ':' + jour);
    var g = rng.pick(gens);
    return { gen: g, seed: EM.hashSeed(jour) % 100000, niveau: Math.min(g.niveaux, 2) };
  };

  /** Bandeau à motif généré (graine = classe, chapitre…). */
  EM.bandeau = function (graine, contenu, opts) {
    opts = opts || {};
    return '<section class="bandeau bandeau-motif-droite' + (opts.classe ? ' ' + opts.classe : '') + '">' +
      EM.motif(graine, { cols: opts.cols || 10, rows: opts.rows || 4, titre: 'Motif géométrique généré' }) +
      '<div class="voile"></div><div class="bandeau-in">' + contenu + '</div>' +
      (opts.legende === false ? '' : '<span class="motif-legende">Pavage de Truchet · graine « ' + esc(String(graine).split(':').pop()) + ' »</span>') + '</section>';
  };

  /* ---------- ligne du parcours scolaire (plan de ligne) ---------- */
  var STATIONS = {
    'cm2': [60, 84], '6e': [178, 84], '5e': [280, 84], '4e': [382, 84], '3e': [500, 84],
    '2nde-s': [630, 84], '1ere-s1': [762, 46], 'tle-s1': [905, 46], '1ere-s2': [762, 130], 'tle-s2': [905, 130],
    '2nde-l': [630, 210], '1ere-l': [762, 210], 'tle-l': [905, 210]
  };
  EM.parcoursHtml = function (courante) {
    var P = EM.programme, S = EM.store;
    var svg = '<svg viewBox="0 0 980 262" role="img" aria-label="Ligne du parcours scolaire, du CM2 à la Terminale">' +
      '<path class="pm-ligne pm-tronc" d="M60 84H500"/>' +
      '<path class="pm-ligne pm-l" d="M500 84C570 84 562 210 630 210H905"/>' +
      '<path class="pm-ligne pm-s2" d="M630 84C700 84 694 130 762 130H905"/>' +
      '<path class="pm-ligne pm-s" d="M500 84H630C700 84 694 46 762 46H905"/>' +
      '<text class="pm-serie" x="940" y="50">S1</text><text class="pm-serie" x="940" y="134">S2</text><text class="pm-serie" x="940" y="214">L</text>';
    Object.keys(STATIONS).forEach(function (k) {
      var cl = P.classes[k], xy = STATIONS[k], x = xy[0], y = xy[1];
      var exam = !!cl.examen, r = exam ? 12 : 9;
      var p = S.progresClasse(k), C = 2 * Math.PI * 18;
      var haut = y < 70, bas = y > 170;
      var ny = haut ? y - 24 : y + 36, ey = haut ? y + 34 : y - 22;
      if (bas) { ny = y + 36; ey = y - 22; }
      svg += '<a href="#/classe/' + k + '" aria-label="' + esc(cl.long) + (exam ? ', examen ' + esc(cl.examen) : '') + '">' +
        '<g class="pm-station' + (k === courante ? ' courante' : '') + '">' +
        (p > 0 ? '<circle class="prog" cx="' + x + '" cy="' + y + '" r="18" stroke-dasharray="' + (p * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 ' + x + ' ' + y + ')"/>' : '') +
        '<circle class="st' + (exam ? ' exam' : '') + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
        '<text x="' + x + '" y="' + ny + '" text-anchor="middle">' + esc(cl.nom) + '</text>' +
        (exam ? '<text class="ex" x="' + x + '" y="' + ey + '" text-anchor="middle">' + esc(cl.examen) + '</text>' : '') +
        '</g></a>';
    });
    svg += '</svg>';
    // version téléphone : liste verticale
    var groupes = [
      { serie: '', classes: ['cm2', '6e', '5e', '4e', '3e'], cls: '' },
      { serie: 'Série S', classes: ['2nde-s', '1ere-s1', 'tle-s1'], cls: '' },
      { serie: 'Série S2', classes: ['1ere-s2', 'tle-s2'], cls: 's2' },
      { serie: 'Série L', classes: ['2nde-l', '1ere-l', 'tle-l'], cls: 'l' }
    ];
    var liste = '<ol class="parcours-liste">';
    groupes.forEach(function (g, gi) {
      if (g.serie) liste += '<li class="serie">' + esc(g.serie) + '</li>';
      g.classes.forEach(function (k, i) {
        var cl = P.classes[k], p = S.progresClasse(k);
        var c = [g.cls, k === courante ? 'courante' : '', cl.examen ? 'exam' : '', gi === 0 && i === 0 ? 'debut' : '', i === g.classes.length - 1 && gi > 0 ? 'fin' : ''].join(' ');
        liste += '<li class="' + c + '"><a href="#/classe/' + k + '"><strong>' + esc(cl.nom) + '</strong>' +
          (cl.examen ? '<span class="chip gold">' + esc(cl.examen) + '</span>' : '<span class="small muted">' + esc(cl.long) + '</span>') +
          EM.meter(p, p >= 0.7) + '</a></li>';
      });
    });
    liste += '</ol>';
    return '<div class="parcours-map">' + svg + '</div>' + liste;
  };

  /** Mini-exercice de l'en-tête : une équation du jour à résoudre tout de suite. */
  function equationDuJour() {
    var rng = new EM.RNG('essai:' + EM.store.today());
    var a = rng.int(2, 9), x = rng.int(-6, 9), b = rng.nz(-12, 15);
    return { a: a, b: b, c: a * x + b, x: x };
  }

  function rubriques(k) {
    var cl = k ? EM.programme.classes[k] : null;
    var t = [
      ['livre', '', 'Le programme officiel', 'Les 115 chapitres du CM2 à la Terminale : cours, méthodes, pièges et exemples corrigés.', '#/programme'],
      ['infini', 'or', 'Exercices à l\'infini', 'Chaque exercice est tiré au hasard, avec indices, vérification immédiate et correction pas à pas.', k ? '#/serie/' + k : '#/programme'],
      ['copie', '', 'Examens blancs', 'CFEE, BFEM, BAC S1, S2 et L : sujets complets, chronométrés, notés sur 20.', '#/examens'],
      ['carte', 'terre', 'Missions Sénégal', 'Des projets concrets en plusieurs étapes : marché, pêche, tontine, construction…', '#/missions'],
      ['curseurs', '', 'Démonstrations animées', 'Fais bouger les figures et vois les théorèmes à l\'œuvre.', '#/demos'],
      ['pouls', 'vert', 'Diagnostic', 'Un test rapide repère tes points faibles et propose un parcours de remédiation.', k ? '#/diagnostic/' + k : '#/programme'],
      ['cartes', 'or', 'Révision espacée', 'Les cartes de formules reviennent au bon moment pour ne plus rien oublier.', '#/revision'],
      ['fiole', '', 'Laboratoire', 'Grapheur, solveurs pas à pas, statistiques, probabilités, complexes.', '#/labo'],
      ['boussole', 'terre', 'Réussir son examen', 'Méthodes, gestion du temps, rédaction attendue, checklist du jour J.', '#/guides'],
      ['colonnes', 'or', 'Grands mathématiciens', 'D\'Ishango à l\'AIMS de Mbour : celles et ceux qui ont fait les mathématiques.', '#/histoire'],
      ['tableau', '', 'Espace enseignant', 'Fiches imprimables avec corrigé, partageables par code.', '#/enseignant'],
      ['chrono', 'vert', 'Calcul mental', 'Une minute chrono pour battre ton record.', '#/calcul-mental']
    ];
    if (cl && cl.examen) t[2][3] = 'Prépare le ' + cl.examen + ' : sujets complets, chronométrés, notés sur 20, avec mention.';
    return '<div class="grid g3">' + t.map(function (x) {
      return '<a class="tile" href="' + x[4] + '"><span class="ico-box ' + x[1] + '">' + I(x[0]) + '</span><span><h3>' + esc(x[2]) + '</h3><p>' + esc(x[3]) + '</p></span></a>';
    }).join('') + '</div>';
  }

  function portraitDuJour() {
    var h = EM.histoire || [];
    var j = new Date(), n = j.getFullYear() * 400 + j.getMonth() * 31 + j.getDate();
    if (h.length) {
      var idx = n % h.length, f = h[idx];
      return '<div class="portrait"><div class="portrait-head"><div class="monogramme">' + EM.motif('portrait:' + f.nom, { cols: 3, rows: 3, titre: '' }) +
        '<span>' + esc(initiales(f.nom)) + '</span></div><div><p class="eyebrow">Portrait du jour</p><h3>' + esc(f.nom) + '</h3>' +
        '<div class="meta">' + esc([f.epoque, f.lieu, f.domaine].filter(Boolean).join(' · ')) + '</div></div></div>' +
        '<div>' + EM.md(f.texte) + '</div><a class="btn sm ghost" href="#/histoire?p=' + idx + '" style="align-self:flex-start">Tous les portraits ' + I('fleche') + '</a></div>';
    }
    var faits = EM.afrique || [];
    if (!faits.length) return '';
    var fa = faits[n % faits.length];
    return '<div class="history"><p class="eyebrow">Le saviez-vous ?</p><h3>' + esc(fa.titre) + '</h3><p>' + EM.md(fa.texte) + '</p></div>';
  }
  function initiales(nom) {
    var mots = String(nom).replace(/^(L'|Le |La |Les )/i, '').split(/[\s-]+/).map(function (m) { return m.replace(/^[dl]['’]/i, ''); }).filter(function (m) { return /^[A-ZÀ-Ý]/.test(m); });
    return (mots[0] ? mots[0][0] : '?') + (mots.length > 1 ? mots[mots.length - 1][0] : '');
  }
  EM.initiales = initiales;

  function soutien() {
    return '<h2 class="section-title">' + I('coeur') + 'Soutenir le projet</h2><div class="support"><div>' +
      '<p>ELITE MATHÉMATIQUE est gratuit pour tous les élèves du Sénégal. Vous pouvez soutenir son développement :</p>' +
      '<p class="num"><strong>Wave / Orange Money :</strong> (+221) 70 601 31 69<br><strong>E-mail :</strong> maths.florent@gmail.com</p>' +
      '<div class="row">' + (EM.estAndroid() ? '' : '<a class="btn sm gold" href="' + EM.APK_URL + '">' + I('telephone') + 'Application Android</a>') +
      '<button class="btn sm ghost" data-act="copier">' + I('copier') + 'Copier le numéro</button><a class="btn sm ghost" href="#/a-propos">' + I('info') + 'À propos</a></div></div>' +
      '<img class="qr-img" src="qr-code.png" alt="QR code pour soutenir le projet" onerror="this.remove()"></div>' +
      '<p class="footer">© ' + new Date().getFullYear() + ' ELITE MATHÉMATIQUE · Programme de mathématiques du Sénégal, du CM2 à la Terminale.</p>';
  }

  EM.views.accueil = function (main) {
    var P = EM.programme, S = EM.store, d = S.data();
    var k = S.classe();
    var cl = k ? P.classes[k] : null;
    var nbGen = EM.gen.list().filter(function (g) { return !g.mission; }).length;
    var nbMissions = EM.gen.list().filter(function (g) { return g.mission; }).length;
    var nbChap = P.ordre.length;
    var nbCartes = P.ordre.reduce(function (s, id) { return s + ((EM.contenu[id] || {}).flashcards || []).length; }, 0);
    var html = '';

    if (!cl) {
      var eq = equationDuJour();
      html += '<section class="hero2"><div class="hero2-copy"><p class="eyebrow">Programme officiel du Sénégal · CM2 → Terminale</p>' +
        '<h1>Les maths, du CFEE <em>au BAC</em>, dans ta poche.</h1>' +
        '<p class="lead">Cours clairs, exercices corrigés à l\'infini, examens blancs, démonstrations animées et problèmes de la vie au Sénégal. Tout fonctionne sur téléphone, même sans connexion.</p>' +
        '<div class="row" style="margin-top:18px"><button class="btn gold" data-act="classe">' + I('ecole') + 'Choisir ma classe</button>' +
        '<a class="btn ghost" href="#/programme">Découvrir le programme</a></div>' +
        '<dl class="hero-stats"><div><dt class="num">' + nbChap + '</dt><dd>chapitres</dd></div><div><dt class="num">' + nbGen + '</dt><dd>types d\'exercices</dd></div>' +
        '<div><dt>∞</dt><dd>exercices corrigés</dd></div><div><dt class="num">' + nbCartes + '</dt><dd>cartes de révision</dd></div>' +
        (nbMissions ? '<div><dt class="num">' + nbMissions + '</dt><dd>missions</dd></div>' : '') + '</dl></div>' +
        '<div class="hero2-visual">' + EM.motif('elite', { cols: 6, rows: 6, titre: 'Motif géométrique généré' }) +
        '<form class="essai" id="essai"><p class="eyebrow">Essaie tout de suite</p><p style="margin-bottom:8px">Résoudre l\'équation :</p>' +
        '<div class="center" style="font-size:1.25rem;margin-bottom:10px">' + EM.render.tex(EM.T.mono(eq.a, 'x', true) + EM.T.signed(eq.b) + ' = ' + EM.T.num(eq.c)) + '</div>' +
        '<div class="q-line"><label class="q-label" for="essai-x">' + EM.render.tex('x =') + '</label><input class="q-input" id="essai-x" inputmode="decimal" autocomplete="off">' +
        '<button class="btn" type="submit">' + I('valide') + 'Vérifier</button></div><div class="essai-fb" aria-live="polite"></div></form></div></section>';
      html += '<section class="parcours"><div class="parcours-head"><h2>Où en es-tu ?</h2><span class="muted small">Touche ta classe pour commencer</span></div>' + EM.parcoursHtml(null) + '</section>';
    } else {
      var prog = Math.round(S.progresClasse(k) * 100), rang = S.rang(), nom = S.nom();
      html += EM.bandeau(k, '<div class="salut"><div class="ring" style="--p:' + prog + '"><span class="num">' + prog + ' %</span></div>' +
        '<div><p class="eyebrow">Bonjour' + (nom ? ' ' + esc(nom) : '') + '</p><h1>' + esc(cl.long) + (cl.examen ? ' <span class="badge">' + esc(cl.examen) + '</span>' : '') + '</h1>' +
        '<div class="salut-chips"><span class="chip gold">' + I('flamme') + d.serie.n + ' jour' + (d.serie.n > 1 ? 's' : '') + ' de suite</span>' +
        '<span class="chip">' + I('etoile') + d.xp + ' points · ' + esc(rang.nom) + '</span></div></div>' +
        '<div class="row"><a class="btn gold" href="#/classe/' + k + '">Continuer ' + I('fleche') + '</a><button class="btn ghost" data-act="classe">Changer de classe</button></div></div>');

      var conseil = EM.chapitreConseille(k);
      var cartes = [];
      cl.chapitres.forEach(function (id) { ((EM.contenu[id] || {}).flashcards || []).forEach(function (c, i) { cartes.push(id + '#' + i); }); });
      var dues = S.cartesDues(cartes, 10).length;
      var defi = EM.defiDuJour(k), fait = S.defiFait();
      html += '<div class="dash">' +
        (conseil ? '<div class="card"><h3>' + I('cible') + 'Chapitre conseillé</h3><p style="margin:0"><strong>' + esc(P.chapitres[conseil].titre) + '</strong></p>' +
          EM.meter(S.maitrise(conseil), S.etat(conseil) === 3) + '<span class="small muted">Maîtrise : ' + Math.round(S.maitrise(conseil) * 100) + ' %</span>' +
          '<a class="btn sm push" href="#/chapitre/' + conseil + '">Travailler ce chapitre</a></div>' : '') +
        (defi ? '<div class="card"><h3>' + I('soleil') + 'Défi du jour</h3><p class="small muted" style="margin:0">Le même exercice pour tous les élèves de ' + esc(cl.nom) + ' du Sénégal aujourd\'hui.</p>' +
          '<p style="margin:0"><strong>' + EM.md(defi.gen.titre) + '</strong></p>' + (fait ? '<span class="chip ok">' + I('valide') + 'Réussi aujourd\'hui</span>' : '') +
          '<a class="btn sm ' + (fait ? 'ghost' : 'gold') + ' push" href="#/defi">' + (fait ? 'Revoir le défi' : 'Relever le défi · +20 points') + '</a></div>' : '') +
        '<div class="card"><h3>' + I('cartes') + 'À faire aujourd\'hui</h3><div class="row" style="align-items:baseline;gap:8px"><span class="big-num num">' + dues + '</span><span class="muted">carte' + (dues > 1 ? 's' : '') + ' à réviser</span></div>' +
          '<div class="row push"><a class="btn sm" href="#/revision">Réviser</a><a class="btn sm ghost" href="#/serie/' + k + '">Série de 10</a>' +
          (cl.examen ? '<a class="btn sm ghost" href="#/examens">Examen blanc</a>' : '') + '</div></div></div>';
      html += '<section class="parcours" style="margin-top:16px"><div class="parcours-head"><h2>Ton parcours</h2><span class="muted small">Du CM2 au BAC · ta progression par classe</span></div>' + EM.parcoursHtml(k) + '</section>';
    }

    html += '<h2 class="section-title">' + I('programme') + 'Tout ce qu\'il faut pour réussir</h2>' + rubriques(k);
    var pj = portraitDuJour();
    if (pj) html += '<h2 class="section-title">' + I('colonnes') + 'Mathématiques et histoire</h2>' + pj;
    html += soutien();
    main.innerHTML = html;

    var essai = main.querySelector('#essai');
    if (essai) {
      essai.addEventListener('submit', function (e) {
        e.preventDefault();
        var eq2 = equationDuJour(), fb = essai.querySelector('.essai-fb');
        var r = EM.check({ type: 'number', reponse: eq2.x }, essai.querySelector('#essai-x').value);
        fb.className = 'essai-fb ' + (r.ok ? 'ok' : 'ko');
        fb.innerHTML = r.ok ? 'Bravo ! ' + EM.render.tex('x = ' + eq2.x) + '. Choisis ta classe pour continuer.' :
          (r.msg ? esc(r.msg) : 'Pas encore : isole ' + EM.render.tex('x') + ' en retranchant ' + EM.render.tex(EM.T.par(eq2.b)) + ' puis en divisant par ' + eq2.a + '.');
      });
    }
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (b) {
        var act = b.getAttribute('data-act');
        if (act === 'classe') EM.choisirClasse();
        if (act === 'copier') EM.ui.copy('+221706013169', 'Numéro copié');
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
        return '<button class="classe-btn" data-k="' + k + '">' + esc(cl.nom) + '<small>' + (cl.examen ? esc(cl.examen) : '&nbsp;') + '</small></button>';
      }).join('') + '</div></div>';
    }).join('');
  }
  EM.classesPicker = classesPicker;

  /* ---------- À propos ---------- */
  EM.views.apropos = function (main) {
    var li = function (ico, t, d) { return '<div class="tile" style="cursor:default"><span class="ico-box">' + I(ico) + '</span><span><h3>' + t + '</h3><p>' + d + '</p></span></div>'; };
    main.innerHTML = EM.bandeau('a-propos', '<p class="eyebrow">À propos</p><h1>ELITE MATHÉMATIQUE</h1><p style="max-width:56ch">Le programme officiel de mathématiques du Sénégal, transformé en logiciel interactif, gratuit et utilisable partout, même sans connexion internet.</p>') +
      '<h2 class="section-title">Ce qui le rend unique</h2><div class="grid g2">' +
      li('infini', 'Exercices à l\'infini', 'Chaque exercice est créé au hasard, avec des nombres différents, des indices progressifs et une correction détaillée étape par étape.') +
      li('lien', 'Un code par exercice', 'Le même code redonne exactement le même exercice : un professeur donne une fiche, chaque élève la retrouve sur son téléphone.') +
      li('soleil', 'Défi du jour national', 'Le même exercice pour tous les élèves d\'une classe, le même jour, à partager avec la classe.') +
      li('copie', 'Examens blancs', 'CFEE, BFEM et BAC (S1, S2, L), chronométrés et notés avec mention.') +
      li('pouls', 'Diagnostic et prérequis', 'Le logiciel repère les chapitres fragiles et remonte aux notions des classes précédentes.') +
      li('carte', 'Missions Sénégal', 'Des projets concrets ancrés dans la vie au Sénégal : marchés, pêche, transport, agriculture, francs CFA.') +
      li('curseurs', 'Démonstrations animées', 'Des figures qu\'on fait bouger pour comprendre les théorèmes.') +
      li('fiole', 'Laboratoire', 'Grapheur, calculatrice, solveurs pas à pas, statistiques, probabilités, nombres complexes.') + '</div>' +
      '<div class="card" style="margin-top:16px"><h2>Installer l\'application</h2>' + (EM.estAndroid() ? '<p>Tu utilises déjà l\'application Android : tout fonctionne sans connexion.</p>' :
        '<p><a class="btn gold" href="' + EM.APK_URL + '">' + I('telephone') + 'Télécharger l\'application Android (APK)</a></p>' +
        '<p>Après le téléchargement, ouvre le fichier et autorise l\'installation (« sources inconnues ») si ton téléphone le demande. L\'application fonctionne sans connexion, sur Android 5.0 ou plus. ' +
        'Autre possibilité : dans Chrome, menu ⋮ puis « Installer l\'application ». Le dossier du logiciel peut aussi être copié sur une clé USB : il suffit d\'ouvrir <code>index.html</code>.</p>') +
      '<h2>Tes données</h2><p>Ta progression reste sur ton appareil. Tu peux l\'exporter dans « Mes progrès » pour la transférer sur un autre téléphone.</p>' +
      '<h2>Contact et soutien</h2><p class="num"><strong>Wave / Orange Money :</strong> (+221) 70 601 31 69 · maths.florent@gmail.com</p>' +
      '<p class="small muted">Polices : Bricolage Grotesque et Lexend (licence SIL OFL). Formules : KaTeX (licence MIT). Contributions : voir <code>docs/CONTRIBUER.md</code>.</p></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
