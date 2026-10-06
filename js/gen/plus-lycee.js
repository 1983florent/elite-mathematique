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
    var raw = r / 8, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p;
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
            { label: '2) $A\'B\' =$', type: 'number', reponse: Lp, unite: 'cm' },
            { label: '3) Aire de $A\'B\'C\'$ :', type: 'number', reponse: aireP, unite: 'cm²' },
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
            { label: '1) $IJ =$', type: 'number', reponse: IJ, unite: 'cm' },
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
          { label: '2) $IJ =$', type: 'number', reponse: IJ2, unite: 'cm' },
          { label: '3) Périmètre de $IJK$ :', type: 'number', reponse: perP, unite: 'cm' },
          { label: '3) Aire de $IJK$ :', type: 'number', reponse: aireP, unite: 'cm²' }
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
    { t: 'Durée (en minutes) des appels passés en une journée depuis un télécentre de Thiès', a0: 0, w: 2, u: 'min', ind: 'appels', de: 'd\'appels' },
    { t: 'Recette journalière (en milliers de F CFA) des boutiques d\'un marché de Kaolack', a0: 10, w: 10, u: 'milliers de F CFA', ind: 'boutiques', de: 'de boutiques' },
    { t: 'Âge (en années) des joueurs inscrits à un tournoi de navétanes à Rufisque', a0: 15, w: 3, u: 'ans', ind: 'joueurs', de: 'de joueurs' },
    { t: 'Masse (en kg) des sacs de mil pesés au marché hebdomadaire de Diaobé', a0: 40, w: 5, u: 'kg', ind: 'sacs', de: 'de sacs' }
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
      var phrMe = 'La médiane correspond à l\'effectif cumulé $\\dfrac{N}{2} = ' + nb(F(N, 2)) + '$, atteint dans la classe ' + classe(Me.i) + ' (entre $' + E[Me.i] + '$ et $' + E[Me.i + 1] + '$). Par interpolation linéaire : $Me$ vérifie $' + Me.tex.replace('x =', 'Me =') + '$ ' + ctx.u + '.';
      if (niveau === 1) {
        var imode = ns.indexOf(mx), j = rng.int(2, 4), mIdx;
        do { mIdx = rng.int(1, 4); } while (mIdx === j);
        var pct = F((N - E[mIdx]) * 100, N);
        trace('1s-stat-mediane-classes', { niveau: 1, bornes: bornes, ns: ns, j: j, m: mIdx });
        enonce = ctx.t + ' :<br>' + tab + '1) Déterminer la classe modale de cette série.<br>2) Calculer les effectifs cumulés croissants et donner le nombre ' + ctx.de + ' dont la valeur est strictement inférieure à $' + T.num(bornes[j]) + '$.<br>' +
          '3) Déterminer la médiane $Me$ de la série par interpolation linéaire (arrondie au centième).<br>4) Calculer le pourcentage ' + ctx.de + ' dont la valeur est supérieure ou égale à $' + T.num(bornes[mIdx]) + '$ (arrondi au dixième).';
        qs = [
          qcm(rng, '1) Classe modale :', classe(imode), [0, 1, 2, 3, 4].map(classe)),
          { label: '2) Nombre ' + ctx.de + ' de valeur inférieure à $' + T.num(bornes[j]) + '$ :', type: 'number', reponse: E[j] },
          { label: '3) $Me \\approx$', type: 'number', reponse: Me.v, tol: 0.01, reponseTex: ap(Me.v), unite: ctx.u },
          { label: '4) Pourcentage :', type: 'number', reponse: pct, tol: 0.1, reponseTex: ap(pct, 1), unite: '%' }
        ];
        sol.unshift('La classe modale est la classe de plus grand effectif : ' + classe(imode) + ' (effectif $' + mx + '$).');
        sol.push('Il y a $' + E[j] + '$ ' + ctx.ind + ' de valeur strictement inférieure à $' + T.num(bornes[j]) + '$ (effectif cumulé à cette borne).');
        sol.push(phrMe);
        sol.push('$' + E[mIdx] + '$ ' + ctx.ind + ' ont une valeur inférieure à $' + T.num(bornes[mIdx]) + '$, donc $' + N + ' - ' + E[mIdx] + ' = ' + (N - E[mIdx]) + '$ ont une valeur supérieure ou égale : $\\dfrac{' + (N - E[mIdx]) + '}{' + N + '} \\times 100 ' + (pct.isInt() || nb(pct).indexOf('dfrac') < 0 ? '= ' + nb(pct) : '\\approx ' + ap(pct, 1)) + '$ %.');
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
          { label: '$\\overline{x} =$', type: 'number', reponse: moy, tol: 0.01, reponseTex: (nb(moy).indexOf('dfrac') < 0 ? nb(moy) : ap(moy)), unite: ctx.u }
        ];
        sol.push('$Q_1$ correspond à l\'effectif cumulé $\\dfrac{N}{4} = ' + nb(F(N, 4)) + '$, atteint dans la classe ' + classe(Q1.i) + ' : $' + Q1.tex.replace('x =', 'Q_1 =') + '$.');
        sol.push(phrMe);
        sol.push('$Q_3$ correspond à l\'effectif cumulé $\\dfrac{3N}{4} = ' + nb(F(3 * N, 4)) + '$, atteint dans la classe ' + classe(Q3.i) + ' : $' + Q3.tex.replace('x =', 'Q_3 =') + '$.');
        sol.push('Écart interquartile : $Q_3 - Q_1 \\approx ' + ap(EI) + '$ ' + ctx.u + ' : la moitié centrale des ' + ctx.ind + ' se situe dans un intervalle de cette amplitude.');
        sol.push('Centres des classes : $' + ns.map(function (n, i) { return T.num((bornes[i] + bornes[i + 1]) / 2); }).join(' \\,;\\, ') + '$. $\\overline{x} = \\dfrac{' + ns.map(function (n, i) { return n + ' \\times ' + T.num((bornes[i] + bornes[i + 1]) / 2); }).join(' + ') + '}{' + N + '} ' + (nb(moy).indexOf('dfrac') < 0 ? '= ' + nb(moy) : '\\approx ' + ap(moy)) + '$ ' + ctx.u + '.');
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
      trace('ts-simil-deux-points', { niveau: niveau, A: A, B: B, A1: A1, B1: B1 });
      var sol = [
        '$s$ a une écriture de la forme $z\' = az + b$. Les conditions $s(A) = A\'$ et $s(B) = B\'$ donnent $z_{A\'} = az_A + b$ et $z_{B\'} = az_B + b$.',
        'Par soustraction : $a = \\dfrac{z_{B\'} - z_{A\'}}{z_B - z_A} = \\dfrac{' + cTex(dp) + '}{' + cTex(dd) + '}' +
          (dd.y.isZero() ? '' : ' = \\dfrac{' + cPar(dp) + cPar(cConj(dd)) + '}{' + cN2(dd).tex() + '}') + ' = ' + cTex(a) + '$.',
        'Puis $b = z_{A\'} - az_A = ' + cTex(A1) + ' - ' + cPar(a) + cPar(A) + ' = ' + cTex(b) + '$. Donc $s : ' + ecrSim(a, b) + '$.'
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
        qs.splice(1, 0, { label: 'Rapport $k =$', type: 'number', reponse: d.kS, reponseTex: d.k }, { label: 'Angle $\\theta =$', type: 'number', reponse: d.thS, reponseTex: d.th });
        do { C0 = Cx(rng.int(-3, 3), rng.int(-3, 3)); } while (cEq(C0, A) || cEq(C0, B));
        Cimg = cAdd(cMul(a, C0), b);
        qs.push({ label: 'Point $C$ tel que $s(C) = C\'$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [C0.x, C0.y] });
        sol.push('$s(C) = C\' \\iff z_{C\'} = az_C + b \\iff z_C = \\dfrac{z_{C\'} - b}{a} = \\dfrac{' + cTex(cSub(Cimg, b)) + '}{' + cTex(a) + '} = ' + cTex(C0) + '$.');
      }
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
            { label: '2) Angle de $s^{-1}$ :', type: 'number', reponse: di.thS, reponseTex: di.th }
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
          { label: '2) Angle $\\theta =$', type: 'number', reponse: dc.thS, reponseTex: dc.th },
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
            '$MF = e \\times MH$ avec $e = 1$ : c\'est la définition d\'une parabole. Écris $MF^2 = MH^2$ avec $M(x \\,;\\, y)$ et $MH = |' + u + ' - ' + T.par(de) + '|$.',
            'Le sommet est le milieu du segment joignant $F$ à son projeté sur $(D)$ ; le paramètre $p$ est la distance de $F$ à $(D)$.'
          ],
          solution: [
            '$MF = 1 \\times MH$ : $(\\Gamma)$ est la parabole de foyer $F$ et de directrice $(D)$, d\'excentricité $e = 1$.',
            '$M(x \\,;\\, y) \\in (\\Gamma) \\iff MF^2 = MH^2 \\iff ' + carre(u, f1) + ' + ' + carre(v, f2) + ' = ' + carre(u, de) + '$.',
            'D\'où $' + carre(v, f2) + ' = ' + carre(u, de) + ' - ' + carre(u, f1) + ' = ' + T.poly([2 * P, de * de - f1 * f1], u) + ' = ' + (2 * P) + T.xMinus(sm, u) + '$.',
            'Le paramètre est la distance de $F$ à $(D)$ : $p = |' + f1 + ' - ' + T.par(de) + '| = ' + Math.abs(P) + '$. Le sommet est le milieu de $F$ et de son projeté sur $(D)$ : $S' + pt(Sm[0], Sm[1]) + '$.',
            'En isolant $' + u + '$ : $' + u + ' = \\dfrac{' + carre(v, f2) + '}{' + (2 * P) + '}' + (sm.isZero() ? '' : T.signed(sm)) + ' = ' + expr.tex + '$.'
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
          'En divisant par $' + T.par(a * a - c * c) + '$ : $\\dfrac{x^2}{' + (a * a) + '} ' + (ell ? '+' : '-') + ' \\dfrac{y^2}{' + b2 + '} = 1$. Donc $\\alpha = ' + (a * a) + '$ et $\\beta = ' + b2 + '$ ($a = ' + a + '$, $c = ' + c + '$, $e = \\dfrac{c}{a}$).',
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
          '$\\|\\vect{AM} \\wedge \\vec{u}\\| = \\sqrt{' + W2 + '}$ et $\\|\\vec{u}\\| = \\sqrt{' + uu + '}$, donc $d(M, (\\Delta)) = \\sqrt{\\dfrac{' + W2 + '}{' + uu + '}} = ' + radTex(dist.m, dist.s) + '$.',
          '$\\vect{AM} \\cdot \\vec{u} = ' + dot(AM, u) + '$, donc $\\lambda = \\dfrac{' + dot(AM, u) + '}{' + uu + '}' + (lam.d === uu ? '' : ' = ' + lam.tex()) + '$ et $H = A + \\lambda\\vec{u}$, soit $H' + t3(Hh) + '$.'
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
        'La droite de Mayer est la droite $(G_1G_2)$ : $a = \\dfrac{y_{G_2} - y_{G_1}}{x_{G_2} - x_{G_1}} = ' + aT + '$ et $b = y_{G_1} - a\\,x_{G_1} = ' + bT + '$, soit $y = ax + b$.'
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

  /* @@PROBLEMES@@ */
})(typeof window !== 'undefined' ? window : globalThis);
