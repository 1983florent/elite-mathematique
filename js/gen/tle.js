/*
 * ELITE MATHÉMATIQUE — générateurs d'exercices des classes de Terminale (BAC).
 * Tle S1 et Tle S2 (chapitres ts-…, ts1-…) ; Tle L (chapitres tl-…).
 *
 * Chaque exercice est reproductible (graine), accompagné d'une correction détaillée
 * et vérifié automatiquement. Énoncés à l'infinitif ; indices et corrections tutoient l'élève.
 *
 * Contrôles internes : la fonction « controle » vérifie numériquement certaines réponses
 * (dérivée d'une primitive, équation différentielle, intégrale…). Elle ne fait rien en usage
 * normal ; elle n'enregistre les écarts que si le tableau global EM_VERIF_TLE existe
 * (script de vérification des développeurs).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, Frac = EM.Frac, ar = EM.ar;

  /* ================================================================== */
  /* Outils locaux                                                       */
  /* ================================================================== */
  var PINF = '$+\\infty$', MINF = '$-\\infty$', ZERO = '$0$';

  function fr(v) { return v instanceof Frac ? v : F(v); }
  function rd(x, d) { return ar.round(x, d == null ? 6 : d); }
  function rep(s, k) { var o = ''; for (var i = 0; i < k; i++) o += s; return o; }

  /** Rationnel écrit pour l'analyseur, toujours entre parenthèses : (3), (-3/4). */
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
  /** Valeur exacte d'un polynôme en un point. */
  function evalPoly(coefs, x) {
    var r = F(0), xf = fr(x);
    coefs.forEach(function (c) { r = r.mul(xf).add(fr(c)); });
    return r;
  }
  /** Monôme avec petite fraction (\frac) : pour les exposants. */
  function mono(c, v, first) {
    c = fr(c);
    if (c.d === 1) return T.mono(c, v, first);
    var neg = c.n < 0, s = '\\frac{' + Math.abs(c.n) + '}{' + c.d + '}' + v;
    return first ? (neg ? '-' : '') + s : (neg ? ' - ' : ' + ') + s;
  }
  /** e^{kx} en TeX */
  function eTex(k, v) { return 'e^{' + mono(k, v || 'x', true) + '}'; }
  /** a·e^k (k entier) : TeX et chaîne pour l'analyseur */
  function eVal(a, k) {
    a = fr(a);
    var base = k === 0 ? '' : k === 1 ? 'e' : 'e^{' + k + '}';
    var tex;
    if (k === 0) tex = T.num(a);
    else if (a.equals(1)) tex = base;
    else if (a.equals(-1)) tex = '-' + base;
    else tex = T.num(a) + base;
    return { tex: tex, s: k === 0 ? S(a) : S(a) + '*e^(' + k + ')' };
  }
  /** Produit (polynôme) × facteur : « (2x + 1)e^{x} », « 3x\,e^{x} », « -e^{x} ». */
  function prod(coefs, facteur) {
    var nz = coefs.filter(function (c) { return !fr(c).isZero(); }).length;
    var p = T.poly(coefs);
    if (nz === 0) return '0';
    if (nz >= 2) return '\\left(' + p + '\\right)' + facteur;
    if (p === '1') return facteur;
    if (p === '-1') return '-' + facteur;
    return p + (/[a-z}]$/.test(p) ? '\\,' : '') + facteur;
  }
  /** Terme « ± \frac{k}{den} » */
  function fracTerm(k, den, first) {
    k = fr(k);
    if (k.isZero()) return '';
    var body = k.d === 1 ? '\\frac{' + Math.abs(k.n) + '}{' + den + '}' : '\\frac{' + Math.abs(k.n) + '}{' + k.d + den + '}';
    if (first) return (k.n < 0 ? '-' : '') + body;
    return (k.n < 0 ? ' - ' : ' + ') + body;
  }
  /** Terme « ± \dfrac{k}{den} » (grand format) */
  function dfr(k, den, first) {
    k = fr(k);
    if (k.isZero()) return '';
    var dd = k.d === 1 ? den : k.d + (/[ +-]/.test(den) ? '(' + den + ')' : den);
    var body = '\\dfrac{' + Math.abs(k.n) + '}{' + dd + '}';
    if (first) return (k.n < 0 ? '-' : '') + body;
    return (k.n < 0 ? ' - ' : ' + ') + body;
  }
  /** Question à choix multiple : mélange, sans doublon. */
  function qcm(rng, label, bonne, autres) {
    var all = [bonne];
    autres.forEach(function (a) { if (all.indexOf(a) < 0) all.push(a); });
    var sh = rng.shuffle(all);
    return { label: label, type: 'choice', choix: sh, reponse: sh.indexOf(bonne) };
  }
  /** Combinaisons et arrangements */
  function C(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function A(n, k) { var r = 1; for (var i = 0; i < k; i++) r *= n - i; return r; }
  /** Nombre complexe a + bi en TeX (a, b rationnels) */
  function cTex(a, b) {
    a = fr(a); b = fr(b);
    if (b.isZero()) return T.num(a);
    return (a.isZero() ? '' : T.num(a)) + T.mono(b, 'i', a.isZero());
  }
  /** Couple / triplet de coordonnées en TeX */
  function pt() {
    var a = Array.prototype.slice.call(arguments);
    return '\\left(' + a.map(function (x) { return typeof x === 'string' ? x : T.num(x); }).join(' \\,;\\, ') + '\\right)';
  }
  /** t·π en TeX (t rationnel) */
  function angTex(t) {
    t = fr(t);
    if (t.isZero()) return '0';
    var s = t.n < 0 ? '-' : '', n = Math.abs(t.n);
    var top = (n === 1 ? '' : n) + '\\pi';
    return s + (t.d === 1 ? top : '\\dfrac{' + top + '}{' + t.d + '}');
  }
  /** t·π pour l'analyseur */
  function angS(t) { t = fr(t); return t.isZero() ? '0' : t.n + '*pi/' + t.d; }
  /** Ramène t·π dans ]-π ; π] */
  function angRed(t) {
    t = fr(t);
    while (t.cmp(1) > 0) t = t.sub(2);
    while (t.cmp(-1) <= 0) t = t.add(2);
    return t;
  }
  /** m·√s (m rationnel, s sans facteur carré) : TeX et chaîne */
  function radTex(m, s) {
    m = fr(m);
    if (m.isZero()) return '0';
    if (s === 1) return m.tex();
    var sg = m.n < 0 ? '-' : '', n = Math.abs(m.n);
    var top = (n === 1 ? '' : n) + '\\sqrt{' + s + '}';
    return sg + (m.d === 1 ? top : '\\dfrac{' + top + '}{' + m.d + '}');
  }
  function radS(m, s) { m = fr(m); return s === 1 ? S(m) : S(m) + '*sqrt(' + s + ')'; }
  /** √N simplifiée : {m, s} */
  function racine(N) { var q = ar.sqrtSimplify(N); return { m: F(q.a), s: q.b }; }
  /** Système en TeX */
  function sysTex(lines) {
    return '\\left\\{\\begin{array}{l}' + lines.join(' \\\\ ') + '\\end{array}\\right.';
  }
  /** Tableau (lignes de cellules TeX) */
  function tabTex(lignes) {
    var k = lignes[0].length;
    var spec = '|c|' + rep('c|', k - 1);
    return '$$\\begin{array}{' + spec + '}\\hline ' + lignes.map(function (l) { return l.join(' & '); }).join(' \\\\ \\hline ') + ' \\\\ \\hline\\end{array}$$';
  }
  function lim(b) { return '\\lim\\limits_{x \\to ' + b + '}'; }
  /** Intégrande entre parenthèses s'il commence par un signe moins */
  function ig(t) { return t.charAt(0) === '-' ? '\\left(' + t + '\\right)' : t; }
  /** Coefficient rationnel devant un facteur : « », « - », « \dfrac{3}{2} » */
  function coefTex(c) { c = fr(c); return c.equals(1) ? '' : c.equals(-1) ? '-' : c.tex(); }
  /** k·v sans écrire le coefficient 1 */
  function kv(k, v) { return k === 1 ? v : k === -1 ? '-' + v : k + v; }
  /** « + terme » ou « - reste » selon le signe en tête du terme */
  function plus(t) { return t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t; }

  /* ---------- contrôles numériques (inactifs en usage normal) ---------- */
  function controle(ok, msg) {
    if (!ok && Array.isArray(root.EM_VERIF_TLE)) root.EM_VERIF_TLE.push(msg);
  }
  function verifActive() { return Array.isArray(root.EM_VERIF_TLE); }
  function fn(str, v) { return EM.parser.compile(str, v || 'x'); }
  function val(str) { return EM.parser.evalNum(str); }
  function proche(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b)); }
  /** F' = f sur [a ; b] (dérivée numérique) */
  function deriveOK(Fs, fs, a, b, v) {
    if (!verifActive()) return true;
    var Fc = fn(Fs, v), fc = fn(fs, v);
    for (var i = 0; i < 9; i++) {
      var x = a + (b - a) * (i + 0.5) / 9, h = 1e-5;
      var d = (Fc(x + h) - Fc(x - h)) / (2 * h);
      if (!proche(d, fc(x), 1e-4)) return false;
    }
    return true;
  }
  function simpson(f, a, b) {
    var n = 2000, h = (b - a) / n, s = f(a) + f(b);
    for (var i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }

  var AIDE_EXACT = 'Donne la valeur exacte : tu peux écrire ln(2), e^2, sqrt(3), pi/4, (e-1)/2…';
  var AIDE_TUPLE = 'Écris les valeurs entre parenthèses, séparées par « ; », par exemple (3 ; -2).';
  var AIDE_CPLX = 'Écris la partie réelle puis la partie imaginaire : par exemple (3 ; -2) pour 3 - 2i.';
  var AIDE_INT = 'Écris un intervalle comme ]0 ; ln(3)], [e^2 ; +inf[ ou ]-inf ; 1/2[.';

  var FILLES = ['Awa', 'Fatou', 'Aminata', 'Khady', 'Ndèye', 'Mariama', 'Coumba', 'Astou', 'Bineta', 'Seynabou'];
  var PRENOMS = ['Awa', 'Moussa', 'Fatou', 'Mamadou', 'Aminata', 'Ousmane', 'Khady', 'Ibrahima', 'Ndèye', 'Cheikh', 'Mariama', 'Abdou', 'Coumba', 'Babacar', 'Astou', 'Modou'];

  /* ================================================================== */
  /* Limites                                                             */
  /* ================================================================== */

  function limInfini(rng) {
    var cas = rng.pick(['egal', 'inf', 'sup', 'poly']);
    var plus = rng.bool();
    var borne = plus ? '+\\infty' : '-\\infty';
    var a = rng.nz(-5, 5), d = rng.nz(-4, 4);
    var r = F(a, d);
    var fTex, sol = [], signe, val0 = null;
    var intro = 'En $' + borne + '$, une fonction rationnelle a la même limite que le quotient de ses termes de plus haut degré.';
    if (cas === 'egal') {
      fTex = '\\dfrac{' + T.poly([a, rng.int(-6, 6), rng.int(-9, 9)]) + '}{' + T.poly([d, rng.int(-6, 6), rng.nz(-9, 9)]) + '}';
      val0 = r;
      sol.push(intro);
      sol.push('$' + lim(borne) + ' f(x) = ' + lim(borne) + ' \\dfrac{' + T.mono(a, 'x^2', true) + '}{' + T.mono(d, 'x^2', true) + '} = ' + r.tex() + '$.');
    } else if (cas === 'inf') {
      fTex = '\\dfrac{' + T.poly([a, rng.nz(-6, 6)]) + '}{' + T.poly([d, rng.int(-6, 6), rng.nz(-9, 9)]) + '}';
      val0 = F(0);
      sol.push(intro);
      sol.push('$\\dfrac{' + T.mono(a, 'x', true) + '}{' + T.mono(d, 'x^2', true) + '} = \\dfrac{' + T.num(a) + '}{' + T.mono(d, 'x', true) + '}$ et le dénominateur tend vers l\'infini, donc $' + lim(borne) + ' f(x) = 0$.');
    } else if (cas === 'sup') {
      fTex = '\\dfrac{' + T.poly([a, rng.int(-6, 6), rng.int(-9, 9)]) + '}{' + T.poly([d, rng.nz(-6, 6)]) + '}';
      signe = r.sign() * (plus ? 1 : -1);
      sol.push(intro);
      sol.push('$\\dfrac{' + T.mono(a, 'x^2', true) + '}{' + T.mono(d, 'x', true) + '} = ' + T.mono(r, 'x', true) + '$ et $' + lim(borne) + ' ' + T.mono(r, 'x', true) + ' = ' + (signe > 0 ? '+' : '-') + '\\infty$ (le coefficient $' + r.tex() + '$ est ' + (r.sign() > 0 ? 'positif' : 'négatif') + ').');
    } else {
      var b = rng.int(-6, 6), c = rng.int(-9, 9);
      fTex = T.poly([a, b, 0, c]);
      signe = (a > 0 ? 1 : -1) * (plus ? 1 : -1);
      sol.push('En $' + borne + '$, une fonction polynôme a la même limite que son terme de plus haut degré.');
      sol.push('$' + lim(borne) + ' f(x) = ' + lim(borne) + ' ' + T.mono(a, 'x^3', true) + ' = ' + (signe > 0 ? '+' : '-') + '\\infty$ car $' + lim(borne) + ' x^3 = ' + borne + '$ et $' + T.num(a) + (a > 0 ? ' > 0' : ' < 0') + '$.');
    }
    var bonne = val0 ? '$' + val0.tex() + '$' : (signe > 0 ? PINF : MINF);
    var ex = '$' + (cas === 'poly' ? T.num(a) : r.tex()) + '$';
    return {
      enonce: 'Soit $f$ la fonction définie par $f(x) = ' + fTex + '$. Calculer la limite de $f$ en $' + borne + '$.',
      questions: [qcm(rng, '$' + lim(borne) + ' f(x) =$', bonne, [PINF, MINF, ZERO, ex, '$1$'].slice(0, 5))],
      indices: [
        'En $\\pm\\infty$, garde seulement les termes de plus haut degré.',
        'Simplifie le quotient obtenu, puis regarde le signe du coefficient restant.'
      ],
      solution: sol
    };
  }

  function limFacto(rng) {
    var r = rng.nz(-4, 4), p = rng.pick([1, 1, 2, -1, 3]), q;
    do { q = rng.nz(-5, 5); } while (p * r + q === 0);
    var N = [p, q - p * r, -q * r];
    var avecT = rng.bool(0.6), t = null, D, L;
    if (avecT) {
      do { t = rng.int(-4, 4); } while (t === r);
      D = [1, -(r + t), r * t];
      L = F(p * r + q, r - t);
    } else { D = [1, -r]; L = F(p * r + q); }
    var lin = T.poly([p, q]);
    var sol = [
      'En remplaçant $x$ par $' + T.num(r) + '$, le numérateur et le dénominateur valent $0$ : c\'est la forme indéterminée « $\\dfrac{0}{0}$ ». On factorise par $' + T.xMinus(r) + '$.',
      '$' + T.poly(N) + ' = ' + T.xMinus(r) + '\\left(' + lin + '\\right)$' + (avecT ? ' et $' + T.poly(D) + ' = ' + T.xMinus(r) + T.xMinus(t) + '$.' : '.')
    ];
    if (avecT) {
      sol.push('Pour $x \\neq ' + T.num(r) + '$ : $f(x) = \\dfrac{' + lin + '}{' + T.poly([1, -t]) + '}$.');
      sol.push('Donc $' + lim(T.num(r)) + ' f(x) = \\dfrac{' + T.num(p * r + q) + '}{' + T.num(r - t) + '} = ' + L.tex() + '$.');
    } else {
      sol.push('Pour $x \\neq ' + T.num(r) + '$ : $f(x) = ' + lin + '$.');
      sol.push('Donc $' + lim(T.num(r)) + ' f(x) = ' + T.num(p * r + q) + '$.');
    }
    return {
      enonce: 'Calculer $' + lim(T.num(r)) + ' \\dfrac{' + T.poly(N) + '}{' + T.poly(D) + '}$.',
      questions: [{ label: 'Limite :', type: 'number', reponse: L }],
      indices: [
        'Remplace $x$ par $' + T.num(r) + '$ : tu obtiens « $\\dfrac{0}{0}$ ».',
        'Le numérateur et le dénominateur sont divisibles par $' + T.xMinus(r) + '$ : factorise puis simplifie.'
      ],
      solution: sol
    };
  }

  function limConjugue(rng) {
    if (rng.bool()) {
      var c = rng.int(1, 4), a = rng.intExcept(-3, 6, [0]);
      var b = c * c - a;
      var rad = b === 0 ? '\\sqrt{x}' : '\\sqrt{' + T.poly([1, b]) + '}';
      var xa = T.poly([1, -a]);
      return {
        enonce: 'Calculer $' + lim(T.num(a)) + ' \\dfrac{' + rad + ' - ' + c + '}{' + xa + '}$.',
        questions: [{ label: 'Limite :', type: 'number', reponse: F(1, 2 * c) }],
        indices: ['Multiplie le numérateur et le dénominateur par la quantité conjuguée $' + rad + ' + ' + c + '$.', 'Utilise $(\\sqrt{A} - B)(\\sqrt{A} + B) = A - B^2$.'],
        solution: [
          'En $x = ' + T.num(a) + '$, le numérateur vaut $\\sqrt{' + (c * c) + '} - ' + c + ' = 0$ et le dénominateur aussi : forme indéterminée « $\\dfrac{0}{0}$ ».',
          'On multiplie par la quantité conjuguée : $$\\dfrac{' + rad + ' - ' + c + '}{' + xa + '} = \\dfrac{' + (b === 0 ? 'x' : '(' + T.poly([1, b]) + ')') + ' - ' + (c * c) + '}{(' + xa + ')(' + rad + ' + ' + c + ')} = \\dfrac{' + xa + '}{(' + xa + ')(' + rad + ' + ' + c + ')} = \\dfrac{1}{' + rad + ' + ' + c + '}.$$',
          'Donc la limite vaut $\\dfrac{1}{\\sqrt{' + (c * c) + '} + ' + c + '} = ' + F(1, 2 * c).tex() + '$.'
        ]
      };
    }
    var bb = rng.nz(-6, 6), cc = rng.int(-5, 5);
    var trin = T.poly([1, bb, cc]);
    var num = T.poly([bb, cc]);
    return {
      enonce: 'Calculer $' + lim('+\\infty') + ' \\left(\\sqrt{' + trin + '} - x\\right)$.',
      questions: [{ label: 'Limite :', type: 'number', reponse: F(bb, 2) }],
      indices: ['C\'est une forme « $+\\infty - \\infty$ » : multiplie et divise par $\\sqrt{' + trin + '} + x$.', 'Factorise ensuite par $x$ au numérateur et au dénominateur.'],
      solution: [
        'C\'est une forme indéterminée « $+\\infty - \\infty$ ». On utilise la quantité conjuguée :',
        '$$\\sqrt{' + trin + '} - x = \\dfrac{(' + trin + ') - x^2}{\\sqrt{' + trin + '} + x} = \\dfrac{' + num + '}{\\sqrt{' + trin + '} + x}.$$',
        'Pour $x > 0$, on factorise par $x$ : $$\\dfrac{' + num + '}{\\sqrt{' + trin + '} + x} = \\dfrac{' + T.num(bb) + fracTerm(cc, 'x') + '}{\\sqrt{1' + fracTerm(bb, 'x') + fracTerm(cc, 'x^2') + '} + 1}.$$',
        'Quand $x \\to +\\infty$, cette expression tend vers $\\dfrac{' + T.num(bb) + '}{1 + 1} = ' + F(bb, 2).tex() + '$.'
      ]
    };
  }

  EM.gen.register({
    id: 'ts-limites-fi',
    titre: 'Calculer une limite (forme indéterminée)',
    chapitres: ['ts-limites', 'tl-fonctions'],
    niveaux: 3,
    gen: function (rng, niveau) {
      if (niveau === 1) return limInfini(rng);
      if (niveau === 2) return limFacto(rng);
      return limConjugue(rng);
    }
  });

  /* ---------- croissances comparées ---------- */
  function xpow(n) { return n === 1 ? 'x' : 'x^{' + n + '}'; }
  var CC = [
    function (rng) {
      var a = rng.nz(-4, 4), n = rng.int(1, 3);
      return { b: '+\\infty', f: '\\dfrac{' + T.mono(a, '\\ln x', true) + '}{' + xpow(n) + '}', res: 0, autre: a,
        sol: ['Par croissance comparée : $' + lim('+\\infty') + ' \\dfrac{\\ln x}{' + xpow(n) + '} = 0$ (la puissance de $x$ l\'emporte sur le logarithme).',
          'Multiplier par la constante $' + T.num(a) + '$ ne change pas une limite nulle : la limite vaut $0$.'] };
    },
    function (rng) {
      var a = rng.nz(-4, 4), n = rng.int(1, 3);
      return { b: '0^+', f: T.mono(a, xpow(n) + '\\ln x', true), res: 0, autre: a,
        sol: ['C\'est une forme « $0 \\times \\infty$ ». Par croissance comparée : $' + lim('0^+') + ' ' + xpow(n) + '\\ln x = 0$.',
          'Donc la limite vaut $' + T.num(a) + ' \\times 0 = 0$.'] };
    },
    function (rng) {
      var a = rng.nz(-4, 4), n = rng.int(1, 3);
      return { b: '+\\infty', f: '\\dfrac{' + T.mono(a, 'e^{x}', true) + '}{' + xpow(n) + '}', res: a > 0 ? 'p' : 'm', autre: a,
        sol: ['Par croissance comparée : $' + lim('+\\infty') + ' \\dfrac{e^{x}}{' + xpow(n) + '} = +\\infty$ (l\'exponentielle l\'emporte sur les puissances de $x$).',
          'Comme $' + T.num(a) + (a > 0 ? ' > 0' : ' < 0') + '$, la limite vaut $' + (a > 0 ? '+' : '-') + '\\infty$.'] };
    },
    function (rng) {
      var a = rng.nz(-4, 4), n = rng.int(1, 3);
      return { b: '-\\infty', f: T.mono(a, xpow(n) + 'e^{x}', true), res: 0, autre: a,
        sol: ['C\'est une forme « $\\infty \\times 0$ ». Par croissance comparée : $' + lim('-\\infty') + ' ' + xpow(n) + 'e^{x} = 0$.',
          'Donc la limite vaut $0$.'] };
    },
    function (rng) {
      var a = rng.nz(-4, 4), n = rng.int(1, 3);
      return { b: '+\\infty', f: T.mono(a, xpow(n) + 'e^{-x}', true), res: 0, autre: a,
        sol: ['On écrit $' + xpow(n) + 'e^{-x} = \\dfrac{' + xpow(n) + '}{e^{x}}$ et, par croissance comparée, $' + lim('+\\infty') + ' \\dfrac{e^{x}}{' + xpow(n) + '} = +\\infty$.',
          'Donc $' + lim('+\\infty') + ' \\dfrac{' + xpow(n) + '}{e^{x}} = 0$ et la limite cherchée vaut $0$.'] };
    }
  ];
  var CC2 = [
    function (rng) {
      var a = rng.int(1, 5);
      return { b: '+\\infty', f: 'x - ' + T.mono(a, '\\ln x', true), res: 'p', autre: a,
        sol: ['C\'est une forme « $+\\infty - \\infty$ ». On factorise par $x$ : $x - ' + T.mono(a, '\\ln x', true) + ' = x\\left(1 - ' + T.mono(a, '\\dfrac{\\ln x}{x}', true) + '\\right)$.',
          'Or $' + lim('+\\infty') + ' \\dfrac{\\ln x}{x} = 0$, donc la parenthèse tend vers $1$ et la limite vaut $+\\infty$.'] };
    },
    function (rng) {
      var a = rng.int(1, 5), n = rng.int(1, 3);
      return { b: '+\\infty', f: 'e^{x} - ' + T.mono(a, xpow(n), true), res: 'p', autre: a,
        sol: ['C\'est une forme « $+\\infty - \\infty$ ». On factorise par $e^{x}$ : $e^{x} - ' + T.mono(a, xpow(n), true) + ' = e^{x}\\left(1 - ' + T.mono(a, '\\dfrac{' + xpow(n) + '}{e^{x}}', true) + '\\right)$.',
          'Or $' + lim('+\\infty') + ' \\dfrac{' + xpow(n) + '}{e^{x}} = 0$, donc la parenthèse tend vers $1$ et la limite vaut $+\\infty$.'] };
    },
    function (rng) {
      var k = rng.pick([2, 3, -1, -2, 4, 5]);
      return { b: '0', f: '\\dfrac{' + eTex(k) + ' - 1}{x}', res: F(k), autre: 1,
        sol: ['On reconnaît un taux d\'accroissement : avec $g(x) = ' + eTex(k) + '$, $\\dfrac{' + eTex(k) + ' - 1}{x} = \\dfrac{g(x) - g(0)}{x - 0}$.',
          'Sa limite en $0$ est $g\'(0) = ' + T.mono(k, 'e^{0}', true) + ' = ' + T.num(k) + '$.'] };
    },
    function (rng) {
      var k = rng.pick([2, 3, -1, -2, 4]);
      return { b: '0', f: '\\dfrac{\\ln(1' + T.mono(k, 'x', false) + ')}{x}', res: F(k), autre: 1,
        sol: ['Avec $g(x) = \\ln(1' + T.mono(k, 'x', false) + ')$, on a $g(0) = 0$ et $\\dfrac{g(x) - g(0)}{x - 0}$ tend vers $g\'(0)$.',
          '$g\'(x) = \\dfrac{' + T.num(k) + '}{1' + T.mono(k, 'x', false) + '}$, donc la limite vaut $g\'(0) = ' + T.num(k) + '$.'] };
    },
    function (rng) {
      var a = rng.nz(-4, 4);
      return { b: '0^+', f: '\\dfrac{' + T.num(a) + ' + \\ln x}{x}', res: 'm', autre: a,
        sol: ['Ce n\'est pas une forme indéterminée : $' + lim('0^+') + ' (' + T.num(a) + ' + \\ln x) = -\\infty$ et $' + lim('0^+') + ' \\dfrac{1}{x} = +\\infty$.',
          'Par produit, la limite vaut $-\\infty$.'] };
    },
    function (rng) {
      var k = rng.pick([2, 3, 4, 5]);
      return { b: '+\\infty', f: 'x\\ln\\left(1 + \\dfrac{' + k + '}{x}\\right)', res: F(k), autre: 1,
        sol: ['On pose $X = \\dfrac{' + k + '}{x}$ : quand $x \\to +\\infty$, $X \\to 0$ et $x = \\dfrac{' + k + '}{X}$.',
          '$x\\ln\\left(1 + \\dfrac{' + k + '}{x}\\right) = ' + k + ' \\times \\dfrac{\\ln(1 + X)}{X}$ et $\\lim\\limits_{X \\to 0} \\dfrac{\\ln(1+X)}{X} = 1$, donc la limite vaut $' + k + '$.'] };
    },
    function (rng) {
      var a = rng.int(1, 4);
      return { b: '+\\infty', f: '\\ln x - ' + T.mono(a, 'x', true), res: 'm', autre: a,
        sol: ['Forme « $+\\infty - \\infty$ ». On factorise par $x$ : $\\ln x - ' + T.mono(a, 'x', true) + ' = x\\left(\\dfrac{\\ln x}{x} - ' + a + '\\right)$.',
          'La parenthèse tend vers $-' + a + '$ et $x \\to +\\infty$, donc la limite vaut $-\\infty$.'] };
    }
  ];

  EM.gen.register({
    id: 'ts-croissances-comparees',
    titre: 'Limites avec ln et exp : croissances comparées',
    chapitres: ['ts-limites', 'ts-logarithme', 'ts-exponentielle'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var t = rng.pick(niveau === 1 ? CC : CC2)(rng);
      if (/ [+-] /.test(t.f) && t.f.indexOf('\\dfrac') !== 0) t.f = '\\left(' + t.f + '\\right)';
      var bonne = t.res === 'p' ? PINF : t.res === 'm' ? MINF : '$' + T.num(fr(t.res)) + '$';
      var autres = [PINF, MINF, ZERO, '$' + T.num(t.autre) + '$', '$1$'];
      return {
        enonce: 'Calculer $' + lim(t.b) + ' ' + t.f + '$.',
        questions: [qcm(rng, '$' + lim(t.b) + ' ' + t.f + ' =$', bonne, autres)],
        indices: [
          'Repère d\'abord s\'il s\'agit d\'une forme indéterminée.',
          'Limites de référence : $\\dfrac{\\ln x}{x} \\to 0$ et $\\dfrac{e^x}{x} \\to +\\infty$ en $+\\infty$ ; $x\\ln x \\to 0$ en $0^+$ ; $xe^x \\to 0$ en $-\\infty$.'
        ],
        solution: t.sol
      };
    }
  });

  /* ---------- asymptotes d'une fonction rationnelle ---------- */
  EM.gen.register({
    id: 'ts-asymptotes',
    titre: 'Asymptotes verticale et oblique',
    chapitres: ['ts-limites', 'ts-derivabilite', 'tl-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([1, 1, 2, -1, -2, 3]), d = rng.nz(-4, 4), b = rng.int(-5, 5), c = rng.nz(-6, 6);
      var N = [a, b - a * d, c - b * d];
      var xd = T.poly([1, -d]);
      var fTex = '\\dfrac{' + T.poly(N) + '}{' + xd + '}';
      var asy = T.poly([a, b]);
      var qs = [
        { label: '$(a \\,;\\, b \\,;\\, c) =$', type: 'tuple', reponse: [a, b, c] },
        { label: 'Asymptote verticale : $x =$', type: 'number', reponse: d },
        { label: 'Asymptote oblique $(\\Delta)$ : $y =$', type: 'expr', reponse: polyS([a, b]), reponseTex: asy }
      ];
      var sol = [
        'Pour $x \\neq ' + d + '$ : $ax + b + \\dfrac{c}{' + xd + '} = \\dfrac{(ax + b)(' + xd + ') + c}{' + xd + '} = \\dfrac{ax^2 + ' + (d > 0 ? '(b - ' + kv(d, 'a') + ')' : '(b + ' + kv(-d, 'a') + ')') + 'x + ' + (d > 0 ? '(c - ' + kv(d, 'b') + ')' : '(c + ' + kv(-d, 'b') + ')') + '}{' + xd + '}$.',
        'Par identification avec $' + T.poly(N) + '$ : $a = ' + a + '$, puis $b = ' + T.num(N[1]) + T.signed(a * d) + ' = ' + b + '$, puis $c = ' + T.num(N[2]) + T.signed(b * d) + ' = ' + c + '$.',
        'Donc $f(x) = ' + asy + dfr(c, xd) + '$.',
        'Quand $x \\to ' + d + '$, $\\dfrac{' + c + '}{' + xd + '}$ tend vers l\'infini : la droite d\'équation $x = ' + d + '$ est asymptote verticale.',
        '$f(x) - (' + asy + ') = \\dfrac{' + c + '}{' + xd + '}$ tend vers $0$ en $\\pm\\infty$ : la droite $(\\Delta) : y = ' + asy + '$ est asymptote oblique.'
      ];
      if (niveau === 2) {
        var dessus = c > 0;
        qs.push(qcm(rng, 'Sur $]' + d + ' \\,;\\, +\\infty[$, la courbe de $f$ est :', 'au-dessus de $(\\Delta)$', ['en dessous de $(\\Delta)$']));
        if (!dessus) qs[3] = qcm(rng, 'Sur $]' + d + ' \\,;\\, +\\infty[$, la courbe de $f$ est :', 'en dessous de $(\\Delta)$', ['au-dessus de $(\\Delta)$']);
        sol.push('Position : pour $x > ' + d + '$, $' + xd + ' > 0$ donc $f(x) - (' + asy + ')$ est du signe de $' + c + '$ : la courbe est ' + (dessus ? 'au-dessus' : 'en dessous') + ' de $(\\Delta)$ sur $]' + d + ' \\,;\\, +\\infty[$.');
      }
      return {
        enonce: 'Soit $f$ la fonction définie sur $\\R \\setminus \\{' + d + '\\}$ par $f(x) = ' + fTex + '$.<br>' +
          'Déterminer les réels $a$, $b$ et $c$ tels que $f(x) = ax + b + \\dfrac{c}{' + xd + '}$, puis en déduire les asymptotes à la courbe de $f$.' +
          (niveau === 2 ? ' Préciser la position de la courbe par rapport à l\'asymptote oblique sur $]' + d + ' \\,;\\, +\\infty[$.' : ''),
        questions: qs,
        indices: [
          'Réduis $ax + b + \\dfrac{c}{' + xd + '}$ au même dénominateur, puis identifie les coefficients.',
          'Une asymptote oblique $y = ax + b$ vérifie $\\lim [f(x) - (ax + b)] = 0$ en $\\pm\\infty$.'
        ],
        solution: sol,
        aide: AIDE_TUPLE
      };
    }
  });

  /* ================================================================== */
  /* Dérivation                                                          */
  /* ================================================================== */
  var DER = {
    1: [
      function (rng) {
        var a = rng.nz(-3, 3), b = rng.int(-4, 4);
        return { f: prod([a, b], 'e^{x}'), fs: polyS([a, b]) + '*e^x', d: prod([a, a + b], 'e^{x}'), ds: polyS([a, a + b]) + '*e^x', D: '\\R',
          sol: ['$f = uv$ avec $u(x) = ' + T.poly([a, b]) + '$ et $v(x) = e^{x}$ : $f\' = u\'v + uv\'$.',
            '$f\'(x) = ' + T.mono(a, 'e^{x}', true) + plus(prod([a, b], 'e^{x}')) + ' = ' + prod([a, a + b], 'e^{x}') + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3), b = rng.int(-5, 5), c = rng.nz(-4, 4);
        return { f: T.poly([a, b]) + T.mono(c, '\\ln x', false), fs: polyS([a, b]) + '+' + S(c) + '*ln(x)', d: '\\dfrac{' + T.poly([a, c]) + '}{x}', ds: polyS([a, c]) + '/x', D: ']0 \\,;\\, +\\infty[',
          sol: ['$(\\ln x)\' = \\dfrac{1}{x}$, donc $f\'(x) = ' + T.num(a) + ' + \\dfrac{' + T.num(c) + '}{x}$.',
            'Au même dénominateur : $f\'(x) = \\dfrac{' + T.poly([a, c]) + '}{x}$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3), k = rng.pick([2, 3, -1, -2]), b = rng.nz(-5, 5);
        return { f: T.mono(a, eTex(k), true) + T.mono(b, 'x', false), fs: S(a) + '*e^(' + S(k) + '*x)+' + S(b) + '*x', d: T.mono(a * k, eTex(k), true) + T.signed(b), ds: S(a * k) + '*e^(' + S(k) + '*x)+' + S(b), D: '\\R',
          sol: ['$(e^{u})\' = u\'e^{u}$ : la dérivée de $' + eTex(k) + '$ est $' + T.mono(k, eTex(k), true) + '$.',
            '$f\'(x) = ' + T.num(a) + ' \\times ' + T.par(k) + eTex(k) + T.signed(b) + ' = ' + T.mono(a * k, eTex(k), true) + T.signed(b) + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3);
        return { f: T.mono(a, 'x\\ln x', true), fs: S(a) + '*x*ln(x)', d: a === 1 ? '\\ln x + 1' : T.num(a) + '(\\ln x + 1)', ds: S(a) + '*(ln(x)+1)', D: ']0 \\,;\\, +\\infty[',
          sol: ['$(x\\ln x)\' = 1 \\times \\ln x + x \\times \\dfrac{1}{x} = \\ln x + 1$.',
            'Donc $f\'(x) = ' + (a === 1 ? '\\ln x + 1' : T.num(a) + '(\\ln x + 1)') + '$.'] };
      }
    ],
    2: [
      function (rng) {
        var a = rng.nz(-3, 3), b = rng.int(-4, 4), k = rng.pick([-1, 2, -2, 3]);
        var dc = [a * k, a + b * k];
        return { f: prod([a, b], eTex(k)), fs: polyS([a, b]) + '*e^(' + S(k) + '*x)', d: prod(dc, eTex(k)), ds: polyS(dc) + '*e^(' + S(k) + '*x)', D: '\\R',
          sol: ['$f = uv$ avec $u(x) = ' + T.poly([a, b]) + '$, $u\'(x) = ' + a + '$, $v(x) = ' + eTex(k) + '$, $v\'(x) = ' + T.mono(k, eTex(k), true) + '$.',
            '$f\'(x) = ' + T.mono(a, eTex(k), true) + plus(kv(k, '\\left(' + T.poly([a, b]) + '\\right)') + eTex(k)) + ' = ' + prod(dc, eTex(k)) + '$.'] };
      },
      function (rng) {
        var a = rng.int(1, 3), b = rng.int(1, 5);
        var lin = T.poly([a, b]);
        return { f: '\\ln(' + lin + ')', fs: 'ln(' + polyS([a, b]) + ')', d: '\\dfrac{' + a + '}{' + lin + '}', ds: S(a) + '/' + polyS([a, b]), D: ']' + F(-b, a).tex() + ' \\,;\\, +\\infty[',
          sol: ['$(\\ln u)\' = \\dfrac{u\'}{u}$ avec $u(x) = ' + lin + '$ et $u\'(x) = ' + a + '$.',
            'Donc $f\'(x) = \\dfrac{' + a + '}{' + lin + '}$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3);
        var num = a === 1 ? '\\ln x' : a === -1 ? '-\\ln x' : a + '\\ln x';
        var dnum = a === 1 ? '1 - \\ln x' : a === -1 ? '\\ln x - 1' : a + '(1 - \\ln x)';
        return { f: '\\dfrac{' + num + '}{x}', fs: S(a) + '*ln(x)/x', d: '\\dfrac{' + dnum + '}{x^2}', ds: S(a) + '*(1-ln(x))/x^2', D: ']0 \\,;\\, +\\infty[',
          sol: ['$\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ avec $u(x) = ' + num + '$, $u\'(x) = \\dfrac{' + a + '}{x}$, $v(x) = x$.',
            '$f\'(x) = \\dfrac{\\frac{' + a + '}{x} \\times x - ' + (a < 0 ? '(' + num + ')' : num) + '}{x^2} = \\dfrac{' + dnum + '}{x^2}$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3);
        return { f: T.mono(a, 'x^2\\ln x', true), fs: S(a) + '*x^2*ln(x)', d: T.mono(a, 'x(2\\ln x + 1)', true), ds: S(a) + '*x*(2*ln(x)+1)', D: ']0 \\,;\\, +\\infty[',
          sol: ['$(x^2\\ln x)\' = 2x\\ln x + x^2 \\times \\dfrac{1}{x} = 2x\\ln x + x = x(2\\ln x + 1)$.',
            'Donc $f\'(x) = ' + T.mono(a, 'x(2\\ln x + 1)', true) + '$.'] };
      }
    ],
    3: [
      function (rng) {
        var p = rng.int(1, 9);
        return { f: '\\ln(x^2 + ' + p + ')', fs: 'ln(x^2+' + p + ')', d: '\\dfrac{2x}{x^2 + ' + p + '}', ds: '2*x/(x^2+' + p + ')', D: '\\R',
          sol: ['$x^2 + ' + p + ' > 0$ pour tout réel $x$. $(\\ln u)\' = \\dfrac{u\'}{u}$ avec $u(x) = x^2 + ' + p + '$.',
            'Donc $f\'(x) = \\dfrac{2x}{x^2 + ' + p + '}$.'] };
      },
      function (rng) {
        var p = rng.int(1, 3);
        var dnum = p === 1 ? 'x' : 'x + ' + (p - 1);
        return { f: '\\dfrac{e^{x}}{x + ' + p + '}', fs: 'e^x/(x+' + p + ')', d: '\\dfrac{' + (p === 1 ? 'xe^{x}' : '(' + dnum + ')e^{x}') + '}{(x + ' + p + ')^2}', ds: '(' + dnum + ')*e^x/(x+' + p + ')^2', D: '\\R \\setminus \\{' + (-p) + '\\}',
          sol: ['$\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ avec $u(x) = e^{x}$ et $v(x) = x + ' + p + '$.',
            '$f\'(x) = \\dfrac{e^{x}(x + ' + p + ') - e^{x}}{(x + ' + p + ')^2} = \\dfrac{' + (p === 1 ? 'xe^{x}' : '(' + dnum + ')e^{x}') + '}{(x + ' + p + ')^2}$.'] };
      },
      function (rng) {
        var a = rng.int(-4, 4);
        var num = a === 0 ? '2\\ln x' : '2\\ln x' + T.signed(a);
        return { f: '(\\ln x)^2' + T.mono(a, '\\ln x', false), fs: 'ln(x)^2+' + S(a) + '*ln(x)', d: '\\dfrac{' + num + '}{x}', ds: '(2*ln(x)+' + S(a) + ')/x', D: ']0 \\,;\\, +\\infty[',
          sol: ['$(u^2)\' = 2u\'u$ avec $u = \\ln x$ : $\\left((\\ln x)^2\\right)\' = \\dfrac{2\\ln x}{x}$.',
            'Donc $f\'(x) = \\dfrac{2\\ln x}{x}' + fracTerm(a, 'x') + ' = \\dfrac{' + num + '}{x}$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3);
        return { f: T.mono(a, 'xe^{-x^2}', true), fs: S(a) + '*x*e^(-x^2)', d: (a === 1 ? '' : a === -1 ? '-' : a) + '(1 - 2x^2)e^{-x^2}', ds: S(a) + '*(1-2*x^2)*e^(-x^2)', D: '\\R',
          sol: ['$(e^{u})\' = u\'e^{u}$ : la dérivée de $e^{-x^2}$ est $-2xe^{-x^2}$.',
            '$f\'(x) = ' + T.num(a) + '\\left(e^{-x^2} + x \\times (-2x)e^{-x^2}\\right) = ' + (a === 1 ? '' : a === -1 ? '-' : a) + '(1 - 2x^2)e^{-x^2}$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 4);
        var dnum = (1 - a === 0 ? '-\\ln x' : T.num(1 - a) + ' - \\ln x');
        return { f: '\\dfrac{' + T.num(a) + ' + \\ln x}{x}', fs: '(' + a + '+ln(x))/x', d: '\\dfrac{' + dnum + '}{x^2}', ds: '(' + S(1 - a) + '-ln(x))/x^2', D: ']0 \\,;\\, +\\infty[',
          sol: ['Avec $u(x) = ' + T.num(a) + ' + \\ln x$, $u\'(x) = \\dfrac{1}{x}$ et $v(x) = x$ : $f\'(x) = \\dfrac{\\frac{1}{x} \\times x - (' + T.num(a) + ' + \\ln x)}{x^2}$.',
            'Donc $f\'(x) = \\dfrac{' + dnum + '}{x^2}$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-derivee-ln-exp',
    titre: 'Dériver une fonction avec ln ou exp',
    chapitres: ['ts-derivabilite', 'ts-logarithme', 'ts-exponentielle'],
    niveaux: 3,
    gen: function (rng, niveau) {
      var t = rng.pick(DER[niveau])(rng);
      controle(deriveOK(t.fs, t.ds, 0.6, 3), 'ts-derivee-ln-exp : ' + t.fs + ' -> ' + t.ds);
      return {
        enonce: 'Soit $f$ la fonction définie sur $' + t.D + '$ par $f(x) = ' + t.f + '$. Calculer $f\'(x)$.',
        questions: [{ label: '$f\'(x) =$', type: 'expr', reponse: t.ds, reponseTex: t.d, domaine: [0.6, 3] }],
        indices: [
          'Formules utiles : $(uv)\' = u\'v + uv\'$, $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$, $(\\ln u)\' = \\dfrac{u\'}{u}$, $(e^{u})\' = u\'e^{u}$.',
          'Identifie bien la forme de $f$ (produit, quotient, composée) avant de dériver.'
        ],
        solution: t.sol,
        aide: 'Écris ln(x), e^x, e^(2x)… Les parenthèses sont nécessaires dans les exposants : e^(-x^2).'
      };
    }
  });

  /* ---------- tangente ---------- */
  EM.gen.register({
    id: 'ts-tangente',
    titre: 'Équation de la tangente en un point',
    chapitres: ['ts-derivabilite', 'tl-fonctions'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var x0, fTex, f0, m, sol = [], D = '\\R';
      if (niveau === 1) {
        var deg3 = rng.bool();
        var co = deg3 ? [rng.nz(-2, 2), 0, rng.int(-4, 4), rng.int(-5, 5)] : [rng.nz(-3, 3), rng.int(-5, 5), rng.int(-5, 5)];
        if (deg3) co[1] = rng.int(-3, 3);
        x0 = rng.int(-2, 2);
        var dco = co.slice(0, -1).map(function (c, i) { return c * (co.length - 1 - i); });
        fTex = T.poly(co);
        f0 = evalPoly(co, x0); m = evalPoly(dco, x0);
        sol.push('$f\'(x) = ' + T.poly(dco) + '$.');
        sol.push('$f(' + x0 + ') = ' + f0.tex() + '$ et $f\'(' + x0 + ') = ' + m.tex() + '$.');
      } else {
        var cas = rng.pick(['ln', 'exp', 'rat']);
        if (cas === 'ln') {
          var a = rng.nz(-3, 3), b = rng.nz(-3, 3), c = rng.int(-4, 4);
          x0 = 1; D = ']0 \\,;\\, +\\infty[';
          fTex = T.mono(a, '\\ln x', true) + T.mono(b, 'x', false) + (c ? T.signed(c) : '');
          f0 = F(b + c); m = F(a + b);
          sol.push('$f\'(x) = \\dfrac{' + a + '}{x}' + T.signed(b) + '$.');
          sol.push('$f(1) = ' + T.num(a) + '\\ln 1' + T.signed(b) + (c ? T.signed(c) : '') + ' = ' + f0.tex() + '$ (car $\\ln 1 = 0$) et $f\'(1) = ' + T.num(a) + T.signed(b) + ' = ' + m.tex() + '$.');
        } else if (cas === 'exp') {
          var p = rng.int(-3, 3);
          x0 = 0;
          fTex = prod([1, p], 'e^{x}');
          f0 = F(p); m = F(p + 1);
          sol.push('$f\'(x) = e^{x} + ' + (p ? '(' + T.poly([1, p]) + ')' : 'x') + 'e^{x} = ' + prod([1, p + 1], 'e^{x}') + '$.');
          sol.push('$f(0) = ' + p + '$ et $f\'(0) = ' + (p + 1) + '$ (car $e^{0} = 1$).');
        } else {
          var aa = rng.nz(-3, 3), cc = rng.nz(-3, 3), bb;
          do { bb = rng.int(-5, 5); } while (aa * cc - bb === 0);
          x0 = rng.pick([1, -1, 2]) - cc;
          var den = x0 + cc;
          fTex = '\\dfrac{' + T.poly([aa, bb]) + '}{' + T.poly([1, cc]) + '}';
          D = '\\R \\setminus \\{' + (-cc) + '\\}';
          f0 = F(aa * x0 + bb, den); m = F(aa * cc - bb, den * den);
          sol.push('$f\'(x) = \\dfrac{' + aa + '(' + T.poly([1, cc]) + ') - (' + T.poly([aa, bb]) + ')}{(' + T.poly([1, cc]) + ')^2} = \\dfrac{' + (aa * cc - bb) + '}{(' + T.poly([1, cc]) + ')^2}$.');
          sol.push('$f(' + x0 + ') = \\dfrac{' + (aa * x0 + bb) + '}{' + den + '} = ' + f0.tex() + '$ et $f\'(' + x0 + ') = \\dfrac{' + (aa * cc - bb) + '}{' + (den * den) + '} = ' + m.tex() + '$.');
        }
      }
      var p0 = f0.sub(m.mul(x0));
      sol.unshift('La tangente au point d\'abscisse $x_0$ a pour équation $y = f\'(x_0)(x - x_0) + f(x_0)$.');
      var mt = m.isZero() ? '' : (m.equals(1) ? '' : m.equals(-1) ? '-' : m.tex()) + T.xMinus(x0);
      var brut = (mt || '') + (f0.isZero() ? (mt ? '' : '0') : T.signed(f0, !mt));
      sol.push('$y = ' + brut + '$' + (brut === T.poly([m, p0]) ? '.' : ', soit $y = ' + T.poly([m, p0]) + '$.'));
      return {
        enonce: 'Soit $f$ la fonction définie sur $' + D + '$ par $f(x) = ' + fTex + '$ et $(\\mathcal{C})$ sa courbe représentative. Déterminer une équation de la tangente $(T)$ à $(\\mathcal{C})$ au point d\'abscisse $' + x0 + '$.',
        questions: [{ label: '$(T) : y =$', type: 'expr', reponse: polyS([m, p0]), reponseTex: T.poly([m, p0]) }],
        indices: ['Calcule $f(' + x0 + ')$ et $f\'(' + x0 + ')$.', 'Utilise $y = f\'(x_0)(x - x_0) + f(x_0)$, puis développe.'],
        solution: sol
      };
    }
  });

  /* ---------- variations d'un polynôme de degré 3 ---------- */
  EM.gen.register({
    id: 'ts-variations-poly3',
    titre: 'Étudier les variations d\'une fonction polynôme',
    chapitres: ['ts-derivabilite', 'tl-fonctions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([1, -1, 2, -2]), r = rng.int(-3, 2), k = rng.int(1, 2), s = r + 2 * k;
      var b = -3 * a * (r + k), c = 3 * a * r * s, d = rng.int(-5, 5);
      var co = [a, b, c, d], dco = [3 * a, 2 * b, c];
      var xM = a > 0 ? r : s, xm = a > 0 ? s : r;
      var fM = evalPoly(co, xM), fm = evalPoly(co, xm);
      var var1 = a > 0 ? 'croissante' : 'décroissante', var2 = a > 0 ? 'décroissante' : 'croissante';
      var sg = a > 0 ? ['+', '-', '+'] : ['-', '+', '-'];
      var tab = '$$\\begin{array}{c|ccccccc} x & -\\infty & & ' + r + ' & & ' + s + ' & & +\\infty \\\\ \\hline f\'(x) & & ' + sg[0] + ' & 0 & ' + sg[1] + ' & 0 & ' + sg[2] + ' & \\end{array}$$';
      var qs = [
        { label: '$f\'(x) =$', type: 'expr', reponse: polyS(dco), reponseTex: T.poly(dco) },
        { label: 'Solutions de $f\'(x) = 0$ :', type: 'set', reponse: [r, s] },
        { label: '$f$ admet un maximum local en $x =$', type: 'number', reponse: xM }
      ];
      var sol = [
        '$f\'(x) = ' + T.poly(dco) + ' = ' + T.num(3 * a) + T.xMinus(r) + T.xMinus(s) + '$ (vérifie en développant).',
        '$f\'(x) = 0 \\iff x = ' + r + '$ ou $x = ' + s + '$. Un trinôme est du signe de son coefficient $' + (3 * a) + '$ à l\'extérieur des racines :' + tab,
        '$f$ est ' + var1 + ' sur $]-\\infty \\,;\\, ' + r + ']$, ' + var2 + ' sur $[' + r + ' \\,;\\, ' + s + ']$ et ' + var1 + ' sur $[' + s + ' \\,;\\, +\\infty[$.',
        'La dérivée s\'annule en changeant de signe de $+$ à $-$ en $x = ' + xM + '$ : $f$ y admet un maximum local.'
      ];
      if (niveau === 2) {
        qs.push({ label: 'Valeur du maximum local :', type: 'number', reponse: fM });
        qs.push({ label: 'Valeur du minimum local :', type: 'number', reponse: fm });
        sol.push('Maximum local : $f(' + xM + ') = ' + fM.tex() + '$ ; minimum local : $f(' + xm + ') = ' + fm.tex() + '$.');
      }
      return {
        enonce: 'Soit $f$ la fonction définie sur $\\R$ par $f(x) = ' + T.poly(co) + '$.<br>Calculer $f\'(x)$, résoudre $f\'(x) = 0$ et étudier le signe de $f\'(x)$ pour dresser le tableau de variations de $f$.' +
          (niveau === 2 ? ' Préciser les extremums locaux.' : ''),
        questions: qs,
        indices: ['$(x^n)\' = nx^{n-1}$ : dérive terme à terme.', 'Les racines de $f\'$ s\'obtiennent avec le discriminant ; $f\'$ a le signe de $' + (3 * a) + '$ à l\'extérieur des racines.'],
        solution: sol,
        aide: 'Sépare les solutions par « ; ».'
      };
    }
  });

  /* ================================================================== */
  /* Problèmes de synthèse : exponentielle et logarithme                 */
  /* ================================================================== */
  /** Courbe d'une fonction sur [x0 ; x1] (fenêtre verticale bornée). */
  function figCourbe(f, x0, x1, yMin, yMax) {
    var ys = [];
    for (var i = 0; i <= 120; i++) { var y = f(x0 + (x1 - x0) * i / 120); if (isFinite(y)) ys.push(y); }
    var lo = Math.max(yMin, Math.min.apply(null, ys)), hi = Math.min(yMax, Math.max.apply(null, ys));
    lo = Math.floor(Math.min(lo, 0)) - 0.5; hi = Math.ceil(Math.max(hi, 0)) + 0.5;
    var fig = EM.fig.create({ w: 300, h: 220, xmin: x0, xmax: x1, ymin: lo, ymax: hi, title: 'Courbe représentative' });
    var step = Math.max(1, Math.ceil(Math.max(x1 - x0, hi - lo) / 12));
    fig.axes({ step: step });
    fig.curve(f, { accent: true });
    return fig.svg();
  }

  EM.gen.register({
    id: 'ts-probleme-exp',
    titre: 'Problème : étude d\'une fonction avec exponentielle',
    chapitres: ['ts-exponentielle', 'ts-derivabilite', 'ts-integrales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([1, 2, -1, -2, 3]), x0 = rng.int(-1, 2), b = a * (1 - x0);
      var fTex = prod([a, b], 'e^{-x}'), fs = polyS([a, b]) + '*e^(-x)';
      var dco = [-a, a * x0];
      var dTex = prod(dco, 'e^{-x}'), ds = polyS(dco) + '*e^(-x)';
      var ext = eVal(a, -x0);
      var maxi = a > 0;
      var al = -a, be = -a - b;
      var I = { s: S(al + be) + '*e^(-1)-' + S(be), tex: T.sum([{ c: -be }, { c: al + be, v: 'e^{-1}' }]) };
      controle(deriveOK(fs, ds, -2, 3), 'probleme-exp derivee');
      controle(deriveOK(polyS([al, be]) + '*e^(-x)', fs, -2, 3), 'probleme-exp primitive');
      controle(proche(val(I.s), simpson(fn(fs), 0, 1)), 'probleme-exp integrale');
      var qs = [
        qcm(rng, '$' + lim('+\\infty') + ' f(x) =$', ZERO, [PINF, MINF, '$' + T.num(a) + '$']),
        qcm(rng, '$' + lim('-\\infty') + ' f(x) =$', a > 0 ? MINF : PINF, [PINF, MINF, ZERO]),
        { label: '$f\'(x) =$', type: 'expr', reponse: ds, reponseTex: dTex },
        { label: '$f\'$ s\'annule en $x_0 =$', type: 'number', reponse: x0 },
        { label: '$f(x_0) =$', type: 'number', reponse: ext.s, reponseTex: ext.tex },
        qcm(rng, '$f(x_0)$ est un :', maxi ? 'maximum' : 'minimum', ['maximum', 'minimum'])
      ];
      var sol = [
        '<b>Limite en $+\\infty$.</b> $f(x) = ' + T.mono(a, 'xe^{-x}', true) + (b ? T.mono(b, 'e^{-x}', false) : '') + '$. Par croissance comparée $' + lim('+\\infty') + ' xe^{-x} = 0$, et $' + lim('+\\infty') + ' e^{-x} = 0$, donc $' + lim('+\\infty') + ' f(x) = 0$ : l\'axe des abscisses est asymptote en $+\\infty$.',
        '<b>Limite en $-\\infty$.</b> $' + lim('-\\infty') + ' (' + T.poly([a, b]) + ') = ' + (a > 0 ? '-' : '+') + '\\infty$ et $' + lim('-\\infty') + ' e^{-x} = +\\infty$, donc par produit $' + lim('-\\infty') + ' f(x) = ' + (a > 0 ? '-' : '+') + '\\infty$.',
        '<b>Dérivée.</b> $f\'(x) = ' + T.mono(a, 'e^{-x}', true) + ' - (' + T.poly([a, b]) + ')e^{-x} = ' + dTex + ' = ' + kv(-a, T.xMinus(x0)) + 'e^{-x}$.',
        'Comme $e^{-x} > 0$, $f\'(x)$ a le signe de $' + kv(-a, T.xMinus(x0)) + '$ : $f\'(x) = 0 \\iff x = ' + x0 + '$, et $f\'$ est ' + (maxi ? 'positive puis négative' : 'négative puis positive') + '.',
        '$f$ est ' + (maxi ? 'croissante' : 'décroissante') + ' sur $]-\\infty \\,;\\, ' + x0 + ']$ et ' + (maxi ? 'décroissante' : 'croissante') + ' sur $[' + x0 + ' \\,;\\, +\\infty[$ : elle admet un ' + (maxi ? 'maximum' : 'minimum') + ' en $x_0 = ' + x0 + '$, égal à $f(' + x0 + ') = ' + T.num(a) + ' \\times ' + eVal(1, -x0).tex + ' = ' + ext.tex + '$.'
      ];
      if (niveau === 2) {
        qs.push({ label: '$(\\alpha \\,;\\, \\beta) =$', type: 'tuple', reponse: [al, be] });
        qs.push({ label: '$I =$', type: 'number', reponse: I.s, reponseTex: I.tex });
        sol.push('<b>Primitive.</b> $F(x) = (\\alpha x + \\beta)e^{-x}$ donne $F\'(x) = \\alpha e^{-x} - (\\alpha x + \\beta)e^{-x} = (-\\alpha x + \\alpha - \\beta)e^{-x}$.');
        sol.push('Par identification avec $f(x)$ : $-\\alpha = ' + a + '$ et $\\alpha - \\beta = ' + b + '$, donc $\\alpha = ' + al + '$ et $\\beta = ' + be + '$ : $F(x) = ' + prod([al, be], 'e^{-x}') + '$.');
        sol.push('<b>Intégrale.</b> $I = F(1) - F(0) = ' + T.mono(al + be, 'e^{-1}', true) + ' - ' + T.par(be) + ' = ' + I.tex + '$.');
      }
      return {
        enonce: 'On considère la fonction $f$ définie sur $\\R$ par $$f(x) = ' + fTex + '$$ et $(\\mathcal{C})$ sa courbe représentative dans un repère orthonormé.<br>' +
          '1. Calculer les limites de $f$ en $+\\infty$ et en $-\\infty$.<br>2. Calculer $f\'(x)$, étudier son signe et en déduire l\'extremum de $f$.' +
          (niveau === 2 ? '<br>3. Déterminer les réels $\\alpha$ et $\\beta$ tels que $F(x) = (\\alpha x + \\beta)e^{-x}$ soit une primitive de $f$ sur $\\R$, puis calculer $I = \\displaystyle\\int_0^1 f(x)\\,dx$.' : ''),
        figure: figCourbe(function (x) { return (a * x + b) * Math.exp(-x); }, -1.5, 6, -6, 6),
        questions: qs,
        indices: ['Écris $f(x) = ' + T.mono(a, 'xe^{-x}', true) + (b ? T.mono(b, 'e^{-x}', false) : '') + '$ et utilise les croissances comparées.', '$(e^{-x})\' = -e^{-x}$ ; dérive $f$ comme un produit puis factorise par $e^{-x}$.'],
        solution: sol,
        aide: 'Valeurs exactes : tu peux écrire 2e^(-1), 3e^2… ; couple : (α ; β).'
      };
    }
  });

  EM.gen.register({
    id: 'ts-probleme-ln',
    titre: 'Problème : étude d\'une fonction avec logarithme',
    chapitres: ['ts-logarithme', 'ts-derivabilite'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var b = rng.pick([1, 2, -1, -2, 3]), k = rng.int(-1, 2), a = b * (1 - k);
      var num = T.sum([{ c: a }, { c: b, v: '\\ln x' }]);
      var fTex = '\\dfrac{' + num + '}{x}', fs = '(' + S(a) + '+' + S(b) + '*ln(x))/x';
      var dnum = T.sum([{ c: b * k }, { c: -b, v: '\\ln x' }]);
      var dTex = '\\dfrac{' + dnum + '}{x^2}', ds = '(' + S(b * k) + '-' + S(b) + '*ln(x))/x^2';
      var xe = eVal(1, k), ext = eVal(b, -k), z = eVal(1, k - 1);
      var maxi = b > 0;
      controle(deriveOK(fs, ds, 0.5, 4), 'probleme-ln derivee');
      controle(proche(fn(fs)(val(xe.s)), val(ext.s)), 'probleme-ln extremum');
      controle(Math.abs(fn(fs)(val(z.s))) < 1e-9, 'probleme-ln zero');
      var qs = [
        qcm(rng, '$' + lim('0^+') + ' f(x) =$', b > 0 ? MINF : PINF, [PINF, MINF, ZERO]),
        qcm(rng, '$' + lim('+\\infty') + ' f(x) =$', ZERO, [PINF, MINF, '$' + T.num(b) + '$']),
        { label: '$f\'(x) =$', type: 'expr', reponse: ds, reponseTex: dTex, domaine: [0.5, 4] },
        { label: '$f\'$ s\'annule en $x_0 =$', type: 'number', reponse: xe.s, reponseTex: xe.tex },
        { label: '$f(x_0) =$', type: 'number', reponse: ext.s, reponseTex: ext.tex }
      ];
      var sol = [
        '<b>En $0^+$.</b> $' + lim('0^+') + ' \\ln x = -\\infty$ donc $' + lim('0^+') + ' (' + num + ') = ' + (b > 0 ? '-' : '+') + '\\infty$ ; et $' + lim('0^+') + ' \\dfrac{1}{x} = +\\infty$. Par produit, $' + lim('0^+') + ' f(x) = ' + (b > 0 ? '-' : '+') + '\\infty$ : l\'axe des ordonnées est asymptote verticale.',
        '<b>En $+\\infty$.</b> $f(x) = ' + (a ? dfr(a, 'x', true) : '') + (a ? T.mono(b, '\\dfrac{\\ln x}{x}', false) : T.mono(b, '\\dfrac{\\ln x}{x}', true)) + '$. Or $' + lim('+\\infty') + ' \\dfrac{\\ln x}{x} = 0$ (croissance comparée), donc $' + lim('+\\infty') + ' f(x) = 0$.',
        '<b>Dérivée.</b> Avec $u(x) = ' + num + '$ ($u\'(x) = \\dfrac{' + b + '}{x}$) et $v(x) = x$ : $f\'(x) = \\dfrac{\\frac{' + b + '}{x} \\times x - (' + num + ')}{x^2} = ' + dTex + '$.',
        '$f\'(x) = \\dfrac{' + T.num(b) + '(' + T.num(k) + ' - \\ln x)}{x^2}$ s\'annule pour $\\ln x = ' + k + '$, soit $x_0 = ' + xe.tex + '$.',
        'Pour $x < ' + xe.tex + '$, $' + k + ' - \\ln x > 0$ ; pour $x > ' + xe.tex + '$, $' + k + ' - \\ln x < 0$. Comme $' + T.num(b) + (b > 0 ? ' > 0' : ' < 0') + '$, $f$ est ' + (maxi ? 'croissante puis décroissante' : 'décroissante puis croissante') + '.',
        'L\'extremum vaut $f(' + xe.tex + ') = \\dfrac{' + T.sum([{ c: a }, { c: b * k }]) + '}{' + xe.tex + '} = ' + ext.tex + '$.'
      ];
      if (niveau === 2) {
        qs.push(qcm(rng, 'Cet extremum est un :', maxi ? 'maximum' : 'minimum', ['maximum', 'minimum']));
        qs.push({ label: 'Solution de $f(x) = 0$ : $x =$', type: 'number', reponse: z.s, reponseTex: z.tex });
        sol.push('C\'est un ' + (maxi ? 'maximum' : 'minimum') + ' car $f\'$ passe du signe ' + (maxi ? '$+$ au signe $-$' : '$-$ au signe $+$') + ' en $x_0$.');
        sol.push('$f(x) = 0 \\iff ' + num + ' = 0 \\iff \\ln x = ' + F(-a, b).tex() + ' \\iff x = ' + z.tex + '$.');
      }
      return {
        enonce: 'Soit $f$ la fonction définie sur $]0 \\,;\\, +\\infty[$ par $$f(x) = ' + fTex + '$$<br>' +
          '1. Calculer les limites de $f$ en $0$ et en $+\\infty$ ; interpréter graphiquement.<br>2. Calculer $f\'(x)$, puis déterminer le réel $x_0$ où $f\'$ s\'annule et la valeur $f(x_0)$.' +
          (niveau === 2 ? '<br>3. Préciser la nature de cet extremum et résoudre $f(x) = 0$.' : ''),
        figure: figCourbe(function (x) { return (a + b * Math.log(x)) / x; }, -0.5, 9, -5, 5),
        questions: qs,
        indices: ['Écris $f(x) = \\dfrac{1}{x}(' + num + ')$ en $0^+$, et utilise $\\dfrac{\\ln x}{x} \\to 0$ en $+\\infty$.', 'Dérive comme un quotient : $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$.'],
        solution: sol,
        aide: 'Valeurs exactes : tu peux écrire e, e^2, e^(-1), 2e^(-1)…'
      };
    }
  });

  /* ================================================================== */
  /* Équations et inéquations avec ln et exp                             */
  /* ================================================================== */
  function solLnC(c, b, a) { // x = (ln c - b)/a, a > 0
    var num = '\\ln ' + c + (b ? T.signed(-b) : '');
    return { s: '(ln(' + c + ')-' + S(b) + ')/' + S(a), tex: a === 1 ? num : '\\dfrac{' + num + '}{' + a + '}' };
  }
  function solEC(c, b, a) { // x = (e^c - b)/a, a > 0
    var num = eVal(1, c).tex + (b ? T.signed(-b) : '');
    return { s: '(e^(' + c + ')-' + S(b) + ')/' + S(a), tex: a === 1 ? num : '\\dfrac{' + num + '}{' + a + '}' };
  }
  function lnTex(p) { return p === 1 ? '0' : '\\ln ' + p; }

  var EQ = {
    1: [
      function (rng) {
        var a = rng.int(1, 3), b = rng.int(-3, 3), c = rng.pick([2, 3, 5, 6, 7, 10]);
        var x = solLnC(c, b, a);
        return { eq: 'e^{' + T.poly([a, b]) + '} = ' + c, sols: [x],
          sol: ['La fonction exponentielle est définie sur $\\R$ : pas de condition.',
            'Pour tout réel $X$ et tout $c > 0$ : $e^{X} = c \\iff X = \\ln c$.',
            '$e^{' + T.poly([a, b]) + '} = ' + c + ' \\iff ' + T.poly([a, b]) + ' = \\ln ' + c + ' \\iff x = ' + x.tex + '$.'] };
      },
      function (rng) {
        var a = rng.int(1, 3), b = rng.int(-4, 4), c = rng.pick([-2, -1, 1, 2, 3]);
        var x = solEC(c, b, a), lin = T.poly([a, b]);
        return { eq: '\\ln(' + lin + ') = ' + c, sols: [x],
          sol: ['Condition d\'existence : $' + lin + ' > 0 \\iff x > ' + F(-b, a).tex() + '$.',
            'Pour $X > 0$ : $\\ln X = ' + c + ' \\iff X = ' + eVal(1, c).tex + '$.',
            '$' + lin + ' = ' + eVal(1, c).tex + ' \\iff x = ' + x.tex + '$, qui vérifie bien la condition puisque $' + lin + ' = ' + eVal(1, c).tex + ' > 0$.'] };
      }
    ],
    2: [
      function (rng) {
        var p, q;
        do { p = rng.int(-3, 6); q = rng.int(1, 7); } while (p === 0 || p === q);
        var s = p + q, pr = p * q;
        var pos = [p, q].filter(function (v) { return v > 0; }).sort(function (u, v) { return u - v; });
        var sols = pos.map(function (v) { return { s: 'ln(' + v + ')', tex: lnTex(v) }; });
        return { eq: 'e^{2x}' + T.mono(-s, 'e^{x}', false) + T.signed(pr) + ' = 0', sols: sols,
          sol: ['On pose $X = e^{x}$ (avec $X > 0$) : l\'équation devient $X^2' + T.mono(-s, 'X', false) + T.signed(pr) + ' = 0$.',
            '$\\Delta = ' + T.par(s) + '^2 - 4 \\times ' + T.par(pr) + ' = ' + ((p - q) * (p - q)) + '$ : les racines sont $X = ' + p + '$ et $X = ' + q + '$.',
            (p < 0 ? '$e^{x} = ' + p + '$ est impossible car $e^{x} > 0$. ' : '$e^{x} = ' + p + ' \\iff x = ' + lnTex(p) + '$. ') + '$e^{x} = ' + q + ' \\iff x = ' + lnTex(q) + '$.',
            '$S = ' + T.set(sols.map(function (o) { return o.tex; })) + '$.'] };
      },
      function (rng) {
        var r = rng.int(1, 6), m, n;
        do { m = rng.int(-r + 1, 6); } while (m === 0 || r * (r + m) < 2);
        n = r * (r + m);
        var other = -(r + m), cond = m > 0 ? 'x > 0' : 'x > ' + (-m);
        return { eq: '\\ln x + \\ln(' + T.poly([1, m]) + ') = \\ln ' + n, sols: [{ s: String(r), tex: String(r) }],
          sol: ['Conditions : $x > 0$ et $' + T.poly([1, m]) + ' > 0$, soit $' + cond + '$.',
            'Sur ce domaine : $\\ln x + \\ln(' + T.poly([1, m]) + ') = \\ln[x(' + T.poly([1, m]) + ')]$, et $\\ln A = \\ln B \\iff A = B$.',
            '$x(' + T.poly([1, m]) + ') = ' + n + ' \\iff ' + T.poly([1, m, -n]) + ' = 0$ ; $\\Delta = ' + (m * m + 4 * n) + ' = ' + (2 * r + m) + '^2$, racines $' + r + '$ et $' + other + '$.',
            '$' + other + '$ ne vérifie pas la condition $' + cond + '$ : $S = \\{' + r + '\\}$.'] };
      }
    ],
    3: [
      function (rng) {
        var p, q;
        do { p = rng.int(-2, 3); q = rng.int(-2, 3); } while (p >= q);
        var s = p + q, pr = p * q;
        var sols = [eVal(1, p), eVal(1, q)];
        return { eq: '(\\ln x)^2' + T.mono(-s, '\\ln x', false) + (pr ? T.signed(pr) : '') + ' = 0', sols: sols,
          sol: ['Condition : $x > 0$. On pose $X = \\ln x$ : $X^2' + T.mono(-s, 'X', false) + (pr ? T.signed(pr) : '') + ' = 0$.',
            'Les racines sont $X = ' + p + '$ et $X = ' + q + '$ (somme $' + s + '$, produit $' + pr + '$).',
            '$\\ln x = ' + p + ' \\iff x = ' + sols[0].tex + '$ et $\\ln x = ' + q + ' \\iff x = ' + sols[1].tex + '$.',
            '$S = ' + T.set([sols[0].tex, sols[1].tex]) + '$.'] };
      },
      function (rng) {
        var r = rng.int(1, 5), s0;
        do { s0 = rng.int(-5, -1); } while (r + s0 === 0);
        var a = r + s0, b = -r * s0, lin = T.poly([a, b]);
        return { eq: '2\\ln x = \\ln(' + lin + ')', sols: [{ s: String(r), tex: String(r) }],
          sol: ['Conditions : $x > 0$ et $' + lin + ' > 0$.',
            'Sur ce domaine, $2\\ln x = \\ln(x^2)$ donc l\'équation équivaut à $x^2 = ' + lin + '$, soit $' + T.poly([1, -a, -b]) + ' = 0$.',
            'Les racines sont $' + r + '$ et $' + s0 + '$ ; $' + s0 + ' < 0$ est exclu, et pour $x = ' + r + '$ : $' + T.num(a) + ' \\times ' + r + ' + ' + b + ' = ' + (r * r) + ' > 0$.',
            '$S = \\{' + r + '\\}$.'] };
      },
      function (rng) {
        var p, q;
        do { p = rng.int(1, 5); q = rng.int(1, 7); } while (p >= q);
        var sols = [{ s: 'ln(' + p + ')', tex: lnTex(p) }, { s: 'ln(' + q + ')', tex: lnTex(q) }];
        return { eq: 'e^{x}' + T.signed(-(p + q)) + T.mono(p * q, 'e^{-x}', false) + ' = 0', sols: sols,
          sol: ['On multiplie par $e^{x} > 0$ : $e^{2x}' + T.mono(-(p + q), 'e^{x}', false) + T.signed(p * q) + ' = 0$.',
            'Avec $X = e^{x} > 0$ : $X^2' + T.mono(-(p + q), 'X', false) + T.signed(p * q) + ' = 0$, de racines $' + p + '$ et $' + q + '$ (toutes deux positives).',
            '$e^{x} = ' + p + ' \\iff x = ' + lnTex(p) + '$ ; $e^{x} = ' + q + ' \\iff x = ' + lnTex(q) + '$.',
            '$S = ' + T.set([sols[0].tex, sols[1].tex]) + '$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-eq-ln-exp',
    titre: 'Résoudre une équation avec ln ou exp',
    chapitres: ['ts-logarithme', 'ts-exponentielle', 'tl-logarithme-exponentielle'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var t = rng.pick(EQ[niveau])(rng);
      t.sols.forEach(function (o) { controle(isFinite(val(o.s)), 'eq-ln-exp valeur'); });
      var tri = t.sols.slice().sort(function (u, v) { return val(u.s) - val(v.s); });
      var qs = tri.length === 1 ? [{ label: 'Solution : $x =$', type: 'number', reponse: tri[0].s, reponseTex: tri[0].tex }]
        : tri.map(function (o, i) { return { label: (i === 0 ? 'Plus petite solution' : 'Plus grande solution') + ' : $x_' + (i + 1) + ' =$', type: 'number', reponse: o.s, reponseTex: o.tex }; });
      return {
        enonce: 'Résoudre dans $\\R$ l\'équation : $$' + t.eq + '$$',
        questions: qs,
        indices: ['Commence par écrire les conditions d\'existence.', '$\\ln a = \\ln b \\iff a = b$ (pour $a, b > 0$) ; $e^{X} = c \\iff X = \\ln c$ (pour $c > 0$). Pense au changement d\'inconnue $X = e^{x}$ ou $X = \\ln x$.'],
        solution: t.sol,
        aide: 'Valeur exacte : tu peux écrire ln(3), e^2, (ln(5)-1)/2, (e^(-1)+3)/2…'
      };
    }
  });

  var INEQ = {
    1: [
      function (rng) {
        var a = rng.int(1, 3), b = rng.int(-4, 4), c = rng.pick([-1, 1, 2]), sg = rng.pick(['<', '\\leq', '>', '\\geq']);
        var lin = T.poly([a, b]), lo = F(-b, a), x = solEC(c, b, a);
        var inf = sg === '<' || sg === '\\leq';
        var rep = inf ? { a: lo, b: x.s, ouvA: true, ouvB: sg === '<' } : { a: x.s, b: Infinity, ouvA: sg === '>', ouvB: true };
        var tex = inf ? T.interval(lo.tex(), x.tex, true, sg === '<') : T.interval(x.tex, Infinity, sg === '>', true);
        return { ineq: '\\ln(' + lin + ') ' + sg + ' ' + c, rep: rep, tex: tex,
          sol: ['Condition : $' + lin + ' > 0 \\iff x > ' + lo.tex() + '$.',
            'La fonction $\\ln$ est strictement croissante sur $]0 \\,;\\, +\\infty[$ et $' + c + ' = \\ln\\left(' + eVal(1, c).tex + '\\right)$ : l\'inéquation équivaut à $' + lin + ' ' + sg + ' ' + eVal(1, c).tex + '$, soit $x ' + sg + ' ' + x.tex + '$.',
            (inf ? 'Avec la condition $x > ' + lo.tex() + '$ : ' : 'Comme $' + x.tex + ' > ' + lo.tex() + '$, la condition est satisfaite : ') + '$S = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.pick([1, 2, 3, -1, -2]), b = rng.int(-3, 3), c = rng.pick([2, 3, 5, 7]), sg = rng.pick(['<', '\\leq', '>', '\\geq']);
        var lin = T.poly([a, b]), x;
        if (a > 0) x = solLnC(c, b, a);
        else {
          var numt = (b ? T.num(b) + ' - ' : '-') + '\\ln ' + c;
          x = { s: '(' + S(b) + '-ln(' + c + '))/' + S(-a), tex: a === -1 ? numt : '\\dfrac{' + numt + '}{' + (-a) + '}' };
        }
        var inf = sg === '<' || sg === '\\leq';
        var flip = a < 0, sens = inf !== flip; // vrai : x inférieur à la borne
        var strict = sg === '<' || sg === '>';
        var newSg = sens ? (strict ? '<' : '\\leq') : (strict ? '>' : '\\geq');
        var rep = sens ? { a: -Infinity, b: x.s, ouvA: true, ouvB: strict } : { a: x.s, b: Infinity, ouvA: strict, ouvB: true };
        var tex = sens ? T.interval(-Infinity, x.tex, true, strict) : T.interval(x.tex, Infinity, strict, true);
        return { ineq: 'e^{' + lin + '} ' + sg + ' ' + c, rep: rep, tex: tex,
          sol: ['La fonction $\\ln$ est strictement croissante sur $]0 \\,;\\, +\\infty[$ : $e^{X} ' + sg + ' ' + c + ' \\iff X ' + sg + ' \\ln ' + c + '$.',
            '$' + lin + ' ' + sg + ' \\ln ' + c + '$' + (flip ? ' ; on divise par $' + a + ' < 0$, ce qui change le sens : ' : ', soit ') + '$x ' + newSg + ' ' + x.tex + '$.',
            '$S = ' + tex + '$.'] };
      }
    ],
    2: [
      function (rng) {
        var p, q, strict = rng.bool();
        do { p = rng.int(1, 5); q = rng.int(2, 8); } while (p >= q);
        var sg = strict ? '<' : '\\leq';
        var lo = p === 1 ? '0' : 'ln(' + p + ')', hi = 'ln(' + q + ')';
        var tex = T.interval(lnTex(p), lnTex(q), strict, strict);
        return { ineq: 'e^{2x}' + T.mono(-(p + q), 'e^{x}', false) + T.signed(p * q) + ' ' + sg + ' 0', rep: { a: lo, b: hi, ouvA: strict, ouvB: strict }, tex: tex,
          sol: ['On pose $X = e^{x} > 0$ : $X^2' + T.mono(-(p + q), 'X', false) + T.signed(p * q) + ' = (X - ' + p + ')(X - ' + q + ')$.',
            'Ce trinôme est ' + (strict ? 'strictement négatif' : 'négatif ou nul') + ' entre ses racines : $' + p + ' ' + sg + ' e^{x} ' + sg + ' ' + q + '$.',
            'Par stricte croissance de $\\ln$ : $' + lnTex(p) + ' ' + sg + ' x ' + sg + ' ' + lnTex(q) + '$, donc $S = ' + tex + '$.'] };
      },
      function (rng) {
        var p, q, strict = rng.bool();
        do { p = rng.int(-2, 2); q = rng.int(-1, 3); } while (p >= q);
        var sg = strict ? '<' : '\\leq';
        var ep = eVal(1, p), eq = eVal(1, q), s = p + q, pr = p * q;
        var tex = T.interval(ep.tex, eq.tex, strict, strict);
        return { ineq: '(\\ln x)^2' + T.mono(-s, '\\ln x', false) + (pr ? T.signed(pr) : '') + ' ' + sg + ' 0', rep: { a: ep.s, b: eq.s, ouvA: strict, ouvB: strict }, tex: tex,
          sol: ['Condition : $x > 0$. Avec $X = \\ln x$ : $X^2' + T.mono(-s, 'X', false) + (pr ? T.signed(pr) : '') + ' = ' + T.xMinus(p, 'X') + T.xMinus(q, 'X') + '$.',
            'Ce trinôme est ' + (strict ? 'strictement négatif' : 'négatif ou nul') + ' entre ses racines : $' + p + ' ' + sg + ' \\ln x ' + sg + ' ' + q + '$.',
            'Par stricte croissance de $\\exp$ : $' + ep.tex + ' ' + sg + ' x ' + sg + ' ' + eq.tex + '$, donc $S = ' + tex + '$.'] };
      },
      function (rng) {
        var r = rng.int(1, 5), m = rng.int(1, 5), n = r * (r + m);
        var tex = T.interval(0, r, true, true);
        return { ineq: '\\ln x + \\ln(x + ' + m + ') < \\ln ' + n, rep: { a: 0, b: r, ouvA: true, ouvB: true }, tex: tex,
          sol: ['Conditions : $x > 0$ et $x + ' + m + ' > 0$, soit $x > 0$.',
            'Sur $]0 \\,;\\, +\\infty[$, l\'inéquation s\'écrit $\\ln[x(x + ' + m + ')] < \\ln ' + n + '$, soit $' + T.poly([1, m, -n]) + ' < 0$ (car $\\ln$ est strictement croissante).',
            'Les racines du trinôme sont $' + r + '$ et $' + (-(r + m)) + '$ : il est négatif entre elles.',
            'Avec $x > 0$ : $S = ' + tex + '$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-ineq-ln-exp',
    titre: 'Résoudre une inéquation avec ln ou exp',
    chapitres: ['ts-logarithme', 'ts-exponentielle', 'tl-logarithme-exponentielle'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var t = rng.pick(INEQ[niveau])(rng);
      return {
        enonce: 'Résoudre dans $\\R$ l\'inéquation : $$' + t.ineq + '$$',
        questions: [{ label: '$S =$', type: 'interval', reponse: t.rep, reponseTex: t.tex }],
        indices: ['N\'oublie pas les conditions d\'existence des logarithmes.', '$\\ln$ et $\\exp$ sont strictement croissantes : elles conservent le sens des inégalités.'],
        solution: t.sol,
        aide: AIDE_INT
      };
    }
  });

  /* ---------- calculs avec ln et exp (Tle L) ---------- */
  var LN23 = [[1, 0], [0, 1], [2, 0], [1, 1], [3, 0], [0, 2], [2, 1], [4, 0], [1, 2], [3, 1], [0, 3], [2, 2], [5, 0], [4, 1], [3, 2], [1, 3]];
  function n23(e) { return Math.pow(2, e[0]) * Math.pow(3, e[1]); }
  EM.gen.register({
    id: 'tl-ln-exp-calcul',
    titre: 'Calculer avec ln et exp',
    chapitres: ['tl-logarithme-exponentielle', 'ts-logarithme', 'ts-exponentielle'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var al, be, Atex, sol = [];
      if (niveau === 1) {
        var e0 = rng.pick(LN23.slice(4));
        var N = n23(e0);
        al = e0[0]; be = e0[1];
        Atex = '\\ln ' + N;
        sol.push('On décompose : $' + N + ' = ' + (al ? (al === 1 ? '2' : '2^{' + al + '}') : '') + (al && be ? ' \\times ' : '') + (be ? (be === 1 ? '3' : '3^{' + be + '}') : '') + '$.');
        sol.push('$\\ln(ab) = \\ln a + \\ln b$ et $\\ln(a^n) = n\\ln a$, donc $A = ' + T.sum([{ c: al, v: '\\ln 2' }, { c: be, v: '\\ln 3' }]) + '$.');
      } else {
        var es = rng.sample(LN23, 3), ks = [1, rng.pick([1, 2, -1]), rng.pick([-1, -2])];
        al = 0; be = 0;
        es.forEach(function (e, i) { al += ks[i] * e[0]; be += ks[i] * e[1]; });
        if (al === 0 && be === 0) { ks[2] = -ks[2]; al = 0; be = 0; es.forEach(function (e, i) { al += ks[i] * e[0]; be += ks[i] * e[1]; }); }
        Atex = es.map(function (e, i) { return T.mono(ks[i], '\\ln ' + n23(e), i === 0); }).join('');
        sol.push('On décompose chaque nombre : ' + es.map(function (e) { return '$\\ln ' + n23(e) + ' = ' + T.sum([{ c: e[0], v: '\\ln 2' }, { c: e[1], v: '\\ln 3' }]) + '$'; }).join(' ; ') + '.');
        sol.push('Donc $A = ' + es.map(function (e, i) { return (i ? (ks[i] < 0 ? ' - ' : ' + ') : (ks[i] < 0 ? '-' : '')) + (Math.abs(ks[i]) === 1 ? '' : Math.abs(ks[i])) + '(' + T.sum([{ c: e[0], v: '\\ln 2' }, { c: e[1], v: '\\ln 3' }]) + ')'; }).join('') + ' = ' + T.sum([{ c: al, v: '\\ln 2' }, { c: be, v: '\\ln 3' }]) + '$.');
      }
      var approx = al * Math.LN2 + be * Math.log(3);
      sol.push('Avec $\\ln 2 \\approx 0{,}693$ et $\\ln 3 \\approx 1{,}099$ : $A \\approx ' + T.num(rd(approx, 2)) + '$.');
      // B : propriétés de exp et ln
      var Bt = rng.pick([0, 1, 2]), p = rng.int(2, 9), q = rng.int(-3, 5), Btex, Bval, Bsol;
      if (Bt === 0) { Btex = '\\ln(e^{' + q + '}) + e^{\\ln ' + p + '}'; Bval = F(q + p); Bsol = '$\\ln(e^{' + q + '}) = ' + q + '$ et $e^{\\ln ' + p + '} = ' + p + '$, donc $B = ' + (q + p) + '$.'; }
      else if (Bt === 1) { Btex = 'e^{2\\ln ' + p + '}' + (q ? ' - \\ln(e^{' + q + '})' : ''); Bval = F(p * p - q); Bsol = '$e^{2\\ln ' + p + '} = e^{\\ln(' + p + '^2)} = ' + (p * p) + '$' + (q ? ' et $\\ln(e^{' + q + '}) = ' + q + '$' : '') + ', donc $B = ' + (p * p - q) + '$.'; }
      else { Btex = '\\ln(e^{' + q + '}\\sqrt{e})'; Bval = F(2 * q + 1, 2); Bsol = '$\\sqrt{e} = e^{\\frac{1}{2}}$, donc $e^{' + q + '}\\sqrt{e} = e^{' + q + ' + \\frac{1}{2}}$ et $B = ' + q + ' + \\dfrac{1}{2} = ' + Bval.tex() + '$.'; }
      sol.push(Bsol);
      return {
        enonce: '1. Écrire $A = ' + Atex + '$ sous la forme $\\alpha\\ln 2 + \\beta\\ln 3$, avec $\\alpha$ et $\\beta$ entiers, puis en donner une valeur approchée à $10^{-2}$ près (on prendra $\\ln 2 \\approx 0{,}693$ et $\\ln 3 \\approx 1{,}099$).<br>2. Calculer $B = ' + Btex + '$.',
        questions: [
          { label: '$(\\alpha \\,;\\, \\beta) =$', type: 'tuple', reponse: [al, be] },
          { label: '$A \\approx$', type: 'number', reponse: approx, tol: 0.02, reponseTex: T.num(rd(approx, 2)) },
          { label: '$B =$', type: 'number', reponse: Bval }
        ],
        indices: ['Décompose chaque nombre en produit de puissances de 2 et de 3.', '$\\ln(ab) = \\ln a + \\ln b$, $\\ln\\dfrac{a}{b} = \\ln a - \\ln b$, $\\ln(a^n) = n\\ln a$, $e^{\\ln a} = a$, $\\ln(e^{x}) = x$.'],
        solution: sol,
        aide: AIDE_TUPLE
      };
    }
  });

  /* ================================================================== */
  /* Suites                                                              */
  /* ================================================================== */
  function puissTex(c, a, expo) { // c·a^expo avec a fraction
    var base = a.d === 1 ? (a.n < 0 ? '(' + a.n + ')' : String(a.n)) : '\\left(' + a.tex() + '\\right)';
    var coef = c.equals(1) ? '' : c.equals(-1) ? '-' : T.num(c);
    return coef + base + '^{' + expo + '}';
  }
  EM.gen.register({
    id: 'ts-suite-arithmetico-geo',
    titre: 'Suite u(n+1) = a·u(n) + b et suite géométrique auxiliaire',
    chapitres: ['ts-suites', 'tl-suites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1, 4), F(4, 5), F(2, 5), F(3, 5)]);
      var m = rng.nz(-3, 5), l = F(a.d * m), b = F((a.d - a.n) * m);
      var u0;
      do { u0 = rng.int(-4, 20); } while (u0 === l.n);
      var v0 = F(u0).sub(l);
      var rec = 'u_{n+1} = ' + T.mono(a, 'u_n', true) + T.signed(b);
      var un = { s: S(v0) + '*' + S(a) + '^n+' + S(l), tex: puissTex(v0, a, 'n') + T.signed(l) };
      var qs = [], sol = [];
      if (niveau >= 2) {
        qs.push({ label: '$\\ell =$', type: 'number', reponse: l });
        sol.push('Si $(v_n)$ est géométrique de raison $' + a.tex() + '$, alors $v_{n+1} = ' + T.mono(a, 'v_n', true) + '$, ce qui donne $u_{n+1} - \\ell = ' + T.mono(a, '(u_n - \\ell)', true) + '$, donc $\\ell$ vérifie $\\ell = ' + T.mono(a, '\\ell', true) + T.signed(b) + '$.');
        sol.push('$\\ell\\left(1 - ' + a.tex() + '\\right) = ' + T.num(b) + '$, soit $\\ell = ' + l.tex() + '$.');
      }
      qs.push({ label: 'Raison $q$ de $(v_n)$ :', type: 'number', reponse: a });
      qs.push({ label: '$v_0 =$', type: 'number', reponse: v0 });
      qs.push({ label: '$u_n =$', type: 'expr', variable: 'n', reponse: un.s, reponseTex: un.tex, domaine: [0, 8] });
      qs.push({ label: '$\\lim\\limits_{n \\to +\\infty} u_n =$', type: 'number', reponse: l });
      sol.push('$v_{n+1} = u_{n+1}' + T.signed(l.neg()) + ' = ' + T.mono(a, 'u_n', true) + T.signed(b) + T.signed(l.neg()) + ' = ' + T.mono(a, 'u_n', true) + T.signed(b.sub(l)) + ' = ' + a.tex() + '\\left(u_n' + T.signed(l.neg()) + '\\right) = ' + T.mono(a, 'v_n', true) + '$.');
      sol.push('Donc $(v_n)$ est géométrique de raison $q = ' + a.tex() + '$ et de premier terme $v_0 = u_0' + T.signed(l.neg()) + ' = ' + T.num(u0) + T.signed(l.neg()) + ' = ' + v0.tex() + '$.');
      sol.push('$v_n = v_0 q^n = ' + puissTex(v0, a, 'n') + '$, et $u_n = v_n' + T.signed(l) + ' = ' + un.tex + '$.');
      sol.push('Comme $0 < ' + a.tex() + ' < 1$, $\\lim\\limits_{n \\to +\\infty} \\left(' + a.tex() + '\\right)^{n} = 0$, donc $\\lim\\limits_{n \\to +\\infty} u_n = ' + l.tex() + '$.');
      if (niveau === 3) {
        var k = v0.div(F(1).sub(a));
        var Ts = S(k) + '*(1-' + S(a) + '^(n+1))+' + S(l) + '*(n+1)';
        var Ttex = (k.equals(1) ? '' : k.equals(-1) ? '-' : T.num(k)) + '\\left(1 - \\left(' + a.tex() + '\\right)^{n+1}\\right)' + (l.isZero() ? '' : T.signed(l) + '(n + 1)');
        qs.push({ label: '$T_n = u_0 + u_1 + \\dots + u_n =$', type: 'expr', variable: 'n', reponse: Ts, reponseTex: Ttex, domaine: [0, 8] });
        var n0 = 0, av = Math.abs(v0.value());
        while (av * Math.pow(a.value(), n0) >= 0.01) n0++;
        qs.push({ label: 'Plus petit entier $n$ tel que $|u_n - \\ell| < 10^{-2}$ :', type: 'number', reponse: n0 });
        sol.push('$v_0 + v_1 + \\dots + v_n = v_0 \\times \\dfrac{1 - q^{n+1}}{1 - q} = ' + T.num(v0) + ' \\times \\dfrac{1 - \\left(' + a.tex() + '\\right)^{n+1}}{' + F(1).sub(a).tex() + '}$, et $u_k = v_k' + T.signed(l) + '$, donc $T_n = ' + Ttex + '$.');
        var seuil = Math.log(0.01 / av) / Math.log(a.value());
        sol.push('$|u_n - \\ell| = ' + T.num(Math.abs(v0.value())) + ' \\times \\left(' + a.tex() + '\\right)^{n} < 10^{-2} \\iff n\\ln\\left(' + a.tex() + '\\right) < \\ln\\left(\\dfrac{0{,}01}{' + T.num(Math.abs(v0.value())) + '}\\right) \\iff n > \\dfrac{\\ln(0{,}01/' + T.num(Math.abs(v0.value())) + ')}{\\ln(' + a.tex() + ')} \\approx ' + T.num(rd(seuil, 2)) + '$ (on divise par $\\ln\\left(' + a.tex() + '\\right) < 0$).');
        sol.push('Le plus petit entier qui convient est $n = ' + n0 + '$.');
        controle(n0 > seuil && n0 - 1 <= seuil + 1e-9, 'suite seuil');
        controle(proche(fn(Ts, 'n')(3), [0, 1, 2, 3].reduce(function (acc, j) { return acc + fn(un.s, 'n')(j); }, 0)), 'suite somme');
      }
      controle(proche(fn(un.s, 'n')(2), a.mul(a.mul(u0).add(b)).add(b).value()), 'suite terme');
      return {
        enonce: 'On considère la suite $(u_n)$ définie par $u_0 = ' + T.num(u0) + '$ et, pour tout entier naturel $n$, $' + rec + '$.<br>' +
          (niveau === 1 ? 'On pose $v_n = u_n' + T.signed(l.neg()) + '$. Montrer que $(v_n)$ est une suite géométrique, préciser sa raison et son premier terme, puis exprimer $u_n$ en fonction de $n$ et en déduire la limite de $(u_n)$.'
            : 'Déterminer le réel $\\ell$ tel que la suite $(v_n)$ définie par $v_n = u_n - \\ell$ soit géométrique. Préciser sa raison et son premier terme, exprimer $u_n$ en fonction de $n$ et en déduire la limite de $(u_n)$.' +
            (niveau === 3 ? ' Calculer $T_n = u_0 + u_1 + \\dots + u_n$ en fonction de $n$, puis déterminer le plus petit entier $n$ tel que $|u_n - \\ell| < 10^{-2}$.' : '')),
        questions: qs,
        indices: ['Exprime $v_{n+1}$ en fonction de $u_n$, puis de $v_n$.', 'Pour une suite géométrique : $v_n = v_0 q^n$ ; si $0 < q < 1$, $q^n \\to 0$.'],
        solution: sol,
        aide: 'Pour $u_n$, écris par exemple 3*(1/2)^n + 4.'
      };
    }
  });

  EM.gen.register({
    id: 'ts-suites-somme',
    titre: 'Suites arithmétiques et géométriques : terme général et somme',
    chapitres: ['tl-suites', 'ts-suites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var nom = rng.pick(FILLES);
      if (niveau === 1) {
        var U = rng.pick([2000, 2500, 3000, 5000]), r = rng.pick([250, 500, 1000]), N = rng.pick([10, 12, 15, 24]);
        var uN = U + (N - 1) * r, SN = N * (U + uN) / 2;
        return {
          enonce: nom + ' veut acheter un ordinateur pour ses études. Le premier mois, elle dépose $' + T.num(U) + '$ F CFA dans une tirelire ; chaque mois suivant, elle dépose $' + T.num(r) + '$ F CFA de plus que le mois précédent. On note $u_n$ le dépôt du $n$-ième mois ($u_1 = ' + T.num(U) + '$).<br>' +
            'Exprimer $u_n$ en fonction de $n$, calculer $u_{' + N + '}$ puis la somme totale $S = u_1 + u_2 + \\dots + u_{' + N + '}$ épargnée au bout de ' + N + ' mois.',
          questions: [
            { label: '$u_n =$', type: 'expr', variable: 'n', reponse: polyS([r, U - r], 'n'), reponseTex: T.num(r) + 'n + ' + T.num(U - r), domaine: [1, 20] },
            { label: '$u_{' + N + '} =$', type: 'number', reponse: uN, unite: 'F CFA' },
            { label: '$S =$', type: 'number', reponse: SN, unite: 'F CFA' }
          ],
          indices: ['$(u_n)$ est arithmétique de raison $r = ' + T.num(r) + '$ : $u_n = u_1 + (n - 1)r$.', 'Somme de termes consécutifs : $S = \\text{nombre de termes} \\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$.'],
          solution: [
            'Chaque dépôt s\'obtient en ajoutant $' + T.num(r) + '$ au précédent : $(u_n)$ est arithmétique de raison $r = ' + T.num(r) + '$ et de premier terme $u_1 = ' + T.num(U) + '$.',
            '$u_n = u_1 + (n - 1)r = ' + T.num(U) + ' + ' + T.num(r) + '(n - 1) = ' + T.num(r) + 'n + ' + T.num(U - r) + '$.',
            '$u_{' + N + '} = ' + T.num(U) + ' + ' + T.num(r) + ' \\times ' + (N - 1) + ' = ' + T.num(uN) + '$ F CFA.',
            '$S = ' + N + ' \\times \\dfrac{u_1 + u_{' + N + '}}{2} = ' + N + ' \\times \\dfrac{' + T.num(U) + ' + ' + T.num(uN) + '}{2} = ' + T.num(SN) + '$ F CFA.'
          ]
        };
      }
      if (rng.bool()) {
        var P0 = rng.pick([12000, 25000, 40000, 60000]), t = rng.pick([2, 3, 4, 5]), q = rd(1 + t / 100, 2), K = rng.pick([10, 15, 20]);
        var cible = rng.pick([1.5, 2]);
        var pK = P0 * Math.pow(q, K), n0 = 0;
        while (Math.pow(q, n0) <= cible) n0++;
        var ville = rng.pick(['Mbour', 'Kaolack', 'Ziguinchor', 'Touba', 'Tambacounda', 'Saint-Louis']);
        return {
          enonce: 'En 2025, une commune de la région de ' + ville + ' compte $' + T.num(P0) + '$ habitants. On estime que sa population augmente de ' + t + ' % par an. On note $p_n$ la population en $2025 + n$ ($p_0 = ' + T.num(P0) + '$).<br>' +
            'Préciser la nature de $(p_n)$ et sa raison, exprimer $p_n$ en fonction de $n$, estimer la population en ' + (2025 + K) + ' (arrondie à l\'unité) et déterminer à partir de quelle année la population aura dépassé ' + (cible === 2 ? 'le double' : 'une fois et demie') + ' de celle de 2025.',
          questions: [
            { label: 'Raison $q =$', type: 'number', reponse: q },
            { label: '$p_n =$', type: 'expr', variable: 'n', reponse: P0 + '*' + q + '^n', reponseTex: T.num(P0) + ' \\times ' + T.num(q) + '^{n}', domaine: [0, 12] },
            { label: 'Population en ' + (2025 + K) + ' :', type: 'number', reponse: Math.round(pK), tol: 1 },
            { label: 'Première année :', type: 'number', reponse: 2025 + n0 }
          ],
          indices: ['Augmenter de ' + t + ' % revient à multiplier par $1 + \\dfrac{' + t + '}{100} = ' + T.num(q) + '$.', 'Pour le seuil, résous $' + T.num(q) + '^{n} > ' + T.num(cible) + '$ avec le logarithme népérien.'],
          solution: [
            '$p_{n+1} = p_n + \\dfrac{' + t + '}{100}p_n = ' + T.num(q) + 'p_n$ : $(p_n)$ est géométrique de raison $q = ' + T.num(q) + '$ et de premier terme $p_0 = ' + T.num(P0) + '$.',
            '$p_n = p_0 q^n = ' + T.num(P0) + ' \\times ' + T.num(q) + '^{n}$.',
            'En ' + (2025 + K) + ' : $p_{' + K + '} = ' + T.num(P0) + ' \\times ' + T.num(q) + '^{' + K + '} \\approx ' + T.num(Math.round(pK)) + '$ habitants.',
            '$p_n > ' + T.num(cible) + 'p_0 \\iff ' + T.num(q) + '^{n} > ' + T.num(cible) + ' \\iff n\\ln(' + T.num(q) + ') > \\ln(' + T.num(cible) + ') \\iff n > \\dfrac{\\ln(' + T.num(cible) + ')}{\\ln(' + T.num(q) + ')} \\approx ' + T.num(rd(Math.log(cible) / Math.log(q), 2)) + '$.',
            'Le plus petit entier est $n = ' + n0 + '$ : c\'est en ' + (2025 + n0) + '.'
          ]
        };
      }
      var u0 = rng.pick([5, 10, 20, 50]), qq = rng.pick([2, 3]), Nn = rng.pick([5, 6, 7, 8]);
      if (qq === 3 && Nn > 6) Nn = 6;
      var uk = u0 * Math.pow(qq, Nn), som = u0 * (Math.pow(qq, Nn + 1) - 1) / (qq - 1);
      return {
        enonce: 'À Thiès, un message de sensibilisation contre le paludisme circule sur les téléphones. Le jour 0, $' + u0 + '$ personnes le reçoivent ; chaque jour, le nombre de nouveaux destinataires est multiplié par $' + qq + '$. On note $u_n$ le nombre de nouveaux destinataires le jour $n$.<br>Exprimer $u_n$ en fonction de $n$, calculer $u_{' + Nn + '}$ puis le nombre total $S = u_0 + u_1 + \\dots + u_{' + Nn + '}$ de personnes ayant reçu le message.',
        questions: [
          { label: '$u_n =$', type: 'expr', variable: 'n', reponse: u0 + '*' + qq + '^n', reponseTex: T.num(u0) + ' \\times ' + qq + '^{n}', domaine: [0, 8] },
          { label: '$u_{' + Nn + '} =$', type: 'number', reponse: uk },
          { label: '$S =$', type: 'number', reponse: som }
        ],
        indices: ['$u_n = u_0 q^n$.', 'Somme de $N$ termes consécutifs d\'une suite géométrique : $\\text{premier terme} \\times \\dfrac{1 - q^{N}}{1 - q}$.'],
        solution: [
          '$(u_n)$ est géométrique de raison $q = ' + qq + '$ et de premier terme $u_0 = ' + u0 + '$ : $u_n = u_0 q^n = ' + T.num(u0) + ' \\times ' + qq + '^{n}$.',
          '$u_{' + Nn + '} = ' + T.num(u0) + ' \\times ' + qq + '^{' + Nn + '} = ' + T.num(uk) + '$.',
          'La somme comporte $' + (Nn + 1) + '$ termes : $S = u_0 \\times \\dfrac{1 - q^{' + (Nn + 1) + '}}{1 - q} = ' + T.num(u0) + ' \\times \\dfrac{1 - ' + qq + '^{' + (Nn + 1) + '}}{1 - ' + qq + '} = ' + T.num(som) + '$.'
        ]
      };
    }
  });

  /* ================================================================== */
  /* Primitives et intégrales                                            */
  /* ================================================================== */
  function trig(f, k) { return '\\' + f + (k === 1 ? ' x' : '(' + k + 'x)'); }
  var PRIM = {
    2: [
      function (rng) {
        var a = rng.nz(-4, 4), b = rng.nz(-3, 3), y0 = rng.int(-4, 4), K = y0 - b + a;
        return { I: ']0 \\,;\\, +\\infty[', f: T.num(b) + dfr(a, 'x^2'), fs: S(b) + '+' + S(a) + '/x^2', x0: 1, y0: y0,
          F: T.mono(b, 'x', true) + dfr(-a, 'x') + (K ? T.signed(K) : ''), Fs: S(b) + '*x-' + S(a) + '/x+' + S(K),
          sol: ['Une primitive de $\\dfrac{1}{x^2}$ est $-\\dfrac{1}{x}$, donc $F(x) = ' + T.mono(b, 'x', true) + dfr(-a, 'x') + ' + C$ ($C$ réel).',
            '$F(1) = ' + T.num(b) + T.signed(-a) + ' + C = ' + y0 + '$ donne $C = ' + K + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), k = rng.pick([2, -1, 3, -2]), y0 = rng.int(-3, 4), c = F(a, k), K = F(y0).sub(c);
        return { I: '\\R', f: T.mono(a, eTex(k), true), fs: S(a) + '*e^(' + S(k) + '*x)', x0: 0, y0: y0,
          F: T.mono(c, eTex(k), true) + (K.isZero() ? '' : T.signed(K)), Fs: S(c) + '*e^(' + S(k) + '*x)+' + S(K),
          sol: ['Une primitive de $e^{kx}$ est $\\dfrac{1}{k}e^{kx}$, donc $F(x) = ' + T.mono(c, eTex(k), true) + ' + C$ ($C$ réel).',
            '$F(0) = ' + c.tex() + ' + C = ' + y0 + '$ donne $C = ' + K.tex() + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), p = rng.int(1, 4), y0 = rng.int(-3, 4);
        return { I: ']' + (-p) + ' \\,;\\, +\\infty[', f: '\\dfrac{' + a + '}{x + ' + p + '}', fs: S(a) + '/(x+' + p + ')', x0: 1 - p, y0: y0,
          F: T.mono(a, '\\ln(x + ' + p + ')', true) + (y0 ? T.signed(y0) : ''), Fs: S(a) + '*ln(x+' + p + ')+' + S(y0),
          sol: ['Sur $]' + (-p) + ' \\,;\\, +\\infty[$, $x + ' + p + ' > 0$ : une primitive de $\\dfrac{u\'}{u}$ est $\\ln u$, donc $F(x) = ' + T.mono(a, '\\ln(x + ' + p + ')', true) + ' + C$.',
            '$F(' + (1 - p) + ') = ' + T.num(a) + '\\ln 1 + C = C = ' + y0 + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), k = rng.int(1, 3), y0 = rng.int(-3, 3), c = F(a, k);
        if (rng.bool()) {
          return { I: '\\R', f: T.mono(a, trig('cos', k), true), fs: S(a) + '*cos(' + k + '*x)', x0: 0, y0: y0,
            F: T.mono(c, trig('sin', k), true) + (y0 ? T.signed(y0) : ''), Fs: S(c) + '*sin(' + k + '*x)+' + S(y0),
            sol: ['Une primitive de $\\cos(kx)$ est $\\dfrac{1}{k}\\sin(kx)$ : $F(x) = ' + T.mono(c, trig('sin', k), true) + ' + C$.',
              '$F(0) = 0 + C = ' + y0 + '$ car $\\sin 0 = 0$.'] };
        }
        var K = F(y0).add(c);
        return { I: '\\R', f: T.mono(a, trig('sin', k), true), fs: S(a) + '*sin(' + k + '*x)', x0: 0, y0: y0,
          F: T.mono(c.neg(), trig('cos', k), true) + (K.isZero() ? '' : T.signed(K)), Fs: S(c.neg()) + '*cos(' + k + '*x)+' + S(K),
          sol: ['Une primitive de $\\sin(kx)$ est $-\\dfrac{1}{k}\\cos(kx)$ : $F(x) = ' + T.mono(c.neg(), trig('cos', k), true) + ' + C$.',
            '$F(0) = ' + c.neg().tex() + ' + C = ' + y0 + '$ (car $\\cos 0 = 1$) donne $C = ' + K.tex() + '$.'] };
      }
    ],
    3: [
      function (rng) {
        var b = rng.int(-3, 3), c = rng.int(-2, 2), y0 = rng.int(-3, 3), trin = T.poly([1, b, c]), K = F(y0).sub(F(c * c * c, 3));
        return { I: '\\R', f: '(' + T.poly([2, b]) + ')(' + trin + ')^2', fs: polyS([2, b]) + '*' + polyS([1, b, c]) + '^2', x0: 0, y0: y0,
          F: '\\dfrac{1}{3}\\left(' + trin + '\\right)^3' + (K.isZero() ? '' : T.signed(K)), Fs: polyS([1, b, c]) + '^3/3+' + S(K),
          sol: ['On reconnaît la forme $u\'u^2$ avec $u(x) = ' + trin + '$ : une primitive est $\\dfrac{u^3}{3}$.',
            '$F(x) = \\dfrac{1}{3}\\left(' + trin + '\\right)^3 + k$ et $F(0) = ' + F(c * c * c, 3).tex() + ' + C = ' + y0 + '$ donne $C = ' + K.tex() + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), y0 = rng.int(-3, 3), c = F(a, 2);
        return { I: '\\R', f: '\\dfrac{' + T.mono(a, 'x', true) + '}{x^2 + 1}', fs: S(a) + '*x/(x^2+1)', x0: 0, y0: y0,
          F: T.mono(c, '\\ln(x^2 + 1)', true) + (y0 ? T.signed(y0) : ''), Fs: S(c) + '*ln(x^2+1)+' + S(y0),
          sol: ['$f(x) = ' + coefTex(c) + '\\dfrac{2x}{x^2 + 1}$ : forme $\\dfrac{u\'}{u}$ avec $u(x) = x^2 + 1 > 0$.',
            '$F(x) = ' + T.mono(c, '\\ln(x^2 + 1)', true) + ' + C$ et $F(0) = C = ' + y0 + '$ car $\\ln 1 = 0$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), y0 = rng.int(-3, 3), c = F(a, 2), K = F(y0).sub(c);
        return { I: '\\R', f: T.mono(a, 'xe^{x^2}', true), fs: S(a) + '*x*e^(x^2)', x0: 0, y0: y0,
          F: T.mono(c, 'e^{x^2}', true) + (K.isZero() ? '' : T.signed(K)), Fs: S(c) + '*e^(x^2)+' + S(K),
          sol: ['$f(x) = ' + coefTex(c) + '\\left(2xe^{x^2}\\right)$ : forme $u\'e^{u}$ avec $u(x) = x^2$, de primitive $e^{u}$.',
            '$F(x) = ' + T.mono(c, 'e^{x^2}', true) + ' + C$ et $F(0) = ' + c.tex() + ' + C = ' + y0 + '$ donne $C = ' + K.tex() + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), y0 = rng.int(-3, 3), c = F(a, 2);
        return { I: ']0 \\,;\\, +\\infty[', f: '\\dfrac{' + T.mono(a, '\\ln x', true) + '}{x}', fs: S(a) + '*ln(x)/x', x0: 1, y0: y0,
          F: T.mono(c, '(\\ln x)^2', true) + (y0 ? T.signed(y0) : ''), Fs: S(c) + '*ln(x)^2+' + S(y0),
          sol: ['$\\dfrac{\\ln x}{x} = u\'u$ avec $u(x) = \\ln x$ : une primitive est $\\dfrac{u^2}{2} = \\dfrac{(\\ln x)^2}{2}$.',
            '$F(x) = ' + T.mono(c, '(\\ln x)^2', true) + ' + C$ et $F(1) = C = ' + y0 + '$ car $\\ln 1 = 0$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-primitive-condition',
    titre: 'Déterminer la primitive qui prend une valeur donnée',
    chapitres: ['ts-primitives'],
    niveaux: 3,
    gen: function (rng, niveau) {
      var t;
      if (niveau === 1) {
        var a = rng.nz(-4, 4), b = rng.int(-5, 5), c = rng.int(-5, 5), x0 = rng.pick([0, 1, -1, 2]), y0 = rng.int(-5, 5);
        var Fc = [F(a, 3), F(b, 2), F(c), F(0)];
        var K = F(y0).sub(evalPoly(Fc, x0));
        Fc[3] = K;
        t = { I: '\\R', f: T.poly([a, b, c]), fs: polyS([a, b, c]), x0: x0, y0: y0, F: T.poly(Fc), Fs: polyS(Fc),
          sol: ['Une primitive de $x^n$ est $\\dfrac{x^{n+1}}{n+1}$ : $F(x) = ' + T.poly([F(a, 3), F(b, 2), F(c), F(0)]) + ' + C$.',
            '$F(' + x0 + ') = ' + evalPoly([F(a, 3), F(b, 2), F(c), F(0)], x0).tex() + ' + C = ' + y0 + '$ donne $C = ' + K.tex() + '$.'] };
      } else t = rng.pick(PRIM[niveau])(rng);
      controle(deriveOK(t.Fs, t.fs, 0.6, 2), 'primitive ' + t.Fs + ' / ' + t.fs);
      controle(proche(fn(t.Fs)(t.x0), t.y0), 'primitive condition ' + t.Fs);
      var sol = t.sol.slice();
      sol.push('Donc $F(x) = ' + t.F + '$.');
      return {
        enonce: 'Soit $f$ la fonction définie sur $' + t.I + '$ par $f(x) = ' + t.f + '$. Déterminer la primitive $F$ de $f$ sur $' + t.I + '$ qui vérifie $F(' + t.x0 + ') = ' + t.y0 + '$.',
        questions: [{ label: '$F(x) =$', type: 'expr', reponse: t.Fs, reponseTex: t.F, domaine: [0.6, 2] }],
        indices: ['Cherche d\'abord une primitive (formules : $u\'u^n$, $\\dfrac{u\'}{u}$, $u\'e^{u}$…), puis ajoute une constante $C$.', 'Détermine $C$ grâce à la condition $F(' + t.x0 + ') = ' + t.y0 + '$.'],
        solution: sol,
        aide: 'Écris par exemple x^3/3 - 2x + 1, 2ln(x+1) - 3, e^(2x)/2 + 1…'
      };
    }
  });

  var INTG = {
    2: [
      function (rng) {
        var k = rng.pick([1, 2, -1, 3]), m = rng.pick([1, 2]), km = k * m;
        var tex = k === 1 ? eVal(1, m).tex + ' - 1' : k === -1 ? '1 - ' + eVal(1, -m).tex : '\\dfrac{' + eVal(1, km).tex + ' - 1}{' + k + '}';
        return { I: '\\displaystyle\\int_0^{' + m + '} ' + eTex(k) + '\\,dx', fs: 'e^(' + k + '*x)', a: 0, b: m, s: '(e^(' + km + ')-1)/' + S(k), tex: tex,
          sol: ['Une primitive de $' + eTex(k) + '$ est $' + (k === 1 ? 'e^{x}' : T.mono(F(1, k), eTex(k), true)) + '$.',
            '$I = \\left[' + (k === 1 ? 'e^{x}' : T.mono(F(1, k), eTex(k), true)) + '\\right]_0^{' + m + '} = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 5), N = rng.pick([2, 3, 5, 7]);
        return { I: '\\displaystyle\\int_1^{' + N + '} \\dfrac{' + a + '}{x}\\,dx', fs: S(a) + '/x', a: 1, b: N, s: S(a) + '*ln(' + N + ')', tex: T.mono(a, '\\ln ' + N, true),
          sol: ['Sur $[1 \\,;\\, ' + N + ']$, une primitive de $\\dfrac{' + a + '}{x}$ est $' + T.mono(a, '\\ln x', true) + '$.',
            '$I = \\left[' + T.mono(a, '\\ln x', true) + '\\right]_1^{' + N + '} = ' + T.mono(a, '\\ln ' + N, true) + T.mono(-a, '\\ln 1', false) + ' = ' + T.mono(a, '\\ln ' + N, true) + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 5), p = rng.int(1, 3);
        var lnq = p === 1 ? '\\ln 2' : '\\ln\\dfrac{' + (p + 1) + '}{' + p + '}';
        return { I: '\\displaystyle\\int_0^{1} \\dfrac{' + a + '}{x + ' + p + '}\\,dx', fs: S(a) + '/(x+' + p + ')', a: 0, b: 1, s: S(a) + '*ln(' + (p + 1) + '/' + p + ')', tex: T.mono(a, lnq, true),
          sol: ['Sur $[0 \\,;\\, 1]$, $x + ' + p + ' > 0$ et une primitive de $\\dfrac{' + a + '}{x + ' + p + '}$ est $' + T.mono(a, '\\ln(x + ' + p + ')', true) + '$.',
            '$I = ' + T.num(a) + '\\left(\\ln ' + (p + 1) + ' - \\ln ' + p + '\\right) = ' + T.mono(a, lnq, true) + '$.'] };
      }
    ],
    3: [
      function (rng) {
        var a = rng.nz(-4, 4), c = F(a, 2);
        return { I: '\\displaystyle\\int_0^{1} \\dfrac{' + T.mono(a, 'x', true) + '}{x^2 + 1}\\,dx', fs: S(a) + '*x/(x^2+1)', a: 0, b: 1, s: S(c) + '*ln(2)', tex: T.mono(c, '\\ln 2', true),
          sol: ['$\\dfrac{' + T.mono(a, 'x', true) + '}{x^2 + 1} = ' + coefTex(c) + '\\dfrac{2x}{x^2 + 1}$ : forme $\\dfrac{u\'}{u}$, de primitive $' + T.mono(c, '\\ln(x^2 + 1)', true) + '$.',
            '$I = ' + coefTex(c) + '\\left(\\ln 2 - \\ln 1\\right) = ' + T.mono(c, '\\ln 2', true) + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), c = F(a, 2);
        var tex = c.equals(1) ? 'e - 1' : c.d === 1 ? (c.equals(-1) ? '1 - e' : T.num(c) + '(e - 1)') : (c.n < 0 ? '-' : '') + '\\dfrac{' + (Math.abs(c.n) === 1 ? '' : Math.abs(c.n)) + (Math.abs(c.n) === 1 ? 'e - 1' : '(e - 1)') + '}{' + c.d + '}';
        return { I: '\\displaystyle\\int_0^{1} ' + ig(T.mono(a, 'xe^{x^2}', true)) + '\\,dx', fs: S(a) + '*x*e^(x^2)', a: 0, b: 1, s: S(c) + '*(e-1)', tex: tex,
          sol: ['$' + T.mono(a, 'xe^{x^2}', true) + ' = ' + coefTex(c) + '\\left(2xe^{x^2}\\right)$ : forme $u\'e^{u}$ avec $u(x) = x^2$, de primitive $' + T.mono(c, 'e^{x^2}', true) + '$.',
            '$I = ' + coefTex(c) + '\\left(e^{1} - e^{0}\\right) = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-4, 4), m = rng.pick([1, 2, 3]), res = F(a * m * m, 2);
        return { I: '\\displaystyle\\int_1^{' + eVal(1, m).tex + '} \\dfrac{' + T.mono(a, '\\ln x', true) + '}{x}\\,dx', fs: S(a) + '*ln(x)/x', a: 1, b: Math.exp(m), s: S(res), tex: res.tex(),
          sol: ['$\\dfrac{\\ln x}{x} = u\'u$ avec $u = \\ln x$ : une primitive de $\\dfrac{' + T.mono(a, '\\ln x', true) + '}{x}$ est $' + T.mono(F(a, 2), '(\\ln x)^2', true) + '$.',
            '$I = ' + coefTex(F(a, 2)) + '\\left[(\\ln x)^2\\right]_1^{' + eVal(1, m).tex + '} = ' + coefTex(F(a, 2)) + '\\left(' + m + '^2 - 0\\right) = ' + res.tex() + '$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-integrale-exacte',
    titre: 'Calculer une intégrale (valeur exacte)',
    chapitres: ['ts-integrales', 'ts-primitives'],
    niveaux: 3,
    gen: function (rng, niveau) {
      var t, qs, extra = [];
      if (niveau === 1) {
        var a = rng.nz(-3, 3), b = rng.int(-4, 4), c = rng.int(-5, 5), lo = rng.int(-2, 1), hi = lo + rng.int(1, 3);
        var P = [F(a, 3), F(b, 2), F(c), F(0)];
        var I = evalPoly(P, hi).sub(evalPoly(P, lo)), mu = I.div(hi - lo);
        t = { I: '\\displaystyle\\int_{' + lo + '}^{' + hi + '} (' + T.poly([a, b, c]) + ')\\,dx', fs: polyS([a, b, c]), a: lo, b: hi, s: S(I), tex: I.tex(),
          sol: ['Une primitive de $x \\mapsto ' + T.poly([a, b, c]) + '$ est $G(x) = ' + T.poly(P) + '$.',
            '$I = G(' + hi + ') - G(' + lo + ') = ' + evalPoly(P, hi).tex() + ' - ' + T.par(evalPoly(P, lo)) + ' = ' + I.tex() + '$.'] };
        extra.push({ label: 'Valeur moyenne $\\mu =$', type: 'number', reponse: mu });
        t.sol.push('La valeur moyenne de la fonction sur $[' + lo + ' \\,;\\, ' + hi + ']$ est $\\mu = \\dfrac{1}{' + hi + ' - ' + T.par(lo) + '}I = ' + mu.tex() + '$.');
      } else t = rng.pick(INTG[niveau])(rng);
      controle(proche(val(t.s), simpson(fn(t.fs), t.a, t.b), 1e-6), 'integrale ' + t.s + ' / ' + t.fs);
      qs = [{ label: '$I =$', type: 'number', reponse: t.s, reponseTex: t.tex }].concat(extra);
      return {
        enonce: 'Calculer la valeur exacte de $I = ' + t.I + '$.' + (niveau === 1 ? ' En déduire la valeur moyenne de la fonction intégrée sur l\'intervalle d\'intégration.' : ''),
        questions: qs,
        indices: ['Cherche une primitive $G$ de la fonction intégrée.', '$\\displaystyle\\int_a^b f(x)\\,dx = G(b) - G(a)$.'],
        solution: t.sol,
        aide: AIDE_EXACT
      };
    }
  });

  var IPP = {
    1: [
      function (rng) {
        var a = rng.nz(-3, 3), b = rng.int(-3, 3);
        var tex = T.sum([{ c: b, v: 'e' }, { c: a - b }]);
        return { I: '\\displaystyle\\int_0^{1} ' + prod([a, b], 'e^{x}') + '\\,dx', fs: polyS([a, b]) + '*e^x', a: 0, b: 1, s: S(b) + '*e+' + S(a - b), tex: tex,
          sol: ['On pose $u(x) = ' + T.poly([a, b]) + '$ et $v\'(x) = e^{x}$ ; alors $u\'(x) = ' + a + '$ et $v(x) = e^{x}$.',
            '$I = \\left[(' + T.poly([a, b]) + ')e^{x}\\right]_0^1 - \\displaystyle\\int_0^1 ' + T.mono(a, 'e^{x}', true) + '\\,dx = ' + T.sum([{ c: a + b, v: 'e' }, { c: -b }]) + ' - ' + T.par(a) + '(e - 1)$.',
            'Donc $I = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 4), k = F(a, 4);
        var tex = k.d === 1 ? (k.equals(1) ? 'e^2 + 1' : k.equals(-1) ? '-(e^2 + 1)' : T.num(k) + '(e^2 + 1)') : (k.n < 0 ? '-' : '') + '\\dfrac{' + (Math.abs(k.n) === 1 ? 'e^2 + 1' : Math.abs(k.n) + '(e^2 + 1)') + '}{' + k.d + '}';
        return { I: '\\displaystyle\\int_1^{e} ' + ig(T.mono(a, 'x\\ln x', true)) + '\\,dx', fs: S(a) + '*x*ln(x)', a: 1, b: Math.E, s: S(k) + '*(e^2+1)', tex: tex,
          sol: ['On pose $u(x) = \\ln x$ et $v\'(x) = ' + T.mono(a, 'x', true) + '$ ; alors $u\'(x) = \\dfrac{1}{x}$ et $v(x) = ' + T.mono(F(a, 2), 'x^2', true) + '$.',
            '$I = \\left[' + T.mono(F(a, 2), 'x^2\\ln x', true) + '\\right]_1^{e} - \\displaystyle\\int_1^{e} ' + ig(T.mono(F(a, 2), 'x', true)) + '\\,dx = ' + T.mono(F(a, 2), 'e^2', true) + plus(T.mono(F(-a, 4), '\\left(e^2 - 1\\right)', true)) + '$.',
            'Donc $I = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 4);
        return { I: '\\displaystyle\\int_1^{e} ' + ig(T.mono(a, '\\ln x', true)) + '\\,dx', fs: S(a) + '*ln(x)', a: 1, b: Math.E, s: S(a), tex: T.num(a),
          sol: ['On pose $u(x) = \\ln x$ et $v\'(x) = 1$ ; alors $u\'(x) = \\dfrac{1}{x}$ et $v(x) = x$.',
            '$\\displaystyle\\int_1^{e} \\ln x\\,dx = \\left[x\\ln x\\right]_1^{e} - \\int_1^{e} 1\\,dx = e - (e - 1) = 1$.',
            'Donc $I = ' + T.num(a) + ' \\times 1 = ' + T.num(a) + '$.'] };
      }
    ],
    2: [
      function (rng) {
        var a = rng.nz(-3, 3), b = rng.int(-3, 3);
        var tex = T.sum([{ c: a + b }, { c: -(2 * a + b), v: 'e^{-1}' }]);
        return { I: '\\displaystyle\\int_0^{1} ' + prod([a, b], 'e^{-x}') + '\\,dx', fs: polyS([a, b]) + '*e^(-x)', a: 0, b: 1, s: S(a + b) + '-' + S(2 * a + b) + '*e^(-1)', tex: tex,
          sol: ['On pose $u(x) = ' + T.poly([a, b]) + '$ et $v\'(x) = e^{-x}$ ; alors $u\'(x) = ' + a + '$ et $v(x) = -e^{-x}$.',
            '$I = \\left[-(' + T.poly([a, b]) + ')e^{-x}\\right]_0^1 + \\displaystyle\\int_0^1 ' + T.mono(a, 'e^{-x}', true) + '\\,dx = ' + T.sum([{ c: -(a + b), v: 'e^{-1}' }, { c: b }]) + ' + ' + T.par(a) + '\\left(1 - e^{-1}\\right)$.',
            'Donc $I = ' + tex + '$.'] };
      },
      function (rng) {
        var a = rng.nz(-3, 3);
        if (rng.bool()) {
          return { I: '\\displaystyle\\int_0^{\\pi} ' + ig(T.mono(a, 'x\\sin x', true)) + '\\,dx', fs: S(a) + '*x*sin(x)', a: 0, b: Math.PI, s: S(a) + '*pi', tex: T.mono(a, '\\pi', true),
            sol: ['On pose $u(x) = x$ et $v\'(x) = \\sin x$ ; alors $u\'(x) = 1$ et $v(x) = -\\cos x$.',
              '$\\displaystyle\\int_0^{\\pi} x\\sin x\\,dx = \\left[-x\\cos x\\right]_0^{\\pi} + \\int_0^{\\pi} \\cos x\\,dx = \\pi + \\left[\\sin x\\right]_0^{\\pi} = \\pi$.',
              'Donc $I = ' + T.mono(a, '\\pi', true) + '$.'] };
        }
        var tex2 = a === 1 ? '\\dfrac{\\pi}{2} - 1' : a === -1 ? '1 - \\dfrac{\\pi}{2}' : T.num(a) + '\\left(\\dfrac{\\pi}{2} - 1\\right)';
        return { I: '\\displaystyle\\int_0^{\\frac{\\pi}{2}} ' + ig(T.mono(a, 'x\\cos x', true)) + '\\,dx', fs: S(a) + '*x*cos(x)', a: 0, b: Math.PI / 2, s: S(a) + '*(pi/2-1)', tex: tex2,
          sol: ['On pose $u(x) = x$ et $v\'(x) = \\cos x$ ; alors $u\'(x) = 1$ et $v(x) = \\sin x$.',
            '$\\displaystyle\\int_0^{\\frac{\\pi}{2}} x\\cos x\\,dx = \\left[x\\sin x\\right]_0^{\\frac{\\pi}{2}} - \\int_0^{\\frac{\\pi}{2}} \\sin x\\,dx = \\dfrac{\\pi}{2} - \\left[-\\cos x\\right]_0^{\\frac{\\pi}{2}} = \\dfrac{\\pi}{2} - 1$.',
            'Donc $I = ' + tex2 + '$.'] };
      },
      function () {
        return { I: '\\displaystyle\\int_1^{e} x^2\\ln x\\,dx', fs: 'x^2*ln(x)', a: 1, b: Math.E, s: '(2*e^3+1)/9', tex: '\\dfrac{2e^3 + 1}{9}',
          sol: ['On pose $u(x) = \\ln x$ et $v\'(x) = x^2$ ; alors $u\'(x) = \\dfrac{1}{x}$ et $v(x) = \\dfrac{x^3}{3}$.',
            '$I = \\left[\\dfrac{x^3}{3}\\ln x\\right]_1^{e} - \\displaystyle\\int_1^{e} \\dfrac{x^2}{3}\\,dx = \\dfrac{e^3}{3} - \\dfrac{e^3 - 1}{9}$.',
            'Donc $I = \\dfrac{3e^3 - e^3 + 1}{9} = \\dfrac{2e^3 + 1}{9}$.'] };
      }
    ]
  };

  EM.gen.register({
    id: 'ts-integration-parties',
    titre: 'Intégration par parties',
    chapitres: ['ts-integrales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var t = rng.pick(IPP[niveau])(rng);
      controle(proche(val(t.s), simpson(fn(t.fs), t.a, t.b), 1e-6), 'ipp ' + t.s);
      var sol = ['Formule d\'intégration par parties : $\\displaystyle\\int_a^b u(x)v\'(x)\\,dx = \\left[u(x)v(x)\\right]_a^b - \\int_a^b u\'(x)v(x)\\,dx$.'].concat(t.sol);
      return {
        enonce: 'À l\'aide d\'une intégration par parties, calculer la valeur exacte de $I = ' + t.I + '$.',
        questions: [{ label: '$I =$', type: 'number', reponse: t.s, reponseTex: t.tex }],
        indices: ['Dérive le facteur qui se simplifie (polynôme ou $\\ln x$) et intègre l\'autre.', '$\\displaystyle\\int_a^b uv\' = [uv]_a^b - \\int_a^b u\'v$.'],
        solution: sol,
        aide: AIDE_EXACT
      };
    }
  });

  /* ---------- aires ---------- */
  EM.gen.register({
    id: 'ts-aire-courbes',
    titre: 'Calculer une aire avec une intégrale',
    chapitres: ['ts-integrales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var unite = rng.pick([[1, 1], [2, 2], [2, 1], [1, 2]]), ua = unite[0] * unite[1];
      var uniteTxt = 'L\'unité graphique est de ' + unite[0] + ' cm sur l\'axe des abscisses et ' + unite[1] + ' cm sur l\'axe des ordonnées.';
      if (niveau === 1) {
        var a = rng.pick([1, 1, 2]), r = rng.int(-2, 1), s = r + rng.int(2, 3), m = rng.int(-1, 1), p = rng.int(-1, 2);
        var fc = [-a, a * (r + s) + m, p - a * r * s], gc = [m, p];
        var A = F(a * Math.pow(s - r, 3), 6);
        var ff = function (x) { return fc[0] * x * x + fc[1] * x + fc[2]; }, gg = function (x) { return m * x + p; };
        controle(proche(A.value(), simpson(function (x) { return ff(x) - gg(x); }, r, s)), 'aire parabole');
        var lo = Math.min(gg(r - 1), gg(s + 1), ff(r - 1), ff(s + 1), 0), hi = Math.max(ff((r + s) / 2), gg(r - 1), gg(s + 1), 0);
        var fig = EM.fig.create({ w: 300, h: 220, xmin: r - 1.5, xmax: s + 1.5, ymin: Math.floor(lo) - 1, ymax: Math.ceil(hi) + 1, title: 'Aire entre deux courbes' });
        var pts = [];
        for (var i = 0; i <= 30; i++) { var x = r + (s - r) * i / 30; pts.push([x, ff(x)]); }
        for (var j = 30; j >= 0; j--) { var x2 = r + (s - r) * j / 30; pts.push([x2, gg(x2)]); }
        fig.poly(pts, { fill: true, light: true });
        fig.axes({ step: 1, labelStep: Math.max(1, Math.ceil((hi - lo) / 8)) });
        fig.curve(ff, { accent: true });
        fig.curve(gg);
        var gTex = m === 0 && p === 0 ? '0' : T.poly(gc);
        return {
          enonce: 'Soient $f$ et $g$ les fonctions définies sur $\\R$ par $f(x) = ' + T.poly(fc) + '$ et $g(x) = ' + gTex + '$. ' + uniteTxt + '<br>' +
            'Étudier la position relative des deux courbes, puis calculer l\'aire $\\mathcal{A}$ du domaine compris entre elles, en unités d\'aire puis en $\\text{cm}^2$.',
          figure: fig.svg(),
          questions: [
            { label: '$\\mathcal{A} =$', type: 'number', reponse: A, unite: 'u.a.' },
            { label: '$\\mathcal{A} =$', type: 'number', reponse: A.mul(ua), unite: 'cm²' }
          ],
          indices: ['Factorise $f(x) - g(x)$ pour trouver les abscisses des points d\'intersection et le signe.', 'L\'aire vaut $\\displaystyle\\int_a^b [f(x) - g(x)]\\,dx$ lorsque $f \\geq g$ sur $[a \\,;\\, b]$ ; 1 u.a. $= ' + unite[0] + ' \\times ' + unite[1] + '$ cm².'],
          solution: [
            '$f(x) - g(x) = ' + T.poly([-a, a * (r + s), -a * r * s]) + ' = ' + kv(-a, T.xMinus(r) + T.xMinus(s)) + '$.',
            'Les courbes se coupent en $x = ' + r + '$ et $x = ' + s + '$ ; sur $[' + r + ' \\,;\\, ' + s + ']$, $f(x) - g(x) \\geq 0$ : la courbe de $f$ est au-dessus.',
            '$\\mathcal{A} = \\displaystyle\\int_{' + r + '}^{' + s + '} (' + T.poly([-a, a * (r + s), -a * r * s]) + ')\\,dx = \\left[' + T.poly([F(-a, 3), F(a * (r + s), 2), F(-a * r * s), 0]) + '\\right]_{' + r + '}^{' + s + '} = ' + A.tex() + '$ u.a.',
            '1 u.a. $= ' + unite[0] + ' \\times ' + unite[1] + ' = ' + ua + '$ cm², donc $\\mathcal{A} = ' + A.mul(ua).tex() + '$ cm².'
          ]
        };
      }
      var cas = rng.pick(['exp', 'ln', 'asy']), t;
      if (cas === 'exp') {
        var mm = rng.pick([1, 2]), cst = F(1 + mm).add(F(mm * mm, 2));
        t = { enonce: 'Soit $f(x) = e^{x}$ et $(D)$ la droite d\'équation $y = x + 1$. On admet que $e^{x} \\geq x + 1$ pour tout réel $x$. Calculer l\'aire $\\mathcal{A}$ du domaine limité par la courbe de $f$, la droite $(D)$ et les droites d\'équations $x = 0$ et $x = ' + mm + '$.',
          s: 'e^(' + mm + ')-' + S(cst), tex: eVal(1, mm).tex + ' - ' + cst.tex(), fs: 'e^x-x-1', a: 0, b: mm,
          sol: ['Sur $[0 \\,;\\, ' + mm + ']$, $e^{x} - (x + 1) \\geq 0$, donc $\\mathcal{A} = \\displaystyle\\int_0^{' + mm + '} \\left(e^{x} - x - 1\\right)dx$ u.a.',
            '$\\mathcal{A} = \\left[e^{x} - \\dfrac{x^2}{2} - x\\right]_0^{' + mm + '} = ' + eVal(1, mm).tex + ' - ' + F(mm * mm, 2).tex() + ' - ' + mm + ' - 1 = ' + eVal(1, mm).tex + ' - ' + cst.tex() + '$ u.a.'] };
      } else if (cas === 'ln') {
        var c = rng.int(1, 3), b = rng.int(-2, 2), k = rng.pick([1, 2]), res = F(c * k * k, 2);
        var dr = T.poly([1, b]);
        t = { enonce: 'Soit $f$ la fonction définie sur $]0 \\,;\\, +\\infty[$ par $f(x) = ' + dr + ' + ' + (c === 1 ? '' : c) + '\\dfrac{\\ln x}{x}$, et $(\\Delta)$ la droite d\'équation $y = ' + dr + '$. Calculer l\'aire $\\mathcal{A}$ du domaine limité par la courbe de $f$, $(\\Delta)$ et les droites d\'équations $x = 1$ et $x = ' + eVal(1, k).tex + '$.',
          s: S(res), tex: res.tex(), fs: c + '*ln(x)/x', a: 1, b: Math.exp(k),
          sol: ['$f(x) - (' + dr + ') = ' + (c === 1 ? '' : c) + '\\dfrac{\\ln x}{x} \\geq 0$ sur $[1 \\,;\\, ' + eVal(1, k).tex + ']$ car $\\ln x \\geq 0$ pour $x \\geq 1$.',
            '$\\mathcal{A} = \\displaystyle\\int_1^{' + eVal(1, k).tex + '} ' + (c === 1 ? '' : c) + '\\dfrac{\\ln x}{x}\\,dx = \\left[' + T.mono(F(c, 2), '(\\ln x)^2', true) + '\\right]_1^{' + eVal(1, k).tex + '} = ' + F(c, 2).tex() + ' \\times ' + (k * k) + ' = ' + res.tex() + '$ u.a.'] };
      } else {
        var cc = rng.int(1, 4), aa = rng.nz(-2, 2), bb = rng.int(-2, 2), kk = rng.pick([2, 3, 4]), rr = F(cc * (kk - 1), kk);
        var dr2 = T.poly([aa, bb]);
        t = { enonce: 'Soit $f$ la fonction définie sur $\\R$ par $f(x) = ' + dr2 + ' + ' + (cc === 1 ? '' : cc) + 'e^{-x}$ et $(\\Delta)$ la droite d\'équation $y = ' + dr2 + '$. Calculer l\'aire $\\mathcal{A}$ du domaine limité par la courbe de $f$, $(\\Delta)$ et les droites d\'équations $x = 0$ et $x = \\ln ' + kk + '$.',
          s: S(rr), tex: rr.tex(), fs: cc + '*e^(-x)', a: 0, b: Math.log(kk),
          sol: ['$f(x) - (' + dr2 + ') = ' + (cc === 1 ? '' : cc) + 'e^{-x} > 0$ : la courbe est au-dessus de $(\\Delta)$.',
            '$\\mathcal{A} = \\displaystyle\\int_0^{\\ln ' + kk + '} ' + (cc === 1 ? '' : cc) + 'e^{-x}\\,dx = \\left[' + (cc === 1 ? '-' : '-' + cc) + 'e^{-x}\\right]_0^{\\ln ' + kk + '} = ' + cc + '\\left(1 - e^{-\\ln ' + kk + '}\\right) = ' + cc + '\\left(1 - \\dfrac{1}{' + kk + '}\\right) = ' + rr.tex() + '$ u.a.'] };
      }
      controle(proche(val(t.s), simpson(fn(t.fs), t.a, t.b), 1e-6), 'aire ' + cas);
      var cm2 = { s: S(ua) + '*(' + t.s + ')', tex: (ua === 1 ? t.tex : ua + '\\left(' + t.tex + '\\right)') };
      return {
        enonce: t.enonce + ' ' + uniteTxt + ' Donner l\'aire en unités d\'aire puis en $\\text{cm}^2$ (valeurs exactes).',
        questions: [
          { label: '$\\mathcal{A} =$', type: 'number', reponse: t.s, reponseTex: t.tex, unite: 'u.a.' },
          { label: '$\\mathcal{A} =$', type: 'number', reponse: cm2.s, reponseTex: cm2.tex, unite: 'cm²' }
        ],
        indices: ['Étudie le signe de la différence entre la courbe et la droite.', 'Aire $= \\displaystyle\\int_a^b [f(x) - g(x)]\\,dx$ u.a. si $f \\geq g$ ; 1 u.a. $= ' + unite[0] + ' \\times ' + unite[1] + '$ cm².'],
        solution: t.sol.concat(['1 u.a. $= ' + ua + '$ cm², donc $\\mathcal{A} = ' + cm2.tex + '$ cm².']),
        aide: AIDE_EXACT
      };
    }
  });

  /* ================================================================== */
  /* Équations différentielles                                           */
  /* ================================================================== */
  EM.gen.register({
    id: 'ts-equa-diff-ordre1',
    titre: 'Équations différentielles du premier ordre',
    chapitres: ['ts-equations-differentielles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var p = rng.pick([1, 1, 2, 3]), q = rng.nz(-6, 6), y0 = rng.nz(-5, 5), a = F(-q, p);
        var eq = (p === 1 ? '' : p) + 'y\' ' + (q > 0 ? '+ ' : '- ') + (Math.abs(q) === 1 ? '' : Math.abs(q)) + 'y = 0';
        var ys = S(y0) + '*e^(' + S(a) + '*x)', yt = T.mono(y0, eTex(a), true);
        controle(proche(fn(ys)(0), y0) && deriveOK(ys, S(a) + '*' + ys, -1, 1), 'ed1 niv1');
        return {
          enonce: 'Résoudre l\'équation différentielle $(E) : ' + eq + '$, puis déterminer la solution $f$ de $(E)$ qui vérifie $f(0) = ' + y0 + '$.',
          questions: [{ label: '$f(x) =$', type: 'expr', reponse: ys, reponseTex: yt, domaine: [-1, 1] }],
          indices: ['Écris $(E)$ sous la forme $y\' = ay$.', 'Les solutions de $y\' = ay$ sont les fonctions $x \\mapsto ke^{ax}$, $k \\in \\R$.'],
          solution: [
            '$(E) \\iff y\' = ' + T.mono(a, 'y', true) + '$ : c\'est une équation de la forme $y\' = ay$ avec $a = ' + a.tex() + '$.',
            'Ses solutions sont les fonctions $x \\mapsto k' + eTex(a) + '$, $k \\in \\R$.',
            '$f(0) = k e^{0} = k = ' + y0 + '$, donc $f(x) = ' + yt + '$.'
          ]
        };
      }
      if (niveau === 2) {
        var aa = rng.nz(-3, 3), yp = rng.int(-4, 4), bb = -aa * yp, z0;
        do { z0 = rng.int(-5, 5); } while (z0 === yp);
        var K = z0 - yp;
        var forme = rng.bool();
        var eq2 = forme ? 'y\' = ' + T.mono(aa, 'y', true) + (bb ? T.signed(bb) : '') : 'y\'' + T.mono(-aa, 'y', false) + ' = ' + bb;
        var ys2 = S(K) + '*e^(' + aa + '*x)+' + S(yp), yt2 = T.mono(K, eTex(aa), true) + (yp ? T.signed(yp) : '');
        controle(proche(fn(ys2)(0), z0) && deriveOK(ys2, S(aa) + '*(' + ys2 + ')+' + S(bb), -1, 1), 'ed1 niv2');
        return {
          enonce: 'On considère l\'équation différentielle $(E) : ' + eq2 + '$.<br>Déterminer la solution constante de $(E)$, puis la solution $f$ de $(E)$ telle que $f(0) = ' + z0 + '$.',
          questions: [
            { label: 'Solution constante : $y =$', type: 'number', reponse: yp },
            { label: '$f(x) =$', type: 'expr', reponse: ys2, reponseTex: yt2, domaine: [-1, 1] }
          ],
          indices: ['Une fonction constante $y = c$ a pour dérivée $0$ : remplace dans $(E)$.', 'Les solutions de $y\' = ay + b$ sont $x \\mapsto ke^{ax} - \\dfrac{b}{a}$.'],
          solution: [
            (forme ? '' : '$(E) \\iff y\' = ' + T.mono(aa, 'y', true) + (bb ? T.signed(bb) : '') + '$. ') + 'C\'est une équation $y\' = ay + b$ avec $a = ' + aa + '$ et $b = ' + bb + '$.',
            'Solution constante : $0 = ' + T.mono(aa, 'c', true) + (bb ? T.signed(bb) : '') + '$, soit $c = -\\dfrac{b}{a} = ' + yp + '$.',
            'Les solutions de $(E)$ sont $x \\mapsto k' + eTex(aa) + (yp ? T.signed(yp) : '') + '$, $k \\in \\R$.',
            '$f(0) = k' + (yp ? T.signed(yp) : '') + ' = ' + z0 + '$ donne $k = ' + K + '$ : $f(x) = ' + yt2 + '$.'
          ]
        };
      }
      if (rng.bool()) {
        var Ta = rng.pick([25, 28, 30, 32]), Th0 = rng.pick([80, 85, 90, 95]), kk = rng.pick([0.05, 0.08, 0.1, 0.12]);
        var D = Th0 - Ta, t1 = rng.pick([5, 10, 15]), Tc = rng.pick([40, 45, 50]);
        var th = Ta + D * Math.exp(-kk * t1), tc = Math.log(D / (Tc - Ta)) / kk;
        var ys3 = Ta + '+' + D + '*e^(-' + kk + '*t)';
        controle(deriveOK(ys3, '-' + kk + '*((' + ys3 + ')-' + Ta + ')', 0, 20, 't'), 'ed1 refroidissement');
        return {
          enonce: 'Dans une maison de Kaolack où la température ambiante est de $' + Ta + '$ °C, on sert du thé (ataya) à $' + Th0 + '$ °C. La température $\\theta(t)$ du thé, en °C, $t$ minutes après le service, vérifie $$\\theta\'(t) = -' + T.num(kk) + '\\left(\\theta(t) - ' + Ta + '\\right) \\quad \\text{et} \\quad \\theta(0) = ' + Th0 + '.$$' +
            'Exprimer $\\theta(t)$, calculer la température au bout de ' + t1 + ' minutes (arrondie au dixième) et déterminer au bout de combien de minutes le thé atteint $' + Tc + '$ °C (arrondi au dixième).',
          questions: [
            { label: '$\\theta(t) =$', type: 'expr', variable: 't', reponse: ys3, reponseTex: Ta + ' + ' + D + 'e^{-' + T.num(kk) + 't}', domaine: [0, 30] },
            { label: '$\\theta(' + t1 + ') \\approx$', type: 'number', reponse: th, tol: 0.1, reponseTex: T.num(rd(th, 1)), unite: '°C' },
            { label: 'Durée :', type: 'number', reponse: tc, tol: 0.1, reponseTex: T.num(rd(tc, 1)), unite: 'min' }
          ],
          indices: ['Pose $z(t) = \\theta(t) - ' + Ta + '$ : $z\' = -' + T.num(kk) + 'z$.', 'Pour la durée, résous $' + Ta + ' + ' + D + 'e^{-' + T.num(kk) + 't} = ' + Tc + '$ avec $\\ln$.'],
          solution: [
            'Avec $z(t) = \\theta(t) - ' + Ta + '$, on a $z\'(t) = \\theta\'(t) = -' + T.num(kk) + 'z(t)$ : $z(t) = ke^{-' + T.num(kk) + 't}$.',
            '$z(0) = ' + Th0 + ' - ' + Ta + ' = ' + D + '$, donc $\\theta(t) = ' + Ta + ' + ' + D + 'e^{-' + T.num(kk) + 't}$.',
            '$\\theta(' + t1 + ') = ' + Ta + ' + ' + D + 'e^{-' + T.num(rd(kk * t1, 4)) + '} \\approx ' + T.num(rd(th, 1)) + '$ °C.',
            '$\\theta(t) = ' + Tc + ' \\iff e^{-' + T.num(kk) + 't} = \\dfrac{' + (Tc - Ta) + '}{' + D + '} \\iff t = \\dfrac{1}{' + T.num(kk) + '}\\ln\\dfrac{' + D + '}{' + (Tc - Ta) + '} \\approx ' + T.num(rd(tc, 1)) + '$ min.'
          ]
        };
      }
      var P0 = rng.pick([2, 3, 4, 5]), kp = rng.pick([0.02, 0.03, 0.04, 0.05]), mois = rng.pick([6, 12, 18]);
      var Pm = P0 * Math.exp(kp * mois), td = Math.log(2) / kp;
      var ys4 = P0 + '*e^(' + kp + '*t)';
      controle(deriveOK(ys4, kp + '*' + ys4, 0, 20, 't'), 'ed1 croissance');
      return {
        enonce: 'Dans un bassin de pisciculture de Richard-Toll, on élève des tilapias. Le nombre de poissons, en milliers, au temps $t$ (en mois) est modélisé par une fonction $P$ vérifiant $$P\'(t) = ' + T.num(kp) + 'P(t) \\quad \\text{et} \\quad P(0) = ' + P0 + '.$$' +
          'Exprimer $P(t)$, estimer le nombre de milliers de poissons au bout de ' + mois + ' mois (arrondi au centième) et le temps de doublement de la population (arrondi au dixième de mois).',
        questions: [
          { label: '$P(t) =$', type: 'expr', variable: 't', reponse: ys4, reponseTex: P0 + 'e^{' + T.num(kp) + 't}', domaine: [0, 24] },
          { label: '$P(' + mois + ') \\approx$', type: 'number', reponse: Pm, tol: 0.01, reponseTex: T.num(rd(Pm, 2)) },
          { label: 'Temps de doublement :', type: 'number', reponse: td, tol: 0.1, reponseTex: T.num(rd(td, 1)), unite: 'mois' }
        ],
        indices: ['Les solutions de $y\' = ay$ sont $t \\mapsto ke^{at}$.', 'Le temps de doublement $\\tau$ vérifie $e^{' + T.num(kp) + '\\tau} = 2$.'],
        solution: [
          '$P\' = ' + T.num(kp) + 'P$ : $P(t) = ke^{' + T.num(kp) + 't}$ et $P(0) = k = ' + P0 + '$, donc $P(t) = ' + P0 + 'e^{' + T.num(kp) + 't}$.',
          '$P(' + mois + ') = ' + P0 + 'e^{' + T.num(rd(kp * mois, 4)) + '} \\approx ' + T.num(rd(Pm, 2)) + '$ milliers de poissons.',
          '$P(\\tau) = 2P(0) \\iff e^{' + T.num(kp) + '\\tau} = 2 \\iff \\tau = \\dfrac{\\ln 2}{' + T.num(kp) + '} \\approx ' + T.num(rd(td, 1)) + '$ mois.'
        ]
      };
    }
  });

  EM.gen.register({
    id: 'ts-equa-diff-ordre2',
    titre: 'Équations différentielles du second ordre',
    chapitres: ['ts-equations-differentielles'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var ys, yt, eq, sol, qs = [], y0, y1, coefA, coefB;
      function eqTex(a, b) { return 'y\'\'' + T.mono(a, 'y\'', false) + T.mono(b, 'y', false) + ' = 0'; }
      if (niveau === 1) {
        var w = rng.int(1, 4), A0 = rng.int(-4, 4), C0 = rng.nz(-3, 3), k = rng.pick([1, 1, 2, 3]);
        y0 = A0; y1 = w * C0;
        var cw = w === 1 ? 'x' : w + 'x', cosT = w === 1 ? '\\cos x' : '\\cos(' + cw + ')', sinT = w === 1 ? '\\sin x' : '\\sin(' + cw + ')';
        ys = S(A0) + '*cos(' + w + '*x)+' + S(C0) + '*sin(' + w + '*x)';
        yt = T.sum([{ c: A0, v: cosT }, { c: C0, v: sinT }]);
        eq = (k === 1 ? '' : k) + 'y\'\' + ' + (k * w * w === 1 ? '' : k * w * w) + 'y = 0';
        coefA = 0; coefB = w * w;
        qs.push({ label: '$\\omega =$', type: 'number', reponse: w });
        sol = [
          (k === 1 ? '' : '$(E) \\iff y\'\' + ' + (w * w === 1 ? '' : w * w) + 'y = 0$. ') + 'C\'est une équation $y\'\' + \\omega^2 y = 0$ avec $\\omega^2 = ' + (w * w) + '$, donc $\\omega = ' + w + '$.',
          'Ses solutions sont $x \\mapsto A' + cosT + ' + B' + sinT + '$, $(A, B) \\in \\R^2$.',
          '$f(0) = A = ' + A0 + '$ ; $f\'(x) = ' + (w === 1 ? '' : '-' + w) + (w === 1 ? '-A\\sin x + B\\cos x' : 'A' + sinT + ' + ' + w + 'B' + cosT) + '$ donc $f\'(0) = ' + (w === 1 ? '' : w) + 'B = ' + y1 + '$, d\'où $B = ' + C0 + '$.',
          '$f(x) = ' + yt + '$.'
        ];
      } else if (niveau === 2) {
        var r1, r2;
        do { r1 = rng.nz(-3, 3); r2 = rng.nz(-3, 3); } while (r1 >= r2);
        var al = rng.nz(-3, 3), be = rng.nz(-3, 3);
        coefA = -(r1 + r2); coefB = r1 * r2;
        y0 = al + be; y1 = al * r1 + be * r2;
        eq = eqTex(coefA, coefB);
        ys = S(al) + '*e^(' + r1 + '*x)+' + S(be) + '*e^(' + r2 + '*x)';
        yt = T.mono(al, eTex(r1), true) + T.mono(be, eTex(r2), false);
        qs.push({ label: 'Racines de l\'équation caractéristique :', type: 'set', reponse: [r1, r2] });
        sol = [
          'Équation caractéristique : $r^2' + T.mono(coefA, 'r', false) + T.signed(coefB) + ' = 0$ ; $\\Delta = ' + ((r1 - r2) * (r1 - r2)) + ' > 0$, racines $r_1 = ' + r1 + '$ et $r_2 = ' + r2 + '$.',
          'Les solutions sont $x \\mapsto \\alpha\\,' + eTex(r1) + ' + \\beta\\,' + eTex(r2) + '$.',
          'Conditions : $f(0) = \\alpha + \\beta = ' + y0 + '$ et $f\'(0) = ' + T.mono(r1, '\\alpha', true) + T.mono(r2, '\\beta', false) + ' = ' + y1 + '$, d\'où $\\alpha = ' + al + '$ et $\\beta = ' + be + '$.',
          '$f(x) = ' + yt + '$.'
        ];
      } else {
        if (rng.bool()) {
          var r = rng.nz(-2, 2), a1 = rng.nz(-3, 3), b1 = rng.int(-3, 3);
          coefA = -2 * r; coefB = r * r;
          y0 = b1; y1 = a1 + r * b1;
          eq = eqTex(coefA, coefB);
          ys = polyS([a1, b1]) + '*e^(' + r + '*x)';
          yt = prod([a1, b1], eTex(r));
          qs.push({ label: 'Discriminant $\\Delta =$', type: 'number', reponse: 0 });
          sol = [
            'Équation caractéristique : $r^2' + T.mono(coefA, 'r', false) + T.signed(coefB) + ' = 0$ ; $\\Delta = 0$, racine double $r_0 = ' + r + '$.',
            'Les solutions sont $x \\mapsto (\\alpha x + \\beta)' + eTex(r) + '$.',
            '$f(0) = \\beta = ' + b1 + '$ ; $f\'(x) = \\left(\\alpha' + T.mono(r, '(\\alpha x + \\beta)', false) + '\\right)' + eTex(r) + '$ donc $f\'(0) = \\alpha' + T.mono(r, '\\beta', false) + ' = ' + y1 + '$, d\'où $\\alpha = ' + a1 + '$.',
            '$f(x) = ' + yt + '$.'
          ];
        } else {
          var pp = rng.nz(-2, 2), qq = rng.int(1, 3), a2 = rng.int(-3, 3), b2 = rng.nz(-3, 3);
          coefA = -2 * pp; coefB = pp * pp + qq * qq;
          y0 = a2; y1 = pp * a2 + qq * b2;
          eq = eqTex(coefA, coefB);
          var cq = qq === 1 ? '\\cos x' : '\\cos(' + qq + 'x)', sq = qq === 1 ? '\\sin x' : '\\sin(' + qq + 'x)';
          ys = 'e^(' + pp + '*x)*(' + S(a2) + '*cos(' + qq + '*x)+' + S(b2) + '*sin(' + qq + '*x))';
          var inner = T.sum([{ c: a2, v: cq }, { c: b2, v: sq }]);
          yt = a2 === 0 ? T.mono(b2, eTex(pp) + sq, true) : eTex(pp) + '\\left(' + inner + '\\right)';
          qs.push({ label: 'Discriminant $\\Delta =$', type: 'number', reponse: -4 * qq * qq });
          sol = [
            'Équation caractéristique : $r^2' + T.mono(coefA, 'r', false) + T.signed(coefB) + ' = 0$ ; $\\Delta = ' + (-4 * qq * qq) + ' < 0$, racines complexes $' + cTex(pp, qq) + '$ et $' + cTex(pp, -qq) + '$.',
            'Les solutions sont $x \\mapsto ' + eTex(pp) + '\\left(A' + cq + ' + B' + sq + '\\right)$.',
            '$f(0) = A = ' + a2 + '$ ; $f\'(0) = ' + T.mono(pp, 'A', true) + T.mono(qq, 'B', false) + ' = ' + y1 + '$, d\'où $B = ' + b2 + '$.',
            '$f(x) = ' + yt + '$.'
          ];
        }
      }
      if (verifActive()) {
        var f = fn(ys), h = 1e-3, okE = true;
        [-0.7, -0.2, 0.3, 0.8].forEach(function (x) {
          var d1 = (f(x + h) - f(x - h)) / (2 * h), d2 = (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
          if (Math.abs(d2 + coefA * d1 + coefB * f(x)) > 1e-3 * Math.max(1, Math.abs(d2))) okE = false;
        });
        controle(okE && proche(f(0), y0) && proche((f(1e-5) - f(-1e-5)) / 2e-5, y1, 1e-4), 'ed2 niveau ' + niveau + ' ' + ys);
      }
      qs.push({ label: '$f(x) =$', type: 'expr', reponse: ys, reponseTex: yt, domaine: [-1, 1] });
      return {
        enonce: 'On considère l\'équation différentielle $(E) : ' + eq + '$.<br>Résoudre $(E)$, puis déterminer la solution $f$ de $(E)$ vérifiant $f(0) = ' + y0 + '$ et $f\'(0) = ' + y1 + '$.',
        questions: qs,
        indices: ['Écris l\'équation caractéristique $r^2 + ar + b = 0$ et calcule son discriminant.', 'Utilise les conditions $f(0)$ et $f\'(0)$ pour obtenir un système en les deux constantes.'],
        solution: sol,
        aide: 'Écris par exemple 2cos(3x) - sin(3x), e^(2x) - 3e^(-x) ou (2x+1)e^(-x).'
      };
    }
  });

  /* ================================================================== */
  /* Nombres complexes                                                   */
  /* ================================================================== */
  /**
   * Nombre complexe « remarquable » : module m√s et argument t·π connus.
   * fam : 'A' (±π/4, ±3π/4), 'B' (±π/6, ±5π/6), 'C' (±π/3, ±2π/3), 'D' (axes).
   */
  function cxNice(rng, fams, kmax) {
    var fam = rng.pick(fams), k = rng.int(1, kmax || 2), sx = rng.sign(), sy = rng.sign();
    function arg(base) {
      if (sx > 0) return sy > 0 ? base : base.neg();
      return sy > 0 ? F(1).sub(base) : base.sub(1);
    }
    var kk = k === 1 ? '' : String(k);
    if (fam === 'A') return { tex: cTex(k * sx, k * sy), re: k * sx, im: k * sy, m: F(k), s: 2, t: arg(F(1, 4)),
      cos: (sx < 0 ? '-' : '') + '\\dfrac{\\sqrt{2}}{2}', sin: (sy < 0 ? '-' : '') + '\\dfrac{\\sqrt{2}}{2}' };
    if (fam === 'B') return { tex: (sx < 0 ? '-' : '') + kk + '\\sqrt{3}' + T.mono(k * sy, 'i', false), re: k * sx * Math.sqrt(3), im: k * sy, m: F(2 * k), s: 1, t: arg(F(1, 6)),
      cos: (sx < 0 ? '-' : '') + '\\dfrac{\\sqrt{3}}{2}', sin: (sy < 0 ? '-' : '') + '\\dfrac{1}{2}' };
    if (fam === 'C') return { tex: T.num(k * sx) + (sy < 0 ? ' - ' : ' + ') + kk + 'i\\sqrt{3}', re: k * sx, im: k * sy * Math.sqrt(3), m: F(2 * k), s: 1, t: arg(F(1, 3)),
      cos: (sx < 0 ? '-' : '') + '\\dfrac{1}{2}', sin: (sy < 0 ? '-' : '') + '\\dfrac{\\sqrt{3}}{2}' };
    var axe = rng.int(0, 3);
    var re = [k, -k, 0, 0][axe], im = [0, 0, k, -k][axe];
    return { tex: cTex(re, im), re: re, im: im, m: F(k), s: 1, t: [F(0), F(1), F(1, 2), F(-1, 2)][axe],
      cos: String([1, -1, 0, 0][axe]), sin: String([0, 0, 1, -1][axe]) };
  }
  /** Produit et quotient de modules m√s (s = 1 ou 2) */
  function modMul(a, b) {
    if (a.s === 2 && b.s === 2) return { m: a.m.mul(b.m).mul(2), s: 1 };
    return { m: a.m.mul(b.m), s: a.s * b.s };
  }
  function modDiv(a, b) {
    if (a.s === b.s) return { m: a.m.div(b.m), s: 1 };
    if (a.s === 2) return { m: a.m.div(b.m), s: 2 };
    return { m: a.m.div(b.m.mul(2)), s: 2 };
  }
  function modPow(a, n) {
    var mn = a.m.pow(n);
    if (a.s === 1) return { m: mn, s: 1 };
    if (n % 2 === 0) return { m: mn.mul(Math.pow(2, n / 2)), s: 1 };
    return { m: mn.mul(Math.pow(2, (n - 1) / 2)), s: 2 };
  }
  function expTex(mod, t) { // forme exponentielle
    var r = radTex(mod.m, mod.s);
    var th = angTex(t);
    if (fr(t).isZero()) return r;
    return (r === '1' ? '' : r) + 'e^{' + (th.charAt(0) === '-' ? '-i' + th.slice(1) : 'i' + th) + '}';
  }

  EM.gen.register({
    id: 'ts-complexes-algebrique',
    titre: 'Forme algébrique d\'un produit, d\'un quotient',
    chapitres: ['ts-complexes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var a = rng.int(-4, 4), b = rng.nz(-4, 4), c = rng.int(-4, 4), d = rng.nz(-4, 4);
      var z1 = cTex(a, b), z2 = cTex(c, d), qs, sol;
      if (niveau === 1) {
        var P = [a * c - b * d, a * d + b * c];
        var carre = rng.bool(), Q = carre ? [a * a - b * b, 2 * a * b] : [a * c + b * d, a * d - b * c];
        qs = [
          { label: '$z_1 z_2$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: P, reponseTex: pt(P[0], P[1]) },
          { label: (carre ? '$z_1^2$' : '$\\overline{z_1} \\, z_2$') + ' : $(x \\,;\\, y) =$', type: 'tuple', reponse: Q, reponseTex: pt(Q[0], Q[1]) }
        ];
        sol = [
          'On développe en utilisant $i^2 = -1$ : $(a + ib)(c + id) = (ac - bd) + i(ad + bc)$.',
          '$z_1 z_2 = (' + z1 + ')(' + z2 + ') = ' + T.par(a) + ' \\times ' + T.par(c) + ' - ' + T.par(b) + ' \\times ' + T.par(d) + ' + i\\left(' + T.par(a) + ' \\times ' + T.par(d) + ' + ' + T.par(b) + ' \\times ' + T.par(c) + '\\right) = ' + cTex(P[0], P[1]) + '$.',
          carre ? '$z_1^2 = (' + z1 + ')^2 = ' + T.par(a) + '^2 - ' + T.par(b) + '^2 + 2 \\times ' + T.par(a) + ' \\times ' + T.par(b) + ' \\times i = ' + cTex(Q[0], Q[1]) + '$ (identité $(a + ib)^2 = a^2 - b^2 + 2abi$).'
            : '$\\overline{z_1} = ' + cTex(a, -b) + '$, donc $\\overline{z_1}\\, z_2 = (' + cTex(a, -b) + ')(' + z2 + ') = ' + cTex(Q[0], Q[1]) + '$.'
        ];
      } else {
        var n2 = c * c + d * d, n1 = a * a + b * b;
        if (n1 === 0) { a = 1; n1 = 1 + b * b; z1 = cTex(a, b); }
        var Qt = [F(a * c + b * d, n2), F(b * c - a * d, n2)], In = [F(a, n1), F(-b, n1)];
        qs = [
          { label: '$\\dfrac{z_1}{z_2}$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: Qt, reponseTex: pt(Qt[0].tex(), Qt[1].tex()) },
          { label: '$\\dfrac{1}{z_1}$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: In, reponseTex: pt(In[0].tex(), In[1].tex()) }
        ];
        sol = [
          'On multiplie numérateur et dénominateur par le conjugué du dénominateur ; $z\\overline{z} = |z|^2$.',
          '$\\dfrac{z_1}{z_2} = \\dfrac{(' + z1 + ')(' + cTex(c, -d) + ')}{' + T.par(c) + '^2 + ' + T.par(d) + '^2} = \\dfrac{' + cTex(a * c + b * d, b * c - a * d) + '}{' + n2 + '} = ' + cTex(Qt[0], Qt[1]) + '$.',
          '$\\dfrac{1}{z_1} = \\dfrac{' + cTex(a, -b) + '}{' + T.par(a) + '^2 + ' + T.par(b) + '^2} = ' + cTex(In[0], In[1]) + '$.'
        ];
      }
      return {
        enonce: 'On donne $z_1 = ' + z1 + '$ et $z_2 = ' + z2 + '$. Écrire sous forme algébrique $x + iy$ : ' +
          (niveau === 1 ? '$z_1 z_2$ et ' + (qs[1].label.indexOf('z_1^2') >= 0 ? '$z_1^2$' : '$\\overline{z_1}\\, z_2$') : '$\\dfrac{z_1}{z_2}$ et $\\dfrac{1}{z_1}$') + '.',
        questions: qs,
        indices: ['Développe en remplaçant $i^2$ par $-1$.', 'Pour un quotient, multiplie par le conjugué du dénominateur : $\\dfrac{1}{c + id} = \\dfrac{c - id}{c^2 + d^2}$.'],
        solution: sol,
        aide: AIDE_CPLX
      };
    }
  });

  EM.gen.register({
    id: 'ts-complexes-module-argument',
    titre: 'Module, argument et forme exponentielle',
    chapitres: ['ts-complexes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var z = cxNice(rng, ['A', 'B', 'C', 'A', 'B', 'C', 'D'], 3), mod, t, sol, enonce;
      if (niveau === 1) {
        mod = { m: z.m, s: z.s }; t = z.t;
        controle(proche(Math.hypot(z.re, z.im), mod.m.value() * Math.sqrt(mod.s)) && proche(Math.atan2(z.im, z.re), t.value() * Math.PI), 'module-argument');
        var r2 = z.re * z.re + z.im * z.im;
        enonce = 'Déterminer le module et l\'argument principal (dans $]-\\pi \\,;\\, \\pi]$) du nombre complexe $z = ' + z.tex + '$, puis écrire $z$ sous forme exponentielle.';
        sol = [
          '$|z| = \\sqrt{x^2 + y^2} = \\sqrt{' + Math.round(r2) + '} = ' + radTex(mod.m, mod.s) + '$.',
          'Un argument $\\theta$ vérifie $\\cos\\theta = \\dfrac{x}{|z|} = ' + z.cos + '$ et $\\sin\\theta = \\dfrac{y}{|z|} = ' + z.sin + '$, donc $\\theta = ' + angTex(t) + '$.',
          'Forme trigonométrique : $z = ' + radTex(mod.m, mod.s) + '\\left(\\cos\\left(' + angTex(t) + '\\right) + i\\sin\\left(' + angTex(t) + '\\right)\\right)$ ; forme exponentielle : $z = ' + expTex(mod, t) + '$.'
        ];
      } else {
        var w = cxNice(rng, ['A', 'B', 'C', 'D'], 2), op = rng.pick(['mul', 'div', 'pow']), n = rng.int(2, 4);
        if (op === 'pow') { w = cxNice(rng, ['A', 'B', 'C'], 1); }
        var zi = [z.re, z.im], wi = [w.re, w.im], Z;
        if (op === 'mul') { mod = modMul(z, w); t = angRed(z.t.add(w.t)); Z = [zi[0] * wi[0] - zi[1] * wi[1], zi[0] * wi[1] + zi[1] * wi[0]]; }
        else if (op === 'div') { mod = modDiv(z, w); t = angRed(z.t.sub(w.t)); var nn = wi[0] * wi[0] + wi[1] * wi[1]; Z = [(zi[0] * wi[0] + zi[1] * wi[1]) / nn, (zi[1] * wi[0] - zi[0] * wi[1]) / nn]; }
        else { mod = modPow(w, n); t = angRed(w.t.mul(n)); var ang = Math.atan2(wi[1], wi[0]) * n, rr = Math.pow(Math.hypot(wi[0], wi[1]), n); Z = [rr * Math.cos(ang), rr * Math.sin(ang)]; }
        var RR = mod.m.value() * Math.sqrt(mod.s);
        controle(Math.abs(Z[0] - RR * Math.cos(t.value() * Math.PI)) < 1e-6 && Math.abs(Z[1] - RR * Math.sin(t.value() * Math.PI)) < 1e-6, 'module-argument niv2 ' + op);
        var Ztex = op === 'mul' ? 'Z = z_1 z_2' : op === 'div' ? 'Z = \\dfrac{z_1}{z_2}' : 'Z = z_2^{' + n + '}';
        enonce = 'On donne $z_1 = ' + z.tex + '$ et $z_2 = ' + w.tex + '$. Déterminer le module et l\'argument principal de $' + Ztex + '$, puis écrire $Z$ sous forme exponentielle.';
        sol = [
          op !== 'pow' ? '$|z_1| = ' + radTex(z.m, z.s) + '$ et $\\arg(z_1) = ' + angTex(z.t) + '$ ; $|z_2| = ' + radTex(w.m, w.s) + '$ et $\\arg(z_2) = ' + angTex(w.t) + '$.'
            : '$|z_2| = ' + radTex(w.m, w.s) + '$ et $\\arg(z_2) = ' + angTex(w.t) + '$.',
          op === 'mul' ? '$|Z| = |z_1| \\times |z_2| = ' + radTex(mod.m, mod.s) + '$ et $\\arg(Z) = \\arg(z_1) + \\arg(z_2) = ' + angTex(z.t.add(w.t)) + '$ (à $2\\pi$ près).'
            : op === 'div' ? '$|Z| = \\dfrac{|z_1|}{|z_2|} = ' + radTex(mod.m, mod.s) + '$ et $\\arg(Z) = \\arg(z_1) - \\arg(z_2) = ' + angTex(z.t.sub(w.t)) + '$ (à $2\\pi$ près).'
              : '$|Z| = |z_2|^{' + n + '} = ' + radTex(mod.m, mod.s) + '$ et $\\arg(Z) = ' + n + '\\arg(z_2) = ' + angTex(w.t.mul(n)) + '$ (à $2\\pi$ près).',
          'L\'argument principal est $' + angTex(t) + '$, donc $Z = ' + expTex(mod, t) + '$.'
        ];
      }
      return {
        enonce: enonce,
        questions: [
          { label: 'Module :', type: 'number', reponse: radS(mod.m, mod.s), reponseTex: radTex(mod.m, mod.s) },
          { label: 'Argument principal :', type: 'number', reponse: angS(t), reponseTex: angTex(t) }
        ],
        indices: ['$|x + iy| = \\sqrt{x^2 + y^2}$ ; un argument $\\theta$ vérifie $\\cos\\theta = \\dfrac{x}{|z|}$ et $\\sin\\theta = \\dfrac{y}{|z|}$.', '$|zz\'| = |z||z\'|$, $\\arg(zz\') = \\arg z + \\arg z\'$, $\\arg\\left(\\dfrac{z}{z\'}\\right) = \\arg z - \\arg z\'$, $\\arg(z^n) = n\\arg z$ (à $2\\pi$ près).'],
        solution: sol,
        aide: 'Écris par exemple 2sqrt(2) pour le module et -3pi/4 (ou -3π/4) pour l\'argument.'
      };
    }
  });

  EM.gen.register({
    id: 'ts-complexes-equation',
    titre: 'Équations du second degré dans ℂ',
    chapitres: ['ts-complexes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var p = rng.int(-4, 4), q = rng.int(1, 4), b = -2 * p, c = p * p + q * q;
        return {
          enonce: 'Résoudre dans $\\C$ l\'équation $z^2' + T.mono(b, 'z', false) + T.signed(c) + ' = 0$. On notera $z_1$ la solution de partie imaginaire positive.',
          questions: [
            { label: '$\\Delta =$', type: 'number', reponse: -4 * q * q },
            { label: '$z_1$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [p, q] },
            { label: '$z_2$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [p, -q] }
          ],
          indices: ['Calcule $\\Delta = b^2 - 4ac$ : il est négatif.', 'Si $\\Delta = -\\delta^2 < 0$, les solutions sont $\\dfrac{-b \\pm i\\delta}{2a}$.'],
          solution: [
            '$\\Delta = ' + T.par(b) + '^2 - 4 \\times ' + c + ' = ' + (-4 * q * q) + ' = (' + (2 * q === 1 ? '' : 2 * q) + 'i)^2$.',
            '$\\Delta < 0$ : deux solutions complexes conjuguées $z = \\dfrac{-b \\pm i\\sqrt{-\\Delta}}{2}$.',
            '$z_1 = \\dfrac{' + T.num(-b) + ' + ' + (2 * q) + 'i}{2} = ' + cTex(p, q) + '$ et $z_2 = \\overline{z_1} = ' + cTex(p, -q) + '$.'
          ],
          aide: AIDE_CPLX
        };
      }
      if (niveau === 2) {
        var x = rng.int(1, 4), y = rng.nz(-4, 4), A0 = x * x - y * y, B0 = 2 * x * y, M = x * x + y * y;
        return {
          enonce: 'Déterminer les racines carrées du nombre complexe $Z = ' + cTex(A0, B0) + '$, c\'est-à-dire les nombres $\\delta = x + iy$ tels que $\\delta^2 = Z$. Donner celle dont la partie réelle est positive.',
          questions: [{ label: '$\\delta$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [x, y] }],
          indices: ['Écris $\\delta^2 = x^2 - y^2 + 2ixy$ et identifie avec $Z$ ; ajoute l\'égalité des modules $x^2 + y^2 = |Z|$.', '$|Z| = \\sqrt{' + T.par(A0) + '^2 + ' + T.par(B0) + '^2}$.'],
          solution: [
            '$\\delta^2 = Z \\iff ' + sysTex(['x^2 - y^2 = ' + A0, '2xy = ' + B0, 'x^2 + y^2 = |Z| = \\sqrt{' + (A0 * A0 + B0 * B0) + '} = ' + M]) + '$',
            'En additionnant et en soustrayant : $2x^2 = ' + (M + A0) + '$ et $2y^2 = ' + (M - A0) + '$, donc $x^2 = ' + (x * x) + '$ et $y^2 = ' + (y * y) + '$.',
            'Comme $2xy = ' + B0 + (B0 > 0 ? ' > 0' : ' < 0') + '$, $x$ et $y$ sont de ' + (B0 > 0 ? 'même signe' : 'signes contraires') + ' : les racines carrées sont $' + cTex(x, y) + '$ et $' + cTex(-x, -y) + '$.',
            'Celle de partie réelle positive est $\\delta = ' + cTex(x, y) + '$.'
          ],
          aide: AIDE_CPLX
        };
      }
      var a, bb, c2, d2;
      do { a = rng.int(-3, 3); bb = rng.int(-3, 3); c2 = rng.int(-3, 3); d2 = rng.int(-3, 3); } while (a === c2 || bb + d2 === 0);
      if (a < c2) { var t1 = a; a = c2; c2 = t1; t1 = bb; bb = d2; d2 = t1; }
      var Sr = a + c2, Si = bb + d2, Pr = a * c2 - bb * d2, Pi = a * d2 + bb * c2;
      var dr = a - c2, di = bb - d2, Dr = dr * dr - di * di, Di = 2 * dr * di;
      var Ptex = (Pr === 0 && Pi === 0) ? '' : ' + \\left(' + cTex(Pr, Pi) + '\\right)';
      var S2r = Sr * Sr - Si * Si, S2i = 2 * Sr * Si;
      return {
        enonce: 'Résoudre dans $\\C$ l\'équation $$z^2 - \\left(' + cTex(Sr, Si) + '\\right)z' + Ptex + ' = 0.$$ On calculera d\'abord le discriminant $\\Delta$ et une racine carrée $\\delta$ de $\\Delta$.',
        questions: [
          { label: '$\\Delta$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [Dr, Di] },
          { label: 'Solution de plus grande partie réelle : $(x \\,;\\, y) =$', type: 'tuple', reponse: [a, bb] },
          { label: 'Autre solution : $(x \\,;\\, y) =$', type: 'tuple', reponse: [c2, d2] }
        ],
        indices: ['$\\Delta = b^2 - 4ac$ avec ici $b = -(' + cTex(Sr, Si) + ')$.', 'Cherche $\\delta = x + iy$ tel que $\\delta^2 = \\Delta$, puis $z = \\dfrac{-b \\pm \\delta}{2}$.'],
        solution: [
          '$\\Delta = \\left(' + cTex(Sr, Si) + '\\right)^2 - 4\\left(' + cTex(Pr, Pi) + '\\right) = ' + cTex(S2r, S2i) + ' - \\left(' + cTex(4 * Pr, 4 * Pi) + '\\right) = ' + cTex(Dr, Di) + '$.',
          'On cherche $\\delta = x + iy$ avec $\\delta^2 = \\Delta$ : $x^2 - y^2 = ' + Dr + '$, $2xy = ' + Di + '$ et $x^2 + y^2 = |\\Delta| = ' + (dr * dr + di * di) + '$, ce qui donne $\\delta = ' + cTex(dr, di) + '$ (ou son opposé).',
          '$z_1 = \\dfrac{' + cTex(Sr, Si) + ' + (' + cTex(dr, di) + ')}{2} = ' + cTex(a, bb) + '$ et $z_2 = \\dfrac{' + cTex(Sr, Si) + ' - (' + cTex(dr, di) + ')}{2} = ' + cTex(c2, d2) + '$.',
          'Vérification : $z_1 + z_2 = ' + cTex(Sr, Si) + '$ et $z_1 z_2 = ' + cTex(Pr, Pi) + '$.'
        ],
        aide: AIDE_CPLX
      };
    }
  });

  /** k·√r (r = 1 ou 3) : TeX et chaîne */
  function k3(v) {
    if (Math.abs(v - Math.round(v)) < 1e-6) return { tex: T.num(Math.round(v)), s: String(Math.round(v)), k: Math.round(v), r: 1 };
    var k = Math.round(v / Math.sqrt(3));
    return { tex: (k < 0 ? '-' : '') + (Math.abs(k) === 1 ? '' : Math.abs(k)) + '\\sqrt{3}', s: k + '*sqrt(3)', k: k, r: 3 };
  }
  EM.gen.register({
    id: 'ts-complexes-moivre',
    titre: 'Formule de Moivre et racines n-ièmes',
    chapitres: ['ts-complexes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var z = cxNice(rng, ['A', 'B', 'C'], 1), n = z.s === 2 ? rng.int(3, 8) : rng.int(3, 6);
        var mod = modPow(z, n), t = angRed(z.t.mul(n));
        var ang = t.value() * Math.PI, R = mod.m.value() * Math.sqrt(mod.s);
        var X = k3(R * Math.cos(ang)), Y = k3(R * Math.sin(ang));
        controle(proche(Math.atan2(z.im, z.re) * n - ang, Math.round((Math.atan2(z.im, z.re) * n - ang) / (2 * Math.PI)) * 2 * Math.PI, 1e-6), 'moivre angle');
        var Ztex = Y.k === 0 ? X.tex : (X.k === 0 ? '' : X.tex) + (Y.k < 0 ? (X.k === 0 ? '-' : ' - ') : (X.k === 0 ? '' : ' + ')) + (Y.r === 1 ? (Math.abs(Y.k) === 1 ? '' : Math.abs(Y.k)) + 'i' : (Math.abs(Y.k) === 1 ? '' : Math.abs(Y.k)) + 'i\\sqrt{3}');
        return {
          enonce: 'Soit $z = ' + z.tex + '$. Écrire $z$ sous forme exponentielle, puis en déduire la forme algébrique de $z^{' + n + '}$.',
          questions: [
            { label: '$|z| =$', type: 'number', reponse: radS(z.m, z.s), reponseTex: radTex(z.m, z.s) },
            { label: 'Argument principal de $z$ :', type: 'number', reponse: angS(z.t), reponseTex: angTex(z.t) },
            { label: '$z^{' + n + '}$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [X.s, Y.s], reponseTex: pt(X.tex, Y.tex) }
          ],
          indices: ['Calcule $|z|$ et un argument $\\theta$ de $z$.', 'Formule de Moivre : $\\left(re^{i\\theta}\\right)^n = r^n e^{in\\theta}$.'],
          solution: [
            '$|z| = ' + radTex(z.m, z.s) + '$, $\\cos\\theta = ' + z.cos + '$ et $\\sin\\theta = ' + z.sin + '$, donc $z = ' + expTex(z, z.t) + '$.',
            '$z^{' + n + '} = ' + (z.s === 2 ? '\\left(\\sqrt{2}\\right)' : radTex(z.m, z.s)) + '^{' + n + '}e^{i \\times ' + n + ' \\times ' + (angTex(z.t).charAt(0) === '-' ? '\\left(' + angTex(z.t) + '\\right)' : angTex(z.t)) + '} = ' + radTex(mod.m, mod.s) + 'e^{i\\left(' + angTex(z.t.mul(n)) + '\\right)} = ' + expTex(mod, t) + '$.',
            '$z^{' + n + '} = ' + radTex(mod.m, mod.s) + '\\left(\\cos\\left(' + angTex(t) + '\\right) + i\\sin\\left(' + angTex(t) + '\\right)\\right) = ' + Ztex + '$.'
          ],
          aide: 'Module : 2sqrt(2)… ; argument : -pi/4… ; forme algébrique : (16 ; -16sqrt(3)).'
        };
      }
      var cas = rng.pick(['unite', 'unite', 'w']), nr, r, phi, wTex;
      if (cas === 'unite') { nr = rng.int(3, 6); r = 1; phi = F(0); wTex = '1'; }
      else {
        nr = rng.pick([3, 4]); r = rng.pick([1, 2]); var R0 = Math.pow(r, nr), ax = rng.int(0, 3);
        phi = [F(0), F(1), F(1, 2), F(-1, 2)][ax];
        if (ax === 0 && r === 1) { ax = 1; phi = F(1); }
        wTex = cTex([R0, -R0, 0, 0][ax], [0, 0, R0, -R0][ax]);
      }
      var args = [];
      for (var k = 0; k < nr; k++) args.push(angRed(phi.add(2 * k).div(nr)));
      args.sort(function (u, v) { return u.cmp(v); });
      args.forEach(function (tt) { controle(proche(Math.cos(tt.value() * Math.PI * nr), Math.cos(phi.value() * Math.PI)) && proche(Math.sin(tt.value() * Math.PI * nr), Math.sin(phi.value() * Math.PI)), 'racines n-iemes'); });
      return {
        enonce: 'Résoudre dans $\\C$ l\'équation $z^{' + nr + '} = ' + wTex + '$. Les solutions s\'écrivent $re^{i\\theta}$ : donner $r$ et l\'ensemble des arguments $\\theta$ pris dans $]-\\pi \\,;\\, \\pi]$.',
        questions: [
          { label: '$r =$', type: 'number', reponse: r },
          { label: 'Arguments $\\theta$ :', type: 'set', reponse: args.map(angS), reponseTex: T.set(args.map(angTex)) }
        ],
        indices: ['Écris $' + wTex + '$ sous forme exponentielle $Re^{i\\varphi}$.', '$z = re^{i\\theta}$ est solution si et seulement si $r^{' + nr + '} = R$ et $' + nr + '\\theta = \\varphi + 2k\\pi$, $k \\in \\Z$.'],
        solution: [
          '$' + wTex + ' = ' + (Math.pow(r, nr) === 1 ? '' : Math.pow(r, nr)) + 'e^{i' + (phi.isZero() ? '0' : angTex(phi).charAt(0) === '-' ? '\\left(' + angTex(phi) + '\\right)' : angTex(phi)) + '}$. Avec $z = re^{i\\theta}$ : $z^{' + nr + '} = r^{' + nr + '}e^{i' + nr + '\\theta}$.',
          'Donc $r^{' + nr + '} = ' + Math.pow(r, nr) + '$, soit $r = ' + r + '$, et $' + nr + '\\theta = ' + (phi.isZero() ? '' : angTex(phi) + ' + ') + '2k\\pi$, soit $\\theta = ' + (phi.isZero() ? '' : angTex(phi.div(nr)) + ' + ') + '\\dfrac{2k\\pi}{' + nr + '}$, $k \\in \\{0, \\dots, ' + (nr - 1) + '\\}$.',
          'Dans $]-\\pi \\,;\\, \\pi]$, les arguments sont : $' + args.map(angTex).join(' \\,;\\, ') + '$.',
          'Les ' + nr + ' solutions sont les points d\'un polygone régulier à ' + nr + ' côtés inscrit dans le cercle de centre $O$ et de rayon $' + r + '$.'
        ],
        aide: 'Sépare les arguments par « ; », par exemple : 0 ; 2π/3 ; -2π/3 (ou 2pi/3).'
      };
    }
  });

  /* ---------- similitudes directes ---------- */
  var SIM_A = [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 2], [0, -2], [0, 3], [2, 2], [-2, 2], [2, -2], [-2, -2], [0, 1], [0, -1], [-2, 0], [3, 0], [2, 0]];
  function modArg(re, im) {
    if (im === 0) return { m: F(Math.abs(re)), s: 1, t: re > 0 ? F(0) : F(1) };
    if (re === 0) return { m: F(Math.abs(im)), s: 1, t: im > 0 ? F(1, 2) : F(-1, 2) };
    var b = F(1, 4);
    return { m: F(Math.abs(re)), s: 2, t: re > 0 ? (im > 0 ? b : b.neg()) : (im > 0 ? F(3, 4) : F(-3, 4)) };
  }
  function coefZ(re, im) { // a devant z
    if (re !== 0 && im !== 0) return '\\left(' + cTex(re, im) + '\\right)';
    if (im === 0) return re === 1 ? '' : re === -1 ? '-' : T.num(re);
    return T.mono(im, 'i', true);
  }
  function cPlus(re, im) { // « + (b) » en fin d'expression
    if (re === 0 && im === 0) return '';
    if (re !== 0 && im !== 0) return ' + \\left(' + cTex(re, im) + '\\right)';
    if (im === 0) return T.signed(re);
    return T.mono(im, 'i', false);
  }
  EM.gen.register({
    id: 'ts-similitude',
    titre: 'Éléments caractéristiques d\'une similitude directe',
    chapitres: ['ts-similitudes'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var aa = rng.pick(SIM_A), ar = aa[0], ai = aa[1], p = rng.int(-3, 3), q = rng.int(-3, 3);
      var u = 1 - ar, v = -ai, br = p * u - q * v, bi = p * v + q * u;
      var ma = modArg(ar, ai);
      var ecr = 'z\' = ' + coefZ(ar, ai) + 'z' + cPlus(br, bi);
      var k = radTex(ma.m, ma.s), th = angTex(ma.t);
      if (niveau === 3) {
        return {
          enonce: 'Soit $s$ la similitude directe de centre $\\Omega$ d\'affixe $\\omega = ' + cTex(p, q) + '$, de rapport $' + k + '$ et d\'angle $' + th + '$. Déterminer son écriture complexe $z\' = az + b$.',
          questions: [
            { label: '$a$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [ar, ai] },
            { label: '$b$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [br, bi] }
          ],
          indices: ['$a = ke^{i\\theta}$ où $k$ est le rapport et $\\theta$ l\'angle.', 'Le centre est invariant : $\\omega = a\\omega + b$, donc $b = \\omega(1 - a)$.'],
          solution: [
            '$a = ' + (k === '1' ? '' : k) + 'e^{i' + (th.charAt(0) === '-' ? '\\left(' + th + '\\right)' : th) + '} = ' + (k === '1' ? '' : k) + '\\left(\\cos\\left(' + th + '\\right) + i\\sin\\left(' + th + '\\right)\\right) = ' + cTex(ar, ai) + '$.',
            '$\\Omega$ est invariant : $\\omega = a\\omega + b$, donc $b = \\omega(1 - a) = (' + cTex(p, q) + ')(' + cTex(u, v) + ') = ' + cTex(br, bi) + '$.',
            'Donc $s : ' + ecr + '$.'
          ],
          aide: AIDE_CPLX
        };
      }
      var qs, sol = [], xa = rng.int(-3, 3), ya = rng.int(-3, 3);
      sol.push('$s$ a une écriture $z\' = az + b$ avec $a = ' + cTex(ar, ai) + '$ ; comme $a \\neq 1$, $s$ est une similitude directe de rapport $|a|$ et d\'angle $\\arg(a)$.');
      sol.push('Rapport : $k = |a| = ' + k + '$ ; angle : $\\theta = \\arg(a) = ' + th + '$.');
      sol.push('Le centre $\\Omega$ est le point invariant : $\\omega = a\\omega + b \\iff \\omega = \\dfrac{b}{1 - a} = \\dfrac{' + cTex(br, bi) + '}{' + cTex(u, v) + '} = ' + cTex(p, q) + '$.');
      if (niveau === 1) {
        qs = [
          { label: 'Rapport $k =$', type: 'number', reponse: radS(ma.m, ma.s), reponseTex: k },
          { label: 'Angle $\\theta =$', type: 'number', reponse: angS(ma.t), reponseTex: th },
          { label: 'Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [p, q] }
        ];
      } else {
        var xr = ar * xa - ai * ya + br, yr = ar * ya + ai * xa + bi;
        var nature = ma.m.equals(1) && ma.s === 1 ? 'une rotation' : (ai === 0 ? 'une homothétie' : 'ni une rotation, ni une homothétie');
        qs = [
          { label: 'Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [p, q] },
          { label: 'Image $A\'$ de $A$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [xr, yr] },
          qcm(rng, '$s$ est :', nature, ['une rotation', 'une homothétie', 'ni une rotation, ni une homothétie'])
        ];
        sol.push('$z_{A\'} = a z_A + b = (' + cTex(ar, ai) + ')(' + cTex(xa, ya) + ')' + cPlus(br, bi) + ' = ' + cTex(xr, yr) + '$.');
        sol.push(nature === 'une rotation' ? 'Le rapport vaut $1$ : $s$ est une rotation.' : nature === 'une homothétie' ? '$a$ est un réel ($\\theta = ' + th + '$) : $s$ est une homothétie de rapport $' + ar + '$.' : 'Le rapport est différent de $1$ et $a$ n\'est pas réel : $s$ n\'est ni une rotation ni une homothétie.');
      }
      return {
        enonce: 'Le plan complexe est rapporté à un repère orthonormé direct. Soit $s$ la transformation d\'écriture complexe $$' + ecr + '.$$' +
          (niveau === 1 ? 'Déterminer le rapport, l\'angle et le centre $\\Omega$ de $s$.' : 'Déterminer le centre $\\Omega$ de $s$, l\'affixe de l\'image $A\'$ du point $A$ d\'affixe $z_A = ' + cTex(xa, ya) + '$, et préciser la nature de $s$.'),
        questions: qs,
        indices: ['Rapport $k = |a|$ et angle $\\theta = \\arg(a)$.', 'Le centre $\\Omega$ vérifie $\\omega = a\\omega + b$.'],
        solution: sol,
        aide: 'Rapport : sqrt(2), 2sqrt(2)… ; angle : pi/4, -3pi/4… ; points : (x ; y).'
      };
    }
  });

  /* ================================================================== */
  /* Dénombrement et probabilités                                        */
  /* ================================================================== */
  /** \dfrac{n}{d}, suivi de la fraction simplifiée si elle diffère */
  function fq(n, d) { var f = F(n, d); return '\\dfrac{' + n + '}{' + d + '}' + (f.n === n && f.d === d ? '' : ' = ' + f.tex()); }
  function Cn(n, p) { return 'C_{' + n + '}^{' + p + '}'; }
  function An(n, p) { return 'A_{' + n + '}^{' + p + '}'; }

  EM.gen.register({
    id: 'ts-proba-tirages',
    titre: 'Probabilités : tirages de mangues',
    chapitres: ['ts-probabilites', 'tl-probabilites'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var R = rng.int(2, 6), V = rng.int(2, 5), N = R + V, w = C(N, 2);
        var pA = F(C(R, 2), w), pB = F(R * V, w);
        return {
          enonce: 'Un cageot contient ' + N + ' mangues : ' + R + ' de variété Kent et ' + V + ' de variété Diorou. On prend simultanément 2 mangues au hasard.<br>' +
            'Calculer le nombre de tirages possibles, puis la probabilité des événements $A$ : « obtenir deux mangues Kent » et $B$ : « obtenir deux mangues de variétés différentes ».',
          questions: [
            { label: '$\\Card(\\Omega) =$', type: 'number', reponse: w },
            { label: '$P(A) =$', type: 'number', reponse: pA },
            { label: '$P(B) =$', type: 'number', reponse: pB }
          ],
          indices: ['Un tirage simultané de 2 objets parmi $' + N + '$ est une combinaison : $' + Cn(N, 2) + '$ possibilités.', 'Les tirages sont équiprobables : $P(E) = \\dfrac{\\Card(E)}{\\Card(\\Omega)}$.'],
          solution: [
            '$\\Card(\\Omega) = ' + Cn(N, 2) + ' = \\dfrac{' + N + ' \\times ' + (N - 1) + '}{2} = ' + w + '$ ; les tirages sont équiprobables.',
            '$P(A) = \\dfrac{' + Cn(R, 2) + '}{' + w + '} = ' + fq(C(R, 2), w) + '$.',
            'Pour $B$, on choisit une mangue Kent et une mangue Diorou : $P(B) = \\dfrac{' + Cn(R, 1) + ' \\times ' + Cn(V, 1) + '}{' + w + '} = ' + fq(R * V, w) + '$.'
          ]
        };
      }
      if (niveau === 2) {
        var d = rng.int(2, 4), s = rng.int(5, 9), M = d + s, w3 = C(M, 3);
        var p0 = F(C(s, 3), w3), p1 = F(d * C(s, 2), w3), pc = F(1).sub(p0);
        var ville = rng.pick(['Thiès', 'Ziguinchor', 'Sédhiou', 'Kolda', 'Mbour']);
        return {
          enonce: 'Au marché de ' + ville + ', un panier contient ' + M + ' mangues dont ' + d + ' sont abîmées. Un client prend simultanément 3 mangues au hasard.<br>' +
            'Calculer la probabilité des événements $A$ : « aucune mangue n\'est abîmée », $B$ : « exactement une mangue est abîmée » et $C$ : « au moins une mangue est abîmée ».',
          questions: [
            { label: '$\\Card(\\Omega) =$', type: 'number', reponse: w3 },
            { label: '$P(A) =$', type: 'number', reponse: p0 },
            { label: '$P(B) =$', type: 'number', reponse: p1 },
            { label: '$P(C) =$', type: 'number', reponse: pc }
          ],
          indices: ['$\\Card(\\Omega) = ' + Cn(M, 3) + '$.', '« Au moins une » est l\'événement contraire de « aucune » : $P(C) = 1 - P(A)$.'],
          solution: [
            '$\\Card(\\Omega) = ' + Cn(M, 3) + ' = \\dfrac{' + M + ' \\times ' + (M - 1) + ' \\times ' + (M - 2) + '}{6} = ' + w3 + '$.',
            '$A$ : les 3 mangues sont choisies parmi les ' + s + ' saines : $P(A) = \\dfrac{' + Cn(s, 3) + '}{' + w3 + '} = ' + fq(C(s, 3), w3) + '$.',
            '$B$ : 1 abîmée parmi ' + d + ' et 2 saines parmi ' + s + ' : $P(B) = \\dfrac{' + Cn(d, 1) + ' \\times ' + Cn(s, 2) + '}{' + w3 + '} = ' + fq(d * C(s, 2), w3) + '$.',
            '$C = \\overline{A}$, donc $P(C) = 1 - P(A) = ' + pc.tex() + '$.'
          ]
        };
      }
      var R3 = rng.int(3, 6), V3 = rng.int(2, 5), N3 = R3 + V3, w4 = A(N3, 3);
      var pK = F(A(R3, 3), w4), pR = F(3 * R3 * R3 * V3, N3 * N3 * N3);
      return {
        enonce: 'Un cageot contient ' + N3 + ' mangues : ' + R3 + ' Kent et ' + V3 + ' Diorou. On tire successivement 3 mangues.<br>' +
          '1. Les tirages se font <b>sans remise</b>. Calculer le nombre de tirages possibles et la probabilité d\'obtenir trois mangues Kent.<br>' +
          '2. Les tirages se font <b>avec remise</b>. Calculer la probabilité d\'obtenir exactement deux mangues Kent.',
        questions: [
          { label: 'Sans remise : $\\Card(\\Omega) =$', type: 'number', reponse: w4 },
          { label: 'Sans remise : $P(\\text{3 Kent}) =$', type: 'number', reponse: pK },
          { label: 'Avec remise : $P(\\text{exactement 2 Kent}) =$', type: 'number', reponse: pR }
        ],
        indices: ['Tirages successifs sans remise : arrangements $' + An(N3, 3) + '$.', 'Avec remise, les tirages sont indépendants : choisis la position de la mangue Diorou ($3$ possibilités).'],
        solution: [
          'Sans remise, l\'ordre compte : $\\Card(\\Omega) = ' + An(N3, 3) + ' = ' + N3 + ' \\times ' + (N3 - 1) + ' \\times ' + (N3 - 2) + ' = ' + w4 + '$.',
          '$P(\\text{3 Kent}) = \\dfrac{' + An(R3, 3) + '}{' + w4 + '} = ' + fq(A(R3, 3), w4) + '$.',
          'Avec remise, à chaque tirage $P(\\text{Kent}) = ' + F(R3, N3).tex() + '$ et $P(\\text{Diorou}) = ' + F(V3, N3).tex() + '$. Il y a 3 positions possibles pour la Diorou :',
          '$P = 3 \\times \\left(' + F(R3, N3).tex() + '\\right)^2 \\times ' + F(V3, N3).tex() + ' = ' + pR.tex() + '$.'
        ]
      };
    }
  });

  EM.gen.register({
    id: 'ts-loi-binomiale',
    titre: 'Loi binomiale : pièces défectueuses',
    chapitres: ['ts-probabilites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var p = rng.pick([0.02, 0.03, 0.04, 0.05, 0.1, 0.15, 0.2]), n = rng.pick([5, 8, 10, 12, 15, 20]), k = rng.int(1, 3);
      var q = rd(1 - p, 4);
      var P = function (j) { return C(n, j) * Math.pow(p, j) * Math.pow(q, n - j); };
      var usine = rng.bool();
      var nomD = usine ? 'boulon(s) défectueux' : 'mangue(s) véreuse(s)';
      var ctx = usine
        ? 'Une usine de Thiès fabrique des boulons. ' + T.num(p * 100) + ' % des boulons sont défectueux. On prélève au hasard ' + n + ' boulons ; la production est assez importante pour assimiler ce prélèvement à ' + n + ' tirages indépendants avec remise. On note $X$ le nombre de boulons défectueux.'
        : 'Dans un verger des Niayes, ' + T.num(p * 100) + ' % des mangues sont véreuses. Un exportateur prélève au hasard ' + n + ' mangues ; on assimile ce prélèvement à ' + n + ' tirages indépendants avec remise. On note $X$ le nombre de mangues véreuses.';
      var intro = '$X$ compte le nombre de succès (« défaut ») lors de $n = ' + n + '$ épreuves identiques et indépendantes de probabilité de succès $p = ' + T.num(p) + '$ : $X$ suit la loi binomiale $\\mathcal{B}(' + n + ' \\,;\\, ' + T.num(p) + ')$, et $P(X = k) = ' + Cn('n', 'k') + 'p^k(1 - p)^{n - k}$.';
      if (niveau === 1) {
        var p0 = P(0), pk = P(k), E = rd(n * p, 6);
        return {
          enonce: ctx + '<br>Justifier que $X$ suit une loi binomiale, puis calculer $P(X = 0)$, $P(X = ' + k + ')$ (arrondis à $10^{-3}$) et l\'espérance $E(X)$.',
          questions: [
            { label: '$P(X = 0) \\approx$', type: 'number', reponse: p0, tol: 0.001, reponseTex: T.num(rd(p0, 3)) },
            { label: '$P(X = ' + k + ') \\approx$', type: 'number', reponse: pk, tol: 0.001, reponseTex: T.num(rd(pk, 3)) },
            { label: '$E(X) =$', type: 'number', reponse: E }
          ],
          indices: ['Repère $n$ et $p$ : $X \\sim \\mathcal{B}(n \\,;\\, p)$.', '$P(X = k) = ' + Cn('n', 'k') + 'p^k(1 - p)^{n - k}$ et $E(X) = np$.'],
          solution: [
            intro,
            '$P(X = 0) = (1 - p)^{' + n + '} = ' + T.num(q) + '^{' + n + '} \\approx ' + T.num(rd(p0, 3)) + '$.',
            '$P(X = ' + k + ') = ' + Cn(n, k) + ' \\times ' + T.num(p) + '^{' + k + '} \\times ' + T.num(q) + '^{' + (n - k) + '} = ' + C(n, k) + ' \\times ' + T.num(p) + '^{' + k + '} \\times ' + T.num(q) + '^{' + (n - k) + '} \\approx ' + T.num(rd(pk, 3)) + '$.',
            '$E(X) = np = ' + n + ' \\times ' + T.num(p) + ' = ' + T.num(E) + '$ : en moyenne, ' + T.num(E) + ' ' + nomD + ' par prélèvement de ' + n + '.'
          ],
          aide: 'Donne les probabilités sous forme décimale, par exemple 0,817.'
        };
      }
      var pge1 = 1 - P(0), ple1 = P(0) + P(1), V = rd(n * p * q, 6), n0 = 1;
      while (Math.pow(q, n0) > 0.05) n0++;
      return {
        enonce: ctx + '<br>Calculer $P(X \\geq 1)$ et $P(X \\leq 1)$ (arrondis à $10^{-3}$) et la variance $V(X)$. Combien faudrait-il prélever ' + (usine ? 'de boulons' : 'de mangues') + ', au minimum, pour que la probabilité d\'en trouver au moins ' + (usine ? 'un défectueux' : 'une véreuse') + ' atteigne $0{,}95$ ?',
        questions: [
          { label: '$P(X \\geq 1) \\approx$', type: 'number', reponse: pge1, tol: 0.001, reponseTex: T.num(rd(pge1, 3)) },
          { label: '$P(X \\leq 1) \\approx$', type: 'number', reponse: ple1, tol: 0.001, reponseTex: T.num(rd(ple1, 3)) },
          { label: '$V(X) =$', type: 'number', reponse: V },
          { label: 'Nombre minimal de prélèvements :', type: 'number', reponse: n0 }
        ],
        indices: ['$P(X \\geq 1) = 1 - P(X = 0)$ et $P(X \\leq 1) = P(X = 0) + P(X = 1)$.', 'Pour $m$ prélèvements : $1 - ' + T.num(q) + '^{m} \\geq 0{,}95 \\iff ' + T.num(q) + '^{m} \\leq 0{,}05$ ; utilise $\\ln$.'],
        solution: [
          intro,
          '$P(X \\geq 1) = 1 - P(X = 0) = 1 - ' + T.num(q) + '^{' + n + '} \\approx ' + T.num(rd(pge1, 3)) + '$.',
          '$P(X \\leq 1) = ' + T.num(q) + '^{' + n + '} + ' + n + ' \\times ' + T.num(p) + ' \\times ' + T.num(q) + '^{' + (n - 1) + '} \\approx ' + T.num(rd(ple1, 3)) + '$.',
          '$V(X) = np(1 - p) = ' + n + ' \\times ' + T.num(p) + ' \\times ' + T.num(q) + ' = ' + T.num(V) + '$.',
          'Avec $m$ prélèvements : $1 - ' + T.num(q) + '^{m} \\geq 0{,}95 \\iff ' + T.num(q) + '^{m} \\leq 0{,}05 \\iff m \\geq \\dfrac{\\ln 0{,}05}{\\ln ' + T.num(q) + '} \\approx ' + T.num(rd(Math.log(0.05) / Math.log(q), 2)) + '$ (on divise par $\\ln ' + T.num(q) + ' < 0$).',
          'Il faut au minimum $' + n0 + '$ prélèvements.'
        ],
        aide: 'Donne les probabilités sous forme décimale, par exemple 0,817.'
      };
    }
  });

  EM.gen.register({
    id: 'ts-variable-aleatoire',
    titre: 'Loi d\'une variable aléatoire, espérance et variance',
    chapitres: ['ts-probabilites', 'tl-probabilites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var vals = rng.sample(EM.util.range(-3, 6), 4).sort(function (u, v) { return u - v; });
        var D = rng.pick([10, 12, 20]), nums = [], rest = D;
        for (var i = 0; i < 3; i++) { var x = rng.int(1, Math.max(1, rest - (3 - i))); nums.push(x); rest -= x; }
        nums.push(rest);
        if (rest < 1) { nums = [1, 2, 3, D - 6]; }
        var ps = nums.map(function (v) { return F(v, D); }), j = rng.int(0, 3);
        var E = F(0), E2 = F(0);
        ps.forEach(function (pp, i2) { E = E.add(pp.mul(vals[i2])); E2 = E2.add(pp.mul(vals[i2] * vals[i2])); });
        var V = E2.sub(E.mul(E));
        var ligne1 = ['x_i'].concat(vals.map(String)), ligne2 = ['P(X = x_i)'].concat(ps.map(function (pp, i2) { return i2 === j ? 'a' : pp.tex(); }));
        var autres = ps.filter(function (pp, i2) { return i2 !== j; });
        return {
          enonce: 'La loi de probabilité d\'une variable aléatoire $X$ est donnée par le tableau suivant :' + tabTex([ligne1, ligne2]) + 'Calculer $a$, puis l\'espérance $E(X)$ et la variance $V(X)$.',
          questions: [
            { label: '$a =$', type: 'number', reponse: ps[j] },
            { label: '$E(X) =$', type: 'number', reponse: E },
            { label: '$V(X) =$', type: 'number', reponse: V }
          ],
          indices: ['La somme des probabilités vaut $1$.', '$E(X) = \\sum x_i p_i$ et $V(X) = \\sum x_i^2 p_i - [E(X)]^2$.'],
          solution: [
            '$a = 1 - \\left(' + autres.map(function (pp) { return pp.tex(); }).join(' + ') + '\\right) = ' + ps[j].tex() + '$.',
            '$E(X) = ' + vals.map(function (v, i2) { return T.par(v) + ' \\times ' + ps[i2].tex(); }).join(' + ') + ' = ' + E.tex() + '$.',
            '$E(X^2) = ' + vals.map(function (v, i2) { return T.par(v) + '^2 \\times ' + ps[i2].tex(); }).join(' + ') + ' = ' + E2.tex() + '$.',
            '$V(X) = E(X^2) - [E(X)]^2 = ' + E2.tex() + ' - \\left(' + E.tex() + '\\right)^2 = ' + V.tex() + '$.'
          ],
          aide: 'Réponses exactes : fractions acceptées, par exemple 7/20.'
        };
      }
      var R = rng.int(2, 5), B = rng.int(2, 5), N = R + B, w = C(N, 2);
      var G = rng.pick([1000, 1500, 2000]), g = rng.pick([0, 200, 300, 500]), m = rng.pick([300, 500, 700]);
      var pG = F(C(R, 2), w), pg = F(R * B, w), pm = F(C(B, 2), w);
      var E = pG.mul(G).add(pg.mul(g)).sub(pm.mul(m));
      var verdict = E.sign() > 0 ? 'favorable au joueur' : E.sign() < 0 ? 'défavorable au joueur' : 'équitable';
      return {
        enonce: 'À la kermesse d\'un lycée de Dakar, une urne contient ' + R + ' boules rouges et ' + B + ' boules noires. Un joueur tire simultanément 2 boules. ' +
          'S\'il obtient 2 rouges, il gagne $' + T.num(G) + '$ F CFA ; une rouge et une noire, il gagne $' + T.num(g) + '$ F CFA ; deux noires, il perd $' + T.num(m) + '$ F CFA. On note $X$ le gain algébrique du joueur.<br>' +
          'Déterminer la loi de $X$, calculer $E(X)$ et dire si le jeu est favorable au joueur.',
        questions: [
          { label: '$P(X = ' + T.num(G) + ') =$', type: 'number', reponse: pG },
          { label: '$P(X = -' + T.num(m) + ') =$', type: 'number', reponse: pm },
          { label: '$E(X) =$', type: 'number', reponse: E, tol: 0.01, reponseTex: E.tex() + (E.isInt() ? '' : ' \\approx ' + T.num(rd(E.value(), 2))), unite: 'F CFA' },
          qcm(rng, 'Le jeu est :', verdict, ['favorable au joueur', 'défavorable au joueur', 'équitable'])
        ],
        indices: ['Il y a $' + Cn(N, 2) + ' = ' + w + '$ tirages équiprobables.', '$E(X) = \\sum x_i P(X = x_i)$ ; le jeu est favorable si $E(X) > 0$.'],
        solution: [
          '$\\Card(\\Omega) = ' + Cn(N, 2) + ' = ' + w + '$. $X$ prend les valeurs $' + T.num(G) + '$, $' + T.num(g) + '$ et $-' + T.num(m) + '$.',
          '$P(X = ' + T.num(G) + ') = \\dfrac{' + Cn(R, 2) + '}{' + w + '} = ' + pG.tex() + '$ ; $P(X = ' + T.num(g) + ') = \\dfrac{' + R + ' \\times ' + B + '}{' + w + '} = ' + pg.tex() + '$ ; $P(X = -' + T.num(m) + ') = \\dfrac{' + Cn(B, 2) + '}{' + w + '} = ' + pm.tex() + '$.',
          '$E(X) = ' + T.num(G) + ' \\times ' + pG.tex() + ' + ' + T.num(g) + ' \\times ' + pg.tex() + ' - ' + T.num(m) + ' \\times ' + pm.tex() + ' = ' + E.tex() + (E.isInt() ? '' : ' \\approx ' + T.num(rd(E.value(), 2))) + '$ F CFA.',
          'Le jeu est ' + verdict + ' (' + (E.sign() > 0 ? '$E(X) > 0$' : E.sign() < 0 ? '$E(X) < 0$' : '$E(X) = 0$') + ').'
        ],
        aide: 'Probabilités exactes (fractions). Pour $E(X)$, une fraction ou une valeur arrondie à 0,01.'
      };
    }
  });

  EM.gen.register({
    id: 'ts-proba-totales',
    titre: 'Probabilités conditionnelles et formule des probabilités totales',
    chapitres: ['ts-probabilites'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var a = rng.pick([40, 55, 60, 65, 70, 75]), dA = rng.int(1, 6), dB;
        do { dB = rng.int(1, 6); } while (dB === dA);
        var pAD = F(a * dA, 10000), pD = F(a * dA + (100 - a) * dB, 10000), pDA = pAD.div(pD);
        return {
          enonce: 'Une usine de Thiès produit des carreaux sur deux machines $M_1$ et $M_2$. La machine $M_1$ fournit ' + a + ' % de la production et la machine $M_2$ le reste. ' +
            dA + ' % des carreaux de $M_1$ et ' + dB + ' % de ceux de $M_2$ sont défectueux. On choisit un carreau au hasard ; on note $M_1$ : « il provient de $M_1$ » et $D$ : « il est défectueux ».<br>' +
            'Calculer $P(M_1 \\cap D)$, $P(D)$, puis la probabilité qu\'un carreau défectueux provienne de $M_1$ (arrondie à $10^{-3}$).',
          questions: [
            { label: '$P(M_1 \\cap D) =$', type: 'number', reponse: pAD },
            { label: '$P(D) =$', type: 'number', reponse: pD },
            { label: '$P_D(M_1) \\approx$', type: 'number', reponse: pDA.value(), tol: 0.001, reponseTex: T.num(rd(pDA.value(), 3)) }
          ],
          indices: ['Traduis l\'énoncé : $P(M_1) = ' + T.num(a / 100) + '$, $P_{M_1}(D) = ' + T.num(dA / 100) + '$, $P_{M_2}(D) = ' + T.num(dB / 100) + '$. Un arbre pondéré aide beaucoup.', 'Formule des probabilités totales : $P(D) = P(M_1 \\cap D) + P(M_2 \\cap D)$ ; puis $P_D(M_1) = \\dfrac{P(M_1 \\cap D)}{P(D)}$.'],
          solution: [
            '$P(M_1) = ' + T.num(a / 100) + '$, $P(M_2) = ' + T.num(1 - a / 100) + '$, $P_{M_1}(D) = ' + T.num(dA / 100) + '$, $P_{M_2}(D) = ' + T.num(dB / 100) + '$.',
            '$P(M_1 \\cap D) = P(M_1) \\times P_{M_1}(D) = ' + T.num(a / 100) + ' \\times ' + T.num(dA / 100) + ' = ' + T.num(pAD.value()) + '$.',
            '$M_1$ et $M_2$ forment une partition de l\'univers : $P(D) = P(M_1 \\cap D) + P(M_2 \\cap D) = ' + T.num(pAD.value()) + ' + ' + T.num(rd(1 - a / 100, 4)) + ' \\times ' + T.num(dB / 100) + ' = ' + T.num(pD.value()) + '$.',
            '$P_D(M_1) = \\dfrac{P(M_1 \\cap D)}{P(D)} = \\dfrac{' + T.num(pAD.value()) + '}{' + T.num(pD.value()) + '} \\approx ' + T.num(rd(pDA.value(), 3)) + '$.'
          ],
          aide: 'Valeurs exactes en décimal (0,018) ou en fraction ; la dernière arrondie à 0,001.'
        };
      }
      var parts = rng.pick([[50, 30, 20], [40, 35, 25], [45, 30, 25], [60, 25, 15], [30, 50, 20]]);
      var taux = rng.sample([2, 3, 4, 5, 6, 7, 8], 3);
      var noms = ['les Niayes', 'la Casamance', 'la région de Thiès'];
      var inter = parts.map(function (pp, i) { return F(pp * taux[i], 10000); });
      var pD2 = inter[0].add(inter[1]).add(inter[2]);
      var post = inter[0].div(pD2), nonD2 = F(parts[1] * (100 - taux[1]), 10000);
      return {
        enonce: 'Un exportateur de mangues s\'approvisionne dans trois zones : ' + parts[0] + ' % de ses mangues viennent des Niayes ($Z_1$), ' + parts[1] + ' % de Casamance ($Z_2$) et ' + parts[2] + ' % de la région de Thiès ($Z_3$). ' +
          'Les proportions de mangues abîmées sont respectivement ' + taux[0] + ' %, ' + taux[1] + ' % et ' + taux[2] + ' %. On choisit une mangue au hasard et on note $D$ : « la mangue est abîmée ».<br>' +
          'Calculer $P(D)$, la probabilité qu\'une mangue abîmée provienne des Niayes (arrondie à $10^{-3}$) et $P(Z_2 \\cap \\overline{D})$.',
        questions: [
          { label: '$P(D) =$', type: 'number', reponse: pD2 },
          { label: '$P_D(Z_1) \\approx$', type: 'number', reponse: post.value(), tol: 0.001, reponseTex: T.num(rd(post.value(), 3)) },
          { label: '$P(Z_2 \\cap \\overline{D}) =$', type: 'number', reponse: nonD2 }
        ],
        indices: ['$Z_1$, $Z_2$, $Z_3$ forment une partition : $P(D) = \\sum P(Z_i) P_{Z_i}(D)$.', '$P_D(Z_1) = \\dfrac{P(Z_1 \\cap D)}{P(D)}$ et $P_{Z_2}(\\overline{D}) = 1 - P_{Z_2}(D)$.'],
        solution: [
          'Formule des probabilités totales : $P(D) = ' + parts.map(function (pp, i) { return T.num(pp / 100) + ' \\times ' + T.num(taux[i] / 100); }).join(' + ') + ' = ' + T.num(pD2.value()) + '$.',
          '$P_D(Z_1) = \\dfrac{P(Z_1 \\cap D)}{P(D)} = \\dfrac{' + T.num(inter[0].value()) + '}{' + T.num(pD2.value()) + '} \\approx ' + T.num(rd(post.value(), 3)) + '$.',
          '$P(Z_2 \\cap \\overline{D}) = P(Z_2) \\times P_{Z_2}(\\overline{D}) = ' + T.num(parts[1] / 100) + ' \\times ' + T.num((100 - taux[1]) / 100) + ' = ' + T.num(nonD2.value()) + '$.'
        ],
        aide: 'Valeurs exactes en décimal ou en fraction ; la probabilité conditionnelle arrondie à 0,001.'
      };
    }
  });

  /* ================================================================== */
  /* Statistiques à deux variables                                       */
  /* ================================================================== */
  EM.gen.register({
    id: 'ts-stat-regression',
    titre: 'Série statistique double : ajustement linéaire',
    chapitres: ['ts-statistiques', 'tl-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick(['arachide', 'oignon', 'revision']), xs, ys, guard = 0, st;
      var cfg = {
        arachide: { x: 'x_i', y: 'y_i', intro: 'Dans le bassin arachidier (région de Kaolack), on a relevé pendant six années la pluviométrie $x$ (en centaines de mm) et le rendement $y$ de l\'arachide (en quintaux par hectare) :', dom: [3, 9], pente: [1, 1.5, 2], b: [1, 4], x0txt: 'une pluviométrie de ', unite: 'quintaux par hectare' },
        oignon: { x: 'x_i', y: 'y_i', intro: 'Au marché de Thiaroye, on a relevé le prix $x$ du kilogramme d\'oignon (en centaines de F CFA) et la quantité $y$ vendue dans la journée (en centaines de kg) :', dom: [2, 8], pente: [-2, -3, -1.5], b: [26, 32], x0txt: 'un prix de ', unite: 'centaines de kg' },
        revision: { x: 'x_i', y: 'y_i', intro: 'Dans une classe de Terminale de Saint-Louis, on a relevé pour six élèves le nombre $x$ d\'heures de révision hebdomadaires et la note $y$ obtenue au devoir de mathématiques :', dom: [1, 8], pente: [1, 1.5], b: [4, 7], x0txt: '', unite: 'points' }
      }[ctx];
      do {
        xs = rng.sample(EM.util.range(cfg.dom[0], cfg.dom[1]), 6).sort(function (u, v) { return u - v; });
        var al = rng.pick(cfg.pente), be = rng.int(cfg.b[0], cfg.b[1]);
        ys = xs.map(function (x) { return Math.round(al * x + be + rng.int(-1, 1)); });
        st = stats2(xs, ys);
        guard++;
      } while ((st.vy <= 0 || Math.abs(st.r) < 0.9) && guard < 50);
      var n = xs.length, a = st.cov / st.vx, b = st.my - a * st.mx;
      var x0 = (xs[2] + xs[3]) / 2, a2 = rd(a, 2), b2 = rd(b, 2), y0 = a2 * x0 + b2;
      var tab = tabTex([['x_i'].concat(xs.map(String)), ['y_i'].concat(ys.map(String))]);
      var sol = [
        'Point moyen : $\\bar{x} = \\dfrac{' + st.sx + '}{' + n + '} = ' + T.num(rd(st.mx, 4)) + '$ et $\\bar{y} = \\dfrac{' + st.sy + '}{' + n + '} = ' + T.num(rd(st.my, 4)) + '$, donc $G\\left(' + T.num(rd(st.mx, 2)) + ' \\,;\\, ' + T.num(rd(st.my, 2)) + '\\right)$.',
        'Variance de $x$ : $V(x) = \\dfrac{1}{' + n + '}\\sum x_i^2 - \\bar{x}^2 = \\dfrac{' + st.sxx + '}{' + n + '} - ' + T.num(rd(st.mx, 4)) + '^2 \\approx ' + T.num(rd(st.vx, 4)) + '$.',
        'Covariance : $\\operatorname{cov}(x, y) = \\dfrac{1}{' + n + '}\\sum x_i y_i - \\bar{x}\\,\\bar{y} = \\dfrac{' + st.sxy + '}{' + n + '} - ' + T.num(rd(st.mx, 4)) + ' \\times ' + T.num(rd(st.my, 4)) + ' \\approx ' + T.num(rd(st.cov, 4)) + '$.',
        'Droite de régression de $y$ en $x$ (moindres carrés) : $a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)} \\approx ' + T.num(rd(a, 4)) + '$ et $b = \\bar{y} - a\\bar{x} \\approx ' + T.num(rd(b, 4)) + '$, soit $y \\approx ' + (a2 === 1 ? '' : a2 === -1 ? '-' : T.num(a2)) + 'x ' + (b2 < 0 ? '- ' + T.num(-b2) : '+ ' + T.num(b2)) + '$.'
      ];
      var qs;
      if (niveau === 1) {
        qs = [
          { label: 'Point moyen $G$ : $(\\bar{x} \\,;\\, \\bar{y}) =$', type: 'tuple', reponse: [st.mx, st.my], tol: 0.01, reponseTex: pt(rd(st.mx, 2), rd(st.my, 2)) },
          { label: '$\\operatorname{cov}(x, y) \\approx$', type: 'number', reponse: st.cov, tol: 0.01, reponseTex: T.num(rd(st.cov, 2)) },
          { label: '$a \\approx$', type: 'number', reponse: a, tol: 0.01, reponseTex: T.num(a2) },
          { label: '$b \\approx$', type: 'number', reponse: b, tol: 0.05, reponseTex: T.num(b2) }
        ];
      } else {
        var forte = Math.abs(st.r) >= 0.87;
        var nat = forte ? (st.r > 0 ? 'forte corrélation positive' : 'forte corrélation négative') : 'corrélation faible';
        sol.splice(3, 0, 'Variance de $y$ : $V(y) \\approx ' + T.num(rd(st.vy, 4)) + '$ ; coefficient de corrélation linéaire : $r = \\dfrac{\\operatorname{cov}(x, y)}{\\sigma(x)\\sigma(y)} = \\dfrac{\\operatorname{cov}(x, y)}{\\sqrt{V(x)V(y)}} \\approx ' + T.num(rd(st.r, 3)) + '$.');
        sol.splice(4, 0, '$|r| ' + (forte ? '\\geq' : '<') + ' 0{,}87$ : ' + (forte ? 'la corrélation linéaire est forte (' + (st.r > 0 ? 'positive' : 'négative') + ') et un ajustement affine est justifié.' : 'la corrélation linéaire est faible.'));
        sol.push('Estimation pour $x = ' + T.num(x0) + '$ : $y \\approx ' + T.num(a2) + ' \\times ' + T.num(x0) + (b2 < 0 ? ' - ' + T.num(-b2) : ' + ' + T.num(b2)) + ' \\approx ' + T.num(rd(y0, 2)) + '$ ' + cfg.unite + '.');
        qs = [
          { label: '$r \\approx$', type: 'number', reponse: st.r, tol: 0.01, reponseTex: T.num(rd(st.r, 2)) },
          qcm(rng, 'On observe une :', nat, ['forte corrélation positive', 'forte corrélation négative', 'corrélation faible']),
          { label: '$a \\approx$', type: 'number', reponse: a, tol: 0.01, reponseTex: T.num(a2) },
          { label: '$b \\approx$', type: 'number', reponse: b, tol: 0.05, reponseTex: T.num(b2) },
          { label: 'Estimation de $y$ pour $x = ' + T.num(x0) + '$ :', type: 'number', reponse: y0, tol: 0.15, reponseTex: T.num(rd(y0, 2)) }
        ];
      }
      return {
        enonce: cfg.intro + tab + (niveau === 1
          ? 'Calculer les coordonnées du point moyen $G$, la covariance de la série, puis déterminer par la méthode des moindres carrés une équation $y = ax + b$ de la droite de régression de $y$ en $x$ (résultats arrondis à $10^{-2}$).'
          : 'Calculer le coefficient de corrélation linéaire $r$ et interpréter. Déterminer la droite de régression de $y$ en $x$ par la méthode des moindres carrés ($a$ et $b$ arrondis à $10^{-2}$) et l\'utiliser pour estimer $y$ lorsque $x = ' + T.num(x0) + '$.'),
        questions: qs,
        indices: ['$\\bar{x} = \\dfrac{1}{n}\\sum x_i$, $V(x) = \\dfrac{1}{n}\\sum x_i^2 - \\bar{x}^2$, $\\operatorname{cov}(x, y) = \\dfrac{1}{n}\\sum x_i y_i - \\bar{x}\\,\\bar{y}$.', '$a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$, $b = \\bar{y} - a\\bar{x}$ et $r = \\dfrac{\\operatorname{cov}(x, y)}{\\sigma(x)\\sigma(y)}$.'],
        solution: sol,
        aide: 'Valeurs décimales arrondies à 0,01 (la virgule est acceptée).'
      };
    }
  });
  function stats2(xs, ys) {
    var n = xs.length, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; syy += ys[i] * ys[i]; sxy += xs[i] * ys[i]; }
    var mx = sx / n, my = sy / n, vx = sxx / n - mx * mx, vy = syy / n - my * my, cov = sxy / n - mx * my;
    return { sx: sx, sy: sy, sxx: sxx, syy: syy, sxy: sxy, mx: mx, my: my, vx: vx, vy: vy, cov: cov, r: vy > 0 ? cov / Math.sqrt(vx * vy) : 0 };
  }

  /* ================================================================== */
  /* Arithmétique (Tle S1)                                               */
  /* ================================================================== */
  function euclideLignes(a, b) {
    var L = [], r0 = a, r1 = b;
    while (r1) { var q = Math.floor(r0 / r1), r = r0 - q * r1; L.push('$' + r0 + ' = ' + r1 + ' \\times ' + q + ' + ' + r + '$'); r0 = r1; r1 = r; }
    return L;
  }
  /** Algorithme d'Euclide étendu : a·u + b·v = pgcd, avec les étapes (r = a·u + b·v). */
  function bezout(a, b) {
    var r0 = a, r1 = b, u0 = 1, u1 = 0, v0 = 0, v1 = 1, et = [];
    while (r1) {
      var q = Math.floor(r0 / r1), r2 = r0 - q * r1, u2 = u0 - q * u1, v2 = v0 - q * v1;
      if (r2) et.push('$' + r2 + ' = ' + r0 + ' - ' + q + ' \\times ' + r1 + ' = ' + a + ' \\times ' + T.par(u2) + ' + ' + b + ' \\times ' + T.par(v2) + '$');
      r0 = r1; r1 = r2; u0 = u1; u1 = u2; v0 = v1; v1 = v2;
    }
    return { g: r0, u: u0, v: v0, etapes: et };
  }
  function mod(x, m) { return ((x % m) + m) % m; }

  EM.gen.register({
    id: 'ts1-pgcd-diophante',
    titre: 'PGCD, identité de Bézout, équation ax + by = c',
    chapitres: ['ts1-arithmetique'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      if (niveau === 1) {
        var d = rng.pick([6, 8, 12, 14, 15, 18, 21, 24]), m, n;
        do { m = rng.int(5, 30); n = rng.int(3, 25); } while (m <= n || ar.gcd(m, n) !== 1);
        var a = d * m, b = d * n;
        return {
          enonce: 'À l\'aide de l\'algorithme d\'Euclide, déterminer $\\operatorname{PGCD}(' + a + ' \\,;\\, ' + b + ')$, puis en déduire $\\operatorname{PPCM}(' + a + ' \\,;\\, ' + b + ')$.',
          questions: [
            { label: 'PGCD :', type: 'number', reponse: d },
            { label: 'PPCM :', type: 'number', reponse: d * m * n }
          ],
          indices: ['Effectue les divisions euclidiennes successives : le PGCD est le dernier reste non nul.', '$\\operatorname{PGCD}(a, b) \\times \\operatorname{PPCM}(a, b) = ab$.'],
          solution: ['Divisions euclidiennes successives :'].concat(euclideLignes(a, b)).concat([
            'Le dernier reste non nul est $' + d + '$ : $\\operatorname{PGCD}(' + a + ' \\,;\\, ' + b + ') = ' + d + '$.',
            '$\\operatorname{PPCM} = \\dfrac{' + a + ' \\times ' + b + '}{' + d + '} = ' + (d * m * n) + '$.'
          ])
        };
      }
      if (niveau === 2) {
        var a2, b2;
        do { a2 = rng.int(40, 200); b2 = rng.int(15, 90); } while (a2 <= b2 || ar.gcd(a2, b2) !== 1 || b2 < 3);
        var bz = bezout(a2, b2), u = mod(bz.u, b2), v = (1 - a2 * u) / b2, kk = (u - bz.u) / b2;
        controle(a2 * u + b2 * v === 1 && u >= 0 && u < b2, 'bezout');
        return {
          enonce: 'Montrer que $' + a2 + '$ et $' + b2 + '$ sont premiers entre eux, puis déterminer le couple d\'entiers relatifs $(u \\,;\\, v)$ tel que $' + a2 + 'u + ' + b2 + 'v = 1$ et $0 \\leq u < ' + b2 + '$.',
          questions: [
            { label: '$\\operatorname{PGCD}(' + a2 + ' \\,;\\, ' + b2 + ') =$', type: 'number', reponse: 1 },
            { label: '$(u \\,;\\, v) =$', type: 'tuple', reponse: [u, v] }
          ],
          indices: ['Applique l\'algorithme d\'Euclide : le dernier reste non nul doit être $1$.', 'Remonte les calculs (algorithme d\'Euclide étendu), puis ajuste avec $(u + ' + b2 + 'k \\,;\\, v - ' + a2 + 'k)$.'],
          solution: ['Algorithme d\'Euclide :'].concat(euclideLignes(a2, b2)).concat([
            'Le dernier reste non nul est $1$ : $' + a2 + '$ et $' + b2 + '$ sont premiers entre eux. On exprime chaque reste en fonction de $' + a2 + '$ et $' + b2 + '$ :'
          ]).concat(bz.etapes).concat([
            'Une solution est $(' + bz.u + ' \\,;\\, ' + bz.v + ')$. Les autres s\'écrivent $(' + bz.u + ' + ' + b2 + 'k \\,;\\, ' + bz.v + ' - ' + a2 + 'k)$, $k \\in \\Z$.',
            'Pour $0 \\leq u < ' + b2 + '$, on prend $k = ' + kk + '$ : $(u \\,;\\, v) = (' + u + ' \\,;\\, ' + v + ')$. Vérification : $' + a2 + ' \\times ' + u + ' + ' + b2 + ' \\times ' + T.par(v) + ' = 1$.'
          ]),
          aide: AIDE_TUPLE
        };
      }
      var g = rng.pick([1, 2, 3, 5]), ap, bp;
      do { ap = rng.int(4, 25); bp = rng.int(3, 20); } while (ap === bp || ar.gcd(ap, bp) !== 1);
      var cp = rng.int(1, 12), A3 = g * ap, B3 = g * bp, C3 = g * cp;
      var bz3 = bezout(ap, bp), x0 = bz3.u * cp, y0 = bz3.v * cp;
      var x = mod(x0, bp), k3 = (x - x0) / bp, y = y0 - ap * k3;
      controle(A3 * x + B3 * y === C3 && x >= 0 && x < bp, 'diophante');
      var sol = [];
      sol.push('$\\operatorname{PGCD}(' + A3 + ' \\,;\\, ' + B3 + ') = ' + g + '$ ' + (g > 1 ? 'et $' + g + '$ divise $' + C3 + '$ : on divise par $' + g + '$, l\'équation équivaut à $' + ap + 'x + ' + bp + 'y = ' + cp + '$.' : ': les coefficients sont premiers entre eux, l\'équation a des solutions.'));
      sol.push('Bézout : par l\'algorithme d\'Euclide étendu, $' + ap + ' \\times ' + T.par(bz3.u) + ' + ' + bp + ' \\times ' + T.par(bz3.v) + ' = 1$.');
      sol.push('En multipliant par $' + cp + '$ : $(x_0 \\,;\\, y_0) = (' + x0 + ' \\,;\\, ' + y0 + ')$ est une solution particulière.');
      sol.push('Si $(x \\,;\\, y)$ est solution, en soustrayant $' + ap + 'x_0 + ' + bp + 'y_0 = ' + cp + '$ : $' + ap + T.xMinus(x0) + ' = -' + bp + T.xMinus(y0, 'y') + '$. Comme $' + ap + '$ et $' + bp + '$ sont premiers entre eux, le théorème de Gauss donne $x = ' + x0 + ' + ' + bp + 'k$ et $y = ' + y0 + ' - ' + ap + 'k$, $k \\in \\Z$.');
      sol.push('$0 \\leq x < ' + bp + '$ impose $k = ' + k3 + '$ : $(x \\,;\\, y) = (' + x + ' \\,;\\, ' + y + ')$.');
      return {
        enonce: 'On considère l\'équation $(E) : ' + A3 + 'x + ' + B3 + 'y = ' + C3 + '$, d\'inconnues entières $x$ et $y$.<br>Calculer $\\operatorname{PGCD}(' + A3 + ' \\,;\\, ' + B3 + ')$, résoudre $(E)$ dans $\\Z^2$ et donner la solution vérifiant $0 \\leq x < ' + bp + '$.',
        questions: [
          { label: 'PGCD :', type: 'number', reponse: g },
          { label: '$(x \\,;\\, y) =$', type: 'tuple', reponse: [x, y] }
        ],
        indices: ['Divise par le PGCD, puis cherche une solution particulière grâce à une relation de Bézout.', 'Le théorème de Gauss donne toutes les solutions : $x = x_0 + b\'k$, $y = y_0 - a\'k$.'],
        solution: sol,
        aide: AIDE_TUPLE
      };
    }
  });

  EM.gen.register({
    id: 'ts1-congruences',
    titre: 'Congruences : reste de la division de aⁿ',
    chapitres: ['ts1-arithmetique'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var m, a, ordre, guard = 0;
      do {
        m = rng.pick([5, 7, 9, 11, 13]); a = rng.int(2, 7);
        ordre = 0;
        if (ar.gcd(a, m) === 1 && a % m !== 1) { var pw = 1; do { pw = pw * a % m; ordre++; } while (pw !== 1 && ordre < 20); }
        guard++;
      } while ((ar.gcd(a, m) !== 1 || ordre < 3) && guard < 100);
      var puiss = [], pw2 = 1;
      for (var i = 1; i <= ordre; i++) { pw2 = pw2 * a % m; puiss.push('$' + a + '^{' + i + '} \\equiv ' + pw2 + ' \\; [' + m + ']$'); }
      var n = niveau === 1 ? rng.int(25, 300) : rng.int(1000, 2026), r = n % ordre, res = 1;
      for (var j = 0; j < r; j++) res = res * a % m;
      var base = a, qs = [], sol = [], Atex = String(a);
      if (niveau === 2) {
        var A0 = a + m * rng.int(Math.ceil(1000 / m), Math.floor(3000 / m));
        Atex = String(A0);
        qs.push({ label: 'Reste de $' + A0 + '$ modulo $' + m + '$ :', type: 'number', reponse: a });
        sol.push('$' + A0 + ' = ' + m + ' \\times ' + ((A0 - a) / m) + ' + ' + a + '$, donc $' + A0 + ' \\equiv ' + a + ' \\; [' + m + ']$ et $' + A0 + '^{' + n + '} \\equiv ' + a + '^{' + n + '} \\; [' + m + ']$.');
      } else {
        qs.push({ label: 'Plus petit $p > 0$ tel que $' + a + '^{p} \\equiv 1 \\; [' + m + ']$ :', type: 'number', reponse: ordre });
      }
      qs.push({ label: 'Reste de $' + Atex + '^{' + n + '}$ modulo $' + m + '$ :', type: 'number', reponse: res });
      sol.push('Puissances successives de $' + base + '$ modulo $' + m + '$ : ' + puiss.join(' ; ') + '.');
      sol.push('Donc $' + base + '^{' + ordre + '} \\equiv 1 \\; [' + m + ']$ et, pour tout entier $k$, $' + base + '^{' + ordre + 'k} \\equiv 1 \\; [' + m + ']$.');
      sol.push('$' + n + ' = ' + ordre + ' \\times ' + Math.floor(n / ordre) + ' + ' + r + '$, donc $' + base + '^{' + n + '} = \\left(' + base + '^{' + ordre + '}\\right)^{' + Math.floor(n / ordre) + '} \\times ' + base + '^{' + r + '} \\equiv ' + base + '^{' + r + '} \\equiv ' + res + ' \\; [' + m + ']$.');
      sol.push('Le reste de la division euclidienne de $' + Atex + '^{' + n + '}$ par $' + m + '$ est $' + res + '$.');
      return {
        enonce: (niveau === 1
          ? 'Étudier les restes de la division euclidienne des puissances de $' + a + '$ par $' + m + '$, puis déterminer le reste de la division euclidienne de $' + a + '^{' + n + '}$ par $' + m + '$.'
          : 'Déterminer le reste de la division euclidienne de $' + Atex + '$ par $' + m + '$, puis celui de $' + Atex + '^{' + n + '}$ par $' + m + '$.'),
        questions: qs,
        indices: ['Calcule $' + a + '^1, ' + a + '^2, ' + a + '^3, \\dots$ modulo $' + m + '$ jusqu\'à retrouver $1$.', 'Écris la division euclidienne de l\'exposant par la période.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* Coniques (Tle S1)                                                   */
  /* ================================================================== */
  function sq(v, d) { return d === 1 ? v + '^2' : '\\dfrac{' + v + '^2}{' + d + '}'; }
  var CON_AB = [[5, 3], [5, 4], [10, 6], [10, 8], [13, 5], [3, 2], [4, 2], [4, 3], [5, 2], [6, 4], [3, 1], [2, 1]];
  EM.gen.register({
    id: 'ts1-coniques',
    titre: 'Coniques : nature, foyers et excentricité',
    chapitres: ['ts1-coniques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var NAT = ['une ellipse', 'une hyperbole', 'une parabole', 'un cercle'];
      if (niveau === 1) {
        var type = rng.pick(['ellipse', 'hyperbole', 'parabole']);
        if (type === 'parabole') {
          var p2 = rng.pick([2, 4, 6, 8, 12]), vert = rng.bool(), f = F(p2, 4);
          var eqp = vert ? 'x^2 = ' + p2 + 'y' : 'y^2 = ' + p2 + 'x';
          return {
            enonce: 'Dans un repère orthonormé, on considère la courbe $(\\Gamma)$ d\'équation $' + eqp + '$. Préciser sa nature, son excentricité, son foyer et sa directrice.',
            questions: [
              qcm(rng, '$(\\Gamma)$ est :', 'une parabole', NAT),
              { label: 'Excentricité $e =$', type: 'number', reponse: 1 },
              { label: 'Foyer $F$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: vert ? [0, f] : [f, 0], reponseTex: vert ? pt(0, f.tex()) : pt(f.tex(), 0) }
            ],
            indices: ['Compare avec la forme réduite $' + (vert ? 'x^2 = 2py' : 'y^2 = 2px') + '$.', 'Le foyer est $F' + (vert ? '\\left(0 \\,;\\, \\dfrac{p}{2}\\right)' : '\\left(\\dfrac{p}{2} \\,;\\, 0\\right)') + '$ et la directrice $' + (vert ? 'y' : 'x') + ' = -\\dfrac{p}{2}$.'],
            solution: [
              'L\'équation est de la forme $' + (vert ? 'x^2 = 2py' : 'y^2 = 2px') + '$ avec $2p = ' + p2 + '$, soit $p = ' + (p2 / 2) + '$ : c\'est une parabole, d\'excentricité $e = 1$.',
              'Foyer $F' + (vert ? pt(0, f.tex()) : pt(f.tex(), 0)) + '$ et directrice $(D) : ' + (vert ? 'y' : 'x') + ' = ' + f.neg().tex() + '$.'
            ],
            aide: AIDE_TUPLE
          };
        }
        var ab = rng.pick(CON_AB), A0 = ab[0], B0 = ab[1], c2, aMaj, horiz, eqTex;
        if (type === 'ellipse') {
          horiz = rng.bool();
          var ax = horiz ? A0 : B0, by = horiz ? B0 : A0;
          c2 = A0 * A0 - B0 * B0; aMaj = A0;
          eqTex = rng.bool() ? sq('x', ax * ax) + ' + ' + sq('y', by * by) + ' = 1' : T.mono(by * by, 'x^2', true) + ' + ' + T.mono(ax * ax, 'y^2', true) + ' = ' + (ax * ax * by * by);
        } else {
          horiz = true;
          if (rng.bool()) { var tmp = A0; A0 = B0; B0 = tmp; }
          c2 = A0 * A0 + B0 * B0; aMaj = A0;
          eqTex = rng.bool() ? sq('x', A0 * A0) + ' - ' + sq('y', B0 * B0) + ' = 1' : T.mono(B0 * B0, 'x^2', true) + ' - ' + T.mono(A0 * A0, 'y^2', true) + ' = ' + (A0 * A0 * B0 * B0);
        }
        var cc = racine(c2), e = { m: cc.m.div(aMaj), s: cc.s };
        var cS = radS(cc.m, cc.s), cT = radTex(cc.m, cc.s);
        var sol1 = type === 'ellipse'
          ? ['On met l\'équation sous la forme réduite $' + sq('x', (horiz ? A0 : B0) * (horiz ? A0 : B0)) + ' + ' + sq('y', (horiz ? B0 : A0) * (horiz ? B0 : A0)) + ' = 1$ : c\'est une ellipse de centre $O$, de grand axe porté par ' + (horiz ? '$(Ox)$' : '$(Oy)$') + ', avec $a = ' + A0 + '$ (demi-grand axe) et $b = ' + B0 + '$.',
            '$c = \\sqrt{a^2 - b^2} = \\sqrt{' + (A0 * A0) + ' - ' + (B0 * B0) + '} = ' + cT + '$ ; les foyers sont ' + (horiz ? '$F' + pt(cT, 0) + '$ et $F\'' + pt('-' + cT, 0) + '$' : '$F' + pt(0, cT) + '$ et $F\'' + pt(0, '-' + cT) + '$') + '.',
            'Excentricité : $e = \\dfrac{c}{a} = ' + radTex(e.m, e.s) + '$ (on a bien $0 < e < 1$).']
          : ['On met l\'équation sous la forme réduite $' + sq('x', A0 * A0) + ' - ' + sq('y', B0 * B0) + ' = 1$ : c\'est une hyperbole de centre $O$, d\'axe focal $(Ox)$, avec $a = ' + A0 + '$ et $b = ' + B0 + '$.',
            '$c = \\sqrt{a^2 + b^2} = \\sqrt{' + (A0 * A0) + ' + ' + (B0 * B0) + '} = ' + cT + '$ ; les foyers sont $F' + pt(cT, 0) + '$ et $F\'' + pt('-' + cT, 0) + '$.',
            'Excentricité : $e = \\dfrac{c}{a} = ' + radTex(e.m, e.s) + '$ ($e > 1$). Asymptotes : $y = \\pm\\dfrac{b}{a}x = \\pm' + F(B0, A0).tex() + 'x$.'];
        return {
          enonce: 'Dans un repère orthonormé, on considère la courbe $(\\Gamma)$ d\'équation $' + eqTex + '$. Préciser sa nature, son excentricité et ses foyers.',
          questions: [
            qcm(rng, '$(\\Gamma)$ est :', type === 'ellipse' ? 'une ellipse' : 'une hyperbole', NAT),
            { label: 'Excentricité $e =$', type: 'number', reponse: radS(e.m, e.s), reponseTex: radTex(e.m, e.s) },
            { label: 'Foyer de coordonnées positives : $(x \\,;\\, y) =$', type: 'tuple', reponse: horiz ? [cS, 0] : [0, cS], reponseTex: horiz ? pt(cT, 0) : pt(0, cT) }
          ],
          indices: ['Ramène l\'équation à la forme réduite $\\dfrac{x^2}{\\alpha^2} \\pm \\dfrac{y^2}{\\beta^2} = 1$.', 'Ellipse : $c^2 = a^2 - b^2$ ; hyperbole : $c^2 = a^2 + b^2$ ; $e = \\dfrac{c}{a}$ où $a$ est le demi-axe focal.'],
          solution: sol1,
          aide: 'Écris par exemple 4/5, sqrt(5)/3 ; foyer : (4 ; 0) ou (sqrt(13) ; 0).'
        };
      }
      var ell = rng.bool(), ab2 = rng.pick(CON_AB), Aa = ab2[0], Bb = ab2[1], h = rng.int(-3, 3), k = rng.int(-3, 3);
      if (h === 0 && k === 0) h = 1;
      if (!ell && rng.bool()) { var t2 = Aa; Aa = Bb; Bb = t2; }
      var sg = ell ? 1 : -1, A2 = Aa * Aa, B2 = Bb * Bb;
      var cst = B2 * h * h + sg * A2 * k * k - A2 * B2;
      var eq = T.sum([{ c: B2, v: 'x^2' }, { c: sg * A2, v: 'y^2' }, { c: -2 * B2 * h, v: 'x' }, { c: -2 * sg * A2 * k, v: 'y' }, { c: cst }]) + ' = 0';
      var c22 = ell ? A2 - B2 : A2 + B2, cc2 = racine(c22), e2 = { m: cc2.m.div(Aa), s: cc2.s };
      var fx = cc2.s === 1 ? F(h).add(cc2.m) : null;
      var fS = fx ? S(fx) : h + '+' + radS(cc2.m, cc2.s), fT = fx ? fx.tex() : (h === 0 ? '' : h + ' + ') + radTex(cc2.m, cc2.s);
      return {
        enonce: 'Dans un repère orthonormé, on considère la courbe $(\\Gamma)$ d\'équation $$' + eq + '.$$ Déterminer sa nature, son centre $\\Omega$, son excentricité et le foyer d\'abscisse la plus grande.',
        questions: [
          qcm(rng, '$(\\Gamma)$ est :', ell ? 'une ellipse' : 'une hyperbole', NAT),
          { label: 'Centre $\\Omega$ : $(x \\,;\\, y) =$', type: 'tuple', reponse: [h, k] },
          { label: 'Excentricité $e =$', type: 'number', reponse: radS(e2.m, e2.s), reponseTex: radTex(e2.m, e2.s) },
          { label: 'Foyer d\'abscisse la plus grande : $(x \\,;\\, y) =$', type: 'tuple', reponse: [fS, k], reponseTex: pt(fT, k) }
        ],
        indices: ['Regroupe les termes en $x$ et en $y$ et complète les carrés.', 'Divise par le second membre pour obtenir la forme réduite en $X = x - x_\\Omega$ et $Y = y - y_\\Omega$.'],
        solution: [
          'On complète les carrés : $' + kv(B2, '(x^2' + T.mono(-2 * h, 'x', false) + ')') + (ell ? ' + ' : ' - ') + kv(A2, '(y^2' + T.mono(-2 * k, 'y', false) + ')') + T.signed(cst) + ' = 0$, soit $' + kv(B2, T.xMinus(h) + '^2') + (ell ? ' + ' : ' - ') + kv(A2, T.xMinus(k, 'y') + '^2') + ' = ' + (A2 * B2) + '$.',
          'En divisant par $' + (A2 * B2) + '$ : $' + sq(T.xMinus(h), A2) + (ell ? ' + ' : ' - ') + sq(T.xMinus(k, 'y'), B2) + ' = 1$ : c\'est ' + (ell ? 'une ellipse' : 'une hyperbole') + ' de centre $\\Omega' + pt(h, k) + '$, d\'axe focal parallèle à $(Ox)$, avec $a = ' + Aa + '$ et $b = ' + Bb + '$.',
          '$c = \\sqrt{a^2 ' + (ell ? '-' : '+') + ' b^2} = \\sqrt{' + c22 + '} = ' + radTex(cc2.m, cc2.s) + '$ et $e = \\dfrac{c}{a} = ' + radTex(e2.m, e2.s) + '$.',
          'Les foyers ont pour coordonnées $(' + h + ' \\pm c \\,;\\, ' + k + ')$ ; celui d\'abscisse la plus grande est $F' + pt(fT, k) + '$.'
        ],
        aide: 'Écris par exemple (2 ; -1), sqrt(5)/3, (1+sqrt(5) ; 2).'
      };
    }
  });

  /* ================================================================== */
  /* Produit vectoriel (Tle S1)                                          */
  /* ================================================================== */
  function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function dot(u, v) { return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; }
  function vecTex(n, u) { return '\\vec{' + n + '}' + pt(u[0], u[1], u[2]); }
  EM.gen.register({
    id: 'ts1-produit-vectoriel',
    titre: 'Produit vectoriel : coordonnées, aire, volume',
    chapitres: ['ts1-espace'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var formule = '$\\vec{u} \\wedge \\vec{v} = (y z\' - z y\' \\,;\\, z x\' - x z\' \\,;\\, x y\' - y x\')$ pour $\\vec{u}(x \\,;\\, y \\,;\\, z)$ et $\\vec{v}(x\' \\,;\\, y\' \\,;\\, z\')$.';
      if (niveau === 1) {
        var u, v, w;
        do { u = [rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4)]; v = [rng.int(-3, 4), rng.int(-3, 4), rng.int(-3, 4)]; w = cross(u, v); } while (!w[0] && !w[1] && !w[2]);
        var N = dot(w, w), rc = racine(N);
        return {
          enonce: 'L\'espace est muni d\'un repère orthonormé direct. On donne $' + vecTex('u', u) + '$ et $' + vecTex('v', v) + '$. Calculer les coordonnées de $\\vec{u} \\wedge \\vec{v}$ et l\'aire du parallélogramme construit sur $\\vec{u}$ et $\\vec{v}$.',
          questions: [
            { label: '$\\vec{u} \\wedge \\vec{v}$ : $(x \\,;\\, y \\,;\\, z) =$', type: 'tuple', reponse: w },
            { label: 'Aire :', type: 'number', reponse: radS(rc.m, rc.s), reponseTex: radTex(rc.m, rc.s), unite: 'u.a.' }
          ],
          indices: [formule, 'L\'aire du parallélogramme vaut $\\|\\vec{u} \\wedge \\vec{v}\\|$.'],
          solution: [
            formule,
            '$\\vec{u} \\wedge \\vec{v} = \\left(' + T.par(u[1]) + ' \\times ' + T.par(v[2]) + ' - ' + T.par(u[2]) + ' \\times ' + T.par(v[1]) + ' \\,;\\, ' + T.par(u[2]) + ' \\times ' + T.par(v[0]) + ' - ' + T.par(u[0]) + ' \\times ' + T.par(v[2]) + ' \\,;\\, ' + T.par(u[0]) + ' \\times ' + T.par(v[1]) + ' - ' + T.par(u[1]) + ' \\times ' + T.par(v[0]) + '\\right) = ' + pt(w[0], w[1], w[2]) + '$.',
            'Aire $= \\|\\vec{u} \\wedge \\vec{v}\\| = \\sqrt{' + T.par(w[0]) + '^2 + ' + T.par(w[1]) + '^2 + ' + T.par(w[2]) + '^2} = \\sqrt{' + N + '}' + (rc.s === N ? '' : ' = ' + radTex(rc.m, rc.s)) + '$ u.a.'
          ],
          aide: '(x ; y ; z) pour les coordonnées ; aire exacte, par exemple 3sqrt(2).'
        };
      }
      var P, AB, AC, n, AD, vol;
      do {
        P = [0, 1, 2, 3].map(function () { return [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)]; });
        AB = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]];
        AC = [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]];
        AD = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
        n = cross(AB, AC); vol = dot(n, AD);
      } while ((!n[0] && !n[1] && !n[2]) || vol === 0);
      var N2 = dot(n, n), rc2 = racine(N2), aire = { m: rc2.m.div(2), s: rc2.s }, d = -dot(n, P[0]), V = F(Math.abs(vol), 6);
      var noms = ['A', 'B', 'C', 'D'];
      return {
        enonce: 'L\'espace est muni d\'un repère orthonormé direct. On donne les points ' + P.map(function (p, i) { return '$' + noms[i] + pt(p[0], p[1], p[2]) + '$'; }).join(', ') + '.<br>' +
          'Calculer $\\vec{n} = \\vect{AB} \\wedge \\vect{AC}$, l\'aire du triangle $ABC$, le réel $d$ tel que $(ABC) : ' + T.sum([{ c: n[0], v: 'x' }, { c: n[1], v: 'y' }, { c: n[2], v: 'z' }]) + ' + d = 0$, et le volume du tétraèdre $ABCD$.',
        questions: [
          { label: '$\\vec{n}$ : $(x \\,;\\, y \\,;\\, z) =$', type: 'tuple', reponse: n },
          { label: 'Aire de $ABC$ :', type: 'number', reponse: radS(aire.m, aire.s), reponseTex: radTex(aire.m, aire.s), unite: 'u.a.' },
          { label: '$d =$', type: 'number', reponse: d },
          { label: 'Volume de $ABCD$ :', type: 'number', reponse: V, unite: 'u.v.' }
        ],
        indices: [formule, 'Aire $= \\dfrac{1}{2}\\|\\vect{AB} \\wedge \\vect{AC}\\|$ ; volume $= \\dfrac{1}{6}\\left|\\left(\\vect{AB} \\wedge \\vect{AC}\\right) \\cdot \\vect{AD}\\right|$ ; $A \\in (ABC)$ donne $d$.'],
        solution: [
          '$\\vect{AB}' + pt(AB[0], AB[1], AB[2]) + '$, $\\vect{AC}' + pt(AC[0], AC[1], AC[2]) + '$, $\\vect{AD}' + pt(AD[0], AD[1], AD[2]) + '$.',
          '$\\vec{n} = \\vect{AB} \\wedge \\vect{AC} = ' + pt(n[0], n[1], n[2]) + '$.',
          'Aire $= \\dfrac{1}{2}\\|\\vec{n}\\| = \\dfrac{1}{2}\\sqrt{' + N2 + '} = ' + radTex(aire.m, aire.s) + '$ u.a.',
          '$\\vec{n}$ est normal au plan $(ABC)$ et $A \\in (ABC)$ : $' + T.num(n[0]) + ' \\times ' + T.par(P[0][0]) + ' + ' + T.par(n[1]) + ' \\times ' + T.par(P[0][1]) + ' + ' + T.par(n[2]) + ' \\times ' + T.par(P[0][2]) + ' + d = 0$, donc $d = ' + d + '$.',
          'Volume $= \\dfrac{1}{6}\\left|\\vec{n} \\cdot \\vect{AD}\\right| = \\dfrac{|' + vol + '|}{6} = ' + V.tex() + '$ u.v.'
        ],
        aide: '(x ; y ; z) pour les coordonnées ; aire exacte, par exemple sqrt(35)/2.'
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
