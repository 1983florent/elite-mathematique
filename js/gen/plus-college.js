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
  /** Repère orthonormé simple [−L ; L]², avec quadrillage. */
  function repere(xmin, xmax, ymin, ymax, w) {
    var f = EM.fig.create({ xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, w: w || 280, title: 'Repère' });
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
      } while (guard < 200 && (compte !== 1 || bas === cible || haut === cible));
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
        var base = [150, 325, 475, 350, 150], gg = 0;
        do { vals = base.map(function (v) { return v + 25 * rng.int(-2, 2); }); gg++; } while (gg < 100 && vals.filter(function (v) { return v === Math.max.apply(null, vals); }).length > 1);
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
        indices: ['Pars du point, suis la ligne horizontale jusqu\'à l\'axe vertical. Certaines valeurs tombent entre deux nombres écrits : compte les lignes.',
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
        var tE = rng.pick([-1, 1.2, 3, 5]), tF;
        do { tF = rng.pick([-1.5, 0.5, 2.2, 4.5, 6]); } while (Math.abs(tF - tE) < 1.4);
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
      var horiz = rng.bool(), c0 = horiz ? rng.int(2, 6) : rng.int(3, 8), k, A, pied, lettres = rng.shuffle(['H', 'K', 'L', 'M']).slice(0, 3);
      var echelle = rng.pick([0.5, 1]);
      var offs = rng.shuffle([[-3, 2], [-2, 3], [-3, 3], [2, -3], [3, -2], [-2, 2]])[0];
      if (horiz) {
        k = rng.int(2, Math.max(2, Math.min(5, rng.bool() ? H - c0 : c0)));
        var sens = (c0 + k <= H) ? 1 : -1;
        if (c0 - k < 0 && sens === -1) k = c0;
        var ax = rng.int(4, W - 4);
        A = [ax, c0 + sens * k]; pied = [ax, c0];
      } else {
        k = rng.int(2, 5);
        var sv = (c0 + k <= W) ? (rng.bool() || c0 - k < 0 ? 1 : -1) : -1;
        var ay = rng.int(3, H - 3);
        A = [c0 + sv * k, ay]; pied = [c0, ay];
      }
      var autresP = offs.map(function (o) { return horiz ? [pied[0] + o, c0] : [c0, pied[1] + o]; });
      var pts3 = [pied, autresP[0], autresP[1]];
      f = quadrillage(W, H);
      if (horiz) f.seg([0, c0], [W, c0], { accent: true }).text([W - 0.5, c0 + 0.3], '(d)', { small: true, accent: true });
      else f.seg([c0, 0], [c0, H], { accent: true }).text([c0 + 0.35, H - 0.6], '(d)', { small: true, accent: true, anchor: 'start' });
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
        var aC = phi + rng.int(55, 80), aD = aC + rng.int(70, 100), aE = 180 + phi + rng.int(55, 75);
        var cC = pt(O, aC, 1), cD = pt(O, aD, 1), cE = pt(O, aE, 1);
        var cible = rng.pick(['AB', 'CD', 'OE', 'OC']);
        var NATS = { AB: 'un diamètre', CD: 'une corde (qui n\'est pas un diamètre)', OE: 'un rayon', OC: 'un rayon' };
        f = EM.fig.fit([[-1.15, -1.15], [1.15, 1.15]], { w: 230, h: 230, pad: 16, title: 'Cercle de centre O' });
        f.circle(O, 1);
        f.seg(cA, cB, { accent: cible === 'AB' }).seg(cC, cD, { accent: cible === 'CD' }).seg(O, cE, { accent: cible === 'OE' }).seg(O, cC, { accent: cible === 'OC' });
        f.point(O, 'O', posAngle(phi + 90 + 180 + 30)).point(cA, 'A', posAngle(180 + phi)).point(cB, 'B', posAngle(phi)).point(cC, 'C', posAngle(aC)).point(cD, 'D', posAngle(aD)).point(cE, 'E', posAngle(aE));
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
      arcCercle(f, [L, 0], r0, -90, 90).add('');
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

})(typeof window !== 'undefined' ? window : globalThis);
