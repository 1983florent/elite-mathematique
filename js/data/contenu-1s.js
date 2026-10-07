/*
 * ELITE MATHÉMATIQUE — contenu pédagogique de 1ère S1 et 1ère S2.
 * Chapitres : 1s-polynomes, 1s-fonctions, 1s-limites, 1s-derivation, 1s-etude-fonctions,
 * 1s-suites, 1s-trigonometrie, 1s-denombrement, 1s-statistiques, 1s-produit-scalaire,
 * 1s-barycentre, 1s-angles-orientes, 1s-espace, 1s1-transformations.
 * Conventions : virgule décimale, intervalles ]a ; b[, C_n^p et A_n^p, mesure principale dans ]-π ; π].
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  EM.contenu = EM.contenu || {};

  /* ================================================================== */
  /* Polynômes, équations et inéquations                                 */
  /* ================================================================== */
  EM.contenu['1s-polynomes'] = {
    resume: 'Polynômes : racines, factorisation par $(x - a)$, signe ; équations et inéquations qui se ramènent au second degré (bicarrées, irrationnelles, rationnelles).',
    objectifs: [
      'Utiliser l’égalité de deux polynômes (identification des coefficients).',
      'Factoriser un polynôme par $(x - a)$ lorsque $a$ est une racine (identification, division euclidienne ou méthode de Horner).',
      'Utiliser la somme et le produit des racines d’un trinôme du second degré.',
      'Étudier le signe d’un polynôme ou d’une fraction rationnelle à l’aide d’un tableau de signes.',
      'Résoudre des équations bicarrées, des équations irrationnelles et des inéquations rationnelles.'
    ],
    cours: [
      { type: 'definition', titre: 'Polynôme, degré, égalité',
        texte: 'Un polynôme est une fonction de la forme $P(x) = a_nx^n + a_{n-1}x^{n-1} + \\dots + a_1x + a_0$ ; si $a_n \\neq 0$, l’entier $n$ est le <b>degré</b> de $P$.<br>Deux polynômes sont égaux si et seulement s’ils ont le même degré et les mêmes coefficients pour les termes de même degré : c’est le <b>principe d’identification</b>.' },
      { type: 'theoreme', titre: 'Racine et factorisation par $(x - a)$',
        texte: 'Le réel $a$ est une <b>racine</b> de $P$ lorsque $P(a) = 0$.<br>$a$ est racine de $P$ (de degré $n \\geq 1$) si et seulement s’il existe un polynôme $Q$ de degré $n - 1$ tel que $$P(x) = (x - a)\\,Q(x).$$ Conséquence : un polynôme de degré $n$ a au plus $n$ racines.' },
      { type: 'propriete', titre: 'Division euclidienne',
        texte: 'Pour deux polynômes $A$ et $B$ ($B$ non nul), il existe un unique couple $(Q ; R)$ de polynômes tel que $A = BQ + R$ avec $\\deg R < \\deg B$.<br>En particulier, le reste de la division de $P(x)$ par $(x - a)$ est le nombre $P(a)$.' },
      { type: 'formule', titre: 'Somme et produit des racines',
        texte: 'Si le trinôme $ax^2 + bx + c$ ($a \\neq 0$, $\\Delta \\geq 0$) a pour racines $x_1$ et $x_2$ : $$x_1 + x_2 = -\\dfrac{b}{a} \\qquad x_1x_2 = \\dfrac{c}{a}.$$ Réciproquement, deux nombres de somme $S$ et de produit $P$ sont les solutions de $X^2 - SX + P = 0$.' },
      { type: 'propriete', titre: 'Équations bicarrées et irrationnelles',
        texte: '<b>Bicarrée</b> $ax^4 + bx^2 + c = 0$ : on pose $X = x^2$ avec $X \\geq 0$, on résout $aX^2 + bX + c = 0$ puis $x^2 = X$ pour chaque solution $X \\geq 0$.<br><b>Irrationnelle</b> : $$\\sqrt{A(x)} = B(x) \\iff \\begin{cases} B(x) \\geq 0 \\\\ A(x) = B(x)^2 \\end{cases}$$ et $\\sqrt{A(x)} = \\sqrt{B(x)} \\iff A(x) = B(x)$ et $A(x) \\geq 0$.' },
      { type: 'remarque', titre: 'Signe d’un quotient',
        texte: 'Pour résoudre $\\dfrac{A(x)}{B(x)} \\geq 0$, on ne multiplie jamais par $B(x)$ dont le signe est inconnu : on ramène tout dans un membre, on factorise, puis on dresse un <b>tableau de signes</b>. Les valeurs qui annulent le dénominateur sont interdites (double barre) et toujours exclues des solutions.' }
    ],
    methodes: [
      { titre: 'Factoriser un polynôme connaissant une racine $a$',
        etapes: [
          'Vérifier que $P(a) = 0$ (chercher une racine « évidente » parmi $0$, $1$, $-1$, $2$, $-2$…).',
          'Écrire $P(x) = (x - a)(\\alpha x^2 + \\beta x + \\gamma)$ pour un polynôme $P$ de degré 3.',
          'Développer et identifier les coefficients (ou utiliser la méthode de Horner).',
          'Factoriser si possible le trinôme $\\alpha x^2 + \\beta x + \\gamma$ à l’aide du discriminant.'
        ] },
      { titre: 'Résoudre une équation $\\sqrt{A(x)} = B(x)$',
        etapes: [
          'Écrire la condition $B(x) \\geq 0$.',
          'Élever au carré : $A(x) = B(x)^2$, puis résoudre cette équation.',
          'Ne garder que les solutions qui vérifient la condition $B(x) \\geq 0$.'
        ] },
      { titre: 'Résoudre une inéquation rationnelle',
        etapes: [
          'Tout passer dans un membre et réduire au même dénominateur.',
          'Factoriser le numérateur et le dénominateur.',
          'Dresser le tableau de signes (double barre aux valeurs interdites).',
          'Lire les solutions en soignant les crochets.'
        ] }
    ],
    exemple: {
      enonce: 'Soit $P(x) = x^3 - 2x^2 - 5x + 6$. Factoriser $P(x)$ puis résoudre $P(x) \\geq 0$.',
      solution: [
        '$P(1) = 1 - 2 - 5 + 6 = 0$ : $1$ est racine, donc $P(x) = (x - 1)(x^2 + bx + c)$.',
        'En développant : $(x - 1)(x^2 + bx + c) = x^3 + (b - 1)x^2 + (c - b)x - c$. Par identification : $b - 1 = -2$, $-c = 6$, d’où $b = -1$ et $c = -6$ (on vérifie : $c - b = -5$).',
        '$x^2 - x - 6$ a pour discriminant $\\Delta = 25$ et pour racines $-2$ et $3$, donc $P(x) = (x - 1)(x + 2)(x - 3)$.',
        'Un tableau de signes des trois facteurs donne $P(x) \\geq 0$ sur $[-2 ; 1] \\cup [3 ; +\\infty[$.'
      ]
    },
    erreurs: [
      'Élever au carré sans écrire la condition $B(x) \\geq 0$ : on récupère des « solutions » parasites.',
      'Multiplier les deux membres d’une inéquation par une expression dont on ne connaît pas le signe.',
      'Dans une équation bicarrée, garder une valeur $X < 0$ ou oublier la solution négative $-\\sqrt{X}$.',
      'Inclure une valeur interdite dans l’ensemble des solutions d’une inéquation rationnelle.'
    ],
    flashcards: [
      { q: 'Quand dit-on que $a$ est racine de $P$ ?', r: 'Quand $P(a) = 0$ ; alors $P(x) = (x - a)Q(x)$.' },
      { q: 'Reste de la division de $P(x)$ par $x - a$ ?', r: '$P(a)$' },
      { q: 'Somme et produit des racines de $ax^2 + bx + c$', r: '$S = -\\dfrac{b}{a}$ et $P = \\dfrac{c}{a}$' },
      { q: 'Deux nombres de somme $S$ et de produit $P$ sont solutions de…', r: '$X^2 - SX + P = 0$' },
      { q: '$\\sqrt{A} = B$ équivaut à…', r: '$B \\geq 0$ et $A = B^2$' },
      { q: 'Changement de variable pour $ax^4 + bx^2 + c = 0$', r: '$X = x^2$, avec $X \\geq 0$' },
      { q: 'Nombre maximal de racines d’un polynôme de degré $n$', r: '$n$' }
    ],
    contexte: {
      titre: 'Le ferblantier du marché Colobane',
      enonce: 'À Dakar, au marché Colobane, un ferblantier fabrique des boîtes sans couvercle à partir de feuilles de tôle carrées de $30$ cm de côté : il découpe un carré de côté $x$ cm à chaque coin, puis replie les bords. Il veut une boîte de $1\\,000$ cm³ (un litre). Quelles valeurs de $x$ conviennent ?',
      solution: [
        'La base est un carré de côté $30 - 2x$ et la hauteur vaut $x$, avec $0 < x < 15$ : $V(x) = x(30 - 2x)^2$.',
        '$V(x) = 1\\,000 \\iff 4x^3 - 120x^2 + 900x - 1\\,000 = 0 \\iff x^3 - 30x^2 + 225x - 250 = 0$.',
        '$x = 10$ est racine évidente ($1\\,000 - 3\\,000 + 2\\,250 - 250 = 0$) et l’identification donne $x^3 - 30x^2 + 225x - 250 = (x - 10)(x^2 - 20x + 25)$.',
        '$x^2 - 20x + 25 = 0$ : $\\Delta = 300$, $x = 10 - 5\\sqrt{3} \\approx 1{,}34$ ou $x = 10 + 5\\sqrt{3} \\approx 18{,}66$ (refusée car $x < 15$).',
        'Deux découpes conviennent : $x = 10$ cm ou $x = 10 - 5\\sqrt{3} \\approx 1{,}34$ cm.'
      ]
    },
    histoire: 'La méthode de calcul rapide de $P(a)$ et du quotient de $P(x)$ par $(x - a)$ porte le nom de l’Anglais William George Horner, qui la publia en 1819 ; l’Italien Paolo Ruffini l’avait déjà décrite en 1804.'
  };

  /* ================================================================== */
  /* Généralités sur les fonctions                                       */
  /* ================================================================== */
  EM.contenu['1s-fonctions'] = {
    resume: 'Ensemble de définition, composée de deux fonctions, parité, éléments de symétrie d’une courbe et courbes associées.',
    objectifs: [
      'Déterminer l’ensemble de définition $D_f$ d’une fonction.',
      'Déterminer la composée $g \\circ f$ de deux fonctions et son ensemble de définition.',
      'Étudier la parité d’une fonction et en déduire une symétrie de sa courbe.',
      'Démontrer qu’une droite d’équation $x = a$ est axe de symétrie, ou qu’un point $\\Omega(a ; b)$ est centre de symétrie d’une courbe.',
      'Construire les courbes de $x \\mapsto f(x) + b$, $f(x - a)$, $-f(x)$, $f(-x)$ et $|f(x)|$ à partir de celle de $f$.'
    ],
    cours: [
      { type: 'definition', titre: 'Ensemble de définition',
        texte: '$D_f$ est l’ensemble des réels $x$ pour lesquels $f(x)$ existe. Conditions usuelles : un dénominateur doit être <b>non nul</b> ; une expression sous un radical doit être <b>positive ou nulle</b>.' },
      { type: 'definition', titre: 'Composée de deux fonctions',
        texte: 'La composée de $f$ suivie de $g$ est la fonction $g \\circ f$ définie par $$(g \\circ f)(x) = g\\big(f(x)\\big), \\qquad D_{g \\circ f} = \\{x \\in D_f \\,/\\, f(x) \\in D_g\\}.$$ On applique d’abord $f$, puis $g$. En général, $g \\circ f \\neq f \\circ g$.' },
      { type: 'definition', titre: 'Parité',
        texte: 'Soit $f$ dont l’ensemble de définition $D_f$ est symétrique par rapport à $0$ (si $x \\in D_f$, alors $-x \\in D_f$).<br>$f$ est <b>paire</b> si $f(-x) = f(x)$ pour tout $x \\in D_f$ : sa courbe est symétrique par rapport à l’axe des ordonnées.<br>$f$ est <b>impaire</b> si $f(-x) = -f(x)$ pour tout $x \\in D_f$ : sa courbe est symétrique par rapport à l’origine $O$.' },
      { type: 'theoreme', titre: 'Axe et centre de symétrie',
        texte: 'Dans un repère orthogonal $(O, \\vec{i}, \\vec{j})$ :<br>• la droite d’équation $x = a$ est axe de symétrie de $C_f$ si et seulement si, pour tout $x \\in D_f$ : $2a - x \\in D_f$ et $f(2a - x) = f(x)$ ;<br>• le point $\\Omega(a ; b)$ est centre de symétrie de $C_f$ si et seulement si, pour tout $x \\in D_f$ : $2a - x \\in D_f$ et $f(2a - x) + f(x) = 2b$.' },
      { type: 'propriete', titre: 'Courbes associées',
        texte: 'À partir de $C_f$ :<br>• $y = f(x - a) + b$ : image de $C_f$ par la translation de vecteur $a\\vec{i} + b\\vec{j}$ ;<br>• $y = -f(x)$ : symétrique de $C_f$ par rapport à l’axe des abscisses ;<br>• $y = f(-x)$ : symétrique de $C_f$ par rapport à l’axe des ordonnées ;<br>• $y = |f(x)|$ : on garde les parties de $C_f$ situées au-dessus de l’axe des abscisses et on remplace les autres par leurs symétriques.' },
      { type: 'remarque', titre: 'Fonction homographique',
        texte: 'Si $c \\neq 0$ et $ad - bc \\neq 0$, la courbe de $f : x \\mapsto \\dfrac{ax + b}{cx + d}$ est une hyperbole de centre $\\Omega\\left(-\\dfrac{d}{c} ; \\dfrac{a}{c}\\right)$, point d’intersection de ses asymptotes.' }
    ],
    methodes: [
      { titre: 'Étudier la parité d’une fonction',
        etapes: [
          'Vérifier que $D_f$ est symétrique par rapport à $0$ (sinon, $f$ n’est ni paire ni impaire).',
          'Calculer $f(-x)$ et le simplifier.',
          'Comparer à $f(x)$ et à $-f(x)$.',
          'Pour prouver que $f$ n’est ni paire ni impaire, un contre-exemple numérique suffit (par exemple $f(-1) \\neq f(1)$ et $f(-1) \\neq -f(1)$).'
        ] },
      { titre: 'Montrer que $\\Omega(a ; b)$ est centre de symétrie',
        etapes: [
          'Vérifier que, si $x \\in D_f$, alors $2a - x \\in D_f$.',
          'Calculer $f(2a - x) + f(x)$ (une écriture réduite de $f$ aide beaucoup).',
          'Montrer que le résultat vaut $2b$.'
        ] }
    ],
    exemple: {
      enonce: 'Soit $f(x) = \\dfrac{2x - 1}{x + 1}$. Montrer que $\\Omega(-1 ; 2)$ est centre de symétrie de sa courbe.',
      solution: [
        '$D_f = \\R \\setminus \\{-1\\}$. Si $x \\neq -1$, alors $-2 - x \\neq -1$ : $2a - x = -2 - x \\in D_f$.',
        'On écrit $f(x) = \\dfrac{2(x + 1) - 3}{x + 1} = 2 - \\dfrac{3}{x + 1}$.',
        '$f(-2 - x) = 2 - \\dfrac{3}{-1 - x} = 2 + \\dfrac{3}{x + 1}$.',
        'Donc $f(-2 - x) + f(x) = 4 = 2 \\times 2$ : $\\Omega(-1 ; 2)$ est centre de symétrie.'
      ]
    },
    erreurs: [
      'Calculer $f(-x)$ sans vérifier que $D_f$ est symétrique par rapport à $0$.',
      'Confondre $g \\circ f$ et $f \\circ g$ : dans $g \\circ f$, on applique d’abord $f$.',
      'Croire qu’une fonction est forcément paire ou impaire.',
      'Oublier la condition $f(x) \\in D_g$ dans l’ensemble de définition de $g \\circ f$.'
    ],
    flashcards: [
      { q: '$f$ est paire si…', r: '$D_f$ est symétrique par rapport à $0$ et $f(-x) = f(x)$ : courbe symétrique par rapport à $(Oy)$.' },
      { q: '$f$ est impaire si…', r: '$D_f$ est symétrique par rapport à $0$ et $f(-x) = -f(x)$ : courbe symétrique par rapport à $O$.' },
      { q: '$(g \\circ f)(x) = ?$', r: '$g(f(x))$ : on applique d’abord $f$.' },
      { q: 'Condition pour que $x = a$ soit axe de symétrie', r: '$2a - x \\in D_f$ et $f(2a - x) = f(x)$' },
      { q: 'Condition pour que $\\Omega(a ; b)$ soit centre de symétrie', r: '$2a - x \\in D_f$ et $f(2a - x) + f(x) = 2b$' },
      { q: 'Courbe de $x \\mapsto f(x - a) + b$', r: 'Image de $C_f$ par la translation de vecteur $a\\vec{i} + b\\vec{j}$' },
      { q: 'Centre de l’hyperbole $y = \\dfrac{ax + b}{cx + d}$', r: '$\\Omega\\left(-\\dfrac{d}{c} ; \\dfrac{a}{c}\\right)$' }
    ],
    contexte: {
      titre: 'Le prix d’une course à Saint-Louis',
      enonce: 'Une société de transport de Saint-Louis facture une course $f(d) = 500 + 150d$ F CFA pour $d$ kilomètres. Sur la route de Dakar, son véhicule roule à $40$ km/h : en $t$ heures, il parcourt $d = g(t) = 40t$ km. Exprimer le prix en fonction de la durée $t$, puis calculer le prix d’une course de 1 h 30.',
      solution: [
        'Le prix en fonction du temps est $(f \\circ g)(t) = f(g(t)) = f(40t)$.',
        '$(f \\circ g)(t) = 500 + 150 \\times 40t = 500 + 6\\,000t$.',
        'Pour $t = 1{,}5$ h : $500 + 6\\,000 \\times 1{,}5 = 9\\,500$ F CFA.'
      ]
    },
    histoire: 'C’est le mathématicien suisse Leonhard Euler qui, vers 1734, a introduit la notation $f(x)$ pour désigner l’image de $x$ par une fonction $f$.'
  };

  /* ================================================================== */
  /* Limites et continuité                                               */
  /* ================================================================== */
  EM.contenu['1s-limites'] = {
    resume: 'Limites d’une fonction en un point et à l’infini, opérations, formes indéterminées, asymptotes ; continuité et prolongement par continuité.',
    objectifs: [
      'Connaître les limites des fonctions de référence et les règles opératoires sur les limites.',
      'Lever une forme indéterminée (factorisation, termes de plus haut degré, quantité conjuguée).',
      'Calculer une limite à gauche ou à droite en une valeur interdite.',
      'Interpréter graphiquement une limite : asymptotes verticale, horizontale, oblique.',
      'Étudier la continuité d’une fonction en un point et prolonger une fonction par continuité.'
    ],
    cours: [
      { type: 'formule', titre: 'Limites de référence',
        texte: 'Pour $n$ entier, $n \\geq 1$ : $\\lim\\limits_{x \\to +\\infty} x^n = +\\infty$ ; $\\lim\\limits_{x \\to -\\infty} x^n = +\\infty$ si $n$ est pair, $-\\infty$ si $n$ est impair ; $\\lim\\limits_{x \\to \\pm\\infty} \\dfrac{1}{x^n} = 0$ ; $\\lim\\limits_{x \\to +\\infty} \\sqrt{x} = +\\infty$.<br>En $0$ : $\\lim\\limits_{x \\to 0^+} \\dfrac{1}{x} = +\\infty$ et $\\lim\\limits_{x \\to 0^-} \\dfrac{1}{x} = -\\infty$.' },
      { type: 'propriete', titre: 'Opérations et formes indéterminées',
        texte: 'Les limites d’une somme, d’un produit ou d’un quotient se déduisent des limites de chaque terme, sauf dans les quatre <b>formes indéterminées</b> : $$\\infty - \\infty, \\qquad 0 \\times \\infty, \\qquad \\dfrac{\\infty}{\\infty}, \\qquad \\dfrac{0}{0}.$$ Pour un quotient $\\dfrac{\\ell}{0}$ avec $\\ell \\neq 0$, la limite est infinie : son signe se lit dans un tableau de signes du dénominateur.' },
      { type: 'theoreme', titre: 'Polynômes et fractions rationnelles en l’infini',
        texte: 'En $+\\infty$ ou en $-\\infty$, un polynôme a la même limite que son terme de plus haut degré ; une fraction rationnelle a la même limite que le quotient des termes de plus haut degré de son numérateur et de son dénominateur.' },
      { type: 'definition', titre: 'Asymptotes',
        texte: '• Si $\\lim\\limits_{x \\to a} f(x) = \\pm\\infty$, la droite d’équation $x = a$ est <b>asymptote verticale</b> à $C_f$.<br>• Si $\\lim\\limits_{x \\to \\pm\\infty} f(x) = b$, la droite $y = b$ est <b>asymptote horizontale</b>.<br>• Si $\\lim\\limits_{x \\to \\pm\\infty} \\big[f(x) - (ax + b)\\big] = 0$, la droite $y = ax + b$ est <b>asymptote oblique</b> ; le signe de $f(x) - (ax + b)$ donne la position de la courbe par rapport à l’asymptote.' },
      { type: 'definition', titre: 'Continuité',
        texte: 'Soit $f$ définie sur un intervalle ouvert contenant $a$. $f$ est <b>continue en $a$</b> si $\\lim\\limits_{x \\to a} f(x) = f(a)$, c’est-à-dire si les limites à gauche et à droite en $a$ existent et sont égales à $f(a)$.<br>Les polynômes, les fractions rationnelles, $x \\mapsto \\sqrt{x}$, $\\sin$ et $\\cos$ sont continues sur tout intervalle inclus dans leur ensemble de définition.' },
      { type: 'definition', titre: 'Prolongement par continuité',
        texte: 'Si $f$ n’est pas définie en $a$ mais $\\lim\\limits_{x \\to a} f(x) = \\ell$ (réel), la fonction $g$ définie par $g(x) = f(x)$ si $x \\in D_f$ et $g(a) = \\ell$ est continue en $a$ : c’est le <b>prolongement par continuité</b> de $f$ en $a$.' },
      { type: 'propriete', titre: 'Limites et ordre',
        texte: 'Si $f(x) \\geq g(x)$ au voisinage de $+\\infty$ et $\\lim\\limits_{x \\to +\\infty} g(x) = +\\infty$, alors $\\lim\\limits_{x \\to +\\infty} f(x) = +\\infty$.<br><b>Théorème des gendarmes</b> : si $g(x) \\leq f(x) \\leq h(x)$ au voisinage de $+\\infty$ et si $g$ et $h$ ont la même limite $\\ell$, alors $\\lim\\limits_{x \\to +\\infty} f(x) = \\ell$.' }
    ],
    methodes: [
      { titre: 'Lever une indétermination $\\dfrac{0}{0}$ en $a$',
        etapes: [
          'Vérifier que le numérateur et le dénominateur s’annulent en $a$.',
          'Factoriser les deux par $(x - a)$ et simplifier (pour $x \\neq a$).',
          'Avec un radical, multiplier par la quantité conjuguée : $(\\sqrt{A} - B)(\\sqrt{A} + B) = A - B^2$.',
          'Calculer la limite de l’expression simplifiée.'
        ] },
      { titre: 'Calculer une limite en une valeur interdite',
        etapes: [
          'Calculer la limite du numérateur : si elle est non nulle, la limite est infinie.',
          'Étudier le signe du dénominateur à gauche et à droite de $a$.',
          'Conclure avec la règle des signes, puis interpréter : asymptote verticale $x = a$.'
        ] },
      { titre: 'Montrer que $y = ax + b$ est asymptote oblique',
        etapes: [
          'Calculer et simplifier $f(x) - (ax + b)$.',
          'Montrer que sa limite en $+\\infty$ (ou $-\\infty$) est $0$.',
          'Étudier le signe de $f(x) - (ax + b)$ pour obtenir la position relative.'
        ] }
    ],
    exemple: {
      enonce: 'Calculer $\\lim\\limits_{x \\to 2} \\dfrac{x^2 + x - 6}{x - 2}$. En déduire que $f : x \\mapsto \\dfrac{x^2 + x - 6}{x - 2}$ est prolongeable par continuité en $2$.',
      solution: [
        'En $2$, le numérateur et le dénominateur s’annulent : forme indéterminée $\\dfrac{0}{0}$.',
        '$x^2 + x - 6 = (x - 2)(x + 3)$, donc pour $x \\neq 2$ : $f(x) = x + 3$.',
        'Ainsi $\\lim\\limits_{x \\to 2} f(x) = 5$.',
        'La limite est finie : $f$ se prolonge par continuité en $2$ en posant $g(2) = 5$.'
      ]
    },
    erreurs: [
      'Écrire « $\\dfrac{1}{0} = \\infty$ » sans étudier le signe du dénominateur à gauche et à droite.',
      'Conclure trop vite face à une forme indéterminée, par exemple « $\\infty - \\infty = 0$ ».',
      'Pour une fraction rationnelle en l’infini, ne garder le terme de plus haut degré qu’au numérateur.',
      'Oublier qu’une fonction définie par morceaux peut être discontinue au point de raccord.'
    ],
    flashcards: [
      { q: '$\\lim\\limits_{x \\to +\\infty} \\dfrac{1}{x}$', r: '$0$' },
      { q: '$\\lim\\limits_{x \\to 0^-} \\dfrac{1}{x}$', r: '$-\\infty$' },
      { q: '$\\lim\\limits_{x \\to -\\infty} x^3$', r: '$-\\infty$' },
      { q: 'Les quatre formes indéterminées', r: '$\\infty - \\infty$, $0 \\times \\infty$, $\\dfrac{\\infty}{\\infty}$, $\\dfrac{0}{0}$' },
      { q: 'Limite en $\\pm\\infty$ d’une fraction rationnelle', r: 'Celle du quotient des termes de plus haut degré' },
      { q: '$\\lim\\limits_{x \\to a} f(x) = \\pm\\infty$ signifie graphiquement…', r: 'La droite $x = a$ est asymptote verticale.' },
      { q: '$y = ax + b$ est asymptote oblique en $+\\infty$ si…', r: '$\\lim\\limits_{x \\to +\\infty} [f(x) - (ax + b)] = 0$' },
      { q: '$f$ est continue en $a$ si…', r: '$\\lim\\limits_{x \\to a} f(x) = f(a)$' }
    ],
    contexte: {
      titre: 'Le coût moyen d’une brique à Mbour',
      enonce: 'Une briqueterie de Mbour a des frais fixes de $200\\,000$ F CFA par jour et chaque brique lui coûte $75$ F CFA à fabriquer. Le coût moyen d’une brique, pour $x$ briques fabriquées, est $C_M(x) = \\dfrac{75x + 200\\,000}{x}$. Que devient ce coût moyen quand la production devient très grande ?',
      solution: [
        'Pour $x > 0$ : $C_M(x) = 75 + \\dfrac{200\\,000}{x}$.',
        'Comme $\\lim\\limits_{x \\to +\\infty} \\dfrac{200\\,000}{x} = 0$, on obtient $\\lim\\limits_{x \\to +\\infty} C_M(x) = 75$.',
        'La droite $y = 75$ est asymptote horizontale : plus la briqueterie produit, plus le coût moyen se rapproche de $75$ F CFA, sans jamais l’atteindre.'
      ]
    },
    histoire: 'Dans son « Cours d’analyse » de 1821, le Français Augustin-Louis Cauchy a placé la notion de limite au cœur de l’analyse et en a fait la base des définitions de la continuité et de la dérivée.'
  };

  /* ================================================================== */
  /* Dérivation                                                          */
  /* ================================================================== */
  EM.contenu['1s-derivation'] = {
    resume: 'Nombre dérivé, tangente, fonctions dérivées usuelles et règles de calcul ; lien entre le signe de la dérivée et le sens de variation.',
    objectifs: [
      'Calculer un nombre dérivé à l’aide de la limite du taux d’accroissement.',
      'Déterminer une équation de la tangente à une courbe en un point.',
      'Calculer la dérivée d’une somme, d’un produit, d’un quotient, d’une puissance, de $\\sqrt{u}$, de $\\cos(ax + b)$ et de $\\sin(ax + b)$.',
      'Utiliser le signe de la dérivée pour étudier le sens de variation et les extremums d’une fonction.',
      'Utiliser l’approximation affine $f(a + h) \\approx f(a) + hf\'(a)$ pour $h$ proche de $0$.'
    ],
    cours: [
      { type: 'definition', titre: 'Nombre dérivé',
        texte: '$f$ est <b>dérivable en $a$</b> si le taux d’accroissement $\\dfrac{f(a + h) - f(a)}{h}$ admet une limite finie quand $h$ tend vers $0$. Cette limite est le nombre dérivé $f\'(a)$ : $$f\'(a) = \\lim\\limits_{h \\to 0} \\dfrac{f(a + h) - f(a)}{h}.$$' },
      { type: 'theoreme', titre: 'Tangente',
        texte: 'Si $f$ est dérivable en $a$, la courbe $C_f$ admet au point $A(a ; f(a))$ une tangente de coefficient directeur $f\'(a)$, d’équation $$y = f\'(a)(x - a) + f(a).$$' },
      { type: 'formule', titre: 'Dérivées usuelles',
        texte: '$(k)\' = 0$ ; $(x)\' = 1$ ; $(x^n)\' = nx^{n-1}$ ($n$ entier non nul) ; $\\left(\\dfrac{1}{x}\\right)\' = -\\dfrac{1}{x^2}$ ; $(\\sqrt{x})\' = \\dfrac{1}{2\\sqrt{x}}$ sur $]0 ; +\\infty[$ ; $(\\sin x)\' = \\cos x$ ; $(\\cos x)\' = -\\sin x$ ; $(\\tan x)\' = 1 + \\tan^2 x = \\dfrac{1}{\\cos^2 x}$.' },
      { type: 'formule', titre: 'Opérations',
        texte: '$(u + v)\' = u\' + v\'$ ; $(ku)\' = ku\'$ ; $(uv)\' = u\'v + uv\'$ ; $\\left(\\dfrac{1}{v}\\right)\' = -\\dfrac{v\'}{v^2}$ ; $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$ ;<br>$(u^n)\' = nu\'u^{n-1}$ ; $(\\sqrt{u})\' = \\dfrac{u\'}{2\\sqrt{u}}$ (si $u > 0$) ; $\\big(f(ax + b)\\big)\' = af\'(ax + b)$, par exemple $\\big(\\cos(ax + b)\\big)\' = -a\\sin(ax + b)$.' },
      { type: 'theoreme', titre: 'Dérivée et sens de variation',
        texte: 'Soit $f$ dérivable sur un intervalle $I$ :<br>• si $f\' \\geq 0$ sur $I$, $f$ est croissante sur $I$ ; si $f\' \\leq 0$, $f$ est décroissante ; si $f\' = 0$, $f$ est constante ;<br>• si $f\' > 0$ sur $I$ sauf en des points isolés où elle s’annule, $f$ est strictement croissante sur $I$.' },
      { type: 'propriete', titre: 'Extremum local',
        texte: 'Si $f$, dérivable sur un intervalle ouvert $I$, admet un extremum local en $a \\in I$, alors $f\'(a) = 0$. Réciproquement, si $f\'$ s’annule en $a$ <b>en changeant de signe</b>, $f(a)$ est un extremum local.' },
      { type: 'remarque', titre: 'Dérivabilité et continuité',
        texte: 'Une fonction dérivable en $a$ est continue en $a$. La réciproque est fausse : $x \\mapsto |x|$ est continue mais non dérivable en $0$ ; $x \\mapsto \\sqrt{x}$ n’est pas dérivable en $0$.' }
    ],
    methodes: [
      { titre: 'Déterminer une équation de la tangente en $a$',
        etapes: [
          'Calculer $f(a)$.',
          'Calculer $f\'(x)$ puis $f\'(a)$.',
          'Remplacer dans $y = f\'(a)(x - a) + f(a)$ et réduire sous la forme $y = mx + p$.'
        ] },
      { titre: 'Calculer une dérivée',
        etapes: [
          'Reconnaître la structure : somme, produit, quotient, puissance, composée ($\\sqrt{u}$, $\\cos(ax + b)$…).',
          'Nommer $u$ et $v$, calculer $u\'$ et $v\'$, appliquer la formule.',
          'Simplifier et, si on étudie le signe, factoriser le résultat.'
        ] }
    ],
    exemple: {
      enonce: 'Soit $f(x) = \\dfrac{2x + 1}{x - 3}$ sur $\\R \\setminus \\{3\\}$. Calculer $f\'(x)$ puis donner une équation de la tangente au point d’abscisse $4$.',
      solution: [
        '$u = 2x + 1$, $u\' = 2$ ; $v = x - 3$, $v\' = 1$.',
        '$f\'(x) = \\dfrac{2(x - 3) - (2x + 1) \\times 1}{(x - 3)^2} = \\dfrac{-7}{(x - 3)^2}$.',
        '$f(4) = 9$ et $f\'(4) = -7$.',
        'Tangente : $y = -7(x - 4) + 9$, soit $y = -7x + 37$.'
      ]
    },
    erreurs: [
      '$(uv)\' = u\'v\'$ : FAUX ! La bonne formule est $(uv)\' = u\'v + uv\'$.',
      'Oublier le facteur $a$ : $\\big(\\cos(ax + b)\\big)\' = -a\\sin(ax + b)$.',
      'Inverser le numérateur de $\\left(\\dfrac{u}{v}\\right)\'$ : c’est $u\'v - uv\'$, dans cet ordre.',
      'Confondre $f(a)$ (ordonnée du point) et $f\'(a)$ (coefficient directeur) dans l’équation de la tangente.'
    ],
    flashcards: [
      { q: '$(x^n)\'$', r: '$nx^{n-1}$' },
      { q: '$\\left(\\dfrac{1}{x}\\right)\'$', r: '$-\\dfrac{1}{x^2}$' },
      { q: '$(\\sqrt{x})\'$', r: '$\\dfrac{1}{2\\sqrt{x}}$ sur $]0 ; +\\infty[$' },
      { q: '$(uv)\'$', r: '$u\'v + uv\'$' },
      { q: '$\\left(\\dfrac{u}{v}\\right)\'$', r: '$\\dfrac{u\'v - uv\'}{v^2}$' },
      { q: '$(u^n)\'$', r: '$nu\'u^{n-1}$' },
      { q: '$(\\sqrt{u})\'$', r: '$\\dfrac{u\'}{2\\sqrt{u}}$' },
      { q: '$\\big(\\cos(ax + b)\\big)\'$', r: '$-a\\sin(ax + b)$' },
      { q: '$\\big(\\sin(ax + b)\\big)\'$', r: '$a\\cos(ax + b)$' },
      { q: 'Équation de la tangente en $a$', r: '$y = f\'(a)(x - a) + f(a)$' }
    ],
    contexte: {
      titre: 'La pirogue de Soumbédioune',
      enonce: 'Une pirogue quitte la plage de Soumbédioune. La distance parcourue (en km) au bout de $t$ heures est $d(t) = -t^3 + 6t^2$ pour $t \\in [0 ; 4]$. Calculer sa vitesse à $t = 1$ h, puis déterminer l’instant où elle va le plus vite.',
      solution: [
        'La vitesse instantanée est la dérivée de la distance : $v(t) = d\'(t) = -3t^2 + 12t$.',
        'À $t = 1$ : $v(1) = -3 + 12 = 9$ km/h.',
        '$v\'(t) = -6t + 12$ s’annule en $t = 2$ en passant du positif au négatif : $v$ est maximale en $t = 2$.',
        'La vitesse maximale est $v(2) = -12 + 24 = 12$ km/h, atteinte au bout de 2 heures.'
      ]
    },
    histoire: 'Le calcul différentiel a été inventé indépendamment par Isaac Newton et Gottfried Wilhelm Leibniz à la fin du XVIIᵉ siècle. La notation $f\'(x)$ et le nom de « fonction dérivée » sont dus à Joseph-Louis Lagrange (Théorie des fonctions analytiques, 1797).'
  };

  /* ================================================================== */
  /* Étude et représentation graphique de fonctions                     */
  /* ================================================================== */
  EM.contenu['1s-etude-fonctions'] = {
    resume: 'Plan d’étude d’une fonction : ensemble de définition, limites, dérivée, tableau de variation, asymptotes, symétries, tracé de la courbe ; problèmes d’optimisation.',
    objectifs: [
      'Suivre un plan d’étude complet : $D_f$, parité ou périodicité, limites, dérivée, variations.',
      'Dresser et exploiter un tableau de variation : extremums, nombre de solutions d’une équation $f(x) = k$.',
      'Déterminer les asymptotes et la position de la courbe par rapport à une asymptote.',
      'Étudier des fonctions polynômes, rationnelles, irrationnelles et trigonométriques simples.',
      'Résoudre un problème d’optimisation à l’aide de la dérivée.',
      'Lire graphiquement des informations sur une courbe.'
    ],
    cours: [
      { type: 'definition', titre: 'Plan d’étude d’une fonction',
        texte: '1. Ensemble de définition (et éventuellement réduction de l’intervalle d’étude par parité ou périodicité).<br>2. Limites aux bornes de $D_f$ et asymptotes.<br>3. Dérivée et signe de la dérivée.<br>4. Tableau de variation.<br>5. Points et tangentes remarquables, éléments de symétrie.<br>6. Tracé de la courbe et des asymptotes.' },
      { type: 'propriete', titre: 'Fonction homographique',
        texte: 'Pour $f(x) = \\dfrac{ax + b}{cx + d}$ ($c \\neq 0$, $ad - bc \\neq 0$) : $f\'(x) = \\dfrac{ad - bc}{(cx + d)^2}$, donc $f$ est monotone sur chacun des intervalles de $D_f$. Asymptotes : $x = -\\dfrac{d}{c}$ et $y = \\dfrac{a}{c}$ ; leur point d’intersection est centre de symétrie.' },
      { type: 'propriete', titre: 'Fonction $x \\mapsto \\dfrac{ax^2 + bx + c}{dx + e}$',
        texte: 'Par division euclidienne, on écrit $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{dx + e}$. Si $\\gamma \\neq 0$ : la droite $x = -\\dfrac{e}{d}$ est asymptote verticale, la droite $y = \\alpha x + \\beta$ est asymptote oblique en $\\pm\\infty$, et le point d’intersection des asymptotes est centre de symétrie de la courbe.' },
      { type: 'remarque', titre: 'Fonctions périodiques',
        texte: 'Si $f$ est périodique de période $T$, on l’étudie sur un intervalle de longueur $T$, puis on complète la courbe par des translations de vecteurs $kT\\vec{i}$. Si, de plus, $f$ est paire ou impaire, on peut se limiter à $\\left[0 ; \\dfrac{T}{2}\\right]$.' },
      { type: 'propriete', titre: 'Nombre de solutions de $f(x) = k$',
        texte: 'Si $f$ est continue et strictement monotone sur $[a ; b]$, alors, pour tout réel $k$ compris entre $f(a)$ et $f(b)$, l’équation $f(x) = k$ admet une <b>unique</b> solution dans $[a ; b]$ (propriété admise). Le tableau de variation permet ainsi de compter les solutions d’une équation.' },
      { type: 'remarque', titre: 'Tangentes remarquables',
        texte: 'Si $f\'(a) = 0$, la tangente au point d’abscisse $a$ est horizontale : c’est le cas aux extremums locaux. Une tangente se trace en partant du point de contact avec la pente $f\'(a)$.' }
    ],
    methodes: [
      { titre: 'Étudier une fonction rationnelle',
        etapes: [
          'Déterminer $D_f$ (valeurs interdites).',
          'Calculer les limites aux bornes de $D_f$ et en déduire les asymptotes.',
          'Calculer $f\'(x)$, factoriser son numérateur et étudier son signe (le dénominateur $v^2$ est positif).',
          'Dresser le tableau de variation avec une double barre aux valeurs interdites.',
          'Tracer les asymptotes, placer quelques points et les tangentes horizontales, puis la courbe.'
        ] },
      { titre: 'Résoudre un problème d’optimisation',
        etapes: [
          'Choisir la variable $x$ et préciser l’intervalle où elle varie.',
          'Exprimer la grandeur à optimiser (bénéfice, aire, coût…) en fonction de $x$.',
          'Étudier les variations de cette fonction à l’aide de la dérivée.',
          'Lire le maximum (ou le minimum) dans le tableau et répondre à la question posée, avec l’unité.'
        ] }
    ],
    exemple: {
      enonce: 'Étudier les variations de $f(x) = x^3 - 3x + 1$ sur $\\R$ et donner le nombre de solutions de $f(x) = 0$.',
      solution: [
        '$D_f = \\R$ ; $\\lim\\limits_{x \\to -\\infty} f(x) = -\\infty$ et $\\lim\\limits_{x \\to +\\infty} f(x) = +\\infty$ (terme de plus haut degré $x^3$).',
        '$f\'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$ : positive sur $]-\\infty ; -1[$ et $]1 ; +\\infty[$, négative sur $]-1 ; 1[$.',
        '$f$ est croissante sur $]-\\infty ; -1]$, décroissante sur $[-1 ; 1]$, croissante sur $[1 ; +\\infty[$ ; maximum local $f(-1) = 3$, minimum local $f(1) = -1$.',
        'Sur chacun des trois intervalles, $f$ est strictement monotone et $0$ est atteint : l’équation $f(x) = 0$ a exactement trois solutions.'
      ]
    },
    erreurs: [
      'Oublier les valeurs interdites dans le tableau de variation (double barre).',
      'Conclure à un extremum dès que $f\'(a) = 0$ sans vérifier le changement de signe : $x \\mapsto x^3$ n’a pas d’extremum en $0$.',
      'Confondre l’abscisse d’un extremum et sa valeur, ou un extremum local avec un extremum sur tout $D_f$.',
      'Oublier de vérifier que la valeur optimale trouvée appartient à l’intervalle imposé par le problème.'
    ],
    flashcards: [
      { q: 'Si $f\' > 0$ sur un intervalle $I$…', r: '$f$ est strictement croissante sur $I$.' },
      { q: 'Condition pour un extremum local en $a$', r: '$f\'(a) = 0$ et $f\'$ change de signe en $a$' },
      { q: 'Dérivée de $\\dfrac{ax + b}{cx + d}$', r: '$\\dfrac{ad - bc}{(cx + d)^2}$' },
      { q: 'Tangente en un extremum local', r: 'Elle est horizontale ($f\'(a) = 0$).' },
      { q: 'Asymptotes de $f(x) = \\alpha x + \\beta + \\dfrac{\\gamma}{x - x_0}$', r: '$x = x_0$ (verticale) et $y = \\alpha x + \\beta$ (oblique)' },
      { q: 'Position de $C_f$ par rapport à l’asymptote $y = ax + b$', r: 'Signe de $f(x) - (ax + b)$' },
      { q: '$f$ continue, strictement monotone sur $[a ; b]$, $k$ entre $f(a)$ et $f(b)$', r: '$f(x) = k$ a une unique solution dans $[a ; b]$.' }
    ],
    contexte: {
      titre: 'L’enclos d’un maraîcher des Niayes',
      enonce: 'Un maraîcher des Niayes veut clôturer un enclos rectangulaire de $800$ m² adossé à un mur : seuls trois côtés sont grillagés. Quelles dimensions minimisent la longueur de grillage ?',
      solution: [
        'Notons $x$ (en m) la longueur des deux côtés perpendiculaires au mur ; le troisième mesure $\\dfrac{800}{x}$. Longueur de grillage : $L(x) = 2x + \\dfrac{800}{x}$ pour $x > 0$.',
        '$L\'(x) = 2 - \\dfrac{800}{x^2} = \\dfrac{2(x^2 - 400)}{x^2} = \\dfrac{2(x - 20)(x + 20)}{x^2}$.',
        'Sur $]0 ; +\\infty[$, $L\'(x)$ est négatif avant $20$ et positif après : $L$ admet un minimum en $x = 20$.',
        'Dimensions : $20$ m sur $40$ m, pour $L(20) = 40 + 40 = 80$ m de grillage.'
      ]
    },
    histoire: 'Dans les années 1630, Pierre de Fermat imagina une méthode pour trouver les maximums et minimums d’une grandeur : elle revient à chercher les points où la tangente est horizontale, c’est-à-dire où la dérivée s’annule.'
  };

  /* ================================================================== */
  /* Suites numériques                                                   */
  /* ================================================================== */
  EM.contenu['1s-suites'] = {
    resume: 'Suites numériques : modes de définition, sens de variation, suites arithmétiques et géométriques, sommes de termes, suites auxiliaires et raisonnement par récurrence.',
    objectifs: [
      'Calculer des termes d’une suite définie explicitement ou par une relation de récurrence.',
      'Étudier le sens de variation d’une suite.',
      'Reconnaître une suite arithmétique ou géométrique et exprimer $u_n$ en fonction de $n$.',
      'Calculer la somme de termes consécutifs d’une suite arithmétique ou géométrique.',
      'Étudier une suite $u_{n+1} = au_n + b$ à l’aide d’une suite auxiliaire géométrique.',
      'Démontrer une propriété par récurrence.'
    ],
    cours: [
      { type: 'definition', titre: 'Suite numérique',
        texte: 'Une suite $(u_n)$ associe à tout entier naturel $n$ (éventuellement à partir d’un rang $n_0$) un réel $u_n$. Elle peut être définie <b>explicitement</b> ($u_n = f(n)$) ou <b>par récurrence</b> (premier terme et relation $u_{n+1} = f(u_n)$).' },
      { type: 'definition', titre: 'Sens de variation',
        texte: '$(u_n)$ est croissante si $u_{n+1} \\geq u_n$ pour tout $n$, décroissante si $u_{n+1} \\leq u_n$. Pour l’étudier : signe de $u_{n+1} - u_n$ ; ou, si tous les termes sont strictement positifs, comparaison de $\\dfrac{u_{n+1}}{u_n}$ à $1$ ; ou, si $u_n = f(n)$, sens de variation de $f$ sur $[0 ; +\\infty[$.<br>$(u_n)$ est <b>majorée</b> s’il existe $M$ tel que $u_n \\leq M$ pour tout $n$, <b>minorée</b> s’il existe $m$ tel que $u_n \\geq m$, <b>bornée</b> si elle est les deux.' },
      { type: 'formule', titre: 'Suite arithmétique de raison $r$',
        texte: '$u_{n+1} = u_n + r$ ; $u_n = u_0 + nr$ et plus généralement $u_n = u_p + (n - p)r$.<br>Somme de termes consécutifs : $$S = (\\text{nombre de termes}) \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}.$$ En particulier $1 + 2 + \\dots + n = \\dfrac{n(n + 1)}{2}$.' },
      { type: 'formule', titre: 'Suite géométrique de raison $q$',
        texte: '$u_{n+1} = q\\,u_n$ ; $u_n = u_0\\,q^n$ et plus généralement $u_n = u_p\\,q^{n - p}$.<br>Pour $q \\neq 1$ : $$S = \\text{premier terme} \\times \\dfrac{1 - q^{\\text{nombre de termes}}}{1 - q}, \\qquad 1 + q + \\dots + q^n = \\dfrac{1 - q^{n+1}}{1 - q}.$$' },
      { type: 'theoreme', titre: 'Raisonnement par récurrence',
        texte: 'Pour démontrer qu’une propriété $P(n)$ est vraie pour tout $n \\geq n_0$ :<br>• <b>initialisation</b> : on vérifie $P(n_0)$ ;<br>• <b>hérédité</b> : on suppose $P(n)$ vraie pour un entier $n \\geq n_0$ et on démontre $P(n + 1)$ ;<br>• <b>conclusion</b> : $P(n)$ est vraie pour tout $n \\geq n_0$.' },
      { type: 'remarque', titre: 'Suites $u_{n+1} = au_n + b$ ($a \\neq 1$)',
        texte: 'Une telle suite n’est en général ni arithmétique ni géométrique. On pose $\\ell = \\dfrac{b}{1 - a}$ (solution de $\\ell = a\\ell + b$) ; la suite $v_n = u_n - \\ell$ est alors géométrique de raison $a$, d’où $u_n = (u_0 - \\ell)\\,a^n + \\ell$.' }
    ],
    methodes: [
      { titre: 'Montrer qu’une suite est arithmétique ou géométrique',
        etapes: [
          'Calculer $u_{n+1} - u_n$ : si le résultat est une constante $r$, la suite est arithmétique de raison $r$.',
          'Ou exprimer $u_{n+1}$ en fonction de $u_n$ : si $u_{n+1} = q\\,u_n$ avec $q$ constant, la suite est géométrique de raison $q$.',
          'Préciser le premier terme et écrire le terme général.'
        ] },
      { titre: 'Calculer une somme de termes',
        etapes: [
          'Identifier la nature de la suite et sa raison.',
          'Compter les termes : de $u_p$ à $u_n$, il y a $n - p + 1$ termes.',
          'Appliquer la formule de la somme adaptée.'
        ] },
      { titre: 'Utiliser une suite auxiliaire',
        etapes: [
          'Exprimer $v_{n+1}$ en fonction de $u_n$, puis de $v_n$.',
          'Reconnaître une suite géométrique ; calculer $v_0$ et écrire $v_n = v_0\\,q^n$.',
          'Revenir à $u_n$ : par exemple $u_n = v_n + \\ell$.'
        ] }
    ],
    exemple: {
      enonce: 'Soit $u_0 = 5$ et $u_{n+1} = \\dfrac{1}{2}u_n + 3$. On pose $v_n = u_n - 6$. Montrer que $(v_n)$ est géométrique et exprimer $u_n$ en fonction de $n$.',
      solution: [
        '$v_{n+1} = u_{n+1} - 6 = \\dfrac{1}{2}u_n + 3 - 6 = \\dfrac{1}{2}u_n - 3 = \\dfrac{1}{2}(u_n - 6) = \\dfrac{1}{2}v_n$.',
        '$(v_n)$ est géométrique de raison $\\dfrac{1}{2}$ et de premier terme $v_0 = 5 - 6 = -1$.',
        'Donc $v_n = -\\left(\\dfrac{1}{2}\\right)^n$ et $u_n = 6 - \\left(\\dfrac{1}{2}\\right)^n$.'
      ]
    },
    erreurs: [
      'Se tromper dans le nombre de termes : de $u_0$ à $u_n$, il y a $n + 1$ termes.',
      'Écrire $u_n = u_1 + nr$ alors que, si le premier terme est $u_1$, on a $u_n = u_1 + (n - 1)r$.',
      'Écrire $q^n$ au lieu de $q^{n+1}$ dans la somme $u_0 + u_1 + \\dots + u_n$.',
      'Croire qu’une suite $u_{n+1} = au_n + b$ (avec $b \\neq 0$) est géométrique.'
    ],
    flashcards: [
      { q: 'Terme général d’une suite arithmétique', r: '$u_n = u_0 + nr = u_p + (n - p)r$' },
      { q: 'Terme général d’une suite géométrique', r: '$u_n = u_0\\,q^n = u_p\\,q^{n-p}$' },
      { q: 'Somme de termes d’une suite arithmétique', r: '$\\text{(nb de termes)} \\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$' },
      { q: 'Somme de termes d’une suite géométrique ($q \\neq 1$)', r: '$\\text{premier} \\times \\dfrac{1 - q^{\\text{nb de termes}}}{1 - q}$' },
      { q: '$1 + 2 + \\dots + n$', r: '$\\dfrac{n(n + 1)}{2}$' },
      { q: 'Nombre de termes de $u_p$ à $u_n$', r: '$n - p + 1$' },
      { q: 'Les trois étapes d’une récurrence', r: 'Initialisation, hérédité, conclusion' },
      { q: 'Suite auxiliaire pour $u_{n+1} = au_n + b$', r: '$v_n = u_n - \\ell$ avec $\\ell = \\dfrac{b}{1 - a}$ : géométrique de raison $a$' }
    ],
    contexte: {
      titre: 'L’épargne de Moussa à Dakar',
      enonce: 'Moussa place $500\\,000$ F CFA dans une banque de Dakar au taux annuel de $4\\,\\%$ à intérêts composés. On note $C_n$ son capital au bout de $n$ années. Exprimer $C_n$ en fonction de $n$, calculer $C_5$, puis trouver au bout de combien d’années le capital dépasse $700\\,000$ F CFA.',
      solution: [
        'Chaque année, le capital est multiplié par $1 + \\dfrac{4}{100} = 1{,}04$ : $(C_n)$ est géométrique de raison $1{,}04$ et $C_n = 500\\,000 \\times 1{,}04^n$.',
        '$C_5 = 500\\,000 \\times 1{,}04^5 \\approx 608\\,326$ F CFA.',
        'À la calculatrice : $C_8 \\approx 684\\,285$ et $C_9 \\approx 711\\,656$.',
        'Le capital dépasse $700\\,000$ F CFA au bout de $9$ ans.'
      ]
    },
    histoire: 'On raconte que le jeune Carl Friedrich Gauss, à l’école, calcula en quelques instants $1 + 2 + \\dots + 100 = 5\\,050$ en regroupant les termes deux à deux : $1 + 100$, $2 + 99$, …, soit $50$ paires valant chacune $101$.'
  };

  /* ================================================================== */
  /* Trigonométrie                                                       */
  /* ================================================================== */
  EM.contenu['1s-trigonometrie'] = {
    resume: 'Formules d’addition et de duplication, transformation de $a\\cos x + b\\sin x$, équations et inéquations trigonométriques.',
    objectifs: [
      'Connaître les valeurs remarquables et les formules des angles associés.',
      'Utiliser les formules d’addition et de duplication pour calculer des valeurs exactes.',
      'Linéariser $\\cos^2 x$ et $\\sin^2 x$.',
      'Transformer $a\\cos x + b\\sin x$ en $r\\cos(x - \\varphi)$.',
      'Résoudre les équations $\\cos x = \\cos\\alpha$, $\\sin x = \\sin\\alpha$, $\\tan x = \\tan\\alpha$ et des inéquations simples, dans $\\R$ ou dans un intervalle.'
    ],
    cours: [
      { type: 'formule', titre: 'Angles associés',
        texte: '$\\cos(-x) = \\cos x$, $\\sin(-x) = -\\sin x$ ; $\\cos(\\pi - x) = -\\cos x$, $\\sin(\\pi - x) = \\sin x$ ;<br>$\\cos(\\pi + x) = -\\cos x$, $\\sin(\\pi + x) = -\\sin x$ ; $\\cos\\left(\\dfrac{\\pi}{2} - x\\right) = \\sin x$, $\\sin\\left(\\dfrac{\\pi}{2} - x\\right) = \\cos x$.' },
      { type: 'formule', titre: 'Formules d’addition',
        texte: '$\\cos(a + b) = \\cos a\\cos b - \\sin a\\sin b$ ; $\\cos(a - b) = \\cos a\\cos b + \\sin a\\sin b$ ;<br>$\\sin(a + b) = \\sin a\\cos b + \\cos a\\sin b$ ; $\\sin(a - b) = \\sin a\\cos b - \\cos a\\sin b$ ;<br>$\\tan(a + b) = \\dfrac{\\tan a + \\tan b}{1 - \\tan a\\tan b}$ (lorsque ces tangentes existent).' },
      { type: 'formule', titre: 'Duplication et linéarisation',
        texte: '$\\sin 2a = 2\\sin a\\cos a$ ; $\\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$.<br>D’où : $$\\cos^2 a = \\dfrac{1 + \\cos 2a}{2}, \\qquad \\sin^2 a = \\dfrac{1 - \\cos 2a}{2}.$$' },
      { type: 'propriete', titre: 'Transformation de $a\\cos x + b\\sin x$',
        texte: 'Si $(a ; b) \\neq (0 ; 0)$, on pose $r = \\sqrt{a^2 + b^2}$ ; il existe un réel $\\varphi$ tel que $\\cos\\varphi = \\dfrac{a}{r}$ et $\\sin\\varphi = \\dfrac{b}{r}$, et alors $$a\\cos x + b\\sin x = r\\cos(x - \\varphi).$$ Exemple : $\\sqrt{3}\\cos x + \\sin x = 2\\cos\\left(x - \\dfrac{\\pi}{6}\\right)$.' },
      { type: 'theoreme', titre: 'Équations trigonométriques fondamentales',
        texte: 'Pour $k \\in \\Z$ :<br>• $\\cos x = \\cos\\alpha \\iff x = \\alpha + 2k\\pi$ ou $x = -\\alpha + 2k\\pi$ ;<br>• $\\sin x = \\sin\\alpha \\iff x = \\alpha + 2k\\pi$ ou $x = \\pi - \\alpha + 2k\\pi$ ;<br>• $\\tan x = \\tan\\alpha \\iff x = \\alpha + k\\pi$.' },
      { type: 'remarque', titre: 'Résolution dans un intervalle',
        texte: 'Pour obtenir les solutions dans un intervalle (par exemple $]-\\pi ; \\pi]$), on donne à $k$ des valeurs entières successives et on garde celles qui conviennent. Attention : $2x = \\alpha + 2k\\pi$ donne $x = \\dfrac{\\alpha}{2} + k\\pi$. Les inéquations se résolvent en lisant le cercle trigonométrique.' }
    ],
    methodes: [
      { titre: 'Calculer une valeur exacte',
        etapes: [
          'Écrire l’angle comme somme ou différence d’angles remarquables, par exemple $\\dfrac{\\pi}{12} = \\dfrac{\\pi}{3} - \\dfrac{\\pi}{4}$.',
          'Appliquer la formule d’addition adaptée.',
          'Remplacer par les valeurs remarquables et simplifier.'
        ] },
      { titre: 'Résoudre une équation trigonométrique dans $]-\\pi ; \\pi]$',
        etapes: [
          'Se ramener à $\\cos X = \\cos\\alpha$ ou $\\sin X = \\sin\\alpha$ avec $\\alpha$ remarquable.',
          'Écrire les deux familles de solutions avec $k \\in \\Z$, puis isoler $x$.',
          'Donner à $k$ les valeurs qui placent $x$ dans $]-\\pi ; \\pi]$ et vérifier sur le cercle trigonométrique.'
        ] },
      { titre: 'Résoudre $a\\cos x + b\\sin x = c$',
        etapes: [
          'Calculer $r = \\sqrt{a^2 + b^2}$ et factoriser par $r$.',
          'Reconnaître $\\cos\\varphi = \\dfrac{a}{r}$ et $\\sin\\varphi = \\dfrac{b}{r}$ pour obtenir $r\\cos(x - \\varphi) = c$.',
          'Résoudre $\\cos(x - \\varphi) = \\dfrac{c}{r}$.'
        ] }
    ],
    exemple: {
      enonce: 'Résoudre dans $]-\\pi ; \\pi]$ l’équation $\\cos 2x = \\dfrac{1}{2}$.',
      solution: [
        '$\\cos 2x = \\cos\\dfrac{\\pi}{3} \\iff 2x = \\dfrac{\\pi}{3} + 2k\\pi$ ou $2x = -\\dfrac{\\pi}{3} + 2k\\pi$ ($k \\in \\Z$).',
        'Donc $x = \\dfrac{\\pi}{6} + k\\pi$ ou $x = -\\dfrac{\\pi}{6} + k\\pi$.',
        'Dans $]-\\pi ; \\pi]$ : $x = \\dfrac{\\pi}{6}$, $x = -\\dfrac{5\\pi}{6}$ (première famille) et $x = -\\dfrac{\\pi}{6}$, $x = \\dfrac{5\\pi}{6}$ (seconde famille).',
        '$S = \\left\\{-\\dfrac{5\\pi}{6} ; -\\dfrac{\\pi}{6} ; \\dfrac{\\pi}{6} ; \\dfrac{5\\pi}{6}\\right\\}$.'
      ]
    },
    erreurs: [
      '$\\cos(a + b) = \\cos a + \\cos b$ : FAUX ! Il faut utiliser la formule d’addition.',
      'Oublier la seconde famille de solutions ($-\\alpha + 2k\\pi$ pour le cosinus, $\\pi - \\alpha + 2k\\pi$ pour le sinus).',
      'Ne pas diviser $2k\\pi$ par $2$ : $2x = \\alpha + 2k\\pi$ donne $x = \\dfrac{\\alpha}{2} + k\\pi$.',
      'Oublier que le signe de $\\sin a$ (déduit de $\\cos a$) dépend de l’intervalle auquel appartient $a$.'
    ],
    flashcards: [
      { q: '$\\cos(a + b)$', r: '$\\cos a\\cos b - \\sin a\\sin b$' },
      { q: '$\\sin(a + b)$', r: '$\\sin a\\cos b + \\cos a\\sin b$' },
      { q: '$\\cos 2a$ (trois écritures)', r: '$\\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$' },
      { q: '$\\sin 2a$', r: '$2\\sin a\\cos a$' },
      { q: '$\\cos^2 a$ linéarisé', r: '$\\dfrac{1 + \\cos 2a}{2}$' },
      { q: '$\\cos x = \\cos\\alpha$', r: '$x = \\alpha + 2k\\pi$ ou $x = -\\alpha + 2k\\pi$' },
      { q: '$\\sin x = \\sin\\alpha$', r: '$x = \\alpha + 2k\\pi$ ou $x = \\pi - \\alpha + 2k\\pi$' },
      { q: '$\\cos\\dfrac{\\pi}{12}$', r: '$\\dfrac{\\sqrt{6} + \\sqrt{2}}{4}$' },
      { q: '$\\sqrt{3}\\cos x + \\sin x$', r: '$2\\cos\\left(x - \\dfrac{\\pi}{6}\\right)$' }
    ],
    contexte: {
      titre: 'La grande roue de la foire de Dakar',
      enonce: 'Lors d’une foire à Dakar, Fatou monte dans une grande roue. Sa hauteur (en m) au bout de $t$ secondes est $h(t) = 10 - 8\\cos\\left(\\dfrac{\\pi t}{30}\\right)$ ; un tour dure $60$ s. À quels instants du premier tour est-elle à $14$ m du sol ?',
      solution: [
        '$h(t) = 14 \\iff -8\\cos\\left(\\dfrac{\\pi t}{30}\\right) = 4 \\iff \\cos\\left(\\dfrac{\\pi t}{30}\\right) = -\\dfrac{1}{2}$.',
        'Pour $t \\in [0 ; 60]$, on a $\\dfrac{\\pi t}{30} \\in [0 ; 2\\pi]$, et $\\cos X = -\\dfrac{1}{2}$ donne $X = \\dfrac{2\\pi}{3}$ ou $X = \\dfrac{4\\pi}{3}$.',
        '$\\dfrac{\\pi t}{30} = \\dfrac{2\\pi}{3} \\iff t = 20$ et $\\dfrac{\\pi t}{30} = \\dfrac{4\\pi}{3} \\iff t = 40$.',
        'Fatou est à $14$ m au bout de $20$ s (en montant) et de $40$ s (en descendant).'
      ]
    },
    histoire: 'Dans l’Almageste (IIᵉ siècle), l’astronome Claude Ptolémée construit une table de cordes en utilisant une relation sur les quadrilatères inscrits dans un cercle (le théorème de Ptolémée), qui équivaut à nos formules d’addition.'
  };

  /* ================================================================== */
  /* Dénombrement                                                        */
  /* ================================================================== */
  EM.contenu['1s-denombrement'] = {
    resume: 'Ensembles finis et cardinal, principe multiplicatif ; $p$-listes, arrangements, permutations et combinaisons ; formule du binôme de Newton.',
    objectifs: [
      'Utiliser le cardinal d’une réunion, du complémentaire et d’un produit cartésien.',
      'Dénombrer des $p$-listes (tirages successifs avec remise, codes).',
      'Dénombrer des arrangements et des permutations (tirages successifs sans remise, classements, anagrammes).',
      'Dénombrer des combinaisons (tirages simultanés, comités).',
      'Utiliser les propriétés des $C_n^p$ (symétrie, triangle de Pascal) et la formule du binôme de Newton.'
    ],
    cours: [
      { type: 'propriete', titre: 'Cardinal et principe multiplicatif',
        texte: '$\\Card(A \\cup B) = \\Card A + \\Card B - \\Card(A \\cap B)$ ; $\\Card \\overline{A} = \\Card E - \\Card A$ ; $\\Card(A \\times B) = \\Card A \\times \\Card B$.<br><b>Principe multiplicatif</b> : si un choix se fait en plusieurs étapes successives offrant $n_1$, puis $n_2$, …, puis $n_k$ possibilités, il y a $n_1 \\times n_2 \\times \\dots \\times n_k$ choix (on peut s’aider d’un arbre).' },
      { type: 'definition', titre: '$p$-listes',
        texte: 'Une $p$-liste d’un ensemble $E$ à $n$ éléments est une suite ordonnée de $p$ éléments de $E$, distincts ou non. Il y en a $$n^p.$$ Modèle : tirages successifs <b>avec remise</b>, codes, numéros.' },
      { type: 'definition', titre: 'Arrangements et permutations',
        texte: 'Un arrangement de $p$ éléments parmi $n$ ($p \\leq n$) est une $p$-liste d’éléments <b>distincts</b>. Il y en a $$A_n^p = n(n - 1)\\cdots(n - p + 1) = \\dfrac{n!}{(n - p)!}.$$ Une permutation est un arrangement des $n$ éléments : il y en a $n! = n \\times (n - 1) \\times \\dots \\times 1$, avec $0! = 1$. Modèle : tirages successifs <b>sans remise</b>, classements, bureaux (président, secrétaire…).' },
      { type: 'definition', titre: 'Combinaisons',
        texte: 'Une combinaison de $p$ éléments parmi $n$ est une partie à $p$ éléments (sans ordre). Il y en a $$C_n^p = \\dfrac{n!}{p!\\,(n - p)!} = \\dfrac{A_n^p}{p!}.$$ Modèle : tirages <b>simultanés</b>, comités, mains de cartes.' },
      { type: 'propriete', titre: 'Propriétés des $C_n^p$',
        texte: '$C_n^0 = C_n^n = 1$ ; $C_n^1 = n$ ; $C_n^p = C_n^{n - p}$ ; <b>relation de Pascal</b> : $C_n^p + C_n^{p+1} = C_{n+1}^{p+1}$ ; $C_n^0 + C_n^1 + \\dots + C_n^n = 2^n$ (nombre de parties d’un ensemble à $n$ éléments).' },
      { type: 'theoreme', titre: 'Formule du binôme de Newton',
        texte: 'Pour tous réels $a$ et $b$ et tout entier $n \\geq 1$ : $$(a + b)^n = \\sum_{p=0}^{n} C_n^p\\,a^{n-p}\\,b^p.$$ Par exemple $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$.' },
      { type: 'remarque', titre: 'Choisir le bon modèle',
        texte: 'L’ordre compte et les répétitions sont possibles : $n^p$. L’ordre compte, sans répétition : $A_n^p$. L’ordre ne compte pas, sans répétition : $C_n^p$.<br>Anagrammes d’un mot de $n$ lettres dont certaines se répètent $n_1$, $n_2$, … fois : $\\dfrac{n!}{n_1!\\,n_2!\\cdots}$.' }
    ],
    methodes: [
      { titre: 'Choisir le bon outil de dénombrement',
        etapes: [
          'Se demander si l’ordre des éléments compte (tirage successif, rôles distincts) ou non (tirage simultané, groupe).',
          'Se demander si un élément peut être choisi plusieurs fois (avec remise) ou non.',
          'En déduire $n^p$, $A_n^p$ ou $C_n^p$ ; découper en étapes et multiplier si nécessaire.'
        ] },
      { titre: 'Dénombrer avec « au moins un »',
        etapes: [
          'Compter le nombre total de cas.',
          'Compter le contraire (« aucun »).',
          'Faire la différence : (au moins un) = (total) − (aucun).'
        ] }
    ],
    exemple: {
      enonce: 'Une classe de 10 élèves (6 filles et 4 garçons) élit un comité de 3 délégués. Combien de comités sont possibles ? Combien comptent exactement 2 filles ? Combien comptent au moins un garçon ?',
      solution: [
        'Un comité est une partie à 3 éléments : $C_{10}^3 = \\dfrac{10 \\times 9 \\times 8}{3 \\times 2 \\times 1} = 120$ comités.',
        'Exactement 2 filles : on choisit 2 filles parmi 6 et 1 garçon parmi 4, soit $C_6^2 \\times C_4^1 = 15 \\times 4 = 60$ comités.',
        'Au moins un garçon : on retire les comités sans garçon, $C_6^3 = 20$ ; il reste $120 - 20 = 100$ comités.'
      ]
    },
    erreurs: [
      'Utiliser $A_n^p$ alors que l’ordre ne compte pas (comité), ou $C_n^p$ alors qu’il compte (bureau avec des rôles).',
      'Additionner au lieu de multiplier : des étapes successives (« et ») se multiplient.',
      'Oublier les lettres répétées dans le calcul d’un nombre d’anagrammes.',
      'Compter « au moins un » directement en oubliant des cas : passer par le contraire.'
    ],
    flashcards: [
      { q: '$n!$', r: '$n \\times (n - 1) \\times \\dots \\times 2 \\times 1$, avec $0! = 1$' },
      { q: '$A_n^p$', r: '$\\dfrac{n!}{(n - p)!} = n(n - 1)\\cdots(n - p + 1)$' },
      { q: '$C_n^p$', r: '$\\dfrac{n!}{p!\\,(n - p)!}$' },
      { q: 'Nombre de $p$-listes d’un ensemble à $n$ éléments', r: '$n^p$' },
      { q: 'Relation de symétrie', r: '$C_n^p = C_n^{n - p}$' },
      { q: 'Relation de Pascal', r: '$C_n^p + C_n^{p+1} = C_{n+1}^{p+1}$' },
      { q: 'Nombre de parties d’un ensemble à $n$ éléments', r: '$2^n$' },
      { q: 'Tirages simultanés de $p$ boules parmi $n$', r: '$C_n^p$' },
      { q: 'Tirages successifs sans remise de $p$ boules parmi $n$', r: '$A_n^p$' },
      { q: 'Anagrammes de DAKAR', r: '$\\dfrac{5!}{2!} = 60$' }
    ],
    contexte: {
      titre: 'Élections dans un lycée de Ziguinchor',
      enonce: 'Une classe de 1ère S2 d’un lycée de Ziguinchor compte 40 élèves. Combien de bureaux (un chef de classe, un adjoint, un trésorier) peut-on former ? Combien de groupes de 3 délégués (sans fonction particulière) ?',
      solution: [
        'Pour le bureau, les rôles sont distincts : l’ordre compte, sans répétition. Il y a $A_{40}^3 = 40 \\times 39 \\times 38 = 59\\,280$ bureaux.',
        'Pour les délégués, l’ordre ne compte pas : $C_{40}^3 = \\dfrac{A_{40}^3}{3!} = \\dfrac{59\\,280}{6} = 9\\,880$ groupes.',
        'Chaque groupe de 3 délégués correspond à $3! = 6$ bureaux différents, d’où le rapport $6$.'
      ]
    },
    histoire: 'Le tableau des coefficients $C_n^p$ porte le nom de Blaise Pascal, qui rédigea son « Traité du triangle arithmétique » en 1654. Ce triangle était déjà connu bien avant, notamment du mathématicien chinois Yang Hui au XIIIᵉ siècle.'
  };

  /* ================================================================== */
  /* Statistiques (1ère S2)                                              */
  /* ================================================================== */
  EM.contenu['1s-statistiques'] = {
    resume: 'Séries statistiques à une variable : paramètres de position (moyenne, médiane, mode) et de dispersion (variance, écart-type), séries regroupées en classes ; premières notions sur les séries à deux variables.',
    objectifs: [
      'Calculer la moyenne, la médiane et le mode d’une série (valeurs isolées ou regroupées en classes).',
      'Calculer la variance et l’écart-type et interpréter la dispersion d’une série.',
      'Utiliser l’effet d’un changement de variable $y = ax + b$ sur la moyenne et l’écart-type.',
      'Construire et lire un polygone des effectifs cumulés ; déterminer une médiane par interpolation.',
      'Lire un tableau à deux variables, représenter un nuage de points et calculer le point moyen.'
    ],
    cours: [
      { type: 'definition', titre: 'Moyenne',
        texte: 'Pour une série de valeurs $x_1, \\dots, x_p$ d’effectifs $n_1, \\dots, n_p$ et d’effectif total $N$ : $$\\overline{x} = \\dfrac{n_1x_1 + n_2x_2 + \\dots + n_px_p}{N}.$$ Pour une série regroupée en classes, on remplace chaque classe par son <b>centre</b>.' },
      { type: 'definition', titre: 'Variance et écart-type',
        texte: '$$V = \\dfrac{1}{N}\\sum_{i=1}^{p} n_i(x_i - \\overline{x})^2 = \\dfrac{1}{N}\\sum_{i=1}^{p} n_ix_i^2 - \\overline{x}^2, \\qquad \\sigma = \\sqrt{V}.$$ L’écart-type $\\sigma$ s’exprime dans la même unité que les valeurs ; plus il est grand, plus la série est dispersée autour de sa moyenne.' },
      { type: 'propriete', titre: 'Changement de variable affine',
        texte: 'Si $y_i = ax_i + b$ pour tout $i$ : $$\\overline{y} = a\\overline{x} + b, \\qquad V(y) = a^2V(x), \\qquad \\sigma_y = |a|\\,\\sigma_x.$$' },
      { type: 'definition', titre: 'Médiane, quartiles, mode',
        texte: 'La <b>médiane</b> partage la série ordonnée en deux groupes de même effectif. Pour une série en classes, on la détermine par interpolation linéaire sur le polygone des effectifs (ou fréquences) cumulés croissants. Les quartiles $Q_1$ et $Q_3$ correspondent à $25\\,\\%$ et $75\\,\\%$ de l’effectif. Le <b>mode</b> (ou la classe modale) est la valeur (ou la classe) de plus grand effectif.' },
      { type: 'definition', titre: 'Séries à deux variables',
        texte: 'Une série à deux variables associe à chaque individu un couple $(x_i ; y_i)$. On la représente par un <b>nuage de points</b> $M_i(x_i ; y_i)$. Le <b>point moyen</b> du nuage est $G(\\overline{x} ; \\overline{y})$.' },
      { type: 'remarque', titre: 'Comparer deux séries',
        texte: 'Deux séries peuvent avoir la même moyenne et des dispersions très différentes : on compare alors leurs écarts-types (ou leurs écarts interquartiles). La série de plus petit écart-type est la plus <b>régulière</b>.' }
    ],
    methodes: [
      { titre: 'Calculer la variance et l’écart-type',
        etapes: [
          'Compléter le tableau avec les colonnes $n_ix_i$ et $n_ix_i^2$ (avec les centres pour des classes).',
          'Calculer $\\overline{x} = \\dfrac{\\sum n_ix_i}{N}$.',
          'Calculer $V = \\dfrac{\\sum n_ix_i^2}{N} - \\overline{x}^2$, puis $\\sigma = \\sqrt{V}$.'
        ] },
      { titre: 'Déterminer la médiane d’une série en classes',
        etapes: [
          'Calculer les effectifs cumulés croissants et repérer la classe $[a ; b[$ qui contient la moitié de l’effectif.',
          'Interpoler linéairement : $Me = a + (b - a) \\times \\dfrac{N/2 - E_a}{E_b - E_a}$, où $E_a$ et $E_b$ sont les effectifs cumulés en $a$ et en $b$.'
        ] }
    ],
    exemple: {
      enonce: 'Notes d’un devoir : $8$ (3 élèves), $10$ (5 élèves), $12$ (8 élèves), $14$ (4 élèves). Calculer la moyenne, la variance et l’écart-type.',
      solution: [
        '$N = 20$ et $\\sum n_ix_i = 24 + 50 + 96 + 56 = 226$, donc $\\overline{x} = \\dfrac{226}{20} = 11{,}3$.',
        '$\\sum n_ix_i^2 = 192 + 500 + 1\\,152 + 784 = 2\\,628$, donc $\\dfrac{2\\,628}{20} = 131{,}4$.',
        '$V = 131{,}4 - 11{,}3^2 = 131{,}4 - 127{,}69 = 3{,}71$ et $\\sigma = \\sqrt{3{,}71} \\approx 1{,}93$.'
      ]
    },
    erreurs: [
      'Oublier de pondérer chaque valeur par son effectif.',
      'Inverser la formule : $V$ est la moyenne des carrés MOINS le carré de la moyenne.',
      'Pour une série en classes, utiliser une borne de la classe au lieu de son centre.',
      'Confondre variance et écart-type : $\\sigma = \\sqrt{V}$.'
    ],
    flashcards: [
      { q: 'Moyenne pondérée', r: '$\\overline{x} = \\dfrac{\\sum n_ix_i}{N}$' },
      { q: 'Variance (formule pratique)', r: '$V = \\dfrac{\\sum n_ix_i^2}{N} - \\overline{x}^2$' },
      { q: 'Écart-type', r: '$\\sigma = \\sqrt{V}$' },
      { q: 'Si $y = ax + b$ : moyenne et écart-type', r: '$\\overline{y} = a\\overline{x} + b$ et $\\sigma_y = |a|\\sigma_x$' },
      { q: 'Centre de la classe $[a ; b[$', r: '$\\dfrac{a + b}{2}$' },
      { q: 'Point moyen d’un nuage', r: '$G(\\overline{x} ; \\overline{y})$' },
      { q: 'Série la plus régulière', r: 'Celle qui a le plus petit écart-type' }
    ],
    contexte: {
      titre: 'Deux pirogues de Kayar',
      enonce: 'Au port de Kayar, on relève pendant 10 jours le nombre de caisses de poissons débarquées par deux pirogues.<br>Pirogue A : 8, 10, 12, 10, 9, 11, 10, 10, 9, 11.<br>Pirogue B : 4, 15, 12, 6, 10, 14, 8, 13, 5, 13.<br>Laquelle a les débarquements les plus réguliers ?',
      solution: [
        'Les deux séries ont pour somme $100$ : même moyenne $\\overline{x} = 10$ caisses par jour.',
        'Pirogue A : les carrés des écarts à la moyenne ont pour somme $4 + 0 + 4 + 0 + 1 + 1 + 0 + 0 + 1 + 1 = 12$, donc $V_A = 1{,}2$ et $\\sigma_A \\approx 1{,}10$.',
        'Pirogue B : $36 + 25 + 4 + 16 + 0 + 16 + 4 + 9 + 25 + 9 = 144$, donc $V_B = 14{,}4$ et $\\sigma_B \\approx 3{,}79$.',
        '$\\sigma_A < \\sigma_B$ : la pirogue A a les débarquements les plus réguliers.'
      ]
    }
  };

  /* ================================================================== */
  /* Produit scalaire                                                    */
  /* ================================================================== */
  EM.contenu['1s-produit-scalaire'] = {
    resume: 'Produit scalaire de deux vecteurs : définitions, règles de calcul, expression analytique ; théorèmes d’Al-Kashi et de la médiane ; équations de droites et de cercles.',
    objectifs: [
      'Calculer un produit scalaire à l’aide des normes et d’un angle, d’un projeté orthogonal ou des coordonnées.',
      'Utiliser le produit scalaire pour démontrer une orthogonalité ou calculer un angle.',
      'Appliquer le théorème d’Al-Kashi et le théorème de la médiane.',
      'Déterminer une équation de droite à l’aide d’un vecteur normal et calculer la distance d’un point à une droite.',
      'Déterminer une équation de cercle et reconnaître un cercle à partir de son équation.'
    ],
    cours: [
      { type: 'definition', titre: 'Produit scalaire',
        texte: 'Pour deux vecteurs non nuls, $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$ ; si l’un est nul, $\\vec{u} \\cdot \\vec{v} = 0$.<br>Avec les normes seulement : $\\vec{u} \\cdot \\vec{v} = \\dfrac{1}{2}\\left(\\|\\vec{u} + \\vec{v}\\|^2 - \\|\\vec{u}\\|^2 - \\|\\vec{v}\\|^2\\right)$.' },
      { type: 'propriete', titre: 'Projection orthogonale',
        texte: 'Si $H$ est le projeté orthogonal de $C$ sur la droite $(AB)$ : $\\vect{AB} \\cdot \\vect{AC} = \\vect{AB} \\cdot \\vect{AH}$, qui vaut $AB \\times AH$ si $\\vect{AB}$ et $\\vect{AH}$ sont de même sens et $-AB \\times AH$ sinon.' },
      { type: 'propriete', titre: 'Règles de calcul et orthogonalité',
        texte: 'Le produit scalaire est symétrique et bilinéaire ; $\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2$.<br>$\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + 2\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$ ; $(\\vec{u} + \\vec{v}) \\cdot (\\vec{u} - \\vec{v}) = \\|\\vec{u}\\|^2 - \\|\\vec{v}\\|^2$.<br>$\\vec{u} \\perp \\vec{v} \\iff \\vec{u} \\cdot \\vec{v} = 0$.' },
      { type: 'formule', titre: 'Expression analytique',
        texte: 'Dans un repère <b>orthonormé</b> $(O, \\vec{i}, \\vec{j})$, si $\\vec{u}(x ; y)$ et $\\vec{v}(x\' ; y\')$ : $$\\vec{u} \\cdot \\vec{v} = xx\' + yy\', \\qquad \\|\\vec{u}\\| = \\sqrt{x^2 + y^2}.$$' },
      { type: 'theoreme', titre: 'Al-Kashi et théorème de la médiane',
        texte: 'Dans un triangle $ABC$ : $BC^2 = AB^2 + AC^2 - 2\\,AB \\times AC \\times \\cos\\widehat{BAC}$ (théorème d’Al-Kashi).<br>Si $I$ est le milieu de $[BC]$ : $AB^2 + AC^2 = 2AI^2 + \\dfrac{BC^2}{2}$ (théorème de la médiane) ; de plus $\\vect{AB} \\cdot \\vect{AC} = AI^2 - \\dfrac{BC^2}{4}$ et $AB^2 - AC^2 = 2\\,\\vect{AI} \\cdot \\vect{CB}$.' },
      { type: 'propriete', titre: 'Droites et cercles',
        texte: 'Une droite de vecteur normal $\\vec{n}(a ; b)$ a une équation $ax + by + c = 0$. Distance de $A$ à cette droite : $d = \\dfrac{|ax_A + by_A + c|}{\\sqrt{a^2 + b^2}}$.<br>Cercle de centre $\\Omega(a ; b)$ et de rayon $r$ : $(x - a)^2 + (y - b)^2 = r^2$. Le point $M$ est sur le cercle de diamètre $[AB]$ si et seulement si $\\vect{MA} \\cdot \\vect{MB} = 0$.' },
      { type: 'remarque', titre: 'Équation $x^2 + y^2 - 2ax - 2by + c = 0$',
        texte: 'Elle équivaut à $(x - a)^2 + (y - b)^2 = a^2 + b^2 - c$. Si $a^2 + b^2 - c > 0$, c’est un cercle de centre $\\Omega(a ; b)$ et de rayon $\\sqrt{a^2 + b^2 - c}$ ; si $a^2 + b^2 - c = 0$, c’est le point $\\Omega$ ; si $a^2 + b^2 - c < 0$, l’ensemble est vide.' }
    ],
    methodes: [
      { titre: 'Choisir la bonne expression du produit scalaire',
        etapes: [
          'Des coordonnées dans un repère orthonormé : $xx\' + yy\'$.',
          'Des longueurs et un angle : $\\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos\\theta$.',
          'Une figure avec un angle droit : projeter orthogonalement.',
          'Uniquement des longueurs : formule avec $\\|\\vec{u} + \\vec{v}\\|^2$, Al-Kashi ou médiane.'
        ] },
      { titre: 'Reconnaître un cercle à partir de son équation',
        etapes: [
          'Regrouper les termes en $x$ et en $y$.',
          'Faire apparaître des carrés : $x^2 - 2ax = (x - a)^2 - a^2$.',
          'Comparer la constante obtenue à droite avec $0$ : cercle, point ou ensemble vide.'
        ] }
    ],
    exemple: {
      enonce: 'Dans un repère orthonormé, $A(1 ; 2)$, $B(4 ; 3)$ et $C(2 ; 5)$. Calculer $\\vect{AB} \\cdot \\vect{AC}$ puis une valeur approchée de l’angle $\\widehat{BAC}$.',
      solution: [
        '$\\vect{AB}(3 ; 1)$ et $\\vect{AC}(1 ; 3)$, donc $\\vect{AB} \\cdot \\vect{AC} = 3 \\times 1 + 1 \\times 3 = 6$.',
        '$AB = \\sqrt{10}$ et $AC = \\sqrt{10}$.',
        '$\\cos\\widehat{BAC} = \\dfrac{6}{\\sqrt{10} \\times \\sqrt{10}} = \\dfrac{3}{5}$, d’où $\\widehat{BAC} \\approx 53{,}13^\\circ$.'
      ]
    },
    erreurs: [
      'Le produit scalaire est un NOMBRE, pas un vecteur.',
      'Oublier le signe dans la projection : si les vecteurs sont de sens contraires, le produit scalaire est négatif.',
      'Utiliser $xx\' + yy\'$ dans un repère qui n’est pas orthonormé.',
      'Dans Al-Kashi, utiliser un angle qui n’est pas l’angle opposé au côté calculé.'
    ],
    flashcards: [
      { q: '$\\vec{u} \\cdot \\vec{v}$ avec normes et angle', r: '$\\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\cos(\\vec{u}, \\vec{v})$' },
      { q: '$\\vec{u} \\cdot \\vec{v}$ en repère orthonormé', r: '$xx\' + yy\'$' },
      { q: '$\\vec{u} \\perp \\vec{v}$ si et seulement si…', r: '$\\vec{u} \\cdot \\vec{v} = 0$' },
      { q: 'Théorème d’Al-Kashi', r: '$BC^2 = AB^2 + AC^2 - 2\\,AB \\times AC \\cos\\widehat{A}$' },
      { q: 'Théorème de la médiane ($I$ milieu de $[BC]$)', r: '$AB^2 + AC^2 = 2AI^2 + \\dfrac{BC^2}{2}$' },
      { q: '$\\|\\vec{u} + \\vec{v}\\|^2$', r: '$\\|\\vec{u}\\|^2 + 2\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$' },
      { q: 'Distance de $A$ à la droite $ax + by + c = 0$', r: '$\\dfrac{|ax_A + by_A + c|}{\\sqrt{a^2 + b^2}}$' },
      { q: 'Cercle de centre $\\Omega(a ; b)$, rayon $r$', r: '$(x - a)^2 + (y - b)^2 = r^2$' }
    ],
    contexte: {
      titre: 'Deux pirogues au large de Ziguinchor',
      enonce: 'Deux pirogues quittent ensemble le quai de Ziguinchor. La première parcourt $6$ km en ligne droite, la seconde $10$ km, et leurs directions font un angle de $60^\\circ$. Quelle distance les sépare alors ?',
      solution: [
        'Notons $Q$ le quai, $P_1$ et $P_2$ les pirogues : $QP_1 = 6$, $QP_2 = 10$ et $\\widehat{P_1QP_2} = 60^\\circ$.',
        'Al-Kashi : $P_1P_2^2 = 6^2 + 10^2 - 2 \\times 6 \\times 10 \\times \\cos 60^\\circ = 36 + 100 - 60 = 76$.',
        '$P_1P_2 = \\sqrt{76} = 2\\sqrt{19} \\approx 8{,}72$ km.'
      ]
    },
    histoire: 'En France, on appelle « théorème d’Al-Kashi » la généralisation du théorème de Pythagore, en hommage au mathématicien et astronome persan Ghiyath al-Din al-Kashi (mort en 1429 à Samarcande), qui l’utilisa pour ses calculs trigonométriques. Il calcula aussi $\\pi$ avec seize décimales exactes.'
  };

  /* ================================================================== */
  /* Barycentre et lignes de niveau                                      */
  /* ================================================================== */
  EM.contenu['1s-barycentre'] = {
    resume: 'Barycentre de $n$ points pondérés : existence, homogénéité, associativité, coordonnées ; lignes de niveau des fonctions $M \\mapsto \\sum a_iMA_i^2$, $M \\mapsto \\vec{u} \\cdot \\vect{AM}$ et $M \\mapsto \\dfrac{MA}{MB}$.',
    objectifs: [
      'Définir et construire le barycentre de $n$ points pondérés.',
      'Utiliser l’associativité du barycentre (barycentres partiels).',
      'Calculer les coordonnées d’un barycentre.',
      'Réduire $\\sum a_i\\vect{MA_i}$ et $\\sum a_iMA_i^2$ à l’aide du barycentre.',
      'Déterminer des lignes de niveau : $\\vect{AB} \\cdot \\vect{AM} = k$, $MA^2 + MB^2 = k$, $\\vect{MA} \\cdot \\vect{MB} = k$, $MA^2 - MB^2 = k$, $\\dfrac{MA}{MB} = k$.'
    ],
    cours: [
      { type: 'definition', titre: 'Barycentre de $n$ points pondérés',
        texte: 'Soient $(A_1 ; a_1), \\dots, (A_n ; a_n)$ des points pondérés tels que $a_1 + \\dots + a_n \\neq 0$. Il existe un unique point $G$ tel que $$a_1\\vect{GA_1} + a_2\\vect{GA_2} + \\dots + a_n\\vect{GA_n} = \\vec{0}.$$ On note $G = \\operatorname{bar}\\{(A_1 ; a_1), \\dots, (A_n ; a_n)\\}$.' },
      { type: 'propriete', titre: 'Réduction et coordonnées',
        texte: 'Pour tout point $M$ : $\\sum a_i\\vect{MA_i} = \\left(\\sum a_i\\right)\\vect{MG}$. Avec $M = O$, on obtient les coordonnées de $G$ : $$x_G = \\dfrac{a_1x_1 + \\dots + a_nx_n}{a_1 + \\dots + a_n}, \\qquad y_G = \\dfrac{a_1y_1 + \\dots + a_ny_n}{a_1 + \\dots + a_n}.$$' },
      { type: 'propriete', titre: 'Homogénéité et associativité',
        texte: 'On ne change pas le barycentre en multipliant tous les coefficients par un même réel non nul.<br><b>Associativité</b> : on peut remplacer plusieurs points par leur barycentre partiel, affecté de la somme (non nulle) de leurs coefficients. L’isobarycentre de trois points non alignés est le centre de gravité du triangle.' },
      { type: 'theoreme', titre: 'Réduction de $\\sum a_iMA_i^2$',
        texte: 'Si $\\sum a_i \\neq 0$ et $G$ est le barycentre : pour tout point $M$, $$\\sum a_iMA_i^2 = \\left(\\sum a_i\\right)MG^2 + \\sum a_iGA_i^2.$$ Si $\\sum a_i = 0$, le vecteur $\\sum a_i\\vect{MA_i}$ est constant (il ne dépend pas de $M$).' },
      { type: 'propriete', titre: 'Lignes de niveau usuelles ($I$ milieu de $[AB]$)',
        texte: '• $\\vect{AB} \\cdot \\vect{AM} = k$ : droite perpendiculaire à $(AB)$.<br>• $MA^2 - MB^2 = k$ : droite perpendiculaire à $(AB)$, car $MA^2 - MB^2 = 2\\,\\vect{IM} \\cdot \\vect{AB}$.<br>• $MA^2 + MB^2 = k$ : $2MI^2 + \\dfrac{AB^2}{2} = k$ ; cercle de centre $I$, point $I$ ou ensemble vide.<br>• $\\vect{MA} \\cdot \\vect{MB} = k$ : $MI^2 - \\dfrac{AB^2}{4} = k$ ; pour $k = 0$, cercle de diamètre $[AB]$.<br>• $\\dfrac{MA}{MB} = k$ : médiatrice de $[AB]$ si $k = 1$ ; sinon ($k > 0$), cercle de diamètre $[GH]$ avec $G = \\operatorname{bar}\\{(A ; 1), (B ; k)\\}$ et $H = \\operatorname{bar}\\{(A ; 1), (B ; -k)\\}$.' },
      { type: 'remarque', titre: 'Méthode générale',
        texte: 'Pour une ligne de niveau de $\\sum a_iMA_i^2$, on introduit le barycentre $G$ et on se ramène à $MG^2 = c$ : cercle de centre $G$ et de rayon $\\sqrt{c}$ si $c > 0$, point $G$ si $c = 0$, ensemble vide si $c < 0$.' }
    ],
    methodes: [
      { titre: 'Calculer les coordonnées d’un barycentre',
        etapes: [
          'Vérifier que la somme des coefficients n’est pas nulle.',
          'Calculer la moyenne pondérée des abscisses, puis celle des ordonnées.',
          'Contrôler sur une figure que $G$ est plus proche des points de plus grand coefficient (si tous sont positifs).'
        ] },
      { titre: 'Déterminer une ligne de niveau $\\sum a_iMA_i^2 = k$',
        etapes: [
          'Introduire le barycentre $G$ des points pondérés.',
          'Utiliser $\\sum a_iMA_i^2 = (\\sum a_i)MG^2 + \\sum a_iGA_i^2$ (on calcule les $GA_i$).',
          'Isoler $MG^2$ et conclure selon le signe de la constante.'
        ] }
    ],
    exemple: {
      enonce: 'On donne deux points $A$ et $B$ tels que $AB = 6$, et $I$ le milieu de $[AB]$. Déterminer l’ensemble des points $M$ tels que $MA^2 + MB^2 = 50$.',
      solution: [
        '$MA^2 = (\\vect{MI} + \\vect{IA})^2 = MI^2 + 2\\vect{MI} \\cdot \\vect{IA} + IA^2$ et de même $MB^2 = MI^2 + 2\\vect{MI} \\cdot \\vect{IB} + IB^2$.',
        'Comme $\\vect{IA} + \\vect{IB} = \\vec{0}$ : $MA^2 + MB^2 = 2MI^2 + IA^2 + IB^2 = 2MI^2 + \\dfrac{AB^2}{2} = 2MI^2 + 18$.',
        '$MA^2 + MB^2 = 50 \\iff 2MI^2 = 32 \\iff MI = 4$.',
        'L’ensemble cherché est le cercle de centre $I$ et de rayon $4$.'
      ]
    },
    erreurs: [
      'Oublier de diviser par la somme des coefficients dans le calcul des coordonnées.',
      'Parler de barycentre alors que la somme des coefficients est nulle.',
      'Pour $MA^2 + MB^2 = k$, conclure « cercle » sans vérifier le signe de la constante (point ou ensemble vide possibles).',
      'Confondre $\\vect{AB} \\cdot \\vect{AM} = k$ (une droite) et $\\vect{MA} \\cdot \\vect{MB} = k$ (un cercle).'
    ],
    flashcards: [
      { q: 'Définition de $G = \\operatorname{bar}\\{(A_i ; a_i)\\}$', r: '$\\sum a_i\\vect{GA_i} = \\vec{0}$, avec $\\sum a_i \\neq 0$' },
      { q: 'Abscisse du barycentre', r: '$x_G = \\dfrac{\\sum a_ix_i}{\\sum a_i}$' },
      { q: '$\\sum a_i\\vect{MA_i} = ?$', r: '$\\left(\\sum a_i\\right)\\vect{MG}$' },
      { q: '$\\sum a_iMA_i^2 = ?$', r: '$\\left(\\sum a_i\\right)MG^2 + \\sum a_iGA_i^2$' },
      { q: 'Ensemble des $M$ tels que $\\vect{MA} \\cdot \\vect{MB} = 0$', r: 'Le cercle de diamètre $[AB]$' },
      { q: 'Ensemble des $M$ tels que $\\vect{AB} \\cdot \\vect{AM} = k$', r: 'Une droite perpendiculaire à $(AB)$' },
      { q: 'Ensemble des $M$ tels que $MA = MB$', r: 'La médiatrice de $[AB]$' },
      { q: 'Isobarycentre de trois points non alignés', r: 'Le centre de gravité du triangle' }
    ],
    contexte: {
      titre: 'Un forage pour trois villages de Kaffrine',
      enonce: 'Dans la région de Kaffrine, trois villages sont repérés (en km) par $A(0 ; 0)$, $B(10 ; 0)$ et $C(0 ; 8)$ ; ils comptent respectivement $2\\,000$, $3\\,000$ et $5\\,000$ habitants. On place le forage au point $G$ qui minimise $2MA^2 + 3MB^2 + 5MC^2$. Où le placer ?',
      solution: [
        'D’après la réduction : $2MA^2 + 3MB^2 + 5MC^2 = 10MG^2 + \\text{constante}$, avec $G = \\operatorname{bar}\\{(A ; 2), (B ; 3), (C ; 5)\\}$. Cette somme est minimale quand $MG = 0$, c’est-à-dire en $G$.',
        '$x_G = \\dfrac{2 \\times 0 + 3 \\times 10 + 5 \\times 0}{10} = 3$ et $y_G = \\dfrac{2 \\times 0 + 3 \\times 0 + 5 \\times 8}{10} = 4$.',
        'Le forage est placé au point $G(3 ; 4)$, plus proche du village le plus peuplé.'
      ]
    },
    histoire: 'Le mot « barycentre » vient du grec barus, « lourd ». Archimède (IIIᵉ siècle avant J.-C.) étudiait déjà les centres de gravité, et l’Allemand August Ferdinand Möbius a développé en 1827 le « calcul barycentrique ».'
  };

  /* ================================================================== */
  /* Angles orientés et rotations                                        */
  /* ================================================================== */
  EM.contenu['1s-angles-orientes'] = {
    resume: 'Angles orientés de vecteurs : mesures, mesure principale, relation de Chasles ; rotations : définition, propriétés et expression analytique.',
    objectifs: [
      'Déterminer la mesure principale d’un angle orienté.',
      'Utiliser la relation de Chasles et les propriétés des angles orientés.',
      'Caractériser la colinéarité et l’orthogonalité à l’aide des angles orientés.',
      'Définir une rotation, construire l’image d’un point et utiliser ses propriétés.',
      'Calculer les coordonnées de l’image d’un point par une rotation d’angle remarquable.'
    ],
    cours: [
      { type: 'definition', titre: 'Mesures d’un angle orienté',
        texte: 'Le plan est orienté (sens direct : sens inverse des aiguilles d’une montre). Si $\\alpha$ est une mesure de l’angle orienté $(\\vec{u}, \\vec{v})$, ses mesures sont les réels $\\alpha + 2k\\pi$, $k \\in \\Z$. On écrit $(\\vec{u}, \\vec{v}) = \\alpha \\ [2\\pi]$.' },
      { type: 'definition', titre: 'Mesure principale',
        texte: 'Parmi les mesures d’un angle orienté, une seule appartient à $]-\\pi ; \\pi]$ : c’est la <b>mesure principale</b>. Exemple : $\\dfrac{29\\pi}{6} = 4\\pi + \\dfrac{5\\pi}{6}$, de mesure principale $\\dfrac{5\\pi}{6}$.' },
      { type: 'propriete', titre: 'Relation de Chasles et conséquences',
        texte: '$(\\vec{u}, \\vec{v}) + (\\vec{v}, \\vec{w}) = (\\vec{u}, \\vec{w}) \\ [2\\pi]$ ; $(\\vec{v}, \\vec{u}) = -(\\vec{u}, \\vec{v})$ ;<br>$(-\\vec{u}, \\vec{v}) = (\\vec{u}, -\\vec{v}) = (\\vec{u}, \\vec{v}) + \\pi$ ; $(-\\vec{u}, -\\vec{v}) = (\\vec{u}, \\vec{v})$ ;<br>pour $k$, $k\'$ réels non nuls : $(k\\vec{u}, k\'\\vec{v}) = (\\vec{u}, \\vec{v})$ si $kk\' > 0$ et $(\\vec{u}, \\vec{v}) + \\pi$ si $kk\' < 0$ (égalités modulo $2\\pi$).' },
      { type: 'propriete', titre: 'Colinéarité et orthogonalité',
        texte: '$\\vec{u}$ et $\\vec{v}$ (non nuls) sont colinéaires si et seulement si $(\\vec{u}, \\vec{v}) = 0 \\ [\\pi]$ ; orthogonaux si et seulement si $(\\vec{u}, \\vec{v}) = \\dfrac{\\pi}{2} \\ [\\pi]$. Les points $A$, $B$, $C$ distincts sont alignés si et seulement si $(\\vect{AB}, \\vect{AC}) = 0 \\ [\\pi]$.' },
      { type: 'definition', titre: 'Rotation',
        texte: 'La rotation $r$ de centre $\\Omega$ et d’angle $\\theta$ laisse $\\Omega$ fixe et associe à tout point $M \\neq \\Omega$ le point $M\'$ tel que $\\Omega M\' = \\Omega M$ et $(\\vect{\\Omega M}, \\vect{\\Omega M\'}) = \\theta \\ [2\\pi]$.' },
      { type: 'propriete', titre: 'Propriétés des rotations',
        texte: 'Une rotation conserve les distances, les angles orientés, l’alignement, le parallélisme et les barycentres. Si $A\'$ et $B\'$ sont les images de $A$ et $B$ ($A \\neq B$) par la rotation d’angle $\\theta$ : $A\'B\' = AB$ et $(\\vect{AB}, \\vect{A\'B\'}) = \\theta \\ [2\\pi]$. Une rotation d’angle $\\pi$ est une symétrie centrale.' },
      { type: 'formule', titre: 'Expression analytique',
        texte: 'Dans un repère orthonormé direct, la rotation de centre $\\Omega(a ; b)$ et d’angle $\\theta$ transforme $M(x ; y)$ en $M\'(x\' ; y\')$ avec $$\\begin{cases} x\' - a = (x - a)\\cos\\theta - (y - b)\\sin\\theta \\\\ y\' - b = (x - a)\\sin\\theta + (y - b)\\cos\\theta \\end{cases}$$ Pour $\\theta = \\dfrac{\\pi}{2}$ : $x\' - a = -(y - b)$ et $y\' - b = x - a$.' }
    ],
    methodes: [
      { titre: 'Trouver la mesure principale de $\\dfrac{p\\pi}{q}$',
        etapes: [
          'Chercher le multiple de $2\\pi$ (c’est-à-dire de $\\dfrac{2q\\pi}{q}$) le plus proche de $\\dfrac{p\\pi}{q}$.',
          'Le retrancher : le résultat doit appartenir à $]-\\pi ; \\pi]$.',
          'Contrôler : le numérateur obtenu est compris entre $-q$ (exclu) et $q$ (inclus).'
        ] },
      { titre: 'Calculer l’image d’un point par une rotation',
        etapes: [
          'Calculer les coordonnées du vecteur $\\vect{\\Omega M}$ : $(x - a ; y - b)$.',
          'Appliquer les formules avec $\\cos\\theta$ et $\\sin\\theta$.',
          'Ajouter les coordonnées de $\\Omega$ et vérifier que $\\Omega M\' = \\Omega M$.'
        ] }
    ],
    exemple: {
      enonce: 'Déterminer les mesures principales de $\\dfrac{29\\pi}{6}$ et de $-\\dfrac{17\\pi}{4}$.',
      solution: [
        '$\\dfrac{29\\pi}{6} = \\dfrac{24\\pi}{6} + \\dfrac{5\\pi}{6} = 4\\pi + \\dfrac{5\\pi}{6}$ : mesure principale $\\dfrac{5\\pi}{6}$.',
        '$-\\dfrac{17\\pi}{4} = -\\dfrac{16\\pi}{4} - \\dfrac{\\pi}{4} = -4\\pi - \\dfrac{\\pi}{4}$ : mesure principale $-\\dfrac{\\pi}{4}$.',
        'Contrôle : $\\dfrac{5\\pi}{6}$ et $-\\dfrac{\\pi}{4}$ appartiennent bien à $]-\\pi ; \\pi]$.'
      ]
    },
    erreurs: [
      'Donner une « mesure principale » dans $[0 ; 2\\pi[$ au lieu de $]-\\pi ; \\pi]$.',
      'Oublier que $(-\\vec{u}, \\vec{v}) = (\\vec{u}, \\vec{v}) + \\pi$.',
      'Retrancher un multiple de $\\pi$ au lieu d’un multiple de $2\\pi$.',
      'Se tromper de sens : un angle positif correspond au sens inverse des aiguilles d’une montre.'
    ],
    flashcards: [
      { q: 'Intervalle de la mesure principale', r: '$]-\\pi ; \\pi]$' },
      { q: 'Relation de Chasles', r: '$(\\vec{u}, \\vec{v}) + (\\vec{v}, \\vec{w}) = (\\vec{u}, \\vec{w}) \\ [2\\pi]$' },
      { q: '$(\\vec{v}, \\vec{u})$', r: '$-(\\vec{u}, \\vec{v})$' },
      { q: '$(-\\vec{u}, \\vec{v})$', r: '$(\\vec{u}, \\vec{v}) + \\pi$' },
      { q: '$\\vec{u}$ et $\\vec{v}$ colinéaires', r: '$(\\vec{u}, \\vec{v}) = 0 \\ [\\pi]$' },
      { q: 'Image de $M(x ; y)$ par la rotation de centre $O$ et d’angle $\\dfrac{\\pi}{2}$', r: '$M\'(-y ; x)$' },
      { q: 'Rotation d’angle $\\pi$', r: 'Symétrie centrale de même centre' },
      { q: 'Mesure principale de $\\dfrac{7\\pi}{3}$', r: '$\\dfrac{\\pi}{3}$' }
    ],
    contexte: {
      titre: 'L’horloge de la classe d’Ibrahima',
      enonce: 'Dans la salle de classe d’Ibrahima, à Diourbel, la grande aiguille de l’horloge tourne dans le sens des aiguilles d’une montre, c’est-à-dire dans le sens indirect. Quelle est la mesure principale de l’angle dont elle tourne en 25 minutes ? en 50 minutes ?',
      solution: [
        'En $60$ minutes, l’aiguille fait un tour dans le sens indirect, soit $-2\\pi$ : en une minute, elle tourne de $-\\dfrac{2\\pi}{60} = -\\dfrac{\\pi}{30}$.',
        'En $25$ minutes : $-\\dfrac{25\\pi}{30} = -\\dfrac{5\\pi}{6}$, qui appartient déjà à $]-\\pi ; \\pi]$.',
        'En $50$ minutes : $-\\dfrac{50\\pi}{30} = -\\dfrac{5\\pi}{3} = -2\\pi + \\dfrac{\\pi}{3}$ ; la mesure principale est $\\dfrac{\\pi}{3}$.'
      ]
    }
  };

  /* ================================================================== */
  /* Géométrie dans l’espace (1ère S1)                                   */
  /* ================================================================== */
  EM.contenu['1s-espace'] = {
    resume: 'Vecteurs de l’espace, colinéarité et coplanarité, repérage dans l’espace, coordonnées, distances ; caractérisation vectorielle des droites et des plans.',
    objectifs: [
      'Calculer avec des vecteurs de l’espace (relation de Chasles, combinaisons linéaires).',
      'Reconnaître des vecteurs colinéaires, des vecteurs coplanaires, des points alignés ou coplanaires.',
      'Utiliser les coordonnées dans un repère $(O, \\vec{i}, \\vec{j}, \\vec{k})$ : vecteur, milieu, barycentre.',
      'Calculer une distance dans un repère orthonormé.',
      'Caractériser une droite et un plan de l’espace ; écrire une représentation paramétrique de droite.'
    ],
    cours: [
      { type: 'definition', titre: 'Vecteurs de l’espace',
        texte: 'Les règles de calcul vectoriel du plan restent valables dans l’espace (relation de Chasles, règle du parallélogramme, produit par un réel). Deux vecteurs $\\vec{u}$ et $\\vec{v}$ sont <b>colinéaires</b> si l’un est le produit de l’autre par un réel.' },
      { type: 'definition', titre: 'Vecteurs coplanaires',
        texte: 'Soient $\\vec{u}$ et $\\vec{v}$ non colinéaires. Le vecteur $\\vec{w}$ est coplanaire à $\\vec{u}$ et $\\vec{v}$ si et seulement s’il existe des réels $\\alpha$ et $\\beta$ tels que $\\vec{w} = \\alpha\\vec{u} + \\beta\\vec{v}$.<br>Quatre points $A$, $B$, $C$, $D$ sont coplanaires si et seulement si $\\vect{AB}$, $\\vect{AC}$ et $\\vect{AD}$ sont coplanaires.' },
      { type: 'definition', titre: 'Repère de l’espace',
        texte: 'Un repère $(O, \\vec{i}, \\vec{j}, \\vec{k})$ est formé d’un point $O$ et de trois vecteurs non coplanaires. Tout vecteur s’écrit de façon unique $\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k}$ : $(x ; y ; z)$ sont ses coordonnées. Le repère est orthonormé si $\\vec{i}$, $\\vec{j}$, $\\vec{k}$ sont deux à deux orthogonaux et de norme $1$.' },
      { type: 'formule', titre: 'Coordonnées et distances',
        texte: '$\\vect{AB}(x_B - x_A ; y_B - y_A ; z_B - z_A)$ ; milieu $I$ de $[AB]$ : $\\left(\\dfrac{x_A + x_B}{2} ; \\dfrac{y_A + y_B}{2} ; \\dfrac{z_A + z_B}{2}\\right)$.<br>Dans un repère <b>orthonormé</b> : $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$.' },
      { type: 'propriete', titre: 'Droites et plans',
        texte: 'La droite passant par $A$ et de vecteur directeur $\\vec{u}(a ; b ; c)$ est l’ensemble des points $M$ tels que $\\vect{AM} = t\\vec{u}$, $t \\in \\R$ ; représentation paramétrique : $x = x_A + ta$, $y = y_A + tb$, $z = z_A + tc$.<br>Le plan passant par $A$ et dirigé par $\\vec{u}$ et $\\vec{v}$ non colinéaires est l’ensemble des points $M$ tels que $\\vect{AM} = \\alpha\\vec{u} + \\beta\\vec{v}$.' },
      { type: 'remarque', titre: 'Colinéarité en coordonnées',
        texte: '$\\vec{u}(a ; b ; c)$ et $\\vec{v}(a\' ; b\' ; c\')$ sont colinéaires si et seulement si leurs coordonnées sont proportionnelles. Trois points $A$, $B$, $C$ sont alignés si et seulement si $\\vect{AB}$ et $\\vect{AC}$ sont colinéaires.' }
    ],
    methodes: [
      { titre: 'Montrer que trois points sont alignés',
        etapes: [
          'Calculer les coordonnées de $\\vect{AB}$ et $\\vect{AC}$.',
          'Chercher un réel $k$ tel que $\\vect{AC} = k\\vect{AB}$ (vérifier les TROIS coordonnées).',
          'Conclure : alignés si un tel $k$ existe, non alignés sinon.'
        ] },
      { titre: 'Montrer que quatre points sont coplanaires',
        etapes: [
          'Calculer $\\vect{AB}$, $\\vect{AC}$, $\\vect{AD}$ et vérifier que $\\vect{AB}$ et $\\vect{AC}$ ne sont pas colinéaires.',
          'Chercher $\\alpha$ et $\\beta$ avec $\\vect{AD} = \\alpha\\vect{AB} + \\beta\\vect{AC}$ à l’aide de deux équations.',
          'Vérifier la troisième équation : si elle est satisfaite, les points sont coplanaires.'
        ] }
    ],
    exemple: {
      enonce: 'Dans un repère de l’espace, $A(1 ; 0 ; 2)$, $B(2 ; 1 ; 0)$, $C(0 ; 2 ; 1)$ et $D(1 ; 3 ; -1)$. Les points $A$, $B$, $C$, $D$ sont-ils coplanaires ?',
      solution: [
        '$\\vect{AB}(1 ; 1 ; -2)$, $\\vect{AC}(-1 ; 2 ; -1)$ (non colinéaires) et $\\vect{AD}(0 ; 3 ; -3)$.',
        'On cherche $\\alpha$, $\\beta$ tels que $\\vect{AD} = \\alpha\\vect{AB} + \\beta\\vect{AC}$ : $\\alpha - \\beta = 0$ et $\\alpha + 2\\beta = 3$, d’où $\\alpha = \\beta = 1$.',
        'Troisième coordonnée : $-2\\alpha - \\beta = -3$ ✓. Donc $\\vect{AD} = \\vect{AB} + \\vect{AC}$ : les quatre points sont coplanaires ($ABDC$ est même un parallélogramme).'
      ]
    },
    erreurs: [
      'Croire que trois vecteurs non colinéaires deux à deux sont forcément coplanaires.',
      'Utiliser la formule de distance dans un repère qui n’est pas orthonormé.',
      'Vérifier seulement deux des trois coordonnées lors d’une recherche de coefficients.'
    ],
    flashcards: [
      { q: '$\\vec{u}$ et $\\vec{v}$ colinéaires', r: 'Il existe $k$ réel tel que $\\vec{v} = k\\vec{u}$ (ou $\\vec{u} = \\vec{0}$).' },
      { q: '$\\vec{w}$ coplanaire à $\\vec{u}$ et $\\vec{v}$ (non colinéaires)', r: '$\\vec{w} = \\alpha\\vec{u} + \\beta\\vec{v}$' },
      { q: 'Coordonnées de $\\vect{AB}$ dans l’espace', r: '$(x_B - x_A ; y_B - y_A ; z_B - z_A)$' },
      { q: 'Distance $AB$ en repère orthonormé', r: '$\\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$' },
      { q: 'Représentation paramétrique de la droite $(A, \\vec{u})$', r: '$x = x_A + ta$, $y = y_A + tb$, $z = z_A + tc$, $t \\in \\R$' },
      { q: 'Quatre points coplanaires si…', r: '$\\vect{AB}$, $\\vect{AC}$, $\\vect{AD}$ sont coplanaires' }
    ],
    contexte: {
      titre: 'Une tente au bord du lac Rose',
      enonce: 'Un campement au bord du lac Rose monte des tentes en forme de pyramide : base carrée $ABCD$ de $4$ m de côté, sommet $S$ à la verticale du centre de la base, à $3$ m de hauteur. Dans le repère orthonormé d’origine $A$ (unité : 1 m), $B(4 ; 0 ; 0)$, $D(0 ; 4 ; 0)$ et $S(2 ; 2 ; 3)$. Quelle est la longueur de l’arête $[SA]$ ? Où accrocher une lampe au milieu de $[SC]$ ?',
      solution: [
        '$C(4 ; 4 ; 0)$ et $\\vect{AS}(2 ; 2 ; 3)$, donc $SA = \\sqrt{4 + 4 + 9} = \\sqrt{17} \\approx 4{,}12$ m.',
        'Le milieu de $[SC]$ a pour coordonnées $\\left(\\dfrac{2 + 4}{2} ; \\dfrac{2 + 4}{2} ; \\dfrac{3 + 0}{2}\\right) = (3 ; 3 ; 1{,}5)$.',
        'La lampe est accrochée à $1{,}5$ m de hauteur, au-dessus du point $(3 ; 3 ; 0)$ du sol.'
      ]
    },
    histoire: 'L’idée de repérer un point par des nombres remonte à René Descartes et Pierre de Fermat, au XVIIᵉ siècle ; « La Géométrie » de Descartes paraît en 1637.'
  };

  /* ================================================================== */
  /* Isométries et composées de transformations (1ère S1)                */
  /* ================================================================== */
  EM.contenu['1s1-transformations'] = {
    resume: 'Isométries du plan (translations, rotations, réflexions), composées de transformations, décompositions en réflexions ; utilisation pour résoudre des problèmes de construction et de lieux.',
    objectifs: [
      'Connaître les isométries usuelles et leurs propriétés de conservation.',
      'Déterminer la composée de deux réflexions d’axes parallèles ou sécants.',
      'Décomposer une translation ou une rotation en composée de deux réflexions.',
      'Composer deux translations, deux rotations de même centre, deux symétries centrales, deux homothéties de même centre.',
      'Utiliser les transformations pour résoudre un problème de construction ou de lieu géométrique.'
    ],
    cours: [
      { type: 'definition', titre: 'Isométries',
        texte: 'Une <b>isométrie</b> est une transformation du plan qui conserve les distances : translations, rotations, symétries centrales, réflexions (symétries orthogonales) et leurs composées. Elle conserve l’alignement, le parallélisme, l’orthogonalité, les milieux, les barycentres et les angles géométriques.<br>Les translations et rotations (<b>déplacements</b>) conservent les angles orientés ; les réflexions les changent en leurs opposés.' },
      { type: 'theoreme', titre: 'Composée de deux réflexions',
        texte: 'Soient $s_D$ et $s_{D\'}$ les réflexions d’axes $D$ et $D\'$.<br>• Si $D \\parallel D\'$ : $s_{D\'} \\circ s_D$ est la translation de vecteur $2\\vect{HH\'}$, où $H \\in D$, $H\' \\in D\'$ et $(HH\') \\perp D$.<br>• Si $D$ et $D\'$ sont sécantes en $O$, de vecteurs directeurs $\\vec{u}$ et $\\vec{u}\'$ : $s_{D\'} \\circ s_D$ est la rotation de centre $O$ et d’angle $2(\\vec{u}, \\vec{u}\')$.<br>• Si $D = D\'$ : $s_D \\circ s_D$ est l’identité.' },
      { type: 'propriete', titre: 'Décompositions',
        texte: 'Une translation de vecteur $\\vec{v}$ est la composée de deux réflexions d’axes perpendiculaires à $\\vec{v}$, le second se déduisant du premier par la translation de vecteur $\\dfrac{1}{2}\\vec{v}$.<br>Une rotation de centre $O$ et d’angle $\\theta$ est la composée de deux réflexions d’axes passant par $O$ et faisant entre eux un angle $\\dfrac{\\theta}{2}$ ; l’un des deux axes peut être choisi librement.' },
      { type: 'propriete', titre: 'Composées usuelles',
        texte: '$t_{\\vec{v}} \\circ t_{\\vec{u}} = t_{\\vec{u} + \\vec{v}}$ ; $r(O, \\beta) \\circ r(O, \\alpha) = r(O, \\alpha + \\beta)$ ; $s_B \\circ s_A = t_{2\\vect{AB}}$ (symétries centrales) ; $h(O, k\') \\circ h(O, k) = h(O, kk\')$ (homothéties).' },
      { type: 'remarque', titre: 'Ordre de composition',
        texte: '$g \\circ f$ signifie : on applique d’abord $f$, puis $g$. En général $g \\circ f \\neq f \\circ g$ : par exemple $s_D \\circ s_{D\'}$ est la rotation d’angle opposé à celui de $s_{D\'} \\circ s_D$.' },
      { type: 'formule', titre: 'Expressions analytiques (repère orthonormé)',
        texte: 'Translation de vecteur $\\vec{v}(a ; b)$ : $(x + a ; y + b)$. Symétrie de centre $\\Omega(a ; b)$ : $(2a - x ; 2b - y)$. Réflexion d’axe $(Ox)$ : $(x ; -y)$ ; d’axe $(Oy)$ : $(-x ; y)$ ; d’axe $y = x$ : $(y ; x)$ ; d’axe $x = a$ : $(2a - x ; y)$. Rotation de centre $O$ et d’angle $\\dfrac{\\pi}{2}$ : $(-y ; x)$.' }
    ],
    methodes: [
      { titre: 'Reconnaître la composée de deux réflexions',
        etapes: [
          'Déterminer la position relative des deux axes : parallèles ou sécants.',
          'Axes parallèles : translation de vecteur deux fois le vecteur qui va du premier axe au second.',
          'Axes sécants : rotation de centre le point d’intersection, d’angle deux fois l’angle orienté du premier axe vers le second.'
        ] },
      { titre: 'Calculer l’image d’un point par une composée',
        etapes: [
          'Repérer l’ordre : dans $g \\circ f$, on commence par $f$.',
          'Calculer l’image intermédiaire $f(M)$ avec l’expression analytique de $f$.',
          'Appliquer $g$ à ce point.'
        ] }
    ],
    exemple: {
      enonce: 'Dans un repère orthonormé, $D$ est la droite $x = 1$ et $D\'$ la droite $x = 4$. Déterminer $s_{D\'} \\circ s_D$ et vérifier avec $M(0 ; 2)$.',
      solution: [
        '$D \\parallel D\'$ : avec $H(1 ; 0) \\in D$ et $H\'(4 ; 0) \\in D\'$, $(HH\') \\perp D$ et $\\vect{HH\'}(3 ; 0)$.',
        '$s_{D\'} \\circ s_D$ est la translation de vecteur $2\\vect{HH\'}(6 ; 0)$.',
        'Vérification : $s_D(M) = (2 \\times 1 - 0 ; 2) = (2 ; 2)$, puis $s_{D\'}(2 ; 2) = (2 \\times 4 - 2 ; 2) = (6 ; 2)$, qui est bien $M$ translaté de $(6 ; 0)$.'
      ]
    },
    erreurs: [
      'Inverser l’ordre de composition : $s_{D\'} \\circ s_D \\neq s_D \\circ s_{D\'}$ en général.',
      'Oublier le facteur $2$ : rotation d’angle $2\\theta$ (et non $\\theta$), translation de vecteur $2\\vect{HH\'}$.',
      'Croire que la composée de deux réflexions peut être une réflexion : c’est un déplacement.'
    ],
    flashcards: [
      { q: '$s_{D\'} \\circ s_D$ avec $D \\parallel D\'$', r: 'Translation de vecteur $2\\vect{HH\'}$' },
      { q: '$s_{D\'} \\circ s_D$ avec $D$, $D\'$ sécantes en $O$', r: 'Rotation de centre $O$ et d’angle $2(\\vec{u}, \\vec{u}\')$' },
      { q: '$r(O, \\beta) \\circ r(O, \\alpha)$', r: '$r(O, \\alpha + \\beta)$' },
      { q: '$s_B \\circ s_A$ (symétries centrales)', r: 'Translation de vecteur $2\\vect{AB}$' },
      { q: '$t_{\\vec{v}} \\circ t_{\\vec{u}}$', r: '$t_{\\vec{u} + \\vec{v}}$' },
      { q: 'Une réflexion conserve-t-elle les angles orientés ?', r: 'Non, elle les change en leurs opposés.' },
      { q: 'Rotation de centre $\\Omega$ et d’angle $\\pi$', r: 'Symétrie centrale de centre $\\Omega$' }
    ],
    contexte: {
      titre: 'Le motif d’un tissu à la Médina',
      enonce: 'Une couturière de la Médina, à Dakar, crée un motif de tissu : elle reproduit un dessin par la réflexion d’axe $D$, puis par la réflexion d’axe $D\'$, ces deux axes se coupant en $O$ avec $(\\vec{u}, \\vec{u}\') = \\dfrac{\\pi}{6}$. Quelle transformation fait passer du dessin initial au dessin final ? Combien de fois faut-il la répéter pour revenir au dessin de départ ?',
      solution: [
        '$s_{D\'} \\circ s_D$ est la rotation de centre $O$ et d’angle $2 \\times \\dfrac{\\pi}{6} = \\dfrac{\\pi}{3}$.',
        'Répéter $n$ fois cette rotation donne la rotation d’angle $\\dfrac{n\\pi}{3}$ ; on revient au départ quand $\\dfrac{n\\pi}{3}$ est un multiple de $2\\pi$.',
        'Le plus petit $n$ convenable est $6$ : le motif présente six copies du dessin autour de $O$.'
      ]
    },
    histoire: 'En 1872, dans son « programme d’Erlangen », le mathématicien allemand Felix Klein a proposé de classer les géométries selon les transformations qu’elles laissent invariantes : la géométrie euclidienne est celle des isométries.'
  };
})(typeof window !== 'undefined' ? window : globalThis);
