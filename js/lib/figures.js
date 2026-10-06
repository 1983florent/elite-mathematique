/*
 * Petites figures géométriques en SVG (triangles, cercles, repères, courbes…).
 * Coordonnées mathématiques (axe des ordonnées vers le haut).
 * Les couleurs viennent de la feuille de style (classes fig-*), donc le mode sombre suit.
 *
 * Exemple :
 *   var f = EM.fig.fit([[0,0],[4,0],[0,3]]);
 *   f.poly([[0,0],[4,0],[0,3]]);
 *   f.rightAngle([4,0],[0,0],[0,3]);
 *   f.point([0,0],'A','so'); f.point([4,0],'B','se'); f.point([0,3],'C','n');
 *   f.segLabel([0,0],[4,0],'4 cm');
 *   html = f.svg();
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function r2(x) { return Math.round(x * 100) / 100; }

  var DIRS = {
    n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0], w: [-1, 0],
    ne: [0.75, -0.75], no: [-0.75, -0.75], nw: [-0.75, -0.75], se: [0.75, 0.75], so: [-0.75, 0.75], sw: [-0.75, 0.75]
  };

  function Fig(opt) {
    this.w = opt.w || 300;
    this.h = opt.h || 220;
    this.xmin = opt.xmin; this.xmax = opt.xmax; this.ymin = opt.ymin; this.ymax = opt.ymax;
    this.parts = [];
    this.title = opt.title || 'Figure';
  }
  Fig.prototype.X = function (x) { return r2((x - this.xmin) / (this.xmax - this.xmin) * this.w); };
  Fig.prototype.Y = function (y) { return r2((this.ymax - y) / (this.ymax - this.ymin) * this.h); };
  Fig.prototype.P = function (p) { return [this.X(p[0]), this.Y(p[1])]; };
  Fig.prototype.add = function (s) { this.parts.push(s); return this; };
  Fig.prototype.cls = function (o, base) { return base + (o && o.accent ? ' fig-accent' : '') + (o && o.dash ? ' fig-dash' : '') + (o && o.light ? ' fig-light' : ''); };

  Fig.prototype.seg = function (A, B, o) {
    var a = this.P(A), b = this.P(B);
    return this.add('<line class="' + this.cls(o, 'fig-line') + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>');
  };
  /** Droite (AB) prolongée jusqu'aux bords de la figure. */
  Fig.prototype.line = function (A, B, o) {
    var dx = B[0] - A[0], dy = B[1] - A[1];
    var L = 4 * Math.max(this.xmax - this.xmin, this.ymax - this.ymin);
    var n = Math.sqrt(dx * dx + dy * dy) || 1;
    return this.seg([A[0] - dx / n * L, A[1] - dy / n * L], [A[0] + dx / n * L, A[1] + dy / n * L], o);
  };
  Fig.prototype.vector = function (A, B, o) {
    var a = this.P(A), b = this.P(B);
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 9;
    var p1 = [r2(b[0] - s * Math.cos(ang - 0.4)), r2(b[1] - s * Math.sin(ang - 0.4))];
    var p2 = [r2(b[0] - s * Math.cos(ang + 0.4)), r2(b[1] - s * Math.sin(ang + 0.4))];
    this.add('<line class="' + this.cls(o, 'fig-line') + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>');
    return this.add('<polygon class="' + this.cls(o, 'fig-head') + '" points="' + b.join(',') + ' ' + p1.join(',') + ' ' + p2.join(',') + '"/>');
  };
  Fig.prototype.poly = function (pts, o) {
    var self = this;
    var s = pts.map(function (p) { return self.P(p).join(','); }).join(' ');
    return this.add('<polygon class="' + this.cls(o, 'fig-line' + (o && o.fill ? ' fig-fill' : ' fig-nofill')) + '" points="' + s + '"/>');
  };
  Fig.prototype.polyline = function (pts, o) {
    var self = this;
    var s = pts.map(function (p) { return self.P(p).join(','); }).join(' ');
    return this.add('<polyline class="' + this.cls(o, 'fig-line fig-nofill') + '" points="' + s + '"/>');
  };
  Fig.prototype.circle = function (O, r, o) {
    var c = this.P(O);
    var rx = r2(r / (this.xmax - this.xmin) * this.w);
    return this.add('<circle class="' + this.cls(o, 'fig-line' + (o && o.fill ? ' fig-fill' : ' fig-nofill')) + '" cx="' + c[0] + '" cy="' + c[1] + '" r="' + rx + '"/>');
  };
  Fig.prototype.dot = function (A, o) {
    var a = this.P(A);
    return this.add('<circle class="' + this.cls(o, 'fig-dot') + '" cx="' + a[0] + '" cy="' + a[1] + '" r="3"/>');
  };
  /** Texte placé à côté d'un point. pos : n, s, e, o, ne, no, se, so */
  Fig.prototype.label = function (A, txt, pos, o) {
    var a = this.P(A), d = DIRS[pos || 'ne'] || DIRS.ne, k = 13;
    var x = r2(a[0] + d[0] * k), y = r2(a[1] + d[1] * k + 5);
    var anchor = d[0] > 0.1 ? 'start' : d[0] < -0.1 ? 'end' : 'middle';
    if (d[0] > 0.1) x = r2(x - 4); else if (d[0] < -0.1) x = r2(x + 4);
    return this.add('<text class="' + this.cls(o, 'fig-text') + '" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '">' + esc(txt) + '</text>');
  };
  Fig.prototype.point = function (A, name, pos, o) {
    this.dot(A, o);
    if (name) this.label(A, name, pos, o);
    return this;
  };
  /** Étiquette au milieu d'un segment, décalée vers l'extérieur (côté opposé à 'inside' si fourni). */
  Fig.prototype.segLabel = function (A, B, txt, o) {
    o = o || {};
    var a = this.P(A), b = this.P(B);
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var nx = -(b[1] - a[1]), ny = b[0] - a[0];
    var n = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= n; ny /= n;
    if (o.inside) {
      var c = this.P(o.inside);
      if ((c[0] - mx) * nx + (c[1] - my) * ny > 0) { nx = -nx; ny = -ny; }
    } else if (o.flip) { nx = -nx; ny = -ny; }
    var k = o.k || 14;
    return this.add('<text class="' + this.cls(o, 'fig-text fig-small') + '" x="' + r2(mx + nx * k) + '" y="' + r2(my + ny * k + 4) + '" text-anchor="middle">' + esc(txt) + '</text>');
  };
  /** Petit carré d'angle droit en B (angle ABC). */
  Fig.prototype.rightAngle = function (A, B, C, o) {
    var b = this.P(B), a = this.P(A), c = this.P(C), s = 10;
    function u(p) { var dx = p[0] - b[0], dy = p[1] - b[1], n = Math.sqrt(dx * dx + dy * dy) || 1; return [dx / n, dy / n]; }
    var ua = u(a), uc = u(c);
    var p1 = [r2(b[0] + ua[0] * s), r2(b[1] + ua[1] * s)];
    var p2 = [r2(b[0] + (ua[0] + uc[0]) * s), r2(b[1] + (ua[1] + uc[1]) * s)];
    var p3 = [r2(b[0] + uc[0] * s), r2(b[1] + uc[1] * s)];
    return this.add('<polyline class="' + this.cls(o, 'fig-line fig-nofill fig-thin') + '" points="' + p1.join(',') + ' ' + p2.join(',') + ' ' + p3.join(',') + '"/>');
  };
  /** Arc marquant l'angle ABC (sommet B), avec une étiquette facultative. */
  Fig.prototype.angle = function (A, B, C, txt, o) {
    o = o || {};
    var b = this.P(B), a = this.P(A), c = this.P(C), r = o.r || 22;
    var a1 = Math.atan2(a[1] - b[1], a[0] - b[0]);
    var a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
    var d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    var p1 = [r2(b[0] + r * Math.cos(a1)), r2(b[1] + r * Math.sin(a1))];
    var p2 = [r2(b[0] + r * Math.cos(a1 + d)), r2(b[1] + r * Math.sin(a1 + d))];
    this.add('<path class="' + this.cls(o, 'fig-line fig-nofill fig-thin') + '" d="M' + p1.join(',') + ' A' + r + ',' + r + ' 0 0,' + (d > 0 ? 1 : 0) + ' ' + p2.join(',') + '"/>');
    if (txt) {
      var mid = a1 + d / 2, k = r + 13;
      this.add('<text class="fig-text fig-small" x="' + r2(b[0] + k * Math.cos(mid)) + '" y="' + r2(b[1] + k * Math.sin(mid) + 4) + '" text-anchor="middle">' + esc(txt) + '</text>');
    }
    return this;
  };
  /** Marques de longueurs égales sur [AB] (n petits traits). */
  Fig.prototype.ticks = function (A, B, n, o) {
    var a = this.P(A), b = this.P(B);
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    for (var i = 0; i < (n || 1); i++) {
      var off = (i - ((n || 1) - 1) / 2) * 4;
      var cx = mx + ux * off, cy = my + uy * off;
      this.add('<line class="' + this.cls(o, 'fig-line fig-thin') + '" x1="' + r2(cx - nx * 5) + '" y1="' + r2(cy - ny * 5) + '" x2="' + r2(cx + nx * 5) + '" y2="' + r2(cy + ny * 5) + '"/>');
    }
    return this;
  };
  /** Repère avec graduations (et quadrillage léger si grid). */
  Fig.prototype.axes = function (o) {
    o = o || {};
    var step = o.step || 1, s = '';
    if (o.grid !== false) {
      for (var gx = Math.ceil(this.xmin / step) * step; gx <= this.xmax; gx += step)
        s += '<line class="fig-grid" x1="' + this.X(gx) + '" y1="0" x2="' + this.X(gx) + '" y2="' + this.h + '"/>';
      for (var gy = Math.ceil(this.ymin / step) * step; gy <= this.ymax; gy += step)
        s += '<line class="fig-grid" x1="0" y1="' + this.Y(gy) + '" x2="' + this.w + '" y2="' + this.Y(gy) + '"/>';
    }
    this.add(s);
    if (this.ymin <= 0 && this.ymax >= 0) this.vector([this.xmin, 0], [this.xmax, 0], { light: true });
    if (this.xmin <= 0 && this.xmax >= 0) this.vector([0, this.ymin], [0, this.ymax], { light: true });
    if (o.labels !== false) {
      var lab = o.labelStep || step;
      for (var x = Math.ceil(this.xmin / lab) * lab; x < this.xmax; x += lab) {
        if (Math.abs(x) < 1e-9) continue;
        this.add('<text class="fig-text fig-tiny" x="' + this.X(x) + '" y="' + r2(this.Y(0) + 13) + '" text-anchor="middle">' + String(r2(x)).replace('.', ',') + '</text>');
      }
      for (var y = Math.ceil(this.ymin / lab) * lab; y < this.ymax; y += lab) {
        if (Math.abs(y) < 1e-9) continue;
        this.add('<text class="fig-text fig-tiny" x="' + r2(this.X(0) - 5) + '" y="' + r2(this.Y(y) + 4) + '" text-anchor="end">' + String(r2(y)).replace('.', ',') + '</text>');
      }
      this.add('<text class="fig-text fig-tiny" x="' + r2(this.X(0) - 5) + '" y="' + r2(this.Y(0) + 13) + '" text-anchor="end">O</text>');
    }
    return this;
  };
  /** Courbe d'une fonction f sur [a, b]. */
  Fig.prototype.curve = function (f, o) {
    o = o || {};
    var a = o.from == null ? this.xmin : o.from, b = o.to == null ? this.xmax : o.to;
    var n = o.n || 200, d = '', pen = false;
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y) || y > this.ymax + 50 * (this.ymax - this.ymin) || y < this.ymin - 50 * (this.ymax - this.ymin)) { pen = false; continue; }
      var X = this.X(x), Y = this.Y(Math.max(this.ymin - 2 * (this.ymax - this.ymin), Math.min(this.ymax + 2 * (this.ymax - this.ymin), y)));
      d += (pen ? 'L' : 'M') + X + ',' + Y + ' ';
      pen = true;
    }
    return this.add('<path class="' + this.cls(o, 'fig-curve fig-nofill') + '" d="' + d + '"/>');
  };
  /** Rectangle (pour histogrammes / diagrammes en barres) en coordonnées mathématiques. */
  Fig.prototype.rect = function (x, y, w, h, o) {
    var X = this.X(x), Y = this.Y(y + h), W = r2(this.X(x + w) - X), H = r2(this.Y(y) - Y);
    return this.add('<rect class="' + this.cls(o, 'fig-line fig-fill') + '" x="' + X + '" y="' + Y + '" width="' + W + '" height="' + H + '"/>');
  };
  /** Texte libre en coordonnées mathématiques. */
  Fig.prototype.text = function (A, txt, o) {
    o = o || {};
    var a = this.P(A);
    return this.add('<text class="' + this.cls(o, 'fig-text' + (o.small ? ' fig-small' : '')) + '" x="' + a[0] + '" y="' + a[1] + '" text-anchor="' + (o.anchor || 'middle') + '">' + esc(txt) + '</text>');
  };
  Fig.prototype.svg = function () {
    return '<svg class="fig" viewBox="0 0 ' + this.w + ' ' + this.h + '" width="' + this.w + '" height="' + this.h +
      '" role="img" aria-label="' + esc(this.title) + '" xmlns="http://www.w3.org/2000/svg">' + this.parts.join('') + '</svg>';
  };
  Fig.prototype.toString = Fig.prototype.svg;

  /**
   * Crée une figure qui contient tous les points donnés, en gardant les proportions.
   * opt : { w: largeur max en px (300), h: hauteur max (240), pad: marge en px (28) }
   */
  function fit(points, opt) {
    opt = opt || {};
    var W = opt.w || 300, H = opt.h || 240, pad = opt.pad == null ? 28 : opt.pad;
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var dx = (x1 - x0) || 1, dy = (y1 - y0) || 1;
    var k = Math.min((W - 2 * pad) / dx, (H - 2 * pad) / dy);
    var w = Math.round(dx * k + 2 * pad), h = Math.round(dy * k + 2 * pad);
    return new Fig({ w: w, h: h, xmin: x0 - pad / k, xmax: x1 + pad / k, ymin: y0 - pad / k, ymax: y1 + pad / k, title: opt.title });
  }
  /** Crée une figure avec une fenêtre explicite. */
  function create(opt) {
    var f = new Fig(opt);
    if (opt.w && !opt.h) f.h = Math.round(opt.w * (opt.ymax - opt.ymin) / (opt.xmax - opt.xmin));
    return f;
  }

  EM.fig = { fit: fit, create: create, Fig: Fig };
})(typeof window !== 'undefined' ? window : globalThis);
