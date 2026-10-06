/*
 * Motifs géométriques générés : un pavage de type Truchet (quarts de disque, demi-disques,
 * triangles, points) calculé à partir d'une graine. Chaque classe et chaque chapitre a le sien.
 * Les couleurs viennent de la feuille de style (classes m-*), donc le thème sombre suit.
 *
 * EM.motif('3e', { cols: 8, rows: 3 }) -> '<svg …>'
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  function r2(x) { return Math.round(x * 100) / 100; }

  /** Tracé d'une tuile de côté s en (x, y), tournée de q quarts de tour autour de son centre. */
  function tuile(type, x, y, s, q, cls) {
    var c = 'class="' + cls + '"';
    var tr = q ? ' transform="rotate(' + (q * 90) + ' ' + r2(x + s / 2) + ' ' + r2(y + s / 2) + ')"' : '';
    switch (type) {
      case 'quart': // quart de disque dans un coin
        return '<path ' + c + tr + ' d="M' + x + ' ' + y + 'H' + (x + s) + 'A' + s + ' ' + s + ' 0 0 1 ' + x + ' ' + (y + s) + 'Z"/>';
      case 'demi': // demi-disque posé sur un côté
        return '<path ' + c + tr + ' d="M' + x + ' ' + (y + s) + 'A' + r2(s / 2) + ' ' + r2(s / 2) + ' 0 0 1 ' + (x + s) + ' ' + (y + s) + 'Z"/>';
      case 'triangle':
        return '<path ' + c + tr + ' d="M' + x + ' ' + y + 'H' + (x + s) + 'L' + x + ' ' + (y + s) + 'Z"/>';
      case 'arcs': // deux arcs de Truchet reliant les milieux des côtés
        var h = r2(s / 2);
        return '<path ' + c.replace('class="', 'class="m-trait ') + tr + ' d="M' + r2(x + h) + ' ' + y + 'A' + h + ' ' + h + ' 0 0 1 ' + x + ' ' + r2(y + h) +
          'M' + r2(x + s) + ' ' + r2(y + h) + 'A' + h + ' ' + h + ' 0 0 0 ' + r2(x + h) + ' ' + (y + s) + '"/>';
      case 'point':
        return '<circle ' + c + ' cx="' + r2(x + s / 2) + '" cy="' + r2(y + s / 2) + '" r="' + r2(s * 0.2) + '"/>';
      case 'anneau': // quart d'anneau
        var R = s, rr = r2(s * 0.5);
        return '<path ' + c + tr + ' d="M' + x + ' ' + y + 'H' + (x + R) + 'A' + R + ' ' + R + ' 0 0 1 ' + x + ' ' + (y + R) + 'V' + r2(y + rr) +
          'A' + rr + ' ' + rr + ' 0 0 0 ' + r2(x + rr) + ' ' + y + 'Z"/>';
    }
    return '';
  }

  /**
   * opts : { cols (8), rows (3), taille (40 = côté d'une tuile dans le viewBox),
   *          densite (0..1, part de tuiles pleines, 0.8), classe (classe CSS supplémentaire), titre }
   */
  EM.motif = function (graine, opts) {
    opts = opts || {};
    var cols = opts.cols || 8, rows = opts.rows || 3, s = opts.taille || 40;
    var rng = new EM.RNG('motif:' + graine);
    var types = ['quart', 'quart', 'demi', 'triangle', 'arcs', 'point', 'anneau'];
    var couleurs = ['m-a', 'm-a', 'm-b', 'm-c', 'm-d'];
    var densite = opts.densite == null ? 0.8 : opts.densite;
    var out = '<rect class="m-fond" x="0" y="0" width="' + cols * s + '" height="' + rows * s + '"/>';
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        if (rng.next() > densite) continue;
        var t = rng.pick(types), q = rng.int(0, 3), cl = rng.pick(couleurs);
        out += tuile(t, i * s, j * s, s, q, cl);
        // une seconde couche légère sur certaines tuiles pour donner de la profondeur
        if (rng.next() < 0.18) out += tuile('point', i * s, j * s, s, 0, 'm-e');
      }
    }
    return '<svg class="motif' + (opts.classe ? ' ' + opts.classe : '') + '" viewBox="0 0 ' + cols * s + ' ' + rows * s +
      '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + (opts.titre || 'Motif géométrique') + '" xmlns="http://www.w3.org/2000/svg">' + out + '</svg>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
