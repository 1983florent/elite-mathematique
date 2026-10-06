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

})(typeof window !== 'undefined' ? window : globalThis);
