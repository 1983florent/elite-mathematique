/*
 * ELITE MATHÉMATIQUE — démonstrations interactives : « voir » les théorèmes.
 *
 * Chaque démonstration s'enregistre avec EM.demos.register({ id, titre, chapitres, resume, render }).
 * render(el) construit l'interface dans el (div vide) et renvoie une fonction de nettoyage.
 *
 * Dessin en SVG ; toutes les couleurs viennent des variables CSS du thème (clair et sombre).
 * Interactions : Pointer Events (souris, doigt, stylet), curseurs <input type="range">,
 * et flèches du clavier sur les points déplaçables (ils sont focalisables avec Tab).
 * Les étiquettes du dessin ont un halo de la couleur var(--demo-bg, var(--surface-2)) : le fond du SVG.
 *
 * Ce fichier est aussi chargé sous Node par le banc de tests : rien n'accède à document ou
 * window en dehors des fonctions render.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  if (!EM || !EM.demos) return;

  var PI = Math.PI;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var SUBS = '₀₁₂₃₄₅₆₇₈₉';
  var PRIME = '′';
  var uid = 0;

  /* ================================================================== */
  /* Outils numériques                                                   */
  /* ================================================================== */
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function snap(x, step) { return Math.round(x / step) * step; }
  function rnd(x, d) { var p = Math.pow(10, d); return Math.round(x * p) / p; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function rad(d) { return d * PI / 180; }
  function deg(r) { return r * 180 / PI; }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function unit(v) { var n = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1; return [v[0] / n, v[1] / n]; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function sum(arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s; }
  /** Angle géométrique en degrés (entre 0 et 180) entre deux vecteurs. */
  function angDeg(u, v) {
    var c = (u[0] * v[0] + u[1] * v[1]) / (Math.sqrt(u[0] * u[0] + u[1] * u[1]) * Math.sqrt(v[0] * v[0] + v[1] * v[1]));
    return deg(Math.acos(clamp(c, -1, 1)));
  }
  /** Aire d'un triangle (coordonnées mathématiques). */
  function aireTri(A, B, C) { return Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2; }
  /** Pas « rond » (1, 2 ou 5 × 10^k) supérieur ou égal à x. */
  function niceStep(x) {
    if (!(x > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log(x) / Math.LN10)), m = x / p;
    return (m <= 1.0001 ? 1 : m <= 2.0001 ? 2 : m <= 5.0001 ? 5 : 10) * p;
  }

  /* ---------- écriture des nombres à la française ---------- */
  /** d décimales fixes : « −1,50 » (signe moins typographique). */
  function nf(x, d) {
    if (!isFinite(x)) return '—';
    var s = Math.abs(x).toFixed(d == null ? 2 : d);
    if (Number(s) === 0) return s.replace('.', ',');
    return (x < 0 ? '−' : '') + s.replace('.', ',');
  }
  /** Au plus d décimales, sans zéros inutiles : « 1,5 », « 2 », « −0,25 ». */
  function nt(x, d) {
    var s = nf(x, d == null ? 2 : d);
    if (s.indexOf(',') >= 0) s = s.replace(/0+$/, '').replace(/,$/, '');
    return s;
  }
  /** « = 1,5 » si la valeur affichée est exacte, « ≈ 1,58 » sinon. */
  function eqv(x, d) { return (Math.abs(x - rnd(x, d)) < 1e-9 ? '= ' : '≈ ') + nt(x, d); }
  /** Nombre pour TeX : « 1{,}5 », « -2 ». */
  function tn(x, d) { return nt(x, d == null ? 2 : d).replace('−', '-').replace(',', '{,}'); }
  /** Indices en chiffres Unicode : u₁₂ */
  function subs(n) { return String(n).replace(/\d/g, function (c) { return SUBS.charAt(+c); }); }
  function fdeg(x) { return nt(rnd(x, 1), 1) + '°'; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function md(s) { return EM.md ? EM.md(s) : esc(s); }
  function it(s) { return '<i>' + s + '</i>'; }
  function nid(p) { uid += 1; return 'demo-' + p + '-' + uid; }
  /** ax + b en TeX (a et b décimaux). */
  function affTeX(m, p) {
    var s = '';
    if (m !== 0) s = (m === 1 ? '' : m === -1 ? '-' : tn(m)) + 'x';
    if (p !== 0 || !s) s += s ? (p < 0 ? ' - ' : ' + ') + tn(Math.abs(p)) : tn(p);
    return s;
  }
  /** mx + p en HTML (pour les équations qui changent à chaque mouvement). */
  function affHtml(m, p, d) {
    d = d == null ? 2 : d;
    var mr = rnd(m, d), pr = rnd(p, d), s = '';
    if (mr !== 0) s = (mr === 1 ? '' : mr === -1 ? '−' : nt(mr, d)) + it('x');
    if (pr !== 0 || !s) s += s ? (pr < 0 ? ' − ' : ' + ') + nt(Math.abs(pr), d) : nt(pr, d);
    return s;
  }
  /** Polynôme à coefficients décimaux en TeX : [1, -2, -3] -> x^{2} - 2x - 3 */
  function polyTeX(cs) {
    var deg0 = cs.length - 1, out = '';
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i], p = deg0 - i;
      if (Math.abs(c) < 1e-12) continue;
      var v = p === 0 ? '' : p === 1 ? 'x' : 'x^{' + p + '}';
      var coef = (Math.abs(c) === 1 && v) ? '' : tn(Math.abs(c), 3);
      out += (out ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')) + coef + v;
    }
    return out || '0';
  }
  /** Nombre complexe x + iy en texte. */
  function fmtC(x, y) {
    x = rnd(x, 2); y = rnd(y, 2);
    if (y === 0) return nt(x);
    var im = (Math.abs(y) === 1 ? '' : nt(Math.abs(y))) + it('i');
    if (x === 0) return (y < 0 ? '−' : '') + im;
    return nt(x) + (y < 0 ? ' − ' : ' + ') + im;
  }

  /* ================================================================== */
  /* Construction SVG (coordonnées écran du viewBox)                     */
  /* ================================================================== */
  var C = {
    line: 'var(--fig-line)', acc: 'var(--fig-accent)', blue: 'var(--fig-curve)', green: 'var(--ok)',
    gold: 'var(--accent)', muted: 'var(--muted)', grid: 'var(--fig-grid)', fill: 'var(--fig-fill)'
  };
  var HALO = 'paint-order:stroke;stroke:var(--demo-bg,var(--surface-2));stroke-width:4px;stroke-linejoin:round;';
  var DASH = 'stroke-dasharray:5 4;';
  function q(x) { return Math.round(x * 10) / 10; }
  function pts(arr) { return arr.map(function (p) { return q(p[0]) + ',' + q(p[1]); }).join(' '); }
  function stroke(c, w, extra) { return 'fill:none;stroke:' + c + ';stroke-width:' + (w || 2) + ';stroke-linecap:round;stroke-linejoin:round;' + (extra || ''); }
  function fill(c, op) { return 'fill:' + c + ';fill-opacity:' + (op == null ? 1 : op) + ';stroke:none;'; }
  function shape(fc, op, sc, w) { return 'fill:' + fc + ';fill-opacity:' + op + ';stroke:' + sc + ';stroke-width:' + (w || 2) + ';stroke-linejoin:round;'; }
  function line(a, b, st) { return '<line x1="' + q(a[0]) + '" y1="' + q(a[1]) + '" x2="' + q(b[0]) + '" y2="' + q(b[1]) + '" style="' + st + '"/>'; }
  function path(d, st) { return '<path d="' + d + '" style="' + st + '"/>'; }
  function polygon(arr, st) { return '<polygon points="' + pts(arr) + '" style="' + st + '"/>'; }
  function polyline(arr, st) { return '<polyline points="' + pts(arr) + '" style="' + st + '"/>'; }
  function circle(c, r, st) { return '<circle cx="' + q(c[0]) + '" cy="' + q(c[1]) + '" r="' + r + '" style="' + st + '"/>'; }
  function dot(c, col, r) { return circle(c, r || 4, fill(col || C.line)); }
  /** Texte ; o : { size, color, anchor, italic, bold, halo } */
  function text(p, s, o) {
    o = o || {};
    var st = 'font-size:' + (o.size || 14) + 'px;font-style:' + (o.italic ? 'italic' : 'normal') + ';font-weight:' + (o.bold ? 700 : 400) +
      ';fill:' + (o.color || C.line) + ';' + (o.halo === false ? 'stroke:none;' : HALO);
    return '<text x="' + q(p[0]) + '" y="' + q(p[1]) + '" text-anchor="' + (o.anchor || 'middle') + '" style="' + st + '">' + esc(s) + '</text>';
  }
  /** Étiquette posée à côté du point p, dans la direction dir (écran). */
  function lab(p, s, dir, o) {
    o = o || {};
    var u = unit(dir), k = o.k || 14, size = o.size || 15;
    var anchor = u[0] > 0.38 ? 'start' : u[0] < -0.38 ? 'end' : 'middle';
    var x = p[0] + u[0] * k, y = p[1] + u[1] * k + size * 0.36;
    if (o.F) {
      // garder l'étiquette dans le cadre (largeur estimée du texte : 0,62 em par caractère)
      var wd = String(s).length * size * 0.62, x0 = anchor === 'start' ? x : anchor === 'end' ? x - wd : x - wd / 2;
      x += clamp(x0, 3, o.F.w - 3 - wd) - x0;
      y = clamp(y, size, o.F.h - 4);
    }
    return text([x, y], s, { size: size, italic: o.italic !== false, color: o.color, anchor: anchor, bold: o.bold });
  }
  function arrow(a, b, col, w, head) {
    w = w || 2; head = head || 9;
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    var p1 = [b[0] - head * Math.cos(ang - 0.42), b[1] - head * Math.sin(ang - 0.42)];
    var p2 = [b[0] - head * Math.cos(ang + 0.42), b[1] - head * Math.sin(ang + 0.42)];
    var e = [b[0] - head * 0.6 * Math.cos(ang), b[1] - head * 0.6 * Math.sin(ang)];
    return line(a, e, stroke(col, w)) + polygon([b, p1, p2], fill(col));
  }
  /** Arc de centre c, rayon r, depuis l'angle écran a1, d'amplitude signée d (radians). */
  function arcD(c, r, a1, d) {
    var x1 = c[0] + r * Math.cos(a1), y1 = c[1] + r * Math.sin(a1);
    var x2 = c[0] + r * Math.cos(a1 + d), y2 = c[1] + r * Math.sin(a1 + d);
    return 'M' + q(x1) + ',' + q(y1) + ' A' + r + ',' + r + ' 0 ' + (Math.abs(d) > PI ? 1 : 0) + ' ' + (d > 0 ? 1 : 0) + ' ' + q(x2) + ',' + q(y2);
  }
  function sectorD(c, r, a1, d) { return 'M' + q(c[0]) + ',' + q(c[1]) + ' L' + arcD(c, r, a1, d).slice(1) + ' Z'; }
  /** Plus petit angle orienté (écran) de la direction c→p1 à la direction c→p2. */
  function wedge(c, p1, p2) {
    var a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]), a2 = Math.atan2(p2[1] - c[1], p2[0] - c[0]);
    var d = a2 - a1;
    while (d <= -PI) d += 2 * PI;
    while (d > PI) d -= 2 * PI;
    return { a1: a1, d: d, mid: a1 + d / 2 };
  }
  /** Secteur coloré + arc pour l'angle de sommet c entre les directions vers p1 et p2. */
  function angleMark(c, p1, p2, r, col, op) {
    var w = wedge(c, p1, p2);
    return path(sectorD(c, r, w.a1, w.d), fill(col, op == null ? 0.22 : op)) + path(arcD(c, r, w.a1, w.d), stroke(col, 1.5));
  }
  /** Codage d'angle droit en c (directions vers p1 et p2). */
  function rightMark(c, p1, p2, s) {
    s = s || 10;
    var u = unit([p1[0] - c[0], p1[1] - c[1]]), v = unit([p2[0] - c[0], p2[1] - c[1]]);
    return polyline([[c[0] + u[0] * s, c[1] + u[1] * s], [c[0] + (u[0] + v[0]) * s, c[1] + (u[1] + v[1]) * s], [c[0] + v[0] * s, c[1] + v[1] * s]], stroke(C.line, 1.3));
  }
  /** n petits traits au milieu de [ab] (codage de longueurs égales). */
  function ticks(a, b, n, col) {
    var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unit([b[0] - a[0], b[1] - a[1]]), v = [-u[1], u[0]], s = '';
    if (dist(a, b) < 8) return '';
    for (var i = 0; i < n; i++) {
      var off = (i - (n - 1) / 2) * 4, c = [m[0] + u[0] * off, m[1] + u[1] * off];
      s += line([c[0] - v[0] * 5, c[1] - v[1] * 5], [c[0] + v[0] * 5, c[1] + v[1] * 5], stroke(col || C.line, 1.4));
    }
    return s;
  }
  /** Chevron « > » au milieu de [ab] (codage de droites parallèles). */
  function parMark(a, b, col) {
    var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unit([b[0] - a[0], b[1] - a[1]]), v = [-u[1], u[0]];
    var tip = [m[0] + u[0] * 3, m[1] + u[1] * 3];
    return polyline([[tip[0] - u[0] * 6 + v[0] * 4.5, tip[1] - u[1] * 6 + v[1] * 4.5], tip, [tip[0] - u[0] * 6 - v[0] * 4.5, tip[1] - u[1] * 6 - v[1] * 4.5]], stroke(col, 1.7));
  }
  /** Nom de vecteur avec sa flèche (texte + petite flèche au-dessus). */
  function vecLab(p, s, col) {
    return text(p, s, { size: 15, italic: true, color: col }) + arrow([p[0] - 5, p[1] - 15], [p[0] + 7, p[1] - 15], col, 1.2, 4);
  }

  /* ================================================================== */
  /* Repère : coordonnées mathématiques -> viewBox                       */
  /* ================================================================== */
  function Frame(xmin, xmax, ymin, ymax, w, h, pad) {
    this.xmin = xmin; this.xmax = xmax; this.ymin = ymin; this.ymax = ymax;
    this.w = w; this.h = h || Math.round(w * (ymax - ymin) / (xmax - xmin));
    pad = pad || {};
    this.l = pad.l || 0; this.r = pad.r || 0; this.t = pad.t || 0; this.b = pad.b || 0;
  }
  Frame.prototype.X = function (x) { return this.l + (x - this.xmin) / (this.xmax - this.xmin) * (this.w - this.l - this.r); };
  Frame.prototype.Y = function (y) { return this.t + (this.ymax - y) / (this.ymax - this.ymin) * (this.h - this.t - this.b); };
  Frame.prototype.P = function (p) { return [this.X(p[0]), this.Y(p[1])]; };
  Frame.prototype.inv = function (px, py) {
    return [this.xmin + (px - this.l) / (this.w - this.l - this.r) * (this.xmax - this.xmin),
      this.ymax - (py - this.t) / (this.h - this.t - this.b) * (this.ymax - this.ymin)];
  };
  /** Chemin SVG de la courbe de f sur [a, b]. */
  Frame.prototype.curve = function (f, a, b, n) {
    if (a == null) a = this.xmin;
    if (b == null) b = this.xmax;
    n = n || 200;
    var d = '', pen = false, span = this.ymax - this.ymin, lo = this.ymin - span, hi = this.ymax + span;
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y) || y < lo - 20 * span || y > hi + 20 * span) { pen = false; continue; }
      y = clamp(y, lo, hi);
      d += (pen ? 'L' : 'M') + q(this.X(x)) + ',' + q(this.Y(y));
      pen = true;
    }
    return d;
  };
  /** Deux points écran éloignés sur la droite (AB) : le SVG coupe ce qui dépasse. */
  Frame.prototype.lineThrough = function (A, B) {
    var a = this.P(A), b = this.P(B), u = [b[0] - a[0], b[1] - a[1]], n = Math.sqrt(u[0] * u[0] + u[1] * u[1]);
    if (n < 1e-9) return null;
    var L = 3 * (this.w + this.h);
    return [[a[0] - u[0] / n * L, a[1] - u[1] / n * L], [a[0] + u[0] / n * L, a[1] + u[1] / n * L]];
  };
  function fullLine(F, A, B, st) { var L = F.lineThrough(A, B); return L ? line(L[0], L[1], st) : ''; }

  /** Quadrillage, axes fléchés et graduations. o : { gx, gy, lx, ly, grid, labels, xname, yname } */
  function axes(F, o) {
    o = o || {};
    var s = '', i, x, y, gx = o.gx || 1, gy = o.gy || gx, lx = o.lx || gx, ly = o.ly || gy;
    var GRID = 'stroke:var(--fig-grid);stroke-width:1';
    if (o.grid !== false) {
      for (i = Math.ceil(F.xmin / gx - 1e-9); i * gx <= F.xmax + 1e-9; i++) { x = F.X(i * gx); s += line([x, F.Y(F.ymax)], [x, F.Y(F.ymin)], GRID); }
      for (i = Math.ceil(F.ymin / gy - 1e-9); i * gy <= F.ymax + 1e-9; i++) { y = F.Y(i * gy); s += line([F.X(F.xmin), y], [F.X(F.xmax), y], GRID); }
    }
    var showX = F.ymin <= 0 && F.ymax >= 0, showY = F.xmin <= 0 && F.xmax >= 0, x0 = F.X(0), y0 = F.Y(0);
    if (showX) s += arrow([F.X(F.xmin), y0], [F.X(F.xmax), y0], C.muted, 1.3, 7);
    if (showY) s += arrow([x0, F.Y(F.ymin)], [x0, F.Y(F.ymax)], C.muted, 1.3, 7);
    if (o.labels !== false) {
      var T = { size: 12, color: C.muted };
      if (showX) {
        for (i = Math.ceil(F.xmin / lx - 1e-9); i * lx < F.xmax - 1e-9; i++) {
          x = F.X(i * lx);
          if (i === 0 || x < F.l + 8 || x > F.w - F.r - 12) continue;
          s += line([x, y0 - 3], [x, y0 + 3], stroke(C.muted, 1)) + text([x, y0 + 15], nt(i * lx, 2), T);
        }
      }
      if (showY) {
        for (i = Math.ceil(F.ymin / ly - 1e-9); i * ly < F.ymax - 1e-9; i++) {
          y = F.Y(i * ly);
          if (i === 0 || y > F.h - F.b - 8 || y < F.t + 12) continue;
          s += line([x0 - 3, y], [x0 + 3, y], stroke(C.muted, 1)) +
            text([x0 - 6, y + 4], nt(i * ly, 2), { size: 12, color: C.muted, anchor: 'end' });
        }
      }
      if (showX && showY) s += text([x0 - 6, y0 + 15], 'O', { size: 12, color: C.muted, anchor: 'end' });
    }
    if (o.xname && showX) s += text([F.X(F.xmax) - 4, y0 - 8], o.xname, { size: 13, italic: true, anchor: 'end', color: C.muted });
    if (o.yname && showY) s += text([x0 + 8, F.Y(F.ymax) + 13], o.yname, { size: 13, italic: true, anchor: 'start', color: C.muted });
    return s;
  }
  function gridOnly(F, step) {
    var s = '', i, GRID = 'stroke:var(--fig-grid);stroke-width:1';
    for (i = Math.ceil(F.xmin / step); i * step <= F.xmax; i++) s += line([F.X(i * step), 0], [F.X(i * step), F.h], GRID);
    for (i = Math.ceil(F.ymin / step); i * step <= F.ymax; i++) s += line([0, F.Y(i * step)], [F.w, F.Y(i * step)], GRID);
    return s;
  }

  /* ================================================================== */
  /* Scène : SVG + points déplaçables (souris, doigt, clavier)           */
  /* ================================================================== */
  function Stage(svg, F) {
    var self = this;
    this.svg = svg; this.F = F; this.handles = []; this.active = null; this.off = [0, 0];
    this.onchange = null; this.onTap = null; this.fallback = null; this.onend = null;
    this.L = {};
    var gs = svg.querySelectorAll('g[data-l]');
    for (var i = 0; i < gs.length; i++) this.L[gs[i].getAttribute('data-l')] = gs[i];
    this.ev = {
      down: function (e) { self.down(e); },
      move: function (e) { self.move(e); },
      up: function (e) { self.up(e); }
    };
    svg.addEventListener('pointerdown', this.ev.down);
    svg.addEventListener('pointermove', this.ev.move);
    svg.addEventListener('pointerup', this.ev.up);
    svg.addEventListener('pointercancel', this.ev.up);
  }
  Stage.prototype.draw = function (layer, html) { this.L[layer].innerHTML = html; };
  /** Position du pointeur dans le repère du viewBox. */
  Stage.prototype.local = function (e) {
    var m = this.svg.getScreenCTM();
    if (!m) return [0, 0];
    var p = this.svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    p = p.matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  /** Rayon de prise (≈ 28 px à l'écran, confortable au doigt). */
  Stage.prototype.grabR = function () {
    var m = this.svg.getScreenCTM(), s = m ? Math.abs(m.a) : 1;
    return Math.max(14, 28 / (s || 1));
  };
  Stage.prototype.nearest = function (p, R) {
    var best = null, bd = R;
    for (var i = this.handles.length - 1; i >= 0; i--) {
      var h = this.handles[i];
      if (h.hidden) continue;
      var d = dist(this.F.P(h.get()), p);
      if (d < bd) { bd = d; best = h; }
    }
    return best;
  };
  Stage.prototype.down = function (e) {
    if (e.button != null && e.button > 0) return;
    var p = this.local(e), h = this.nearest(p, this.grabR());
    this.off = [0, 0];
    if (h) { var c = this.F.P(h.get()); this.off = [c[0] - p[0], c[1] - p[1]]; }
    else if (this.onTap) { this.onTap(this.F.inv(p[0], p[1]), p, e); return; }
    else if (this.fallback && !this.fallback.hidden) h = this.fallback;
    else return;
    this.active = h;
    h.halo.setAttribute('r', '19');
    try { this.svg.setPointerCapture(e.pointerId); } catch (err) { /* capture indisponible : on continue sans */ }
    e.preventDefault();
    this.drag(p);
  };
  Stage.prototype.drag = function (p) {
    var m = this.F.inv(p[0] + this.off[0], p[1] + this.off[1]);
    this.active.set(m[0], m[1]);
    this.changed();
  };
  Stage.prototype.move = function (e) {
    if (!this.active) {
      if (e.pointerType === 'mouse') {
        var near = this.nearest(this.local(e), this.grabR());
        this.svg.style.cursor = near ? 'grab' : (this.onTap || this.fallback ? 'pointer' : '');
      }
      return;
    }
    e.preventDefault();
    this.drag(this.local(e));
  };
  Stage.prototype.up = function (e) {
    if (!this.active) return;
    this.active.halo.setAttribute('r', '14');
    this.active = null;
    try { this.svg.releasePointerCapture(e.pointerId); } catch (err) { /* déjà relâché */ }
    if (this.onend) this.onend();
  };
  /**
   * Point déplaçable. o : { label, get() -> [x, y], set(x, y), key(dx, dy) facultatif,
   * step (pas des flèches, défaut 0,1), color }
   */
  Stage.prototype.handle = function (o) {
    var self = this, col = o.color || C.acc;
    var g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', o.label + ' (flèches du clavier pour le déplacer)');
    g.setAttribute('style', 'cursor:grab;outline:none');
    var halo = document.createElementNS(SVGNS, 'circle');
    halo.setAttribute('r', '14');
    halo.setAttribute('style', 'fill:' + col + ';fill-opacity:.2;stroke:var(--gold);stroke-width:0');
    var core = document.createElementNS(SVGNS, 'circle');
    core.setAttribute('r', String(o.r || 6));
    core.setAttribute('style', 'fill:' + col + ';stroke:var(--demo-bg,var(--surface-2));stroke-width:2');
    g.appendChild(halo);
    g.appendChild(core);
    this.L.h.appendChild(g);
    var h = { el: g, halo: halo, get: o.get, set: o.set, key: o.key, step: o.step || 0.1, hidden: false };
    g.addEventListener('keydown', function (e) {
      var dx = 0, dy = 0;
      if (e.key === 'ArrowRight') dx = 1;
      else if (e.key === 'ArrowLeft') dx = -1;
      else if (e.key === 'ArrowUp') dy = 1;
      else if (e.key === 'ArrowDown') dy = -1;
      else return;
      e.preventDefault();
      var k = e.shiftKey ? 5 : 1;
      if (h.key) h.key(dx * k, dy * k);
      else { var p = h.get(); h.set(p[0] + dx * k * h.step, p[1] + dy * k * h.step); }
      self.changed();
    });
    g.addEventListener('focus', function () { halo.style.strokeWidth = '3'; });
    g.addEventListener('blur', function () { halo.style.strokeWidth = '0'; });
    this.handles.push(h);
    return h;
  };
  /** Replace les points déplaçables (à appeler après chaque mise à jour). */
  Stage.prototype.sync = function () {
    for (var i = 0; i < this.handles.length; i++) {
      var h = this.handles[i], c = this.F.P(h.get());
      h.el.setAttribute('transform', 'translate(' + q(c[0]) + ',' + q(c[1]) + ')');
      h.el.style.display = h.hidden ? 'none' : '';
    }
  };
  Stage.prototype.changed = function () { if (this.onchange) this.onchange(); };
  Stage.prototype.destroy = function () {
    this.svg.removeEventListener('pointerdown', this.ev.down);
    this.svg.removeEventListener('pointermove', this.ev.move);
    this.svg.removeEventListener('pointerup', this.ev.up);
    this.svg.removeEventListener('pointercancel', this.ev.up);
    this.onchange = null;
  };

  /* ================================================================== */
  /* Boucle d'animation contrôlée (toujours arrêtable)                   */
  /* ================================================================== */
  function Loop(step) { this.step = step; this.on = false; this.id = 0; this.last = 0; this.onstop = null; }
  Loop.prototype.start = function () {
    if (this.on) return;
    var self = this;
    this.on = true; this.last = 0;
    function tick(ts) {
      if (!self.on) return;
      var dt = self.last ? Math.min(80, ts - self.last) : 16;
      self.last = ts;
      if (self.step(dt) === false) { self.stop(); return; }
      if (self.on) self.id = root.requestAnimationFrame(tick);
    }
    this.id = root.requestAnimationFrame(tick);
  };
  Loop.prototype.stop = function () {
    var was = this.on;
    this.on = false;
    if (this.id) root.cancelAnimationFrame(this.id);
    this.id = 0;
    if (was && this.onstop) this.onstop();
  };
  function bindPlay(btn, loop, txtPlay, txtPause, beforeStart) {
    function show() { btn.textContent = loop.on ? txtPause : txtPlay; btn.setAttribute('aria-pressed', loop.on ? 'true' : 'false'); }
    loop.onstop = show;
    btn.addEventListener('click', function () {
      if (loop.on) loop.stop();
      else { if (beforeStart) beforeStart(); loop.start(); show(); }
    });
    show();
  }

  /* ================================================================== */
  /* Gabarits d'interface                                                */
  /* ================================================================== */
  function svgTag(key, F, label, o) {
    o = o || {};
    return '<svg class="fig demo-svg" data-s="' + key + '" viewBox="0 0 ' + F.w + ' ' + F.h + '" width="100%" role="group" aria-label="' + esc(label) +
      '" xmlns="' + SVGNS + '" style="display:block;margin:0 auto;height:auto;max-width:' + (o.max || 540) +
      'px;touch-action:none;-webkit-user-select:none;user-select:none;overflow:hidden' + (o.style ? ';' + o.style : '') + '">' +
      '<g data-l="bg"></g><g data-l="main"></g><g data-l="top"></g><g data-l="h"></g></svg>';
  }
  function slider(key, label, min, max, step, val) {
    var id = nid(key);
    return '<div class="demo-control"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">' +
      '<label for="' + id + '">' + md(label) + '</label><span class="demo-val" data-v="' + key + '" aria-hidden="true"></span></div>' +
      '<input type="range" id="' + id + '" data-k="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></div>';
  }
  function selectBox(key, label, options, val) {
    var id = nid(key);
    return '<div class="demo-control"><label for="' + id + '">' + md(label) + '</label><select class="inp" id="' + id + '" data-k="' + key + '">' +
      options.map(function (o, i) { return '<option value="' + i + '"' + (i === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>';
  }
  function segmented(key, label, opts, val) {
    var id = nid(key);
    return '<div class="demo-control" style="flex-basis:100%"><span id="' + id + '">' + md(label) + '</span><div><div class="levels" role="group" aria-labelledby="' + id + '" data-seg="' + key + '">' +
      opts.map(function (o, i) { return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === val ? 'true' : 'false') + '">' + esc(o) + '</button>'; }).join('') + '</div></div></div>';
  }
  function checkbox(key, label, checked) {
    return '<label class="check" style="flex-basis:100%"><input type="checkbox" data-k="' + key + '"' + (checked ? ' checked' : '') + '> <span>' + md(label) + '</span></label>';
  }
  function button(act, label, cls) { return '<button type="button" class="btn sm ' + (cls || 'ghost') + '" data-act="' + act + '">' + label + '</button>'; }
  function buttons(html) { return '<div style="display:flex;flex-wrap:wrap;gap:8px;flex-basis:100%">' + html + '</div>'; }
  function layout(o) {
    return '<div class="demo-stage">' + o.stage + '</div>' +
      (o.controls ? '<div class="demo-controls">' + o.controls + '</div>' : '') +
      (o.readout ? '<div class="demo-readout">' + o.readout + '</div>' : '') +
      '<p class="demo-note">' + o.note + '</p>';
  }
  function outs(el) {
    var o = {}, l = el.querySelectorAll('[data-o]');
    for (var i = 0; i < l.length; i++) o[l[i].getAttribute('data-o')] = l[i];
    return o;
  }
  /** Relie un curseur : fmt(v) -> texte affiché, cb(v) à chaque changement. */
  function bindRange(el, key, fmt, cb) {
    var inp = el.querySelector('input[data-k="' + key + '"]'), out = el.querySelector('[data-v="' + key + '"]');
    function show() { var t = fmt(+inp.value); out.textContent = t; inp.setAttribute('aria-valuetext', t); }
    inp.addEventListener('input', function () { show(); cb(+inp.value); });
    show();
    return {
      input: inp,
      get: function () { return +inp.value; },
      set: function (v) { inp.value = v; show(); },
      setMax: function (m) { inp.max = m; show(); },
      refresh: show
    };
  }
  function bindSelect(el, key, cb) {
    var s = el.querySelector('select[data-k="' + key + '"]');
    s.addEventListener('change', function () { cb(+s.value); });
    return s;
  }
  function bindSeg(el, key, cb) {
    var g = el.querySelector('[data-seg="' + key + '"]');
    g.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b || !g.contains(b)) return;
      var bs = g.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
      cb(+b.getAttribute('data-i'));
    });
  }
  function onAct(el, map) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!b || !el.contains(b)) return;
      var f = map[b.getAttribute('data-act')];
      if (f) f(b, e);
    });
  }
  function sw(col, txt) { return '<span style="color:' + col + ';font-weight:700">' + txt + '</span>'; }
  var ROW = 'display:flex;flex-wrap:wrap;gap:2px 18px;align-items:baseline';

  /* ================================================================== */
  /* 1. Thalès                                                           */
  /* ================================================================== */
  EM.demos.register({
    id: 'thales-curseur',
    titre: 'Thalès en mouvement',
    chapitres: ['3e-thales', '4e-droite-milieux'],
    resume: 'Fais glisser le point M sur la droite (AB) : (MN) reste parallèle à (BC) et les trois rapports restent égaux.',
    render: function (el) {
      var A = [2.5, 5], B = [0, 0], Cc = [7, 0];
      var AB = dist(A, B), AC = dist(A, Cc), BC = dist(B, Cc);
      var TMIN = -0.5, TMAX = 1.25;
      var F = new Frame(-1.7, 9.2, -2.1, 8.4, 330);
      var st = { t: 0.6 };
      function on(P, t) { return [A[0] + t * (P[0] - A[0]), A[1] + t * (P[1] - A[1])]; }
      function row(tex, a, b, r) {
        return '<tr><td>' + md('$' + tex + '$') + '</td><td><span data-o="' + a + '"></span> ÷ <span data-o="' + b + '"></span></td><td><b data-o="' + r + '"></b></td></tr>';
      }
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Triangle ABC ; M sur la droite (AB), N sur (AC), (MN) parallèle à (BC)'),
        controls: slider('t', 'Position de $M$ sur $(AB)$', TMIN, TMAX, 0.01, st.t),
        readout: '<div class="table-wrap"><table class="t"><thead><tr><th>Rapport</th><th>Longueurs (cm)</th><th>Valeur</th></tr></thead><tbody>' +
          row('\\dfrac{AM}{AB}', 'am', 'ab', 'r1') + row('\\dfrac{AN}{AC}', 'an', 'ac', 'r2') + row('\\dfrac{MN}{BC}', 'mn', 'bc', 'r3') +
          '</tbody></table></div><p data-o="msg" style="margin:10px 0 0"></p>',
        note: md('Observe : où que soit $M$ sur $(AB)$, la parallèle à $(BC)$ passant par $M$ coupe $(AC)$ en $N$, et $\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$. ' +
          'Place $M$ au milieu de $[AB]$ : c\'est la droite des milieux. Passe de l\'autre côté de $A$ : configuration « papillon ».')
      });
      var MSG = {
        zero: md('$M$ est en $A$ : les longueurs $AM$, $AN$ et $MN$ sont nulles.'),
        mid: md('$M$ est le milieu de $[AB]$ : $N$ est le milieu de $[AC]$ et $MN = \\dfrac{BC}{2}$ (droite des milieux).'),
        one: md('$M$ est en $B$ et $N$ en $C$ : les trois rapports valent $1$.'),
        pap: md('Configuration « papillon » : $M$ et $N$ sont de l\'autre côté de $A$, les rapports restent égaux.'),
        far: md('$M$ est au-delà de $B$ : les rapports dépassent $1$ et restent égaux.'),
        seg: md('$M$ est sur le segment $[AB]$ : les trois rapports sont égaux et $(MN) \\parallel (BC)$.')
      };
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      var rT = bindRange(el, 't', function (v) { return 'AM = ' + nf(Math.abs(v) * AB) + ' cm'; }, function (v) { st.t = v; update(); });
      function setT(t, magnet) {
        t = clamp(rnd(t, 2), TMIN, TMAX);
        if (magnet) {
          if (Math.abs(t - 0.5) < 0.03) t = 0.5;
          else if (Math.abs(t - 1) < 0.03) t = 1;
          else if (Math.abs(t) < 0.03) t = 0;
        }
        st.t = t;
      }
      S.handle({
        label: 'Point M',
        get: function () { return on(B, st.t); },
        set: function (x, y) {
          var dx = B[0] - A[0], dy = B[1] - A[1];
          setT(((x - A[0]) * dx + (y - A[1]) * dy) / (dx * dx + dy * dy), true);
        },
        key: function (dx, dy) { setT(st.t + ((dx < 0 || dy < 0) ? 0.01 : -0.01) * Math.max(Math.abs(dx), Math.abs(dy))); }
      });
      S.onchange = function () { rT.set(st.t); update(); };
      S.draw('bg', fullLine(F, A, B, stroke(C.muted, 1, DASH)) + fullLine(F, A, Cc, stroke(C.muted, 1, DASH)));
      function update() {
        var t = st.t, k = Math.abs(t), M = on(B, t), N = on(Cc, t);
        var a = F.P(A), b = F.P(B), c = F.P(Cc), m = F.P(M), n = F.P(N), s = '';
        s += polygon([a, b, c], shape(C.fill, 1, C.line, 2));
        if (k > 0.004) s += polygon([a, m, n], fill(C.acc, 0.12)) + line(m, n, stroke(C.acc, 2.6));
        s += parMark(b, c, C.line);
        if (k > 0.12) s += m[0] < n[0] ? parMark(m, n, C.acc) : parMark(n, m, C.acc);
        s += dot(a) + dot(b) + dot(c) + (k > 0.004 ? dot(n, C.acc) : '');
        s += lab(a, 'A', [-1, 0]) + lab(b, 'B', [-1, 0.35]) + lab(c, 'C', [1, 0.35]);
        if (k > 0.004) {
          var dm = t > 0 ? [-0.8, -0.6] : [0.8, -0.6];
          s += lab(m, 'M', dm, { color: C.acc, k: 18 }) + lab(n, 'N', [-dm[0], dm[1]], { color: C.acc });
        }
        S.draw('main', s);
        S.sync();
        out.am.textContent = nf(k * AB); out.ab.textContent = nf(AB); out.r1.textContent = nf(k);
        out.an.textContent = nf(k * AC); out.ac.textContent = nf(AC); out.r2.textContent = nf(k);
        out.mn.textContent = nf(k * BC); out.bc.textContent = nf(BC); out.r3.textContent = nf(k);
        out.msg.innerHTML = k < 0.004 ? MSG.zero : t === 0.5 ? MSG.mid : t === 1 ? MSG.one : t < 0 ? MSG.pap : t > 1 ? MSG.far : MSG.seg;
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 2. Pythagore : les aires des carrés                                 */
  /* ================================================================== */
  function squareOn(P, Q, away) {
    var n = [-(Q[1] - P[1]), Q[0] - P[0]];
    if ((away[0] - P[0]) * n[0] + (away[1] - P[1]) * n[1] > 0) n = [-n[0], -n[1]];
    return [P, Q, [Q[0] + n[0], Q[1] + n[1]], [P[0] + n[0], P[1] + n[1]]];
  }
  function extendBox(box, list) {
    for (var i = 0; i < list.length; i++) {
      box[0] = Math.min(box[0], list[i][0]); box[1] = Math.max(box[1], list[i][0]);
      box[2] = Math.min(box[2], list[i][1]); box[3] = Math.max(box[3], list[i][1]);
    }
  }
  EM.demos.register({
    id: 'pythagore-aires',
    titre: 'Pythagore : les aires des carrés',
    chapitres: ['4e-pythagore'],
    resume: 'Déforme le triangle : quand l\'angle en A est droit, l\'aire du grand carré est exactement la somme des aires des deux autres.',
    render: function (el) {
      var LMIN = 1, LMAX = 4, TH0 = 60, TH1 = 120;
      var st = { b: 4, c: 3, th: 90 };
      function geo(b, c, th) {
        var A = [0, 0], B = [b, 0], P = [c * Math.cos(rad(th)), c * Math.sin(rad(th))];
        return { A: A, B: B, C: P, sq: [squareOn(A, B, P), squareOn(A, P, B), squareOn(B, P, A)] };
      }
      // fenêtre fixe qui contient toutes les positions possibles (pas de saut pendant le glissement)
      var box = [Infinity, -Infinity, Infinity, -Infinity];
      for (var bi = LMIN; bi <= LMAX; bi += 1) {
        for (var ci = LMIN; ci <= LMAX; ci += 1) {
          for (var ti = TH0; ti <= TH1; ti += 5) {
            var g0 = geo(bi, ci, ti);
            extendBox(box, g0.sq[0]); extendBox(box, g0.sq[1]); extendBox(box, g0.sq[2]);
          }
        }
      }
      var F = new Frame(box[0] - 0.5, box[1] + 0.5, box[2] - 0.5, box[3] + 0.5, 330);
      var COLS = [C.blue, C.green, C.acc];
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Triangle ABC et les carrés construits sur ses trois côtés'),
        controls: slider('b', 'Côté $AB$', LMIN, LMAX, 0.1, st.b) + slider('c', 'Côté $AC$', LMIN, LMAX, 0.1, st.c) +
          slider('th', 'Angle $\\widehat{BAC}$', TH0, TH1, 1, st.th),
        readout: '<div>' + md('$AB^2 + AC^2$') + ' = <span data-o="sum"></span></div>' +
          '<div>' + md('$BC^2$') + ' = <span data-o="hyp"></span></div><p data-o="msg" style="margin:8px 0 0"></p>',
        note: md('Observe les nombres écrits dans les carrés : ce sont leurs aires. Avec un angle droit en $A$, $BC^2 = AB^2 + AC^2$ ' +
          '(avec $AB = 4$ et $AC = 3$, compte les carreaux : $16 + 9 = 25$). Ouvre ou ferme l\'angle : l\'égalité devient fausse, c\'est la réciproque du théorème.')
      });
      var MSG = {
        eq: md('Égalité : le triangle $ABC$ est rectangle en $A$ (théorème de Pythagore).'),
        gt: md('$BC^2 > AB^2 + AC^2$ : l\'angle $\\widehat{BAC}$ est obtus, le triangle n\'est pas rectangle en $A$.'),
        lt: md('$BC^2 < AB^2 + AC^2$ : l\'angle $\\widehat{BAC}$ est aigu, le triangle n\'est pas rectangle en $A$.')
      };
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      var rB = bindRange(el, 'b', function (v) { return nt(v, 1); }, function (v) { st.b = v; update(); });
      var rC = bindRange(el, 'c', function (v) { return nt(v, 1); }, function (v) { st.c = v; update(); });
      var rTh = bindRange(el, 'th', function (v) { return v + '°'; }, function (v) { st.th = v; update(); });
      S.handle({
        label: 'Sommet B', color: C.blue, step: 0.1,
        get: function () { return [st.b, 0]; },
        set: function (x) { st.b = clamp(rnd(x, 1), LMIN, LMAX); },
        key: function (dx, dy) { st.b = clamp(rnd(st.b + 0.1 * (dx || dy), 1), LMIN, LMAX); }
      });
      S.handle({
        label: 'Sommet C', color: C.green,
        get: function () { return [st.c * Math.cos(rad(st.th)), st.c * Math.sin(rad(st.th))]; },
        set: function (x, y) {
          st.c = clamp(rnd(Math.sqrt(x * x + y * y), 1), LMIN, LMAX);
          var th = clamp(Math.round(deg(Math.atan2(y, x))), TH0, TH1);
          st.th = Math.abs(th - 90) <= 2 ? 90 : th;
        },
        key: function (dx, dy) {
          if (dy) st.c = clamp(rnd(st.c + 0.1 * dy, 1), LMIN, LMAX);
          if (dx) st.th = clamp(st.th - dx, TH0, TH1);
        }
      });
      S.onchange = function () { rB.set(st.b); rC.set(st.c); rTh.set(st.th); update(); };
      function squareGrid(sq, col) {
        var P = sq[0], Q = sq[1], R = sq[3], side = dist(P, Q), s = '';
        var u = [(Q[0] - P[0]) / side, (Q[1] - P[1]) / side], v = [(R[0] - P[0]) / side, (R[1] - P[1]) / side];
        var stl = stroke(col, 0.8, 'stroke-opacity:.45;');
        for (var k = 1; k < side - 1e-6; k++) {
          s += line(F.P([P[0] + k * u[0], P[1] + k * u[1]]), F.P([R[0] + k * u[0], R[1] + k * u[1]]), stl);
          s += line(F.P([P[0] + k * v[0], P[1] + k * v[1]]), F.P([Q[0] + k * v[0], Q[1] + k * v[1]]), stl);
        }
        return s;
      }
      function update() {
        var g = geo(st.b, st.c, st.th), a = F.P(g.A), b = F.P(g.B), c = F.P(g.C), s = '';
        var b2 = rnd(st.b * st.b, 2), c2 = rnd(st.c * st.c, 2);
        var a2 = st.th === 90 ? rnd(b2 + c2, 2) : st.b * st.b + st.c * st.c - 2 * st.b * st.c * Math.cos(rad(st.th));
        var areas = [b2, c2, a2];
        for (var i = 0; i < 3; i++) {
          var sq = g.sq[i];
          s += polygon(sq.map(function (p) { return F.P(p); }), shape(COLS[i], 0.13, COLS[i], 1.6)) + squareGrid(sq, COLS[i]);
          var ctr = F.P([(sq[0][0] + sq[2][0]) / 2, (sq[0][1] + sq[2][1]) / 2]);
          s += text([ctr[0], ctr[1] + 6], nt(areas[i], 2), { size: 16, bold: true, color: COLS[i] });
        }
        s += polygon([a, b, c], shape(C.fill, 1, C.line, 2.2));
        if (st.th === 90) s += rightMark(a, b, c, 11);
        else {
          var w = wedge(a, b, c);
          s += path(arcD(a, 18, w.a1, w.d), stroke(C.line, 1.3)) +
            text([a[0] + 33 * Math.cos(w.mid), a[1] + 33 * Math.sin(w.mid) + 4], st.th + '°', { size: 12 });
        }
        s += dot(a) + lab(a, 'A', [-0.75, 0.75]) + lab(b, 'B', [1, 0.45], { color: C.blue, k: 19 }) + lab(c, 'C', [0, -1], { color: C.green, k: 20 });
        S.draw('main', s);
        S.sync();
        var tot = rnd(b2 + c2, 2);
        out.sum.innerHTML = sw(C.blue, nt(b2, 2)) + ' + ' + sw(C.green, nt(c2, 2)) + ' = <b>' + nt(tot, 2) + '</b>';
        out.hyp.innerHTML = sw(C.acc, (st.th === 90 ? '' : '≈ ') + nt(a2, 2)) + ', donc ' + it('BC') + ' ' + eqv(Math.sqrt(a2), 2);
        out.msg.innerHTML = st.th === 90 ? MSG.eq : st.th > 90 ? MSG.gt : MSG.lt;
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 3. Angle inscrit et angle au centre                                 */
  /* ================================================================== */
  EM.demos.register({
    id: 'angle-inscrit',
    titre: 'Angle inscrit et angle au centre',
    chapitres: ['3e-angles-inscrits', '1s-angles-orientes'],
    resume: 'Fais glisser M sur le cercle : l\'angle inscrit AMB ne change pas et vaut la moitié de l\'angle au centre qui intercepte le même arc.',
    render: function (el) {
      var F = new Frame(-1.5, 1.5, -1.5, 1.5, 320);
      var st = { a: 215, b: 325, m: 100 };
      function P(t) { return [Math.cos(rad(t)), Math.sin(rad(t))]; }
      function cd(x, y) { var d = mod(x - y, 360); return Math.min(d, 360 - d); }
      function ok(a, b, m) { return cd(a, b) >= 12 && cd(m, a) >= 5 && cd(m, b) >= 5; }
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Cercle de centre O, points A, B et M sur le cercle', { max: 460 }),
        controls: slider('m', 'Position de $M$ sur le cercle', 0, 359, 1, st.m),
        readout: '<div>' + sw(C.blue, 'Angle inscrit') + ' ' + md('$\\widehat{AMB}$') + ' = <b data-o="ins"></b></div>' +
          '<div>' + sw(C.acc, 'Angle au centre') + ' ' + md('$\\widehat{AOB}$') + ' (même arc) = <b data-o="cen"></b></div>' +
          '<div data-o="rel"></div><p data-o="msg" style="margin:8px 0 0"></p>',
        note: md('Observe : tant que $M$ reste sur le même arc, $\\widehat{AMB}$ ne bouge pas, et l\'angle au centre qui intercepte le même arc (en rouge) vaut toujours le double : ' +
          '$\\widehat{AOB} = 2\\,\\widehat{AMB}$. Déplace $A$ ou $B$ pour changer l\'arc ; fais passer $M$ sur l\'autre arc.')
      });
      var MSG = {
        dia: md('$[AB]$ est un diamètre : $\\widehat{AMB} = 90°$, le triangle $AMB$ est rectangle en $M$.'),
        big: md('$M$ est sur le petit arc : l\'angle inscrit intercepte le grand arc, et l\'angle au centre correspondant est rentrant (plus de $180°$).'),
        std: md('Deux angles inscrits qui interceptent le même arc sont égaux.')
      };
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      var rM = bindRange(el, 'm', function (v) { return v + '°'; }, function (v) {
        var dir = mod(v - st.m, 360) < 180 ? 1 : -1;
        for (var i = 0; i < 30 && !ok(st.a, st.b, v); i++) v = mod(v + dir, 360);
        st.m = v;
        update();
      });
      function onCircle(key, label, col) {
        return S.handle({
          label: label, color: col,
          get: function () { return P(st[key]); },
          set: function (x, y) {
            var t = mod(Math.round(deg(Math.atan2(y, x))), 360), n = { a: st.a, b: st.b, m: st.m };
            n[key] = t;
            if (ok(n.a, n.b, n.m)) st[key] = t;
          },
          key: function (dx, dy) {
            var n = { a: st.a, b: st.b, m: st.m }, d = (dx || dy) > 0 ? 1 : -1;
            for (var i = 0; i < 30; i++) {
              n[key] = mod(n[key] + d, 360);
              if (ok(n.a, n.b, n.m)) { st[key] = n[key]; break; }
            }
          }
        });
      }
      onCircle('a', 'Point A', C.line);
      onCircle('b', 'Point B', C.line);
      onCircle('m', 'Point M', C.blue);
      S.onchange = function () { rM.set(st.m); update(); };
      var R = F.X(1) - F.X(0), o = F.P([0, 0]);
      S.draw('bg', circle(o, q(R), stroke(C.line, 1.8)));
      function update() {
        var A = P(st.a), B = P(st.b), M = P(st.m), a = F.P(A), b = F.P(B), m = F.P(M), s = '';
        var d = mod(st.b - st.a, 360), mm = mod(st.m - st.a, 360), start, meas;
        if (mm > 0 && mm < d) { start = st.b; meas = 360 - d; } else { start = st.a; meas = d; }
        // arc intercepté et angle au centre
        s += path(arcD(o, q(R), -rad(start), -rad(meas)), stroke(C.acc, 6, 'stroke-opacity:.5;'));
        s += path(sectorD(o, 28, -rad(start), -rad(meas)), fill(C.acc, 0.18)) + path(arcD(o, 28, -rad(start), -rad(meas)), stroke(C.acc, 1.5));
        s += line(o, a, stroke(C.acc, 1.8)) + line(o, b, stroke(C.acc, 1.8));
        // angle inscrit
        s += angleMark(m, a, b, 26, C.blue) + line(m, a, stroke(C.blue, 2.2)) + line(m, b, stroke(C.blue, 2.2));
        var w = wedge(m, a, b), ins = deg(Math.abs(w.d)), cm = -rad(start + meas / 2);
        s += text([m[0] + 46 * Math.cos(w.mid), m[1] + 46 * Math.sin(w.mid) + 5], fdeg(ins), { size: 13, bold: true, color: C.blue });
        s += text([o[0] + 50 * Math.cos(cm), o[1] + 50 * Math.sin(cm) + 5], fdeg(meas), { size: 13, bold: true, color: C.acc });
        s += dot(o) + lab(o, 'O', [-Math.cos(cm), -Math.sin(cm)], { k: 12 });
        s += lab(a, 'A', [A[0], -A[1]], { k: 19 }) + lab(b, 'B', [B[0], -B[1]], { k: 19 }) + lab(m, 'M', [M[0], -M[1]], { color: C.blue, k: 19 });
        S.draw('main', s);
        S.sync();
        out.ins.textContent = fdeg(ins);
        out.cen.textContent = fdeg(meas) + (meas > 180 ? ' (angle rentrant)' : '');
        out.rel.innerHTML = '<b>' + fdeg(meas) + '</b> = 2 × <b>' + fdeg(meas / 2) + '</b> : l\'angle au centre est le double de l\'angle inscrit.';
        out.msg.innerHTML = meas === 180 ? MSG.dia : meas > 180 ? MSG.big : MSG.std;
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 4. Somme des angles d'un triangle                                   */
  /* ================================================================== */
  /** Arrondit des valeurs à l'unité en conservant leur somme (méthode du plus fort reste). */
  function roundKeepSum(vals, total) {
    var fl = vals.map(Math.floor), rest = Math.round(total - sum(fl));
    var order = vals.map(function (v, i) { return i; }).sort(function (i, j) { return (vals[j] - fl[j]) - (vals[i] - fl[i]); });
    for (var k = 0; k < rest && k < order.length; k++) fl[order[k]] += 1;
    return fl;
  }
  EM.demos.register({
    id: 'somme-angles-triangle',
    titre: 'La somme des angles d\'un triangle',
    chapitres: ['5e-triangles', '5e-angles', '6e-triangles'],
    resume: 'Déplace les sommets du triangle : ses angles changent mais leur somme reste toujours égale à 180°.',
    render: function (el) {
      var F = new Frame(0, 10, 0, 7, 340);
      var st = { P: [[1.2, 1], [8.8, 1.6], [3.6, 6.1]], proof: false };
      var NAMES = ['A', 'B', 'C'], COLS = [C.blue, C.green, C.acc];
      function angles(P) {
        return [0, 1, 2].map(function (i) {
          var p = P[i], u = P[(i + 1) % 3], v = P[(i + 2) % 3];
          return angDeg([u[0] - p[0], u[1] - p[1]], [v[0] - p[0], v[1] - p[1]]);
        });
      }
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Triangle ABC dont on peut déplacer les sommets'),
        controls: checkbox('proof', 'Montrer la preuve : la parallèle à $(AB)$ passant par $C$', false),
        readout: '<div style="' + ROW + '"><span>' + md('$\\widehat{A}$') + ' = <b data-o="a0" style="color:' + C.blue + '"></b></span>' +
          '<span>' + md('$\\widehat{B}$') + ' = <b data-o="a1" style="color:' + C.green + '"></b></span>' +
          '<span>' + md('$\\widehat{C}$') + ' = <b data-o="a2" style="color:' + C.acc + '"></b></span></div>' +
          '<div>Somme : <span data-o="sum"></span></div><p data-o="type" class="small" style="margin:6px 0 0"></p>',
        note: md('Observe : quelle que soit la forme du triangle, $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180°$. Coche la preuve : ' +
          'les angles alternes-internes reportent $\\widehat{A}$ et $\\widehat{B}$ au sommet $C$, et les trois angles forment un angle plat.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      el.querySelector('input[data-k="proof"]').addEventListener('change', function (e) { st.proof = e.target.checked; update(); });
      [0, 1, 2].forEach(function (i) {
        S.handle({
          label: 'Sommet ' + NAMES[i], color: COLS[i], step: 0.1,
          get: function () { return st.P[i]; },
          set: function (x, y) {
            var P = st.P.slice();
            P[i] = [clamp(rnd(x, 2), 0.4, 9.6), clamp(rnd(y, 2), 0.4, 6.6)];
            if (Math.min.apply(null, angles(P)) >= 4) st.P = P;
          }
        });
      });
      S.onchange = update;
      function update() {
        var P = st.P, p = P.map(function (x) { return F.P(x); }), s = '';
        var g = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
        var ang = angles(P), shown = roundKeepSum(ang, 180), i;
        if (st.proof) s += fullLine(F, P[2], [P[2][0] + P[1][0] - P[0][0], P[2][1] + P[1][1] - P[0][1]], stroke(C.muted, 1.4, DASH));
        s += polygon(p, shape(C.fill, 1, C.line, 2));
        var rs = [];
        for (i = 0; i < 3; i++) {
          var u = p[(i + 1) % 3], v = p[(i + 2) % 3];
          rs[i] = Math.min(30, 0.42 * Math.min(dist(p[i], u), dist(p[i], v)));
          s += angleMark(p[i], u, v, q(rs[i]), COLS[i], 0.28);
        }
        if (st.proof) {
          // reports en C : angle A entre (-AB) et CA, angle B entre CB et (+AB)
          var c = p[2], ab = [p[1][0] - p[0][0], p[1][1] - p[0][1]];
          s += angleMark(c, [c[0] - ab[0], c[1] - ab[1]], p[0], q(rs[2]), COLS[0], 0.28);
          s += angleMark(c, p[1], [c[0] + ab[0], c[1] + ab[1]], q(rs[2]), COLS[1], 0.28);
        }
        for (i = 0; i < 3; i++) {
          var w = wedge(p[i], p[(i + 1) % 3], p[(i + 2) % 3]), k = rs[i] + 15;
          s += text([p[i][0] + k * Math.cos(w.mid), p[i][1] + k * Math.sin(w.mid) + 4], shown[i] + '°', { size: 12, bold: true, color: COLS[i] });
          s += lab(p[i], NAMES[i], [p[i][0] - g[0], p[i][1] - g[1]], { k: 21, F: F });
        }
        S.draw('main', s);
        S.sync();
        out.a0.textContent = shown[0] + '°'; out.a1.textContent = shown[1] + '°'; out.a2.textContent = shown[2] + '°';
        out.sum.innerHTML = sw(C.blue, shown[0] + '°') + ' + ' + sw(C.green, shown[1] + '°') + ' + ' + sw(C.acc, shown[2] + '°') + ' = <b>180°</b>';
        var mx = Math.max.apply(null, shown);
        out.type.textContent = (mx > 90 ? 'Triangle obtusangle : un angle obtus.' : mx === 90 ? 'Triangle rectangle : un angle droit, les deux autres sont complémentaires.' :
          'Triangle acutangle : trois angles aigus.') + ' (Mesures arrondies au degré.)';
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* FIN DES DÉMONSTRATIONS */
})(typeof window !== 'undefined' ? window : globalThis);
