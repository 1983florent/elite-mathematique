/*
 * Ossature du programme de mathématiques du Sénégal (élémentaire, moyen, secondaire).
 * Chaque chapitre a un identifiant stable. Le contenu détaillé (cours, méthodes,
 * cartes de révision…) se trouve dans js/data/contenu-*.js ; les exercices
 * générés automatiquement dans js/gen/*.js.
 *
 * Pour ajuster le programme : modifier ce fichier (titres, ordre, prérequis),
 * puis compléter le contenu correspondant.
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  var DOMAINES = {
    nombres: { nom: 'Nombres et calculs', icone: '🔢' },
    algebre: { nom: 'Algèbre', icone: '🧮' },
    analyse: { nom: 'Analyse', icone: '📈' },
    geometrie: { nom: 'Géométrie', icone: '📐' },
    mesures: { nom: 'Grandeurs et mesures', icone: '📏' },
    stats: { nom: 'Statistiques et probabilités', icone: '📊' },
    arith: { nom: 'Arithmétique', icone: '🔣' }
  };

  var CYCLES = [
    { id: 'elementaire', nom: 'Élémentaire', classes: ['cm2'] },
    { id: 'moyen', nom: 'Moyen (collège)', classes: ['6e', '5e', '4e', '3e'] },
    { id: 'secondaire', nom: 'Secondaire (lycée)', classes: ['2nde-s', '2nde-l', '1ere-s1', '1ere-s2', '1ere-l', 'tle-s1', 'tle-s2', 'tle-l'] }
  ];

  var CLASSES = {
    'cm2': { nom: 'CM2', long: 'Cours moyen 2e année', examen: 'CFEE', couleur: '#2e7d32' },
    '6e': { nom: '6e', long: 'Sixième', couleur: '#00838f' },
    '5e': { nom: '5e', long: 'Cinquième', couleur: '#1565c0' },
    '4e': { nom: '4e', long: 'Quatrième', couleur: '#4527a0' },
    '3e': { nom: '3e', long: 'Troisième', examen: 'BFEM', couleur: '#ad1457' },
    '2nde-s': { nom: '2nde S', long: 'Seconde scientifique', couleur: '#c62828' },
    '2nde-l': { nom: '2nde L', long: 'Seconde littéraire', couleur: '#6d4c41' },
    '1ere-s1': { nom: '1ère S1', long: 'Première S1 (mathématiques renforcées)', couleur: '#ef6c00' },
    '1ere-s2': { nom: '1ère S2', long: 'Première S2 (sciences expérimentales)', couleur: '#f9a825' },
    '1ere-l': { nom: '1ère L', long: 'Première littéraire', couleur: '#8d6e63' },
    'tle-s1': { nom: 'Tle S1', long: 'Terminale S1', examen: 'BAC S1', couleur: '#1e2a78' },
    'tle-s2': { nom: 'Tle S2', long: 'Terminale S2', examen: 'BAC S2', couleur: '#283593' },
    'tle-l': { nom: 'Tle L', long: 'Terminale L', examen: 'BAC L', couleur: '#5d4037' }
  };

  /* Liste ordonnée des chapitres : [id, titre, domaine, classes, prérequis] */
  var C = [
    // ---------------- CM2 (préparation au CFEE et à l'entrée en 6e)
    ['cm2-numeration', 'Numération et grands nombres', 'nombres', ['cm2'], []],
    ['cm2-operations', 'Les quatre opérations', 'nombres', ['cm2'], ['cm2-numeration']],
    ['cm2-fractions', 'Fractions et nombres décimaux', 'nombres', ['cm2'], ['cm2-operations']],
    ['cm2-proportionnalite', 'Proportionnalité, pourcentages et échelles', 'nombres', ['cm2'], ['cm2-operations', 'cm2-fractions']],
    ['cm2-mesures', 'Mesures : longueurs, masses, capacités, durées', 'mesures', ['cm2'], ['cm2-numeration']],
    ['cm2-perimetres-aires', 'Périmètres et aires', 'mesures', ['cm2'], ['cm2-mesures']],
    ['cm2-geometrie', 'Figures planes et solides', 'geometrie', ['cm2'], []],
    ['cm2-problemes', 'Résolution de problèmes', 'nombres', ['cm2'], ['cm2-operations', 'cm2-proportionnalite']],

    // ---------------- 6e
    ['6e-entiers', 'Nombres entiers naturels', 'nombres', ['6e'], ['cm2-numeration']],
    ['6e-decimaux', 'Nombres décimaux arithmétiques', 'nombres', ['6e'], ['6e-entiers', 'cm2-fractions']],
    ['6e-operations', 'Opérations sur les nombres décimaux', 'nombres', ['6e'], ['6e-decimaux', 'cm2-operations']],
    ['6e-multiples-diviseurs', 'Multiples et diviseurs', 'arith', ['6e'], ['6e-entiers']],
    ['6e-fractions', 'Fractions', 'nombres', ['6e'], ['6e-multiples-diviseurs', 'cm2-fractions']],
    ['6e-proportionnalite', 'Proportionnalité et pourcentages', 'nombres', ['6e'], ['6e-operations', 'cm2-proportionnalite']],
    ['6e-donnees', 'Organisation et représentation de données', 'stats', ['6e'], ['6e-proportionnalite']],
    ['6e-droites', 'Droites, demi-droites et segments', 'geometrie', ['6e'], ['cm2-geometrie']],
    ['6e-perpendiculaires-paralleles', 'Droites perpendiculaires et droites parallèles', 'geometrie', ['6e'], ['6e-droites']],
    ['6e-cercle', 'Le cercle', 'geometrie', ['6e'], ['6e-droites']],
    ['6e-angles', 'Les angles', 'geometrie', ['6e'], ['6e-droites']],
    ['6e-symetrie-orthogonale', 'Symétrie orthogonale', 'geometrie', ['6e'], ['6e-perpendiculaires-paralleles']],
    ['6e-triangles', 'Les triangles', 'geometrie', ['6e'], ['6e-angles', '6e-cercle']],
    ['6e-quadrilateres', 'Quadrilatères particuliers', 'geometrie', ['6e'], ['6e-perpendiculaires-paralleles']],
    ['6e-perimetres-aires', 'Périmètres et aires', 'mesures', ['6e'], ['cm2-perimetres-aires', '6e-operations']],
    ['6e-solides', 'Pavé droit et cube : patrons et volumes', 'geometrie', ['6e'], ['6e-perimetres-aires']],

    // ---------------- 5e
    ['5e-relatifs', 'Nombres décimaux relatifs', 'nombres', ['5e'], ['6e-operations']],
    ['5e-fractions', 'Fractions : comparaison et opérations', 'nombres', ['5e'], ['6e-fractions']],
    ['5e-pgcd-ppcm', 'Multiples, diviseurs, PGCD et PPCM', 'arith', ['5e'], ['6e-multiples-diviseurs']],
    ['5e-expressions-litterales', 'Expressions littérales', 'algebre', ['5e'], ['5e-relatifs']],
    ['5e-proportionnalite', 'Proportionnalité : vitesse, échelle, pourcentages', 'nombres', ['5e'], ['6e-proportionnalite']],
    ['5e-statistiques', 'Statistiques : effectifs et fréquences', 'stats', ['5e'], ['6e-donnees', '5e-fractions']],
    ['5e-reperage', 'Repérage sur une droite et dans le plan', 'geometrie', ['5e'], ['5e-relatifs']],
    ['5e-symetrie-centrale', 'Symétrie centrale', 'geometrie', ['5e'], ['6e-symetrie-orthogonale']],
    ['5e-angles', 'Angles et parallélisme', 'geometrie', ['5e'], ['6e-angles']],
    ['5e-triangles', 'Triangles : angles et droites remarquables', 'geometrie', ['5e'], ['6e-triangles', '5e-angles']],
    ['5e-parallelogrammes', 'Parallélogrammes et quadrilatères particuliers', 'geometrie', ['5e'], ['5e-symetrie-centrale', '6e-quadrilateres']],
    ['5e-prisme-cylindre', 'Prisme droit et cylindre de révolution', 'geometrie', ['5e'], ['6e-solides']],

    // ---------------- 4e
    ['4e-rationnels', 'Nombres rationnels : calcul dans ℚ', 'nombres', ['4e'], ['5e-fractions', '5e-relatifs']],
    ['4e-puissances', 'Puissances et écriture scientifique', 'nombres', ['4e'], ['4e-rationnels']],
    ['4e-calcul-litteral', 'Calcul littéral : développer et factoriser', 'algebre', ['4e'], ['5e-expressions-litterales']],
    ['4e-equations', 'Équations et inéquations du premier degré', 'algebre', ['4e'], ['4e-calcul-litteral']],
    ['4e-applications-lineaires', 'Applications linéaires et proportionnalité', 'analyse', ['4e'], ['5e-proportionnalite', '5e-reperage']],
    ['4e-statistiques', 'Statistiques : moyenne et classes', 'stats', ['4e'], ['5e-statistiques']],
    ['4e-pythagore', 'Triangle rectangle et théorème de Pythagore', 'geometrie', ['4e'], ['5e-triangles', '4e-puissances']],
    ['4e-droite-milieux', 'Droite des milieux et triangles', 'geometrie', ['4e'], ['5e-parallelogrammes']],
    ['4e-cosinus', "Cosinus d'un angle aigu", 'geometrie', ['4e'], ['4e-pythagore']],
    ['4e-vecteurs', 'Vecteurs et translation', 'geometrie', ['4e'], ['5e-parallelogrammes']],
    ['4e-cercle-tangente', 'Cercle : positions relatives et tangente', 'geometrie', ['4e'], ['6e-cercle', '4e-pythagore']],
    ['4e-pyramide-cone', 'Pyramide et cône de révolution', 'geometrie', ['4e'], ['5e-prisme-cylindre']],

    // ---------------- 3e (BFEM)
    ['3e-racines', 'Racine carrée', 'nombres', ['3e'], ['4e-puissances', '4e-pythagore']],
    ['3e-calcul-algebrique', 'Calcul algébrique : identités remarquables et factorisation', 'algebre', ['3e'], ['4e-calcul-litteral']],
    ['3e-equations', 'Équations et inéquations dans ℝ', 'algebre', ['3e'], ['4e-equations', '3e-calcul-algebrique']],
    ['3e-systemes', "Systèmes d'équations et d'inéquations à deux inconnues", 'algebre', ['3e'], ['3e-equations']],
    ['3e-applications-affines', 'Applications affines', 'analyse', ['3e'], ['4e-applications-lineaires']],
    ['3e-statistiques', 'Statistiques : effectifs cumulés, médiane, histogramme', 'stats', ['3e'], ['4e-statistiques']],
    ['3e-thales', 'Théorème de Thalès et sa réciproque', 'geometrie', ['3e'], ['4e-droite-milieux']],
    ['3e-trigonometrie', 'Relations trigonométriques dans le triangle rectangle', 'geometrie', ['3e'], ['4e-cosinus', '3e-racines']],
    ['3e-angles-inscrits', 'Angles inscrits et polygones réguliers', 'geometrie', ['3e'], ['4e-cercle-tangente']],
    ['3e-vecteurs', 'Vecteurs : colinéarité et coordonnées', 'geometrie', ['3e'], ['4e-vecteurs']],
    ['3e-reperage', 'Repérage : distance, milieu, équations de droites', 'geometrie', ['3e'], ['3e-vecteurs', '3e-applications-affines', '3e-racines']],
    ['3e-espace', "Géométrie dans l'espace : sections, sphère et boule", 'geometrie', ['3e'], ['4e-pyramide-cone', '3e-thales']],

    // ---------------- 2nde S
    ['2s-calcul-reel', 'Calcul dans ℝ : puissances, radicaux, valeur absolue, intervalles', 'nombres', ['2nde-s'], ['3e-racines', '3e-equations']],
    ['2s-polynomes', 'Polynômes et fractions rationnelles', 'algebre', ['2nde-s'], ['3e-calcul-algebrique']],
    ['2s-second-degre', 'Équations et inéquations du second degré', 'algebre', ['2nde-s'], ['2s-polynomes']],
    ['2s-systemes', "Systèmes d'équations linéaires (méthode du pivot de Gauss)", 'algebre', ['2nde-s'], ['3e-systemes']],
    ['2s-fonctions', 'Généralités sur les fonctions et fonctions de référence', 'analyse', ['2nde-s'], ['3e-applications-affines', '2s-calcul-reel']],
    ['2s-statistiques', 'Statistiques : paramètres de position et de dispersion', 'stats', ['2nde-s'], ['3e-statistiques']],
    ['2s-trigonometrie', 'Trigonométrie : radian et cercle trigonométrique', 'geometrie', ['2nde-s'], ['3e-trigonometrie']],
    ['2s-vecteurs-barycentre', 'Calcul vectoriel et barycentre', 'geometrie', ['2nde-s'], ['3e-vecteurs']],
    ['2s-droites', 'Repérage et droites du plan', 'geometrie', ['2nde-s'], ['3e-reperage', '2s-vecteurs-barycentre']],
    ['2s-transformations', 'Transformations du plan : translation, homothétie, symétries, rotation', 'geometrie', ['2nde-s'], ['2s-vecteurs-barycentre']],
    ['2s-espace', "Géométrie dans l'espace : positions relatives", 'geometrie', ['2nde-s'], ['3e-espace']],

    // ---------------- 2nde L
    ['2l-calcul', 'Calcul numérique dans ℝ', 'nombres', ['2nde-l'], ['3e-racines']],
    ['2l-equations', 'Équations, inéquations et systèmes du premier degré', 'algebre', ['2nde-l'], ['3e-equations', '3e-systemes']],
    ['2l-fonctions', 'Fonctions affines et lecture graphique', 'analyse', ['2nde-l'], ['3e-applications-affines']],
    ['2l-pourcentages', 'Pourcentages et évolutions', 'nombres', ['2nde-l'], ['5e-proportionnalite']],
    ['2l-statistiques', 'Statistiques', 'stats', ['2nde-l'], ['3e-statistiques']],

    // ---------------- 1ère S1 / S2
    ['1s-polynomes', 'Polynômes, équations et inéquations', 'algebre', ['1ere-s1', '1ere-s2'], ['2s-second-degre']],
    ['1s-fonctions', 'Généralités sur les fonctions : composée, parité, symétries', 'analyse', ['1ere-s1', '1ere-s2'], ['2s-fonctions']],
    ['1s-limites', 'Limites et continuité', 'analyse', ['1ere-s1', '1ere-s2'], ['1s-fonctions']],
    ['1s-derivation', 'Dérivation', 'analyse', ['1ere-s1', '1ere-s2'], ['1s-limites']],
    ['1s-etude-fonctions', 'Étude et représentation graphique de fonctions', 'analyse', ['1ere-s1', '1ere-s2'], ['1s-derivation', '1s-polynomes']],
    ['1s-suites', 'Suites numériques : arithmétiques et géométriques', 'analyse', ['1ere-s1', '1ere-s2'], ['1s-fonctions']],
    ['1s-trigonometrie', 'Trigonométrie : formules et équations', 'algebre', ['1ere-s1', '1ere-s2'], ['2s-trigonometrie']],
    ['1s-denombrement', 'Dénombrement', 'stats', ['1ere-s1', '1ere-s2'], []],
    ['1s-statistiques', 'Statistiques', 'stats', ['1ere-s2'], ['2s-statistiques']],
    ['1s-produit-scalaire', 'Produit scalaire', 'geometrie', ['1ere-s1', '1ere-s2'], ['2s-droites']],
    ['1s-barycentre', 'Barycentre de n points et lignes de niveau', 'geometrie', ['1ere-s1', '1ere-s2'], ['2s-vecteurs-barycentre', '1s-produit-scalaire']],
    ['1s-angles-orientes', 'Angles orientés et rotations', 'geometrie', ['1ere-s1', '1ere-s2'], ['2s-trigonometrie', '2s-transformations']],
    ['1s-espace', "Géométrie dans l'espace : vecteurs et repérage", 'geometrie', ['1ere-s1'], ['2s-espace', '2s-vecteurs-barycentre']],
    ['1s1-transformations', 'Isométries et composées de transformations', 'geometrie', ['1ere-s1'], ['1s-angles-orientes']],

    // ---------------- 1ère L
    ['1l-equations', 'Équations et inéquations du second degré', 'algebre', ['1ere-l'], ['2l-equations']],
    ['1l-fonctions', 'Fonctions numériques : variations et dérivée', 'analyse', ['1ere-l'], ['2l-fonctions']],
    ['1l-suites', 'Suites arithmétiques et géométriques', 'analyse', ['1ere-l'], ['2l-pourcentages']],
    ['1l-pourcentages', 'Mathématiques financières : intérêts simples et composés', 'nombres', ['1ere-l'], ['2l-pourcentages']],
    ['1l-statistiques', 'Statistiques', 'stats', ['1ere-l'], ['2l-statistiques']],

    // ---------------- Terminale S1 / S2 (BAC)
    ['ts-limites', 'Limites et continuité', 'analyse', ['tle-s1', 'tle-s2'], ['1s-limites']],
    ['ts-derivabilite', 'Dérivabilité et étude de fonctions', 'analyse', ['tle-s1', 'tle-s2'], ['1s-etude-fonctions', 'ts-limites']],
    ['ts-suites', 'Suites numériques : récurrence et convergence', 'analyse', ['tle-s1', 'tle-s2'], ['1s-suites', 'ts-limites']],
    ['ts-primitives', 'Primitives', 'analyse', ['tle-s1', 'tle-s2'], ['ts-derivabilite']],
    ['ts-logarithme', 'Fonction logarithme népérien', 'analyse', ['tle-s1', 'tle-s2'], ['ts-primitives']],
    ['ts-exponentielle', 'Fonctions exponentielles et puissances', 'analyse', ['tle-s1', 'tle-s2'], ['ts-logarithme']],
    ['ts-integrales', 'Calcul intégral', 'analyse', ['tle-s1', 'tle-s2'], ['ts-primitives', 'ts-exponentielle']],
    ['ts-equations-differentielles', 'Équations différentielles', 'analyse', ['tle-s1', 'tle-s2'], ['ts-exponentielle']],
    ['ts-complexes', 'Nombres complexes', 'algebre', ['tle-s1', 'tle-s2'], ['1s-trigonometrie', '1s-polynomes']],
    ['ts-similitudes', 'Nombres complexes et similitudes directes', 'geometrie', ['tle-s1', 'tle-s2'], ['ts-complexes', '1s-angles-orientes']],
    ['ts-probabilites', 'Dénombrement et probabilités', 'stats', ['tle-s1', 'tle-s2'], ['1s-denombrement']],
    ['ts-statistiques', 'Statistiques à deux variables', 'stats', ['tle-s1', 'tle-s2'], ['2s-statistiques']],
    ['ts1-arithmetique', 'Arithmétique dans ℤ', 'arith', ['tle-s1'], ['5e-pgcd-ppcm']],
    ['ts1-coniques', 'Coniques', 'geometrie', ['tle-s1'], ['1s-produit-scalaire']],
    ['ts1-espace', "Géométrie dans l'espace : produit vectoriel", 'geometrie', ['tle-s1'], ['1s-espace']],

    // ---------------- Terminale L (BAC)
    ['tl-fonctions', 'Étude de fonctions', 'analyse', ['tle-l'], ['1l-fonctions']],
    ['tl-logarithme-exponentielle', 'Logarithme népérien et exponentielle', 'analyse', ['tle-l'], ['tl-fonctions']],
    ['tl-suites', 'Suites numériques', 'analyse', ['tle-l'], ['1l-suites']],
    ['tl-statistiques', 'Statistiques à deux variables', 'stats', ['tle-l'], ['1l-statistiques']],
    ['tl-probabilites', 'Dénombrement et probabilités', 'stats', ['tle-l'], []]
  ];

  var CHAPITRES = {}, ORDRE = [];
  C.forEach(function (c, i) {
    CHAPITRES[c[0]] = { id: c[0], titre: c[1], domaine: c[2], classes: c[3], prerequis: c[4], ordre: i };
    ORDRE.push(c[0]);
  });
  Object.keys(CLASSES).forEach(function (k) {
    CLASSES[k].id = k;
    CLASSES[k].chapitres = ORDRE.filter(function (id) { return CHAPITRES[id].classes.indexOf(k) >= 0; });
  });

  EM.programme = {
    domaines: DOMAINES,
    cycles: CYCLES,
    classes: CLASSES,
    chapitres: CHAPITRES,
    ordre: ORDRE,
    /** Liste des classes dans l'ordre de scolarité. */
    listeClasses: function () {
      return CYCLES.reduce(function (acc, c) { return acc.concat(c.classes); }, []);
    },
    /** Tous les prérequis (récursifs) d'un chapitre, du plus ancien au plus récent. */
    prerequisRecursifs: function (id) {
      var seen = {}, out = [];
      (function visit(x) {
        (CHAPITRES[x] ? CHAPITRES[x].prerequis : []).forEach(function (p) {
          if (!seen[p]) { seen[p] = true; visit(p); out.push(p); }
        });
      })(id);
      return out;
    }
  };
  EM.contenu = EM.contenu || {};
})(typeof window !== 'undefined' ? window : globalThis);
