/*
 * ELITE MATHÉMATIQUE — « Missions Sénégal ».
 *
 * Des projets concrets de la vie au Sénégal, résolus en plusieurs étapes enchaînées et
 * mobilisant plusieurs chapitres à la fois. Chaque mission est un générateur ordinaire
 * (EM.gen.register) avec en plus :
 *   mission: true, cycle: 'elementaire' | 'moyen' | 'secondaire', classe: '<id de classe>',
 *   resume: 'une phrase qui donne envie'.
 *
 * Toutes les données chiffrées (prix, tarifs, distances, rendements…) sont fictives :
 * ce sont des données d'énoncé, choisies plausibles mais jamais présentées comme réelles.
 *
 * Contrôle des développeurs : si le tableau global EM_VERIF_MISSIONS existe, chaque tirage
 * y dépose ses données brutes (pour une vérification indépendante des réponses) ;
 * en usage normal, rien n'est enregistré.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F, ar = EM.ar;

  /* ================================================================== */
  /* Outils communs                                                      */
  /* ================================================================== */
  var FILLES = ['Awa', 'Fatou', 'Aïssatou', 'Ndèye', 'Khady', 'Mariama', 'Coumba', 'Astou', 'Bineta', 'Seynabou',
    'Rokhaya', 'Yacine', 'Sokhna', 'Dieynaba', 'Maïmouna', 'Ramatoulaye', 'Fatoumata', 'Ndeye Fatou'];
  var GARCONS = ['Moussa', 'Mamadou', 'Ousmane', 'Cheikh', 'Ibrahima', 'Abdoulaye', 'Babacar', 'Modou', 'Pape',
    'Aliou', 'Demba', 'Lamine', 'Malick', 'Oumar', 'Souleymane', 'Daouda', 'Serigne', 'Alioune'];
  var NOMS = ['Diop', 'Ndiaye', 'Fall', 'Sarr', 'Diallo', 'Ba', 'Sow', 'Gueye', 'Faye', 'Mbaye', 'Diouf', 'Cissé',
    'Sène', 'Thiam', 'Kane', 'Camara', 'Badji', 'Diatta', 'Niang', 'Seck'];

  /** Nombre au format TeX français (1\,500{,}5). */
  function N(x, d) { return T.num(x, d); }
  /** Nombre en ligne : $1\,500$ */
  function M(x, d) { return '$' + T.num(x, d) + '$'; }
  /** Montant : $1\,500$ F CFA */
  function cfa(x) { return '$' + T.num(x) + '$ F CFA'; }
  /** Arrondi sûr */
  function rd(x, d) { return ar.round(x, d == null ? 2 : d); }
  /** Nombre en texte simple (pour les figures SVG) : 3,5 */
  function tx(x) { return T.txt(rd(x, 2)); }
  /** Début d'une étape de correction : « 1) » en gras */
  function Q(k) { return '<b>' + k + ')</b> '; }
  /** Degrés */
  function deg(rad) { return rad * 180 / Math.PI; }
  function rad(dg) { return dg * Math.PI / 180; }
  /** « = v » si v s'écrit exactement avec d décimales, sinon « ≈ v arrondi » (TeX). */
  function eq(v, d) { var r = rd(v, d); return (Math.abs(r - v) < 1e-9 ? ' = ' : ' \\approx ') + N(r); }
  /** Écriture de la réponse : « v » ou « ≈ v arrondi » (pour reponseTex). */
  function ap(v, d) { var r = rd(v, d); return (Math.abs(r - v) < 1e-9 ? '' : '\\approx ') + N(r); }
  /** Horaire à partir d'un nombre de minutes : 7 h 05 */
  function hm(mn) {
    var h = Math.floor(mn / 60 + 1e-9), m = Math.round(mn - 60 * h);
    return h + ' h ' + (m < 10 ? '0' : '') + m;
  }
  /** Combinaisons C(n, k) et arrangements A(n, k) */
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function arrang(n, k) { var r = 1; for (var i = 0; i < k; i++) r *= n - i; return r; }
  /** Durée en heures décimales écrite en heures et minutes : 2 h 15 min */
  function duree(hdec) {
    var h = Math.floor(hdec + 1e-9), m = Math.round((hdec - h) * 60);
    return (h ? h + ' h' : '') + (m ? (h ? ' ' : '') + m + ' min' : '');
  }

  /**
   * Tableau HTML. rows : tableau de lignes ; chaque ligne est un tableau de cellules.
   * opt.head : la première ligne est une ligne d'en-têtes ; sinon, la première cellule
   * de chaque ligne est un en-tête.
   */
  function table(rows, opt) {
    opt = opt || {};
    return '<table class="em-tableau">' + rows.map(function (r, i) {
      return '<tr>' + r.map(function (c, j) {
        var th = opt.head ? i === 0 : j === 0;
        return th ? '<th>' + c + '</th>' : '<td>' + c + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</table>';
  }

  /** Premier élément d'une liste qui vérifie un test (sinon le dernier élément). */
  function first(arr, test) {
    for (var i = 0; i < arr.length; i++) if (test(arr[i])) return arr[i];
    return arr[arr.length - 1];
  }

  /** Dépôt des données brutes pour la vérification des développeurs (sans effet sinon). */
  function trace(id, niveau, d) {
    var V = root.EM_VERIF_MISSIONS;
    if (V && typeof V.push === 'function') V.push({ id: id, niveau: niveau, d: d });
  }

  /** Enregistre une mission (générateur ordinaire marqué « mission »). */
  function mission(def) {
    def.mission = true;
    def.examen = false;
    return EM.gen.register(def);
  }

  /**
   * Repère « à la main » quand les échelles des deux axes sont différentes.
   * o : { x0, x1, dx, y0, y1, dy, xlab, ylab, w, h, title, fx (format des abscisses), fy }
   */
  function cadre(o) {
    var gx = o.x1 - o.x0, gy = o.y1 - o.y0;
    var f = EM.fig.create({
      w: o.w || 300, h: o.h || 210,
      xmin: o.x0 - 0.17 * gx, xmax: o.x1 + 0.07 * gx,
      ymin: o.y0 - 0.15 * gy, ymax: o.y1 + 0.12 * gy,
      title: o.title || 'Graphique'
    });
    var fx = o.fx || function (v) { return T.txt(v); }, fy = o.fy || function (v) { return T.txt(v); };
    var s = '', x, y;
    for (x = o.x0 + o.dx; x <= o.x1 + 1e-9; x += o.dx)
      s += '<line class="fig-grid" x1="' + f.X(x) + '" y1="' + f.Y(o.y0) + '" x2="' + f.X(x) + '" y2="' + f.Y(o.y1) + '"/>';
    for (y = o.y0 + o.dy; y <= o.y1 + 1e-9; y += o.dy)
      s += '<line class="fig-grid" x1="' + f.X(o.x0) + '" y1="' + f.Y(y) + '" x2="' + f.X(o.x1) + '" y2="' + f.Y(y) + '"/>';
    f.add(s);
    f.vector([o.x0, o.y0], [o.x1 + 0.05 * gx, o.y0], { light: true });
    f.vector([o.x0, o.y0], [o.x0, o.y1 + 0.09 * gy], { light: true });
    for (x = o.x0; x <= o.x1 + 1e-9; x += o.dx) f.text([x, o.y0 - 0.1 * gy], fx(rd(x, 6)), { small: true });
    for (y = o.y0 + (o.y0Label ? 0 : o.dy); y <= o.y1 + 1e-9; y += o.dy) f.text([o.x0 - 0.025 * gx, y - 0.025 * gy], fy(rd(y, 6)), { small: true, anchor: 'end' });
    if (o.xlab) f.text([o.x1 + 0.05 * gx, o.y0 + 0.04 * gy], o.xlab, { small: true, anchor: 'end' });
    if (o.ylab) f.text([o.x0 + 0.02 * gx, o.y1 + 0.07 * gy], o.ylab, { small: true, anchor: 'start' });
    return f;
  }

  /* ================================================================== */
  /* ÉLÉMENTAIRE — CM2                                                   */
  /* ================================================================== */

  /* ------------------------- Le marché du samedi ------------------------- */
  mission({
    id: 'mission-marche-samedi',
    titre: 'Le marché du samedi',
    cycle: 'elementaire',
    classe: 'cm2',
    resume: "Tiens la caisse d'une vendeuse au grand marché : prix de revient, monnaie à rendre et bénéfice de la journée.",
    chapitres: ['cm2-operations', 'cm2-proportionnalite', 'cm2-problemes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var nom = rng.pick(FILLES);
      var ville = rng.pick(['Kaolack', 'Thiès', 'Diourbel', 'Louga', 'Tambacounda', 'Mbour', 'Kolda']);
      var prod = rng.pick([['oignons', "d'oignons"], ['pommes de terre', 'de pommes de terre'], ['carottes', 'de carottes']]);
      var Qk, pa, p, tr, r, guard = 0;
      do {
        Qk = rng.pick([25, 40, 50]);
        pa = rng.pick([250, 300, 350, 400]);
        p = pa + rng.pick([100, 150, 200]);
        tr = rng.pick([500, 1000, 1500]);
        r = niveau === 2 ? rng.int(2, 5) : 0;
      } while ((Qk - r) * p - Qk * pa - tr <= 0 && ++guard < 200);
      if ((Qk - r) * p - Qk * pa - tr <= 0) { Qk = 50; pa = 300; p = 450; tr = 1000; r = niveau === 2 ? 3 : 0; }
      var achat = Qk * pa, revient = achat + tr;
      var k = rng.int(2, 5), du = k * p;
      var billet = first([1000, 2000, 5000, 10000], function (b) { return b > du; });
      var monnaie = billet - du;
      var vendu = Qk - r, recette = vendu * p, benef = recette - revient;
      var mini = Math.ceil(revient / p - 1e-9);
      trace('mission-marche-samedi', niveau, { Q: Qk, pa: pa, p: p, tr: tr, r: r, k: k, billet: billet });

      var enonce = "Samedi, c'est jour de grand marché à " + ville + '. ' + nom + ' vend des ' + prod[0] + ' au détail. ' +
        'Le matin, elle achète chez un grossiste un sac de ' + M(Qk) + ' kg ' + prod[1] + " et paie un charretier pour l'apporter jusqu'à sa table." +
        table([
          ['Achat du sac de ' + M(Qk) + ' kg', cfa(achat)],
          ['Transport en charrette', cfa(tr)],
          ['Prix de vente au détail', cfa(p) + ' le kg']
        ]) +
        'Dans la matinée, un client achète ' + M(k) + ' kg ' + prod[1] + ' et paie avec un billet de ' + cfa(billet) + '.<br>' +
        (niveau === 1 ? 'En fin de journée, tout le sac a été vendu.'
          : 'En fin de journée, ' + M(r) + ' kg ' + prod[1] + " abîmés n'ont pas pu être vendus ; tout le reste a été vendu.") +
        '<br>Aide ' + nom + ' à faire ses comptes.';

      var qs = [], sol = [], n = 1;
      if (niveau === 1) {
        qs.push({ label: n + ") Prix d'achat d'un kilogramme :", type: 'number', reponse: pa, unite: 'F CFA' });
        sol.push(Q(n++) + 'Le sac de ' + M(Qk) + ' kg coûte ' + cfa(achat) + '. Un kilogramme coûte donc $' + N(achat) + ' \\div ' + Qk + ' = ' + N(pa) + '$ F CFA.');
      }
      qs.push({ label: n + ') Prix de revient du sac (achat + transport) :', type: 'number', reponse: revient, unite: 'F CFA' });
      sol.push(Q(n++) + 'Prix de revient $=$ prix d\'achat $+$ frais : $' + N(achat) + ' + ' + N(tr) + ' = ' + N(revient) + '$ F CFA.');
      qs.push({ label: n + ') Monnaie rendue au client :', type: 'number', reponse: monnaie, unite: 'F CFA' });
      sol.push(Q(n++) + 'Le client doit $' + k + ' \\times ' + N(p) + ' = ' + N(du) + '$ F CFA. ' + nom + ' lui rend $' + N(billet) + ' - ' + N(du) + ' = ' + N(monnaie) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: n + ') Masse de ' + prod[0] + ' vendue :', type: 'number', reponse: vendu, unite: 'kg' });
        sol.push(Q(n++) + 'Masse vendue : $' + Qk + ' - ' + r + ' = ' + vendu + '$ kg.');
      }
      qs.push({ label: n + ') Recette de la journée :', type: 'number', reponse: recette, unite: 'F CFA' });
      sol.push(Q(n++) + 'Le prix est proportionnel à la masse : recette $= ' + vendu + ' \\times ' + N(p) + ' = ' + N(recette) + '$ F CFA.');
      qs.push({ label: n + ') Bénéfice de la journée :', type: 'number', reponse: benef, unite: 'F CFA' });
      sol.push(Q(n++) + 'Bénéfice $=$ recette $-$ prix de revient $= ' + N(recette) + ' - ' + N(revient) + ' = ' + N(benef) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: n + ') Masse minimale à vendre (en kg entiers) pour couvrir le prix de revient :', type: 'number', reponse: mini, unite: 'kg' });
        var exact = mini * p === revient;
        sol.push(Q(n++) + 'Il faut que la recette atteigne ' + cfa(revient) + '. ' +
          (exact ? '$' + N(revient) + ' \\div ' + N(p) + ' = ' + mini + '$ : avec ' + M(mini) + ' kg vendus, la recette est exactement égale au prix de revient.'
            : '$' + N(revient) + ' \\div ' + N(p) + ' \\approx ' + N(rd(revient / p, 2)) + '$. Avec ' + M(mini - 1) + ' kg, la recette ($' + N((mini - 1) * p) + '$ F CFA) est insuffisante ; avec ' + M(mini) + ' kg, elle vaut $' + N(mini * p) + '$ F CFA. Il faut donc vendre au moins ' + M(mini) + ' kg.'));
      }
      sol.push('Bilan : ' + nom + ' gagne ' + cfa(benef) + ' sur ce sac.');
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          "Le prix de revient, c'est tout ce que le sac a coûté : l'achat et le transport.",
          'Recette $=$ masse vendue $\\times$ prix d\'un kilogramme ; bénéfice $=$ recette $-$ prix de revient.',
          'Monnaie rendue $=$ billet donné $-$ somme due.'
        ],
        solution: sol,
        aide: 'Écris les montants en chiffres, par exemple 12500 ou 12 500.'
      };
    }
  });

  /* ------------------------- Le thiéboudienne de la famille ------------------------- */
  mission({
    id: 'mission-thieboudienne',
    titre: 'Le thiéboudienne de la famille',
    cycle: 'elementaire',
    classe: 'cm2',
    resume: 'Adapte la recette du thiéboudienne au nombre de convives et calcule le budget du marché.',
    chapitres: ['cm2-proportionnalite', 'cm2-mesures', 'cm2-operations'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var nom = rng.pick(FILLES);
      var ville = rng.pick(['Saint-Louis', 'Dakar', 'Mbour', 'Ziguinchor', 'Thiès', 'Rufisque', 'Joal']);
      var occasion = rng.pick(['le baptême de son neveu', 'le retour de son frère', 'la fête de fin d\'année scolaire', 'le repas du dimanche']);
      var nb = niveau === 1 ? rng.pick([6, 10, 12, 14, 16, 18]) : rng.pick([5, 7, 9, 11, 13, 15]);
      var pr = rng.pick([400, 480, 560, 600]);     // riz, F CFA le kg
      var pp = rng.pick([2000, 2500, 3000, 3500]); // poisson, F CFA le kg
      var ph = rng.pick([1100, 1200, 1300, 1500]); // huile, F CFA le litre
      var pl = rng.pick([800, 1000, 1200]);        // lot de légumes pour 4 personnes
      var riz = 125 * nb;                 // g
      var poisson = rd(0.2 * nb, 6);      // kg
      var huileCl = 5 * nb;               // cL
      var huileL = rd(0.05 * nb, 6);      // L
      var cR = nb * pr / 8, cP = nb * pp / 5, cH = nb * ph / 20, cL = nb * pl / 4;
      var total = cR + cP + cH + cL;
      var budget = Math.ceil((total + 1000) / 5000) * 5000;
      var reste = budget - total;
      trace('mission-thieboudienne', niveau, { nb: nb, pr: pr, pp: pp, ph: ph, pl: pl, budget: budget });

      var coef = nb % 4 === 0 ? String(nb / 4) : '\\dfrac{' + nb + '}{4}';
      var enonce = 'Pour ' + occasion + ', ' + nom + ' prépare un thiéboudienne à ' + ville + ' pour ' + M(nb) + ' personnes. ' +
        'Sa recette est prévue pour ' + M(4) + ' personnes ; les prix sont ceux relevés au marché du quartier.' +
        table([
          ['Ingrédient', 'Pour $4$ personnes', 'Prix au marché'],
          ['Riz brisé', '$500$ g', cfa(pr) + ' le kg'],
          ['Poisson (thiof)', '$800$ g', cfa(pp) + ' le kg'],
          ['Huile', '$20$ cL', cfa(ph) + ' le litre'],
          ['Légumes (chou, carotte, manioc, aubergine)', '$1$ lot', cfa(pl) + ' le lot']
        ], { head: true }) +
        'Les quantités sont proportionnelles au nombre de personnes. ' + nom + ' part au marché avec ' + cfa(budget) + '.';

      var qs = [], sol = [];
      sol.push('On passe de $4$ à $' + nb + '$ personnes : on multiplie toutes les quantités par $' + coef + '$' +
        (nb % 4 === 0 ? '' : ' (ou on calcule d\'abord la quantité pour $1$ personne)') + '.');
      qs.push({ label: '1) Masse de riz nécessaire :', type: 'number', reponse: riz, unite: 'g' });
      sol.push(Q(1) + 'Pour $1$ personne : $500 \\div 4 = 125$ g de riz. Pour $' + nb + '$ personnes : $125 \\times ' + nb + ' = ' + N(riz) + '$ g, soit $' + N(riz / 1000) + '$ kg.');
      qs.push({ label: '2) Masse de poisson nécessaire (en kg) :', type: 'number', reponse: poisson, unite: 'kg' });
      sol.push(Q(2) + 'Pour $1$ personne : $800 \\div 4 = 200$ g de poisson. Pour $' + nb + '$ personnes : $200 \\times ' + nb + ' = ' + N(200 * nb) + '$ g $= ' + N(poisson) + '$ kg.');
      if (niveau === 1) {
        qs.push({ label: "3) Volume d'huile nécessaire (en cL) :", type: 'number', reponse: huileCl, unite: 'cL' });
        sol.push(Q(3) + 'Pour $1$ personne : $20 \\div 4 = 5$ cL. Pour $' + nb + '$ personnes : $5 \\times ' + nb + ' = ' + huileCl + '$ cL, soit $' + N(huileL) + '$ L.');
      } else {
        qs.push({ label: "3) Volume d'huile nécessaire (en litres) :", type: 'number', reponse: huileL, unite: 'L' });
        sol.push(Q(3) + 'Pour $1$ personne : $20 \\div 4 = 5$ cL. Pour $' + nb + '$ personnes : $5 \\times ' + nb + ' = ' + huileCl + '$ cL. Comme $1$ L $= 100$ cL, cela fait $' + N(huileL) + '$ L.');
      }
      qs.push({ label: '4) Coût total des ingrédients :', type: 'number', reponse: total, unite: 'F CFA' });
      sol.push(Q(4) + 'Riz : $' + N(riz / 1000) + ' \\times ' + N(pr) + ' = ' + N(cR) + '$ F ; poisson : $' + N(poisson) + ' \\times ' + N(pp) + ' = ' + N(cP) + '$ F ; ' +
        'huile : $' + N(huileL) + ' \\times ' + N(ph) + ' = ' + N(cH) + '$ F ; légumes : $' + N(pl) + ' \\times ' + coef + ' = ' + N(cL) + '$ F.<br>' +
        'Total : $' + N(cR) + ' + ' + N(cP) + ' + ' + N(cH) + ' + ' + N(cL) + ' = ' + N(total) + '$ F CFA.');
      qs.push({ label: '5) Somme qui reste à ' + nom + ' après ses achats :', type: 'number', reponse: reste, unite: 'F CFA' });
      sol.push(Q(5) + '$' + N(budget) + ' - ' + N(total) + ' = ' + N(reste) + '$ F CFA.');
      if (niveau === 2) {
        var pp1 = total / nb;
        qs.push({ label: '6) Coût du repas par personne (arrondi au franc) :', type: 'number', reponse: pp1, tol: 0.5, reponseTex: '\\approx ' + N(Math.round(pp1)), unite: 'F CFA' });
        sol.push(Q(6) + '$' + N(total) + ' \\div ' + nb + ' \\approx ' + N(rd(pp1, 2)) + '$, soit environ ' + cfa(Math.round(pp1)) + ' par personne.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Calcule d\'abord la quantité de chaque ingrédient pour $1$ personne (divise par $4$), puis multiplie par le nombre de personnes.',
          'Attention aux unités : $1$ kg $= 1\\,000$ g et $1$ L $= 100$ cL. Les prix sont donnés au kilogramme et au litre.',
          'Pour les légumes, compte combien de « lots pour $4$ personnes » il faut.'
        ],
        solution: sol,
        aide: 'Écris les nombres décimaux avec une virgule, par exemple 1,4.'
      };
    }
  });

  /* ================================================================== */
  /* MOYEN — 6e                                                          */
  /* ================================================================== */

  /* ------------------------- Le jardin maraîcher ------------------------- */
  mission({
    id: 'mission-jardin-maraicher',
    titre: 'Clôturer le jardin maraîcher',
    cycle: 'moyen',
    classe: '6e',
    resume: 'Le groupement des femmes maraîchères veut clôturer son jardin : périmètre, grillage, aire et récolte.',
    chapitres: ['6e-perimetres-aires', '6e-operations', '6e-fractions'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var lieu = rng.pick(['Rufisque', 'Sangalkam', 'Mboro', 'Bayakh', 'Sébikotane', 'Keur Massar']);
      var presidente = rng.pick(FILLES);
      var culture = rng.pick(['oignons', 'tomates', 'choux', 'carottes']);
      var L = rng.int(18, 40), l = rng.int(10, Math.min(24, L - 4)), g = rng.pick([2, 3, 4]);
      var A = L * l;
      var FR = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5], [3, 5], [3, 8]];
      var cand = FR.filter(function (f) { return (A * f[0]) % f[1] === 0; });
      if (!cand.length) { l += 1; A = L * l; cand = FR.filter(function (f) { return (A * f[0]) % f[1] === 0; }); }
      var fr = rng.pick(cand);
      var P = 2 * (L + l), G = P - g;
      var pm = rng.pick([600, 750, 800, 900, 1000, 1200]);
      var R = rng.pick([15000, 17500, 20000, 22500]);
      var nr = Math.ceil(G / 25);
      var cout = niveau === 1 ? G * pm : nr * R;
      var Ac = A * fr[0] / fr[1];
      var rdt = rng.pick([2, 2.5, 3, 3.5]);
      var recolte = rd(Ac * rdt, 6);
      trace('mission-jardin-maraicher', niveau, { L: L, l: l, g: g, pm: pm, R: R, fr: fr, rdt: rdt });

      var a = (L - g) / 2;
      var f = EM.fig.fit([[0, 0], [L, 0], [L, l], [0, l]], { w: 300, h: 200, pad: 32, title: 'Plan du jardin maraîcher' });
      f.polyline([[a + g, 0], [L, 0], [L, l], [0, l], [0, 0], [a, 0]]);
      f.dot([a, 0]).dot([a + g, 0]);
      f.text([L / 2, l * 0.1], 'portail (' + g + ' m)', { small: true });
      f.segLabel([0, l], [L, l], L + ' m', { inside: [L / 2, l / 2] });
      f.segLabel([0, 0], [0, l], l + ' m', { inside: [L / 2, l / 2] });

      var frTex = '\\dfrac{' + fr[0] + '}{' + fr[1] + '}';
      var enonce = 'À ' + lieu + ', le groupement des femmes maraîchères présidé par ' + presidente + ' cultive un jardin rectangulaire de ' + M(L) + ' m de long et ' + M(l) + ' m de large. ' +
        'Pour protéger les cultures des chèvres, il faut entourer le jardin d\'un grillage, sauf à l\'endroit du portail, large de ' + M(g) + ' m.<br>' +
        (niveau === 1 ? 'Le grillage est vendu ' + cfa(pm) + ' le mètre.'
          : 'Le grillage est vendu en rouleaux de ' + M(25) + ' m, au prix de ' + cfa(R) + ' le rouleau (on ne peut pas acheter un morceau de rouleau).') +
        '<br>Les ' + culture + ' occuperont les $' + frTex + '$ de la surface du jardin.' +
        (niveau === 2 ? ' On espère récolter en moyenne ' + M(rdt) + ' kg de ' + culture + ' par mètre carré.' : '');

      var qs = [], sol = [], n = 1;
      if (niveau === 1) {
        qs.push({ label: n + ') Périmètre du jardin :', type: 'number', reponse: P, unite: 'm' });
        sol.push(Q(n++) + 'Périmètre d\'un rectangle : $2 \\times (L + \\ell) = 2 \\times (' + L + ' + ' + l + ') = ' + P + '$ m.');
      }
      qs.push({ label: n + ') Longueur de grillage nécessaire :', type: 'number', reponse: G, unite: 'm' });
      sol.push(Q(n++) + (niveau === 2 ? 'Le périmètre vaut $2 \\times (' + L + ' + ' + l + ') = ' + P + '$ m. ' : '') +
        'On retire le portail : $' + P + ' - ' + g + ' = ' + G + '$ m de grillage.');
      if (niveau === 2) {
        qs.push({ label: n + ') Nombre de rouleaux à acheter :', type: 'number', reponse: nr });
        sol.push(Q(n++) + '$' + G + ' \\div 25 = ' + N(rd(G / 25, 2)) + '$' + (G % 25 === 0 ? ' : il faut exactement $' + nr + '$ rouleaux.'
          : ' : $' + (nr - 1) + '$ rouleaux ne suffisent pas ($' + (25 * (nr - 1)) + '$ m), il faut donc acheter $' + nr + '$ rouleaux.'));
      }
      qs.push({ label: n + ') Coût du grillage :', type: 'number', reponse: cout, unite: 'F CFA' });
      sol.push(Q(n++) + (niveau === 1 ? '$' + G + ' \\times ' + N(pm) + ' = ' + N(cout) + '$ F CFA.' : '$' + nr + ' \\times ' + N(R) + ' = ' + N(cout) + '$ F CFA.'));
      qs.push({ label: n + ') Aire du jardin :', type: 'number', reponse: A, unite: 'm²' });
      sol.push(Q(n++) + 'Aire d\'un rectangle : $L \\times \\ell = ' + L + ' \\times ' + l + ' = ' + N(A) + '$ m².');
      qs.push({ label: n + ') Aire réservée aux ' + culture + ' :', type: 'number', reponse: Ac, unite: 'm²' });
      sol.push(Q(n++) + 'Prendre les $' + frTex + '$ de $' + N(A) + '$ : $' + N(A) + ' \\div ' + fr[1] + (fr[0] > 1 ? ' \\times ' + fr[0] : '') + ' = ' + N(Ac) + '$ m².');
      if (niveau === 2) {
        qs.push({ label: n + ') Récolte espérée de ' + culture + ' :', type: 'number', reponse: recolte, unite: 'kg' });
        sol.push(Q(n++) + '$' + N(Ac) + ' \\times ' + N(rdt) + ' = ' + N(recolte) + '$ kg.');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Périmètre d\'un rectangle : $2 \\times (L + \\ell)$ ; aire : $L \\times \\ell$.',
          'Le portail n\'a pas besoin de grillage : retire sa largeur du périmètre.',
          'Prendre une fraction d\'une quantité : on divise par le dénominateur puis on multiplie par le numérateur.'
        ],
        solution: sol
      };
    }
  });

  /* ------------------------- Le terrain de lutte ------------------------- */
  mission({
    id: 'mission-terrain-lutte',
    titre: 'Tracer le terrain de lutte',
    cycle: 'moyen',
    classe: '6e',
    resume: "Le quartier organise un tournoi de lutte : trace l'arène circulaire, calcule son aire et le sable à acheter.",
    chapitres: ['6e-cercle', '6e-perimetres-aires', '6e-operations'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var quartier = rng.pick(['Pikine', 'Guédiawaye', 'Grand-Yoff', 'Thiaroye', 'Mbour', 'Fatick', 'Diourbel']);
      var chef = rng.pick(GARCONS);
      var D = rng.pick([10, 12, 14, 16, 18, 20]), r = D / 2;
      var Lb = rd(3.14 * D, 4), A = rd(3.14 * r * r, 4);
      var s = rng.pick([2, 3, 4]), ns = Math.ceil(rd(A / s, 6) - 1e-9);
      var ps = rng.pick([1500, 2000, 2500]), cout = ns * ps;
      var e = rng.pick([2, 3, 4]), c = D + 2 * e, Az = rd(c * c - A, 4);
      trace('mission-terrain-lutte', niveau, { D: D, s: s, ps: ps, e: e });

      var pts = niveau === 2 ? [[-c / 2, -c / 2], [c / 2, c / 2]] : [[-r, -r], [r, r]];
      var f = EM.fig.fit(pts, { w: 230, h: 230, pad: 26, title: 'Arène de lutte' });
      if (niveau === 2) f.poly([[-c / 2, -c / 2], [c / 2, -c / 2], [c / 2, c / 2], [-c / 2, c / 2]]);
      f.circle([0, 0], r, { fill: true });
      f.seg([-r, 0], [r, 0], { accent: true });
      f.point([0, 0], 'O', 'n');
      f.segLabel([-r, 0], [r, 0], D + ' m');
      if (niveau === 2) f.segLabel([-c / 2, c / 2], [c / 2, c / 2], c + ' m', { inside: [0, 0] });

      var enonce = 'Dans le quartier de ' + quartier + ', l\'association sportive de ' + chef + ' prépare un tournoi de lutte. ' +
        'L\'arène sera un disque de ' + M(D) + ' m de diamètre, de centre $O$.<br>' +
        '• Pour délimiter l\'arène, on pose une rangée de sacs de sable tout le long du cercle.<br>' +
        '• Le sol de l\'arène est recouvert de sable fin : il faut ' + M(1) + ' sac de sable fin pour ' + M(s) + ' m², vendu ' + cfa(ps) + ' le sac.' +
        (niveau === 2 ? '<br>• L\'arène est placée au centre d\'un enclos carré de ' + M(c) + ' m de côté ; l\'espace entre le carré et le cercle accueille les spectateurs.' : '') +
        '<br>On prend $\\pi \\approx 3{,}14$.';

      var qs = [], sol = [];
      qs.push({ label: '1) Rayon de l\'arène :', type: 'number', reponse: r, unite: 'm' });
      sol.push(Q(1) + 'Le rayon est la moitié du diamètre : $' + D + ' \\div 2 = ' + r + '$ m.');
      qs.push({ label: '2) Longueur du cercle (rangée de sacs) :', type: 'number', reponse: Lb, tol: 0.01, unite: 'm' });
      sol.push(Q(2) + 'Longueur d\'un cercle : $\\pi \\times D \\approx 3{,}14 \\times ' + D + ' = ' + N(Lb) + '$ m.');
      qs.push({ label: '3) Aire de l\'arène :', type: 'number', reponse: A, tol: 0.01, unite: 'm²' });
      sol.push(Q(3) + 'Aire d\'un disque : $\\pi \\times r \\times r \\approx 3{,}14 \\times ' + r + ' \\times ' + r + ' = ' + N(A) + '$ m².');
      qs.push({ label: '4) Nombre de sacs de sable fin à acheter :', type: 'number', reponse: ns });
      sol.push(Q(4) + '$' + N(A) + ' \\div ' + s + ' \\approx ' + N(rd(A / s, 2)) + '$. On ne peut pas acheter un morceau de sac : il faut $' + ns + '$ sacs.');
      qs.push({ label: '5) Coût du sable fin :', type: 'number', reponse: cout, unite: 'F CFA' });
      sol.push(Q(5) + '$' + ns + ' \\times ' + N(ps) + ' = ' + N(cout) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: '6) Aire de l\'espace réservé aux spectateurs :', type: 'number', reponse: Az, tol: 0.01, unite: 'm²' });
        sol.push(Q(6) + 'Aire du carré : $' + c + ' \\times ' + c + ' = ' + N(c * c) + '$ m². On retire l\'aire du disque : $' + N(c * c) + ' - ' + N(A) + ' = ' + N(Az) + '$ m².');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Le rayon est la moitié du diamètre. Longueur du cercle : $\\pi \\times D$ ; aire du disque : $\\pi \\times r \\times r$.',
          'Pour le nombre de sacs, divise l\'aire par la surface couverte par un sac, puis arrondis à l\'entier supérieur.',
          'Aire d\'un carré : côté $\\times$ côté.'
        ],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* MOYEN — 5e                                                          */
  /* ================================================================== */

  /* ------------------------- Partager la récolte d'arachide ------------------------- */
  mission({
    id: 'mission-recolte-arachide',
    titre: "Partager la récolte d'arachide",
    cycle: 'moyen',
    classe: '5e',
    resume: "Un cultivateur du bassin arachidier répartit sa récolte : semences, consommation, vente et diagramme circulaire.",
    chapitres: ['5e-fractions', '5e-proportionnalite', '5e-statistiques'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var nom = rng.pick(GARCONS);
      var lieu = rng.pick(['Kaffrine', 'Nioro du Rip', 'Kaolack', 'Diourbel', 'Bambey', 'Koungheul', 'Fatick']);
      var f1 = rng.pick([[1, 4], [1, 5], [1, 6]]), f2 = rng.pick([[1, 3], [1, 4], [2, 5], [1, 2]]);
      var Ms = [1200, 1500, 1800, 2400, 3000, 3600, 4500, 4800, 6000].filter(function (m) {
        if ((m * f1[0]) % f1[1]) return false;
        var rest = m - m * f1[0] / f1[1];
        return (rest * f2[0]) % f2[1] === 0;
      });
      var Mt = rng.pick(Ms);
      var p = rng.pick([250, 275, 300, 325, 350]);
      var sem = Mt * f1[0] / f1[1], rest = Mt - sem, cons = rest * f2[0] / f2[1], vend = rest - cons;
      var fv = F(f1[1] - f1[0], f1[1]).mul(F(f2[1] - f2[0], f2[1]));
      var recette = vend * p;
      var angle = rd(fv.value() * 360, 6);
      var tc = rng.shuffle([2, 4, 5, 10]).concat([20]);
      var t = first(tc, function (x) { return (recette * (100 - x)) % 100 === 0; });
      var net = recette * (100 - t) / 100;
      trace('mission-recolte-arachide', niveau, { M: Mt, f1: f1, f2: f2, p: p, t: t });

      var f1T = '\\dfrac{' + f1[0] + '}{' + f1[1] + '}', f2T = '\\dfrac{' + f2[0] + '}{' + f2[1] + '}';
      var enonce = 'À ' + lieu + ', au cœur du bassin arachidier, ' + nom + ' a récolté ' + M(Mt) + ' kg d\'arachide en coque. Il répartit sa récolte ainsi :<br>' +
        '• il garde les $' + f1T + '$ de la récolte comme semences pour la prochaine saison ;<br>' +
        '• sa famille consomme les $' + f2T + '$ de ce qui reste ;<br>' +
        '• il vend tout le reste à la coopérative, au prix (fixé dans cette mission) de ' + cfa(p) + ' le kilogramme.' +
        (niveau === 2 ? '<br>La coopérative retient ' + M(t) + ' % du montant de la vente pour le transport et le stockage.' : '') +
        '<br>Pour la réunion du village, son fils doit représenter cette répartition par un diagramme circulaire.';

      var qs = [], sol = [], n = 1;
      qs.push({ label: n + ') Masse gardée pour les semences :', type: 'number', reponse: sem, unite: 'kg' });
      sol.push(Q(n++) + 'Les $' + f1T + '$ de $' + N(Mt) + '$ kg : $' + N(Mt) + ' \\div ' + f1[1] + (f1[0] > 1 ? ' \\times ' + f1[0] : '') + ' = ' + N(sem) + '$ kg.');
      qs.push({ label: n + ') Masse consommée par la famille :', type: 'number', reponse: cons, unite: 'kg' });
      sol.push(Q(n++) + 'Il reste $' + N(Mt) + ' - ' + N(sem) + ' = ' + N(rest) + '$ kg. La famille en consomme les $' + f2T + '$ : $' + N(rest) + ' \\div ' + f2[1] + (f2[0] > 1 ? ' \\times ' + f2[0] : '') + ' = ' + N(cons) + '$ kg.');
      if (niveau === 1) {
        qs.push({ label: n + ') Masse vendue à la coopérative :', type: 'number', reponse: vend, unite: 'kg' });
        sol.push(Q(n++) + '$' + N(rest) + ' - ' + N(cons) + ' = ' + N(vend) + '$ kg.');
      } else {
        qs.push({ label: n + ') Fraction de la récolte totale qui est vendue :', type: 'number', reponse: fv });
        sol.push(Q(n++) + 'Après les semences, il reste $1 - ' + f1T + ' = \\dfrac{' + (f1[1] - f1[0]) + '}{' + f1[1] + '}$ de la récolte ; on en vend $1 - ' + f2T + ' = \\dfrac{' + (f2[1] - f2[0]) + '}{' + f2[1] + '}$. ' +
          'Fraction vendue : $\\dfrac{' + (f2[1] - f2[0]) + '}{' + f2[1] + '} \\times \\dfrac{' + (f1[1] - f1[0]) + '}{' + f1[1] + '} = ' + fv.tex() + '$. Vérification : $' + fv.tex() + ' \\times ' + N(Mt) + ' = ' + N(vend) + '$ kg vendus.');
      }
      qs.push({ label: n + ') Montant de la vente :', type: 'number', reponse: recette, unite: 'F CFA' });
      sol.push(Q(n++) + 'Le prix est proportionnel à la masse : $' + N(vend) + ' \\times ' + N(p) + ' = ' + N(recette) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: n + ') Somme réellement perçue après la retenue :', type: 'number', reponse: net, unite: 'F CFA' });
        sol.push(Q(n++) + 'Retenue : $' + N(recette) + ' \\times \\dfrac{' + t + '}{100} = ' + N(recette - net) + '$ F CFA. Somme perçue : $' + N(recette) + ' - ' + N(recette - net) + ' = ' + N(net) + '$ F CFA ' +
          '(ou directement $' + N(recette) + ' \\times ' + N((100 - t) / 100) + '$).');
      }
      qs.push({ label: n + ') Angle du secteur « vente » dans le diagramme circulaire :', type: 'number', reponse: angle, tol: 0.01, unite: '°' });
      sol.push(Q(n++) + 'L\'angle est proportionnel à la masse : $360^\\circ$ correspondent à $' + N(Mt) + '$ kg. Angle de la vente : $\\dfrac{' + N(vend) + '}{' + N(Mt) + '} \\times 360 = ' + fv.tex() + ' \\times 360 = ' + N(angle) + '^\\circ$.');
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Attention : la famille consomme une fraction de ce qui <em>reste</em> après les semences, pas de la récolte entière.',
          'Prendre les $\\dfrac{a}{b}$ d\'une quantité : on la divise par $b$ puis on multiplie par $a$.',
          'Dans un diagramme circulaire, les angles sont proportionnels aux quantités : la récolte entière correspond à $360^\\circ$.'
        ],
        solution: sol,
        aide: 'Une fraction peut s\'écrire 3/5. Les nombres décimaux s\'écrivent avec une virgule.'
      };
    }
  });

  /* ------------------------- Construire un poulailler ------------------------- */
  mission({
    id: 'mission-poulailler',
    titre: 'Construire un poulailler',
    cycle: 'moyen',
    classe: '5e',
    resume: 'Un jeune éleveur construit son poulailler : surface, nombre de poules, volume, grillage et abreuvoir.',
    chapitres: ['5e-prisme-cylindre', '6e-perimetres-aires', '5e-proportionnalite'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var nom = rng.pick(GARCONS);
      var lieu = rng.pick(['Thiès', 'Pout', 'Tivaouane', 'Mont-Rolland', 'Khombole', 'Keur Moussa']);
      var L = rng.pick([3, 3.5, 4, 4.5, 5]), l = rng.pick([2, 2.5, 3]), h = rng.pick([1.8, 2, 2.2, 2.4]);
      var d = rng.pick([4, 5, 6]), pg = rng.pick([1500, 2000, 2500]);
      var As = rd(L * l, 6), nmax = Math.floor(rd(d * As, 6) + 1e-9), V = rd(L * l * h, 6);
      var Al = rd(2 * (L + l) * h, 6), cout = rd(Al * pg, 6);
      var rc = rng.pick([10, 12, 15]), Hc = rng.pick([20, 25, 30]);
      var Vc = rd(3.14 * rc * rc * Hc, 6), VcL = rd(Vc / 1000, 6);
      trace('mission-poulailler', niveau, { L: L, l: l, h: h, d: d, pg: pg, rc: rc, Hc: Hc });

      // perspective cavalière
      var k = 0.5, ang = Math.PI / 6, ox = l * k * Math.cos(ang), oy = l * k * Math.sin(ang);
      var A = [0, 0], B = [L, 0], C = [L, h], D = [0, h], E = [ox, oy], Fp = [L + ox, oy], G = [L + ox, h + oy], H = [ox, h + oy];
      var f = EM.fig.fit([A, B, G, H, E, Fp], { w: 280, h: 200, pad: 34, title: 'Poulailler en forme de pavé droit' });
      f.poly([A, B, C, D]);
      f.seg(B, Fp).seg(Fp, G).seg(G, H).seg(H, D).seg(C, G);
      f.seg(A, E, { dash: true }).seg(E, Fp, { dash: true }).seg(E, H, { dash: true });
      f.segLabel(A, B, tx(L) + ' m');
      f.segLabel(B, Fp, tx(l) + ' m', { inside: D });
      f.segLabel(A, D, tx(h) + ' m', { inside: C });

      var enonce = 'À ' + lieu + ', ' + nom + ' se lance dans l\'élevage de poules pondeuses. Son poulailler a la forme d\'un pavé droit (prisme droit à base rectangulaire) : ' +
        'le sol est un rectangle de ' + M(L) + ' m sur ' + M(l) + ' m et la hauteur est de ' + M(h) + ' m.<br>' +
        '• Le technicien d\'élevage conseille de ne pas mettre plus de ' + M(d) + ' poules par mètre carré de sol.<br>' +
        '• Les quatre faces latérales sont en grillage, vendu ' + cfa(pg) + ' le mètre carré ; le toit est en tôle.' +
        (niveau === 2 ? '<br>• L\'abreuvoir est un cylindre de ' + M(rc) + ' cm de rayon et ' + M(Hc) + ' cm de hauteur. On prend $\\pi \\approx 3{,}14$.' : '');

      var qs = [], sol = [];
      qs.push({ label: '1) Aire du sol :', type: 'number', reponse: As, unite: 'm²' });
      sol.push(Q(1) + '$' + N(L) + ' \\times ' + N(l) + ' = ' + N(As) + '$ m².');
      qs.push({ label: '2) Nombre maximal de poules :', type: 'number', reponse: nmax });
      sol.push(Q(2) + 'Le nombre de poules est proportionnel à l\'aire : $' + d + ' \\times ' + N(As) + ' = ' + N(rd(d * As, 6)) + '$. ' +
        (EM.ar.isInt(rd(d * As, 6)) ?'Il peut donc loger au plus $' + nmax + '$ poules.' : 'On ne peut pas dépasser cette valeur : au plus $' + nmax + '$ poules.'));
      qs.push({ label: '3) Volume du poulailler :', type: 'number', reponse: V, unite: 'm³' });
      sol.push(Q(3) + 'Volume d\'un pavé droit : $L \\times \\ell \\times h = ' + N(L) + ' \\times ' + N(l) + ' \\times ' + N(h) + ' = ' + N(V) + '$ m³.');
      qs.push({ label: '4) Aire totale de grillage (les quatre faces latérales) :', type: 'number', reponse: Al, unite: 'm²' });
      sol.push(Q(4) + 'Aire latérale d\'un prisme droit $=$ périmètre de la base $\\times$ hauteur : $2 \\times (' + N(L) + ' + ' + N(l) + ') \\times ' + N(h) + ' = ' + N(rd(2 * (L + l), 6)) + ' \\times ' + N(h) + ' = ' + N(Al) + '$ m².');
      qs.push({ label: '5) Coût du grillage :', type: 'number', reponse: cout, unite: 'F CFA' });
      sol.push(Q(5) + '$' + N(Al) + ' \\times ' + N(pg) + ' = ' + N(cout) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: '6) Contenance de l\'abreuvoir (en litres) :', type: 'number', reponse: VcL, tol: 0.01, unite: 'L' });
        sol.push(Q(6) + 'Volume d\'un cylindre : $\\pi \\times r^2 \\times h \\approx 3{,}14 \\times ' + rc + '^2 \\times ' + Hc + ' = ' + N(Vc) + '$ cm³. ' +
          'Or $1$ L $= 1\\,000$ cm³ : la contenance est $' + N(VcL) + '$ L.');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Aire d\'un rectangle : longueur $\\times$ largeur ; volume d\'un pavé droit : longueur $\\times$ largeur $\\times$ hauteur.',
          'Aire latérale d\'un prisme droit : périmètre de la base $\\times$ hauteur.',
          'Volume d\'un cylindre : $\\pi \\times r^2 \\times h$ ; et $1$ dm³ $= 1$ L $= 1\\,000$ cm³.'
        ],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* MOYEN — 4e                                                          */
  /* ================================================================== */

  /* ------------------------- Voyage Dakar – Saint-Louis ------------------------- */
  mission({
    id: 'mission-voyage-saint-louis',
    titre: 'Voyage Dakar – Saint-Louis',
    cycle: 'moyen',
    classe: '4e',
    resume: "Un bus et un taxi roulent l'un vers l'autre sur la route de Saint-Louis : durée, heure d'arrivée et point de croisement.",
    chapitres: ['4e-applications-lineaires', '4e-equations', '5e-proportionnalite'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var Dl = niveau === 1 ? 0 : rng.pick([0.5, 1]);
      var combos = [];
      [60, 75, 80].forEach(function (v1) {
        [80, 90, 100].forEach(function (v2) {
          [1.5, 1.75, 2, 2.25, 2.5].forEach(function (t) {
            var D = (v1 + v2) * t - v2 * Dl;
            if (D >= 240 && D <= 280 && ar.isInt(D) && ar.isInt(60 * D / v1) && t > Dl) combos.push([v1, v2, t, D]);
          });
        });
      });
      var c = rng.pick(combos), v1 = c[0], v2 = c[1], ts = c[2], D = c[3];
      var dep = rng.pick([390, 420, 450, 480]); // départ du bus, en minutes après minuit
      var dur = 60 * D / v1, arr = dep + dur;
      var ah = Math.floor(arr / 60), am = arr - 60 * ah;
      var K = D + v2 * Dl, dist = v1 * ts;
      var voy = rng.pick(FILLES), oncle = rng.pick(GARCONS);
      trace('mission-voyage-saint-louis', niveau, { v1: v1, v2: v2, D: D, Dl: Dl, dep: dep });

      var f = EM.fig.create({ w: 300, h: 96, xmin: -1.6, xmax: 11.6, ymin: -1.3, ymax: 2.2, title: 'La route Dakar – Saint-Louis' });
      f.seg([0, 0], [10, 0]);
      f.point([0, 0], 'Dakar', 's').point([10, 0], 'Saint-Louis', 's');
      f.vector([0.2, 0.9], [3.2, 0.9], { accent: true });
      f.text([1.7, 1.35], 'bus : ' + v1 + ' km/h', { small: true });
      f.vector([9.8, 0.9], [6.8, 0.9]);
      f.text([8.3, 1.35], 'taxi : ' + v2 + ' km/h', { small: true });
      f.text([5, 0.25], D + ' km', { small: true });

      var enonce = voy + ' part de Dakar pour rendre visite à sa grand-mère à Saint-Louis. Dans cette mission, on prend ' + M(D) + ' km pour la distance entre les deux villes et on suppose que les véhicules roulent à vitesse constante.<br>' +
        '• Le bus de ' + voy + ' quitte Dakar à ' + hm(dep) + ' et roule à ' + M(v1) + ' km/h.<br>' +
        '• Son oncle ' + oncle + ' quitte Saint-Louis en taxi, vers Dakar, ' + (Dl === 0 ? 'à la même heure' : 'à ' + hm(dep + 60 * Dl) + ' (soit ' + duree(Dl) + ' plus tard)') + ', et roule à ' + M(v2) + ' km/h.<br>' +
        'On note $t$ le temps (en heures) écoulé depuis le départ du bus, $d_1(t)$ la distance (en km) entre le bus et Dakar et $d_2(t)$ la distance entre le taxi et Dakar' +
        (Dl === 0 ? '.' : ' (pour $t \\geqslant ' + N(Dl) + '$).');

      var qs = [], sol = [];
      qs.push({ label: '1) Durée du trajet du bus (en minutes) :', type: 'number', reponse: dur, unite: 'min' });
      sol.push(Q(1) + 'Durée $=$ distance $\\div$ vitesse $= \\dfrac{' + D + '}{' + v1 + '}' + eq(D / v1, 4) + '$ h, soit $' + N(D / v1, 4) + ' \\times 60 = ' + N(dur) + '$ min (' + duree(D / v1) + ').');
      qs.push({ label: "2) Heure d'arrivée du bus à Saint-Louis (heures ; minutes) :", type: 'tuple', reponse: [ah, am], reponseTex: '\\left(' + ah + ' \\,;\\, ' + am + '\\right)' });
      sol.push(Q(2) + 'Départ à ' + hm(dep) + ', trajet de ' + duree(D / v1) + ' : le bus arrive à ' + hm(arr) + '.');
      qs.push({ label: '3) $d_1(t) =$', type: 'expr', variable: 't', reponse: v1 + '*t', reponseTex: v1 + 't', domaine: [0, 4] });
      sol.push(Q(3) + 'La distance parcourue est proportionnelle au temps : $d_1(t) = ' + v1 + 't$. $d_1$ est une application linéaire de coefficient $' + v1 + '$ (la vitesse).');
      qs.push({ label: '4) $d_2(t) =$', type: 'expr', variable: 't', reponse: K + '-' + v2 + '*t', reponseTex: N(K) + ' - ' + v2 + 't', domaine: [0, 4] });
      sol.push(Q(4) + (Dl === 0 ? 'Le taxi part de Saint-Louis, à $' + D + '$ km de Dakar, et s\'en rapproche de $' + v2 + '$ km chaque heure : $d_2(t) = ' + D + ' - ' + v2 + 't$.'
        : 'Le taxi roule depuis $t - ' + N(Dl) + '$ heures ; il a parcouru $' + v2 + '(t - ' + N(Dl) + ')$ km depuis Saint-Louis : $d_2(t) = ' + D + ' - ' + v2 + '(t - ' + N(Dl) + ') = ' + N(K) + ' - ' + v2 + 't$.'));
      qs.push({ label: '5) Instant du croisement : $t =$', type: 'number', reponse: ts, unite: 'h' });
      sol.push(Q(5) + 'Ils se croisent quand $d_1(t) = d_2(t)$ : $' + v1 + 't = ' + N(K) + ' - ' + v2 + 't \\iff ' + (v1 + v2) + 't = ' + N(K) + ' \\iff t = \\dfrac{' + N(K) + '}{' + (v1 + v2) + '} = ' + N(ts) + '$ h, ' +
        'soit ' + duree(ts) + ' après le départ du bus, à ' + hm(dep + 60 * ts) + '.');
      qs.push({ label: '6) Distance entre Dakar et le lieu du croisement :', type: 'number', reponse: dist, unite: 'km' });
      sol.push(Q(6) + '$d_1(' + N(ts) + ') = ' + v1 + ' \\times ' + N(ts) + ' = ' + N(dist) + '$ km. Vérification : $d_2(' + N(ts) + ') = ' + N(K) + ' - ' + v2 + ' \\times ' + N(ts) + ' = ' + N(K - v2 * ts) + '$ km.');
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Durée $=$ distance $\\div$ vitesse ; pour passer des heures aux minutes, multiplie par $60$.',
          'Le taxi part de Saint-Louis : sa distance à Dakar diminue de ' + v2 + ' km par heure de route.',
          'Au croisement, les deux véhicules sont au même endroit : résous l\'équation $d_1(t) = d_2(t)$.'
        ],
        solution: sol,
        aide: "Pour l'heure, écris (heures ; minutes), par exemple (11 ; 15). Pour les expressions, utilise la lettre t. Écris 2,25 pour 2 h 15 min."
      };
    }
  });

  /* ------------------------- L'antenne de la radio communautaire ------------------------- */
  var TRIPLES = [[12, 5, 13], [15, 8, 17], [16, 12, 20], [20, 15, 25], [24, 7, 25], [24, 10, 26], [21, 20, 29],
    [12, 9, 15], [9, 12, 15], [20, 21, 29], [8, 15, 17], [24, 18, 30]];
  mission({
    id: 'mission-antenne-radio',
    titre: "Haubaner l'antenne de la radio",
    cycle: 'moyen',
    classe: '4e',
    resume: 'Pour tenir le mât de la radio communautaire, calcule la longueur des haubans, leur coût et leur inclinaison.',
    chapitres: ['4e-pythagore', '4e-cosinus', '4e-applications-lineaires'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var lieu = rng.pick(['Kédougou', 'Matam', 'Podor', 'Bakel', 'Sédhiou', 'Linguère', 'Vélingara']);
      var tech = rng.pick(GARCONS);
      var a, d, L, alpha, guard = 0;
      if (niveau === 1) {
        var tr = rng.pick(TRIPLES); a = tr[0]; d = tr[1]; L = tr[2];
      } else {
        do {
          a = rng.int(10, 25); d = rng.int(6, 16); L = Math.sqrt(a * a + d * d); alpha = deg(Math.acos(d / L));
        } while ((ar.isInt(L) || Math.abs(alpha - 40) < 0.5 || Math.abs(alpha - 70) < 0.5) && ++guard < 200);
      }
      alpha = deg(Math.acos(d / L));
      var pc = rng.pick([350, 400, 500, 600]);
      var tot = 3 * (L + 1), totA = niveau === 1 ? tot : Math.ceil(tot - 1e-9);
      var cout = totA * pc;
      var etat = alpha < 40 ? 1 : alpha > 70 ? 2 : 0;
      trace('mission-antenne-radio', niveau, { a: a, d: d, pc: pc });

      var f = EM.fig.fit([[0, 0], [d, 0], [0, a], [-0.25 * d, 0], [1.15 * d, 0]], { w: 260, h: 230, pad: 30, title: 'Mât et hauban' });
      f.seg([-0.25 * d, 0], [1.15 * d, 0], { light: true });
      f.seg([0, 0], [0, a]);
      f.seg([0, a], [d, 0], { accent: true });
      f.rightAngle([0, a], [0, 0], [d, 0]);
      f.angle([0, 0], [d, 0], [0, a], 'α', { r: 26 });
      f.point([0, a], 'S', 'no').point([0, 0], 'P', 'so').point([d, 0], 'A', 'se');
      f.segLabel([0, 0], [0, a], a + ' m', { inside: [d, 0] });
      f.segLabel([0, 0], [d, 0], d + ' m');

      var enonce = 'La radio communautaire de ' + lieu + ' installe un mât vertical $[SP]$ pour son antenne. Pour qu\'il résiste au vent, le technicien ' + tech + ' le maintient par ' + M(3) + ' haubans (câbles tendus) identiques, ' +
        'fixés au sommet $S$, à ' + M(a) + ' m du sol, et ancrés au sol en des points situés à ' + M(d) + ' m du pied $P$ du mât (le sol est horizontal).<br>' +
        '• Pour chaque hauban, il faut prévoir ' + M(1) + ' m de câble en plus pour les fixations.<br>' +
        '• Le câble est vendu ' + cfa(pc) + ' le mètre' + (niveau === 2 ? ', uniquement par mètres entiers.' : '.') + '<br>' +
        '• Règle de sécurité de la mission : l\'angle $\\alpha$ entre un hauban et le sol doit être compris entre $40^\\circ$ et $70^\\circ$.';

      var qs = [], sol = [];
      var sum = a * a + d * d;
      qs.push({ label: '1) Longueur $SA$ d\'un hauban :', type: 'number', reponse: L, tol: niveau === 1 ? null : 0.01, reponseTex: ap(L, 2), unite: 'm' });
      sol.push(Q(1) + 'Le triangle $SPA$ est rectangle en $P$. D\'après le théorème de Pythagore : $SA^2 = SP^2 + PA^2 = ' + a + '^2 + ' + d + '^2 = ' + a * a + ' + ' + d * d + ' = ' + sum + '$, donc $SA = \\sqrt{' + sum + '}' + eq(L, 2) + '$ m.');
      if (niveau === 1) {
        qs.push({ label: '2) Longueur totale de câble pour les trois haubans :', type: 'number', reponse: tot, unite: 'm' });
        sol.push(Q(2) + '$3 \\times (' + L + ' + 1) = 3 \\times ' + (L + 1) + ' = ' + tot + '$ m.');
      } else {
        qs.push({ label: '2) Longueur de câble à acheter (en mètres entiers) :', type: 'number', reponse: totA, unite: 'm' });
        sol.push(Q(2) + 'Il faut $3 \\times (SA + 1) \\approx 3 \\times ' + N(rd(L + 1, 2)) + ' \\approx ' + N(rd(tot, 2)) + '$ m. Le câble est vendu par mètres entiers : il faut en acheter $' + totA + '$ m.');
      }
      qs.push({ label: '3) Coût du câble :', type: 'number', reponse: cout, unite: 'F CFA' });
      sol.push(Q(3) + 'Le coût est proportionnel à la longueur (application linéaire de coefficient $' + pc + '$) : $' + totA + ' \\times ' + pc + ' = ' + N(cout) + '$ F CFA.');
      if (niveau === 1) {
        qs.push({ label: '4) $\\cos \\alpha =$', type: 'number', reponse: F(d, L) });
        sol.push(Q(4) + 'Dans le triangle $SPA$ rectangle en $P$ : $\\cos \\alpha = \\dfrac{\\text{côté adjacent}}{\\text{hypoténuse}} = \\dfrac{PA}{SA} = \\dfrac{' + d + '}{' + L + '}' + (F(d, L).d !== L ? ' = ' + F(d, L).tex() : '') + '$.');
      } else {
        qs.push({ label: '4) $\\cos \\alpha \\approx$ (au millième)', type: 'number', reponse: d / L, tol: 0.001, reponseTex: ap(d / L, 3) });
        sol.push(Q(4) + 'Dans le triangle $SPA$ rectangle en $P$ : $\\cos \\alpha = \\dfrac{PA}{SA} = \\dfrac{' + d + '}{\\sqrt{' + sum + '}} \\approx ' + N(rd(d / L, 3)) + '$.');
      }
      qs.push({ label: '5) Mesure de l\'angle $\\alpha$ (au dixième de degré) :', type: 'number', reponse: alpha, tol: 0.15, reponseTex: '\\approx ' + N(rd(alpha, 1)), unite: '°' });
      sol.push(Q(5) + 'Avec la calculatrice (touche $\\cos^{-1}$) : $\\alpha \\approx ' + N(rd(alpha, 1)) + '^\\circ$.');
      var choix = ['Oui : $\\alpha$ est compris entre $40^\\circ$ et $70^\\circ$', 'Non : $\\alpha$ est trop petit (moins de $40^\\circ$)', 'Non : $\\alpha$ est trop grand (plus de $70^\\circ$)'];
      qs.push({ label: '6) Les haubans respectent-ils la règle de sécurité ?', type: 'choice', choix: choix, reponse: etat });
      sol.push(Q(6) + '$\\alpha \\approx ' + N(rd(alpha, 1)) + '^\\circ$ : ' + ['l\'angle est bien compris entre $40^\\circ$ et $70^\\circ$, la règle est respectée.',
        'l\'angle est inférieur à $40^\\circ$ : les haubans sont trop couchés, il faudrait rapprocher les ancrages du mât.',
        'l\'angle dépasse $70^\\circ$ : les haubans sont presque verticaux et tiennent mal le mât, il faudrait éloigner les ancrages.'][etat]);
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Le mât est vertical et le sol horizontal : le triangle $SPA$ est rectangle en $P$. Pense au théorème de Pythagore.',
          'N\'oublie pas le mètre de câble supplémentaire par hauban, et qu\'il y a trois haubans.',
          'Dans un triangle rectangle : $\\cos \\alpha = \\dfrac{\\text{côté adjacent à } \\alpha}{\\text{hypoténuse}}$.'
        ],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* MOYEN — 3e                                                          */
  /* ================================================================== */

  /* ------------------------- La facture d'eau ------------------------- */
  mission({
    id: 'mission-facture-eau',
    titre: "Comprendre la facture d'eau",
    cycle: 'moyen',
    classe: '3e',
    resume: "Une facture d'eau à trois tranches : modélise-la par une fonction affine par morceaux et retrouve la consommation d'une famille.",
    chapitres: ['3e-applications-affines', '3e-equations'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var fam = rng.pick(NOMS), ville = rng.pick(['Dakar', 'Thiès', 'Mbour', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Touba']);
      var a = rng.pick([150, 200, 250]), b = rng.pick([500, 600, 650, 700]), c = rng.pick([800, 900, 1000]), F0 = rng.pick([1000, 1500, 2000]);
      var f20 = F0 + 20 * a, f40 = f20 + 20 * b;
      var fx = function (x) { return x <= 20 ? F0 + a * x : x <= 40 ? f20 + b * (x - 20) : f40 + c * (x - 40); };
      var x1 = rng.int(8, 18), x2 = rng.int(22, 38);
      var x3 = niveau === 1 ? rng.intExcept(21, 39, [x2]) : rng.int(42, 60);
      var xB = rng.intExcept(24, 36, [x2, x3]);
      var m3 = fx(x3), Bud = fx(xB);
      var k2 = F0 + 20 * a - 20 * b, k3 = f40 - 40 * c;
      trace('mission-facture-eau', niveau, { a: a, b: b, c: c, F0: F0, x1: x1, x2: x2, m3: m3, Bud: Bud });

      var y1 = Math.ceil(fx(50) / 5000) * 5;
      var g = cadre({ x0: 0, x1: 50, dx: 10, y0: 0, y1: y1, dy: 5, xlab: 'x (m³)', ylab: 'f(x) en milliers de F CFA', title: 'Montant de la facture en fonction de la consommation', h: 220 });
      g.polyline([[0, F0 / 1000], [20, f20 / 1000], [40, f40 / 1000], [50, fx(50) / 1000]], { accent: true });

      var enonce = 'La famille ' + fam + ', à ' + ville + ', reçoit chaque bimestre une facture d\'eau. Le tarif de cette mission (fictif) est progressif : ' +
        'les ' + M(20) + ' premiers m³ sont facturés au tarif social, les ' + M(20) + ' m³ suivants au tarif plein, et les m³ au-delà de ' + M(40) + ' au tarif dissuasif. ' +
        'S\'y ajoute une redevance fixe (location du compteur).' +
        table([
          ['Tranche', 'Consommation', 'Prix du m³'],
          ['Sociale', 'de $0$ à $20$ m³', cfa(a)],
          ['Pleine', 'de $20$ à $40$ m³', cfa(b)],
          ['Dissuasive', 'au-delà de $40$ m³', cfa(c)],
          ['Redevance fixe', '—', cfa(F0) + ' par facture']
        ], { head: true }) +
        'On note $f(x)$ le montant de la facture (en F CFA) pour une consommation de $x$ m³. Le graphique représente $f$ ; la courbe est formée de segments.';

      var qs = [], sol = [], n = 1;
      qs.push({ label: n + ') $f(' + x1 + ') =$', type: 'number', reponse: fx(x1), unite: 'F CFA' });
      sol.push(Q(n++) + '$' + x1 + '$ m³ sont dans la tranche sociale : $f(' + x1 + ') = ' + N(F0) + ' + ' + a + ' \\times ' + x1 + ' = ' + N(fx(x1)) + '$ F CFA.');
      qs.push({ label: n + ') $f(' + x2 + ') =$', type: 'number', reponse: fx(x2), unite: 'F CFA' });
      sol.push(Q(n++) + 'Les $20$ premiers m³ coûtent $20 \\times ' + a + ' = ' + N(20 * a) + '$ F, les $' + (x2 - 20) + '$ suivants $' + (x2 - 20) + ' \\times ' + b + ' = ' + N(b * (x2 - 20)) + '$ F : ' +
        '$f(' + x2 + ') = ' + N(F0) + ' + ' + N(20 * a) + ' + ' + N(b * (x2 - 20)) + ' = ' + N(fx(x2)) + '$ F CFA.');
      qs.push({ label: n + ') Pour $20 \\leqslant x \\leqslant 40$ : $f(x) =$', type: 'expr', reponse: b + '*x+(' + k2 + ')', reponseTex: T.poly([b, k2]), domaine: [20, 40] });
      sol.push(Q(n++) + 'Pour $20 \\leqslant x \\leqslant 40$ : $f(x) = ' + N(F0) + ' + 20 \\times ' + a + ' + ' + b + '(x - 20) = ' + N(f20) + ' + ' + b + 'x - ' + N(20 * b) + ' = ' + T.poly([b, k2]) + '$. ' +
        'Sur cette tranche, $f$ est une application affine de coefficient $' + b + '$ (le prix du m³). Contrôle : $f(20) = ' + N(f20) + '$ et $f(40) = ' + N(f40) + '$.');
      if (niveau === 2) {
        qs.push({ label: n + ') Pour $x \\geqslant 40$ : $f(x) =$', type: 'expr', reponse: c + '*x+(' + k3 + ')', reponseTex: T.poly([c, k3]), domaine: [40, 80] });
        sol.push(Q(n++) + 'Pour $x \\geqslant 40$ : $f(x) = f(40) + ' + c + '(x - 40) = ' + N(f40) + ' + ' + c + 'x - ' + N(40 * c) + ' = ' + T.poly([c, k3]) + '$.');
      }
      qs.push({ label: n + ') La famille a payé ' + cfa(m3) + '. Sa consommation :', type: 'number', reponse: x3, unite: 'm³' });
      if (niveau === 1) {
        sol.push(Q(n++) + 'Comme $f(20) = ' + N(f20) + ' < ' + N(m3) + ' \\leqslant f(40) = ' + N(f40) + '$, la consommation est dans la tranche pleine. ' +
          'On résout $' + T.poly([b, k2]) + ' = ' + N(m3) + ' \\iff ' + b + 'x = ' + N(m3 - k2) + ' \\iff x = ' + x3 + '$. La famille a consommé $' + x3 + '$ m³.');
      } else {
        sol.push(Q(n++) + 'Comme $' + N(m3) + ' > f(40) = ' + N(f40) + '$, la consommation dépasse $40$ m³. ' +
          'On résout $' + T.poly([c, k3]) + ' = ' + N(m3) + ' \\iff ' + c + 'x = ' + N(m3 - k3) + ' \\iff x = ' + x3 + '$. La famille a consommé $' + x3 + '$ m³.');
      }
      qs.push({ label: n + ') La famille veut payer au plus ' + cfa(Bud) + '. Consommations possibles (en m³) :', type: 'interval', reponse: { a: 0, b: xB, ouvA: false, ouvB: false } });
      sol.push(Q(n++) + '$f$ est croissante. Comme $f(20) = ' + N(f20) + ' < ' + N(Bud) + ' < f(40) = ' + N(f40) + '$, on résout dans la tranche pleine : ' +
        '$' + T.poly([b, k2]) + ' \\leqslant ' + N(Bud) + ' \\iff ' + b + 'x \\leqslant ' + N(Bud - k2) + ' \\iff x \\leqslant ' + xB + '$. ' +
        'La consommation doit être dans l\'intervalle $' + T.interval(0, xB) + '$ (en m³).');
      return {
        enonce: enonce,
        figure: g.svg(),
        questions: qs,
        indices: [
          'Découpe la consommation en tranches : les $20$ premiers m³, puis les suivants… sans oublier la redevance fixe.',
          'Sur une tranche, $f(x) = f(\\text{début de la tranche}) + (\\text{prix du m³}) \\times (x - \\text{début de la tranche})$.',
          'Pour retrouver une consommation, repère d\'abord dans quelle tranche se trouve le montant en le comparant à $f(20)$ et $f(40)$.'
        ],
        solution: sol,
        aide: 'Pour f(x), écris par exemple 650x - 7500. Un intervalle s\'écrit [0 ; 30].'
      };
    }
  });

  /* ------------------------- Comparer deux forfaits ------------------------- */
  mission({
    id: 'mission-forfaits-telephone',
    titre: 'Choisir son forfait de téléphone',
    cycle: 'moyen',
    classe: '3e',
    resume: 'Compare des forfaits mobiles avec des applications affines, une inéquation et un système pour démasquer une offre cachée.',
    chapitres: ['3e-applications-affines', '3e-equations', '3e-systemes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var nom = rng.pick(GARCONS.concat(FILLES)), cousin = rng.pick(GARCONS);
      var ville = rng.pick(['Kolda', 'Louga', 'Thiès', 'Ziguinchor', 'Kaolack', 'Saint-Louis', 'Matam']);
      var pA, pB, xs, fA, fB, guard = 0;
      do {
        pA = rng.pick([20, 25, 30]); pB = rng.pick([50, 60, 75, 80, 100]); xs = rng.pick([40, 50, 60, 80, 100, 120]);
        fB = niveau === 1 ? 0 : rng.pick([500, 1000]);
        fA = fB + (pB - pA) * xs;
      } while ((fA < 1500 || fA > 7000 || fA % 50 !== 0) && ++guard < 300);
      if (fA < 1500 || fA > 7000 || fA % 50 !== 0) { pA = 25; pB = 75; xs = 60; fA = fB + 3000; }
      var x1 = 5 * rng.intExcept(4, 30, [xs / 5]);
      var fC = rng.pick([1000, 1500, 2000, 2500]), pC = rng.pick([35, 40, 45, 50]);
      var mm = rng.sample([30, 40, 60, 90, 120], 2).sort(function (u, v) { return u - v; });
      var R1 = fC + pC * mm[0], R2 = fC + pC * mm[1];
      var cA = function (x) { return fA + pA * x; }, cB = function (x) { return fB + pB * x; }, cC = function (x) { return fC + pC * x; };
      var x2 = 0, best = 0;
      if (niveau === 2) {
        var cand = rng.shuffle([20, 30, 40, 50, 70, 90, 110, 130, 150, 180, 200]);
        for (var i = 0; i < cand.length; i++) {
          var cs = [cA(cand[i]), cB(cand[i]), cC(cand[i])], mn = Math.min.apply(null, cs);
          var nb = cs.filter(function (v) { return v - mn < 50; }).length;
          if (nb === 1) { x2 = cand[i]; best = cs.indexOf(mn); break; }
        }
        if (!x2) { x2 = cand[0]; var cs0 = [cA(x2), cB(x2), cC(x2)]; best = cs0.indexOf(Math.min.apply(null, cs0)); }
      }
      trace('mission-forfaits-telephone', niveau, { fA: fA, pA: pA, fB: fB, pB: pB, x1: x1, m1: mm[0], m2: mm[1], R1: R1, R2: R2, x2: x2 });

      var enonce = nom + ', élève de 3e à ' + ville + ', veut choisir un forfait mobile. Un opérateur (fictif) propose deux formules mensuelles :' +
        table([
          ['Formule', 'Abonnement mensuel', 'Prix de la minute d\'appel'],
          ['A', cfa(fA), cfa(pA)],
          ['B', fB ? cfa(fB) : 'aucun', cfa(pB)]
        ], { head: true }) +
        'On note $x$ le nombre de minutes d\'appel dans le mois, $g_A(x)$ et $g_B(x)$ le prix payé (en F CFA) avec chaque formule.<br>' +
        'Il existe aussi une formule C dont la publicité ne donne pas les tarifs : son cousin ' + cousin + ' a payé ' + cfa(R1) + ' un mois où il a appelé ' + M(mm[0]) + ' minutes, et ' + cfa(R2) + ' un mois où il a appelé ' + M(mm[1]) + ' minutes.';

      var qs = [], sol = [], n = 1;
      var eA = T.poly([pA, fA]), eB = T.poly([pB, fB]);
      if (niveau === 1) {
        qs.push({ label: n + ') Prix payé avec la formule A pour ' + x1 + ' minutes :', type: 'number', reponse: cA(x1), unite: 'F CFA' });
        sol.push(Q(n++) + '$g_A(x) = ' + eA + '$ (application affine), donc $g_A(' + x1 + ') = ' + N(fA) + ' + ' + pA + ' \\times ' + x1 + ' = ' + N(cA(x1)) + '$ F CFA.');
        qs.push({ label: n + ') Prix payé avec la formule B pour ' + x1 + ' minutes :', type: 'number', reponse: cB(x1), unite: 'F CFA' });
        sol.push(Q(n++) + '$g_B(x) = ' + eB + '$ (application linéaire), donc $g_B(' + x1 + ') = ' + pB + ' \\times ' + x1 + ' = ' + N(cB(x1)) + '$ F CFA.');
      } else {
        qs.push({ label: n + ') $g_A(x) =$', type: 'expr', reponse: pA + '*x+' + fA, reponseTex: eA, domaine: [0, 200] });
        sol.push(Q(n++) + 'Abonnement $+$ prix des minutes : $g_A(x) = ' + eA + '$.');
        qs.push({ label: n + ') $g_B(x) =$', type: 'expr', reponse: pB + '*x+' + fB, reponseTex: eB, domaine: [0, 200] });
        sol.push(Q(n++) + 'De même, $g_B(x) = ' + eB + '$.');
      }
      qs.push({ label: n + ') Nombre de minutes pour lequel les formules A et B coûtent le même prix :', type: 'number', reponse: xs, unite: 'min' });
      sol.push(Q(n++) + '$g_A(x) = g_B(x) \\iff ' + eA + ' = ' + eB + ' \\iff ' + (pB - pA) + 'x = ' + N(fA - fB) + ' \\iff x = ' + xs + '$. Pour $' + xs + '$ minutes, les deux formules coûtent ' + cfa(cA(xs)) + '.');
      qs.push({ label: n + ') Valeurs de $x$ pour lesquelles la formule A est strictement moins chère que la B :', type: 'interval', reponse: { a: xs, b: Infinity, ouvA: true, ouvB: true } });
      sol.push(Q(n++) + '$g_A(x) < g_B(x) \\iff ' + eA + ' < ' + eB + ' \\iff ' + N(fA - fB) + ' < ' + (pB - pA) + 'x \\iff x > ' + xs + '$. ' +
        'La formule A est la moins chère pour $x \\in ' + T.interval(xs, Infinity, true, true) + '$ : au-delà de $' + xs + '$ minutes, l\'abonnement est rentabilisé.');
      qs.push({ label: n + ') Formule C : (abonnement ; prix de la minute) =', type: 'tuple', reponse: [fC, pC] });
      sol.push(Q(n++) + 'On note $a$ l\'abonnement et $p$ le prix de la minute de la formule C : $\\begin{cases} a + ' + mm[0] + 'p = ' + N(R1) + ' \\\\ a + ' + mm[1] + 'p = ' + N(R2) + ' \\end{cases}$. ' +
        'Par soustraction : $' + (mm[1] - mm[0]) + 'p = ' + N(R2 - R1) + '$, donc $p = ' + pC + '$. Puis $a = ' + N(R1) + ' - ' + mm[0] + ' \\times ' + pC + ' = ' + N(fC) + '$. ' +
        'La formule C coûte ' + cfa(fC) + ' d\'abonnement et ' + cfa(pC) + ' la minute.');
      if (niveau === 2) {
        var choix = ['Formule A', 'Formule B', 'Formule C'];
        qs.push({ label: n + ') Pour ' + x2 + ' minutes par mois, la formule la moins chère est :', type: 'choice', choix: choix, reponse: best });
        sol.push(Q(n++) + 'Pour $x = ' + x2 + '$ : $g_A(' + x2 + ') = ' + N(cA(x2)) + '$ F, $g_B(' + x2 + ') = ' + N(cB(x2)) + '$ F et formule C : $' + N(fC) + ' + ' + pC + ' \\times ' + x2 + ' = ' + N(cC(x2)) + '$ F. ' +
          'La moins chère est la ' + choix[best].toLowerCase() + '.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Prix payé $=$ abonnement $+$ (prix d\'une minute) $\\times$ (nombre de minutes).',
          'Les formules coûtent le même prix quand $g_A(x) = g_B(x)$ ; pour comparer, résous l\'inéquation $g_A(x) < g_B(x)$.',
          'Pour la formule C, écris un système de deux équations dont les inconnues sont l\'abonnement et le prix de la minute.'
        ],
        solution: sol,
        aide: 'Un intervalle s\'écrit ]50 ; +∞[ (ou x > 50). Un couple s\'écrit (1500 ; 40).'
      };
    }
  });

  /* ------------------------- La hauteur du baobab ------------------------- */
  mission({
    id: 'mission-hauteur-baobab',
    titre: 'Mesurer le baobab de la cour',
    cycle: 'moyen',
    classe: '3e',
    resume: "Sans grimper : mesure le grand baobab de l'école grâce à son ombre, au théorème de Thalès et à la trigonométrie.",
    chapitres: ['3e-thales', '3e-trigonometrie', '4e-pythagore'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var lieu = rng.pick(['Thiès', 'Kaolack', 'Fatick', 'Kaffrine', 'Mbour', 'Bambey', 'Joal-Fadiouth', 'Tambacounda']);
      var eleve = rng.pick(GARCONS), amie = rng.pick(FILLES);
      var RS = [F(3, 4), F(4, 5), F(5, 4), F(4, 3), F(3, 2), F(6, 5), F(5, 3), F(8, 5)];
      var combos = [];
      RS.forEach(function (r) {
        [1, 1.2, 1.5, 1.6, 2].forEach(function (b) {
          var sb = rd(b / r.value(), 9);
          if (!ar.isInt(rd(sb * 100, 6))) return;
          for (var s2 = 16; s2 <= 36; s2++) {
            var S = s2 / 2, H = rd(S * r.value(), 9);
            if (H >= 10 && H <= 25 && ar.isInt(rd(H * 100, 6))) combos.push([r, b, sb, S, H]);
          }
        });
      });
      var cb = rng.pick(combos), r = cb[0], b = cb[1], sb = cb[2], S = cb[3], H = cb[4];
      var alpha = deg(Math.atan(r.value()));
      var beta = rng.pick([30, 35, 40, 45, 60, 65, 70].filter(function (x) { return Math.abs(x - alpha) > 4; }));
      var S2 = H / Math.tan(rad(beta));
      var ray = Math.sqrt(H * H + S * S);
      var c = rng.pick([1.2, 1.4, 1.5, 1.6]), dF = S - c / r.value();
      trace('mission-hauteur-baobab', niveau, { b: b, sb: sb, S: S, beta: beta, c: c });

      var x0 = S + Math.max(2, S * 0.2);
      var f = EM.fig.fit([[0, 0], [0, H], [x0 + sb, 0], [-1, 0]], { w: 300, h: 210, pad: 26, title: 'Le baobab, le bâton et leurs ombres' });
      f.seg([-1, 0], [x0 + sb + 0.8, 0], { light: true });
      f.seg([0, 0], [0, H], { accent: true });
      f.seg([0, H], [S, 0], { dash: true });
      f.seg([x0, 0], [x0, b]);
      f.seg([x0, b], [x0 + sb, 0], { dash: true });
      f.rightAngle([0, H], [0, 0], [S, 0]);
      f.point([0, H], 'T', 'ne').point([0, 0], 'P', 'so').point([S, 0], 'O', 's');
      f.segLabel([0, 0], [S, 0], tx(S) + ' m');
      f.text([0.6, H * 0.55], 'baobab', { small: true, anchor: 'start' });
      f.text([x0, b + H * 0.08], 'bâton', { small: true });

      var enonce = 'Dans la cour d\'un collège de ' + lieu + ', un grand baobab est trop haut pour être mesuré directement. Un jour ensoleillé, ' + eleve + ' mesure au même instant :<br>' +
        '• l\'ombre $[PO]$ du baobab sur le sol horizontal : ' + M(S) + ' m ($P$ est le pied du baobab, $T$ son sommet) ;<br>' +
        '• l\'ombre d\'un bâton de ' + M(b) + ' m planté verticalement : ' + M(sb) + ' m.<br>' +
        'Les rayons du soleil sont parallèles ; on note $\\alpha$ l\'angle $\\widehat{TOP}$ que font les rayons avec le sol.<br>' +
        'Plus tard dans la journée, le soleil est plus ' + (beta > alpha ? 'haut' : 'bas') + ' : ses rayons font un angle de $' + beta + '^\\circ$ avec le sol.' +
        (niveau === 2 ? '<br>' + amie + ', qui mesure ' + M(c) + ' m, veut se placer entre $P$ et $O$, debout, de sorte que l\'extrémité de son ombre soit exactement en $O$ (au premier instant).' : '');

      var qs = [], sol = [];
      qs.push({ label: '1) Hauteur $PT$ du baobab :', type: 'number', reponse: H, unite: 'm' });
      sol.push(Q(1) + 'Si l\'on déplace le bâton pour que l\'extrémité de son ombre soit en $O$, le bâton et le baobab sont parallèles (verticaux) et le rayon passe par les deux sommets : c\'est une configuration de Thalès. Les longueurs sont proportionnelles : ' +
        '$\\dfrac{PT}{' + N(b) + '} = \\dfrac{PO}{' + N(sb) + '}$, donc $PT = \\dfrac{' + N(b) + ' \\times ' + N(S) + '}{' + N(sb) + '} = ' + N(H) + '$ m.');
      qs.push({ label: '2) Mesure de l\'angle $\\alpha$ (au dixième de degré) :', type: 'number', reponse: alpha, tol: 0.1, reponseTex: ap(alpha, 1), unite: '°' });
      sol.push(Q(2) + 'Dans le triangle $TPO$ rectangle en $P$ : $\\tan \\alpha = \\dfrac{PT}{PO} = \\dfrac{' + N(H) + '}{' + N(S) + '} = ' + r.tex() + '$ (même rapport que $\\dfrac{' + N(b) + '}{' + N(sb) + '}$ pour le bâton). Donc $\\alpha' + eq(alpha, 1) + '^\\circ$.');
      qs.push({ label: '3) Longueur $TO$ du rayon de soleil (au centimètre) :', type: 'number', reponse: ray, tol: 0.01, reponseTex: ap(ray, 2), unite: 'm' });
      sol.push(Q(3) + 'Théorème de Pythagore dans $TPO$ rectangle en $P$ : $TO^2 = ' + N(H) + '^2 + ' + N(S) + '^2 = ' + N(rd(H * H + S * S, 6)) + '$, donc $TO' + eq(ray, 2) + '$ m.');
      qs.push({ label: '4) Longueur de l\'ombre du baobab quand les rayons font $' + beta + '^\\circ$ avec le sol (au centimètre) :', type: 'number', reponse: S2, tol: 0.01, reponseTex: ap(S2, 2), unite: 'm' });
      sol.push(Q(4) + 'Avec la nouvelle ombre $PO\'$ : $\\tan ' + beta + '^\\circ = \\dfrac{PT}{PO\'}$, donc $PO\' = \\dfrac{' + N(H) + '}{\\tan ' + beta + '^\\circ}' + eq(S2, 2) + '$ m.');
      if (niveau === 2) {
        qs.push({ label: '5) Distance entre le pied du baobab et ' + amie + ' (au centimètre) :', type: 'number', reponse: dF, tol: 0.01, reponseTex: ap(dF, 2), unite: 'm' });
        sol.push(Q(5) + 'L\'ombre de ' + amie + ' vérifie, comme pour le bâton : $\\dfrac{\\text{ombre}}{' + N(c) + '} = \\dfrac{' + N(sb) + '}{' + N(b) + '}$, donc elle mesure $' + N(c) + ' \\times \\dfrac{' + N(sb) + '}{' + N(b) + '}' + eq(c / r.value(), 2) + '$ m. ' +
          'Elle doit se placer à $' + N(S) + ' - ' + N(rd(c / r.value(), 4)) + eq(dF, 2) + '$ m du pied du baobab.');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Au même instant, la hauteur d\'un objet vertical et la longueur de son ombre sont proportionnelles (théorème de Thalès).',
          'Le triangle $TPO$ est rectangle en $P$ : utilise la tangente pour l\'angle, Pythagore pour $TO$.',
          'Si $\\tan \\beta = \\dfrac{PT}{PO\'}$, alors $PO\' = \\dfrac{PT}{\\tan \\beta}$.'
        ],
        solution: sol
      };
    }
  });

  /* ------------------------- La rampe d'accès de l'école ------------------------- */
  mission({
    id: 'mission-rampe-ecole',
    titre: "Une rampe d'accès pour l'école",
    cycle: 'moyen',
    classe: '3e',
    resume: "Rends l'école accessible aux fauteuils roulants : pente, angle, longueur et dimensions d'une rampe conforme.",
    chapitres: ['3e-trigonometrie', '4e-pythagore', '5e-proportionnalite'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var lieu = rng.pick(['Ziguinchor', 'Kolda', 'Sédhiou', 'Tambacounda', 'Louga', 'Matam', 'Diourbel']);
      var dir = 'M. ' + rng.pick(NOMS);
      var h = rng.pick([0.36, 0.4, 0.42, 0.45, 0.48, 0.5, 0.54, 0.6]), d = rng.pick([4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]);
      var pmax = rng.pick([6, 8]);
      var pente = 100 * h / d, alpha = deg(Math.atan(h / d)), L = Math.sqrt(h * h + d * d);
      var conf = rd(pente, 9) <= pmax;
      var dmin = rd(100 * h / pmax, 9), w = rng.pick([1.2, 1.5, 1.8]);
      var Lmin = Math.sqrt(h * h + dmin * dmin), aire = w * Lmin;
      trace('mission-rampe-ecole', niveau, { h: h, d: d, pmax: pmax, w: w });

      var kv = 3; // exagération verticale du dessin
      var f = EM.fig.fit([[0, 0], [d, 0], [d, kv * h], [d + 0.8, kv * h]], { w: 300, h: 130, pad: 26, title: 'Rampe (échelle verticale exagérée)' });
      f.poly([[0, 0], [d, 0], [d, kv * h]], { fill: true });
      f.seg([d, kv * h], [d + 0.8, kv * h]);
      f.rightAngle([0, 0], [d, 0], [d, kv * h]);
      f.angle([d, 0], [0, 0], [d, kv * h], 'α', { r: 40 });
      f.segLabel([0, 0], [d, 0], tx(d) + ' m');
      f.segLabel([d, 0], [d, kv * h], tx(h) + ' m', { inside: [0, 0] });

      var enonce = 'L\'école élémentaire de ' + lieu + ' accueille des élèves en fauteuil roulant. Le seuil de la porte d\'entrée est à ' + M(h * 100) + ' cm au-dessus de la cour. ' +
        'Le directeur, ' + dir + ', fait construire une rampe en béton dont la longueur au sol (horizontale) est de ' + M(d) + ' m.<br>' +
        '• La pente d\'une rampe est le rapport $\\dfrac{\\text{hauteur}}{\\text{longueur au sol}}$, exprimé en pourcentage.<br>' +
        '• Règle de la mission : la pente ne doit pas dépasser ' + M(pmax) + ' %.<br>' +
        'On note $\\alpha$ l\'angle entre la rampe et le sol (figure ci-dessous, hauteur exagérée).' +
        (niveau === 2 ? '<br>• La rampe définitive aura une largeur de ' + M(w) + ' m et une longueur au sol égale à la longueur minimale autorisée.' : '');

      var qs = [], sol = [];
      qs.push({ label: '1) Pente de la rampe prévue (en %, au centième) :', type: 'number', reponse: pente, tol: 0.01, reponseTex: ap(pente, 2), unite: '%' });
      sol.push(Q(1) + 'Pente $= \\dfrac{' + N(h) + '}{' + N(d) + '} \\times 100' + eq(pente, 2) + '$ %.');
      qs.push({ label: '2) Mesure de l\'angle $\\alpha$ (au dixième de degré) :', type: 'number', reponse: alpha, tol: 0.1, reponseTex: ap(alpha, 1), unite: '°' });
      sol.push(Q(2) + 'Dans le triangle rectangle : $\\tan \\alpha = \\dfrac{\\text{côté opposé}}{\\text{côté adjacent}} = \\dfrac{' + N(h) + '}{' + N(d) + '}$, donc $\\alpha' + eq(alpha, 1) + '^\\circ$.');
      qs.push({ label: '3) Longueur de la surface inclinée de la rampe (au centimètre) :', type: 'number', reponse: L, tol: 0.01, reponseTex: ap(L, 2), unite: 'm' });
      sol.push(Q(3) + 'D\'après le théorème de Pythagore : $\\ell^2 = ' + N(d) + '^2 + ' + N(h) + '^2 = ' + N(rd(d * d + h * h, 6)) + '$, donc $\\ell' + eq(L, 2) + '$ m.');
      var choix = ['Oui : la pente ne dépasse pas $' + pmax + '$ %', 'Non : la pente dépasse $' + pmax + '$ %'];
      qs.push({ label: '4) La rampe prévue respecte-t-elle la règle ?', type: 'choice', choix: choix, reponse: conf ? 0 : 1 });
      sol.push(Q(4) + '$' + N(rd(pente, 2)) + '$ % ' + (conf ? '$\\leqslant' : '$>') + ' ' + pmax + '$ % : ' + (conf ? 'la rampe est conforme.' : 'la rampe est trop raide, il faut l\'allonger.'));
      qs.push({ label: '5) Longueur au sol minimale pour respecter la règle :', type: 'number', reponse: dmin, tol: 0.01, reponseTex: ap(dmin, 2), unite: 'm' });
      sol.push(Q(5) + 'Il faut $\\dfrac{' + N(h) + '}{x} \\times 100 \\leqslant ' + pmax + '$, c\'est-à-dire $x \\geqslant \\dfrac{' + N(h) + ' \\times 100}{' + pmax + '}' + eq(dmin, 2) + '$ m. ' +
        (conf ? 'La rampe prévue ($' + N(d) + '$ m) est assez longue.' : 'Il faut donc au moins $' + N(rd(dmin, 2)) + '$ m au sol au lieu de $' + N(d) + '$ m.'));
      if (niveau === 2) {
        qs.push({ label: '6) Aire de la surface inclinée de la rampe définitive (au centième) :', type: 'number', reponse: aire, tol: 0.02, reponseTex: ap(aire, 2), unite: 'm²' });
        sol.push(Q(6) + 'Longueur inclinée : $\\sqrt{' + N(rd(dmin, 4)) + '^2 + ' + N(h) + '^2}' + eq(Lmin, 3) + '$ m. La surface inclinée est un rectangle : $' + N(w) + ' \\times ' + N(rd(Lmin, 3)) + eq(aire, 2) + '$ m².');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Convertis d\'abord la hauteur en mètres. Pente en % $= \\dfrac{\\text{hauteur}}{\\text{longueur au sol}} \\times 100$.',
          'Dans le triangle rectangle, la hauteur est le côté opposé à $\\alpha$ et la longueur au sol le côté adjacent : utilise la tangente.',
          'La surface inclinée est l\'hypoténuse du triangle rectangle : théorème de Pythagore.'
        ],
        solution: sol
      };
    }
  });

  /* ================================================================== */
  /* SECONDAIRE — 2nde S et 2nde L                                       */
  /* ================================================================== */

  /* ------------------------- Le bénéfice de la boulangerie ------------------------- */
  mission({
    id: 'mission-boulangerie',
    titre: 'Le bénéfice de la boulangerie',
    cycle: 'secondaire',
    classe: '2nde-s',
    resume: 'Coût, recette et bénéfice d\'une boulangerie de quartier : trouve les seuils de rentabilité et la production la plus rentable.',
    chapitres: ['2s-second-degre', '2s-fonctions', '2s-polynomes'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var patron = rng.pick(GARCONS), ville = rng.pick(['Pikine', 'Kaolack', 'Touba', 'Thiès', 'Ziguinchor', 'Mbour', 'Saint-Louis']);
      var x1, x2;
      if (niveau === 1) {
        var pr = rng.pick([[2, 8], [2, 10], [2, 12], [4, 10], [4, 12], [3, 9], [3, 11], [4, 8], [3, 13]]);
        x1 = pr[0]; x2 = pr[1];
      } else {
        x1 = rng.int(1, 4); x2 = rng.int(9, 13);
        if ((x1 + x2) % 2 === 0) x2 += x2 < 13 ? 1 : -1;
      }
      var s = x1 + x2, c = x1 * x2, bc = rng.pick([1, 2, 3, 4]), p = s + bc;
      var x0 = rng.pick([5, 6, 7]), C0 = x0 * x0 + bc * x0 + c;
      var xm = s / 2, Bmax = (x2 - x1) * (x2 - x1) / 4, delta = s * s - 4 * c;
      trace('mission-boulangerie', niveau, { bc: bc, c: c, p: p, x0: x0 });

      var Cx = T.poly([1, bc, c]), Bx = T.poly([-1, s, -c]);
      var enonce = 'La boulangerie de ' + patron + ', à ' + ville + ', produit chaque jour $x$ centaines de baguettes, avec $0 \\leqslant x \\leqslant 15$. Toute la production est vendue.' +
        table([
          ['Coût de production (en milliers de F CFA)', '$C(x) = ' + Cx + '$'],
          ['Prix de vente d\'une centaine de baguettes', M(p) + ' milliers de F CFA'],
          ['Recette (en milliers de F CFA)', '$R(x) = ' + p + 'x$']
        ]) +
        'Le bénéfice (en milliers de F CFA) est $B(x) = R(x) - C(x)$. ' + patron + ' veut savoir pour quelles productions il gagne de l\'argent, et quelle production est la plus rentable.';

      var qs = [], sol = [], n = 1;
      qs.push({ label: n + ') Coût de production de ' + x0 + ' centaines de baguettes (en milliers de F CFA) :', type: 'number', reponse: C0 });
      sol.push(Q(n++) + '$C(' + x0 + ') = ' + x0 + '^2 + ' + bc + ' \\times ' + x0 + ' + ' + c + ' = ' + C0 + '$, soit ' + cfa(C0 * 1000) + ' pour ' + M(x0 * 100) + ' baguettes.');
      qs.push({ label: n + ') $B(x) =$', type: 'expr', reponse: '-x^2+' + s + '*x-' + c, reponseTex: Bx, domaine: [0, 15] });
      sol.push(Q(n++) + '$B(x) = ' + p + 'x - (' + Cx + ') = ' + Bx + '$.');
      qs.push({ label: n + ') Productions (en centaines) pour lesquelles le bénéfice est nul :', type: 'set', reponse: [x1, x2] });
      sol.push(Q(n++) + 'On résout $' + Bx + ' = 0$ : $\\Delta = ' + s + '^2 - 4 \\times (-1) \\times (-' + c + ') = ' + delta + ' = ' + (x2 - x1) + '^2$. ' +
        'Les solutions sont $x_1 = \\dfrac{-' + s + ' + ' + (x2 - x1) + '}{-2} = ' + x1 + '$ et $x_2 = \\dfrac{-' + s + ' - ' + (x2 - x1) + '}{-2} = ' + x2 + '$. ' +
        'Ainsi $B(x) = -(x - ' + x1 + ')(x - ' + x2 + ')$ : le bénéfice est nul pour $' + (x1 * 100) + '$ et $' + N(x2 * 100) + '$ baguettes (seuils de rentabilité).');
      if (niveau === 2) {
        qs.push({ label: n + ') Productions pour lesquelles le bénéfice est strictement positif :', type: 'interval', reponse: { a: x1, b: x2, ouvA: true, ouvB: true } });
        sol.push(Q(n++) + 'Un trinôme est du signe de $a = -1$ (négatif) à l\'extérieur des racines, et du signe contraire entre elles : $B(x) > 0 \\iff x \\in ' + T.interval(x1, x2, true, true) + '$ (cet intervalle est bien inclus dans $[0 \\,;\\, 15]$).');
      }
      qs.push({ label: n + ') Production (en centaines) qui rend le bénéfice maximal :', type: 'number', reponse: xm });
      sol.push(Q(n++) + 'Forme canonique : $B(x) = -(x - ' + N(xm) + ')^2 + ' + N(Bmax) + '$ (on peut vérifier en développant). ' +
        'Comme $-(x - ' + N(xm) + ')^2 \\leqslant 0$, $B$ est maximal pour $x = ' + N(xm) + '$ (sommet de la parabole, $-\\dfrac{b}{2a} = \\dfrac{' + s + '}{2}$), soit $' + N(xm * 100) + '$ baguettes par jour.');
      qs.push({ label: n + ') Bénéfice maximal (en milliers de F CFA) :', type: 'number', reponse: Bmax });
      sol.push(Q(n++) + '$B(' + N(xm) + ') = ' + N(Bmax) + '$, soit un bénéfice maximal de ' + cfa(Bmax * 1000) + ' par jour.');
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Développe $B(x) = R(x) - C(x)$ en faisant attention aux signes devant la parenthèse.',
          'Les seuils de rentabilité sont les racines du trinôme $B(x)$ : calcule son discriminant.',
          'Le maximum d\'un trinôme $ax^2 + bx + c$ avec $a < 0$ est atteint en $x = -\\dfrac{b}{2a}$.'
        ],
        solution: sol,
        aide: 'Pour B(x), écris par exemple -x^2 + 12x - 20. Les solutions s\'écrivent 2 ; 10. Un intervalle : ]2 ; 10[.'
      };
    }
  });

  /* ------------------------- La coopérative du jus de bissap ------------------------- */
  mission({
    id: 'mission-cooperative-bissap',
    titre: 'La coopérative du jus de bissap',
    cycle: 'secondaire',
    classe: '2nde-l',
    resume: 'Une coopérative de femmes produit du jus de bissap : évolution du prix du sucre, seuil de rentabilité et bilan des ventes.',
    chapitres: ['2l-pourcentages', '2l-fonctions', '2l-equations'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var pres = rng.pick(FILLES), ville = rng.pick(['Kaolack', 'Fatick', 'Kaffrine', 'Thiès', 'Mbour', 'Diourbel', 'Sédhiou']);
      var P = rng.pick([22500, 25000, 27500, 30000]), t1 = rng.pick([4, 6, 8, 10, 12]), t2 = rng.pick([5, 10, 15, 20]);
      var P1 = P * (100 + t1) / 100;
      var cm = rd((1 + t1 / 100) * (1 - t2 / 100), 9), ev = rd((cm - 1) * 100, 9);
      var u = rng.pick([250, 300, 350]), v = rng.pick([600, 700, 750, 800]), K = rng.pick([45000, 60000, 75000, 90000]);
      var mg = v - u, seuil = Math.ceil(K / mg - 1e-9);
      var v2 = rng.pick([300, 350, 400]), na = rng.int(12, 30) * 10, nb = rng.int(10, 30) * 10;
      var Nt = na + nb, Rt = v * na + v2 * nb;
      var mois = rng.pick(['mars', 'avril', 'mai', 'octobre', 'novembre']);
      trace('mission-cooperative-bissap', niveau, { P: P, t1: t1, t2: t2, u: u, v: v, K: K, v2: v2, Nt: Nt, Rt: Rt });

      var enonce = 'À ' + ville + ', la coopérative de femmes présidée par ' + pres + ' transforme les fleurs d\'hibiscus (bissap) en jus vendu en bouteilles. Toutes les données sont celles de la mission.<br>' +
        '• Le sucre est acheté par sacs de ' + M(50) + ' kg à ' + cfa(P) + ' le sac. ' +
        (niveau === 1 ? 'Cette année, le prix du sac augmente de ' + M(t1) + ' %.' : 'Le prix du sac augmente de ' + M(t1) + ' % en janvier, puis baisse de ' + M(t2) + ' % en juin.') + '<br>' +
        '• Une bouteille de ' + M(1) + ' L revient à ' + cfa(u) + ' (fleurs, sucre, bouteille) et elle est vendue ' + cfa(v) + '. Les charges fixes mensuelles (loyer de l\'atelier, électricité, transport) s\'élèvent à ' + cfa(K) + '. ' +
        'On note $B(x)$ le bénéfice mensuel (en F CFA) lorsque la coopérative vend $x$ bouteilles de ' + M(1) + ' L dans le mois (et rien d\'autre).<br>' +
        '• En ' + mois + ', la coopérative a vendu ' + M(Nt) + ' bouteilles : des bouteilles de ' + M(1) + ' L à ' + cfa(v) + ' et des bouteilles de ' + M(50) + ' cL à ' + cfa(v2) + ', pour une recette totale de ' + cfa(Rt) + '.';

      var qs = [], sol = [], n = 1;
      if (niveau === 1) {
        qs.push({ label: n + ') Nouveau prix du sac de sucre :', type: 'number', reponse: P1, unite: 'F CFA' });
        sol.push(Q(n++) + 'Augmenter de $' + t1 + '$ % revient à multiplier par $1 + \\dfrac{' + t1 + '}{100} = ' + N(1 + t1 / 100) + '$ : $' + N(P) + ' \\times ' + N(1 + t1 / 100) + ' = ' + N(P1) + '$ F CFA.');
      } else {
        qs.push({ label: n + ') Coefficient multiplicateur global du prix du sucre sur l\'année :', type: 'number', reponse: cm });
        sol.push(Q(n++) + 'Hausse de $' + t1 + '$ % : coefficient $' + N(1 + t1 / 100) + '$ ; baisse de $' + t2 + '$ % : coefficient $' + N(1 - t2 / 100) + '$. ' +
          'Les coefficients se multiplient : $' + N(1 + t1 / 100) + ' \\times ' + N(1 - t2 / 100) + ' = ' + N(cm) + '$.');
        qs.push({ label: n + ') Évolution globale du prix (en %, avec son signe) :', type: 'number', reponse: ev, unite: '%' });
        sol.push(Q(n++) + '$' + N(cm) + ' - 1 = ' + N(rd(cm - 1, 9)) + '$, soit une ' + (ev < 0 ? 'baisse' : 'hausse') + ' globale de $' + N(Math.abs(ev)) + '$ % (évolution $' + N(ev) + '$ %). ' +
          'Le prix final est $' + N(P) + ' \\times ' + N(cm) + ' = ' + N(rd(P * cm, 6)) + '$ F CFA. Remarque : une hausse de $' + t1 + '$ % suivie d\'une baisse de $' + t2 + '$ % ne donne pas une évolution de $' + N(t1 - t2) + '$ %.');
      }
      qs.push({ label: n + ') $B(x) =$', type: 'expr', reponse: mg + '*x-' + K, reponseTex: T.poly([mg, -K]), domaine: [0, 500] });
      sol.push(Q(n++) + 'Chaque bouteille rapporte $' + v + ' - ' + u + ' = ' + mg + '$ F CFA ; on retire les charges fixes : $B(x) = ' + T.poly([mg, -K]) + '$. $B$ est une fonction affine croissante (coefficient $' + mg + ' > 0$).');
      qs.push({ label: n + ') Nombre minimal de bouteilles à vendre dans le mois pour ne pas perdre d\'argent :', type: 'number', reponse: seuil });
      sol.push(Q(n++) + '$B(x) \\geqslant 0 \\iff ' + mg + 'x \\geqslant ' + N(K) + ' \\iff x \\geqslant \\dfrac{' + N(K) + '}{' + mg + '}' + eq(K / mg, 2) + '$. ' +
        (ar.isInt(K / mg) ? 'Il faut vendre au moins $' + seuil + '$ bouteilles.' : '$x$ est un nombre entier : il faut vendre au moins $' + seuil + '$ bouteilles.'));
      qs.push({ label: n + ') Bouteilles vendues en ' + mois + ' : (nombre de 1 L ; nombre de 50 cL) =', type: 'tuple', reponse: [na, nb] });
      sol.push(Q(n++) + 'Avec $x$ bouteilles de $1$ L et $y$ bouteilles de $50$ cL : $\\begin{cases} x + y = ' + N(Nt) + ' \\\\ ' + v + 'x + ' + v2 + 'y = ' + N(Rt) + ' \\end{cases}$. ' +
        'Par substitution $y = ' + N(Nt) + ' - x$ : $' + v + 'x + ' + v2 + '(' + N(Nt) + ' - x) = ' + N(Rt) + ' \\iff ' + (v - v2) + 'x = ' + N(Rt - v2 * Nt) + ' \\iff x = ' + na + '$, puis $y = ' + nb + '$. ' +
        'La coopérative a vendu $' + na + '$ bouteilles de $1$ L et $' + nb + '$ bouteilles de $50$ cL.');
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Une hausse de $t$ % correspond à une multiplication par $1 + \\dfrac{t}{100}$, une baisse de $t$ % à une multiplication par $1 - \\dfrac{t}{100}$.',
          'Bénéfice $=$ (gain par bouteille) $\\times$ (nombre de bouteilles) $-$ charges fixes.',
          'Pour le bilan des ventes, pose deux inconnues et écris un système : une équation sur le nombre de bouteilles, une sur la recette.'
        ],
        solution: sol,
        aide: 'Une baisse s\'écrit avec un signe moins (ex. -1,2). B(x) s\'écrit par exemple 400x - 60000. Un couple : (150 ; 120).'
      };
    }
  });

  /* ================================================================== */
  /* SECONDAIRE — 1ère S1, 1ère S2, 1ère L                               */
  /* ================================================================== */

  /* ------------------------- Le tournoi des navétanes ------------------------- */
  mission({
    id: 'mission-tournoi-navetanes',
    titre: 'Organiser le tournoi des navétanes',
    cycle: 'secondaire',
    classe: '1ere-s1',
    resume: 'Calendrier, podiums, poules et affluence du championnat de quartier : dénombrement et suites arithmétiques au service des navétanes.',
    chapitres: ['1s-denombrement', '1s-suites'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var ville = rng.pick(['Pikine', 'Rufisque', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis', 'Mbour', 'Louga']);
      var pres = rng.pick(GARCONS);
      var nE = rng.pick([8, 10, 12, 14, 16]), J = nE - 1;
      var a = rng.pick([800, 1000, 1200, 1500]), r = rng.pick([100, 150, 200, 250]), pb = rng.pick([200, 300, 500]);
      var uJ = a + (J - 1) * r, Stot = J * (a + uJ) / 2, rec = pb * Stot;
      var C2 = binom(nE, 2), A3 = arrang(nE, 3), C4 = binom(nE, 4), Cp = binom(nE, nE / 2);
      trace('mission-tournoi-navetanes', niveau, { n: nE, a: a, r: r, pb: pb });

      var enonce = 'Pendant les grandes vacances, les ASC (associations sportives et culturelles) de ' + ville + ' disputent le championnat des navétanes. ' +
        'Le comité d\'organisation, présidé par ' + pres + ', prépare la saison. Toutes les données sont celles de la mission.<br>' +
        '• ' + M(nE) + ' équipes sont engagées. Pendant le championnat, chaque équipe rencontre une seule fois chacune des autres. À chaque journée, toutes les équipes jouent un match.<br>' +
        '• À la fin, un podium (champion, deuxième, troisième) est établi.<br>' +
        (niveau === 2 ? '• Pour la coupe, un tirage au sort répartit les équipes en deux poules, nommées A et B, de ' + M(nE / 2) + ' équipes chacune ; on cherche aussi combien de groupes de ' + M(4) + ' équipes peuvent se qualifier pour les demi-finales.<br>' : '') +
        '• Le comité prévoit ' + M(a) + ' spectateurs pour la première journée, puis ' + M(r) + ' spectateurs de plus à chaque nouvelle journée. On note $u_k$ le nombre de spectateurs de la $k$-ième journée' +
        (niveau === 2 ? ' ; le billet d\'entrée coûte ' + cfa(pb) + '.' : '.');

      var qs = [], sol = [], n = 1;
      qs.push({ label: n + ') Nombre de matchs du championnat :', type: 'number', reponse: C2 });
      sol.push(Q(n++) + 'Un match correspond à une paire d\'équipes (l\'ordre ne compte pas) : $C_{' + nE + '}^{2} = \\dfrac{' + nE + ' \\times ' + (nE - 1) + '}{2} = ' + C2 + '$. ' +
        'Autre méthode : la 1re équipe joue $' + (nE - 1) + '$ matchs, la 2e encore $' + (nE - 2) + '$ nouveaux, … : $' + (nE - 1) + ' + ' + (nE - 2) + ' + \\dots + 1 = \\dfrac{' + (nE - 1) + ' \\times ' + nE + '}{2} = ' + C2 + '$ (somme de termes d\'une suite arithmétique).');
      if (niveau === 1) {
        qs.push({ label: n + ') Nombre de journées du championnat :', type: 'number', reponse: J });
        sol.push(Q(n++) + 'Chaque journée compte $\\dfrac{' + nE + '}{2} = ' + nE / 2 + '$ matchs : $' + C2 + ' \\div ' + nE / 2 + ' = ' + J + '$ journées.');
      }
      qs.push({ label: n + ') Nombre de podiums possibles :', type: 'number', reponse: A3 });
      sol.push(Q(n++) + 'Un podium est une liste ordonnée de $3$ équipes distinctes : c\'est un arrangement, $A_{' + nE + '}^{3} = ' + nE + ' \\times ' + (nE - 1) + ' \\times ' + (nE - 2) + ' = ' + N(A3) + '$.');
      if (niveau === 2) {
        qs.push({ label: n + ') Nombre de répartitions possibles en poules A et B :', type: 'number', reponse: Cp });
        sol.push(Q(n++) + 'Il suffit de choisir les $' + nE / 2 + '$ équipes de la poule A (sans ordre) ; les autres forment la poule B : $C_{' + nE + '}^{' + nE / 2 + '} = ' + N(Cp) + '$.');
        qs.push({ label: n + ') Nombre de groupes possibles de 4 demi-finalistes :', type: 'number', reponse: C4 });
        sol.push(Q(n++) + 'On choisit $4$ équipes parmi $' + nE + '$, sans ordre : $C_{' + nE + '}^{4} = \\dfrac{' + nE + ' \\times ' + (nE - 1) + ' \\times ' + (nE - 2) + ' \\times ' + (nE - 3) + '}{4 \\times 3 \\times 2 \\times 1} = ' + N(C4) + '$.');
      }
      qs.push({ label: n + ') Nombre de spectateurs prévus à la dernière journée :', type: 'number', reponse: uJ });
      sol.push(Q(n++) + (niveau === 2 ? 'Il y a $' + C2 + ' \\div ' + nE / 2 + ' = ' + J + '$ journées (chaque journée compte $' + nE / 2 + '$ matchs). ' : '') +
        '$(u_k)$ est une suite arithmétique de premier terme $u_1 = ' + N(a) + '$ et de raison $' + r + '$ : $u_k = ' + N(a) + ' + (k - 1) \\times ' + r + '$, donc $u_{' + J + '} = ' + N(a) + ' + ' + (J - 1) + ' \\times ' + r + ' = ' + N(uJ) + '$.');
      if (niveau === 1) {
        qs.push({ label: n + ') Nombre total de spectateurs sur tout le championnat :', type: 'number', reponse: Stot });
        sol.push(Q(n++) + 'Somme de termes consécutifs d\'une suite arithmétique : $u_1 + \\dots + u_{' + J + '} = ' + J + ' \\times \\dfrac{u_1 + u_{' + J + '}}{2} = ' + J + ' \\times \\dfrac{' + N(a) + ' + ' + N(uJ) + '}{2} = ' + N(Stot) + '$ spectateurs.');
      } else {
        qs.push({ label: n + ') Recette totale de la billetterie du championnat :', type: 'number', reponse: rec, unite: 'F CFA' });
        sol.push(Q(n++) + 'Total des spectateurs : $' + J + ' \\times \\dfrac{' + N(a) + ' + ' + N(uJ) + '}{2} = ' + N(Stot) + '$. Recette : $' + N(Stot) + ' \\times ' + pb + ' = ' + N(rec) + '$ F CFA.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'Un match est une paire d\'équipes : l\'ordre ne compte pas (combinaison). Un podium est ordonné (arrangement).',
          'Avec $' + nE + '$ équipes, chaque journée compte $' + nE / 2 + '$ matchs.',
          'Suite arithmétique : $u_k = u_1 + (k - 1)r$ et $u_1 + \\dots + u_k = k \\times \\dfrac{u_1 + u_k}{2}$.'
        ],
        solution: sol
      };
    }
  });

  /* ------------------------- La boîte de conserve optimale ------------------------- */
  mission({
    id: 'mission-boite-conserve',
    titre: 'La boîte de conserve la plus économique',
    cycle: 'secondaire',
    classe: '1ere-s2',
    resume: 'Une conserverie de Dakar veut économiser le métal : trouve, avec la dérivée, les dimensions optimales de ses boîtes.',
    chapitres: ['1s-derivation', '1s-etude-fonctions', '5e-prisme-cylindre'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var ing = rng.pick(FILLES), prod = rng.pick(['tomate concentrée', 'sardines à la tomate', 'thon', 'petits pois', 'lait concentré']);
      var V = rng.pick([330, 425, 500, 750, 850, 1000]);
      var r0 = Math.cbrt(V / (2 * Math.PI)), h0 = V / (Math.PI * r0 * r0), Smin = 6 * Math.PI * r0 * r0;
      trace('mission-boite-conserve', niveau, { V: V });

      var hT = '\\dfrac{' + N(V) + '}{\\pi r^2}', ST = '2\\pi r^2 + \\dfrac{' + N(2 * V) + '}{r}', SpT = '4\\pi r - \\dfrac{' + N(2 * V) + '}{r^2}';
      var f = EM.fig.create({ w: 150, h: 150, xmin: -2.2, xmax: 2.6, ymin: -0.9, ymax: 3.9, title: 'Boîte cylindrique' });
      f.add('<ellipse class="fig-line fig-fill" cx="' + f.X(0) + '" cy="' + f.Y(3) + '" rx="' + rd(f.X(1.5) - f.X(0), 2) + '" ry="' + rd(f.Y(2.7) - f.Y(3), 2) + '"/>');
      f.add('<path class="fig-line fig-nofill" d="M' + f.X(-1.5) + ',' + f.Y(0) + ' A' + rd(f.X(1.5) - f.X(0), 2) + ',' + rd(f.Y(-0.3) - f.Y(0), 2) + ' 0 0,0 ' + f.X(1.5) + ',' + f.Y(0) + '"/>');
      f.seg([-1.5, 0], [-1.5, 3]).seg([1.5, 0], [1.5, 3]);
      f.seg([0, 3], [1.5, 3], { accent: true });
      f.text([0.75, 3.15], 'r', { small: true });
      f.seg([2.1, 0], [2.1, 3], { dash: true });
      f.text([2.35, 1.5], 'h', { small: true });

      var enonce = 'Une conserverie de Dakar met en boîte ' + prod + '. Chaque boîte est un cylindre de rayon $r$ et de hauteur $h$ (en cm), de volume ' + M(V) + ' cm³ (donnée de la mission). ' +
        'Pour économiser le métal, l\'ingénieure ' + ing + ' cherche les dimensions qui rendent minimale l\'aire totale $S$ de métal (fond, couvercle et paroi latérale ; on néglige les soudures).<br>' +
        'Rappels : volume d\'un cylindre $V = \\pi r^2 h$ ; aire latérale $2\\pi r h$. On étudie $S$ sur $]0 \\,;\\, +\\infty[$.';

      var qs = [], sol = [], n = 1;
      if (niveau === 1) {
        qs.push({ label: n + ') Hauteur en fonction du rayon : $h(r) =$', type: 'expr', variable: 'r', reponse: V + '/(pi*r^2)', reponseTex: hT, domaine: [1, 8] });
        sol.push(Q(n++) + '$\\pi r^2 h = ' + N(V) + '$, donc $h = ' + hT + '$.');
      }
      qs.push({ label: n + ') Aire totale de métal : $S(r) =$', type: 'expr', variable: 'r', reponse: '2*pi*r^2+' + (2 * V) + '/r', reponseTex: ST, domaine: [1, 8] });
      sol.push(Q(n++) + (niveau === 2 ? 'De $\\pi r^2 h = ' + N(V) + '$ on tire $h = ' + hT + '$. ' : '') + 'Fond et couvercle : $2\\pi r^2$ ; paroi : $2\\pi r h = 2\\pi r \\times ' + hT + ' = \\dfrac{' + N(2 * V) + '}{r}$. Donc $S(r) = ' + ST + '$.');
      qs.push({ label: n + ') $S\'(r) =$', type: 'expr', variable: 'r', reponse: '4*pi*r-' + (2 * V) + '/r^2', reponseTex: SpT, domaine: [1, 8] });
      sol.push(Q(n++) + 'La dérivée de $r^2$ est $2r$ et celle de $\\dfrac{1}{r}$ est $-\\dfrac{1}{r^2}$ : $S\'(r) = ' + SpT + ' = \\dfrac{4\\pi r^3 - ' + N(2 * V) + '}{r^2}$.');
      qs.push({ label: n + ') Rayon $r_0$ qui rend l\'aire minimale (au centième) :', type: 'number', reponse: r0, tol: 0.01, reponseTex: ap(r0, 2), unite: 'cm' });
      sol.push(Q(n++) + 'Sur $]0 \\,;\\, +\\infty[$, $r^2 > 0$ : $S\'(r)$ a le signe de $4\\pi r^3 - ' + N(2 * V) + '$. ' +
        '$S\'(r) \\geqslant 0 \\iff r^3 \\geqslant \\dfrac{' + N(V) + '}{2\\pi} \\iff r \\geqslant r_0 = \\sqrt[3]{\\dfrac{' + N(V) + '}{2\\pi}}' + eq(r0, 2) + '$. ' +
        '$S$ est décroissante sur $]0 \\,;\\, r_0]$ et croissante sur $[r_0 \\,;\\, +\\infty[$ : elle admet un minimum en $r_0$.');
      if (niveau === 1) {
        qs.push({ label: n + ') Hauteur correspondante $h_0$ (au centième) :', type: 'number', reponse: h0, tol: 0.03, reponseTex: ap(h0, 2), unite: 'cm' });
        sol.push(Q(n++) + '$h_0 = \\dfrac{' + N(V) + '}{\\pi r_0^2}' + eq(h0, 2) + '$ cm. Comme $\\pi r_0^3 = \\dfrac{' + N(V) + '}{2}$, on a exactement $h_0 = 2r_0$ : la boîte la plus économique est aussi haute que large.');
      } else {
        qs.push({ label: n + ') Rapport $\\dfrac{h_0}{r_0}$ pour la boîte optimale :', type: 'number', reponse: 2 });
        sol.push(Q(n++) + '$h_0 = \\dfrac{' + N(V) + '}{\\pi r_0^2}$ et $' + N(V) + ' = 2\\pi r_0^3$, donc $h_0 = \\dfrac{2\\pi r_0^3}{\\pi r_0^2} = 2r_0$ : $\\dfrac{h_0}{r_0} = 2$. La hauteur est égale au diamètre ($h_0' + eq(h0, 2) + '$ cm).');
        qs.push({ label: n + ') Aire minimale de métal (au cm² près) :', type: 'number', reponse: Smin, tol: 1, reponseTex: '\\approx ' + N(Math.round(Smin)), unite: 'cm²' });
        sol.push(Q(n++) + '$S(r_0) = 2\\pi r_0^2 + \\dfrac{2 \\times 2\\pi r_0^3}{r_0} = 6\\pi r_0^2 \\approx ' + N(Math.round(Smin)) + '$ cm².');
      }
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: qs,
        indices: [
          'Exprime d\'abord $h$ en fonction de $r$ grâce au volume, puis remplace dans l\'aire.',
          'Mets $S\'(r)$ au même dénominateur $r^2$ : son signe est celui du numérateur.',
          '$r^3 \\geqslant k \\iff r \\geqslant \\sqrt[3]{k}$ (la fonction cube est croissante). Sur la calculatrice : $k^{1/3}$.'
        ],
        solution: sol,
        aide: 'Écris les expressions avec la lettre r, par exemple 2πr^2 + 850/r ou 2*pi*r^2 + 850/r.'
      };
    }
  });

  /* ------------------------- Tontine et épargne ------------------------- */
  mission({
    id: 'mission-tontine',
    titre: 'Tontine et épargne',
    cycle: 'secondaire',
    classe: '1ere-l',
    resume: 'Une tontine de quartier, une épargne qui grandit chaque mois et un placement à intérêts composés : les suites au service du budget.',
    chapitres: ['1l-suites', '1l-pourcentages'],
    niveaux: 2,
    gen: function (rng, niveau) {
      var mere = rng.pick(FILLES), fille = rng.pick(FILLES.filter(function (x) { return x !== mere; }));
      var quartier = rng.pick(['la Médina', 'Grand-Yoff', 'les Parcelles Assainies', 'Pikine', 'Guédiawaye', 'Sicap Liberté', 'Ouakam']);
      var nM = rng.pick([8, 10, 12]), c = rng.pick([5000, 10000, 15000, 20000]), pot = nM * c;
      var a = rng.pick([2000, 2500, 3000, 5000]), r = rng.pick([250, 500, 1000]);
      var u12 = a + 11 * r, S12 = 6 * (a + u12);
      var t = rng.pick([3, 3.5, 4, 5, 6]), k = rng.pick([3, 4, 5]);
      var Ck = pot * Math.pow(1 + t / 100, k), Sk = pot * (1 + k * t / 100);
      var fct = rng.pick([1.2, 1.25, 1.3, 1.4, 1.5]), X = Math.round(pot * fct / 1000) * 1000;
      var ny = 0; while (pot * Math.pow(1 + t / 100, ny) <= X) ny++;
      trace('mission-tontine', niveau, { nM: nM, c: c, a: a, r: r, t: t, k: k, X: X });

      var enonce = 'Dans le quartier de ' + quartier + ', ' + mere + ' fait partie d\'une tontine de ' + M(nM) + ' femmes : chaque mois, chaque membre verse ' + cfa(c) + ' et la cagnotte du mois est remise, à tour de rôle, à l\'une d\'elles.<br>' +
        '• Sa fille ' + fille + ' veut aussi épargner : ' + cfa(a) + ' en janvier, puis chaque mois ' + cfa(r) + ' de plus que le mois précédent. On note $u_n$ la somme épargnée le $n$-ième mois ($u_1 = ' + N(a) + '$).<br>' +
        '• Quand ' + mere + ' reçoit la cagnotte, elle la place à la banque au taux annuel de ' + M(t) + ' % à intérêts composés, pendant ' + M(k) + ' ans (taux de la mission).' +
        (niveau === 2 ? '<br>• Une autre banque propose le même taux, mais à intérêts simples. ' + mere + ' se demande aussi au bout de combien d\'années son capital placé à intérêts composés dépassera ' + cfa(X) + '.' : '');

      var qs = [], sol = [], n = 1, q = 1 + t / 100;
      qs.push({ label: n + ') Montant de la cagnotte reçue par ' + mere + ' :', type: 'number', reponse: pot, unite: 'F CFA' });
      sol.push(Q(n++) + '$' + nM + ' \\times ' + N(c) + ' = ' + N(pot) + '$ F CFA.');
      qs.push({ label: n + ') Somme épargnée par ' + fille + ' en décembre : $u_{12} =$', type: 'number', reponse: u12, unite: 'F CFA' });
      sol.push(Q(n++) + '$(u_n)$ est une suite arithmétique de premier terme $u_1 = ' + N(a) + '$ et de raison $' + N(r) + '$ : $u_n = ' + N(a) + ' + (n - 1) \\times ' + N(r) + '$, donc $u_{12} = ' + N(a) + ' + 11 \\times ' + N(r) + ' = ' + N(u12) + '$ F CFA.');
      qs.push({ label: n + ') Total épargné par ' + fille + ' sur l\'année :', type: 'number', reponse: S12, unite: 'F CFA' });
      sol.push(Q(n++) + '$u_1 + u_2 + \\dots + u_{12} = 12 \\times \\dfrac{u_1 + u_{12}}{2} = 12 \\times \\dfrac{' + N(a) + ' + ' + N(u12) + '}{2} = ' + N(S12) + '$ F CFA.');
      qs.push({ label: n + ') Capital de ' + mere + ' au bout de ' + k + ' ans à intérêts composés (au franc près) :', type: 'number', reponse: Ck, tol: 0.5, reponseTex: '\\approx ' + N(Math.round(Ck)), unite: 'F CFA' });
      sol.push(Q(n++) + 'Chaque année, le capital est multiplié par $1 + \\dfrac{' + N(t) + '}{100} = ' + N(q) + '$ : les capitaux successifs forment une suite géométrique de raison $' + N(q) + '$. ' +
        '$C_{' + k + '} = ' + N(pot) + ' \\times ' + N(q) + '^{' + k + '} \\approx ' + N(Math.round(Ck)) + '$ F CFA.');
      if (niveau === 2) {
        qs.push({ label: n + ') Capital au bout de ' + k + ' ans à intérêts simples :', type: 'number', reponse: Sk, tol: 0.5, reponseTex: ap(Sk, 0), unite: 'F CFA' });
        sol.push(Q(n++) + 'À intérêts simples, les intérêts sont les mêmes chaque année : $' + N(pot) + ' \\times \\dfrac{' + N(t) + '}{100} = ' + N(rd(pot * t / 100, 2)) + '$ F CFA (suite arithmétique). ' +
          '$' + N(pot) + ' + ' + k + ' \\times ' + N(rd(pot * t / 100, 2)) + eq(Sk, 0) + '$ F CFA, soit ' + cfa(Math.round(Ck - Sk)) + ' de moins qu\'avec les intérêts composés.');
        qs.push({ label: n + ') Nombre minimal d\'années pour dépasser ' + cfa(X) + ' (intérêts composés) :', type: 'number', reponse: ny, unite: 'ans' });
        sol.push(Q(n++) + 'On cherche le plus petit entier $n$ tel que $' + N(pot) + ' \\times ' + N(q) + '^n > ' + N(X) + '$. À la calculatrice : ' +
          '$C_{' + (ny - 1) + '} \\approx ' + N(Math.round(pot * Math.pow(q, ny - 1))) + '$ et $C_{' + ny + '} \\approx ' + N(Math.round(pot * Math.pow(q, ny))) + '$. Il faut donc $' + ny + '$ ans.');
      }
      return {
        enonce: enonce,
        questions: qs,
        indices: [
          'L\'épargne de ' + fille + ' augmente de la même somme chaque mois : c\'est une suite arithmétique.',
          'Somme de termes consécutifs d\'une suite arithmétique : nombre de termes $\\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$.',
          'À intérêts composés, le capital est multiplié chaque année par $1 + \\dfrac{t}{100}$ : $C_n = C_0 \\times \\left(1 + \\dfrac{t}{100}\\right)^n$.'
        ],
        solution: sol
      };
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
