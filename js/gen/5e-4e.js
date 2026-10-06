/*
 * ELITE MATHÉMATIQUE — générateurs d'exercices des classes de 5e et de 4e.
 * Énoncés à l'infinitif, indices et corrections qui tutoient l'élève.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, ar = EM.ar;

  /* ------------------------------------------------------------------ */
  /* Outils locaux                                                       */
  /* ------------------------------------------------------------------ */
  var PRENOMS = ['Awa', 'Moussa', 'Fatou', 'Mamadou', 'Aminata', 'Ousmane', 'Khady', 'Ibrahima', 'Ndèye', 'Cheikh',
    'Mariama', 'Babacar', 'Coumba', 'Lamine', 'Aïssatou', 'Modou', 'Astou', 'Pape', 'Bineta', 'Seydou'];
  var VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Tambacounda', 'Mbour', 'Rufisque',
    'Diourbel', 'Louga', 'Kolda', 'Fatick', 'Matam', 'Kédougou', 'Sédhiou', 'Kaffrine'];

  function rnd(x, d) { return ar.round(x, d == null ? 8 : d); }
  /** Fraction écrite telle quelle (non simplifiée), signe devant, dénominateur positif. */
  function fr(n, d) {
    if (d < 0) { n = -n; d = -d; }
    if (d === 1) return String(n);
    return (n < 0 ? '-' : '') + '\\dfrac{' + Math.abs(n) + '}{' + d + '}';
  }
  /** Fraction entre parenthèses si négative. */
  function frp(n, d) {
    var s = fr(n, d);
    return (n * d < 0) ? '\\left(' + s + '\\right)' : s;
  }
  /** « = forme irréductible » si la fraction n/d se simplifie, sinon chaîne vide. */
  function simpl(n, d) {
    var f = F(n, d);
    if (f.n === n && f.d === d) return '';
    return ' = ' + f.tex();
  }
  /**
   * QCM : bon = {tex, val}, faux = [{tex, val}] ; on élimine les doublons
   * (même écriture ou même valeur) puis on mélange.
   */
  function qcm(rng, label, bon, faux) {
    var opts = [bon];
    faux.forEach(function (f) {
      if (f == null) return;
      var dup = opts.some(function (o) {
        return o.tex === f.tex || (o.val != null && f.val != null && Math.abs(o.val - f.val) < 1e-9);
      });
      if (!dup) opts.push(f);
    });
    var sh = rng.shuffle(opts);
    return { label: label, type: 'choice', choix: sh.map(function (o) { return o.tex; }), reponse: sh.indexOf(bon) };
  }
  /** Polynôme (coefficients [a_n … a_0]) écrit pour l'analyseur : « 3*x^2-5*x+1 ». */
  function polyStr(c, v) {
    v = v || 'x';
    var deg = c.length - 1, s = '';
    for (var i = 0; i < c.length; i++) {
      var p = deg - i, cf = c[i] instanceof EM.Frac ? c[i] : F(c[i]);
      if (cf.isZero()) continue;
      var a = cf.abs(), num = a.d === 1 ? String(a.n) : '(' + a.n + '/' + a.d + ')';
      var term = p === 0 ? num : (a.equals(1) ? '' : num + '*') + v + (p > 1 ? '^' + p : '');
      s += (cf.n < 0 ? '-' : (s ? '+' : '')) + term;
    }
    return s || '0';
  }
  /** Décomposition en facteurs premiers en TeX : 2^{3} \times 3 \times 5 */
  function decompTex(n) {
    var f = ar.primeFactors(n), m = {}, ordre = [];
    f.forEach(function (p) { if (!m[p]) { m[p] = 0; ordre.push(p); } m[p]++; });
    return ordre.map(function (p) { return m[p] > 1 ? p + '^{' + m[p] + '}' : String(p); }).join(' \\times ');
  }
  /** Tableau HTML simple : lignes = [[en-tête, v1, v2…], …] (cellules en HTML/TeX). */
  function tableau(lignes) {
    return '<table class="em-table"><tbody>' + lignes.map(function (l) {
      return '<tr>' + l.map(function (c, j) { return j === 0 ? '<th>' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
  }
  function deg(x) { return x * Math.PI / 180; }
  /** Élision : « de Awa » -> « d'Awa », « que Ousmane » -> « qu'Ousmane ». */
  function de(nom) { return (/^[AEIOUÉÈÏ]/.test(nom) ? 'd\'' : 'de ') + nom; }
  function que(nom) { return (/^[AEIOUÉÈÏ]/.test(nom) ? 'qu\'' : 'que ') + nom; }
  function texDeg(x) { return T.num(x) + '°'; }

  /* ================================================================== */
  /* 5e — Nombres décimaux relatifs                                      */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-relatifs-somme',
    titre: 'Additionner et soustraire des nombres relatifs',
    chapitres: ['5e-relatifs'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var n = niveau === 1 ? 2 : rng.int(4, 5);
      var dec = rng.bool(niveau === 1 ? 0.3 : 0.4);
      function val() { return dec ? rng.nz(-95, 95) / 10 : rng.nz(-20, 20); }
      var vals = [], ops = [], eff = [];
      for (var i = 0; i < n; i++) {
        var v = val(), op = i === 0 ? '+' : rng.pick(['+', '-']);
        vals.push(v); ops.push(op); eff.push(op === '+' ? v : -v);
      }
      function parX(x) { return '\\left(' + (x > 0 ? '+' : '') + T.num(x) + '\\right)'; }
      var expr = niveau === 1 ? parX(vals[0]) : T.num(vals[0]);
      for (i = 1; i < n; i++) expr += ' ' + ops[i] + ' ' + (niveau === 1 ? parX(vals[i]) : T.par(vals[i]));
      var simple = eff.map(function (e, k) { return T.signed(e, k === 0); }).join('');
      var res = rnd(eff.reduce(function (s, x) { return s + x; }, 0), 6);
      var avecPar = niveau === 1 || vals.slice(1).some(function (x) { return x < 0; });
      var sol = [avecPar ? 'Soustraire un nombre, c\'est ajouter son opposé. On supprime les parenthèses : $A = ' + simple + '$.'
        : 'L\'expression est écrite sans parenthèses : $A = ' + simple + '$.'];
      if (n === 2) {
        var x = eff[0], y = eff[1];
        if (x * y > 0) {
          sol.push('Les deux termes ont le même signe : on additionne les distances à zéro ($' + T.num(Math.abs(x)) + ' + ' + T.num(Math.abs(y)) + ' = ' + T.num(rnd(Math.abs(x) + Math.abs(y))) + '$) et on garde le signe commun.');
        } else if (rnd(x + y) === 0) {
          sol.push('Les deux termes sont opposés : leur somme est nulle.');
        } else {
          var gx = Math.abs(x) > Math.abs(y) ? x : y;
          sol.push('Les deux termes sont de signes contraires : on soustrait les distances à zéro ($' + T.num(Math.max(Math.abs(x), Math.abs(y))) + ' - ' + T.num(Math.min(Math.abs(x), Math.abs(y))) + ' = ' + T.num(rnd(Math.abs(Math.abs(x) - Math.abs(y)))) + '$) et on prend le signe de $' + T.num(gx) + '$, qui a la plus grande distance à zéro.');
        }
        sol.push('$A = ' + T.num(res) + '$');
      } else {
        var pos = eff.filter(function (e) { return e > 0; }), neg = eff.filter(function (e) { return e < 0; });
        var sp = rnd(pos.reduce(function (s, x) { return s + x; }, 0)), sn = rnd(neg.reduce(function (s, x) { return s + x; }, 0));
        if (pos.length && neg.length) {
          sol.push('On regroupe les termes positifs : $' + pos.map(function (e, k) { return T.signed(e, k === 0); }).join('') + ' = ' + T.num(sp) + '$ ; puis les termes négatifs : $' + neg.map(function (e, k) { return T.signed(e, k === 0); }).join('') + ' = ' + T.num(sn) + '$.');
          sol.push('$A = ' + T.num(sp) + T.signed(sn) + ' = ' + T.num(res) + '$');
        } else {
          sol.push('Tous les termes ont le même signe : on additionne les distances à zéro et on garde ce signe. $A = ' + T.num(res) + '$');
        }
      }
      return {
        enonce: 'Calculer : $$A = ' + expr + '$$',
        questions: [{ label: '$A =$', type: 'number', reponse: res }],
        indices: [
          'Soustraire un nombre revient à ajouter son opposé : $a - (-b) = a + b$ et $a - (+b) = a - b$.',
          n === 2 ? 'Regarde si les deux nombres ont le même signe ou des signes contraires.' : 'Additionne d\'abord tous les termes positifs, puis tous les termes négatifs.'
        ],
        solution: sol
      };
    }
  });

  EM.gen.register({
    id: '5e-relatifs-priorites',
    titre: 'Calculer avec des relatifs en respectant les priorités',
    chapitres: ['5e-relatifs'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var P = T.par;
      function v() { return rng.nz(-9, 9); }
      var a = v(), b = v(), c = v(), d = v();
      var tpl = niveau === 1 ? rng.pick(['amul', 'mula', 'par', 'div']) : rng.pick(['mulmul', 'parpar', 'moinspar', 'divmul']);
      var expr, res, sol = [], faux = [];
      if (tpl === 'amul') {
        var p = b * c; res = a + p;
        expr = T.num(a) + ' + ' + P(b) + ' \\times ' + P(c);
        sol.push('La multiplication est prioritaire : $' + P(b) + ' \\times ' + P(c) + ' = ' + T.num(p) + '$.');
        sol.push('$A = ' + T.num(a) + T.signed(p) + ' = ' + T.num(res) + '$');
        faux = [(a + b) * c, a - p, -(a + p)];
      } else if (tpl === 'mula') {
        p = a * b; res = p + c;
        expr = P(a) + ' \\times ' + P(b) + ' + ' + P(c);
        sol.push('La multiplication est prioritaire : $' + P(a) + ' \\times ' + P(b) + ' = ' + T.num(p) + '$.');
        sol.push('$A = ' + T.num(p) + T.signed(c) + ' = ' + T.num(res) + '$');
        faux = [a * (b + c), -p + c, p - c];
      } else if (tpl === 'par') {
        var s = a + b;
        if (s === 0) { b = b + 1 === 0 ? 2 : b + 1; s = a + b; }
        res = s * c;
        expr = '\\left(' + T.num(a) + ' + ' + P(b) + '\\right) \\times ' + P(c);
        sol.push('On calcule d\'abord entre parenthèses : $' + T.num(a) + ' + ' + P(b) + ' = ' + T.num(s) + '$.');
        sol.push('$A = ' + P(s) + ' \\times ' + P(c) + ' = ' + T.num(res) + '$');
        faux = [a + b * c, -res, s + c];
      } else if (tpl === 'div') {
        var q = v(); b = q * c;
        res = a - q;
        expr = T.num(a) + ' - ' + P(b) + ' \\div ' + P(c);
        sol.push('La division est prioritaire : $' + P(b) + ' \\div ' + P(c) + ' = ' + T.num(q) + '$.');
        sol.push('$A = ' + T.num(a) + ' - ' + P(q) + ' = ' + T.num(a) + T.signed(-q) + ' = ' + T.num(res) + '$');
        faux = [rnd((a - b) / c), a + q, -res];
      } else if (tpl === 'mulmul') {
        var p1 = a * b, p2 = c * d; res = p1 - p2;
        expr = P(a) + ' \\times ' + P(b) + ' - ' + P(c) + ' \\times ' + P(d);
        sol.push('On effectue d\'abord les multiplications : $' + P(a) + ' \\times ' + P(b) + ' = ' + T.num(p1) + '$ et $' + P(c) + ' \\times ' + P(d) + ' = ' + T.num(p2) + '$.');
        sol.push('$A = ' + T.num(p1) + ' - ' + P(p2) + ' = ' + T.num(p1) + T.signed(-p2) + ' = ' + T.num(res) + '$');
      } else if (tpl === 'parpar') {
        var s1 = a - b, s2 = c + d;
        if (s1 === 0) { a = a + 1 === 0 ? 2 : a + 1; s1 = a - b; }
        if (s2 === 0) { c = c + 1 === 0 ? 2 : c + 1; s2 = c + d; }
        res = s1 * s2;
        expr = '\\left(' + T.num(a) + ' - ' + P(b) + '\\right) \\times \\left(' + T.num(c) + ' + ' + P(d) + '\\right)';
        sol.push('On calcule les parenthèses : $' + T.num(a) + ' - ' + P(b) + ' = ' + T.num(s1) + '$ et $' + T.num(c) + ' + ' + P(d) + ' = ' + T.num(s2) + '$.');
        sol.push('$A = ' + P(s1) + ' \\times ' + P(s2) + ' = ' + T.num(res) + '$');
      } else if (tpl === 'moinspar') {
        s = b - c;
        if (s === 0) { b = b + 1 === 0 ? 2 : b + 1; s = b - c; }
        p = s * d; res = a - p;
        expr = T.num(a) + ' - \\left(' + T.num(b) + ' - ' + P(c) + '\\right) \\times ' + P(d);
        sol.push('Parenthèses d\'abord : $' + T.num(b) + ' - ' + P(c) + ' = ' + T.num(s) + '$.');
        sol.push('Puis la multiplication : $' + P(s) + ' \\times ' + P(d) + ' = ' + T.num(p) + '$.');
        sol.push('$A = ' + T.num(a) + ' - ' + P(p) + ' = ' + T.num(a) + T.signed(-p) + ' = ' + T.num(res) + '$');
      } else {
        var k = v(); a = k * b;
        var m = k * c; res = m - d;
        expr = T.num(a) + ' \\div ' + P(b) + ' \\times ' + P(c) + ' - ' + P(d);
        sol.push('Divisions et multiplications se font de gauche à droite : $' + T.num(a) + ' \\div ' + P(b) + ' = ' + T.num(k) + '$, puis $' + P(k) + ' \\times ' + P(c) + ' = ' + T.num(m) + '$.');
        sol.push('$A = ' + T.num(m) + ' - ' + P(d) + ' = ' + T.num(m) + T.signed(-d) + ' = ' + T.num(res) + '$');
      }
      var question;
      if (niveau === 1 && rng.bool(0.35)) {
        question = qcm(rng, 'Quelle est la valeur de $A$ ?', { tex: '$' + T.num(res) + '$', val: res },
          faux.map(function (f) { return { tex: '$' + T.num(f) + '$', val: f }; }));
      } else {
        question = { label: '$A =$', type: 'number', reponse: res };
      }
      return {
        enonce: 'Calculer en respectant les priorités opératoires : $$A = ' + expr + '$$',
        questions: [question],
        indices: [
          'Ordre des calculs : parenthèses, puis multiplications et divisions (de gauche à droite), puis additions et soustractions.',
          'Règle des signes : le produit de deux nombres de même signe est positif, de signes contraires il est négatif.'
        ],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 5e — Fractions                                                      */
  /* ================================================================== */
  /** Étapes d'une somme / différence de deux fractions positives. */
  function etapesSomme(n1, d1, n2, d2, op, nom) {
    var L = ar.lcm(d1, d2), k1 = L / d1, k2 = L / d2;
    var N1 = n1 * k1, N2 = n2 * k2, R = op === '+' ? N1 + N2 : N1 - N2;
    var st = [];
    if (d1 === d2) {
      st.push('Les deux fractions ont le même dénominateur $' + d1 + '$.');
    } else {
      var parts = [];
      if (k1 > 1) parts.push('$' + fr(n1, d1) + ' = \\dfrac{' + n1 + ' \\times ' + k1 + '}{' + d1 + ' \\times ' + k1 + '} = ' + fr(N1, L) + '$');
      if (k2 > 1) parts.push('$' + fr(n2, d2) + ' = \\dfrac{' + n2 + ' \\times ' + k2 + '}{' + d2 + ' \\times ' + k2 + '} = ' + fr(N2, L) + '$');
      st.push('On réduit au même dénominateur $' + L + '$ (le plus petit multiple commun de $' + d1 + '$ et $' + d2 + '$) : ' + parts.join(' et ') + '.');
    }
    st.push('$' + nom + ' = ' + fr(N1, L) + ' ' + op + ' ' + fr(N2, L) + ' = ' + fr(R, L) + simpl(R, L) + '$');
    return { steps: st, res: F(R, L) };
  }
  /** Étapes d'un produit de deux fractions. */
  function etapesProduit(n1, d1, n2, d2, nom) {
    var st = ['$' + nom + ' = \\dfrac{' + T.num(n1) + ' \\times ' + T.par(n2) + '}{' + d1 + ' \\times ' + d2 + '} = ' + fr(n1 * n2, d1 * d2) + simpl(n1 * n2, d1 * d2) + '$'];
    return { steps: st, res: F(n1 * n2, d1 * d2) };
  }

  EM.gen.register({
    id: '5e-fractions-calcul',
    titre: 'Calculer avec des fractions',
    chapitres: ['5e-fractions'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var expr, sol = [], res, question, e;
      if (niveau === 1) {
        var b = rng.int(2, 9), k = rng.int(2, 4), d = b * k;
        var a = rng.intExcept(1, 2 * b - 1, [b]), c = rng.int(1, d - 1);
        if (rng.bool()) { var t = a; a = c; c = t; t = b; b = d; d = t; }
        var op = rng.pick(['+', '-']);
        if (op === '-' && F(a, b).cmp(F(c, d)) <= 0) op = '+';
        expr = fr(a, b) + ' ' + op + ' ' + fr(c, d);
        e = etapesSomme(a, b, c, d, op, 'A');
        sol = e.steps; res = e.res;
        if (op === '+' && rng.bool(0.4)) {
          question = qcm(rng, 'Quelle est la valeur de $A$ ?', { tex: '$' + res.tex() + '$', val: res.value() }, [
            { tex: '$' + fr(a + c, b + d) + '$', val: (a + c) / (b + d) },
            { tex: '$' + fr(a + c, ar.lcm(b, d)) + '$', val: (a + c) / ar.lcm(b, d) },
            { tex: '$' + fr(a * d + c * b, b * d * 2) + '$', val: (a * d + c * b) / (2 * b * d) }
          ]);
        }
      } else if (niveau === 2) {
        var op2 = rng.pick(['+', '-', '×', '÷']);
        var b2 = rng.int(2, 12), d2 = rng.intExcept(2, 12, [b2]);
        var a2 = rng.intExcept(1, 2 * b2, [b2]), c2 = rng.intExcept(1, 2 * d2, [d2]);
        if (op2 === '+' || op2 === '-') {
          if (op2 === '-' && F(a2, b2).cmp(F(c2, d2)) <= 0) { var tt = a2; a2 = c2; c2 = tt; tt = b2; b2 = d2; d2 = tt; }
          if (op2 === '-' && F(a2, b2).cmp(F(c2, d2)) === 0) op2 = '+';
          expr = fr(a2, b2) + ' ' + op2 + ' ' + fr(c2, d2);
          e = etapesSomme(a2, b2, c2, d2, op2, 'A');
          sol = e.steps; res = e.res;
        } else if (op2 === '×') {
          // favorise une simplification en croix
          if (rng.bool(0.6)) { var g = rng.int(2, 5); c2 = g * rng.int(1, 4); b2 = g * rng.int(1, 3); if (b2 === 1) b2 = g; }
          expr = fr(a2, b2) + ' \\times ' + fr(c2, d2);
          e = etapesProduit(a2, b2, c2, d2, 'A');
          sol = ['Pour multiplier deux fractions, on multiplie les numérateurs entre eux et les dénominateurs entre eux.'].concat(e.steps);
          res = e.res;
        } else {
          expr = fr(a2, b2) + ' \\div ' + fr(c2, d2);
          e = etapesProduit(a2, b2, d2, c2, 'A');
          sol = ['Diviser par une fraction, c\'est multiplier par son inverse : $A = ' + fr(a2, b2) + ' \\times ' + fr(d2, c2) + '$.'].concat(e.steps);
          res = e.res;
        }
      } else {
        var tpl = rng.pick(['plusprod', 'diffdiv']);
        var p1 = rng.int(1, 5), q1 = rng.int(2, 6), p2 = rng.int(1, 5), q2 = rng.int(2, 9), p3 = rng.int(1, 7), q3 = rng.int(2, 9);
        if (tpl === 'plusprod') {
          expr = fr(p1, q1) + ' + ' + fr(p2, q2) + ' \\times ' + fr(p3, q3);
          var pr = F(p2 * p3, q2 * q3);
          sol.push('La multiplication est prioritaire : $' + fr(p2, q2) + ' \\times ' + fr(p3, q3) + ' = ' + fr(p2 * p3, q2 * q3) + simpl(p2 * p3, q2 * q3) + '$.');
          e = etapesSomme(p1, q1, pr.n, pr.d, '+', 'A');
          sol = sol.concat(['$A = ' + fr(p1, q1) + ' + ' + pr.tex() + '$'], e.steps);
          res = e.res;
        } else {
          if (F(p1, q1).cmp(F(p2, q2)) <= 0) { var u = p1; p1 = p2; p2 = u; u = q1; q1 = q2; q2 = u; }
          if (F(p1, q1).cmp(F(p2, q2)) === 0) p1 += 1;
          expr = '\\left(' + fr(p1, q1) + ' - ' + fr(p2, q2) + '\\right) \\div ' + fr(p3, q3);
          e = etapesSomme(p1, q1, p2, q2, '-', 'D');
          var df = e.res;
          sol.push('On calcule d\'abord la parenthèse $D = ' + fr(p1, q1) + ' - ' + fr(p2, q2) + '$.');
          sol = sol.concat(e.steps);
          sol.push('Diviser par $' + fr(p3, q3) + '$, c\'est multiplier par son inverse $' + fr(q3, p3) + '$ :');
          var e2 = etapesProduit(df.n, df.d, q3, p3, 'A');
          sol = sol.concat(e2.steps);
          res = e2.res;
        }
      }
      return {
        enonce: 'Calculer et donner le résultat sous forme de fraction irréductible : $$A = ' + expr + '$$',
        questions: [question || { label: '$A =$', type: 'number', reponse: res, reponseTex: res.tex() }],
        indices: [
          'Pour additionner ou soustraire, réduis d\'abord au même dénominateur ; pour multiplier, multiplie numérateurs et dénominateurs.',
          'Diviser par une fraction revient à multiplier par son inverse. Pense à simplifier le résultat.'
        ],
        solution: sol,
        aide: 'Écris une fraction avec « / », par exemple 7/12.'
      };
    }
  });

  EM.gen.register({
    id: '5e-fractions-probleme',
    titre: 'Résoudre un problème de partage avec des fractions',
    chapitres: ['5e-fractions'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var p = rng.pick(PRENOMS), v = rng.pick(VILLES);
      var F1 = [[1, 2], [1, 3], [2, 5], [1, 4], [3, 8], [2, 7], [3, 10], [2, 3], [3, 5]];
      var F2 = [[1, 4], [1, 5], [1, 6], [1, 3], [1, 8], [1, 10], [3, 10], [2, 9], [2, 5]];
      var f1, f2, guard = 0;
      do {
        f1 = rng.pick(F1); f2 = rng.pick(F2); guard++;
      } while (guard < 100 && (f1[1] === f2[1] || (niveau === 1 && F(f1[0], f1[1]).add(F(f2[0], f2[1])).cmp(1) >= 0)));
      var ctx = rng.pick([
        { tot: 'la récolte', u: 10, min: 300, max: 4000, unite: 'kg', grandeur: 'masse',
          debut: p + ', qui cultive un champ près de ' + v + ', récolte $Q$ kg d\'arachide.',
          act1: 'en vend $f_1$ à l\'huilerie', act2: 'garde $f_2$ comme semences', reste: 'pour la consommation de sa famille' },
        { tot: 'le salaire', u: 1000, min: 60000, max: 400000, unite: 'F CFA', grandeur: 'somme',
          debut: p + ', qui habite à ' + v + ', reçoit un salaire mensuel de $Q$ F CFA.',
          act1: 'consacre $f_1$ au loyer', act2: 'consacre $f_2$ à la nourriture', reste: 'pour les autres dépenses' },
        { tot: 'la pêche', u: 10, min: 200, max: 3000, unite: 'kg', grandeur: 'masse',
          debut: 'Au quai de pêche de Kayar, la pirogue ' + de(p) + ' débarque $Q$ kg de poisson.',
          act1: 'vend $f_1$ aux mareyeuses', act2: 'vend $f_2$ à l\'usine de transformation', reste: 'pour le marché local' },
        { tot: 'le réservoir', u: 10, min: 500, max: 6000, unite: 'L', grandeur: 'quantité d\'eau',
          debut: 'Le réservoir d\'un forage près de ' + v + ' contient $Q$ litres d\'eau.',
          act1: 'utilise $f_1$ pour abreuver le bétail', act2: 'utilise $f_2$ pour arroser les jardins', reste: 'pour les ménages' }
      ]);
      var L = niveau === 1 ? ar.lcm(f1[1], f2[1]) : f1[1] * f2[1];
      var kmin = Math.max(1, Math.ceil(ctx.min / (L * ctx.u))), kmax = Math.max(kmin, Math.floor(ctx.max / (L * ctx.u)));
      var Q = L * rng.int(kmin, kmax) * ctx.u;
      var fr1 = F(f1[0], f1[1]), fr2 = F(f2[0], f2[1]);
      var tf1 = fr(f1[0], f1[1]), tf2 = fr(f2[0], f2[1]);
      var sujet = ctx.tot === 'le réservoir' ? 'On' : p;
      var a1 = ctx.act1.replace('$f_1$', '$' + tf1 + '$'), a2 = ctx.act2.replace('$f_2$', '$' + tf2 + '$');
      var enonce = ctx.debut.replace('$Q$', '$' + T.num(Q) + '$') + ' ';
      var R, sol = [], qte, part2;
      if (niveau === 1) {
        enonce += sujet + ' ' + a1 + ' et ' + a2 + ' ; le reste est gardé ' + ctx.reste + '.';
        var e = etapesSomme(f1[0], f1[1], f2[0], f2[1], '+', 'S');
        sol.push('Fraction utilisée : $S = ' + tf1 + ' + ' + tf2 + '$.');
        sol = sol.concat(e.steps);
        R = F(1).sub(e.res);
        sol.push('Fraction restante : $1 - ' + e.res.tex() + ' = ' + fr(e.res.d, e.res.d) + ' - ' + e.res.tex() + ' = ' + R.tex() + '$.');
      } else {
        a2 = a2.replace('$' + tf2 + '$', '$' + tf2 + '$ du reste');
        enonce += sujet + ' ' + a1 + ', puis ' + a2 + ' ; ce qui reste est gardé ' + ctx.reste + '.';
        var r1 = F(1).sub(fr1);
        part2 = fr2.mul(r1);
        R = r1.sub(part2);
        sol.push('Après la première opération, il reste $1 - ' + tf1 + ' = ' + r1.tex() + '$ de ' + ctx.tot + '.');
        sol.push('La seconde opération porte sur $' + tf2 + '$ de ce reste, soit $' + tf2 + ' \\times ' + r1.tex() + ' = ' + fr(f2[0] * r1.n, f2[1] * r1.d) + simpl(f2[0] * r1.n, f2[1] * r1.d) + '$ de ' + ctx.tot + '.');
        sol.push('Fraction restante : $' + r1.tex() + ' - ' + part2.tex() + ' = ' + R.tex() + '$.');
      }
      qte = R.mul(Q).value();
      sol.push(ctx.grandeur.charAt(0).toUpperCase() + ctx.grandeur.slice(1) + ' restante : $' + R.tex() + ' \\times ' + T.num(Q) + ' = ' + T.num(qte) + '$ ' + ctx.unite + '.');
      var questions = [];
      if (niveau === 2) questions.push({ label: 'Fraction de ' + ctx.tot + ' utilisée lors de la seconde opération :', type: 'number', reponse: part2, reponseTex: part2.tex() });
      questions.push({ label: 'Fraction de ' + ctx.tot + ' qui reste :', type: 'number', reponse: R, reponseTex: R.tex() });
      questions.push({ label: ctx.grandeur.charAt(0).toUpperCase() + ctx.grandeur.slice(1) + ' restante (en ' + ctx.unite + ') :', type: 'number', reponse: qte, unite: ctx.unite });
      return {
        enonce: enonce + '<br>' + (niveau === 2 ? 'Calculer la fraction de ' + ctx.tot + ' utilisée lors de la seconde opération, puis la' : 'Calculer la') + ' fraction de ' + ctx.tot + ' qui reste et la ' + ctx.grandeur + ' correspondante.',
        questions: questions,
        indices: niveau === 1
          ? ['Additionne d\'abord les deux fractions utilisées, puis retire le résultat de $1$ (le tout).', 'Pour prendre une fraction d\'une quantité, multiplie la fraction par la quantité.']
          : ['« $' + tf2 + '$ du reste » signifie $' + tf2 + ' \\times$ (fraction restante après la première opération).', 'La fraction restante finale est $\\left(1 - ' + tf1 + '\\right) \\times \\left(1 - ' + tf2 + '\\right)$.'],
        solution: sol,
        aide: 'Écris une fraction avec « / », par exemple 3/20.'
      };
    }
  });

  /* ================================================================== */
  /* 5e — PGCD et PPCM                                                   */
  /* ================================================================== */
  function euclideSteps(a, b) {
    var st = [], x = Math.max(a, b), y = Math.min(a, b);
    while (y) {
      var q = Math.floor(x / y), r = x % y;
      st.push('$' + T.num(x) + ' = ' + T.num(y) + ' \\times ' + q + ' + ' + r + '$');
      x = y; y = r;
    }
    return { steps: st, g: x };
  }
  function expoMap(n) {
    var m = {};
    ar.primeFactors(n).forEach(function (p) { m[p] = (m[p] || 0) + 1; });
    return m;
  }
  function texFromMap(m) {
    var ks = Object.keys(m).map(Number).sort(function (a, b) { return a - b; }).filter(function (k) { return m[k] > 0; });
    if (!ks.length) return '1';
    return ks.map(function (k) { return m[k] > 1 ? k + '^{' + m[k] + '}' : String(k); }).join(' \\times ');
  }

  EM.gen.register({
    id: '5e-pgcd-ppcm',
    titre: 'Calculer un PGCD et un PPCM',
    chapitres: ['5e-pgcd-ppcm'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, g, p, q, guard = 0, sol = [], questions = [], enonce, indices;
      function couple(gmin, gmax, pmax, lim) {
        do {
          g = rng.int(gmin, gmax); p = rng.int(3, pmax); q = rng.int(2, p - 1); guard++;
        } while (guard < 200 && (ar.gcd(p, q) !== 1 || g * p > lim));
        a = g * p; b = g * q;
      }
      if (niveau === 1) {
        couple(4, 36, 25, 999);
        var eu = euclideSteps(a, b);
        enonce = 'Déterminer le PGCD de $' + T.num(a) + '$ et $' + T.num(b) + '$ à l\'aide de l\'algorithme d\'Euclide, puis écrire la fraction $' + fr(b, a) + '$ sous forme irréductible.';
        sol.push('On effectue les divisions euclidiennes successives :');
        sol = sol.concat(eu.steps);
        sol.push('Le dernier reste non nul est $' + eu.g + '$, donc $\\text{PGCD}(' + T.num(a) + ' ; ' + T.num(b) + ') = ' + eu.g + '$.');
        sol.push('On divise le numérateur et le dénominateur par le PGCD : $' + fr(b, a) + ' = \\dfrac{' + b + ' \\div ' + g + '}{' + a + ' \\div ' + g + '} = ' + fr(q, p) + '$.');
        questions = [
          { label: 'PGCD $=$', type: 'number', reponse: g },
          { label: 'Fraction irréductible :', type: 'number', reponse: F(q, p), reponseTex: fr(q, p) }
        ];
        indices = ['Divise le plus grand nombre par le plus petit, puis recommence avec le diviseur et le reste.', 'Le PGCD est le dernier reste non nul.'];
      } else if (niveau === 2) {
        do {
          g = rng.pick([2, 3, 4, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
          p = rng.int(2, 15); q = rng.intExcept(2, 15, [p]); guard++;
        } while (guard < 200 && (ar.gcd(p, q) !== 1 || g * Math.max(p, q) > 600));
        a = g * Math.max(p, q); b = g * Math.min(p, q);
        var ma = expoMap(a), mb = expoMap(b), mg = {}, ml = {};
        Object.keys(ma).concat(Object.keys(mb)).forEach(function (k) {
          var ea = ma[k] || 0, eb = mb[k] || 0;
          mg[k] = Math.min(ea, eb); ml[k] = Math.max(ea, eb);
        });
        var lcm = ar.lcm(a, b);
        enonce = 'Décomposer $' + T.num(a) + '$ et $' + T.num(b) + '$ en produits de facteurs premiers, puis en déduire leur PGCD et leur PPCM.';
        sol.push('$' + T.num(a) + ' = ' + decompTex(a) + '$ et $' + T.num(b) + ' = ' + decompTex(b) + '$.');
        sol.push('PGCD : produit des facteurs premiers communs, chacun avec le plus petit exposant : $\\text{PGCD} = ' + texFromMap(mg) + ' = ' + g + '$.');
        sol.push('PPCM : produit de tous les facteurs premiers, chacun avec le plus grand exposant : $\\text{PPCM} = ' + texFromMap(ml) + ' = ' + T.num(lcm) + '$.');
        sol.push('Vérification : $' + g + ' \\times ' + T.num(lcm) + ' = ' + T.num(a * b) + ' = ' + T.num(a) + ' \\times ' + T.num(b) + '$.');
        questions = [
          { label: '$\\text{PGCD}(' + T.num(a) + ' ; ' + T.num(b) + ') =$', type: 'number', reponse: g },
          { label: '$\\text{PPCM}(' + T.num(a) + ' ; ' + T.num(b) + ') =$', type: 'number', reponse: lcm }
        ];
        indices = ['Divise successivement par les nombres premiers $2$, $3$, $5$, $7$, …', 'PGCD : facteurs communs, plus petits exposants. PPCM : tous les facteurs, plus grands exposants.'];
      } else {
        var type = rng.pick(['paniers', 'carreaux', 'cars']);
        var nom = rng.pick(PRENOMS);
        if (type === 'paniers') {
          couple(6, 30, 9, 300);
          var fruits = rng.pick([['mangues', 'oranges'], ['mangues', 'goyaves'], ['sachets de bissap', 'sachets de gingembre'], ['cahiers', 'stylos']]);
          enonce = 'Pour une kermesse, ' + nom + ' dispose de $' + a + '$ ' + fruits[0] + ' et de $' + b + '$ ' + fruits[1] + '. ' +
            nom + ' veut préparer le plus grand nombre possible de lots identiques en utilisant tout. Combien de lots peut-elle préparer ? Combien de ' + fruits[0] + ' contient chaque lot ?';
          var e1 = euclideSteps(a, b);
          sol.push('Le nombre de lots doit diviser $' + a + '$ et $' + b + '$ ; on cherche le plus grand : c\'est le PGCD.');
          sol = sol.concat(e1.steps);
          sol.push('$\\text{PGCD}(' + a + ' ; ' + b + ') = ' + g + '$ : on peut préparer $' + g + '$ lots.');
          sol.push('Chaque lot contient $' + a + ' \\div ' + g + ' = ' + p + '$ ' + fruits[0] + ' (et $' + q + '$ ' + fruits[1] + ').');
          questions = [
            { label: 'Nombre de lots :', type: 'number', reponse: g },
            { label: 'Nombre de ' + fruits[0] + ' par lot :', type: 'number', reponse: p }
          ];
        } else if (type === 'carreaux') {
          couple(5, 40, 8, 400);
          enonce = 'Un menuisier de ' + rng.pick(VILLES) + ' doit découper une plaque rectangulaire de $' + a + '$ cm sur $' + b + '$ cm en carreaux carrés identiques, les plus grands possibles, sans aucune perte. Quelle est la longueur du côté d\'un carreau ? Combien de carreaux obtient-il ?';
          var e2 = euclideSteps(a, b);
          sol.push('Le côté d\'un carreau doit diviser $' + a + '$ et $' + b + '$ ; le plus grand possible est leur PGCD.');
          sol = sol.concat(e2.steps);
          sol.push('Le côté d\'un carreau mesure $' + g + '$ cm.');
          sol.push('On place $' + a + ' \\div ' + g + ' = ' + p + '$ carreaux dans la longueur et $' + b + ' \\div ' + g + ' = ' + q + '$ dans la largeur, soit $' + p + ' \\times ' + q + ' = ' + p * q + '$ carreaux.');
          questions = [
            { label: 'Côté d\'un carreau (cm) :', type: 'number', reponse: g, unite: 'cm' },
            { label: 'Nombre de carreaux :', type: 'number', reponse: p * q }
          ];
        } else {
          do {
            g = rng.pick([2, 3, 4, 5, 6, 10, 12]); p = rng.int(2, 9); q = rng.intExcept(2, 9, [p]); guard++;
          } while (guard < 200 && (ar.gcd(p, q) !== 1 || g * Math.max(p, q) > 60 || g * Math.max(p, q) < 12));
          a = g * p; b = g * q;
          var L = g * p * q, h0 = rng.int(6, 7);
          enonce = 'À la gare routière de ' + rng.pick(VILLES) + ', deux cars partent ensemble à $' + h0 + '$ h. Le premier repart toutes les $' + a + '$ minutes, le second toutes les $' + b + '$ minutes. Au bout de combien de minutes repartiront-ils de nouveau ensemble pour la première fois ?';
          sol.push('Les départs du premier car ont lieu aux multiples de $' + a + '$ minutes, ceux du second aux multiples de $' + b + '$ minutes. On cherche le plus petit multiple commun non nul : le PPCM.');
          sol.push('$' + a + ' = ' + decompTex(a) + '$ et $' + b + ' = ' + decompTex(b) + '$.');
          sol.push('$\\text{PPCM}(' + a + ' ; ' + b + ') = ' + L + '$ : ils repartiront ensemble au bout de $' + L + '$ minutes' + (L >= 60 ? ', soit $' + Math.floor(L / 60) + '$ h' + (L % 60 ? ' $' + (L % 60) + '$ min' : '') : '') + '.');
          questions = [{ label: 'Durée (en minutes) :', type: 'number', reponse: L, unite: 'min' }];
        }
        indices = ['Partager « le plus possible » en parts identiques : pense au PGCD. Se retrouver « de nouveau ensemble » : pense au PPCM.', 'Utilise l\'algorithme d\'Euclide ou les décompositions en facteurs premiers.'];
      }
      return { enonce: enonce, questions: questions, indices: indices, solution: sol };
    }
  });

  /* ================================================================== */
  /* 5e — Expressions littérales                                         */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-expressions',
    titre: 'Calculer la valeur d\'une expression, réduire, développer',
    chapitres: ['5e-expressions-litterales'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], q, enonce, indices;
      if (niveau === 1) {
        var deg2 = rng.bool(0.6);
        var c = deg2 ? [rng.nz(-5, 5), rng.int(-9, 9), rng.int(-9, 9)] : [rng.nz(-9, 9), rng.nz(-9, 9)];
        var x0 = rng.nz(-6, 6);
        if (deg2 && Math.abs(x0) > 4) x0 = x0 > 0 ? 3 : -3;
        var d = c.length - 1, parts = [], vals = [];
        c.forEach(function (k, i) {
          var pw = d - i;
          if (k === 0) return;
          var base = pw === 0 ? '' : T.par(x0) + (pw === 2 ? '^2' : '');
          var first = parts.length === 0;
          var s;
          if (pw === 0) s = T.signed(k, first);
          else if (Math.abs(k) === 1) s = (k < 0 ? (first ? '-' : ' - ') : (first ? '' : ' + ')) + base;
          else s = (k < 0 ? (first ? '-' : ' - ') : (first ? '' : ' + ')) + Math.abs(k) + ' \\times ' + base;
          parts.push(s);
          vals.push(k * Math.pow(x0, pw));
        });
        var res = vals.reduce(function (s, x) { return s + x; }, 0);
        enonce = 'Calculer la valeur de l\'expression $A = ' + T.poly(c) + '$ pour $x = ' + T.num(x0) + '$.';
        sol.push('On remplace $x$ par $' + T.num(x0) + '$ (entre parenthèses s\'il est négatif) : $A = ' + parts.join('') + '$.');
        if (deg2) sol.push('Les puissances d\'abord : $' + T.par(x0) + '^2 = ' + x0 * x0 + '$.');
        sol.push('$A = ' + vals.map(function (x, i) { return T.signed(x, i === 0); }).join('') + '$');
        sol.push('$A = ' + T.num(res) + '$');
        q = { label: '$A =$', type: 'number', reponse: res };
        indices = ['Remplace chaque $x$ par $' + T.par(x0) + '$ et rétablis les signes $\\times$.', 'Respecte les priorités : puissances, puis multiplications, puis additions.'];
      } else if (niveau === 2) {
        var a1, a2, b1, b2, e1 = 0, e2 = 0, guard = 0;
        do {
          a1 = rng.nz(-9, 9); a2 = rng.nz(-9, 9); b1 = rng.nz(-9, 9); b2 = rng.nz(-9, 9); guard++;
        } while (guard < 50 && (a1 + a2 === 0 || b1 + b2 === 0));
        if (rng.bool(0.5)) { e1 = rng.nz(-5, 5); e2 = rng.nz(-5, 5); if (e1 + e2 === 0) e2 += e2 > 0 ? 1 : -1; }
        var terms = [{ c: a1, v: 'x' }, { c: b1, v: '' }, { c: a2, v: 'x' }, { c: b2, v: '' }];
        if (e1) terms.push({ c: e1, v: 'x^2' }, { c: e2, v: 'x^2' });
        terms = rng.shuffle(terms);
        var R = e1 ? [e1 + e2, a1 + a2, b1 + b2] : [a1 + a2, b1 + b2];
        enonce = 'Réduire l\'expression : $$B = ' + T.sum(terms) + '$$';
        var grp = [];
        if (e1) grp.push('termes en $x^2$ : $' + T.mono(e1, 'x^2', true) + T.mono(e2, 'x^2') + ' = ' + T.mono(e1 + e2, 'x^2', true) + '$');
        grp.push('termes en $x$ : $' + T.mono(a1, 'x', true) + T.mono(a2, 'x') + ' = ' + T.mono(a1 + a2, 'x', true) + '$');
        grp.push('constantes : $' + T.signed(b1, true) + T.signed(b2) + ' = ' + T.num(b1 + b2) + '$');
        sol.push('On regroupe les termes semblables : ' + grp.join(' ; ') + '.');
        sol.push('$B = ' + T.poly(R) + '$');
        q = { label: '$B =$', type: 'expr', reponse: polyStr(R), reponseTex: T.poly(R) };
        indices = ['Regroupe les termes en $x^2$, les termes en $x$ et les nombres.', 'On ne peut pas additionner des $x$ et des nombres : $3x + 2$ ne se réduit pas.'];
      } else {
        var k = rng.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]), a = rng.nz(-5, 5), b = rng.nz(-9, 9);
        var moins = rng.bool(0.5);
        var m = moins ? -1 : rng.nz(-5, 5), cc = rng.nz(-5, 5), dd = rng.nz(-9, 9);
        if (k * a + m * cc === 0) cc = cc + (cc > 0 ? 1 : -1);
        var p1 = [k * a, k * b], p2 = [m * cc, m * dd];
        var Rr = [p1[0] + p2[0], p1[1] + p2[1]];
        var exprTex = (k === -1 ? '-' : T.num(k)) + '(' + T.poly([a, b]) + ')' + (moins ? ' - (' : (m < 0 ? ' - ' + (m === -1 ? '' : T.num(-m)) : ' + ' + (m === 1 ? '' : T.num(m)))) + (moins ? '' : '(') + T.poly([cc, dd]) + ')';
        enonce = 'Développer et réduire l\'expression : $$C = ' + exprTex + '$$';
        sol.push('On distribue : $' + (k === -1 ? '-' : T.num(k)) + '(' + T.poly([a, b]) + ') = ' + T.poly(p1) + '$.');
        if (moins) sol.push('La parenthèse est précédée du signe $-$ : on la supprime en changeant les signes, $-(' + T.poly([cc, dd]) + ') = ' + T.poly(p2) + '$.');
        else sol.push('On distribue : $' + (m === -1 ? '-' : m === 1 ? '' : T.num(m)) + '(' + T.poly([cc, dd]) + ') = ' + T.poly(p2) + '$.');
        sol.push('$C = ' + T.poly(p1) + T.mono(p2[0], 'x') + T.signed(p2[1]) + '$');
        sol.push('$C = ' + T.poly(Rr) + '$');
        q = { label: '$C =$', type: 'expr', reponse: polyStr(Rr), reponseTex: T.poly(Rr) };
        indices = ['Distributivité : $k(a + b) = ka + kb$. Fais attention aux signes.', 'Une parenthèse précédée de $-$ se supprime en changeant tous les signes à l\'intérieur.'];
      }
      return { enonce: enonce, questions: [q], indices: indices, solution: sol, aide: niveau > 1 ? 'Écris l\'expression réduite, par exemple 3x^2 - 5x + 2 (x² s\'écrit x^2).' : undefined };
    }
  });

  /* ================================================================== */
  /* 5e — Proportionnalité                                               */
  /* ================================================================== */
  function duree(tm) {
    var h = Math.floor(tm / 60), m = tm % 60;
    if (!h) return '$' + m + '$ min';
    return '$' + h + '$ h' + (m ? ' $' + (m < 10 ? '0' + m : m) + '$ min' : '');
  }

  EM.gen.register({
    id: '5e-vitesse',
    titre: 'Vitesse moyenne, distance et durée',
    chapitres: ['5e-proportionnalite'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var villeM = rng.pick(['Ziguinchor', 'Kaolack', 'Thiès', 'Touba', 'Mbour']);
      var veh = rng.pick([
        { nom: 'Un bus interurbain', il: 'il', trajet: 'sur une route nationale', dep: 'la gare routière de ' + rng.pick(VILLES), arr: 'sa destination', v: [45, 48, 50, 54, 60, 64, 70], t: [36, 48, 54, 72, 84, 90, 96, 102, 150] },
        { nom: 'Le TER', il: 'il', trajet: 'entre deux gares de sa ligne', dep: 'la gare de Dakar', arr: 'la gare d\'arrivée', v: [60, 66, 70, 72, 75, 80, 90], t: [12, 18, 24, 30, 36] },
        { nom: 'Un taxi-moto', il: 'il', trajet: 'dans la ville de ' + villeM, dep: 'le marché central de ' + villeM, arr: 'le domicile de son client', v: [24, 30, 36, 40, 42, 45], t: [12, 18, 24, 30] },
        { nom: 'Une pirogue motorisée', il: 'elle', trajet: 'entre deux villages de pêcheurs de la Petite-Côte', dep: 'le quai de Joal', arr: 'la zone de pêche', v: [12, 15, 18, 20, 24, 25], t: [30, 42, 48, 60, 72, 90, 120] },
        { nom: 'Un camion de mangues', il: 'il', trajet: 'sur une route nationale', dep: 'un verger de Casamance', arr: 'un marché de gros', v: [45, 50, 54, 60, 64, 70], t: [90, 120, 150, 168, 180, 210, 240] }
      ]);
      var sol = [], questions, enonce, indices;
      if (niveau === 1) {
        var v = rng.pick(veh.v), tm = rng.pick(veh.t), d = rnd(v * tm / 60, 4), th = rnd(tm / 60, 4);
        var cas = rng.pick(['v', 'd', 't']);
        var trajet = veh.trajet;
        var conv = 'On convertit la durée en heures : ' + duree(tm) + ' $= \\dfrac{' + tm + '}{60}$ h $= ' + T.num(th) + '$ h.';
        if (cas === 'v') {
          enonce = veh.nom + ' parcourt $' + T.num(d) + '$ km ' + trajet + ' en ' + duree(tm) + '. Calculer sa vitesse moyenne en km/h.';
          sol = [conv, '$v = \\dfrac{d}{t} = \\dfrac{' + T.num(d) + '}{' + T.num(th) + '} = ' + T.num(v) + '$ km/h.'];
          questions = [{ label: 'Vitesse moyenne :', type: 'number', reponse: v, unite: 'km/h' }];
        } else if (cas === 'd') {
          enonce = veh.nom + ' roule ' + trajet + ' à la vitesse moyenne de $' + v + '$ km/h pendant ' + duree(tm) + '. Calculer la distance parcourue en km.';
          sol = [conv, '$d = v \\times t = ' + v + ' \\times ' + T.num(th) + ' = ' + T.num(d) + '$ km.'];
          questions = [{ label: 'Distance :', type: 'number', reponse: d, unite: 'km' }];
        } else {
          enonce = veh.nom + ' parcourt $' + T.num(d) + '$ km ' + trajet + ' à la vitesse moyenne de $' + v + '$ km/h. Calculer la durée du trajet en minutes.';
          sol = ['$t = \\dfrac{d}{v} = \\dfrac{' + T.num(d) + '}{' + v + '} = ' + T.num(th) + '$ h.', 'En minutes : $' + T.num(th) + ' \\times 60 = ' + tm + '$ min, soit ' + duree(tm) + '.'];
          questions = [{ label: 'Durée (en minutes) :', type: 'number', reponse: tm, unite: 'min' }];
        }
        indices = ['Une durée se convertit en heures en divisant le nombre de minutes par $60$ : $30$ min $= 0{,}5$ h.', 'Retiens $d = v \\times t$, $v = \\dfrac{d}{t}$ et $t = \\dfrac{d}{v}$.'];
      } else {
        var cas2 = rng.pick(['ms', 'horaire']);
        if (cas2 === 'ms') {
          var vms = rng.pick([3.5, 4, 4.5, 5, 5.5, 6]), ts = rng.pick([40, 60, 80, 100, 120, 150, 180]);
          var dm = rnd(vms * ts), vkh = rnd(vms * 3.6);
          var nm = rng.pick(PRENOMS);
          enonce = 'Lors d\'une course au stade de ' + rng.pick(VILLES) + ', ' + nm + ' parcourt $' + T.num(dm) + '$ m en $' + ts + '$ secondes. Calculer sa vitesse moyenne en m/s, puis en km/h.';
          sol = ['$v = \\dfrac{' + T.num(dm) + '}{' + ts + '} = ' + T.num(vms) + '$ m/s.',
            'En une heure ($3\\,600$ s), on parcourt $' + T.num(vms) + ' \\times 3\\,600 = ' + T.num(rnd(vms * 3600)) + '$ m, soit $' + T.num(vkh) + '$ km.',
            'Donc $v = ' + T.num(vkh) + '$ km/h (pour passer des m/s aux km/h, on multiplie par $3{,}6$).'];
          questions = [{ label: 'Vitesse en m/s :', type: 'number', reponse: vms, unite: 'm/s' }, { label: 'Vitesse en km/h :', type: 'number', reponse: vkh, unite: 'km/h' }];
          indices = ['Vitesse = distance ÷ durée.', '$1$ h $= 3\\,600$ s et $1$ km $= 1\\,000$ m : multiplier par $3\\,600$ puis diviser par $1\\,000$ revient à multiplier par $3{,}6$.'];
        } else {
          var v2 = rng.pick(veh.v), tm2 = rng.pick(veh.t), d2 = rnd(v2 * tm2 / 60, 4), th2 = rnd(tm2 / 60, 4);
          var hd = rng.int(6, 15), md = rng.pick([0, 5, 10, 15, 20, 30, 40, 45, 50]);
          var fin = hd * 60 + md + tm2, hf = Math.floor(fin / 60), mf = fin % 60;
          enonce = veh.nom + ' quitte ' + veh.dep + ' à $' + hd + '$ h' + (md ? ' $' + (md < 10 ? '0' + md : md) + '$' : '') + ' et parcourt $' + T.num(d2) + '$ km à la vitesse moyenne de $' + v2 + '$ km/h. À quelle heure arrive-t-' + veh.il + ' à ' + veh.arr + ' ?';
          sol = ['Durée du trajet : $t = \\dfrac{d}{v} = \\dfrac{' + T.num(d2) + '}{' + v2 + '} = ' + T.num(th2) + '$ h, soit $' + T.num(th2) + ' \\times 60 = ' + tm2 + '$ min, c\'est-à-dire ' + duree(tm2) + '.',
            'Heure d\'arrivée : $' + hd + '$ h $' + md + '$ min $+$ ' + duree(tm2) + ' $=$ $' + hf + '$ h $' + mf + '$ min.'];
          questions = [{ label: 'Heures :', type: 'number', reponse: hf, unite: 'h' }, { label: 'Minutes :', type: 'number', reponse: mf, unite: 'min' }];
          indices = ['Calcule d\'abord la durée du trajet avec $t = \\dfrac{d}{v}$.', 'Convertis la partie décimale des heures en minutes (multiplie par $60$), puis ajoute à l\'heure de départ.'];
        }
      }
      return { enonce: enonce, questions: questions, indices: indices, solution: sol };
    }
  });

  EM.gen.register({
    id: '5e-pourcentage-echelle',
    titre: 'Pourcentages et échelles',
    chapitres: ['5e-proportionnalite'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var cas = niveau === 1 ? rng.pick(['remise', 'hausse', 'taux']) : rng.pick(['carte', 'plan', 'initial', 'successifs']);
      var p = rng.pick(PRENOMS), sol = [], questions, enonce, indices;
      var marche = rng.pick(['Sandaga', 'Tilène', 'Kermel', 'HLM', 'Colobane']);
      if (cas === 'remise') {
        var art = rng.pick([['un boubou', 8000, 40000], ['une paire de chaussures', 5000, 25000], ['un sac de riz de $50$ kg', 15000, 30000], ['un pagne tissé', 3000, 15000], ['un ventilateur', 10000, 35000]]);
        var P = 500 * rng.int(art[1] / 500, art[2] / 500), t = rng.pick([5, 10, 15, 20, 25, 30, 40]);
        var rem = P * t / 100, np = P - rem;
        enonce = 'Au marché ' + marche + ', ' + p + ' achète ' + art[0] + ' affiché à $' + T.num(P) + '$ F CFA. Le commerçant accorde une remise de $' + t + '$ %. Calculer le montant de la remise, puis le prix payé.';
        sol = ['Remise : $\\dfrac{' + t + '}{100} \\times ' + T.num(P) + ' = ' + T.num(rem) + '$ F CFA.', 'Prix payé : $' + T.num(P) + ' - ' + T.num(rem) + ' = ' + T.num(np) + '$ F CFA.',
          'Autre méthode : on paie $' + (100 - t) + '$ % du prix, soit $' + T.num(rnd(1 - t / 100)) + ' \\times ' + T.num(P) + ' = ' + T.num(np) + '$ F CFA.'];
        questions = [{ label: 'Remise (F CFA) :', type: 'number', reponse: rem, unite: 'F CFA' }, { label: 'Prix payé (F CFA) :', type: 'number', reponse: np, unite: 'F CFA' }];
        indices = ['Prendre $t$ % d\'une quantité, c\'est la multiplier par $\\dfrac{t}{100}$.', 'Le prix payé est le prix affiché moins la remise.'];
      } else if (cas === 'hausse') {
        var prod = rng.pick([['du kilogramme de sucre', 500, 900], ['du litre d\'huile', 1000, 2000], ['du kilogramme d\'oignons', 300, 800], ['de la baguette de pain', 150, 300], ['du kilogramme de viande', 3000, 5000]]);
        var P2 = 50 * rng.int(prod[1] / 50, prod[2] / 50), t2 = rng.pick([2, 4, 5, 10, 12, 15, 20, 25]);
        if ((P2 * t2) % 100) P2 = 100 * Math.round(P2 / 100);
        var aug = P2 * t2 / 100, np2 = P2 + aug;
        enonce = 'À ' + rng.pick(VILLES) + ', le prix ' + prod[0] + ' était de $' + T.num(P2) + '$ F CFA. Il augmente de $' + t2 + '$ %. Calculer le nouveau prix.';
        sol = ['Augmentation : $\\dfrac{' + t2 + '}{100} \\times ' + T.num(P2) + ' = ' + T.num(aug) + '$ F CFA.', 'Nouveau prix : $' + T.num(P2) + ' + ' + T.num(aug) + ' = ' + T.num(np2) + '$ F CFA.'];
        questions = [{ label: 'Nouveau prix (F CFA) :', type: 'number', reponse: np2, unite: 'F CFA' }];
        indices = ['Calcule d\'abord le montant de l\'augmentation : $\\dfrac{t}{100} \\times$ prix.', 'Ou multiplie directement le prix par $1 + \\dfrac{t}{100}$.'];
      } else if (cas === 'taux') {
        var N = rng.pick([20, 25, 40, 50, 200, 250, 500]), k = rng.int(Math.ceil(N * 0.15), Math.floor(N * 0.85));
        var pc = rnd(100 * k / N, 4);
        var sit = rng.pick([
          ['Dans un collège de ' + rng.pick(VILLES) + ', sur $' + N + '$ élèves de 5e, $' + k + '$ sont des filles.', 'des élèves de 5e sont des filles'],
          ['Lors d\'un combat de lutte, sur $' + N + '$ spectateurs interrogés, $' + k + '$ soutiennent le champion de Pikine.', 'des spectateurs interrogés soutiennent ce champion'],
          ['Dans un verger de Casamance, sur $' + N + '$ manguiers, $' + k + '$ sont de la variété Kent.', 'des manguiers sont de la variété Kent']
        ]);
        enonce = sit[0] + ' Quel pourcentage ' + sit[1] + ' ?';
        sol = ['Pourcentage : $\\dfrac{' + k + '}{' + N + '} \\times 100 = ' + T.num(pc) + '$.', 'Donc $' + T.num(pc) + '$ % ' + sit[1] + '.'];
        questions = [{ label: 'Pourcentage (%) :', type: 'number', reponse: pc, unite: '%' }];
        indices = ['Le pourcentage est la proportion ramenée à $100$.', 'Calcule $\\dfrac{\\text{partie}}{\\text{total}} \\times 100$.'];
      } else if (cas === 'carte') {
        var n = rng.pick([25000, 50000, 100000, 200000, 250000, 500000, 1000000]);
        var cm = rng.dec(1.5, 18, 1), km = rnd(cm * n / 100000, 6);
        var inverse = rng.bool(0.4);
        var ech = '\\dfrac{1}{' + T.num(n) + '}';
        if (!inverse) {
          enonce = 'Sur une carte routière à l\'échelle $' + ech + '$, la distance entre deux villages de la région de ' + rng.pick(VILLES) + ' est de $' + T.num(cm) + '$ cm. Calculer la distance réelle en km.';
          sol = ['À l\'échelle $' + ech + '$, $1$ cm sur la carte représente $' + T.num(n) + '$ cm dans la réalité.', 'Distance réelle : $' + T.num(cm) + ' \\times ' + T.num(n) + ' = ' + T.num(rnd(cm * n)) + '$ cm.', 'Or $1$ km $= 100\\,000$ cm, donc la distance réelle est $' + T.num(km) + '$ km.'];
          questions = [{ label: 'Distance réelle (km) :', type: 'number', reponse: km, unite: 'km' }];
        } else {
          enonce = 'Deux villages de la région de ' + rng.pick(VILLES) + ' sont distants de $' + T.num(km) + '$ km. Quelle est la distance qui les sépare sur une carte à l\'échelle $' + ech + '$ ? Donner la réponse en cm.';
          sol = ['$' + T.num(km) + '$ km $= ' + T.num(rnd(km * 100000)) + '$ cm.', 'Sur la carte : $\\dfrac{' + T.num(rnd(km * 100000)) + '}{' + T.num(n) + '} = ' + T.num(cm) + '$ cm.'];
          questions = [{ label: 'Distance sur la carte (cm) :', type: 'number', reponse: cm, unite: 'cm' }];
        }
        indices = ['Une échelle $\\dfrac{1}{n}$ signifie : $1$ cm sur la carte représente $n$ cm en réalité.', 'Convertis : $1$ km $= 1\\,000$ m $= 100\\,000$ cm.'];
      } else if (cas === 'plan') {
        var ne = rng.pick([50, 100, 200]), lp = rng.dec(2, ne === 50 ? 16 : 12, 1), lr = rnd(lp * ne / 100, 4);
        enonce = 'Le plan d\'une maison en construction à ' + rng.pick(VILLES) + ' est dessiné à l\'échelle $\\dfrac{1}{' + ne + '}$. Sur le plan, le salon mesure $' + T.num(lp) + '$ cm de long. Calculer sa longueur réelle en mètres.';
        sol = ['Longueur réelle : $' + T.num(lp) + ' \\times ' + ne + ' = ' + T.num(rnd(lp * ne)) + '$ cm.', 'Soit $' + T.num(lr) + '$ m.'];
        questions = [{ label: 'Longueur réelle (m) :', type: 'number', reponse: lr, unite: 'm' }];
        indices = ['Multiplie la longueur sur le plan par $' + ne + '$.', '$1$ m $= 100$ cm.'];
      } else if (cas === 'initial') {
        var t3 = rng.pick([10, 20, 25, 30, 40, 50]), P3 = 1000 * rng.int(5, 60), np3 = rnd(P3 * (100 - t3) / 100);
        enonce = 'Pendant les soldes de Tabaski, ' + p + ' paie une tenue $' + T.num(np3) + '$ F CFA après une remise de $' + t3 + '$ %. Quel était le prix initial de la tenue ?';
        sol = ['Après une remise de $' + t3 + '$ %, on paie $' + (100 - t3) + '$ % du prix initial $P$ : $' + T.num(rnd((100 - t3) / 100)) + ' \\times P = ' + T.num(np3) + '$.', '$P = \\dfrac{' + T.num(np3) + '}{' + T.num(rnd((100 - t3) / 100)) + '} = ' + T.num(P3) + '$ F CFA.'];
        questions = [{ label: 'Prix initial (F CFA) :', type: 'number', reponse: P3, unite: 'F CFA' }];
        indices = ['Le prix payé représente $' + (100 - t3) + '$ % du prix initial.', 'Attention : on ne retrouve pas le prix initial en ajoutant $' + t3 + '$ % au prix payé.'];
      } else {
        var t4 = rng.pick([10, 20, 25, 30, 40, 50]), P4 = 1000 * rng.int(4, 40);
        var h4 = rnd(P4 * (1 + t4 / 100)), f4 = rnd(h4 * (1 - t4 / 100));
        enonce = 'Un commerçant de ' + rng.pick(VILLES) + ' vend un sac de ciment $' + T.num(P4) + '$ F CFA. Il augmente ce prix de $' + t4 + '$ %, puis, le mois suivant, il baisse le nouveau prix de $' + t4 + '$ %. Calculer le prix final, puis comparer au prix de départ.';
        sol = ['Après la hausse : $' + T.num(P4) + ' \\times ' + T.num(rnd(1 + t4 / 100)) + ' = ' + T.num(h4) + '$ F CFA.', 'Après la baisse : $' + T.num(h4) + ' \\times ' + T.num(rnd(1 - t4 / 100)) + ' = ' + T.num(f4) + '$ F CFA.',
          'Le prix final est inférieur au prix de départ : la baisse de $' + t4 + '$ % porte sur un prix plus grand que celui sur lequel portait la hausse.'];
        questions = [{ label: 'Prix final (F CFA) :', type: 'number', reponse: f4, unite: 'F CFA' },
          qcm(rng, 'Par rapport au prix de départ, le prix final est :', { tex: 'inférieur' }, [{ tex: 'égal' }, { tex: 'supérieur' }])];
        indices = ['Augmenter de $t$ %, c\'est multiplier par $1 + \\dfrac{t}{100}$ ; baisser de $t$ %, c\'est multiplier par $1 - \\dfrac{t}{100}$.', 'La baisse s\'applique au nouveau prix, pas au prix de départ.'];
      }
      return { enonce: enonce, questions: questions, indices: indices, solution: sol };
    }
  });

  /* ================================================================== */
  /* 5e — Statistiques                                                   */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-frequences',
    titre: 'Effectifs, fréquences et diagramme circulaire',
    chapitres: ['5e-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var ctx = rng.pick([
        { titre: 'Moyen de transport', mods: ['À pied', 'Car rapide', 'Vélo', 'Taxi-moto'], phrase: 'le moyen de transport utilisé par les élèves d\'un collège de ' + rng.pick(VILLES) + ' pour venir à l\'école', qui: 'élèves' },
        { titre: 'Plat préféré', mods: ['Thiéboudienne', 'Yassa', 'Mafé', 'Soupou kandja'], phrase: 'le plat préféré des élèves de 5e d\'un collège de ' + rng.pick(VILLES), qui: 'élèves' },
        { titre: 'Sport préféré', mods: ['Football', 'Lutte', 'Basket-ball', 'Athlétisme'], phrase: 'le sport préféré des membres d\'une association de jeunes de ' + rng.pick(VILLES), qui: 'membres' },
        { titre: 'Fruit préféré', mods: ['Mangue', 'Orange', 'Papaye', 'Banane'], phrase: 'le fruit préféré des clients d\'un marché de ' + rng.pick(VILLES), qui: 'clients' }
      ]);
      var N = niveau === 1 ? rng.pick([20, 25, 40, 50]) : rng.pick([20, 40, 50, 60, 72, 90]);
      var eff, guard = 0;
      do {
        var c1 = rng.int(2, N - 6), c2 = rng.int(2, N - 6), c3 = rng.int(2, N - 6);
        var cuts = [c1, c2, c3].sort(function (a, b) { return a - b; });
        eff = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], N - cuts[2]];
        guard++;
      } while (guard < 200 && (eff.some(function (e) { return e < 2; }) || EM.util.uniq(eff).length < 4));
      var i = rng.int(0, 3), j = rng.intExcept(0, 3, [i]);
      var sol = [], questions = [], enonce;
      var ligneEff = eff.map(function (e) { return '$' + e + '$'; });
      if (niveau === 1) {
        var fi = rnd(100 * eff[i] / N, 4);
        enonce = 'On a relevé ' + ctx.phrase + '. Les résultats sont donnés dans le tableau ci-dessous.' +
          tableau([[ctx.titre].concat(ctx.mods), ['Effectif'].concat(ligneEff)]) +
          'Calculer l\'effectif total, puis la fréquence (en pourcentage) de la modalité « ' + ctx.mods[i] + ' ».';
        sol.push('Effectif total : $' + eff.join(' + ') + ' = ' + N + '$.');
        sol.push('Fréquence de « ' + ctx.mods[i] + ' » : $\\dfrac{' + eff[i] + '}{' + N + '} = ' + T.num(rnd(eff[i] / N, 6)) + '$, soit $' + T.num(fi) + '$ %.');
        questions = [{ label: 'Effectif total :', type: 'number', reponse: N }, { label: 'Fréquence de « ' + ctx.mods[i] + ' » (%) :', type: 'number', reponse: fi, unite: '%' }];
      } else {
        var ligne = ligneEff.slice();
        ligne[i] = '?';
        var angle = rnd(360 * eff[j] / N, 4);
        enonce = 'On a relevé ' + ctx.phrase + ' : $' + N + '$ ' + ctx.qui + ' ont répondu. Le tableau est incomplet.' +
          tableau([[ctx.titre].concat(ctx.mods), ['Effectif'].concat(ligne)]) +
          'Calculer l\'effectif manquant, puis la mesure de l\'angle du secteur représentant « ' + ctx.mods[j] + ' » dans un diagramme circulaire.';
        var autres = eff.filter(function (e, k) { return k !== i; });
        sol.push('Effectif manquant : $' + N + ' - (' + autres.join(' + ') + ') = ' + N + ' - ' + (N - eff[i]) + ' = ' + eff[i] + '$.');
        sol.push('Fréquence de « ' + ctx.mods[j] + ' » : $\\dfrac{' + eff[j] + '}{' + N + '}' + (EM.ar.isInt(eff[j] * 10000 / N) ? ' = ' + T.num(rnd(eff[j] / N, 6)) : '') + '$.');
        sol.push('Angle : $\\dfrac{' + eff[j] + '}{' + N + '} \\times 360° = ' + T.num(angle) + '°$.');
        questions = [{ label: 'Effectif manquant :', type: 'number', reponse: eff[i] }, { label: 'Angle du secteur « ' + ctx.mods[j] + ' » (en degrés) :', type: 'number', reponse: angle, unite: '°' }];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: niveau === 1
          ? ['L\'effectif total est la somme de tous les effectifs.', 'Fréquence $= \\dfrac{\\text{effectif}}{\\text{effectif total}}$ ; multiplie par $100$ pour avoir un pourcentage.']
          : ['La somme des effectifs est égale à l\'effectif total.', 'Dans un diagramme circulaire, l\'angle est proportionnel à l\'effectif : angle $= \\dfrac{\\text{effectif}}{\\text{total}} \\times 360°$.'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 5e — Repérage et symétrie centrale                                  */
  /* ================================================================== */
  function droiteGraduee(pts) {
    var xs = pts.map(function (p) { return p.x; }).concat([0, 1]);
    var lo = Math.floor(Math.min.apply(null, xs)) - 1, hi = Math.ceil(Math.max.apply(null, xs)) + 1;
    var f = EM.fig.create({ xmin: lo - 0.6, xmax: hi + 0.6, ymin: -1.3, ymax: 1.3, w: 320, h: 80, title: 'Droite graduée' });
    f.vector([lo - 0.4, 0], [hi + 0.4, 0]);
    for (var k = lo; k <= hi; k++) f.seg([k, -0.18], [k, 0.18], { light: true });
    f.label([0, 0], 'O', 's').label([1, 0], 'I', 's');
    pts.forEach(function (p) { f.point([p.x, 0], p.nom, 'n', { accent: true }); });
    return f.svg();
  }
  function repere(L, pts, opt) {
    opt = opt || {};
    var f = EM.fig.create({ xmin: -L, xmax: L, ymin: -L, ymax: L, w: 260, title: 'Repère (O, I, J)' });
    f.axes({ step: 1, labelStep: L > 6 ? 2 : 1 });
    (opt.segs || []).forEach(function (s) { f.seg(s[0], s[1], s[2]); });
    pts.forEach(function (p) { f.point(p.p, p.nom, p.pos || 'ne', p.o); });
    return f.svg();
  }

  EM.gen.register({
    id: '5e-droite-graduee',
    titre: 'Distance et milieu sur une droite graduée',
    chapitres: ['5e-reperage'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var a, b;
      if (niveau === 1) { a = rng.int(-10, 10); b = rng.intExcept(-10, 10, [a, a + 1, a - 1]); }
      else { a = rng.dec(-8, 8, 1); do { b = rng.dec(-8, 8, 1); } while (Math.abs(b - a) < 1); }
      var AB = rnd(Math.abs(b - a)), m = rnd((a + b) / 2), c = rnd(2 * b - a);
      var grand = Math.max(a, b), petit = Math.min(a, b);
      var sol = [
        'La distance est la plus grande abscisse moins la plus petite : $AB = ' + T.num(grand) + ' - ' + T.par(petit) + ' = ' + T.num(AB) + '$.',
        'Le milieu $M$ de $[AB]$ a pour abscisse $\\dfrac{' + T.num(a) + T.signed(b) + '}{2} = \\dfrac{' + T.num(rnd(a + b)) + '}{2} = ' + T.num(m) + '$.'
      ];
      var questions = [{ label: '$AB =$', type: 'number', reponse: AB }, { label: 'Abscisse du milieu $M$ :', type: 'number', reponse: m }];
      var enonce = 'Sur une droite graduée d\'origine O et d\'unité OI, le point $A$ a pour abscisse $' + T.num(a) + '$ et le point $B$ a pour abscisse $' + T.num(b) + '$. Calculer la distance $AB$ et l\'abscisse du milieu $M$ de $[AB]$.';
      if (niveau === 2) {
        enonce += ' Calculer enfin l\'abscisse du point $C$, symétrique de $A$ par rapport à $B$.';
        sol.push('$B$ est le milieu de $[AC]$ : $\\dfrac{' + T.num(a) + ' + c}{2} = ' + T.num(b) + '$, donc $c = 2 \\times ' + T.par(b) + ' - ' + T.par(a) + ' = ' + T.num(c) + '$.');
        questions.push({ label: 'Abscisse de $C$ :', type: 'number', reponse: c });
      }
      return {
        enonce: enonce,
        figure: droiteGraduee([{ x: a, nom: 'A' }, { x: b, nom: 'B' }]),
        questions: questions,
        indices: ['Une distance est toujours positive : soustrais la plus petite abscisse de la plus grande.', 'L\'abscisse du milieu est la moyenne des deux abscisses : $\\dfrac{a + b}{2}$.'],
        solution: sol
      };
    }
  });

  EM.gen.register({
    id: '5e-symetrie-centrale',
    titre: 'Symétrique d\'un point dans un repère',
    chapitres: ['5e-symetrie-centrale', '5e-reperage'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], questions, enonce, fig;
      if (niveau === 1) {
        var x = rng.nz(-5, 5), y = rng.nz(-5, 5);
        fig = repere(6, [{ p: [x, y], nom: 'A', o: { accent: true } }]);
        enonce = 'Le plan est muni d\'un repère orthonormé (O, I, J). Lire les coordonnées du point $A$ sur la figure, puis donner les coordonnées du point $A\'$, symétrique de $A$ par rapport à l\'origine O.';
        sol = ['On lit l\'abscisse sur l\'axe horizontal et l\'ordonnée sur l\'axe vertical : $A(' + T.num(x) + ' \\,;\\, ' + T.num(y) + ')$.',
          'O est le milieu de $[AA\']$ : les coordonnées de $A\'$ sont les opposées de celles de $A$.',
          '$A\'(' + T.num(-x) + ' \\,;\\, ' + T.num(-y) + ')$'];
        questions = [{ label: 'Coordonnées de $A$ :', type: 'tuple', reponse: [x, y] }, { label: 'Coordonnées de $A\'$ :', type: 'tuple', reponse: [-x, -y] }];
      } else {
        var a = rng.int(-2, 2), b = rng.int(-2, 2), xa, ya, xb, yb, guard = 0;
        do {
          xa = rng.int(-4, 4); ya = rng.int(-4, 4); xb = rng.int(-4, 4); yb = rng.int(-4, 4); guard++;
        } while (guard < 200 && ((xa - a) * (yb - b) - (ya - b) * (xb - a) === 0 || (xa === xb && ya === yb)));
        var xa2 = 2 * a - xa, ya2 = 2 * b - ya, xb2 = 2 * a - xb, yb2 = 2 * b - yb;
        fig = repere(9, [{ p: [a, b], nom: 'Ω', pos: 'se' }, { p: [xa, ya], nom: 'A', o: { accent: true } }, { p: [xb, yb], nom: 'B', o: { accent: true } }], { segs: [[[xa, ya], [xb, yb]]] });
        enonce = 'Dans un repère orthonormé (O, I, J), on donne les points $\\Omega(' + T.num(a) + ' \\,;\\, ' + T.num(b) + ')$, $A(' + T.num(xa) + ' \\,;\\, ' + T.num(ya) + ')$ et $B(' + T.num(xb) + ' \\,;\\, ' + T.num(yb) + ')$. On note $A\'$ et $B\'$ les symétriques de $A$ et $B$ par rapport à $\\Omega$.<br>Calculer les coordonnées de $A\'$ et de $B\'$, puis préciser la position des droites $(AB)$ et $(A\'B\')$.';
        sol = ['$\\Omega$ est le milieu de $[AA\']$, donc $x_{A\'} = 2x_\\Omega - x_A$ et $y_{A\'} = 2y_\\Omega - y_A$.',
          '$x_{A\'} = 2 \\times ' + T.par(a) + ' - ' + T.par(xa) + ' = ' + T.num(xa2) + '$ et $y_{A\'} = 2 \\times ' + T.par(b) + ' - ' + T.par(ya) + ' = ' + T.num(ya2) + '$ : $A\'(' + T.num(xa2) + ' \\,;\\, ' + T.num(ya2) + ')$.',
          'De même, $B\'(' + T.num(xb2) + ' \\,;\\, ' + T.num(yb2) + ')$.',
          'Une symétrie centrale transforme une droite en une droite parallèle : $(A\'B\') \\parallel (AB)$, et $A\'B\' = AB$.'];
        questions = [
          { label: 'Coordonnées de $A\'$ :', type: 'tuple', reponse: [xa2, ya2] },
          { label: 'Coordonnées de $B\'$ :', type: 'tuple', reponse: [xb2, yb2] },
          qcm(rng, 'Les droites $(AB)$ et $(A\'B\')$ sont :', { tex: 'parallèles' }, [{ tex: 'perpendiculaires' }, { tex: 'sécantes en $\\Omega$' }, { tex: 'sécantes en $A$' }])
        ];
      }
      return {
        enonce: enonce,
        figure: fig,
        questions: questions,
        indices: ['$A\'$ est le symétrique de $A$ par rapport à un point $\\Omega$ lorsque $\\Omega$ est le milieu de $[AA\']$.', 'Par rapport à l\'origine O, il suffit de prendre les opposés des coordonnées.'],
        solution: sol,
        aide: 'Écris des coordonnées sous la forme (2 ; -3).'
      };
    }
  });

  /* ================================================================== */
  /* 5e — Angles et parallélisme                                         */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-angles-paralleles',
    titre: 'Angles formés par deux parallèles et une sécante',
    chapitres: ['5e-angles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var m;
      do { m = rng.int(35, 145); } while (Math.abs(m - 90) < 8);
      var dx = 1.5 / Math.tan(deg(m)), u = [Math.cos(deg(m)), Math.sin(deg(m))];
      var P = { E: [3 + dx, 3], F: [3 - dx, 0], A: [-0.5, 3], B: [6.5, 3], C: [-0.5, 0], D: [6.5, 0] };
      P.X = [P.E[0] + 1.4 * u[0], P.E[1] + 1.4 * u[1]];
      P.Y = [P.F[0] - 1.4 * u[0], P.F[1] - 1.4 * u[1]];
      var ANG = {
        BEX: m, AEX: 180 - m, AEF: m, BEF: 180 - m,
        DFE: m, CFE: 180 - m, CFY: m, DFY: 180 - m
      };
      var PAIRES = [
        ['BEX', 'DFE', 'correspondants'], ['AEX', 'CFE', 'correspondants'], ['AEF', 'CFY', 'correspondants'], ['BEF', 'DFY', 'correspondants'],
        ['AEF', 'DFE', 'alternes-internes'], ['BEF', 'CFE', 'alternes-internes'],
        ['BEX', 'CFY', 'alternes-externes'], ['AEX', 'DFY', 'alternes-externes'],
        ['BEX', 'AEF', 'opposés par le sommet'], ['AEX', 'BEF', 'opposés par le sommet'], ['DFE', 'CFY', 'opposés par le sommet'], ['CFE', 'DFY', 'opposés par le sommet']
      ];
      function w(n) { return '\\widehat{' + n + '}'; }
      var G, Tg, sol = [], questions = [], rel;
      if (niveau === 1) {
        var pr = rng.pick(PAIRES);
        if (rng.bool()) { G = pr[0]; Tg = pr[1]; } else { G = pr[1]; Tg = pr[0]; }
        rel = pr[2];
        if (rel === 'opposés par le sommet') sol.push('Les angles $' + w(G) + '$ et $' + w(Tg) + '$ sont opposés par le sommet : ils ont la même mesure.');
        else sol.push('Les droites $(AB)$ et $(CD)$ sont parallèles et coupées par la sécante $(XY)$. Les angles $' + w(G) + '$ et $' + w(Tg) + '$ sont ' + rel + ' : ils ont donc la même mesure.');
        sol.push('$' + w(Tg) + ' = ' + texDeg(ANG[G]) + '$');
        questions.push(qcm(rng, 'Les angles $' + w(G) + '$ et $' + w(Tg) + '$ sont :', { tex: rel },
          ['correspondants', 'alternes-internes', 'alternes-externes', 'opposés par le sommet'].filter(function (r) { return r !== rel; }).map(function (r) { return { tex: r }; })));
      } else {
        // angle demandé supplémentaire de l'angle donné, situé à l'autre intersection
        var corr = PAIRES.filter(function (p) { return p[2] === 'correspondants'; });
        var c0 = rng.pick(corr);
        var onE = rng.bool();
        G = onE ? c0[0] : c0[1];
        var I = onE ? c0[1] : c0[0];
        var sommetI = I.charAt(1);
        var cands = Object.keys(ANG).filter(function (k) { return k.charAt(1) === sommetI && ANG[k] !== ANG[I]; });
        Tg = rng.pick(cands);
        sol.push('Les droites $(AB)$ et $(CD)$ sont parallèles et coupées par la sécante $(XY)$. Les angles $' + w(G) + '$ et $' + w(I) + '$ sont correspondants, donc $' + w(I) + ' = ' + texDeg(ANG[G]) + '$.');
        sol.push('Les angles $' + w(I) + '$ et $' + w(Tg) + '$ sont adjacents et leurs côtés non communs forment une droite : ils sont supplémentaires.');
        sol.push('$' + w(Tg) + ' = 180° - ' + texDeg(ANG[G]) + ' = ' + texDeg(ANG[Tg]) + '$');
      }
      questions.push({ label: '$' + w(Tg) + ' =$', type: 'number', reponse: ANG[Tg], unite: '°' });
      var f = EM.fig.fit([P.A, P.B, P.C, P.D, P.X, P.Y], { w: 300, h: 220 });
      f.seg(P.A, P.B).seg(P.C, P.D).seg(P.X, P.Y);
      function arc(n, txt, r, o) { f.angle(P[n.charAt(0)], P[n.charAt(1)], P[n.charAt(2)], txt, { r: r, accent: o }); }
      arc(G, ANG[G] + '°', 20, false);
      arc(Tg, '?', G.charAt(1) === Tg.charAt(1) ? 30 : 20, true);
      f.point(P.A, 'A', 'n').point(P.B, 'B', 'n').point(P.C, 'C', 's').point(P.D, 'D', 's');
      f.point(P.X, 'X', 'n').point(P.Y, 'Y', 's').point(P.E, 'E', 'no').point(P.F, 'F', 'se');
      return {
        enonce: 'Sur la figure, les droites $(AB)$ et $(CD)$ sont parallèles. La sécante $(XY)$ les coupe en $E$ et $F$. On sait que $' + w(G) + ' = ' + texDeg(ANG[G]) + '$.<br>' +
          (niveau === 1 ? 'Préciser la position des angles $' + w(G) + '$ et $' + w(Tg) + '$, puis calculer $' + w(Tg) + '$.' : 'Calculer la mesure de l\'angle $' + w(Tg) + '$ en justifiant.'),
        figure: f.svg(),
        questions: questions,
        indices: ['Deux parallèles coupées par une sécante forment des angles alternes-internes, alternes-externes et correspondants de même mesure.', 'Deux angles adjacents dont les côtés non communs forment une droite sont supplémentaires (somme $180°$).'],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* 5e — Triangles                                                      */
  /* ================================================================== */
  function triangleFig(Bdeg, Cdeg, marks) {
    var pB = [0, 0], pC = [6, 0];
    var t = 6 * Math.sin(deg(Cdeg)) / Math.sin(deg(Bdeg + Cdeg));
    var pA = [t * Math.cos(deg(Bdeg)), t * Math.sin(deg(Bdeg))];
    var f = EM.fig.fit([pA, pB, pC], { w: 280, h: 200 });
    f.poly([pA, pB, pC]);
    var P = { A: pA, B: pB, C: pC };
    marks = marks || {};
    if (marks.droit) f.rightAngle(P[marks.droit[0]], P[marks.droit[1]], P[marks.droit[2]]);
    if (marks.iso) f.ticks(pA, pB, 1).ticks(pA, pC, 1);
    (marks.angles || []).forEach(function (a) {
      var s = a[0], o = s === 'A' ? ['B', 'C'] : s === 'B' ? ['A', 'C'] : ['A', 'B'];
      f.angle(P[o[0]], P[s], P[o[1]], a[1], { r: 20, accent: a[2] });
    });
    f.point(pA, 'A', 'n').point(pB, 'B', 'so').point(pC, 'C', 'se');
    return f.svg();
  }

  EM.gen.register({
    id: '5e-triangle-angles',
    titre: 'Angles d\'un triangle et inégalité triangulaire',
    chapitres: ['5e-triangles'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var cas = niveau === 1 ? rng.pick(['deux', 'isoA', 'isoBase', 'rect']) : rng.pick(['bissectrice', 'double', 'inegalite']);
      var sol = [], questions = [], enonce, fig, ind;
      var hA = '\\widehat{BAC}', hB = '\\widehat{ABC}', hC = '\\widehat{ACB}';
      if (cas === 'deux') {
        var B = rng.int(25, 95), C = rng.int(25, 150 - B), A = 180 - B - C;
        enonce = 'Dans le triangle $ABC$, $' + hB + ' = ' + B + '°$ et $' + hC + ' = ' + C + '°$. Calculer $' + hA + '$.';
        sol = ['La somme des angles d\'un triangle vaut $180°$.', '$' + hA + ' = 180° - ' + B + '° - ' + C + '° = ' + A + '°$'];
        questions = [{ label: '$' + hA + ' =$', type: 'number', reponse: A, unite: '°' }];
        fig = triangleFig(B, C, { angles: [['B', B + '°'], ['C', C + '°'], ['A', '?', true]] });
      } else if (cas === 'isoA') {
        var A2 = 2 * rng.int(15, 70), b2 = (180 - A2) / 2;
        enonce = 'Le triangle $ABC$ est isocèle en $A$ et $' + hA + ' = ' + A2 + '°$. Calculer $' + hB + '$.';
        sol = ['Le triangle est isocèle en $A$, donc ses angles à la base sont égaux : $' + hB + ' = ' + hC + '$.', '$2 \\times ' + hB + ' = 180° - ' + A2 + '° = ' + (180 - A2) + '°$', '$' + hB + ' = ' + T.num(b2) + '°$'];
        questions = [{ label: '$' + hB + ' =$', type: 'number', reponse: b2, unite: '°' }];
        fig = triangleFig(b2, b2, { iso: true, angles: [['A', A2 + '°'], ['B', '?', true]] });
      } else if (cas === 'isoBase') {
        var b3 = rng.int(20, 80), A3 = 180 - 2 * b3;
        enonce = 'Le triangle $ABC$ est isocèle en $A$ et $' + hB + ' = ' + b3 + '°$. Calculer $' + hA + '$.';
        sol = ['Le triangle est isocèle en $A$, donc $' + hC + ' = ' + hB + ' = ' + b3 + '°$.', '$' + hA + ' = 180° - 2 \\times ' + b3 + '° = ' + A3 + '°$'];
        questions = [{ label: '$' + hA + ' =$', type: 'number', reponse: A3, unite: '°' }];
        fig = triangleFig(b3, b3, { iso: true, angles: [['B', b3 + '°'], ['A', '?', true]] });
      } else if (cas === 'rect') {
        var b4 = rng.int(15, 75), c4 = 90 - b4;
        enonce = 'Le triangle $ABC$ est rectangle en $A$ et $' + hB + ' = ' + b4 + '°$. Calculer $' + hC + '$.';
        sol = ['Dans un triangle rectangle, les deux angles aigus sont complémentaires.', '$' + hC + ' = 90° - ' + b4 + '° = ' + c4 + '°$'];
        questions = [{ label: '$' + hC + ' =$', type: 'number', reponse: c4, unite: '°' }];
        fig = triangleFig(b4, c4, { droit: ['B', 'A', 'C'], angles: [['B', b4 + '°'], ['C', '?', true]] });
      } else if (cas === 'bissectrice') {
        var B5 = rng.int(30, 80), C5 = rng.int(30, 140 - B5);
        if ((180 - B5 - C5) % 2) C5 += 1;
        var A5 = 180 - B5 - C5;
        enonce = 'Dans le triangle $ABC$, $' + hB + ' = ' + B5 + '°$ et $' + hC + ' = ' + C5 + '°$. La bissectrice de l\'angle $' + hA + '$ coupe $[BC]$ en $D$. Calculer $' + hA + '$, puis $\\widehat{BAD}$ et $\\widehat{ADB}$.';
        sol = ['$' + hA + ' = 180° - ' + B5 + '° - ' + C5 + '° = ' + A5 + '°$.',
          '$[AD)$ est la bissectrice de $' + hA + '$ : $\\widehat{BAD} = \\dfrac{' + A5 + '°}{2} = ' + A5 / 2 + '°$.',
          'Dans le triangle $ABD$ : $\\widehat{ADB} = 180° - ' + B5 + '° - ' + A5 / 2 + '° = ' + (180 - B5 - A5 / 2) + '°$.'];
        questions = [{ label: '$' + hA + ' =$', type: 'number', reponse: A5, unite: '°' }, { label: '$\\widehat{BAD} =$', type: 'number', reponse: A5 / 2, unite: '°' }, { label: '$\\widehat{ADB} =$', type: 'number', reponse: 180 - B5 - A5 / 2, unite: '°' }];
        fig = triangleFig(B5, C5, { angles: [['B', B5 + '°'], ['C', C5 + '°']] });
      } else if (cas === 'double') {
        var c6 = rng.int(12, 40), A6;
        do { A6 = rng.int(30, 150); } while ((180 - A6) % 3 || 180 - A6 < 36);
        c6 = (180 - A6) / 3;
        var b6 = 2 * c6;
        enonce = 'Dans le triangle $ABC$, $' + hA + ' = ' + A6 + '°$ et l\'angle $' + hB + '$ est le double de l\'angle $' + hC + '$. Calculer $' + hC + '$ et $' + hB + '$.';
        sol = ['On pose $' + hC + ' = c$ ; alors $' + hB + ' = 2c$.', 'Somme des angles : $' + A6 + '° + 2c + c = 180°$, donc $3c = ' + (180 - A6) + '°$.', '$c = ' + c6 + '°$, donc $' + hC + ' = ' + c6 + '°$ et $' + hB + ' = ' + b6 + '°$.'];
        questions = [{ label: '$' + hC + ' =$', type: 'number', reponse: c6, unite: '°' }, { label: '$' + hB + ' =$', type: 'number', reponse: b6, unite: '°' }];
        fig = triangleFig(b6, c6, { angles: [['A', A6 + '°']] });
      } else {
        var a7 = rng.int(3, 9), b7 = rng.int(3, 9), type = rng.pick(['oui', 'non', 'plat']);
        var c7 = type === 'oui' ? rng.int(Math.abs(a7 - b7) + 1, a7 + b7 - 1) : type === 'plat' ? a7 + b7 : a7 + b7 + rng.int(1, 4);
        var cotes = rng.shuffle([a7, b7, c7]);
        var mx = Math.max.apply(null, cotes), autres = cotes.slice().sort(function (x, y) { return x - y; }).slice(0, 2);
        enonce = 'Peut-on construire un triangle dont les côtés mesurent $' + cotes[0] + '$ cm, $' + cotes[1] + '$ cm et $' + cotes[2] + '$ cm ?';
        sol = ['On compare le plus grand côté, $' + mx + '$ cm, à la somme des deux autres : $' + autres[0] + ' + ' + autres[1] + ' = ' + (autres[0] + autres[1]) + '$.'];
        var bon;
        if (type === 'oui') { sol.push('$' + mx + ' < ' + (autres[0] + autres[1]) + '$ : l\'inégalité triangulaire est vérifiée, le triangle est constructible.'); bon = 'Oui, le triangle est constructible'; }
        else if (type === 'plat') { sol.push('$' + mx + ' = ' + (autres[0] + autres[1]) + '$ : les trois points sont alignés, le « triangle » est aplati.'); bon = 'Non, les trois sommets seraient alignés (triangle aplati)'; }
        else { sol.push('$' + mx + ' > ' + (autres[0] + autres[1]) + '$ : l\'inégalité triangulaire n\'est pas vérifiée, le triangle n\'est pas constructible.'); bon = 'Non, le plus grand côté est trop long'; }
        var tous = ['Oui, le triangle est constructible', 'Non, les trois sommets seraient alignés (triangle aplati)', 'Non, le plus grand côté est trop long'];
        questions = [qcm(rng, 'Réponse :', { tex: bon }, tous.filter(function (x) { return x !== bon; }).map(function (x) { return { tex: x }; }))];
      }
      ind = cas === 'inegalite'
        ? ['Inégalité triangulaire : le plus grand côté doit être strictement inférieur à la somme des deux autres.', 'S\'il y a égalité, les trois points sont alignés.']
        : ['La somme des angles d\'un triangle est égale à $180°$.', 'Triangle isocèle : angles à la base égaux. Triangle rectangle : angles aigus complémentaires.'];
      return { enonce: enonce, figure: fig, questions: questions, indices: ind, solution: sol };
    }
  });

  /* ================================================================== */
  /* 5e — Parallélogrammes                                               */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-parallelogramme',
    titre: 'Propriétés du parallélogramme et des quadrilatères particuliers',
    chapitres: ['5e-parallelogrammes'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var cas = niveau === 1 ? rng.pick(['angles', 'diag', 'cotes']) : rng.pick(['nature', 'aire', 'losange', 'rectdiag']);
      var sol = [], questions = [], enonce, fig = null, ind;
      function para(m, ab, ad) {
        var A = [0, 0], B = [ab, 0], D = [ad * Math.cos(deg(m)), ad * Math.sin(deg(m))], C = [B[0] + D[0], B[1] + D[1]];
        var f = EM.fig.fit([A, B, C, D], { w: 280, h: 190 });
        f.poly([A, B, C, D]);
        return { f: f, A: A, B: B, C: C, D: D };
      }
      if (cas === 'angles') {
        var m = rng.int(40, 140);
        if (m === 90) m = 75;
        var g = para(m, 5, 3);
        g.f.angle(g.B, g.A, g.D, m + '°', { r: 20 });
        g.f.point(g.A, 'A', 'so').point(g.B, 'B', 'se').point(g.C, 'C', 'ne').point(g.D, 'D', 'no');
        fig = g.f.svg();
        enonce = '$ABCD$ est un parallélogramme tel que $\\widehat{DAB} = ' + m + '°$. Calculer $\\widehat{ABC}$ et $\\widehat{BCD}$.';
        sol = ['Dans un parallélogramme, deux angles consécutifs sont supplémentaires : $\\widehat{ABC} = 180° - ' + m + '° = ' + (180 - m) + '°$.',
          'Les angles opposés ont la même mesure : $\\widehat{BCD} = \\widehat{DAB} = ' + m + '°$.'];
        questions = [{ label: '$\\widehat{ABC} =$', type: 'number', reponse: 180 - m, unite: '°' }, { label: '$\\widehat{BCD} =$', type: 'number', reponse: m, unite: '°' }];
        ind = ['Deux angles consécutifs d\'un parallélogramme sont supplémentaires.', 'Deux angles opposés ont la même mesure.'];
      } else if (cas === 'diag') {
        var ac = rng.dec(4, 14, 1), od = rng.dec(1.5, 6, 1);
        enonce = '$ABCD$ est un parallélogramme de centre $O$. On donne $AC = ' + T.num(ac) + '$ cm et $OD = ' + T.num(od) + '$ cm. Calculer $OA$ et $BD$.';
        sol = ['Les diagonales d\'un parallélogramme ont le même milieu $O$.', '$OA = \\dfrac{AC}{2} = \\dfrac{' + T.num(ac) + '}{2} = ' + T.num(rnd(ac / 2)) + '$ cm.', '$BD = 2 \\times OD = 2 \\times ' + T.num(od) + ' = ' + T.num(rnd(2 * od)) + '$ cm.'];
        questions = [{ label: '$OA =$', type: 'number', reponse: rnd(ac / 2), unite: 'cm' }, { label: '$BD =$', type: 'number', reponse: rnd(2 * od), unite: 'cm' }];
        ind = ['Les diagonales d\'un parallélogramme se coupent en leur milieu.', '$O$ est le milieu de $[AC]$ et de $[BD]$.'];
      } else if (cas === 'cotes') {
        var ab = rng.dec(3, 12, 1), bc = rng.dec(2, 9, 1);
        enonce = 'Un terrain a la forme d\'un parallélogramme $ABCD$ avec $AB = ' + T.num(ab) + '$ m et $BC = ' + T.num(bc) + '$ m. Calculer $CD$, puis le périmètre du terrain.';
        sol = ['Les côtés opposés d\'un parallélogramme ont la même longueur : $CD = AB = ' + T.num(ab) + '$ m et $AD = BC = ' + T.num(bc) + '$ m.', 'Périmètre : $2 \\times (' + T.num(ab) + ' + ' + T.num(bc) + ') = ' + T.num(rnd(2 * (ab + bc))) + '$ m.'];
        questions = [{ label: '$CD =$', type: 'number', reponse: ab, unite: 'm' }, { label: 'Périmètre :', type: 'number', reponse: rnd(2 * (ab + bc)), unite: 'm' }];
        ind = ['Les côtés opposés d\'un parallélogramme ont la même longueur.', 'Le périmètre est la somme des longueurs des quatre côtés.'];
      } else if (cas === 'nature') {
        var props = rng.pick([
          ['un angle droit', 'rectangle'], ['des diagonales de même longueur', 'rectangle'],
          ['deux côtés consécutifs de même longueur', 'losange'], ['des diagonales perpendiculaires', 'losange'],
          ['des diagonales perpendiculaires et de même longueur', 'carré'], ['un angle droit et deux côtés consécutifs de même longueur', 'carré']
        ]);
        enonce = '$ABCD$ est un parallélogramme qui a ' + props[0] + '. Quelle est la nature précise de $ABCD$ ?';
        var nat = props[1];
        sol = ['Un parallélogramme qui a ' + props[0] + ' est un <b>' + nat + '</b>.',
          nat === 'carré' ? 'En effet, c\'est à la fois un rectangle et un losange.' : nat === 'rectangle' ? 'Rectangle : parallélogramme ayant un angle droit, ou des diagonales de même longueur.' : 'Losange : parallélogramme ayant deux côtés consécutifs égaux, ou des diagonales perpendiculaires.'];
        questions = [qcm(rng, 'Nature de $ABCD$ :', { tex: nat }, ['parallélogramme quelconque', 'rectangle', 'losange', 'carré', 'trapèze'].filter(function (x) { return x !== nat; }).slice(0, 3).map(function (x) { return { tex: x }; }))];
        ind = ['Angle droit ou diagonales de même longueur : rectangle.', 'Côtés consécutifs égaux ou diagonales perpendiculaires : losange. Les deux : carré.'];
      } else if (cas === 'aire') {
        var b = rng.int(20, 150), h = rng.int(10, 80);
        enonce = 'Un champ de mil près de Kaffrine a la forme d\'un parallélogramme de base $' + b + '$ m et de hauteur associée $' + h + '$ m. Calculer son aire en m², puis en hectares ($1$ ha $= 10\\,000$ m²).';
        sol = ['$\\mathcal{A} = b \\times h = ' + b + ' \\times ' + h + ' = ' + T.num(b * h) + '$ m².', 'En hectares : $' + T.num(b * h) + ' \\div 10\\,000 = ' + T.num(rnd(b * h / 10000)) + '$ ha.'];
        questions = [{ label: 'Aire (m²) :', type: 'number', reponse: b * h, unite: 'm²' }, { label: 'Aire (ha) :', type: 'number', reponse: rnd(b * h / 10000) }];
        ind = ['L\'aire d\'un parallélogramme est base × hauteur (et non base × côté oblique).', '$1$ ha $= 10\\,000$ m².'];
      } else if (cas === 'losange') {
        var D = 2 * rng.int(3, 12), d = 2 * rng.int(2, 9), c = rng.dec(4, 15, 1);
        enonce = 'Un losange a des diagonales de $' + D + '$ cm et $' + d + '$ cm. Calculer son aire. Un autre losange a un côté de $' + T.num(c) + '$ cm : calculer son périmètre.';
        sol = ['Aire d\'un losange : $\\dfrac{D \\times d}{2} = \\dfrac{' + D + ' \\times ' + d + '}{2} = ' + D * d / 2 + '$ cm².', 'Les quatre côtés d\'un losange ont la même longueur : périmètre $= 4 \\times ' + T.num(c) + ' = ' + T.num(rnd(4 * c)) + '$ cm.'];
        questions = [{ label: 'Aire (cm²) :', type: 'number', reponse: D * d / 2, unite: 'cm²' }, { label: 'Périmètre (cm) :', type: 'number', reponse: rnd(4 * c), unite: 'cm' }];
        ind = ['Aire d\'un losange : demi-produit des diagonales.', 'Un losange a ses quatre côtés de même longueur.'];
      } else {
        var acr = rng.dec(5, 16, 1);
        enonce = '$ABCD$ est un rectangle de centre $O$ tel que $AC = ' + T.num(acr) + '$ cm. Calculer $BD$ et $OB$.';
        sol = ['Les diagonales d\'un rectangle ont la même longueur : $BD = AC = ' + T.num(acr) + '$ cm.', 'Elles se coupent en leur milieu $O$ : $OB = \\dfrac{BD}{2} = ' + T.num(rnd(acr / 2)) + '$ cm.'];
        questions = [{ label: '$BD =$', type: 'number', reponse: acr, unite: 'cm' }, { label: '$OB =$', type: 'number', reponse: rnd(acr / 2), unite: 'cm' }];
        ind = ['Un rectangle est un parallélogramme : ses diagonales ont le même milieu.', 'De plus, les diagonales d\'un rectangle ont la même longueur.'];
      }
      return { enonce: enonce, figure: fig, questions: questions, indices: ind, solution: sol };
    }
  });

  /* ================================================================== */
  /* 5e — Prisme droit et cylindre                                       */
  /* ================================================================== */
  EM.gen.register({
    id: '5e-prisme-cylindre',
    titre: 'Volume et aire latérale du prisme droit et du cylindre',
    chapitres: ['5e-prisme-cylindre'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var cas = niveau === 1 ? rng.pick(['prismeRect', 'prismeTri', 'cylindre']) : rng.pick(['latPrisme', 'latCyl', 'reservoir', 'hauteur']);
      var sol = [], questions = [], enonce, ind;
      var indPrisme = ['Volume d\'un prisme droit : aire d\'une base × hauteur du prisme.', 'Attention : la base d\'un prisme n\'est pas forcément la face du dessous.'];
      var indCyl = ['Volume d\'un cylindre : $V = \\pi r^2 h$ ; aire latérale : $2\\pi r h$.', 'Utilise le rayon (moitié du diamètre).'];
      if (cas === 'prismeTri') {
        var a = rng.int(3, 12), b = rng.int(3, 12), h = rng.int(5, 25);
        var B = a * b / 2, V = B * h;
        enonce = 'Un prisme droit a pour base un triangle rectangle dont les côtés de l\'angle droit mesurent $' + a + '$ cm et $' + b + '$ cm. La hauteur du prisme est $' + h + '$ cm. Calculer son volume.';
        sol = ['Aire de la base (triangle rectangle) : $\\mathcal{B} = \\dfrac{' + a + ' \\times ' + b + '}{2} = ' + T.num(B) + '$ cm².', 'Volume : $V = \\mathcal{B} \\times h = ' + T.num(B) + ' \\times ' + h + ' = ' + T.num(V) + '$ cm³.'];
        questions = [{ label: 'Volume (cm³) :', type: 'number', reponse: V, unite: 'cm³' }];
        ind = indPrisme;
      } else if (cas === 'prismeRect') {
        var c = rng.int(4, 15), ht = rng.int(3, 12), L = rng.int(10, 40);
        var B2 = c * ht / 2, V2 = B2 * L;
        enonce = 'Une tente de berger a la forme d\'un prisme droit couché : sa base est un triangle de côté $' + c + '$ dm et de hauteur relative à ce côté $' + ht + '$ dm ; la longueur de la tente est $' + L + '$ dm. Calculer le volume de la tente en dm³, puis en m³.';
        sol = ['Aire de la base : $\\mathcal{B} = \\dfrac{' + c + ' \\times ' + ht + '}{2} = ' + T.num(B2) + '$ dm².', 'Volume : $V = ' + T.num(B2) + ' \\times ' + L + ' = ' + T.num(V2) + '$ dm³, soit $' + T.num(rnd(V2 / 1000)) + '$ m³.'];
        questions = [{ label: 'Volume (dm³) :', type: 'number', reponse: V2, unite: 'dm³' }, { label: 'Volume (m³) :', type: 'number', reponse: rnd(V2 / 1000), unite: 'm³' }];
        ind = indPrisme;
      } else if (cas === 'cylindre') {
        var r = rng.int(2, 12), hc = rng.int(3, 30), diam = rng.bool(0.4);
        var Vc = Math.PI * r * r * hc;
        enonce = 'Une boîte de conserve cylindrique a ' + (diam ? 'un diamètre de $' + 2 * r + '$ cm' : 'un rayon de $' + r + '$ cm') + ' et une hauteur de $' + hc + '$ cm. Calculer son volume arrondi au dixième de cm³.';
        sol = [(diam ? 'Le rayon est la moitié du diamètre : $r = ' + r + '$ cm. ' : '') + '$V = \\pi r^2 h = \\pi \\times ' + r + '^2 \\times ' + hc + ' = ' + r * r * hc + '\\pi$ cm³.', '$V \\approx ' + T.num(rnd(Vc, 1)) + '$ cm³.'];
        questions = [{ label: 'Volume (cm³) :', type: 'number', reponse: rnd(Vc, 1), tol: 0.06, unite: 'cm³' }];
        ind = indCyl;
      } else if (cas === 'latPrisme') {
        var tr = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]), hp = rng.int(5, 20);
        var per = tr[0] + tr[1] + tr[2], AL = per * hp, Bt = tr[0] * tr[1] / 2;
        enonce = 'La base d\'un prisme droit est un triangle rectangle dont les côtés mesurent $' + tr[0] + '$ cm, $' + tr[1] + '$ cm et $' + tr[2] + '$ cm (hypoténuse). La hauteur du prisme est $' + hp + '$ cm. Calculer l\'aire latérale, puis l\'aire totale du prisme.';
        sol = ['Périmètre de la base : $' + tr[0] + ' + ' + tr[1] + ' + ' + tr[2] + ' = ' + per + '$ cm.', 'Aire latérale : $\\mathcal{A}_\\ell = ' + per + ' \\times ' + hp + ' = ' + AL + '$ cm².',
          'Aire d\'une base : $\\dfrac{' + tr[0] + ' \\times ' + tr[1] + '}{2} = ' + Bt + '$ cm².', 'Aire totale : $' + AL + ' + 2 \\times ' + Bt + ' = ' + (AL + 2 * Bt) + '$ cm².'];
        questions = [{ label: 'Aire latérale (cm²) :', type: 'number', reponse: AL, unite: 'cm²' }, { label: 'Aire totale (cm²) :', type: 'number', reponse: AL + 2 * Bt, unite: 'cm²' }];
        ind = ['Aire latérale d\'un prisme droit : périmètre de la base × hauteur.', 'Aire totale : aire latérale + aires des deux bases.'];
      } else if (cas === 'latCyl') {
        var r3 = rng.int(2, 10), h3 = rng.int(5, 25), AL3 = 2 * Math.PI * r3 * h3;
        enonce = 'On veut recouvrir de papier la surface latérale d\'un tambour (sabar) cylindrique de rayon $' + r3 + '$ cm et de hauteur $' + h3 + '$ cm. Calculer l\'aire de papier nécessaire, arrondie au cm².';
        sol = ['L\'aire latérale d\'un cylindre est $2\\pi r h$ (c\'est un rectangle de longueur $2\\pi r$ et de largeur $h$).', '$\\mathcal{A}_\\ell = 2 \\times \\pi \\times ' + r3 + ' \\times ' + h3 + ' = ' + 2 * r3 * h3 + '\\pi \\approx ' + T.num(Math.round(AL3)) + '$ cm².'];
        questions = [{ label: 'Aire latérale (cm²) :', type: 'number', reponse: Math.round(AL3), tol: 0.6, unite: 'cm²' }];
        ind = indCyl;
      } else if (cas === 'reservoir') {
        var r4 = rng.pick([0.5, 1, 1.2, 1.5, 2, 2.5]), h4 = rng.pick([1, 1.5, 2, 2.5, 3, 4]), V4 = Math.PI * r4 * r4 * h4;
        var L4 = Math.round(V4 * 1000);
        enonce = 'Le réservoir d\'eau d\'un forage près de ' + rng.pick(VILLES) + ' est un cylindre de rayon $' + T.num(r4) + '$ m et de hauteur $' + T.num(h4) + '$ m. Calculer son volume en m³ (arrondi au millième), puis sa capacité en litres (arrondie au litre).';
        sol = ['$V = \\pi r^2 h = \\pi \\times ' + T.num(r4) + '^2 \\times ' + T.num(h4) + ' = ' + T.num(rnd(r4 * r4 * h4)) + '\\pi \\approx ' + T.num(rnd(V4, 3)) + '$ m³.', 'Comme $1$ m³ $= 1\\,000$ L, la capacité est d\'environ $' + T.num(L4) + '$ L.'];
        questions = [{ label: 'Volume (m³) :', type: 'number', reponse: rnd(V4, 3), tol: 0.0015, unite: 'm³' }, { label: 'Capacité (L) :', type: 'number', reponse: L4, tol: 1, unite: 'L' }];
        ind = indCyl.concat(['$1$ m³ $= 1\\,000$ L.']);
      } else {
        var a5 = rng.int(3, 10), b5 = rng.int(3, 10), h5 = rng.int(4, 20), B5 = a5 * b5 / 2, V5 = B5 * h5;
        enonce = 'Un prisme droit a pour base un triangle rectangle dont les côtés de l\'angle droit mesurent $' + a5 + '$ cm et $' + b5 + '$ cm. Son volume est $' + T.num(V5) + '$ cm³. Calculer sa hauteur.';
        sol = ['Aire de la base : $\\mathcal{B} = \\dfrac{' + a5 + ' \\times ' + b5 + '}{2} = ' + T.num(B5) + '$ cm².', '$V = \\mathcal{B} \\times h$ donc $h = \\dfrac{V}{\\mathcal{B}} = \\dfrac{' + T.num(V5) + '}{' + T.num(B5) + '} = ' + h5 + '$ cm.'];
        questions = [{ label: 'Hauteur (cm) :', type: 'number', reponse: h5, unite: 'cm' }];
        ind = indPrisme;
      }
      return { enonce: enonce, questions: questions, indices: ind, solution: sol };
    }
  });

  /* ================================================================== */
  /* 4e — Nombres rationnels                                             */
  /* ================================================================== */
  /** Somme ou différence de deux rationnels (numérateurs de signe quelconque, dénominateurs > 0). */
  function etapesSommeQ(n1, d1, n2, d2, op, nom) {
    var L = ar.lcm(d1, d2), N1 = n1 * L / d1, N2 = n2 * L / d2, R = op === '+' ? N1 + N2 : N1 - N2;
    var st = [];
    if (d1 !== d2) {
      var parts = [];
      if (L !== d1) parts.push('$' + fr(n1, d1) + ' = ' + fr(N1, L) + '$');
      if (L !== d2) parts.push('$' + fr(n2, d2) + ' = ' + fr(N2, L) + '$');
      st.push('On réduit au même dénominateur $' + L + '$ : ' + parts.join(' et ') + '.');
    }
    st.push('$' + nom + ' = \\dfrac{' + T.num(N1) + ' ' + op + ' ' + T.par(N2) + '}{' + L + '} = ' + fr(R, L) + simpl(R, L) + '$');
    return { steps: st, res: F(R, L) };
  }
  /** Produit de deux rationnels avec règle des signes. */
  function etapesProduitQ(n1, d1, n2, d2, nom) {
    var neg = n1 * n2 < 0, P = n1 * n2, Q = d1 * d2;
    var st = [];
    if (P === 0) { st.push('$' + nom + ' = 0$'); return { steps: st, res: F(0) }; }
    st.push('Règle des signes : le produit est ' + (neg ? 'négatif' : 'positif') + '. $' + nom + ' = ' + (neg ? '-' : '') + '\\dfrac{' + Math.abs(n1) + ' \\times ' + Math.abs(n2) + '}{' + d1 + ' \\times ' + d2 + '} = ' + fr(P, Q) + simpl(P, Q) + '$');
    return { steps: st, res: F(P, Q) };
  }
  /** Écriture « brute » d'une fraction, signe éventuellement au numérateur ou au dénominateur. */
  function frBrut(n, d) { return '\\dfrac{' + T.num(n) + '}{' + T.num(d) + '}'; }

  EM.gen.register({
    id: '4e-rationnels',
    titre: 'Calculer dans ℚ',
    chapitres: ['4e-rationnels'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], res, expr, question = null, e;
      function fq(dmin, dmax, exclD) {
        var n, d, g = 0;
        do { n = rng.nz(-9, 9); d = rng.int(dmin, dmax); g++; } while (g < 100 && (n % d === 0 || d === exclD));
        return [n, d];
      }
      if (niveau === 1) {
        var f1 = fq(2, 9), f2 = fq(2, 12, f1[1]);
        var a = f1[0], b = f1[1], c = f2[0], d = f2[1], op = rng.pick(['+', '-']);
        expr = fr(a, b) + ' ' + op + ' ' + frp(c, d);
        e = etapesSommeQ(a, b, c, d, op, 'A');
        sol = e.steps; res = e.res;
        if (rng.bool(0.3)) {
          var L = ar.lcm(b, d), N1 = a * L / b, N2 = c * L / d, Rf = op === '+' ? N1 - N2 : N1 + N2;
          question = qcm(rng, 'Quelle est la valeur de $A$ ?', { tex: '$' + res.tex() + '$', val: res.value() }, [
            { tex: '$' + F(op === '+' ? a + c : a - c, b + d).tex() + '$', val: (op === '+' ? a + c : a - c) / (b + d) },
            { tex: '$' + F(Rf, L).tex() + '$', val: Rf / L },
            { tex: '$' + res.neg().tex() + '$', val: -res.value() }
          ]);
        }
      } else if (niveau === 2) {
        var g1 = fq(2, 9), g2 = fq(2, 9), a2 = g1[0], b2 = g1[1], c2 = g2[0], d2 = g2[1];
        if (rng.bool(0.6)) {
          // simplification « en croix » possible
          var gg = 0, g = rng.int(2, 4);
          do { a2 = g * rng.nz(-4, 4); d2 = g * rng.int(1, 3); gg++; } while (gg < 100 && (a2 % b2 === 0 || c2 % d2 === 0));
          if (a2 % b2 === 0 || c2 % d2 === 0) { a2 = g1[0]; d2 = g2[1]; }
        }
        var brut = rng.bool(0.4);
        var sec = brut ? (c2 > 0 ? frBrut(-c2, -d2) : rng.pick([frBrut(c2, d2), frBrut(-c2, -d2)])) : frp(c2, d2);
        if (rng.bool()) {
          expr = fr(a2, b2) + ' \\times ' + sec;
          e = etapesProduitQ(a2, b2, c2, d2, 'A');
          sol = (brut ? ['On écrit d\'abord la seconde fraction avec un dénominateur positif : $' + sec + ' = ' + fr(c2, d2) + '$.'] : []).concat(e.steps);
        } else {
          expr = fr(a2, b2) + ' \\div ' + sec;
          e = etapesProduitQ(a2, b2, d2 * Math.sign(c2), Math.abs(c2), 'A');
          sol = (brut ? ['On écrit d\'abord la seconde fraction avec un dénominateur positif : $' + sec + ' = ' + fr(c2, d2) + '$.'] : [])
            .concat(['Diviser par $' + fr(c2, d2) + '$, c\'est multiplier par son inverse $' + fr(d2 * Math.sign(c2), Math.abs(c2)) + '$ : $A = ' + fr(a2, b2) + ' \\times ' + frp(d2 * Math.sign(c2), Math.abs(c2)) + '$.'], e.steps);
        }
        res = e.res;
      } else {
        var tpl = rng.pick(['moinsprod', 'sommediv', 'plusdiv']);
        var h1 = fq(2, 6), h2 = fq(2, 6), h3 = fq(2, 7);
        var p1 = h1[0], q1 = h1[1], p2 = h2[0], q2 = h2[1], p3 = h3[0], q3 = h3[1];
        if (tpl === 'moinsprod') {
          expr = fr(p1, q1) + ' - ' + fr(Math.abs(p2), q2) + ' \\times ' + frp(p3, q3);
          var pr = etapesProduitQ(Math.abs(p2), q2, p3, q3, 'P');
          sol.push('La multiplication est prioritaire : on calcule $P = ' + fr(Math.abs(p2), q2) + ' \\times ' + frp(p3, q3) + '$.');
          sol = sol.concat(pr.steps);
          var P = pr.res;
          e = etapesSommeQ(p1, q1, P.n, P.d, '-', 'A');
          sol.push('$A = ' + fr(p1, q1) + ' - ' + (P.n < 0 ? '\\left(' + P.tex() + '\\right)' : P.tex()) + '$');
          sol = sol.concat(e.steps);
          res = e.res;
        } else if (tpl === 'sommediv') {
          expr = '\\left(' + fr(p1, q1) + ' + ' + frp(p2, q2) + '\\right) \\div ' + frp(p3, q3);
          e = etapesSommeQ(p1, q1, p2, q2, '+', 'S');
          sol.push('On calcule d\'abord la parenthèse $S = ' + fr(p1, q1) + ' + ' + frp(p2, q2) + '$.');
          sol = sol.concat(e.steps);
          var S = e.res;
          sol.push('Diviser par $' + fr(p3, q3) + '$, c\'est multiplier par son inverse $' + fr(q3 * Math.sign(p3), Math.abs(p3)) + '$.');
          var e2 = etapesProduitQ(S.n, S.d, q3 * Math.sign(p3), Math.abs(p3), 'A');
          sol = sol.concat(e2.steps);
          res = e2.res;
        } else {
          expr = fr(p1, q1) + ' + ' + frp(p2, q2) + ' \\div ' + frp(p3, q3);
          sol.push('La division est prioritaire : on calcule $Q = ' + frp(p2, q2) + ' \\div ' + frp(p3, q3) + ' = ' + fr(p2, q2) + ' \\times ' + frp(q3 * Math.sign(p3), Math.abs(p3)) + '$.');
          var e3 = etapesProduitQ(p2, q2, q3 * Math.sign(p3), Math.abs(p3), 'Q');
          sol = sol.concat(e3.steps);
          var Qv = e3.res;
          e = etapesSommeQ(p1, q1, Qv.n, Qv.d, '+', 'A');
          sol = sol.concat(e.steps);
          res = e.res;
        }
      }
      return {
        enonce: 'Calculer et donner le résultat sous forme de fraction irréductible : $$A = ' + expr + '$$',
        questions: [question || { label: '$A =$', type: 'number', reponse: res, reponseTex: res.tex() }],
        indices: ['Respecte les priorités : parenthèses, puis $\\times$ et $\\div$, puis $+$ et $-$.', 'Règle des signes pour $\\times$ et $\\div$ ; même dénominateur pour $+$ et $-$. Simplifie à la fin.'],
        solution: sol,
        aide: 'Écris une fraction avec « / », par exemple -7/12.'
      };
    }
  });

  /* ================================================================== */
  /* 4e — Puissances et écriture scientifique                            */
  /* ================================================================== */
  function pw(base, e) {
    var b = base < 0 ? '\\left(' + T.num(base) + '\\right)' : T.num(base);
    return b + '^{' + T.num(e) + '}';
  }

  EM.gen.register({
    id: '4e-puissances',
    titre: 'Calculer avec les puissances',
    chapitres: ['4e-puissances'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var a = rng.pick([2, 3, 5, 7, 10]);
      var sol = [], questions = [], enonce, ind = ['$a^m \\times a^n = a^{m+n}$, $\\dfrac{a^m}{a^n} = a^{m-n}$ et $(a^m)^n = a^{m \\times n}$.', '$a^{-n} = \\dfrac{1}{a^n}$ et $a^0 = 1$.'];
      function e() { return rng.intExcept(-6, 9, [0, 1]); }
      var cas = niveau === 1 ? rng.pick(['produit', 'quotient', 'puiss', 'valeur', 'valeur']) : rng.pick(['combine', 'combine', 'deuxBases', 'meme']);
      if (cas === 'produit') {
        var m = e(), n = e(), k = m + n;
        enonce = 'Écrire sous la forme d\'une seule puissance de $' + a + '$ : $$A = ' + pw(a, m) + ' \\times ' + pw(a, n) + '$$';
        sol = ['$a^m \\times a^n = a^{m+n}$ : on additionne les exposants.', '$A = ' + a + '^{' + m + T.signed(n) + '} = ' + pw(a, k) + '$'];
        questions = [{ label: '$A = ' + a + '^{k}$ avec $k =$', type: 'number', reponse: k }];
      } else if (cas === 'quotient') {
        var m2 = e(), n2 = e(), k2 = m2 - n2;
        enonce = 'Écrire sous la forme d\'une seule puissance de $' + a + '$ : $$A = \\dfrac{' + pw(a, m2) + '}{' + pw(a, n2) + '}$$';
        sol = ['$\\dfrac{a^m}{a^n} = a^{m-n}$ : on soustrait les exposants.', '$A = ' + a + '^{' + m2 + ' - ' + T.par(n2) + '} = ' + pw(a, k2) + '$'];
        questions = [{ label: '$A = ' + a + '^{k}$ avec $k =$', type: 'number', reponse: k2 }];
      } else if (cas === 'puiss') {
        var m3 = rng.intExcept(-4, 5, [0, 1]), n3 = rng.intExcept(-3, 4, [0, 1]), k3 = m3 * n3;
        enonce = 'Écrire sous la forme d\'une seule puissance de $' + a + '$ : $$A = \\left(' + pw(a, m3) + '\\right)^{' + n3 + '}$$';
        sol = ['$(a^m)^n = a^{m \\times n}$ : on multiplie les exposants.', '$A = ' + a + '^{' + T.num(m3) + ' \\times ' + T.par(n3) + '} = ' + pw(a, k3) + '$'];
        questions = [{ label: '$A = ' + a + '^{k}$ avec $k =$', type: 'number', reponse: k3 }];
      } else if (cas === 'valeur') {
        var t = rng.pick(['negPair', 'negImpair', 'moinsCarre', 'inverse', 'zero', 'fraction']);
        var expr, val, faux = [], expl;
        if (t === 'negPair' || t === 'negImpair') {
          var b = rng.pick([-2, -3, -5, -1]), n4 = t === 'negPair' ? rng.pick([2, 4]) : rng.pick([3, 5]);
          if (b === -5) n4 = t === 'negPair' ? 2 : 3;
          if (b === -3 && n4 === 5) n4 = 3;
          val = Math.pow(b, n4); expr = pw(b, n4);
          expl = 'L\'exposant $' + n4 + '$ est ' + (n4 % 2 ? 'impair : le résultat est négatif.' : 'pair : le résultat est positif.') + ' $' + expr + ' = ' + T.num(val) + '$';
          faux = [-val, b * n4, -b * n4];
        } else if (t === 'moinsCarre') {
          var b2 = rng.int(2, 9);
          val = -b2 * b2; expr = '-' + b2 + '^{2}';
          expl = 'L\'exposant ne porte que sur $' + b2 + '$ : $-' + b2 + '^{2} = -(' + b2 + ' \\times ' + b2 + ') = ' + val + '$.';
          faux = [b2 * b2, -2 * b2, 2 * b2];
        } else if (t === 'inverse') {
          var b3 = rng.pick([2, 3, 4, 5, 10]), n5 = b3 === 10 ? rng.int(1, 4) : b3 >= 4 ? 2 : rng.int(2, 3);
          val = F(1, Math.pow(b3, n5)); expr = b3 + '^{-' + n5 + '}';
          expl = '$a^{-n} = \\dfrac{1}{a^n}$ : $' + expr + ' = \\dfrac{1}{' + b3 + '^{' + n5 + '}} = ' + val.tex() + '$.';
          faux = [F(-Math.pow(b3, n5)), F(-b3 * n5), F(1, b3 * n5)];
        } else if (t === 'zero') {
          var b4 = rng.pick([7, 13, -4, 2021, 0.5]);
          val = 1; expr = (b4 < 0 ? '\\left(' + T.num(b4) + '\\right)' : T.num(b4)) + '^{0}';
          expl = 'Tout nombre non nul élevé à la puissance $0$ vaut $1$.';
          faux = [0, b4, -1];
        } else {
          var p = rng.int(1, 4), q = rng.intExcept(2, 5, [p]), n6 = rng.int(2, 3);
          if (ar.gcd(p, q) !== 1) { p = 1; }
          val = F(Math.pow(p, n6), Math.pow(q, n6)); expr = '\\left(' + fr(p, q) + '\\right)^{' + n6 + '}';
          expl = '$\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}$ : $' + expr + ' = \\dfrac{' + p + '^{' + n6 + '}}{' + q + '^{' + n6 + '}} = ' + val.tex() + '$.';
          faux = [F(p * n6, q * n6), F(Math.pow(p, n6), q), F(p, Math.pow(q, n6))];
        }
        enonce = 'Calculer : $$A = ' + expr + '$$';
        sol = [expl];
        var vt = function (x) { return x instanceof EM.Frac ? x.tex() : T.num(x); };
        var vv = function (x) { return x instanceof EM.Frac ? x.value() : x; };
        if (rng.bool(0.5)) questions = [qcm(rng, 'Valeur de $A$ :', { tex: '$' + vt(val) + '$', val: vv(val) }, faux.map(function (f) { return { tex: '$' + vt(f) + '$', val: vv(f) }; }))];
        else questions = [{ label: '$A =$', type: 'number', reponse: val, reponseTex: vt(val) }];
      } else if (cas === 'combine') {
        var m7 = e(), n7 = rng.intExcept(-3, 4, [0, 1]), p7 = rng.intExcept(-3, 3, [0, 1]), q7 = e();
        var k7 = m7 + n7 * p7 - q7;
        enonce = 'Écrire sous la forme d\'une seule puissance de $' + a + '$ : $$A = \\dfrac{' + pw(a, m7) + ' \\times \\left(' + pw(a, n7) + '\\right)^{' + p7 + '}}{' + pw(a, q7) + '}$$';
        sol = ['$\\left(' + pw(a, n7) + '\\right)^{' + p7 + '} = ' + a + '^{' + T.num(n7) + ' \\times ' + T.par(p7) + '} = ' + pw(a, n7 * p7) + '$.',
          'Numérateur : $' + pw(a, m7) + ' \\times ' + pw(a, n7 * p7) + ' = ' + a + '^{' + m7 + T.signed(n7 * p7) + '} = ' + pw(a, m7 + n7 * p7) + '$.',
          '$A = \\dfrac{' + pw(a, m7 + n7 * p7) + '}{' + pw(a, q7) + '} = ' + a + '^{' + (m7 + n7 * p7) + ' - ' + T.par(q7) + '} = ' + pw(a, k7) + '$'];
        questions = [{ label: '$A = ' + a + '^{k}$ avec $k =$', type: 'number', reponse: k7 }];
      } else if (cas === 'meme') {
        var pair = rng.pick([[2, 5], [4, 25], [2, 3], [3, 5]]), n8 = rng.intExcept(-4, 6, [0, 1]);
        var prod = pair[0] * pair[1];
        enonce = 'Écrire sous la forme d\'une seule puissance de $' + prod + '$ : $$A = ' + pw(pair[0], n8) + ' \\times ' + pw(pair[1], n8) + '$$';
        sol = ['$a^n \\times b^n = (a \\times b)^n$ (même exposant).', '$A = (' + pair[0] + ' \\times ' + pair[1] + ')^{' + n8 + '} = ' + pw(prod, n8) + '$'];
        questions = [{ label: '$A = ' + prod + '^{k}$ avec $k =$', type: 'number', reponse: n8 }];
        ind = ['$a^n \\times b^n = (ab)^n$ : on ne peut regrouper ainsi que si les exposants sont égaux.', 'Ici les deux exposants valent $' + n8 + '$.'];
      } else {
        var x1 = rng.int(1, 6), y1 = rng.int(1, 6), x2 = rng.int(1, 6), y2 = rng.int(1, 6);
        var ex2 = x1 - x2, ey3 = y1 - y2;
        var val2 = F(Math.pow(2, Math.max(ex2, 0)) * Math.pow(3, Math.max(ey3, 0)), Math.pow(2, Math.max(-ex2, 0)) * Math.pow(3, Math.max(-ey3, 0)));
        enonce = 'Calculer et donner le résultat sous forme d\'un entier ou d\'une fraction irréductible : $$A = \\dfrac{' + pw(2, x1) + ' \\times ' + pw(3, y1) + '}{' + pw(2, x2) + ' \\times ' + pw(3, y2) + '}$$';
        sol = ['On regroupe les puissances de même base : $A = \\dfrac{' + pw(2, x1) + '}{' + pw(2, x2) + '} \\times \\dfrac{' + pw(3, y1) + '}{' + pw(3, y2) + '} = ' + pw(2, ex2) + ' \\times ' + pw(3, ey3) + '$.',
          '$A = ' + val2.tex() + '$'];
        questions = [{ label: '$A =$', type: 'number', reponse: val2, reponseTex: val2.tex() }];
      }
      return { enonce: enonce, questions: questions, indices: ind, solution: sol, aide: 'Pour un exposant négatif, écris par exemple -3. Une fraction s\'écrit 1/8.' };
    }
  });

  EM.gen.register({
    id: '4e-ecriture-scientifique',
    titre: 'Écriture scientifique',
    chapitres: ['4e-puissances'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], enonce, M, E;
      if (niveau === 1) {
        var cas = rng.pick(['grand', 'petit', 'nonNorm']);
        M = rng.dec(1.01, 9.99, 2);
        if (cas === 'grand') {
          E = rng.int(3, 8);
          var x = rnd(M * Math.pow(10, E), 6);
          enonce = 'Donner l\'écriture scientifique du nombre $' + T.num(x) + '$.';
          sol = ['On place la virgule après le premier chiffre non nul : $' + T.num(M) + '$.', 'On a déplacé la virgule de $' + E + '$ rangs vers la gauche, donc on multiplie par $10^{' + E + '}$ : $' + T.num(x) + ' = ' + T.num(M) + ' \\times 10^{' + E + '}$.'];
        } else if (cas === 'petit') {
          E = -rng.int(1, 6);
          var y = rnd(M * Math.pow(10, E), 10);
          enonce = 'Donner l\'écriture scientifique du nombre $' + T.num(y, 10) + '$.';
          sol = ['On place la virgule après le premier chiffre non nul : $' + T.num(M) + '$.', 'On a déplacé la virgule de $' + (-E) + '$ rang' + (E < -1 ? 's' : '') + ' vers la droite, donc on multiplie par $10^{' + E + '}$ : $' + T.num(y, 10) + ' = ' + T.num(M) + ' \\times 10^{' + E + '}$.'];
        } else {
          var sh = rng.pick([-2, -1, 1, 2, 3]), p0 = rng.int(-6, 8);
          var m0 = rnd(M * Math.pow(10, sh), 8);
          E = p0 + sh;
          enonce = 'Donner l\'écriture scientifique du nombre $' + T.num(m0) + ' \\times 10^{' + p0 + '}$.';
          sol = ['$' + T.num(m0) + ' = ' + T.num(M) + ' \\times 10^{' + sh + '}$.', 'Donc $' + T.num(m0) + ' \\times 10^{' + p0 + '} = ' + T.num(M) + ' \\times 10^{' + sh + '} \\times 10^{' + p0 + '} = ' + T.num(M) + ' \\times 10^{' + E + '}$.'];
        }
      } else {
        var vals = [1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
        var a = rng.pick(vals), b = rng.pick(vals), c = rng.pick([2, 4, 5, 8, 1.6, 2.5]);
        var m = rng.intExcept(-5, 9, [0]), n = rng.intExcept(-6, 6, [0]), q = rng.intExcept(-5, 6, [0]);
        var M0 = rnd(a * b / c, 10), E0 = m + n - q;
        M = M0; E = E0;
        while (M >= 10) { M = rnd(M / 10, 10); E++; }
        while (M < 1) { M = rnd(M * 10, 10); E--; }
        enonce = 'Donner l\'écriture scientifique de : $$A = \\dfrac{' + T.num(a) + ' \\times 10^{' + m + '} \\times ' + T.num(b) + ' \\times 10^{' + n + '}}{' + T.num(c) + ' \\times 10^{' + q + '}}$$';
        sol = ['On regroupe les décimaux et les puissances de $10$ : $A = \\dfrac{' + T.num(a) + ' \\times ' + T.num(b) + '}{' + T.num(c) + '} \\times \\dfrac{10^{' + m + '} \\times 10^{' + n + '}}{10^{' + q + '}}$.',
          '$\\dfrac{' + T.num(a) + ' \\times ' + T.num(b) + '}{' + T.num(c) + '} = ' + T.num(M0) + '$ et $\\dfrac{10^{' + m + '} \\times 10^{' + n + '}}{10^{' + q + '}} = 10^{' + m + T.signed(n) + ' - ' + T.par(q) + '} = 10^{' + E0 + '}$.',
          '$A = ' + T.num(M0) + ' \\times 10^{' + E0 + '}' + (E !== E0 ? ' = ' + T.num(M) + ' \\times 10^{' + (E - E0) + '} \\times 10^{' + E0 + '} = ' + T.num(M) + ' \\times 10^{' + E + '}' : '') + '$'];
      }
      return {
        enonce: enonce + ' On écrira le résultat sous la forme $a \\times 10^{p}$ avec $1 \\leq a < 10$.',
        questions: [{ label: '$a =$', type: 'number', reponse: M }, { label: '$p =$', type: 'number', reponse: E }],
        indices: ['Dans l\'écriture scientifique $a \\times 10^p$, le nombre $a$ a un seul chiffre non nul avant la virgule.', 'Décaler la virgule d\'un rang vers la gauche augmente l\'exposant de $1$.'],
        solution: sol.concat(['Écriture scientifique : $' + T.num(M) + ' \\times 10^{' + E + '}$.'])
      };
    }
  });

  /* ================================================================== */
  /* 4e — Calcul littéral                                                */
  /* ================================================================== */
  function lin(a, b) { return '(' + T.poly([a, b]) + ')'; }
  /** Étapes de (ax + b)(cx + d). */
  function dblDist(a, b, c, d) {
    var dev = T.mono(a * c, 'x^2', true) + T.mono(a * d, 'x') + T.mono(b * c, 'x') + T.signed(b * d);
    return { tex: dev, coefs: [a * c, a * d + b * c, b * d] };
  }

  EM.gen.register({
    id: '4e-developper',
    titre: 'Développer et réduire (distributivité simple et double)',
    chapitres: ['4e-calcul-litteral'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], expr, R;
      if (niveau === 1) {
        var k = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5]), a = rng.nz(-5, 5), b = rng.nz(-9, 9);
        var m = rng.pick([-6, -5, -4, -3, -2, -1, 2, 3, 4, 5]), c = rng.nz(-5, 5), d = rng.nz(-9, 9);
        var avecX = rng.bool(0.5);
        var f1 = avecX ? (k === 1 ? '' : k === -1 ? '-' : T.num(k)) + 'x' : T.num(k);
        var p1 = avecX ? [k * a, k * b, 0] : [0, k * a, k * b];
        var p2 = [0, m * c, m * d];
        R = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
        expr = f1 + lin(a, b) + (m < 0 ? ' - ' : ' + ') + (Math.abs(m) === 1 ? '' : Math.abs(m)) + lin(c, d);
        sol = ['On distribue : $' + f1 + lin(a, b) + ' = ' + T.poly(p1) + '$ et $' + (m === -1 ? '-' : T.num(m)) + lin(c, d) + ' = ' + T.poly(p2) + '$.',
          '$E = ' + T.poly(p1) + T.mono(p2[1], 'x') + T.signed(p2[2]) + '$',
          '$E = ' + T.poly(R) + '$'];
      } else if (niveau === 2) {
        var a2 = rng.nz(-5, 5), b2 = rng.nz(-9, 9), c2 = rng.nz(-5, 5), d2 = rng.nz(-9, 9);
        var dd = dblDist(a2, b2, c2, d2);
        R = dd.coefs;
        expr = lin(a2, b2) + lin(c2, d2);
        sol = ['Chaque terme de la première parenthèse multiplie chaque terme de la seconde :',
          '$E = ' + T.mono(a2, 'x', true) + ' \\times ' + (c2 < 0 ? '(' + T.mono(c2, 'x', true) + ')' : T.mono(c2, 'x', true)) + ' + ' + T.mono(a2, 'x', true).replace(/^-(.*)$/, '($&)') + ' \\times ' + T.par(d2) + ' + ' + T.par(b2) + ' \\times ' + (c2 < 0 ? '(' + T.mono(c2, 'x', true) + ')' : T.mono(c2, 'x', true)) + ' + ' + T.par(b2) + ' \\times ' + T.par(d2) + '$',
          '$E = ' + dd.tex + '$',
          '$E = ' + T.poly(R) + '$'];
      } else {
        var t = rng.pick(['diff', 'plusk']);
        var a3 = rng.nz(-4, 4), b3 = rng.nz(-7, 7), c3 = rng.nz(-4, 4), d3 = rng.nz(-7, 7);
        var d1 = dblDist(a3, b3, c3, d3);
        if (t === 'diff') {
          var e3 = rng.nz(-4, 4), f3 = rng.nz(-7, 7), g3 = rng.nz(-4, 4), h3 = rng.nz(-7, 7);
          if (a3 * c3 === e3 * g3) g3 = g3 === 4 ? 3 : g3 + 1 === 0 ? 2 : g3 + 1;
          var d2b = dblDist(e3, f3, g3, h3);
          R = [d1.coefs[0] - d2b.coefs[0], d1.coefs[1] - d2b.coefs[1], d1.coefs[2] - d2b.coefs[2]];
          expr = lin(a3, b3) + lin(c3, d3) + ' - ' + lin(e3, f3) + lin(g3, h3);
          sol = ['$' + lin(a3, b3) + lin(c3, d3) + ' = ' + d1.tex + ' = ' + T.poly(d1.coefs) + '$',
            '$' + lin(e3, f3) + lin(g3, h3) + ' = ' + d2b.tex + ' = ' + T.poly(d2b.coefs) + '$',
            'Le second produit est précédé du signe $-$ : on change tous ses signes en supprimant les parenthèses.',
            '$E = ' + T.poly(d1.coefs) + ' - (' + T.poly(d2b.coefs) + ') = ' + T.poly(d1.coefs) + T.sum([{ c: -d2b.coefs[0], v: 'x^2' }, { c: -d2b.coefs[1], v: 'x' }, { c: -d2b.coefs[2] }]).replace(/^(?!-)/, ' + ').replace(/^-/, ' - ') + '$',
            '$E = ' + T.poly(R) + '$'];
        } else {
          var kk = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5]), e4 = rng.nz(-5, 5), f4 = rng.nz(-9, 9);
          var p4 = [0, kk * e4, kk * f4];
          R = [d1.coefs[0], d1.coefs[1] + p4[1], d1.coefs[2] + p4[2]];
          expr = lin(a3, b3) + lin(c3, d3) + (kk < 0 ? ' - ' + (-kk) : ' + ' + kk) + lin(e4, f4);
          sol = ['$' + lin(a3, b3) + lin(c3, d3) + ' = ' + d1.tex + ' = ' + T.poly(d1.coefs) + '$',
            '$' + T.num(kk) + lin(e4, f4) + ' = ' + T.poly(p4) + '$',
            '$E = ' + T.poly(d1.coefs) + T.mono(p4[1], 'x') + T.signed(p4[2]) + '$',
            '$E = ' + T.poly(R) + '$'];
        }
      }
      return {
        enonce: 'Développer et réduire : $$E = ' + expr + '$$',
        questions: [{ label: '$E =$', type: 'expr', reponse: polyStr(R), reponseTex: T.poly(R) }],
        indices: ['$k(a + b) = ka + kb$ et $(a + b)(c + d) = ac + ad + bc + bd$.', 'Attention aux signes, puis regroupe les termes en $x^2$, en $x$ et les constantes.'],
        solution: sol,
        aide: 'Écris le résultat réduit, par exemple 6x^2 - 7x + 2 (x² s\'écrit x^2).'
      };
    }
  });

  EM.gen.register({
    id: '4e-factoriser',
    titre: 'Factoriser avec un facteur commun',
    chapitres: ['4e-calcul-litteral'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], enonce, rep, debut;
      if (niveau === 1) {
        var k = rng.int(2, 9), a, b, g = 0;
        do { a = rng.nz(-9, 9); b = rng.nz(-9, 9); g++; } while (g < 100 && (ar.gcd(a, b) !== 1 || a < 0));
        var avecX = rng.bool(0.5);
        var coefs = avecX ? [k * a, k * b, 0] : [k * a, k * b];
        var fac = avecX ? k + 'x' : String(k);
        debut = fac;
        enonce = 'Factoriser l\'expression $E = ' + T.poly(coefs) + '$ en complétant : $E = ' + fac + '(\\ldots)$.';
        sol = ['Chaque terme contient le facteur $' + fac + '$ : $' + T.mono(k * a, avecX ? 'x^2' : 'x', true) + ' = ' + fac + ' \\times ' + (avecX ? (a === 1 ? 'x' : a + 'x') : (a === 1 ? 'x' : a + 'x')) + '$ et $' + T.signed(k * b, true) + (avecX ? 'x' : '') + ' = ' + fac + ' \\times ' + T.par(b) + '$.',
          '$E = ' + fac + lin(a, b) + '$'];
        rep = [a, b];
      } else {
        var a2 = rng.nz(-4, 4), b2 = rng.nz(-9, 9);
        if (a2 < 0) { a2 = -a2; }
        var t = rng.pick(['plus', 'moins', 'seul']);
        var c = rng.nz(-5, 5), d = rng.nz(-9, 9), e = rng.nz(-5, 5), f = rng.nz(-9, 9);
        var F1 = lin(a2, b2);
        if (t === 'plus') {
          if (c + e === 0) e = e + 1 === 0 ? 2 : e + 1;
          rep = [c + e, d + f];
          enonce = 'Factoriser $E = ' + F1 + lin(c, d) + ' + ' + F1 + lin(e, f) + '$ en complétant : $E = ' + F1 + '(\\ldots)$.';
          sol = ['Le facteur commun est $' + F1 + '$.', '$E = ' + F1 + '\\left[' + lin(c, d) + ' + ' + lin(e, f) + '\\right] = ' + F1 + '\\left[' + T.poly([c, d]) + T.mono(e, 'x') + T.signed(f) + '\\right]$', '$E = ' + F1 + lin(rep[0], rep[1]) + '$'];
        } else if (t === 'moins') {
          if (c - e === 0) e = e + 1 === 0 ? 2 : e + 1;
          rep = [c - e, d - f];
          var ordre = rng.bool();
          enonce = 'Factoriser $E = ' + (ordre ? lin(c, d) + F1 : F1 + lin(c, d)) + ' - ' + F1 + lin(e, f) + '$ en complétant : $E = ' + F1 + '(\\ldots)$.';
          sol = ['Le facteur commun est $' + F1 + '$.', '$E = ' + F1 + '\\left[' + lin(c, d) + ' - ' + lin(e, f) + '\\right] = ' + F1 + '\\left[' + T.poly([c, d]) + T.mono(-e, 'x') + T.signed(-f) + '\\right]$', 'Attention au signe $-$ devant la seconde parenthèse : tous ses signes changent.', '$E = ' + F1 + lin(rep[0], rep[1]) + '$'];
        } else {
          var sg = rng.pick([1, -1]);
          if (c === 0) c = 1;
          if (d + sg === 0) d = d + 2;
          rep = [c, d + sg];
          enonce = 'Factoriser $E = ' + F1 + lin(c, d) + (sg > 0 ? ' + ' : ' - ') + F1 + '$ en complétant : $E = ' + F1 + '(\\ldots)$.';
          sol = ['Le facteur commun est $' + F1 + '$ ; on écrit $' + F1 + ' = ' + F1 + ' \\times 1$.', '$E = ' + F1 + '\\left[' + lin(c, d) + (sg > 0 ? ' + 1' : ' - 1') + '\\right]$', '$E = ' + F1 + lin(rep[0], rep[1]) + '$', 'Piège classique : il ne faut pas oublier le $' + (sg > 0 ? '+ 1' : '- 1') + '$.'];
        }
        debut = F1;
      }
      return {
        enonce: enonce,
        questions: [{ label: 'Expression entre parenthèses : $E = ' + debut + '(\\ldots)$ avec $\\ldots =$', type: 'expr', reponse: polyStr(rep), reponseTex: T.poly(rep) }],
        indices: ['Repère le facteur commun à tous les termes et écris-le devant une parenthèse (ou un crochet).', 'Dans le crochet, écris ce qui reste de chaque terme, puis réduis. Vérifie en développant.'],
        solution: sol,
        aide: 'Écris seulement le contenu de la parenthèse, réduit, par exemple 3x - 2.'
      };
    }
  });

  /* ================================================================== */
  /* 4e — Équations et inéquations                                       */
  /* ================================================================== */
  EM.gen.register({
    id: '4e-equation',
    titre: 'Résoudre une équation du premier degré',
    chapitres: ['4e-equations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], enonce, questions, ind = ['Regroupe les termes en $x$ dans un membre et les nombres dans l\'autre.', 'Divise enfin par le coefficient de $x$ (non nul).'];
      var aide = 'Écris la solution, par exemple -5/2. S\'il y en a plusieurs, sépare-les par « ; ».';
      if (niveau === 1) {
        var a = rng.pick([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]), b = rng.nz(-15, 15), c = rng.int(-20, 20);
        var x = F(c - b, a);
        enonce = 'Résoudre dans $\\Q$ l\'équation : $$' + T.poly([a, b]) + ' = ' + T.num(c) + '$$';
        sol = ['On isole le terme en $x$ : $' + T.mono(a, 'x', true) + ' = ' + T.num(c) + T.signed(-b) + '$, soit $' + T.mono(a, 'x', true) + ' = ' + T.num(c - b) + '$.',
          'On divise par $' + T.num(a) + '$ : $x = ' + frBrut(c - b, a) + (frBrut(c - b, a) !== x.tex() ? ' = ' + x.tex() : '') + '$.',
          '$S = ' + T.set([x.tex()]) + '$'];
        questions = [{ label: '$S =$', type: 'set', reponse: [x], reponseTex: T.set([x.tex()]) }];
      } else if (niveau === 2) {
        var a2 = rng.nz(-9, 9), c2 = rng.intExcept(-9, 9, [a2, 0]), b2 = rng.int(-15, 15), d2 = rng.int(-15, 15);
        var par = rng.bool(0.4), k = rng.pick([-3, -2, 2, 3, 4, 5]), lhs, A = a2, B = b2;
        if (par) {
          var u = rng.nz(-4, 4), v = rng.nz(-6, 6);
          A = k * u; B = k * v;
          if (A === c2) c2 = c2 + 1 === 0 ? 2 : c2 + 1;
          lhs = T.num(k) + lin(u, v);
          sol.push('On développe le membre de gauche : $' + lhs + ' = ' + T.poly([A, B]) + '$.');
        } else lhs = T.poly([a2, b2]);
        var x2 = F(d2 - B, A - c2);
        enonce = 'Résoudre dans $\\Q$ l\'équation : $$' + lhs + ' = ' + T.poly([c2, d2]) + '$$';
        sol.push('On regroupe les termes en $x$ à gauche et les nombres à droite : $' + T.mono(A, 'x', true) + T.mono(-c2, 'x') + ' = ' + T.num(d2) + T.signed(-B) + '$.');
        sol.push('$' + T.mono(A - c2, 'x', true) + ' = ' + T.num(d2 - B) + '$');
        if (A - c2 !== 1) sol.push('On divise par $' + T.num(A - c2) + '$ : $x = ' + frBrut(d2 - B, A - c2) + (frBrut(d2 - B, A - c2) !== x2.tex() ? ' = ' + x2.tex() : '') + '$.');
        sol.push('$S = ' + T.set([x2.tex()]) + '$');
        questions = [{ label: '$S =$', type: 'set', reponse: [x2], reponseTex: T.set([x2.tex()]) }];
      } else if (rng.bool(0.5)) {
        var a3 = rng.nz(-5, 5), b3 = rng.nz(-9, 9), c3 = rng.nz(-5, 5), d3 = rng.nz(-9, 9);
        var r1 = F(-b3, a3), r2 = F(-d3, c3);
        if (r1.equals(r2)) { d3 = d3 + 1 === 0 ? 2 : d3 + 1; r2 = F(-d3, c3); }
        enonce = 'Résoudre dans $\\Q$ l\'équation : $$' + lin(a3, b3) + lin(c3, d3) + ' = 0$$';
        sol = ['Un produit de facteurs est nul si et seulement si l\'un au moins de ses facteurs est nul.',
          '$' + T.poly([a3, b3]) + ' = 0$ ou $' + T.poly([c3, d3]) + ' = 0$',
          '$' + T.mono(a3, 'x', true) + ' = ' + T.num(-b3) + '$ ou $' + T.mono(c3, 'x', true) + ' = ' + T.num(-d3) + '$',
          '$x = ' + r1.tex() + '$ ou $x = ' + r2.tex() + '$',
          '$S = ' + T.set(r1.cmp(r2) < 0 ? [r1.tex(), r2.tex()] : [r2.tex(), r1.tex()]) + '$'];
        questions = [{ label: '$S =$', type: 'set', reponse: [r1, r2], reponseTex: T.set(r1.cmp(r2) < 0 ? [r1.tex(), r2.tex()] : [r2.tex(), r1.tex()]) }];
        ind = ['Un produit est nul si et seulement si l\'un de ses facteurs est nul.', 'Résous séparément les deux équations du premier degré.'];
      } else {
        var t = rng.pick(['partage', 'rectangle', 'tickets']), x4, nom = rng.pick(PRENOMS), nom2 = rng.pick(PRENOMS.filter(function (p) { return p !== nom; }));
        if (t === 'partage') {
          x4 = 500 * rng.int(4, 40); var D = 500 * rng.int(1, 12), S4 = 2 * x4 + D;
          enonce = nom + ' et ' + nom2 + ' ont ensemble $' + T.num(S4) + '$ F CFA. ' + nom + ' a $' + T.num(D) + '$ F CFA de plus ' + que(nom2) + '. Calculer, à l\'aide d\'une équation, la somme que possède ' + nom2 + '.';
          sol = ['Soit $x$ la somme ' + de(nom2) + ' en F CFA ; ' + nom + ' possède $x + ' + T.num(D) + '$.', 'Équation : $x + x + ' + T.num(D) + ' = ' + T.num(S4) + '$, soit $2x = ' + T.num(S4 - D) + '$.', '$x = ' + T.num(x4) + '$ : ' + nom2 + ' possède $' + T.num(x4) + '$ F CFA (et ' + nom + ' $' + T.num(x4 + D) + '$ F CFA).'];
          questions = [{ label: 'Somme ' + de(nom2) + ' (F CFA) :', type: 'number', reponse: x4, unite: 'F CFA' }];
        } else if (t === 'rectangle') {
          x4 = rng.int(8, 60); var D2 = rng.int(3, 25), P = 2 * (2 * x4 + D2);
          enonce = 'Un jardin maraîcher rectangulaire des Niayes a un périmètre de $' + P + '$ m. Sa longueur dépasse sa largeur de $' + D2 + '$ m. Calculer sa largeur à l\'aide d\'une équation.';
          sol = ['Soit $x$ la largeur en mètres ; la longueur vaut $x + ' + D2 + '$.', 'Périmètre : $2(x + x + ' + D2 + ') = ' + P + '$, soit $4x + ' + 2 * D2 + ' = ' + P + '$.', '$4x = ' + (P - 2 * D2) + '$, donc $x = ' + x4 + '$ : la largeur est $' + x4 + '$ m (et la longueur $' + (x4 + D2) + '$ m).'];
          questions = [{ label: 'Largeur (m) :', type: 'number', reponse: x4, unite: 'm' }];
        } else {
          x4 = 50 * rng.int(2, 10); var D3 = 50 * rng.int(1, 6), na = rng.int(2, 5), ne = rng.int(1, 5), Tt = na * (x4 + D3) + ne * x4;
          enonce = 'Dans un car interurbain, le ticket adulte coûte $' + T.num(D3) + '$ F CFA de plus que le ticket enfant. ' + nom + ' paie $' + T.num(Tt) + '$ F CFA pour $' + na + '$ adultes et $' + ne + '$ enfant' + (ne > 1 ? 's' : '') + '. Calculer le prix du ticket enfant à l\'aide d\'une équation.';
          sol = ['Soit $x$ le prix du ticket enfant ; le ticket adulte coûte $x + ' + T.num(D3) + '$.', 'Équation : $' + na + '(x + ' + T.num(D3) + ')' + ' + ' + (ne === 1 ? '' : ne) + 'x = ' + T.num(Tt) + '$, soit $' + (na + ne) + 'x + ' + T.num(na * D3) + ' = ' + T.num(Tt) + '$.', '$' + (na + ne) + 'x = ' + T.num(Tt - na * D3) + '$, donc $x = ' + T.num(x4) + '$ F CFA.'];
          questions = [{ label: 'Prix du ticket enfant (F CFA) :', type: 'number', reponse: x4, unite: 'F CFA' }];
        }
        ind = ['Choisis l\'inconnue $x$ et exprime les autres quantités en fonction de $x$.', 'Écris l\'équation qui traduit l\'énoncé, résous-la, puis réponds par une phrase.'];
        aide = 'Donne la valeur numérique.';
      }
      return { enonce: enonce, questions: questions, indices: ind, solution: sol, aide: aide };
    }
  });

  EM.gen.register({
    id: '4e-inequation',
    titre: 'Résoudre une inéquation du premier degré',
    chapitres: ['4e-equations'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sg = rng.pick(['<', '\\leq', '>', '\\geq']);
      var inv = { '<': '>', '>': '<', '\\leq': '\\geq', '\\geq': '\\leq' };
      var sol = [], A, B, lhs, rhs;
      if (niveau === 1) {
        var a = rng.pick([-6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6]), b = rng.int(-12, 12), c = rng.int(-12, 12);
        lhs = T.poly([a, b]); rhs = T.num(c);
        A = a; B = c - b;
        if (b !== 0) sol.push('On ' + (b > 0 ? 'soustrait' : 'ajoute') + ' $' + T.num(Math.abs(b)) + '$ aux deux membres : $' + T.mono(a, 'x', true) + ' ' + sg + ' ' + T.num(c) + T.signed(-b) + '$, soit $' + T.mono(a, 'x', true) + ' ' + sg + ' ' + T.num(B) + '$.');
      } else {
        var a2 = rng.nz(-7, 7), c2 = rng.intExcept(-7, 7, [a2]), b2 = rng.int(-12, 12), d2 = rng.int(-12, 12);
        lhs = T.poly([a2, b2]); rhs = T.poly([c2, d2]);
        A = a2 - c2; B = d2 - b2;
        sol.push('On regroupe les termes en $x$ à gauche et les nombres à droite : $' + T.mono(a2, 'x', true) + T.mono(-c2, 'x') + ' ' + sg + ' ' + T.num(d2) + T.signed(-b2) + '$, soit $' + T.mono(A, 'x', true) + ' ' + sg + ' ' + T.num(B) + '$.');
      }
      var bound = F(B, A), fin = A > 0 ? sg : inv[sg];
      if (A > 0) { if (A !== 1) sol.push('On divise par $' + T.num(A) + '$, qui est positif : le sens de l\'inégalité ne change pas. $x ' + fin + ' ' + bound.tex() + '$'); }
      else sol.push('On divise par $' + T.num(A) + '$, qui est <b>négatif</b> : on change le sens de l\'inégalité. $x ' + fin + ' ' + bound.tex() + '$');
      var strict = fin === '<' || fin === '>';
      var rep = (fin === '<' || fin === '\\leq') ? { a: -Infinity, b: bound, ouvB: strict } : { a: bound, b: Infinity, ouvA: strict };
      var itv = T.interval(rep.a, rep.b, rep.ouvA, rep.ouvB);
      sol.push('Ensemble des solutions : $S = ' + itv + '$ (borne ' + (strict ? 'exclue' : 'incluse') + ').');
      return {
        enonce: 'Résoudre l\'inéquation suivante et donner l\'ensemble des solutions sous forme d\'intervalle : $$' + lhs + ' ' + sg + ' ' + rhs + '$$',
        questions: [{ label: '$S =$', type: 'interval', reponse: rep, reponseTex: itv }],
        indices: ['On résout comme une équation, en gardant le symbole d\'inégalité.', 'Si tu multiplies ou divises par un nombre négatif, change le sens de l\'inégalité.'],
        solution: sol,
        aide: 'Écris un intervalle comme ]-inf ; 3] ou [5/2 ; +inf[.'
      };
    }
  });

  /* ================================================================== */
  /* 4e — Applications linéaires                                         */
  /* ================================================================== */
  EM.gen.register({
    id: '4e-application-lineaire',
    titre: 'Application linéaire : coefficient, image, antécédent',
    chapitres: ['4e-applications-lineaires', '5e-proportionnalite'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], questions, enonce;
      if (niveau === 1) {
        var a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5, 1.5, 2.5, -1.5, 0.5]);
        var x0 = rng.nz(-9, 9), t = rng.nz(-8, 8) * (a % 1 ? 2 : 1), y1 = rnd(a * t);
        var y0 = rnd(a * x0);
        enonce = 'Soit $f$ l\'application linéaire définie par $f(x) = ' + T.num(a) + 'x$. Calculer l\'image de $' + T.num(x0) + '$ par $f$, puis l\'antécédent de $' + T.num(y1) + '$.';
        sol = ['Image : $f(' + T.num(x0) + ') = ' + T.num(a) + ' \\times ' + T.par(x0) + ' = ' + T.num(y0) + '$.',
          'Antécédent : on résout $' + T.num(a) + 'x = ' + T.num(y1) + '$, d\'où $x = \\dfrac{' + T.num(y1) + '}{' + T.num(a) + '} = ' + T.num(t) + '$.'];
        questions = [{ label: '$f(' + T.num(x0) + ') =$', type: 'number', reponse: y0 }, { label: 'Antécédent de $' + T.num(y1) + '$ :', type: 'number', reponse: t }];
      } else if (rng.bool(0.6)) {
        var p = rng.nz(-7, 7), q = rng.pick([1, 2, 3, 4, 5]);
        if (q > 1 && ar.gcd(p, q) !== 1) q = 1;
        if (q === 1 && Math.abs(p) === 1) p = p * 3;
        var A = F(p, q), xx = q * rng.pick([-4, -3, -2, 2, 3, 4]), yy = A.mul(xx);
        var x1 = q * rng.nz(-5, 5), im = A.mul(x1);
        var y2 = p * rng.nz(-5, 5), ant = F(y2).div(A);
        enonce = '$f$ est une application linéaire telle que $f(' + T.num(xx) + ') = ' + yy.tex() + '$. Déterminer le coefficient $a$ de $f$, puis l\'image de $' + T.num(x1) + '$ et l\'antécédent de $' + T.num(y2) + '$.';
        sol = ['$f(x) = ax$ et $f(' + T.num(xx) + ') = ' + yy.tex() + '$, donc $a = \\dfrac{' + yy.tex() + '}{' + T.num(xx) + '} = ' + A.tex() + '$ : $f(x) = ' + T.mono(A, 'x', true) + '$.',
          '$f(' + T.num(x1) + ') = ' + A.tex() + ' \\times ' + T.par(x1) + ' = ' + im.tex() + '$.',
          'Antécédent de $' + T.num(y2) + '$ : $' + T.mono(A, 'x', true) + ' = ' + T.num(y2) + '$ donne $x = ' + T.num(y2) + ' \\div ' + (A.n < 0 ? '\\left(' + A.tex() + '\\right)' : A.tex()) + ' = ' + ant.tex() + '$.'];
        questions = [
          { label: '$a =$', type: 'number', reponse: A, reponseTex: A.tex() },
          { label: '$f(' + T.num(x1) + ') =$', type: 'number', reponse: im, reponseTex: im.tex() },
          { label: 'Antécédent de $' + T.num(y2) + '$ :', type: 'number', reponse: ant, reponseTex: ant.tex() }
        ];
      } else {
        var tx = rng.pick([5, 10, 12, 15, 20, 25]), hausse = rng.bool();
        var coef = rnd(hausse ? 1 + tx / 100 : 1 - tx / 100);
        var P = 1000 * rng.int(2, 30), NP = rnd(coef * P), Q = 1000 * rng.int(2, 30), Qy = rnd(coef * Q);
        enonce = 'Un commerçant du marché ' + rng.pick(['Sandaga', 'Tilène', 'Kermel']) + ' ' + (hausse ? 'augmente' : 'baisse') + ' tous ses prix de $' + tx + '$ %. On note $f(x)$ le nouveau prix d\'un article qui coûtait $x$ F CFA.<br>Déterminer le coefficient de l\'application linéaire $f$, le nouveau prix d\'un article qui coûtait $' + T.num(P) + '$ F CFA, puis l\'ancien prix d\'un article qui coûte maintenant $' + T.num(Qy) + '$ F CFA.';
        sol = ['$f(x) = x ' + (hausse ? '+' : '-') + ' \\dfrac{' + tx + '}{100}x = ' + T.num(coef) + 'x$ : $f$ est l\'application linéaire de coefficient $' + T.num(coef) + '$.',
          '$f(' + T.num(P) + ') = ' + T.num(coef) + ' \\times ' + T.num(P) + ' = ' + T.num(NP) + '$ F CFA.',
          'On cherche l\'antécédent de $' + T.num(Qy) + '$ : $' + T.num(coef) + 'x = ' + T.num(Qy) + '$, donc $x = \\dfrac{' + T.num(Qy) + '}{' + T.num(coef) + '} = ' + T.num(Q) + '$ F CFA.'];
        questions = [{ label: 'Coefficient :', type: 'number', reponse: coef }, { label: 'Nouveau prix (F CFA) :', type: 'number', reponse: NP, unite: 'F CFA' }, { label: 'Ancien prix (F CFA) :', type: 'number', reponse: Q, unite: 'F CFA' }];
      }
      return {
        enonce: enonce,
        questions: questions,
        indices: ['Une application linéaire s\'écrit $f(x) = ax$ ; si $f(x_0) = y_0$ avec $x_0 \\neq 0$, alors $a = \\dfrac{y_0}{x_0}$.', 'Image : on multiplie par $a$. Antécédent : on divise par $a$.'],
        solution: sol,
        aide: 'Tu peux écrire une fraction avec « / », par exemple -3/2.'
      };
    }
  });

  /* ================================================================== */
  /* 4e — Statistiques                                                   */
  /* ================================================================== */
  EM.gen.register({
    id: '4e-moyenne',
    titre: 'Moyenne pondérée et moyenne d\'une série en classes',
    chapitres: ['4e-statistiques', '5e-statistiques'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var sol = [], questions, enonce, ind;
      if (niveau === 1) {
        var cas = rng.pick(['notes', 'serie', 'manquante']);
        if (cas === 'notes') {
          var mat = rng.sample([['Mathématiques', 4], ['Français', 3], ['Anglais', 2], ['Sciences physiques', 2], ['SVT', 2], ['Histoire-Géographie', 2], ['EPS', 1]], rng.int(3, 4));
          var nom = rng.pick(PRENOMS), notes = mat.map(function () { return rng.int(5, 18) + (rng.bool(0.3) ? 0.5 : 0); });
          var sp = 0, sc = 0;
          mat.forEach(function (m, i) { sp += m[1] * notes[i]; sc += m[1]; });
          sp = rnd(sp);
          var moy = rnd(sp / sc, 2), exact = ar.isInt(sp * 100 / sc);
          enonce = 'Voici les notes ' + de(nom) + ' au premier trimestre, avec les coefficients :' +
            tableau([['Matière'].concat(mat.map(function (m) { return m[0]; })), ['Note'].concat(notes.map(function (n) { return '$' + T.num(n) + '$'; })), ['Coefficient'].concat(mat.map(function (m) { return '$' + m[1] + '$'; }))]) +
            'Calculer sa moyenne' + (exact ? '.' : ', arrondie au centième.');
          sol = ['Somme des notes pondérées : $' + mat.map(function (m, i) { return T.num(notes[i]) + ' \\times ' + m[1]; }).join(' + ') + ' = ' + T.num(sp) + '$.',
            'Somme des coefficients : $' + mat.map(function (m) { return m[1]; }).join(' + ') + ' = ' + sc + '$.',
            'Moyenne : $\\dfrac{' + T.num(sp) + '}{' + sc + '} ' + (exact ? '= ' : '\\approx ') + T.num(moy) + '$.'];
          questions = [{ label: 'Moyenne :', type: 'number', reponse: moy, tol: exact ? undefined : 0.006 }];
        } else if (cas === 'serie') {
          var vals = [0, 1, 2, 3, 4, 5], effs = vals.map(function () { return rng.int(1, 12); });
          var N = EM.util.sum(effs), S = 0;
          vals.forEach(function (v, i) { S += v * effs[i]; });
          var m2 = rnd(S / N, 2), ex2 = ar.isInt(S * 100 / N);
          enonce = 'On a relevé le nombre de frères et sœurs des élèves d\'une classe de 4e à ' + rng.pick(VILLES) + '.' +
            tableau([['Nombre de frères et sœurs'].concat(vals.map(function (v) { return '$' + v + '$'; })), ['Effectif'].concat(effs.map(function (e) { return '$' + e + '$'; }))]) +
            'Calculer le nombre moyen de frères et sœurs par élève' + (ex2 ? '.' : ', arrondi au centième.');
          sol = ['Effectif total : $N = ' + effs.join(' + ') + ' = ' + N + '$.',
            'Somme des produits : $' + vals.map(function (v, i) { return v + ' \\times ' + effs[i]; }).join(' + ') + ' = ' + S + '$.',
            'Moyenne : $\\dfrac{' + S + '}{' + N + '} ' + (ex2 ? '= ' : '\\approx ') + T.num(m2) + '$.'];
          questions = [{ label: 'Moyenne :', type: 'number', reponse: m2, tol: ex2 ? undefined : 0.006 }];
        } else {
          var n = rng.int(3, 5), cible = rng.int(10, 14), nts = [], guard = 0, manq;
          do {
            nts = []; for (var i = 0; i < n; i++) nts.push(rng.int(6, 17));
            manq = cible * (n + 1) - EM.util.sum(nts); guard++;
          } while (guard < 200 && (manq < 0 || manq > 20));
          if (manq < 0 || manq > 20) { nts = []; for (i = 0; i < n; i++) nts.push(cible); manq = cible; }
          var nom2 = rng.pick(PRENOMS);
          enonce = 'En mathématiques, ' + nom2 + ' a obtenu les notes suivantes : $' + nts.join(' \\,;\\, ') + '$. Il reste un devoir (même coefficient). Quelle note doit-' + 'on obtenir à ce devoir pour avoir exactement $' + cible + '$ de moyenne ?';
          sol = ['Avec $' + (n + 1) + '$ notes, pour une moyenne de $' + cible + '$, la somme des notes doit être $' + cible + ' \\times ' + (n + 1) + ' = ' + cible * (n + 1) + '$.',
            'Somme actuelle : $' + nts.join(' + ') + ' = ' + EM.util.sum(nts) + '$.',
            'Note nécessaire : $' + cible * (n + 1) + ' - ' + EM.util.sum(nts) + ' = ' + manq + '$.'];
          questions = [{ label: 'Note nécessaire :', type: 'number', reponse: manq }];
        }
        ind = ['Moyenne pondérée : somme des (valeur × effectif ou coefficient) divisée par la somme des effectifs ou coefficients.', 'Vérifie que ta moyenne est comprise entre la plus petite et la plus grande valeur.'];
      } else {
        var ctx = rng.pick([
          { t: 'la taille (en cm) de $N$ élèves de 4e', a0: 140, h: 10, u: 'cm', nom: 'Taille (cm)' },
          { t: 'la masse (en kg) des captures de $N$ pirogues au quai de Joal', a0: 0, h: 50, u: 'kg', nom: 'Masse (kg)' },
          { t: 'la durée (en minutes) du trajet domicile-école de $N$ élèves de ' + rng.pick(VILLES), a0: 0, h: 10, u: 'min', nom: 'Durée (min)' },
          { t: 'la recette journalière (en milliers de F CFA) de $N$ vendeuses de bissap', a0: 0, h: 5, u: 'milliers de F CFA', nom: 'Recette (milliers de F CFA)' }
        ]);
        var k = rng.int(4, 5), ef = [], cls = [], cen = [];
        for (var j = 0; j < k; j++) {
          var lo = ctx.a0 + j * ctx.h;
          cls.push('$[' + T.num(lo) + ' \\,;\\, ' + T.num(lo + ctx.h) + '[$');
          cen.push(rnd(lo + ctx.h / 2));
          ef.push(rng.int(2, 15));
        }
        var N2 = EM.util.sum(ef), S2 = 0;
        cen.forEach(function (c, i) { S2 += c * ef[i]; });
        S2 = rnd(S2);
        var m3 = rnd(S2 / N2, 2), ex3 = ar.isInt(S2 * 100 / N2);
        var ic = rng.int(0, k - 1), fq = rnd(100 * ef[ic] / N2, 1), exf = ar.isInt(ef[ic] * 1000 / N2);
        enonce = 'On a relevé ' + ctx.t.replace('$N$', '$' + N2 + '$') + '.' +
          tableau([[ctx.nom].concat(cls), ['Effectif'].concat(ef.map(function (e) { return '$' + e + '$'; }))]) +
          'Calculer la fréquence (en %) de la classe ' + cls[ic] + (exf ? '' : ', arrondie au dixième') + ', puis une valeur approchée de la moyenne à l\'aide des centres des classes' + (ex3 ? '' : ' (arrondie au centième)') + '.';
        sol = ['Fréquence de la classe ' + cls[ic] + ' : $\\dfrac{' + ef[ic] + '}{' + N2 + '} \\times 100 ' + (exf ? '= ' : '\\approx ') + T.num(fq) + '$ %.',
          'Centres des classes : $' + cen.map(function (c) { return T.num(c); }).join(' \\,;\\, ') + '$.',
          'Somme des produits centre × effectif : $' + cen.map(function (c, i) { return T.num(c) + ' \\times ' + ef[i]; }).join(' + ') + ' = ' + T.num(S2) + '$.',
          'Moyenne : $\\dfrac{' + T.num(S2) + '}{' + N2 + '} ' + (ex3 ? '= ' : '\\approx ') + T.num(m3) + '$ ' + ctx.u + '.'];
        questions = [{ label: 'Fréquence (%) :', type: 'number', reponse: fq, tol: exf ? undefined : 0.06, unite: '%' }, { label: 'Moyenne :', type: 'number', reponse: m3, tol: ex3 ? undefined : 0.006 }];
        ind = ['Le centre de la classe $[a \\,;\\, b[$ est $\\dfrac{a + b}{2}$.', 'Moyenne $= \\dfrac{\\sum (\\text{centre} \\times \\text{effectif})}{\\text{effectif total}}$.'];
      }
      return { enonce: enonce, questions: questions, indices: ind, solution: sol };
    }
  });

/*__SUITE__*/
})(typeof window !== 'undefined' ? window : globalThis);
