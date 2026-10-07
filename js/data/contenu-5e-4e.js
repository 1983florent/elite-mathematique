/*
 * ELITE MATHÉMATIQUE — contenu pédagogique des classes de 5e et de 4e (cycle moyen).
 * Un objet par chapitre de js/data/programme.js : résumé, objectifs, cours, méthodes,
 * exemple corrigé, erreurs fréquentes, cartes de révision et problème « au Sénégal ».
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  EM.contenu = EM.contenu || {};

  /* =============================== 5e =============================== */

  EM.contenu['5e-relatifs'] = {
    resume: 'Les nombres relatifs permettent de repérer des températures, des altitudes ou des soldes négatifs ; on apprend à les comparer, les additionner, les soustraire et les multiplier.',
    objectifs: [
      'Reconnaître un nombre décimal relatif, son signe, sa distance à zéro et son opposé',
      'Comparer et ranger des nombres relatifs',
      'Additionner et soustraire des nombres relatifs',
      'Multiplier et diviser des nombres relatifs (règle des signes)',
      'Calculer une expression en respectant les priorités opératoires'
    ],
    cours: [
      { type: 'definition', titre: 'Nombre relatif', texte: 'Un nombre relatif est formé d\'un <b>signe</b> (+ ou −) et d\'une <b>distance à zéro</b>. Par exemple $-4{,}5$ a pour signe « − » et pour distance à zéro $4{,}5$. Deux nombres qui ont la même distance à zéro et des signes contraires sont <b>opposés</b> : l\'opposé de $-7$ est $7$. Le nombre $0$ est à la fois positif et négatif.' },
      { type: 'propriete', titre: 'Comparaison', texte: 'Un nombre négatif est plus petit qu\'un nombre positif. Entre deux nombres négatifs, le plus petit est celui qui a la plus grande distance à zéro : $-8 < -3$.' },
      { type: 'propriete', titre: 'Addition et soustraction', texte: 'Pour additionner deux nombres <b>de même signe</b>, on garde le signe et on additionne les distances à zéro : $(-3) + (-5) = -8$.<br>Pour additionner deux nombres <b>de signes contraires</b>, on prend le signe de celui qui a la plus grande distance à zéro et on soustrait les distances à zéro : $(-9) + 4 = -5$.<br>Soustraire un nombre, c\'est <b>ajouter son opposé</b> : $a - b = a + (-b)$, par exemple $3 - (-7) = 3 + 7 = 10$.' },
      { type: 'propriete', titre: 'Multiplication et division : règle des signes', texte: 'Le produit (ou le quotient) de deux nombres de même signe est positif ; de deux nombres de signes contraires, il est négatif. $(-4) \\times (-6) = 24$ ; $(-15) \\div 3 = -5$.<br>Un produit de plusieurs facteurs non nuls est positif si le nombre de facteurs négatifs est pair, négatif s\'il est impair.' },
      { type: 'propriete', titre: 'Priorités opératoires', texte: 'On effectue d\'abord les calculs entre parenthèses, puis les multiplications et divisions, enfin les additions et soustractions, de gauche à droite : $-2 + 3 \\times (-4) = -2 - 12 = -14$.' }
    ],
    methodes: [
      { titre: 'Calculer une somme algébrique', etapes: ['Supprimer les parenthèses : $+(-a)$ devient $-a$ et $-(-a)$ devient $+a$.', 'Regrouper les termes positifs d\'un côté, les termes négatifs de l\'autre.', 'Additionner chaque groupe, puis conclure avec la règle des signes contraires.'] },
      { titre: 'Déterminer le signe d\'un produit', etapes: ['Compter les facteurs négatifs.', 'Nombre pair : le produit est positif ; nombre impair : il est négatif.', 'Multiplier ensuite les distances à zéro.'] }
    ],
    exemple: {
      enonce: 'Calculer $A = -7 + 3 \\times (-2) - (-5)$.',
      solution: ['La multiplication est prioritaire : $3 \\times (-2) = -6$.', '$A = -7 - 6 + 5$.', '$A = -13 + 5 = -8$.']
    },
    erreurs: [
      'Écrire $(-3) + (-5) = 8$ ou $= 2$ : pour deux négatifs on additionne les distances à zéro et on garde le signe −, donc $-8$.',
      'Oublier de changer le signe en soustrayant : $4 - (-6) = 10$ et non $-2$.',
      'Appliquer la règle des signes de la multiplication à l\'addition : $(-2) + (-3)$ n\'est pas positif.',
      'Croire que $-8 > -3$ parce que $8 > 3$.'
    ],
    flashcards: [
      { q: 'Opposé de $-6{,}2$ ?', r: '$6{,}2$' },
      { q: '$(-7) + (-4) = ?$', r: '$-11$' },
      { q: '$(-9) + 5 = ?$', r: '$-4$' },
      { q: '$3 - (-8) = ?$', r: '$11$' },
      { q: '$(-6) \\times (-7) = ?$', r: '$42$' },
      { q: 'Signe d\'un produit de 3 facteurs négatifs ?', r: 'Négatif (nombre impair de facteurs négatifs).' },
      { q: 'Le plus petit entre $-12$ et $-5$ ?', r: '$-12$' }
    ],
    contexte: {
      titre: 'Températures du désert à Tambacounda',
      enonce: 'Un matin d\'harmattan, il fait $14$ °C à Tambacounda. À midi la température a augmenté de $23$ °C, puis elle baisse de $9$ °C le soir. Le même jour, un camion frigorifique du port de Dakar affiche $-18$ °C. Quelle est la température du soir à Tambacounda, et quel écart la sépare de celle du camion ?',
      solution: ['Température du soir : $14 + 23 - 9 = 28$ °C.', 'Écart : $28 - (-18) = 28 + 18 = 46$ °C.']
    }
  };

  EM.contenu['5e-fractions'] = {
    resume: 'On apprend à comparer, additionner, soustraire, multiplier et diviser des fractions, et à donner le résultat sous forme irréductible.',
    objectifs: [
      'Simplifier une fraction et reconnaître une fraction irréductible',
      'Comparer des fractions en les réduisant au même dénominateur',
      'Additionner et soustraire des fractions',
      'Multiplier des fractions et diviser par une fraction',
      'Calculer une fraction d\'une quantité'
    ],
    cours: [
      { type: 'propriete', titre: 'Égalité de fractions', texte: 'On ne change pas une fraction en multipliant ou en divisant son numérateur et son dénominateur par un même nombre non nul : $\\dfrac{a}{b} = \\dfrac{a \\times k}{b \\times k}$. Une fraction est <b>irréductible</b> lorsque son numérateur et son dénominateur n\'ont pas d\'autre diviseur commun que 1.' },
      { type: 'propriete', titre: 'Comparaison', texte: 'Deux fractions de même dénominateur positif sont rangées dans le même ordre que leurs numérateurs. Sinon, on les réduit d\'abord au même dénominateur : $\\dfrac{2}{3} = \\dfrac{8}{12}$ et $\\dfrac{3}{4} = \\dfrac{9}{12}$, donc $\\dfrac{2}{3} < \\dfrac{3}{4}$.' },
      { type: 'formule', titre: 'Addition et soustraction', texte: 'Avec le même dénominateur : $\\dfrac{a}{d} + \\dfrac{b}{d} = \\dfrac{a + b}{d}$. Sinon, on réduit au même dénominateur (de préférence le plus petit multiple commun) : $\\dfrac{1}{6} + \\dfrac{3}{4} = \\dfrac{2}{12} + \\dfrac{9}{12} = \\dfrac{11}{12}$.' },
      { type: 'formule', titre: 'Multiplication et division', texte: '$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{a \\times c}{b \\times d}$. Diviser par une fraction non nulle, c\'est multiplier par son <b>inverse</b> : $\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.' },
      { type: 'remarque', titre: 'Fraction d\'une quantité', texte: 'Prendre $\\dfrac{3}{5}$ de $40$ kg, c\'est calculer $\\dfrac{3}{5} \\times 40 = \\dfrac{3 \\times 40}{5} = 24$ kg.' }
    ],
    methodes: [
      { titre: 'Additionner deux fractions', etapes: ['Chercher un dénominateur commun (le PPCM des dénominateurs).', 'Écrire chaque fraction avec ce dénominateur.', 'Additionner les numérateurs, garder le dénominateur.', 'Simplifier le résultat.'] },
      { titre: 'Simplifier avant de multiplier', etapes: ['Décomposer numérateurs et dénominateurs en produits.', 'Barrer les facteurs communs en haut et en bas.', 'Multiplier ce qui reste.'] }
    ],
    exemple: {
      enonce: 'Calculer et donner le résultat sous forme irréductible : $B = \\dfrac{5}{6} - \\dfrac{1}{4} \\times \\dfrac{2}{3}$.',
      solution: ['La multiplication est prioritaire : $\\dfrac{1}{4} \\times \\dfrac{2}{3} = \\dfrac{2}{12} = \\dfrac{1}{6}$.', '$B = \\dfrac{5}{6} - \\dfrac{1}{6} = \\dfrac{4}{6} = \\dfrac{2}{3}$.']
    },
    erreurs: [
      'Additionner numérateurs et dénominateurs : $\\dfrac{1}{2} + \\dfrac{1}{3} \\neq \\dfrac{2}{5}$ ; la bonne réponse est $\\dfrac{5}{6}$.',
      'Réduire au même dénominateur pour multiplier : c\'est inutile, on multiplie directement.',
      'Diviser par une fraction sans prendre l\'inverse de la seconde fraction.',
      'Oublier de simplifier le résultat final.'
    ],
    flashcards: [
      { q: 'Forme irréductible de $\\dfrac{18}{24}$ ?', r: '$\\dfrac{3}{4}$' },
      { q: '$\\dfrac{2}{5} + \\dfrac{1}{5} = ?$', r: '$\\dfrac{3}{5}$' },
      { q: '$\\dfrac{1}{2} + \\dfrac{1}{3} = ?$', r: '$\\dfrac{5}{6}$' },
      { q: '$\\dfrac{2}{3} \\times \\dfrac{9}{4} = ?$', r: '$\\dfrac{3}{2}$' },
      { q: 'Inverse de $\\dfrac{4}{7}$ ?', r: '$\\dfrac{7}{4}$' },
      { q: '$\\dfrac{3}{4}$ de $200$ ?', r: '$150$' }
    ],
    contexte: {
      titre: 'Partage d\'une récolte d\'arachide à Kaolack',
      enonce: 'Un cultivateur de Kaolack récolte $1\\,200$ kg d\'arachide. Il en vend les $\\dfrac{3}{5}$ à l\'huilerie, garde $\\dfrac{1}{4}$ comme semences et donne le reste à sa famille. Quelle fraction de la récolte donne-t-il ? Quelle masse cela représente-t-il ?',
      solution: ['Fraction vendue ou gardée : $\\dfrac{3}{5} + \\dfrac{1}{4} = \\dfrac{12}{20} + \\dfrac{5}{20} = \\dfrac{17}{20}$.', 'Fraction donnée : $1 - \\dfrac{17}{20} = \\dfrac{3}{20}$.', 'Masse donnée : $\\dfrac{3}{20} \\times 1\\,200 = 180$ kg.']
    }
  };

  EM.contenu['5e-pgcd-ppcm'] = {
    resume: 'Multiples, diviseurs, nombres premiers : on cherche le plus grand diviseur commun (PGCD) et le plus petit multiple commun (PPCM) de deux entiers, utiles pour simplifier des fractions et résoudre des problèmes de partage.',
    objectifs: [
      'Utiliser les critères de divisibilité par 2, 3, 4, 5, 9 et 10',
      'Reconnaître un nombre premier et décomposer un entier en produit de facteurs premiers',
      'Déterminer le PGCD de deux entiers (liste des diviseurs, décomposition, algorithme d\'Euclide)',
      'Déterminer le PPCM de deux entiers',
      'Résoudre des problèmes de partage et de rencontre'
    ],
    cours: [
      { type: 'definition', titre: 'Multiple et diviseur', texte: 'Soit $a$ et $b$ deux entiers naturels, $b \\neq 0$. On dit que $b$ <b>divise</b> $a$ (ou que $a$ est un <b>multiple</b> de $b$) s\'il existe un entier $k$ tel que $a = b \\times k$. Exemple : $42 = 6 \\times 7$, donc $6$ et $7$ divisent $42$.' },
      { type: 'propriete', titre: 'Critères de divisibilité', texte: 'Un entier est divisible par 2 si son chiffre des unités est pair ; par 5 s\'il se termine par 0 ou 5 ; par 10 s\'il se termine par 0 ; par 4 si le nombre formé par ses deux derniers chiffres est divisible par 4 ; par 3 (resp. 9) si la somme de ses chiffres est divisible par 3 (resp. 9).' },
      { type: 'definition', titre: 'Nombre premier', texte: 'Un entier naturel est <b>premier</b> s\'il a exactement deux diviseurs : 1 et lui-même. Les premiers nombres premiers sont $2, 3, 5, 7, 11, 13, 17, 19, 23, 29$. Tout entier supérieur ou égal à 2 se décompose de façon unique en produit de facteurs premiers : $360 = 2^3 \\times 3^2 \\times 5$.' },
      { type: 'definition', titre: 'PGCD et PPCM', texte: 'Le <b>PGCD</b> de $a$ et $b$ est le plus grand de leurs diviseurs communs ; le <b>PPCM</b> est le plus petit de leurs multiples communs non nuls. Avec les décompositions : le PGCD est le produit des facteurs premiers communs, chacun pris avec le plus petit exposant ; le PPCM est le produit de tous les facteurs premiers, chacun avec le plus grand exposant.' },
      { type: 'propriete', titre: 'Algorithme d\'Euclide', texte: 'Si $a = bq + r$ avec $0 \\leq r < b$ (division euclidienne), alors $\\text{PGCD}(a ; b) = \\text{PGCD}(b ; r)$. On répète les divisions ; le PGCD est le <b>dernier reste non nul</b>. De plus $\\text{PGCD}(a ; b) \\times \\text{PPCM}(a ; b) = a \\times b$.' },
      { type: 'remarque', titre: 'Nombres premiers entre eux', texte: 'Deux entiers dont le PGCD est 1 sont dits <b>premiers entre eux</b>. Une fraction $\\dfrac{a}{b}$ est irréductible si et seulement si $a$ et $b$ sont premiers entre eux ; diviser $a$ et $b$ par leur PGCD donne directement la fraction irréductible.' }
    ],
    methodes: [
      { titre: 'Calculer un PGCD par l\'algorithme d\'Euclide', etapes: ['Diviser le plus grand nombre par le plus petit et noter le reste.', 'Recommencer avec le diviseur et le reste.', 'S\'arrêter quand le reste est nul : le PGCD est le dernier reste non nul.'] },
      { titre: 'Résoudre un problème de partage', etapes: ['Repérer qu\'on cherche le plus grand nombre de lots identiques : c\'est un PGCD.', 'Pour une rencontre ou un même rythme (« la prochaine fois en même temps ») : c\'est un PPCM.', 'Calculer puis répondre par une phrase.'] }
    ],
    exemple: {
      enonce: 'Calculer le PGCD de $252$ et $198$ par l\'algorithme d\'Euclide, puis leur PPCM.',
      solution: ['$252 = 198 \\times 1 + 54$', '$198 = 54 \\times 3 + 36$', '$54 = 36 \\times 1 + 18$', '$36 = 18 \\times 2 + 0$ : le dernier reste non nul est $18$, donc $\\text{PGCD}(252 ; 198) = 18$.', '$\\text{PPCM}(252 ; 198) = \\dfrac{252 \\times 198}{18} = 2\\,772$.']
    },
    erreurs: [
      'Prendre le dernier reste (0) au lieu du dernier reste non nul dans l\'algorithme d\'Euclide.',
      'Confondre PGCD (partages, plus grand nombre de lots) et PPCM (rendez-vous, plus petite longueur commune).',
      'Croire que 1 est premier : il n\'a qu\'un seul diviseur.',
      'Pour le PPCM, multiplier simplement les deux nombres : $a \\times b$ est un multiple commun, mais pas toujours le plus petit.'
    ],
    flashcards: [
      { q: '$51$ est-il premier ?', r: 'Non : $51 = 3 \\times 17$.' },
      { q: 'Décomposition de $84$ ?', r: '$2^2 \\times 3 \\times 7$' },
      { q: '$\\text{PGCD}(24 ; 36)$ ?', r: '$12$' },
      { q: '$\\text{PPCM}(6 ; 8)$ ?', r: '$24$' },
      { q: 'Dans l\'algorithme d\'Euclide, le PGCD est…', r: 'le dernier reste non nul.' },
      { q: 'Lien entre PGCD et PPCM ?', r: '$\\text{PGCD}(a;b) \\times \\text{PPCM}(a;b) = a \\times b$' },
      { q: 'Critère de divisibilité par 9 ?', r: 'La somme des chiffres est divisible par 9.' }
    ],
    contexte: {
      titre: 'Paniers de fruits pour la kermesse de Ziguinchor',
      enonce: 'Pour une kermesse à Ziguinchor, Mariama dispose de $84$ mangues et de $126$ oranges. Elle veut confectionner le plus grand nombre possible de paniers identiques en utilisant tous les fruits. Combien de paniers peut-elle faire et que contient chacun ?',
      solution: ['Le nombre de paniers doit diviser $84$ et $126$ : on cherche $\\text{PGCD}(84 ; 126)$.', '$126 = 84 \\times 1 + 42$ et $84 = 42 \\times 2 + 0$, donc le PGCD vaut $42$.', 'Elle peut faire $42$ paniers contenant chacun $84 \\div 42 = 2$ mangues et $126 \\div 42 = 3$ oranges.']
    },
    histoire: 'L\'algorithme du calcul du PGCD par divisions successives est exposé dans le livre VII des <i>Éléments</i> d\'Euclide, rédigés à Alexandrie vers 300 avant notre ère. C\'est l\'un des plus anciens algorithmes encore utilisés.'
  };

  EM.contenu['5e-expressions-litterales'] = {
    resume: 'Une expression littérale contient des lettres qui désignent des nombres. On apprend à l\'écrire simplement, à calculer sa valeur, à la réduire et à utiliser la distributivité.',
    objectifs: [
      'Écrire une expression littérale en supprimant le signe × quand c\'est possible',
      'Calculer la valeur d\'une expression pour une valeur donnée des lettres',
      'Réduire une somme algébrique (regrouper les termes semblables)',
      'Utiliser la distributivité pour développer $k(a + b)$ ou factoriser $ka + kb$',
      'Traduire une situation par une expression littérale (périmètre, prix…)'
    ],
    cours: [
      { type: 'definition', titre: 'Expression littérale', texte: 'Une expression littérale est une expression dans laquelle des lettres représentent des nombres. Conventions d\'écriture : on peut supprimer le signe × devant une lettre ou une parenthèse : $3 \\times x = 3x$, $a \\times b = ab$, $4 \\times (x + 1) = 4(x + 1)$. On écrit $x \\times x = x^2$ et $x \\times x \\times x = x^3$.' },
      { type: 'propriete', titre: 'Valeur d\'une expression', texte: 'Pour calculer la valeur d\'une expression, on remplace chaque lettre par sa valeur (en rétablissant les signes ×) puis on applique les priorités. Pour $x = -2$ : $3x^2 - 5x + 1 = 3 \\times (-2)^2 - 5 \\times (-2) + 1 = 12 + 10 + 1 = 23$.' },
      { type: 'propriete', titre: 'Réduire une expression', texte: 'Réduire, c\'est regrouper les termes de même nature (les termes en $x$, les termes en $x^2$, les constantes) : $5x - 3 + 2x + 8 = 7x + 5$. On ne peut pas additionner des termes de natures différentes : $3x + 2$ ne se réduit pas.' },
      { type: 'propriete', titre: 'Distributivité', texte: 'Pour tous nombres $k$, $a$, $b$ : $k(a + b) = ka + kb$ et $k(a - b) = ka - kb$. Lue de gauche à droite, l\'égalité sert à <b>développer</b> ; de droite à gauche, elle sert à <b>factoriser</b> : $6x + 9 = 3(2x + 3)$.' },
      { type: 'propriete', titre: 'Supprimer des parenthèses', texte: 'Des parenthèses précédées du signe + peuvent être supprimées sans changer les signes : $a + (b - c) = a + b - c$. Précédées du signe −, on les supprime en changeant tous les signes à l\'intérieur : $a - (b - c) = a - b + c$.' }
    ],
    methodes: [
      { titre: 'Développer et réduire', etapes: ['Distribuer le facteur à chaque terme de la parenthèse, en faisant attention aux signes.', 'Supprimer les parenthèses précédées de − en changeant les signes.', 'Regrouper les termes semblables et écrire le résultat en ordonnant ($x^2$, puis $x$, puis les nombres).'] },
      { titre: 'Factoriser par un facteur commun', etapes: ['Repérer un facteur commun à tous les termes (nombre ou lettre).', 'L\'écrire devant une parenthèse.', 'Écrire dans la parenthèse ce qui reste de chaque terme, puis vérifier en développant.'] }
    ],
    exemple: {
      enonce: 'Développer et réduire $E = 3(2x - 5) - (4x - 7)$, puis calculer $E$ pour $x = -1$.',
      solution: ['$E = 6x - 15 - 4x + 7$.', '$E = 2x - 8$.', 'Pour $x = -1$ : $E = 2 \\times (-1) - 8 = -10$.']
    },
    erreurs: [
      'Ne distribuer qu\'au premier terme : $3(x + 4) \\neq 3x + 4$.',
      'Oublier de changer tous les signes devant une parenthèse précédée de − : $-(2x - 3) = -2x + 3$.',
      'Réduire $3x + 2$ en $5x$ : on n\'additionne pas des $x$ et des nombres.',
      'Confondre $2x$ et $x^2$ : pour $x = 5$, $2x = 10$ mais $x^2 = 25$.'
    ],
    flashcards: [
      { q: 'Écrire simplement $5 \\times a \\times b$', r: '$5ab$' },
      { q: 'Réduire $4x + 3 - x + 2$', r: '$3x + 5$' },
      { q: 'Développer $5(x - 2)$', r: '$5x - 10$' },
      { q: 'Factoriser $7x + 14$', r: '$7(x + 2)$' },
      { q: 'Supprimer les parenthèses : $-(3x - 4)$', r: '$-3x + 4$' },
      { q: 'Valeur de $2x^2$ pour $x = -3$ ?', r: '$18$' }
    ],
    contexte: {
      titre: 'Le terrain de lutte',
      enonce: 'Pour un tournoi de lutte à Mbour, on délimite une aire rectangulaire de longueur $x + 6$ mètres et de largeur $x$ mètres. Exprimer le périmètre $P$ de l\'aire en fonction de $x$, sous forme réduite, puis le calculer pour $x = 12$.',
      solution: ['$P = 2(x + 6) + 2x = 2x + 12 + 2x = 4x + 12$.', 'Pour $x = 12$ : $P = 4 \\times 12 + 12 = 60$ m.']
    }
  };

  EM.contenu['5e-proportionnalite'] = {
    resume: 'Reconnaître une situation de proportionnalité, calculer une quatrième proportionnelle et l\'utiliser pour les vitesses moyennes, les échelles et les pourcentages.',
    objectifs: [
      'Reconnaître un tableau de proportionnalité et calculer son coefficient',
      'Calculer une quatrième proportionnelle (produit en croix)',
      'Utiliser la relation $d = v \\times t$ et convertir des durées',
      'Utiliser une échelle pour passer du plan à la réalité',
      'Calculer et appliquer un pourcentage (remise, augmentation)'
    ],
    cours: [
      { type: 'definition', titre: 'Proportionnalité', texte: 'Deux grandeurs sont <b>proportionnelles</b> si l\'on obtient les valeurs de l\'une en multipliant celles de l\'autre par un même nombre non nul, appelé <b>coefficient de proportionnalité</b>. Dans un tableau de proportionnalité, les quotients des nombres d\'une ligne par ceux de l\'autre sont tous égaux.' },
      { type: 'propriete', titre: 'Quatrième proportionnelle', texte: 'Si $\\dfrac{a}{b} = \\dfrac{c}{d}$ (avec $b$ et $d$ non nuls), alors $a \\times d = b \\times c$ (égalité des produits en croix). Ainsi, connaissant $a$, $b$ et $c$, on obtient $d = \\dfrac{b \\times c}{a}$.' },
      { type: 'formule', titre: 'Vitesse moyenne', texte: 'Si un mobile parcourt une distance $d$ en une durée $t$, sa vitesse moyenne est $v = \\dfrac{d}{t}$, d\'où $d = v \\times t$ et $t = \\dfrac{d}{v}$. Attention aux unités : $1$ h $= 60$ min, donc $45$ min $= 0{,}75$ h et $1$ h $30$ min $= 1{,}5$ h.' },
      { type: 'formule', titre: 'Échelle', texte: 'L\'échelle d\'un plan est le coefficient qui permet de passer des longueurs réelles aux longueurs du plan, exprimées dans la même unité : $\\text{échelle} = \\dfrac{\\text{longueur sur le plan}}{\\text{longueur réelle}}$. À l\'échelle $\\dfrac{1}{50\\,000}$, $1$ cm sur la carte représente $50\\,000$ cm, soit $500$ m.' },
      { type: 'formule', titre: 'Pourcentages', texte: 'Prendre $t$ % d\'une quantité $Q$, c\'est calculer $\\dfrac{t}{100} \\times Q$. Après une remise de $t$ %, le prix est multiplié par $1 - \\dfrac{t}{100}$ ; après une augmentation de $t$ %, il est multiplié par $1 + \\dfrac{t}{100}$.' }
    ],
    methodes: [
      { titre: 'Calculer une quatrième proportionnelle', etapes: ['Ranger les données dans un tableau à deux lignes.', 'Écrire l\'égalité des produits en croix.', 'Isoler la valeur cherchée et calculer.'] },
      { titre: 'Résoudre un problème de vitesse', etapes: ['Convertir les durées en heures décimales (ou les vitesses en km/min).', 'Choisir la bonne formule : $d = vt$, $v = \\dfrac{d}{t}$ ou $t = \\dfrac{d}{v}$.', 'Calculer et vérifier l\'ordre de grandeur.'] }
    ],
    exemple: {
      enonce: 'Un car rapide relie Dakar à Thiès, distantes d\'environ $70$ km, en $1$ h $24$ min. Calculer sa vitesse moyenne en km/h.',
      solution: ['$24$ min $= \\dfrac{24}{60}$ h $= 0{,}4$ h, donc $t = 1{,}4$ h.', '$v = \\dfrac{d}{t} = \\dfrac{70}{1{,}4} = 50$ km/h.']
    },
    erreurs: [
      'Écrire $1$ h $30$ min $= 1{,}30$ h : en réalité $30$ min $= 0{,}5$ h, donc $1{,}5$ h.',
      'Utiliser une échelle sans mettre les deux longueurs dans la même unité.',
      'Croire qu\'une baisse de $20$ % suivie d\'une hausse de $20$ % ramène au prix initial.',
      'Conclure à la proportionnalité parce que les deux grandeurs « augmentent ensemble ».'
    ],
    flashcards: [
      { q: '$45$ min en heures ?', r: '$0{,}75$ h' },
      { q: 'Formule de la vitesse moyenne ?', r: '$v = \\dfrac{d}{t}$' },
      { q: '$15$ % de $2\\,000$ F CFA ?', r: '$300$ F CFA' },
      { q: 'Échelle $\\dfrac{1}{100\\,000}$ : $3$ cm sur la carte représentent ?', r: '$3$ km' },
      { q: 'Prix de $1\\,500$ F CFA après $10$ % de remise ?', r: '$1\\,350$ F CFA' },
      { q: 'Produits en croix : si $\\dfrac{a}{b} = \\dfrac{c}{d}$ alors…', r: '$ad = bc$' }
    ],
    contexte: {
      titre: 'Soldes au marché Sandaga',
      enonce: 'Au marché Sandaga, Fatou achète un boubou affiché $18\\,000$ F CFA ; le commerçant lui accorde une remise de $15$ %. Elle achète aussi $3$ m de tissu à $2\\,500$ F CFA le mètre. Combien paie-t-elle en tout ?',
      solution: ['Remise : $\\dfrac{15}{100} \\times 18\\,000 = 2\\,700$ F CFA, donc le boubou coûte $18\\,000 - 2\\,700 = 15\\,300$ F CFA.', 'Tissu : $3 \\times 2\\,500 = 7\\,500$ F CFA (le prix est proportionnel à la longueur).', 'Total : $15\\,300 + 7\\,500 = 22\\,800$ F CFA.']
    }
  };

  EM.contenu['5e-statistiques'] = {
    resume: 'Recueillir des données, les organiser dans un tableau d\'effectifs, calculer des fréquences et les représenter par des diagrammes.',
    objectifs: [
      'Identifier la population, le caractère étudié et ses modalités',
      'Construire un tableau d\'effectifs et calculer l\'effectif total',
      'Calculer des fréquences (fraction, décimal, pourcentage)',
      'Représenter une série par un diagramme en bâtons ou circulaire',
      'Lire et interpréter un diagramme'
    ],
    cours: [
      { type: 'definition', titre: 'Vocabulaire', texte: 'On étudie un <b>caractère</b> (la note, la taille, le moyen de transport…) sur une <b>population</b> (une classe, des familles…). Chaque valeur possible du caractère est une <b>modalité</b>. L\'<b>effectif</b> d\'une modalité est le nombre d\'individus qui la présentent ; l\'<b>effectif total</b> est la somme des effectifs.' },
      { type: 'formule', titre: 'Fréquence', texte: 'La fréquence d\'une modalité est $f = \\dfrac{\\text{effectif de la modalité}}{\\text{effectif total}}$. C\'est un nombre compris entre 0 et 1 qu\'on peut écrire en pourcentage : $f = 0{,}35 = 35$ %. La somme de toutes les fréquences vaut 1 (soit 100 %).' },
      { type: 'propriete', titre: 'Diagramme en bâtons', texte: 'Chaque modalité est représentée par un bâton dont la hauteur est proportionnelle à son effectif (ou à sa fréquence).' },
      { type: 'formule', titre: 'Diagramme circulaire', texte: 'Chaque modalité est représentée par un secteur dont l\'angle est proportionnel à l\'effectif : $\\text{angle} = f \\times 360°$. Pour un demi-disque, on utilise $180°$.' }
    ],
    methodes: [
      { titre: 'Calculer les fréquences d\'une série', etapes: ['Calculer l\'effectif total $N$.', 'Diviser chaque effectif par $N$.', 'Multiplier par 100 pour obtenir un pourcentage ; vérifier que la somme fait 100 %.'] },
      { titre: 'Construire un diagramme circulaire', etapes: ['Calculer la fréquence de chaque modalité.', 'Multiplier chaque fréquence par $360°$.', 'Tracer les secteurs au rapporteur, puis légender.'] }
    ],
    exemple: {
      enonce: 'Dans une classe de $40$ élèves de Rufisque, $14$ viennent à pied, $18$ en car rapide et $8$ à vélo. Calculer la fréquence en pourcentage des élèves venant en car rapide, et l\'angle du secteur correspondant dans un diagramme circulaire.',
      solution: ['$f = \\dfrac{18}{40} = 0{,}45 = 45$ %.', 'Angle : $0{,}45 \\times 360° = 162°$.']
    },
    erreurs: [
      'Diviser par le nombre de modalités au lieu de l\'effectif total.',
      'Oublier de vérifier que la somme des fréquences vaut 1 (ou 100 %).',
      'Dessiner des secteurs d\'angles égaux aux pourcentages (35 % n\'est pas un angle de 35°).'
    ],
    flashcards: [
      { q: 'Définition de la fréquence ?', r: 'effectif de la modalité ÷ effectif total' },
      { q: 'Somme des fréquences ?', r: '$1$, soit $100$ %' },
      { q: 'Fréquence de $9$ sur $36$ ?', r: '$0{,}25 = 25$ %' },
      { q: 'Angle d\'un secteur de fréquence $0{,}2$ ?', r: '$72°$' },
      { q: 'Qu\'est-ce qu\'une modalité ?', r: 'Une valeur possible du caractère étudié.' }
    ],
    contexte: {
      titre: 'Enquête sur le petit-déjeuner à Thiès',
      enonce: 'On interroge $50$ élèves d\'un collège de Thiès sur leur petit-déjeuner : $20$ prennent de la bouillie de mil, $15$ du pain avec du café, $10$ du riz de la veille et $5$ ne mangent rien. Calculer les fréquences en pourcentage et les angles du diagramme circulaire.',
      solution: ['Bouillie : $\\dfrac{20}{50} = 40$ %, angle $0{,}4 \\times 360° = 144°$.', 'Pain-café : $30$ %, angle $108°$.', 'Riz : $20$ %, angle $72°$.', 'Rien : $10$ %, angle $36°$. Vérification : $144 + 108 + 72 + 36 = 360$.']
    }
  };

  EM.contenu['5e-reperage'] = {
    resume: 'Repérer un point sur une droite graduée par son abscisse et dans le plan muni d\'un repère (O, I, J) par ses coordonnées.',
    objectifs: [
      'Lire et placer un point d\'abscisse donnée sur une droite graduée',
      'Calculer la distance entre deux points d\'une droite graduée',
      'Lire et placer un point de coordonnées données dans un repère (O, I, J)',
      'Calculer les coordonnées du milieu d\'un segment sur une droite graduée',
      'Connaître les coordonnées du symétrique d\'un point par rapport à O ou aux axes'
    ],
    cours: [
      { type: 'definition', titre: 'Droite graduée', texte: 'Sur une droite graduée d\'origine O et d\'unité OI, chaque point est repéré par un nombre relatif, son <b>abscisse</b>. Si $A$ et $B$ ont pour abscisses $a$ et $b$, la distance $AB$ est égale à la plus grande abscisse moins la plus petite : $AB = b - a$ si $b \\geq a$.' },
      { type: 'formule', titre: 'Milieu sur une droite graduée', texte: 'Le milieu $M$ de $[AB]$ a pour abscisse $\\dfrac{a + b}{2}$. Exemple : si $a = -3$ et $b = 7$, alors $M$ a pour abscisse $2$.' },
      { type: 'definition', titre: 'Repère du plan', texte: 'Un repère (O, I, J) est formé de deux droites graduées sécantes en O : l\'axe des <b>abscisses</b> (OI) et l\'axe des <b>ordonnées</b> (OJ). Tout point $M$ est repéré par un couple $(x ; y)$ : $x$ est son abscisse, $y$ son ordonnée. On écrit $M(x ; y)$. Les axes partagent le plan en quatre régions.' },
      { type: 'propriete', titre: 'Symétriques et coordonnées', texte: 'Dans un repère orthonormé, si $M(x ; y)$ alors : son symétrique par rapport à O est $M\'(-x ; -y)$ ; son symétrique par rapport à l\'axe des abscisses est $(x ; -y)$ ; par rapport à l\'axe des ordonnées, $(-x ; y)$.' }
    ],
    methodes: [
      { titre: 'Lire les coordonnées d\'un point', etapes: ['Tracer (mentalement) la parallèle à l\'axe des ordonnées passant par le point : elle coupe l\'axe des abscisses en $x$.', 'Tracer la parallèle à l\'axe des abscisses : elle coupe l\'axe des ordonnées en $y$.', 'Écrire $(x ; y)$ en commençant toujours par l\'abscisse.'] }
    ],
    exemple: {
      enonce: 'Sur une droite graduée, $A$ a pour abscisse $-4{,}5$ et $B$ a pour abscisse $2{,}5$. Calculer $AB$ et l\'abscisse du milieu de $[AB]$.',
      solution: ['$AB = 2{,}5 - (-4{,}5) = 7$.', 'Milieu : $\\dfrac{-4{,}5 + 2{,}5}{2} = \\dfrac{-2}{2} = -1$.']
    },
    erreurs: [
      'Inverser abscisse et ordonnée : dans $(3 ; -2)$, $3$ se lit sur l\'axe horizontal.',
      'Calculer une distance négative : une distance est toujours positive.',
      'Oublier les parenthèses : $AB = 2 - (-5) = 7$ et non $2 - 5$.'
    ],
    flashcards: [
      { q: 'Dans $M(x ; y)$, $x$ s\'appelle…', r: 'l\'abscisse' },
      { q: 'Distance entre les points d\'abscisses $-3$ et $5$ ?', r: '$8$' },
      { q: 'Abscisse du milieu de $[AB]$ ?', r: '$\\dfrac{a + b}{2}$' },
      { q: 'Symétrique de $(2 ; -5)$ par rapport à O ?', r: '$(-2 ; 5)$' },
      { q: 'Coordonnées de l\'origine O ?', r: '$(0 ; 0)$' }
    ],
    contexte: {
      titre: 'Le long de la Corniche',
      enonce: 'On modélise la Corniche de Dakar par une droite graduée en kilomètres, d\'origine une station de bus. Awa habite à l\'abscisse $-2{,}4$ et son école est à l\'abscisse $3{,}6$. Quelle distance parcourt-elle ? Elles se retrouvent avec Khady à mi-chemin : à quelle abscisse ?',
      solution: ['Distance : $3{,}6 - (-2{,}4) = 6$ km.', 'Milieu : $\\dfrac{-2{,}4 + 3{,}6}{2} = 0{,}6$ : elles se retrouvent à l\'abscisse $0{,}6$.']
    }
  };

  EM.contenu['5e-symetrie-centrale'] = {
    resume: 'La symétrie centrale de centre O est un demi-tour autour de O. Elle conserve les longueurs, les angles, les aires et l\'alignement, et transforme une droite en une droite parallèle.',
    objectifs: [
      'Construire le symétrique d\'un point, d\'un segment, d\'une droite, d\'un cercle par rapport à un point',
      'Connaître les propriétés de conservation de la symétrie centrale',
      'Reconnaître un centre de symétrie d\'une figure',
      'Calculer les coordonnées du symétrique d\'un point dans un repère'
    ],
    cours: [
      { type: 'definition', titre: 'Symétrique d\'un point', texte: 'Soit O un point. Le symétrique d\'un point $M$ par rapport à O est le point $M\'$ tel que O soit le <b>milieu</b> de $[MM\']$. Le symétrique de O est O lui-même.' },
      { type: 'propriete', titre: 'Propriétés de conservation', texte: 'La symétrie centrale conserve les distances ($A\'B\' = AB$), les mesures d\'angles, les aires, l\'alignement et le parallélisme. L\'image d\'une droite est une droite qui lui est <b>parallèle</b> ; l\'image d\'un cercle de centre C est un cercle de même rayon, de centre C\' symétrique de C.' },
      { type: 'definition', titre: 'Centre de symétrie', texte: 'Un point O est un centre de symétrie d\'une figure si la symétrique de cette figure par rapport à O est la figure elle-même. Exemples : le centre d\'un cercle, le point d\'intersection des diagonales d\'un parallélogramme.' },
      { type: 'formule', titre: 'Dans un repère', texte: 'Si $A(x_A ; y_A)$ et $\\Omega(a ; b)$, le symétrique $A\'$ de $A$ par rapport à $\\Omega$ vérifie : $\\Omega$ est le milieu de $[AA\']$, d\'où $x_{A\'} = 2a - x_A$ et $y_{A\'} = 2b - y_A$. Par rapport à l\'origine O : $A\'(-x_A ; -y_A)$.' }
    ],
    methodes: [
      { titre: 'Construire le symétrique d\'un point $M$', etapes: ['Tracer la demi-droite $[MO)$.', 'Reporter au compas la longueur $OM$ de l\'autre côté de O.', 'Nommer $M\'$ le point obtenu : $OM\' = OM$ et $M$, O, $M\'$ sont alignés.'] }
    ],
    exemple: {
      enonce: 'Dans un repère, $\\Omega(1 ; 2)$ et $A(4 ; -1)$. Calculer les coordonnées du symétrique $A\'$ de $A$ par rapport à $\\Omega$.',
      solution: ['$\\Omega$ est le milieu de $[AA\']$.', '$x_{A\'} = 2 \\times 1 - 4 = -2$ et $y_{A\'} = 2 \\times 2 - (-1) = 5$.', 'Donc $A\'(-2 ; 5)$.']
    },
    erreurs: [
      'Confondre symétrie centrale et symétrie orthogonale (par rapport à une droite).',
      'Placer $M\'$ à une distance de O différente de $OM$.',
      'Penser que l\'image d\'une droite est perpendiculaire à la droite : elle lui est parallèle.'
    ],
    flashcards: [
      { q: '$M\'$ symétrique de $M$ par rapport à O signifie…', r: 'O est le milieu de $[MM\']$.' },
      { q: 'Image d\'une droite par une symétrie centrale ?', r: 'Une droite parallèle.' },
      { q: 'Que conserve la symétrie centrale ?', r: 'Longueurs, angles, aires, alignement, parallélisme.' },
      { q: 'Symétrique de $(3 ; -4)$ par rapport à O ?', r: '$(-3 ; 4)$' },
      { q: 'Centre de symétrie d\'un parallélogramme ?', r: 'Le point d\'intersection de ses diagonales.' }
    ],
    contexte: {
      titre: 'Le motif du pagne',
      enonce: 'Un tisserand de Saint-Louis dessine un motif sur un repère : le motif doit admettre le point $\\Omega(2 ; 1)$ comme centre de symétrie. Il a déjà placé un losange de sommets $(0 ; 0)$, $(1 ; 2)$, $(2 ; 0)$ et $(1 ; -2)$. Quelles sont les coordonnées des sommets du losange symétrique ?',
      solution: ['Le symétrique de $(x ; y)$ par rapport à $\\Omega(2 ; 1)$ est $(4 - x ; 2 - y)$.', 'On obtient $(4 ; 2)$, $(3 ; 0)$, $(2 ; 2)$ et $(3 ; 4)$.']
    }
  };

  EM.contenu['5e-angles'] = {
    resume: 'Angles adjacents, complémentaires, supplémentaires, opposés par le sommet ; angles formés par deux droites et une sécante, et lien avec le parallélisme.',
    objectifs: [
      'Reconnaître des angles adjacents, complémentaires, supplémentaires',
      'Utiliser l\'égalité des angles opposés par le sommet',
      'Reconnaître des angles alternes-internes, alternes-externes et correspondants',
      'Utiliser le parallélisme pour calculer des angles',
      'Démontrer que deux droites sont parallèles à l\'aide des angles'
    ],
    cours: [
      { type: 'definition', titre: 'Angles particuliers', texte: 'Deux angles sont <b>adjacents</b> s\'ils ont le même sommet, un côté commun, et sont situés de part et d\'autre de ce côté. Deux angles sont <b>complémentaires</b> si la somme de leurs mesures est $90°$, <b>supplémentaires</b> si elle vaut $180°$.' },
      { type: 'propriete', titre: 'Angles opposés par le sommet', texte: 'Deux droites sécantes forment des angles opposés par le sommet deux à deux : ces angles ont la même mesure.' },
      { type: 'definition', titre: 'Deux droites et une sécante', texte: 'Deux droites $(d_1)$ et $(d_2)$ coupées par une sécante $(\\Delta)$ forment huit angles. Deux angles situés de part et d\'autre de la sécante, entre les deux droites, sont <b>alternes-internes</b>. Deux angles situés de part et d\'autre de la sécante, à l\'extérieur des deux droites, sont <b>alternes-externes</b>. Deux angles situés du même côté de la sécante, l\'un entre les droites et l\'autre à l\'extérieur, « à la même place » à chaque intersection, sont <b>correspondants</b>.' },
      { type: 'theoreme', titre: 'Parallélisme et angles', texte: 'Si deux droites parallèles sont coupées par une sécante, alors les angles alternes-internes ont la même mesure, les angles alternes-externes ont la même mesure et les angles correspondants ont la même mesure.<br><b>Réciproque :</b> si deux droites coupées par une sécante forment deux angles alternes-internes (ou correspondants) de même mesure, alors ces droites sont parallèles.' }
    ],
    methodes: [
      { titre: 'Calculer un angle avec des parallèles', etapes: ['Repérer les deux droites parallèles et la sécante.', 'Identifier la position des angles : alternes-internes, correspondants, opposés par le sommet ou supplémentaires.', 'Citer la propriété utilisée puis conclure.'] }
    ],
    exemple: {
      enonce: 'Les droites $(d_1)$ et $(d_2)$ sont parallèles et coupées par une sécante. Un angle mesure $65°$. Quelle est la mesure de l\'angle qui lui est alterne-interne ? de l\'angle qui lui est adjacent supplémentaire ?',
      solution: ['Les droites sont parallèles : les angles alternes-internes ont la même mesure, soit $65°$.', 'Angle adjacent supplémentaire : $180° - 65° = 115°$.']
    },
    erreurs: [
      'Utiliser l\'égalité des angles alternes-internes alors que les droites ne sont pas parallèles.',
      'Confondre complémentaires ($90°$) et supplémentaires ($180°$).',
      'Confondre angles alternes-internes (de part et d\'autre de la sécante) et correspondants (du même côté).'
    ],
    flashcards: [
      { q: 'Angles complémentaires : somme ?', r: '$90°$' },
      { q: 'Angles supplémentaires : somme ?', r: '$180°$' },
      { q: 'Supplémentaire de $72°$ ?', r: '$108°$' },
      { q: 'Angles opposés par le sommet ?', r: 'Ils ont la même mesure.' },
      { q: 'Droites parallèles et sécante : angles alternes-internes ?', r: 'Ils ont la même mesure.' },
      { q: 'Comment prouver que deux droites sont parallèles avec des angles ?', r: 'Montrer que deux angles alternes-internes (ou correspondants) sont égaux.' }
    ],
    contexte: {
      titre: 'Les rails du TER',
      enonce: 'Les deux rails du TER sont parallèles. Une route les traverse en formant avec le premier rail un angle de $58°$. Quel angle forme-t-elle avec le second rail (angle correspondant) ? Et quel est l\'angle supplémentaire de cet angle ?',
      solution: ['Les rails sont parallèles : les angles correspondants sont égaux, donc la route forme un angle de $58°$ avec le second rail.', 'L\'angle supplémentaire mesure $180° - 58° = 122°$.']
    }
  };

  EM.contenu['5e-triangles'] = {
    resume: 'Somme des angles d\'un triangle, triangles particuliers, inégalité triangulaire et droites remarquables (médiatrices, hauteurs, médianes, bissectrices).',
    objectifs: [
      'Utiliser la somme des angles d\'un triangle pour calculer un angle',
      'Connaître les angles des triangles isocèle, équilatéral et rectangle',
      'Utiliser l\'inégalité triangulaire pour savoir si un triangle est constructible',
      'Construire les médiatrices, hauteurs, médianes et bissectrices d\'un triangle',
      'Connaître le cercle circonscrit et ses propriétés'
    ],
    cours: [
      { type: 'theoreme', titre: 'Somme des angles', texte: 'Dans tout triangle $ABC$, la somme des mesures des trois angles est égale à $180°$ : $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180°$.' },
      { type: 'propriete', titre: 'Triangles particuliers', texte: 'Dans un triangle <b>isocèle</b>, les deux angles à la base ont la même mesure. Dans un triangle <b>équilatéral</b>, chaque angle mesure $60°$. Dans un triangle <b>rectangle</b>, les deux angles aigus sont complémentaires (leur somme fait $90°$).' },
      { type: 'propriete', titre: 'Inégalité triangulaire', texte: 'Dans un triangle, la longueur de chaque côté est strictement inférieure à la somme des longueurs des deux autres. Pour savoir si un triangle de côtés $a \\leq b \\leq c$ est constructible, il suffit de vérifier $c < a + b$. Si $c = a + b$, les trois points sont alignés.' },
      { type: 'definition', titre: 'Droites remarquables', texte: 'La <b>médiatrice</b> d\'un côté est la droite perpendiculaire à ce côté en son milieu. La <b>hauteur</b> issue d\'un sommet est la droite passant par ce sommet et perpendiculaire au côté opposé. La <b>médiane</b> issue d\'un sommet joint ce sommet au milieu du côté opposé. La <b>bissectrice</b> d\'un angle le partage en deux angles de même mesure.' },
      { type: 'propriete', titre: 'Points de concours', texte: 'Les trois médiatrices sont concourantes en un point équidistant des trois sommets : le centre du <b>cercle circonscrit</b>. Les trois hauteurs se coupent en l\'<b>orthocentre</b>, les trois médianes au <b>centre de gravité</b> et les trois bissectrices au centre du <b>cercle inscrit</b>.' }
    ],
    methodes: [
      { titre: 'Calculer un angle dans un triangle', etapes: ['Repérer les angles connus et la nature du triangle (isocèle ? rectangle ?).', 'Utiliser l\'égalité des angles à la base si le triangle est isocèle.', 'Appliquer $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180°$.'] }
    ],
    exemple: {
      enonce: 'Le triangle $ABC$ est isocèle en $A$ et $\\widehat{BAC} = 40°$. Calculer $\\widehat{ABC}$.',
      solution: ['Le triangle est isocèle en $A$, donc $\\widehat{ABC} = \\widehat{ACB}$.', '$2\\,\\widehat{ABC} = 180° - 40° = 140°$, donc $\\widehat{ABC} = 70°$.']
    },
    erreurs: [
      'Dans un triangle isocèle en $A$, croire que l\'angle en $A$ est égal à un angle à la base.',
      'Oublier de vérifier l\'inégalité triangulaire avant de construire.',
      'Confondre médiane (passe par le milieu) et médiatrice (perpendiculaire au milieu).'
    ],
    flashcards: [
      { q: 'Somme des angles d\'un triangle ?', r: '$180°$' },
      { q: 'Angles d\'un triangle équilatéral ?', r: '$60°$ chacun' },
      { q: 'Triangle rectangle avec un angle de $35°$ : l\'autre angle aigu ?', r: '$55°$' },
      { q: 'Un triangle de côtés $3$, $4$, $8$ existe-t-il ?', r: 'Non : $8 > 3 + 4$.' },
      { q: 'Centre du cercle circonscrit ?', r: 'Point de concours des médiatrices.' },
      { q: 'Hauteur issue de $A$ ?', r: 'Droite passant par $A$, perpendiculaire à $(BC)$.' }
    ],
    contexte: {
      titre: 'La charpente d\'une case',
      enonce: 'Le pignon d\'une case de Casamance a la forme d\'un triangle isocèle. Les deux pentes du toit forment avec la poutre horizontale un angle de $35°$. Quel est l\'angle au sommet du toit ?',
      solution: ['Les deux angles à la base mesurent $35°$.', 'Angle au sommet : $180° - 2 \\times 35° = 110°$.']
    }
  };

  EM.contenu['5e-parallelogrammes'] = {
    resume: 'Le parallélogramme et ses propriétés (côtés, diagonales, angles, centre de symétrie), puis les parallélogrammes particuliers : rectangle, losange, carré.',
    objectifs: [
      'Connaître la définition et les propriétés du parallélogramme',
      'Démontrer qu\'un quadrilatère est un parallélogramme',
      'Reconnaître un rectangle, un losange, un carré par leurs propriétés',
      'Calculer des longueurs et des angles dans un parallélogramme',
      'Calculer l\'aire d\'un parallélogramme'
    ],
    cours: [
      { type: 'definition', titre: 'Parallélogramme', texte: 'Un <b>parallélogramme</b> est un quadrilatère dont les côtés opposés sont parallèles deux à deux.' },
      { type: 'propriete', titre: 'Propriétés', texte: 'Si $ABCD$ est un parallélogramme, alors : ses diagonales $[AC]$ et $[BD]$ ont le même milieu, qui est son centre de symétrie ; ses côtés opposés ont la même longueur ; ses angles opposés ont la même mesure ; deux angles consécutifs sont supplémentaires.' },
      { type: 'theoreme', titre: 'Reconnaître un parallélogramme', texte: 'Un quadrilatère (non croisé) est un parallélogramme si l\'une des conditions suivantes est vérifiée : ses diagonales ont le même milieu ; ses côtés opposés sont parallèles deux à deux ; ses côtés opposés ont la même longueur deux à deux ; deux côtés opposés sont parallèles et de même longueur.' },
      { type: 'propriete', titre: 'Parallélogrammes particuliers', texte: 'Un <b>rectangle</b> est un parallélogramme qui a un angle droit ; ses diagonales ont la même longueur. Un <b>losange</b> est un parallélogramme qui a deux côtés consécutifs de même longueur ; ses diagonales sont perpendiculaires. Un <b>carré</b> est à la fois un rectangle et un losange.' },
      { type: 'formule', titre: 'Aire', texte: 'L\'aire d\'un parallélogramme de base $b$ et de hauteur associée $h$ est $\\mathcal{A} = b \\times h$. L\'aire d\'un losange de diagonales $D$ et $d$ est $\\mathcal{A} = \\dfrac{D \\times d}{2}$.' }
    ],
    methodes: [
      { titre: 'Démontrer qu\'un quadrilatère est un parallélogramme particulier', etapes: ['Montrer d\'abord que c\'est un parallélogramme (diagonales de même milieu, côtés opposés parallèles…).', 'Ajouter une propriété : angle droit ou diagonales de même longueur → rectangle ; côtés consécutifs égaux ou diagonales perpendiculaires → losange.', 'Les deux à la fois → carré.'] }
    ],
    exemple: {
      enonce: '$ABCD$ est un parallélogramme avec $\\widehat{DAB} = 75°$. Calculer les autres angles.',
      solution: ['Les angles opposés sont égaux : $\\widehat{BCD} = 75°$.', 'Deux angles consécutifs sont supplémentaires : $\\widehat{ABC} = 180° - 75° = 105°$, et $\\widehat{CDA} = 105°$.']
    },
    erreurs: [
      'Croire que les diagonales d\'un parallélogramme quelconque ont la même longueur (c\'est vrai seulement pour le rectangle).',
      'Croire que les diagonales d\'un parallélogramme sont perpendiculaires (seulement pour le losange).',
      'Utiliser un côté oblique au lieu de la hauteur pour calculer l\'aire.'
    ],
    flashcards: [
      { q: 'Diagonales d\'un parallélogramme ?', r: 'Elles ont le même milieu.' },
      { q: 'Parallélogramme + angle droit = ?', r: 'Rectangle' },
      { q: 'Parallélogramme + diagonales perpendiculaires = ?', r: 'Losange' },
      { q: 'Angles consécutifs d\'un parallélogramme ?', r: 'Supplémentaires' },
      { q: 'Aire d\'un losange de diagonales $8$ et $5$ ?', r: '$20$' },
      { q: 'Rectangle + losange = ?', r: 'Carré' }
    ],
    contexte: {
      titre: 'Le champ de mil',
      enonce: 'Un champ de mil près de Kaffrine a la forme d\'un parallélogramme de base $120$ m et de hauteur $45$ m. Le cultivateur sème $25$ kg de semences par hectare. Quelle masse de semences lui faut-il ? (1 ha $= 10\\,000$ m²)',
      solution: ['Aire : $120 \\times 45 = 5\\,400$ m², soit $0{,}54$ ha.', 'Semences : $0{,}54 \\times 25 = 13{,}5$ kg.']
    }
  };

  EM.contenu['5e-prisme-cylindre'] = {
    resume: 'Décrire et représenter un prisme droit et un cylindre de révolution, construire leurs patrons, calculer leurs aires latérales et leurs volumes.',
    objectifs: [
      'Reconnaître un prisme droit et un cylindre de révolution et nommer leurs éléments',
      'Représenter ces solides en perspective cavalière et tracer leur patron',
      'Calculer l\'aire latérale et l\'aire totale',
      'Calculer le volume d\'un prisme droit et d\'un cylindre',
      'Convertir des unités de volume et de capacité'
    ],
    cours: [
      { type: 'definition', titre: 'Prisme droit', texte: 'Un prisme droit est un solide dont deux faces, les <b>bases</b>, sont des polygones superposables situés dans des plans parallèles, et dont les autres faces, les <b>faces latérales</b>, sont des rectangles. La longueur d\'une arête latérale est la <b>hauteur</b> du prisme.' },
      { type: 'definition', titre: 'Cylindre de révolution', texte: 'Un cylindre de révolution est obtenu en faisant tourner un rectangle autour d\'un de ses côtés. Ses deux bases sont des disques de même rayon $r$ ; sa hauteur $h$ est la distance entre les bases. Son patron est formé de deux disques et d\'un rectangle de dimensions $2\\pi r$ et $h$.' },
      { type: 'formule', titre: 'Aires', texte: 'Aire latérale d\'un prisme droit : $\\mathcal{A}_\\ell = \\text{périmètre de la base} \\times h$. Aire latérale d\'un cylindre : $\\mathcal{A}_\\ell = 2\\pi r h$. Aire totale = aire latérale + aire des deux bases.' },
      { type: 'formule', titre: 'Volumes', texte: 'Pour un prisme droit comme pour un cylindre : $V = \\mathcal{B} \\times h$ où $\\mathcal{B}$ est l\'aire d\'une base. Pour le cylindre : $V = \\pi r^2 h$.' },
      { type: 'remarque', titre: 'Unités', texte: '$1$ dm³ $= 1$ L et $1$ m³ $= 1\\,000$ L ; $1$ cm³ $= 1$ mL. Pour passer d\'une unité de volume à la suivante, on multiplie ou on divise par $1\\,000$.' }
    ],
    methodes: [
      { titre: 'Calculer le volume d\'un prisme droit', etapes: ['Identifier la base (attention : elle n\'est pas forcément « en bas »).', 'Calculer l\'aire de la base (triangle, rectangle, trapèze…).', 'Multiplier par la hauteur du prisme, avec des unités cohérentes.'] }
    ],
    exemple: {
      enonce: 'Un prisme droit a pour base un triangle rectangle dont les côtés de l\'angle droit mesurent $6$ cm et $8$ cm. Sa hauteur est $15$ cm. Calculer son volume.',
      solution: ['Aire de la base : $\\dfrac{6 \\times 8}{2} = 24$ cm².', 'Volume : $24 \\times 15 = 360$ cm³.']
    },
    erreurs: [
      'Utiliser le diamètre à la place du rayon dans $\\pi r^2 h$.',
      'Oublier d\'élever le rayon au carré.',
      'Confondre hauteur du prisme et hauteur du triangle de base.',
      'Mélanger les unités (cm et m) dans un même calcul.'
    ],
    flashcards: [
      { q: 'Volume d\'un prisme droit ?', r: '$V = \\mathcal{B} \\times h$' },
      { q: 'Volume d\'un cylindre ?', r: '$V = \\pi r^2 h$' },
      { q: 'Aire latérale d\'un cylindre ?', r: '$2\\pi r h$' },
      { q: '$1$ m³ en litres ?', r: '$1\\,000$ L' },
      { q: 'Faces latérales d\'un prisme droit ?', r: 'Des rectangles' },
      { q: 'Patron d\'un cylindre ?', r: 'Deux disques et un rectangle de longueur $2\\pi r$.' }
    ],
    contexte: {
      titre: 'Le château d\'eau du village',
      enonce: 'Le réservoir d\'un forage près de Linguère est un cylindre de rayon $2$ m et de hauteur $3$ m. Combien de litres d\'eau peut-il contenir ? Arrondir au litre.',
      solution: ['$V = \\pi r^2 h = \\pi \\times 2^2 \\times 3 = 12\\pi$ m³.', '$12\\pi \\approx 37{,}699$ m³, soit environ $37\\,699$ L.']
    }
  };

  /* =============================== 4e =============================== */

  EM.contenu['4e-rationnels'] = {
    resume: 'L\'ensemble $\\Q$ des nombres rationnels réunit les quotients d\'entiers relatifs. On y calcule avec les fractions de signe quelconque en respectant les priorités.',
    objectifs: [
      'Reconnaître un nombre rationnel et connaître les ensembles $\\N$, $\\Z$, $\\D$, $\\Q$',
      'Simplifier et comparer des rationnels',
      'Additionner, soustraire, multiplier et diviser des rationnels de signes quelconques',
      'Calculer une expression avec des fractions en respectant les priorités',
      'Donner le résultat sous forme irréductible'
    ],
    cours: [
      { type: 'definition', titre: 'Nombre rationnel', texte: 'Un nombre <b>rationnel</b> est un nombre qui peut s\'écrire $\\dfrac{a}{b}$ avec $a$ et $b$ entiers relatifs, $b \\neq 0$. L\'ensemble des rationnels se note $\\Q$. On a $\\N \\subset \\Z \\subset \\D \\subset \\Q$ : $5$, $-3$, $0{,}75 = \\dfrac{3}{4}$, $-\\dfrac{2}{7}$ sont rationnels.' },
      { type: 'propriete', titre: 'Signe d\'un quotient', texte: '$\\dfrac{-a}{b} = \\dfrac{a}{-b} = -\\dfrac{a}{b}$ et $\\dfrac{-a}{-b} = \\dfrac{a}{b}$. On écrit toujours un rationnel avec un dénominateur positif.' },
      { type: 'formule', titre: 'Opérations dans $\\Q$', texte: '$\\dfrac{a}{b} + \\dfrac{c}{d} = \\dfrac{ad + bc}{bd}$ ; $\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$ ; $\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$ (avec $c \\neq 0$). En pratique, pour additionner on réduit au plus petit dénominateur commun.' },
      { type: 'propriete', titre: 'Inverse', texte: 'Tout rationnel non nul $x$ a un inverse $\\dfrac{1}{x}$ tel que $x \\times \\dfrac{1}{x} = 1$. L\'inverse de $\\dfrac{a}{b}$ est $\\dfrac{b}{a}$ ; un nombre et son inverse ont le même signe. Ne pas confondre inverse et opposé : l\'opposé de $\\dfrac{2}{3}$ est $-\\dfrac{2}{3}$, son inverse est $\\dfrac{3}{2}$.' },
      { type: 'remarque', titre: 'Écriture d\'une fraction composée', texte: '$\\dfrac{\\;\\dfrac{a}{b}\\;}{\\;\\dfrac{c}{d}\\;} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$. On calcule séparément le numérateur et le dénominateur, puis on divise.' }
    ],
    methodes: [
      { titre: 'Calculer une expression fractionnaire', etapes: ['Repérer les priorités (parenthèses, puis × et ÷, puis + et −).', 'Simplifier avant de multiplier quand c\'est possible.', 'Réduire au même dénominateur pour les sommes.', 'Donner le résultat sous forme irréductible, avec un dénominateur positif.'] }
    ],
    exemple: {
      enonce: 'Calculer $C = \\left(\\dfrac{2}{3} - \\dfrac{5}{4}\\right) \\div \\dfrac{-7}{6}$.',
      solution: ['$\\dfrac{2}{3} - \\dfrac{5}{4} = \\dfrac{8}{12} - \\dfrac{15}{12} = -\\dfrac{7}{12}$.', '$C = -\\dfrac{7}{12} \\times \\dfrac{6}{-7} = \\dfrac{-7 \\times 6}{12 \\times (-7)} = \\dfrac{6}{12} = \\dfrac{1}{2}$.']
    },
    erreurs: [
      'Perdre un signe « − » placé devant une fraction.',
      'Confondre l\'inverse et l\'opposé d\'un nombre.',
      'Additionner avant de multiplier sans respecter les priorités.',
      'Laisser un dénominateur négatif ou une fraction non simplifiée.'
    ],
    flashcards: [
      { q: 'Inverse de $-\\dfrac{3}{5}$ ?', r: '$-\\dfrac{5}{3}$' },
      { q: 'Opposé de $-\\dfrac{3}{5}$ ?', r: '$\\dfrac{3}{5}$' },
      { q: '$-\\dfrac{1}{2} + \\dfrac{1}{3} = ?$', r: '$-\\dfrac{1}{6}$' },
      { q: '$\\dfrac{-4}{9} \\times \\dfrac{3}{-2} = ?$', r: '$\\dfrac{2}{3}$' },
      { q: '$\\dfrac{3}{4} \\div \\left(-\\dfrac{9}{8}\\right) = ?$', r: '$-\\dfrac{2}{3}$' },
      { q: '$0{,}125$ sous forme de fraction ?', r: '$\\dfrac{1}{8}$' }
    ],
    contexte: {
      titre: 'Le budget de la Tabaski',
      enonce: 'Pour la Tabaski, la famille de Babacar consacre $\\dfrac{2}{5}$ de son budget au mouton, $\\dfrac{1}{4}$ aux habits et $\\dfrac{1}{6}$ aux condiments. Le reste, soit $55\\,000$ F CFA, est épargné. Quel est le budget total ?',
      solution: ['Fraction dépensée : $\\dfrac{2}{5} + \\dfrac{1}{4} + \\dfrac{1}{6} = \\dfrac{24}{60} + \\dfrac{15}{60} + \\dfrac{10}{60} = \\dfrac{49}{60}$.', 'Fraction épargnée : $1 - \\dfrac{49}{60} = \\dfrac{11}{60}$.', 'Budget : $55\\,000 \\div \\dfrac{11}{60} = 55\\,000 \\times \\dfrac{60}{11} = 300\\,000$ F CFA.']
    }
  };

  EM.contenu['4e-puissances'] = {
    resume: 'Puissances d\'exposant entier relatif, règles de calcul, puissances de 10 et écriture scientifique pour manipuler les très grands et les très petits nombres.',
    objectifs: [
      'Connaître la définition de $a^n$ et de $a^{-n}$',
      'Appliquer les règles de calcul sur les puissances',
      'Calculer avec les puissances de 10',
      'Écrire un nombre en notation scientifique',
      'Déterminer un ordre de grandeur'
    ],
    cours: [
      { type: 'definition', titre: 'Puissance d\'un nombre', texte: 'Pour tout nombre $a$ et tout entier $n \\geq 1$ : $a^n = a \\times a \\times \\dots \\times a$ ($n$ facteurs). Par convention $a^0 = 1$ (pour $a \\neq 0$), et pour $a \\neq 0$, $a^{-n} = \\dfrac{1}{a^n}$. Exemples : $2^5 = 32$ ; $5^{-2} = \\dfrac{1}{25}$.' },
      { type: 'propriete', titre: 'Signe', texte: 'Une puissance d\'un nombre négatif est positive si l\'exposant est pair, négative s\'il est impair : $(-2)^4 = 16$, $(-2)^3 = -8$. Attention : $-2^4 = -16$ car l\'exposant ne porte que sur $2$.' },
      { type: 'formule', titre: 'Règles de calcul', texte: 'Pour $a$, $b$ non nuls et $m$, $n$ entiers relatifs : $$a^m \\times a^n = a^{m+n} \\qquad \\dfrac{a^m}{a^n} = a^{m-n} \\qquad (a^m)^n = a^{m \\times n}$$ $$(ab)^n = a^n b^n \\qquad \\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}$$' },
      { type: 'propriete', titre: 'Puissances de 10', texte: '$10^n = 1\\underbrace{0\\dots0}_{n}$ et $10^{-n} = 0{,}\\underbrace{0\\dots0}_{n-1}1$. Multiplier par $10^n$ décale la virgule de $n$ rangs vers la droite ; multiplier par $10^{-n}$, de $n$ rangs vers la gauche.' },
      { type: 'definition', titre: 'Écriture scientifique', texte: 'Tout nombre décimal non nul $x$ s\'écrit de façon unique $x = a \\times 10^p$ avec $1 \\leq |a| < 10$ et $p$ entier relatif. Exemples : $345\\,000 = 3{,}45 \\times 10^5$ ; $0{,}0072 = 7{,}2 \\times 10^{-3}$.' }
    ],
    methodes: [
      { titre: 'Donner l\'écriture scientifique d\'un produit', etapes: ['Regrouper les nombres décimaux d\'un côté et les puissances de 10 de l\'autre.', 'Calculer chaque groupe avec les règles $10^m \\times 10^n = 10^{m+n}$ et $\\dfrac{10^m}{10^n} = 10^{m-n}$.', 'Ajuster pour que le nombre décimal soit entre 1 et 10 (exclu), en modifiant l\'exposant.'] }
    ],
    exemple: {
      enonce: 'Donner l\'écriture scientifique de $D = \\dfrac{6 \\times 10^{4} \\times 5 \\times 10^{-7}}{4 \\times 10^{-2}}$.',
      solution: ['$D = \\dfrac{6 \\times 5}{4} \\times \\dfrac{10^{4} \\times 10^{-7}}{10^{-2}} = 7{,}5 \\times 10^{4 - 7 + 2}$.', '$D = 7{,}5 \\times 10^{-1}$ (soit $0{,}75$).']
    },
    erreurs: [
      'Multiplier les exposants au lieu de les additionner : $a^3 \\times a^4 = a^7$, pas $a^{12}$.',
      'Croire que $a^{-2}$ est négatif : $3^{-2} = \\dfrac{1}{9} > 0$.',
      'Confondre $(-3)^2 = 9$ et $-3^2 = -9$.',
      'Écrire $45 \\times 10^3$ comme écriture scientifique : il faut $4{,}5 \\times 10^4$.'
    ],
    flashcards: [
      { q: '$a^m \\times a^n = ?$', r: '$a^{m+n}$' },
      { q: '$(a^m)^n = ?$', r: '$a^{mn}$' },
      { q: '$2^{-3} = ?$', r: '$\\dfrac{1}{8}$' },
      { q: '$(-1)^{15} = ?$', r: '$-1$' },
      { q: 'Écriture scientifique de $0{,}00056$ ?', r: '$5{,}6 \\times 10^{-4}$' },
      { q: '$10^5 \\times 10^{-8} = ?$', r: '$10^{-3}$' },
      { q: '$7^0 = ?$', r: '$1$' }
    ],
    contexte: {
      titre: 'Les grains de mil',
      enonce: 'Un grain de mil pèse environ $8 \\times 10^{-3}$ g. Un grenier de Kolda contient $2{,}4 \\times 10^{6}$ g de mil. Combien de grains environ contient-il ? Donner l\'écriture scientifique.',
      solution: ['Nombre de grains : $\\dfrac{2{,}4 \\times 10^{6}}{8 \\times 10^{-3}} = 0{,}3 \\times 10^{6 + 3} = 0{,}3 \\times 10^{9}$.', 'Écriture scientifique : $3 \\times 10^{8}$ grains, soit $300$ millions de grains.']
    }
  };

  EM.contenu['4e-calcul-litteral'] = {
    resume: 'Développer un produit, réduire, et factoriser une expression grâce à la distributivité simple et double.',
    objectifs: [
      'Développer et réduire avec la distributivité simple $k(a + b)$',
      'Développer et réduire avec la double distributivité $(a + b)(c + d)$',
      'Supprimer des parenthèses précédées d\'un signe −',
      'Factoriser une expression par un facteur commun',
      'Calculer la valeur d\'une expression pour une valeur de la variable'
    ],
    cours: [
      { type: 'propriete', titre: 'Distributivité simple', texte: 'Pour tous nombres $k$, $a$, $b$ : $k(a + b) = ka + kb$ et $k(a - b) = ka - kb$.' },
      { type: 'propriete', titre: 'Double distributivité', texte: 'Pour tous nombres $a$, $b$, $c$, $d$ : $$(a + b)(c + d) = ac + ad + bc + bd$$ Chaque terme de la première parenthèse multiplie chaque terme de la seconde. Exemple : $(2x - 3)(x + 5) = 2x^2 + 10x - 3x - 15 = 2x^2 + 7x - 15$.' },
      { type: 'definition', titre: 'Développer, réduire, factoriser', texte: '<b>Développer</b> : transformer un produit en somme. <b>Réduire</b> : regrouper les termes semblables. <b>Factoriser</b> : transformer une somme en produit. Exemple : $3x^2 - 12x = 3x(x - 4)$.' },
      { type: 'propriete', titre: 'Facteur commun', texte: 'Si une somme s\'écrit $ka + kb$, alors $ka + kb = k(a + b)$. Le facteur commun peut être une expression entière : $(x + 1)(2x - 3) + (x + 1)(x + 4) = (x + 1)\\left[(2x - 3) + (x + 4)\\right] = (x + 1)(3x + 1)$.' },
      { type: 'remarque', titre: 'Vérifier un résultat', texte: 'On peut contrôler un développement ou une factorisation en remplaçant $x$ par une valeur simple (par exemple $x = 1$ ou $x = 2$) dans les deux écritures : elles doivent donner le même nombre.' }
    ],
    methodes: [
      { titre: 'Développer $(a + b)(c + d)$', etapes: ['Multiplier $a$ par $c$ puis par $d$.', 'Multiplier $b$ par $c$ puis par $d$, en gardant les signes.', 'Réduire en regroupant les termes en $x^2$, en $x$ et les constantes.'] },
      { titre: 'Factoriser avec un facteur commun', etapes: ['Souligner dans chaque terme le facteur qui se répète.', 'L\'écrire devant un crochet.', 'Écrire dans le crochet ce qui reste, puis réduire l\'intérieur.'] }
    ],
    exemple: {
      enonce: 'Développer et réduire $F = (3x - 2)(x + 4) - 2(x^2 - 5)$.',
      solution: ['$(3x - 2)(x + 4) = 3x^2 + 12x - 2x - 8 = 3x^2 + 10x - 8$.', '$-2(x^2 - 5) = -2x^2 + 10$.', '$F = 3x^2 + 10x - 8 - 2x^2 + 10 = x^2 + 10x + 2$.']
    },
    erreurs: [
      'Oublier un des quatre produits dans la double distributivité.',
      'Se tromper de signe : $(x - 3)(x - 2)$ contient $+6$, car $(-3) \\times (-2) = 6$.',
      'Écrire $x \\times x = 2x$ au lieu de $x^2$.',
      'Factoriser incomplètement : $6x + 12 = 2(3x + 6)$ est juste mais $6(x + 2)$ est mieux.'
    ],
    flashcards: [
      { q: 'Développer $(x + 2)(x + 3)$', r: '$x^2 + 5x + 6$' },
      { q: 'Développer $(x - 4)(x + 1)$', r: '$x^2 - 3x - 4$' },
      { q: 'Factoriser $5x^2 + 15x$', r: '$5x(x + 3)$' },
      { q: 'Développer $-3(2x - 1)$', r: '$-6x + 3$' },
      { q: 'Développer, c\'est transformer…', r: 'un produit en somme.' },
      { q: 'Factoriser $(x+1)\\cdot 2 + (x+1) \\cdot x$', r: '$(x + 1)(x + 2)$' }
    ],
    contexte: {
      titre: 'Agrandir le jardin maraîcher',
      enonce: 'Dans les Niayes, Khady cultive des oignons sur un jardin carré de côté $x$ mètres. Elle allonge un côté de $5$ m et l\'autre de $3$ m. Exprimer l\'aire du nouveau jardin sous forme développée, puis l\'augmentation d\'aire.',
      solution: ['Nouvelle aire : $(x + 5)(x + 3) = x^2 + 3x + 5x + 15 = x^2 + 8x + 15$.', 'Augmentation : $x^2 + 8x + 15 - x^2 = 8x + 15$ m².']
    }
  };

  EM.contenu['4e-equations'] = {
    resume: 'Résoudre une équation ou une inéquation du premier degré à une inconnue, représenter l\'ensemble des solutions et mettre un problème en équation.',
    objectifs: [
      'Tester si un nombre est solution d\'une équation ou d\'une inéquation',
      'Résoudre une équation du type $ax + b = cx + d$',
      'Résoudre une équation produit simple $(ax + b)(cx + d) = 0$',
      'Résoudre une inéquation du premier degré et écrire l\'ensemble des solutions sous forme d\'intervalle',
      'Mettre en équation et résoudre un problème'
    ],
    cours: [
      { type: 'propriete', titre: 'Règles de transformation d\'une égalité', texte: 'On obtient une équation équivalente (qui a les mêmes solutions) en ajoutant ou en soustrayant un même nombre aux deux membres, ou en multipliant ou divisant les deux membres par un même nombre <b>non nul</b>.' },
      { type: 'propriete', titre: 'Équation $ax = b$', texte: 'Si $a \\neq 0$, l\'équation $ax = b$ a une unique solution $x = \\dfrac{b}{a}$. Exemple : $-4x = 10$ donne $x = -\\dfrac{5}{2}$, donc $S = \\left\\{ -\\dfrac{5}{2} \\right\\}$.' },
      { type: 'theoreme', titre: 'Produit nul', texte: 'Un produit de facteurs est nul si et seulement si l\'un au moins de ses facteurs est nul : $A \\times B = 0 \\iff A = 0$ ou $B = 0$.' },
      { type: 'propriete', titre: 'Règles pour les inégalités', texte: 'On ne change pas le sens d\'une inégalité en ajoutant ou en soustrayant un même nombre, ni en multipliant ou divisant par un même nombre <b>strictement positif</b>. On <b>change le sens</b> de l\'inégalité quand on multiplie ou divise par un nombre <b>strictement négatif</b> : $-3x < 6 \\iff x > -2$.' },
      { type: 'definition', titre: 'Intervalles', texte: 'L\'ensemble des nombres $x$ tels que $x > 3$ se note $]3 ; +\\infty[$ ; tels que $x \\leq -1$ : $]-\\infty ; -1]$. Le crochet est tourné vers l\'extérieur quand la borne est exclue. Sur une droite graduée, on hachure la partie qui ne convient pas.' }
    ],
    methodes: [
      { titre: 'Résoudre $ax + b = cx + d$', etapes: ['Regrouper les termes en $x$ dans un membre (soustraire $cx$).', 'Regrouper les constantes dans l\'autre membre (soustraire $b$).', 'Diviser par le coefficient de $x$, puis écrire $S = \\{\\dots\\}$.', 'Vérifier en remplaçant $x$ par la solution trouvée.'] },
      { titre: 'Résoudre une inéquation', etapes: ['Procéder comme pour une équation.', 'Au moment de diviser par le coefficient de $x$, regarder son signe : s\'il est négatif, changer le sens de l\'inégalité.', 'Écrire l\'ensemble des solutions sous forme d\'intervalle.'] }
    ],
    exemple: {
      enonce: 'Résoudre l\'inéquation $5 - 2x \\geq 3x + 20$.',
      solution: ['$-2x - 3x \\geq 20 - 5$, soit $-5x \\geq 15$.', 'On divise par $-5 < 0$ : on change le sens, $x \\leq -3$.', '$S = ]-\\infty ; -3]$.']
    },
    erreurs: [
      'Oublier de changer le sens de l\'inégalité en divisant par un nombre négatif.',
      'Passer un terme dans l\'autre membre sans changer son signe.',
      'Diviser par le coefficient au lieu de le soustraire (ou l\'inverse) : de $x + 3 = 7$ on tire $x = 4$, de $3x = 7$ on tire $x = \\dfrac{7}{3}$.',
      'Mettre le crochet du mauvais côté pour une borne exclue.'
    ],
    flashcards: [
      { q: 'Résoudre $3x - 7 = 8$', r: '$x = 5$' },
      { q: 'Résoudre $-2x = 9$', r: '$x = -\\dfrac{9}{2}$' },
      { q: '$A \\times B = 0$ équivaut à…', r: '$A = 0$ ou $B = 0$' },
      { q: 'Résoudre $-x > 4$', r: '$x < -4$, $S = ]-\\infty ; -4[$' },
      { q: 'Intervalle des $x$ tels que $x \\geq 2$ ?', r: '$[2 ; +\\infty[$' },
      { q: 'Solutions de $(x - 3)(2x + 1) = 0$ ?', r: '$3$ et $-\\dfrac{1}{2}$' }
    ],
    contexte: {
      titre: 'Le tarif du taxi-moto à Ziguinchor',
      enonce: 'À Ziguinchor, un conducteur de taxi-moto propose deux tarifs : tarif A, $200$ F CFA par kilomètre ; tarif B, $500$ F CFA de prise en charge plus $150$ F CFA par kilomètre. À partir de quelle distance le tarif B est-il strictement plus avantageux ?',
      solution: ['Pour $x$ km : tarif A $= 200x$, tarif B $= 500 + 150x$.', 'On résout $500 + 150x < 200x$ : $500 < 50x$, donc $x > 10$.', 'Le tarif B est plus avantageux au-delà de $10$ km.']
    }
  };

  EM.contenu['4e-applications-lineaires'] = {
    resume: 'Une application linéaire $f : x \\mapsto ax$ traduit une situation de proportionnalité ; sa représentation graphique est une droite passant par l\'origine.',
    objectifs: [
      'Reconnaître une application linéaire et déterminer son coefficient',
      'Calculer une image et un antécédent',
      'Représenter graphiquement une application linéaire dans un repère',
      'Lier application linéaire, proportionnalité et pourcentages',
      'Déterminer une application linéaire à partir d\'un nombre et de son image'
    ],
    cours: [
      { type: 'definition', titre: 'Application linéaire', texte: 'Soit $a$ un nombre. L\'application qui à tout nombre $x$ associe le nombre $ax$ est l\'<b>application linéaire de coefficient $a$</b> ; on note $f : x \\mapsto ax$ ou $f(x) = ax$. Le nombre $f(x)$ est l\'<b>image</b> de $x$ ; $x$ est un <b>antécédent</b> de $f(x)$.' },
      { type: 'propriete', titre: 'Coefficient', texte: 'Si $f$ est linéaire et $x_0 \\neq 0$, alors son coefficient est $a = \\dfrac{f(x_0)}{x_0}$. Exemple : si $f(4) = 10$, alors $a = \\dfrac{10}{4} = 2{,}5$ et $f(x) = 2{,}5x$.' },
      { type: 'propriete', titre: 'Antécédent', texte: 'Si $a \\neq 0$, l\'antécédent d\'un nombre $y$ par $f : x \\mapsto ax$ est la solution de $ax = y$, c\'est-à-dire $x = \\dfrac{y}{a}$.' },
      { type: 'propriete', titre: 'Représentation graphique', texte: 'Dans un repère (O, I, J), la représentation graphique d\'une application linéaire est une <b>droite passant par l\'origine</b> O. Le coefficient $a$ est son coefficient directeur : il suffit de placer le point de coordonnées $(1 ; a)$ (ou un autre point) et de le joindre à O.' },
      { type: 'propriete', titre: 'Propriétés de linéarité', texte: 'Pour tous nombres $x$, $x\'$ et $k$ : $f(x + x\') = f(x) + f(x\')$ et $f(kx) = k\\,f(x)$. Un pourcentage est une application linéaire : augmenter de $t$ % revient à appliquer $x \\mapsto \\left(1 + \\dfrac{t}{100}\\right)x$.' }
    ],
    methodes: [
      { titre: 'Déterminer une application linéaire', etapes: ['Écrire $f(x) = ax$.', 'Utiliser la donnée $f(x_0) = y_0$ : $a = \\dfrac{y_0}{x_0}$.', 'Écrire l\'expression de $f$ et vérifier sur la donnée.'] }
    ],
    exemple: {
      enonce: '$f$ est l\'application linéaire telle que $f(-3) = 12$. Déterminer $f(x)$, l\'image de $5$ et l\'antécédent de $-6$.',
      solution: ['$a = \\dfrac{12}{-3} = -4$, donc $f(x) = -4x$.', '$f(5) = -4 \\times 5 = -20$.', '$-4x = -6$ donne $x = \\dfrac{3}{2}$ : l\'antécédent de $-6$ est $\\dfrac{3}{2}$.']
    },
    erreurs: [
      'Confondre image et antécédent : l\'image se calcule en multipliant par $a$, l\'antécédent en divisant par $a$.',
      'Calculer le coefficient « à l\'envers » : $a = \\dfrac{x_0}{f(x_0)}$ est faux.',
      'Tracer une droite qui ne passe pas par l\'origine pour une application linéaire.'
    ],
    flashcards: [
      { q: 'Forme d\'une application linéaire ?', r: '$f(x) = ax$' },
      { q: '$f(x) = 3x$ : image de $-2$ ?', r: '$-6$' },
      { q: '$f(x) = 3x$ : antécédent de $12$ ?', r: '$4$' },
      { q: '$f(5) = 15$, coefficient ?', r: '$3$' },
      { q: 'Représentation graphique ?', r: 'Une droite passant par l\'origine.' },
      { q: 'Application linéaire d\'une baisse de $20$ % ?', r: '$x \\mapsto 0{,}8x$' }
    ],
    contexte: {
      titre: 'Recharger son crédit d\'argent mobile',
      enonce: 'Un service d\'argent mobile prélève des frais de $1$ % sur chaque retrait. On note $f(x)$ le montant des frais pour un retrait de $x$ F CFA. Justifier que $f$ est linéaire, donner son coefficient et calculer les frais pour un retrait de $35\\,000$ F CFA. Quel retrait a coûté $450$ F CFA de frais ?',
      solution: ['$f(x) = \\dfrac{1}{100}x = 0{,}01x$ : c\'est une application linéaire de coefficient $0{,}01$.', '$f(35\\,000) = 0{,}01 \\times 35\\,000 = 350$ F CFA.', '$0{,}01x = 450$ donne $x = 45\\,000$ F CFA.']
    }
  };

  EM.contenu['4e-statistiques'] = {
    resume: 'Regrouper des données en classes, calculer des effectifs, des fréquences, une moyenne (éventuellement pondérée) et lire un histogramme.',
    objectifs: [
      'Regrouper une série en classes d\'amplitude donnée',
      'Calculer des effectifs, des fréquences et des pourcentages',
      'Calculer une moyenne simple et une moyenne pondérée',
      'Calculer une moyenne à partir des centres de classes',
      'Construire et lire un histogramme'
    ],
    cours: [
      { type: 'definition', titre: 'Classes', texte: 'Lorsque le caractère prend de nombreuses valeurs, on regroupe les données en <b>classes</b> de la forme $[a ; b[$. L\'<b>amplitude</b> de la classe est $b - a$ et son <b>centre</b> est $\\dfrac{a + b}{2}$.' },
      { type: 'formule', titre: 'Moyenne pondérée', texte: 'Si les valeurs $x_1, x_2, \\dots, x_p$ ont pour effectifs $n_1, n_2, \\dots, n_p$ et $N = n_1 + \\dots + n_p$, la moyenne est $$\\bar{x} = \\dfrac{n_1 x_1 + n_2 x_2 + \\dots + n_p x_p}{N}$$ On peut aussi pondérer par des coefficients (moyenne trimestrielle).' },
      { type: 'propriete', titre: 'Moyenne d\'une série en classes', texte: 'Pour une série regroupée en classes, on obtient une valeur approchée de la moyenne en remplaçant chaque classe par son centre.' },
      { type: 'definition', titre: 'Histogramme', texte: 'Un histogramme représente une série regroupée en classes : chaque classe est représentée par un rectangle dont la base est l\'amplitude. Quand les classes ont la même amplitude, la hauteur de chaque rectangle est proportionnelle à l\'effectif.' }
    ],
    methodes: [
      { titre: 'Calculer une moyenne pondérée', etapes: ['Multiplier chaque valeur (ou centre de classe) par son effectif ou son coefficient.', 'Additionner ces produits.', 'Diviser par la somme des effectifs (ou des coefficients).'] }
    ],
    exemple: {
      enonce: 'Ndèye a obtenu $12$ en mathématiques (coefficient $4$), $15$ en français (coefficient $3$) et $9$ en anglais (coefficient $2$). Calculer sa moyenne.',
      solution: ['Somme pondérée : $12 \\times 4 + 15 \\times 3 + 9 \\times 2 = 48 + 45 + 18 = 111$.', 'Somme des coefficients : $4 + 3 + 2 = 9$.', 'Moyenne : $\\dfrac{111}{9} \\approx 12{,}33$.']
    },
    erreurs: [
      'Diviser par le nombre de valeurs au lieu de la somme des effectifs ou des coefficients.',
      'Faire la moyenne des centres de classes sans tenir compte des effectifs.',
      'Mal placer une valeur à la frontière : $20$ appartient à $[20 ; 30[$ et pas à $[10 ; 20[$.'
    ],
    flashcards: [
      { q: 'Centre de la classe $[40 ; 60[$ ?', r: '$50$' },
      { q: 'Amplitude de $[1{,}50 ; 1{,}60[$ ?', r: '$0{,}10$' },
      { q: 'Formule de la moyenne pondérée ?', r: '$\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$' },
      { q: 'Moyenne de $10$ (coef. 1) et $16$ (coef. 2) ?', r: '$14$' },
      { q: '$30$ appartient-il à $[20 ; 30[$ ?', r: 'Non, la borne $30$ est exclue.' }
    ],
    contexte: {
      titre: 'La pêche du jour à Joal',
      enonce: 'Au quai de pêche de Joal, on pèse les captures de $40$ pirogues (en kg) : $[0 ; 100[$ : $6$ pirogues ; $[100 ; 200[$ : $14$ ; $[200 ; 300[$ : $12$ ; $[300 ; 400[$ : $8$. Estimer la masse moyenne débarquée par pirogue.',
      solution: ['Centres des classes : $50$, $150$, $250$, $350$.', 'Somme : $6 \\times 50 + 14 \\times 150 + 12 \\times 250 + 8 \\times 350 = 300 + 2\\,100 + 3\\,000 + 2\\,800 = 8\\,200$.', 'Moyenne : $\\dfrac{8\\,200}{40} = 205$ kg par pirogue environ.']
    }
  };

  EM.contenu['4e-pythagore'] = {
    resume: 'Dans un triangle rectangle, le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés. Ce théorème et sa réciproque permettent de calculer des longueurs et de démontrer qu\'un triangle est rectangle.',
    objectifs: [
      'Identifier l\'hypoténuse d\'un triangle rectangle',
      'Calculer la longueur d\'un côté avec le théorème de Pythagore',
      'Démontrer qu\'un triangle est rectangle avec la réciproque',
      'Démontrer qu\'un triangle n\'est pas rectangle',
      'Connaître le cercle circonscrit à un triangle rectangle'
    ],
    cours: [
      { type: 'definition', titre: 'Hypoténuse', texte: 'Dans un triangle rectangle, l\'<b>hypoténuse</b> est le côté opposé à l\'angle droit ; c\'est le plus long des trois côtés.' },
      { type: 'theoreme', titre: 'Théorème de Pythagore', texte: 'Si le triangle $ABC$ est rectangle en $A$, alors $$BC^2 = AB^2 + AC^2$$' },
      { type: 'theoreme', titre: 'Réciproque', texte: 'Si, dans un triangle $ABC$, on a $BC^2 = AB^2 + AC^2$, alors ce triangle est rectangle en $A$.<br><b>Conséquence (contraposée) :</b> si le carré du plus grand côté n\'est pas égal à la somme des carrés des deux autres, le triangle n\'est pas rectangle.' },
      { type: 'propriete', titre: 'Cercle et triangle rectangle', texte: 'Si un triangle est rectangle, alors le centre de son cercle circonscrit est le milieu de l\'hypoténuse (et le rayon vaut la moitié de l\'hypoténuse). Réciproquement, si un triangle est inscrit dans un cercle dont un côté est un diamètre, alors il est rectangle.' },
      { type: 'remarque', titre: 'Racine carrée', texte: 'Pour trouver une longueur $\\ell$ connaissant $\\ell^2$, on utilise la touche $\\sqrt{\\;}$ de la calculatrice : si $\\ell^2 = 50$ alors $\\ell = \\sqrt{50} \\approx 7{,}07$. Triplets entiers célèbres : $(3 ; 4 ; 5)$, $(5 ; 12 ; 13)$, $(8 ; 15 ; 17)$.' }
    ],
    methodes: [
      { titre: 'Calculer une longueur', etapes: ['Préciser le triangle rectangle et son hypoténuse.', 'Écrire l\'égalité de Pythagore.', 'Remplacer par les valeurs connues et isoler le carré cherché.', 'Prendre la racine carrée et arrondir si nécessaire.'] },
      { titre: 'Démontrer qu\'un triangle est (ou n\'est pas) rectangle', etapes: ['Repérer le plus grand côté.', 'Calculer séparément son carré et la somme des carrés des deux autres côtés.', 'Égalité : le triangle est rectangle (réciproque). Sinon : il ne l\'est pas.'] }
    ],
    exemple: {
      enonce: '$EFG$ est rectangle en $E$, avec $EF = 9$ cm et $FG = 15$ cm. Calculer $EG$.',
      solution: ['L\'hypoténuse est $[FG]$. D\'après le théorème de Pythagore : $FG^2 = EF^2 + EG^2$.', '$15^2 = 9^2 + EG^2$, donc $EG^2 = 225 - 81 = 144$.', '$EG = \\sqrt{144} = 12$ cm.']
    },
    erreurs: [
      'Additionner les carrés alors qu\'on cherche un côté de l\'angle droit (il faut soustraire).',
      'Oublier la racine carrée à la fin : $EG^2 = 144$ ne donne pas $EG = 144$.',
      'Écrire $\\sqrt{a^2 + b^2} = a + b$ : c\'est faux.',
      'Appliquer le théorème à un triangle dont on ne sait pas qu\'il est rectangle.'
    ],
    flashcards: [
      { q: 'Théorème de Pythagore (rectangle en $A$) ?', r: '$BC^2 = AB^2 + AC^2$' },
      { q: 'Hypoténuse ?', r: 'Côté opposé à l\'angle droit, le plus long.' },
      { q: 'Triangle $6$, $8$, $10$ : rectangle ?', r: 'Oui : $36 + 64 = 100$.' },
      { q: 'Côtés de l\'angle droit $5$ et $12$ : hypoténuse ?', r: '$13$' },
      { q: 'Hypoténuse $10$, un côté $6$ : l\'autre côté ?', r: '$8$' },
      { q: 'Centre du cercle circonscrit à un triangle rectangle ?', r: 'Le milieu de l\'hypoténuse.' }
    ],
    contexte: {
      titre: 'L\'échelle du peintre à Touba',
      enonce: 'Ousmane appuie une échelle de $5$ m contre le mur vertical d\'une maison à Touba. Le pied de l\'échelle est à $1{,}4$ m du mur, sur un sol horizontal. À quelle hauteur l\'échelle touche-t-elle le mur ?',
      solution: ['Le mur, le sol et l\'échelle forment un triangle rectangle d\'hypoténuse l\'échelle.', '$h^2 + 1{,}4^2 = 5^2$, donc $h^2 = 25 - 1{,}96 = 23{,}04$.', '$h = \\sqrt{23{,}04} = 4{,}8$ m.']
    },
    histoire: 'La relation porte le nom du savant grec Pythagore (VIe siècle avant notre ère), mais des tablettes babyloniennes plus anciennes, comme la tablette Plimpton 322, contiennent déjà des nombres liés à des triplets pythagoriciens.'
  };

  EM.contenu['4e-droite-milieux'] = {
    resume: 'La droite qui joint les milieux de deux côtés d\'un triangle est parallèle au troisième côté, et le segment joignant ces milieux mesure la moitié de ce côté.',
    objectifs: [
      'Utiliser le théorème de la droite des milieux pour démontrer un parallélisme',
      'Calculer une longueur avec le segment des milieux',
      'Utiliser la réciproque pour démontrer qu\'un point est un milieu',
      'Utiliser ces propriétés dans un quadrilatère (parallélogramme des milieux)'
    ],
    cours: [
      { type: 'theoreme', titre: 'Théorème de la droite des milieux', texte: 'Dans un triangle, la droite qui passe par les milieux de deux côtés est parallèle au troisième côté. Si $I$ et $J$ sont les milieux de $[AB]$ et $[AC]$, alors $(IJ) \\parallel (BC)$.' },
      { type: 'theoreme', titre: 'Longueur du segment des milieux', texte: 'Dans un triangle, le segment qui joint les milieux de deux côtés mesure la moitié du troisième côté : $IJ = \\dfrac{BC}{2}$.' },
      { type: 'theoreme', titre: 'Réciproque', texte: 'Dans un triangle, la droite qui passe par le milieu d\'un côté et qui est parallèle à un deuxième côté coupe le troisième côté en son milieu. Si $I$ est le milieu de $[AB]$ et si la parallèle à $(BC)$ passant par $I$ coupe $[AC]$ en $J$, alors $J$ est le milieu de $[AC]$.' },
      { type: 'propriete', titre: 'Quadrilatère des milieux', texte: 'Les milieux des quatre côtés d\'un quadrilatère quelconque sont les sommets d\'un parallélogramme (on applique deux fois le théorème dans les triangles formés par une diagonale).' }
    ],
    methodes: [
      { titre: 'Choisir le bon énoncé', etapes: ['Deux milieux connus → parallélisme et moitié de longueur (théorème direct).', 'Un milieu et une parallèle connus → l\'autre point est un milieu (réciproque).', 'Rédiger : « Dans le triangle …, $I$ est le milieu de …, $J$ est le milieu de … ; d\'après le théorème de la droite des milieux, … ».'] }
    ],
    exemple: {
      enonce: 'Dans le triangle $RST$, $M$ est le milieu de $[RS]$ et $N$ le milieu de $[RT]$. On donne $ST = 11$ cm. Calculer $MN$ et préciser la position des droites $(MN)$ et $(ST)$.',
      solution: ['Dans le triangle $RST$, $M$ et $N$ sont les milieux de $[RS]$ et $[RT]$.', 'D\'après le théorème de la droite des milieux, $(MN) \\parallel (ST)$ et $MN = \\dfrac{ST}{2} = 5{,}5$ cm.']
    },
    erreurs: [
      'Utiliser le théorème avec un seul milieu connu (il faut deux milieux, ou un milieu et une parallèle).',
      'Croire que $MN$ est la moitié d\'un côté passant par $M$ ou $N$ : c\'est la moitié du troisième côté.',
      'Oublier de nommer le triangle dans lequel on applique le théorème.'
    ],
    flashcards: [
      { q: '$I$, $J$ milieux de $[AB]$, $[AC]$ : position de $(IJ)$ ?', r: 'Parallèle à $(BC)$.' },
      { q: '$I$, $J$ milieux de $[AB]$, $[AC]$ et $BC = 9$ : $IJ$ ?', r: '$4{,}5$' },
      { q: 'Réciproque : milieu + parallèle donne…', r: 'le milieu du troisième côté.' },
      { q: 'Quadrilatère formé par les milieux des côtés ?', r: 'Un parallélogramme.' },
      { q: '$IJ = 7$ (segment des milieux) : troisième côté ?', r: '$14$' }
    ],
    contexte: {
      titre: 'La barre de renfort du portail',
      enonce: 'Un menuisier de Kaolack fabrique un portail dont la partie haute est un triangle de base $2{,}6$ m. Il soude une barre horizontale qui relie les milieux des deux côtés obliques. Quelle est la longueur de cette barre ? Pourquoi est-elle parallèle à la base ?',
      solution: ['La barre joint les milieux de deux côtés du triangle : d\'après le théorème de la droite des milieux, elle est parallèle au troisième côté (la base).', 'Sa longueur vaut la moitié de la base : $\\dfrac{2{,}6}{2} = 1{,}3$ m.']
    }
  };

  EM.contenu['4e-cosinus'] = {
    resume: 'Dans un triangle rectangle, le cosinus d\'un angle aigu est le quotient du côté adjacent par l\'hypoténuse. Il permet de calculer une longueur ou un angle.',
    objectifs: [
      'Identifier le côté adjacent à un angle aigu et l\'hypoténuse',
      'Écrire le cosinus d\'un angle aigu dans un triangle rectangle',
      'Calculer une longueur à l\'aide du cosinus',
      'Calculer la mesure d\'un angle à l\'aide de la calculatrice',
      'Savoir que le cosinus d\'un angle aigu est compris entre 0 et 1'
    ],
    cours: [
      { type: 'definition', titre: 'Cosinus d\'un angle aigu', texte: 'Dans un triangle $ABC$ rectangle en $A$, le cosinus de l\'angle aigu $\\widehat{ABC}$ est $$\\cos \\widehat{ABC} = \\dfrac{\\text{côté adjacent à } \\widehat{B}}{\\text{hypoténuse}} = \\dfrac{BA}{BC}$$' },
      { type: 'propriete', titre: 'Encadrement', texte: 'L\'hypoténuse étant le plus grand côté, le cosinus d\'un angle aigu est strictement compris entre 0 et 1. Plus l\'angle est grand, plus son cosinus est petit. Valeurs à retenir : $\\cos 60° = 0{,}5$.' },
      { type: 'formule', titre: 'Calculer une longueur', texte: 'De $\\cos \\widehat{B} = \\dfrac{BA}{BC}$ on tire $BA = BC \\times \\cos \\widehat{B}$ et $BC = \\dfrac{BA}{\\cos \\widehat{B}}$.' },
      { type: 'remarque', titre: 'Calculer un angle', texte: 'Si l\'on connaît $\\cos \\widehat{B}$, on obtient $\\widehat{B}$ avec la touche $\\cos^{-1}$ (ou « Acs ») de la calculatrice, réglée en degrés. Exemple : $\\cos \\widehat{B} = 0{,}8$ donne $\\widehat{B} \\approx 36{,}9°$.' }
    ],
    methodes: [
      { titre: 'Utiliser le cosinus', etapes: ['Vérifier que le triangle est rectangle et repérer l\'hypoténuse.', 'Repérer le côté adjacent à l\'angle utilisé (il touche l\'angle mais n\'est pas l\'hypoténuse).', 'Écrire $\\cos = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$, remplacer, isoler l\'inconnue.', 'Calculer avec la calculatrice en mode degrés et arrondir comme demandé.'] }
    ],
    exemple: {
      enonce: '$KLM$ est rectangle en $K$, $LM = 12$ cm et $\\widehat{KLM} = 35°$. Calculer $KL$ arrondi au millimètre.',
      solution: ['Dans le triangle $KLM$ rectangle en $K$, l\'hypoténuse est $[LM]$ et le côté adjacent à $\\widehat{L}$ est $[KL]$.', '$\\cos \\widehat{KLM} = \\dfrac{KL}{LM}$, donc $KL = 12 \\times \\cos 35°$.', '$KL \\approx 9{,}8$ cm.']
    },
    erreurs: [
      'Prendre le côté opposé au lieu du côté adjacent.',
      'Utiliser le cosinus dans un triangle qui n\'est pas rectangle.',
      'Calculatrice réglée en radians ou en grades au lieu des degrés.',
      'Diviser au lieu de multiplier : le côté adjacent est plus court que l\'hypoténuse.'
    ],
    flashcards: [
      { q: 'Définition du cosinus ?', r: '$\\dfrac{\\text{côté adjacent}}{\\text{hypoténuse}}$' },
      { q: 'Encadrement du cosinus d\'un angle aigu ?', r: 'Entre $0$ et $1$.' },
      { q: '$\\cos 60° = ?$', r: '$0{,}5$' },
      { q: 'Adjacent $= 4$, hypoténuse $= 8$ : angle ?', r: '$60°$' },
      { q: 'Hypoténuse $10$, angle $60°$ : côté adjacent ?', r: '$5$' }
    ],
    contexte: {
      titre: 'La rampe d\'accès du dispensaire',
      enonce: 'À Tambacounda, on construit une rampe d\'accès pour fauteuils roulants : la rampe mesure $6$ m et son extrémité basse est à $5{,}95$ m (horizontalement) du pied du mur. Calculer l\'angle que fait la rampe avec le sol, arrondi au dixième de degré.',
      solution: ['La rampe (hypoténuse), le sol (côté adjacent) et le mur forment un triangle rectangle.', '$\\cos \\alpha = \\dfrac{5{,}95}{6} \\approx 0{,}9917$.', '$\\alpha \\approx 7{,}4°$.']
    }
  };

  EM.contenu['4e-vecteurs'] = {
    resume: 'Un vecteur est défini par une direction, un sens et une longueur. La translation de vecteur $\\vect{AB}$ fait glisser chaque point dans la même direction, le même sens et de la même longueur.',
    objectifs: [
      'Connaître les caractéristiques d\'un vecteur (direction, sens, longueur)',
      'Reconnaître des vecteurs égaux et le lien avec le parallélogramme',
      'Construire l\'image d\'un point ou d\'une figure par une translation',
      'Calculer les coordonnées d\'un vecteur et de l\'image d\'un point par une translation',
      'Construire la somme de deux vecteurs (relation de Chasles)'
    ],
    cours: [
      { type: 'definition', titre: 'Vecteur', texte: 'Le vecteur $\\vect{AB}$ est caractérisé par sa <b>direction</b> (celle de la droite $(AB)$), son <b>sens</b> (de $A$ vers $B$) et sa <b>longueur</b> (la distance $AB$). Le vecteur $\\vect{AA}$ est le vecteur nul $\\vec{0}$.' },
      { type: 'propriete', titre: 'Vecteurs égaux et parallélogramme', texte: 'Deux vecteurs sont égaux s\'ils ont même direction, même sens et même longueur. $\\vect{AB} = \\vect{DC}$ si et seulement si $ABCD$ est un parallélogramme (éventuellement aplati). $\\vect{AB} = \\vect{BC}$ si et seulement si $B$ est le milieu de $[AC]$.' },
      { type: 'definition', titre: 'Translation', texte: 'L\'image d\'un point $M$ par la translation de vecteur $\\vect{AB}$ est le point $M\'$ tel que $\\vect{MM\'} = \\vect{AB}$. La translation conserve les longueurs, les angles, les aires, l\'alignement et le parallélisme.' },
      { type: 'formule', titre: 'Coordonnées', texte: 'Dans un repère, si $A(x_A ; y_A)$ et $B(x_B ; y_B)$, alors $\\vect{AB}\\,(x_B - x_A \\,;\\, y_B - y_A)$. L\'image de $M(x ; y)$ par la translation de vecteur $\\vec{u}(a ; b)$ est $M\'(x + a ; y + b)$.' },
      { type: 'propriete', titre: 'Relation de Chasles', texte: 'Pour tous points $A$, $B$, $C$ : $\\vect{AB} + \\vect{BC} = \\vect{AC}$. Enchaîner la translation de vecteur $\\vect{AB}$ puis celle de vecteur $\\vect{BC}$ revient à appliquer la translation de vecteur $\\vect{AC}$.' }
    ],
    methodes: [
      { titre: 'Calculer l\'image d\'un point par une translation', etapes: ['Calculer les coordonnées du vecteur de la translation : $(x_B - x_A ; y_B - y_A)$.', 'Ajouter ces coordonnées à celles du point : $M\'(x + a ; y + b)$.', 'Contrôler sur une figure.'] }
    ],
    exemple: {
      enonce: 'On donne $A(1 ; -2)$, $B(4 ; 3)$ et $C(-2 ; 0)$. Calculer les coordonnées du point $D$ tel que $ABDC$ soit un parallélogramme.',
      solution: ['$ABDC$ est un parallélogramme si et seulement si $\\vect{AB} = \\vect{CD}$.', '$\\vect{AB}\\,(4 - 1 ; 3 - (-2))$, soit $\\vect{AB}\\,(3 ; 5)$.', '$D$ est l\'image de $C$ par la translation de vecteur $\\vect{AB}$ : $D(-2 + 3 ; 0 + 5) = D(1 ; 5)$.']
    },
    erreurs: [
      'Calculer $x_A - x_B$ au lieu de $x_B - x_A$ pour $\\vect{AB}$.',
      'Mal lire l\'ordre des sommets : $\\vect{AB} = \\vect{DC}$ pour $ABCD$, et non $\\vect{AB} = \\vect{CD}$.',
      'Confondre $\\vect{AB}$ et $\\vect{BA}$ : ils sont opposés.'
    ],
    flashcards: [
      { q: 'Trois caractéristiques d\'un vecteur ?', r: 'Direction, sens, longueur.' },
      { q: '$\\vect{AB} = \\vect{DC}$ signifie…', r: '$ABCD$ est un parallélogramme.' },
      { q: 'Coordonnées de $\\vect{AB}$ ?', r: '$(x_B - x_A ; y_B - y_A)$' },
      { q: 'Relation de Chasles ?', r: '$\\vect{AB} + \\vect{BC} = \\vect{AC}$' },
      { q: 'Image de $(2 ; -1)$ par la translation de vecteur $(3 ; 4)$ ?', r: '$(5 ; 3)$' },
      { q: '$\\vect{AB} = \\vect{BC}$ signifie…', r: '$B$ est le milieu de $[AC]$.' }
    ],
    contexte: {
      titre: 'Le déplacement du car rapide',
      enonce: 'Sur le plan quadrillé d\'un quartier de Pikine (unité : 100 m), un car rapide part du point $A(2 ; 1)$ et arrive en $B(7 ; 4)$. Un second car effectue exactement le même déplacement en partant de $C(-1 ; 3)$. Où arrive-t-il ?',
      solution: ['Le déplacement est la translation de vecteur $\\vect{AB}\\,(7 - 2 ; 4 - 1) = (5 ; 3)$.', 'Arrivée du second car : $(-1 + 5 ; 3 + 3) = (4 ; 6)$.']
    }
  };

  EM.contenu['4e-cercle-tangente'] = {
    resume: 'Positions relatives d\'une droite et d\'un cercle selon la distance du centre à la droite ; tangente en un point, perpendiculaire au rayon ; positions relatives de deux cercles.',
    objectifs: [
      'Déterminer la position relative d\'une droite et d\'un cercle',
      'Construire la tangente à un cercle en un de ses points',
      'Utiliser la perpendicularité de la tangente et du rayon pour calculer une longueur',
      'Déterminer la position relative de deux cercles'
    ],
    cours: [
      { type: 'definition', titre: 'Distance d\'un point à une droite', texte: 'La distance du point $O$ à la droite $(\\Delta)$ est la longueur $OH$, où $H$ est le pied de la perpendiculaire à $(\\Delta)$ passant par $O$. C\'est la plus courte distance entre $O$ et un point de $(\\Delta)$.' },
      { type: 'propriete', titre: 'Droite et cercle', texte: 'Soit $\\mathcal{C}$ un cercle de centre $O$ et de rayon $r$, et $d$ la distance de $O$ à la droite $(\\Delta)$. Si $d > r$ : la droite est <b>extérieure</b> au cercle (aucun point commun). Si $d = r$ : la droite est <b>tangente</b> au cercle (un seul point commun). Si $d < r$ : la droite est <b>sécante</b> au cercle (deux points communs).' },
      { type: 'theoreme', titre: 'Tangente en un point', texte: 'La tangente au cercle $\\mathcal{C}$ de centre $O$ en un point $A$ du cercle est la droite passant par $A$ et <b>perpendiculaire au rayon</b> $[OA]$.' },
      { type: 'propriete', titre: 'Deux cercles', texte: 'Soit deux cercles de centres $O$, $O\'$ et de rayons $r \\geq r\'$, avec $d = OO\'$. Si $d > r + r\'$ : extérieurs. Si $d = r + r\'$ : tangents extérieurement. Si $r - r\' < d < r + r\'$ : sécants. Si $d = r - r\'$ (et $d \\neq 0$) : tangents intérieurement. Si $d < r - r\'$ : l\'un est intérieur à l\'autre.' }
    ],
    methodes: [
      { titre: 'Calculer une longueur avec une tangente', etapes: ['Tracer le rayon $[OA]$ au point de contact $A$.', 'Utiliser $(OA) \\perp (\\Delta)$ : le triangle $OAM$ est rectangle en $A$ pour tout point $M$ de la tangente.', 'Appliquer le théorème de Pythagore dans ce triangle.'] }
    ],
    exemple: {
      enonce: 'Un cercle de centre $O$ a pour rayon $5$ cm. La droite $(\\Delta)$ est tangente au cercle en $A$, et $M$ est le point de $(\\Delta)$ tel que $AM = 12$ cm. Calculer $OM$.',
      solution: ['La tangente est perpendiculaire au rayon : le triangle $OAM$ est rectangle en $A$.', 'D\'après le théorème de Pythagore : $OM^2 = OA^2 + AM^2 = 25 + 144 = 169$.', '$OM = 13$ cm.']
    },
    erreurs: [
      'Mesurer la distance du centre à la droite le long d\'une oblique au lieu de la perpendiculaire.',
      'Oublier que la tangente est perpendiculaire au rayon au point de contact.',
      'Confondre rayon et diamètre dans la comparaison $d$ et $r$.'
    ],
    flashcards: [
      { q: '$d = r$ : position de la droite ?', r: 'Tangente au cercle.' },
      { q: '$d < r$ : position de la droite ?', r: 'Sécante (deux points communs).' },
      { q: 'Tangente en $A$ au cercle de centre $O$ ?', r: 'Perpendiculaire à $(OA)$ en $A$.' },
      { q: 'Cercles de rayons $3$ et $5$, $OO\' = 8$ ?', r: 'Tangents extérieurement.' },
      { q: 'Cercles de rayons $3$ et $5$, $OO\' = 6$ ?', r: 'Sécants.' }
    ],
    contexte: {
      titre: 'La roue de la charrette',
      enonce: 'La roue d\'une charrette de Diourbel a un rayon de $45$ cm et roule sur une route rectiligne. On voit un caillou sur la route à $60$ cm du point de contact de la roue avec le sol. Quelle est la distance entre le caillou et le centre (moyeu) de la roue ?',
      solution: ['La route est tangente à la roue au point de contact $A$ : elle est perpendiculaire au rayon $[OA]$.', 'Triangle rectangle en $A$ : $OM^2 = 45^2 + 60^2 = 2\\,025 + 3\\,600 = 5\\,625$.', '$OM = 75$ cm.']
    }
  };

  EM.contenu['4e-pyramide-cone'] = {
    resume: 'La pyramide et le cône de révolution : description, patrons, et calcul du volume, égal au tiers du produit de l\'aire de la base par la hauteur.',
    objectifs: [
      'Reconnaître une pyramide (régulière) et un cône de révolution et nommer leurs éléments',
      'Représenter ces solides et tracer un patron simple',
      'Calculer le volume d\'une pyramide et d\'un cône',
      'Calculer une hauteur ou une génératrice avec le théorème de Pythagore',
      'Convertir les unités de volume et de capacité'
    ],
    cours: [
      { type: 'definition', titre: 'Pyramide', texte: 'Une pyramide est un solide dont une face, la <b>base</b>, est un polygone, et dont les autres faces, les <b>faces latérales</b>, sont des triangles ayant un sommet commun $S$, le <b>sommet</b> de la pyramide. La <b>hauteur</b> est la distance de $S$ au plan de la base. Une pyramide est <b>régulière</b> si sa base est un polygone régulier et si le pied de la hauteur est le centre de la base.' },
      { type: 'definition', titre: 'Cône de révolution', texte: 'Un cône de révolution est obtenu en faisant tourner un triangle rectangle autour d\'un des côtés de l\'angle droit. Sa base est un disque de rayon $r$ ; sa hauteur $h$ relie le sommet au centre de la base ; une <b>génératrice</b> $g$ relie le sommet à un point du cercle de base, avec $g^2 = r^2 + h^2$.' },
      { type: 'formule', titre: 'Volumes', texte: 'Pyramide : $V = \\dfrac{1}{3} \\times \\mathcal{B} \\times h$ où $\\mathcal{B}$ est l\'aire de la base. Cône : $V = \\dfrac{1}{3} \\pi r^2 h$. Le volume d\'une pyramide est le tiers de celui du prisme de même base et de même hauteur.' },
      { type: 'formule', titre: 'Aire latérale d\'un cône', texte: 'L\'aire latérale d\'un cône de révolution de rayon $r$ et de génératrice $g$ est $\\mathcal{A}_\\ell = \\pi r g$ (son patron est un secteur de disque de rayon $g$).' }
    ],
    methodes: [
      { titre: 'Calculer le volume d\'un cône', etapes: ['Identifier le rayon $r$ de la base (attention au diamètre) et la hauteur $h$.', 'Si on connaît la génératrice, calculer $h$ par Pythagore : $h^2 = g^2 - r^2$.', 'Appliquer $V = \\dfrac{1}{3}\\pi r^2 h$ et arrondir.'] }
    ],
    exemple: {
      enonce: 'Une pyramide a pour base un carré de côté $6$ cm et pour hauteur $10$ cm. Calculer son volume.',
      solution: ['Aire de la base : $\\mathcal{B} = 6^2 = 36$ cm².', '$V = \\dfrac{1}{3} \\times 36 \\times 10 = 120$ cm³.']
    },
    erreurs: [
      'Oublier le facteur $\\dfrac{1}{3}$.',
      'Prendre la génératrice (ou l\'apothème) à la place de la hauteur.',
      'Utiliser le diamètre à la place du rayon.'
    ],
    flashcards: [
      { q: 'Volume d\'une pyramide ?', r: '$V = \\dfrac{1}{3}\\mathcal{B}h$' },
      { q: 'Volume d\'un cône ?', r: '$V = \\dfrac{1}{3}\\pi r^2 h$' },
      { q: 'Lien entre $g$, $r$, $h$ dans un cône ?', r: '$g^2 = r^2 + h^2$' },
      { q: 'Faces latérales d\'une pyramide ?', r: 'Des triangles' },
      { q: 'Pyramide et prisme de même base et même hauteur ?', r: 'Le volume de la pyramide est le tiers de celui du prisme.' }
    ],
    contexte: {
      titre: 'Le tas d\'arachides au seccos',
      enonce: 'Au seccos de Kaolack, les arachides décortiquées forment un tas conique de diamètre $4$ m et de hauteur $1{,}5$ m. Calculer le volume du tas, arrondi au dixième de m³.',
      solution: ['Rayon : $r = 2$ m.', '$V = \\dfrac{1}{3} \\pi \\times 2^2 \\times 1{,}5 = 2\\pi$ m³.', '$V \\approx 6{,}3$ m³.']
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
