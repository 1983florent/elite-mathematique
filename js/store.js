/*
 * Progression de l'élève, enregistrée dans le navigateur (aucun compte, aucune connexion requise).
 * Maîtrise par chapitre, points d'expérience, série de jours, badges, révision espacée (boîtes de Leitner),
 * historique des examens blancs. Export / import en fichier JSON.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var KEY = 'em.data.v1';

  function today(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(dayStr, n) {
    var p = dayStr.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1, p[2] + n);
    return today(d);
  }
  function daysBetween(a, b) {
    var pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  function blank() {
    return {
      v: 1,
      profil: { nom: '', classe: null },
      xp: 0,
      serie: { dernier: null, n: 0, record: 0 },
      jours: {},          // 'AAAA-MM-JJ' -> { ok, tent }
      chap: {},           // id -> { m: maîtrise 0..1, ok, tent, vu }
      gens: {},           // id -> { ok, tent, niv }
      leitner: {},        // carteId -> { b: boîte 1..5, due: 'AAAA-MM-JJ' }
      revues: 0,
      examens: [],        // { type, classe, note, date, duree, details }
      badges: {},         // id -> date d'obtention
      sansIndice: 0,      // bonnes réponses consécutives sans indice
      outils: {},         // outils du labo utilisés
      defis: {},          // jour -> true (défi du jour réussi)
      diagnostics: {}     // classe -> { date, resultats: {chapId: bool} }
    };
  }

  var mem = null;
  function load() {
    if (mem) return mem;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    mem = Object.assign(blank(), d || {});
    return mem;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* stockage indisponible : on continue en mémoire */ }
  }

  var RANGS = [
    [0, 'Novice'], [100, 'Apprenti'], [300, 'Calculateur'], [700, 'Logicien'], [1500, 'Géomètre'],
    [3000, 'Analyste'], [6000, 'Mathématicien'], [12000, 'Élite'], [25000, 'Grand maître']
  ];

  var BADGES = [
    { id: 'premier-pas', ico: '🌱', nom: 'Premier pas', desc: 'Réussir un premier exercice' },
    { id: 'serie-3', ico: '🔥', nom: 'Régulier', desc: '3 jours de suite' },
    { id: 'serie-7', ico: '📅', nom: 'Une semaine', desc: '7 jours de suite' },
    { id: 'serie-30', ico: '🏅', nom: 'Infatigable', desc: '30 jours de suite' },
    { id: 'cinquante', ico: '✋', nom: 'Cinquante', desc: '50 exercices réussis' },
    { id: 'cent', ico: '💯', nom: 'Centurion', desc: '100 exercices réussis' },
    { id: 'mille', ico: '🚀', nom: 'Mille', desc: '1 000 exercices réussis' },
    { id: 'autonome', ico: '🧠', nom: 'Autonome', desc: '10 réussites de suite sans indice' },
    { id: 'expert', ico: '⭐', nom: 'Expert', desc: 'Réussir 10 exercices de niveau 3' },
    { id: 'maitrise-1', ico: '🎯', nom: 'Maîtrise', desc: 'Maîtriser un chapitre' },
    { id: 'maitrise-10', ico: '🏆', nom: 'Dix chapitres', desc: 'Maîtriser 10 chapitres' },
    { id: 'examen', ico: '📝', nom: 'Candidat', desc: 'Terminer un examen blanc' },
    { id: 'admis', ico: '🎓', nom: 'Admis', desc: 'Obtenir au moins 10/20 à un examen blanc' },
    { id: 'mention', ico: '👑', nom: 'Mention', desc: 'Obtenir au moins 16/20 à un examen blanc' },
    { id: 'memoire', ico: '🗂️', nom: 'Mémoire', desc: 'Réviser 50 cartes' },
    { id: 'defi', ico: '☀️', nom: 'Défi du jour', desc: 'Réussir un défi du jour' },
    { id: 'curieux', ico: '🧪', nom: 'Curieux', desc: 'Utiliser 5 outils du labo' },
    { id: 'diagnostic', ico: '🩺', nom: 'Bilan', desc: 'Faire un diagnostic de classe' }
  ];

  function award(id, gained) {
    var d = load();
    if (d.badges[id]) return;
    d.badges[id] = today();
    gained.push(BADGES.filter(function (b) { return b.id === id; })[0]);
  }

  function totalOk() {
    var d = load(), s = 0;
    Object.keys(d.gens).forEach(function (k) { s += d.gens[k].ok || 0; });
    return s;
  }

  /** Marque l'activité du jour et met à jour la série. */
  function touchDay(ok, gained) {
    var d = load(), t = today();
    d.jours[t] = d.jours[t] || { ok: 0, tent: 0 };
    d.jours[t].tent++;
    if (ok) d.jours[t].ok++;
    if (ok && d.serie.dernier !== t) {
      var gap = d.serie.dernier ? daysBetween(d.serie.dernier, t) : 99;
      d.serie.n = gap === 1 ? d.serie.n + 1 : 1;
      d.serie.dernier = t;
      d.serie.record = Math.max(d.serie.record, d.serie.n);
      if (d.serie.n >= 3) award('serie-3', gained);
      if (d.serie.n >= 7) award('serie-7', gained);
      if (d.serie.n >= 30) award('serie-30', gained);
    }
    // on ne garde que 120 jours d'historique
    var keys = Object.keys(d.jours).sort();
    while (keys.length > 120) delete d.jours[keys.shift()];
  }

  var store = {
    today: today,
    addDays: addDays,
    rangs: RANGS,
    badgesDef: BADGES,
    data: load,
    save: save,

    classe: function () { return load().profil.classe; },
    setClasse: function (k) { load().profil.classe = k; save(); },
    nom: function () { return load().profil.nom; },
    setNom: function (n) { load().profil.nom = String(n || '').slice(0, 40); save(); },

    rang: function (xp) {
      xp = xp == null ? load().xp : xp;
      var r = RANGS[0], next = null;
      for (var i = 0; i < RANGS.length; i++) {
        if (xp >= RANGS[i][0]) { r = RANGS[i]; next = RANGS[i + 1] || null; }
      }
      return { nom: r[1], min: r[0], suivant: next ? next[1] : null, seuil: next ? next[0] : null };
    },

    /**
     * Enregistre une réponse à un exercice.
     * opt : { gen, chapitres, niveau, ok, indices (nb d'indices vus), solutionVue }
     * Renvoie { xp: points gagnés, badges: [nouveaux badges] }.
     */
    reponse: function (opt) {
      var d = load(), gained = [];
      var ok = !!opt.ok && !opt.solutionVue;
      var lv = opt.niveau || 1;
      var g = d.gens[opt.gen] = d.gens[opt.gen] || { ok: 0, tent: 0, niv: 1 };
      g.tent++;
      if (ok) g.ok++;
      g.niv = lv;
      var p = ok ? Math.max(0.35, 0.6 + 0.2 * (lv - 1) - 0.1 * (opt.indices || 0)) : 0;
      (opt.chapitres || []).forEach(function (c) {
        var ch = d.chap[c] = d.chap[c] || { m: 0, ok: 0, tent: 0 };
        ch.tent++;
        if (ok) ch.ok++;
        ch.m = Math.round((0.7 * ch.m + 0.3 * p) * 1000) / 1000;
        if (ch.m >= 0.7) award('maitrise-1', gained);
      });
      var xp = ok ? Math.max(2, 10 * lv - 3 * (opt.indices || 0)) : 0;
      d.xp += xp;
      if (ok) {
        d.sansIndice = opt.indices ? 0 : d.sansIndice + 1;
        award('premier-pas', gained);
        var t = totalOk();
        if (t >= 50) award('cinquante', gained);
        if (t >= 100) award('cent', gained);
        if (t >= 1000) award('mille', gained);
        if (d.sansIndice >= 10) award('autonome', gained);
        if (lv === 3) {
          d.niveau3 = (d.niveau3 || 0) + 1;
          if (d.niveau3 >= 10) award('expert', gained);
        }
        var nm = Object.keys(d.chap).filter(function (k) { return d.chap[k].m >= 0.7; }).length;
        if (nm >= 10) award('maitrise-10', gained);
      } else {
        d.sansIndice = 0;
      }
      touchDay(ok, gained);
      save();
      return { xp: xp, badges: gained };
    },

    /** Maîtrise d'un chapitre entre 0 et 1. */
    maitrise: function (id) { var c = load().chap[id]; return c ? c.m : 0; },
    /** 0 : pas commencé, 1 : découverte, 2 : en progrès, 3 : maîtrisé */
    etat: function (id) {
      var c = load().chap[id];
      if (!c || !c.tent) return 0;
      if (c.m >= 0.7) return 3;
      if (c.m >= 0.35) return 2;
      return 1;
    },
    marquerVu: function (id) {
      var d = load();
      d.chap[id] = d.chap[id] || { m: 0, ok: 0, tent: 0 };
      d.chap[id].vu = today();
      save();
    },
    /** Maîtrise moyenne d'une classe (chapitres ayant des exercices). */
    progresClasse: function (k) {
      var cl = EM.programme.classes[k];
      if (!cl) return 0;
      var ids = cl.chapitres.filter(function (id) { return EM.gen.forChapter(id).length; });
      if (!ids.length) return 0;
      return ids.reduce(function (s, id) { return s + store.maitrise(id); }, 0) / ids.length;
    },
    niveauConseille: function (genId) {
      var g = load().gens[genId];
      return g ? g.niv || 1 : 1;
    },

    /* ---------- examens ---------- */
    examen: function (res) {
      var d = load(), gained = [];
      d.examens.unshift(res);
      d.examens = d.examens.slice(0, 50);
      d.xp += Math.round(res.note * 5);
      award('examen', gained);
      if (res.note >= 10) award('admis', gained);
      if (res.note >= 16) award('mention', gained);
      save();
      return gained;
    },

    /* ---------- défi du jour ---------- */
    defiReussi: function () {
      var d = load(), gained = [];
      if (!d.defis[today()]) { d.defis[today()] = true; d.xp += 20; }
      award('defi', gained);
      save();
      return gained;
    },
    defiFait: function () { return !!load().defis[today()]; },

    /* ---------- labo ---------- */
    outil: function (id) {
      var d = load(), gained = [];
      d.outils[id] = (d.outils[id] || 0) + 1;
      if (Object.keys(d.outils).length >= 5) award('curieux', gained);
      save();
      return gained;
    },

    /* ---------- diagnostic ---------- */
    diagnostic: function (classe, resultats) {
      var d = load(), gained = [];
      d.diagnostics[classe] = { date: today(), resultats: resultats };
      award('diagnostic', gained);
      save();
      return gained;
    },

    /* ---------- révision espacée (Leitner) ---------- */
    INTERVALLES: [0, 1, 3, 7, 14, 30],
    carte: function (id) { return load().leitner[id] || null; },
    /** Cartes à réviser aujourd'hui parmi la liste d'identifiants (nouvelles cartes incluses, limitées). */
    cartesDues: function (ids, maxNouvelles) {
      var d = load(), t = today(), dues = [], nouvelles = [];
      ids.forEach(function (id) {
        var c = d.leitner[id];
        if (!c) nouvelles.push(id);
        else if (c.due <= t) dues.push(id);
      });
      return dues.concat(nouvelles.slice(0, maxNouvelles == null ? 10 : maxNouvelles));
    },
    revoir: function (id, su) {
      var d = load(), gained = [];
      var c = d.leitner[id] || { b: 0 };
      c.b = su ? Math.min(5, c.b + 1) : 1;
      c.due = addDays(today(), su ? store.INTERVALLES[c.b] : 0);
      d.leitner[id] = c;
      d.revues++;
      if (su) d.xp += 2;
      if (d.revues >= 50) award('memoire', gained);
      touchDay(su, gained);
      save();
      return gained;
    },
    boites: function (ids) {
      var d = load(), b = [0, 0, 0, 0, 0, 0];
      ids.forEach(function (id) { var c = d.leitner[id]; b[c ? c.b : 0]++; });
      return b;
    },

    /* ---------- sauvegarde ---------- */
    exporter: function () { return JSON.stringify(load(), null, 1); },
    importer: function (txt) {
      var obj = JSON.parse(txt);
      if (!obj || typeof obj !== 'object' || obj.v !== 1) throw new Error('Fichier de progression invalide');
      mem = Object.assign(blank(), obj);
      save();
    },
    reinitialiser: function () { mem = blank(); save(); }
  };

  EM.store = store;
})(typeof window !== 'undefined' ? window : globalThis);
