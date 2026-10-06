/*
 * Contenu pédagogique : 2nde S et 1ère L.
 * Programme officiel de mathématiques du Sénégal (lycée).
 * Chaque chapitre : résumé, objectifs, cours, méthodes, exemple corrigé, erreurs fréquentes,
 * cartes de révision et un problème situé au Sénégal.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  EM.contenu = EM.contenu || {};

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-calcul-reel'] = {
    resume: 'On consolide les règles de calcul dans $\\R$ (puissances, racines carrées), on découvre la valeur absolue comme une distance et on apprend à décrire des ensembles de réels avec des intervalles et des encadrements.',
    objectifs: [
      'Appliquer les règles de calcul sur les puissances d\'exposant entier relatif',
      'Simplifier une expression contenant des radicaux et rendre rationnel un dénominateur',
      'Interpréter $|x - a|$ comme une distance et résoudre $|x - a| = r$ ou $|x - a| \\leq r$',
      'Écrire un ensemble de réels à l\'aide d\'intervalles, de réunions et d\'intersections',
      'Encadrer une somme, une différence, un produit ; utiliser une valeur approchée'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Puissances d\'exposant entier relatif',
        texte: 'Pour $a \\neq 0$ et $n \\in \\N^*$ : $a^n = a \\times a \\times \\dots \\times a$ ($n$ facteurs), $a^0 = 1$ et $a^{-n} = \\dfrac{1}{a^n}$.<br>Pour $a$, $b$ non nuls et $m$, $n$ entiers relatifs : $$a^m \\times a^n = a^{m+n} \\qquad \\dfrac{a^m}{a^n} = a^{m-n} \\qquad \\left(a^m\\right)^n = a^{mn} \\qquad (ab)^n = a^n b^n \\qquad \\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}$$'
      },
      {
        type: 'propriete',
        titre: 'Racines carrées',
        texte: 'Pour $a \\geq 0$, $\\sqrt{a}$ est le réel positif dont le carré est $a$. Pour $a \\geq 0$ et $b \\geq 0$ : $\\sqrt{ab} = \\sqrt{a}\\,\\sqrt{b}$ et, si $b > 0$, $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$. Pour tout réel $x$ : $\\sqrt{x^2} = |x|$.<br>En général $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$. Pour supprimer un radical au dénominateur, on multiplie par la quantité conjuguée : $\\left(\\sqrt{a} - b\\right)\\left(\\sqrt{a} + b\\right) = a - b^2$.'
      },
      {
        type: 'definition',
        titre: 'Valeur absolue et distance',
        texte: 'La valeur absolue de $x$ est $|x| = x$ si $x \\geq 0$ et $|x| = -x$ si $x < 0$. Sur une droite graduée, $|x - a|$ est la distance entre les points d\'abscisses $x$ et $a$.<br>Pour tous réels $x$ et $y$ : $|x| \\geq 0$, $|-x| = |x|$, $|xy| = |x|\\,|y|$ et $|x + y| \\leq |x| + |y|$ (inégalité triangulaire).'
      },
      {
        type: 'theoreme',
        titre: 'Équations et inéquations avec une valeur absolue',
        texte: 'Pour $r > 0$ : $$|x - a| = r \\iff x = a - r \\ \\text{ou}\\ x = a + r$$ $$|x - a| \\leq r \\iff a - r \\leq x \\leq a + r \\iff x \\in [a - r \\,;\\, a + r]$$ $$|x - a| \\geq r \\iff x \\in \\left]-\\infty \\,;\\, a - r\\right] \\cup \\left[a + r \\,;\\, +\\infty\\right[$$ L\'intervalle $[a - r \\,;\\, a + r]$ est l\'intervalle de centre $a$ et de rayon $r$.'
      },
      {
        type: 'propriete',
        titre: 'Intervalles et encadrements',
        texte: 'On note $[a \\,;\\, b]$, $]a \\,;\\, b[$, $[a \\,;\\, +\\infty[$… : le crochet est tourné vers l\'extérieur quand la borne est exclue, et $\\pm\\infty$ est toujours exclu.<br>On peut ajouter membre à membre deux encadrements ; on peut multiplier membre à membre deux encadrements de nombres <b>positifs</b>. Multiplier par un nombre négatif change le sens des inégalités. Pour encadrer $x - y$, on encadre d\'abord $-y$, puis on ajoute.'
      },
      {
        type: 'remarque',
        titre: 'Valeurs approchées',
        texte: 'Si $a \\leq x \\leq b$ avec $b - a = 10^{-n}$, $a$ est une valeur approchée de $x$ à $10^{-n}$ près par défaut et $b$ une valeur approchée par excès. Par exemple $1{,}414 \\leq \\sqrt{2} \\leq 1{,}415$.'
      }
    ],
    methodes: [
      {
        titre: 'Résoudre $|x - a| \\leq r$ (ou $|x - a| < r$)',
        etapes: [
          'Vérifier que $r > 0$ (si $r < 0$, il n\'y a aucune solution).',
          'Traduire : $-r \\leq x - a \\leq r$.',
          'Ajouter $a$ aux trois membres : $a - r \\leq x \\leq a + r$.',
          'Conclure par un intervalle : bornes fermées pour $\\leq$, ouvertes pour $<$.'
        ]
      },
      {
        titre: 'Rendre rationnel un dénominateur',
        etapes: [
          'Si le dénominateur est $\\sqrt{a}$, multiplier le numérateur et le dénominateur par $\\sqrt{a}$.',
          'Si le dénominateur est $\\sqrt{a} + b$ (ou $\\sqrt{a} - b$), multiplier par la quantité conjuguée $\\sqrt{a} - b$ (ou $\\sqrt{a} + b$).',
          'Utiliser $(u + v)(u - v) = u^2 - v^2$, puis simplifier.'
        ]
      }
    ],
    exemple: {
      enonce: 'Résoudre dans $\\R$ : a) $|x + 2| = 5$ ; b) $|2x - 1| < 3$.',
      solution: [
        'a) $|x + 2| = |x - (-2)|$ est la distance entre $x$ et $-2$. $|x + 2| = 5 \\iff x + 2 = 5$ ou $x + 2 = -5$, soit $x = 3$ ou $x = -7$. $S = \\{-7 \\,;\\, 3\\}$.',
        'b) $|2x - 1| < 3 \\iff -3 < 2x - 1 < 3 \\iff -2 < 2x < 4 \\iff -1 < x < 2$.',
        '$S = \\left]-1 \\,;\\, 2\\right[$.'
      ]
    },
    erreurs: [
      'Écrire $\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$ : c\'est faux ($\\sqrt{9 + 16} = 5$ alors que $\\sqrt{9} + \\sqrt{16} = 7$).',
      'Écrire $\\sqrt{x^2} = x$ : c\'est $|x|$ (par exemple $\\sqrt{(-3)^2} = 3$).',
      'Soustraire deux encadrements membre à membre : pour $x - y$, il faut d\'abord encadrer $-y$ (le sens change).',
      'Mal orienter les crochets : l\'infini est toujours exclu, on écrit $[2 \\,;\\, +\\infty[$.'
    ],
    flashcards: [
      { q: 'Que vaut $a^{-n}$ ?', r: '$\\dfrac{1}{a^n}$ (pour $a \\neq 0$).' },
      { q: '$\\left(a^m\\right)^n = ?$', r: '$a^{mn}$' },
      { q: 'Que représente $|x - a|$ ?', r: 'La distance entre $x$ et $a$ sur la droite graduée.' },
      { q: '$|x - 3| \\leq 2 \\iff x \\in ?$', r: '$[1 \\,;\\, 5]$' },
      { q: '$\\sqrt{x^2} = ?$', r: '$|x|$' },
      { q: 'Quantité conjuguée de $\\sqrt{5} - 2$ ?', r: '$\\sqrt{5} + 2$ ; leur produit vaut $5 - 4 = 1$.' }
    ],
    contexte: {
      titre: 'Le poids des sacs d\'arachide à Kaolack',
      enonce: 'Dans une coopérative de Kaolack, un sac d\'arachide est accepté si sa masse $m$ (en kg) vérifie $|m - 50| \\leq 1{,}5$. Moussa présente trois sacs de $48{,}2$ kg, $51{,}3$ kg et $52$ kg. Quels sacs sont acceptés ? Écrire l\'ensemble des masses acceptées sous forme d\'intervalle.',
      solution: [
        '$|m - 50| \\leq 1{,}5 \\iff 50 - 1{,}5 \\leq m \\leq 50 + 1{,}5 \\iff m \\in [48{,}5 \\,;\\, 51{,}5]$.',
        '$48{,}2 < 48{,}5$ : le premier sac est refusé (il manque $0{,}3$ kg).',
        '$51{,}3 \\in [48{,}5 \\,;\\, 51{,}5]$ : le deuxième sac est accepté.',
        '$52 > 51{,}5$ : le troisième sac est refusé.',
        'Les masses acceptées forment l\'intervalle $[48{,}5 \\,;\\, 51{,}5]$, de centre $50$ et de rayon $1{,}5$.'
      ]
    },
    histoire: 'La notation $|x|$ de la valeur absolue a été introduite par le mathématicien allemand Karl Weierstrass en 1841.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-polynomes'] = {
    resume: 'Un polynôme est une somme de monômes $a x^k$. On apprend à identifier ses coefficients, à le factoriser quand on connaît une racine, puis à étudier le signe d\'une fraction rationnelle à l\'aide d\'un tableau de signes.',
    objectifs: [
      'Reconnaître un polynôme, déterminer son degré et ses coefficients',
      'Utiliser l\'égalité de deux polynômes (méthode d\'identification)',
      'Factoriser un polynôme $P$ par $x - a$ lorsque $P(a) = 0$ (identification, division euclidienne, méthode de Horner)',
      'Déterminer l\'ensemble de définition d\'une fraction rationnelle et la simplifier',
      'Étudier le signe d\'un produit ou d\'un quotient et résoudre une inéquation rationnelle'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Polynôme',
        texte: 'Une fonction polynôme est une fonction $P$ définie sur $\\R$ par $P(x) = a_n x^n + a_{n-1}x^{n-1} + \\dots + a_1 x + a_0$, où les réels $a_i$ sont les coefficients. Si $a_n \\neq 0$, l\'entier $n$ est le degré de $P$. Le polynôme nul n\'a pas de degré.'
      },
      {
        type: 'theoreme',
        titre: 'Égalité de deux polynômes',
        texte: 'Deux polynômes sont égaux (c\'est-à-dire prennent la même valeur pour tout réel $x$) si et seulement s\'ils ont le même degré et les mêmes coefficients pour chaque puissance de $x$. C\'est le principe de la <b>méthode d\'identification</b>.'
      },
      {
        type: 'theoreme',
        titre: 'Racine et factorisation',
        texte: 'Le réel $a$ est une racine de $P$ si $P(a) = 0$.<br>$a$ est une racine de $P$ si et seulement si $P(x)$ se factorise par $(x - a)$ : il existe un polynôme $Q$, de degré $\\deg P - 1$, tel que $P(x) = (x - a)\\,Q(x)$ pour tout réel $x$.'
      },
      {
        type: 'propriete',
        titre: 'Méthode de Horner',
        texte: 'Pour $P(x) = a_3x^3 + a_2x^2 + a_1x + a_0$ et une racine $\\alpha$ : on abaisse $b_2 = a_3$, puis on calcule $b_1 = a_2 + \\alpha b_2$ et $b_0 = a_1 + \\alpha b_1$ ; le dernier calcul $a_0 + \\alpha b_0$ donne le reste $P(\\alpha) = 0$. Alors $P(x) = (x - \\alpha)\\left(b_2 x^2 + b_1 x + b_0\\right)$. $$\\begin{array}{c|cccc} & a_3 & a_2 & a_1 & a_0 \\\\ \\alpha & & \\alpha b_2 & \\alpha b_1 & \\alpha b_0 \\\\ \\hline & b_2 & b_1 & b_0 & 0 \\end{array}$$'
      },
      {
        type: 'definition',
        titre: 'Fraction rationnelle',
        texte: 'Une fraction rationnelle est un quotient $F(x) = \\dfrac{P(x)}{Q(x)}$ de deux polynômes. Elle est définie lorsque $Q(x) \\neq 0$ : les racines de $Q$ sont les <b>valeurs interdites</b>. On peut simplifier par un facteur commun $(x - a)$, mais $a$ reste une valeur interdite.'
      },
      {
        type: 'propriete',
        titre: 'Signe d\'un binôme, d\'un produit, d\'un quotient',
        texte: 'Le binôme $ax + b$ ($a \\neq 0$) s\'annule en $-\\dfrac{b}{a}$ ; il a le signe de $a$ à droite de cette valeur et le signe contraire à gauche. Le signe d\'un produit ou d\'un quotient s\'obtient par la règle des signes dans un tableau de signes ; une valeur interdite y est marquée par une double barre.'
      }
    ],
    methodes: [
      {
        titre: 'Factoriser un polynôme de degré 3 connaissant une racine $\\alpha$',
        etapes: [
          'Vérifier que $P(\\alpha) = 0$.',
          'Écrire $P(x) = (x - \\alpha)(ax^2 + bx + c)$ et trouver $a$, $b$, $c$ par identification ou par la méthode de Horner.',
          'Factoriser si possible le trinôme $ax^2 + bx + c$ (discriminant).'
        ]
      },
      {
        titre: 'Résoudre une inéquation rationnelle',
        etapes: [
          'Chercher les valeurs interdites.',
          'Tout passer dans le premier membre et réduire au même dénominateur pour obtenir $\\dfrac{A(x)}{B(x)} \\geq 0$ (ou $\\leq$, $<$, $>$).',
          'Dresser le tableau de signes de $A(x)$, de $B(x)$ et du quotient.',
          'Lire les solutions en excluant les valeurs interdites.'
        ]
      }
    ],
    exemple: {
      enonce: 'Soit $P(x) = x^3 - 2x^2 - 5x + 6$. Calculer $P(1)$ puis factoriser $P(x)$.',
      solution: [
        '$P(1) = 1 - 2 - 5 + 6 = 0$ : $1$ est une racine, donc $P(x) = (x - 1)(ax^2 + bx + c)$.',
        'En développant : $(x - 1)(ax^2 + bx + c) = ax^3 + (b - a)x^2 + (c - b)x - c$.',
        'Par identification : $a = 1$, $b - a = -2$, $c - b = -5$ et $-c = 6$ ; d\'où $a = 1$, $b = -1$ et $c = -6$.',
        'Le trinôme $x^2 - x - 6$ a pour discriminant $\\Delta = 1 + 24 = 25$ et pour racines $-2$ et $3$.',
        'Donc $P(x) = (x - 1)(x + 2)(x - 3)$.'
      ]
    },
    erreurs: [
      'Oublier une valeur interdite après simplification : $\\dfrac{(x - 1)(x + 2)}{x - 1} = x + 2$ seulement pour $x \\neq 1$.',
      'Dans un tableau de signes, oublier la double barre d\'une valeur interdite ou l\'inclure dans les solutions.',
      'Multiplier les deux membres d\'une inéquation par un dénominateur dont on ne connaît pas le signe.',
      'Se tromper de signe en appliquant Horner avec la racine $\\alpha$ : on multiplie par $\\alpha$ (et non par $-\\alpha$).'
    ],
    flashcards: [
      { q: 'Quand dit-on que $a$ est racine de $P$ ?', r: 'Quand $P(a) = 0$ ; alors $P(x) = (x - a)Q(x)$.' },
      { q: 'Degré de $(x - 2)(3x^2 + 1)$ ?', r: '$3$' },
      { q: 'Signe de $ax + b$ à droite de $-\\dfrac{b}{a}$ ?', r: 'Le signe de $a$.' },
      { q: 'Valeurs interdites de $\\dfrac{x + 1}{x^2 - 4}$ ?', r: '$-2$ et $2$.' },
      { q: 'Principe de la méthode d\'identification ?', r: 'Deux polynômes égaux ont les mêmes coefficients.' },
      { q: 'Que note-t-on dans un tableau de signes pour une valeur interdite ?', r: 'Une double barre.' }
    ],
    contexte: {
      titre: 'Des boîtes en carton à Thiès',
      enonce: 'Un artisan de Thiès fabrique des boîtes sans couvercle à partir de plaques carrées de $12$ dm de côté : il découpe un carré de côté $x$ dm à chaque coin puis relève les bords, avec $0 < x < 6$. Le volume de la boîte est $V(x) = x(12 - 2x)^2$. Il veut une boîte de $100$ dm³. Montrer que $x = 1$ convient, puis trouver l\'autre découpe possible.',
      solution: [
        '$x(12 - 2x)^2 = x\\left(144 - 48x + 4x^2\\right) = 4x^3 - 48x^2 + 144x$. L\'équation $V(x) = 100$ s\'écrit $4x^3 - 48x^2 + 144x - 100 = 0$, soit, en divisant par $4$ : $x^3 - 12x^2 + 36x - 25 = 0$.',
        'Avec $P(x) = x^3 - 12x^2 + 36x - 25$ : $P(1) = 1 - 12 + 36 - 25 = 0$, donc $x = 1$ convient.',
        'Horner avec $\\alpha = 1$ : $b_2 = 1$, $b_1 = -12 + 1 = -11$, $b_0 = 36 - 11 = 25$, reste $-25 + 25 = 0$. Donc $P(x) = (x - 1)\\left(x^2 - 11x + 25\\right)$.',
        '$x^2 - 11x + 25 = 0$ : $\\Delta = 121 - 100 = 21$, d\'où $x = \\dfrac{11 - \\sqrt{21}}{2} \\approx 3{,}21$ ou $x = \\dfrac{11 + \\sqrt{21}}{2} \\approx 7{,}79$.',
        'Comme $0 < x < 6$, seule $x = \\dfrac{11 - \\sqrt{21}}{2} \\approx 3{,}21$ dm convient. L\'artisan peut donc découper des carrés de $1$ dm ou d\'environ $3{,}21$ dm de côté.'
      ]
    },
    histoire: 'La méthode de Horner porte le nom du mathématicien anglais William George Horner, qui la publia en 1819 ; le mathématicien chinois Qin Jiushao utilisait déjà un procédé équivalent au XIIIe siècle.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-second-degre'] = {
    resume: 'Le trinôme $ax^2 + bx + c$ est au cœur du programme : forme canonique, discriminant, racines, factorisation, signe, somme et produit des racines permettent de résoudre équations, inéquations et problèmes.',
    objectifs: [
      'Écrire un trinôme sous forme canonique et en déduire son extremum',
      'Résoudre une équation du second degré à l\'aide du discriminant',
      'Factoriser un trinôme et étudier son signe',
      'Résoudre une inéquation du second degré',
      'Utiliser la somme et le produit des racines',
      'Mettre un problème en équation et le résoudre'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Trinôme et forme canonique',
        texte: 'Un trinôme du second degré est $f(x) = ax^2 + bx + c$ avec $a \\neq 0$. Il s\'écrit sous forme canonique : $$f(x) = a(x - \\alpha)^2 + \\beta \\quad \\text{avec} \\quad \\alpha = -\\dfrac{b}{2a} \\ \\text{ et } \\ \\beta = f(\\alpha).$$ Si $a > 0$, $f$ admet un minimum $\\beta$ atteint en $\\alpha$ ; si $a < 0$, un maximum.'
      },
      {
        type: 'theoreme',
        titre: 'Discriminant et racines',
        texte: 'On pose $\\Delta = b^2 - 4ac$.<br>• Si $\\Delta > 0$ : deux racines $x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a}$, et $f(x) = a(x - x_1)(x - x_2)$.<br>• Si $\\Delta = 0$ : une racine double $x_0 = -\\dfrac{b}{2a}$, et $f(x) = a(x - x_0)^2$.<br>• Si $\\Delta < 0$ : aucune racine réelle ; $f$ ne se factorise pas.'
      },
      {
        type: 'theoreme',
        titre: 'Signe du trinôme',
        texte: '$ax^2 + bx + c$ est du signe de $a$ pour tout réel $x$, sauf entre les racines (lorsqu\'elles existent), où il est du signe de $-a$. Si $\\Delta < 0$, il est toujours du signe de $a$ ; si $\\Delta = 0$, il est du signe de $a$ et s\'annule en $x_0$. $$\\begin{array}{c|ccccccc} x & -\\infty & & x_1 & & x_2 & & +\\infty \\\\ \\hline ax^2 + bx + c & & \\text{signe de } a & 0 & \\text{signe de } -a & 0 & \\text{signe de } a & \\end{array}$$'
      },
      {
        type: 'propriete',
        titre: 'Somme et produit des racines',
        texte: 'Si $\\Delta \\geq 0$, les racines vérifient $$x_1 + x_2 = -\\dfrac{b}{a} \\qquad \\text{et} \\qquad x_1 x_2 = \\dfrac{c}{a}.$$ Réciproquement, deux nombres de somme $S$ et de produit $P$ sont les solutions de l\'équation $X^2 - SX + P = 0$ (qui en a si et seulement si $S^2 - 4P \\geq 0$).'
      },
      {
        type: 'remarque',
        titre: 'Cas particuliers',
        texte: 'Si $b = 0$ ou $c = 0$, inutile de calculer $\\Delta$ : on factorise directement ($x^2 - 9 = (x - 3)(x + 3)$, $2x^2 - 5x = x(2x - 5)$). Si $a$ et $c$ sont de signes contraires, alors $\\Delta > 0$.'
      }
    ],
    methodes: [
      {
        titre: 'Résoudre une inéquation du second degré',
        etapes: [
          'Tout passer dans un membre : $ax^2 + bx + c \\geq 0$ (ou $\\leq$, $<$, $>$).',
          'Calculer $\\Delta$ et les racines éventuelles.',
          'Appliquer la règle : signe de $a$ à l\'extérieur des racines, signe de $-a$ entre elles (tableau de signes).',
          'Lire l\'ensemble des solutions en faisant attention aux crochets.'
        ]
      },
      {
        titre: 'Trouver deux nombres connaissant leur somme $S$ et leur produit $P$',
        etapes: [
          'Écrire l\'équation $X^2 - SX + P = 0$.',
          'La résoudre avec le discriminant.',
          'Les deux racines sont les nombres cherchés.'
        ]
      }
    ],
    exemple: {
      enonce: 'Résoudre dans $\\R$ l\'inéquation $-2x^2 + 3x + 2 > 0$.',
      solution: [
        '$\\Delta = 3^2 - 4 \\times (-2) \\times 2 = 9 + 16 = 25$ et $\\sqrt{\\Delta} = 5$.',
        '$x_1 = \\dfrac{-3 - 5}{-4} = 2$ et $x_2 = \\dfrac{-3 + 5}{-4} = -\\dfrac{1}{2}$.',
        '$a = -2 < 0$ : le trinôme est négatif à l\'extérieur des racines et positif entre elles.',
        '$S = \\left]-\\dfrac{1}{2} \\,;\\, 2\\right[$.'
      ]
    },
    erreurs: [
      'Oublier les parenthèses dans $\\Delta$ quand $b$ est négatif : $(-3)^2 = 9$ et non $-9$.',
      'Se tromper de signe : le trinôme est du signe de $a$ à l\'<b>extérieur</b> des racines.',
      'Diviser par $2$ au lieu de $2a$ dans la formule des racines.',
      'Dans un problème, garder une solution sans vérifier qu\'elle a un sens (longueur négative, nombre de personnes non entier).'
    ],
    flashcards: [
      { q: 'Formule du discriminant', r: '$\\Delta = b^2 - 4ac$' },
      { q: 'Racines quand $\\Delta > 0$', r: '$\\dfrac{-b - \\sqrt{\\Delta}}{2a}$ et $\\dfrac{-b + \\sqrt{\\Delta}}{2a}$' },
      { q: 'Somme et produit des racines', r: '$x_1 + x_2 = -\\dfrac{b}{a}$ et $x_1 x_2 = \\dfrac{c}{a}$' },
      { q: 'Signe du trinôme quand $\\Delta < 0$', r: 'Toujours celui de $a$.' },
      { q: 'Forme canonique : que valent $\\alpha$ et $\\beta$ ?', r: '$\\alpha = -\\dfrac{b}{2a}$ et $\\beta = f(\\alpha)$.' },
      { q: 'Deux nombres de somme $S$ et de produit $P$ ?', r: 'Les solutions de $X^2 - SX + P = 0$.' }
    ],
    contexte: {
      titre: 'Achat de sacs de riz à Touba',
      enonce: 'Un commerçant de Touba achète des sacs de riz pour $360\\,000$ F CFA. Si le prix d\'un sac avait été inférieur de $2\\,000$ F CFA, il aurait pu acheter $6$ sacs de plus avec la même somme. Combien de sacs a-t-il achetés, et à quel prix ?',
      solution: [
        'Soit $x$ le nombre de sacs achetés ($x > 0$). Le prix d\'un sac est $\\dfrac{360\\,000}{x}$ ; avec $6$ sacs de plus, il serait $\\dfrac{360\\,000}{x + 6}$.',
        'On écrit $\\dfrac{360\\,000}{x} - \\dfrac{360\\,000}{x + 6} = 2\\,000$, puis on multiplie par $x(x + 6)$ : $360\\,000(x + 6) - 360\\,000x = 2\\,000x(x + 6)$.',
        'Soit $2\\,160\\,000 = 2\\,000x^2 + 12\\,000x$ et, en divisant par $2\\,000$ : $x^2 + 6x - 1\\,080 = 0$.',
        '$\\Delta = 36 + 4\\,320 = 4\\,356 = 66^2$, donc $x = \\dfrac{-6 + 66}{2} = 30$ (l\'autre racine, $-36$, est rejetée).',
        'Il a acheté $30$ sacs à $12\\,000$ F CFA l\'un. Vérification : $360\\,000 \\div 36 = 10\\,000 = 12\\,000 - 2\\,000$.'
      ]
    },
    histoire: 'Au IXe siècle, à Bagdad, Al-Khwarizmi expose dans son traité « Kitab al-jabr wa al-muqabala » la résolution des équations du second degré, justifiée par des figures géométriques ; le mot « algèbre » vient de « al-jabr ».'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-systemes'] = {
    resume: 'On résout des systèmes de deux ou trois équations linéaires en les transformant en systèmes triangulaires équivalents : c\'est la méthode du pivot de Gauss, utile dans de nombreux problèmes concrets.',
    objectifs: [
      'Reconnaître un système linéaire et vérifier qu\'un couple ou un triplet en est solution',
      'Résoudre un système de deux équations à deux inconnues (substitution, combinaison, déterminant)',
      'Résoudre un système triangulaire en remontant',
      'Appliquer la méthode du pivot de Gauss à un système de trois équations à trois inconnues',
      'Mettre en équation un problème conduisant à un système'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Système linéaire',
        texte: 'Un système linéaire de trois équations à trois inconnues s\'écrit $$\\left\\{\\begin{array}{l} a_1x + b_1y + c_1z = d_1 \\\\ a_2x + b_2y + c_2z = d_2 \\\\ a_3x + b_3y + c_3z = d_3 \\end{array}\\right.$$ Une solution est un triplet $(x \\,;\\, y \\,;\\, z)$ qui vérifie les trois équations à la fois.'
      },
      {
        type: 'propriete',
        titre: 'Systèmes de deux équations et déterminant',
        texte: 'Le système $\\left\\{\\begin{array}{l} ax + by = c \\\\ a\'x + b\'y = c\' \\end{array}\\right.$ admet une unique solution si et seulement si son déterminant $ab\' - a\'b$ est non nul. Sinon, il n\'a aucune solution ou en a une infinité (droites parallèles ou confondues).'
      },
      {
        type: 'theoreme',
        titre: 'Opérations élémentaires',
        texte: 'On obtient un système <b>équivalent</b> (qui a les mêmes solutions) en échangeant deux équations, en multipliant une équation par un réel non nul, ou en remplaçant une équation $L_i$ par $\\alpha L_i + \\beta L_j$ avec $\\alpha \\neq 0$ et $j \\neq i$.'
      },
      {
        type: 'propriete',
        titre: 'Méthode du pivot de Gauss',
        texte: 'On choisit une équation dont le coefficient de $x$ (le pivot) est non nul et on s\'en sert pour éliminer $x$ des autres équations. On recommence avec $y$ dans les équations restantes. On obtient un système triangulaire $$\\left\\{\\begin{array}{l} ax + by + cz = d \\\\ b\'y + c\'z = d\' \\\\ c\'\'z = d\'\' \\end{array}\\right.$$ que l\'on résout en remontant : $z$, puis $y$, puis $x$.'
      },
      { type: 'remarque', titre: 'Vérifier', texte: 'Il faut toujours vérifier la solution dans les équations <b>de départ</b> : une erreur de calcul dans une combinaison est vite arrivée.' }
    ],
    methodes: [
      {
        titre: 'Résoudre un système $3 \\times 3$ par le pivot de Gauss',
        etapes: [
          'Numéroter les équations $L_1$, $L_2$, $L_3$ ; placer en $L_1$ une équation dont le coefficient de $x$ est simple ($1$ ou $-1$ si possible).',
          'Éliminer $x$ de $L_2$ et $L_3$ par des combinaisons du type $L_2 \\leftarrow aL_2 - a\'L_1$.',
          'Éliminer $y$ de $L_3$ à l\'aide de la nouvelle $L_2$.',
          'Résoudre en remontant, puis vérifier dans le système initial.'
        ]
      }
    ],
    exemple: {
      enonce: 'Résoudre $\\left\\{\\begin{array}{l} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{array}\\right.$',
      solution: [
        '$L_2 \\leftarrow L_2 - 2L_1$ donne $-3y - z = -9$ ; $L_3 \\leftarrow L_3 - L_1$ donne $y - 2z = -4$.',
        '$L_3 \\leftarrow 3L_3 + L_2$ donne $-7z = -21$, donc $z = 3$.',
        'Dans $-3y - z = -9$ : $-3y = -6$, donc $y = 2$. Dans $L_1$ : $x = 6 - 2 - 3 = 1$.',
        '$S = \\{(1 \\,;\\, 2 \\,;\\, 3)\\}$. Vérification : $2 - 2 + 3 = 3$ et $1 + 4 - 3 = 2$.'
      ]
    },
    erreurs: [
      'Remplacer une équation par une combinaison où elle n\'apparaît plus (par exemple $L_2 \\leftarrow L_1 - L_3$) : on perd de l\'information. Il faut $L_i \\leftarrow \\alpha L_i + \\beta L_j$ avec $\\alpha \\neq 0$.',
      'Oublier de multiplier le second membre lors d\'une combinaison.',
      'Ne pas vérifier la solution dans le système de départ.'
    ],
    flashcards: [
      { q: 'Quand un système $2 \\times 2$ a-t-il une unique solution ?', r: 'Quand son déterminant $ab\' - a\'b$ est non nul.' },
      { q: 'But de la méthode du pivot de Gauss ?', r: 'Obtenir un système triangulaire équivalent.' },
      { q: 'Opération autorisée sur $L_2$ ?', r: '$L_2 \\leftarrow \\alpha L_2 + \\beta L_1$ avec $\\alpha \\neq 0$.' },
      { q: 'Ordre de résolution d\'un système triangulaire ?', r: 'On remonte : $z$, puis $y$, puis $x$.' },
      { q: 'Que faire une fois la solution trouvée ?', r: 'La vérifier dans les équations de départ.' }
    ],
    contexte: {
      titre: 'Les prix des fruits au marché de Thiès',
      enonce: 'Au marché de Thiès, Fatou achète $2$ kg de mangues, $1$ kg d\'oranges et $1$ kg de bananes pour $2\\,500$ F CFA ; Awa achète $1$ kg de mangues, $2$ kg d\'oranges et $1$ kg de bananes pour $2\\,300$ F CFA ; Khady achète $1$ kg de mangues, $1$ kg d\'oranges et $3$ kg de bananes pour $3\\,000$ F CFA. Quel est le prix d\'un kilogramme de chaque fruit ?',
      solution: [
        'Soit $x$, $y$, $z$ les prix (en F CFA) d\'un kg de mangues, d\'oranges et de bananes. On place en tête l\'achat d\'Awa : $$\\left\\{\\begin{array}{l} x + 2y + z = 2\\,300 \\quad (L_1) \\\\ 2x + y + z = 2\\,500 \\quad (L_2) \\\\ x + y + 3z = 3\\,000 \\quad (L_3) \\end{array}\\right.$$',
        '$L_2 \\leftarrow L_2 - 2L_1$ : $-3y - z = -2\\,100$. $L_3 \\leftarrow L_3 - L_1$ : $-y + 2z = 700$.',
        '$L_3 \\leftarrow 3L_3 - L_2$ : $7z = 4\\,200$, donc $z = 600$.',
        'Puis $-3y - 600 = -2\\,100$, donc $y = 500$, et $x = 2\\,300 - 1\\,000 - 600 = 700$.',
        'Un kg de mangues coûte $700$ F CFA, un kg d\'oranges $500$ F CFA et un kg de bananes $600$ F CFA. Vérification avec Khady : $700 + 500 + 1\\,800 = 3\\,000$.'
      ]
    },
    histoire: 'La méthode porte le nom de Carl Friedrich Gauss (1777-1855), mais elle figure déjà dans un ouvrage chinois très ancien, « Les Neuf Chapitres sur l\'art du calcul », compilé il y a environ deux mille ans.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-fonctions'] = {
    resume: 'On étudie le vocabulaire des fonctions (ensemble de définition, image, antécédent, courbe), leurs propriétés (parité, sens de variation, extremums) et les fonctions de référence : affine, carré, inverse, racine carrée, valeur absolue, cube.',
    objectifs: [
      'Déterminer l\'ensemble de définition d\'une fonction',
      'Calculer une image, rechercher des antécédents par le calcul ou graphiquement',
      'Étudier la parité d\'une fonction et l\'interpréter graphiquement',
      'Connaître les variations des fonctions de référence et en déduire celles de fonctions associées',
      'Comparer des images à l\'aide du sens de variation'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Fonction, ensemble de définition',
        texte: 'Une fonction $f$ associe à chaque réel $x$ de son ensemble de définition $D_f$ un unique réel $f(x)$, l\'image de $x$. Si $f(x) = y$, on dit que $x$ est un antécédent de $y$. La courbe $(C_f)$ est l\'ensemble des points $M(x \\,;\\, f(x))$ pour $x \\in D_f$.<br>Contraintes usuelles : un dénominateur doit être non nul ; un radicande doit être positif ou nul.'
      },
      {
        type: 'definition',
        titre: 'Parité',
        texte: 'Soit $f$ dont l\'ensemble de définition $D_f$ est symétrique par rapport à $0$. $f$ est <b>paire</b> si $f(-x) = f(x)$ pour tout $x \\in D_f$ : sa courbe est symétrique par rapport à l\'axe des ordonnées. $f$ est <b>impaire</b> si $f(-x) = -f(x)$ pour tout $x \\in D_f$ : sa courbe est symétrique par rapport à l\'origine.'
      },
      {
        type: 'definition',
        titre: 'Sens de variation, extremums',
        texte: '$f$ est croissante sur un intervalle $I$ si, pour tous $a < b$ de $I$, $f(a) \\leq f(b)$ ; décroissante si $f(a) \\geq f(b)$. Une fonction croissante conserve l\'ordre, une fonction décroissante l\'inverse. $f$ admet un maximum $M$ en $a$ si $f(x) \\leq f(a) = M$ pour tout $x \\in D_f$ ; de même pour un minimum.'
      },
      {
        type: 'propriete',
        titre: 'Fonctions de référence',
        texte: '• $x \\mapsto ax + b$ : croissante si $a > 0$, décroissante si $a < 0$.<br>• $x \\mapsto x^2$ (paire) : décroissante sur $]-\\infty \\,;\\, 0]$, croissante sur $[0 \\,;\\, +\\infty[$.<br>• $x \\mapsto \\dfrac{1}{x}$ (impaire, définie sur $\\R^*$) : décroissante sur $]-\\infty \\,;\\, 0[$ et sur $]0 \\,;\\, +\\infty[$.<br>• $x \\mapsto \\sqrt{x}$ (définie sur $[0 \\,;\\, +\\infty[$) : croissante.<br>• $x \\mapsto |x|$ (paire) : décroissante sur $]-\\infty \\,;\\, 0]$, croissante sur $[0 \\,;\\, +\\infty[$.<br>• $x \\mapsto x^3$ (impaire) : croissante sur $\\R$.'
      },
      {
        type: 'propriete',
        titre: 'Fonctions associées',
        texte: 'La courbe de $x \\mapsto f(x - a) + b$ est l\'image de $(C_f)$ par la translation de vecteur $a\\vec{i} + b\\vec{j}$. Multiplier $f$ par $k > 0$ conserve son sens de variation, par $k < 0$ l\'inverse ; ajouter une constante ne le change pas. Ainsi $x \\mapsto a(x - \\alpha)^2 + \\beta$ a les variations de $x \\mapsto x^2$ décalées en $\\alpha$ (inversées si $a < 0$).'
      }
    ],
    methodes: [
      {
        titre: 'Étudier la parité d\'une fonction',
        etapes: [
          'Déterminer $D_f$ et vérifier qu\'il est symétrique par rapport à $0$ (sinon $f$ n\'est ni paire ni impaire).',
          'Calculer $f(-x)$ et le simplifier.',
          'Comparer avec $f(x)$ et avec $-f(x)$ ; pour prouver qu\'une égalité est fausse, un contre-exemple suffit.'
        ]
      },
      {
        titre: 'Déterminer un ensemble de définition',
        etapes: [
          'Repérer les dénominateurs (qui doivent être non nuls) et les radicaux (radicande positif ou nul).',
          'Résoudre les équations et inéquations correspondantes.',
          'Écrire $D_f$ à l\'aide d\'intervalles, en retirant les valeurs interdites.'
        ]
      }
    ],
    exemple: {
      enonce: 'Soit $f(x) = \\dfrac{2x}{x^2 + 1}$. Déterminer $D_f$, étudier la parité de $f$ et calculer les antécédents de $1$.',
      solution: [
        'Pour tout réel $x$, $x^2 + 1 \\geq 1 > 0$ : $D_f = \\R$, symétrique par rapport à $0$.',
        '$f(-x) = \\dfrac{2(-x)}{(-x)^2 + 1} = -\\dfrac{2x}{x^2 + 1} = -f(x)$ : $f$ est impaire.',
        '$f(x) = 1 \\iff 2x = x^2 + 1 \\iff x^2 - 2x + 1 = 0 \\iff (x - 1)^2 = 0 \\iff x = 1$.',
        '$1$ a un unique antécédent : $1$.'
      ]
    },
    erreurs: [
      'Conclure qu\'une fonction est paire après avoir vérifié $f(-x) = f(x)$ pour une seule valeur : il faut que ce soit vrai pour tout $x$ de $D_f$.',
      'Oublier de vérifier que $D_f$ est symétrique par rapport à $0$ avant d\'étudier la parité.',
      'Dire que $x \\mapsto \\dfrac{1}{x}$ est décroissante sur $\\R^*$ : elle l\'est sur chacun des intervalles $]-\\infty \\,;\\, 0[$ et $]0 \\,;\\, +\\infty[$, mais pas sur leur réunion ($-1 < 1$ et $f(-1) < f(1)$).',
      'Confondre image et antécédent.'
    ],
    flashcards: [
      { q: '$f$ paire signifie…', r: '$D_f$ symétrique et $f(-x) = f(x)$ : courbe symétrique par rapport à l\'axe des ordonnées.' },
      { q: '$f$ impaire signifie…', r: '$D_f$ symétrique et $f(-x) = -f(x)$ : courbe symétrique par rapport à $O$.' },
      { q: 'Variations de $x \\mapsto x^2$', r: 'Décroissante sur $]-\\infty \\,;\\, 0]$, croissante sur $[0 \\,;\\, +\\infty[$.' },
      { q: '$D_f$ pour $f(x) = \\sqrt{x - 2}$', r: '$[2 \\,;\\, +\\infty[$' },
      { q: 'Une fonction décroissante…', r: '… inverse l\'ordre : si $a < b$, alors $f(a) \\geq f(b)$.' },
      { q: 'Antécédent de $y$ par $f$ ?', r: 'Toute solution de l\'équation $f(x) = y$.' }
    ],
    contexte: {
      titre: 'Clôturer un enclos à Fatick',
      enonce: 'Ibrahima dispose de $200$ m de grillage pour clôturer un enclos rectangulaire pour ses moutons. On note $x$ la largeur (en m). Exprimer l\'aire $A(x)$ en fonction de $x$, préciser son ensemble de définition, puis trouver les dimensions qui donnent l\'aire maximale.',
      solution: [
        'Le demi-périmètre vaut $100$ m, donc la longueur est $100 - x$ et $A(x) = x(100 - x)$, avec $0 < x < 100$ : $D_A = ]0 \\,;\\, 100[$.',
        '$A(x) = -x^2 + 100x = -\\left(x^2 - 100x\\right) = -\\left[(x - 50)^2 - 2\\,500\\right] = -(x - 50)^2 + 2\\,500$.',
        'Comme $-(x - 50)^2 \\leq 0$, on a $A(x) \\leq 2\\,500$, avec égalité pour $x = 50$.',
        '$A$ est croissante sur $]0 \\,;\\, 50]$ et décroissante sur $[50 \\,;\\, 100[$.',
        'L\'aire maximale est $2\\,500$ m², obtenue pour un enclos carré de $50$ m de côté.'
      ]
    },
    histoire: 'La notation $f(x)$ a été popularisée au XVIIIe siècle par le mathématicien suisse Leonhard Euler.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-statistiques'] = {
    resume: 'On résume une série statistique par des paramètres de position (mode, médiane, moyenne, quartiles) et de dispersion (étendue, variance, écart-type), pour des données isolées ou regroupées en classes.',
    objectifs: [
      'Organiser une série dans un tableau d\'effectifs, de fréquences et d\'effectifs cumulés',
      'Calculer la moyenne d\'une série (valeurs isolées ou classes)',
      'Déterminer le mode ou la classe modale, la médiane et les quartiles',
      'Calculer la variance et l\'écart-type et les interpréter',
      'Comparer deux séries à l\'aide de leurs paramètres'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Vocabulaire',
        texte: 'Une série statistique porte sur une population de $N$ individus et un caractère (quantitatif discret ou continu). L\'effectif $n_i$ d\'une valeur $x_i$ est le nombre d\'individus correspondants ; sa fréquence est $f_i = \\dfrac{n_i}{N}$. Les effectifs cumulés croissants (E.C.C.) indiquent combien d\'individus ont une valeur inférieure ou égale à $x_i$.'
      },
      {
        type: 'formule',
        titre: 'Moyenne',
        texte: '$$\\bar{x} = \\dfrac{n_1x_1 + n_2x_2 + \\dots + n_px_p}{N} = f_1x_1 + f_2x_2 + \\dots + f_px_p.$$ Pour une série regroupée en classes, on remplace chaque classe $[a \\,;\\, b[$ par son centre $\\dfrac{a + b}{2}$.'
      },
      {
        type: 'definition',
        titre: 'Mode, médiane, quartiles',
        texte: 'Le mode est la valeur de plus grand effectif (on parle de classe modale pour des classes). La médiane $Me$ partage la série ordonnée en deux groupes de même effectif : si $N$ est impair, c\'est la valeur de rang $\\dfrac{N + 1}{2}$ ; si $N$ est pair, la moyenne des valeurs de rangs $\\dfrac{N}{2}$ et $\\dfrac{N}{2} + 1$. Le premier quartile $Q_1$ est la plus petite valeur telle qu\'au moins $25\\,\\%$ des valeurs lui soient inférieures ou égales ; le troisième quartile $Q_3$ se définit de même avec $75\\,\\%$.'
      },
      {
        type: 'formule',
        titre: 'Variance et écart-type',
        texte: '$$V = \\dfrac{\\sum n_i (x_i - \\bar{x})^2}{N} = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2 \\qquad \\text{et} \\qquad \\sigma = \\sqrt{V}.$$ L\'écart-type mesure la dispersion des valeurs autour de la moyenne ; il s\'exprime dans la même unité que les valeurs.'
      },
      {
        type: 'remarque',
        titre: 'Étendue et écart interquartile',
        texte: 'L\'étendue est la différence entre la plus grande et la plus petite valeur. L\'écart interquartile $Q_3 - Q_1$ est moins sensible aux valeurs extrêmes ; de même, la médiane est moins sensible aux valeurs extrêmes que la moyenne.'
      }
    ],
    methodes: [
      {
        titre: 'Calculer la moyenne, la variance et l\'écart-type',
        etapes: [
          'Compléter le tableau avec les lignes $n_i x_i$ et $n_i x_i^2$.',
          'Calculer $\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$.',
          'Calculer $V = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2$ avec la valeur exacte de $\\bar{x}$.',
          'Prendre $\\sigma = \\sqrt{V}$ et n\'arrondir qu\'à la fin.'
        ]
      },
      {
        titre: 'Déterminer la médiane et les quartiles',
        etapes: [
          'Ranger les valeurs dans l\'ordre croissant et calculer les effectifs cumulés croissants.',
          'Calculer les rangs utiles : $\\dfrac{N}{2}$ pour la médiane, $\\dfrac{N}{4}$ et $\\dfrac{3N}{4}$ (arrondis à l\'entier supérieur) pour les quartiles.',
          'Lire dans les effectifs cumulés la valeur qui correspond à chaque rang.'
        ]
      }
    ],
    exemple: {
      enonce: 'Voici les notes de 10 élèves : $8$ ; $10$ ; $10$ ; $12$ ; $12$ ; $12$ ; $13$ ; $14$ ; $15$ ; $18$. Calculer la moyenne, la médiane, la variance et l\'écart-type.',
      solution: [
        '$\\bar{x} = \\dfrac{124}{10} = 12{,}4$.',
        '$N = 10$ est pair : la médiane est la moyenne des 5e et 6e valeurs, $Me = \\dfrac{12 + 12}{2} = 12$.',
        '$\\sum x_i^2 = 1\\,610$, donc $V = \\dfrac{1\\,610}{10} - 12{,}4^2 = 161 - 153{,}76 = 7{,}24$.',
        '$\\sigma = \\sqrt{7{,}24} \\approx 2{,}69$.'
      ]
    },
    erreurs: [
      'Chercher la médiane sans avoir rangé les valeurs dans l\'ordre croissant.',
      'Arrondir la moyenne avant de calculer la variance : on garde la valeur exacte jusqu\'au bout.',
      'Oublier les effectifs : la moyenne n\'est pas la moyenne des seules valeurs $x_i$ du tableau.',
      'Confondre variance et écart-type : $\\sigma = \\sqrt{V}$.'
    ],
    flashcards: [
      { q: 'Formule de la moyenne', r: '$\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$' },
      { q: 'Formule pratique de la variance', r: '$V = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2$' },
      { q: 'Écart-type', r: '$\\sigma = \\sqrt{V}$' },
      { q: 'Médiane quand $N$ est impair', r: 'La valeur de rang $\\dfrac{N + 1}{2}$.' },
      { q: 'Rang du premier quartile', r: 'Le plus petit entier supérieur ou égal à $\\dfrac{N}{4}$.' },
      { q: 'Centre de la classe $[20 \\,;\\, 30[$', r: '$25$' }
    ],
    contexte: {
      titre: 'Deux pirogues au quai de Kayar',
      enonce: 'Pendant 10 jours, on a noté le nombre de caisses de poissons débarquées par deux pirogues de Kayar.<br>Pirogue A : $5$ ; $6$ ; $6$ ; $7$ ; $7$ ; $7$ ; $7$ ; $8$ ; $8$ ; $9$.<br>Pirogue B : $2$ ; $4$ ; $5$ ; $6$ ; $7$ ; $8$ ; $8$ ; $9$ ; $10$ ; $11$.<br>Comparer les deux séries.',
      solution: [
        'Moyennes : $\\bar{x}_A = \\dfrac{70}{10} = 7$ et $\\bar{x}_B = \\dfrac{70}{10} = 7$ : en moyenne, les deux pirogues débarquent autant.',
        'Pour A, la somme des carrés des écarts à la moyenne vaut $4 + 1 + 1 + 0 + 0 + 0 + 0 + 1 + 1 + 4 = 12$, donc $V_A = 1{,}2$ et $\\sigma_A \\approx 1{,}10$.',
        'Pour B : $25 + 9 + 4 + 1 + 0 + 1 + 1 + 4 + 9 + 16 = 70$, donc $V_B = 7$ et $\\sigma_B \\approx 2{,}65$.',
        'Même moyenne, mais les débarquements de la pirogue B sont beaucoup plus irréguliers (écart-type plus grand) : la pirogue A est plus régulière.'
      ]
    },
    histoire: 'L\'expression « écart-type » traduit l\'anglais « standard deviation », introduite par le statisticien Karl Pearson à la fin du XIXe siècle.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-trigonometrie'] = {
    resume: 'On mesure les angles en radians, on repère les points du cercle trigonométrique et on définit le cosinus et le sinus d\'un réel, avec leurs valeurs remarquables et les formules des angles associés.',
    objectifs: [
      'Convertir des mesures d\'angles entre degrés et radians ; calculer une longueur d\'arc',
      'Placer sur le cercle trigonométrique le point associé à un réel',
      'Déterminer la mesure principale d\'un angle orienté',
      'Connaître les valeurs remarquables de $\\cos$ et $\\sin$ et les formules des angles associés',
      'Utiliser la relation $\\cos^2 x + \\sin^2 x = 1$'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Le radian',
        texte: 'Le radian est la mesure de l\'angle au centre qui intercepte, sur un cercle de rayon $R$, un arc de longueur $R$. Ainsi $\\pi \\text{ rad} = 180^{\\circ}$ : les mesures en degrés et en radians sont proportionnelles. Un angle au centre de $\\theta$ radians intercepte un arc de longueur $\\ell = R\\theta$.'
      },
      {
        type: 'definition',
        titre: 'Cercle trigonométrique et angles orientés',
        texte: 'Dans un repère orthonormé direct $(O, \\vec{i}, \\vec{j})$, le cercle trigonométrique est le cercle de centre $O$ et de rayon $1$, orienté dans le sens direct (contraire des aiguilles d\'une montre). À tout réel $x$ correspond un point $M$ du cercle ; $x$ est une mesure de l\'angle orienté $(\\vec{i}, \\vect{OM})$. Les mesures de cet angle sont les réels $x + 2k\\pi$, $k \\in \\Z$ ; une seule appartient à $]-\\pi \\,;\\, \\pi]$ : c\'est la <b>mesure principale</b>.'
      },
      {
        type: 'definition',
        titre: 'Cosinus et sinus',
        texte: 'Si $M$ est le point du cercle trigonométrique associé à $x$, alors $\\cos x$ est l\'abscisse et $\\sin x$ l\'ordonnée de $M$. Pour tout réel $x$ et tout entier $k$ : $$-1 \\leq \\cos x \\leq 1, \\quad -1 \\leq \\sin x \\leq 1, \\quad \\cos^2 x + \\sin^2 x = 1,$$ $$\\cos(x + 2k\\pi) = \\cos x \\quad \\text{et} \\quad \\sin(x + 2k\\pi) = \\sin x.$$ Si $\\cos x \\neq 0$, on pose $\\tan x = \\dfrac{\\sin x}{\\cos x}$.'
      },
      {
        type: 'formule',
        titre: 'Valeurs remarquables',
        texte: '$$\\begin{array}{c|ccccc} x & 0 & \\dfrac{\\pi}{6} & \\dfrac{\\pi}{4} & \\dfrac{\\pi}{3} & \\dfrac{\\pi}{2} \\\\ \\hline \\cos x & 1 & \\dfrac{\\sqrt{3}}{2} & \\dfrac{\\sqrt{2}}{2} & \\dfrac{1}{2} & 0 \\\\ \\sin x & 0 & \\dfrac{1}{2} & \\dfrac{\\sqrt{2}}{2} & \\dfrac{\\sqrt{3}}{2} & 1 \\end{array}$$'
      },
      {
        type: 'formule',
        titre: 'Angles associés',
        texte: '$\\cos(-x) = \\cos x$ et $\\sin(-x) = -\\sin x$ ; $\\cos(\\pi - x) = -\\cos x$ et $\\sin(\\pi - x) = \\sin x$ ; $\\cos(\\pi + x) = -\\cos x$ et $\\sin(\\pi + x) = -\\sin x$ ; $\\cos\\left(\\dfrac{\\pi}{2} - x\\right) = \\sin x$ et $\\sin\\left(\\dfrac{\\pi}{2} - x\\right) = \\cos x$.'
      }
    ],
    methodes: [
      {
        titre: 'Trouver la mesure principale de $\\dfrac{p\\pi}{q}$',
        etapes: [
          'Écrire $p = 2qk + r$ avec $-q < r \\leq q$.',
          'Alors $\\dfrac{p\\pi}{q} = \\dfrac{r\\pi}{q} + k \\times 2\\pi$.',
          'La mesure principale est $\\dfrac{r\\pi}{q}$, qui appartient bien à $]-\\pi \\,;\\, \\pi]$.'
        ]
      },
      {
        titre: 'Calculer $\\cos$ et $\\sin$ d\'un angle remarquable',
        etapes: [
          'Placer le point sur le cercle et repérer son quadrant.',
          'Identifier l\'angle aigu associé ($\\pi - x$, $\\pi + x$, $-x$…).',
          'Utiliser le tableau des valeurs remarquables et les signes du quadrant.'
        ]
      }
    ],
    exemple: {
      enonce: 'Déterminer la mesure principale de $\\dfrac{29\\pi}{4}$, puis calculer $\\cos\\dfrac{29\\pi}{4}$ et $\\sin\\dfrac{29\\pi}{4}$.',
      solution: [
        '$29 = 32 - 3$, donc $\\dfrac{29\\pi}{4} = 8\\pi - \\dfrac{3\\pi}{4} = -\\dfrac{3\\pi}{4} + 4 \\times 2\\pi$.',
        'Comme $-\\pi < -\\dfrac{3\\pi}{4} \\leq \\pi$, la mesure principale est $-\\dfrac{3\\pi}{4}$.',
        '$-\\dfrac{3\\pi}{4} = -\\pi + \\dfrac{\\pi}{4}$, donc $\\cos\\left(-\\dfrac{3\\pi}{4}\\right) = -\\cos\\dfrac{\\pi}{4} = -\\dfrac{\\sqrt{2}}{2}$ et $\\sin\\left(-\\dfrac{3\\pi}{4}\\right) = -\\sin\\dfrac{\\pi}{4} = -\\dfrac{\\sqrt{2}}{2}$.'
      ]
    },
    erreurs: [
      'Oublier de régler la calculatrice en mode radian.',
      'Donner une mesure principale hors de $]-\\pi \\,;\\, \\pi]$, par exemple $\\dfrac{3\\pi}{2}$ au lieu de $-\\dfrac{\\pi}{2}$.',
      'Confondre $\\cos$ (abscisse) et $\\sin$ (ordonnée) du point du cercle.',
      'Oublier le signe imposé par le quadrant quand on utilise $\\cos^2 x + \\sin^2 x = 1$.'
    ],
    flashcards: [
      { q: '$180^{\\circ}$ en radians', r: '$\\pi$ rad' },
      { q: 'Longueur d\'un arc', r: '$\\ell = R\\theta$ ($\\theta$ en radians)' },
      { q: '$\\cos\\dfrac{\\pi}{3}$', r: '$\\dfrac{1}{2}$' },
      { q: '$\\sin\\dfrac{\\pi}{4}$', r: '$\\dfrac{\\sqrt{2}}{2}$' },
      { q: 'Intervalle de la mesure principale', r: '$]-\\pi \\,;\\, \\pi]$' },
      { q: '$\\cos(\\pi - x) = ?$', r: '$-\\cos x$' },
      { q: 'Relation fondamentale', r: '$\\cos^2 x + \\sin^2 x = 1$' }
    ],
    contexte: {
      titre: 'La roue d\'une charrette à Diourbel',
      enonce: 'La roue d\'une charrette a un diamètre de $1{,}2$ m. a) Quelle distance parcourt la charrette quand la roue fait un tour complet ? b) De quel angle (en radians, puis en degrés) la roue a-t-elle tourné quand la charrette avance de $1$ m ?',
      solution: [
        'Le rayon est $R = 0{,}6$ m. Un tour correspond à un angle de $2\\pi$ rad : $\\ell = R \\times 2\\pi = 1{,}2\\pi \\approx 3{,}77$ m.',
        'Pour $\\ell = 1$ m : $\\theta = \\dfrac{\\ell}{R} = \\dfrac{1}{0{,}6} = \\dfrac{5}{3}$ rad $\\approx 1{,}67$ rad.',
        'En degrés : $\\dfrac{5}{3} \\times \\dfrac{180}{\\pi} = \\dfrac{300}{\\pi} \\approx 95{,}5^{\\circ}$.'
      ]
    },
    histoire: 'Le mot « radian » apparaît pour la première fois en 1873, dans des sujets d\'examen rédigés par l\'ingénieur James Thomson, frère du physicien Lord Kelvin.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-vecteurs-barycentre'] = {
    resume: 'On approfondit le calcul vectoriel (combinaisons linéaires, colinéarité, coordonnées) et on introduit le barycentre de points pondérés, outil commode pour démontrer des alignements et localiser un point d\'équilibre.',
    objectifs: [
      'Calculer avec des vecteurs : somme, produit par un réel, relation de Chasles',
      'Utiliser les coordonnées : vecteur, milieu, colinéarité (déterminant)',
      'Construire et caractériser le barycentre de deux ou trois points pondérés',
      'Calculer les coordonnées d\'un barycentre',
      'Utiliser l\'associativité du barycentre et la réduction de $a\\vect{MA} + b\\vect{MB}$'
    ],
    cours: [
      {
        type: 'propriete',
        titre: 'Calcul vectoriel et coordonnées',
        texte: 'Relation de Chasles : $\\vect{AB} + \\vect{BC} = \\vect{AC}$. Si $\\vec{u}(x \\,;\\, y)$ et $\\vec{v}(x\' \\,;\\, y\')$, alors $\\vec{u} + \\vec{v}$ a pour coordonnées $(x + x\' \\,;\\, y + y\')$, $k\\vec{u}$ a pour coordonnées $(kx \\,;\\, ky)$, et $\\vect{AB}(x_B - x_A \\,;\\, y_B - y_A)$.'
      },
      {
        type: 'theoreme',
        titre: 'Colinéarité',
        texte: '$\\vec{u}(x \\,;\\, y)$ et $\\vec{v}(x\' \\,;\\, y\')$ sont colinéaires si et seulement si $\\det(\\vec{u}, \\vec{v}) = xy\' - yx\' = 0$. Trois points $A$, $B$, $C$ sont alignés si et seulement si $\\vect{AB}$ et $\\vect{AC}$ sont colinéaires ; $(AB) \\parallel (CD)$ si et seulement si $\\vect{AB}$ et $\\vect{CD}$ sont colinéaires.'
      },
      {
        type: 'definition',
        titre: 'Barycentre de deux points',
        texte: 'Soient $A$, $B$ deux points et $a$, $b$ deux réels tels que $a + b \\neq 0$. Il existe un unique point $G$ tel que $a\\vect{GA} + b\\vect{GB} = \\vec{0}$ : c\'est le barycentre des points pondérés $(A, a)$ et $(B, b)$, noté $G = \\operatorname{bar}\\{(A, a), (B, b)\\}$. On a $$\\vect{AG} = \\dfrac{b}{a + b}\\vect{AB}.$$ Si $a = b$, $G$ est le milieu de $[AB]$ (isobarycentre).'
      },
      {
        type: 'propriete',
        titre: 'Propriétés du barycentre',
        texte: '• Homogénéité : on ne change pas le barycentre en multipliant tous les coefficients par un même réel non nul.<br>• Réduction : pour tout point $M$, $a\\vect{MA} + b\\vect{MB} = (a + b)\\vect{MG}$ (de même avec trois points).<br>• Coordonnées : $x_G = \\dfrac{ax_A + bx_B}{a + b}$ et $y_G = \\dfrac{ay_A + by_B}{a + b}$.<br>• Associativité : dans $\\operatorname{bar}\\{(A, a), (B, b), (C, c)\\}$, on peut remplacer $(A, a)$ et $(B, b)$ par $(H, a + b)$, où $H = \\operatorname{bar}\\{(A, a), (B, b)\\}$ (si $a + b \\neq 0$).'
      },
      {
        type: 'remarque',
        titre: 'Position du barycentre',
        texte: '$G$ appartient à la droite $(AB)$. Si $a$ et $b$ sont de même signe, $G$ est sur le segment $[AB]$, plus proche du point qui a le plus grand coefficient.'
      }
    ],
    methodes: [
      {
        titre: 'Construire le barycentre de deux points',
        etapes: [
          'Vérifier que $a + b \\neq 0$.',
          'Calculer $k = \\dfrac{b}{a + b}$.',
          'Placer $G$ tel que $\\vect{AG} = k\\,\\vect{AB}$.'
        ]
      },
      {
        titre: 'Démontrer que trois points sont alignés',
        etapes: [
          'Calculer les coordonnées de $\\vect{AB}$ et de $\\vect{AC}$.',
          'Calculer le déterminant $xy\' - yx\'$.',
          'S\'il est nul, les points sont alignés ; on peut aussi montrer que l\'un des points est barycentre des deux autres.'
        ]
      }
    ],
    exemple: {
      enonce: 'On donne $A(1 \\,;\\, 2)$ et $B(4 \\,;\\, -1)$. Construire puis calculer les coordonnées de $G = \\operatorname{bar}\\{(A, 2), (B, 1)\\}$.',
      solution: [
        '$2 + 1 = 3 \\neq 0$ : $G$ existe et $\\vect{AG} = \\dfrac{1}{3}\\vect{AB}$.',
        '$\\vect{AB}(3 \\,;\\, -3)$, donc $\\vect{AG}(1 \\,;\\, -1)$ et $G(1 + 1 \\,;\\, 2 - 1)$, soit $G(2 \\,;\\, 1)$.',
        'Vérification : $x_G = \\dfrac{2 \\times 1 + 1 \\times 4}{3} = 2$ et $y_G = \\dfrac{2 \\times 2 + 1 \\times (-1)}{3} = 1$.'
      ]
    },
    erreurs: [
      'Écrire $\\vect{AG} = \\dfrac{a}{a + b}\\vect{AB}$ : c\'est le coefficient de $B$ qui apparaît, $\\vect{AG} = \\dfrac{b}{a + b}\\vect{AB}$.',
      'Oublier de vérifier que la somme des coefficients est non nulle.',
      'Oublier de diviser par $a + b$ dans le calcul des coordonnées.'
    ],
    flashcards: [
      { q: 'Définition de $G = \\operatorname{bar}\\{(A, a), (B, b)\\}$', r: '$a\\vect{GA} + b\\vect{GB} = \\vec{0}$, avec $a + b \\neq 0$.' },
      { q: '$\\vect{AG} = ?$', r: '$\\dfrac{b}{a + b}\\vect{AB}$' },
      { q: 'Isobarycentre de $A$ et $B$', r: 'Le milieu de $[AB]$.' },
      { q: 'Condition de colinéarité de $\\vec{u}(x \\,;\\, y)$ et $\\vec{v}(x\' \\,;\\, y\')$', r: '$xy\' - yx\' = 0$' },
      { q: 'Réduction de $a\\vect{MA} + b\\vect{MB}$', r: '$(a + b)\\vect{MG}$' }
    ],
    contexte: {
      titre: 'La balançoire à bascule de l\'école',
      enonce: 'Dans la cour d\'une école de Mbour, une planche de $3$ m sert de balançoire à bascule. Moussa ($30$ kg) s\'assoit à l\'extrémité $A$ et sa petite sœur Awa ($20$ kg) à l\'extrémité $B$. La planche est en équilibre si le point d\'appui est le barycentre $G = \\operatorname{bar}\\{(A, 30), (B, 20)\\}$. Où placer le point d\'appui ?',
      solution: [
        '$30 + 20 = 50 \\neq 0$ et $\\vect{AG} = \\dfrac{20}{50}\\vect{AB} = 0{,}4\\,\\vect{AB}$.',
        '$AG = 0{,}4 \\times 3 = 1{,}2$ m et $GB = 3 - 1{,}2 = 1{,}8$ m.',
        'Le point d\'appui doit être à $1{,}2$ m de Moussa, plus près de l\'enfant le plus lourd. On retrouve la règle du levier : $30 \\times 1{,}2 = 20 \\times 1{,}8 = 36$.'
      ]
    },
    histoire: 'Archimède (IIIe siècle avant J.-C.) étudiait déjà les centres de gravité et le principe du levier ; le mot « barycentre » vient du grec « barus », qui signifie « lourd ».'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-droites'] = {
    resume: 'Dans un repère, une droite est déterminée par un point et un vecteur directeur. On en déduit ses équations (cartésienne, réduite) et on étudie le parallélisme, l\'orthogonalité et l\'intersection de deux droites.',
    objectifs: [
      'Déterminer une équation cartésienne d\'une droite définie par un point et un vecteur directeur, ou par deux points',
      'Passer d\'une équation cartésienne à l\'équation réduite et lire le coefficient directeur',
      'Reconnaître des droites parallèles ou perpendiculaires (repère orthonormé)',
      'Calculer les coordonnées du point d\'intersection de deux droites sécantes',
      'Calculer une distance et les coordonnées d\'un milieu'
    ],
    cours: [
      {
        type: 'propriete',
        titre: 'Distance et milieu',
        texte: 'Dans un repère orthonormé : $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$. Dans tout repère, le milieu $I$ de $[AB]$ a pour coordonnées $\\left(\\dfrac{x_A + x_B}{2} \\,;\\, \\dfrac{y_A + y_B}{2}\\right)$.'
      },
      {
        type: 'theoreme',
        titre: 'Équation cartésienne',
        texte: 'Toute droite a une équation de la forme $ax + by + c = 0$ avec $(a \\,;\\, b) \\neq (0 \\,;\\, 0)$ ; le vecteur $\\vec{u}(-b \\,;\\, a)$ est un vecteur directeur. Réciproquement, une telle équation définit une droite. La droite passant par $A$ et de vecteur directeur $\\vec{u}$ est l\'ensemble des points $M$ tels que $\\vect{AM}$ et $\\vec{u}$ sont colinéaires.'
      },
      {
        type: 'definition',
        titre: 'Équation réduite',
        texte: 'Si $b \\neq 0$, la droite a une équation réduite $y = mx + p$ : $m$ est le coefficient directeur et $p$ l\'ordonnée à l\'origine ; $\\vec{u}(1 \\,;\\, m)$ dirige la droite. Si $b = 0$, la droite est parallèle à l\'axe des ordonnées et a pour équation $x = k$. Pour deux points tels que $x_A \\neq x_B$ : $m = \\dfrac{y_B - y_A}{x_B - x_A}$.'
      },
      {
        type: 'theoreme',
        titre: 'Parallélisme et orthogonalité',
        texte: 'Deux droites sont parallèles si et seulement si leurs vecteurs directeurs sont colinéaires (déterminant nul) ; avec des équations réduites, si et seulement si $m = m\'$. Dans un repère orthonormé, $\\vec{u}(x \\,;\\, y)$ et $\\vec{v}(x\' \\,;\\, y\')$ sont orthogonaux si et seulement si $xx\' + yy\' = 0$ ; deux droites d\'équations réduites sont perpendiculaires si et seulement si $mm\' = -1$.'
      },
      {
        type: 'propriete',
        titre: 'Intersection de deux droites',
        texte: 'Deux droites non parallèles sont sécantes ; les coordonnées de leur point d\'intersection forment la solution du système constitué de leurs deux équations.'
      }
    ],
    methodes: [
      {
        titre: 'Trouver une équation cartésienne',
        etapes: [
          'Choisir un point $A$ et un vecteur directeur $\\vec{u}(\\alpha \\,;\\, \\beta)$ (par exemple $\\vect{AB}$).',
          'Écrire que $\\vect{AM}(x - x_A \\,;\\, y - y_A)$ et $\\vec{u}$ sont colinéaires : $\\beta(x - x_A) - \\alpha(y - y_A) = 0$.',
          'Développer, réduire, puis vérifier avec un second point.'
        ]
      },
      {
        titre: 'Étudier la position relative de deux droites',
        etapes: [
          'Écrire un vecteur directeur de chaque droite.',
          'Calculer leur déterminant : s\'il est nul, les droites sont parallèles (tester un point pour savoir si elles sont confondues) ; sinon elles sont sécantes.',
          'Si elles sont sécantes, résoudre le système formé par les deux équations.'
        ]
      }
    ],
    exemple: {
      enonce: 'Déterminer une équation cartésienne, puis l\'équation réduite, de la droite $(AB)$ avec $A(1 \\,;\\, 3)$ et $B(3 \\,;\\, -1)$.',
      solution: [
        '$\\vect{AB}(2 \\,;\\, -4)$ est un vecteur directeur.',
        '$M(x \\,;\\, y) \\in (AB) \\iff (x - 1) \\times (-4) - (y - 3) \\times 2 = 0 \\iff -4x - 2y + 10 = 0 \\iff 2x + y - 5 = 0$.',
        'Équation réduite : $y = -2x + 5$ (coefficient directeur $-2$, ordonnée à l\'origine $5$).',
        'Vérification avec $B$ : $2 \\times 3 + (-1) - 5 = 0$.'
      ]
    },
    erreurs: [
      'Prendre $(a \\,;\\, b)$ comme vecteur directeur de $ax + by + c = 0$ : c\'est $(-b \\,;\\, a)$ ; le vecteur $(a \\,;\\, b)$ est orthogonal à la droite en repère orthonormé.',
      'Utiliser $mm\' = -1$ ou $xx\' + yy\' = 0$ dans un repère qui n\'est pas orthonormé.',
      'Oublier les droites parallèles à l\'axe des ordonnées, qui n\'ont pas d\'équation de la forme $y = mx + p$.'
    ],
    flashcards: [
      { q: 'Vecteur directeur de $ax + by + c = 0$', r: '$\\vec{u}(-b \\,;\\, a)$' },
      { q: 'Coefficient directeur de $(AB)$', r: '$m = \\dfrac{y_B - y_A}{x_B - x_A}$' },
      { q: 'Droites parallèles (équations réduites)', r: 'Elles ont le même coefficient directeur.' },
      { q: 'Droites perpendiculaires (repère orthonormé)', r: '$mm\' = -1$' },
      { q: 'Distance $AB$ (repère orthonormé)', r: '$\\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$' }
    ],
    contexte: {
      titre: 'Un carrefour près de Tambacounda',
      enonce: 'Sur une carte munie d\'un repère orthonormé (unité : 1 km), une piste rectiligne relie les villages $A(0 \\,;\\, 2)$ et $B(6 \\,;\\, 5)$. Une route nationale a pour équation $x + y - 8 = 0$. On veut installer un marché hebdomadaire au carrefour de la piste et de la route. Déterminer sa position et la distance qui le sépare du village $A$.',
      solution: [
        'Coefficient directeur de $(AB)$ : $m = \\dfrac{5 - 2}{6 - 0} = \\dfrac{1}{2}$, et $p = 2$ : $(AB) : y = \\dfrac{1}{2}x + 2$.',
        'Vecteurs directeurs $(2 \\,;\\, 1)$ et $(-1 \\,;\\, 1)$ : leur déterminant vaut $2 \\times 1 - 1 \\times (-1) = 3 \\neq 0$, les deux voies se croisent.',
        'On remplace $y$ dans $x + y - 8 = 0$ : $x + \\dfrac{1}{2}x + 2 - 8 = 0 \\iff \\dfrac{3}{2}x = 6 \\iff x = 4$, puis $y = 4$.',
        'Le marché sera au point $M(4 \\,;\\, 4)$, à $AM = \\sqrt{4^2 + 2^2} = \\sqrt{20} = 2\\sqrt{5} \\approx 4{,}47$ km du village $A$.'
      ]
    },
    histoire: 'Dans « La Géométrie » (1637), René Descartes montre comment traduire des problèmes de géométrie en équations : c\'est la naissance de la géométrie analytique, d\'où l\'expression « repère cartésien ».'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-transformations'] = {
    resume: 'Les transformations du plan (translations, symétries, homothéties, rotations) déplacent, retournent, agrandissent ou réduisent les figures. On apprend leurs définitions vectorielles, leurs propriétés de conservation et le calcul des coordonnées d\'images.',
    objectifs: [
      'Définir et construire l\'image d\'un point par une translation, une symétrie centrale, une symétrie orthogonale, une homothétie, une rotation',
      'Calculer les coordonnées de l\'image d\'un point',
      'Connaître les propriétés de conservation (alignement, parallélisme, distances, angles)',
      'Utiliser une homothétie pour agrandir ou réduire une figure (effet sur les longueurs et les aires)',
      'Déterminer un élément caractéristique : centre, vecteur, rapport'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Translation et symétrie centrale',
        texte: 'La translation de vecteur $\\vec{u}$ associe à tout point $M$ le point $M\'$ tel que $\\vect{MM\'} = \\vec{u}$. La symétrie de centre $\\Omega$ associe à $M$ le point $M\'$ tel que $\\Omega$ soit le milieu de $[MM\']$, c\'est-à-dire $\\vect{\\Omega M\'} = -\\vect{\\Omega M}$.'
      },
      {
        type: 'definition',
        titre: 'Homothétie',
        texte: 'Soit $\\Omega$ un point et $k$ un réel non nul. L\'homothétie de centre $\\Omega$ et de rapport $k$ associe à $M$ le point $M\'$ tel que $\\vect{\\Omega M\'} = k\\,\\vect{\\Omega M}$. Pour $k = -1$, c\'est la symétrie de centre $\\Omega$. Si $M\'$ et $N\'$ sont les images de $M$ et $N$, alors $\\vect{M\'N\'} = k\\,\\vect{MN}$ : les longueurs sont multipliées par $|k|$ et les aires par $k^2$.'
      },
      {
        type: 'definition',
        titre: 'Rotation',
        texte: 'La rotation de centre $\\Omega$ et d\'angle $\\theta$ laisse $\\Omega$ fixe et associe à $M \\neq \\Omega$ le point $M\'$ tel que $\\Omega M\' = \\Omega M$ et $\\left(\\vect{\\Omega M}, \\vect{\\Omega M\'}\\right) = \\theta$. Dans un repère orthonormé direct, le quart de tour direct (angle $\\dfrac{\\pi}{2}$) transforme le vecteur $(a \\,;\\, b)$ en $(-b \\,;\\, a)$ ; le quart de tour indirect le transforme en $(b \\,;\\, -a)$.'
      },
      {
        type: 'definition',
        titre: 'Symétrie orthogonale',
        texte: 'La symétrie d\'axe $\\Delta$ associe à $M$ le point $M\'$ tel que $\\Delta$ soit la médiatrice de $[MM\']$ (et $M\' = M$ si $M \\in \\Delta$). Dans un repère orthonormé : par rapport à $(Ox)$, $(x \\,;\\, y) \\mapsto (x \\,;\\, -y)$ ; par rapport à $(Oy)$, $(x \\,;\\, y) \\mapsto (-x \\,;\\, y)$ ; par rapport à la droite d\'équation $y = x$, $(x \\,;\\, y) \\mapsto (y \\,;\\, x)$.'
      },
      {
        type: 'propriete',
        titre: 'Propriétés de conservation',
        texte: 'Translations, symétries et rotations conservent les distances, les angles, l\'alignement, le parallélisme et les aires : ce sont des isométries. Une homothétie conserve l\'alignement, le parallélisme, les angles géométriques et les milieux, mais multiplie les distances par $|k|$. L\'image d\'une droite par une translation, une symétrie centrale ou une homothétie est une droite parallèle à la droite de départ.'
      }
    ],
    methodes: [
      {
        titre: 'Calculer les coordonnées d\'une image',
        etapes: [
          'Traduire la définition par une égalité vectorielle ($\\vect{MM\'} = \\vec{u}$, $\\vect{\\Omega M\'} = k\\,\\vect{\\Omega M}$…).',
          'Écrire l\'égalité des coordonnées des deux vecteurs.',
          'Résoudre pour obtenir $x\'$ et $y\'$.'
        ]
      },
      {
        titre: 'Trouver le centre d\'une homothétie',
        etapes: [
          'Connaissant un point $A$, son image $A\'$ et le rapport $k \\neq 1$, écrire $\\vect{\\Omega A\'} = k\\,\\vect{\\Omega A}$.',
          'Remplacer avec $\\Omega(x \\,;\\, y)$ et résoudre les deux équations obtenues.',
          'Contrôler que $\\Omega$, $A$ et $A\'$ sont alignés.'
        ]
      }
    ],
    exemple: {
      enonce: 'Soit $h$ l\'homothétie de centre $\\Omega(1 \\,;\\, 2)$ et de rapport $-2$. Calculer l\'image de $M(3 \\,;\\, 1)$. Un triangle d\'aire $5$ cm² a pour image par $h$ un triangle de quelle aire ?',
      solution: [
        '$\\vect{\\Omega M}(2 \\,;\\, -1)$, donc $\\vect{\\Omega M\'} = -2\\,\\vect{\\Omega M}$ a pour coordonnées $(-4 \\,;\\, 2)$.',
        '$M\'(1 - 4 \\,;\\, 2 + 2)$, soit $M\'(-3 \\,;\\, 4)$.',
        'Les aires sont multipliées par $k^2 = (-2)^2 = 4$ : l\'image a une aire de $20$ cm².'
      ]
    },
    erreurs: [
      'Multiplier les aires par $k$ au lieu de $k^2$ dans une homothétie.',
      'Partir du mauvais point : la définition est $\\vect{\\Omega M\'} = k\\,\\vect{\\Omega M}$, les deux vecteurs partent du centre.',
      'Confondre le sens direct (contraire des aiguilles d\'une montre) et le sens indirect pour une rotation.'
    ],
    flashcards: [
      { q: 'Translation de vecteur $\\vec{u}$', r: '$\\vect{MM\'} = \\vec{u}$' },
      { q: 'Homothétie de centre $\\Omega$ et de rapport $k$', r: '$\\vect{\\Omega M\'} = k\\,\\vect{\\Omega M}$' },
      { q: 'Effet d\'une homothétie de rapport $k$ sur les aires', r: 'Elles sont multipliées par $k^2$.' },
      { q: 'Image de $(a \\,;\\, b)$ par le quart de tour direct', r: '$(-b \\,;\\, a)$' },
      { q: 'Symétrique de $(x \\,;\\, y)$ par rapport à $(Ox)$', r: '$(x \\,;\\, -y)$' },
      { q: 'Qu\'est-ce qu\'une isométrie ?', r: 'Une transformation qui conserve les distances.' }
    ],
    contexte: {
      titre: 'Agrandir un motif de pagne à Saint-Louis',
      enonce: 'Une couturière de Saint-Louis veut reproduire en grand, sur un tissu, un motif triangulaire $ABC$ dessiné dans un repère orthonormé (unité : 1 cm) avec $A(1 \\,;\\, 1)$, $B(5 \\,;\\, 1)$ et $C(1 \\,;\\, 7)$. Elle utilise l\'homothétie de centre $O$ et de rapport $3$. Calculer les coordonnées des images, la longueur $A\'B\'$ et l\'aire du grand motif.',
      solution: [
        '$\\vect{OA\'} = 3\\,\\vect{OA}$ donne $A\'(3 \\,;\\, 3)$ ; de même $B\'(15 \\,;\\, 3)$ et $C\'(3 \\,;\\, 21)$.',
        '$AB = 4$ cm, donc $A\'B\' = 3 \\times 4 = 12$ cm ; on le vérifie : $15 - 3 = 12$.',
        'Le triangle $ABC$ est rectangle en $A$ : son aire vaut $\\dfrac{4 \\times 6}{2} = 12$ cm².',
        'Les aires sont multipliées par $3^2 = 9$ : le grand motif a une aire de $108$ cm².'
      ]
    },
    histoire: 'En 1872, le mathématicien allemand Felix Klein proposa, dans son « programme d\'Erlangen », de classer les géométries selon les transformations qui laissent leurs propriétés invariantes.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['2s-espace'] = {
    resume: 'On apprend à raisonner dans l\'espace : règles d\'incidence, positions relatives de deux droites, d\'une droite et d\'un plan, de deux plans, et théorèmes de parallélisme, en s\'appuyant sur le cube et le tétraèdre.',
    objectifs: [
      'Représenter un solide en perspective cavalière',
      'Connaître les règles d\'incidence et les façons de déterminer un plan',
      'Déterminer la position relative de deux droites, d\'une droite et d\'un plan, de deux plans',
      'Utiliser les théorèmes de parallélisme (droite parallèle à un plan, théorème du toit)',
      'Construire l\'intersection de deux plans ou la section d\'un solide par un plan'
    ],
    cours: [
      {
        type: 'propriete',
        titre: 'Règles d\'incidence',
        texte: 'Par deux points distincts passe une seule droite. Un plan est déterminé par trois points non alignés, ou par une droite et un point extérieur à elle, ou par deux droites sécantes, ou par deux droites strictement parallèles. Si deux points distincts d\'une droite appartiennent à un plan, toute la droite est contenue dans ce plan.'
      },
      {
        type: 'definition',
        titre: 'Positions relatives de deux droites',
        texte: 'Deux droites de l\'espace sont soit <b>coplanaires</b> (elles sont alors sécantes, strictement parallèles ou confondues), soit <b>non coplanaires</b> : aucun plan ne les contient ; elles n\'ont alors aucun point commun et ne sont pas parallèles.'
      },
      {
        type: 'definition',
        titre: 'Droite et plan, deux plans',
        texte: 'Une droite et un plan sont soit sécants (un seul point commun), soit parallèles (la droite est contenue dans le plan, ou n\'a aucun point commun avec lui). Deux plans sont soit sécants suivant une droite, soit parallèles (strictement parallèles ou confondus).'
      },
      {
        type: 'theoreme',
        titre: 'Théorèmes de parallélisme',
        texte: '• Une droite est parallèle à un plan si et seulement si elle est parallèle à une droite de ce plan.<br>• Si deux plans sont parallèles, tout plan qui coupe l\'un coupe l\'autre, et les deux droites d\'intersection sont parallèles.<br>• Théorème du toit : si deux plans sécants contiennent respectivement deux droites parallèles, alors leur droite d\'intersection est parallèle à ces deux droites.'
      },
      {
        type: 'remarque',
        titre: 'Perspective cavalière',
        texte: 'En perspective cavalière, deux droites parallèles sont représentées par des droites parallèles et les milieux sont conservés, mais les longueurs et les angles ne sont pas tous respectés. Les arêtes cachées sont dessinées en pointillés.'
      }
    ],
    methodes: [
      {
        titre: 'Déterminer la position relative de deux droites',
        etapes: [
          'Chercher un plan qui contient l\'une des droites (une face du solide par exemple).',
          'Si l\'autre droite est aussi dans ce plan, elles sont coplanaires : parallèles ou sécantes.',
          'Sinon, chercher le point où elle coupe ce plan : s\'il n\'est pas sur la première droite, les droites sont non coplanaires.'
        ]
      },
      {
        titre: 'Montrer qu\'une droite est parallèle à un plan',
        etapes: [
          'Trouver dans le plan une droite parallèle à la droite donnée (par exemple grâce à des vecteurs égaux).',
          'Conclure : une droite parallèle à une droite d\'un plan est parallèle à ce plan.',
          'Pour « strictement parallèle », vérifier qu\'un point de la droite n\'est pas dans le plan.'
        ]
      }
    ],
    exemple: {
      enonce: '$ABCDEFGH$ est un cube. Quelle est la position relative des droites $(AB)$ et $(CG)$ ? Et celle de la droite $(EF)$ et du plan $(ABC)$ ?',
      solution: [
        '$(AB)$ est contenue dans le plan $(ABC)$ de la face $ABCD$. La droite $(CG)$ coupe ce plan au seul point $C$, qui n\'est pas sur $(AB)$.',
        'Si $(AB)$ et $(CG)$ étaient coplanaires, leur plan contiendrait $(AB)$ et $C$ : ce serait le plan $(ABC)$, qui ne contient pas $G$. Les droites sont donc non coplanaires.',
        '$\\vect{EF} = \\vect{AB}$ car $ABFE$ est un carré : $(EF)$ est parallèle à la droite $(AB)$ du plan $(ABC)$, donc parallèle à ce plan.',
        '$E$ n\'appartient pas au plan $(ABC)$ : $(EF)$ est strictement parallèle au plan $(ABC)$.'
      ]
    },
    erreurs: [
      'Croire que deux droites sans point commun sont parallèles : dans l\'espace, elles peuvent être non coplanaires.',
      'Se fier au dessin en perspective : deux droites qui se croisent sur le dessin ne sont pas forcément sécantes.',
      'Penser que deux droites parallèles à un même plan sont parallèles entre elles.'
    ],
    flashcards: [
      { q: 'Combien de points non alignés déterminent un plan ?', r: 'Trois.' },
      { q: 'Deux droites non coplanaires : combien de points communs ?', r: 'Aucun, et elles ne sont pas parallèles.' },
      { q: 'Quand une droite est-elle parallèle à un plan ?', r: 'Quand elle est parallèle à une droite de ce plan.' },
      { q: 'Intersection de deux plans sécants ?', r: 'Une droite.' },
      { q: 'Théorème du toit', r: 'Deux plans sécants contenant deux droites parallèles se coupent suivant une droite parallèle à ces deux droites.' }
    ],
    contexte: {
      titre: 'Le toit d\'un hangar à arachide à Kaffrine',
      enonce: 'Un hangar de stockage d\'arachide à Kaffrine a des murs verticaux et un toit à deux pans. Les hauts des murs avant et arrière sont les segments $[MN]$ et $[PQ]$, horizontaux et parallèles. Le pan avant du toit est le plan $(MNF)$ et le pan arrière le plan $(PQF)$, où $F$ est un point du faîtage. Justifier que le faîtage (intersection des deux pans) est parallèle à $(MN)$ et qu\'il est horizontal.',
      solution: [
        'Les plans $(MNF)$ et $(PQF)$ ont en commun le point $F$ et ne sont pas confondus : ils sont sécants suivant une droite $\\Delta$ passant par $F$, le faîtage.',
        'Le plan $(MNF)$ contient $(MN)$, le plan $(PQF)$ contient $(PQ)$, et $(MN) \\parallel (PQ)$.',
        'D\'après le théorème du toit, $\\Delta$ est parallèle à $(MN)$ et à $(PQ)$.',
        'Comme $(MN)$ est horizontale, $\\Delta$, qui lui est parallèle, est aussi horizontale : le faîtage est horizontal.'
      ]
    },
    histoire: 'Euclide consacre les livres XI à XIII de ses « Éléments » (vers 300 avant J.-C.) à la géométrie dans l\'espace.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['1l-equations'] = {
    resume: 'On résout les équations et inéquations du second degré grâce au discriminant et au signe du trinôme, puis on les utilise pour résoudre des problèmes concrets : partages, dimensions de terrains, prix.',
    objectifs: [
      'Reconnaître une équation du second degré et identifier $a$, $b$ et $c$',
      'Résoudre une équation du second degré (cas particuliers et discriminant)',
      'Factoriser un trinôme lorsque c\'est possible',
      'Étudier le signe d\'un trinôme et résoudre une inéquation du second degré',
      'Mettre en équation et résoudre un problème concret'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Équation du second degré',
        texte: 'Une équation du second degré s\'écrit $ax^2 + bx + c = 0$ avec $a \\neq 0$. Avant tout calcul, on regarde les cas simples : si $c = 0$, on factorise par $x$ ; si $b = 0$, on isole $x^2$.'
      },
      {
        type: 'theoreme',
        titre: 'Résolution à l\'aide du discriminant',
        texte: 'On calcule $\\Delta = b^2 - 4ac$.<br>• Si $\\Delta > 0$ : deux solutions $x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a}$.<br>• Si $\\Delta = 0$ : une seule solution (dite double) $x_0 = -\\dfrac{b}{2a}$.<br>• Si $\\Delta < 0$ : aucune solution réelle.'
      },
      {
        type: 'propriete',
        titre: 'Factorisation',
        texte: 'Si $\\Delta > 0$ : $ax^2 + bx + c = a(x - x_1)(x - x_2)$. Si $\\Delta = 0$ : $ax^2 + bx + c = a(x - x_0)^2$. Si $\\Delta < 0$, le trinôme ne se factorise pas.'
      },
      {
        type: 'theoreme',
        titre: 'Signe du trinôme',
        texte: 'Le trinôme $ax^2 + bx + c$ est du signe de $a$, sauf entre ses racines (quand $\\Delta > 0$), où il est du signe contraire. $$\\begin{array}{c|ccccccc} x & -\\infty & & x_1 & & x_2 & & +\\infty \\\\ \\hline ax^2 + bx + c & & \\text{signe de } a & 0 & \\text{signe de } -a & 0 & \\text{signe de } a & \\end{array}$$'
      },
      {
        type: 'remarque',
        titre: 'Résoudre un problème',
        texte: 'On choisit l\'inconnue, on écrit l\'équation, on la résout, puis on ne garde que les solutions qui ont un sens : une longueur est positive, un nombre de personnes est un entier naturel…'
      }
    ],
    methodes: [
      {
        titre: 'Résoudre une équation du second degré',
        etapes: [
          'Mettre l\'équation sous la forme $ax^2 + bx + c = 0$.',
          'Identifier $a$, $b$, $c$ et calculer $\\Delta$.',
          'Selon le signe de $\\Delta$, appliquer les formules et écrire l\'ensemble $S$ des solutions.'
        ]
      },
      {
        titre: 'Résoudre une inéquation du second degré',
        etapes: [
          'Se ramener à la comparaison de $ax^2 + bx + c$ avec $0$.',
          'Chercher les racines du trinôme.',
          'Dresser le tableau de signes et lire les solutions.'
        ]
      }
    ],
    exemple: {
      enonce: 'Résoudre dans $\\R$ : a) $x^2 - 5x + 6 = 0$ ; b) $x^2 - 5x + 6 \\leq 0$.',
      solution: [
        'a) $\\Delta = (-5)^2 - 4 \\times 1 \\times 6 = 1$ ; $x_1 = \\dfrac{5 - 1}{2} = 2$ et $x_2 = \\dfrac{5 + 1}{2} = 3$. $S = \\{2 \\,;\\, 3\\}$.',
        'b) $x^2 - 5x + 6 = (x - 2)(x - 3)$ et $a = 1 > 0$ : le trinôme est négatif entre ses racines.',
        '$S = [2 \\,;\\, 3]$.'
      ]
    },
    erreurs: [
      'Calculer $-5^2$ au lieu de $(-5)^2$ dans $\\Delta$.',
      'Oublier de tout passer dans un membre avant de calculer $\\Delta$ (par exemple pour $x^2 = 3x + 4$).',
      'Inverser la règle des signes : le trinôme a le signe de $a$ à l\'extérieur des racines.',
      'Garder une solution négative pour une longueur ou un nombre de personnes.'
    ],
    flashcards: [
      { q: 'Formule du discriminant', r: '$\\Delta = b^2 - 4ac$' },
      { q: 'Que se passe-t-il si $\\Delta < 0$ ?', r: 'Pas de solution réelle ; le trinôme a toujours le signe de $a$.' },
      { q: 'Solution quand $\\Delta = 0$', r: '$x_0 = -\\dfrac{b}{2a}$' },
      { q: 'Forme factorisée quand $\\Delta > 0$', r: '$a(x - x_1)(x - x_2)$' },
      { q: 'Résoudre $x^2 = 49$', r: '$x = 7$ ou $x = -7$.' }
    ],
    contexte: {
      titre: 'Location d\'un car pour le Magal de Touba',
      enonce: 'Un groupe de pèlerins de Kaolack loue un car pour le Magal de Touba au prix de $240\\,000$ F CFA, partagé équitablement. Quatre personnes de plus se joignent au groupe, et chacun paie alors $2\\,000$ F CFA de moins. Combien de personnes comptait le groupe au départ ?',
      solution: [
        'Soit $x$ le nombre de personnes au départ. Part prévue : $\\dfrac{240\\,000}{x}$ ; part réelle : $\\dfrac{240\\,000}{x + 4}$.',
        '$\\dfrac{240\\,000}{x} - \\dfrac{240\\,000}{x + 4} = 2\\,000$. En multipliant par $x(x + 4)$ : $240\\,000 \\times 4 = 2\\,000x(x + 4)$.',
        'En divisant par $2\\,000$ : $480 = x^2 + 4x$, soit $x^2 + 4x - 480 = 0$.',
        '$\\Delta = 16 + 1\\,920 = 1\\,936 = 44^2$, donc $x = \\dfrac{-4 + 44}{2} = 20$ (l\'autre solution, $-24$, est rejetée).',
        'Le groupe comptait $20$ personnes : chacun devait payer $12\\,000$ F CFA et a finalement payé $10\\,000$ F CFA.'
      ]
    },
    histoire: 'Des tablettes d\'argile babyloniennes vieilles de près de 4 000 ans contiennent déjà des problèmes qui se ramènent à des équations du second degré.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['1l-fonctions'] = {
    resume: 'Le nombre dérivé mesure la pente de la tangente à une courbe. La fonction dérivée permet d\'étudier le sens de variation d\'une fonction et de trouver ses extremums, par exemple pour maximiser un bénéfice.',
    objectifs: [
      'Déterminer l\'ensemble de définition d\'une fonction polynôme ou rationnelle simple',
      'Calculer la dérivée d\'une fonction polynôme',
      'Interpréter le nombre dérivé comme coefficient directeur de la tangente et écrire son équation',
      'Étudier le signe de la dérivée et en déduire le sens de variation',
      'Dresser un tableau de variation et déterminer les extremums'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Nombre dérivé et tangente',
        texte: 'Si le taux d\'accroissement $\\dfrac{f(a + h) - f(a)}{h}$ tend vers un réel $\\ell$ quand $h$ tend vers $0$, on dit que $f$ est dérivable en $a$ et on note $f\'(a) = \\ell$ le nombre dérivé. C\'est le coefficient directeur de la tangente à la courbe au point d\'abscisse $a$, qui a pour équation $$y = f\'(a)(x - a) + f(a).$$'
      },
      {
        type: 'formule',
        titre: 'Dérivées usuelles',
        texte: '$$\\begin{array}{c|c} f(x) & f\'(x) \\\\ \\hline k \\ \\text{(constante)} & 0 \\\\ x & 1 \\\\ x^2 & 2x \\\\ x^3 & 3x^2 \\\\ x^n \\ (n \\geq 1) & nx^{n-1} \\\\ \\dfrac{1}{x} & -\\dfrac{1}{x^2} \\end{array}$$ Pour des fonctions dérivables $u$ et $v$ et un réel $k$ : $(u + v)\' = u\' + v\'$ et $(ku)\' = ku\'$.'
      },
      {
        type: 'theoreme',
        titre: 'Dérivée et sens de variation',
        texte: 'Soit $f$ dérivable sur un intervalle $I$. Si $f\'(x) > 0$ sur $I$ (sauf peut-être en des points isolés où elle s\'annule), $f$ est strictement croissante sur $I$ ; si $f\'(x) < 0$, $f$ est strictement décroissante ; si $f\'(x) = 0$ pour tout $x$, $f$ est constante.'
      },
      {
        type: 'propriete',
        titre: 'Extremum local',
        texte: 'Si $f\'$ s\'annule en $a$ en changeant de signe, $f$ admet un extremum local en $a$ : un maximum si $f\'$ passe de $+$ à $-$, un minimum si $f\'$ passe de $-$ à $+$.'
      },
      {
        type: 'remarque',
        titre: 'Tableau de variation',
        texte: 'On résume l\'étude dans un tableau : la ligne des valeurs de $x$, la ligne du signe de $f\'(x)$ et la ligne des variations de $f$, avec des flèches et les valeurs des extremums.'
      }
    ],
    methodes: [
      {
        titre: 'Étudier les variations d\'une fonction polynôme',
        etapes: [
          'Calculer $f\'(x)$.',
          'Étudier le signe de $f\'(x)$ (fonction affine, trinôme…).',
          'En déduire le sens de variation et dresser le tableau de variation.',
          'Calculer les valeurs des extremums.'
        ]
      },
      {
        titre: 'Écrire l\'équation d\'une tangente',
        etapes: [
          'Calculer $f(a)$ et $f\'(a)$.',
          'Remplacer dans $y = f\'(a)(x - a) + f(a)$.',
          'Développer pour obtenir la forme $y = mx + p$.'
        ]
      }
    ],
    exemple: {
      enonce: 'Soit $f(x) = x^3 - 3x + 1$. Étudier les variations de $f$.',
      solution: [
        '$f\'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$.',
        '$f\'(x)$ est un trinôme de racines $-1$ et $1$ ; comme $3 > 0$, il est positif à l\'extérieur des racines et négatif entre elles.',
        '$f$ est croissante sur $]-\\infty \\,;\\, -1]$, décroissante sur $[-1 \\,;\\, 1]$ et croissante sur $[1 \\,;\\, +\\infty[$.',
        '$f(-1) = 3$ est un maximum local et $f(1) = -1$ un minimum local. $$\\begin{array}{c|ccccccc} x & -\\infty & & -1 & & 1 & & +\\infty \\\\ \\hline f\'(x) & & + & 0 & - & 0 & + & \\\\ \\hline f(x) & & \\nearrow & 3 & \\searrow & -1 & \\nearrow & \\end{array}$$'
      ]
    },
    erreurs: [
      'Dériver $x^3$ en $3x^3$ ou en $x^2$ : la dérivée est $3x^2$.',
      'Oublier que la dérivée d\'une constante est nulle.',
      'Lire le sens de variation sur le signe de $f(x)$ au lieu de celui de $f\'(x)$.',
      'Inverser les rôles dans la tangente : c\'est $y = f\'(a)(x - a) + f(a)$.'
    ],
    flashcards: [
      { q: 'Dérivée de $x^n$', r: '$nx^{n-1}$' },
      { q: 'Équation de la tangente au point d\'abscisse $a$', r: '$y = f\'(a)(x - a) + f(a)$' },
      { q: 'Si $f\'(x) > 0$ sur $I$ ?', r: '$f$ est strictement croissante sur $I$.' },
      { q: 'Dérivée de $5x^2 - 3x + 7$', r: '$10x - 3$' },
      { q: 'Quand $f$ a-t-elle un maximum local en $a$ ?', r: 'Quand $f\'$ s\'annule en $a$ en passant de $+$ à $-$.' }
    ],
    contexte: {
      titre: 'Le bénéfice d\'un atelier de couture à Thiès',
      enonce: 'Un atelier de couture de Thiès fabrique chaque semaine $x$ tenues, avec $0 \\leq x \\leq 100$. Son bénéfice, en centaines de F CFA, est $B(x) = -x^2 + 120x - 2\\,000$. Combien de tenues faut-il fabriquer pour que le bénéfice soit maximal ? Quel est ce bénéfice ?',
      solution: [
        '$B\'(x) = -2x + 120$, qui s\'annule pour $x = 60$.',
        '$B\'(x) > 0$ pour $x < 60$ et $B\'(x) < 0$ pour $x > 60$ : $B$ est croissante sur $[0 \\,;\\, 60]$ puis décroissante sur $[60 \\,;\\, 100]$.',
        '$B(60) = -3\\,600 + 7\\,200 - 2\\,000 = 1\\,600$.',
        'Le bénéfice est maximal pour $60$ tenues : $1\\,600$ centaines de F CFA, soit $160\\,000$ F CFA par semaine.'
      ]
    },
    histoire: 'Le calcul différentiel a été inventé à la fin du XVIIe siècle, indépendamment, par Isaac Newton et Gottfried Wilhelm Leibniz ; la notation $f\'$ est due à Joseph-Louis Lagrange.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['1l-suites'] = {
    resume: 'Une suite numérique est une liste ordonnée de nombres. Les suites arithmétiques (on ajoute toujours la même quantité) et géométriques (on multiplie toujours par le même nombre) modélisent l\'épargne, l\'évolution d\'une population ou d\'un prix.',
    objectifs: [
      'Calculer les termes d\'une suite définie par une formule explicite ou par récurrence',
      'Reconnaître une suite arithmétique et une suite géométrique',
      'Utiliser le terme général d\'une suite arithmétique ou géométrique',
      'Calculer la somme de termes consécutifs',
      'Modéliser une situation concrète (épargne, évolution en pourcentage) par une suite'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Suite numérique',
        texte: 'Une suite $(u_n)$ associe à chaque entier naturel $n$ (à partir d\'un certain rang) un réel $u_n$, appelé terme d\'indice $n$. Elle peut être définie de façon explicite, par exemple $u_n = 3n + 2$, ou par récurrence, par exemple $u_0 = 5$ et $u_{n+1} = 2u_n - 1$.'
      },
      {
        type: 'definition',
        titre: 'Suite arithmétique',
        texte: '$(u_n)$ est arithmétique de raison $r$ si, pour tout $n$, $u_{n+1} = u_n + r$. Alors $u_n = u_0 + nr$ et, plus généralement, $u_n = u_p + (n - p)r$. Elle est croissante si $r > 0$ et décroissante si $r < 0$.'
      },
      {
        type: 'definition',
        titre: 'Suite géométrique',
        texte: '$(u_n)$ est géométrique de raison $q$ si, pour tout $n$, $u_{n+1} = q \\times u_n$. Alors $u_n = u_0 \\times q^n$ et $u_n = u_p \\times q^{n-p}$. Une évolution de $t\\,\\%$ par période se traduit par une suite géométrique de raison $1 + \\dfrac{t}{100}$ (ou $1 - \\dfrac{t}{100}$ pour une baisse).'
      },
      {
        type: 'formule',
        titre: 'Sommes de termes consécutifs',
        texte: 'Arithmétique : $S = (\\text{nombre de termes}) \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$ ; en particulier $1 + 2 + \\dots + n = \\dfrac{n(n + 1)}{2}$.<br>Géométrique ($q \\neq 1$) : $S = \\text{premier terme} \\times \\dfrac{1 - q^{N}}{1 - q}$, où $N$ est le nombre de termes.'
      },
      {
        type: 'remarque',
        titre: 'Reconnaître le type d\'une suite',
        texte: 'On calcule $u_{n+1} - u_n$ : s\'il est constant, la suite est arithmétique. Si les termes sont non nuls, on calcule $\\dfrac{u_{n+1}}{u_n}$ : s\'il est constant, la suite est géométrique.'
      }
    ],
    methodes: [
      {
        titre: 'Montrer qu\'une suite est arithmétique (ou géométrique)',
        etapes: [
          'Calculer $u_{n+1} - u_n$ (ou $\\dfrac{u_{n+1}}{u_n}$) en fonction de $n$.',
          'Montrer que le résultat ne dépend pas de $n$ : c\'est la raison.',
          'Préciser le premier terme et écrire le terme général.'
        ]
      },
      {
        titre: 'Calculer une somme de termes consécutifs',
        etapes: [
          'Identifier le premier et le dernier terme.',
          'Compter les termes : de $u_p$ à $u_n$, il y en a $n - p + 1$.',
          'Appliquer la formule adaptée au type de suite.'
        ]
      }
    ],
    exemple: {
      enonce: 'La suite $(u_n)$ est arithmétique, avec $u_0 = 7$ et $r = 4$. Calculer $u_{20}$ et $S = u_0 + u_1 + \\dots + u_{20}$.',
      solution: [
        '$u_{20} = u_0 + 20r = 7 + 20 \\times 4 = 87$.',
        'De $u_0$ à $u_{20}$, il y a $21$ termes : $S = 21 \\times \\dfrac{7 + 87}{2} = 21 \\times 47 = 987$.'
      ]
    },
    erreurs: [
      'Se tromper dans le nombre de termes : de $u_0$ à $u_n$, il y a $n + 1$ termes.',
      'Confondre $u_0 + nr$ (suite arithmétique) et $u_0 \\times q^n$ (suite géométrique).',
      'Pour une baisse de $15\\,\\%$, prendre $q = 0{,}15$ au lieu de $q = 0{,}85$.'
    ],
    flashcards: [
      { q: 'Terme général d\'une suite arithmétique', r: '$u_n = u_0 + nr$' },
      { q: 'Terme général d\'une suite géométrique', r: '$u_n = u_0 \\times q^n$' },
      { q: '$1 + 2 + \\dots + n$', r: '$\\dfrac{n(n + 1)}{2}$' },
      { q: 'Raison pour une hausse de $5\\,\\%$ par an', r: '$q = 1{,}05$' },
      { q: 'Somme de $N$ termes d\'une suite géométrique', r: 'premier terme $\\times \\dfrac{1 - q^{N}}{1 - q}$' },
      { q: 'Nombre de termes de $u_3$ à $u_{10}$', r: '$8$' }
    ],
    contexte: {
      titre: 'L\'épargne de Fatou pour ouvrir une boutique',
      enonce: 'Fatou, couturière à Ziguinchor, veut épargner pendant 12 mois. Plan A : elle met $10\\,000$ F CFA le premier mois, puis $1\\,000$ F CFA de plus chaque mois. Plan B : elle met $10\\,000$ F CFA le premier mois, puis $8\\,\\%$ de plus chaque mois. Quel plan lui permet d\'épargner le plus ?',
      solution: [
        'Plan A : les versements $a_n = 10\\,000 + (n - 1) \\times 1\\,000$ forment une suite arithmétique. $a_{12} = 21\\,000$ et le total vaut $12 \\times \\dfrac{10\\,000 + 21\\,000}{2} = 186\\,000$ F CFA.',
        'Plan B : les versements $b_n = 10\\,000 \\times 1{,}08^{n-1}$ forment une suite géométrique de raison $1{,}08$ ; $b_{12} = 10\\,000 \\times 1{,}08^{11} \\approx 23\\,316$ F CFA.',
        'Total du plan B : $10\\,000 \\times \\dfrac{1 - 1{,}08^{12}}{1 - 1{,}08} \\approx 189\\,771$ F CFA.',
        'Le plan B permet d\'épargner environ $3\\,771$ F CFA de plus, mais il demande des versements plus élevés en fin d\'année.'
      ]
    },
    histoire: 'Dans son « Liber abaci » (1202), Leonardo de Pise, dit Fibonacci, pose le célèbre problème des lapins, qui conduit à une suite où chaque terme est la somme des deux précédents.'
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['1l-pourcentages'] = {
    resume: 'Placer ou emprunter de l\'argent a un prix : l\'intérêt. On distingue les intérêts simples, calculés toujours sur le capital de départ, et les intérêts composés, où les intérêts s\'ajoutent au capital et rapportent à leur tour.',
    objectifs: [
      'Appliquer une hausse ou une baisse en pourcentage à l\'aide d\'un coefficient multiplicateur',
      'Calculer des évolutions successives et une évolution réciproque',
      'Calculer un intérêt simple, une valeur acquise, un taux, une durée',
      'Calculer une valeur acquise et une valeur actuelle à intérêts composés',
      'Comparer des placements ou des crédits'
    ],
    cours: [
      {
        type: 'propriete',
        titre: 'Coefficient multiplicateur',
        texte: 'Augmenter une quantité de $t\\,\\%$ revient à la multiplier par $1 + \\dfrac{t}{100}$ ; la diminuer de $t\\,\\%$ revient à la multiplier par $1 - \\dfrac{t}{100}$. Pour des évolutions successives, on multiplie les coefficients ; si le coefficient global est $c$, le taux global est $(c - 1) \\times 100$ en pourcentage. L\'évolution réciproque a pour coefficient $\\dfrac{1}{c}$.'
      },
      {
        type: 'formule',
        titre: 'Intérêts simples',
        texte: 'Un capital $C$ placé au taux annuel de $t\\,\\%$ pendant $n$ années rapporte $$I = C \\times \\dfrac{t}{100} \\times n.$$ Pour une durée de $m$ mois : $I = \\dfrac{C \\times t \\times m}{1\\,200}$ ; pour $j$ jours (année commerciale de 360 jours) : $I = \\dfrac{C \\times t \\times j}{36\\,000}$. La valeur acquise est $A = C + I$.'
      },
      {
        type: 'formule',
        titre: 'Intérêts composés',
        texte: 'À intérêts composés, les intérêts de chaque période s\'ajoutent au capital. Au taux de $t\\,\\%$ par période, après $n$ périodes : $$C_n = C_0 \\left(1 + \\dfrac{t}{100}\\right)^n.$$ La suite $(C_n)$ est géométrique de raison $1 + \\dfrac{t}{100}$. La valeur actuelle d\'une somme $C_n$ disponible dans $n$ périodes est $C_0 = \\dfrac{C_n}{\\left(1 + \\dfrac{t}{100}\\right)^n}$.'
      },
      {
        type: 'remarque',
        titre: 'Simples ou composés ?',
        texte: 'À intérêts simples, la valeur acquise augmente chaque année de la même somme (suite arithmétique) ; à intérêts composés, elle augmente du même pourcentage (suite géométrique). À taux égal, sur plusieurs années, les intérêts composés rapportent davantage.'
      },
      {
        type: 'remarque',
        titre: 'Le coût d\'un crédit',
        texte: 'Pour un prêt remboursé en une seule fois à l\'échéance, l\'intérêt payé par l\'emprunteur se calcule avec les mêmes formules : c\'est le coût du crédit. Avant d\'emprunter, on compare les taux et les durées.'
      }
    ],
    methodes: [
      {
        titre: 'Calculer une valeur acquise à intérêts composés',
        etapes: [
          'Écrire le coefficient annuel $q = 1 + \\dfrac{t}{100}$.',
          'Calculer $C_n = C_0 \\times q^n$ à la calculatrice.',
          'Arrondir au franc à la fin du calcul seulement.'
        ]
      },
      {
        titre: 'Retrouver un élément à intérêts simples',
        etapes: [
          'Écrire $I = C \\times \\dfrac{t}{100} \\times n$ (et $A = C + I$).',
          'Remplacer les valeurs connues.',
          'Isoler l\'inconnue : $t = \\dfrac{100I}{Cn}$, $n = \\dfrac{100I}{Ct}$, $C = \\dfrac{100I}{tn}$.'
        ]
      }
    ],
    exemple: {
      enonce: 'Awa place $500\\,000$ F CFA pendant 3 ans au taux annuel de $6\\,\\%$. Comparer les valeurs acquises à intérêts simples et à intérêts composés.',
      solution: [
        'Intérêts simples : $I = 500\\,000 \\times \\dfrac{6}{100} \\times 3 = 90\\,000$, donc $A = 590\\,000$ F CFA.',
        'Intérêts composés : $C_3 = 500\\,000 \\times 1{,}06^3 = 500\\,000 \\times 1{,}191\\,016 = 595\\,508$ F CFA.',
        'Les intérêts composés rapportent $5\\,508$ F CFA de plus : les intérêts des premières années produisent eux-mêmes des intérêts.'
      ]
    },
    erreurs: [
      'Additionner des pourcentages successifs : une hausse de $10\\,\\%$ suivie d\'une baisse de $10\\,\\%$ donne une baisse globale de $1\\,\\%$ ($1{,}1 \\times 0{,}9 = 0{,}99$).',
      'Oublier de convertir le taux : $6\\,\\%$ s\'écrit $0{,}06$ dans les calculs.',
      'Utiliser la formule des intérêts simples pour un placement à intérêts composés, ou l\'inverse.',
      'Pour une durée en jours, oublier de diviser par $36\\,000$ (année commerciale de 360 jours).'
    ],
    flashcards: [
      { q: 'Coefficient d\'une hausse de $t\\,\\%$', r: '$1 + \\dfrac{t}{100}$' },
      { q: 'Intérêt simple sur $n$ années', r: '$I = C \\times \\dfrac{t}{100} \\times n$' },
      { q: 'Intérêt simple sur $j$ jours', r: '$I = \\dfrac{C \\times t \\times j}{36\\,000}$' },
      { q: 'Valeur acquise à intérêts composés', r: '$C_n = C_0\\left(1 + \\dfrac{t}{100}\\right)^n$' },
      { q: 'Baisse qui compense une hausse de $25\\,\\%$', r: '$20\\,\\%$ (coefficient $\\dfrac{1}{1{,}25} = 0{,}8$).' },
      { q: 'Valeur actuelle de $C_n$', r: '$C_0 = \\dfrac{C_n}{\\left(1 + \\dfrac{t}{100}\\right)^n}$' }
    ],
    contexte: {
      titre: 'Mutuelle ou banque à Kaolack ?',
      enonce: 'Moussa, commerçant à Kaolack, dispose de $300\\,000$ F CFA pour 4 ans. Une mutuelle d\'épargne lui propose des intérêts simples au taux annuel de $7\\,\\%$ ; une banque lui propose des intérêts composés au taux annuel de $6\\,\\%$. Quel placement choisir ?',
      solution: [
        'Mutuelle : $I = 300\\,000 \\times \\dfrac{7}{100} \\times 4 = 84\\,000$ F CFA, soit une valeur acquise de $384\\,000$ F CFA.',
        'Banque : $C_4 = 300\\,000 \\times 1{,}06^4 \\approx 300\\,000 \\times 1{,}262\\,48 \\approx 378\\,743$ F CFA.',
        'Sur 4 ans, la mutuelle rapporte environ $5\\,257$ F CFA de plus : un taux plus élevé compense l\'avantage des intérêts composés sur une durée courte.',
        'Sur une durée plus longue, la conclusion peut changer (au bout de 10 ans, la banque est plus avantageuse) : on compare toujours sur la même durée.'
      ]
    }
  };

  /* ------------------------------------------------------------------ */
  EM.contenu['1l-statistiques'] = {
    resume: 'On organise et on résume une série statistique : tableaux, diagrammes, paramètres de position (mode, moyenne, médiane, quartiles) et de dispersion (étendue, variance, écart-type), pour des données isolées ou regroupées en classes.',
    objectifs: [
      'Lire et construire un tableau d\'effectifs, de fréquences et d\'effectifs cumulés',
      'Représenter une série : diagramme en bâtons, histogramme, polygone des effectifs cumulés',
      'Calculer la moyenne ; déterminer le mode, la médiane et les quartiles',
      'Calculer la variance et l\'écart-type',
      'Interpréter et comparer des séries statistiques'
    ],
    cours: [
      {
        type: 'definition',
        titre: 'Effectifs et fréquences',
        texte: 'Pour une série de $N$ données, l\'effectif $n_i$ d\'une valeur (ou d\'une classe) est le nombre de données correspondantes et sa fréquence est $f_i = \\dfrac{n_i}{N}$, souvent exprimée en pourcentage. La somme des fréquences vaut $1$.'
      },
      {
        type: 'propriete',
        titre: 'Représentations graphiques',
        texte: 'Données isolées : diagramme en bâtons, dont les hauteurs sont proportionnelles aux effectifs. Données en classes : histogramme, dont les aires des rectangles sont proportionnelles aux effectifs. Le polygone des effectifs cumulés croissants permet de lire graphiquement une valeur approchée de la médiane.'
      },
      {
        type: 'formule',
        titre: 'Paramètres de position',
        texte: 'Moyenne : $\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$ (avec les centres des classes pour des données groupées). Mode : valeur (ou classe) de plus grand effectif. Médiane : valeur qui partage la série ordonnée en deux parties de même effectif. Quartiles $Q_1$ et $Q_3$ : valeurs de rangs $\\dfrac{N}{4}$ et $\\dfrac{3N}{4}$, arrondis à l\'entier supérieur.'
      },
      {
        type: 'formule',
        titre: 'Paramètres de dispersion',
        texte: 'Étendue : $x_{\\max} - x_{\\min}$. Variance : $V = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2$. Écart-type : $\\sigma = \\sqrt{V}$. Plus l\'écart-type est grand, plus les valeurs sont dispersées autour de la moyenne.'
      },
      {
        type: 'remarque',
        titre: 'Interpréter',
        texte: 'Pour comparer deux séries, on compare un paramètre de position (moyenne ou médiane) et un paramètre de dispersion (écart-type ou écart interquartile). La médiane est moins sensible que la moyenne aux valeurs extrêmes.'
      }
    ],
    methodes: [
      {
        titre: 'Calculer une moyenne pour des données en classes',
        etapes: [
          'Calculer le centre $c_i$ de chaque classe.',
          'Calculer les produits $n_i c_i$ et leur somme.',
          'Diviser par l\'effectif total $N$.'
        ]
      },
      {
        titre: 'Déterminer la médiane d\'une série discrète',
        etapes: [
          'Ranger les valeurs et calculer les effectifs cumulés croissants.',
          'Si $N$ est impair, prendre la valeur de rang $\\dfrac{N + 1}{2}$ ; sinon, la moyenne des valeurs de rangs $\\dfrac{N}{2}$ et $\\dfrac{N}{2} + 1$.'
        ]
      }
    ],
    exemple: {
      enonce: 'Le tableau donne le nombre de frères et sœurs de 20 élèves : $$\\begin{array}{|c|c|c|c|c|c|} \\hline x_i & 0 & 1 & 2 & 3 & 4 \\\\ \\hline n_i & 2 & 5 & 6 & 4 & 3 \\\\ \\hline \\end{array}$$ Calculer la moyenne, la médiane et l\'écart-type.',
      solution: [
        '$\\bar{x} = \\dfrac{0 \\times 2 + 1 \\times 5 + 2 \\times 6 + 3 \\times 4 + 4 \\times 3}{20} = \\dfrac{41}{20} = 2{,}05$.',
        'Effectifs cumulés : $2$ ; $7$ ; $13$ ; $17$ ; $20$. Les valeurs de rangs $10$ et $11$ valent $2$, donc $Me = 2$.',
        '$\\sum n_i x_i^2 = 113$, donc $V = \\dfrac{113}{20} - 2{,}05^2 = 5{,}65 - 4{,}2025 = 1{,}4475$.',
        '$\\sigma = \\sqrt{1{,}4475} \\approx 1{,}20$.'
      ]
    },
    erreurs: [
      'Diviser par le nombre de valeurs différentes au lieu de l\'effectif total $N$.',
      'Chercher la médiane dans une liste non ordonnée.',
      'Dans un histogramme à classes d\'amplitudes inégales, rendre les hauteurs (au lieu des aires) proportionnelles aux effectifs.'
    ],
    flashcards: [
      { q: 'Fréquence d\'une valeur', r: '$f_i = \\dfrac{n_i}{N}$' },
      { q: 'Moyenne', r: '$\\bar{x} = \\dfrac{\\sum n_i x_i}{N}$' },
      { q: 'Variance', r: '$V = \\dfrac{\\sum n_i x_i^2}{N} - \\bar{x}^2$' },
      { q: 'Écart-type', r: '$\\sigma = \\sqrt{V}$' },
      { q: 'Mode d\'une série', r: 'La valeur de plus grand effectif.' }
    ],
    contexte: {
      titre: 'Salaire moyen ou salaire médian dans une entreprise de Dakar ?',
      enonce: 'Une petite entreprise de Dakar emploie 10 personnes : 8 employés gagnent $100\\,000$ F CFA par mois, la comptable $150\\,000$ F CFA et le directeur $1\\,000\\,000$ F CFA. Calculer le salaire moyen et le salaire médian. Lequel décrit le mieux la situation des employés ?',
      solution: [
        'Masse salariale : $8 \\times 100\\,000 + 150\\,000 + 1\\,000\\,000 = 1\\,950\\,000$ F CFA.',
        'Salaire moyen : $\\dfrac{1\\,950\\,000}{10} = 195\\,000$ F CFA.',
        'Dans la série ordonnée, les 5e et 6e salaires valent $100\\,000$ F CFA : la médiane est $100\\,000$ F CFA.',
        'La moyenne est tirée vers le haut par le salaire du directeur : 9 personnes sur 10 gagnent moins que la moyenne. La médiane décrit mieux la situation des employés.'
      ]
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);
