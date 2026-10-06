/*
 * Rendu du texte mathématique : les morceaux $…$ (en ligne) et $$…$$ (centrés)
 * sont convertis par KaTeX. Le reste est du HTML écrit par nos soins.
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  var MACROS = {
    '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\Q': '\\mathbb{Q}', '\\C': '\\mathbb{C}',
    '\\D': '\\mathbb{D}',
    '\\vect': '\\overrightarrow{#1}',
    '\\Card': '\\operatorname{Card}'
  };

  /** Découpe une chaîne en segments texte / maths. */
  function split(str) {
    var out = [], i = 0, s = String(str == null ? '' : str);
    while (i < s.length) {
      var j = s.indexOf('$', i);
      while (j > 0 && s[j - 1] === '\\') j = s.indexOf('$', j + 1);
      if (j < 0) { out.push({ t: 'text', v: s.slice(i) }); break; }
      if (j > i) out.push({ t: 'text', v: s.slice(i, j) });
      var display = s[j + 1] === '$';
      var open = display ? 2 : 1;
      var k = s.indexOf(display ? '$$' : '$', j + open);
      while (k > 0 && s[k - 1] === '\\' && !display) k = s.indexOf('$', k + 1);
      if (k < 0) { out.push({ t: 'text', v: s.slice(j) }); break; }
      out.push({ t: display ? 'display' : 'inline', v: s.slice(j + open, k) });
      i = k + open;
    }
    return out;
  }

  function texToHtml(tex, display, throwOnError) {
    var K = root.katex;
    if (!K) return '<code>' + EM.util.esc(tex) + '</code>';
    return K.renderToString(tex, {
      displayMode: !!display,
      throwOnError: !!throwOnError,
      macros: Object.assign({}, MACROS),
      strict: false,
      trust: false
    });
  }

  /** Convertit une chaîne « HTML + $TeX$ » en HTML prêt à insérer. */
  function md(str, opts) {
    opts = opts || {};
    return split(str).map(function (seg) {
      if (seg.t === 'text') return seg.v.replace(/\\\$/g, '$');
      return texToHtml(seg.v, seg.t === 'display', opts.throwOnError);
    }).join('');
  }

  EM.render = { split: split, tex: texToHtml, md: md, MACROS: MACROS };
  EM.md = md;
})(typeof window !== 'undefined' ? window : globalThis);
