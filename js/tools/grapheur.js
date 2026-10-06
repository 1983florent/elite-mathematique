/*
 * Grapheur de fonctions : plusieurs courbes, déplacement et zoom (souris, molette, doigts),
 * lecture des coordonnées, courbe dérivée, tableau de valeurs,
 * et recherche automatique des points remarquables (zéros, extremums, intersections).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;
  EM.labo = EM.labo || {};

  var COULEURS = ['#1e5bd8', '#d1495b', '#2a9d8f', '#e9a03b', '#8e44ad'];

  function niceStep(range, px) {
    var raw = range / Math.max(2, px / 70);
    var p = Math.pow(10, Math.floor(Math.log10(raw)));
    var m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function fmt(x) {
    if (!isFinite(x)) return '—';
    var a = Math.abs(x);
    var d = a >= 100 ? 1 : a >= 1 ? 3 : 4;
    return EM.T.txt(EM.ar.round(x, d));
  }
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  /** Recherche d'un zéro par dichotomie sur [a, b] (changement de signe). */
  function bisect(f, a, b) {
    var fa = f(a);
    if (fa === 0) return a;
    for (var i = 0; i < 60; i++) {
      var m = (a + b) / 2, fm = f(m);
      if (!isFinite(fm)) return NaN;
      if (fm === 0) return m;
      if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else b = m;
    }
    return (a + b) / 2;
  }
  function deriv(f, x) { var h = 1e-5 * Math.max(1, Math.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }

  /** Points remarquables de f sur [a, b]. */
  function analyse(f, a, b) {
    var N = 800, res = { zeros: [], extremums: [] };
    var prevX = a, prevY = f(a), prevD = deriv(f, a);
    var lastSignX = a, lastSign = Math.abs(prevD) > 1e-9 ? Math.sign(prevD) : 0;
    for (var i = 1; i <= N; i++) {
      var x = a + (b - a) * i / N, y = f(x), dd = deriv(f, x);
      // changement de signe de la dérivée (on ignore les points où elle s'annule exactement)
      var sgn = isFinite(dd) && Math.abs(dd) > 1e-9 ? Math.sign(dd) : 0;
      if (sgn && lastSign && sgn !== lastSign && isFinite(y)) {
        var xe = bisect(function (t) { return deriv(f, t); }, lastSignX, x);
        var ye = f(xe);
        if (isFinite(ye)) res.extremums.push({ x: xe, y: ye, type: lastSign > 0 ? 'maximum' : 'minimum' });
      }
      if (sgn) { lastSign = sgn; lastSignX = x; }
      if (!isFinite(dd)) lastSign = 0;
      if (isFinite(y) && isFinite(prevY)) {
        if (y === 0) res.zeros.push(x);
        else if (prevY * y < 0 && Math.abs(y - prevY) < 1e3 * ((b - a) / N + Math.abs(prevY) + Math.abs(y))) {
          var z = bisect(f, prevX, x);
          if (isFinite(z) && Math.abs(f(z)) < 1e-6 * Math.max(1, Math.abs(prevY) + Math.abs(y))) res.zeros.push(z);
        }
      }
      prevX = x; prevY = y; prevD = dd;
    }
    res.zeros = res.zeros.filter(function (z, i, arr) { return i === 0 || Math.abs(z - arr[i - 1]) > 1e-6; });
    return res;
  }

  EM.labo.grapheur = {
    nom: 'Grapheur', ico: '📈', desc: 'Tracer des courbes, zoomer, lire des valeurs, trouver zéros, extremums et intersections.',
    render: function (main, query) {
      var fns = query.f ? query.f.split('|') : ['x^2 - 2x - 3', '', ''];
      while (fns.length < 3) fns.push('');
      main.innerHTML = '<div class="crumbs"><a href="#/labo">← Labo</a></div><h1>📈 Grapheur</h1>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start">' +
        '<div class="card"><div class="fns">' + fns.map(function (f, i) {
          return '<div class="fn-row"><span class="swatch" style="background:' + COULEURS[i] + '"></span><label class="sr" for="fn' + i + '">Fonction ' + (i + 1) + '</label>' +
            '<span class="small" style="width:40px">' + 'fgh'[i] + '(x) =</span><input class="inp" id="fn' + i + '" value="' + esc(f) + '" placeholder="ex. : ' + ['sin(x)', '1/x', 'e^x'][i] + '"></div>' +
            '<div class="q-preview small" id="pv' + i + '"></div>';
        }).join('') + '</div>' +
        '<label class="check"><input type="checkbox" id="deriv"> Tracer la dérivée $f\'$ (pointillés)</label>' +
        '<div class="row"><button class="btn sm ghost" data-z="in">Zoom +</button><button class="btn sm ghost" data-z="out">Zoom −</button><button class="btn sm ghost" data-z="reset">Recentrer</button><button class="btn sm ghost" data-z="ortho">Repère orthonormé</button></div>' +
        '<p class="small muted" style="margin-top:8px">Glisse pour te déplacer, molette ou deux doigts pour zoomer. Fonctions : sqrt, ln, exp ou e^, sin, cos, tan, abs, π.</p></div>' +
        '<div><div class="plot-wrap"><canvas aria-label="Représentation graphique des fonctions"></canvas><div class="plot-info" id="info">—</div></div></div></div>' +
        '<div class="grid g2"><div class="card"><h2>Points remarquables de $f$</h2><div id="ana" class="small"></div></div>' +
        '<div class="card"><h2>Tableau de valeurs de $f$</h2><div class="row small"><label>de <input class="inp" id="ta" value="-3" size="4"></label><label>à <input class="inp" id="tb" value="3" size="4"></label><label>pas <input class="inp" id="tp" value="1" size="4"></label></div><div id="tab" class="table-wrap" style="margin-top:8px"></div></div></div>';
      Array.prototype.forEach.call(main.querySelectorAll('h2, .check'), function (el) { el.innerHTML = EM.md(el.innerHTML); });

      var canvas = main.querySelector('canvas'), ctx = canvas.getContext('2d');
      var view = { xmin: -8, xmax: 8, ymin: -6, ymax: 6 };
      var compiled = [];
      var W = 0, H = 0, dpr = 1;

      function compileAll() {
        compiled = fns.map(function (s, i) {
          var pv = main.querySelector('#pv' + i);
          if (!s.trim()) { pv.innerHTML = ''; return null; }
          try {
            var p = EM.parser.parse(s, ['x']);
            pv.innerHTML = EM.render.tex('fgh'[i] + '(x) = ' + p.tex());
            return function (x) { try { return p.eval({ x: x }); } catch (e) { return NaN; } };
          } catch (e) { pv.innerHTML = '<span class="err">' + esc(e.message) + '</span>'; return null; }
        });
      }
      function resize() {
        dpr = window.devicePixelRatio || 1;
        var r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      }
      function X(x) { return (x - view.xmin) / (view.xmax - view.xmin) * W; }
      function Y(y) { return (view.ymax - y) / (view.ymax - view.ymin) * H; }
      function invX(px) { return view.xmin + px / W * (view.xmax - view.xmin); }
      function invY(py) { return view.ymax - py / H * (view.ymax - view.ymin); }

      function drawCurve(f, color, dashed) {
        ctx.strokeStyle = color; ctx.lineWidth = 2.2;
        ctx.setLineDash(dashed ? [6, 5] : []);
        ctx.beginPath();
        var pen = false, prev = null, n = Math.ceil(W * 1.5);
        var span = view.ymax - view.ymin;
        for (var i = 0; i <= n; i++) {
          var x = view.xmin + (view.xmax - view.xmin) * i / n, y = f(x);
          if (!isFinite(y) || Math.abs(y) > 1e6) { pen = false; prev = null; continue; }
          if (prev !== null && Math.abs(y - prev) > span * 2) pen = false; // asymptote verticale
          var py = Y(y);
          if (pen) ctx.lineTo(X(x), py); else ctx.moveTo(X(x), py);
          pen = true; prev = y;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      function draw() {
        if (!W) return;
        var text = cssVar('--text', '#222'), muted = cssVar('--muted', '#777'), grid = cssVar('--fig-grid', 'rgba(0,0,0,.08)');
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = cssVar('--surface', '#fff'); ctx.fillRect(0, 0, W, H);
        var sx = niceStep(view.xmax - view.xmin, W), sy = niceStep(view.ymax - view.ymin, H);
        ctx.lineWidth = 1; ctx.strokeStyle = grid;
        ctx.beginPath();
        for (var gx = Math.ceil(view.xmin / sx) * sx; gx <= view.xmax; gx += sx) { ctx.moveTo(X(gx), 0); ctx.lineTo(X(gx), H); }
        for (var gy = Math.ceil(view.ymin / sy) * sy; gy <= view.ymax; gy += sy) { ctx.moveTo(0, Y(gy)); ctx.lineTo(W, Y(gy)); }
        ctx.stroke();
        // axes
        ctx.strokeStyle = muted; ctx.lineWidth = 1.3;
        ctx.beginPath();
        var ax = Math.min(Math.max(Y(0), 0), H), ay = Math.min(Math.max(X(0), 0), W);
        ctx.moveTo(0, ax); ctx.lineTo(W, ax); ctx.moveTo(ay, 0); ctx.lineTo(ay, H);
        ctx.stroke();
        ctx.fillStyle = muted; ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (var lx = Math.ceil(view.xmin / sx) * sx; lx <= view.xmax; lx += sx) {
          if (Math.abs(lx) < sx / 2) continue;
          ctx.fillText(fmt(lx), X(lx), Math.min(ax + 4, H - 14));
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (var ly = Math.ceil(view.ymin / sy) * sy; ly <= view.ymax; ly += sy) {
          if (Math.abs(ly) < sy / 2) continue;
          ctx.fillText(fmt(ly), Math.max(ay - 4, 30), Y(ly));
        }
        compiled.forEach(function (f, i) { if (f) drawCurve(f, COULEURS[i]); });
        if (compiled[0] && main.querySelector('#deriv').checked) {
          var f0 = compiled[0];
          drawCurve(function (x) { return deriv(f0, x); }, COULEURS[0], true);
        }
        // points remarquables de f
        if (compiled[0]) {
          var a = analyse(compiled[0], view.xmin, view.xmax);
          ctx.fillStyle = text;
          a.zeros.forEach(function (z) { dot(z, 0, COULEURS[0]); });
          a.extremums.forEach(function (e) { dot(e.x, e.y, COULEURS[0]); });
        }
        if (cursor) {
          ctx.strokeStyle = muted; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(X(cursor.x), 0); ctx.lineTo(X(cursor.x), H); ctx.stroke(); ctx.setLineDash([]);
          compiled.forEach(function (f, i) { if (f) { var y = f(cursor.x); if (isFinite(y)) dot(cursor.x, y, COULEURS[i]); } });
        }
      }
      function dot(x, y, c) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(x), Y(y), 4, 0, 2 * Math.PI); ctx.fill();
      }

      function analyseHtml() {
        var out = main.querySelector('#ana');
        if (!compiled[0]) { out.innerHTML = '<p class="muted">Saisis une fonction $f$.</p>'; out.innerHTML = EM.md(out.innerHTML); return; }
        var a = analyse(compiled[0], view.xmin, view.xmax);
        var h = '<p class="muted">Sur la fenêtre affichée $x \\in [' + EM.T.num(EM.ar.round(view.xmin, 2)) + ' ; ' + EM.T.num(EM.ar.round(view.xmax, 2)) + ']$ (valeurs approchées) :</p>';
        h += '<p><strong>Zéros de $f$ :</strong> ' + (a.zeros.length ? a.zeros.map(function (z) { return '$x \\approx ' + EM.T.num(EM.ar.round(z, 4)) + '$'; }).join(' ; ') : 'aucun') + '</p>';
        h += '<p><strong>Extremums locaux :</strong> ' + (a.extremums.length ? a.extremums.map(function (e) {
          return e.type + ' $\\approx ' + EM.T.num(EM.ar.round(e.y, 4)) + '$ en $x \\approx ' + EM.T.num(EM.ar.round(e.x, 4)) + '$';
        }).join(' ; ') : 'aucun') + '</p>';
        [1, 2].forEach(function (j) {
          if (!compiled[j]) return;
          var g = compiled[j], f = compiled[0];
          var inter = analyse(function (x) { return f(x) - g(x); }, view.xmin, view.xmax).zeros;
          h += '<p><strong>Intersections de $C_f$ et $C_' + 'fgh'[j] + '$ :</strong> ' + (inter.length ? inter.map(function (x) {
            return '$(' + EM.T.num(EM.ar.round(x, 4)) + ' ; ' + EM.T.num(EM.ar.round(f(x), 4)) + ')$';
          }).join(' ; ') : 'aucune') + '</p>';
        });
        out.innerHTML = EM.md(h);
      }
      function tableHtml() {
        var out = main.querySelector('#tab'), f = compiled[0];
        if (!f) { out.innerHTML = ''; return; }
        var a, b, p;
        try { a = EM.parser.evalNum(main.querySelector('#ta').value); b = EM.parser.evalNum(main.querySelector('#tb').value); p = EM.parser.evalNum(main.querySelector('#tp').value); } catch (e) { out.innerHTML = '<p class="muted">Bornes invalides.</p>'; return; }
        if (!(p > 0) || b < a || (b - a) / p > 60) { out.innerHTML = '<p class="muted">Choisis au plus 60 valeurs.</p>'; return; }
        var xs = [];
        for (var x = a; x <= b + 1e-9; x += p) xs.push(EM.ar.round(x, 8));
        out.innerHTML = '<table class="t"><tr><th>$x$</th>' + xs.map(function (x) { return '<td>' + fmt(x) + '</td>'; }).join('') + '</tr><tr><th>$f(x)$</th>' +
          xs.map(function (x) { return '<td>' + fmt(f(x)) + '</td>'; }).join('') + '</tr></table>';
        out.innerHTML = EM.md(out.innerHTML);
      }
      var cursor = null;
      function update() {
        fns = [0, 1, 2].map(function (i) { return main.querySelector('#fn' + i).value; });
        compileAll(); draw(); analyseHtml(); tableHtml();
        try { history.replaceState(null, '', '#/labo/grapheur?f=' + encodeURIComponent(fns.join('|'))); } catch (e) { /* rien */ }
      }
      main.querySelector('.fns').addEventListener('input', update);
      main.querySelector('#deriv').addEventListener('change', draw);
      ['#ta', '#tb', '#tp'].forEach(function (s) { main.querySelector(s).addEventListener('input', tableHtml); });

      function zoom(k, cx, cy) {
        cx = cx == null ? (view.xmin + view.xmax) / 2 : cx;
        cy = cy == null ? (view.ymin + view.ymax) / 2 : cy;
        view = { xmin: cx + (view.xmin - cx) * k, xmax: cx + (view.xmax - cx) * k, ymin: cy + (view.ymin - cy) * k, ymax: cy + (view.ymax - cy) * k };
        draw(); analyseHtml();
      }
      main.addEventListener('click', function (e) {
        var b = e.target.closest('[data-z]');
        if (!b) return;
        var z = b.getAttribute('data-z');
        if (z === 'in') zoom(0.7);
        else if (z === 'out') zoom(1 / 0.7);
        else if (z === 'reset') { view = { xmin: -8, xmax: 8, ymin: -6, ymax: 6 }; ortho(); }
        else ortho();
      });
      function ortho() {
        var cy = (view.ymin + view.ymax) / 2, half = (view.xmax - view.xmin) / W * H / 2;
        view.ymin = cy - half; view.ymax = cy + half;
        draw(); analyseHtml();
      }

      // déplacement / zoom au doigt
      var pointers = {}, last = null, pinch = null;
      canvas.addEventListener('pointerdown', function (e) {
        canvas.setPointerCapture(e.pointerId);
        pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
        last = { x: e.offsetX, y: e.offsetY };
        var ids = Object.keys(pointers);
        if (ids.length === 2) {
          var p1 = pointers[ids[0]], p2 = pointers[ids[1]];
          pinch = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y), view: Object.assign({}, view) };
        }
      });
      canvas.addEventListener('pointermove', function (e) {
        var info = main.querySelector('#info');
        var x = invX(e.offsetX), y = invY(e.offsetY);
        if (pointers[e.pointerId]) {
          pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
          var ids = Object.keys(pointers);
          if (ids.length === 2 && pinch) {
            var p1 = pointers[ids[0]], p2 = pointers[ids[1]];
            var d = Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1;
            var k = pinch.d / d;
            var v = pinch.view, mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
            var cx = v.xmin + mx / W * (v.xmax - v.xmin), cy = v.ymax - my / H * (v.ymax - v.ymin);
            // on applique le facteur de pincement à la fenêtre du début du geste
            view = { xmin: cx + (v.xmin - cx) * k, xmax: cx + (v.xmax - cx) * k, ymin: cy + (v.ymin - cy) * k, ymax: cy + (v.ymax - cy) * k };
            draw();
            return;
          }
          if (last) {
            var dx = (e.offsetX - last.x) / W * (view.xmax - view.xmin), dy = (e.offsetY - last.y) / H * (view.ymax - view.ymin);
            view.xmin -= dx; view.xmax -= dx; view.ymin += dy; view.ymax += dy;
            last = { x: e.offsetX, y: e.offsetY };
            draw();
          }
          return;
        }
        cursor = { x: x };
        var parts2 = ['x = ' + fmt(x)];
        compiled.forEach(function (f, i) { if (f) parts2.push('fgh'[i] + '(x) = ' + fmt(f(x))); });
        info.textContent = parts2.join(' · ');
        draw();
      });
      function up(e) {
        delete pointers[e.pointerId];
        if (Object.keys(pointers).length < 2) pinch = null;
        last = null;
        analyseHtml();
      }
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);
      canvas.addEventListener('pointerleave', function () { cursor = null; draw(); });
      canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, invX(e.offsetX), invY(e.offsetY));
      }, { passive: false });

      window.addEventListener('resize', resize);
      update();
      resize();
      return function () { window.removeEventListener('resize', resize); };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
