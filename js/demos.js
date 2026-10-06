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
    return '<div class="demo-control" style="flex-basis:100%"><span id="' + id + '">' + md(label) + '</span><div role="group" aria-labelledby="' + id + '" data-seg="' + key + '" style="display:flex;flex-wrap:wrap;gap:6px">' +
      opts.map(function (o, i) { return '<button type="button" class="btn sm' + (i === val ? '' : ' ghost') + '" data-i="' + i + '" aria-pressed="' + (i === val ? 'true' : 'false') + '">' + esc(o) + '</button>'; }).join('') + '</div></div>';
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
      for (var i = 0; i < bs.length; i++) {
        bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
        bs[i].className = 'btn sm' + (bs[i] === b ? '' : ' ghost');
      }
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

  /* ================================================================== */
  /* 5. Symétries et translation                                         */
  /* ================================================================== */
  EM.demos.register({
    id: 'symetries-translation',
    titre: 'Symétries et translation : point et image',
    chapitres: ['6e-symetrie-orthogonale', '5e-symetrie-centrale', '4e-vecteurs', '2s-transformations'],
    resume: 'Déplace le triangle, l\'axe, le centre ou le vecteur : l\'image se construit en direct et les longueurs sont conservées.',
    render: function (el) {
      var F = new Frame(-6, 6, -4.4, 4.4, 340);
      var st = { mode: 0, T: [[-4, 1], [-1.5, 0.5], [-3, 3.5]], D: [[0, -3], [0, 3]], O: [0.5, 0], U: [[-5, -2.5], [0, -3.5]] };
      var NAMES = ['A', 'B', 'C'];
      var NOTES = [
        md('Observe : $(d)$ est la médiatrice de chaque segment $[AA\']$, $[BB\']$, $[CC\']$ (les petits traits codent les longueurs égales). Les longueurs, les angles et les aires sont conservés, mais la figure est retournée, comme dans un miroir.'),
        md('Observe : $O$ est le milieu de chaque segment $[AA\']$, $[BB\']$, $[CC\']$. La symétrie centrale est un demi-tour autour de $O$ : la figure n\'est pas retournée, et chaque côté de l\'image est parallèle au côté de départ.'),
        md('Observe : dans la translation de vecteur $\\vec{u}$, tous les points glissent de la même façon : $\\overrightarrow{AA\'} = \\overrightarrow{BB\'} = \\overrightarrow{CC\'} = \\vec{u}$ (même direction, même sens, même longueur).')
      ];
      var VU = md('$\\vec{u}$');
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Triangle ABC et son image par la transformation choisie'),
        controls: segmented('mode', 'Transformation', ['Axiale', 'Centrale', 'Translation'], 0),
        readout: '<div data-o="r1"></div><div data-o="r2"></div><div data-o="r3"></div>',
        note: '<span data-o="note"></span>'
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      S.draw('bg', gridOnly(F, 1));
      function sp(x, y) { return [clamp(snap(x, 0.5), -5.5, 5.5), clamp(snap(y, 0.5), -4, 4)]; }
      function pairHandle(key, i, label, col) {
        return S.handle({
          label: label, color: col, step: 0.5,
          get: function () { return st[key][i]; },
          set: function (x, y) {
            var p = sp(x, y), o = st[key][1 - i];
            if (p[0] !== o[0] || p[1] !== o[1]) st[key][i] = p;
          }
        });
      }
      var hD = [pairHandle('D', 0, 'Point de l\'axe (d)', C.line), pairHandle('D', 1, 'Point de l\'axe (d)', C.line)];
      var hO = S.handle({ label: 'Centre O', color: C.line, step: 0.5, get: function () { return st.O; }, set: function (x, y) { st.O = sp(x, y); } });
      var hU = [pairHandle('U', 0, 'Origine du vecteur u', C.acc), pairHandle('U', 1, 'Extrémité du vecteur u', C.acc)];
      [0, 1, 2].forEach(function (i) {
        S.handle({ label: 'Sommet ' + NAMES[i], color: C.blue, step: 0.5, get: function () { return st.T[i]; }, set: function (x, y) { st.T[i] = sp(x, y); } });
      });
      bindSeg(el, 'mode', function (m) { st.mode = m; update(); });
      S.onchange = update;
      function proj(p) {
        var d1 = st.D[0], d2 = st.D[1], ux = d2[0] - d1[0], uy = d2[1] - d1[1];
        var k = ((p[0] - d1[0]) * ux + (p[1] - d1[1]) * uy) / (ux * ux + uy * uy);
        return [d1[0] + k * ux, d1[1] + k * uy];
      }
      function img(p) {
        if (st.mode === 0) { var h = proj(p); return [2 * h[0] - p[0], 2 * h[1] - p[1]]; }
        if (st.mode === 1) return [2 * st.O[0] - p[0], 2 * st.O[1] - p[1]];
        return [p[0] + st.U[1][0] - st.U[0][0], p[1] + st.U[1][1] - st.U[0][1]];
      }
      function cen(a) { return [(a[0][0] + a[1][0] + a[2][0]) / 3, (a[0][1] + a[1][1] + a[2][1]) / 3]; }
      function L(x) { return nt(rnd(x, 2), 2); }
      function update() {
        var m = st.mode, T = st.T, I = T.map(img), s = '', i;
        var tp = T.map(function (p) { return F.P(p); }), ip = I.map(function (p) { return F.P(p); });
        hD[0].hidden = hD[1].hidden = m !== 0;
        hO.hidden = m !== 1;
        hU[0].hidden = hU[1].hidden = m !== 2;
        if (m === 0) {
          var d1 = F.P(st.D[0]), d2 = F.P(st.D[1]), ud = unit([d2[0] - d1[0], d2[1] - d1[1]]);
          s += fullLine(F, st.D[0], st.D[1], stroke(C.line, 1.8, 'stroke-dasharray:10 4 2 4;'));
          s += lab(d2, '(d)', [-ud[1], ud[0]], { k: 20, F: F });
        }
        if (m === 2) {
          var u0 = F.P(st.U[0]), u1 = F.P(st.U[1]), nu = unit([-(u1[1] - u0[1]), u1[0] - u0[0]]);
          if (nu[1] > 0) nu = [-nu[0], -nu[1]];
          s += arrow(u0, u1, C.acc, 2.4, 10);
          s += vecLab([(u0[0] + u1[0]) / 2 + nu[0] * 14, (u0[1] + u1[1]) / 2 + nu[1] * 14 + 5], 'u', C.acc);
        }
        for (i = 0; i < 3; i++) {
          if (m === 2) { if (dist(tp[i], ip[i]) > 14) s += arrow(tp[i], ip[i], C.muted, 1.1, 7); continue; }
          var c = F.P(m === 0 ? proj(T[i]) : st.O);
          s += line(tp[i], ip[i], stroke(C.muted, 1.1, DASH)) + ticks(tp[i], c, i + 1, C.muted) + ticks(c, ip[i], i + 1, C.muted);
        }
        if (m === 0) {
          var h0 = F.P(proj(T[0]));
          if (dist(h0, tp[0]) > 8) s += rightMark(h0, tp[0], [h0[0] + ud[0] * 20, h0[1] + ud[1] * 20], 8);
        }
        s += polygon(tp, shape(C.blue, 0.14, C.blue, 2)) + polygon(ip, shape(C.acc, 0.14, C.acc, 2));
        var gt = F.P(cen(T)), gi = F.P(cen(I));
        for (i = 0; i < 3; i++) {
          s += dot(ip[i], C.acc, 3.5) + lab(ip[i], NAMES[i] + PRIME, [ip[i][0] - gi[0], ip[i][1] - gi[1]], { color: C.acc, k: 15, F: F });
          s += lab(tp[i], NAMES[i], [tp[i][0] - gt[0], tp[i][1] - gt[1]], { color: C.blue, k: 20, F: F });
        }
        if (m === 1) s += lab(F.P(st.O), 'O', [-0.7, 0.75], { k: 19, F: F });
        S.draw('main', s);
        S.sync();
        var AB = L(dist(T[0], T[1])), aire = nt(rnd(aireTri(T[0], T[1], T[2]), 3), 3);
        var A1 = it('A' + PRIME), B1 = it('B' + PRIME);
        if (m === 0) {
          out.r1.innerHTML = it('A') + ' et ' + A1 + ' sont à la même distance de (' + it('d') + ') : <b>' + L(dist(T[0], proj(T[0]))) + '</b> et <b>' + L(dist(I[0], proj(I[0]))) + '</b>.';
          out.r2.innerHTML = it('AB') + ' = <b>' + AB + '</b> et ' + A1 + B1 + ' = <b>' + L(dist(I[0], I[1])) + '</b> : les longueurs sont conservées.';
        } else if (m === 1) {
          out.r1.innerHTML = it('OA') + ' = <b>' + L(dist(st.O, T[0])) + '</b> et ' + it('O') + A1 + ' = <b>' + L(dist(st.O, I[0])) + '</b> : ' + it('O') + ' est le milieu de [' + it('A') + A1 + '].';
          out.r2.innerHTML = it('AB') + ' = ' + A1 + B1 + ' = <b>' + AB + '</b> et (' + it('AB') + ') ∥ (' + A1 + B1 + ').';
        } else {
          var ux = st.U[1][0] - st.U[0][0], uy = st.U[1][1] - st.U[0][1];
          out.r1.innerHTML = VU + ' (' + nt(ux) + ' ; ' + nt(uy) + ') : ' + it('AA' + PRIME) + ' = ' + it('BB' + PRIME) + ' = ' + it('CC' + PRIME) + ' = <b>' + L(Math.sqrt(ux * ux + uy * uy)) + '</b>.';
          out.r2.innerHTML = it('ABB' + PRIME + 'A' + PRIME) + ' est un parallélogramme : ' + it('AB') + ' = ' + A1 + B1 + ' = <b>' + AB + '</b>.';
        }
        out.r3.innerHTML = 'Aire de ' + it('ABC') + ' = aire de ' + it('A' + PRIME + 'B' + PRIME + 'C' + PRIME) + ' = <b>' + aire + '</b> carreaux.';
        out.note.innerHTML = NOTES[m];
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 6. Fonction affine                                                  */
  /* ================================================================== */
  EM.demos.register({
    id: 'fonction-affine',
    titre: 'Fonction affine : le rôle de a et de b',
    chapitres: ['3e-applications-affines', '4e-applications-lineaires', '2l-fonctions', '3e-reperage', '2s-droites'],
    resume: 'Règle a et b avec les curseurs ou en déplaçant deux points : la droite, le tableau de valeurs et l\'expression f(x) = ax + b changent ensemble.',
    render: function (el) {
      var F = new Frame(-4.5, 4.5, -5, 5, 320);
      var st = { a: 1.5, b: -1 };
      var XS = [-2, -1, 0, 1, 2];
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Droite représentant la fonction affine f', { max: 470 }),
        controls: slider('a', 'Coefficient directeur $a$', -3, 3, 0.5, st.a) + slider('b', 'Ordonnée à l\'origine $b$', -4, 4, 0.5, st.b),
        readout: '<div data-o="expr" style="font-size:1.1em"></div><div class="table-wrap" style="margin:6px 0"><table class="t"><tbody><tr><th>' + md('$x$') + '</th>' +
          XS.map(function (x) { return '<td>' + nt(x) + '</td>'; }).join('') + '</tr><tr><th>' + md('$f(x)$') + '</th>' +
          XS.map(function (x, i) { return '<td data-o="v' + i + '"></td>'; }).join('') + '</tr></tbody></table></div><p data-o="msg" style="margin:0"></p>',
        note: md('Observe : $a$ règle l\'inclinaison ; quand $x$ augmente de $1$, $f(x)$ augmente de $a$, à n\'importe quel endroit de la droite (regarde le tableau). ' +
          '$b$ fait monter ou descendre la droite, qui coupe toujours l\'axe des ordonnées au point $(0\\,;\\,b)$ : c\'est l\'ordonnée à l\'origine.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      S.draw('bg', axes(F, { gx: 1, xname: 'x', yname: 'y' }));
      var rA = bindRange(el, 'a', function (v) { return nt(v); }, function (v) { st.a = v; update(); });
      var rB = bindRange(el, 'b', function (v) { return nt(v); }, function (v) { st.b = v; update(); });
      S.handle({
        label: 'Point (0 ; b)', color: C.green,
        get: function () { return [0, st.b]; },
        set: function (x, y) { st.b = clamp(snap(y, 0.5), -4, 4); },
        key: function (dx, dy) { st.b = clamp(st.b + 0.5 * (dy || dx), -4, 4); }
      });
      var hA = S.handle({
        label: 'Point (1 ; a + b)', color: C.acc,
        get: function () { return [1, st.a + st.b]; },
        set: function (x, y) { st.a = clamp(snap(y - st.b, 0.5), -3, 3); },
        key: function (dx, dy) { st.a = clamp(st.a + 0.5 * (dy || dx), -3, 3); }
      });
      S.onchange = function () { rA.set(st.a); rB.set(st.b); update(); };
      function update() {
        var a = st.a, b = st.b, s = '';
        var P0 = F.P([0, b]), Q = F.P([1, b]), P1 = F.P([1, a + b]);
        hA.hidden = Math.abs(a + b) > 4.8;
        s += fullLine(F, [0, b], [1, a + b], stroke(C.blue, 2.6));
        s += line(P0, Q, stroke(C.green, 2, DASH)) + text([(P0[0] + Q[0]) / 2, P0[1] + (a >= 0 ? 16 : -8)], '1', { size: 13, bold: true, color: C.green });
        if (a !== 0 && !hA.hidden) {
          s += arrow(Q, P1, C.acc, 2.2, 8);
          s += text([Q[0] + 9, (Q[1] + P1[1]) / 2 + 4], 'a = ' + nt(a), { size: 13, bold: true, color: C.acc, anchor: 'start' });
        }
        s += text([P0[0] - 12, P0[1] + (a > 0 ? -9 : 18)], 'b', { size: 15, bold: true, italic: true, color: C.green, anchor: 'end' });
        if (a !== 0) {
          var x0 = -b / a;
          if (Math.abs(x0) < 4.4) s += circle(F.P([x0, 0]), 4, 'fill:var(--demo-bg,var(--surface-2));stroke:var(--fig-curve);stroke-width:2');
        }
        S.draw('main', s);
        S.sync();
        out.expr.innerHTML = md('$f(x) = ' + affTeX(a, b) + '$');
        XS.forEach(function (x, i) { out['v' + i].textContent = nt(a * x + b); });
        var msg = a > 0 ? 'Quand ' + it('x') + ' augmente de 1, ' + it('f(x)') + ' augmente de ' + nt(a) + ' : ' + it('f') + ' est <b>croissante</b>.' :
          a < 0 ? 'Quand ' + it('x') + ' augmente de 1, ' + it('f(x)') + ' diminue de ' + nt(-a) + ' : ' + it('f') + ' est <b>décroissante</b>.' :
            it('a') + ' = 0 : ' + it('f') + ' est <b>constante</b>, la droite est parallèle à l\'axe des abscisses.';
        msg += ' ' + (b === 0 ? it('b') + ' = 0 : ' + it('f') + ' est <b>linéaire</b>, la droite passe par l\'origine (proportionnalité).' :
          'La droite coupe l\'axe des ordonnées au point (0 ; ' + nt(b) + ').');
        if (a !== 0) msg += ' Elle coupe l\'axe des abscisses pour ' + it('x') + ' ' + eqv(-b / a + 0, 2) + '.';
        out.msg.innerHTML = msg;
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 7. Second degré                                                     */
  /* ================================================================== */
  EM.demos.register({
    id: 'second-degre-parabole',
    titre: 'Second degré : parabole et discriminant',
    chapitres: ['2s-second-degre', '1s-polynomes', '1l-equations'],
    resume: 'Règle a, b et c : la parabole bouge, le discriminant change de signe et les racines apparaissent ou disparaissent sur l\'axe des abscisses.',
    render: function (el) {
      var F = new Frame(-6, 6, -8, 8, 340, 300);
      var st = { a: 1, b: -2, c: -3 };
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Parabole représentant f(x) = ax² + bx + c'),
        controls: slider('a', 'Coefficient $a$', -3, 3, 0.5, st.a) + slider('b', 'Coefficient $b$', -6, 6, 0.5, st.b) + slider('c', 'Coefficient $c$', -6, 6, 0.5, st.c),
        readout: '<div data-o="expr" style="font-size:1.1em"></div><div>' + md('$\\Delta = b^2 - 4ac$') + ' = <b data-o="delta"></b></div>' +
          '<p data-o="roots" style="margin:6px 0"></p><div data-o="vertex"></div><div data-o="canon" style="margin-top:4px"></div>',
        note: md('Observe : le signe de $\\Delta$ donne le nombre de racines, c\'est-à-dire de points d\'intersection avec l\'axe des abscisses ; le signe de $a$ dit si la parabole est tournée vers le haut ou vers le bas. ' +
          'Le sommet est toujours sur l\'axe de symétrie, la droite d\'équation $x = -\\frac{b}{2a}$.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      S.draw('bg', axes(F, { gx: 1, lx: 2, xname: 'x', yname: 'y' }));
      ['a', 'b', 'c'].forEach(function (k) { bindRange(el, k, function (v) { return nt(v); }, function (v) { st[k] = v; update(); }); });
      function update() {
        var a = st.a, b = st.b, c = st.c, s = '';
        function f(x) { return a * x * x + b * x + c; }
        out.expr.innerHTML = md('$f(x) = ' + polyTeX([a, b, c]) + '$');
        if (a === 0) {
          S.draw('main', path(F.curve(f), stroke(C.blue, 2.6)));
          out.delta.textContent = '—';
          out.roots.innerHTML = md('$a = 0$ : $f$ n\'est plus un trinôme du second degré, sa courbe est une droite.');
          out.vertex.innerHTML = ''; out.canon.innerHTML = '';
          return;
        }
        var D = b * b - 4 * a * c, al = -b / (2 * a), be = f(al);
        var alF = EM.F(-b).div(EM.F(2 * a)), beF = EM.F(c).sub(EM.F(b).mul(EM.F(b)).div(EM.F(4 * a)));
        s += line(F.P([al, F.ymin]), F.P([al, F.ymax]), stroke(C.muted, 1.3, DASH));
        s += path(F.curve(f, null, null, 240), stroke(C.blue, 2.6));
        var roots = D > 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort(function (u, v) { return u - v; }) : D === 0 ? [al] : [];
        var Sp = F.P([al, be]);
        s += dot(Sp, C.line, 4.5) + lab(Sp, 'S', [0, a > 0 ? 1 : -1], { k: 13, F: F });
        roots.forEach(function (x, i) {
          var p = F.P([x, 0]);
          s += dot(p, C.acc, 5);
          var nm = roots.length === 1 ? 'x' + subs(0) : 'x' + subs(i + 1);
          var close = roots.length === 2 && F.X(roots[1]) - F.X(roots[0]) < 46;
          var dir = roots.length === 1 ? [0, a > 0 ? -1 : 1] : [(i === 0) === (a > 0 && !close) ? 0.8 : -0.8, -0.8];
          s += lab(p, nm, dir, { color: C.acc, k: 14, F: F });
        });
        S.draw('main', s);
        var X = it('x');
        out.delta.textContent = nt(D, 2);
        out.roots.innerHTML = D > 0 ? '<b>Δ &gt; 0</b> : deux racines, ' + X + '<sub>1</sub> ' + eqv(roots[0], 2) + ' et ' + X + '<sub>2</sub> ' + eqv(roots[1], 2) + ' ; la parabole coupe l\'axe des abscisses en deux points.' :
          D === 0 ? '<b>Δ = 0</b> : une racine double ' + X + '<sub>0</sub> ' + eqv(al, 2) + ' ; la parabole touche l\'axe des abscisses en son sommet.' :
            '<b>Δ &lt; 0</b> : pas de racine réelle ; la parabole ne coupe pas l\'axe des abscisses.';
        var at = alF.tex({ small: true }), bt = beF.tex({ small: true });
        out.vertex.innerHTML = md('Sommet $S\\left(' + at + '\\,;\\,' + bt + '\\right)$ ; ' +
          (a > 0 ? 'parabole tournée vers le haut ($a > 0$) : minimum $' + bt + '$.' : 'parabole tournée vers le bas ($a < 0$) : maximum $' + bt + '$.'));
        var inner = alF.isZero() ? 'x^2' : '\\left(x ' + (alF.n > 0 ? '- ' : '+ ') + alF.abs().tex({ small: true }) + '\\right)^2';
        out.canon.innerHTML = md('Forme canonique : $f(x) = ' + (a === 1 ? '' : a === -1 ? '-' : tn(a)) + inner +
          (beF.isZero() ? '' : (beF.n > 0 ? ' + ' : ' - ') + beF.abs().tex({ small: true })) + '$');
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 8. Cercle trigonométrique                                           */
  /* ================================================================== */
  /** Valeurs exactes de cos et sin pour les angles remarquables (en degrés entiers). */
  function trigExact(d) {
    var r = mod(d, 360);
    if (r % 30 !== 0 && r % 45 !== 0) return null;
    function ex(v) {
      var a = Math.abs(v), sg = v < -1e-9 ? '-' : '';
      if (a < 1e-9) return '0';
      if (Math.abs(a - 0.5) < 1e-9) return sg + '\\dfrac{1}{2}';
      if (Math.abs(a - Math.SQRT2 / 2) < 1e-9) return sg + '\\dfrac{\\sqrt{2}}{2}';
      if (Math.abs(a - Math.sqrt(3) / 2) < 1e-9) return sg + '\\dfrac{\\sqrt{3}}{2}';
      if (Math.abs(a - 1) < 1e-9) return sg + '1';
      return null;
    }
    return { c: ex(Math.cos(rad(r))), s: ex(Math.sin(rad(r))) };
  }
  /** Mesure en radians sous forme de fraction de π (si le dénominateur est petit). */
  function radTeX(d) {
    if (d === 0) return '0';
    var g = gcd(d, 180), p = d / g, qd = 180 / g;
    if (qd > 12) return null;
    var num = (p === 1 ? '' : p) + '\\pi';
    return qd === 1 ? num : '\\dfrac{' + num + '}{' + qd + '}';
  }
  EM.demos.register({
    id: 'cercle-trigonometrique',
    titre: 'Cercle trigonométrique : cosinus et sinus',
    chapitres: ['2s-trigonometrie', '1s-trigonometrie', '3e-trigonometrie'],
    resume: 'Fais tourner le point M sur le cercle : ses coordonnées sont cos θ et sin θ, et les courbes du cosinus et du sinus se tracent au fur et à mesure.',
    render: function (el) {
      var Fc = new Frame(-1.42, 1.42, -1.42, 1.42, 300);
      var Fg = new Frame(-0.5, 6.75, -1.62, 1.45, 340, 170);
      var st = { th: 60 }, acc = 60;
      el.innerHTML = layout({
        stage: '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center">' +
          svgTag('c', Fc, 'Cercle trigonométrique et point M', { max: 330, style: 'flex:1 1 240px;min-width:0;margin:0' }) +
          svgTag('g', Fg, 'Courbes du cosinus et du sinus', { max: 560, style: 'flex:2 1 300px;min-width:0;margin:0' }) + '</div>',
        controls: slider('th', 'Angle $\\theta$ (en degrés)', 0, 360, 1, st.th) + buttons(button('play', 'Faire tourner', ' ')),
        readout: '<div>' + md('$\\theta$') + ' = <b data-o="deg"></b> <span data-o="rad"></span></div>' +
          '<div>' + sw(C.blue, md('$\\cos\\theta$')) + ' <span data-o="cos"></span></div>' +
          '<div>' + sw(C.acc, md('$\\sin\\theta$')) + ' <span data-o="sin"></span></div>' +
          '<div class="small" style="margin-top:4px">' + md('$\\cos^2\\theta + \\sin^2\\theta = 1$') + ' : <span data-o="pyth"></span></div>',
        note: md('Observe : $M$ a pour coordonnées $(\\cos\\theta\\,;\\,\\sin\\theta)$. Le cosinus se lit sur l\'axe horizontal, le sinus sur l\'axe vertical ; ' +
          'ils restent entre $-1$ et $1$. Après un tour complet ($360°$, soit $2\\pi$ radians), tout recommence : ces fonctions sont périodiques.')
      });
      var Sc = new Stage(el.querySelector('[data-s="c"]'), Fc), Sg = new Stage(el.querySelector('[data-s="g"]'), Fg), out = outs(el);
      var o = Fc.P([0, 0]), R = Fc.X(1) - Fc.X(0), bg = '', k;
      bg += arrow(Fc.P([-1.32, 0]), Fc.P([1.36, 0]), C.muted, 1.2, 7) + arrow(Fc.P([0, -1.32]), Fc.P([0, 1.36]), C.muted, 1.2, 7);
      bg += circle(o, q(R), stroke(C.line, 1.8));
      for (k = 0; k < 360; k += 15) if (k % 30 === 0 || k % 45 === 0) bg += dot(Fc.P([Math.cos(rad(k)), Math.sin(rad(k))]), C.muted, 1.8);
      bg += text([Fc.X(1) + 5, o[1] + 15], '1', { size: 12, color: C.muted, anchor: 'start' }) + text([Fc.X(-1) - 5, o[1] + 15], '\u22121', { size: 12, color: C.muted, anchor: 'end' });
      bg += text([o[0] - 6, Fc.Y(1) - 5], '1', { size: 12, color: C.muted, anchor: 'end' }) + text([o[0] - 6, Fc.Y(-1) + 15], '\u22121', { size: 12, color: C.muted, anchor: 'end' });
      Sc.draw('bg', bg);
      var gb = '', GRID = 'stroke:var(--fig-grid);stroke-width:1', LBL = ['\u03c0/2', '\u03c0', '3\u03c0/2', '2\u03c0'];
      [-1, 1].forEach(function (y) { gb += line([Fg.X(0), Fg.Y(y)], [Fg.X(6.6), Fg.Y(y)], GRID) + text([Fg.X(0) - 5, Fg.Y(y) + 4], y > 0 ? '1' : '\u22121', { size: 11, color: C.muted, anchor: 'end' }); });
      for (k = 1; k <= 4; k++) gb += line([Fg.X(k * PI / 2), Fg.Y(1.25)], [Fg.X(k * PI / 2), Fg.Y(-1.25)], GRID) + text([Fg.X(k * PI / 2), Fg.Y(0) + 15], LBL[k - 1], { size: 11, color: C.muted });
      gb += arrow([Fg.X(-0.3), Fg.Y(0)], [Fg.X(6.72), Fg.Y(0)], C.muted, 1.2, 7) + arrow([Fg.X(0), Fg.Y(-1.4)], [Fg.X(0), Fg.Y(1.43)], C.muted, 1.2, 7);
      gb += path(Fg.curve(Math.cos, 0, 2 * PI), stroke(C.blue, 1.3, 'stroke-opacity:.35;' + DASH)) + path(Fg.curve(Math.sin, 0, 2 * PI), stroke(C.acc, 1.3, 'stroke-opacity:.35;' + DASH));
      gb += text([Fg.w - 60, Fg.h - 7], 'cos θ', { size: 12, bold: true, color: C.blue, anchor: 'end' }) + text([Fg.w - 8, Fg.h - 7], 'sin θ', { size: 12, bold: true, color: C.acc, anchor: 'end' });
      Sg.draw('bg', gb);
      var rTh = bindRange(el, 'th', function (v) { return v + '°'; }, function (v) { st.th = v; acc = v; update(); });
      Sc.handle({
        label: 'Point M', color: C.line,
        get: function () { return [Math.cos(rad(st.th)), Math.sin(rad(st.th))]; },
        set: function (x, y) {
          var t = mod(Math.round(deg(Math.atan2(y, x))), 360), n15 = Math.round(t / 15) * 15;
          if (Math.abs(t - n15) <= 2) t = n15 % 360;
          st.th = t; acc = t;
        },
        key: function (dx, dy) { st.th = clamp(st.th + ((dx || dy) > 0 ? 1 : -1) * Math.max(Math.abs(dx), Math.abs(dy)), 0, 360); acc = st.th; }
      });
      Sg.fallback = Sg.handle({
        label: 'Angle θ sur l\'axe des abscisses', color: C.gold, r: 5,
        get: function () { return [rad(st.th), 0]; },
        set: function (x) { st.th = clamp(Math.round(deg(x)), 0, 360); acc = st.th; },
        key: function (dx, dy) { st.th = clamp(st.th + (dx || dy), 0, 360); acc = st.th; }
      });
      Sc.onchange = Sg.onchange = function () { rTh.set(st.th); update(); };
      var loop = new Loop(function (dt) {
        acc += dt * 0.06;
        if (acc >= 360) { acc = 360; st.th = 360; rTh.set(360); update(); return false; }
        st.th = Math.floor(acc); rTh.set(st.th); update();
      });
      bindPlay(el.querySelector('[data-act="play"]'), loop, 'Faire tourner', 'Pause', function () { if (st.th >= 360) { acc = 0; st.th = 0; } else acc = st.th; });
      var cache = {};
      function texts(t) {
        if (cache[t]) return cache[t];
        var ex = trigExact(t), rt = radTeX(t), c = Math.cos(rad(t)), s = Math.sin(rad(t));
        function val(e, v) {
          if (e) return md('$= ' + e + '$') + (/\\/.test(e) ? ' \u2248 ' + nf(v, 3) : '');
          return '\u2248 ' + nf(v, 3);
        }
        var c2 = rnd(c * c, 3);
        cache[t] = {
          rad: rt != null ? md('$= ' + rt + '$ rad') : '\u2248 ' + nf(rad(t), 2) + ' rad',
          cos: val(ex && ex.c, c), sin: val(ex && ex.s, s),
          pyth: nf(c2, 3) + ' + ' + nf(rnd(1 - c2, 3), 3) + ' = 1'
        };
        return cache[t];
      }
      function update() {
        var t = st.th, tr = rad(t), c = Math.cos(tr), sn = Math.sin(tr);
        var M = Fc.P([c, sn]), H = Fc.P([c, 0]), K = Fc.P([0, sn]), s = '';
        if (t > 0 && t < 360) {
          s += path(arcD(o, 24, 0, -tr), stroke(C.gold, 1.8));
          if (t >= 14) s += text([o[0] + 37 * Math.cos(-tr / 2), o[1] + 37 * Math.sin(-tr / 2) + 5], 'θ', { size: 14, italic: true, color: C.gold });
        } else if (t === 360) s += circle(o, 24, stroke(C.gold, 1.8));
        s += line(M, H, stroke(C.muted, 1.2, DASH)) + line(M, K, stroke(C.muted, 1.2, DASH));
        s += line(o, H, stroke(C.blue, 4.5, 'stroke-linecap:butt;')) + line(o, K, stroke(C.acc, 4.5, 'stroke-linecap:butt;'));
        s += line(o, M, stroke(C.line, 2)) + dot(H, C.blue, 4) + dot(K, C.acc, 4);
        s += text([H[0], H[1] + (sn >= 0 ? 18 : -9)], 'cos θ', { size: 12, bold: true, color: C.blue });
        s += text([K[0] + (c >= 0 ? -8 : 8), K[1] + 4], 'sin θ', { size: 12, bold: true, color: C.acc, anchor: c >= 0 ? 'end' : 'start' });
        s += lab(M, 'M', [c, -sn], { k: 19 });
        Sc.draw('main', s);
        var g = '', n = Math.max(2, Math.round(t / 2)), X = Fg.X(tr);
        g += path(Fg.curve(Math.cos, 0, tr, n), stroke(C.blue, 2.4)) + path(Fg.curve(Math.sin, 0, tr, n), stroke(C.acc, 2.4));
        g += line([X, Fg.Y(1.3)], [X, Fg.Y(-1.3)], stroke(C.muted, 1, DASH)) + dot([X, Fg.Y(c)], C.blue, 4.5) + dot([X, Fg.Y(sn)], C.acc, 4.5);
        Sg.draw('main', g);
        Sc.sync(); Sg.sync();
        var tx = texts(t);
        out.deg.textContent = t + '°';
        out.rad.innerHTML = tx.rad; out.cos.innerHTML = tx.cos; out.sin.innerHTML = tx.sin; out.pyth.textContent = tx.pyth;
      }
      update();
      return function () { loop.stop(); Sc.destroy(); Sg.destroy(); };
    }
  });

  /* ================================================================== */
  /* 9. Sécante, tangente et nombre dérivé                               */
  /* ================================================================== */
  EM.demos.register({
    id: 'tangente-nombre-derive',
    titre: 'De la sécante à la tangente : le nombre dérivé',
    chapitres: ['1s-derivation', 'ts-derivabilite', '1l-fonctions'],
    resume: 'Rapproche le point M du point A sur la courbe : la sécante (AM) tend vers la tangente et le taux d\'accroissement tend vers le nombre dérivé.',
    render: function (el) {
      var FN = [
        { nom: 'f(x) = x²/2', tex: 'f(x) = \\dfrac{x^2}{2}', dtex: 'f\'(x) = x', f: function (x) { return x * x / 2; }, d: function (x) { return x; }, win: [-3.2, 3.2, -1.4, 4.6], a: 1, h: 1.5 },
        { nom: 'f(x) = x³/3 − x', tex: 'f(x) = \\dfrac{x^3}{3} - x', dtex: 'f\'(x) = x^2 - 1', f: function (x) { return x * x * x / 3 - x; }, d: function (x) { return x * x - 1; }, win: [-3.2, 3.2, -3, 3], a: -1.5, h: 2 },
        { nom: 'f(x) = sin x', tex: 'f(x) = \\sin x', dtex: 'f\'(x) = \\cos x', f: Math.sin, d: Math.cos, win: [-3.6, 3.6, -1.9, 1.9], a: 0.5, h: 1.5 }
      ];
      var W = 340, H = 270;
      function frame(i) { var w = FN[i].win; return new Frame(w[0], w[1], w[2], w[3], W, H); }
      var fn = FN[0], F = frame(0), st = { a: fn.a, h: fn.h };
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Courbe de f, sécante (AM) et tangente en A'),
        controls: selectBox('f', 'Fonction', FN.map(function (x) { return x.nom; }), 0) +
          slider('a', 'Abscisse $a$ du point $A$', -2.5, 2.5, 0.05, st.a) + slider('h', 'Écart $h$ entre $A$ et $M$', -2, 2, 0.01, st.h) +
          buttons(button('lim', 'Faire tendre h vers 0', ' ')),
        readout: '<div data-o="fx"></div>' +
          '<div>' + sw(C.acc, 'Pente de la sécante') + ' ' + md('$\\dfrac{f(a+h)-f(a)}{h}$') + ' = <b data-o="tx"></b></div>' +
          '<div>' + sw(C.green, 'Nombre dérivé') + ' ' + md('$f\'(a)$') + ' = <b data-o="fp"></b></div>' +
          '<div data-o="eq"></div><p data-o="msg" style="margin:6px 0 0"></p>',
        note: md('Observe : la sécante $(AM)$ a pour pente le taux d\'accroissement $\\frac{f(a+h)-f(a)}{h}$. Quand $h$ tend vers $0$, $M$ se rapproche de $A$, ' +
          'la sécante pivote vers la tangente (en vert) et sa pente tend vers le nombre dérivé $f\'(a)$.')
      });
      var MSG = {
        zero: md('$h = 0$ : la sécante n\'existe plus ; il ne reste que la tangente, sa position limite.'),
        tiny: md('$h$ est tout petit : la sécante et la tangente sont presque confondues.'),
        std: md('Rapproche $M$ de $A$ : la pente de la sécante va tendre vers $f\'(a)$.')
      };
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el), fxCache = {};
      var rA = bindRange(el, 'a', function (v) { return nt(v); }, function (v) { st.a = v; update(); });
      var rH = bindRange(el, 'h', function (v) { return nf(v, 2); }, function (v) { st.h = v; update(); });
      S.handle({
        label: 'Point A', color: C.green,
        get: function () { return [st.a, fn.f(st.a)]; },
        set: function (x) { st.a = clamp(rnd(snap(x, 0.05), 2), -2.5, 2.5); },
        key: function (dx, dy) { st.a = clamp(rnd(st.a + 0.05 * (dx || dy), 2), -2.5, 2.5); }
      });
      S.handle({
        label: 'Point M', color: C.acc,
        get: function () { return [st.a + st.h, fn.f(st.a + st.h)]; },
        set: function (x) { st.h = clamp(rnd(x - st.a, 2), -2, 2); },
        key: function (dx, dy) { st.h = clamp(rnd(st.h + 0.05 * (dx || dy), 2), -2, 2); }
      });
      S.onchange = function () { loop.stop(); rA.set(st.a); rH.set(st.h); update(); };
      function setFn(i) {
        fn = FN[i]; F = frame(i); S.F = F; st.a = fn.a; st.h = fn.h;
        rA.set(st.a); rH.set(st.h);
        S.draw('bg', axes(F, { gx: 1, xname: 'x', yname: 'y' }));
        update();
      }
      bindSelect(el, 'f', function (i) { loop.stop(); setFn(i); });
      var loop = new Loop(function (dt) {
        st.h = st.h * Math.pow(0.5, dt / 450);
        if (Math.abs(st.h) <= 0.01) { st.h = st.h < 0 ? -0.01 : 0.01; rH.set(st.h); update(); return false; }
        rH.set(rnd(st.h, 2)); update();
      });
      bindPlay(el.querySelector('[data-act="lim"]'), loop, 'Faire tendre h vers 0', 'Pause', function () { if (Math.abs(st.h) < 0.02) st.h = 1.5; });
      function update() {
        var f = fn.f, a = st.a, h = st.h, A = [a, f(a)], m = fn.d(a), s = '', pa = F.P(A);
        s += path(F.curve(f, null, null, 240), stroke(C.blue, 2.4));
        s += fullLine(F, A, [a + 1, f(a) + m], stroke(C.green, 2.2));
        if (h !== 0) {
          var M = [a + h, f(a + h)], Hh = F.P([a + h, f(a)]), pm = F.P(M);
          s += fullLine(F, A, M, stroke(C.acc, 2));
          s += line(pa, Hh, stroke(C.muted, 1.2, DASH)) + line(Hh, pm, stroke(C.muted, 1.2, DASH));
          if (Math.abs(Hh[0] - pa[0]) > 20) s += text([(pa[0] + Hh[0]) / 2, pa[1] + (M[1] >= A[1] ? 16 : -8)], 'h', { size: 13, italic: true, color: C.muted });
          s += lab(pm, 'M', [h >= 0 ? 0.8 : -0.8, -0.7], { color: C.acc, k: 18, F: F });
        }
        s += lab(pa, 'A', [h >= 0 ? -0.8 : 0.8, -0.7], { color: C.green, k: 18, F: F });
        S.draw('main', s);
        S.sync();
        if (!fxCache[fn.nom]) fxCache[fn.nom] = md('$' + fn.tex + '$, donc $' + fn.dtex + '$.');
        out.fx.innerHTML = fxCache[fn.nom];
        out.tx.textContent = h === 0 ? '—' : nf((f(a + h) - f(a)) / h, 3);
        out.fp.textContent = nf(m, 3);
        out.eq.innerHTML = 'Tangente en ' + it('A') + ' : ' + it('y') + ' = ' + affHtml(m, f(a) - m * a, 3);
        out.msg.innerHTML = h === 0 ? MSG.zero : Math.abs(h) <= 0.05 ? MSG.tiny : MSG.std;
      }
      setFn(0);
      return function () { loop.stop(); S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 10. Suite récurrente : escalier et escargot                         */
  /* ================================================================== */
  EM.demos.register({
    id: 'suite-recurrente-toile',
    titre: 'Suite récurrente : l\'escalier et l\'escargot',
    chapitres: ['ts-suites', '1s-suites', 'tl-suites'],
    resume: 'Construis les termes d\'une suite définie par récurrence avec la courbe de f et la droite d\'équation y = x : on voit si elle converge, oscille ou diverge.',
    render: function (el) {
      var F = new Frame(-0.6, 7.4, -1.2, 7.4, 320);
      var FN = [
        { nom: 'f(x) = 0,5x + 2', tex: 'u_{n+1} = 0{,}5\\,u_n + 2', f: function (x) { return 0.5 * x + 2; }, l: 4, lt: '4', kind: 'mono', u0: 0.5, min: 0 },
        { nom: 'f(x) = −0,6x + 4', tex: 'u_{n+1} = -0{,}6\\,u_n + 4', f: function (x) { return -0.6 * x + 4; }, l: 2.5, lt: '2{,}5', kind: 'osc', u0: 0.5, min: 0 },
        { nom: 'f(x) = √(2x + 3)', tex: 'u_{n+1} = \\sqrt{2u_n + 3}', f: function (x) { return Math.sqrt(2 * x + 3); }, l: 3, lt: '3', kind: 'mono', u0: 0.2, min: 0 },
        { nom: 'f(x) = 1,5x − 2', tex: 'u_{n+1} = 1{,}5\\,u_n - 2', f: function (x) { return 1.5 * x - 2; }, l: 4, lt: '4', kind: 'div', u0: 4.3, min: 0 },
        { nom: 'f(x) = 6/x', tex: 'u_{n+1} = \\dfrac{6}{u_n}', f: function (x) { return 6 / x; }, l: Math.sqrt(6), lt: '\\sqrt{6}', kind: 'cycle', u0: 1.5, min: 0.5, from: 0.75 }
      ];
      var fn = FN[0], st = { u0: fn.u0, n: 6 };
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Courbe de f, droite y = x et construction des termes de la suite', { max: 470 }),
        controls: selectBox('f', 'Fonction $f$', FN.map(function (x) { return x.nom; }), 0) +
          slider('u0', 'Premier terme $u_0$', 0, 7, 0.1, st.u0) + slider('n', 'Nombre d\'étapes $n$', 1, 30, 1, st.n),
        readout: '<div data-o="rec"></div><div data-o="terms" style="margin:4px 0"></div><p data-o="msg" style="margin:0"></p>',
        note: md('Observe : on part de $u_0$ sur l\'axe des abscisses, on monte jusqu\'à la courbe pour lire $u_1 = f(u_0)$, on rabat ce nombre sur l\'axe grâce à la droite $y = x$, et on recommence. ' +
          'Si la suite converge, c\'est vers l\'abscisse $\\ell$ du point commun à la courbe et à la droite : $f(\\ell) = \\ell$.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el), cache = {};
      S.draw('bg', axes(F, { gx: 1, xname: 'x', yname: 'y' }));
      var rU = bindRange(el, 'u0', function (v) { return nt(v, 1); }, function (v) { st.u0 = v; update(); });
      bindRange(el, 'n', function (v) { return String(v); }, function (v) { st.n = v; update(); });
      S.handle({
        label: 'Premier terme u0', color: C.acc,
        get: function () { return [st.u0, 0]; },
        set: function (x) { st.u0 = clamp(rnd(snap(x, 0.1), 1), fn.min, 7); },
        key: function (dx, dy) { st.u0 = clamp(rnd(st.u0 + 0.1 * (dx || dy), 1), fn.min, 7); }
      });
      S.onchange = function () { rU.set(st.u0); update(); };
      bindSelect(el, 'f', function (i) {
        fn = FN[i]; rU.input.min = fn.min; st.u0 = fn.u0; rU.set(st.u0); update();
      });
      function M(s) { if (!cache[s]) cache[s] = md(s); return cache[s]; }
      function update() {
        var u = [st.u0], i, s = '';
        for (i = 0; i < st.n; i++) {
          var v = fn.f(u[i]);
          if (!isFinite(v) || Math.abs(v) > 1e6) break;
          u.push(v);
        }
        s += fullLine(F, [0, 0], [1, 1], stroke(C.muted, 1.4, DASH));
        s += text(F.P([6.15, 6.75]), 'y = x', { size: 12, italic: true, color: C.muted, anchor: 'end' });
        s += path(F.curve(fn.f, fn.from != null ? fn.from : F.xmin, F.xmax, 240), stroke(C.blue, 2.4));
        var l = fn.l, pl = F.P([l, l]);
        s += line(pl, F.P([l, 0]), stroke(C.green, 1.2, 'stroke-dasharray:2 3;'));
        var web = [[u[0], 0]];
        for (i = 1; i < u.length; i++) { web.push([u[i - 1], u[i]]); web.push([u[i], u[i]]); }
        s += polyline(web.map(function (p) { return F.P([clamp(p[0], -50, 60), clamp(p[1], -50, 60)]); }), stroke(C.acc, 1.8));
        var used = [];
        for (i = 0; i < Math.min(u.length, 4); i++) {
          var px = F.P([u[i], 0]);
          if (u[i] < F.xmin || u[i] > F.xmax) continue;
          if (i > 0) s += line(F.P([u[i], u[i]]), px, stroke(C.acc, 1, 'stroke-opacity:.6;stroke-dasharray:2 3;'));
          var free = used.every(function (x) { return Math.abs(x - px[0]) > 20; });
          s += dot(px, C.acc, 3);
          if (free) { s += text([px[0], px[1] + 32], 'u' + subs(i), { size: 14, italic: true, color: C.acc }); used.push(px[0]); }
        }
        s += dot(pl, C.green, 4.5) + lab(pl, 'ℓ', [-1, -0.6], { color: C.green, k: 12, size: 16 });
        S.draw('main', s);
        S.sync();
        out.rec.innerHTML = md('$' + fn.tex + '$ avec $u_0 = ' + tn(st.u0, 1) + '$');
        var T = [], U = it('u');
        for (i = 0; i < Math.min(u.length, 5); i++) T.push(U + '<sub>' + i + '</sub> ' + eqv(u[i], 3));
        var last = u.length - 1;
        if (last < st.n) T.push('… puis les termes dépassent 10<sup>6</sup> en valeur absolue');
        else if (last >= 5) T.push('…', U + '<sub>' + last + '</sub> ' + eqv(u[last], 3));
        out.terms.innerHTML = T.join(' ; ');
        var u0 = st.u0, msg;
        if (Math.abs(u0 - l) < 1e-9) msg = M('$u_0 = \\ell$ : la suite est constante.');
        else if (fn.kind === 'mono') msg = M('La suite est ' + (u0 < l ? 'croissante' : 'décroissante') + ' et converge vers $\\ell = ' + fn.lt + '$ (en escalier).');
        else if (fn.kind === 'osc') msg = M('Les termes sont alternativement de part et d\'autre de $\\ell = ' + fn.lt + '$ et s\'en rapprochent (en escargot) : la suite converge vers $\\ell$ sans être monotone.');
        else if (fn.kind === 'div') msg = M('La suite est ' + (u0 > l ? 'croissante et tend vers $+\\infty$' : 'décroissante et tend vers $-\\infty$') + ' : elle diverge, les termes s\'éloignent de $\\ell = ' + fn.lt + '$.');
        else msg = M('Les termes valent alternativement $u_0$ et $\\frac{6}{u_0}$ : la suite ne converge pas (sauf si $u_0 = \\sqrt{6}$).');
        out.msg.innerHTML = msg;
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 11. Intégrale et sommes de rectangles                               */
  /* ================================================================== */
  EM.demos.register({
    id: 'integrale-rectangles',
    titre: 'L\'intégrale, limite des sommes de rectangles',
    chapitres: ['ts-integrales', 'ts-primitives'],
    resume: 'Augmente le nombre n de rectangles : la somme de leurs aires se rapproche de l\'intégrale, c\'est-à-dire de l\'aire sous la courbe.',
    render: function (el) {
      var FN = [
        { nom: 'x²/4 + 1 sur [0 ; 4]', f: function (x) { return x * x / 4 + 1; }, a: 0, b: 4, I: 28 / 3, itex: '\\int_0^4 \\left(\\frac{x^2}{4} + 1\\right) \\mathrm{d}x = \\frac{28}{3}', win: [-0.45, 4.5, -0.6, 5.6], gy: 1 },
        { nom: '√x sur [0 ; 4]', f: Math.sqrt, a: 0, b: 4, I: 16 / 3, itex: '\\int_0^4 \\sqrt{x}\\,\\mathrm{d}x = \\frac{16}{3}', win: [-0.45, 4.5, -0.32, 2.45], gy: 0.5 },
        { nom: '1/x sur [1 ; 4]', f: function (x) { return 1 / x; }, a: 1, b: 4, I: Math.log(4), itex: '\\int_1^4 \\frac{1}{x}\\,\\mathrm{d}x = \\ln 4', win: [-0.4, 4.5, -0.22, 1.6], gy: 0.5, from: 0.55 },
        { nom: 'sin x sur [0 ; π]', f: Math.sin, a: 0, b: PI, I: 2, itex: '\\int_0^{\\pi} \\sin x\\,\\mathrm{d}x = 2', win: [-0.35, 3.6, -0.2, 1.3], gy: 0.5 }
      ];
      var W = 340, H = 230;
      function frame(i) { var w = FN[i].win; return new Frame(w[0], w[1], w[2], w[3], W, H); }
      var fn = FN[0], F = frame(0), st = { n: 4, m: 0 }, itex = {};
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Courbe de f et rectangles sous la courbe'),
        controls: selectBox('f', 'Fonction', FN.map(function (x) { return x.nom; }), 0) +
          selectBox('m', 'Hauteur des rectangles', ['Valeur à gauche', 'Valeur à droite', 'Valeur au milieu'], 0) +
          slider('n', 'Nombre de rectangles $n$', 1, 100, 1, st.n) + buttons(button('play', 'Augmenter n', ' ')),
        readout: '<div>Somme des aires ' + md('$S_n$') + ' = <b data-o="sn" style="color:' + C.acc + '"></b></div>' +
          '<div data-o="ex"></div><div>Écart : <b data-o="err"></b></div><p data-o="msg" class="small" style="margin:6px 0 0"></p>',
        note: md('Observe : chaque rectangle a pour largeur $\\frac{b-a}{n}$. Quand $n$ augmente, les rectangles épousent la courbe et la somme de leurs aires se rapproche de l\'intégrale $\\int_a^b f(x)\\,\\mathrm{d}x$ : l\'écart tend vers $0$.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      var rN = bindRange(el, 'n', function (v) { return String(v); }, function (v) { st.n = v; update(); });
      bindSelect(el, 'f', function (i) { fn = FN[i]; F = frame(i); S.F = F; drawBg(); update(); });
      bindSelect(el, 'm', function (i) { st.m = i; update(); });
      var tAcc = 0;
      var loop = new Loop(function (dt) {
        tAcc += dt;
        if (tAcc < 110) return;
        tAcc = 0;
        if (st.n >= 100) return false;
        st.n += 1; rN.set(st.n); update();
      });
      bindPlay(el.querySelector('[data-act="play"]'), loop, 'Augmenter n', 'Pause', function () { if (st.n >= 100) { st.n = 1; rN.set(1); update(); } tAcc = 0; });
      function drawBg() {
        var s = axes(F, { gx: 1, gy: fn.gy, xname: 'x', yname: 'y' });
        if (fn.b === PI) s += text([F.X(PI), F.Y(0) + 15], 'π', { size: 12, color: C.muted });
        S.draw('bg', s);
      }
      function update() {
        var f = fn.f, a = fn.a, b = fn.b, n = st.n, dx = (b - a) / n, Sn = 0, s = '', y0 = F.Y(0);
        var stl = n <= 40 ? shape(C.acc, 0.2, C.acc, 1) : fill(C.acc, 0.3);
        for (var i = 0; i < n; i++) {
          var x0 = a + i * dx, xs = st.m === 0 ? x0 : st.m === 1 ? x0 + dx : x0 + dx / 2, hy = f(xs);
          Sn += hy * dx;
          var X0 = F.X(x0), X1 = F.X(x0 + dx), Yh = F.Y(hy);
          s += polygon([[X0, y0], [X1, y0], [X1, Yh], [X0, Yh]], stl);
          if (n <= 24) s += dot([F.X(xs), Yh], C.acc, 2.4);
        }
        s += path(F.curve(f, fn.from != null ? fn.from : Math.max(F.xmin, -0.2), F.xmax, 240), stroke(C.blue, 2.4));
        s += line([F.X(a), y0], [F.X(a), F.Y(f(a))], stroke(C.blue, 1, DASH)) + line([F.X(b), y0], [F.X(b), F.Y(f(b))], stroke(C.blue, 1, DASH));
        S.draw('main', s);
        if (!itex[fn.nom]) itex[fn.nom] = md('$' + fn.itex + '$');
        out.sn.textContent = nf(Sn, 4);
        out.ex.innerHTML = 'Intégrale : ' + itex[fn.nom] + ' \u2248 <b>' + nf(fn.I, 4) + '</b>';
        out.err.textContent = nf(Math.abs(Sn - fn.I), 4);
        out.msg.innerHTML = Math.abs(Sn - fn.I) < 5e-5 ? 'Avec cette précision, la somme et l\'intégrale sont égales.' :
          Sn < fn.I ? 'Ici ' + it('S') + '<sub>' + it('n') + '</sub> est inférieure à l\'intégrale : c\'est une valeur approchée par défaut.' :
            'Ici ' + it('S') + '<sub>' + it('n') + '</sub> est supérieure à l\'intégrale : c\'est une valeur approchée par excès.';
      }
      drawBg();
      update();
      return function () { loop.stop(); S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 12. Loi des grands nombres                                          */
  /* ================================================================== */
  function grp(x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }
  EM.demos.register({
    id: 'loi-grands-nombres',
    titre: 'Loi des grands nombres : la fréquence se stabilise',
    chapitres: ['ts-probabilites', 'tl-probabilites', '5e-statistiques'],
    resume: 'Lance une pièce ou un dé des centaines de fois : la fréquence d\'apparition se rapproche de la probabilité.',
    render: function (el) {
      var MAX = 20000, W = 340, HG = 200, HB = 132;
      var MODES = [
        { nom: 'Pièce : obtenir Pile', faces: ['Pile', 'Face'], target: 0, p: 0.5, ptxt: 'p = 1/2', ev: '« Pile »' },
        { nom: 'Dé : obtenir 6', faces: ['1', '2', '3', '4', '5', '6'], target: 5, p: 1 / 6, ptxt: 'p = 1/6', ev: '« 6 »' }
      ];
      var mo = MODES[1], N = 0, hits = 0, counts = [], hist = [], last = [];
      el.innerHTML = layout({
        stage: svgTag('g', new Frame(0, 1, 0, 1, W, HG), 'Fréquence en fonction du nombre de lancers') + '<div style="height:8px"></div>' +
          svgTag('b', new Frame(0, 1, 0, 1, W, HB), 'Fréquence de chaque résultat'),
        controls: selectBox('mode', 'Expérience', MODES.map(function (x) { return x.nom; }), 1) +
          buttons(button('1', '+1 lancer') + button('10', '+10') + button('100', '+100') + button('play', 'Lancer en continu', ' ') + button('reset', 'Recommencer')),
        readout: '<div style="' + ROW + '"><span>Lancers : <b data-o="n"></b></span><span>Nombre de <span data-o="ev"></span> : <b data-o="k"></b></span></div>' +
          '<div style="' + ROW + '"><span>Fréquence : <b data-o="f" style="color:' + C.blue + '"></b></span><span>Probabilité : <b data-o="p" style="color:' + C.acc + '"></b></span><span>Écart : <b data-o="e"></b></span></div>' +
          '<div class="small" style="margin-top:4px">Derniers résultats : <span data-o="last"></span></div>',
        note: md('Observe : au début, la fréquence saute beaucoup d\'un lancer à l\'autre. Plus le nombre de lancers augmente, plus elle se stabilise autour de la probabilité $p$ (le trait en pointillés) : c\'est la loi des grands nombres. ' +
          'En bas, la fréquence de chaque résultat se stabilise elle aussi autour de sa probabilité.')
      });
      var Sg = new Stage(el.querySelector('[data-s="g"]'), new Frame(0, 1, 0, 1, W, HG)), Sb = new Stage(el.querySelector('[data-s="b"]'), new Frame(0, 1, 0, 1, W, HB)), out = outs(el);
      var GRID = 'stroke:var(--fig-grid);stroke-width:1';
      function reset() { N = 0; hits = 0; counts = mo.faces.map(function () { return 0; }); hist = []; last = []; }
      function throwOne() {
        var r = Math.floor(Math.random() * mo.faces.length);
        counts[r] += 1; N += 1;
        if (r === mo.target) hits += 1;
        hist.push(hits / N); last.push(r);
        if (last.length > 12) last.shift();
      }
      function add(k) { for (var i = 0; i < k && N < MAX; i++) throwOne(); draw(); }
      function draw() {
        var xmax = Math.max(10, N), F = new Frame(0, xmax, 0, 1, W, HG, { l: 40, r: 14, t: 12, b: 26 }), s = '', i;
        [0, 0.25, 0.5, 0.75, 1].forEach(function (y) {
          s += line([F.X(0), F.Y(y)], [F.X(xmax), F.Y(y)], GRID) + text([F.l - 6, F.Y(y) + 4], nt(y, 2), { size: 11, color: C.muted, anchor: 'end' });
        });
        var stp = niceStep(xmax / 4);
        for (var x = 0; x <= xmax + 1e-9; x += stp) s += text([F.X(x), HG - 8], grp(x), { size: 11, color: C.muted, anchor: x === 0 ? 'start' : 'middle' });
        s += line([F.X(0), F.Y(0)], [F.X(xmax), F.Y(0)], stroke(C.muted, 1.2)) + line([F.X(0), F.Y(0)], [F.X(0), F.Y(1)], stroke(C.muted, 1.2));
        s += line([F.X(0), F.Y(mo.p)], [F.X(xmax), F.Y(mo.p)], stroke(C.acc, 1.6, DASH)) + text([F.X(0) + 6, F.Y(mo.p) - 6], mo.ptxt, { size: 12, bold: true, color: C.acc, anchor: 'start' });
        if (N) {
          var pts0 = [], step = Math.max(1, N / 400);
          for (var k = 0; k < N; k += step) { i = Math.floor(k); pts0.push([F.X(i + 1), F.Y(hist[i])]); }
          pts0.push([F.X(N), F.Y(hist[N - 1])]);
          s += polyline(pts0, stroke(C.blue, 1.8)) + dot(pts0[pts0.length - 1], C.blue, 3.5);
        } else s += text([(F.l + W - F.r) / 2, F.Y(0.86)], 'Appuie sur « +1 lancer » ou « Lancer en continu »', { size: 12, color: C.muted });
        Sg.draw('main', s);
        // diagramme des fréquences de chaque résultat
        var nf0 = mo.faces.length, fr = counts.map(function (c) { return N ? c / N : 0; });
        var ymax = Math.min(1, Math.ceil(Math.max(2 * mo.p, Math.max.apply(null, fr)) * 10 - 1e-9) / 10);
        var B = new Frame(0, nf0, 0, ymax, W, HB, { l: 40, r: 14, t: 18, b: 22 }), b = '';
        b += line([B.X(0), B.Y(0)], [B.X(nf0), B.Y(0)], stroke(C.muted, 1.2));
        b += text([B.l - 6, B.Y(0) + 4], '0', { size: 11, color: C.muted, anchor: 'end' }) + text([B.l - 6, B.Y(ymax) + 4], nt(ymax, 1), { size: 11, color: C.muted, anchor: 'end' });
        for (i = 0; i < nf0; i++) {
          var col = i === mo.target ? C.acc : C.blue, x0 = B.X(i + 0.2), x1 = B.X(i + 0.8), yt = B.Y(fr[i]);
          b += polygon([[x0, B.Y(0)], [x1, B.Y(0)], [x1, yt], [x0, yt]], shape(col, 0.5, col, 1.2));
          b += text([(x0 + x1) / 2, HB - 6], mo.faces[i], { size: 12, color: C.line });
          if (N) b += text([(x0 + x1) / 2, yt - 5], nf(fr[i], 2), { size: 11, color: col });
        }
        b += line([B.X(0), B.Y(mo.p)], [B.X(nf0), B.Y(mo.p)], stroke(C.acc, 1.4, DASH));
        Sb.draw('main', b);
        out.n.textContent = grp(N);
        out.ev.textContent = mo.ev;
        out.k.textContent = grp(hits);
        out.f.textContent = N ? nf(hits / N, 3) : '—';
        out.p.textContent = mo.p === 0.5 ? '0,5' : '\u2248 ' + nf(mo.p, 3);
        out.e.textContent = N ? nf(Math.abs(hits / N - mo.p), 3) : '—';
        out.last.textContent = last.length ? last.map(function (r) { return mo.faces[r]; }).join(' · ') : '—';
      }
      var loop = new Loop(function () {
        var k = clamp(Math.floor(N / 60), 1, 300);
        for (var i = 0; i < k && N < MAX; i++) throwOne();
        draw();
        if (N >= MAX) return false;
      });
      bindPlay(el.querySelector('[data-act="play"]'), loop, 'Lancer en continu', 'Pause', function () { if (N >= MAX) { reset(); } });
      onAct(el, {
        '1': function () { add(1); }, '10': function () { add(10); }, '100': function () { add(100); },
        reset: function () { loop.stop(); reset(); draw(); }
      });
      bindSelect(el, 'mode', function (i) { loop.stop(); mo = MODES[i]; reset(); draw(); });
      reset();
      draw();
      return function () { loop.stop(); Sg.destroy(); Sb.destroy(); };
    }
  });

  /* ================================================================== */
  /* 13. Loi binomiale                                                   */
  /* ================================================================== */
  function binom(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  EM.demos.register({
    id: 'loi-binomiale',
    titre: 'Loi binomiale : le diagramme en bâtons',
    chapitres: ['ts-probabilites'],
    resume: 'Règle le nombre d\'épreuves n et la probabilité de succès p : le diagramme de la loi binomiale se déforme autour de l\'espérance np.',
    render: function (el) {
      var W = 340, H = 220, st = { n: 10, p: 0.3, k: 3, mode: 0 };
      el.innerHTML = layout({
        stage: svgTag('fig', new Frame(0, 1, 0, 1, W, H), 'Diagramme en bâtons de la loi binomiale'),
        controls: slider('n', 'Nombre d\'épreuves $n$', 1, 40, 1, st.n) + slider('p', 'Probabilité de succès $p$', 0, 1, 0.01, st.p) +
          slider('k', 'Nombre de succès $k$', 0, st.n, 1, st.k) + selectBox('mode', 'Probabilité calculée', ['P(X = k)', 'P(X ≤ k)', 'P(X ≥ k)'], 0),
        readout: '<div data-o="prob"></div><div style="' + ROW + ';margin-top:4px"><span>' + md('$E(X) = np$') + ' = <b data-o="e" style="color:' + C.green + '"></b></span>' +
          '<span>' + md('$V(X) = np(1-p)$') + ' = <b data-o="v"></b></span><span>' + md('$\\sigma(X)$') + ' \u2248 <b data-o="s"></b></span></div>',
        note: md('Observe : chaque bâton donne la probabilité d\'obtenir exactement $k$ succès en $n$ épreuves indépendantes. Le diagramme se regroupe autour de l\'espérance $np$ (trait vert) ; ' +
          'il est symétrique quand $p = 0{,}5$. Touche un bâton pour choisir $k$.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), new Frame(0, 1, 0, 1, W, H)), out = outs(el);
      var GRID = 'stroke:var(--fig-grid);stroke-width:1';
      var rK = bindRange(el, 'k', function (v) { return String(v); }, function (v) { st.k = v; update(); });
      bindRange(el, 'n', function (v) { return String(v); }, function (v) { st.n = v; rK.setMax(v); if (st.k > v) { st.k = v; } rK.set(st.k); update(); });
      bindRange(el, 'p', function (v) { return nt(v); }, function (v) { st.p = v; update(); });
      bindSelect(el, 'mode', function (i) { st.mode = i; update(); });
      S.onTap = function (m) { st.k = clamp(Math.round(m[0]), 0, st.n); rK.set(st.k); update(); };
      function update() {
        var n = st.n, p = st.p, k = Math.min(st.k, n), P = [], i;
        for (i = 0; i <= n; i++) P.push(binom(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i));
        var mx = Math.max.apply(null, P), stp = niceStep(mx / 4), ymax = Math.max(stp, Math.ceil(mx / stp - 1e-9) * stp);
        var F = new Frame(-0.6, n + 0.6, 0, ymax * 1.06, W, H, { l: 44, r: 10, t: 12, b: 26 }), s = '';
        S.F = F;
        for (var y = 0; y <= ymax + 1e-9; y += stp) s += line([F.l, F.Y(y)], [W - F.r, F.Y(y)], GRID) + text([F.l - 6, F.Y(y) + 4], nt(y, 3), { size: 11, color: C.muted, anchor: 'end' });
        var lstep = n <= 12 ? 1 : n <= 24 ? 2 : 5, hw = Math.min(0.36, 0.42);
        for (i = 0; i <= n; i++) {
          var sel = st.mode === 0 ? i === k : st.mode === 1 ? i <= k : i >= k;
          var x0 = F.X(i - hw), x1 = F.X(i + hw), yt = F.Y(P[i]), yb = F.Y(0);
          s += polygon([[x0, yb], [x1, yb], [x1, yt], [x0, yt]], sel ? shape(C.acc, 0.8, C.acc, 1) : shape(C.blue, 0.35, C.blue, 1));
          if (i % lstep === 0) s += text([F.X(i), H - 9], String(i), { size: 11, color: i === k ? C.acc : C.muted, bold: i === k });
        }
        s += line([F.l, F.Y(0)], [W - F.r, F.Y(0)], stroke(C.muted, 1.2));
        var E = n * p, xe = F.X(E);
        s += line([xe, F.Y(0)], [xe, F.t], stroke(C.green, 1.6, DASH));
        s += text([clamp(xe, F.l + 18, W - 22), F.t + 10], 'E(X)', { size: 12, bold: true, color: C.green });
        S.draw('main', s);
        var pr, tex, q1 = rnd(1 - p, 2);
        if (st.mode === 0) { pr = P[k]; tex = 'P(X = ' + k + ') = \\dbinom{' + n + '}{' + k + '} \\times ' + tn(p) + '^{' + k + '} \\times ' + tn(q1) + '^{' + (n - k) + '}'; }
        else if (st.mode === 1) { pr = sum(P.slice(0, k + 1)); tex = 'P(X \\leqslant ' + k + ') = \\sum_{i=0}^{' + k + '} P(X = i)'; }
        else { pr = sum(P.slice(k)); tex = 'P(X \\geqslant ' + k + ') = \\sum_{i=' + k + '}^{' + n + '} P(X = i)'; }
        pr = Math.min(1, pr);
        out.prob.innerHTML = md('$' + tex + '$') + ' <b style="color:' + C.acc + '">' + eqv(pr, 4) + '</b>';
        out.e.textContent = nt(rnd(E, 4), 2);
        out.v.textContent = nt(rnd(E * (1 - p), 6), 4);
        out.s.textContent = nf(Math.sqrt(E * (1 - p)), 3);
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 14. Nombres complexes : multiplier par z                            */
  /* ================================================================== */
  EM.demos.register({
    id: 'complexes-multiplication',
    titre: 'Multiplier par z : tourner et agrandir',
    chapitres: ['ts-complexes', 'ts-similitudes'],
    resume: 'Déplace les points d\'affixes z et w : le point d\'affixe zw s\'obtient en tournant w d\'un angle arg z et en multipliant sa distance à O par |z|.',
    render: function (el) {
      var F = new Frame(-3.3, 3.3, -3.3, 3.3, 330);
      var st = { r: 1.2, t: 50, w: [2, -0.5] };
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Plan complexe : points d\'affixes 1, z, w et zw', { max: 470 }),
        controls: slider('r', 'Module $|z|$', 0.2, 2, 0.05, st.r) + slider('t', 'Argument $\\arg z$ (en degrés)', -180, 180, 1, st.t),
        readout: '<div class="table-wrap"><table class="t" style="font-size:.86rem"><thead><tr><th></th><th>Forme algébrique</th><th>Module</th><th>Argument</th></tr></thead><tbody>' +
          ['z', 'w', 'p'].map(function (k) {
            var nm = k === 'p' ? sw(C.acc, it('zw')) : k === 'z' ? sw(C.blue, it('z')) : it('w');
            return '<tr><th>' + nm + '</th><td data-o="' + k + 'a"></td><td data-o="' + k + 'm"></td><td data-o="' + k + 'g"></td></tr>';
          }).join('') + '</tbody></table></div>' +
          '<div style="margin-top:6px">' + md('$|zw| = |z| \\times |w|$') + ' : <span data-o="mods"></span></div>' +
          '<div>' + md('$\\arg(zw) = \\arg z + \\arg w$') + ' : <span data-o="args"></span></div><p data-o="msg" class="small" style="margin:4px 0 0"></p>',
        note: md('Observe : multiplier par $z$, c\'est tourner autour de $O$ d\'un angle $\\arg z$ et multiplier les distances à $O$ par $|z|$ (une similitude directe de centre $O$). ' +
          'Les triangles formés par $O$, $1$, $z$ (en bleu) et par $O$, $w$, $zw$ (en rouge) sont semblables.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el), o = F.P([0, 0]), u = F.P([1, 0]);
      S.draw('bg', axes(F, { gx: 1, xname: 'Re', yname: 'Im' }) + circle(o, q(F.X(1) - F.X(0)), stroke(C.muted, 1, DASH)));
      var rR = bindRange(el, 'r', function (v) { return nt(v); }, function (v) { st.r = v; update(); });
      var rT = bindRange(el, 't', function (v) { return nt(v, 0) + '°'; }, function (v) { st.t = v; update(); });
      S.handle({
        label: 'Point d\'affixe w', color: C.line, step: 0.1,
        get: function () { return st.w; },
        set: function (x, y) {
          var p = [clamp(rnd(x, 1), -3.1, 3.1), clamp(rnd(y, 1), -3.1, 3.1)];
          if (p[0] * p[0] + p[1] * p[1] >= 0.04) st.w = p;
        }
      });
      S.handle({
        label: 'Point d\'affixe z', color: C.blue,
        get: function () { return [st.r * Math.cos(rad(st.t)), st.r * Math.sin(rad(st.t))]; },
        set: function (x, y) {
          st.r = clamp(rnd(snap(Math.sqrt(x * x + y * y), 0.05), 2), 0.2, 2);
          var t = Math.round(deg(Math.atan2(y, x)));
          st.t = t === -180 ? 180 : t;
        },
        key: function (dx, dy) {
          if (dy) st.r = clamp(rnd(st.r + 0.05 * dy, 2), 0.2, 2);
          if (dx) { st.t -= dx; if (st.t > 180) st.t -= 360; if (st.t <= -180) st.t += 360; }
        }
      });
      S.onchange = function () { rR.set(st.r); rT.set(st.t); update(); };
      function arcArrow(c, r, a1, d, col) {
        var e = a1 + d, tip = [c[0] + r * Math.cos(e), c[1] + r * Math.sin(e)], sg = d > 0 ? 1 : -1;
        var tg = [-Math.sin(e) * sg, Math.cos(e) * sg], nn = [-tg[1], tg[0]];
        return path(arcD(c, r, a1, d), stroke(col, 1.6)) +
          polygon([tip, [tip[0] - tg[0] * 8 + nn[0] * 4, tip[1] - tg[1] * 8 + nn[1] * 4], [tip[0] - tg[0] * 8 - nn[0] * 4, tip[1] - tg[1] * 8 - nn[1] * 4]], fill(col));
      }
      function argN(a) { a = mod(a, 360); return a > 180 ? a - 360 : a; }
      function update() {
        var z = [st.r * Math.cos(rad(st.t)), st.r * Math.sin(rad(st.t))], w = st.w;
        var P = [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];
        var zp = F.P(z), wp = F.P(w), pp = F.P(P), s = '';
        s += polygon([o, u, zp], fill(C.blue, 0.14)) + polygon([o, wp, pp], fill(C.acc, 0.14));
        s += line(u, zp, stroke(C.blue, 1.2, DASH)) + line(wp, pp, stroke(C.acc, 1.2, DASH));
        s += line(o, zp, stroke(C.blue, 2.2)) + line(o, wp, stroke(C.line, 2)) + line(o, pp, stroke(C.acc, 2.4));
        if (Math.abs(st.t) >= 4) {
          var aw = Math.atan2(-w[1], w[0]), rw = Math.min(46, 0.55 * dist(o, wp));
          s += arcArrow(o, 22, 0, -rad(st.t), C.blue);
          if (rw > 14) s += arcArrow(o, q(rw), aw, -rad(st.t), C.acc);
        }
        s += dot(o) + dot(u) + text([u[0], u[1] + 17], '1', { size: 13 });
        s += dot(pp, C.acc, 5);
        s += lab(zp, 'z', [z[0], -z[1]], { color: C.blue, k: 19, F: F }) + lab(wp, 'w', [w[0], -w[1]], { k: 19, F: F }) +
          lab(pp, 'zw', [P[0], -P[1]], { color: C.acc, k: 14, F: F, bold: true });
        S.draw('main', s);
        S.sync();
        var mz = st.r, mw = Math.sqrt(w[0] * w[0] + w[1] * w[1]), mp = mz * mw;
        var az = st.t, awd = deg(Math.atan2(w[1], w[0])), ap = deg(Math.atan2(P[1], P[0]));
        function ang(a) { return (Math.abs(a - rnd(a, 1)) < 1e-6 ? '' : '\u2248 ') + fdeg(a); }
        out.za.innerHTML = fmtC(z[0], z[1]); out.zm.textContent = nt(mz); out.zg.textContent = fdeg(az);
        out.wa.innerHTML = fmtC(w[0], w[1]); out.wm.textContent = eqv(mw, 2).replace('= ', ''); out.wg.textContent = ang(awd);
        out.pa.innerHTML = fmtC(P[0], P[1]); out.pm.textContent = eqv(mp, 2).replace('= ', ''); out.pg.textContent = ang(ap);
        out.mods.innerHTML = nt(mz) + ' × ' + nf(mw, 2) + ' \u2248 <b>' + nf(mp, 2) + '</b>';
        var aw1 = rnd(awd, 1), sm = rnd(az + aw1, 1), nm = argN(sm);
        out.args.innerHTML = fdeg(az) + ' + ' + (aw1 < 0 ? '(' + fdeg(aw1) + ')' : fdeg(aw1)) + ' = <b>' + fdeg(sm) + '</b>' + (Math.abs(nm - sm) > 1e-9 ? ', soit <b>' + fdeg(nm) + '</b> à 360° près' : '');
        out.msg.textContent = Math.abs(P[0]) > 3.3 || Math.abs(P[1]) > 3.3 ? 'Le point d\'affixe zw sort du cadre : rapproche z ou w de O.' : '';
      }
      update();
      return function () { S.destroy(); };
    }
  });

  /* ================================================================== */
  /* 15. Moyenne et médiane                                              */
  /* ================================================================== */
  EM.demos.register({
    id: 'moyenne-mediane',
    titre: 'Moyenne et médiane en direct',
    chapitres: ['4e-statistiques', '3e-statistiques', '2s-statistiques', '2l-statistiques', '1l-statistiques'],
    resume: 'Ajoute, déplace ou retire des notes : la moyenne et la médiane bougent sous tes yeux. Une valeur extrême tire la moyenne, pas la médiane.',
    render: function (el) {
      var W = 340, H = 176, AXY = 94, NMAX = 40;
      var F = new Frame(0, 20, 0, 1, W, H, { l: 18, r: 18 });
      var INIT = [8, 9, 10, 11, 12, 12, 13, 14, 15], vals = INIT.slice(), dragI = -1;
      var idNew = nid('note');
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Série de notes sur 20 représentée par des points au-dessus d\'un axe gradué'),
        controls: '<div class="demo-control"><label for="' + idNew + '">Ajouter une note (sur 20)</label><div style="display:flex;gap:8px">' +
          '<input class="inp" type="number" inputmode="decimal" min="0" max="20" step="0.5" value="16" id="' + idNew + '" style="width:6.5em">' + button('add', 'Ajouter', ' ') + '</div></div>' +
          buttons(button('pop', 'Retirer la dernière') + button('zero', 'Ajouter un 0') + button('reset', 'Réinitialiser')),
        readout: '<div style="' + ROW + '"><span>Effectif : <b data-o="n"></b></span><span>Moyenne : <b data-o="m" style="color:' + C.acc + '"></b></span>' +
          '<span>Médiane : <b data-o="me" style="color:' + C.green + '"></b></span></div>' +
          '<div style="' + ROW + '"><span>Étendue : <b data-o="e"></b></span><span>Écart type : <b data-o="s"></b></span></div>' +
          '<div class="small" style="margin-top:4px">Série rangée : <span data-o="sorted"></span></div><p data-o="msg" class="small" style="margin:4px 0 0"></p>',
        note: md('Touche l\'axe pour ajouter une note, touche un point pour le retirer, fais-le glisser pour le changer. Observe : une valeur extrême (un $0$ par exemple) fait beaucoup bouger la moyenne, ' +
          'mais presque pas la médiane, qui partage la série rangée en deux moitiés de même effectif.')
      });
      var svg = el.querySelector('[data-s="fig"]'), S = new Stage(svg, F), out = outs(el), inp = el.querySelector('#' + idNew);
      function valueAt(px) { return clamp(snap(F.inv(px, 0)[0], 0.5), 0, 20); }
      function stats() {
        var s = vals.slice().sort(function (a, b) { return a - b; }), n = s.length, m = sum(s) / n;
        var me = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        var v = sum(s.map(function (x) { return (x - m) * (x - m); })) / n;
        return { s: s, n: n, m: m, me: me, e: s[n - 1] - s[0], sd: Math.sqrt(v) };
      }
      function positions() {
        var seen = {}, mx = 1;
        vals.forEach(function (v) { seen[v] = (seen[v] || 0) + 1; mx = Math.max(mx, seen[v]); });
        var gap = Math.min(13, (AXY - 16) / mx);
        seen = {};
        return vals.map(function (v) { seen[v] = (seen[v] || 0) + 1; return [F.X(v), AXY - 9 - (seen[v] - 1) * gap]; });
      }
      function edgeText(x, y, s, o) {
        var wd = s.length * (o.size || 12) * 0.6;
        o.anchor = x - wd / 2 < 2 ? 'start' : x + wd / 2 > W - 2 ? 'end' : 'middle';
        return text([o.anchor === 'start' ? 2 : o.anchor === 'end' ? W - 2 : x, y], s, o);
      }
      function update() {
        var t = stats(), pos = positions(), s = '', x;
        s += line([F.X(0) - 8, AXY], [F.X(20) + 8, AXY], stroke(C.line, 1.5));
        for (x = 0; x <= 20; x++) {
          s += line([F.X(x), AXY - (x % 5 ? 3 : 5)], [F.X(x), AXY + (x % 5 ? 3 : 5)], stroke(C.muted, 1));
          if (x % 2 === 0) s += text([F.X(x), AXY + 18], String(x), { size: 11, color: C.muted });
        }
        var xm = F.X(t.m), xe = F.X(t.me);
        s += line([xm, 6], [xm, AXY], stroke(C.acc, 1.5, DASH)) + line([xe, 6], [xe, AXY], stroke(C.green, 1.5, 'stroke-dasharray:2 3;'));
        pos.forEach(function (p, i) { s += circle(p, i === dragI ? 7 : 5.5, shape(C.blue, i === dragI ? 0.9 : 0.75, 'var(--demo-bg,var(--surface-2))', 1.5)); });
        s += polygon([[xm, AXY + 25], [xm - 6, AXY + 35], [xm + 6, AXY + 35]], fill(C.acc)) + edgeText(xm, AXY + 50, 'moyenne ' + nt(t.m, 2), { size: 12, bold: true, color: C.acc });
        s += polygon([[xe, AXY + 55], [xe - 6, AXY + 65], [xe + 6, AXY + 65]], fill(C.green)) + edgeText(xe, AXY + 80, 'médiane ' + nt(t.me, 2), { size: 12, bold: true, color: C.green });
        S.draw('main', s);
        out.n.textContent = t.n;
        out.m.textContent = eqv(t.m, 2).replace('= ', '');
        out.me.textContent = nt(t.me, 2);
        out.e.textContent = nt(t.e, 2);
        out.s.textContent = '\u2248 ' + nf(t.sd, 2);
        var lo = t.n % 2 ? (t.n - 1) / 2 : t.n / 2 - 1, hi = t.n % 2 ? lo : lo + 1;
        out.sorted.innerHTML = t.s.map(function (v, i) { return i >= lo && i <= hi ? '<b style="color:' + C.green + '">' + nt(v) + '</b>' : nt(v); }).join(' ; ');
        out.msg.textContent = t.n % 2 ? 'Effectif impair : la médiane est la valeur du milieu de la série rangée.' :
          'Effectif pair : la médiane est la moyenne des deux valeurs du milieu de la série rangée.';
      }
      function addVal(v) { if (vals.length < NMAX && isFinite(v)) { vals.push(clamp(snap(v, 0.5), 0, 20)); update(); } }
      var press = null;
      function down(e) {
        if (e.button != null && e.button > 0) return;
        var p = S.local(e), pos = positions(), R = S.grabR(), best = -1, bd = R;
        pos.forEach(function (q0, i) { var d = dist(q0, p); if (d < bd) { bd = d; best = i; } });
        press = { i: best, p0: p, moved: false };
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
        e.preventDefault();
      }
      function move(e) {
        if (!press) return;
        var p = S.local(e);
        if (!press.moved && dist(p, press.p0) > 5) press.moved = true;
        if (press.moved && press.i >= 0) { dragI = press.i; vals[press.i] = valueAt(p[0]); update(); }
      }
      function up(e) {
        if (!press) return;
        var p = S.local(e), pr = press;
        press = null; dragI = -1;
        if (!pr.moved) {
          if (pr.i >= 0) { if (vals.length > 1) vals.splice(pr.i, 1); }
          else if (p[1] > 4 && p[1] < AXY + 28) { addVal(valueAt(p[0])); return; }
        }
        update();
      }
      svg.addEventListener('pointerdown', down);
      svg.addEventListener('pointermove', move);
      svg.addEventListener('pointerup', up);
      svg.addEventListener('pointercancel', function () { press = null; dragI = -1; update(); });
      onAct(el, {
        add: function () { addVal(parseFloat(String(inp.value).replace(',', '.'))); },
        pop: function () { if (vals.length > 1) { vals.pop(); update(); } },
        zero: function () { addVal(0); },
        reset: function () { vals = INIT.slice(); update(); }
      });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addVal(parseFloat(String(inp.value).replace(',', '.'))); } });
      update();
      return function () { S.destroy(); svg.removeEventListener('pointerdown', down); svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); };
    }
  });

  /* ================================================================== */
  /* 16. Homothétie                                                      */
  /* ================================================================== */
  EM.demos.register({
    id: 'homothetie',
    titre: 'Homothétie : centre et rapport',
    chapitres: ['2s-transformations', '2s-vecteurs-barycentre', '3e-vecteurs', '1s1-transformations'],
    resume: 'Fais varier le rapport k et déplace le centre O : l\'image du triangle s\'agrandit, rétrécit ou passe de l\'autre côté de O, avec OA′ = k × OA en vecteurs.',
    render: function (el) {
      var F = new Frame(-6, 6, -4.4, 4.4, 340);
      var st = { k: 2, O: [-5.5, -4], T: [[-4, -2], [-2.5, -2.5], [-3.5, -0.5]] };
      var NAMES = ['A', 'B', 'C'];
      el.innerHTML = layout({
        stage: svgTag('fig', F, 'Triangle ABC et son image par l\'homothétie de centre O et de rapport k'),
        controls: slider('k', 'Rapport $k$', -3, 3, 0.1, st.k),
        readout: '<div data-o="kind" style="margin-bottom:4px"></div><div data-o="l1"></div><div data-o="l2"></div><div data-o="l3"></div>',
        note: md('Observe : $O$, $A$ et $A\'$ sont toujours alignés, avec $\\overrightarrow{OA\'} = k\\,\\overrightarrow{OA}$. Les longueurs sont multipliées par $|k|$, les aires par $k^2$, et chaque côté de l\'image est parallèle au côté correspondant. ' +
          'Avec $k = -1$, tu retrouves la symétrie centrale de centre $O$. Tu peux aussi faire glisser $A\'$.')
      });
      var S = new Stage(el.querySelector('[data-s="fig"]'), F), out = outs(el);
      S.draw('bg', gridOnly(F, 1));
      var MSG = {};
      function M(s) { if (!MSG[s]) MSG[s] = md(s); return MSG[s]; }
      var rK = bindRange(el, 'k', function (v) { return nt(v, 1); }, function (v) { st.k = rnd(v, 1); update(); });
      function sp(x, y) { return [clamp(snap(x, 0.5), -5.5, 5.5), clamp(snap(y, 0.5), -4, 4)]; }
      function img(p) { return [st.O[0] + st.k * (p[0] - st.O[0]), st.O[1] + st.k * (p[1] - st.O[1])]; }
      S.handle({ label: 'Centre O', color: C.line, step: 0.5, get: function () { return st.O; }, set: function (x, y) { st.O = sp(x, y); } });
      [0, 1, 2].forEach(function (i) {
        S.handle({ label: 'Sommet ' + NAMES[i], color: C.blue, step: 0.5, get: function () { return st.T[i]; }, set: function (x, y) { st.T[i] = sp(x, y); } });
      });
      var hA2 = S.handle({
        label: 'Image A′ (règle le rapport k)', color: C.acc,
        get: function () { return img(st.T[0]); },
        set: function (x, y) {
          var v = [st.T[0][0] - st.O[0], st.T[0][1] - st.O[1]], n2 = v[0] * v[0] + v[1] * v[1];
          if (n2 < 0.01) return;
          var k = clamp(rnd(((x - st.O[0]) * v[0] + (y - st.O[1]) * v[1]) / n2, 1), -3, 3);
          if (k !== 0) st.k = k;
        },
        key: function (dx, dy) { var k = clamp(rnd(st.k + 0.1 * (dx || dy), 1), -3, 3); if (k !== 0) st.k = k; }
      });
      S.onchange = function () { rK.set(st.k); update(); };
      function cen(a) { return [(a[0][0] + a[1][0] + a[2][0]) / 3, (a[0][1] + a[1][1] + a[2][1]) / 3]; }
      function update() {
        var k = st.k, T = st.T, I = T.map(img), o = F.P(st.O), s = '', i;
        var tp = T.map(function (p) { return F.P(p); }), ip = I.map(function (p) { return F.P(p); });
        hA2.hidden = k === 0;
        for (i = 0; i < 3; i++) {
          var c3 = [o, tp[i], ip[i]], e1 = o, e2 = tp[i], best = -1;
          for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) { var d = dist(c3[a], c3[b]); if (d > best) { best = d; e1 = c3[a]; e2 = c3[b]; } }
          s += line(e1, e2, stroke(C.muted, 1.1, DASH));
        }
        s += polygon(tp, shape(C.blue, 0.14, C.blue, 2));
        if (k !== 0) s += polygon(ip, shape(C.acc, 0.14, C.acc, 2));
        var gt = F.P(cen(T)), gi = F.P(cen(I));
        for (i = 0; i < 3; i++) {
          if (k !== 0) s += (i ? dot(ip[i], C.acc, 3.5) : '') + lab(ip[i], NAMES[i] + PRIME, [ip[i][0] - gi[0], ip[i][1] - gi[1]], { color: C.acc, k: i ? 15 : 20, F: F });
          s += lab(tp[i], NAMES[i], [tp[i][0] - gt[0], tp[i][1] - gt[1]], { color: C.blue, k: 20, F: F });
        }
        s += lab(o, 'O', [-0.7, 0.75], { k: 19, F: F });
        S.draw('main', s);
        S.sync();
        out.kind.innerHTML = '<b>' + (k === 0 ? M('$k = 0$ n\'est pas permis : tous les points iraient en $O$.') :
          k === 1 ? M('$k = 1$ : chaque point est sa propre image.') : k === -1 ? M('$k = -1$ : c\'est la symétrie centrale de centre $O$.') :
            k > 1 ? M('$k > 1$ : agrandissement, l\'image est du même côté de $O$.') : k > 0 ? M('$0 < k < 1$ : réduction, l\'image est du même côté de $O$.') :
              k > -1 ? M('$-1 < k < 0$ : réduction, l\'image passe de l\'autre côté de $O$.') : M('$k < -1$ : agrandissement, l\'image passe de l\'autre côté de $O$.')) + '</b>';
        if (k === 0) { out.l1.innerHTML = out.l2.innerHTML = out.l3.innerHTML = ''; return; }
        var A1 = it('A' + PRIME), B1 = it('B' + PRIME), OA = dist(st.O, T[0]), AB = dist(T[0], T[1]), ar = aireTri(T[0], T[1], T[2]);
        out.l1.innerHTML = it('OA') + ' = ' + nf(OA, 2) + ' ; ' + it('O') + A1 + ' = ' + nf(Math.abs(k) * OA, 2) +
          (OA > 1e-9 ? ' ; ' + it('O') + A1 + ' ÷ ' + it('OA') + ' = <b>' + nt(Math.abs(k), 1) + '</b> = |' + it('k') + '|' : '');
        out.l2.innerHTML = it('AB') + ' = ' + nf(AB, 2) + ' ; ' + A1 + B1 + ' = ' + nf(Math.abs(k) * AB, 2) +
          (AB > 1e-9 ? ' ; ' + A1 + B1 + ' ÷ ' + it('AB') + ' = <b>' + nt(Math.abs(k), 1) + '</b>' : '');
        out.l3.innerHTML = 'Aires : ' + nt(rnd(ar, 3), 3) + ' et ' + nt(rnd(k * k * ar, 3), 3) + (ar > 1e-9 ? ' ; rapport <b>' + nt(rnd(k * k, 2), 2) + '</b> = ' + it('k') + '²' : '') + ' carreaux.';
      }
      update();
      return function () { S.destroy(); };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
