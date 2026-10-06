/*
 * Laboratoire : outils de calcul qui montrent les étapes (pas seulement le résultat).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  var T = EM.T, F = EM.F, Frac = EM.Frac;
  EM.labo = EM.labo || {};
  EM.views = EM.views || {};

  function md(s) { return EM.md(s); }
  function crumbs(titre) { return '<div class="crumbs"><a href="#/labo">← Labo</a></div><h1>' + titre + '</h1>'; }
  function fmt(x, d) {
    if (!isFinite(x)) return x > 0 ? '+\\infty' : x < 0 ? '-\\infty' : '\\text{indéfini}';
    return T.num(EM.ar.round(x, d == null ? 6 : d));
  }
  /** Lit un nombre saisi (fraction, décimal, racine…) ; renvoie { v, frac (si rationnel) }. */
  function lire(s) {
    var v = EM.parser.evalNum(String(s).trim() || '0');
    var fr = null;
    try {
      var p = EM.parser.parse(String(s).trim() || '0', []);
      var rationnel = !(function hasIrr(n) {
        if (!n) return false;
        if (n.k === 'const' || n.k === 'func') return true;
        if (n.k === 'bin' && n.op === '^' && !(n.b.k === 'num' && EM.ar.isInt(n.b.v))) return true;
        return hasIrr(n.a) || hasIrr(n.b);
      })(p.ast);
      if (rationnel && isFinite(v)) fr = new Frac(v);
    } catch (e) { /* rien */ }
    return { v: v, frac: fr };
  }
  /** Approximation rationnelle (fractions continues), dénominateur ≤ maxD. */
  function rationnel(x, maxD) {
    if (!isFinite(x)) return null;
    var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    for (var i = 0; i < 30; i++) {
      var a = Math.floor(b);
      var h2 = a * h1 + h0, k2 = a * k1 + k0;
      if (k2 > maxD) break;
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      if (Math.abs(x - h1 / k1) < 1e-12 * Math.max(1, Math.abs(x))) return new Frac(h1, k1);
      if (b - a < 1e-14) break;
      b = 1 / (b - a);
    }
    return Math.abs(x - h1 / k1) < 1e-12 * Math.max(1, Math.abs(x)) ? new Frac(h1, k1) : null;
  }
  /** Reconnaît x = q·π (q rationnel simple) pour les angles. */
  function enPi(x) {
    var q = rationnel(x / Math.PI, 24);
    if (!q) return null;
    if (q.isZero()) return '0';
    var n = q.n, d = q.d;
    var num = (n < 0 ? '-' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + '\\pi';
    return d === 1 ? num : (n < 0 ? '-' : '') + '\\dfrac{' + (Math.abs(n) === 1 ? '' : Math.abs(n)) + '\\pi}{' + d + '}';
  }
  /** √n exact si n est rationnel. */
  function sqrtExact(fr) {
    if (!fr || fr.n < 0) return null;
    var s = EM.ar.sqrtSimplify(fr.n * fr.d);
    var k = new Frac(s.a, fr.d);
    if (s.b === 1) return k.tex();
    return (k.equals(1) ? '' : k.isInt() ? String(k.n) : k.tex()) + '\\sqrt{' + s.b + '}';
  }

  /* =================== Calculatrice =================== */
  EM.labo.calculatrice = {
    nom: 'Calculatrice', ico: '🧮', desc: 'Calcul exact et approché, degrés ou radians, avec aperçu de la formule.',
    render: function (main) {
      main.innerHTML = crumbs('🧮 Calculatrice') + '<div class="card"><div class="row between"><div class="levels" role="group" aria-label="Unité d\'angle">' +
        '<button data-ang="deg" aria-pressed="true">Degrés</button><button data-ang="rad" aria-pressed="false">Radians</button></div>' +
        '<span class="small muted">Entrée pour calculer · « ans » = résultat précédent</span></div>' +
        '<input class="search-input" id="expr" style="margin-top:10px" placeholder="ex. : (3/4 + 2/3) × 12, √50, cos(60), 2^10, 5!, ln(2)" autocomplete="off" spellcheck="false">' +
        '<div class="mathkbd"></div><div class="q-preview" id="pv"></div><div class="out" id="res" style="margin-top:8px"><span class="muted">Le résultat s\'affiche ici.</span></div></div>' +
        '<div class="card"><h2>Historique</h2><ul class="calc-hist" id="hist"></ul></div>';
      var deg = true, ans = 0, hist = [];
      var inp = main.querySelector('#expr');
      var kb = main.querySelector('.mathkbd');
      ['√', 'π', '^', '²', '(', ')', '/', '!', 'sin(', 'cos(', 'tan(', 'ln(', 'e^', 'ans'].forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = k; b.tabIndex = -1;
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('click', function () {
          var ins = { '√': '√(', 'e^': 'e^(' }[k] || k;
          var s = inp.selectionStart, t = inp.selectionEnd;
          inp.setRangeText(ins, s, t, 'end'); inp.focus(); maj();
        });
        kb.appendChild(b);
      });
      function prep(src) {
        var p = EM.parser.parse(src.replace(/\bans\b/gi, '(' + ans + ')'), []);
        if (deg) {
          (function walk(n) {
            if (!n) return;
            if (n.k === 'func' && /^(sin|cos|tan)$/.test(n.f)) n.a = { k: 'bin', op: '*', a: n.a, b: { k: 'bin', op: '/', a: { k: 'const', v: 'pi' }, b: { k: 'num', v: 180 } } };
            walk(n.a); walk(n.b);
            if (n.k === 'func' && /^(arcsin|arccos|arctan|asin|acos|atan)$/.test(n.f)) {
              var inner = { k: 'func', f: n.f, a: n.a };
              n.k = 'bin'; n.op = '*'; n.a = inner; n.b = { k: 'bin', op: '/', a: { k: 'num', v: 180 }, b: { k: 'const', v: 'pi' } }; delete n.f;
            }
          })(p.ast);
        }
        return p;
      }
      function maj() {
        var s = inp.value.trim();
        if (!s) { main.querySelector('#pv').innerHTML = ''; return; }
        try { main.querySelector('#pv').innerHTML = EM.render.tex(EM.parser.parse(s.replace(/\bans\b/gi, 'a'), ['a']).tex().replace(/\ba\b/g, '\\text{ans}')); }
        catch (e) { main.querySelector('#pv').innerHTML = '<span class="err">' + esc(e.message) + '</span>'; }
      }
      function calc() {
        var s = inp.value.trim();
        if (!s) return;
        var out = main.querySelector('#res');
        try {
          var p = prep(s), v = p.eval({});
          var fr = isFinite(v) && Math.abs(v) < 1e12 ? rationnel(v, 10000) : null;
          var html = '<div class="big-result">' + EM.render.tex(EM.parser.parse(s.replace(/\bans\b/gi, 'a'), ['a']).tex().replace(/\ba\b/g, '\\text{ans}') + ' = ' +
            (fr && !fr.isInt() ? fr.tex() + ' \\approx ' : '') + fmt(v, 10)) + '</div>';
          var pi = !fr && isFinite(v) ? enPi(v) : null;
          if (pi) html += '<div class="muted">' + EM.render.tex('= ' + pi) + '</div>';
          if (!fr && isFinite(v) && v > 0) {
            var sq = rationnel(v * v, 1000);
            if (sq && !sq.isZero() && sqrtExact(sq)) html += '<div class="muted">' + EM.render.tex('= ' + sqrtExact(sq)) + '</div>';
          }
          out.innerHTML = html;
          ans = v;
          hist.unshift({ s: s, v: v });
          main.querySelector('#hist').innerHTML = hist.slice(0, 30).map(function (h, i) {
            return '<li data-h="' + i + '">' + esc(h.s) + ' <strong>= ' + esc(T.txt(EM.ar.round(h.v, 10))) + '</strong></li>';
          }).join('');
        } catch (e) {
          out.innerHTML = '<span class="err" style="color:var(--ko)">' + esc(e.message) + '</span>';
        }
      }
      inp.addEventListener('input', maj);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') calc(); });
      main.querySelector('#hist').addEventListener('click', function (e) {
        var li = e.target.closest('[data-h]');
        if (li) { inp.value = hist[+li.getAttribute('data-h')].s; inp.focus(); maj(); }
      });
      main.querySelector('.levels').addEventListener('click', function (e) {
        var b = e.target.closest('[data-ang]');
        if (!b) return;
        deg = b.getAttribute('data-ang') === 'deg';
        Array.prototype.forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === b); });
        if (inp.value.trim()) calc();
      });
      inp.focus();
    }
  };

  /* =================== Second degré =================== */
  EM.labo['second-degre'] = {
    nom: 'Second degré', ico: '∆', desc: 'Discriminant, racines (réelles ou complexes), forme canonique, signe, sommet.',
    render: function (main) {
      main.innerHTML = crumbs('Second degré pas à pas') +
        '<div class="card"><p>' + md('Étude de $f(x) = ax^2 + bx + c$ avec $a \\neq 0$. Tu peux saisir des fractions (3/4) ou des décimaux.') + '</p>' +
        '<div class="row"><label class="field">a<input class="inp" id="a" value="1" size="6"></label><label class="field">b<input class="inp" id="b" value="-2" size="6"></label>' +
        '<label class="field">c<input class="inp" id="c" value="-3" size="6"></label><button class="btn" id="go">Résoudre</button></div></div><div id="out"></div>';
      function run() {
        var out = main.querySelector('#out');
        try {
          var A = lire(main.querySelector('#a').value), B = lire(main.querySelector('#b').value), C = lire(main.querySelector('#c').value);
          if (A.v === 0) throw new Error('a doit être non nul (sinon l\'équation est du premier degré).');
          out.innerHTML = (A.frac && B.frac && C.frac) ? exact(A.frac, B.frac, C.frac) : approx(A.v, B.v, C.v);
          EM.ui.badges(EM.store.outil('second-degre'));
        } catch (e) { out.innerHTML = '<div class="card pitfall">' + esc(e.message) + '</div>'; }
      }
      function graph(a, b, c, roots) {
        var al = -b / (2 * a), be = c - b * b / (4 * a);
        var span = Math.max(3, roots.length === 2 ? Math.abs(roots[1] - roots[0]) : 3);
        var xmin = al - span, xmax = al + span;
        var ys = [be, a * (xmin - al) * (xmin - al) + be, 0];
        var ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
        var pad = (ymax - ymin) * 0.15 || 1;
        var f = EM.fig.create({ w: 320, h: 220, xmin: xmin, xmax: xmax, ymin: ymin - pad, ymax: ymax + pad });
        f.axes({ grid: false, labels: false });
        f.curve(function (x) { return a * x * x + b * x + c; });
        roots.forEach(function (r) { f.point([r, 0], '', 's', { accent: true }); });
        f.point([al, be], 'S', be >= 0 ? 'n' : 's');
        return f.svg();
      }
      function exact(a, b, c) {
        var delta = b.mul(b).sub(a.mul(c).mul(4));
        var alpha = b.neg().div(a.mul(2)), beta = c.sub(b.mul(b).div(a.mul(4)));
        var s = '<div class="card"><h2>Discriminant</h2><p>' + md('$\\Delta = b^2 - 4ac = ' + T.par(b) + '^2 - 4 \\times ' + T.par(a) + ' \\times ' + T.par(c) + ' = ' + delta.tex() + '$') + '</p>';
        var roots = [], racinesTex, signe, facto;
        var at = a.equals(1) ? '' : a.equals(-1) ? '-' : a.tex();
        if (delta.sign() > 0) {
          var sq = EM.ar.sqrtSimplify(delta.n * delta.d);
          var k = new Frac(sq.a, delta.d).div(a.mul(2).abs());
          var x1v = alpha.value() - k.value() * Math.sqrt(sq.b), x2v = alpha.value() + k.value() * Math.sqrt(sq.b);
          roots = [Math.min(x1v, x2v), Math.max(x1v, x2v)];
          if (sq.b === 1) {
            var r1 = alpha.sub(k), r2 = alpha.add(k);
            racinesTex = ['x_1 = ' + r1.tex(), 'x_2 = ' + r2.tex()];
            facto = at + T.xMinus(r1) + T.xMinus(r2);
          } else {
            var kt = (k.equals(1) ? '' : k.tex()) + '\\sqrt{' + sq.b + '}';
            var al = alpha.isZero() ? '' : alpha.tex();
            racinesTex = ['x_1 = ' + (al ? al + ' - ' : '-') + kt, 'x_2 = ' + (al ? al + ' + ' : '') + kt];
            facto = at + '\\left(x - x_1\\right)\\left(x - x_2\\right)';
          }
          s += '<p>' + md('$\\Delta > 0$ : deux racines réelles distinctes $x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.') + '</p><p>' + md('$' + racinesTex.join('$ ; $') + '$') +
            (sq.b === 1 ? '' : ' <span class="muted">' + md('($\\approx ' + fmt(roots[0], 4) + '$ et $' + fmt(roots[1], 4) + '$)') + '</span>') + '</p>';
          signe = a.sign() > 0 ? ['+', '0', '−', '0', '+'] : ['−', '0', '+', '0', '−'];
        } else if (delta.isZero()) {
          roots = [alpha.value()];
          s += '<p>' + md('$\\Delta = 0$ : une racine double $x_0 = -\\dfrac{b}{2a} = ' + alpha.tex() + '$.') + '</p>';
          facto = at + T.xMinus(alpha) + '^2';
          signe = a.sign() > 0 ? ['+', '0', '+'] : ['−', '0', '−'];
        } else {
          var sq2 = EM.ar.sqrtSimplify(-delta.n * delta.d);
          var k2 = new Frac(sq2.a, delta.d).div(a.mul(2).abs());
          var im = (k2.equals(1) ? '' : k2.tex()) + (sq2.b === 1 ? '' : '\\sqrt{' + sq2.b + '}');
          if (!im) im = '1';
          s += '<p>' + md('$\\Delta < 0$ : pas de racine réelle. Dans $\\C$, deux racines conjuguées : $z_{1,2} = \\dfrac{-b \\pm i\\sqrt{-\\Delta}}{2a}$, soit $z_1 = ' +
            (alpha.isZero() ? '' : alpha.tex() + ' - ') + (alpha.isZero() ? '-' : '') + (im === '1' ? '' : im) + 'i$ et $z_2 = ' + (alpha.isZero() ? '' : alpha.tex() + ' + ') + (im === '1' ? '' : im) + 'i$.') + '</p>';
          signe = a.sign() > 0 ? ['+'] : ['−'];
        }
        s += '</div><div class="grid g2"><div class="card"><h2>Formes</h2><p>' + md('Forme développée : $f(x) = ' + T.poly([a, b, c]) + '$') + '</p><p>' +
          md('Forme canonique : $f(x) = ' + at + (alpha.isZero() ? 'x^2' : T.xMinus(alpha) + '^2') + (beta.isZero() ? '' : T.signed(beta)) + '$') + '</p>' +
          (facto ? '<p>' + md('Forme factorisée : $f(x) = ' + facto + '$') + '</p>' : '<p class="muted">' + md('Pas de forme factorisée dans $\\R$.') + '</p>') +
          '<p>' + md('Sommet de la parabole : $S\\left(' + alpha.tex() + ' \\,;\\, ' + beta.tex() + '\\right)$ — ' + (a.sign() > 0 ? 'minimum' : 'maximum') + ' de $f$.') + '</p>' +
          (roots.length === 2 ? '<p>' + md('Somme des racines $S = -\\dfrac{b}{a} = ' + b.neg().div(a).tex() + '$, produit $P = \\dfrac{c}{a} = ' + c.div(a).tex() + '$.') + '</p>' : '') + '</div>' +
          '<div class="card"><h2>Signe de f(x)</h2>' + tableauSigne(roots, signe) + '<div class="exo-figure">' + graph(a.value(), b.value(), c.value(), roots) + '</div></div></div>';
        return s;
      }
      function approx(a, b, c) {
        var d = b * b - 4 * a * c, roots = [];
        var s = '<div class="card"><h2>Résultats (valeurs approchées)</h2><p>' + md('$\\Delta \\approx ' + fmt(d) + '$') + '</p>';
        if (d > 0) { roots = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort(function (x, y) { return x - y; }); s += '<p>' + md('$x_1 \\approx ' + fmt(roots[0]) + '$ ; $x_2 \\approx ' + fmt(roots[1]) + '$') + '</p>'; }
        else if (d === 0) { roots = [-b / (2 * a)]; s += '<p>' + md('$x_0 \\approx ' + fmt(roots[0]) + '$') + '</p>'; }
        else s += '<p>' + md('Pas de racine réelle ; $z_{1,2} \\approx ' + fmt(-b / (2 * a)) + ' \\pm ' + fmt(Math.sqrt(-d) / (2 * Math.abs(a))) + 'i$') + '</p>';
        var signe = d > 0 ? (a > 0 ? ['+', '0', '−', '0', '+'] : ['−', '0', '+', '0', '−']) : d === 0 ? (a > 0 ? ['+', '0', '+'] : ['−', '0', '−']) : [a > 0 ? '+' : '−'];
        return s + '</div><div class="card"><h2>Signe de f(x)</h2>' + tableauSigne(roots, signe) + '<div class="exo-figure">' + graph(a, b, c, roots) + '</div></div>';
      }
      function tableauSigne(roots, signe) {
        var xs = ['$-\\infty$'].concat(roots.map(function (r) { return '$' + fmt(r, 4) + '$'; })).concat(['$+\\infty$']);
        var h = '<div class="table-wrap"><table class="t"><tr><th>$x$</th>';
        xs.forEach(function (x, i) { h += '<td>' + x + '</td>' + (i < xs.length - 1 ? '<td></td>' : ''); });
        h += '</tr><tr><th>$f(x)$</th><td></td>';
        signe.forEach(function (sg) { h += '<td><strong>' + sg + '</strong></td>'; });
        h += '<td></td></tr></table></div>';
        return md(h);
      }
      main.querySelector('#go').addEventListener('click', run);
      main.querySelector('.card').addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
      run();
    }
  };

  /* =================== Systèmes linéaires (pivot de Gauss) =================== */
  EM.labo.systemes = {
    nom: 'Systèmes linéaires', ico: '⚖️', desc: 'Résolution de systèmes 2×2 ou 3×3 par le pivot de Gauss, étape par étape, en fractions exactes.',
    render: function (main, query) {
      var n = query.n === '3' ? 3 : 2;
      var vars = ['x', 'y', 'z'];
      var def = n === 2 ? [[2, 3, 13], [1, -1, -1]] : [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]];
      var h = crumbs('⚖️ Systèmes linéaires') + '<div class="card"><div class="levels" role="group"><a href="#/labo/systemes?n=2" aria-pressed="' + (n === 2) + '">2 inconnues</a>' +
        '<a href="#/labo/systemes?n=3" aria-pressed="' + (n === 3) + '">3 inconnues</a></div><div style="margin-top:12px">';
      for (var i = 0; i < n; i++) {
        h += '<div class="row" style="margin-bottom:6px">';
        for (var j = 0; j <= n; j++) {
          h += '<input class="inp" size="4" data-i="' + i + '" data-j="' + j + '" value="' + def[i][j] + '" aria-label="coefficient ligne ' + (i + 1) + ' colonne ' + (j + 1) + '">' +
            (j < n - 1 ? md('$' + vars[j] + ' \\; +$') : j === n - 1 ? md('$' + vars[j] + ' \\; =$') : '');
        }
        h += '</div>';
      }
      h += '</div><button class="btn" id="go">Résoudre</button></div><div id="out"></div>';
      main.innerHTML = h;
      function matTex(M) {
        return '\\left(\\begin{array}{' + 'c'.repeat(n) + '|c}' + M.map(function (r) { return r.map(function (x) { return x.tex({ small: true }); }).join(' & '); }).join(' \\\\ ') + '\\end{array}\\right)';
      }
      function run() {
        var out = main.querySelector('#out');
        try {
          var M = [];
          for (var i = 0; i < n; i++) {
            M.push([]);
            for (var j = 0; j <= n; j++) {
              var r = lire(main.querySelector('[data-i="' + i + '"][data-j="' + j + '"]').value);
              if (!r.frac) throw new Error('Saisis des nombres rationnels (entiers, décimaux ou fractions).');
              M[i].push(r.frac);
            }
          }
          var steps = ['Matrice augmentée du système : $' + matTex(M) + '$'];
          var row = 0, pivots = [];
          for (var col = 0; col < n && row < n; col++) {
            var p = -1;
            for (var r2 = row; r2 < n; r2++) if (!M[r2][col].isZero()) { p = r2; break; }
            if (p < 0) continue;
            if (p !== row) { var tmp = M[p]; M[p] = M[row]; M[row] = tmp; steps.push('On échange $L_' + (row + 1) + '$ et $L_' + (p + 1) + '$ pour avoir un pivot non nul : $' + matTex(M) + '$'); }
            var ops = [];
            for (var r3 = 0; r3 < n; r3++) {
              if (r3 === row || M[r3][col].isZero()) continue;
              var k = M[r3][col].div(M[row][col]);
              for (var c = 0; c <= n; c++) M[r3][c] = M[r3][c].sub(k.mul(M[row][c]));
              ops.push('$L_' + (r3 + 1) + ' \\leftarrow L_' + (r3 + 1) + (k.sign() > 0 ? ' - ' : ' + ') + (k.abs().equals(1) ? '' : k.abs().tex({ small: true })) + 'L_' + (row + 1) + '$');
            }
            if (ops.length) steps.push(ops.join(', ') + ' : $' + matTex(M) + '$');
            pivots.push(col);
            row++;
          }
          var incoherent = M.some(function (r) { return r.slice(0, n).every(function (x) { return x.isZero(); }) && !r[n].isZero(); });
          var concl;
          if (incoherent) concl = 'Une ligne donne $0 = $ un nombre non nul : le système n\'a <strong>aucune solution</strong>, $S = \\varnothing$.';
          else if (pivots.length < n) concl = 'Il y a moins de pivots que d\'inconnues : le système a <strong>une infinité de solutions</strong>.';
          else {
            var sol = M.map(function (r, i2) { return r[n].div(r[i2]); });
            concl = 'Chaque ligne donne directement une inconnue : ' + sol.map(function (s2, i3) { return '$' + vars[i3] + ' = ' + s2.tex() + '$'; }).join(', ') +
              '.<br><strong>Solution :</strong> $S = \\left\\{\\left(' + sol.map(function (s2) { return s2.tex(); }).join(' \\,;\\, ') + '\\right)\\right\\}$';
          }
          out.innerHTML = '<div class="card solution"><h2>Méthode du pivot de Gauss</h2><ol>' + steps.map(function (s2) { return '<li>' + md(s2) + '</li>'; }).join('') + '</ol><p>' + md(concl) + '</p></div>';
          EM.ui.badges(EM.store.outil('systemes'));
        } catch (e) { out.innerHTML = '<div class="card pitfall">' + esc(e.message) + '</div>'; }
      }
      main.querySelector('#go').addEventListener('click', run);
      run();
    }
  };

  /* =================== Arithmétique =================== */
  EM.labo.arithmetique = {
    nom: 'Arithmétique', ico: '🔣', desc: 'PGCD (algorithme d\'Euclide), PPCM, décomposition en facteurs premiers, Bézout, diviseurs.',
    render: function (main) {
      main.innerHTML = crumbs('🔣 Arithmétique') + '<div class="card"><div class="row"><label class="field">a<input class="inp" id="a" value="1071" inputmode="numeric" size="10"></label>' +
        '<label class="field">b<input class="inp" id="b" value="462" inputmode="numeric" size="10"></label><button class="btn" id="go">Calculer</button></div></div><div id="out"></div>';
      function facto(n) {
        var f = EM.ar.primeFactors(n), cnt = {};
        f.forEach(function (p) { cnt[p] = (cnt[p] || 0) + 1; });
        var keys = Object.keys(cnt).map(Number).sort(function (x, y) { return x - y; });
        return keys.length ? keys.map(function (p) { return p + (cnt[p] > 1 ? '^{' + cnt[p] + '}' : ''); }).join(' \\times ') : String(n);
      }
      function run() {
        var out = main.querySelector('#out');
        var a = parseInt(main.querySelector('#a').value, 10), b = parseInt(main.querySelector('#b').value, 10);
        if (!(a > 0 && b > 0) || a > 1e12 || b > 1e12) { out.innerHTML = '<div class="card pitfall">Saisis deux entiers naturels non nuls (au plus 10<sup>12</sup>).</div>'; return; }
        var x = Math.max(a, b), y = Math.min(a, b), lignes = [], r;
        // Euclide étendu
        var r0 = x, r1 = y, s0 = 1, s1 = 0, t0 = 0, t1 = 1;
        while (r1 !== 0) {
          var q = Math.floor(r0 / r1);
          r = r0 - q * r1;
          lignes.push('$' + T.num(r0) + ' = ' + T.num(r1) + ' \\times ' + T.num(q) + ' + ' + T.num(r) + '$');
          var r2 = r0 - q * r1, s2 = s0 - q * s1, t2 = t0 - q * t1;
          r0 = r1; r1 = r2; s0 = s1; s1 = s2; t0 = t1; t1 = t2;
        }
        var g = r0, u = s0, v = t0; // u·x + v·y = g
        var ua = a >= b ? u : v, vb = a >= b ? v : u;
        var ppcm = a / g * b;
        var h = '<div class="grid g2"><div class="card"><h2>PGCD par l\'algorithme d\'Euclide</h2><ol>' + lignes.map(function (l) { return '<li>' + md(l) + '</li>'; }).join('') + '</ol>' +
          '<p>' + md('Le dernier reste non nul est le PGCD : $\\operatorname{PGCD}(' + a + ' ; ' + b + ') = ' + g + '$.') + '</p>' +
          '<p>' + md('$\\operatorname{PPCM}(' + a + ' ; ' + b + ') = \\dfrac{a \\times b}{\\operatorname{PGCD}} = ' + T.num(ppcm) + '$.') + '</p>' +
          '<p>' + md('Égalité de Bézout : $' + a + ' \\times ' + T.par(ua) + ' + ' + b + ' \\times ' + T.par(vb) + ' = ' + g + '$.') + '</p>' +
          (g === 1 ? '<p class="chip ok">' + a + ' et ' + b + ' sont premiers entre eux</p>' : '') + '</div>' +
          '<div class="card"><h2>Décompositions</h2><p>' + md('$' + a + ' = ' + facto(a) + '$') + (EM.ar.isPrime(a) ? ' <span class="chip ok">premier</span>' : '') + '</p>' +
          '<p>' + md('$' + b + ' = ' + facto(b) + '$') + (EM.ar.isPrime(b) ? ' <span class="chip ok">premier</span>' : '') + '</p>';
        if (a <= 100000) {
          var dv = EM.ar.divisors(a);
          h += '<p><strong>Diviseurs de ' + a + '</strong> (' + dv.length + ') : ' + dv.join(', ') + '</p>';
        }
        if (b <= 100000) {
          var dvb = EM.ar.divisors(b);
          h += '<p><strong>Diviseurs de ' + b + '</strong> (' + dvb.length + ') : ' + dvb.join(', ') + '</p>';
        }
        out.innerHTML = h + '</div></div>';
        EM.ui.badges(EM.store.outil('arithmetique'));
      }
      main.querySelector('#go').addEventListener('click', run);
      run();
    }
  };

  /* =================== Statistiques =================== */
  EM.labo.statistiques = {
    nom: 'Statistiques', ico: '📊', desc: 'Moyenne, médiane, quartiles, variance, écart-type, diagramme ; ajustement linéaire à deux variables.',
    render: function (main, query) {
      var deux = query.mode === '2';
      main.innerHTML = crumbs('📊 Statistiques') + '<div class="card"><div class="levels" role="group"><a href="#/labo/statistiques" aria-pressed="' + !deux + '">Une variable</a>' +
        '<a href="#/labo/statistiques?mode=2" aria-pressed="' + deux + '">Deux variables</a></div>' +
        (deux
          ? '<div class="grid g2" style="margin-top:12px"><label class="field">Valeurs de x (séparées par des espaces ou « ; »)<textarea class="inp" id="x">1 2 3 4 5 6</textarea></label>' +
            '<label class="field">Valeurs de y<textarea class="inp" id="y">310 340 395 420 470 500</textarea></label></div>'
          : '<label class="field" style="margin-top:12px">Valeurs (séparées par des espaces ou « ; »)<textarea class="inp" id="x">12 15 9 15 18 11 15 14 9 16</textarea></label>' +
            '<label class="field">Effectifs (facultatif, dans le même ordre)<textarea class="inp" id="n" style="min-height:50px" placeholder="laisser vide si chaque valeur compte une fois"></textarea></label>') +
        '<button class="btn" id="go" style="margin-top:8px">Calculer</button></div><div id="out"></div>';
      function nums(s) {
        return String(s).replace(/(\d),(\d)/g, '$1.$2').split(/[\s;]+/).filter(Boolean).map(function (t) { var v = EM.parser.evalNum(t); if (!isFinite(v)) throw new Error('Valeur invalide : ' + t); return v; });
      }
      function run() {
        var out = main.querySelector('#out');
        try { out.innerHTML = deux ? deuxVar() : uneVar(); EM.ui.badges(EM.store.outil('statistiques')); }
        catch (e) { out.innerHTML = '<div class="card pitfall">' + esc(e.message) + '</div>'; }
      }
      function uneVar() {
        var xs = nums(main.querySelector('#x').value), ns = main.querySelector('#n').value.trim() ? nums(main.querySelector('#n').value) : xs.map(function () { return 1; });
        if (!xs.length) throw new Error('Saisis au moins une valeur.');
        if (ns.length !== xs.length) throw new Error('Il faut autant d\'effectifs que de valeurs.');
        var map = {};
        xs.forEach(function (x, i) { map[x] = (map[x] || 0) + ns[i]; });
        var vals = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
        var N = vals.reduce(function (s, v) { return s + map[v]; }, 0);
        var moy = vals.reduce(function (s, v) { return s + v * map[v]; }, 0) / N;
        var vari = vals.reduce(function (s, v) { return s + map[v] * (v - moy) * (v - moy); }, 0) / N;
        function quantile(p) { // plus petite valeur telle qu'au moins p·N valeurs lui soient inférieures ou égales
          var cum = 0;
          for (var i = 0; i < vals.length; i++) { cum += map[vals[i]]; if (cum >= p * N - 1e-9) return vals[i]; }
          return vals[vals.length - 1];
        }
        // médiane : valeur centrale (ou moyenne des deux valeurs centrales)
        var serie = [];
        vals.forEach(function (v) { for (var k = 0; k < map[v] && serie.length < 100000; k++) serie.push(v); });
        var med = N % 2 ? serie[(N - 1) / 2] : (serie[N / 2 - 1] + serie[N / 2]) / 2;
        var maxN = Math.max.apply(null, vals.map(function (v) { return map[v]; }));
        var modes = vals.filter(function (v) { return map[v] === maxN; });
        var cum = 0;
        var tab = '<div class="table-wrap"><table class="t"><tr><th>Valeur</th>' + vals.map(function (v) { return '<td>' + T.txt(v) + '</td>'; }).join('') + '</tr>' +
          '<tr><th>Effectif</th>' + vals.map(function (v) { return '<td>' + T.txt(map[v]) + '</td>'; }).join('') + '</tr>' +
          '<tr><th>Fréquence (%)</th>' + vals.map(function (v) { return '<td>' + T.txt(EM.ar.round(map[v] / N * 100, 1)) + '</td>'; }).join('') + '</tr>' +
          '<tr><th>Eff. cumulé croissant</th>' + vals.map(function (v) { cum += map[v]; return '<td>' + T.txt(cum) + '</td>'; }).join('') + '</tr></table></div>';
        var f = EM.fig.create({ w: 360, h: 200, xmin: -0.8, xmax: vals.length - 0.2, ymin: -maxN * 0.15, ymax: maxN * 1.1 });
        vals.forEach(function (v, i) { f.rect(i - 0.3, 0, 0.6, map[v]); f.text([i, -maxN * 0.1], T.txt(v), { small: true }); });
        f.title = 'Diagramme en bâtons';
        return '<div class="grid g2"><div class="card"><h2>Paramètres</h2><p>' + md('Effectif total $N = ' + T.num(N) + '$') + '</p>' +
          '<p>' + md('Moyenne $\\bar{x} = \\dfrac{\\sum n_i x_i}{N} \\approx ' + fmt(moy, 4) + '$') + '</p>' +
          '<p>' + md('Médiane $Me = ' + fmt(med, 4) + '$ · Mode : $' + modes.map(function (m) { return fmt(m); }).join(' ; ') + '$') + '</p>' +
          '<p>' + md('Quartiles : $Q_1 = ' + fmt(quantile(0.25)) + '$, $Q_3 = ' + fmt(quantile(0.75)) + '$ · Étendue : $' + fmt(vals[vals.length - 1] - vals[0]) + '$') + '</p>' +
          '<p>' + md('Variance $V = \\dfrac{\\sum n_i (x_i - \\bar{x})^2}{N} \\approx ' + fmt(vari, 4) + '$ · Écart-type $\\sigma = \\sqrt{V} \\approx ' + fmt(Math.sqrt(vari), 4) + '$') + '</p></div>' +
          '<div class="card"><h2>Diagramme</h2><div class="exo-figure">' + f.svg() + '</div></div></div><div class="card"><h2>Tableau</h2>' + tab + '</div>';
      }
      function deuxVar() {
        var xs = nums(main.querySelector('#x').value), ys = nums(main.querySelector('#y').value);
        if (xs.length !== ys.length || xs.length < 2) throw new Error('Il faut le même nombre de valeurs x et y (au moins 2).');
        var n = xs.length;
        var mx = EM.util.sum(xs) / n, my = EM.util.sum(ys) / n;
        var vx = xs.reduce(function (s, x) { return s + (x - mx) * (x - mx); }, 0) / n;
        var vy = ys.reduce(function (s, y) { return s + (y - my) * (y - my); }, 0) / n;
        var cov = xs.reduce(function (s, x, i) { return s + (x - mx) * (ys[i] - my); }, 0) / n;
        if (vx === 0) throw new Error('Les valeurs de x sont toutes égales.');
        var a = cov / vx, b = my - a * mx, r = vy ? cov / Math.sqrt(vx * vy) : NaN;
        var all = xs.map(function (x, i) { return [x, ys[i]]; });
        var f = EM.fig.fit(all.concat([[Math.min.apply(null, xs), Math.min.apply(null, ys)]]), { w: 340, h: 240, pad: 26 });
        all.forEach(function (p) { f.dot(p); });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
        f.seg([x0, a * x0 + b], [x1, a * x1 + b], { accent: true });
        f.point([mx, my], 'G', 'no', { accent: true });
        f.title = 'Nuage de points et droite de régression';
        return '<div class="grid g2"><div class="card"><h2>Ajustement linéaire</h2>' +
          '<p>' + md('Point moyen $G\\left(' + fmt(mx, 4) + ' \\,;\\, ' + fmt(my, 4) + '\\right)$') + '</p>' +
          '<p>' + md('$V(x) \\approx ' + fmt(vx, 4) + '$, $V(y) \\approx ' + fmt(vy, 4) + '$, $\\operatorname{cov}(x, y) \\approx ' + fmt(cov, 4) + '$') + '</p>' +
          '<p>' + md('Droite de régression de $y$ en $x$ : $y = ax + b$ avec $a = \\dfrac{\\operatorname{cov}(x,y)}{V(x)} \\approx ' + fmt(a, 4) + '$ et $b = \\bar{y} - a\\bar{x} \\approx ' + fmt(b, 4) + '$') + '</p>' +
          '<p>' + md('Coefficient de corrélation linéaire $r = \\dfrac{\\operatorname{cov}(x,y)}{\\sigma_x \\sigma_y} \\approx ' + fmt(r, 4) + '$') + '</p>' +
          '<p class="muted small">' + (Math.abs(r) >= 0.87 ? 'Corrélation forte : l\'ajustement linéaire est justifié.' : 'Corrélation faible : un ajustement linéaire est peu pertinent.') + '</p>' +
          '<p>Estimation : pour x = <input class="inp" id="est" size="6" value="' + T.txt(x1 + 1) + '"> on obtient y ≈ <strong id="esty"></strong></p></div>' +
          '<div class="card"><h2>Nuage de points</h2><div class="exo-figure">' + f.svg() + '</div></div></div>';
      }
      main.querySelector('#go').addEventListener('click', run);
      main.addEventListener('input', function (e) {
        if (e.target.id === 'est') majEst();
      });
      function majEst() {
        var e = main.querySelector('#est');
        if (!e) return;
        try {
          var xs = nums(main.querySelector('#x').value), ys = nums(main.querySelector('#y').value), n = xs.length;
          var mx = EM.util.sum(xs) / n, my = EM.util.sum(ys) / n;
          var vx = xs.reduce(function (s, x) { return s + (x - mx) * (x - mx); }, 0) / n;
          var cov = xs.reduce(function (s, x, i) { return s + (x - mx) * (ys[i] - my); }, 0) / n;
          var a = cov / vx, b = my - a * mx;
          main.querySelector('#esty').textContent = T.txt(EM.ar.round(a * EM.parser.evalNum(e.value) + b, 3));
        } catch (err) { main.querySelector('#esty').textContent = '—'; }
      }
      run();
      majEst();
    }
  };

  /* =================== Probabilités et dénombrement =================== */
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function C(n, p) { if (p < 0 || p > n) return 0; p = Math.min(p, n - p); var r = 1; for (var i = 1; i <= p; i++) r = r * (n - p + i) / i; return Math.round(r); }
  function A(n, p) { if (p < 0 || p > n) return 0; var r = 1; for (var i = 0; i < p; i++) r *= n - i; return r; }
  EM.labo.probabilites = {
    nom: 'Probabilités', ico: '🎲', desc: 'Factorielles, combinaisons, arrangements, loi binomiale avec tableau et diagramme.',
    render: function (main) {
      main.innerHTML = crumbs('🎲 Dénombrement et probabilités') +
        '<div class="grid g2"><div class="card"><h2>Dénombrement</h2><div class="row"><label class="field">n<input class="inp" id="dn" value="10" size="5" inputmode="numeric"></label>' +
        '<label class="field">p<input class="inp" id="dp" value="3" size="5" inputmode="numeric"></label></div><div id="dout" class="out" style="margin-top:10px"></div></div>' +
        '<div class="card"><h2>Loi binomiale B(n, p)</h2><div class="row"><label class="field">n<input class="inp" id="bn" value="10" size="5" inputmode="numeric"></label>' +
        '<label class="field">p<input class="inp" id="bp" value="0,3" size="6"></label><label class="field">k<input class="inp" id="bk" value="3" size="5" inputmode="numeric"></label></div><div id="bout" class="out" style="margin-top:10px"></div></div></div>' +
        '<div class="card"><h2>Loi de X</h2><div id="btab"></div></div>';
      Array.prototype.forEach.call(main.querySelectorAll('h2'), function (h) { h.innerHTML = md(h.innerHTML); });
      function den() {
        var n = parseInt(main.querySelector('#dn').value, 10), p = parseInt(main.querySelector('#dp').value, 10);
        var o = main.querySelector('#dout');
        if (!(n >= 0 && n <= 170 && p >= 0)) { o.textContent = 'Saisis des entiers avec 0 ≤ n ≤ 170.'; return; }
        o.innerHTML = md('$' + n + '! = ' + T.num(fact(n)) + '$<br>$C_{' + n + '}^{' + p + '} = \\dfrac{' + n + '!}{' + p + '!\\,(' + n + ' - ' + p + ')!} = ' + T.num(C(n, p)) + '$<br>' +
          '$A_{' + n + '}^{' + p + '} = \\dfrac{' + n + '!}{(' + n + ' - ' + p + ')!} = ' + T.num(A(n, p)) + '$<br>$' + n + '^{' + p + '} = ' + T.num(Math.pow(n, p)) + '$ (tirages successifs avec remise)');
      }
      function bin() {
        var o = main.querySelector('#bout'), tb = main.querySelector('#btab');
        var n = parseInt(main.querySelector('#bn').value, 10), k = parseInt(main.querySelector('#bk').value, 10), p;
        try { p = EM.parser.evalNum(main.querySelector('#bp').value); } catch (e) { p = NaN; }
        if (!(n >= 1 && n <= 100 && p >= 0 && p <= 1 && k >= 0 && k <= n)) { o.textContent = 'Il faut 1 ≤ n ≤ 100, 0 ≤ p ≤ 1 et 0 ≤ k ≤ n.'; tb.innerHTML = ''; return; }
        var P = [];
        for (var i = 0; i <= n; i++) P.push(C(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i));
        var le = P.slice(0, k + 1).reduce(function (s, x) { return s + x; }, 0), ge = P.slice(k).reduce(function (s, x) { return s + x; }, 0);
        o.innerHTML = md('$P(X = ' + k + ') = C_{' + n + '}^{' + k + '}\\, p^{' + k + '} (1 - p)^{' + (n - k) + '} \\approx ' + fmt(P[k], 5) + '$<br>' +
          '$P(X \\leq ' + k + ') \\approx ' + fmt(le, 5) + '$ ; $P(X \\geq ' + k + ') \\approx ' + fmt(ge, 5) + '$<br>' +
          '$E(X) = np = ' + fmt(n * p, 4) + '$ ; $V(X) = np(1-p) = ' + fmt(n * p * (1 - p), 4) + '$ ; $\\sigma(X) \\approx ' + fmt(Math.sqrt(n * p * (1 - p)), 4) + '$');
        var max = Math.max.apply(null, P);
        var f = EM.fig.create({ w: 420, h: 180, xmin: -1, xmax: n + 1, ymin: -max * 0.15, ymax: max * 1.1 });
        P.forEach(function (x, i) { f.rect(i - 0.35, 0, 0.7, x, i === k ? { accent: true } : null); if (n <= 20 || i % 5 === 0) f.text([i, -max * 0.1], String(i), { small: true }); });
        f.title = 'Diagramme de la loi binomiale';
        tb.innerHTML = '<div class="exo-figure">' + f.svg() + '</div>' + (n <= 30 ? '<div class="table-wrap">' + md('<table class="t"><tr><th>$k$</th>' + P.map(function (x, i) { return '<td>' + i + '</td>'; }).join('') +
          '</tr><tr><th>$P(X=k)$</th>' + P.map(function (x) { return '<td>' + T.txt(EM.ar.round(x, 4)) + '</td>'; }).join('') + '</tr></table>') + '</div>' : '');
      }
      main.addEventListener('input', function (e) { if (/^d/.test(e.target.id)) den(); else bin(); });
      den(); bin();
      EM.ui.badges(EM.store.outil('probabilites'));
    }
  };

  /* =================== Nombres complexes =================== */
  EM.labo.complexes = {
    nom: 'Nombres complexes', ico: '🌀', desc: 'Module, argument, formes trigonométrique et exponentielle, opérations, puissances.',
    render: function (main) {
      main.innerHTML = crumbs('🌀 Nombres complexes') + '<div class="card"><div class="grid g2">' +
        '<div class="row">' + md('$z_1 =$') + '<input class="inp" id="a1" value="1" size="4" aria-label="partie réelle de z1"> + i ×<input class="inp" id="b1" value="√3" size="4" aria-label="partie imaginaire de z1"></div>' +
        '<div class="row">' + md('$z_2 =$') + '<input class="inp" id="a2" value="1" size="4" aria-label="partie réelle de z2"> + i ×<input class="inp" id="b2" value="-1" size="4" aria-label="partie imaginaire de z2"></div>' +
        '</div><div class="row" style="margin-top:8px">' + md('Puissance $n$ pour $z_1^n$ :') + '<input class="inp" id="pn" value="6" size="3" inputmode="numeric"></div></div><div id="out"></div>';
      /** Écriture algébrique a + bi ; cTex.approx indique si une partie a été arrondie. */
      function cTex(re, im) {
        cTex.approx = false;
        if (Math.abs(re) < 1e-12) re = 0;
        if (Math.abs(im) < 1e-12) im = 0;
        var fr = rationnel(re, 1000), fi = rationnel(im, 1000);
        var sr = !fr ? rationnel(re * re, 1000) : null;
        var R = fr ? fr.tex() : (sr && sqrtExact(sr) ? (re < 0 ? '-' : '') + sqrtExact(sr) : fmt(re, 4));
        if (!fr && !(sr && sqrtExact(sr))) cTex.approx = true;
        var I = fi ? fi : null;
        if (im === 0) return R;
        var it = I ? (I.abs().equals(1) ? '' : I.abs().tex()) : fmt(Math.abs(im), 4);
        var sq = !I ? rationnel(im * im, 1000) : null;
        if (!I && sq) { var s = sqrtExact(sq); if (s) it = s; }
        if (!I && !(sq && sqrtExact(sq))) cTex.approx = true;
        var sgn = im < 0 ? '-' : '+';
        if (re === 0) return (im < 0 ? '-' : '') + it + 'i';
        return R + ' ' + sgn + ' ' + it + 'i';
      }
      function eg(re, im) { var t = cTex(re, im); return (cTex.approx ? ' \\approx ' : ' = ') + t; }
      function modTex(re, im) {
        var m2 = rationnel(re * re + im * im, 1000);
        var s = m2 ? sqrtExact(m2) : null;
        return s || fmt(Math.sqrt(re * re + im * im), 4);
      }
      function argTex(re, im) {
        if (re === 0 && im === 0) return '\\text{non défini}';
        var t = Math.atan2(im, re);
        return enPi(t) || fmt(t, 4);
      }
      function run() {
        var out = main.querySelector('#out');
        try {
          var a1 = lire(main.querySelector('#a1').value).v, b1 = lire(main.querySelector('#b1').value).v;
          var a2 = lire(main.querySelector('#a2').value).v, b2 = lire(main.querySelector('#b2').value).v;
          var n = parseInt(main.querySelector('#pn').value, 10) || 1;
          var m1 = Math.hypot(a1, b1), t1 = Math.atan2(b1, a1);
          var h = '<div class="grid g2"><div class="card"><h2>' + md('$z_1' + eg(a1, b1) + '$') + '</h2>' +
            '<p>' + md('Module : $|z_1| = \\sqrt{a^2 + b^2} = ' + modTex(a1, b1) + '$') + '</p>' +
            '<p>' + md('Argument principal : $\\arg z_1 = ' + argTex(a1, b1) + '$' + (m1 ? ' $\\approx ' + fmt(t1 * 180 / Math.PI, 2) + '^\\circ$' : '')) + '</p>' +
            (m1 ? '<p>' + md('Forme trigonométrique : $z_1 = ' + modTex(a1, b1) + '\\left(\\cos ' + argTex(a1, b1) + ' + i \\sin ' + argTex(a1, b1) + '\\right)$') + '</p>' +
              '<p>' + md('Forme exponentielle : $z_1 = ' + modTex(a1, b1) + '\\, e^{i' + argTex(a1, b1).replace(/\\dfrac/g, '\\frac') + '}$') + '</p>' : '') +
            '<p>' + md('Conjugué : $\\overline{z_1}' + eg(a1, -b1) + '$') + '</p></div>';
          var pr = [a1 * a2 - b1 * b2, a1 * b2 + b1 * a2], d = a2 * a2 + b2 * b2;
          var qu = d ? [(a1 * a2 + b1 * b2) / d, (b1 * a2 - a1 * b2) / d] : null;
          var pw = [Math.pow(m1, n) * Math.cos(n * t1), Math.pow(m1, n) * Math.sin(n * t1)];
          h += '<div class="card"><h2>Opérations</h2><p>' + md('$z_1 + z_2' + eg(a1 + a2, b1 + b2) + '$') + '</p><p>' + md('$z_1 - z_2' + eg(a1 - a2, b1 - b2) + '$') + '</p>' +
            '<p>' + md('$z_1 \\times z_2' + eg(pr[0], pr[1]) + '$') + '</p>' +
            (qu ? '<p>' + md('$\\dfrac{z_1}{z_2} = \\dfrac{z_1 \\overline{z_2}}{|z_2|^2}' + eg(qu[0], qu[1]) + '$') + '</p>' : '') +
            '<p>' + md('Formule de Moivre : $z_1^{' + n + '} = ' + modTex(a1, b1) + '^{' + n + '} e^{i \\cdot ' + n + ' \\arg z_1}' + eg(EM.ar.round(pw[0], 9), EM.ar.round(pw[1], 9)) + '$') + '</p></div></div>';
          var pts = [[0, 0], [a1, b1], [a2, b2]];
          var f = EM.fig.fit(pts.concat([[-1, -1], [1, 1]]), { w: 300, h: 260, pad: 30 });
          f.axes({ grid: false, labels: false });
          f.vector([0, 0], [a1, b1], { accent: true }).point([a1, b1], 'M₁', 'ne', { accent: true });
          f.vector([0, 0], [a2, b2]).point([a2, b2], 'M₂', 'ne');
          f.title = 'Images de z1 et z2 dans le plan complexe';
          h += '<div class="card"><h2>Plan complexe</h2><div class="exo-figure">' + f.svg() + '</div></div>';
          out.innerHTML = h;
          EM.ui.badges(EM.store.outil('complexes'));
        } catch (e) { out.innerHTML = '<div class="card pitfall">' + esc(e.message) + '</div>'; }
      }
      main.querySelector('.card').addEventListener('input', run);
      run();
    }
  };

  /* =================== Cercle trigonométrique =================== */
  var REMARQUABLES = {
    0: ['1', '0', '0'], 30: ['\\dfrac{\\sqrt{3}}{2}', '\\dfrac{1}{2}', '\\dfrac{\\sqrt{3}}{3}'], 45: ['\\dfrac{\\sqrt{2}}{2}', '\\dfrac{\\sqrt{2}}{2}', '1'],
    60: ['\\dfrac{1}{2}', '\\dfrac{\\sqrt{3}}{2}', '\\sqrt{3}'], 90: ['0', '1', '\\text{non défini}']
  };
  function valeurExacte(deg) {
    var d = ((deg % 360) + 360) % 360;
    var ref = d % 180, sinNeg = d > 180, cosNeg = d > 90 && d < 270;
    var base = ref > 90 ? 180 - ref : ref;
    if (!REMARQUABLES[base]) return null;
    var r = REMARQUABLES[base];
    function sg(t, neg) { return neg && t !== '0' ? '-' + t : t; }
    var tanNeg = (cosNeg !== sinNeg) && base !== 0 && base !== 90;
    return [sg(r[0], cosNeg), sg(r[1], sinNeg), base === 90 ? r[2] : sg(r[2], tanNeg)];
  }
  EM.labo.trigo = {
    nom: 'Cercle trigonométrique', ico: '⭕', desc: 'Fais tourner un point sur le cercle : cosinus, sinus, tangente, radians, valeurs exactes.',
    render: function (main) {
      main.innerHTML = crumbs('⭕ Cercle trigonométrique') + '<div class="grid g2"><div class="card"><div id="svg" class="exo-figure"></div>' +
        '<label class="field">Angle en degrés : <span id="dv"></span><input type="range" id="ang" min="-360" max="360" step="5" value="30"></label>' +
        '<div class="row" style="margin-top:8px">' + [0, 30, 45, 60, 90, 120, 135, 150, 180, -90].map(function (a) { return '<button class="btn sm ghost" data-a="' + a + '">' + a + '°</button>'; }).join('') + '</div></div>' +
        '<div class="card"><h2>Valeurs</h2><div id="vals"></div></div></div>';
      var inp = main.querySelector('#ang');
      function draw() {
        var deg = +inp.value, t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
        main.querySelector('#dv').textContent = deg + '°';
        var f = EM.fig.create({ w: 300, h: 300, xmin: -1.4, xmax: 1.4, ymin: -1.4, ymax: 1.4 });
        f.axes({ grid: false, labels: false });
        f.circle([0, 0], 1);
        f.seg([c, 0], [c, s], { dash: true }).seg([0, s], [c, s], { dash: true });
        f.seg([0, 0], [c, s], { accent: true });
        if (Math.abs(c) > 1e-9) f.angle([1, 0], [0, 0], [c, s], '', { r: 26 });
        f.point([c, s], 'M', c >= 0 ? (s >= 0 ? 'ne' : 'se') : (s >= 0 ? 'no' : 'so'), { accent: true });
        f.point([1, 0], 'I', 'se').point([0, 1], 'J', 'ne');
        f.text([c, -0.12 * (s >= 0 ? 1 : -1)], 'cos', { small: true }).text([-0.2 * (c >= 0 ? 1 : -1), s], 'sin', { small: true });
        f.title = 'Cercle trigonométrique';
        main.querySelector('#svg').innerHTML = f.svg();
        var ex = valeurExacte(deg);
        var rad = enPi(t) || fmt(t, 4);
        var princ = Math.atan2(s, c);
        var mp = enPi(princ === -Math.PI ? Math.PI : princ) || fmt(princ, 4);
        main.querySelector('#vals').innerHTML = md('<p>Mesure en radians : $' + deg + '^\\circ = ' + rad + '$ rad</p><p>Mesure principale (dans $]-\\pi ; \\pi]$) : $' + mp + '$</p>' +
          '<p>$\\cos = ' + (ex ? ex[0] + (/sqrt/.test(ex[0]) ? ' \\approx ' + fmt(c, 4) : '') : '\\approx ' + fmt(c, 4)) + '$</p>' +
          '<p>$\\sin = ' + (ex ? ex[1] + (/sqrt/.test(ex[1]) ? ' \\approx ' + fmt(s, 4) : '') : '\\approx ' + fmt(s, 4)) + '$</p>' +
          '<p>$\\tan = ' + (Math.abs(c) < 1e-12 ? '\\text{non défini}' : ex ? ex[2] : '\\approx ' + fmt(s / c, 4)) + '$</p>' +
          '<p class="muted small">Rappel : $\\cos^2 x + \\sin^2 x = 1$ et $\\tan x = \\dfrac{\\sin x}{\\cos x}$.</p>');
      }
      inp.addEventListener('input', draw);
      main.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (b) { inp.value = b.getAttribute('data-a'); draw(); } });
      draw();
      EM.ui.badges(EM.store.outil('trigo'));
    }
  };

  /* =================== Convertisseur d'unités =================== */
  var UNITES = {
    'Longueur': [['km', 1000], ['hm', 100], ['dam', 10], ['m', 1], ['dm', 0.1], ['cm', 0.01], ['mm', 0.001]],
    'Masse': [['t', 1e6], ['q', 1e5], ['kg', 1000], ['hg', 100], ['dag', 10], ['g', 1], ['dg', 0.1], ['cg', 0.01], ['mg', 0.001]],
    'Capacité': [['kL', 1000], ['hL', 100], ['daL', 10], ['L', 1], ['dL', 0.1], ['cL', 0.01], ['mL', 0.001]],
    'Aire': [['km²', 1e6], ['ha (hm²)', 1e4], ['a (dam²)', 100], ['m² (ca)', 1], ['dm²', 0.01], ['cm²', 1e-4], ['mm²', 1e-6]],
    'Volume': [['m³', 1], ['dm³ (L)', 1e-3], ['cm³ (mL)', 1e-6], ['mm³', 1e-9], ['hL', 0.1], ['L', 1e-3]],
    'Durée': [['jour', 86400], ['h', 3600], ['min', 60], ['s', 1]],
    'Angle': [['degré', Math.PI / 180], ['radian', 1], ['grade', Math.PI / 200], ['tour', 2 * Math.PI]]
  };
  EM.labo.convertisseur = {
    nom: 'Conversions', ico: '📏', desc: 'Longueurs, masses, capacités, aires, volumes, durées, angles : tableau de conversion.',
    render: function (main) {
      var cats = Object.keys(UNITES);
      main.innerHTML = crumbs('📏 Conversions d\'unités') + '<div class="card"><div class="row"><label class="field">Grandeur<select class="inp" id="cat">' +
        cats.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label><label class="field">Valeur<input class="inp" id="val" value="2,5" size="8"></label>' +
        '<label class="field">Unité<select class="inp" id="u"></select></label></div></div><div class="card" id="out"></div>';
      var cat = main.querySelector('#cat'), u = main.querySelector('#u');
      function fillUnits() { u.innerHTML = UNITES[cat.value].map(function (x, i) { return '<option value="' + i + '"' + (x[1] === 1 ? ' selected' : '') + '>' + x[0] + '</option>'; }).join(''); }
      function run() {
        var out = main.querySelector('#out'), v;
        try { v = EM.parser.evalNum(main.querySelector('#val').value); } catch (e) { out.innerHTML = '<p class="muted">Valeur invalide.</p>'; return; }
        var list = UNITES[cat.value], base = v * list[+u.value][1];
        out.innerHTML = '<div class="table-wrap"><table class="t"><tr>' + list.map(function (x) { return '<th>' + x[0] + '</th>'; }).join('') + '</tr><tr>' +
          list.map(function (x) { var r = base / x[1]; return '<td>' + T.txt(EM.ar.round(r, Math.abs(r) < 1e-3 ? 12 : 8)) + '</td>'; }).join('') + '</tr></table></div>' +
          (cat.value === 'Longueur' || cat.value === 'Masse' || cat.value === 'Capacité' ? '<p class="small muted">Chaque unité vaut 10 fois la suivante.</p>' :
            cat.value === 'Aire' ? '<p class="small muted">Pour les aires, chaque unité vaut 100 fois la suivante (on avance de 2 colonnes).</p>' :
              cat.value === 'Volume' ? '<p class="small muted">Pour les volumes, chaque unité vaut 1 000 fois la suivante ; 1 dm³ = 1 L.</p>' : '');
        EM.ui.badges(EM.store.outil('convertisseur'));
      }
      cat.addEventListener('change', function () { fillUnits(); run(); });
      main.querySelector('.card').addEventListener('input', run);
      fillUnits(); run();
    }
  };

  /* =================== Page du labo =================== */
  var ORDRE = ['grapheur', 'calculatrice', 'second-degre', 'systemes', 'arithmetique', 'statistiques', 'probabilites', 'complexes', 'trigo', 'convertisseur'];
  EM.views.labo = function (main, parts, query) {
    var id = parts[0];
    if (id && EM.labo[id]) {
      if (id === 'grapheur') EM.ui.badges(EM.store.outil('grapheur'));
      return EM.labo[id].render(main, query) || null;
    }
    main.innerHTML = '<div class="page-head"><div><h1>🧪 Laboratoire de mathématiques</h1><p class="muted" style="margin:0">Des outils qui montrent les étapes, pour comprendre et vérifier — pas pour tricher !</p></div></div>' +
      '<div class="grid g3">' + ORDRE.filter(function (k) { return EM.labo[k]; }).map(function (k) {
        var t = EM.labo[k];
        return '<a class="tile" href="#/labo/' + k + '"><span class="ico" aria-hidden="true">' + t.ico + '</span><span><h3>' + esc(t.nom) + '</h3><p>' + esc(t.desc) + '</p></span></a>';
      }).join('') + '</div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
