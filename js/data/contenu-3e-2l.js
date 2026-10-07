/*
 * ELITE MATHÉMATIQUE — contenu pédagogique des chapitres de 3e (BFEM) et de 2nde L.
 * Format : voir docs/CONTRIBUER.md. Les nombres des problèmes « au Sénégal » sont fictifs mais plausibles.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  EM.contenu = EM.contenu || {};

  /* ================================================================== */
  /* 3e — RACINE CARRÉE                                                  */
  /* ================================================================== */
  EM.contenu['3e-racines'] = {
    resume: "La racine carrée d'un nombre positif $a$ est le nombre positif dont le carré vaut $a$. On apprend à simplifier, à calculer avec les radicaux, à rendre rationnel un dénominateur et à comparer des nombres écrits avec des racines carrées.",
    objectifs: [
      "Connaître la définition de la racine carrée d'un nombre positif et savoir que $\\sqrt{a^2} = |a|$",
      "Utiliser les propriétés $\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b}$ et $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$",
      "Écrire $\\sqrt{n}$ sous la forme $a\\sqrt{b}$ et réduire une somme de radicaux",
      "Rendre rationnel le dénominateur d'une fraction à l'aide de l'expression conjuguée",
      "Comparer des nombres écrits avec des radicaux et en donner un encadrement ou une valeur approchée"
    ],
    cours: [
      { type: 'definition', titre: 'Racine carrée', texte: "Soit $a$ un nombre réel positif. La racine carrée de $a$, notée $\\sqrt{a}$, est le nombre <b>positif</b> dont le carré est égal à $a$ : $$\\sqrt{a} \\geq 0 \\quad \\text{et} \\quad \\left(\\sqrt{a}\\right)^2 = a.$$ Exemples : $\\sqrt{49} = 7$ ; $\\sqrt{0{,}25} = 0{,}5$ ; $\\sqrt{0} = 0$. Un nombre strictement négatif n'a pas de racine carrée." },
      { type: 'propriete', titre: "Racine carrée d'un carré", texte: "Pour tout réel $a$ : $\\sqrt{a^2} = |a|$, c'est-à-dire $\\sqrt{a^2} = a$ si $a \\geq 0$ et $\\sqrt{a^2} = -a$ si $a < 0$. Exemple : $\\sqrt{(-5)^2} = \\sqrt{25} = 5$." },
      { type: 'propriete', titre: 'Produit et quotient', texte: "Pour $a \\geq 0$ et $b \\geq 0$ : $\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$. Pour $a \\geq 0$ et $b > 0$ : $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$.<br><b>Attention</b> : en général $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$ ; par exemple $\\sqrt{9 + 16} = \\sqrt{25} = 5$ alors que $\\sqrt{9} + \\sqrt{16} = 7$." },
      { type: 'formule', titre: 'Simplification et expression conjuguée', texte: "Pour simplifier $\\sqrt{n}$, on fait apparaître le plus grand carré parfait qui divise $n$ : $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$.<br>Les expressions $\\sqrt{a} + b$ et $\\sqrt{a} - b$ sont dites <b>conjuguées</b> : $\\left(\\sqrt{a} + b\\right)\\left(\\sqrt{a} - b\\right) = a - b^2$. On s'en sert pour rendre rationnel un dénominateur : $$\\dfrac{1}{\\sqrt{a}} = \\dfrac{\\sqrt{a}}{a} \\qquad \\dfrac{1}{\\sqrt{a} - b} = \\dfrac{\\sqrt{a} + b}{a - b^2}.$$" },
      { type: 'propriete', titre: 'Comparaison', texte: "Deux nombres positifs sont rangés dans le même ordre que leurs carrés : pour $a \\geq 0$ et $b \\geq 0$, $a < b \\iff a^2 < b^2$. De même, $0 \\leq a < b \\iff \\sqrt{a} < \\sqrt{b}$.<br>Exemple : $\\left(3\\sqrt{5}\\right)^2 = 45$ et $\\left(2\\sqrt{11}\\right)^2 = 44$, donc $2\\sqrt{11} < 3\\sqrt{5}$." },
      { type: 'remarque', titre: 'Encadrements', texte: "Un encadrement se conserve quand on ajoute un même nombre ou qu'on multiplie par un même nombre positif. De $1{,}414 < \\sqrt{2} < 1{,}415$, on déduit $4{,}242 < 3\\sqrt{2} < 4{,}245$ puis $5{,}242 < 1 + 3\\sqrt{2} < 5{,}245$." }
    ],
    methodes: [
      { titre: 'Écrire une somme de radicaux sous la forme $a\\sqrt{b}$', etapes: [
        "Décomposer chaque radicande en produit d'un carré parfait et d'un entier sans facteur carré : $\\sqrt{50} = \\sqrt{25 \\times 2}$.",
        "Sortir le carré de la racine : $\\sqrt{25 \\times 2} = 5\\sqrt{2}$.",
        "Multiplier par le coefficient placé devant le radical.",
        "Additionner les coefficients des termes en $\\sqrt{b}$ : $3\\sqrt{2} - 5\\sqrt{2} = -2\\sqrt{2}$."
      ] },
      { titre: 'Rendre rationnel un dénominateur', etapes: [
        "Si le dénominateur est $k\\sqrt{a}$, multiplier le numérateur et le dénominateur par $\\sqrt{a}$.",
        "Si le dénominateur est $\\sqrt{a} + b$ (ou $\\sqrt{a} - b$), multiplier le numérateur et le dénominateur par l'expression conjuguée $\\sqrt{a} - b$ (ou $\\sqrt{a} + b$).",
        "Développer le dénominateur avec $(x + y)(x - y) = x^2 - y^2$ : il n'y a plus de radical.",
        "Simplifier la fraction obtenue si c'est possible."
      ] },
      { titre: 'Écrire $\\left|a - \\sqrt{b}\\right|$ sans valeur absolue', etapes: [
        "Comparer $a$ et $\\sqrt{b}$ en comparant leurs carrés $a^2$ et $b$ (avec $a > 0$).",
        "En déduire le signe de $a - \\sqrt{b}$.",
        "Si $a - \\sqrt{b} \\geq 0$, alors $\\left|a - \\sqrt{b}\\right| = a - \\sqrt{b}$ ; sinon $\\left|a - \\sqrt{b}\\right| = \\sqrt{b} - a$."
      ] }
    ],
    exemple: {
      enonce: "On donne $A = 2\\sqrt{75} - 3\\sqrt{12} + \\sqrt{27}$ et $B = \\dfrac{6}{\\sqrt{3}}$.<br>1) Écrire $A$ sous la forme $a\\sqrt{3}$.<br>2) Écrire $B$ sans radical au dénominateur.<br>3) Justifier que $A \\times B$ est un nombre entier.",
      solution: [
        "1) $\\sqrt{75} = \\sqrt{25 \\times 3} = 5\\sqrt{3}$ ; $\\sqrt{12} = \\sqrt{4 \\times 3} = 2\\sqrt{3}$ ; $\\sqrt{27} = \\sqrt{9 \\times 3} = 3\\sqrt{3}$.",
        "$A = 2 \\times 5\\sqrt{3} - 3 \\times 2\\sqrt{3} + 3\\sqrt{3} = 10\\sqrt{3} - 6\\sqrt{3} + 3\\sqrt{3} = 7\\sqrt{3}$.",
        "2) $B = \\dfrac{6 \\times \\sqrt{3}}{\\sqrt{3} \\times \\sqrt{3}} = \\dfrac{6\\sqrt{3}}{3} = 2\\sqrt{3}$.",
        "3) $A \\times B = 7\\sqrt{3} \\times 2\\sqrt{3} = 14 \\times 3 = 42$ : c'est un nombre entier."
      ]
    },
    erreurs: [
      "Écrire $\\sqrt{9 + 16} = \\sqrt{9} + \\sqrt{16}$ : c'est faux, car $\\sqrt{25} = 5$ et non $7$. La racine carrée ne se « distribue » pas sur une somme.",
      "Oublier que $\\sqrt{a}$ est toujours positif : $\\sqrt{(-3)^2} = 3$ et non $-3$.",
      "S'arrêter trop tôt : $\\sqrt{72} = 2\\sqrt{18}$ n'est pas simplifié au maximum ; il faut aller jusqu'à $6\\sqrt{2}$.",
      "Multiplier seulement le dénominateur par l'expression conjuguée : il faut multiplier le numérateur <b>et</b> le dénominateur."
    ],
    flashcards: [
      { q: "$\\sqrt{a}$ existe pour…", r: "$a \\geq 0$ ; et alors $\\sqrt{a} \\geq 0$" },
      { q: "$\\sqrt{a^2} = ?$", r: "$|a|$" },
      { q: "$\\sqrt{ab} = ?$ (pour $a, b \\geq 0$)", r: "$\\sqrt{a} \\times \\sqrt{b}$" },
      { q: "Simplifier $\\sqrt{48}$", r: "$\\sqrt{16 \\times 3} = 4\\sqrt{3}$" },
      { q: "Expression conjuguée de $\\sqrt{5} - 2$", r: "$\\sqrt{5} + 2$ ; leur produit vaut $5 - 4 = 1$" },
      { q: "$\\dfrac{1}{\\sqrt{2}} = ?$", r: "$\\dfrac{\\sqrt{2}}{2}$" },
      { q: "Comparer $3\\sqrt{2}$ et $2\\sqrt{3}$", r: "$18 > 12$, donc $3\\sqrt{2} > 2\\sqrt{3}$" }
    ],
    contexte: {
      titre: 'Un champ carré près de Kaolack',
      enonce: "Moussa possède un champ d'arachide carré de $1\\,800$ m² près de Kaolack. Il veut l'entourer d'une clôture en fil de fer qui coûte $500$ F CFA le mètre.<br>1) Donner la valeur exacte du côté du champ sous la forme $a\\sqrt{b}$.<br>2) Calculer la valeur exacte du périmètre, puis une valeur approchée au dixième de mètre.<br>3) Moussa achète le fil au mètre entier. Combien va-t-il dépenser ?",
      solution: [
        "1) Le côté $c$ vérifie $c^2 = 1\\,800$, donc $c = \\sqrt{1\\,800} = \\sqrt{900 \\times 2} = 30\\sqrt{2}$ m.",
        "2) Périmètre : $P = 4 \\times 30\\sqrt{2} = 120\\sqrt{2}$ m. Avec $\\sqrt{2} \\approx 1{,}4142$ : $P \\approx 169{,}7$ m.",
        "3) Il lui faut $170$ m de fil, soit $170 \\times 500 = 85\\,000$ F CFA."
      ]
    },
    histoire: "Le symbole $\\sqrt{\\ }$ apparaît pour la première fois dans un livre imprimé en 1525 : <i>Die Coss</i>, de l'Allemand Christoph Rudolff. Il viendrait d'une déformation de la lettre « r », initiale du latin <i>radix</i> (racine)."
  };

  /* ================================================================== */
  /* 3e — CALCUL ALGÉBRIQUE                                              */
  /* ================================================================== */
  EM.contenu['3e-calcul-algebrique'] = {
    resume: "Le calcul algébrique permet de transformer une expression : la développer (l'écrire comme une somme) ou la factoriser (l'écrire comme un produit). Les identités remarquables et les fractions rationnelles sont au cœur des épreuves du BFEM.",
    objectifs: [
      "Développer et réduire une expression à l'aide de la distributivité et des identités remarquables",
      "Factoriser une expression par un facteur commun ou à l'aide d'une identité remarquable",
      "Choisir la forme (développée ou factorisée) la plus adaptée à un calcul",
      "Déterminer la condition d'existence d'une fraction rationnelle et la simplifier",
      "Calculer la valeur numérique d'une expression, y compris pour une valeur avec radical"
    ],
    cours: [
      { type: 'propriete', titre: 'Distributivité', texte: "$k(a + b) = ka + kb$ et $(a + b)(c + d) = ac + ad + bc + bd$.<br><b>Développer</b>, c'est transformer un produit en somme ; <b>factoriser</b>, c'est transformer une somme en produit." },
      { type: 'formule', titre: 'Identités remarquables', texte: "Pour tous réels $a$ et $b$ : $$(a + b)^2 = a^2 + 2ab + b^2$$ $$(a - b)^2 = a^2 - 2ab + b^2$$ $$(a + b)(a - b) = a^2 - b^2$$ Lues de droite à gauche, elles servent à factoriser." },
      { type: 'propriete', titre: 'Factoriser', texte: "<b>Facteur commun</b> : $ka + kb = k(a + b)$. Exemple : $(x + 1)(2x - 3) + (x + 1)(x + 5) = (x + 1)\\left[(2x - 3) + (x + 5)\\right] = (x + 1)(3x + 2)$.<br><b>Identité remarquable</b> : $9x^2 - 25 = (3x)^2 - 5^2 = (3x - 5)(3x + 5)$ et $x^2 - 6x + 9 = (x - 3)^2$." },
      { type: 'definition', titre: 'Fraction rationnelle', texte: "Une fraction rationnelle est un quotient $\\dfrac{P(x)}{Q(x)}$ de deux polynômes. Elle existe si et seulement si $Q(x) \\neq 0$ : les valeurs de $x$ qui annulent le dénominateur sont les <b>valeurs interdites</b>. Pour la simplifier, on factorise le numérateur et le dénominateur, puis on simplifie par le facteur commun (pour les valeurs de $x$ où elle existe)." },
      { type: 'remarque', titre: 'Contrôler un calcul', texte: "Pour vérifier un développement ou une factorisation, on remplace $x$ par une valeur simple (par exemple $x = 1$ ou $x = 2$) dans les deux écritures : elles doivent donner le même résultat." }
    ],
    methodes: [
      { titre: 'Développer et réduire', etapes: [
        "Repérer les identités remarquables et les produits à développer.",
        "Développer chaque partie séparément, en gardant des parenthèses.",
        "Si une parenthèse est précédée du signe « $-$ », la supprimer en changeant tous les signes à l'intérieur.",
        "Regrouper les termes de même degré et ordonner : $ax^2 + bx + c$."
      ] },
      { titre: 'Factoriser (attendus du BFEM)', etapes: [
        "Chercher d'abord un facteur commun, éventuellement « caché » : $x^2 - 9 = (x - 3)(x + 3)$ fait apparaître le facteur $(x - 3)$.",
        "Sinon, reconnaître $A^2 - B^2$, $A^2 + 2AB + B^2$ ou $A^2 - 2AB + B^2$ en identifiant $A$ et $B$.",
        "Écrire la mise en facteur avec des crochets, puis réduire chaque facteur.",
        "Vérifier en redéveloppant ou avec une valeur numérique."
      ] },
      { titre: 'Étudier une fraction rationnelle', etapes: [
        "Factoriser le dénominateur (et le numérateur).",
        "Résoudre « dénominateur $= 0$ » : les solutions sont les valeurs interdites.",
        "Écrire la condition d'existence : $x \\neq \\ldots$ et $x \\neq \\ldots$",
        "Simplifier par le facteur commun en rappelant la condition d'existence."
      ] }
    ],
    exemple: {
      enonce: "On donne $E = (2x - 3)^2 - (x + 2)^2$ et $F = 9x^2 - 1$.<br>1) Développer et réduire $E$.<br>2) Factoriser $E$ et $F$.<br>3) On pose $q(x) = \\dfrac{E}{F}$. Déterminer la condition d'existence de $q(x)$, puis simplifier $q(x)$.",
      solution: [
        "1) $E = (4x^2 - 12x + 9) - (x^2 + 4x + 4) = 4x^2 - 12x + 9 - x^2 - 4x - 4 = 3x^2 - 16x + 5$.",
        "2) $E = \\left[(2x - 3) - (x + 2)\\right]\\left[(2x - 3) + (x + 2)\\right] = (x - 5)(3x - 1)$ et $F = (3x)^2 - 1^2 = (3x - 1)(3x + 1)$.",
        "3) $q(x) = \\dfrac{(x - 5)(3x - 1)}{(3x - 1)(3x + 1)}$ existe si et seulement si $(3x - 1)(3x + 1) \\neq 0$, soit $x \\neq \\dfrac{1}{3}$ et $x \\neq -\\dfrac{1}{3}$.",
        "Pour ces valeurs, on simplifie par $(3x - 1)$ : $q(x) = \\dfrac{x - 5}{3x + 1}$."
      ]
    },
    erreurs: [
      "Oublier le double produit : $(x + 3)^2 \\neq x^2 + 9$ ; en réalité $(x + 3)^2 = x^2 + 6x + 9$.",
      "Oublier de changer les signes après un « $-$ » : $-(x^2 + 4x + 4) = -x^2 - 4x - 4$.",
      "Confondre $(2x)^2 = 4x^2$ et $2x^2$.",
      "Simplifier une fraction rationnelle sans donner les valeurs interdites, ou « simplifier » des termes d'une somme : $\\dfrac{x + 3}{x}$ ne se simplifie pas."
    ],
    flashcards: [
      { q: "$(a + b)^2$", r: "$a^2 + 2ab + b^2$" },
      { q: "$(a - b)^2$", r: "$a^2 - 2ab + b^2$" },
      { q: "$(a + b)(a - b)$", r: "$a^2 - b^2$" },
      { q: "Factoriser $x^2 - 49$", r: "$(x - 7)(x + 7)$" },
      { q: "Factoriser $4x^2 + 12x + 9$", r: "$(2x + 3)^2$" },
      { q: "Valeur interdite de $\\dfrac{x + 1}{2x - 6}$", r: "$x = 3$" },
      { q: "Développer ? Factoriser ?", r: "Développer : produit → somme. Factoriser : somme → produit." }
    ],
    contexte: {
      titre: 'Agrandir un poulailler à Thiès',
      enonce: "Fatou a un poulailler carré de côté $x$ mètres, à Thiès. Elle veut l'agrandir en ajoutant $2$ m à chaque côté.<br>1) Exprimer l'aire du nouveau poulailler, puis l'augmentation d'aire $A(x)$.<br>2) Développer et réduire $A(x)$.<br>3) Calculer l'augmentation d'aire pour $x = 5$ m. Le sol cimenté coûte $1\\,500$ F CFA le m² : combien coûte l'agrandissement du sol ?",
      solution: [
        "1) Nouvelle aire : $(x + 2)^2$. Augmentation : $A(x) = (x + 2)^2 - x^2$.",
        "2) $A(x) = x^2 + 4x + 4 - x^2 = 4x + 4$ (on peut aussi factoriser : $A(x) = (x + 2 - x)(x + 2 + x) = 2(2x + 2) = 4x + 4$).",
        "3) $A(5) = 4 \\times 5 + 4 = 24$ m². Coût : $24 \\times 1\\,500 = 36\\,000$ F CFA."
      ]
    },
    histoire: "Le mot « algèbre » vient de l'arabe <i>al-jabr</i>, tiré du titre d'un traité écrit à Bagdad au IXe siècle par le savant Al-Khwârizmî. Son nom a aussi donné le mot « algorithme »."
  };

  /* ================================================================== */
  /* 3e — ÉQUATIONS ET INÉQUATIONS                                       */
  /* ================================================================== */
  EM.contenu['3e-equations'] = {
    resume: "Résoudre une équation ou une inéquation, c'est trouver toutes les valeurs de l'inconnue qui la vérifient. En 3e, on résout les équations du premier degré, les équations produits, les équations quotients et les inéquations du premier degré, dont on écrit les solutions sous forme d'intervalle.",
    objectifs: [
      "Résoudre une équation du premier degré à une inconnue",
      "Résoudre une équation produit, après factorisation si nécessaire",
      "Résoudre une équation quotient en tenant compte de la condition d'existence",
      "Résoudre une inéquation du premier degré et écrire l'ensemble des solutions sous forme d'intervalle",
      "Mettre un problème en équation ou en inéquation"
    ],
    cours: [
      { type: 'propriete', titre: 'Équation du premier degré', texte: "On ne change pas les solutions d'une équation en ajoutant (ou retranchant) un même nombre aux deux membres, ni en les multipliant (ou divisant) par un même nombre <b>non nul</b>. L'équation $ax + b = 0$, avec $a \\neq 0$, a une unique solution : $x = -\\dfrac{b}{a}$." },
      { type: 'theoreme', titre: 'Équation produit', texte: "Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul : $$A \\times B = 0 \\iff A = 0 \\text{ ou } B = 0.$$ Exemple : $(2x - 1)(x + 3) = 0 \\iff x = \\dfrac{1}{2}$ ou $x = -3$, donc $S = \\left\\{ -3 \\,;\\, \\dfrac{1}{2} \\right\\}$." },
      { type: 'propriete', titre: 'Équation quotient', texte: "Un quotient est nul si et seulement si son numérateur est nul et son dénominateur non nul : $$\\dfrac{A}{B} = 0 \\iff A = 0 \\text{ et } B \\neq 0.$$ On commence toujours par la condition d'existence ($B \\neq 0$)." },
      { type: 'propriete', titre: 'Inéquations', texte: "On ne change pas le sens d'une inégalité en ajoutant un même nombre aux deux membres ou en les multipliant par un même nombre <b>positif</b>. Si on multiplie ou divise par un nombre <b>négatif</b>, on <b>change le sens</b> de l'inégalité : $-2x < 6 \\iff x > -3$." },
      { type: 'definition', titre: 'Intervalles', texte: "L'ensemble des réels $x$ tels que $x \\leq 3$ s'écrit $\\left]-\\infty \\,;\\, 3\\right]$ ; tels que $x > -1$ : $\\left]-1 \\,;\\, +\\infty\\right[$ ; tels que $-2 \\leq x < 5$ : $\\left[-2 \\,;\\, 5\\right[$. Le crochet est tourné vers l'extérieur quand la borne est exclue ; il est toujours ouvert du côté de l'infini." }
    ],
    methodes: [
      { titre: 'Résoudre une équation produit', etapes: [
        "Ramener tous les termes dans le premier membre : $\\ldots = 0$.",
        "Factoriser (facteur commun ou identité remarquable).",
        "Appliquer la règle du produit nul et résoudre chaque équation du premier degré.",
        "Conclure : $S = \\{\\ldots\\}$."
      ] },
      { titre: 'Résoudre une équation quotient', etapes: [
        "Écrire la condition d'existence (dénominateur $\\neq 0$) et trouver la valeur interdite.",
        "Se ramener à « numérateur $= 0$ » (ou faire un produit en croix si le second membre n'est pas nul).",
        "Résoudre, puis <b>rejeter</b> toute solution égale à une valeur interdite."
      ] },
      { titre: 'Résoudre une inéquation', etapes: [
        "Développer et réduire chaque membre ; supprimer les dénominateurs en multipliant par un nombre positif.",
        "Regrouper les termes en $x$ d'un côté et les nombres de l'autre.",
        "Diviser par le coefficient de $x$ en changeant le sens de l'inégalité s'il est négatif.",
        "Écrire l'ensemble des solutions sous forme d'intervalle et, si on le demande, le représenter sur une droite graduée."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\R$ :<br>1) $(3x - 2)^2 - 16 = 0$ ;<br>2) $\\dfrac{x + 4}{2x - 1} = 0$ ;<br>3) $\\dfrac{x - 1}{2} - \\dfrac{2x + 1}{3} \\leq 1$.",
      solution: [
        "1) $(3x - 2)^2 - 4^2 = 0 \\iff (3x - 2 - 4)(3x - 2 + 4) = 0 \\iff (3x - 6)(3x + 2) = 0$. Donc $x = 2$ ou $x = -\\dfrac{2}{3}$ : $S = \\left\\{ -\\dfrac{2}{3} \\,;\\, 2 \\right\\}$.",
        "2) Condition : $2x - 1 \\neq 0$, soit $x \\neq \\dfrac{1}{2}$. Le quotient est nul si $x + 4 = 0$, soit $x = -4$ ; cette valeur est acceptée : $S = \\{-4\\}$.",
        "3) On multiplie par $6$ (positif) : $3(x - 1) - 2(2x + 1) \\leq 6 \\iff 3x - 3 - 4x - 2 \\leq 6 \\iff -x \\leq 11 \\iff x \\geq -11$. Donc $S = \\left[-11 \\,;\\, +\\infty\\right[$."
      ]
    },
    erreurs: [
      "Diviser par un nombre négatif sans changer le sens de l'inégalité.",
      "Dans une équation quotient, oublier la condition d'existence et garder une valeur interdite comme solution.",
      "Développer une équation produit au lieu d'appliquer la règle du produit nul : on obtient une équation du second degré qu'on ne sait pas résoudre directement en 3e.",
      "Se tromper de crochet : pour $x < 3$, la borne $3$ est exclue, on écrit $\\left]-\\infty \\,;\\, 3\\right[$."
    ],
    flashcards: [
      { q: "$A \\times B = 0 \\iff ?$", r: "$A = 0$ ou $B = 0$" },
      { q: "$\\dfrac{A}{B} = 0 \\iff ?$", r: "$A = 0$ et $B \\neq 0$" },
      { q: "Solution de $ax + b = 0$ ($a \\neq 0$)", r: "$x = -\\dfrac{b}{a}$" },
      { q: "Diviser une inégalité par un nombre négatif…", r: "… change son sens" },
      { q: "Réels $x$ tels que $x \\geq 2$", r: "$\\left[2 \\,;\\, +\\infty\\right[$" },
      { q: "Résoudre $x^2 = 9$", r: "$x = -3$ ou $x = 3$" }
    ],
    contexte: {
      titre: 'La sortie de classe à Saint-Louis',
      enonce: "La classe de 3e d'un CEM de Louga organise une sortie à Saint-Louis. La location du car coûte $90\\,000$ F CFA et le repas et la visite coûtent $2\\,500$ F CFA par élève. Le foyer de l'école donne $30\\,000$ F CFA et chaque élève verse $4\\,500$ F CFA.<br>Combien d'élèves doivent participer, au minimum, pour que l'argent réuni couvre toutes les dépenses ?",
      solution: [
        "Soit $x$ le nombre d'élèves. Dépenses : $90\\,000 + 2\\,500x$. Argent réuni : $4\\,500x + 30\\,000$.",
        "On veut $4\\,500x + 30\\,000 \\geq 90\\,000 + 2\\,500x \\iff 2\\,000x \\geq 60\\,000 \\iff x \\geq 30$.",
        "Il faut au moins $30$ élèves."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — SYSTÈMES                                                       */
  /* ================================================================== */
  EM.contenu['3e-systemes'] = {
    resume: "Un système de deux équations du premier degré à deux inconnues se résout par substitution, par combinaison ou graphiquement ; il permet de résoudre de nombreux problèmes concrets. Un système d'inéquations se résout graphiquement : ses solutions forment une région du plan.",
    objectifs: [
      "Vérifier si un couple est solution d'une équation ou d'un système",
      "Résoudre un système de deux équations à deux inconnues par substitution et par combinaison",
      "Interpréter graphiquement un système (intersection de deux droites)",
      "Mettre en équations un problème concret et le résoudre",
      "Résoudre graphiquement un système d'inéquations du premier degré à deux inconnues"
    ],
    cours: [
      { type: 'definition', titre: 'Équation à deux inconnues', texte: "Une équation de la forme $ax + by = c$ (avec $a$ et $b$ non tous deux nuls) est une équation du premier degré à deux inconnues. Le couple $(x_0 \\,;\\, y_0)$ en est une solution si $ax_0 + by_0 = c$. Dans un repère, l'ensemble des solutions est une droite." },
      { type: 'definition', titre: 'Système de deux équations', texte: "Résoudre le système $\\begin{cases} ax + by = c \\\\ a'x + b'y = c' \\end{cases}$, c'est trouver tous les couples qui vérifient les deux équations <b>à la fois</b>. Si $ab' - a'b \\neq 0$, le système a un unique couple solution : les coordonnées du point d'intersection des deux droites." },
      { type: 'propriete', titre: 'Méthode par substitution', texte: "On exprime une inconnue en fonction de l'autre dans l'une des équations (de préférence celle où un coefficient vaut $1$ ou $-1$), puis on remplace dans l'autre équation : on obtient une équation à une seule inconnue." },
      { type: 'propriete', titre: 'Méthode par combinaison', texte: "On multiplie les équations par des nombres bien choisis pour que les coefficients d'une même inconnue deviennent opposés (ou égaux), puis on additionne (ou on soustrait) membre à membre pour éliminer cette inconnue." },
      { type: 'propriete', titre: "Système d'inéquations", texte: "La droite $(D) : ax + by = c$ partage le plan en deux demi-plans : dans l'un, $ax + by < c$ ; dans l'autre, $ax + by > c$. Pour savoir lequel convient, on teste un point qui n'est pas sur $(D)$, souvent l'origine $O$. Les solutions d'un système d'inéquations forment l'intersection des demi-plans obtenus." },
      { type: 'remarque', titre: 'Vérifier', texte: "On vérifie toujours le couple trouvé dans les <b>deux</b> équations de départ." }
    ],
    methodes: [
      { titre: 'Résoudre un problème avec un système', etapes: [
        "Choisir les inconnues et préciser leur signification (et leur unité).",
        "Traduire chaque information de l'énoncé par une équation.",
        "Résoudre le système (substitution ou combinaison).",
        "Vérifier que la solution convient (nombres entiers positifs si l'on compte des objets…) et répondre par une phrase."
      ] },
      { titre: "Résoudre graphiquement un système d'inéquations", etapes: [
        "Tracer chaque droite frontière $ax + by = c$ (deux points suffisent).",
        "Pour chaque inéquation, tester un point, par exemple $O(0 \\,;\\, 0)$, pour trouver le bon demi-plan.",
        "Hachurer la partie du plan qui <b>ne convient pas</b> : la région restée blanche est l'ensemble des solutions.",
        "Préciser si la frontière est incluse ($\\leq$, $\\geq$) ou exclue ($<$, $>$)."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\R \\times \\R$ le système $\\begin{cases} 3x + 2y = 7 \\\\ 5x - 4y = 19 \\end{cases}$",
      solution: [
        "On multiplie la première équation par $2$ : $6x + 4y = 14$.",
        "On additionne membre à membre avec la seconde équation : $11x = 33$, donc $x = 3$.",
        "On remplace dans la première équation : $9 + 2y = 7$, donc $y = -1$.",
        "Vérification : $5 \\times 3 - 4 \\times (-1) = 19$. Donc $S = \\{(3 \\,;\\, -1)\\}$."
      ]
    },
    erreurs: [
      "Oublier de multiplier <b>tous</b> les termes d'une équation, y compris le second membre, lors d'une combinaison.",
      "Additionner au lieu de soustraire (ou l'inverse) : on additionne si les coefficients sont opposés, on soustrait s'ils sont égaux.",
      "Ne donner que $x$ : la solution d'un système est un <b>couple</b> $(x \\,;\\, y)$.",
      "Ne pas vérifier la solution dans la deuxième équation."
    ],
    flashcards: [
      { q: "Solution d'un système de deux équations à deux inconnues", r: "Un couple $(x \\,;\\, y)$ qui vérifie les deux équations" },
      { q: "Interprétation graphique", r: "Coordonnées du point d'intersection des deux droites" },
      { q: "Méthode par substitution", r: "Isoler une inconnue, puis la remplacer dans l'autre équation" },
      { q: "Méthode par combinaison", r: "Rendre des coefficients opposés, puis additionner membre à membre" },
      { q: "Comment trouver le bon demi-plan ?", r: "Tester un point hors de la droite, par exemple $O$" },
      { q: "Résoudre $\\begin{cases} x + y = 10 \\\\ x - y = 2 \\end{cases}$", r: "$(6 \\,;\\, 4)$" }
    ],
    contexte: {
      titre: 'Jus de bissap et de bouye',
      enonce: "Pour la fête de l'école, Aminata vend des bouteilles de jus de bissap à $500$ F CFA et des bouteilles de jus de bouye à $750$ F CFA. Elle a vendu $86$ bouteilles et encaissé $50\\,500$ F CFA.<br>Combien de bouteilles de chaque sorte a-t-elle vendues ?",
      solution: [
        "Soit $x$ le nombre de bouteilles de bissap et $y$ celui de bouteilles de bouye : $\\begin{cases} x + y = 86 \\\\ 500x + 750y = 50\\,500 \\end{cases}$",
        "Substitution : $x = 86 - y$, donc $500(86 - y) + 750y = 50\\,500 \\iff 43\\,000 + 250y = 50\\,500 \\iff y = 30$.",
        "Puis $x = 86 - 30 = 56$. Aminata a vendu $56$ bouteilles de bissap et $30$ de bouye. Vérification : $28\\,000 + 22\\,500 = 50\\,500$ F CFA."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — APPLICATIONS AFFINES                                           */
  /* ================================================================== */
  EM.contenu['3e-applications-affines'] = {
    resume: "Une application affine associe à tout réel $x$ le réel $ax + b$. Sa représentation graphique est une droite. On apprend à la déterminer, à étudier son sens de variation et à l'utiliser pour comparer des tarifs.",
    objectifs: [
      "Reconnaître une application affine, une application linéaire, une application constante",
      "Calculer une image et un antécédent",
      "Déterminer une application affine connaissant deux nombres et leurs images",
      "Représenter graphiquement une application affine et lire graphiquement ses coefficients",
      "Connaître le sens de variation selon le signe de $a$",
      "Utiliser les applications affines (éventuellement par intervalles) pour résoudre des problèmes de tarifs"
    ],
    cours: [
      { type: 'definition', titre: 'Application affine', texte: "Soit $a$ et $b$ deux réels. L'application $f : x \\mapsto ax + b$ est une <b>application affine</b> ; $a$ est son coefficient et $b$ son ordonnée à l'origine.<br>Si $b = 0$, $f(x) = ax$ : $f$ est <b>linéaire</b> (proportionnalité). Si $a = 0$, $f(x) = b$ : $f$ est <b>constante</b>." },
      { type: 'propriete', titre: 'Calcul de $a$ et de $b$', texte: "Si $f$ est affine et $x_1 \\neq x_2$ : $$a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}.$$ Les accroissements de $f(x)$ sont proportionnels à ceux de $x$. On obtient ensuite $b = f(x_1) - ax_1$." },
      { type: 'propriete', titre: 'Représentation graphique', texte: "Dans un repère, l'application $f : x \\mapsto ax + b$ est représentée par la droite d'équation $y = ax + b$, qui passe par le point $(0 \\,;\\, b)$. Quand $x$ augmente de $1$, $y$ varie de $a$. Une application linéaire est représentée par une droite passant par l'origine." },
      { type: 'propriete', titre: 'Sens de variation', texte: "Si $a > 0$, $f$ est croissante sur $\\R$ ; si $a < 0$, $f$ est décroissante sur $\\R$ ; si $a = 0$, $f$ est constante." },
      { type: 'remarque', titre: 'Applications affines par intervalles', texte: "Une application peut être définie par des formules affines différentes selon l'intervalle où se trouve $x$ (par exemple un tarif qui change au-delà d'une certaine quantité). Sa représentation graphique est alors formée de segments ou de demi-droites mis bout à bout." }
    ],
    methodes: [
      { titre: 'Déterminer $f$ connaissant deux images', etapes: [
        "Écrire $f(x) = ax + b$.",
        "Calculer $a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$.",
        "Remplacer dans $f(x_1) = ax_1 + b$ pour trouver $b$.",
        "Vérifier avec la deuxième image."
      ] },
      { titre: 'Comparer deux tarifs', etapes: [
        "Exprimer le prix de chaque formule en fonction de $x$ (application linéaire ou affine).",
        "Résoudre $f(x) = g(x)$ : on obtient la quantité pour laquelle les prix sont égaux.",
        "Tracer les deux droites dans un même repère ; la plus basse indique le tarif le plus avantageux.",
        "Conclure selon les valeurs de $x$."
      ] }
    ],
    exemple: {
      enonce: "Soit $f$ l'application affine telle que $f(2) = 1$ et $f(-1) = 7$.<br>1) Déterminer $f(x)$.<br>2) Calculer l'antécédent de $-5$ par $f$.<br>3) Préciser le sens de variation de $f$.",
      solution: [
        "1) $a = \\dfrac{f(-1) - f(2)}{-1 - 2} = \\dfrac{7 - 1}{-3} = -2$. Puis $f(2) = -2 \\times 2 + b = 1$, donc $b = 5$ : $f(x) = -2x + 5$.",
        "2) $-2x + 5 = -5 \\iff -2x = -10 \\iff x = 5$.",
        "3) $a = -2 < 0$ : $f$ est décroissante sur $\\R$."
      ]
    },
    erreurs: [
      "Calculer $a$ avec $\\dfrac{x_2 - x_1}{f(x_2) - f(x_1)}$ : le rapport est inversé.",
      "Confondre image et antécédent : l'image de $3$ est $f(3)$ ; un antécédent de $3$ est un nombre $x$ tel que $f(x) = 3$.",
      "Croire qu'une application affine traduit une situation de proportionnalité : ce n'est vrai que si $b = 0$."
    ],
    flashcards: [
      { q: "Forme d'une application affine", r: "$f(x) = ax + b$" },
      { q: "Application linéaire", r: "Application affine avec $b = 0$ : $f(x) = ax$" },
      { q: "Calcul du coefficient $a$", r: "$a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$" },
      { q: "Représentation graphique de $x \\mapsto ax + b$", r: "La droite d'équation $y = ax + b$" },
      { q: "Si $a < 0$, $f$ est…", r: "décroissante sur $\\R$" },
      { q: "Où lit-on $b$ ?", r: "Sur l'axe des ordonnées : la droite passe par $(0 \\,;\\, b)$" }
    ],
    contexte: {
      titre: "La facture d'eau à Mbour",
      enonce: "À Mbour, une famille paie chaque bimestre une redevance fixe de $1\\,800$ F CFA plus $290$ F CFA par m³ d'eau consommé (tarif fictif).<br>1) Exprimer le montant $f(x)$ de la facture en fonction du volume $x$ consommé (en m³).<br>2) Calculer la facture pour $35$ m³.<br>3) La famille a payé $14\\,850$ F CFA. Quel volume a-t-elle consommé ?",
      solution: [
        "1) $f(x) = 290x + 1\\,800$ : $f$ est une application affine (et non linéaire, à cause de la redevance fixe).",
        "2) $f(35) = 290 \\times 35 + 1\\,800 = 10\\,150 + 1\\,800 = 11\\,950$ F CFA.",
        "3) $290x + 1\\,800 = 14\\,850 \\iff 290x = 13\\,050 \\iff x = 45$ : la famille a consommé $45$ m³."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — STATISTIQUES                                                   */
  /* ================================================================== */
  EM.contenu['3e-statistiques'] = {
    resume: "La statistique organise et résume des données. En 3e, on utilise les effectifs et fréquences cumulés, on calcule la moyenne, le mode et la médiane pour des séries simples ou regroupées en classes, et on les représente (diagramme en bâtons, histogramme, polygone des effectifs cumulés).",
    objectifs: [
      "Lire et compléter un tableau d'effectifs, de fréquences et d'effectifs cumulés croissants ou décroissants",
      "Calculer la moyenne d'une série (valeurs isolées ou classes, à l'aide des centres)",
      "Déterminer le mode ou la classe modale",
      "Déterminer la médiane ou la classe médiane d'une série",
      "Représenter une série : diagramme en bâtons, histogramme, polygone des effectifs cumulés"
    ],
    cours: [
      { type: 'definition', titre: 'Vocabulaire', texte: "La <b>population</b> est l'ensemble étudié ; chacun de ses éléments est un <b>individu</b>. Le <b>caractère</b> est ce que l'on observe (il est quantitatif s'il se mesure). L'<b>effectif</b> d'une valeur est le nombre d'individus ayant cette valeur ; sa <b>fréquence</b> est $f = \\dfrac{\\text{effectif}}{\\text{effectif total}}$, souvent exprimée en %." },
      { type: 'definition', titre: 'Effectifs cumulés', texte: "L'effectif cumulé croissant (E.C.C.) d'une valeur est la somme des effectifs des valeurs inférieures ou égales à celle-ci. Pour une classe $[a \\,;\\, b[$, l'E.C.C. donne le nombre d'individus dont la valeur est strictement inférieure à $b$. On définit de même les effectifs cumulés décroissants et les fréquences cumulées." },
      { type: 'formule', titre: 'Moyenne', texte: "Pour une série de valeurs $x_1, x_2, \\ldots, x_p$ d'effectifs $n_1, n_2, \\ldots, n_p$ et d'effectif total $N$ : $$\\bar{x} = \\dfrac{n_1x_1 + n_2x_2 + \\cdots + n_px_p}{N}.$$ Pour une série regroupée en classes, on remplace chaque classe $[a \\,;\\, b[$ par son centre $\\dfrac{a + b}{2}$." },
      { type: 'definition', titre: 'Mode et médiane', texte: "Le <b>mode</b> est la valeur de plus grand effectif (pour des classes : la <b>classe modale</b>).<br>La <b>médiane</b> partage la série rangée dans l'ordre croissant en deux groupes de même effectif : si $N$ est impair, c'est la valeur de rang $\\dfrac{N + 1}{2}$ ; si $N$ est pair, c'est la moyenne des valeurs de rangs $\\dfrac{N}{2}$ et $\\dfrac{N}{2} + 1$. Pour des classes, la <b>classe médiane</b> est la première dont l'E.C.C. atteint $\\dfrac{N}{2}$." },
      { type: 'remarque', titre: 'Représentations', texte: "Diagramme en bâtons pour un caractère discret ; histogramme (rectangles accolés dont les aires sont proportionnelles aux effectifs) pour des classes ; polygone des effectifs cumulés croissants, obtenu en reliant les points (borne supérieure de la classe ; E.C.C.). La médiane est l'abscisse du point de ce polygone d'ordonnée $\\dfrac{N}{2}$." }
    ],
    methodes: [
      { titre: 'Calculer une moyenne à partir d\'un tableau', etapes: [
        "Ajouter une ligne « $n_i \\times x_i$ » (ou « $n_i \\times$ centre » pour des classes).",
        "Calculer la somme de cette ligne et l'effectif total $N$.",
        "Diviser : $\\bar{x} = \\dfrac{\\sum n_ix_i}{N}$, puis arrondir si on le demande."
      ] },
      { titre: 'Déterminer la médiane', etapes: [
        "Ranger les valeurs dans l'ordre croissant et calculer les effectifs cumulés croissants.",
        "Calculer le rang $\\dfrac{N + 1}{2}$ si $N$ est impair (ou les rangs $\\dfrac{N}{2}$ et $\\dfrac{N}{2} + 1$ si $N$ est pair).",
        "Repérer la première valeur (ou classe) dont l'E.C.C. atteint ce rang : c'est la médiane (ou la classe médiane)."
      ] }
    ],
    exemple: {
      enonce: "Voici les notes d'un devoir dans une classe de $25$ élèves :<table class='em-tableau'><tr><th>Note</th><td>8</td><td>10</td><td>12</td><td>14</td><td>16</td></tr><tr><th>Effectif</th><td>3</td><td>7</td><td>8</td><td>5</td><td>2</td></tr></table>Calculer la moyenne, puis déterminer le mode et la médiane.",
      solution: [
        "Moyenne : $\\bar{x} = \\dfrac{8 \\times 3 + 10 \\times 7 + 12 \\times 8 + 14 \\times 5 + 16 \\times 2}{25} = \\dfrac{292}{25} = 11{,}68$.",
        "Mode : $12$ (c'est la note de plus grand effectif, $8$).",
        "E.C.C. : $3$ ; $10$ ; $18$ ; $23$ ; $25$. Comme $N = 25$ est impair, la médiane est la $13^{e}$ note. Le premier E.C.C. supérieur ou égal à $13$ est $18$, celui de la note $12$ : la médiane est $12$."
      ]
    },
    erreurs: [
      "Calculer la moyenne des valeurs sans tenir compte des effectifs.",
      "Confondre le mode (une valeur du caractère) et le plus grand effectif.",
      "Chercher la médiane sans avoir rangé les valeurs dans l'ordre croissant.",
      "Pour une série en classes, oublier d'utiliser les centres pour calculer la moyenne."
    ],
    flashcards: [
      { q: "Fréquence d'une valeur", r: "$\\dfrac{\\text{effectif}}{\\text{effectif total}}$" },
      { q: "Formule de la moyenne", r: "$\\bar{x} = \\dfrac{\\sum n_ix_i}{N}$" },
      { q: "Centre de la classe $[10 \\,;\\, 20[$", r: "$15$" },
      { q: "Mode", r: "Valeur (ou classe) de plus grand effectif" },
      { q: "Médiane d'une série de $31$ valeurs", r: "La $16^{e}$ valeur de la série rangée dans l'ordre croissant" },
      { q: "E.C.C. d'une valeur", r: "Nombre d'individus ayant une valeur inférieure ou égale" }
    ],
    contexte: {
      titre: 'La pêche à Kayar',
      enonce: "Un mareyeur de Kayar a relevé les prises (en kg) de $40$ pirogues un matin :<table class='em-tableau'><tr><th>Prise (kg)</th><td>$[0 \\,;\\, 50[$</td><td>$[50 \\,;\\, 100[$</td><td>$[100 \\,;\\, 150[$</td><td>$[150 \\,;\\, 200[$</td><td>$[200 \\,;\\, 250[$</td></tr><tr><th>Pirogues</th><td>4</td><td>10</td><td>15</td><td>8</td><td>3</td></tr></table>1) Quelle est la classe modale ?<br>2) Calculer la prise moyenne par pirogue.<br>3) Combien de pirogues ont pêché moins de $150$ kg ? Quel pourcentage cela représente-t-il ? Quelle est la classe médiane ?",
      solution: [
        "1) La classe modale est $[100 \\,;\\, 150[$ (effectif $15$).",
        "2) Centres : $25$, $75$, $125$, $175$, $225$. $\\bar{x} = \\dfrac{25 \\times 4 + 75 \\times 10 + 125 \\times 15 + 175 \\times 8 + 225 \\times 3}{40} = \\dfrac{4\\,800}{40} = 120$ kg.",
        "3) E.C.C. : $4$ ; $14$ ; $29$ ; $37$ ; $40$. Donc $29$ pirogues ont pêché moins de $150$ kg, soit $\\dfrac{29}{40} \\times 100 = 72{,}5$ %. Comme $\\dfrac{N}{2} = 20$ est atteint dans la classe $[100 \\,;\\, 150[$, c'est la classe médiane."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — THÉORÈME DE THALÈS                                             */
  /* ================================================================== */
  EM.contenu['3e-thales'] = {
    resume: "Le théorème de Thalès permet de calculer des longueurs lorsque deux droites parallèles coupent deux droites sécantes. Sa réciproque permet de démontrer que deux droites sont parallèles.",
    objectifs: [
      "Reconnaître une configuration de Thalès (triangle ou « papillon »)",
      "Écrire l'égalité des rapports et calculer une longueur",
      "Utiliser la réciproque du théorème de Thalès pour démontrer un parallélisme",
      "Démontrer que deux droites ne sont pas parallèles (contraposée)",
      "Agrandir ou réduire une figure et connaître l'effet sur les aires"
    ],
    cours: [
      { type: 'theoreme', titre: 'Théorème de Thalès', texte: "Soit deux droites sécantes en $A$. Les points $A$, $M$, $B$ sont sur l'une, les points $A$, $N$, $C$ sur l'autre. Si les droites $(MN)$ et $(BC)$ sont parallèles, alors $$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}.$$ C'est vrai dans le triangle ($M \\in [AB]$ et $N \\in [AC]$) comme dans la configuration « papillon » ($A$ entre $M$ et $B$, et entre $N$ et $C$)." },
      { type: 'theoreme', titre: 'Réciproque du théorème de Thalès', texte: "Si les points $A$, $M$, $B$ d'une part et $A$, $N$, $C$ d'autre part sont alignés <b>dans le même ordre</b>, et si $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$, alors les droites $(MN)$ et $(BC)$ sont parallèles." },
      { type: 'propriete', titre: 'Contraposée', texte: "Si $\\dfrac{AM}{AB} \\neq \\dfrac{AN}{AC}$, alors les droites $(MN)$ et $(BC)$ ne sont pas parallèles (sinon, le théorème de Thalès donnerait l'égalité de ces rapports)." },
      { type: 'remarque', titre: 'Comparer deux rapports', texte: "Pour comparer $\\dfrac{a}{b}$ et $\\dfrac{c}{d}$, on les simplifie, on les écrit en décimaux exacts, ou on compare les produits en croix $a \\times d$ et $b \\times c$. On évite les valeurs approchées, qui peuvent faire croire à une égalité." },
      { type: 'propriete', titre: 'Agrandissement et réduction', texte: "Dans la configuration de Thalès, le triangle $AMN$ est une réduction (ou un agrandissement) du triangle $ABC$ de rapport $k = \\dfrac{AM}{AB}$ : les longueurs sont multipliées par $k$ et les aires par $k^2$." }
    ],
    methodes: [
      { titre: 'Calculer une longueur avec le théorème de Thalès', etapes: [
        "Citer les hypothèses : les points alignés et les droites parallèles.",
        "Écrire l'égalité des trois rapports, avec les longueurs du « petit » triangle au numérateur.",
        "Garder les deux rapports utiles et remplacer par les valeurs connues.",
        "Calculer la longueur cherchée par produit en croix."
      ] },
      { titre: 'Démontrer que deux droites sont (ou ne sont pas) parallèles', etapes: [
        "Calculer séparément $\\dfrac{AM}{AB}$ et $\\dfrac{AN}{AC}$.",
        "Les comparer (fractions irréductibles ou produits en croix).",
        "S'ils sont égaux et si les points sont dans le même ordre : réciproque de Thalès, les droites sont parallèles.",
        "S'ils sont différents : les droites ne sont pas parallèles."
      ] }
    ],
    exemple: {
      enonce: "Dans un triangle $ABC$, $E \\in [AB]$ et $F \\in [AC]$, avec $AE = 3$ cm, $AB = 7{,}5$ cm, $AF = 4$ cm et $AC = 10$ cm. Les droites $(EF)$ et $(BC)$ sont-elles parallèles ?",
      solution: [
        "$\\dfrac{AE}{AB} = \\dfrac{3}{7{,}5} = \\dfrac{30}{75} = \\dfrac{2}{5}$ et $\\dfrac{AF}{AC} = \\dfrac{4}{10} = \\dfrac{2}{5}$.",
        "Les rapports sont égaux, et les points $A$, $E$, $B$ et $A$, $F$, $C$ sont alignés dans le même ordre.",
        "D'après la réciproque du théorème de Thalès, les droites $(EF)$ et $(BC)$ sont parallèles."
      ]
    },
    erreurs: [
      "Utiliser le théorème de Thalès sans avoir justifié que les droites sont parallèles.",
      "Mélanger les rapports : chaque rapport doit comparer un côté du petit triangle au côté correspondant du grand.",
      "Oublier de vérifier l'ordre des points avant d'appliquer la réciproque.",
      "Conclure au parallélisme parce que deux valeurs approchées sont égales."
    ],
    flashcards: [
      { q: "Hypothèse du théorème de Thalès", r: "Deux droites parallèles coupent deux droites sécantes" },
      { q: "Égalité de Thalès ($M \\in [AB]$, $N \\in [AC]$, $(MN) \\parallel (BC)$)", r: "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$" },
      { q: "Conditions de la réciproque", r: "Rapports égaux et points alignés dans le même ordre" },
      { q: "Rapports différents ⇒ ?", r: "Les droites ne sont pas parallèles" },
      { q: "Réduction de rapport $k$ : effet sur les aires", r: "Elles sont multipliées par $k^2$" }
    ],
    contexte: {
      titre: "La hauteur d'un baobab à Thiès",
      enonce: "Pour mesurer la hauteur d'un baobab, Ousmane plante verticalement un bâton de $1{,}5$ m, de sorte que l'extrémité de l'ombre du bâton coïncide avec celle de l'ombre du baobab. L'ombre du bâton mesure $2$ m et celle du baobab $24$ m.<br>Quelle est la hauteur du baobab ?",
      solution: [
        "Notons $S$ l'extrémité commune des ombres, $B$ et $H$ le pied et le sommet du bâton, $P$ et $T$ le pied et le sommet du baobab. Les points $S$, $B$, $P$ et $S$, $H$, $T$ sont alignés, et $(BH) \\parallel (PT)$ car le bâton et le baobab sont verticaux.",
        "D'après le théorème de Thalès : $\\dfrac{SB}{SP} = \\dfrac{BH}{PT}$, soit $\\dfrac{2}{24} = \\dfrac{1{,}5}{PT}$.",
        "Donc $PT = \\dfrac{24 \\times 1{,}5}{2} = 18$ m : le baobab mesure $18$ m."
      ]
    },
    histoire: "Selon la tradition rapportée par des auteurs grecs, Thalès de Milet (VIe siècle avant J.-C.) aurait mesuré la hauteur d'une pyramide d'Égypte en comparant son ombre à celle d'un bâton planté verticalement."
  };

  /* ================================================================== */
  /* 3e — TRIGONOMÉTRIE                                                  */
  /* ================================================================== */
  EM.contenu['3e-trigonometrie'] = {
    resume: "Dans un triangle rectangle, le cosinus, le sinus et la tangente d'un angle aigu relient cet angle aux longueurs des côtés. Ils permettent de calculer une longueur ou la mesure d'un angle.",
    objectifs: [
      "Connaître les définitions de $\\cos$, $\\sin$ et $\\tan$ d'un angle aigu dans un triangle rectangle",
      "Calculer une longueur connaissant un angle aigu et un côté",
      "Calculer la mesure d'un angle connaissant deux côtés (calculatrice en degrés)",
      "Utiliser les relations $\\cos^2 x + \\sin^2 x = 1$ et $\\tan x = \\dfrac{\\sin x}{\\cos x}$",
      "Connaître les valeurs remarquables pour $30^\\circ$, $45^\\circ$ et $60^\\circ$"
    ],
    cours: [
      { type: 'definition', titre: 'Cosinus, sinus et tangente', texte: "Dans un triangle $ABC$ rectangle en $A$, pour l'angle aigu $\\widehat{ABC}$ : $$\\cos \\widehat{ABC} = \\dfrac{AB}{BC} = \\dfrac{\\text{côté adjacent}}{\\text{hypoténuse}} \\qquad \\sin \\widehat{ABC} = \\dfrac{AC}{BC} = \\dfrac{\\text{côté opposé}}{\\text{hypoténuse}}$$ $$\\tan \\widehat{ABC} = \\dfrac{AC}{AB} = \\dfrac{\\text{côté opposé}}{\\text{côté adjacent}}$$ Moyen mnémotechnique : <b>CAH SOH TOA</b>." },
      { type: 'propriete', titre: 'Relations', texte: "Pour tout angle aigu $x$ : $0 < \\cos x < 1$, $0 < \\sin x < 1$, $$\\cos^2 x + \\sin^2 x = 1 \\qquad \\text{et} \\qquad \\tan x = \\dfrac{\\sin x}{\\cos x}.$$ Si deux angles $x$ et $y$ sont complémentaires ($x + y = 90^\\circ$), alors $\\cos x = \\sin y$ et $\\sin x = \\cos y$." },
      { type: 'formule', titre: 'Valeurs remarquables', texte: "<table class='em-tableau'><tr><th>$x$</th><td>$30^\\circ$</td><td>$45^\\circ$</td><td>$60^\\circ$</td></tr><tr><th>$\\cos x$</th><td>$\\dfrac{\\sqrt{3}}{2}$</td><td>$\\dfrac{\\sqrt{2}}{2}$</td><td>$\\dfrac{1}{2}$</td></tr><tr><th>$\\sin x$</th><td>$\\dfrac{1}{2}$</td><td>$\\dfrac{\\sqrt{2}}{2}$</td><td>$\\dfrac{\\sqrt{3}}{2}$</td></tr><tr><th>$\\tan x$</th><td>$\\dfrac{\\sqrt{3}}{3}$</td><td>$1$</td><td>$\\sqrt{3}$</td></tr></table>" },
      { type: 'remarque', titre: 'Utiliser la calculatrice', texte: "La calculatrice doit être en mode <b>degrés</b> (D ou DEG). Pour retrouver un angle à partir de son cosinus, on utilise la touche $\\cos^{-1}$ (ou Arccos) ; de même $\\sin^{-1}$ et $\\tan^{-1}$. On n'arrondit que le résultat final." }
    ],
    methodes: [
      { titre: 'Calculer une longueur', etapes: [
        "Repérer l'angle aigu connu, puis l'hypoténuse, le côté adjacent et le côté opposé à cet angle.",
        "Choisir le rapport (cos, sin ou tan) qui contient le côté connu et le côté cherché.",
        "Écrire l'égalité, puis isoler la longueur cherchée (produit en croix).",
        "Calculer à la calculatrice et arrondir comme demandé."
      ] },
      { titre: 'Calculer un angle', etapes: [
        "Choisir le rapport qui utilise les deux côtés connus.",
        "Calculer ce rapport (fraction ou décimal).",
        "Utiliser $\\cos^{-1}$, $\\sin^{-1}$ ou $\\tan^{-1}$, puis arrondir."
      ] },
      { titre: 'Calculer $\\sin x$ et $\\tan x$ connaissant $\\cos x$', etapes: [
        "Écrire $\\sin^2 x = 1 - \\cos^2 x$ et calculer.",
        "Prendre la racine carrée positive, car l'angle est aigu.",
        "En déduire $\\tan x = \\dfrac{\\sin x}{\\cos x}$."
      ] }
    ],
    exemple: {
      enonce: "Le triangle $ABC$ est rectangle en $A$, avec $BC = 8$ cm et $\\widehat{ABC} = 40^\\circ$. Calculer $AB$ et $AC$ au millimètre près.",
      solution: [
        "$[BC]$ est l'hypoténuse ; pour l'angle $\\widehat{ABC}$, $[AB]$ est le côté adjacent et $[AC]$ le côté opposé.",
        "$\\cos \\widehat{ABC} = \\dfrac{AB}{BC}$, donc $AB = 8 \\times \\cos 40^\\circ \\approx 6{,}128$, soit $AB \\approx 6{,}1$ cm.",
        "$\\sin \\widehat{ABC} = \\dfrac{AC}{BC}$, donc $AC = 8 \\times \\sin 40^\\circ \\approx 5{,}142$, soit $AC \\approx 5{,}1$ cm."
      ]
    },
    erreurs: [
      "Utiliser cos, sin ou tan dans un triangle qui n'est pas rectangle.",
      "Confondre côté adjacent et côté opposé : ils dépendent de l'angle considéré.",
      "Laisser la calculatrice en mode radians ou grades.",
      "Arrondir trop tôt les résultats intermédiaires."
    ],
    flashcards: [
      { q: "CAH", r: "$\\cos = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$" },
      { q: "SOH", r: "$\\sin = \\dfrac{\\text{opposé}}{\\text{hypoténuse}}$" },
      { q: "TOA", r: "$\\tan = \\dfrac{\\text{opposé}}{\\text{adjacent}}$" },
      { q: "$\\cos^2 x + \\sin^2 x = ?$", r: "$1$" },
      { q: "$\\cos 60^\\circ$", r: "$\\dfrac{1}{2}$" },
      { q: "$\\sin 45^\\circ$", r: "$\\dfrac{\\sqrt{2}}{2}$" },
      { q: "$\\tan 60^\\circ$", r: "$\\sqrt{3}$" }
    ],
    contexte: {
      titre: 'Observer un phare à Dakar',
      enonce: "Depuis un point $P$ situé au bord de la mer, Babacar observe le sommet $S$ d'un phare construit sur une colline, à Dakar. Le point $H$, au niveau de la mer, est à la verticale de $S$, et $PH = 300$ m. Babacar voit le sommet sous un angle $\\widehat{HPS} = 25^\\circ$ avec l'horizontale.<br>Calculer l'altitude $HS$ du sommet du phare, au mètre près.",
      solution: [
        "Le triangle $PHS$ est rectangle en $H$. Pour l'angle $\\widehat{HPS}$, $[HS]$ est le côté opposé et $[PH]$ le côté adjacent.",
        "$\\tan \\widehat{HPS} = \\dfrac{HS}{PH}$, donc $HS = 300 \\times \\tan 25^\\circ \\approx 139{,}9$ m.",
        "Le sommet du phare est à environ $140$ m au-dessus du niveau de la mer."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — ANGLES INSCRITS                                                */
  /* ================================================================== */
  EM.contenu['3e-angles-inscrits'] = {
    resume: "Un angle inscrit a son sommet sur un cercle ; un angle au centre a son sommet au centre du cercle. La relation entre ces angles permet de calculer des angles et de construire les polygones réguliers.",
    objectifs: [
      "Reconnaître un angle inscrit et l'angle au centre qui intercepte le même arc",
      "Utiliser la relation entre un angle inscrit et l'angle au centre associé",
      "Utiliser l'égalité de deux angles inscrits qui interceptent le même arc",
      "Connaître les polygones réguliers et calculer leurs angles",
      "Construire un triangle équilatéral, un carré, un hexagone régulier inscrits dans un cercle"
    ],
    cours: [
      { type: 'definition', titre: 'Angle inscrit, angle au centre', texte: "Soit un cercle $(\\mathscr{C})$ de centre $O$. Un angle dont le sommet est sur le cercle et dont les côtés recoupent le cercle est un <b>angle inscrit</b> ; un angle dont le sommet est le centre $O$ est un <b>angle au centre</b>. Si $A$, $B$, $M$ sont sur le cercle, l'angle inscrit $\\widehat{AMB}$ et l'angle au centre $\\widehat{AOB}$ interceptent le même arc $\\overset{\\frown}{AB}$ (celui qui ne contient pas $M$)." },
      { type: 'theoreme', titre: 'Angle inscrit et angle au centre', texte: "La mesure d'un angle inscrit est égale à la moitié de celle de l'angle au centre qui intercepte le même arc : $$\\widehat{AMB} = \\dfrac{1}{2}\\,\\widehat{AOB}.$$" },
      { type: 'propriete', titre: 'Angles inscrits interceptant le même arc', texte: "Deux angles inscrits qui interceptent le même arc ont la même mesure. Cas particulier : si $[AB]$ est un diamètre, tout angle inscrit $\\widehat{AMB}$ est droit." },
      { type: 'definition', titre: 'Polygone régulier', texte: "Un polygone régulier a tous ses côtés de même longueur et tous ses angles de même mesure ; il est inscrit dans un cercle de centre $O$. Pour un polygone régulier à $n$ côtés, l'angle au centre qui intercepte un côté mesure $\\dfrac{360^\\circ}{n}$ et chaque angle du polygone mesure $180^\\circ - \\dfrac{360^\\circ}{n}$." },
      { type: 'remarque', titre: 'Exemples', texte: "Triangle équilatéral : angle au centre $120^\\circ$. Carré : $90^\\circ$. Hexagone régulier : $60^\\circ$ ; son côté est égal au rayon du cercle, car les triangles $AOB$ sont équilatéraux." }
    ],
    methodes: [
      { titre: 'Calculer un angle dans un cercle', etapes: [
        "Repérer l'arc intercepté par l'angle cherché.",
        "Chercher un angle au centre ou un autre angle inscrit qui intercepte le même arc.",
        "Appliquer : angle inscrit $= \\dfrac{1}{2}$ angle au centre, ou égalité des angles inscrits.",
        "Penser aux triangles isocèles formés par deux rayons ($OA = OB$)."
      ] },
      { titre: 'Construire un polygone régulier à $n$ côtés', etapes: [
        "Tracer un cercle de centre $O$.",
        "Calculer l'angle au centre $\\dfrac{360^\\circ}{n}$.",
        "Placer les sommets en reportant cet angle au rapporteur à partir de $O$ (pour l'hexagone, reporter simplement le rayon au compas).",
        "Relier les sommets consécutifs."
      ] }
    ],
    exemple: {
      enonce: "$A$, $B$, $C$ sont trois points d'un cercle de centre $O$, avec $\\widehat{AOB} = 110^\\circ$ ; $C$ n'appartient pas au petit arc $\\overset{\\frown}{AB}$. Calculer $\\widehat{ACB}$ et $\\widehat{OAB}$.",
      solution: [
        "L'angle inscrit $\\widehat{ACB}$ intercepte le même arc que l'angle au centre $\\widehat{AOB}$ : $\\widehat{ACB} = \\dfrac{110^\\circ}{2} = 55^\\circ$.",
        "Le triangle $AOB$ est isocèle en $O$ ($OA = OB$) : $\\widehat{OAB} = \\dfrac{180^\\circ - 110^\\circ}{2} = 35^\\circ$."
      ]
    },
    erreurs: [
      "Doubler au lieu de diviser par deux (ou l'inverse) : c'est l'angle au centre qui est le double de l'angle inscrit.",
      "Associer des angles qui n'interceptent pas le même arc.",
      "Oublier que le triangle formé par deux rayons est isocèle."
    ],
    flashcards: [
      { q: "Angle inscrit et angle au centre interceptant le même arc", r: "Angle inscrit $= \\dfrac{1}{2}$ angle au centre" },
      { q: "Deux angles inscrits interceptant le même arc", r: "Ils sont égaux" },
      { q: "Angle inscrit dans un demi-cercle", r: "Angle droit ($90^\\circ$)" },
      { q: "Angle au centre d'un pentagone régulier", r: "$\\dfrac{360^\\circ}{5} = 72^\\circ$" },
      { q: "Angle d'un hexagone régulier", r: "$120^\\circ$" },
      { q: "Côté d'un hexagone régulier inscrit dans un cercle de rayon $r$", r: "$r$" }
    ],
    contexte: {
      titre: 'Un motif brodé à Ziguinchor',
      enonce: "Mariama, couturière à Ziguinchor, veut broder sur un boubou un motif en forme d'octogone régulier inscrit dans un cercle de rayon $10$ cm.<br>1) Quel angle au centre doit-elle reporter pour placer les sommets ?<br>2) Quelle est la mesure de chaque angle de l'octogone ?<br>3) Calculer la longueur d'un côté, au millimètre près.",
      solution: [
        "1) $\\dfrac{360^\\circ}{8} = 45^\\circ$.",
        "2) $180^\\circ - 45^\\circ = 135^\\circ$.",
        "3) Le triangle $AOB$ est isocèle en $O$ avec $\\widehat{AOB} = 45^\\circ$. Sa hauteur issue de $O$ coupe $[AB]$ en son milieu $H$, et $\\widehat{AOH} = 22{,}5^\\circ$. Dans le triangle $AOH$ rectangle en $H$ : $AH = 10 \\times \\sin 22{,}5^\\circ \\approx 3{,}827$ cm, donc $AB = 2AH \\approx 7{,}7$ cm."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — VECTEURS                                                       */
  /* ================================================================== */
  EM.contenu['3e-vecteurs'] = {
    resume: "Un vecteur est défini par une direction, un sens et une longueur. En 3e, on calcule avec les vecteurs (somme, produit par un réel), on utilise leurs coordonnées dans un repère et on caractérise la colinéarité.",
    objectifs: [
      "Construire la somme de deux vecteurs (relation de Chasles, règle du parallélogramme) et le produit d'un vecteur par un réel",
      "Calculer les coordonnées d'un vecteur $\\vect{AB}$, d'une somme et d'un produit par un réel",
      "Caractériser un parallélogramme et une translation par une égalité vectorielle",
      "Reconnaître deux vecteurs colinéaires à l'aide de la condition $xy' - x'y = 0$",
      "Démontrer que trois points sont alignés ou que deux droites sont parallèles"
    ],
    cours: [
      { type: 'definition', titre: 'Vecteurs égaux, translation', texte: "Deux vecteurs sont égaux s'ils ont la même direction, le même sens et la même longueur. $\\vect{AB} = \\vect{DC}$ si et seulement si $ABCD$ est un parallélogramme (éventuellement aplati). L'image d'un point $M$ par la translation de vecteur $\\vect{u}$ est le point $M'$ tel que $\\vect{MM'} = \\vect{u}$." },
      { type: 'propriete', titre: 'Somme et produit par un réel', texte: "Relation de Chasles : $\\vect{AB} + \\vect{BC} = \\vect{AC}$.<br>Si $k$ est un réel non nul, $k\\vect{u}$ a la même direction que $\\vect{u}$, le même sens si $k > 0$ et le sens contraire si $k < 0$ ; sa longueur est celle de $\\vect{u}$ multipliée par $|k|$." },
      { type: 'formule', titre: 'Coordonnées', texte: "Dans un repère $(O, I, J)$ : $\\vect{AB}\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$. Si $\\vect{u}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ et $\\vect{v}\\begin{pmatrix} x' \\\\ y' \\end{pmatrix}$, alors $\\vect{u} + \\vect{v}\\begin{pmatrix} x + x' \\\\ y + y' \\end{pmatrix}$ et $k\\vect{u}\\begin{pmatrix} kx \\\\ ky \\end{pmatrix}$. Deux vecteurs sont égaux si et seulement s'ils ont les mêmes coordonnées." },
      { type: 'theoreme', titre: 'Colinéarité', texte: "$\\vect{u}$ et $\\vect{v}$ sont colinéaires s'il existe un réel $k$ tel que $\\vect{v} = k\\vect{u}$ (ou si $\\vect{u}$ est nul). Dans un repère, $\\vect{u}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ et $\\vect{v}\\begin{pmatrix} x' \\\\ y' \\end{pmatrix}$ sont colinéaires si et seulement si $$xy' - x'y = 0.$$" },
      { type: 'propriete', titre: 'Alignement et parallélisme', texte: "Les points $A$, $B$, $C$ sont alignés si et seulement si $\\vect{AB}$ et $\\vect{AC}$ sont colinéaires. Les droites $(AB)$ et $(CD)$ sont parallèles si et seulement si $\\vect{AB}$ et $\\vect{CD}$ sont colinéaires." }
    ],
    methodes: [
      { titre: "Trouver le quatrième sommet d'un parallélogramme $ABCD$", etapes: [
        "Écrire l'égalité $\\vect{AB} = \\vect{DC}$ (attention à l'ordre des lettres).",
        "Calculer les coordonnées de $\\vect{AB}$ et exprimer celles de $\\vect{DC}$ avec les coordonnées $(x \\,;\\, y)$ de $D$.",
        "Égaler les abscisses, puis les ordonnées, et résoudre."
      ] },
      { titre: 'Démontrer que trois points sont alignés', etapes: [
        "Calculer les coordonnées de $\\vect{AB}$ et de $\\vect{AC}$.",
        "Calculer $xy' - x'y$.",
        "Si le résultat est nul, les vecteurs sont colinéaires et les points sont alignés ; sinon, ils ne le sont pas."
      ] }
    ],
    exemple: {
      enonce: "Dans un repère, on donne $A(1 \\,;\\, 2)$, $B(4 \\,;\\, 3)$, $C(7 \\,;\\, 4)$ et $D(2 \\,;\\, -1)$.<br>1) Les points $A$, $B$, $C$ sont-ils alignés ?<br>2) Calculer les coordonnées du point $E$ tel que $ABED$ soit un parallélogramme.",
      solution: [
        "1) $\\vect{AB}\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ et $\\vect{AC}\\begin{pmatrix} 6 \\\\ 2 \\end{pmatrix}$ : $3 \\times 2 - 6 \\times 1 = 0$. Les vecteurs sont colinéaires (d'ailleurs $\\vect{AC} = 2\\vect{AB}$), donc $A$, $B$, $C$ sont alignés.",
        "2) $ABED$ est un parallélogramme si et seulement si $\\vect{AB} = \\vect{DE}$. Avec $E(x \\,;\\, y)$ : $x - 2 = 3$ et $y + 1 = 1$, donc $E(5 \\,;\\, 0)$."
      ]
    },
    erreurs: [
      "Calculer $\\vect{AB}$ avec $x_A - x_B$ : on fait toujours « arrivée moins départ ».",
      "Écrire $\\vect{AB} = \\vect{CD}$ pour le parallélogramme $ABCD$ : la bonne égalité est $\\vect{AB} = \\vect{DC}$.",
      "Confondre égalité de vecteurs et égalité de longueurs : $AB = CD$ ne suffit pas."
    ],
    flashcards: [
      { q: "Coordonnées de $\\vect{AB}$", r: "$(x_B - x_A \\,;\\, y_B - y_A)$" },
      { q: "Relation de Chasles", r: "$\\vect{AB} + \\vect{BC} = \\vect{AC}$" },
      { q: "$ABCD$ est un parallélogramme si et seulement si…", r: "$\\vect{AB} = \\vect{DC}$" },
      { q: "Condition de colinéarité", r: "$xy' - x'y = 0$" },
      { q: "$A$, $B$, $C$ alignés si et seulement si…", r: "$\\vect{AB}$ et $\\vect{AC}$ sont colinéaires" },
      { q: "Coordonnées de $-2\\vect{u}$ si $\\vect{u}(3 \\,;\\, -1)$", r: "$(-6 \\,;\\, 2)$" }
    ],
    contexte: {
      titre: "Le trajet d'une pirogue à Joal",
      enonce: "Sur une carte munie d'un repère orthonormal (unité : 1 km), le port de Joal est à l'origine $O$. Une pirogue part de $O$, se déplace selon le vecteur $\\vect{u}(3 \\,;\\, 4)$, puis selon le vecteur $\\vect{v}(5 \\,;\\, -2)$.<br>1) Quelles sont les coordonnées de son point d'arrivée $P$ ?<br>2) À quelle distance du port se trouve-t-elle ?<br>3) Quel vecteur doit-elle suivre pour revenir directement au port ?",
      solution: [
        "1) $\\vect{OP} = \\vect{u} + \\vect{v}$ a pour coordonnées $(3 + 5 \\,;\\, 4 - 2) = (8 \\,;\\, 2)$ : $P(8 \\,;\\, 2)$.",
        "2) $OP = \\sqrt{8^2 + 2^2} = \\sqrt{68} = 2\\sqrt{17} \\approx 8{,}2$ km.",
        "3) Elle doit suivre le vecteur $\\vect{PO} = -\\vect{OP}$, de coordonnées $(-8 \\,;\\, -2)$."
      ]
    }
  };

  /* ================================================================== */
  /* 3e — REPÉRAGE                                                       */
  /* ================================================================== */
  EM.contenu['3e-reperage'] = {
    resume: "Dans un repère orthonormal, on calcule des distances, des coordonnées de milieux et des équations de droites. On caractérise aussi le parallélisme et la perpendicularité de deux droites par leurs coefficients directeurs.",
    objectifs: [
      "Calculer les coordonnées du milieu d'un segment",
      "Calculer la distance entre deux points dans un repère orthonormal",
      "Déterminer une équation de droite passant par deux points ($y = ax + b$ ou $x = c$)",
      "Reconnaître des droites parallèles (même coefficient directeur) et perpendiculaires ($aa' = -1$)",
      "Démontrer la nature d'un triangle ou d'un quadrilatère à l'aide des coordonnées"
    ],
    cours: [
      { type: 'formule', titre: 'Milieu et distance', texte: "Dans un repère orthonormal $(O, I, J)$, le milieu $K$ du segment $[AB]$ a pour coordonnées $\\left(\\dfrac{x_A + x_B}{2} \\,;\\, \\dfrac{y_A + y_B}{2}\\right)$ et $$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}.$$" },
      { type: 'propriete', titre: 'Équation de droite', texte: "Une droite non parallèle à l'axe des ordonnées a une équation de la forme $y = ax + b$ : $a$ est son <b>coefficient directeur</b> et $b$ son <b>ordonnée à l'origine</b>. Si $A$ et $B$ sont deux points de la droite avec $x_A \\neq x_B$ : $a = \\dfrac{y_B - y_A}{x_B - x_A}$. Une droite parallèle à l'axe des ordonnées a une équation de la forme $x = c$." },
      { type: 'theoreme', titre: 'Droites parallèles, droites perpendiculaires', texte: "Soit $(D) : y = ax + b$ et $(D') : y = a'x + b'$.<br>$(D) \\parallel (D') \\iff a = a'$.<br>Dans un repère orthonormal, $(D) \\perp (D') \\iff a \\times a' = -1$." },
      { type: 'remarque', titre: "Point d'une droite", texte: "Le point $M(x_0 \\,;\\, y_0)$ appartient à la droite d'équation $y = ax + b$ si et seulement si $y_0 = ax_0 + b$. Le vecteur $\\vect{u}\\begin{pmatrix} 1 \\\\ a \\end{pmatrix}$ est un vecteur directeur de cette droite." }
    ],
    methodes: [
      { titre: 'Déterminer une équation de la droite $(AB)$', etapes: [
        "Vérifier que $x_A \\neq x_B$ (sinon, l'équation est $x = x_A$).",
        "Calculer $a = \\dfrac{y_B - y_A}{x_B - x_A}$.",
        "Remplacer les coordonnées de $A$ dans $y = ax + b$ pour trouver $b$.",
        "Vérifier avec les coordonnées de $B$."
      ] },
      { titre: "Démontrer qu'un triangle est rectangle", etapes: [
        "Calculer les carrés des trois longueurs (inutile de prendre les racines).",
        "Comparer le plus grand carré à la somme des deux autres.",
        "Conclure avec la réciproque du théorème de Pythagore (ou avec $aa' = -1$ pour deux côtés)."
      ] }
    ],
    exemple: {
      enonce: "On donne $A(-1 \\,;\\, 2)$, $B(3 \\,;\\, 4)$ et $C(1 \\,;\\, -2)$ dans un repère orthonormal.<br>1) Déterminer une équation de $(AB)$.<br>2) Déterminer une équation de la droite $(D)$ passant par $C$ et perpendiculaire à $(AB)$.<br>3) Calculer $AB$.",
      solution: [
        "1) $a = \\dfrac{4 - 2}{3 - (-1)} = \\dfrac{1}{2}$ ; puis $2 = \\dfrac{1}{2} \\times (-1) + b$, donc $b = \\dfrac{5}{2}$ : $(AB) : y = \\dfrac{1}{2}x + \\dfrac{5}{2}$.",
        "2) $a' \\times \\dfrac{1}{2} = -1$, donc $a' = -2$ ; puis $-2 = -2 \\times 1 + p$, donc $p = 0$ : $(D) : y = -2x$.",
        "3) $AB = \\sqrt{(3 + 1)^2 + (4 - 2)^2} = \\sqrt{20} = 2\\sqrt{5}$."
      ]
    },
    erreurs: [
      "Calculer $a$ avec $\\dfrac{x_B - x_A}{y_B - y_A}$ : le rapport est inversé.",
      "Oublier la racine carrée dans la formule de la distance, ou écrire $\\sqrt{a^2 + b^2} = a + b$.",
      "Utiliser la condition $aa' = -1$ dans un repère qui n'est pas orthonormal."
    ],
    flashcards: [
      { q: "Coordonnées du milieu de $[AB]$", r: "$\\left(\\dfrac{x_A + x_B}{2} \\,;\\, \\dfrac{y_A + y_B}{2}\\right)$" },
      { q: "Distance $AB$", r: "$\\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$" },
      { q: "Coefficient directeur de $(AB)$", r: "$\\dfrac{y_B - y_A}{x_B - x_A}$" },
      { q: "Droites parallèles", r: "Même coefficient directeur" },
      { q: "Droites perpendiculaires (repère orthonormal)", r: "$a \\times a' = -1$" },
      { q: "Équation d'une droite parallèle à l'axe des ordonnées", r: "$x = c$" }
    ],
    contexte: {
      titre: 'Une route vers la nationale',
      enonce: "Sur un plan muni d'un repère orthonormal (unité : 1 km), un village $V$ de la région de Diourbel a pour coordonnées $(2 \\,;\\, 9)$. La route nationale est représentée par la droite $(R)$ d'équation $y = \\dfrac{1}{2}x + 3$. La commune veut construire la route la plus courte reliant $V$ à la nationale : elle doit être perpendiculaire à $(R)$.<br>1) Déterminer une équation de cette route $(P)$.<br>2) Calculer les coordonnées du point de raccordement $H$.<br>3) Calculer la longueur $VH$.",
      solution: [
        "1) $(P) \\perp (R)$ : $a \\times \\dfrac{1}{2} = -1$, donc $a = -2$. Comme $V \\in (P)$ : $9 = -2 \\times 2 + p$, donc $p = 13$ et $(P) : y = -2x + 13$.",
        "2) $H$ est sur les deux droites : $\\dfrac{1}{2}x + 3 = -2x + 13 \\iff \\dfrac{5}{2}x = 10 \\iff x = 4$, puis $y = 5$ : $H(4 \\,;\\, 5)$.",
        "3) $VH = \\sqrt{(4 - 2)^2 + (5 - 9)^2} = \\sqrt{20} = 2\\sqrt{5} \\approx 4{,}5$ km."
      ]
    },
    histoire: "Le repère « cartésien » doit son nom au philosophe et mathématicien français René Descartes, qui publia en 1637 <i>La Géométrie</i>, où les figures sont étudiées à l'aide de calculs algébriques."
  };

  /* ================================================================== */
  /* 3e — GÉOMÉTRIE DANS L'ESPACE                                        */
  /* ================================================================== */
  EM.contenu['3e-espace'] = {
    resume: "On étudie les solides usuels — pyramide, cône de révolution, sphère et boule — leurs aires et leurs volumes, ainsi que les sections planes, en particulier les sections parallèles à la base qui donnent des réductions.",
    objectifs: [
      "Connaître et utiliser les formules de volume de la pyramide, du cône et de la boule, et l'aire de la sphère",
      "Calculer une longueur dans un solide à l'aide du théorème de Pythagore",
      "Connaître la nature de la section d'une pyramide ou d'un cône par un plan parallèle à la base",
      "Utiliser le coefficient de réduction $k$ : longueurs multipliées par $k$, aires par $k^2$, volumes par $k^3$",
      "Connaître la section d'une sphère par un plan"
    ],
    cours: [
      { type: 'formule', titre: 'Aires et volumes', texte: "Pyramide ou cône de hauteur $h$ et d'aire de base $\\mathscr{B}$ : $V = \\dfrac{\\mathscr{B} \\times h}{3}$.<br>Cône de révolution de rayon $r$ : $V = \\dfrac{\\pi r^2 h}{3}$.<br>Boule de rayon $r$ : $V = \\dfrac{4}{3}\\pi r^3$. Sphère de rayon $r$ : $\\mathscr{A} = 4\\pi r^2$." },
      { type: 'propriete', titre: 'Section parallèle à la base', texte: "La section d'une pyramide (ou d'un cône) par un plan parallèle à la base est un polygone (ou un disque) de même nature que la base : c'est une <b>réduction</b> de la base. La petite pyramide (ou le petit cône) obtenue est une réduction du solide initial de coefficient $k = \\dfrac{SO'}{SO}$, où $SO$ est la hauteur et $SO'$ la distance du sommet au plan de coupe." },
      { type: 'theoreme', titre: "Effet d'une réduction", texte: "Dans une réduction (ou un agrandissement) de rapport $k$ : les longueurs sont multipliées par $k$, les aires par $k^2$ et les volumes par $k^3$." },
      { type: 'propriete', titre: 'Section d\'une sphère', texte: "La section d'une sphère de centre $O$ et de rayon $R$ par un plan situé à la distance $d < R$ de $O$ est un cercle de rayon $r = \\sqrt{R^2 - d^2}$ (théorème de Pythagore). Si $d = R$, le plan est tangent à la sphère." },
      { type: 'remarque', titre: 'Unités de volume', texte: "$1$ m³ $= 1\\,000$ dm³ ; $1$ dm³ $= 1$ L ; $1$ cm³ $= 1$ mL. Donc $1$ m³ $= 1\\,000$ L." }
    ],
    methodes: [
      { titre: 'Calculer un volume après une section', etapes: [
        "Calculer le coefficient $k = \\dfrac{\\text{petite hauteur}}{\\text{grande hauteur}}$ (ou un autre rapport de longueurs correspondantes).",
        "Calculer le volume $V$ du grand solide.",
        "En déduire le volume du petit solide : $V' = k^3 \\times V$.",
        "Pour un tronc de pyramide ou de cône, faire la différence $V - V'$."
      ] },
      { titre: 'Calculer une hauteur ou une génératrice', etapes: [
        "Repérer un triangle rectangle dans le solide (hauteur, rayon et génératrice ; ou hauteur, demi-diagonale et arête).",
        "Appliquer le théorème de Pythagore dans ce triangle."
      ] }
    ],
    exemple: {
      enonce: "Un cône de révolution a pour hauteur $SO = 12$ cm et pour rayon de base $OA = 5$ cm.<br>1) Calculer la génératrice $SA$.<br>2) Calculer la valeur exacte de son volume.<br>3) On coupe ce cône par un plan parallèle à la base, à $4$ cm du sommet. Calculer la valeur exacte du volume du petit cône.",
      solution: [
        "1) Le triangle $SOA$ est rectangle en $O$ : $SA^2 = 12^2 + 5^2 = 169$, donc $SA = 13$ cm.",
        "2) $V = \\dfrac{\\pi \\times 5^2 \\times 12}{3} = 100\\pi$ cm³.",
        "3) $k = \\dfrac{4}{12} = \\dfrac{1}{3}$, donc $V' = \\left(\\dfrac{1}{3}\\right)^3 \\times 100\\pi = \\dfrac{100\\pi}{27}$ cm³, soit environ $11{,}6$ cm³."
      ]
    },
    erreurs: [
      "Oublier de diviser par $3$ pour le volume d'une pyramide ou d'un cône.",
      "Multiplier un volume par $k$ au lieu de $k^3$ (ou une aire par $k$ au lieu de $k^2$).",
      "Confondre la hauteur et la génératrice d'un cône, ou la hauteur et une arête d'une pyramide.",
      "Mélanger les unités (cm et m) dans un même calcul."
    ],
    flashcards: [
      { q: "Volume d'une pyramide", r: "$\\dfrac{\\mathscr{B} \\times h}{3}$" },
      { q: "Volume d'un cône de révolution", r: "$\\dfrac{\\pi r^2 h}{3}$" },
      { q: "Volume d'une boule", r: "$\\dfrac{4}{3}\\pi r^3$" },
      { q: "Aire d'une sphère", r: "$4\\pi r^2$" },
      { q: "Réduction de rapport $k$ : effet sur les volumes", r: "Multipliés par $k^3$" },
      { q: "Section d'un cône par un plan parallèle à la base", r: "Un disque, réduction de la base" }
    ],
    contexte: {
      titre: "Le réservoir d'un château d'eau à Kaolack",
      enonce: "Le réservoir d'un château d'eau d'un quartier de Kaolack a la forme d'une boule de rayon $3$ m.<br>1) Calculer son volume en m³ (au dixième près), puis en litres.<br>2) Une famille consomme en moyenne $150$ L d'eau par jour. Combien de familles le réservoir plein peut-il alimenter pendant une journée ?",
      solution: [
        "1) $V = \\dfrac{4}{3}\\pi \\times 3^3 = 36\\pi \\approx 113{,}1$ m³, soit environ $113\\,097$ L (car $1$ m³ $= 1\\,000$ L).",
        "2) $\\dfrac{113\\,097}{150} \\approx 753{,}98$ : le réservoir plein peut alimenter $753$ familles pendant une journée."
      ]
    },
    histoire: "Archimède de Syracuse (IIIe siècle avant J.-C.) a démontré que le volume d'une boule est égal aux deux tiers du volume du cylindre dans lequel elle est exactement contenue. Il considérait ce résultat comme l'une de ses plus belles découvertes."
  };

  /* ================================================================== */
  /* 2nde L — CALCUL NUMÉRIQUE DANS ℝ                                    */
  /* ================================================================== */
  EM.contenu['2l-calcul'] = {
    resume: "Ce chapitre consolide le calcul dans $\\R$ : fractions, puissances, écriture scientifique, racines carrées, intervalles et valeurs approchées. Ce sont les outils de base de tous les autres chapitres.",
    objectifs: [
      "Calculer avec des fractions en respectant les priorités et donner un résultat irréductible",
      "Utiliser les règles de calcul sur les puissances et l'écriture scientifique",
      "Simplifier des expressions contenant des racines carrées",
      "Utiliser les intervalles de $\\R$ : notation, intersection, réunion",
      "Donner un arrondi ou un encadrement d'un nombre"
    ],
    cours: [
      { type: 'definition', titre: 'Ensembles de nombres', texte: "$\\N \\subset \\Z \\subset \\D \\subset \\Q \\subset \\R$ : entiers naturels, entiers relatifs, décimaux, rationnels (quotients d'entiers), réels. Exemples : $-3 \\in \\Z$ ; $0{,}25 \\in \\D$ ; $\\dfrac{1}{3} \\in \\Q$ mais $\\dfrac{1}{3} \\notin \\D$ ; $\\sqrt{2} \\in \\R$ mais $\\sqrt{2} \\notin \\Q$." },
      { type: 'formule', titre: 'Fractions', texte: "Avec des dénominateurs non nuls : $\\dfrac{a}{b} + \\dfrac{c}{d} = \\dfrac{ad + bc}{bd}$ ; $\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$ ; $\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.<br>Priorités : parenthèses, puis puissances, puis multiplications et divisions, enfin additions et soustractions." },
      { type: 'formule', titre: 'Puissances et écriture scientifique', texte: "Pour $a \\neq 0$ et $m$, $n$ entiers relatifs : $a^m \\times a^n = a^{m + n}$ ; $\\dfrac{a^m}{a^n} = a^{m - n}$ ; $(a^m)^n = a^{mn}$ ; $a^{-n} = \\dfrac{1}{a^n}$ ; $a^0 = 1$.<br>L'écriture scientifique d'un nombre décimal non nul est $a \\times 10^n$ avec $1 \\leq a < 10$ et $n \\in \\Z$. Exemple : $0{,}00052 = 5{,}2 \\times 10^{-4}$." },
      { type: 'definition', titre: 'Intervalles', texte: "$[a \\,;\\, b]$ est l'ensemble des réels $x$ tels que $a \\leq x \\leq b$ ; $]a \\,;\\, b[$ : $a < x < b$ ; $[a \\,;\\, +\\infty[$ : $x \\geq a$ ; $]-\\infty \\,;\\, b[$ : $x < b$.<br>L'intersection $I \\cap J$ contient les réels qui sont à la fois dans $I$ et dans $J$ ; la réunion $I \\cup J$ contient ceux qui sont dans $I$ ou dans $J$." },
      { type: 'remarque', titre: 'Valeurs approchées', texte: "L'arrondi au centième de $3{,}14159$ est $3{,}14$ ; au millième, $3{,}142$. Un encadrement de $\\sqrt{2}$ d'amplitude $0{,}01$ est $1{,}41 < \\sqrt{2} < 1{,}42$." }
    ],
    methodes: [
      { titre: 'Calculer une expression avec des fractions', etapes: [
        "Repérer les priorités (parenthèses, puis produits et quotients).",
        "Simplifier dès que possible avant de multiplier.",
        "Réduire au même dénominateur pour additionner ou soustraire.",
        "Donner le résultat sous forme irréductible."
      ] },
      { titre: 'Donner une écriture scientifique', etapes: [
        "Regrouper les nombres d'un côté et les puissances de $10$ de l'autre.",
        "Calculer chaque groupe (règles sur les puissances).",
        "Écrire le nombre obtenu sous la forme $a \\times 10^p$ avec $1 \\leq a < 10$, puis regrouper les puissances de $10$."
      ] },
      { titre: 'Déterminer $I \\cap J$ et $I \\cup J$', etapes: [
        "Représenter $I$ et $J$ sur une même droite graduée, avec deux couleurs.",
        "Lire la partie commune (intersection) et la partie couverte par l'un ou l'autre (réunion).",
        "Choisir soigneusement le sens des crochets aux bornes."
      ] }
    ],
    exemple: {
      enonce: "1) Calculer $A = \\dfrac{3}{4} - \\dfrac{5}{6} \\times \\dfrac{3}{10}$.<br>2) Donner l'écriture scientifique de $B = \\dfrac{3 \\times 10^{5} \\times 8 \\times 10^{-2}}{6 \\times 10^{-3}}$.",
      solution: [
        "1) La multiplication est prioritaire : $\\dfrac{5}{6} \\times \\dfrac{3}{10} = \\dfrac{15}{60} = \\dfrac{1}{4}$, donc $A = \\dfrac{3}{4} - \\dfrac{1}{4} = \\dfrac{2}{4} = \\dfrac{1}{2}$.",
        "2) $B = \\dfrac{3 \\times 8}{6} \\times \\dfrac{10^{5} \\times 10^{-2}}{10^{-3}} = 4 \\times 10^{5 - 2 + 3} = 4 \\times 10^{6}$."
      ]
    },
    erreurs: [
      "Additionner numérateurs et dénominateurs : $\\dfrac{1}{2} + \\dfrac{1}{3} \\neq \\dfrac{2}{5}$ ; en réalité $\\dfrac{1}{2} + \\dfrac{1}{3} = \\dfrac{5}{6}$.",
      "Multiplier les exposants au lieu de les additionner : $10^{2} \\times 10^{3} = 10^{5}$ et non $10^{6}$.",
      "Donner $35 \\times 10^{3}$ comme écriture scientifique : il faut $3{,}5 \\times 10^{4}$.",
      "Fermer un crochet du côté de l'infini."
    ],
    flashcards: [
      { q: "$a^m \\times a^n$", r: "$a^{m + n}$" },
      { q: "$a^{-n}$", r: "$\\dfrac{1}{a^n}$" },
      { q: "Écriture scientifique de $0{,}0045$", r: "$4{,}5 \\times 10^{-3}$" },
      { q: "$\\dfrac{a}{b} \\div \\dfrac{c}{d}$", r: "$\\dfrac{a}{b} \\times \\dfrac{d}{c}$" },
      { q: "Réels $x$ tels que $-1 < x \\leq 4$", r: "$]-1 \\,;\\, 4]$" },
      { q: "$[0 \\,;\\, 5] \\cap [3 \\,;\\, 8]$", r: "$[3 \\,;\\, 5]$" }
    ],
    contexte: {
      titre: 'Des grains de mil par milliards',
      enonce: "Un sac de mil de $50$ kg contient environ $5 \\times 10^{6}$ grains (estimation).<br>1) Calculer la masse moyenne d'un grain, en grammes, en écriture scientifique.<br>2) Une coopérative de Kaffrine a récolté $1{,}2 \\times 10^{3}$ sacs. Combien de grains cela représente-t-il environ ?",
      solution: [
        "1) $50$ kg $= 5 \\times 10^{4}$ g. Masse d'un grain : $\\dfrac{5 \\times 10^{4}}{5 \\times 10^{6}} = 1 \\times 10^{-2}$ g, soit $0{,}01$ g.",
        "2) Nombre de grains : $1{,}2 \\times 10^{3} \\times 5 \\times 10^{6} = 6 \\times 10^{9}$, soit environ six milliards de grains."
      ]
    }
  };

  /* ================================================================== */
  /* 2nde L — ÉQUATIONS, INÉQUATIONS, SYSTÈMES                           */
  /* ================================================================== */
  EM.contenu['2l-equations'] = {
    resume: "On résout des équations et des inéquations du premier degré à une inconnue (y compris des équations produits et quotients), ainsi que des systèmes de deux équations à deux inconnues, pour traduire et résoudre des problèmes de la vie courante.",
    objectifs: [
      "Résoudre une équation du premier degré, une équation produit ou une équation quotient",
      "Résoudre une inéquation du premier degré et un système d'inéquations à une inconnue",
      "Étudier le signe d'un binôme $ax + b$ à l'aide d'un tableau de signes",
      "Résoudre un système de deux équations à deux inconnues (substitution, combinaison)",
      "Mettre un problème en équation, en inéquation ou en système"
    ],
    cours: [
      { type: 'propriete', titre: 'Équations', texte: "Si $a \\neq 0$ : $ax + b = 0 \\iff x = -\\dfrac{b}{a}$.<br>Produit nul : $AB = 0 \\iff A = 0$ ou $B = 0$. Quotient nul : $\\dfrac{A}{B} = 0 \\iff A = 0$ et $B \\neq 0$." },
      { type: 'propriete', titre: 'Inéquations', texte: "On peut ajouter un même nombre aux deux membres. Multiplier ou diviser par un nombre positif conserve le sens ; par un nombre négatif, on change le sens. Les solutions s'écrivent avec des intervalles ; pour un système d'inéquations, on prend l'intersection des ensembles de solutions." },
      { type: 'propriete', titre: 'Signe de $ax + b$', texte: "Pour $a \\neq 0$, $ax + b$ s'annule en $x_0 = -\\dfrac{b}{a}$ ; il a le signe de $a$ pour $x > x_0$ et le signe contraire pour $x < x_0$. On résume ces résultats dans un tableau de signes, utile pour résoudre des inéquations comme $(ax + b)(cx + d) > 0$." },
      { type: 'definition', titre: 'Systèmes', texte: "Le système $\\begin{cases} ax + by = c \\\\ a'x + b'y = c' \\end{cases}$ se résout par substitution ou par combinaison. Si $ab' - a'b \\neq 0$, il admet un unique couple solution : les coordonnées du point d'intersection de deux droites." },
      { type: 'remarque', titre: 'Mise en équation', texte: "Toujours préciser l'inconnue choisie et son unité, vérifier que la solution trouvée a un sens (un nombre de personnes est un entier positif…) et répondre par une phrase." }
    ],
    methodes: [
      { titre: 'Résoudre une inéquation produit avec un tableau de signes', etapes: [
        "Trouver la valeur qui annule chaque facteur.",
        "Construire le tableau : une ligne par facteur, avec ces valeurs rangées dans l'ordre croissant.",
        "Remplir chaque ligne avec la règle « signe de $a$ à droite de la valeur qui annule ».",
        "En déduire le signe du produit (règle des signes) et lire les intervalles solutions."
      ] },
      { titre: 'Résoudre un problème avec un système', etapes: [
        "Choisir deux inconnues.",
        "Traduire l'énoncé par deux équations.",
        "Résoudre le système et vérifier.",
        "Conclure par une phrase."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\R$ l'inéquation $(x - 2)(-x + 5) \\geq 0$.",
      solution: [
        "$x - 2 = 0 \\iff x = 2$ et $-x + 5 = 0 \\iff x = 5$.",
        "$x - 2$ est négatif avant $2$ et positif après ($a = 1 > 0$) ; $-x + 5$ est positif avant $5$ et négatif après ($a = -1 < 0$).",
        "Le produit est négatif sur $]-\\infty \\,;\\, 2[$, positif sur $]2 \\,;\\, 5[$, négatif sur $]5 \\,;\\, +\\infty[$, et nul en $2$ et en $5$.",
        "Donc $S = [2 \\,;\\, 5]$."
      ]
    },
    erreurs: [
      "Oublier de changer le sens d'une inégalité en divisant par un nombre négatif.",
      "Dans un tableau de signes, oublier les zéros ou mal ranger les valeurs.",
      "Garder une valeur interdite comme solution d'une équation quotient."
    ],
    flashcards: [
      { q: "Signe de $ax + b$ à droite de la valeur qui l'annule", r: "Le signe de $a$" },
      { q: "Valeur qui annule $3x - 6$", r: "$x = 2$" },
      { q: "$AB = 0 \\iff ?$", r: "$A = 0$ ou $B = 0$" },
      { q: "Nombre de solutions d'un système si $ab' - a'b \\neq 0$", r: "Un unique couple" },
      { q: "Diviser une inégalité par $-2$", r: "On change le sens" }
    ],
    contexte: {
      titre: 'Légumes des Niayes',
      enonce: "Dans la zone des Niayes, Khady vend des oignons à $400$ F CFA le kilogramme et des carottes à $500$ F CFA le kilogramme. Un jour, elle a vendu $120$ kg de légumes pour $52\\,500$ F CFA.<br>1) Combien de kilogrammes de chaque légume a-t-elle vendus ?<br>2) Un autre jour, elle veut gagner au moins $70\\,000$ F CFA en vendant uniquement des carottes. Quelle quantité minimale doit-elle vendre ?",
      solution: [
        "1) Soit $x$ la masse d'oignons et $y$ celle de carottes (en kg) : $\\begin{cases} x + y = 120 \\\\ 400x + 500y = 52\\,500 \\end{cases}$",
        "Avec $x = 120 - y$ : $400(120 - y) + 500y = 52\\,500 \\iff 48\\,000 + 100y = 52\\,500 \\iff y = 45$, puis $x = 75$. Khady a vendu $75$ kg d'oignons et $45$ kg de carottes.",
        "2) $500q \\geq 70\\,000 \\iff q \\geq 140$ : elle doit vendre au moins $140$ kg de carottes."
      ]
    }
  };

  /* ================================================================== */
  /* 2nde L — FONCTIONS AFFINES ET LECTURE GRAPHIQUE                     */
  /* ================================================================== */
  EM.contenu['2l-fonctions'] = {
    resume: "Une fonction associe à chaque nombre $x$ un unique nombre $f(x)$. On étudie surtout les fonctions affines, dont la représentation graphique est une droite, et la lecture graphique d'images, d'antécédents et de solutions d'équations.",
    objectifs: [
      "Calculer une image et déterminer un antécédent, par le calcul ou graphiquement",
      "Reconnaître une fonction affine et déterminer son expression",
      "Représenter une fonction affine et lire son coefficient directeur et son ordonnée à l'origine",
      "Connaître le sens de variation d'une fonction affine selon le signe de $a$",
      "Résoudre graphiquement une équation $f(x) = g(x)$ ou une inéquation $f(x) < g(x)$"
    ],
    cours: [
      { type: 'definition', titre: 'Fonction, image, antécédent', texte: "Une fonction $f$ associe à tout nombre $x$ de son ensemble de définition un unique nombre $f(x)$, appelé <b>image</b> de $x$. Si $f(x) = y$, on dit que $x$ est un <b>antécédent</b> de $y$. La courbe représentative de $f$ est l'ensemble des points $M(x \\,;\\, f(x))$." },
      { type: 'definition', titre: 'Fonction affine', texte: "Une fonction affine est définie sur $\\R$ par $f(x) = ax + b$. Sa représentation graphique est la droite d'équation $y = ax + b$ : $b$ est l'ordonnée à l'origine et $a$ le coefficient directeur. Si $b = 0$, $f$ est linéaire (situation de proportionnalité)." },
      { type: 'propriete', titre: 'Coefficient directeur et variations', texte: "$a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$ pour $x_1 \\neq x_2$. Si $a > 0$, $f$ est croissante ; si $a < 0$, elle est décroissante ; si $a = 0$, elle est constante." },
      { type: 'propriete', titre: 'Résolution graphique', texte: "Les solutions de $f(x) = g(x)$ sont les abscisses des points d'intersection des courbes de $f$ et de $g$. Les solutions de $f(x) < g(x)$ sont les abscisses des points où la courbe de $f$ est strictement en dessous de celle de $g$." },
      { type: 'remarque', titre: 'Lire un graphique', texte: "Pour lire une image, on part de l'axe des abscisses ; pour lire un antécédent, on part de l'axe des ordonnées. Une lecture graphique donne en général une valeur approchée, à confirmer par le calcul quand c'est possible." }
    ],
    methodes: [
      { titre: "Lire graphiquement l'expression d'une fonction affine", etapes: [
        "Lire $b$ : l'ordonnée du point où la droite coupe l'axe des ordonnées.",
        "Choisir deux points de la droite à coordonnées entières.",
        "Calculer $a = \\dfrac{\\text{déplacement vertical}}{\\text{déplacement horizontal}}$ entre ces deux points.",
        "Écrire $f(x) = ax + b$ et vérifier avec un autre point."
      ] },
      { titre: 'Résoudre graphiquement $f(x) = k$', etapes: [
        "Tracer la droite horizontale d'équation $y = k$.",
        "Repérer ses points d'intersection avec la courbe de $f$.",
        "Lire leurs abscisses : ce sont les solutions."
      ] }
    ],
    exemple: {
      enonce: "Soit $f(x) = -\\dfrac{1}{2}x + 3$.<br>1) Calculer $f(4)$ et l'antécédent de $5$ par $f$.<br>2) En quels points la droite représentant $f$ coupe-t-elle les axes ?<br>3) Préciser le sens de variation de $f$.",
      solution: [
        "1) $f(4) = -\\dfrac{1}{2} \\times 4 + 3 = 1$. Et $-\\dfrac{1}{2}x + 3 = 5 \\iff -\\dfrac{1}{2}x = 2 \\iff x = -4$.",
        "2) Axe des ordonnées : au point $(0 \\,;\\, 3)$. Axe des abscisses : $f(x) = 0 \\iff x = 6$, au point $(6 \\,;\\, 0)$.",
        "3) $a = -\\dfrac{1}{2} < 0$ : $f$ est décroissante sur $\\R$."
      ]
    },
    erreurs: [
      "Confondre image et antécédent.",
      "Lire le coefficient directeur à l'envers (déplacement horizontal divisé par le déplacement vertical).",
      "Croire que toute droite représente une fonction linéaire : il faut qu'elle passe par l'origine."
    ],
    flashcards: [
      { q: "Image de $x$ par $f$", r: "$f(x)$" },
      { q: "Antécédent de $y$ par $f$", r: "Un nombre $x$ tel que $f(x) = y$" },
      { q: "Représentation graphique d'une fonction affine", r: "Une droite" },
      { q: "Où lit-on $b$ ?", r: "À l'intersection de la droite avec l'axe des ordonnées" },
      { q: "Une fonction affine est croissante si…", r: "$a > 0$" }
    ],
    contexte: {
      titre: "La facture d'électricité à Thiès",
      enonce: "Une compagnie d'électricité facture chaque mois une prime fixe de $1\\,500$ F CFA plus $110$ F CFA par kWh consommé (tarif fictif).<br>1) Exprimer le montant $f(x)$ de la facture pour $x$ kWh.<br>2) Calculer la facture pour $150$ kWh.<br>3) Une famille de Thiès a payé $23\\,500$ F CFA. Combien de kWh a-t-elle consommés ?<br>4) Décrire la représentation graphique de $f$ pour $x$ compris entre $0$ et $250$.",
      solution: [
        "1) $f(x) = 110x + 1\\,500$ : c'est une fonction affine.",
        "2) $f(150) = 110 \\times 150 + 1\\,500 = 18\\,000$ F CFA.",
        "3) $110x + 1\\,500 = 23\\,500 \\iff 110x = 22\\,000 \\iff x = 200$ kWh.",
        "4) C'est le segment de droite d'extrémités $(0 \\,;\\, 1\\,500)$ et $(250 \\,;\\, 29\\,000)$."
      ]
    }
  };

  /* ================================================================== */
  /* 2nde L — POURCENTAGES                                               */
  /* ================================================================== */
  EM.contenu['2l-pourcentages'] = {
    resume: "Les pourcentages décrivent des proportions et des évolutions : hausses, baisses, TVA, remises, taux de croissance. Le coefficient multiplicateur permet d'enchaîner des évolutions et de revenir à la valeur de départ.",
    objectifs: [
      "Calculer une proportion en pourcentage et appliquer un pourcentage",
      "Associer à une hausse ou à une baisse de $t$ % son coefficient multiplicateur",
      "Calculer un taux d'évolution entre deux valeurs",
      "Calculer l'effet d'évolutions successives et un taux d'évolution réciproque",
      "Utiliser les pourcentages dans la vie courante : TVA, remises, intérêts simples"
    ],
    cours: [
      { type: 'definition', titre: 'Proportion', texte: "La proportion d'une partie $A$ dans un ensemble $E$ est $p = \\dfrac{n_A}{n_E}$ ; en pourcentage, on calcule $p \\times 100$. Prendre $t$ % d'une quantité $Q$, c'est calculer $\\dfrac{t}{100} \\times Q$." },
      { type: 'formule', titre: 'Coefficient multiplicateur', texte: "Augmenter une valeur de $t$ % revient à la multiplier par $CM = 1 + \\dfrac{t}{100}$ ; la diminuer de $t$ % revient à la multiplier par $CM = 1 - \\dfrac{t}{100}$. Exemples : hausse de $18$ % : $\\times 1{,}18$ ; baisse de $25$ % : $\\times 0{,}75$." },
      { type: 'formule', titre: "Taux d'évolution", texte: "Si une valeur passe de $V_0$ à $V_1$, son taux d'évolution est $$t = \\dfrac{V_1 - V_0}{V_0} \\times 100 = \\left(\\dfrac{V_1}{V_0} - 1\\right) \\times 100.$$ Il est positif pour une hausse et négatif pour une baisse." },
      { type: 'propriete', titre: 'Évolutions successives', texte: "Le coefficient multiplicateur global de plusieurs évolutions successives est le <b>produit</b> des coefficients. Exemple : une hausse de $20$ % suivie d'une baisse de $20$ % donne $1{,}2 \\times 0{,}8 = 0{,}96$, soit une baisse de $4$ % : les pourcentages ne s'additionnent pas." },
      { type: 'propriete', titre: 'Évolution réciproque', texte: "Pour revenir à la valeur initiale après une évolution de coefficient $CM$, il faut multiplier par $\\dfrac{1}{CM}$. Après une hausse de $25$ % ($\\times 1{,}25$), il faut une baisse de $20$ % ($\\times 0{,}8$) pour revenir au départ." },
      { type: 'remarque', titre: 'La TVA', texte: "Au Sénégal, le taux normal de la TVA est de $18$ % : prix TTC $=$ prix HT $\\times 1{,}18$ et prix HT $= \\dfrac{\\text{prix TTC}}{1{,}18}$." }
    ],
    methodes: [
      { titre: 'Retrouver une valeur initiale', etapes: [
        "Identifier le coefficient multiplicateur de l'évolution.",
        "Écrire : valeur finale $=$ valeur initiale $\\times CM$.",
        "Diviser la valeur finale par $CM$ (et non appliquer le pourcentage « à l'envers »)."
      ] },
      { titre: "Calculer un taux d'évolution global", etapes: [
        "Écrire le coefficient multiplicateur de chaque évolution.",
        "Les multiplier pour obtenir le coefficient global.",
        "Traduire : taux global $= (CM - 1) \\times 100$."
      ] }
    ],
    exemple: {
      enonce: "Le prix du kilogramme de sucre a augmenté de $10$ % en janvier, puis de $5$ % en février ; il vaut alors $693$ F CFA.<br>1) Quel est le taux global d'augmentation ?<br>2) Quel était le prix avant ces hausses ?",
      solution: [
        "1) $CM = 1{,}1 \\times 1{,}05 = 1{,}155$ : c'est une hausse globale de $15{,}5$ % (et non de $15$ %).",
        "2) Prix initial : $\\dfrac{693}{1{,}155} = 600$ F CFA."
      ]
    },
    erreurs: [
      "Additionner des pourcentages successifs : une hausse de $10$ % puis de $5$ % ne fait pas $15$ %.",
      "Pour retrouver un prix avant une remise de $20$ %, ajouter $20$ % au prix payé : il faut diviser par $0{,}8$.",
      "Calculer un taux d'évolution en divisant par la valeur finale au lieu de la valeur initiale."
    ],
    flashcards: [
      { q: "Coefficient d'une hausse de $15$ %", r: "$1{,}15$" },
      { q: "Coefficient d'une baisse de $30$ %", r: "$0{,}7$" },
      { q: "Taux d'évolution de $V_0$ à $V_1$", r: "$\\dfrac{V_1 - V_0}{V_0} \\times 100$" },
      { q: "Hausse de $50$ % puis baisse de $50$ %", r: "$\\times 0{,}75$ : baisse de $25$ %" },
      { q: "Prix TTC avec une TVA de $18$ %", r: "Prix HT $\\times 1{,}18$" },
      { q: "Après une hausse de $25$ %, pour revenir au départ…", r: "il faut une baisse de $20$ %" }
    ],
    contexte: {
      titre: 'Épargner pour la Tabaski',
      enonce: "Ibrahima place $200\\,000$ F CFA dans une mutuelle d'épargne de Touba, à intérêts simples, au taux annuel de $6$ % (taux fictif).<br>1) Quels intérêts reçoit-il au bout d'un an ? Quel est alors son avoir ?<br>2) Il veut acheter un mouton à $150\\,000$ F CFA pour la Tabaski, mais le vendeur annonce une hausse de $8$ % avant la fête. Quel sera le nouveau prix ?<br>3) Quel pourcentage de son avoir l'achat du mouton représentera-t-il ?",
      solution: [
        "1) Intérêts : $200\\,000 \\times \\dfrac{6}{100} = 12\\,000$ F CFA ; son avoir est alors de $212\\,000$ F CFA.",
        "2) Nouveau prix : $150\\,000 \\times 1{,}08 = 162\\,000$ F CFA.",
        "3) $\\dfrac{162\\,000}{212\\,000} \\times 100 \\approx 76{,}4$ % : le mouton représentera environ $76$ % de son avoir."
      ]
    }
  };

  /* ================================================================== */
  /* 2nde L — STATISTIQUES                                               */
  /* ================================================================== */
  EM.contenu['2l-statistiques'] = {
    resume: "On organise des données en tableaux (effectifs, fréquences, cumuls), on les représente (diagrammes en bâtons, circulaires, histogrammes) et on les résume par des paramètres de position (mode, moyenne, médiane) et de dispersion (étendue).",
    objectifs: [
      "Calculer des effectifs, des fréquences (en %) et des effectifs cumulés",
      "Construire un diagramme en bâtons, un diagramme circulaire ou un histogramme",
      "Calculer la moyenne, déterminer le mode et la médiane",
      "Calculer l'étendue d'une série et comparer deux séries",
      "Interpréter des résultats statistiques dans un contexte"
    ],
    cours: [
      { type: 'definition', titre: 'Effectifs et fréquences', texte: "L'effectif $n_i$ d'une modalité est le nombre d'individus qui la présentent ; l'effectif total est $N = \\sum n_i$. La fréquence est $f_i = \\dfrac{n_i}{N}$ ; la somme des fréquences vaut $1$, soit $100$ %." },
      { type: 'formule', titre: 'Diagramme circulaire', texte: "Dans un diagramme circulaire, l'angle de chaque secteur est proportionnel à l'effectif : $$\\alpha_i = \\dfrac{n_i}{N} \\times 360^\\circ = f_i \\times 360^\\circ.$$" },
      { type: 'formule', titre: 'Moyenne et étendue', texte: "$\\bar{x} = \\dfrac{\\sum n_ix_i}{N} = \\sum f_ix_i$ ; pour des classes, on utilise les centres. L'<b>étendue</b> est la différence entre la plus grande et la plus petite valeur : elle mesure la dispersion de la série." },
      { type: 'definition', titre: 'Mode et médiane', texte: "Le mode est la valeur la plus fréquente. La médiane $Me$ partage la série ordonnée en deux parties de même effectif : au moins la moitié des valeurs sont inférieures ou égales à $Me$ et au moins la moitié sont supérieures ou égales à $Me$." },
      { type: 'remarque', titre: 'Moyenne ou médiane ?', texte: "La moyenne est sensible aux valeurs extrêmes, la médiane ne l'est pas : pour des salaires ou des revenus, la médiane est souvent plus représentative." }
    ],
    methodes: [
      { titre: 'Construire un diagramme circulaire', etapes: [
        "Calculer l'effectif total $N$.",
        "Calculer chaque angle $\\dfrac{n_i \\times 360}{N}$ et vérifier que leur somme fait $360^\\circ$.",
        "Tracer les secteurs au rapporteur, puis écrire la légende."
      ] },
      { titre: 'Comparer deux séries', etapes: [
        "Calculer pour chacune la moyenne et la médiane.",
        "Calculer les étendues.",
        "Conclure : deux séries de même moyenne peuvent être plus ou moins dispersées."
      ] }
    ],
    exemple: {
      enonce: "Dans un club de football de Rufisque, on a relevé l'âge des $20$ joueurs :<table class='em-tableau'><tr><th>Âge (ans)</th><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr><tr><th>Effectif</th><td>4</td><td>6</td><td>5</td><td>3</td><td>2</td></tr></table>Calculer la moyenne, la médiane, l'étendue, puis l'angle du secteur « 16 ans » dans un diagramme circulaire.",
      solution: [
        "Moyenne : $\\bar{x} = \\dfrac{15 \\times 4 + 16 \\times 6 + 17 \\times 5 + 18 \\times 3 + 19 \\times 2}{20} = \\dfrac{333}{20} = 16{,}65$ ans.",
        "Effectifs cumulés : $4$ ; $10$ ; $15$ ; $18$ ; $20$. Comme $N = 20$ est pair, la médiane est la moyenne des $10^{e}$ et $11^{e}$ valeurs, $16$ et $17$ : $Me = 16{,}5$ ans.",
        "Étendue : $19 - 15 = 4$ ans. Angle du secteur « 16 ans » : $\\dfrac{6}{20} \\times 360^\\circ = 108^\\circ$."
      ]
    },
    erreurs: [
      "Oublier de vérifier que la somme des angles fait $360^\\circ$ (ou que la somme des fréquences fait $100$ %).",
      "Chercher la médiane sans avoir ordonné les valeurs.",
      "Confondre effectif et fréquence."
    ],
    flashcards: [
      { q: "Fréquence en %", r: "$\\dfrac{n_i}{N} \\times 100$" },
      { q: "Angle d'un secteur circulaire", r: "$\\dfrac{n_i}{N} \\times 360^\\circ$" },
      { q: "Étendue", r: "Plus grande valeur moins plus petite valeur" },
      { q: "Médiane", r: "Valeur qui partage la série ordonnée en deux moitiés" },
      { q: "Paramètre insensible aux valeurs extrêmes", r: "La médiane" }
    ],
    contexte: {
      titre: 'Les pluies à Ziguinchor',
      enonce: "Voici la pluviométrie (en mm) relevée de juin à octobre par une station de Ziguinchor (valeurs fictives) : juin $120$ ; juillet $300$ ; août $450$ ; septembre $350$ ; octobre $130$.<br>1) Quel est le total des pluies sur la saison ?<br>2) Quelle part (en %) est tombée en août ?<br>3) Calculer la moyenne mensuelle et la médiane.",
      solution: [
        "1) Total : $120 + 300 + 450 + 350 + 130 = 1\\,350$ mm.",
        "2) $\\dfrac{450}{1\\,350} \\times 100 \\approx 33{,}3$ %, soit un tiers des pluies de la saison.",
        "3) Moyenne : $\\dfrac{1\\,350}{5} = 270$ mm. Valeurs ordonnées : $120$ ; $130$ ; $300$ ; $350$ ; $450$ : la médiane est $300$ mm."
      ]
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
