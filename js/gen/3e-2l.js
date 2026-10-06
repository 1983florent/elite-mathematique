/*
 * ELITE MATHÉMATIQUE — générateurs d'exercices de 3e (classe d'examen du BFEM) et de 2nde L.
 *
 * Activités numériques : racines carrées, calcul algébrique, équations et inéquations,
 * systèmes, applications affines, statistiques.
 * Activités géométriques : Thalès (réciproque ; le calcul de longueur est dans 00-reference.js),
 * trigonométrie, angles inscrits, vecteurs, repérage, espace.
 * 2nde L : ces générateurs déclarent aussi les chapitres 2l-…, plus pourcentages, calcul numérique, intervalles.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, Frac = EM.Frac, ar = EM.ar;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  function fr(x) { return x instanceof Frac ? x : F(x); }
  /** Écriture lisible par l'analyseur : (3), (-2/5) */
  function ps(x) { x = fr(x); return x.d === 1 ? '(' + x.n + ')' : '(' + x.n + '/' + x.d + ')'; }
  /** ax + b en TeX */
  function lin(a, b) { return T.poly([a, b]); }
  /** (ax + b) en TeX */
  function plin(a, b) { return '(' + T.poly([a, b]) + ')'; }
  /** (ax + b) pour l'analyseur */
  function linStr(a, b) { return '(' + ps(a) + '*x+' + ps(b) + ')'; }
  /** Polynômes : tableaux de coefficients, du terme constant au terme de plus haut degré. */
  function Lp(a, b) { return [fr(b), fr(a)]; }
  function pmul(p, q) {
    var r = [], i;
    for (i = 0; i < p.length + q.length - 1; i++) r.push(F(0));
    p.forEach(function (u, i1) { q.forEach(function (v, j) { r[i1 + j] = r[i1 + j].add(fr(u).mul(fr(v))); }); });
    return r;
  }
  /** p + s·q */
  function padd(p, q, s) {
    s = s == null ? 1 : s;
    var n = Math.max(p.length, q.length), r = [];
    for (var i = 0; i < n; i++) r.push(fr(p[i] || 0).add(fr(q[i] || 0).mul(s)));
    return r;
  }
  function pscale(p, k) { return p.map(function (c) { return fr(c).mul(k); }); }
  function ptex(p) {
    var c = p.slice();
    while (c.length > 1 && fr(c[c.length - 1]).isZero()) c.pop();
    return T.poly(c.reverse());
  }
  function pstr(p) {
    return p.map(function (c, i) { return ps(c) + (i === 0 ? '' : i === 1 ? '*x' : '*x^' + i); }).join('+');
  }
  /** Termes d'un polynôme pour T.sum (sans réduction). */
  function terms(p) {
    var out = [];
    for (var i = p.length - 1; i >= 0; i--) out.push({ c: p[i], v: i === 0 ? '' : i === 1 ? 'x' : 'x^2' });
    return out;
  }
  /** k√b en TeX */
  function rad(k, b) { return b === 1 ? T.num(k) : T.mono(k, '\\sqrt{' + b + '}', true); }
  /** (s√t)/d simplifié, s et d entiers positifs */
  function radFrac(s, t, d) {
    var g = ar.gcd(s, d); s /= g; d /= g;
    var top = t === 1 ? String(s) : (s === 1 ? '' : s) + '\\sqrt{' + t + '}';
    return d === 1 ? top : '\\dfrac{' + top + '}{' + d + '}';
  }
  /** Préfixe d'un coefficient devant une parenthèse : 3( , -( , ( */
  function coefPre(a) { return a === 1 ? '' : a === -1 ? '-' : T.num(a); }
  /** Préfixe « a × » (rien si a = 1, « - » si a = -1) */
  function coefTimes(a) { return a === 1 ? '' : a === -1 ? '-' : T.num(a) + ' \\times '; }
  function coord(x, y) { return '\\left(' + T.num(x) + '\\,;\\,' + T.num(y) + '\\right)'; }
  function vcol(x, y) { return '\\begin{pmatrix} ' + T.num(x) + ' \\\\ ' + T.num(y) + ' \\end{pmatrix}'; }
  function deg(x) { return T.num(x) + '^\\circ'; }
  function sortFr(arr) {
    var u = [];
    arr.forEach(function (x) { if (!u.some(function (y) { return y.equals(x); })) u.push(x); });
    return u.sort(function (a, b) { return a.cmp(b); });
  }
  /** Résolution de ax + b = 0 rédigée */
  function solveLinTex(a, b) {
    var r = F(-b, a);
    var s = '$' + lin(a, b) + ' = 0 \\iff ';
    if (b === 0 || a === 1) return s + 'x = ' + r.tex() + '$';
    return s + T.mono(a, 'x', true) + ' = ' + T.num(-b) + ' \\iff x = ' + r.tex() + '$';
  }
  /** Tableau HTML (première cellule de chaque ligne en en-tête) */
  function tableau(rows) {
    return '<table class="em-tableau">' + rows.map(function (r) {
      return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th>' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  /** ax + b est-il « primitif » (coefficients premiers entre eux) ? */
  function prim(a, b) { return ar.gcd(a, b) === 1; }
  /** k(a1x + b1)(a2x + b2) en sortant les facteurs entiers ; null s'il n'y a rien à sortir */
  function sortirEntiers(f1, f2) {
    var g1 = ar.gcd(f1[0], f1[1]), g2 = ar.gcd(f2[0], f2[1]);
    if (g1 * g2 === 1) return null;
    return T.num(g1 * g2) + plin(f1[0] / g1, f1[1] / g1) + plin(f2[0] / g2, f2[1] / g2);
  }
  var OPS = { '<': '<', '<=': '\\leq', '>': '>', '>=': '\\geq' };
  function flip(op) { return { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[op]; }
  function intervalOf(op, r) {
    if (op === '<') return { a: -Infinity, b: r, ouvA: true, ouvB: true };
    if (op === '<=') return { a: -Infinity, b: r, ouvA: true, ouvB: false };
    if (op === '>') return { a: r, b: Infinity, ouvA: true, ouvB: true };
    return { a: r, b: Infinity, ouvA: false, ouvB: true };
  }
  function itex(I) { return T.interval(I.a, I.b, I.ouvA, I.ouvB); }
  /** Groupe les chiffres des grands entiers dans du TeX produit par T.sum / T.poly : 6480000 -> 6\,480\,000 */
  function grp(s) {
    return s.replace(/(^|[^\d,}])(\d{4,})/g, function (m, p, d) { return p + d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); });
  }
  function tsum(t) { return grp(T.sum(t)); }
  function tmono(c, v, first) { return grp(T.mono(c, v, first)); }
  /** Arrondi d'affichage : « ≈ 6,55 » */
  function approx(x, d) { return T.num(ar.round(x, d)); }

  var AIDE_RAD = 'Pour écrire une racine carrée : √ ou sqrt. Exemple : 5√3 ou 5sqrt(3) ; 7+2√3 ; (3√2)/4.';
  var AIDE_SET = 'Sépare les solutions par « ; » (exemple : -3 ; 5/2). Écris « ∅ » s\'il n\'y a pas de solution.';

  /* ================================================================== */
  /* 3e — RACINES CARRÉES                                                */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-racines-simplifier',
    titre: 'Simplifier et calculer avec des racines carrées',
    chapitres: ['3e-racines', '2l-calcul'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var b, k, n, i;
      if (niveau === 1) {
        b = rng.pick([2, 3, 5, 6, 7, 10]);
        k = rng.int(2, 9);
        n = k * k * b;
        return {
          enonce: 'Écrire $\\sqrt{' + n + '}$ sous la forme $a\\sqrt{b}$, où $a$ et $b$ sont des entiers naturels, $b$ étant le plus petit possible.',
          questions: [{ label: '$\\sqrt{' + n + '} =$', type: 'number', reponse: k + '*sqrt(' + b + ')', reponseTex: k + '\\sqrt{' + b + '}' }],
          indices: [
            'Cherche le plus grand carré parfait ($4$, $9$, $16$, $25$, $36$, $49$, $64$, $81$…) qui divise $' + n + '$.',
            'Pour $a \\geq 0$ et $b \\geq 0$ : $\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$.'
          ],
          solution: [
            '$' + n + ' = ' + k * k + ' \\times ' + b + '$, où $' + k * k + ' = ' + k + '^2$ est le plus grand carré parfait qui divise $' + n + '$.',
            '$\\sqrt{' + n + '} = \\sqrt{' + k * k + ' \\times ' + b + '} = \\sqrt{' + k * k + '} \\times \\sqrt{' + b + '} = ' + k + '\\sqrt{' + b + '}$.'
          ],
          aide: AIDE_RAD
        };
      }
      if (niveau === 2) {
        b = rng.pick([2, 3, 5, 7]);
        var ks, cs, tot, guard = 0;
        do {
          ks = rng.sample([1, 2, 3, 4, 5, 6], 3);
          cs = [rng.int(1, 4), rng.nz(-5, 5), rng.nz(-5, 5)];
          tot = cs[0] * ks[0] + cs[1] * ks[1] + cs[2] * ks[2];
        } while (tot === 0 && guard++ < 60);
        if (tot === 0) { ks = [2, 3, 1]; cs = [2, 3, -1]; tot = 12; }
        var A = '', simp = [], prods = '', coefs = [];
        for (i = 0; i < 3; i++) {
          A += T.mono(cs[i], '\\sqrt{' + ks[i] * ks[i] * b + '}', i === 0);
          if (ks[i] > 1) simp.push('$\\sqrt{' + ks[i] * ks[i] * b + '} = \\sqrt{' + ks[i] * ks[i] + ' \\times ' + b + '} = ' + ks[i] + '\\sqrt{' + b + '}$');
          prods += T.mono(cs[i] * ks[i], '\\sqrt{' + b + '}', i === 0);
          coefs.push({ c: cs[i] * ks[i] });
        }
        var res = T.mono(tot, '\\sqrt{' + b + '}', true);
        return {
          enonce: 'On donne $A = ' + A + '$.<br>Écrire $A$ sous la forme $a\\sqrt{' + b + '}$, où $a$ est un entier relatif.',
          questions: [{ label: '$A =$', type: 'number', reponse: tot + '*sqrt(' + b + ')', reponseTex: res }],
          indices: [
            'Écris chaque radicande comme le produit d\'un carré parfait par $' + b + '$.',
            'Ensuite, $\\sqrt{k^2 \\times ' + b + '} = k\\sqrt{' + b + '}$ : il ne reste qu\'à additionner des termes en $\\sqrt{' + b + '}$.'
          ],
          solution: [
            'On simplifie chaque racine : ' + simp.join(' ; ') + '.',
            '$A = ' + prods + '$',
            '$A = \\left(' + T.sum(coefs) + '\\right)\\sqrt{' + b + '} = ' + res + '$.'
          ],
          aide: AIDE_RAD
        };
      }
      // niveau 3 : développement d'expressions avec radicaux
      b = rng.pick([2, 3, 5, 6, 7]);
      if (rng.bool()) {
        var m = rng.int(1, 6), nn = rng.nz(-4, 4);
        var p = m * m + nn * nn * b, q = 2 * m * nn, an = Math.abs(nn);
        var sg = nn > 0 ? '+' : '-';
        var resB = T.num(p) + T.mono(q, '\\sqrt{' + b + '}');
        return {
          enonce: 'Développer et réduire $B = \\left(' + m + T.mono(nn, '\\sqrt{' + b + '}') + '\\right)^2$. Écrire le résultat sous la forme $p + q\\sqrt{' + b + '}$, où $p$ et $q$ sont des entiers.',
          questions: [{ label: '$B =$', type: 'number', reponse: '(' + p + ')+(' + q + ')*sqrt(' + b + ')', reponseTex: resB }],
          indices: [
            'Utilise l\'identité remarquable $(a ' + sg + ' b)^2 = a^2 ' + sg + ' 2ab + b^2$.',
            'N\'oublie pas que $\\left(\\sqrt{' + b + '}\\right)^2 = ' + b + '$.'
          ],
          solution: [
            'On utilise $(a ' + sg + ' b)^2 = a^2 ' + sg + ' 2ab + b^2$ avec $a = ' + m + '$ et $b = ' + rad(an, b) + '$.',
            '$B = ' + m + '^2 ' + sg + ' 2 \\times ' + m + ' \\times ' + rad(an, b) + ' + \\left(' + rad(an, b) + '\\right)^2$',
            '$B = ' + m * m + ' ' + sg + ' ' + rad(2 * m * an, b) + ' + ' + (an === 1 ? '' : nn * nn + ' \\times ') + b + '$',
            '$B = ' + resB + '$.'
          ],
          aide: AIDE_RAD
        };
      }
      var mm = rng.int(1, 4), n2 = rng.int(1, 9);
      var val = mm * mm * b - n2 * n2;
      var r1 = rad(mm, b);
      return {
        enonce: 'On donne $C = \\left(' + r1 + ' + ' + n2 + '\\right)\\left(' + r1 + ' - ' + n2 + '\\right)$.<br>Calculer $C$ et justifier que $C$ est un nombre entier.',
        questions: [{ label: '$C =$', type: 'number', reponse: val }],
        indices: [
          'Reconnais l\'identité remarquable $(a + b)(a - b) = a^2 - b^2$.',
          '$\\left(' + r1 + '\\right)^2 = ' + (mm === 1 ? b : mm + '^2 \\times ' + b) + '$.'
        ],
        solution: [
          'On utilise $(a + b)(a - b) = a^2 - b^2$ avec $a = ' + r1 + '$ et $b = ' + n2 + '$.',
          '$C = \\left(' + r1 + '\\right)^2 - ' + n2 + '^2 = ' + (mm === 1 ? '' : mm * mm + ' \\times ') + b + ' - ' + n2 * n2 + ' = ' + T.num(val) + '$.',
          'Donc $C = ' + T.num(val) + '$ est bien un nombre entier.'
        ]
      };
    }
  });

  EM.gen.register({
    id: '3e-racines-rationaliser',
    titre: 'Rendre rationnel le dénominateur',
    chapitres: ['3e-racines', '2l-calcul'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, res;
      if (niveau === 1) {
        b = rng.pick([2, 3, 5, 6, 7, 10, 11]);
        c = rng.pick([1, 1, 2, 3]);
        a = rng.bool() ? b * rng.int(1, 4) : rng.int(1, 12);
        var g = ar.gcd(a, c * b), num = a / g, den = c * b / g;
        res = den === 1 ? rad(num, b) : '\\dfrac{' + rad(num, b) + '}{' + den + '}';
        var dTex = rad(c, b);
        var sol = [
          'On multiplie le numérateur et le dénominateur par $\\sqrt{' + b + '}$, sachant que $\\sqrt{' + b + '} \\times \\sqrt{' + b + '} = ' + b + '$.',
          '$A = \\dfrac{' + a + ' \\times \\sqrt{' + b + '}}{' + dTex + ' \\times \\sqrt{' + b + '}} = \\dfrac{' + rad(a, b) + '}{' + (c === 1 ? b : c + ' \\times ' + b) + '}' +
            (c === 1 ? '' : ' = \\dfrac{' + rad(a, b) + '}{' + c * b + '}') + '$.'
        ];
        if (g > 1) sol.push('On simplifie par $' + g + '$ : $A = ' + res + '$.');
        else sol.push('La fraction est irréductible : $A = ' + res + '$.');
        return {
          enonce: 'Écrire $A = \\dfrac{' + a + '}{' + dTex + '}$ sans radical au dénominateur, puis simplifier.',
          questions: [{ label: '$A =$', type: 'number', reponse: '(' + a + ')/((' + c + ')*sqrt(' + b + '))', reponseTex: res }],
          indices: ['Multiplie le numérateur et le dénominateur par $\\sqrt{' + b + '}$.', 'Simplifie ensuite la fraction obtenue si c\'est possible.'],
          solution: sol,
          aide: AIDE_RAD
        };
      }
      var d, s, guard = 0;
      do {
        b = rng.pick([2, 3, 5, 6, 7, 10, 11, 13]);
        c = rng.int(1, 4);
        d = b - c * c;
      } while ((d === 0 || Math.abs(d) > 12) && guard++ < 50);
      if (d === 0 || Math.abs(d) > 12) { b = 5; c = 2; d = 1; }
      s = rng.sign();
      a = rng.bool(0.6) ? Math.abs(d) * rng.int(1, 3) : rng.int(1, 9);
      var den2 = '\\sqrt{' + b + '}' + (s > 0 ? ' + ' : ' - ') + c;
      var conj = '\\sqrt{' + b + '}' + (s > 0 ? ' - ' : ' + ') + c;
      var g2 = ar.gcd(a, Math.abs(d)), Pn = a / g2, D = d / g2;
      if (D < 0) { Pn = -Pn; D = -D; }
      var cst = -s * c * Pn;
      var numTex = Pn < 0 ? T.num(cst) + T.mono(Pn, '\\sqrt{' + b + '}') : T.mono(Pn, '\\sqrt{' + b + '}', true) + T.signed(cst);
      res = D === 1 ? numTex : (Pn < 0 && cst < 0 ? '-\\dfrac{' + T.num(-cst) + ' + ' + rad(-Pn, b) + '}{' + D + '}' : '\\dfrac{' + numTex + '}{' + D + '}');
      var numA = a === 1 ? conj : a + '\\left(' + conj + '\\right)';
      return {
        enonce: 'Écrire $A = \\dfrac{' + a + '}{' + den2 + '}$ sans radical au dénominateur.',
        questions: [{ label: '$A =$', type: 'number', reponse: '(' + a + ')/(sqrt(' + b + ')+(' + s * c + '))', reponseTex: res }],
        indices: [
          'Multiplie le numérateur et le dénominateur par l\'expression conjuguée $' + conj + '$.',
          'Au dénominateur : $(a + b)(a - b) = a^2 - b^2$, et $\\left(\\sqrt{' + b + '}\\right)^2 = ' + b + '$.'
        ],
        solution: [
          'L\'expression conjuguée de $' + den2 + '$ est $' + conj + '$ ; on multiplie le numérateur et le dénominateur par celle-ci.',
          '$A = \\dfrac{' + numA + '}{\\left(' + den2 + '\\right)\\left(' + conj + '\\right)}$',
          'Au dénominateur : $\\left(' + den2 + '\\right)\\left(' + conj + '\\right) = \\left(\\sqrt{' + b + '}\\right)^2 - ' + c + '^2 = ' + b + ' - ' + c * c + ' = ' + d + '$.',
          d === 1 ? '$A = ' + res + '$.' : '$A = \\dfrac{' + numA + '}{' + d + '} = ' + res + '$.'
        ],
        aide: AIDE_RAD
      };
    }
  });

  EM.gen.register({
    id: '3e-racines-comparer',
    titre: 'Comparer des nombres écrits avec des radicaux',
    chapitres: ['3e-racines'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, X, Y, xs, ys, xsq, ysq;
      if (niveau === 1) {
        if (rng.bool(0.6)) {
          var bb = rng.sample([2, 3, 5, 6, 7], 2), guard = 0;
          do { a = rng.int(2, 7); c = rng.int(2, 7); X = a * a * bb[0]; Y = c * c * bb[1]; } while (X === Y && guard++ < 50);
          xs = rad(a, bb[0]); ys = rad(c, bb[1]);
          xsq = a + '^2 \\times ' + bb[0]; ysq = c + '^2 \\times ' + bb[1];
        } else {
          b = rng.pick([2, 3, 5, 6, 7]); a = rng.int(2, 6); X = a * a * b;
          Y = X + rng.pick([-3, -2, -1, 0, 0, 1, 2, 3]);
          if (ar.isInt(Math.sqrt(Y))) Y = X;
          xs = rad(a, b); ys = '\\sqrt{' + Y + '}';
          xsq = a + '^2 \\times ' + b; ysq = null;
        }
        if (rng.bool()) { var t = xs; xs = ys; ys = t; t = X; X = Y; Y = t; t = xsq; xsq = ysq; ysq = t; }
        var rel = X < Y ? '<' : X > Y ? '>' : '=';
        var choix = rng.shuffle(['<', '>', '=']);
        return {
          enonce: 'Comparer les nombres $x = ' + xs + '$ et $y = ' + ys + '$.',
          questions: [{ label: 'On a :', type: 'choice', choix: choix.map(function (o) { return '$' + xs + ' ' + o + ' ' + ys + '$'; }), reponse: choix.indexOf(rel) }],
          indices: ['Les deux nombres sont positifs : compare leurs carrés.', '$\\left(k\\sqrt{b}\\right)^2 = k^2 \\times b$.'],
          solution: [
            '$x$ et $y$ sont positifs ; deux nombres positifs sont rangés dans le même ordre que leurs carrés.',
            '$x^2 = \\left(' + xs + '\\right)^2 = ' + (xsq ? xsq + ' = ' : '') + X + '$ et $y^2 = \\left(' + ys + '\\right)^2 = ' + (ysq ? ysq + ' = ' : '') + Y + '$.',
            (X === Y ? 'Les carrés sont égaux, donc $' + xs + ' = ' + ys + '$.' : 'Comme $' + X + ' ' + rel + ' ' + Y + '$, on a $' + xs + ' ' + rel + ' ' + ys + '$.')
          ]
        };
      }
      b = rng.pick([2, 3, 5, 6, 7]);
      a = rng.int(1, 4);
      var v = a * Math.sqrt(b);
      var n = rng.bool() ? Math.floor(v) : Math.ceil(v);
      if (n < 1) n = 1;
      var r = rad(a, b);
      var form1 = rng.bool();
      var E = form1 ? r + ' - ' + n : n + ' - ' + r;
      var oppE = form1 ? n + ' - ' + r : r + ' - ' + n;
      var Ev = form1 ? v - n : n - v;
      X = a * a * b;
      var big = X > n * n; // a√b > n
      var pos = Ev > 0;
      var ch = rng.shuffle(['$E > 0$', '$E < 0$']);
      return {
        enonce: 'On donne $E = ' + E + '$.<br>1) Déterminer le signe de $E$.<br>2) En déduire l\'écriture de $\\left|E\\right|$ sans le symbole de la valeur absolue.',
        questions: [
          { label: '1) Signe de $E$ :', type: 'choice', choix: ch, reponse: ch.indexOf(pos ? '$E > 0$' : '$E < 0$') },
          { label: '2) $\\left|E\\right| =$', type: 'number', reponse: Math.abs(Ev), reponseTex: pos ? E : oppE }
        ],
        indices: [
          'Compare $' + r + '$ et $' + n + '$ en comparant leurs carrés.',
          'Si $E \\geq 0$ alors $\\left|E\\right| = E$ ; si $E < 0$ alors $\\left|E\\right| = -E$.'
        ],
        solution: [
          '$\\left(' + r + '\\right)^2 = ' + X + '$ et $' + n + '^2 = ' + n * n + '$. Comme $' + X + (big ? ' > ' : ' < ') + n * n + '$ et que ces nombres sont positifs, $' + r + (big ? ' > ' : ' < ') + n + '$.',
          'Donc $E = ' + E + (pos ? ' > 0' : ' < 0') + '$.',
          pos ? 'Comme $E > 0$, $\\left|E\\right| = E = ' + E + '$.' : 'Comme $E < 0$, $\\left|E\\right| = -E = ' + oppE + '$.'
        ],
        aide: AIDE_RAD
      };
    }
  });

  /* ================================================================== */
  /* 3e — CALCUL ALGÉBRIQUE                                              */
  /* ================================================================== */
  /** Identité remarquable : type 'plus' (ax+b)², 'moins' (ax-b)², 'diff' (ax+b)(ax-b) ; a, b > 0 */
  function identite(type, a, b) {
    var ax = T.mono(a, 'x', true);
    var sq = fr(a).equals(1) ? 'x^2' : '\\left(' + ax + '\\right)^2';
    var bt = T.num(b), b2 = fr(b).d === 1 ? bt + '^2' : '\\left(' + bt + '\\right)^2';
    var poly, tex, dev;
    if (type === 'plus') {
      poly = pmul(Lp(a, b), Lp(a, b)); tex = '\\left(' + lin(a, b) + '\\right)^2';
      dev = sq + ' + 2 \\times ' + ax + ' \\times ' + bt + ' + ' + b2;
    } else if (type === 'moins') {
      poly = pmul(Lp(a, fr(b).neg()), Lp(a, fr(b).neg())); tex = '\\left(' + lin(a, fr(b).neg()) + '\\right)^2';
      dev = sq + ' - 2 \\times ' + ax + ' \\times ' + bt + ' + ' + b2;
    } else {
      poly = pmul(Lp(a, b), Lp(a, fr(b).neg())); tex = '\\left(' + lin(a, b) + '\\right)\\left(' + lin(a, fr(b).neg()) + '\\right)';
      dev = sq + ' - ' + b2;
    }
    var formule = { plus: '(a + b)^2 = a^2 + 2ab + b^2', moins: '(a - b)^2 = a^2 - 2ab + b^2', diff: '(a + b)(a - b) = a^2 - b^2' }[type];
    return { poly: poly, tex: tex, dev: dev, formule: formule };
  }

  EM.gen.register({
    id: '3e-developper',
    titre: 'Développer et réduire avec les identités remarquables',
    chapitres: ['3e-calcul-algebrique'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var type = rng.pick(['plus', 'moins', 'diff']);
      var a, b, I, res, sol, E;
      if (niveau === 1) {
        do { a = rng.pick([1, 2, 2, 3, 3, 4, 5]); b = rng.int(1, 9); } while (!prim(a, b));
        I = identite(type, a, b);
        E = I.tex; res = I.poly;
        sol = [
          'On utilise l\'identité remarquable $' + I.formule + '$.',
          '$E = ' + I.dev + '$',
          '$E = ' + ptex(res) + '$.'
        ];
      } else if (niveau === 2) {
        do { a = rng.int(1, 4); b = rng.int(1, 7); } while (!prim(a, b));
        I = identite(type, a, b);
        var c, d, e, f;
        do { c = rng.nz(-3, 3); d = rng.nz(-6, 6); e = rng.nz(-3, 3); f = rng.nz(-6, 6); } while (!prim(c, d) || !prim(e, f));
        var sgn = rng.sign();
        var prod = pmul(Lp(c, d), Lp(e, f));
        res = padd(I.poly, prod, sgn);
        E = I.tex + (sgn > 0 ? ' + ' : ' - ') + plin(c, d) + plin(e, f);
        sol = [
          'On développe d\'abord $' + I.tex + '$ avec $' + I.formule + '$ : $' + I.tex + ' = ' + I.dev + ' = ' + ptex(I.poly) + '$.',
          'Puis $' + plin(c, d) + plin(e, f) + ' = ' + T.sum([{ c: c * e, v: 'x^2' }, { c: c * f, v: 'x' }, { c: d * e, v: 'x' }, { c: d * f }]) + ' = ' + ptex(prod) + '$.',
          sgn > 0
            ? '$E = ' + T.sum(terms(I.poly).concat(terms(prod))) + '$'
            : '$E = ' + ptex(I.poly) + ' - \\left(' + ptex(prod) + '\\right) = ' + T.sum(terms(I.poly).concat(terms(pscale(prod, -1)))) + '$ (on change les signes dans la parenthèse précédée de « $-$ »)',
          'On réduit : $E = ' + ptex(res) + '$.'
        ];
      } else {
        if (rng.bool()) {
          do { a = rng.int(1, 3); b = rng.int(1, 5); } while (!prim(a, b));
          var m = rng.pick([2, 3]);
          I = identite(type === 'diff' ? 'plus' : type, a, b);
          var c3, d3;
          do { c3 = rng.int(1, 4); d3 = rng.int(1, 6); } while (!prim(c3, d3));
          var J = identite('diff', c3, d3);
          var mI = pscale(I.poly, m);
          res = padd(mI, J.poly, -1);
          E = m + I.tex + ' - ' + J.tex;
          sol = [
            '$' + I.tex + ' = ' + I.dev + ' = ' + ptex(I.poly) + '$, donc $' + m + I.tex + ' = ' + m + '\\left(' + ptex(I.poly) + '\\right) = ' + ptex(mI) + '$.',
            '$' + J.tex + ' = ' + J.dev + ' = ' + ptex(J.poly) + '$.',
            '$E = ' + ptex(mI) + ' - \\left(' + ptex(J.poly) + '\\right) = ' + T.sum(terms(mI).concat(terms(pscale(J.poly, -1)))) + '$',
            '$E = ' + ptex(res) + '$.'
          ];
        } else {
          a = rng.pick([F(1, 2), F(1, 3), F(3, 2)]); b = rng.int(1, 6);
          I = identite(type === 'diff' ? 'plus' : type, a, b);
          var c4 = rng.int(1, 5);
          var J2 = identite('diff', 1, c4);
          res = padd(I.poly, J2.poly, -1);
          E = I.tex + ' - ' + J2.tex;
          sol = [
            '$' + I.tex + ' = ' + I.dev + ' = ' + ptex(I.poly) + '$.',
            '$' + J2.tex + ' = ' + J2.dev + ' = ' + ptex(J2.poly) + '$.',
            '$E = ' + ptex(I.poly) + ' - \\left(' + ptex(J2.poly) + '\\right) = ' + T.sum(terms(I.poly).concat(terms(pscale(J2.poly, -1)))) + '$',
            '$E = ' + ptex(res) + '$.'
          ];
        }
      }
      return {
        enonce: 'Développer, réduire et ordonner l\'expression : $$E = ' + E + '$$',
        questions: [{ label: '$E =$', type: 'expr', forme: 'somme', reponse: pstr(res), reponseTex: ptex(res) }],
        indices: [
          'Rappel : $(a + b)^2 = a^2 + 2ab + b^2$ ; $(a - b)^2 = a^2 - 2ab + b^2$ ; $(a + b)(a - b) = a^2 - b^2$.',
          niveau === 1 ? 'Attention au double produit $2ab$ : on l\'oublie souvent.' : 'Développe chaque partie séparément, puis réduis. Devant une parenthèse précédée de « $-$ », change tous les signes.'
        ],
        solution: sol,
        aide: 'Écris le résultat réduit, par exemple 4x^2-12x+9 (ou 4x²-12x+9).'
      };
    }
  });

  EM.gen.register({
    id: '3e-factoriser',
    titre: 'Factoriser une expression',
    chapitres: ['3e-calcul-algebrique'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, d, e, f, g, h, E, ansStr, ansTex, sol, guard = 0;
      if (niveau === 1) {
        var carre = rng.bool(0.35);
        var sgn = rng.sign();
        do {
          a = rng.int(1, 4); b = rng.nz(-7, 7);
          if (carre) { c = a; d = b; } else { c = rng.nz(-4, 4); d = rng.nz(-7, 7); }
          e = rng.nz(-4, 4); f = rng.nz(-7, 7);
          g = c + sgn * e; h = d + sgn * f;
        } while ((g === 0 || h === 0 || a * h === b * g || (!carre && c * b === a * d) || c * f === d * e || !prim(a, b) || !prim(c, d) || !prim(e, f)) && guard++ < 200);
        if (g === 0 || h === 0 || a * h === b * g) { a = 2; b = 1; c = 1; d = 3; e = 1; f = -1; sgn = 1; carre = false; g = 2; h = 2; }
        var A = plin(a, b);
        var swap = rng.bool();
        var first = carre ? A + '^2' : A + plin(c, d);
        var second = swap ? plin(e, f) + A : A + plin(e, f);
        E = first + (sgn > 0 ? ' + ' : ' - ') + second;
        ansStr = linStr(a, b) + '*' + linStr(g, h);
        ansTex = A + plin(g, h);
        sol = [
          (carre ? 'On écrit $' + A + '^2 = ' + A + A + '$. ' : '') + 'Le facteur commun est $' + A + '$.',
          '$E = ' + A + '\\left[' + plin(c, d) + (sgn > 0 ? ' + ' : ' - ') + plin(e, f) + '\\right]$',
          '$E = ' + A + '\\left(' + T.sum([{ c: c, v: 'x' }, { c: d }, { c: sgn * e, v: 'x' }, { c: sgn * f }]) + '\\right)$',
          '$E = ' + ansTex + '$.'
        ];
        if (sortirEntiers([a, b], [g, h])) sol.push('On peut aussi sortir le facteur entier : $E = ' + sortirEntiers([a, b], [g, h]) + '$.');
      } else if (niveau === 2) {
        var type = rng.pick(['diff', 'diffInv', 'plus', 'moins']);
        do { a = rng.int(1, 6); b = rng.int(1, 9); } while (!prim(a, b) || a === b);
        var ax = T.mono(a, 'x', true);
        var axsq = (a === 1 ? 'x^2' : a * a + 'x^2');
        var ident;
        if (type === 'diff') {
          E = T.poly([a * a, 0, -b * b]);
          ansTex = plin(a, -b) + plin(a, b); ansStr = linStr(a, -b) + '*' + linStr(a, b);
          ident = 'A^2 - B^2 = (A - B)(A + B)';
        } else if (type === 'diffInv') {
          E = T.sum([{ c: b * b }, { c: -a * a, v: 'x^2' }]);
          ansTex = '(' + T.sum([{ c: b }, { c: -a, v: 'x' }]) + ')(' + T.sum([{ c: b }, { c: a, v: 'x' }]) + ')';
          ansStr = linStr(-a, b) + '*' + linStr(a, b);
          ident = 'A^2 - B^2 = (A - B)(A + B)';
        } else if (type === 'plus') {
          E = T.poly([a * a, 2 * a * b, b * b]);
          ansTex = plin(a, b) + '^2'; ansStr = linStr(a, b) + '^2';
          ident = 'A^2 + 2AB + B^2 = (A + B)^2';
        } else {
          E = T.poly([a * a, -2 * a * b, b * b]);
          ansTex = plin(a, -b) + '^2'; ansStr = linStr(a, -b) + '^2';
          ident = 'A^2 - 2AB + B^2 = (A - B)^2';
        }
        sol = [
          'On reconnaît l\'identité remarquable $' + ident + '$.',
          type === 'diffInv'
            ? 'Ici $A = ' + b + '$ et $B = ' + ax + '$, car $' + b * b + ' = ' + b + '^2$ et $' + axsq + ' = ' + (a === 1 ? 'x^2' : '(' + ax + ')^2') + '$.'
            : 'Ici $A = ' + ax + '$ et $B = ' + b + '$, car $' + axsq + ' = ' + (a === 1 ? 'x^2' : '(' + ax + ')^2') + '$ et $' + b * b + ' = ' + b + '^2$' +
              (type === 'diff' ? '.' : ' ; on vérifie le double produit : $2 \\times ' + ax + ' \\times ' + b + ' = ' + T.mono(2 * a * b, 'x', true) + '$.'),
          '$E = ' + ansTex + '$.'
        ];
      } else {
        var v = rng.pick(['carres', 'k2', 'mixte']);
        if (v === 'carres') {
          do { a = rng.int(1, 4); b = rng.nz(-6, 6); c = rng.int(1, 4); d = rng.nz(-6, 6); } while ((a === c || b === d || b === -d || !prim(a, b) || !prim(c, d)) && guard++ < 200);
          if (a === c || b === d || b === -d) { a = 3; b = 1; c = 1; d = 2; }
          E = plin(a, b) + '^2 - ' + plin(c, d) + '^2';
          g = a - c; h = b - d;
          var g2 = a + c, h2 = b + d;
          ansTex = plin(g, h) + plin(g2, h2); ansStr = linStr(g, h) + '*' + linStr(g2, h2);
          sol = [
            'On reconnaît $A^2 - B^2 = (A - B)(A + B)$ avec $A = ' + lin(a, b) + '$ et $B = ' + lin(c, d) + '$.',
            '$E = \\left[' + plin(a, b) + ' - ' + plin(c, d) + '\\right]\\left[' + plin(a, b) + ' + ' + plin(c, d) + '\\right]$',
            '$E = \\left(' + T.sum([{ c: a, v: 'x' }, { c: b }, { c: -c, v: 'x' }, { c: -d }]) + '\\right)\\left(' + T.sum([{ c: a, v: 'x' }, { c: b }, { c: c, v: 'x' }, { c: d }]) + '\\right)$',
            '$E = ' + ansTex + '$.'
          ];
          if (sortirEntiers([g, h], [g2, h2])) sol.push('On peut aussi sortir le facteur entier : $E = ' + sortirEntiers([g, h], [g2, h2]) + '$.');
        } else if (v === 'k2') {
          var k;
          do { a = rng.int(1, 4); b = rng.nz(-7, 7); k = rng.int(1, 9); } while ((b === k || b === -k || !prim(a, b)) && guard++ < 200);
          E = plin(a, b) + '^2 - ' + k * k;
          ansTex = plin(a, b - k) + plin(a, b + k); ansStr = linStr(a, b - k) + '*' + linStr(a, b + k);
          sol = [
            '$' + k * k + ' = ' + k + '^2$ : on reconnaît $A^2 - B^2 = (A - B)(A + B)$ avec $A = ' + lin(a, b) + '$ et $B = ' + k + '$.',
            '$E = \\left(' + lin(a, b) + ' - ' + k + '\\right)\\left(' + lin(a, b) + ' + ' + k + '\\right)$',
            '$E = ' + ansTex + '$.'
          ];
          if (sortirEntiers([a, b - k], [a, b + k])) sol.push('On peut aussi sortir le facteur entier : $E = ' + sortirEntiers([a, b - k], [a, b + k]) + '$.');
        } else {
          var sg = rng.sign();
          do { a = rng.int(1, 4); b = rng.int(1, 7); c = rng.nz(-4, 4); d = rng.nz(-7, 7); g = a + sg * c; h = -b + sg * d; } while ((g === 0 || h === 0 || a * h === b * g || c * b === a * d || !prim(a, b) || !prim(c, d)) && guard++ < 200);
          if (g === 0 || h === 0) { a = 2; b = 3; c = 1; d = -1; sg = 1; g = 3; h = -4; }
          E = T.poly([a * a, 0, -b * b]) + (sg > 0 ? ' + ' : ' - ') + plin(a, b) + plin(c, d);
          ansTex = plin(a, b) + plin(g, h); ansStr = linStr(a, b) + '*' + linStr(g, h);
          sol = [
            'On factorise d\'abord $' + T.poly([a * a, 0, -b * b]) + ' = ' + plin(a, -b) + plin(a, b) + '$ (identité $A^2 - B^2$).',
            '$E = ' + plin(a, -b) + plin(a, b) + (sg > 0 ? ' + ' : ' - ') + plin(a, b) + plin(c, d) + '$ : le facteur commun est $' + plin(a, b) + '$.',
            '$E = ' + plin(a, b) + '\\left[' + plin(a, -b) + (sg > 0 ? ' + ' : ' - ') + plin(c, d) + '\\right] = ' + plin(a, b) + '\\left(' + T.sum([{ c: a, v: 'x' }, { c: -b }, { c: sg * c, v: 'x' }, { c: sg * d }]) + '\\right)$',
            '$E = ' + ansTex + '$.'
          ];
          if (sortirEntiers([a, b], [g, h])) sol.push('On peut aussi sortir le facteur entier : $E = ' + sortirEntiers([a, b], [g, h]) + '$.');
        }
      }
      return {
        enonce: 'Factoriser l\'expression : $$E = ' + E + '$$',
        questions: [{ label: '$E =$', type: 'expr', forme: 'produit', reponse: ansStr, reponseTex: ansTex }],
        indices: [
          niveau === 1 ? 'Cherche le facteur commun aux deux termes.' : 'Cherche une identité remarquable : $A^2 - B^2$, $A^2 + 2AB + B^2$ ou $A^2 - 2AB + B^2$.',
          'Vérifie ta réponse en la développant : tu dois retrouver $E$.'
        ],
        solution: sol,
        aide: 'Écris un produit, par exemple (2x+3)(x-1) ou (3x-2)^2.'
      };
    }
  });

  EM.gen.register({
    id: '3e-fraction-rationnelle',
    titre: 'Fraction rationnelle : condition d\'existence et simplification',
    chapitres: ['3e-calcul-algebrique'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, d, e, f, guard = 0, Ftex, simpNum, simpDen, forb, sol, fact;
      do {
        a = rng.int(1, 3); b = rng.nz(-6, 6); e = rng.int(1, 3); f = rng.nz(-6, 6);
        c = rng.int(1, 4); d = rng.nz(-6, 6);
      } while ((a * f === b * e || a * f === -b * e || c * f === d * e || c * b === a * d || !prim(a, b) || !prim(c, d) || !prim(e, f)) && guard++ < 300);
      if (niveau === 1) {
        var numF = rng.bool() ? plin(a, b) + plin(c, d) : plin(c, d) + plin(a, b);
        var denF = rng.bool() ? plin(a, b) + plin(e, f) : plin(e, f) + plin(a, b);
        Ftex = '\\dfrac{' + numF + '}{' + denF + '}';
        forb = [F(-b, a), F(-f, e)];
        simpNum = [c, d]; simpDen = [e, f];
        fact = null;
      } else {
        // numérateur a²x² - b² = (ax - b)(ax + b) ; dénominateur (ax - b)(ex + f)
        var bb = Math.abs(b);
        var denF2 = rng.bool() ? plin(a, -bb) + plin(e, f) : plin(e, f) + plin(a, -bb);
        Ftex = '\\dfrac{' + T.poly([a * a, 0, -bb * bb]) + '}{' + denF2 + '}';
        forb = [F(bb, a), F(-f, e)];
        if (forb[0].equals(forb[1])) { f = -f; forb[1] = F(-f, e); denF2 = plin(a, -bb) + plin(e, f); Ftex = '\\dfrac{' + T.poly([a * a, 0, -bb * bb]) + '}{' + denF2 + '}'; }
        simpNum = [a, bb]; simpDen = [e, f];
        fact = 'On factorise le numérateur : $' + T.poly([a * a, 0, -bb * bb]) + ' = ' + (a === 1 ? 'x^2' : '(' + a + 'x)^2') + ' - ' + bb + '^2 = ' + plin(a, -bb) + plin(a, bb) + '$.';
        b = -bb; // le facteur commun est (ax + b) avec b = -|b|
      }
      var x0, g2 = 0;
      do { x0 = rng.int(-3, 5); g2++; } while ((a * x0 + b === 0 || e * x0 + f === 0 || x0 === 0 && rng.bool(0.5)) && g2 < 50);
      if (a * x0 + b === 0 || e * x0 + f === 0) { x0 = 10; }
      var vN = simpNum[0] * x0 + simpNum[1], vD = simpDen[0] * x0 + simpDen[1];
      var val = F(vN, vD);
      var sorted = sortFr(forb);
      var simpTex = '\\dfrac{' + lin(simpNum[0], simpNum[1]) + '}{' + lin(simpDen[0], simpDen[1]) + '}';
      sol = [];
      if (fact) sol.push(fact);
      sol.push('$F(x)$ existe si et seulement si son dénominateur n\'est pas nul : $' + lin(a, b) + ' \\neq 0$ et $' + lin(e, f) + ' \\neq 0$.');
      sol.push(solveLinTex(a, b).replace(/\$$/, '') + '$ et ' + solveLinTex(e, f) + '.');
      sol.push('Donc $F(x)$ existe si et seulement si $x \\neq ' + sorted[0].tex() + '$ et $x \\neq ' + sorted[1].tex() + '$.');
      sol.push('Pour ces valeurs de $x$, on simplifie par $' + plin(a, b) + '$ : $F(x) = ' + simpTex + '$.');
      sol.push('$F(' + T.num(x0) + ') = \\dfrac{' + coefTimes(simpNum[0]) + T.par(x0) + T.signed(simpNum[1]) + '}{' + coefTimes(simpDen[0]) + T.par(x0) + T.signed(simpDen[1]) + '} = ' + (vD === 1 ? T.num(vN) : '\\dfrac{' + vN + '}{' + vD + '}' + (val.d === vD && val.n === vN ? '' : ' = ' + val.tex())) + '$.');
      return {
        enonce: 'On considère la fraction rationnelle $$F(x) = ' + Ftex + '$$' +
          '1) Déterminer les valeurs de $x$ pour lesquelles $F(x)$ n\'existe pas (valeurs interdites).<br>2) Simplifier $F(x)$ pour les valeurs de $x$ où elle existe.<br>3) Calculer $F(' + T.num(x0) + ')$.',
        questions: [
          { label: '1) Valeurs interdites :', type: 'set', reponse: sorted, reponseTex: T.set(sorted.map(function (q) { return q.tex(); })) },
          { label: '2) $F(x) =$', type: 'expr', reponse: '(' + linStr(simpNum[0], simpNum[1]) + ')/(' + linStr(simpDen[0], simpDen[1]) + ')', reponseTex: simpTex },
          { label: '3) $F(' + T.num(x0) + ') =$', type: 'number', reponse: val }
        ],
        indices: [
          'Une fraction n\'existe que si son dénominateur est différent de $0$ : résous « dénominateur $= 0$ ».',
          niveau === 2 ? 'Factorise le numérateur avec $A^2 - B^2 = (A - B)(A + B)$ pour faire apparaître un facteur commun.' : 'Simplifie par le facteur commun au numérateur et au dénominateur.',
          'Pour $F(' + T.num(x0) + ')$, utilise la forme simplifiée.'
        ],
        solution: sol,
        aide: 'Valeurs interdites séparées par « ; ». Pour F(x), écris une fraction comme (2x+1)/(x-3).'
      };
    }
  });

  /* ================================================================== */
  /* 3e — ÉQUATIONS ET INÉQUATIONS                                       */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-equation-produit',
    titre: 'Résoudre une équation produit',
    chapitres: ['3e-equations', '2l-equations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, d, e, f, g, h, eq, facteurs, sol = [], guard = 0;
      if (niveau === 1) {
        do { a = rng.pick([1, 1, 2, 3, -1, 4, 5]); b = rng.nz(-9, 9); c = rng.pick([1, 2, 3, -2, 5]); d = rng.nz(-9, 9); } while ((a * d === b * c || !prim(a, b) || !prim(c, d)) && guard++ < 100);
        eq = plin(a, b) + plin(c, d) + ' = 0';
        facteurs = [[a, b], [c, d]];
      } else if (niveau === 2) {
        var sgn = rng.sign();
        do {
          a = rng.int(1, 4); b = rng.nz(-7, 7); c = rng.nz(-4, 4); d = rng.nz(-7, 7); e = rng.nz(-4, 4); f = rng.nz(-7, 7);
          g = c + sgn * e; h = d + sgn * f;
        } while ((g === 0 || c * f === d * e || c * b === a * d || !prim(a, b) || !prim(c, d) || !prim(e, f)) && guard++ < 200);
        if (g === 0) { c = 2; d = 1; e = 1; f = 3; sgn = 1; g = 3; h = 4; }
        eq = plin(a, b) + plin(c, d) + (sgn > 0 ? ' + ' : ' - ') + plin(a, b) + plin(e, f) + ' = 0';
        facteurs = [[a, b], [g, h]];
        sol.push('On factorise le membre de gauche par $' + plin(a, b) + '$ : $' + plin(a, b) + '\\left[' + plin(c, d) + (sgn > 0 ? ' + ' : ' - ') + plin(e, f) + '\\right] = 0$, soit $' + plin(a, b) + plin(g, h) + ' = 0$.');
      } else {
        if (rng.bool()) {
          do { a = rng.int(1, 4); b = rng.nz(-6, 6); c = rng.int(1, 4); d = rng.nz(-6, 6); } while ((a === c || b === d || b === -d || !prim(a, b) || !prim(c, d)) && guard++ < 200);
          if (a === c || b === d || b === -d) { a = 3; b = 1; c = 1; d = 2; }
          eq = plin(a, b) + '^2 - ' + plin(c, d) + '^2 = 0';
          facteurs = [[a - c, b - d], [a + c, b + d]];
          sol.push('On factorise avec $A^2 - B^2 = (A - B)(A + B)$ : $\\left[' + plin(a, b) + ' - ' + plin(c, d) + '\\right]\\left[' + plin(a, b) + ' + ' + plin(c, d) + '\\right] = 0$, soit $' + plin(a - c, b - d) + plin(a + c, b + d) + ' = 0$.');
        } else {
          var k;
          do { a = rng.int(1, 4); b = rng.nz(-7, 7); k = rng.int(1, 9); } while ((b === k || b === -k || !prim(a, b)) && guard++ < 200);
          eq = plin(a, b) + '^2 = ' + k * k;
          facteurs = [[a, b - k], [a, b + k]];
          sol.push('$' + plin(a, b) + '^2 = ' + k * k + ' \\iff ' + plin(a, b) + '^2 - ' + k + '^2 = 0 \\iff \\left(' + lin(a, b) + ' - ' + k + '\\right)\\left(' + lin(a, b) + ' + ' + k + '\\right) = 0$, soit $' + plin(a, b - k) + plin(a, b + k) + ' = 0$.');
        }
      }
      var roots = sortFr(facteurs.map(function (p) { return F(-p[1], p[0]); }));
      sol.push('Un produit de facteurs est nul si et seulement si l\'un au moins de ses facteurs est nul.');
      sol.push(solveLinTex(facteurs[0][0], facteurs[0][1]) + ' ou ' + solveLinTex(facteurs[1][0], facteurs[1][1]) + '.');
      sol.push('$S = ' + T.set(roots.map(function (r) { return r.tex(); })) + '$');
      return {
        enonce: 'Résoudre dans $\\R$ l\'équation : $$' + eq + '$$',
        questions: [{ label: '$S =$', type: 'set', reponse: roots, reponseTex: T.set(roots.map(function (r) { return r.tex(); })) }],
        indices: [
          niveau === 1 ? 'Un produit est nul si et seulement si l\'un de ses facteurs est nul.' : 'Commence par factoriser le membre de gauche pour obtenir une équation produit.',
          'Résous ensuite chaque équation du premier degré obtenue.'
        ],
        solution: sol,
        aide: AIDE_SET
      };
    }
  });

  EM.gen.register({
    id: '3e-equation-quotient',
    titre: 'Résoudre une équation quotient',
    chapitres: ['3e-equations', '2l-equations'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, d, k, guard = 0, sol = [], r, S;
      c = rng.pick([1, 1, 2, 3, -1]); d = rng.nz(-8, 8);
      var vi = F(-d, c);
      if (niveau === 1) {
        if (rng.bool(0.2)) { k = rng.pick([2, 3, -1, -2]); a = k * c; b = k * d; }
        else { do { a = rng.pick([1, 2, 3, 4, -1, -2]); b = rng.nz(-9, 9); } while (a * d === b * c && guard++ < 50); }
        r = F(-b, a);
        S = r.equals(vi) ? [] : [r];
        sol.push('Condition d\'existence : $' + lin(c, d) + ' \\neq 0$, soit $x \\neq ' + vi.tex() + '$.');
        sol.push('Un quotient est nul si et seulement si son numérateur est nul et son dénominateur non nul.');
        sol.push(solveLinTex(a, b) + '.');
        sol.push(S.length ? 'Comme $' + r.tex() + ' \\neq ' + vi.tex() + '$, cette valeur est acceptée.' : 'Or $' + r.tex() + '$ est la valeur interdite : elle est rejetée.');
        var eq1 = '\\dfrac{' + lin(a, b) + '}{' + lin(c, d) + '} = 0';
        sol.push('$S = ' + (S.length ? T.set([r.tex()]) : '\\varnothing') + '$');
        return {
          enonce: 'On considère l\'équation $$' + eq1 + '$$ 1) Donner la valeur interdite.<br>2) Résoudre cette équation dans $\\R$.',
          questions: [
            { label: '1) Valeur interdite :', type: 'number', reponse: vi },
            { label: '2) $S =$', type: 'set', reponse: S, reponseTex: S.length ? T.set([r.tex()]) : '\\varnothing' }
          ],
          indices: ['Le dénominateur ne doit pas être nul.', 'Le quotient est nul lorsque le numérateur est nul (et le dénominateur non nul).'],
          solution: sol,
          aide: AIDE_SET
        };
      }
      do { a = rng.pick([1, 2, 3, 4, -1, -2, -3]); b = rng.nz(-9, 9); k = rng.nz(-4, 4); } while ((a - k * c === 0 || a * d === b * c) && guard++ < 100);
      if (a - k * c === 0) { a = k * c + 1; }
      r = F(k * d - b, a - k * c);
      S = r.equals(vi) ? [] : [r];
      var eq2 = '\\dfrac{' + lin(a, b) + '}{' + lin(c, d) + '} = ' + T.num(k);
      sol.push('Condition d\'existence : $' + lin(c, d) + ' \\neq 0$, soit $x \\neq ' + vi.tex() + '$.');
      sol.push('Pour $x \\neq ' + vi.tex() + '$, l\'équation équivaut à $' + lin(a, b) + ' = ' + T.num(k) + plin(c, d) + '$, soit $' + lin(a, b) + ' = ' + T.sum([{ c: k * c, v: 'x' }, { c: k * d }]) + '$.');
      sol.push('$' + T.sum([{ c: a, v: 'x' }, { c: -k * c, v: 'x' }]) + ' = ' + T.sum([{ c: k * d }, { c: -b }]) + '$, donc $' + T.mono(a - k * c, 'x', true) + ' = ' + T.num(k * d - b) + '$ et $x = ' + r.tex() + '$.');
      sol.push(S.length ? 'Cette valeur est différente de la valeur interdite : elle est acceptée.' : 'Cette valeur est la valeur interdite : elle est rejetée.');
      sol.push('$S = ' + (S.length ? T.set([r.tex()]) : '\\varnothing') + '$');
      return {
        enonce: 'On considère l\'équation $$' + eq2 + '$$ 1) Donner la valeur interdite.<br>2) Résoudre cette équation dans $\\R$.',
        questions: [
          { label: '1) Valeur interdite :', type: 'number', reponse: vi },
          { label: '2) $S =$', type: 'set', reponse: S, reponseTex: S.length ? T.set([r.tex()]) : '\\varnothing' }
        ],
        indices: ['Commence par la condition d\'existence : dénominateur non nul.', 'Pour $x$ différent de la valeur interdite, multiplie les deux membres par le dénominateur (produit en croix).'],
        solution: sol,
        aide: AIDE_SET
      };
    }
  });

  EM.gen.register({
    id: '3e-inequation',
    titre: 'Résoudre une inéquation du premier degré',
    chapitres: ['3e-equations', '2l-equations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var op = rng.pick(['<', '<=', '>', '>=']);
      var sol = [], ineq, I, guard = 0;
      /** résout Ax op B (A ≠ 0) et rédige */
      function finir(A, B, op0) {
        var r = F(B, A), op2 = A > 0 ? op0 : flip(op0);
        if (A !== 1) sol.push('On divise les deux membres par $' + T.num(A) + '$, ' + (A > 0 ? 'qui est positif : le sens de l\'inégalité ne change pas.' : 'qui est négatif : <b>le sens de l\'inégalité change</b>.') +
          ' $x ' + OPS[op2] + ' ' + r.tex() + '$.');
        return intervalOf(op2, r);
      }
      if (niveau === 1) {
        var a, b, c, d;
        do { a = rng.nz(-6, 6); b = rng.nz(-9, 9); c = rng.int(-5, 5); d = rng.nz(-9, 9); } while (a === c && guard++ < 50);
        if (a === c) c = a + 1;
        ineq = lin(a, b) + ' ' + OPS[op] + ' ' + lin(c, d);
        var A = a - c, B = d - b;
        sol.push('On regroupe les termes en $x$ dans le membre de gauche et les constantes dans le membre de droite : $' + T.sum([{ c: a, v: 'x' }, { c: -c, v: 'x' }]) + ' ' + OPS[op] + ' ' + T.sum([{ c: d }, { c: -b }]) + '$, soit $' + T.mono(A, 'x', true) + ' ' + OPS[op] + ' ' + T.num(B) + '$.');
        I = finir(A, B, op);
      } else if (niveau === 2) {
        var m, n, a1, b1, a2, b2, Lc, p1, p2, q1, q2;
        do {
          var mn = rng.sample([2, 3, 4, 5, 6], 2); m = mn[0]; n = mn[1];
          a1 = rng.nz(-4, 4); b1 = rng.nz(-7, 7); a2 = rng.nz(-4, 4); b2 = rng.nz(-7, 7);
          Lc = ar.lcm(m, n); p1 = Lc / m * a1; q1 = Lc / m * b1; p2 = Lc / n * a2; q2 = Lc / n * b2;
        } while (p1 === p2 && guard++ < 100);
        if (p1 === p2) { a1 = a1 + 1; p1 = Lc / m * a1; q1 = Lc / m * b1; }
        ineq = '\\dfrac{' + lin(a1, b1) + '}{' + m + '} ' + OPS[op] + ' \\dfrac{' + lin(a2, b2) + '}{' + n + '}';
        sol.push('On multiplie les deux membres par $' + Lc + '$ (multiple commun des dénominateurs), qui est positif : le sens ne change pas.');
        sol.push('$' + (Lc / m === 1 ? lin(a1, b1) : Lc / m + plin(a1, b1)) + ' ' + OPS[op] + ' ' + (Lc / n === 1 ? lin(a2, b2) : Lc / n + plin(a2, b2)) + '$, soit $' + lin(p1, q1) + ' ' + OPS[op] + ' ' + lin(p2, q2) + '$.');
        var A2 = p1 - p2, B2 = q2 - q1;
        sol.push('On regroupe : $' + T.sum([{ c: p1, v: 'x' }, { c: -p2, v: 'x' }]) + ' ' + OPS[op] + ' ' + T.sum([{ c: q2 }, { c: -q1 }]) + '$, soit $' + T.mono(A2, 'x', true) + ' ' + OPS[op] + ' ' + T.num(B2) + '$.');
        I = finir(A2, B2, op);
      } else {
        // système de deux inéquations : solution bornée
        var e1, e2, p, q;
        do {
          e1 = { a: rng.nz(-4, 4), b: rng.int(-6, 6), c: rng.int(-8, 8), strict: rng.bool() };
          e2 = { a: rng.nz(-4, 4), b: rng.int(-6, 6), c: rng.int(-8, 8), strict: rng.bool() };
          p = F(e1.c - e1.b, e1.a); q = F(e2.c - e2.b, e2.a);
        } while (p.cmp(q) >= 0 && guard++ < 200);
        if (p.cmp(q) >= 0) { e1 = { a: 2, b: 1, c: -3, strict: true }; e2 = { a: 1, b: -2, c: 1, strict: false }; p = F(-2); q = F(3); }
        // (1) doit donner x > p (ou ≥) ; (2) x < q (ou ≤)
        e1.op = e1.a > 0 ? (e1.strict ? '>' : '>=') : (e1.strict ? '<' : '<=');
        e2.op = e2.a > 0 ? (e2.strict ? '<' : '<=') : (e2.strict ? '>' : '>=');
        var eqs = rng.bool() ? [e1, e2] : [e2, e1];
        ineq = '\\begin{cases} ' + eqs.map(function (e) { return lin(e.a, e.b) + ' ' + OPS[e.op] + ' ' + T.num(e.c); }).join(' \\\\ ') + ' \\end{cases}';
        var parts = [];
        eqs.forEach(function (e, i) {
          var A = e.a, B = e.c - e.b, r = F(B, A), o2 = A > 0 ? e.op : flip(e.op);
          parts.push('Inéquation (' + (i + 1) + ') : $' + lin(e.a, e.b) + ' ' + OPS[e.op] + ' ' + T.num(e.c) + ' \\iff ' + T.mono(A, 'x', true) + ' ' + OPS[e.op] + ' ' + T.num(B) +
            (A === 1 ? '' : ' \\iff x ' + OPS[o2] + ' ' + r.tex()) + '$' + (A < 0 ? ' (division par un nombre négatif : le sens change)' : '') + ', d\'où $S_' + (i + 1) + ' = ' + itex(intervalOf(o2, r)) + '$.');
        });
        sol = parts;
        I = { a: p, b: q, ouvA: e1.strict, ouvB: e2.strict };
        sol.push('Les solutions du système sont les nombres qui vérifient les deux inéquations : $S = S_1 \\cap S_2$.');
      }
      sol.push('$S = ' + itex(I) + '$');
      return {
        enonce: (niveau === 3 ? 'Résoudre dans $\\R$ le système d\'inéquations : ' : 'Résoudre dans $\\R$ l\'inéquation : ') + '$$' + ineq + '$$Donner l\'ensemble des solutions sous forme d\'intervalle.',
        questions: [{ label: '$S =$', type: 'interval', reponse: I }],
        indices: [
          niveau === 2 ? 'Multiplie les deux membres par un multiple commun des dénominateurs pour les faire disparaître.' : 'Regroupe les termes en $x$ d\'un côté et les nombres de l\'autre.',
          'Si tu multiplies ou divises par un nombre négatif, change le sens de l\'inégalité.'
        ],
        solution: sol,
        aide: 'Écris un intervalle, par exemple ]-inf ; 3] ou [-2 ; 5[ ou ]1/2 ; +inf[.'
      };
    }
  });

  /* ================================================================== */
  /* 3e — SYSTÈMES                                                       */
  /* ================================================================== */
  function eqXY(a, b, c) { return tsum([{ c: a, v: 'x' }, { c: b, v: 'y' }]) + ' = ' + T.num(c); }
  function sysTex(s) {
    return '\\begin{cases} ' + eqXY(s.a1, s.b1, s.c1) + ' & (E_1) \\\\ ' + eqXY(s.a2, s.b2, s.c2) + ' & (E_2) \\end{cases}';
  }
  /** Résolution rédigée. Substitution si a1 = 1 ou b1 = 1 et methode = 'sub', sinon combinaison. */
  function stepsSysteme(s, methode) {
    var st = [], x0 = s.x0, y0 = s.y0;
    if (methode === 'sub' && (s.a1 === 1 || s.b1 === 1)) {
      if (s.a1 === 1) {
        var ex = tsum([{ c: s.c1 }, { c: -s.b1, v: 'y' }]);
        st.push('Méthode par substitution. Dans $(E_1)$, on exprime $x$ en fonction de $y$ : $x = ' + ex + '$.');
        st.push('On remplace $x$ par cette expression dans $(E_2)$ : $' + coefPre(s.a2) + '\\left(' + ex + '\\right)' + tmono(s.b2, 'y') + ' = ' + T.num(s.c2) + '$.');
        st.push('On développe : $' + tsum([{ c: s.a2 * s.c1 }, { c: -s.a2 * s.b1, v: 'y' }, { c: s.b2, v: 'y' }]) + ' = ' + T.num(s.c2) + '$, donc $' + tmono(s.b2 - s.a2 * s.b1, 'y', true) + ' = ' + T.num(s.c2 - s.a2 * s.c1) + '$, d\'où $y = ' + T.num(y0) + '$.');
        st.push('Alors $x = ' + T.num(s.c1) + (s.b1 > 0 ? ' - ' : ' + ') + coefTimes(Math.abs(s.b1)) + T.par(y0) + ' = ' + T.num(x0) + '$.');
      } else {
        var ey = tsum([{ c: s.c1 }, { c: -s.a1, v: 'x' }]);
        st.push('Méthode par substitution. Dans $(E_1)$, on exprime $y$ en fonction de $x$ : $y = ' + ey + '$.');
        st.push('On remplace $y$ par cette expression dans $(E_2)$ : $' + tmono(s.a2, 'x', true) + (s.b2 < 0 ? ' - ' : ' + ') + coefPre(Math.abs(s.b2)) + '\\left(' + ey + '\\right) = ' + T.num(s.c2) + '$.');
        st.push('On développe : $' + tsum([{ c: s.a2, v: 'x' }, { c: s.b2 * s.c1 }, { c: -s.b2 * s.a1, v: 'x' }]) + ' = ' + T.num(s.c2) + '$, donc $' + tmono(s.a2 - s.b2 * s.a1, 'x', true) + ' = ' + T.num(s.c2 - s.b2 * s.c1) + '$, d\'où $x = ' + T.num(x0) + '$.');
        st.push('Alors $y = ' + T.num(s.c1) + (s.a1 > 0 ? ' - ' : ' + ') + coefTimes(Math.abs(s.a1)) + T.par(x0) + ' = ' + T.num(y0) + '$.');
      }
    } else {
      var g = ar.gcd(s.b1, s.b2), m1 = Math.abs(s.b2) / g, m2 = Math.abs(s.b1) / g;
      var same = (s.b1 > 0) === (s.b2 > 0), sg = same ? -1 : 1;
      var A1 = s.a1 * m1, B1 = s.b1 * m1, C1 = s.c1 * m1, A2 = s.a2 * m2, B2 = s.b2 * m2, C2 = s.c2 * m2;
      var Dx = A1 + sg * A2, Cx = C1 + sg * C2;
      var mult = [];
      if (m1 !== 1) mult.push('$(E_1)$ par $' + T.num(m1) + '$');
      if (m2 !== 1) mult.push('$(E_2)$ par $' + T.num(m2) + '$');
      if (mult.length) {
        st.push('Méthode par combinaison : on élimine $y$. On multiplie ' + mult.join(' et ') + ' :');
        st.push('$$\\begin{cases} ' + eqXY(A1, B1, C1) + ' \\\\ ' + eqXY(A2, B2, C2) + ' \\end{cases}$$');
      } else {
        st.push('Méthode par combinaison : les coefficients de $y$ sont ' + (same ? 'égaux' : 'opposés') + ', on élimine $y$ directement.');
      }
      st.push('On ' + (same ? 'soustrait' : 'additionne') + ' membre à membre : $' + tmono(Dx, 'x', true) + ' = ' + T.num(Cx) + '$, donc $x = ' + T.num(x0) + '$.');
      st.push('On remplace $x$ par $' + T.num(x0) + '$ dans $(E_1)$ : $' + coefTimes(s.a1) + T.par(x0) + tmono(s.b1, 'y') + ' = ' + T.num(s.c1) + '$, soit $' + tmono(s.b1, 'y', true) + ' = ' + T.num(s.c1 - s.a1 * x0) + '$, donc $y = ' + T.num(y0) + '$.');
    }
    return st;
  }

  EM.gen.register({
    id: '3e-systeme-resoudre',
    titre: 'Résoudre un système de deux équations à deux inconnues',
    chapitres: ['3e-systemes', '2l-equations'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var s = {}, guard = 0;
      s.x0 = rng.int(-6, 6); s.y0 = rng.int(-6, 6);
      do {
        if (niveau === 1) {
          if (rng.bool()) { s.a1 = 1; s.b1 = rng.nz(-4, 4); } else { s.b1 = 1; s.a1 = rng.nz(-4, 4); }
          s.a2 = rng.nz(-5, 5); s.b2 = rng.nz(-5, 5);
        } else {
          s.a1 = rng.pick([2, 3, 4, 5, -2, -3]); s.b1 = rng.pick([2, 3, 4, 5, -2, -3]);
          s.a2 = rng.pick([2, 3, 4, 5, 6, -2, -3, -4]); s.b2 = rng.pick([2, 3, 4, 5, 6, -2, -3, -4]);
        }
      } while (s.a1 * s.b2 - s.a2 * s.b1 === 0 && guard++ < 100);
      if (s.a1 * s.b2 - s.a2 * s.b1 === 0) { s.a1 = 1; s.b1 = 2; s.a2 = 3; s.b2 = -1; }
      s.c1 = s.a1 * s.x0 + s.b1 * s.y0; s.c2 = s.a2 * s.x0 + s.b2 * s.y0;
      var st = stepsSysteme(s, niveau === 1 ? 'sub' : 'comb');
      st.push('Vérification dans $(E_2)$ : $' + coefTimes(s.a2) + T.par(s.x0) + (s.b2 < 0 ? ' - ' : ' + ') + coefTimes(Math.abs(s.b2)) + T.par(s.y0) + ' = ' + T.num(s.c2) + '$. ✓');
      st.push('$S = \\left\\{ ' + coord(s.x0, s.y0) + ' \\right\\}$');
      return {
        enonce: 'Résoudre dans $\\R \\times \\R$ le système : $$' + sysTex(s) + '$$',
        questions: [{ label: '$(x\\,;\\,y) =$', type: 'tuple', reponse: [s.x0, s.y0] }],
        indices: [
          niveau === 1 ? 'Dans $(E_1)$, une inconnue a pour coefficient $1$ : isole-la, puis remplace-la dans $(E_2)$ (substitution).' : 'Multiplie les équations par des nombres bien choisis pour que les coefficients de $y$ deviennent égaux ou opposés (combinaison).',
          'Vérifie ton couple dans les deux équations.'
        ],
        solution: st,
        aide: 'Écris le couple sous la forme (x ; y), par exemple (2 ; -3).'
      };
    }
  });

  EM.gen.register({
    id: '3e-systeme-probleme',
    titre: 'Mettre un problème en équations (système)',
    chapitres: ['3e-systemes', '2l-equations'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var s = {}, ctx, enonce, lx, ly, ux, uy, choix, guard = 0;
      if (niveau === 1) {
        ctx = rng.pick(['lutte', 'ferme', 'pieces']);
        if (ctx === 'lutte') {
          var p1 = rng.pick([3000, 5000]), p2 = rng.pick([1000, 1500, 2000]);
          s.x0 = 10 * rng.int(20, 80); s.y0 = 10 * rng.int(50, 200);
          s.a1 = 1; s.b1 = 1; s.c1 = s.x0 + s.y0; s.a2 = p1; s.b2 = p2; s.c2 = p1 * s.x0 + p2 * s.y0;
          enonce = 'Pour un grand combat de lutte à Dakar, on a vendu $' + T.num(s.c1) + '$ billets : des billets « tribune » à $' + T.num(p1) + '$ F CFA et des billets « pourtour » à $' +
            T.num(p2) + '$ F CFA. La recette totale est de $' + T.num(s.c2) + '$ F CFA.<br>On note $x$ le nombre de billets « tribune » et $y$ le nombre de billets « pourtour ».<br>Écrire un système traduisant la situation, puis déterminer $x$ et $y$.';
          lx = 'Billets « tribune » : $x =$'; ly = 'Billets « pourtour » : $y =$'; ux = 'billets'; uy = 'billets';
          choix = ['$x$ est le nombre de billets « tribune » et $y$ celui des billets « pourtour ».', 'Nombre total de billets : $x + y = ' + T.num(s.c1) + '$ ; recette : $' + T.num(p1) + 'x + ' + T.num(p2) + 'y = ' + T.num(s.c2) + '$.'];
        } else if (ctx === 'ferme') {
          s.x0 = rng.int(8, 40); s.y0 = rng.int(5, 30);
          s.a1 = 1; s.b1 = 1; s.c1 = s.x0 + s.y0; s.a2 = 2; s.b2 = 4; s.c2 = 2 * s.x0 + 4 * s.y0;
          enonce = 'Dans sa ferme près de Thiès, Ibrahima élève des poulets et des moutons. En comptant, il trouve $' + s.c1 + '$ têtes et $' + s.c2 + '$ pattes.<br>On note $x$ le nombre de poulets et $y$ le nombre de moutons.<br>Écrire un système traduisant la situation, puis déterminer $x$ et $y$.';
          lx = 'Poulets : $x =$'; ly = 'Moutons : $y =$'; ux = ''; uy = '';
          choix = ['Chaque animal a une tête : $x + y = ' + s.c1 + '$.', 'Un poulet a $2$ pattes et un mouton $4$ : $2x + 4y = ' + s.c2 + '$.'];
        } else {
          s.x0 = rng.int(5, 40); s.y0 = rng.int(4, 30);
          s.a1 = 1; s.b1 = 1; s.c1 = s.x0 + s.y0; s.a2 = 100; s.b2 = 250; s.c2 = 100 * s.x0 + 250 * s.y0;
          enonce = 'Khady a dans sa tirelire $' + s.c1 + '$ pièces : des pièces de $100$ F CFA et des pièces de $250$ F CFA. Elle a en tout $' + T.num(s.c2) + '$ F CFA.<br>On note $x$ le nombre de pièces de $100$ F et $y$ le nombre de pièces de $250$ F.<br>Écrire un système traduisant la situation, puis déterminer $x$ et $y$.';
          lx = 'Pièces de 100 F : $x =$'; ly = 'Pièces de 250 F : $y =$'; ux = ''; uy = '';
          choix = ['Nombre de pièces : $x + y = ' + s.c1 + '$.', 'Somme d\'argent : $100x + 250y = ' + T.num(s.c2) + '$.'];
        }
      } else {
        ctx = rng.pick(['marche', 'location']);
        if (ctx === 'marche') {
          s.x0 = rng.pick([300, 400, 500, 600, 750]); s.y0 = rng.pick([250, 350, 400, 450]);
          do { s.a1 = rng.int(1, 5); s.b1 = rng.int(1, 5); s.a2 = rng.int(1, 5); s.b2 = rng.int(1, 5); } while (s.a1 * s.b2 - s.a2 * s.b1 === 0 && guard++ < 100);
          if (s.a1 * s.b2 - s.a2 * s.b1 === 0) { s.a1 = 3; s.b1 = 2; s.a2 = 1; s.b2 = 4; }
          s.c1 = s.a1 * s.x0 + s.b1 * s.y0; s.c2 = s.a2 * s.x0 + s.b2 * s.y0;
          enonce = 'Au marché de Ziguinchor, Awa achète $' + s.a1 + '$ kg de mangues et $' + s.b1 + '$ kg d\'oranges ; elle paie $' + T.num(s.c1) + '$ F CFA. Fatou achète $' + s.a2 + '$ kg de mangues et $' +
            s.b2 + '$ kg d\'oranges ; elle paie $' + T.num(s.c2) + '$ F CFA.<br>On note $x$ le prix d\'un kilogramme de mangues et $y$ celui d\'un kilogramme d\'oranges (en F CFA).<br>Écrire un système traduisant la situation, puis calculer $x$ et $y$.';
          lx = 'Prix du kg de mangues : $x =$'; ly = 'Prix du kg d\'oranges : $y =$'; ux = 'F CFA'; uy = 'F CFA';
          choix = ['Achat d\'Awa : $' + eqXY(s.a1, s.b1, s.c1) + '$.', 'Achat de Fatou : $' + eqXY(s.a2, s.b2, s.c2) + '$.'];
        } else {
          s.x0 = rng.pick([10000, 12500, 15000]); s.y0 = rng.pick([100, 150, 200, 250]);
          do { s.a1 = rng.int(1, 4); s.b1 = 10 * rng.int(3, 10); s.a2 = rng.int(1, 4); s.b2 = 10 * rng.int(3, 10); } while ((s.a1 * s.b2 - s.a2 * s.b1 === 0 || s.a1 === s.a2) && guard++ < 100);
          if (s.a1 * s.b2 - s.a2 * s.b1 === 0) { s.a1 = 2; s.b1 = 50; s.a2 = 1; s.b2 = 80; }
          s.c1 = s.a1 * s.x0 + s.b1 * s.y0; s.c2 = s.a2 * s.x0 + s.b2 * s.y0;
          enonce = 'Pour le baptême de son fils à Mbour, Mamadou loue $' + s.a1 + '$ bâche' + (s.a1 > 1 ? 's' : '') + ' et $' + s.b1 + '$ chaises pour $' + T.num(s.c1) + '$ F CFA. Chez le même loueur, son voisin Cheikh loue $' +
            s.a2 + '$ bâche' + (s.a2 > 1 ? 's' : '') + ' et $' + s.b2 + '$ chaises pour $' + T.num(s.c2) + '$ F CFA.<br>On note $x$ le prix de location d\'une bâche et $y$ celui d\'une chaise (en F CFA).<br>Écrire un système traduisant la situation, puis calculer $x$ et $y$.';
          lx = 'Prix d\'une bâche : $x =$'; ly = 'Prix d\'une chaise : $y =$'; ux = 'F CFA'; uy = 'F CFA';
          choix = ['Location de Mamadou : $' + eqXY(s.a1, s.b1, s.c1) + '$.', 'Location de Cheikh : $' + eqXY(s.a2, s.b2, s.c2) + '$.'];
        }
      }
      var st = ['Mise en équations. ' + choix.join(' ')];
      st.push('On obtient le système $$' + sysTex(s) + '$$');
      st = st.concat(stepsSysteme(s, niveau === 1 ? 'sub' : 'comb'));
      st.push('Vérification dans $(E_2)$ : $' + coefTimes(s.a2) + T.par(s.x0) + ' + ' + coefTimes(s.b2) + T.par(s.y0) + ' = ' + T.num(s.c2) + '$. ✓');
      st.push('Conclusion : $x = ' + T.num(s.x0) + '$ et $y = ' + T.num(s.y0) + '$.');
      return {
        enonce: enonce,
        questions: [
          { label: lx, type: 'number', reponse: s.x0, unite: ux },
          { label: ly, type: 'number', reponse: s.y0, unite: uy }
        ],
        indices: [
          'Traduis chaque phrase de l\'énoncé par une équation en $x$ et $y$.',
          niveau === 1 ? 'Dans l\'équation $x + y = \\ldots$, exprime $x$ en fonction de $y$ et remplace dans l\'autre équation.' : 'Utilise la méthode par combinaison pour éliminer une inconnue.'
        ],
        solution: st
      };
    }
  });

  EM.gen.register({
    id: '3e-systeme-inequations',
    titre: 'Système d\'inéquations à deux inconnues : tester des points',
    chapitres: ['3e-systemes', '2l-equations'],
    niveaux: 1,
    examen: false,
    gen: function (rng) {
      var I1, I2, sols, non, guard = 0;
      function sat(I, x, y) {
        var v = I.a * x + I.b * y;
        return I.op === '<' ? v < I.k : I.op === '<=' ? v <= I.k : I.op === '>' ? v > I.k : v >= I.k;
      }
      function mk() {
        var a, b;
        do { a = rng.int(-2, 2); b = rng.int(-2, 2); } while (a === 0 && b === 0);
        if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; }
        return { a: a, b: b, k: rng.int(-3, 5), op: rng.pick(['<', '<=', '>', '>=']) };
      }
      do {
        I1 = mk(); I2 = mk();
        sols = []; non = [];
        if (I1.a * I2.b - I2.a * I1.b !== 0) {
          for (var x = -4; x <= 4; x++) for (var y = -4; y <= 4; y++) {
            if (I1.a * x + I1.b * y === I1.k || I2.a * x + I2.b * y === I2.k) continue;
            (sat(I1, x, y) && sat(I2, x, y) ? sols : non).push([x, y]);
          }
        }
      } while ((sols.length < 1 || non.length < 3) && guard++ < 200);
      if (sols.length < 1 || non.length < 3) {
        I1 = { a: 1, b: 1, k: 4, op: '<=' }; I2 = { a: 1, b: -1, k: 1, op: '>' };
        sols = [[2, 0], [1, -1], [3, 0]]; non = [[0, 0], [3, 3], [-2, 1], [0, 4]];
      }
      var S = rng.pick(sols), autres = rng.sample(non, 3);
      var pts = rng.shuffle([S].concat(autres));
      var noms = ['A', 'B', 'C', 'D'];
      var bonne = pts.indexOf(S);
      function itexL(I) { return T.sum([{ c: I.a, v: 'x' }, { c: I.b, v: 'y' }]) + ' ' + OPS[I.op] + ' ' + T.num(I.k); }
      var fg = EM.fig.create({ w: 260, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, title: 'Droites frontières et points' });
      fg.axes();
      [I1, I2].forEach(function (I, i) {
        var o = i === 0 ? { accent: true } : { dash: true };
        if (I.b !== 0) fg.line([-5, (I.k + 5 * I.a) / I.b], [5, (I.k - 5 * I.a) / I.b], o);
        else fg.line([I.k / I.a, 0], [I.k / I.a, 1], o);
      });
      pts.forEach(function (p, i) { fg.point(p, noms[i], 'ne'); });
      var sol = [
        'Un couple $(x\\,;\\,y)$ est solution du système s\'il vérifie <b>les deux</b> inéquations. Les droites frontières $(D_1) : ' + T.sum([{ c: I1.a, v: 'x' }, { c: I1.b, v: 'y' }]) + ' = ' + T.num(I1.k) + '$ et $(D_2) : ' +
          T.sum([{ c: I2.a, v: 'x' }, { c: I2.b, v: 'y' }]) + ' = ' + T.num(I2.k) + '$ partagent le plan en demi-plans ; la solution est l\'intersection de deux demi-plans.'
      ];
      pts.forEach(function (p, i) {
        var v1 = I1.a * p[0] + I1.b * p[1], v2 = I2.a * p[0] + I2.b * p[1];
        var ok1 = sat(I1, p[0], p[1]), ok2 = sat(I2, p[0], p[1]);
        sol.push('$' + noms[i] + coord(p[0], p[1]) + '$ : $(I_1)$ donne $' + T.num(v1) + ' ' + OPS[I1.op] + ' ' + T.num(I1.k) + '$ (' + (ok1 ? 'vrai' : 'faux') + ') ; $(I_2)$ donne $' +
          T.num(v2) + ' ' + OPS[I2.op] + ' ' + T.num(I2.k) + '$ (' + (ok2 ? 'vrai' : 'faux') + '). ' + (ok1 && ok2 ? '<b>Solution.</b>' : 'Pas solution.'));
      });
      return {
        enonce: 'On considère le système d\'inéquations $$\\begin{cases} ' + itexL(I1) + ' & (I_1) \\\\ ' + itexL(I2) + ' & (I_2) \\end{cases}$$' +
          'La figure montre les droites frontières $(D_1)$ (trait plein) et $(D_2)$ (pointillés) dans un repère orthonormal $(O, I, J)$.<br>Parmi les points $A$, $B$, $C$, $D$, lequel appartient à la région solution du système ?',
        figure: fg.svg(),
        questions: [{ label: 'Le point solution est :', type: 'choice', choix: pts.map(function (p, i) { return '$' + noms[i] + coord(p[0], p[1]) + '$'; }), reponse: bonne }],
        indices: ['Remplace $x$ et $y$ par les coordonnées du point dans chaque inéquation.', 'Un point solution doit vérifier les deux inéquations à la fois.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 3e — APPLICATIONS AFFINES                                           */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-affine-deux-images',
    titre: 'Déterminer une application affine à partir de deux images',
    chapitres: ['3e-applications-affines', '2l-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, x1, x2;
      if (niveau === 1) {
        a = F(rng.nz(-5, 5)); b = rng.int(-9, 9);
        var xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5], 2); x1 = xs[0]; x2 = xs[1];
      } else {
        var q = rng.pick([2, 3, 4]), p;
        do { p = rng.nz(-7, 7); } while (ar.gcd(p, q) !== 1);
        a = F(p, q); b = rng.int(-6, 6);
        var rs = rng.sample([-3, -2, -1, 0, 1, 2, 3], 2); x1 = q * rs[0]; x2 = q * rs[1];
      }
      var y1 = a.mul(x1).add(b), y2 = a.mul(x2).add(b);
      var dy = y2.sub(y1), dx = x2 - x1, ax1 = a.mul(x1);
      var fx = lin(a, b);
      var sol = [
        '$f$ est une application affine, donc $f(x) = ax + b$, où $a$ et $b$ sont des réels.',
        'Coefficient : $a = \\dfrac{f(' + T.num(x2) + ') - f(' + T.num(x1) + ')}{' + T.num(x2) + ' - ' + T.par(x1) + '} = \\dfrac{' + T.num(y2) + ' - ' + T.par(y1) + '}{' + T.num(dx) + '} = \\dfrac{' + T.num(dy) + '}{' + T.num(dx) + '}' +
          (dx > 0 && a.n === dy.n && a.d === dx ? '' : ' = ' + a.tex()) + '$.',
        'Comme $f(' + T.num(x1) + ') = ' + T.num(y1) + '$ : $' + a.tex() + ' \\times ' + T.par(x1) + ' + b = ' + T.num(y1) + '$, soit $' + T.num(ax1) + ' + b = ' + T.num(y1) + '$, donc $b = ' + T.num(y1) + ' - ' + T.par(ax1) + ' = ' + T.num(b) + '$.',
        'Donc $f(x) = ' + fx + '$.'
      ];
      var qs = [{ label: '$f(x) =$', type: 'expr', reponse: ps(a) + '*x+' + ps(b), reponseTex: fx }];
      var enonce = 'Soit $f$ l\'application affine telle que $f(' + T.num(x1) + ') = ' + T.num(y1) + '$ et $f(' + T.num(x2) + ') = ' + T.num(y2) + '$.<br>1) Déterminer l\'expression de $f(x)$.';
      if (niveau === 1) {
        var x3 = rng.intExcept(-6, 6, [x1, x2]);
        var y3 = a.mul(x3).add(b);
        enonce += '<br>2) Calculer l\'image de $' + T.num(x3) + '$ par $f$.';
        qs.push({ label: '2) $f(' + T.num(x3) + ') =$', type: 'number', reponse: y3 });
        sol.push('$f(' + T.num(x3) + ') = ' + coefTimes(a.n) + T.par(x3) + T.signed(b) + ' = ' + T.num(y3) + '$.');
      } else {
        var k = rng.int(-8, 8);
        var ant = F(k).sub(b).div(a);
        var sens = a.n > 0 ? 'croissante' : 'décroissante';
        var ch = rng.shuffle(['croissante', 'décroissante', 'constante']);
        enonce += '<br>2) Déterminer l\'antécédent de $' + T.num(k) + '$ par $f$.<br>3) Préciser le sens de variation de $f$.';
        qs.push({ label: '2) Antécédent de $' + T.num(k) + '$ :', type: 'number', reponse: ant });
        qs.push({ label: '3) $f$ est', type: 'choice', choix: ch, reponse: ch.indexOf(sens) });
        sol.push('Antécédent de $' + T.num(k) + '$ : on résout $' + fx + ' = ' + T.num(k) + '$, soit $' + T.mono(a, 'x', true) + ' = ' + T.num(F(k).sub(b)) + '$, donc $x = ' + T.num(F(k).sub(b)) + ' \\times ' + T.par(a.inv()) + ' = ' + ant.tex() + '$.');
        sol.push('Le coefficient $a = ' + a.tex() + '$ est ' + (a.n > 0 ? 'positif' : 'négatif') + ' : $f$ est ' + sens + ' sur $\\R$.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Pour une application affine $f(x) = ax + b$ : $a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$.',
          'Une fois $a$ trouvé, remplace dans $f(x_1) = ax_1 + b$ pour obtenir $b$.'
        ],
        solution: sol,
        aide: 'Pour f(x), écris par exemple 3x-2 ou -1/2x+4.'
      };
    }
  });

  EM.gen.register({
    id: '3e-affine-tarifs',
    titre: 'Comparer deux tarifs (applications linéaire et affine)',
    chapitres: ['3e-applications-affines', '2l-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(['sport', 'cyber', 'chaises', 'moto']);
      var C = {
        sport: { lieu: 'Une salle de sport de Dakar propose deux formules mensuelles.', u: 'séance', us: 'séances', de: 'de séances', x: 'le nombre de séances dans le mois', p: [1500, 2000, 2500], q: [500, 1000], n: [4, 12], pas: 1 },
        cyber: { lieu: 'Un cybercafé de Thiès propose deux formules mensuelles.', u: 'heure de connexion', us: 'heures', de: 'd\'heures', x: 'le nombre d\'heures de connexion dans le mois', p: [300, 400, 500], q: [100, 150, 200], n: [10, 30], pas: 1 },
        chaises: { lieu: 'Pour une cérémonie familiale à Kaolack, Aminata compare deux loueurs de chaises.', u: 'chaise', us: 'chaises', de: 'de chaises', x: 'le nombre de chaises louées', p: [200, 250, 300], q: [100, 150], n: [4, 12], pas: 10 },
        moto: { lieu: 'À Ziguinchor, deux compagnies de taxi-moto proposent des formules mensuelles pour aller au travail.', u: 'course', us: 'courses', de: 'de courses', x: 'le nombre de courses dans le mois', p: [400, 500, 600], q: [200, 250, 300], n: [10, 30], pas: 1 }
      }[ctx];
      var p, q, guard = 0;
      do { p = rng.pick(C.p); q = rng.pick(C.q); } while (q >= p && guard++ < 50);
      var nStar = C.pas * rng.int(C.n[0], C.n[1]);
      var S1 = niveau === 1 ? 0 : (p - q) * C.pas * rng.int(1, 3);
      var S2 = S1 + (p - q) * nStar;
      // formule A : S1 + p x ; formule B : S2 + q x
      var fA = function (x) { return S1 + p * x; }, fB = function (x) { return S2 + q * x; };
      var n1 = C.pas * rng.int(Math.max(1, C.n[0] - 2), C.n[1] + 4);
      var n2;
      do { n2 = C.pas * rng.int(Math.max(1, C.n[0] - 3), C.n[1] + 6); } while (n2 === nStar && guard++ < 100);
      if (n2 === nStar) n2 = nStar + C.pas;
      var txtA = niveau === 1 ? 'Formule A : $' + T.num(p) + '$ F CFA par ' + C.u + '.' : 'Formule A : une inscription de $' + T.num(S1) + '$ F CFA, plus $' + T.num(p) + '$ F CFA par ' + C.u + '.';
      var txtB = 'Formule B : un abonnement de $' + T.num(S2) + '$ F CFA, plus $' + T.num(q) + '$ F CFA par ' + C.u + '.';
      var mieux = fA(n2) < fB(n2) ? 'A' : 'B';
      var ch = rng.shuffle(['La formule A', 'La formule B']);
      var exprA = grp(lin(p, S1)), exprB = grp(lin(q, S2));
      var qs = [], enonce = C.lieu + '<br>' + txtA + '<br>' + txtB + '<br>On note $x$ ' + C.x + ', $f(x)$ le prix payé avec la formule A et $g(x)$ le prix payé avec la formule B.<br>';
      var sol = ['Formule A : $f(x) = ' + exprA + '$ ' + (S1 === 0 ? '($f$ est une application linéaire).' : '($f$ est une application affine).') + ' Formule B : $g(x) = ' + exprB + '$ ($g$ est une application affine).'];
      if (niveau === 1) {
        enonce += '1) Calculer le prix payé avec chaque formule pour $' + n1 + '$ ' + C.us + '.<br>2) Pour quel nombre ' + C.de + ' les deux formules donnent-elles le même prix ?<br>3) Quelle formule est la plus avantageuse pour $' + n2 + '$ ' + C.us + ' ?';
        qs.push({ label: '1) Formule A : $f(' + n1 + ') =$', type: 'number', reponse: fA(n1), unite: 'F CFA' });
        qs.push({ label: '1) Formule B : $g(' + n1 + ') =$', type: 'number', reponse: fB(n1), unite: 'F CFA' });
        sol.push('$f(' + n1 + ') = ' + T.num(p) + ' \\times ' + n1 + ' = ' + T.num(fA(n1)) + '$ F CFA et $g(' + n1 + ') = ' + T.num(S2) + ' + ' + T.num(q) + ' \\times ' + n1 + ' = ' + T.num(fB(n1)) + '$ F CFA.');
      } else {
        enonce += '1) Exprimer $g(x)$ en fonction de $x$.<br>2) Pour quel nombre ' + C.de + ' les deux formules donnent-elles le même prix ?<br>3) Quelle formule est la plus avantageuse pour $' + n2 + '$ ' + C.us + ' ?';
        qs.push({ label: '1) $g(x) =$', type: 'expr', reponse: q + '*x+' + S2, reponseTex: exprB, domaine: [0, 30] });
      }
      qs.push({ label: '2) Nombre ' + C.de + ' :', type: 'number', reponse: nStar });
      qs.push({ label: '3) La plus avantageuse :', type: 'choice', choix: ch, reponse: ch.indexOf('La formule ' + mieux) });
      sol.push('Même prix : $f(x) = g(x) \\iff ' + exprA + ' = ' + exprB + ' \\iff ' + grp(T.mono(p - q, 'x', true)) + ' = ' + T.num(S2 - S1) + ' \\iff x = ' + nStar + '$.');
      sol.push('Pour $' + n2 + '$ ' + C.us + ' : $f(' + n2 + ') = ' + T.num(fA(n2)) + '$ F CFA et $g(' + n2 + ') = ' + T.num(fB(n2)) + '$ F CFA. La formule ' + mieux + ' est la plus avantageuse.');
      sol.push('Au-delà de $' + nStar + '$ ' + C.us + ', la formule B (abonnement) devient la moins chère ; en dessous, c\'est la formule A.');
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Écris le prix payé en fonction de $x$ pour chaque formule : c\'est une application linéaire ou affine.',
          'Le même prix correspond à la solution de l\'équation $f(x) = g(x)$.'
        ],
        solution: sol,
        aide: 'Les prix s\'écrivent sans espace ni unité : 12500.'
      };
    }
  });

  EM.gen.register({
    id: '3e-affine-graphique',
    titre: 'Lire graphiquement une application affine',
    chapitres: ['3e-applications-affines', '2l-fonctions'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var p, q, b, guard = 0;
      do {
        if (niveau === 1) { q = 1; p = rng.nz(-3, 3); } else { q = rng.pick([2, 3]); do { p = rng.nz(-4, 4); } while (ar.gcd(p, q) !== 1); }
        b = niveau === 1 ? rng.int(-3, 3) : rng.nz(-3, 3);
      } while ((Math.abs(b + p) > 4 || (niveau === 1 && Math.abs(2 * p + b) > 5)) && guard++ < 100);
      var a = F(p, q);
      var P1 = [0, b], P2 = [q, b + p];
      var fg = EM.fig.create({ w: 260, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, title: 'Droite représentant f' });
      fg.axes();
      fg.curve(function (x) { return a.value() * x + b; }, { accent: true });
      fg.point(P1, '', 'ne').point(P2, '', 'ne');
      fg.seg(P1, [P2[0], P1[1]], { dash: true }).seg([P2[0], P1[1]], P2, { dash: true });
      var fx = lin(a, b);
      var qs = [{ label: '1) $f(x) =$', type: 'expr', reponse: ps(a) + '*x+' + ps(b), reponseTex: fx }];
      var sol = [
        'La droite coupe l\'axe des ordonnées au point de coordonnées $' + coord(0, b) + '$ : l\'ordonnée à l\'origine est $b = f(0) = ' + b + '$.',
        'Quand on avance de $' + q + '$ ' + (q > 1 ? 'unités' : 'unité') + ' vers la droite (de $' + coord(0, b) + '$ à $' + coord(q, b + p) + '$), on ' + (p > 0 ? 'monte' : 'descend') + ' de $' + Math.abs(p) + '$ : $a = \\dfrac{' + p + '}{' + q + '}' + (q === 1 ? ' = ' + p : '') + '$.',
        'Donc $f(x) = ' + fx + '$.'
      ];
      var enonce = 'La droite tracée dans le repère orthonormal $(O, I, J)$ représente une application affine $f$. Les points marqués ont des coordonnées entières.<br>1) Déterminer l\'expression de $f(x)$ par lecture graphique.';
      if (niveau === 1) {
        var x3 = rng.intExcept(-8, 8, [0, 1]);
        enonce += '<br>2) Calculer $f(' + x3 + ')$.';
        qs.push({ label: '2) $f(' + x3 + ') =$', type: 'number', reponse: p * x3 + b });
        sol.push('$f(' + x3 + ') = ' + coefTimes(p) + T.par(x3) + T.signed(b) + ' = ' + (p * x3 + b) + '$.');
      } else {
        var r = F(-b).div(a);
        enonce += '<br>2) Calculer l\'abscisse du point d\'intersection de la droite avec l\'axe des abscisses.';
        qs.push({ label: '2) $x =$', type: 'number', reponse: r });
        sol.push('On résout $f(x) = 0$ : $' + fx + ' = 0 \\iff ' + T.mono(a, 'x', true) + ' = ' + T.num(-b) + ' \\iff x = ' + T.num(-b) + ' \\times ' + T.par(a.inv()) + ' = ' + r.tex() + '$.');
      }
      return {
        enonce: enonce,
        figure: fg.svg(),
        questions: qs,
        indices: ['$b$ est l\'ordonnée du point où la droite coupe l\'axe des ordonnées.', '$a = \\dfrac{\\text{déplacement vertical}}{\\text{déplacement horizontal}}$ entre deux points de la droite.'],
        solution: sol,
        aide: 'Pour f(x), écris par exemple 2x-1 ou -2/3x+1.'
      };
    }
  });

  /* ================================================================== */
  /* 3e / 2nde L — STATISTIQUES                                          */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-stats-serie',
    titre: 'Série statistique : effectif, mode, moyenne, médiane',
    chapitres: ['3e-statistiques', '2l-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick([
        { t: 'Le tableau donne les notes sur 20 obtenues par les élèves d\'une classe de 3e de Pikine au dernier devoir de mathématiques.', c: 'Note', vals: [6, 8, 10, 12, 14, 16].map(function (v) { return v + rng.pick([-1, 0]); }) },
        { t: 'Une enquête a relevé le nombre d\'enfants par famille dans un quartier de Kaolack.', c: 'Nombre d\'enfants', vals: [1, 2, 3, 4, 5, 6] },
        { t: 'Le tableau donne le nombre de buts marqués par match par une équipe de navétanes pendant la saison.', c: 'Nombre de buts', vals: [0, 1, 2, 3, 4, 5] },
        { t: 'Un commerçant du marché Sandaga a noté les pointures des chaussures vendues dans la journée.', c: 'Pointure', vals: [38, 39, 40, 41, 42, 43] }
      ]);
      var vals = ctx.vals, k = vals.length, eff, N, mx, guard = 0;
      do {
        eff = vals.map(function () { return rng.int(1, 9); });
        N = EM.util.sum(eff);
        mx = Math.max.apply(null, eff);
        if (N % 2 === 0) {
          var j = rng.int(0, k - 1);
          if (eff[j] < mx) { eff[j]++; N++; } else { eff[j]--; N--; }
          mx = Math.max.apply(null, eff);
        }
      } while ((eff.filter(function (e) { return e === mx; }).length !== 1 || N % 2 === 0 || eff.indexOf(0) >= 0) && guard++ < 200);
      var mode = vals[eff.indexOf(mx)];
      var ecc = [], cum = 0;
      eff.forEach(function (e) { cum += e; ecc.push(cum); });
      var S = 0; vals.forEach(function (v, i) { S += v * eff[i]; });
      var moy = F(S, N), exact = ar.isInt(moy.value() * 100);
      var moyQ = { label: '3) Moyenne' + (exact ? '' : ' (arrondie au centième)') + ' :', type: 'number', reponse: exact ? moy.value() : ar.round(moy.value(), 2) };
      if (!exact) moyQ.tol = 0.006;
      var pos = (N + 1) / 2, iMed = 0;
      while (ecc[iMed] < pos) iMed++;
      var tab = tableau([[ctx.c].concat(vals.map(String)), ['Effectif'].concat(eff.map(String))]);
      var solMoy = 'Moyenne : $\\bar{x} = \\dfrac{' + vals.map(function (v, i) { return v + ' \\times ' + eff[i]; }).join(' + ') + '}{' + N + '} = \\dfrac{' + T.num(S) + '}{' + N + '}' +
        (exact ? ' = ' + T.num(moy.value()) : ' \\approx ' + T.num(ar.round(moy.value(), 2))) + '$.';
      var qs, sol, enonce = ctx.t + tab;
      if (niveau === 1) {
        enonce += '1) Calculer l\'effectif total.<br>2) Donner le mode de la série.<br>3) Calculer la moyenne de la série' + (exact ? '.' : ' (arrondir au centième).');
        qs = [
          { label: '1) Effectif total :', type: 'number', reponse: N },
          { label: '2) Mode :', type: 'number', reponse: mode },
          moyQ
        ];
        sol = [
          'Effectif total : $N = ' + eff.join(' + ') + ' = ' + N + '$.',
          'Le mode est la valeur qui a le plus grand effectif ($' + mx + '$) : le mode est $' + mode + '$.',
          solMoy
        ];
      } else {
        var jE = rng.int(1, k - 2);
        enonce += '1) Calculer l\'effectif cumulé croissant de la valeur $' + vals[jE] + '$.<br>2) Déterminer la médiane de la série.<br>3) Calculer la moyenne de la série' + (exact ? '.' : ' (arrondir au centième).');
        qs = [
          { label: '1) Effectif cumulé croissant de $' + vals[jE] + '$ :', type: 'number', reponse: ecc[jE] },
          { label: '2) Médiane :', type: 'number', reponse: vals[iMed] },
          moyQ
        ];
        sol = [
          'Tableau des effectifs cumulés croissants (E.C.C.) :' + tableau([[ctx.c].concat(vals.map(String)), ['Effectif'].concat(eff.map(String)), ['E.C.C.'].concat(ecc.map(String))]),
          'L\'effectif cumulé croissant de $' + vals[jE] + '$ est $' + ecc[jE] + '$ : $' + ecc[jE] + '$ individus ont une valeur inférieure ou égale à $' + vals[jE] + '$.',
          'Effectif total $N = ' + N + '$ (impair) : la médiane est la $' + pos + '^{e}$ valeur de la série rangée dans l\'ordre croissant. Le premier effectif cumulé supérieur ou égal à $' + pos + '$ est $' + ecc[iMed] + '$ : la médiane est $' + vals[iMed] + '$.',
          solMoy
        ];
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          niveau === 1 ? 'Le mode est la valeur la plus fréquente.' : 'Construis la ligne des effectifs cumulés croissants en additionnant les effectifs de gauche à droite.',
          'Moyenne : $\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$ (somme des produits valeur × effectif, divisée par l\'effectif total).'
        ],
        solution: sol
      };
    }
  });

  EM.gen.register({
    id: '3e-stats-classes',
    titre: 'Série regroupée en classes : classe modale, moyenne, classe médiane',
    chapitres: ['3e-statistiques', '2l-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick([
        { t: 'Le tableau donne la répartition des tailles (en cm) des élèves de 3e d\'un CEM de Saint-Louis.', c: 'Taille (cm)', a: 150, w: 5, u: 'cm' },
        { t: 'Le tableau donne la durée (en minutes) du trajet domicile–école des élèves d\'un collège de Rufisque.', c: 'Durée (min)', a: 0, w: 10, u: 'min' },
        { t: 'Le tableau donne la masse (en kg) des sacs d\'arachide pesés dans un point de collecte de Kaffrine.', c: 'Masse (kg)', a: 30, w: 5, u: 'kg' },
        { t: 'Le tableau donne la recette journalière (en milliers de F CFA) des vendeuses de poisson du quai de Joal.', c: 'Recette', a: 10, w: 10, u: 'milliers de F CFA' }
      ]);
      var k = 5, eff, N, mx, ecc, guard = 0;
      do {
        eff = []; for (var i = 0; i < k; i++) eff.push(rng.int(2, 14));
        N = EM.util.sum(eff); mx = Math.max.apply(null, eff);
        ecc = []; var cum = 0; eff.forEach(function (e) { cum += e; ecc.push(cum); });
      } while ((eff.filter(function (e) { return e === mx; }).length !== 1 || ecc.indexOf(N / 2) >= 0) && guard++ < 200);
      var bornes = [], centres = [];
      for (var j = 0; j <= k; j++) bornes.push(ctx.a + j * ctx.w);
      for (j = 0; j < k; j++) centres.push(ctx.a + j * ctx.w + ctx.w / 2);
      var cls = []; for (j = 0; j < k; j++) cls.push('$' + T.interval(bornes[j], bornes[j + 1], false, true) + '$');
      var Sc = F(0); centres.forEach(function (c, i) { Sc = Sc.add(F(c).mul(eff[i])); });
      var moy = Sc.div(N), exact = ar.isInt(moy.value() * 10);
      var moyQ = { label: (niveau === 1 ? '2)' : '3)') + ' Moyenne' + (exact ? '' : ' (arrondie au dixième)') + ' :', type: 'number', reponse: exact ? moy.value() : ar.round(moy.value(), 1), unite: ctx.u };
      if (!exact) moyQ.tol = 0.051;
      var iMod = eff.indexOf(mx), iMed = 0;
      while (ecc[iMed] < N / 2) iMed++;
      var tab = tableau([['Classe'].concat(cls), ['Effectif'].concat(eff.map(String))]);
      var ordre = rng.shuffle([0, 1, 2, 3, 4]);
      var choixCls = ordre.map(function (o) { return cls[o]; });
      var solMoy = 'On utilise les centres des classes : ' + centres.map(function (c) { return '$' + T.num(c) + '$'; }).join(', ') + '. $\\bar{x} = \\dfrac{' +
        centres.map(function (c, i) { return T.num(c) + ' \\times ' + eff[i]; }).join(' + ') + '}{' + N + '} = \\dfrac{' + T.num(Sc.value()) + '}{' + N + '}' + (exact ? ' = ' + T.num(moy.value()) : ' \\approx ' + T.num(ar.round(moy.value(), 1))) + '$ ' + ctx.u + '.';
      var qs, sol, enonce = ctx.t + tab;
      if (niveau === 1) {
        enonce += '1) Quelle est la classe modale ?<br>2) Calculer la moyenne de la série' + (exact ? '' : ' (arrondir au dixième)') + ' en utilisant les centres des classes.';
        qs = [{ label: '1) Classe modale :', type: 'choice', choix: choixCls, reponse: ordre.indexOf(iMod) }, moyQ];
        sol = ['La classe modale est la classe de plus grand effectif ($' + mx + '$) : ' + cls[iMod] + '.', solMoy];
      } else {
        enonce += '1) Combien d\'individus ont une valeur strictement inférieure à $' + bornes[3] + '$ ?<br>2) Quelle est la classe médiane ?<br>3) Calculer la moyenne de la série' + (exact ? '' : ' (arrondir au dixième)') + ' en utilisant les centres des classes.';
        qs = [
          { label: '1) Nombre :', type: 'number', reponse: ecc[2] },
          { label: '2) Classe médiane :', type: 'choice', choix: choixCls, reponse: ordre.indexOf(iMed) },
          moyQ
        ];
        sol = [
          'Effectifs cumulés croissants :' + tableau([['Classe'].concat(cls), ['Effectif'].concat(eff.map(String)), ['E.C.C.'].concat(ecc.map(String))]),
          'Les individus de valeur strictement inférieure à $' + bornes[3] + '$ sont ceux des trois premières classes : $' + eff[0] + ' + ' + eff[1] + ' + ' + eff[2] + ' = ' + ecc[2] + '$.',
          'Effectif total : $N = ' + N + '$, donc $\\dfrac{N}{2} = ' + T.num(N / 2) + '$. La première classe dont l\'effectif cumulé croissant dépasse $' + T.num(N / 2) + '$ est ' + cls[iMed] + ' (E.C.C. $= ' + ecc[iMed] + '$) : c\'est la classe médiane.',
          solMoy
        ];
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Le centre de la classe $[a\\,;\\,b[$ est $\\dfrac{a + b}{2}$.',
          niveau === 1 ? 'La classe modale est celle qui a le plus grand effectif.' : 'La classe médiane contient la valeur du milieu : cherche où l\'effectif cumulé croissant atteint $\\dfrac{N}{2}$.'
        ],
        solution: sol
      };
    }
  });

  EM.gen.register({
    id: '2l-stats-frequences',
    titre: 'Fréquences et diagramme circulaire',
    chapitres: ['2l-statistiques', '3e-statistiques'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var ctx = rng.pick([
        { t: 'On a demandé aux élèves d\'un lycée de Thiès leur moyen de transport pour venir à l\'école.', c: 'Transport', cats: ['À pied', 'Car rapide', 'Taxi', 'Moto', 'Vélo'] },
        { t: 'On a interrogé des jeunes de Saint-Louis sur leur sport préféré.', c: 'Sport', cats: ['Football', 'Lutte', 'Basket-ball', 'Athlétisme', 'Handball'] },
        { t: 'Une coopérative agricole de Kaolack a réparti ses parcelles selon la culture pratiquée.', c: 'Culture', cats: ['Arachide', 'Mil', 'Maïs', 'Niébé', 'Pastèque'] }
      ]);
      var N = rng.pick([40, 60, 72, 90, 120, 180]), m = rng.pick([4, 5]);
      var cats = ctx.cats.slice(0, m), eff, guard = 0;
      do {
        eff = []; var rest = N;
        for (var i = 0; i < m - 1; i++) { var e = rng.int(Math.max(1, Math.round(N / (2 * m))), Math.round(1.6 * N / m)); eff.push(e); rest -= e; }
        eff.push(rest);
      } while ((eff[m - 1] < 2) && guard++ < 200);
      if (eff[m - 1] < 2) { eff = []; for (i = 0; i < m; i++) eff.push(Math.floor(N / m)); eff[m - 1] += N - m * Math.floor(N / m); }
      var iF = rng.int(0, m - 1), iA = rng.intExcept(0, m - 1, [iF]);
      var fq = eff[iF] * 100 / N, exactF = ar.isInt(fq * 10);
      var fQ = { label: (niveau === 1 ? '1)' : '2)') + ' Fréquence de « ' + cats[iF] + ' » (en %)' + (exactF ? '' : ', arrondie au dixième') + ' :', type: 'number', reponse: exactF ? ar.round(fq, 1) : ar.round(fq, 1) };
      if (!exactF) fQ.tol = 0.051;
      var ang = eff[iA] * 360 / N;
      var effTxt = eff.map(String), enonce, qs, sol;
      if (niveau === 2) effTxt[iA] = '?';
      var tab = tableau([[ctx.c].concat(cats), ['Effectif'].concat(effTxt)]);
      sol = ['Effectif total : $N = ' + N + '$.'];
      if (niveau === 1) {
        enonce = ctx.t + ' Effectif total : $N = ' + N + '$.' + tab + '1) Calculer la fréquence (en %) de la modalité « ' + cats[iF] + ' »' + (exactF ? '.' : ' (arrondir au dixième).') + '<br>2) Dans un diagramme circulaire, quelle est la mesure (en degrés) de l\'angle du secteur « ' + cats[iA] + ' » ?';
        qs = [fQ, { label: '2) Angle du secteur « ' + cats[iA] + ' » :', type: 'number', reponse: ang, unite: '°' }];
        sol.push('Fréquence : $f = \\dfrac{' + eff[iF] + '}{' + N + '} \\times 100' + (exactF ? ' = ' + T.num(fq) : ' \\approx ' + T.num(ar.round(fq, 1))) + '$ %.');
        sol.push('Angle : l\'effectif total correspond à $360^\\circ$, donc $\\alpha = \\dfrac{' + eff[iA] + ' \\times 360}{' + N + '} = ' + deg(ang) + '$.');
      } else {
        enonce = ctx.t + ' Effectif total : $N = ' + N + '$. L\'effectif de la modalité « ' + cats[iA] + ' » est effacé, mais on sait que son secteur mesure $' + deg(ang) + '$ dans le diagramme circulaire.' + tab +
          '1) Calculer l\'effectif de la modalité « ' + cats[iA] + ' ».<br>2) Calculer la fréquence (en %) de la modalité « ' + cats[iF] + ' »' + (exactF ? '.' : ' (arrondir au dixième).');
        qs = [{ label: '1) Effectif de « ' + cats[iA] + ' » :', type: 'number', reponse: eff[iA] }, fQ];
        sol.push('L\'angle est proportionnel à l\'effectif : $n = \\dfrac{' + T.num(ang) + ' \\times ' + N + '}{360} = ' + eff[iA] + '$.');
        sol.push('Vérification : la somme des effectifs fait bien $' + eff.join(' + ') + ' = ' + N + '$.');
        sol.push('Fréquence : $f = \\dfrac{' + eff[iF] + '}{' + N + '} \\times 100' + (exactF ? ' = ' + T.num(fq) : ' \\approx ' + T.num(ar.round(fq, 1))) + '$ %.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: ['Fréquence en % : $\\dfrac{\\text{effectif}}{\\text{effectif total}} \\times 100$.', 'Dans un diagramme circulaire, l\'angle d\'un secteur est proportionnel à l\'effectif : $N$ correspond à $360^\\circ$.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 3e — THÉORÈME DE THALÈS (réciproque)                                */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-thales-reciproque',
    titre: 'Réciproque du théorème de Thalès : les droites sont-elles parallèles ?',
    chapitres: ['3e-thales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var noms = rng.pick([['A', 'M', 'B', 'N', 'C'], ['O', 'E', 'F', 'G', 'H'], ['S', 'R', 'T', 'U', 'V'], ['E', 'K', 'F', 'L', 'G']]);
      var A = noms[0], M = noms[1], B = noms[2], N = noms[3], C = noms[4];
      var k = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(2, 5), F(3, 5), F(4, 5), F(5, 6), F(3, 7)]);
      var sc = rng.pick([1, 1, 0.5, 1.5]);
      var m1 = rng.int(2, 4), m2 = rng.intExcept(2, 5, [m1]);
      var AB = ar.round(k.d * m1 * sc, 2), AM = ar.round(k.n * m1 * sc, 2), AC = ar.round(k.d * m2 * sc, 2);
      var para = rng.bool(0.55);
      var AN = ar.round((k.n * m2 + (para ? 0 : rng.pick([-1, 1]))) * sc, 2);
      var r1 = F(AM).div(F(AB)), r2 = F(AN).div(F(AC));
      var th = rng.int(45, 75) * Math.PI / 180, s1 = niveau === 1 ? 1 : -1;
      var pA = [0, 0], pB = [AB, 0], pC = [AC * Math.cos(th), AC * Math.sin(th)];
      var pM = [s1 * AM, 0], pN = [s1 * AN / AC * pC[0], s1 * AN / AC * pC[1]];
      var fg = EM.fig.fit([pA, pB, pC, pM, pN], { w: 300, h: 220, title: 'Configuration de Thalès' });
      if (niveau === 1) fg.poly([pA, pB, pC]); else fg.seg(pM, pB).seg(pN, pC).seg(pB, pC);
      fg.seg(pM, pN, { accent: true });
      if (niveau === 1) fg.point(pA, A, 'so').point(pB, B, 'se').point(pC, C, 'n').point(pM, M, 's').point(pN, N, 'no');
      else fg.point(pA, A, 'no').point(pB, B, 'se').point(pC, C, 'n').point(pM, M, 'n').point(pN, N, 's');
      var ordre = niveau === 1
        ? 'les points $' + A + '$, $' + M + '$, $' + B + '$ et les points $' + A + '$, $' + N + '$, $' + C + '$ sont alignés dans le même ordre'
        : 'les points $' + M + '$, $' + A + '$, $' + B + '$ et les points $' + N + '$, $' + A + '$, $' + C + '$ sont alignés dans le même ordre';
      var donnees = '$' + A + M + ' = ' + T.num(AM) + '$ cm, $' + A + B + ' = ' + T.num(AB) + '$ cm, $' + A + N + ' = ' + T.num(AN) + '$ cm et $' + A + C + ' = ' + T.num(AC) + '$ cm';
      var enonce = (niveau === 1
        ? 'Sur la figure (qui n\'est pas en vraie grandeur), $' + M + ' \\in [' + A + B + ']$ et $' + N + ' \\in [' + A + C + ']$.'
        : 'Sur la figure (qui n\'est pas en vraie grandeur), les droites $(' + B + M + ')$ et $(' + C + N + ')$ se coupent en $' + A + '$ ; les points $' + M + '$, $' + A + '$, $' + B + '$ sont alignés dans cet ordre, ainsi que $' + N + '$, $' + A + '$, $' + C + '$.') +
        '<br>On donne ' + donnees + '.<br>1) Calculer les rapports $\\dfrac{' + A + M + '}{' + A + B + '}$ et $\\dfrac{' + A + N + '}{' + A + C + '}$.<br>2) Les droites $(' + M + N + ')$ et $(' + B + C + ')$ sont-elles parallèles ? Justifier.';
      function ratio(x, y, r) {
        var raw = '\\dfrac{' + T.num(x) + '}{' + T.num(y) + '}';
        return raw + (T.num(x) === String(r.n) && T.num(y) === String(r.d) ? '' : ' = ' + r.tex());
      }
      var sol = ['$\\dfrac{' + A + M + '}{' + A + B + '} = ' + ratio(AM, AB, r1) + '$ et $\\dfrac{' + A + N + '}{' + A + C + '} = ' + ratio(AN, AC, r2) + '$.'];
      if (para) {
        sol.push('Donc $\\dfrac{' + A + M + '}{' + A + B + '} = \\dfrac{' + A + N + '}{' + A + C + '}$. De plus, ' + ordre + '.');
        sol.push('D\'après la réciproque du théorème de Thalès, les droites $(' + M + N + ')$ et $(' + B + C + ')$ sont parallèles.');
      } else {
        sol.push('Produits en croix : $' + A + M + ' \\times ' + A + C + ' = ' + T.num(ar.round(AM * AC, 4)) + '$ et $' + A + N + ' \\times ' + A + B + ' = ' + T.num(ar.round(AN * AB, 4)) + '$ : ils sont différents, donc $\\dfrac{' + A + M + '}{' + A + B + '} \\neq \\dfrac{' + A + N + '}{' + A + C + '}$.');
        sol.push('Si les droites $(' + M + N + ')$ et $(' + B + C + ')$ étaient parallèles, le théorème de Thalès donnerait l\'égalité de ces rapports. Ce n\'est pas le cas : les droites ne sont pas parallèles.');
      }
      var ch = rng.shuffle(['Elles sont parallèles.', 'Elles ne sont pas parallèles.']);
      return {
        enonce: enonce,
        figure: fg.svg(),
        questions: [
          { label: '1) $\\dfrac{' + A + M + '}{' + A + B + '} =$', type: 'number', reponse: r1 },
          { label: '1) $\\dfrac{' + A + N + '}{' + A + C + '} =$', type: 'number', reponse: r2 },
          { label: '2) $(' + M + N + ')$ et $(' + B + C + ')$ :', type: 'choice', choix: ch, reponse: ch.indexOf(para ? 'Elles sont parallèles.' : 'Elles ne sont pas parallèles.') }
        ],
        indices: [
          'Calcule les deux rapports séparément (sous forme de fractions irréductibles ou de décimaux) puis compare-les.',
          'Réciproque de Thalès : si les rapports sont égaux <b>et</b> si les points sont alignés dans le même ordre, alors les droites sont parallèles.'
        ],
        solution: sol,
        aide: 'Les rapports peuvent s\'écrire sous forme de fraction (3/5) ou de décimal (0,6).'
      };
    }
  });

  /* ================================================================== */
  /* 3e — TRIGONOMÉTRIE                                                  */
  /* ================================================================== */
  /** Figure d'un triangle RPQ rectangle en R, angle marqué en P. */
  function figTriRect(nm, adj, opp, angTxt, lab) {
    var pR = [0, 0], pP = [adj, 0], pQ = [0, opp];
    var fg = EM.fig.fit([pR, pP, pQ], { w: 280, h: 210, title: 'Triangle rectangle' });
    fg.poly([pR, pP, pQ]).rightAngle(pP, pR, pQ);
    if (angTxt) fg.angle(pQ, pP, pR, angTxt);
    fg.point(pR, nm[0], 'so').point(pP, nm[1], 'se').point(pQ, nm[2], 'n');
    if (lab.adj) fg.segLabel(pR, pP, lab.adj, { inside: pQ });
    if (lab.opp) fg.segLabel(pR, pQ, lab.opp, { inside: pP });
    if (lab.hyp) fg.segLabel(pP, pQ, lab.hyp, { inside: pR });
    return fg.svg();
  }
  var TRI_NOMS = [['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T'], ['K', 'L', 'M']];

  EM.gen.register({
    id: '3e-trigo-longueur',
    titre: 'Calculer une longueur avec cosinus, sinus ou tangente',
    chapitres: ['3e-trigonometrie'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var nm = rng.pick(TRI_NOMS), R = nm[0], P = nm[1], Q = nm[2];
      var th, cas, known, v, guard = 0, t;
      var INFO = {
        cos: { k: 'hyp', u: 'adj', f: 'cos', mult: true }, sin: { k: 'hyp', u: 'opp', f: 'sin', mult: true }, tan: { k: 'adj', u: 'opp', f: 'tan', mult: true },
        cosInv: { k: 'adj', u: 'hyp', f: 'cos', mult: false }, sinInv: { k: 'opp', u: 'hyp', f: 'sin', mult: false }, tanInv: { k: 'opp', u: 'adj', f: 'tan', mult: false }
      };
      do {
        th = rng.int(20, 70);
        cas = niveau === 1 ? rng.pick(['cos', 'sin', 'tan']) : rng.pick(['cosInv', 'sinInv', 'tanInv']);
        known = rng.bool() ? rng.int(3, 12) : rng.int(30, 120) / 10;
        t = th * Math.PI / 180;
        v = { cos: known * Math.cos(t), sin: known * Math.sin(t), tan: known * Math.tan(t), cosInv: known / Math.cos(t), sinInv: known / Math.sin(t), tanInv: known / Math.tan(t) }[cas];
      } while (Math.abs(v * 10 - Math.floor(v * 10) - 0.5) < 0.06 && guard++ < 60);
      var I = INFO[cas];
      var side = { hyp: P + Q, adj: R + P, opp: R + Q };
      var hyp, adj, opp;
      if (I.k === 'hyp') { hyp = known; adj = hyp * Math.cos(t); opp = hyp * Math.sin(t); }
      else if (I.k === 'adj') { adj = known; hyp = adj / Math.cos(t); opp = adj * Math.tan(t); }
      else { opp = known; hyp = opp / Math.sin(t); adj = opp / Math.tan(t); }
      var lab = {}; lab[I.k] = T.txt(known) + ' cm'; lab[I.u] = '?';
      var ang = '\\widehat{' + R + P + Q + '}';
      var rep = ar.round(v, 1);
      var num = { cos: side.adj, sin: side.opp, tan: side.opp }[I.f], den = { cos: side.hyp, sin: side.hyp, tan: side.adj }[I.f];
      var formule = '\\' + I.f + ' ' + ang + ' = \\dfrac{' + num + '}{' + den + '}';
      var calc = I.mult
        ? side[I.u] + ' = ' + side[I.k] + ' \\times \\' + I.f + ' ' + ang + ' = ' + T.num(known) + ' \\times \\' + I.f + ' ' + deg(th)
        : side[I.u] + ' = \\dfrac{' + side[I.k] + '}{\\' + I.f + ' ' + ang + '} = \\dfrac{' + T.num(known) + '}{\\' + I.f + ' ' + deg(th) + '}';
      return {
        enonce: 'Le triangle $' + R + P + Q + '$ est rectangle en $' + R + '$. On donne $' + ang + ' = ' + deg(th) + '$ et $' + side[I.k] + ' = ' + T.num(known) + '$ cm.<br>Calculer $' + side[I.u] + '$ ; donner l\'arrondi au dixième.',
        figure: figTriRect(nm, adj, opp, th + '°', lab),
        questions: [{ label: '$' + side[I.u] + ' \\approx$', type: 'number', reponse: rep, tol: 0.051, unite: 'cm' }],
        indices: [
          'Repère l\'hypoténuse (en face de l\'angle droit), puis le côté adjacent et le côté opposé à l\'angle $' + ang + '$.',
          'Choisis la formule qui relie le côté connu et le côté cherché : CAH (cos = adjacent/hypoténuse), SOH (sin = opposé/hypoténuse), TOA (tan = opposé/adjacent).'
        ],
        solution: [
          'Dans le triangle $' + R + P + Q + '$ rectangle en $' + R + '$ : l\'hypoténuse est $[' + side.hyp + ']$ ; par rapport à l\'angle $' + ang + '$, $[' + side.adj + ']$ est le côté adjacent et $[' + side.opp + ']$ le côté opposé.',
          'On connaît $' + side[I.k] + '$ et on cherche $' + side[I.u] + '$ : on utilise $' + formule + '$.',
          'Donc $' + calc + '$.',
          'À la calculatrice (en mode degrés) : $' + side[I.u] + ' \\approx ' + approx(v, 3) + '$, soit $' + side[I.u] + ' \\approx ' + T.num(rep) + '$ cm au dixième près.'
        ],
        aide: 'Utilise la calculatrice en mode degrés. Écris le résultat arrondi au dixième (exemple : 6,6).'
      };
    }
  });

  EM.gen.register({
    id: '3e-trigo-angle',
    titre: 'Calculer la mesure d\'un angle dans un triangle rectangle',
    chapitres: ['3e-trigonometrie'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var nm = rng.pick(TRI_NOMS), R = nm[0], P = nm[1], Q = nm[2];
      var cas, adj, opp, hyp, d, guard = 0;
      do {
        cas = rng.pick(['tan', 'cos', 'sin']);
        if (cas === 'tan') { adj = rng.int(3, 15); opp = rng.int(3, 15); hyp = Math.sqrt(adj * adj + opp * opp); d = Math.atan(opp / adj); }
        else if (cas === 'cos') { adj = rng.int(3, 12); hyp = adj + rng.int(1, 8); opp = Math.sqrt(hyp * hyp - adj * adj); d = Math.acos(adj / hyp); }
        else { opp = rng.int(3, 12); hyp = opp + rng.int(1, 8); adj = Math.sqrt(hyp * hyp - opp * opp); d = Math.asin(opp / hyp); }
        d = d * 180 / Math.PI;
      } while ((Math.abs(d - Math.floor(d) - 0.5) < 0.08 || d < 10 || d > 80) && guard++ < 100);
      var side = { hyp: P + Q, adj: R + P, opp: R + Q };
      var ang = '\\widehat{' + R + P + Q + '}', ang2 = '\\widehat{' + R + Q + P + '}';
      var lab = {}, given;
      if (cas === 'tan') { lab.adj = adj + ' cm'; lab.opp = opp + ' cm'; given = '$' + side.adj + ' = ' + adj + '$ cm et $' + side.opp + ' = ' + opp + '$ cm'; }
      else if (cas === 'cos') { lab.adj = adj + ' cm'; lab.hyp = hyp + ' cm'; given = '$' + side.adj + ' = ' + adj + '$ cm et $' + side.hyp + ' = ' + hyp + '$ cm'; }
      else { lab.opp = opp + ' cm'; lab.hyp = hyp + ' cm'; given = '$' + side.opp + ' = ' + opp + '$ cm et $' + side.hyp + ' = ' + hyp + '$ cm'; }
      var ratio = { tan: [side.opp, side.adj, opp, adj], cos: [side.adj, side.hyp, adj, hyp], sin: [side.opp, side.hyp, opp, hyp] }[cas];
      var rd = Math.round(d);
      var sol = [
        'Dans le triangle $' + R + P + Q + '$ rectangle en $' + R + '$, on connaît ' + (cas === 'tan' ? 'les deux côtés de l\'angle droit' : 'un côté de l\'angle droit et l\'hypoténuse') + ' : on utilise le ' + { tan: 'la tangente', cos: 'le cosinus', sin: 'le sinus' }[cas].replace(/^(le |la )/, '') + '.',
        '$\\' + cas + ' ' + ang + ' = \\dfrac{' + ratio[0] + '}{' + ratio[1] + '} = \\dfrac{' + ratio[2] + '}{' + ratio[3] + '}$.',
        Math.abs(d - rd) < 1e-9
          ? 'À la calculatrice (touche $\\' + cas + '^{-1}$, en mode degrés) : $' + ang + ' = ' + deg(rd) + '$ (valeur exacte : $\\' + cas + ' ' + deg(rd) + ' = ' + F(ratio[2], ratio[3]).tex() + '$).'
          : 'À la calculatrice (touche $\\' + cas + '^{-1}$, en mode degrés) : $' + ang + ' \\approx ' + approx(d, 2) + '^\\circ$, soit $' + ang + ' \\approx ' + deg(rd) + '$ au degré près.'
      ];
      sol[0] = 'Dans le triangle $' + R + P + Q + '$ rectangle en $' + R + '$, on connaît ' + (cas === 'tan' ? 'les deux côtés de l\'angle droit : on utilise la tangente.' : cas === 'cos' ? 'le côté adjacent à $' + ang + '$ et l\'hypoténuse : on utilise le cosinus.' : 'le côté opposé à $' + ang + '$ et l\'hypoténuse : on utilise le sinus.');
      var qs = [{ label: '$' + ang + ' \\approx$', type: 'number', reponse: rd, tol: 0.5, unite: '°' }];
      var enonce = 'Le triangle $' + R + P + Q + '$ est rectangle en $' + R + '$ avec ' + given + '.<br>' + (niveau === 1 ? 'Calculer la mesure de l\'angle $' + ang + '$, arrondie au degré.' :
        '1) Calculer la mesure de l\'angle $' + ang + '$, arrondie au degré.<br>2) En déduire une mesure de l\'angle $' + ang2 + '$, arrondie au degré.<br>3) Calculer la valeur exacte de la longueur du troisième côté.');
      if (niveau === 2) {
        qs[0].label = '1) ' + qs[0].label;
        qs.push({ label: '2) $' + ang2 + ' \\approx$', type: 'number', reponse: 90 - rd, tol: 0.5, unite: '°' });
        sol.push('Dans un triangle rectangle, les deux angles aigus sont complémentaires : $' + ang2 + ' = 90^\\circ - ' + ang + ' \\approx ' + deg(90 - rd) + '$.');
        var n, nomS;
        if (cas === 'tan') { n = adj * adj + opp * opp; nomS = side.hyp; sol.push('Théorème de Pythagore : $' + side.hyp + '^2 = ' + side.adj + '^2 + ' + side.opp + '^2 = ' + adj * adj + ' + ' + opp * opp + ' = ' + n + '$, donc $' + side.hyp + ' = \\sqrt{' + n + '}' + (T.sqrt(n) === '\\sqrt{' + n + '}' ? '' : ' = ' + T.sqrt(n)) + '$ cm.'); }
        else {
          var leg = cas === 'cos' ? adj : opp; n = hyp * hyp - leg * leg; nomS = cas === 'cos' ? side.opp : side.adj;
          sol.push('Théorème de Pythagore : $' + nomS + '^2 = ' + side.hyp + '^2 - ' + (cas === 'cos' ? side.adj : side.opp) + '^2 = ' + hyp * hyp + ' - ' + leg * leg + ' = ' + n + '$, donc $' + nomS + ' = \\sqrt{' + n + '}' + (T.sqrt(n) === '\\sqrt{' + n + '}' ? '' : ' = ' + T.sqrt(n)) + '$ cm.');
        }
        qs.push({ label: '3) $' + nomS + ' =$', type: 'number', reponse: 'sqrt(' + n + ')', reponseTex: T.sqrt(n), unite: 'cm' });
      }
      return {
        enonce: enonce,
        figure: figTriRect(nm, adj, opp, '?', lab),
        questions: qs,
        indices: [
          'Repère, par rapport à l\'angle $' + ang + '$, les côtés connus : adjacent, opposé ou hypoténuse.',
          'Calcule le rapport trigonométrique, puis utilise la touche $\\cos^{-1}$, $\\sin^{-1}$ ou $\\tan^{-1}$ de la calculatrice.'
        ],
        solution: sol,
        aide: 'Angle en degrés, arrondi à l\'unité (exemple : 37). Pour une racine, écris √41 ou sqrt(41).'
      };
    }
  });

  EM.gen.register({
    id: '3e-trigo-relations',
    titre: 'Utiliser cos² x + sin² x = 1 et tan x = sin x / cos x',
    chapitres: ['3e-trigonometrie'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var given = rng.pick(['cos', 'sin']), autre = given === 'cos' ? 'sin' : 'cos';
      var p, q, n, s, t, guard = 0;
      if (niveau === 1) {
        var tr = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
        var sw = rng.bool(); p = sw ? tr[1] : tr[0]; q = tr[2]; n = q * q - p * p; s = sw ? tr[0] : tr[1]; t = 1;
      } else {
        do { q = rng.int(2, 7); p = rng.int(1, q - 1); n = q * q - p * p; } while ((ar.isInt(Math.sqrt(n)) || ar.gcd(p, q) !== 1) && guard++ < 100);
        var sp = ar.sqrtSimplify(n); s = sp.a; t = sp.b;
      }
      var rootN = t === 1 ? String(s) : '\\sqrt{' + n + '}';
      var autreTex = radFrac(s, t, q), autreStr = '(' + s + ')*sqrt(' + t + ')/(' + q + ')';
      var tanTex, tanStr, tanSteps, s1, s2;
      if (given === 'cos') {
        tanTex = radFrac(s, t, p); tanStr = '(' + s + ')*sqrt(' + t + ')/(' + p + ')';
        s1 = '\\dfrac{' + rootN + '}{' + q + '} \\times ' + (p === 1 ? q : '\\dfrac{' + q + '}{' + p + '}');
        s2 = p === 1 ? rootN : '\\dfrac{' + rootN + '}{' + p + '}';
        tanSteps = '$\\tan x = \\dfrac{\\sin x}{\\cos x} = ' + s1 + ' = ' + s2 + (tanTex === s2 ? '' : ' = ' + tanTex) + '$.';
      } else {
        tanTex = radFrac(p, t, s * t); tanStr = '(' + p + ')/((' + s + ')*sqrt(' + t + '))';
        s1 = '\\dfrac{' + p + '}{' + q + '} \\times \\dfrac{' + q + '}{' + rootN + '}';
        s2 = '\\dfrac{' + p + '}{' + rootN + '}';
        var s3 = t === 1 ? F(p, s).tex() : '\\dfrac{' + (p === 1 ? '' : p) + '\\sqrt{' + n + '}}{' + n + '}';
        tanSteps = '$\\tan x = \\dfrac{\\sin x}{\\cos x} = ' + s1 + ' = ' + s2 + (s3 === s2 ? '' : ' = ' + s3) + (tanTex === s3 ? '' : ' = ' + tanTex) + '$.';
      }
      var autreSimpl = '\\dfrac{' + rootN + '}{' + q + '}';
      return {
        enonce: '$x$ est la mesure d\'un angle aigu tel que $\\' + given + ' x = \\dfrac{' + p + '}{' + q + '}$.<br>Calculer la valeur exacte de $\\' + autre + ' x$ puis celle de $\\tan x$.',
        questions: [
          { label: '$\\' + autre + ' x =$', type: 'number', reponse: autreStr, reponseTex: autreTex },
          { label: '$\\tan x =$', type: 'number', reponse: tanStr, reponseTex: tanTex }
        ],
        indices: [
          'Utilise la relation $\\cos^2 x + \\sin^2 x = 1$.',
          'Comme $x$ est aigu, $\\cos x$ et $\\sin x$ sont positifs. Puis $\\tan x = \\dfrac{\\sin x}{\\cos x}$.'
        ],
        solution: [
          'On sait que $\\cos^2 x + \\sin^2 x = 1$, donc $\\' + autre + '^2 x = 1 - \\' + given + '^2 x = 1 - \\left(\\dfrac{' + p + '}{' + q + '}\\right)^2 = 1 - \\dfrac{' + p * p + '}{' + q * q + '} = \\dfrac{' + n + '}{' + q * q + '}$.',
          'Comme $x$ est aigu, $\\' + autre + ' x > 0$, donc $\\' + autre + ' x = \\sqrt{\\dfrac{' + n + '}{' + q * q + '}} = ' + (t === 1 ? '' : '\\dfrac{\\sqrt{' + n + '}}{' + q + '} = ') + autreTex + '$.',
          tanSteps
        ].map(function (x) { return x.replace(autreSimpl + ' = ' + autreSimpl, autreSimpl); }),
        aide: AIDE_RAD
      };
    }
  });

  /* ================================================================== */
  /* 3e — ANGLES INSCRITS ET POLYGONES RÉGULIERS                         */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-angles-inscrits',
    titre: 'Angles inscrits, angles au centre et polygones réguliers',
    chapitres: ['3e-angles-inscrits'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      function P(dg) { var r = dg * Math.PI / 180; return [Math.cos(r), Math.sin(r)]; }
      function pos(dg) { dg = ((dg % 360) + 360) % 360; return ['e', 'ne', 'n', 'no', 'o', 'so', 's', 'se'][Math.round(dg / 45) % 8]; }
      var O = [0, 0];
      var fg = EM.fig.fit([[-1.1, -1.1], [1.1, 1.1]], { w: 230, h: 230, title: 'Cercle de centre O' });
      fg.circle(O, 1);
      var arc = '\\overset{\\frown}{AB}';
      if (niveau <= 2) {
        var alpha = 2 * rng.int(20, 80), beta = alpha / 2;
        var phiA = rng.int(190, 250), phiB = phiA + alpha;
        // M (et N) sur le grand arc, loin des points diamétralement opposés à A et B (figure plus lisible)
        var t0 = (180 - alpha) / (360 - alpha), t1 = 180 / (360 - alpha), tM, tN, gd = 0;
        do { tM = 0.2 + 0.25 * rng.next(); tN = 0.55 + 0.25 * rng.next(); }
        while ((Math.abs(tM - t0) < 0.07 || Math.abs(tM - t1) < 0.07 || Math.abs(tN - t0) < 0.07 || Math.abs(tN - t1) < 0.07) && gd++ < 100);
        if (rng.bool()) { var tt = tM; tM = tN; tN = tt; }
        var phiM = phiB + (360 - alpha) * tM, phiN = phiB + (360 - alpha) * tN;
        var pA = P(phiA), pB = P(phiB), pM = P(phiM), pN = P(phiN);
        fg.seg(O, pA, { accent: true }).seg(O, pB, { accent: true }).seg(pM, pA).seg(pM, pB);
        if (niveau === 2) fg.seg(pN, pA, { dash: true }).seg(pN, pB, { dash: true }).seg(pA, pB);
        fg.point(O, 'O', pos(phiA + alpha / 2 + 180)).point(pA, 'A', pos(phiA)).point(pB, 'B', pos(phiB)).point(pM, 'M', pos(phiM));
        if (niveau === 2) fg.point(pN, 'N', pos(phiN));
        if (niveau === 1) {
          var donneCentre = rng.bool();
          fg.angle(pA, O, pB, donneCentre ? alpha + '°' : '?', { r: 18 });
          fg.angle(pA, pM, pB, donneCentre ? '?' : beta + '°', { r: 26 });
          return {
            enonce: '$A$, $B$ et $M$ sont trois points d\'un cercle de centre $O$ ; $M$ n\'appartient pas au petit arc $' + arc + '$. On donne ' +
              (donneCentre ? '$\\widehat{AOB} = ' + deg(alpha) + '$.<br>Calculer la mesure de l\'angle inscrit $\\widehat{AMB}$.' : '$\\widehat{AMB} = ' + deg(beta) + '$.<br>Calculer la mesure de l\'angle au centre $\\widehat{AOB}$.'),
            figure: fg.svg(),
            questions: [donneCentre ? { label: '$\\widehat{AMB} =$', type: 'number', reponse: beta, unite: '°' } : { label: '$\\widehat{AOB} =$', type: 'number', reponse: alpha, unite: '°' }],
            indices: ['L\'angle inscrit $\\widehat{AMB}$ et l\'angle au centre $\\widehat{AOB}$ interceptent le même arc $' + arc + '$.', 'La mesure d\'un angle inscrit est la moitié de celle de l\'angle au centre qui intercepte le même arc.'],
            solution: [
              'L\'angle inscrit $\\widehat{AMB}$ et l\'angle au centre $\\widehat{AOB}$ interceptent le même arc $' + arc + '$.',
              'Or la mesure d\'un angle inscrit est égale à la moitié de celle de l\'angle au centre associé.',
              donneCentre ? 'Donc $\\widehat{AMB} = \\dfrac{\\widehat{AOB}}{2} = \\dfrac{' + alpha + '^\\circ}{2} = ' + deg(beta) + '$.' : 'Donc $\\widehat{AOB} = 2 \\times \\widehat{AMB} = 2 \\times ' + deg(beta) + ' = ' + deg(alpha) + '$.'
            ]
          };
        }
        fg.angle(pA, pM, pB, beta + '°', { r: 26 });
        var oab = 90 - beta;
        return {
          enonce: '$A$, $B$, $M$ et $N$ sont quatre points d\'un cercle de centre $O$ ; $M$ et $N$ n\'appartiennent pas au petit arc $' + arc + '$. On donne $\\widehat{AMB} = ' + deg(beta) + '$.<br>' +
            '1) Calculer $\\widehat{ANB}$.<br>2) Calculer $\\widehat{AOB}$.<br>3) En déduire $\\widehat{OAB}$.',
          figure: fg.svg(),
          questions: [
            { label: '1) $\\widehat{ANB} =$', type: 'number', reponse: beta, unite: '°' },
            { label: '2) $\\widehat{AOB} =$', type: 'number', reponse: alpha, unite: '°' },
            { label: '3) $\\widehat{OAB} =$', type: 'number', reponse: oab, unite: '°' }
          ],
          indices: [
            'Deux angles inscrits qui interceptent le même arc ont la même mesure.',
            'Le triangle $AOB$ est isocèle en $O$ ($OA = OB$ = rayon) et la somme de ses angles vaut $180^\\circ$.'
          ],
          solution: [
            'Les angles inscrits $\\widehat{AMB}$ et $\\widehat{ANB}$ interceptent le même arc $' + arc + '$ : ils sont égaux, donc $\\widehat{ANB} = ' + deg(beta) + '$.',
            'L\'angle au centre $\\widehat{AOB}$ intercepte le même arc : $\\widehat{AOB} = 2 \\times \\widehat{AMB} = ' + deg(alpha) + '$.',
            'Le triangle $AOB$ est isocèle en $O$ car $OA = OB$ (rayons). Ses angles à la base sont égaux : $\\widehat{OAB} = \\dfrac{180^\\circ - ' + deg(alpha) + '}{2} = ' + deg(oab) + '$.'
          ]
        };
      }
      // niveau 3 : polygone régulier
      var poly = rng.pick([[5, 'pentagone'], [6, 'hexagone'], [8, 'octogone'], [9, 'ennéagone'], [10, 'décagone'], [12, 'dodécagone']]);
      var n = poly[0], nom = poly[1];
      var lettres = 'ABCDEFGHIJKL'.slice(0, n).split('');
      var pts = lettres.map(function (l, i) { return P(90 - 360 * i / n); });
      fg.poly(pts).seg(O, pts[0], { accent: true }).seg(O, pts[1], { accent: true }).seg(pts[2], pts[0], { dash: true });
      pts.forEach(function (p, i) { fg.point(p, lettres[i], pos(90 - 360 * i / n)); });
      fg.point(O, 'O', pos(90 - 180 / n + 180));
      var ac = F(360, n), ai = F((n - 2) * 180, n), ins = F(180, n);
      return {
        enonce: '$' + lettres.join('') + '$ est un ' + nom + ' régulier (polygone régulier à $' + n + '$ côtés) inscrit dans un cercle de centre $O$.<br>1) Calculer la mesure de l\'angle au centre $\\widehat{AOB}$.<br>2) Calculer la mesure de l\'angle $\\widehat{ABC}$ du polygone.<br>3) Calculer la mesure de l\'angle inscrit $\\widehat{ACB}$.',
        figure: fg.svg(),
        questions: [
          { label: '1) $\\widehat{AOB} =$', type: 'number', reponse: ac, unite: '°' },
          { label: '2) $\\widehat{ABC} =$', type: 'number', reponse: ai, unite: '°' },
          { label: '3) $\\widehat{ACB} =$', type: 'number', reponse: ins, unite: '°' }
        ],
        indices: [
          'Les $' + n + '$ sommets partagent le cercle en $' + n + '$ arcs de même mesure : un tour complet fait $360^\\circ$.',
          'Le triangle $AOB$ est isocèle en $O$ ; l\'angle inscrit $\\widehat{ACB}$ intercepte le même arc que $\\widehat{AOB}$.'
        ],
        solution: [
          'Les sommets partagent le cercle en $' + n + '$ arcs égaux, donc $\\widehat{AOB} = \\dfrac{360^\\circ}{' + n + '} = ' + deg(ac.value()) + '$.',
          'Le triangle $AOB$ est isocèle en $O$ : $\\widehat{OBA} = \\dfrac{180^\\circ - ' + deg(ac.value()) + '}{2} = ' + deg(F(180).sub(ac).div(2).value()) + '$. De même $\\widehat{OBC} = ' + deg(F(180).sub(ac).div(2).value()) + '$, donc $\\widehat{ABC} = 2 \\times ' + deg(F(180).sub(ac).div(2).value()) + ' = ' + deg(ai.value()) + '$.',
          'L\'angle inscrit $\\widehat{ACB}$ intercepte le même arc $' + arc + '$ que l\'angle au centre $\\widehat{AOB}$ : $\\widehat{ACB} = \\dfrac{' + deg(ac.value()) + '}{2} = ' + deg(ins.value()) + '$.'
        ],
        aide: 'Mesures en degrés ; tu peux écrire un décimal (22,5).'
      };
    }
  });

  /* ================================================================== */
  /* 3e — VECTEURS                                                       */
  /* ================================================================== */
  function pointsDistincts(rng, k, lo, hi) {
    var pts = [], guard = 0;
    while (pts.length < k && guard++ < 500) {
      var p = [rng.int(lo, hi), rng.int(lo, hi)];
      if (!pts.some(function (q) { return q[0] === p[0] && q[1] === p[1]; })) pts.push(p);
    }
    return pts;
  }

  EM.gen.register({
    id: '3e-vecteurs-coordonnees',
    titre: 'Coordonnées de vecteurs, parallélogramme et translation',
    chapitres: ['3e-vecteurs'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var pts, A, B, C, guard = 0;
      do { pts = pointsDistincts(rng, 3, -6, 6); A = pts[0]; B = pts[1]; C = pts[2]; }
      while ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0 && guard++ < 100);
      var ab = [B[0] - A[0], B[1] - A[1]];
      var solAB = '$\\vect{AB}\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$, soit $\\vect{AB}\\begin{pmatrix} ' + T.num(B[0]) + ' - ' + T.par(A[0]) + ' \\\\ ' + T.num(B[1]) + ' - ' + T.par(A[1]) + ' \\end{pmatrix}$, donc $\\vect{AB}' + vcol(ab[0], ab[1]) + '$.';
      if (niveau === 1) {
        var u = [rng.int(-5, 5), rng.int(-5, 5)], v = [rng.int(-5, 5), rng.int(-5, 5)];
        if (u[0] === 0 && u[1] === 0) u[0] = 2;
        if (v[0] === 0 && v[1] === 0) v[1] = -3;
        var m = rng.pick([2, 3, -2, -1]), n = rng.pick([2, 3, -3, -2, -1, 1]);
        var w = [m * u[0] + n * v[0], m * u[1] + n * v[1]];
        var wTex = T.mono(m, '\\vect{u}', true) + T.mono(n, '\\vect{v}');
        return {
          enonce: 'Dans le plan muni d\'un repère orthonormal $(O, I, J)$, on donne les points $A' + coord(A[0], A[1]) + '$ et $B' + coord(B[0], B[1]) + '$, et les vecteurs $\\vect{u}' + vcol(u[0], u[1]) + '$ et $\\vect{v}' + vcol(v[0], v[1]) + '$.<br>' +
            '1) Calculer les coordonnées du vecteur $\\vect{AB}$.<br>2) Calculer les coordonnées du vecteur $\\vect{w} = ' + wTex + '$.',
          questions: [
            { label: '1) $\\vect{AB}$ :', type: 'tuple', reponse: ab },
            { label: '2) $\\vect{w}$ :', type: 'tuple', reponse: w }
          ],
          indices: ['$\\vect{AB}$ a pour coordonnées $(x_B - x_A\\,;\\,y_B - y_A)$.', 'Si $\\vect{u}(x\\,;\\,y)$ et $k$ est un réel, $k\\vect{u}$ a pour coordonnées $(kx\\,;\\,ky)$ ; on additionne ensuite coordonnée par coordonnée.'],
          solution: [
            solAB,
            '$' + wTex + '$ a pour coordonnées $\\begin{pmatrix} ' + T.num(m) + ' \\times ' + T.par(u[0]) + T.signed(n) + ' \\times ' + T.par(v[0]) + ' \\\\ ' + T.num(m) + ' \\times ' + T.par(u[1]) + T.signed(n) + ' \\times ' + T.par(v[1]) + ' \\end{pmatrix}$, donc $\\vect{w}' + vcol(w[0], w[1]) + '$.'
          ],
          aide: 'Écris les coordonnées sous la forme (x ; y), par exemple (3 ; -2).'
        };
      }
      var D = [C[0] - ab[0], C[1] - ab[1]], E = [C[0] + ab[0], C[1] + ab[1]];
      return {
        enonce: 'Dans le plan muni d\'un repère orthonormal $(O, I, J)$, on donne les points $A' + coord(A[0], A[1]) + '$, $B' + coord(B[0], B[1]) + '$ et $C' + coord(C[0], C[1]) + '$.<br>' +
          '1) Calculer les coordonnées du vecteur $\\vect{AB}$.<br>2) Déterminer les coordonnées du point $D$ tel que $ABCD$ soit un parallélogramme.<br>3) Déterminer les coordonnées du point $E$, image de $C$ par la translation de vecteur $\\vect{AB}$.',
        questions: [
          { label: '1) $\\vect{AB}$ :', type: 'tuple', reponse: ab },
          { label: '2) $D$ :', type: 'tuple', reponse: D },
          { label: '3) $E$ :', type: 'tuple', reponse: E }
        ],
        indices: ['$ABCD$ est un parallélogramme si et seulement si $\\vect{AB} = \\vect{DC}$.', '$E$ est l\'image de $C$ par la translation de vecteur $\\vect{AB}$ si et seulement si $\\vect{CE} = \\vect{AB}$.'],
        solution: [
          solAB,
          '$ABCD$ est un parallélogramme $\\iff \\vect{AB} = \\vect{DC}$. Avec $D(x\\,;\\,y)$ : $\\vect{DC}\\begin{pmatrix} ' + T.num(C[0]) + ' - x \\\\ ' + T.num(C[1]) + ' - y \\end{pmatrix}$, donc $' + T.num(C[0]) + ' - x = ' + T.num(ab[0]) + '$ et $' + T.num(C[1]) + ' - y = ' + T.num(ab[1]) + '$, soit $D' + coord(D[0], D[1]) + '$.',
          '$\\vect{CE} = \\vect{AB}$ : avec $E(x\\,;\\,y)$, $x - ' + T.par(C[0]) + ' = ' + T.num(ab[0]) + '$ et $y - ' + T.par(C[1]) + ' = ' + T.num(ab[1]) + '$, soit $E' + coord(E[0], E[1]) + '$.'
        ],
        aide: 'Écris les coordonnées sous la forme (x ; y), par exemple (3 ; -2).'
      };
    }
  });

  EM.gen.register({
    id: '3e-vecteurs-colinearite',
    titre: 'Vecteurs colinéaires et points alignés',
    chapitres: ['3e-vecteurs', '3e-reperage'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var k = rng.pick([F(2), F(3), F(-2), F(-1), F(1, 2), F(3, 2), F(-1, 2), F(-3, 2)]);
        var u = [k.d * rng.nz(-4, 4), k.d * rng.nz(-4, 4)];
        var v = [k.mul(u[0]).value(), k.mul(u[1]).value()];
        var col = rng.bool();
        if (!col) v[rng.int(0, 1)] += rng.pick([-1, 1]);
        var det = u[0] * v[1] - u[1] * v[0];
        if (det === 0) col = true;
        var ch = rng.shuffle(['colinéaires', 'non colinéaires']);
        return {
          enonce: 'Dans un repère orthonormal $(O, I, J)$, on donne $\\vect{u}' + vcol(u[0], u[1]) + '$ et $\\vect{v}' + vcol(v[0], v[1]) + '$.<br>1) Calculer $x y\' - x\' y$, où $(x\\,;\\,y)$ et $(x\'\\,;\\,y\')$ sont les coordonnées de $\\vect{u}$ et $\\vect{v}$.<br>2) Les vecteurs $\\vect{u}$ et $\\vect{v}$ sont-ils colinéaires ?',
          questions: [
            { label: '1) $xy\' - x\'y =$', type: 'number', reponse: det },
            { label: '2) $\\vect{u}$ et $\\vect{v}$ sont', type: 'choice', choix: ch, reponse: ch.indexOf(col ? 'colinéaires' : 'non colinéaires') }
          ],
          indices: ['Deux vecteurs $\\vect{u}(x\\,;\\,y)$ et $\\vect{v}(x\'\\,;\\,y\')$ sont colinéaires si et seulement si $xy\' - x\'y = 0$.'],
          solution: [
            '$xy\' - x\'y = ' + T.num(u[0]) + ' \\times ' + T.par(v[1]) + ' - ' + T.par(v[0]) + ' \\times ' + T.par(u[1]) + ' = ' + T.num(u[0] * v[1]) + ' - ' + T.par(v[0] * u[1]) + ' = ' + T.num(det) + '$.',
            det === 0 ? 'Le résultat est nul : $\\vect{u}$ et $\\vect{v}$ sont colinéaires (ici $\\vect{v} = ' + T.mono(k, '\\vect{u}', true) + '$).' : 'Le résultat n\'est pas nul : $\\vect{u}$ et $\\vect{v}$ ne sont pas colinéaires.'
          ]
        };
      }
      if (rng.bool()) {
        var b = rng.nz(-6, 6), c = rng.nz(-6, 6), d = rng.nz(-6, 6);
        var m = F(b * c, d);
        return {
          enonce: 'Dans un repère orthonormal $(O, I, J)$, on donne $\\vect{u}' + vcol('m', b) + '$ et $\\vect{v}' + vcol(c, d) + '$, où $m$ est un réel.<br>Déterminer $m$ pour que $\\vect{u}$ et $\\vect{v}$ soient colinéaires.',
          questions: [{ label: '$m =$', type: 'number', reponse: m }],
          indices: ['Écris la condition de colinéarité $xy\' - x\'y = 0$.', 'Tu obtiens une équation du premier degré en $m$.'],
          solution: [
            '$\\vect{u}$ et $\\vect{v}$ sont colinéaires $\\iff m \\times ' + T.par(d) + ' - ' + T.par(c) + ' \\times ' + T.par(b) + ' = 0$.',
            '$\\iff ' + T.mono(d, 'm', true) + T.signed(-b * c) + ' = 0 \\iff ' + (d === 1 ? '' : T.mono(d, 'm', true) + ' = ' + T.num(b * c) + ' \\iff ') + 'm = ' + m.tex() + '$.'
          ]
        };
      }
      var pts, guard = 0, A, B, yC;
      do { pts = pointsDistincts(rng, 2, -5, 5); A = pts[0]; B = pts[1]; } while (B[1] === A[1] && guard++ < 100);
      var x1 = B[0] - A[0], y1 = B[1] - A[1];
      do { yC = rng.int(-6, 6); } while (yC === A[1]);
      var mC = F(x1 * (yC - A[1]), y1).add(A[0]);
      return {
        enonce: 'Dans un repère orthonormal $(O, I, J)$, on donne les points $A' + coord(A[0], A[1]) + '$, $B' + coord(B[0], B[1]) + '$ et $C' + coord('m', yC) + '$, où $m$ est un réel.<br>Déterminer $m$ pour que les points $A$, $B$ et $C$ soient alignés.',
        questions: [{ label: '$m =$', type: 'number', reponse: mC }],
        indices: ['$A$, $B$, $C$ sont alignés si et seulement si $\\vect{AB}$ et $\\vect{AC}$ sont colinéaires.', 'Calcule les coordonnées de $\\vect{AB}$ et $\\vect{AC}$ puis écris $xy\' - x\'y = 0$.'],
        solution: [
          '$\\vect{AB}' + vcol(x1, y1) + '$ et $\\vect{AC}\\begin{pmatrix} m - ' + T.par(A[0]) + ' \\\\ ' + T.num(yC) + ' - ' + T.par(A[1]) + ' \\end{pmatrix}$, soit $\\vect{AC}\\begin{pmatrix} ' + T.sum([{ c: 1, v: 'm' }, { c: -A[0] }]) + ' \\\\ ' + T.num(yC - A[1]) + ' \\end{pmatrix}$.',
          '$A$, $B$, $C$ alignés $\\iff \\vect{AB}$ et $\\vect{AC}$ colinéaires $\\iff ' + T.num(x1) + ' \\times ' + T.par(yC - A[1]) + ' - \\left(' + T.sum([{ c: 1, v: 'm' }, { c: -A[0] }]) + '\\right) \\times ' + T.par(y1) + ' = 0$.',
          '$\\iff ' + T.num(x1 * (yC - A[1])) + T.mono(-y1, 'm') + T.signed(A[0] * y1) + ' = 0 \\iff ' + T.mono(y1, 'm', true) + ' = ' + T.num(x1 * (yC - A[1]) + A[0] * y1) + ' \\iff m = ' + mC.tex() + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 3e — REPÉRAGE                                                       */
  /* ================================================================== */
  function distTex(n1, P1, P2, d) {
    return n1 + ' = \\sqrt{\\left(' + T.num(P2[0]) + ' - ' + T.par(P1[0]) + '\\right)^2 + \\left(' + T.num(P2[1]) + ' - ' + T.par(P1[1]) + '\\right)^2} = \\sqrt{' + T.par(P2[0] - P1[0]) + '^2 + ' + T.par(P2[1] - P1[1]) + '^2} = \\sqrt{' + d + '}' +
      (T.sqrt(d) === '\\sqrt{' + d + '}' ? '' : ' = ' + T.sqrt(d));
  }
  function d2(P1, P2) { return (P2[0] - P1[0]) * (P2[0] - P1[0]) + (P2[1] - P1[1]) * (P2[1] - P1[1]); }

  EM.gen.register({
    id: '3e-reperage-distance-milieu',
    titre: 'Distance, milieu et nature d\'un triangle dans un repère',
    chapitres: ['3e-reperage'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var pts = pointsDistincts(rng, 2, -6, 6), A = pts[0], B = pts[1];
        var K = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)], dAB = d2(A, B);
        return {
          enonce: 'Dans le plan muni d\'un repère orthonormal $(O, I, J)$, on donne $A' + coord(A[0], A[1]) + '$ et $B' + coord(B[0], B[1]) + '$.<br>1) Calculer les coordonnées du point $K$, milieu du segment $[AB]$.<br>2) Calculer la distance $AB$ (valeur exacte).',
          questions: [
            { label: '1) $K$ :', type: 'tuple', reponse: K },
            { label: '2) $AB =$', type: 'number', reponse: 'sqrt(' + dAB + ')', reponseTex: T.sqrt(dAB) }
          ],
          indices: ['Milieu : $x_K = \\dfrac{x_A + x_B}{2}$ et $y_K = \\dfrac{y_A + y_B}{2}$.', 'Distance dans un repère orthonormal : $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.'],
          solution: [
            '$x_K = \\dfrac{' + T.num(A[0]) + ' + ' + T.par(B[0]) + '}{2} = ' + K[0].tex() + '$ et $y_K = \\dfrac{' + T.num(A[1]) + ' + ' + T.par(B[1]) + '}{2} = ' + K[1].tex() + '$, donc $K' + coord(K[0], K[1]) + '$.',
            '$' + distTex('AB', A, B, dAB) + '$.'
          ],
          aide: 'Coordonnées sous la forme (x ; y) ; pour une racine, écris √20 ou 2√5.'
        };
      }
      var nat = rng.pick(['rect', 'iso', 'rectiso', 'quel']);
      var A, B, C, p, q, guard = 0;
      do {
        A = [rng.int(-3, 3), rng.int(-3, 3)];
        p = rng.nz(-3, 3); q = rng.nz(-3, 3);
        B = [A[0] + p, A[1] + q];
        if (nat === 'rect') C = [A[0] - 2 * q, A[1] + 2 * p];
        else if (nat === 'rectiso') C = rng.bool() ? [A[0] - q, A[1] + p] : [A[0] + q, A[1] - p];
        else if (nat === 'iso') C = [A[0] + q, A[1] + p];
        else C = [rng.int(-6, 6), rng.int(-6, 6)];
        var ab = d2(A, B), ac = d2(A, C), bc = d2(B, C);
        var aligne = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0;
        var ok = !aligne;
        if (nat === 'iso') ok = ok && p * p !== q * q;
        if (nat === 'quel') ok = ok && ab !== ac && ab !== bc && ac !== bc && bc !== ab + ac && ac !== ab + bc && ab !== ac + bc;
      } while (!ok && guard++ < 200);
      if (!ok) { A = [0, 0]; B = [3, 1]; C = [-1, 3]; nat = 'rectiso'; ab = 10; ac = 10; bc = 20; }
      var lib = { rect: 'rectangle en $A$', iso: 'isocèle en $A$', rectiso: 'rectangle et isocèle en $A$', quel: 'quelconque' };
      var ch = rng.shuffle(['rect', 'iso', 'rectiso', 'quel']);
      var concl;
      if (nat === 'rectiso') concl = 'On a $AB = AC$ et $BC^2 = ' + bc + ' = ' + ab + ' + ' + ac + ' = AB^2 + AC^2$ : d\'après la réciproque du théorème de Pythagore, le triangle $ABC$ est rectangle en $A$ ; il est aussi isocèle en $A$.';
      else if (nat === 'rect') concl = '$BC^2 = ' + bc + '$ et $AB^2 + AC^2 = ' + ab + ' + ' + ac + ' = ' + (ab + ac) + '$ : $BC^2 = AB^2 + AC^2$, donc d\'après la réciproque du théorème de Pythagore, $ABC$ est rectangle en $A$ (et $AB \\neq AC$).';
      else if (nat === 'quel') concl = 'Les trois longueurs sont différentes et aucun des carrés n\'est la somme des deux autres ($' + ab + '$, $' + ac + '$, $' + bc + '$) : le triangle n\'est ni isocèle ni rectangle, il est quelconque.';
      else concl = '$AB = AC$ : le triangle est isocèle en $A$. Il n\'est pas rectangle : aucun des carrés $' + ab + '$, $' + ac + '$, $' + bc + '$ n\'est la somme des deux autres.';
      return {
        enonce: 'Dans le plan muni d\'un repère orthonormal $(O, I, J)$, on donne $A' + coord(A[0], A[1]) + '$, $B' + coord(B[0], B[1]) + '$ et $C' + coord(C[0], C[1]) + '$.<br>1) Calculer les distances $AB$, $AC$ et $BC$ (valeurs exactes).<br>2) En déduire la nature du triangle $ABC$.',
        questions: [
          { label: '1) $AB =$', type: 'number', reponse: 'sqrt(' + ab + ')', reponseTex: T.sqrt(ab) },
          { label: '1) $AC =$', type: 'number', reponse: 'sqrt(' + ac + ')', reponseTex: T.sqrt(ac) },
          { label: '1) $BC =$', type: 'number', reponse: 'sqrt(' + bc + ')', reponseTex: T.sqrt(bc) },
          { label: '2) Le triangle $ABC$ est', type: 'choice', choix: ch.map(function (c) { return lib[c]; }), reponse: ch.indexOf(nat) }
        ],
        indices: ['$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.', 'Compare les longueurs (triangle isocèle ?) et utilise la réciproque du théorème de Pythagore (triangle rectangle ?).'],
        solution: ['$' + distTex('AB', A, B, ab) + '$', '$' + distTex('AC', A, C, ac) + '$', '$' + distTex('BC', B, C, bc) + '$', concl],
        aide: 'Pour une racine, écris √20 ou 2√5.'
      };
    }
  });

  EM.gen.register({
    id: '3e-equation-droite',
    titre: 'Équation de droite : par deux points, parallèle, perpendiculaire',
    chapitres: ['3e-reperage', '2l-fonctions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var A, B, a, b, guard = 0;
      if (niveau === 1) {
        var a0 = rng.nz(-4, 4), b0 = rng.int(-6, 6);
        var xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4], 2);
        A = [xs[0], a0 * xs[0] + b0]; B = [xs[1], a0 * xs[1] + b0];
      } else {
        var pts;
        do { pts = pointsDistincts(rng, 2, -6, 6); A = pts[0]; B = pts[1]; } while ((A[0] === B[0] || A[1] === B[1]) && guard++ < 100);
      }
      a = F(B[1] - A[1], B[0] - A[0]); b = F(A[1]).sub(a.mul(A[0]));
      var eqAB = lin(a, b);
      var sol = [
        'La droite $(AB)$ n\'est pas parallèle à l\'axe des ordonnées ($x_A \\neq x_B$) : elle a une équation de la forme $y = ax + b$.',
        'Coefficient directeur : $a = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{' + T.num(B[1]) + ' - ' + T.par(A[1]) + '}{' + T.num(B[0]) + ' - ' + T.par(A[0]) + '} = \\dfrac{' + (B[1] - A[1]) + '}{' + (B[0] - A[0]) + '}' +
          (B[0] - A[0] === a.d && B[1] - A[1] === a.n ? '' : ' = ' + a.tex()) + '$.',
        '$A \\in (AB)$ : $' + T.num(A[1]) + ' = ' + a.tex() + ' \\times ' + T.par(A[0]) + ' + b$, donc $b = ' + T.num(A[1]) + ' - ' + T.par(a.mul(A[0])) + ' = ' + T.num(b) + '$.',
        'Une équation de $(AB)$ est $y = ' + eqAB + '$.'
      ];
      var qs = [{ label: '$(AB) : y =$', type: 'expr', reponse: ps(a) + '*x+' + ps(b), reponseTex: eqAB }];
      var enonce = 'Dans le plan muni d\'un repère orthonormal $(O, I, J)$, on donne les points $A' + coord(A[0], A[1]) + '$ et $B' + coord(B[0], B[1]) + '$.<br>1) Déterminer une équation de la droite $(AB)$ sous la forme $y = ax + b$.';
      if (niveau >= 2) {
        var Cp;
        do { Cp = [rng.int(-5, 5), rng.int(-5, 5)]; } while (a.mul(Cp[0]).add(b).equals(Cp[1]) && guard++ < 200);
        var perp = niveau === 3;
        var a2 = perp ? F(-1).div(a) : a, b2 = F(Cp[1]).sub(a2.mul(Cp[0]));
        var nomD = perp ? '\\Delta' : 'D';
        enonce += '<br>2) Déterminer une équation de la droite $(' + nomD + ')$ passant par $C' + coord(Cp[0], Cp[1]) + '$ et ' + (perp ? 'perpendiculaire' : 'parallèle') + ' à $(AB)$.';
        qs[0].label = '1) ' + qs[0].label;
        qs.push({ label: '2) $(' + nomD + ') : y =$', type: 'expr', reponse: ps(a2) + '*x+' + ps(b2), reponseTex: lin(a2, b2) });
        sol.push(perp
          ? 'Dans un repère orthonormal, deux droites de coefficients directeurs $a$ et $a\'$ sont perpendiculaires si et seulement si $a \\times a\' = -1$. Donc $a\' = -\\dfrac{1}{' + (a.n < 0 ? '\\left(' + a.tex() + '\\right)' : a.tex()) + '} = ' + a2.tex() + '$.'
          : 'Deux droites parallèles ont le même coefficient directeur : $(' + nomD + ')$ a pour coefficient directeur $' + a.tex() + '$.');
        sol.push('$C \\in (' + nomD + ')$ : $' + T.num(Cp[1]) + ' = ' + a2.tex() + ' \\times ' + T.par(Cp[0]) + ' + p$, donc $p = ' + T.num(Cp[1]) + ' - ' + T.par(a2.mul(Cp[0])) + ' = ' + T.num(b2) + '$.');
        sol.push('Une équation de $(' + nomD + ')$ est $y = ' + lin(a2, b2) + '$.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Coefficient directeur de $(AB)$ : $a = \\dfrac{y_B - y_A}{x_B - x_A}$ ; on trouve ensuite $b$ en écrivant que $A$ appartient à la droite.',
          niveau === 3 ? 'Deux droites sont perpendiculaires lorsque le produit de leurs coefficients directeurs vaut $-1$.' : 'Deux droites parallèles ont le même coefficient directeur.'
        ],
        solution: sol,
        aide: 'Écris seulement le membre de droite, par exemple -2x+3 ou 1/2x-4.'
      };
    }
  });

  /* ================================================================== */
  /* 3e — GÉOMÉTRIE DANS L'ESPACE                                        */
  /* ================================================================== */
  EM.gen.register({
    id: '3e-espace-volumes',
    titre: 'Volumes : pyramide, cône et boule',
    chapitres: ['3e-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var c, h, r, V, guard = 0;
      if (niveau === 1) {
        var type = rng.pick(['pyramide', 'cone', 'boule']);
        if (type === 'pyramide') {
          do { c = rng.int(2, 12); h = rng.int(3, 15); } while ((c * c * h) % 3 !== 0 && guard++ < 100);
          V = c * c * h / 3;
          return {
            enonce: '$SABCD$ est une pyramide régulière de sommet $S$, dont la base $ABCD$ est un carré de côté $' + c + '$ cm. Sa hauteur $[SO]$ mesure $' + h + '$ cm.<br>Calculer le volume de cette pyramide.',
            questions: [{ label: '$V =$', type: 'number', reponse: V, unite: 'cm³' }],
            indices: ['Volume d\'une pyramide : $V = \\dfrac{\\text{aire de la base} \\times \\text{hauteur}}{3}$.'],
            solution: ['Aire de la base : $\\mathscr{B} = ' + c + '^2 = ' + c * c + '$ cm².', '$V = \\dfrac{\\mathscr{B} \\times h}{3} = \\dfrac{' + c * c + ' \\times ' + h + '}{3} = ' + T.num(V) + '$ cm³.']
          };
        }
        if (type === 'cone') {
          do { r = rng.int(2, 9); h = rng.int(3, 15); } while ((r * r * h) % 3 !== 0 && guard++ < 100);
          var k = r * r * h / 3;
          return {
            enonce: 'Un cône de révolution a pour rayon de base $r = ' + r + '$ cm et pour hauteur $h = ' + h + '$ cm.<br>1) Calculer la valeur exacte de son volume (en fonction de $\\pi$).<br>2) En donner l\'arrondi au cm³.',
            questions: [
              { label: '1) $V =$', type: 'number', reponse: k + '*pi', reponseTex: T.num(k) + '\\pi', unite: 'cm³' },
              { label: '2) $V \\approx$', type: 'number', reponse: Math.round(k * Math.PI), tol: 0.51, unite: 'cm³' }
            ],
            indices: ['Volume d\'un cône : $V = \\dfrac{\\pi r^2 h}{3}$.'],
            solution: ['$V = \\dfrac{\\pi \\times ' + r + '^2 \\times ' + h + '}{3} = \\dfrac{' + r * r * h + '\\pi}{3} = ' + T.num(k) + '\\pi$ cm³.', '$V \\approx ' + approx(k * Math.PI, 2) + '$, soit environ $' + T.num(Math.round(k * Math.PI)) + '$ cm³.'],
            aide: 'Pour la valeur exacte, écris par exemple 12π ou 12pi.'
          };
        }
        r = rng.int(1, 9);
        var kV = F(4 * r * r * r, 3), kA = 4 * r * r;
        return {
          enonce: 'Une boule a pour rayon $r = ' + r + '$ cm.<br>1) Calculer la valeur exacte de l\'aire de la sphère qui la limite.<br>2) Calculer la valeur exacte du volume de la boule.',
          questions: [
            { label: '1) $\\mathscr{A} =$', type: 'number', reponse: kA + '*pi', reponseTex: T.num(kA) + '\\pi', unite: 'cm²' },
            { label: '2) $V =$', type: 'number', reponse: '(' + kV.n + '/' + kV.d + ')*pi', reponseTex: kV.tex() + '\\pi', unite: 'cm³' }
          ],
          indices: ['Aire d\'une sphère : $\\mathscr{A} = 4\\pi r^2$.', 'Volume d\'une boule : $V = \\dfrac{4}{3}\\pi r^3$.'],
          solution: ['$\\mathscr{A} = 4\\pi \\times ' + r + '^2 = ' + T.num(kA) + '\\pi$ cm².', '$V = \\dfrac{4}{3}\\pi \\times ' + r + '^3 = \\dfrac{4 \\times ' + r * r * r + '}{3}\\pi = ' + kV.tex() + '\\pi$ cm³.'],
          aide: 'Écris par exemple 36π ou (500/3)π.'
        };
      }
      var ctx = rng.pick([
        { t: 'À Kaffrine, des graines d\'arachide sont stockées en un tas qui a la forme d\'un cône de révolution.', tr: [[2.4, 1.8, 3], [3, 4, 5], [3.6, 1.5, 3.9], [2.1, 2.8, 3.5]] },
        { t: 'Le toit d\'une case du village de Mlomp, en Casamance, a la forme d\'un cône de révolution.', tr: [[2.4, 1.8, 3], [2, 1.5, 2.5], [1.6, 1.2, 2]] }
      ]);
      var tri = rng.pick(ctx.tr);
      r = tri[0]; h = tri[1]; var g = tri[2];
      V = Math.PI * r * r * h / 3;
      return {
        enonce: ctx.t + ' Le rayon de la base mesure $' + T.num(r) + '$ m et une génératrice mesure $' + T.num(g) + '$ m.<br>1) Calculer la hauteur du cône.<br>2) Calculer son volume, arrondi au centième de m³.',
        questions: [
          { label: '1) $h =$', type: 'number', reponse: h, unite: 'm' },
          { label: '2) $V \\approx$', type: 'number', reponse: ar.round(V, 2), tol: 0.006, unite: 'm³' }
        ],
        indices: ['La hauteur, un rayon de la base et une génératrice forment un triangle rectangle : utilise le théorème de Pythagore.', 'Volume d\'un cône : $V = \\dfrac{\\pi r^2 h}{3}$.'],
        solution: [
          'Le triangle formé par la hauteur $[SO]$, le rayon $[OA]$ et la génératrice $[SA]$ est rectangle en $O$.',
          'D\'après le théorème de Pythagore : $SO^2 = SA^2 - OA^2 = ' + T.num(g) + '^2 - ' + T.num(r) + '^2 = ' + T.num(ar.round(g * g, 4)) + ' - ' + T.num(ar.round(r * r, 4)) + ' = ' + T.num(ar.round(h * h, 4)) + '$, donc $h = SO = ' + T.num(h) + '$ m.',
          '$V = \\dfrac{\\pi \\times ' + T.num(r) + '^2 \\times ' + T.num(h) + '}{3} = ' + T.num(ar.round(r * r * h / 3, 4)) + '\\pi \\approx ' + approx(V, 4) + '$, soit $V \\approx ' + T.num(ar.round(V, 2)) + '$ m³.'
        ],
        aide: 'Utilise la touche π de la calculatrice ; arrondis seulement à la fin.'
      };
    }
  });

  EM.gen.register({
    id: '3e-espace-section',
    titre: 'Section d\'une pyramide ou d\'un cône par un plan parallèle à la base',
    chapitres: ['3e-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var k = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(2, 5), F(3, 5)]);
      var guard = 0, m, h, hp, c, cp, V, Vp;
      if (niveau === 1) {
        do {
          m = rng.int(2, 5); h = k.d * m; hp = k.n * m;
          c = k.d * rng.int(1, 4); cp = k.n * c / k.d;
          V = F(c * c * h, 3); Vp = F(cp * cp * hp, 3);
        } while ((!V.isInt() || !Vp.isInt() || c < 3) && guard++ < 200);
        return {
          enonce: '$SABCD$ est une pyramide régulière de sommet $S$, de hauteur $SO = ' + h + '$ cm, dont la base est un carré de côté $' + c + '$ cm. On coupe cette pyramide par un plan parallèle à la base, qui coupe la hauteur $[SO]$ en $O\'$ tel que $SO\' = ' + hp + '$ cm. La section est un carré $A\'B\'C\'D\'$.<br>' +
            '1) Calculer le coefficient de réduction $k$.<br>2) Calculer le côté $A\'B\'$ de la section.<br>3) Calculer le volume de la petite pyramide $SA\'B\'C\'D\'$.',
          questions: [
            { label: '1) $k =$', type: 'number', reponse: k },
            { label: '2) $A\'B\' =$', type: 'number', reponse: cp, unite: 'cm' },
            { label: '3) $V\' =$', type: 'number', reponse: Vp, unite: 'cm³' }
          ],
          indices: ['La petite pyramide est une réduction de la grande, de coefficient $k = \\dfrac{SO\'}{SO}$.', 'Les longueurs sont multipliées par $k$, les aires par $k^2$, les volumes par $k^3$.'],
          solution: [
            'La section par un plan parallèle à la base est une réduction de la base ; la petite pyramide est une réduction de la grande de coefficient $k = \\dfrac{SO\'}{SO} = \\dfrac{' + hp + '}{' + h + '} = ' + k.tex() + '$.',
            '$A\'B\' = k \\times AB = ' + k.tex() + ' \\times ' + c + ' = ' + cp + '$ cm.',
            'Volume de la grande pyramide : $V = \\dfrac{' + c + '^2 \\times ' + h + '}{3} = ' + T.num(V) + '$ cm³. Donc $V\' = k^3 \\times V = \\left(' + k.tex() + '\\right)^3 \\times ' + T.num(V) + ' = ' + T.num(Vp) + '$ cm³.'
          ]
        };
      }
      var R;
      do { m = rng.int(2, 5); h = k.d * m; hp = k.n * m; R = k.d * rng.int(1, 3); } while ((R < 3 || (R * R * h) % 3 !== 0) && guard++ < 200);
      var rp = k.n * R / k.d;
      var Vc = F(R * R * h, 3), Vpc = Vc.mul(k.pow(3)), Vt = Vc.sub(Vpc);
      return {
        enonce: 'Un cône de révolution de sommet $S$ a pour hauteur $SO = ' + h + '$ cm et pour rayon de base $' + R + '$ cm. On le coupe par un plan parallèle à la base, à $' + hp + '$ cm du sommet $S$ : on obtient un petit cône de sommet $S$ et un tronc de cône.<br>' +
          '1) Calculer le coefficient de réduction $k$.<br>2) Calculer le rayon $r\'$ de la section.<br>3) Calculer la valeur exacte du volume du tronc de cône (en fonction de $\\pi$).',
        questions: [
          { label: '1) $k =$', type: 'number', reponse: k },
          { label: '2) $r\' =$', type: 'number', reponse: rp, unite: 'cm' },
          { label: '3) $V_{\\text{tronc}} =$', type: 'number', reponse: '(' + Vt.n + '/' + Vt.d + ')*pi', reponseTex: T.num(Vt) + '\\pi', unite: 'cm³' }
        ],
        indices: ['Le petit cône est une réduction du grand de coefficient $k = \\dfrac{' + hp + '}{' + h + '}$.', 'Volume du tronc = volume du grand cône − volume du petit cône, et $V_{\\text{petit}} = k^3 \\times V_{\\text{grand}}$.'],
        solution: [
          'Le petit cône est une réduction du grand de coefficient $k = \\dfrac{' + hp + '}{' + h + '} = ' + k.tex() + '$.',
          'La section est un disque de rayon $r\' = k \\times ' + R + ' = ' + T.num(rp) + '$ cm.',
          'Volume du grand cône : $V = \\dfrac{\\pi \\times ' + R + '^2 \\times ' + h + '}{3} = ' + T.num(Vc) + '\\pi$ cm³. Volume du petit cône : $V\' = k^3 V = \\left(' + k.tex() + '\\right)^3 \\times ' + T.num(Vc) + '\\pi = ' + T.num(Vpc) + '\\pi$ cm³.',
          'Volume du tronc de cône : $V - V\' = ' + T.num(Vc) + '\\pi - ' + T.num(Vpc) + '\\pi = ' + T.num(Vt) + '\\pi$ cm³.'
        ],
        aide: 'Pour la valeur exacte, écris par exemple 56π ou (112/3)π.'
      };
    }
  });

  /* ================================================================== */
  /* 2nde L — POURCENTAGES                                               */
  /* ================================================================== */
  function cmTex(t) { return T.num(ar.round(1 + t / 100, 6)); }

  EM.gen.register({
    id: '2l-pourcentages-evolutions',
    titre: 'Évolutions en pourcentage : coefficient multiplicateur, taux, évolutions successives',
    chapitres: ['2l-pourcentages'],
    niveaux: 3,
    examen: false,
    gen: function (rng, niveau) {
      var ctx = rng.pick([
        { q: 'Le prix du sac de riz de 50 kg', v0: function () { return 500 * rng.int(36, 50); }, u: 'F CFA' },
        { q: 'Le prix du litre d\'huile', v0: function () { return 100 * rng.int(10, 20); }, u: 'F CFA' },
        { q: 'Le nombre d\'élèves inscrits dans un lycée de Thiès', v0: function () { return 100 * rng.int(8, 30); }, u: 'élèves' },
        { q: 'La production de mangues d\'un verger de Casamance', v0: function () { return 100 * rng.int(20, 90); }, u: 'kg', f: true },
        { q: 'Le loyer mensuel d\'un appartement à Dakar', v0: function () { return 5000 * rng.int(15, 40); }, u: 'F CFA' }
      ]);
      var taux = [5, 10, 12, 15, 20, 25, 30, 40];
      var v0 = ctx.v0(), t, v1, sens;
      if (niveau === 1) {
        t = rng.pick(taux) * rng.sign();
        v1 = ar.round(v0 * (1 + t / 100), 6);
        sens = t > 0 ? 'augmente' : 'diminue';
        return {
          enonce: ctx.q + ' était de $' + T.num(v0) + '$ ' + ctx.u + '. ' + (ctx.f ? 'Elle ' : 'Il ') + sens + ' de $' + Math.abs(t) + '$ %.<br>1) Donner le coefficient multiplicateur associé à cette évolution.<br>2) Calculer la nouvelle valeur.',
          questions: [
            { label: '1) Coefficient multiplicateur :', type: 'number', reponse: ar.round(1 + t / 100, 6) },
            { label: '2) Nouvelle valeur :', type: 'number', reponse: v1, unite: ctx.u }
          ],
          indices: ['Augmenter de $t$ % revient à multiplier par $1 + \\dfrac{t}{100}$ ; diminuer de $t$ % revient à multiplier par $1 - \\dfrac{t}{100}$.'],
          solution: [
            (t > 0 ? 'Une hausse' : 'Une baisse') + ' de $' + Math.abs(t) + '$ % correspond au coefficient multiplicateur $1 ' + (t > 0 ? '+' : '-') + ' \\dfrac{' + Math.abs(t) + '}{100} = ' + cmTex(t) + '$.',
            'Nouvelle valeur : $' + T.num(v0) + ' \\times ' + cmTex(t) + ' = ' + T.num(v1) + '$ ' + ctx.u + '.'
          ]
        };
      }
      if (niveau === 2) {
        t = rng.pick(taux.concat([8, 35, 50])) * rng.sign();
        v1 = ar.round(v0 * (1 + t / 100), 6);
        var cm = ar.round(v1 / v0, 6);
        return {
          enonce: ctx.q + (ctx.f ? ' est passée de $' : ' est passé de $') + T.num(v0) + '$ ' + ctx.u + ' à $' + T.num(v1) + '$ ' + ctx.u + '.<br>1) Calculer le coefficient multiplicateur.<br>2) En déduire le taux d\'évolution, en pourcentage (négatif s\'il s\'agit d\'une baisse).',
          questions: [
            { label: '1) Coefficient multiplicateur :', type: 'number', reponse: cm },
            { label: '2) Taux d\'évolution (en %) :', type: 'number', reponse: t }
          ],
          indices: ['Coefficient multiplicateur : $\\dfrac{\\text{valeur finale}}{\\text{valeur initiale}}$.', 'Taux d\'évolution : $t = (CM - 1) \\times 100$, ou $\\dfrac{V_1 - V_0}{V_0} \\times 100$.'],
          solution: [
            '$CM = \\dfrac{' + T.num(v1) + '}{' + T.num(v0) + '} = ' + T.num(cm) + '$.',
            '$t = (' + T.num(cm) + ' - 1) \\times 100 = ' + T.num(t) + '$ : ' + (t > 0 ? 'c\'est une hausse de $' + t + '$ %.' : 'c\'est une baisse de $' + Math.abs(t) + '$ %.'),
            'Vérification : $\\dfrac{' + T.num(v1) + ' - ' + T.num(v0) + '}{' + T.num(v0) + '} \\times 100 = ' + T.num(t) + '$.'
          ],
          aide: 'Pour une baisse de 12 %, écris -12.'
        };
      }
      var t1 = rng.pick(taux) * rng.sign(), t2 = rng.pick(taux) * rng.sign();
      if (t1 === -t2) t2 = -t2 === 40 ? 30 : t2 + (t2 > 0 ? 5 : -5);
      var c = F(100 + t1, 100).mul(F(100 + t2, 100));
      var tg = ar.round((c.value() - 1) * 100, 6);
      var mot = function (x) { return x > 0 ? 'une hausse de $' + x + '$ %' : 'une baisse de $' + Math.abs(x) + '$ %'; };
      return {
        enonce: ctx.q + ' a subi ' + mot(t1) + ', puis ' + mot(t2) + '.<br>1) Calculer le coefficient multiplicateur global.<br>2) En déduire le taux d\'évolution global, en pourcentage (négatif s\'il s\'agit d\'une baisse).',
        questions: [
          { label: '1) Coefficient multiplicateur global :', type: 'number', reponse: ar.round(c.value(), 8) },
          { label: '2) Taux global (en %) :', type: 'number', reponse: tg }
        ],
        indices: ['Des évolutions successives se traduisent par le <b>produit</b> des coefficients multiplicateurs.', 'Attention : les taux ne s\'additionnent pas !'],
        solution: [
          'Coefficients : $' + cmTex(t1) + '$ pour la première évolution et $' + cmTex(t2) + '$ pour la seconde.',
          'Coefficient global : $' + cmTex(t1) + ' \\times ' + cmTex(t2) + ' = ' + T.num(c.value()) + '$.',
          'Taux global : $(' + T.num(c.value()) + ' - 1) \\times 100 = ' + T.num(tg) + '$ : ' + (tg > 0 ? 'hausse globale de $' + T.num(tg) + '$ %' : tg < 0 ? 'baisse globale de $' + T.num(-tg) + '$ %' : 'retour à la valeur de départ') +
            ' (et non $' + T.num(t1 + t2) + '$ % : les taux ne s\'additionnent pas).'
        ],
        aide: 'Pour une baisse de 4 %, écris -4.'
      };
    }
  });

  EM.gen.register({
    id: '2l-pourcentages-prix',
    titre: 'TVA, remises et prix initial',
    chapitres: ['2l-pourcentages'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var obj = rng.pick(['un téléviseur', 'un réfrigérateur', 'un ventilateur', 'une machine à coudre', 'un téléphone portable']);
        var ville = rng.pick(['Touba', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor']);
        var ht = 500 * rng.int(8, 120), tva = ht * 18 / 100, ttc = ht + tva;
        if (rng.bool()) {
          return {
            enonce: 'Dans un magasin de ' + ville + ', ' + obj + ' coûte $' + T.num(ht) + '$ F CFA hors taxes (HT). Le taux de TVA est de $18$ %.<br>1) Calculer le montant de la TVA.<br>2) Calculer le prix toutes taxes comprises (TTC).',
            questions: [
              { label: '1) TVA :', type: 'number', reponse: tva, unite: 'F CFA' },
              { label: '2) Prix TTC :', type: 'number', reponse: ttc, unite: 'F CFA' }
            ],
            indices: ['TVA $= 18$ % du prix HT, soit prix HT $\\times 0{,}18$.', 'Prix TTC $=$ prix HT $+$ TVA $=$ prix HT $\\times 1{,}18$.'],
            solution: [
              'TVA $= ' + T.num(ht) + ' \\times \\dfrac{18}{100} = ' + T.num(tva) + '$ F CFA.',
              'Prix TTC $= ' + T.num(ht) + ' + ' + T.num(tva) + ' = ' + T.num(ttc) + '$ F CFA (ou directement $' + T.num(ht) + ' \\times 1{,}18$).'
            ]
          };
        }
        return {
          enonce: 'Dans un magasin de ' + ville + ', ' + obj + ' est affiché à $' + T.num(ttc) + '$ F CFA toutes taxes comprises (TTC). Le taux de TVA est de $18$ %.<br>1) Calculer le prix hors taxes (HT).<br>2) Calculer le montant de la TVA.',
          questions: [
            { label: '1) Prix HT :', type: 'number', reponse: ht, unite: 'F CFA' },
            { label: '2) TVA :', type: 'number', reponse: tva, unite: 'F CFA' }
          ],
          indices: ['Prix TTC $=$ prix HT $\\times 1{,}18$ : pour retrouver le prix HT, on divise par $1{,}18$.'],
          solution: [
            'Prix TTC $=$ prix HT $\\times 1{,}18$, donc prix HT $= \\dfrac{' + T.num(ttc) + '}{1{,}18} = ' + T.num(ht) + '$ F CFA.',
            'TVA $= ' + T.num(ttc) + ' - ' + T.num(ht) + ' = ' + T.num(tva) + '$ F CFA.',
            'Attention : la TVA n\'est pas $18$ % du prix TTC ($' + T.num(ttc) + ' \\times 0{,}18 \\approx ' + approx(ttc * 0.18, 0) + '$ serait faux).'
          ]
        };
      }
      var art = rng.pick(['un boubou en bazin', 'une paire de chaussures', 'un tissu wax', 'un sac de voyage']);
      if (rng.bool()) {
        var r = rng.pick([10, 15, 20, 25, 30, 40]), p0 = 1000 * rng.int(5, 60), p1 = p0 * (100 - r) / 100;
        return {
          enonce: 'À l\'approche de la Tabaski, un commerçant du marché HLM de Dakar accorde une remise de $' + r + '$ % sur ' + art + '. Après la remise, Ndèye paie $' + T.num(p1) + '$ F CFA.<br>Calculer le prix avant la remise.',
          questions: [{ label: 'Prix avant remise :', type: 'number', reponse: p0, unite: 'F CFA' }],
          indices: ['Une remise de $' + r + '$ % revient à multiplier le prix par $1 - \\dfrac{' + r + '}{100} = ' + cmTex(-r) + '$.', 'Pour retrouver le prix initial, divise le prix payé par ce coefficient.'],
          solution: [
            'Une baisse de $' + r + '$ % correspond au coefficient multiplicateur $' + cmTex(-r) + '$ : prix payé $=$ prix initial $\\times ' + cmTex(-r) + '$.',
            'Prix initial $= \\dfrac{' + T.num(p1) + '}{' + cmTex(-r) + '} = ' + T.num(p0) + '$ F CFA.',
            'Vérification : $' + T.num(p0) + ' \\times ' + cmTex(-r) + ' = ' + T.num(p1) + '$. (Ajouter $' + r + '$ % au prix payé serait faux : $' + T.num(p1) + ' \\times ' + cmTex(r) + ' = ' + T.num(ar.round(p1 * (1 + r / 100), 2)) + '$.)'
          ]
        };
      }
      var r1 = rng.pick([10, 20, 25, 30]), r2 = rng.pick([5, 10, 20]), q0 = 1000 * rng.int(10, 60);
      var q1 = q0 * (100 - r1) / 100, q2 = ar.round(q1 * (100 - r2) / 100, 4);
      var cg = ar.round((1 - r1 / 100) * (1 - r2 / 100), 6), rg = ar.round((1 - cg) * 100, 4);
      return {
        enonce: 'Pendant les soldes, ' + art + ' affiché à $' + T.num(q0) + '$ F CFA bénéficie d\'une première remise de $' + r1 + '$ %, puis d\'une seconde remise de $' + r2 + '$ % sur le nouveau prix.<br>1) Calculer le prix final.<br>2) Calculer le pourcentage de remise globale.',
        questions: [
          { label: '1) Prix final :', type: 'number', reponse: q2, unite: 'F CFA' },
          { label: '2) Remise globale (en %) :', type: 'number', reponse: rg }
        ],
        indices: ['Applique les deux coefficients multiplicateurs l\'un après l\'autre.', 'Le coefficient global est le produit des coefficients ; les pourcentages ne s\'additionnent pas.'],
        solution: [
          'Après la première remise : $' + T.num(q0) + ' \\times ' + cmTex(-r1) + ' = ' + T.num(q1) + '$ F CFA.',
          'Après la seconde remise : $' + T.num(q1) + ' \\times ' + cmTex(-r2) + ' = ' + T.num(q2) + '$ F CFA.',
          'Coefficient global : $' + cmTex(-r1) + ' \\times ' + cmTex(-r2) + ' = ' + T.num(cg) + '$, soit une remise globale de $(1 - ' + T.num(cg) + ') \\times 100 = ' + T.num(rg) + '$ % (et non $' + (r1 + r2) + '$ %).'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 2nde L — CALCUL NUMÉRIQUE ET INTERVALLES                            */
  /* ================================================================== */
  EM.gen.register({
    id: '2l-calcul-numerique',
    titre: 'Calculs avec des fractions et des puissances de 10',
    chapitres: ['2l-calcul'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var f1, f2, f3, guard = 0;
        function rf() { var d = rng.int(2, 9), n; do { n = rng.int(1, 9); } while (n % d === 0); return F(n, d); }
        var type = rng.pick(['somme', 'diff', 'quot']);
        var expr, sol = [], res;
        do { f1 = rf(); f2 = rf(); f3 = rf(); } while ((f1.equals(f2) || f2.equals(f3)) && guard++ < 50);
        if (type === 'somme' || type === 'diff') {
          var sg = type === 'somme' ? 1 : -1;
          var prod = f2.mul(f3);
          res = sg > 0 ? f1.add(prod) : f1.sub(prod);
          expr = f1.tex() + (sg > 0 ? ' + ' : ' - ') + f2.tex() + ' \\times ' + f3.tex();
          var Lc = ar.lcm(f1.d, prod.d);
          sol.push('La multiplication est prioritaire : $' + f2.tex() + ' \\times ' + f3.tex() + ' = \\dfrac{' + f2.n + ' \\times ' + f3.n + '}{' + f2.d + ' \\times ' + f3.d + '} = ' + prod.tex() + '$.');
          sol.push('On réduit au même dénominateur $' + Lc + '$ : $A = \\dfrac{' + f1.n * Lc / f1.d + '}{' + Lc + '}' + (sg > 0 ? ' + ' : ' - ') + '\\dfrac{' + prod.n * Lc / prod.d + '}{' + Lc + '} = ' + (function (nn) { return (nn < 0 ? '-' : '') + '\\dfrac{' + Math.abs(nn) + '}{' + Lc + '}'; })(f1.n * Lc / f1.d + sg * prod.n * Lc / prod.d) + '$.');
        } else {
          var diff = f1.sub(f2);
          if (diff.isZero()) { f1 = f1.add(1); diff = f1.sub(f2); }
          res = diff.div(f3);
          expr = '\\left(' + f1.tex() + ' - ' + f2.tex() + '\\right) \\div ' + f3.tex();
          var L2 = ar.lcm(f1.d, f2.d);
          sol.push('On calcule d\'abord la parenthèse : $' + f1.tex() + ' - ' + f2.tex() + ' = \\dfrac{' + f1.n * L2 / f1.d + '}{' + L2 + '} - \\dfrac{' + f2.n * L2 / f2.d + '}{' + L2 + '} = ' + diff.tex() + '$.');
          sol.push('Diviser par une fraction, c\'est multiplier par son inverse : $A = ' + diff.tex() + ' \\times ' + f3.inv().tex() + '$.');
        }
        sol.push('$A = ' + res.tex() + '$ (fraction irréductible).');
        return {
          enonce: 'Calculer et donner le résultat sous la forme d\'une fraction irréductible : $$A = ' + expr + '$$',
          questions: [{ label: '$A =$', type: 'number', reponse: res }],
          indices: ['Respecte les priorités : parenthèses, puis multiplications et divisions, puis additions et soustractions.', 'Pour additionner deux fractions, réduis-les au même dénominateur.'],
          solution: sol,
          aide: 'Écris une fraction, par exemple -7/12.'
        };
      }
      var a = rng.pick([2, 3, 4, 5, 6, 8, 12, 15, 25]), b = rng.pick([2, 3, 4, 5, 6, 7, 9, 12]), c = rng.pick([2, 4, 5, 8]);
      var m = rng.int(-5, 8), n = rng.int(-5, 8), p = rng.int(-4, 6);
      var M = F(a * b, c), E = m + n - p, e = 0;
      while (M.cmp(10) >= 0) { M = M.div(10); e++; }
      while (M.cmp(1) < 0) { M = M.mul(10); e--; }
      var pw = function (k) { return '10^{' + k + '}'; };
      return {
        enonce: 'Donner l\'écriture scientifique de $$B = \\dfrac{' + a + ' \\times ' + pw(m) + ' \\times ' + b + ' \\times ' + pw(n) + '}{' + c + ' \\times ' + pw(p) + '}$$ sous la forme $a \\times 10^{n}$, avec $1 \\leq a < 10$ et $n$ entier relatif.',
        questions: [
          { label: '$a =$', type: 'number', reponse: M, reponseTex: T.num(M.value()) },
          { label: '$n =$', type: 'number', reponse: E + e }
        ],
        indices: ['Regroupe les nombres d\'un côté et les puissances de $10$ de l\'autre.', '$10^{m} \\times 10^{n} = 10^{m + n}$ et $\\dfrac{10^{m}}{10^{p}} = 10^{m - p}$.'],
        solution: [
          '$B = \\dfrac{' + a + ' \\times ' + b + '}{' + c + '} \\times \\dfrac{' + pw(m) + ' \\times ' + pw(n) + '}{' + pw(p) + '} = ' + T.num(a * b / c) + ' \\times 10^{' + m + ' + ' + T.par(n) + ' - ' + T.par(p) + '} = ' + T.num(a * b / c) + ' \\times ' + pw(E) + '$.',
          e === 0 ? 'Comme $1 \\leq ' + T.num(M.value()) + ' < 10$, c\'est déjà l\'écriture scientifique.' : '$' + T.num(a * b / c) + ' = ' + T.num(M.value()) + ' \\times ' + pw(e) + '$, donc $B = ' + T.num(M.value()) + ' \\times ' + pw(e) + ' \\times ' + pw(E) + '$.',
          '$B = ' + T.num(M.value()) + ' \\times ' + pw(E + e) + '$ : $a = ' + T.num(M.value()) + '$ et $n = ' + (E + e) + '$.'
        ],
        aide: 'a est un décimal (exemple : 3,75) ; n est un entier relatif (exemple : -4).'
      };
    }
  });

  EM.gen.register({
    id: '2l-intervalles',
    titre: 'Intervalles : écriture, intersection et réunion',
    chapitres: ['2l-calcul', '2l-equations'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      function val() { return rng.bool(0.75) ? rng.int(-8, 9) : rng.int(-15, 15) + 0.5; }
      if (niveau === 1) {
        var a = val(), b, g0 = 0; do { b = val(); } while (b <= a && g0++ < 100);
        if (b <= a) b = a + rng.int(2, 9);
        var o1 = rng.pick(['<', '<=']), o2 = rng.pick(['<', '<=']);
        var I1 = { a: a, b: b, ouvA: o1 === '<', ouvB: o2 === '<' };
        var c = val(), o3 = rng.pick(['<', '<=', '>', '>=']);
        var I2 = intervalOf(o3, c);
        return {
          enonce: 'Écrire sous forme d\'intervalle l\'ensemble des réels $x$ tels que :<br>1) $' + T.num(a) + ' ' + OPS[o1] + ' x ' + OPS[o2] + ' ' + T.num(b) + '$ ;<br>2) $x ' + OPS[o3] + ' ' + T.num(c) + '$.',
          questions: [
            { label: '1)', type: 'interval', reponse: I1 },
            { label: '2)', type: 'interval', reponse: I2 }
          ],
          indices: ['Le crochet est tourné vers l\'intérieur si la borne est atteinte ($\\leq$, $\\geq$), vers l\'extérieur sinon ($<$, $>$).', 'Du côté de $-\\infty$ ou $+\\infty$, le crochet est toujours ouvert.'],
          solution: [
            '1) $' + T.num(a) + ' ' + OPS[o1] + ' x ' + OPS[o2] + ' ' + T.num(b) + ' \\iff x \\in ' + itex(I1) + '$ : ' + (I1.ouvA ? '$' + T.num(a) + '$ est exclu' : '$' + T.num(a) + '$ est inclus') + ', ' + (I1.ouvB ? '$' + T.num(b) + '$ est exclu.' : '$' + T.num(b) + '$ est inclus.'),
            '2) $x ' + OPS[o3] + ' ' + T.num(c) + ' \\iff x \\in ' + itex(I2) + '$.'
          ],
          aide: 'Écris par exemple ]-2 ; 5] ou [3 ; +inf[.'
        };
      }
      var p = [], guard = 0;
      do { p = [val(), val(), val(), val()].sort(function (x, y) { return x - y; }); } while ((p[0] === p[1] || p[1] === p[2] || p[2] === p[3]) && guard++ < 100);
      var gauche = rng.bool(0.25), droite = !gauche && rng.bool(0.25);
      var I = { a: gauche ? -Infinity : p[0], b: p[2], ouvA: gauche ? true : rng.bool(), ouvB: rng.bool() };
      var J = { a: p[1], b: droite ? Infinity : p[3], ouvA: rng.bool(), ouvB: droite ? true : rng.bool() };
      var inter = { a: J.a, b: I.b, ouvA: J.ouvA, ouvB: I.ouvB };
      var reun = { a: I.a, b: J.b, ouvA: I.ouvA, ouvB: J.ouvB };
      return {
        enonce: 'On donne les intervalles $I = ' + itex(I) + '$ et $J = ' + itex(J) + '$.<br>Déterminer $I \\cap J$ et $I \\cup J$.',
        questions: [
          { label: '$I \\cap J =$', type: 'interval', reponse: inter },
          { label: '$I \\cup J =$', type: 'interval', reponse: reun }
        ],
        indices: ['Représente $I$ et $J$ sur une même droite graduée.', '$I \\cap J$ : les réels qui sont <b>à la fois</b> dans $I$ et dans $J$ ; $I \\cup J$ : les réels qui sont dans $I$ <b>ou</b> dans $J$.'],
        solution: [
          'Sur une droite graduée, on a l\'ordre $' + (gauche ? '-\\infty' : T.num(p[0])) + ' < ' + T.num(p[1]) + ' < ' + T.num(p[2]) + ' < ' + (droite ? '+\\infty' : T.num(p[3])) + '$ : les deux intervalles se chevauchent entre $' + T.num(p[1]) + '$ et $' + T.num(p[2]) + '$.',
          '$I \\cap J$ commence à la borne gauche de $J$ et s\'arrête à la borne droite de $I$ (on garde les crochets correspondants) : $I \\cap J = ' + itex(inter) + '$.',
          '$I \\cup J$ va de la borne gauche de $I$ à la borne droite de $J$ : $I \\cup J = ' + itex(reun) + '$.'
        ],
        aide: 'Écris par exemple ]-2 ; 5] ou [3 ; +inf[.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
