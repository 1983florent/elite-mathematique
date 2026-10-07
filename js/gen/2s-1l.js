/*
 * Générateurs d'exercices : 2nde S et 1ère L.
 * Chaque exercice est reproductible (graine), vérifié automatiquement et accompagné
 * d'une correction détaillée. Les énoncés sont à l'infinitif ; indices et corrections
 * tutoient l'élève.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, Frac = EM.Frac;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  function fr(v) { return v instanceof Frac ? v : F(v); }
  function rd(x, d) { return EM.ar.round(x, d == null ? 6 : d); }
  function rep(s, k) { var o = ''; for (var i = 0; i < k; i++) o += s; return o; }

  /** Polynôme (coefficients décroissants, nombres ou fractions) écrit pour l'analyseur : 2*x^2-(3/4)*x+1 */
  function polyStr(coefs, v) {
    v = v || 'x';
    var deg = coefs.length - 1, s = '';
    for (var i = 0; i < coefs.length; i++) {
      var c = fr(coefs[i]);
      if (c.isZero()) continue;
      var p = deg - i, a = c.abs();
      var body = a.d === 1 ? String(a.n) : '(' + a.n + '/' + a.d + ')';
      if (p > 0) body += '*' + v + (p > 1 ? '^' + p : '');
      s += (c.n < 0 ? '-' : (s ? '+' : '')) + body;
    }
    return s || '0';
  }
  /** Valeur exacte d'un polynôme en un point (fractions). */
  function evalPoly(coefs, x) {
    var r = F(0), xf = fr(x);
    coefs.forEach(function (c) { r = r.mul(xf).add(fr(c)); });
    return r;
  }
  /** Écriture « substituée » d'un polynôme : 2 × (-1)^3 - 3 × (-1)^2 + 5 */
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
  /** Question à choix multiple : mélange, sans doublon. */
  function qChoice(rng, label, bonne, autres) {
    var all = [bonne];
    autres.forEach(function (a) { if (all.indexOf(a) < 0) all.push(a); });
    var sh = rng.shuffle(all);
    return { label: label, type: 'choice', choix: sh, reponse: sh.indexOf(bonne) };
  }
  /** k·π en TeX (k fraction) */
  function piTex(k) {
    k = fr(k);
    if (k.isZero()) return '0';
    var s = k.n < 0 ? '-' : '', n = Math.abs(k.n);
    var top = (n === 1 ? '' : n) + '\\pi';
    return s + (k.d === 1 ? top : '\\dfrac{' + top + '}{' + k.d + '}');
  }
  /** k·π pour l'analyseur */
  function piStr(k) {
    k = fr(k);
    if (k.isZero()) return '0';
    return k.n + '*pi' + (k.d === 1 ? '' : '/' + k.d);
  }
  /** Nombre r·√m (r fraction, m sans facteur carré) : TeX et chaîne pour l'analyseur. */
  function radTex(r, m) {
    r = fr(r);
    if (r.isZero()) return '0';
    if (m === 1) return r.tex();
    var s = r.n < 0 ? '-' : '', n = Math.abs(r.n);
    var top = (n === 1 ? '' : n) + '\\sqrt{' + m + '}';
    return s + (r.d === 1 ? top : '\\dfrac{' + top + '}{' + r.d + '}');
  }
  function radStr(r, m) {
    r = fr(r);
    if (m === 1) return r.toString();
    return '(' + r.n + '*sqrt(' + m + '))/' + r.d;
  }
  /**
   * Tableau de signes.
   * crit : [{v: nombre, t: TeX}] (ordre croissant) ; lignes : [{nom, f, zeros: [], poles: []}]
   */
  function signTable(crit, lignes) {
    var n = crit.length;
    var tests = [];
    if (!n) tests = [0];
    else {
      tests.push(crit[0].v - 1);
      for (var i = 0; i < n - 1; i++) tests.push((crit[i].v + crit[i + 1].v) / 2);
      tests.push(crit[n - 1].v + 1);
    }
    var head = 'x & -\\infty & & ' + crit.map(function (c) { return c.t; }).join(' & & ') + (n ? ' & & ' : '') + '+\\infty';
    if (!n) head = 'x & -\\infty & & +\\infty';
    var rows = lignes.map(function (L) {
      var cells = [L.nom, ''];
      tests.forEach(function (t, i) {
        cells.push(L.f(t) > 0 ? '+' : '-');
        if (i < n) {
          var v = crit[i].v;
          var isZ = (L.zeros || []).some(function (z) { return Math.abs(z - v) < 1e-9; });
          var isP = (L.poles || []).some(function (z) { return Math.abs(z - v) < 1e-9; });
          cells.push(isP ? '\\|' : isZ ? '0' : '');
        }
      });
      cells.push('');
      return cells.join(' & ');
    });
    var spec = 'c|' + rep('c', n ? 2 * n + 3 : 3);
    return '$$\\begin{array}{' + spec + '}' + head + ' \\\\ \\hline ' + rows.join(' \\\\ \\hline ') + '\\end{array}$$';
  }
  /** Système d'équations (lignes TeX) */
  function sysTex(lines, noms) {
    return '\\left\\{\\begin{array}{l}' + lines.map(function (l, i) { return l + (noms ? ' \\quad (' + noms[i] + ')' : ''); }).join(' \\\\ ') + '\\end{array}\\right.';
  }
  /** Tableau statistique (valeurs, effectifs…) en TeX */
  function statTable(titres, lignes) {
    var k = lignes[0].length;
    var spec = '|c|' + rep('c|', k);
    var rows = titres.map(function (t, i) { return t + ' & ' + lignes[i].join(' & '); });
    return '$$\\begin{array}{' + spec + '}\\hline ' + rows.join(' \\\\ \\hline ') + ' \\\\ \\hline\\end{array}$$';
  }
  /** Partage de N en k effectifs strictement positifs */
  function partition(rng, N, k) {
    var cuts = [];
    while (cuts.length < k - 1) {
      var c = rng.int(1, N - 1);
      if (cuts.indexOf(c) < 0) cuts.push(c);
    }
    cuts.sort(function (a, b) { return a - b; });
    var parts = [], prev = 0;
    cuts.concat([N]).forEach(function (c) { parts.push(c - prev); prev = c; });
    return parts;
  }
  /** Coordonnées (a ; b) en TeX */
  function pt(a, b, c) {
    return '\\left(' + T.num(a) + ' \\,;\\, ' + T.num(b) + (c != null ? ' \\,;\\, ' + T.num(c) : '') + '\\right)';
  }
  /** k × (expression) en TeX, sans « 1 × » */
  function timesTex(k, e) {
    if (k === 1) return e;
    if (k === -1) return '-\\left(' + e + '\\right)';
    return T.par(k) + '\\left(' + e + '\\right)';
  }
  /** c × v (c > 0) en TeX : « 3 × (-2) », ou « (-2) » si c = 1 */
  function prodTex(c, v) { return c === 1 ? T.par(v) : T.num(c) + ' \\times ' + T.par(v); }
  /** a × (x) + b × (y) + c en TeX (coefficients entiers) */
  function linSubst(coefs, vals, cst) {
    var out = '', first = true;
    coefs.forEach(function (c, i) {
      if (c === 0) return;
      var sg = c < 0 ? (first ? '-' : ' - ') : (first ? '' : ' + ');
      out += sg + (Math.abs(c) === 1 && vals[i] !== 0 ? T.par(vals[i]) : T.num(Math.abs(c)) + ' \\times ' + T.par(vals[i]));
      first = false;
    });
    if (cst) out += T.signed(cst, first);
    return out || '0';
  }
  /** Terme constant signé, omis s'il est nul : « + 3 », « - 3 », « » */
  function sz(x) { return fr(x).isZero() ? '' : T.signed(x); }
  /** \\dfrac{n}{d} = forme réduite (l'étape intermédiaire est omise si elle est identique) */
  function fracEq(n, d) {
    var f = F(n, d);
    return (f.n === n && f.d === d) ? f.tex() : '\\dfrac{' + n + '}{' + d + '} = ' + f.tex();
  }
  /** P(x0) écrit avec substitution puis valeur ; en 0 on donne directement le terme constant */
  function substEq(coefs, xv) {
    var v = evalPoly(coefs, xv);
    return fr(xv).isZero() ? v.tex() : substTex(coefs, xv) + ' = ' + v.tex();
  }
  /** Quotient affiché : le dénominateur 1 est omis */
  function quot(num, den) { return den === 1 ? num : '\\dfrac{' + num + '}{' + den + '}'; }
  /** Puissance b^e, sans exposant 1 */
  function pw(b, e) { return e === 1 ? String(b) : b + '^{' + e + '}'; }
  /** Montant en F CFA dans une formule TeX */
  function cfa(x) { return T.num(x) + '\\text{ F CFA}'; }

  var PRENOMS = ['Awa', 'Moussa', 'Fatou', 'Mamadou', 'Aminata', 'Ousmane', 'Khady', 'Ibrahima', 'Ndèye', 'Cheikh', 'Mariama', 'Abdou', 'Coumba', 'Babacar', 'Astou', 'Modou'];
  var VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Diourbel', 'Louga', 'Tambacounda', 'Kolda', 'Fatick'];

  var AIDE_SET = 'Sépare les solutions par « ; ». Écris « ∅ » s\'il n\'y a pas de solution.';
  var AIDE_INT = 'Écris un intervalle comme [-2 ; 5], ]1/3 ; +inf[ ou ]-inf ; 4].';

  /* ================================================================== */
  /* 2nde S — Calcul dans R                                              */
  /* ================================================================== */

  EM.gen.register({
    id: '2s-valeur-absolue',
    titre: 'Équations et inéquations avec une valeur absolue',
    chapitres: ['2s-calcul-reel'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, r, e, abs, steps, q, enonce;
      if (niveau === 1) {
        a = rng.nz(-9, 9);
        r = rng.pick([rng.int(1, 9), rng.int(1, 9), rng.int(1, 9), rng.int(1, 9), 0, -rng.int(1, 6)]);
        e = T.poly([1, -a]);
        abs = '\\left|' + e + '\\right|';
        enonce = 'Résoudre dans $\\R$ l\'équation : $$' + abs + ' = ' + r + '$$';
        steps = ['$' + abs + '$ est la distance entre les réels $x$ et $' + a + '$ sur la droite graduée.'];
        if (r < 0) {
          steps.push('Une valeur absolue est toujours positive ou nulle ; elle ne peut pas être égale à $' + r + '$.');
          steps.push('$S = \\varnothing$');
          q = { label: '$S =$', type: 'set', reponse: [] };
        } else if (r === 0) {
          steps.push('$' + abs + ' = 0 \\iff ' + e + ' = 0 \\iff x = ' + a + '$.');
          steps.push('$S = ' + T.set([a]) + '$');
          q = { label: '$S =$', type: 'set', reponse: [a] };
        } else {
          steps.push('$' + abs + ' = ' + r + ' \\iff ' + e + ' = ' + r + '$ ou $' + e + ' = -' + r + '$.');
          steps.push('$\\iff x = ' + a + ' + ' + r + ' = ' + (a + r) + '$ ou $x = ' + a + ' - ' + r + ' = ' + (a - r) + '$.');
          steps.push('$S = ' + T.set([a - r, a + r]) + '$ : ce sont les deux réels situés à la distance $' + r + '$ de $' + a + '$.');
          q = { label: '$S =$', type: 'set', reponse: [a - r, a + r] };
        }
        return {
          enonce: enonce,
          questions: [q],
          indices: ['Pour $r > 0$ : $|X| = r \\iff X = r$ ou $X = -r$.', 'Une valeur absolue n\'est jamais négative.'],
          solution: steps,
          aide: AIDE_SET
        };
      }
      if (niveau === 2) {
        a = rng.nz(-9, 9);
        r = rng.bool(0.7) ? rng.int(1, 8) : rng.int(3, 15) / 2;
        if (EM.ar.isInt(r)) r = Math.round(r);
        var strict = rng.bool();
        e = T.poly([1, -a]);
        abs = '\\left|' + e + '\\right|';
        var sym = strict ? '<' : '\\leq';
        var lo = rd(a - r), hi = rd(a + r);
        steps = [
          '$' + abs + '$ est la distance entre $x$ et $' + a + '$ : on cherche les réels situés à une distance ' + (strict ? 'strictement inférieure' : 'inférieure ou égale') + ' à $' + T.num(r) + '$ de $' + a + '$.',
          '$' + abs + ' ' + sym + ' ' + T.num(r) + ' \\iff -' + T.num(r) + ' ' + sym + ' ' + e + ' ' + sym + ' ' + T.num(r) + '$.',
          'On ajoute $' + a + '$ aux trois membres : $' + T.num(a) + ' - ' + T.num(r) + ' ' + sym + ' x ' + sym + ' ' + T.num(a) + ' + ' + T.num(r) + '$, soit $' + T.num(lo) + ' ' + sym + ' x ' + sym + ' ' + T.num(hi) + '$.',
          '$S = ' + T.interval(lo, hi, strict, strict) + '$ : c\'est l\'intervalle de centre $' + a + '$ et de rayon $' + T.num(r) + '$.'
        ];
        return {
          enonce: 'Résoudre dans $\\R$ l\'inéquation suivante et donner l\'ensemble des solutions sous forme d\'intervalle : $$' + abs + ' ' + sym + ' ' + T.num(r) + '$$',
          questions: [{ label: '$S =$', type: 'interval', reponse: { a: lo, b: hi, ouvA: strict, ouvB: strict } }],
          indices: ['Pour $r > 0$ : $|x - a| \\leq r \\iff a - r \\leq x \\leq a + r$.', 'L\'ensemble cherché est l\'intervalle de centre $a$ et de rayon $r$.'],
          solution: steps,
          aide: AIDE_INT
        };
      }
      // niveau 3 : |αx + β| ≤ γ
      var al = rng.pick([2, 3, 4, 5, -2, -3]), be = rng.nz(-9, 9), ga = rng.int(1, 9);
      var strict3 = rng.bool();
      var sym3 = strict3 ? '<' : '\\leq';
      e = T.poly([al, be]);
      abs = '\\left|' + e + '\\right|';
      var b1 = F(-ga - be, al), b2 = F(ga - be, al);
      var low = b1.cmp(b2) < 0 ? b1 : b2, high = b1.cmp(b2) < 0 ? b2 : b1;
      steps = [
        '$' + abs + ' ' + sym3 + ' ' + ga + ' \\iff -' + ga + ' ' + sym3 + ' ' + e + ' ' + sym3 + ' ' + ga + '$.',
        'On ' + (be > 0 ? 'retranche $' + be + '$' : 'ajoute $' + (-be) + '$') + ' aux trois membres : $' + (-ga - be) + ' ' + sym3 + ' ' + T.mono(al, 'x', true) + ' ' + sym3 + ' ' + (ga - be) + '$.',
        al > 0
          ? 'On divise par $' + al + ' > 0$ (le sens ne change pas) : $' + b1.tex() + ' ' + sym3 + ' x ' + sym3 + ' ' + b2.tex() + '$.'
          : 'On divise par $' + al + ' < 0$ : le sens des inégalités change. $' + b2.tex() + ' ' + sym3 + ' x ' + sym3 + ' ' + b1.tex() + '$.',
        '$S = ' + T.interval(low, high, strict3, strict3) + '$'
      ];
      return {
        enonce: 'Résoudre dans $\\R$ l\'inéquation suivante (réponse sous forme d\'intervalle) : $$' + abs + ' ' + sym3 + ' ' + ga + '$$',
        questions: [{ label: '$S =$', type: 'interval', reponse: { a: low, b: high, ouvA: strict3, ouvB: strict3 } }],
        indices: ['Pour $r > 0$ : $|X| \\leq r \\iff -r \\leq X \\leq r$.', 'Attention : diviser par un nombre négatif change le sens des inégalités.'],
        solution: steps,
        aide: AIDE_INT
      };
    }
  });

  EM.gen.register({
    id: '2s-puissances-radicaux',
    titre: 'Puissances, radicaux et rationalisation',
    chapitres: ['2s-calcul-reel'],
    niveaux: 3,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.pick([2, 3, 5, 7, 10]);
        var m = rng.nz(-4, 7), n = rng.nz(-4, 7), p = rng.int(2, 4), k = rng.int(2, 3);
        var s = m + n - p * k;
        var A = '\\dfrac{' + a + '^{' + m + '} \\times ' + a + '^{' + n + '}}{\\left(' + a + '^{' + p + '}\\right)^{' + k + '}}';
        var M = rng.int(2, 6), N = rng.int(1, 4), P = rng.int(1, 3), Q = rng.int(1, 3);
        var al = M + 2 * N - 2 * Q, be = M - 2 * P - Q;
        var B = '\\dfrac{' + pw(6, M) + ' \\times ' + pw(4, N) + '}{' + pw(9, P) + ' \\times ' + pw(12, Q) + '}';
        return {
          enonce: 'On donne $$A = ' + A + ' \\qquad \\text{et} \\qquad B = ' + B + '$$1) Écrire $A$ sous la forme $' + a + '^{s}$ où $s$ est un entier relatif.<br>2) Écrire $B$ sous la forme $2^{\\alpha} \\times 3^{\\beta}$ où $\\alpha$ et $\\beta$ sont des entiers relatifs.',
          questions: [
            { label: '$s =$', type: 'number', reponse: s },
            { label: '$(\\alpha \\,;\\, \\beta) =$', type: 'tuple', reponse: [al, be] }
          ],
          indices: ['$a^m \\times a^n = a^{m+n}$, $\\left(a^p\\right)^k = a^{pk}$ et $\\dfrac{a^m}{a^n} = a^{m-n}$.', 'Décompose $6 = 2 \\times 3$, $4 = 2^2$, $9 = 3^2$ et $12 = 2^2 \\times 3$.'],
          solution: [
            'Numérateur de $A$ : $' + a + '^{' + m + '} \\times ' + a + '^{' + n + '} = ' + a + '^{' + (m + n) + '}$. Dénominateur : $\\left(' + a + '^{' + p + '}\\right)^{' + k + '} = ' + a + '^{' + (p * k) + '}$.',
            'Donc $A = ' + a + '^{' + (m + n) + ' - ' + T.par(p * k) + '} = ' + a + '^{' + s + '}$ : $s = ' + s + '$.',
            'Pour $B$ : $' + pw(6, M) + ' = 2^{' + M + '} \\times 3^{' + M + '}$, $' + pw(4, N) + ' = 2^{' + (2 * N) + '}$, $' + pw(9, P) + ' = 3^{' + (2 * P) + '}$ et $' + pw(12, Q) + ' = 2^{' + (2 * Q) + '} \\times ' + pw(3, Q) + '$.',
            'Puissances de 2 : $' + M + ' + ' + (2 * N) + ' - ' + (2 * Q) + ' = ' + al + '$. Puissances de 3 : $' + M + ' - ' + (2 * P) + ' - ' + Q + ' = ' + be + '$.',
            'Donc $B = 2^{' + al + '} \\times 3^{' + be + '}$, soit $(\\alpha \\,;\\, \\beta) = (' + al + ' \\,;\\, ' + be + ')$.'
          ],
          aide: 'Pour le couple, écris par exemple (3 ; -2).'
        };
      }
      if (niveau === 2) {
        var mm = rng.pick([2, 3, 5, 6, 7]);
        var ks = rng.sample([1, 2, 3, 4, 5], 3);
        var cs = [rng.pick([1, 2, 3]), rng.pick([1, 2, -1, -2]), rng.pick([-1, -2, -3, 1])];
        var K = cs[0] * ks[0] + cs[1] * ks[1] + cs[2] * ks[2];
        if (K === 0) { cs[0] += 1; K = cs[0] * ks[0] + cs[1] * ks[1] + cs[2] * ks[2]; }
        var termsA = ks.map(function (kk, i) { return T.mono(cs[i], '\\sqrt{' + (kk * kk * mm) + '}', i === 0); }).join('');
        var detail = ks.map(function (kk, i) {
          return kk === 1 ? '\\sqrt{' + mm + '}' : '\\sqrt{' + (kk * kk * mm) + '} = \\sqrt{' + (kk * kk) + ' \\times ' + mm + '} = ' + kk + '\\sqrt{' + mm + '}';
        });
        var b = rng.nz(-5, 5);
        var mb = rng.pick([2, 3, 5, 7]);
        var Bval = (b * b + mb) + ' + ' + (2 * b) + '*sqrt(' + mb + ')';
        var Btex = T.num(b * b + mb) + T.mono(2 * b, '\\sqrt{' + mb + '}');
        var Bstat = '\\left(' + (b > 0 ? b + ' + \\sqrt{' + mb + '}' : '\\sqrt{' + mb + '} - ' + (-b)) + '\\right)^2';
        return {
          enonce: 'Écrire sous la forme la plus simple possible : $$A = ' + termsA + ' \\qquad \\text{et} \\qquad B = ' + Bstat + '$$',
          questions: [
            { label: '$A =$', type: 'number', reponse: K + '*sqrt(' + mm + ')', reponseTex: radTex(K, mm) },
            { label: '$B =$', type: 'number', reponse: Bval, reponseTex: Btex }
          ],
          indices: ['Fais apparaître un carré parfait sous chaque radical : $\\sqrt{a^2 b} = a\\sqrt{b}$ pour $a \\geq 0$.', 'Pour $B$, utilise l\'identité $(u + v)^2 = u^2 + 2uv + v^2$ et $\\left(\\sqrt{' + mb + '}\\right)^2 = ' + mb + '$.'],
          solution: [
            'On simplifie chaque radical : $' + detail.join('$ ; $') + '$.',
            '$A = ' + ks.map(function (kk, i) { return T.mono(cs[i] * kk, '\\sqrt{' + mm + '}', i === 0); }).join('') + ' = ' + radTex(K, mm) + '$.',
            '$B = ' + Bstat + ' = ' + (b > 0 ? T.num(b * b) + ' + 2 \\times ' + b + ' \\times \\sqrt{' + mb + '} + ' + mb : mb + ' - 2 \\times ' + (-b) + ' \\times \\sqrt{' + mb + '} + ' + T.num(b * b)) + ' = ' + Btex + '$.'
          ],
          aide: 'Tu peux écrire √ ou sqrt : par exemple 7√3 ou 11 + 6√2.'
        };
      }
      // niveau 3 : rationaliser
      var m3 = rng.pick([2, 3, 5, 6, 7]), k3 = rng.int(2, 12);
      var c1 = F(k3, m3);
      var m4 = rng.pick([2, 3, 5, 6, 7, 10, 11]), b4 = rng.int(1, 3), s4 = rng.sign(), a4 = rng.pick([1, 2, 3, 4, 6]);
      if (m4 === b4 * b4) m4 = 7;
      var den = m4 - b4 * b4;
      var c2 = F(a4, den);
      // D = a/(√m + s b) = a(√m - s b)/(m - b²) = c2(√m - s b)
      var p2 = c2.n, q2 = c2.d, cst = -s4 * b4 * p2;
      var numTex = T.mono(p2, '\\sqrt{' + m4 + '}', true) + T.signed(cst);
      var Dtex = q2 === 1 ? numTex : '\\dfrac{' + numTex + '}{' + q2 + '}';
      var Dstr = '(' + p2 + '*sqrt(' + m4 + ')+(' + cst + '))/' + q2;
      var Dden = '\\sqrt{' + m4 + '}' + (s4 > 0 ? ' + ' : ' - ') + b4;
      var Dconj = '\\sqrt{' + m4 + '}' + (s4 > 0 ? ' - ' : ' + ') + b4;
      return {
        enonce: 'Écrire chaque nombre sans radical au dénominateur : $$C = \\dfrac{' + k3 + '}{\\sqrt{' + m3 + '}} \\qquad \\text{et} \\qquad D = \\dfrac{' + a4 + '}{' + Dden + '}$$',
        questions: [
          { label: '$C =$', type: 'number', reponse: radStr(c1, m3), reponseTex: radTex(c1, m3) },
          { label: '$D =$', type: 'number', reponse: Dstr, reponseTex: Dtex }
        ],
        indices: ['Pour $C$, multiplie le numérateur et le dénominateur par $\\sqrt{' + m3 + '}$.', 'Pour $D$, multiplie par la quantité conjuguée $' + Dconj + '$ et utilise $(u + v)(u - v) = u^2 - v^2$.'],
        solution: [
          '$C = \\dfrac{' + k3 + ' \\times \\sqrt{' + m3 + '}}{\\sqrt{' + m3 + '} \\times \\sqrt{' + m3 + '}} = \\dfrac{' + k3 + '\\sqrt{' + m3 + '}}{' + m3 + '}' + (EM.ar.gcd(k3, m3) === 1 ? '' : ' = ' + radTex(c1, m3)) + '$.',
          '$D = \\dfrac{' + a4 + '\\left(' + Dconj + '\\right)}{\\left(' + Dden + '\\right)\\left(' + Dconj + '\\right)} = \\dfrac{' + a4 + '\\left(' + Dconj + '\\right)}{' + m4 + ' - ' + (b4 * b4) + '} = \\dfrac{' + a4 + '\\left(' + Dconj + '\\right)}{' + den + '}$.',
          'Après simplification : $D = ' + Dtex + '$.'
        ],
        aide: 'Tu peux écrire par exemple 2√3, 5√7/7 ou (3√2 + 6)/2.'
      };
    }
  });

  EM.gen.register({
    id: '2s-encadrement',
    titre: 'Encadrer une somme, une différence, un produit',
    chapitres: ['2s-calcul-reel'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var a = rng.dec(1, 4, 1), b = rd(a + rng.dec(0.2, 1.5, 1), 1);
      var c = rng.dec(1, 4, 1), d = rd(c + rng.dec(0.2, 1.5, 1), 1);
      var hyp = 'On sait que $' + T.num(a) + ' \\leq x \\leq ' + T.num(b) + '$ et $' + T.num(c) + ' \\leq y \\leq ' + T.num(d) + '$.';
      if (niveau === 1) {
        var s1 = rd(a + c), s2 = rd(b + d), d1 = rd(a - d), d2 = rd(b - c);
        return {
          enonce: hyp + '<br>Donner le meilleur encadrement possible de $x + y$ puis de $x - y$ (sous forme d\'intervalles fermés).',
          questions: [
            { label: '$x + y \\in$', type: 'interval', reponse: { a: s1, b: s2 } },
            { label: '$x - y \\in$', type: 'interval', reponse: { a: d1, b: d2 } }
          ],
          indices: ['On peut ajouter membre à membre deux encadrements de même sens.', 'On ne soustrait jamais des encadrements : encadre d\'abord $-y$, puis ajoute.'],
          solution: [
            'Somme : on ajoute membre à membre : $' + T.num(a) + ' + ' + T.num(c) + ' \\leq x + y \\leq ' + T.num(b) + ' + ' + T.num(d) + '$, soit $' + T.num(s1) + ' \\leq x + y \\leq ' + T.num(s2) + '$.',
            'Différence : en multipliant par $-1$, le sens change : $-' + T.num(d) + ' \\leq -y \\leq -' + T.num(c) + '$.',
            'On ajoute à l\'encadrement de $x$ : $' + T.num(a) + ' - ' + T.num(d) + ' \\leq x - y \\leq ' + T.num(b) + ' - ' + T.num(c) + '$, soit $' + T.num(d1) + ' \\leq x - y \\leq ' + T.num(d2) + '$.',
            'Donc $x + y \\in ' + T.interval(s1, s2) + '$ et $x - y \\in ' + T.interval(d1, d2) + '$.'
          ],
          aide: AIDE_INT
        };
      }
      var al = rng.int(2, 5), be = rng.int(2, 5);
      var e1 = rd(al * a - be * d), e2 = rd(al * b - be * c), p1 = rd(a * c, 4), p2 = rd(b * d, 4);
      return {
        enonce: hyp + '<br>Donner le meilleur encadrement possible de $' + al + 'x - ' + be + 'y$ puis de $xy$ (sous forme d\'intervalles fermés).',
        questions: [
          { label: '$' + al + 'x - ' + be + 'y \\in$', type: 'interval', reponse: { a: e1, b: e2 } },
          { label: '$xy \\in$', type: 'interval', reponse: { a: p1, b: p2 } }
        ],
        indices: ['Multiplier par un nombre positif conserve le sens ; par un nombre négatif, le sens change.', 'On peut multiplier membre à membre des encadrements de nombres positifs.'],
        solution: [
          'On multiplie par $' + al + ' > 0$ : $' + T.num(rd(al * a)) + ' \\leq ' + al + 'x \\leq ' + T.num(rd(al * b)) + '$.',
          'On multiplie par $-' + be + ' < 0$ (le sens change) : $' + T.num(rd(-be * d)) + ' \\leq -' + be + 'y \\leq ' + T.num(rd(-be * c)) + '$.',
          'On ajoute membre à membre : $' + T.num(e1) + ' \\leq ' + al + 'x - ' + be + 'y \\leq ' + T.num(e2) + '$.',
          'Tous les nombres sont positifs, donc on multiplie membre à membre : $' + T.num(a) + ' \\times ' + T.num(c) + ' \\leq xy \\leq ' + T.num(b) + ' \\times ' + T.num(d) + '$, soit $' + T.num(p1) + ' \\leq xy \\leq ' + T.num(p2) + '$.'
        ],
        aide: AIDE_INT
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Polynômes et fractions rationnelles                        */
  /* ================================================================== */

  EM.gen.register({
    id: '2s-factorisation-horner',
    titre: 'Factoriser un polynôme connaissant une racine',
    chapitres: ['2s-polynomes', '1s-polynomes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var al = rng.nz(-3, 3), a, b, c, be, ga;
      if (niveau === 1) {
        a = rng.pick([1, 1, 2, 3, -1, -2]); b = rng.int(-6, 6); c = rng.nz(-6, 6);
      } else {
        a = rng.pick([1, 1, 2, -1, -2]);
        be = rng.intExcept(-4, 4, [al]);
        ga = rng.intExcept(-4, 4, [al, be]);
        b = -a * (be + ga); c = a * be * ga;
      }
      var P = [a, b - al * a, c - al * b, -al * c];
      var Q = [a, b, c];
      var Ptex = T.poly(P);
      // tableau de Horner
      var b2 = P[0], b1 = P[1] + al * b2, b0 = P[2] + al * b1;
      var hor = '$$\\begin{array}{c|cccc} & ' + P.map(T.num).join(' & ') + ' \\\\ ' + T.num(al) + ' & & ' + T.num(al * b2) + ' & ' + T.num(al * b1) + ' & ' + T.num(al * b0) +
        ' \\\\ \\hline & ' + T.num(b2) + ' & ' + T.num(b1) + ' & ' + T.num(b0) + ' & 0 \\end{array}$$';
      var steps = [
        '$P(' + al + ') = ' + substTex(P, al) + ' = 0$ : donc $' + al + '$ est une racine de $P$, et $P(x)$ est divisible par $' + T.xMinus(al).replace(/^\(|\)$/g, '') + '$.',
        'On applique la méthode de Horner (ou la division euclidienne) : on abaisse le premier coefficient, puis on multiplie par $' + al + '$ et on ajoute au coefficient suivant.' + hor,
        'La dernière case donne le reste $0$ ; les autres donnent les coefficients de $Q$ : $Q(x) = ' + T.poly(Q) + '$.',
        'Donc $P(x) = ' + T.xMinus(al) + '\\left(' + T.poly(Q) + '\\right)$. (Vérifie en développant.)'
      ];
      var qs = [{ label: '$Q(x) =$', type: 'expr', reponse: polyStr(Q), reponseTex: T.poly(Q) }];
      var enonce = 'On considère le polynôme $$P(x) = ' + Ptex + '$$1) Calculer $P(' + al + ')$ et en déduire une factorisation de $P(x)$.<br>2) Déterminer le polynôme $Q$ tel que $P(x) = ' + T.xMinus(al) + ' \\, Q(x)$.';
      if (niveau === 2) {
        var dQ = b * b - 4 * a * c;
        var roots = [al, be, ga].sort(function (u, v) { return u - v; });
        enonce += '<br>3) Résoudre dans $\\R$ l\'équation $P(x) = 0$.';
        steps.push('On résout $Q(x) = 0$ : $\\Delta = ' + T.par(b) + '^2 - 4 \\times ' + T.par(a) + ' \\times ' + T.par(c) + ' = ' + dQ + '$, $\\sqrt{\\Delta} = ' + Math.round(Math.sqrt(dQ)) + '$, d\'où les racines $' + be + '$ et $' + ga + '$.');
        steps.push('Ainsi $P(x) = ' + (a === 1 ? '' : a === -1 ? '-' : a) + T.xMinus(al) + T.xMinus(be) + T.xMinus(ga) + '$ et $S = ' + T.set(roots) + '$.');
        qs.push({ label: '$S =$', type: 'set', reponse: roots });
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: ['Remplace $x$ par $' + al + '$ dans $P(x)$.', 'Le tableau de Horner donne directement les coefficients de $Q$, de degré 2.'],
        solution: steps,
        aide: 'Écris $Q(x)$ développé, par exemple 2x² - 3x + 1.' + (niveau === 2 ? ' Sépare les solutions par « ; ».' : '')
      };
    }
  });

  EM.gen.register({
    id: '2s-signe-fraction',
    titre: 'Signe d\'une fraction rationnelle et inéquation',
    chapitres: ['2s-polynomes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      // fraction réduite N(x)/D(x) = m(x - p) / (c x + d)
      var c = rng.pick([1, 1, 2, -1, 3]), qv = rng.int(-5, 5), d = -c * qv;
      var p = rng.intExcept(-6, 6, [qv]);
      var m = rng.pick([1, 2, 3, -1, -2, -3]);
      var Nc = [m, -m * p], Dc = [c, d];
      var k = 0, aa = m, bb = -m * p;
      if (niveau === 2) {
        k = rng.nz(-3, 3);
        aa = m + k * c; bb = -m * p + k * d;
        if (aa === 0) { k = k > 0 ? k + 1 : k - 1; aa = m + k * c; bb = -m * p + k * d; }
      }
      var fN = function (x) { return m * (x - p); }, fD = function (x) { return c * x + d; };
      var mid = (p + qv) / 2;
      var neg = fN(mid) / fD(mid) < 0;
      var strict = rng.bool();
      var sym = neg ? (strict ? '<' : '\\leq') : (strict ? '>' : '\\geq');
      var orig = '\\dfrac{' + T.poly([aa, bb]) + '}{' + T.poly(Dc) + '}';
      var reduced = '\\dfrac{' + T.poly(Nc) + '}{' + T.poly(Dc) + '}';
      var crit = [{ v: p, t: String(p) }, { v: qv, t: String(qv) }].sort(function (u, v) { return u.v - v.v; });
      var table = signTable(crit, [
        { nom: T.poly(Nc), f: fN, zeros: [p] },
        { nom: T.poly(Dc), f: fD, zeros: [qv] },
        { nom: '\\text{quotient}', f: function (x) { return fN(x) / fD(x); }, zeros: [p], poles: [qv] }
      ]);
      var lo = Math.min(p, qv), hi = Math.max(p, qv);
      var ans = { a: lo, b: hi, ouvA: lo === qv || strict, ouvB: hi === qv || strict };
      var enonce = 'Résoudre dans $\\R$ l\'inéquation : $$' + orig + ' ' + sym + ' ' + (niveau === 2 ? k : 0) + '$$';
      var steps = [
        'Valeur interdite : $' + T.poly(Dc) + ' = 0 \\iff x = ' + qv + '$. On travaille sur $\\R \\setminus \\{' + qv + '\\}$.'
      ];
      if (niveau === 2) {
        steps.push('On se ramène à une comparaison avec $0$ : $' + orig + ' - ' + T.par(k) + ' = \\dfrac{' + T.poly([aa, bb]) + ' - ' + (k === 1 ? '' : T.par(k)) + '\\left(' + T.poly(Dc) + '\\right)}{' + T.poly(Dc) + '} = ' + reduced + '$.');
        steps.push('L\'inéquation équivaut donc à $' + reduced + ' ' + sym + ' 0$.');
      }
      steps.push('Le numérateur $' + T.poly(Nc) + '$ s\'annule en $x = ' + p + '$ ; le dénominateur s\'annule en $x = ' + qv + '$. Un binôme $ax + b$ a le signe de $a$ à droite de sa racine.');
      steps.push('Tableau de signes :' + table);
      steps.push('Le quotient est ' + (neg ? 'négatif' : 'positif') + ' entre $' + lo + '$ et $' + hi + '$' + (strict ? '' : ', nul en $' + p + '$') + ' ; la valeur interdite $' + qv + '$ est exclue.');
      steps.push('$S = ' + T.interval(lo, hi, ans.ouvA, ans.ouvB) + '$');
      return {
        enonce: enonce,
        questions: [
          { label: 'Valeur interdite :', type: 'number', reponse: qv },
          { label: '$S =$', type: 'interval', reponse: ans }
        ],
        indices: [
          niveau === 2 ? 'Commence par tout passer dans le premier membre et réduire au même dénominateur.' : 'Cherche la valeur qui annule le dénominateur : elle est interdite.',
          'Dresse un tableau de signes avec le numérateur et le dénominateur ; la valeur interdite est toujours exclue (double barre).'
        ],
        solution: steps,
        aide: AIDE_INT
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Second degré                                               */
  /* ================================================================== */

  function intervalUnionTex(r1, r2, closed) {
    return '\\left]-\\infty \\,;\\, ' + T.num(r1) + (closed ? '\\right]' : '\\right[') + ' \\cup ' + (closed ? '\\left[' : '\\left]') + T.num(r2) + ' \\,;\\, +\\infty\\right[';
  }

  EM.gen.register({
    id: '2s-inequation-second-degre',
    titre: 'Signe d\'un trinôme et inéquation du second degré',
    chapitres: ['2s-second-degre', '1s-polynomes', '1l-equations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, r1, r2, sgn;
      var cas = niveau < 3 ? 'deux' : rng.pick(['deux', 'deux', 'deux', 'double', 'aucune']);
      if (cas === 'deux') {
        var p = rng.int(-6, 6), q;
        if (niveau === 1) {
          sgn = rng.sign();
          q = rng.intExcept(-6, 6, [p]);
          a = sgn; b = -sgn * (p + q); c = sgn * p * q;
          r1 = F(Math.min(p, q)); r2 = F(Math.max(p, q));
        } else {
          sgn = rng.sign();
          var dd = rng.pick([2, 3]), qq = rng.int(-9, 9);
          if (qq % dd === 0) qq += 1;
          // sgn (x - p)(dd x - qq)
          a = sgn * dd; b = -sgn * (dd * p + qq); c = sgn * p * qq;
          var x2 = F(qq, dd);
          if (x2.cmp(p) < 0) { r1 = x2; r2 = F(p); } else { r1 = F(p); r2 = x2; }
        }
      } else if (cas === 'double') {
        a = rng.pick([1, -1, 2, -2]); var r0 = rng.nz(-5, 5);
        b = -2 * a * r0; c = a * r0 * r0;
      } else {
        a = rng.pick([1, -1, 2, -2, 3]); b = rng.int(-4, 4);
        c = Math.sign(a) * (Math.floor(b * b / (4 * Math.abs(a))) + rng.int(1, 5));
      }
      var delta = b * b - 4 * a * c;
      var strict = rng.bool();
      var sym, ineqNeg;
      if (niveau < 3) ineqNeg = a > 0; // on veut la solution entre les racines
      else ineqNeg = rng.bool();
      sym = ineqNeg ? (strict ? '<' : '\\leq') : (strict ? '>' : '\\geq');
      var tri = T.poly([a, b, c]);
      var steps = ['On calcule $\\Delta = b^2 - 4ac = ' + T.par(b) + '^2 - 4 \\times ' + T.par(a) + ' \\times ' + T.par(c) + ' = ' + delta + '$.'];
      var f = function (x) { return a * x * x + b * x + c; };
      var question;
      if (delta > 0) {
        var sq = Math.sqrt(delta);
        steps.push('$\\Delta > 0$ : le trinôme a deux racines $x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a}$, ici $\\sqrt{\\Delta} = ' + sq + '$, d\'où les racines $' + r1.tex() + '$ et $' + r2.tex() + '$.');
        steps.push('Un trinôme est du signe de $a$ à l\'extérieur des racines et du signe contraire entre les racines. Ici $a = ' + a + '$ est ' + (a > 0 ? 'positif' : 'négatif') + '.' +
          signTable([{ v: r1.value(), t: r1.tex() }, { v: r2.value(), t: r2.tex() }], [{ nom: tri, f: f, zeros: [r1.value(), r2.value()] }]));
        var between = (a > 0) === ineqNeg; // solution entre les racines ?
        var ansTex = between ? T.interval(r1, r2, strict, strict) : intervalUnionTex(r1, r2, !strict);
        steps.push('Donc $S = ' + ansTex + '$.');
        if (niveau < 3) {
          question = { label: '$S =$', type: 'interval', reponse: { a: r1, b: r2, ouvA: strict, ouvB: strict } };
        } else {
          var opts = [T.interval(r1, r2, false, false), T.interval(r1, r2, true, true), intervalUnionTex(r1, r2, true), intervalUnionTex(r1, r2, false)];
          question = qChoice(rng, '$S =$', '$' + ansTex + '$', opts.map(function (o) { return '$' + o + '$'; }));
        }
      } else if (delta === 0) {
        var x0 = F(-b, 2 * a);
        steps.push('$\\Delta = 0$ : le trinôme a une racine double $x_0 = -\\dfrac{b}{2a} = ' + x0.tex() + '$ et s\'écrit $' + (a === 1 ? '' : a === -1 ? '-' : a) + T.xMinus(x0) + '^2$.');
        steps.push('Il est du signe de $a$ (' + (a > 0 ? 'positif' : 'négatif') + ') pour tout $x \\neq ' + x0.tex() + '$ et s\'annule en $' + x0.tex() + '$.');
        var good;
        var posSide = !ineqNeg; // on cherche f ≥ 0 / > 0 ?
        if ((a > 0) === posSide) good = strict ? '\\R \\setminus \\left\\{' + x0.tex() + '\\right\\}' : '\\R';
        else good = strict ? '\\varnothing' : '\\left\\{' + x0.tex() + '\\right\\}';
        steps.push('Donc $S = ' + good + '$.');
        question = qChoice(rng, '$S =$', '$' + good + '$', ['$\\R$', '$\\varnothing$', '$\\left\\{' + x0.tex() + '\\right\\}$', '$\\R \\setminus \\left\\{' + x0.tex() + '\\right\\}$']);
      } else {
        steps.push('$\\Delta < 0$ : le trinôme n\'a pas de racine ; il garde le signe de $a$ (' + (a > 0 ? 'positif' : 'négatif') + ') pour tout réel $x$.');
        var g2 = ((a > 0) === !ineqNeg) ? '\\R' : '\\varnothing';
        steps.push('Donc $S = ' + g2 + '$.');
        var xs = F(-b, 2 * a);
        question = qChoice(rng, '$S =$', '$' + g2 + '$', ['$\\R$', '$\\varnothing$', '$\\R \\setminus \\left\\{' + xs.tex() + '\\right\\}$']);
      }
      return {
        enonce: 'Résoudre dans $\\R$ l\'inéquation : $$' + tri + ' ' + sym + ' 0$$',
        questions: [question],
        indices: ['Calcule le discriminant et les racines éventuelles du trinôme.', 'Règle : le trinôme est du signe de $a$ sauf entre ses racines.'],
        solution: steps,
        aide: niveau < 3 ? AIDE_INT : null
      };
    }
  });

  EM.gen.register({
    id: '2s-forme-canonique',
    titre: 'Forme canonique et extremum d\'un trinôme',
    chapitres: ['2s-second-degre', '1s-polynomes'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var a, b, c;
      if (niveau === 1) { a = 1; b = 2 * rng.nz(-5, 5); c = rng.int(-9, 9); }
      else { a = rng.pick([2, 3, -2, -3, -1, 4]); b = rng.nz(-9, 9); c = rng.int(-9, 9); }
      var al = F(-b, 2 * a), be = evalPoly([a, b, c], al);
      var sq = al.isZero() ? 'x^2' : '\\left(x' + (al.n > 0 ? ' - ' : ' + ') + al.abs().tex() + '\\right)^2';
      var canon = (a === 1 ? '' : a === -1 ? '-' : a) + sq + sz(be);
      var steps;
      if (a === 1) {
        var h = F(b, 2);
        steps = [
          '$x^2' + T.mono(b, 'x') + '$ est le début du développement de $' + sq + ' = x^2' + T.mono(b, 'x') + ' + ' + h.mul(h).tex() + '$.',
          'Donc $f(x) = ' + sq + ' - ' + h.mul(h).tex() + sz(c) + (c ? ' = ' + canon : '') + '$.',
          'Ainsi $\\alpha = ' + al.tex() + '$ et $\\beta = ' + be.tex() + '$.'
        ];
      } else {
        var ba = F(b, a), h2 = F(b, 2 * a);
        steps = [
          'On met $' + a + '$ en facteur dans les termes en $x$ : $f(x) = ' + a + '\\left(x^2' + T.mono(ba, 'x') + '\\right)' + sz(c) + '$.',
          '$x^2' + T.mono(ba, 'x') + ' = ' + sq + ' - ' + h2.mul(h2).tex() + '$.',
          'Donc $f(x) = ' + a + '\\left[' + sq + ' - ' + h2.mul(h2).tex() + '\\right]' + sz(c) + ' = ' + canon + '$.',
          'On retrouve $\\alpha = -\\dfrac{b}{2a} = ' + al.tex() + '$ et $\\beta = f(\\alpha) = ' + be.tex() + '$.'
        ];
      }
      steps.push('Comme $a = ' + a + (a > 0 ? ' > 0' : ' < 0') + '$, $' + (a === 1 ? '' : a === -1 ? '-' : a) + sq + '$ est ' + (a > 0 ? 'positif' : 'négatif') + ' ou nul : $f$ admet un ' + (a > 0 ? 'minimum' : 'maximum') + ' égal à $' + be.tex() + '$, atteint en $x = ' + al.tex() + '$.');
      return {
        enonce: 'Soit $f(x) = ' + T.poly([a, b, c]) + '$.<br>1) Écrire $f(x)$ sous forme canonique $a(x - \\alpha)^2 + \\beta$.<br>2) En déduire que $f$ admet un extremum et préciser sa nature.',
        questions: [
          { label: '$\\alpha =$', type: 'number', reponse: al },
          { label: '$\\beta =$', type: 'number', reponse: be },
          qChoice(rng, '$f$ admet :', 'un ' + (a > 0 ? 'minimum' : 'maximum') + ' égal à $' + be.tex() + '$', ['un minimum égal à $' + be.tex() + '$', 'un maximum égal à $' + be.tex() + '$', 'un ' + (a > 0 ? 'minimum' : 'maximum') + ' égal à $' + al.tex() + '$'])
        ],
        indices: ['$\\alpha = -\\dfrac{b}{2a}$ et $\\beta = f(\\alpha)$.', 'Utilise $x^2 + 2hx = (x + h)^2 - h^2$.'],
        solution: steps
      };
    }
  });

  EM.gen.register({
    id: '2s-somme-produit',
    titre: 'Somme et produit des racines',
    chapitres: ['2s-second-degre', '1s-polynomes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.pick([1, 2, 3, -1, -2]), x1 = rng.nz(-5, 5), k = rng.nz(-7, 7);
        if (F(k, a).equals(x1)) k = k + 1 === 0 ? 2 : k + 1;
        var x2 = F(k, a);
        var co = [a, -(a * x1 + k), x1 * k];
        var useSum = rng.bool();
        var steps = [
          '$' + substTex(co, x1) + ' = 0$ : donc $x_1 = ' + x1 + '$ est bien une solution.'
        ];
        if (useSum) {
          steps.push('La somme des racines vaut $x_1 + x_2 = -\\dfrac{b}{a} = ' + F(-co[1], a).tex() + '$.');
          steps.push('Donc $x_2 = ' + F(-co[1], a).tex() + ' - ' + T.par(x1) + ' = ' + x2.tex() + '$.');
        } else {
          steps.push('Le produit des racines vaut $x_1 x_2 = \\dfrac{c}{a} = ' + F(co[2], a).tex() + '$.');
          steps.push('Donc $x_2 = ' + F(co[2], a).tex() + ' \\div ' + T.par(x1) + ' = ' + x2.tex() + '$.');
        }
        return {
          enonce: 'On considère l\'équation $' + T.poly(co) + ' = 0$.<br>Vérifier que $x_1 = ' + x1 + '$ est solution puis, sans calculer le discriminant, déterminer l\'autre solution $x_2$ en utilisant ' + (useSum ? 'la somme' : 'le produit') + ' des racines.',
          questions: [{ label: '$x_2 =$', type: 'number', reponse: x2 }],
          indices: ['Si $x_1$ et $x_2$ sont les racines de $ax^2 + bx + c$ : $x_1 + x_2 = -\\dfrac{b}{a}$ et $x_1 x_2 = \\dfrac{c}{a}$.'],
          solution: steps
        };
      }
      if (niveau === 2) {
        var L = rng.int(12, 40), l = rng.int(5, L - 3);
        var S = L + l, P = L * l, D = S * S - 4 * P;
        var ville = rng.pick(['Kaolack', 'Fatick', 'Kaffrine', 'Nioro du Rip', 'Diourbel']);
        var nom = rng.pick(PRENOMS);
        return {
          enonce: nom + ' possède un champ d\'arachide rectangulaire près de ' + ville + '. Son périmètre mesure $' + (2 * S) + '$ m et son aire $' + T.num(P) + '$ m².<br>Déterminer la longueur $L$ et la largeur $\\ell$ du champ.',
          questions: [
            { label: '$L =$', type: 'number', reponse: L, unite: 'm' },
            { label: '$\\ell =$', type: 'number', reponse: l, unite: 'm' }
          ],
          indices: ['$L + \\ell$ est le demi-périmètre et $L \\times \\ell$ est l\'aire.', 'Deux nombres de somme $S$ et de produit $P$ sont les solutions de $X^2 - SX + P = 0$.'],
          solution: [
            'Le demi-périmètre donne $L + \\ell = ' + S + '$ et l\'aire $L \\times \\ell = ' + T.num(P) + '$.',
            '$L$ et $\\ell$ sont donc les solutions de $X^2 - ' + S + 'X + ' + T.num(P) + ' = 0$.',
            '$\\Delta = ' + S + '^2 - 4 \\times ' + T.num(P) + ' = ' + T.num(D) + '$ et $\\sqrt{\\Delta} = ' + Math.round(Math.sqrt(D)) + '$.',
            '$X_1 = \\dfrac{' + S + ' + ' + Math.round(Math.sqrt(D)) + '}{2} = ' + L + '$ et $X_2 = \\dfrac{' + S + ' - ' + Math.round(Math.sqrt(D)) + '}{2} = ' + l + '$.',
            'La longueur est la plus grande dimension : $L = ' + L + '$ m et $\\ell = ' + l + '$ m. (Vérification : $' + L + ' \\times ' + l + ' = ' + T.num(P) + '$.)'
          ]
        };
      }
      var a3, b3, c3, d3, g = 0;
      do {
        a3 = rng.pick([1, 2, 3, -1, -2]); b3 = rng.int(-9, 9); c3 = rng.nz(-8, 8);
        d3 = b3 * b3 - 4 * a3 * c3; g++;
      } while ((d3 <= 0 || EM.ar.isInt(Math.sqrt(d3))) && g < 100);
      if (d3 <= 0 || EM.ar.isInt(Math.sqrt(d3))) { a3 = 1; b3 = -3; c3 = 1; d3 = 5; }
      var Ss = F(-b3, a3), Pp = F(c3, a3);
      var sumSq = Ss.mul(Ss).sub(Pp.mul(2)), inv = Ss.div(Pp);
      return {
        enonce: 'On considère l\'équation $' + T.poly([a3, b3, c3]) + ' = 0$.<br>1) Justifier qu\'elle admet deux solutions distinctes $x_1$ et $x_2$.<br>2) Sans calculer $x_1$ et $x_2$, calculer $S = x_1 + x_2$, $P = x_1 x_2$, puis $x_1^2 + x_2^2$ et $\\dfrac{1}{x_1} + \\dfrac{1}{x_2}$.',
        questions: [
          { label: '$S =$', type: 'number', reponse: Ss },
          { label: '$P =$', type: 'number', reponse: Pp },
          { label: '$x_1^2 + x_2^2 =$', type: 'number', reponse: sumSq },
          { label: '$\\dfrac{1}{x_1} + \\dfrac{1}{x_2} =$', type: 'number', reponse: inv }
        ],
        indices: ['$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.', '$\\dfrac{1}{x_1} + \\dfrac{1}{x_2} = \\dfrac{x_1 + x_2}{x_1 x_2}$.'],
        solution: [
          '$\\Delta = ' + T.par(b3) + '^2 - 4 \\times ' + T.par(a3) + ' \\times ' + T.par(c3) + ' = ' + d3 + ' > 0$ : deux solutions distinctes.',
          '$S = -\\dfrac{b}{a} = ' + Ss.tex() + '$ et $P = \\dfrac{c}{a} = ' + Pp.tex() + '$.',
          '$x_1^2 + x_2^2 = S^2 - 2P = ' + T.par(Ss) + '^2 - 2 \\times ' + T.par(Pp) + ' = ' + sumSq.tex() + '$.',
          '$\\dfrac{1}{x_1} + \\dfrac{1}{x_2} = \\dfrac{S}{P} = ' + inv.tex() + '$ (possible car $P \\neq 0$).'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Systèmes linéaires                                         */
  /* ================================================================== */

  EM.gen.register({
    id: '2s-systeme-gauss',
    titre: 'Résoudre un système 3 × 3 par la méthode du pivot de Gauss',
    chapitres: ['2s-systemes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      function eqTex(r) { return T.sum([{ c: r[0], v: 'x' }, { c: r[1], v: 'y' }, { c: r[2], v: 'z' }]) + ' = ' + T.num(r[3]); }
      function mk(co) { return co.concat([co[0] * sol[0] + co[1] * sol[1] + co[2] * sol[2]]); }
      function det3(M) {
        return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
      }
      function gcdRow(r) { return r.reduce(function (g, v) { return EM.ar.gcd(g, v); }, 0) || 1; }
      var M, g = 0;
      if (niveau === 1) {
        M = [[1, rng.int(-3, 3), rng.int(-3, 3)], [0, rng.pick([1, 1, 2, -1]), rng.nz(-3, 3)], [0, 0, rng.pick([1, 2, 3, -1, -2])]];
      } else {
        do {
          M = [[niveau === 2 ? 1 : rng.nz(-3, 3), rng.nz(-3, 3), rng.int(-3, 3)], [rng.nz(-3, 3), rng.int(-3, 3), rng.nz(-3, 3)], [rng.nz(-3, 3), rng.nz(-3, 3), rng.int(-3, 3)]];
          g++;
        } while (det3(M) === 0 && g < 200);
        if (det3(M) === 0) M = [[1, 1, 1], [1, -1, 2], [2, 1, -1]];
      }
      var R = M.map(mk);
      var enonce = 'Résoudre dans $\\R^3$ le système suivant par la méthode du pivot de Gauss : $$' + sysTex(R.map(eqTex)) + '$$';
      var steps = [];
      var N = ['L_1', 'L_2', 'L_3'];
      if (niveau > 1) {
        // choix du pivot en x
        var piv = 0;
        for (var i = 1; i < 3; i++) if (Math.abs(R[i][0]) < Math.abs(R[piv][0])) piv = i;
        if (piv !== 0) {
          var tmp = R[0]; R[0] = R[piv]; R[piv] = tmp;
          steps.push('On place en première ligne l\'équation dont le coefficient de $x$ est le plus simple (pivot $' + R[0][0] + '$) : $$' + sysTex(R.map(eqTex), N) + '$$');
        } else {
          steps.push('On numérote les équations $L_1$, $L_2$, $L_3$ ; le pivot est le coefficient $' + R[0][0] + '$ de $x$ dans $L_1$.');
        }
        var ops = [];
        var elim = function (iDst, iSrc, col) {
          var p = R[iSrc][col], q = R[iDst][col];
          if (q === 0) { ops.push('$' + N[iDst] + '$ ne contient pas ' + (col === 0 ? '$x$' : '$y$') + ' : on la garde'); return; }
          var gg = EM.ar.gcd(p, q), al = p / gg, be = q / gg;
          if (al < 0) { al = -al; be = -be; }
          var row = R[iDst].map(function (v, j) { return al * v - be * R[iSrc][j]; });
          var gr = gcdRow(row);
          var txt = '$' + N[iDst] + ' \\leftarrow ' + T.mono(al, N[iDst], true) + T.mono(-be, N[iSrc]) + '$';
          if (gr > 1) { row = row.map(function (v) { return v / gr; }); txt += ', puis on simplifie par $' + gr + '$'; }
          R[iDst] = row;
          ops.push(txt);
        };
        elim(1, 0, 0); elim(2, 0, 0);
        steps.push('On élimine $x$ des lignes 2 et 3 : ' + ops.join(' ; ') + '. $$' + sysTex(R.map(eqTex), N) + '$$');
        ops = [];
        if (R[1][1] === 0) {
          var t2 = R[1]; R[1] = R[2]; R[2] = t2;
          ops.push('on échange $L_2$ et $L_3$ pour avoir un pivot non nul');
        }
        elim(2, 1, 1);
        steps.push('On élimine $y$ de la ligne 3 : ' + ops.join(' ; ') + '. Le système est triangulaire : $$' + sysTex(R.map(eqTex), N) + '$$');
      } else {
        steps.push('Le système est déjà triangulaire : on le résout en remontant, de la dernière équation à la première.');
      }
      // remontée
      var z0 = F(R[2][3], R[2][2]);
      steps.push(R[2][2] === 1 ? '$' + N[2] + '$ donne directement $z = ' + z0.tex() + '$.' : '$' + N[2] + '$ : $' + T.mono(R[2][2], 'z', true) + ' = ' + T.num(R[2][3]) + '$, donc $z = ' + z0.tex() + '$.');
      var by = R[1][1], cz = R[1][2], d2 = R[1][3];
      var y0 = F(d2 - cz * z0.value(), by);
      steps.push('$' + N[1] + '$ : $' + T.mono(by, 'y', true) + (cz ? (cz > 0 ? ' + ' : ' - ') + prodTex(Math.abs(cz), z0) : '') + ' = ' + T.num(d2) +
        (by === 1 ? '$, donc $y = ' + y0.tex() + '$.' : '$, donc $' + T.mono(by, 'y', true) + ' = ' + T.num(d2 - cz * z0.value()) + '$ et $y = ' + y0.tex() + '$.'));
      var ax = R[0][0], b1 = R[0][1], c1 = R[0][2], d1 = R[0][3];
      var x0 = F(d1 - b1 * y0.value() - c1 * z0.value(), ax);
      steps.push('$' + N[0] + '$ : $' + T.mono(ax, 'x', true) +
        (b1 ? (b1 > 0 ? ' + ' : ' - ') + prodTex(Math.abs(b1), y0) : '') +
        (c1 ? (c1 > 0 ? ' + ' : ' - ') + prodTex(Math.abs(c1), z0) : '') + ' = ' + T.num(d1) +
        (ax === 1 ? '$, donc $x = ' + x0.tex() + '$.' : '$, donc $' + T.mono(ax, 'x', true) + ' = ' + T.num(d1 - b1 * y0.value() - c1 * z0.value()) + '$ et $x = ' + x0.tex() + '$.'));
      steps.push('$S = \\left\\{(' + sol.join(' \\,;\\, ') + ')\\right\\}$. Vérifie en remplaçant dans les trois équations de départ.');
      if (!x0.equals(sol[0]) || !y0.equals(sol[1]) || !z0.equals(sol[2])) throw new Error('2s-systeme-gauss : résolution incohérente');
      return {
        enonce: enonce,
        questions: [{ label: '$(x \\,;\\, y \\,;\\, z) =$', type: 'tuple', reponse: sol }],
        indices: ['Utilise la première équation pour éliminer $x$ des deux autres (combinaisons de lignes).', 'Une fois le système triangulaire, calcule $z$, puis $y$, puis $x$.'],
        solution: steps,
        aide: 'Écris le triplet solution, par exemple (1 ; -2 ; 3).'
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Fonctions                                                  */
  /* ================================================================== */

  EM.gen.register({
    id: '2s-ensemble-definition',
    titre: 'Déterminer l\'ensemble de définition d\'une fonction',
    chapitres: ['2s-fonctions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.pick([1, 2, 3, 4, -1, -2, -3]), b = rng.nz(-9, 9), inv = rng.bool(0.4);
        var lin = T.poly([a, b]), r = F(-b, a);
        var fx = inv ? '\\dfrac{' + rng.int(1, 5) + '}{\\sqrt{' + lin + '}}' : '\\sqrt{' + lin + '}';
        var cond = inv ? '>' : '\\geq';
        var ans = a > 0 ? { a: r, b: Infinity, ouvA: inv } : { a: -Infinity, b: r, ouvB: inv };
        var cond2 = a > 0 ? (inv ? '>' : '\\geq') : (inv ? '<' : '\\leq');
        return {
          enonce: 'Déterminer l\'ensemble de définition $D_f$ de la fonction $f$ définie par $$f(x) = ' + fx + '$$',
          questions: [{ label: '$D_f =$', type: 'interval', reponse: ans }],
          indices: ['Une racine carrée n\'existe que pour un nombre positif ou nul.', inv ? 'Ici la racine est au dénominateur : elle ne doit pas être nulle.' : 'Résous l\'inéquation $' + lin + ' \\geq 0$.'],
          solution: [
            '$f(x)$ existe si et seulement si $' + lin + ' ' + cond + ' 0$' + (inv ? ' (la racine carrée doit exister et le dénominateur ne doit pas s\'annuler).' : '.'),
            '$' + lin + ' ' + cond + ' 0 \\iff ' + T.mono(a, 'x', true) + ' ' + cond + ' ' + (-b) + ' \\iff x ' + cond2 + ' ' + r.tex() + '$' + (a < 0 ? ' (on divise par $' + a + ' < 0$ : le sens change).' : '.'),
            '$D_f = ' + T.interval(ans.a, ans.b, ans.ouvA, ans.ouvB) + '$'
          ],
          aide: AIDE_INT
        };
      }
      if (niveau === 2) {
        var num = T.poly([rng.nz(-5, 5), rng.int(-9, 9)]);
        var cas = rng.pick(['deux', 'deux', 'carre', 'aucune']);
        var Dco, roots, steps2;
        if (cas === 'deux') {
          var r1 = rng.int(-6, 6), r2 = rng.intExcept(-6, 6, [r1]), k = rng.pick([1, 1, 2, -1]);
          Dco = [k, -k * (r1 + r2), k * r1 * r2];
          roots = [Math.min(r1, r2), Math.max(r1, r2)];
          var dl = Dco[1] * Dco[1] - 4 * Dco[0] * Dco[2];
          steps2 = ['On résout $' + T.poly(Dco) + ' = 0$ : $\\Delta = ' + T.par(Dco[1]) + '^2 - 4 \\times ' + T.par(Dco[0]) + ' \\times ' + T.par(Dco[2]) + ' = ' + dl + '$, $\\sqrt{\\Delta} = ' + Math.round(Math.sqrt(dl)) + '$, d\'où $x = ' + roots[0] + '$ ou $x = ' + roots[1] + '$.'];
        } else if (cas === 'carre') {
          var kk = rng.int(1, 6);
          Dco = [1, 0, -kk * kk];
          roots = [-kk, kk];
          steps2 = ['$x^2 - ' + (kk * kk) + ' = (x - ' + kk + ')(x + ' + kk + ') = 0 \\iff x = ' + kk + '$ ou $x = -' + kk + '$.'];
        } else {
          var s = rng.int(1, 9);
          Dco = rng.bool() ? [1, 0, s] : [1, 2, s + 1];
          roots = [];
          steps2 = [Dco[1] === 0 ? 'Pour tout réel $x$, $x^2 + ' + s + ' \\geq ' + s + ' > 0$ : le dénominateur ne s\'annule jamais.'
            : '$\\Delta = 2^2 - 4 \\times ' + (s + 1) + ' = ' + (4 - 4 * (s + 1)) + ' < 0$ : le dénominateur ne s\'annule jamais.'];
        }
        var ccl = roots.length ? '$D_f = \\R \\setminus ' + T.set(roots) + '$, soit $D_f = ' + T.interval(-Infinity, roots[0]) + ' \\cup ' + T.interval(roots[0], roots[1], true, true) + ' \\cup ' + T.interval(roots[1], Infinity, true) + '$.' : 'Il n\'y a aucune valeur interdite : $D_f = \\R$.';
        return {
          enonce: 'Soit $f$ la fonction définie par $$f(x) = \\dfrac{' + num + '}{' + T.poly(Dco) + '}$$Déterminer les valeurs interdites, puis l\'ensemble de définition $D_f$.',
          questions: [{ label: 'Valeurs interdites :', type: 'set', reponse: roots }],
          indices: ['Un quotient existe si et seulement si son dénominateur est non nul.', 'Résous l\'équation « dénominateur $= 0$ ».'],
          solution: ['$f(x)$ existe si et seulement si $' + T.poly(Dco) + ' \\neq 0$.'].concat(steps2).concat([ccl]),
          aide: 'Sépare les valeurs par « ; ». Écris « ∅ » s\'il n\'y en a aucune.'
        };
      }
      // niveau 3
      if (rng.bool()) {
        var p = rng.int(-6, 3), q = p + rng.int(2, 7);
        var co = [-1, p + q, -p * q];
        return {
          enonce: 'Déterminer l\'ensemble de définition $D_f$ de la fonction $$f(x) = \\sqrt{' + T.poly(co) + '}$$',
          questions: [{ label: '$D_f =$', type: 'interval', reponse: { a: p, b: q } }],
          indices: ['Il faut $' + T.poly(co) + ' \\geq 0$ : c\'est une inéquation du second degré.', 'Le trinôme est du signe de $a = -1$ à l\'extérieur des racines.'],
          solution: [
            '$f(x)$ existe si et seulement si $' + T.poly(co) + ' \\geq 0$.',
            '$\\Delta = ' + T.par(p + q) + '^2 - 4 \\times (-1) \\times ' + T.par(-p * q) + ' = ' + ((p + q) * (p + q) - 4 * p * q) + '$ ; les racines sont $' + p + '$ et $' + q + '$.',
            'Le trinôme est du signe de $a = -1$ (négatif) à l\'extérieur des racines, donc positif ou nul entre elles.' +
              signTable([{ v: p, t: String(p) }, { v: q, t: String(q) }], [{ nom: T.poly(co), f: function (x) { return -x * x + (p + q) * x - p * q; }, zeros: [p, q] }]),
            '$D_f = ' + T.interval(p, q) + '$'
          ],
          aide: AIDE_INT
        };
      }
      var p3 = rng.int(-5, 5), q3 = rng.intExcept(-6, 8, [p3]);
      var den = T.poly([1, -q3]);
      var good = q3 > p3 ? T.interval(p3, q3, false, true) + ' \\cup ' + T.interval(q3, Infinity, true) : T.interval(p3, Infinity);
      var opts = [T.interval(p3, Infinity), T.interval(p3, Infinity, true), T.interval(p3, q3, false, true) + ' \\cup ' + T.interval(q3, Infinity, true), '\\R \\setminus \\left\\{' + q3 + '\\right\\}'];
      if (q3 < p3) opts[2] = T.interval(q3, p3, true, false) + ' \\cup ' + T.interval(p3, Infinity, true);
      return {
        enonce: 'Déterminer l\'ensemble de définition $D_f$ de la fonction $$f(x) = \\dfrac{\\sqrt{' + T.poly([1, -p3]) + '}}{' + den + '}$$',
        questions: [qChoice(rng, '$D_f =$', '$' + good + '$', opts.map(function (o) { return '$' + o + '$'; }))],
        indices: ['Deux conditions : le radicande doit être positif ou nul et le dénominateur non nul.'],
        solution: [
          '$f(x)$ existe si et seulement si $' + T.poly([1, -p3]) + ' \\geq 0$ et $' + den + ' \\neq 0$.',
          '$' + T.poly([1, -p3]) + ' \\geq 0 \\iff x \\geq ' + p3 + '$ et $' + den + ' \\neq 0 \\iff x \\neq ' + q3 + '$.',
          q3 > p3 ? 'La valeur $' + q3 + '$ appartient à $' + T.interval(p3, Infinity) + '$ : on doit l\'enlever.' : 'La valeur $' + q3 + '$ n\'appartient pas à $' + T.interval(p3, Infinity) + '$ : rien à enlever.',
          '$D_f = ' + good + '$'
        ]
      };
    }
  });

  EM.gen.register({
    id: '2s-parite',
    titre: 'Étudier la parité d\'une fonction',
    chapitres: ['2s-fonctions', '1s-fonctions'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var a = rng.nz(-5, 5), b = rng.nz(-6, 6), c = rng.nz(-9, 9), k = rng.int(1, 6);
      var t, f, fm, D = '\\R', sym = 'Pour tout réel $x$, $-x$ appartient aussi à $\\R$ : $D_f$ est symétrique par rapport à $0$.', nat, just;
      var tpl = niveau === 1 ? rng.pick(['pair4', 'impair3', 'ni32', 'ni21', 'impair5']) : rng.pick(['ratPair', 'ratImpair', 'invImpair', 'absPair', 'decale', 'racine', 'xabs', 'ratPair2']);
      switch (tpl) {
        case 'pair4':
          f = T.poly([a, 0, b, 0, c]); fm = T.mono(a, '(-x)^{4}', true) + T.mono(b, '(-x)^{2}') + T.signed(c);
          nat = 'paire'; just = '$f(-x) = ' + fm + ' = ' + f + ' = f(x)$.'; break;
        case 'impair3':
          f = T.poly([a, 0, b, 0]); fm = T.mono(a, '(-x)^{3}', true) + T.mono(b, '(-x)');
          nat = 'impaire'; just = '$f(-x) = ' + fm + ' = ' + T.poly([-a, 0, -b, 0]) + ' = -\\left(' + f + '\\right) = -f(x)$.'; break;
        case 'impair5':
          f = T.poly([a, 0, b, 0, 0, 0]); fm = T.mono(a, '(-x)^{5}', true) + T.mono(b, '(-x)^{3}');
          nat = 'impaire'; just = '$f(-x) = ' + fm + ' = ' + T.poly([-a, 0, -b, 0, 0, 0]) + ' = -f(x)$.'; break;
        case 'ni32':
          f = T.poly([a, b, 0, 0]);
          nat = 'ni paire ni impaire';
          just = 'Contre-exemple : $f(1) = ' + (a + b) + '$ et $f(-1) = ' + (-a + b) + '$. On a $f(-1) \\neq f(1)$ (donc $f$ n\'est pas paire) et $f(-1) \\neq -f(1)$ (donc $f$ n\'est pas impaire).'; break;
        case 'ni21':
          if (a + c === 0) c = c + (c > 0 ? 1 : -1);
          f = T.poly([a, b, c]);
          nat = 'ni paire ni impaire';
          just = 'Contre-exemple : $f(1) = ' + (a + b + c) + '$ et $f(-1) = ' + (a - b + c) + '$. On a $f(-1) \\neq f(1)$ et $f(-1) \\neq -f(1)$.'; break;
        case 'ratPair':
          f = '\\dfrac{' + T.poly([a, 0, c]) + '}{x^{2} + ' + k + '}';
          nat = 'paire'; sym = 'Pour tout réel $x$, $x^2 + ' + k + ' > 0$, donc $D_f = \\R$, symétrique par rapport à $0$.';
          just = '$f(-x) = \\dfrac{' + T.mono(a, '(-x)^{2}', true) + T.signed(c) + '}{(-x)^{2} + ' + k + '} = ' + f + ' = f(x)$.'; break;
        case 'ratPair2':
          f = '\\dfrac{' + a + '}{x^{2} - ' + (k * k) + '}'; D = '\\R \\setminus \\left\\{-' + k + ' \\,;\\, ' + k + '\\right\\}';
          nat = 'paire'; sym = '$D_f = ' + D + '$ : si $x \\in D_f$, alors $-x \\in D_f$.';
          just = '$f(-x) = \\dfrac{' + a + '}{(-x)^{2} - ' + (k * k) + '} = \\dfrac{' + a + '}{x^{2} - ' + (k * k) + '} = f(x)$.'; break;
        case 'ratImpair':
          f = '\\dfrac{' + T.mono(a, 'x', true) + '}{x^{2} + ' + k + '}';
          nat = 'impaire'; sym = 'Pour tout réel $x$, $x^2 + ' + k + ' > 0$, donc $D_f = \\R$, symétrique par rapport à $0$.';
          just = '$f(-x) = \\dfrac{' + T.mono(a, '(-x)', true) + '}{(-x)^{2} + ' + k + '} = -\\dfrac{' + T.mono(a, 'x', true) + '}{x^{2} + ' + k + '} = -f(x)$.'; break;
        case 'invImpair':
          f = '\\dfrac{' + T.poly([a, 0, c]) + '}{x}'; D = '\\R^*';
          nat = 'impaire'; sym = '$D_f = \\R^*$ : si $x \\neq 0$, alors $-x \\neq 0$.';
          just = '$f(-x) = \\dfrac{' + T.mono(a, '(-x)^{2}', true) + T.signed(c) + '}{-x} = -\\dfrac{' + T.poly([a, 0, c]) + '}{x} = -f(x)$.'; break;
        case 'absPair':
          f = '\\left|x\\right|' + T.mono(a, 'x^{2}');
          nat = 'paire'; just = '$f(-x) = \\left|-x\\right|' + T.mono(a, '(-x)^{2}') + ' = \\left|x\\right|' + T.mono(a, 'x^{2}') + ' = f(x)$.'; break;
        case 'xabs':
          f = T.mono(a, 'x\\left|x\\right|', true);
          nat = 'impaire'; just = '$f(-x) = ' + T.mono(a, '(-x)\\left|-x\\right|', true) + ' = ' + T.mono(-a, 'x\\left|x\\right|', true) + ' = -f(x)$.'; break;
        case 'decale':
          f = '\\dfrac{1}{' + T.poly([1, -k]) + '}'; D = '\\R \\setminus \\left\\{' + k + '\\right\\}';
          nat = 'ni paire ni impaire'; sym = '$D_f = ' + D + '$.';
          just = '$-' + k + ' \\in D_f$ mais son opposé $' + k + ' \\notin D_f$ : $D_f$ n\'est pas symétrique par rapport à $0$, donc $f$ n\'est ni paire ni impaire.'; break;
        default: // racine
          f = '\\sqrt{x + ' + k + '}'; D = '\\left[-' + k + ' \\,;\\, +\\infty\\right[';
          nat = 'ni paire ni impaire'; sym = '$D_f = ' + D + '$.';
          just = '$' + (k + 1) + ' \\in D_f$ mais $-' + (k + 1) + ' \\notin D_f$ : $D_f$ n\'est pas symétrique par rapport à $0$, donc $f$ n\'est ni paire ni impaire.';
      }
      var steps = [sym, just];
      if (nat === 'paire') steps.push('$f$ est paire : sa courbe est symétrique par rapport à l\'axe des ordonnées.');
      else if (nat === 'impaire') steps.push('$f$ est impaire : sa courbe est symétrique par rapport à l\'origine $O$.');
      else steps.push('$f$ n\'est ni paire ni impaire.');
      return {
        enonce: 'Étudier la parité de la fonction $f$ définie par $$f(x) = ' + f + '$$',
        questions: [qChoice(rng, '$f$ est :', nat, ['paire', 'impaire', 'ni paire ni impaire'])],
        indices: ['Vérifie d\'abord que $D_f$ est symétrique par rapport à $0$.', 'Calcule $f(-x)$ et compare avec $f(x)$ et $-f(x)$. Pour prouver qu\'une fonction n\'est pas paire, un contre-exemple suffit.'],
        solution: steps
      };
    }
  });

  EM.gen.register({
    id: '2s-image-antecedent',
    titre: 'Image et antécédents par une fonction',
    chapitres: ['2s-fonctions'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.pick([1, 2, 3, -1, -2]), b = rng.int(-9, 9);
        var x0 = rng.bool(0.6) ? F(rng.nz(-5, 5)) : F(rng.pick([1, -1, 3, -3, 5]), rng.pick([2, 3]));
        var im = evalPoly([a, 0, b], x0);
        var cas = rng.pick(['deux', 'deux', 'deux', 'zero', 'aucun']);
        var kk = rng.int(1, 4), y0, ants, st;
        if (cas === 'deux') y0 = b + a * kk * kk;
        else if (cas === 'zero') y0 = b;
        else y0 = b - a * rng.int(1, 5);
        var rhs = F(y0 - b, a);
        st = '$f(x) = ' + y0 + ' \\iff ' + T.mono(a, 'x^{2}', true) + sz(b) + ' = ' + y0 + ' \\iff x^2 = ' + rhs.tex() + '$';
        if (cas === 'deux') { ants = [-kk, kk]; st += ' $\\iff x = ' + kk + '$ ou $x = -' + kk + '$.'; }
        else if (cas === 'zero') { ants = [0]; st += ' $\\iff x = 0$.'; }
        else { ants = []; st += ' : impossible car un carré est positif ou nul. $' + y0 + '$ n\'a pas d\'antécédent.'; }
        var xT = x0.d === 1 ? T.par(x0) : '\\left(' + x0.tex() + '\\right)';
        return {
          enonce: 'Soit $f$ la fonction définie sur $\\R$ par $f(x) = ' + T.poly([a, 0, b]) + '$.<br>1) Calculer l\'image de $' + x0.tex() + '$ par $f$.<br>2) Déterminer les antécédents éventuels de $' + y0 + '$ par $f$.',
          questions: [
            { label: '$f\\left(' + x0.tex() + '\\right) =$', type: 'number', reponse: im },
            { label: 'Antécédents de $' + y0 + '$ :', type: 'set', reponse: ants }
          ],
          indices: ['L\'image de $a$ est $f(a)$ : remplace $x$ par $a$.', 'Les antécédents de $k$ sont les solutions de l\'équation $f(x) = k$.'],
          solution: [
            '$f\\left(' + x0.tex() + '\\right) = ' + (a === 1 ? '' : T.num(a) + ' \\times ') + xT + '^{2}' + sz(b) + ' = ' + im.tex() + '$.',
            st
          ],
          aide: AIDE_SET
        };
      }
      var A, B, C;
      do { A = rng.nz(-4, 4); B = rng.int(-9, 9); C = rng.nz(-5, 5); } while (A * C - B === 0);
      var xa = rng.intExcept(-5, 5, [-C]);
      var ima = F(A * xa + B, xa + C);
      var noAnt = rng.bool(0.2);
      var y1 = noAnt ? A : rng.intExcept(-6, 6, [A]);
      var fx = '\\dfrac{' + T.poly([A, B]) + '}{' + T.poly([1, C]) + '}';
      var steps = [
        '$D_f = \\R \\setminus \\left\\{' + (-C) + '\\right\\}$.',
        '$f(' + xa + ') = \\dfrac{' + T.num(A) + ' \\times ' + T.par(xa) + sz(B) + '}{' + T.num(xa) + T.signed(C) + '} = ' + (ima.n === A * xa + B && ima.d === xa + C ? '' : '\\dfrac{' + (A * xa + B) + '}{' + (xa + C) + '} = ') + ima.tex() + '$.'
      ];
      var ants2;
      steps.push('Pour $x \\neq ' + (-C) + '$ : $f(x) = ' + y1 + ' \\iff ' + T.poly([A, B]) + ' = ' + timesTex(y1, T.poly([1, C])) + ' \\iff ' + T.poly([A - y1, B - y1 * C]) + ' = 0$.');
      if (noAnt) {
        ants2 = [];
        steps.push('On obtient $' + T.num(B - y1 * C) + ' = 0$, ce qui est faux : $' + y1 + '$ n\'a pas d\'antécédent.');
      } else {
        var xs = F(y1 * C - B, A - y1);
        ants2 = [xs];
        steps.push('Donc $x = ' + xs.tex() + '$, qui est bien différent de $' + (-C) + '$ : c\'est l\'unique antécédent de $' + y1 + '$.');
      }
      return {
        enonce: 'Soit $f$ la fonction définie par $$f(x) = ' + fx + '$$1) Calculer l\'image de $' + xa + '$.<br>2) Déterminer les antécédents éventuels de $' + y1 + '$.',
        questions: [
          { label: '$f(' + xa + ') =$', type: 'number', reponse: ima },
          { label: 'Antécédents de $' + y1 + '$ :', type: 'set', reponse: ants2 }
        ],
        indices: ['Commence par l\'ensemble de définition : le dénominateur ne doit pas s\'annuler.', 'Pour les antécédents, résous $f(x) = k$ en multipliant par le dénominateur (non nul).'],
        solution: steps,
        aide: AIDE_SET
      };
    }
  });

  EM.gen.register({
    id: '2s-variations-reference',
    titre: 'Sens de variation à partir des fonctions de référence',
    chapitres: ['2s-fonctions'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var a = rng.pick([1, 2, 3, -1, -2, -3]), al = rng.nz(-4, 4), be = rng.int(-6, 6);
      var u = rd(al + rng.dec(0.2, 2, 2), 2), v = rd(u + rng.dec(0.1, 1.5, 2), 2);
      if (rng.bool() && niveau === 1) { u = rd(al - rng.dec(0.2, 2, 2) - 1.5, 2); v = rd(u + rng.dec(0.1, 1.4, 2), 2); }
      var f, desc, good, autres, steps, incr, fu, fv;
      if (niveau === 1) {
        var sq = '\\left(' + T.poly([1, -al]) + '\\right)^{2}';
        f = (a === 1 ? '' : a === -1 ? '-' : a) + sq + sz(be);
        var I1 = T.interval(-Infinity, al), I2 = T.interval(al, Infinity);
        var dc = 'décroissante sur $' + I1 + '$ et croissante sur $' + I2 + '$';
        var cd = 'croissante sur $' + I1 + '$ et décroissante sur $' + I2 + '$';
        good = a > 0 ? dc : cd;
        autres = [dc, cd, 'croissante sur $\\R$', 'décroissante sur $\\R$'];
        var fval = function (x) { return a * (x - al) * (x - al) + be; };
        fu = fval(u); fv = fval(v);
        incr = (u >= al) === (a > 0);
        steps = [
          'La fonction carré est décroissante sur $\\left]-\\infty \\,;\\, 0\\right]$ et croissante sur $\\left[0 \\,;\\, +\\infty\\right[$. Donc $x \\mapsto ' + sq + '$ est décroissante sur $' + I1 + '$ et croissante sur $' + I2 + '$ (translation de $' + T.num(al) + '$ selon l\'axe des abscisses).',
          'Multiplier par $' + a + '$ ' + (a > 0 ? 'conserve' : 'inverse') + ' le sens de variation' + (be ? ' ; ajouter $' + be + '$ ne le change pas.' : '.'),
          'Donc $f$ est ' + good + '. Elle admet un ' + (a > 0 ? 'minimum' : 'maximum') + ' égal à $' + be + '$ en $x = ' + al + '$.',
          '$' + T.num(u) + '$ et $' + T.num(v) + '$ appartiennent à $' + (u >= al ? I2 : I1) + '$, où $f$ est ' + (incr ? 'croissante' : 'décroissante') + '. Comme $' + T.num(u) + ' < ' + T.num(v) + '$, on a $f(' + T.num(u) + ') ' + (incr ? '<' : '>') + ' f(' + T.num(v) + ')$.'
        ];
      } else {
        var k = rng.nz(-6, 6);
        f = '\\dfrac{' + k + '}{' + T.poly([1, -al]) + '}' + sz(be);
        var I = T.interval(al, Infinity, true);
        good = (k > 0 ? 'décroissante' : 'croissante') + ' sur $' + I + '$';
        autres = ['croissante sur $' + I + '$', 'décroissante sur $' + I + '$'];
        incr = k < 0;
        steps = [
          'La fonction inverse $x \\mapsto \\dfrac{1}{x}$ est décroissante sur $\\left]0 \\,;\\, +\\infty\\right[$. Donc $x \\mapsto \\dfrac{1}{' + T.poly([1, -al]) + '}$ est décroissante sur $' + I + '$.',
          'Multiplier par $' + k + '$ ' + (k > 0 ? 'conserve' : 'inverse') + ' le sens de variation' + (be ? ' ; ajouter $' + be + '$ ne le change pas.' : '.'),
          'Donc $f$ est ' + good + '.',
          '$' + T.num(u) + '$ et $' + T.num(v) + '$ appartiennent à $' + I + '$ et $' + T.num(u) + ' < ' + T.num(v) + '$, donc $f(' + T.num(u) + ') ' + (incr ? '<' : '>') + ' f(' + T.num(v) + ')$.'
        ];
      }
      var cmpGood = '$f(' + T.num(u) + ') ' + (incr ? '<' : '>') + ' f(' + T.num(v) + ')$';
      return {
        enonce: 'Soit $f$ la fonction définie ' + (niveau === 1 ? 'sur $\\R$' : 'sur $' + T.interval(al, Infinity, true) + '$') + ' par $$f(x) = ' + f + '$$1) Donner le sens de variation de $f$' + (niveau === 1 ? '' : ' sur $' + T.interval(al, Infinity, true) + '$') + '.<br>2) Sans calculatrice, comparer $f(' + T.num(u) + ')$ et $f(' + T.num(v) + ')$.',
        questions: [
          qChoice(rng, '$f$ est :', good, autres),
          qChoice(rng, 'Comparaison :', cmpGood, ['$f(' + T.num(u) + ') < f(' + T.num(v) + ')$', '$f(' + T.num(u) + ') > f(' + T.num(v) + ')$', '$f(' + T.num(u) + ') = f(' + T.num(v) + ')$'])
        ],
        indices: [niveau === 1 ? 'Pars de la fonction carré et de ses variations.' : 'Pars de la fonction inverse et de ses variations.', 'Une fonction croissante conserve l\'ordre ; une fonction décroissante l\'inverse.'],
        solution: steps
      };
    }
  });

  /* ================================================================== */
  /* 2nde S / 1ère L — Statistiques                                      */
  /* ================================================================== */

  var CTX_STAT = [
    { intro: function (N) { return 'Voici les notes (sur 20) obtenues par les ' + N + ' élèves d\'une classe de 2nde S d\'un lycée de Thiès à un devoir de mathématiques.'; }, x: '\\text{Note}', vals: function (rng) { return rng.sample(EM.util.range(5, 18), 6); } },
    { intro: function (N) { return 'Une enquête a relevé le nombre d\'enfants de ' + N + ' ménages d\'un quartier de Mbour.'; }, x: '\\text{Enfants}', vals: function (rng) { return rng.sample(EM.util.range(0, 7), 6); } },
    { intro: function (N) { return 'Au quai de pêche de Kayar, on a compté le nombre de caisses de poissons débarquées par ' + N + ' pirogues.'; }, x: '\\text{Caisses}', vals: function (rng) { return rng.sample(EM.util.range(3, 16), 6); } },
    { intro: function (N) { return 'Voici les pointures de ' + N + ' élèves d\'un collège de Saint-Louis.'; }, x: '\\text{Pointure}', vals: function (rng) { return rng.sample(EM.util.range(36, 45), 6); } },
    { intro: function (N) { return 'Dans un village près de Kaffrine, on a relevé le nombre de sacs d\'arachide récoltés par ' + N + ' cultivateurs.'; }, x: '\\text{Sacs}', vals: function (rng) { return rng.sample(EM.util.range(8, 30), 6); } }
  ];

  EM.gen.register({
    id: '2s-stat-parametres',
    titre: 'Moyenne, médiane, variance, écart-type et quartiles',
    chapitres: ['2s-statistiques', '1l-statistiques'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_STAT);
      var N = rng.pick(niveau === 2 ? [20, 25] : [20, 25, 50]);
      var xs = ctx.vals(rng).sort(function (a, b) { return a - b; });
      var ns = partition(rng, N, xs.length);
      var S = 0, S2 = 0, ecc = [], cum = 0;
      xs.forEach(function (x, i) { S += ns[i] * x; S2 += ns[i] * x * x; cum += ns[i]; ecc.push(cum); });
      var mean = rd(S / N, 6);
      var tab = statTable([ctx.x + ' \\; x_i', '\\text{Effectif } n_i'], [xs.map(String), ns.map(String)]);
      function valRank(r) { for (var i = 0; i < xs.length; i++) if (ecc[i] >= r) return xs[i]; return xs[xs.length - 1]; }
      var eccTab = statTable(['x_i', 'n_i', '\\text{E.C.C.}'], [xs.map(String), ns.map(String), ecc.map(String)]);
      var med, medTxt;
      if (N % 2 === 0) {
        var m1 = valRank(N / 2), m2 = valRank(N / 2 + 1);
        med = rd((m1 + m2) / 2);
        medTxt = '$N = ' + N + '$ est pair : la médiane est la moyenne des valeurs de rangs $' + (N / 2) + '$ et $' + (N / 2 + 1) + '$, soit $Me = \\dfrac{' + m1 + ' + ' + m2 + '}{2} = ' + T.num(med) + '$.';
      } else {
        med = valRank((N + 1) / 2);
        medTxt = '$N = ' + N + '$ est impair : la médiane est la valeur de rang $\\dfrac{N + 1}{2} = ' + ((N + 1) / 2) + '$, soit $Me = ' + med + '$.';
      }
      var meanTxt = '$\\bar{x} = \\dfrac{\\sum n_i x_i}{N} = \\dfrac{' + xs.map(function (x, i) { return ns[i] + ' \\times ' + x; }).join(' + ') + '}{' + N + '} = \\dfrac{' + T.num(S) + '}{' + N + '} = ' + T.num(mean) + '$.';
      var enonce = ctx.intro(N) + tab;
      if (niveau === 1) {
        return {
          enonce: enonce + 'Calculer la moyenne $\\bar{x}$ et la médiane $Me$ de cette série.',
          questions: [
            { label: '$\\bar{x} =$', type: 'number', reponse: mean },
            { label: '$Me =$', type: 'number', reponse: med }
          ],
          indices: ['$\\bar{x} = \\dfrac{n_1x_1 + n_2x_2 + \\dots + n_px_p}{N}$.', 'Pour la médiane, calcule les effectifs cumulés croissants et repère la (ou les) valeur(s) du milieu.'],
          solution: [meanTxt, 'Effectifs cumulés croissants :' + eccTab, medTxt]
        };
      }
      if (niveau === 2) {
        var V = rd(S2 / N - mean * mean, 6), sig = Math.sqrt(V);
        return {
          enonce: enonce + 'Calculer la moyenne $\\bar{x}$, la variance $V$ et l\'écart-type $\\sigma$ de cette série (arrondir $\\sigma$ au centième).',
          questions: [
            { label: '$\\bar{x} =$', type: 'number', reponse: mean },
            { label: '$V =$', type: 'number', reponse: V, tol: 0.01 },
            { label: '$\\sigma \\approx$', type: 'number', reponse: rd(sig, 2), tol: 0.01 }
          ],
          indices: ['$V = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2$.', '$\\sigma = \\sqrt{V}$.'],
          solution: [
            meanTxt,
            '$\\sum n_i x_i^2 = ' + xs.map(function (x, i) { return ns[i] + ' \\times ' + x + '^2'; }).join(' + ') + ' = ' + T.num(S2) + '$.',
            '$V = \\dfrac{' + T.num(S2) + '}{' + N + '} - ' + T.num(mean) + '^2 = ' + T.num(rd(S2 / N, 6)) + ' - ' + T.num(rd(mean * mean, 6)) + ' = ' + T.num(V) + '$.',
            '$\\sigma = \\sqrt{V} = \\sqrt{' + T.num(V) + '} \\approx ' + T.num(rd(sig, 2)) + '$.'
          ]
        };
      }
      var r1 = Math.ceil(N / 4), r3 = Math.ceil(3 * N / 4);
      var Q1 = valRank(r1), Q3 = valRank(r3);
      return {
        enonce: enonce + 'Déterminer la médiane $Me$, le premier quartile $Q_1$ et le troisième quartile $Q_3$ de cette série, puis l\'écart interquartile $Q_3 - Q_1$.',
        questions: [
          { label: '$Me =$', type: 'number', reponse: med },
          { label: '$Q_1 =$', type: 'number', reponse: Q1 },
          { label: '$Q_3 =$', type: 'number', reponse: Q3 },
          { label: '$Q_3 - Q_1 =$', type: 'number', reponse: Q3 - Q1 }
        ],
        indices: ['$Q_1$ est la plus petite valeur de la série telle qu\'au moins 25 % des valeurs lui soient inférieures ou égales.', 'Calcule $\\dfrac{N}{4}$ et $\\dfrac{3N}{4}$, arrondis à l\'entier supérieur : ce sont les rangs de $Q_1$ et $Q_3$.'],
        solution: [
          'Effectifs cumulés croissants :' + eccTab,
          medTxt,
          '$\\dfrac{N}{4} = ' + T.num(N / 4) + '$ : $Q_1$ est la valeur de rang $' + r1 + '$, soit $Q_1 = ' + Q1 + '$.',
          '$\\dfrac{3N}{4} = ' + T.num(3 * N / 4) + '$ : $Q_3$ est la valeur de rang $' + r3 + '$, soit $Q_3 = ' + Q3 + '$.',
          'Écart interquartile : $Q_3 - Q_1 = ' + Q3 + ' - ' + Q1 + ' = ' + (Q3 - Q1) + '$.'
        ]
      };
    }
  });

  var CTX_CLASSES = [
    { intro: function (N) { return 'On a relevé la durée (en minutes) du trajet domicile–lycée de ' + N + ' élèves de Dakar.'; }, x: '\\text{Durée (min)}', a0: 0, h: 10 },
    { intro: function (N) { return 'Une coopérative de Ziguinchor a pesé ' + N + ' mangues (masses en grammes).'; }, x: '\\text{Masse (g)}', a0: 200, h: 50 },
    { intro: function (N) { return 'Voici la répartition par âge (en années) des ' + N + ' membres d\'une tontine de Kaolack.'; }, x: '\\text{Âge}', a0: 20, h: 10 },
    { intro: function (N) { return 'Un vendeur du marché Sandaga de Dakar a noté le montant (en centaines de F CFA) des achats de ' + N + ' clients.'; }, x: '\\text{Montant}', a0: 10, h: 20 }
  ];

  EM.gen.register({
    id: '2s-stat-classes',
    titre: 'Série regroupée en classes : classe modale, moyenne, écart-type',
    chapitres: ['2s-statistiques', '1l-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(CTX_CLASSES), N = rng.pick([20, 25, 40, 50]), k = 5, ns, g = 0;
      if (niveau === 2) N = rng.pick([20, 25, 50]);
      do {
        ns = partition(rng, N, k); g++;
        var mx = Math.max.apply(null, ns);
      } while (ns.filter(function (v) { return v === mx; }).length > 1 && g < 100);
      var bornes = EM.util.range(0, k).map(function (i) { return ctx.a0 + i * ctx.h; });
      var lab = EM.util.range(0, k - 1).map(function (i) { return '\\left[' + bornes[i] + ' \\,;\\, ' + bornes[i + 1] + '\\right['; });
      var cs = EM.util.range(0, k - 1).map(function (i) { return (bornes[i] + bornes[i + 1]) / 2; });
      var S = 0, S2 = 0;
      cs.forEach(function (c, i) { S += ns[i] * c; S2 += ns[i] * c * c; });
      var mean = rd(S / N, 6);
      var imod = ns.indexOf(Math.max.apply(null, ns));
      var tab = statTable([ctx.x, '\\text{Effectif}'], [lab, ns.map(String)]);
      var steps = [
        'On remplace chaque classe par son centre : ' + statTable(['\\text{Centre } c_i', 'n_i'], [cs.map(String), ns.map(String)]),
        '$\\bar{x} = \\dfrac{\\sum n_i c_i}{N} = \\dfrac{' + cs.map(function (c, i) { return ns[i] + ' \\times ' + c; }).join(' + ') + '}{' + N + '} = \\dfrac{' + T.num(S) + '}{' + N + '} = ' + T.num(mean) + '$.'
      ];
      if (niveau === 1) {
        steps.unshift('La classe modale est la classe de plus grand effectif ($' + ns[imod] + '$) : c\'est $' + lab[imod] + '$.');
        return {
          enonce: ctx.intro(N) + tab + '1) Déterminer la classe modale.<br>2) Calculer la moyenne $\\bar{x}$ de cette série (en utilisant les centres des classes).',
          questions: [
            qChoice(rng, 'Classe modale :', '$' + lab[imod] + '$', lab.map(function (l) { return '$' + l + '$'; })),
            { label: '$\\bar{x} =$', type: 'number', reponse: mean }
          ],
          indices: ['La classe modale a le plus grand effectif.', 'Le centre de $[a \\,;\\, b[$ est $\\dfrac{a + b}{2}$.'],
          solution: steps
        };
      }
      var V = rd(S2 / N - mean * mean, 6), sig = Math.sqrt(V);
      steps.push('$\\sum n_i c_i^2 = ' + T.num(S2) + '$, donc $V = \\dfrac{' + T.num(S2) + '}{' + N + '} - ' + T.par(mean) + '^2 = ' + T.num(V) + '$.');
      steps.push('$\\sigma = \\sqrt{V} \\approx ' + T.num(rd(sig, 2)) + '$.');
      return {
        enonce: ctx.intro(N) + tab + 'En utilisant les centres des classes, calculer la moyenne $\\bar{x}$, la variance $V$ et l\'écart-type $\\sigma$ (arrondi au centième).',
        questions: [
          { label: '$\\bar{x} =$', type: 'number', reponse: mean },
          { label: '$V =$', type: 'number', reponse: V, tol: 0.01 },
          { label: '$\\sigma \\approx$', type: 'number', reponse: rd(sig, 2), tol: 0.01 }
        ],
        indices: ['Remplace chaque classe par son centre.', '$V = \\dfrac{\\sum n_i c_i^2}{N} - \\bar{x}^2$ et $\\sigma = \\sqrt{V}$.'],
        solution: steps
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Trigonométrie                                              */
  /* ================================================================== */

  /** Valeur remarquable (cos ou sin d'un multiple de π/6 ou π/4) : TeX et chaîne */
  function trigVal(x) {
    var table = [
      [0, '0', '0'], [0.5, '\\dfrac{1}{2}', '1/2'], [-0.5, '-\\dfrac{1}{2}', '-1/2'],
      [Math.SQRT2 / 2, '\\dfrac{\\sqrt{2}}{2}', 'sqrt(2)/2'], [-Math.SQRT2 / 2, '-\\dfrac{\\sqrt{2}}{2}', '-sqrt(2)/2'],
      [Math.sqrt(3) / 2, '\\dfrac{\\sqrt{3}}{2}', 'sqrt(3)/2'], [-Math.sqrt(3) / 2, '-\\dfrac{\\sqrt{3}}{2}', '-sqrt(3)/2'],
      [1, '1', '1'], [-1, '-1', '-1']
    ];
    for (var i = 0; i < table.length; i++) if (Math.abs(table[i][0] - x) < 1e-9) return { tex: table[i][1], str: table[i][2] };
    throw new Error('Valeur non remarquable ' + x);
  }

  EM.gen.register({
    id: '2s-radians',
    titre: 'Degrés, radians et longueur d\'un arc',
    chapitres: ['2s-trigonometrie'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var d = rng.pick([15 * rng.int(1, 23), 18 * rng.int(1, 9), 20 * rng.int(1, 8), 36 * rng.int(1, 4)]);
        var kr = F(d, 180);
        var q = rng.pick([3, 4, 5, 6, 9, 10, 12, 18]), p;
        do { p = rng.int(1, 2 * q - 1); } while (EM.ar.gcd(p, q) !== 1);
        var deg = 180 * p / q;
        return {
          enonce: '1) Convertir $' + d + '^{\\circ}$ en radians (valeur exacte).<br>2) Convertir $' + piTex(F(p, q)) + '$ rad en degrés.',
          questions: [
            { label: '$' + d + '^{\\circ} =$', type: 'number', reponse: piStr(kr), reponseTex: piTex(kr) + '\\text{ rad}', unite: 'rad' },
            { label: '$' + piTex(F(p, q)) + '\\text{ rad} =$', type: 'number', reponse: deg, unite: '°' }
          ],
          indices: ['$180^{\\circ}$ correspondent à $\\pi$ radians : les mesures sont proportionnelles.', 'Degrés → radians : multiplier par $\\dfrac{\\pi}{180}$ ; radians → degrés : multiplier par $\\dfrac{180}{\\pi}$.'],
          solution: [
            '$' + d + '^{\\circ} = ' + d + ' \\times \\dfrac{\\pi}{180} = ' + piTex(kr) + '$ rad.',
            '$' + piTex(F(p, q)) + '$ rad $= \\dfrac{' + p + ' \\times 180}{' + q + '}$ degrés $= ' + deg + '^{\\circ}$.'
          ],
          aide: 'Écris π avec le symbole π ou « pi », par exemple 5π/6.'
        };
      }
      var r = rng.pick([20, 30, 35, 40, 45, 50, 60]);
      var th = F(rng.pick([1, 2, 3, 5, 7]), rng.pick([3, 4, 6]));
      if (th.value() > 2) th = F(th.n, th.d * 2);
      var L = rd(r * th.value() * Math.PI, 6);
      var Lex = th.mul(r);
      var r2 = rng.pick([4, 5, 6, 8, 9, 10, 12]), k2 = rng.int(1, 3 * r2 - 1);
      var th2 = F(k2, r2);
      var nom = rng.pick(PRENOMS);
      return {
        enonce: '1) La roue d\'une charrette a un rayon de $' + r + '$ cm. Elle tourne d\'un angle de $' + piTex(th) + '$ rad. Calculer la longueur de l\'arc parcouru par un point de la jante (valeur exacte puis arrondi au centième).<br>2) Sur un cercle de rayon $' + r2 + '$ m, ' + nom + ' parcourt un arc de longueur $' + piTex(F(k2)) + '$ m. Calculer la mesure en radians de l\'angle au centre correspondant.',
        questions: [
          { label: '$\\ell \\approx$', type: 'number', reponse: rd(L, 2), tol: 0.01, unite: 'cm', reponseTex: piTex(Lex) + ' \\approx ' + T.num(rd(L, 2)) + '\\text{ cm}' },
          { label: '$\\theta =$', type: 'number', reponse: piStr(th2), reponseTex: piTex(th2) + '\\text{ rad}' }
        ],
        indices: ['Sur un cercle de rayon $R$, un angle au centre de $\\theta$ radians intercepte un arc de longueur $\\ell = R\\theta$.', 'Donc $\\theta = \\dfrac{\\ell}{R}$.'],
        solution: [
          '$\\ell = R\\theta = ' + r + ' \\times ' + piTex(th) + ' = ' + piTex(Lex) + ' \\approx ' + T.num(rd(L, 2)) + '$ cm.',
          '$\\theta = \\dfrac{\\ell}{R} = ' + (EM.ar.gcd(k2, r2) === 1 ? '' : '\\dfrac{' + piTex(F(k2)) + '}{' + r2 + '} = ') + piTex(th2) + '$ rad.'
        ],
        aide: 'Tu peux écrire une valeur exacte comme 25π/2 ou une valeur arrondie au centième.'
      };
    }
  });

  EM.gen.register({
    id: '2s-mesure-principale',
    titre: 'Mesure principale d\'un angle orienté',
    chapitres: ['2s-trigonometrie'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var q = rng.pick([1, 2, 3, 3, 4, 4, 6, 6]);
      var rs = { 1: [1], 2: [-1, 1], 3: [-2, -1, 1, 2], 4: [-3, -1, 1, 3], 6: [-5, -1, 1, 5] }[q];
      var r = rng.pick(rs), k = rng.sign() * rng.int(2, 8);
      var p = r + 2 * q * k;
      var th = F(p, q), pr = F(r, q);
      var steps = [
        'On cherche l\'unique mesure de l\'angle appartenant à $\\left]-\\pi \\,;\\, \\pi\\right]$ : on retranche (ou on ajoute) un multiple de $2\\pi$.',
        q === 1 ? '$' + piTex(th) + ' = ' + piTex(F(r)) + T.signed(2 * k) + '\\pi = \\pi + ' + T.par(k) + ' \\times 2\\pi$.'
          : '$' + p + ' = ' + T.num(2 * q * k) + T.signed(r) + '$, donc $' + piTex(th) + ' = \\dfrac{' + T.num(2 * q * k) + '\\pi}{' + q + '}' + (r > 0 ? ' + ' : ' - ') + piTex(pr.abs()) + ' = ' + piTex(pr) + ' + ' + T.par(k) + ' \\times 2\\pi$.',
        'Comme $-\\pi < ' + piTex(pr) + ' \\leq \\pi$, la mesure principale est $' + piTex(pr) + '$.'
      ];
      var qs = [{ label: 'Mesure principale :', type: 'number', reponse: piStr(pr), reponseTex: piTex(pr) }];
      var enonce = 'Un angle orienté a pour mesure $' + piTex(th) + '$ radians. Déterminer sa mesure principale.';
      if (niveau === 2) {
        var c = trigVal(Math.cos(pr.value() * Math.PI)), s = trigVal(Math.sin(pr.value() * Math.PI));
        enonce += '<br>En déduire $\\cos\\left(' + piTex(th) + '\\right)$ et $\\sin\\left(' + piTex(th) + '\\right)$.';
        qs.push({ label: '$\\cos\\left(' + piTex(th) + '\\right) =$', type: 'number', reponse: c.str, reponseTex: c.tex });
        qs.push({ label: '$\\sin\\left(' + piTex(th) + '\\right) =$', type: 'number', reponse: s.str, reponseTex: s.tex });
        steps.push('Deux mesures d\'un même angle ont le même cosinus et le même sinus : $\\cos\\left(' + piTex(th) + '\\right) = \\cos\\left(' + piTex(pr) + '\\right) = ' + c.tex + '$ et $\\sin\\left(' + piTex(th) + '\\right) = \\sin\\left(' + piTex(pr) + '\\right) = ' + s.tex + '$.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [q === 1 ? 'Écris $' + p + '\\pi$ sous la forme $2k\\pi + r\\pi$ avec $-1 < r \\leq 1$.' : 'Écris le numérateur sous la forme $' + (2 * q) + 'k + r$ : $\\dfrac{' + (2 * q) + 'k\\pi}{' + q + '} = k \\times 2\\pi$.', 'La mesure principale appartient à $\\left]-\\pi \\,;\\, \\pi\\right]$.'],
        solution: steps,
        aide: 'Écris par exemple -5π/6 ou π/3 ; pour les cosinus, √3/2, -1/2…'
      };
    }
  });

  EM.gen.register({
    id: '2s-valeurs-remarquables',
    titre: 'Cosinus et sinus : valeurs remarquables et relation fondamentale',
    chapitres: ['2s-trigonometrie'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var q = rng.pick([6, 4, 3]), k, t;
        do { k = rng.int(-q + 1, 2 * q - 1); t = F(k, q); } while (t.mul(2).isInt());
        var tv = t.value(), al, rel, cs, ss;
        if (tv > 0 && tv < 0.5) { al = t; rel = null; cs = 1; ss = 1; }
        else if (tv > 0.5 && tv < 1) { al = F(1).sub(t); rel = '\\pi - ' + piTex(al); cs = -1; ss = 1; }
        else if (tv > 1 && tv < 1.5) { al = t.sub(1); rel = '\\pi + ' + piTex(al); cs = -1; ss = -1; }
        else if (tv > 1.5) { al = F(2).sub(t); rel = '2\\pi - ' + piTex(al); cs = 1; ss = -1; }
        else if (tv > -0.5) { al = t.neg(); rel = '-' + piTex(al); cs = 1; ss = -1; }
        else { al = F(1).add(t); rel = '-\\pi + ' + piTex(al); cs = -1; ss = -1; }
        var ca = Math.cos(al.value() * Math.PI), sa = Math.sin(al.value() * Math.PI);
        var c = trigVal(cs * ca), s = trigVal(ss * sa);
        var A = piTex(t);
        var steps = [];
        if (rel) {
          steps.push('$' + A + ' = ' + rel + '$ : on se ramène à l\'angle aigu $' + piTex(al) + '$, dont on connaît $\\cos ' + piTex(al) + ' = ' + trigVal(ca).tex + '$ et $\\sin ' + piTex(al) + ' = ' + trigVal(sa).tex + '$.');
          steps.push('Sur le cercle trigonométrique, le point associé à $' + A + '$ a une abscisse ' + (cs > 0 ? 'positive' : 'négative') + ' et une ordonnée ' + (ss > 0 ? 'positive' : 'négative') + ' (angles associés).');
        } else {
          steps.push('$' + A + '$ est une valeur remarquable du premier quadrant.');
        }
        steps.push('$\\cos\\left(' + A + '\\right) = ' + c.tex + '$ et $\\sin\\left(' + A + '\\right) = ' + s.tex + '$.');
        return {
          enonce: 'Donner les valeurs exactes de $\\cos\\left(' + A + '\\right)$ et $\\sin\\left(' + A + '\\right)$.',
          questions: [
            { label: '$\\cos\\left(' + A + '\\right) =$', type: 'number', reponse: c.str, reponseTex: c.tex },
            { label: '$\\sin\\left(' + A + '\\right) =$', type: 'number', reponse: s.str, reponseTex: s.tex }
          ],
          indices: ['Place le point sur le cercle trigonométrique et repère l\'angle aigu associé.', '$\\cos(\\pi - x) = -\\cos x$, $\\sin(\\pi - x) = \\sin x$, $\\cos(\\pi + x) = -\\cos x$, $\\sin(\\pi + x) = -\\sin x$, $\\cos(-x) = \\cos x$, $\\sin(-x) = -\\sin x$.'],
          solution: steps,
          aide: 'Écris par exemple √3/2, -1/2 ou -√2/2.'
        };
      }
      // niveau 2 : relation cos² + sin² = 1
      var trip = rng.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [7, 24, 25], [1, 0, 3], [2, 0, 3], [1, 0, 4]]);
      var a = trip[0], c0 = trip[2];
      var donne = rng.pick(['sin', 'cos']);
      var quad = rng.pick([1, 2, 3, 4]);
      var I = { 1: '\\left[0 \\,;\\, \\dfrac{\\pi}{2}\\right]', 2: '\\left[\\dfrac{\\pi}{2} \\,;\\, \\pi\\right]', 3: '\\left[-\\pi \\,;\\, -\\dfrac{\\pi}{2}\\right]', 4: '\\left[-\\dfrac{\\pi}{2} \\,;\\, 0\\right]' }[quad];
      var sinSign = quad <= 2 ? 1 : -1, cosSign = (quad === 1 || quad === 4) ? 1 : -1;
      var gSign = donne === 'sin' ? sinSign : cosSign, oSign = donne === 'sin' ? cosSign : sinSign;
      var other = donne === 'sin' ? 'cos' : 'sin';
      var v = F(gSign * a, c0);
      var sq2 = c0 * c0 - a * a; // carré de l'autre × c0²
      var sd = EM.ar.sqrtSimplify(sq2);
      var oth = F(oSign * sd.a, c0); // other = oth × √sd.b
      var othTex = radTex(oth, sd.b), othStr = radStr(oth, sd.b);
      var qs2 = [{ label: '$\\' + other + ' x =$', type: 'number', reponse: othStr, reponseTex: othTex }];
      var steps2 = [
        '$\\cos^2 x + \\sin^2 x = 1$, donc $\\' + other + '^2 x = 1 - \\left(' + v.tex() + '\\right)^2 = 1 - ' + v.mul(v).tex() + ' = ' + F(sq2, c0 * c0).tex() + '$.',
        'Sur $' + I + '$, $\\' + other + ' x$ est ' + (oSign > 0 ? 'positif' : 'négatif') + ', donc $\\' + other + ' x = ' + (oSign > 0 ? '' : '-') + '\\sqrt{' + F(sq2, c0 * c0).tex() + '} = ' + othTex + '$.'
      ];
      if (sd.b === 1) {
        var sinv = donne === 'sin' ? v : oth, cosv = donne === 'sin' ? oth : v;
        if (!cosv.isZero()) {
          var tanv = sinv.div(cosv);
          qs2.push({ label: '$\\tan x =$', type: 'number', reponse: tanv });
          steps2.push('$\\tan x = \\dfrac{\\sin x}{\\cos x} = \\dfrac{' + sinv.tex() + '}{' + cosv.tex() + '} = ' + tanv.tex() + '$.');
        }
      }
      return {
        enonce: 'Soit $x$ un réel de l\'intervalle $' + I + '$ tel que $\\' + donne + ' x = ' + v.tex() + '$.<br>Calculer la valeur exacte de $\\' + other + ' x$' + (sd.b === 1 ? ' puis de $\\tan x$.' : '.'),
        questions: qs2,
        indices: ['Utilise la relation fondamentale $\\cos^2 x + \\sin^2 x = 1$.', 'Le signe se lit sur le cercle trigonométrique selon l\'intervalle donné.'],
        solution: steps2,
        aide: 'Valeur exacte : fraction ou radical, par exemple -4/5 ou 2√2/3.'
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Vecteurs et barycentre                                     */
  /* ================================================================== */

  function barTex(pts) {
    return '\\operatorname{bar}\\left\\{' + pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\right\\}';
  }

  EM.gen.register({
    id: '2s-barycentre',
    titre: 'Barycentre de deux ou trois points',
    chapitres: ['2s-vecteurs-barycentre'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var A = [rng.int(-5, 5), rng.int(-5, 5)], B, C;
      do { B = [rng.int(-5, 6), rng.int(-5, 6)]; } while (B[0] === A[0] && B[1] === A[1]);
      var a, b, c;
      if (niveau === 1) {
        do { a = rng.pick([1, 2, 3, 4, -1]); b = rng.pick([1, 2, 3, -2, -1]); } while (a + b === 0);
        var k = F(b, a + b);
        var G = [F(a * A[0] + b * B[0], a + b), F(a * A[1] + b * B[1], a + b)];
        return {
          enonce: 'Dans le repère $(O, \\vec{i}, \\vec{j})$, on donne $A' + pt(A[0], A[1]) + '$ et $B' + pt(B[0], B[1]) + '$. Soit $G = ' + barTex([['A', a], ['B', b]]) + '$.<br>1) Déterminer le réel $k$ tel que $\\vect{AG} = k\\,\\vect{AB}$.<br>2) Calculer les coordonnées de $G$.',
          questions: [
            { label: '$k =$', type: 'number', reponse: k },
            { label: '$G =$', type: 'tuple', reponse: G }
          ],
          indices: ['$G = \\operatorname{bar}\\{(A, a), (B, b)\\}$ avec $a + b \\neq 0$ équivaut à $a\\vect{GA} + b\\vect{GB} = \\vec{0}$, et à $\\vect{AG} = \\dfrac{b}{a + b}\\vect{AB}$.', '$x_G = \\dfrac{a x_A + b x_B}{a + b}$ et $y_G = \\dfrac{a y_A + b y_B}{a + b}$.'],
          solution: [
            '$a + b = ' + (a + b) + ' \\neq 0$, donc le barycentre existe.',
            '$' + a + '\\vect{GA}' + T.mono(b, '\\vect{GB}') + ' = \\vec{0} \\iff ' + a + '\\vect{GA}' + T.mono(b, '\\left(\\vect{GA} + \\vect{AB}\\right)') + ' = \\vec{0} \\iff ' + (a + b) + '\\vect{GA}' + T.mono(b, '\\vect{AB}') + ' = \\vec{0}$, donc $\\vect{AG} = ' + fracEq(b, a + b) + '\\vect{AB}$.',
            '$x_G = ' + quot(a + ' \\times ' + T.par(A[0]) + T.signed(b) + ' \\times ' + T.par(B[0]), a + b) + ' = ' + G[0].tex() + '$ et $y_G = ' + quot(a + ' \\times ' + T.par(A[1]) + T.signed(b) + ' \\times ' + T.par(B[1]), a + b) + ' = ' + G[1].tex() + '$.',
            'Donc $G' + pt(G[0], G[1]) + '$.'
          ].map(function (s) { return s.replace(/1\\vect/g, '\\vect'); }),
          aide: 'Écris les coordonnées entre parenthèses, par exemple (1/3 ; -2).'
        };
      }
      if (niveau === 2) {
        do { C = [rng.int(-5, 5), rng.int(-5, 5)]; } while ((C[0] === A[0] && C[1] === A[1]) || (C[0] === B[0] && C[1] === B[1]));
        do { a = rng.nz(-2, 4); b = rng.nz(-2, 4); c = rng.nz(-2, 4); } while (a + b + c === 0);
        var s = a + b + c;
        var G2 = [F(a * A[0] + b * B[0] + c * C[0], s), F(a * A[1] + b * B[1] + c * C[1], s)];
        return {
          enonce: 'On donne $A' + pt(A[0], A[1]) + '$, $B' + pt(B[0], B[1]) + '$ et $C' + pt(C[0], C[1]) + '$. Calculer les coordonnées du point $G = ' + barTex([['A', a], ['B', b], ['C', c]]) + '$.',
          questions: [{ label: '$G =$', type: 'tuple', reponse: G2 }],
          indices: ['Vérifie d\'abord que la somme des coefficients n\'est pas nulle.', '$x_G = \\dfrac{a x_A + b x_B + c x_C}{a + b + c}$, de même pour $y_G$.'],
          solution: [
            '$a + b + c = ' + a + T.signed(b) + T.signed(c) + ' = ' + s + ' \\neq 0$ : $G$ existe.',
            '$x_G = ' + quot(a + ' \\times ' + T.par(A[0]) + T.signed(b) + ' \\times ' + T.par(B[0]) + T.signed(c) + ' \\times ' + T.par(C[0]), s) + ' = ' + fracEq(a * A[0] + b * B[0] + c * C[0], s) + '$.',
            '$y_G = ' + quot(a + ' \\times ' + T.par(A[1]) + T.signed(b) + ' \\times ' + T.par(B[1]) + T.signed(c) + ' \\times ' + T.par(C[1]), s) + ' = ' + fracEq(a * A[1] + b * B[1] + c * C[1], s) + '$.',
            'Donc $G' + pt(G2[0], G2[1]) + '$.'
          ],
          aide: 'Écris les coordonnées entre parenthèses, par exemple (1/3 ; -2).'
        };
      }
      // niveau 3 : retrouver un coefficient
      do { a = rng.pick([1, 2, 3, 4]); b = rng.pick([1, 2, 3, 4, 5, -1, -2, -3, -5]); } while (a + b === 0 || b === a);
      var k3 = F(b, a + b);
      var G3 = [F(a * A[0] + b * B[0], a + b), F(a * A[1] + b * B[1], a + b)];
      return {
        enonce: 'On donne $A' + pt(A[0], A[1]) + '$, $B' + pt(B[0], B[1]) + '$ et $G' + pt(G3[0], G3[1]) + '$. On admet que $G$ est le barycentre de $(A, ' + a + ')$ et $(B, b)$.<br>1) Déterminer le réel $k$ tel que $\\vect{AG} = k\\,\\vect{AB}$.<br>2) En déduire $b$.<br>3) Pour tout point $M$, $' + T.mono(a, '\\vect{MA}', true) + ' + b\\vect{MB} = \\lambda\\vect{MG}$ : donner $\\lambda$.',
        questions: [
          { label: '$k =$', type: 'number', reponse: k3 },
          { label: '$b =$', type: 'number', reponse: b },
          { label: '$\\lambda =$', type: 'number', reponse: a + b }
        ],
        indices: ['Compare les coordonnées de $\\vect{AG}$ et de $\\vect{AB}$.', '$\\vect{AG} = \\dfrac{b}{' + a + ' + b}\\vect{AB}$ : résous $\\dfrac{b}{' + a + ' + b} = k$.'],
        solution: [
          '$\\vect{AB}' + pt(B[0] - A[0], B[1] - A[1]) + '$ et $\\vect{AG}' + pt(G3[0].sub(A[0]), G3[1].sub(A[1])) + '$, donc $\\vect{AG} = ' + k3.tex() + '\\vect{AB}$.',
          'Or $\\vect{AG} = \\dfrac{b}{' + a + ' + b}\\vect{AB}$, donc $\\dfrac{b}{' + a + ' + b} = ' + k3.tex() + '$.',
          '$b = ' + (k3.equals(1) ? '' : k3.equals(-1) ? '-' : k3.tex()) + '(' + a + ' + b) \\iff b\\left(1 - ' + T.par(k3) + '\\right) = ' + F(a).mul(k3).tex() + ' \\iff ' + T.mono(F(1).sub(k3), 'b', true) + ' = ' + F(a).mul(k3).tex() + ' \\iff b = ' + b + '$.',
          'Réduction vectorielle : $' + T.mono(a, '\\vect{MA}', true) + T.mono(b, '\\vect{MB}') + ' = (' + a + T.signed(b) + ')\\vect{MG} = ' + (a + b) + '\\vect{MG}$, donc $\\lambda = ' + (a + b) + '$.'
        ].map(function (s) { return s.replace(/([^\d])1\\vect/g, '$1\\vect'); })
      };
    }
  });

  EM.gen.register({
    id: '2s-colinearite',
    titre: 'Coordonnées de vecteurs, colinéarité et alignement',
    chapitres: ['2s-vecteurs-barycentre', '2s-droites'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var u = [rng.nz(-5, 5), rng.nz(-5, 5)], v = [rng.int(-5, 5), rng.int(-5, 5)];
        var al = rng.nz(-3, 3), be = rng.nz(-3, 3);
        var w = [al * u[0] + be * v[0], al * u[1] + be * v[1]];
        var e = rng.nz(-6, 6), m = F(u[0] * e, u[1]);
        return {
          enonce: 'On donne les vecteurs $\\vec{u}' + pt(u[0], u[1]) + '$ et $\\vec{v}' + pt(v[0], v[1]) + '$.<br>1) Calculer les coordonnées de $\\vec{w} = ' + T.mono(al, '\\vec{u}', true) + T.mono(be, '\\vec{v}') + '$.<br>2) Déterminer le réel $m$ pour que $\\vec{u}$ et $\\vec{t}' + pt('m', e) + '$ soient colinéaires.',
          questions: [
            { label: '$\\vec{w} =$', type: 'tuple', reponse: w },
            { label: '$m =$', type: 'number', reponse: m }
          ],
          indices: ['Les coordonnées de $\\alpha\\vec{u} + \\beta\\vec{v}$ sont $(\\alpha x + \\beta x\' \\,;\\, \\alpha y + \\beta y\')$.', '$\\vec{u}(x \\,;\\, y)$ et $\\vec{t}(x\' \\,;\\, y\')$ sont colinéaires si et seulement si $xy\' - yx\' = 0$.'],
          solution: [
            '$\\vec{w}' + pt(T.num(al) + ' \\times ' + T.par(u[0]) + T.signed(be) + ' \\times ' + T.par(v[0]), T.num(al) + ' \\times ' + T.par(u[1]) + T.signed(be) + ' \\times ' + T.par(v[1])) + '$, soit $\\vec{w}' + pt(w[0], w[1]) + '$.',
            '$\\vec{u}$ et $\\vec{t}$ colinéaires $\\iff ' + T.par(u[0]) + ' \\times ' + T.par(e) + ' - ' + T.par(u[1]) + ' \\times m = 0 \\iff ' + T.mono(u[1], 'm', true) + ' = ' + (u[0] * e) + ' \\iff m = ' + m.tex() + '$.'
          ],
          aide: 'Coordonnées entre parenthèses : (3 ; -2).'
        };
      }
      var A = [rng.int(-4, 4), rng.int(-4, 4)], B, yC;
      do { B = [rng.int(-5, 5), rng.int(-5, 5)]; } while (B[1] === A[1] || B[0] === A[0]);
      var p = B[0] - A[0], q = B[1] - A[1];
      yC = rng.intExcept(-6, 6, [A[1]]);
      var mC = F(A[0] * q + p * (yC - A[1]), q);
      var Cp = [rng.int(-5, 5), rng.int(-5, 5)];
      if (p * (Cp[1] - A[1]) - q * (Cp[0] - A[0]) === 0) Cp[1] += rng.pick([-2, 2]);
      var D = [A[0] + Cp[0] - B[0], A[1] + Cp[1] - B[1]];
      return {
        enonce: 'Dans un repère, on donne $A' + pt(A[0], A[1]) + '$ et $B' + pt(B[0], B[1]) + '$.<br>1) Déterminer le réel $m$ tel que le point $C' + pt('m', yC) + '$ soit aligné avec $A$ et $B$.<br>2) Soit $E' + pt(Cp[0], Cp[1]) + '$. Déterminer les coordonnées du point $D$ tel que $ABED$ soit un parallélogramme.',
        questions: [
          { label: '$m =$', type: 'number', reponse: mC },
          { label: '$D =$', type: 'tuple', reponse: D }
        ],
        indices: ['$A$, $B$, $C$ alignés $\\iff \\vect{AB}$ et $\\vect{AC}$ colinéaires.', '$ABED$ est un parallélogramme $\\iff \\vect{AB} = \\vect{DE}$.'],
        solution: [
          '$\\vect{AB}' + pt(p, q) + '$ et $\\vect{AC}' + pt(T.poly([1, -A[0]], 'm'), T.num(yC - A[1])) + '$.',
          'Alignement $\\iff ' + T.par(p) + ' \\times ' + T.par(yC - A[1]) + ' - ' + T.par(q) + ' \\times ' + (A[0] === 0 ? 'm' : '\\left(' + T.poly([1, -A[0]], 'm') + '\\right)') + ' = 0 \\iff ' + T.mono(q, 'm', true) + ' = ' + (A[0] * q + p * (yC - A[1])) + ' \\iff m = ' + mC.tex() + '$.',
          '$\\vect{AB} = \\vect{DE} \\iff \\left\\{\\begin{array}{l}' + p + ' = ' + Cp[0] + ' - x_D \\\\ ' + q + ' = ' + Cp[1] + ' - y_D\\end{array}\\right.$, donc $x_D = ' + D[0] + '$ et $y_D = ' + D[1] + '$ : $D' + pt(D[0], D[1]) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Droites du plan                                            */
  /* ================================================================== */

  function cartTex(a, b, c) { return T.sum([{ c: a, v: 'x' }, { c: b, v: 'y' }, { c: c }]) + ' = 0'; }

  EM.gen.register({
    id: '2s-equation-droite',
    titre: 'Équation cartésienne et équation réduite d\'une droite',
    chapitres: ['2s-droites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var A = [rng.int(-5, 5), rng.int(-5, 5)];
      var m, p0, steps, enonce, qs = [];
      if (niveau === 1) {
        var u = [rng.nz(-4, 4), rng.int(-5, 5)];
        m = F(u[1], u[0]); p0 = F(A[1]).sub(m.mul(A[0]));
        var c = u[0] * A[1] - u[1] * A[0];
        var t = rng.nz(-2, 2), on = rng.bool();
        var Bp = [A[0] + t * u[0], A[1] + t * u[1] + (on ? 0 : rng.pick([1, -1, 2]))];
        enonce = 'Soit $D$ la droite passant par $A' + pt(A[0], A[1]) + '$ et de vecteur directeur $\\vec{u}' + pt(u[0], u[1]) + '$.<br>1) Déterminer une équation cartésienne de $D$, puis son équation réduite.<br>2) Dire si le point $B' + pt(Bp[0], Bp[1]) + '$ appartient à $D$.';
        steps = [
          '$M(x \\,;\\, y) \\in D \\iff \\vect{AM}' + pt(T.poly([1, -A[0]]), T.poly([1, -A[1]], 'y')) + '$ et $\\vec{u}$ sont colinéaires.',
          '$\\iff ' + T.par(u[1]) + '\\left(' + T.poly([1, -A[0]]) + '\\right) - ' + T.par(u[0]) + '\\left(' + T.poly([1, -A[1]], 'y') + '\\right) = 0 \\iff ' + cartTex(u[1], -u[0], c) + '$.',
          'Comme le coefficient de $y$ est non nul, on isole $y$ : $y = ' + T.poly([m, p0]) + '$.',
          'On remplace $x$ et $y$ par les coordonnées de $B$ : $' + linSubst([u[1], -u[0]], [Bp[0], Bp[1]], c) + ' = ' + (u[1] * Bp[0] - u[0] * Bp[1] + c) + (on ? '$ : $B \\in D$.' : ' \\neq 0$ : $B \\notin D$.')
        ];
        qs.push({ label: '$y =$', type: 'expr', reponse: polyStr([m, p0]), reponseTex: T.poly([m, p0]) });
        qs.push(qChoice(rng, '$B \\in D$ ?', on ? 'oui' : 'non', ['oui', 'non']));
      } else if (niveau === 2) {
        var B;
        do { B = [rng.int(-5, 6), rng.int(-5, 6)]; } while (B[0] === A[0]);
        m = F(B[1] - A[1], B[0] - A[0]); p0 = F(A[1]).sub(m.mul(A[0]));
        enonce = 'Déterminer l\'équation réduite de la droite $(AB)$ avec $A' + pt(A[0], A[1]) + '$ et $B' + pt(B[0], B[1]) + '$.';
        steps = [
          '$x_A \\neq x_B$ : la droite $(AB)$ n\'est pas parallèle à l\'axe des ordonnées ; elle a une équation de la forme $y = mx + p$.',
          'Coefficient directeur : $m = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{' + B[1] + ' - ' + T.par(A[1]) + '}{' + B[0] + ' - ' + T.par(A[0]) + '} = ' + m.tex() + '$.',
          '$A \\in (AB)$ : $' + A[1] + ' = ' + m.tex() + ' \\times ' + T.par(A[0]) + ' + p$, donc $p = ' + p0.tex() + '$.',
          '$(AB) : y = ' + T.poly([m, p0]) + '$.'
        ];
        qs.push({ label: '$y =$', type: 'expr', reponse: polyStr([m, p0]), reponseTex: T.poly([m, p0]) });
      } else {
        var a = rng.nz(-5, 5), b = rng.nz(-5, 5), c3 = rng.int(-9, 9);
        var g = EM.ar.gcd(EM.ar.gcd(a, b), c3) || 1; a /= g; b /= g; c3 /= g;
        var mp = F(-a, b), pp = F(A[1]).sub(mp.mul(A[0]));
        var mq = F(b, a), pq = F(A[1]).sub(mq.mul(A[0]));
        enonce = 'Le plan est muni d\'un repère orthonormé $(O, \\vec{i}, \\vec{j})$. Soit $D : ' + cartTex(a, b, c3) + '$ et $A' + pt(A[0], A[1]) + '$.<br>Déterminer l\'équation réduite de la droite $D_1$ passant par $A$ et parallèle à $D$, puis celle de la droite $D_2$ passant par $A$ et perpendiculaire à $D$.';
        steps = [
          'Un vecteur directeur de $D$ est $\\vec{u}' + pt(-b, a) + '$ (pour $ax + by + c = 0$, on prend $\\vec{u}(-b \\,;\\, a)$).',
          '$D_1$ a aussi pour vecteur directeur $\\vec{u}$, donc pour coefficient directeur $' + fracEq(a, -b) + '$. Avec $A$ : $p = ' + A[1] + ' - ' + T.par(mp) + ' \\times ' + T.par(A[0]) + ' = ' + pp.tex() + '$, d\'où $D_1 : y = ' + T.poly([mp, pp]) + '$.',
          'Un vecteur $\\vec{v}(x \\,;\\, y)$ est orthogonal à $\\vec{u}$ si et seulement si $' + T.sum([{ c: -b, v: 'x' }, { c: a, v: 'y' }]) + ' = 0$ : on peut prendre $\\vec{v}' + pt(a, b) + '$.',
          '$D_2$ a pour coefficient directeur $' + fracEq(b, a) + '$. Avec $A$ : $p = ' + A[1] + ' - ' + T.par(mq) + ' \\times ' + T.par(A[0]) + ' = ' + pq.tex() + '$, d\'où $D_2 : y = ' + T.poly([mq, pq]) + '$.'
        ];
        qs.push({ label: '$D_1 : y =$', type: 'expr', reponse: polyStr([mp, pp]), reponseTex: T.poly([mp, pp]) });
        qs.push({ label: '$D_2 : y =$', type: 'expr', reponse: polyStr([mq, pq]), reponseTex: T.poly([mq, pq]) });
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: ['Un point $M(x \\,;\\, y)$ appartient à la droite passant par $A$ de vecteur directeur $\\vec{u}$ si et seulement si $\\vect{AM}$ et $\\vec{u}$ sont colinéaires.', 'L\'équation réduite s\'écrit $y = mx + p$ : $m$ est le coefficient directeur.'],
        solution: steps,
        aide: 'Écris seulement le membre de droite, par exemple 2x - 3 ou -x/2 + 1.'
      };
    }
  });

  EM.gen.register({
    id: '2s-droites-positions',
    titre: 'Position relative de deux droites et point d\'intersection',
    chapitres: ['2s-droites', '2s-systemes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var I = [rng.int(-5, 5), rng.int(-5, 5)];
      var a1, b1;
      do { a1 = rng.nz(-5, 5); b1 = rng.nz(-5, 5); } while (EM.ar.gcd(a1, b1) !== 1);
      var c1 = -(a1 * I[0] + b1 * I[1]);
      var cas = rng.pick(niveau === 1 ? ['sec', 'sec', 'par', 'conf'] : ['sec', 'perp', 'par', 'conf']);
      var a2, b2, c2, kk, g = 0;
      if (cas === 'par') { kk = rng.pick([1, -1, 2, -2, 3]); a2 = kk * a1; b2 = kk * b1; c2 = kk * c1 + rng.nz(-6, 6); }
      else if (cas === 'conf') { kk = rng.pick([-1, 2, -2, 3]); a2 = kk * a1; b2 = kk * b1; c2 = kk * c1; }
      else if (cas === 'perp') { kk = rng.pick([1, -1, 2]); a2 = -kk * b1; b2 = kk * a1; c2 = -(a2 * I[0] + b2 * I[1]); }
      else {
        do { a2 = rng.nz(-5, 5); b2 = rng.nz(-5, 5); g++; } while ((a1 * b2 - a2 * b1 === 0 || a1 * a2 + b1 * b2 === 0) && g < 100);
        c2 = -(a2 * I[0] + b2 * I[1]);
      }
      var det = a1 * b2 - a2 * b1, scal = a1 * a2 + b1 * b2;
      var steps = [
        'Vecteurs directeurs : $\\vec{u}_1' + pt(-b1, a1) + '$ pour $D_1$ et $\\vec{u}_2' + pt(-b2, a2) + '$ pour $D_2$.',
        '$\\det(\\vec{u}_1, \\vec{u}_2) = ' + T.par(-b1) + ' \\times ' + T.par(a2) + ' - ' + T.par(a1) + ' \\times ' + T.par(-b2) + ' = ' + det + '$.'
      ];
      var nat, qs = [];
      if (det === 0) {
        var onD2 = a2 * I[0] + b2 * I[1] + c2 === 0;
        nat = onD2 ? 'confondues' : 'strictement parallèles';
        steps.push('Le déterminant est nul : les droites sont parallèles.');
        steps.push('Le point $' + pt(I[0], I[1]) + '$ appartient à $D_1$ ; dans l\'équation de $D_2$ il donne $' + (a2 * I[0] + b2 * I[1] + c2) + (onD2 ? ' = 0$ : il appartient aussi à $D_2$, les droites sont confondues.' : ' \\neq 0$ : il n\'appartient pas à $D_2$, les droites sont strictement parallèles.'));
      } else {
        nat = niveau === 1 ? 'sécantes' : (scal === 0 ? 'sécantes et perpendiculaires' : 'sécantes non perpendiculaires');
        steps.push('Le déterminant est non nul : les droites sont sécantes.');
        if (niveau === 2) steps.push('Dans le repère orthonormé, $\\vec{u}_1 \\cdot \\vec{u}_2$ se calcule par $xx\' + yy\' = ' + T.par(-b1) + ' \\times ' + T.par(-b2) + ' + ' + T.par(a1) + ' \\times ' + T.par(a2) + ' = ' + scal + '$ : ' + (scal === 0 ? 'les vecteurs sont orthogonaux, les droites sont perpendiculaires.' : 'non nul, les droites ne sont pas perpendiculaires.'));
        steps.push('On résout $' + sysTex([T.sum([{ c: a1, v: 'x' }, { c: b1, v: 'y' }]) + ' = ' + (-c1), T.sum([{ c: a2, v: 'x' }, { c: b2, v: 'y' }]) + ' = ' + (-c2)], ['L_1', 'L_2']) + '$.');
        steps.push('$' + T.mono(b2, 'L_1', true) + T.mono(-b1, 'L_2') + '$ élimine $y$ : $' + T.mono(det, 'x', true) + ' = ' + (-c1 * b2 + c2 * b1) + '$, donc $x = ' + I[0] + '$.');
        steps.push('Dans $L_1$ : $' + T.mono(b1, 'y', true) + ' = ' + (-c1) + ' - ' + T.par(a1) + ' \\times ' + T.par(I[0]) + ' = ' + (-c1 - a1 * I[0]) + '$, donc $y = ' + I[1] + '$. Le point d\'intersection est $' + pt(I[0], I[1]) + '$.');
        qs.push({ label: 'Point d\'intersection :', type: 'tuple', reponse: I });
      }
      var opts = niveau === 1 ? ['sécantes', 'strictement parallèles', 'confondues'] : ['sécantes et perpendiculaires', 'sécantes non perpendiculaires', 'strictement parallèles', 'confondues'];
      qs.unshift(qChoice(rng, 'Les droites sont :', nat, opts));
      return {
        enonce: (niveau === 2 ? 'Le repère $(O, \\vec{i}, \\vec{j})$ est orthonormé. ' : '') + 'On considère les droites $$D_1 : ' + cartTex(a1, b1, c1) + ' \\qquad D_2 : ' + cartTex(a2, b2, c2) + '$$Préciser leur position relative' + ' et, si elles sont sécantes, les coordonnées de leur point d\'intersection.',
        questions: qs,
        indices: ['La droite $ax + by + c = 0$ a pour vecteur directeur $\\vec{u}(-b \\,;\\, a)$.', 'Deux droites sont parallèles si et seulement si leurs vecteurs directeurs sont colinéaires (déterminant nul).'],
        solution: steps,
        aide: 'Coordonnées entre parenthèses : (2 ; -1).'
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Transformations                                            */
  /* ================================================================== */

  EM.gen.register({
    id: '2s-transformations',
    titre: 'Image d\'un point par une transformation (coordonnées)',
    chapitres: ['2s-transformations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var M = [rng.int(-5, 5), rng.int(-5, 5)], O = [rng.int(-4, 4), rng.int(-4, 4)];
      if (M[0] === O[0] && M[1] === O[1]) M[0] = O[0] + rng.pick([-3, -2, 2, 3]);
      var rep0 = 'Le plan est muni d\'un repère orthonormé direct $(O, \\vec{i}, \\vec{j})$. ';
      if (niveau === 1) {
        var u = [rng.nz(-5, 5), rng.int(-5, 5)];
        var M1 = [M[0] + u[0], M[1] + u[1]], M2 = [2 * O[0] - M[0], 2 * O[1] - M[1]];
        return {
          enonce: rep0 + 'On donne $M' + pt(M[0], M[1]) + '$, $\\Omega' + pt(O[0], O[1]) + '$ et $\\vec{u}' + pt(u[0], u[1]) + '$.<br>1) Calculer les coordonnées de $M_1$, image de $M$ par la translation $t_{\\vec{u}}$.<br>2) Calculer les coordonnées de $M_2$, image de $M$ par la symétrie centrale $S_{\\Omega}$.',
          questions: [
            { label: '$M_1 =$', type: 'tuple', reponse: M1 },
            { label: '$M_2 =$', type: 'tuple', reponse: M2 }
          ],
          indices: ['$t_{\\vec{u}}(M) = M_1 \\iff \\vect{MM_1} = \\vec{u}$.', '$S_{\\Omega}(M) = M_2 \\iff \\Omega$ est le milieu de $[MM_2]$.'],
          solution: [
            '$\\vect{MM_1} = \\vec{u} \\iff x_{M_1} = ' + M[0] + T.signed(u[0]) + ' = ' + M1[0] + '$ et $y_{M_1} = ' + M[1] + T.signed(u[1]) + ' = ' + M1[1] + '$. Donc $M_1' + pt(M1[0], M1[1]) + '$.',
            '$\\Omega$ milieu de $[MM_2]$ : $x_{M_2} = 2x_{\\Omega} - x_M = ' + (2 * O[0]) + ' - ' + T.par(M[0]) + ' = ' + M2[0] + '$ et $y_{M_2} = 2y_{\\Omega} - y_M = ' + (2 * O[1]) + ' - ' + T.par(M[1]) + ' = ' + M2[1] + '$. Donc $M_2' + pt(M2[0], M2[1]) + '$.'
          ],
          aide: 'Coordonnées entre parenthèses : (2 ; -1).'
        };
      }
      if (niveau === 2) {
        var k = rng.pick([F(2), F(3), F(-2), F(-1, 2), F(1, 2), F(-3), F(3, 2)]);
        var dM = [M[0] - O[0], M[1] - O[1]];
        if (k.d === 2) { dM = [2 * rng.nz(-2, 2), 2 * rng.int(-2, 2)]; M = [O[0] + dM[0], O[1] + dM[1]]; }
        var Mp = [k.mul(dM[0]).add(O[0]), k.mul(dM[1]).add(O[1])];
        var k2 = rng.pick([2, 3, -2, -1, -3]);
        var Om = [rng.int(-4, 4), rng.int(-4, 4)], A = [rng.int(-4, 4), rng.int(-4, 4)];
        if (A[0] === Om[0] && A[1] === Om[1]) A[0] += 1;
        var Ap = [Om[0] + k2 * (A[0] - Om[0]), Om[1] + k2 * (A[1] - Om[1])];
        return {
          enonce: rep0 + '1) Soit $h$ l\'homothétie de centre $\\Omega' + pt(O[0], O[1]) + '$ et de rapport $' + k.tex() + '$. Calculer les coordonnées de $M\' = h(M)$ avec $M' + pt(M[0], M[1]) + '$.<br>2) Une homothétie $h\'$ de rapport $' + k2 + '$ transforme $A' + pt(A[0], A[1]) + '$ en $A\'' + pt(Ap[0], Ap[1]) + '$. Déterminer les coordonnées de son centre $I$.',
          questions: [
            { label: '$M\' =$', type: 'tuple', reponse: Mp },
            { label: '$I =$', type: 'tuple', reponse: Om }
          ],
          indices: ['$h(M) = M\' \\iff \\vect{\\Omega M\'} = k\\,\\vect{\\Omega M}$.', 'Pour le centre : $\\vect{IA\'} = ' + T.mono(k2, '\\vect{IA}', true) + '$ ; écris cette égalité avec les coordonnées de $I(x \\,;\\, y)$.'],
          solution: [
            '$\\vect{\\Omega M}' + pt(dM[0], dM[1]) + '$ et $\\vect{\\Omega M\'} = ' + k.tex() + '\\vect{\\Omega M}$, donc $\\vect{\\Omega M\'}' + pt(k.mul(dM[0]), k.mul(dM[1])) + '$.',
            '$x_{M\'} = ' + O[0] + T.signed(k.mul(dM[0])) + ' = ' + Mp[0].tex() + '$ et $y_{M\'} = ' + O[1] + T.signed(k.mul(dM[1])) + ' = ' + Mp[1].tex() + '$ : $M\'' + pt(Mp[0], Mp[1]) + '$.',
            '$\\vect{IA\'} = ' + T.mono(k2, '\\vect{IA}', true) + ' \\iff \\left\\{\\begin{array}{l}' + Ap[0] + ' - x = ' + k2 + '(' + A[0] + ' - x) \\\\ ' + Ap[1] + ' - y = ' + k2 + '(' + A[1] + ' - y)\\end{array}\\right.$',
            '$\\iff ' + T.mono(k2 - 1, 'x', true) + ' = ' + (k2 * A[0] - Ap[0]) + '$ et $' + T.mono(k2 - 1, 'y', true) + ' = ' + (k2 * A[1] - Ap[1]) + '$, donc $I' + pt(Om[0], Om[1]) + '$.'
          ],
          aide: 'Coordonnées entre parenthèses : (2 ; -1/2).'
        };
      }
      var sgn = rng.sign();
      var d = [M[0] - O[0], M[1] - O[1]];
      var dr = sgn > 0 ? [-d[1], d[0]] : [d[1], -d[0]];
      var R = [O[0] + dr[0], O[1] + dr[1]];
      var axe = rng.pick(['Ox', 'Oy', 'D']);
      var P = [rng.int(-6, 6), rng.int(-6, 6)];
      if (axe === 'Ox' && P[1] === 0) P[1] = rng.pick([-4, 3]);
      if (axe === 'Oy' && P[0] === 0) P[0] = rng.pick([-3, 4]);
      if (axe === 'D' && P[0] === P[1]) P[1] = P[0] + rng.pick([-3, 2]);
      var S = axe === 'Ox' ? [P[0], -P[1]] : axe === 'Oy' ? [-P[0], P[1]] : [P[1], P[0]];
      var axeTex = axe === 'Ox' ? 'l\'axe des abscisses $(Ox)$' : axe === 'Oy' ? 'l\'axe des ordonnées $(Oy)$' : 'la droite $\\Delta : y = x$';
      return {
        enonce: rep0 + '1) Soit $r$ la rotation de centre $\\Omega' + pt(O[0], O[1]) + '$ et d\'angle $' + (sgn > 0 ? '' : '-') + '\\dfrac{\\pi}{2}$. Calculer les coordonnées de $M\' = r(M)$ avec $M' + pt(M[0], M[1]) + '$.<br>2) Calculer les coordonnées de $P\'$, symétrique de $P' + pt(P[0], P[1]) + '$ par rapport à ' + axeTex + '.',
        questions: [
          { label: '$M\' =$', type: 'tuple', reponse: R },
          { label: '$P\' =$', type: 'tuple', reponse: S }
        ],
        indices: ['Par le quart de tour direct, le vecteur $(a \\,;\\, b)$ devient $(-b \\,;\\, a)$ ; par le quart de tour indirect, il devient $(b \\,;\\, -a)$.', 'Symétrie par rapport à $(Ox)$ : $(x \\,;\\, -y)$ ; par rapport à $(Oy)$ : $(-x \\,;\\, y)$ ; par rapport à $y = x$ : $(y \\,;\\, x)$.'],
        solution: [
          '$\\vect{\\Omega M}' + pt(d[0], d[1]) + '$. Par la rotation d\'angle $' + (sgn > 0 ? '' : '-') + '\\dfrac{\\pi}{2}$, $\\vect{\\Omega M\'}' + pt(dr[0], dr[1]) + '$ : ces deux vecteurs ont la même norme, sont orthogonaux ($' + T.par(d[0]) + ' \\times ' + T.par(dr[0]) + ' + ' + T.par(d[1]) + ' \\times ' + T.par(dr[1]) + ' = 0$) et l\'on tourne dans le sens ' + (sgn > 0 ? 'direct' : 'indirect') + '.',
          '$x_{M\'} = ' + O[0] + T.signed(dr[0]) + ' = ' + R[0] + '$ et $y_{M\'} = ' + O[1] + T.signed(dr[1]) + ' = ' + R[1] + '$ : $M\'' + pt(R[0], R[1]) + '$.',
          'Par la symétrie orthogonale d\'axe ' + axeTex + ', $P' + pt(P[0], P[1]) + '$ a pour image $P\'' + pt(S[0], S[1]) + '$.'
        ],
        aide: 'Coordonnées entre parenthèses : (2 ; -1).'
      };
    }
  });

  /* ================================================================== */
  /* 2nde S — Géométrie dans l'espace (cube ABCDEFGH)                    */
  /* ================================================================== */

  var CUBE = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
  var SOMMETS = 'ABCDEFGH'.split('');
  var FACES = [
    { nom: 'ABCD', axe: 2, val: 0 }, { nom: 'EFGH', axe: 2, val: 1 }, { nom: 'ABFE', axe: 1, val: 0 },
    { nom: 'DCGH', axe: 1, val: 1 }, { nom: 'ADHE', axe: 0, val: 0 }, { nom: 'BCGF', axe: 0, val: 1 }
  ];
  function v3sub(p, q) { return [p[0] - q[0], p[1] - q[1], p[2] - q[2]]; }
  function v3cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function v3dot(u, v) { return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; }
  function v3zero(u) { return u[0] === 0 && u[1] === 0 && u[2] === 0; }
  function v3eq(u, v) { return u[0] === v[0] && u[1] === v[1] && u[2] === v[2]; }
  function nomDe(p) { for (var i = 0; i < 8; i++) if (v3eq(CUBE[SOMMETS[i]], p)) return SOMMETS[i]; return null; }
  function nbDiff(X, Y) { var d = v3sub(CUBE[X], CUBE[Y]); return Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]); }

  /** Figure du cube en perspective cavalière ; seg : [X, Y] à mettre en valeur ; plan : liste de sommets */
  function cubeFig(seg, plan) {
    var P = function (n) { var p = CUBE[n]; return [4 * (p[0] + 0.5 * p[1]), 4 * (p[2] + 0.35 * p[1])]; };
    var f = EM.fig.fit(SOMMETS.map(P), { w: 240, h: 220, pad: 26, title: 'Cube ABCDEFGH' });
    if (plan) {
      var pts = plan.map(P);
      var cx = pts.reduce(function (s, p) { return s + p[0]; }, 0) / pts.length, cy = pts.reduce(function (s, p) { return s + p[1]; }, 0) / pts.length;
      pts.sort(function (p, q) { return Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx); });
      f.poly(pts, { fill: true, light: true });
    }
    var aretes = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
    aretes.forEach(function (a) { f.seg(P(a[0]), P(a[1]), { dash: a.indexOf('D') >= 0 }); });
    if (seg) f.seg(P(seg[0]), P(seg[1]), { accent: true });
    var pos = { A: 'so', B: 'se', C: 'e', D: 'no', E: 'o', F: 'e', G: 'ne', H: 'no' };
    SOMMETS.forEach(function (n) { f.point(P(n), n, pos[n]); });
    return f.svg();
  }

  EM.gen.register({
    id: '2s-espace-positions',
    titre: 'Positions relatives de droites et de plans dans un cube',
    chapitres: ['2s-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var paires = [];
      for (var i = 0; i < 8; i++) for (var j = i + 1; j < 8; j++) paires.push(SOMMETS[i] + SOMMETS[j]);
      var intro = '$ABCDEFGH$ est un cube (les faces $ABCD$ et $EFGH$ sont opposées, $[AE]$, $[BF]$, $[CG]$ et $[DH]$ sont des arêtes). ';
      var g = 0, res;
      if (niveau === 1) {
        var cible = rng.pick(['sec', 'par', 'nc']);
        do {
          g++;
          var L1 = rng.pick(paires.filter(function (p) { return nbDiff(p[0], p[1]) < 3; }));
          var L2 = rng.pick(paires.filter(function (p) { return p !== L1; }));
          var X = L1[0], Y = L1[1], Z = L2[0], W = L2[1];
          var F1 = FACES.filter(function (fc) { return CUBE[X][fc.axe] === fc.val && CUBE[Y][fc.axe] === fc.val; })[0];
          var inF = function (n) { return CUBE[n][F1.axe] === F1.val; };
          var u = v3sub(CUBE[Y], CUBE[X]), v = v3sub(CUBE[W], CUBE[Z]);
          var just, nat;
          if (v3zero(v3cross(u, v))) {
            nat = 'par';
            var eqv = v3eq(u, v);
            just = ['$\\vect{' + X + Y + '} = \\vect{' + (eqv ? Z + W : W + Z) + '}$ (côtés opposés d\'un carré ou d\'un rectangle du cube) : les droites $(' + L1 + ')$ et $(' + L2 + ')$ sont parallèles.',
              'Elles sont distinctes ($' + X + ' \\notin (' + L2 + ')$) : elles sont strictement parallèles.'];
          } else if (inF(Z) && inF(W)) {
            nat = 'sec';
            var com = [X, Y].filter(function (n) { return n === Z || n === W; })[0];
            just = ['Les droites $(' + L1 + ')$ et $(' + L2 + ')$ sont toutes deux contenues dans le plan de la face $' + F1.nom + '$ et ne sont pas parallèles : elles sont coplanaires et sécantes.',
              com ? 'Leur point commun est le sommet $' + com + '$.' : 'Ce sont les deux diagonales de la face $' + F1.nom + '$ : elles se coupent au centre de cette face.'];
          } else if (!inF(Z) && !inF(W)) {
            nat = 'nc';
            var opp = FACES.filter(function (fc) { return fc.axe === F1.axe && fc.val !== F1.val; })[0];
            just = ['$(' + L1 + ')$ est contenue dans le plan de la face $' + F1.nom + '$ et $(' + L2 + ')$ dans celui de la face opposée $' + opp.nom + '$. Ces deux plans sont parallèles et distincts, donc les droites n\'ont aucun point commun.',
              'Elles ne sont pas parallèles (leurs vecteurs directeurs $\\vect{' + X + Y + '}$ et $\\vect{' + Z + W + '}$ ne sont pas colinéaires). Deux droites sans point commun et non parallèles sont non coplanaires.'];
          } else {
            var Zin = inF(Z) ? Z : W, Wout = Zin === Z ? W : Z;
            if (Zin === X || Zin === Y) {
              nat = 'sec';
              just = ['Les deux droites passent par le point $' + Zin + '$ et ne sont pas confondues : elles sont sécantes en $' + Zin + '$ (donc coplanaires).'];
            } else {
              nat = 'nc';
              just = ['$(' + L1 + ')$ est contenue dans le plan de la face $' + F1.nom + '$. La droite $(' + L2 + ')$ coupe ce plan au seul point $' + Zin + '$ (car $' + Wout + '$ n\'appartient pas à ce plan), et $' + Zin + ' \\notin (' + L1 + ')$.',
                'Si les deux droites étaient dans un même plan, ce plan contiendrait $(' + L1 + ')$ et $' + Zin + '$ : ce serait le plan de la face $' + F1.nom + '$, qui devrait alors contenir $(' + L2 + ')$. C\'est impossible : les droites sont non coplanaires.'];
            }
          }
          res = { L1: L1, L2: L2, nat: nat, just: just };
        } while (res.nat !== cible && g < 500);
        var noms = { sec: 'sécantes', par: 'strictement parallèles', nc: 'non coplanaires' };
        return {
          enonce: intro + 'Préciser la position relative des droites $(' + res.L1 + ')$ et $(' + res.L2 + ')$.',
          figure: cubeFig(res.L1),
          questions: [qChoice(rng, 'Les droites $(' + res.L1 + ')$ et $(' + res.L2 + ')$ sont :', noms[res.nat], [noms.sec, noms.par, noms.nc])],
          indices: ['Deux droites de l\'espace sont soit coplanaires (sécantes ou parallèles), soit non coplanaires.', 'Cherche un plan (une face du cube) qui contient l\'une des droites, puis regarde comment l\'autre droite le rencontre.'],
          solution: res.just
        };
      }
      // niveau 2 : droite et plan
      var cible2 = rng.pick(['cont', 'par', 'sec']);
      do {
        g++;
        var tri = rng.sample(SOMMETS, 3);
        var Pp = CUBE[tri[0]], n = v3cross(v3sub(CUBE[tri[1]], Pp), v3sub(CUBE[tri[2]], Pp));
        var dans = function (nm) { return v3dot(n, v3sub(CUBE[nm], Pp)) === 0; };
        var duPlan = SOMMETS.filter(dans);
        var Lx = rng.pick(paires);
        var Xs = Lx[0], Ys = Lx[1], d = v3sub(CUBE[Ys], CUBE[Xs]);
        var nomPlan = '(' + tri.slice().sort().join('') + ')';
        var listeTxt = 'Le plan $' + nomPlan + '$ contient les sommets ' + duPlan.map(function (s) { return '$' + s + '$'; }).join(', ') + '.';
        var nat2 = null, just2;
        if (dans(Xs) && dans(Ys)) {
          nat2 = 'cont';
          just2 = [listeTxt, 'Les points $' + Xs + '$ et $' + Ys + '$ appartiennent tous les deux au plan $' + nomPlan + '$ : la droite $(' + Lx + ')$ est contenue dans ce plan.'];
        } else if (v3dot(n, d) === 0) {
          var ST = null;
          duPlan.forEach(function (s) { duPlan.forEach(function (t) { if (!ST && s !== t && v3eq(v3sub(CUBE[t], CUBE[s]), d)) ST = s + t; }); });
          if (ST) {
            nat2 = 'par';
            var hors = dans(Xs) ? Ys : Xs;
            just2 = [listeTxt, '$\\vect{' + Lx + '} = \\vect{' + ST + '}$ et la droite $(' + ST + ')$ est contenue dans le plan $' + nomPlan + '$ : la droite $(' + Lx + ')$ est parallèle à ce plan.',
              'Le point $' + hors + '$ n\'appartient pas au plan $' + nomPlan + '$ : la droite n\'est pas contenue dans le plan, elle lui est strictement parallèle.'];
          }
        } else {
          var t = v3dot(n, v3sub(Pp, CUBE[Xs])) / v3dot(n, d);
          var I = [CUBE[Xs][0] + t * d[0], CUBE[Xs][1] + t * d[1], CUBE[Xs][2] + t * d[2]];
          var nI = nomDe(I);
          if (nI) {
            nat2 = 'sec';
            var autre = nI === Xs ? Ys : Xs;
            just2 = [listeTxt, 'Le sommet $' + nI + '$ appartient à la droite $(' + Lx + ')$ et au plan $' + nomPlan + '$, alors que $' + autre + '$ n\'appartient pas à ce plan.',
              'La droite rencontre donc le plan sans y être contenue : elle est sécante au plan $' + nomPlan + '$ en $' + nI + '$.'];
          }
        }
        res = { nat: nat2, L: Lx, plan: nomPlan, just: just2, duPlan: duPlan };
      } while ((res.nat !== cible2 && g < 2000) || !res.nat);
      var noms2 = { cont: 'la droite est contenue dans le plan', par: 'la droite est strictement parallèle au plan', sec: 'la droite est sécante au plan' };
      return {
        enonce: intro + 'Préciser la position relative de la droite $(' + res.L + ')$ et du plan $' + res.plan + '$.',
        figure: cubeFig(res.L, res.duPlan),
        questions: [qChoice(rng, 'Position :', noms2[res.nat], [noms2.cont, noms2.par, noms2.sec])],
        indices: ['Commence par repérer tous les sommets du cube qui sont dans le plan $' + res.plan + '$.', 'Une droite est parallèle à un plan si elle est parallèle à une droite de ce plan.'],
        solution: res.just
      };
    }
  });

  /* ================================================================== */
  /* 1ère L — Problèmes du second degré                                  */
  /* ================================================================== */

  EM.gen.register({
    id: '1l-probleme-second-degre',
    titre: 'Résoudre un problème conduisant à une équation du second degré',
    chapitres: ['1l-equations', '2s-second-degre'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var nom = rng.pick(PRENOMS), ville = rng.pick(VILLES);
      var tpl = niveau === 1 ? rng.pick(['rect', 'consec']) : rng.pick(['partage', 'allee']);
      if (tpl === 'rect') {
        var l = rng.int(6, 30), d = rng.int(2, 15), A = l * (l + d), D = d * d + 4 * A, s = Math.round(Math.sqrt(D));
        return {
          enonce: nom + ' veut clôturer un terrain rectangulaire à ' + ville + '. La longueur dépasse la largeur de $' + d + '$ m et l\'aire du terrain est $' + T.num(A) + '$ m². On note $x$ la largeur (en m).<br>1) Montrer que $x^2 + ' + d + 'x - ' + T.num(A) + ' = 0$.<br>2) En déduire la largeur et la longueur du terrain.',
          questions: [
            { label: 'Largeur :', type: 'number', reponse: l, unite: 'm' },
            { label: 'Longueur :', type: 'number', reponse: l + d, unite: 'm' }
          ],
          indices: ['La longueur vaut $x + ' + d + '$ et l\'aire vaut longueur × largeur.', 'Une longueur est positive : garde seulement la solution positive.'],
          solution: [
            'L\'aire vaut $x(x + ' + d + ') = ' + T.num(A) + '$, soit $x^2 + ' + d + 'x - ' + T.num(A) + ' = 0$.',
            '$\\Delta = ' + d + '^2 + 4 \\times ' + T.num(A) + ' = ' + T.num(D) + '$ et $\\sqrt{\\Delta} = ' + s + '$.',
            '$x_1 = \\dfrac{-' + d + ' - ' + s + '}{2} = ' + ((-d - s) / 2) + '$ (impossible, car négatif) et $x_2 = \\dfrac{-' + d + ' + ' + s + '}{2} = ' + l + '$.',
            'La largeur est $' + l + '$ m et la longueur $' + l + ' + ' + d + ' = ' + (l + d) + '$ m. (Vérification : $' + l + ' \\times ' + (l + d) + ' = ' + T.num(A) + '$.)'
          ]
        };
      }
      if (tpl === 'consec') {
        var n = rng.int(5, 40), S = n * n + (n + 1) * (n + 1), D2 = 4 + 8 * (S - 1), s2 = Math.round(Math.sqrt(D2));
        return {
          enonce: 'La somme des carrés de deux entiers naturels consécutifs est égale à $' + T.num(S) + '$. On note $n$ le plus petit.<br>1) Montrer que $2n^2 + 2n - ' + T.num(S - 1) + ' = 0$.<br>2) Déterminer ces deux entiers.',
          questions: [
            { label: 'Plus petit entier :', type: 'number', reponse: n },
            { label: 'Plus grand entier :', type: 'number', reponse: n + 1 }
          ],
          indices: ['Les deux entiers sont $n$ et $n + 1$.', 'Développe $n^2 + (n + 1)^2$.'],
          solution: [
            '$n^2 + (n + 1)^2 = ' + T.num(S) + ' \\iff 2n^2 + 2n + 1 = ' + T.num(S) + ' \\iff 2n^2 + 2n - ' + T.num(S - 1) + ' = 0$.',
            '$\\Delta = 2^2 - 4 \\times 2 \\times ' + T.par(-(S - 1)) + ' = ' + T.num(D2) + '$ et $\\sqrt{\\Delta} = ' + s2 + '$.',
            '$n_1 = \\dfrac{-2 - ' + s2 + '}{4} = ' + T.num((-2 - s2) / 4) + '$ (rejetée : $n$ est un entier naturel) et $n_2 = \\dfrac{-2 + ' + s2 + '}{4} = ' + n + '$.',
            'Les deux entiers sont $' + n + '$ et $' + (n + 1) + '$ : $' + n + '^2 + ' + (n + 1) + '^2 = ' + T.num(n * n) + ' + ' + T.num((n + 1) * (n + 1)) + ' = ' + T.num(S) + '$.'
          ]
        };
      }
      if (tpl === 'partage') {
        var N, k, dd, Sm, guard = 0;
        do {
          N = rng.int(8, 20); k = rng.int(1, 4); dd = 100 * rng.int(2, 15);
          Sm = dd * N * (N - k) / k; guard++;
        } while ((!EM.ar.isInt(Sm) || Sm % 100 !== 0) && guard < 200);
        if (!EM.ar.isInt(Sm) || Sm % 100 !== 0) { N = 10; k = 2; dd = 500; Sm = 20000; }
        var c0 = N * (N - k), De = k * k + 4 * c0, sq = Math.round(Math.sqrt(De));
        return {
          enonce: 'Un groupe d\'amis de ' + ville + ' loue un minicar pour une excursion à Saly. Le prix total, $' + T.num(Sm) + '$ F CFA, est partagé équitablement. Au dernier moment, $' + k + '$ ami' + (k > 1 ? 's' : '') + ' se désiste' + (k > 1 ? 'nt' : '') + ' ; chacun des autres paie alors $' + T.num(dd) + '$ F CFA de plus.<br>On note $x$ le nombre d\'amis au départ. Montrer que $x^2 - ' + (k === 1 ? '' : k) + 'x - ' + T.num(c0) + ' = 0$, puis trouver $x$.',
          questions: [{ label: '$x =$', type: 'number', reponse: N }],
          indices: ['Part prévue : $\\dfrac{' + T.num(Sm) + '}{x}$ ; part réelle : $\\dfrac{' + T.num(Sm) + '}{x - ' + k + '}$.', 'Écris que la différence des parts vaut $' + T.num(dd) + '$ puis multiplie par $x(x - ' + k + ')$.'],
          solution: [
            '$\\dfrac{' + T.num(Sm) + '}{x - ' + k + '} - \\dfrac{' + T.num(Sm) + '}{x} = ' + T.num(dd) + '$, avec $x > ' + k + '$.',
            'En multipliant par $x(x - ' + k + ')$ : $' + T.num(Sm) + 'x - ' + T.num(Sm) + '(x - ' + k + ') = ' + T.num(dd) + 'x(x - ' + k + ')$, soit $' + T.num(Sm * k) + ' = ' + T.num(dd) + 'x^2 - ' + T.num(dd * k) + 'x$.',
            'On divise par $' + T.num(dd) + '$ : $x^2 - ' + (k === 1 ? '' : k) + 'x - ' + T.num(c0) + ' = 0$.',
            '$\\Delta = ' + T.par(-k) + '^2 + 4 \\times ' + T.num(c0) + ' = ' + T.num(De) + '$, $\\sqrt{\\Delta} = ' + sq + '$ : $x = \\dfrac{' + k + ' + ' + sq + '}{2} = ' + N + '$ (l\'autre solution, $\\dfrac{' + k + ' - ' + sq + '}{2} = ' + ((k - sq) / 2) + '$, est négative).',
            'Ils étaient $' + N + '$ amis. Vérification : $' + T.num(Sm) + ' \\div ' + (N - k) + ' - ' + T.num(Sm) + ' \\div ' + N + ' = ' + T.num(Sm / (N - k)) + ' - ' + T.num(Sm / N) + ' = ' + T.num(dd) + '$.'
          ]
        };
      }
      // allée autour d'un jardin
      var L = rng.int(8, 30), la = rng.int(5, L - 1), x = rng.pick([1, 1.5, 2, 2.5, 3]);
      var At = rd((L + 2 * x) * (la + 2 * x), 4);
      var b = 2 * (L + la), c = L * la - At;
      var Dl = b * b - 16 * c, sl = Math.sqrt(Dl);
      return {
        enonce: 'Un jardin maraîcher rectangulaire des Niayes mesure $' + L + '$ m sur $' + la + '$ m. On l\'entoure d\'une allée de largeur constante $x$ (en m). L\'aire totale (jardin et allée) est alors de $' + T.num(At) + '$ m².<br>Montrer que $4x^2 + ' + b + 'x - ' + T.num(-c) + ' = 0$ puis calculer $x$.',
        questions: [{ label: '$x =$', type: 'number', reponse: x, unite: 'm' }],
        indices: ['Les dimensions totales sont $' + L + ' + 2x$ et $' + la + ' + 2x$.', 'Développe $(' + L + ' + 2x)(' + la + ' + 2x)$ et garde la solution positive.'],
        solution: [
          '$(' + L + ' + 2x)(' + la + ' + 2x) = ' + T.num(At) + ' \\iff ' + (L * la) + ' + ' + (2 * L) + 'x + ' + (2 * la) + 'x + 4x^2 = ' + T.num(At) + ' \\iff 4x^2 + ' + b + 'x - ' + T.num(-c) + ' = 0$.',
          '$\\Delta = ' + b + '^2 - 4 \\times 4 \\times ' + T.par(c) + ' = ' + T.num(Dl) + '$ et $\\sqrt{\\Delta} = ' + T.num(sl) + '$.',
          '$x = \\dfrac{-' + b + ' + ' + T.num(sl) + '}{8} = ' + T.num(x) + '$ (l\'autre solution est négative).',
          'L\'allée a une largeur de $' + T.num(x) + '$ m.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* 1ère L — Dérivée et variations                                      */
  /* ================================================================== */

  function varTable(crit, signs, vals) {
    // crit : TeX des valeurs critiques ; signs : signes de f' sur chaque intervalle ; vals : TeX des valeurs de f aux points critiques
    var n = crit.length;
    var spec = 'c|' + rep('c', 2 * n + 3);
    var head = 'x & -\\infty & & ' + crit.join(' & & ') + ' & & +\\infty';
    var r1 = ['f\'(x)', ''], r2 = ['f(x)', ''];
    signs.forEach(function (s, i) {
      r1.push(s); r2.push(s === '+' ? '\\nearrow' : '\\searrow');
      if (i < n) { r1.push('0'); r2.push(vals[i]); }
    });
    r1.push(''); r2.push('');
    return '$$\\begin{array}{' + spec + '}' + head + ' \\\\ \\hline ' + r1.join(' & ') + ' \\\\ \\hline ' + r2.join(' & ') + '\\end{array}$$';
  }

  EM.gen.register({
    id: '1l-derivee-variations',
    titre: 'Dérivée d\'un polynôme, tangente et sens de variation',
    chapitres: ['1l-fonctions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var co = [rng.int(-3, 3), rng.int(-5, 5), rng.int(-6, 6), rng.int(-9, 9)];
        if (co[0] === 0 && co[1] === 0) co[1] = 2;
        var dco = [3 * co[0], 2 * co[1], co[2]];
        while (dco.length > 1 && dco[0] === 0) dco.shift();
        var fco = co.slice(); while (fco.length > 1 && fco[0] === 0) fco.shift();
        var x0 = rng.int(-3, 3);
        var f0 = evalPoly(fco, x0), d0 = evalPoly(dco, x0);
        var tg = [d0, f0.sub(d0.mul(x0))];
        return {
          enonce: 'Soit $f$ la fonction définie sur $\\R$ par $f(x) = ' + T.poly(fco) + '$.<br>1) Calculer $f\'(x)$.<br>2) Déterminer une équation de la tangente $(T)$ à la courbe de $f$ au point d\'abscisse $' + x0 + '$.',
          questions: [
            { label: '$f\'(x) =$', type: 'expr', reponse: polyStr(dco), reponseTex: T.poly(dco) },
            { label: '$(T) : y =$', type: 'expr', reponse: polyStr(tg), reponseTex: T.poly(tg) }
          ],
          indices: ['$(x^n)\' = nx^{n-1}$, la dérivée d\'une constante est nulle, et $(au + v)\' = au\' + v\'$.', 'La tangente au point d\'abscisse $a$ a pour équation $y = f\'(a)(x - a) + f(a)$.'],
          solution: [
            '$f\'(x) = ' + T.poly(dco) + '$.',
            '$f(' + x0 + ') = ' + substEq(fco, x0) + '$ et $f\'(' + x0 + ') = ' + substEq(dco, x0) + '$.',
            '$(T) : y = ' + (d0.isZero() ? '0 \\times ' : d0.equals(1) ? '' : d0.equals(-1) ? '-' : T.par(d0)) + (x0 === 0 ? 'x' : '\\left(' + T.poly([1, -x0]) + '\\right)') + sz(f0) + '$, soit $y = ' + T.poly(tg) + '$.'
          ],
          aide: 'Écris l\'expression développée, par exemple 6x² - 4x + 1.'
        };
      }
      if (niveau === 2) {
        var a = rng.pick([1, -1, 2, -2, 3]), al = rng.int(-4, 4), c = rng.int(-6, 6);
        var b = -2 * a * al;
        var f = [a, b, c], df = [2 * a, b];
        var ext = evalPoly(f, al);
        var signs = a > 0 ? ['-', '+'] : ['+', '-'];
        return {
          enonce: 'Soit $f(x) = ' + T.poly(f) + '$, définie sur $\\R$.<br>1) Calculer $f\'(x)$ et étudier son signe.<br>2) Dresser le tableau de variation de $f$ et préciser son extremum.',
          questions: [
            { label: '$f\'(x) =$', type: 'expr', reponse: polyStr(df), reponseTex: T.poly(df) },
            { label: 'L\'extremum est atteint en $x =$', type: 'number', reponse: al },
            { label: 'Valeur de l\'extremum :', type: 'number', reponse: ext },
            qChoice(rng, 'Nature :', a > 0 ? 'minimum' : 'maximum', ['minimum', 'maximum'])
          ],
          indices: ['$f\'(x)$ est une fonction affine : cherche où elle s\'annule.', 'Si $f\' < 0$ puis $f\' > 0$, la fonction descend puis remonte : c\'est un minimum.'],
          solution: [
            '$f\'(x) = ' + T.poly(df) + '$.',
            '$f\'(x) = 0 \\iff x = ' + al + '$. Comme $' + (2 * a) + (a > 0 ? ' > 0' : ' < 0') + '$, $f\'(x)$ est ' + (a > 0 ? 'négative' : 'positive') + ' avant $' + al + '$ et ' + (a > 0 ? 'positive' : 'négative') + ' après.',
            '$f(' + al + ') = ' + substEq(f, al) + '$.' + varTable([String(al)], signs, [ext.tex()]),
            '$f$ admet un ' + (a > 0 ? 'minimum' : 'maximum') + ' égal à $' + ext.tex() + '$, atteint en $x = ' + al + '$.'
          ],
          aide: 'Pour f\'(x), écris l\'expression développée.'
        };
      }
      var r1, r2, A;
      do { A = rng.pick([1, -1, 2, -2]); r1 = rng.int(-3, 2); r2 = r1 + rng.int(1, 4); } while ((A * (r1 + r2)) % 2 !== 0);
      var d = rng.int(-5, 5);
      var f3 = [A, -3 * A * (r1 + r2) / 2, 3 * A * r1 * r2, d];
      var df3 = [3 * A, -3 * A * (r1 + r2), 3 * A * r1 * r2];
      var v1 = evalPoly(f3, r1), v2 = evalPoly(f3, r2);
      var maxV = A > 0 ? v1 : v2, minV = A > 0 ? v2 : v1;
      var s3 = A > 0 ? ['+', '-', '+'] : ['-', '+', '-'];
      return {
        enonce: 'Soit $f(x) = ' + T.poly(f3) + '$, définie sur $\\R$.<br>1) Calculer $f\'(x)$ et vérifier que $f\'(x) = ' + (3 * A === 1 ? '' : 3 * A === -1 ? '-' : 3 * A) + T.xMinus(r1) + T.xMinus(r2) + '$.<br>2) Dresser le tableau de variation de $f$ et donner son maximum local et son minimum local.',
        questions: [
          { label: '$f\'(x) =$', type: 'expr', reponse: polyStr(df3), reponseTex: T.poly(df3) },
          { label: 'Maximum local :', type: 'number', reponse: maxV },
          { label: 'Minimum local :', type: 'number', reponse: minV }
        ],
        indices: ['Le signe d\'un trinôme $a(x - x_1)(x - x_2)$ est celui de $a$ à l\'extérieur des racines.', 'Calcule $f(' + r1 + ')$ et $f(' + r2 + ')$.'],
        solution: [
          '$f\'(x) = ' + T.poly(df3) + '$. En développant $' + (3 * A === 1 ? '' : 3 * A === -1 ? '-' : 3 * A) + T.xMinus(r1) + T.xMinus(r2) + '$, on retrouve bien cette expression.',
          '$f\'$ s\'annule en $' + r1 + '$ et $' + r2 + '$ ; elle est du signe de $' + (3 * A) + '$ (' + (A > 0 ? 'positive' : 'négative') + ') à l\'extérieur des racines et du signe contraire entre elles.',
          '$f(' + r1 + ') = ' + v1.tex() + '$ et $f(' + r2 + ') = ' + v2.tex() + '$.' + varTable([String(r1), String(r2)], s3, [v1.tex(), v2.tex()]),
          'Maximum local : $' + maxV.tex() + '$ (en $x = ' + (A > 0 ? r1 : r2) + '$) ; minimum local : $' + minV.tex() + '$ (en $x = ' + (A > 0 ? r2 : r1) + '$).'
        ],
        aide: 'Pour f\'(x), écris l\'expression développée.'
      };
    }
  });

  /* ================================================================== */
  /* 1ère L — Suites                                                     */
  /* ================================================================== */

  EM.gen.register({
    id: '1l-suite-arithmetique',
    titre: 'Suites arithmétiques : terme général et somme',
    chapitres: ['1l-suites', '1s-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var u0 = rng.int(-10, 20), r = rng.nz(-6, 8), n = rng.int(10, 40), i0 = rng.pick([0, 1]);
        var un = u0 + (n - i0) * r, nb = n - i0 + 1, S = nb * (u0 + un) / 2;
        return {
          enonce: '$(u_n)$ est la suite arithmétique de premier terme $u_' + i0 + ' = ' + u0 + '$ et de raison $r = ' + r + '$.<br>1) Calculer $u_{' + n + '}$.<br>2) Calculer la somme $S = u_' + i0 + ' + u_' + (i0 + 1) + ' + \\dots + u_{' + n + '}$.',
          questions: [
            { label: '$u_{' + n + '} =$', type: 'number', reponse: un },
            { label: '$S =$', type: 'number', reponse: S }
          ],
          indices: ['$u_n = u_' + i0 + ' + ' + (i0 ? '(n - 1)' : 'n') + 'r$.', 'Somme = (nombre de termes) × $\\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$.'],
          solution: [
            '$u_{' + n + '} = u_' + i0 + ' + ' + (i0 ? '(' + n + ' - ' + i0 + ')' : n) + ' \\times r = ' + u0 + ' + ' + (n - i0) + ' \\times ' + T.par(r) + ' = ' + un + '$.',
            'De $u_' + i0 + '$ à $u_{' + n + '}$, il y a $' + (i0 ? n + ' - ' + i0 + ' + 1' : n + ' + 1') + ' = ' + nb + '$ termes.',
            '$S = ' + nb + ' \\times \\dfrac{' + u0 + T.signed(un) + '}{2} = ' + T.num(S) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        var r2 = rng.nz(-5, 7), v0 = rng.int(-15, 15), p = rng.int(2, 6), q = p + rng.int(3, 9);
        var up = v0 + p * r2, uq = v0 + q * r2;
        return {
          enonce: '$(u_n)$ est une suite arithmétique telle que $u_' + p + ' = ' + up + '$ et $u_{' + q + '} = ' + uq + '$.<br>Déterminer sa raison $r$ et son premier terme $u_0$.',
          questions: [
            { label: '$r =$', type: 'number', reponse: r2 },
            { label: '$u_0 =$', type: 'number', reponse: v0 }
          ],
          indices: ['$u_q = u_p + (q - p)r$.', 'Puis $u_0 = u_p - p \\times r$.'],
          solution: [
            '$u_{' + q + '} = u_' + p + ' + (' + q + ' - ' + p + ')r$, donc $' + uq + ' = ' + up + ' + ' + (q - p) + 'r$, d\'où $' + (q - p) + 'r = ' + (uq - up) + '$ et $r = ' + r2 + '$.',
            '$u_' + p + ' = u_0 + ' + p + 'r$, donc $u_0 = ' + up + ' - ' + p + ' \\times ' + T.par(r2) + ' = ' + v0 + '$.'
          ]
        };
      }
      var nom = rng.pick(PRENOMS);
      if (rng.bool()) {
        var a1 = 500 * rng.int(4, 20), rr = 250 * rng.int(1, 4), N = rng.pick([10, 12, 15, 18, 24]);
        var aN = a1 + (N - 1) * rr, tot = N * (a1 + aN) / 2;
        return {
          enonce: nom + ' cotise à une tontine du marché de Tilène à Ziguinchor. Le premier mois, elle verse $' + T.num(a1) + '$ F CFA, puis chaque mois $' + T.num(rr) + '$ F CFA de plus que le mois précédent. On note $u_n$ le versement du $n$-ième mois ($u_1 = ' + T.num(a1) + '$).<br>1) Préciser la nature de la suite $(u_n)$ et calculer le versement du ' + N + 'e mois.<br>2) Calculer le montant total versé au bout de ' + N + ' mois.',
          questions: [
            { label: '$u_{' + N + '} =$', type: 'number', reponse: aN, unite: 'F CFA' },
            { label: 'Total :', type: 'number', reponse: tot, unite: 'F CFA' }
          ],
          indices: ['On ajoute chaque mois la même somme : la suite est arithmétique.', '$u_n = u_1 + (n - 1)r$ et la somme de $N$ termes vaut $N \\times \\dfrac{u_1 + u_N}{2}$.'],
          solution: [
            'Chaque versement s\'obtient en ajoutant $' + T.num(rr) + '$ au précédent : $(u_n)$ est arithmétique de raison $r = ' + T.num(rr) + '$ et de premier terme $u_1 = ' + T.num(a1) + '$.',
            '$u_{' + N + '} = u_1 + (' + N + ' - 1) \\times r = ' + T.num(a1) + ' + ' + (N - 1) + ' \\times ' + T.num(rr) + ' = ' + T.num(aN) + '$ F CFA.',
            'Total : $u_1 + \\dots + u_{' + N + '} = ' + N + ' \\times \\dfrac{' + T.num(a1) + ' + ' + T.num(aN) + '}{2} = ' + T.num(tot) + '$ F CFA.'
          ]
        };
      }
      var p1 = rng.int(12, 30), ra = rng.int(2, 5), R = rng.int(15, 30);
      var pR = p1 + (R - 1) * ra, totP = R * (p1 + pR) / 2;
      return {
        enonce: 'Dans la tribune d\'un stade de ' + rng.pick(['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis']) + ', le premier rang compte $' + p1 + '$ places et chaque rang compte $' + ra + '$ places de plus que le précédent. La tribune a $' + R + '$ rangs.<br>1) Calculer le nombre de places du dernier rang.<br>2) Calculer le nombre total de places de la tribune.',
        questions: [
          { label: 'Dernier rang :', type: 'number', reponse: pR },
          { label: 'Total :', type: 'number', reponse: totP }
        ],
        indices: ['Le nombre de places par rang forme une suite arithmétique de raison $' + ra + '$.', 'Somme de $N$ termes : $N \\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$.'],
        solution: [
          'Notons $u_n$ le nombre de places du rang $n$ : $(u_n)$ est arithmétique, $u_1 = ' + p1 + '$, $r = ' + ra + '$.',
          '$u_{' + R + '} = ' + p1 + ' + (' + R + ' - 1) \\times ' + ra + ' = ' + pR + '$ places.',
          'Total : $' + R + ' \\times \\dfrac{' + p1 + ' + ' + pR + '}{2} = ' + T.num(totP) + '$ places.'
        ]
      };
    }
  });

  EM.gen.register({
    id: '1l-suite-geometrique',
    titre: 'Suites géométriques : terme général, somme, évolutions',
    chapitres: ['1l-suites', '1s-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var q = rng.pick([F(2), F(3), F(-2), F(1, 2), F(-3)]), n = rng.int(4, 7);
        var u0 = rng.pick([1, 2, 3, 5, -1, -2]) * (q.d === 2 ? 64 : 1);
        var un = F(u0).mul(q.pow(n));
        var S = F(u0).mul(F(1).sub(q.pow(n + 1))).div(F(1).sub(q));
        return {
          enonce: '$(u_n)$ est la suite géométrique de premier terme $u_0 = ' + u0 + '$ et de raison $q = ' + q.tex() + '$.<br>1) Calculer $u_' + n + '$.<br>2) Calculer $S = u_0 + u_1 + \\dots + u_' + n + '$.',
          questions: [
            { label: '$u_' + n + ' =$', type: 'number', reponse: un },
            { label: '$S =$', type: 'number', reponse: S }
          ],
          indices: ['$u_n = u_0 \\times q^n$.', 'Pour $q \\neq 1$ : $u_0 + u_1 + \\dots + u_n = u_0 \\times \\dfrac{1 - q^{n+1}}{1 - q}$.'],
          solution: [
            '$u_' + n + ' = u_0 \\times q^' + n + ' = ' + u0 + ' \\times ' + T.par(q).replace(/^\\dfrac/, '\\left(\\dfrac').replace(/(\\dfrac\{\d+\}\{\d+\})$/, '$1\\right)') + '^' + n + ' = ' + un.tex() + '$.',
            'La somme comporte $' + (n + 1) + '$ termes : $S = ' + u0 + ' \\times \\dfrac{1 - ' + T.par(q).replace(/^\\dfrac/, '\\left(\\dfrac').replace(/(\\dfrac\{\d+\}\{\d+\})$/, '$1\\right)') + '^{' + (n + 1) + '}}{1 - ' + T.par(q) + '} = ' + S.tex() + '$.'
          ]
        };
      }
      if (niveau === 2) {
        var q2 = rng.pick([F(2), F(3), F(1, 2), F(3, 2), F(1, 3)]);
        var v0 = rng.int(1, 5) * Math.pow(q2.d, 3) * (rng.bool(0.8) ? 1 : -1);
        var u1 = q2.mul(v0), u3 = q2.pow(3).mul(v0);
        return {
          enonce: '$(u_n)$ est une suite géométrique de raison $q > 0$ telle que $u_1 = ' + u1.tex() + '$ et $u_3 = ' + u3.tex() + '$.<br>Déterminer $q$ puis $u_0$.',
          questions: [
            { label: '$q =$', type: 'number', reponse: q2 },
            { label: '$u_0 =$', type: 'number', reponse: v0 }
          ],
          indices: ['$u_3 = u_1 \\times q^2$.', 'Puis $u_0 = \\dfrac{u_1}{q}$.'],
          solution: [
            '$u_3 = u_1 \\times q^2$, donc $q^2 = \\dfrac{u_3}{u_1} = ' + (u3.isInt() && u1.isInt() ? fracEq(u3.n, u1.n) : '\\dfrac{' + u3.tex() + '}{' + u1.tex() + '} = ' + q2.mul(q2).tex()) + '$.',
            'Comme $q > 0$ : $q = \\sqrt{' + q2.mul(q2).tex() + '} = ' + q2.tex() + '$.',
            '$u_0 = \\dfrac{u_1}{q} = ' + u1.tex() + ' \\div ' + q2.tex() + ' = ' + T.num(v0) + '$.'
          ]
        };
      }
      var ctx = rng.pick(['moto', 'ville', 'epargne']);
      var nom = rng.pick(PRENOMS), N = rng.int(3, 8), V0, t, q3, txt, unite, rq;
      if (ctx === 'moto') {
        V0 = 50000 * rng.int(10, 30); t = rng.pick([10, 12, 15, 20]); q3 = 1 - t / 100;
        txt = nom + ' achète une moto-taxi à $' + T.num(V0) + '$ F CFA. Chaque année, la moto perd $' + t + '\\,\\%$ de sa valeur. On note $V_n$ sa valeur après $n$ années ($V_0 = ' + T.num(V0) + '$).';
        unite = 'F CFA'; rq = 'perdre $' + t + '\\,\\%$ revient à multiplier par $1 - \\dfrac{' + t + '}{100} = ' + T.num(q3) + '$';
      } else if (ctx === 'ville') {
        V0 = 1000 * rng.int(80, 500); t = rng.pick([2, 3, 4, 5]); q3 = 1 + t / 100;
        txt = 'Une commune du Sénégal compte $' + T.num(V0) + '$ habitants. On estime que sa population augmente de $' + t + '\\,\\%$ par an. On note $V_n$ la population dans $n$ années ($V_0 = ' + T.num(V0) + '$).';
        unite = 'habitants'; rq = 'augmenter de $' + t + '\\,\\%$ revient à multiplier par $1 + \\dfrac{' + t + '}{100} = ' + T.num(q3) + '$';
      } else {
        V0 = 25000 * rng.int(4, 40); t = rng.pick([3, 4, 5, 6]); q3 = 1 + t / 100;
        txt = nom + ' place $' + T.num(V0) + '$ F CFA sur un compte qui rapporte $' + t + '\\,\\%$ par an, les intérêts étant ajoutés au capital chaque année. On note $V_n$ le capital après $n$ années.';
        unite = 'F CFA'; rq = 'ajouter $' + t + '\\,\\%$ revient à multiplier par $1 + \\dfrac{' + t + '}{100} = ' + T.num(q3) + '$';
      }
      q3 = rd(q3, 4);
      var VN = V0 * Math.pow(q3, N);
      return {
        enonce: txt + '<br>1) Montrer que $(V_n)$ est géométrique et donner sa raison $q$.<br>2) Calculer $V_' + N + '$ (arrondir à l\'unité).',
        questions: [
          { label: '$q =$', type: 'number', reponse: q3 },
          { label: '$V_' + N + ' \\approx$', type: 'number', reponse: Math.round(VN), tol: 1, unite: unite }
        ],
        indices: ['Une évolution de $t\\,\\%$ correspond à une multiplication par $1 \\pm \\dfrac{t}{100}$.', '$V_n = V_0 \\times q^n$.'],
        solution: [
          'D\'une année à la suivante, ' + rq + ' : $V_{n+1} = ' + T.num(q3) + ' \\times V_n$. La suite est géométrique de raison $q = ' + T.num(q3) + '$.',
          '$V_' + N + ' = V_0 \\times q^' + N + ' = ' + T.num(V0) + ' \\times ' + T.num(q3) + '^' + N + ' \\approx ' + T.num(Math.round(VN)) + '$ ' + unite + '.'
        ],
        aide: 'Écris la raison sous forme décimale (par exemple 0,85) et la valeur arrondie à l\'unité.'
      };
    }
  });

  /* ================================================================== */
  /* 1ère L — Mathématiques financières                                  */
  /* ================================================================== */

  EM.gen.register({
    id: '1l-interets-simples',
    titre: 'Intérêts simples : intérêt, valeur acquise, taux, durée',
    chapitres: ['1l-pourcentages'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var nom = rng.pick(PRENOMS), ville = rng.pick(VILLES);
      var C = 50000 * rng.int(4, 40), t = rng.pick([3, 4, 4.5, 5, 6, 7.5, 8]);
      if (niveau === 1) {
        var n = rng.int(1, 5), I = C * t * n / 100;
        return {
          enonce: nom + ' place $' + T.num(C) + '$ F CFA dans une mutuelle d\'épargne de ' + ville + ', à intérêts simples, au taux annuel de $' + T.num(t) + '\\,\\%$, pendant $' + n + '$ an' + (n > 1 ? 's' : '') + '.<br>1) Calculer l\'intérêt produit.<br>2) Calculer la valeur acquise (capital + intérêts) à la fin du placement.',
          questions: [
            { label: 'Intérêt :', type: 'number', reponse: I, unite: 'F CFA' },
            { label: 'Valeur acquise :', type: 'number', reponse: C + I, unite: 'F CFA' }
          ],
          indices: ['À intérêts simples : $I = C \\times \\dfrac{t}{100} \\times n$ ($n$ en années).', 'Valeur acquise : $A = C + I$.'],
          solution: [
            '$I = ' + T.num(C) + ' \\times \\dfrac{' + T.num(t) + '}{100} \\times ' + n + ' = ' + T.num(I) + '$ F CFA.',
            '$A = C + I = ' + T.num(C) + ' + ' + T.num(I) + ' = ' + T.num(C + I) + '$ F CFA.'
          ]
        };
      }
      if (niveau === 2) {
        var mois = rng.bool(), d, I2, form;
        if (mois) {
          d = rng.int(2, 11); I2 = C * t * d / 1200;
          form = '$I = \\dfrac{C \\times t \\times m}{1\\,200} = \\dfrac{' + T.num(C) + ' \\times ' + T.num(t) + ' \\times ' + d + '}{1\\,200}';
        } else {
          d = rng.pick([30, 45, 60, 72, 90, 120, 150, 180, 240]); I2 = C * t * d / 36000;
          form = '$I = \\dfrac{C \\times t \\times j}{36\\,000} = \\dfrac{' + T.num(C) + ' \\times ' + T.num(t) + ' \\times ' + d + '}{36\\,000}';
        }
        var Ir = Math.round(I2);
        return {
          enonce: 'Une commerçante du marché de ' + rng.pick(['Kaolack', 'Thiès', 'Touba', 'Mbour']) + ' place $' + T.num(C) + '$ F CFA à intérêts simples au taux annuel de $' + T.num(t) + '\\,\\%$ pendant $' + d + '$ ' + (mois ? 'mois' : 'jours') + '.' + (mois ? '' : ' (On utilise l\'année commerciale de 360 jours.)') + '<br>Calculer l\'intérêt produit (arrondi au franc) et la valeur acquise.',
          questions: [
            { label: 'Intérêt :', type: 'number', reponse: Ir, tol: 1, unite: 'F CFA' },
            { label: 'Valeur acquise :', type: 'number', reponse: C + Ir, tol: 1, unite: 'F CFA' }
          ],
          indices: [mois ? 'Pour une durée de $m$ mois : $I = \\dfrac{C \\times t \\times m}{1\\,200}$.' : 'Pour une durée de $j$ jours : $I = \\dfrac{C \\times t \\times j}{36\\,000}$.', 'Valeur acquise : $A = C + I$.'],
          solution: [
            form + (EM.ar.isInt(I2) ? ' = ' : ' \\approx ') + T.num(Ir) + '$ F CFA.',
            '$A = ' + T.num(C) + ' + ' + T.num(Ir) + ' = ' + T.num(C + Ir) + '$ F CFA.'
          ]
        };
      }
      var cas = rng.pick(['taux', 'capital', 'duree']);
      var n3 = rng.int(2, 6), I3 = C * t * n3 / 100, A3 = C + I3;
      if (cas === 'taux') {
        return {
          enonce: 'Un capital de $' + T.num(C) + '$ F CFA, placé à intérêts simples pendant $' + n3 + '$ ans, a rapporté $' + T.num(I3) + '$ F CFA d\'intérêts. Déterminer le taux annuel de placement (en %).',
          questions: [{ label: '$t =$', type: 'number', reponse: t, unite: '%' }],
          indices: ['$I = C \\times \\dfrac{t}{100} \\times n$ : isole $t$.'],
          solution: ['$t = \\dfrac{100 \\times I}{C \\times n} = \\dfrac{100 \\times ' + T.num(I3) + '}{' + T.num(C) + ' \\times ' + n3 + '} = ' + T.num(t) + '$. Le taux est de $' + T.num(t) + '\\,\\%$.']
        };
      }
      if (cas === 'capital') {
        return {
          enonce: nom + ' veut disposer de $' + T.num(A3) + '$ F CFA dans $' + n3 + '$ ans pour ouvrir un atelier de couture. Déterminer le capital qu\'il doit placer aujourd\'hui à intérêts simples au taux annuel de $' + T.num(t) + '\\,\\%$.',
          questions: [{ label: '$C =$', type: 'number', reponse: C, unite: 'F CFA' }],
          indices: ['$A = C + C \\times \\dfrac{t}{100} \\times n = C\\left(1 + \\dfrac{t \\times n}{100}\\right)$.'],
          solution: [
            '$A = C\\left(1 + \\dfrac{' + T.num(t) + ' \\times ' + n3 + '}{100}\\right) = ' + T.num(rd(1 + t * n3 / 100, 4)) + ' \\times C$.',
            '$C = \\dfrac{' + T.num(A3) + '}{' + T.num(rd(1 + t * n3 / 100, 4)) + '} = ' + T.num(C) + '$ F CFA.'
          ]
        };
      }
      return {
        enonce: 'Un capital de $' + T.num(C) + '$ F CFA est placé à intérêts simples au taux annuel de $' + T.num(t) + '\\,\\%$. Déterminer au bout de combien d\'années la valeur acquise sera de $' + T.num(A3) + '$ F CFA.',
        questions: [{ label: '$n =$', type: 'number', reponse: n3, unite: 'ans' }],
        indices: ['L\'intérêt vaut $A - C$.', '$n = \\dfrac{100 \\times I}{C \\times t}$.'],
        solution: [
          '$I = A - C = ' + T.num(A3) + ' - ' + T.num(C) + ' = ' + T.num(I3) + '$ F CFA.',
          '$n = \\dfrac{100 \\times ' + T.num(I3) + '}{' + T.num(C) + ' \\times ' + T.num(t) + '} = ' + n3 + '$ ans.'
        ]
      };
    }
  });

  EM.gen.register({
    id: '1l-interets-composes',
    titre: 'Intérêts composés : valeur acquise et valeur actuelle',
    chapitres: ['1l-pourcentages', '1l-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var nom = rng.pick(PRENOMS);
      var C = 50000 * rng.int(4, 40), t = rng.pick([3, 4, 5, 6, 7, 8]), n = rng.int(2, 10);
      var q = rd(1 + t / 100, 4), Cn = C * Math.pow(q, n);
      if (niveau === 1) {
        return {
          enonce: nom + ' place $' + T.num(C) + '$ F CFA à intérêts composés au taux annuel de $' + t + '\\,\\%$ (les intérêts sont ajoutés au capital à la fin de chaque année).<br>1) Calculer la valeur acquise au bout de $' + n + '$ ans (arrondie au franc).<br>2) Calculer le montant total des intérêts.',
          questions: [
            { label: '$C_{' + n + '} \\approx$', type: 'number', reponse: Math.round(Cn), tol: 1, unite: 'F CFA' },
            { label: 'Intérêts :', type: 'number', reponse: Math.round(Cn) - C, tol: 1, unite: 'F CFA' }
          ],
          indices: ['Chaque année le capital est multiplié par $1 + \\dfrac{t}{100}$.', '$C_n = C_0 \\times \\left(1 + \\dfrac{t}{100}\\right)^n$.'],
          solution: [
            'Chaque année, le capital est multiplié par $' + T.num(q) + '$ : $(C_n)$ est une suite géométrique de raison $' + T.num(q) + '$.',
            '$C_{' + n + '} = ' + T.num(C) + ' \\times ' + T.num(q) + '^{' + n + '} \\approx ' + T.num(Math.round(Cn)) + '$ F CFA.',
            'Intérêts : $' + T.num(Math.round(Cn)) + ' - ' + T.num(C) + ' = ' + T.num(Math.round(Cn) - C) + '$ F CFA.'
          ]
        };
      }
      if (niveau === 2) {
        var cible = 100000 * rng.int(5, 50);
        var C0 = cible / Math.pow(q, n);
        return {
          enonce: 'Pour financer les études de sa fille dans $' + n + '$ ans, ' + nom + ' souhaite disposer de $' + T.num(cible) + '$ F CFA. Calculer la somme qu\'il doit placer aujourd\'hui à intérêts composés au taux annuel de $' + t + '\\,\\%$ (arrondir au franc).',
          questions: [{ label: '$C_0 \\approx$', type: 'number', reponse: Math.round(C0), tol: 1, unite: 'F CFA' }],
          indices: ['$C_n = C_0 \\times q^n$ avec $q = 1 + \\dfrac{t}{100}$.', 'Donc $C_0 = \\dfrac{C_n}{q^n}$.'],
          solution: [
            '$C_{' + n + '} = C_0 \\times ' + T.num(q) + '^{' + n + '}$, donc $C_0 = \\dfrac{' + T.num(cible) + '}{' + T.num(q) + '^{' + n + '}}$.',
            '$C_0 \\approx ' + T.num(Math.round(C0)) + '$ F CFA.'
          ]
        };
      }
      var Is = C * t * n / 100, Ic = Cn - C;
      return {
        enonce: 'Un capital de $' + T.num(C) + '$ F CFA est placé pendant $' + n + '$ ans au taux annuel de $' + t + '\\,\\%$.<br>Calculer les intérêts obtenus à intérêts simples et à intérêts composés (arrondis au franc), puis leur différence.',
        questions: [
          { label: 'Intérêts simples :', type: 'number', reponse: Is, tol: 1, unite: 'F CFA' },
          { label: 'Intérêts composés :', type: 'number', reponse: Math.round(Ic), tol: 1, unite: 'F CFA' },
          { label: 'Différence :', type: 'number', reponse: Math.round(Ic - Is), tol: 1, unite: 'F CFA' }
        ],
        indices: ['Simples : $I = C \\times \\dfrac{t}{100} \\times n$.', 'Composés : $I = C \\times q^n - C$.'],
        solution: [
          'Intérêts simples : $' + T.num(C) + ' \\times \\dfrac{' + t + '}{100} \\times ' + n + ' = ' + T.num(Is) + '$ F CFA.',
          'Intérêts composés : $' + T.num(C) + ' \\times ' + T.num(q) + '^{' + n + '} - ' + T.num(C) + ' \\approx ' + T.num(Math.round(Ic)) + '$ F CFA.',
          'Différence : environ $' + T.num(Math.round(Ic - Is)) + '$ F CFA en faveur des intérêts composés (les intérêts produisent eux-mêmes des intérêts).'
        ]
      };
    }
  });

  EM.gen.register({
    id: '1l-evolutions-successives',
    titre: 'Pourcentages : évolutions successives et réciproques',
    chapitres: ['1l-pourcentages', '2l-pourcentages'],
    niveaux: 2,
    examen: false,
    gen: function (rng, niveau) {
      var produit = rng.pick([['du sac de riz de 50 kg', 5000 * rng.int(3, 5)], ['du litre d\'huile', 100 * rng.int(9, 15)], ['du kilogramme de sucre', 50 * rng.int(12, 20)], ['du sac de ciment', 500 * rng.int(7, 10)]]);
      var P0 = produit[1];
      if (niveau === 1) {
        var a = rng.pick([5, 8, 10, 12, 15, 20, 25]), b = rng.pick([4, 5, 10, 15, 20]), sb = rng.sign();
        var c1 = 1 + a / 100, c2 = 1 + sb * b / 100, cg = rd(c1 * c2, 6), tg = rd((cg - 1) * 100, 4);
        var P2 = rd(P0 * cg, 4);
        return {
          enonce: 'Au marché, le prix ' + produit[0] + ' était de $' + T.num(P0) + '$ F CFA. Il a augmenté de $' + a + '\\,\\%$, puis ' + (sb > 0 ? 'augmenté' : 'baissé') + ' de $' + b + '\\,\\%$.<br>1) Calculer le nouveau prix.<br>2) Calculer le taux d\'évolution global (en %).',
          questions: [
            { label: 'Nouveau prix :', type: 'number', reponse: P2, tol: 0.5, unite: 'F CFA' },
            { label: 'Taux global :', type: 'number', reponse: tg, tol: 0.01, unite: '%' }
          ],
          indices: ['Coefficient multiplicateur d\'une hausse de $t\\,\\%$ : $1 + \\dfrac{t}{100}$ ; d\'une baisse : $1 - \\dfrac{t}{100}$.', 'Les coefficients successifs se multiplient (on n\'additionne pas les pourcentages).'],
          solution: [
            'Coefficients : $' + T.num(c1) + '$ puis $' + T.num(rd(c2, 4)) + '$. Coefficient global : $' + T.num(c1) + ' \\times ' + T.num(rd(c2, 4)) + ' = ' + T.num(cg) + '$.',
            'Nouveau prix : $' + T.num(P0) + ' \\times ' + T.num(cg) + ' = ' + T.num(P2) + '$ F CFA.',
            'Taux global : $(' + T.num(cg) + ' - 1) \\times 100 = ' + T.num(tg) + '\\,\\%$ (' + (tg >= 0 ? 'hausse' : 'baisse') + ').'
          ],
          aide: 'Pour un taux négatif (baisse), écris par exemple -6,5.'
        };
      }
      var h = rng.pick([10, 20, 25, 30, 40, 50, 60]);
      var rec = rd((1 / (1 + h / 100) - 1) * 100, 2);
      var k = rng.int(2, 5), a2 = rng.pick([2, 3, 4, 5, 10]);
      var cg2 = Math.pow(1 + a2 / 100, k), tg2 = rd((cg2 - 1) * 100, 2);
      return {
        enonce: '1) Le prix ' + produit[0] + ' a augmenté de $' + h + '\\,\\%$. Déterminer le taux d\'évolution qui le ramène au prix initial (arrondi à $0{,}01\\,\\%$ ; c\'est un taux négatif).<br>2) Un prix augmente de $' + a2 + '\\,\\%$ par an pendant $' + k + '$ ans. Calculer le taux d\'évolution global (arrondi à $0{,}01\\,\\%$).',
        questions: [
          { label: 'Taux réciproque :', type: 'number', reponse: rec, tol: 0.01, unite: '%' },
          { label: 'Taux global :', type: 'number', reponse: tg2, tol: 0.01, unite: '%' }
        ],
        indices: ['Le coefficient réciproque de $c$ est $\\dfrac{1}{c}$.', 'Pour $k$ hausses de $t\\,\\%$, le coefficient global est $\\left(1 + \\dfrac{t}{100}\\right)^k$.'],
        solution: [
          'Coefficient de la hausse : $' + T.num(1 + h / 100) + '$. Coefficient réciproque : $\\dfrac{1}{' + T.num(1 + h / 100) + '} \\approx ' + T.num(rd(1 / (1 + h / 100), 4)) + '$.',
          'Taux réciproque : $\\left(\\dfrac{1}{' + T.num(1 + h / 100) + '} - 1\\right) \\times 100 \\approx ' + T.num(rec) + '\\,\\%$ : il faut une baisse d\'environ $' + T.num(-rec) + '\\,\\%$ (et non de $' + h + '\\,\\%$).',
          'Coefficient global : $' + T.num(1 + a2 / 100) + '^{' + k + '} \\approx ' + T.num(rd(cg2, 4)) + '$, soit un taux global d\'environ $' + T.num(tg2) + '\\,\\%$ (plus que $' + k + ' \\times ' + a2 + ' = ' + (k * a2) + '\\,\\%$).'
        ],
        aide: 'Écris le taux en pourcentage, par exemple -16,67.'
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
