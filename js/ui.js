/*
 * Composants d'interface : notifications, fenêtre modale, et surtout le « widget d'exercice »
 * réutilisé partout (entraînement, séries, examens blancs, diagnostic, défi du jour, fiches).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var esc = EM.util.esc;

  var ui = {};

  /* ---------- notifications ---------- */
  var toastTimer = null;
  ui.toast = function (msg, ms) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  };
  ui.badges = function (list) {
    (list || []).forEach(function (b, i) {
      if (b) setTimeout(function () { ui.toast(b.ico + ' Badge obtenu : ' + b.nom, 3200); }, 400 + i * 3300);
    });
  };

  /* ---------- fenêtre modale ---------- */
  var lastFocus = null;
  ui.modal = function (title, html, onMount) {
    var m = document.getElementById('modal');
    lastFocus = document.activeElement;
    m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-head"><h2 id="modal-title">' + title + '</h2>' +
      '<button class="icon-btn" data-close aria-label="Fermer" style="color:var(--text)">✕</button></div>' +
      '<div class="modal-body">' + html + '</div></div>';
    m.hidden = false;
    m.onclick = function (e) { if (e.target === m || e.target.closest('[data-close]')) ui.closeModal(); };
    var focusable = m.querySelector('button, a, input, select');
    if (focusable) focusable.focus();
    if (onMount) onMount(m.querySelector('.modal-body'));
    return m;
  };
  ui.closeModal = function () {
    var m = document.getElementById('modal');
    m.hidden = true;
    m.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('modal').hidden) ui.closeModal();
  });

  /** Copie un texte dans le presse-papiers (avec repli). */
  ui.copy = function (txt, msg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ui.toast(msg || 'Copié'); } catch (e) { ui.toast('Copie impossible'); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { ui.toast(msg || 'Copié'); }, fallback);
    } else fallback();
  };

  /** Mention selon la note sur 20 (usage des examens sénégalais). */
  ui.mention = function (note) {
    if (note >= 16) return 'Très bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  };

  ui.niveauNom = function (n) { return ['', 'Application', 'Entraînement', 'Approfondissement'][n] || ''; };

  /* ---------- aperçu de la saisie ---------- */
  function preview(q, raw) {
    raw = String(raw || '').trim();
    if (!raw) return '';
    try {
      if (q.type === 'number') {
        var p = EM.parser.parse(EM.parser.stripUnit(raw), []);
        var v = p.eval({});
        var tex = p.tex();
        var plain = /^-?[\d.,\s]+$/.test(raw);
        return EM.render.tex(tex + (plain || !isFinite(v) ? '' : ' \\approx ' + EM.T.num(EM.ar.round(v, 4))));
      }
      if (q.type === 'expr') {
        return EM.render.tex(EM.parser.parse(raw, [q.variable || 'x']).tex());
      }
      if (q.type === 'set' || q.type === 'tuple') {
        var low = raw.toLowerCase();
        if (q.type === 'set' && /^(∅|ø|vide|aucune?( solution)?|\{\s*\})$/.test(low)) return EM.render.tex('\\varnothing');
        var parts = EM.parser.normalize(raw).replace(/^[{(\[]\s*/, '').replace(/\s*[})\]]$/, '')
          .split(/;|,(?!\d)/).map(function (s) { return s.trim(); }).filter(Boolean);
        var texs = parts.map(function (s) { return EM.parser.parse(s, []).tex(); });
        return EM.render.tex(q.type === 'set' ? '\\left\\{ ' + texs.join(' \\,;\\, ') + ' \\right\\}' : '\\left(' + texs.join(' \\,;\\, ') + '\\right)');
      }
    } catch (e) {
      return '<span class="err">' + esc(e.message) + '</span>';
    }
    return '';
  }

  var KEYS = {
    number: ['√', 'π', '^', '/', '(', ')', '−'],
    expr: ['x', '²', '^', '/', '(', ')', '√', 'ln(', 'e^', 'sin(', 'cos(', 'π'],
    set: [';', '√', '/', 'π', '−', '∅'],
    tuple: [';', '√', '/', '−', '(', ')'],
    interval: [']', '[', ';', '∞', '−', '/', '√']
  };
  var HELP = {
    number: 'Nombre : 2,5 · 3/4 · 2√3 · π/2',
    expr: 'Expression : 3x^2 - 2x + 1 · (x+1)/(x-1) · e^(2x) · ln(x)',
    set: 'Ensemble : valeurs séparées par « ; » — par ex. -3 ; 2 — ou ∅',
    tuple: 'Valeurs dans l\'ordre, séparées par « ; » — par ex. (1 ; -2)',
    interval: 'Intervalle : ]-∞ ; 3] · [2 ; 5[',
    text: 'Réponse en toutes lettres'
  };

  /**
   * Affiche un exercice dans el.
   * opts : {
   *   mode: 'pratique' | 'examen' | 'fiche',
   *   numero: titre facultatif ('Exercice 3'),
   *   points: barème (examen),
   *   onResult: function ({ ok, score, indices, solutionVue }) — appelé au premier « Vérifier »
   *   onNext: function () — bouton « Exercice suivant »
   *   extraActions: HTML de boutons supplémentaires
   * }
   * Renvoie un contrôleur { grade(), reveal(), answers() }.
   */
  ui.exercice = function (el, ex, opts) {
    opts = opts || {};
    var mode = opts.mode || 'pratique';
    var state = { indices: 0, verifie: false, solutionVue: false, choix: {}, essais: 0 };
    var uid = 'q' + Math.random().toString(36).slice(2, 8);

    var html = '';
    if (opts.numero || mode === 'pratique') {
      html += '<div class="exo-head"><h3 style="margin:0">' + (opts.numero ? esc(opts.numero) + ' — ' : '') + EM.md(ex.titre || '') + '</h3>' +
        '<span class="row">' + (opts.points ? '<span class="chip gold">' + opts.points + ' pt' + (opts.points > 1 ? 's' : '') + '</span>' : '') +
        '<span class="chip">Niveau ' + ex.niveau + (mode === 'pratique' ? ' · ' + ui.niveauNom(ex.niveau) : '') + '</span></span></div>';
    }
    html += '<div class="exo-statement">' + EM.md(ex.enonce) + '</div>';
    if (ex.figure) html += '<div class="exo-figure">' + ex.figure + '</div>';
    html += '<div class="questions">';
    ex.questions.forEach(function (q, i) {
      var id = uid + '-' + i;
      html += '<div class="q-row" data-i="' + i + '">';
      if (q.type === 'choice') {
        html += (q.label ? '<div class="q-label">' + EM.md(q.label) + '</div>' : '') + '<div class="choices" role="radiogroup">';
        q.choix.forEach(function (c, j) {
          html += '<button type="button" class="choice" role="radio" aria-checked="false" data-j="' + j + '"><span class="letter">' + 'ABCDEFGH'[j] + '</span><span>' + EM.md(c) + '</span></button>';
        });
        html += '</div>';
      } else {
        html += '<div class="q-line"><label class="q-label" for="' + id + '">' + EM.md(q.label || 'Réponse') + '</label>' +
          '<input class="q-input" id="' + id + '" type="text" inputmode="' + (q.type === 'text' ? 'text' : 'text') + '" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
          'aria-describedby="' + id + '-p">' + (q.unite ? '<span class="q-unit">' + esc(q.unite) + '</span>' : '') + '</div>' +
          '<div class="q-preview" id="' + id + '-p" aria-live="polite"></div>';
      }
      html += '<div class="q-feedback" aria-live="polite"></div></div>';
    });
    html += '</div>';
    var types = EM.util.uniq(ex.questions.map(function (q) { return q.type; })).filter(function (t) { return t !== 'choice'; });
    if (types.length && mode !== 'fiche') {
      html += '<div class="input-help">' + esc(ex.aide || types.map(function (t) { return HELP[t] || ''; }).join(' · ')) + '</div>';
      html += '<div class="mathkbd no-print" aria-label="Clavier mathématique"></div>';
    }
    html += '<div class="hints"></div><div class="sol-zone"></div>';
    if (mode === 'pratique') {
      html += '<div class="exo-actions no-print">' +
        '<button class="btn" data-act="check">Vérifier</button>' +
        (ex.indices.length ? '<button class="btn ghost" data-act="hint">💡 Indice <span class="hint-count">(0/' + ex.indices.length + ')</span></button>' : '') +
        '<button class="btn ghost" data-act="sol">Voir la correction</button>' +
        (opts.onNext ? '<button class="btn gold" data-act="next">Exercice suivant →</button>' : '') +
        (opts.extraActions || '') + '</div>';
    }
    el.innerHTML = html;

    var inputs = el.querySelectorAll('.q-input');
    var lastInput = inputs[0] || null;

    // aperçu en direct + clavier
    Array.prototype.forEach.call(el.querySelectorAll('.q-row'), function (row) {
      var i = +row.getAttribute('data-i'), q = ex.questions[i];
      var inp = row.querySelector('.q-input');
      if (inp) {
        inp.addEventListener('input', function () {
          row.querySelector('.q-preview').innerHTML = preview(q, inp.value);
          row.classList.remove('ok', 'ko');
        });
        inp.addEventListener('focus', function () { lastInput = inp; buildKbd(q.type); });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && mode === 'pratique') { e.preventDefault(); check(); }
        });
      }
      Array.prototype.forEach.call(row.querySelectorAll('.choice'), function (b) {
        b.addEventListener('click', function () {
          if (state.verifie && mode !== 'pratique') return;
          state.choix[i] = +b.getAttribute('data-j');
          Array.prototype.forEach.call(row.querySelectorAll('.choice'), function (o) {
            var sel = o === b;
            o.classList.toggle('sel', sel);
            o.classList.remove('good', 'bad');
            o.setAttribute('aria-checked', sel ? 'true' : 'false');
          });
        });
      });
    });

    function buildKbd(type) {
      var kb = el.querySelector('.mathkbd');
      if (!kb) return;
      var keys = KEYS[type] || [];
      kb.innerHTML = keys.map(function (k) { return '<button type="button" tabindex="-1" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('');
    }
    if (inputs.length) buildKbd(ex.questions.filter(function (q) { return q.type !== 'choice'; })[0].type);
    var kbEl = el.querySelector('.mathkbd');
    if (kbEl) {
      kbEl.addEventListener('mousedown', function (e) { e.preventDefault(); });
      kbEl.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || !lastInput) return;
        var k = b.getAttribute('data-k');
        var ins = { '√': '√(', 'e^': 'e^(', '−': '-' }[k] || k;
        var s = lastInput.selectionStart == null ? lastInput.value.length : lastInput.selectionStart;
        var t = lastInput.selectionEnd == null ? s : lastInput.selectionEnd;
        lastInput.setRangeText(ins, s, t, 'end');
        lastInput.dispatchEvent(new Event('input'));
        lastInput.focus();
      });
    }

    function answers() {
      return ex.questions.map(function (q, i) {
        if (q.type === 'choice') return state.choix[i] == null ? '' : String(state.choix[i]);
        var inp = el.querySelector('.q-row[data-i="' + i + '"] .q-input');
        return inp ? inp.value : '';
      });
    }

    /** Corrige sans rien afficher : renvoie { ok, score (0..1), parQuestion }. */
    function grade() {
      var ans = answers(), par = [], good = 0;
      ex.questions.forEach(function (q, i) {
        var r = ans[i] === '' ? { ok: false, msg: null, vide: true } : EM.check(q, ans[i]);
        par.push(r);
        if (r.ok) good++;
      });
      return { ok: good === ex.questions.length, score: ex.questions.length ? good / ex.questions.length : 0, parQuestion: par };
    }

    function mark(res, showGood) {
      Array.prototype.forEach.call(el.querySelectorAll('.q-row'), function (row) {
        var i = +row.getAttribute('data-i'), q = ex.questions[i], r = res.parQuestion[i];
        row.classList.toggle('ok', r.ok);
        row.classList.toggle('ko', !r.ok);
        var fb = row.querySelector('.q-feedback');
        fb.className = 'q-feedback ' + (r.ok ? 'ok' : 'ko');
        fb.textContent = r.ok ? '✓ Juste' : (r.msg ? '✗ ' + r.msg : r.vide ? '✗ Pas de réponse' : '✗ Pas encore juste');
        if (q.type === 'choice') {
          Array.prototype.forEach.call(row.querySelectorAll('.choice'), function (b) {
            var j = +b.getAttribute('data-j');
            b.classList.remove('good', 'bad');
            if (j === state.choix[i]) b.classList.add(r.ok ? 'good' : 'bad');
            if (showGood && j === q.reponse) b.classList.add('good');
          });
        }
      });
    }

    function check() {
      var res = grade();
      var allEmpty = res.parQuestion.every(function (r) { return r.vide; });
      if (allEmpty) { ui.toast('Écris d\'abord ta réponse.'); return res; }
      state.essais++;
      mark(res, false);
      var banner = el.querySelector('.result-banner');
      if (!banner) {
        banner = document.createElement('div');
        el.querySelector('.questions').after(banner);
      }
      banner.className = 'result-banner ' + (res.ok ? 'ok' : 'ko');
      banner.textContent = res.ok ? pick(['Bravo ! 🎉', 'Excellent ! ✨', 'C\'est juste ! 👏', 'Bien joué ! 💪']) :
        (state.essais === 1 ? 'Pas tout à fait. Relis l\'énoncé, demande un indice ou réessaie.' : 'Toujours pas… Tu peux consulter la correction.');
      if (!state.verifie) {
        state.verifie = true;
        if (opts.onResult) opts.onResult({ ok: res.ok, score: res.score, indices: state.indices, solutionVue: state.solutionVue });
      }
      return res;
    }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    function showHint() {
      if (state.indices >= ex.indices.length) return;
      var box = document.createElement('div');
      box.className = 'hint';
      box.innerHTML = '<strong>Indice ' + (state.indices + 1) + ' :</strong> ' + EM.md(ex.indices[state.indices]);
      el.querySelector('.hints').appendChild(box);
      state.indices++;
      var c = el.querySelector('.hint-count');
      if (c) c.textContent = '(' + state.indices + '/' + ex.indices.length + ')';
      if (state.indices >= ex.indices.length) {
        var b = el.querySelector('[data-act="hint"]');
        if (b) b.disabled = true;
      }
    }

    function solutionHtml() {
      var s = '<div class="solution"><h4>Correction</h4><ol>' +
        ex.solution.map(function (st) { return '<li>' + EM.md(st) + '</li>'; }).join('') + '</ol>';
      var lines = ex.questions.map(function (q) {
        if (q.type === 'choice') return (q.label ? EM.md(q.label) + ' ' : '') + 'Bonne réponse : <strong>' + 'ABCDEFGH'[q.reponse] + '</strong> — ' + EM.md(q.choix[q.reponse]);
        var t = EM.answerTeX(q);
        return EM.md(q.label || 'Réponse') + ' ' + EM.render.tex(t) + (q.unite ? ' ' + esc(q.unite) : '');
      });
      s += '<div class="answer-line"><strong>Réponse' + (lines.length > 1 ? 's' : '') + ' attendue' + (lines.length > 1 ? 's' : '') + ' :</strong><br>' + lines.join('<br>') + '</div></div>';
      return s;
    }

    function reveal() {
      if (el.querySelector('.solution')) return;
      el.querySelector('.sol-zone').innerHTML = solutionHtml();
    }

    function showSolution() {
      if (!state.verifie) {
        state.solutionVue = true;
        state.verifie = true;
        if (opts.onResult) opts.onResult({ ok: false, score: 0, indices: state.indices, solutionVue: true });
      }
      mark(grade(), true);
      reveal();
      el.querySelector('.sol-zone').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !el.contains(b)) return;
      var act = b.getAttribute('data-act');
      if (act === 'check') check();
      else if (act === 'hint') showHint();
      else if (act === 'sol') showSolution();
      else if (act === 'next' && opts.onNext) opts.onNext();
    });

    return {
      grade: grade,
      answers: answers,
      check: check,
      reveal: function (showGood) { mark(grade(), showGood !== false); reveal(); },
      lock: function () {
        Array.prototype.forEach.call(el.querySelectorAll('.q-input'), function (i) { i.readOnly = true; });
        state.verifie = true;
      },
      state: state
    };
  };

  /** Rendu d'un exercice en version papier (fiche) : énoncé + lignes de réponse. */
  ui.exercicePapier = function (ex, numero) {
    var s = '<div class="sheet-ex"><h3>Exercice ' + numero + ' <span class="muted small">(' + esc(ex.titre) + ')</span></h3>' +
      '<div>' + EM.md(ex.enonce) + '</div>';
    if (ex.figure) s += '<div class="exo-figure">' + ex.figure + '</div>';
    ex.questions.forEach(function (q, i) {
      if (q.type === 'choice') {
        s += (q.label ? '<p>' + EM.md(q.label) + '</p>' : '') + '<ol type="A">' + q.choix.map(function (c) { return '<li>' + EM.md(c) + '</li>'; }).join('') + '</ol>';
      } else {
        s += '<p>' + (ex.questions.length > 1 ? (i + 1) + ') ' : '') + EM.md(q.label || 'Réponse :') + ' …………………………' + (q.unite ? ' ' + esc(q.unite) : '') + '</p>';
      }
    });
    return s + '</div>';
  };
  /** Énoncé + correction, sans saisie (bilans). */
  ui.enonceEtCorrection = function (ex) {
    var s = '<div class="exo-statement">' + EM.md(ex.enonce) + '</div>' + (ex.figure ? '<div class="exo-figure">' + ex.figure + '</div>' : '');
    s += '<div class="solution"><h4>Correction</h4><ol>' + ex.solution.map(function (st) { return '<li>' + EM.md(st) + '</li>'; }).join('') + '</ol>' +
      '<div class="answer-line"><strong>Réponse :</strong> ' + ex.questions.map(function (q) {
        if (q.type === 'choice') return (q.label ? EM.md(q.label) + ' ' : '') + EM.md(q.choix[q.reponse]);
        return EM.md(q.label || '') + ' ' + EM.render.tex(EM.answerTeX(q)) + (q.unite ? ' ' + esc(q.unite) : '');
      }).join('<br>') + '</div></div>';
    return s;
  };
  ui.correctionPapier = function (ex, numero) {
    var s = '<div class="sheet-ex"><h3>Exercice ' + numero + '</h3><ol>' +
      ex.solution.map(function (st) { return '<li>' + EM.md(st) + '</li>'; }).join('') + '</ol><p><strong>Réponse :</strong> ' +
      ex.questions.map(function (q) {
        if (q.type === 'choice') return 'ABCDEFGH'[q.reponse] + ' — ' + EM.md(q.choix[q.reponse]);
        return EM.md(q.label || '') + ' ' + EM.render.tex(EM.answerTeX(q)) + (q.unite ? ' ' + esc(q.unite) : '');
      }).join(' ; ') + '</p></div>';
    return s;
  };

  EM.ui = ui;
})(typeof window !== 'undefined' ? window : globalThis);
