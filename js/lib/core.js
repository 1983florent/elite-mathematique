/*
 * ELITE MATHÉMATIQUE — noyau commun.
 * Fonctionne en script classique (navigateur, y compris en file://) et sous Node (tests).
 * Tout est rangé dans l'espace de noms global EM.
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  /* ------------------------------------------------------------------ */
  /* Générateur pseudo-aléatoire reproductible (mulberry32)              */
  /* Une même graine donne toujours le même exercice : on peut partager  */
  /* un « code d'exercice » ou une fiche entre élèves et professeur.     */
  /* ------------------------------------------------------------------ */
  function hashSeed(s) {
    s = String(s);
    var h = 1779033703 ^ s.length;
    for (var i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  function RNG(seed) {
    if (!(this instanceof RNG)) return new RNG(seed);
    this.seed = seed == null ? Math.floor(Math.random() * 1e9) : seed;
    this.state = typeof this.seed === 'number' ? this.seed >>> 0 : hashSeed(this.seed);
  }
  RNG.prototype.next = function () {
    var t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /** entier dans [a, b] (bornes incluses) */
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  /** entier non nul dans [a, b] */
  RNG.prototype.nz = function (a, b) {
    var v;
    do { v = this.int(a, b); } while (v === 0);
    return v;
  };
  /** entier dans [a, b] qui n'appartient pas à la liste exclue */
  RNG.prototype.intExcept = function (a, b, excl) {
    var v, guard = 0;
    do { v = this.int(a, b); guard++; } while (excl.indexOf(v) >= 0 && guard < 1000);
    return v;
  };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  RNG.prototype.sign = function () { return this.next() < 0.5 ? -1 : 1; };
  RNG.prototype.bool = function (p) { return this.next() < (p == null ? 0.5 : p); };
  RNG.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(this.next() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /** k éléments distincts tirés dans arr */
  RNG.prototype.sample = function (arr, k) { return this.shuffle(arr).slice(0, k); };
  /** décimal à d chiffres après la virgule dans [a, b] */
  RNG.prototype.dec = function (a, b, d) {
    var p = Math.pow(10, d);
    return this.int(Math.round(a * p), Math.round(b * p)) / p;
  };
  EM.RNG = RNG;
  EM.hashSeed = hashSeed;

  /* ------------------------------------------------------------------ */
  /* Arithmétique                                                        */
  /* ------------------------------------------------------------------ */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function lcm(a, b) { return a && b ? Math.abs(a / gcd(a, b) * b) : 0; }
  function primeFactors(n) {
    var f = [], p = 2;
    n = Math.abs(n);
    while (n > 1 && p * p <= n) {
      while (n % p === 0) { f.push(p); n /= p; }
      p++;
    }
    if (n > 1) f.push(n);
    return f;
  }
  function isPrime(n) {
    if (n < 2 || n % 1) return false;
    for (var p = 2; p * p <= n; p++) if (n % p === 0) return false;
    return true;
  }
  function divisors(n) {
    var d = [];
    n = Math.abs(n);
    for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i);
    return d;
  }
  /** Arrondi sûr (évite 0.1+0.2 = 0.30000000000000004). */
  function round(x, d) {
    var p = Math.pow(10, d == null ? 10 : d);
    return Math.round((x + (x >= 0 ? 1 : -1) * Number.EPSILON) * p) / p;
  }
  /** a est-il (presque) entier ? */
  function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  /** Décompose √n = a√b (b sans facteur carré). */
  function sqrtSimplify(n) {
    var a = 1, b = n;
    for (var k = Math.floor(Math.sqrt(n)); k > 1; k--) {
      if (b % (k * k) === 0) { a *= k; b /= k * k; break; }
    }
    return { a: a, b: b };
  }
  EM.ar = { gcd: gcd, lcm: lcm, primeFactors: primeFactors, isPrime: isPrime, divisors: divisors, round: round, isInt: isInt, sqrtSimplify: sqrtSimplify };

  /* ------------------------------------------------------------------ */
  /* Fractions exactes                                                   */
  /* ------------------------------------------------------------------ */
  function Frac(n, d) {
    if (!(this instanceof Frac)) return new Frac(n, d);
    if (n instanceof Frac) { this.n = n.n; this.d = n.d; return; }
    if (d == null) d = 1;
    if (d === 0) throw new Error('Dénominateur nul');
    if (!isInt(n) || !isInt(d)) {
      // conversion d'un décimal en fraction
      var p = 1;
      while ((!isInt(n * p) || !isInt(d * p)) && p < 1e9) p *= 10;
      n = Math.round(n * p); d = Math.round(d * p);
    }
    var g = gcd(n, d) || 1;
    if (d < 0) g = -g;
    this.n = Math.round(n / g);
    this.d = Math.round(d / g);
  }
  /** F(3) = 3/1, F(3, 4) = 3/4, F(fraction) = fraction */
  function F(n, d) { return n instanceof Frac ? n : new Frac(n, d == null ? 1 : d); }
  Frac.prototype.add = function (o) { o = F(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); };
  Frac.prototype.sub = function (o) { o = F(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); };
  Frac.prototype.mul = function (o) { o = F(o); return new Frac(this.n * o.n, this.d * o.d); };
  Frac.prototype.div = function (o) { o = F(o); return new Frac(this.n * o.d, this.d * o.n); };
  Frac.prototype.neg = function () { return new Frac(-this.n, this.d); };
  Frac.prototype.inv = function () { return new Frac(this.d, this.n); };
  Frac.prototype.pow = function (k) { return new Frac(Math.pow(this.n, k), Math.pow(this.d, k)); };
  Frac.prototype.abs = function () { return new Frac(Math.abs(this.n), this.d); };
  Frac.prototype.value = function () { return this.n / this.d; };
  Frac.prototype.isInt = function () { return this.d === 1; };
  Frac.prototype.isZero = function () { return this.n === 0; };
  Frac.prototype.sign = function () { return this.n > 0 ? 1 : this.n < 0 ? -1 : 0; };
  Frac.prototype.equals = function (o) { o = F(o); return this.n === o.n && this.d === o.d; };
  Frac.prototype.cmp = function (o) { o = F(o); return this.n * o.d - o.n * this.d; };
  /** Écriture TeX : -\dfrac{3}{4} ou 5 */
  /** Entier avec séparateur de milliers pour TeX : 6\,480\,000 */
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); }
  Frac.prototype.tex = function (opt) {
    opt = opt || {};
    if (this.d === 1) return (this.n < 0 ? '-' : '') + grp(Math.abs(this.n));
    var cmd = opt.small ? '\\frac' : '\\dfrac';
    return (this.n < 0 ? '-' : '') + cmd + '{' + grp(Math.abs(this.n)) + '}{' + grp(this.d) + '}';
  };
  /** Écriture texte : -3/4 */
  Frac.prototype.toString = function () { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; };
  EM.Frac = Frac;
  EM.F = F;

  /* ------------------------------------------------------------------ */
  /* Aide à l'écriture TeX                                               */
  /* ------------------------------------------------------------------ */
  var T = {};
  /** Nombre au format français pour TeX : 1\,234{,}5 */
  T.num = function (x, d) {
    if (x instanceof Frac) return x.tex();
    if (typeof x !== 'number') return String(x);
    var v = d == null ? round(x, 8) : round(x, d);
    var neg = v < 0;
    var s = Math.abs(v).toString();
    if (s.indexOf('e') >= 0) s = Math.abs(v).toFixed(10).replace(/0+$/, '');
    var parts = s.split('.');
    var ip = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    return (neg ? '-' : '') + ip + (parts[1] ? '{,}' + parts[1] : '');
  };
  /** Nombre au format français en texte simple : 1 234,5 */
  T.txt = function (x, d) {
    if (x instanceof Frac) return x.toString();
    var v = d == null ? round(x, 8) : round(x, d);
    var neg = v < 0;
    var parts = Math.abs(v).toString().split('.');
    var ip = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + ip + (parts[1] ? ',' + parts[1] : '');
  };
  /** Nombre entre parenthèses s'il est négatif : (-3) */
  T.par = function (x) {
    var s = T.num(x);
    var neg = x instanceof Frac ? x.n < 0 : x < 0;
    return neg ? '\\left(' + s + '\\right)' : s;
  };
  /** Terme signé pour une somme : « + 3 », « - 3 » (premier terme : « 3 » / « -3 ») */
  T.signed = function (x, first) {
    var neg = x instanceof Frac ? x.n < 0 : x < 0;
    var a = x instanceof Frac ? x.abs() : Math.abs(x);
    if (first) return (neg ? '-' : '') + T.num(a);
    return (neg ? ' - ' : ' + ') + T.num(a);
  };
  /** Monôme c·v : gère 1, -1, 0. first : premier terme de la somme. */
  T.mono = function (c, v, first) {
    var cf = c instanceof Frac ? c : F(c);
    if (cf.isZero()) return '';
    if (!v) return T.signed(cf, first);
    var neg = cf.n < 0, a = cf.abs();
    var coef = a.equals(1) ? '' : T.num(a);
    var s = coef + v;
    if (first) return (neg ? '-' : '') + s;
    return (neg ? ' - ' : ' + ') + s;
  };
  /**
   * Polynôme à partir des coefficients [a_n, ..., a_1, a_0].
   * T.poly([2,-3,1]) -> "2x^2 - 3x + 1"
   */
  T.poly = function (coefs, v) {
    v = v || 'x';
    var deg = coefs.length - 1, out = '', first = true;
    for (var i = 0; i < coefs.length; i++) {
      var p = deg - i, c = coefs[i];
      var cf = c instanceof Frac ? c : F(c);
      if (cf.isZero()) continue;
      var vv = p === 0 ? '' : p === 1 ? v : v + '^{' + p + '}';
      out += T.mono(cf, vv, first);
      first = false;
    }
    return out || '0';
  };
  /** Somme de termes {c, v} : T.sum([{c:2,v:'x'},{c:-3,v:'y'},{c:5}]) -> "2x - 3y + 5" */
  T.sum = function (terms) {
    var out = '', first = true;
    terms.forEach(function (t) {
      var cf = t.c instanceof Frac ? t.c : F(t.c);
      if (cf.isZero()) return;
      out += T.mono(cf, t.v || '', first);
      first = false;
    });
    return out || '0';
  };
  /** (x - a) en écriture propre : (x - 3), (x + 2), x */
  T.xMinus = function (a, v) {
    v = v || 'x';
    var af = a instanceof Frac ? a : F(a);
    if (af.isZero()) return v;
    return '(' + v + (af.n > 0 ? ' - ' : ' + ') + af.abs().tex() + ')';
  };
  /** a√b simplifié en TeX */
  T.sqrt = function (n) {
    if (n < 0) return '\\text{(impossible)}';
    var s = sqrtSimplify(n);
    if (s.b === 1) return String(s.a);
    return (s.a === 1 ? '' : s.a) + '\\sqrt{' + s.b + '}';
  };
  /** Ensemble { a ; b ; c } */
  T.set = function (arr) {
    if (!arr.length) return '\\varnothing';
    return '\\left\\{ ' + arr.map(function (x) { return typeof x === 'string' ? x : T.num(x); }).join(' \\,;\\, ') + ' \\right\\}';
  };
  /** Intervalle à la française : ]a ; b] */
  T.interval = function (a, b, openA, openB) {
    var A = a === -Infinity ? '-\\infty' : (typeof a === 'string' ? a : T.num(a));
    var B = b === Infinity ? '+\\infty' : (typeof b === 'string' ? b : T.num(b));
    return (openA || a === -Infinity ? '\\left]' : '\\left[') + A + '\\,;\\,' + B + (openB || b === Infinity ? '\\right[' : '\\right]');
  };
  /** Montant en francs CFA */
  T.fcfa = function (x) { return T.txt(x) + ' F CFA'; };
  EM.T = T;

  /* ------------------------------------------------------------------ */
  /* Registre des générateurs d'exercices                                */
  /* ------------------------------------------------------------------ */
  /*
   * Contrat d'un générateur :
   * EM.gen.register({
   *   id: 'thales-longueur',               // unique, kebab-case
   *   titre: 'Calculer une longueur avec Thalès',
   *   chapitres: ['3e-thales'],            // chapitres du programme concernés
   *   niveaux: 3,                          // nombre de niveaux de difficulté (1..3)
   *   examen: true,                        // utilisable dans les examens blancs
   *   gen: function (rng, niveau) {
   *     return {
   *       enonce: 'HTML avec $TeX$ et $$TeX$$',
   *       figure: '<svg>…</svg>' (optionnel),
   *       questions: [                     // une ou plusieurs réponses attendues
   *         { label: '$AE =$', type: 'number', reponse: 4.5, tol: 0.01, unite: 'cm' },
   *         { label: 'Nature', type: 'choice', choix: ['…','…'], reponse: 0 },
   *         { label: "$f'(x) =$", type: 'expr', reponse: '3x^2-2', variable: 'x' },
   *         { label: 'Solutions', type: 'set', reponse: [2, -3] },
   *         { label: 'Point', type: 'tuple', reponse: [1, 2] },
   *         { label: 'Mot', type: 'text', reponse: ['croissante'] }
   *       ],
   *       indices: ['…', '…'],             // aides progressives
   *       solution: ['étape 1', 'étape 2'] // correction détaillée
   *     };
   *   }
   * });
   */
  var registry = {};
  EM.gen = {
    all: registry,
    register: function (g) {
      if (!g || !g.id || typeof g.gen !== 'function') throw new Error('Générateur invalide');
      if (registry[g.id]) throw new Error('Générateur en double : ' + g.id);
      g.niveaux = g.niveaux || 1;
      g.chapitres = g.chapitres || [];
      registry[g.id] = g;
      return g;
    },
    get: function (id) { return registry[id]; },
    list: function () { return Object.keys(registry).map(function (k) { return registry[k]; }); },
    forChapter: function (chId) {
      return EM.gen.list().filter(function (g) { return g.chapitres.indexOf(chId) >= 0; });
    },
    /** Produit un exercice à partir d'une graine (reproductible). */
    make: function (id, seed, niveau) {
      var g = registry[id];
      if (!g) throw new Error('Générateur inconnu : ' + id);
      if (seed == null) seed = Math.floor(Math.random() * 1e9);
      var lv = Math.max(1, Math.min(g.niveaux, niveau || 1));
      var rng = new RNG(id + ':' + seed + ':' + lv);
      var ex = g.gen(rng, lv);
      ex.id = id;
      ex.seed = seed;
      ex.niveau = lv;
      ex.titre = ex.titre || g.titre;
      ex.questions = ex.questions || [];
      ex.indices = ex.indices || [];
      ex.solution = ex.solution || [];
      return ex;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Petits utilitaires                                                  */
  /* ------------------------------------------------------------------ */
  EM.util = {
    esc: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    range: function (a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; },
    sum: function (arr) { return arr.reduce(function (s, x) { return s + x; }, 0); },
    uniq: function (arr) { return arr.filter(function (x, i) { return arr.indexOf(x) === i; }); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = EM;
})(typeof window !== 'undefined' ? window : globalThis);
