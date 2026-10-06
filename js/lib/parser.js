/*
 * Analyseur d'expressions mathématiques et vérification des réponses.
 * Accepte l'écriture « élève » : virgule décimale, 2x, 3(x+1), √2, π, x², sin x, |x|…
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  var FUNCS = {
    sqrt: Math.sqrt, racine: Math.sqrt, rac: Math.sqrt,
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sh: Math.sinh, ch: Math.cosh, th: Math.tanh,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    ln: Math.log, log: function (x) { return Math.log(x) / Math.LN10; },
    exp: Math.exp, abs: Math.abs, floor: Math.floor, ent: Math.floor, E: Math.floor
  };
  var FUNC_TEX = {
    sqrt: null, racine: null, rac: null, abs: null,
    sin: '\\sin', cos: '\\cos', tan: '\\tan', arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan',
    asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', sh: '\\operatorname{sh}', ch: '\\operatorname{ch}',
    th: '\\operatorname{th}', sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', ln: '\\ln', log: '\\log',
    exp: '\\exp', floor: '\\operatorname{E}', ent: '\\operatorname{E}', E: '\\operatorname{E}'
  };
  var CONSTS = { pi: Math.PI, e: Math.E };
  // noms reconnus, du plus long au plus court pour la lecture gloutonne
  var NAMES = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort(function (a, b) { return b.length - a.length; });

  /** Normalise une saisie d'élève. */
  function normalize(s) {
    s = String(s == null ? '' : s).trim();
    s = s.replace(/[−–—]/g, '-')
      .replace(/[×·⋅∙]/g, '*')
      .replace(/÷/g, '/')
      .replace(/:/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/∞/g, 'inf')
      .replace(/²/g, '^2').replace(/³/g, '^3')
      .replace(/\*\*/g, '^')
      .replace(/(\d),(\d)/g, '$1.$2');
    return s;
  }

  function tokenize(s, vars) {
    var toks = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        // pas de notation scientifique 1e5 : « e » désigne la constante d'Euler (2e = 2 × e)
        var numStr = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
        if (!numStr) throw new Error('Nombre mal écrit');
        numStr = numStr[0];
        toks.push({ t: 'num', v: parseFloat(numStr) });
        i += numStr.length;
        continue;
      }
      if (/[a-zA-Z_]/.test(c)) {
        var rest = s.slice(i), found = null;
        // variable déclarée (priorité aux variables d'un seul caractère déclarées)
        for (var k = 0; k < NAMES.length; k++) {
          var nm = NAMES[k];
          if (rest.slice(0, nm.length).toLowerCase() === nm.toLowerCase() && !(nm.length === 1 && vars.indexOf(nm) >= 0)) {
            // « E » (partie entière) seulement en majuscule, « e » constante seulement en minuscule
            if (nm === 'E' && rest[0] !== 'E') continue;
            if (nm === 'e' && rest[0] !== 'e') continue;
            found = nm; break;
          }
        }
        if (found) {
          var key = found === 'E' ? 'E' : found.toLowerCase();
          if (FUNCS[key]) toks.push({ t: 'func', v: key });
          else toks.push({ t: 'const', v: key });
          i += found.length;
          continue;
        }
        if (rest.slice(0, 3).toLowerCase() === 'inf') { toks.push({ t: 'num', v: Infinity }); i += 3; continue; }
        toks.push({ t: 'var', v: c });
        i++;
        continue;
      }
      if ('+-*/^()|!'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c }); i++; continue; }
      if (c === '[') { toks.push({ t: 'op', v: '(' }); i++; continue; }
      if (c === ']') { toks.push({ t: 'op', v: ')' }); i++; continue; }
      throw new Error('Caractère non reconnu : « ' + c + ' »');
    }
    return toks;
  }

  function Parser(toks) { this.toks = toks; this.p = 0; this.absDepth = 0; }
  Parser.prototype.peek = function () { return this.toks[this.p]; };
  Parser.prototype.eat = function (v) {
    var t = this.toks[this.p];
    if (t && t.t === 'op' && t.v === v) { this.p++; return true; }
    return false;
  };
  Parser.prototype.expect = function (v) {
    if (!this.eat(v)) throw new Error('« ' + v + ' » attendu');
  };
  Parser.prototype.parseExpr = function () {
    var node = this.parseTerm();
    for (;;) {
      if (this.eat('+')) node = { k: 'bin', op: '+', a: node, b: this.parseTerm() };
      else if (this.eat('-')) node = { k: 'bin', op: '-', a: node, b: this.parseTerm() };
      else return node;
    }
  };
  Parser.prototype.startsPrimary = function (t) {
    if (!t) return false;
    if (t.t === 'num' || t.t === 'var' || t.t === 'const' || t.t === 'func') return true;
    if (t.t === 'op' && t.v === '(') return true;
    if (t.t === 'op' && t.v === '|' && this.absDepth === 0) return true;
    return false;
  };
  Parser.prototype.parseTerm = function () {
    var node = this.parseUnary();
    for (;;) {
      if (this.eat('*')) node = { k: 'bin', op: '*', a: node, b: this.parseUnary() };
      else if (this.eat('/')) node = { k: 'bin', op: '/', a: node, b: this.parseUnary() };
      else if (this.startsPrimary(this.peek())) node = { k: 'bin', op: '*', a: node, b: this.parsePower(), implicit: true };
      else return node;
    }
  };
  Parser.prototype.parseUnary = function () {
    if (this.eat('-')) return { k: 'neg', a: this.parseUnary() };
    if (this.eat('+')) return this.parseUnary();
    return this.parsePower();
  };
  Parser.prototype.parsePower = function () {
    var base = this.parsePostfix();
    if (this.eat('^')) return { k: 'bin', op: '^', a: base, b: this.parseUnary() };
    return base;
  };
  Parser.prototype.parsePostfix = function () {
    var n = this.parsePrimary();
    while (this.eat('!')) n = { k: 'fact', a: n };
    return n;
  };
  Parser.prototype.parsePrimary = function () {
    var t = this.peek();
    if (!t) throw new Error('Expression incomplète');
    if (t.t === 'num') { this.p++; return { k: 'num', v: t.v }; }
    if (t.t === 'const') { this.p++; return { k: 'const', v: t.v }; }
    if (t.t === 'var') { this.p++; return { k: 'var', v: t.v }; }
    if (t.t === 'func') {
      this.p++;
      var arg;
      if (this.eat('(')) { arg = this.parseExpr(); this.expect(')'); }
      else arg = this.parsePower();
      return { k: 'func', f: t.v, a: arg };
    }
    if (this.eat('(')) { var e = this.parseExpr(); this.expect(')'); return e; }
    if (t.t === 'op' && t.v === '|') {
      this.p++;
      this.absDepth++;
      var inner = this.parseExpr();
      this.absDepth--;
      this.expect('|');
      return { k: 'func', f: 'abs', a: inner };
    }
    throw new Error('Symbole inattendu : « ' + t.v + ' »');
  };

  function factorial(n) {
    if (n < 0 || n % 1) return NaN;
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  function evalNode(n, env) {
    switch (n.k) {
      case 'num': return n.v;
      case 'const': return CONSTS[n.v];
      case 'var':
        if (env && n.v in env) return env[n.v];
        throw new Error('Variable inconnue : ' + n.v);
      case 'neg': return -evalNode(n.a, env);
      case 'fact': return factorial(evalNode(n.a, env));
      case 'func': return FUNCS[n.f](evalNode(n.a, env));
      case 'bin':
        var a = evalNode(n.a, env), b = evalNode(n.b, env);
        switch (n.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
          case '^':
            // racine cubique d'un négatif : (-8)^(1/3) = -2
            if (a < 0 && b % 1 !== 0) {
              var inv = 1 / b;
              if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-a, b);
            }
            return Math.pow(a, b);
        }
    }
    throw new Error('Nœud inconnu');
  }

  var PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
  function prec(n) {
    if (n.k === 'bin') return PREC[n.op];
    if (n.k === 'neg') return 3;
    return 9;
  }
  function numTex(v) {
    if (v === Infinity) return '\\infty';
    return EM.T ? EM.T.num(v) : String(v);
  }
  /** Conversion d'un arbre en TeX (affichage dans la calculatrice). */
  function toTeX(n) {
    switch (n.k) {
      case 'num': return numTex(n.v);
      case 'const': return n.v === 'pi' ? '\\pi' : 'e';
      case 'var': return n.v;
      case 'neg':
        var s = toTeX(n.a);
        return '-' + (prec(n.a) <= 2 ? '\\left(' + s + '\\right)' : s);
      case 'fact': return (n.a.k === 'num' || n.a.k === 'var' ? toTeX(n.a) : '\\left(' + toTeX(n.a) + '\\right)') + '!';
      case 'func':
        if (n.f === 'sqrt' || n.f === 'racine' || n.f === 'rac') return '\\sqrt{' + toTeX(n.a) + '}';
        if (n.f === 'abs') return '\\left|' + toTeX(n.a) + '\\right|';
        if (n.f === 'exp') return 'e^{' + toTeX(n.a) + '}';
        return FUNC_TEX[n.f] + '\\left(' + toTeX(n.a) + '\\right)';
      case 'bin':
        var p = PREC[n.op];
        var A = toTeX(n.a), B = toTeX(n.b);
        if (n.op === '/') return '\\dfrac{' + A + '}{' + B + '}';
        if (n.op === '^') {
          if (prec(n.a) < 9 || n.a.k === 'func' && n.a.f !== 'sqrt' && n.a.f !== 'abs') A = '\\left(' + A + '\\right)';
          if (n.a.k === 'num' && n.a.v < 0) A = '\\left(' + A + '\\right)';
          return '{' + A + '}^{' + B + '}';
        }
        if (prec(n.a) < p) A = '\\left(' + A + '\\right)';
        if (prec(n.b) < p || (prec(n.b) === p && (n.op === '-' || n.op === '/'))) B = '\\left(' + B + '\\right)';
        if (n.op === '*') {
          var implicitOk = n.b.k !== 'num' && !(n.b.k === 'neg');
          if (n.b.k === 'bin' && n.b.op === '*' && n.b.a.k === 'num') implicitOk = false;
          return A + (implicitOk && n.a.k !== 'fact' ? ' ' : ' \\times ') + B;
        }
        if (n.op === '-' && n.b.k === 'neg') B = '\\left(' + B + '\\right)';
        if (n.op === '+' && n.b.k === 'neg') return A + ' - ' + toTeX(n.b.a);
        return A + ' ' + n.op + ' ' + B;
    }
    return '?';
  }

  /**
   * Analyse une expression. vars : liste des variables autorisées (ex. ['x']).
   * Renvoie { ast, eval(env), tex() }.
   */
  function parse(str, vars) {
    vars = vars || [];
    var s = normalize(str);
    if (!s) throw new Error('Saisie vide');
    var toks = tokenize(s, vars);
    var P = new Parser(toks);
    var ast = P.parseExpr();
    if (P.p < toks.length) throw new Error('Symbole inattendu : « ' + toks[P.p].v + ' »');
    (function checkVars(n) {
      if (!n) return;
      if (n.k === 'var' && vars.indexOf(n.v) < 0) throw new Error('Variable inattendue : ' + n.v);
      checkVars(n.a); checkVars(n.b);
    })(ast);
    return {
      ast: ast,
      eval: function (env) { return evalNode(ast, env || {}); },
      tex: function () { return toTeX(ast); }
    };
  }

  /** Évalue une expression numérique (sans variable). */
  function evalNum(str) { return parse(str, []).eval({}); }

  /** Compile une fonction d'une variable pour le grapheur. */
  function compile(str, v) {
    v = v || 'x';
    var p = parse(str, [v]);
    return function (x) { var e = {}; e[v] = x; try { return p.eval(e); } catch (err) { return NaN; } };
  }

  EM.parser = { normalize: normalize, parse: parse, evalNum: evalNum, compile: compile, toTeX: toTeX };

  /* ------------------------------------------------------------------ */
  /* Vérification des réponses                                           */
  /* ------------------------------------------------------------------ */
  function toNumber(r) {
    if (r instanceof EM.Frac) return r.value();
    if (typeof r === 'string') return evalNum(r);
    return r;
  }
  function close(u, r, tol) {
    if (!isFinite(u) || !isFinite(r)) return u === r;
    if (tol != null) return Math.abs(u - r) <= tol + 1e-12;
    return Math.abs(u - r) <= 1e-9 + 1e-7 * Math.abs(r);
  }
  function stripAccents(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }
  /** Découpe « 2 ; -3 » ou « {2 ; -3} » ; la virgule sert de séparateur si elle n'est pas décimale. */
  function splitList(s) {
    s = normalize(s).replace(/^[{(\[]\s*/, '').replace(/\s*[})\]]$/, '');
    if (!s) return [];
    return s.split(/;|,(?!\d)/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
  }
  var EMPTY_WORDS = ['∅', 'ø', 'vide', 'aucune', 'aucun', 'pas de solution', 'ensemble vide', '{}', 'aucune solution'];

  /**
   * Vérifie la saisie d'un élève pour une question.
   * Renvoie { ok: booléen, msg: texte éventuel (erreur de saisie) }.
   */
  function check(q, input) {
    var raw = input == null ? '' : String(input).trim();
    try {
      switch (q.type) {
        case 'choice':
          return { ok: Number(raw) === q.reponse };
        case 'text':
          var opts = Array.isArray(q.reponse) ? q.reponse : [q.reponse];
          var u = stripAccents(raw);
          return { ok: opts.some(function (o) { return stripAccents(o) === u; }) };
        case 'expr':
          if (!raw) return { ok: false, msg: 'Saisis une expression.' };
          var v = q.variable || 'x';
          var fu = parse(raw, [v]);
          var fr = parse(q.reponse, [v]);
          var dom = q.domaine || [-3, 3];
          var good = 0;
          for (var i = 0; i < 12; i++) {
            var x = dom[0] + (dom[1] - dom[0]) * (i + 0.37) / 12;
            var env = {}; env[v] = x;
            var a = fu.eval(env), b = fr.eval(env);
            if (!isFinite(b)) continue;
            if (!isFinite(a)) return { ok: false };
            if (!close(a, b, null) && Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return { ok: false };
            good++;
          }
          return { ok: good >= 4 };
        case 'set':
          var low = stripAccents(raw);
          var userEmpty = !raw || EMPTY_WORDS.some(function (w) { return low === stripAccents(w); });
          if (!q.reponse.length) return { ok: userEmpty };
          if (userEmpty) return { ok: false };
          var items = splitList(raw).map(evalNum);
          var exp = q.reponse.map(toNumber);
          if (items.length !== exp.length) {
            // on tolère les doublons saisis
            items = items.filter(function (x, idx) { return items.findIndex(function (y) { return close(x, y, q.tol); }) === idx; });
            if (items.length !== exp.length) return { ok: false };
          }
          var used = [];
          for (var j = 0; j < exp.length; j++) {
            var idx = -1;
            for (var k = 0; k < items.length; k++) if (used.indexOf(k) < 0 && close(items[k], exp[j], q.tol)) { idx = k; break; }
            if (idx < 0) return { ok: false };
            used.push(idx);
          }
          return { ok: true };
        case 'tuple':
          var it = splitList(raw).map(evalNum);
          if (it.length !== q.reponse.length) return { ok: false, msg: q.reponse.length + ' valeurs attendues, séparées par « ; ».' };
          for (var m = 0; m < it.length; m++) if (!close(it[m], toNumber(q.reponse[m]), q.tol)) return { ok: false };
          return { ok: true };
        case 'interval':
          return checkInterval(q, raw);
        default: // number
          if (!raw) return { ok: false, msg: 'Saisis une valeur.' };
          var val = evalNum(raw.replace(/\s/g, '').replace(/(fcfa|f|cm|m|km|g|kg|l|°|%)$/i, ''));
          return { ok: close(val, toNumber(q.reponse), q.tol) };
      }
    } catch (e) {
      return { ok: false, msg: 'Saisie non comprise : ' + e.message };
    }
  }

  function checkInterval(q, raw) {
    var s = normalize(raw).replace(/\s/g, '');
    var m = /^([\[\]])(.+?);(.+?)([\[\]])$/.exec(s);
    if (!m) return { ok: false, msg: 'Écris un intervalle comme ]-inf ; 3] ou [2 ; 5[.' };
    var r = q.reponse;
    var a = evalNum(m[2]), b = evalNum(m[3]);
    var openA = m[1] === ']', openB = m[4] === '[';
    var okA = (r.a === -Infinity ? a === -Infinity : close(a, toNumber(r.a), q.tol) && openA === !!r.ouvA);
    var okB = (r.b === Infinity ? b === Infinity : close(b, toNumber(r.b), q.tol) && openB === !!r.ouvB);
    return { ok: okA && okB };
  }

  /** Texte (TeX) de la réponse attendue, pour l'affichage de la correction. */
  function answerTeX(q) {
    if (q.reponseTex) return q.reponseTex;
    var T = EM.T;
    switch (q.type) {
      case 'choice': return null;
      case 'text': return '\\text{' + (Array.isArray(q.reponse) ? q.reponse[0] : q.reponse) + '}';
      case 'expr': try { return parse(q.reponse, [q.variable || 'x']).tex(); } catch (e) { return q.reponse; }
      case 'set': return T.set(q.reponse.map(function (x) { return x instanceof EM.Frac ? x.tex() : typeof x === 'string' ? parse(x).tex() : T.num(x); }));
      case 'tuple': return '\\left(' + q.reponse.map(function (x) { return x instanceof EM.Frac ? x.tex() : T.num(x); }).join(' \\,;\\, ') + '\\right)';
      case 'interval': return T.interval(q.reponse.a, q.reponse.b, q.reponse.ouvA, q.reponse.ouvB);
      default:
        var r = q.reponse;
        if (r instanceof EM.Frac) return r.tex();
        if (typeof r === 'string') { try { return parse(r).tex(); } catch (e) { return r; } }
        return T.num(r);
    }
  }

  EM.check = check;
  EM.answerTeX = answerTeX;
})(typeof window !== 'undefined' ? window : globalThis);
