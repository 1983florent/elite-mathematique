/*
 * Générateurs d'exercices : 1ère S1 et 1ère S2.
 * Chaque exercice est reproductible (graine), vérifié automatiquement et accompagné
 * d'une correction détaillée. Énoncés à l'infinitif ; indices et corrections tutoient l'élève.
 * (La résolution d'une équation du second degré est fournie par « second-degre-equation ».)
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, Frac = EM.Frac;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  function fr(v) { return v instanceof Frac ? v : F(v); }

  /** Polynôme (coefficients décroissants) écrit pour l'analyseur : 2*x^2-3/4*x+1 */
  function pstr(coefs, v) {
    v = v || 'x';
    var deg = coefs.length - 1, s = '';
    for (var i = 0; i < coefs.length; i++) {
      var c = fr(coefs[i]);
      if (c.isZero()) continue;
      var p = deg - i, a = c.abs();
      var body;
      if (p === 0) body = a.d === 1 ? String(a.n) : a.n + '/' + a.d;
      else {
        body = a.equals(1) ? '' : (a.d === 1 ? a.n + '*' : a.n + '/' + a.d + '*');
        body += v + (p > 1 ? '^' + p : '');
      }
      s += (c.n < 0 ? '-' : (s ? '+' : '')) + body;
    }
    return s || '0';
  }
  /** Valeur exacte d'un polynôme (fractions). */
  function pvalF(coefs, x) {
    var r = F(0), xf = fr(x);
    coefs.forEach(function (c) { r = r.mul(xf).add(fr(c)); });
    return r;
  }
  function pval(coefs, x) { return coefs.reduce(function (s, c) { return s * x + fr(c).value(); }, 0); }
  /** Dérivée d'un polynôme (coefficients décroissants). */
  function pder(coefs) {
    var n = coefs.length - 1, out = [];
    for (var i = 0; i < n; i++) out.push(fr(coefs[i]).mul(n - i));
    return out.length ? out : [F(0)];
  }
  /** Coefficient devant une parenthèse : 1 -> '', -1 -> '-', 3 -> '3'. */
  function cf(k) { k = fr(k); return k.equals(1) ? '' : k.equals(-1) ? '-' : T.num(k); }
  /** Question à choix multiple : mélange, sans doublon. */
  function qcm(rng, label, bonne, autres) {
    var all = [bonne];
    autres.forEach(function (a) { if (all.indexOf(a) < 0) all.push(a); });
    var sh = rng.shuffle(all);
    return { label: label, type: 'choice', choix: sh, reponse: sh.indexOf(bonne) };
  }
  /** k·π en TeX (k fraction) : -\dfrac{5\pi}{6} */
  function piTex(k) {
    k = fr(k);
    if (k.isZero()) return '0';
    var a = Math.abs(k.n), num = (a === 1 ? '' : a) + '\\pi';
    return (k.n < 0 ? '-' : '') + (k.d === 1 ? num : '\\dfrac{' + num + '}{' + k.d + '}');
  }
  /** k·π pour l'analyseur : -5*pi/6 */
  function piStr(k) {
    k = fr(k);
    if (k.isZero()) return '0';
    var a = Math.abs(k.n);
    return (k.n < 0 ? '-' : '') + (a === 1 ? '' : a + '*') + 'pi' + (k.d === 1 ? '' : '/' + k.d);
  }
  /** Mesure principale (coefficient de π ramené dans ]-1 ; 1]). */
  function principal(k) {
    k = fr(k);
    var m = Math.ceil((k.n - k.d) / (2 * k.d));
    return k.sub(2 * m);
  }
  /** √(n) pour n fraction positive : { c: Frac, r: entier sans facteur carré } avec √n = c√r */
  function sqrtSimp(n) {
    n = fr(n);
    var s = EM.ar.sqrtSimplify(n.n * n.d);
    return { c: F(s.a, n.d), r: s.b };
  }
  /** c√r en TeX */
  function rootTex(c, r) {
    c = fr(c);
    if (c.isZero()) return '0';
    if (r === 1) return c.tex();
    var a = c.abs(), top = (a.n === 1 ? '' : a.n) + '\\sqrt{' + r + '}';
    return (c.n < 0 ? '-' : '') + (a.d === 1 ? top : '\\dfrac{' + top + '}{' + a.d + '}');
  }
  /** c√r pour l'analyseur */
  function rootStr(c, r) {
    c = fr(c);
    if (c.isZero()) return '0';
    if (r === 1) return c.toString();
    var a = c.abs();
    return (c.n < 0 ? '-' : '') + (a.n === 1 ? '' : a.n + '*') + 'sqrt(' + r + ')' + (a.d === 1 ? '' : '/' + a.d);
  }
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function arr(n, p) { var r = 1; for (var i = 0; i < p; i++) r *= (n - i); return r; }
  function comb(n, p) { if (p < 0 || p > n) return 0; return Math.round(arr(n, p) / fact(p)); }
  function sgnTex(s) { return s > 0 ? '+' : '-'; }
  /** Terme « + k/den » ou « - |k|/den » (k entier non nul). */
  function fracTerm(k, den) { return (k < 0 ? ' - ' : ' + ') + '\\dfrac{' + Math.abs(k) + '}{' + den + '}'; }
  /** Fraction en tête d'expression : -\dfrac{3}{x + 2} */
  function fracLead(k, den) { return (k < 0 ? '-' : '') + '\\dfrac{' + Math.abs(k) + '}{' + den + '}'; }
  /** Met une expression entre parenthèses si elle comporte plusieurs termes. */
  function pw(t) { return /[+-]/.test(t.slice(1)) ? '(' + t + ')' : t; }

  /**
   * Tableau de signes (KaTeX array).
   * points : [{v: nombre, tex: '…'}] triés ; facteurs : [{label, f: x -> nombre, root: nombre, den: booléen}]
   * label final : texte de la dernière ligne (produit / quotient).
   */
  function signTable(points, factors, lastLabel) {
    var n = points.length, tests = [], i;
    for (i = 0; i <= n; i++) {
      var lo = i === 0 ? points[0].v - 1 : points[i - 1].v;
      var hi = i === n ? points[n - 1].v + 1 : points[i].v;
      tests.push((lo + hi) / 2);
    }
    function near(a, b) { return Math.abs(a - b) < 1e-9; }
    var rows = [];
    var head = ['x', '-\\infty'];
    points.forEach(function (p) { head.push('', p.tex); });
    head.push('', '+\\infty');
    rows.push(head);
    factors.forEach(function (fa) {
      var r = [fa.label, ''];
      for (var j = 0; j <= n; j++) {
        r.push(sgnTex(fa.f(tests[j])));
        if (j < n) r.push(fa.root != null && near(fa.root, points[j].v) ? (fa.den ? '\\|' : '0') : '');
      }
      r.push('');
      rows.push(r);
    });
    var last = [lastLabel, ''];
    for (var j = 0; j <= n; j++) {
      var s = 1;
      factors.forEach(function (fa) { s *= fa.f(tests[j]) > 0 ? 1 : -1; });
      last.push(sgnTex(s));
      if (j < n) {
        var mark = '';
        factors.forEach(function (fa) { if (fa.root != null && near(fa.root, points[j].v)) mark = fa.den ? '\\|' : (mark === '\\|' ? mark : '0'); });
        last.push(mark);
      }
    }
    last.push('');
    rows.push(last);
    var cols = 'c|';
    for (i = 1; i < head.length; i++) cols += 'c';
    return '$$\\begin{array}{' + cols + '} ' + rows.map(function (r) { return r.join(' & '); }).join(' \\\\ \\hline ') + ' \\end{array}$$';
  }

  /**
   * Tableau de variation sur une ligne (KaTeX array).
   * xs : abscisses (TeX) ; signes : signes de f' entre deux abscisses ('+', '-') ;
   * zeros : marques de f' sous chaque abscisse intérieure ('0', '\\|' ou '') ; vals : valeurs de f (TeX) sous chaque abscisse.
   */
  function varTable(xs, signes, zeros, vals, nomF) {
    nomF = nomF || 'f';
    var r1 = ['x'], r2 = [nomF + '\'(x)'], r3 = [nomF + '(x)'];
    for (var i = 0; i < xs.length; i++) {
      r1.push(xs[i]);
      r2.push(i === 0 || i === xs.length - 1 ? '' : zeros[i - 1]);
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

  /** Écriture « substituée » d'un polynôme en une valeur : 2 \times (-1)^{3} - 3 \times (-1)^{2} + 5 */
  function substTex(coefs, xv) {
    var deg = coefs.length - 1, out = '', first = true, xf = fr(xv);
    var base = (xf.d !== 1 || xf.n < 0) ? '\\left(' + T.num(xf) + '\\right)' : T.num(xf);
    for (var i = 0; i < coefs.length; i++) {
      var c = fr(coefs[i]);
      if (c.isZero()) continue;
      var p = deg - i, term;
      if (p === 0) term = T.signed(c, first);
      else {
        var a = c.abs();
        var pw = p === 1 ? base : base + '^{' + p + '}';
        term = (first ? (c.n < 0 ? '-' : '') : (c.n < 0 ? ' - ' : ' + ')) + (a.equals(1) ? '' : T.num(a) + ' \\times ') + pw;
      }
      out += term;
      first = false;
    }
    return out || '0';
  }
  /** lim en TeX : x -> a, ou x -> a avec x > a / x < a */
  function limTex(a, cote) {
    var at = typeof a === 'string' ? a : T.num(a);
    if (!cote) return '\\lim\\limits_{x \\to ' + at + '}';
    return '\\lim\\limits_{\\substack{x \\to ' + at + ' \\\\ x ' + (cote > 0 ? '>' : '<') + ' ' + at + '}}';
  }
  var INF = ['$+\\infty$', '$-\\infty$'];

  var PRENOMS = ['Awa', 'Moussa', 'Fatou', 'Mamadou', 'Aminata', 'Ibrahima', 'Khady', 'Ousmane', 'Seynabou', 'Cheikh', 'Ndèye', 'Abdoulaye', 'Mariama', 'Babacar', 'Aïssatou', 'Modou', 'Coumba', 'Lamine'];
  var VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Rufisque', 'Tambacounda', 'Kolda', 'Louga', 'Matam', 'Diourbel', 'Fatick', 'Kédougou', 'Sédhiou', 'Kaffrine'];

  /* ================================================================== */
  /* 1. Polynômes, équations et inéquations                              */
  /* ================================================================== */

  /* -------- Factorisation par (x - a) -------- */
  EM.gen.register({
    id: '1s-factorisation-racine',
    titre: 'Factoriser un polynôme de degré 3 connaissant une racine',
    chapitres: ['1s-polynomes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.nz(-3, 3), b, p, q;
      if (niveau === 1) {
        b = 1; p = rng.int(-5, 5); q = rng.nz(-6, 6);
      } else if (niveau === 2) {
        b = 1;
        if (rng.bool(0.75)) {
          var r = rng.intExcept(-5, 5, [0, a]), s = rng.intExcept(-5, 5, [0, a, r]);
          p = -(r + s); q = r * s;
        } else {
          p = rng.int(-3, 3); q = Math.floor(p * p / 4) + rng.int(1, 4);
        }
      } else {
        b = rng.pick([2, 3, -2, -1, 2]);
        var r3, s3, guard = 0;
        do { r3 = rng.nz(-5, 5); s3 = rng.intExcept(-4, 4, [0, a]); guard++; }
        while ((F(r3, b).equals(a) || F(r3, b).equals(s3)) && guard < 60);
        p = -(r3 + b * s3); q = r3 * s3;
      }
      var P = [b, p - a * b, q - a * p, -a * q];
      var Ptex = T.poly(P), Qtex = T.poly([b, p, q]), xa = T.xMinus(a);
      var steps = [
        '$P(' + T.num(a) + ') = ' + substTex(P, a) + ' = 0$ : le réel $' + T.num(a) + '$ est racine de $P$, donc $P(x)$ est factorisable par $' + xa + '$.',
        'On cherche $Q(x) = \\alpha x^2 + \\beta x + \\gamma$ tel que $P(x) = ' + xa + '(\\alpha x^2 + \\beta x + \\gamma)$. En développant : $$' + xa + '(\\alpha x^2 + \\beta x + \\gamma) = \\alpha x^3 + (\\beta' + T.mono(-a, '\\alpha') + ')x^2 + (\\gamma' + T.mono(-a, '\\beta') + ')x' + T.mono(-a, '\\gamma') + '$$',
        'Par identification avec $P(x) = ' + Ptex + '$ : $\\alpha = ' + T.num(b) + '$ ; $\\beta' + T.mono(-a, '\\alpha') + ' = ' + T.num(P[1]) + '$ donc $\\beta = ' + T.num(p) + '$ ; $' + T.mono(-a, '\\gamma', true) + ' = ' + T.num(P[3]) + '$ donc $\\gamma = ' + T.num(q) + '$. On vérifie le coefficient de $x$ : $\\gamma' + T.mono(-a, '\\beta') + ' = ' + T.num(P[2]) + '$.',
        'Donc $Q(x) = ' + Qtex + '$ et $P(x) = ' + xa + '(' + Qtex + ')$.'
      ];
      var questions = [{ label: '$Q(x) =$', type: 'expr', reponse: pstr([b, p, q]), reponseTex: Qtex }];
      if (niveau >= 2) {
        var delta = p * p - 4 * b * q, sols = [F(a)];
        if (delta < 0) {
          steps.push('Pour $Q(x) = 0$ : $\\Delta = ' + T.par(p) + '^2 - 4 \\times ' + T.par(b) + ' \\times ' + T.par(q) + ' = ' + T.num(delta) + ' < 0$, donc $Q$ n’a pas de racine réelle.');
        } else {
          var sd = Math.round(Math.sqrt(delta));
          var x1 = F(-p - sd, 2 * b), x2 = F(-p + sd, 2 * b);
          steps.push('Pour $Q(x) = 0$ : $\\Delta = ' + T.par(p) + '^2 - 4 \\times ' + T.par(b) + ' \\times ' + T.par(q) + ' = ' + T.num(delta) + '$, $\\sqrt{\\Delta} = ' + sd + '$, d’où $x_1 = \\dfrac{' + T.num(-p) + ' - ' + sd + '}{' + T.num(2 * b) + '} = ' + x1.tex() + '$ et $x_2 = \\dfrac{' + T.num(-p) + ' + ' + sd + '}{' + T.num(2 * b) + '} = ' + x2.tex() + '$.');
          sols.push(x1, x2);
        }
        sols.sort(function (u, v) { return u.cmp(v); });
        steps.push('Les solutions de $P(x) = 0$ sont $' + T.num(a) + '$ et les racines de $Q$ : $S = ' + T.set(sols.map(function (s) { return s.tex(); })) + '$.');
        questions.push({ label: 'Solutions de $P(x) = 0$ : $S =$', type: 'set', reponse: sols });
      }
      return {
        enonce: 'On considère le polynôme $P(x) = ' + Ptex + '$.<br>Vérifier que $' + T.num(a) + '$ est une racine de $P$, puis déterminer le polynôme $Q$ tel que $P(x) = ' + xa + 'Q(x)$.' +
          (niveau >= 2 ? ' En déduire les solutions de l’équation $P(x) = 0$.' : ''),
        questions: questions,
        indices: [
          'Calcule $P(' + T.num(a) + ')$ : tu dois trouver $0$.',
          'Écris $P(x) = ' + xa + '(\\alpha x^2 + \\beta x + \\gamma)$, développe et identifie les coefficients (ou utilise la méthode de Horner).'
        ],
        solution: steps,
        aide: 'Écris $Q(x)$ sous la forme $ax^2 + bx + c$. Sépare les solutions par « ; ».'
      };
    }
  });

  /* -------- Équation bicarrée -------- */
  EM.gen.register({
    id: '1s-bicarree',
    titre: 'Résoudre une équation bicarrée',
    chapitres: ['1s-polynomes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sq = [1, 4, 9, 16, 25], ns = [2, 3, 5, 6, 7, 8, 12];
      var pool = niveau === 1 ? sq : sq.concat(ns);
      var a = niveau === 1 ? 1 : rng.pick([1, 1, 2, -1, -2]);
      var cas = rng.pick(niveau === 1 ? ['pp', 'pp', 'pn'] : ['pp', 'pn', 'pn', 'nn', 'pp']);
      var X1, X2, pair;
      if (cas === 'pp') { pair = rng.sample(pool, 2); X1 = pair[0]; X2 = pair[1]; }
      else if (cas === 'pn') { X1 = rng.pick(pool); X2 = -rng.int(1, 9); }
      else { X1 = -rng.int(1, 5); X2 = -rng.intExcept(1, 9, [-X1]); }
      var B = -a * (X1 + X2), C = a * X1 * X2;
      var delta = B * B - 4 * a * C, sd = Math.round(Math.sqrt(delta));
      var Xa = F(-B - sd, 2 * a), Xb = F(-B + sd, 2 * a);
      var Xs = [Xa, Xb].sort(function (u, v) { return u.cmp(v); });
      var sols = [], steps = [
        'On pose $X = x^2$, avec $X \\geq 0$. L’équation devient $' + T.poly([a, B, C], 'X') + ' = 0$.',
        '$\\Delta = ' + T.par(B) + '^2 - 4 \\times ' + T.par(a) + ' \\times ' + T.par(C) + ' = ' + T.num(delta) + '$ et $\\sqrt{\\Delta} = ' + sd + '$ : $X_1 = \\dfrac{' + T.num(-B) + ' - ' + sd + '}{' + T.num(2 * a) + '} = ' + Xa.tex() + '$ et $X_2 = \\dfrac{' + T.num(-B) + ' + ' + sd + '}{' + T.num(2 * a) + '} = ' + Xb.tex() + '$.'
      ];
      Xs.forEach(function (X) {
        var v = X.value();
        if (v < 0) { steps.push('$x^2 = ' + X.tex() + '$ est impossible : un carré n’est jamais négatif.'); return; }
        var s = EM.ar.sqrtSimplify(v);
        if (s.b === 1) {
          sols.push({ v: -s.a, r: -s.a, t: T.num(-s.a) }, { v: s.a, r: s.a, t: T.num(s.a) });
          steps.push('$x^2 = ' + X.tex() + '$ donne $x = ' + s.a + '$ ou $x = -' + s.a + '$.');
        } else {
          var tx = T.sqrt(v);
          sols.push({ v: -Math.sqrt(v), r: '-sqrt' + v, t: '-' + tx }, { v: Math.sqrt(v), r: 'sqrt' + v, t: tx });
          steps.push('$x^2 = ' + X.tex() + '$ donne $x = \\sqrt{' + v + '}' + (tx !== '\\sqrt{' + v + '}' ? ' = ' + tx : '') + '$ ou $x = -' + tx + '$.');
        }
      });
      sols.sort(function (u, v) { return u.v - v.v; });
      var S = sols.length ? T.set(sols.map(function (s) { return s.t; })) : '\\varnothing';
      steps.push('$S = ' + S + '$');
      return {
        enonce: 'Résoudre dans $\\R$ l’équation : $$' + T.poly([a, 0, B, 0, C]) + ' = 0$$',
        questions: [{ label: '$S =$', type: 'set', reponse: sols.map(function (s) { return s.r; }), reponseTex: S }],
        indices: [
          'Pose $X = x^2$ (avec $X \\geq 0$) : tu obtiens une équation du second degré en $X$.',
          'Pour chaque solution $X$ positive, résous $x^2 = X$ : deux solutions opposées $\\pm\\sqrt{X}$.'
        ],
        solution: steps,
        aide: 'Sépare les solutions par « ; ». Tu peux écrire √3 ou sqrt(3). Écris « ∅ » s’il n’y a pas de solution.'
      };
    }
  });

  /* -------- Équation irrationnelle -------- */
  EM.gen.register({
    id: '1s-equation-irrationnelle',
    titre: 'Résoudre une équation irrationnelle √(ax + b) = mx + c',
    chapitres: ['1s-polynomes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var m = niveau === 1 ? 1 : rng.pick([2, -1, 2, 3]);
      var r1, r2, c, A, B, ok = false, guard = 0, valid;
      while (!ok && guard++ < 400) {
        r1 = rng.int(-6, 8); r2 = rng.intExcept(-6, 8, [r1]); c = rng.int(-5, 6);
        A = 2 * m * c + m * m * (r1 + r2); B = c * c - m * m * r1 * r2;
        valid = [r1, r2].filter(function (r) { return m * r + c >= 0; });
        ok = A !== 0 && Math.abs(A) <= 18 && Math.abs(B) <= 60 && valid.length >= 1;
        if (ok && valid.length === 2 && rng.bool(0.6)) ok = false;
      }
      if (!ok) { m = 1; r1 = 3; r2 = -1; c = 0; A = 2; B = 3; }
      if (r1 > r2) { var t = r1; r1 = r2; r2 = t; }
      var lin = T.poly([m, c]);
      var bound = F(-c, m);
      var cond = m > 0 ? 'x \\geq ' + bound.tex() : 'x \\leq ' + bound.tex();
      var Q = [m * m, 2 * m * c - A, c * c - B];
      var delta = Q[1] * Q[1] - 4 * Q[0] * Q[2], sd = Math.round(Math.sqrt(delta));
      function subst(x) {
        return (m === 1 ? '' : m === -1 ? '-' : m + ' \\times ') + T.par(x) + (c ? T.signed(c) : '');
      }
      var sols = [];
      var steps = [
        'Condition : le membre de droite doit être positif ou nul, $' + lin + ' \\geq 0$, c’est-à-dire $' + cond + '$.',
        'Sous cette condition, on élève au carré : $' + T.poly([A, B]) + ' = (' + lin + ')^2 = ' + T.poly([m * m, 2 * m * c, c * c]) + '$, soit $' + T.poly(Q) + ' = 0$. (Le radicande est alors automatiquement positif, puisqu’il est égal à un carré.)',
        '$\\Delta = ' + T.par(Q[1]) + '^2 - 4 \\times ' + T.par(Q[0]) + ' \\times ' + T.par(Q[2]) + ' = ' + T.num(delta) + '$, $\\sqrt{\\Delta} = ' + sd + '$ : cette équation a pour solutions $' + r1 + '$ et $' + r2 + '$.'
      ];
      [r1, r2].forEach(function (r) {
        var v = m * r + c;
        if (v >= 0) { sols.push(r); steps.push('Pour $x = ' + r + '$ : $' + subst(r) + ' = ' + v + ' \\geq 0$, la condition est vérifiée : $' + r + '$ est solution.'); }
        else steps.push('Pour $x = ' + r + '$ : $' + subst(r) + ' = ' + v + ' < 0$, la condition n’est pas vérifiée : $' + r + '$ est une solution parasite, on la rejette.');
      });
      steps.push('$S = ' + T.set(sols) + '$');
      return {
        enonce: 'Résoudre dans $\\R$ l’équation : $$\\sqrt{' + T.poly([A, B]) + '} = ' + lin + '$$',
        questions: [{ label: '$S =$', type: 'set', reponse: sols }],
        indices: [
          'Une racine carrée est positive : écris d’abord la condition $' + lin + ' \\geq 0$.',
          'Élève ensuite au carré, résous l’équation du second degré obtenue et vérifie chaque solution trouvée.'
        ],
        solution: steps,
        aide: 'Sépare les solutions par « ; ». Écris « ∅ » s’il n’y a pas de solution.'
      };
    }
  });

  /* -------- Inéquation rationnelle (tableau de signes) -------- */
  EM.gen.register({
    id: '1s-inequation-signe',
    titre: 'Résoudre une inéquation à l’aide d’un tableau de signes',
    chapitres: ['1s-polynomes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var strict = rng.bool(), steps = [], enonce, rep, factors, points, ineq;
      var opLe = strict ? '<' : '\\leq', opGe = strict ? '>' : '\\geq';
      function between(rootNum, pole) {
        var lo = rootNum.cmp(pole) < 0 ? rootNum : pole, hi = rootNum.cmp(pole) < 0 ? pole : rootNum;
        return {
          a: lo, b: hi,
          ouvA: lo === pole ? true : strict,
          ouvB: hi === pole ? true : strict
        };
      }
      if (niveau === 1 || (niveau === 2 && rng.bool(0.5))) {
        var p, q, r, s;
        if (niveau === 1) { p = rng.pick([1, -1]); q = -p * rng.int(-6, 6); r = 1; s = -rng.int(-6, 6); }
        else { p = rng.pick([1, 2, 3, -1, -2]); q = rng.int(-6, 6); r = rng.pick([1, 2, -1, -2]); s = rng.int(-6, 6); }
        var al = F(-q, p), be = F(-s, r), g = 0;
        while (al.equals(be) && g++ < 20) { s = rng.int(-6, 6); be = F(-s, r); }
        if (al.equals(be)) { s = s + 1; be = F(-s, r); }
        var numT = T.poly([p, q]), denT = T.poly([r, s]);
        var inside = -Math.sign(p * r); // signe du quotient entre les racines
        ineq = inside < 0 ? opLe : opGe;
        enonce = 'Résoudre dans $\\R$ l’inéquation : $$\\dfrac{' + numT + '}{' + denT + '} ' + ineq + ' 0$$';
        points = [{ v: al.value(), tex: al.tex() }, { v: be.value(), tex: be.tex() }].sort(function (u, v) { return u.v - v.v; });
        factors = [
          { label: numT, f: function (x) { return p * x + q; }, root: al.value() },
          { label: denT, f: function (x) { return r * x + s; }, root: be.value(), den: true }
        ];
        rep = between(al, be);
        steps.push('Valeur interdite : $' + denT + ' = 0 \\iff x = ' + be.tex() + '$. Le numérateur s’annule pour $x = ' + al.tex() + '$.');
        steps.push('Tableau de signes (le signe de $ax + b$ est celui de $a$ à droite de sa racine) :' + signTable(points, factors, '\\text{quotient}'));
      } else if (niveau === 2) {
        var alpha = rng.int(-5, 5), u = rng.int(-3, 3), v = Math.floor(u * u / 4) + rng.int(1, 4);
        var dirUp = rng.bool();
        ineq = dirUp ? opGe : opLe;
        var quadT = T.poly([1, u, v]), linT = T.poly([1, -alpha]);
        enonce = 'Résoudre dans $\\R$ l’inéquation : $$(' + linT + ')(' + quadT + ') ' + ineq + ' 0$$';
        var dq = u * u - 4 * v;
        steps.push('Pour $' + quadT + '$ : $\\Delta = ' + T.par(u) + '^2 - 4 \\times ' + v + ' = ' + dq + ' < 0$, donc ce trinôme garde le signe de son coefficient dominant : il est toujours strictement positif.');
        steps.push('Le produit a donc le signe de $' + linT + '$, qui s’annule en $' + alpha + '$ :' + signTable([{ v: alpha, tex: T.num(alpha) }], [
          { label: linT, f: function (x) { return x - alpha; }, root: alpha },
          { label: quadT, f: function (x) { return x * x + u * x + v; }, root: null }
        ], '\\text{produit}'));
        rep = dirUp ? { a: F(alpha), b: Infinity, ouvA: strict, ouvB: true } : { a: -Infinity, b: F(alpha), ouvA: true, ouvB: strict };
      } else {
        var rr = rng.int(-6, 6), d = rng.intExcept(-6, 6, [-rr]), k = rng.pick([1, 2, -1, 3, -2]);
        var mm = rng.pick([1, 2, -1, -2]), guard = 0;
        while (mm + k === 0 && guard++ < 10) mm = rng.pick([1, 2, -1, -2]);
        if (mm + k === 0) mm = mm > 0 ? mm + 1 : mm - 1;
        var A = mm + k, B = -mm * rr + k * d;
        var dT = T.poly([1, d]);
        ineq = mm > 0 ? opLe : opGe;
        enonce = 'Résoudre dans $\\R$ l’inéquation : $$\\dfrac{' + T.poly([A, B]) + '}{' + dT + '} ' + ineq + ' ' + T.num(k) + '$$';
        var nT = T.poly([mm, -mm * rr]);
        steps.push('On ne multiplie pas par $' + dT + '$ (signe inconnu) : on passe tout dans le membre de gauche. $$\\dfrac{' + T.poly([A, B]) + '}{' + dT + '} - ' + T.par(k) + ' = \\dfrac{' + T.poly([A, B]) + T.mono(-k, '(' + dT + ')') + '}{' + dT + '} = \\dfrac{' + nT + '}{' + dT + '}$$');
        steps.push('L’inéquation équivaut à $\\dfrac{' + nT + '}{' + dT + '} ' + ineq + ' 0$. Valeur interdite : $' + (-d) + '$ ; le numérateur s’annule en $' + rr + '$.');
        points = [{ v: rr, tex: T.num(rr) }, { v: -d, tex: T.num(-d) }].sort(function (x, y) { return x.v - y.v; });
        steps.push(signTable(points, [
          { label: nT, f: function (x) { return mm * (x - rr); }, root: rr },
          { label: dT, f: function (x) { return x + d; }, root: -d, den: true }
        ], '\\text{quotient}'));
        rep = between(F(rr), F(-d));
      }
      var Itex = T.interval(rep.a, rep.b, rep.ouvA, rep.ouvB);
      steps.push('On lit les valeurs de $x$ qui conviennent' + (rep.b === Infinity || rep.a === -Infinity ? '' : ' (la valeur interdite est exclue)') + ' : $S = ' + Itex + '$.');
      return {
        enonce: enonce,
        questions: [{ label: '$S =$', type: 'interval', reponse: rep, reponseTex: Itex }],
        indices: [
          'Ramène-toi à un quotient (ou un produit) comparé à $0$, puis cherche les valeurs qui annulent chaque facteur.',
          'Dresse un tableau de signes ; n’oublie pas d’exclure la valeur interdite.'
        ],
        solution: steps,
        aide: 'Écris un intervalle comme ]-2 ; 3] ou [1 ; +inf[.'
      };
    }
  });

  /* ================================================================== */
  /* 2. Généralités sur les fonctions                                    */
  /* ================================================================== */

  /* -------- Composée de deux fonctions -------- */
  EM.gen.register({
    id: '1s-composee',
    titre: 'Déterminer la composée de deux fonctions',
    chapitres: ['1s-fonctions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([2, 3, -2, -1, 4, -3]), b = rng.nz(-5, 5);
      var fT = T.poly([a, b]), questions = [], steps = [], enonce;
      if (niveau === 1) {
        var c = rng.nz(-6, 6);
        var gT = T.poly([1, 0, c]);
        var gof = [a * a, 2 * a * b, b * b + c], fog = [a, 0, a * c + b];
        enonce = 'On considère les fonctions $f$ et $g$ définies sur $\\R$ par $f(x) = ' + fT + '$ et $g(x) = ' + gT + '$.<br>Déterminer $(g \\circ f)(x)$ et $(f \\circ g)(x)$.';
        steps.push('$(g \\circ f)(x) = g\\big(f(x)\\big) = (' + fT + ')^2' + T.signed(c) + ' = ' + T.poly([a * a, 2 * a * b, b * b]) + T.signed(c) + ' = ' + T.poly(gof) + '$.');
        steps.push('$(f \\circ g)(x) = f\\big(g(x)\\big) = ' + cf(a) + '(' + gT + ')' + T.signed(b) + ' = ' + T.poly(fog) + '$.');
        steps.push('On constate que $g \\circ f \\neq f \\circ g$ : l’ordre de composition compte.');
        questions.push({ label: '$(g \\circ f)(x) =$', type: 'expr', reponse: pstr(gof), reponseTex: T.poly(gof) });
        questions.push({ label: '$(f \\circ g)(x) =$', type: 'expr', reponse: pstr(fog), reponseTex: T.poly(fog) });
      } else if (niveau === 2) {
        var x0 = F(-b, a);
        enonce = 'On considère les fonctions $f(x) = ' + fT + '$ (définie sur $\\R$) et $g(x) = \\sqrt{x}$ (définie sur $[0 ; +\\infty[$).<br>Déterminer l’ensemble de définition de $g \\circ f$, puis $(g \\circ f)(x)$ et $(f \\circ g)(x)$.';
        var rep = a > 0 ? { a: x0, b: Infinity, ouvA: false, ouvB: true } : { a: -Infinity, b: x0, ouvA: true, ouvB: false };
        var Itex = T.interval(rep.a, rep.b, rep.ouvA, rep.ouvB);
        steps.push('$x \\in D_{g \\circ f} \\iff f(x) \\in D_g \\iff ' + fT + ' \\geq 0 \\iff x ' + (a > 0 ? '\\geq' : '\\leq') + ' ' + x0.tex() + '$' + (a < 0 ? ' (on divise par $' + a + ' < 0$ : le sens change)' : '') + '. Donc $D_{g \\circ f} = ' + Itex + '$.');
        steps.push('Pour $x \\in D_{g \\circ f}$ : $(g \\circ f)(x) = g(' + fT + ') = \\sqrt{' + fT + '}$.');
        steps.push('Pour $x \\geq 0$ : $(f \\circ g)(x) = f(\\sqrt{x}) = ' + T.mono(a, '\\sqrt{x}', true) + T.signed(b) + '$.');
        var dom = a > 0 ? [x0.value() + 0.2, x0.value() + 5] : [x0.value() - 5, x0.value() - 0.2];
        questions.push({ label: '$D_{g \\circ f} =$', type: 'interval', reponse: rep, reponseTex: Itex });
        questions.push({ label: '$(g \\circ f)(x) =$', type: 'expr', reponse: 'sqrt(' + pstr([a, b]) + ')', reponseTex: '\\sqrt{' + fT + '}', domaine: dom });
        questions.push({ label: '$(f \\circ g)(x) =$', type: 'expr', reponse: a + '*sqrt(x)+(' + b + ')', reponseTex: T.mono(a, '\\sqrt{x}', true) + T.signed(b), domaine: [0.2, 5] });
      } else {
        var s = rng.int(1, 3), p = rng.int(-3, 3), cc = p + s * s;
        var f3 = T.poly([1, 0, p]), g3 = '\\dfrac{1}{' + T.poly([1, -cc]) + '}';
        enonce = 'On considère les fonctions $f(x) = ' + f3 + '$ et $g(x) = ' + g3 + '$.<br>Déterminer l’ensemble de définition de $g \\circ f$ et l’expression de $(g \\circ f)(x)$, puis celle de $(f \\circ g)(x)$.';
        steps.push('$D_g = \\R \\setminus \\{' + cc + '\\}$. On a $x \\in D_{g \\circ f} \\iff f(x) \\neq ' + cc + ' \\iff x^2' + (p ? T.signed(p) : '') + ' \\neq ' + cc + ' \\iff x^2 \\neq ' + (s * s) + ' \\iff x \\neq ' + s + '$ et $x \\neq -' + s + '$.');
        steps.push('Donc $D_{g \\circ f} = \\R \\setminus \\{-' + s + ' ; ' + s + '\\}$ et $(g \\circ f)(x) = \\dfrac{1}{x^2' + (p ? T.signed(p) : '') + T.signed(-cc) + '} = \\dfrac{1}{x^2 - ' + (s * s) + '}$.');
        steps.push('Pour $x \\neq ' + cc + '$ : $(f \\circ g)(x) = \\left(\\dfrac{1}{' + T.poly([1, -cc]) + '}\\right)^2' + (p ? T.signed(p) : '') + ' = \\dfrac{1}{(' + T.poly([1, -cc]) + ')^2}' + (p ? T.signed(p) : '') + '$.');
        var good = '$\\R \\setminus \\{-' + s + ' \\,;\\, ' + s + '\\}$';
        questions.push(qcm(rng, '$D_{g \\circ f} =$', good, ['$\\R \\setminus \\{' + cc + '\\}$', '$\\R$', '$\\R \\setminus \\{' + s + '\\}$', '$\\R \\setminus \\{' + (s * s) + '\\}$']));
        questions.push({ label: '$(g \\circ f)(x) =$', type: 'expr', reponse: '1/(x^2-' + (s * s) + ')', reponseTex: '\\dfrac{1}{x^2 - ' + (s * s) + '}', domaine: [s + 0.5, s + 3.5] });
        questions.push({ label: '$(f \\circ g)(x) =$', type: 'expr', reponse: '1/(' + pstr([1, -cc]) + ')^2+(' + p + ')', reponseTex: '\\dfrac{1}{(' + T.poly([1, -cc]) + ')^2}' + (p ? T.signed(p) : ''), domaine: [cc + 0.5, cc + 3.5] });
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          '$(g \\circ f)(x) = g\\big(f(x)\\big)$ : remplace $x$ par $f(x)$ dans l’expression de $g$.',
          'Pour l’ensemble de définition de $g \\circ f$ : il faut $x \\in D_f$ et $f(x) \\in D_g$.'
        ],
        solution: steps,
        aide: 'Écris les expressions en fonction de x (par exemple sqrt(2x+1) ou 1/(x^2-4)). Un intervalle s’écrit [1 ; +inf[.'
      };
    }
  });

  /* -------- Parité -------- */
  EM.gen.register({
    id: '1s-parite',
    titre: 'Étudier la parité d’une fonction',
    chapitres: ['1s-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var nature = rng.pick(['paire', 'impaire', 'ni']);
      var a = rng.nz(-4, 4), b = rng.nz(-5, 5), c = rng.int(-6, 6), k = rng.int(1, 6);
      var tpl = nature === 'paire' ? rng.pick(niveau === 1 ? ['P1', 'P2'] : ['P1', 'P2', 'P3', 'P4'])
        : nature === 'impaire' ? rng.pick(niveau === 1 ? ['I1', 'I2'] : ['I1', 'I2', 'I3', 'I4'])
          : rng.pick(niveau === 1 ? ['N1', 'N5'] : ['N1', 'N2', 'N3', 'N4', 'N5']);
      var fT, D = '\\R', sym = true, steps = [];
      switch (tpl) {
        case 'P1':
          fT = T.poly([a, 0, b, 0, c]);
          steps.push('Pour tout $x \\in \\R$ : $f(-x) = ' + T.mono(a, '(-x)^4', true) + T.mono(b, '(-x)^2') + (c ? T.signed(c) : '') + ' = ' + fT + ' = f(x)$, car $(-x)^4 = x^4$ et $(-x)^2 = x^2$.');
          break;
        case 'P2':
          var p2 = rng.intExcept(-5, 5, [k]);
          fT = '\\dfrac{' + T.poly([1, 0, p2]) + '}{' + T.poly([1, 0, k]) + '}';
          steps.push('$x^2' + T.signed(k) + ' > 0$ pour tout $x$, donc $D_f = \\R$.');
          steps.push('$f(-x) = \\dfrac{(-x)^2' + (p2 ? T.signed(p2) : '') + '}{(-x)^2' + T.signed(k) + '} = ' + fT + ' = f(x)$.');
          break;
        case 'P3':
          fT = 'x^2' + T.mono(a, '|x|');
          steps.push('$f(-x) = (-x)^2' + T.mono(a, '|-x|') + ' = x^2' + T.mono(a, '|x|') + ' = f(x)$, car $|-x| = |x|$.');
          break;
        case 'P4':
          var r4 = rng.pick([2, 3, 4]);
          fT = '\\sqrt{' + (r4 * r4) + ' - x^2}';
          D = '[-' + r4 + ' ; ' + r4 + ']';
          steps.push('$' + (r4 * r4) + ' - x^2 \\geq 0 \\iff x^2 \\leq ' + (r4 * r4) + ' \\iff -' + r4 + ' \\leq x \\leq ' + r4 + '$ : $D_f = [-' + r4 + ' ; ' + r4 + ']$, symétrique par rapport à $0$.');
          steps.push('$f(-x) = \\sqrt{' + (r4 * r4) + ' - (-x)^2} = \\sqrt{' + (r4 * r4) + ' - x^2} = f(x)$.');
          break;
        case 'I1':
          fT = T.poly([a, 0, b, 0]);
          steps.push('$f(-x) = ' + T.mono(a, '(-x)^3', true) + T.mono(b, '(-x)') + ' = ' + T.poly([-a, 0, -b, 0]) + ' = -(' + fT + ') = -f(x)$.');
          break;
        case 'I2':
          fT = '\\dfrac{' + T.mono(a, 'x', true) + '}{' + T.poly([1, 0, k]) + '}';
          steps.push('$x^2' + T.signed(k) + ' > 0$ pour tout $x$, donc $D_f = \\R$.');
          steps.push('$f(-x) = \\dfrac{' + T.mono(a, '(-x)', true) + '}{(-x)^2' + T.signed(k) + '} = \\dfrac{' + T.mono(-a, 'x', true) + '}{' + T.poly([1, 0, k]) + '} = -f(x)$.');
          break;
        case 'I3':
          fT = T.mono(a, 'x', true) + (b > 0 ? ' + ' : ' - ') + '\\dfrac{' + Math.abs(b) + '}{x}';
          D = '\\R^*';
          steps.push('$D_f = \\R^* = \\R \\setminus \\{0\\}$ est symétrique par rapport à $0$.');
          steps.push('$f(-x) = ' + T.mono(a, '(-x)', true) + (b > 0 ? ' + ' : ' - ') + '\\dfrac{' + Math.abs(b) + '}{-x} = ' + T.mono(-a, 'x', true) + (b > 0 ? ' - ' : ' + ') + '\\dfrac{' + Math.abs(b) + '}{x} = -f(x)$.');
          break;
        case 'I4':
          fT = '\\dfrac{x^3}{x^2 - ' + (k * k) + '}';
          D = '\\R \\setminus \\{-' + k + ' ; ' + k + '\\}';
          steps.push('$x^2 - ' + (k * k) + ' = 0 \\iff x = ' + k + '$ ou $x = -' + k + '$ : $D_f = \\R \\setminus \\{-' + k + ' ; ' + k + '\\}$, symétrique par rapport à $0$.');
          steps.push('$f(-x) = \\dfrac{(-x)^3}{(-x)^2 - ' + (k * k) + '} = \\dfrac{-x^3}{x^2 - ' + (k * k) + '} = -f(x)$.');
          break;
        case 'N1':
          fT = T.poly([a, b, 0, 0]);
          steps.push('$D_f = \\R$. Calculons $f(1) = ' + T.num(a + b) + '$ et $f(-1) = ' + T.num(-a + b) + '$.');
          steps.push('$f(-1) \\neq f(1)$ (car $' + T.num(a) + ' \\neq 0$) : $f$ n’est pas paire. $f(-1) \\neq -f(1)$ (car $' + T.num(b) + ' \\neq 0$) : $f$ n’est pas impaire.');
          break;
        case 'N2':
          fT = '\\dfrac{' + T.poly([1, b]) + '}{' + T.poly([1, 0, k]) + '}';
          steps.push('$D_f = \\R$. $f(1) = \\dfrac{' + (1 + b) + '}{' + (1 + k) + '}$ et $f(-1) = \\dfrac{' + (b - 1) + '}{' + (1 + k) + '}$.');
          steps.push('$f(-1) \\neq f(1)$ et $f(-1) \\neq -f(1)$ (car $' + T.num(b) + ' \\neq 0$) : $f$ n’est ni paire ni impaire.');
          break;
        case 'N3':
          fT = '\\dfrac{1}{' + T.poly([1, -b]) + '}';
          D = '\\R \\setminus \\{' + b + '\\}';
          sym = false;
          steps.push('$D_f = \\R \\setminus \\{' + b + '\\}$ : $' + T.num(-b) + ' \\in D_f$ mais son opposé $' + b + ' \\notin D_f$.');
          steps.push('$D_f$ n’est pas symétrique par rapport à $0$ : $f$ n’est ni paire ni impaire.');
          break;
        case 'N4':
          fT = '\\sqrt{' + T.poly([1, k]) + '}';
          D = '[-' + k + ' ; +\\infty[';
          sym = false;
          steps.push('$D_f = [-' + k + ' ; +\\infty[$ : par exemple $' + (k + 1) + ' \\in D_f$ mais $-' + (k + 1) + ' \\notin D_f$.');
          steps.push('$D_f$ n’est pas symétrique par rapport à $0$ : $f$ n’est ni paire ni impaire.');
          break;
        default: // N5
          fT = T.poly([1, b, 0]);
          steps.push('$D_f = \\R$. $f(1) = ' + T.num(1 + b) + '$ et $f(-1) = ' + T.num(1 - b) + '$.');
          steps.push('$f(-1) \\neq f(1)$ (car $' + T.num(b) + ' \\neq 0$) et $f(-1) \\neq -f(1)$ (car $1 - b \\neq -1 - b$) : $f$ n’est ni paire ni impaire.');
      }
      if (sym && (tpl === 'P1' || tpl === 'P3' || tpl === 'I1')) steps.unshift('$D_f = \\R$ est symétrique par rapport à $0$.');
      var concl = nature === 'paire' ? 'Conclusion : $f$ est paire ; sa courbe est symétrique par rapport à l’axe des ordonnées.'
        : nature === 'impaire' ? 'Conclusion : $f$ est impaire ; sa courbe est symétrique par rapport à l’origine $O$.'
          : 'Conclusion : $f$ n’est ni paire ni impaire.';
      steps.push(concl);
      var labels = { paire: 'paire', impaire: 'impaire', ni: 'ni paire ni impaire' };
      var all = ['paire', 'impaire', 'ni paire ni impaire'];
      var sh = rng.shuffle(all);
      return {
        enonce: 'Étudier la parité de la fonction $f$ définie par $f(x) = ' + fT + '$.',
        questions: [{ label: 'La fonction $f$ est :', type: 'choice', choix: sh, reponse: sh.indexOf(labels[nature]) }],
        indices: [
          'Commence par vérifier que $D_f$ est symétrique par rapport à $0$.',
          'Calcule $f(-x)$ et compare-le à $f(x)$ et à $-f(x)$ ; un contre-exemple numérique suffit pour montrer que $f$ n’est ni paire ni impaire.'
        ],
        solution: steps
      };
    }
  });

  /* -------- Centre et axe de symétrie -------- */
  EM.gen.register({
    id: '1s-centre-symetrie',
    titre: 'Déterminer un centre ou un axe de symétrie d’une courbe',
    chapitres: ['1s-fonctions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau === 1) {
        var a = rng.nz(-4, 4), d = rng.nz(-4, 4), kk = rng.nz(-6, 6);
        var b = kk + a * d;
        var fT = '\\dfrac{' + T.poly([a, b]) + '}{' + T.poly([1, d]) + '}';
        enonce = 'Soit $f(x) = ' + fT + '$. Déterminer les coordonnées du centre de symétrie $\\Omega$ de sa courbe (l’hyperbole $C_f$).';
        steps.push('$D_f = \\R \\setminus \\{' + T.num(-d) + '\\}$. On écrit $f(x) = \\dfrac{' + cf(a) + '(' + T.poly([1, d]) + ')' + T.signed(kk) + '}{' + T.poly([1, d]) + '} = ' + T.num(a) + fracTerm(kk, T.poly([1, d])) + '$.');
        steps.push('Posons $\\Omega(' + T.num(-d) + ' ; ' + T.num(a) + ')$. Si $x \\neq ' + T.num(-d) + '$, alors $2 \\times ' + T.par(-d) + ' - x \\neq ' + T.num(-d) + '$, et $f(' + T.num(-2 * d) + ' - x) = ' + T.num(a) + fracTerm(kk, T.num(-d) + ' - x') + ' = ' + T.num(a) + fracTerm(-kk, T.poly([1, d])) + '$.');
        steps.push('Donc $f(' + T.num(-2 * d) + ' - x) + f(x) = ' + T.num(2 * a) + ' = 2 \\times ' + T.par(a) + '$ : $\\Omega(' + T.num(-d) + ' ; ' + T.num(a) + ')$ est centre de symétrie (c’est le point d’intersection des asymptotes $x = ' + T.num(-d) + '$ et $y = ' + T.num(a) + '$).');
        questions = [{ label: '$\\Omega$', type: 'tuple', reponse: [F(-d), F(a)] }];
      } else if (niveau === 2 && rng.bool(0.4)) {
        var al = rng.nz(-3, 3), cc = al * al + rng.int(1, 5);
        var den = T.poly([1, -2 * al, cc]);
        enonce = 'Soit $f(x) = \\dfrac{1}{' + den + '}$. Montrer que $C_f$ admet un axe de symétrie d’équation $x = a$ et déterminer $a$.';
        steps.push('Le discriminant de $' + den + '$ vaut $' + (4 * al * al - 4 * cc) + ' < 0$ : le dénominateur ne s’annule jamais, $D_f = \\R$ (et $2a - x \\in \\R$ pour tout $x$).');
        steps.push('Forme canonique : $' + den + ' = (' + T.poly([1, -al]) + ')^2' + T.signed(cc - al * al) + '$ : on essaie $a = ' + al + '$.');
        steps.push('$(' + T.num(2 * al) + ' - x)^2' + T.mono(-2 * al, '(' + T.num(2 * al) + ' - x)') + T.signed(cc) + ' = x^2' + T.mono(-2 * al, 'x') + T.signed(cc) + '$ (en développant), donc $f(' + T.num(2 * al) + ' - x) = f(x)$.');
        steps.push('La droite d’équation $x = ' + al + '$ est axe de symétrie de $C_f$.');
        questions = [{ label: '$a =$', type: 'number', reponse: al }];
      } else if (niveau === 2) {
        var m = rng.nz(-2, 2), e = rng.int(-4, 4), be = rng.int(-4, 4);
        var P = [1, -3 * m, 3 * m * m + e, -m * m * m - e * m + be];
        enonce = 'Soit $f(x) = ' + T.poly(P) + '$. Montrer que $C_f$ admet un centre de symétrie $\\Omega$ d’abscisse $' + m + '$ et déterminer ses coordonnées.';
        steps.push('$f(' + m + ') = ' + substTex(P, m) + ' = ' + be + '$. On pose $\\Omega(' + m + ' ; ' + be + ')$.');
        steps.push('En développant, on vérifie que $f(x) = (' + T.poly([1, -m]) + ')^3' + T.mono(e, '(' + T.poly([1, -m]) + ')') + T.signed(be) + '$. Avec $h = x - ' + T.par(m) + '$ : $f(' + m + ' + h) = h^3' + T.mono(e, 'h') + T.signed(be) + '$.');
        steps.push('Ainsi $f(' + m + ' + h) + f(' + m + ' - h) = h^3' + T.mono(e, 'h') + T.signed(be) + ' + (-h)^3' + T.mono(e, '(-h)') + T.signed(be) + ' = ' + T.num(2 * be) + ' = 2 \\times ' + T.par(be) + '$.');
        steps.push('Donc $\\Omega(' + m + ' ; ' + be + ')$ est centre de symétrie de $C_f$.');
        questions = [{ label: '$\\Omega$', type: 'tuple', reponse: [m, be] }];
      } else {
        var d3 = rng.nz(-3, 3), bb = rng.int(-4, 4), R = rng.nz(-5, 5);
        var e3 = bb - d3, c3 = R + d3 * e3;
        var num = T.poly([1, bb, c3]), dT = T.poly([1, d3]);
        enonce = 'Soit $f(x) = \\dfrac{' + num + '}{' + dT + '}$. Déterminer le centre de symétrie $\\Omega$ de sa courbe.';
        steps.push('Par division euclidienne (ou identification) : $f(x) = ' + T.poly([1, e3]) + fracTerm(R, dT) + '$.');
        steps.push('Asymptotes : $x = ' + T.num(-d3) + '$ (verticale) et $y = ' + T.poly([1, e3]) + '$ (oblique) ; leur point d’intersection est $\\Omega(' + T.num(-d3) + ' ; ' + T.num(bb - 2 * d3) + ')$.');
        steps.push('Vérification : $f(' + T.num(-2 * d3) + ' - x) = ' + T.num(-2 * d3) + ' - x' + T.signed(e3) + fracTerm(-R, dT) + '$, donc $f(' + T.num(-2 * d3) + ' - x) + f(x) = ' + T.num(2 * (bb - 2 * d3)) + ' = 2 \\times ' + T.par(bb - 2 * d3) + '$.');
        questions = [{ label: '$\\Omega$', type: 'tuple', reponse: [-d3, bb - 2 * d3] }];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          '$\\Omega(a ; b)$ est centre de symétrie si $f(2a - x) + f(x) = 2b$ ; la droite $x = a$ est axe de symétrie si $f(2a - x) = f(x)$.',
          'Pour une fonction rationnelle, le centre est souvent le point d’intersection des asymptotes.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b).'
      };
    }
  });

  /* ================================================================== */
  /* 3. Limites et continuité                                            */
  /* ================================================================== */

  /* -------- Limites en l'infini -------- */
  EM.gen.register({
    id: '1s-limite-infini',
    titre: 'Calculer une limite en l’infini',
    chapitres: ['1s-limites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var dir = rng.pick([1, -1]), infT = dir > 0 ? '+\\infty' : '-\\infty';
      var steps = [], fT, bonne, autres = ['$+\\infty$', '$-\\infty$', '$0$'];
      function randPoly(deg) {
        var c = [rng.nz(-5, 5)];
        for (var i = 0; i < deg; i++) c.push(rng.int(-6, 6));
        return c;
      }
      function xpow(e) { return e === 1 ? 'x' : 'x^{' + e + '}'; }
      if (niveau === 1 && rng.bool(0.5)) {
        var deg = rng.int(2, 4), P = randPoly(deg), lead = P[0];
        fT = T.poly(P);
        var s = Math.sign(lead) * (dir < 0 && deg % 2 === 1 ? -1 : 1);
        bonne = s > 0 ? INF[0] : INF[1];
        steps.push('En $' + infT + '$, un polynôme a la même limite que son terme de plus haut degré : $' + limTex(infT) + ' f(x) = ' + limTex(infT) + ' ' + T.mono(lead, xpow(deg), true) + '$.');
        steps.push('$' + limTex(infT) + ' ' + xpow(deg) + ' = ' + (dir > 0 || deg % 2 === 0 ? '+\\infty' : '-\\infty') + '$ et le coefficient $' + T.num(lead) + '$ est ' + (lead > 0 ? 'positif' : 'négatif') + ', donc la limite est $' + (s > 0 ? '+\\infty' : '-\\infty') + '$.');
        autres.push('$' + T.num(lead) + '$');
      } else if (niveau <= 2) {
        var dp, dq;
        if (niveau === 1) { dp = rng.int(1, 2); dq = dp; }
        else { var pr = rng.pick([[1, 2], [2, 1], [3, 2], [2, 2], [1, 1], [3, 1], [2, 3]]); dp = pr[0]; dq = pr[1]; }
        var N = randPoly(dp), D = randPoly(dq);
        fT = '\\dfrac{' + T.poly(N) + '}{' + T.poly(D) + '}';
        var k = F(N[0], D[0]);
        var simp;
        if (dp === dq) simp = k.tex();
        else if (dp > dq) simp = T.mono(k, xpow(dp - dq), true);
        else simp = k.tex() + ' \\times \\dfrac{1}{' + xpow(dq - dp) + '}';
        steps.push('En $' + infT + '$, une fonction rationnelle a la même limite que le quotient des termes de plus haut degré : $$' + limTex(infT) + ' f(x) = ' + limTex(infT) + ' \\dfrac{' + T.mono(N[0], xpow(dp), true) + '}{' + T.mono(D[0], xpow(dq), true) + '} = ' + (dp === dq ? '' : limTex(infT) + ' ') + simp + '$$');
        if (dp === dq) { bonne = '$' + k.tex() + '$'; steps.push('Les degrés sont égaux : la limite est le quotient des coefficients dominants, $' + k.tex() + '$.'); }
        else if (dp < dq) { bonne = '$0$'; steps.push('$' + limTex(infT) + ' \\dfrac{1}{' + xpow(dq - dp) + '} = 0$, donc la limite est $0$.'); }
        else {
          var e = dp - dq, sx = dir > 0 || e % 2 === 0 ? 1 : -1, s2 = k.sign() * sx;
          bonne = s2 > 0 ? INF[0] : INF[1];
          steps.push('$' + limTex(infT) + ' ' + xpow(e) + ' = ' + (sx > 0 ? '+\\infty' : '-\\infty') + '$ et $' + k.tex() + (k.sign() > 0 ? ' > 0' : ' < 0') + '$, donc la limite est $' + (s2 > 0 ? '+\\infty' : '-\\infty') + '$.');
        }
        autres.push('$' + k.tex() + '$', '$' + k.inv().tex() + '$');
      } else {
        var a = rng.nz(-6, 6), b = rng.int(-5, 5);
        var rad = '\\sqrt{' + T.poly([1, a, b]) + '}';
        fT = rad + ' - x';
        var half = F(a, 2);
        autres.push('$' + half.tex() + '$', '$' + T.num(a) + '$', '$1$');
        if (dir < 0) {
          bonne = INF[0];
          steps.push('En $-\\infty$ : $' + limTex(infT) + ' (' + T.poly([1, a, b]) + ') = +\\infty$, donc $' + limTex(infT) + ' ' + rad + ' = +\\infty$ ; et $' + limTex(infT) + ' (-x) = +\\infty$.');
          steps.push('Par somme, la limite est $+\\infty$ (il n’y a pas d’indétermination).');
        } else {
          bonne = '$' + half.tex() + '$';
          steps.push('En $+\\infty$, on obtient la forme indéterminée $\\infty - \\infty$ : on multiplie par la quantité conjuguée.');
          steps.push('$f(x) = \\dfrac{(' + rad + ' - x)(' + rad + ' + x)}{' + rad + ' + x} = \\dfrac{' + T.poly([1, a, b]) + ' - x^2}{' + rad + ' + x} = \\dfrac{' + T.poly([a, b]) + '}{' + rad + ' + x}$.');
          var fb1 = b ? (b > 0 ? ' + ' : ' - ') + '\\frac{' + Math.abs(b) + '}{x}' : '';
          var fb2 = b ? (b > 0 ? ' + ' : ' - ') + '\\frac{' + Math.abs(b) + '}{x^2}' : '';
          steps.push('Pour $x > 0$, on factorise par $x$ (et $\\sqrt{x^2} = x$) : $f(x) = \\dfrac{' + T.num(a) + fb1 + '}{\\sqrt{1' + (a > 0 ? ' + ' : ' - ') + '\\frac{' + Math.abs(a) + '}{x}' + fb2 + '} + 1}$, qui tend vers $\\dfrac{' + T.num(a) + '}{1 + 1} = ' + half.tex() + '$.');
        }
      }
      return {
        enonce: 'Soit $f(x) = ' + fT + '$. Déterminer $' + limTex(infT) + ' f(x)$.',
        questions: [qcm(rng, '$' + limTex(infT) + ' f(x) =$', bonne, autres)],
        indices: [
          'En l’infini, ne garde que les termes de plus haut degré (du numérateur ET du dénominateur).',
          'Avec une racine carrée et une forme $\\infty - \\infty$, multiplie par la quantité conjuguée.'
        ],
        solution: steps
      };
    }
  });

  /* -------- Limites en un point -------- */
  EM.gen.register({
    id: '1s-limite-point',
    titre: 'Calculer une limite en un réel (forme indéterminée ou valeur interdite)',
    chapitres: ['1s-limites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, question, a;
      if (niveau === 3) {
        var d = rng.int(1, 3);
        a = rng.int(-3, 6);
        var c = d * d - a, rad = '\\sqrt{' + T.poly([1, c]) + '}';
        var inverse = rng.bool(0.4);
        var fT = inverse ? '\\dfrac{' + T.poly([1, -a]) + '}{' + rad + ' - ' + d + '}' : '\\dfrac{' + rad + ' - ' + d + '}{' + T.poly([1, -a]) + '}';
        var lim = inverse ? F(2 * d) : F(1, 2 * d);
        enonce = 'Soit $f(x) = ' + fT + '$. Calculer $' + limTex(a) + ' f(x)$.';
        steps.push('En $x = ' + a + '$ : $\\sqrt{' + T.num(a + c) + '} - ' + d + ' = 0$ et $' + a + ' - ' + T.par(a) + ' = 0$ : forme indéterminée $\\dfrac{0}{0}$.');
        steps.push('Quantité conjuguée : $(' + rad + ' - ' + d + ')(' + rad + ' + ' + d + ') = ' + T.poly([1, c]) + ' - ' + (d * d) + (c ? ' = ' + T.poly([1, -a]) : '') + '$.');
        if (inverse) steps.push('Donc, pour $x \\neq ' + a + '$ : $f(x) = \\dfrac{(' + T.poly([1, -a]) + ')(' + rad + ' + ' + d + ')}{' + T.poly([1, -a]) + '} = ' + rad + ' + ' + d + '$, qui tend vers $' + d + ' + ' + d + ' = ' + (2 * d) + '$.');
        else steps.push('Donc, pour $x \\neq ' + a + '$ : $f(x) = \\dfrac{' + T.poly([1, -a]) + '}{(' + T.poly([1, -a]) + ')(' + rad + ' + ' + d + ')} = \\dfrac{1}{' + rad + ' + ' + d + '}$, qui tend vers $\\dfrac{1}{' + d + ' + ' + d + '} = ' + lim.tex() + '$.');
        question = { label: '$' + limTex(a) + ' f(x) =$', type: 'number', reponse: lim };
      } else if (niveau === 2 && rng.bool(0.35)) {
        a = rng.int(-4, 4);
        var p = rng.nz(-4, 4), q = rng.int(-6, 6);
        if (p * a + q === 0) q += 1;
        var Nv = p * a + q, cote = rng.pick([1, -1]);
        var dT = T.poly([1, -a]);
        enonce = 'Soit $f(x) = \\dfrac{' + T.poly([p, q]) + '}{' + dT + '}$. Déterminer $' + limTex(a, cote) + ' f(x)$.';
        var s = Math.sign(Nv) * cote;
        steps.push('$' + limTex(a) + ' (' + T.poly([p, q]) + ') = ' + T.num(Nv) + '$ et $' + limTex(a) + ' (' + dT + ') = 0$ : la limite est infinie, son signe dépend du signe de $' + dT + '$.');
        steps.push('Pour $x ' + (cote > 0 ? '>' : '<') + ' ' + a + '$, $' + dT + (cote > 0 ? ' > 0' : ' < 0') + '$. Règle des signes : $\\dfrac{' + (Nv > 0 ? '+' : '-') + '}{' + (cote > 0 ? '+' : '-') + '}$ donne $' + (s > 0 ? '+\\infty' : '-\\infty') + '$.');
        steps.push('Interprétation : la droite d’équation $x = ' + a + '$ est asymptote verticale à $C_f$.');
        question = qcm(rng, '$' + limTex(a, cote) + ' f(x) =$', s > 0 ? INF[0] : INF[1], [INF[0], INF[1], '$0$', '$' + T.num(Nv) + '$']);
      } else {
        a = rng.int(-4, 4);
        var r = rng.intExcept(-5, 5, [a]), k = niveau === 1 ? 1 : rng.pick([1, 2, -1, 3]);
        var N = [k, -k * (a + r), k * a * r];
        if (niveau === 1 && rng.bool(0.4)) {
          enonce = 'Soit $f(x) = \\dfrac{' + T.poly([1, -a]) + '}{' + T.poly([1, -(a + r), a * r]) + '}$. Calculer $' + limTex(a) + ' f(x)$.';
          var l1 = F(1, a - r);
          steps.push('En $x = ' + a + '$, numérateur et dénominateur s’annulent : forme indéterminée $\\dfrac{0}{0}$.');
          steps.push('Le dénominateur a pour racines $' + a + '$ et $' + r + '$ : $' + T.poly([1, -(a + r), a * r]) + ' = ' + T.xMinus(a) + T.xMinus(r) + '$.');
          steps.push('Pour $x \\neq ' + a + '$ : $f(x) = \\dfrac{1}{' + T.poly([1, -r]) + '}$, d’où $' + limTex(a) + ' f(x) = \\dfrac{1}{' + a + ' - ' + T.par(r) + '} = ' + l1.tex() + '$.');
          question = { label: '$' + limTex(a) + ' f(x) =$', type: 'number', reponse: l1 };
        } else if (niveau === 1) {
          enonce = 'Soit $f(x) = \\dfrac{' + T.poly(N) + '}{' + T.poly([1, -a]) + '}$. Calculer $' + limTex(a) + ' f(x)$.';
          steps.push('En $x = ' + a + '$, numérateur et dénominateur s’annulent : forme indéterminée $\\dfrac{0}{0}$.');
          steps.push('Le numérateur a pour racines $' + a + '$ et $' + r + '$ (somme $' + (a + r) + '$, produit $' + (a * r) + '$) : $' + T.poly(N) + ' = ' + T.xMinus(a) + T.xMinus(r) + '$.');
          steps.push('Pour $x \\neq ' + a + '$ : $f(x) = ' + T.poly([1, -r]) + '$, d’où $' + limTex(a) + ' f(x) = ' + a + ' - ' + T.par(r) + ' = ' + (a - r) + '$.');
          question = { label: '$' + limTex(a) + ' f(x) =$', type: 'number', reponse: a - r };
        } else {
          var sD = rng.intExcept(-5, 5, [a, r]);
          var D = [1, -(a + sD), a * sD];
          var l2 = F(k * (a - r), a - sD);
          enonce = 'Soit $f(x) = \\dfrac{' + T.poly(N) + '}{' + T.poly(D) + '}$. Calculer $' + limTex(a) + ' f(x)$.';
          steps.push('En $x = ' + a + '$, numérateur et dénominateur s’annulent : forme indéterminée $\\dfrac{0}{0}$. On factorise les deux par $' + T.xMinus(a) + '$.');
          steps.push('$' + T.poly(N) + ' = ' + cf(k) + T.xMinus(a) + T.xMinus(r) + '$ et $' + T.poly(D) + ' = ' + T.xMinus(a) + T.xMinus(sD) + '$.');
          steps.push('Pour $x \\neq ' + a + '$ : $f(x) = \\dfrac{' + cf(k) + T.xMinus(r) + '}{' + T.poly([1, -sD]) + '}$, d’où $' + limTex(a) + ' f(x) = \\dfrac{' + cf(k) + '(' + a + ' - ' + T.par(r) + ')}{' + a + ' - ' + T.par(sD) + '} = ' + l2.tex() + '$.');
          question = { label: '$' + limTex(a) + ' f(x) =$', type: 'number', reponse: l2 };
        }
      }
      return {
        enonce: enonce,
        questions: [question],
        indices: [
          'Remplace d’abord $x$ par la valeur : si tu obtiens $\\dfrac{0}{0}$, factorise par $(x - a)$ (ou utilise la quantité conjuguée).',
          'Si le numérateur tend vers un nombre non nul et le dénominateur vers $0$, la limite est infinie : étudie le signe du dénominateur.'
        ],
        solution: steps,
        aide: 'Tu peux écrire une fraction comme 3/4.'
      };
    }
  });

  /* -------- Continuité et prolongement -------- */
  EM.gen.register({
    id: '1s-continuite',
    titre: 'Continuité en un point et prolongement par continuité',
    chapitres: ['1s-limites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, question;
      if (niveau === 1) {
        var a = rng.int(-2, 3), b = rng.int(-4, 4), c = rng.int(-5, 5), m = rng.nz(-4, 4);
        var fa = a * a + a * b + c, p = fa - m * a;
        enonce = 'Soit $p$ un réel et $f$ la fonction définie sur $\\R$ par $$f(x) = \\begin{cases} ' + T.poly([1, b, c]) + ' & \\text{si } x \\leq ' + a + ' \\\\ ' + T.mono(m, 'x', true) + ' + p & \\text{si } x > ' + a + ' \\end{cases}$$ Déterminer $p$ pour que $f$ soit continue en $' + a + '$.';
        steps.push('$f(' + a + ') = ' + substTex([1, b, c], a) + ' = ' + fa + '$ ; c’est aussi la limite à gauche en $' + a + '$ (fonction polynôme).');
        steps.push('$' + limTex(a, 1) + ' f(x) = ' + limTex(a, 1) + ' (' + T.mono(m, 'x', true) + ' + p) = ' + (m === 1 ? '' : (m === -1 ? '-' : m + ' \\times ') + T.par(a) + ' + p = ') + T.num(m * a) + ' + p$.');
        steps.push('$f$ est continue en $' + a + '$ si et seulement si $' + T.num(m * a) + ' + p = ' + fa + '$, c’est-à-dire $p = ' + p + '$.');
        question = { label: '$p =$', type: 'number', reponse: p };
      } else if (niveau === 2) {
        var a2 = rng.nz(-3, 3);
        if (rng.bool(0.4)) {
          var a3 = a2 * a2 * a2;
          enonce = 'Soit $f(x) = \\dfrac{' + T.poly([1, 0, 0, -a3]) + '}{' + T.poly([1, -a2]) + '}$, définie pour $x \\neq ' + a2 + '$. Montrer que $f$ admet un prolongement par continuité $g$ en $' + a2 + '$ et donner $g(' + a2 + ')$.';
          steps.push('$' + a2 + '$ est racine du numérateur ($' + T.par(a2) + '^3 = ' + a3 + '$) : forme indéterminée $\\dfrac{0}{0}$ en $' + a2 + '$.');
          steps.push('Par identification : $' + T.poly([1, 0, 0, -a3]) + ' = ' + T.xMinus(a2) + '(' + T.poly([1, a2, a2 * a2]) + ')$.');
          steps.push('Pour $x \\neq ' + a2 + '$ : $f(x) = ' + T.poly([1, a2, a2 * a2]) + '$, donc $' + limTex(a2) + ' f(x) = ' + (3 * a2 * a2) + '$, limite finie.');
          steps.push('$f$ se prolonge par continuité en posant $g(' + a2 + ') = ' + (3 * a2 * a2) + '$.');
          question = { label: '$g(' + a2 + ') =$', type: 'number', reponse: 3 * a2 * a2 };
        } else {
          var r = rng.intExcept(-5, 5, [a2]), k = rng.pick([1, 2, -1, 3, -2]);
          var N = [k, -k * (a2 + r), k * a2 * r], l = k * (a2 - r);
          enonce = 'Soit $f(x) = \\dfrac{' + T.poly(N) + '}{' + T.poly([1, -a2]) + '}$, définie pour $x \\neq ' + a2 + '$. Montrer que $f$ admet un prolongement par continuité $g$ en $' + a2 + '$ et donner $g(' + a2 + ')$.';
          steps.push('En $' + a2 + '$, le numérateur vaut $' + substTex(N, a2) + ' = 0$ : forme indéterminée $\\dfrac{0}{0}$.');
          steps.push('$' + T.poly(N) + ' = ' + cf(k) + T.xMinus(a2) + T.xMinus(r) + '$, donc pour $x \\neq ' + a2 + '$ : $f(x) = ' + T.poly([k, -k * r]) + '$.');
          steps.push('$' + limTex(a2) + ' f(x) = ' + l + '$ (limite finie) : on prolonge $f$ par continuité en posant $g(' + a2 + ') = ' + l + '$.');
          question = { label: '$g(' + a2 + ') =$', type: 'number', reponse: l };
        }
      } else {
        var a4 = rng.pick([-2, -1, 2, 3, 0]), u = rng.nz(-6, 6);
        var mm = F(a4 * a4 - u, a4 - 1);
        enonce = 'Soit $m$ un réel et $f$ la fonction définie sur $\\R$ par $$f(x) = \\begin{cases} mx' + T.signed(u) + ' & \\text{si } x < ' + a4 + ' \\\\ x^2 + m & \\text{si } x \\geq ' + a4 + ' \\end{cases}$$ Déterminer $m$ pour que $f$ soit continue en $' + a4 + '$.';
        steps.push('$f(' + a4 + ') = ' + T.par(a4) + '^2 + m = ' + (a4 * a4) + ' + m$, qui est aussi la limite à droite.');
        steps.push('$' + limTex(a4, -1) + ' f(x) = ' + (a4 === 0 ? '0 \\times m' : T.mono(a4, 'm', true)) + T.signed(u) + '$.');
        steps.push('Continuité en $' + a4 + '$ : $' + (a4 === 0 ? '' : T.mono(a4, 'm', true)) + T.signed(u, a4 === 0) + ' = ' + (a4 * a4) + ' + m \\iff ' + T.mono(a4 - 1, 'm', true) + ' = ' + (a4 * a4 - u) + (a4 - 1 === 1 ? '' : ' \\iff m = ' + mm.tex()) + '$.');
        question = { label: '$m =$', type: 'number', reponse: mm };
      }
      return {
        enonce: enonce,
        questions: [question],
        indices: [
          '$f$ est continue en $a$ si et seulement si $\\lim\\limits_{x \\to a} f(x) = f(a)$ (limites à gauche et à droite égales à $f(a)$).',
          'Pour un prolongement par continuité, calcule la limite en $a$ (forme $\\dfrac{0}{0}$ : factorise par $x - a$).'
        ],
        solution: steps,
        aide: 'Tu peux écrire une fraction comme -5/3.'
      };
    }
  });

  /* ================================================================== */
  /* 4. Dérivation                                                       */
  /* ================================================================== */

  /** Détail de la dérivation terme à terme d'un polynôme : 3 \times 2x^{2} - 5 + … */
  function derivDetail(P) {
    var deg = P.length - 1, out = '', first = true;
    for (var j = 0; j < deg; j++) {
      var n = deg - j, c = fr(P[j]);
      if (c.isZero()) continue;
      var a = c.abs(), xp = n - 1 === 0 ? '' : n - 1 === 1 ? 'x' : 'x^{' + (n - 1) + '}';
      var body;
      if (n === 1) body = T.num(a);
      else body = (a.equals(1) ? String(n) : n + ' \\times ' + T.num(a)) + xp;
      out += (first ? (c.n < 0 ? '-' : '') : (c.n < 0 ? ' - ' : ' + ')) + body;
      first = false;
    }
    return out || '0';
  }

  /* -------- Dérivée d'un polynôme, d'un produit, d'une puissance -------- */
  EM.gen.register({
    id: '1s-derivee-polynome',
    titre: 'Dériver un polynôme, un produit ou une puissance',
    chapitres: ['1s-derivation'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], fT, rep, repT;
      if (niveau === 1 || (niveau === 3 && rng.bool(0.5))) {
        var P;
        if (niveau === 1) {
          var deg = rng.pick([3, 3, 4]);
          P = [rng.nz(-5, 5)];
          for (var i = 0; i < deg; i++) P.push(rng.int(-7, 7));
          if (deg === 4 && rng.bool()) P[1] = 0;
        } else {
          P = [F(rng.pick([1, 2, -1, 4, -2]), 3), F(rng.nz(-5, 5), 2), rng.int(-6, 6), rng.int(-6, 6)];
        }
        var D = pder(P);
        fT = T.poly(P);
        steps.push('On dérive terme à terme avec $(x^n)\' = nx^{n-1}$, $(ax)\' = a$ et $(k)\' = 0$ : $$f\'(x) = ' + derivDetail(P) + ' = ' + T.poly(D) + '$$');
        rep = pstr(D); repT = T.poly(D);
      } else if (niveau === 2 && rng.bool(0.5)) {
        var a = rng.nz(-4, 4), b = rng.nz(-5, 5), c = rng.nz(-3, 3), d = rng.nz(-5, 5);
        var uT = T.poly([a, b]), vT = T.poly([c, 0, d]), vpT = T.mono(2 * c, 'x', true);
        fT = '(' + uT + ')(' + vT + ')';
        var D2 = [3 * a * c, 2 * b * c, a * d];
        steps.push('$f = uv$ avec $u(x) = ' + uT + '$, $u\'(x) = ' + a + '$, $v(x) = ' + vT + '$ et $v\'(x) = ' + vpT + '$.');
        steps.push('$f\'(x) = u\'(x)v(x) + u(x)v\'(x) = ' + cf(a) + '(' + vT + ') + (' + uT + ')(' + vpT + ')$');
        steps.push('$f\'(x) = ' + T.sum([{ c: a * c, v: 'x^2' }, { c: a * d }, { c: 2 * a * c, v: 'x^2' }, { c: 2 * b * c, v: 'x' }]) + ' = ' + T.poly(D2) + '$');
        rep = pstr(D2); repT = T.poly(D2);
      } else if (niveau === 2) {
        var a2 = rng.pick([2, 3, -1, -2, 4]), b2 = rng.nz(-5, 5), n = rng.int(2, 5);
        var u2 = T.poly([a2, b2]);
        fT = '(' + u2 + ')^{' + n + '}';
        var pw = n - 1 === 1 ? '(' + u2 + ')' : '(' + u2 + ')^{' + (n - 1) + '}';
        steps.push('$f = u^{' + n + '}$ avec $u(x) = ' + u2 + '$ et $u\'(x) = ' + a2 + '$.');
        steps.push('Formule $(u^n)\' = nu\'u^{n-1}$ : $f\'(x) = ' + n + ' \\times ' + T.par(a2) + ' \\times ' + pw + ' = ' + T.mono(n * a2, pw, true) + '$.');
        rep = (n * a2) + '*(' + pstr([a2, b2]) + ')^' + (n - 1);
        repT = T.mono(n * a2, pw, true);
      } else {
        var k = rng.nz(-5, 5), m = rng.pick([3, 4]);
        var u3 = T.poly([1, 0, k]);
        fT = '(' + u3 + ')^{' + m + '}';
        var pw3 = '(' + u3 + ')^{' + (m - 1) + '}';
        steps.push('$f = u^{' + m + '}$ avec $u(x) = ' + u3 + '$ et $u\'(x) = 2x$.');
        steps.push('$f\'(x) = ' + m + ' \\times 2x \\times ' + pw3 + ' = ' + (2 * m) + 'x' + pw3 + '$.');
        rep = (2 * m) + '*x*(' + pstr([1, 0, k]) + ')^' + (m - 1);
        repT = (2 * m) + 'x' + pw3;
      }
      return {
        enonce: 'Calculer la dérivée de la fonction $f$ définie sur $\\R$ par $f(x) = ' + fT + '$.',
        questions: [{ label: '$f\'(x) =$', type: 'expr', reponse: rep, reponseTex: repT }],
        indices: [
          'Reconnais la structure : somme de monômes, produit $uv$ ou puissance $u^n$.',
          'Formules utiles : $(x^n)\' = nx^{n-1}$, $(uv)\' = u\'v + uv\'$, $(u^n)\' = nu\'u^{n-1}$.'
        ],
        solution: steps,
        aide: 'Écris la dérivée en fonction de x, par exemple 6x^2 - 4x + 1 ou 12(2x-1)^3.'
      };
    }
  });

  /* -------- Dérivée d'un quotient -------- */
  EM.gen.register({
    id: '1s-derivee-quotient',
    titre: 'Dériver un quotient',
    chapitres: ['1s-derivation'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], fT, rep, repT, dom, uT, upT, vT, vpT, numF;
      if (niveau === 1) {
        var a = rng.nz(-4, 4), b = rng.int(-6, 6), c = rng.pick([1, 2, -1, 1]), d = rng.int(-5, 5);
        if (a * d - b * c === 0) b += 1;
        var det = a * d - b * c, x0 = -d / c;
        uT = T.poly([a, b]); upT = T.num(a); vT = T.poly([c, d]); vpT = T.num(c);
        fT = '\\dfrac{' + uT + '}{' + vT + '}';
        steps.push('$f = \\dfrac{u}{v}$ avec $u(x) = ' + uT + '$, $u\'(x) = ' + upT + '$, $v(x) = ' + vT + '$, $v\'(x) = ' + vpT + '$.');
        steps.push('$f\'(x) = \\dfrac{u\'v - uv\'}{v^2} = \\dfrac{' + cf(a) + '(' + vT + ') - (' + uT + ') \\times ' + T.par(c) + '}{(' + vT + ')^2} = \\dfrac{' + T.sum([{ c: a * c, v: 'x' }, { c: a * d }, { c: -b * c }, { c: -a * c, v: 'x' }]) + '}{(' + vT + ')^2}$');
        var detT = (det < 0 ? '-' : '') + '\\dfrac{' + Math.abs(det) + '}{(' + vT + ')^2}';
        steps.push('Après réduction : $f\'(x) = ' + detT + '$ (c’est la formule $\\dfrac{ad - bc}{(cx + d)^2}$).');
        rep = '(' + det + ')/(' + pstr([c, d]) + ')^2';
        repT = detT;
        dom = [x0 + 0.5, x0 + 4.5];
      } else if (niveau === 2) {
        var a2 = rng.pick([1, 2, -1, 3]), b2 = rng.int(-5, 5), c2 = rng.int(-6, 6), d2 = rng.nz(-4, 4);
        uT = T.poly([a2, b2, c2]); upT = T.poly([2 * a2, b2]); vT = T.poly([1, d2]);
        fT = '\\dfrac{' + uT + '}{' + vT + '}';
        numF = [a2, 2 * a2 * d2, b2 * d2 - c2];
        steps.push('$f = \\dfrac{u}{v}$ avec $u(x) = ' + uT + '$, $u\'(x) = ' + upT + '$, $v(x) = ' + vT + '$, $v\'(x) = 1$.');
        steps.push('$f\'(x) = \\dfrac{(' + upT + ')(' + vT + ') - (' + uT + ')}{(' + vT + ')^2}$.');
        steps.push('Au numérateur : $(' + upT + ')(' + vT + ') = ' + T.poly([2 * a2, 2 * a2 * d2 + b2, b2 * d2]) + '$, puis on retranche $' + uT + '$ : $f\'(x) = \\dfrac{' + T.poly(numF) + '}{(' + vT + ')^2}$.');
        rep = '(' + pstr(numF) + ')/(' + pstr([1, d2]) + ')^2';
        repT = '\\dfrac{' + T.poly(numF) + '}{(' + vT + ')^2}';
        dom = [-d2 + 0.5, -d2 + 4.5];
      } else {
        var a3 = rng.nz(-3, 3), b3 = rng.int(-5, 5), k = rng.int(1, 6);
        uT = T.poly([a3, b3]); vT = T.poly([1, 0, k]);
        fT = '\\dfrac{' + uT + '}{' + vT + '}';
        numF = [-a3, -2 * b3, a3 * k];
        steps.push('$f = \\dfrac{u}{v}$ avec $u(x) = ' + uT + '$, $u\'(x) = ' + a3 + '$, $v(x) = ' + vT + '$, $v\'(x) = 2x$ ; $v$ ne s’annule pas, $f$ est dérivable sur $\\R$.');
        steps.push('$f\'(x) = \\dfrac{' + cf(a3) + '(' + vT + ') - (' + uT + ') \\times 2x}{(' + vT + ')^2} = \\dfrac{' + T.sum([{ c: a3, v: 'x^2' }, { c: a3 * k }, { c: -2 * a3, v: 'x^2' }, { c: -2 * b3, v: 'x' }]) + '}{(' + vT + ')^2}$');
        steps.push('$f\'(x) = \\dfrac{' + T.poly(numF) + '}{(' + vT + ')^2}$.');
        rep = '(' + pstr(numF) + ')/(' + pstr([1, 0, k]) + ')^2';
        repT = '\\dfrac{' + T.poly(numF) + '}{(' + vT + ')^2}';
        dom = [-3, 3];
      }
      return {
        enonce: 'Calculer la dérivée de la fonction $f$ définie par $f(x) = ' + fT + '$ sur son ensemble de définition.',
        questions: [{ label: '$f\'(x) =$', type: 'expr', reponse: rep, reponseTex: repT, domaine: dom }],
        indices: [
          'Pose $u$ (numérateur) et $v$ (dénominateur), puis calcule $u\'$ et $v\'$.',
          '$\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ : garde le dénominateur au carré, développe seulement le numérateur.'
        ],
        solution: steps,
        aide: 'Écris par exemple (x^2+2x-3)/(x+1)^2.'
      };
    }
  });

  /* -------- Dérivées : racine carrée et trigonométrie -------- */
  EM.gen.register({
    id: '1s-derivee-racine-trigo',
    titre: 'Dériver √u, cos(ax + b), sin(ax + b) et des produits',
    chapitres: ['1s-derivation'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], fT, rep, repT, dom = [-3, 3];
      var kind = niveau === 1 ? rng.pick(['R1', 'C1', 'S1']) : niveau === 2 ? rng.pick(['P1', 'P2', 'R2', 'C2']) : rng.pick(['Q1', 'Q2', 'Q3']);
      var a = rng.pick([2, 3, -2, 1, -1, 4]), b = rng.int(-5, 5);
      var lin = T.poly([a, b]), linS = pstr([a, b]);
      if (kind === 'R1') {
        var h = F(a, 2), x0 = -b / a;
        fT = '\\sqrt{' + lin + '}';
        repT = (h.n < 0 ? '-' : '') + '\\dfrac{' + Math.abs(h.n) + '}{' + (h.d === 1 ? '' : h.d) + '\\sqrt{' + lin + '}}';
        steps.push('$f = \\sqrt{u}$ avec $u(x) = ' + lin + '$ et $u\'(x) = ' + a + '$. Sur l’intervalle où $u(x) > 0$ : $(\\sqrt{u})\' = \\dfrac{u\'}{2\\sqrt{u}}$.');
        var raw1 = '\\dfrac{' + a + '}{2\\sqrt{' + lin + '}}';
        steps.push('$f\'(x) = ' + raw1 + (raw1 === repT ? '' : ' = ' + repT) + '$.');
        rep = '(' + a + ')/(2*sqrt(' + linS + '))';
        dom = a > 0 ? [x0 + 0.3, x0 + 5] : [x0 - 5, x0 - 0.3];
      } else if (kind === 'C1') {
        fT = '\\cos(' + lin + ')';
        repT = T.mono(-a, '\\sin(' + lin + ')', true);
        steps.push('$\\big(\\cos(ax + b)\\big)\' = -a\\sin(ax + b)$ avec $a = ' + a + '$ : $f\'(x) = ' + repT + '$.');
        rep = '-(' + a + ')*sin(' + linS + ')';
      } else if (kind === 'S1') {
        fT = '\\sin(' + lin + ')';
        repT = T.mono(a, '\\cos(' + lin + ')', true);
        steps.push('$\\big(\\sin(ax + b)\\big)\' = a\\cos(ax + b)$ avec $a = ' + a + '$ : $f\'(x) = ' + repT + '$.');
        rep = '(' + a + ')*cos(' + linS + ')';
      } else if (kind === 'P1') {
        fT = '(' + lin + ')\\sqrt{x}';
        repT = '\\dfrac{' + T.poly([3 * a, b]) + '}{2\\sqrt{x}}';
        steps.push('$f = uv$ avec $u(x) = ' + lin + '$, $u\'(x) = ' + a + '$, $v(x) = \\sqrt{x}$, $v\'(x) = \\dfrac{1}{2\\sqrt{x}}$ (pour $x > 0$).');
        steps.push('$f\'(x) = ' + T.mono(a, '\\sqrt{x}', true) + ' + \\dfrac{' + lin + '}{2\\sqrt{x}} = \\dfrac{' + T.sum([{ c: 2 * a, v: 'x' }, { c: a, v: 'x' }, { c: b }]) + '}{2\\sqrt{x}} = ' + repT + '$ (on a écrit $' + T.mono(a, '\\sqrt{x}', true) + ' = \\dfrac{' + T.mono(2 * a, 'x', true) + '}{2\\sqrt{x}}$).');
        rep = '(' + pstr([3 * a, b]) + ')/(2*sqrt(x))';
        dom = [0.3, 5];
      } else if (kind === 'P2') {
        fT = '(' + lin + ')\\sin x';
        repT = T.mono(a, '\\sin x', true) + ' + (' + lin + ')\\cos x';
        steps.push('$f = uv$ avec $u(x) = ' + lin + '$, $u\'(x) = ' + a + '$, $v(x) = \\sin x$, $v\'(x) = \\cos x$.');
        steps.push('$f\'(x) = u\'v + uv\' = ' + repT + '$.');
        rep = '(' + a + ')*sin(x)+(' + linS + ')*cos(x)';
      } else if (kind === 'R2') {
        var c = rng.int(1, 9);
        fT = '\\sqrt{x^2 + ' + c + '}';
        repT = '\\dfrac{x}{\\sqrt{x^2 + ' + c + '}}';
        steps.push('$f = \\sqrt{u}$ avec $u(x) = x^2 + ' + c + ' > 0$ et $u\'(x) = 2x$.');
        steps.push('$f\'(x) = \\dfrac{2x}{2\\sqrt{x^2 + ' + c + '}} = ' + repT + '$.');
        rep = 'x/sqrt(x^2+' + c + ')';
      } else if (kind === 'C2') {
        var k = rng.nz(-3, 3);
        fT = T.mono(k, '\\cos^2 x', true);
        repT = T.mono(-2 * k, '\\sin x\\cos x', true);
        steps.push('$f = ' + cf(k) + 'u^2$ avec $u(x) = \\cos x$ et $u\'(x) = -\\sin x$.');
        var kp = k === 1 ? '' : T.par(k) + ' \\times ';
        steps.push('$f\'(x) = ' + kp + '2u\'u = ' + kp + '2 \\times (-\\sin x)\\cos x = ' + repT + '$ (que l’on peut aussi écrire $' + T.mono(-k, '\\sin 2x', true) + '$).');
        rep = '-2*(' + k + ')*sin(x)*cos(x)';
      } else if (kind === 'Q1') {
        var a1 = rng.pick([1, 2]), b1 = rng.int(-4, 4), c1 = Math.floor(b1 * b1 / (4 * a1)) + rng.int(1, 5);
        var q = T.poly([a1, b1, c1]);
        fT = '\\sqrt{' + q + '}';
        repT = '\\dfrac{' + T.poly([2 * a1, b1]) + '}{2\\sqrt{' + q + '}}';
        steps.push('Le discriminant de $' + q + '$ vaut $' + (b1 * b1 - 4 * a1 * c1) + ' < 0$ : ce trinôme est toujours strictement positif et $f$ est dérivable sur $\\R$.');
        steps.push('$f = \\sqrt{u}$ avec $u\'(x) = ' + T.poly([2 * a1, b1]) + '$, donc $f\'(x) = \\dfrac{u\'}{2\\sqrt{u}} = ' + repT + '$.');
        rep = '(' + pstr([2 * a1, b1]) + ')/(2*sqrt(' + pstr([a1, b1, c1]) + '))';
      } else if (kind === 'Q2') {
        var kq = rng.pick([2, 3]);
        fT = '\\dfrac{\\sin x}{' + kq + ' + \\cos x}';
        repT = '\\dfrac{' + kq + '\\cos x + 1}{(' + kq + ' + \\cos x)^2}';
        steps.push('$u = \\sin x$, $u\' = \\cos x$ ; $v = ' + kq + ' + \\cos x$ (qui ne s’annule pas), $v\' = -\\sin x$.');
        steps.push('$f\'(x) = \\dfrac{\\cos x(' + kq + ' + \\cos x) - \\sin x \\times (-\\sin x)}{(' + kq + ' + \\cos x)^2} = \\dfrac{' + kq + '\\cos x + \\cos^2 x + \\sin^2 x}{(' + kq + ' + \\cos x)^2} = ' + repT + '$, car $\\cos^2 x + \\sin^2 x = 1$.');
        rep = '(' + kq + '*cos(x)+1)/(' + kq + '+cos(x))^2';
      } else {
        var aq = rng.pick([2, 3, 4]);
        fT = '\\sin^2(' + aq + 'x)';
        repT = (2 * aq) + '\\sin(' + aq + 'x)\\cos(' + aq + 'x)';
        steps.push('$f = u^2$ avec $u(x) = \\sin(' + aq + 'x)$ et $u\'(x) = ' + aq + '\\cos(' + aq + 'x)$.');
        steps.push('$f\'(x) = 2u\'u = 2 \\times ' + aq + '\\cos(' + aq + 'x)\\sin(' + aq + 'x) = ' + repT + '$ (soit aussi $' + aq + '\\sin(' + (2 * aq) + 'x)$).');
        rep = (2 * aq) + '*sin(' + aq + 'x)*cos(' + aq + 'x)';
      }
      return {
        enonce: 'Calculer la dérivée de la fonction $f$ définie par $f(x) = ' + fT + '$ (sur un intervalle où elle est dérivable).',
        questions: [{ label: '$f\'(x) =$', type: 'expr', reponse: rep, reponseTex: repT, domaine: dom }],
        indices: [
          '$(\\sqrt{u})\' = \\dfrac{u\'}{2\\sqrt{u}}$, $\\big(\\cos(ax + b)\\big)\' = -a\\sin(ax + b)$, $\\big(\\sin(ax + b)\\big)\' = a\\cos(ax + b)$.',
          'Pour un produit : $(uv)\' = u\'v + uv\'$ ; pour un carré : $(u^2)\' = 2u\'u$.'
        ],
        solution: steps,
        aide: 'Écris par exemple 3/(2sqrt(3x+1)), -2sin(2x+1) ou 2x/sqrt(x^2+1).'
      };
    }
  });

  /* -------- Tangente -------- */
  EM.gen.register({
    id: '1s-tangente',
    titre: 'Déterminer une équation de la tangente en un point',
    chapitres: ['1s-derivation'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], fT, x0, f0, m;
      if (niveau === 1) {
        var P = rng.bool() ? [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-6, 6)] : [rng.nz(-2, 2), 0, rng.int(-5, 5), rng.int(-5, 5)];
        x0 = rng.int(-2, 3);
        var Dp = pder(P);
        fT = T.poly(P);
        f0 = pvalF(P, x0); m = pvalF(Dp, x0);
        steps.push('$f(' + x0 + ') = ' + substTex(P, x0) + ' = ' + f0.tex() + '$.');
        steps.push('$f\'(x) = ' + T.poly(Dp) + '$, donc $f\'(' + x0 + ') = ' + substTex(Dp, x0) + ' = ' + m.tex() + '$.');
      } else if (rng.bool(0.6)) {
        var a = rng.nz(-3, 3), d = rng.int(-3, 3), b = rng.int(-5, 5);
        if (a * d - b === 0) b += 1;
        var t = rng.pick([1, -1, 2, -2]);
        x0 = t - d;
        var nT = T.poly([a, b]), dT = T.poly([1, d]);
        fT = '\\dfrac{' + nT + '}{' + dT + '}';
        f0 = F(a * x0 + b, x0 + d); m = F(a * d - b, (x0 + d) * (x0 + d));
        steps.push('$f(' + x0 + ') = \\dfrac{' + T.num(a * x0 + b) + '}{' + T.num(x0 + d) + '} = ' + f0.tex() + '$.');
        steps.push('$f\'(x) = \\dfrac{' + (d === 0 ? T.mono(a, 'x', true) : cf(a) + '(' + dT + ')') + ' - (' + nT + ') \\times 1}{' + pw(dT) + '^2} = ' + fracLead(a * d - b, pw(dT) + '^2') + '$, donc $f\'(' + x0 + ') = ' + fracLead(a * d - b, T.par(x0 + d) + '^2') + ' = ' + m.tex() + '$.');
      } else {
        var k = rng.nz(-4, 4), s = rng.pick([1, 2, 3]);
        x0 = s * s;
        fT = T.mono(k, '\\sqrt{x}', true);
        f0 = F(k * s); m = F(k, 2 * s);
        steps.push('$f(' + x0 + ') = ' + cf(k) + '\\sqrt{' + x0 + '} = ' + f0.tex() + '$.');
        steps.push('$f\'(x) = ' + (k < 0 ? '-' : '') + '\\dfrac{' + Math.abs(k) + '}{2\\sqrt{x}}$, donc $f\'(' + x0 + ') = ' + m.tex() + '$.');
      }
      var p = f0.sub(m.mul(x0));
      var tT = T.poly([m, p]);
      steps.push('La tangente au point d’abscisse $' + x0 + '$ a pour équation $y = f\'(' + x0 + ')(x - ' + T.par(x0) + ') + f(' + x0 + ')$, soit $y = ' + (m.isZero() ? '' : cf(m) + T.xMinus(x0)) + T.signed(f0, m.isZero()) + '$.');
      steps.push('En développant : $y = ' + tT + '$.');
      return {
        enonce: 'Soit $f(x) = ' + fT + '$ et $C_f$ sa courbe. Calculer $f\'(' + x0 + ')$ puis déterminer une équation de la tangente $T$ à $C_f$ au point d’abscisse $' + x0 + '$.',
        questions: [
          { label: '$f\'(' + x0 + ') =$', type: 'number', reponse: m },
          { label: '$T : y =$', type: 'expr', reponse: pstr([m, p]), reponseTex: tT, forme: 'somme' }
        ],
        indices: [
          'Calcule $f(' + x0 + ')$, puis $f\'(x)$ et $f\'(' + x0 + ')$.',
          'Équation de la tangente : $y = f\'(a)(x - a) + f(a)$, puis développe.'
        ],
        solution: steps,
        aide: 'Pour la tangente, écris seulement le membre de droite, par exemple -3x + 5.'
      };
    }
  });

  /* ================================================================== */
  /* 5. Étude de fonctions                                               */
  /* ================================================================== */

  /* -------- Variations et extremums -------- */
  EM.gen.register({
    id: '1s-variations-extremums',
    titre: 'Étudier les variations et les extremums d’une fonction',
    chapitres: ['1s-etude-fonctions', '1s-derivation'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], fT, rep, repT, dom = [-3, 3], vmax, vmin, enonce;
      if (niveau === 1) {
        var al = rng.int(-3, 2), be = al + 2 * rng.int(1, 2), k = rng.pick([1, -1, 1]), d = rng.int(-5, 5);
        var s = al + be, pr = al * be;
        var P = [k, -3 * k * s / 2, 3 * k * pr, d];
        var D = [3 * k, -3 * k * s, 3 * k * pr];
        fT = T.poly(P);
        var fa = pval(P, al), fb = pval(P, be);
        rep = pstr(D); repT = T.poly(D);
        steps.push('$f$ est un polynôme, dérivable sur $\\R$ : $f\'(x) = ' + T.poly(D) + ' = ' + T.num(3 * k) + '(' + T.poly([1, -s, pr]) + ')$.');
        steps.push('Le trinôme $' + T.poly([1, -s, pr]) + '$ a pour racines $' + al + '$ et $' + be + '$ (somme $' + s + '$, produit $' + pr + '$) : $f\'(x) = ' + T.num(3 * k) + T.xMinus(al) + T.xMinus(be) + '$.');
        var sg = k > 0 ? ['+', '-', '+'] : ['-', '+', '-'];
        steps.push('$f\'(x)$ a le signe de $' + T.num(3 * k) + '$ à l’extérieur des racines. Tableau de variation :' +
          varTable(['-\\infty', T.num(al), T.num(be), '+\\infty'], sg, ['0', '0'],
            [k > 0 ? '-\\infty' : '+\\infty', T.num(fa), T.num(fb), k > 0 ? '+\\infty' : '-\\infty']));
        steps.push('$f(' + al + ') = ' + substTex(P, al) + ' = ' + fa + '$ et $f(' + be + ') = ' + substTex(P, be) + ' = ' + fb + '$.');
        if (k > 0) { vmax = fa; vmin = fb; steps.push('$f\'$ s’annule en changeant de signe : maximum local $f(' + al + ') = ' + fa + '$ et minimum local $f(' + be + ') = ' + fb + '$.'); }
        else { vmax = fb; vmin = fa; steps.push('$f\'$ s’annule en changeant de signe : minimum local $f(' + al + ') = ' + fa + '$ et maximum local $f(' + be + ') = ' + fb + '$.'); }
        enonce = 'Soit $f(x) = ' + fT + '$ définie sur $\\R$. Calculer $f\'(x)$, étudier les variations de $f$ et donner ses extremums locaux.';
      } else {
        var dd = rng.int(-3, 3), p = rng.int(-4, 4), kk = rng.int(1, 3), q = kk * kk;
        var dT = T.poly([1, -dd]);
        fT = T.poly([1, p]) + ' + \\dfrac{' + q + '}{' + dT + '}';
        rep = '1-' + q + '/(' + pstr([1, -dd]) + ')^2';
        repT = '\\dfrac{(' + dT + ')^2 - ' + q + '}{(' + dT + ')^2}';
        dom = [dd + 0.5, dd + 4.5];
        vmax = dd + p - 2 * kk; vmin = dd + p + 2 * kk;
        steps.push('$D_f = \\R \\setminus \\{' + dd + '\\}$ et $f\'(x) = 1 - \\dfrac{' + q + '}{(' + dT + ')^2} = ' + repT + '$.');
        steps.push('$(' + dT + ')^2 - ' + q + ' = (' + dT + ' - ' + kk + ')(' + dT + ' + ' + kk + ') = ' + T.xMinus(dd + kk) + T.xMinus(dd - kk) + '$ : $f\'$ s’annule en $' + (dd - kk) + '$ et en $' + (dd + kk) + '$, et a le signe de ce produit (le dénominateur est positif).');
        steps.push('Limites : $f(x) \\to -\\infty$ en $-\\infty$, $+\\infty$ en $+\\infty$ ; $-\\infty$ à gauche de $' + dd + '$ et $+\\infty$ à droite.' +
          varTable(['-\\infty', T.num(dd - kk), T.num(dd), T.num(dd + kk), '+\\infty'], ['+', '-', '-', '+'], ['0', '\\|', '0'],
            ['-\\infty', T.num(vmax), '-\\infty \\,\\|\\, +\\infty', T.num(vmin), '+\\infty']));
        var pS = p ? T.signed(p) : '';
        steps.push('$f(' + (dd - kk) + ') = ' + (dd - kk) + pS + ' - \\dfrac{' + q + '}{' + kk + '} = ' + vmax + '$ (maximum local) et $f(' + (dd + kk) + ') = ' + (dd + kk) + pS + ' + \\dfrac{' + q + '}{' + kk + '} = ' + vmin + '$ (minimum local).');
        steps.push('Remarque : ici le maximum local est plus petit que le minimum local, ce qui est possible car ils sont séparés par la valeur interdite.');
        enonce = 'Soit $f(x) = ' + fT + '$. Calculer $f\'(x)$, étudier les variations de $f$ et donner ses extremums locaux.';
      }
      return {
        enonce: enonce,
        questions: [
          { label: '$f\'(x) =$', type: 'expr', reponse: rep, reponseTex: repT, domaine: dom },
          { label: 'Valeur du maximum local :', type: 'number', reponse: vmax },
          { label: 'Valeur du minimum local :', type: 'number', reponse: vmin }
        ],
        indices: [
          'Calcule $f\'(x)$ et factorise-la pour étudier son signe.',
          'Un extremum local correspond à un changement de signe de $f\'$ ; calcule ensuite l’image par $f$.'
        ],
        solution: steps
      };
    }
  });

  /* -------- Asymptotes -------- */
  EM.gen.register({
    id: '1s-asymptotes',
    titre: 'Déterminer les asymptotes d’une courbe',
    chapitres: ['1s-etude-fonctions', '1s-limites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], questions, enonce;
      if (niveau === 1) {
        var a = rng.nz(-4, 4), c = rng.pick([1, 2, -1, 3]), d = rng.nz(-5, 5), b = rng.int(-5, 5);
        if (a * d - b * c === 0) b += 1;
        var va = F(-d, c), ha = F(a, c), nT = T.poly([a, b]), dT = T.poly([c, d]);
        var Nv = F(a, 1).mul(va).add(b);
        enonce = 'Soit $f(x) = \\dfrac{' + nT + '}{' + dT + '}$. Déterminer les équations des asymptotes à sa courbe.';
        steps.push('En $\\pm\\infty$ : $f(x)$ a la même limite que $\\dfrac{' + T.mono(a, 'x', true) + '}{' + T.mono(c, 'x', true) + '} = ' + ha.tex() + '$. La droite $y = ' + ha.tex() + '$ est asymptote horizontale.');
        steps.push('$' + dT + ' = 0 \\iff x = ' + va.tex() + '$. En ce point, le numérateur tend vers $' + Nv.tex() + ' \\neq 0$ et le dénominateur vers $0$ : $f$ tend vers l’infini, la droite $x = ' + va.tex() + '$ est asymptote verticale.');
        questions = [
          { label: 'Asymptote verticale : $x =$', type: 'number', reponse: va },
          { label: 'Asymptote horizontale : $y =$', type: 'number', reponse: ha }
        ];
      } else {
        var al = rng.pick([1, 2, -1, 3, -2]), e = rng.int(-5, 5), dd = rng.nz(-4, 4), R = rng.nz(-6, 6);
        var bb = e + al * dd, cc = R + dd * e;
        var num = T.poly([al, bb, cc]), den = T.poly([1, dd]);
        var oa = T.poly([al, e]);
        enonce = 'Soit $f(x) = \\dfrac{' + num + '}{' + den + '}$.' + (niveau === 3 ? ' Déterminer les réels $\\alpha$, $\\beta$, $\\gamma$ tels que $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{' + den + '}$, puis étudier la position de la courbe par rapport à son asymptote oblique sur $]' + (-dd) + ' ; +\\infty[$.' : ' Déterminer ses asymptotes.');
        steps.push('On cherche $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{' + den + '}$. En réduisant au même dénominateur : $(\\alpha x + \\beta)(' + den + ') + \\gamma = \\alpha x^2 + (' + T.mono(dd, '\\alpha', true) + ' + \\beta)x' + T.mono(dd, '\\beta') + ' + \\gamma$.');
        steps.push('Identification : $\\alpha = ' + al + '$, $' + T.mono(dd, '\\alpha', true) + ' + \\beta = ' + bb + '$ donc $\\beta = ' + e + '$, et $' + T.mono(dd, '\\beta', true) + ' + \\gamma = ' + cc + '$ donc $\\gamma = ' + R + '$. Ainsi $f(x) = ' + oa + fracTerm(R, den) + '$.');
        steps.push('$f(x) - (' + oa + ') = ' + fracLead(R, den) + '$ tend vers $0$ en $\\pm\\infty$ : la droite $\\Delta : y = ' + oa + '$ est asymptote oblique.');
        steps.push('En $x = ' + (-dd) + '$, le numérateur vaut $' + R + ' \\neq 0$ et le dénominateur s’annule : la droite $x = ' + (-dd) + '$ est asymptote verticale.');
        questions = [];
        if (niveau === 2) {
          questions.push({ label: 'Asymptote verticale : $x =$', type: 'number', reponse: -dd });
          questions.push({ label: 'Asymptote oblique : $y =$', type: 'expr', reponse: pstr([al, e]), reponseTex: oa, forme: 'somme' });
        } else {
          questions.push({ label: '$(\\alpha ; \\beta ; \\gamma) =$', type: 'tuple', reponse: [al, e, R] });
          var above = R > 0;
          steps.push('Sur $]' + (-dd) + ' ; +\\infty[$, $' + den + ' > 0$, donc $f(x) - (' + oa + ')$ a le signe de $' + R + '$ : la courbe est ' + (above ? 'au-dessus' : 'en dessous') + ' de $\\Delta$.');
          var sh = rng.shuffle(['au-dessus de $\\Delta$', 'en dessous de $\\Delta$']);
          questions.push({ label: 'Sur $]' + (-dd) + ' ; +\\infty[$, la courbe est :', type: 'choice', choix: sh, reponse: sh.indexOf(above ? 'au-dessus de $\\Delta$' : 'en dessous de $\\Delta$') });
        }
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Asymptote verticale : valeur qui annule le dénominateur (le numérateur ne s’y annulant pas).',
          'Asymptote oblique : écris $f(x) = ax + b + \\dfrac{c}{x + d}$ ; la partie $\\dfrac{c}{x + d}$ tend vers $0$ en l’infini.'
        ],
        solution: steps,
        aide: 'Pour une asymptote oblique, écris seulement le membre de droite, par exemple 2x - 1.'
      };
    }
  });

  /* -------- Optimisation -------- */
  EM.gen.register({
    id: '1s-optimisation',
    titre: 'Optimiser un bénéfice ou une surface à l’aide de la dérivée',
    chapitres: ['1s-etude-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau === 1) {
        var ctx = rng.pick([
          { prod: 'de noix de cajou', ville: 'Ziguinchor', u: 'tonnes', per: 'par semaine' },
          { prod: 'de jus de bissap', ville: 'Thiès', u: 'centaines de litres', per: 'par jour' },
          { prod: 'de savon artisanal', ville: 'Kaolack', u: 'centaines de morceaux', per: 'par jour' },
          { prod: 'de briques', ville: 'Mbour', u: 'milliers de briques', per: 'par jour' },
          { prod: 'd’arachides grillées', ville: 'Diourbel', u: 'centaines de sachets', per: 'par jour' }
        ]);
        var x0 = rng.int(3, 8), a = rng.int(1, Math.floor((3 * x0 - 1) / 2));
        var b = 3 * x0 * x0 - 2 * a * x0;
        var top = 2 * x0 * x0 * x0 - a * x0 * x0;
        var c = rng.int(5, Math.max(6, Math.floor(top / 2)));
        var X = x0 + rng.int(2, 4);
        var P = [-1, a, b, -c], D = [-3, 2 * a, b];
        var Bmax = pval(P, x0), B0 = -c, BX = pval(P, X);
        var x1 = F(-b, 3 * x0);
        enonce = 'Une entreprise de ' + ctx.ville + ' produit $x$ ' + ctx.u + ' ' + ctx.prod + ' ' + ctx.per + ', avec $0 \\leq x \\leq ' + X + '$. Son bénéfice, en milliers de F CFA, est $$B(x) = ' + T.poly(P) + '.$$ Calculer $B\'(x)$, puis déterminer la production qui rend le bénéfice maximal et ce bénéfice maximal.';
        steps.push('$B\'(x) = ' + T.poly(D) + '$.');
        steps.push('$B\'(' + x0 + ') = ' + substTex(D, x0) + ' = 0$ : $' + x0 + '$ est une racine. Le produit des racines de ce trinôme vaut $\\dfrac{' + b + '}{-3}$, donc l’autre racine est $' + x1.tex() + ' < 0$. Ainsi $B\'(x) = -3' + T.xMinus(x0) + '\\left(x + ' + x1.neg().tex() + '\\right)$.');
        steps.push('Sur $[0 ; ' + X + ']$, $x + ' + x1.neg().tex() + ' > 0$ : $B\'(x)$ est positif avant $' + x0 + '$ et négatif après.' +
          varTable(['0', T.num(x0), T.num(X)], ['+', '-'], ['0'], [T.num(B0), T.num(Bmax), T.num(BX)], 'B'));
        steps.push('Le bénéfice est maximal pour $x = ' + x0 + '$ ' + ctx.u + ' : $B(' + x0 + ') = ' + substTex(P, x0) + ' = ' + Bmax + '$, soit $' + T.num(Bmax * 1000) + '$ F CFA.');
        questions = [
          { label: '$B\'(x) =$', type: 'expr', reponse: pstr(D), reponseTex: T.poly(D) },
          { label: 'Production optimale : $x =$', type: 'number', reponse: x0 },
          { label: 'Bénéfice maximal (en milliers de F CFA) :', type: 'number', reponse: Bmax }
        ];
      } else {
        var V = rng.pick([[4, 2], [32, 4], [108, 6], [256, 8], [500, 10]]);
        var vol = V[0], xs = V[1], Smin = 3 * xs * xs;
        var who = rng.pick(['Un menuisier de Kaolack fabrique des bacs à poissons pour le port de Joal', 'Un ferblantier de Rufisque fabrique des bacs de stockage pour les maraîchers des Niayes', 'Un artisan de Saint-Louis fabrique des caisses pour les pêcheurs de Guet Ndar']);
        enonce = who + ' : ce sont des boîtes sans couvercle, à base carrée de côté $x$ dm, de volume $' + vol + '$ dm³. On veut utiliser le moins de matériau possible.<br>Montrer que la surface de matériau est $S(x) = x^2 + \\dfrac{' + (4 * vol) + '}{x}$ pour $x > 0$, puis calculer $S\'(x)$, la valeur de $x$ qui minimise $S$ et la surface minimale.';
        steps.push('La hauteur $h$ vérifie $x^2h = ' + vol + '$, donc $h = \\dfrac{' + vol + '}{x^2}$. Surface : le fond $x^2$ et quatre faces de $xh$ : $S(x) = x^2 + 4x \\times \\dfrac{' + vol + '}{x^2} = x^2 + \\dfrac{' + (4 * vol) + '}{x}$.');
        steps.push('$S\'(x) = 2x - \\dfrac{' + (4 * vol) + '}{x^2} = \\dfrac{2x^3 - ' + (4 * vol) + '}{x^2} = \\dfrac{2(x^3 - ' + (2 * vol) + ')}{x^2}$.');
        steps.push('$x^3 - ' + (2 * vol) + ' = 0 \\iff x = ' + xs + '$ (car $' + xs + '^3 = ' + (2 * vol) + '$). Sur $]0 ; +\\infty[$, $S\'(x) < 0$ pour $x < ' + xs + '$ et $S\'(x) > 0$ pour $x > ' + xs + '$ : $S$ est minimale en $x = ' + xs + '$.');
        steps.push('$S(' + xs + ') = ' + (xs * xs) + ' + \\dfrac{' + (4 * vol) + '}{' + xs + '} = ' + (xs * xs) + ' + ' + (2 * xs * xs) + ' = ' + Smin + '$ dm² (la hauteur vaut alors $' + T.num(xs / 2) + '$ dm).');
        questions = [
          { label: '$S\'(x) =$', type: 'expr', reponse: '2x-' + (4 * vol) + '/x^2', reponseTex: '2x - \\dfrac{' + (4 * vol) + '}{x^2}', domaine: [0.5, 6] },
          { label: 'Côté optimal : $x =$', type: 'number', reponse: xs, unite: 'dm' },
          { label: 'Surface minimale :', type: 'number', reponse: Smin, unite: 'dm²' }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Calcule la dérivée et cherche où elle s’annule en changeant de signe sur l’intervalle d’étude.',
          'Dresse le tableau de variation : l’optimum se lit au changement de sens de variation.'
        ],
        solution: steps
      };
    }
  });

  /* -------- Lecture graphique -------- */
  EM.gen.register({
    id: '1s-lecture-graphique',
    titre: 'Lire graphiquement extremums, variations et nombre de solutions',
    chapitres: ['1s-etude-fonctions'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var h = rng.int(-2, 2), w = niveau === 1 ? 1 : rng.pick([1, 2]), v = rng.int(-2, 2), m = rng.pick([2, 3, 3, 4]), s = rng.pick([1, -1]);
      var f = function (x) { var t = (x - h) / w; return v + s * m * (t * t * t - 3 * t) / 2; };
      var a0 = h - 2 * w, a1 = h - w, a2 = h + w, a3 = h + 2 * w;
      var xmin = Math.min(a0 - 1, -1), xmax = Math.max(a3 + 1, 1), ymin = Math.min(v - m - 1.5, -1), ymax = Math.max(v + m + 1.5, 1);
      var fig = EM.fig.create({ w: 300, h: 240, xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, title: 'Courbe de la fonction f' }).axes({ step: 1 });
      fig.curve(f, { from: a0, to: a3 });
      var rr = 4 * (xmax - xmin) / 300;
      fig.circle([a0, f(a0)], rr).circle([a3, f(a3)], rr).dot([a1, f(a1)], { accent: true }).dot([a2, f(a2)], { accent: true });
      var xMax = s > 0 ? a1 : a2, xMin = s > 0 ? a2 : a1;
      var kind = rng.pick(['in', 'in', 'edge', 'out']), k, nb;
      if (kind === 'in') { k = v + rng.int(-m + 1, m - 1); nb = 3; }
      else if (kind === 'edge') { k = v + rng.pick([m, -m]); nb = 1; }
      else { k = v + rng.pick([m + 1, -m - 1]); nb = 0; }
      var I = ']' + a0 + ' ; ' + a3 + '[';
      var steps = [
        'Sur $I = ' + I + '$, la courbe ' + (s > 0 ? 'monte jusqu’au point $(' + a1 + ' ; ' + (v + m) + ')$, descend jusqu’au point $(' + a2 + ' ; ' + (v - m) + ')$ puis remonte.' : 'descend jusqu’au point $(' + a1 + ' ; ' + (v - m) + ')$, monte jusqu’au point $(' + a2 + ' ; ' + (v + m) + ')$ puis redescend.'),
        'Maximum local : $' + (v + m) + '$, atteint en $x = ' + xMax + '$ ; minimum local : $' + (v - m) + '$, atteint en $x = ' + xMin + '$. En ces points la tangente est horizontale, donc $f\'(' + a1 + ') = f\'(' + a2 + ') = 0$.',
        'Les solutions de $f(x) = ' + k + '$ sont les abscisses des points d’intersection de la courbe avec la droite horizontale $y = ' + k + '$. ' +
          (nb === 3 ? 'Comme $' + (v - m) + ' < ' + k + ' < ' + (v + m) + '$, cette droite coupe la courbe en $3$ points.' :
            nb === 1 ? 'La droite passe par un extremum local ; elle passe aussi par une extrémité de la courbe, mais cette extrémité n’appartient pas à la courbe (l’intervalle $I$ est ouvert) : $1$ seul point d’intersection.' :
              'La droite est en dehors de la bande $' + (v - m) + ' \\leq y \\leq ' + (v + m) + '$ : aucun point d’intersection.')
      ];
      var questions;
      if (niveau === 1) {
        questions = [
          { label: 'Valeur du maximum local de $f$ :', type: 'number', reponse: v + m },
          { label: 'Abscisse du point où $f$ admet son minimum local :', type: 'number', reponse: xMin },
          { label: 'Nombre de solutions de $f(x) = ' + k + '$ dans $I$ :', type: 'number', reponse: nb }
        ];
      } else {
        var mot = s > 0 ? 'décroissante' : 'croissante';
        steps.push('$f$ est ' + mot + ' sur $[' + a1 + ' ; ' + a2 + ']$ (entre ses deux extremums locaux).');
        questions = [
          { label: 'Solutions de $f\'(x) = 0$ : $S =$', type: 'set', reponse: [a1, a2] },
          { label: 'Intervalle sur lequel $f$ est ' + mot + ' :', type: 'interval', reponse: { a: a1, b: a2, ouvA: false, ouvB: false } },
          { label: 'Nombre de solutions de $f(x) = ' + k + '$ dans $I$ :', type: 'number', reponse: nb }
        ];
      }
      return {
        enonce: 'La courbe ci-dessous représente une fonction $f$ dérivable sur l’intervalle ouvert $I = ' + I + '$ (les extrémités, marquées par des cercles vides, n’appartiennent pas à la courbe). Les points où la tangente est horizontale (en couleur) ont des coordonnées entières. Répondre par lecture graphique.',
        figure: fig.svg(),
        questions: questions,
        indices: [
          'Un maximum local est le sommet d’une « bosse », un minimum local le fond d’un « creux » ; la tangente y est horizontale.',
          'Pour compter les solutions de $f(x) = k$, trace mentalement la droite horizontale $y = k$.'
        ],
        solution: steps,
        aide: 'Écris un intervalle comme [-1 ; 1] et un ensemble comme -1 ; 1.'
      };
    }
  });

  /* ================================================================== */
  /* 6. Suites numériques                                                */
  /* ================================================================== */

  /* -------- Suite arithmétique -------- */
  EM.gen.register({
    id: '1s-suite-arithmetique',
    titre: 'Suites arithmétiques : terme général et somme',
    chapitres: ['1s-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau === 1) {
        var u0 = rng.int(-10, 20), r = rng.nz(-5, 6), N = rng.int(8, 30);
        var uN = u0 + N * r, S = (N + 1) * (u0 + uN) / 2;
        enonce = '$(u_n)$ est la suite arithmétique de premier terme $u_0 = ' + u0 + '$ et de raison $r = ' + r + '$. Calculer $u_{' + N + '}$ puis la somme $S = u_0 + u_1 + \\dots + u_{' + N + '}$.';
        steps.push('$u_n = u_0 + nr$, donc $u_{' + N + '} = ' + u0 + ' + ' + N + ' \\times ' + T.par(r) + ' = ' + uN + '$.');
        steps.push('De $u_0$ à $u_{' + N + '}$, il y a $' + (N + 1) + '$ termes : $S = ' + (N + 1) + ' \\times \\dfrac{' + u0 + ' + ' + T.par(uN) + '}{2} = ' + T.num(S) + '$.');
        questions = [
          { label: '$u_{' + N + '} =$', type: 'number', reponse: uN },
          { label: '$S =$', type: 'number', reponse: S }
        ];
      } else if (niveau === 2) {
        var p = rng.int(1, 5), q = p + rng.int(2, 8), r2 = rng.nz(-4, 5), u02 = rng.int(-10, 15);
        var up = u02 + p * r2, uq = u02 + q * r2;
        enonce = '$(u_n)$ est une suite arithmétique telle que $u_{' + p + '} = ' + up + '$ et $u_{' + q + '} = ' + uq + '$. Déterminer sa raison $r$, son premier terme $u_0$ et l’expression de $u_n$ en fonction de $n$.';
        steps.push('$u_{' + q + '} = u_{' + p + '} + (' + q + ' - ' + p + ')r$, donc $' + (q - p) + 'r = ' + uq + ' - ' + T.par(up) + ' = ' + (uq - up) + '$ et $r = ' + r2 + '$.');
        steps.push('$u_{' + p + '} = u_0 + ' + T.mono(p, 'r', true) + '$, donc $u_0 = ' + up + ' - ' + p + ' \\times ' + T.par(r2) + ' = ' + u02 + '$.');
        steps.push('$u_n = u_0 + nr = ' + T.poly([r2, u02], 'n') + '$.');
        questions = [
          { label: '$r =$', type: 'number', reponse: r2 },
          { label: '$u_0 =$', type: 'number', reponse: u02 },
          { label: '$u_n =$', type: 'expr', variable: 'n', reponse: pstr([r2, u02], 'n'), reponseTex: T.poly([r2, u02], 'n'), domaine: [0, 10] }
        ];
      } else {
        if (rng.bool()) {
          var nom = rng.pick(PRENOMS), u1 = 500 * rng.int(4, 20), r3 = 250 * rng.int(1, 6), N3 = rng.pick([10, 12, 12, 24]);
          var uN3 = u1 + (N3 - 1) * r3, S3 = N3 * (u1 + uN3) / 2;
          enonce = nom + ' prépare la Tabaski. Le premier mois, ' + (nom === 'Moussa' || nom === 'Mamadou' || nom === 'Ibrahima' || nom === 'Ousmane' || nom === 'Cheikh' || nom === 'Abdoulaye' || nom === 'Babacar' || nom === 'Modou' || nom === 'Lamine' ? 'il' : 'elle') + ' met $' + T.num(u1) + '$ F CFA de côté, puis chaque mois $' + T.num(r3) + '$ F CFA de plus que le mois précédent. On note $u_n$ la somme mise de côté le $n$-ième mois.<br>Calculer la somme mise de côté le ' + N3 + 'e mois, puis le total économisé en ' + N3 + ' mois.';
          steps.push('$(u_n)$ est arithmétique de premier terme $u_1 = ' + T.num(u1) + '$ et de raison $r = ' + T.num(r3) + '$, donc $u_n = u_1 + (n - 1)r$.');
          steps.push('$u_{' + N3 + '} = ' + T.num(u1) + ' + ' + (N3 - 1) + ' \\times ' + T.num(r3) + ' = ' + T.num(uN3) + '$ F CFA.');
          steps.push('Total : $S = u_1 + \\dots + u_{' + N3 + '} = ' + N3 + ' \\times \\dfrac{' + T.num(u1) + ' + ' + T.num(uN3) + '}{2} = ' + T.num(S3) + '$ F CFA.');
          questions = [
            { label: '$u_{' + N3 + '} =$', type: 'number', reponse: uN3, unite: 'F CFA' },
            { label: 'Total :', type: 'number', reponse: S3, unite: 'F CFA' }
          ];
        } else {
          var lieu = rng.pick(['la salle des fêtes de ' + rng.pick(VILLES), 'la tribune d’un stade de ' + rng.pick(VILLES), 'l’amphithéâtre d’un lycée de ' + rng.pick(VILLES)]);
          var a1 = rng.int(12, 30), r4 = rng.pick([2, 3, 4]), N4 = rng.int(10, 25);
          var aN = a1 + (N4 - 1) * r4, S4 = N4 * (a1 + aN) / 2;
          enonce = 'Dans ' + lieu + ', le premier rang compte $' + a1 + '$ places et chaque rang compte $' + r4 + '$ places de plus que le précédent. Il y a $' + N4 + '$ rangs. Combien de places compte le dernier rang ? Combien de places y a-t-il au total ?';
          steps.push('Le nombre de places du rang $n$ est une suite arithmétique : $u_1 = ' + a1 + '$, $r = ' + r4 + '$, $u_n = u_1 + (n - 1)r$.');
          steps.push('$u_{' + N4 + '} = ' + a1 + ' + ' + (N4 - 1) + ' \\times ' + r4 + ' = ' + aN + '$ places.');
          steps.push('Total : $S = ' + N4 + ' \\times \\dfrac{' + a1 + ' + ' + aN + '}{2} = ' + T.num(S4) + '$ places.');
          questions = [
            { label: 'Dernier rang :', type: 'number', reponse: aN },
            { label: 'Total des places :', type: 'number', reponse: S4 }
          ];
        }
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Terme général : $u_n = u_0 + nr$ ou, plus généralement, $u_n = u_p + (n - p)r$.',
          'Somme : (nombre de termes) $\\times$ (premier + dernier) $\\div 2$. Compte bien les termes !'
        ],
        solution: steps,
        aide: 'Pour $u_n$, écris une expression en n, par exemple 3n - 2.'
      };
    }
  });

  /* -------- Suite géométrique -------- */
  EM.gen.register({
    id: '1s-suite-geometrique',
    titre: 'Suites géométriques : terme général, somme, intérêts composés',
    chapitres: ['1s-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau === 1) {
        var u0 = rng.nz(-5, 5), q = rng.pick([2, 3, -2, -3, 2]), N = Math.abs(q) === 3 ? rng.int(3, 6) : rng.int(4, 8);
        var uN = u0 * Math.pow(q, N), S = u0 * (1 - Math.pow(q, N + 1)) / (1 - q);
        enonce = '$(u_n)$ est la suite géométrique de premier terme $u_0 = ' + u0 + '$ et de raison $q = ' + q + '$. Calculer $u_{' + N + '}$ et $S = u_0 + u_1 + \\dots + u_{' + N + '}$.';
        steps.push('$u_n = u_0 q^n$, donc $u_{' + N + '} = ' + u0 + ' \\times ' + T.par(q) + '^{' + N + '} = ' + T.num(u0) + ' \\times ' + T.par(Math.pow(q, N)) + ' = ' + T.num(uN) + '$.');
        steps.push('Il y a $' + (N + 1) + '$ termes : $S = u_0 \\times \\dfrac{1 - q^{' + (N + 1) + '}}{1 - q} = ' + u0 + ' \\times \\dfrac{1 - ' + T.par(q) + '^{' + (N + 1) + '}}{1 - ' + T.par(q) + '} = ' + u0 + ' \\times \\dfrac{' + T.num(1 - Math.pow(q, N + 1)) + '}{' + (1 - q) + '} = ' + T.num(S) + '$.');
        questions = [
          { label: '$u_{' + N + '} =$', type: 'number', reponse: uN },
          { label: '$S =$', type: 'number', reponse: S }
        ];
      } else if (niveau === 2) {
        var qq = rng.pick([F(2), F(3), F(1, 2), F(1, 3)]), kk = rng.int(1, 4);
        var u02 = qq.d === 1 ? F(kk) : F(kk * Math.pow(qq.d, 3));
        var u1 = u02.mul(qq), u3 = u02.mul(qq.pow(3));
        enonce = '$(u_n)$ est une suite géométrique de raison $q > 0$ telle que $u_1 = ' + u1.tex() + '$ et $u_3 = ' + u3.tex() + '$. Déterminer $q$, $u_0$ et l’expression de $u_n$ en fonction de $n$.';
        steps.push('$u_3 = u_1 \\times q^2$, donc $q^2 = \\dfrac{' + u3.tex() + '}{' + u1.tex() + '} = ' + qq.pow(2).tex() + '$ et, comme $q > 0$, $q = ' + qq.tex() + '$.');
        steps.push('$u_1 = u_0 \\times q$, donc $u_0 = \\dfrac{u_1}{q} = ' + u02.tex() + '$.');
        var qT = qq.d === 1 ? T.num(qq) : '\\left(' + qq.tex() + '\\right)';
        steps.push('$u_n = u_0 q^n = ' + (u02.equals(1) ? '' : u02.tex() + ' \\times ') + qT + '^{n}$.');
        questions = [
          { label: '$q =$', type: 'number', reponse: qq },
          { label: '$u_0 =$', type: 'number', reponse: u02 },
          { label: '$u_n =$', type: 'expr', variable: 'n', reponse: u02.toString() + '*(' + qq.toString() + ')^n', reponseTex: (u02.equals(1) ? '' : u02.tex() + ' \\times ') + qT + '^{n}', domaine: [0, 6] }
        ];
      } else {
        var C0 = rng.pick([100000, 150000, 200000, 250000, 500000]), t = rng.pick([3, 4, 5, 6, 8]), N3 = rng.int(3, 10);
        var coef = 1 + t / 100, CN = C0 * Math.pow(coef, N3);
        var mult = rng.pick([1.25, 1.5, 2]), cible = C0 * mult, n = 0;
        while (C0 * Math.pow(coef, n) < cible - 1e-6) n++;
        var nom = rng.pick(PRENOMS);
        enonce = nom + ' place $' + T.num(C0) + '$ F CFA dans une banque de ' + rng.pick(VILLES) + ' au taux annuel de $' + t + '\\,\\%$, à intérêts composés. On note $C_n$ le capital au bout de $n$ années.<br>Calculer $C_{' + N3 + '}$ (arrondi au franc), puis déterminer au bout de combien d’années le capital atteint ou dépasse $' + T.num(cible) + '$ F CFA.';
        steps.push('Chaque année, le capital est multiplié par $1 + \\dfrac{' + t + '}{100} = ' + T.num(coef) + '$ : $(C_n)$ est géométrique de raison $' + T.num(coef) + '$ et $C_n = ' + T.num(C0) + ' \\times ' + T.num(coef) + '^n$.');
        steps.push('$C_{' + N3 + '} = ' + T.num(C0) + ' \\times ' + T.num(coef) + '^{' + N3 + '} \\approx ' + T.num(Math.round(CN)) + '$ F CFA.');
        steps.push('À la calculatrice : $C_{' + (n - 1) + '} \\approx ' + T.num(Math.round(C0 * Math.pow(coef, n - 1))) + '$ et $C_{' + n + '} \\approx ' + T.num(Math.round(C0 * Math.pow(coef, n))) + '$. Le capital atteint $' + T.num(cible) + '$ F CFA au bout de $' + n + '$ ans.');
        questions = [
          { label: '$C_{' + N3 + '} \\approx$', type: 'number', reponse: Math.round(CN), tol: 1, unite: 'F CFA' },
          { label: 'Nombre d’années :', type: 'number', reponse: n }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Terme général : $u_n = u_0 q^n = u_p q^{n-p}$.',
          'Somme : premier terme $\\times \\dfrac{1 - q^{\\text{nombre de termes}}}{1 - q}$. Augmenter de $t\\,\\%$ revient à multiplier par $1 + \\dfrac{t}{100}$.'
        ],
        solution: steps,
        aide: 'Pour $u_n$, écris une expression en n, par exemple 3*2^n ou 16*(1/2)^n.'
      };
    }
  });

  /* -------- Suite auxiliaire u(n+1) = a u(n) + b -------- */
  EM.gen.register({
    id: '1s-suite-auxiliaire',
    titre: 'Étudier une suite u(n+1) = a·u(n) + b à l’aide d’une suite géométrique',
    chapitres: ['1s-suites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = niveau === 1 ? F(rng.pick([2, 3])) : rng.pick([F(1, 2), F(1, 3), F(2, 3)]);
      var mult = a.d, l;
      do { l = mult * rng.nz(-4, 4); } while (l === 0);
      var b = F(l).mul(F(1).sub(a));
      var u0 = rng.intExcept(-6, 10, [l]);
      var v0 = F(u0 - l);
      var aT = a.d === 1 ? T.num(a) : a.tex();
      var aP = a.d === 1 ? T.num(a) : '\\left(' + a.tex() + '\\right)';
      var rel = 'u_{n+1} = ' + (a.d === 1 ? T.num(a) : a.tex()) + 'u_n' + T.signed(b);
      var steps = [
        '$v_{n+1} = u_{n+1} - \\ell = ' + aT + 'u_n' + T.signed(b) + ' - \\ell$. Comme $u_n = v_n + \\ell$ : $v_{n+1} = ' + aT + 'v_n + ' + aT + '\\ell' + T.signed(b) + ' - \\ell$.',
        '$(v_n)$ est géométrique de raison $' + aT + '$ si et seulement si $' + aT + '\\ell' + T.signed(b) + ' - \\ell = 0$, soit $\\ell = \\dfrac{' + b.tex() + '}{1 - ' + aP + '} = ' + l + '$.',
        'Alors $v_{n+1} = ' + aT + 'v_n$ et $v_0 = u_0 - \\ell = ' + u0 + ' - ' + T.par(l) + ' = ' + v0.tex() + '$, donc $v_n = ' + cf(v0) + aP + '^{n}$.',
        'Enfin $u_n = v_n + \\ell = ' + cf(v0) + aP + '^{n}' + T.signed(l) + '$.'
      ];
      var repT = cf(v0) + aP + '^{n}' + T.signed(l);
      return {
        enonce: 'On considère la suite $(u_n)$ définie par $u_0 = ' + u0 + '$ et, pour tout entier naturel $n$, $' + rel + '$. On pose $v_n = u_n - \\ell$, où $\\ell$ est un réel.<br>Déterminer $\\ell$ pour que $(v_n)$ soit géométrique ; donner sa raison, son premier terme, puis exprimer $u_n$ en fonction de $n$.',
        questions: [
          { label: '$\\ell =$', type: 'number', reponse: l },
          { label: 'Raison de $(v_n)$ :', type: 'number', reponse: a },
          { label: '$v_0 =$', type: 'number', reponse: v0 },
          { label: '$u_n =$', type: 'expr', variable: 'n', reponse: '(' + v0.toString() + ')*(' + a.toString() + ')^n+(' + l + ')', reponseTex: repT, domaine: [0, 6] }
        ],
        indices: [
          'Exprime $v_{n+1}$ en fonction de $v_n$ en remplaçant $u_n$ par $v_n + \\ell$.',
          '$\\ell$ est la solution de $\\ell = a\\ell + b$ ; ensuite $v_n = v_0 \\times a^n$ et $u_n = v_n + \\ell$.'
        ],
        solution: steps,
        aide: 'Pour $u_n$, écris une expression en n, par exemple -4*(1/2)^n + 6.'
      };
    }
  });

  /* ================================================================== */
  /* 7. Trigonométrie                                                    */
  /* ================================================================== */

  /* Valeurs remarquables c√s/2 (c = ±1, s ∈ {1, 2, 3}) */
  function v2Tex(v) { return (v.c < 0 ? '-' : '') + '\\dfrac{' + (v.s === 1 ? '1' : '\\sqrt{' + v.s + '}') + '}{2}'; }
  /** (x√2 + y√6)/4 avec x, y = ±1 */
  function r26Tex(x, y) {
    if (x > 0 && y > 0) return '\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}';
    if (x < 0 && y > 0) return '\\dfrac{\\sqrt{6} - \\sqrt{2}}{4}';
    if (x > 0 && y < 0) return '\\dfrac{\\sqrt{2} - \\sqrt{6}}{4}';
    return '-\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}';
  }
  function r26Str(x, y) { return '(' + (y > 0 ? '' : '-') + 'sqrt(6)' + (x > 0 ? '+' : '-') + 'sqrt(2))/4'; }
  function q4Tex(c, s) { return (c < 0 ? '-' : '') + '\\dfrac{\\sqrt{' + s + '}}{4}'; }

  /* -------- Formules d'addition : valeurs exactes -------- */
  EM.gen.register({
    id: '1s-trigo-addition',
    titre: 'Calculer des valeurs exactes avec les formules d’addition',
    chapitres: ['1s-trigonometrie'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var ANG = [
        { k: F(1, 3), cos: { c: 1, s: 1 }, sin: { c: 1, s: 3 } },
        { k: F(1, 6), cos: { c: 1, s: 3 }, sin: { c: 1, s: 1 } },
        { k: F(2, 3), cos: { c: -1, s: 1 }, sin: { c: 1, s: 3 } },
        { k: F(-1, 6), cos: { c: 1, s: 3 }, sin: { c: -1, s: 1 } }
      ];
      var CASES = [[0, -1], [1, 1], [0, 1], [2, 1], [1, -1], [3, -1]];
      var cs = rng.pick(CASES), A = ANG[cs[0]], op = cs[1];
      var th = A.k.add(F(op, 4));
      var thT = piTex(th), AT = piTex(A.k), opT = op > 0 ? ' + ' : ' - ', p4 = '\\dfrac{\\pi}{4}';
      var AA = A.k.sign() < 0 ? '\\left(' + AT + '\\right)' : AT;
      var r2 = v2Tex({ c: 1, s: 2 });
      // cos(A ± π/4) = cosA·√2/2 ∓ sinA·√2/2 ; sin(A ± π/4) = sinA·√2/2 ± cosA·√2/2
      function combine(t1, t2) { // t = {c, s} produits /4 avec s ∈ {2, 6}
        var x = 0, y = 0;
        [t1, t2].forEach(function (t) { if (t.s === 2) x += t.c; else y += t.c; });
        return { x: x, y: y };
      }
      var cA = A.cos, sA = A.sin;
      var cT1 = { c: cA.c, s: cA.s * 2 }, cT2 = { c: -op * sA.c, s: sA.s * 2 };
      var sT1 = { c: sA.c, s: sA.s * 2 }, sT2 = { c: op * cA.c, s: cA.s * 2 };
      var C = combine(cT1, cT2), S = combine(sT1, sT2);
      var steps = ['On remarque que $' + thT + ' = ' + AT + opT + p4 + '$.'];
      var cosLine = '$\\cos\\left(' + thT + '\\right) = \\cos' + AA + '\\cos' + p4 + (op > 0 ? ' - ' : ' + ') + '\\sin' + AA + '\\sin' + p4 + ' = \\left(' + v2Tex(cA) + '\\right) \\times ' + r2 + (op > 0 ? ' - ' : ' + ') + '\\left(' + v2Tex(sA) + '\\right) \\times ' + r2 + ' = ' + q4Tex(cT1.c, cT1.s) + (cT2.c < 0 ? ' - ' : ' + ') + '\\dfrac{\\sqrt{' + cT2.s + '}}{4} = ' + r26Tex(C.x, C.y) + '$.';
      var sinLine = '$\\sin\\left(' + thT + '\\right) = \\sin' + AA + '\\cos' + p4 + (op > 0 ? ' + ' : ' - ') + '\\cos' + AA + '\\sin' + p4 + ' = \\left(' + v2Tex(sA) + '\\right) \\times ' + r2 + (op > 0 ? ' + ' : ' - ') + '\\left(' + v2Tex(cA) + '\\right) \\times ' + r2 + ' = ' + q4Tex(sT1.c, sT1.s) + (sT2.c < 0 ? ' - ' : ' + ') + '\\dfrac{\\sqrt{' + sT2.s + '}}{4} = ' + r26Tex(S.x, S.y) + '$.';
      var qCos = { label: '$\\cos\\left(' + thT + '\\right) =$', type: 'number', reponse: r26Str(C.x, C.y), reponseTex: r26Tex(C.x, C.y) };
      var qSin = { label: '$\\sin\\left(' + thT + '\\right) =$', type: 'number', reponse: r26Str(S.x, S.y), reponseTex: r26Tex(S.x, S.y) };
      var questions, enonce;
      if (niveau === 1) {
        var which = rng.bool();
        steps.push(which ? cosLine : sinLine);
        questions = [which ? qCos : qSin];
        enonce = 'En remarquant que $' + thT + ' = ' + AT + opT + p4 + '$, calculer la valeur exacte de $' + (which ? '\\cos' : '\\sin') + '\\left(' + thT + '\\right)$.';
      } else {
        steps.push(cosLine, sinLine);
        questions = [qCos, qSin];
        enonce = 'Calculer les valeurs exactes de $\\cos\\left(' + thT + '\\right)$ et de $\\sin\\left(' + thT + '\\right)$' + (niveau === 3 ? ', puis de $\\tan\\left(' + thT + '\\right)$.' : '.');
        if (niveau === 3) {
          var P = -(S.x * C.x - 3 * S.y * C.y) / 2, Q = -(S.y * C.x - S.x * C.y) / 2;
          var tT = T.num(P) + (Q > 0 ? ' + ' : ' - ') + (Math.abs(Q) === 1 ? '' : Math.abs(Q)) + '\\sqrt{3}';
          var tS = P + (Q > 0 ? '+' : '-') + (Math.abs(Q) === 1 ? '' : Math.abs(Q) + '*') + 'sqrt(3)';
          function l3(x, y) { return T.num(x) + (y > 0 ? ' + ' : ' - ') + '\\sqrt{3}'; }
          steps.push('$\\tan\\left(' + thT + '\\right) = \\dfrac{\\sin}{\\cos} = \\dfrac{' + (S.x < 0 ? '-' : '') + '\\sqrt{2}' + (S.y < 0 ? ' - ' : ' + ') + '\\sqrt{6}}{' + (C.x < 0 ? '-' : '') + '\\sqrt{2}' + (C.y < 0 ? ' - ' : ' + ') + '\\sqrt{6}} = \\dfrac{' + l3(S.x, S.y) + '}{' + l3(C.x, C.y) + '}$ (on a divisé par $\\sqrt{2}$).');
          steps.push('On multiplie numérateur et dénominateur par $' + l3(C.x, -C.y) + '$ ; le dénominateur devient $' + T.par(C.x) + '^2 - 3 = -2$, d’où $\\tan\\left(' + thT + '\\right) = ' + tT + '$.');
          questions.push({ label: '$\\tan\\left(' + thT + '\\right) =$', type: 'number', reponse: tS, reponseTex: tT });
        }
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Écris $' + thT + '$ comme somme ou différence de deux angles remarquables (multiples de $\\dfrac{\\pi}{6}$ et $\\dfrac{\\pi}{4}$).',
          '$\\cos(a \\pm b) = \\cos a\\cos b \\mp \\sin a\\sin b$ et $\\sin(a \\pm b) = \\sin a\\cos b \\pm \\cos a\\sin b$.'
        ],
        solution: steps,
        aide: 'Écris par exemple (√6+√2)/4 ou (sqrt(6)-sqrt(2))/4.'
      };
    }
  });

  /* -------- Duplication et linéarisation -------- */
  EM.gen.register({
    id: '1s-trigo-duplication',
    titre: 'Utiliser les formules de duplication',
    chapitres: ['1s-trigonometrie'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau <= 2) {
        var tr = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
        var sw = rng.bool(), h = tr[2];
        var cm = sw ? tr[0] : tr[1], sm = sw ? tr[1] : tr[0];
        var Q = niveau === 1 ? rng.pick(['Q1', 'Q2']) : rng.pick(['Q1', 'Q2', 'Q3', 'Q4']);
        var sc = { Q1: [1, 1], Q2: [-1, 1], Q3: [-1, -1], Q4: [1, -1] }[Q];
        var Itex = { Q1: '\\left]0 \\,;\\, \\dfrac{\\pi}{2}\\right[', Q2: '\\left]\\dfrac{\\pi}{2} \\,;\\, \\pi\\right[', Q3: '\\left]-\\pi \\,;\\, -\\dfrac{\\pi}{2}\\right[', Q4: '\\left]-\\dfrac{\\pi}{2} \\,;\\, 0\\right[' }[Q];
        var cosA = F(sc[0] * cm, h), sinA = F(sc[1] * sm, h);
        var giveCos = niveau === 1 ? true : rng.bool();
        var given = giveCos ? cosA : sinA, other = giveCos ? sinA : cosA;
        var gN = giveCos ? '\\cos' : '\\sin', oN = giveCos ? '\\sin' : '\\cos';
        var cos2 = cosA.mul(cosA).mul(2).sub(1), sin2 = sinA.mul(cosA).mul(2);
        enonce = 'On donne $' + gN + ' a = ' + given.tex() + '$ avec $a \\in ' + Itex + '$. Calculer $' + oN + ' a$' + (niveau === 2 ? ', $\\sin 2a$' : '') + ' et $\\cos 2a$.';
        steps.push('$' + oN + '^2 a = 1 - ' + gN + '^2 a = 1 - ' + given.mul(given).tex() + ' = ' + other.mul(other).tex() + '$, donc $' + oN + ' a = ' + other.abs().tex() + '$ ou $' + oN + ' a = -' + other.abs().tex() + '$.');
        steps.push('Comme $a \\in ' + Itex + '$, $' + oN + ' a ' + (other.sign() > 0 ? '> 0' : '< 0') + '$ : $' + oN + ' a = ' + other.tex() + '$.');
        steps.push('$\\cos 2a = 2\\cos^2 a - 1 = 2 \\times ' + cosA.mul(cosA).tex() + ' - 1 = ' + cos2.tex() + '$.');
        questions = [{ label: '$' + oN + ' a =$', type: 'number', reponse: other }];
        if (niveau === 2) {
          steps.push('$\\sin 2a = 2\\sin a\\cos a = 2 \\times ' + T.par(sinA) + ' \\times ' + T.par(cosA) + ' = ' + sin2.tex() + '$.');
          questions.push({ label: '$\\sin 2a =$', type: 'number', reponse: sin2 });
        }
        questions.push({ label: '$\\cos 2a =$', type: 'number', reponse: cos2 });
      } else {
        var cases = [[1, 8], [3, 8], [7, 8], [-1, 8], [1, 12], [5, 12], [11, 12], [-5, 12]];
        var cc = rng.pick(cases), th = F(cc[0], cc[1]), d2 = th.mul(2);
        var fn = rng.pick(['cos', 'sin']);
        var k = th.d === 8 ? 2 : 3;
        var c2sign = Math.cos(d2.value() * Math.PI) > 0 ? 1 : -1;
        var sigma = fn === 'cos' ? c2sign : -c2sign;
        var val = fn === 'cos' ? Math.cos(th.value() * Math.PI) : Math.sin(th.value() * Math.PI);
        var sg = val > 0 ? 1 : -1;
        var thT = piTex(th), d2T = piTex(d2);
        var c2T = (c2sign < 0 ? '-' : '') + '\\dfrac{\\sqrt{' + k + '}}{2}';
        var resT = (sg < 0 ? '-' : '') + '\\dfrac{\\sqrt{2' + (sigma > 0 ? ' + ' : ' - ') + '\\sqrt{' + k + '}}}{2}';
        var resS = (sg < 0 ? '-' : '') + 'sqrt(2' + (sigma > 0 ? '+' : '-') + 'sqrt(' + k + '))/2';
        var tv = th.value();
        var quad = tv > 0 && tv < 0.5 ? '\\left]0 \\,;\\, \\dfrac{\\pi}{2}\\right[' : tv > 0.5 ? '\\left]\\dfrac{\\pi}{2} \\,;\\, \\pi\\right[' : tv > -0.5 ? '\\left]-\\dfrac{\\pi}{2} \\,;\\, 0\\right[' : '\\left]-\\pi \\,;\\, -\\dfrac{\\pi}{2}\\right[';
        enonce = 'Sachant que $\\cos\\left(' + d2T + '\\right) = ' + c2T + '$, calculer la valeur exacte de $\\' + fn + '\\left(' + thT + '\\right)$.';
        if (fn === 'cos') steps.push('$\\cos 2a = 2\\cos^2 a - 1$, donc $\\cos^2 a = \\dfrac{1 + \\cos 2a}{2}$. Avec $a = ' + thT + '$ : $\\cos^2\\left(' + thT + '\\right) = \\dfrac{1' + (c2sign > 0 ? ' + ' : ' - ') + '\\frac{\\sqrt{' + k + '}}{2}}{2} = \\dfrac{2' + (sigma > 0 ? ' + ' : ' - ') + '\\sqrt{' + k + '}}{4}$.');
        else steps.push('$\\cos 2a = 1 - 2\\sin^2 a$, donc $\\sin^2 a = \\dfrac{1 - \\cos 2a}{2}$. Avec $a = ' + thT + '$ : $\\sin^2\\left(' + thT + '\\right) = \\dfrac{1' + (c2sign > 0 ? ' - ' : ' + ') + '\\frac{\\sqrt{' + k + '}}{2}}{2} = \\dfrac{2' + (sigma > 0 ? ' + ' : ' - ') + '\\sqrt{' + k + '}}{4}$.');
        steps.push('Comme $' + thT + ' \\in ' + quad + '$, $\\' + fn + '\\left(' + thT + '\\right) ' + (sg > 0 ? '> 0' : '< 0') + '$, donc $\\' + fn + '\\left(' + thT + '\\right) = ' + resT + '$.');
        questions = [{ label: '$\\' + fn + '\\left(' + thT + '\\right) =$', type: 'number', reponse: resS, reponseTex: resT }];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Utilise $\\cos^2 a + \\sin^2 a = 1$ et le signe imposé par l’intervalle.',
          '$\\cos 2a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$ et $\\sin 2a = 2\\sin a\\cos a$.'
        ],
        solution: steps,
        aide: 'Écris une fraction comme -7/25, ou une racine comme sqrt(2+sqrt(2))/2.'
      };
    }
  });

  /* -------- Équations trigonométriques dans ]-π ; π] -------- */
  EM.gen.register({
    id: '1s-equation-trigo',
    titre: 'Résoudre une équation trigonométrique dans ]−π ; π]',
    chapitres: ['1s-trigonometrie'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      // unités : π/24
      var COSV = [['1', 0], ['\\dfrac{\\sqrt{3}}{2}', 4], ['\\dfrac{\\sqrt{2}}{2}', 6], ['\\dfrac{1}{2}', 8], ['0', 12], ['-\\dfrac{1}{2}', 16], ['-\\dfrac{\\sqrt{2}}{2}', 18], ['-\\dfrac{\\sqrt{3}}{2}', 20], ['-1', 24]];
      var SINV = [['1', 12], ['\\dfrac{\\sqrt{3}}{2}', 8], ['\\dfrac{\\sqrt{2}}{2}', 6], ['\\dfrac{1}{2}', 4], ['0', 0], ['-\\dfrac{1}{2}', -4], ['-\\dfrac{\\sqrt{2}}{2}', -6], ['-\\dfrac{\\sqrt{3}}{2}', -8], ['-1', -12]];
      function U(n) { return F(n, 24); }
      function fam(base, m) { // texte « x = … + 2kπ » ou « + kπ »
        var per = m === 1 ? '2k\\pi' : 'k\\pi';
        return base.isZero() ? per : piTex(base) + ' + ' + per;
      }
      var fn, alpha, valT, m = 1, beta = 0, eqT, steps = [], pre = [];
      if (niveau === 3) {
        var PAIRS = [
          { lhs: '\\cos x + \\sin x', r: '\\sqrt{2}', r2: '1 + 1', phi: 6, cp: '\\dfrac{\\sqrt{2}}{2}', sp: '\\dfrac{\\sqrt{2}}{2}', rhs: [['1', 6], ['-1', 18], ['\\sqrt{2}', 0], ['0', 12]] },
          { lhs: '\\cos x - \\sin x', r: '\\sqrt{2}', r2: '1 + 1', phi: -6, cp: '\\dfrac{\\sqrt{2}}{2}', sp: '-\\dfrac{\\sqrt{2}}{2}', rhs: [['1', 6], ['-1', 18], ['\\sqrt{2}', 0], ['0', 12]] },
          { lhs: '\\sqrt{3}\\cos x + \\sin x', r: '2', r2: '3 + 1', phi: 4, cp: '\\dfrac{\\sqrt{3}}{2}', sp: '\\dfrac{1}{2}', rhs: [['1', 8], ['\\sqrt{2}', 6], ['\\sqrt{3}', 4], ['-1', 16], ['2', 0]] },
          { lhs: '\\cos x + \\sqrt{3}\\sin x', r: '2', r2: '1 + 3', phi: 8, cp: '\\dfrac{1}{2}', sp: '\\dfrac{\\sqrt{3}}{2}', rhs: [['1', 8], ['\\sqrt{2}', 6], ['\\sqrt{3}', 4], ['-1', 16], ['-\\sqrt{3}', 20]] },
          { lhs: '\\sqrt{3}\\cos x - \\sin x', r: '2', r2: '3 + 1', phi: -4, cp: '\\dfrac{\\sqrt{3}}{2}', sp: '-\\dfrac{1}{2}', rhs: [['1', 8], ['\\sqrt{2}', 6], ['-\\sqrt{2}', 18], ['-1', 16]] }
        ];
        var pa = rng.pick(PAIRS), rh = rng.pick(pa.rhs);
        fn = 'cos'; alpha = rh[1]; beta = -pa.phi;
        var cv = COSV.filter(function (c) { return c[1] === alpha; })[0][0];
        valT = cv;
        eqT = pa.lhs + ' = ' + rh[0];
        pre.push('$r = \\sqrt{' + pa.r2 + '} = ' + pa.r + '$ et $' + pa.lhs + ' = ' + pa.r + '\\left(' + pa.cp + '\\cos x ' + (pa.sp.charAt(0) === '-' ? '- ' + pa.sp.slice(1) : '+ ' + pa.sp) + '\\sin x\\right) = ' + pa.r + '\\cos\\left(x' + (pa.phi > 0 ? ' - ' : ' + ') + piTex(U(Math.abs(pa.phi))) + '\\right)$, car $\\cos\\varphi = ' + pa.cp + '$ et $\\sin\\varphi = ' + pa.sp + '$ pour $\\varphi = ' + piTex(U(pa.phi)) + '$.');
        pre.push('L’équation devient $\\cos\\left(x' + (pa.phi > 0 ? ' - ' : ' + ') + piTex(U(Math.abs(pa.phi))) + '\\right) = ' + (('\\dfrac{' + rh[0] + '}{' + pa.r + '}') === cv ? cv : '\\dfrac{' + rh[0] + '}{' + pa.r + '} = ' + cv) + '$.');
      } else {
        fn = rng.pick(['cos', 'sin']);
        var tab = fn === 'cos' ? COSV : SINV;
        var choix = niveau === 1 ? tab : tab.filter(function (t) { return Math.abs(t[1]) !== 12 || fn === 'cos'; });
        var row = rng.pick(choix);
        valT = row[0]; alpha = row[1];
        if (niveau === 2) {
          if (rng.bool(0.5)) m = 2;
          else beta = rng.pick([4, -4, 6, -6, 8, -8]);
        }
      }
      var argT = m === 2 ? '2x' : beta === 0 ? 'x' : 'x' + (beta > 0 ? ' + ' : ' - ') + piTex(U(Math.abs(beta)));
      var fnT = '\\' + fn + (m === 2 || beta !== 0 ? '\\left(' + argT + '\\right)' : ' x');
      if (niveau !== 3) eqT = fnT + ' = ' + valT;
      var thetas = fn === 'cos' ? [alpha, -alpha] : [alpha, 24 - alpha];
      if (((thetas[0] - thetas[1]) % 48 + 48) % 48 === 0) thetas = [thetas[0]];
      var sols = [], famT = [];
      thetas.forEach(function (th) {
        var base = U(th - beta).mul(F(1, m));
        famT.push(fam(base, m));
        for (var k = -4; k <= 4; k++) {
          var num = th - beta + 48 * k;
          if (num % m !== 0) continue;
          var X = num / m;
          if (X > -24 && X <= 24 && sols.indexOf(X) < 0) sols.push(X);
        }
      });
      sols.sort(function (a, b) { return a - b; });
      var aT = piTex(U(alpha));
      steps = steps.concat(pre);
      var lhsArg = niveau === 3 ? 'x' + (beta > 0 ? ' + ' : ' - ') + piTex(U(Math.abs(beta))) : argT;
      var fArg = lhsArg === 'x' ? '\\' + fn + ' x' : '\\' + fn + '\\left(' + lhsArg + '\\right)';
      var fAl = '\\' + fn + '\\left(' + aT + '\\right)';
      var fam2 = fn === 'cos' ? piTex(U(-alpha)) : alpha === 0 ? '\\pi' : '\\pi - ' + (alpha < 0 ? '\\left(' + aT + '\\right)' : aT);
      steps.push('$' + valT + ' = ' + fAl + '$, donc $' + fArg + ' = ' + fAl + ' \\iff ' + lhsArg + ' = ' + (alpha === 0 ? '2k\\pi' : aT + ' + 2k\\pi') + (thetas.length > 1 ? '$ ou $' + lhsArg + ' = ' + fam2 + ' + 2k\\pi' : '') + '$, $k \\in \\Z$.');
      if (!(fn === 'cos' && lhsArg === 'x')) steps.push('Donc $x = ' + famT.join('$ ou $x = ') + '$ ($k \\in \\Z$).');
      var solT = sols.map(function (X) { return piTex(U(X)); });
      steps.push('On donne à $k$ des valeurs entières et on garde les solutions de $]-\\pi \\,;\\, \\pi]$ : $S = ' + T.set(solT) + '$.');
      return {
        enonce: 'Résoudre dans $]-\\pi \\,;\\, \\pi]$ l’équation : $$' + eqT + '$$',
        questions: [{ label: '$S =$', type: 'set', reponse: sols.map(function (X) { return piStr(U(X)); }), reponseTex: T.set(solT) }],
        indices: [
          niveau === 3 ? 'Factorise par $r = \\sqrt{a^2 + b^2}$ pour écrire $a\\cos x + b\\sin x = r\\cos(x - \\varphi)$.' : 'Écris le second membre comme le ' + (fn === 'cos' ? 'cosinus' : 'sinus') + ' d’un angle remarquable.',
          fn === 'cos' ? '$\\cos X = \\cos\\alpha \\iff X = \\alpha + 2k\\pi$ ou $X = -\\alpha + 2k\\pi$.' : '$\\sin X = \\sin\\alpha \\iff X = \\alpha + 2k\\pi$ ou $X = \\pi - \\alpha + 2k\\pi$.'
        ],
        solution: steps,
        aide: 'Sépare les solutions par « ; ». Écris par exemple -5pi/6 ; pi/6 (ou avec π).'
      };
    }
  });

  /* ================================================================== */
  /* 8. Dénombrement                                                     */
  /* ================================================================== */

  function prodTex(n, p) { var t = []; for (var i = 0; i < p; i++) t.push(n - i); return t.join(' \\times '); }

  /* -------- Combinaisons et arrangements : comités et bureaux -------- */
  EM.gen.register({
    id: '1s-combinaisons',
    titre: 'Comités et bureaux : combinaisons et arrangements',
    chapitres: ['1s-denombrement'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau === 1) {
        var n = rng.int(5, 12), p = rng.int(2, Math.min(4, n - 1));
        var A = arr(n, p), C = comb(n, p);
        enonce = 'Calculer $A_{' + n + '}^{' + p + '}$ et $C_{' + n + '}^{' + p + '}$.';
        steps.push('$A_{' + n + '}^{' + p + '} = \\dfrac{' + n + '!}{' + (n - p) + '!} = ' + prodTex(n, p) + ' = ' + T.num(A) + '$ (produit de $' + p + '$ facteurs décroissants à partir de $' + n + '$).');
        steps.push('$C_{' + n + '}^{' + p + '} = \\dfrac{A_{' + n + '}^{' + p + '}}{' + p + '!} = \\dfrac{' + T.num(A) + '}{' + fact(p) + '} = ' + T.num(C) + '$.');
        questions = [
          { label: '$A_{' + n + '}^{' + p + '} =$', type: 'number', reponse: A },
          { label: '$C_{' + n + '}^{' + p + '} =$', type: 'number', reponse: C }
        ];
      } else {
        var g = rng.int(niveau === 2 ? 8 : 5, niveau === 2 ? 22 : 15), b = rng.int(niveau === 2 ? 8 : 5, niveau === 2 ? 22 : 15), N = g + b;
        var ville = rng.pick(VILLES);
        if (niveau === 2) {
          var p2 = rng.pick([3, 4]);
          var C2 = comb(N, p2), A3 = arr(N, 3);
          enonce = 'Une classe de 1ère S d’un lycée de ' + ville + ' compte $' + N + '$ élèves. Combien de comités de $' + p2 + '$ élèves peut-on former ? Combien de bureaux (un chef de classe, un adjoint et un trésorier, trois élèves différents) peut-on former ?';
          steps.push('Un comité est un groupe sans ordre : c’est une combinaison de $' + p2 + '$ élèves parmi $' + N + '$, soit $C_{' + N + '}^{' + p2 + '} = \\dfrac{' + prodTex(N, p2) + '}{' + fact(p2) + '} = ' + T.num(C2) + '$ comités.');
          steps.push('Dans un bureau, les rôles sont distincts (l’ordre compte) et un élève n’a qu’un rôle : c’est un arrangement, $A_{' + N + '}^{3} = ' + prodTex(N, 3) + ' = ' + T.num(A3) + '$ bureaux.');
          questions = [
            { label: 'Nombre de comités :', type: 'number', reponse: C2 },
            { label: 'Nombre de bureaux :', type: 'number', reponse: A3 }
          ];
        } else {
          var p3 = rng.pick([3, 4, 5]), k = rng.int(1, p3 - 1);
          var exact = comb(g, k) * comb(b, p3 - k), tot = comb(N, p3), sansG = comb(g, p3), auMoins = tot - sansG;
          enonce = 'Une classe de 1ère S d’un lycée de ' + ville + ' compte $' + g + '$ filles et $' + b + '$ garçons. On forme un comité de $' + p3 + '$ élèves. Combien de comités comptent exactement $' + k + '$ fille' + (k > 1 ? 's' : '') + ' ? Combien comptent au moins un garçon ?';
          steps.push('Exactement $' + k + '$ fille' + (k > 1 ? 's' : '') + ' : on choisit $' + k + '$ filles parmi $' + g + '$ ET $' + (p3 - k) + '$ garçon' + (p3 - k > 1 ? 's' : '') + ' parmi $' + b + '$ : $C_{' + g + '}^{' + k + '} \\times C_{' + b + '}^{' + (p3 - k) + '} = ' + T.num(comb(g, k)) + ' \\times ' + T.num(comb(b, p3 - k)) + ' = ' + T.num(exact) + '$.');
          steps.push('Au moins un garçon : on passe par le contraire (aucun garçon, donc que des filles). Total : $C_{' + N + '}^{' + p3 + '} = ' + T.num(tot) + '$ ; sans garçon : $C_{' + g + '}^{' + p3 + '} = ' + T.num(sansG) + '$.');
          steps.push('Donc $' + T.num(tot) + ' - ' + T.num(sansG) + ' = ' + T.num(auMoins) + '$ comités comptent au moins un garçon.');
          questions = [
            { label: 'Exactement $' + k + '$ fille' + (k > 1 ? 's' : '') + ' :', type: 'number', reponse: exact },
            { label: 'Au moins un garçon :', type: 'number', reponse: auMoins }
          ];
        }
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'L’ordre compte-t-il ? Si oui (rôles distincts) : $A_n^p$ ; si non (simple groupe) : $C_n^p$.',
          '« Au moins un » : calcule le total puis retire les cas « aucun ».'
        ],
        solution: steps
      };
    }
  });

  /* -------- Tirages -------- */
  EM.gen.register({
    id: '1s-tirages',
    titre: 'Dénombrer des tirages simultanés ou successifs',
    chapitres: ['1s-denombrement'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var mode = rng.pick(['sim', 'sans', 'avec']);
      var modeT = { sim: 'simultanément', sans: 'successivement et sans remise', avec: 'successivement et avec remise' }[mode];
      var objet = rng.pick([['boules', 'une urne'], ['billes', 'un sac'], ['boules', 'une boîte']]);
      var steps = [], questions, enonce;
      var r = rng.int(3, 7), v = rng.int(3, 7), N = r + v, p = 3;
      function total(n) { return mode === 'sim' ? comb(n, p) : mode === 'sans' ? arr(n, p) : Math.pow(n, p); }
      function totTex(n) {
        return mode === 'sim' ? 'C_{' + n + '}^{' + p + '} = ' + T.num(comb(n, p))
          : mode === 'sans' ? 'A_{' + n + '}^{' + p + '} = ' + prodTex(n, p) + ' = ' + T.num(arr(n, p))
            : n + '^{' + p + '} = ' + T.num(Math.pow(n, p));
      }
      var modele = mode === 'sim' ? 'Un tirage est une partie de 3 ' + objet[0] + ' (sans ordre) : on compte des combinaisons.'
        : mode === 'sans' ? 'Un tirage est une liste ordonnée de 3 ' + objet[0] + ' distinctes : on compte des arrangements.'
          : 'Un tirage est une liste ordonnée de 3 ' + objet[0] + ', avec répétitions possibles : on compte des $3$-listes.';
      if (niveau <= 2) {
        enonce = objet[1].charAt(0).toUpperCase() + objet[1].slice(1) + ' contient $' + r + '$ ' + objet[0] + ' rouges et $' + v + '$ ' + objet[0] + ' vertes, indiscernables au toucher. On tire ' + modeT + ' $3$ ' + objet[0] + '.';
        steps.push(modele);
        steps.push('Nombre de tirages possibles : $' + totTex(N) + '$.');
        questions = [{ label: 'Nombre de tirages possibles :', type: 'number', reponse: total(N) }];
        if (niveau === 2) {
          enonce += ' Combien de tirages sont possibles ? Combien contiennent exactement $2$ ' + objet[0] + ' rouges ?';
          var ex;
          if (mode === 'sim') {
            ex = comb(r, 2) * v;
            steps.push('Exactement 2 rouges : 2 rouges parmi $' + r + '$ et 1 verte parmi $' + v + '$ : $C_{' + r + '}^{2} \\times C_{' + v + '}^{1} = ' + comb(r, 2) + ' \\times ' + v + ' = ' + T.num(ex) + '$.');
          } else if (mode === 'sans') {
            ex = 3 * arr(r, 2) * v;
            steps.push('Exactement 2 rouges : on choisit la place de la verte ($3$ choix), puis les rouges dans l’ordre ($A_{' + r + '}^{2} = ' + arr(r, 2) + '$) et la verte ($' + v + '$ choix) : $3 \\times ' + arr(r, 2) + ' \\times ' + v + ' = ' + T.num(ex) + '$.');
          } else {
            ex = 3 * r * r * v;
            steps.push('Exactement 2 rouges : place de la verte ($3$ choix), puis $' + r + ' \\times ' + r + '$ choix pour les rouges et $' + v + '$ pour la verte : $3 \\times ' + r + '^2 \\times ' + v + ' = ' + T.num(ex) + '$.');
          }
          questions.push({ label: 'Exactement 2 rouges :', type: 'number', reponse: ex });
        } else enonce += ' Combien de tirages différents sont possibles ?';
      } else {
        var bl = rng.int(3, 6), N3 = r + v + bl;
        enonce = objet[1].charAt(0).toUpperCase() + objet[1].slice(1) + ' contient $' + r + '$ ' + objet[0] + ' rouges, $' + v + '$ vertes et $' + bl + '$ blanches. On tire ' + modeT + ' $3$ ' + objet[0] + '. Combien de tirages sont tricolores (une de chaque couleur) ? Combien sont unicolores (les trois de la même couleur) ?';
        steps.push(modele);
        var tri, uni;
        if (mode === 'sim') {
          tri = r * v * bl; uni = comb(r, 3) + comb(v, 3) + comb(bl, 3);
          steps.push('Tricolores : $C_{' + r + '}^{1} \\times C_{' + v + '}^{1} \\times C_{' + bl + '}^{1} = ' + r + ' \\times ' + v + ' \\times ' + bl + ' = ' + T.num(tri) + '$.');
          steps.push('Unicolores : $C_{' + r + '}^{3} + C_{' + v + '}^{3} + C_{' + bl + '}^{3} = ' + comb(r, 3) + ' + ' + comb(v, 3) + ' + ' + comb(bl, 3) + ' = ' + T.num(uni) + '$.');
        } else if (mode === 'sans') {
          tri = 6 * r * v * bl; uni = arr(r, 3) + arr(v, 3) + arr(bl, 3);
          steps.push('Tricolores : $3! = 6$ ordres possibles pour les couleurs, puis $' + r + ' \\times ' + v + ' \\times ' + bl + '$ choix : $6 \\times ' + (r * v * bl) + ' = ' + T.num(tri) + '$.');
          steps.push('Unicolores : $A_{' + r + '}^{3} + A_{' + v + '}^{3} + A_{' + bl + '}^{3} = ' + arr(r, 3) + ' + ' + arr(v, 3) + ' + ' + arr(bl, 3) + ' = ' + T.num(uni) + '$.');
        } else {
          tri = 6 * r * v * bl; uni = r * r * r + v * v * v + bl * bl * bl;
          steps.push('Tricolores : $6$ ordres possibles pour les couleurs, puis $' + r + ' \\times ' + v + ' \\times ' + bl + '$ choix : $' + T.num(tri) + '$.');
          steps.push('Unicolores : $' + r + '^3 + ' + v + '^3 + ' + bl + '^3 = ' + T.num(uni) + '$.');
        }
        steps.push('Pour information, le nombre total de tirages est $' + totTex(N3) + '$.');
        questions = [
          { label: 'Tirages tricolores :', type: 'number', reponse: tri },
          { label: 'Tirages unicolores :', type: 'number', reponse: uni }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Simultané : $C_n^p$ ; successif sans remise : $A_n^p$ ; successif avec remise : $n^p$.',
          'Pour un tirage successif, pense à compter les ordres possibles des couleurs.'
        ],
        solution: steps
      };
    }
  });

  /* -------- Anagrammes et codes -------- */
  EM.gen.register({
    id: '1s-anagrammes',
    titre: 'Anagrammes et codes : permutations et p-listes',
    chapitres: ['1s-denombrement'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      function counts(w) { var c = {}; w.split('').forEach(function (l) { c[l] = (c[l] || 0) + 1; }); return c; }
      function nbAna(w) {
        var c = counts(w), d = 1;
        Object.keys(c).forEach(function (l) { d *= fact(c[l]); });
        return fact(w.length) / d;
      }
      function anaTex(w) {
        var c = counts(w), den = [];
        Object.keys(c).forEach(function (l) { if (c[l] > 1) den.push(c[l] + '!'); });
        return den.length ? '\\dfrac{' + w.length + '!}{' + den.join(' \\times ') + '}' : w.length + '!';
      }
      if (niveau === 1) {
        var W = rng.pick(['THIES', 'LOUGA', 'KOLDA', 'MBOUR', 'TOUBA', 'BAKEL', 'FATICK', 'NDIOUM', 'SALOUM', 'SEDHIOU']);
        var n = W.length, L1 = W.charAt(0), L2 = W.charAt(n - 1);
        enonce = 'On appelle anagramme du mot <b>' + W + '</b> tout mot (ayant un sens ou non) formé avec exactement les mêmes lettres. Combien y a-t-il d’anagrammes de ' + W + ' ? Combien commencent par ' + L1 + ' et finissent par ' + L2 + ' ?';
        steps.push('Les $' + n + '$ lettres de ' + W + ' sont distinctes : une anagramme est une permutation de ces lettres, il y en a $' + n + '! = ' + T.num(fact(n)) + '$.');
        steps.push('Si la première lettre est ' + L1 + ' et la dernière ' + L2 + ', on permute les $' + (n - 2) + '$ lettres restantes : $' + (n - 2) + '! = ' + T.num(fact(n - 2)) + '$ anagrammes.');
        questions = [
          { label: 'Nombre d’anagrammes :', type: 'number', reponse: fact(n) },
          { label: 'Commençant par ' + L1 + ' et finissant par ' + L2 + ' :', type: 'number', reponse: fact(n - 2) }
        ];
      } else if (niveau === 2) {
        var W2 = rng.pick(['DAKAR', 'KAYAR', 'PODOR', 'MATAM', 'KAOLACK', 'SENEGAL', 'KEDOUGOU', 'KAFFRINE', 'RUFISQUE', 'CASAMANCE']);
        var c2 = counts(W2), rep = Object.keys(c2).filter(function (l) { return c2[l] > 1; });
        var X = rng.pick(Object.keys(c2));
        var rest = W2.replace(X, '');
        var tot = nbAna(W2), deb = nbAna(rest);
        enonce = 'Combien d’anagrammes (ayant un sens ou non) peut-on former avec les lettres du mot <b>' + W2 + '</b> ? Combien commencent par la lettre ' + X + ' ?';
        steps.push('Le mot ' + W2 + ' a $' + W2.length + '$ lettres, dont ' + rep.map(function (l) { return 'la lettre ' + l + ' répétée $' + c2[l] + '$ fois'; }).join(', ') + '. Échanger deux lettres identiques ne change pas le mot : on divise $' + W2.length + '!$ par les factorielles des répétitions.');
        steps.push('Nombre d’anagrammes : $' + anaTex(W2) + ' = ' + T.num(tot) + '$.');
        steps.push('En plaçant ' + X + ' en premier, il reste les lettres ' + rest.split('').join(', ') + ' à permuter : $' + anaTex(rest) + ' = ' + T.num(deb) + '$ anagrammes.');
        questions = [
          { label: 'Nombre d’anagrammes :', type: 'number', reponse: tot },
          { label: 'Commençant par ' + X + ' :', type: 'number', reponse: deb }
        ];
      } else {
        var k = rng.pick([3, 4, 4, 5]), nom = rng.pick(PRENOMS);
        var tot3 = Math.pow(10, k), dist = arr(10, k);
        var objet = rng.pick(['le cadenas de son casier au lycée', 'son téléphone portable', 'la porte de sa boutique au marché ' + rng.pick(['Sandaga', 'Tilène', 'HLM', 'Castors', 'Ndiarème'])]);
        enonce = nom + ' choisit un code secret de $' + k + '$ chiffres (de 0 à 9) pour ' + objet + '. Combien de codes sont possibles ? Combien ont tous leurs chiffres distincts ? Combien ont au moins deux chiffres identiques ?';
        steps.push('Un code est une $' + k + '$-liste de l’ensemble des $10$ chiffres (ordre important, répétitions permises) : $10^{' + k + '} = ' + T.num(tot3) + '$ codes.');
        steps.push('Chiffres distincts : arrangements de $' + k + '$ chiffres parmi $10$ : $A_{10}^{' + k + '} = ' + prodTex(10, k) + ' = ' + T.num(dist) + '$.');
        steps.push('« Au moins deux chiffres identiques » est le contraire de « tous distincts » : $' + T.num(tot3) + ' - ' + T.num(dist) + ' = ' + T.num(tot3 - dist) + '$.');
        questions = [
          { label: 'Codes possibles :', type: 'number', reponse: tot3 },
          { label: 'Chiffres tous distincts :', type: 'number', reponse: dist },
          { label: 'Au moins deux chiffres identiques :', type: 'number', reponse: tot3 - dist }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Un mot de $n$ lettres distinctes a $n!$ anagrammes ; si une lettre est répétée $k$ fois, divise par $k!$.',
          'Un code de $k$ chiffres est une $k$-liste : $10^k$ possibilités ; tous distincts : $A_{10}^k$.'
        ],
        solution: steps
      };
    }
  });

  /* ================================================================== */
  /* 9. Statistiques (1ère S2)                                           */
  /* ================================================================== */
  EM.gen.register({
    id: '1s-variance',
    titre: 'Moyenne, variance et écart-type d’une série statistique',
    chapitres: ['1s-statistiques'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions;
      if (niveau <= 2) {
        var ctx, xs, unite = '';
        if (niveau === 1) {
          ctx = rng.pick([
            { t: 'Nombre d’enfants par ménage relevé dans un quartier de Pikine', v: function () { var s = rng.int(0, 2); return [s, s + 1, s + 2, s + 3, s + 4]; } },
            { t: 'Notes sur 20 obtenues à un devoir de mathématiques dans une classe de 1ère S2', v: function () { var s = rng.pick([4, 6, 8]); return [s, s + 2, s + 4, s + 6, s + 8]; } },
            { t: 'Nombre de pirogues débarquées par jour au quai de pêche de Joal', v: function () { var s = rng.pick([15, 20, 25]); return [s, s + 5, s + 10, s + 15, s + 20]; } },
            { t: 'Pointure des chaussures vendues en une journée dans une boutique du marché Sandaga', v: function () { var s = rng.int(37, 39); return [s, s + 1, s + 2, s + 3, s + 4]; } }
          ]);
          xs = ctx.v();
        } else {
          ctx = rng.pick([
            { t: 'Durée (en minutes) du trajet domicile–lycée des élèves d’un lycée de Dakar', a: 0, w: 10, u: 'min' },
            { t: 'Masse (en kg) des sacs d’arachides pesés dans un point de collecte de Kaffrine', a: 40, w: 4, u: 'kg' },
            { t: 'Taille (en cm) des joueurs inscrits dans un club de basket de Thiès', a: 160, w: 5, u: 'cm' }
          ]);
          xs = [0, 1, 2, 3, 4].map(function (i) { return ctx.a + ctx.w * i + ctx.w / 2; });
          unite = ctx.u;
        }
        var N = rng.pick([20, 25, 40, 50]), ns, guard = 0;
        do {
          ns = [];
          var sum = 0;
          for (var i = 0; i < 4; i++) { var ni = rng.int(1, Math.round(N / 3)); ns.push(ni); sum += ni; }
          ns.push(N - sum);
          guard++;
        } while ((ns[4] < 1 || ns[4] > N / 2) && guard < 200);
        if (ns[4] < 1 || ns[4] > N / 2) { var base = Math.floor(N / 5); ns = [base, base, base, base, N - 4 * base]; }
        var Sx = F(0), Sx2 = F(0);
        xs.forEach(function (x, i) { Sx = Sx.add(F(x).mul(ns[i])); Sx2 = Sx2.add(F(x).mul(x).mul(ns[i])); });
        var moy = Sx.div(N), m2 = Sx2.div(N), V = m2.sub(moy.mul(moy)), sig = Math.sqrt(V.value());
        var head = niveau === 1 ? '<tr><th>Valeur $x_i$</th>' + xs.map(function (x) { return '<td>' + T.txt(x) + '</td>'; }).join('') + '</tr>'
          : '<tr><th>Classe</th>' + xs.map(function (x, i) { return '<td>$[' + T.num(ctx.a + ctx.w * i) + ' \\,;\\, ' + T.num(ctx.a + ctx.w * (i + 1)) + '[$</td>'; }).join('') + '</tr>';
        var tab = '<div class="table-wrap"><table class="t">' + head + '<tr><th>Effectif $n_i$</th>' + ns.map(function (n) { return '<td>' + n + '</td>'; }).join('') + '</tr></table></div>';
        enonce = ctx.t + ' :<br>' + tab + 'Calculer la moyenne $\\overline{x}$, la variance $V$ et l’écart-type $\\sigma$ de cette série' + (niveau === 2 ? ' (on utilisera les centres des classes)' : '') + '.';
        if (niveau === 2) steps.push('Les centres des classes sont $' + xs.map(function (x) { return T.num(x); }).join(' \\,;\\, ') + '$.');
        steps.push('$N = ' + N + '$ et $\\sum n_ix_i = ' + xs.map(function (x, i) { return ns[i] + ' \\times ' + T.num(x); }).join(' + ') + ' = ' + T.num(Sx.value()) + '$, donc $\\overline{x} = \\dfrac{' + T.num(Sx.value()) + '}{' + N + '} = ' + T.num(moy.value()) + '$' + (unite ? ' ' + unite : '') + '.');
        steps.push('$\\sum n_ix_i^2 = ' + T.num(Sx2.value()) + '$, donc $\\dfrac{\\sum n_ix_i^2}{N} = ' + T.num(m2.value()) + '$.');
        steps.push('$V = \\dfrac{\\sum n_ix_i^2}{N} - \\overline{x}^2 = ' + T.num(m2.value()) + ' - ' + T.par(moy.value()) + '^2 = ' + T.num(V.value()) + (EM.ar.isInt(V.value() * 100) ? '' : ' \\approx ' + T.num(EM.ar.round(V.value(), 2))) + '$.');
        steps.push('$\\sigma = \\sqrt{V} \\approx ' + T.num(EM.ar.round(sig, 2)) + '$' + (unite ? ' ' + unite : '') + '.');
        questions = [
          { label: '$\\overline{x} =$', type: 'number', reponse: moy.value() },
          { label: '$V \\approx$ (au centième)', type: 'number', reponse: V.value(), tol: 0.01, reponseTex: T.num(EM.ar.round(V.value(), 2)) },
          { label: '$\\sigma \\approx$ (au centième)', type: 'number', reponse: EM.ar.round(sig, 2), tol: 0.01 }
        ];
      } else {
        var c3 = rng.pick([
          { t: 'Les notes d’un devoir dans une classe de Saint-Louis ont pour moyenne $\\overline{x} = MOY$ et pour écart-type $\\sigma_x = SIG$. Le professeur décide de transformer chaque note $x$ en $y = AX + B$.', m: function () { return rng.dec(8, 12, 1); }, s: function () { return rng.dec(1.5, 3.5, 1); }, a: [1.1, 1.2, 0.8], b: [1, 2, -0.5] },
          { t: 'À Matam, les températures maximales (en °C) relevées en un mois ont pour moyenne $\\overline{x} = MOY$ et pour écart-type $\\sigma_x = SIG$. On les convertit en degrés Fahrenheit par $y = AX + B$.', m: function () { return rng.int(32, 40); }, s: function () { return rng.dec(1.5, 3, 1); }, a: [1.8], b: [32] },
          { t: 'Dans une boutique de tissus de Kaolack, les prix (en milliers de F CFA) des pagnes ont pour moyenne $\\overline{x} = MOY$ et pour écart-type $\\sigma_x = SIG$. Le commerçant fixe les nouveaux prix par $y = AX + B$.', m: function () { return rng.dec(4, 9, 1); }, s: function () { return rng.dec(0.5, 2, 1); }, a: [1.1, 1.2, 1.05], b: [0.5, 1, 0.2] }
        ]);
        var mo = c3.m(), si = c3.s(), a = rng.pick(c3.a), b = rng.pick(c3.b);
        var my = EM.ar.round(a * mo + b, 6), sy = EM.ar.round(Math.abs(a) * si, 6), vy = EM.ar.round(sy * sy, 6);
        enonce = c3.t.replace('MOY', T.num(mo)).replace('SIG', T.num(si)).replace('AX', T.num(a) + 'x').replace(' + B', T.signed(b)) + '<br>Calculer la moyenne $\\overline{y}$, l’écart-type $\\sigma_y$ et la variance $V_y$ de la nouvelle série.';
        steps.push('Pour un changement affine $y = ax + b$ : $\\overline{y} = a\\overline{x} + b$, $\\sigma_y = |a|\\,\\sigma_x$ et $V_y = a^2V_x$.');
        steps.push('$\\overline{y} = ' + T.num(a) + ' \\times ' + T.num(mo) + T.signed(b) + ' = ' + T.num(my) + '$.');
        steps.push('$\\sigma_y = ' + T.num(Math.abs(a)) + ' \\times ' + T.num(si) + ' = ' + T.num(sy) + '$ et $V_y = \\sigma_y^2 = ' + T.num(vy) + '$ (la constante $' + T.num(b) + '$ ne change pas la dispersion).');
        questions = [
          { label: '$\\overline{y} =$', type: 'number', reponse: my },
          { label: '$\\sigma_y =$', type: 'number', reponse: sy },
          { label: '$V_y =$', type: 'number', reponse: vy, tol: 0.001 }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          '$\\overline{x} = \\dfrac{\\sum n_ix_i}{N}$ et $V = \\dfrac{\\sum n_ix_i^2}{N} - \\overline{x}^2$, $\\sigma = \\sqrt{V}$.',
          'Si $y = ax + b$ : $\\overline{y} = a\\overline{x} + b$ et $\\sigma_y = |a|\\sigma_x$.'
        ],
        solution: steps,
        aide: 'Utilise la virgule décimale, par exemple 11,3.'
      };
    }
  });

  /* ================================================================== */
  /* 10. Produit scalaire                                                */
  /* ================================================================== */
  var COSREM = [
    { k: F(1, 6), c: F(1, 2), r: 3 }, { k: F(1, 4), c: F(1, 2), r: 2 }, { k: F(1, 3), c: F(1, 2), r: 1 },
    { k: F(1, 2), c: F(0), r: 1 }, { k: F(2, 3), c: F(-1, 2), r: 1 }, { k: F(3, 4), c: F(-1, 2), r: 2 },
    { k: F(5, 6), c: F(-1, 2), r: 3 }, { k: F(1), c: F(-1), r: 1 }
  ];
  function vecTex(v) { return '\\vec{' + v + '}'; }

  EM.gen.register({
    id: '1s-produit-scalaire-calcul',
    titre: 'Calculer un produit scalaire (coordonnées, normes et angle, normes seules)',
    chapitres: ['1s-produit-scalaire'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions, u = vecTex('u'), v = vecTex('v');
      if (niveau === 1) {
        var a = rng.nz(-6, 6), b = rng.int(-6, 6), c = rng.int(-6, 6), d = rng.nz(-6, 6);
        var e = rng.nz(-5, 5), f = rng.nz(-5, 5), g = rng.nz(-5, 5);
        var dot = a * c + b * d, m = F(-e * g, f);
        enonce = 'Dans un repère orthonormé $(O, \\vec{i}, \\vec{j})$, on donne $' + u + '(' + a + ' ; ' + b + ')$, $' + v + '(' + c + ' ; ' + d + ')$, $\\vec{w}(m ; ' + e + ')$ et $\\vec{z}(' + f + ' ; ' + g + ')$. Calculer $' + u + ' \\cdot ' + v + '$, puis déterminer le réel $m$ pour que $\\vec{w}$ et $\\vec{z}$ soient orthogonaux.';
        steps.push('$' + u + ' \\cdot ' + v + ' = xx\' + yy\' = ' + T.par(a) + ' \\times ' + T.par(c) + ' + ' + T.par(b) + ' \\times ' + T.par(d) + ' = ' + dot + '$.');
        steps.push('$\\vec{w} \\perp \\vec{z} \\iff \\vec{w} \\cdot \\vec{z} = 0 \\iff ' + (f === 1 ? '' : f === -1 ? '-' : f) + 'm' + T.signed(e * g) + ' = 0 \\iff m = ' + m.tex() + '$.');
        questions = [
          { label: '$' + u + ' \\cdot ' + v + ' =$', type: 'number', reponse: dot },
          { label: '$m =$', type: 'number', reponse: m }
        ];
      } else if (niveau === 2) {
        var p = rng.int(2, 8), q = rng.intExcept(2, 8, [p]), cr = rng.pick(COSREM);
        var coef = cr.c.mul(p * q);
        var dT = rootTex(coef, cr.r), dS = rootStr(coef, cr.r);
        var cT = cr.r === 1 ? cr.c.tex() : rootTex(cr.c, cr.r);
        enonce = 'On donne deux vecteurs $' + u + '$ et $' + v + '$ tels que $\\|' + u + '\\| = ' + p + '$, $\\|' + v + '\\| = ' + q + '$ et $(' + u + ', ' + v + ') = ' + piTex(cr.k) + '$. Calculer $' + u + ' \\cdot ' + v + '$ et $(' + u + ' + ' + v + ') \\cdot (' + u + ' - ' + v + ')$.';
        steps.push('$' + u + ' \\cdot ' + v + ' = \\|' + u + '\\| \\times \\|' + v + '\\| \\times \\cos(' + u + ', ' + v + ') = ' + p + ' \\times ' + q + ' \\times \\cos' + piTex(cr.k) + ' = ' + (p * q) + ' \\times ' + (cT.charAt(0) === '-' ? '\\left(' + cT + '\\right)' : cT) + ' = ' + dT + '$.');
        steps.push('$(' + u + ' + ' + v + ') \\cdot (' + u + ' - ' + v + ') = \\|' + u + '\\|^2 - \\|' + v + '\\|^2 = ' + (p * p) + ' - ' + (q * q) + ' = ' + (p * p - q * q) + '$ (les termes $' + u + ' \\cdot ' + v + '$ s’éliminent).');
        questions = [
          { label: '$' + u + ' \\cdot ' + v + ' =$', type: 'number', reponse: dS, reponseTex: dT },
          { label: '$(' + u + ' + ' + v + ') \\cdot (' + u + ' - ' + v + ') =$', type: 'number', reponse: p * p - q * q }
        ];
      } else {
        var p3 = rng.int(2, 7), q3 = rng.int(2, 7), s = rng.int(Math.abs(p3 - q3) + 1, p3 + q3 - 1);
        var dot3 = F(s * s - p3 * p3 - q3 * q3, 2), K = 2 * p3 * p3 + 2 * q3 * q3 - s * s;
        var sq = sqrtSimp(K);
        enonce = 'On donne deux vecteurs $' + u + '$ et $' + v + '$ tels que $\\|' + u + '\\| = ' + p3 + '$, $\\|' + v + '\\| = ' + q3 + '$ et $\\|' + u + ' + ' + v + '\\| = ' + s + '$. Calculer $' + u + ' \\cdot ' + v + '$ puis $\\|' + u + ' - ' + v + '\\|$.';
        steps.push('$\\|' + u + ' + ' + v + '\\|^2 = \\|' + u + '\\|^2 + 2\\,' + u + ' \\cdot ' + v + ' + \\|' + v + '\\|^2$, donc $' + u + ' \\cdot ' + v + ' = \\dfrac{' + (s * s) + ' - ' + (p3 * p3) + ' - ' + (q3 * q3) + '}{2} = ' + dot3.tex() + '$.');
        steps.push('$\\|' + u + ' - ' + v + '\\|^2 = \\|' + u + '\\|^2 - 2\\,' + u + ' \\cdot ' + v + ' + \\|' + v + '\\|^2 = ' + (p3 * p3) + ' - ' + T.par(dot3.mul(2)) + ' + ' + (q3 * q3) + ' = ' + K + '$.');
        steps.push('Donc $\\|' + u + ' - ' + v + '\\| = \\sqrt{' + K + '}' + (sq.r === K ? '' : ' = ' + rootTex(sq.c, sq.r)) + '$.');
        questions = [
          { label: '$' + u + ' \\cdot ' + v + ' =$', type: 'number', reponse: dot3 },
          { label: '$\\|' + u + ' - ' + v + '\\| =$', type: 'number', reponse: rootStr(sq.c, sq.r), reponseTex: rootTex(sq.c, sq.r) }
        ];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Coordonnées en repère orthonormé : $xx\' + yy\'$ ; normes et angle : $\\|\\vec{u}\\|\\|\\vec{v}\\|\\cos(\\vec{u}, \\vec{v})$.',
          'Avec les normes seules : développe $\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + 2\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$.'
        ],
        solution: steps,
        aide: 'Tu peux écrire 6√2 ou 6*sqrt(2), une fraction comme -7/2.'
      };
    }
  });

  /* -------- Al-Kashi et théorème de la médiane -------- */
  EM.gen.register({
    id: '1s-al-kashi-mediane',
    titre: 'Théorème d’Al-Kashi et théorème de la médiane',
    chapitres: ['1s-produit-scalaire'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], enonce, questions, a, b, c, cosA;
      if (niveau === 1) {
        b = rng.int(2, 9); c = rng.intExcept(2, 9, [b]);
        var obt = rng.bool();
        cosA = F(obt ? -1 : 1, 2);
        var BC2 = b * b + c * c + (obt ? b * c : -b * c);
        var sq = sqrtSimp(BC2);
        a = Math.sqrt(BC2);
        var angT = obt ? '\\dfrac{2\\pi}{3}' : '\\dfrac{\\pi}{3}';
        var dotA = F(b * c).mul(cosA);
        enonce = 'Dans un triangle $ABC$, $AB = ' + c + '$, $AC = ' + b + '$ et $\\widehat{BAC} = ' + angT + '$ rad. Calculer $\\vect{AB} \\cdot \\vect{AC}$ et la longueur $BC$.';
        steps.push('$\\vect{AB} \\cdot \\vect{AC} = AB \\times AC \\times \\cos\\widehat{BAC} = ' + c + ' \\times ' + b + ' \\times ' + T.par(cosA) + ' = ' + dotA.tex() + '$.');
        steps.push('Al-Kashi : $BC^2 = AB^2 + AC^2 - 2\\,\\vect{AB} \\cdot \\vect{AC} = ' + (c * c) + ' + ' + (b * b) + ' - 2 \\times ' + T.par(dotA) + ' = ' + BC2 + '$.');
        steps.push('Donc $BC = \\sqrt{' + BC2 + '}' + (sq.r === BC2 ? '' : ' = ' + rootTex(sq.c, sq.r)) + (sq.r === 1 ? '' : ' \\approx ' + T.num(EM.ar.round(a, 2))) + '$.');
        questions = [
          { label: '$\\vect{AB} \\cdot \\vect{AC} =$', type: 'number', reponse: dotA },
          { label: '$BC =$', type: 'number', reponse: rootStr(sq.c, sq.r), reponseTex: rootTex(sq.c, sq.r) }
        ];
      } else {
        var guard = 0;
        do { a = rng.int(3, 10); b = rng.int(3, 10); c = rng.int(3, 10); guard++; }
        while ((a >= b + c || b >= a + c || c >= a + b || (b * b + c * c - a * a) === 0) && guard < 100);
        if (a >= b + c || b >= a + c || c >= a + b || b * b + c * c - a * a === 0) { a = 7; b = 5; c = 6; }
        cosA = F(b * b + c * c - a * a, 2 * b * c);
        var dot = F(b * b + c * c - a * a, 2);
        if (niveau === 2) {
          enonce = 'Dans un triangle $ABC$, $BC = ' + a + '$, $AC = ' + b + '$ et $AB = ' + c + '$. Calculer $\\cos\\widehat{BAC}$ puis $\\vect{AB} \\cdot \\vect{AC}$.';
          steps.push('Al-Kashi : $BC^2 = AB^2 + AC^2 - 2\\,AB \\times AC \\times \\cos\\widehat{BAC}$, donc $\\cos\\widehat{BAC} = \\dfrac{AB^2 + AC^2 - BC^2}{2\\,AB \\times AC} = \\dfrac{' + (c * c) + ' + ' + (b * b) + ' - ' + (a * a) + '}{2 \\times ' + c + ' \\times ' + b + '} = ' + cosA.tex() + '$.');
          steps.push('$\\vect{AB} \\cdot \\vect{AC} = AB \\times AC \\times \\cos\\widehat{BAC} = ' + c + ' \\times ' + b + ' \\times ' + T.par(cosA) + ' = ' + dot.tex() + '$.');
          steps.push('L’angle $\\widehat{BAC}$ est ' + (cosA.sign() > 0 ? 'aigu' : 'obtus') + ' car son cosinus est ' + (cosA.sign() > 0 ? 'positif' : 'négatif') + ' ($\\widehat{BAC} \\approx ' + T.num(EM.ar.round(Math.acos(cosA.value()) * 180 / Math.PI, 1)) + '^\\circ$).');
          questions = [
            { label: '$\\cos\\widehat{BAC} =$', type: 'number', reponse: cosA },
            { label: '$\\vect{AB} \\cdot \\vect{AC} =$', type: 'number', reponse: dot }
          ];
        } else {
          var K = 2 * b * b + 2 * c * c - a * a, sqK = sqrtSimp(F(K, 4));
          enonce = 'Dans un triangle $ABC$, $BC = ' + a + '$, $AC = ' + b + '$ et $AB = ' + c + '$. On note $I$ le milieu de $[BC]$. Calculer la longueur de la médiane $AI$, puis $\\vect{AB} \\cdot \\vect{AC}$.';
          steps.push('Théorème de la médiane : $AB^2 + AC^2 = 2AI^2 + \\dfrac{BC^2}{2}$, donc $' + (c * c) + ' + ' + (b * b) + ' = 2AI^2 + \\dfrac{' + (a * a) + '}{2}$.');
          steps.push('$AI^2 = \\dfrac{2AB^2 + 2AC^2 - BC^2}{4} = \\dfrac{' + K + '}{4}$, d’où $AI = \\dfrac{\\sqrt{' + K + '}}{2}' + (sqK.c.equals(F(1, 2)) && sqK.r === K ? '' : ' = ' + rootTex(sqK.c, sqK.r)) + '$.');
          steps.push('$\\vect{AB} \\cdot \\vect{AC} = (\\vect{AI} + \\vect{IB}) \\cdot (\\vect{AI} + \\vect{IC}) = AI^2 - IB^2 = \\dfrac{' + K + '}{4} - \\dfrac{' + (a * a) + '}{4} = ' + dot.tex() + '$ (car $\\vect{IC} = -\\vect{IB}$).');
          questions = [
            { label: '$AI =$', type: 'number', reponse: rootStr(sqK.c, sqK.r), reponseTex: rootTex(sqK.c, sqK.r) },
            { label: '$\\vect{AB} \\cdot \\vect{AC} =$', type: 'number', reponse: dot }
          ];
        }
      }
      // figure : A à l'origine, B sur l'axe, C selon l'angle A
      var ang = Math.acos(cosA.value());
      var pA = [0, 0], pB = [c, 0], pC = [b * Math.cos(ang), b * Math.sin(ang)];
      var fg = EM.fig.fit([pA, pB, pC], { w: 280, h: 200 });
      fg.poly([pA, pB, pC]).point(pA, 'A', 'so').point(pB, 'B', 'se').point(pC, 'C', 'n');
      if (niveau === 3) { var pI = [(pB[0] + pC[0]) / 2, (pB[1] + pC[1]) / 2]; fg.seg(pA, pI, { accent: true }).point(pI, 'I', 'ne'); }
      return {
        enonce: enonce,
        figure: fg.svg(),
        questions: questions,
        indices: [
          'Al-Kashi : $BC^2 = AB^2 + AC^2 - 2\\,AB \\times AC \\times \\cos\\widehat{A}$.',
          'Médiane : $AB^2 + AC^2 = 2AI^2 + \\dfrac{BC^2}{2}$, avec $I$ milieu de $[BC]$.'
        ],
        solution: steps,
        aide: 'Tu peux écrire √39, sqrt(39)/2 ou une fraction comme 5/8.'
      };
    }
  });

  /* -------- Équation de cercle -------- */
  EM.gen.register({
    id: '1s-cercle-equation',
    titre: 'Reconnaître un cercle à partir de son équation',
    chapitres: ['1s-produit-scalaire'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.int(-5, 5), b = rng.int(-5, 5), steps = [], questions = [];
      var nat = niveau === 1 ? 'cercle' : rng.pick(['cercle', 'cercle', 'cercle', 'point', 'vide']);
      var k; // a² + b² - c
      if (nat === 'cercle') k = niveau === 1 ? Math.pow(rng.int(1, 6), 2) : rng.pick([Math.pow(rng.int(1, 6), 2), rng.pick([2, 3, 5, 6, 7, 8, 10, 12, 13, 18, 20])]);
      else if (nat === 'point') k = 0;
      else k = -rng.int(1, 9);
      var c = a * a + b * b - k;
      var eq = 'x^2 + y^2' + T.mono(-2 * a, 'x') + T.mono(-2 * b, 'y') + (c ? T.signed(c) : '') + ' = 0';
      var xa = a ? T.xMinus(a, 'x') + '^2' : 'x^2', yb = b ? T.xMinus(b, 'y') + '^2' : 'y^2';
      steps.push('On fait apparaître des carrés : ' + (a ? '$x^2' + T.mono(-2 * a, 'x') + ' = ' + xa + ' - ' + (a * a) + '$' : '') + (a && b ? ' et ' : '') + (b ? '$y^2' + T.mono(-2 * b, 'y') + ' = ' + yb + ' - ' + (b * b) + '$' : '') + (a || b ? '.' : 'les termes $x^2$ et $y^2$ sont déjà des carrés.'));
      steps.push('L’équation s’écrit $' + xa + ' + ' + yb + ' = ' + (a * a) + ' + ' + (b * b) + (c ? ' - ' + T.par(c) : '') + ' = ' + k + '$.');
      var sq = k > 0 ? sqrtSimp(k) : null;
      if (nat === 'cercle') steps.push('$' + k + ' > 0$ : c’est le cercle de centre $\\Omega(' + a + ' ; ' + b + ')$ et de rayon $r = \\sqrt{' + k + '}' + (sq.r === k ? '' : ' = ' + rootTex(sq.c, sq.r)) + '$.');
      else if (nat === 'point') steps.push('Une somme de deux carrés est nulle si et seulement si les deux carrés sont nuls : l’ensemble est réduit au point $\\Omega(' + a + ' ; ' + b + ')$.');
      else steps.push('Une somme de carrés ne peut pas être égale à $' + k + ' < 0$ : l’ensemble est vide.');
      var natT = { cercle: 'un cercle', point: 'un point', vide: 'l’ensemble vide' };
      if (niveau === 2) {
        var sh = rng.shuffle(['un cercle', 'un point', 'l’ensemble vide']);
        questions.push({ label: 'L’ensemble des points $M(x ; y)$ est :', type: 'choice', choix: sh, reponse: sh.indexOf(natT[nat]) });
      }
      if (nat !== 'vide') questions.push({ label: nat === 'cercle' ? 'Centre $\\Omega$' : 'Point $\\Omega$', type: 'tuple', reponse: [a, b] });
      if (nat === 'cercle') questions.push({ label: 'Rayon $r =$', type: 'number', reponse: rootStr(sq.c, sq.r), reponseTex: rootTex(sq.c, sq.r) });
      return {
        enonce: 'Dans un repère orthonormé, déterminer l’ensemble des points $M(x ; y)$ tels que : $$' + eq + '$$' + (niveau === 1 ? 'Préciser son centre et son rayon.' : 'Préciser sa nature et ses éléments caractéristiques.'),
        questions: questions,
        indices: [
          'Utilise $x^2 - 2ax = (x - a)^2 - a^2$ pour faire apparaître des carrés.',
          'Compare la constante obtenue à droite avec $0$ : cercle si elle est positive, point si elle est nulle, ensemble vide sinon.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b) ; un rayon comme 3 ou √5.'
      };
    }
  });

  /* ================================================================== */
  /* 11. Barycentre et lignes de niveau                                  */
  /* ================================================================== */
  EM.gen.register({
    id: '1s-barycentre-coordonnees',
    titre: 'Coordonnées du barycentre de trois points pondérés',
    chapitres: ['1s-barycentre'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var pts, w, guard = 0;
      do {
        pts = [[rng.int(-4, 5), rng.int(-4, 5)], [rng.int(-4, 5), rng.int(-4, 5)], [rng.int(-4, 5), rng.int(-4, 5)]];
        w = niveau === 1 ? [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)] : [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)].map(function (x, i, arr2) { return i === 1 ? -x : x; });
        if (niveau >= 2) w = rng.shuffle(w);
        guard++;
        var area = (pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[1][1] - pts[0][1]) * (pts[2][0] - pts[0][0]);
      } while ((area === 0 || w[0] + w[1] + w[2] === 0) && guard < 100);
      var s = w[0] + w[1] + w[2], N = ['A', 'B', 'C'];
      var Gx = F(w[0] * pts[0][0] + w[1] * pts[1][0] + w[2] * pts[2][0], s), Gy = F(w[0] * pts[0][1] + w[1] * pts[1][1] + w[2] * pts[2][1], s);
      var ptT = function (i) { return N[i] + '(' + pts[i][0] + ' ; ' + pts[i][1] + ')'; };
      var bar = 'G = \\operatorname{bar}\\{(A ; ' + w[0] + '), (B ; ' + w[1] + '), (C ; ' + w[2] + ')\\}';
      var steps = [], questions, enonce;
      function sumTex(j) { return w.map(function (wi, i) { return (i === 0 ? '' : (wi < 0 ? ' - ' : ' + ')) + (i === 0 && wi < 0 ? '-' : '') + Math.abs(wi) + ' \\times ' + T.par(pts[i][j]); }).join(''); }
      var fg = null;
      if (niveau < 3) {
        enonce = 'Dans un repère orthonormé, on donne les points $' + ptT(0) + '$, $' + ptT(1) + '$ et $' + ptT(2) + '$. Déterminer les coordonnées du point $' + bar + '$.';
        steps.push('La somme des coefficients vaut $' + w.join(' + ').replace(/\+ -/g, '- ') + ' = ' + s + ' \\neq 0$ : le barycentre existe.');
        steps.push('$x_G = \\dfrac{' + sumTex(0) + '}{' + s + '} = ' + Gx.tex() + '$ et $y_G = \\dfrac{' + sumTex(1) + '}{' + s + '} = ' + Gy.tex() + '$.');
        steps.push('Donc $G\\left(' + Gx.tex() + ' \\,;\\, ' + Gy.tex() + '\\right)$.');
        questions = [{ label: '$G$', type: 'tuple', reponse: [Gx, Gy] }];
        var f1 = EM.fig.fit([[0, 0]].concat(pts), { w: 260, h: 220 });
        f1.axes({ step: 1, labels: false });
        f1.poly(pts, { light: true });
        pts.forEach(function (p, i) { f1.point(p, N[i], 'ne'); });
        fg = f1.svg();
      } else {
        enonce = 'Dans un repère orthonormé, on donne $' + ptT(0) + '$, $' + ptT(1) + '$ et le point $G\\left(' + Gx.tex() + ' \\,;\\, ' + Gy.tex() + '\\right)$. Déterminer les coordonnées du point $C$ tel que $' + bar + '$.';
        steps.push('$' + T.mono(s, 'x_G', true) + ' = ' + T.mono(w[0], 'x_A', true) + T.mono(w[1], 'x_B') + T.mono(w[2], 'x_C') + '$, donc $' + T.mono(w[2], 'x_C', true) + ' = ' + T.num(Gx.mul(s)) + ' - ' + T.par(w[0] * pts[0][0]) + ' - ' + T.par(w[1] * pts[1][0]) + ' = ' + (w[2] * pts[2][0]) + '$' + (w[2] === 1 ? '' : ', donc $x_C = ' + pts[2][0] + '$') + '.');
        steps.push('De même $' + T.mono(w[2], 'y_C', true) + ' = ' + T.num(Gy.mul(s)) + ' - ' + T.par(w[0] * pts[0][1]) + ' - ' + T.par(w[1] * pts[1][1]) + ' = ' + (w[2] * pts[2][1]) + '$' + (w[2] === 1 ? '' : ', donc $y_C = ' + pts[2][1] + '$') + '.');
        steps.push('Donc $C(' + pts[2][0] + ' ; ' + pts[2][1] + ')$.');
        questions = [{ label: '$C$', type: 'tuple', reponse: [pts[2][0], pts[2][1]] }];
      }
      return {
        enonce: enonce,
        figure: fg || undefined,
        questions: questions,
        indices: [
          '$x_G = \\dfrac{\\alpha x_A + \\beta x_B + \\gamma x_C}{\\alpha + \\beta + \\gamma}$, et de même pour $y_G$.',
          'Vérifie d’abord que la somme des coefficients n’est pas nulle.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b), par exemple (3/4 ; -2).'
      };
    }
  });

  EM.gen.register({
    id: '1s-lignes-niveau',
    titre: 'Déterminer une ligne de niveau',
    chapitres: ['1s-barycentre'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var N_CI = 'un cercle de centre $I$', N_CG = 'un cercle de centre $G$', N_DP = 'une droite perpendiculaire à $(AB)$',
        N_PI = 'le point $I$ seulement', N_V = 'l’ensemble vide', N_MED = 'la médiatrice de $[AB]$';
      var type = niveau === 1 ? rng.pick([1, 2]) : niveau === 2 ? rng.pick([3, 4]) : 5;
      var steps = [], questions = [], enonce, nat, d;
      var Itxt = '$I$ désigne le milieu de $[AB]$. ';
      if (type === 1 || type === 4) {
        d = rng.pick([2, 4, 6, 8]);
        var out = niveau === 1 ? rng.pick(['c', 'c', 'c', 'c', 'p', 'v']) : rng.pick(['c', 'c', 'c', 'p', 'v']);
        var r = rng.int(1, 6), k, MI2;
        if (type === 1) {
          k = out === 'c' ? d * d / 2 + 2 * r * r : out === 'p' ? d * d / 2 : d * d / 2 - rng.int(1, d * d / 2 - 1);
          MI2 = F(k - d * d / 2, 2);
          enonce = 'Soient $A$ et $B$ deux points tels que $AB = ' + d + '$ ; ' + Itxt + 'Déterminer l’ensemble $(\\Gamma)$ des points $M$ du plan tels que $MA^2 + MB^2 = ' + k + '$.';
          steps.push('$MA^2 = (\\vect{MI} + \\vect{IA})^2 = MI^2 + 2\\vect{MI} \\cdot \\vect{IA} + IA^2$ et $MB^2 = MI^2 + 2\\vect{MI} \\cdot \\vect{IB} + IB^2$. Comme $\\vect{IA} + \\vect{IB} = \\vec{0}$ : $MA^2 + MB^2 = 2MI^2 + \\dfrac{AB^2}{2} = 2MI^2 + ' + (d * d / 2) + '$.');
          steps.push('$MA^2 + MB^2 = ' + k + ' \\iff 2MI^2 = ' + (k - d * d / 2) + ' \\iff MI^2 = ' + MI2.tex() + '$.');
        } else {
          k = out === 'c' ? r * r - d * d / 4 : out === 'p' ? -d * d / 4 : -d * d / 4 - rng.int(1, 6);
          MI2 = F(k + d * d / 4);
          enonce = 'Soient $A$ et $B$ deux points tels que $AB = ' + d + '$ ; ' + Itxt + 'Déterminer l’ensemble $(\\Gamma)$ des points $M$ du plan tels que $\\vect{MA} \\cdot \\vect{MB} = ' + k + '$.';
          steps.push('$\\vect{MA} \\cdot \\vect{MB} = (\\vect{MI} + \\vect{IA}) \\cdot (\\vect{MI} - \\vect{IA}) = MI^2 - IA^2 = MI^2 - \\dfrac{AB^2}{4} = MI^2 - ' + (d * d / 4) + '$ (car $\\vect{IB} = -\\vect{IA}$).');
          steps.push('$\\vect{MA} \\cdot \\vect{MB} = ' + k + ' \\iff MI^2 = ' + k + ' + ' + (d * d / 4) + ' = ' + MI2.tex() + '$.');
        }
        if (out === 'c') { nat = N_CI; steps.push('$MI = ' + r + '$ : $(\\Gamma)$ est le cercle de centre $I$ et de rayon $' + r + '$' + (type === 4 && k === 0 ? ' (c’est le cercle de diamètre $[AB]$).' : '.')); }
        else if (out === 'p') { nat = N_PI; steps.push('$MI = 0$ : $(\\Gamma)$ est réduit au point $I$.'); }
        else { nat = N_V; steps.push('Un carré ne peut pas être négatif : $(\\Gamma)$ est l’ensemble vide.'); }
        questions.push(qcm(rng, 'Nature de $(\\Gamma)$ :', nat, [N_CI, N_DP, N_PI, N_V, N_MED]));
        if (out === 'c') questions.push({ label: 'Rayon :', type: 'number', reponse: r });
      } else if (type === 2) {
        d = rng.int(2, 6);
        var t = rng.nz(-5, 5), k2 = d * t;
        enonce = 'Soient $A$ et $B$ deux points tels que $AB = ' + d + '$. Déterminer l’ensemble $(\\Gamma)$ des points $M$ tels que $\\vect{AB} \\cdot \\vect{AM} = ' + k2 + '$, et la distance $AH$, où $H$ est le point d’intersection de $(\\Gamma)$ et de $(AB)$.';
        steps.push('Soit $H$ le projeté orthogonal de $M$ sur $(AB)$ : $\\vect{AB} \\cdot \\vect{AM} = \\vect{AB} \\cdot \\vect{AH}$.');
        steps.push('$\\vect{AB} \\cdot \\vect{AH} = ' + k2 + (k2 > 0 ? ' > 0' : ' < 0') + '$ : $\\vect{AH}$ est de ' + (k2 > 0 ? 'même sens que' : 'sens contraire à') + ' $\\vect{AB}$ et $AB \\times AH = ' + Math.abs(k2) + '$, donc $AH = \\dfrac{' + Math.abs(k2) + '}{' + d + '} = ' + Math.abs(t) + '$.');
        steps.push('Le point $H$ est fixe ; $M \\in (\\Gamma)$ si et seulement si son projeté sur $(AB)$ est $H$ : $(\\Gamma)$ est la droite perpendiculaire à $(AB)$ passant par $H$, où $H$ est situé sur ' + (k2 > 0 ? 'la demi-droite $[AB)$.' : 'la demi-droite opposée à $[AB)$.'));
        nat = N_DP;
        questions.push(qcm(rng, 'Nature de $(\\Gamma)$ :', nat, [N_CI, N_DP, N_PI, N_V, N_MED]));
        questions.push({ label: '$AH =$', type: 'number', reponse: Math.abs(t) });
      } else if (type === 3) {
        d = rng.int(2, 6);
        var t3 = rng.nz(-4, 4), k3 = 2 * d * t3;
        enonce = 'Soient $A$ et $B$ deux points tels que $AB = ' + d + '$ ; ' + Itxt + 'Déterminer l’ensemble $(\\Gamma)$ des points $M$ tels que $MA^2 - MB^2 = ' + k3 + '$, et la distance $IH$, où $H$ est le point d’intersection de $(\\Gamma)$ et de $(AB)$.';
        steps.push('$MA^2 - MB^2 = (\\vect{MA} - \\vect{MB}) \\cdot (\\vect{MA} + \\vect{MB}) = \\vect{BA} \\cdot 2\\vect{MI} = 2\\,\\vect{IM} \\cdot \\vect{AB}$.');
        steps.push('$MA^2 - MB^2 = ' + k3 + ' \\iff \\vect{AB} \\cdot \\vect{IM} = ' + (k3 / 2) + '$. Avec $H$ projeté orthogonal de $M$ sur $(AB)$ : $\\vect{AB} \\cdot \\vect{IH} = ' + (k3 / 2) + '$, donc $IH = \\dfrac{' + Math.abs(k3 / 2) + '}{' + d + '} = ' + Math.abs(t3) + '$, $H$ étant du côté de ' + (k3 > 0 ? '$B$' : '$A$') + ' par rapport à $I$.');
        steps.push('$(\\Gamma)$ est la droite perpendiculaire à $(AB)$ passant par $H$.');
        nat = N_DP;
        questions.push(qcm(rng, 'Nature de $(\\Gamma)$ :', nat, [N_CI, N_DP, N_PI, N_V, N_MED]));
        questions.push({ label: '$IH =$', type: 'number', reponse: Math.abs(t3) });
      } else {
        var tt = rng.pick([1, 2]), d5 = 3 * tt, r5 = rng.int(1, 5), k5 = 3 * r5 * r5 + 6 * tt * tt;
        var wA = rng.pick([1, 2]), wB = 3 - wA;
        var GA = wB * tt, GB = wA * tt;
        enonce = 'Soient $A$ et $B$ deux points tels que $AB = ' + d5 + '$, et $G = \\operatorname{bar}\\{(A ; ' + wA + '), (B ; ' + wB + ')\\}$. Déterminer l’ensemble $(\\Gamma)$ des points $M$ tels que $' + (wA === 1 ? '' : wA) + 'MA^2 + ' + (wB === 1 ? '' : wB) + 'MB^2 = ' + k5 + '$.';
        steps.push('$\\vect{AG} = \\dfrac{' + wB + '}{3}\\vect{AB}$, donc $GA = ' + GA + '$ et $GB = ' + d5 + ' - ' + GA + ' = ' + GB + '$.');
        steps.push('Réduction : $' + (wA === 1 ? '' : wA) + 'MA^2 + ' + (wB === 1 ? '' : wB) + 'MB^2 = 3MG^2 + ' + (wA === 1 ? '' : wA) + 'GA^2 + ' + (wB === 1 ? '' : wB) + 'GB^2 = 3MG^2 + ' + (wA * GA * GA + wB * GB * GB) + '$ (car $' + (wA === 1 ? '' : wA) + '\\vect{GA} + ' + (wB === 1 ? '' : wB) + '\\vect{GB} = \\vec{0}$).');
        steps.push('$3MG^2 + ' + (6 * tt * tt) + ' = ' + k5 + ' \\iff MG^2 = ' + (r5 * r5) + ' \\iff MG = ' + r5 + '$ : $(\\Gamma)$ est le cercle de centre $G$ et de rayon $' + r5 + '$.');
        nat = N_CG;
        questions.push(qcm(rng, 'Nature de $(\\Gamma)$ :', nat, [N_CI, N_DP, N_V, N_MED]));
        questions.push({ label: 'Rayon :', type: 'number', reponse: r5 });
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Introduis le milieu $I$ (ou le barycentre $G$) et développe avec la relation de Chasles.',
          'Si tu obtiens $MI^2 = c$ (ou $MG^2 = c$) : cercle si $c > 0$, point si $c = 0$, ensemble vide si $c < 0$. Si tu obtiens un produit scalaire constant avec $\\vect{AB}$ : droite perpendiculaire à $(AB)$.'
        ],
        solution: steps
      };
    }
  });

  /* ================================================================== */
  /* 12. Angles orientés et rotations                                    */
  /* ================================================================== */
  EM.gen.register({
    id: '1s-mesure-principale',
    titre: 'Mesure principale d’un angle orienté, relation de Chasles',
    chapitres: ['1s-angles-orientes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], questions = [], enonce, u = vecTex('u'), v = vecTex('v'), w = vecTex('w');
      function q(label, k) { var pk = principal(k); return { label: label, type: 'number', reponse: piStr(pk), reponseTex: piTex(pk) }; }
      function reduc(k) {
        var pk = principal(k), m = k.sub(pk).div(2).value();
        return piTex(k) + ' = ' + piTex(pk) + (m > 0 ? ' + ' : ' - ') + (Math.abs(2 * m)) + '\\pi = ' + piTex(pk) + (m > 0 ? ' + ' : ' - ') + (Math.abs(m) === 1 ? '' : Math.abs(m) + ' \\times ') + '2\\pi';
      }
      if (niveau === 1) {
        var den = rng.pick([2, 3, 4, 6]), p, guard = 0;
        do { p = rng.int(2 * den + 1, 12 * den) * rng.sign(); guard++; } while (EM.ar.gcd(p, den) !== 1 && guard < 100);
        var k = F(p, den), pk = principal(k);
        enonce = 'Déterminer la mesure principale de l’angle orienté de mesure $' + piTex(k) + '$.';
        steps.push('On cherche le multiple de $2\\pi$ à retrancher pour tomber dans $]-\\pi \\,;\\, \\pi]$ : $' + reduc(k) + '$.');
        steps.push('$' + piTex(pk) + ' \\in \\,]-\\pi \\,;\\, \\pi]$ : c’est la mesure principale.');
        questions.push(q('Mesure principale :', k));
      } else if (niveau === 2) {
        var a = F(rng.nz(-11, 12), 12), b = F(rng.nz(-11, 12), 12);
        var g = 0;
        while (a.add(b).equals(0) && g++ < 20) b = F(rng.nz(-11, 12), 12);
        var s = a.add(b), ps = principal(s), pws = principal(s.neg());
        enonce = 'On donne $(' + u + ', ' + v + ') = ' + piTex(a) + '$ et $(' + v + ', ' + w + ') = ' + piTex(b) + '$ (à $2\\pi$ près). Déterminer les mesures principales de $(' + u + ', ' + w + ')$ et de $(' + w + ', ' + u + ')$.';
        steps.push('Relation de Chasles : $(' + u + ', ' + w + ') = (' + u + ', ' + v + ') + (' + v + ', ' + w + ') = ' + piTex(a) + ' + ' + (b.sign() < 0 ? '\\left(' + piTex(b) + '\\right)' : piTex(b)) + ' = ' + piTex(s) + '$ $[2\\pi]$.');
        if (!s.equals(ps)) steps.push('$' + reduc(s) + '$, donc la mesure principale de $(' + u + ', ' + w + ')$ est $' + piTex(ps) + '$.');
        else steps.push('$' + piTex(s) + ' \\in \\,]-\\pi \\,;\\, \\pi]$ : c’est la mesure principale de $(' + u + ', ' + w + ')$.');
        steps.push('$(' + w + ', ' + u + ') = -(' + u + ', ' + w + ')$, de mesure principale $' + piTex(pws) + '$' + (ps.equals(1) ? ' (car $-\\pi \\notin \\,]-\\pi \\,;\\, \\pi]$, on prend $\\pi$)' : '') + '.');
        questions.push(q('$(' + u + ', ' + w + ')$ :', s), q('$(' + w + ', ' + u + ')$ :', s.neg()));
      } else {
        var al = F(rng.nz(-11, 12), 12);
        var LIST = [
          { t: '(-' + u + ', ' + v + ')', k: al.add(1), why: '(-' + u + ', ' + v + ') = (' + u + ', ' + v + ') + \\pi' },
          { t: '(' + u + ', -' + v + ')', k: al.add(1), why: '(' + u + ', -' + v + ') = (' + u + ', ' + v + ') + \\pi' },
          { t: '(-' + u + ', -' + v + ')', k: al, why: '(-' + u + ', -' + v + ') = (' + u + ', ' + v + ')' },
          { t: '(' + v + ', -' + u + ')', k: al.neg().add(1), why: '(' + v + ', -' + u + ') = -(' + u + ', ' + v + ') + \\pi' },
          { t: '(2' + u + ', -3' + v + ')', k: al.add(1), why: '(2' + u + ', -3' + v + ') = (' + u + ', ' + v + ') + \\pi \\text{ (coefficients de signes contraires)}' },
          { t: '(-' + v + ', ' + u + ')', k: al.neg().add(1), why: '(-' + v + ', ' + u + ') = (' + v + ', ' + u + ') + \\pi = -(' + u + ', ' + v + ') + \\pi' }
        ];
        var two = rng.sample(LIST, 2);
        enonce = 'On donne $(' + u + ', ' + v + ') = ' + piTex(al) + '$ (à $2\\pi$ près). Déterminer les mesures principales de $' + two[0].t + '$ et de $' + two[1].t + '$.';
        two.forEach(function (it) {
          var pk = principal(it.k);
          steps.push('$' + it.why + '$, donc $' + it.t + ' = ' + piTex(it.k) + '$ $[2\\pi]$, de mesure principale $' + piTex(pk) + '$.');
          questions.push(q('$' + it.t + '$ :', it.k));
        });
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'La mesure principale appartient à $]-\\pi \\,;\\, \\pi]$ : retranche (ou ajoute) un multiple de $2\\pi$.',
          'Chasles : $(\\vec{u}, \\vec{v}) + (\\vec{v}, \\vec{w}) = (\\vec{u}, \\vec{w})$ ; changer un vecteur en son opposé ajoute $\\pi$.'
        ],
        solution: steps,
        aide: 'Écris par exemple 5pi/6, -pi/4 ou 5π/6.'
      };
    }
  });

  /** P + Q√3 avec P, Q multiples de 1/2 */
  function r3Tex(P, Q) {
    P = fr(P); Q = fr(Q);
    if (Q.isZero()) return P.tex();
    if (P.isZero()) return rootTex(Q, 3);
    if (P.d === 1 && Q.d === 1) return T.num(P) + (Q.n > 0 ? ' + ' : ' - ') + (Math.abs(Q.n) === 1 ? '' : Math.abs(Q.n)) + '\\sqrt{3}';
    var A = P.mul(2).n, B = Q.mul(2).n;
    return '\\dfrac{' + A + (B > 0 ? ' + ' : ' - ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + '\\sqrt{3}}{2}';
  }
  function r3Str(P, Q) { return '(' + fr(P).mul(2).n + '+(' + fr(Q).mul(2).n + ')*sqrt(3))/2'; }

  EM.gen.register({
    id: '1s-rotation-image',
    titre: 'Coordonnées de l’image d’un point par une rotation',
    chapitres: ['1s-angles-orientes', '1s1-transformations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a = niveau === 1 ? 0 : rng.nz(-3, 3), b = niveau === 1 ? 0 : rng.int(-3, 3);
      if (niveau === 3 && rng.bool(0.4)) { a = 0; b = 0; }
      var x, y, guard = 0;
      do { x = rng.int(-4, 5); y = rng.int(-4, 5); guard++; } while (x === a && y === b && guard < 50);
      var dx = x - a, dy = y - b, steps = [], rep, repT, thK;
      var Om = a === 0 && b === 0 ? 'O' : '\\Omega(' + a + ' ; ' + b + ')';
      var cN = a === 0 && b === 0 ? 'O' : '\\Omega';
      if (niveau < 3) {
        thK = rng.pick([F(1, 2), F(-1, 2), F(1)]);
        var cs = thK.equals(1) ? [-1, 0] : thK.n > 0 ? [0, 1] : [0, -1];
        var X = a + cs[0] * dx - cs[1] * dy, Y = b + cs[1] * dx + cs[0] * dy;
        rep = [X, Y]; repT = null;
        steps.push('Expression analytique de la rotation de centre $' + Om + '$ et d’angle $\\theta = ' + piTex(thK) + '$ ($\\cos\\theta = ' + cs[0] + '$, $\\sin\\theta = ' + cs[1] + '$) : $$' + (cN === 'O' ? '\\begin{cases} x\' = x\\cos\\theta - y\\sin\\theta \\\\ y\' = x\\sin\\theta + y\\cos\\theta \\end{cases}' : '\\begin{cases} x\' - ' + T.par(a) + ' = (x - ' + T.par(a) + ')\\cos\\theta - (y - ' + T.par(b) + ')\\sin\\theta \\\\ y\' - ' + T.par(b) + ' = (x - ' + T.par(a) + ')\\sin\\theta + (y - ' + T.par(b) + ')\\cos\\theta \\end{cases}') + '$$');
        steps.push('$\\vect{' + cN + ' M}(' + dx + ' ; ' + dy + ')$ donc $x\' = ' + a + ' + ' + T.par(dx) + ' \\times ' + T.par(cs[0]) + ' - ' + T.par(dy) + ' \\times ' + T.par(cs[1]) + ' = ' + X + '$ et $y\' = ' + b + ' + ' + T.par(dx) + ' \\times ' + T.par(cs[1]) + ' + ' + T.par(dy) + ' \\times ' + T.par(cs[0]) + ' = ' + Y + '$.');
        steps.push('$M\'(' + X + ' ; ' + Y + ')$. Contrôle : $' + cN + ' M\'^2 = ' + ((X - a) * (X - a) + (Y - b) * (Y - b)) + ' = ' + cN + ' M^2$.');
      } else {
        thK = rng.pick([F(1, 3), F(-1, 3), F(2, 3), F(-2, 3)]);
        var c = thK.abs().equals(F(1, 3)) ? 1 : -1, s = thK.n > 0 ? 1 : -1; // cos = c/2, sin = s√3/2
        var PX = F(2 * a + c * dx, 2), QX = F(-s * dy, 2), PY = F(2 * b + c * dy, 2), QY = F(s * dx, 2);
        rep = [r3Str(PX, QX), r3Str(PY, QY)];
        repT = '\\left(' + r3Tex(PX, QX) + ' \\,;\\, ' + r3Tex(PY, QY) + '\\right)';
        steps.push('Pour $\\theta = ' + piTex(thK) + '$ : $\\cos\\theta = ' + (c < 0 ? '-' : '') + '\\dfrac{1}{2}$ et $\\sin\\theta = ' + (s < 0 ? '-' : '') + '\\dfrac{\\sqrt{3}}{2}$.');
        steps.push('$\\vect{' + cN + ' M}(' + dx + ' ; ' + dy + ')$ ; $x\' = ' + a + ' + ' + T.par(dx) + ' \\times ' + (c < 0 ? '\\left(-\\dfrac{1}{2}\\right)' : '\\dfrac{1}{2}') + ' - ' + T.par(dy) + ' \\times ' + (s < 0 ? '\\left(-\\dfrac{\\sqrt{3}}{2}\\right)' : '\\dfrac{\\sqrt{3}}{2}') + ' = ' + r3Tex(PX, QX) + '$.');
        steps.push('$y\' = ' + b + ' + ' + T.par(dx) + ' \\times ' + (s < 0 ? '\\left(-\\dfrac{\\sqrt{3}}{2}\\right)' : '\\dfrac{\\sqrt{3}}{2}') + ' + ' + T.par(dy) + ' \\times ' + (c < 0 ? '\\left(-\\dfrac{1}{2}\\right)' : '\\dfrac{1}{2}') + ' = ' + r3Tex(PY, QY) + '$.');
      }
      var q = { label: '$M\'$', type: 'tuple', reponse: rep };
      if (repT) q.reponseTex = repT;
      return {
        enonce: 'Le plan est muni d’un repère orthonormé direct. Déterminer les coordonnées de l’image $M\'$ du point $M(' + x + ' ; ' + y + ')$ par la rotation de centre $' + Om + '$ et d’angle $' + piTex(thK) + '$.',
        questions: [q],
        indices: [
          'Calcule d’abord les coordonnées de $\\vect{\\Omega M}$.',
          '$x\' - a = (x - a)\\cos\\theta - (y - b)\\sin\\theta$ et $y\' - b = (x - a)\\sin\\theta + (y - b)\\cos\\theta$.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b), par exemple ((1+√3)/2 ; 2).'
      };
    }
  });

  /* ================================================================== */
  /* 13. Géométrie dans l'espace (1ère S1)                               */
  /* ================================================================== */
  EM.gen.register({
    id: '1s-espace-vecteurs',
    titre: 'Vecteurs et coordonnées dans l’espace',
    chapitres: ['1s-espace'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      function P3() { return [rng.int(-4, 5), rng.int(-4, 5), rng.int(-4, 5)]; }
      function t3(p) { return '(' + p.map(function (x) { return T.num(x); }).join(' ; ') + ')'; }
      var steps = [], questions = [], enonce;
      var A = P3(), B = P3(), g = 0;
      while (A[0] === B[0] && A[1] === B[1] && A[2] === B[2] && g++ < 20) B = P3();
      var AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      if (niveau === 1) {
        var I = [F(A[0] + B[0], 2), F(A[1] + B[1], 2), F(A[2] + B[2], 2)];
        var D2 = AB[0] * AB[0] + AB[1] * AB[1] + AB[2] * AB[2], sq = sqrtSimp(D2);
        enonce = 'L’espace est muni d’un repère orthonormé $(O, \\vec{i}, \\vec{j}, \\vec{k})$. On donne $A' + t3(A) + '$ et $B' + t3(B) + '$. Déterminer les coordonnées de $\\vect{AB}$, celles du milieu $I$ de $[AB]$, et la distance $AB$.';
        steps.push('$\\vect{AB}(x_B - x_A ; y_B - y_A ; z_B - z_A) = ' + t3(AB) + '$.');
        steps.push('$I\\left(\\dfrac{x_A + x_B}{2} ; \\dfrac{y_A + y_B}{2} ; \\dfrac{z_A + z_B}{2}\\right) = \\left(' + I.map(function (f) { return f.tex(); }).join(' \\,;\\, ') + '\\right)$.');
        steps.push('$AB = \\sqrt{' + AB.map(function (c) { return T.par(c) + '^2'; }).join(' + ') + '} = \\sqrt{' + D2 + '}' + (sq.r === D2 ? '' : ' = ' + rootTex(sq.c, sq.r)) + '$.');
        questions = [
          { label: '$\\vect{AB}$', type: 'tuple', reponse: AB },
          { label: '$I$', type: 'tuple', reponse: I },
          { label: '$AB =$', type: 'number', reponse: rootStr(sq.c, sq.r), reponseTex: rootTex(sq.c, sq.r) }
        ];
      } else if (niveau === 2) {
        var aligned = rng.bool(), t = rng.pick([2, -1, 3, -2]);
        var C = [A[0] + t * AB[0], A[1] + t * AB[1], A[2] + t * AB[2]];
        if (!aligned) {
          var j = rng.int(0, 2), dlt = rng.pick([1, -1, 2]);
          for (var tries = 0; tries < 3; tries++) {
            var Ct = C.slice(); Ct[(j + tries) % 3] += dlt;
            var w = [Ct[0] - A[0], Ct[1] - A[1], Ct[2] - A[2]];
            var cr = [AB[1] * w[2] - AB[2] * w[1], AB[2] * w[0] - AB[0] * w[2], AB[0] * w[1] - AB[1] * w[0]];
            if (cr[0] || cr[1] || cr[2]) { C = Ct; break; }
          }
        }
        var AC = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        enonce = 'Dans un repère de l’espace, on donne $A' + t3(A) + '$, $B' + t3(B) + '$ et $C' + t3(C) + '$. Les points $A$, $B$, $C$ sont-ils alignés ? ' + (aligned ? 'Si oui, déterminer le réel $k$ tel que $\\vect{AC} = k\\vect{AB}$.' : 'Sinon, déterminer les coordonnées du point $D$ tel que $ABCD$ soit un parallélogramme.');
        steps.push('$\\vect{AB}' + t3(AB) + '$ et $\\vect{AC}' + t3(AC) + '$.');
        if (aligned) {
          steps.push('On constate que $\\vect{AC} = ' + T.mono(t, '\\vect{AB}', true) + '$ (les trois coordonnées sont multipliées par $' + t + '$) : les vecteurs sont colinéaires et les points $A$, $B$, $C$ sont alignés.');
        } else {
          var bad = [0, 1, 2].filter(function (i) { return AB[i] !== 0; })[0];
          var kk = F(AC[bad], AB[bad]);
          steps.push('Si $\\vect{AC} = k\\vect{AB}$, la coordonnée n°' + (bad + 1) + ' impose $k = ' + kk.tex() + '$, mais les trois coordonnées ne sont pas toutes dans ce rapport : les vecteurs ne sont pas colinéaires, les points ne sont pas alignés.');
          var Dp = [A[0] + C[0] - B[0], A[1] + C[1] - B[1], A[2] + C[2] - B[2]];
          steps.push('$ABCD$ parallélogramme $\\iff \\vect{AD} = \\vect{BC}$, d’où $D = A + \\vect{BC}$ : $D' + t3(Dp) + '$.');
        }
        var shc = rng.shuffle(['oui', 'non']);
        questions.push({ label: 'Les points $A$, $B$, $C$ sont alignés :', type: 'choice', choix: shc, reponse: shc.indexOf(aligned ? 'oui' : 'non') });
        if (aligned) questions.push({ label: '$k =$', type: 'number', reponse: t });
        else questions.push({ label: '$D$', type: 'tuple', reponse: [A[0] + C[0] - B[0], A[1] + C[1] - B[1], A[2] + C[2] - B[2]] });
      } else {
        var a = rng.nz(-3, 3), m0 = rng.int(-4, 4), bb = rng.nz(-3, 3), k = rng.pick([2, 3, -2, -3]);
        enonce = 'Dans un repère de l’espace, on donne les vecteurs $\\vec{u}(' + a + ' ; m ; ' + bb + ')$ et $\\vec{v}(' + (k * a) + ' ; ' + (k * m0) + ' ; n)$, où $m$ et $n$ sont des réels. Déterminer $m$ et $n$ pour que $\\vec{u}$ et $\\vec{v}$ soient colinéaires.';
        steps.push('$\\vec{u}$ et $\\vec{v}$ sont colinéaires si et seulement s’il existe un réel $k$ tel que $\\vec{v} = k\\vec{u}$. La première coordonnée donne $' + (k * a) + ' = k \\times ' + T.par(a) + '$, soit $k = ' + k + '$.');
        steps.push('Deuxième coordonnée : $' + (k * m0) + ' = ' + k + 'm$, donc $m = ' + m0 + '$. Troisième : $n = ' + k + ' \\times ' + T.par(bb) + ' = ' + (k * bb) + '$.');
        questions.push({ label: '$(m ; n) =$', type: 'tuple', reponse: [m0, k * bb] });
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          '$\\vect{AB}(x_B - x_A ; y_B - y_A ; z_B - z_A)$ ; en repère orthonormé, $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$.',
          'Deux vecteurs sont colinéaires si leurs coordonnées sont proportionnelles : vérifie les TROIS coordonnées.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b ; c).'
      };
    }
  });

  /* ================================================================== */
  /* 14. Isométries et composées (1ère S1)                               */
  /* ================================================================== */
  EM.gen.register({
    id: '1s-composee-transformations',
    titre: 'Composer des réflexions, des rotations et des symétries',
    chapitres: ['1s1-transformations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var steps = [], questions = [], enonce;
      var NAT = ['une translation', 'une rotation', 'une réflexion', 'l’identité'];
      if (niveau === 1) {
        if (rng.bool()) {
          var p = rng.int(-4, 4), q = rng.intExcept(-4, 5, [p]), vert = rng.bool();
          var vec = vert ? [2 * (q - p), 0] : [0, 2 * (q - p)];
          var dT = vert ? 'x = ' : 'y = ';
          enonce = 'Dans un repère orthonormé, $D$ est la droite d’équation $' + dT + p + '$ et $D\'$ la droite d’équation $' + dT + q + '$. Déterminer la nature de $s_{D\'} \\circ s_D$ et ses éléments caractéristiques.';
          var H = vert ? '(' + p + ' ; 0)' : '(0 ; ' + p + ')', H2 = vert ? '(' + q + ' ; 0)' : '(0 ; ' + q + ')';
          steps.push('$D$ et $D\'$ sont parallèles. Avec $H' + H + ' \\in D$ et $H\'' + H2 + ' \\in D\'$, la droite $(HH\')$ est perpendiculaire à $D$ et $\\vect{HH\'}' + (vert ? '(' + (q - p) + ' ; 0)' : '(0 ; ' + (q - p) + ')') + '$.');
          steps.push('$s_{D\'} \\circ s_D$ est la translation de vecteur $2\\vect{HH\'}(' + vec[0] + ' ; ' + vec[1] + ')$.');
          steps.push('Vérification avec un point $M(x ; y)$ : $s_D(M) = ' + (vert ? '(' + (2 * p) + ' - x ; y)' : '(x ; ' + (2 * p) + ' - y)') + '$, puis $s_{D\'}$ donne ' + (vert ? '$(' + (2 * q) + ' - (' + (2 * p) + ' - x) ; y) = (x' + T.signed(vec[0]) + ' ; y)$.' : '$(x ; ' + (2 * q) + ' - (' + (2 * p) + ' - y)) = (x ; y' + T.signed(vec[1]) + ')$.'));
          questions.push(qcm(rng, '$s_{D\'} \\circ s_D$ est :', NAT[0], NAT));
          questions.push({ label: 'Vecteur de la translation', type: 'tuple', reponse: vec });
        } else {
          var th = rng.pick([F(1, 6), F(1, 4), F(1, 3), F(-1, 6), F(-1, 4), F(-1, 3), F(5, 12), F(-5, 12), F(2, 3)]);
          var rot = principal(th.mul(2));
          enonce = 'Deux droites $D$ et $D\'$, de vecteurs directeurs $\\vec{u}$ et $\\vec{u}\'$, sont sécantes en un point $\\Omega$, avec $(\\vec{u}, \\vec{u}\') = ' + piTex(th) + '$. Déterminer la nature de $s_{D\'} \\circ s_D$ et la mesure principale de son angle.';
          steps.push('La composée de deux réflexions d’axes sécants en $\\Omega$ est la rotation de centre $\\Omega$ et d’angle $2(\\vec{u}, \\vec{u}\')$.');
          steps.push('Angle : $2 \\times ' + (th.sign() < 0 ? '\\left(' + piTex(th) + '\\right)' : piTex(th)) + ' = ' + piTex(th.mul(2)) + '$' + (rot.equals(th.mul(2)) ? '' : ', de mesure principale $' + piTex(rot) + '$') + '.');
          questions.push(qcm(rng, '$s_{D\'} \\circ s_D$ est :', NAT[1], NAT));
          questions.push({ label: 'Angle (mesure principale) :', type: 'number', reponse: piStr(rot), reponseTex: piTex(rot) });
        }
      } else if (niveau === 2) {
        if (rng.bool()) {
          var al = F(rng.nz(-11, 12), 12), be = F(rng.nz(-11, 12), 12), g = 0;
          while (principal(al.add(be)).isZero() && g++ < 20) be = F(rng.nz(-11, 12), 12);
          var sum = al.add(be), ps = principal(sum);
          enonce = 'On note $r_1$ la rotation de centre $O$ et d’angle $' + piTex(al) + '$, et $r_2$ la rotation de centre $O$ et d’angle $' + piTex(be) + '$. Déterminer la nature de $r_2 \\circ r_1$ et la mesure principale de son angle.';
          steps.push('La composée de deux rotations de même centre $O$ est la rotation de centre $O$ dont l’angle est la somme des angles : $' + piTex(al) + ' + ' + (be.sign() < 0 ? '\\left(' + piTex(be) + '\\right)' : piTex(be)) + ' = ' + piTex(sum) + '$.');
          if (!sum.equals(ps)) steps.push('Mesure principale : $' + piTex(ps) + '$.');
          if (ps.equals(1)) steps.push('Une rotation d’angle $\\pi$ est la symétrie centrale de centre $O$.');
          questions.push(qcm(rng, '$r_2 \\circ r_1$ est :', NAT[1], NAT));
          questions.push({ label: 'Angle (mesure principale) :', type: 'number', reponse: piStr(ps), reponseTex: piTex(ps) });
        } else {
          var A = [rng.int(-4, 4), rng.int(-4, 4)], B = [rng.int(-4, 4), rng.int(-4, 4)], g2 = 0;
          while (A[0] === B[0] && A[1] === B[1] && g2++ < 20) B = [rng.int(-4, 4), rng.int(-4, 4)];
          var V = [2 * (B[0] - A[0]), 2 * (B[1] - A[1])];
          enonce = 'Dans un repère, on donne $A(' + A[0] + ' ; ' + A[1] + ')$ et $B(' + B[0] + ' ; ' + B[1] + ')$. On note $s_A$ et $s_B$ les symétries centrales de centres $A$ et $B$. Déterminer la nature de $s_B \\circ s_A$ et ses éléments caractéristiques.';
          steps.push('Pour $M(x ; y)$ : $s_A(M) = M_1(2x_A - x ; 2y_A - y)$, puis $s_B(M_1) = M\'(2x_B - 2x_A + x ; 2y_B - 2y_A + y)$.');
          steps.push('Ainsi $\\vect{MM\'}(2(x_B - x_A) ; 2(y_B - y_A))$, c’est-à-dire $\\vect{MM\'} = 2\\vect{AB}$ pour tout point $M$.');
          steps.push('$s_B \\circ s_A$ est la translation de vecteur $2\\vect{AB}(' + V[0] + ' ; ' + V[1] + ')$.');
          questions.push(qcm(rng, '$s_B \\circ s_A$ est :', NAT[0], NAT));
          questions.push({ label: 'Vecteur de la translation', type: 'tuple', reponse: V });
        }
      } else {
        var M = [rng.int(-4, 4), rng.int(-4, 4)], u = [rng.nz(-3, 3), rng.int(-3, 3)], Om = [rng.int(-3, 3), rng.int(-3, 3)];
        var kind = rng.pick(['sT', 'rT', 'Tr']), M1, M2, txt;
        if (kind === 'sT') {
          M1 = [M[0] + u[0], M[1] + u[1]]; M2 = [2 * Om[0] - M1[0], 2 * Om[1] - M1[1]];
          txt = '$f = s_\\Omega \\circ t_{\\vec{u}}$, où $s_\\Omega$ est la symétrie de centre $\\Omega(' + Om[0] + ' ; ' + Om[1] + ')$ et $t_{\\vec{u}}$ la translation de vecteur $\\vec{u}(' + u[0] + ' ; ' + u[1] + ')$';
          steps.push('On applique d’abord $t_{\\vec{u}}$ : $M_1 = t_{\\vec{u}}(M) = (' + M[0] + T.signed(u[0]) + ' ; ' + M[1] + T.signed(u[1]) + ') = (' + M1[0] + ' ; ' + M1[1] + ')$.');
          steps.push('Puis $s_\\Omega$ : $M\' = (2 \\times ' + T.par(Om[0]) + ' - ' + T.par(M1[0]) + ' ; 2 \\times ' + T.par(Om[1]) + ' - ' + T.par(M1[1]) + ') = (' + M2[0] + ' ; ' + M2[1] + ')$.');
        } else if (kind === 'rT') {
          M1 = [M[0] + u[0], M[1] + u[1]]; M2 = [-M1[1], M1[0]];
          txt = '$f = r \\circ t_{\\vec{u}}$, où $r$ est la rotation de centre $O$ et d’angle $\\dfrac{\\pi}{2}$ et $t_{\\vec{u}}$ la translation de vecteur $\\vec{u}(' + u[0] + ' ; ' + u[1] + ')$';
          steps.push('On applique d’abord $t_{\\vec{u}}$ : $M_1 = (' + M[0] + T.signed(u[0]) + ' ; ' + M[1] + T.signed(u[1]) + ') = (' + M1[0] + ' ; ' + M1[1] + ')$.');
          steps.push('Puis $r$ : l’image de $(x ; y)$ est $(-y ; x)$, donc $M\' = (' + T.num(-M1[1]) + ' ; ' + M1[0] + ')$.');
        } else {
          M1 = [-M[1], M[0]]; M2 = [M1[0] + u[0], M1[1] + u[1]];
          txt = '$f = t_{\\vec{u}} \\circ r$, où $r$ est la rotation de centre $O$ et d’angle $\\dfrac{\\pi}{2}$ et $t_{\\vec{u}}$ la translation de vecteur $\\vec{u}(' + u[0] + ' ; ' + u[1] + ')$';
          steps.push('On applique d’abord $r$ : l’image de $(x ; y)$ est $(-y ; x)$, donc $M_1 = (' + T.num(-M[1]) + ' ; ' + M[0] + ')$.');
          steps.push('Puis $t_{\\vec{u}}$ : $M\' = (' + M1[0] + T.signed(u[0]) + ' ; ' + M1[1] + T.signed(u[1]) + ') = (' + M2[0] + ' ; ' + M2[1] + ')$.');
        }
        enonce = 'Le plan est muni d’un repère orthonormé direct. On considère ' + txt + '. Déterminer les coordonnées de l’image $M\'$ du point $M(' + M[0] + ' ; ' + M[1] + ')$ par $f$.';
        steps.push('Donc $M\'(' + M2[0] + ' ; ' + M2[1] + ')$.');
        questions.push({ label: '$M\'$', type: 'tuple', reponse: M2 });
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: [
          'Dans $g \\circ f$, on applique d’abord $f$, puis $g$.',
          'Réflexions d’axes parallèles : translation de vecteur $2\\vect{HH\'}$ ; d’axes sécants : rotation d’angle $2(\\vec{u}, \\vec{u}\')$.'
        ],
        solution: steps,
        aide: 'Écris les coordonnées sous la forme (a ; b) et les angles comme pi/3.'
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
