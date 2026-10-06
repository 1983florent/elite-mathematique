/*
 * ELITE MATHÉMATIQUE — générateurs d'exercices du CM2 (préparation au CFEE) et de la 6e.
 * Conventions : énoncés à l'infinitif (comme aux examens), indices et corrections au tutoiement,
 * nombres écrits avec EM.T (virgule décimale, espaces des milliers), montants en F CFA.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  var NB = '\u00a0'; // espace insécable
  function R(x, d) { return EM.ar.round(x, d == null ? 6 : d); }
  function pw(k) { return Math.pow(10, k); }
  /** nombre en TeX (sans les $) */
  function n(x) { return T.num(R(x)); }
  /** nombre en TeX dans le texte */
  function m(x) { return '$' + n(x) + '$'; }
  /** nombre suivi d'une unité, dans le texte */
  function u(x, unite) { return m(x) + NB + unite; }
  /** montant en F CFA (texte simple) */
  function cfa(x) { return T.fcfa(R(x)).replace(/ /g, NB); }
  /** fraction en TeX */
  function fr(a, b) { return '\\dfrac{' + n(a) + '}{' + n(b) + '}'; }
  /** « de Moussa », « d'Awa » */
  function de(nom) { return /^[AEIOUÉ]/.test(nom) ? "d'" + nom : 'de ' + nom; }
  /** « que Moussa », « qu'Awa » */
  function que(nom) { return /^[AEIOUÉ]/.test(nom) ? "qu'" + nom : 'que ' + nom; }
  /** heure ou durée : 7 h 05 min */
  function hm(h, mi) { return h + NB + 'h' + (mi ? NB + (mi < 10 ? '0' + mi : mi) + NB + 'min' : ''); }
  /** durée : « 35 min » plutôt que « 0 h 35 min » */
  function duree(h, mi) { return h ? hm(h, mi) : mi + NB + 'min'; }

  var FILLES = ['Awa', 'Fatou', 'Aminata', 'Khady', 'Ndèye', 'Mariama', 'Coumba', 'Astou', 'Seynabou', 'Dieynaba', 'Bineta', 'Rokhaya'];
  var GARCONS = ['Moussa', 'Mamadou', 'Ousmane', 'Ibrahima', 'Cheikh', 'Babacar', 'Lamine', 'Modou', 'Abdou', 'Pape', 'Alioune', 'Saliou'];
  var VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Tambacounda', 'Mbour', 'Rufisque', 'Louga', 'Diourbel', 'Kolda', 'Fatick', 'Matam', 'Kédougou', 'Sédhiou', 'Kaffrine'];

  function personne(rng, exclus, genre) {
    var p, guard = 0;
    do {
      var f = genre === 'f' ? true : genre === 'm' ? false : rng.bool();
      p = { nom: rng.pick(f ? FILLES : GARCONS), f: f, il: f ? 'elle' : 'il', Il: f ? 'Elle' : 'Il', e: f ? 'e' : '' };
      guard++;
    } while (exclus && exclus.indexOf(p.nom) >= 0 && guard < 100);
    return p;
  }

  /** Question à choix : mélange les choix, sans doublon, et calcule l'index de la bonne réponse. */
  function qcm(rng, bonne, autres, label) {
    var liste = [bonne];
    autres.forEach(function (c) { if (liste.indexOf(c) < 0) liste.push(c); });
    var choix = rng.shuffle(liste);
    return { label: label || 'Réponse :', type: 'choice', choix: choix, reponse: choix.indexOf(bonne) };
  }
  /** Question numérique. */
  function qnum(label, val, unite, tol) {
    var q = { label: label, type: 'number', reponse: R(val) };
    if (unite) q.unite = unite;
    if (tol != null) q.tol = tol;
    return q;
  }

  /* ------------------------------------------------------------------ */
  /* Nombres en lettres (orthographe traditionnelle)                     */
  /* ------------------------------------------------------------------ */
  var UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  var DIZAINES = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  function moins100(k, pluriel) {
    if (k < 17) return UNITES[k];
    if (k < 20) return 'dix-' + UNITES[k - 10];
    var d = Math.floor(k / 10), r = k % 10;
    if (d === 7) return r === 1 ? 'soixante et onze' : 'soixante-' + moins100(10 + r);
    if (d === 8) return r === 0 ? (pluriel ? 'quatre-vingts' : 'quatre-vingt') : 'quatre-vingt-' + UNITES[r];
    if (d === 9) return 'quatre-vingt-' + moins100(10 + r);
    if (r === 0) return DIZAINES[d];
    if (r === 1) return DIZAINES[d] + ' et un';
    return DIZAINES[d] + '-' + UNITES[r];
  }
  /** pluriel : « cent » et « quatre-vingt » peuvent prendre un s (faux devant « mille ») */
  function moins1000(k, pluriel) {
    var c = Math.floor(k / 100), r = k % 100, s = '';
    if (c === 1) s = 'cent';
    else if (c > 1) s = UNITES[c] + ' cent' + (r === 0 && pluriel ? 's' : '');
    if (r) s += (s ? ' ' : '') + moins100(r, pluriel);
    return s;
  }
  function motsClasse(v, classe) {
    if (classe === 'milliards') return v === 1 ? 'un milliard' : moins1000(v, true) + ' milliards';
    if (classe === 'millions') return v === 1 ? 'un million' : moins1000(v, true) + ' millions';
    if (classe === 'mille') return v === 1 ? 'mille' : moins1000(v, false) + ' mille';
    return moins1000(v, true);
  }
  function classesDe(N) {
    return [
      { v: Math.floor(N / 1e9), c: 'milliards' },
      { v: Math.floor(N / 1e6) % 1000, c: 'millions' },
      { v: Math.floor(N / 1e3) % 1000, c: 'mille' },
      { v: N % 1000, c: 'unités' }
    ];
  }
  function enLettres(N) {
    if (N === 0) return 'zéro';
    return classesDe(N).filter(function (g) { return g.v; }).map(function (g) { return motsClasse(g.v, g.c); }).join(' ');
  }
  /** « 4 | 735 | 206 » avec le nom des classes */
  function tableauClasses(N) {
    var s = String(N), groupes = [];
    while (s.length > 3) { groupes.unshift(s.slice(-3)); s = s.slice(0, -3); }
    groupes.unshift(s);
    var noms = ['unités', 'mille', 'millions', 'milliards'], k = groupes.length;
    return groupes.map(function (g, i) { return '<b>' + g + '</b> (classe des ' + noms[k - 1 - i] + ')'; }).join(' | ');
  }
  /** nombre de L chiffres, avec des zéros intercalés (probabilité pZero) */
  function grandNombre(rng, L, pZero) {
    var s = String(rng.int(1, 9));
    for (var i = 1; i < L; i++) s += rng.bool(pZero) ? '0' : String(rng.int(1, 9));
    return parseInt(s, 10);
  }
  /** nombres « voisins » (erreurs de position des chiffres) pour les distracteurs */
  function voisins(N) {
    var s = String(N), out = [];
    function add(t) { var v = parseInt(t, 10); if (t[0] !== '0' && v !== N && out.indexOf(v) < 0) out.push(v); }
    for (var i = 0; i + 1 < s.length; i++) if (s[i] !== s[i + 1]) add(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2));
    for (var j = 1; j < s.length; j++) if (s[j] === '0') add(s.slice(0, j) + s.slice(j + 1));
    for (var k = 1; k < s.length; k++) add(s.slice(0, k) + '0' + s.slice(k));
    return out;
  }

  var RANGS = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille', 'unités de millions', 'dizaines de millions', 'centaines de millions'];
  var RANGS_NB = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille', 'centaines de mille', 'millions', 'dizaines de millions', 'centaines de millions'];

  /* ------------------------------------------------------------------ */
  /* Petites figures                                                     */
  /* ------------------------------------------------------------------ */
  function figRect(L, l, labL, labl, opt) {
    opt = opt || {};
    var ld = Math.max(l, 0.3 * L), Ld = Math.max(L, 0.3 * l);   // évite les figures trop plates
    var P = [[0, 0], [Ld, 0], [Ld, ld], [0, ld]];
    var f = EM.fig.fit(P, { w: 280, h: 180, pad: 44 });
    f.poly(P, { fill: true });
    f.rightAngle([Ld, 0], [0, 0], [0, ld]).rightAngle([0, 0], [Ld, 0], [Ld, ld]).rightAngle([Ld, 0], [Ld, ld], [0, ld]).rightAngle([Ld, ld], [0, ld], [0, 0]);
    f.segLabel([0, 0], [Ld, 0], labL, { inside: [Ld / 2, ld / 2] });
    if (labl) f.segLabel([Ld, 0], [Ld, ld], labl, { inside: [Ld / 2, ld / 2], k: 26 });
    if (opt.carre) { f.ticks([0, 0], [Ld, 0], 1).ticks([Ld, 0], [Ld, ld], 1).ticks([Ld, ld], [0, ld], 1).ticks([0, ld], [0, 0], 1); }
    return f.svg();
  }

  function figPave(L, l, h, labs) {
    var dx = l * 0.4, dy = l * 0.28;
    var A = [0, 0], B = [L, 0], C = [L, h], D = [0, h];
    var A2 = [dx, dy], B2 = [L + dx, dy], C2 = [L + dx, h + dy], D2 = [dx, h + dy];
    var f = EM.fig.fit([A, B, C, D, A2, B2, C2, D2], { w: 280, h: 210, pad: 44 });
    f.poly([A, B, C, D], { fill: true });
    f.seg(D, D2).seg(C, C2).seg(D2, C2).seg(B, B2).seg(B2, C2);
    f.seg(A, A2, { dash: true }).seg(A2, B2, { dash: true }).seg(A2, D2, { dash: true });
    if (labs) {
      f.segLabel(A, B, labs[0], { inside: C });
      f.segLabel(B, B2, labs[1], { inside: A, k: 20 });
      f.segLabel(A, D, labs[2], { inside: B, k: 26 });
    }
    return f.svg();
  }

  /** Triangle de côtés BC = a, AC = b, AB = c (noms : [A, B, C]). */
  function triangleCoords(a, b, c) {
    var cosA = (b * b + c * c - a * a) / (2 * b * c);
    var sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    return [[0, 0], [c, 0], [b * cosA, b * sinA]];
  }

  function diagrammeBarres(cats, vals, pas, titre) {
    var nC = cats.length, vmax = Math.max.apply(null, vals);
    var top = Math.ceil(vmax / pas) * pas + pas;
    var larg = nC * 1.4 + 0.3;
    var f = EM.fig.create({ w: Math.max(300, nC * 58 + 50), h: 240, xmin: -1.5, xmax: larg + 0.2, ymin: -top * 0.14, ymax: top * 1.05, title: titre });
    for (var y = pas; y <= top + 1e-9; y += pas) {
      f.seg([0, y], [larg, y], { light: true, dash: true });
      f.text([-0.15, y - top * 0.017], String(y), { small: true, anchor: 'end' });
    }
    cats.forEach(function (c, i) {
      var x = 0.3 + i * 1.4;
      f.rect(x, 0, 0.9, vals[i]);
      f.text([x + 0.45, -top * 0.085], c, { small: true });
    });
    f.seg([0, 0], [larg, 0]).seg([0, 0], [0, top]);
    return f.svg();
  }

  /* ================================================================== */
  /* CM2                                                                 */
  /* ================================================================== */

  /* ---------- 1. Numération ---------- */
  function numPosition(rng) {
    var L = rng.int(6, 7);
    var N = grandNombre(rng, L, 0.12);
    var r1 = rng.int(1, L - 1);
    var r2 = rng.intExcept(1, Math.min(L - 1, 6), [r1]);
    var chiffre = Math.floor(N / pw(r1)) % 10;
    var nombre = Math.floor(N / pw(r2));
    return {
      enonce: 'On considère le nombre ' + m(N) + '.<br>Donner le chiffre des ' + RANGS[r1] + ', puis le nombre de ' + RANGS_NB[r2] + ' de ce nombre.',
      questions: [
        qnum('Chiffre des ' + RANGS[r1] + ' :', chiffre),
        qnum('Nombre de ' + RANGS_NB[r2] + ' :', nombre)
      ],
      indices: [
        'Range le nombre dans le tableau de numération : classe des unités, classe des mille, classe des millions.',
        'Le <b>chiffre</b> des … est un seul chiffre. Le <b>nombre</b> de … s\'obtient en gardant tous les chiffres situés à gauche de ce rang, ce rang compris.'
      ],
      solution: [
        'Tableau de numération : ' + tableauClasses(N) + '.',
        'En comptant les rangs à partir de la droite (unités, dizaines, centaines, unités de mille…), le chiffre des ' + RANGS[r1] + ' est ' + m(chiffre) + '.',
        'Pour le nombre de ' + RANGS_NB[r2] + ', tu supprimes ' + (r2 === 1 ? 'le dernier chiffre' : 'les ' + r2 + ' derniers chiffres') + ' : tu obtiens ' + m(nombre) + '.',
        'En effet, ' + m(N) + ' $= ' + n(nombre) + ' \\times ' + n(pw(r2)) + ' + ' + n(N % pw(r2)) + '$ : il contient ' + m(nombre) + ' ' + RANGS_NB[r2] + '.'
      ]
    };
  }

  function decompoLettres(N) {
    var l = ['On découpe le nombre en classes de trois chiffres à partir de la droite : ' + tableauClasses(N) + '.'];
    classesDe(N).forEach(function (g) {
      if (!g.v) return;
      l.push('Classe des ' + g.c + ' : ' + m(g.v) + ' se lit « ' + motsClasse(g.v, g.c) + ' ».');
    });
    return l;
  }

  function numLettres(rng) {
    var N = grandNombre(rng, rng.int(6, 9), 0.35);
    var mots = enLettres(N);
    var regle = 'Rappel : « mille » est invariable ; « cent » et « vingt » prennent un s quand ils sont multipliés et terminent le nombre (deux cents, quatre-vingts), mais pas devant « mille » ; « million » et « milliard » prennent un s au pluriel.';
    if (rng.bool()) {
      return {
        enonce: 'Écrire en chiffres le nombre : « ' + mots + ' ».',
        questions: [qnum('Nombre :', N)],
        indices: [
          'Repère les mots « milliard(s) », « million(s) » et « mille » : ils séparent les classes.',
          'Chaque classe, sauf celle de gauche, s\'écrit avec exactement trois chiffres : complète par des zéros.'
        ],
        solution: decompoLettres(N).concat(['On écrit chaque classe avec trois chiffres (sauf la première) en complétant par des zéros : ' + m(N) + '.']),
        aide: 'Tu peux écrire le nombre avec ou sans espaces entre les classes.'
      };
    }
    var autres = rng.sample(voisins(N), 3).map(enLettres);
    return {
      enonce: 'Choisir l\'écriture en lettres du nombre ' + m(N) + '.',
      questions: [qcm(rng, mots, autres, 'Écriture en lettres :')],
      indices: [
        'Découpe le nombre en classes de trois chiffres à partir de la droite.',
        'Lis chaque classe comme un nombre de 1 à 999, puis ajoute le nom de la classe (milliards, millions, mille).'
      ],
      solution: decompoLettres(N).concat([regle, 'Le nombre s\'écrit donc : « ' + mots + ' ».'])
    };
  }

  function numDecomposition(rng) {
    var cas = rng.int(0, 2), N, enonce, sol;
    if (cas === 0) {
      var mi = rng.int(1, 999), mil = rng.bool(0.3) ? rng.int(1, 99) : rng.int(0, 999), un = rng.bool(0.3) ? rng.int(1, 99) : rng.int(1, 999);
      var mds = rng.bool(0.3) ? rng.int(1, 9) : 0;
      N = mds * 1e9 + mi * 1e6 + mil * 1e3 + un;
      var parts = [];
      if (mds) parts.push(m(mds) + ' ' + (mds > 1 ? 'milliards' : 'milliard'));
      parts.push(m(mi) + ' ' + (mi > 1 ? 'millions' : 'million'));
      if (mil) parts.push(m(mil) + ' mille');
      parts.push(m(un) + ' ' + (un > 1 ? 'unités' : 'unité'));
      enonce = 'Écrire en chiffres le nombre composé de ' + parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1] + '.';
      sol = [
        'Chaque classe (sauf la première) s\'écrit avec trois chiffres : on complète par des zéros si nécessaire.',
        (mds ? 'Classe des milliards : ' + m(mds) + ' ; ' : '') + 'classe des millions : ' + m(mi) + ' ; classe des mille : ' + (mil ? m(mil) : 'aucun, donc « 000 »') + ' ; classe des unités : ' + m(un) + '.',
        'Le nombre est ' + m(N) + '.'
      ];
    } else if (cas === 1) {
      N = grandNombre(rng, rng.int(6, 8), 0.4);
      var s = String(N), termes = [];
      for (var i = 0; i < s.length; i++) {
        var d = parseInt(s[i], 10), p = s.length - 1 - i;
        if (!d) continue;
        termes.push(p === 0 ? n(d) : '(' + n(d) + ' \\times ' + n(pw(p)) + ')');
      }
      enonce = 'Écrire en chiffres le nombre : $$' + termes.join(' + ') + '$$';
      sol = [
        'Chaque produit indique un chiffre et son rang : par exemple $' + s[0] + ' \\times ' + n(pw(s.length - 1)) + '$ place le chiffre ' + s[0] + ' au rang des ' + RANGS[s.length - 1] + '.',
        'Les rangs absents correspondent au chiffre 0.',
        'On obtient ' + m(N) + '.'
      ];
    } else {
      var r = rng.pick([1, 2, 3]), k = rng.int(1001, 98765);
      N = k * pw(r);
      enonce = 'Écrire en chiffres le nombre égal à ' + m(k) + ' ' + RANGS_NB[r] + '.';
      sol = [
        'Une unité de ce rang vaut ' + m(pw(r)) + '.',
        'Donc ' + m(k) + ' ' + RANGS_NB[r] + ' valent $' + n(k) + ' \\times ' + n(pw(r)) + ' = ' + n(N) + '$.',
        'On écrit ' + r + ' zéro' + (r > 1 ? 's' : '') + ' à droite de ' + m(k) + ' : ' + m(N) + '.'
      ];
    }
    return {
      enonce: enonce,
      questions: [qnum('Nombre :', N)],
      indices: ['Pense au tableau de numération et à la valeur de chaque rang.', 'N\'oublie pas les zéros des rangs vides.'],
      solution: sol,
      aide: 'Tu peux écrire le nombre avec ou sans espaces entre les classes.'
    };
  }

  EM.gen.register({
    id: 'cm2-numeration',
    titre: 'Lire, écrire et décomposer les grands nombres',
    chapitres: ['cm2-numeration', '6e-entiers'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) return numPosition(rng);
      if (niveau === 2) return numLettres(rng);
      return numDecomposition(rng);
    }
  });

  /* ---------- 2. Opérations sur les entiers ---------- */
  function arrondiMille(x) { return Math.round(x / 1000) * 1000; }
  function produitsPartiels(a, b) {
    var s = String(b), termes = [], valeurs = [];
    for (var i = s.length - 1; i >= 0; i--) {
      var d = parseInt(s[i], 10), p = pw(s.length - 1 - i);
      if (!d) continue;
      termes.push(n(a) + ' \\times ' + n(d * p));
      valeurs.push(a * d * p);
    }
    if (termes.length === 1) return '$' + n(a) + ' \\times ' + n(b) + ' = ' + n(a * b) + '$';
    return '$' + n(a) + ' \\times ' + n(b) + ' = ' + termes.join(' + ') + ' = ' + valeurs.map(n).join(' + ') + ' = ' + n(a * b) + '$';
  }

  EM.gen.register({
    id: 'cm2-operations',
    titre: 'Addition, soustraction et multiplication de nombres entiers',
    chapitres: ['cm2-operations', '6e-entiers'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var p = personne(rng), a, b, c, res, enonce, sol, q;
      if (niveau === 1) {
        if (rng.bool()) {
          var ctx = rng.bool();
          if (ctx) { a = rng.int(400, 3999) * 25; b = rng.int(400, 3999) * 25; c = rng.int(400, 3999) * 25; }
          else { a = rng.int(10000, 999999); b = rng.int(1000, 9999); c = rng.int(100, 999); }
          res = a + b + c;
          enonce = ctx
            ? 'Au marché Sandaga, un commerçant a vendu pour ' + cfa(a) + ' de marchandises le lundi, ' + cfa(b) + ' le mardi et ' + cfa(c) + ' le mercredi.<br>Calculer la recette totale de ces trois jours.'
            : 'Calculer : $' + n(a) + ' + ' + n(b) + ' + ' + n(c) + '$.';
          q = qnum(ctx ? 'Recette totale :' : 'Somme :', res, ctx ? 'F CFA' : null);
          sol = [
            'Pose l\'addition en colonnes en alignant les unités sous les unités, les dizaines sous les dizaines, etc.',
            'Additionne colonne par colonne en commençant par les unités, sans oublier les retenues : $' + n(a) + ' + ' + n(b) + ' + ' + n(c) + ' = ' + n(res) + '$.',
            'Contrôle avec un ordre de grandeur (arrondis au millier) : $' + n(arrondiMille(a)) + ' + ' + n(arrondiMille(b)) + ' + ' + n(arrondiMille(c)) + ' = ' + n(arrondiMille(a) + arrondiMille(b) + arrondiMille(c)) + '$, ce qui est proche du résultat.',
            ctx ? 'La recette totale est de ' + cfa(res) + '.' : 'Résultat : ' + m(res) + '.'
          ];
        } else {
          var ctx2 = rng.bool();
          a = rng.int(2000, 19999) * 50; b = rng.int(200, Math.floor(a / 50) - 100) * 50;
          if (!ctx2) { a = rng.int(100000, 999999); b = rng.int(10000, a - 1000); }
          res = a - b;
          enonce = ctx2
            ? 'Une coopérative de femmes de ' + rng.pick(VILLES) + ' disposait de ' + cfa(a) + '. Elle a dépensé ' + cfa(b) + ' pour acheter des semences d\'arachide.<br>Calculer la somme qui lui reste.'
            : 'Calculer : $' + n(a) + ' - ' + n(b) + '$.';
          q = qnum(ctx2 ? 'Somme restante :' : 'Différence :', res, ctx2 ? 'F CFA' : null);
          sol = [
            'Pose la soustraction en colonnes, le plus grand nombre en haut, en alignant les unités.',
            'Soustrais colonne par colonne en commençant par les unités ; quand le chiffre du haut est trop petit, ajoute une dizaine en haut et une retenue en bas : $' + n(a) + ' - ' + n(b) + ' = ' + n(res) + '$.',
            'Preuve : $' + n(res) + ' + ' + n(b) + ' = ' + n(a) + '$.',
            ctx2 ? 'Il reste ' + cfa(res) + ' à la coopérative.' : 'Résultat : ' + m(res) + '.'
          ];
        }
        return { enonce: enonce, questions: [q], indices: ['Aligne bien les chiffres de même rang.', 'Vérifie ton résultat avec un ordre de grandeur ou une preuve.'], solution: sol };
      }
      if (niveau === 2) {
        var cas = rng.int(0, 2), titreQ;
        if (cas === 0) { a = rng.int(102, 989); b = rng.int(12, 98); enonce = 'Calculer : $' + n(a) + ' \\times ' + n(b) + '$.'; titreQ = 'Produit :'; }
        else if (cas === 1) {
          a = rng.int(60, 120) * 250; b = rng.int(12, 60);
          enonce = 'Un grossiste de ' + rng.pick(['Touba', 'Kaolack', 'Diourbel', 'Thiès']) + ' vend ' + m(b) + ' sacs de sucre de 50 kg à ' + cfa(a) + ' le sac.<br>Calculer le montant de la vente.';
          titreQ = 'Montant :';
        } else {
          a = rng.int(8, 30) * 25; b = rng.int(120, 480);
          enonce = 'Une école de ' + rng.pick(VILLES) + ' achète ' + m(b) + ' cahiers à ' + cfa(a) + ' l\'un.<br>Calculer la dépense.';
          titreQ = 'Dépense :';
        }
        res = a * b;
        return {
          enonce: enonce,
          questions: [qnum(titreQ, res, cas ? 'F CFA' : null)],
          indices: [
            cas ? 'Le prix total s\'obtient en multipliant le prix d\'un objet par le nombre d\'objets.' : 'Décompose le multiplicateur : unités, dizaines, centaines.',
            'Calcule les produits partiels puis additionne-les.'
          ],
          solution: [
            cas ? 'Le prix total est égal au prix d\'un objet multiplié par le nombre d\'objets : $' + n(a) + ' \\times ' + n(b) + '$.' : 'On décompose ' + m(b) + ' selon ses chiffres.',
            'Produits partiels : ' + produitsPartiels(a, b) + '.',
            'Ordre de grandeur : $' + n(a) + ' \\times ' + n(b) + '$ est proche de $' + n(Math.round(a / pw(String(a).length - 1)) * pw(String(a).length - 1)) + ' \\times ' + n(Math.round(b / pw(String(b).length - 1)) * pw(String(b).length - 1)) + '$.',
            cas ? 'Le montant est de ' + cfa(res) + '.' : 'Résultat : ' + m(res) + '.'
          ]
        };
      }
      // niveau 3 : nombre manquant
      var forme = rng.int(0, 4), x;
      if (forme === 0) {
        b = rng.int(30, 150) * 1000; a = rng.int(5, Math.floor(b / 250) - 4) * 250; x = b - a;
        enonce = p.nom + ' veut acheter un vélo qui coûte ' + cfa(b) + '. ' + p.Il + ' a déjà économisé ' + cfa(a) + '.<br>Calculer la somme qui lui manque.';
        sol = ['On cherche le nombre qui, ajouté à ' + m(a) + ', donne ' + m(b) + ' : $\\ldots + ' + n(a) + ' = ' + n(b) + '$.', 'C\'est la différence : $' + n(b) + ' - ' + n(a) + ' = ' + n(x) + '$.', 'Vérification : $' + n(x) + ' + ' + n(a) + ' = ' + n(b) + '$. Il lui manque ' + cfa(x) + '.'];
        q = qnum('Somme manquante :', x, 'F CFA');
      } else if (forme === 1) {
        a = rng.int(1000, 9999); b = rng.int(10000, 99999); x = b - a;
        enonce = 'Trouver le nombre manquant : $$\\ldots + ' + n(a) + ' = ' + n(b) + '$$';
        sol = ['Le nombre manquant ajouté à ' + m(a) + ' donne ' + m(b) + ' : c\'est la différence $' + n(b) + ' - ' + n(a) + ' = ' + n(x) + '$.', 'Vérification : $' + n(x) + ' + ' + n(a) + ' = ' + n(b) + '$.'];
        q = qnum('Nombre manquant :', x);
      } else if (forme === 2) {
        a = rng.int(10000, 99999); b = rng.int(1000, a - 1000); x = a - b;
        enonce = 'Trouver le nombre manquant : $$' + n(a) + ' - \\ldots = ' + n(b) + '$$';
        sol = ['On enlève un nombre à ' + m(a) + ' et il reste ' + m(b) + ' : le nombre enlevé est $' + n(a) + ' - ' + n(b) + ' = ' + n(x) + '$.', 'Vérification : $' + n(a) + ' - ' + n(x) + ' = ' + n(b) + '$.'];
        q = qnum('Nombre manquant :', x);
      } else if (forme === 3) {
        a = rng.int(1000, 9999); b = rng.int(1000, 9999); x = a + b;
        enonce = 'Trouver le nombre manquant : $$\\ldots - ' + n(a) + ' = ' + n(b) + '$$';
        sol = ['Si on enlève ' + m(a) + ' au nombre cherché, il reste ' + m(b) + ' : le nombre cherché est la somme $' + n(b) + ' + ' + n(a) + ' = ' + n(x) + '$.', 'Vérification : $' + n(x) + ' - ' + n(a) + ' = ' + n(b) + '$.'];
        q = qnum('Nombre manquant :', x);
      } else {
        a = rng.int(6, 48); x = rng.int(25, 999); b = a * x;
        enonce = 'Trouver le nombre manquant : $$\\ldots \\times ' + n(a) + ' = ' + n(b) + '$$';
        sol = ['On cherche le nombre qui, multiplié par ' + m(a) + ', donne ' + m(b) + ' : c\'est le quotient $' + n(b) + ' \\div ' + n(a) + ' = ' + n(x) + '$.', 'Vérification : $' + n(x) + ' \\times ' + n(a) + ' = ' + n(b) + '$.'];
        q = qnum('Nombre manquant :', x);
      }
      return { enonce: enonce, questions: [q], indices: ['L\'addition et la soustraction sont des opérations « contraires », comme la multiplication et la division.', 'Vérifie en remplaçant les points par ta réponse.'], solution: sol };
    }
  });

  /* ---------- 3. Division euclidienne ---------- */
  EM.gen.register({
    id: 'cm2-division-euclidienne',
    titre: 'Division euclidienne : quotient et reste',
    chapitres: ['cm2-operations', '6e-entiers', 'cm2-problemes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, q, r;
      if (niveau === 1) {
        b = rng.bool() ? rng.int(3, 9) : rng.int(12, 45);
        a = rng.int(Math.max(100, b * 12), 9999);
        q = Math.floor(a / b); r = a % b;
        return {
          enonce: 'Effectuer la division euclidienne de ' + m(a) + ' par ' + m(b) + '. Donner le quotient et le reste.',
          questions: [qnum('Quotient :', q), qnum('Reste :', r)],
          indices: ['Cherche combien de fois ' + m(b) + ' est contenu dans ' + m(a) + '.', 'Le reste doit toujours être plus petit que le diviseur ' + m(b) + '.'],
          solution: [
            'On cherche $q$ et $r$ tels que $' + n(a) + ' = ' + n(b) + ' \\times q + r$ avec $r < ' + n(b) + '$.',
            '$' + n(b) + ' \\times ' + n(q) + ' = ' + n(b * q) + '$ et $' + n(b) + ' \\times ' + n(q + 1) + ' = ' + n(b * (q + 1)) + '$ : on a $' + n(b * q) + ' \\leq ' + n(a) + ' < ' + n(b * (q + 1)) + '$, donc le quotient est ' + m(q) + '.',
            'Le reste est $' + n(a) + ' - ' + n(b * q) + ' = ' + n(r) + '$ (bien inférieur à ' + m(b) + ').',
            'Vérification : $' + n(b) + ' \\times ' + n(q) + ' + ' + n(r) + ' = ' + n(a) + '$.'
          ]
        };
      }
      var cas = rng.int(0, 2), p = personne(rng);
      if (cas === 0) {
        b = rng.pick([24, 30, 36, 40, 48, 50, 60]); a = rng.int(b * 8, 2000);
        if (a % b === 0) a += rng.int(1, b - 1);
        q = Math.floor(a / b); r = a % b;
        return {
          enonce: p.nom + ', commerçant' + p.e + ' à Ziguinchor, a ' + m(a) + ' mangues. ' + p.Il + ' les range dans des cageots de ' + m(b) + ' mangues.<br>Calculer le nombre de cageots remplis et le nombre de mangues qui restent.',
          questions: [qnum('Cageots remplis :', q), qnum('Mangues restantes :', r)],
          indices: ['C\'est une division euclidienne : ' + m(a) + ' divisé par ' + m(b) + '.', 'Le quotient donne les cageots pleins, le reste les mangues en trop.'],
          solution: [
            'On effectue la division euclidienne de ' + m(a) + ' par ' + m(b) + '.',
            '$' + n(a) + ' = ' + n(b) + ' \\times ' + n(q) + ' + ' + n(r) + '$ avec $' + n(r) + ' < ' + n(b) + '$.',
            p.Il + ' remplit donc ' + m(q) + ' cageots et il reste ' + m(r) + ' mangue' + (r > 1 ? 's' : '') + '.'
          ]
        };
      }
      if (cas === 1) {
        b = rng.pick([35, 40, 45, 50, 55, 60]); a = rng.int(130, 600);
        if (rng.bool(0.85) && a % b === 0) a += rng.int(1, b - 1);
        q = Math.floor(a / b); r = a % b;
        var nb = r ? q + 1 : q;
        return {
          enonce: 'Une école de ' + rng.pick(['Thiès', 'Kaolack', 'Louga', 'Mbour', 'Fatick']) + ' organise une sortie pour ' + m(a) + ' personnes (élèves et accompagnateurs). Chaque car peut transporter ' + m(b) + ' personnes.<br>Calculer le nombre de cars nécessaires pour transporter tout le monde.',
          questions: [qnum('Nombre de cars :', nb)],
          indices: ['Divise ' + m(a) + ' par ' + m(b) + '.', 'Attention : s\'il reste des personnes, il faut un car de plus !'],
          solution: [
            'Division euclidienne : $' + n(a) + ' = ' + n(b) + ' \\times ' + n(q) + ' + ' + n(r) + '$.',
            r ? m(q) + ' cars remplis transportent $' + n(b * q) + '$ personnes ; il reste ' + m(r) + ' personne' + (r > 1 ? 's' : '') + ' à transporter, donc il faut un car de plus.' : 'Le reste est nul : ' + m(q) + ' cars sont exactement remplis.',
            'Il faut ' + m(nb) + ' cars.'
          ]
        };
      }
      a = rng.int(30, 400);
      if (a % 7 === 0) a += rng.int(1, 6);
      q = Math.floor(a / 7); r = a % 7;
      return {
        enonce: 'La construction d\'une nouvelle école à ' + rng.pick(['Kaffrine', 'Kolda', 'Matam', 'Sédhiou', 'Fatick']) + ' a duré ' + m(a) + ' jours.<br>Exprimer cette durée en semaines et jours.',
        questions: [qnum('Semaines :', q), qnum('Jours :', r)],
        indices: ['Une semaine compte 7 jours.', 'Effectue la division euclidienne de ' + m(a) + ' par 7.'],
        solution: [
          'Une semaine dure 7 jours : on divise ' + m(a) + ' par 7.',
          '$' + n(a) + ' = 7 \\times ' + n(q) + ' + ' + n(r) + '$ avec $' + n(r) + ' < 7$.',
          'La construction a duré ' + m(q) + ' semaines et ' + m(r) + ' jour' + (r > 1 ? 's' : '') + '.'
        ]
      };
    }
  });

  /* ---------- 4. Fraction d'une quantité ---------- */
  /** fraction irréductible a/b < 1 ; avecUn = false : numérateur au moins 2 */
  function fracSimple(rng, avecUn) {
    var b = rng.pick(avecUn === false ? [3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6, 8, 10]), a;
    do { a = rng.int(avecUn === false ? 2 : 1, b - 1); } while (EM.ar.gcd(a, b) !== 1);
    return [a, b];
  }
  EM.gen.register({
    id: 'cm2-fraction-quantite',
    titre: 'Calculer une fraction d\'une quantité',
    chapitres: ['cm2-fractions', '6e-fractions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var p = personne(rng), ab = fracSimple(rng, false), a = ab[0], b = ab[1], Q, part, enonce, qs, sol;
      if (niveau === 1) {
        var cas = rng.int(0, 2);
        if (cas === 0) {
          Q = b * rng.int(10, 120) * 50; part = Q / b * a;
          enonce = p.nom + ' a ' + cfa(Q) + '. ' + p.Il + ' dépense les $' + fr(a, b) + '$ de cette somme pour acheter des fournitures scolaires.<br>Calculer la somme dépensée, puis la somme qui lui reste.';
          qs = [qnum('Somme dépensée :', part, 'F CFA'), qnum('Somme restante :', Q - part, 'F CFA')];
        } else if (cas === 1) {
          Q = b * rng.int(3, 8); part = Q / b * a;
          enonce = 'Une classe de CM2 de ' + rng.pick(VILLES) + ' compte ' + m(Q) + ' élèves. Les $' + fr(a, b) + '$ des élèves sont des filles.<br>Calculer le nombre de filles, puis le nombre de garçons.';
          qs = [qnum('Filles :', part), qnum('Garçons :', Q - part)];
        } else {
          Q = b * rng.int(20, 300) * 10; part = Q / b * a;
          enonce = 'Le champ ' + de(p.nom) + ' a une aire de ' + u(Q, 'm²') + '. ' + p.Il + ' sème du mil sur les $' + fr(a, b) + '$ du champ et de l\'arachide sur le reste.<br>Calculer l\'aire semée en mil, puis l\'aire semée en arachide.';
          qs = [qnum('Aire en mil (m²) :', part), qnum('Aire en arachide (m²) :', Q - part)];
        }
        sol = [
          'Pour calculer les $' + fr(a, b) + '$ d\'une quantité, on la divise par ' + m(b) + ' puis on multiplie le résultat par ' + m(a) + '.',
          'Une part : $' + n(Q) + ' \\div ' + n(b) + ' = ' + n(Q / b) + '$ ; ' + m(a) + ' parts : $' + n(Q / b) + ' \\times ' + n(a) + ' = ' + n(part) + '$.',
          'Le reste : $' + n(Q) + ' - ' + n(part) + ' = ' + n(Q - part) + '$. (On peut aussi calculer les $' + fr(b - a, b) + '$ de ' + m(Q) + '.)'
        ];
        return { enonce: enonce, questions: qs, indices: ['Calcule d\'abord une part : divise par le dénominateur ' + m(b) + '.', 'Multiplie ensuite par le numérateur ' + m(a) + '.'], solution: sol };
      }
      if (rng.bool()) {
        var X = a * rng.int(20, 300) * 5; Q = X / a * b;
        enonce = 'Les $' + fr(a, b) + '$ de la récolte d\'arachide ' + de(p.nom) + ' pèsent ' + u(X, 'kg') + '.<br>Calculer la masse totale de la récolte.';
        return {
          enonce: enonce,
          questions: [qnum('Masse totale (kg) :', Q)],
          indices: ['Les $' + fr(a, b) + '$ correspondent à ' + m(a) + ' part' + (a > 1 ? 's' : '') + ' sur ' + m(b) + '. Combien pèse une part ?', 'La récolte entière contient ' + m(b) + ' parts.'],
          solution: [
            'La récolte est partagée en ' + m(b) + ' parts égales ; ' + m(a) + ' part' + (a > 1 ? 's pèsent' : ' pèse') + ' ' + u(X, 'kg') + '.',
            'Une part pèse $' + n(X) + ' \\div ' + n(a) + ' = ' + n(X / a) + '$ kg.',
            'La récolte entière pèse $' + n(X / a) + ' \\times ' + n(b) + ' = ' + n(Q) + '$ kg.'
          ]
        };
      }
      // fractions successives
      var cd = fracSimple(rng, false), c = cd[0], d = cd[1];
      Q = b * d * rng.int(5, 60) * 100;
      var don1 = Q / b * a, reste1 = Q - don1, don2 = reste1 / d * c, reste2 = reste1 - don2;
      return {
        enonce: p.nom + ' a ' + cfa(Q) + '. ' + p.Il + ' donne les $' + fr(a, b) + '$ de cette somme à sa mère pour le marché, puis les $' + fr(c, d) + '$ de ce qui lui reste à son petit frère.<br>Calculer ce qui reste après le premier don, puis ce qui reste à la fin.',
        questions: [qnum('Reste après le 1er don :', reste1, 'F CFA'), qnum('Reste final :', reste2, 'F CFA')],
        indices: ['Le deuxième don se calcule sur le <b>reste</b>, pas sur la somme de départ.', 'Divise par le dénominateur puis multiplie par le numérateur.'],
        solution: [
          'Premier don : $' + n(Q) + ' \\div ' + n(b) + ' \\times ' + n(a) + ' = ' + n(don1) + '$ F CFA.',
          'Reste : $' + n(Q) + ' - ' + n(don1) + ' = ' + n(reste1) + '$ F CFA.',
          'Deuxième don (calculé sur le reste) : $' + n(reste1) + ' \\div ' + n(d) + ' \\times ' + n(c) + ' = ' + n(don2) + '$ F CFA.',
          'Il reste finalement $' + n(reste1) + ' - ' + n(don2) + ' = ' + n(reste2) + '$ F CFA.'
        ]
      };
    }
  });

  /* ---------- 5. Pourcentages ---------- */
  EM.gen.register({
    id: 'cm2-pourcentages',
    titre: 'Pourcentages : appliquer, réduire, augmenter, intérêt',
    chapitres: ['cm2-proportionnalite', '6e-proportionnalite'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var p, Q, res, enonce, qs, sol, cas;
      if (niveau === 1) {
        p = rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
        cas = rng.int(0, 2);
        Q = 100 * rng.int(2, 12); res = Q * p / 100;
        if (cas === 0) enonce = 'Une école de ' + rng.pick(VILLES) + ' compte ' + m(Q) + ' élèves. ' + m(p) + ' % de ces élèves sont des filles.<br>Calculer le nombre de filles.';
        else if (cas === 1) enonce = 'Un village du bassin arachidier compte ' + m(Q) + ' habitants. ' + m(p) + ' % des habitants cultivent l\'arachide.<br>Calculer le nombre d\'habitants qui cultivent l\'arachide.';
        else enonce = 'Calculer ' + m(p) + ' % de ' + m(Q) + '.';
        return {
          enonce: enonce,
          questions: [qnum(cas === 2 ? 'Résultat :' : 'Nombre :', res)],
          indices: ['$' + n(p) + '\\,\\%$ signifie « ' + n(p) + ' pour 100 ».', 'Multiplie par ' + m(p) + ' puis divise par 100.'],
          solution: [
            'Prendre $' + n(p) + '\\,\\%$ d\'une quantité, c\'est la multiplier par $' + fr(p, 100) + '$.',
            '$' + n(Q) + ' \\times ' + fr(p, 100) + ' = ' + n(Q) + ' \\times ' + n(p) + ' \\div 100 = ' + n(Q * p) + ' \\div 100 = ' + n(res) + '$.',
            'Réponse : ' + m(res) + '.'
          ]
        };
      }
      if (niveau === 2) {
        p = rng.pick([5, 10, 15, 20, 25, 30, 40]);
        var augm = rng.bool(0.35), obj;
        if (augm) {
          obj = rng.pick([['le sac de riz de 25 kg', 100, 140], ['le litre d\'huile', 10, 16], ['le sac de ciment', 30, 50]]);
          Q = rng.int(obj[1], obj[2]) * 100; res = Q * p / 100;
          enonce = 'Le prix de ' + obj[0] + ' était de ' + cfa(Q) + '. Il augmente de ' + m(p) + ' %.<br>Calculer le montant de l\'augmentation, puis le nouveau prix.';
          qs = [qnum('Augmentation :', res, 'F CFA'), qnum('Nouveau prix :', Q + res, 'F CFA')];
          sol = ['Montant de l\'augmentation : $' + n(Q) + ' \\times ' + n(p) + ' \\div 100 = ' + n(res) + '$ F CFA.', 'Nouveau prix : $' + n(Q) + ' + ' + n(res) + ' = ' + n(Q + res) + '$ F CFA.'];
        } else {
          obj = rng.pick([['un grand boubou', 'Pendant la Tabaski, un tailleur de Kaolack', 80, 400], ['une paire de chaussures', 'Un commerçant du marché Tilène', 50, 250], ['un poste radio', 'Une boutique de Thiès', 100, 350], ['un vélo', 'Un vendeur de Mbour', 300, 900]]);
          Q = rng.int(obj[2], obj[3]) * 100; res = Q * p / 100;
          enonce = obj[1] + ' accorde une remise de ' + m(p) + ' % sur ' + obj[0] + ' dont le prix affiché est de ' + cfa(Q) + '.<br>Calculer le montant de la remise, puis le prix à payer.';
          qs = [qnum('Remise :', res, 'F CFA'), qnum('Prix à payer :', Q - res, 'F CFA')];
          sol = ['Montant de la remise : $' + n(Q) + ' \\times ' + n(p) + ' \\div 100 = ' + n(res) + '$ F CFA.', 'Prix à payer : $' + n(Q) + ' - ' + n(res) + ' = ' + n(Q - res) + '$ F CFA.'];
        }
        sol.push('Autre méthode : on paie $' + n(augm ? 100 + p : 100 - p) + '\\,\\%$ du prix de départ, soit $' + n(Q) + ' \\times ' + n(augm ? 100 + p : 100 - p) + ' \\div 100 = ' + n(augm ? Q + res : Q - res) + '$ F CFA.');
        return { enonce: enonce, questions: qs, indices: ['Calcule d\'abord ' + m(p) + ' % du prix.', augm ? 'Une augmentation s\'ajoute au prix de départ.' : 'Une remise se retranche du prix affiché.'], solution: sol };
      }
      if (rng.bool()) {
        var tot = rng.pick([20, 25, 40, 50, 60, 80, 120, 150, 200, 250, 400]), pc, A, g = 0;
        do { pc = rng.int(30, 98); A = tot * pc / 100; g++; } while (!EM.ar.isInt(A) && g < 200);
        if (!EM.ar.isInt(A)) { pc = 50; A = tot / 2; }
        return {
          enonce: 'Au CFEE, une école de ' + rng.pick(VILLES) + ' a présenté ' + m(tot) + ' candidats ; ' + m(A) + ' ont été admis.<br>Calculer le pourcentage de réussite de cette école.',
          questions: [qnum('Pourcentage :', pc, '%')],
          indices: ['Le pourcentage est le nombre d\'admis pour 100 candidats.', 'Calcule $' + n(A) + ' \\div ' + n(tot) + ' \\times 100$.'],
          solution: [
            'Sur ' + m(tot) + ' candidats, ' + m(A) + ' sont admis. Pour 100 candidats, il y aurait $' + n(A) + ' \\times 100 \\div ' + n(tot) + '$ admis.',
            '$' + n(A) + ' \\times 100 \\div ' + n(tot) + ' = ' + n(A * 100) + ' \\div ' + n(tot) + ' = ' + n(pc) + '$.',
            'Le pourcentage de réussite est de $' + n(pc) + '\\,\\%$.'
          ]
        };
      }
      var C = rng.int(10, 200) * 10000, t = rng.pick([3, 4, 5, 6, 8, 10]), ans = rng.int(2, 5), I1 = C * t / 100;
      return {
        enonce: 'Un groupement de femmes de ' + rng.pick(['Fatick', 'Kaffrine', 'Sédhiou', 'Matam', 'Louga']) + ' place ' + cfa(C) + ' à la banque, au taux annuel de ' + m(t) + ' % (intérêt simple).<br>Calculer l\'intérêt rapporté en 1 an, puis en ' + m(ans) + ' ans.',
        questions: [qnum('Intérêt en 1 an :', I1, 'F CFA'), qnum('Intérêt en ' + ans + ' ans :', I1 * ans, 'F CFA')],
        indices: ['Au taux de ' + m(t) + ' %, 100 F CFA rapportent ' + m(t) + ' F CFA en un an.', 'En intérêt simple, l\'intérêt est le même chaque année.'],
        solution: [
          'Intérêt d\'un an : $' + n(C) + ' \\times ' + n(t) + ' \\div 100 = ' + n(I1) + '$ F CFA.',
          'En ' + m(ans) + ' ans : $' + n(I1) + ' \\times ' + n(ans) + ' = ' + n(I1 * ans) + '$ F CFA.'
        ]
      };
    }
  });

  /* ---------- 6. Proportionnalité ---------- */
  // prix unitaires plausibles (en F CFA) : min, max, pas
  var ARTICLES = [
    { pl: 'kilogrammes de riz', court: 'kg de riz', min: 350, max: 550, pas: 25 },
    { pl: 'kilogrammes de sucre', court: 'kg de sucre', min: 600, max: 800, pas: 25 },
    { pl: 'mètres de tissu wax', court: 'm de tissu', min: 1500, max: 3500, pas: 250 },
    { pl: 'litres d\'huile', court: 'L d\'huile', min: 1100, max: 1600, pas: 50 },
    { pl: 'kilogrammes de poisson', court: 'kg de poisson', min: 1000, max: 2500, pas: 100 },
    { pl: 'cahiers', court: 'cahiers', min: 150, max: 500, pas: 25 }
  ];
  var SCENARIOS = [
    { t1: 'Avec {x} kg d\'arachide, une huilerie artisanale de Kaolack obtient {y} litres d\'huile.', q: 'Calculer la quantité d\'huile obtenue avec {x2} kg d\'arachide.', c: F(2, 5), lab: 'Huile (L) :', mul: 5, lo: 2, hi: 20 },
    { t1: 'Une voiture consomme {y} litres d\'essence pour parcourir {x} km.', q: 'Calculer sa consommation pour {x2} km.', c: F(3, 50), lab: 'Essence (L) :', mul: 50, lo: 2, hi: 12 },
    { t1: 'Pour préparer le riz de {x} personnes, il faut {y} tasses de riz.', q: 'Calculer le nombre de tasses pour {x2} personnes.', c: F(3, 2), lab: 'Tasses :', mul: 2, lo: 2, hi: 15 },
    { t1: 'Un robinet remplit un fût de {y} litres en {x} minutes.', q: 'Calculer le volume d\'eau versé en {x2} minutes.', c: F(15, 2), lab: 'Volume (L) :', mul: 2, lo: 2, hi: 12 },
    { t1: 'Un tailleur utilise {y} mètres de tissu pour coudre {x} chemises.', q: 'Calculer la longueur de tissu nécessaire pour {x2} chemises.', c: F(5, 2), lab: 'Tissu (m) :', mul: 2, lo: 2, hi: 12 }
  ];
  function remplir(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return m(o[k]); }); }

  EM.gen.register({
    id: 'cm2-proportionnalite',
    titre: 'Proportionnalité : règle de trois et tableaux',
    chapitres: ['cm2-proportionnalite', 'cm2-problemes', '6e-proportionnalite'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var art = rng.pick(ARTICLES);
        var pu = rng.int(art.min / art.pas, art.max / art.pas) * art.pas;
        var q1 = rng.int(2, 12), q2 = rng.intExcept(2, 25, [q1]), P1 = q1 * pu;
        return {
          enonce: m(q1) + ' ' + art.pl + ' coûtent ' + cfa(P1) + '.<br>Calculer le prix de ' + m(q2) + ' ' + art.pl + '.',
          questions: [qnum('Prix :', q2 * pu, 'F CFA')],
          indices: ['Le prix est proportionnel à la quantité achetée.', 'Calcule d\'abord le prix d\'une seule unité (passage par l\'unité).'],
          solution: [
            'Le prix est proportionnel à la quantité : on passe par l\'unité.',
            'Prix d\'une unité : $' + n(P1) + ' \\div ' + n(q1) + ' = ' + n(pu) + '$ F CFA.',
            'Prix de ' + m(q2) + ' ' + art.court + ' : $' + n(pu) + ' \\times ' + n(q2) + ' = ' + n(q2 * pu) + '$ F CFA.'
          ]
        };
      }
      if (rng.bool(0.6)) {
        var sc = rng.pick(SCENARIOS), x1 = sc.mul * rng.int(sc.lo, sc.hi), x2;
        var gx = 0;
        do { x2 = sc.mul * rng.int(sc.lo, sc.hi); gx++; } while ((x2 === x1 || x2 % x1 === 0 || x1 % x2 === 0) && gx < 200);
        var y1 = sc.c.mul(x1).value(), y2 = sc.c.mul(x2).value();
        return {
          enonce: remplir(sc.t1, { x: x1, y: y1 }) + '<br>' + remplir(sc.q, { x2: x2 }),
          questions: [qnum(sc.lab, y2)],
          indices: ['Les deux grandeurs sont proportionnelles.', 'Règle de trois : multiplie ' + m(y1) + ' par ' + m(x2) + ', puis divise par ' + m(x1) + '.'],
          solution: [
            'Les deux grandeurs sont proportionnelles. On utilise la règle de trois.',
            'Résultat $= ' + n(y1) + ' \\times ' + n(x2) + ' \\div ' + n(x1) + ' = ' + n(y1 * x2) + ' \\div ' + n(x1) + ' = ' + n(y2) + '$.',
            'Vérification : le coefficient de proportionnalité est $' + n(y1) + ' \\div ' + n(x1) + ' = ' + n(sc.c.value()) + '$ et $' + n(x2) + ' \\times ' + n(sc.c.value()) + ' = ' + n(y2) + '$.'
          ]
        };
      }
      // tableau : proportionnel ou non ?
      var k = rng.pick([125, 150, 175, 200, 250]);
      var xs = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 3).sort(function (a, b) { return a - b; });
      var ys = xs.map(function (x) { return R(x * k); });
      var prop = rng.bool();
      if (!prop) { var j = rng.int(0, 2); ys[j] = R(ys[j] + rng.pick([-50, -25, 25, 50, 100])); }
      var tab = '$$\\begin{array}{|l|c|c|c|}\\hline \\text{Nombre de pains} & ' + xs.map(n).join(' & ') + ' \\\\ \\hline \\text{Prix (F CFA)} & ' + ys.map(n).join(' & ') + ' \\\\ \\hline \\end{array}$$';
      var ratios = xs.map(function (x, i) {
        var r = ys[i] / x, ex = R(r, 6) === R(r, 2);
        return '$' + n(ys[i]) + ' \\div ' + n(x) + (ex ? ' = ' + n(R(r, 2)) : ' \\approx ' + n(R(r, 2))) + '$';
      });
      return {
        enonce: 'Une boulangerie de ' + rng.pick(VILLES) + ' affiche le tableau suivant :' + tab + 'Ce tableau est-il un tableau de proportionnalité ?',
        questions: [qcm(rng, prop ? 'Oui' : 'Non', [prop ? 'Non' : 'Oui'], 'Proportionnalité :')],
        indices: ['Divise chaque nombre de la deuxième ligne par le nombre correspondant de la première ligne.', 'Le tableau est de proportionnalité si on trouve toujours le même quotient.'],
        solution: [
          'On calcule les quotients : ' + ratios.join(' ; ') + '.',
          prop ? 'Les quotients sont tous égaux à ' + m(k) + ' : c\'est un tableau de proportionnalité, de coefficient ' + m(k) + '.' : 'Les quotients ne sont pas tous égaux : ce n\'est pas un tableau de proportionnalité.'
        ]
      };
    }
  });

  /* ---------- 7. Échelles ---------- */
  EM.gen.register({
    id: 'cm2-echelles',
    titre: 'Échelles : plans et cartes',
    chapitres: ['cm2-proportionnalite', '6e-proportionnalite'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var E, d, reel, g = 0;
      var echTex = function (e) { return '$\\dfrac{1}{' + n(e) + '}$'; };
      if (niveau === 1) {
        var piece = rng.pick([['la longueur', 'du salon', 4, 9], ['la largeur', 'de la chambre', 3, 5], ['la longueur', 'de la cour', 8, 20], ['la longueur', 'de la boutique', 4, 8]]);
        do {
          E = rng.pick([50, 100, 200]);
          reel = rng.int(piece[2] * 2, piece[3] * 2) / 2;
          d = R(reel * 100 / E);
          g++;
        } while (R(d, 1) !== d && g < 100);
        var p = personne(rng);
        return {
          enonce: 'Sur le plan de la maison ' + de(p.nom) + ' à ' + rng.pick(['Rufisque', 'Mbour', 'Thiès', 'Saint-Louis']) + ', dessiné à l\'échelle ' + echTex(E) + ', ' + piece[0] + ' ' + piece[1] + ' mesure ' + u(d, 'cm') + '.<br>Calculer ' + piece[0] + ' réelle ' + piece[1] + ', en mètres.',
          questions: [qnum('Mesure réelle (m) :', reel, 'm')],
          indices: ['L\'échelle ' + echTex(E) + ' signifie que 1 cm sur le plan représente ' + m(E) + ' cm en réalité.', 'Calcule la longueur réelle en cm, puis convertis-la en m.'],
          solution: [
            'Échelle ' + echTex(E) + ' : 1 cm sur le plan représente ' + u(E, 'cm') + ' dans la réalité.',
            'Longueur réelle : $' + n(d) + ' \\times ' + n(E) + ' = ' + n(d * E) + '$ cm.',
            'Conversion : $' + n(d * E) + '$ cm $= ' + n(reel) + '$ m (on divise par 100).'
          ]
        };
      }
      var ECH = [25000, 50000, 100000, 200000, 250000, 500000, 1000000];
      if (niveau === 2) {
        do {
          E = rng.pick(ECH);
          d = rng.int(15, 150) / 10;
          reel = R(d * E / 100000);
          g++;
        } while ((R(reel, 2) !== reel || reel < 1) && g < 200);
        return {
          enonce: 'Sur une carte de la région de ' + rng.pick(['Thiès', 'Kaolack', 'Tambacounda', 'Saint-Louis', 'Kolda', 'Louga']) + ' à l\'échelle ' + echTex(E) + ', deux villages sont distants de ' + u(d, 'cm') + '.<br>Calculer la distance réelle entre ces deux villages, en kilomètres.',
          questions: [qnum('Distance réelle (km) :', reel, 'km')],
          indices: ['1 cm sur la carte représente ' + m(E) + ' cm en réalité.', '1 km $= 100\\,000$ cm.'],
          solution: [
            'Distance réelle en cm : $' + n(d) + ' \\times ' + n(E) + ' = ' + n(d * E) + '$ cm.',
            'Comme 1 km $= 100\\,000$ cm, on divise par $100\\,000$ : $' + n(d * E) + '$ cm $= ' + n(reel) + '$ km.'
          ]
        };
      }
      if (rng.bool()) {
        do {
          E = rng.pick(ECH);
          reel = rng.int(2, 120);
          d = R(reel * 100000 / E);
          g++;
        } while ((R(d, 1) !== d || d < 1 || d > 30) && g < 300);
        return {
          enonce: 'Deux localités sont distantes de ' + u(reel, 'km') + ' à vol d\'oiseau. On veut les placer sur une carte à l\'échelle ' + echTex(E) + '.<br>Calculer la distance qui les sépare sur la carte, en centimètres.',
          questions: [qnum('Distance sur la carte (cm) :', d, 'cm')],
          indices: ['Convertis d\'abord la distance réelle en cm.', 'Sur la carte, les longueurs sont ' + m(E) + ' fois plus petites.'],
          solution: [
            'Distance réelle en cm : $' + n(reel) + '$ km $= ' + n(reel * 100000) + '$ cm.',
            'Sur la carte : $' + n(reel * 100000) + ' \\div ' + n(E) + ' = ' + n(d) + '$ cm.'
          ]
        };
      }
      do {
        E = rng.pick(ECH);
        d = rng.int(2, 20);
        reel = R(d * E / 100000);
        g++;
      } while (!EM.ar.isInt(reel * 10) && g < 100);
      return {
        enonce: 'Sur une carte, ' + u(d, 'cm') + ' représentent ' + u(reel, 'km') + ' dans la réalité.<br>Déterminer l\'échelle de cette carte sous la forme $\\dfrac{1}{\\ldots}$.',
        questions: [qnum('Dénominateur de l\'échelle :', E)],
        indices: ['Exprime les deux distances dans la même unité (le cm).', 'L\'échelle est le quotient : distance sur la carte ÷ distance réelle.'],
        solution: [
          'Distance réelle : $' + n(reel) + '$ km $= ' + n(reel * 100000) + '$ cm.',
          '1 cm sur la carte représente $' + n(reel * 100000) + ' \\div ' + n(d) + ' = ' + n(E) + '$ cm.',
          'L\'échelle est ' + echTex(E) + '.'
        ],
        aide: 'Écris seulement le dénominateur (le nombre sous le 1).'
      };
    }
  });

  /* ---------- 8. Conversions d'unités ---------- */
  var GRANDEURS = {
    longueur: [['km', 3], ['hm', 2], ['dam', 1], ['m', 0], ['dm', -1], ['cm', -2], ['mm', -3]],
    masse: [['t', 6], ['q', 5], ['kg', 3], ['hg', 2], ['dag', 1], ['g', 0], ['dg', -1], ['cg', -2], ['mg', -3]],
    capacite: [['hL', 2], ['daL', 1], ['L', 0], ['dL', -1], ['cL', -2], ['mL', -3]],
    // aires et volumes : seulement des conversions usuelles (unités agraires, m², dm², cm², m³, L…)
    aire: [[['ha', 4], ['m²', 0]], [['a', 2], ['m²', 0]], [['ha', 4], ['a', 2]], [['m²', 0], ['dm²', -2]], [['dm²', -2], ['cm²', -4]],
      [['m²', 0], ['cm²', -4]], [['km²', 6], ['ha', 4]], [['ha', 4], ['ca', 0]], [['a', 2], ['ca', 0]]],
    volume: [[['m³', 0], ['dm³', -3]], [['dm³', -3], ['cm³', -6]], [['m³', 0], ['L', -3]], [['L', -3], ['cm³', -6]],
      [['hL', -1], ['L', -3]], [['cL', -5], ['cm³', -6]], [['L', -3], ['mL', -6]], [['m³', 0], ['hL', -1]]]
  };
  function choisirUnites(rng, g, maxEcart) {
    var U = GRANDEURS[g], a, b, guard = 0;
    if (g === 'aire' || g === 'volume') { var pr = rng.pick(U); return rng.bool() ? [pr[0], pr[1]] : [pr[1], pr[0]]; }
    do { a = rng.pick(U); b = rng.pick(U); guard++; } while ((a[1] === b[1] || Math.abs(a[1] - b[1]) > maxEcart) && guard < 300);
    return [a, b];
  }
  function explicationConversion(v, A, B, k, res, g) {
    var f = pw(Math.abs(k)), l = [];
    if (k > 0) l.push('$1$ ' + A + ' $= ' + n(f) + '$ ' + B + ' : pour passer des ' + A + ' aux ' + B + ', on multiplie par ' + m(f) + '.');
    else l.push('$1$ ' + B + ' $= ' + n(f) + '$ ' + A + ' : pour passer des ' + A + ' aux ' + B + ', on divise par ' + m(f) + '.');
    l.push('$' + n(v) + (k > 0 ? ' \\times ' : ' \\div ') + n(f) + ' = ' + n(res) + '$, donc ' + m(v) + ' ' + A + ' $=$ ' + m(res) + ' ' + B + '.');
    if (g === 'aire') l.push('Rappel : dans le tableau des aires, chaque unité occupe deux colonnes (1 m² = 100 dm²) ; 1 ha = 1 hm², 1 a = 1 dam², 1 ca = 1 m².');
    else if (g === 'volume') l.push('Rappel : dans le tableau des volumes, chaque unité occupe trois colonnes (1 m³ = 1 000 dm³) ; 1 dm³ = 1 L et 1 cm³ = 1 mL.');
    else l.push('Astuce : dans le tableau de conversion, écris ' + m(v) + ' en plaçant son chiffre des unités dans la colonne des ' + A + ' ; la virgule du résultat se place juste après la colonne des ' + B + '.');
    return l;
  }

  EM.gen.register({
    id: 'cm2-conversions',
    titre: 'Convertir des longueurs, masses, capacités, aires et volumes',
    chapitres: ['cm2-mesures', '6e-perimetres-aires', '6e-solides'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var g, AB, A, B, k, v, res, guard = 0;
      if (niveau === 2 && rng.bool(0.4)) {
        var paire = rng.pick([['km', 'm', 3], ['kg', 'g', 3], ['L', 'cL', 2], ['m', 'cm', 2], ['t', 'kg', 3], ['L', 'mL', 3], ['hL', 'L', 2]]);
        var x = rng.int(1, 20), y = rng.int(1, pw(paire[2]) - 1);
        res = x * pw(paire[2]) + y;
        return {
          enonce: 'Convertir ' + m(x) + ' ' + paire[0] + ' ' + m(y) + ' ' + paire[1] + ' en ' + paire[1] + '.',
          questions: [qnum(m(x) + ' ' + paire[0] + ' ' + m(y) + ' ' + paire[1] + ' $=$', res, paire[1])],
          indices: ['Convertis d\'abord ' + m(x) + ' ' + paire[0] + ' en ' + paire[1] + '.', 'Ajoute ensuite les ' + m(y) + ' ' + paire[1] + '.'],
          solution: [
            '$1$ ' + paire[0] + ' $= ' + n(pw(paire[2])) + '$ ' + paire[1] + ', donc ' + m(x) + ' ' + paire[0] + ' $= ' + n(x * pw(paire[2])) + '$ ' + paire[1] + '.',
            '$' + n(x * pw(paire[2])) + ' + ' + n(y) + ' = ' + n(res) + '$, donc ' + m(x) + ' ' + paire[0] + ' ' + m(y) + ' ' + paire[1] + ' $= ' + n(res) + '$ ' + paire[1] + '.'
          ],
          aide: 'Écris seulement le nombre.'
        };
      }
      do {
        if (niveau === 3) { g = rng.pick(['aire', 'aire', 'volume']); AB = choisirUnites(rng, g, g === 'aire' ? 4 : 3); }
        else { g = rng.pick(['longueur', 'masse', 'capacite']); AB = choisirUnites(rng, g, 3); }
        A = AB[0][0]; B = AB[1][0]; k = AB[0][1] - AB[1][1];
        if (niveau === 1) {
          if (k > 0) v = rng.int(2, 99);
          else v = rng.int(2, 99) * pw(-k);
        } else {
          var dec = rng.int(1, 2);
          v = rng.int(11, 9999) / pw(dec);
          if (niveau === 3 && rng.bool()) v = rng.int(2, 999);
        }
        res = R(v * pw(k), 8);
        guard++;
      } while ((res < 0.01 || res > 1e7 || R(res, 3) !== res || v === res) && guard < 300);
      return {
        enonce: 'Convertir ' + m(v) + ' ' + A + ' en ' + B + '.',
        questions: [qnum(m(v) + ' ' + A + ' $=$', res, B)],
        indices: [
          g === 'aire' ? 'Pour les aires, on multiplie ou on divise par 100 d\'une unité à la suivante.' : g === 'volume' ? 'Pour les volumes, on multiplie ou on divise par 1 000 d\'une unité à la suivante ; 1 dm³ = 1 L.' : 'D\'une unité à la suivante, on multiplie ou on divise par 10.',
          'Vers une unité plus petite, le nombre devient plus grand (on multiplie) ; vers une unité plus grande, il devient plus petit (on divise).'
        ],
        solution: explicationConversion(v, A, B, k, res, g),
        aide: 'Écris seulement le nombre.'
      };
    }
  });

  /* ---------- 9. Durées, horaires et vitesses ---------- */
  EM.gen.register({
    id: 'cm2-durees-vitesses',
    titre: 'Durées, horaires et vitesse moyenne',
    chapitres: ['cm2-mesures', 'cm2-problemes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var h, mi, tot, cas;
      if (niveau === 1) {
        cas = rng.int(0, 2);
        if (cas === 0) {
          h = rng.int(1, 5); mi = rng.int(1, 11) * 5; tot = 60 * h + mi;
          return {
            enonce: 'Convertir ' + hm(h, mi) + ' en minutes.',
            questions: [qnum(hm(h, mi) + ' $=$', tot, 'min')],
            indices: ['1 h = 60 min.'],
            solution: ['$' + n(h) + '$ h $= ' + n(h) + ' \\times 60 = ' + n(60 * h) + '$ min.', '$' + n(60 * h) + ' + ' + n(mi) + ' = ' + n(tot) + '$, donc ' + hm(h, mi) + ' = ' + u(tot, 'min') + '.'],
            aide: 'Écris seulement le nombre de minutes.'
          };
        }
        if (cas === 1) {
          tot = rng.int(70, 420);
          if (tot % 60 === 0) tot += rng.int(1, 59);
          h = Math.floor(tot / 60); mi = tot % 60;
          return {
            enonce: 'Exprimer ' + u(tot, 'min') + ' en heures et minutes.',
            questions: [qnum('Heures :', h, 'h'), qnum('Minutes :', mi, 'min')],
            indices: ['1 h = 60 min : cherche combien de fois 60 est contenu dans ' + m(tot) + '.'],
            solution: ['Division euclidienne par 60 : $' + n(tot) + ' = 60 \\times ' + n(h) + ' + ' + n(mi) + '$.', 'Donc ' + u(tot, 'min') + ' = ' + hm(h, mi) + '.']
          };
        }
        var j = rng.int(1, 4); h = rng.int(1, 23); tot = 24 * j + h;
        return {
          enonce: 'Le voyage d\'un camion de marchandises de Dakar à Bamako a duré ' + m(j) + ' jour' + (j > 1 ? 's' : '') + ' et ' + m(h) + ' heure' + (h > 1 ? 's' : '') + '.<br>Exprimer cette durée en heures.',
          questions: [qnum('Durée (h) :', tot, 'h')],
          indices: ['1 jour = 24 h.'],
          solution: ['$' + n(j) + '$ jour' + (j > 1 ? 's' : '') + ' $= ' + n(j) + ' \\times 24 = ' + n(24 * j) + '$ h.', '$' + n(24 * j) + ' + ' + n(h) + ' = ' + n(tot) + '$ h.']
        };
      }
      if (niveau === 2) {
        var ctx = rng.pick([
          { d: 'Un car part de Dakar à ', t: ' pour Saint-Louis. Le trajet dure ', q: 'il arrive à Saint-Louis', min: 3, max: 5 },
          { d: 'Un combat de lutte commence au stade à ', t: '. La soirée de lutte dure ', q: 'elle se termine', min: 1, max: 4 },
          { d: 'Un bateau quitte le port de Ziguinchor à ', t: '. La traversée dure ', q: 'il arrive', min: 2, max: 6 },
          { d: 'Une pirogue quitte la plage de Kayar à ', t: ' pour la pêche. La sortie en mer dure ', q: 'elle rentre', min: 1, max: 6 }
        ]);
        var trajet = rng.bool();
        var dh = trajet ? rng.int(2, 7) : rng.int(ctx.min, ctx.max), dm = rng.int(1, 11) * 5;
        var h1 = rng.int(5, 22 - dh - 1), m1 = rng.int(0, 11) * 5 + rng.pick([0, 0, 2, 3]);
        var debut = 60 * h1 + m1, fin = debut + 60 * dh + dm;
        var h2 = Math.floor(fin / 60), m2 = fin % 60;
        if (!trajet) {
          return {
            enonce: ctx.d + hm(h1, m1) + ctx.t + duree(dh, dm) + '.<br>Calculer l\'heure à laquelle ' + ctx.q + '.',
            questions: [qnum('Heures :', h2, 'h'), qnum('Minutes :', m2, 'min')],
            indices: ['Additionne les heures avec les heures et les minutes avec les minutes.', 'Si tu obtiens 60 minutes ou plus, convertis 60 min en 1 h.'],
            solution: [
              'On ajoute la durée à l\'heure de départ : ' + hm(h1, m1) + ' + ' + duree(dh, dm) + ' = ' + (h1 + dh) + NB + 'h' + NB + (m1 + dm) + NB + 'min.',
              (m1 + dm >= 60 ? 'Or $' + n(m1 + dm) + '$ min $= 1$ h $' + n(m1 + dm - 60) + '$ min : on obtient ' + hm(h2, m2) + '.' : 'Les minutes ne dépassent pas 60 : on obtient directement ' + hm(h2, m2) + '.'),
              'Réponse : ' + hm(h2, m2) + '.'
            ],
            aide: 'Donne l\'heure sous la forme heures et minutes.'
          };
        }
        var depart = rng.pick(['Dakar', 'Thiès', 'Kaolack']), arrivee = rng.pick(['Saint-Louis', 'Tambacounda', 'Ziguinchor', 'Matam']);
        var dur = fin - debut, dH = Math.floor(dur / 60), dM = dur % 60;
        var emprunt = m2 < m1;
        return {
          enonce: 'Un car quitte ' + depart + ' à ' + hm(h1, m1) + ' et arrive à ' + arrivee + ' à ' + hm(h2, m2) + ' le même jour.<br>Calculer la durée du trajet.',
          questions: [qnum('Heures :', dH, 'h'), qnum('Minutes :', dM, 'min')],
          indices: ['Calcule l\'heure d\'arrivée moins l\'heure de départ.', emprunt ? 'Les minutes d\'arrivée sont trop petites : transforme 1 h en 60 min.' : 'Soustrais les minutes, puis les heures.'],
          solution: (emprunt ? ['Les minutes ne se soustraient pas directement ($' + m2 + ' < ' + m1 + '$) : ' + hm(h2, m2) + ' = ' + (h2 - 1) + NB + 'h' + NB + (m2 + 60) + NB + 'min.'] : []).concat([
            'Durée : ' + (emprunt ? (h2 - 1) + NB + 'h' + NB + (m2 + 60) + NB + 'min' : hm(h2, m2)) + ' − ' + hm(h1, m1) + ' = ' + duree(dH, dM) + '.',
            'Le trajet a duré ' + duree(dH, dM) + '.'
          ])
        };
      }
      // vitesse
      var vit, tmin, gg = 0;
      do { vit = rng.pick([40, 45, 48, 50, 54, 60, 64, 72, 75, 80, 90, 100]); tmin = rng.pick([30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210, 240]); gg++; } while ((vit * tmin) % 60 !== 0 && gg < 100);
      if ((vit * tmin) % 60 !== 0) { vit = 60; tmin = 90; }
      var th = tmin / 60, dist = vit * tmin / 60;
      var tTxt = duree(Math.floor(tmin / 60), tmin % 60);
      var conv = tmin % 60 ? 'Durée en heures : ' + tTxt + ' $= ' + n(th) + '$ h (car $' + n(tmin % 60) + '$ min $= ' + n((tmin % 60) / 60) + '$ h).' : 'La durée est de ' + tTxt + ', un nombre entier d\'heures.';
      cas = rng.int(0, 2);
      var veh = rng.pick(['Un car', 'Un taxi-brousse', 'Un camion', 'Un minibus']);
      if (cas === 0) {
        return {
          enonce: veh + ' roule à la vitesse moyenne de ' + u(vit, 'km/h') + ' pendant ' + tTxt + '.<br>Calculer la distance parcourue.',
          questions: [qnum('Distance (km) :', dist, 'km')],
          indices: ['Distance = vitesse × durée (durée en heures).', 'Convertis la durée en heures : 30 min = 0,5 h ; 15 min = 0,25 h.'],
          solution: [conv, 'Distance $= ' + n(vit) + ' \\times ' + n(th) + ' = ' + n(dist) + '$ km.']
        };
      }
      if (cas === 1) {
        return {
          enonce: veh + ' parcourt ' + u(dist, 'km') + ' en ' + tTxt + '.<br>Calculer sa vitesse moyenne en km/h.',
          questions: [qnum('Vitesse (km/h) :', vit, 'km/h')],
          indices: ['Vitesse = distance ÷ durée (durée en heures).'],
          solution: [conv, 'Vitesse moyenne $= ' + n(dist) + ' \\div ' + n(th) + ' = ' + n(vit) + '$ km/h.']
        };
      }
      return {
        enonce: veh + ' roule à la vitesse moyenne de ' + u(vit, 'km/h') + '. Il doit parcourir ' + u(dist, 'km') + '.<br>Calculer la durée du trajet, en minutes.',
        questions: [qnum('Durée (min) :', tmin, 'min')],
        indices: ['Durée = distance ÷ vitesse : tu obtiens des heures.', 'Convertis ensuite en minutes (1 h = 60 min).'],
        solution: ['Durée $= ' + n(dist) + ' \\div ' + n(vit) + ' = ' + n(th) + '$ h.', 'En minutes : $' + n(th) + ' \\times 60 = ' + n(tmin) + '$ min, soit ' + tTxt + '.']
      };
    }
  });

  /* ---------- 10. Rectangle et carré ---------- */
  EM.gen.register({
    id: 'cm2-rectangle-carre',
    titre: 'Périmètre et aire du rectangle et du carré',
    chapitres: ['cm2-perimetres-aires', '6e-perimetres-aires'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var L, l, c, P, A, unite = rng.pick(['cm', 'm']), p = personne(rng);
      if (niveau === 1) {
        if (rng.bool(0.7)) {
          L = rng.int(8, 60); l = rng.int(3, L - 2); P = 2 * (L + l); A = L * l;
          return {
            enonce: 'Un rectangle a pour longueur ' + u(L, unite) + ' et pour largeur ' + u(l, unite) + '.<br>Calculer son périmètre et son aire.',
            figure: figRect(L, l, L + ' ' + unite, l + ' ' + unite),
            questions: [qnum('Périmètre (' + unite + ') :', P, unite), qnum('Aire (' + unite + '²) :', A)],
            indices: ['Périmètre du rectangle : $P = (L + l) \\times 2$.', 'Aire du rectangle : $A = L \\times l$.'],
            solution: ['$P = (L + l) \\times 2 = (' + n(L) + ' + ' + n(l) + ') \\times 2 = ' + n(L + l) + ' \\times 2 = ' + n(P) + '$ ' + unite + '.', '$A = L \\times l = ' + n(L) + ' \\times ' + n(l) + ' = ' + n(A) + '$ ' + unite + '².', 'Attention aux unités : le périmètre est une longueur (' + unite + '), l\'aire s\'exprime en ' + unite + '².']
          };
        }
        c = rng.int(3, 40);
        return {
          enonce: 'Un carré a pour côté ' + u(c, unite) + '.<br>Calculer son périmètre et son aire.',
          figure: figRect(c, c, c + ' ' + unite, null, { carre: true }),
          questions: [qnum('Périmètre (' + unite + ') :', 4 * c, unite), qnum('Aire (' + unite + '²) :', c * c)],
          indices: ['Périmètre du carré : $P = c \\times 4$.', 'Aire du carré : $A = c \\times c$.'],
          solution: ['$P = c \\times 4 = ' + n(c) + ' \\times 4 = ' + n(4 * c) + '$ ' + unite + '.', '$A = c \\times c = ' + n(c) + ' \\times ' + n(c) + ' = ' + n(c * c) + '$ ' + unite + '².']
        };
      }
      if (niveau === 2) {
        var cas = rng.int(0, 2);
        if (cas === 0) {
          c = rng.int(6, 60) / 2; P = 4 * c;
          return {
            enonce: 'Le périmètre d\'un carré est ' + u(P, unite) + '.<br>Calculer la longueur de son côté, puis son aire.',
            figure: figRect(c, c, '?', null, { carre: true }),
            questions: [qnum('Côté (' + unite + ') :', c, unite), qnum('Aire (' + unite + '²) :', c * c)],
            indices: ['Le carré a 4 côtés de même longueur.', 'Côté = périmètre ÷ 4.'],
            solution: ['$c = P \\div 4 = ' + n(P) + ' \\div 4 = ' + n(c) + '$ ' + unite + '.', '$A = ' + n(c) + ' \\times ' + n(c) + ' = ' + n(c * c) + '$ ' + unite + '².']
          };
        }
        L = rng.int(10, 80); l = rng.int(4, L - 3); P = 2 * (L + l); A = L * l;
        if (cas === 1) {
          return {
            enonce: 'Un rectangle a un périmètre de ' + u(P, unite) + ' et une longueur de ' + u(L, unite) + '.<br>Calculer sa largeur, puis son aire.',
            figure: figRect(L, l, L + ' ' + unite, '?'),
            questions: [qnum('Largeur (' + unite + ') :', l, unite), qnum('Aire (' + unite + '²) :', A)],
            indices: ['Le demi-périmètre est égal à la longueur plus la largeur.', 'Largeur = demi-périmètre − longueur.'],
            solution: ['Demi-périmètre : $' + n(P) + ' \\div 2 = ' + n(P / 2) + '$ ' + unite + ' $= L + l$.', 'Largeur : $l = ' + n(P / 2) + ' - ' + n(L) + ' = ' + n(l) + '$ ' + unite + '.', 'Aire : $A = ' + n(L) + ' \\times ' + n(l) + ' = ' + n(A) + '$ ' + unite + '².']
          };
        }
        return {
          enonce: 'Un rectangle a une aire de ' + u(A, unite + '²') + ' et une longueur de ' + u(L, unite) + '.<br>Calculer sa largeur, puis son périmètre.',
          figure: figRect(L, l, L + ' ' + unite, '?'),
          questions: [qnum('Largeur (' + unite + ') :', l, unite), qnum('Périmètre (' + unite + ') :', P, unite)],
          indices: ['$A = L \\times l$, donc $l = A \\div L$.'],
          solution: ['$l = A \\div L = ' + n(A) + ' \\div ' + n(L) + ' = ' + n(l) + '$ ' + unite + '.', '$P = (' + n(L) + ' + ' + n(l) + ') \\times 2 = ' + n(P) + '$ ' + unite + '.']
        };
      }
      if (rng.bool()) {
        L = rng.int(4, 24) * 5; l = rng.int(2, L / 5 - 1) * 5;
        var tours = rng.int(2, 4), prix = rng.pick([150, 200, 250, 300, 350, 400, 500]), porte = rng.bool() ? rng.pick([2, 3, 4]) : 0;
        P = 2 * (L + l);
        var fil = tours * (P - porte), cout = fil * prix;
        return {
          enonce: p.nom + ' veut clôturer son champ rectangulaire de ' + u(L, 'm') + ' de long sur ' + u(l, 'm') + ' de large avec ' + m(tours) + ' rangées de fil de fer' + (porte ? ', en laissant une ouverture de ' + u(porte, 'm') + ' pour le portail' : '') + '. Le mètre de fil coûte ' + cfa(prix) + '.<br>Calculer le périmètre du champ, la longueur de fil nécessaire, puis la dépense.',
          figure: figRect(L, l, L + ' m', l + ' m'),
          questions: [qnum('Périmètre (m) :', P, 'm'), qnum('Longueur de fil (m) :', fil, 'm'), qnum('Dépense :', cout, 'F CFA')],
          indices: ['Commence par le périmètre du champ.', porte ? 'Retire l\'ouverture du portail, puis multiplie par le nombre de rangées.' : 'Multiplie le périmètre par le nombre de rangées de fil.'],
          solution: [
            'Périmètre : $P = (' + n(L) + ' + ' + n(l) + ') \\times 2 = ' + n(P) + '$ m.',
            (porte ? 'Longueur à clôturer : $' + n(P) + ' - ' + n(porte) + ' = ' + n(P - porte) + '$ m. ' : '') + 'Fil nécessaire : $' + n(P - porte) + ' \\times ' + n(tours) + ' = ' + n(fil) + '$ m.',
            'Dépense : $' + n(fil) + ' \\times ' + n(prix) + ' = ' + n(cout) + '$ F CFA.'
          ]
        };
      }
      var cote = rng.pick([0.5, 0.4]), Lk = rng.int(6, 16), lk = rng.int(5, Lk);
      L = R(Lk * cote); l = R(lk * cote); A = R(L * l);
      var nbc = Lk * lk, pc = rng.pick([400, 500, 600, 750, 800, 1000]);
      return {
        enonce: 'Le sol d\'une salle rectangulaire de ' + u(L, 'm') + ' sur ' + u(l, 'm') + ' doit être recouvert de carreaux carrés de ' + u(cote * 100, 'cm') + ' de côté, vendus ' + cfa(pc) + ' l\'un.<br>Calculer l\'aire de la salle, le nombre de carreaux, puis la dépense.',
        figure: figRect(L, l, n(L).replace('{,}', ',') + ' m', n(l).replace('{,}', ',') + ' m'),
        questions: [qnum('Aire (m²) :', A), qnum('Nombre de carreaux :', nbc), qnum('Dépense :', nbc * pc, 'F CFA')],
        indices: ['Aire du rectangle : $L \\times l$.', 'Compte combien de carreaux tiennent dans la longueur, puis dans la largeur.'],
        solution: [
          'Aire : $' + n(L) + ' \\times ' + n(l) + ' = ' + n(A) + '$ m².',
          'Un carreau mesure ' + u(cote, 'm') + ' de côté. Dans la longueur : $' + n(L) + ' \\div ' + n(cote) + ' = ' + n(Lk) + '$ carreaux ; dans la largeur : $' + n(l) + ' \\div ' + n(cote) + ' = ' + n(lk) + '$ carreaux.',
          'Nombre de carreaux : $' + n(Lk) + ' \\times ' + n(lk) + ' = ' + n(nbc) + '$ (on vérifie : $' + n(A) + ' \\div ' + n(R(cote * cote)) + ' = ' + n(nbc) + '$).',
          'Dépense : $' + n(nbc) + ' \\times ' + n(pc) + ' = ' + n(nbc * pc) + '$ F CFA.'
        ]
      };
    }
  });

  /* ---------- 11. Aires du triangle, parallélogramme, losange, trapèze, figures composées ---------- */
  EM.gen.register({
    id: 'cm2-aires-figures',
    titre: 'Aires du triangle, du parallélogramme, du losange, du trapèze et de figures composées',
    chapitres: ['cm2-perimetres-aires', 'cm2-geometrie', '6e-perimetres-aires'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var un = rng.pick(['cm', 'm']), b, h, s, f, A, hd;
      // les figures ne sont pas forcément à l'échelle : on borne les proportions pour la lisibilité
      var borne = function (x, base, a1, a2) { return Math.min(Math.max(x, a1 * base), a2 * base); };
      if (niveau === 1) {
        b = rng.int(4, 20); h = rng.int(3, 15); hd = borne(h, b, 0.4, 0.75);
        if (rng.bool()) {
          s = R(b * rng.pick([0.25, 0.35, 0.6, 0.7]));
          var P1 = [0, 0], P2 = [b, 0], P3 = [s, hd], H = [s, 0];
          f = EM.fig.fit([P1, P2, P3], { w: 270, h: 190, pad: 34 });
          f.poly([P1, P2, P3], { fill: true }).seg(P3, H, { dash: true }).rightAngle(P2, H, P3);
          f.segLabel(P1, P2, b + ' ' + un, { inside: P3 }).label([s, hd / 2.6], 'h = ' + h + ' ' + un, s > b / 2 ? 'o' : 'e');
          A = b * h / 2;
          return {
            enonce: 'Un triangle a une base de ' + u(b, un) + ' et une hauteur relative à cette base de ' + u(h, un) + '.<br>Calculer son aire.',
            figure: f.svg(),
            questions: [qnum('Aire (' + un + '²) :', A)],
            indices: ['Aire du triangle : $A = \\dfrac{b \\times h}{2}$.'],
            solution: ['$A = \\dfrac{b \\times h}{2} = \\dfrac{' + n(b) + ' \\times ' + n(h) + '}{2} = \\dfrac{' + n(b * h) + '}{2} = ' + n(A) + '$ ' + un + '².', 'Remarque : le triangle est la moitié d\'un rectangle de mêmes base et hauteur.']
          };
        }
        s = R(hd * 0.45);
        var Q1 = [0, 0], Q2 = [b, 0], Q3 = [b + s, hd], Q4 = [s, hd], K = [s, 0];
        f = EM.fig.fit([Q1, Q2, Q3, Q4], { w: 280, h: 190, pad: 34 });
        f.poly([Q1, Q2, Q3, Q4], { fill: true }).seg(Q4, K, { dash: true }).rightAngle(Q1, K, Q4);
        f.segLabel(Q1, Q2, b + ' ' + un, { inside: Q4 }).label([s, hd / 2], 'h = ' + h + ' ' + un, 'e');
        A = b * h;
        return {
          enonce: 'Un parallélogramme a une base de ' + u(b, un) + ' et une hauteur de ' + u(h, un) + '.<br>Calculer son aire.',
          figure: f.svg(),
          questions: [qnum('Aire (' + un + '²) :', A)],
          indices: ['Aire du parallélogramme : $A = b \\times h$.'],
          solution: ['$A = b \\times h = ' + n(b) + ' \\times ' + n(h) + ' = ' + n(A) + '$ ' + un + '².', 'Attention : on utilise la hauteur (en pointillés), pas le côté oblique.']
        };
      }
      if (niveau === 2) {
        if (rng.bool()) {
          var D = rng.int(6, 24), d = rng.int(4, D - 1), dd = borne(d, D, 0.5, 0.8);
          var L1 = [-D / 2, 0], L2 = [0, -dd / 2], L3 = [D / 2, 0], L4 = [0, dd / 2];
          f = EM.fig.fit([L1, L2, L3, L4], { w: 270, h: 200, pad: 30 });
          f.poly([L1, L2, L3, L4], { fill: true }).seg(L1, L3, { dash: true }).seg(L2, L4, { dash: true }).rightAngle(L3, [0, 0], L4);
          f.label([-D / 4, 0], 'D = ' + D + ' ' + un, 's').label([0, dd / 4], 'd = ' + d + ' ' + un, 'e');
          A = D * d / 2;
          return {
            enonce: 'Un losange a une grande diagonale de ' + u(D, un) + ' et une petite diagonale de ' + u(d, un) + '.<br>Calculer son aire.',
            figure: f.svg(),
            questions: [qnum('Aire (' + un + '²) :', A)],
            indices: ['Aire du losange : $A = \\dfrac{D \\times d}{2}$.'],
            solution: ['$A = \\dfrac{D \\times d}{2} = \\dfrac{' + n(D) + ' \\times ' + n(d) + '}{2} = \\dfrac{' + n(D * d) + '}{2} = ' + n(A) + '$ ' + un + '².', 'Le losange est la moitié du rectangle dont les côtés mesurent ' + m(D) + ' et ' + m(d) + '.']
          };
        }
        var B = rng.int(8, 24), bb = rng.int(3, B - 2); h = rng.int(3, 14); s = R((B - bb) * rng.pick([0.3, 0.5, 0.7]));
        hd = borne(h, B, 0.35, 0.6);
        var T1 = [0, 0], T2 = [B, 0], T3 = [s + bb, hd], T4 = [s, hd], KK = [s, 0];
        f = EM.fig.fit([T1, T2, T3, T4], { w: 280, h: 190, pad: 34 });
        f.poly([T1, T2, T3, T4], { fill: true }).seg(T4, KK, { dash: true }).rightAngle(T1, KK, T4);
        f.segLabel(T1, T2, 'B = ' + B + ' ' + un, { inside: T4 }).segLabel(T4, T3, 'b = ' + bb + ' ' + un, { inside: T1 }).label([s, hd / 2], 'h = ' + h + ' ' + un, 'e');
        A = (B + bb) * h / 2;
        return {
          enonce: 'Un trapèze a une grande base de ' + u(B, un) + ', une petite base de ' + u(bb, un) + ' et une hauteur de ' + u(h, un) + '.<br>Calculer son aire.',
          figure: f.svg(),
          questions: [qnum('Aire (' + un + '²) :', A)],
          indices: ['Aire du trapèze : $A = \\dfrac{(B + b) \\times h}{2}$.'],
          solution: ['$A = \\dfrac{(B + b) \\times h}{2} = \\dfrac{(' + n(B) + ' + ' + n(bb) + ') \\times ' + n(h) + '}{2} = \\dfrac{' + n(B + bb) + ' \\times ' + n(h) + '}{2} = \\dfrac{' + n((B + bb) * h) + '}{2} = ' + n(A) + '$ ' + un + '².']
        };
      }
      // figures composées (mètres)
      if (rng.bool()) {
        var Lm = rng.int(4, 12) * 2, lm = rng.int(3, 6), hm2 = rng.int(2, 5);
        var M1 = [0, 0], M2 = [Lm, 0], M3 = [Lm, lm], M4 = [Lm / 2, lm + hm2], M5 = [0, lm];
        f = EM.fig.fit([M1, M2, M3, M4, M5], { w: 250, h: 220, pad: 38 });
        f.poly([M1, M2, M3, M4, M5], { fill: true }).seg(M5, M3, { dash: true }).seg(M4, [Lm / 2, lm], { dash: true });
        f.segLabel(M1, M2, Lm + ' m', { inside: M4 }).segLabel(M2, M3, lm + ' m', { inside: M1 }).label([Lm / 2, lm + hm2 / 2], hm2 + ' m', 'e');
        var Ar = Lm * lm, At = Lm * hm2 / 2;
        return {
          enonce: 'La façade d\'un hangar de stockage d\'arachide est formée d\'un rectangle de ' + u(Lm, 'm') + ' sur ' + u(lm, 'm') + ' surmonté d\'un triangle de même base et de hauteur ' + u(hm2, 'm') + ' (voir la figure).<br>Calculer l\'aire totale de la façade.',
          figure: f.svg(),
          questions: [qnum('Aire (m²) :', Ar + At)],
          indices: ['Découpe la figure en un rectangle et un triangle.', 'Additionne les deux aires.'],
          solution: ['Aire du rectangle : $' + n(Lm) + ' \\times ' + n(lm) + ' = ' + n(Ar) + '$ m².', 'Aire du triangle : $\\dfrac{' + n(Lm) + ' \\times ' + n(hm2) + '}{2} = ' + n(At) + '$ m².', 'Aire totale : $' + n(Ar) + ' + ' + n(At) + ' = ' + n(Ar + At) + '$ m².']
        };
      }
      var LL = rng.int(8, 20), ll = rng.int(6, 15), a = rng.int(2, LL - 3), c = rng.int(2, ll - 2);
      var pts = [[0, 0], [LL, 0], [LL, ll - c], [LL - a, ll - c], [LL - a, ll], [0, ll]];
      f = EM.fig.fit(pts, { w: 270, h: 210, pad: 38 });
      f.poly(pts, { fill: true });
      f.segLabel(pts[0], pts[1], LL + ' m', { inside: [LL / 2, ll / 2] }).segLabel(pts[5], pts[0], ll + ' m', { inside: [LL / 2, ll / 2] });
      f.segLabel(pts[2], pts[3], a + ' m', { flip: false, inside: [LL / 2, 0] }).segLabel(pts[3], pts[4], c + ' m', { inside: [0, ll / 2] });
      A = LL * ll - a * c;
      var per = 2 * (LL + ll);
      return {
        enonce: 'Un terrain a la forme ci-contre : c\'est un rectangle de ' + u(LL, 'm') + ' sur ' + u(ll, 'm') + ' auquel on a retiré, dans un coin, un rectangle de ' + u(a, 'm') + ' sur ' + u(c, 'm') + '. Tous les angles sont droits.<br>Calculer l\'aire du terrain, puis son périmètre.',
        figure: f.svg(),
        questions: [qnum('Aire (m²) :', A), qnum('Périmètre (m) :', per, 'm')],
        indices: ['Aire : grand rectangle moins le petit rectangle retiré.', 'Pour le périmètre, calcule d\'abord les deux côtés inconnus, puis additionne les six côtés.'],
        solution: [
          'Aire : $' + n(LL) + ' \\times ' + n(ll) + ' - ' + n(a) + ' \\times ' + n(c) + ' = ' + n(LL * ll) + ' - ' + n(a * c) + ' = ' + n(A) + '$ m².',
          'Côtés inconnus : en haut $' + n(LL) + ' - ' + n(a) + ' = ' + n(LL - a) + '$ m ; à droite $' + n(ll) + ' - ' + n(c) + ' = ' + n(ll - c) + '$ m.',
          'Périmètre : $' + [LL, ll - c, a, c, LL - a, ll].map(n).join(' + ') + ' = ' + n(per) + '$ m.',
          'Remarque : c\'est le même périmètre que celui du grand rectangle, $(' + n(LL) + ' + ' + n(ll) + ') \\times 2 = ' + n(per) + '$ m.'
        ]
      };
    }
  });

  /* ---------- 12. Cercle et disque ---------- */
  EM.gen.register({
    id: 'cm2-cercle-disque',
    titre: 'Cercle et disque : rayon, diamètre, périmètre, aire',
    chapitres: ['cm2-perimetres-aires', '6e-cercle', '6e-perimetres-aires'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var r, D, P, A, f, un = rng.pick(['cm', 'm']);
      function figCercle(rr, lab, avecDiam) {
        var g = EM.fig.fit([[-rr, -rr], [rr, rr]], { w: 200, h: 200, pad: 18 });
        g.circle([0, 0], rr).point([0, 0], 'O', 'so');
        if (avecDiam) g.seg([-rr, 0], [rr, 0], { accent: true }).segLabel([-rr, 0], [rr, 0], lab, { k: 12, flip: true });
        else g.seg([0, 0], [rr * 0.8, rr * 0.6], { accent: true }).segLabel([0, 0], [rr * 0.8, rr * 0.6], lab, { k: 12 });
        return g.svg();
      }
      if (niveau === 1) {
        r = rng.int(4, 30) / 2;
        var sensR = rng.bool();
        var dist, pos;
        var k = rng.int(0, 2);
        dist = k === 0 ? R(r - rng.int(1, Math.max(1, Math.floor(r * 2 - 1))) / 2) : k === 1 ? r : R(r + rng.int(1, 6) / 2);
        if (dist <= 0) { dist = r; k = 1; }
        pos = k === 0 ? 'à l\'intérieur du cercle' : k === 1 ? 'sur le cercle' : 'à l\'extérieur du cercle';
        return {
          enonce: '(C) est un cercle de centre O ' + (sensR ? 'et de rayon ' + u(r, un) : 'et de diamètre ' + u(2 * r, un)) + '. Un point M est tel que $OM = ' + n(dist) + '$ ' + un + '.<br>' + (sensR ? 'Calculer le diamètre du cercle' : 'Calculer le rayon du cercle') + ', puis préciser la position du point M.',
          figure: figCercle(r, (sensR ? 'r = ' : 'D = ') + n(sensR ? r : 2 * r).replace('{,}', ',') + ' ' + un, !sensR),
          questions: [
            qnum(sensR ? 'Diamètre (' + un + ') :' : 'Rayon (' + un + ') :', sensR ? 2 * r : r, un),
            qcm(rng, pos, ['à l\'intérieur du cercle', 'sur le cercle', 'à l\'extérieur du cercle'], 'Position de M :')
          ],
          indices: ['Le diamètre est le double du rayon.', 'Compare la distance $OM$ au rayon.'],
          solution: [
            sensR ? 'Diamètre $= 2 \\times r = 2 \\times ' + n(r) + ' = ' + n(2 * r) + '$ ' + un + '.' : 'Rayon $= D \\div 2 = ' + n(2 * r) + ' \\div 2 = ' + n(r) + '$ ' + un + '.',
            '$OM = ' + n(dist) + '$ ' + un + ' et $r = ' + n(r) + '$ ' + un + '. ' + (k === 0 ? 'Comme $OM < r$, M est à l\'intérieur du cercle.' : k === 1 ? 'Comme $OM = r$, M est sur le cercle.' : 'Comme $OM > r$, M est à l\'extérieur du cercle.')
          ]
        };
      }
      if (niveau === 2) {
        var ctx = rng.int(0, 2);
        if (ctx === 0) {
          D = rng.pick([50, 55, 60, 65, 70]); P = R(D * 3.14); var tours = rng.pick([100, 200, 500, 1000]); var dist2 = R(P * tours / 100);
          return {
            enonce: 'La roue du vélo ' + de(personne(rng).nom) + ' a un diamètre de ' + u(D, 'cm') + '. On prend $\\pi \\approx 3{,}14$.<br>Calculer le périmètre de la roue en cm, puis la distance parcourue, en mètres, quand la roue fait ' + m(tours) + ' tours.',
            figure: figCercle(D / 2, 'D = ' + D + ' cm', true),
            questions: [qnum('Périmètre (cm) :', P, 'cm'), qnum('Distance (m) :', dist2, 'm')],
            indices: ['Périmètre du cercle $= D \\times \\pi \\approx D \\times 3{,}14$.', 'À chaque tour, le vélo avance d\'un périmètre de roue.'],
            solution: ['$P = D \\times 3{,}14 = ' + n(D) + ' \\times 3{,}14 = ' + n(P) + '$ cm.', 'En ' + m(tours) + ' tours : $' + n(P) + ' \\times ' + n(tours) + ' = ' + n(R(P * tours)) + '$ cm $= ' + n(dist2) + '$ m.']
          };
        }
        var rayon = ctx === 1;
        r = rayon ? rng.int(5, 15) / 10 : rng.int(30, 60); D = rayon ? R(2 * r) : r; P = R(D * 3.14);
        var obj = ctx === 1 ? 'La margelle d\'un puits circulaire a un rayon de ' + u(r, 'm') : 'Un plateau rond a un diamètre de ' + u(D, 'cm');
        var unite2 = ctx === 1 ? 'm' : 'cm';
        return {
          enonce: obj + '. On prend $\\pi \\approx 3{,}14$.<br>Calculer son périmètre.',
          figure: figCercle(ctx === 1 ? r : D / 2, ctx === 1 ? 'r = ' + n(r).replace('{,}', ',') + ' m' : 'D = ' + D + ' cm', ctx !== 1),
          questions: [qnum('Périmètre (' + unite2 + ') :', P, unite2)],
          indices: ['Périmètre du cercle : $P = D \\times 3{,}14$ ou $P = 2 \\times r \\times 3{,}14$.'],
          solution: (ctx === 1 ? ['Diamètre : $D = 2 \\times ' + n(r) + ' = ' + n(D) + '$ m.'] : []).concat(['$P = D \\times 3{,}14 = ' + n(D) + ' \\times 3{,}14 = ' + n(P) + '$ ' + unite2 + '.'])
        };
      }
      if (rng.bool()) {
        r = un === 'm' ? rng.int(2, 16) / 2 : rng.int(10, 40) / 2; A = R(r * r * 3.14);
        return {
          enonce: (un === 'm' ? 'Un bassin circulaire a un rayon de ' + u(r, un) + '. On prend $\\pi \\approx 3{,}14$.<br>Calculer l\'aire du fond du bassin.' : 'Un couvercle de marmite a la forme d\'un disque de rayon ' + u(r, un) + '. On prend $\\pi \\approx 3{,}14$.<br>Calculer l\'aire de ce disque.'),
          figure: figCercle(r, 'r = ' + n(r).replace('{,}', ',') + ' ' + un, false),
          questions: [qnum('Aire (' + un + '²) :', A)],
          indices: ['Aire du disque : $A = r \\times r \\times 3{,}14$.', 'Attention : on utilise le rayon, pas le diamètre.'],
          solution: ['$A = r \\times r \\times 3{,}14 = ' + n(r) + ' \\times ' + n(r) + ' \\times 3{,}14 = ' + n(R(r * r)) + ' \\times 3{,}14 = ' + n(A) + '$ ' + un + '².']
        };
      }
      D = rng.int(4, 60); P = R(D * 3.14);
      return {
        enonce: 'Une piste circulaire a un périmètre de ' + u(P, 'm') + '. On prend $\\pi \\approx 3{,}14$.<br>Calculer son diamètre, puis son rayon.',
        questions: [qnum('Diamètre (m) :', D, 'm'), qnum('Rayon (m) :', D / 2, 'm')],
        indices: ['$P = D \\times 3{,}14$, donc $D = P \\div 3{,}14$.'],
        solution: ['$D = P \\div 3{,}14 = ' + n(P) + ' \\div 3{,}14 = ' + n(D) + '$ m.', '$r = D \\div 2 = ' + n(D / 2) + '$ m.']
      };
    }
  });

  /* ---------- 13. Pavé droit et cube ---------- */
  EM.gen.register({
    id: 'cm2-pave-cube',
    titre: 'Pavé droit et cube : éléments, volume, patron',
    chapitres: ['cm2-geometrie', 'cm2-mesures', '6e-solides'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var L, l, h, V;
      if (niveau === 1) {
        var el = rng.pick([['faces', 6], ['arêtes', 12], ['sommets', 8]]);
        var solide = rng.pick(['pavé droit', 'cube']);
        var a = rng.int(2, 12);
        return {
          enonce: 'a) Donner le nombre ' + (el[0] === 'arêtes' ? 'd\'' : 'de ') + el[0] + ' d\'un ' + solide + '.<br>b) Un cube a une arête de ' + u(a, 'cm') + '. Calculer son volume.',
          figure: figPave(a, a, a, [a + ' cm', a + ' cm', a + ' cm']),
          questions: [
            qcm(rng, '$' + el[1] + '$', ['$4$', '$6$', '$8$', '$12$'], 'Nombre ' + (el[0] === 'arêtes' ? 'd\'' : 'de ') + el[0] + ' :'),
            qnum('Volume (cm³) :', a * a * a)
          ],
          indices: ['Un pavé droit (comme le cube) a 6 faces, 12 arêtes et 8 sommets.', 'Volume du cube : $V = a \\times a \\times a$.'],
          solution: [
            'Un ' + solide + ' a 6 faces, 12 arêtes et 8 sommets : il a donc ' + el[1] + ' ' + el[0] + '.',
            '$V = a \\times a \\times a = ' + n(a) + ' \\times ' + n(a) + ' \\times ' + n(a) + ' = ' + n(a * a * a) + '$ cm³.'
          ]
        };
      }
      if (niveau === 2) {
        L = rng.int(3, 8) / 2; l = rng.int(2, Math.min(6, L * 2)) / 2; h = rng.int(2, 5) / 2 + rng.pick([0, 0.2]);
        h = R(h); V = R(L * l * h);
        return {
          enonce: 'Une citerne a la forme d\'un pavé droit de ' + u(L, 'm') + ' de long, ' + u(l, 'm') + ' de large et ' + u(h, 'm') + ' de haut.<br>Calculer son volume en m³, puis sa capacité en litres.',
          figure: figPave(L, l, h, [n(L).replace('{,}', ',') + ' m', n(l).replace('{,}', ',') + ' m', n(h).replace('{,}', ',') + ' m']),
          questions: [qnum('Volume (m³) :', V), qnum('Capacité (L) :', V * 1000, 'L')],
          indices: ['Volume du pavé droit : $V = L \\times l \\times h$.', '1 m³ = 1 000 dm³ = 1 000 L.'],
          solution: [
            '$V = L \\times l \\times h = ' + n(L) + ' \\times ' + n(l) + ' \\times ' + n(h) + ' = ' + n(V) + '$ m³.',
            '1 m³ $= 1\\,000$ L, donc la capacité est $' + n(V) + ' \\times 1\\,000 = ' + n(V * 1000) + '$ L.'
          ]
        };
      }
      if (rng.bool()) {
        L = rng.int(4, 12); l = rng.int(3, L); h = rng.int(2, 9) / 2 + 0.5; h = R(h);
        V = R(L * l * h);
        return {
          enonce: 'Un bassin de pisciculture a la forme d\'un pavé droit. Son fond est un rectangle de ' + u(L, 'm') + ' sur ' + u(l, 'm') + ' et il contient ' + u(V, 'm³') + ' d\'eau lorsqu\'il est plein.<br>Calculer la profondeur du bassin.',
          figure: figPave(L, l, h, [L + ' m', l + ' m', '?']),
          questions: [qnum('Profondeur (m) :', h, 'm')],
          indices: ['$V = L \\times l \\times h$ : calcule d\'abord l\'aire du fond $L \\times l$.', 'Puis $h = V \\div (L \\times l)$.'],
          solution: ['Aire du fond : $' + n(L) + ' \\times ' + n(l) + ' = ' + n(L * l) + '$ m².', 'Profondeur : $h = ' + n(V) + ' \\div ' + n(L * l) + ' = ' + n(h) + '$ m.']
        };
      }
      L = rng.int(6, 25); l = rng.int(4, L); h = rng.int(3, 20);
      var At = 2 * (L * l + L * h + l * h);
      return {
        enonce: 'Une boîte en carton (sans ouverture) a la forme d\'un pavé droit de ' + u(L, 'cm') + ' de long, ' + u(l, 'cm') + ' de large et ' + u(h, 'cm') + ' de haut.<br>Calculer l\'aire totale de carton utilisée (aire du patron, sans les languettes).',
        figure: figPave(L, l, h, [L + ' cm', l + ' cm', h + ' cm']),
        questions: [qnum('Aire totale (cm²) :', At)],
        indices: ['Le patron d\'un pavé droit est formé de 6 rectangles, égaux deux à deux.', 'Aire totale $= 2 \\times (L \\times l + L \\times h + l \\times h)$.'],
        solution: [
          'Les faces sont égales deux à deux : deux faces de $' + n(L) + ' \\times ' + n(l) + ' = ' + n(L * l) + '$ cm², deux de $' + n(L) + ' \\times ' + n(h) + ' = ' + n(L * h) + '$ cm² et deux de $' + n(l) + ' \\times ' + n(h) + ' = ' + n(l * h) + '$ cm².',
          'Aire totale : $2 \\times (' + n(L * l) + ' + ' + n(L * h) + ' + ' + n(l * h) + ') = 2 \\times ' + n(L * l + L * h + l * h) + ' = ' + n(At) + '$ cm².'
        ]
      };
    }
  });

  /* ---------- 14. Achat, vente, bénéfice ---------- */
  EM.gen.register({
    id: 'cm2-commerce',
    titre: 'Prix d\'achat, prix de revient, prix de vente, bénéfice ou perte',
    chapitres: ['cm2-problemes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var p = personne(rng);
      if (niveau === 1) {
        var obj = rng.pick([
          ['un mouton pour la Tabaski', 'de transport et de nourriture', 12, 30, 5000, 1000, 10000, 'le'],
          ['un vélo d\'occasion', 'de réparation', 50, 120, 500, 1500, 8000, 'le'],
          ['une télévision', 'de transport', 16, 40, 5000, 2000, 6000, 'la'],
          ['une charrette', 'de peinture et de réparation', 10, 24, 5000, 3000, 15000, 'la']
        ]);
        var PA = rng.int(obj[2], obj[3]) * obj[4];
        var fr2 = rng.int(obj[5] / 500, obj[6] / 500) * 500;
        var PR = PA + fr2, ben = rng.int(5, 40) * 1000, PV = PR + ben;
        return {
          enonce: p.nom + ' achète ' + obj[0] + ' à ' + cfa(PA) + '. ' + p.Il + ' dépense ensuite ' + cfa(fr2) + ' de frais ' + obj[1] + ', puis ' + p.il + ' ' + obj[7] + ' revend à ' + cfa(PV) + '.<br>Calculer le prix de revient, puis le bénéfice.',
          questions: [qnum('Prix de revient :', PR, 'F CFA'), qnum('Bénéfice :', ben, 'F CFA')],
          indices: ['Prix de revient = prix d\'achat + frais.', 'Bénéfice = prix de vente − prix de revient.'],
          solution: ['Prix de revient $=$ prix d\'achat $+$ frais $= ' + n(PA) + ' + ' + n(fr2) + ' = ' + n(PR) + '$ F CFA.', 'Bénéfice $=$ prix de vente $-$ prix de revient $= ' + n(PV) + ' - ' + n(PR) + ' = ' + n(ben) + '$ F CFA.']
        };
      }
      var art = rng.pick([
        ['sacs d\'arachide de 50 kg', 'le sac', 24, 50, 500, 'Un commerçant de Kaolack', 'il'],
        ['caisses de poisson', 'la caisse', 15, 40, 500, 'Une mareyeuse de Joal', 'elle'],
        ['cageots de mangues', 'le cageot', 8, 20, 500, 'Une commerçante de Ziguinchor', 'elle'],
        ['sacs d\'oignons de 25 kg', 'le sac', 16, 30, 500, 'Un grossiste de Thiès', 'il']
      ]);
      var nb = rng.int(8, 40), pu = rng.int(art[2], art[3]) * art[4], frais = rng.int(5, 40) * 1000;
      var PR2 = nb * pu + frais;
      var perte = rng.bool(0.3), s, res, guard = 0;
      do {
        var delta = perte ? -rng.int(5, 40) * 1000 : rng.int(10, 80) * 1000;
        s = Math.round((PR2 + delta) / nb / 50) * 50;
        res = nb * s - PR2;
        guard++;
      } while ((res === 0 || (res < 0) !== perte) && guard < 50);
      if (res === 0) { s += 50; res = nb * s - PR2; }
      perte = res < 0;
      var PVt = nb * s;
      return {
        enonce: art[5] + ' achète ' + m(nb) + ' ' + art[0] + ' à ' + cfa(pu) + ' ' + art[1] + '. Les frais de transport s\'élèvent à ' + cfa(frais) + '. ' + (art[6] === 'il' ? 'Il' : 'Elle') + ' revend tout à ' + cfa(s) + ' ' + art[1] + '.<br>Calculer le prix de revient total et le prix de vente total, puis dire ' + (art[6] === 'il' ? 's\'il' : 'si elle') + ' réalise un bénéfice ou une perte et en calculer le montant.',
        questions: [
          qnum('Prix de revient :', PR2, 'F CFA'),
          qnum('Prix de vente :', PVt, 'F CFA'),
          qcm(rng, perte ? 'une perte' : 'un bénéfice', ['un bénéfice', 'une perte'], 'Résultat :'),
          qnum('Montant :', Math.abs(res), 'F CFA')
        ],
        indices: ['Prix de revient = prix d\'achat total + frais.', 'Compare le prix de vente total au prix de revient.'],
        solution: [
          'Prix d\'achat total : $' + n(nb) + ' \\times ' + n(pu) + ' = ' + n(nb * pu) + '$ F CFA.',
          'Prix de revient : $' + n(nb * pu) + ' + ' + n(frais) + ' = ' + n(PR2) + '$ F CFA.',
          'Prix de vente total : $' + n(nb) + ' \\times ' + n(s) + ' = ' + n(PVt) + '$ F CFA.',
          perte ? 'Le prix de vente est inférieur au prix de revient : c\'est une perte de $' + n(PR2) + ' - ' + n(PVt) + ' = ' + n(-res) + '$ F CFA.' : 'Le prix de vente est supérieur au prix de revient : c\'est un bénéfice de $' + n(PVt) + ' - ' + n(PR2) + ' = ' + n(res) + '$ F CFA.'
        ]
      };
    }
  });

  /* ---------- 15. Moyenne et partages ---------- */
  EM.gen.register({
    id: 'cm2-partages-moyenne',
    titre: 'Moyenne, partages égaux et inégaux',
    chapitres: ['cm2-problemes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var p = personne(rng), i;
      if (niveau === 1) {
        var nbN = rng.pick([4, 5]), notes = [];
        for (i = 0; i < nbN; i++) notes.push(rng.int(3, 10));
        var mat = rng.sample(['calcul', 'dictée', 'rédaction', 'sciences', 'histoire-géographie', 'éducation civique'], nbN);
        var S = EM.util.sum(notes);
        if (rng.bool(0.6)) {
          return {
            enonce: 'Au dernier devoir, ' + p.nom + ' a obtenu les notes suivantes (sur 10) : ' + mat.map(function (mm, j) { return mm + ' ' + m(notes[j]); }).join(', ') + '.<br>Calculer sa moyenne.',
            questions: [qnum('Moyenne :', S / nbN)],
            indices: ['Moyenne = somme des notes ÷ nombre de notes.'],
            solution: ['Somme des notes : $' + notes.join(' + ') + ' = ' + n(S) + '$.', 'Moyenne : $' + n(S) + ' \\div ' + n(nbN) + ' = ' + n(S / nbN) + '$ sur 10.']
          };
        }
        var vis = rng.int(5, 8), S4 = S - notes[nbN - 1], need = vis * nbN - S4, g = 0;
        while ((need < 2 || need > 10) && g < 50) { notes = []; for (i = 0; i < nbN; i++) notes.push(rng.int(3, 10)); S4 = EM.util.sum(notes) - notes[nbN - 1]; need = vis * nbN - S4; g++; }
        if (need < 2 || need > 10) { notes = [6, 7, 5, 6, 6].slice(0, nbN); vis = 6; S4 = EM.util.sum(notes) - notes[nbN - 1]; need = vis * nbN - S4; }
        var prem = notes.slice(0, nbN - 1);
        return {
          enonce: p.nom + ' a obtenu ' + prem.map(function (x) { return m(x); }).join(', ') + ' (sur 10) dans ' + (nbN - 1) + ' matières. Il reste une épreuve.<br>Calculer la note qu\'' + p.il + ' doit obtenir pour avoir exactement ' + m(vis) + ' de moyenne sur les ' + nbN + ' épreuves.',
          questions: [qnum('Note nécessaire :', need)],
          indices: ['Pour une moyenne de ' + m(vis) + ' sur ' + nbN + ' épreuves, il faut un total de $' + n(vis) + ' \\times ' + nbN + '$ points.'],
          solution: ['Total nécessaire : $' + n(vis) + ' \\times ' + n(nbN) + ' = ' + n(vis * nbN) + '$ points.', 'Points déjà obtenus : $' + prem.join(' + ') + ' = ' + n(S4) + '$.', 'Note nécessaire : $' + n(vis * nbN) + ' - ' + n(S4) + ' = ' + n(need) + '$.']
        };
      }
      if (niveau === 2) {
        var q = personne(rng, [p.nom]);
        var ctx = rng.int(0, 1), pe, D;
        var unit = ctx === 0 ? rng.pick([50, 500, 1000]) : rng.pick([1, 2, 5]);
        pe = rng.int(10, 60) * unit; D = rng.int(2, 30) * unit;
        var gr = pe + D, St = pe + gr;
        var quoi = ctx === 0 ? ['se partagent une somme de ' + cfa(St), p.nom + ' reçoit ' + cfa(D) + ' de plus ' + que(q.nom), 'F CFA'] : ['ont récolté ensemble ' + u(St, 'kg') + ' de mangues', p.nom + ' a récolté ' + u(D, 'kg') + ' de plus ' + que(q.nom), 'kg'];
        return {
          enonce: p.nom + ' et ' + q.nom + ' ' + quoi[0] + '. ' + quoi[1] + '.<br>Calculer la part de chacun.',
          questions: [qnum('Part ' + de(q.nom) + ' :', pe, quoi[2]), qnum('Part ' + de(p.nom) + ' :', gr, quoi[2])],
          indices: ['Si on retire la différence du total, il reste deux parts égales.', 'Petite part = (total − différence) ÷ 2.'],
          solution: [
            'On retire la différence : $' + n(St) + ' - ' + n(D) + ' = ' + n(St - D) + '$. Il reste deux parts égales.',
            'Part ' + de(q.nom) + ' (la plus petite) : $' + n(St - D) + ' \\div 2 = ' + n(pe) + '$ ' + quoi[2] + '.',
            'Part ' + de(p.nom) + ' : $' + n(pe) + ' + ' + n(D) + ' = ' + n(gr) + '$ ' + quoi[2] + '.',
            'Vérification : $' + n(pe) + ' + ' + n(gr) + ' = ' + n(St) + '$.'
          ]
        };
      }
      p = personne(rng, null, 'm');
      var q2 = personne(rng, [p.nom], 'm'), r = personne(rng, [p.nom, q2.nom], 'm');
      var a = rng.pick([2, 3]), b = rng.pick([2, 3, 4]), unite3 = rng.pick([500, 1000, 2500]);
      var part = rng.int(4, 40) * unite3, tot = part * (1 + a + b);
      var mot = function (k) { return k === 2 ? 'le double' : k === 3 ? 'le triple' : 'le quadruple'; };
      return {
        enonce: 'Trois lutteurs, ' + p.nom + ', ' + q2.nom + ' et ' + r.nom + ', se partagent une prime de ' + cfa(tot) + '. ' + q2.nom + ' reçoit ' + mot(a) + ' de la part ' + de(p.nom) + ' et ' + r.nom + ' reçoit ' + mot(b) + ' de la part ' + de(p.nom) + '.<br>Calculer la part de chacun.',
        questions: [qnum('Part ' + de(p.nom) + ' :', part, 'F CFA'), qnum('Part ' + de(q2.nom) + ' :', a * part, 'F CFA'), qnum('Part ' + de(r.nom) + ' :', b * part, 'F CFA')],
        indices: ['Prends la part ' + de(p.nom) + ' comme une « part » : combien de parts y a-t-il en tout ?', 'Nombre de parts : $1 + ' + a + ' + ' + b + '$.'],
        solution: [
          'Si la part ' + de(p.nom) + ' vaut 1 part, celle ' + de(q2.nom) + ' vaut ' + a + ' parts et celle ' + de(r.nom) + ' ' + b + ' parts : en tout $1 + ' + a + ' + ' + b + ' = ' + (1 + a + b) + '$ parts.',
          'Une part vaut $' + n(tot) + ' \\div ' + (1 + a + b) + ' = ' + n(part) + '$ F CFA : c\'est la part ' + de(p.nom) + '.',
          'Part ' + de(q2.nom) + ' : $' + n(part) + ' \\times ' + a + ' = ' + n(a * part) + '$ F CFA ; part ' + de(r.nom) + ' : $' + n(part) + ' \\times ' + b + ' = ' + n(b * part) + '$ F CFA.',
          'Vérification : $' + n(part) + ' + ' + n(a * part) + ' + ' + n(b * part) + ' = ' + n(tot) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e                                                                  */
  /* ================================================================== */

  /* ---------- 16. Nombres décimaux : écriture, comparaison, arrondi ---------- */
  var RANGS_DEC = { '-3': 'millièmes', '-2': 'centièmes', '-1': 'dixièmes', '0': 'unités', '1': 'dizaines', '2': 'centaines' };
  function chiffreDec(X, r) { return Math.floor(X / pw(3 + r)) % 10; } // X en millièmes

  EM.gen.register({
    id: '6e-decimaux',
    titre: 'Nombres décimaux : écriture, comparaison, arrondi',
    chapitres: ['6e-decimaux', 'cm2-fractions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var X, x, k, N, q1, s1, e1, i;
      if (niveau === 1) {
        k = rng.int(1, 3);
        if (rng.bool()) {
          N = rng.int(7, 99999); x = R(N / pw(k));
          e1 = 'a) Écrire $' + fr(N, pw(k)) + '$ sous la forme d\'un nombre décimal.';
          q1 = qnum('$' + fr(N, pw(k)) + ' =$', x);
          s1 = ['Diviser par ' + m(pw(k)) + ', c\'est déplacer la virgule de ' + k + ' rang' + (k > 1 ? 's' : '') + ' vers la gauche : $' + fr(N, pw(k)) + ' = ' + n(x) + '$.'];
        } else {
          do { N = rng.int(11, 99999); } while (N % 10 === 0);
          x = R(N / pw(k));
          e1 = 'a) Compléter l\'égalité $' + n(x) + ' = \\dfrac{\\ldots}{' + n(pw(k)) + '}$.';
          q1 = qnum('$' + n(x) + ' = \\dfrac{\\ldots}{' + n(pw(k)) + '}$, numérateur :', N);
          s1 = [m(x) + ' a ' + k + ' chiffre' + (k > 1 ? 's' : '') + ' après la virgule : c\'est un nombre de ' + RANGS_DEC[String(-k)] + '. $' + n(x) + ' = ' + fr(N, pw(k)) + '$ : le numérateur est ' + m(N) + '.'];
        }
        X = rng.int(1001, 999999); if (X % 10 === 0) X += rng.int(1, 9);
        var y = R(X / 1000), r = rng.pick([-3, -2, -1, 0, 1]);
        if (y < 10 && r === 1) r = -2;
        var ch = chiffreDec(X, r);
        return {
          enonce: e1 + '<br>b) Donner le chiffre des ' + RANGS_DEC[String(r)] + ' du nombre ' + m(y) + '.',
          questions: [q1, qnum('Chiffre des ' + RANGS_DEC[String(r)] + ' de ' + m(y) + ' :', ch)],
          indices: ['$\\dfrac{1}{10} = 0{,}1$ (un dixième), $\\dfrac{1}{100} = 0{,}01$ (un centième), $\\dfrac{1}{1\\,000} = 0{,}001$ (un millième).', 'Après la virgule viennent, dans l\'ordre : les dixièmes, les centièmes, les millièmes.'],
          solution: s1.concat(['Dans ' + m(y) + ', partie entière : ' + m(Math.floor(X / 1000)) + ' ; après la virgule : chiffre des dixièmes ' + chiffreDec(X, -1) + ', des centièmes ' + chiffreDec(X, -2) + ', des millièmes ' + chiffreDec(X, -3) + '.', 'Le chiffre des ' + RANGS_DEC[String(r)] + ' est donc ' + m(ch) + '.'])
        };
      }
      if (niveau === 2) {
        var a = rng.int(0, 30), t = rng.int(3, 8);
        var A = a * 1000 + t * 100;
        var B = a * 1000 + (t - 1) * 100 + rng.int(1, 9) * 10;
        var C;
        do { C = a * 1000 + (t - 1) * 100 + rng.int(0, 9) * 10 + rng.int(1, 9); } while (C === B);
        var Dd = a * 1000 + rng.int(1, 9) * 10 + (rng.bool() ? rng.int(1, 9) : 0);
        var nums = [A, B, C, Dd].map(function (v) { return R(v / 1000); });
        if (rng.bool()) {
          var max = rng.bool();
          var bonne = max ? nums[0] : nums[3];
          return {
            enonce: 'On donne les nombres : ' + rng.shuffle(nums).map(m).join(' ; ') + '.<br>Quel est le plus ' + (max ? 'grand' : 'petit') + ' de ces nombres ?',
            questions: [qcm(rng, m(bonne), nums.filter(function (v) { return v !== bonne; }).map(m), 'Le plus ' + (max ? 'grand' : 'petit') + ' :')],
            indices: ['Compare d\'abord les parties entières, puis les chiffres des dixièmes, puis des centièmes…', 'Un nombre qui a plus de chiffres après la virgule n\'est pas forcément plus grand !'],
            solution: [
              'Tous ces nombres ont la même partie entière ' + m(a) + '.',
              'On compare les chiffres des dixièmes : ' + nums.map(function (v, j) { return m(v) + ' → ' + chiffreDec([A, B, C, Dd][j], -1); }).join(' ; ') + '.',
              'Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + m(bonne) + '. (Astuce : écris tous les nombres avec 3 chiffres après la virgule, par exemple ' + m(nums[0]) + ' $= ' + T.num(a) + '{,}' + String(t) + '00$.)'
            ]
          };
        }
        var tri = nums.slice().sort(function (u1, u2) { return u1 - u2; });
        var bonneO = tri.map(function (v) { return n(v); }).join(' < ');
        var parLongueur = nums.slice().sort(function (u1, u2) { return String(u1).length - String(u2).length || u1 - u2; }).map(function (v) { return n(v); }).join(' < ');
        var inverse = tri.slice().reverse().map(function (v) { return n(v); }).join(' < ');
        var autre = [tri[0], tri[2], tri[1], tri[3]].map(function (v) { return n(v); }).join(' < ');
        return {
          enonce: 'Ranger dans l\'ordre croissant les nombres : ' + rng.shuffle(nums).map(m).join(' ; ') + '.',
          questions: [qcm(rng, '$' + bonneO + '$', ['$' + parLongueur + '$', '$' + inverse + '$', '$' + autre + '$'], 'Ordre croissant :')],
          indices: ['L\'ordre croissant va du plus petit au plus grand.', 'Écris tous les nombres avec le même nombre de chiffres après la virgule (complète par des zéros).'],
          solution: [
            'On écrit les nombres avec trois chiffres après la virgule : ' + [A, B, C, Dd].map(function (v) { return '$' + T.num(Math.floor(v / 1000)) + '{,}' + String(v % 1000 + 1000).slice(1) + '$'; }).join(' ; ') + '.',
            'On compare alors les parties décimales comme des nombres entiers.',
            'Ordre croissant : $' + bonneO + '$.'
          ]
        };
      }
      // niveau 3 : arrondi et encadrement
      do { X = rng.int(1001, 99999); } while (X % 10 === 0);
      x = R(X / 1000);
      var rg = rng.pick([0, -1, -2]);
      var div = pw(3 + rg), qq = Math.floor(X / div), reste = X % div, arr = R((reste * 2 >= div ? qq + 1 : qq) * div / 1000);
      var suivant = chiffreDec(X, rg - 1);
      var nomR = rg === 0 ? 'à l\'unité' : rg === -1 ? 'au dixième' : 'au centième';
      var inf = R(Math.floor(X / 10) / 100), sup = R(inf + 0.01);
      return {
        enonce: 'On considère le nombre ' + m(x) + '.<br>a) Donner l\'arrondi de ce nombre ' + nomR + '.<br>b) Encadrer ce nombre entre deux nombres décimaux consécutifs ayant deux chiffres après la virgule (encadrement au centième).',
        questions: [qnum('Arrondi ' + nomR + ' :', arr), qnum('Borne inférieure :', inf), qnum('Borne supérieure :', sup)],
        indices: ['Pour arrondir, regarde le chiffre juste après le rang demandé : s\'il vaut 5 ou plus, on arrondit au-dessus.', 'Encadrement au centième : $\\ldots \\leq ' + n(x) + ' < \\ldots$ avec un écart de $0{,}01$.'],
        solution: [
          'Le chiffre qui suit le rang ' + (rg === 0 ? 'des unités' : rg === -1 ? 'des dixièmes' : 'des centièmes') + ' est ' + m(suivant) + (suivant >= 5 ? ' : il est supérieur ou égal à 5, on arrondit à la valeur supérieure.' : ' : il est inférieur à 5, on garde la valeur inférieure.'),
          'Arrondi ' + nomR + ' : ' + m(arr) + '.',
          'En gardant deux chiffres après la virgule : $' + n(inf) + ' \\leq ' + n(x) + ' < ' + n(sup) + '$.'
        ]
      };
    }
  });

  /* ---------- 17. Calculs avec les décimaux ---------- */
  function fixe(x, d) {
    var s = R(x).toFixed(d).split('.');
    var ip = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    return ip + (s[1] ? '{,}' + s[1] : '');
  }
  function nbDec(x) { var s = String(R(x)); var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }

  EM.gen.register({
    id: '6e-calcul-decimaux',
    titre: 'Addition, soustraction, multiplication et division de nombres décimaux',
    chapitres: ['6e-operations', 'cm2-fractions', 'cm2-operations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, res, p, q, A, B;
      if (niveau === 1) {
        p = rng.int(1, 3); q = rng.intExcept(0, 3, [p]);
        A = rng.int(pw(p) + 1, 999 * pw(p)); B = rng.int(Math.max(1, pw(q)), 99 * pw(q) + 9);
        a = R(A / pw(p)); b = R(B / pw(q));
        var plus = rng.bool() || b >= a;
        res = plus ? R(a + b) : R(a - b);
        var dmax = Math.max(nbDec(a), nbDec(b));
        var ctx = rng.bool(0.3);
        if (ctx) { plus = true; a = R(rng.int(5, 45) / 10); b = R(rng.int(105, 395) / 100); res = R(a + b); dmax = 2; }
        var pers = personne(rng);
        return {
          enonce: ctx ? pers.nom + ' achète ' + u(a, 'kg') + ' de poisson à Kayar et ' + u(b, 'kg') + ' de légumes au marché.<br>Calculer la masse totale de ses achats.' : 'Calculer : $' + n(a) + (plus ? ' + ' : ' - ') + n(b) + '$.',
          questions: [qnum(ctx ? 'Masse totale (kg) :' : 'Résultat :', res, ctx ? 'kg' : null)],
          indices: ['Pose l\'opération en alignant les virgules.', 'Complète par des zéros pour avoir le même nombre de chiffres après la virgule.'],
          solution: [
            'On aligne les virgules et on complète par des zéros : $' + fixe(a, dmax) + (plus ? ' + ' : ' - ') + fixe(b, dmax) + '$.',
            'On calcule comme avec des entiers, puis on place la virgule sous les virgules : $' + n(a) + (plus ? ' + ' : ' - ') + n(b) + ' = ' + n(res) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        if (rng.bool(0.35)) {
          a = R(rng.int(11, 99999) / pw(rng.int(1, 3)));
          var f = rng.pick([10, 100, 1000, 0.1, 0.01]);
          res = R(a * f);
          var dep = f >= 1 ? String(f).length - 1 : String(f).length - 2;
          return {
            enonce: 'Calculer : $' + n(a) + ' \\times ' + n(f) + '$.',
            questions: [qnum('Résultat :', res)],
            indices: [f >= 1 ? 'Multiplier par ' + m(f) + ', c\'est déplacer la virgule vers la droite.' : 'Multiplier par ' + m(f) + ', c\'est diviser par ' + m(R(1 / f)) + ' : la virgule se déplace vers la gauche.'],
            solution: [
              f >= 1 ? 'Multiplier par ' + m(f) + ' revient à déplacer la virgule de ' + dep + ' rang' + (dep > 1 ? 's' : '') + ' vers la droite (en ajoutant des zéros si nécessaire).' : 'Multiplier par ' + m(f) + ' revient à diviser par ' + m(R(1 / f)) + ' : on déplace la virgule de ' + dep + ' rang' + (dep > 1 ? 's' : '') + ' vers la gauche.',
              '$' + n(a) + ' \\times ' + n(f) + ' = ' + n(res) + '$.'
            ]
          };
        }
        p = rng.int(1, 2); q = rng.int(0, 1);
        A = rng.int(11, 999); B = rng.int(2, q ? 99 : 49);
        if (A % 10 === 0) A += 1;
        if (q && B % 10 === 0) B += 1;
        a = R(A / pw(p)); b = R(B / pw(q)); res = R(a * b);
        return {
          enonce: 'Calculer : $' + n(a) + ' \\times ' + n(b) + '$.',
          questions: [qnum('Produit :', res)],
          indices: ['Calcule d\'abord le produit sans t\'occuper des virgules.', 'Le résultat a autant de chiffres après la virgule que les deux facteurs réunis.'],
          solution: [
            'Sans les virgules : $' + n(A) + ' \\times ' + n(B) + ' = ' + n(A * B) + '$.',
            m(a) + ' a ' + p + ' chiffre' + (p > 1 ? 's' : '') + ' après la virgule' + (q ? ' et ' + m(b) + ' en a 1' : '') + ' : le produit doit en avoir ' + (p + q) + '.',
            '$' + n(a) + ' \\times ' + n(b) + ' = ' + fixe(A * B / pw(p + q), p + q) + (nbDec(res) < p + q ? ' = ' + n(res) : '') + '$.'
          ]
        };
      }
      if (rng.bool()) {
        b = rng.pick([2, 3, 4, 5, 6, 8, 12, 15, 25]);
        var Q = rng.int(101, 9999); if (Q % 10 === 0) Q += 3;
        var qv = R(Q / 100); a = R(qv * b);
        var pp = personne(rng), ctx2 = rng.bool(0.4);
        return {
          enonce: ctx2 ? pp.nom + ' partage un coupon de tissu de ' + u(a, 'm') + ' en ' + m(b) + ' morceaux de même longueur.<br>Calculer la longueur d\'un morceau.' : 'Calculer : $' + n(a) + ' \\div ' + n(b) + '$.',
          questions: [qnum(ctx2 ? 'Longueur (m) :' : 'Quotient :', qv, ctx2 ? 'm' : null)],
          indices: ['Pose la division : quand tu abaisses le premier chiffre après la virgule du dividende, place la virgule au quotient.', 'Vérifie en multipliant le quotient par ' + m(b) + '.'],
          solution: [
            'On divise ' + m(a) + ' par ' + m(b) + ' : on effectue la division de la partie entière, puis on place la virgule au quotient en abaissant le chiffre des dixièmes.',
            '$' + n(a) + ' \\div ' + n(b) + ' = ' + n(qv) + '$.',
            'Vérification : $' + n(qv) + ' \\times ' + n(b) + ' = ' + n(a) + '$.'
          ]
        };
      }
      b = rng.pick([4, 5, 8, 20, 25, 40]);
      do { a = rng.int(3, 199); } while (a % b === 0);
      res = R(a / b);
      return {
        enonce: 'Calculer le quotient décimal exact : $' + n(a) + ' \\div ' + n(b) + '$.',
        questions: [qnum('Quotient :', res)],
        indices: ['Quand la division des entiers ne tombe pas juste, ajoute une virgule et des zéros au dividende : $' + n(a) + ' = ' + n(a) + '{,}000$.'],
        solution: [
          'On écrit $' + n(a) + ' = ' + n(a) + '{,}000$ et on poursuit la division après la virgule jusqu\'à obtenir un reste nul.',
          '$' + n(a) + ' \\div ' + n(b) + ' = ' + n(res) + '$.',
          'Vérification : $' + n(res) + ' \\times ' + n(b) + ' = ' + n(a) + '$.'
        ]
      };
    }
  });

  /* ---------- 18. Priorités opératoires ---------- */
  EM.gen.register({
    id: '6e-priorites',
    titre: 'Enchaînements d\'opérations et parenthèses',
    chapitres: ['6e-operations', '6e-entiers'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, d, e, expr, steps, res, forme;
      if (niveau === 1) {
        forme = rng.int(0, 6);
        a = rng.int(2, 30); b = rng.int(2, 12); c = rng.int(2, 12);
        switch (forme) {
          case 0: res = a + b * c; expr = n(a) + ' + ' + n(b) + ' \\times ' + n(c); steps = ['La multiplication est prioritaire : $' + n(b) + ' \\times ' + n(c) + ' = ' + n(b * c) + '$.', 'Puis $' + n(a) + ' + ' + n(b * c) + ' = ' + n(res) + '$.']; break;
          case 1: if (a * b <= c) a = c; res = a * b - c; expr = n(a) + ' \\times ' + n(b) + ' - ' + n(c); steps = ['La multiplication est prioritaire : $' + n(a) + ' \\times ' + n(b) + ' = ' + n(a * b) + '$.', 'Puis $' + n(a * b) + ' - ' + n(c) + ' = ' + n(res) + '$.']; break;
          case 2: res = (a + b) * c; expr = '(' + n(a) + ' + ' + n(b) + ') \\times ' + n(c); steps = ['On calcule d\'abord entre parenthèses : $' + n(a) + ' + ' + n(b) + ' = ' + n(a + b) + '$.', 'Puis $' + n(a + b) + ' \\times ' + n(c) + ' = ' + n(res) + '$.']; break;
          case 3: a = rng.int(b + 1, 60); res = a - b + c; expr = n(a) + ' - ' + n(b) + ' + ' + n(c); steps = ['Il n\'y a que des additions et des soustractions : on calcule de gauche à droite.', '$' + n(a) + ' - ' + n(b) + ' = ' + n(a - b) + '$, puis $' + n(a - b) + ' + ' + n(c) + ' = ' + n(res) + '$.']; break;
          case 4: b = rng.int(c + 1, 25); res = a * (b - c); expr = n(a) + ' \\times (' + n(b) + ' - ' + n(c) + ')'; steps = ['On calcule d\'abord entre parenthèses : $' + n(b) + ' - ' + n(c) + ' = ' + n(b - c) + '$.', 'Puis $' + n(a) + ' \\times ' + n(b - c) + ' = ' + n(res) + '$.']; break;
          case 5: b = c * rng.int(2, 12); res = a + b / c; expr = n(a) + ' + ' + n(b) + ' \\div ' + n(c); steps = ['La division est prioritaire : $' + n(b) + ' \\div ' + n(c) + ' = ' + n(b / c) + '$.', 'Puis $' + n(a) + ' + ' + n(b / c) + ' = ' + n(res) + '$.']; break;
          default: a = b * c + rng.int(1, 40); res = a - b * c; expr = n(a) + ' - ' + n(b) + ' \\times ' + n(c); steps = ['La multiplication est prioritaire : $' + n(b) + ' \\times ' + n(c) + ' = ' + n(b * c) + '$.', 'Puis $' + n(a) + ' - ' + n(b * c) + ' = ' + n(res) + '$.'];
        }
        return {
          enonce: 'Calculer en respectant les priorités : $$A = ' + expr + '$$',
          questions: [qnum('$A =$', res)],
          indices: ['On effectue d\'abord les calculs entre parenthèses.', 'Puis les multiplications et les divisions, avant les additions et les soustractions.'],
          solution: steps.concat(['Donc $A = ' + n(res) + '$.'])
        };
      }
      if (rng.bool(0.3)) {
        a = rng.int(3, 12); b = rng.int(2, 15); c = rng.int(2, 15);
        var ops = rng.pick([['le produit de ' + a + ' par la somme de ' + b + ' et ' + c, a + ' \\times (' + b + ' + ' + c + ')', [a + ' \\times ' + b + ' + ' + c, '(' + a + ' + ' + b + ') \\times ' + c, a + ' + ' + b + ' \\times ' + c]],
          ['la somme de ' + a + ' et du produit de ' + b + ' par ' + c, a + ' + ' + b + ' \\times ' + c, ['(' + a + ' + ' + b + ') \\times ' + c, a + ' \\times (' + b + ' + ' + c + ')', a + ' \\times ' + b + ' + ' + c]],
          ['le produit de la somme de ' + a + ' et ' + b + ' par ' + c, '(' + a + ' + ' + b + ') \\times ' + c, [a + ' + ' + b + ' \\times ' + c, a + ' \\times (' + b + ' + ' + c + ')', a + ' \\times ' + b + ' + ' + c]]]);
        return {
          enonce: 'Choisir l\'expression qui traduit la phrase : « ' + ops[0] + ' ».',
          questions: [qcm(rng, '$' + ops[1] + '$', ops[2].map(function (s) { return '$' + s + '$'; }), 'Expression :')],
          indices: ['Repère la dernière opération effectuée : c\'est elle qui donne son nom à l\'expression (somme, produit…).', 'Utilise des parenthèses pour qu\'une somme soit calculée avant un produit.'],
          solution: ['La phrase commence par « ' + ops[0].split(' de ')[0] + ' » : c\'est la dernière opération à effectuer.', 'L\'expression correcte est $' + ops[1] + '$.']
        };
      }
      forme = rng.int(0, 3);
      a = rng.int(2, 15); b = rng.int(2, 15); c = rng.int(5, 20); d = rng.int(1, c - 1); e = rng.int(2, 9);
      switch (forme) {
        case 0: res = (a + b) * (c - d); expr = '(' + n(a) + ' + ' + n(b) + ') \\times (' + n(c) + ' - ' + n(d) + ')'; steps = ['Parenthèses : $' + n(a) + ' + ' + n(b) + ' = ' + n(a + b) + '$ et $' + n(c) + ' - ' + n(d) + ' = ' + n(c - d) + '$.', 'Puis $' + n(a + b) + ' \\times ' + n(c - d) + ' = ' + n(res) + '$.']; break;
        case 1: res = a * b + c * d; expr = n(a) + ' \\times ' + n(b) + ' + ' + n(c) + ' \\times ' + n(d); steps = ['Les multiplications d\'abord : $' + n(a) + ' \\times ' + n(b) + ' = ' + n(a * b) + '$ et $' + n(c) + ' \\times ' + n(d) + ' = ' + n(c * d) + '$.', 'Puis $' + n(a * b) + ' + ' + n(c * d) + ' = ' + n(res) + '$.']; break;
        case 2:
          var s = e * rng.int(2, 9); b = rng.int(1, s - 1); c = s - b; a = s / e + rng.int(1, 30);
          res = a - s / e; expr = n(a) + ' - (' + n(b) + ' + ' + n(c) + ') \\div ' + n(e);
          steps = ['Parenthèses : $' + n(b) + ' + ' + n(c) + ' = ' + n(s) + '$.', 'Division (prioritaire sur la soustraction) : $' + n(s) + ' \\div ' + n(e) + ' = ' + n(s / e) + '$.', 'Puis $' + n(a) + ' - ' + n(s / e) + ' = ' + n(res) + '$.'];
          break;
        default:
          d = rng.int(1, 9); c = d + rng.int(1, 6); b = rng.int(2, 9); a = rng.int(2, 9);
          var in1 = c - d, in2 = b * in1;
          e = rng.int(1, 20);
          res = a * (e + in2); expr = n(a) + ' \\times [' + n(e) + ' + ' + n(b) + ' \\times (' + n(c) + ' - ' + n(d) + ')]';
          steps = ['On commence par les parenthèses les plus intérieures : $' + n(c) + ' - ' + n(d) + ' = ' + n(in1) + '$.', 'Dans les crochets, la multiplication d\'abord : $' + n(b) + ' \\times ' + n(in1) + ' = ' + n(in2) + '$, puis $' + n(e) + ' + ' + n(in2) + ' = ' + n(e + in2) + '$.', 'Enfin $' + n(a) + ' \\times ' + n(e + in2) + ' = ' + n(res) + '$.'];
      }
      return {
        enonce: 'Calculer en respectant les priorités : $$B = ' + expr + '$$',
        questions: [qnum('$B =$', res)],
        indices: ['Commence par les parenthèses (les plus intérieures d\'abord).', 'Ensuite les multiplications et divisions, enfin les additions et soustractions.'],
        solution: steps.concat(['Donc $B = ' + n(res) + '$.'])
      };
    }
  });

  /* ---------- 19. Multiples, diviseurs, critères de divisibilité ---------- */
  function sommeChiffres(x) { return String(x).split('').reduce(function (s, c) { return s + parseInt(c, 10); }, 0); }
  function critere(x, d) {
    var s = String(x), oui = x % d === 0;
    switch (d) {
      case 2: return m(x) + ' se termine par ' + s.slice(-1) + (oui ? ' (chiffre pair) : divisible par 2.' : ' (chiffre impair) : non divisible par 2.');
      case 5: return m(x) + ' se termine par ' + s.slice(-1) + (oui ? ' : divisible par 5.' : ' (ni 0 ni 5) : non divisible par 5.');
      case 10: return m(x) + ' se termine par ' + s.slice(-1) + (oui ? ' : divisible par 10.' : ' (pas par 0) : non divisible par 10.');
      case 3:
      case 9: return 'Somme des chiffres de ' + m(x) + ' : $' + s.split('').join(' + ') + ' = ' + sommeChiffres(x) + '$, ' + (oui ? '' : 'non ') + 'divisible par ' + d + (oui ? ' : ' + m(x) + ' est divisible par ' + d + '.' : ' : ' + m(x) + ' n\'est pas divisible par ' + d + '.');
      case 4: return 'Les deux derniers chiffres de ' + m(x) + ' forment ' + m(parseInt(s.slice(-2), 10)) + ', ' + (oui ? '' : 'non ') + 'divisible par 4' + (oui ? ' : divisible par 4.' : ' : non divisible par 4.');
      default: return m(x) + ' se termine par ' + s.slice(-2) + (oui ? ' : divisible par 25.' : ' (ni 00, ni 25, ni 50, ni 75) : non divisible par 25.');
    }
  }
  var REGLES = {
    2: 'Un nombre est divisible par 2 si son chiffre des unités est 0, 2, 4, 6 ou 8.',
    3: 'Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3.',
    4: 'Un nombre est divisible par 4 si le nombre formé par ses deux derniers chiffres est divisible par 4.',
    5: 'Un nombre est divisible par 5 si son chiffre des unités est 0 ou 5.',
    9: 'Un nombre est divisible par 9 si la somme de ses chiffres est divisible par 9.',
    10: 'Un nombre est divisible par 10 si son chiffre des unités est 0.',
    25: 'Un nombre est divisible par 25 s\'il se termine par 00, 25, 50 ou 75.'
  };

  EM.gen.register({
    id: '6e-divisibilite',
    titre: 'Multiples, diviseurs et critères de divisibilité',
    chapitres: ['6e-multiples-diviseurs'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var d, x, i;
      if (niveau === 1) {
        d = rng.pick([2, 3, 4, 5, 9, 10, 25]);
        var bon;
        do { bon = rng.int(100, 9999); } while (bon % d !== 0 || (d === 3 && bon % 9 === 0 && rng.bool(0.5)));
        var piege = {
          2: function (v) { return v % 2 === 1; },
          3: function (v) { return v % 3 !== 0 && v % 10 === 3; },
          4: function (v) { return v % 2 === 0 && v % 4 !== 0; },
          5: function (v) { return v % 5 !== 0; },
          9: function (v) { return v % 3 === 0 && v % 9 !== 0; },
          10: function (v) { return v % 5 === 0 && v % 10 !== 0; },
          25: function (v) { return v % 5 === 0 && v % 25 !== 0; }
        }[d];
        var faux = [], guard = 0;
        while (faux.length < 3 && guard < 2000) {
          x = rng.int(100, 9999); guard++;
          if (x % d === 0 || faux.indexOf(x) >= 0 || x === bon) continue;
          if (faux.length < 2 && !piege(x) && guard < 1500) continue;
          faux.push(x);
        }
        var tous = rng.shuffle([bon].concat(faux));
        return {
          enonce: 'Parmi les nombres suivants, un seul est divisible par ' + m(d) + '. Lequel ?',
          questions: [qcm(rng, m(bon), faux.map(m), 'Nombre divisible par ' + d + ' :')],
          indices: [REGLES[d]],
          solution: [REGLES[d]].concat(tous.map(function (v) { return critere(v, d); })).concat(['Le nombre divisible par ' + m(d) + ' est ' + m(bon) + '.'])
        };
      }
      if (niveau === 2) {
        var N = rng.pick([12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 52, 54, 56, 60, 63, 64, 66, 70, 72, 75, 78, 80, 84, 88, 90, 96, 98, 100]);
        var divs = EM.ar.divisors(N), paires = [];
        for (i = 1; i * i <= N; i++) if (N % i === 0) paires.push('$' + N + ' = ' + i + ' \\times ' + (N / i) + '$');
        return {
          enonce: 'Donner la liste de tous les diviseurs de ' + m(N) + '.',
          questions: [{ label: 'Diviseurs de ' + N + ' :', type: 'set', reponse: divs }],
          indices: ['Cherche les produits de deux entiers égaux à ' + m(N) + ' : $1 \\times ' + N + '$, $2 \\times \\ldots$', 'Arrête-toi quand le premier facteur dépasse le second.'],
          solution: ['On cherche les écritures de ' + m(N) + ' comme produit de deux entiers : ' + paires.join(' ; ') + '.', 'Les diviseurs de ' + m(N) + ' sont : $' + T.set(divs) + '$ (' + divs.length + ' diviseurs).'],
          aide: 'Sépare les diviseurs par « ; ».'
        };
      }
      if (rng.bool(0.6)) {
        var cas = rng.pick([3, 9, 6]);
        var L = rng.int(3, 4), pos, digs, sols, g = 0;
        do {
          digs = [rng.int(1, 9)];
          for (i = 1; i < L; i++) digs.push(rng.int(0, 9));
          pos = cas === 6 ? L - 1 : rng.int(1, L - 1);
          sols = [];
          for (var c = 0; c <= 9; c++) {
            var t = digs.slice(); t[pos] = c;
            var v = parseInt(t.join(''), 10);
            if (v % cas === 0) sols.push(c);
          }
          g++;
        } while (!sols.length && g < 50);
        var aff = digs.map(function (c2, j) { return j === pos ? '\\square' : String(c2); }).join('');
        var base = digs.reduce(function (s, c2, j) { return j === pos ? s : s + c2; }, 0);
        return {
          enonce: 'On considère le nombre $' + aff + '$ dont un chiffre est caché par $\\square$.<br>Donner toutes les valeurs possibles du chiffre caché pour que ce nombre soit divisible par ' + (cas === 6 ? '2 et par 3' : m(cas)) + '.',
          questions: [{ label: 'Chiffres possibles :', type: 'set', reponse: sols }],
          indices: [cas === 6 ? 'Divisible par 2 : le chiffre des unités est pair. Divisible par 3 : la somme des chiffres est un multiple de 3.' : REGLES[cas], 'Teste les chiffres de 0 à 9.'],
          solution: [
            'Somme des chiffres connus : ' + m(base) + '. Il faut que ' + m(base) + ' + (chiffre caché) soit un multiple de ' + (cas === 9 ? 9 : 3) + (cas === 6 ? ', et que le chiffre caché (chiffre des unités) soit pair' : '') + '.',
            'Les chiffres qui conviennent sont : ' + sols.map(function (s2) { return m(s2); }).join(' ; ') + '.'
          ],
          aide: 'Sépare les chiffres par « ; ».'
        };
      }
      d = rng.int(6, 19); var Nn = rng.int(100, 999);
      var plus = d * (Math.floor(Nn / d) + 1);
      return {
        enonce: 'Donner le plus petit multiple de ' + m(d) + ' strictement supérieur à ' + m(Nn) + '.',
        questions: [qnum('Multiple :', plus)],
        indices: ['Effectue la division euclidienne de ' + m(Nn) + ' par ' + m(d) + '.', 'Le multiple suivant est $' + d + ' \\times (q + 1)$.'],
        solution: [
          'Division euclidienne : $' + n(Nn) + ' = ' + d + ' \\times ' + Math.floor(Nn / d) + ' + ' + (Nn % d) + '$.',
          'Le multiple suivant de ' + m(d) + ' est $' + d + ' \\times ' + (Math.floor(Nn / d) + 1) + ' = ' + n(plus) + '$.'
        ]
      };
    }
  });

  /* ---------- 20. Fractions ---------- */
  EM.gen.register({
    id: '6e-fractions',
    titre: 'Fractions égales, simplification, comparaison et somme',
    chapitres: ['6e-fractions', 'cm2-fractions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var ab = fracSimple(rng), a = ab[0], b = ab[1], k, x;
      if (rng.bool(0.3)) { a = rng.int(b + 1, 3 * b); if (EM.ar.gcd(a, b) !== 1) a = b + 1; }
      if (niveau === 1) {
        k = rng.int(2, 9);
        var cas = rng.int(0, 2), eq, rep;
        if (cas === 0) { eq = fr(a, b) + ' = \\dfrac{\\ldots}{' + (b * k) + '}'; rep = a * k; }
        else if (cas === 1) { eq = fr(a, b) + ' = \\dfrac{' + (a * k) + '}{\\ldots}'; rep = b * k; }
        else { eq = fr(a * k, b * k) + ' = \\dfrac{' + a + '}{\\ldots}'; rep = b; }
        return {
          enonce: 'Compléter l\'égalité : $$' + eq + '$$',
          questions: [qnum('Nombre manquant :', rep)],
          indices: ['On ne change pas une fraction en multipliant (ou en divisant) son numérateur et son dénominateur par un même nombre non nul.', 'Cherche par quel nombre on a multiplié (ou divisé).'],
          solution: [
            cas === 2 ? 'Le numérateur ' + m(a * k) + ' a été divisé par ' + m(k) + ' pour obtenir ' + m(a) + '.' : 'On passe de ' + m(cas === 0 ? b : a) + ' à ' + m(cas === 0 ? b * k : a * k) + ' en multipliant par ' + m(k) + '.',
            'On fait la même chose à l\'autre terme : le nombre manquant est ' + m(rep) + '.',
            '$' + fr(a, b) + ' = \\dfrac{' + a + ' \\times ' + k + '}{' + b + ' \\times ' + k + '} = ' + fr(a * k, b * k) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        k = rng.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]);
        var Nn = a * k, Dn = b * k, chaine = [fr(Nn, Dn)], cur = [Nn, Dn], fs = EM.ar.primeFactors(k), divs = [];
        fs.forEach(function (p) { cur = [cur[0] / p, cur[1] / p]; chaine.push(fr(cur[0], cur[1])); divs.push(p); });
        return {
          enonce: 'Écrire la fraction $' + fr(Nn, Dn) + '$ sous forme irréductible.',
          questions: [qnum('Numérateur :', a), qnum('Dénominateur :', b)],
          indices: ['Utilise les critères de divisibilité (par 2, 3, 5…) pour trouver un diviseur commun.', 'Continue jusqu\'à ce qu\'il n\'y ait plus de diviseur commun autre que 1.'],
          solution: [
            'On divise successivement le numérateur et le dénominateur par ' + divs.map(function (p) { return m(p); }).join(', puis par ') + ' : $' + chaine.join(' = ') + '$.',
            'Directement : $' + n(Nn) + ' = ' + k + ' \\times ' + a + '$ et $' + n(Dn) + ' = ' + k + ' \\times ' + b + '$, donc $' + fr(Nn, Dn) + ' = ' + fr(a, b) + '$.',
            m(a) + ' et ' + m(b) + ' n\'ont pas d\'autre diviseur commun que 1 : la fraction $' + fr(a, b) + '$ est irréductible.'
          ],
          aide: 'Donne le numérateur et le dénominateur de la fraction irréductible.'
        };
      }
      if (rng.bool()) {
        var t = rng.int(0, 2), f1, f2, sym, expl;
        if (t === 0) {
          var dd = rng.int(3, 15), n1 = rng.int(1, 3 * dd), n2 = rng.intExcept(1, 3 * dd, [n1]);
          f1 = fr(n1, dd); f2 = fr(n2, dd); sym = n1 < n2 ? '<' : '>';
          expl = 'Les deux fractions ont le même dénominateur ' + m(dd) + ' : la plus grande est celle qui a le plus grand numérateur. Comme $' + n1 + ' ' + sym + ' ' + n2 + '$, on a $' + f1 + ' ' + sym + ' ' + f2 + '$.';
        } else if (t === 1) {
          var nn = rng.int(1, 9), d1 = rng.int(2, 15), d2 = rng.intExcept(2, 15, [d1]);
          f1 = fr(nn, d1); f2 = fr(nn, d2); sym = d1 > d2 ? '<' : '>';
          expl = 'Les deux fractions ont le même numérateur ' + m(nn) + ' : la plus grande est celle qui a le plus petit dénominateur (on partage en moins de parts, donc les parts sont plus grandes). Donc $' + f1 + ' ' + sym + ' ' + f2 + '$.';
        } else {
          var den = rng.int(2, 15), num = rng.intExcept(1, 30, [den]);
          f1 = fr(num, den); f2 = '1'; sym = num < den ? '<' : '>';
          expl = 'Une fraction est inférieure à 1 quand son numérateur est plus petit que son dénominateur, supérieure à 1 sinon. Ici $' + num + ' ' + sym + ' ' + den + '$, donc $' + f1 + ' ' + sym + ' 1$.';
        }
        return {
          enonce: 'Comparer : $$' + f1 + ' \\quad \\ldots \\quad ' + f2 + '$$',
          questions: [qcm(rng, '$' + sym + '$', ['$<$', '$>$', '$=$'], 'Symbole :')],
          indices: ['Regarde si les fractions ont le même dénominateur ou le même numérateur.', 'Tu peux aussi comparer chaque fraction à 1.'],
          solution: [expl]
        };
      }
      var D = rng.int(3, 15), p1, p2, plus = rng.bool(), gf = 0;
      do {
        p1 = rng.int(1, 2 * D); p2 = rng.int(1, 2 * D); gf++;
      } while ((EM.ar.gcd(p1, D) !== 1 || EM.ar.gcd(p2, D) !== 1 || (!plus && p2 >= p1)) && gf < 200);
      if (!plus && p2 >= p1) { p1 = D + 1; p2 = 1; }
      var num2 = plus ? p1 + p2 : p1 - p2, resF = F(num2, D);
      return {
        enonce: 'Calculer et donner le résultat sous forme de fraction simplifiée si possible : $$' + fr(p1, D) + (plus ? ' + ' : ' - ') + fr(p2, D) + '$$',
        questions: [{ label: 'Résultat :', type: 'number', reponse: resF }],
        indices: ['Les fractions ont le même dénominateur : on ' + (plus ? 'additionne' : 'soustrait') + ' les numérateurs et on garde le dénominateur.'],
        solution: [
          '$' + fr(p1, D) + (plus ? ' + ' : ' - ') + fr(p2, D) + ' = \\dfrac{' + p1 + (plus ? ' + ' : ' - ') + p2 + '}{' + D + '} = ' + fr(num2, D) + (resF.d !== D || resF.isInt() ? ' = ' + resF.tex() : '') + '$.',
          resF.d !== D ? 'On a simplifié par ' + m(D / resF.d) + '.' : 'Le résultat ne se simplifie pas.'
        ],
        aide: 'Tu peux écrire une fraction comme 7/5.'
      };
    }
  });

  /* ---------- 21. Diagramme en barres ---------- */
  var JEUX = [
    { titre: 'Poisson débarqué au quai de pêche de Kayar (en caisses)', cats: ['Lundi', 'Mardi', 'Merc.', 'Jeudi', 'Vend.'], noms: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'], unite: 'caisses', pas: 10, max: 90 },
    { titre: 'Fruits vendus au marché Tilène (en kg)', cats: ['Mangues', 'Oranges', 'Bananes', 'Papayes', 'Goyaves'], noms: ['mangues', 'oranges', 'bananes', 'papayes', 'goyaves'], unite: 'kg', pas: 10, max: 90 },
    { titre: 'Effectifs des classes d\'une école de Louga', cats: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'], noms: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'], unite: 'élèves', pas: 10, max: 70 },
    { titre: 'Moyen de transport des élèves d\'un collège de Rufisque', cats: ['À pied', 'Car', 'Vélo', 'Taxi', 'Bus'], noms: ['à pied', 'en car rapide', 'à vélo', 'en taxi', 'en bus'], unite: 'élèves', pas: 20, max: 180 }
  ];
  EM.gen.register({
    id: '6e-diagramme-barres',
    titre: 'Lire et exploiter un diagramme en barres',
    chapitres: ['6e-donnees'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var J = rng.pick(JEUX), nC = J.cats.length, vals = [], i, pasV = niveau === 1 ? J.pas : J.pas / 2;
      var usedMax = false;
      var gd = 0;
      do {
        vals = [];
        for (i = 0; i < nC; i++) vals.push(rng.int(2, J.max / pasV) * pasV);
        gd++;
      } while (niveau === 2 && R(EM.util.sum(vals) / nC, 2) !== R(EM.util.sum(vals) / nC, 6) && gd < 100);
      var fig = diagrammeBarres(J.cats, vals, J.pas, J.titre);
      var leg = 'Le diagramme ci-contre représente : <i>' + J.titre + '</i>. Chaque graduation vaut ' + m(J.pas) + ' ' + J.unite + '.';
      if (niveau === 1) {
        var ij = rng.sample(EM.util.range(0, nC - 1), 2), i1 = ij[0], i2 = ij[1];
        var maxV = Math.max.apply(null, vals);
        if (vals.filter(function (v) { return v === maxV; }).length === 1) usedMax = true;
        var qs = [qnum('Valeur pour « ' + J.cats[i1] + ' » :', vals[i1], J.unite === 'kg' ? 'kg' : null), qnum('Écart entre « ' + J.cats[i1] + ' » et « ' + J.cats[i2] + ' » :', Math.abs(vals[i1] - vals[i2]))];
        var sol = ['La barre « ' + J.cats[i1] + ' » s\'arrête à ' + m(vals[i1]) + ' : ' + u(vals[i1], J.unite) + '.', 'La barre « ' + J.cats[i2] + ' » s\'arrête à ' + m(vals[i2]) + '. Écart : $' + n(Math.max(vals[i1], vals[i2])) + ' - ' + n(Math.min(vals[i1], vals[i2])) + ' = ' + n(Math.abs(vals[i1] - vals[i2])) + '$ ' + J.unite + '.'];
        if (usedMax) {
          var im = vals.indexOf(maxV);
          qs.push(qcm(rng, J.cats[im], J.cats.filter(function (c, j) { return j !== im; }).slice(0, 3), 'Plus grande valeur :'));
          sol.push('La barre la plus haute est « ' + J.cats[im] + ' » (' + m(maxV) + ').');
        }
        return {
          enonce: leg + '<br>Lire la valeur demandée, puis calculer l\'écart entre les deux catégories' + (usedMax ? ' et indiquer la catégorie qui a la plus grande valeur' : '') + '.',
          figure: fig,
          questions: qs,
          indices: ['Suis le haut de la barre horizontalement jusqu\'à l\'axe vertical.', 'L\'écart est la différence entre la plus grande et la plus petite des deux valeurs.'],
          solution: sol
        };
      }
      var S = EM.util.sum(vals);
      return {
        enonce: leg + '<br>Calculer le total, puis la moyenne par catégorie.',
        figure: fig,
        questions: [qnum('Total :', S), qnum('Moyenne :', S / nC)],
        indices: ['Lis chaque valeur avec soin : certaines barres s\'arrêtent entre deux graduations (au milieu).', 'Moyenne = total ÷ nombre de catégories.'],
        solution: [
          'Valeurs lues : ' + J.cats.map(function (c, j) { return c + ' ' + m(vals[j]); }).join(' ; ') + '.',
          'Total : $' + vals.map(n).join(' + ') + ' = ' + n(S) + '$ ' + J.unite + '.',
          'Moyenne : $' + n(S) + ' \\div ' + nC + ' = ' + n(S / nC) + '$ ' + J.unite + '.'
        ]
      };
    }
  });

  /* ---------- 22. Droites, demi-droites, segments ---------- */
  EM.gen.register({
    id: '6e-droites-segments',
    titre: 'Droites, demi-droites, segments : notations et longueurs',
    chapitres: ['6e-droites'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var noms = rng.pick([['A', 'B'], ['E', 'F'], ['M', 'N'], ['R', 'S'], ['K', 'L']]), P = noms[0], Q = noms[1];
      var pente = rng.int(-4, 4) / 10, A = [0, 0], B = [4, 4 * pente];
      var f, svg;
      if (niveau === 1) {
        var t = rng.int(0, 3);
        var bonne = ['$(' + P + Q + ')$', '$[' + P + Q + ']$', '$[' + P + Q + ')$', '$[' + Q + P + ')$'][t];
        var Aext = [A[0] - 2.4, A[1] - 2.4 * pente], Bext = [B[0] + 2.4, B[1] + 2.4 * pente];
        f = EM.fig.fit([Aext, Bext, [0, -1], [0, 1]], { w: 300, h: 120, pad: 10 });
        var loin = function (O, V) { return [O[0] + 6 * (V[0] - O[0]), O[1] + 6 * (V[1] - O[1])]; };
        if (t === 0) f.line(A, B, { accent: true });
        else if (t === 1) f.seg(A, B, { accent: true });
        else if (t === 2) f.seg(A, loin(A, B), { accent: true });
        else f.seg(B, loin(B, A), { accent: true });
        f.point(A, P, 'n').point(B, Q, 'n');
        svg = f.svg();
        var nomsFig = ['la droite $(' + P + Q + ')$ : elle est illimitée des deux côtés', 'le segment $[' + P + Q + ']$ : il est limité par les deux points ' + P + ' et ' + Q, 'la demi-droite $[' + P + Q + ')$ : elle a pour origine ' + P + ' et passe par ' + Q, 'la demi-droite $[' + Q + P + ')$ : elle a pour origine ' + Q + ' et passe par ' + P];
        return {
          enonce: 'Donner la notation de la figure tracée en couleur.',
          figure: svg,
          questions: [qcm(rng, bonne, ['$(' + P + Q + ')$', '$[' + P + Q + ']$', '$[' + P + Q + ')$', '$[' + Q + P + ')$'], 'Notation :')],
          indices: ['Une droite est illimitée des deux côtés ; un segment est limité des deux côtés ; une demi-droite est limitée d\'un seul côté (son origine).', 'Dans la notation d\'une demi-droite, le crochet est du côté de l\'origine, qu\'on écrit en premier.'],
          solution: ['La figure en couleur est ' + nomsFig[t] + '.', 'Sa notation est ' + bonne + '.']
        };
      }
      var cas = rng.int(0, 2), x = rng.int(15, 70) / 10, y = rng.int(15, 70) / 10, C, enonce, rep, lab, sol;
      var N3 = rng.pick(['C', 'I', 'O']);
      if (cas === 0) {
        C = [x + y, 0];
        enonce = 'Les points ' + P + ', ' + Q + ' et ' + N3 + ' sont alignés dans cet ordre (le point ' + Q + ' appartient au segment $[' + P + N3 + ']$). On donne $' + P + Q + ' = ' + n(x) + '$ cm et $' + Q + N3 + ' = ' + n(y) + '$ cm.<br>Calculer la longueur $' + P + N3 + '$.';
        rep = R(x + y); lab = '$' + P + N3 + ' =$';
        sol = ['Comme ' + Q + ' appartient au segment $[' + P + N3 + ']$ : $' + P + N3 + ' = ' + P + Q + ' + ' + Q + N3 + '$.', '$' + P + N3 + ' = ' + n(x) + ' + ' + n(y) + ' = ' + n(rep) + '$ cm.'];
        f = EM.fig.fit([[0, 0], [x + y, 0], [0, 0.6], [0, -0.6]], { w: 300, h: 90, pad: 18 });
        f.seg([0, 0], [x + y, 0]).point([0, 0], P, 'n').point([x, 0], Q, 'n').point([x + y, 0], N3, 'n').segLabel([0, 0], [x, 0], n(x).replace('{,}', ',') + ' cm', { flip: true }).segLabel([x, 0], [x + y, 0], n(y).replace('{,}', ',') + ' cm', { flip: true });
      } else if (cas === 1) {
        var z = R(x + y);
        enonce = 'Le point ' + Q + ' appartient au segment $[' + P + N3 + ']$. On donne $' + P + N3 + ' = ' + n(z) + '$ cm et $' + P + Q + ' = ' + n(x) + '$ cm.<br>Calculer la longueur $' + Q + N3 + '$.';
        rep = R(y); lab = '$' + Q + N3 + ' =$';
        sol = ['Comme ' + Q + ' appartient au segment $[' + P + N3 + ']$ : $' + P + Q + ' + ' + Q + N3 + ' = ' + P + N3 + '$.', 'Donc $' + Q + N3 + ' = ' + P + N3 + ' - ' + P + Q + ' = ' + n(z) + ' - ' + n(x) + ' = ' + n(rep) + '$ cm.'];
        f = EM.fig.fit([[0, 0], [z, 0], [0, 0.6], [0, -0.6]], { w: 300, h: 90, pad: 18 });
        f.seg([0, 0], [z, 0]).point([0, 0], P, 'n').point([x, 0], Q, 'n').point([z, 0], N3, 'n').segLabel([0, 0], [x, 0], n(x).replace('{,}', ',') + ' cm', { flip: true });
      } else {
        var Ltot = rng.int(20, 150) / 10, demi = rng.bool();
        var Mn = 'M';
        enonce = demi ? 'Le point M est le milieu du segment $[' + P + Q + ']$ et $' + P + Q + ' = ' + n(Ltot) + '$ cm.<br>Calculer la longueur $' + P + 'M$.' : 'Le point M est le milieu du segment $[' + P + Q + ']$ et $' + P + 'M = ' + n(Ltot / 2 > 0 ? R(Ltot / 2) : 1) + '$ cm.<br>Calculer la longueur $' + P + Q + '$.';
        rep = demi ? R(Ltot / 2) : R(Ltot); lab = demi ? '$' + P + 'M =$' : '$' + P + Q + ' =$';
        sol = ['Le milieu M d\'un segment $[' + P + Q + ']$ est le point de ce segment situé à égale distance des extrémités : $' + P + 'M = M' + Q + ' = \\dfrac{' + P + Q + '}{2}$.', demi ? '$' + P + 'M = ' + n(Ltot) + ' \\div 2 = ' + n(rep) + '$ cm.' : '$' + P + Q + ' = 2 \\times ' + P + 'M = 2 \\times ' + n(R(Ltot / 2)) + ' = ' + n(rep) + '$ cm.'];
        f = EM.fig.fit([[0, 0], [Ltot, 0], [0, 0.6], [0, -0.6]], { w: 300, h: 90, pad: 18 });
        f.seg([0, 0], [Ltot, 0]).point([0, 0], P, 'n').point([Ltot, 0], Q, 'n').point([Ltot / 2, 0], Mn, 'n').ticks([0, 0], [Ltot / 2, 0], 2).ticks([Ltot / 2, 0], [Ltot, 0], 2);
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: [qnum(lab, rep, 'cm')],
        indices: ['Fais un schéma : place les points sur une même droite dans le bon ordre.', 'Si un point appartient à un segment, il le partage en deux segments dont la somme des longueurs est la longueur totale.'],
        solution: sol
      };
    }
  });

  /* ---------- 23. Perpendiculaires et parallèles ---------- */
  var REL = { perp: '\\perp', par: '\\parallel' };
  function phraseRel(a, b, r) { return '$' + a + ' ' + REL[r] + ' ' + b + '$'; }
  EM.gen.register({
    id: '6e-perp-paralleles',
    titre: 'Droites perpendiculaires et parallèles : déduire',
    chapitres: ['6e-perpendiculaires-paralleles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var D = ['(d_1)', '(d_2)', '(d_3)', '(d_4)', '(d_5)'];
      var CH = ['Elles sont parallèles.', 'Elles sont perpendiculaires.', 'On ne peut pas conclure.'];
      var P1 = 'Si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles entre elles.';
      var P2 = 'Si deux droites sont parallèles, alors toute droite perpendiculaire à l\'une est perpendiculaire à l\'autre.';
      var P3 = 'Si deux droites sont parallèles à une même droite, alors elles sont parallèles entre elles.';
      if (niveau === 1) {
        var ordre = rng.shuffle([0, 1, 2]), x = D[ordre[0]], y = D[ordre[1]], z = D[ordre[2]];
        var cas = rng.pick([0, 0, 1, 1, 2, 2, 3, 3, 4]), hyp, bonne, sol;
        if (cas === 0) { hyp = [phraseRel(x, z, 'perp'), phraseRel(y, z, 'perp')]; bonne = CH[0]; sol = P1; }
        else if (cas === 1) { hyp = [phraseRel(x, z, 'par'), phraseRel(y, z, 'par')]; bonne = CH[0]; sol = P3; }
        else if (cas === 2) { hyp = [phraseRel(x, z, 'par'), phraseRel(y, x, 'perp')]; bonne = CH[1]; sol = P2; }
        else if (cas === 3) { hyp = [phraseRel(x, z, 'perp'), phraseRel(y, z, 'par')]; bonne = CH[1]; sol = P2; }
        else { hyp = ['$' + x + '$ et $' + z + '$ sont sécantes', '$' + y + '$ et $' + z + '$ sont sécantes']; bonne = CH[2]; sol = 'Savoir que deux droites coupent une même troisième droite ne suffit pas : $' + x + '$ et $' + y + '$ peuvent être parallèles, perpendiculaires ou simplement sécantes.'; }
        if (cas === 2) {
          // on demande la relation entre y et z
          return {
            enonce: 'Les droites $' + x + '$, $' + y + '$ et $' + z + '$ sont distinctes. On sait que ' + hyp[0] + ' et ' + hyp[1] + '.<br>Que peut-on dire des droites $' + y + '$ et $' + z + '$ ?',
            questions: [qcm(rng, CH[1], [CH[0], CH[2]], 'Conclusion :')],
            indices: ['Fais une figure à main levée.', 'Cherche la propriété du cours qui utilise une droite parallèle et une droite perpendiculaire.'],
            solution: ['On utilise la propriété : « ' + P2 + ' »', '$' + x + ' \\parallel ' + z + '$ et $' + y + ' \\perp ' + x + '$, donc $' + y + ' \\perp ' + z + '$ : les droites sont perpendiculaires.']
          };
        }
        var concl = cas === 4 ? 'On ne peut rien affirmer.' : cas === 3 ? 'Donc $' + x + ' \\perp ' + y + '$.' : 'Donc $' + x + ' \\parallel ' + y + '$.';
        return {
          enonce: 'Les droites $' + x + '$, $' + y + '$ et $' + z + '$ sont distinctes. On sait que ' + hyp[0] + ' et ' + hyp[1] + '.<br>Que peut-on dire des droites $' + x + '$ et $' + y + '$ ?',
          questions: [qcm(rng, bonne, CH.filter(function (c) { return c !== bonne; }), 'Conclusion :')],
          indices: ['Fais une figure à main levée.', 'Repère la droite qui apparaît dans les deux informations.'],
          solution: [cas === 4 ? sol : 'On utilise la propriété : « ' + sol + ' »', concl]
        };
      }
      var nb = rng.int(3, 4), rels = [], etat, lignes = [];
      for (var i = 0; i < nb; i++) rels.push(rng.pick(['perp', 'par']));
      if (rels.indexOf('perp') < 0) rels[rng.int(0, nb - 1)] = 'perp';
      var hyps = rels.map(function (r, j) { return phraseRel(D[j], D[j + 1], r); });
      etat = rels[0];
      lignes.push('On part de ' + phraseRel(D[0], D[1], rels[0]) + '.');
      for (var k = 1; k < nb; k++) {
        var r = rels[k], avant = etat, prop;
        if (avant === 'par' && r === 'par') { etat = 'par'; prop = P3; }
        else if (avant === 'perp' && r === 'perp') { etat = 'par'; prop = P1; }
        else { etat = 'perp'; prop = P2; }
        lignes.push(phraseRel(D[0], D[k], avant) + ' et ' + phraseRel(D[k], D[k + 1], r) + ' : ' + prop.charAt(0).toLowerCase() + prop.slice(1, -1) + '. Donc ' + phraseRel(D[0], D[k + 1], etat) + '.');
      }
      var bonne2 = etat === 'par' ? CH[0] : CH[1];
      return {
        enonce: 'Les droites $' + D.slice(0, nb + 1).join('$, $') + '$ sont distinctes. On sait que : ' + hyps.join(' ; ') + '.<br>Que peut-on dire des droites $' + D[0] + '$ et $' + D[nb] + '$ ?',
        questions: [qcm(rng, bonne2, [CH[0], CH[1], CH[2]], 'Conclusion :')],
        indices: ['Avance pas à pas : déduis d\'abord la relation entre $' + D[0] + '$ et $' + D[2] + '$.', 'Deux perpendicularités successives donnent un parallélisme.'],
        solution: lignes.concat(['Conclusion : ' + (etat === 'par' ? 'les droites $' + D[0] + '$ et $' + D[nb] + '$ sont parallèles.' : 'les droites $' + D[0] + '$ et $' + D[nb] + '$ sont perpendiculaires.')])
      };
    }
  });

  /* ---------- 24. Angles ---------- */
  function rayon(deg, L) { var t = deg * Math.PI / 180; return [L * Math.cos(t), L * Math.sin(t)]; }
  EM.gen.register({
    id: '6e-angles',
    titre: 'Angles : nature, angles adjacents et bissectrice',
    chapitres: ['6e-angles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var t0 = rng.int(0, 25), O = [0, 0], f;
      var noms = rng.pick([['x', 'O', 'y', 'z'], ['u', 'A', 'v', 'w'], ['x', 'S', 'y', 't']]);
      var X = noms[0], S = noms[1], Y = noms[2], Z = noms[3];
      if (niveau === 1) {
        var typ = rng.pick(['aigu', 'aigu', 'obtus', 'obtus', 'droit', 'plat']);
        var mes = typ === 'aigu' ? rng.int(3, 17) * 5 : typ === 'obtus' ? rng.int(19, 35) * 5 : typ === 'droit' ? 90 : 180;
        var PX = rayon(t0, 4), PY = rayon(t0 + mes, 4);
        f = EM.fig.fit([O, PX, PY, rayon(t0 + mes / 2, 1.2)], { w: 240, h: 190 });
        f.seg(O, PX).seg(O, PY);
        if (mes === 90) f.rightAngle(PX, O, PY); else f.angle(PX, O, PY, mes + '°', { r: 26 });
        f.point(O, S, 's').label(PX, X, 'e').label(PY, Y, mes > 150 ? 'o' : 'n');
        var qs = [qcm(rng, 'un angle ' + typ, ['un angle aigu', 'un angle droit', 'un angle obtus', 'un angle plat'], 'Nature :')];
        var sol = ['L\'angle $\\widehat{' + X + S + Y + '}$ mesure ' + m(mes) + '°.', typ === 'aigu' ? 'Sa mesure est comprise entre 0° et 90° : c\'est un angle aigu.' : typ === 'obtus' ? 'Sa mesure est comprise entre 90° et 180° : c\'est un angle obtus.' : typ === 'droit' ? 'Il mesure exactement 90° : c\'est un angle droit.' : 'Il mesure 180° : ses deux côtés sont des demi-droites opposées, c\'est un angle plat.'];
        if (mes < 180) {
          qs.push(qnum('Degrés manquants pour un angle plat :', 180 - mes, '°'));
          sol.push('Pour obtenir un angle plat (180°), il manque $180 - ' + mes + ' = ' + (180 - mes) + '$°.');
        }
        return {
          enonce: 'L\'angle $\\widehat{' + X + S + Y + '}$ ci-contre mesure ' + m(mes) + '°.<br>Donner sa nature' + (mes < 180 ? ', puis calculer le nombre de degrés qu\'il faut lui ajouter pour obtenir un angle plat' : '') + '.',
          figure: f.svg(),
          questions: qs,
          indices: ['Aigu : moins de 90° ; droit : 90° ; obtus : entre 90° et 180° ; plat : 180°.', 'Un angle plat mesure 180°.'],
          solution: sol
        };
      }
      if (rng.bool()) {
        var a = rng.int(3, 14) * 5, b = rng.int(3, 14) * 5;
        var PX2 = rayon(t0, 4), PZ = rayon(t0 + a, 4), PY2 = rayon(t0 + a + b, 4);
        f = EM.fig.fit([O, PX2, PZ, PY2], { w: 250, h: 200 });
        f.seg(O, PX2).seg(O, PZ, { accent: true }).seg(O, PY2);
        var trouverTotal = rng.bool();
        f.angle(PX2, O, PZ, a + '°', { r: 30 }).angle(PZ, O, PY2, trouverTotal ? b + '°' : '?', { r: 44 });
        f.point(O, S, 's').label(PX2, X, 'e').label(PZ, Z, 'ne').label(PY2, Y, 'n');
        if (trouverTotal) {
          return {
            enonce: 'Sur la figure, la demi-droite $[' + S + Z + ')$ est située entre $[' + S + X + ')$ et $[' + S + Y + ')$. Les angles $\\widehat{' + X + S + Z + '}$ et $\\widehat{' + Z + S + Y + '}$ sont adjacents, avec $\\widehat{' + X + S + Z + '} = ' + a + '°$ et $\\widehat{' + Z + S + Y + '} = ' + b + '°$.<br>Calculer la mesure de l\'angle $\\widehat{' + X + S + Y + '}$.',
            figure: f.svg(),
            questions: [qnum('$\\widehat{' + X + S + Y + '} =$', a + b, '°')],
            indices: ['Deux angles adjacents ont le même sommet, un côté commun, et sont de part et d\'autre de ce côté.', 'La mesure du grand angle est la somme des deux mesures.'],
            solution: ['Les angles $\\widehat{' + X + S + Z + '}$ et $\\widehat{' + Z + S + Y + '}$ sont adjacents : $\\widehat{' + X + S + Y + '} = \\widehat{' + X + S + Z + '} + \\widehat{' + Z + S + Y + '}$.', '$\\widehat{' + X + S + Y + '} = ' + a + '° + ' + b + '° = ' + (a + b) + '°$.']
          };
        }
        return {
          enonce: 'Sur la figure, la demi-droite $[' + S + Z + ')$ est située entre $[' + S + X + ')$ et $[' + S + Y + ')$. On sait que $\\widehat{' + X + S + Y + '} = ' + (a + b) + '°$ et $\\widehat{' + X + S + Z + '} = ' + a + '°$.<br>Calculer la mesure de l\'angle $\\widehat{' + Z + S + Y + '}$.',
          figure: f.svg(),
          questions: [qnum('$\\widehat{' + Z + S + Y + '} =$', b, '°')],
          indices: ['$\\widehat{' + X + S + Y + '} = \\widehat{' + X + S + Z + '} + \\widehat{' + Z + S + Y + '}$.'],
          solution: ['Les angles $\\widehat{' + X + S + Z + '}$ et $\\widehat{' + Z + S + Y + '}$ sont adjacents : $\\widehat{' + X + S + Z + '} + \\widehat{' + Z + S + Y + '} = \\widehat{' + X + S + Y + '}$.', 'Donc $\\widehat{' + Z + S + Y + '} = ' + (a + b) + '° - ' + a + '° = ' + b + '°$.']
        };
      }
      var demi = rng.int(10, 85), tot = 2 * demi, cherche = rng.bool();
      var PX3 = rayon(t0, 4), PZ3 = rayon(t0 + demi, 4), PY3 = rayon(t0 + tot, 4);
      f = EM.fig.fit([O, PX3, PZ3, PY3], { w: 250, h: 200 });
      f.seg(O, PX3).seg(O, PZ3, { accent: true, dash: true }).seg(O, PY3);
      f.angle(PX3, O, PZ3, '', { r: 30 }).angle(PZ3, O, PY3, '', { r: 30 });
      f.point(O, S, 's').label(PX3, X, 'e').label(PZ3, Z, 'ne').label(PY3, Y, 'n');
      return {
        enonce: 'La demi-droite $[' + S + Z + ')$ est la bissectrice de l\'angle $\\widehat{' + X + S + Y + '}$. ' + (cherche ? 'On sait que $\\widehat{' + X + S + Y + '} = ' + tot + '°$.<br>Calculer la mesure de l\'angle $\\widehat{' + X + S + Z + '}$.' : 'On sait que $\\widehat{' + X + S + Z + '} = ' + demi + '°$.<br>Calculer la mesure de l\'angle $\\widehat{' + X + S + Y + '}$.'),
        figure: f.svg(),
        questions: [qnum(cherche ? '$\\widehat{' + X + S + Z + '} =$' : '$\\widehat{' + X + S + Y + '} =$', cherche ? demi : tot, '°')],
        indices: ['La bissectrice d\'un angle le partage en deux angles adjacents de même mesure.'],
        solution: ['La bissectrice $[' + S + Z + ')$ partage $\\widehat{' + X + S + Y + '}$ en deux angles égaux : $\\widehat{' + X + S + Z + '} = \\widehat{' + Z + S + Y + '} = \\dfrac{\\widehat{' + X + S + Y + '}}{2}$.', cherche ? '$\\widehat{' + X + S + Z + '} = ' + tot + '° \\div 2 = ' + demi + '°$.' : '$\\widehat{' + X + S + Y + '} = 2 \\times ' + demi + '° = ' + tot + '°$.']
      };
    }
  });

  /* ---------- 25. Symétrie orthogonale ---------- */
  EM.gen.register({
    id: '6e-symetrie',
    titre: 'Symétrie orthogonale sur quadrillage',
    chapitres: ['6e-symetrie-orthogonale'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var W = 10, H = 8, ax, A, Ap, cands = [], guard = 0, i;
      function dedans(p) { return p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H; }
      function egal(p, q) { return p[0] === q[0] && p[1] === q[1]; }
      var diag = niveau === 2;
      var vertical = rng.bool(), c0 = 0;
      do {
        guard++;
        if (!diag) {
          ax = vertical ? rng.int(4, 6) : rng.int(3, 5);
          var d = rng.int(1, 3);
          if (vertical) { A = [ax - d, rng.int(1, H - 1)]; if (rng.bool()) A[0] = ax + d; Ap = [2 * ax - A[0], A[1]]; }
          else { A = [rng.int(1, W - 1), ax - d]; if (rng.bool()) A[1] = ax + d; Ap = [A[0], 2 * ax - A[1]]; }
          cands = vertical
            ? [[Ap[0], Ap[1] + 1], [Ap[0], Ap[1] - 1], [Ap[0] + (Ap[0] > ax ? 1 : -1), Ap[1]], [Ap[0], H - Ap[1]], [A[0], H - A[1]]]
            : [[Ap[0] + 1, Ap[1]], [Ap[0] - 1, Ap[1]], [Ap[0], Ap[1] + (Ap[1] > ax ? 1 : -1)], [W - Ap[0], Ap[1]], [W - A[0], A[1]]];
        } else {
          c0 = rng.int(-2, 1); // axe y = x + c0
          A = [rng.int(1, W - 1), rng.int(1, H - 1)];
          Ap = [A[1] - c0, A[0] + c0];
          var hx = 2 * (A[1] - c0) - A[0], vy = 2 * (A[0] + c0) - A[1];
          cands = [[hx, A[1]], [A[0], vy], [Ap[0] + 1, Ap[1]], [Ap[0], Ap[1] - 1], [Ap[0] - 1, Ap[1] + 1]];
        }
        cands = cands.filter(function (p, j) {
          if (!dedans(p) || egal(p, A) || egal(p, Ap)) return false;
          for (var k = 0; k < j; k++) if (egal(cands[k], p)) return false;
          return true;
        });
      } while ((!dedans(Ap) || egal(A, Ap) || cands.length < 3 || (diag && Math.abs(A[1] - A[0] - c0) < 1)) && guard < 300);
      cands = rng.sample(cands, 3);
      var lettres = rng.shuffle(['B', 'C', 'D', 'E']);
      var pts = [Ap].concat(cands);
      var f = EM.fig.create({ w: 300, h: 245, xmin: -0.6, xmax: W + 0.6, ymin: -0.6, ymax: H + 0.6, title: 'Quadrillage' });
      for (i = 0; i <= W; i++) f.seg([i, 0], [i, H], { light: true });
      for (i = 0; i <= H; i++) f.seg([0, i], [W, i], { light: true });
      if (!diag) {
        if (vertical) f.seg([ax, -0.6], [ax, H + 0.6], { accent: true }).text([ax + 0.25, H + 0.15], '(d)', { small: true, anchor: 'start' });
        else f.seg([-0.6, ax], [W + 0.6, ax], { accent: true }).text([W + 0.1, ax + 0.25], '(d)', { small: true, anchor: 'end' });
      } else {
        f.seg([-0.6, -0.6 + c0], [W + 0.6, W + 0.6 + c0], { accent: true });
        var lx = Math.min(W - 0.3, H - c0 - 0.6);
        f.text([lx - 0.2, lx + c0 + 0.35], '(d)', { small: true, anchor: 'end' });
      }
      f.point(A, 'A', 'ne');
      pts.forEach(function (p, j) { f.point(p, lettres[j], 'ne'); });
      var bonne = lettres[0];
      var dist = diag ? null : Math.abs(vertical ? A[0] - ax : A[1] - ax);
      var qs = [qcm(rng, bonne, lettres.slice(1), 'Symétrique de A :')];
      var sol = diag
        ? ['Le symétrique A\' de A par rapport à (d) est tel que (d) est la médiatrice du segment [AA\'] : [AA\'] est perpendiculaire à (d) et son milieu est sur (d).', 'Ici (d) est une diagonale du quadrillage : on part de A en suivant l\'autre diagonale (perpendiculaire à (d)), on atteint (d), puis on continue d\'autant de l\'autre côté.', 'On arrive au point ' + bonne + '. Les autres points ne conviennent pas : ils ne sont pas sur la perpendiculaire à (d) passant par A, ou pas à la même distance de (d).']
        : ['Le symétrique A\' de A par rapport à (d) est tel que (d) est la médiatrice du segment [AA\'] : [AA\'] est perpendiculaire à (d) et son milieu est sur (d).', 'A est à ' + m(dist) + ' carreau' + (dist > 1 ? 'x' : '') + ' de (d) : on se déplace perpendiculairement à (d), on traverse (d) et on avance encore de ' + m(dist) + ' carreau' + (dist > 1 ? 'x' : '') + '.', 'On arrive au point ' + bonne + '.'];
      if (diag) {
        var lg = rng.int(15, 80) / 10;
        qs.push(qnum('Longueur de [A\'M\'] (cm) :', lg, 'cm'));
        sol.push('La symétrie orthogonale conserve les longueurs : si $AM = ' + n(lg) + '$ cm, alors le segment symétrique $[A\'M\']$ mesure aussi $' + n(lg) + '$ cm.');
        return {
          enonce: 'Sur le quadrillage ci-contre, quel point est le symétrique du point A par rapport à la droite (d) ?<br>On considère ensuite un point M tel que $AM = ' + n(lg) + '$ cm ; on note A\' et M\' les symétriques de A et M par rapport à (d). Donner la longueur A\'M\'.',
          figure: f.svg(),
          questions: qs,
          indices: ['Le segment qui joint A à son symétrique est perpendiculaire à (d) : ici il suit une diagonale des carreaux.', 'La symétrie orthogonale conserve les longueurs.'],
          solution: sol
        };
      }
      return {
        enonce: 'Sur le quadrillage ci-contre, quel point est le symétrique du point A par rapport à la droite (d) ?',
        figure: f.svg(),
        questions: qs,
        indices: ['Compte le nombre de carreaux entre A et la droite (d).', 'Le symétrique est de l\'autre côté de (d), à la même distance, sur la perpendiculaire à (d) passant par A.'],
        solution: sol
      };
    }
  });

  /* ---------- 26. Triangles ---------- */
  EM.gen.register({
    id: '6e-triangles',
    titre: 'Triangles particuliers : nature et périmètre',
    chapitres: ['6e-triangles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var noms = rng.pick([['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T'], ['K', 'L', 'M']]), A = noms[0], B = noms[1], C = noms[2];
      var a, b, c, P, f, pts;
      if (niveau === 1) {
        var typ = rng.pick(['équilatéral', 'isocèle', 'isocèle', 'rectangle', 'rectangle isocèle', 'quelconque', 'quelconque']);
        var droit = typ === 'rectangle' || typ === 'rectangle isocèle', enonce, sol, qs;
        if (droit) {
          b = rng.int(3, 9); c = typ === 'rectangle isocèle' ? b : rng.intExcept(3, 9, [b]);
          pts = [[0, 0], [c, 0], [0, b]];
          f = EM.fig.fit(pts, { w: 240, h: 200, pad: 40 });
          f.poly(pts, { fill: true }).rightAngle(pts[1], pts[0], pts[2]);
          f.point(pts[0], A, 'so').point(pts[1], B, 'se').point(pts[2], C, 'n');
          f.segLabel(pts[0], pts[1], c + ' cm', { inside: pts[2] }).segLabel(pts[0], pts[2], b + ' cm', { inside: pts[1] });
          enonce = 'Le triangle $' + A + B + C + '$ est tel que l\'angle $\\widehat{' + B + A + C + '}$ est droit, $' + A + B + ' = ' + c + '$ cm et $' + A + C + ' = ' + b + '$ cm.<br>Quelle est la nature du triangle $' + A + B + C + '$ ?';
          sol = [typ === 'rectangle isocèle' ? 'Le triangle a un angle droit en ' + A + ' et deux côtés de même longueur ($' + A + B + ' = ' + A + C + ' = ' + b + '$ cm) : il est rectangle isocèle en ' + A + '.' : 'Le triangle a un angle droit en ' + A + ' et les côtés $[' + A + B + ']$ et $[' + A + C + ']$ n\'ont pas la même longueur : il est rectangle en ' + A + '.'];
          qs = [qcm(rng, typ, ['équilatéral', 'isocèle', 'rectangle', 'rectangle isocèle', 'quelconque'], 'Nature :')];
        } else {
          var g = 0;
          do {
            if (typ === 'équilatéral') { a = b = c = rng.int(3, 12); }
            else if (typ === 'isocèle') { b = c = rng.int(3, 12); a = rng.intExcept(2, 2 * b - 1, [b]); }
            else { a = rng.int(3, 12); b = rng.intExcept(3, 12, [a]); c = rng.intExcept(3, 12, [a, b]); }
            g++;
          } while ((a >= b + c || b >= a + c || c >= a + b || (typ === 'quelconque' && (a * a + b * b === c * c || a * a + c * c === b * b || b * b + c * c === a * a))) && g < 100);
          pts = triangleCoords(a, b, c);
          f = EM.fig.fit(pts, { w: 260, h: 200, pad: 40 });
          var G = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
          f.poly(pts, { fill: true }).point(pts[0], A, 'so').point(pts[1], B, 'se').point(pts[2], C, 'n');
          f.segLabel(pts[0], pts[1], c + ' cm', { inside: G }).segLabel(pts[0], pts[2], b + ' cm', { inside: G }).segLabel(pts[1], pts[2], a + ' cm', { inside: G });
          P = a + b + c;
          enonce = 'Le triangle $' + A + B + C + '$ est tel que $' + A + B + ' = ' + c + '$ cm, $' + A + C + ' = ' + b + '$ cm et $' + B + C + ' = ' + a + '$ cm.<br>Quelle est la nature du triangle $' + A + B + C + '$ ? Calculer son périmètre.';
          sol = [typ === 'équilatéral' ? 'Les trois côtés ont la même longueur (' + m(a) + ' cm) : le triangle est équilatéral.' : typ === 'isocèle' ? 'Deux côtés ont la même longueur : $' + A + B + ' = ' + A + C + ' = ' + b + '$ cm. Le triangle est isocèle en ' + A + ' (sa base est $[' + B + C + ']$).' : 'Les trois côtés ont des longueurs différentes et aucun angle droit n\'est indiqué : le triangle est quelconque.', 'Périmètre : $' + c + ' + ' + b + ' + ' + a + ' = ' + P + '$ cm.'];
          qs = [qcm(rng, typ, ['équilatéral', 'isocèle', 'rectangle', 'rectangle isocèle', 'quelconque'], 'Nature :'), qnum('Périmètre (cm) :', P, 'cm')];
        }
        return {
          enonce: enonce,
          figure: f.svg(),
          questions: qs,
          indices: ['Isocèle : deux côtés de même longueur. Équilatéral : trois côtés de même longueur. Rectangle : un angle droit.', 'Choisis la nature la plus précise possible.'],
          solution: sol
        };
      }
      var cas = rng.int(0, 2), rep, lab, enonce2, sol2;
      if (cas === 0) {
        c = rng.int(4, 40) / 2; P = R(3 * c);
        enonce2 = 'Un triangle équilatéral $' + A + B + C + '$ a un périmètre de $' + n(P) + '$ cm.<br>Calculer la longueur de chacun de ses côtés.';
        rep = c; lab = 'Côté (cm) :';
        sol2 = ['Les trois côtés d\'un triangle équilatéral ont la même longueur.', 'Côté $= ' + n(P) + ' \\div 3 = ' + n(c) + '$ cm.'];
      } else {
        b = rng.int(6, 30) / 2; a = rng.int(4, 2 * b * 2 - 2) / 2; if (a === b) a = R(b + 0.5); if (a >= 2 * b) a = b; P = R(2 * b + a);
        if (cas === 1) {
          enonce2 = 'Le triangle $' + A + B + C + '$ est isocèle en ' + A + '. Sa base $[' + B + C + ']$ mesure $' + n(a) + '$ cm et son périmètre est $' + n(P) + '$ cm.<br>Calculer la longueur $' + A + B + '$.';
          rep = b; lab = '$' + A + B + ' =$';
          sol2 = ['Isocèle en ' + A + ' : $' + A + B + ' = ' + A + C + '$.', 'Les deux côtés égaux mesurent ensemble $' + n(P) + ' - ' + n(a) + ' = ' + n(P - a) + '$ cm.', 'Donc $' + A + B + ' = ' + n(R(P - a)) + ' \\div 2 = ' + n(b) + '$ cm.'];
        } else {
          enonce2 = 'Le triangle $' + A + B + C + '$ est isocèle en ' + A + ', avec $' + A + B + ' = ' + n(b) + '$ cm. Son périmètre est $' + n(P) + '$ cm.<br>Calculer la longueur de la base $[' + B + C + ']$.';
          rep = a; lab = '$' + B + C + ' =$';
          sol2 = ['Isocèle en ' + A + ' : $' + A + C + ' = ' + A + B + ' = ' + n(b) + '$ cm.', '$' + B + C + ' = ' + n(P) + ' - 2 \\times ' + n(b) + ' = ' + n(P) + ' - ' + n(2 * b) + ' = ' + n(a) + '$ cm.'];
        }
      }
      return {
        enonce: enonce2,
        questions: [qnum(lab, rep, 'cm')],
        indices: ['Fais un schéma et code les côtés de même longueur.', 'Le périmètre est la somme des longueurs des trois côtés.'],
        solution: sol2
      };
    }
  });

  /* ---------- 27. Quadrilatères particuliers ---------- */
  EM.gen.register({
    id: '6e-quadrilateres',
    titre: 'Rectangle, losange, carré : propriétés et calculs',
    chapitres: ['6e-quadrilateres'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var NATS = ['un rectangle', 'un losange', 'un carré'];
      if (niveau === 1) {
        if (rng.bool()) {
          var cas = rng.pick([
            ['a quatre côtés de même longueur', 1, 'Un quadrilatère qui a quatre côtés de même longueur est un losange (on ne sait rien de ses angles, donc on ne peut pas dire que c\'est un carré).'],
            ['a quatre angles droits', 0, 'Un quadrilatère qui a quatre angles droits est un rectangle (on ne sait rien de ses côtés, donc on ne peut pas dire que c\'est un carré).'],
            ['a trois angles droits', 0, 'Si un quadrilatère a trois angles droits, son quatrième angle est forcément droit aussi : c\'est un rectangle.'],
            ['a quatre côtés de même longueur et un angle droit', 2, 'Quatre côtés de même longueur : c\'est un losange. Un losange qui a un angle droit a ses quatre angles droits : c\'est un carré.'],
            ['a quatre angles droits et deux côtés consécutifs de même longueur', 2, 'Quatre angles droits : c\'est un rectangle. Un rectangle qui a deux côtés consécutifs de même longueur a ses quatre côtés égaux : c\'est un carré.']
          ]);
          return {
            enonce: 'Le quadrilatère ABCD ' + cas[0] + '.<br>Quelle est sa nature (la plus précise que l\'on puisse affirmer) ?',
            questions: [qcm(rng, NATS[cas[1]], NATS, 'ABCD est :')],
            indices: ['Rectangle : quatre angles droits. Losange : quatre côtés de même longueur. Carré : quatre angles droits et quatre côtés de même longueur.', 'N\'affirme que ce qui est sûr.'],
            solution: [cas[2]]
          };
        }
        var DIAG = [
          'Elles se coupent en leur milieu et ont la même longueur.',
          'Elles se coupent en leur milieu et sont perpendiculaires.',
          'Elles se coupent en leur milieu, ont la même longueur et sont perpendiculaires.',
          'Elles sont parallèles.'
        ];
        var k = rng.int(0, 2);
        return {
          enonce: 'ABCD est ' + NATS[k] + '. Que peut-on dire de ses diagonales $[AC]$ et $[BD]$ ?',
          questions: [qcm(rng, DIAG[k], DIAG, 'Diagonales :')],
          indices: ['Rectangle : diagonales de même longueur, qui se coupent en leur milieu. Losange : diagonales perpendiculaires, qui se coupent en leur milieu.', 'Le carré est à la fois un rectangle et un losange.'],
          solution: [
            k === 0 ? 'Les diagonales d\'un rectangle ont la même longueur et se coupent en leur milieu.' : k === 1 ? 'Les diagonales d\'un losange sont perpendiculaires et se coupent en leur milieu.' : 'Le carré est à la fois un rectangle et un losange : ses diagonales ont la même longueur, sont perpendiculaires et se coupent en leur milieu.',
            'Les diagonales d\'un rectangle, d\'un losange ou d\'un carré se coupent en leur milieu : elles ne peuvent donc pas être parallèles.'
          ]
        };
      }
      var t = rng.int(0, 2), f;
      if (t === 0) {
        var L = rng.int(4, 9), l = rng.int(2, L - 1), d = R(rng.int(12, 40) / 2);
        var pts = [[0, 0], [L, 0], [L, l], [0, l]], Oc = [L / 2, l / 2];
        f = EM.fig.fit(pts, { w: 250, h: 170 });
        f.poly(pts).seg(pts[0], pts[2], { dash: true }).seg(pts[1], pts[3], { dash: true });
        f.point(pts[0], 'A', 'so').point(pts[1], 'B', 'se').point(pts[2], 'C', 'ne').point(pts[3], 'D', 'no').point(Oc, 'O', 's');
        f.rightAngle(pts[1], pts[0], pts[3]);
        return {
          enonce: 'ABCD est un rectangle de centre O (point d\'intersection des diagonales). On donne $AC = ' + n(d) + '$ cm.<br>Calculer $BD$, puis $OB$.',
          figure: f.svg(),
          questions: [qnum('$BD =$', d, 'cm'), qnum('$OB =$', R(d / 2), 'cm')],
          indices: ['Les diagonales d\'un rectangle ont la même longueur.', 'Elles se coupent en leur milieu O.'],
          solution: ['Les diagonales d\'un rectangle ont la même longueur : $BD = AC = ' + n(d) + '$ cm.', 'Elles se coupent en leur milieu : $OB = BD \\div 2 = ' + n(d) + ' \\div 2 = ' + n(R(d / 2)) + '$ cm.']
        };
      }
      if (t === 1) {
        var c = rng.int(4, 40) / 2, P = R(4 * c);
        return {
          enonce: 'Un losange a un périmètre de $' + n(P) + '$ cm.<br>Calculer la longueur de son côté.',
          questions: [qnum('Côté (cm) :', c, 'cm')],
          indices: ['Les quatre côtés d\'un losange ont la même longueur.'],
          solution: ['Les quatre côtés du losange ont la même longueur.', 'Côté $= ' + n(P) + ' \\div 4 = ' + n(c) + '$ cm.']
        };
      }
      var c2 = rng.int(2, 25), P2 = 4 * c2;
      return {
        enonce: 'Le périmètre d\'un carré est $' + n(P2) + '$ m.<br>Calculer la longueur de son côté, puis son aire.',
        questions: [qnum('Côté (m) :', c2, 'm'), qnum('Aire (m²) :', c2 * c2)],
        indices: ['Le carré a quatre côtés de même longueur.', 'Aire du carré : côté × côté.'],
        solution: ['Côté $= ' + n(P2) + ' \\div 4 = ' + n(c2) + '$ m.', 'Aire $= ' + n(c2) + ' \\times ' + n(c2) + ' = ' + n(c2 * c2) + '$ m².']
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
