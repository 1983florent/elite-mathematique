#!/usr/bin/env node
/*
 * Banc de tests d'ELITE MATHÉMATIQUE.
 *   node tests/run.js                 -> tout vérifier
 *   node tests/run.js --seeds 200     -> plus de tirages par générateur
 *   node tests/run.js --only 3e       -> seulement les générateurs dont l'id ou un chapitre contient « 3e »
 *   node tests/run.js --strict        -> un chapitre sans contenu est une erreur
 *
 * Pour chaque générateur et chaque niveau, on produit de nombreux exercices et on vérifie :
 *   - pas d'exception, énoncé et correction non vides ;
 *   - toutes les formules $…$ se compilent avec KaTeX ;
 *   - pas de « NaN », « undefined », « Infinity », ni d'écritures comme « + -3 » ;
 *   - la réponse attendue, saisie telle quelle, est acceptée par le correcteur ;
 *   - les chapitres cités existent dans le programme.
 */
'use strict';
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var args = process.argv.slice(2);
function arg(name, def) {
  var i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}
var SEEDS = parseInt(arg('--seeds', '40'), 10);
var ONLY = arg('--only', null);
var STRICT = args.indexOf('--strict') >= 0;
var FILES = arg('--files', null); // ne charger que les fichiers contenu-*/gen dont le nom contient ce texte

globalThis.katex = require(path.join(ROOT, 'vendor/katex/katex.min.js'));
function load(rel) { require(path.join(ROOT, rel)); }
load('js/lib/core.js');
load('js/lib/parser.js');
load('js/lib/render.js');
load('js/lib/figures.js');
load('js/data/programme.js');

function listDir(rel, re) {
  var dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(function (f) { return re.test(f); }).sort().map(function (f) { return rel + '/' + f; });
}
function keep(f) { return !FILES || path.basename(f).indexOf(FILES) >= 0 || /00-reference/.test(f); }
var dataFiles = listDir('js/data', /^contenu-.*\.js$/).filter(keep);
var genFiles = listDir('js/gen', /\.js$/).filter(keep);
var loadErrors = [];
dataFiles.concat(genFiles).forEach(function (f) {
  try { load(f); } catch (e) { loadErrors.push(f + ' : ' + (e && e.stack || e)); }
});

var EM = globalThis.EM;
var errors = [], warnings = [];
loadErrors.forEach(function (e) { errors.push('[chargement] ' + e); });

