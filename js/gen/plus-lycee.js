/*
 * ELITE MATHÉMATIQUE — compléments pour le lycée.
 *  1) Nouveaux types d'exercices pour les chapitres qui n'avaient qu'un seul générateur
 *     (2nde S, 1ère S, 1ère L, Tle S, Tle S1, Tle L).
 *  2) Problèmes de synthèse type BAC : plusieurs questions enchaînées (ids « ts-pb-… », « tl-pb-… », « 1s-pb-… »).
 *
 * Énoncés à l'infinitif ; indices et corrections tutoient l'élève.
 *
 * Contrôle des développeurs : si le tableau global EM_VERIF_LYCEE existe, chaque générateur y dépose
 * ses paramètres (fonction « trace ») afin qu'un script externe recalcule les réponses de façon
 * indépendante. En usage normal, rien n'est enregistré.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, Frac = EM.Frac, ar = EM.ar;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  var PINF = '$+\\infty$', MINF = '$-\\infty$', ZERO = '$0$';

  function trace(id, data) {
    if (Array.isArray(root.EM_VERIF_LYCEE)) root.EM_VERIF_LYCEE.push({ id: id, data: data });
  }
  function fr(v) { return v instanceof Frac ? v : F(v); }
  function rd(x, d) { return ar.round(x, d == null ? 6 : d); }
  function somme(t) { return t.reduce(function (s, x) { return s + x; }, 0); }
  /** Rationnel écrit pour l'analyseur, entre parenthèses : (3), (-3/4). */
  function S(v) { v = fr(v); return v.d === 1 ? '(' + v.n + ')' : '(' + v.n + '/' + v.d + ')'; }
  /** Polynôme (coefficients décroissants) écrit pour l'analyseur. */
  function polyS(coefs, v) {
    v = v || 'x';
    var deg = coefs.length - 1, out = [];
    coefs.forEach(function (c, i) {
      var p = deg - i;
      if (fr(c).isZero()) return;
      out.push(S(c) + (p === 0 ? '' : p === 1 ? '*' + v : '*' + v + '^' + p));
    });
    return out.length ? '(' + out.join('+') + ')' : '(0)';
  }
  /** Fraction en écriture décimale si elle est finie, sinon \dfrac. */
  function nb(x) {
    x = fr(x);
    var d = x.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1 ? T.num(x.value()) : x.tex();
  }
  /** Valeur arrondie au centième (écriture TeX), exacte si elle tombe juste. */
  function ap(x, d) { var v = typeof x === 'number' ? x : fr(x).value(); return T.num(rd(v, d == null ? 2 : d)); }
  /** « = valeur » si elle a au plus deux décimales, sinon « ≈ arrondi au centième ». */
  function egal2(x) { var v = fr(x).value(); return rd(v, 2) === rd(v, 9) ? '= ' + T.num(rd(v, 2)) : '\\approx ' + ap(v); }
  /** Fraction « num/den » avec le signe devant : « - \dfrac{8}{h} » ou « + \dfrac{8}{h} » */
  function fracSigne(n, den, first) { var t = '\\dfrac{' + Math.abs(n) + '}{' + den + '}'; return first ? (n < 0 ? '-' : '') + t : (n < 0 ? ' - ' : ' + ') + t; }
  /** Question à choix : mélange, sans doublon. */
  function qcm(rng, label, bonne, autres) {
    var all = [bonne];
    autres.forEach(function (a) { if (all.indexOf(a) < 0) all.push(a); });
    var sh = rng.shuffle(all);
    return { label: label, type: 'choice', choix: sh, reponse: sh.indexOf(bonne) };
  }
  /** Coordonnées en TeX */
  function pt() {
    var a = Array.prototype.slice.call(arguments);
    return '\\left(' + a.map(function (x) { return typeof x === 'string' ? x : x instanceof Frac ? nb(x) : T.num(x); }).join(' \\,;\\, ') + '\\right)';
  }
  function lim(b) { return '\\lim\\limits_{x \\to ' + b + '}'; }
  /** Coefficient devant un facteur : '', '-', '3', '\dfrac{1}{2}' */
  function coefTex(c) { c = fr(c); return c.equals(1) ? '' : c.equals(-1) ? '-' : c.tex(); }
  /** e^k (k entier) en TeX */
  function eTex(k) { return k === 0 ? '1' : k === 1 ? 'e' : 'e^{' + k + '}'; }
  /** a·e^k (a rationnel, k entier) : { tex, s } */
  function eVal(a, k) {
    a = fr(a);
    return { tex: k === 0 ? T.num(a) : coefTex(a) + eTex(k), s: k === 0 ? S(a) : S(a) + '*e^(' + k + ')' };
  }
  function sysTex(lines) { return '\\left\\{\\begin{array}{l}' + lines.join(' \\\\ ') + '\\end{array}\\right.'; }
  /** m·√s : TeX et chaîne */
  function radTex(m, s) {
    m = fr(m);
    if (m.isZero()) return '0';
    if (s === 1) return m.tex();
    var sg = m.n < 0 ? '-' : '', n = Math.abs(m.n);
    var top = (n === 1 ? '' : n) + '\\sqrt{' + s + '}';
    return sg + (m.d === 1 ? top : '\\dfrac{' + top + '}{' + m.d + '}');
  }
  function radS(m, s) { m = fr(m); return s === 1 ? S(m) : S(m) + '*sqrt(' + s + ')'; }
  /** √q (q rationnel positif) = m√s */
  function racine(q) { q = fr(q); var r = ar.sqrtSimplify(q.n * q.d); return { m: F(r.a, q.d), s: r.b }; }
  /** t·π (t rationnel) en TeX et pour l'analyseur */
  function angTex(t) {
    t = fr(t);
    if (t.isZero()) return '0';
    var s = t.n < 0 ? '-' : '', n = Math.abs(t.n), top = (n === 1 ? '' : n) + '\\pi';
    return s + (t.d === 1 ? top : '\\dfrac{' + top + '}{' + t.d + '}');
  }
  function angS(t) { t = fr(t); return t.isZero() ? '0' : t.n + '*pi/' + t.d; }
  function cosTrig(t) { var th = angTex(t); return th.charAt(0) === '-' ? '\\left(' + th + '\\right)' : th; }

  /** Tableau de variation : xs (TeX), signes entre deux abscisses, marques sous les abscisses intérieures, valeurs de f. */
  function tabVar(xs, signes, marques, vals, nom) {
    nom = nom || 'f';
    var r1 = ['x'], r2 = [nom + '\'(x)'], r3 = [nom];
    for (var i = 0; i < xs.length; i++) {
      r1.push(xs[i]);
      r2.push(i === 0 || i === xs.length - 1 ? '' : marques[i - 1]);
      r3.push(vals[i]);
      if (i < xs.length - 1) {
        r1.push('');
        r2.push(signes[i]);
        r3.push(signes[i] === '+' ? '\\nearrow' : '\\searrow');
      }
    }
    var cols = 'c|';
    for (var k = 1; k < r1.length; k++) cols += 'c';
    return '$$\\begin{array}{' + cols + '} ' + [r1, r2, r3].map(function (r) { return r.join(' & '); }).join(' \\\\ \\hline ') + ' \\end{array}$$';
  }

  /** Pas de graduation « rond » pour une étendue donnée. */
  function pas(r) {
    var raw = r / 10, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  /** Bornes verticales d'une fenêtre à partir d'un échantillon de la fonction. */
  function fenetreY(fs, x0, x1, bas, haut) {
    var lo = Infinity, hi = -Infinity;
    fs.forEach(function (f) {
      for (var i = 0; i <= 200; i++) {
        var y = f(x0 + (x1 - x0) * i / 200);
        if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
      }
    });
    lo = Math.max(bas, Math.min(lo, 0)); hi = Math.min(haut, Math.max(hi, 0));
    var m = (hi - lo) * 0.12 || 1;
    return [lo - m, hi + m];
  }
  /**
   * Repère + courbe(s). morceaux : [{ f, from, to }] ;
   * opt : { droites: [[A, B]], aire: { f, g, a, b }, points: [[P, nom, pos]] }
   */
  function graphe(xmin, xmax, ymin, ymax, morceaux, opt) {
    opt = opt || {};
    var fig = EM.fig.create({ w: 300, h: 220, xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, title: opt.titre || 'Courbe représentative' });
    if (opt.aire) {
      var A = opt.aire, pts = [], n = 60, i;
      for (i = 0; i <= n; i++) { var x = A.a + (A.b - A.a) * i / n; pts.push([x, A.f(x)]); }
      for (i = n; i >= 0; i--) { var x2 = A.a + (A.b - A.a) * i / n; pts.push([x2, A.g ? A.g(x2) : 0]); }
      fig.poly(pts, { fill: true, light: true });
    }
    fig.axes({ step: pas(Math.max(xmax - xmin, ymax - ymin)) });
    (opt.droites || []).forEach(function (d) { fig.line(d[0], d[1], { dash: true }); });
    morceaux.forEach(function (m) { fig.curve(m.f, { from: m.from, to: m.to, accent: true }); });
    (opt.points || []).forEach(function (p) { fig.point(p[0], p[1], p[2] || 'ne'); });
    return fig.svg();
  }

  /** Position d'étiquette (n, ne, e…) pointant de G vers P : l'étiquette s'écarte de la figure. */
  function posLoin(P, G) {
    var a = Math.atan2(P[1] - G[1], P[0] - G[0]) * 180 / Math.PI, dirs = ['e', 'ne', 'n', 'no', 'o', 'so', 's', 'se'];
    return dirs[((Math.round(a / 45) % 8) + 8) % 8];
  }

  /* ---------- nombres complexes à parties rationnelles ---------- */
  function Cx(x, y) { return { x: fr(x), y: fr(y) }; }
  function cAdd(a, b) { return Cx(a.x.add(b.x), a.y.add(b.y)); }
  function cSub(a, b) { return Cx(a.x.sub(b.x), a.y.sub(b.y)); }
  function cMul(a, b) { return Cx(a.x.mul(b.x).sub(a.y.mul(b.y)), a.x.mul(b.y).add(a.y.mul(b.x))); }
  function cConj(a) { return Cx(a.x, a.y.neg()); }
  function cN2(a) { return a.x.mul(a.x).add(a.y.mul(a.y)); }
  function cDiv(a, b) { var d = cN2(b), n = cMul(a, cConj(b)); return Cx(n.x.div(d), n.y.div(d)); }
  function cEq(a, b) { return a.x.equals(b.x) && a.y.equals(b.y); }
  function cZero(a) { return a.x.isZero() && a.y.isZero(); }
  /** a + bi en TeX */
  function cTex(z) {
    if (z.y.isZero()) return T.num(z.x);
    return (z.x.isZero() ? '' : T.num(z.x)) + T.mono(z.y, 'i', z.x.isZero());
  }
  /** (a + bi) entre parenthèses si c'est une somme ou un nombre négatif */
  function cPar(z) {
    var t = cTex(z);
    return (!z.x.isZero() && !z.y.isZero()) || t.charAt(0) === '-' ? '\\left(' + t + '\\right)' : t;
  }
  /** module (m√s) et argument (fraction de π) d'un complexe « remarquable » */
  function cModArg(z) {
    var r = racine(cN2(z));
    var t = Math.atan2(z.y.value(), z.x.value()) / Math.PI;
    return { m: r.m, s: r.s, t: F(Math.round(t * 12), 12) };
  }
  /** « + 2 - i », « - 3i » ou rien : terme ajouté à la fin d'une écriture */
  function plusC(z) {
    if (cZero(z)) return '';
    var t = cTex(z);
    return t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t;
  }
  /** Coefficient complexe devant z : « 2 », « - », « (1 + i) », « 2i » */
  function coefC(a) { return a.y.isZero() ? coefTex(a.x) : cPar(a); }
  /** Écriture complexe z' = az + b */
  function ecrSim(a, b) { return 'z\' = ' + coefC(a) + 'z' + plusC(b); }
  /** (x - a)^2 sans écrire « - 0 » */
  function carre(v, a) { a = fr(a); return a.isZero() ? v + '^2' : '(' + v + T.signed(a.neg()) + ')^2'; }

  /* ================================================================== */
  /* 2nde S — Transformations : homothétie                              */
  /* ================================================================== */
  EM.gen.register({
    id: '2s-homothetie-images',
    titre: 'Homothétie : rapport, longueurs et aires, image d\'une droite et d\'un cercle',
    chapitres: ['2s-transformations'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var k = rng.pick([F(2), F(3), F(-2), F(-3), F(1, 2), F(-1, 2), F(3, 2), F(5, 2), F(-3, 2)]);
        var d = k.d === 2 ? 2 * rng.int(1, 3) : rng.int(2, 5);
        var dp = k.abs().mul(d), L = rng.int(3, 6), h = rng.pick([2, 3, 4]);
        var aire = F(L * h, 2), Lp = k.abs().mul(L), k2 = k.mul(k), aireP = k2.mul(aire);
        var pos = k.sign() > 0;
        trace('2s-homothetie-images', { niveau: 1, pos: pos, d: d, dp: dp.value(), L: L, aire: aire.value() });
        // figure : Ω à l'origine, A sur l'axe, triangle au-dessus
        var al = rng.pick([20, 30, 40]) * Math.PI / 180, u = [Math.cos(al), Math.sin(al)], nv = [-u[1], u[0]];
        var pA = [d, 0], pB = [d + L * u[0], L * u[1]], pC = [d + 0.6 * L * u[0] + h * nv[0], 0.6 * L * u[1] + h * nv[1]];
        var kv = k.value(), im = function (P) { return [kv * P[0], kv * P[1]]; };
        var pA2 = im(pA), pB2 = im(pB), pC2 = im(pC), O = [0, 0];
        var fg = EM.fig.fit([O, pA, pB, pC, pA2, pB2, pC2], { w: 300, h: 230, title: 'Triangle ABC et son image par l\'homothétie h' });
        [[pA, pA2], [pB, pB2], [pC, pC2]].forEach(function (c) { fg.seg(O, c[0], { dash: true, light: true }).seg(O, c[1], { dash: true, light: true }); });
        fg.poly([pA, pB, pC]).poly([pA2, pB2, pC2], { accent: true });
        fg.point(O, 'Ω', pos ? 'so' : 's').point(pA, 'A', 's').point(pB, 'B', 'e').point(pC, 'C', 'n');
        fg.point(pA2, 'A\'', pos ? 's' : 'n', { accent: true }).point(pB2, 'B\'', pos ? 'e' : 'o', { accent: true }).point(pC2, 'C\'', pos ? 'n' : 's', { accent: true });
        return {
          enonce: 'Une homothétie $h$ de centre $\\Omega$ transforme le triangle $ABC$ en le triangle $A\'B\'C\'$. On sait que $\\Omega A = ' + d + '$ cm, $\\Omega A\' = ' + nb(dp) + '$ cm et ' +
            (pos ? 'que $A\'$ appartient à la demi-droite $[\\Omega A)$' : 'que $\\Omega$ appartient au segment $[AA\']$') +
            '. De plus, $AB = ' + L + '$ cm, l\'aire du triangle $ABC$ est égale à $' + nb(aire) + '$ cm² et $\\Omega$ n\'appartient pas à la droite $(AB)$.<br>' +
            '1) Déterminer le rapport $k$ de l\'homothétie $h$.<br>2) Calculer la longueur $A\'B\'$.<br>3) Calculer l\'aire du triangle $A\'B\'C\'$.<br>4) Préciser la position relative des droites $(AB)$ et $(A\'B\')$.',
          figure: fg.svg(),
          questions: [
            { label: '1) $k =$', type: 'number', reponse: k },
            { label: '2) $A\'B\' =$', type: 'number', reponse: Lp, reponseTex: nb(Lp), unite: 'cm' },
            { label: '3) Aire de $A\'B\'C\'$ :', type: 'number', reponse: aireP, reponseTex: nb(aireP), unite: 'cm²' },
            qcm(rng, '4) Les droites $(AB)$ et $(A\'B\')$ sont :', 'strictement parallèles', ['sécantes', 'confondues', 'perpendiculaires'])
          ],
          indices: [
            '$h(A) = A\'$ signifie $\\vect{\\Omega A\'} = k\\,\\vect{\\Omega A}$ : $|k|$ est le quotient des distances, et le signe de $k$ dépend du sens des deux vecteurs.',
            'Une homothétie de rapport $k$ multiplie les longueurs par $|k|$ et les aires par $k^2$.'
          ],
          solution: [
            '$h(A) = A\'$ signifie $\\vect{\\Omega A\'} = k\\,\\vect{\\Omega A}$, donc $|k| = \\dfrac{\\Omega A\'}{\\Omega A} = \\dfrac{' + nb(dp) + '}{' + d + '} = ' + nb(k.abs()) + '$.',
            pos ? '$A\'$ appartient à la demi-droite $[\\Omega A)$ : les vecteurs $\\vect{\\Omega A}$ et $\\vect{\\Omega A\'}$ ont le même sens, donc $k > 0$ et $k = ' + nb(k) + '$.'
              : '$\\Omega$ est situé entre $A$ et $A\'$ : les vecteurs $\\vect{\\Omega A}$ et $\\vect{\\Omega A\'}$ sont de sens contraires, donc $k < 0$ et $k = ' + nb(k) + '$.',
            'Une homothétie de rapport $k$ multiplie les longueurs par $|k|$ : $A\'B\' = ' + nb(k.abs()) + ' \\times ' + L + ' = ' + nb(Lp) + '$ cm.',
            'Elle multiplie les aires par $k^2 = ' + nb(k2) + '$ : l\'aire de $A\'B\'C\'$ est $' + nb(k2) + ' \\times ' + nb(aire) + ' = ' + nb(aireP) + '$ cm².',
            'On a $\\vect{A\'B\'} = k\\,\\vect{AB}$ : l\'image d\'une droite par une homothétie est une droite parallèle. Comme $\\Omega \\notin (AB)$ et $k \\neq 1$, la droite $(AB)$ n\'est pas invariante : $(AB)$ et $(A\'B\')$ sont strictement parallèles.'
          ]
        };
      }
      // niveau 2 : coordonnées
      var kk = rng.pick([2, 3, -2, -3, -1]);
      var Om = [rng.int(-3, 3), rng.int(-3, 3)], m = rng.nz(-3, 3), p = rng.int(-4, 4);
      var xP = Om[0] * (1 - kk), yP = Om[1] + kk * (p - Om[1]), pp = yP - m * xP;
      var I = [rng.int(-4, 4), rng.int(-4, 4)], r = rng.int(1, 4);
      var Ip = [Om[0] + kk * (I[0] - Om[0]), Om[1] + kk * (I[1] - Om[1])], rp = Math.abs(kk) * r;
      trace('2s-homothetie-images', { niveau: 2, k: kk, O: Om, m: m, p: p, I: I, r: r });
      return {
        enonce: 'Le plan est muni d\'un repère orthonormé. Soit $h$ l\'homothétie de centre $\\Omega' + pt(Om[0], Om[1]) + '$ et de rapport $' + kk + '$.<br>' +
          '1) Déterminer une équation de la droite $(d\')$, image par $h$ de la droite $(d) : y = ' + T.poly([m, p]) + '$.<br>' +
          '2) Déterminer le centre $I\'$ et le rayon $r\'$ du cercle $(\\mathcal{C}\')$, image par $h$ du cercle $(\\mathcal{C})$ de centre $I' + pt(I[0], I[1]) + '$ et de rayon $' + r + '$.<br>' +
          '3) Par quel nombre l\'aire du disque de bord $(\\mathcal{C})$ est-elle multipliée ?',
        questions: [
          { label: '1) $(d\') : y =$', type: 'expr', reponse: polyS([m, pp]), reponseTex: T.poly([m, pp]) },
          { label: '2) $I\' =$', type: 'tuple', reponse: Ip },
          { label: '2) $r\' =$', type: 'number', reponse: rp },
          { label: '3) Coefficient multiplicateur des aires :', type: 'number', reponse: kk * kk }
        ],
        indices: [
          'Prends un point $P$ de $(d)$, par exemple $P(0 \\,;\\, ' + p + ')$, et calcule son image $P\'$ grâce à $\\vect{\\Omega P\'} = ' + kk + '\\,\\vect{\\Omega P}$. L\'image de $(d)$ est la parallèle à $(d)$ passant par $P\'$.',
          'L\'image d\'un cercle de centre $I$ et de rayon $r$ est le cercle de centre $h(I)$ et de rayon $|k| \\times r$ ; les aires sont multipliées par $k^2$.'
        ],
        solution: [
          'Le point $P(0 \\,;\\, ' + p + ')$ appartient à $(d)$. Son image $P\'$ vérifie $\\vect{\\Omega P\'} = ' + kk + '\\,\\vect{\\Omega P}$ avec $\\vect{\\Omega P}' + pt(-Om[0], p - Om[1]) + '$, donc $\\vect{\\Omega P\'}' + pt(-kk * Om[0], kk * (p - Om[1])) + '$ et $P\'' + pt(xP, yP) + '$.',
          'L\'image d\'une droite par une homothétie est une droite parallèle : $(d\')$ a le même coefficient directeur $' + m + '$ que $(d)$. Elle passe par $P\'$ : $' + yP + ' = ' + T.par(m) + ' \\times ' + T.par(xP) + ' + p\'$, d\'où $p\' = ' + pp + '$.',
          'Donc $(d\') : y = ' + T.poly([m, pp]) + '$.',
          '$\\vect{\\Omega I}' + pt(I[0] - Om[0], I[1] - Om[1]) + '$ donc $\\vect{\\Omega I\'} = ' + kk + '\\,\\vect{\\Omega I}' + pt(kk * (I[0] - Om[0]), kk * (I[1] - Om[1])) + '$ et $I\'' + pt(Ip[0], Ip[1]) + '$.',
          'Les distances sont multipliées par $|k| = ' + Math.abs(kk) + '$ : $r\' = ' + Math.abs(kk) + ' \\times ' + r + ' = ' + rp + '$.',
          'Les aires sont multipliées par $k^2 = ' + (kk * kk) + '$ : l\'aire du disque passe de $' + (r * r === 1 ? '' : r * r) + '\\pi$ à $' + (rp * rp) + '\\pi$.'
        ],
        aide: 'Droite : écris par exemple -2x + 5 ; centre : (3 ; -1).'
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Espace : tétraèdre, Thalès et théorème du toit             */
  /* ================================================================== */
  function tetraFig(k, mode) {
    var A = [0, 0], B = [3.4, -1.1], C = [5.2, 0.9], Sm = [2.3, 4.4];
    var bar = function (P) { return [Sm[0] + k * (P[0] - Sm[0]), Sm[1] + k * (P[1] - Sm[1])]; };
    var I = bar(A), J = bar(B), K = bar(C);
    var f = EM.fig.fit([A, B, C, Sm], { w: 260, h: 230, pad: 26, title: 'Tétraèdre SABC' });
    if (mode === 2) f.poly([I, J, K], { fill: true, light: true });
    f.seg(Sm, A).seg(Sm, B).seg(Sm, C).seg(A, B).seg(B, C).seg(A, C, { dash: true });
    f.seg(I, J, { accent: true });
    if (mode === 2) f.seg(J, K, { accent: true }).seg(I, K, { accent: true, dash: true });
    f.point(Sm, 'S', 'n').point(A, 'A', 'so').point(B, 'B', 's').point(C, 'C', 'e').point(I, 'I', 'o').point(J, 'J', 'e');
    if (mode === 2) f.point(K, 'K', 'e');
    return f.svg();
  }
  var RAPPORTS = [F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(2, 5), F(3, 5)];

  EM.gen.register({
    id: '2s-espace-tetraedre',
    titre: 'Tétraèdre : parallélisme, théorème du toit et section par un plan parallèle à la base',
    chapitres: ['2s-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var k = rng.pick(RAPPORTS);
      if (niveau === 1) {
        var SA = k.d * rng.int(2, 4), SB = k.d * rng.int(2, 4), L = k.d * rng.int(2, 4);
        var SI = k.mul(SA), SJ = k.mul(SB), IJ = k.mul(L);
        trace('2s-espace-tetraedre', { niveau: 1, SA: SA, SB: SB, SI: SI.value(), SJ: SJ.value(), L: L });
        return {
          enonce: 'On considère un tétraèdre $SABC$. Le point $I$ appartient à l\'arête $[SA]$ et le point $J$ à l\'arête $[SB]$, avec $SA = ' + SA + '$ cm, $SI = ' + nb(SI) + '$ cm, $SB = ' + SB + '$ cm, $SJ = ' + nb(SJ) + '$ cm et $AB = ' + L + '$ cm.<br>' +
            '1) Montrer que les droites $(IJ)$ et $(AB)$ sont parallèles, puis calculer $IJ$.<br>2) En déduire la position relative de la droite $(IJ)$ et du plan $(ABC)$.<br>' +
            '3) Déterminer l\'intersection des plans $(CIJ)$ et $(ABC)$.<br>4) Les droites $(IJ)$ et $(BC)$ sont-elles coplanaires ?',
          figure: tetraFig(k.value(), 1),
          questions: [
            { label: '1) $IJ =$', type: 'number', reponse: IJ, reponseTex: nb(IJ), unite: 'cm' },
            qcm(rng, '2) La droite $(IJ)$ est :', 'strictement parallèle au plan $(ABC)$', ['sécante au plan $(ABC)$', 'contenue dans le plan $(ABC)$']),
            qcm(rng, '3) Les plans $(CIJ)$ et $(ABC)$ se coupent suivant :', 'la droite passant par $C$ et parallèle à $(AB)$', ['la droite $(AB)$', 'la droite $(AC)$', 'la droite $(BC)$']),
            qcm(rng, '4) Les droites $(IJ)$ et $(BC)$ sont :', 'non coplanaires', ['sécantes', 'strictement parallèles'])
          ],
          indices: [
            'Travaille dans le plan $(SAB)$ : compare $\\dfrac{SI}{SA}$ et $\\dfrac{SJ}{SB}$, puis utilise la réciproque du théorème de Thalès.',
            'Une droite parallèle à une droite d\'un plan est parallèle à ce plan. Théorème du toit : si deux plans sécants contiennent deux droites parallèles, leur intersection est parallèle à ces droites.'
          ],
          solution: [
            'Dans le plan $(SAB)$ : $\\dfrac{SI}{SA} = \\dfrac{' + nb(SI) + '}{' + SA + '} = ' + k.tex() + '$ et $\\dfrac{SJ}{SB} = \\dfrac{' + nb(SJ) + '}{' + SB + '} = ' + k.tex() + '$. Les points $S, I, A$ et $S, J, B$ sont alignés dans le même ordre : d\'après la réciproque du théorème de Thalès, $(IJ) \\parallel (AB)$.',
            'D\'après le théorème de Thalès, $\\dfrac{IJ}{AB} = \\dfrac{SI}{SA} = ' + k.tex() + '$, donc $IJ = ' + k.tex() + ' \\times ' + L + ' = ' + nb(IJ) + '$ cm.',
            'La droite $(IJ)$ est parallèle à la droite $(AB)$, qui est contenue dans le plan $(ABC)$ : $(IJ)$ est donc parallèle au plan $(ABC)$. Comme $I \\notin (ABC)$ ($I$ est un point de $[SA]$ distinct de $A$), elle est strictement parallèle à ce plan.',
            'Les plans $(CIJ)$ et $(ABC)$ ont le point $C$ en commun et sont distincts ($I \\notin (ABC)$) : ils se coupent suivant une droite $\\Delta$ passant par $C$. Le plan $(CIJ)$ contient $(IJ)$, le plan $(ABC)$ contient $(AB)$ et $(IJ) \\parallel (AB)$ : d\'après le théorème du toit, $\\Delta$ est la droite passant par $C$ et parallèle à $(AB)$.',
            'Si $(IJ)$ et $(BC)$ étaient contenues dans un même plan, celui-ci contiendrait $I$, $J$ et $B$, qui ne sont pas alignés ($B \\notin (IJ)$ car $(IJ)$ est strictement parallèle à $(AB)$) : ce serait le plan $(IJB)$, c\'est-à-dire le plan $(SAB)$. Il contiendrait alors $C$, ce qui est impossible dans un tétraèdre. Les droites $(IJ)$ et $(BC)$ sont donc non coplanaires.'
          ]
        };
      }
      var SA2 = k.d * rng.int(2, 4), SI2 = k.mul(SA2);
      var tri = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 6, 10], [12, 5, 13], [4, 3, 5]]);
      var AB = tri[0], BC = tri[1], AC = tri[2], per = AB + BC + AC, aire = F(AB * BC, 2);
      var IJ2 = k.mul(AB), JK = k.mul(BC), IK = k.mul(AC), perP = k.mul(per), aireP = k.mul(k).mul(aire);
      trace('2s-espace-tetraedre', { niveau: 2, SA: SA2, SI: SI2.value(), AB: AB, BC: BC, AC: AC });
      return {
        enonce: '$SABC$ est un tétraèdre dont la base $ABC$ est un triangle rectangle en $B$, avec $AB = ' + AB + '$ cm, $BC = ' + BC + '$ cm et $AC = ' + AC + '$ cm. Le point $I$ appartient à l\'arête $[SA]$, avec $SA = ' + SA2 + '$ cm et $SI = ' + nb(SI2) + '$ cm. ' +
          'Le plan $(P)$ passant par $I$ et parallèle au plan $(ABC)$ coupe l\'arête $[SB]$ en $J$ et l\'arête $[SC]$ en $K$.<br>' +
          '1) Préciser la position relative des droites $(JK)$ et $(BC)$.<br>2) Calculer le rapport $k = \\dfrac{SI}{SA}$, puis la longueur $IJ$.<br>3) Calculer le périmètre, puis l\'aire du triangle $IJK$.',
        figure: tetraFig(k.value(), 2),
        questions: [
          qcm(rng, '1) Les droites $(JK)$ et $(BC)$ sont :', 'strictement parallèles', ['sécantes', 'non coplanaires']),
          { label: '2) $k =$', type: 'number', reponse: k },
          { label: '2) $IJ =$', type: 'number', reponse: IJ2, reponseTex: nb(IJ2), unite: 'cm' },
          { label: '3) Périmètre de $IJK$ :', type: 'number', reponse: perP, reponseTex: nb(perP), unite: 'cm' },
          { label: '3) Aire de $IJK$ :', type: 'number', reponse: aireP, reponseTex: nb(aireP), unite: 'cm²' }
        ],
        indices: [
          'Si deux plans sont parallèles, tout plan qui coupe l\'un coupe l\'autre, et les deux droites d\'intersection sont parallèles.',
          'Le triangle $IJK$ est une réduction de rapport $k$ du triangle $ABC$ : les longueurs sont multipliées par $k$, les aires par $k^2$.'
        ],
        solution: [
          'Le plan $(SBC)$ coupe les plans parallèles $(P)$ et $(ABC)$ suivant les droites $(JK)$ et $(BC)$, qui sont donc parallèles ; elles sont distinctes car $J \\neq B$ : $(JK)$ et $(BC)$ sont strictement parallèles. De même $(IJ) \\parallel (AB)$ (plan $(SAB)$) et $(IK) \\parallel (AC)$ (plan $(SAC)$).',
          '$k = \\dfrac{SI}{SA} = \\dfrac{' + nb(SI2) + '}{' + SA2 + '} = ' + k.tex() + '$. Dans le triangle $SAB$, $(IJ) \\parallel (AB)$ : d\'après le théorème de Thalès, $\\dfrac{IJ}{AB} = \\dfrac{SI}{SA} = k$, d\'où $IJ = ' + k.tex() + ' \\times ' + AB + ' = ' + nb(IJ2) + '$ cm.',
          'De même, $JK = k \\times BC = ' + nb(JK) + '$ cm et $IK = k \\times AC = ' + nb(IK) + '$ cm : le triangle $IJK$ est une réduction de rapport $k$ du triangle $ABC$.',
          'Périmètre de $IJK$ : $k \\times (AB + BC + AC) = ' + k.tex() + ' \\times ' + per + ' = ' + nb(perP) + '$ cm.',
          'L\'aire de $ABC$ (rectangle en $B$) est $\\dfrac{AB \\times BC}{2} = ' + nb(aire) + '$ cm² ; une réduction de rapport $k$ multiplie les aires par $k^2 = ' + k.mul(k).tex() + '$ : l\'aire de $IJK$ est $' + k.mul(k).tex() + ' \\times ' + nb(aire) + ' = ' + nb(aireP) + '$ cm².'
        ],
        aide: 'Tu peux écrire une fraction, par exemple 10/3.'
      };
    }
  });

  /* ================================================================== */
  /* 1ère S — Statistiques : médiane et quartiles d'une série en classes */
  /* ================================================================== */
  var CTX_CLASSES = [
    { t: 'Durée (en minutes) des appels passés en une journée depuis un télécentre de Thiès', a0: 0, w: 2, u: 'min', ind: 'appels', de: 'd\'appels', g: 'la durée', un: 'une durée', fem: true },
    { t: 'Recette journalière (en milliers de F CFA) des boutiques d\'un marché de Kaolack', a0: 10, w: 10, u: 'milliers de F CFA', ind: 'boutiques', de: 'de boutiques', g: 'la recette', un: 'une recette', fem: true },
    { t: 'Âge (en années) des joueurs inscrits à un tournoi de navétanes à Rufisque', a0: 15, w: 3, u: 'ans', ind: 'joueurs', de: 'de joueurs', g: 'l\'âge', un: 'un âge', fem: false },
    { t: 'Masse (en kg) des sacs de mil pesés au marché hebdomadaire de Diaobé', a0: 40, w: 5, u: 'kg', ind: 'sacs', de: 'de sacs', g: 'la masse', un: 'une masse', fem: true }
  ];
  function figECC(bornes, E, N) {
    var x0 = bornes[0], x1 = bornes[bornes.length - 1], w = bornes[1] - bornes[0];
    var f = EM.fig.create({ w: 300, h: 210, xmin: x0 - 0.9 * w, xmax: x1 + 0.7 * w, ymin: -0.16 * N, ymax: 1.12 * N, title: 'Polygone des effectifs cumulés croissants' });
    for (var j = 1; j <= 4; j++) {
      var y = N * j / 4;
      f.seg([x0, y], [x1, y], { light: true, dash: true });
      f.text([x0 - 0.12 * w, y - 0.025 * N], String(y), { small: true, anchor: 'end' });
    }
    f.vector([x0, 0], [x1 + 0.6 * w, 0], { light: true });
    f.vector([x0, 0], [x0, 1.1 * N], { light: true });
    bornes.forEach(function (b) { f.seg([b, 0], [b, -0.03 * N]); f.text([b, -0.11 * N], T.txt(b), { small: true }); });
    f.polyline(bornes.map(function (b, i) { return [b, E[i]]; }), { accent: true });
    bornes.forEach(function (b, i) { f.dot([b, E[i]], { accent: true }); });
    return f.svg();
  }

  EM.gen.register({
    id: '1s-stat-mediane-classes',
    titre: 'Série en classes : classe modale, effectifs cumulés, médiane et quartiles',
    chapitres: ['1s-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_CLASSES), ns, N, g = 0, mx;
      do {
        ns = [0, 1, 2, 3, 4].map(function () { return rng.int(2, 16); });
        N = somme(ns); mx = Math.max.apply(null, ns); g++;
      } while ((ns.filter(function (n) { return n === mx; }).length > 1 || N % 4 !== 0) && g < 300);
      if (N % 4 !== 0 || ns.filter(function (n) { return n === mx; }).length > 1) { ns = [4, 9, 14, 8, 5]; N = 40; mx = 14; }
      var w = ctx.w, bornes = [0, 1, 2, 3, 4, 5].map(function (i) { return ctx.a0 + i * w; });
      var E = [0];
      ns.forEach(function (n, i) { E.push(E[i] + n); });
      var classe = function (i) { return '$[' + T.num(bornes[i]) + ' \\,;\\, ' + T.num(bornes[i + 1]) + '[$'; };
      var interp = function (cible) { // cible : effectif cumulé (Frac)
        var i = 0;
        while (i < 4 && !(fr(E[i + 1]).cmp(cible) >= 0)) i++;
        var v = F(bornes[i]).add(F(w).mul(cible.sub(E[i])).div(ns[i]));
        return { i: i, v: v, tex: 'x = ' + T.num(bornes[i]) + ' + ' + w + ' \\times \\dfrac{' + nb(cible) + ' - ' + E[i] + '}{' + E[i + 1] + ' - ' + E[i] + '} ' + (v.isInt() || nb(v).indexOf('dfrac') < 0 && String(v.value()).length < 7 ? '= ' + nb(v) : '\\approx ' + ap(v)) };
      };
      var tab = '<div class="table-wrap"><table class="t"><tr><th>Classe</th>' + ns.map(function (n, i) { return '<td>' + classe(i) + '</td>'; }).join('') +
        '</tr><tr><th>Effectif</th>' + ns.map(function (n) { return '<td>' + n + '</td>'; }).join('') + '</tr></table></div>';
      var ecc = '$$\\begin{array}{|c|c|c|c|c|c|c|}\\hline \\text{Borne} & ' + bornes.map(function (b) { return T.num(b); }).join(' & ') +
        ' \\\\ \\hline \\text{Effectif cumulé} & ' + E.join(' & ') + ' \\\\ \\hline\\end{array}$$';
      var sol = ['L\'effectif total est $N = ' + ns.join(' + ') + ' = ' + N + '$. Effectifs cumulés croissants (nombre de valeurs strictement inférieures à chaque borne) :' + ecc];
      var Me = interp(F(N, 2)), qs, enonce;
      var phrMe = 'La médiane correspond à l\'effectif cumulé $\\dfrac{N}{2} = ' + nb(F(N, 2)) + '$, atteint dans la classe ' + classe(Me.i) + ' (entre $' + E[Me.i] + '$ et $' + E[Me.i + 1] + '$). Par interpolation linéaire : $' + Me.tex.replace('x =', 'Me =') + '$ ' + ctx.u + '.';
      if (niveau === 1) {
        var imode = ns.indexOf(mx), j = rng.int(2, 4), mIdx;
        do { mIdx = rng.int(1, 4); } while (mIdx === j);
        var pct = F((N - E[mIdx]) * 100, N);
        trace('1s-stat-mediane-classes', { niveau: 1, bornes: bornes, ns: ns, j: j, m: mIdx });
        enonce = ctx.t + ' :<br>' + tab + '1) Déterminer la classe modale de cette série.<br>2) Calculer les effectifs cumulés croissants et donner le nombre ' + ctx.de + ' dont ' + ctx.g + ' est strictement inférieur' + (ctx.fem ? 'e' : '') + ' à $' + T.num(bornes[j]) + '$ ' + ctx.u + '.<br>' +
          '3) Déterminer la médiane $Me$ de la série par interpolation linéaire (arrondie au centième).<br>4) Calculer le pourcentage ' + ctx.de + ' dont ' + ctx.g + ' est supérieur' + (ctx.fem ? 'e' : '') + ' ou égal' + (ctx.fem ? 'e' : '') + ' à $' + T.num(bornes[mIdx]) + '$ ' + ctx.u + ' (arrondi au dixième).';
        qs = [
          qcm(rng, '1) Classe modale :', classe(imode), [0, 1, 2, 3, 4].map(classe)),
          { label: '2) Nombre ' + ctx.de + ' concernés :', type: 'number', reponse: E[j] },
          { label: '3) $Me \\approx$', type: 'number', reponse: Me.v, tol: 0.01, reponseTex: ap(Me.v), unite: ctx.u },
          { label: '4) Pourcentage :', type: 'number', reponse: pct, tol: 0.1, reponseTex: ap(pct, 1), unite: '%' }
        ];
        sol.unshift('La classe modale est la classe de plus grand effectif : ' + classe(imode) + ' (effectif $' + mx + '$).');
        sol.push('Il y a $' + E[j] + '$ ' + ctx.ind + ' dont ' + ctx.g + ' est strictement inférieur' + (ctx.fem ? 'e' : '') + ' à $' + T.num(bornes[j]) + '$ ' + ctx.u + ' : c\'est l\'effectif cumulé croissant à cette borne.');
        sol.push(phrMe);
        sol.push('$' + E[mIdx] + '$ ' + ctx.ind + ' ont ' + ctx.un + ' strictement inférieur' + (ctx.fem ? 'e' : '') + ' à $' + T.num(bornes[mIdx]) + '$ ' + ctx.u + ', donc $' + N + ' - ' + E[mIdx] + ' = ' + (N - E[mIdx]) + '$ ont ' + ctx.un + ' supérieur' + (ctx.fem ? 'e' : '') + ' ou égal' + (ctx.fem ? 'e' : '') + ' : $\\dfrac{' + (N - E[mIdx]) + '}{' + N + '} \\times 100 ' + (pct.isInt() || nb(pct).indexOf('dfrac') < 0 ? '= ' + nb(pct) : '\\approx ' + ap(pct, 1)) + '$ %.');
      } else {
        var Q1 = interp(F(N, 4)), Q3 = interp(F(3 * N, 4)), EI = Q3.v.sub(Q1.v);
        var moy = F(0);
        ns.forEach(function (n, i) { moy = moy.add(F(n).mul(F(bornes[i] + bornes[i + 1], 2))); });
        moy = moy.div(N);
        trace('1s-stat-mediane-classes', { niveau: 2, bornes: bornes, ns: ns });
        enonce = ctx.t + ' :<br>' + tab + 'Calculer les effectifs cumulés croissants, puis déterminer par interpolation linéaire le premier quartile $Q_1$, la médiane $Me$ et le troisième quartile $Q_3$ (arrondis au centième). ' +
          'En déduire l\'écart interquartile, puis calculer la moyenne $\\overline{x}$ de la série (on utilisera les centres des classes).';
        qs = [
          { label: '$Q_1 \\approx$', type: 'number', reponse: Q1.v, tol: 0.01, reponseTex: ap(Q1.v), unite: ctx.u },
          { label: '$Me \\approx$', type: 'number', reponse: Me.v, tol: 0.01, reponseTex: ap(Me.v), unite: ctx.u },
          { label: '$Q_3 \\approx$', type: 'number', reponse: Q3.v, tol: 0.01, reponseTex: ap(Q3.v), unite: ctx.u },
          { label: 'Écart interquartile $Q_3 - Q_1 \\approx$', type: 'number', reponse: EI, tol: 0.02, reponseTex: ap(EI), unite: ctx.u },
          { label: '$\\overline{x} \\approx$', type: 'number', reponse: moy, tol: 0.01, reponseTex: ap(moy), unite: ctx.u }
        ];
        sol.push('$Q_1$ correspond à l\'effectif cumulé $\\dfrac{N}{4} = ' + nb(F(N, 4)) + '$, atteint dans la classe ' + classe(Q1.i) + ' : $' + Q1.tex.replace('x =', 'Q_1 =') + '$.');
        sol.push(phrMe);
        sol.push('$Q_3$ correspond à l\'effectif cumulé $\\dfrac{3N}{4} = ' + nb(F(3 * N, 4)) + '$, atteint dans la classe ' + classe(Q3.i) + ' : $' + Q3.tex.replace('x =', 'Q_3 =') + '$.');
        sol.push('Écart interquartile : $Q_3 - Q_1 \\approx ' + ap(EI) + '$ ' + ctx.u + ' : la moitié centrale des ' + ctx.ind + ' se situe dans un intervalle de cette amplitude.');
        sol.push('Centres des classes : $' + ns.map(function (n, i) { return T.num((bornes[i] + bornes[i + 1]) / 2); }).join(' \\,;\\, ') + '$. $\\overline{x} = \\dfrac{' + ns.map(function (n, i) { return n + ' \\times ' + T.num((bornes[i] + bornes[i + 1]) / 2); }).join(' + ') + '}{' + N + '} ' + egal2(moy) + '$ ' + ctx.u + '.');
      }
      return {
        enonce: enonce,
        figure: figECC(bornes, E, N),
        questions: qs,
        indices: [
          'Calcule les effectifs cumulés croissants aux bornes des classes ; la figure représente leur polygone.',
          'Interpolation linéaire dans la classe $[a \\,;\\, b[$ : $x = a + (b - a) \\times \\dfrac{\\text{effectif visé} - E(a)}{E(b) - E(a)}$, avec $\\dfrac{N}{4}$, $\\dfrac{N}{2}$ ou $\\dfrac{3N}{4}$ comme effectif visé.'
        ],
        solution: sol,
        aide: 'Valeurs décimales arrondies (la virgule est acceptée) ; tu peux aussi écrire une fraction.'
      };
    }
  });

  /* ================================================================== */
  /* 1ère S — Espace : représentation paramétrique, coplanarité          */
  /* ================================================================== */
  function t3(p) { return pt.apply(null, p); }
  function paramTex(A, u) {
    return sysTex(['x', 'y', 'z'].map(function (c, i) { return c + ' = ' + T.sum([{ c: A[i] }, { c: u[i], v: 't' }]); }));
  }

  EM.gen.register({
    id: '1s-espace-droite-plan',
    titre: 'Représentation paramétrique d\'une droite et coplanarité dans l\'espace',
    chapitres: ['1s-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var rep = 'L\'espace est muni d\'un repère $(O, \\vec{i}, \\vec{j}, \\vec{k})$. ';
      if (niveau === 1) {
        var u = [rng.nz(-3, 3), rng.int(-3, 3), rng.nz(-2, 2)], t1 = rng.nz(-2, 2);
        var A = [rng.int(-3, 3), rng.int(-3, 3), -t1 * u[2]];
        var t0 = rng.pick([2, -1, 3, -2].filter(function (t) { return t !== t1; }));
        var M = [0, 1, 2].map(function (i) { return A[i] + t0 * u[i]; });
        var P = [0, 1, 2].map(function (i) { return A[i] + t1 * u[i]; });
        var surD = rng.bool(), tc = rng.pick([-3, -2, 2, 3, 4].filter(function (t) { return t !== t0; }));
        var C = [0, 1, 2].map(function (i) { return A[i] + tc * u[i]; });
        if (!surD) C[rng.int(1, 2)] += rng.pick([-1, 1]);
        var tC = F(C[0] - A[0], u[0]);
        var yC = F(A[1]).add(tC.mul(u[1])), zC = F(A[2]).add(tC.mul(u[2]));
        trace('1s-espace-droite-plan', { niveau: 1, A: A, u: u, t0: t0, C: C });
        return {
          enonce: rep + 'On considère la droite $(D)$ passant par $A' + t3(A) + '$ et de vecteur directeur $\\vec{u}' + t3(u) + '$.<br>' +
            '1) Écrire une représentation paramétrique de $(D)$, puis donner les coordonnées du point $M$ de $(D)$ de paramètre $t = ' + t0 + '$.<br>' +
            '2) Le point $C' + t3(C) + '$ appartient-il à la droite $(D)$ ?<br>3) Déterminer les coordonnées du point d\'intersection $P$ de $(D)$ avec le plan $(xOy)$, d\'équation $z = 0$.',
          questions: [
            { label: '1) $M =$', type: 'tuple', reponse: M },
            qcm(rng, '2) $C$ appartient à $(D)$ :', surD ? 'oui' : 'non', ['oui', 'non']),
            { label: '3) $P =$', type: 'tuple', reponse: P }
          ],
          indices: [
            '$M(x \\,;\\, y \\,;\\, z) \\in (D) \\iff \\vect{AM} = t\\,\\vec{u}$ pour un réel $t$, ce qui donne $x = x_A + ta$, $y = y_A + tb$, $z = z_A + tc$.',
            'Pour tester un point, cherche $t$ avec la première équation, puis vérifie les deux autres. Pour l\'intersection avec $(xOy)$, résous $z = 0$.'
          ],
          solution: [
            '$M \\in (D) \\iff \\vect{AM} = t\\,\\vec{u}$ : une représentation paramétrique de $(D)$ est $' + paramTex(A, u) + '$ avec $t \\in \\R$.',
            'Pour $t = ' + t0 + '$ : $M' + t3(M) + '$.',
            'Si $C \\in (D)$, la première équation donne $' + C[0] + ' = ' + T.sum([{ c: A[0] }, { c: u[0], v: 't' }]) + '$, soit $t = ' + tC.tex() + '$. Avec cette valeur : $y = ' + nb(yC) + '$ et $z = ' + nb(zC) + '$.',
            surD ? 'On retrouve bien $y_C = ' + C[1] + '$ et $z_C = ' + C[2] + '$ : $C$ appartient à $(D)$ (c\'est le point de paramètre $' + tc + '$).'
              : 'Or $C' + t3(C) + '$ : les trois équations ne sont pas vérifiées par une même valeur de $t$, donc $C$ n\'appartient pas à $(D)$.',
            '$z = 0 \\iff ' + T.sum([{ c: A[2] }, { c: u[2], v: 't' }]) + ' = 0 \\iff t = ' + t1 + '$, d\'où $P' + t3(P) + '$.'
          ],
          aide: 'Coordonnées : (2 ; -1 ; 3).'
        };
      }
      var A2, AB, AC, nz, g = 0;
      do {
        A2 = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
        AB = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
        AC = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
        nz = AB[0] * AC[1] - AB[1] * AC[0];
        g++;
      } while (nz === 0 && g < 100);
      if (nz === 0) { AB = [1, 0, 2]; AC = [0, 1, -1]; nz = 1; }
      var n = [AB[1] * AC[2] - AB[2] * AC[1], AB[2] * AC[0] - AB[0] * AC[2], nz];
      var B = [0, 1, 2].map(function (i) { return A2[i] + AB[i]; }), C2 = [0, 1, 2].map(function (i) { return A2[i] + AC[i]; });
      var al = rng.nz(-2, 2), be = rng.nz(-2, 2);
      var D = [0, 1, 2].map(function (i) { return A2[i] + al * AB[i] + be * AC[i]; });
      var al2 = rng.int(-2, 2), be2 = rng.nz(-2, 2), dans = rng.bool();
      var E = [0, 1, 2].map(function (i) { return A2[i] + al2 * AB[i] + be2 * AC[i]; });
      if (!dans) E[2] += rng.pick([-1, 1, 2]);
      var AE = [0, 1, 2].map(function (i) { return E[i] - A2[i]; });
      var detx = function (d) { return F(d[0] * AC[1] - d[1] * AC[0], nz); }, dety = function (d) { return F(AB[0] * d[1] - AB[1] * d[0], nz); };
      var aE = detx(AE), bE = dety(AE), zE = F(A2[2]).add(aE.mul(AB[2])).add(bE.mul(AC[2]));
      trace('1s-espace-droite-plan', { niveau: 2, A: A2, B: B, C: C2, D: D, E: E });
      var AD = [D[0] - A2[0], D[1] - A2[1]], mz = A2[2] ? 'm' + T.signed(-A2[2]) : 'm';
      return {
        enonce: rep + 'On donne les points $A' + t3(A2) + '$, $B' + t3(B) + '$, $C' + t3(C2) + '$ et $D' + pt(D[0], D[1], 'm') + '$, où $m$ est un réel.<br>' +
          '1) Vérifier que les points $A$, $B$, $C$ ne sont pas alignés.<br>2) Déterminer les réels $\\alpha$ et $\\beta$ tels que les deux premières coordonnées de $\\vect{AD}$ et de $\\alpha\\vect{AB} + \\beta\\vect{AC}$ soient égales, puis la valeur de $m$ pour laquelle les points $A$, $B$, $C$, $D$ sont coplanaires.<br>' +
          '3) Le point $E' + t3(E) + '$ appartient-il au plan $(ABC)$ ?',
        questions: [
          { label: '2) $(\\alpha \\,;\\, \\beta) =$', type: 'tuple', reponse: [al, be] },
          { label: '2) $m =$', type: 'number', reponse: D[2] },
          qcm(rng, '3) $E$ appartient au plan $(ABC)$ :', dans ? 'oui' : 'non', ['oui', 'non'])
        ],
        indices: [
          'Les points $A$, $B$, $C$, $D$ sont coplanaires si et seulement s\'il existe des réels $\\alpha$, $\\beta$ tels que $\\vect{AD} = \\alpha\\vect{AB} + \\beta\\vect{AC}$ (avec $\\vect{AB}$, $\\vect{AC}$ non colinéaires).',
          'Écris le système des deux premières coordonnées pour trouver $\\alpha$ et $\\beta$, puis utilise la troisième coordonnée.'
        ],
        solution: [
          '$\\vect{AB}' + t3(AB) + '$ et $\\vect{AC}' + t3(AC) + '$ : leurs deux premières coordonnées ne sont pas proportionnelles ($' + T.par(AB[0]) + ' \\times ' + T.par(AC[1]) + ' - ' + T.par(AB[1]) + ' \\times ' + T.par(AC[0]) + ' = ' + nz + ' \\neq 0$), donc ces vecteurs ne sont pas colinéaires : $A$, $B$, $C$ ne sont pas alignés et définissent un plan.',
          '$\\vect{AD}' + pt(AD[0], AD[1], mz) + '$. Les deux premières coordonnées donnent $' + sysTex([T.sum([{ c: AB[0], v: '\\alpha' }, { c: AC[0], v: '\\beta' }]) + ' = ' + AD[0], T.sum([{ c: AB[1], v: '\\alpha' }, { c: AC[1], v: '\\beta' }]) + ' = ' + AD[1]]) + '$, d\'où $\\alpha = ' + al + '$ et $\\beta = ' + be + '$.',
          'Les points sont coplanaires si et seulement si la troisième coordonnée convient aussi : $' + mz + ' = ' + T.par(al) + ' \\times ' + T.par(AB[2]) + ' + ' + T.par(be) + ' \\times ' + T.par(AC[2]) + ' = ' + (al * AB[2] + be * AC[2]) + '$, donc $m = ' + D[2] + '$.',
          '$\\vect{AE}' + t3(AE) + '$ : le même système donne $\\alpha = ' + aE.tex() + '$ et $\\beta = ' + bE.tex() + '$, et alors $z_A + \\alpha z_{\\vect{AB}} + \\beta z_{\\vect{AC}} = ' + nb(zE) + '$.',
          dans ? 'On retrouve $z_E = ' + E[2] + '$ : $\\vect{AE} = ' + T.sum([{ c: aE, v: '\\vect{AB}' }, { c: bE, v: '\\vect{AC}' }]) + '$, donc $E$ appartient au plan $(ABC)$.'
            : 'Or $z_E = ' + E[2] + ' \\neq ' + nb(zE) + '$ : $\\vect{AE}$ n\'est pas combinaison linéaire de $\\vect{AB}$ et $\\vect{AC}$, donc $E$ n\'appartient pas au plan $(ABC)$.'
        ],
        aide: 'Couple : (1 ; -2).'
      };
    }
  });

  /* ================================================================== */
  /* 1ère L — Coût moyen et bénéfice                                     */
  /* ================================================================== */
  var CTX_COUT = [
    { t: 'Un atelier de Soumbédioune fabrique des statuettes en bois', obj: 'statuettes' },
    { t: 'Un tailleur de la Médina coud des boubous', obj: 'boubous' },
    { t: 'Une coopérative de femmes de Kaolack fabrique des paniers tressés', obj: 'paniers' }
  ];
  EM.gen.register({
    id: '1l-cout-moyen',
    titre: 'Coût moyen minimal et bénéfice maximal à l\'aide de la dérivée',
    chapitres: ['1l-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_COUT), s = rng.pick([5, 6, 8, 10, 12, 15]), c = s * s, b = rng.pick([4, 5, 10, 15, 20]), X = 40;
      var CM = { s: '(x)+' + S(b) + '+' + S(c) + '/x', tex: 'x + ' + b + ' + \\dfrac{' + c + '}{x}' };
      var dCM = { s: '1-' + S(c) + '/x^2', tex: '1 - \\dfrac{' + c + '}{x^2}' };
      var mini = 2 * s + b;
      var intro = ctx.t + '. Pour $x$ ' + ctx.obj + ' fabriqués ($1 \\leq x \\leq ' + X + '$), le coût total de production, en milliers de F CFA, est $C(x) = ' + T.poly([1, b, c]) + '$. On appelle coût moyen le coût d\'un objet : $C_M(x) = \\dfrac{C(x)}{x}$.';
      var sol = [
        '$C_M(x) = \\dfrac{x^2 + ' + b + 'x + ' + c + '}{x} = ' + CM.tex + '$.',
        'Avec $(x)\' = 1$, la dérivée d\'une constante nulle et $\\left(\\dfrac{1}{x}\\right)\' = -\\dfrac{1}{x^2}$ : $C_M\'(x) = ' + dCM.tex + ' = \\dfrac{x^2 - ' + c + '}{x^2} = \\dfrac{(x - ' + s + ')(x + ' + s + ')}{x^2}$.',
        'Sur $[1 \\,;\\, ' + X + ']$, $x^2 > 0$ et $x + ' + s + ' > 0$ : $C_M\'(x)$ a le signe de $x - ' + s + '$.' +
          tabVar(['1', String(s), String(X)], ['-', '+'], ['0'], [T.num(1 + b + c), String(mini), T.num(X + b + c / X)], 'C_M'),
        'Le coût moyen est minimal pour $x = ' + s + '$ ' + ctx.obj + ' : $C_M(' + s + ') = ' + s + ' + ' + b + ' + \\dfrac{' + c + '}{' + s + '} = ' + mini + '$ milliers de F CFA, soit $' + T.num(mini * 1000) + '$ F CFA par objet.'
      ];
      var qs;
      if (niveau === 1) {
        trace('1l-cout-moyen', { niveau: 1, b: b, c: c, X: X });
        qs = [
          { label: '1) $C_M(x) =$', type: 'expr', reponse: CM.s, reponseTex: CM.tex, domaine: [1, 20] },
          { label: '2) $C_M\'(x) =$', type: 'expr', reponse: dCM.s, reponseTex: dCM.tex, domaine: [1, 20] },
          { label: '3) Coût moyen minimal pour $x =$', type: 'number', reponse: s },
          { label: '3) Coût moyen minimal :', type: 'number', reponse: mini, unite: 'milliers de F CFA' }
        ];
        return {
          enonce: intro + '<br>1) Exprimer $C_M(x)$ sous la forme $x + a + \\dfrac{b}{x}$.<br>2) Calculer $C_M\'(x)$ et étudier son signe.<br>3) En déduire le nombre d\'objets à fabriquer pour que le coût moyen soit minimal, et ce coût moyen minimal.',
          questions: qs,
          indices: ['Divise chaque terme de $C(x)$ par $x$.', '$\\left(\\dfrac{1}{x}\\right)\' = -\\dfrac{1}{x^2}$ ; réduis $C_M\'(x)$ au même dénominateur et factorise $x^2 - ' + c + '$.'],
          solution: sol,
          aide: 'Expressions : x + 5 + 100/x, 1 - 100/x^2.'
        };
      }
      var xs = rng.int(s + 3, 30), p = b + 2 * xs, Bmax = xs * xs - c;
      trace('1l-cout-moyen', { niveau: 2, b: b, c: c, X: X, p: p });
      qs = [
        { label: '1) $C_M\'(x) =$', type: 'expr', reponse: dCM.s, reponseTex: dCM.tex, domaine: [1, 20] },
        { label: '1) Coût moyen minimal pour $x =$', type: 'number', reponse: s },
        { label: '2) $B(x) =$', type: 'expr', reponse: polyS([-1, p - b, -c]), reponseTex: T.poly([-1, p - b, -c]), domaine: [1, 20] },
        { label: '2) $B\'(x) =$', type: 'expr', reponse: polyS([-2, p - b]), reponseTex: T.poly([-2, p - b]) },
        { label: '2) Bénéfice maximal pour $x =$', type: 'number', reponse: xs },
        { label: '2) Bénéfice maximal :', type: 'number', reponse: Bmax, unite: 'milliers de F CFA' }
      ];
      sol.push('<b>Bénéfice.</b> La recette est $' + p + 'x$, donc $B(x) = ' + p + 'x - (' + T.poly([1, b, c]) + ') = ' + T.poly([-1, p - b, -c]) + '$.');
      sol.push('$B\'(x) = ' + T.poly([-2, p - b]) + '$ s\'annule pour $x = ' + xs + '$ ; $B\'(x) > 0$ avant et $B\'(x) < 0$ après : $B$ est croissante sur $[1 \\,;\\, ' + xs + ']$ puis décroissante sur $[' + xs + ' \\,;\\, ' + X + ']$.');
      sol.push('Le bénéfice est maximal pour $x = ' + xs + '$ : $B(' + xs + ') = -' + (xs * xs) + ' + ' + (p - b) + ' \\times ' + xs + ' - ' + c + ' = ' + Bmax + '$ milliers de F CFA.');
      return {
        enonce: intro + '<br>1) Calculer $C_M\'(x)$, étudier son signe et en déduire le nombre d\'objets pour lequel le coût moyen est minimal.<br>' +
          '2) Chaque objet est vendu $' + p + '$ milliers de F CFA. Exprimer le bénéfice $B(x)$, calculer $B\'(x)$ et en déduire la production qui rend le bénéfice maximal, ainsi que ce bénéfice.',
        questions: qs,
        indices: ['$C_M(x) = x + ' + b + ' + \\dfrac{' + c + '}{x}$ et $\\left(\\dfrac{1}{x}\\right)\' = -\\dfrac{1}{x^2}$.', 'Bénéfice = recette − coût total ; étudie le signe de la fonction affine $B\'(x)$.'],
        solution: sol,
        aide: 'Expressions développées : -x^2 + 40x - 100.'
      };
    }
  });

  /* ================================================================== */
  /* Tle S — Similitudes                                                 */
  /* ================================================================== */
  var SIM_NICE = [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 2], [0, -2], [0, 1], [0, -1], [2, 0], [-2, 0]];
  function simDesc(a) {
    var ma = cModArg(a);
    return { k: radTex(ma.m, ma.s), kS: radS(ma.m, ma.s), th: angTex(ma.t), thS: angS(ma.t), rot: ma.m.equals(1) && ma.s === 1, homo: a.y.isZero() };
  }
  function natureSim(a) {
    var d = simDesc(a);
    return d.rot ? 'une rotation' : d.homo ? 'une homothétie' : 'une similitude qui n\'est ni une rotation ni une homothétie';
  }

  EM.gen.register({
    id: 'ts-simil-deux-points',
    titre: 'Similitude directe définie par deux points et leurs images',
    chapitres: ['ts-similitudes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var liste = niveau === 1 ? SIM_NICE.slice(0, 8) : SIM_NICE;
      var aa = rng.pick(liste), a = Cx(aa[0], aa[1]), w = Cx(rng.int(-3, 3), rng.int(-3, 3));
      var b = cMul(w, cSub(Cx(1, 0), a));
      var A, B, g = 0;
      do { A = Cx(rng.int(-3, 3), rng.int(-3, 3)); B = Cx(rng.int(-3, 3), rng.int(-3, 3)); g++; } while ((cEq(A, B) || cEq(A, w) || cEq(B, w)) && g < 50);
      var A1 = cAdd(cMul(a, A), b), B1 = cAdd(cMul(a, B), b);
      var dd = cSub(B, A), dp = cSub(B1, A1), d = simDesc(a);
      var sol = [
        '$s$ a une écriture de la forme $z\' = az + b$. Les conditions $s(A) = A\'$ et $s(B) = B\'$ donnent $z_{A\'} = az_A + b$ et $z_{B\'} = az_B + b$.',
        'Par soustraction : $a = \\dfrac{z_{B\'} - z_{A\'}}{z_B - z_A} = \\dfrac{' + cTex(dp) + '}{' + cTex(dd) + '}' +
          (dd.y.isZero() ? '' : ' = ' + (cN2(dd).equals(1) ? cPar(dp) + ' \\times ' + cPar(cConj(dd)) : '\\dfrac{' + cPar(dp) + cPar(cConj(dd)) + '}{' + cN2(dd).tex() + '}')) + ' = ' + cTex(a) + '$.',
        'Puis $b = z_{A\'} - az_A = ' + cTex(A1) + ' - ' + cPar(a) + ' \\times ' + cPar(A) + ' = ' + cTex(b) + '$. Donc $s : ' + ecrSim(a, b) + '$.'
      ];
      var qs = [
        { label: '$a$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [a.x, a.y] },
        { label: '$b$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [b.x, b.y] }
      ];
      var omega = cDiv(b, cSub(Cx(1, 0), a));
      sol.push('$a \\neq 1$ : $s$ est la similitude directe de rapport $|a| = ' + d.k + '$ et d\'angle $\\arg(a) = ' + d.th + '$.');
      sol.push('Son centre $\\Omega$ est le point invariant : $\\omega = a\\omega + b \\iff \\omega = \\dfrac{b}{1 - a} = \\dfrac{' + cTex(b) + '}{' + cTex(cSub(Cx(1, 0), a)) + '} = ' + cTex(omega) + '$.');
      qs.push({ label: 'Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [omega.x, omega.y] });
      var Cimg = null, C0 = null;
      if (niveau === 2) {
        qs.splice(1, 0, { label: 'Rapport $k =$', type: 'number', reponse: d.kS, reponseTex: d.k }, { label: 'Angle $\\theta$ (mesure principale) :', type: 'number', reponse: d.thS, reponseTex: d.th });
        do { C0 = Cx(rng.int(-3, 3), rng.int(-3, 3)); } while (cEq(C0, A) || cEq(C0, B));
        Cimg = cAdd(cMul(a, C0), b);
        qs.push({ label: 'Point $C$ tel que $s(C) = C\'$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [C0.x, C0.y] });
        sol.push('$s(C) = C\' \\iff z_{C\'} = az_C + b \\iff z_C = \\dfrac{z_{C\'} - b}{a} = \\dfrac{' + cTex(cSub(Cimg, b)) + '}{' + cTex(a) + '} = ' + cTex(C0) + '$.');
      }
      trace('ts-simil-deux-points', { niveau: niveau, A: A, B: B, A1: A1, B1: B1, Cimg: Cimg });
      return {
        enonce: 'Le plan complexe est rapporté à un repère orthonormé direct. On considère les points $A$, $B$, $A\'$, $B\'$ d\'affixes $z_A = ' + cTex(A) + '$, $z_B = ' + cTex(B) + '$, $z_{A\'} = ' + cTex(A1) + '$ et $z_{B\'} = ' + cTex(B1) + '$. ' +
          'Soit $s$ la similitude directe qui transforme $A$ en $A\'$ et $B$ en $B\'$.<br>' +
          (niveau === 1 ? 'Déterminer l\'écriture complexe $z\' = az + b$ de $s$, puis l\'affixe de son centre $\\Omega$.'
            : '1) Déterminer l\'écriture complexe $z\' = az + b$ de $s$.<br>2) En déduire le rapport $k$, l\'angle $\\theta$ et le centre $\\Omega$ de $s$.<br>3) Déterminer l\'affixe du point $C$ dont l\'image par $s$ est le point $C\'$ d\'affixe $' + cTex(Cimg) + '$.'),
        questions: qs,
        indices: [
          'Écris $z_{A\'} = az_A + b$ et $z_{B\'} = az_B + b$, puis soustrais membre à membre pour obtenir $a$.',
          'Rapport $|a|$, angle $\\arg(a)$ ; le centre vérifie $\\omega = a\\omega + b$.'
        ],
        solution: sol,
        aide: 'Écris la partie réelle puis la partie imaginaire : (3 ; -2) pour 3 - 2i. Rapport : sqrt(2) ; angle : 3pi/4.'
      };
    }
  });

  EM.gen.register({
    id: 'ts-simil-composee',
    titre: 'Réciproque et composée de similitudes directes',
    chapitres: ['ts-similitudes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var un = Cx(1, 0);
      if (niveau === 1) {
        var aa = rng.pick(SIM_NICE), a = Cx(aa[0], aa[1]), w = Cx(rng.int(-3, 3), rng.int(-3, 3));
        var b = cMul(w, cSub(un, a)), ai = cDiv(un, a), bi = cDiv(cSub(Cx(0, 0), b), a), d = simDesc(a), di = simDesc(ai);
        trace('ts-simil-composee', { niveau: 1, a: a, b: b });
        var ecr = ecrSim(a, b);
        return {
          enonce: 'Le plan complexe est rapporté à un repère orthonormé direct. Soit $s$ la similitude directe d\'écriture complexe $$' + ecr + '.$$' +
            '1) Déterminer le rapport, l\'angle et le centre $\\Omega$ de $s$.<br>2) Déterminer l\'écriture complexe $z\' = a\'z + b\'$ de la réciproque $s^{-1}$ de $s$, puis son rapport et son angle.',
          questions: [
            { label: '1) Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [w.x, w.y] },
            { label: '2) $a\'$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [ai.x, ai.y] },
            { label: '2) $b\'$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [bi.x, bi.y] },
            { label: '2) Rapport de $s^{-1}$ :', type: 'number', reponse: di.kS, reponseTex: di.k },
            { label: '2) Angle de $s^{-1}$ (mesure principale) :', type: 'number', reponse: di.thS, reponseTex: di.th }
          ],
          indices: [
            'Le centre est le point invariant : $\\omega = a\\omega + b$.',
            '$z\' = az + b \\iff z = \\dfrac{1}{a}z\' - \\dfrac{b}{a}$ : la réciproque a le même centre, le rapport $\\dfrac{1}{k}$ et l\'angle $-\\theta$.'
          ],
          solution: [
            '$a = ' + cTex(a) + '$ : rapport $|a| = ' + d.k + '$, angle $\\arg(a) = ' + d.th + '$.',
            'Centre : $\\omega = \\dfrac{b}{1 - a} = \\dfrac{' + cTex(b) + '}{' + cTex(cSub(un, a)) + '} = ' + cTex(w) + '$.',
            '$z\' = az + b \\iff z = \\dfrac{z\' - b}{a}$, donc $s^{-1} : z\' = a\'z + b\'$ avec $a\' = \\dfrac{1}{a} = \\dfrac{1}{' + cTex(a) + '} = ' + cTex(ai) + '$ et $b\' = -\\dfrac{b}{a} = ' + cTex(bi) + '$.',
            'Rapport de $s^{-1}$ : $|a\'| = \\dfrac{1}{|a|} = ' + di.k + '$ ; angle : $\\arg(a\') = -\\arg(a) = ' + di.th + '$ (à $2\\pi$ près). Son centre est encore $\\Omega$.'
          ],
          aide: 'Écris la partie réelle puis la partie imaginaire : (1/2 ; -1/2) pour 1/2 - i/2. Rapport : sqrt(2)/2 ; angle : -pi/4.'
        };
      }
      var a1, a2, a, g = 0;
      do {
        var p1 = rng.pick(SIM_NICE), p2 = rng.pick(SIM_NICE);
        a1 = Cx(p1[0], p1[1]); a2 = Cx(p2[0], p2[1]); a = cMul(a2, a1); g++;
      } while ((cEq(a, un) || cN2(a).cmp(16) > 0) && g < 100);
      if (cEq(a, un)) { a1 = Cx(1, 1); a2 = Cx(0, 1); a = cMul(a2, a1); }
      var b1 = Cx(rng.int(-3, 3), rng.int(-3, 3)), b2 = Cx(rng.int(-3, 3), rng.int(-3, 3));
      var b = cAdd(cMul(a2, b1), b2), om = cDiv(b, cSub(un, a)), dc = simDesc(a), nat = natureSim(a);
      trace('ts-simil-composee', { niveau: 2, a1: a1, b1: b1, a2: a2, b2: b2 });
      var ecr1 = ecrSim(a1, b1), ecr2 = ecrSim(a2, b2);
      return {
        enonce: 'Le plan complexe est rapporté à un repère orthonormé direct. On considère les similitudes directes $s_1 : ' + ecr1 + '$ et $s_2 : ' + ecr2 + '$, et la composée $s = s_2 \\circ s_1$.<br>' +
          '1) Déterminer l\'écriture complexe $z\' = az + b$ de $s$.<br>2) En déduire le rapport, l\'angle et le centre $\\Omega$ de $s$, puis préciser sa nature.',
        questions: [
          { label: '1) $a$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [a.x, a.y] },
          { label: '1) $b$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [b.x, b.y] },
          { label: '2) Rapport $k =$', type: 'number', reponse: dc.kS, reponseTex: dc.k },
          { label: '2) Angle $\\theta$ (mesure principale) :', type: 'number', reponse: dc.thS, reponseTex: dc.th },
          { label: '2) Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [om.x, om.y] },
          qcm(rng, '2) $s$ est :', nat, ['une rotation', 'une homothétie', 'une similitude qui n\'est ni une rotation ni une homothétie', 'une translation'])
        ],
        indices: [
          'Si $M_1 = s_1(M)$ puis $M\' = s_2(M_1)$ : $z\' = a_2 z_1 + b_2$ avec $z_1 = a_1 z + b_1$. Remplace et développe.',
          'Le rapport de la composée est le produit des rapports, son angle la somme des angles ; le centre vérifie $\\omega = a\\omega + b$.'
        ],
        solution: [
          '$z\' = ' + cPar(a2) + '\\left(' + coefC(a1) + 'z' + plusC(b1) + '\\right)' + plusC(b2) + '$, soit $' + ecrSim(a, b) + '$.',
          'Rapport : $|a| = |a_1| \\times |a_2| = ' + dc.k + '$ ; angle : $\\arg(a) = \\arg(a_1) + \\arg(a_2) = ' + dc.th + '$ (à $2\\pi$ près).',
          'Centre : $\\omega = \\dfrac{b}{1 - a} = \\dfrac{' + cTex(b) + '}{' + cTex(cSub(un, a)) + '} = ' + cTex(om) + '$.',
          nat === 'une rotation' ? 'Le rapport vaut $1$ : $s$ est une rotation.' : nat === 'une homothétie' ? '$a = ' + cTex(a) + '$ est un réel différent de $1$ : $s$ est une homothétie de rapport $' + cTex(a) + '$.' : 'Le rapport est différent de $1$ et $a$ n\'est pas réel : $s$ n\'est ni une rotation, ni une homothétie.'
        ],
        aide: 'Écris la partie réelle puis la partie imaginaire : (3 ; -2) pour 3 - 2i. Rapport : 2sqrt(2) ; angle : 3pi/4.'
      };
    }
  });

  /* ================================================================== */
  /* Tle S — Statistiques : tableau à double entrée                      */
  /* ================================================================== */
  var CTX_DOUBLE = [
    { t: 'Une enquête menée auprès de $N$ familles de Pikine porte sur le nombre $x$ d\'enfants scolarisés et le nombre $y$ de téléphones portables du foyer.', xs: [1, 2, 3, 4], ys: [1, 2, 3] },
    { t: 'Dans un élevage de moutons de Linguère, on a relevé pour $N$ brebis l\'âge $x$ (en années) et le nombre $y$ d\'agneaux nés dans l\'année.', xs: [1, 2, 3, 4], ys: [0, 1, 2] },
    { t: 'Dans un lycée de Thiès, on a relevé pour $N$ élèves le nombre $x$ d\'heures de sport par semaine et la note $y$ obtenue en EPS.', xs: [2, 4, 6], ys: [10, 12, 14, 16] }
  ];
  EM.gen.register({
    id: 'ts-stat-double-entree',
    titre: 'Tableau à double entrée : séries marginales, fréquences conditionnelles, covariance',
    chapitres: ['ts-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_DOUBLE), xs = ctx.xs, ys = ctx.ys, n, g = 0, st;
      var calc = function (n) {
        var N = 0, sx = 0, sy = 0, sxx = 0, sxy = 0, nx = xs.map(function () { return 0; }), ny = ys.map(function () { return 0; });
        xs.forEach(function (x, i) { ys.forEach(function (y, j) { var c = n[i][j]; N += c; nx[i] += c; ny[j] += c; sx += c * x; sy += c * y; sxx += c * x * x; sxy += c * x * y; }); });
        var mx = sx / N, my = sy / N;
        return { N: N, nx: nx, ny: ny, sx: sx, sy: sy, sxx: sxx, sxy: sxy, mx: mx, my: my, vx: sxx / N - mx * mx, cov: sxy / N - mx * my };
      };
      do {
        n = xs.map(function (x, i) {
          return ys.map(function (y, j) {
            var di = Math.abs(i / (xs.length - 1) - j / (ys.length - 1));
            return rng.int(0, 2) + (di < 0.4 ? rng.int(2, 6) : 0);
          });
        });
        st = calc(n); g++;
      } while ((st.N < 20 || st.N > 60 || st.nx.some(function (v) { return v === 0; }) || Math.abs(st.cov) < 0.05) && g < 200);
      var head = 'x_i \\backslash y_j & ' + ys.join(' & ');
      var rows = xs.map(function (x, i) { return x + ' & ' + n[i].join(' & '); });
      var tab = '$$\\begin{array}{|c|' + ys.map(function () { return 'c|'; }).join('') + '}\\hline ' + head + ' \\\\ \\hline ' + rows.join(' \\\\ \\hline ') + ' \\\\ \\hline\\end{array}$$';
      var tabTot = '$$\\begin{array}{|c|' + ys.map(function () { return 'c|'; }).join('') + 'c|}\\hline ' + head + ' & \\text{Total} \\\\ \\hline ' +
        xs.map(function (x, i) { return x + ' & ' + n[i].join(' & ') + ' & ' + st.nx[i]; }).join(' \\\\ \\hline ') + ' \\\\ \\hline \\text{Total} & ' + st.ny.join(' & ') + ' & ' + st.N + ' \\\\ \\hline\\end{array}$$';
      var sol = [
        'On complète le tableau par les totaux des lignes (série marginale de $x$) et des colonnes (série marginale de $y$) :' + tabTot,
        '$\\bar{x} = \\dfrac{1}{N}\\sum n_{i\\cdot}x_i = \\dfrac{' + xs.map(function (x, i) { return st.nx[i] + ' \\times ' + x; }).join(' + ') + '}{' + st.N + '} = \\dfrac{' + st.sx + '}{' + st.N + '} \\approx ' + ap(st.mx, 4) + '$.',
        '$\\bar{y} = \\dfrac{1}{N}\\sum n_{\\cdot j}y_j = \\dfrac{' + ys.map(function (y, j) { return st.ny[j] + ' \\times ' + y; }).join(' + ') + '}{' + st.N + '} = \\dfrac{' + st.sy + '}{' + st.N + '} \\approx ' + ap(st.my, 4) + '$.'
      ];
      var enonce = ctx.t.replace('$N$', '$' + st.N + '$') + ' Les effectifs $n_{ij}$ des couples $(x_i \\,;\\, y_j)$ sont donnés ci-dessous :' + tab, qs;
      if (niveau === 1) {
        var i0 = rng.int(0, xs.length - 1), j0 = rng.int(0, ys.length - 1), fc = F(n[i0][j0] * 100, st.nx[i0]);
        trace('ts-stat-double-entree', { niveau: 1, xs: xs, ys: ys, n: n, i0: i0, j0: j0 });
        enonce += '1) Déterminer les séries marginales et donner l\'effectif de la modalité $x = ' + xs[i0] + '$.<br>2) Calculer les moyennes $\\bar{x}$ et $\\bar{y}$ (arrondies à $10^{-2}$).<br>' +
          '3) Calculer, en pourcentage arrondi au dixième, la fréquence de la modalité $y = ' + ys[j0] + '$ parmi les individus tels que $x = ' + xs[i0] + '$.';
        qs = [
          { label: '1) Effectif de $x = ' + xs[i0] + '$ :', type: 'number', reponse: st.nx[i0] },
          { label: '2) $\\bar{x} \\approx$', type: 'number', reponse: st.mx, tol: 0.01, reponseTex: ap(st.mx) },
          { label: '2) $\\bar{y} \\approx$', type: 'number', reponse: st.my, tol: 0.01, reponseTex: ap(st.my) },
          { label: '3) Fréquence conditionnelle :', type: 'number', reponse: fc, tol: 0.1, reponseTex: ap(fc, 1), unite: '%' }
        ];
        sol.push('Parmi les $' + st.nx[i0] + '$ individus tels que $x = ' + xs[i0] + '$, $' + n[i0][j0] + '$ ont $y = ' + ys[j0] + '$ : la fréquence conditionnelle est $\\dfrac{' + n[i0][j0] + '}{' + st.nx[i0] + '} \\approx ' + ap(fc.value() / 100, 4) + '$, soit environ $' + ap(fc, 1) + '$ %.');
      } else {
        var a = st.cov / st.vx;
        trace('ts-stat-double-entree', { niveau: 2, xs: xs, ys: ys, n: n });
        enonce += 'Calculer $\\bar{x}$, $\\bar{y}$, la variance $V(x)$, la covariance $\\operatorname{cov}(x, y)$, puis le coefficient directeur $a$ de la droite de régression de $y$ en $x$ (résultats arrondis à $10^{-2}$).';
        qs = [
          { label: '$\\bar{x} \\approx$', type: 'number', reponse: st.mx, tol: 0.01, reponseTex: ap(st.mx) },
          { label: '$\\bar{y} \\approx$', type: 'number', reponse: st.my, tol: 0.01, reponseTex: ap(st.my) },
          { label: '$V(x) \\approx$', type: 'number', reponse: st.vx, tol: 0.01, reponseTex: ap(st.vx) },
          { label: '$\\operatorname{cov}(x, y) \\approx$', type: 'number', reponse: st.cov, tol: 0.01, reponseTex: ap(st.cov) },
          { label: '$a \\approx$', type: 'number', reponse: a, tol: 0.01, reponseTex: ap(a) }
        ];
        sol.push('$V(x) = \\dfrac{1}{N}\\sum n_{i\\cdot}x_i^2 - \\bar{x}^2 = \\dfrac{' + st.sxx + '}{' + st.N + '} - ' + ap(st.mx, 4) + '^2 \\approx ' + ap(st.vx, 4) + '$.');
        sol.push('$\\operatorname{cov}(x, y) = \\dfrac{1}{N}\\sum n_{ij}x_iy_j - \\bar{x}\\,\\bar{y}$ : la somme des produits $n_{ij}x_iy_j$ (sur toutes les cases du tableau) vaut $' + st.sxy + '$, donc $\\operatorname{cov}(x, y) = \\dfrac{' + st.sxy + '}{' + st.N + '} - ' + ap(st.mx, 4) + ' \\times ' + ap(st.my, 4) + ' \\approx ' + ap(st.cov, 4) + '$.');
        sol.push('$a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)} \\approx \\dfrac{' + ap(st.cov, 4) + '}{' + ap(st.vx, 4) + '} \\approx ' + ap(a) + '$.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'La série marginale de $x$ s\'obtient en additionnant les effectifs de chaque ligne ; celle de $y$, en additionnant chaque colonne.',
          '$\\operatorname{cov}(x, y) = \\dfrac{1}{N}\\sum n_{ij}x_iy_j - \\bar{x}\\,\\bar{y}$ ; une fréquence conditionnelle se calcule à l\'intérieur d\'une seule ligne (ou colonne).'
        ],
        solution: sol,
        aide: 'Valeurs décimales arrondies à 0,01 (la virgule est acceptée).'
      };
    }
  });

  /* ================================================================== */
  /* Tle S1 — Coniques                                                   */
  /* ================================================================== */
  var NAT_CON = ['une ellipse', 'une hyperbole', 'une parabole', 'un cercle'];
  EM.gen.register({
    id: 'ts1-coniques-directrice',
    titre: 'Conique définie par un foyer, une directrice et l\'excentricité',
    chapitres: ['ts1-coniques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var f1 = rng.int(-3, 3), f2 = rng.int(-3, 3), P = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]), de = f1 - P;
        var vert = rng.bool(); // directrice verticale (x = δ) ou horizontale (y = δ)
        var u = vert ? 'x' : 'y', v = vert ? 'y' : 'x';
        var Fp = vert ? [f1, f2] : [f2, f1];
        var sm = F(f1 + de, 2), Sm = vert ? [sm, F(f2)] : [F(f2), sm];
        var co = [F(1, 2 * P), F(-f2, P), F(f2 * f2, 2 * P).add(sm)];
        var expr = { s: '(' + v + '-' + S(f2) + ')^2/' + S(2 * P) + '+' + S(sm), tex: T.poly(co, v) };
        trace('ts1-coniques-directrice', { niveau: 1, F: Fp, vert: vert, delta: de });
        return {
          enonce: 'Dans un repère orthonormé, on considère le point $F' + pt(Fp[0], Fp[1]) + '$ et la droite $(D)$ d\'équation $' + u + ' = ' + de + '$. ' +
            'Soit $(\\Gamma)$ l\'ensemble des points $M$ tels que $MF = MH$, où $H$ est le projeté orthogonal de $M$ sur $(D)$.<br>' +
            '1) Préciser la nature de $(\\Gamma)$ et son excentricité.<br>2) Déterminer son sommet $S$ et son paramètre $p$.<br>3) Écrire une équation de $(\\Gamma)$ sous la forme $' + u + ' = \\alpha ' + v + '^2 + \\beta ' + v + ' + \\gamma$.',
          questions: [
            qcm(rng, '1) $(\\Gamma)$ est :', 'une parabole', NAT_CON),
            { label: '2) Sommet $S$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: Sm },
            { label: '2) Paramètre $p =$', type: 'number', reponse: Math.abs(P) },
            { label: '3) $' + u + ' =$', type: 'expr', variable: v, reponse: expr.s, reponseTex: expr.tex }
          ],
          indices: [
            '$MF = e \\times MH$ avec $e = 1$ : c\'est la définition d\'une parabole. Écris $MF^2 = MH^2$ avec $M(x \\,;\\, y)$ et $MH = |' + u + (de ? T.signed(-de) : '') + '|$.',
            'Le sommet est le milieu du segment joignant $F$ à son projeté sur $(D)$ ; le paramètre $p$ est la distance de $F$ à $(D)$.'
          ],
          solution: [
            '$MF = 1 \\times MH$ : $(\\Gamma)$ est la parabole de foyer $F$ et de directrice $(D)$, d\'excentricité $e = 1$.',
            '$M(x \\,;\\, y) \\in (\\Gamma) \\iff MF^2 = MH^2 \\iff ' + carre(u, f1) + ' + ' + carre(v, f2) + ' = ' + carre(u, de) + '$.',
            'D\'où $' + carre(v, f2) + ' = ' + carre(u, de) + ' - ' + carre(u, f1) + ' = ' + T.poly([2 * P, de * de - f1 * f1], u) + ' = ' + (2 * P) + T.xMinus(sm, u) + '$.',
            'Le paramètre est la distance de $F$ à $(D)$ : $p = |' + f1 + ' - ' + T.par(de) + '| = ' + Math.abs(P) + '$. Le sommet est le milieu de $F$ et de son projeté sur $(D)$ : $S' + pt(Sm[0], Sm[1]) + '$.',
            'En isolant $' + u + '$ : $' + u + ' = ' + (P < 0 ? '-' : '') + '\\dfrac{' + carre(v, f2) + '}{' + Math.abs(2 * P) + '}' + (sm.isZero() ? '' : T.signed(sm)) + ' = ' + expr.tex + '$.'
          ],
          aide: 'Sommet : (1/2 ; -3) ; expression en ' + v + ', par exemple 1/4' + v + '^2 - ' + v + ' + 3.'
        };
      }
      var ell = rng.bool();
      var ac = rng.pick(ell ? [[2, 1], [3, 1], [3, 2], [4, 3], [5, 3], [5, 4], [4, 1]] : [[1, 2], [2, 3], [3, 5], [4, 5], [3, 4], [1, 3]]);
      var a = ac[0], c = ac[1], e = F(c, a), dir = F(a * a, c), b2 = Math.abs(a * a - c * c);
      trace('ts1-coniques-directrice', { niveau: 2, a: a, c: c });
      return {
        enonce: 'Dans un repère orthonormé, on considère le point $F(' + c + ' \\,;\\, 0)$ et la droite $(D)$ d\'équation $x = ' + dir.tex() + '$. ' +
          'Soit $(\\Gamma)$ l\'ensemble des points $M$ tels que $\\dfrac{MF}{MH} = ' + e.tex() + '$, où $H$ est le projeté orthogonal de $M$ sur $(D)$.<br>' +
          '1) Préciser la nature de $(\\Gamma)$.<br>2) Montrer qu\'une équation de $(\\Gamma)$ est $\\dfrac{x^2}{\\alpha} ' + (ell ? '+' : '-') + ' \\dfrac{y^2}{\\beta} = 1$, avec $\\alpha$ et $\\beta$ des réels positifs à déterminer.<br>' +
          '3) En déduire le second foyer $F\'$ et la seconde directrice $(D\')$ de $(\\Gamma)$.',
        questions: [
          qcm(rng, '1) $(\\Gamma)$ est :', ell ? 'une ellipse' : 'une hyperbole', NAT_CON),
          { label: '2) $\\alpha =$', type: 'number', reponse: a * a },
          { label: '2) $\\beta =$', type: 'number', reponse: b2 },
          { label: '3) $F\'$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [-c, 0] },
          { label: '3) $(D\') : x =$', type: 'number', reponse: dir.neg() }
        ],
        indices: [
          'L\'excentricité vaut $e = ' + e.tex() + '$ : compare-la à $1$. Puis écris $MF^2 = e^2 MH^2$ avec $MH = \\left|x - ' + dir.tex() + '\\right|$.',
          'Développe les deux membres : les termes en $x$ se simplifient. La courbe obtenue est symétrique par rapport à l\'axe $(Oy)$.'
        ],
        solution: [
          '$e = ' + e.tex() + (ell ? ' < 1' : ' > 1') + '$ : $(\\Gamma)$ est ' + (ell ? 'une ellipse' : 'une hyperbole') + ' de foyer $F$, de directrice associée $(D)$.',
          '$M(x \\,;\\, y) \\in (\\Gamma) \\iff MF^2 = e^2 MH^2 \\iff (x - ' + c + ')^2 + y^2 = ' + e.mul(e).tex() + '\\left(x - ' + dir.tex() + '\\right)^2$.',
          'En développant : $x^2 - ' + (2 * c) + 'x + ' + (c * c) + ' + y^2 = ' + coefTex(e.mul(e)) + 'x^2 - ' + (2 * c) + 'x + ' + (a * a) + '$, soit $' + coefTex(F(a * a - c * c, a * a)) + 'x^2 + y^2 = ' + (a * a - c * c) + '$.',
          'En divisant par $' + T.par(a * a - c * c) + '$ : $' + (a === 1 ? 'x^2' : '\\dfrac{x^2}{' + (a * a) + '}') + ' ' + (ell ? '+' : '-') + ' \\dfrac{y^2}{' + b2 + '} = 1$. Donc $\\alpha = ' + (a * a) + '$ et $\\beta = ' + b2 + '$ ($a = ' + a + '$, $c = ' + c + '$, $e = \\dfrac{c}{a}$).',
          'L\'équation ne change pas si l\'on remplace $x$ par $-x$ : $(\\Gamma)$ est symétrique par rapport à $(Oy)$. Le second foyer est $F\'(' + (-c) + ' \\,;\\, 0)$ et la seconde directrice est $(D\') : x = ' + dir.neg().tex() + '$.'
        ],
        aide: 'Valeurs exactes : fractions acceptées (par exemple -9/2) ; point : (-3 ; 0).'
      };
    }
  });

  var TRIPLES_ELL = [[5, 4, 3], [5, 3, 4], [10, 8, 6], [10, 6, 8], [13, 12, 5], [13, 5, 12], [17, 15, 8], [17, 8, 15]];
  var TRIPLES_HYP = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17]];
  EM.gen.register({
    id: 'ts1-coniques-bifocale',
    titre: 'Ellipse ou hyperbole définie par ses foyers et un point',
    chapitres: ['ts1-coniques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ell = niveau === 1, tr = rng.pick(ell ? TRIPLES_ELL : TRIPLES_HYP), a = tr[0], b = tr[1], c = tr[2];
      var yM = F(b * b, a).mul(rng.pick([1, -1])), MF = F(b * b, a), MFp = ell ? F(2 * a * a - b * b, a) : F(2 * a * a + b * b, a);
      var Nq = 4 * c * c * a * a + Math.pow(b, 4), rN = Math.round(Math.sqrt(Nq));
      trace('ts1-coniques-bifocale', { niveau: niveau, a: a, b: b, c: c, yM: yM.value() });
      var nom = ell ? '(E)' : '(H)';
      var qs = [
        { label: '1) $MF =$', type: 'number', reponse: MF },
        { label: '1) $MF\' =$', type: 'number', reponse: MFp },
        { label: '2) $a =$', type: 'number', reponse: a },
        { label: '2) $b^2 =$', type: 'number', reponse: b * b },
        ell ? { label: '3) Excentricité $e =$', type: 'number', reponse: F(c, a) } : { label: '3) Pente positive d\'une asymptote :', type: 'number', reponse: F(b, a) }
      ];
      return {
        enonce: 'Dans un repère orthonormé, on considère les points $F(' + c + ' \\,;\\, 0)$, $F\'(' + (-c) + ' \\,;\\, 0)$ et $M' + pt(c, yM.tex()) + '$. ' +
          'Soit $' + nom + '$ ' + (ell ? 'l\'ellipse' : 'l\'hyperbole') + ' de foyers $F$ et $F\'$ passant par $M$.<br>' +
          '1) Calculer les distances $MF$ et $MF\'$.<br>2) En déduire le réel $a$, puis $b^2$, et une équation réduite de $' + nom + '$ de la forme $\\dfrac{x^2}{a^2} ' + (ell ? '+' : '-') + ' \\dfrac{y^2}{b^2} = 1$.<br>' +
          (ell ? '3) Calculer l\'excentricité de $(E)$.' : '3) Donner les équations des asymptotes de $(H)$.'),
        questions: qs,
        indices: [
          ell ? 'Définition bifocale de l\'ellipse : $MF + MF\' = 2a$ ; et $c^2 = a^2 - b^2$.' : 'Définition bifocale de l\'hyperbole : $|MF - MF\'| = 2a$ ; et $c^2 = a^2 + b^2$.',
          '$M$ et $F$ ont la même abscisse : $MF = |y_M|$. Pour $MF\'$, utilise $MF\'^2 = (x_M - x_{F\'})^2 + (y_M - y_{F\'})^2$.'
        ],
        solution: [
          '$M$ et $F$ ont la même abscisse, donc $MF = |y_M| = ' + MF.tex() + '$.',
          '$MF\' = \\sqrt{(' + c + ' + ' + c + ')^2 + \\left(' + MF.tex() + '\\right)^2} = \\sqrt{' + (4 * c * c) + ' + \\dfrac{' + Math.pow(b, 4) + '}{' + (a * a) + '}} = \\sqrt{\\dfrac{' + Nq + '}{' + (a * a) + '}} = \\dfrac{' + rN + '}{' + a + '}' + (MFp.n !== rN ? ' = ' + MFp.tex() : '') + '$.',
          ell ? 'Pour l\'ellipse : $2a = MF + MF\' = ' + MF.tex() + ' + ' + MFp.tex() + ' = ' + (2 * a) + '$, donc $a = ' + a + '$.' : 'Pour l\'hyperbole : $2a = |MF - MF\'| = ' + MFp.tex() + ' - ' + MF.tex() + ' = ' + (2 * a) + '$, donc $a = ' + a + '$.',
          'La distance focale donne $c = ' + c + '$ ; ' + (ell ? '$b^2 = a^2 - c^2 = ' + (a * a) + ' - ' + (c * c) + ' = ' + (b * b) + '$' : '$b^2 = c^2 - a^2 = ' + (c * c) + ' - ' + (a * a) + ' = ' + (b * b) + '$') +
            ', d\'où $' + nom + ' : \\dfrac{x^2}{' + (a * a) + '} ' + (ell ? '+' : '-') + ' \\dfrac{y^2}{' + (b * b) + '} = 1$.',
          ell ? 'Excentricité : $e = \\dfrac{c}{a} = ' + F(c, a).tex() + '$ (on a bien $0 < e < 1$).' : 'Asymptotes : $y = \\pm\\dfrac{b}{a}x = \\pm' + F(b, a).tex() + 'x$.'
        ],
        aide: 'Fractions acceptées, par exemple 16/5.'
      };
    }
  });

  /* ================================================================== */
  /* Tle S1 — Espace : distances et projetés orthogonaux                 */
  /* ================================================================== */
  function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function dot(u, v) { return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; }
  var NORMALES = [[1, 2, 2], [2, 1, 2], [2, 2, 1], [1, 4, 8], [2, 3, 6], [2, 6, 3], [3, 2, 6], [6, 2, 3], [4, 4, 7], [8, 4, 1]];
  EM.gen.register({
    id: 'ts1-espace-distances',
    titre: 'Distance d\'un point à un plan ou à une droite, projeté orthogonal',
    chapitres: ['ts1-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var rep = 'L\'espace est muni d\'un repère orthonormé direct $(O, \\vec{i}, \\vec{j}, \\vec{k})$. ';
      if (niveau === 1) {
        var n = rng.pick(NORMALES).map(function (c) { return c * rng.pick([1, -1]); });
        var N2 = dot(n, n), nn = Math.round(Math.sqrt(N2)), M = [rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4)];
        var t = rng.pick([1, -1, 2, -2]), d = t * N2 - dot(n, M);
        var H = [0, 1, 2].map(function (i) { return M[i] - t * n[i]; }), Ms = [0, 1, 2].map(function (i) { return M[i] - 2 * t * n[i]; });
        var plan = T.sum([{ c: n[0], v: 'x' }, { c: n[1], v: 'y' }, { c: n[2], v: 'z' }, { c: d }]) + ' = 0';
        trace('ts1-espace-distances', { niveau: 1, n: n, d: d, M: M });
        return {
          enonce: rep + 'On considère le plan $(P) : ' + plan + '$ et le point $M' + t3(M) + '$.<br>1) Calculer la distance du point $M$ au plan $(P)$.<br>2) Déterminer les coordonnées du projeté orthogonal $H$ de $M$ sur $(P)$.<br>3) En déduire les coordonnées du symétrique $M\'$ de $M$ par rapport à $(P)$.',
          questions: [
            { label: '1) $d(M, (P)) =$', type: 'number', reponse: Math.abs(t) * nn },
            { label: '2) $H =$', type: 'tuple', reponse: H },
            { label: '3) $M\' =$', type: 'tuple', reponse: Ms }
          ],
          indices: [
            '$d(M, (P)) = \\dfrac{|ax_M + by_M + cz_M + d|}{\\sqrt{a^2 + b^2 + c^2}}$ avec $\\vec{n}(a \\,;\\, b \\,;\\, c)$ normal à $(P)$.',
            '$H$ est le point de la droite $(M, \\vec{n})$ qui appartient à $(P)$ : écris $H = M + \\lambda\\vec{n}$ et trouve $\\lambda$. Puis $H$ est le milieu de $[MM\']$.'
          ],
          solution: [
            'Un vecteur normal à $(P)$ est $\\vec{n}' + t3(n) + '$, de norme $\\sqrt{' + N2 + '} = ' + nn + '$.',
            '$d(M, (P)) = \\dfrac{|' + T.num(n[0]) + ' \\times ' + T.par(M[0]) + ' + ' + T.par(n[1]) + ' \\times ' + T.par(M[1]) + ' + ' + T.par(n[2]) + ' \\times ' + T.par(M[2]) + ' + ' + T.par(d) + '|}{' + nn + '} = \\dfrac{' + Math.abs(t * N2) + '}{' + nn + '} = ' + (Math.abs(t) * nn) + '$.',
            '$H = M + \\lambda\\vec{n}$ : $H' + pt(T.sum([{ c: M[0] }, { c: n[0], v: '\\lambda' }]), T.sum([{ c: M[1] }, { c: n[1], v: '\\lambda' }]), T.sum([{ c: M[2] }, { c: n[2], v: '\\lambda' }])) + '$. $H \\in (P) \\iff ' + (t * N2) + ' + ' + N2 + '\\lambda = 0 \\iff \\lambda = ' + (-t) + '$.',
            'Donc $H' + t3(H) + '$.',
            '$H$ est le milieu de $[MM\']$ : $M\' = 2H - M$, soit $M\'' + t3(Ms) + '$.'
          ],
          aide: 'Coordonnées : (1 ; -2 ; 3).'
        };
      }
      var A, u, M2, w, g = 0;
      do {
        A = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)];
        u = [rng.int(-2, 2), rng.int(-2, 2), rng.int(-2, 2)];
        M2 = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
        w = cross([M2[0] - A[0], M2[1] - A[1], M2[2] - A[2]], u); g++;
      } while ((dot(u, u) === 0 || dot(w, w) === 0) && g < 100);
      if (dot(w, w) === 0) { A = [1, 0, 0]; u = [1, 1, 0]; M2 = [0, 0, 2]; w = cross([-1, 0, 2], u); }
      var AM = [M2[0] - A[0], M2[1] - A[1], M2[2] - A[2]], uu = dot(u, u), W2 = dot(w, w);
      var dist = racine(F(W2, uu)), lam = F(dot(AM, u), uu), Hh = [0, 1, 2].map(function (i) { return F(A[i]).add(lam.mul(u[i])); });
      trace('ts1-espace-distances', { niveau: 2, A: A, u: u, M: M2 });
      return {
        enonce: rep + 'On considère la droite $(\\Delta)$ passant par $A' + t3(A) + '$ et de vecteur directeur $\\vec{u}' + t3(u) + '$, et le point $M' + t3(M2) + '$.<br>' +
          '1) Calculer les coordonnées du vecteur $\\vect{AM} \\wedge \\vec{u}$.<br>2) En déduire la distance du point $M$ à la droite $(\\Delta)$.<br>3) Déterminer les coordonnées du projeté orthogonal $H$ de $M$ sur $(\\Delta)$.',
        questions: [
          { label: '1) $\\vect{AM} \\wedge \\vec{u}$ : $(x \\,;\\, y \\,;\\, z) =$', type: 'tuple', reponse: w },
          { label: '2) $d(M, (\\Delta)) =$', type: 'number', reponse: radS(dist.m, dist.s), reponseTex: radTex(dist.m, dist.s) },
          { label: '3) $H =$', type: 'tuple', reponse: Hh }
        ],
        indices: [
          '$\\vec{u} \\wedge \\vec{v} = (yz\' - zy\' \\,;\\, zx\' - xz\' \\,;\\, xy\' - yx\')$ ; puis $d(M, (\\Delta)) = \\dfrac{\\|\\vect{AM} \\wedge \\vec{u}\\|}{\\|\\vec{u}\\|}$.',
          '$H = A + \\lambda\\vec{u}$ avec $\\vect{HM} \\cdot \\vec{u} = 0$, ce qui donne $\\lambda = \\dfrac{\\vect{AM} \\cdot \\vec{u}}{\\|\\vec{u}\\|^2}$.'
        ],
        solution: [
          '$\\vect{AM}' + t3(AM) + '$ et $\\vec{u}' + t3(u) + '$, donc $\\vect{AM} \\wedge \\vec{u} = ' + t3(w) + '$.',
          '$\\|\\vect{AM} \\wedge \\vec{u}\\| = \\sqrt{' + W2 + '}$ et $\\|\\vec{u}\\| = \\sqrt{' + uu + '}$, donc $d(M, (\\Delta)) = ' + (uu === 1 ? '\\sqrt{' + W2 + '}' : '\\sqrt{\\dfrac{' + W2 + '}{' + uu + '}}') + (uu === 1 && dist.m.equals(1) ? '' : ' = ' + radTex(dist.m, dist.s)) + '$.',
          '$\\vect{AM} \\cdot \\vec{u} = ' + dot(AM, u) + '$, donc $\\lambda = ' + (uu === 1 ? lam.tex() : '\\dfrac{' + dot(AM, u) + '}{' + uu + '}' + (lam.d === uu ? '' : ' = ' + lam.tex())) + '$ et $H = A + \\lambda\\vec{u}$, soit $H' + t3(Hh) + '$.'
        ],
        aide: 'Coordonnées : (1 ; -2 ; 3), fractions acceptées ; distance exacte, par exemple sqrt(14)/2.'
      };
    }
  });

  /* ================================================================== */
  /* Tle L et Tle S — Ajustement affine par la méthode de Mayer          */
  /* ================================================================== */
  var CTX_MAYER = [
    { intro: 'Le nombre $y$ d\'abonnés (en centaines) d\'une radio communautaire de Kolda a évolué ainsi en fonction du rang $x$ de l\'année :', rang: true, pente: [3, 4, 5], b: [10, 20], unite: 'centaines d\'abonnés' },
    { intro: 'Dans un champ d\'essai de Bambey, on a mesuré la quantité $x$ d\'engrais apportée (en dizaines de kg par hectare) et le rendement $y$ du mil (en quintaux par hectare) :', rang: false, dom: [1, 12], pente: [1, 2], b: [5, 9], unite: 'quintaux par hectare' },
    { intro: 'Au marché de Tilène, le prix $y$ (en centaines de F CFA) du kilogramme de viande de mouton a évolué ainsi en fonction du rang $x$ du mois :', rang: true, pente: [1, 2], b: [25, 30], unite: 'centaines de F CFA' }
  ];
  EM.gen.register({
    id: 'tl-stat-mayer',
    titre: 'Ajustement affine par la méthode de Mayer',
    chapitres: ['tl-statistiques', 'ts-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_MAYER), n = niveau === 1 ? 6 : 8, h = n / 2;
      var xs = ctx.rang ? EM.util.range(1, n) : rng.sample(EM.util.range(ctx.dom[0], ctx.dom[1]), n).sort(function (p, q) { return p - q; });
      var al = rng.pick(ctx.pente), be = rng.int(ctx.b[0], ctx.b[1]);
      var ys = xs.map(function (x) { return al * x + be + rng.int(-2, 2); });
      var moy = function (t) { return F(somme(t), t.length); };
      var G1 = [moy(xs.slice(0, h)), moy(ys.slice(0, h))], G2 = [moy(xs.slice(h)), moy(ys.slice(h))], G = [moy(xs), moy(ys)];
      var a = G2[1].sub(G1[1]).div(G2[0].sub(G1[0])), b = G1[1].sub(a.mul(G1[0]));
      var x0 = xs[n - 1] + (ctx.rang ? 2 : 1), y0 = a.mul(x0).add(b);
      trace('tl-stat-mayer', { niveau: niveau, xs: xs, ys: ys, x0: x0 });
      var tab = '$$\\begin{array}{|c|' + xs.map(function () { return 'c|'; }).join('') + '}\\hline x_i & ' + xs.join(' & ') + ' \\\\ \\hline y_i & ' + ys.join(' & ') + ' \\\\ \\hline\\end{array}$$';
      var gT = function (P) { return pt(P[0].isInt() || nb(P[0]).indexOf('dfrac') < 0 ? nb(P[0]) : P[0].tex() + ' \\approx ' + ap(P[0]), P[1].isInt() || nb(P[1]).indexOf('dfrac') < 0 ? nb(P[1]) : P[1].tex() + ' \\approx ' + ap(P[1])); };
      var aT = (a.isInt() || nb(a).indexOf('dfrac') < 0) ? nb(a) : a.tex() + ' \\approx ' + ap(a), bT = (b.isInt() || nb(b).indexOf('dfrac') < 0) ? nb(b) : b.tex() + ' \\approx ' + ap(b);
      var sol = [
        'On partage la série, rangée suivant les valeurs croissantes de $x$, en deux groupes de $' + h + '$ points.',
        'Premier groupe : $\\bar{x}_1 = \\dfrac{' + xs.slice(0, h).join(' + ') + '}{' + h + '}$ et $\\bar{y}_1 = \\dfrac{' + ys.slice(0, h).join(' + ') + '}{' + h + '}$, d\'où $G_1' + gT(G1) + '$.',
        'Second groupe : $\\bar{x}_2 = \\dfrac{' + xs.slice(h).join(' + ') + '}{' + h + '}$ et $\\bar{y}_2 = \\dfrac{' + ys.slice(h).join(' + ') + '}{' + h + '}$, d\'où $G_2' + gT(G2) + '$.',
        'La droite de Mayer est la droite $(G_1G_2)$ : $a = \\dfrac{y_{G_2} - y_{G_1}}{x_{G_2} - x_{G_1}} = ' + aT + '$ et $b = y_{G_1} - a\\,x_{G_1} = ' + bT + '$, soit $(G_1G_2) : y ' + (rd(a.value(), 2) === a.value() && rd(b.value(), 2) === b.value() ? '=' : '\\approx') + ' ' + (rd(a.value(), 2) === 1 ? '' : rd(a.value(), 2) === -1 ? '-' : ap(a)) + 'x' + (rd(b.value(), 2) === 0 ? '' : T.signed(rd(b.value(), 2))) + '$.'
      ];
      var qs = [
        { label: '$G_1$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: G1, tol: 0.01, reponseTex: gT(G1) },
        { label: '$G_2$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: G2, tol: 0.01, reponseTex: gT(G2) },
        { label: '$a \\approx$', type: 'number', reponse: a, tol: 0.01, reponseTex: aT },
        { label: '$b \\approx$', type: 'number', reponse: b, tol: 0.01, reponseTex: bT }
      ];
      var enonce = ctx.intro + tab;
      if (niveau === 1) {
        enonce += 'Déterminer les points moyens $G_1$ et $G_2$ des deux sous-nuages formés des ' + h + ' premiers et des ' + h + ' derniers points, puis une équation $y = ax + b$ de la droite de Mayer $(G_1G_2)$ (valeurs arrondies à $10^{-2}$ si nécessaire).';
      } else {
        qs.unshift({ label: 'Point moyen $G$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: G, tol: 0.01, reponseTex: gT(G) });
        qs.push({ label: 'Estimation de $y$ pour $x = ' + x0 + '$ :', type: 'number', reponse: y0, tol: 0.1, reponseTex: ap(y0, 1), unite: ctx.unite });
        enonce += '1) Calculer les coordonnées du point moyen $G$ du nuage.<br>2) Déterminer les points moyens $G_1$ et $G_2$ des sous-nuages formés des ' + h + ' premiers et des ' + h + ' derniers points, puis une équation $y = ax + b$ de la droite de Mayer $(G_1G_2)$.<br>' +
          '3) Vérifier que $G$ appartient à $(G_1G_2)$, puis estimer $y$ pour $x = ' + x0 + '$ à l\'aide de cet ajustement.';
        sol.unshift('Point moyen : $\\bar{x} = \\dfrac{' + somme(xs) + '}{' + n + '}$ et $\\bar{y} = \\dfrac{' + somme(ys) + '}{' + n + '}$, donc $G' + gT(G) + '$.');
        sol.push('$a\\bar{x} + b = ' + nb(a.mul(G[0]).add(b)) + ' = \\bar{y}$ : le point moyen $G$ appartient à la droite de Mayer (c\'est toujours le cas, car $G$ est le milieu de $[G_1G_2]$).');
        sol.push('Pour $x = ' + x0 + '$ : $y = ax + b \\approx ' + ap(a) + ' \\times ' + x0 + (rd(b.value(), 2) === 0 ? '' : T.signed(rd(b.value(), 2))) + ' \\approx ' + ap(y0, 1) + '$ ' + ctx.unite + '.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Range les points selon les $x$ croissants et coupe la série en deux groupes de même effectif ; calcule le point moyen de chaque groupe.',
          'La droite de Mayer passe par $G_1$ et $G_2$ : son coefficient directeur est $\\dfrac{y_{G_2} - y_{G_1}}{x_{G_2} - x_{G_1}}$.'
        ],
        solution: sol,
        aide: 'Points : (2 ; 15,33) ; valeurs arrondies à 0,01, fractions acceptées.'
      };
    }
  });

  /* ================================================================== */
  /* PROBLÈMES DE SYNTHÈSE TYPE BAC                                      */
  /* ================================================================== */
  function infChoix(s) { return s > 0 ? PINF : MINF; }

  /* ---------- Tle S : étude d'une fonction avec logarithme ---------- */
  EM.gen.register({
    id: 'ts-pb-etude-ln',
    titre: 'Problème : étude d\'une fonction avec logarithme, tangente et calcul d\'aire',
    chapitres: ['ts-logarithme', 'ts-derivabilite', 'ts-integrales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([1, 2, -1, -2]), k = rng.pick([-1, 1, 2]), xTe = rng.bool();
      var fTex = coefTex(a) + 'x(\\ln x' + T.signed(-k) + ')';
      var fdev = T.sum([{ c: a, v: 'x\\ln x' }, { c: -a * k, v: 'x' }]);
      var dTex = k === 1 ? coefTex(a) + '\\ln x' : a === 1 ? '\\ln x' + T.signed(1 - k) : coefTex(a) + '(\\ln x' + T.signed(1 - k) + ')', dS = S(a) + '*(ln(x)+' + S(1 - k) + ')';
      var x0 = eVal(1, k - 1), fx0 = eVal(-a, k - 1), mini = a > 0;
      var tg = xTe ? { tex: T.sum([{ c: a * (2 - k), v: 'x' }, { c: -a, v: 'e' }]), s: S(a * (2 - k)) + '*x-' + S(a) + '*e', at: 'e' }
        : { tex: T.poly([a * (1 - k), -a]), s: polyS([a * (1 - k), -a]), at: '1' };
      var rac = eVal(1, k), lo = k > 0 ? '1' : eTex(k), hi = k > 0 ? eTex(k) : '1';
      var sgn = k > 0 ? 1 : -1;
      var I = { tex: '\\dfrac{' + coefTex(sgn * (2 * k - 1)) + 'e^{' + (2 * k) + '}' + T.signed(sgn) + '}{4}', s: '(' + S(sgn * (2 * k - 1)) + '*e^(' + (2 * k) + ')+' + S(sgn) + ')/4' };
      var J = k > 0 ? '\\dfrac{e^{' + (2 * k) + '} - 1}{2}' : '\\dfrac{1 - e^{-2}}{2}';
      var aireV = Math.abs(a) * (Math.exp(2 * k) - 2 * k - 1) / 4;
      var aire = { tex: '\\dfrac{e^{' + (2 * k) + '}' + T.signed(-(2 * k + 1)) + '}{' + (4 / Math.abs(a)) + '}', s: S(Math.abs(a)) + '*(e^(' + (2 * k) + ')-' + S(2 * k + 1) + ')/4' };
      var integ = a * (1 + 2 * k - Math.exp(2 * k)) / 4 * (k > 0 ? 1 : -1); // ∫ de lo à hi
      var fN = function (x) { return a * x * (Math.log(x) - k); };
      trace('ts-pb-etude-ln', { niveau: niveau, a: a, k: k, xT: xTe ? Math.E : 1 });
      var tab = tabVar(['0', x0.tex, '+\\infty'], mini ? ['-', '+'] : ['+', '-'], ['0'], ['0', fx0.tex, a > 0 ? '+\\infty' : '-\\infty']);
      var solVar = [
        '<b>Dérivée.</b> $f = ' + (a === 1 ? '' : a === -1 ? '-' : a + ' ') + 'u \\times v$ avec $u(x) = x$ et $v(x) = \\ln x' + T.signed(-k) + '$ : $f\'(x) = ' + (a === 1 ? '' : coefTex(a) + '\\left[') + '1 \\times (\\ln x' + T.signed(-k) + ') + x \\times \\dfrac{1}{x}' + (a === 1 ? '' : '\\right]') + ' = ' + dTex + '$.',
        '$\\ln x' + T.signed(1 - k).replace(' + 0', '') + ' \\geq 0 \\iff \\ln x \\geq ' + (k - 1) + ' \\iff x \\geq ' + x0.tex + '$ (car $\\exp$ est croissante). ' + (a === 1 ? 'Donc' : 'Comme $' + a + (a > 0 ? ' > 0' : ' < 0') + '$,') + ' $f\'(x)$ est ' + (mini ? 'négative' : 'positive') + ' sur $]0 \\,;\\, ' + x0.tex + '[$ et ' + (mini ? 'positive' : 'négative') + ' sur $]' + x0.tex + ' \\,;\\, +\\infty[$.' + tab,
        '$f$ admet un ' + (mini ? 'minimum' : 'maximum') + ' en $x_0 = ' + x0.tex + '$ : $f(x_0) = ' + (a === 1 ? '' : T.num(a) + ' \\times ') + x0.tex + ' \\times \\left(' + (k - 1) + T.signed(-k) + '\\right) = ' + fx0.tex + '$.'
      ];
      var fig, qs, sol, enonce;
      var xmax = Math.max(Math.exp(k), xTe ? Math.E : 1, 1.4) * 1.25 + 0.3, Y = fenetreY([fN], 0.001, xmax, -12, 12);
      if (niveau === 1) {
        qs = [
          { label: '1) $D_f =$', type: 'interval', reponse: { a: 0, b: Infinity, ouvA: true, ouvB: true } },
          qcm(rng, '2) $' + lim('0^+') + ' f(x) =$', ZERO, [PINF, MINF, '$' + T.num(-a * k) + '$']),
          qcm(rng, '2) $' + lim('+\\infty') + ' f(x) =$', infChoix(a), [PINF, MINF, ZERO]),
          { label: '3) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [0.5, 4] },
          { label: '3) $x_0 =$', type: 'number', reponse: x0.s, reponseTex: x0.tex },
          { label: '3) $f(x_0) =$', type: 'number', reponse: fx0.s, reponseTex: fx0.tex }
        ];
        enonce = 'Soit $f$ la fonction définie par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé.<br>' +
          '1) Déterminer l\'ensemble de définition $D_f$ de $f$.<br>2) Calculer les limites de $f$ en $0$ et en $+\\infty$.<br>' +
          '3) Calculer $f\'(x)$ pour $x \\in D_f$, étudier son signe et dresser le tableau de variation de $f$. Préciser l\'abscisse $x_0$ de l\'extremum de $f$ et la valeur $f(x_0)$.';
        sol = [
          '$\\ln x$ n\'existe que pour $x > 0$ : $D_f = ]0 \\,;\\, +\\infty[$.',
          '<b>En $0^+$.</b> $f(x) = ' + fdev + '$. Or $' + lim('0^+') + ' x\\ln x = 0$ (limite de référence) et $' + lim('0^+') + ' x = 0$, donc $' + lim('0^+') + ' f(x) = 0$.',
          '<b>En $+\\infty$.</b> $' + lim('+\\infty') + ' x = +\\infty$ et $' + lim('+\\infty') + ' (\\ln x' + T.signed(-k) + ') = +\\infty$ ; ' + (a === 1 ? 'par produit' : 'par produit, et comme $' + a + (a > 0 ? ' > 0' : ' < 0') + '$') + ', $' + lim('+\\infty') + ' f(x) = ' + (a > 0 ? '+' : '-') + '\\infty$.'
        ].concat(solVar);
        fig = graphe(-0.3, xmax, Y[0], Y[1], [{ f: fN, from: 0.001 }]);
      } else {
        qs = [
          { label: '1) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [0.5, 4] },
          { label: '1) Valeur de l\'extremum :', type: 'number', reponse: fx0.s, reponseTex: fx0.tex },
          { label: '2) $(T) : y =$', type: 'expr', reponse: tg.s, reponseTex: tg.tex },
          { label: '3) Solution de $f(x) = 0$ : $x =$', type: 'number', reponse: rac.s, reponseTex: rac.tex },
          { label: '4a) $I =$', type: 'number', reponse: I.s, reponseTex: I.tex },
          { label: '4b) $\\mathcal{A} =$', type: 'number', reponse: aire.s, reponseTex: aire.tex + ' \\approx ' + ap(aireV), tol: 0.01, unite: 'cm²' }
        ];
        enonce = 'Soit $f$ la fonction définie sur $]0 \\,;\\, +\\infty[$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé d\'unité graphique $1$ cm. On admet que $' + lim('0^+') + ' f(x) = 0$.<br>' +
          '1) Calculer $f\'(x)$, étudier son signe et dresser le tableau de variation de $f$ ; préciser la nature et la valeur de son extremum.<br>' +
          '2) Déterminer une équation de la tangente $(T)$ à $(\\mathcal{C})$ au point d\'abscisse $' + tg.at + '$.<br>' +
          '3) Résoudre dans $]0 \\,;\\, +\\infty[$ l\'équation $f(x) = 0$.<br>' +
          '4) a) À l\'aide d\'une intégration par parties, calculer $I = \\displaystyle\\int_{' + lo + '}^{' + hi + '} x\\ln x\\,dx$.<br>' +
          'b) En déduire l\'aire $\\mathcal{A}$, en cm², du domaine plan limité par $(\\mathcal{C})$, l\'axe des abscisses et les droites d\'équations $x = ' + lo + '$ et $x = ' + hi + '$.';
        var fTt = xTe ? (a * (1 - k) === 0 ? '0' : eVal(a * (1 - k), 1).tex) : T.num(-a * k);
        sol = solVar.concat([
          '<b>Tangente.</b> $(T) : y = f\'(' + tg.at + ')(x - ' + tg.at + ') + f(' + tg.at + ')$ avec $f(' + tg.at + ') = ' + fTt + '$ et $f\'(' + tg.at + ') = ' + (a * (xTe ? 2 - k : 1 - k)) + '$, d\'où $(T) : y = ' + tg.tex + '$.',
          '<b>Équation.</b> Pour $x > 0$ : $f(x) = 0 \\iff ' + coefTex(a) + 'x(\\ln x' + T.signed(-k) + ') = 0 \\iff \\ln x = ' + k + '$ (car $x \\neq 0$) $\\iff x = ' + rac.tex + '$.',
          '<b>Intégration par parties.</b> On pose $u(x) = \\ln x$ et $v\'(x) = x$, donc $u\'(x) = \\dfrac{1}{x}$ et $v(x) = \\dfrac{x^2}{2}$ : $I = \\left[\\dfrac{x^2}{2}\\ln x\\right]_{' + lo + '}^{' + hi + '} - \\displaystyle\\int_{' + lo + '}^{' + hi + '} \\dfrac{x}{2}\\,dx = \\left[\\dfrac{x^2}{2}\\ln x - \\dfrac{x^2}{4}\\right]_{' + lo + '}^{' + hi + '} = ' + I.tex + '$.',
          '<b>Aire.</b> Sur $[' + lo + ' \\,;\\, ' + hi + ']$, $\\ln x' + T.signed(-k) + (k > 0 ? ' \\leq 0' : ' \\geq 0') + '$, donc $f(x)$ a le signe de $' + (k > 0 ? -a : a) + '$ : la courbe est ' + ((k > 0 ? -a : a) > 0 ? 'au-dessus' : 'en dessous') + ' de l\'axe des abscisses.',
          '$\\displaystyle\\int_{' + lo + '}^{' + hi + '} f(x)\\,dx = ' + coefTex(a) + '\\left(I' + T.mono(-k, '\\displaystyle\\int_{' + lo + '}^{' + hi + '} x\\,dx') + '\\right)$ avec $\\displaystyle\\int_{' + lo + '}^{' + hi + '} x\\,dx = ' + J + '$ ; on trouve $\\displaystyle\\int_{' + lo + '}^{' + hi + '} f(x)\\,dx \\approx ' + ap(integ) + '$.',
          'Avec une unité de $1$ cm : $\\mathcal{A} = \\left|\\displaystyle\\int_{' + lo + '}^{' + hi + '} f(x)\\,dx\\right| = ' + aire.tex + ' \\approx ' + ap(aireV) + '$ cm².'
        ]);
        var lb = Math.min(1, Math.exp(k)), hb = Math.max(1, Math.exp(k));
        fig = graphe(-0.3, xmax, Y[0], Y[1], [{ f: fN, from: 0.001 }], { aire: { f: fN, a: lb, b: hb } });
      }
      return {
        enonce: enonce,
        figure: fig,
        questions: qs,
        indices: [
          'Pour dériver, écris $f(x) = ' + coefTex(a) + 'x \\times (\\ln x' + T.signed(-k) + ')$ et utilise $(uv)\' = u\'v + uv\'$ ; pour les limites, souviens-toi que $' + lim('0^+') + ' x\\ln x = 0$.',
          niveau === 1 ? 'Le signe de $f\'(x)$ dépend de celui de $\\ln x' + (k - 1 ? T.signed(1 - k) : '') + '$ : compare $x$ à $' + x0.tex + '$.'
            : 'Pour l\'intégrale, pose $u(x) = \\ln x$ et $v\'(x) = x$. L\'aire est la valeur absolue de l\'intégrale de $f$ entre les bornes.'
        ],
        solution: sol,
        aide: 'Valeurs exactes : tu peux écrire e^2, -2e^(-1), (e^4-5)/4… ; intervalle : ]0 ; +inf[ ; aire : valeur exacte ou arrondie à 0,01.'
      };
    }
  });

  /* ---------- Tle S : étude d'une fonction avec exponentielle et asymptote oblique ---------- */
  EM.gen.register({
    id: 'ts-pb-etude-exp',
    titre: 'Problème : fonction avec exponentielle, asymptote oblique, tangente et aire',
    chapitres: ['ts-exponentielle', 'ts-limites', 'ts-integrales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var v = rng.pick([1, -1]), sg = rng.pick([1, -1]), c = rng.pick([2, 3, 4]), p = rng.int(-3, 3), u = rng.pick([1, 2]);
      var m = sg * v, q = sg * p, K = sg * c;
      var ex = v > 0 ? 'e^{-x}' : 'e^{x}', exS = v > 0 ? 'e^(-x)' : 'e^(x)';
      var fTex = T.sum([{ c: m, v: 'x' }, { c: q }, { c: K, v: ex }]);
      var asy = { tex: T.poly([m, q]), s: polyS([m, q]) };
      var dTex = T.sum([{ c: m }, { c: -v * K, v: ex }]), dS = S(m) + '-' + S(v * K) + '*' + exS;
      var x0 = { tex: (v > 0 ? '' : '-') + '\\ln ' + c, s: S(v) + '*ln(' + c + ')' };
      var fx0 = { tex: (sg > 0 ? '\\ln ' + c : '-\\ln ' + c) + (p + 1 ? T.signed(sg * (p + 1)) : ''), s: S(sg) + '*(ln(' + c + ')+' + S(p + 1) + ')' };
      var mini = sg > 0, cote = v > 0 ? '+\\infty' : '-\\infty', autre = v > 0 ? '-\\infty' : '+\\infty';
      var tg = [sg * v * (1 - c), sg * (p + c)];
      var optA = rng.bool();
      var bornes = optA ? (v > 0 ? ['0', '\\ln ' + c] : ['-\\ln ' + c, '0']) : (v > 0 ? ['0', '1'] : ['-1', '0']);
      var aU = optA ? c - 1 : c * (1 - Math.exp(-1));
      var aire = optA ? { tex: String(u * u * (c - 1)), s: S(u * u * (c - 1)) } : { tex: (u * u * c) + '\\left(1 - e^{-1}\\right)', s: S(u * u * c) + '*(1-e^(-1))' };
      var fN = function (x) { return m * x + q + K * Math.exp(-v * x); }, gN = function (x) { return m * x + q; };
      trace('ts-pb-etude-exp', { niveau: niveau, v: v, sg: sg, c: c, p: p, u: u, optA: optA });
      var xs = v > 0 ? ['-\\infty', x0.tex, '+\\infty'] : ['-\\infty', x0.tex, '+\\infty'];
      var tab = tabVar(xs, mini ? ['-', '+'] : ['+', '-'], ['0'], [sg > 0 ? '+\\infty' : '-\\infty', fx0.tex, sg > 0 ? '+\\infty' : '-\\infty']);
      var solLim = [
        '<b>En $' + cote + '$.</b> $' + lim(cote) + ' ' + ex + ' = 0$, donc $' + lim(cote) + ' f(x) = ' + lim(cote) + ' (' + asy.tex + ') = ' + (sg > 0 ? '+' : '-') + '\\infty$.',
        '<b>En $' + autre + '$.</b> On factorise : $f(x) = ' + ex + '\\left(' + K + ' + (' + asy.tex + ')' + (v > 0 ? 'e^{x}' : 'e^{-x}') + '\\right)$. Par croissance comparée, $' + lim(autre) + ' x' + (v > 0 ? 'e^{x}' : 'e^{-x}') + ' = 0$ et $' + lim(autre) + ' ' + (v > 0 ? 'e^{x}' : 'e^{-x}') + ' = 0$ : la parenthèse tend vers $' + K + '$ et $' + lim(autre) + ' ' + ex + ' = +\\infty$, donc $' + lim(autre) + ' f(x) = ' + (sg > 0 ? '+' : '-') + '\\infty$.'
      ];
      var solAsy = '<b>Asymptote.</b> $f(x) - (' + asy.tex + ') = ' + K + ex + '$ et $' + lim(cote) + ' ' + K + ex + ' = 0$ : la droite $\\Delta : y = ' + asy.tex + '$ est asymptote oblique à $(\\mathcal{C})$ en $' + cote + '$.';
      var solPos = 'Pour tout réel $x$, $' + ex + ' > 0$, donc $f(x) - (' + asy.tex + ') = ' + K + ex + '$ est ' + (sg > 0 ? 'positif' : 'négatif') + ' : $(\\mathcal{C})$ est ' + (sg > 0 ? 'au-dessus' : 'en dessous') + ' de $\\Delta$.';
      var solVar = [
        '<b>Dérivée.</b> $(' + ex + ')\' = ' + (v > 0 ? '-e^{-x}' : 'e^{x}') + '$, donc $f\'(x) = ' + dTex + (m === 1 ? '' : ' = -\\left(1 - ' + c + ex + '\\right)') + '$.',
        '$1 - ' + c + ex + ' = 0 \\iff ' + ex + ' = \\dfrac{1}{' + c + '} \\iff x = ' + x0.tex + '$. On en déduit le signe de $f\'$, puis le tableau :' + tab,
        '$f$ admet un ' + (mini ? 'minimum' : 'maximum') + ' en $x_0 = ' + x0.tex + '$ : $f(x_0) = ' + T.sum([{ c: m, v: '(' + x0.tex + ')' }, { c: q }]) + ' + ' + T.par(K) + ' \\times \\dfrac{1}{' + c + '} = ' + fx0.tex + '$.'
      ];
      var X0 = v > 0 ? -2.5 : -5.5, X1 = v > 0 ? 5.5 : 2.5, Y = fenetreY([fN, gN], X0, X1, -9, 9);
      var qs, enonce, sol, fig;
      var intro = 'Soit $f$ la fonction définie sur $\\R$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé d\'unité graphique $' + u + '$ cm.<br>';
      if (niveau === 1) {
        qs = [
          qcm(rng, '1) $' + lim('+\\infty') + ' f(x) =$', infChoix(sg), [PINF, MINF, '$' + q + '$', ZERO]),
          qcm(rng, '1) $' + lim('-\\infty') + ' f(x) =$', infChoix(sg), [PINF, MINF, '$' + q + '$', ZERO]),
          { label: '2) $\\Delta : y =$', type: 'expr', reponse: asy.s, reponseTex: asy.tex },
          { label: '3) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex },
          { label: '3) $x_0 =$', type: 'number', reponse: x0.s, reponseTex: x0.tex },
          { label: '3) $f(x_0) =$', type: 'number', reponse: fx0.s, reponseTex: fx0.tex }
        ];
        enonce = intro + '1) Calculer les limites de $f$ en $-\\infty$ et en $+\\infty$.<br>2) Montrer que $(\\mathcal{C})$ admet une asymptote oblique $\\Delta$ en $' + cote + '$, dont on donnera une équation.<br>' +
          '3) Calculer $f\'(x)$, étudier son signe et dresser le tableau de variation de $f$. Préciser l\'abscisse $x_0$ de l\'extremum de $f$ et la valeur $f(x_0)$.';
        sol = solLim.concat([solAsy]).concat(solVar);
        fig = graphe(X0, X1, Y[0], Y[1], [{ f: fN }]);
      } else {
        qs = [
          { label: '1) $\\Delta : y =$', type: 'expr', reponse: asy.s, reponseTex: asy.tex },
          qcm(rng, '1) La courbe $(\\mathcal{C})$ est :', sg > 0 ? 'au-dessus de $\\Delta$' : 'en dessous de $\\Delta$', ['au-dessus de $\\Delta$', 'en dessous de $\\Delta$', 'tantôt au-dessus, tantôt en dessous de $\\Delta$']),
          { label: '2) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex },
          { label: '2) Valeur de l\'extremum :', type: 'number', reponse: fx0.s, reponseTex: fx0.tex },
          { label: '3) $(T) : y =$', type: 'expr', reponse: polyS(tg), reponseTex: T.poly(tg) },
          { label: '4) $\\mathcal{A} =$', type: 'number', reponse: aire.s, reponseTex: aire.tex + (optA ? '' : ' \\approx ' + ap(u * u * aU)), tol: 0.01, unite: 'cm²' }
        ];
        enonce = intro + '1) Montrer que $(\\mathcal{C})$ admet une asymptote oblique $\\Delta$ en $' + cote + '$, puis étudier la position de $(\\mathcal{C})$ par rapport à $\\Delta$.<br>' +
          '2) Calculer $f\'(x)$, dresser le tableau de variation de $f$ et préciser la nature et la valeur de son extremum.<br>' +
          '3) Déterminer une équation de la tangente $(T)$ à $(\\mathcal{C})$ au point d\'abscisse $0$.<br>' +
          '4) Calculer, en cm², l\'aire $\\mathcal{A}$ du domaine plan limité par $(\\mathcal{C})$, la droite $\\Delta$ et les droites d\'équations $x = ' + bornes[0] + '$ et $x = ' + bornes[1] + '$.';
        var prim = v > 0 ? '-' + c + 'e^{-x}' : c + 'e^{x}';
        sol = [solAsy, solPos].concat(solVar).concat([
          '<b>Tangente en $0$.</b> $f(0) = ' + (q + K) + '$ et $f\'(0) = ' + (m - v * K) + '$, donc $(T) : y = ' + T.poly(tg) + '$.',
          '<b>Aire.</b> L\'écart entre $(\\mathcal{C})$ et $\\Delta$ est $|f(x) - (' + asy.tex + ')| = ' + c + ex + '$. En unités d\'aire : $\\displaystyle\\int_{' + bornes[0] + '}^{' + bornes[1] + '} ' + c + ex + '\\,dx = \\left[' + prim + '\\right]_{' + bornes[0] + '}^{' + bornes[1] + '} = ' + (optA ? (c - 1) : c + '\\left(1 - e^{-1}\\right)') + '$ u.a.',
          (u === 1 ? 'Une unité d\'aire vaut $1$ cm², donc' : 'Une unité d\'aire vaut $' + u + ' \\times ' + u + ' = ' + (u * u) + '$ cm², donc') + ' $\\mathcal{A} = ' + aire.tex + (optA ? '' : ' \\approx ' + ap(u * u * aU)) + '$ cm².'
        ]);
        var bN = optA ? (v > 0 ? [0, Math.log(c)] : [-Math.log(c), 0]) : (v > 0 ? [0, 1] : [-1, 0]);
        fig = graphe(X0, X1, Y[0], Y[1], [{ f: fN }], { droites: [[[0, q], [1, m + q]]], aire: { f: fN, g: gN, a: bN[0], b: bN[1] } });
      }
      return {
        enonce: enonce,
        figure: fig,
        questions: qs,
        indices: [
          'En $' + cote + '$, $' + ex + '$ tend vers $0$ : $f(x)$ se comporte comme $' + asy.tex + '$. En $' + autre + '$, mets $' + ex + '$ en facteur et utilise les croissances comparées.',
          '$f\'(x) = ' + (m === 1 ? '1 - ' + c + ex : '-(1 - ' + c + ex + ')') + '$ s\'annule quand $' + ex + ' = \\dfrac{1}{' + c + '}$. Pour l\'aire, intègre l\'écart $f(x) - (' + asy.tex + ')$ et multiplie par l\'aire d\'une unité.'
        ],
        solution: sol,
        aide: 'Valeurs exactes : ln(3), 2 - ln(2), 4(1-e^(-1))… ; expressions : 1 - 3e^(-x).'
      };
    }
  });

  /* ---------- 1ère S et Tle S : fonction rationnelle ---------- */
  EM.gen.register({
    id: '1s-pb-rationnelle',
    titre: 'Problème : fonction rationnelle, asymptotes, extremums et centre de symétrie',
    chapitres: ['1s-etude-fonctions', '1s-derivation', 'ts-limites', 'ts-derivabilite'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var al = rng.pick([1, -1, 2, -2]), k = rng.int(1, 3), d = rng.int(-3, 3), be = rng.int(-4, 4), ga = al * k * k;
      var A = al, B = be - al * d, C = ga - be * d, c0 = al * d + be;
      var dT = T.poly([1, -d]), dS0 = polyS([1, -d]);
      var fTex = '\\dfrac{' + T.poly([A, B, C]) + '}{' + dT + '}';
      var decTex = T.poly([al, be]) + (ga > 0 ? ' + ' : ' - ') + '\\dfrac{' + Math.abs(ga) + '}{' + dT + '}';
      var Np = [al, -2 * al * d, al * d * d - ga], den2 = d === 0 ? 'x^2' : '(' + dT + ')^2';
      var dTex = '\\dfrac{' + T.poly(Np) + '}{' + den2 + '}', dS = polyS(Np) + '/' + dS0 + '^2';
      var x1 = d - k, x2 = d + k, y1 = c0 - 2 * al * k, y2 = c0 + 2 * al * k;
      var maxX = al > 0 ? x1 : x2, maxV = al > 0 ? y1 : y2, minX = al > 0 ? x2 : x1, minV = al > 0 ? y2 : y1;
      var asy = { tex: T.poly([al, be]), s: polyS([al, be]) };
      var info = { niveau: niveau, A: A, B: B, C: C, d: d };
      trace('1s-pb-rationnelle', info);
      var fN = function (x) { return (A * x * x + B * x + C) / (x - d); }, gN = function (x) { return al * x + be; };
      var infG = al > 0 ? '-\\infty' : '+\\infty', infD = al > 0 ? '+\\infty' : '-\\infty';
      var tab = tabVar(['-\\infty', String(x1), String(d), String(x2), '+\\infty'], al > 0 ? ['+', '-', '-', '+'] : ['-', '+', '+', '-'], ['0', '\\|', '0'],
        [infG, String(y1), infG + ' \\;\\|\\; ' + infD, String(y2), infD]);
      var X0 = d - 3 * k - 1.5, X1 = d + 3 * k + 1.5, Y = fenetreY([fN, gN], X0, X1, c0 - 6 * Math.abs(al) * k - 4, c0 + 6 * Math.abs(al) * k + 4);
      var fig = graphe(X0, X1, Y[0], Y[1], [{ f: fN, to: d - 0.02 }, { f: fN, from: d + 0.02 }]);
      var sDecomp = 'On écrit $(\\alpha x + \\beta)(' + dT + ') + \\gamma = \\alpha x^2 + (\\beta' + T.mono(-d, '\\alpha') + ')x' + T.mono(-d, '\\beta') + ' + \\gamma$. Par identification avec $' + T.poly([A, B, C]) + '$ : $\\alpha = ' + al + '$, $\\beta = ' + be + '$, $\\gamma = ' + ga + '$, soit $f(x) = ' + decTex + '$.';
      var sAV = 'En $x = ' + d + '$, le numérateur vaut $' + ga + ' \\neq 0$ et le dénominateur s\'annule : $' + lim(d + '^+') + ' f(x) = ' + (ga > 0 ? '+' : '-') + '\\infty$ et $' + lim(d + '^-') + ' f(x) = ' + (ga > 0 ? '-' : '+') + '\\infty$. La droite d\'équation $x = ' + d + '$ est asymptote verticale.';
      var sAO = '$f(x) - (' + asy.tex + ') = ' + fracSigne(ga, dT, true) + '$ tend vers $0$ en $\\pm\\infty$ : la droite $\\Delta : y = ' + asy.tex + '$ est asymptote oblique.';
      var sDer = '$f\'(x) = \\dfrac{(' + T.poly([2 * A, B]) + ')(' + dT + ') - (' + T.poly([A, B, C]) + ')}{' + den2 + '} = ' + dTex + ' = \\dfrac{' + coefTex(al) + (x1 === 0 ? 'x' + T.xMinus(x2) : x2 === 0 ? 'x' + T.xMinus(x1) : T.xMinus(x1) + T.xMinus(x2)) + '}{' + den2 + '}$.';
      var sVar = 'Le dénominateur est positif : $f\'(x)$ a le signe de $' + coefTex(al) + T.xMinus(x1) + T.xMinus(x2) + '$, qui est celui de $' + al + '$ à l\'extérieur des racines $' + x1 + '$ et $' + x2 + '$.' + tab;
      var sExt = '$f$ admet un maximum local $f(' + maxX + ') = ' + maxV + '$ et un minimum local $f(' + minX + ') = ' + minV + '$ (on peut utiliser $f(x) = ' + decTex + '$ pour les calculer).';
      var qs, enonce, sol = [];
      if (niveau === 1) {
        qs = [
          { label: '1) Asymptote verticale : $x =$', type: 'number', reponse: d },
          { label: '2) $(\\alpha \\,;\\, \\beta \\,;\\, \\gamma) =$', type: 'tuple', reponse: [al, be, ga] },
          { label: '2) $\\Delta : y =$', type: 'expr', reponse: asy.s, reponseTex: asy.tex, forme: 'somme' },
          { label: '3) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [d + 0.5, d + 4] },
          { label: '3) Abscisses des extremums :', type: 'set', reponse: [x1, x2] }
        ];
        enonce = 'Soit $f$ la fonction définie par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative.<br>' +
          '1) Déterminer l\'ensemble de définition de $f$ et montrer que $(\\mathcal{C})$ admet une asymptote verticale.<br>' +
          '2) Déterminer les réels $\\alpha$, $\\beta$, $\\gamma$ tels que $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{' + dT + '}$ ; en déduire que $(\\mathcal{C})$ admet une asymptote oblique $\\Delta$.<br>' +
          '3) Calculer $f\'(x)$, étudier son signe et dresser le tableau de variation de $f$ ; donner les abscisses de ses extremums.';
        sol = ['$f(x)$ existe si et seulement si $' + dT + ' \\neq 0$ : $D_f = \\R \\setminus \\{' + d + '\\}$.', sAV, sDecomp, sAO, sDer, sVar, sExt];
      } else if (niveau === 2) {
        qs = [
          { label: '1) $(\\alpha \\,;\\, \\beta \\,;\\, \\gamma) =$', type: 'tuple', reponse: [al, be, ga] },
          qcm(rng, '2) $' + lim(d + '^+') + ' f(x) =$', ga > 0 ? PINF : MINF, [PINF, MINF, '$' + c0 + '$', ZERO]),
          { label: '3) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [d + 0.5, d + 4] },
          { label: '3) Maximum local :', type: 'number', reponse: maxV },
          { label: '3) Minimum local :', type: 'number', reponse: minV },
          { label: '4) Centre de symétrie $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [d, c0] }
        ];
        enonce = 'Soit $f$ la fonction définie sur $\\R \\setminus \\{' + d + '\\}$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé.<br>' +
          '1) Déterminer les réels $\\alpha$, $\\beta$, $\\gamma$ tels que $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{' + dT + '}$.<br>' +
          '2) Calculer les limites de $f$ en $' + d + '$ et en $\\pm\\infty$ ; en déduire les asymptotes de $(\\mathcal{C})$.<br>' +
          '3) Calculer $f\'(x)$ et dresser le tableau de variation de $f$ ; préciser ses extremums locaux.<br>' +
          '4) Montrer que le point $\\Omega$, intersection des deux asymptotes, est centre de symétrie de $(\\mathcal{C})$.';
        sol = [sDecomp, sAV, '$' + lim('+\\infty') + ' f(x) = ' + (al > 0 ? '+' : '-') + '\\infty$ et $' + lim('-\\infty') + ' f(x) = ' + (al > 0 ? '-' : '+') + '\\infty$ (comportement de $' + T.poly([al, 0]) + '$). ' + sAO, sDer, sVar, sExt,
          'Les asymptotes se coupent en $\\Omega(' + d + ' \\,;\\, ' + c0 + ')$. Pour $h \\neq 0$ : $f(' + d + ' + h)' + (c0 ? T.signed(-c0) : '') + ' = ' + T.mono(al, 'h', true) + fracSigne(ga, 'h') + '$, expression impaire en $h$ ; donc $f(' + d + ' - h) + f(' + d + ' + h) = 2 \\times ' + T.par(c0) + '$ : $\\Omega$ est centre de symétrie de $(\\mathcal{C})$.'];
      } else {
        var cas = rng.pick([0, 1, 2]), mm;
        if (cas === 0) mm = c0 + (Math.abs(2 * al * k) > 1 ? rng.int(-1, 1) : 0);
        else if (cas === 1) mm = rng.pick([y1, y2]);
        else mm = rng.pick([Math.min(y1, y2) - rng.int(1, 4), Math.max(y1, y2) + rng.int(1, 4)]);
        var Mx = Math.min(y1, y2), Mn = Math.max(y1, y2);
        var nbS = mm < Mx || mm > Mn ? 2 : mm === Mx || mm === Mn ? 1 : 0;
        info.m = mm;
        var NOMS = ['aucune solution', 'une seule solution', 'deux solutions', 'trois solutions'];
        var bMax = al > 0 ? ']-\\infty \\,;\\, ' + d + '[' : ']' + d + ' \\,;\\, +\\infty[', bMin = al > 0 ? ']' + d + ' \\,;\\, +\\infty[' : ']-\\infty \\,;\\, ' + d + '[';
        var t = be - mm, qd = [al, t - al * d, ga - d * t], disc = (t - al * d) * (t - al * d) - 4 * al * (ga - d * t);
        qs = [
          { label: '1) $\\Delta : y =$', type: 'expr', reponse: asy.s, reponseTex: asy.tex, forme: 'somme' },
          qcm(rng, '1) Sur $]' + d + ' \\,;\\, +\\infty[$, la courbe $(\\mathcal{C})$ est :', ga > 0 ? 'au-dessus de $\\Delta$' : 'en dessous de $\\Delta$', ['au-dessus de $\\Delta$', 'en dessous de $\\Delta$']),
          { label: '2) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [d + 0.5, d + 4] },
          { label: '2) Maximum local :', type: 'number', reponse: maxV },
          { label: '2) Minimum local :', type: 'number', reponse: minV },
          qcm(rng, '3) L\'équation $f(x) = ' + mm + '$ admet :', NOMS[nbS], NOMS)
        ];
        enonce = 'Soit $f$ la fonction définie sur $\\R \\setminus \\{' + d + '\\}$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative.<br>' +
          '1) Montrer que $(\\mathcal{C})$ admet une asymptote oblique $\\Delta$ et étudier la position de $(\\mathcal{C})$ par rapport à $\\Delta$ sur $]' + d + ' \\,;\\, +\\infty[$.<br>' +
          '2) Calculer $f\'(x)$, dresser le tableau de variation de $f$ et préciser ses extremums locaux.<br>' +
          '3) Déterminer, suivant le tableau de variation, le nombre de solutions de l\'équation $f(x) = ' + mm + '$.';
        var expl;
        if (nbS === 0) expl = '$' + Mx + ' < ' + mm + ' < ' + Mn + '$ : sur $' + bMax + '$ on a $f(x) \\leq ' + Mx + ' < ' + mm + '$ et sur $' + bMin + '$ on a $f(x) \\geq ' + Mn + ' > ' + mm + '$ : l\'équation n\'a aucune solution.';
        else if (nbS === 1) expl = '$' + mm + '$ est la valeur d\'un extremum local, atteinte une seule fois ; sur l\'autre intervalle, $f$ ne prend pas cette valeur (car $' + Mx + ' < ' + Mn + '$) : une seule solution.';
        else expl = mm < Mx ? '$' + mm + ' < ' + Mx + '$ : sur $' + bMax + '$, $f$ prend deux fois la valeur $' + mm + '$ (une fois avant et une fois après son maximum) ; sur $' + bMin + '$, $f(x) \\geq ' + Mn + ' > ' + mm + '$ : deux solutions.'
          : '$' + mm + ' > ' + Mn + '$ : sur $' + bMin + '$, $f$ prend deux fois la valeur $' + mm + '$ (une fois avant et une fois après son minimum) ; sur $' + bMax + '$, $f(x) \\leq ' + Mx + ' < ' + mm + '$ : deux solutions.';
        sol = [sDecomp, sAO, 'Sur $]' + d + ' \\,;\\, +\\infty[$, $' + dT + ' > 0$ donc $f(x) - (' + asy.tex + ')$ a le signe de $' + ga + '$ : $(\\mathcal{C})$ est ' + (ga > 0 ? 'au-dessus' : 'en dessous') + ' de $\\Delta$.', sDer, sVar, sExt,
          'Sur $' + bMax + '$, $f$ admet un maximum égal à $' + Mx + '$ ; sur $' + bMin + '$, un minimum égal à $' + Mn + '$, et $' + Mx + ' < ' + Mn + '$. ' + expl,
          'Vérification : $f(x) = ' + mm + ' \\iff ' + T.poly(qd) + ' = 0$ (avec $x \\neq ' + d + '$), de discriminant $' + disc + (disc > 0 ? ' > 0' : disc === 0 ? '' : ' < 0') + '$.'];
      }
      return {
        enonce: enonce,
        figure: fig,
        questions: qs,
        indices: [
          'Développe $(\\alpha x + \\beta)(' + dT + ') + \\gamma$ et identifie avec le numérateur ; la partie $\\dfrac{\\gamma}{' + dT + '}$ tend vers $0$ en $\\pm\\infty$.',
          'Dérive comme un quotient : $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ ; le signe de $f\'$ est celui du trinôme du numérateur.'
        ],
        solution: sol,
        aide: 'Triplet : (1 ; -2 ; 4) ; expressions : 2x - 1 ou (x^2 - 4x)/(x - 2)^2 ; ensemble : -1 ; 3.'
      };
    }
  });

  /* ---------- Tle S : suite u(n+1) = a·u(n) + b en contexte ---------- */
  var CTX_SUITES = [
    function (rng) {
      var q = rng.pick([F(1, 2), F(3, 5), F(3, 4), F(4, 5)]), D = rng.pick([10, 20, 30, 40]), l = F(D).div(F(1).sub(q));
      return { q: q, b: F(D), u0: F(D), l: l, eps: l.mul(F(1, 20)), unite: 'mg',
        texte: 'On injecte à un malade, à l\'hôpital de Fann, une dose de $' + D + '$ mg d\'un médicament. Chaque heure, son organisme élimine $' + F(1).sub(q).mul(100).n + '$ % de la quantité présente dans le sang, puis on lui injecte à nouveau $' + D + '$ mg. ' +
          'On note $u_n$ la quantité de médicament (en mg) présente dans le sang juste après la $(n + 1)$-ième injection : $u_0 = ' + D + '$.',
        seuil: 'Le traitement est jugé efficace dès que la quantité de médicament dépasse $95$ % de $\\ell$. Déterminer le plus petit entier $n$ tel que $u_n > 0{,}95\\,\\ell$.',
        nature: 'Qu\'advient-il de la quantité de médicament au bout d\'un grand nombre d\'injections ?' };
    },
    function (rng) {
      var q = rng.pick([F(4, 5), F(9, 10), F(3, 4)]), l = F(rng.pick([2000, 3000, 4000, 5000, 12000, 15000])), u0 = rng.pick([6000, 8000, 10000]);
      return { q: q, b: l.mul(F(1).sub(q)), u0: F(u0), l: l, eps: F(50), unite: 'tonnes',
        texte: 'Dans le lac de Guiers, le stock de poissons est estimé à $' + T.num(u0) + '$ tonnes en 2025 (données fictives). Chaque année, la pêche prélève $' + F(1).sub(q).mul(100).n + '$ % du stock, et la reproduction apporte $' + T.num(l.mul(F(1).sub(q)).value()) + '$ tonnes de poissons. ' +
          'On note $u_n$ le stock (en tonnes) en l\'année $2025 + n$ : $u_0 = ' + T.num(u0) + '$.',
        seuil: 'Déterminer le plus petit entier $n$ à partir duquel le stock diffère de sa limite $\\ell$ de moins de $50$ tonnes, c\'est-à-dire tel que $|u_n - \\ell| < 50$.',
        nature: 'Comment le stock évolue-t-il à long terme ?' };
    },
    function (rng) {
      var q = rng.pick([F(4, 5), F(9, 10), F(7, 10)]), l = F(rng.pick([200, 300, 400, 500])), u0 = rng.pick([50, 80, 100, 700, 900]);
      return { q: q, b: l.mul(F(1).sub(q)), u0: F(u0), l: l, eps: F(5), unite: 'membres',
        texte: 'Un club de lutte d\'un quartier de Pikine compte $' + u0 + '$ membres en 2025. Chaque année, $' + F(1).sub(q).mul(100).n + '$ % des membres quittent le club et $' + T.num(l.mul(F(1).sub(q)).value()) + '$ nouveaux lutteurs s\'inscrivent. ' +
          'On note $u_n$ le nombre de membres en l\'année $2025 + n$ : $u_0 = ' + u0 + '$ (on admet que $u_n$ peut prendre des valeurs non entières).',
        seuil: 'Déterminer le plus petit entier $n$ tel que $|u_n - \\ell| < 5$.',
        nature: 'Comment le nombre de membres évolue-t-il à long terme ?' };
    }
  ];
  function qPuiss(q, e) { return '\\left(' + T.num(q.value()) + '\\right)^{' + e + '}'; }

  EM.gen.register({
    id: 'ts-pb-suite-arithmetico-geo',
    titre: 'Problème : suite u(n+1) = a·u(n) + b en situation (premiers termes, suite auxiliaire, limite, somme)',
    chapitres: ['ts-suites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var c = rng.pick(CTX_SUITES)(rng), q = c.q, b = c.b, u0 = c.u0, l = c.l, v0 = u0.sub(l);
      var u1 = q.mul(u0).add(b), u2 = q.mul(u1).add(b);
      var rec = 'u_{n+1} = ' + T.num(q.value()) + 'u_n + ' + T.num(b.value());
      var un = { s: S(v0) + '*' + S(q) + '^n+' + S(l), tex: (v0.equals(1) ? '' : v0.equals(-1) ? '-' : T.num(v0.value()) + ' \\times ') + qPuiss(q, 'n') + T.signed(l.value()) };
      var Kc = v0.div(F(1).sub(q));
      var Sn = { s: S(Kc) + '*(1-' + S(q) + '^(n+1))+' + S(l) + '*(n+1)', tex: nb(Kc) + '\\left(1 - ' + qPuiss(q, 'n+1') + '\\right) + ' + T.num(l.value()) + '(n + 1)' };
      var n0 = 0, qv = q.value(), av = Math.abs(v0.value()), ev = c.eps.value();
      while (av * Math.pow(qv, n0) >= ev) n0++;
      var seuil = Math.log(ev / av) / Math.log(qv);
      trace('ts-pb-suite-arithmetico-geo', { niveau: niveau, q: qv, b: b.value(), u0: u0.value(), eps: ev, sens: v0.sign() });
      var intro = c.texte + ' On admet que, pour tout entier naturel $n$, $' + rec + '$.<br>';
      var solBase = [
        '$u_1 = ' + T.num(q.value()) + ' \\times ' + T.num(u0.value()) + ' + ' + T.num(b.value()) + ' = ' + T.num(u1.value()) + '$' + (niveau === 1 ? ' et $u_2 = ' + T.num(q.value()) + ' \\times ' + T.num(u1.value()) + ' + ' + T.num(b.value()) + ' = ' + T.num(u2.value()) + '$.' : '.'),
        '$v_{n+1} = u_{n+1} - ' + T.num(l.value()) + ' = ' + T.num(q.value()) + 'u_n + ' + T.num(b.value()) + ' - ' + T.num(l.value()) + ' = ' + T.num(q.value()) + 'u_n - ' + T.num(q.mul(l).value()) + ' = ' + T.num(q.value()) + '(u_n - ' + T.num(l.value()) + ') = ' + T.num(q.value()) + 'v_n$.',
        'Donc $(v_n)$ est géométrique de raison $q = ' + T.num(q.value()) + '$ et de premier terme $v_0 = u_0 - ' + T.num(l.value()) + ' = ' + T.num(v0.value()) + '$.',
        '$v_n = v_0 q^n = ' + (v0.equals(1) ? '' : v0.equals(-1) ? '-' : T.num(v0.value()) + ' \\times ') + qPuiss(q, 'n') + '$, et $u_n = v_n + ' + T.num(l.value()) + ' = ' + un.tex + '$.',
        'Comme $0 < ' + T.num(q.value()) + ' < 1$, $' + qPuiss(q, 'n') + ' \\to 0$ quand $n \\to +\\infty$ : $\\lim\\limits_{n \\to +\\infty} u_n = ' + T.num(l.value()) + '$. ' +
          (v0.sign() < 0 ? 'Comme $v_0 < 0$, $u_n < \\ell$ et la suite croît vers $' + T.num(l.value()) + '$ ' + c.unite + '.' : 'Comme $v_0 > 0$, $u_n > \\ell$ et la suite décroît vers $' + T.num(l.value()) + '$ ' + c.unite + '.')
      ];
      var qs, enonce, sol;
      if (niveau === 1) {
        qs = [
          { label: '1) $u_1 =$', type: 'number', reponse: u1, reponseTex: nb(u1) },
          { label: '1) $u_2 =$', type: 'number', reponse: u2, reponseTex: nb(u2) },
          { label: '2) Raison $q =$', type: 'number', reponse: q, reponseTex: nb(q) },
          { label: '2) $v_0 =$', type: 'number', reponse: v0, reponseTex: nb(v0) },
          { label: '3) $u_n =$', type: 'expr', variable: 'n', reponse: un.s, reponseTex: un.tex, domaine: [0, 8] },
          { label: '4) $\\lim\\limits_{n \\to +\\infty} u_n =$', type: 'number', reponse: l, reponseTex: nb(l) }
        ];
        enonce = intro + '1) Calculer $u_1$ et $u_2$.<br>2) On pose, pour tout entier naturel $n$, $v_n = u_n - ' + T.num(l.value()) + '$. Montrer que $(v_n)$ est une suite géométrique ; préciser sa raison $q$ et son premier terme $v_0$.<br>' +
          '3) Exprimer $v_n$, puis $u_n$, en fonction de $n$.<br>4) En déduire la limite de la suite $(u_n)$. ' + c.nature;
        sol = solBase;
      } else {
        qs = [
          { label: '1) $u_1 =$', type: 'number', reponse: u1, reponseTex: nb(u1) },
          { label: '2) $\\ell =$', type: 'number', reponse: l, reponseTex: nb(l) },
          { label: '2) $u_n =$', type: 'expr', variable: 'n', reponse: un.s, reponseTex: un.tex, domaine: [0, 8] },
          { label: '2) $\\lim\\limits_{n \\to +\\infty} u_n =$', type: 'number', reponse: l, reponseTex: nb(l) },
          { label: '3) $S_n =$', type: 'expr', variable: 'n', reponse: Sn.s, reponseTex: Sn.tex, domaine: [0, 8] },
          { label: '4) Plus petit entier $n$ :', type: 'number', reponse: n0 }
        ];
        enonce = intro + '1) Calculer $u_1$.<br>2) Déterminer le réel $\\ell$ tel que la suite $(v_n)$ définie par $v_n = u_n - \\ell$ soit géométrique. En déduire $u_n$ en fonction de $n$, puis la limite de $(u_n)$.<br>' +
          '3) Calculer $S_n = u_0 + u_1 + \\dots + u_n$ en fonction de $n$.<br>4) ' + c.seuil;
        sol = [solBase[0],
          'Si $(v_n)$ est géométrique de raison $' + T.num(q.value()) + '$, alors $\\ell$ vérifie $\\ell = ' + T.num(q.value()) + '\\ell + ' + T.num(b.value()) + '$, soit $' + T.num(F(1).sub(q).value()) + '\\ell = ' + T.num(b.value()) + '$ et $\\ell = ' + T.num(l.value()) + '$. Réciproquement :'
        ].concat(solBase.slice(1)).concat([
          '$S_n = (v_0 + v_1 + \\dots + v_n) + (n + 1)\\ell = v_0 \\times \\dfrac{1 - q^{n+1}}{1 - q} + ' + T.num(l.value()) + '(n + 1) = ' + Sn.tex + '$.',
          '$|u_n - \\ell| = ' + T.num(av) + ' \\times ' + qPuiss(q, 'n') + ' < ' + T.num(ev) + ' \\iff ' + qPuiss(q, 'n') + ' < \\dfrac{' + T.num(ev) + '}{' + T.num(av) + '} \\iff n\\ln(' + T.num(qv) + ') < \\ln\\left(\\dfrac{' + T.num(ev) + '}{' + T.num(av) + '}\\right) \\iff n > \\dfrac{\\ln(' + T.num(ev) + '/' + T.num(av) + ')}{\\ln(' + T.num(qv) + ')} \\approx ' + ap(seuil) + '$ (on divise par $\\ln(' + T.num(qv) + ') < 0$, ce qui change le sens).',
          'Le plus petit entier qui convient est $n = ' + n0 + '$.'
        ]);
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Exprime $v_{n+1}$ en fonction de $u_n$, puis factorise par $' + T.num(q.value()) + '$ ; une suite géométrique vérifie $v_n = v_0 q^n$.',
          niveau === 1 ? 'Si $0 < q < 1$, alors $q^n$ tend vers $0$.' : 'Pour la somme, sépare $u_k = v_k + \\ell$ ; pour le seuil, applique $\\ln$ (attention : $\\ln q < 0$).'
        ],
        solution: sol,
        aide: 'Pour u_n, écris par exemple -40*0.5^n + 80 ; décimaux avec la virgule ou le point.'
      };
    }
  });

  /* ---------- Tle S : complexes et géométrie ---------- */
  /* nombres r + s√3 (r, s rationnels) */
  function R3(r, s) { return { r: fr(r), s: fr(s || 0) }; }
  function r3Add(a, b) { return R3(a.r.add(b.r), a.s.add(b.s)); }
  function r3Sub(a, b) { return R3(a.r.sub(b.r), a.s.sub(b.s)); }
  function r3Mul(a, b) { return R3(a.r.mul(b.r).add(a.s.mul(b.s).mul(3)), a.r.mul(b.s).add(a.s.mul(b.r))); }
  function r3Zero(a) { return a.r.isZero() && a.s.isZero(); }
  function r3Tex(a) {
    if (a.s.isZero()) return T.num(a.r);
    var sq = function (s, first) {
      var n = Math.abs(s.n), body = (n === 1 ? '' : n) + '\\sqrt{3}';
      if (s.d !== 1) body = '\\dfrac{' + body + '}{' + s.d + '}';
      return first ? (s.n < 0 ? '-' : '') + body : (s.n < 0 ? ' - ' : ' + ') + body;
    };
    return a.r.isZero() ? sq(a.s, true) : T.num(a.r) + sq(a.s, false);
  }
  function r3S(a) { return a.s.isZero() ? S(a.r) : S(a.r) + '+' + S(a.s) + '*sqrt(3)'; }
  function Z3(x, y) { return { x: x, y: y }; }
  function z3(c) { return Z3(R3(c.x), R3(c.y)); }
  function z3Add(a, b) { return Z3(r3Add(a.x, b.x), r3Add(a.y, b.y)); }
  function z3Sub(a, b) { return Z3(r3Sub(a.x, b.x), r3Sub(a.y, b.y)); }
  function z3Mul(a, b) { return Z3(r3Sub(r3Mul(a.x, b.x), r3Mul(a.y, b.y)), r3Add(r3Mul(a.x, b.y), r3Mul(a.y, b.x))); }
  function z3Tex(z) {
    var xz = r3Zero(z.x), yz = r3Zero(z.y);
    if (yz) return r3Tex(z.x);
    var yt;
    if (z.y.s.isZero()) yt = T.mono(z.y.r, 'i', xz);
    else if (z.y.r.isZero()) { var t = r3Tex(z.y); yt = xz ? t + 'i' : (t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t) + 'i'; }
    else yt = (xz ? '' : ' + ') + '\\left(' + r3Tex(z.y) + '\\right)i';
    return (xz ? '' : r3Tex(z.x)) + yt;
  }
  function z3Par(z) { var t = z3Tex(z); return (!r3Zero(z.x) && !r3Zero(z.y)) || t.charAt(0) === '-' ? '\\left(' + t + '\\right)' : t; }
  var Q_TRI = [
    { q: [0, 0, 1, 0], m: [1, 1], t: F(1, 2), nat: 'rectangle isocèle en $A$' },
    { q: [0, 0, -1, 0], m: [1, 1], t: F(-1, 2), nat: 'rectangle isocèle en $A$' },
    { q: [0, 0, 2, 0], m: [2, 1], t: F(1, 2), nat: 'rectangle en $A$ (non isocèle)' },
    { q: [0, 0, -2, 0], m: [2, 1], t: F(-1, 2), nat: 'rectangle en $A$ (non isocèle)' },
    { q: [1, 0, 1, 0], m: [1, 2], t: F(1, 4), nat: 'rectangle isocèle en $B$' },
    { q: [1, 0, -1, 0], m: [1, 2], t: F(-1, 4), nat: 'rectangle isocèle en $B$' },
    { q: [F(1, 2), 0, F(1, 2), 0], m: [F(1, 2), 2], t: F(1, 4), nat: 'rectangle isocèle en $C$' },
    { q: [F(1, 2), 0, F(-1, 2), 0], m: [F(1, 2), 2], t: F(-1, 4), nat: 'rectangle isocèle en $C$' },
    { q: [F(1, 2), 0, 0, F(1, 2)], m: [1, 1], t: F(1, 3), nat: 'équilatéral' },
    { q: [F(1, 2), 0, 0, F(-1, 2)], m: [1, 1], t: F(-1, 3), nat: 'équilatéral' }
  ];
  var NAT_TRI = ['rectangle isocèle en $A$', 'rectangle isocèle en $B$', 'rectangle isocèle en $C$', 'rectangle en $A$ (non isocèle)', 'équilatéral'];

  EM.gen.register({
    id: 'ts-pb-complexes-triangle',
    titre: 'Problème : nombres complexes, nature d\'un triangle et similitude',
    chapitres: ['ts-complexes', 'ts-similitudes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var Q = rng.pick(Q_TRI), q = Z3(R3(Q.q[0], Q.q[1]), R3(Q.q[2], Q.q[3]));
      var zA = Cx(rng.int(-3, 3), rng.int(-3, 3)), w, g = 0;
      do { w = Cx(rng.nz(-3, 3), rng.int(-3, 3)); g++; } while (Q.q[0] instanceof Frac && Q.q[1] === 0 && Q.q[3] === 0 && (w.x.n - w.y.n) % 2 !== 0 && g < 50);
      if (Q.q[0] instanceof Frac && Q.q[3] === 0 && (w.x.n - w.y.n) % 2 !== 0) w = Cx(2, 0);
      var zB = cAdd(zA, w), A3 = z3(zA), C3 = z3Add(A3, z3Mul(q, z3(w)));
      var un = Z3(R3(1), R3(0)), bb = z3Mul(z3Sub(un, q), A3);
      var mod = { tex: radTex(fr(Q.m[0]), Q.m[1]), s: radS(fr(Q.m[0]), Q.m[1]) }, arg = { tex: angTex(Q.t), s: angS(Q.t) };
      trace('ts-pb-complexes-triangle', { niveau: niveau, A: zA, B: zB, C: C3, Num: null });
      var qs = [], sol = [], enonce;
      var Den = null, Num = null;
      if (niveau === 2) {
        Den = Cx(rng.nz(-2, 2), rng.nz(-2, 2));
        Num = cMul(zB, Den);
        trace('ts-pb-complexes-triangle-quotient', { Num: Num, Den: Den });
        qs.push({ label: '1) $z_B$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [zB.x, zB.y] });
        sol.push('$z_B = \\dfrac{' + cTex(Num) + '}{' + cTex(Den) + '} = \\dfrac{' + cPar(Num) + cPar(cConj(Den)) + '}{' + cN2(Den).tex() + '} = \\dfrac{' + cTex(cMul(Num, cConj(Den))) + '}{' + cN2(Den).tex() + '} = ' + cTex(zB) + '$.');
      }
      var n0 = niveau === 2 ? 2 : 1;
      qs.push({ label: n0 + ') $q$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [r3S(q.x), r3S(q.y)], reponseTex: pt(r3Tex(q.x), r3Tex(q.y)) });
      qs.push({ label: n0 + ') $|q| =$', type: 'number', reponse: mod.s, reponseTex: mod.tex });
      qs.push({ label: n0 + ') Argument principal de $q$ :', type: 'number', reponse: arg.s, reponseTex: arg.tex });
      qs.push(qcm(rng, (n0 + 1) + ') Le triangle $ABC$ est :', Q.nat, NAT_TRI));
      qs.push({ label: (n0 + 2) + ') $b$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [r3S(bb.x), r3S(bb.y)], reponseTex: pt(r3Tex(bb.x), r3Tex(bb.y)) });
      var wq = z3Mul(q, z3(w));
      sol.push('$z_C - z_A = ' + z3Tex(wq) + '$ et $z_B - z_A = ' + cTex(w) + '$, donc $q = \\dfrac{' + z3Tex(wq) + '}{' + cTex(w) + '}' + (w.y.isZero() ? '' : ' = \\dfrac{' + z3Par(wq) + cPar(cConj(w)) + '}{' + cN2(w).tex() + '}') + ' = ' + z3Tex(q) + '$.');
      sol.push('$|q| = ' + mod.tex + '$ et $\\arg(q) = ' + arg.tex + '$ (à $2\\pi$ près) : $q = ' + (mod.tex === '1' ? '\\cos ' + cosTrig(Q.t) + ' + i\\sin ' + cosTrig(Q.t) : mod.tex + '\\left(\\cos ' + cosTrig(Q.t) + ' + i\\sin ' + cosTrig(Q.t) + '\\right)') + '$.');
      var just;
      if (/en \$A\$ \(non/.test(Q.nat)) just = '$\\dfrac{AC}{AB} = |q| = 2$ et $\\left(\\vect{AB}, \\vect{AC}\\right) = \\arg(q) = ' + arg.tex + '$ : le triangle $ABC$ est rectangle en $A$, mais pas isocèle ($AC = 2AB$).';
      else if (/en \$A\$/.test(Q.nat)) just = '$\\dfrac{AC}{AB} = |q| = 1$ et $\\left(\\vect{AB}, \\vect{AC}\\right) = \\arg(q) = ' + arg.tex + '$ : $AB = AC$ et l\'angle en $A$ est droit, le triangle $ABC$ est rectangle isocèle en $A$.';
      else if (/en \$B\$/.test(Q.nat)) {
        var r = z3Sub(un, q);
        just = '$\\dfrac{z_C - z_B}{z_A - z_B} = \\dfrac{(z_C - z_A) - (z_B - z_A)}{-(z_B - z_A)} = 1 - q = ' + z3Tex(r) + '$, de module $1$ et d\'argument $' + angTex(r.y.r.sign() > 0 ? F(1, 2) : F(-1, 2)) + '$ : $BA = BC$ et l\'angle en $B$ est droit, le triangle $ABC$ est rectangle isocèle en $B$.';
      } else if (/en \$C\$/.test(Q.nat)) {
        var qm = Z3(R3(q.x.r.neg()), R3(q.y.r.neg())), den = z3Sub(un, q), quo = cDiv(Cx(qm.x.r, qm.y.r), Cx(den.x.r, den.y.r));
        just = '$\\dfrac{z_A - z_C}{z_B - z_C} = \\dfrac{-q}{1 - q} = \\dfrac{' + z3Tex(qm) + '}{' + z3Tex(den) + '} = ' + cTex(quo) + '$, de module $1$ et d\'argument $' + angTex(quo.y.sign() > 0 ? F(1, 2) : F(-1, 2)) + '$ : $CA = CB$ et l\'angle en $C$ est droit, le triangle $ABC$ est rectangle isocèle en $C$.';
      } else just = '$\\dfrac{AC}{AB} = |q| = 1$ et $\\left(\\vect{AB}, \\vect{AC}\\right) = ' + arg.tex + '$ : le triangle $ABC$ est isocèle en $A$ avec un angle de $60°$ au sommet, il est donc équilatéral.';
      sol.push(just);
      sol.push('$s$ a pour centre $A$, pour rapport $|q| = ' + mod.tex + '$ et pour angle $' + arg.tex + '$ : $z\' - z_A = q(z - z_A)$, soit $z\' = qz + (1 - q)z_A$. On trouve $b = (1 - q)z_A = ' + z3Par(z3Sub(un, q)) + cPar(zA) + ' = ' + z3Tex(bb) + '$, donc $s : z\' = ' + z3Par(q) + 'z' + (r3Zero(bb.x) && r3Zero(bb.y) ? '' : (z3Tex(bb).charAt(0) === '-' ? ' - ' + z3Tex(bb).slice(1) : ' + ' + z3Tex(bb))) + '$.');
      var zBtxt = niveau === 2 ? '\\dfrac{' + cTex(Num) + '}{' + cTex(Den) + '}' : cTex(zB);
      enonce = 'Le plan complexe est rapporté à un repère orthonormé direct $(O, \\vec{u}, \\vec{v})$. On considère les points $A$, $B$ et $C$ d\'affixes $$z_A = ' + cTex(zA) + ', \\qquad z_B = ' + zBtxt + ', \\qquad z_C = ' + z3Tex(C3) + '.$$' +
        (niveau === 2 ? '1) Écrire $z_B$ sous forme algébrique.<br>' : '') +
        n0 + ') Écrire le nombre $q = \\dfrac{z_C - z_A}{z_B - z_A}$ sous forme algébrique, puis déterminer son module et un argument.<br>' +
        (n0 + 1) + ') En déduire la nature du triangle $ABC$.<br>' +
        (n0 + 2) + ') Soit $s$ la similitude directe de centre $A$ qui transforme $B$ en $C$. Déterminer son rapport, son angle et son écriture complexe $z\' = az + b$.';
      var fig = null;
      if (niveau === 1) {
        var P = function (z) { return [z.x.r.value() + z.x.s.value() * Math.sqrt(3), z.y.r.value() + z.y.s.value() * Math.sqrt(3)]; };
        var pA = P(A3), pB = P(z3(zB)), pC = P(C3);
        var ff = EM.fig.fit([pA, pB, pC, [0, 0]], { w: 280, h: 230, title: 'Points A, B, C' });
        var span = Math.max(ff.xmax - ff.xmin, ff.ymax - ff.ymin);
        ff.axes({ step: 1, labelStep: span > 12 ? 2 : 1 });
        ff.poly([pA, pB, pC], { accent: true });
        var Gc = [(pA[0] + pB[0] + pC[0]) / 3, (pA[1] + pB[1] + pC[1]) / 3];
        ff.point(pA, 'A', posLoin(pA, Gc)).point(pB, 'B', posLoin(pB, Gc)).point(pC, 'C', posLoin(pC, Gc));
        fig = ff.svg();
      }
      return {
        enonce: enonce,
        figure: fig,
        questions: qs,
        indices: [
          'Pour diviser par un complexe, multiplie le numérateur et le dénominateur par le conjugué du dénominateur.',
          '$|q| = \\dfrac{AC}{AB}$ et $\\arg(q) = \\left(\\vect{AB}, \\vect{AC}\\right)$ ; la similitude de centre $A$ qui envoie $B$ sur $C$ a pour écriture $z\' - z_A = q(z - z_A)$.'
        ],
        solution: sol,
        aide: 'Écris la partie réelle puis la partie imaginaire : (1/2 ; sqrt(3)/2) ; module : sqrt(2) ; argument : pi/4.'
      };
    }
  });

  /* ---------- Tle S : probabilités (arbre, probabilités totales, loi binomiale) ---------- */
  var CTX_PROBA = [
    function (rng) {
      var p1 = rng.pick([10, 15, 20, 25]), a = rng.pick([90, 95, 98]), b = rng.pick([2, 4, 5]), n = rng.pick([5, 8, 10]);
      return { p1: p1, a: a, b: b, n: n, E: 'M', Eb: '\\overline{M}', D: 'T', Db: '\\overline{T}', E2: 'M̄', D2: 'T̄', Etxt: 'M',
        texte: 'Pendant l\'hivernage, dans une zone rurale de la région de Kolda, $' + p1 + '$ % des personnes qui consultent au poste de santé sont atteintes de paludisme. On utilise un test de diagnostic rapide (TDR) : ' +
          'il est positif chez $' + a + '$ % des personnes atteintes et chez $' + b + '$ % des personnes non atteintes. On choisit une personne au hasard et on note $M$ : « la personne est atteinte de paludisme » et $T$ : « le test est positif ».',
        qBayes: 'la probabilité qu\'une personne dont le test est positif soit réellement atteinte',
        X: 'On teste $' + n + '$ personnes choisies au hasard (on assimile ces choix à des tirages avec remise) et on note $X$ le nombre de tests positifs.' };
    },
    function (rng) {
      var p1 = rng.pick([40, 55, 60, 70]), a = rng.pick([2, 3, 4]), b = rng.pick([5, 6, 8]), n = rng.pick([10, 15, 20]);
      return { p1: p1, a: a, b: b, n: n, E: 'A', Eb: 'B', D: 'D', Db: '\\overline{D}', E2: 'B', D2: 'D̄', Etxt: 'A',
        texte: 'Une coopérative de Kaolack achète ses sacs d\'arachide à deux fournisseurs : $' + p1 + '$ % des sacs viennent du fournisseur $A$, les autres du fournisseur $B$. ' +
          '$' + a + '$ % des sacs du fournisseur $A$ et $' + b + '$ % des sacs du fournisseur $B$ contiennent des graines avariées. On choisit un sac au hasard et on note $A$ : « le sac vient du fournisseur $A$ », $B$ : « le sac vient du fournisseur $B$ » et $D$ : « le sac contient des graines avariées ».',
        qBayes: 'la probabilité qu\'un sac contenant des graines avariées vienne du fournisseur $A$',
        X: 'On prélève $' + n + '$ sacs au hasard dans un stock assez grand pour assimiler ces prélèvements à des tirages avec remise, et on note $X$ le nombre de sacs contenant des graines avariées.' };
    },
    function (rng) {
      var p1 = rng.pick([60, 70, 75]), a = rng.pick([20, 25, 30]), b = rng.pick([5, 10]), n = rng.pick([5, 6]);
      return { p1: p1, a: a, b: b, n: n, E: 'C', Eb: '\\overline{C}', D: 'R', Db: '\\overline{R}', E2: 'C̄', D2: 'R̄', Etxt: 'C',
        texte: 'Pour aller au lycée, Moussa, qui habite Pikine, prend le car rapide avec une probabilité de $' + T.num(p1 / 100) + '$, sinon le bus. ' +
          'Lorsqu\'il prend le car rapide, il arrive en retard avec une probabilité de $' + T.num(a / 100) + '$ ; lorsqu\'il prend le bus, avec une probabilité de $' + T.num(b / 100) + '$. On choisit un jour de classe au hasard et on note $C$ : « Moussa prend le car rapide » et $R$ : « Moussa arrive en retard ».',
        qBayes: 'la probabilité que Moussa ait pris le car rapide sachant qu\'il est arrivé en retard',
        X: 'On observe Moussa pendant $' + n + '$ jours de classe, ses trajets étant indépendants d\'un jour à l\'autre, et on note $X$ le nombre de jours où il arrive en retard.' };
    }
  ];
  function Cnk(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  function arbreFig(c) {
    var f = EM.fig.create({ w: 300, h: 200, xmin: -0.5, xmax: 7.4, ymin: -3.1, ymax: 3.1, title: 'Arbre pondéré' });
    var R = [0, 0], N1 = [3, 1.6], N2 = [3, -1.6], L = [[6.2, 2.5], [6.2, 0.7], [6.2, -0.7], [6.2, -2.5]];
    var br = function (P, Q, txt, haut) {
      var dx = Q[0] - P[0], dy = Q[1] - P[1];
      f.seg([P[0] + 0.3, P[1] + dy * 0.3 / dx], [Q[0] - 0.35, Q[1] - dy * 0.35 / dx]);
      f.text([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2 + (haut ? 0.3 : -0.6)], txt, { small: true });
    };
    var tx = function (x) { return T.txt(x); };
    br(R, N1, tx(c.p1 / 100), true); br(R, N2, '…', false);
    br(N1, L[0], tx(c.a / 100), true); br(N1, L[1], '…', false);
    br(N2, L[2], tx(c.b / 100), true); br(N2, L[3], '…', false);
    f.text([N1[0] + 0.05, N1[1] - 0.15], c.Etxt).text([N2[0] + 0.05, N2[1] - 0.15], c.E2);
    f.text([L[0][0] + 0.2, L[0][1] - 0.15], c.D).text([L[1][0] + 0.2, L[1][1] - 0.15], c.D2).text([L[2][0] + 0.2, L[2][1] - 0.15], c.D).text([L[3][0] + 0.2, L[3][1] - 0.15], c.D2);
    return f.svg();
  }

  EM.gen.register({
    id: 'ts-pb-probabilites',
    titre: 'Problème : arbre pondéré, probabilités totales, loi binomiale et espérance',
    chapitres: ['ts-probabilites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var c = rng.pick(CTX_PROBA)(rng);
      var P1 = F(c.p1, 100), Pa = F(c.a, 100), Pb = F(c.b, 100), inter = P1.mul(Pa), interB = F(1).sub(P1).mul(Pb), pD = inter.add(interB), post = inter.div(pD);
      var p = pD.value(), n = c.n, p0 = Math.pow(1 - p, n), p2 = Cnk(n, 2) * p * p * Math.pow(1 - p, n - 2), E = pD.mul(n);
      trace('ts-pb-probabilites', { niveau: niveau, p1: c.p1, a: c.a, b: c.b, n: n });
      var Pe = 'P(' + c.E + ')', PeD = 'P(' + c.E + ' \\cap ' + c.D + ')';
      var sol = [
        'D\'après l\'énoncé : $' + Pe + ' = ' + T.num(P1.value()) + '$, $P_{' + c.E + '}(' + c.D + ') = ' + T.num(Pa.value()) + '$ et $P_{' + c.Eb + '}(' + c.D + ') = ' + T.num(Pb.value()) + '$. ' +
          'On complète l\'arbre avec les probabilités contraires : $P(' + c.Eb + ') = ' + T.num(F(1).sub(P1).value()) + '$, $P_{' + c.E + '}(' + c.Db + ') = ' + T.num(F(1).sub(Pa).value()) + '$ et $P_{' + c.Eb + '}(' + c.Db + ') = ' + T.num(F(1).sub(Pb).value()) + '$ (la somme des probabilités issues d\'un même nœud vaut $1$).',
        '$' + PeD + ' = ' + Pe + ' \\times P_{' + c.E + '}(' + c.D + ') = ' + T.num(P1.value()) + ' \\times ' + T.num(Pa.value()) + ' = ' + T.num(inter.value()) + '$.',
        '$' + c.E + '$ et $' + c.Eb + '$ forment une partition de l\'univers ; d\'après la formule des probabilités totales : $P(' + c.D + ') = ' + PeD + ' + P(' + c.Eb + ' \\cap ' + c.D + ') = ' + T.num(inter.value()) + ' + ' + T.num(F(1).sub(P1).value()) + ' \\times ' + T.num(Pb.value()) + ' = ' + T.num(pD.value()) + '$.',
        '$P_{' + c.D + '}(' + c.E + ') = \\dfrac{' + PeD + '}{P(' + c.D + ')} = \\dfrac{' + T.num(inter.value()) + '}{' + T.num(pD.value()) + '} \\approx ' + ap(post, 3) + '$.',
        'Chacune des $' + n + '$ épreuves a deux issues, « $' + c.D + '$ » (succès, de probabilité $p = ' + T.num(p) + '$) ou non, et les épreuves sont indépendantes : $X$ suit la loi binomiale $\\mathcal{B}(' + n + ' \\,;\\, ' + T.num(p) + ')$.'
      ];
      var qs, enonce = c.texte + '<br>1) Recopier et compléter l\'arbre pondéré ci-dessous.<br>2) Calculer $' + PeD + '$, puis montrer que $P(' + c.D + ') = ' + T.num(pD.value()) + '$.<br>3) Calculer ' + c.qBayes + ' (arrondir à $10^{-3}$).<br>4) ' + c.X + ' ';
      if (niveau === 1) {
        enonce += 'Justifier que $X$ suit une loi binomiale dont on précisera les paramètres, puis calculer l\'espérance $E(X)$ et l\'interpréter.';
        qs = [
          { label: '2) $' + PeD + ' =$', type: 'number', reponse: inter, reponseTex: nb(inter) },
          { label: '2) $P(' + c.D + ') =$', type: 'number', reponse: pD, reponseTex: nb(pD) },
          { label: '3) $P_{' + c.D + '}(' + c.E + ') \\approx$', type: 'number', reponse: post.value(), tol: 0.001, reponseTex: ap(post, 3) },
          { label: '4) Paramètres $(n \\,;\\, p) =$', type: 'tuple', reponse: [n, pD], reponseTex: pt(n, nb(pD)) },
          { label: '4) $E(X) =$', type: 'number', reponse: E, reponseTex: nb(E) }
        ];
        sol.push('$E(X) = np = ' + n + ' \\times ' + T.num(p) + ' = ' + T.num(E.value()) + '$ : en moyenne, sur un grand nombre de séries de $' + n + '$ épreuves, on observe environ $' + T.num(E.value()) + '$ succès par série.');
      } else {
        enonce += 'Préciser la loi de $X$, puis calculer $P(X = 0)$, $P(X = 2)$ et $P(X \\geq 1)$ (arrondis à $10^{-3}$) et l\'espérance $E(X)$.';
        qs = [
          { label: '2) $P(' + c.D + ') =$', type: 'number', reponse: pD, reponseTex: nb(pD) },
          { label: '3) $P_{' + c.D + '}(' + c.E + ') \\approx$', type: 'number', reponse: post.value(), tol: 0.001, reponseTex: ap(post, 3) },
          { label: '4) $P(X = 0) \\approx$', type: 'number', reponse: p0, tol: 0.001, reponseTex: ap(p0, 3) },
          { label: '4) $P(X = 2) \\approx$', type: 'number', reponse: p2, tol: 0.001, reponseTex: ap(p2, 3) },
          { label: '4) $P(X \\geq 1) \\approx$', type: 'number', reponse: 1 - p0, tol: 0.001, reponseTex: ap(1 - p0, 3) },
          { label: '4) $E(X) =$', type: 'number', reponse: E, reponseTex: nb(E) }
        ];
        sol.push('$P(X = 0) = (1 - p)^{' + n + '} = ' + T.num(rd(1 - p, 6)) + '^{' + n + '} \\approx ' + ap(p0, 3) + '$.');
        sol.push('$P(X = 2) = C_{' + n + '}^{2}\\,p^2(1 - p)^{' + (n - 2) + '} = ' + Cnk(n, 2) + ' \\times ' + T.num(p) + '^2 \\times ' + T.num(rd(1 - p, 6)) + '^{' + (n - 2) + '} \\approx ' + ap(p2, 3) + '$.');
        sol.push('$P(X \\geq 1) = 1 - P(X = 0) \\approx ' + ap(1 - p0, 3) + '$ (événement contraire de « aucun succès »).');
        sol.push('$E(X) = np = ' + n + ' \\times ' + T.num(p) + ' = ' + T.num(E.value()) + '$.');
      }
      return {
        enonce: enonce,
        figure: arbreFig(c),
        questions: qs,
        indices: [
          'Sur l\'arbre, on multiplie les probabilités le long d\'un chemin ; $P(' + c.D + ')$ est la somme des deux chemins qui mènent à $' + c.D + '$.',
          'Pour « remonter » l\'arbre : $P_{' + c.D + '}(' + c.E + ') = \\dfrac{' + PeD + '}{P(' + c.D + ')}$. Loi binomiale : $P(X = k) = C_n^k p^k (1 - p)^{n - k}$ et $E(X) = np$.'
        ],
        solution: sol,
        aide: 'Valeurs exactes en décimal (0,038) ou arrondies à 0,001 quand c\'est demandé ; paramètres : (10 ; 0,038).'
      };
    }
  });

  /* ---------- Tle L : problème de fonction (polynôme ou logarithme) ---------- */
  EM.gen.register({
    id: 'tl-pb-fonction',
    titre: 'Problème : étude d\'une fonction polynôme ou d\'une fonction avec logarithme',
    chapitres: ['tl-fonctions', 'tl-logarithme-exponentielle'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var A = rng.pick([1, -1]), r1 = rng.int(-3, 1), r2 = r1 + 2 * rng.int(1, 2), D0 = rng.int(-4, 4);
        var facto = coefTex(3 * A) + (r1 === 0 ? 'x' + T.xMinus(r2) : r2 === 0 ? 'x' + T.xMinus(r1) : T.xMinus(r1) + T.xMinus(r2));
        var f = [A, -3 * A * (r1 + r2) / 2, 3 * A * r1 * r2, D0], df = [3 * A, -3 * A * (r1 + r2), 3 * A * r1 * r2];
        var ev = function (co, x) { return co.reduce(function (s, c) { return s * x + c; }, 0); };
        var v1 = ev(f, r1), v2 = ev(f, r2), xT;
        do { xT = rng.int(-2, 3); } while (xT === r1 || xT === r2);
        var mT = ev(df, xT), fT = ev(f, xT), tg = [mT, fT - mT * xT];
        var maxV = A > 0 ? v1 : v2, minV = A > 0 ? v2 : v1;
        trace('tl-pb-fonction', { niveau: 1, f: f, xT: xT });
        var fN = function (x) { return ev(f, x); }, X0 = r1 - 2, X1 = r2 + 2, Y = fenetreY([fN], X0, X1, Math.min(v1, v2) - 15, Math.max(v1, v2) + 15);
        return {
          enonce: 'Soit $f$ la fonction définie sur $\\R$ par $$f(x) = ' + T.poly(f) + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthogonal.<br>' +
            '1) Calculer les limites de $f$ en $-\\infty$ et en $+\\infty$.<br>2) Calculer $f\'(x)$ et vérifier que $f\'(x) = ' + facto + '$.<br>' +
            '3) Étudier le signe de $f\'(x)$, dresser le tableau de variation de $f$ et préciser son maximum local et son minimum local.<br>4) Déterminer une équation de la tangente $(T)$ à $(\\mathcal{C})$ au point d\'abscisse $' + xT + '$.',
          figure: graphe(X0, X1, Y[0], Y[1], [{ f: fN }]),
          questions: [
            qcm(rng, '1) $' + lim('-\\infty') + ' f(x) =$', infChoix(-A), [PINF, MINF, ZERO]),
            qcm(rng, '1) $' + lim('+\\infty') + ' f(x) =$', infChoix(A), [PINF, MINF, ZERO]),
            { label: '2) $f\'(x) =$', type: 'expr', reponse: polyS(df), reponseTex: T.poly(df) },
            { label: '3) Maximum local :', type: 'number', reponse: maxV },
            { label: '3) Minimum local :', type: 'number', reponse: minV },
            { label: '4) $(T) : y =$', type: 'expr', reponse: polyS(tg), reponseTex: T.poly(tg) }
          ],
          indices: [
            'En $\\pm\\infty$, un polynôme a la même limite que son terme de plus haut degré $' + T.mono(A, 'x^3', true) + '$.',
            'Le trinôme $f\'(x)$ a le signe de $' + (3 * A) + '$ à l\'extérieur de ses racines. Tangente : $y = f\'(a)(x - a) + f(a)$.'
          ],
          solution: [
            'En $\\pm\\infty$, $f(x)$ a la même limite que $' + T.mono(A, 'x^3', true) + '$ : $' + lim('-\\infty') + ' f(x) = ' + (A > 0 ? '-' : '+') + '\\infty$ et $' + lim('+\\infty') + ' f(x) = ' + (A > 0 ? '+' : '-') + '\\infty$.',
            '$f\'(x) = ' + T.poly(df) + ' = ' + coefTex(3 * A) + '(' + T.poly([1, -(r1 + r2), r1 * r2]) + ') = ' + facto + '$.',
            '$f\'(x)$ s\'annule en $' + r1 + '$ et $' + r2 + '$ ; il a le signe de $' + (3 * A) + '$ à l\'extérieur des racines.' +
              tabVar(['-\\infty', String(r1), String(r2), '+\\infty'], A > 0 ? ['+', '-', '+'] : ['-', '+', '-'], ['0', '0'], [A > 0 ? '-\\infty' : '+\\infty', String(v1), String(v2), A > 0 ? '+\\infty' : '-\\infty']),
            'Maximum local : $f(' + (A > 0 ? r1 : r2) + ') = ' + maxV + '$ ; minimum local : $f(' + (A > 0 ? r2 : r1) + ') = ' + minV + '$.',
            '$f(' + xT + ') = ' + fT + '$ et $f\'(' + xT + ') = ' + mT + '$, donc $(T) : y = ' + (mT === 0 ? '' : coefTex(mT) + T.xMinus(xT)) + (fT === 0 && mT !== 0 ? '' : T.signed(fT, mT === 0)) + '$, soit $y = ' + T.poly(tg) + '$.'
          ],
          aide: 'Expressions développées : 3x^2 - 6x - 9 ; tangente : -9x + 4.'
        };
      }
      var k = rng.int(1, 4), b = rng.int(-3, 3);
      var fTex = T.sum([{ c: 1, v: 'x' }, { c: b }, { c: -k, v: '\\ln x' }]);
      var dTex = '1 - \\dfrac{' + k + '}{x}', dS = '1-' + S(k) + '/x';
      var fk = k === 1 ? { tex: String(1 + b), s: S(1 + b) } : { tex: T.sum([{ c: k + b }, { c: -k, v: '\\ln ' + k }]), s: S(k + b) + '-' + S(k) + '*ln(' + k + ')' };
      var tg = k === 1 ? { at: 'e', tex: '\\left(1 - e^{-1}\\right)x' + T.signed(b).replace(' + 0', ''), s: '(1-e^(-1))*x+' + S(b) }
        : { at: '1', tex: T.poly([1 - k, k + b]), s: polyS([1 - k, k + b]) };
      var fN = function (x) { return x + b - k * Math.log(x); }, droite = T.poly([1, b]), dP = b ? '(' + droite + ')' : 'x';
      trace('tl-pb-fonction', { niveau: 2, k: k, b: b });
      var Y = fenetreY([fN], 0.02, 9, -3, 12);
      return {
        enonce: 'Soit $f$ la fonction définie sur $]0 \\,;\\, +\\infty[$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé.<br>' +
          '1) Calculer la limite de $f$ en $0$ et interpréter graphiquement le résultat. On admet que $' + lim('+\\infty') + ' f(x) = +\\infty$.<br>' +
          '2) Calculer $f\'(x)$ et vérifier que $f\'(x) = \\dfrac{x - ' + k + '}{x}$. Dresser le tableau de variation de $f$ et préciser son minimum.<br>' +
          '3) Déterminer une équation de la tangente $(T)$ à $(\\mathcal{C})$ au point d\'abscisse $' + tg.at + '$.<br>' +
          '4) Soit $(D)$ la droite d\'équation $y = ' + droite + '$. Étudier la position relative de $(\\mathcal{C})$ et de $(D)$.',
        figure: graphe(-0.9, 9, Y[0], Y[1], [{ f: fN, from: 0.005 }]),
        questions: [
          qcm(rng, '1) $' + lim('0^+') + ' f(x) =$', PINF, [MINF, ZERO, '$' + b + '$']),
          { label: '2) $f\'(x) =$', type: 'expr', reponse: dS, reponseTex: dTex, domaine: [0.5, 5] },
          { label: '2) Le minimum est atteint en $x =$', type: 'number', reponse: k },
          { label: '2) Minimum de $f$ :', type: 'number', reponse: fk.s, reponseTex: fk.tex },
          { label: '3) $(T) : y =$', type: 'expr', reponse: tg.s, reponseTex: tg.tex, domaine: [0.5, 5] },
          qcm(rng, '4) Sur $]0 \\,;\\, 1[$, la courbe $(\\mathcal{C})$ est :', 'au-dessus de $(D)$', ['en dessous de $(D)$', 'confondue avec $(D)$'])
        ],
        indices: [
          '$' + lim('0^+') + ' \\ln x = -\\infty$, donc $-' + (k === 1 ? '' : k) + '\\ln x$ tend vers $+\\infty$. Et $(\\ln x)\' = \\dfrac{1}{x}$.',
          'Pour la position relative, étudie le signe de $f(x) - ' + dP + ' = -' + (k === 1 ? '' : k) + '\\ln x$ : rappelle-toi que $\\ln x < 0$ sur $]0 \\,;\\, 1[$.'
        ],
        solution: [
          '$' + lim('0^+') + ' ' + dP + ' = ' + b + '$ et $' + lim('0^+') + ' \\ln x = -\\infty$, donc $' + lim('0^+') + ' (-' + (k === 1 ? '' : k) + '\\ln x) = +\\infty$ et $' + lim('0^+') + ' f(x) = +\\infty$ : l\'axe des ordonnées (droite d\'équation $x = 0$) est asymptote verticale à $(\\mathcal{C})$.',
          '$f\'(x) = 1 - ' + (k === 1 ? '' : k + ' \\times ') + '\\dfrac{1}{x} = ' + dTex + ' = \\dfrac{x - ' + k + '}{x}$. Sur $]0 \\,;\\, +\\infty[$, $x > 0$ donc $f\'(x)$ a le signe de $x - ' + k + '$.' +
            tabVar(['0', String(k), '+\\infty'], ['-', '+'], ['0'], ['+\\infty', fk.tex, '+\\infty']),
          '$f$ admet un minimum en $x = ' + k + '$ : $f(' + k + ') = ' + (k === 1 ? '1' + (b ? T.signed(b) : '') + ' - \\ln 1 = ' : b ? k + T.signed(b) + ' - ' + k + '\\ln ' + k + ' = ' : '') + fk.tex + (k === 1 ? '' : ' \\approx ' + ap(k + b - k * Math.log(k))) + '$.',
          k === 1 ? '$f(e) = e' + T.signed(b).replace(' + 0', '') + ' - 1$ et $f\'(e) = 1 - e^{-1}$, donc $(T) : y = \\left(1 - e^{-1}\\right)(x - e) + e' + (b - 1 ? T.signed(b - 1) : '') + '$, soit $y = ' + tg.tex + '$.'
            : '$f(1) = ' + (1 + b) + '$ (car $\\ln 1 = 0$) et $f\'(1) = ' + (1 - k) + '$, donc $(T) : y = ' + coefTex(1 - k) + '(x - 1)' + (1 + b ? T.signed(1 + b) : '') + '$, soit $y = ' + tg.tex + '$.',
          '$f(x) - ' + dP + ' = -' + (k === 1 ? '' : k) + '\\ln x$. Sur $]0 \\,;\\, 1[$, $\\ln x < 0$ donc la différence est positive : $(\\mathcal{C})$ est au-dessus de $(D)$ ; sur $]1 \\,;\\, +\\infty[$, $(\\mathcal{C})$ est en dessous de $(D)$ ; elles se coupent au point d\'abscisse $1$.'
        ],
        aide: 'Valeurs exactes : 2 - 2ln(2) ; expressions : 1 - 2/x, -x + 3.'
      };
    }
  });

  /* ---------- Tle L : problème de suites (épargne, population) ---------- */
  var PRENOMS_F = ['Awa', 'Fatou', 'Aminata', 'Khady', 'Ndèye', 'Mariama', 'Coumba', 'Astou'];
  var PRENOMS_G = ['Moussa', 'Mamadou', 'Ousmane', 'Ibrahima', 'Cheikh', 'Abdou', 'Babacar', 'Modou'];
  EM.gen.register({
    id: 'tl-pb-suites',
    titre: 'Problème : suites et épargne, suites et population',
    chapitres: ['tl-suites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var fi = rng.pick(PRENOMS_F), ga = rng.pick(PRENOMS_G), K = rng.pick([200000, 300000, 500000]);
        var t = rng.pick([4, 5, 6, 8]), r = rng.pick([5, 6, 8, 10].filter(function (x) { return x !== t; })), qq = F(100 + t, 100), int1 = K * r / 100;
        var C1 = K * (100 + t) / 100, C10 = K * Math.pow(1 + t / 100, 10), M10 = K + 10 * int1, nD = 0;
        while (Math.pow(1 + t / 100, nD) < 2) nD++;
        trace('tl-pb-suites', { niveau: 1, K: K, t: t, r: r });
        var gagnant = C10 > M10 ? fi : ga;
        return {
          enonce: 'Le 1er janvier 2025, ' + fi + ' et ' + ga + ' placent chacun $' + T.num(K) + '$ F CFA dans une banque de Dakar. ' +
            fi + ' choisit un placement à intérêts composés au taux annuel de $' + t + '$ % ; ' + ga + ' choisit un placement à intérêts simples au taux annuel de $' + r + '$ % (chaque année, il reçoit $' + r + '$ % du capital initial). ' +
            'On note $C_n$ le capital de ' + fi + ' et $M_n$ celui de ' + ga + ' au bout de $n$ années ($C_0 = M_0 = ' + T.num(K) + '$).<br>' +
            '1) Calculer $C_1$. Justifier que $(C_n)$ est une suite géométrique et exprimer $C_n$ en fonction de $n$.<br>2) Justifier que $(M_n)$ est une suite arithmétique et exprimer $M_n$ en fonction de $n$.<br>' +
            '3) Calculer $C_{10}$ (arrondi au franc) et $M_{10}$. Qui possède le capital le plus élevé au bout de $10$ ans ?<br>4) Déterminer, à l\'aide du logarithme népérien, au bout de combien d\'années le capital de ' + fi + ' aura doublé.',
          questions: [
            { label: '1) $C_1 =$', type: 'number', reponse: C1, unite: 'F CFA' },
            { label: '1) $C_n =$', type: 'expr', variable: 'n', reponse: S(K) + '*' + S(qq) + '^n', reponseTex: T.num(K) + ' \\times ' + T.num(qq.value()) + '^{n}', domaine: [0, 8] },
            { label: '2) $M_n =$', type: 'expr', variable: 'n', reponse: polyS([int1, K], 'n'), reponseTex: T.poly([int1, K], 'n'), domaine: [0, 8] },
            { label: '3) $C_{10} \\approx$', type: 'number', reponse: C10, tol: 1, reponseTex: T.num(Math.round(C10)), unite: 'F CFA' },
            qcm(rng, '3) Au bout de 10 ans, le capital le plus élevé est celui de :', gagnant, [fi, ga]),
            { label: '4) Nombre d\'années :', type: 'number', reponse: nD, unite: 'ans' }
          ],
          indices: [
            'Augmenter de $' + t + '$ % revient à multiplier par $' + T.num(qq.value()) + '$ : suite géométrique. À intérêts simples, on ajoute chaque année le même montant $' + T.num(int1) + '$ F CFA : suite arithmétique.',
            '$C_n \\geq 2 \\times ' + T.num(K) + ' \\iff ' + T.num(qq.value()) + '^{n} \\geq 2 \\iff n \\geq \\dfrac{\\ln 2}{\\ln ' + T.num(qq.value()) + '}$.'
          ],
          solution: [
            '$C_1 = ' + T.num(K) + ' \\times ' + T.num(qq.value()) + ' = ' + T.num(C1) + '$ F CFA. Chaque année, le capital est multiplié par $1 + \\dfrac{' + t + '}{100} = ' + T.num(qq.value()) + '$ : $(C_n)$ est géométrique de raison $' + T.num(qq.value()) + '$ et $C_n = ' + T.num(K) + ' \\times ' + T.num(qq.value()) + '^{n}$.',
            'Chaque année, ' + ga + ' reçoit $' + T.num(K) + ' \\times \\dfrac{' + r + '}{100} = ' + T.num(int1) + '$ F CFA : $(M_n)$ est arithmétique de raison $' + T.num(int1) + '$ et $M_n = ' + T.poly([int1, K], 'n') + '$.',
            '$C_{10} = ' + T.num(K) + ' \\times ' + T.num(qq.value()) + '^{10} \\approx ' + T.num(Math.round(C10)) + '$ F CFA et $M_{10} = ' + T.num(K) + ' + 10 \\times ' + T.num(int1) + ' = ' + T.num(M10) + '$ F CFA : au bout de $10$ ans, c\'est ' + gagnant + ' qui a le capital le plus élevé.',
            '$C_n \\geq ' + T.num(2 * K) + ' \\iff ' + T.num(qq.value()) + '^{n} \\geq 2 \\iff n\\ln ' + T.num(qq.value()) + ' \\geq \\ln 2 \\iff n \\geq \\dfrac{\\ln 2}{\\ln ' + T.num(qq.value()) + '} \\approx ' + ap(Math.log(2) / Math.log(1 + t / 100)) + '$ (car $\\ln ' + T.num(qq.value()) + ' > 0$).',
            'Le capital de ' + fi + ' aura doublé au bout de $' + nD + '$ ans.'
          ],
          aide: 'Expressions en n : 300000*1.05^n ou 15000n + 300000 ; montants en F CFA.'
        };
      }
      var ville = rng.pick(['Kédougou', 'Matam', 'Podor', 'Sédhiou', 'Bakel', 'Linguère']);
      var tx = rng.pick([2, 4, 5, 10]), l = rng.pick([10000, 12000, 15000, 20000, 25000]), u0 = rng.pick([8000, 9000, 16000, 18000, 30000]);
      if (u0 === l) u0 += 2000;
      var q = F(100 - tx, 100), A = l * tx / 100, v0 = u0 - l;
      var u1 = q.mul(u0).add(A), u2 = q.mul(u1).add(A);
      trace('tl-pb-suites', { niveau: 2, tx: tx, l: l, u0: u0 });
      var unS = S(v0) + '*' + S(q) + '^n+' + S(l), unT = T.num(v0) + ' \\times ' + T.num(q.value()) + '^{n} + ' + T.num(l);
      return {
        enonce: 'La commune de ' + ville + ' compte $' + T.num(u0) + '$ habitants au 1er janvier 2025 (données fictives). Chaque année, $' + tx + '$ % des habitants quittent la commune et $' + T.num(A) + '$ nouvelles personnes viennent s\'y installer. ' +
          'On note $u_n$ le nombre d\'habitants au 1er janvier de l\'année $2025 + n$ ; ainsi $u_0 = ' + T.num(u0) + '$ et, pour tout entier naturel $n$, $u_{n+1} = ' + T.num(q.value()) + 'u_n + ' + T.num(A) + '$.<br>' +
          '1) Calculer $u_1$ et $u_2$ (arrondis à l\'unité si nécessaire).<br>2) On pose $v_n = u_n - ' + T.num(l) + '$. Montrer que $(v_n)$ est une suite géométrique ; préciser sa raison et son premier terme.<br>' +
          '3) Exprimer $v_n$, puis $u_n$, en fonction de $n$.<br>4) Déterminer la limite de la suite $(u_n)$ et interpréter le résultat.',
        questions: [
          { label: '1) $u_1 =$', type: 'number', reponse: u1, tol: 0.5, reponseTex: nb(u1) },
          { label: '1) $u_2 \\approx$', type: 'number', reponse: u2, tol: 0.5, reponseTex: (u2.isInt() ? nb(u2) : T.num(Math.round(u2.value()))) },
          { label: '2) Raison $q =$', type: 'number', reponse: q, reponseTex: nb(q) },
          { label: '2) $v_0 =$', type: 'number', reponse: v0 },
          { label: '3) $u_n =$', type: 'expr', variable: 'n', reponse: unS, reponseTex: unT, domaine: [0, 8] },
          { label: '4) $\\lim\\limits_{n \\to +\\infty} u_n =$', type: 'number', reponse: l }
        ],
        indices: [
          'Perdre $' + tx + '$ % revient à multiplier par $' + T.num(q.value()) + '$. Pour $(v_n)$, exprime $v_{n+1}$ en fonction de $u_n$, puis factorise par $' + T.num(q.value()) + '$.',
          '$v_n = v_0 q^n$ et $u_n = v_n + ' + T.num(l) + '$ ; comme $0 < q < 1$, $q^n$ tend vers $0$.'
        ],
        solution: [
          '$u_1 = ' + T.num(q.value()) + ' \\times ' + T.num(u0) + ' + ' + T.num(A) + ' = ' + nb(u1) + '$ et $u_2 = ' + T.num(q.value()) + ' \\times ' + nb(u1) + ' + ' + T.num(A) + ' = ' + nb(u2) + (u2.isInt() ? '' : ' \\approx ' + T.num(Math.round(u2.value()))) + '$.',
          '$v_{n+1} = u_{n+1} - ' + T.num(l) + ' = ' + T.num(q.value()) + 'u_n + ' + T.num(A) + ' - ' + T.num(l) + ' = ' + T.num(q.value()) + 'u_n - ' + T.num(q.mul(l).value()) + ' = ' + T.num(q.value()) + '(u_n - ' + T.num(l) + ') = ' + T.num(q.value()) + 'v_n$.',
          '$(v_n)$ est donc géométrique de raison $q = ' + T.num(q.value()) + '$ et de premier terme $v_0 = ' + T.num(u0) + ' - ' + T.num(l) + ' = ' + T.num(v0) + '$.',
          '$v_n = ' + T.num(v0) + ' \\times ' + T.num(q.value()) + '^{n}$ et $u_n = v_n + ' + T.num(l) + ' = ' + unT + '$.',
          'Comme $0 < ' + T.num(q.value()) + ' < 1$, $\\lim\\limits_{n \\to +\\infty} ' + T.num(q.value()) + '^{n} = 0$, donc $\\lim\\limits_{n \\to +\\infty} u_n = ' + T.num(l) + '$ : à long terme, la population se stabilise autour de $' + T.num(l) + '$ habitants (elle ' + (v0 > 0 ? 'diminue' : 'augmente') + ' vers cette valeur).'
        ],
        aide: 'Pour u_n, écris par exemple -4000*0.95^n + 20000.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
