/*
 * ELITE MATHÉMATIQUE — générateurs complémentaires du CM2 à la 3e.
 * Ils enrichissent les chapitres qui n'avaient qu'un seul générateur, avec d'autres types de tâches :
 * figures à lire, réciproques, problèmes concrets, raisonnements en plusieurs étapes,
 * QCM de propriétés, constructions vérifiées sur quadrillage ou par coordonnées.
 * Conventions : énoncés à l'infinitif, indices et corrections qui tutoient l'élève,
 * nombres écrits avec EM.T (virgule décimale, espaces des milliers), montants en F CFA.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, ar = EM.ar;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  var NB = ' ';
  function R(x, d) { return ar.round(x, d == null ? 6 : d); }
  /** nombre en TeX (sans les $) */
  function n(x) { return x instanceof EM.Frac ? x.tex() : T.num(R(x)); }
  /** nombre en TeX dans le texte */
  function m(x) { return '$' + n(x) + '$'; }
  /** nombre suivi d'une unité, dans le texte */
  function u(x, unite) { return m(x) + NB + unite; }
  /** mesure d'angle en TeX : 35^\circ */
  function dg(x) { return n(x) + '^\\circ'; }
  /** nombre pour une figure SVG (texte simple) */
  function tx(x) { return T.txt(R(x)); }
  function rad(x) { return x * Math.PI / 180; }
  function w(s) { return '\\widehat{' + s + '}'; }
  function cpl(x, y) { return '(' + n(x) + ' \\,;\\, ' + n(y) + ')'; }
  function pluriel(k, mot, mots) { return k > 1 ? (mots || mot + 's') : mot; }

  var FILLES = ['Awa', 'Fatou', 'Aminata', 'Khady', 'Ndèye', 'Mariama', 'Coumba', 'Astou', 'Seynabou', 'Dieynaba', 'Bineta', 'Rokhaya', 'Aïssatou', 'Penda', 'Yacine'];
  var GARCONS = ['Moussa', 'Mamadou', 'Ousmane', 'Ibrahima', 'Cheikh', 'Babacar', 'Lamine', 'Modou', 'Abdou', 'Pape', 'Alioune', 'Saliou', 'Malick', 'Serigne', 'Demba'];
  var VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Tambacounda', 'Mbour', 'Rufisque', 'Louga', 'Diourbel', 'Kolda', 'Fatick', 'Matam', 'Kédougou', 'Sédhiou', 'Kaffrine'];

  function personne(rng, genre) {
    var f = genre === 'f' ? true : genre === 'm' ? false : rng.bool();
    return { nom: rng.pick(f ? FILLES : GARCONS), f: f, il: f ? 'elle' : 'il', Il: f ? 'Elle' : 'Il', e: f ? 'e' : '' };
  }
  /** « de Moussa », « d'Awa » */
  function de(nom) { return /^[AEIOUÉÈÏ]/.test(nom) ? "d'" + nom : 'de ' + nom; }

  /** Question à choix : mélange les choix, sans doublon, et calcule l'index de la bonne réponse. */
  function qcm(rng, label, bonne, autres) {
    var liste = [bonne];
    autres.forEach(function (c) { if (c != null && liste.indexOf(c) < 0) liste.push(c); });
    var choix = rng.shuffle(liste);
    return { label: label, type: 'choice', choix: choix, reponse: choix.indexOf(bonne) };
  }
  /** Question numérique (tol facultative pour les valeurs arrondies). */
  function qnum(label, val, unite, tol) {
    var q = { label: label, type: 'number', reponse: val instanceof EM.Frac ? val : R(val) };
    if (val instanceof EM.Frac) q.reponseTex = val.tex();
    if (unite) q.unite = unite;
    if (tol != null) q.tol = tol;
    return q;
  }
  function qtuple(label, arr) { return { label: label, type: 'tuple', reponse: arr }; }
  /** Tableau HTML simple : lignes = [[en-tête, v1, v2…], …] (cellules en HTML/TeX). */
  function tableau(lignes) {
    return '<div class="table-wrap"><table class="t"><tbody>' + lignes.map(function (l) {
      return '<tr>' + l.map(function (c, j) { return j === 0 ? '<th>' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
  }

  /* ---------- outils de figure ---------- */
  /** position d'étiquette (n, ne, …) selon une direction donnée en degrés */
  function posAngle(a) { a = ((a % 360) + 360) % 360; return ['e', 'ne', 'n', 'no', 'o', 'so', 's', 'se'][Math.round(a / 45) % 8]; }
  /** position d'étiquette pour le point P, à l'opposé du point C (centre de la figure) */
  function posLoin(P, C) { return posAngle(Math.atan2(P[1] - C[1], P[0] - C[0]) * 180 / Math.PI); }
  /** position d'étiquette dans le plus grand secteur libre entre des directions (degrés) */
  function posLibre(angles) {
    var a = angles.map(function (x) { return ((x % 360) + 360) % 360; }).sort(function (x, y) { return x - y; });
    var best = 0, bis = 0;
    for (var i = 0; i < a.length; i++) {
      var suiv = i + 1 < a.length ? a[i + 1] : a[0] + 360, gap = suiv - a[i];
      if (gap > best) { best = gap; bis = a[i] + gap / 2; }
    }
    return posAngle(bis);
  }
  /** position d'étiquette pour P, à l'opposé de deux points C1 et C2 à la fois */
  function posLoin2(P, C1, C2) {
    var u1 = [P[0] - C1[0], P[1] - C1[1]], u2 = [P[0] - C2[0], P[1] - C2[1]];
    var n1 = Math.sqrt(u1[0] * u1[0] + u1[1] * u1[1]) || 1, n2 = Math.sqrt(u2[0] * u2[0] + u2[1] * u2[1]) || 1;
    return posAngle(Math.atan2(u1[1] / n1 + u2[1] / n2, u1[0] / n1 + u2[0] / n2) * 180 / Math.PI);
  }
  /** position d'étiquette dans un repère : vers l'extérieur du quadrant (loin des axes gradués) */
  function posQuadrant(P) { return (P[1] >= 0 ? 'n' : 's') + (P[0] >= 0 ? 'e' : 'o'); }
  function centre(pts) {
    var s = [0, 0];
    pts.forEach(function (p) { s[0] += p[0]; s[1] += p[1]; });
    return [s[0] / pts.length, s[1] / pts.length];
  }
  function pt(O, a, L) { return [O[0] + L * Math.cos(rad(a)), O[1] + L * Math.sin(rad(a))]; }
  function milieu(A, B) { return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; }
  function dist(A, B) { return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1])); }
  /** Triangle de côtés BC = a, AC = b, AB = c : renvoie [A, B, C]. */
  function triCotes(a, b, c) {
    var cosA = (b * b + c * c - a * a) / (2 * b * c);
    var sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    return [[0, 0], [c, 0], [b * cosA, b * sinA]];
  }
  /** Triangle ABC avec B = (0, 0), C = (L, 0) et les angles en B et C (degrés) : renvoie [A, B, C]. */
  function triAngles(Bd, Cd, L) {
    L = L || 6;
    var t = L * Math.sin(rad(Cd)) / Math.sin(rad(Bd + Cd));
    return [[t * Math.cos(rad(Bd)), t * Math.sin(rad(Bd))], [0, 0], [L, 0]];
  }
  /** Ligne de quadrillage (classe fig-grid). */
  function ligneGrille(f, A, B) {
    var a = f.P(A), b = f.P(B);
    return f.add('<line class="fig-grid" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>');
  }
  /** Quadrillage W × H carreaux (de 0 à W et de 0 à H). */
  function quadrillage(W, H, opt) {
    opt = opt || {};
    var f = EM.fig.create({ w: opt.w || 300, xmin: -0.5, xmax: W + 0.5, ymin: -0.5, ymax: H + 0.5, title: opt.title || 'Quadrillage' });
    for (var i = 0; i <= W; i++) f.seg([i, 0], [i, H], { light: true });
    for (var j = 0; j <= H; j++) f.seg([0, j], [W, j], { light: true });
    return f;
  }
  /** Arc de cercle de centre C et de rayon r, de l'angle a1 à l'angle a2 (degrés, sens direct). */
  function arcCercle(f, C, r, a1, a2, o) {
    var p1 = f.P(pt(C, a1, r)), p2 = f.P(pt(C, a2, r));
    var rp = Math.round(r / (f.xmax - f.xmin) * f.w * 100) / 100;
    var big = (a2 - a1) % 360 > 180 ? 1 : 0;
    return f.add('<path class="' + f.cls(o, 'fig-line fig-nofill') + '" d="M' + p1.join(',') + ' A' + rp + ',' + rp + ' 0 ' + big + ',0 ' + p2.join(',') + '"/>');
  }
  /** Petit texte (10 px) en coordonnées mathématiques. */
  function petitTexte(f, A, txt, anchor) {
    var a = f.P(A);
    return f.add('<text class="fig-text fig-tiny" x="' + a[0] + '" y="' + (Math.round((a[1] + 3.5) * 100) / 100) + '" text-anchor="' + (anchor || 'middle') + '">' + txt + '</text>');
  }
  /** Arc d'angle ABC avec nb petits traits (codage d'angles de même mesure). */
  function codeAngle(f, A, B, C, r, nb, o) {
    f.angle(A, B, C, '', { r: r, accent: o && o.accent });
    var b = f.P(B), a = f.P(A), c = f.P(C);
    var a1 = Math.atan2(a[1] - b[1], a[0] - b[0]), a2 = Math.atan2(c[1] - b[1], c[0] - b[0]), d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    for (var i = 0; i < nb; i++) {
      var t = a1 + d / 2 + (i - (nb - 1) / 2) * (5 / r);
      var r2 = function (x) { return Math.round(x * 100) / 100; };
      f.add('<line class="' + f.cls(o, 'fig-line fig-thin') + '" x1="' + r2(b[0] + (r - 5) * Math.cos(t)) + '" y1="' + r2(b[1] + (r - 5) * Math.sin(t)) + '" x2="' + r2(b[0] + (r + 5) * Math.cos(t)) + '" y2="' + r2(b[1] + (r + 5) * Math.sin(t)) + '"/>');
    }
    return f;
  }
  /** Repère orthonormé simple [−L ; L]², avec quadrillage. */
  function repere(xmin, xmax, ymin, ymax, w) {
    var f = EM.fig.create({ xmin: xmin - 0.6, xmax: xmax + 0.6, ymin: ymin - 0.6, ymax: ymax + 0.6, w: w || 280, title: 'Repère' });
    f.axes({ step: 1, labelStep: (xmax - xmin) > 14 ? 2 : 1 });
    return f;
  }

  /* ================================================================== */
  /* CM2 — Numération : comparer, ranger, arrondir, encadrer             */
  /* ================================================================== */
  var RANGS = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille',
    'unités de millions', 'dizaines de millions', 'centaines de millions', 'unités de milliards'];
  var COOPS = ['Ndoffane', 'Keur Madiabel', 'Gossas', 'Nioro du Rip', 'Birkelane', 'Malem Hodar', 'Koungheul', 'Gandiaye', 'Paoskoto', 'Kahone'];
  /** Explique pourquoi a < b (entiers naturels). */
  function explComparaison(a, b) {
    var sa = String(a), sb = String(b);
    if (sa.length !== sb.length) {
      return m(a) + ' s\'écrit avec ' + sa.length + ' chiffres et ' + m(b) + ' avec ' + sb.length + ' chiffres : $' + n(a) + ' < ' + n(b) + '$.';
    }
    var i = 0;
    while (i < sa.length && sa[i] === sb[i]) i++;
    return m(a) + ' et ' + m(b) + ' ont autant de chiffres ; en partant de la gauche, le premier chiffre qui diffère est celui des ' + RANGS[sa.length - 1 - i] +
      ' : $' + sa[i] + ' < ' + sb[i] + '$, donc $' + n(a) + ' < ' + n(b) + '$.';
  }
  function arrondiEntier(N, p) { var q = Math.floor(N / p), r = N - q * p; return (2 * r >= p ? q + 1 : q) * p; }
  var NOMS_ARR = {
    1000: ['au millier près', 'centaines'], 10000: ['à la dizaine de mille près', 'unités de mille'],
    100000: ['à la centaine de mille près', 'dizaines de mille'], 1000000: ['au million près', 'centaines de mille']
  };
  function explArrondi(N, p) {
    var q = Math.floor(N / p), r = N - q * p, c = Math.floor(r / (p / 10)), res = arrondiEntier(N, p);
    return 'Arrondi ' + NOMS_ARR[p][0] + ' : on regarde le chiffre des ' + NOMS_ARR[p][1] + ', qui vaut ' + m(c) + '. ' +
      (c >= 5 ? 'Il est supérieur ou égal à 5 : on passe au multiple de ' + m(p) + ' suivant, ' + m(res) + '.'
        : 'Il est inférieur à 5 : on garde ' + m(q * p) + ' (on remplace par des zéros les chiffres situés à droite).');
  }

  EM.gen.register({
    id: 'cm2-plus-comparer-arrondir',
    titre: 'Comparer, ranger, arrondir et encadrer de grands nombres',
    chapitres: ['cm2-numeration', '6e-entiers'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var i;
      if (niveau === 1) {
        var vals, g = 0;
        do {
          var d = [rng.int(2, 8)];
          for (i = 1; i < 7; i++) d.push(rng.int(0, 9));
          var d2 = d.slice(), k = rng.int(2, 4);
          d2[k] = (d[k] + rng.int(1, 8)) % 10;
          var j = rng.int(1, 5), d4 = d.slice(), t = d4[j];
          d4[j] = d4[j + 1]; d4[j + 1] = t;
          var d3 = [9, rng.int(5, 9)];
          for (i = 2; i < 6; i++) d3.push(rng.int(0, 9));
          vals = [d, d2, d3, d4].map(function (x) { return parseInt(x.join(''), 10); });
          g++;
        } while (g < 200 && EM.util.uniq(vals).length < 4);
        var noms = rng.sample(COOPS, 4);
        var tri = vals.slice().sort(function (a, b) { return a - b; });
        var nomDe = function (v) { return noms[vals.indexOf(v)]; };
        var lexico = vals.slice().sort(function (a, b) { return String(a) < String(b) ? -1 : 1; });
        var echange = tri.slice(); var tmp = echange[2]; echange[2] = echange[3]; echange[3] = tmp;
        var echange2 = tri.slice(); tmp = echange2[1]; echange2[1] = echange2[2]; echange2[2] = tmp;
        var ecr = function (arr) { return '$' + arr.map(n).join(' < ') + '$'; };
        var autres = [ecr(lexico), ecr(echange), ecr(echange2)];
        var sol = [
          'Le nombre qui a le moins de chiffres est le plus petit : ' + explComparaison(tri[0], tri[1]),
          'On compare ensuite les nombres de 7 chiffres deux à deux.'
        ];
        for (i = 1; i < 3; i++) sol.push(explComparaison(tri[i], tri[i + 1]));
        sol.push('Ordre croissant : ' + ecr(tri) + '. La plus grande quantité, ' + u(tri[3], 'kg') + ', a été collectée par la coopérative de ' + nomDe(tri[3]) + '.');
        sol.push('Attention au piège : ' + m(tri[0]) + ' commence par 9, mais il n\'a que 6 chiffres.');
        return {
          enonce: 'Quatre coopératives du bassin arachidier ont collecté les quantités d\'arachide suivantes (en kg) :' +
            tableau([['Coopérative'].concat(noms), ['Quantité (kg)'].concat(vals.map(m))]) +
            'a) Quelle coopérative a collecté la plus grande quantité ?<br>b) Ranger ces quantités dans l\'ordre croissant.',
          questions: [
            qcm(rng, 'a) Plus grande quantité :', nomDe(tri[3]), noms),
            qcm(rng, 'b) Ordre croissant :', ecr(tri), autres)
          ],
          indices: ['Compte d\'abord le nombre de chiffres de chaque nombre : celui qui en a le moins est le plus petit.',
            'Pour deux nombres qui ont autant de chiffres, compare les chiffres un par un en partant de la gauche.'],
          solution: sol
        };
      }
      if (niveau === 2) {
        var ter = rng.bool(), N, p1 = 1000, p2;
        if (ter) {
          N = rng.int(2000000, 3499999);
          if (rng.bool(0.3)) N = Math.floor(N / 100000) * 100000 + 99000 + rng.int(500, 999);
          p2 = 100000;
        } else {
          N = rng.int(150000, 899999) * 1000 + rng.int(0, 999);
          if (rng.bool(0.3)) N = Math.floor(N / 1000000) * 1000000 + rng.int(500, 999) * 1000 + rng.int(500, 999);
          p2 = 1000000;
        }
        var r1 = arrondiEntier(N, p1), r2 = arrondiEntier(N, p2);
        return {
          enonce: (ter
            ? 'Au cours d\'un mois, le TER de Dakar a transporté ' + m(N) + ' voyageurs.'
            : 'Le budget annuel d\'une commune de la région de ' + rng.pick(VILLES) + ' s\'élève à ' + m(N) + ' F' + NB + 'CFA.') +
            '<br>Arrondir ce nombre ' + NOMS_ARR[p1][0] + ', puis ' + NOMS_ARR[p2][0] + '.',
          questions: [qnum('Arrondi ' + NOMS_ARR[p1][0] + ' :', r1, ter ? null : 'F CFA'), qnum('Arrondi ' + NOMS_ARR[p2][0] + ' :', r2, ter ? null : 'F CFA')],
          indices: ['Repère le rang demandé, puis regarde le chiffre situé juste à sa droite.',
            'Si ce chiffre vaut 5, 6, 7, 8 ou 9, on prend le multiple suivant ; sinon on garde le multiple inférieur. Les chiffres de droite deviennent des zéros.'],
          solution: ['Tableau de numération : ' + m(N) + '.', explArrondi(N, p1), explArrondi(N, p2)]
        };
      }
      // niveau 3 : encadrement et plus petit / plus grand nombre
      var N3;
      do { N3 = rng.int(1000000, 9999999); } while (N3 % 10000 === 0);
      var lo = Math.floor(N3 / 10000) * 10000, hi = lo + 10000;
      var chif = [0].concat(rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5));
      var desc = chif.slice().sort(function (a, b) { return b - a; });
      var asc = chif.slice().sort(function (a, b) { return a - b; });
      var t0 = asc[0]; asc[0] = asc[1]; asc[1] = t0;
      var grand = parseInt(desc.join(''), 10), petit = parseInt(asc.join(''), 10);
      var liste = rng.shuffle(chif).join(' ; ');
      return {
        enonce: 'a) Encadrer le nombre ' + m(N3) + ' entre deux multiples consécutifs de ' + m(10000) + '.<br>' +
          'b) Avec les six chiffres ' + liste + ', utilisés chacun une seule fois, écrire le plus grand nombre de six chiffres, puis le plus petit.',
        questions: [qnum('a) Borne inférieure :', lo), qnum('a) Borne supérieure :', hi), qnum('b) Plus grand nombre :', grand), qnum('b) Plus petit nombre :', petit)],
        indices: ['Les multiples de $10\\,000$ se terminent par quatre zéros : garde les chiffres jusqu\'aux dizaines de mille.',
          'Pour le plus grand nombre, range les chiffres du plus grand au plus petit. Pour le plus petit, attention : un nombre de six chiffres ne commence pas par 0.'],
        solution: [
          'Le nombre de dizaines de mille de ' + m(N3) + ' est ' + m(Math.floor(N3 / 10000)) + ' : on remplace les quatre derniers chiffres par des zéros pour obtenir ' + m(lo) + ', puis on ajoute ' + m(10000) + '.',
          'Encadrement : $' + n(lo) + ' < ' + n(N3) + ' < ' + n(hi) + '$.',
          'Plus grand nombre : on écrit les chiffres dans l\'ordre décroissant, ' + m(grand) + '.',
          'Plus petit nombre : on voudrait commencer par 0, mais le nombre n\'aurait plus six chiffres. On place donc d\'abord le plus petit chiffre non nul (' + asc[0] + '), puis 0, puis les autres chiffres dans l\'ordre croissant : ' + m(petit) + '.'
        ],
        aide: 'Tu peux écrire les nombres avec ou sans espaces.'
      };
    }
  });

  /* ================================================================== */
  /* 6e — Décimaux : droite graduée, arrondi, décomposition              */
  /* ================================================================== */
  /** Portion de droite graduée de x0 à x1 ; pas = écart entre deux graduations ; lab = valeurs écrites. */
  function figGraduee(x0, x1, pas, lab, points, grosPas) {
    var span = x1 - x0, marge = span * 0.09;
    var f = EM.fig.create({ w: 320, h: 92, xmin: x0 - marge, xmax: x1 + marge, ymin: -0.8, ymax: 0.65, title: 'Droite graduée' });
    f.vector([x0 - marge * 0.9, 0], [x1 + marge * 0.97, 0]);
    var nb = Math.round(span / pas);
    for (var i = 0; i <= nb; i++) {
      var x = x0 + i * pas, h = i % grosPas === 0 ? 0.24 : i % (grosPas / 2) === 0 ? 0.17 : 0.1;
      f.seg([x, -h], [x, h], { light: h < 0.2 });
    }
    lab.forEach(function (v) { f.text([v, -0.62], tx(v), { small: true }); });
    points.forEach(function (p) { f.point([p.x, 0], p.nom, 'n', { accent: true }); });
    return f.svg();
  }

  EM.gen.register({
    id: '6e-plus-decimaux-graduation',
    titre: 'Décimaux : lire une graduation, arrondir, décomposer',
    chapitres: ['6e-decimaux'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.int(0, 14), i1, i2;
        do { i1 = rng.int(1, 19); i2 = rng.int(1, 19); } while (i1 % 10 === 0 || i2 % 10 === 0 || Math.abs(i1 - i2) < 4);
        var xa = R(a + i1 / 10), xb = R(a + i2 / 10);
        return {
          enonce: 'Voici une partie d\'une demi-droite graduée. Lire les abscisses des points $A$ et $B$.',
          figure: figGraduee(a, a + 2, 0.1, [a, a + 1, a + 2], [{ x: xa, nom: 'A' }, { x: xb, nom: 'B' }], 10),
          questions: [qnum('Abscisse de $A$ :', xa), qnum('Abscisse de $B$ :', xb)],
          indices: ['Entre deux nombres entiers consécutifs, l\'unité est partagée en 10 parts égales : chaque petite graduation vaut un dixième, $0{,}1$.',
            'Pars du nombre entier situé juste à gauche du point et compte les dixièmes.'],
          solution: [
            'Entre ' + m(a) + ' et ' + m(a + 1) + ', il y a 10 intervalles : une graduation vaut $1 \\div 10 = 0{,}1$.',
            '$A$ est à ' + (i1 % 10) + ' graduation' + (i1 % 10 > 1 ? 's' : '') + ' à droite de ' + m(Math.floor(xa)) + ' : son abscisse est ' + m(xa) + '.',
            '$B$ est à ' + (i2 % 10) + ' graduation' + (i2 % 10 > 1 ? 's' : '') + ' à droite de ' + m(Math.floor(xb)) + ' : son abscisse est ' + m(xb) + '.'
          ]
        };
      }
      if (niveau === 2) {
        var e = rng.int(0, 19), dix = rng.int(0, 9), u0 = R(e + dix / 10), k = rng.int(1, 9);
        if (k === 5) k = rng.pick([3, 4, 6, 7]);
        var xA = R(u0 + k / 100), arr = k >= 5 ? R(u0 + 0.1) : u0;
        return {
          enonce: 'On a « zoomé » sur une demi-droite graduée entre ' + m(u0) + ' et ' + m(R(u0 + 0.1)) + '.<br>a) Lire l\'abscisse du point $A$.<br>b) Donner l\'arrondi au dixième de cette abscisse.',
          figure: figGraduee(u0, R(u0 + 0.1), 0.01, [u0, R(u0 + 0.1)], [{ x: xA, nom: 'A' }], 10),
          questions: [qnum('a) Abscisse de $A$ :', xA), qnum('b) Arrondi au dixième :', arr)],
          indices: ['L\'écart entre les deux nombres écrits est $0{,}1$, partagé en 10 parts égales : chaque graduation vaut un centième, $0{,}01$.',
            'Pour l\'arrondi au dixième, cherche le dixième le plus proche sur la figure : regarde le chiffre des centièmes.'],
          solution: [
            'Une graduation vaut $0{,}1 \\div 10 = 0{,}01$.',
            '$A$ est à ' + k + ' graduation' + (k > 1 ? 's' : '') + ' à droite de ' + m(u0) + ' : son abscisse est $' + n(u0) + ' + ' + n(k / 100) + ' = ' + n(xA) + '$.',
            'Le chiffre des centièmes de ' + m(xA) + ' est ' + k + (k >= 5 ? ' : il est supérieur ou égal à 5, l\'arrondi au dixième est ' + m(arr) + ' (le point $A$ est plus proche de ' + m(arr) + ').'
              : ' : il est inférieur à 5, l\'arrondi au dixième est ' + m(arr) + ' (le point $A$ est plus proche de ' + m(arr) + ').')
        ]
        };
      }
      // niveau 3 : décomposition et « nombre de centièmes »
      var E = rng.int(1, 99), cd = [rng.int(1, 9), rng.int(1, 9), rng.int(1, 9)], absent = rng.int(0, 2);
      cd[absent] = 0;
      var termes = [{ t: n(E), v: E }];
      var den = [10, 100, 1000];
      var gros = rng.bool(0.5) && absent !== 1;
      cd.forEach(function (c, j) {
        if (!c) return;
        if (gros && j === 1) {
          // le terme des centièmes déborde : 1x/100 au lieu de x/100
          termes.push({ t: '\\dfrac{' + (10 + c) + '}{100}', v: (10 + c) / 100 });
        } else termes.push({ t: '\\dfrac{' + c + '}{' + n(den[j]) + '}', v: c / den[j] });
      });
      termes = rng.shuffle(termes);
      var val = R(termes.reduce(function (s, x) { return s + x.v; }, 0));
      var X = R(rng.int(10001, 99999) / 1000), nbC = Math.floor(R(X * 100));
      return {
        enonce: 'a) Écrire sous la forme d\'un nombre décimal : $$' + termes.map(function (x) { return x.t; }).join(' + ') + '$$' +
          'b) Combien y a-t-il de centièmes dans le nombre ' + m(X) + ' ? (On demande le <b>nombre</b> de centièmes, pas le chiffre des centièmes.)',
        questions: [qnum('a) Nombre décimal :', val), qnum('b) Nombre de centièmes :', nbC)],
        indices: ['Écris chaque fraction décimale sous forme décimale : $\\dfrac{3}{10} = 0{,}3$, $\\dfrac{3}{100} = 0{,}03$, $\\dfrac{3}{1\\,000} = 0{,}003$.',
          'Comme pour les entiers, le nombre de centièmes s\'obtient en gardant tous les chiffres jusqu\'au rang des centièmes : $' + n(X) + ' = ' + n(nbC) + ' \\times 0{,}01 + \\ldots$'],
        solution: [
          'Chaque terme s\'écrit en écriture décimale : $' + termes.map(function (x) { return n(x.v); }).join(' + ') + '$.',
          (gros ? 'Attention : $\\dfrac{' + (10 + cd[1]) + '}{100} = ' + n((10 + cd[1]) / 100) + '$ contient un dixième et ' + cd[1] + ' centième' + (cd[1] > 1 ? 's' : '') + '. ' : '') +
            'En additionnant : ' + m(val) + '.',
          'Dans ' + m(X) + ', il y a ' + m(nbC) + ' centièmes, car $' + n(X) + ' = \\dfrac{' + n(Math.round(X * 1000)) + '}{1\\,000}$ et qu\'on garde les chiffres jusqu\'au rang des centièmes : ' + m(nbC) + ' (le chiffre des centièmes, lui, est ' + (nbC % 10) + ').'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Multiples et diviseurs : nombres premiers, partages, lots      */
  /* ================================================================== */
  var PREMIERS = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  var COMPOSES = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];
  function plusPetitDiv(x) { for (var d = 2; d * d <= x; d++) if (x % d === 0) return d; return x; }

  EM.gen.register({
    id: '6e-plus-premiers-partages',
    titre: 'Nombres premiers, partages en équipes et lots',
    chapitres: ['6e-multiples-diviseurs'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var i;
      if (niveau === 1) {
        var p = rng.pick(PREMIERS), faux = rng.sample(COMPOSES, 3), x = rng.pick(faux), dx = plusPetitDiv(x);
        var tous = rng.shuffle([p].concat(faux));
        return {
          enonce: 'a) Parmi les nombres ' + tous.map(m).join(' ; ') + ', un seul est un nombre premier. Lequel ?<br>b) Donner le plus petit diviseur de ' + m(x) + ' autre que 1.',
          questions: [qcm(rng, 'a) Nombre premier :', m(p), faux.map(m)), qnum('b) Plus petit diviseur de ' + m(x) + ' :', dx)],
          indices: ['Un nombre premier a exactement deux diviseurs : 1 et lui-même. Teste la divisibilité par 2, 3, 5 et 7.',
            'Pense aux critères : somme des chiffres pour 3, et calcule les tables de 7 (49, 63, 77, 91…).'],
          solution: faux.map(function (v) { var d = plusPetitDiv(v); return m(v) + ' n\'est pas premier : $' + v + ' = ' + d + ' \\times ' + (v / d) + '$.'; }).concat([
            m(p) + ' n\'est divisible ni par 2, ni par 3, ni par 5, ni par 7. Comme $10 \\times 10 = 100$ dépasse ' + m(p) + ', il n\'est pas utile de tester d\'autres diviseurs : ' + m(p) + ' est premier.',
            'Le plus petit diviseur de ' + m(x) + ' autre que 1 est ' + m(dx) + ' : $' + x + ' = ' + dx + ' \\times ' + (x / dx) + '$.'
          ])
        };
      }
      if (niveau === 2) {
        var N, lo, hi, S, g = 0;
        do {
          N = rng.pick([24, 30, 36, 40, 42, 48, 54, 56, 60, 63, 72, 80, 84, 90, 96]);
          lo = rng.int(3, 5); hi = rng.int(8, 12);
          S = EM.ar.divisors(N).filter(function (d) { return d >= lo && d <= hi; });
          g++;
        } while (g < 100 && S.length < 2);
        var maxS = S[S.length - 1];
        var ctx = rng.pick([
          'Pour un tournoi de football de quartier à ' + rng.pick(VILLES) + ', ' + m(N) + ' jeunes doivent être répartis en équipes ayant toutes le même nombre de joueurs, sans que personne ne reste à l\'écart.',
          'Le professeur d\'EPS d\'un collège de ' + rng.pick(VILLES) + ' veut partager ses ' + m(N) + ' élèves en groupes ayant tous le même effectif, sans qu\'il reste d\'élève.',
          'Une association de ' + m(N) + ' femmes de ' + rng.pick(VILLES) + ' veut former des groupes de travail ayant tous le même nombre de membres, sans que personne ne reste seule.'
        ]);
        return {
          enonce: ctx + ' Chaque groupe doit compter au moins ' + m(lo) + ' et au plus ' + m(hi) + ' personnes.<br>a) Donner tous les effectifs possibles pour un groupe.<br>b) Combien de groupes obtient-on avec l\'effectif le plus grand possible ?',
          questions: [{ label: 'a) Effectifs possibles :', type: 'set', reponse: S }, qnum('b) Nombre de groupes :', N / maxS)],
          indices: ['L\'effectif d\'un groupe doit être un diviseur de ' + m(N) + '.', 'Écris tous les diviseurs de ' + m(N) + ' par paires, puis garde ceux qui sont compris entre ' + m(lo) + ' et ' + m(hi) + '.'],
          solution: [
            'On ne doit laisser personne : l\'effectif d\'un groupe est donc un diviseur de ' + m(N) + '.',
            'Diviseurs de ' + m(N) + ' : $' + T.set(EM.ar.divisors(N)) + '$.',
            'Ceux qui sont compris entre ' + m(lo) + ' et ' + m(hi) + ' : $' + T.set(S) + '$.',
            'Avec ' + m(maxS) + ' personnes par groupe, on forme $' + N + ' \\div ' + maxS + ' = ' + (N / maxS) + '$ groupes.'
          ],
          aide: 'Sépare les nombres par « ; ».'
        };
      }
      // niveau 3 : multiples communs
      var paires = [[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [6, 10], [9, 12], [10, 12], [12, 15], [5, 6], [8, 10], [6, 15]];
      var pr, L, cible, bas, haut, guard = 0;
      do {
        pr = rng.pick(paires); L = ar.lcm(pr[0], pr[1]);
        cible = L * rng.int(Math.ceil(60 / L), Math.floor(240 / L));
        bas = Math.max(1, 10 * Math.floor((cible - rng.int(1, L - 1)) / 10));
        haut = 10 * Math.ceil((cible + rng.int(1, L - 1)) / 10);
        var compte = 0;
        for (i = bas; i <= haut; i++) if (i % L === 0) compte++;
        guard++;
      } while (guard < 200 && (compte !== 1 || bas === cible || haut === cible || bas < 20));
      var a = pr[0], b = pr[1];
      var communs = [];
      for (i = 1; i < 100; i++) if (i % a === 0 && i % b === 0) communs.push(i);
      var mA = [], mB = [];
      for (i = a; i < 100; i += a) mA.push(i);
      for (i = b; i < 100; i += b) mB.push(i);
      var vend = personne(rng);
      return {
        enonce: 'a) Écrire la liste des multiples communs non nuls de ' + m(a) + ' et de ' + m(b) + ' qui sont inférieurs à ' + m(100) + '.<br>' +
          'b) Au marché de ' + rng.pick(VILLES) + ', ' + vend.nom + ' a entre ' + m(bas) + ' et ' + m(haut) + ' mangues. ' + vend.Il + ' peut les ranger exactement en tas de ' + m(a) + ' mangues, ou exactement en tas de ' + m(b) + ' mangues, sans qu\'il en reste. Combien a-t-' + vend.il + ' de mangues ?',
        questions: [{ label: 'a) Multiples communs :', type: 'set', reponse: communs }, qnum('b) Nombre de mangues :', cible)],
        indices: ['Écris les multiples de ' + m(a) + ', puis ceux de ' + m(b) + ', et repère ceux qui apparaissent dans les deux listes.',
          'Le nombre de mangues est un multiple de ' + m(a) + ' et de ' + m(b) + ' : c\'est un multiple de ' + m(L) + '.'],
        solution: [
          'Multiples de ' + m(a) + ' inférieurs à 100 : ' + mA.join(', ') + '.',
          'Multiples de ' + m(b) + ' inférieurs à 100 : ' + mB.join(', ') + '.',
          'Multiples communs : $' + T.set(communs) + '$. Ce sont les multiples de ' + m(L) + ', le plus petit d\'entre eux.',
          'Le nombre de mangues est un multiple commun de ' + m(a) + ' et de ' + m(b) + ', donc un multiple de ' + m(L) + '. Entre ' + m(bas) + ' et ' + m(haut) + ', le seul est ' + m(cible) + ' $= ' + L + ' \\times ' + (cible / L) + '$.',
          'Vérification : $' + cible + ' = ' + a + ' \\times ' + (cible / a) + ' = ' + b + ' \\times ' + (cible / b) + '$.'
        ],
        aide: 'Sépare les nombres par « ; ».'
      };
    }
  });

  /* ================================================================== */
  /* 6e — Données : tableau à double entrée et graphique                 */
  /* ================================================================== */
  function figCourbe(cats, vals, y0, y1, pas, pasLab, titre) {
    var nC = cats.length, span = y1 - y0;
    var f = EM.fig.create({ w: 320, h: 230, xmin: -0.75, xmax: nC + 0.45, ymin: y0 - span * 0.13, ymax: y1 + span * 0.07, title: titre });
    var y, k = 0;
    for (y = y0; y <= y1 + 1e-9; y += pas, k++) {
      ligneGrille(f, [0, y], [nC + 0.3, y]);
      if (k % Math.round(pasLab / pas) === 0) f.text([-0.12, y - span * 0.018], tx(y), { small: true, anchor: 'end' });
    }
    cats.forEach(function (c, i) {
      ligneGrille(f, [i + 1, y0], [i + 1, y1]);
      f.text([i + 1, y0 - span * 0.085], c, { small: true });
    });
    f.seg([0, y0], [nC + 0.35, y0]).seg([0, y0], [0, y1 + span * 0.05]);
    var pts = vals.map(function (v, i) { return [i + 1, v]; });
    f.polyline(pts, { accent: true });
    pts.forEach(function (p) { f.dot(p, { accent: true }); });
    return f.svg();
  }

  EM.gen.register({
    id: '6e-plus-tableau-graphique',
    titre: 'Compléter un tableau à double entrée, lire un graphique',
    chapitres: ['6e-donnees'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var i, CL = ['6e', '5e', '4e', '3e'];
      if (niveau <= 2) {
        var Fi = [], Gi = [], Ti = [], g = 0, kp = rng.int(0, 3), pct = 0;
        do {
          Fi = []; Gi = []; Ti = [];
          for (i = 0; i < 4; i++) { Fi.push(rng.int(35, 95)); Gi.push(rng.int(35, 95)); }
          if (niveau === 2) {
            var tot = rng.pick([40, 50, 60, 75, 80, 100]), choixP = [];
            for (var pp = 30; pp <= 70; pp += 5) if ((pp * tot) % 100 === 0 && pp !== 50) choixP.push(pp);
            pct = rng.pick(choixP);
            Fi[kp] = pct * tot / 100; Gi[kp] = tot - Fi[kp];
          }
          for (i = 0; i < 4; i++) Ti.push(Fi[i] + Gi[i]);
          var mx = Math.max.apply(null, Ti);
          g++;
        } while (g < 200 && Ti.filter(function (t) { return t === mx; }).length > 1);
        var SF = EM.util.sum(Fi), SG = EM.util.sum(Gi), ST = SF + SG;
        var ecole = 'un collège de ' + rng.pick(VILLES);
        if (niveau === 1) {
          var kc = rng.int(0, 3);
          var lF = ['Filles'].concat(Fi.map(function (v, j) { return j === kc ? '…' : m(v); })).concat([m(SF)]);
          var lG = ['Garçons'].concat(Gi.map(m)).concat(['…']);
          var lT = ['Total'].concat(Ti.map(m)).concat([m(ST)]);
          return {
            enonce: 'Le tableau donne la répartition des élèves d\'' + ecole + ' par niveau.' +
              tableau([['Niveau'].concat(CL).concat(['Total']), lF, lG, lT]) +
              'Compléter les deux cases manquantes : le nombre de filles en ' + CL[kc] + ', puis le nombre total de garçons.',
            questions: [qnum('Filles en ' + CL[kc] + ' :', Fi[kc]), qnum('Total des garçons :', SG)],
            indices: ['Dans la colonne ' + CL[kc] + ', le total est la somme des filles et des garçons.', 'Le total des garçons est la somme de la ligne « Garçons » (ou le total général moins le total des filles).'],
            solution: [
              'Colonne ' + CL[kc] + ' : filles $= ' + Ti[kc] + ' - ' + Gi[kc] + ' = ' + Fi[kc] + '$.',
              'Ligne « Garçons » : $' + Gi.join(' + ') + ' = ' + SG + '$.',
              'Vérification : $' + SF + ' + ' + SG + ' = ' + ST + '$, qui est bien le total général.'
            ]
          };
        }
        var imax = Ti.indexOf(Math.max.apply(null, Ti));
        return {
          enonce: 'Le tableau donne la répartition des élèves d\'' + ecole + ' par niveau.' +
            tableau([['Niveau'].concat(CL).concat(['Total']), ['Filles'].concat(Fi.map(m)).concat([m(SF)]), ['Garçons'].concat(Gi.map(m)).concat([m(SG)]), ['Total'].concat(Ti.map(m)).concat([m(ST)])]) +
            'a) Quel niveau compte le plus d\'élèves ?<br>b) Quel pourcentage des élèves de ' + CL[kp] + ' sont des filles ?',
          questions: [qcm(rng, 'a) Niveau le plus nombreux :', CL[imax], CL), qnum('b) Pourcentage de filles en ' + CL[kp] + ' :', pct, '%')],
          indices: ['Compare les nombres de la ligne « Total ».', 'Pourcentage $= \\dfrac{\\text{partie}}{\\text{total}} \\times 100$ : ici, filles de ' + CL[kp] + ' divisées par le total de ' + CL[kp] + '.'],
          solution: [
            'Le plus grand total de la dernière ligne est ' + m(Ti[imax]) + ', en ' + CL[imax] + '.',
            'En ' + CL[kp] + ' : ' + m(Fi[kp]) + ' filles sur ' + m(Ti[kp]) + ' élèves.',
            'Pourcentage : $\\dfrac{' + Fi[kp] + '}{' + Ti[kp] + '} \\times 100 = ' + pct + '$ %.'
          ]
        };
      }
      // niveau 3 : lecture d'un graphique
      var pluie = rng.bool(), cats, noms, vals, y0, y1, pas, pasLab, unite, titre, phrase;
      if (pluie) {
        cats = ['Juin', 'Juil.', 'Août', 'Sept.', 'Oct.']; noms = ['juin', 'juillet', 'août', 'septembre', 'octobre'];
        var base = [150, 300, 450, 350, 150], gg = 0;
        do { vals = base.map(function (v) { return v + 50 * rng.int(-1, 1); }); gg++; } while (gg < 100 && vals.filter(function (v) { return v === Math.max.apply(null, vals); }).length > 1);
        y0 = 0; y1 = 600; pas = 50; pasLab = 100; unite = 'mm';
        titre = 'Hauteur de pluie (en mm) à Ziguinchor';
        phrase = 'Le graphique donne la hauteur de pluie tombée chaque mois à Ziguinchor pendant l\'hivernage (en mm). Chaque ligne horizontale correspond à $50$ mm.';
      } else {
        cats = ['6 h', '9 h', '12 h', '15 h', '18 h', '21 h']; noms = ['6 h', '9 h', '12 h', '15 h', '18 h', '21 h'];
        var bt = [24, 30, 36, 40, 34, 28], gt = 0;
        do { vals = bt.map(function (v) { return v + 2 * rng.int(-1, 1); }); gt++; } while (gt < 100 && vals.filter(function (v) { return v === Math.max.apply(null, vals); }).length > 1);
        y0 = 20; y1 = 44; pas = 2; pasLab = 4; unite = '°C';
        titre = 'Température (en °C) à Tambacounda';
        phrase = 'Le graphique donne la température relevée à Tambacounda au cours d\'une journée de mai (en °C). Chaque ligne horizontale correspond à $2$ °C.';
      }
      var ik = rng.int(0, cats.length - 1), vmax = Math.max.apply(null, vals), vmin = Math.min.apply(null, vals), im = vals.indexOf(vmax);
      return {
        enonce: phrase + '<br>a) Lire la valeur relevée à « ' + noms[ik] + ' ».<br>b) À quel moment la valeur est-elle la plus élevée ?<br>c) Calculer l\'écart entre la plus grande et la plus petite valeur.',
        figure: figCourbe(cats, vals, y0, y1, pas, pasLab, titre),
        questions: [qnum('a) Valeur à « ' + noms[ik] + ' » :', vals[ik], unite === 'mm' ? 'mm' : null), qcm(rng, 'b) Valeur la plus élevée :', noms[im], noms), qnum('c) Écart :', vmax - vmin, unite === 'mm' ? 'mm' : null)],
        indices: ['Pars du point, suis la ligne horizontale jusqu\'à l\'axe vertical. Certaines valeurs tombent entre deux nombres écrits : compte les lignes horizontales.',
          'L\'écart est la différence entre la plus grande et la plus petite valeur lues.'],
        solution: [
          'Valeurs lues : ' + noms.map(function (c, j) { return c + ' : ' + u(vals[j], unite); }).join(' ; ') + '.',
          'Le point le plus haut correspond à « ' + noms[im] + ' » (' + u(vmax, unite) + ').',
          'Écart : $' + vmax + ' - ' + vmin + ' = ' + (vmax - vmin) + '$ ' + unite + '.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Droites : appartenance, nombre de droites, milieux             */
  /* ================================================================== */
  EM.gen.register({
    id: '6e-plus-droites-appartenance',
    titre: 'Droites, segments et demi-droites : lire une figure, compter, calculer',
    chapitres: ['6e-droites'],
    niveaux: 3,
    examen: false,
    gen: function (rng, niveau) {
      var i;
      if (niveau === 1) {
        var tb = 4, tc = rng.pick([-2.2, 1.7, 2.3, 6.2]), pente = rng.int(-3, 3) / 10;
        var unit = [1 / Math.sqrt(1 + pente * pente), pente / Math.sqrt(1 + pente * pente)];
        var P = function (t, off) { return [t * unit[0] - off * unit[1], t * unit[1] + off * unit[0]]; };
        var pA = P(0, 0), pB = P(tb, 0), pC = P(tc, 0);
        var tE = rng.pick([-1, 1.2, 3, 5]), tF, gF = 0;
        do { tF = rng.int(-25, 65) / 10; gF++; } while (gF < 200 && [0, tb, tc].some(function (t) { return Math.abs(tF - t) < 1.2; }));
        var pE = P(tE, 1.5), pF = P(tF, -1.4);
        var entre = tc > 0 && tc < tb;
        var S = [
          ['$C \\in (AB)$', true], ['$C \\notin (AB)$', false], ['$E \\in (AB)$', false], ['$E \\notin (AB)$', true],
          ['$F \\in (AB)$', false], ['$F \\notin (AB)$', true],
          ['$C \\in [AB]$', entre], ['$C \\notin [AB]$', !entre], ['$C \\in [AB)$', tc > 0], ['$C \\in [BA)$', tc < tb],
          ['$A \\in [BC]$', tc < 0], ['$B \\in [AC]$', tc > tb],
          ['les points $A$, $B$ et $C$ sont alignés', true], ['les points $A$, $B$ et $E$ sont alignés', false]
        ];
        var vrais = rng.shuffle(S.filter(function (s) { return s[1]; })), fauxL = rng.shuffle(S.filter(function (s) { return !s[1]; }));
        var q1 = qcm(rng, 'a) Affirmation vraie :', vrais[0][0], fauxL.slice(0, 3).map(function (s) { return s[0]; }));
        var q2 = qcm(rng, 'b) Affirmation fausse :', fauxL[3][0], vrais.slice(1, 4).map(function (s) { return s[0]; }));
        var tous = [pA, pB, pC, pE, pF];
        var f = EM.fig.fit(tous.concat([P(-3, 0), P(7, 0)]), { w: 300, h: 170, pad: 22 });
        f.line(pA, pB);
        f.point(pA, 'A', 's').point(pB, 'B', 's').point(pC, 'C', 's').point(pE, 'E', 'n').point(pF, 'F', 's');
        var expl = function (s) { return s[0] + (s[1] ? ' est vraie' : ' est fausse'); };
        return {
          enonce: 'Observer la figure : les points $A$, $B$ et $C$ sont sur la droite tracée ; $E$ et $F$ n\'y sont pas.<br>a) Quelle affirmation est vraie ?<br>b) Quelle affirmation est fausse ?',
          figure: f.svg(),
          questions: [q1, q2],
          indices: ['$(AB)$ est la droite, $[AB]$ le segment (entre $A$ et $B$), $[AB)$ la demi-droite d\'origine $A$ qui passe par $B$.',
            'Le symbole $\\in$ se lit « appartient à », le symbole $\\notin$ « n\'appartient pas à ».'],
          solution: [
            'Le point $C$ est sur la droite $(AB)$' + (entre ? ', entre $A$ et $B$ : il appartient au segment $[AB]$.' : tc < 0 ? ', du côté de $A$ opposé à $B$ : il n\'appartient pas au segment $[AB]$ ni à la demi-droite $[AB)$, mais il appartient à $[BA)$.' : ', au-delà de $B$ : il n\'appartient pas au segment $[AB]$ mais il appartient à la demi-droite $[AB)$.'),
            'Les points $E$ et $F$ ne sont pas sur la droite $(AB)$ : $E \\notin (AB)$ et $F \\notin (AB)$.',
            'a) ' + expl(vrais[0]) + '. Les autres propositions sont fausses : ' + fauxL.slice(0, 3).map(function (s) { return s[0]; }).join(' ; ') + '.',
            'b) ' + expl(fauxL[3]) + '. Les autres sont vraies : ' + vrais.slice(1, 4).map(function (s) { return s[0]; }).join(' ; ') + '.'
          ]
        };
      }
      if (niveau === 2) {
        var cas = rng.pick(['general', 'general', 'aligne']), nP, pts = [], nomsP = ['A', 'B', 'C', 'D', 'E', 'F'], droites, segs, g2 = 0;
        var colin = function (a, b, c) { return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])); };
        var ok;
        do {
          pts = [];
          if (cas === 'general') {
            nP = rng.int(4, 6);
            var dep = rng.int(0, 359);
            for (i = 0; i < nP; i++) pts.push(pt([0, 0], dep + i * 360 / nP + rng.int(-12, 12), 3 + rng.next()));
          } else {
            nP = rng.pick([4, 5]);
            pts = [[0, 0], [2.2 + rng.next(), 0], [4.8 + rng.next(), 0]];
            pts.push([rng.int(5, 30) / 10, rng.pick([2.5, 3])]);
            if (nP === 5) pts.push([rng.int(10, 40) / 10, rng.pick([-2.5, -3])]);
          }
          ok = true;
          for (var a1 = 0; a1 < nP; a1++) for (var b1 = a1 + 1; b1 < nP; b1++) for (var c1 = b1 + 1; c1 < nP; c1++) {
            var al = cas === 'aligne' && a1 === 0 && b1 === 1 && c1 === 2;
            if (!al && colin(pts[a1], pts[b1], pts[c1]) < 2.5) ok = false;
          }
          g2++;
        } while (!ok && g2 < 300);
        segs = nP * (nP - 1) / 2;
        droites = cas === 'general' ? segs : segs - 2;
        var ctr = centre(pts);
        var f2 = EM.fig.fit(pts, { w: 260, h: 200, pad: 30 });
        if (cas === 'aligne') f2.line(pts[0], pts[2], { light: true, dash: true });
        pts.forEach(function (p, j) { f2.point(p, nomsP[j], cas === 'aligne' && j < 3 ? 's' : posLoin(p, ctr)); });
        var noms2 = nomsP.slice(0, nP).map(function (x) { return '$' + x + '$'; }).join(', ');
        return {
          enonce: 'On considère les ' + nP + ' points ' + noms2 + ' de la figure. ' +
            (cas === 'general' ? 'Trois d\'entre eux ne sont jamais alignés.' : 'Les points $A$, $B$ et $C$ sont alignés ; à part eux, trois de ces points ne sont jamais alignés.') +
            '<br>a) Combien de segments ont pour extrémités deux de ces points ?<br>b) Combien de droites différentes passent par au moins deux de ces points ?',
          figure: f2.svg(),
          questions: [qnum('a) Nombre de segments :', segs), qnum('b) Nombre de droites :', droites)],
          indices: ['Chaque point peut être relié à chacun des ' + (nP - 1) + ' autres ; mais le segment $[AB]$ et le segment $[BA]$ sont le même.',
            'Par deux points passe une seule droite. Si trois points sont alignés, les droites $(AB)$, $(AC)$ et $(BC)$ sont la même droite.'],
          solution: [
            'Chaque point est l\'extrémité de ' + (nP - 1) + ' segments. Cela fait $' + nP + ' \\times ' + (nP - 1) + ' = ' + nP * (nP - 1) + '$, mais chaque segment est compté deux fois (une fois par extrémité) : $' + nP * (nP - 1) + ' \\div 2 = ' + segs + '$ segments.',
            cas === 'general'
              ? 'Comme trois points ne sont jamais alignés, chaque segment donne une droite différente : il y a ' + m(droites) + ' droites.'
              : 'Les trois segments $[AB]$, $[AC]$ et $[BC]$ sont portés par la même droite $(AB)$ : ces trois segments ne donnent qu\'une seule droite. Il y a donc $' + segs + ' - 3 + 1 = ' + droites + '$ droites.'
          ]
        };
      }
      // niveau 3 : points alignés et milieux
      var a = rng.int(25, 60) / 10, b = rng.int(10, 50) / 10, c = rng.int(25, 60) / 10;
      var AD = R(a + b + c), IJ = R(a / 2 + b + c / 2);
      var X = [0, a, a + b, a + b + c].map(function (v) { return [v, 0]; });
      var pI = [a / 2, 0], pJ = [a + b + c / 2, 0];
      var f3 = EM.fig.fit(X.concat([[0, 1.2], [0, -1.2]]), { w: 300, h: 90, pad: 18 });
      f3.seg(X[0], X[3]);
      f3.point(X[0], 'A', 'n').point(X[1], 'B', 'n').point(X[2], 'C', 'n').point(X[3], 'D', 'n').point(pI, 'I', 's').point(pJ, 'J', 's');
      f3.ticks(X[0], pI, 2).ticks(pI, X[1], 2).ticks(X[2], pJ, 3).ticks(pJ, X[3], 3);
      return {
        enonce: 'Les points $A$, $B$, $C$ et $D$ sont alignés dans cet ordre, avec $AB = ' + n(a) + '$ cm, $BC = ' + n(b) + '$ cm et $CD = ' + n(c) + '$ cm. Le point $I$ est le milieu de $[AB]$ et $J$ est le milieu de $[CD]$.<br>Calculer $AD$, puis $IJ$.',
        figure: f3.svg(),
        questions: [qnum('$AD =$', AD, 'cm'), qnum('$IJ =$', IJ, 'cm')],
        indices: ['Les points étant alignés dans l\'ordre $A$, $B$, $C$, $D$ : $AD = AB + BC + CD$.', 'Décompose $IJ = IB + BC + CJ$, avec $IB = \\dfrac{AB}{2}$ et $CJ = \\dfrac{CD}{2}$.'],
        solution: [
          '$AD = AB + BC + CD = ' + n(a) + ' + ' + n(b) + ' + ' + n(c) + ' = ' + n(AD) + '$ cm.',
          '$I$ est le milieu de $[AB]$ : $IB = \\dfrac{' + n(a) + '}{2} = ' + n(a / 2) + '$ cm. $J$ est le milieu de $[CD]$ : $CJ = \\dfrac{' + n(c) + '}{2} = ' + n(c / 2) + '$ cm.',
          'Les points $I$, $B$, $C$, $J$ sont alignés dans cet ordre : $IJ = IB + BC + CJ = ' + n(a / 2) + ' + ' + n(b) + ' + ' + n(c / 2) + ' = ' + n(IJ) + '$ cm.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Perpendiculaires et parallèles sur quadrillage                 */
  /* ================================================================== */
  /** Segment de la droite passant par P et dirigée par d, coupé au rectangle [0 ; W] × [0 ; H]. */
  function clipLigne(P, d, W, H) {
    var ts = [];
    if (d[0] !== 0) [0, W].forEach(function (x) { var t = (x - P[0]) / d[0], y = P[1] + t * d[1]; if (y >= -1e-9 && y <= H + 1e-9) ts.push(t); });
    if (d[1] !== 0) [0, H].forEach(function (y) { var t = (y - P[1]) / d[1], x = P[0] + t * d[0]; if (x >= -1e-9 && x <= W + 1e-9) ts.push(t); });
    var t0 = Math.min.apply(null, ts), t1 = Math.max.apply(null, ts);
    return [[P[0] + t0 * d[0], P[1] + t0 * d[1]], [P[0] + t1 * d[0], P[1] + t1 * d[1]]];
  }
  function distDroite(M, P, d) { return Math.abs((M[0] - P[0]) * d[1] - (M[1] - P[1]) * d[0]) / Math.sqrt(d[0] * d[0] + d[1] * d[1]); }
  /** Description d'un déplacement sur le quadrillage. */
  function deplacement(dx, dy) {
    if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy; }
    var s = [];
    if (dx) s.push(dx + ' carreau' + (dx > 1 ? 'x' : '') + ' vers la droite');
    if (dy) s.push(Math.abs(dy) + ' carreau' + (Math.abs(dy) > 1 ? 'x' : '') + (dy > 0 ? ' vers le haut' : ' vers le bas'));
    return s.join(' et ');
  }

  /** Trajet orienté sur le quadrillage. */
  function trajet(dx, dy) {
    var s = [];
    if (dx) s.push(Math.abs(dx) + ' carreau' + (Math.abs(dx) > 1 ? 'x' : '') + (dx > 0 ? ' vers la droite' : ' vers la gauche'));
    if (dy) s.push(Math.abs(dy) + ' carreau' + (Math.abs(dy) > 1 ? 'x' : '') + (dy > 0 ? ' vers le haut' : ' vers le bas'));
    return s.join(' et ');
  }

  EM.gen.register({
    id: '6e-plus-quadrillage-perpendiculaires',
    titre: 'Perpendiculaires, parallèles et distance sur quadrillage',
    chapitres: ['6e-perpendiculaires-paralleles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var W = 12, H = 9, f, i;
      if (niveau === 1) {
        var DIRS = [[2, 1], [1, 2], [3, 1], [1, 3], [2, -1], [1, -2], [3, -1], [1, -3], [3, 2], [2, 3], [3, -2], [2, -3]];
        var v, wv, z, lignes, ok = false, g = 0;
        while (!ok && g < 400) {
          g++;
          v = rng.pick(DIRS); wv = [-v[1], v[0]];
          var cz = DIRS.filter(function (d) { return d[0] * v[1] - d[1] * v[0] !== 0 && d[0] * v[0] + d[1] * v[1] !== 0; });
          z = rng.pick(cz);
          var P0 = [rng.int(2, W - 2), rng.int(2, H - 2)];
          lignes = [{ nom: '(d)', d: v, P: P0, role: 'ref' }];
          var roles = [['perp', wv], ['par', v], ['autre', z]];
          roles.forEach(function (r) { lignes.push({ d: r[1], P: [rng.int(1, W - 1), rng.int(1, H - 1)], role: r[0] }); });
          ok = true;
          lignes.forEach(function (L) {
            L.seg = clipLigne(L.P, L.d, W, H);
            var len = dist(L.seg[0], L.seg[1]);
            if (len < 5) ok = false;
            var uu = [(L.seg[1][0] - L.seg[0][0]) / len, (L.seg[1][1] - L.seg[0][1]) / len];
            L.lab = [L.seg[1][0] - 1.0 * uu[0] - 0.55 * uu[1], L.seg[1][1] - 1.0 * uu[1] + 0.55 * uu[0]];
            if (L.lab[0] < 0.7 || L.lab[0] > W - 0.7 || L.lab[1] < 0.5 || L.lab[1] > H - 0.4) ok = false;
          });
          if (!ok) continue;
          if (distDroite(lignes[2].P, P0, v) < 2) ok = false;
          for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) {
            if (a === b) continue;
            if (a < b && dist(lignes[a].lab, lignes[b].lab) < 2) ok = false;
            if (distDroite(lignes[a].lab, lignes[b].P, lignes[b].d) < 0.7) ok = false;
          }
        }
        var nomsD = rng.shuffle(['1', '2', '3']);
        lignes.slice(1).forEach(function (L, j) { L.nom = '(d' + String.fromCharCode(8320 + Number(nomsD[j])) + ')'; L.tex = '$(d_' + nomsD[j] + ')$'; });
        f = quadrillage(W, H);
        lignes.forEach(function (L) {
          f.seg(L.seg[0], L.seg[1], { accent: L.role === 'ref' });
          f.text([L.lab[0], L.lab[1] - 0.15], L.nom, { small: true, accent: L.role === 'ref' });
        });
        var byRole = {};
        lignes.forEach(function (L) { byRole[L.role] = L; });
        var choix = lignes.slice(1).map(function (L) { return L.tex; });
        return {
          enonce: 'Sur le quadrillage, on a tracé la droite $(d)$ (en couleur) et trois autres droites.<br>a) Laquelle est perpendiculaire à $(d)$ ?<br>b) Laquelle est parallèle à $(d)$ ?',
          figure: f.svg(),
          questions: [qcm(rng, 'a) Perpendiculaire à $(d)$ :', byRole.perp.tex, choix), qcm(rng, 'b) Parallèle à $(d)$ :', byRole.par.tex, choix)],
          indices: ['Pour chaque droite, compte de combien de carreaux elle monte (ou descend) quand on avance d\'un certain nombre de carreaux vers la droite.',
            'Deux droites parallèles suivent le même « chemin » sur le quadrillage. Pour une perpendiculaire, le chemin a tourné d\'un quart de tour : vérifie avec ton équerre.'],
          solution: [
            'Sur $(d)$, on passe d\'un nœud du quadrillage au suivant en avançant de ' + deplacement(v[0], v[1]) + '.',
            byRole.par.tex + ' suit exactement le même chemin (' + deplacement(v[0], v[1]) + ') sans se confondre avec $(d)$ : elle est parallèle à $(d)$.',
            byRole.perp.tex + ' avance de ' + deplacement(wv[0], wv[1]) + ' : c\'est le chemin de $(d)$ tourné d\'un quart de tour. Elle forme un angle droit avec $(d)$ (on le vérifie avec l\'équerre) : elle est perpendiculaire à $(d)$.',
            byRole.autre.tex + ' avance de ' + deplacement(z[0], z[1]) + ' : elle n\'est ni parallèle ni perpendiculaire à $(d)$.'
          ]
        };
      }
      // niveau 2 : distance d'un point à une droite
      var horiz = rng.bool(), c0 = horiz ? rng.int(2, H - 2) : rng.int(2, W - 2), k, A, pied, lettres = rng.shuffle(['H', 'K', 'L', 'M']).slice(0, 3);
      var echelle = rng.pick([0.5, 1]);
      var offs = rng.pick([[-3, 2], [-2, 3], [-3, 3], [2, -3], [3, -2], [-2, 2]]);
      var dispo = horiz ? [H - c0, c0] : [W - c0, c0];
      var sens = dispo[0] >= 3 && (dispo[1] < 3 || rng.bool()) ? 1 : -1;
      k = rng.int(2, Math.min(5, (sens === 1 ? dispo[0] : dispo[1]) - 1));
      if (horiz) { var ax = rng.int(4, W - 4); A = [ax, c0 + sens * k]; pied = [ax, c0]; }
      else { var ay = rng.int(3, H - 3); A = [c0 + sens * k, ay]; pied = [c0, ay]; }
      var autresP = offs.map(function (o) { return horiz ? [pied[0] + o, c0] : [c0, pied[1] + o]; });
      var pts3 = [pied, autresP[0], autresP[1]];
      f = quadrillage(W, H);
      var loinMax = horiz ? Math.max(pied[0], autresP[0][0], autresP[1][0]) < W - 2.5 : Math.max(pied[1], autresP[0][1], autresP[1][1]) < H - 2.5;
      if (horiz) f.seg([0, c0], [W, c0], { accent: true }).text([loinMax ? W - 0.6 : 0.6, c0 + sens * 0.3 - (sens < 0 ? 0.35 : 0)], '(d)', { small: true, accent: true });
      else f.seg([c0, 0], [c0, H], { accent: true }).text([c0 + sens * 0.3, loinMax ? H - 0.6 : 0.4], '(d)', { small: true, accent: true, anchor: sens > 0 ? 'start' : 'end' });
      f.seg(A, pied, { dash: true }).seg(A, autresP[0], { dash: true }).seg(A, autresP[1], { dash: true });
      f.point(A, 'A', horiz ? (A[1] > c0 ? 'n' : 's') : (A[0] > c0 ? 'e' : 'o'));
      pts3.forEach(function (p, j) { f.point(p, lettres[j], horiz ? (A[1] > c0 ? 's' : 'n') : (A[0] > c0 ? 'o' : 'e')); });
      var d0 = R(k * echelle);
      return {
        enonce: 'Sur le quadrillage, un carreau a pour côté ' + u(echelle, 'cm') + '. On a tracé la droite $(d)$, le point $A$ et trois points $' + lettres.join('$, $') + '$ de $(d)$.<br>a) Lequel de ces trois points est le pied de la perpendiculaire à $(d)$ passant par $A$ ?<br>b) Quelle est la distance du point $A$ à la droite $(d)$ ?',
        figure: f.svg(),
        questions: [qcm(rng, 'a) Pied de la perpendiculaire :', '$' + lettres[0] + '$', lettres.map(function (l) { return '$' + l + '$'; })), qnum('b) Distance de $A$ à $(d)$ :', d0, 'cm')],
        indices: ['La droite $(d)$ suit une ligne du quadrillage : la perpendiculaire à $(d)$ passant par $A$ suit l\'autre direction des lignes du quadrillage.',
          'La distance de $A$ à $(d)$ est la longueur $A' + lettres[0] + '$ : c\'est le plus court chemin de $A$ jusqu\'à $(d)$. Compte les carreaux.'],
        solution: [
          'La droite $(d)$ est ' + (horiz ? 'horizontale' : 'verticale') + ' : la perpendiculaire à $(d)$ passant par $A$ est la ligne ' + (horiz ? 'verticale' : 'horizontale') + ' du quadrillage qui passe par $A$.',
          'Elle coupe $(d)$ au point $' + lettres[0] + '$ : $(A' + lettres[0] + ') \\perp (d)$.',
          'La distance de $A$ à $(d)$ est $A' + lettres[0] + ' = ' + k + ' \\times ' + n(echelle) + ' = ' + n(d0) + '$ cm. Les segments $[A' + lettres[1] + ']$ et $[A' + lettres[2] + ']$ sont plus longs : la perpendiculaire donne le plus court chemin.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Cercle : vocabulaire sur figure, compas, piste de stade        */
  /* ================================================================== */
  EM.gen.register({
    id: '6e-plus-cercle-compas',
    titre: 'Cercle : vocabulaire sur une figure, cercles sécants, piste de stade',
    chapitres: ['6e-cercle'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var O = [0, 0], f;
      if (niveau === 1) {
        var r = rng.int(5, 18) / 2, phi = rng.int(10, 50), cA = pt(O, 180 + phi, 1), cB = pt(O, phi, 1);
        var aC = phi + rng.int(50, 70), aD = aC + rng.int(60, 85), aE = 180 + phi + rng.int(55, 75);
        var cC = pt(O, aC, 1), cD = pt(O, aD, 1), cE = pt(O, aE, 1);
        var cible = rng.pick(['AB', 'CD', 'OE', 'OC']);
        var NATS = { AB: 'un diamètre', CD: 'une corde (qui n\'est pas un diamètre)', OE: 'un rayon', OC: 'un rayon' };
        f = EM.fig.fit([[-1.15, -1.15], [1.15, 1.15]], { w: 230, h: 230, pad: 16, title: 'Cercle de centre O' });
        f.circle(O, 1);
        f.seg(cA, cB, { accent: cible === 'AB' }).seg(cC, cD, { accent: cible === 'CD' }).seg(O, cE, { accent: cible === 'OE' }).seg(O, cC, { accent: cible === 'OC' });
        f.point(O, 'O', posLibre([phi, 180 + phi, aE, aC])).point(cA, 'A', posAngle(180 + phi)).point(cB, 'B', posAngle(phi)).point(cC, 'C', posAngle(aC)).point(cD, 'D', posAngle(aD)).point(cE, 'E', posAngle(aE));
        var sens = rng.bool();
        return {
          enonce: 'Sur la figure, $A$, $B$, $C$, $D$, $E$ sont des points du cercle de centre $O$, et $O$ appartient au segment $[AB]$.<br>a) Quelle est la nature du segment $[' + cible + ']$ tracé en couleur ?<br>b) ' +
            (sens ? 'On donne $OE = ' + n(r) + '$ cm. Calculer la longueur $AB$.' : 'On donne $AB = ' + n(2 * r) + '$ cm. Calculer la longueur $OD$.'),
          figure: f.svg(),
          questions: [qcm(rng, 'a) $[' + cible + ']$ est :', NATS[cible], ['un rayon', 'un diamètre', 'une corde (qui n\'est pas un diamètre)', 'un arc de cercle']), qnum(sens ? 'b) $AB =$' : 'b) $OD =$', sens ? 2 * r : r, 'cm')],
          indices: ['Rayon : il joint le centre à un point du cercle. Corde : elle joint deux points du cercle. Diamètre : c\'est une corde qui passe par le centre.',
            'Tous les rayons ont la même longueur et le diamètre mesure le double du rayon.'],
          solution: [
            cible === 'AB' ? '$[AB]$ joint deux points du cercle et passe par le centre $O$ : c\'est un diamètre.'
              : cible === 'CD' ? '$[CD]$ joint deux points du cercle mais ne passe pas par le centre : c\'est une corde, qui n\'est pas un diamètre.'
                : '$[' + cible + ']$ joint le centre $O$ à un point du cercle : c\'est un rayon.',
            sens ? '$[OE]$ est un rayon : $r = ' + n(r) + '$ cm. $[AB]$ est un diamètre : $AB = 2 \\times r = 2 \\times ' + n(r) + ' = ' + n(2 * r) + '$ cm.'
              : '$[AB]$ est un diamètre : le rayon vaut $' + n(2 * r) + ' \\div 2 = ' + n(r) + '$ cm. $[OD]$ est un rayon : $OD = ' + n(r) + '$ cm.'
          ]
        };
      }
      if (niveau === 2) {
        var r1, r2, d, g = 0, yM;
        do {
          r1 = rng.int(6, 12) / 2; r2 = rng.int(4, 10) / 2;
          d = rng.int(Math.floor(2 * Math.abs(r1 - r2)) + 2, Math.ceil(2 * (r1 + r2)) - 2) / 2;
          var xM = (d * d + r1 * r1 - r2 * r2) / (2 * d);
          yM = Math.sqrt(Math.max(0, r1 * r1 - xM * xM));
          g++;
        } while (g < 200 && (yM < 1.2 || r1 === r2 || d <= Math.abs(r1 - r2) || d >= r1 + r2));
        var xm = (d * d + r1 * r1 - r2 * r2) / (2 * d);
        var pA = [0, 0], pB = [d, 0], pM = [xm, yM], pN = [xm, -yM];
        f = EM.fig.fit([[-r1, -r1], [r1, r1], [d - r2, -r2], [d + r2, r2]], { w: 300, h: 220, pad: 16 });
        f.circle(pA, r1).circle(pB, r2);
        f.seg(pA, pB).seg(pA, pM, { accent: true }).seg(pM, pB, { accent: true }).seg(pA, pN, { dash: true }).seg(pN, pB, { dash: true });
        f.point(pA, 'A', 'o').point(pB, 'B', 'e').point(pM, 'M', 'n').point(pN, 'N', 's');
        return {
          enonce: 'Le cercle $(\\mathscr{C}_1)$ a pour centre $A$ et pour rayon ' + u(r1, 'cm') + ' ; le cercle $(\\mathscr{C}_2)$ a pour centre $B$ et pour rayon ' + u(r2, 'cm') + ', avec $AB = ' + n(d) + '$ cm. Les deux cercles se coupent en $M$ et $N$.<br>a) Donner les longueurs $AM$ et $BM$.<br>b) Calculer le périmètre du triangle $AMB$, puis celui du quadrilatère $AMBN$.',
          figure: f.svg(),
          questions: [qnum('a) $AM =$', r1, 'cm'), qnum('a) $BM =$', r2, 'cm'), qnum('b) Périmètre de $AMB$ :', R(r1 + r2 + d), 'cm'), qnum('b) Périmètre de $AMBN$ :', R(2 * (r1 + r2)), 'cm')],
          indices: ['$M$ est sur le cercle de centre $A$ : $AM$ est un rayon de ce cercle.', '$N$ est aussi sur les deux cercles : $AN = AM$ et $BN = BM$.'],
          solution: [
            '$M$ appartient au cercle de centre $A$ et de rayon ' + u(r1, 'cm') + ' : $AM = ' + n(r1) + '$ cm. Il appartient aussi au cercle de centre $B$ : $BM = ' + n(r2) + '$ cm.',
            'Périmètre de $AMB$ : $AM + MB + AB = ' + n(r1) + ' + ' + n(r2) + ' + ' + n(d) + ' = ' + n(r1 + r2 + d) + '$ cm.',
            'De même $AN = ' + n(r1) + '$ cm et $BN = ' + n(r2) + '$ cm. Périmètre de $AMBN$ : $' + n(r1) + ' + ' + n(r2) + ' + ' + n(r2) + ' + ' + n(r1) + ' = ' + n(2 * (r1 + r2)) + '$ cm.'
          ]
        };
      }
      // niveau 3 : piste de stade (rectangle + deux demi-cercles)
      var L = 10 * rng.int(6, 10), D = 10 * rng.int(4, 7), tours = rng.int(3, 12);
      var P = R(2 * L + 3.14 * D), dist = R(tours * P / 1000, 6);
      var r0 = D / 2;
      f = EM.fig.fit([[-r0, -r0], [L + r0, r0]], { w: 300, h: 170, pad: 26 });
      f.seg([0, r0], [L, r0]).seg([0, -r0], [L, -r0]);
      arcCercle(f, [L, 0], r0, -90, 90);
      arcCercle(f, [0, 0], r0, 90, 270);
      f.seg([0, r0], [0, -r0], { dash: true }).seg([L, r0], [L, -r0], { dash: true });
      f.segLabel([0, r0], [L, r0], L + ' m', { inside: [L / 2, 0] });
      f.text([0.12 * D, 0], D + ' m', { small: true, anchor: 'start' });
      return {
        enonce: 'La piste d\'un stade est formée de deux lignes droites de ' + u(L, 'm') + ' et de deux demi-cercles de diamètre ' + u(D, 'm') + ' (voir la figure). On prend $\\pi \\approx 3{,}14$.<br>a) Calculer la longueur d\'un tour de piste.<br>b) ' + personne(rng).nom + ' fait ' + tours + ' tours de piste. Quelle distance parcourt-il ou elle, en kilomètres ?',
        figure: f.svg(),
        questions: [qnum('a) Longueur d\'un tour :', P, 'm'), qnum('b) Distance (km) :', dist, 'km')],
        indices: ['Les deux demi-cercles forment ensemble un cercle entier de diamètre ' + u(D, 'm') + ' : son périmètre est $\\pi \\times D$.',
          'Un tour = deux lignes droites + un cercle entier. Puis $1$ km $= 1\\,000$ m.'],
        solution: [
          'Les deux demi-cercles réunis forment un cercle de diamètre ' + u(D, 'm') + ' : $3{,}14 \\times ' + D + ' = ' + n(3.14 * D) + '$ m.',
          'Un tour : $2 \\times ' + L + ' + ' + n(3.14 * D) + ' = ' + n(P) + '$ m.',
          'En ' + tours + ' tours : $' + tours + ' \\times ' + n(P) + ' = ' + n(tours * P) + '$ m, soit ' + u(dist, 'km') + '.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Angles : lire un rapporteur                                    */
  /* ================================================================== */
  /** Petit texte tourné (graduation de rapporteur), en coordonnées mathématiques. */
  function texteTourne(f, A, txt, rot, taille) {
    var a = f.P(A);
    return f.add('<text class="fig-text fig-tiny" x="' + a[0] + '" y="' + a[1] + '" text-anchor="middle" dominant-baseline="central"' + (taille ? ' style="font-size:' + taille + 'px"' : '') + ' transform="rotate(' + rot + ' ' + a[0] + ' ' + a[1] + ')">' + txt + '</text>');
  }
  /** Rapporteur de centre O ; phi : direction de [Oy) ; gauche : [Ox) vers la gauche ; deux : double graduation. */
  function figRapporteur(phi, gauche, deux, nx, ny) {
    var f = EM.fig.create({ w: 360, xmin: -1.45, xmax: 1.45, ymin: -0.3, ymax: 1.5, title: 'Rapporteur' });
    var O = [0, 0], k;
    arcCercle(f, O, 1, 0, 180, { light: true });
    if (deux) arcCercle(f, O, 0.7, 0, 180, { light: true });
    f.seg([-1, 0], [1, 0], { light: true });
    for (k = 0; k <= 180; k += 5) f.seg(pt(O, k, k % 10 === 0 ? 0.9 : 0.95), pt(O, k, 1), { light: true });
    var xd = gauche ? 180 : 0;
    f.seg(O, pt(O, xd, 1.28)).seg(O, pt(O, phi, 1.28), { accent: true });
    for (k = 0; k <= 180; k += 10) {
      texteTourne(f, pt(O, k, 1.1), String(k), 90 - k);
      if (deux) texteTourne(f, pt(O, k, 0.8), String(180 - k), 90 - k, 8.5);
    }
    f.point(O, 'O', 's');
    f.label(pt(O, xd, 1.28), nx, 'n').label(pt(O, phi, 1.28), ny, phi > 150 ? 'n' : phi < 30 ? 'n' : posAngle(phi));
    return f.svg();
  }

  EM.gen.register({
    id: '6e-plus-angles-rapporteur',
    titre: 'Lire la mesure d\'un angle sur un rapporteur',
    chapitres: ['6e-angles'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var gauche = niveau === 2 && rng.bool(), phi, g = 0;
      do { phi = niveau === 1 ? 10 * rng.int(2, 16) : 5 * rng.int(3, 33); g++; } while (phi === 90 && g < 50);
      var mes = gauche ? 180 - phi : phi, faux = 180 - mes;
      var noms = rng.pick([['x', 'y', 'O'], ['u', 'v', 'O']]), X = noms[0], Y = noms[1];
      var nat = mes < 90 ? 'un angle aigu' : 'un angle obtus';
      var sol = [
        'On place le centre du rapporteur sur le sommet $O$ et sa ligne de base le long du côté $[O' + X + ')$.',
        niveau === 1 ? 'Le côté $[O' + X + ')$ passe par le $0$ de la graduation. On suit cette graduation jusqu\'au côté $[O' + Y + ')$ : on lit ' + m(mes) + '.'
          : 'Le côté $[O' + X + ')$ passe par le $0$ de la graduation ' + (gauche ? 'intérieure' : 'extérieure') + ' : c\'est celle qu\'il faut lire. Le côté $[O' + Y + ')$ y indique ' + m(mes) + '.',
        'Donc $' + w(X + 'O' + Y) + ' = ' + dg(mes) + '$ : ' + nat + (mes < 90 ? ' (moins de $90^\\circ$).' : ' (entre $90^\\circ$ et $180^\\circ$).')
      ];
      if (niveau === 2) sol.splice(2, 0, 'Attention : l\'autre graduation donne ' + m(faux) + ', qui est la mesure de l\'angle supplémentaire. Un coup d\'œil suffit pour vérifier : l\'angle est ' + (mes < 90 ? 'aigu' : 'obtus') + ', donc ' + (mes < 90 ? 'moins' : 'plus') + ' de $90^\\circ$.');
      return {
        enonce: 'On mesure l\'angle $' + w(X + 'O' + Y) + '$ avec un rapporteur' + (niveau === 2 ? ' qui a deux graduations' : '') + '.<br>a) Lire la mesure de l\'angle $' + w(X + 'O' + Y) + '$.<br>b) Donner sa nature.',
        figure: figRapporteur(phi, gauche, niveau === 2, X, Y),
        questions: [qnum('a) $' + w(X + 'O' + Y) + ' =$', mes, '°'), qcm(rng, 'b) Nature :', nat, ['un angle aigu', 'un angle droit', 'un angle obtus', 'un angle plat'])],
        indices: [niveau === 1 ? 'Le côté $[O' + X + ')$ passe par le $0$ : compte les graduations à partir de ce $0$.' : 'Repère la graduation dont le $0$ est sur le côté $[O' + X + ')$ : c\'est elle qu\'il faut lire.',
          'Vérifie ta lecture : un angle aigu mesure moins de $90^\\circ$, un angle obtus plus de $90^\\circ$.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 6e — Angles : angle plat, adjacents, bissectrices                   */
  /* ================================================================== */
  EM.gen.register({
    id: '6e-plus-angles-plat-bissectrice',
    titre: 'Angle plat, angles adjacents et bissectrices : raisonner sur une figure',
    chapitres: ['6e-angles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var O = [0, 0], L = 4, f, ends = [], rays;
      function figure(rs, arcs, codes) {
        ends = rs.map(function (r) { return pt(O, r.a, L); });
        f = EM.fig.fit(ends.concat([O, [0, -0.4]]), { w: 300, h: 190 });
        rs.forEach(function (r, i) { f.seg(O, ends[i], r.o); });
        arcs.forEach(function (a) { f.angle(pt(O, a[0], L), O, pt(O, a[1], L), a[2], { r: a[3], accent: a[4] }); });
        (codes || []).forEach(function (a) { codeAngle(f, pt(O, a[0], L), O, pt(O, a[1], L), a[2], a[3]); });
        rs.forEach(function (r, i) { f.label(ends[i], r.n, posAngle(r.a)); });
        f.point(O, 'O', 's');
        return f.svg();
      }
      if (niveau === 1) {
        var al, ga, be, g = 0;
        do { al = 5 * rng.int(5, 16); ga = 5 * rng.int(5, 16); be = 180 - al - ga; g++; } while (g < 100 && (be < 25 || be === 90 && rng.bool(0.7)));
        rays = [{ a: 0, n: 'x' }, { a: al, n: 'y' }, { a: al + be, n: 'z' }, { a: 180, n: 't' }];
        var natb = be < 90 ? 'aigu' : be === 90 ? 'droit' : 'obtus';
        return {
          enonce: 'Sur la figure, les demi-droites $[Ox)$ et $[Ot)$ sont opposées : l\'angle $' + w('xOt') + '$ est plat. On sait que $' + w('xOy') + ' = ' + dg(al) + '$ et $' + w('zOt') + ' = ' + dg(ga) + '$.<br>a) Calculer la mesure de l\'angle $' + w('yOz') + '$.<br>b) Donner la nature de l\'angle $' + w('yOz') + '$.',
          figure: figure(rays, [[0, al, al + '°', 24], [al, al + be, '?', 36, true], [al + be, 180, ga + '°', 24]]),
          questions: [qnum('a) $' + w('yOz') + ' =$', be, '°'), qcm(rng, 'b) $' + w('yOz') + '$ est un angle :', natb, ['aigu', 'droit', 'obtus', 'plat'])],
          indices: ['Un angle plat mesure $180^\\circ$.', 'Les trois angles $' + w('xOy') + '$, $' + w('yOz') + '$ et $' + w('zOt') + '$ sont adjacents deux à deux et forment ensemble l\'angle plat $' + w('xOt') + '$.'],
          solution: [
            'Les angles $' + w('xOy') + '$, $' + w('yOz') + '$ et $' + w('zOt') + '$ se suivent et forment l\'angle plat $' + w('xOt') + '$ : $' + w('xOy') + ' + ' + w('yOz') + ' + ' + w('zOt') + ' = 180^\\circ$.',
            '$' + w('yOz') + ' = 180^\\circ - ' + dg(al) + ' - ' + dg(ga) + ' = ' + dg(be) + '$.',
            'Cet angle est ' + natb + (natb === 'aigu' ? ' : il mesure moins de $90^\\circ$.' : natb === 'droit' ? ' : il mesure exactement $90^\\circ$.' : ' : il mesure entre $90^\\circ$ et $180^\\circ$.')
          ]
        };
      }
      if (niveau === 2) {
        var gam = 2 * rng.int(13, 70), xoz = 180 - gam, xoy = xoz / 2;
        rays = [{ a: 0, n: 'x' }, { a: xoy, n: 'y', o: { accent: true, dash: true } }, { a: xoz, n: 'z' }, { a: 180, n: 't' }];
        return {
          enonce: 'Sur la figure, l\'angle $' + w('xOt') + '$ est plat et $' + w('zOt') + ' = ' + dg(gam) + '$. La demi-droite $[Oy)$ est la bissectrice de l\'angle $' + w('xOz') + '$.<br>a) Calculer $' + w('xOz') + '$.<br>b) Calculer $' + w('xOy') + '$.',
          figure: figure(rays, [[xoz, 180, gam + '°', 24]], [[0, xoy, 30, 1], [xoy, xoz, 30, 1]]),
          questions: [qnum('a) $' + w('xOz') + ' =$', xoz, '°'), qnum('b) $' + w('xOy') + ' =$', xoy, '°')],
          indices: ['$' + w('xOz') + '$ et $' + w('zOt') + '$ sont adjacents et forment l\'angle plat $' + w('xOt') + '$.', 'La bissectrice partage un angle en deux angles adjacents de même mesure.'],
          solution: [
            'Les angles adjacents $' + w('xOz') + '$ et $' + w('zOt') + '$ forment l\'angle plat $' + w('xOt') + '$ : $' + w('xOz') + ' = 180^\\circ - ' + dg(gam) + ' = ' + dg(xoz) + '$.',
            '$[Oy)$ est la bissectrice de $' + w('xOz') + '$ : $' + w('xOy') + ' = ' + w('yOz') + ' = \\dfrac{' + dg(xoz) + '}{2} = ' + dg(xoy) + '$.'
          ]
        };
      }
      // niveau 3 : bissectrices de deux angles adjacents qui forment un angle plat
      var a3 = 2 * rng.int(18, 72), yot = 180 - a3, xom = a3 / 2, yon = yot / 2, xon = a3 + yon;
      rays = [{ a: 0, n: 'x' }, { a: xom, n: 'm', o: { accent: true, dash: true } }, { a: a3, n: 'y' }, { a: a3 + yon, n: 'n', o: { accent: true, dash: true } }, { a: 180, n: 't' }];
      return {
        enonce: 'Sur la figure, l\'angle $' + w('xOt') + '$ est plat et $' + w('xOy') + ' = ' + dg(a3) + '$. La demi-droite $[Om)$ est la bissectrice de $' + w('xOy') + '$ et $[On)$ est la bissectrice de $' + w('yOt') + '$.<br>a) Calculer $' + w('yOt') + '$.<br>b) Calculer $' + w('mOn') + '$.<br>c) Calculer $' + w('xOn') + '$.',
        figure: figure(rays, [], [[0, xom, 30, 1], [xom, a3, 30, 1], [a3, a3 + yon, 44, 2], [a3 + yon, 180, 44, 2]]),
        questions: [qnum('a) $' + w('yOt') + ' =$', yot, '°'), qnum('b) $' + w('mOn') + ' =$', 90, '°'), qnum('c) $' + w('xOn') + ' =$', xon, '°')],
        indices: ['Commence par $' + w('yOt') + '$ : $' + w('xOy') + '$ et $' + w('yOt') + '$ forment un angle plat.', '$' + w('mOn') + ' = ' + w('mOy') + ' + ' + w('yOn') + '$ : chacun vaut la moitié d\'un angle connu.'],
        solution: [
          '$' + w('yOt') + ' = 180^\\circ - ' + dg(a3) + ' = ' + dg(yot) + '$.',
          '$[Om)$ est la bissectrice de $' + w('xOy') + '$ : $' + w('mOy') + ' = \\dfrac{' + dg(a3) + '}{2} = ' + dg(xom) + '$. $[On)$ est la bissectrice de $' + w('yOt') + '$ : $' + w('yOn') + ' = \\dfrac{' + dg(yot) + '}{2} = ' + dg(yon) + '$.',
          'Les angles $' + w('mOy') + '$ et $' + w('yOn') + '$ sont adjacents : $' + w('mOn') + ' = ' + dg(xom) + ' + ' + dg(yon) + ' = 90^\\circ$. Ce n\'est pas un hasard : c\'est la moitié de $180^\\circ$, quelle que soit la mesure de $' + w('xOy') + '$.',
          '$' + w('xOn') + ' = ' + w('xOy') + ' + ' + w('yOn') + ' = ' + dg(a3) + ' + ' + dg(yon) + ' = ' + dg(xon) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Symétrie orthogonale : axes, médiatrice, conservation          */
  /* ================================================================== */
  var FORMES_AXES = [
    { nom: 'un triangle équilatéral', k: 3, pts: [[0, 0], [4, 0], [2, 3.464]], ticks: [[0, 1, 1], [1, 2, 1], [2, 0, 1]], axes: 'les trois médiatrices de ses côtés (qui passent chacune par un sommet)' },
    { nom: 'un triangle isocèle (non équilatéral)', k: 1, pts: [[0, 0], [3.4, 0], [1.7, 3.6]], ticks: [[0, 2, 1], [1, 2, 1]], axes: 'la médiatrice de sa base, qui passe par le sommet principal' },
    { nom: 'un triangle rectangle dont les côtés ont des longueurs différentes', k: 0, pts: [[0, 0], [4.6, 0], [0, 2.7]], droits: [[1, 0, 2]], axes: 'aucun axe : aucune droite ne le replie sur lui-même' },
    { nom: 'un triangle rectangle isocèle', k: 1, pts: [[0, 0], [3.4, 0], [0, 3.4]], droits: [[1, 0, 2]], ticks: [[0, 1, 1], [0, 2, 1]], axes: 'la médiatrice de son hypoténuse, qui passe par le sommet de l\'angle droit' },
    { nom: 'un rectangle (qui n\'est pas un carré)', k: 2, pts: [[0, 0], [5, 0], [5, 2.8], [0, 2.8]], droits: [[1, 0, 3], [0, 1, 2], [1, 2, 3], [2, 3, 0]], axes: 'les deux médiatrices de ses côtés (ses diagonales ne sont pas des axes)' },
    { nom: 'un losange (qui n\'est pas un carré)', k: 2, pts: [[0, 0], [2.8, -1.5], [5.6, 0], [2.8, 1.5]], ticks: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], axes: 'ses deux diagonales' },
    { nom: 'un carré', k: 4, pts: [[0, 0], [3.2, 0], [3.2, 3.2], [0, 3.2]], droits: [[1, 0, 3], [0, 1, 2], [1, 2, 3], [2, 3, 0]], ticks: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], axes: 'ses deux diagonales et les deux médiatrices de ses côtés' },
    { nom: 'un hexagone régulier', k: 6, hexa: true, axes: 'les trois droites qui joignent deux sommets opposés et les trois médiatrices de ses côtés' }
  ];

  EM.gen.register({
    id: '6e-plus-symetrie-axes-mediatrice',
    titre: 'Axes de symétrie, médiatrice et conservation par symétrie',
    chapitres: ['6e-symetrie-orthogonale'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var F0 = rng.pick(FORMES_AXES), pts = F0.pts;
        if (F0.hexa) { pts = []; for (var i = 0; i < 6; i++) pts.push(pt([0, 0], 30 + 60 * i, 2)); }
        f = EM.fig.fit(pts, { w: 230, h: 180, pad: 24, title: 'Figure' });
        f.poly(pts, { fill: true });
        (F0.droits || []).forEach(function (d) { f.rightAngle(pts[d[0]], pts[d[1]], pts[d[2]]); });
        (F0.ticks || []).forEach(function (t) { f.ticks(pts[t[0]], pts[t[1]], t[2]); });
        if (F0.hexa) for (var j = 0; j < 6; j++) f.ticks(pts[j], pts[(j + 1) % 6], 1);
        return {
          enonce: 'La figure représente ' + F0.nom + ' (les codages indiquent les angles droits et les côtés de même longueur).<br>Combien cette figure a-t-elle d\'axes de symétrie ?',
          figure: f.svg(),
          questions: [qnum('Nombre d\'axes de symétrie :', F0.k)],
          indices: ['Un axe de symétrie partage la figure en deux parties qui se superposent quand on plie le long de cet axe.', 'Pense aux médiatrices des côtés et aux diagonales, et vérifie à chaque fois par pliage (mentalement).'],
          solution: [
            'Les axes de symétrie de ' + F0.nom + ' sont ' + F0.axes + '.',
            'Cette figure a donc ' + m(F0.k) + ' axe' + (F0.k > 1 ? 's' : '') + ' de symétrie.'
          ]
        };
      }
      if (niveau === 2) {
        var c, x, g = 0;
        do { c = rng.int(8, 18) / 2; x = rng.int(Math.ceil(c) + 2, 2 * Math.ceil(c) + 4) / 2; g++; } while (g < 100 && (x <= c / 2 + 0.6 || x === c));
        var hM = Math.sqrt(x * x - c * c / 4), A = [-c / 2, 0], B = [c / 2, 0], I = [0, 0], M = [0, hM];
        f = EM.fig.fit([A, B, M, [0, -1.2], [0, hM + 0.8]], { w: 260, h: 220 });
        f.seg([0, -1], [0, hM + 0.8], { dash: true, accent: true });
        f.seg(A, B).seg(M, A).seg(M, B);
        f.rightAngle(B, I, M).ticks(A, I, 2).ticks(I, B, 2);
        f.point(A, 'A', 'so').point(B, 'B', 'se').point(I, 'I', 'so').point(M, 'M', 'ne');
        f.segLabel(A, M, tx(x) + ' cm', { inside: B, k: 24 });
        return {
          enonce: 'La droite tracée en pointillés est la médiatrice du segment $[AB]$, avec $AB = ' + n(c) + '$ cm. Le point $M$ est sur cette médiatrice et $MA = ' + n(x) + '$ cm.<br>a) Calculer $MB$.<br>b) Calculer le périmètre du triangle $MAB$.<br>c) Quelle est la nature du triangle $MAB$ ?',
          figure: f.svg(),
          questions: [qnum('a) $MB =$', x, 'cm'), qnum('b) Périmètre de $MAB$ :', R(2 * x + c), 'cm'), qcm(rng, 'c) Le triangle $MAB$ est :', 'isocèle en $M$', ['isocèle en $M$', 'équilatéral', 'rectangle en $M$', 'isocèle en $A$'])],
          indices: ['Tout point de la médiatrice d\'un segment est à égale distance des extrémités de ce segment.', 'Le périmètre est la somme des longueurs des trois côtés.'],
          solution: [
            '$M$ est sur la médiatrice de $[AB]$, donc $MA = MB$ : $MB = ' + n(x) + '$ cm.',
            'Périmètre : $MA + MB + AB = ' + n(x) + ' + ' + n(x) + ' + ' + n(c) + ' = ' + n(2 * x + c) + '$ cm.',
            'Le triangle $MAB$ a deux côtés de même longueur, $[MA]$ et $[MB]$ : il est isocèle en $M$ (il n\'est pas équilatéral car $AB \\neq MA$).'
          ]
        };
      }
      // niveau 3 : conservation par symétrie axiale
      var a = rng.int(6, 14) / 2, b = rng.int(6, 14) / 2, th = 5 * rng.pick([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22]), psi = rng.int(-30, 10);
      var pB = [0, 0], pC = pt(pB, 180 + psi, b), pA = pt(pB, 180 + psi - th, a);
      if (th > 90 || pA[1] > pC[1]) pA = pt(pB, 180 + psi + th, a);
      var tri = [pA, pB, pC], maxX = Math.max(pA[0], pB[0], pC[0]), minX = Math.min(pA[0], pB[0], pC[0]);
      var ecart = 1 + 0.25 * (maxX - minX);
      tri = tri.map(function (p) { return [p[0] - maxX - ecart, p[1]]; });
      var img = tri.map(function (p) { return [-p[0], p[1]]; });
      var ys = tri.map(function (p) { return p[1]; });
      var y0s = Math.min.apply(null, ys), y1s = Math.max.apply(null, ys), xspan = 2 * Math.max.apply(null, tri.map(function (p) { return -p[0]; }));
      var k0 = Math.min(244 / xspan, 154 / Math.max(0.5, y1s - y0s));
      var ymin = y0s - 24 / k0, ymax = y1s + 44 / k0;
      k0 = Math.min(244 / xspan, 154 / (ymax - ymin));
      ymin = y0s - 24 / k0; ymax = y1s + 44 / k0;
      f = EM.fig.fit(tri.concat(img).concat([[0, ymin], [0, ymax]]), { w: 300, h: 210 });
      var yLab = ymax - 12 / k0;
      f.seg([0, ymin], [0, ymax], { accent: true }).text([0.15, yLab], '(d)', { small: true, accent: true, anchor: 'start' });
      f.poly(tri, { fill: true }).poly(img, { fill: true, dash: true });
      f.angle(tri[0], tri[1], tri[2], th + '°', { r: 22 }).angle(img[0], img[1], img[2], '?', { r: 22 });
      var ctr = centre(tri), ctr2 = centre(img);
      var procheAxe = function (P2, pos) {
        if (Math.abs(Math.abs(P2[0]) - ecart) > 0.05 || !/[eo]/.test(pos.replace('n', '').replace('s', ''))) return pos;
        return /n/.test(pos) || (!/s/.test(pos) && P2[1] >= ctr[1]) ? 'n' : 's';
      };
      ['A', 'B', 'C'].forEach(function (l, j) {
        f.point(tri[j], l, procheAxe(tri[j], posLoin(tri[j], ctr)));
        f.point(img[j], l + '\'', procheAxe(img[j], posLoin(img[j], ctr2)));
      });
      return {
        enonce: 'Le triangle $A\'B\'C\'$ est le symétrique du triangle $ABC$ par rapport à la droite $(d)$. On sait que $AB = ' + n(a) + '$ cm, $BC = ' + n(b) + '$ cm et $' + w('ABC') + ' = ' + dg(th) + '$.<br>Donner $A\'B\'$, $B\'C\'$ et la mesure de l\'angle $' + w('A\'B\'C\'') + '$.',
        figure: f.svg(),
        questions: [qnum('$A\'B\' =$', a, 'cm'), qnum('$B\'C\' =$', b, 'cm'), qnum('$' + w('A\'B\'C\'') + ' =$', th, '°')],
        indices: ['La symétrie orthogonale conserve les longueurs : le symétrique d\'un segment est un segment de même longueur.', 'Elle conserve aussi les mesures des angles.'],
        solution: [
          'Le segment $[A\'B\']$ est le symétrique de $[AB]$ : la symétrie conserve les longueurs, donc $A\'B\' = AB = ' + n(a) + '$ cm. De même $B\'C\' = BC = ' + n(b) + '$ cm.',
          'L\'angle $' + w('A\'B\'C\'') + '$ est le symétrique de l\'angle $' + w('ABC') + '$ : la symétrie conserve les angles, donc $' + w('A\'B\'C\'') + ' = ' + dg(th) + '$.',
          'Les deux triangles sont superposables : en pliant la feuille le long de $(d)$, ils coïncident.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Triangles : hauteur et aire                                    */
  /* ================================================================== */
  EM.gen.register({
    id: '6e-plus-triangle-hauteur-aire',
    titre: 'Reconnaître une hauteur et calculer l\'aire d\'un triangle',
    chapitres: ['6e-triangles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var c, h, xh, xk, aI, aK, g = 0;
        do {
          c = rng.int(6, 10); h = rng.int(3, 7); xh = rng.int(2, 2 * c - 2) / 2; xk = rng.int(1, 2 * c - 1) / 2;
          aI = R(Math.sqrt((c / 2 - xh) * (c / 2 - xh) + h * h), 1); aK = R(Math.sqrt((xk - xh) * (xk - xh) + h * h), 1);
          g++;
        } while (g < 300 && (Math.abs(c / 2 - xh) < 1.2 || Math.abs(xk - xh) < 1.2 || Math.abs(xk - c / 2) < 1 || xk < 1 || xk > c - 1 || aI - h < 0.3 || aK - h < 0.3 || Math.abs(aI - aK) < 0.3));
        var noms = rng.shuffle(['E', 'F', 'G']), nH = noms[0], nI = noms[1], nK = noms[2];
        var B = [0, 0], C = [c, 0], A = [xh, h], H = [xh, 0], I = [c / 2, 0], K = [xk, 0];
        f = EM.fig.fit([A, B, C], { w: 280, h: 200 });
        f.poly([A, B, C]).seg(A, H, { accent: true }).seg(A, I, { accent: true }).seg(A, K, { accent: true });
        f.rightAngle(A, H, C).ticks(B, I, 1).ticks(I, C, 1);
        f.point(A, 'A', 'n').point(B, 'B', 'so').point(C, 'C', 'se').point(H, nH, 's').point(I, nI, 's').point(K, nK, 's');
        var lg = {}; lg[nH] = h; lg[nI] = aI; lg[nK] = aK;
        var mes = noms.slice().sort().map(function (l) { return '$A' + l + ' = ' + n(lg[l]) + '$ cm'; }).join(', ');
        var aire = R(c * h / 2);
        return {
          enonce: 'Dans le triangle $ABC$, on a $BC = ' + c + '$ cm. Les points $E$, $F$ et $G$ sont sur le côté $[BC]$ et on a mesuré : ' + mes + '.<br>a) Lequel des trois segments est la hauteur issue de $A$ ?<br>b) Calculer l\'aire du triangle $ABC$.',
          figure: f.svg(),
          questions: [qcm(rng, 'a) Hauteur issue de $A$ :', '$[A' + nH + ']$', noms.map(function (l) { return '$[A' + l + ']$'; })), qnum('b) Aire de $ABC$ :', aire, 'cm²')],
          indices: ['La hauteur issue de $A$ passe par $A$ et est perpendiculaire au côté opposé $[BC]$ : cherche le codage d\'angle droit.', 'Aire d\'un triangle $= \\dfrac{\\text{base} \\times \\text{hauteur}}{2}$, avec la hauteur relative à cette base.'],
          solution: [
            'Le segment $[A' + nH + ']$ est perpendiculaire à $[BC]$ (angle droit codé en $' + nH + '$) : c\'est la hauteur issue de $A$. Le segment $[A' + nI + ']$ joint $A$ au milieu de $[BC]$ (codage des longueurs égales) : ce n\'est pas une hauteur.',
            'On remarque que la hauteur est le plus court des trois segments : c\'est le plus court chemin de $A$ à la droite $(BC)$.',
            'Aire $= \\dfrac{BC \\times A' + nH + '}{2} = \\dfrac{' + c + ' \\times ' + h + '}{2} = ' + n(aire) + '$ cm².'
          ]
        };
      }
      if (niveau === 2) {
        var W = 12, H2 = 8, base = rng.int(4, 7), hh = rng.int(3, 5), xb = rng.int(1, W - base - 1), xc = xb + base;
        var obtus = rng.bool(0.4), xa;
        if (obtus) xa = rng.bool() ? rng.int(0, xb - 1 >= 0 ? xb - 1 : 0) : rng.int(Math.min(W, xc + 1), W);
        else xa = rng.int(xb + 1, xc - 1);
        if (xa === xb || xa === xc) xa = xb + 1;
        var yb = rng.int(1, 2), pB = [xb, yb], pC = [xc, yb], pA = [xa, yb + hh];
        if (pA[1] > H2) { pA[1] = H2; hh = H2 - yb; }
        var dehors = xa < xb || xa > xc;
        f = quadrillage(W, H2);
        f.poly([pA, pB, pC], { fill: true });
        f.point(pA, 'A', 'n').point(pB, 'B', xa < xb ? 'se' : 'so').point(pC, 'C', xa > xc ? 'so' : 'se');
        var aire2 = R(base * hh / 2);
        return {
          enonce: 'Sur le quadrillage, chaque carreau a pour côté $1$ cm.<br>a) Donner la longueur de la base $[BC]$.<br>b) Donner la longueur de la hauteur relative à $[BC]$.<br>c) Calculer l\'aire du triangle $ABC$.',
          figure: f.svg(),
          questions: [qnum('a) $BC =$', base, 'cm'), qnum('b) Hauteur :', hh, 'cm'), qnum('c) Aire :', aire2, 'cm²')],
          indices: ['La base $[BC]$ suit une ligne du quadrillage : compte les carreaux.', 'La hauteur issue de $A$ est perpendiculaire à $(BC)$ : elle suit une ligne verticale du quadrillage.' + (dehors ? ' Ici, son pied est sur le prolongement de $[BC]$.' : '')],
          solution: [
            '$BC = ' + base + '$ cm (on compte ' + base + ' carreaux).',
            'La hauteur issue de $A$ est le segment vertical qui va de $A$ à la droite $(BC)$' + (dehors ? ' ; comme l\'angle en ' + (xa < xb ? '$B$' : '$C$') + ' est obtus, son pied $H$ est en dehors du segment $[BC]$, sur son prolongement' : '') + ' : $AH = ' + hh + '$ cm.',
            'Aire $= \\dfrac{BC \\times AH}{2} = \\dfrac{' + base + ' \\times ' + hh + '}{2} = ' + n(aire2) + '$ cm².'
          ]
        };
      }
      // niveau 3 : triangle rectangle, aire puis hauteur relative à l'hypoténuse
      var TR = [[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [7, 24, 25], [4.5, 6, 7.5], [15, 20, 25]];
      var t = rng.pick(TR), ab = t[0], ac = t[1], bc = t[2];
      if (rng.bool()) { ab = t[1]; ac = t[0]; }
      var S = R(ab * ac / 2), AH = R(ab * ac / bc);
      var pA2 = [0, 0], pB2 = [ab, 0], pC2 = [0, ac];
      var k0 = (ab * ab) / (bc * bc), pH = [ab + (0 - ab) * k0, 0 + (ac - 0) * k0];
      f = EM.fig.fit([pA2, pB2, pC2], { w: 280, h: 210, pad: 42 });
      f.poly([pA2, pB2, pC2]).seg(pA2, pH, { dash: true, accent: true }).rightAngle(pB2, pA2, pC2).rightAngle(pA2, pH, pC2);
      f.point(pA2, 'A', 'so').point(pB2, 'B', 'se').point(pC2, 'C', 'n').point(pH, 'H', 'ne');
      f.segLabel(pA2, pB2, tx(ab) + ' cm', { inside: pC2 }).segLabel(pA2, pC2, tx(ac) + ' cm', { inside: pB2 });
      return {
        enonce: 'Le triangle $ABC$ est rectangle en $A$, avec $AB = ' + n(ab) + '$ cm, $AC = ' + n(ac) + '$ cm et $BC = ' + n(bc) + '$ cm. Le point $H$ est le pied de la hauteur issue de $A$.<br>a) Calculer l\'aire du triangle $ABC$.<br>b) En déduire la longueur $AH$.',
        figure: f.svg(),
        questions: [qnum('a) Aire de $ABC$ :', S, 'cm²'), qnum('b) $AH =$', AH, 'cm')],
        indices: ['Dans un triangle rectangle, chaque côté de l\'angle droit est une hauteur relative à l\'autre : prends $[AB]$ comme base et $[AC]$ comme hauteur.', 'L\'aire se calcule aussi avec la base $[BC]$ et la hauteur $[AH]$ : $\\dfrac{BC \\times AH}{2}$.'],
        solution: [
          'Avec la base $[AB]$ et la hauteur $[AC]$ : aire $= \\dfrac{' + n(ab) + ' \\times ' + n(ac) + '}{2} = ' + n(S) + '$ cm².',
          'Avec la base $[BC]$ et la hauteur $[AH]$ : $\\dfrac{' + n(bc) + ' \\times AH}{2} = ' + n(S) + '$, donc $' + n(bc) + ' \\times AH = ' + n(2 * S) + '$.',
          '$AH = ' + n(2 * S) + ' \\div ' + n(bc) + ' = ' + n(AH) + '$ cm.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 6e — Quadrilatères : codage, construction sur quadrillage, problème */
  /* ================================================================== */
  EM.gen.register({
    id: '6e-plus-quadrilateres-codage',
    titre: 'Quadrilatères : lire un codage, compléter sur quadrillage, comparer des aires',
    chapitres: ['6e-quadrilateres'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f, NATS = ['un rectangle', 'un losange', 'un carré', 'on ne peut pas conclure'];
      if (niveau === 1) {
        var cas = rng.pick(['rect', 'los', 'carre1', 'carre2', 'trapeze', 'cerf']), P, droits = [], ticks = [], nat, expl, per = null, donne = '';
        if (cas === 'rect') {
          var L = rng.int(4, 8), l = rng.int(2, L - 1);
          P = [[0, 0], [L * 0.7, 0], [L * 0.7, l * 0.7], [0, l * 0.7]];
          droits = rng.bool() ? [[1, 0, 3], [0, 1, 2], [1, 2, 3], [2, 3, 0]] : [[1, 0, 3], [0, 1, 2], [1, 2, 3]];
          nat = NATS[0]; per = 2 * (L + l); donne = 'On donne $AB = ' + L + '$ cm et $BC = ' + l + '$ cm.';
          expl = droits.length === 4 ? 'Le codage montre quatre angles droits : $ABCD$ est un rectangle. Rien n\'indique que ses côtés consécutifs ont la même longueur : on ne peut pas dire que c\'est un carré.'
            : 'Le codage montre trois angles droits. Un quadrilatère qui a trois angles droits a forcément un quatrième angle droit : $ABCD$ est un rectangle.';
          expl += ' Périmètre : $2 \\times (' + L + ' + ' + l + ') = ' + per + '$ cm.';
        } else if (cas === 'los') {
          var cl = rng.int(3, 8), al = rng.int(50, 70);
          P = [[0, 0], pt([0, 0], -al / 2, 3), [2 * 3 * Math.cos(rad(al / 2)), 0], pt([0, 0], al / 2, 3)];
          ticks = [[0, 1], [1, 2], [2, 3], [3, 0]];
          nat = NATS[1]; per = 4 * cl; donne = 'On donne $AB = ' + cl + '$ cm.';
          expl = 'Le codage montre quatre côtés de même longueur : $ABCD$ est un losange (aucun angle droit n\'est codé). Périmètre : $4 \\times ' + cl + ' = ' + per + '$ cm.';
        } else if (cas === 'carre1' || cas === 'carre2') {
          var cc = rng.int(3, 9);
          P = [[0, 0], [3, 0], [3, 3], [0, 3]];
          if (cas === 'carre1') { ticks = [[0, 1], [1, 2], [2, 3], [3, 0]]; droits = [[1, 0, 3]]; expl = 'Quatre côtés de même longueur : c\'est un losange. Un losange qui a un angle droit a ses quatre angles droits : $ABCD$ est un carré.'; }
          else { ticks = [[0, 1], [1, 2]]; droits = [[1, 0, 3], [0, 1, 2], [1, 2, 3], [2, 3, 0]]; expl = 'Quatre angles droits : c\'est un rectangle. Un rectangle qui a deux côtés consécutifs de même longueur a ses quatre côtés égaux : $ABCD$ est un carré.'; }
          nat = NATS[2]; per = 4 * cc; donne = 'On donne $AB = ' + cc + '$ cm.';
          expl += ' Périmètre : $4 \\times ' + cc + ' = ' + per + '$ cm.';
        } else if (cas === 'trapeze') {
          P = [[0, 0], [5, 0], [3.4, 2.6], [0, 2.6]];
          droits = [[1, 0, 3], [2, 3, 0]];
          nat = NATS[3];
          expl = 'Seuls deux angles droits sont codés, et rien n\'est dit sur les longueurs : ce n\'est pas assez pour affirmer que $ABCD$ est un rectangle (d\'ailleurs, sur la figure, l\'angle en $B$ n\'est pas droit).';
        } else {
          P = [[0, 0], [2.2, -1.3], [5.2, 0], [2.2, 1.3]];
          ticks = [[0, 1, 1], [0, 3, 1], [1, 2, 2], [2, 3, 2]];
          nat = NATS[3];
          expl = 'Le codage indique $AB = AD$ et $CB = CD$, mais pas que les quatre côtés sont égaux : on ne peut pas affirmer que $ABCD$ est un losange.';
        }
        f = EM.fig.fit(P, { w: 240, h: 170, pad: 30 });
        f.poly(P, { fill: true });
        droits.forEach(function (d) { f.rightAngle(P[d[0]], P[d[1]], P[d[2]]); });
        ticks.forEach(function (t) { f.ticks(P[t[0]], P[t[1]], t[2] || 1); });
        var ct = centre(P);
        ['A', 'B', 'C', 'D'].forEach(function (lt, j) { f.point(P[j], lt, posLoin(P[j], ct)); });
        var qs = [qcm(rng, 'a) Nature de $ABCD$ :', nat, NATS)];
        if (per) qs.push(qnum('b) Périmètre de $ABCD$ :', per, 'cm'));
        return {
          enonce: 'Observer le codage de la figure (angles droits et côtés de même longueur). La figure n\'est pas forcément à l\'échelle.<br>a) Quelle est la nature la plus précise que l\'on peut affirmer pour le quadrilatère $ABCD$ ?' + (per ? '<br>b) ' + donne + ' Calculer le périmètre de $ABCD$.' : ''),
          figure: f.svg(),
          questions: qs,
          indices: ['Un petit carré code un angle droit ; des petits traits identiques codent des côtés de même longueur.', 'N\'affirme que ce que le codage permet de justifier.'],
          solution: [expl]
        };
      }
      if (niveau === 2) {
        var W = 11, H = 8, carre = rng.bool(), p, q, kk, A, B, C, D, cands, g = 0;
        do {
          p = rng.int(1, 4); q = rng.int(0, 2); kk = carre ? 1 : rng.pick([2, 0.5]);
          if (!carre && kk === 0.5 && (p % 2 || q % 2)) kk = 2;
          var wv = [-q * kk, p * kk];
          A = [rng.int(0, W), rng.int(0, H)]; B = [A[0] + p, A[1] + q]; C = [B[0] + wv[0], B[1] + wv[1]]; D = [A[0] + wv[0], A[1] + wv[1]];
          cands = [[D[0] + 1, D[1]], [D[0], D[1] + 1], [D[0] - 1, D[1]], [D[0], D[1] - 1], [A[0] + q * kk, A[1] - p * kk], [D[0] + 1, D[1] + 1], [D[0] - 1, D[1] + 1]];
          var dans = function (P2) { return P2[0] >= 1 && P2[0] <= W - 1 && P2[1] >= 1 && P2[1] <= H - 1; };
          var egal = function (P2, Q2) { return P2[0] === Q2[0] && P2[1] === Q2[1]; };
          cands = cands.filter(function (P2, j) {
            if (!dans(P2) || [A, B, C, D].some(function (Q2) { return egal(P2, Q2); })) return false;
            for (var i2 = 0; i2 < j; i2++) if (egal(cands[i2], P2)) return false;
            return true;
          });
          g++;
        } while (g < 400 && (![A, B, C, D].every(function (P2) { return P2[0] >= 1 && P2[0] <= W - 1 && P2[1] >= 1 && P2[1] <= H - 1; }) || cands.length < 3 || dist(A, B) < 2 || (carre && q === 0 && rng.bool(0.6))));
        cands = rng.sample(cands, 3);
        var lettres = rng.shuffle(['E', 'F', 'G', 'K']), bon = lettres[0];
        f = quadrillage(W, H);
        f.seg(A, B, { accent: true }).seg(B, C, { accent: true });
        f.rightAngle(A, B, C);
        var ctr = centre([A, B, C, D]);
        f.point(A, 'A', posLoin(A, ctr)).point(B, 'B', posLoin(B, ctr)).point(C, 'C', posLoin(C, ctr));
        [D].concat(cands).forEach(function (P2, j) { f.point(P2, lettres[j], 'ne'); });
        var nomQ = carre ? 'un carré' : 'un rectangle';
        return {
          enonce: 'Sur le quadrillage, on a placé les points $A$, $B$ et $C$. On veut placer un point $D$ pour que $ABCD$ soit ' + nomQ + '.<br>Lequel des points $' + lettres.slice().sort().join('$, $') + '$ convient ?',
          figure: f.svg(),
          questions: [qcm(rng, 'Le point $D$ est :', '$' + bon + '$', lettres.map(function (l) { return '$' + l + '$'; }))],
          indices: ['Dans ' + nomQ + ', les côtés opposés sont parallèles et de même longueur : $[AD]$ doit être « le même chemin » que $[BC]$.', 'Pour aller de $B$ à $C$, compte les carreaux horizontalement et verticalement ; fais le même trajet en partant de $A$.'],
          solution: [
            'Pour aller de $B$ à $C$, on se déplace de ' + trajet(C[0] - B[0], C[1] - B[1]) + '.',
            'Dans ' + nomQ + ' $ABCD$, le côté $[AD]$ est parallèle à $[BC]$ et de même longueur, dans le même sens : en partant de $A$ et en faisant le même trajet, on arrive au point $' + bon + '$.',
            'On vérifie avec l\'équerre que les angles en $A$, $C$ et $D$ sont droits' + (carre ? ', et avec le compas que les quatre côtés ont la même longueur.' : '.')
          ]
        };
      }
      // niveau 3 : périmètre et aires comparées
      var LL = rng.int(12, 40) * 5, ll, gg = 0;
      do { ll = rng.int(6, LL / 5 - 1) * 5; gg++; } while (gg < 50 && (ll >= LL || (LL + ll) % 2));
      if ((LL + ll) % 2) ll -= 5;
      var Pm = 2 * (LL + ll), cote = Pm / 4, aR = LL * ll, aC = cote * cote;
      var lieu = rng.pick(['dans les Niayes, près de Rufisque', 'à Sangalkam', 'près de Mboro', 'à Pout']);
      return {
        enonce: 'Un jardin maraîcher rectangulaire ' + lieu + ' a une longueur de ' + u(LL, 'm') + ' et un périmètre de ' + u(Pm, 'm') + '.<br>a) Calculer sa largeur.<br>b) Calculer son aire.<br>c) Un jardin carré a le même périmètre. Calculer son aire. Lequel des deux jardins a la plus grande aire ?',
        questions: [qnum('a) Largeur :', ll, 'm'), qnum('b) Aire du rectangle :', aR, 'm²'), qnum('c) Aire du carré :', aC, 'm²'), qcm(rng, 'c) Plus grande aire :', 'le jardin carré', ['le jardin carré', 'le jardin rectangulaire', 'ils ont la même aire'])],
        indices: ['Le demi-périmètre d\'un rectangle est égal à longueur + largeur.', 'Le côté du carré est le quart de son périmètre.'],
        solution: [
          'Demi-périmètre : $' + Pm + ' \\div 2 = ' + (Pm / 2) + '$ m. Largeur : $' + (Pm / 2) + ' - ' + LL + ' = ' + ll + '$ m.',
          'Aire du rectangle : $' + LL + ' \\times ' + ll + ' = ' + n(aR) + '$ m².',
          'Côté du carré : $' + Pm + ' \\div 4 = ' + n(cote) + '$ m. Aire du carré : $' + n(cote) + ' \\times ' + n(cote) + ' = ' + n(aC) + '$ m².',
          'Le jardin carré a la plus grande aire (' + u(aC - aR, 'm²') + ' de plus) : à périmètre égal, le carré a une aire plus grande que le rectangle.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 5e — PGCD et PPCM : relation PGCD × PPCM, engrenages, plantations    */
  /* ================================================================== */
  function euclideEtapes(a, b) {
    var steps = [], x = Math.max(a, b), y = Math.min(a, b);
    while (y) { var q = Math.floor(x / y), r = x % y; steps.push('$' + n(x) + ' = ' + n(y) + ' \\times ' + q + ' + ' + r + '$'); x = y; y = r; }
    return { g: x, steps: steps };
  }

  EM.gen.register({
    id: '5e-plus-pgcd-situations',
    titre: 'PGCD et PPCM : relation, nombres premiers entre eux, engrenages, plantations',
    chapitres: ['5e-pgcd-ppcm'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var g, p, q, guard = 0;
      if (niveau === 1) {
        do { g = rng.int(4, 18); p = rng.int(2, 12); q = rng.intExcept(2, 12, [p]); guard++; } while (guard < 200 && (ar.gcd(p, q) !== 1 || g * Math.max(p, q) > 200));
        var a = g * Math.max(p, q), b = g * Math.min(p, q), L = a * b / g;
        var prem = rng.bool(), c, d, g2 = 0;
        do {
          if (prem) { c = rng.int(20, 99); d = rng.int(20, 99); }
          else { var kk = rng.pick([7, 11, 13, 17, 19]), x = rng.int(2, 7), y = rng.int(2, 7); c = kk * x; d = kk * y; }
          g2++;
        } while (g2 < 300 && (c === d || c > 99 || d > 99 || (prem ? ar.gcd(c, d) !== 1 || ar.isPrime(c) || ar.isPrime(d) || c % 2 === 0 && d % 2 === 0 : ar.gcd(c, d) < 7 || (c % 2 === 0 && d % 2 === 0) || (c % 3 === 0 && d % 3 === 0) || (c % 5 === 0 && d % 5 === 0))));
        var eu = euclideEtapes(c, d);
        return {
          enonce: 'a) On sait que $\\text{PGCD}(' + a + ' \\,;\\, ' + b + ') = ' + g + '$. Sans décomposer, calculer $\\text{PPCM}(' + a + ' \\,;\\, ' + b + ')$.<br>b) Les nombres ' + m(c) + ' et ' + m(d) + ' sont-ils premiers entre eux ?',
          questions: [qnum('a) PPCM $=$', L), qcm(rng, 'b) Réponse :', eu.g === 1 ? 'Oui, leur PGCD est 1' : 'Non, ils ont un diviseur commun autre que 1', ['Oui, leur PGCD est 1', 'Non, ils ont un diviseur commun autre que 1'])],
          indices: ['Pour deux entiers $a$ et $b$ : $\\text{PGCD}(a ; b) \\times \\text{PPCM}(a ; b) = a \\times b$.', 'Deux nombres sont premiers entre eux si leur PGCD est 1 : utilise l\'algorithme d\'Euclide.'],
          solution: [
            '$\\text{PPCM}(' + a + ' \\,;\\, ' + b + ') = \\dfrac{' + a + ' \\times ' + b + '}{\\text{PGCD}} = \\dfrac{' + n(a * b) + '}{' + g + '} = ' + n(L) + '$.',
            'Algorithme d\'Euclide pour ' + m(c) + ' et ' + m(d) + ' : ' + eu.steps.join(' ; ') + '.',
            eu.g === 1 ? 'Le dernier reste non nul est 1 : $\\text{PGCD} = 1$, les deux nombres sont premiers entre eux (même s\'ils ne sont pas premiers eux-mêmes).'
              : 'Le dernier reste non nul est ' + eu.g + ' : $\\text{PGCD} = ' + eu.g + '$. Les deux nombres ne sont pas premiers entre eux : $' + c + ' = ' + eu.g + ' \\times ' + (c / eu.g) + '$ et $' + d + ' = ' + eu.g + ' \\times ' + (d / eu.g) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        do { g = rng.pick([2, 3, 4, 5, 6]); p = rng.int(3, 12); q = rng.int(2, p - 1); guard++; } while (guard < 200 && (ar.gcd(p, q) !== 1 || g * p > 60 || g * q < 10));
        var A = g * p, B = g * q, Lc = g * p * q;
        var ctx = rng.pick(['d\'un moulin à mil', 'd\'une batteuse de riz de la vallée du fleuve', 'd\'une vieille horloge']);
        return {
          enonce: 'Dans le mécanisme ' + ctx + ', deux roues dentées s\'engrènent : la grande roue a ' + m(A) + ' dents, la petite ' + m(B) + ' dents. Au départ, une dent marquée en rouge de chaque roue est en contact.<br>a) Au bout de combien de dents passées les deux dents rouges se retrouveront-elles en contact pour la première fois ?<br>b) Combien de tours la grande roue aura-t-elle faits ? Et la petite ?',
          questions: [qnum('a) Nombre de dents :', Lc), qnum('b) Tours de la grande roue :', Lc / A), qnum('b) Tours de la petite roue :', Lc / B)],
          indices: ['À chaque tour, la grande roue fait passer ' + A + ' dents : la dent rouge revient à sa place après un multiple de ' + A + ' dents. Même raisonnement pour la petite roue.', 'On cherche le plus petit multiple commun non nul : le PPCM.'],
          solution: [
            'La dent rouge de la grande roue revient au point de contact toutes les ' + A + ' dents, celle de la petite roue toutes les ' + B + ' dents.',
            'Les deux dents rouges se retrouvent ensemble après un nombre de dents multiple de ' + A + ' et de ' + B + ' ; la première fois, c\'est le PPCM.',
            '$' + A + ' = ' + g + ' \\times ' + p + '$ et $' + B + ' = ' + g + ' \\times ' + q + '$ avec $' + p + '$ et $' + q + '$ premiers entre eux : $\\text{PPCM}(' + A + ' \\,;\\, ' + B + ') = ' + g + ' \\times ' + p + ' \\times ' + q + ' = ' + Lc + '$.',
            'Grande roue : $' + Lc + ' \\div ' + A + ' = ' + (Lc / A) + '$ tours ; petite roue : $' + Lc + ' \\div ' + B + ' = ' + (Lc / B) + '$ tours.'
          ]
        };
      }
      // niveau 3 : arbres autour d'un champ
      do { g = rng.pick([3, 4, 5, 6, 7, 8, 9, 10, 12, 15]); p = rng.int(3, 15); q = rng.int(2, p - 1); guard++; } while (guard < 300 && (ar.gcd(p, q) !== 1 || g * p > 210 || g * p < 40 || g * q < 20));
      var Lg = g * p, lg = g * q, per = 2 * (Lg + lg), nbA = per / g;
      var eu3 = euclideEtapes(Lg, lg);
      var lieu = rng.pick(['un champ de mil près de Kaffrine', 'un verger de manguiers en Casamance', 'un champ d\'arachide près de Kaolack', 'la cour d\'une école de Louga']);
      return {
        enonce: 'On veut planter des arbres tout autour de ' + lieu + ', de forme rectangulaire, de ' + u(Lg, 'm') + ' sur ' + u(lg, 'm') + '. On place un arbre à chaque coin, et les arbres doivent être régulièrement espacés d\'un nombre entier de mètres, le plus grand possible.<br>a) Quel est l\'écart entre deux arbres voisins ?<br>b) Combien d\'arbres faut-il planter ?',
        questions: [qnum('a) Écart :', g, 'm'), qnum('b) Nombre d\'arbres :', nbA)],
        indices: ['Avec un arbre à chaque coin, l\'écart doit diviser exactement la longueur et la largeur.', 'Le plus grand diviseur commun est le PGCD. Puis : nombre d\'intervalles sur le tour complet = nombre d\'arbres.'],
        solution: [
          'Comme il y a un arbre à chaque coin, l\'écart doit diviser ' + m(Lg) + ' et ' + m(lg) + ' ; le plus grand possible est leur PGCD.',
          eu3.steps.join(' ; ') + ' : $\\text{PGCD}(' + Lg + ' \\,;\\, ' + lg + ') = ' + g + '$. L\'écart est de ' + u(g, 'm') + '.',
          'Périmètre du champ : $2 \\times (' + Lg + ' + ' + lg + ') = ' + per + '$ m, soit $' + per + ' \\div ' + g + ' = ' + nbA + '$ intervalles.',
          'Sur un tour fermé, il y a autant d\'arbres que d\'intervalles : il faut ' + m(nbA) + ' arbres.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 5e — Expressions littérales : traduire, périmètre, programme        */
  /* ================================================================== */
  /** ax + b pour l'analyseur */
  function linStr(a, b) {
    var s = a === 0 ? '' : (a === 1 ? 'x' : a === -1 ? '-x' : a + '*x');
    if (b) s += (b > 0 && s ? '+' : '') + b;
    return s || '0';
  }
  /** ax + b pour une figure SVG */
  function linTxt(a, b) {
    var s = a === 1 ? 'x' : a + 'x';
    if (b > 0) s += ' + ' + b; else if (b < 0) s += ' − ' + (-b);
    return s;
  }

  EM.gen.register({
    id: '5e-plus-traduire-programme',
    titre: 'Traduire une phrase, exprimer un périmètre, étudier un programme de calcul',
    chapitres: ['5e-expressions-litterales'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var k = rng.int(2, 9), x0, K = String(k);
        var MOD = [
          { t: 'le double de $x$, augmenté de $' + K + '$', bon: '2x + ' + K, faux: ['2(x + ' + K + ')', 'x^2 + ' + K, '2 + x + ' + K], v: function (x) { return 2 * x + k; }, s: '$2 \\times x + ' + K + '$' },
          { t: 'le triple de la somme de $x$ et de $' + K + '$', bon: '3(x + ' + K + ')', faux: ['3x + ' + K, 'x + ' + (3 * k), '3 + x + ' + K], v: function (x) { return 3 * (x + k); }, s: 'on calcule d\'abord la somme $x + ' + K + '$, puis on la multiplie par 3' },
          { t: 'le carré de $x$, diminué de $' + K + '$', bon: 'x^2 - ' + K, faux: ['(x - ' + K + ')^2', '2x - ' + K, 'x - ' + (k * k)], v: function (x) { return x * x - k; }, s: '$x \\times x - ' + K + '$' },
          { t: 'la moitié de la différence de $x$ et de $' + K + '$', bon: '\\dfrac{x - ' + K + '}{2}', faux: ['\\dfrac{x}{2} - ' + K, 'x - \\dfrac{' + K + '}{2}', '2(x - ' + K + ')'], v: function (x) { return (x - k) / 2; }, s: 'on calcule d\'abord la différence $x - ' + K + '$, puis on la divise par 2' },
          { t: 'le produit de $x$ par la somme de $x$ et de $' + K + '$', bon: 'x(x + ' + K + ')', faux: ['x \\times x + ' + K, '2x + ' + K, 'x + x + ' + K], v: function (x) { return x * (x + k); }, s: 'on calcule d\'abord la somme $x + ' + K + '$, puis on la multiplie par $x$' }
        ];
        var M = rng.pick(MOD);
        x0 = rng.int(k + 1, k + 8);
        var val = R(M.v(x0));
        return {
          enonce: 'On note $x$ un nombre.<br>a) Quelle expression traduit la phrase : « ' + M.t + ' » ?<br>b) Calculer la valeur de cette expression pour $x = ' + x0 + '$.',
          questions: [qcm(rng, 'a) Expression :', '$' + M.bon + '$', M.faux.map(function (e) { return '$' + e + '$'; })), qnum('b) Valeur pour $x = ' + x0 + '$ :', val)],
          indices: ['Repère la dernière opération de la phrase : « le double de… », « la moitié de… », « le produit de… » indiquent ce qu\'on fait en dernier.', 'Une somme ou une différence qu\'on multiplie ou qu\'on divise doit être entre parenthèses (ou sur la barre de fraction).'],
          solution: [
            'Dans « ' + M.t + ' », ' + M.s + ' : l\'expression est $' + M.bon + '$.',
            'Pour $x = ' + x0 + '$ : on remplace $x$ par ' + x0 + ' et on obtient ' + m(val) + '.'
          ]
        };
      }
      if (niveau === 2) {
        var rect = rng.bool(), x1, P, Pstr, Ptex, sol = [], gg = 0;
        if (rect) {
          var a1, b1, b2;
          do { a1 = rng.pick([2, 3]); b1 = rng.nz(-3, 5); b2 = rng.int(1, 4); x1 = rng.int(3, 9); gg++; } while (gg < 100 && (a1 * x1 + b1 <= x1 + b2 + 1 || a1 * x1 + b1 <= 0));
          var cA = 2 * (a1 + 1), cB = 2 * (b1 + b2);
          P = cA * x1 + cB; Pstr = linStr(cA, cB); Ptex = T.poly([cA, cB]);
          var Lr = 6, lr = 3.4, pts = [[0, 0], [Lr, 0], [Lr, lr], [0, lr]];
          f = EM.fig.fit(pts, { w: 270, h: 170, pad: 46 });
          f.poly(pts, { fill: true }).rightAngle(pts[1], pts[0], pts[3]).rightAngle(pts[0], pts[1], pts[2]).rightAngle(pts[1], pts[2], pts[3]).rightAngle(pts[2], pts[3], pts[0]);
          f.segLabel(pts[0], pts[1], linTxt(a1, b1), { inside: pts[2] }).segLabel(pts[1], pts[2], linTxt(1, b2), { inside: pts[0], k: 24 });
          sol.push('Le périmètre d\'un rectangle est $2 \\times (L + \\ell)$ : $P = 2(' + T.poly([a1, b1]) + ' + ' + T.poly([1, b2]) + ')$.');
          sol.push('$P = 2(' + T.poly([a1 + 1, b1 + b2]) + ') = ' + Ptex + '$.');
        } else {
          var c1, c2, c3;
          do { c1 = rng.int(1, 6); c2 = rng.nz(-4, 3); c3 = rng.int(1, 6); x1 = rng.int(3, 9); gg++; } while (gg < 100 && (2 * x1 + c2 <= 0 || c1 === c3));
          var s1 = x1 + c1, s2 = 2 * x1 + c2, s3 = x1 + c3;
          if (s1 >= s2 + s3 || s2 >= s1 + s3 || s3 >= s1 + s2) { c2 = 1; s2 = 2 * x1 + 1; }
          P = 4 * x1 + c1 + c2 + c3; Pstr = linStr(4, c1 + c2 + c3); Ptex = T.poly([4, c1 + c2 + c3]);
          var tri = triCotes(s2, s3, s1), ctr = centre(tri);
          f = EM.fig.fit(tri, { w: 270, h: 190, pad: 50 });
          f.poly(tri, { fill: true });
          f.segLabel(tri[0], tri[1], linTxt(1, c1), { inside: ctr }).segLabel(tri[1], tri[2], linTxt(2, c2), { inside: ctr, k: 24 }).segLabel(tri[0], tri[2], linTxt(1, c3), { inside: ctr, k: 24 });
          sol.push('Le périmètre est la somme des trois côtés : $P = (' + T.poly([1, c1]) + ') + (' + T.poly([2, c2]) + ') + (' + T.poly([1, c3]) + ')$.');
          sol.push('On regroupe les termes en $x$ : $x + 2x + x = 4x$, et les nombres : $' + c1 + T.signed(c2) + T.signed(c3) + ' = ' + (c1 + c2 + c3) + '$. Donc $P = ' + Ptex + '$.');
        }
        var cte0 = rect ? cB : c1 + c2 + c3;
        sol.push('Pour $x = ' + x1 + '$ : $P = ' + (rect ? cA : 4) + ' \\times ' + x1 + (cte0 ? T.signed(cte0) : '') + ' = ' + P + '$.');
        return {
          enonce: 'Les longueurs de la figure sont exprimées en centimètres, en fonction d\'un nombre $x$.<br>a) Exprimer le périmètre $P$ de cette figure en fonction de $x$, sous forme réduite.<br>b) Calculer $P$ pour $x = ' + x1 + '$.',
          figure: f.svg(),
          questions: [{ label: 'a) $P =$', type: 'expr', reponse: Pstr, reponseTex: Ptex, forme: 'somme' }, qnum('b) $P$ pour $x = ' + x1 + '$ :', P, 'cm')],
          indices: [rect ? 'Un rectangle a deux longueurs et deux largeurs.' : 'Additionne les longueurs des trois côtés.', 'Réduis : regroupe les termes en $x$ d\'un côté et les nombres de l\'autre.'],
          solution: sol,
          aide: 'Écris une expression réduite, par exemple 6x + 4.'
        };
      }
      // niveau 3 : programme de calcul
      var a = rng.pick([2, 3, 4, 5]), b = rng.int(1, 9), c = rng.pick([2, 3]), cst = rng.bool(0.45), d;
      if (cst) d = a * c; else { do { d = rng.int(1, 9); } while (d === a * c); }
      var coef = a * c - d, cte = b * c, x3 = rng.int(2, 12), res = coef * x3 + cte;
      var etapes = ['Choisir un nombre.', 'Le multiplier par ' + a + '.', 'Ajouter ' + b + ' au résultat.', 'Multiplier le tout par ' + c + '.', 'Soustraire ' + (d === 1 ? 'le nombre de départ' : d + ' fois le nombre de départ') + '.'];
      var exprTex = T.poly([coef, cte]);
      return {
        enonce: 'Voici un programme de calcul :<br>' + etapes.map(function (e) { return '• ' + e; }).join('<br>') + '<br>a) Quel résultat obtient-on en choisissant ' + m(x3) + ' ?<br>b) On choisit un nombre $x$. Exprimer le résultat en fonction de $x$, sous forme réduite.<br>c) Le résultat dépend-il du nombre choisi ?',
        questions: [
          qnum('a) Résultat pour ' + m(x3) + ' :', res),
          { label: 'b) Résultat pour $x$ :', type: 'expr', reponse: linStr(coef, cte), reponseTex: exprTex, forme: 'somme' },
          qcm(rng, 'c) Réponse :', cst ? 'Non, on trouve toujours ' + cte : 'Oui, il dépend du nombre choisi', ['Non, on trouve toujours ' + cte, 'Oui, il dépend du nombre choisi'])
        ],
        indices: ['Applique les étapes une à une à $x$ : $x \\to ' + a + 'x \\to \\ldots$', 'Développe $' + c + '(' + a + 'x + ' + b + ')$ puis réduis.'],
        solution: [
          'Avec ' + m(x3) + ' : $' + x3 + ' \\times ' + a + ' = ' + (a * x3) + '$ ; $' + (a * x3) + ' + ' + b + ' = ' + (a * x3 + b) + '$ ; $' + (a * x3 + b) + ' \\times ' + c + ' = ' + (c * (a * x3 + b)) + '$ ; $' + (c * (a * x3 + b)) + ' - ' + (d * x3) + ' = ' + res + '$.',
          'Avec $x$ : $x \\to ' + a + 'x \\to ' + a + 'x + ' + b + ' \\to ' + c + '(' + a + 'x + ' + b + ') = ' + (a * c) + 'x + ' + cte + '$.',
          'On soustrait ' + (d === 1 ? '$x$' : '$' + d + 'x$') + ' : $' + (a * c) + 'x + ' + cte + ' - ' + (d === 1 ? 'x' : d + 'x') + ' = ' + exprTex + '$.',
          cst ? 'Les termes en $x$ s\'annulent : le résultat est toujours ' + m(cte) + ', quel que soit le nombre choisi.' : 'Le coefficient de $x$ n\'est pas nul : le résultat change quand on change le nombre de départ.'
        ],
        aide: 'Écris une expression réduite, par exemple 3x + 12.'
      };
    }
  });

  /* ================================================================== */
  /* 5e — Symétrie centrale : centre de symétrie, conservation, cercle    */
  /* ================================================================== */
  var AVEC_CENTRE = ['un parallélogramme', 'un rectangle', 'un losange', 'un carré', 'un cercle', 'un segment', 'un hexagone régulier', 'la lettre N', 'la lettre S', 'la lettre Z', 'la lettre H', 'la lettre X'];
  var SANS_CENTRE = ['un triangle équilatéral', 'un triangle isocèle', 'un trapèze isocèle', 'un pentagone régulier', 'un demi-cercle', 'la lettre A', 'la lettre T', 'la lettre V', 'la lettre E', 'la lettre K', 'la lettre Y'];
  var CENTRES = [
    ['d\'un parallélogramme', 'le point d\'intersection de ses diagonales', ['un de ses sommets', 'le milieu d\'un de ses côtés', 'il n\'en a pas']],
    ['d\'un cercle', 'son centre', ['n\'importe quel point du cercle', 'le milieu d\'un rayon', 'il n\'en a pas']],
    ['d\'un segment $[AB]$', 'son milieu', ['le point $A$', 'le point $B$', 'il n\'en a pas']],
    ['d\'un rectangle', 'le point d\'intersection de ses diagonales', ['un de ses sommets', 'le milieu de sa longueur', 'il n\'en a pas']]
  ];

  EM.gen.register({
    id: '5e-plus-symetrie-centrale-proprietes',
    titre: 'Symétrie centrale : centre de symétrie, conservation, image d\'un cercle',
    chapitres: ['5e-symetrie-centrale'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var avec = rng.bool(), bon, autres;
        if (avec) { bon = rng.pick(AVEC_CENTRE); autres = rng.sample(SANS_CENTRE, 3); }
        else { bon = rng.pick(SANS_CENTRE); autres = rng.sample(AVEC_CENTRE, 3); }
        var C0 = rng.pick(CENTRES);
        return {
          enonce: 'a) Parmi les figures suivantes, laquelle ' + (avec ? 'possède' : 'ne possède pas') + ' de centre de symétrie ?<br>b) Quel est le centre de symétrie ' + C0[0] + ' ?',
          questions: [qcm(rng, 'a) Réponse :', bon, autres), qcm(rng, 'b) Centre de symétrie ' + C0[0] + ' :', C0[1], C0[2])],
          indices: ['Un point $O$ est centre de symétrie d\'une figure si, en faisant tourner la figure d\'un demi-tour autour de $O$, elle se superpose à elle-même.', 'Pour une lettre, imagine-la tournée « la tête en bas » : se lit-elle pareil ?'],
          solution: [
            avec ? bon.charAt(0).toUpperCase() + bon.slice(1) + ' admet un centre de symétrie : après un demi-tour autour de ce point, la figure se superpose à elle-même. Les autres figures (' + autres.join(', ') + ') n\'en ont pas : après un demi-tour, elles ne se superposent pas à elles-mêmes.'
              : bon.charAt(0).toUpperCase() + bon.slice(1) + ' n\'admet pas de centre de symétrie : après un demi-tour, la figure ne se superpose pas à elle-même. En revanche, ' + autres.join(', ') + ' en ont un.',
            'Le centre de symétrie ' + C0[0] + ' est ' + C0[1] + '.'
          ]
        };
      }
      if (niveau === 2) {
        var a = rng.int(6, 16) / 2, th = 5 * rng.pick([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22]), ac = rng.int(6, 16) / 2;
        var rot = rng.int(-50, 50), pA = [0, 0], pB = pt(pA, rot, a), pC = pt(pA, rot + th, ac);
        var xs0 = [pA[0], pB[0], pC[0]], ys0 = [pA[1], pB[1], pC[1]];
        var taille = Math.max(Math.max.apply(null, xs0) - Math.min.apply(null, xs0), Math.max.apply(null, ys0) - Math.min.apply(null, ys0));
        var dxT = -1.2 - 0.3 * taille - Math.max.apply(null, xs0), dyT = 0.5 * taille - Math.min.apply(null, ys0);
        var tri = [pA, pB, pC].map(function (p) { return [p[0] + dxT, p[1] + dyT]; });
        var Oc = [0, 0];
        var img = tri.map(function (p) { return [-p[0], -p[1]]; });
        f = EM.fig.fit(tri.concat(img), { w: 300, h: 220 });
        f.poly(tri, { fill: true }).poly(img, { fill: true, dash: true });
        f.seg(tri[0], img[0], { light: true, dash: true }).ticks(tri[0], Oc, 1).ticks(Oc, img[0], 1);
        f.angle(tri[1], tri[0], tri[2], th + '°', { r: 22 }).angle(img[1], img[0], img[2], '?', { r: 22 });
        var c1 = centre(tri), c2 = centre(img);
        f.point(Oc, 'O', posLibre(tri.concat(img).map(function (p) { return Math.atan2(p[1], p[0]) * 180 / Math.PI; })));
        ['A', 'B', 'C'].forEach(function (l, j) { f.point(tri[j], l, posLoin2(tri[j], c1, Oc)); f.point(img[j], l + '\'', posLoin2(img[j], c2, Oc)); });
        return {
          enonce: 'Le triangle $A\'B\'C\'$ est le symétrique du triangle $ABC$ par rapport au point $O$. On sait que $AB = ' + n(a) + '$ cm, $AC = ' + n(ac) + '$ cm et $' + w('BAC') + ' = ' + dg(th) + '$.<br>a) Donner $A\'B\'$ et la mesure de $' + w('B\'A\'C\'') + '$.<br>b) Quelle est la position des droites $(AB)$ et $(A\'B\')$ ?',
          figure: f.svg(),
          questions: [qnum('a) $A\'B\' =$', a, 'cm'), qnum('a) $' + w('B\'A\'C\'') + ' =$', th, '°'), qcm(rng, 'b) $(AB)$ et $(A\'B\')$ sont :', 'parallèles', ['parallèles', 'perpendiculaires', 'sécantes en $O$'])],
          indices: ['La symétrie centrale conserve les longueurs et les mesures d\'angles.', 'L\'image d\'une droite par une symétrie centrale est une droite parallèle.'],
          solution: [
            'La symétrie de centre $O$ conserve les longueurs : $A\'B\' = AB = ' + n(a) + '$ cm (et $A\'C\' = AC = ' + n(ac) + '$ cm).',
            'Elle conserve les mesures d\'angles : $' + w('B\'A\'C\'') + ' = ' + w('BAC') + ' = ' + dg(th) + '$.',
            'L\'image d\'une droite par une symétrie centrale est une droite parallèle : $(A\'B\') \\parallel (AB)$. (Ici $O$ n\'est pas sur $(AB)$, donc les deux droites sont distinctes.)'
          ]
        };
      }
      // niveau 3 : image d'un cercle dans un repère
      var xo = rng.int(-3, 3), yo = rng.int(-2, 3), r = rng.pick([1, 2]), sx = rng.int(-2, 2), sy = rng.int(-2, 2), gd = 0;
      var dM, Mx, My;
      do {
        xo = rng.nz(-3, 3); yo = rng.nz(-2, 3); sx = rng.nz(-2, 2); sy = rng.nz(-2, 2); r = rng.pick([1, 2]);
        dM = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); Mx = xo + r * dM[0]; My = yo + r * dM[1];
        gd++;
      } while (gd < 300 && (Math.abs(xo - sx) + Math.abs(yo - sy) < 3 || Math.abs(2 * sx - xo) > 6 || Math.abs(2 * sy - yo) > 6 || Mx === 0 || My === 0 ||
        Math.abs(xo) - r < 0.5 && Math.abs(yo) - r < 0.5 || Math.abs(Mx - sx) + Math.abs(My - sy) < 2));
      var Op = [2 * sx - xo, 2 * sy - yo], Mp = [2 * sx - Mx, 2 * sy - My];
      f = repere(-6, 6, -5, 6, 270);
      f.circle([xo, yo], r, { accent: true });
      f.point([xo, yo], 'Ω', posQuadrant([xo, yo])).point([sx, sy], 'S', posQuadrant([sx, sy])).point([Mx, My], 'M', posQuadrant([Mx, My]));
      return {
        enonce: 'Dans un repère orthonormé, le cercle $(\\mathscr{C})$ a pour centre $\\Omega' + cpl(xo, yo) + '$ et pour rayon $' + r + '$ ; il passe par le point $M' + cpl(Mx, My) + '$. On note $(\\mathscr{C}\')$ son symétrique par rapport au point $S' + cpl(sx, sy) + '$.<br>a) Donner les coordonnées du centre $\\Omega\'$ de $(\\mathscr{C}\')$ et son rayon.<br>b) Donner les coordonnées du point $M\'$, symétrique de $M$ par rapport à $S$. Ce point est-il sur $(\\mathscr{C}\')$ ?',
        figure: f.svg(),
        questions: [qtuple('a) Coordonnées de $\\Omega\'$ :', Op), qnum('a) Rayon de $(\\mathscr{C}\')$ :', r), qtuple('b) Coordonnées de $M\'$ :', Mp), qcm(rng, 'b) $M\'$ est sur $(\\mathscr{C}\')$ :', 'oui', ['oui', 'non'])],
        indices: ['L\'image d\'un cercle par une symétrie centrale est un cercle de même rayon, dont le centre est l\'image du centre.', '$S$ est le milieu de $[\\Omega\\Omega\']$ : $x_{\\Omega\'} = 2x_S - x_\\Omega$ et $y_{\\Omega\'} = 2y_S - y_\\Omega$.'],
        solution: [
          '$S$ est le milieu de $[\\Omega\\Omega\']$ : $x_{\\Omega\'} = 2 \\times ' + T.par(sx) + ' - ' + T.par(xo) + ' = ' + n(Op[0]) + '$ et $y_{\\Omega\'} = 2 \\times ' + T.par(sy) + ' - ' + T.par(yo) + ' = ' + n(Op[1]) + '$ : $\\Omega\'' + cpl(Op[0], Op[1]) + '$.',
          'La symétrie conserve les longueurs : $(\\mathscr{C}\')$ a le même rayon, $' + r + '$.',
          'De même, $M\'' + cpl(Mp[0], Mp[1]) + '$. Comme $M$ est sur $(\\mathscr{C})$, son image $M\'$ est sur l\'image $(\\mathscr{C}\')$ : en effet $\\Omega\'M\' = \\Omega M = ' + r + '$.'
        ],
        aide: 'Écris des coordonnées sous la forme (2 ; -3).'
      };
    }
  });

  /* ================================================================== */
  /* 5e — Angles : réciproque (droites parallèles ou non)                 */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-plus-paralleles-reciproque',
    titre: 'Démontrer que deux droites sont (ou ne sont pas) parallèles avec les angles',
    chapitres: ['5e-angles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var mm, g = 0;
      do { mm = rng.int(40, 140); g++; } while (Math.abs(mm - 90) < 12 && g < 50);
      var par = rng.bool(), tau = par ? 0 : rng.pick([-4, -3, -2, 2, 3, 4]);
      var dx = 1.5 / Math.tan(rad(mm));
      var E = [3 + dx, 3], Fp = [3 - dx, 0];
      var P = { E: E, F: Fp, A: [-0.6, 3], B: [6.6, 3] };
      P.C = pt(Fp, 180 + tau, Fp[0] + 0.6); P.D = pt(Fp, tau, 6.6 - Fp[0]);
      P.X = pt(E, mm, 1.4); P.Y = pt(Fp, mm + 180, 1.4);
      var bm = mm - tau;
      var ANG = { BEX: mm, AEX: 180 - mm, AEF: mm, BEF: 180 - mm, DFE: bm, CFE: 180 - bm, CFY: bm, DFY: 180 - bm };
      var PAIRES = [['BEX', 'DFE', 'correspondants'], ['AEX', 'CFE', 'correspondants'], ['AEF', 'CFY', 'correspondants'], ['BEF', 'DFY', 'correspondants'], ['AEF', 'DFE', 'alternes-internes'], ['BEF', 'CFE', 'alternes-internes']];
      var pr = rng.pick(PAIRES), G = pr[0], I = pr[1], rel = pr[2], J = null;
      var sol = [], qs = [];
      if (niveau === 2) {
        // on donne l'angle adjacent supplémentaire de I, en F
        J = { DFE: 'CFE', CFE: 'DFE', CFY: 'DFY', DFY: 'CFY' }[I];
      }
      var donneF = J || I;
      var f = EM.fig.fit([P.A, P.B, P.C, P.D, P.X, P.Y], { w: 300, h: 220 });
      f.seg(P.A, P.B).seg(P.C, P.D).seg(P.X, P.Y);
      var arcA = function (nm, txt, r, acc) { f.angle(P[nm.charAt(0)], P[nm.charAt(1)], P[nm.charAt(2)], txt, { r: r, accent: acc }); };
      arcA(G, ANG[G] + '°', 20);
      arcA(donneF, ANG[donneF] + '°', 20, true);
      f.point(P.A, 'A', 'n').point(P.B, 'B', 'n').point(P.C, 'C', 's').point(P.D, 'D', 's');
      f.point(P.X, 'X', 'n').point(P.Y, 'Y', 's').point(P.E, 'E', 'no').point(P.F, 'F', 'se');
      var egal = ANG[G] === ANG[I];
      var concl = egal ? 'Oui, les droites $(AB)$ et $(CD)$ sont parallèles' : 'Non, les droites $(AB)$ et $(CD)$ ne sont pas parallèles';
      var concl2 = egal ? 'Non, les droites $(AB)$ et $(CD)$ ne sont pas parallèles' : 'Oui, les droites $(AB)$ et $(CD)$ sont parallèles';
      if (niveau === 1) {
        qs.push(qcm(rng, 'a) Les angles $' + w(G) + '$ et $' + w(I) + '$ sont :', rel, ['correspondants', 'alternes-internes', 'alternes-externes', 'opposés par le sommet']));
      } else {
        qs.push(qnum('a) $' + w(I) + ' =$', ANG[I], '°'));
        sol.push('Les angles $' + w(J) + '$ et $' + w(I) + '$ sont adjacents et leurs côtés non communs forment la droite $(CD)$ : ils sont supplémentaires. $' + w(I) + ' = 180^\\circ - ' + dg(ANG[J]) + ' = ' + dg(ANG[I]) + '$.');
      }
      qs.push(qcm(rng, 'b) Les droites $(AB)$ et $(CD)$ sont-elles parallèles ?', concl, [concl2]));
      sol.push('Les droites $(AB)$ et $(CD)$ sont coupées par la sécante $(XY)$. Les angles $' + w(G) + '$ et $' + w(I) + '$ sont ' + rel + '.');
      if (egal) sol.push('Ils ont la même mesure, $' + dg(ANG[G]) + '$. D\'après la réciproque de la propriété des angles ' + rel + ', les droites $(AB)$ et $(CD)$ sont parallèles.');
      else sol.push('Ils n\'ont pas la même mesure ($' + dg(ANG[G]) + '$ et $' + dg(ANG[I]) + '$). Or, si les droites étaient parallèles, ces angles ' + rel + ' seraient égaux. Donc $(AB)$ et $(CD)$ ne sont pas parallèles, même si elles semblent l\'être sur la figure.');
      return {
        enonce: 'Sur la figure, la sécante $(XY)$ coupe la droite $(AB)$ en $E$ et la droite $(CD)$ en $F$. On a mesuré $' + w(G) + ' = ' + dg(ANG[G]) + '$ et $' + w(donneF) + ' = ' + dg(ANG[donneF]) + '$.<br>' +
          (niveau === 1 ? 'a) Préciser la position des angles $' + w(G) + '$ et $' + w(I) + '$.' : 'a) Calculer la mesure de l\'angle $' + w(I) + '$.') +
          '<br>b) Les droites $(AB)$ et $(CD)$ sont-elles parallèles ? Justifier.',
        figure: f.svg(),
        questions: qs,
        indices: ['Si deux droites coupées par une sécante forment des angles alternes-internes (ou correspondants) de même mesure, alors elles sont parallèles.', 'Si ces angles n\'ont pas la même mesure, les droites ne peuvent pas être parallèles. Ne te fie pas à la figure : seules les mesures comptent.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 5e — Angles : opposés, complémentaires, ligne brisée, triangle       */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-plus-angles-raisonnement',
    titre: 'Angles opposés, complémentaires, ligne brisée entre deux parallèles',
    chapitres: ['5e-angles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f, O = [0, 0];
      if (niveau === 1) {
        var a = rng.int(20, 70), L = 3.2;
        var P = { A: pt(O, 180, L), B: pt(O, 0, L), C: pt(O, 180 - a, L), D: pt(O, -a, L), E: pt(O, 90, L) };
        f = EM.fig.fit([P.A, P.B, P.C, P.D, P.E, [0, -L]], { w: 280, h: 230 });
        f.seg(P.A, P.B).seg(P.C, P.D).seg(O, P.E, { accent: true }).rightAngle(P.B, O, P.E);
        f.angle(P.A, O, P.C, a + '°', { r: 26 });
        f.point(P.A, 'A', 'o').point(P.B, 'B', 'e').point(P.C, 'C', posAngle(180 - a)).point(P.D, 'D', posAngle(-a)).point(P.E, 'E', 'n').point(O, 'O', 'so');
        return {
          enonce: 'Les droites $(AB)$ et $(CD)$ se coupent en $O$, et la demi-droite $[OE)$ est perpendiculaire à $(AB)$. On sait que $' + w('AOC') + ' = ' + dg(a) + '$.<br>Calculer $' + w('BOD') + '$, $' + w('AOD') + '$ et $' + w('COE') + '$.',
          figure: f.svg(),
          questions: [qnum('$' + w('BOD') + ' =$', a, '°'), qnum('$' + w('AOD') + ' =$', 180 - a, '°'), qnum('$' + w('COE') + ' =$', 90 - a, '°')],
          indices: ['Deux angles opposés par le sommet ont la même mesure.', 'Deux angles adjacents dont les côtés extérieurs forment une droite sont supplémentaires ; si ces côtés forment un angle droit, ils sont complémentaires.'],
          solution: [
            '$' + w('BOD') + '$ et $' + w('AOC') + '$ sont opposés par le sommet : $' + w('BOD') + ' = ' + dg(a) + '$.',
            '$' + w('AOC') + '$ et $' + w('COB') + '$ forment l\'angle plat $' + w('AOB') + '$, et $' + w('AOD') + '$ est opposé par le sommet à $' + w('COB') + '$ : $' + w('AOD') + ' = 180^\\circ - ' + dg(a) + ' = ' + dg(180 - a) + '$.',
            '$' + w('AOC') + '$ et $' + w('COE') + '$ sont adjacents et forment l\'angle droit $' + w('AOE') + '$ : ils sont complémentaires. $' + w('COE') + ' = 90^\\circ - ' + dg(a) + ' = ' + dg(90 - a) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        var al = rng.int(25, 60), be = rng.int(25, 60), h = 3;
        var A = [0, h], B = [0, 0], ua = [Math.cos(rad(-al)), Math.sin(rad(-al))], vb = [Math.cos(rad(be)), Math.sin(rad(be))];
        // A + s·ua = B + t·vb
        var det = ua[0] * (-vb[1]) - ua[1] * (-vb[0]);
        var s = ((B[0] - A[0]) * (-vb[1]) - (B[1] - A[1]) * (-vb[0])) / det;
        var M = [A[0] + s * ua[0], A[1] + s * ua[1]];
        var xr = Math.max(M[0] + 2, 5.5), X = [xr, h], Y = [xr, 0], A0 = [-1.5, h], B0 = [-1.5, 0], Z = [M[0] - 2.2, M[1]];
        f = EM.fig.fit([A0, X, B0, Y, M], { w: 300, h: 190, pad: 26 });
        f.seg(A0, X).seg(B0, Y).seg(A, M).seg(M, B).seg(M, Z, { dash: true, accent: true });
        f.angle(X, A, M, al + '°', { r: 26 }).angle(Y, B, M, be + '°', { r: 26 }).angle(A, M, B, '?', { r: 18, accent: true });
        f.point(A, 'A', 'n').point(B, 'B', 's').point(X, 'X', 'n').point(Y, 'Y', 's').point(M, 'M', 'e').label(Z, 'z', 'o');
        return {
          enonce: 'Les droites $(AX)$ et $(BY)$ sont parallèles, et $M$ est un point situé entre elles. On sait que $' + w('XAM') + ' = ' + dg(al) + '$ et $' + w('YBM') + ' = ' + dg(be) + '$. On trace la demi-droite $[Mz)$ parallèle à $(AX)$ (en pointillés).<br>a) Calculer $' + w('AMz') + '$.<br>b) Calculer $' + w('zMB') + '$.<br>c) En déduire $' + w('AMB') + '$.',
          figure: f.svg(),
          questions: [qnum('a) $' + w('AMz') + ' =$', al, '°'), qnum('b) $' + w('zMB') + ' =$', be, '°'), qnum('c) $' + w('AMB') + ' =$', al + be, '°')],
          indices: ['La droite $(Mz)$ est parallèle à $(AX)$ ; elle est donc aussi parallèle à $(BY)$.', 'Repère deux paires d\'angles alternes-internes : l\'une avec la sécante $(AM)$, l\'autre avec la sécante $(BM)$.'],
          solution: [
            'Les droites $(Mz)$ et $(AX)$ sont parallèles et coupées par la sécante $(AM)$ : $' + w('AMz') + '$ et $' + w('XAM') + '$ sont alternes-internes, donc égaux : $' + w('AMz') + ' = ' + dg(al) + '$.',
            '$(Mz) \\parallel (AX)$ et $(AX) \\parallel (BY)$, donc $(Mz) \\parallel (BY)$. Avec la sécante $(BM)$ : $' + w('zMB') + '$ et $' + w('YBM') + '$ sont alternes-internes, donc $' + w('zMB') + ' = ' + dg(be) + '$.',
            'Les angles $' + w('AMz') + '$ et $' + w('zMB') + '$ sont adjacents : $' + w('AMB') + ' = ' + dg(al) + ' + ' + dg(be) + ' = ' + dg(al + be) + '$.'
          ]
        };
      }
      // niveau 3 : la somme des angles d'un triangle retrouvée avec deux parallèles
      var b3 = rng.int(35, 75), c3 = rng.int(35, 75);
      var tri = triAngles(b3, c3, 6), pA = tri[0], pB = tri[1], pC = tri[2];
      var Xl = [pA[0] - 3, pA[1]], Yr = [pA[0] + 3, pA[1]];
      f = EM.fig.fit([pB, pC, Xl, Yr, [-1, 0], [7, 0]], { w: 300, h: 200, pad: 26 });
      f.seg(Xl, Yr).seg([-1, 0], [7, 0]).poly([pA, pB, pC]);
      f.angle(Xl, pA, pB, b3 + '°', { r: 24 }).angle(Yr, pA, pC, c3 + '°', { r: 24 }).angle(pB, pA, pC, '?', { r: 18, accent: true });
      f.point(pA, 'A', 'n').point(pB, 'B', 's').point(pC, 'C', 's').label(Xl, 'x', 'o').label(Yr, 'y', 'e');
      return {
        enonce: 'La droite $(xy)$ passe par $A$ et est parallèle à $(BC)$. On sait que $' + w('xAB') + ' = ' + dg(b3) + '$ et $' + w('yAC') + ' = ' + dg(c3) + '$.<br>a) Calculer $' + w('ABC') + '$ et $' + w('ACB') + '$.<br>b) Calculer $' + w('BAC') + '$.<br>c) Calculer la somme des angles du triangle $ABC$.',
        figure: f.svg(),
        questions: [qnum('a) $' + w('ABC') + ' =$', b3, '°'), qnum('a) $' + w('ACB') + ' =$', c3, '°'), qnum('b) $' + w('BAC') + ' =$', 180 - b3 - c3, '°'), qnum('c) Somme :', 180, '°')],
        indices: ['Avec la sécante $(AB)$, les angles $' + w('xAB') + '$ et $' + w('ABC') + '$ sont alternes-internes.', 'Les angles $' + w('xAB') + '$, $' + w('BAC') + '$ et $' + w('CAy') + '$ forment l\'angle plat $' + w('xAy') + '$.'],
        solution: [
          '$(xy) \\parallel (BC)$ avec la sécante $(AB)$ : $' + w('ABC') + '$ et $' + w('xAB') + '$ sont alternes-internes, donc $' + w('ABC') + ' = ' + dg(b3) + '$. De même avec la sécante $(AC)$ : $' + w('ACB') + ' = ' + w('yAC') + ' = ' + dg(c3) + '$.',
          'Les angles $' + w('xAB') + '$, $' + w('BAC') + '$ et $' + w('CAy') + '$ forment l\'angle plat $' + w('xAy') + '$ : $' + w('BAC') + ' = 180^\\circ - ' + dg(b3) + ' - ' + dg(c3) + ' = ' + dg(180 - b3 - c3) + '$.',
          'Somme : $' + dg(b3) + ' + ' + dg(c3) + ' + ' + dg(180 - b3 - c3) + ' = 180^\\circ$. On vient de redémontrer que la somme des angles d\'un triangle vaut $180^\\circ$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 5e — Triangles : droites remarquables et cercle circonscrit          */
  /* ================================================================== */
  var REMARQ = {
    mediatrice: ['la médiatrice de $[BC]$', 'le centre du cercle circonscrit', 'médiatrices'],
    hauteur: ['la hauteur issue de $A$', 'l\'orthocentre', 'hauteurs'],
    mediane: ['la médiane issue de $A$', 'le centre de gravité', 'médianes'],
    bissectrice: ['la bissectrice de l\'angle $' + w('BAC') + '$', 'le centre du cercle inscrit', 'bissectrices']
  };

  EM.gen.register({
    id: '5e-plus-droites-remarquables',
    titre: 'Reconnaître une droite remarquable ; centre du cercle circonscrit',
    chapitres: ['5e-triangles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var type = rng.pick(Object.keys(REMARQ));
        var xa = rng.bool() ? rng.dec(1.2, 2.2, 1) : rng.dec(3.8, 4.8, 1), ya = rng.dec(3, 4.5, 1);
        var A = [xa, ya], B = [0, 0], C = [6, 0], I = [3, 0], H = [xa, 0];
        var AB = dist(A, B), AC = dist(A, C), D = [6 * AB / (AB + AC), 0];
        f = EM.fig.fit([A, B, C, [3, -1.3], [3, 5.2]], { w: 260, h: 230 });
        f.poly([A, B, C]);
        var lab = [];
        if (type === 'mediatrice') {
          f.seg([3, -1.2], [3, 5], { accent: true }).ticks(B, I, 1).ticks(I, C, 1).rightAngle(C, I, [3, 1]);
          lab.push([I, 'I', 'so']);
        } else if (type === 'hauteur') {
          f.seg(A, H, { accent: true }).rightAngle(C, H, A);
          lab.push([H, 'H', 's']);
        } else if (type === 'mediane') {
          f.seg(A, I, { accent: true }).ticks(B, I, 1).ticks(I, C, 1);
          lab.push([I, 'I', 's']);
        } else {
          f.seg(A, D, { accent: true });
          codeAngle(f, B, A, D, 30, 1); codeAngle(f, D, A, C, 30, 1);
          lab.push([D, 'D', 's']);
        }
        f.point(A, 'A', 'n').point(B, 'B', 'so').point(C, 'C', 'se');
        lab.forEach(function (l) { f.point(l[0], l[1], l[2]); });
        var R0 = REMARQ[type];
        return {
          enonce: 'Dans le triangle $ABC$, on a tracé en couleur une droite remarquable, avec son codage.<br>a) De quelle droite s\'agit-il ?<br>b) Les trois ' + R0[2] + ' d\'un triangle sont concourantes. Comment s\'appelle leur point commun ?',
          figure: f.svg(),
          questions: [qcm(rng, 'a) La droite en couleur est :', R0[0], Object.keys(REMARQ).map(function (k) { return REMARQ[k][0]; })), qcm(rng, 'b) Point de concours :', R0[1], Object.keys(REMARQ).map(function (k) { return REMARQ[k][1]; }))],
          indices: ['Lis le codage : angle droit, longueurs égales, angles égaux. Regarde aussi si la droite passe par un sommet.', 'Médiatrice : perpendiculaire au côté en son milieu. Hauteur : passe par un sommet, perpendiculaire au côté opposé. Médiane : joint un sommet au milieu du côté opposé. Bissectrice : partage un angle en deux angles égaux.'],
          solution: [
            type === 'mediatrice' ? 'La droite est perpendiculaire à $[BC]$ (angle droit) et passe par son milieu $I$ (longueurs égales) : c\'est la médiatrice de $[BC]$. Elle ne passe pas par $A$ en général.'
              : type === 'hauteur' ? 'La droite passe par $A$ et est perpendiculaire au côté opposé $[BC]$ (angle droit en $H$), sans que $H$ soit le milieu : c\'est la hauteur issue de $A$.'
                : type === 'mediane' ? 'La droite joint le sommet $A$ au milieu $I$ de $[BC]$ (longueurs égales codées), sans angle droit : c\'est la médiane issue de $A$.'
                  : 'La droite passe par $A$ et partage l\'angle $' + w('BAC') + '$ en deux angles de même mesure (codage) : c\'est la bissectrice de cet angle.',
            'Les trois ' + R0[2] + ' d\'un triangle se coupent en un même point : ' + R0[1] + '.'
          ]
        };
      }
      // niveau 2 : cercle circonscrit
      var x = rng.int(20, 70), aob = 180 - 2 * x, r = rng.int(5, 15) / 2, phi = rng.int(190, 250);
      var O = [0, 0], pA = pt(O, phi, 1), pB = pt(O, phi + aob, 1);
      var rest = 360 - aob, pC = pt(O, phi + aob + rest * rng.dec(0.35, 0.65, 2), 1);
      f = EM.fig.fit([[-1.1, -1.1], [1.1, 1.1]], { w: 240, h: 240, title: 'Cercle circonscrit' });
      f.circle(O, 1, { light: true }).poly([pA, pB, pC]).seg(O, pA, { accent: true }).seg(O, pB, { accent: true }).seg(O, pC, { accent: true, dash: true });
      f.angle(O, pA, pB, x + '°', { r: 26 });
      f.point(pA, 'A', posAngle(phi)).point(pB, 'B', posAngle(phi + aob)).point(pC, 'C', posAngle(phi + aob + rest / 2)).point(O, 'O', posLibre([phi, phi + aob, phi + aob + rest / 2]));
      return {
        enonce: 'Le point $O$ est le centre du cercle circonscrit au triangle $ABC$, et $OA = ' + n(r) + '$ cm. On sait que $' + w('OAB') + ' = ' + dg(x) + '$.<br>a) Le point $O$ est le point d\'intersection de quelles droites du triangle ?<br>b) Donner $OC$.<br>c) Calculer $' + w('AOB') + '$.',
        figure: f.svg(),
        questions: [qcm(rng, 'a) $O$ est l\'intersection :', 'des médiatrices', ['des médiatrices', 'des hauteurs', 'des médianes', 'des bissectrices']), qnum('b) $OC =$', r, 'cm'), qnum('c) $' + w('AOB') + ' =$', aob, '°')],
        indices: ['Le centre du cercle circonscrit est à la même distance des trois sommets.', 'Le triangle $OAB$ est isocèle en $O$ : ses angles à la base sont égaux.'],
        solution: [
          'Le centre du cercle circonscrit est le point de concours des médiatrices des côtés : il est équidistant des trois sommets.',
          'Donc $OA = OB = OC$ : $OC = ' + n(r) + '$ cm (c\'est le rayon du cercle).',
          'Le triangle $OAB$ est isocèle en $O$ ($OA = OB$) : $' + w('OBA') + ' = ' + w('OAB') + ' = ' + dg(x) + '$. Donc $' + w('AOB') + ' = 180^\\circ - 2 \\times ' + dg(x) + ' = ' + dg(aob) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 5e — Triangles : angle extérieur, triangles imbriqués, côtés possibles */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-plus-triangle-raisonnement',
    titre: 'Triangles : angle extérieur, triangles isocèles imbriqués, longueurs possibles',
    chapitres: ['5e-triangles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f, i;
      if (niveau === 1) {
        var a = rng.int(30, 90), b = rng.int(25, 120 - a), c = 180 - a - b;
        var tri = triAngles(b, c, 6), pA = tri[0], pB = tri[1], pC = tri[2], pD = [9, 0];
        f = EM.fig.fit([pA, pB, pD], { w: 300, h: 190 });
        f.poly([pA, pB, pC]).seg(pC, pD);
        f.angle(pB, pA, pC, a + '°', { r: 22 }).angle(pC, pB, pA, b + '°', { r: 22 }).angle(pA, pC, pD, '?', { r: 22, accent: true });
        f.point(pA, 'A', 'n').point(pB, 'B', 'so').point(pC, 'C', 's').point(pD, 'D', 's');
        return {
          enonce: 'Dans le triangle $ABC$, $' + w('BAC') + ' = ' + dg(a) + '$ et $' + w('ABC') + ' = ' + dg(b) + '$. Le point $D$ est sur la demi-droite $[BC)$, au-delà de $C$.<br>a) Calculer $' + w('ACB') + '$.<br>b) Calculer $' + w('ACD') + '$. Que remarques-tu ?',
          figure: f.svg(),
          questions: [qnum('a) $' + w('ACB') + ' =$', c, '°'), qnum('b) $' + w('ACD') + ' =$', a + b, '°')],
          indices: ['La somme des angles du triangle vaut $180^\\circ$.', 'Les angles $' + w('ACB') + '$ et $' + w('ACD') + '$ sont adjacents et forment un angle plat.'],
          solution: [
            '$' + w('ACB') + ' = 180^\\circ - ' + dg(a) + ' - ' + dg(b) + ' = ' + dg(c) + '$.',
            '$B$, $C$, $D$ sont alignés : $' + w('ACB') + ' + ' + w('ACD') + ' = 180^\\circ$, donc $' + w('ACD') + ' = 180^\\circ - ' + dg(c) + ' = ' + dg(a + b) + '$.',
            'On remarque que $' + w('ACD') + ' = ' + w('BAC') + ' + ' + w('ABC') + '$ : l\'angle « extérieur » en $C$ est égal à la somme des deux autres angles du triangle.'
          ]
        };
      }
      if (niveau === 2) {
        var b2, c2, g = 0;
        do { b2 = rng.int(25, 55); c2 = rng.int(25, 80); g++; } while (g < 200 && 180 - 2 * b2 - c2 < 15);
        var tri2 = triAngles(b2, c2, 6), A2 = tri2[0], B2 = tri2[1], C2 = tri2[2];
        var BD = (dist(A2, B2) / 2) / Math.cos(rad(b2)), D2 = [BD, 0];
        f = EM.fig.fit([A2, B2, C2], { w: 300, h: 200 });
        f.poly([A2, B2, C2]).seg(A2, D2, { accent: true }).ticks(D2, A2, 1).ticks(B2, D2, 1);
        f.angle(D2, B2, A2, b2 + '°', { r: 24 }).angle(A2, C2, B2, c2 + '°', { r: 24 });
        f.point(A2, 'A', 'n').point(B2, 'B', 'so').point(C2, 'C', 'se').point(D2, 'D', 's');
        var adb = 180 - 2 * b2, adc = 2 * b2, dac = 180 - 2 * b2 - c2;
        return {
          enonce: 'Dans le triangle $ABC$, $' + w('ABC') + ' = ' + dg(b2) + '$ et $' + w('ACB') + ' = ' + dg(c2) + '$. Le point $D$ du segment $[BC]$ est tel que $DA = DB$.<br>a) Calculer $' + w('ADB') + '$.<br>b) Calculer $' + w('ADC') + '$.<br>c) Calculer $' + w('DAC') + '$.',
          figure: f.svg(),
          questions: [qnum('a) $' + w('ADB') + ' =$', adb, '°'), qnum('b) $' + w('ADC') + ' =$', adc, '°'), qnum('c) $' + w('DAC') + ' =$', dac, '°')],
          indices: ['Le triangle $ABD$ est isocèle en $D$ : ses angles à la base $' + w('DBA') + '$ et $' + w('DAB') + '$ sont égaux.', 'Les angles $' + w('ADB') + '$ et $' + w('ADC') + '$ forment un angle plat ; puis utilise la somme des angles du triangle $ADC$.'],
          solution: [
            '$DA = DB$ : le triangle $ABD$ est isocèle en $D$, donc $' + w('DAB') + ' = ' + w('DBA') + ' = ' + dg(b2) + '$, et $' + w('ADB') + ' = 180^\\circ - 2 \\times ' + dg(b2) + ' = ' + dg(adb) + '$.',
            '$B$, $D$, $C$ sont alignés : $' + w('ADC') + ' = 180^\\circ - ' + dg(adb) + ' = ' + dg(adc) + '$.',
            'Dans le triangle $ADC$ : $' + w('DAC') + ' = 180^\\circ - ' + dg(adc) + ' - ' + dg(c2) + ' = ' + dg(dac) + '$.'
          ]
        };
      }
      // niveau 3 : longueurs entières possibles du troisième côté
      var a3 = rng.int(2, 6), b3 = rng.int(a3 + 1, a3 + 7);
      var poss = [];
      for (i = b3 - a3 + 1; i <= a3 + b3 - 1; i++) poss.push(i);
      var iso = [a3, b3].filter(function (v) { return poss.indexOf(v) >= 0; });
      var lieu = rng.pick(['un enclos triangulaire pour les moutons de Tabaski', 'un panneau triangulaire', 'un jardin triangulaire']);
      return {
        enonce: 'On veut fabriquer ' + lieu + ' : deux côtés mesurent ' + u(a3, 'm') + ' et ' + u(b3, 'm') + ', et la longueur du troisième côté est un nombre entier de mètres.<br>a) Donner toutes les longueurs possibles du troisième côté.<br>b) Lesquelles donnent un triangle isocèle ?',
        questions: [{ label: 'a) Longueurs possibles (m) :', type: 'set', reponse: poss }, { label: 'b) Triangle isocèle (m) :', type: 'set', reponse: iso }],
        indices: ['Inégalité triangulaire : chaque côté est strictement plus petit que la somme des deux autres.', 'Le troisième côté $c$ doit vérifier $' + b3 + ' - ' + a3 + ' < c < ' + b3 + ' + ' + a3 + '$.'],
        solution: [
          'Le troisième côté $c$ doit être plus petit que $' + a3 + ' + ' + b3 + ' = ' + (a3 + b3) + '$ (sinon il serait trop long).',
          'Le côté de ' + b3 + ' m doit être plus petit que $' + a3 + ' + c$ : donc $c > ' + b3 + ' - ' + a3 + ' = ' + (b3 - a3) + '$.',
          'Donc $' + (b3 - a3) + ' < c < ' + (a3 + b3) + '$ : les entiers possibles sont $' + T.set(poss) + '$. (Pour $c = ' + (b3 - a3) + '$ ou $c = ' + (a3 + b3) + '$, les trois sommets seraient alignés.)',
          'Le triangle est isocèle si deux côtés sont égaux : $c = ' + a3 + '$' + (poss.indexOf(a3) < 0 ? ' n\'est pas possible ici' : '') + ' ou $c = ' + b3 + '$. Réponse : $' + T.set(iso) + '$.'
        ],
        aide: 'Sépare les nombres par « ; ».'
      };
    }
  });

  /* ================================================================== */
  /* 5e — Parallélogrammes : preuves, coordonnées, angles                 */
  /* ================================================================== */
  var HYP_PARA = [
    ['$O$ est le milieu de $[AC]$ et de $[BD]$', 'Oui, car ses diagonales ont le même milieu', 'Un quadrilatère dont les diagonales ont le même milieu est un parallélogramme.'],
    ['$AB = CD$ et $AD = BC$ (et $ABCD$ n\'est pas croisé)', 'Oui, car ses côtés opposés ont deux à deux la même longueur', 'Un quadrilatère non croisé dont les côtés opposés ont deux à deux la même longueur est un parallélogramme.'],
    ['$(AB) \\parallel (CD)$ et $AB = CD$ (et $ABCD$ n\'est pas croisé)', 'Oui, car deux côtés opposés sont parallèles et de même longueur', 'Un quadrilatère non croisé qui a deux côtés opposés parallèles et de même longueur est un parallélogramme.'],
    ['$(AB) \\parallel (CD)$ et $(AD) \\parallel (BC)$', 'Oui, car ses côtés opposés sont parallèles deux à deux', 'C\'est la définition du parallélogramme : ses côtés opposés sont parallèles deux à deux.'],
    ['$(AB) \\parallel (CD)$ et $AD = BC$', 'Non, on ne peut pas conclure', 'Un trapèze isocèle vérifie ces conditions sans être un parallélogramme.'],
    ['$O$ est le milieu de $[AC]$ (seulement)', 'Non, on ne peut pas conclure', 'Il faudrait aussi que $O$ soit le milieu de $[BD]$.'],
    ['$AB = BC$ et $CD = DA$', 'Non, on ne peut pas conclure', 'Ce sont des côtés consécutifs : un « cerf-volant » vérifie ces conditions sans être un parallélogramme.']
  ];

  EM.gen.register({
    id: '5e-plus-parallelogramme-preuves',
    titre: 'Parallélogramme : justifier, construire par coordonnées, calculer des angles',
    chapitres: ['5e-parallelogrammes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var H0 = rng.pick(HYP_PARA), toutes = HYP_PARA.map(function (h) { return h[1]; }).filter(function (x, i, t) { return t.indexOf(x) === i; });
        var autres = rng.shuffle(toutes.filter(function (x) { return x !== H0[1]; })).slice(0, 3);
        if (H0[1] !== 'Non, on ne peut pas conclure' && autres.indexOf('Non, on ne peut pas conclure') < 0) autres[2] = 'Non, on ne peut pas conclure';
        return {
          enonce: '$ABCD$ est un quadrilatère et $O$ est le point d\'intersection de ses diagonales. On sait que : ' + H0[0] + '.<br>Peut-on affirmer que $ABCD$ est un parallélogramme ?',
          questions: [qcm(rng, 'Réponse :', H0[1], autres)],
          indices: ['Un quadrilatère est un parallélogramme si : ses diagonales ont le même milieu, ou ses côtés opposés sont parallèles deux à deux, ou ses côtés opposés ont deux à deux la même longueur (non croisé), ou deux côtés opposés sont parallèles et de même longueur (non croisé).', 'Fais une figure à main levée et cherche un contre-exemple.'],
          solution: [H0[1].indexOf('Non') === 0 ? 'On ne peut pas conclure. ' + H0[2] : 'Oui. ' + H0[2]]
        };
      }
      if (niveau === 2) {
        var P = {}, g = 0;
        do {
          ['A', 'B', 'C'].forEach(function (k) { P[k] = [rng.nz(-4, 4), rng.nz(-4, 4)]; });
          P.D = [P.A[0] + P.C[0] - P.B[0], P.A[1] + P.C[1] - P.B[1]];
          g++;
        } while (g < 300 && (Math.abs((P.B[0] - P.A[0]) * (P.C[1] - P.A[1]) - (P.B[1] - P.A[1]) * (P.C[0] - P.A[0])) < 6 || Math.abs(P.D[0]) > 5 || Math.abs(P.D[1]) > 5 || dist(P.A, P.C) < 3 || P.D[0] === 0 || P.D[1] === 0));
        var I = [(P.A[0] + P.C[0]) / 2, (P.A[1] + P.C[1]) / 2];
        f = repere(-6, 6, -6, 6, 270);
        f.seg(P.A, P.B).seg(P.B, P.C).seg(P.A, P.C, { dash: true });
        var ctr = centre([P.A, P.B, P.C, P.D]);
        f.point(P.A, 'A', posQuadrant(P.A)).point(P.B, 'B', posQuadrant(P.B)).point(P.C, 'C', posQuadrant(P.C));
        return {
          enonce: 'Dans un repère orthonormé, on donne $A' + cpl(P.A[0], P.A[1]) + '$, $B' + cpl(P.B[0], P.B[1]) + '$ et $C' + cpl(P.C[0], P.C[1]) + '$.<br>a) Calculer les coordonnées du milieu $I$ de $[AC]$.<br>b) En déduire les coordonnées du point $D$ tel que $ABCD$ soit un parallélogramme.',
          figure: f.svg(),
          questions: [qtuple('a) Coordonnées de $I$ :', I), qtuple('b) Coordonnées de $D$ :', P.D)],
          indices: ['Le milieu de $[AC]$ a pour coordonnées $\\left(\\dfrac{x_A + x_C}{2} \\,;\\, \\dfrac{y_A + y_C}{2}\\right)$.', '$ABCD$ est un parallélogramme si ses diagonales $[AC]$ et $[BD]$ ont le même milieu : $I$ doit aussi être le milieu de $[BD]$.'],
          solution: [
            '$x_I = \\dfrac{' + n(P.A[0]) + ' + ' + T.par(P.C[0]) + '}{2} = ' + n(I[0]) + '$ et $y_I = \\dfrac{' + n(P.A[1]) + ' + ' + T.par(P.C[1]) + '}{2} = ' + n(I[1]) + '$ : $I' + cpl(I[0], I[1]) + '$.',
            '$ABCD$ est un parallélogramme lorsque ses diagonales ont le même milieu : $I$ doit être le milieu de $[BD]$, c\'est-à-dire que $D$ est le symétrique de $B$ par rapport à $I$.',
            '$x_D = 2x_I - x_B = ' + n(2 * I[0]) + ' - ' + T.par(P.B[0]) + ' = ' + n(P.D[0]) + '$ et $y_D = 2y_I - y_B = ' + n(2 * I[1]) + ' - ' + T.par(P.B[1]) + ' = ' + n(P.D[1]) + '$ : $D' + cpl(P.D[0], P.D[1]) + '$.'
          ],
          aide: 'Écris des coordonnées sous la forme (2 ; -3) ; tu peux utiliser des décimaux (1,5).'
        };
      }
      // niveau 3 : angles dans un parallélogramme avec une diagonale
      var a = rng.int(50, 120), b = rng.int(20, 150 - a - 10);
      var Bang = 180 - a - b;
      var AB = 5, AD = AB * Math.sin(rad(Bang)) / Math.sin(rad(b));
      var pA = [0, 0], pB = [AB, 0], pD = pt(pA, a, AD), pC = [pB[0] + pD[0], pB[1] + pD[1]];
      f = EM.fig.fit([pA, pB, pC, pD], { w: 300, h: 200 });
      f.poly([pA, pB, pC, pD]).seg(pB, pD);
      f.angle(pB, pA, pD, a + '°', { r: 22 }).angle(pA, pD, pB, b + '°', { r: 26 });
      var c4 = centre([pA, pB, pC, pD]);
      ['A', 'B', 'C', 'D'].forEach(function (l, j) { f.point([pA, pB, pC, pD][j], l, posLoin([pA, pB, pC, pD][j], c4)); });
      return {
        enonce: '$ABCD$ est un parallélogramme. On sait que $' + w('DAB') + ' = ' + dg(a) + '$ et $' + w('ADB') + ' = ' + dg(b) + '$.<br>a) Calculer $' + w('ABD') + '$.<br>b) Calculer $' + w('DBC') + '$.<br>c) Calculer $' + w('ABC') + '$ et $' + w('BCD') + '$.',
        figure: f.svg(),
        questions: [qnum('a) $' + w('ABD') + ' =$', Bang, '°'), qnum('b) $' + w('DBC') + ' =$', b, '°'), qnum('c) $' + w('ABC') + ' =$', 180 - a, '°'), qnum('c) $' + w('BCD') + ' =$', a, '°')],
        indices: ['Dans le triangle $ABD$, la somme des angles vaut $180^\\circ$.', 'Les côtés $(AD)$ et $(BC)$ sont parallèles : avec la sécante $(BD)$, cherche des angles alternes-internes.'],
        solution: [
          'Dans le triangle $ABD$ : $' + w('ABD') + ' = 180^\\circ - ' + dg(a) + ' - ' + dg(b) + ' = ' + dg(Bang) + '$.',
          '$(AD) \\parallel (BC)$ (côtés opposés du parallélogramme) et $(BD)$ est une sécante : $' + w('DBC') + '$ et $' + w('ADB') + '$ sont alternes-internes, donc $' + w('DBC') + ' = ' + dg(b) + '$.',
          '$' + w('ABC') + ' = ' + w('ABD') + ' + ' + w('DBC') + ' = ' + dg(Bang) + ' + ' + dg(b) + ' = ' + dg(180 - a) + '$ (deux angles consécutifs d\'un parallélogramme sont bien supplémentaires).',
          'Les angles opposés d\'un parallélogramme sont égaux : $' + w('BCD') + ' = ' + w('DAB') + ' = ' + dg(a) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 5e — Prisme et cylindre : éléments, patron, abreuvoir                */
  /* ================================================================== */
  var BASES = [[3, 'triangulaire'], [4, 'quadrilatère'], [5, 'pentagonale'], [6, 'hexagonale'], [8, 'octogonale']];

  EM.gen.register({
    id: '5e-plus-prisme-patron-debit',
    titre: 'Prisme et cylindre : compter les éléments, patron, remplir un abreuvoir',
    chapitres: ['5e-prisme-cylindre'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var B0 = rng.pick(BASES), k = B0[0];
        var nomP = 'un prisme droit à base ' + (k === 4 ? 'quadrilatère' : B0[1]);
        return {
          enonce: 'On considère ' + nomP + ' (ses deux bases sont des polygones à ' + k + ' côtés).<br>Combien a-t-il de faces, d\'arêtes et de sommets ? Quelle est la nature de ses faces latérales ?',
          questions: [qnum('Nombre de faces :', k + 2), qnum('Nombre d\'arêtes :', 3 * k), qnum('Nombre de sommets :', 2 * k), qcm(rng, 'Faces latérales :', 'des rectangles', ['des rectangles', 'des triangles', 'des polygones à ' + k + ' côtés', 'des disques'])],
          indices: ['Chaque côté d\'une base correspond à une face latérale.', 'Les arêtes : celles de la base du dessous, celles de la base du dessus, et les arêtes latérales qui les relient.'],
          solution: [
            'Faces : 2 bases et ' + k + ' faces latérales (une par côté de la base), soit $2 + ' + k + ' = ' + (k + 2) + '$ faces.',
            'Arêtes : ' + k + ' sur chaque base et ' + k + ' arêtes latérales, soit $3 \\times ' + k + ' = ' + (3 * k) + '$ arêtes.',
            'Sommets : ' + k + ' sur chaque base, soit $2 \\times ' + k + ' = ' + (2 * k) + '$ sommets.',
            'Dans un prisme droit, les faces latérales sont des rectangles.'
          ]
        };
      }
      if (niveau === 2) {
        var r = rng.pick([3, 3.5, 4, 4.5, 5, 6, 7.5]), h = rng.int(8, 20), Lr = 2 * Math.PI * r;
        var Ltot = R(Lr, 1), Atot = Math.round(2 * Math.PI * r * h + 2 * Math.PI * r * r);
        var objet = rng.pick(['une boîte de concentré de tomate', 'une boîte de lait en poudre', 'un pot de peinture', 'une tirelire cylindrique']);
        return {
          enonce: 'On fabrique le patron d\'' + objet + ' : un cylindre de rayon ' + u(r, 'cm') + ' et de hauteur ' + u(h, 'cm') + '. Le patron est formé d\'un rectangle et de deux disques.<br>a) Quelles sont les dimensions du rectangle ? (Donner la longueur au millimètre près.)<br>b) Calculer l\'aire totale du patron, arrondie au cm².',
          questions: [qnum('a) Longueur du rectangle :', Ltot, 'cm', 0.051), qnum('a) Largeur du rectangle :', h, 'cm'), qnum('b) Aire totale :', Atot, 'cm²', 1)],
          indices: ['Quand on enroule le rectangle, sa longueur fait le tour d\'un disque de base : c\'est le périmètre $2\\pi r$.', 'Aire totale = aire du rectangle $(2\\pi r \\times h)$ + aire des deux disques $(2 \\times \\pi r^2)$.'],
          solution: [
            'La longueur du rectangle est le périmètre du disque de base : $2 \\times \\pi \\times ' + n(r) + ' \\approx ' + n(Ltot) + '$ cm. Sa largeur est la hauteur du cylindre : ' + u(h, 'cm') + '.',
            'Aire du rectangle : $2\\pi \\times ' + n(r) + ' \\times ' + h + ' \\approx ' + n(R(2 * Math.PI * r * h, 1)) + '$ cm².',
            'Aire des deux disques : $2 \\times \\pi \\times ' + n(r) + '^2 \\approx ' + n(R(2 * Math.PI * r * r, 1)) + '$ cm².',
            'Aire totale $\\approx ' + n(Atot) + '$ cm².'
          ]
        };
      }
      // niveau 3 : abreuvoir en forme de prisme à base triangulaire
      var larg = rng.pick([40, 50, 60, 80]), prof = rng.pick([30, 40, 45, 50]), long = rng.pick([2, 2.5, 3, 4, 5]);
      var Bm = (larg / 100) * (prof / 100) / 2, V = R(Bm * long, 6), L = R(V * 1000, 3), debit = rng.pick([10, 15, 20, 25, 30, 40]);
      var tmin = L / debit;
      var mn = Math.floor(tmin), sec = Math.round((tmin - mn) * 60);
      var village = rng.pick(['du Ferlo', 'près de Linguère', 'près de Dahra', 'près de Matam']);
      return {
        enonce: 'Un abreuvoir pour le bétail, dans un forage ' + village + ', a la forme d\'un prisme droit couché. Sa base est un triangle de ' + u(larg, 'cm') + ' de large (en haut) et de ' + u(prof, 'cm') + ' de profondeur ; sa longueur est de ' + u(long, 'm') + '.<br>a) Calculer le volume de l\'abreuvoir en m³, puis sa contenance en litres.<br>b) Le robinet du forage débite ' + debit + ' litres par minute. Combien de minutes faut-il pour remplir l\'abreuvoir vide ? (Arrondir à la minute.)',
        questions: [qnum('a) Volume (m³) :', V, 'm³'), qnum('a) Contenance (L) :', L, 'L'), qnum('b) Durée (min) :', Math.round(tmin), 'min', 0.5)],
        indices: ['Convertis d\'abord toutes les longueurs en mètres. Aire de la base (triangle) $= \\dfrac{\\text{largeur} \\times \\text{profondeur}}{2}$.', '$V = \\mathcal{B} \\times h$ et $1$ m³ $= 1\\,000$ L. Durée = contenance ÷ débit.'],
        solution: [
          'En mètres : largeur $' + n(larg / 100) + '$ m, profondeur $' + n(prof / 100) + '$ m. Aire de la base : $\\dfrac{' + n(larg / 100) + ' \\times ' + n(prof / 100) + '}{2} = ' + n(Bm) + '$ m².',
          'Volume : $V = ' + n(Bm) + ' \\times ' + n(long) + ' = ' + n(V) + '$ m³, soit $' + n(L) + '$ L.',
          'Durée de remplissage : $' + n(L) + ' \\div ' + debit + ' \\approx ' + n(R(tmin, 2)) + '$ min, soit environ ' + Math.round(tmin) + ' minutes' + (sec && mn ? ' (' + mn + ' min ' + sec + ' s)' : '') + '.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 4e — Rationnels : comparer, ranger, partager                        */
  /* ================================================================== */
  /** fraction a/b écrite telle quelle (signe devant, dénominateur positif) */
  function frx(a, b) {
    if (b < 0) { a = -a; b = -b; }
    if (b === 1) return n(a);
    return (a < 0 ? '-' : '') + '\\dfrac{' + Math.abs(a) + '}{' + b + '}';
  }

  EM.gen.register({
    id: '4e-plus-rationnels-comparer-partage',
    titre: 'Rationnels : comparer, ranger, inverse et opposé, problème de partage',
    chapitres: ['4e-rationnels'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a, b, c, d, g = 0;
        do {
          a = rng.nz(-12, 12); b = rng.int(2, 12);
          if (rng.bool(0.2)) { var k = rng.int(2, 3); c = a * k; d = b * k; if (rng.bool(0.5)) { c = -c; } }
          else { c = rng.nz(-12, 12); d = rng.intExcept(2, 12, [b]); }
          g++;
        } while (g < 200 && (a % b === 0 || c % d === 0 || (a * d === c * b && c * a < 0)));
        var r1 = F(a, b), r2 = F(c, d), cmp = r1.cmp(r2), signe = cmp < 0 ? '<' : cmp > 0 ? '>' : '=';
        var L = ar.lcm(b, d), N1 = a * L / b, N2 = c * L / d;
        var sol = [];
        if (a * c < 0) sol.push('Les deux nombres sont de signes contraires : le nombre négatif est le plus petit. Donc $' + frx(a, b) + ' ' + signe + ' ' + frx(c, d) + '$.');
        else {
          sol.push('On les écrit avec le même dénominateur positif $' + L + '$ : $' + frx(a, b) + ' = ' + frx(N1, L) + '$ et $' + frx(c, d) + ' = ' + frx(N2, L) + '$.');
          sol.push('On compare les numérateurs : $' + n(N1) + ' ' + signe + ' ' + n(N2) + '$, donc $' + frx(a, b) + ' ' + signe + ' ' + frx(c, d) + '$.' + '');
        }
        sol.push('L\'inverse de $' + frx(a, b) + '$ est $' + frx(b, a) + (F(b, a).d !== Math.abs(a) || F(b, a).n !== (a < 0 ? -b : b) ? ' = ' + F(b, a).tex() : '') + '$ (même signe) ; son opposé est $' + frx(-a, b) + '$ (signe contraire).');
        return {
          enonce: 'a) Comparer les nombres $' + frx(a, b) + '$ et $' + frx(c, d) + '$.<br>b) Donner l\'inverse, puis l\'opposé, du nombre $' + frx(a, b) + '$.',
          questions: [qcm(rng, 'a) $' + frx(a, b) + ' \\;\\ldots\\; ' + frx(c, d) + '$', '$' + signe + '$', ['$<$', '$>$', '$=$']), qnum('b) Inverse :', F(b, a)), qnum('b) Opposé :', F(-a, b))],
          indices: ['Pour comparer deux fractions, écris-les avec le même dénominateur positif, puis compare les numérateurs (attention aux signes).', 'Inverse de $\\dfrac{a}{b}$ : $\\dfrac{b}{a}$ (même signe). Opposé : $-\\dfrac{a}{b}$.'],
          solution: sol,
          aide: 'Écris une fraction avec « / », par exemple -7/3.'
        };
      }
      if (niveau === 2) {
        var vals = [], g2 = 0;
        do {
          vals = [];
          var dens = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 4);
          dens.forEach(function (dd) { var nn; do { nn = rng.nz(-11, 11); } while (nn % dd === 0); vals.push([nn, dd]); });
          var fv = vals.map(function (v) { return v[0] / v[1]; });
          var distincts = fv.every(function (x, i) { return fv.every(function (y, j) { return i === j || Math.abs(x - y) > 1e-9; }); });
          g2++;
        } while (g2 < 200 && (!distincts || !vals.some(function (v) { return v[0] < 0; }) || !vals.some(function (v) { return v[0] > 0; })));
        var tex = function (v) { return frx(v[0], v[1]); };
        var tri = vals.slice().sort(function (x, y) { return x[0] / x[1] - y[0] / y[1]; });
        var parNum = vals.slice().sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
        var parAbs = vals.slice().sort(function (x, y) { return Math.abs(x[0] / x[1]) - Math.abs(y[0] / y[1]); });
        var inv = tri.slice().reverse();
        var ecr = function (arr) { return '$' + arr.map(tex).join(' < ') + '$'; };
        var choix = [ecr(parNum), ecr(parAbs), ecr(inv), ecr([tri[1], tri[0], tri[2], tri[3]]), ecr([tri[0], tri[2], tri[1], tri[3]])];
        var LL = vals.reduce(function (acc, v) { return ar.lcm(acc, v[1]); }, 1);
        return {
          enonce: 'Ranger dans l\'ordre croissant les nombres : $' + rng.shuffle(vals).map(tex).join(' \\;;\\; ') + '$.',
          questions: [qcm(rng, 'Ordre croissant :', ecr(tri), choix.filter(function (x) { return x !== ecr(tri); }).slice(0, 3))],
          indices: ['Sépare d\'abord les négatifs (plus petits) des positifs.', 'Écris tous les nombres avec le même dénominateur positif $' + LL + '$, puis compare les numérateurs.'],
          solution: [
            'Avec le dénominateur commun $' + LL + '$ : ' + vals.map(function (v) { return '$' + tex(v) + ' = ' + frx(v[0] * LL / v[1], LL) + '$'; }).join(' ; ') + '.',
            'On range les numérateurs : $' + tri.map(function (v) { return n(v[0] * LL / v[1]); }).join(' < ') + '$.',
            'Ordre croissant : ' + ecr(tri) + '.'
          ]
        };
      }
      // niveau 3 : partage d'un champ
      var P1 = rng.pick([[1, 3], [2, 5], [1, 4], [3, 8], [2, 7], [1, 6], [3, 10], [1, 5]]), Q1 = rng.pick([[1, 3], [1, 2], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]);
      var p1 = F(P1[0], P1[1]), reste = F(1).sub(p1), mil = F(Q1[0], Q1[1]).mul(reste), nie = F(1).sub(p1).sub(mil);
      var D = ar.lcm(ar.lcm(p1.d, mil.d), nie.d), kS = Math.max(1, Math.ceil(10 / D)), S = D * kS;
      if (S > 120) S = D;
      var nom = personne(rng, 'm').nom, lieu = rng.pick(['Nioro du Rip', 'Kaffrine', 'Gossas', 'Sokone', 'Koungheul']);
      var aNie = nie.mul(S);
      return {
        enonce: 'Le champ familial ' + de(nom) + ', près de ' + lieu + ', mesure ' + u(S, 'ha') + '. Les $' + frx(P1[0], P1[1]) + '$ du champ sont cultivés en arachide, les $' + frx(Q1[0], Q1[1]) + '$ du reste en mil, et le reste en niébé.<br>a) Quelle fraction du champ est cultivée en mil ?<br>b) Quelle fraction du champ est cultivée en niébé ?<br>c) Calculer la surface cultivée en niébé.',
        questions: [qnum('a) Fraction en mil :', mil), qnum('b) Fraction en niébé :', nie), qnum('c) Surface en niébé :', aNie.value(), 'ha')],
        indices: ['Le reste après l\'arachide représente $1 - ' + frx(P1[0], P1[1]) + '$ du champ.', 'Prendre les $' + frx(Q1[0], Q1[1]) + '$ du reste, c\'est multiplier le reste par $' + frx(Q1[0], Q1[1]) + '$.'],
        solution: [
          'Après l\'arachide, il reste $1 - ' + frx(P1[0], P1[1]) + ' = ' + reste.tex() + '$ du champ.',
          'Mil : $' + frx(Q1[0], Q1[1]) + ' \\times ' + reste.tex() + ' = ' + frx(Q1[0] * reste.n, Q1[1] * reste.d) + (F(Q1[0] * reste.n, Q1[1] * reste.d).d !== Q1[1] * reste.d ? ' = ' + mil.tex() : '') + '$ du champ.',
          'Niébé : $1 - ' + p1.tex() + ' - ' + mil.tex() + ' = ' + nie.tex() + '$ du champ.',
          'Surface en niébé : $' + nie.tex() + ' \\times ' + S + ' = ' + n(aNie.value()) + '$ ha.'
        ],
        aide: 'Écris une fraction avec « / », par exemple 3/10.'
      };
    }
  });

  /* ================================================================== */
  /* 4e — Applications linéaires : graphique, tableau, propriétés         */
  /* ================================================================== */
  var CTX_LIN = [
    { lin: true, x: 'Nombre de pains', y: 'Prix (F CFA)', a: 150, b: 0, xs: [2, 3, 5, 8], txt: 'le prix payé à la boulangerie en fonction du nombre de pains achetés', unite: 'F CFA', q: 12 },
    { lin: true, x: 'Masse de mangues (kg)', y: 'Prix (F CFA)', a: 350, b: 0, xs: [2, 4, 5, 7], txt: 'le prix de mangues au marché de Ziguinchor en fonction de la masse achetée', unite: 'F CFA', q: 10 },
    { lin: true, x: 'Longueur de tissu (m)', y: 'Prix (F CFA)', a: 2500, b: 0, xs: [1.5, 2, 3, 4], txt: 'le prix d\'un tissu wax au marché HLM en fonction de la longueur achetée', unite: 'F CFA', q: 6 },
    { lin: false, x: 'Distance (km)', y: 'Prix (F CFA)', a: 250, b: 500, xs: [2, 4, 6, 10], txt: 'le prix d\'une course de taxi (prise en charge comprise) en fonction de la distance', unite: 'F CFA' },
    { lin: false, x: 'Durée (h)', y: 'Prix (F CFA)', a: 2000, b: 5000, xs: [1, 2, 3, 5], txt: 'le prix de location d\'une pirogue (forfait de départ compris) en fonction de la durée', unite: 'F CFA' },
    { lin: false, x: 'Consommation (kWh)', y: 'Facture (F CFA)', a: 100, b: 1500, xs: [50, 100, 150, 200], txt: 'le montant d\'une facture d\'électricité (prime fixe comprise) en fonction de la consommation', unite: 'F CFA' }
  ];

  EM.gen.register({
    id: '4e-plus-lineaire-graphique',
    titre: 'Application linéaire : lire un graphique, reconnaître un tableau, utiliser la linéarité',
    chapitres: ['4e-applications-lineaires'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var x0 = rng.int(1, 4), y0, g = 0;
        do { y0 = rng.nz(-6, 6); g++; } while (g < 50 && Math.abs(y0) === x0);
        var A = F(y0, x0), k1 = rng.nz(-5, 5) * (A.d), img = A.mul(k1);
        var t = rng.nz(-4, 4) * A.d, yt = A.mul(t);
        while (Math.abs(img.value()) > 99 || k1 === x0) { k1 = rng.nz(-5, 5); img = A.mul(k1); }
        var f = repere(-6, 6, -6, 6, 270);
        f.line([0, 0], [x0, y0], { accent: true }).point([x0, y0], 'A', posQuadrant([x0, y0]));
        return {
          enonce: 'La droite tracée dans le repère est la représentation graphique d\'une application linéaire $f$. Elle passe par le point $A$, dont les coordonnées se lisent sur le quadrillage.<br>a) Déterminer le coefficient $a$ de $f$.<br>b) Calculer $f(' + n(k1) + ')$.<br>c) Calculer l\'antécédent de $' + yt.tex() + '$ par $f$.',
          figure: f.svg(),
          questions: [qnum('a) $a =$', A), qnum('b) $f(' + n(k1) + ') =$', img), qnum('c) Antécédent :', t)],
          indices: ['Lis les coordonnées du point $A$ : $A(x_A ; y_A)$ avec $y_A = f(x_A) = a \\times x_A$.', 'Donc $a = \\dfrac{y_A}{x_A}$. Image : multiplier par $a$ ; antécédent : diviser par $a$.'],
          solution: [
            'On lit $A' + cpl(x0, y0) + '$ : $f(' + x0 + ') = ' + y0 + '$.',
            '$a = \\dfrac{f(' + x0 + ')}{' + x0 + '} = ' + frx(y0, x0) + (A.d !== x0 ? ' = ' + A.tex() : '') + '$, donc $f(x) = ' + T.mono(A, 'x', true) + '$.',
            '$f(' + n(k1) + ') = ' + A.tex() + ' \\times ' + T.par(k1) + ' = ' + img.tex() + '$.',
            'Antécédent de $' + yt.tex() + '$ : on résout $' + T.mono(A, 'x', true) + ' = ' + yt.tex() + '$, d\'où $x = ' + yt.tex() + ' \\div ' + (A.n < 0 ? '\\left(' + A.tex() + '\\right)' : A.tex()) + ' = ' + n(t) + '$.'
          ],
          aide: 'Écris une fraction avec « / », par exemple -5/2.'
        };
      }
      if (niveau === 2) {
        var C = rng.pick(CTX_LIN), ys = C.xs.map(function (x) { return R(C.a * x + C.b); });
        var quo = R(ys[0] / C.xs[0], 4), quos = C.xs.map(function (x, i) { return R(ys[i] / x, 4); });
        var qs = [qcm(rng, 'a) Est-ce un tableau de proportionnalité ?', C.lin ? 'Oui : $y$ est une fonction linéaire de $x$' : 'Non : ce n\'est pas une application linéaire', ['Oui : $y$ est une fonction linéaire de $x$', 'Non : ce n\'est pas une application linéaire']), qnum('b) Quotient $\\dfrac{y}{x}$ pour la première colonne :', quo)];
        if (C.lin) qs.push(qnum('c) Valeur de $y$ pour $x = ' + C.q + '$ :', C.a * C.q, C.unite));
        var sol = ['On calcule le quotient $\\dfrac{y}{x}$ pour chaque colonne : ' + C.xs.map(function (x, i) { return '$\\dfrac{' + n(ys[i]) + '}{' + n(x) + '} = ' + n(quos[i]) + '$'; }).join(' ; ') + '.'];
        if (C.lin) {
          sol.push('Tous les quotients sont égaux à ' + m(C.a) + ' : c\'est un tableau de proportionnalité. $y = ' + n(C.a) + 'x$ : l\'application $x \\mapsto ' + n(C.a) + 'x$ est linéaire, de coefficient ' + m(C.a) + '.');
          sol.push('Pour $x = ' + C.q + '$ : $y = ' + n(C.a) + ' \\times ' + C.q + ' = ' + n(C.a * C.q) + '$.');
        } else {
          sol.push('Les quotients ne sont pas tous égaux : ce n\'est pas un tableau de proportionnalité, donc pas une application linéaire.');
          sol.push('On s\'en doutait : une somme fixe de ' + m(C.b) + ' F' + NB + 'CFA est payée même pour $x$ très petit. Ici $y = ' + n(C.a) + 'x + ' + n(C.b) + '$ (on verra en 3e que c\'est une application affine).');
        }
        return {
          enonce: 'Le tableau donne ' + C.txt + '.' + tableau([[C.x].concat(C.xs.map(m)), [C.y].concat(ys.map(m))]) +
            'a) Ce tableau est-il un tableau de proportionnalité ? Autrement dit, $y$ est-il une fonction linéaire de $x$ ?<br>b) Calculer le quotient $\\dfrac{y}{x}$ pour la première colonne.' + (C.lin ? '<br>c) Calculer $y$ pour $x = ' + C.q + '$.' : ''),
          questions: qs,
          indices: ['Une application est linéaire si $y = ax$ : le quotient $\\dfrac{y}{x}$ est le même pour toutes les colonnes.', 'Calcule le quotient pour chaque colonne et compare.'],
          solution: sol
        };
      }
      // niveau 3 : propriétés de linéarité
      var p = rng.nz(-7, 7), q = rng.pick([1, 2, 3, 4, 5]);
      if (ar.gcd(Math.abs(p), q) !== 1) q = 1;
      if (q === 1 && Math.abs(p) === 1) p = 3 * p;
      var Af = F(p, q), a1 = q * rng.int(1, 6), a2, g3 = 0;
      do { a2 = q * rng.int(1, 6); g3++; } while (a2 === a1 && g3 < 50);
      var b1 = Af.mul(a1).value(), b2 = Af.mul(a2).value(), kk = rng.pick([2, 3, 4, 5, 10]);
      return {
        enonce: '$f$ est une application linéaire telle que $f(' + a1 + ') = ' + n(b1) + '$ et $f(' + a2 + ') = ' + n(b2) + '$.<br>Sans calculer le coefficient de $f$, calculer :<br>a) $f(' + (a1 + a2) + ')$ ;<br>b) $f(' + (kk * a1) + ')$ ;<br>c) $f(' + (a1 - a2) + ')$.',
        questions: [qnum('a) $f(' + (a1 + a2) + ') =$', b1 + b2), qnum('b) $f(' + (kk * a1) + ') =$', kk * b1), qnum('c) $f(' + (a1 - a2) + ') =$', b1 - b2)],
        indices: ['Pour une application linéaire : $f(x + x\') = f(x) + f(x\')$ et $f(kx) = k\\,f(x)$.', 'Écris $' + (a1 + a2) + ' = ' + a1 + ' + ' + a2 + '$, $' + (kk * a1) + ' = ' + kk + ' \\times ' + a1 + '$ et $' + (a1 - a2) + ' = ' + a1 + ' - ' + a2 + '$.'],
        solution: [
          '$f(' + (a1 + a2) + ') = f(' + a1 + ' + ' + a2 + ') = f(' + a1 + ') + f(' + a2 + ') = ' + n(b1) + ' + ' + T.par(b2) + ' = ' + n(b1 + b2) + '$.',
          '$f(' + (kk * a1) + ') = f(' + kk + ' \\times ' + a1 + ') = ' + kk + ' \\times f(' + a1 + ') = ' + kk + ' \\times ' + T.par(b1) + ' = ' + n(kk * b1) + '$.',
          '$f(' + (a1 - a2) + ') = f(' + a1 + ') - f(' + a2 + ') = ' + n(b1) + ' - ' + T.par(b2) + ' = ' + n(b1 - b2) + '$.',
          'Vérification : le coefficient est $a = \\dfrac{' + n(b1) + '}{' + a1 + '} = ' + Af.tex() + '$, et par exemple $' + Af.tex() + ' \\times ' + T.par(a1 - a2) + ' = ' + n(b1 - b2) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 4e — Statistiques : histogramme, regroupement en classes             */
  /* ================================================================== */
  var CTX_HIST = [
    { t: 'la taille (en cm) des élèves de 4e d\'un collège de ' + 'Kaolack', a0: 140, h: 10, k: 5, u: 'cm', nom: 'Taille (cm)', ind: 'élèves' },
    { t: 'la masse (en kg) des sacs de riz livrés à une boutique de Saint-Louis', a0: 20, h: 5, k: 5, u: 'kg', nom: 'Masse (kg)', ind: 'sacs' },
    { t: 'la durée (en min) du trajet domicile-collège des élèves d\'une classe de Thiès', a0: 0, h: 10, k: 5, u: 'min', nom: 'Durée (min)', ind: 'élèves' },
    { t: 'la recette journalière (en milliers de F CFA) des vendeuses de poisson du marché de Mbour', a0: 0, h: 20, k: 5, u: 'milliers de F CFA', nom: 'Recette', ind: 'vendeuses' }
  ];
  function figHisto(C, ef) {
    var k = ef.length, top = 2 * Math.ceil((Math.max.apply(null, ef) + 1) / 2);
    var x0 = C.a0, x1 = C.a0 + k * C.h, sp = x1 - x0;
    var f = EM.fig.create({ w: 320, h: 230, xmin: x0 - sp * 0.16, xmax: x1 + sp * 0.06, ymin: -top * 0.14, ymax: top * 1.08, title: 'Histogramme' });
    for (var y = 0; y <= top; y += 1) {
      ligneGrille(f, [x0, y], [x1, y]);
      if (y % 2 === 0) f.text([x0 - sp * 0.025, y - top * 0.018], String(y), { small: true, anchor: 'end' });
    }
    ef.forEach(function (e, i) { f.rect(x0 + i * C.h, 0, C.h, e); });
    for (var i = 0; i <= k; i++) f.text([x0 + i * C.h, -top * 0.085], String(x0 + i * C.h), { small: true });
    f.seg([x0, 0], [x1 + sp * 0.03, 0]).seg([x0, 0], [x0, top * 1.04]);
    return f.svg();
  }

  EM.gen.register({
    id: '4e-plus-histogramme-classes',
    titre: 'Lire un histogramme, regrouper des données en classes',
    chapitres: ['4e-statistiques'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var C = rng.pick(CTX_HIST), k = C.k, ef = [], i;
      var cls = function (j) { return '$[' + n(C.a0 + j * C.h) + ' \\,;\\, ' + n(C.a0 + (j + 1) * C.h) + '[$'; };
      if (niveau === 1 || niveau === 3) {
        for (i = 0; i < k; i++) ef.push(rng.int(2, 13));
        var N = EM.util.sum(ef);
        if (niveau === 1) {
          var j = rng.int(0, k - 1), mb = rng.int(1, k - 1), sens = rng.bool(), borne = C.a0 + mb * C.h;
          var nb = sens ? EM.util.sum(ef.slice(0, mb)) : EM.util.sum(ef.slice(mb));
          return {
            enonce: 'L\'histogramme représente ' + C.t + '. Les classes ont toutes la même amplitude.<br>a) Quel est l\'effectif de la classe ' + cls(j) + ' ?<br>b) Quel est l\'effectif total ?<br>c) Combien ' + (/^[aeéiou]/.test(C.ind) ? 'd\'' : 'de ') + C.ind + ' ont une valeur ' + (sens ? 'strictement inférieure à ' : 'supérieure ou égale à ') + m(borne) + ' ?',
            figure: figHisto(C, ef),
            questions: [qnum('a) Effectif de ' + cls(j) + ' :', ef[j]), qnum('b) Effectif total :', N), qnum('c) Nombre ' + (/^[aeéiou]/.test(C.ind) ? 'd\'' : 'de ') + C.ind + ' :', nb)],
            indices: ['La hauteur de chaque rectangle donne l\'effectif de la classe : lis-la sur l\'axe vertical.', 'Une classe $[a ; b[$ contient $a$ mais pas $b$. Additionne les effectifs des classes concernées.'],
            solution: [
              'Effectifs lus : ' + ef.map(function (e, jj) { return cls(jj) + ' : ' + e; }).join(' ; ') + '.',
              'Effectif de la classe ' + cls(j) + ' : ' + m(ef[j]) + '. Effectif total : $' + ef.join(' + ') + ' = ' + N + '$.',
              (sens ? 'Valeurs strictement inférieures à ' + m(borne) + ' : classes ' + EM.util.range(0, mb - 1).map(cls).join(', ') : 'Valeurs supérieures ou égales à ' + m(borne) + ' : classes ' + EM.util.range(mb, k - 1).map(cls).join(', ')) + ', soit ' + m(nb) + ' ' + C.ind + '.'
            ]
          };
        }
        var S = 0, cen = [];
        for (i = 0; i < k; i++) { cen.push(C.a0 + (i + 0.5) * C.h); S += cen[i] * ef[i]; }
        var moy = S / N, exact = ar.isInt(moy * 10);
        var mb3 = rng.int(1, k - 1), pc = 100 * EM.util.sum(ef.slice(0, mb3)) / N, exPc = ar.isInt(pc * 10);
        return {
          enonce: 'L\'histogramme représente ' + C.t + '.<br>a) Calculer une valeur approchée de la moyenne à l\'aide des centres des classes' + (exact ? '.' : ', arrondie au dixième.') + '<br>b) Quel pourcentage des ' + C.ind + ' ont une valeur strictement inférieure à ' + m(C.a0 + mb3 * C.h) + (exPc ? ' ?' : ' ? (Arrondir au dixième.)'),
          figure: figHisto(C, ef),
          questions: [qnum('a) Moyenne :', R(moy, 1), null, exact ? null : 0.06), qnum('b) Pourcentage :', R(pc, 1), '%', exPc ? null : 0.06)],
          indices: ['Le centre de la classe $[a ; b[$ est $\\dfrac{a + b}{2}$. Moyenne $= \\dfrac{\\sum \\text{centre} \\times \\text{effectif}}{\\text{effectif total}}$.', 'Pourcentage $= \\dfrac{\\text{effectif concerné}}{\\text{effectif total}} \\times 100$.'],
          solution: [
            'Effectifs lus : ' + ef.join(' ; ') + ' ; effectif total ' + m(N) + '. Centres des classes : ' + cen.map(m).join(' ; ') + '.',
            'Somme des produits : $' + cen.map(function (c, jj) { return n(c) + ' \\times ' + ef[jj]; }).join(' + ') + ' = ' + n(S) + '$.',
            'Moyenne : $\\dfrac{' + n(S) + '}{' + N + '} ' + (exact ? '= ' : '\\approx ') + n(R(moy, 1)) + '$ ' + C.u + '.',
            'Valeurs strictement inférieures à ' + m(C.a0 + mb3 * C.h) + ' : $' + ef.slice(0, mb3).join(' + ') + ' = ' + EM.util.sum(ef.slice(0, mb3)) + '$, soit $\\dfrac{' + EM.util.sum(ef.slice(0, mb3)) + '}{' + N + '} \\times 100 ' + (exPc ? '= ' : '\\approx ') + n(R(pc, 1)) + '$ %.'
          ]
        };
      }
      // niveau 2 : regrouper des données brutes en classes
      var NN = rng.pick([20, 25]), dat = [], lo = 150, h2 = 50, kk = 4;
      for (i = 0; i < NN; i++) dat.push(lo + rng.int(0, kk * h2 - 1));
      for (i = 0; i < 3; i++) dat[rng.int(0, NN - 1)] = lo + h2 * rng.int(1, kk - 1);
      var jc = rng.int(0, kk - 1), bas = lo + jc * h2, haut = bas + h2;
      var dedans = dat.filter(function (v) { return v >= bas && v < haut; });
      var eff = dedans.length, freq = 100 * eff / NN;
      return {
        enonce: 'Au marché de Ziguinchor, on a pesé ' + NN + ' mangues (masses en grammes) :<br>$' + dat.map(n).join(' \\;;\\; ') + '$.<br>On regroupe ces masses en classes d\'amplitude ' + m(h2) + ' g : $[150 \\,;\\, 200[$, $[200 \\,;\\, 250[$, $[250 \\,;\\, 300[$, $[300 \\,;\\, 350[$.<br>a) Quel est l\'effectif de la classe $[' + bas + ' \\,;\\, ' + haut + '[$ ?<br>b) Quelle est sa fréquence, en pourcentage ?',
        questions: [qnum('a) Effectif :', eff), qnum('b) Fréquence :', freq, '%')],
        indices: ['La classe $[' + bas + ' \\,;\\, ' + haut + '[$ contient les masses $m$ telles que $' + bas + ' \\leq m < ' + haut + '$ : ' + m(bas) + ' est dedans, mais pas ' + m(haut) + '.', 'Fréquence $= \\dfrac{\\text{effectif de la classe}}{\\text{effectif total}} \\times 100$.'],
        solution: [
          'Masses de la classe $[' + bas + ' \\,;\\, ' + haut + '[$ : ' + (eff ? '$' + dedans.map(n).join(' \\,;\\, ') + '$' : 'aucune') + ', soit ' + m(eff) + ' mangue' + (eff > 1 ? 's' : '') + '.',
          'Fréquence : $\\dfrac{' + eff + '}{' + NN + '} \\times 100 = ' + n(freq) + '$ %.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 4e — Pythagore : réciproque sur le terrain                           */
  /* ================================================================== */
  var HYPOS = { 10: [[6, 8]], 13: [[5, 12]], 15: [[9, 12]], 17: [[8, 15]], 20: [[12, 16]], 25: [[7, 24], [15, 20]], 26: [[10, 24]], 29: [[20, 21]], 30: [[18, 24]], 50: [[14, 48], [30, 40]] };

  EM.gen.register({
    id: '4e-plus-pythagore-reciproque-terrain',
    titre: 'Réciproque de Pythagore : vérifier un angle droit sur le terrain',
    chapitres: ['4e-pythagore'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var t = rng.pick([[30, 40, 50], [60, 80, 100], [45, 60, 75], [50, 120, 130], [80, 150, 170], [90, 120, 150], [36, 48, 60], [70, 240, 250]]);
        var droit = rng.bool(), bc = droit ? t[2] : t[2] + rng.pick([-3, -2, -1, 1, 2, 3]);
        var ab = t[0], ac = t[1], s = ab * ab + ac * ac, nom = personne(rng, 'm').nom;
        f = EM.fig.fit([[0, 0], [ab, 0], [0, ac]], { w: 220, h: 210, pad: 40 });
        f.seg([0, 0], [ab * 1.3, 0]).seg([0, 0], [0, ac * 1.15]).seg([ab, 0], [0, ac], { dash: true, accent: true });
        f.point([0, 0], 'A', 'so').point([ab, 0], 'B', 's').point([0, ac], 'C', 'o');
        f.segLabel([0, 0], [ab, 0], ab + ' cm', { flip: false, inside: [0, ac] }).segLabel([0, 0], [0, ac], ac + ' cm', { inside: [ab, 0], k: 26 }).segLabel([ab, 0], [0, ac], bc + ' cm', { inside: [0, 0], k: 20 });
        return {
          enonce: nom + ', maçon à ' + rng.pick(VILLES) + ', veut vérifier que le mur qu\'il construit est bien perpendiculaire au sol. Il marque au pied du mur un point $A$, sur le sol un point $B$ tel que $AB = ' + ab + '$ cm, et sur le mur un point $C$ tel que $AC = ' + ac + '$ cm. Il mesure alors $BC = ' + bc + '$ cm.<br>a) Calculer $AB^2 + AC^2$ et $BC^2$.<br>b) Le mur est-il perpendiculaire au sol ?',
          figure: f.svg(),
          questions: [qnum('a) $AB^2 + AC^2 =$', s), qnum('a) $BC^2 =$', bc * bc), qcm(rng, 'b) Le mur est-il perpendiculaire au sol ?', droit ? 'Oui, le triangle $ABC$ est rectangle en $A$' : 'Non, le triangle $ABC$ n\'est pas rectangle', ['Oui, le triangle $ABC$ est rectangle en $A$', 'Non, le triangle $ABC$ n\'est pas rectangle'])],
          indices: ['Dans le triangle $ABC$, le plus grand côté est $[BC]$ : compare $BC^2$ à $AB^2 + AC^2$.', 'Égalité : la réciproque de Pythagore donne un angle droit en $A$. Sinon, le triangle n\'est pas rectangle.'],
          solution: [
            '$AB^2 + AC^2 = ' + ab + '^2 + ' + ac + '^2 = ' + n(ab * ab) + ' + ' + n(ac * ac) + ' = ' + n(s) + '$ et $BC^2 = ' + bc + '^2 = ' + n(bc * bc) + '$.',
            droit ? 'On a $BC^2 = AB^2 + AC^2$ : d\'après la réciproque du théorème de Pythagore, le triangle $ABC$ est rectangle en $A$. Le mur est bien perpendiculaire au sol.'
              : 'On a $BC^2 \\neq AB^2 + AC^2$ : le triangle $ABC$ n\'est pas rectangle (s\'il l\'était, l\'égalité de Pythagore serait vraie). Le mur n\'est pas perpendiculaire au sol : ' + nom + ' doit le corriger.',
            'Remarque : ' + ab + ', ' + ac + ', ' + t[2] + ' sont proportionnels à un triplet de Pythagore ; c\'est la « règle du 3-4-5 » des maçons.'
          ]
        };
      }
      if (niveau === 2) {
        var keys = Object.keys(HYPOS), hyp = Number(rng.pick(keys)), paires = HYPOS[hyp];
        var p1 = rng.pick(paires).slice(), p2 = rng.pick(paires).slice();
        if (rng.bool()) p1.reverse();
        if (rng.bool()) p2.reverse();
        var AB = p1[0], AD = p1[1], BC = p2[0], CD = p2[1];
        var A = [0, 0], B = [AB, 0], D = [0, AD];
        var uu = [(D[0] - B[0]) / hyp, (D[1] - B[1]) / hyp], beta = Math.acos(BC / hyp);
        var rot = function (v, a) { return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };
        var v1 = rot(uu, beta), v2 = rot(uu, -beta);
        var C1 = [B[0] + BC * v1[0], B[1] + BC * v1[1]], C2 = [B[0] + BC * v2[0], B[1] + BC * v2[1]];
        var cote = function (P) { return (D[0] - B[0]) * (P[1] - B[1]) - (D[1] - B[1]) * (P[0] - B[0]); };
        var C = cote(C1) * cote(A) < 0 ? C1 : C2;
        var aire = AB * AD / 2 + BC * CD / 2;
        f = EM.fig.fit([A, B, C, D], { w: 280, h: 230, pad: 34 });
        f.poly([A, B, C, D], { fill: true }).seg(B, D, { dash: true }).rightAngle(B, A, D);
        var ct = centre([A, B, C, D]);
        f.segLabel(A, B, AB + ' m', { inside: ct }).segLabel(A, D, AD + ' m', { inside: ct, k: 22 }).segLabel(B, C, BC + ' m', { inside: ct, k: 22 }).segLabel(C, D, CD + ' m', { inside: ct, k: 22 });
        ['A', 'B', 'C', 'D'].forEach(function (l, j) { var P = [A, B, C, D][j]; f.point(P, l, posLoin(P, ct)); });
        return {
          enonce: 'Un champ de mil a la forme du quadrilatère $ABCD$ ci-contre (dimensions en mètres). L\'angle en $A$ est droit.<br>a) Calculer la longueur de la diagonale $BD$.<br>b) Démontrer que le triangle $BCD$ est rectangle et préciser en quel sommet.<br>c) Calculer l\'aire du champ.',
          figure: f.svg(),
          questions: [qnum('a) $BD =$', hyp, 'm'), qcm(rng, 'b) Le triangle $BCD$ est :', 'rectangle en $C$', ['rectangle en $C$', 'rectangle en $B$', 'rectangle en $D$', 'non rectangle']), qnum('c) Aire du champ :', aire, 'm²')],
          indices: ['Dans le triangle $ABD$ rectangle en $A$, applique le théorème de Pythagore.', 'Dans le triangle $BCD$, compare $BD^2$ à $BC^2 + CD^2$ (réciproque). Puis découpe le champ en deux triangles rectangles.'],
          solution: [
            'Le triangle $ABD$ est rectangle en $A$ : $BD^2 = AB^2 + AD^2 = ' + AB + '^2 + ' + AD + '^2 = ' + (AB * AB) + ' + ' + (AD * AD) + ' = ' + hyp * hyp + '$, donc $BD = \\sqrt{' + hyp * hyp + '} = ' + hyp + '$ m.',
            'Dans le triangle $BCD$, le plus grand côté est $[BD]$ : $BC^2 + CD^2 = ' + BC + '^2 + ' + CD + '^2 = ' + (BC * BC) + ' + ' + (CD * CD) + ' = ' + (BC * BC + CD * CD) + ' = BD^2$. D\'après la réciproque du théorème de Pythagore, $BCD$ est rectangle en $C$.',
            'Aire de $ABD$ : $\\dfrac{' + AB + ' \\times ' + AD + '}{2} = ' + n(AB * AD / 2) + '$ m². Aire de $BCD$ : $\\dfrac{' + BC + ' \\times ' + CD + '}{2} = ' + n(BC * CD / 2) + '$ m².',
            'Aire du champ : $' + n(AB * AD / 2) + ' + ' + n(BC * CD / 2) + ' = ' + n(aire) + '$ m².'
          ]
        };
      }
      // niveau 3 : un terrain est-il rectangulaire ?
      var tr = rng.pick([[12, 16, 20], [15, 20, 25], [18, 24, 30], [21, 28, 35], [24, 32, 40], [20, 48, 52], [24, 45, 51], [9, 40, 41], [16, 30, 34]]);
      var rect = rng.bool(), L = tr[1], l = tr[0], dm = rect ? tr[2] : R(tr[2] + rng.pick([-0.6, -0.4, 0.4, 0.6]), 1);
      var s3 = L * L + l * l, d2 = R(dm * dm, 4);
      var lieu = rng.pick(['une parcelle à bâtir à Diamniadio', 'le terrain de basket d\'un collège de Kolda', 'un terrain de maraîchage à Mboro', 'la cour d\'une maison à Kaolack']);
      var bon = rect ? 'un rectangle' : 'un parallélogramme qui n\'est pas un rectangle';
      return {
        enonce: 'Pour vérifier que ' + lieu + ' est bien rectangulaire, on mesure ses côtés : $AB = CD = ' + L + '$ m et $BC = AD = ' + l + '$ m, puis sa diagonale : $AC = ' + n(dm) + '$ m.<br>a) Calculer $AB^2 + BC^2$ et $AC^2$.<br>b) Quelle est la nature du quadrilatère $ABCD$ ?',
        questions: [qnum('a) $AB^2 + BC^2 =$', s3), qnum('a) $AC^2 =$', d2), qcm(rng, 'b) $ABCD$ est :', bon, ['un rectangle', 'un parallélogramme qui n\'est pas un rectangle', 'un losange', 'un carré'])],
        indices: ['Les côtés opposés ont la même longueur : que peux-tu dire de $ABCD$ ?', 'Dans le triangle $ABC$, compare $AC^2$ et $AB^2 + BC^2$ pour savoir si l\'angle en $B$ est droit.'],
        solution: [
          '$ABCD$ (non croisé) a ses côtés opposés deux à deux de même longueur : c\'est un parallélogramme. Ses côtés consécutifs n\'ont pas la même longueur : ce n\'est ni un losange ni un carré.',
          '$AB^2 + BC^2 = ' + L + '^2 + ' + l + '^2 = ' + (L * L) + ' + ' + (l * l) + ' = ' + s3 + '$ et $AC^2 = ' + n(dm) + '^2 = ' + n(d2) + '$.',
          rect ? 'Égalité : d\'après la réciproque de Pythagore, le triangle $ABC$ est rectangle en $B$. Un parallélogramme qui a un angle droit est un rectangle : le terrain est bien rectangulaire.'
            : '$AC^2 \\neq AB^2 + BC^2$ : l\'angle $' + w('ABC') + '$ n\'est pas droit. $ABCD$ est un parallélogramme qui n\'est pas un rectangle : le terrain n\'est pas rectangulaire.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 4e — Pythagore : diagonale, pignon de toit, cercle circonscrit       */
  /* ================================================================== */
  var PIGNONS = [[2.4, 1.8, 3], [3, 1.6, 3.4], [2.4, 1, 2.6], [3.2, 2.4, 4], [2, 1.5, 2.5], [3, 2.25, 3.75], [1.6, 1.2, 2], [3.6, 1.5, 3.9], [4, 3, 5]];

  EM.gen.register({
    id: '4e-plus-pythagore-situations',
    titre: 'Pythagore en situation : diagonale, pignon de toit, cercle circonscrit',
    chapitres: ['4e-pythagore'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      if (niveau === 1) {
        var L = rng.int(90, 110), l = rng.int(55, 75), d = Math.sqrt(L * L + l * l), dr = R(d, 1), gain = R(L + l - d, 1);
        var nom = personne(rng);
        return {
          enonce: 'Le terrain de football d\'un stade de ' + rng.pick(VILLES) + ' est un rectangle de ' + u(L, 'm') + ' sur ' + u(l, 'm') + '. ' + nom.nom + ' va d\'un coin au coin opposé en traversant le terrain en ligne droite (en diagonale).<br>a) Calculer la longueur de la diagonale, arrondie au dixième de mètre.<br>b) Combien de mètres ' + nom.il + ' économise-t-' + nom.il + ' par rapport au trajet le long des deux côtés ? (Arrondir au dixième.)',
          questions: [qnum('a) Diagonale :', dr, 'm', 0.06), qnum('b) Économie :', gain, 'm', 0.11)],
          indices: ['La diagonale partage le rectangle en deux triangles rectangles dont elle est l\'hypoténuse.', 'Le trajet le long des côtés mesure longueur + largeur.'],
          solution: [
            'La diagonale est l\'hypoténuse d\'un triangle rectangle de côtés ' + u(L, 'm') + ' et ' + u(l, 'm') + ' : $d^2 = ' + L + '^2 + ' + l + '^2 = ' + n(L * L) + ' + ' + n(l * l) + ' = ' + n(L * L + l * l) + '$.',
            '$d = \\sqrt{' + n(L * L + l * l) + '} \\approx ' + n(dr) + '$ m.',
            'Le long des côtés : $' + L + ' + ' + l + ' = ' + (L + l) + '$ m. Économie : $' + (L + l) + ' - ' + n(R(d, 2)) + ' \\approx ' + n(gain) + '$ m.'
          ]
        };
      }
      if (niveau === 2) {
        var P = rng.pick(PIGNONS), hb = P[0], hh = P[1], c = P[2], b = R(2 * hb, 2), aire = R(b * hh / 2, 4);
        var A = [-hb, 0], B = [hb, 0], S = [0, hh], H = [0, 0];
        f = EM.fig.fit([A, B, S], { w: 280, h: 170, pad: 34 });
        f.poly([A, B, S], { fill: true }).seg(S, H, { dash: true, accent: true }).rightAngle(B, H, S).ticks(A, S, 1).ticks(S, B, 1).ticks(A, H, 2).ticks(H, B, 2);
        f.point(A, 'A', 'so').point(B, 'B', 'se').point(S, 'S', 'n').point(H, 'H', 's');
        f.segLabel(S, B, tx(c) + ' m', { inside: A, k: 18 }).segLabel(A, B, tx(b) + ' m', { inside: S, k: 30 });
        return {
          enonce: 'Le pignon (la partie triangulaire de la façade) du toit d\'un magasin est un triangle $ABS$ isocèle en $S$, avec $SA = SB = ' + n(c) + '$ m et $AB = ' + n(b) + '$ m. Le point $H$ est le milieu de $[AB]$.<br>a) Calculer la hauteur $SH$ du pignon.<br>b) Calculer l\'aire du pignon, qu\'on veut peindre.',
          figure: f.svg(),
          questions: [qnum('a) $SH =$', hh, 'm'), qnum('b) Aire :', aire, 'm²')],
          indices: ['Dans un triangle isocèle, la médiane issue du sommet principal est aussi la hauteur : le triangle $SHB$ est rectangle en $H$.', '$HB = \\dfrac{AB}{2}$, puis applique le théorème de Pythagore dans $SHB$.'],
          solution: [
            'Le triangle $ABS$ est isocèle en $S$ et $H$ est le milieu de $[AB]$ : $(SH)$ est la médiane et aussi la hauteur, donc $SHB$ est rectangle en $H$, avec $HB = ' + n(b) + ' \\div 2 = ' + n(hb) + '$ m.',
            'D\'après le théorème de Pythagore : $SH^2 = SB^2 - HB^2 = ' + n(c) + '^2 - ' + n(hb) + '^2 = ' + n(R(c * c, 4)) + ' - ' + n(R(hb * hb, 4)) + ' = ' + n(R(hh * hh, 4)) + '$, donc $SH = ' + n(hh) + '$ m.',
            'Aire : $\\dfrac{AB \\times SH}{2} = \\dfrac{' + n(b) + ' \\times ' + n(hh) + '}{2} = ' + n(aire) + '$ m².'
          ]
        };
      }
      // niveau 3 : cercle circonscrit à un triangle rectangle
      var varA = rng.bool(), t3 = rng.pick([[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [12, 16, 20]]);
      var O = [0, 0];
      if (varA) {
        var ab = rng.int(3, 9), ac = rng.int(3, 9), exact = rng.bool(0.5);
        if (exact) { ab = t3[0]; ac = t3[1]; }
        var bc = Math.sqrt(ab * ab + ac * ac), bcr = exact ? t3[2] : R(bc, 2), ray = exact ? t3[2] / 2 : R(bc / 2, 2);
        var pA = [0, 0], pB = [ab, 0], pC = [0, ac], pO = [ab / 2, ac / 2];
        f = EM.fig.fit([[pO[0] - bc / 2, pO[1] - bc / 2], [pO[0] + bc / 2, pO[1] + bc / 2]], { w: 240, h: 240, pad: 20 });
        f.circle(pO, bc / 2, { light: true }).poly([pA, pB, pC]).rightAngle(pB, pA, pC).seg(pO, pA, { dash: true, accent: true });
        f.point(pA, 'A', 'so').point(pB, 'B', 'se').point(pC, 'C', 'no').point(pO, 'O', 'ne');
        return {
          enonce: 'Le triangle $ABC$ est rectangle en $A$, avec $AB = ' + ab + '$ cm et $AC = ' + ac + '$ cm. On note $O$ le centre de son cercle circonscrit.<br>a) Calculer $BC$' + (exact ? '.' : ', arrondi au centième.') + '<br>b) Où se trouve le point $O$ ? Calculer le rayon du cercle et la longueur $OA$.',
          figure: f.svg(),
          questions: [qnum('a) $BC =$', bcr, 'cm', exact ? null : 0.006), qcm(rng, 'b) Le point $O$ est :', 'le milieu de $[BC]$', ['le milieu de $[BC]$', 'le milieu de $[AB]$', 'le milieu de $[AC]$', 'le point $A$']), qnum('b) Rayon $= OA =$', ray, 'cm', exact ? null : 0.006)],
          indices: ['Applique le théorème de Pythagore dans le triangle rectangle $ABC$.', 'Le centre du cercle circonscrit à un triangle rectangle est le milieu de l\'hypoténuse.'],
          solution: [
            'D\'après le théorème de Pythagore : $BC^2 = AB^2 + AC^2 = ' + ab + '^2 + ' + ac + '^2 = ' + (ab * ab + ac * ac) + '$, donc $BC = \\sqrt{' + (ab * ab + ac * ac) + '}' + (exact ? ' = ' : ' \\approx ') + n(bcr) + '$ cm.',
            'Le triangle étant rectangle en $A$, le centre $O$ de son cercle circonscrit est le milieu de l\'hypoténuse $[BC]$, et le rayon vaut $\\dfrac{BC}{2}' + (exact ? ' = ' : ' \\approx ') + n(ray) + '$ cm.',
            '$A$ est sur le cercle, donc $OA$ est un rayon : $OA = OB = OC ' + (exact ? '= ' : '\\approx ') + n(ray) + '$ cm.'
          ]
        };
      }
      var dd = t3[2], x = t3[0], y = t3[1];
      if (rng.bool()) { x = t3[1]; y = t3[0]; }
      var pB2 = [-dd / 2, 0], pC2 = [dd / 2, 0];
      var pA2 = [-dd / 2 + x * Math.cos(Math.atan2(y, x)), x * Math.sin(Math.atan2(y, x))];
      f = EM.fig.fit([[-dd / 2, -dd / 2], [dd / 2, dd / 2]], { w: 240, h: 240, pad: 20 });
      f.circle(O, dd / 2, { light: true }).poly([pA2, pB2, pC2]).point(O, 'O', 's');
      f.point(pA2, 'A', 'n').point(pB2, 'B', 'o').point(pC2, 'C', 'e');
      return {
        enonce: 'Le segment $[BC]$ est un diamètre d\'un cercle de centre $O$, avec $BC = ' + dd + '$ cm. Le point $A$ est sur ce cercle et $AB = ' + x + '$ cm.<br>a) Quelle est la nature du triangle $ABC$ ?<br>b) Calculer $AC$.',
        figure: f.svg(),
        questions: [qcm(rng, 'a) Le triangle $ABC$ est :', 'rectangle en $A$', ['rectangle en $A$', 'rectangle en $B$', 'isocèle en $A$', 'équilatéral']), qnum('b) $AC =$', y, 'cm')],
        indices: ['Si un triangle est inscrit dans un cercle et qu\'un de ses côtés est un diamètre, alors il est rectangle.', 'L\'hypoténuse est le diamètre $[BC]$ : $AC^2 = BC^2 - AB^2$.'],
        solution: [
          'Le triangle $ABC$ est inscrit dans le cercle et son côté $[BC]$ est un diamètre : il est rectangle en $A$ (le sommet opposé au diamètre).',
          'D\'après le théorème de Pythagore : $AC^2 = BC^2 - AB^2 = ' + dd + '^2 - ' + x + '^2 = ' + (dd * dd) + ' - ' + (x * x) + ' = ' + (y * y) + '$, donc $AC = ' + y + '$ cm.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 4e — Droite des milieux : quadrilatère des milieux, trapèze          */
  /* ================================================================== */
  EM.gen.register({
    id: '4e-plus-milieux-quadrilatere-trapeze',
    titre: 'Droite des milieux : quadrilatère des milieux, segment médian d\'un trapèze',
    chapitres: ['4e-droite-milieux'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var f;
      function quad(theta, s1, s2, t1, t2) {
        var P = [0, 0], uu = [1, 0], vv = [Math.cos(rad(theta)), Math.sin(rad(theta))];
        return [[P[0] + s1 * uu[0], P[1] + s1 * uu[1]], [P[0] + t1 * vv[0], P[1] + t1 * vv[1]], [P[0] - s2 * uu[0], P[1] - s2 * uu[1]], [P[0] - t2 * vv[0], P[1] - t2 * vv[1]]];
      }
      function dessine(Q, codePerp) {
        var M = [milieu(Q[0], Q[1]), milieu(Q[1], Q[2]), milieu(Q[2], Q[3]), milieu(Q[3], Q[0])];
        f = EM.fig.fit(Q, { w: 280, h: 220, pad: 28 });
        f.poly(Q).seg(Q[0], Q[2], { dash: true, light: true }).seg(Q[1], Q[3], { dash: true, light: true }).poly(M, { accent: true });
        if (codePerp) f.rightAngle(Q[0], [0, 0], Q[1], { light: true });
        var ct = centre(Q);
        ['A', 'B', 'C', 'D'].forEach(function (l, j) { f.point(Q[j], l, posLoin(Q[j], ct)); });
        ['I', 'J', 'K', 'L'].forEach(function (l, j) { f.point(M[j], l, posLoin(M[j], ct)); });
        return f.svg();
      }
      var intro = '$ABCD$ est un quadrilatère. Les points $I$, $J$, $K$ et $L$ sont les milieux respectifs de $[AB]$, $[BC]$, $[CD]$ et $[DA]$.';
      if (niveau === 1) {
        var ac = rng.int(40, 140) / 10, bd = rng.int(40, 140) / 10, th = rng.int(50, 130), s1 = ac * rng.dec(0.3, 0.7, 2), t1 = bd * rng.dec(0.3, 0.7, 2);
        var fig = dessine(quad(th, s1, ac - s1, t1, bd - t1));
        return {
          enonce: intro + ' On donne $AC = ' + n(ac) + '$ cm et $BD = ' + n(bd) + '$ cm.<br>a) Calculer $IJ$ et $JK$.<br>b) Calculer le périmètre du quadrilatère $IJKL$.',
          figure: fig,
          questions: [qnum('a) $IJ =$', R(ac / 2), 'cm'), qnum('a) $JK =$', R(bd / 2), 'cm'), qnum('b) Périmètre de $IJKL$ :', R(ac + bd), 'cm')],
          indices: ['Dans le triangle $ABC$, $I$ et $J$ sont les milieux de deux côtés : utilise le théorème de la droite des milieux.', 'De même dans les triangles $BCD$, $CDA$ et $DAB$.'],
          solution: [
            'Dans le triangle $ABC$, $I$ et $J$ sont les milieux de $[AB]$ et $[BC]$ : $IJ = \\dfrac{AC}{2} = ' + n(ac / 2) + '$ cm. De même, dans le triangle $ACD$ : $LK = \\dfrac{AC}{2} = ' + n(ac / 2) + '$ cm.',
            'Dans le triangle $BCD$ : $JK = \\dfrac{BD}{2} = ' + n(bd / 2) + '$ cm, et dans le triangle $ABD$ : $IL = \\dfrac{BD}{2} = ' + n(bd / 2) + '$ cm.',
            'Périmètre de $IJKL$ : $2 \\times ' + n(ac / 2) + ' + 2 \\times ' + n(bd / 2) + ' = AC + BD = ' + n(ac + bd) + '$ cm.'
          ]
        };
      }
      if (niveau === 2) {
        var cas = rng.pick(['aucune', 'perp', 'egales', 'deux']), th2, AC, BD;
        th2 = cas === 'perp' || cas === 'deux' ? 90 : rng.pick([rng.int(50, 72), rng.int(108, 130)]);
        AC = rng.int(6, 10); BD = cas === 'egales' || cas === 'deux' ? AC : AC + rng.pick([-3, -2, 2, 3]);
        var a1 = AC * rng.dec(0.3, 0.7, 2), b1 = BD * rng.dec(0.3, 0.7, 2);
        var fig2 = dessine(quad(th2, a1, AC - a1, b1, BD - b1), th2 === 90);
        var NAT = { aucune: 'un parallélogramme (quelconque)', perp: 'un rectangle', egales: 'un losange', deux: 'un carré' };
        var hyp = { aucune: 'Les diagonales $[AC]$ et $[BD]$ ne sont ni perpendiculaires ni de même longueur ($AC = ' + AC + '$ cm, $BD = ' + BD + '$ cm).', perp: 'Les diagonales $[AC]$ et $[BD]$ sont perpendiculaires, et $AC = ' + AC + '$ cm, $BD = ' + BD + '$ cm.', egales: 'Les diagonales $[AC]$ et $[BD]$ ont la même longueur, ' + u(AC, 'cm') + ', et ne sont pas perpendiculaires.', deux: 'Les diagonales $[AC]$ et $[BD]$ sont perpendiculaires et ont la même longueur, ' + u(AC, 'cm') + '.' }[cas];
        var sol = [
          'Dans le triangle $ABC$ : $(IJ) \\parallel (AC)$ et $IJ = \\dfrac{AC}{2}$. Dans le triangle $ADC$ : $(LK) \\parallel (AC)$ et $LK = \\dfrac{AC}{2}$. Donc $(IJ) \\parallel (LK)$ et $IJ = LK$ : $IJKL$ est un parallélogramme.',
          'De même, $(JK) \\parallel (BD) \\parallel (IL)$ et $JK = IL = \\dfrac{BD}{2}$.'
        ];
        if (cas === 'perp' || cas === 'deux') sol.push('Comme $(AC) \\perp (BD)$, $(IJ)$, parallèle à $(AC)$, est perpendiculaire à $(JK)$, parallèle à $(BD)$ : le parallélogramme $IJKL$ a un angle droit, c\'est un rectangle.');
        if (cas === 'egales' || cas === 'deux') sol.push('Comme $AC = BD$, on a $IJ = JK$ : le parallélogramme $IJKL$ a deux côtés consécutifs égaux, c\'est un losange.');
        sol.push('Conclusion : $IJKL$ est ' + NAT[cas] + '.');
        return {
          enonce: intro + ' ' + hyp + '<br>Quelle est la nature la plus précise du quadrilatère $IJKL$ ?',
          figure: fig2,
          questions: [qcm(rng, '$IJKL$ est :', NAT[cas], ['un parallélogramme (quelconque)', 'un rectangle', 'un losange', 'un carré'])],
          indices: ['Le théorème de la droite des milieux dans les triangles $ABC$ et $ADC$ montre que $(IJ) \\parallel (AC) \\parallel (LK)$.', 'Les côtés de $IJKL$ sont parallèles aux diagonales de $ABCD$ et mesurent leur moitié.'],
          solution: sol
        };
      }
      // niveau 3 : trapèze
      var ab = rng.int(8, 16), cd = rng.int(3, ab - 2), hT = rng.dec(3, 5, 1), dec = rng.dec(-1, 2, 1);
      var A = [0, 0], B = [ab, 0], D = [dec + (ab - cd) / 2 - 1, hT], C = [D[0] + cd, hT];
      var I = milieu(A, D), K = milieu(A, C), J = milieu(B, C);
      f = EM.fig.fit([A, B, C, D], { w: 300, h: 190, pad: 26 });
      f.poly([A, B, C, D]).seg(A, C, { dash: true }).seg(I, J, { accent: true });
      f.ticks(A, I, 1).ticks(I, D, 1);
      f.point(A, 'A', 'so').point(B, 'B', 'se').point(C, 'C', 'ne').point(D, 'D', 'no').point(I, 'I', 'o').point(K, 'K', 'n').point(J, 'J', 'e');
      return {
        enonce: '$ABCD$ est un trapèze de bases $[AB]$ et $[CD]$ : $(AB) \\parallel (CD)$, avec $AB = ' + ab + '$ cm et $CD = ' + cd + '$ cm. Le point $I$ est le milieu de $[AD]$. La parallèle à $(AB)$ passant par $I$ coupe $[AC]$ en $K$ et $[BC]$ en $J$.<br>a) Calculer $IK$.<br>b) Calculer $KJ$.<br>c) En déduire $IJ$.',
        figure: f.svg(),
        questions: [qnum('a) $IK =$', R(cd / 2), 'cm'), qnum('b) $KJ =$', R(ab / 2), 'cm'), qnum('c) $IJ =$', R((ab + cd) / 2), 'cm')],
        indices: ['Dans le triangle $ADC$ : $I$ est le milieu de $[AD]$ et $(IK) \\parallel (DC)$. Utilise la réciproque, puis le théorème de la droite des milieux.', 'Puis dans le triangle $ABC$ : $K$ est le milieu de $[AC]$ et $(KJ) \\parallel (AB)$.'],
        solution: [
          'Dans le triangle $ADC$, la droite $(IK)$ passe par le milieu $I$ de $[AD]$ et est parallèle à $(DC)$ (car parallèle à $(AB)$) : d\'après la réciproque, $K$ est le milieu de $[AC]$. Donc $IK = \\dfrac{DC}{2} = ' + n(cd / 2) + '$ cm.',
          'Dans le triangle $ABC$, la droite $(KJ)$ passe par le milieu $K$ de $[AC]$ et est parallèle à $(AB)$ : $J$ est le milieu de $[BC]$, et $KJ = \\dfrac{AB}{2} = ' + n(ab / 2) + '$ cm.',
          '$I$, $K$, $J$ sont alignés dans cet ordre : $IJ = IK + KJ = ' + n(cd / 2) + ' + ' + n(ab / 2) + ' = ' + n((ab + cd) / 2) + '$ cm. C\'est la moyenne des deux bases : $\\dfrac{AB + CD}{2}$.'
        ]
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