/* ---------- vérification du TeX ---------- */
function checkTeX(str, where) {
  if (str == null) return;
  if (typeof str !== 'string') { errors.push(where + ' : texte attendu, reçu ' + typeof str); return; }
  var segs = EM.render.split(str);
  segs.forEach(function (s) {
    if (s.t === 'text') {
      if (/\$/.test(s.v.replace(/\\\$/g, ''))) errors.push(where + ' : « $ » non apparié');
      return;
    }
    try {
      EM.render.tex(s.v, s.t === 'display', true);
    } catch (e) {
      errors.push(where + ' : TeX invalide « ' + s.v + ' » -> ' + e.message.split('\n')[0]);
    }
    var t = s.v.replace(/\\pm|\\mp/g, '');
    if (/(^|[^\\a-z])(\+\s*-|-\s*-|\+\s*\+|-\s*\+)\s*[\d\\a-z(]/i.test(t)) {
      errors.push(where + ' : signes consécutifs dans « ' + s.v + ' »');
    }
    if (/(^|[^\d.,{}\\a-zA-Z^_])1\s?[a-z](?![a-z])/.test(t.replace(/\\[a-zA-Z]+/g, ' '))) {
      warnings.push(where + ' : coefficient 1 écrit ? « ' + s.v + ' »');
    }
  });
  if (/NaN|undefined|Infinity|\[object Object\]/.test(str)) errors.push(where + ' : valeur suspecte dans « ' + str.slice(0, 120) + ' »');
}

/* ---------- saisie canonique d'une réponse attendue ---------- */
function numIn(x) {
  if (x instanceof EM.Frac) return x.n + '/' + x.d;
  if (typeof x === 'string') return x;
  return String(x);
}
function canonical(q) {
  switch (q.type) {
    case 'choice': return String(q.reponse);
    case 'text': return Array.isArray(q.reponse) ? q.reponse[0] : q.reponse;
    case 'expr': return q.reponse;
    case 'set': return q.reponse.length ? q.reponse.map(numIn).join(' ; ') : '∅';
    case 'tuple': return '(' + q.reponse.map(numIn).join(' ; ') + ')';
    case 'interval':
      var r = q.reponse;
      return (r.a === -Infinity || r.ouvA ? ']' : '[') + (r.a === -Infinity ? '-inf' : numIn(r.a)) + ' ; ' +
        (r.b === Infinity ? '+inf' : numIn(r.b)) + (r.b === Infinity || r.ouvB ? '[' : ']');
    default: return numIn(q.reponse);
  }
}
var TYPES = ['number', 'choice', 'text', 'expr', 'set', 'tuple', 'interval'];

/* ---------- générateurs ---------- */
var gens = EM.gen.list().filter(function (g) {
  if (!ONLY) return true;
  return g.id.indexOf(ONLY) >= 0 || g.chapitres.some(function (c) { return c.indexOf(ONLY) >= 0; });
});
var total = 0;
gens.forEach(function (g) {
  if (!g.titre) errors.push(g.id + ' : titre manquant');
  if (!g.chapitres.length) errors.push(g.id + ' : aucun chapitre');
  g.chapitres.forEach(function (c) {
    if (!EM.programme.chapitres[c]) errors.push(g.id + ' : chapitre inconnu « ' + c + ' »');
  });
  var errCount = errors.length;
  for (var lv = 1; lv <= g.niveaux; lv++) {
    for (var s = 0; s < SEEDS; s++) {
      if (errors.length - errCount > 6) break; // on n'inonde pas le rapport
      var where = g.id + ' [niv ' + lv + ', graine ' + s + ']';
      var ex;
      try { ex = EM.gen.make(g.id, s, lv); } catch (e) { errors.push(where + ' : exception ' + (e && e.stack || e)); continue; }
      total++;
      if (!ex.enonce || typeof ex.enonce !== 'string') errors.push(where + ' : énoncé vide');
      checkTeX(ex.enonce, where + ' énoncé');
      if (ex.figure != null && typeof ex.figure !== 'string') errors.push(where + ' : figure doit être une chaîne SVG');
      if (!Array.isArray(ex.questions) || !ex.questions.length) errors.push(where + ' : aucune question');
      if (!ex.solution.length) errors.push(where + ' : correction vide');
      ex.indices.forEach(function (h, i) { checkTeX(h, where + ' indice ' + i); });
      ex.solution.forEach(function (h, i) { checkTeX(h, where + ' correction ' + i); });
      (ex.questions || []).forEach(function (q, i) {
        var w = where + ' question ' + i;
        if (TYPES.indexOf(q.type || 'number') < 0) errors.push(w + ' : type inconnu ' + q.type);
        q.type = q.type || 'number';
        checkTeX(q.label, w + ' label');
        if (q.reponseTex) checkTeX('$' + q.reponseTex + '$', w + ' reponseTex');
        if (q.type === 'choice') {
          if (!Array.isArray(q.choix) || q.choix.length < 2) errors.push(w + ' : choix manquants');
          else {
            q.choix.forEach(function (c, j) { checkTeX(c, w + ' choix ' + j); });
            if (!(q.reponse >= 0 && q.reponse < q.choix.length)) errors.push(w + ' : index de réponse hors limites');
            var uniq = q.choix.filter(function (c, j) { return q.choix.indexOf(c) === j; });
            if (uniq.length !== q.choix.length) errors.push(w + ' : choix en double ' + JSON.stringify(q.choix));
          }
        }
        if (q.type === 'number') {
          var v = q.reponse instanceof EM.Frac ? q.reponse.value() : typeof q.reponse === 'string' ? NaN : q.reponse;
          if (typeof q.reponse === 'string') { try { v = EM.parser.evalNum(q.reponse); } catch (e) { v = NaN; } }
          if (!isFinite(v)) errors.push(w + ' : réponse numérique invalide ' + q.reponse);
        }
        var res = EM.check(q, canonical(q));
        if (!res.ok) errors.push(w + ' : la réponse attendue « ' + canonical(q) + ' » est refusée par le correcteur' + (res.msg ? ' (' + res.msg + ')' : ''));
        try {
          var at = EM.answerTeX(q);
          if (at != null) checkTeX('$' + at + '$', w + ' answerTeX');
        } catch (e) { errors.push(w + ' : answerTeX ' + e.message); }
      });
    }
  }
});

/* ---------- contenu des chapitres ---------- */
function walk(obj, where) {
  if (obj == null) return;
  if (typeof obj === 'string') return checkTeX(obj, where);
  if (Array.isArray(obj)) return obj.forEach(function (x, i) { walk(x, where + '[' + i + ']'); });
  if (typeof obj === 'object') Object.keys(obj).forEach(function (k) { walk(obj[k], where + '.' + k); });
}
var missing = [];
EM.programme.ordre.forEach(function (id) {
  var c = EM.contenu[id];
  if (!c) { missing.push(id); return; }
  walk(c, id);
  ['objectifs', 'cours', 'flashcards'].forEach(function (k) {
    if (!c[k] || !c[k].length) (STRICT ? errors : warnings).push(id + ' : rubrique « ' + k + ' » vide');
  });
});
Object.keys(EM.contenu).forEach(function (id) {
  if (!EM.programme.chapitres[id]) errors.push('contenu pour un chapitre inconnu : ' + id);
});
if (missing.length) (STRICT ? errors : warnings).push(missing.length + ' chapitre(s) sans contenu : ' + missing.join(', '));

/* ---------- syntaxe de tous les fichiers JavaScript (vues et outils compris) ---------- */
(function () {
  var vm = require('vm');
  (function walk(rel) {
    fs.readdirSync(path.join(ROOT, rel)).forEach(function (f) {
      var r = rel + '/' + f, abs = path.join(ROOT, r);
      if (fs.statSync(abs).isDirectory()) return walk(r);
      if (!/\.js$/.test(f)) return;
      try { new vm.Script(fs.readFileSync(abs, 'utf8'), { filename: r }); }
      catch (e) { errors.push('[syntaxe] ' + r + ' : ' + e.message); }
    });
  })('js');
  try { new vm.Script(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), { filename: 'sw.js' }); }
  catch (e) { errors.push('[syntaxe] sw.js : ' + e.message); }
})();

/* ---------- cohérence index.html / service worker / fichiers ---------- */
(function () {
  var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  var sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  var assets = (/var ASSETS = \[([\s\S]*?)\];/.exec(sw) || [])[1] || '';
  var listed = (assets.match(/'([^']+)'/g) || []).map(function (x) { return x.slice(1, -1); });
  var refs = [];
  html.replace(/<(?:script|link)[^>]+(?:src|href)="([^"#:]+)"/g, function (m, f) { refs.push(f); });
  refs.forEach(function (f) {
    if (!fs.existsSync(path.join(ROOT, f))) errors.push('index.html charge un fichier absent : ' + f);
    if (listed.indexOf(f) < 0) errors.push('sw.js ne met pas en cache : ' + f);
  });
  listed.forEach(function (f) {
    if (f !== './' && !fs.existsSync(path.join(ROOT, f))) errors.push('sw.js liste un fichier absent : ' + f);
  });
  fs.readdirSync(path.join(ROOT, 'vendor/katex/fonts')).forEach(function (f) {
    if (listed.indexOf('vendor/katex/fonts/' + f) < 0) errors.push('sw.js ne met pas en cache la police ' + f);
  });
  (function walkJs(rel) {
    fs.readdirSync(path.join(ROOT, rel)).forEach(function (f) {
      var r = rel + '/' + f;
      if (fs.statSync(path.join(ROOT, r)).isDirectory()) return walkJs(r);
      if (/\.js$/.test(f) && refs.indexOf(r) < 0) errors.push('fichier non chargé par index.html : ' + r);
    });
  })('js');
  if (!FILES) {
    load('js/data/afrique.js');
    (EM.afrique || []).forEach(function (f, i) { checkTeX(f.titre, 'afrique ' + i); checkTeX(f.texte, 'afrique ' + i); });
  }
})();

/* ---------- guides d'examen, histoire, démonstrations, missions ---------- */
(function () {
  if (FILES && !/guides|histoire|demos|missions/.test(FILES)) return;
  ['js/data/guides.js', 'js/data/histoire.js', 'js/demos.js'].forEach(function (f) {
    try { load(f); } catch (e) { errors.push('[chargement] ' + f + ' : ' + e.message); }
  });
  (EM.guides || []).forEach(function (g, i) {
    var w = 'guide ' + (g.id || i);
    if (!g.id || !g.titre || !Array.isArray(g.sections) || !g.sections.length) errors.push(w + ' : id, titre et sections requis');
    walk(g, w);
  });
  (EM.histoire || []).forEach(function (h, i) {
    var w = 'histoire ' + (h.nom || i);
    if (!h.nom || !h.texte) errors.push(w + ' : nom et texte requis');
    (h.chapitres || []).forEach(function (c) { if (!EM.programme.chapitres[c]) errors.push(w + ' : chapitre inconnu ' + c); });
    walk(h, w);
  });
  var demos = EM.demos ? EM.demos.list() : [];
  demos.forEach(function (d) {
    var w = 'démo ' + d.id;
    if (!d.titre || typeof d.render !== 'function') errors.push(w + ' : titre et render() requis');
    (d.chapitres || []).forEach(function (c) { if (!EM.programme.chapitres[c]) errors.push(w + ' : chapitre inconnu ' + c); });
    checkTeX(d.titre, w); checkTeX(d.resume, w);
  });
  EM.gen.list().filter(function (g) { return g.mission; }).forEach(function (g) {
    var ex = EM.gen.make(g.id, 1, 1);
    if (ex.questions.length < 3) errors.push('mission ' + g.id + ' : au moins 3 questions attendues');
  });
})();

/* ---------- couverture ---------- */
var cover = {};
EM.programme.listeClasses().forEach(function (k) {
  var ch = EM.programme.classes[k].chapitres;
  var withGen = ch.filter(function (id) { return EM.gen.forChapter(id).length; });
  cover[k] = withGen.length + '/' + ch.length;
});

console.log('Générateurs : ' + EM.gen.list().length + ' (' + gens.length + ' testés, ' + total + ' exercices produits)');
console.log('Chapitres avec contenu : ' + (EM.programme.ordre.length - missing.length) + '/' + EM.programme.ordre.length);
console.log('Chapitres couverts par des exercices : ' + Object.keys(cover).map(function (k) { return k + ' ' + cover[k]; }).join(' · '));
if (warnings.length) {
  console.log('\nAvertissements (' + warnings.length + ') :');
  warnings.slice(0, 40).forEach(function (w) { console.log('  ⚠ ' + w); });
  if (warnings.length > 40) console.log('  … ' + (warnings.length - 40) + ' de plus');
}
if (errors.length) {
  console.log('\nERREURS (' + errors.length + ') :');
  errors.slice(0, 80).forEach(function (e) { console.log('  ✗ ' + e); });
  if (errors.length > 80) console.log('  … ' + (errors.length - 80) + ' de plus');
  process.exit(1);
}
console.log('\n✓ Tous les tests passent.');
