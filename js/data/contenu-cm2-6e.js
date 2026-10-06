/*
 * ELITE MATHÉMATIQUE — contenu pédagogique du CM2 (préparation au CFEE) et de la 6e.
 * Chaque chapitre : résumé, objectifs, cours, méthodes, exemple corrigé, erreurs fréquentes,
 * cartes de révision, problème « au Sénégal » et, parfois, un repère historique.
 * Les nombres des problèmes sont fictifs (mais plausibles).
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};
  EM.contenu = EM.contenu || {};

  /* ================================================================== */
  /* CM2                                                                 */
  /* ================================================================== */

  EM.contenu['cm2-numeration'] = {
    resume: "Lire, écrire, décomposer, comparer et ranger les nombres entiers jusqu'aux milliards grâce au tableau de numération.",
    objectifs: [
      "Lire et écrire en chiffres et en lettres les nombres entiers jusqu'aux milliards",
      "Distinguer « le chiffre des … » et « le nombre de … » (valeur de position)",
      "Décomposer un nombre selon ses classes et ses rangs",
      "Comparer, ranger et encadrer des nombres entiers",
      "Arrondir un nombre à la dizaine, à la centaine ou au millier près"
    ],
    cours: [
      { type: 'definition', titre: 'Chiffres et nombres', texte: "On écrit tous les nombres avec dix chiffres : 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. La valeur d'un chiffre dépend de sa place (son <b>rang</b>) dans le nombre : dans $3\\,303$, le premier 3 vaut $3\\,000$ et le dernier vaut 3." },
      { type: 'propriete', titre: 'Le tableau de numération', texte: "Les chiffres sont regroupés par trois à partir de la droite, en <b>classes</b> : classe des unités, des mille, des millions, des milliards. Chaque classe contient des unités, des dizaines et des centaines. Dix unités d'un rang valent une unité du rang situé juste à gauche.<br>Exemple : $4\\,735\\,206$ se lit « quatre millions sept cent trente-cinq mille deux cent six »." },
      { type: 'definition', titre: 'Chiffre des … et nombre de …', texte: "Dans $4\\,735\\,206$ : le <b>chiffre</b> des centaines est 2 ; le <b>nombre</b> de centaines est $47\\,352$ (on garde tous les chiffres jusqu'au rang des centaines, car $4\\,735\\,206 = 47\\,352 \\times 100 + 6$)." },
      { type: 'remarque', titre: 'Écrire les nombres en lettres', texte: "« Mille » est invariable : deux mille. « Cent » et « vingt » prennent un s quand ils sont multipliés et terminent le nombre : deux cents, quatre-vingts ; mais deux cent cinq, quatre-vingt-trois, deux cent mille. « Million » et « milliard » sont des noms : trois millions, deux milliards. En orthographe traditionnelle, on met un trait d'union entre les dizaines et les unités (sauf avec « et ») : trente-deux, vingt et un ; depuis la réforme de 1990, on peut aussi mettre des traits d'union partout." },
      { type: 'propriete', titre: 'Comparer et ranger', texte: "Le nombre qui a le plus de chiffres est le plus grand. S'ils ont autant de chiffres, on compare les chiffres de gauche à droite jusqu'au premier qui diffère : $98\\,765 < 102\\,345$ et $45\\,312 > 45\\,298$. Ordre croissant : du plus petit au plus grand." },
      { type: 'remarque', titre: 'Arrondir', texte: "Pour arrondir $4\\,735\\,206$ au millier près, on regarde le chiffre des centaines : il vaut 2, qui est inférieur à 5, donc l'arrondi est $4\\,735\\,000$. Si ce chiffre est 5, 6, 7, 8 ou 9, on prend le millier suivant." }
    ],
    methodes: [
      { titre: 'Écrire en chiffres un nombre donné en lettres', etapes: [
        "Repère les mots « milliard(s) », « million(s) » et « mille » : ils séparent les classes.",
        "Écris le nombre de chaque classe (de 1 à 999).",
        "Complète chaque classe, sauf la première, par des zéros pour qu'elle ait exactement trois chiffres.",
        "Relis le nombre obtenu à voix haute pour vérifier."
      ] },
      { titre: 'Trouver le nombre de dizaines, de centaines, de milliers', etapes: [
        "Écris le nombre en séparant bien les classes.",
        "Pour le nombre de dizaines, supprime le dernier chiffre ; de centaines, les deux derniers ; de milliers, les trois derniers.",
        "Vérifie : $4\\,735\\,206 = 4\\,735 \\times 1\\,000 + 206$ contient $4\\,735$ milliers."
      ] }
    ],
    exemple: {
      enonce: "Écrire en chiffres le nombre « deux millions trois cent mille quarante ». Donner ensuite son chiffre des dizaines de mille et son nombre de milliers.",
      solution: [
        "Classe des millions : 2 ; classe des mille : 300 ; classe des unités : 40, qui s'écrit 040 avec trois chiffres.",
        "Le nombre est $2\\,300\\,040$.",
        "Rangs à partir de la droite : unités 0, dizaines 4, centaines 0, unités de mille 0, dizaines de mille 0. Le chiffre des dizaines de mille est 0.",
        "Nombre de milliers : on supprime les trois derniers chiffres, on obtient $2\\,300$."
      ]
    },
    erreurs: [
      "Oublier les zéros d'une classe vide : « trois millions cinq cents » s'écrit $3\\,000\\,500$ et non $3\\,500$.",
      "Confondre le chiffre des centaines (un seul chiffre) et le nombre de centaines.",
      "Écrire « deux milles » ou « deux cents mille » : mille est invariable et cent ne prend pas de s devant mille.",
      "Croire qu'un nombre est plus grand parce que son premier chiffre est plus grand : $98\\,765 < 102\\,345$."
    ],
    flashcards: [
      { q: "Combien de chiffres faut-il pour écrire un million ?", r: "7 chiffres : $1\\,000\\,000$." },
      { q: "Un milliard, c'est combien de millions ?", r: "$1\\,000$ millions ($1\\,000\\,000\\,000$)." },
      { q: "Nombre de centaines de $58\\,437$ ?", r: "584" },
      { q: "Chiffre des centaines de $58\\,437$ ?", r: "4" },
      { q: "Écrire 80 en lettres.", r: "quatre-vingts (avec un s)" },
      { q: "Écrire $80\\,000$ en lettres.", r: "quatre-vingt mille (sans s)" },
      { q: "Arrondi de $67\\,850$ au millier près ?", r: "$68\\,000$" }
    ],
    contexte: {
      titre: "Le budget d'une commune",
      enonce: "Le conseil municipal d'une commune du Sénégal a voté un budget de $2\\,405\\,300\\,000$ F CFA. Écrire ce nombre en lettres, puis donner le nombre de millions qu'il contient et son arrondi au milliard près.",
      solution: [
        "Classes : 2 (milliards) | 405 (millions) | 300 (mille) | 000 (unités).",
        "En lettres : « deux milliards quatre cent cinq millions trois cent mille francs CFA ».",
        "Nombre de millions : on supprime les six derniers chiffres, soit $2\\,405$ millions.",
        "Arrondi au milliard : le chiffre des centaines de millions est 4, inférieur à 5, donc l'arrondi est $2\\,000\\,000\\,000$ F CFA, soit deux milliards."
      ]
    },
    histoire: "L'os d'Ishango, découvert en Afrique centrale (République démocratique du Congo, près du lac Édouard), porte des entailles groupées. Vieux d'environ 20 000 ans, c'est l'un des plus anciens objets de comptage connus."
  };

  EM.contenu['cm2-operations'] = {
    resume: "Poser et effectuer additions, soustractions, multiplications et divisions de nombres entiers, contrôler un résultat et choisir la bonne opération.",
    objectifs: [
      "Poser et effectuer une addition et une soustraction avec retenues",
      "Multiplier par un nombre de deux ou trois chiffres ; multiplier par 10, 100, 1 000",
      "Effectuer une division euclidienne (quotient et reste) et la vérifier",
      "Contrôler un résultat par un ordre de grandeur ou par une preuve",
      "Choisir l'opération qui convient dans un problème"
    ],
    cours: [
      { type: 'definition', titre: 'Vocabulaire', texte: "Le résultat d'une addition est une <b>somme</b>, celui d'une soustraction une <b>différence</b>, celui d'une multiplication un <b>produit</b>, celui d'une division un <b>quotient</b>. Dans $a \\times b$, les nombres $a$ et $b$ sont les facteurs." },
      { type: 'propriete', titre: 'Calculer astucieusement', texte: "On peut changer l'ordre des termes d'une somme ou des facteurs d'un produit : $4 \\times 37 \\times 25 = 4 \\times 25 \\times 37 = 100 \\times 37 = 3\\,700$. Multiplier par 10, 100 ou $1\\,000$, c'est écrire 1, 2 ou 3 zéros à droite d'un nombre entier : $47 \\times 100 = 4\\,700$." },
      { type: 'propriete', titre: 'La multiplication posée', texte: "On multiplie par chaque chiffre du multiplicateur (produits partiels), en décalant d'un rang à chaque fois, puis on additionne : $$347 \\times 26 = 347 \\times 6 + 347 \\times 20 = 2\\,082 + 6\\,940 = 9\\,022$$" },
      { type: 'definition', titre: 'La division euclidienne', texte: "Diviser $a$ par $b$ (avec $b \\neq 0$), c'est trouver le quotient $q$ et le reste $r$ tels que $$a = b \\times q + r \\quad \\text{avec} \\quad r < b$$ Exemple : $1\\,830 = 9 \\times 203 + 3$ ; le quotient est 203, le reste est 3." },
      { type: 'remarque', titre: 'Contrôler un résultat', texte: "Ordre de grandeur : $4\\,975 + 3\\,012 \\approx 5\\,000 + 3\\,000 = 8\\,000$. Preuve de la soustraction : différence + nombre retranché = premier nombre. Preuve de la division : $b \\times q + r = a$ et $r < b$." }
    ],
    methodes: [
      { titre: 'Effectuer une division euclidienne', etapes: [
        "Prends assez de chiffres à gauche du dividende pour qu'ils contiennent le diviseur ; cela te donne aussi le nombre de chiffres du quotient.",
        "Cherche combien de fois le diviseur y est contenu, multiplie, soustrais, puis abaisse le chiffre suivant.",
        "Si le nombre obtenu est plus petit que le diviseur, écris 0 au quotient et abaisse encore.",
        "Vérifie que le reste est plus petit que le diviseur et que $b \\times q + r = a$."
      ] },
      { titre: 'Choisir la bonne opération', etapes: [
        "On réunit, on ajoute : addition.",
        "On cherche un écart, un reste, ce qui manque : soustraction.",
        "On répète plusieurs fois la même quantité : multiplication.",
        "On partage en parts égales ou on cherche « combien de fois » : division."
      ] }
    ],
    exemple: {
      enonce: "Une école de Kolda commande 245 tables-bancs à $18\\,500$ F CFA l'une. Calculer la dépense et la contrôler par un ordre de grandeur.",
      solution: [
        "On répète 245 fois le même prix : c'est une multiplication.",
        "$18\\,500 \\times 245 = 18\\,500 \\times 5 + 18\\,500 \\times 40 + 18\\,500 \\times 200 = 92\\,500 + 740\\,000 + 3\\,700\\,000 = 4\\,532\\,500$.",
        "Ordre de grandeur : $20\\,000 \\times 250 = 5\\,000\\,000$, proche du résultat.",
        "La dépense est de $4\\,532\\,500$ F CFA."
      ]
    },
    erreurs: [
      "Aligner les nombres à gauche au lieu d'aligner les unités sous les unités.",
      "Oublier le décalage (le zéro) du produit partiel des dizaines dans une multiplication posée.",
      "Trouver un reste plus grand que le diviseur : le quotient est alors trop petit.",
      "Oublier un zéro au quotient : $1\\,830 \\div 9$ donne 203 et non 23."
    ],
    flashcards: [
      { q: "Comment s'appelle le résultat d'une multiplication ?", r: "un produit" },
      { q: "$47 \\times 100 = ?$", r: "$4\\,700$" },
      { q: "Dans $a = b \\times q + r$, quelle condition doit vérifier le reste ?", r: "$r < b$" },
      { q: "Preuve de $905 - 348 = 557$ ?", r: "$557 + 348 = 905$" },
      { q: "$25 \\times 4 = ?$", r: "100 (pratique pour calculer de tête)" },
      { q: "Quotient et reste de $100 \\div 7$ ?", r: "quotient 14, reste 2, car $100 = 7 \\times 14 + 2$" }
    ],
    contexte: {
      titre: 'Un voyage vers Touba',
      enonce: "Une association de Rufisque organise un voyage pour 300 personnes. Un car de 55 places se loue $175\\,000$ F CFA. Calculer le nombre de cars nécessaires, la dépense totale, puis la participation de chaque voyageur si la dépense est partagée également.",
      solution: [
        "Division euclidienne : $300 = 55 \\times 5 + 25$. Cinq cars ne suffisent pas (il reste 25 personnes) : il faut 6 cars.",
        "Dépense : $175\\,000 \\times 6 = 1\\,050\\,000$ F CFA.",
        "Participation : $1\\,050\\,000 \\div 300 = 3\\,500$ F CFA par personne.",
        "Vérification : $3\\,500 \\times 300 = 1\\,050\\,000$."
      ]
    },
    histoire: "Les signes + et − apparaissent dans un livre imprimé de l'Allemand Johannes Widmann en 1489 ; le signe = a été introduit par le Gallois Robert Recorde en 1557, sous la forme de deux traits parallèles de même longueur."
  };

  EM.contenu['cm2-fractions'] = {
    resume: "Comprendre une fraction comme un partage, calculer une fraction d'une quantité et passer des fractions décimales aux nombres décimaux.",
    objectifs: [
      "Lire, écrire et représenter une fraction (numérateur, dénominateur)",
      "Comparer une fraction à 1 et reconnaître des fractions égales",
      "Calculer une fraction d'une quantité",
      "Écrire une fraction décimale sous forme de nombre décimal et inversement",
      "Comparer, additionner et soustraire des nombres décimaux"
    ],
    cours: [
      { type: 'definition', titre: 'Fraction', texte: "Dans $\\dfrac{3}{4}$ (trois quarts), on partage l'unité en 4 parts égales (le <b>dénominateur</b>) et on en prend 3 (le <b>numérateur</b>)." },
      { type: 'propriete', titre: 'Fraction et unité', texte: "Si le numérateur est plus petit que le dénominateur, la fraction est inférieure à 1 ; s'ils sont égaux, elle vaut 1 ; sinon elle est supérieure à 1 : $\\dfrac{5}{5} = 1$ et $\\dfrac{7}{4} = 1 + \\dfrac{3}{4}$." },
      { type: 'formule', titre: "Fraction d'une quantité", texte: "Pour calculer les $\\dfrac{a}{b}$ d'une quantité, on la divise par $b$ puis on multiplie par $a$. Les $\\dfrac{3}{4}$ de $2\\,000$ F CFA : $2\\,000 \\div 4 \\times 3 = 1\\,500$ F CFA." },
      { type: 'definition', titre: 'Fractions décimales et nombres décimaux', texte: "Une fraction décimale a pour dénominateur 10, 100, $1\\,000$… : $\\dfrac{375}{100} = 3{,}75$ (3 unités, 7 dixièmes, 5 centièmes). La virgule sépare la partie entière de la partie décimale." },
      { type: 'propriete', titre: 'Fractions égales', texte: "On ne change pas une fraction en multipliant (ou en divisant) son numérateur et son dénominateur par un même nombre non nul : $\\dfrac{1}{2} = \\dfrac{5}{10} = 0{,}5$ et $\\dfrac{3}{4} = \\dfrac{75}{100} = 0{,}75$." },
      { type: 'remarque', titre: 'Comparer des décimaux', texte: "On compare les parties entières, puis les dixièmes, puis les centièmes : $2{,}9 > 2{,}15$ car 9 dixièmes est plus grand que 1 dixième." }
    ],
    methodes: [
      { titre: "Calculer une fraction d'une quantité", etapes: [
        "Divise la quantité par le dénominateur : tu obtiens la valeur d'une part.",
        "Multiplie cette part par le numérateur.",
        "Pour trouver ce qui reste, soustrais le résultat de la quantité (ou calcule la fraction restante)."
      ] },
      { titre: "Passer d'une fraction décimale à un nombre décimal", etapes: [
        "Écris le numérateur.",
        "Place la virgule en comptant, à partir de la droite, autant de chiffres qu'il y a de zéros au dénominateur.",
        "Complète par des zéros si nécessaire : $\\dfrac{7}{100} = 0{,}07$."
      ] }
    ],
    exemple: {
      enonce: "Awa a $4\\,500$ F CFA. Elle dépense les $\\dfrac{2}{5}$ de cette somme pour acheter des fleurs de bissap. Calculer la somme dépensée, puis la somme restante, et donner la fraction restante.",
      solution: [
        "Une part : $4\\,500 \\div 5 = 900$ F CFA.",
        "Somme dépensée : $900 \\times 2 = 1\\,800$ F CFA.",
        "Somme restante : $4\\,500 - 1\\,800 = 2\\,700$ F CFA.",
        "Il lui reste les $\\dfrac{3}{5}$ de sa somme, et en effet $900 \\times 3 = 2\\,700$."
      ]
    },
    erreurs: [
      "Diviser par le numérateur au lieu du dénominateur.",
      "Croire que $2{,}15 > 2{,}9$ parce que 15 est plus grand que 9.",
      "Écrire $\\dfrac{7}{100} = 0{,}7$ au lieu de $0{,}07$.",
      "Additionner les dénominateurs : $\\dfrac{1}{4} + \\dfrac{2}{4} = \\dfrac{3}{4}$ et non $\\dfrac{3}{8}$."
    ],
    flashcards: [
      { q: "Dans $\\dfrac{3}{4}$, que représente le 4 ?", r: "le dénominateur : l'unité est partagée en 4 parts égales" },
      { q: "Les $\\dfrac{3}{4}$ de 20 ?", r: "15" },
      { q: "$\\dfrac{75}{100}$ en écriture décimale ?", r: "$0{,}75$" },
      { q: "$0{,}5$ sous forme de fraction ?", r: "$\\dfrac{5}{10} = \\dfrac{1}{2}$" },
      { q: "Quand une fraction est-elle égale à 1 ?", r: "quand son numérateur est égal à son dénominateur" },
      { q: "Le plus grand : $3{,}8$ ou $3{,}75$ ?", r: "$3{,}8$" }
    ],
    contexte: {
      titre: 'Les mangues de Casamance',
      enonce: "Un verger de Ziguinchor produit $2\\,400$ mangues. On vend les $\\dfrac{3}{4}$ au marché, on garde le $\\dfrac{1}{6}$ pour la famille et on fait sécher le reste. Calculer le nombre de mangues de chaque partie, puis la fraction de la récolte qui est séchée.",
      solution: [
        "Vendues : $2\\,400 \\div 4 \\times 3 = 1\\,800$ mangues.",
        "Gardées : $2\\,400 \\div 6 = 400$ mangues.",
        "Séchées : $2\\,400 - 1\\,800 - 400 = 200$ mangues.",
        "Fraction séchée : $\\dfrac{200}{2\\,400} = \\dfrac{1}{12}$ de la récolte."
      ]
    },
    histoire: "Le papyrus Rhind, recopié en Égypte vers 1650 av. J.-C., montre que les scribes égyptiens calculaient surtout avec des fractions de numérateur 1 : ils écrivaient par exemple $\\dfrac{3}{4}$ sous la forme $\\dfrac{1}{2} + \\dfrac{1}{4}$."
  };

  EM.contenu['cm2-proportionnalite'] = {
    resume: "Reconnaître une situation de proportionnalité et la résoudre (passage par l'unité, règle de trois), calculer des pourcentages et des intérêts, utiliser les échelles.",
    objectifs: [
      "Reconnaître une situation de proportionnalité (tableau, coefficient)",
      "Calculer une quatrième proportionnelle par le passage à l'unité ou la règle de trois",
      "Calculer un pourcentage, une remise, une augmentation",
      "Calculer un intérêt simple",
      "Utiliser l'échelle d'un plan ou d'une carte"
    ],
    cours: [
      { type: 'definition', titre: 'Proportionnalité', texte: "Deux grandeurs sont proportionnelles si l'on passe de l'une à l'autre en multipliant toujours par le même nombre, le <b>coefficient de proportionnalité</b>. Le riz à 450 F CFA le kg : 2 kg coûtent 900 F CFA, 5 kg coûtent $2\\,250$ F CFA." },
      { type: 'propriete', titre: 'Passage par l’unité et règle de trois', texte: "Si 5 kg coûtent $2\\,250$ F CFA, alors 1 kg coûte $2\\,250 \\div 5 = 450$ F CFA et 8 kg coûtent $450 \\times 8 = 3\\,600$ F CFA. Directement : $\\dfrac{2\\,250 \\times 8}{5} = 3\\,600$." },
      { type: 'formule', titre: 'Pourcentage', texte: "Prendre $t\\,\\%$ d'une quantité $Q$, c'est calculer $Q \\times \\dfrac{t}{100}$. Remise de $20\\,\\%$ sur $15\\,000$ F CFA : $15\\,000 \\times 20 \\div 100 = 3\\,000$ F CFA ; on paie $12\\,000$ F CFA." },
      { type: 'formule', titre: 'Intérêt simple', texte: "Un capital $C$ placé au taux annuel de $t\\,\\%$ rapporte en un an $I = \\dfrac{C \\times t}{100}$ et en $n$ années $I = \\dfrac{C \\times t \\times n}{100}$." },
      { type: 'definition', titre: 'Échelle', texte: "Sur un plan à l'échelle $\\dfrac{1}{E}$, 1 cm représente $E$ cm dans la réalité. Distance réelle = distance sur le plan $\\times E$ (dans la même unité). Rappel : 1 km $= 100\\,000$ cm." }
    ],
    methodes: [
      { titre: 'Résoudre un problème de proportionnalité', etapes: [
        "Vérifie que les grandeurs sont proportionnelles (le prix double quand la quantité double…).",
        "Calcule la valeur correspondant à une unité.",
        "Multiplie par la quantité demandée.",
        "Contrôle avec un ordre de grandeur."
      ] },
      { titre: 'Utiliser une échelle', etapes: [
        "Exprime les longueurs en cm.",
        "Multiplie la longueur sur le plan par $E$ pour obtenir la longueur réelle (ou divise par $E$ dans l'autre sens).",
        "Convertis le résultat dans l'unité demandée (m, km)."
      ] }
    ],
    exemple: {
      enonce: "Sur une carte à l'échelle $\\dfrac{1}{200\\,000}$, deux villages de la région de Thiès sont à $4{,}5$ cm l'un de l'autre. Calculer la distance réelle en km.",
      solution: [
        "1 cm sur la carte représente $200\\,000$ cm.",
        "Distance réelle : $4{,}5 \\times 200\\,000 = 900\\,000$ cm.",
        "$900\\,000$ cm $= 9$ km (on divise par $100\\,000$)."
      ]
    },
    erreurs: [
      "Utiliser la proportionnalité quand elle n'existe pas (l'âge et la taille d'un enfant ne sont pas proportionnels).",
      "Oublier de convertir les longueurs dans la même unité avant d'utiliser l'échelle.",
      "Confondre le montant de la remise et le prix à payer.",
      "Diviser par le pourcentage au lieu de multiplier par $t$ puis diviser par 100."
    ],
    flashcards: [
      { q: "$10\\,\\%$ de $4\\,500$ ?", r: "450" },
      { q: "$50\\,\\%$ correspond à quelle fraction ?", r: "$\\dfrac{1}{2}$" },
      { q: "$25\\,\\%$ correspond à quelle fraction ?", r: "$\\dfrac{1}{4}$" },
      { q: "À l'échelle $\\dfrac{1}{100}$, que représente 1 cm ?", r: "100 cm, c'est-à-dire 1 m" },
      { q: "1 km = combien de cm ?", r: "$100\\,000$ cm" },
      { q: "3 cahiers coûtent 750 F CFA. Prix d'un cahier ?", r: "250 F CFA" },
      { q: "Intérêt d'un an de $100\\,000$ F CFA placés à $5\\,\\%$ ?", r: "$5\\,000$ F CFA" }
    ],
    contexte: {
      titre: 'Le mouton de Tabaski',
      enonce: "Pour la Tabaski, Ousmane choisit un mouton affiché à $120\\,000$ F CFA. Le vendeur lui accorde une remise de $15\\,\\%$. Ousmane paie aussi $5\\,000$ F CFA pour le transport. Calculer la remise, le prix du mouton après remise, puis la dépense totale.",
      solution: [
        "Remise : $120\\,000 \\times 15 \\div 100 = 18\\,000$ F CFA.",
        "Prix après remise : $120\\,000 - 18\\,000 = 102\\,000$ F CFA (c'est $85\\,\\%$ du prix affiché).",
        "Dépense totale : $102\\,000 + 5\\,000 = 107\\,000$ F CFA."
      ]
    }
  };

  EM.contenu['cm2-mesures'] = {
    resume: "Utiliser les unités de longueur, de masse, de capacité et de durée, convertir avec le tableau, calculer des horaires et des vitesses moyennes.",
    objectifs: [
      "Connaître les unités de longueur, de masse et de capacité et leurs relations",
      "Convertir à l'aide du tableau de conversion (nombres entiers et décimaux)",
      "Convertir des durées (h, min, s ; jours, semaines) et calculer un horaire",
      "Calculer une vitesse moyenne, une distance ou une durée",
      "Résoudre des problèmes de monnaie (F CFA)"
    ],
    cours: [
      { type: 'definition', titre: 'Unités de longueur', texte: "km, hm, dam, <b>m</b>, dm, cm, mm. Chaque unité vaut 10 fois l'unité immédiatement inférieure : 1 km $= 1\\,000$ m ; 1 m $= 100$ cm ; 1 cm $= 10$ mm." },
      { type: 'definition', titre: 'Unités de masse et de capacité', texte: "Masse : kg, hg, dag, <b>g</b>, dg, cg, mg ; 1 t (tonne) $= 1\\,000$ kg et 1 q (quintal) $= 100$ kg. Capacité : hL, daL, <b>L</b>, dL, cL, mL ; 1 L $= 100$ cL $= 1\\,000$ mL." },
      { type: 'propriete', titre: 'Durées', texte: "1 h $= 60$ min ; 1 min $= 60$ s ; 1 jour $= 24$ h ; 1 semaine $= 7$ jours. Les durées ne suivent pas la règle des 10 : 1 h 30 min $= 90$ min $= 1{,}5$ h." },
      { type: 'formule', titre: 'Vitesse moyenne', texte: "$$v = \\dfrac{d}{t} \\qquad d = v \\times t \\qquad t = \\dfrac{d}{v}$$ La durée $t$ est en heures si la vitesse est en km/h. Exemple : 150 km en 2 h 30 min, soit $2{,}5$ h : $v = 150 \\div 2{,}5 = 60$ km/h." },
      { type: 'remarque', titre: 'Le tableau de conversion', texte: "On écrit le nombre en plaçant son chiffre des unités dans la colonne de l'unité donnée, puis on lit le résultat dans la colonne demandée, en complétant par des zéros : $3{,}25$ km $= 3\\,250$ m ; 450 g $= 0{,}45$ kg." }
    ],
    methodes: [
      { titre: 'Convertir avec le tableau', etapes: [
        "Trace le tableau des unités (une colonne par unité).",
        "Place le chiffre des unités du nombre dans la colonne de l'unité de départ, puis un chiffre par colonne.",
        "Place la virgule juste après la colonne de l'unité d'arrivée et complète par des zéros si besoin."
      ] },
      { titre: "Calculer une heure d'arrivée ou une durée", etapes: [
        "Additionne (ou soustrais) les heures avec les heures et les minutes avec les minutes.",
        "Si tu obtiens 60 min ou plus, remplace 60 min par 1 h.",
        "Pour une soustraction impossible sur les minutes, transforme 1 h en 60 min."
      ] }
    ],
    exemple: {
      enonce: "Un car part à 7 h 45 min pour un trajet de 189 km qui dure 3 h 30 min. Calculer l'heure d'arrivée, puis la vitesse moyenne du car.",
      solution: [
        "7 h 45 min + 3 h 30 min = 10 h 75 min = 11 h 15 min.",
        "Durée en heures : 3 h 30 min $= 3{,}5$ h.",
        "Vitesse moyenne : $189 \\div 3{,}5 = 54$ km/h."
      ]
    },
    erreurs: [
      "Écrire 1 h 30 min $= 1{,}30$ h : c'est $1{,}5$ h.",
      "Oublier une colonne dans le tableau : $3{,}5$ km $= 3\\,500$ m et non 350 m.",
      "Soustraire des heures sans transformer 1 h en 60 min : de 8 h 40 min à 10 h 15 min, il s'écoule 1 h 35 min."
    ],
    flashcards: [
      { q: "1 km = combien de m ?", r: "$1\\,000$ m" },
      { q: "$2{,}5$ kg = combien de g ?", r: "$2\\,500$ g" },
      { q: "1 L = combien de cL ?", r: "100 cL" },
      { q: "1 h 15 min = combien de minutes ?", r: "75 min" },
      { q: "1 t = combien de kg ?", r: "$1\\,000$ kg" },
      { q: "Distance parcourue en 2 h à 60 km/h ?", r: "120 km" },
      { q: "45 min = combien d'heures ?", r: "$0{,}75$ h" }
    ],
    contexte: {
      titre: 'Une sortie de pêche à Kayar',
      enonce: "Une pirogue de Kayar part en mer à 5 h 40 min et rentre à 13 h 15 min. Elle débarque $2{,}4$ t de poisson, rangées dans des caisses de 40 kg. Calculer la durée de la sortie et le nombre de caisses remplies.",
      solution: [
        "13 h 15 min = 12 h 75 min ; 12 h 75 min − 5 h 40 min = 7 h 35 min.",
        "$2{,}4$ t $= 2\\,400$ kg.",
        "Nombre de caisses : $2\\,400 \\div 40 = 60$ caisses."
      ]
    },
    histoire: "Le mètre a été défini en France à la fin du XVIIIᵉ siècle, pendant la Révolution, comme la dix-millionième partie du quart d'un méridien terrestre. C'est le point de départ du système métrique, utilisé aujourd'hui au Sénégal comme dans la plupart des pays."
  };

  EM.contenu['cm2-perimetres-aires'] = {
    resume: "Calculer le périmètre et l'aire des figures usuelles (carré, rectangle, triangle, parallélogramme, losange, trapèze, cercle et disque) et utiliser les unités d'aire et les unités agraires.",
    objectifs: [
      "Calculer le périmètre d'un polygone, d'un carré, d'un rectangle et d'un cercle",
      "Calculer l'aire du carré, du rectangle, du triangle, du parallélogramme, du losange et du trapèze",
      "Calculer l'aire d'un disque",
      "Retrouver une dimension à partir du périmètre ou de l'aire",
      "Convertir les unités d'aire et les unités agraires (ha, a, ca)"
    ],
    cours: [
      { type: 'definition', titre: 'Périmètre et aire', texte: "Le <b>périmètre</b> est la longueur du contour d'une figure (en m, cm…). L'<b>aire</b> est la mesure de sa surface (en m², cm²…)." },
      { type: 'formule', titre: 'Carré et rectangle', texte: "Carré de côté $c$ : $P = c \\times 4$ et $A = c \\times c$.<br>Rectangle de longueur $L$ et de largeur $l$ : $P = (L + l) \\times 2$ et $A = L \\times l$." },
      { type: 'formule', titre: 'Triangle, parallélogramme, losange, trapèze', texte: "Triangle : $A = \\dfrac{b \\times h}{2}$. Parallélogramme : $A = b \\times h$. Losange : $A = \\dfrac{D \\times d}{2}$. Trapèze : $A = \\dfrac{(B + b) \\times h}{2}$. La hauteur $h$ est toujours perpendiculaire à la base." },
      { type: 'formule', titre: 'Cercle et disque', texte: "Avec $\\pi \\approx 3{,}14$ : périmètre du cercle $P = D \\times 3{,}14 = 2 \\times r \\times 3{,}14$ ; aire du disque $A = r \\times r \\times 3{,}14$." },
      { type: 'definition', titre: "Unités d'aire et unités agraires", texte: "1 m² $= 100$ dm² $= 10\\,000$ cm². Unités agraires : 1 ha (hectare) $= 100$ a $= 10\\,000$ m² ; 1 a (are) $= 100$ m² ; 1 ca (centiare) $= 1$ m²." }
    ],
    methodes: [
      { titre: "Calculer l'aire d'une figure composée", etapes: [
        "Découpe la figure en figures simples (rectangles, triangles…).",
        "Calcule l'aire de chaque morceau.",
        "Additionne les aires (ou soustrais l'aire d'un morceau enlevé)."
      ] },
      { titre: 'Retrouver une dimension', etapes: [
        "Carré : côté = périmètre ÷ 4.",
        "Rectangle : largeur = aire ÷ longueur, ou largeur = périmètre ÷ 2 − longueur.",
        "Vérifie en recalculant le périmètre ou l'aire."
      ] }
    ],
    exemple: {
      enonce: "Un champ rectangulaire de Kaffrine mesure 120 m sur 85 m. Calculer son aire en m² puis en ha, et la longueur de grillage nécessaire pour l'entourer.",
      solution: [
        "$A = 120 \\times 85 = 10\\,200$ m².",
        "$10\\,200$ m² $= 1{,}02$ ha (car 1 ha $= 10\\,000$ m²).",
        "$P = (120 + 85) \\times 2 = 410$ m de grillage."
      ]
    },
    erreurs: [
      "Confondre périmètre et aire, ou leurs unités (m et m²).",
      "Utiliser le côté oblique au lieu de la hauteur pour un parallélogramme ou un triangle.",
      "Oublier de diviser par 2 pour le triangle, le losange et le trapèze.",
      "Utiliser le diamètre au lieu du rayon dans $r \\times r \\times 3{,}14$."
    ],
    flashcards: [
      { q: "Aire du triangle ?", r: "$\\dfrac{b \\times h}{2}$" },
      { q: "Aire du losange ?", r: "$\\dfrac{D \\times d}{2}$" },
      { q: "Aire du trapèze ?", r: "$\\dfrac{(B + b) \\times h}{2}$" },
      { q: "Périmètre d'un cercle de diamètre 10 cm ?", r: "$31{,}4$ cm" },
      { q: "1 ha = combien de m² ?", r: "$10\\,000$ m²" },
      { q: "Aire d'un disque de rayon 2 m ?", r: "$12{,}56$ m²" },
      { q: "Périmètre d'un rectangle de 8 m sur 5 m ?", r: "26 m" }
    ],
    contexte: {
      titre: 'Le jardin maraîcher des femmes de Thiès',
      enonce: "Un groupement de femmes exploite un jardin rectangulaire de 60 m sur 45 m. Elles l'entourent de 3 rangées de fil de fer à 250 F CFA le mètre. Calculer le périmètre, la dépense pour le fil, puis l'aire du jardin en ares.",
      solution: [
        "Périmètre : $(60 + 45) \\times 2 = 210$ m.",
        "Fil : $210 \\times 3 = 630$ m ; dépense : $630 \\times 250 = 157\\,500$ F CFA.",
        "Aire : $60 \\times 45 = 2\\,700$ m² $= 27$ a."
      ]
    },
    histoire: "Selon l'historien grec Hérodote (Vᵉ siècle av. J.-C.), la géométrie serait née en Égypte : après chaque crue du Nil, il fallait mesurer de nouveau les champs pour partager les terres et calculer l'impôt."
  };

  EM.contenu['cm2-geometrie'] = {
    resume: "Reconnaître, décrire et tracer les figures planes usuelles, reconnaître les solides (cube, pavé droit, cylindre…) et calculer le volume d'un cube et d'un pavé droit.",
    objectifs: [
      "Utiliser le vocabulaire : droite, segment, droites parallèles, droites perpendiculaires, angle droit",
      "Reconnaître et décrire carré, rectangle, losange, parallélogramme, trapèze, triangles particuliers et cercle",
      "Tracer ces figures avec la règle, l'équerre et le compas",
      "Reconnaître le cube, le pavé droit, le cylindre ; compter leurs faces, arêtes et sommets",
      "Calculer le volume d'un cube et d'un pavé droit ; relier dm³ et litre",
      "Reconnaître un axe de symétrie"
    ],
    cours: [
      { type: 'definition', titre: 'Droites parallèles et perpendiculaires', texte: "Deux droites <b>perpendiculaires</b> se coupent en formant un angle droit (on le vérifie avec l'équerre). Deux droites <b>parallèles</b> ne se coupent jamais : l'écart entre elles reste toujours le même." },
      { type: 'definition', titre: 'Les quadrilatères', texte: "Carré : 4 côtés égaux et 4 angles droits. Rectangle : 4 angles droits, côtés opposés égaux. Losange : 4 côtés égaux. Parallélogramme : côtés opposés parallèles. Trapèze : deux côtés parallèles, appelés les bases." },
      { type: 'definition', titre: 'Triangles et cercle', texte: "Triangle isocèle : 2 côtés égaux ; équilatéral : 3 côtés égaux ; rectangle : un angle droit. Tous les points d'un cercle sont à la même distance du centre : c'est le rayon ; le diamètre mesure deux rayons." },
      { type: 'definition', titre: 'Les solides', texte: "Le cube a 6 faces carrées identiques ; le pavé droit a 6 faces rectangulaires. Tous deux ont 12 arêtes et 8 sommets. Le cylindre a deux bases en forme de disque." },
      { type: 'formule', titre: 'Volumes', texte: "Cube d'arête $a$ : $V = a \\times a \\times a$. Pavé droit : $V = L \\times l \\times h$.<br>1 m³ $= 1\\,000$ dm³ ; 1 dm³ $= 1$ L ; 1 cm³ $= 1$ mL ; donc 1 m³ $= 1\\,000$ L." },
      { type: 'remarque', titre: 'Axes de symétrie', texte: "Une droite est un axe de symétrie d'une figure si, en pliant la figure le long de cette droite, les deux moitiés se superposent. Le carré a 4 axes de symétrie, le rectangle et le losange en ont 2, le cercle une infinité." }
    ],
    methodes: [
      { titre: "Calculer le volume et la capacité d'un récipient en forme de pavé", etapes: [
        "Exprime les trois dimensions dans la même unité.",
        "Multiplie longueur, largeur et hauteur.",
        "Convertis : 1 dm³ = 1 L et 1 m³ = 1 000 L."
      ] },
      { titre: 'Tracer un rectangle de 6 cm sur 4 cm', etapes: [
        "Trace un segment [AB] de 6 cm.",
        "Avec l'équerre, trace les perpendiculaires à [AB] en A et en B.",
        "Reporte 4 cm sur chacune pour placer D et C, puis trace [DC].",
        "Vérifie que DC = 6 cm et que les diagonales ont la même longueur."
      ] }
    ],
    exemple: {
      enonce: "Une citerne en forme de pavé droit mesure 2 m de long, $1{,}5$ m de large et 1 m de haut. Calculer son volume, sa capacité en litres, puis le nombre de seaux de 10 L nécessaires pour la remplir.",
      solution: [
        "$V = 2 \\times 1{,}5 \\times 1 = 3$ m³.",
        "Capacité : $3 \\times 1\\,000 = 3\\,000$ L.",
        "Nombre de seaux : $3\\,000 \\div 10 = 300$ seaux."
      ]
    },
    erreurs: [
      "Confondre les arêtes (les « bords ») et les faces d'un solide.",
      "Multiplier des dimensions exprimées dans des unités différentes (m et cm).",
      "Croire qu'un carré n'est pas un rectangle : c'est un rectangle particulier (et un losange particulier).",
      "Écrire 1 m³ = 100 L : en réalité 1 m³ = 1 000 L."
    ],
    flashcards: [
      { q: "Nombre de faces d'un cube ?", r: "6" },
      { q: "Nombre d'arêtes d'un pavé droit ?", r: "12" },
      { q: "Nombre de sommets d'un pavé droit ?", r: "8" },
      { q: "Volume d'un cube de 3 cm d'arête ?", r: "27 cm³" },
      { q: "1 dm³ = combien de litres ?", r: "1 L" },
      { q: "Nombre d'axes de symétrie d'un rectangle (non carré) ?", r: "2" },
      { q: "Un triangle qui a 3 côtés égaux est…", r: "équilatéral" }
    ],
    contexte: {
      titre: 'Le grenier à mil',
      enonce: "Le grenier d'une famille de Diourbel a la forme d'un pavé droit de 3 m sur 2 m sur $1{,}5$ m. Calculer son volume. On suppose que 1 m³ de mil pèse 700 kg : quelle masse de mil contient le grenier plein ?",
      solution: [
        "$V = 3 \\times 2 \\times 1{,}5 = 9$ m³.",
        "Masse : $9 \\times 700 = 6\\,300$ kg, soit $6{,}3$ t."
      ]
    }
  };

  EM.contenu['cm2-problemes'] = {
    resume: "Lire et analyser un énoncé, organiser les données et résoudre les problèmes types du CFEE : achat et vente, moyenne, partages, proportionnalité, mesures.",
    objectifs: [
      "Lire un énoncé, repérer les données utiles et la question",
      "Organiser la résolution en étapes et rédiger chaque calcul avec une phrase-réponse",
      "Résoudre des problèmes d'achat et de vente (prix de revient, bénéfice, perte)",
      "Calculer une moyenne et résoudre des problèmes de partages égaux et inégaux",
      "Contrôler la vraisemblance d'un résultat"
    ],
    cours: [
      { type: 'definition', titre: 'Achat et vente', texte: "Prix de revient = prix d'achat + frais (transport, réparation…).<br>Si le prix de vente est plus grand : bénéfice = prix de vente − prix de revient.<br>Sinon : perte = prix de revient − prix de vente." },
      { type: 'formule', titre: 'Moyenne', texte: "Moyenne = somme des valeurs ÷ nombre de valeurs. Notes 6, 8, 7 et 9 : $(6 + 8 + 7 + 9) \\div 4 = 30 \\div 4 = 7{,}5$." },
      { type: 'propriete', titre: 'Partage connaissant la somme et la différence', texte: "Petite part = (somme − différence) ÷ 2 ; grande part = petite part + différence. Exemple : somme $5\\,000$, différence $1\\,000$ : petite part $(5\\,000 - 1\\,000) \\div 2 = 2\\,000$, grande part $3\\,000$." },
      { type: 'propriete', titre: 'Partage en parts inégales', texte: "Si A reçoit 1 part et B le triple de A, il y a $1 + 3 = 4$ parts en tout : une part vaut la somme divisée par 4." },
      { type: 'remarque', titre: 'Bien rédiger', texte: "Pour chaque étape : une phrase qui dit ce que l'on calcule, l'opération, puis une phrase-réponse avec l'unité. Vérifie toujours que le résultat est vraisemblable." }
    ],
    methodes: [
      { titre: 'Résoudre un problème en plusieurs étapes', etapes: [
        "Lis l'énoncé deux fois ; souligne les données utiles et entoure la question.",
        "Cherche les questions intermédiaires (ce qu'il faut calculer d'abord).",
        "Effectue les calculs dans l'ordre, chacun avec sa phrase-réponse.",
        "Vérifie l'unité et la vraisemblance du résultat."
      ] },
      { titre: 'Partager connaissant la somme et la différence', etapes: [
        "Retire la différence de la somme : il reste deux parts égales.",
        "Divise par 2 : tu obtiens la petite part.",
        "Ajoute la différence : tu obtiens la grande part ; vérifie que les deux parts redonnent la somme."
      ] }
    ],
    exemple: {
      enonce: "Un commerçant de Touba achète 20 sacs de riz à $13\\,500$ F CFA le sac et paie $15\\,000$ F CFA de transport. Il revend chaque sac $15\\,000$ F CFA. Calculer le prix de revient, le prix de vente total et le bénéfice.",
      solution: [
        "Prix d'achat : $13\\,500 \\times 20 = 270\\,000$ F CFA.",
        "Prix de revient : $270\\,000 + 15\\,000 = 285\\,000$ F CFA.",
        "Prix de vente : $15\\,000 \\times 20 = 300\\,000$ F CFA.",
        "Bénéfice : $300\\,000 - 285\\,000 = 15\\,000$ F CFA."
      ]
    },
    erreurs: [
      "Oublier les frais dans le prix de revient.",
      "Diviser la somme par 2 sans retirer d'abord la différence.",
      "Oublier une valeur dans le calcul d'une moyenne : une note de 0 compte aussi !",
      "Donner une réponse sans unité ou invraisemblable (un élève de 250 kg, un trajet à pied de 3 minutes pour 20 km…)."
    ],
    flashcards: [
      { q: "Prix de revient = ?", r: "prix d'achat + frais" },
      { q: "Bénéfice = ?", r: "prix de vente − prix de revient" },
      { q: "Moyenne de 12, 15 et 18 ?", r: "15" },
      { q: "Somme 50, différence 10 : petite part ?", r: "20" },
      { q: "B a le double de A et le total est 90 : part de A ?", r: "30" },
      { q: "Quand y a-t-il une perte ?", r: "quand le prix de vente est inférieur au prix de revient" }
    ],
    contexte: {
      titre: 'La tontine des femmes de Kaolack',
      enonce: "Dans une tontine, 12 femmes cotisent chacune $5\\,000$ F CFA par mois ; chaque mois, l'une d'elles reçoit toute la cagnotte. Ce mois-ci, Fatou la reçoit : elle achète 3 sacs de mil à $15\\,000$ F CFA le sac, paie $2\\,000$ F CFA de transport et revend le mil transformé (araw) pour $62\\,000$ F CFA. Calculer la cagnotte, le prix de revient du mil et le bénéfice de Fatou.",
      solution: [
        "Cagnotte : $5\\,000 \\times 12 = 60\\,000$ F CFA.",
        "Prix d'achat : $15\\,000 \\times 3 = 45\\,000$ F CFA ; prix de revient : $45\\,000 + 2\\,000 = 47\\,000$ F CFA.",
        "Bénéfice : $62\\,000 - 47\\,000 = 15\\,000$ F CFA (il lui reste en plus $60\\,000 - 47\\,000 = 13\\,000$ F CFA de la cagnotte)."
      ]
    },
    histoire: "Le papyrus Rhind (Égypte, vers 1650 av. J.-C.) contient déjà des problèmes de partage : les premiers demandent de partager quelques pains entre dix hommes."
  };

  /* ================================================================== */
  /* 6e                                                                  */
  /* ================================================================== */

  EM.contenu['6e-entiers'] = {
    resume: "Écrire, comparer, ranger et encadrer les entiers naturels, utiliser les propriétés des opérations, la division euclidienne et les priorités de calcul.",
    objectifs: [
      "Lire et écrire les entiers naturels ; connaître la valeur de chaque chiffre selon son rang",
      "Comparer, ranger, encadrer et arrondir des entiers ; les placer sur une demi-droite graduée",
      "Utiliser les propriétés de l'addition et de la multiplication pour calculer astucieusement",
      "Effectuer une division euclidienne et utiliser l'égalité $a = b \\times q + r$",
      "Respecter les priorités opératoires dans un enchaînement de calculs"
    ],
    cours: [
      { type: 'definition', titre: 'Entiers naturels', texte: "Les nombres 0, 1, 2, 3, … sont les <b>entiers naturels</b> ; leur ensemble se note $\\N$. Tout entier $n$ a un successeur $n + 1$ ; tout entier non nul a un prédécesseur $n - 1$." },
      { type: 'propriete', titre: 'Demi-droite graduée et comparaison', texte: "Sur une demi-droite graduée régulièrement à partir de l'origine O (qui correspond à 0), chaque entier est repéré par un point : plus le nombre est grand, plus le point est loin de O. On écrit $1\\,999 < 2\\,001$." },
      { type: 'propriete', titre: 'Propriétés des opérations', texte: "L'ordre des termes d'une somme et des facteurs d'un produit peut être changé, et on peut les regrouper. Distributivité : $a \\times (b + c) = a \\times b + a \\times c$.<br>Exemples : $25 \\times 37 \\times 4 = 100 \\times 37 = 3\\,700$ ; $13 \\times 99 = 13 \\times 100 - 13 = 1\\,287$." },
      { type: 'definition', titre: 'Division euclidienne', texte: "Pour deux entiers $a$ et $b$ ($b \\neq 0$), il existe un seul couple d'entiers $(q ; r)$ tel que $$a = b \\times q + r \\quad \\text{et} \\quad r < b$$ $q$ est le quotient, $r$ le reste. Si $r = 0$, on dit que $b$ divise $a$." },
      { type: 'propriete', titre: 'Priorités opératoires', texte: "On effectue d'abord les calculs entre parenthèses (les plus intérieures d'abord), puis les multiplications et les divisions, enfin les additions et les soustractions ; à priorité égale, on calcule de gauche à droite.<br>$5 + 3 \\times 4 = 17$ mais $(5 + 3) \\times 4 = 32$." }
    ],
    methodes: [
      { titre: 'Calculer en respectant les priorités', etapes: [
        "Repère les parenthèses et calcule d'abord leur contenu.",
        "Effectue ensuite les multiplications et les divisions.",
        "Termine par les additions et les soustractions, de gauche à droite.",
        "Recopie à chaque étape tout ce qui n'a pas encore été calculé."
      ] },
      { titre: 'Encadrer et arrondir un entier', etapes: [
        "Pour encadrer au millier, écris le millier inférieur et le millier supérieur : $47\\,000 < 47\\,386 < 48\\,000$.",
        "Pour arrondir, regarde le chiffre juste à droite du rang demandé : 0 à 4 → on garde le nombre inférieur ; 5 à 9 → on prend le supérieur.",
        "Ici le chiffre des centaines est 3 : l'arrondi au millier de $47\\,386$ est $47\\,000$."
      ] }
    ],
    exemple: {
      enonce: "Calculer $A = 120 - 4 \\times (18 - 3 \\times 5)$.",
      solution: [
        "Dans la parenthèse, la multiplication d'abord : $3 \\times 5 = 15$, puis $18 - 15 = 3$.",
        "$A = 120 - 4 \\times 3$ : la multiplication est prioritaire, $4 \\times 3 = 12$.",
        "$A = 120 - 12 = 108$."
      ]
    },
    erreurs: [
      "Calculer de gauche à droite sans tenir compte des priorités : $5 + 3 \\times 4$ vaut 17, pas 32.",
      "Donner un reste plus grand que le diviseur dans une division euclidienne.",
      "Confondre « chiffre » et « nombre » (le chiffre des centaines, le nombre de centaines).",
      "Oublier que 0 est un entier naturel."
    ],
    flashcards: [
      { q: "Le plus petit entier naturel ?", r: "0" },
      { q: "$5 + 3 \\times 4 = ?$", r: "17" },
      { q: "$(5 + 3) \\times 4 = ?$", r: "32" },
      { q: "$47 = 6 \\times 7 + 5$ : quotient et reste de 47 par 6 ?", r: "quotient 7, reste 5" },
      { q: "$13 \\times 99$ de tête ?", r: "$1\\,300 - 13 = 1\\,287$" },
      { q: "Successeur de $999\\,999$ ?", r: "$1\\,000\\,000$" }
    ],
    contexte: {
      titre: 'La rentrée au collège de Tambacounda',
      enonce: "Un collège de Tambacounda accueille $1\\,147$ élèves. On forme des classes de 55 élèves au plus. Combien faut-il de classes au minimum ? On commande ensuite 3 cahiers par élève, vendus par paquets de 10 : combien de paquets faut-il acheter ?",
      solution: [
        "$1\\,147 = 55 \\times 20 + 47$ : 20 classes pleines ne suffisent pas, il reste 47 élèves. Il faut au moins 21 classes.",
        "Cahiers : $3 \\times 1\\,147 = 3\\,441$.",
        "$3\\,441 = 10 \\times 344 + 1$ : 344 paquets ne suffisent pas, il faut 345 paquets."
      ]
    },
    histoire: "Nos chiffres, appelés « chiffres indo-arabes », ont été inventés en Inde, avec le zéro et la numération de position. Au IXᵉ siècle, le savant al-Khwârizmî les a fait connaître dans le monde arabe, d'où ils sont passés en Europe."
  };

  EM.contenu['6e-decimaux'] = {
    resume: "Comprendre l'écriture décimale, passer des fractions décimales aux décimaux, comparer, ranger, encadrer et arrondir des nombres décimaux.",
    objectifs: [
      "Connaître la valeur de chaque chiffre d'un nombre décimal (dixièmes, centièmes, millièmes)",
      "Passer d'une fraction décimale à l'écriture décimale et inversement",
      "Comparer et ranger des nombres décimaux ; les repérer sur une demi-droite graduée",
      "Encadrer un décimal et en donner une valeur approchée (troncature, arrondi)",
      "Intercaler un nombre décimal entre deux autres"
    ],
    cours: [
      { type: 'definition', titre: 'Nombre décimal', texte: "Un nombre décimal peut s'écrire sous la forme d'une fraction décimale : $23{,}45 = \\dfrac{2\\,345}{100}$. Il a une partie entière (23) et une partie décimale (45 centièmes). Un entier est aussi un décimal : $7 = 7{,}0$." },
      { type: 'propriete', titre: 'Valeur des chiffres', texte: "$\\dfrac{1}{10} = 0{,}1$ (un dixième), $\\dfrac{1}{100} = 0{,}01$ (un centième), $\\dfrac{1}{1\\,000} = 0{,}001$ (un millième). Dans $305{,}276$ : 2 dixièmes, 7 centièmes, 6 millièmes. On peut ajouter ou supprimer des zéros à la fin de la partie décimale : $4{,}50 = 4{,}5$." },
      { type: 'propriete', titre: 'Comparer deux décimaux', texte: "On compare d'abord les parties entières ; si elles sont égales, on compare les dixièmes, puis les centièmes, etc. $12{,}9 > 12{,}87$ car 9 dixièmes est plus grand que 8 dixièmes." },
      { type: 'definition', titre: 'Encadrement et valeurs approchées', texte: "$7{,}38 < 7{,}384 < 7{,}39$ est un encadrement au centième. $7{,}38$ est la valeur approchée par défaut au centième (on dit aussi troncature), $7{,}39$ la valeur approchée par excès." },
      { type: 'propriete', titre: 'Arrondi', texte: "Pour arrondir à un rang, on regarde le chiffre suivant : 0, 1, 2, 3 ou 4 → valeur par défaut ; 5, 6, 7, 8 ou 9 → valeur par excès. L'arrondi au dixième de $12{,}46$ est $12{,}5$ ; celui de $12{,}43$ est $12{,}4$." },
      { type: 'remarque', titre: 'Intercaler', texte: "Entre deux décimaux différents, il y a toujours d'autres décimaux : entre $3{,}4$ et $3{,}5$ on trouve $3{,}45$, $3{,}41$, $3{,}499$…" }
    ],
    methodes: [
      { titre: 'Ranger des décimaux', etapes: [
        "Écris tous les nombres avec le même nombre de chiffres après la virgule (en ajoutant des zéros).",
        "Compare d'abord les parties entières, puis les parties décimales comme des entiers.",
        "Écris le rangement avec le symbole < (ordre croissant) ou > (ordre décroissant)."
      ] },
      { titre: 'Arrondir au dixième', etapes: [
        "Repère le chiffre des dixièmes et celui des centièmes qui le suit.",
        "Si le chiffre des centièmes est 5 ou plus, augmente d'un dixième ; sinon garde le dixième.",
        "Supprime les chiffres qui suivent les dixièmes."
      ] }
    ],
    exemple: {
      enonce: "Ranger dans l'ordre croissant : $4{,}7$ ; $4{,}061$ ; $4{,}61$ ; $4{,}688$. Arrondir ensuite $4{,}688$ au centième.",
      solution: [
        "Avec trois décimales : $4{,}700$ ; $4{,}061$ ; $4{,}610$ ; $4{,}688$.",
        "Ordre croissant : $4{,}061 < 4{,}61 < 4{,}688 < 4{,}7$.",
        "Dans $4{,}688$, le chiffre qui suit les centièmes est 8, qui est au moins 5 : l'arrondi au centième est $4{,}69$."
      ]
    },
    erreurs: [
      "Croire que $2{,}15 > 2{,}9$ en comparant « 15 » et « 9 ».",
      "Écrire $0{,}07 = \\dfrac{7}{10}$ : c'est $\\dfrac{7}{100}$.",
      "Arrondir en regardant le mauvais chiffre : l'arrondi au dixième de $3{,}46$ est $3{,}5$.",
      "Oublier un zéro intercalé : $3 + \\dfrac{5}{100} = 3{,}05$ et non $3{,}5$."
    ],
    flashcards: [
      { q: "$\\dfrac{3}{100}$ en écriture décimale ?", r: "$0{,}03$" },
      { q: "Chiffre des centièmes de $8{,}357$ ?", r: "5" },
      { q: "Le plus grand : $0{,}8$ ou $0{,}79$ ?", r: "$0{,}8$" },
      { q: "Arrondi au dixième de $6{,}45$ ?", r: "$6{,}5$" },
      { q: "Troncature au centième de $2{,}718$ ?", r: "$2{,}71$" },
      { q: "Un décimal compris entre $1{,}2$ et $1{,}3$ ?", r: "par exemple $1{,}25$" }
    ],
    contexte: {
      titre: 'Le saut en longueur au tournoi scolaire de Saint-Louis',
      enonce: "Cinq élèves ont réalisé ces sauts : Aminata $3{,}48$ m ; Babacar $3{,}5$ m ; Khady $3{,}09$ m ; Lamine $3{,}45$ m ; Coumba $3{,}8$ m. Classer les sauts du plus court au plus long, puis arrondir chaque saut au dixième.",
      solution: [
        "Avec deux décimales : $3{,}48$ ; $3{,}50$ ; $3{,}09$ ; $3{,}45$ ; $3{,}80$.",
        "Classement : $3{,}09 < 3{,}45 < 3{,}48 < 3{,}5 < 3{,}8$ : Khady, Lamine, Aminata, Babacar puis Coumba, qui gagne.",
        "Arrondis au dixième : Aminata $3{,}5$ ; Babacar $3{,}5$ ; Khady $3{,}1$ ; Lamine $3{,}5$ ; Coumba $3{,}8$."
      ]
    },
    histoire: "En 1585, le mathématicien flamand Simon Stevin publie « La Disme », un petit livre qui montre comment calculer avec les nombres décimaux aussi facilement qu'avec les entiers ; il a beaucoup contribué à leur diffusion."
  };

  EM.contenu['6e-operations'] = {
    resume: "Additionner, soustraire, multiplier et diviser des nombres décimaux, multiplier ou diviser par 10, 100, 1 000 ou par 0,1 ; 0,01 ; 0,001, et contrôler par un ordre de grandeur.",
    objectifs: [
      "Additionner et soustraire des décimaux en alignant les virgules",
      "Multiplier deux nombres décimaux",
      "Multiplier et diviser par 10, 100, 1 000 et par 0,1 ; 0,01 ; 0,001",
      "Diviser un décimal par un entier ; calculer un quotient décimal exact ou approché",
      "Utiliser un ordre de grandeur pour contrôler un résultat"
    ],
    cours: [
      { type: 'propriete', titre: 'Addition et soustraction', texte: "On pose l'opération en alignant les virgules (les unités sous les unités) et on complète par des zéros si besoin : $12{,}5 + 3{,}75 = 12{,}50 + 3{,}75 = 16{,}25$." },
      { type: 'propriete', titre: 'Multiplication de deux décimaux', texte: "On multiplie sans tenir compte des virgules, puis on place la virgule pour que le produit ait autant de chiffres après la virgule que les deux facteurs réunis.<br>$2{,}18 \\times 2{,}5$ : $218 \\times 25 = 5\\,450$, donc $2{,}18 \\times 2{,}5 = 5{,}450 = 5{,}45$." },
      { type: 'propriete', titre: 'Multiplier ou diviser par 10, 100, 1 000', texte: "Multiplier par 10, 100, $1\\,000$ déplace la virgule de 1, 2, 3 rangs vers la droite ; diviser par 10, 100, $1\\,000$ (c'est-à-dire multiplier par $0{,}1$ ; $0{,}01$ ; $0{,}001$) la déplace vers la gauche : $4{,}56 \\times 100 = 456$ ; $4{,}56 \\times 0{,}1 = 0{,}456$." },
      { type: 'propriete', titre: 'Division décimale', texte: "Pour diviser un décimal par un entier, on divise la partie entière, puis on place la virgule au quotient au moment d'abaisser le chiffre des dixièmes : $47{,}6 \\div 4 = 11{,}9$. Si la division ne s'arrête pas, on donne une valeur approchée : $10 \\div 3 \\approx 3{,}33$." },
      { type: 'remarque', titre: 'Diviser par un décimal', texte: "On multiplie le dividende et le diviseur par 10, 100… pour rendre le diviseur entier ; le quotient ne change pas : $7{,}2 \\div 0{,}4 = 72 \\div 4 = 18$." },
      { type: 'remarque', titre: 'Ordre de grandeur', texte: "$19{,}8 \\times 5{,}1 \\approx 20 \\times 5 = 100$ : le résultat exact, $100{,}98$, est cohérent." }
    ],
    methodes: [
      { titre: 'Multiplier deux décimaux', etapes: [
        "Effectue la multiplication sans les virgules.",
        "Compte le nombre total de chiffres après la virgule dans les deux facteurs.",
        "Place la virgule dans le produit en comptant ce nombre de chiffres à partir de la droite.",
        "Contrôle avec un ordre de grandeur."
      ] },
      { titre: 'Diviser un décimal par un entier', etapes: [
        "Divise d'abord la partie entière comme dans une division euclidienne.",
        "Écris la virgule au quotient quand tu abaisses le premier chiffre après la virgule.",
        "Continue en ajoutant des zéros au dividende si nécessaire, jusqu'à un reste nul ou la précision demandée.",
        "Vérifie : quotient × diviseur = dividende."
      ] }
    ],
    exemple: {
      enonce: "Fatou achète $2{,}5$ kg de poisson à $1\\,800$ F CFA le kg et $1{,}5$ kg d'oignons à 650 F CFA le kg. Calculer la somme payée. Elle partage ensuite $4{,}5$ m de tissu en 6 morceaux égaux : calculer la longueur d'un morceau.",
      solution: [
        "Poisson : $2{,}5 \\times 1\\,800 = 4\\,500$ F CFA ; oignons : $1{,}5 \\times 650 = 975$ F CFA.",
        "Total : $4\\,500 + 975 = 5\\,475$ F CFA.",
        "Tissu : $4{,}5 \\div 6 = 0{,}75$ m ; vérification $0{,}75 \\times 6 = 4{,}5$."
      ]
    },
    erreurs: [
      "Aligner les derniers chiffres au lieu des virgules dans une addition.",
      "Placer la virgule du produit comme dans une addition : $0{,}2 \\times 0{,}3 = 0{,}06$ et non $0{,}6$.",
      "Croire qu'une multiplication agrandit toujours : $8 \\times 0{,}5 = 4$.",
      "Oublier un zéro au quotient : $4{,}2 \\div 4 = 1{,}05$ et non $1{,}5$."
    ],
    flashcards: [
      { q: "$0{,}2 \\times 0{,}3 = ?$", r: "$0{,}06$" },
      { q: "$3{,}5 \\times 100 = ?$", r: "350" },
      { q: "$47 \\div 1\\,000 = ?$", r: "$0{,}047$" },
      { q: "$12{,}5 + 3{,}75 = ?$", r: "$16{,}25$" },
      { q: "$7 \\div 4 = ?$", r: "$1{,}75$" },
      { q: "Multiplier par $0{,}1$ revient à…", r: "diviser par 10" }
    ],
    contexte: {
      titre: 'Au marché Kermel',
      enonce: "Mamadou achète $3{,}5$ kg de crevettes à $3\\,200$ F CFA le kg et $2{,}25$ kg de poisson à $1\\,600$ F CFA le kg. Il paie avec un billet de $10\\,000$ F CFA et un billet de $5\\,000$ F CFA. Calculer la monnaie rendue.",
      solution: [
        "Crevettes : $3{,}5 \\times 3\\,200 = 11\\,200$ F CFA.",
        "Poisson : $2{,}25 \\times 1\\,600 = 3\\,600$ F CFA.",
        "Total : $11\\,200 + 3\\,600 = 14\\,800$ F CFA ; il donne $15\\,000$ F CFA.",
        "Monnaie rendue : $15\\,000 - 14\\,800 = 200$ F CFA."
      ]
    },
    histoire: "Le signe × de la multiplication a été popularisé par le mathématicien anglais William Oughtred dans un livre publié en 1631."
  };

  EM.contenu['6e-multiples-diviseurs'] = {
    resume: "Reconnaître les multiples et les diviseurs d'un entier, utiliser les critères de divisibilité par 2, 3, 4, 5, 9, 10 et 25 et dresser la liste des diviseurs d'un nombre.",
    objectifs: [
      "Reconnaître si un entier est multiple ou diviseur d'un autre",
      "Utiliser les critères de divisibilité par 2, 5, 10, 3, 9, 4 et 25",
      "Écrire des multiples d'un nombre et la liste de tous ses diviseurs",
      "Reconnaître les nombres pairs, impairs et les premiers nombres premiers"
    ],
    cours: [
      { type: 'definition', titre: 'Multiple et diviseur', texte: "Si $a = b \\times k$ avec $k$ entier, on dit que $a$ est un <b>multiple</b> de $b$, que $b$ est un <b>diviseur</b> de $a$, ou que $a$ est <b>divisible</b> par $b$ : la division euclidienne de $a$ par $b$ a un reste nul. Exemple : $36 = 4 \\times 9$, donc 36 est un multiple de 4 et de 9." },
      { type: 'propriete', titre: 'Critères de divisibilité', texte: "Par 2 : chiffre des unités 0, 2, 4, 6 ou 8. Par 5 : 0 ou 5. Par 10 : 0.<br>Par 3 (ou par 9) : la somme des chiffres est divisible par 3 (ou par 9).<br>Par 4 : le nombre formé par les deux derniers chiffres est divisible par 4.<br>Par 25 : le nombre se termine par 00, 25, 50 ou 75." },
      { type: 'propriete', titre: 'Liste des diviseurs', texte: "Les diviseurs vont par paires : $36 = 1 \\times 36 = 2 \\times 18 = 3 \\times 12 = 4 \\times 9 = 6 \\times 6$. Les diviseurs de 36 sont donc 1, 2, 3, 4, 6, 9, 12, 18 et 36." },
      { type: 'remarque', titre: 'Pairs, impairs, nombres premiers', texte: "Un nombre pair est un multiple de 2 ; les autres sont impairs. Un nombre qui a exactement deux diviseurs, 1 et lui-même, est un <b>nombre premier</b> : 2, 3, 5, 7, 11, 13, 17, 19… Le nombre 1 n'est pas premier." },
      { type: 'remarque', titre: 'Multiples', texte: "Les multiples de 7 sont 0, 7, 14, 21, 28… ; il y en a une infinité. 0 est un multiple de tous les nombres, et 1 divise tous les nombres." }
    ],
    methodes: [
      { titre: "Trouver tous les diviseurs d'un nombre", etapes: [
        "Teste les entiers 1, 2, 3, … dans l'ordre.",
        "Chaque fois que $d$ divise $n$, note la paire $d$ et $n \\div d$.",
        "Arrête-toi dès que $d$ dépasse son partenaire $n \\div d$.",
        "Range tous les diviseurs trouvés dans l'ordre croissant."
      ] },
      { titre: 'Tester la divisibilité par 3 ou par 9', etapes: [
        "Additionne tous les chiffres du nombre.",
        "Si cette somme est divisible par 3 (ou 9), le nombre l'est aussi ; sinon, il ne l'est pas.",
        "Exemple : $4\\,125$ : $4 + 1 + 2 + 5 = 12$, divisible par 3 mais pas par 9."
      ] }
    ],
    exemple: {
      enonce: "Le nombre $4\\square7$ (un chiffre est caché) doit être divisible par 9. Trouver le chiffre caché. Le nombre obtenu est-il divisible par 3 ? par 2 ?",
      solution: [
        "Somme des chiffres connus : $4 + 7 = 11$. Il faut que $11 + \\square$ soit un multiple de 9, donc $11 + \\square = 18$ et $\\square = 7$.",
        "Le nombre est 477. Il est divisible par 3, car tout multiple de 9 est un multiple de 3.",
        "Il n'est pas divisible par 2, car son chiffre des unités, 7, est impair."
      ]
    },
    erreurs: [
      "Confondre multiple et diviseur : 4 est un diviseur de 36, 36 est un multiple de 4.",
      "Croire que 13 est divisible par 3 parce qu'il se termine par 3.",
      "Croire qu'un nombre qui se termine par 4 est divisible par 4 : 314 ne l'est pas (14 n'est pas multiple de 4).",
      "Oublier 1 et le nombre lui-même dans la liste de ses diviseurs."
    ],
    flashcards: [
      { q: "$2\\,019$ est-il divisible par 3 ?", r: "Oui : $2 + 0 + 1 + 9 = 12$." },
      { q: "Critère de divisibilité par 4 ?", r: "Les deux derniers chiffres forment un multiple de 4." },
      { q: "Diviseurs de 12 ?", r: "1, 2, 3, 4, 6, 12" },
      { q: "1 est-il un nombre premier ?", r: "Non : il n'a qu'un seul diviseur." },
      { q: "Tout multiple de 9 est-il multiple de 3 ?", r: "Oui, car $9 = 3 \\times 3$." },
      { q: "$3\\,750$ est-il divisible par 25 ?", r: "Oui, il se termine par 50." }
    ],
    contexte: {
      titre: "Les sachets d'arachide grillée",
      enonce: "Khady, vendeuse à Mbour, a 96 sachets d'arachide grillée. Elle veut les ranger en paquets contenant tous le même nombre de sachets, sans qu'il en reste. Quelles sont toutes les possibilités si chaque paquet doit contenir plus de 5 sachets et moins de 20 ?",
      solution: [
        "Le nombre de sachets par paquet doit être un diviseur de 96.",
        "$96 = 1 \\times 96 = 2 \\times 48 = 3 \\times 32 = 4 \\times 24 = 6 \\times 16 = 8 \\times 12$ : les diviseurs de 96 sont 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48 et 96.",
        "Entre 5 et 20 : 6, 8, 12 ou 16 sachets par paquet, soit respectivement 16, 12, 8 ou 6 paquets."
      ]
    },
    histoire: "Au IIIᵉ siècle av. J.-C., Ératosthène, savant grec qui vivait à Alexandrie, en Égypte, a inventé une méthode pour trouver les nombres premiers : le « crible d'Ératosthène »."
  };

  EM.contenu['6e-fractions'] = {
    resume: "Utiliser l'écriture fractionnaire pour partager, comparer, simplifier, additionner des fractions de même dénominateur et prendre une fraction d'une quantité.",
    objectifs: [
      "Interpréter une fraction comme un partage et comme un quotient : $\\dfrac{a}{b} = a \\div b$",
      "Reconnaître et produire des fractions égales ; simplifier une fraction",
      "Comparer des fractions de même dénominateur, de même numérateur, ou à 1",
      "Additionner et soustraire des fractions de même dénominateur",
      "Calculer une fraction d'une quantité"
    ],
    cours: [
      { type: 'definition', titre: 'Écriture fractionnaire', texte: "Pour $b \\neq 0$, $\\dfrac{a}{b}$ est le nombre qui, multiplié par $b$, donne $a$ : c'est le quotient $a \\div b$. Par exemple $\\dfrac{3}{4} = 3 \\div 4 = 0{,}75$. Le nombre $a$ est le numérateur, $b$ le dénominateur." },
      { type: 'propriete', titre: 'Fractions égales', texte: "On ne change pas la valeur d'une fraction en multipliant ou en divisant son numérateur et son dénominateur par un même nombre non nul : $$\\dfrac{a}{b} = \\dfrac{a \\times k}{b \\times k}$$ Exemple : $\\dfrac{36}{48} = \\dfrac{36 \\div 12}{48 \\div 12} = \\dfrac{3}{4}$." },
      { type: 'definition', titre: 'Fraction irréductible', texte: "Une fraction est irréductible lorsque son numérateur et son dénominateur n'ont pas d'autre diviseur commun que 1. Pour simplifier une fraction, on utilise les critères de divisibilité." },
      { type: 'propriete', titre: 'Comparer des fractions', texte: "Même dénominateur : la plus grande est celle qui a le plus grand numérateur. Même numérateur : la plus grande est celle qui a le plus petit dénominateur. Comparaison à 1 : $\\dfrac{a}{b} < 1$ si $a < b$, et $\\dfrac{a}{b} > 1$ si $a > b$." },
      { type: 'propriete', titre: 'Additionner et soustraire', texte: "Pour des fractions de même dénominateur : $\\dfrac{a}{d} + \\dfrac{b}{d} = \\dfrac{a + b}{d}$ et $\\dfrac{a}{d} - \\dfrac{b}{d} = \\dfrac{a - b}{d}$. Exemple : $\\dfrac{5}{8} + \\dfrac{1}{8} = \\dfrac{6}{8} = \\dfrac{3}{4}$." },
      { type: 'formule', titre: "Fraction d'une quantité", texte: "Les $\\dfrac{a}{b}$ de $Q$ : $Q \\div b \\times a = \\dfrac{a \\times Q}{b}$. Les $\\dfrac{2}{5}$ de 35 : $35 \\div 5 \\times 2 = 14$." }
    ],
    methodes: [
      { titre: 'Simplifier une fraction', etapes: [
        "Cherche un diviseur commun au numérateur et au dénominateur (2, 3, 5… grâce aux critères).",
        "Divise les deux termes par ce nombre.",
        "Recommence jusqu'à obtenir une fraction irréductible."
      ] },
      { titre: 'Comparer deux fractions', etapes: [
        "Si elles ont le même dénominateur, compare les numérateurs.",
        "Si un dénominateur est un multiple de l'autre, écris-les avec le même dénominateur : $\\dfrac{2}{3} = \\dfrac{8}{12} > \\dfrac{7}{12}$.",
        "Sinon, tu peux comparer chacune à 1 ou calculer leurs écritures décimales."
      ] }
    ],
    exemple: {
      enonce: "Simplifier $\\dfrac{45}{60}$, puis comparer le résultat à $\\dfrac{5}{8}$.",
      solution: [
        "45 et 60 sont divisibles par 5 : $\\dfrac{45}{60} = \\dfrac{9}{12}$ ; puis par 3 : $\\dfrac{9}{12} = \\dfrac{3}{4}$.",
        "$\\dfrac{3}{4} = \\dfrac{3 \\times 2}{4 \\times 2} = \\dfrac{6}{8}$.",
        "Même dénominateur 8 et $6 > 5$ : $\\dfrac{45}{60} = \\dfrac{3}{4} > \\dfrac{5}{8}$."
      ]
    },
    erreurs: [
      "Additionner les numérateurs et les dénominateurs : $\\dfrac{1}{4} + \\dfrac{2}{4} = \\dfrac{3}{4}$, pas $\\dfrac{3}{8}$.",
      "Croire que $\\dfrac{1}{5} > \\dfrac{1}{3}$ parce que $5 > 3$.",
      "« Simplifier » en soustrayant le même nombre : $\\dfrac{6}{8} \\neq \\dfrac{4}{6}$.",
      "Multiplier seulement le numérateur (ou seulement le dénominateur) pour obtenir une fraction égale."
    ],
    flashcards: [
      { q: "$\\dfrac{3}{4}$ en écriture décimale ?", r: "$0{,}75$" },
      { q: "Simplifier $\\dfrac{12}{18}$.", r: "$\\dfrac{2}{3}$" },
      { q: "$\\dfrac{2}{7} + \\dfrac{3}{7} = ?$", r: "$\\dfrac{5}{7}$" },
      { q: "Le plus grand : $\\dfrac{1}{3}$ ou $\\dfrac{1}{5}$ ?", r: "$\\dfrac{1}{3}$" },
      { q: "$\\dfrac{2}{3} = \\dfrac{\\ldots}{12}$", r: "8" },
      { q: "Les $\\dfrac{2}{5}$ de 35 ?", r: "14" }
    ],
    contexte: {
      titre: "Le champ de l'association de Sédhiou",
      enonce: "Une association de Sédhiou cultive un champ de $4\\,800$ m² : les $\\dfrac{5}{12}$ en riz, le $\\dfrac{1}{3}$ en maïs et le reste en légumes. Calculer l'aire de chaque culture et la fraction du champ réservée aux légumes.",
      solution: [
        "Riz : $4\\,800 \\div 12 \\times 5 = 2\\,000$ m².",
        "Maïs : $4\\,800 \\div 3 = 1\\,600$ m².",
        "Légumes : $4\\,800 - 2\\,000 - 1\\,600 = 1\\,200$ m².",
        "Fraction : $\\dfrac{5}{12} + \\dfrac{1}{3} = \\dfrac{5}{12} + \\dfrac{4}{12} = \\dfrac{9}{12}$ ; il reste $\\dfrac{3}{12} = \\dfrac{1}{4}$ du champ (et $\\dfrac{1\\,200}{4\\,800} = \\dfrac{1}{4}$)."
      ]
    },
    histoire: "Le mot « fraction » vient du latin « frangere », qui signifie « briser » : une fraction est un morceau de l'unité."
  };

  EM.contenu['6e-proportionnalite'] = {
    resume: "Reconnaître et compléter des tableaux de proportionnalité, calculer une quatrième proportionnelle, appliquer et calculer un pourcentage, utiliser les échelles.",
    objectifs: [
      "Reconnaître un tableau de proportionnalité et calculer son coefficient",
      "Compléter un tableau de proportionnalité (coefficient, passage par l'unité, propriétés de linéarité)",
      "Appliquer un pourcentage ; calculer un pourcentage",
      "Utiliser l'échelle d'une carte ou d'un plan"
    ],
    cours: [
      { type: 'definition', titre: 'Tableau de proportionnalité', texte: "Un tableau est un tableau de proportionnalité si l'on obtient les nombres de la deuxième ligne en multipliant ceux de la première ligne par un même nombre, appelé <b>coefficient de proportionnalité</b>." },
      { type: 'propriete', titre: 'Propriétés de linéarité', texte: "Dans un tableau de proportionnalité, on peut additionner deux colonnes ou multiplier une colonne par un même nombre. Si 4 pains coûtent 600 F CFA, alors 8 pains coûtent $1\\,200$ F CFA et 12 pains coûtent $600 + 1\\,200 = 1\\,800$ F CFA." },
      { type: 'propriete', titre: 'Quatrième proportionnelle', texte: "Si 6 L d'huile coûtent $7\\,800$ F CFA, alors 1 L coûte $7\\,800 \\div 6 = 1\\,300$ F CFA et 10 L coûtent $1\\,300 \\times 10 = 13\\,000$ F CFA." },
      { type: 'formule', titre: 'Pourcentages', texte: "Appliquer $t\\,\\%$ à une quantité : la multiplier par $\\dfrac{t}{100}$. Calculer un pourcentage : $\\dfrac{\\text{partie}}{\\text{total}} \\times 100$. Exemple : 18 filles sur 40 élèves, $\\dfrac{18}{40} \\times 100 = 45$, soit $45\\,\\%$." },
      { type: 'definition', titre: 'Échelle', texte: "L'échelle d'un plan est le quotient $\\dfrac{\\text{longueur sur le plan}}{\\text{longueur réelle}}$, les deux longueurs étant dans la même unité. À l'échelle $\\dfrac{1}{50\\,000}$, 1 cm représente $50\\,000$ cm, c'est-à-dire 500 m." }
    ],
    methodes: [
      { titre: 'Reconnaître un tableau de proportionnalité', etapes: [
        "Divise chaque nombre de la deuxième ligne par le nombre correspondant de la première ligne.",
        "Si tous les quotients sont égaux, le tableau est de proportionnalité et ce quotient est le coefficient.",
        "Sinon, il ne l'est pas."
      ] },
      { titre: 'Calculer un pourcentage', etapes: [
        "Repère la partie et le total.",
        "Divise la partie par le total, puis multiplie par 100.",
        "Vérifie que le résultat est entre 0 et 100 quand la partie est plus petite que le total."
      ] }
    ],
    exemple: {
      enonce: "Dans un collège de Louga, 135 élèves sur 300 sont des filles. Calculer le pourcentage de filles, puis le nombre de filles qu'aurait un collège de $1\\,200$ élèves avec le même pourcentage.",
      solution: [
        "$\\dfrac{135}{300} \\times 100 = 45$ : il y a $45\\,\\%$ de filles.",
        "$45\\,\\%$ de $1\\,200$ : $1\\,200 \\times 45 \\div 100 = 540$ filles."
      ]
    },
    erreurs: [
      "Ajouter le même nombre au lieu de multiplier par le même nombre.",
      "Croire que tout tableau de nombres est un tableau de proportionnalité.",
      "Oublier de mettre les longueurs dans la même unité avant de calculer une échelle.",
      "Confondre $5\\,\\%$ et $0{,}5$ : $5\\,\\% = 0{,}05$."
    ],
    flashcards: [
      { q: "Coefficient : 3 → 12 ; 5 → 20 ?", r: "4" },
      { q: "$20\\,\\%$ de 350 ?", r: "70" },
      { q: "30 sur 120 en pourcentage ?", r: "$25\\,\\%$" },
      { q: "Échelle $\\dfrac{1}{25\\,000}$ : que représentent 4 cm ?", r: "$100\\,000$ cm, soit 1 km" },
      { q: "$1\\,\\%$ de $7\\,500$ ?", r: "75" },
      { q: "$100\\,\\%$ d'une quantité, c'est…", r: "la quantité entière" }
    ],
    contexte: {
      titre: 'Le thiéboudienne pour 10 personnes',
      enonce: "Pour 6 personnes, une recette de thiéboudienne demande 900 g de riz, $1{,}2$ kg de poisson et 3 tomates. Les quantités sont proportionnelles au nombre de personnes. Calculer les quantités pour 10 personnes.",
      solution: [
        "Pour 1 personne : $900 \\div 6 = 150$ g de riz ; $1{,}2 \\div 6 = 0{,}2$ kg de poisson ; $3 \\div 6 = 0{,}5$ tomate.",
        "Pour 10 personnes : $150 \\times 10 = 1\\,500$ g de riz ; $0{,}2 \\times 10 = 2$ kg de poisson ; $0{,}5 \\times 10 = 5$ tomates."
      ]
    }
  };

  EM.contenu['6e-donnees'] = {
    resume: "Lire, organiser et représenter des données dans des tableaux et des diagrammes (en bâtons, en barres) et en tirer des informations.",
    objectifs: [
      "Lire et compléter un tableau de données (lignes, colonnes, totaux)",
      "Lire un diagramme en barres ou en bâtons et un graphique",
      "Construire un diagramme en barres à partir d'un tableau en choisissant une échelle",
      "Effectuer des calculs simples sur des données : total, écart, moyenne, pourcentage"
    ],
    cours: [
      { type: 'definition', titre: 'Tableau de données', texte: "Un tableau range des données en lignes et en colonnes ; on lit une valeur à l'intersection d'une ligne et d'une colonne. Une ligne ou une colonne « Total » permet de vérifier les calculs." },
      { type: 'definition', titre: 'Diagramme en barres (ou en bâtons)', texte: "Chaque catégorie est représentée par une barre (ou un bâton) dont la hauteur est proportionnelle à la valeur. On lit la valeur sur l'axe vertical gradué. Un diagramme a toujours un titre et des axes légendés." },
      { type: 'propriete', titre: 'Choisir une échelle', texte: "Pour construire un diagramme, on choisit une graduation adaptée à la plus grande valeur : par exemple 1 cm pour 10 élèves si la plus grande valeur est 80 (la plus haute barre mesure alors 8 cm)." },
      { type: 'remarque', titre: 'Graphique', texte: "Un graphique formé de points reliés montre l'évolution d'une grandeur au cours du temps : la température dans une journée, la quantité de pluie chaque mois…" },
      { type: 'formule', titre: 'Calculs utiles', texte: "Total = somme des valeurs ; écart = plus grande valeur − plus petite valeur ; moyenne = total ÷ nombre de valeurs ; part en pourcentage = $\\dfrac{\\text{valeur}}{\\text{total}} \\times 100$." }
    ],
    methodes: [
      { titre: 'Lire un diagramme en barres', etapes: [
        "Lis le titre et les légendes des axes (que compte-t-on ? dans quelle unité ?).",
        "Repère le pas de la graduation verticale.",
        "Suis le haut de la barre horizontalement jusqu'à l'axe ; si la barre s'arrête entre deux graduations, fais une lecture approchée (au milieu…)."
      ] },
      { titre: 'Construire un diagramme en barres', etapes: [
        "Trace deux axes perpendiculaires ; place les catégories sur l'axe horizontal.",
        "Choisis l'échelle verticale et gradue l'axe régulièrement.",
        "Trace des barres de même largeur, régulièrement espacées, de hauteur proportionnelle aux valeurs.",
        "Écris le titre et les légendes."
      ] }
    ],
    exemple: {
      enonce: "Nombre de pirogues sorties en mer à Joal du lundi au vendredi : 45 ; 60 ; 30 ; 75 ; 50. Calculer le total et la moyenne par jour, indiquer le jour où il y a eu le plus de sorties, puis donner la hauteur de chaque barre avec 1 cm pour 10 pirogues.",
      solution: [
        "Total : $45 + 60 + 30 + 75 + 50 = 260$ pirogues ; moyenne : $260 \\div 5 = 52$ pirogues par jour.",
        "Le maximum, 75, est atteint le jeudi.",
        "Hauteurs : $4{,}5$ cm ; 6 cm ; 3 cm ; $7{,}5$ cm ; 5 cm."
      ]
    },
    erreurs: [
      "Lire la graduation sans tenir compte du pas (une graduation peut valoir 5, 10, 20…).",
      "Tracer des barres dont les hauteurs ne sont pas proportionnelles aux valeurs (échelle irrégulière).",
      "Oublier le titre, les légendes ou les unités du diagramme."
    ],
    flashcards: [
      { q: "Que représente la hauteur d'une barre ?", r: "la valeur (l'effectif) de la catégorie" },
      { q: "Moyenne de 20, 30 et 40 ?", r: "30" },
      { q: "Avec 1 cm pour 10 élèves, hauteur de la barre de 35 élèves ?", r: "$3{,}5$ cm" },
      { q: "Écart entre 75 et 30 ?", r: "45" },
      { q: "15 sur 60 en pourcentage ?", r: "$25\\,\\%$" }
    ],
    contexte: {
      titre: 'La pluie à Kolda',
      enonce: "Un élève de Kolda a relevé la pluie tombée chaque mois pendant un hivernage : juin 80 mm ; juillet 210 mm ; août 290 mm ; septembre 230 mm ; octobre 60 mm. Calculer le total, la moyenne mensuelle, le mois le plus pluvieux, et la hauteur de la barre d'août avec 1 cm pour 50 mm.",
      solution: [
        "Total : $80 + 210 + 290 + 230 + 60 = 870$ mm.",
        "Moyenne : $870 \\div 5 = 174$ mm par mois.",
        "Le mois le plus pluvieux est août (290 mm).",
        "Barre d'août : $290 \\div 50 = 5{,}8$ cm."
      ]
    },
    histoire: "Le diagramme en barres a été popularisé par l'Écossais William Playfair, qui l'a utilisé en 1786 dans un atlas consacré au commerce."
  };

  EM.contenu['6e-droites'] = {
    resume: "Utiliser le vocabulaire et les notations de la géométrie : point, droite, demi-droite, segment, points alignés, milieu d'un segment, droites sécantes et parallèles.",
    objectifs: [
      "Distinguer droite, demi-droite et segment et utiliser les notations $(AB)$, $[AB)$, $[AB]$",
      "Reconnaître des points alignés et utiliser les symboles $\\in$ et $\\notin$",
      "Mesurer et reporter des longueurs ; calculer une longueur sur des points alignés",
      "Construire et caractériser le milieu d'un segment",
      "Connaître les positions relatives de deux droites"
    ],
    cours: [
      { type: 'definition', titre: 'Droite', texte: "Par deux points distincts A et B passe une seule droite, notée $(AB)$. Une droite est illimitée des deux côtés. Des points situés sur une même droite sont dits <b>alignés</b>." },
      { type: 'definition', titre: 'Demi-droite et segment', texte: "La demi-droite $[AB)$ a pour origine A et passe par B : elle est limitée seulement du côté de A. Le segment $[AB]$ est la partie de la droite $(AB)$ comprise entre A et B ; sa longueur se note $AB$ (sans crochets)." },
      { type: 'definition', titre: 'Appartenance', texte: "On écrit $M \\in (d)$ si le point M est sur la droite (d), et $M \\notin (d)$ sinon. Si $M \\in [AB]$, alors $AM + MB = AB$." },
      { type: 'definition', titre: "Milieu d'un segment", texte: "Le milieu I du segment $[AB]$ est le point de $[AB]$ situé à égale distance de A et de B : $AI = IB = \\dfrac{AB}{2}$." },
      { type: 'definition', titre: 'Positions relatives de deux droites', texte: "Deux droites sont <b>sécantes</b> si elles ont un seul point commun, leur point d'intersection. Elles sont <b>parallèles</b> si elles n'ont aucun point commun ou si elles sont confondues." }
    ],
    methodes: [
      { titre: 'Calculer une longueur sur des points alignés', etapes: [
        "Fais un schéma en plaçant les points dans le bon ordre sur la droite.",
        "Écris la relation : si M est sur le segment $[AB]$, $AM + MB = AB$.",
        "Remplace par les longueurs connues et calcule la longueur cherchée."
      ] },
      { titre: "Construire le milieu d'un segment", etapes: [
        "Mesure le segment avec la règle graduée.",
        "Divise cette longueur par 2.",
        "Place le point à cette distance de l'une des extrémités, sur le segment, et code les deux moitiés égales."
      ] }
    ],
    exemple: {
      enonce: "Les points A, B et C sont alignés dans cet ordre, avec $AB = 4{,}2$ cm et $AC = 10$ cm. Calculer $BC$. On appelle I le milieu de $[AC]$ : calculer $AI$ puis $BI$.",
      solution: [
        "B est sur le segment $[AC]$ : $BC = AC - AB = 10 - 4{,}2 = 5{,}8$ cm.",
        "$AI = \\dfrac{AC}{2} = 5$ cm.",
        "B est entre A et I car $AB < AI$ : $BI = AI - AB = 5 - 4{,}2 = 0{,}8$ cm."
      ]
    },
    erreurs: [
      "Confondre $(AB)$ (droite), $[AB]$ (segment), $[AB)$ (demi-droite) et $AB$ (longueur).",
      "Écrire $[BA)$ à la place de $[AB)$ : ces deux demi-droites n'ont pas la même origine.",
      "Additionner des longueurs sans vérifier que les points sont alignés et dans quel ordre."
    ],
    flashcards: [
      { q: "Notation de la droite passant par A et B ?", r: "$(AB)$" },
      { q: "Origine de la demi-droite $[CD)$ ?", r: "le point C" },
      { q: "I milieu de $[AB]$ et $AB = 9$ cm : $AI$ ?", r: "$4{,}5$ cm" },
      { q: "Combien de droites passent par deux points distincts ?", r: "une seule" },
      { q: "Que désigne $AB$ sans crochets ?", r: "la longueur du segment $[AB]$" }
    ],
    contexte: {
      titre: 'Un puits entre trois villages',
      enonce: "Sur une piste rectiligne, trois villages A, B et C se suivent dans cet ordre. La distance de A à C est de $18{,}5$ km et celle de A à B de $7{,}8$ km. On veut creuser un puits au point M, milieu de $[AC]$. Calculer $BC$, $AM$ et la distance entre le village B et le puits.",
      solution: [
        "$BC = AC - AB = 18{,}5 - 7{,}8 = 10{,}7$ km.",
        "$AM = 18{,}5 \\div 2 = 9{,}25$ km.",
        "Comme $AB < AM$, B est entre A et M : $BM = 9{,}25 - 7{,}8 = 1{,}45$ km."
      ]
    },
    histoire: "Vers 300 av. J.-C., Euclide, savant grec d'Alexandrie, a rassemblé la géométrie de son époque dans un ouvrage, « Les Éléments » ; ses définitions du point et de la droite ont été enseignées pendant plus de deux mille ans."
  };

  EM.contenu['6e-perpendiculaires-paralleles'] = {
    resume: "Reconnaître et tracer des droites perpendiculaires et parallèles avec l'équerre et la règle, et utiliser leurs propriétés pour justifier.",
    objectifs: [
      "Reconnaître et tracer deux droites perpendiculaires avec l'équerre",
      "Tracer la parallèle à une droite passant par un point",
      "Connaître et appliquer les trois propriétés reliant droites parallèles et perpendiculaires",
      "Définir et mesurer la distance d'un point à une droite"
    ],
    cours: [
      { type: 'definition', titre: 'Droites perpendiculaires', texte: "Deux droites sont perpendiculaires si elles se coupent en formant un angle droit. On note $(d_1) \\perp (d_2)$." },
      { type: 'definition', titre: 'Droites parallèles', texte: "Deux droites sont parallèles si elles ne sont pas sécantes : elles n'ont aucun point commun, ou elles sont confondues. On note $(d_1) \\parallel (d_2)$. Par un point donné, il passe une seule droite parallèle à une droite donnée." },
      { type: 'propriete', titre: 'Propriété 1', texte: "Si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles entre elles." },
      { type: 'propriete', titre: 'Propriété 2', texte: "Si deux droites sont parallèles, alors toute droite perpendiculaire à l'une est perpendiculaire à l'autre." },
      { type: 'propriete', titre: 'Propriété 3', texte: "Si deux droites sont parallèles à une même droite, alors elles sont parallèles entre elles." },
      { type: 'definition', titre: "Distance d'un point à une droite", texte: "La distance du point A à la droite (d) est la longueur AH, où H est le point d'intersection de (d) et de la perpendiculaire à (d) passant par A. C'est la plus courte distance entre A et un point de (d)." }
    ],
    methodes: [
      { titre: 'Justifier que deux droites sont parallèles ou perpendiculaires', etapes: [
        "Écris les données : « On sait que… ».",
        "Cite la propriété du cours qui utilise exactement ces données.",
        "Conclus : « Donc… ». Ne te fie jamais seulement à la figure."
      ] },
      { titre: 'Tracer la parallèle à (d) passant par A', etapes: [
        "Avec l'équerre, trace la droite (Δ) perpendiculaire à (d) passant par A.",
        "Trace ensuite la perpendiculaire à (Δ) passant par A.",
        "Cette droite est parallèle à (d), d'après la propriété 1."
      ] }
    ],
    exemple: {
      enonce: "On sait que $(d_1) \\perp (\\Delta)$, $(d_2) \\perp (\\Delta)$ et $(d_3) \\perp (d_2)$. Que peut-on dire de $(d_1)$ et $(d_2)$ ? Puis de $(d_3)$ et $(d_1)$ ?",
      solution: [
        "$(d_1)$ et $(d_2)$ sont perpendiculaires à la même droite $(\\Delta)$ : d'après la propriété 1, $(d_1) \\parallel (d_2)$.",
        "$(d_1) \\parallel (d_2)$ et $(d_3) \\perp (d_2)$ : d'après la propriété 2, $(d_3) \\perp (d_1)$."
      ]
    },
    erreurs: [
      "Affirmer que deux droites sont perpendiculaires « parce que ça se voit » : il faut le justifier par une propriété.",
      "Conclure « perpendiculaires » au lieu de « parallèles » avec la propriété 1 (deux perpendiculaires à une même droite sont parallèles).",
      "Tracer une perpendiculaire à l'œil, sans équerre."
    ],
    flashcards: [
      { q: "$(d_1) \\perp (d)$ et $(d_2) \\perp (d)$. Conclusion ?", r: "$(d_1) \\parallel (d_2)$" },
      { q: "$(d_1) \\parallel (d_2)$ et $(d) \\perp (d_1)$. Conclusion ?", r: "$(d) \\perp (d_2)$" },
      { q: "$(d_1) \\parallel (d)$ et $(d_2) \\parallel (d)$. Conclusion ?", r: "$(d_1) \\parallel (d_2)$" },
      { q: "Quel instrument pour tracer une perpendiculaire ?", r: "l'équerre (avec la règle)" },
      { q: "Distance d'un point A à une droite (d) ?", r: "la longueur AH, où H est le pied de la perpendiculaire à (d) passant par A" }
    ],
    contexte: {
      titre: 'Les rangées du champ de mil',
      enonce: "Dans un champ de Kaffrine, toutes les rangées de mil ont été semées perpendiculairement à la piste. Un sentier a été tracé perpendiculairement à la première rangée. Les rangées sont-elles parallèles entre elles ? Que peut-on dire du sentier et de la piste ?",
      solution: [
        "Les rangées sont toutes perpendiculaires à la même droite (la piste) : d'après la propriété 1, elles sont parallèles entre elles.",
        "Le sentier et la piste sont tous les deux perpendiculaires à la première rangée : d'après la propriété 1, le sentier est parallèle à la piste."
      ]
    }
  };

  EM.contenu['6e-cercle'] = {
    resume: "Connaître le vocabulaire du cercle (centre, rayon, diamètre, corde, arc), tracer des cercles au compas, situer un point par rapport à un cercle et calculer périmètre et aire.",
    objectifs: [
      "Définir un cercle et utiliser le vocabulaire : centre, rayon, diamètre, corde, arc",
      "Tracer un cercle connaissant son centre et son rayon, ou un diamètre",
      "Situer un point par rapport à un cercle (intérieur, sur le cercle, extérieur)",
      "Calculer le périmètre d'un cercle et l'aire d'un disque",
      "Reporter des longueurs au compas"
    ],
    cours: [
      { type: 'definition', titre: 'Cercle et disque', texte: "Le cercle de centre O et de rayon $r$ est formé de tous les points situés à la distance $r$ du point O. Le disque de centre O et de rayon $r$ est formé des points situés à une distance de O inférieure ou égale à $r$ : c'est la surface délimitée par le cercle." },
      { type: 'definition', titre: 'Vocabulaire', texte: "Un <b>rayon</b> est un segment qui joint le centre à un point du cercle. Une <b>corde</b> joint deux points du cercle. Un <b>diamètre</b> est une corde qui passe par le centre : sa longueur est $D = 2 \\times r$. Un <b>arc</b> est une portion de cercle comprise entre deux de ses points." },
      { type: 'propriete', titre: "Position d'un point", texte: "Si $OM < r$, le point M est à l'intérieur du cercle ; si $OM = r$, il est sur le cercle ; si $OM > r$, il est à l'extérieur." },
      { type: 'formule', titre: 'Périmètre et aire', texte: "Périmètre du cercle : $P = 2 \\times \\pi \\times r = \\pi \\times D$. Aire du disque : $A = \\pi \\times r \\times r$. On prend souvent $\\pi \\approx 3{,}14$." },
      { type: 'remarque', titre: 'Le nombre π', texte: "Pour tous les cercles, le périmètre divisé par le diamètre donne le même nombre, noté $\\pi$ (« pi ») : $\\pi = 3{,}14159\\ldots$ ; ses décimales ne s'arrêtent jamais." }
    ],
    methodes: [
      { titre: 'Tracer un cercle de rayon donné', etapes: [
        "Écarte le compas de la longueur du rayon sur la règle graduée.",
        "Pique la pointe sèche sur le centre.",
        "Fais tourner le compas sans changer l'écartement."
      ] },
      { titre: "Calculer le périmètre ou l'aire", etapes: [
        "Repère si l'on te donne le rayon ou le diamètre ; calcule l'autre si besoin.",
        "Périmètre : $D \\times 3{,}14$. Aire : $r \\times r \\times 3{,}14$.",
        "Écris l'unité : cm pour le périmètre, cm² pour l'aire."
      ] }
    ],
    exemple: {
      enonce: "Une roue de charrette a un rayon de 45 cm. Calculer son périmètre, puis la distance parcourue quand elle fait 100 tours ($\\pi \\approx 3{,}14$).",
      solution: [
        "$P = 2 \\times 45 \\times 3{,}14 = 282{,}6$ cm.",
        "En 100 tours : $282{,}6 \\times 100 = 28\\,260$ cm, soit $282{,}6$ m."
      ]
    },
    erreurs: [
      "Confondre le rayon et le diamètre.",
      "Utiliser $2 \\times \\pi \\times r$ pour l'aire ou $\\pi \\times r \\times r$ pour le périmètre.",
      "Oublier que l'aire s'exprime en unités carrées (cm², m²)."
    ],
    flashcards: [
      { q: "Diamètre d'un cercle de rayon 7 cm ?", r: "14 cm" },
      { q: "Périmètre d'un cercle de diamètre 10 cm ?", r: "$31{,}4$ cm (avec $\\pi \\approx 3{,}14$)" },
      { q: "Aire d'un disque de rayon 10 cm ?", r: "314 cm²" },
      { q: "$OM = 5$ cm et $r = 4$ cm : où est M ?", r: "à l'extérieur du cercle" },
      { q: "Comment s'appelle une corde qui passe par le centre ?", r: "un diamètre" }
    ],
    contexte: {
      titre: 'Le rond-point fleuri',
      enonce: "Au centre d'un rond-point de Dakar, on aménage un massif de gazon en forme de disque de rayon 9 m, entouré d'une bordure. Calculer l'aire de gazon et la longueur de la bordure ($\\pi \\approx 3{,}14$).",
      solution: [
        "Aire : $9 \\times 9 \\times 3{,}14 = 254{,}34$ m².",
        "Bordure (périmètre) : $2 \\times 9 \\times 3{,}14 = 56{,}52$ m."
      ]
    },
    histoire: "Archimède de Syracuse (IIIᵉ siècle av. J.-C.) a démontré que $\\pi$ est compris entre $3 + \\dfrac{10}{71}$ et $3 + \\dfrac{1}{7}$, c'est-à-dire qu'il vaut environ $3{,}14$."
  };

  EM.contenu['6e-angles'] = {
    resume: "Nommer, mesurer et construire un angle avec le rapporteur, reconnaître les angles aigus, droits, obtus et plats, et utiliser les angles adjacents et la bissectrice.",
    objectifs: [
      "Nommer un angle (sommet, côtés) et utiliser la notation $\\widehat{xOy}$ ou $\\widehat{ABC}$",
      "Mesurer un angle et construire un angle de mesure donnée avec le rapporteur",
      "Reconnaître un angle aigu, droit, obtus ou plat",
      "Utiliser des angles adjacents (somme des mesures)",
      "Construire la bissectrice d'un angle"
    ],
    cours: [
      { type: 'definition', titre: 'Angle', texte: "Deux demi-droites $[Ox)$ et $[Oy)$ de même origine O forment un angle de sommet O, noté $\\widehat{xOy}$ ; ses côtés sont $[Ox)$ et $[Oy)$. Avec un point sur chaque côté, on le note aussi $\\widehat{AOB}$ : la lettre du sommet est toujours au milieu." },
      { type: 'definition', titre: 'Mesure en degrés', texte: "Un angle se mesure en degrés (°) avec un rapporteur. Un angle droit mesure 90°, un angle plat mesure 180°. La mesure d'un angle ne dépend pas de la longueur des côtés tracés." },
      { type: 'definition', titre: "Nature d'un angle", texte: "Aigu : mesure comprise entre 0° et 90°. Droit : 90°. Obtus : entre 90° et 180°. Plat : 180° (ses côtés sont deux demi-droites opposées)." },
      { type: 'definition', titre: 'Angles adjacents', texte: "Deux angles sont adjacents s'ils ont le même sommet, un côté commun, et s'ils sont situés de part et d'autre de ce côté commun. Si $\\widehat{xOz}$ et $\\widehat{zOy}$ sont adjacents : $\\widehat{xOy} = \\widehat{xOz} + \\widehat{zOy}$." },
      { type: 'definition', titre: 'Bissectrice', texte: "La bissectrice d'un angle est la demi-droite qui partage cet angle en deux angles adjacents de même mesure. Si $[Oz)$ est la bissectrice de $\\widehat{xOy}$, alors $\\widehat{xOz} = \\widehat{zOy} = \\dfrac{\\widehat{xOy}}{2}$." }
    ],
    methodes: [
      { titre: 'Mesurer un angle avec le rapporteur', etapes: [
        "Place le centre du rapporteur sur le sommet de l'angle.",
        "Aligne le zéro d'une graduation sur l'un des côtés.",
        "Lis la mesure sur cette même graduation (celle qui part de 0), là où passe l'autre côté.",
        "Vérifie avec la nature de l'angle : un angle aigu mesure moins de 90°."
      ] },
      { titre: 'Construire un angle de 50°', etapes: [
        "Trace une demi-droite $[Ox)$.",
        "Place le rapporteur : centre en O, zéro sur $[Ox)$.",
        "Marque un point en face de la graduation 50, puis trace la demi-droite issue de O passant par ce point."
      ] }
    ],
    exemple: {
      enonce: "L'angle $\\widehat{xOy}$ mesure 130° et $[Oz)$ est sa bissectrice. Calculer $\\widehat{xOz}$ et donner la nature des angles $\\widehat{xOy}$ et $\\widehat{xOz}$.",
      solution: [
        "$\\widehat{xOz} = 130° \\div 2 = 65°$.",
        "$\\widehat{xOy}$ est obtus (entre 90° et 180°) ; $\\widehat{xOz}$ est aigu (moins de 90°)."
      ]
    },
    erreurs: [
      "Lire la mauvaise graduation du rapporteur : 130° au lieu de 50°.",
      "Croire qu'un angle est plus grand parce que ses côtés sont tracés plus longs.",
      "Mal nommer un angle : dans $\\widehat{ABC}$, le sommet est B, la lettre du milieu."
    ],
    flashcards: [
      { q: "Nature d'un angle de 120° ?", r: "obtus" },
      { q: "Mesure d'un angle plat ?", r: "180°" },
      { q: "Bissectrice d'un angle de 70° : mesure de chaque moitié ?", r: "35°" },
      { q: "Sommet de l'angle $\\widehat{ABC}$ ?", r: "B" },
      { q: "Angles adjacents de 35° et 55° : angle formé ?", r: "90°, un angle droit" }
    ],
    contexte: {
      titre: "Les aiguilles de l'horloge de la gare",
      enonce: "Le cadran d'une horloge est partagé en 12 heures. À 3 h, les deux aiguilles forment un angle droit. Quel angle correspond à une heure ? Quel angle forment les aiguilles à 6 h ? à 2 h ? Donner leur nature.",
      solution: [
        "De 12 h à 3 h, il y a 3 heures pour 90° : une heure correspond à $90° \\div 3 = 30°$.",
        "À 6 h : $6 \\times 30° = 180°$, c'est un angle plat.",
        "À 2 h : $2 \\times 30° = 60°$, c'est un angle aigu."
      ]
    },
    histoire: "La division du tour complet en 360 degrés vient des astronomes de Babylone, en Mésopotamie, qui comptaient en base 60 ; c'est aussi pour cela qu'une heure compte 60 minutes."
  };

  EM.contenu['6e-symetrie-orthogonale'] = {
    resume: "Construire le symétrique d'un point et d'une figure par rapport à une droite, connaître la médiatrice d'un segment et les propriétés de conservation de la symétrie.",
    objectifs: [
      "Reconnaître des figures symétriques par rapport à une droite et les axes de symétrie d'une figure",
      "Construire le symétrique d'un point, d'un segment, d'une droite, d'un cercle (sur quadrillage et avec les instruments)",
      "Connaître et construire la médiatrice d'un segment",
      "Utiliser les propriétés de conservation (longueurs, angles, alignement)"
    ],
    cours: [
      { type: 'definition', titre: "Symétrique d'un point", texte: "Le symétrique du point A par rapport à la droite (d) est le point A' tel que (d) soit la médiatrice du segment $[AA']$ : (d) est perpendiculaire à $[AA']$ et passe par son milieu. Si A est sur (d), son symétrique est A lui-même." },
      { type: 'definition', titre: "Médiatrice d'un segment", texte: "La médiatrice du segment $[AB]$ est la droite perpendiculaire à $[AB]$ qui passe par son milieu. Tout point de la médiatrice de $[AB]$ est à égale distance de A et de B." },
      { type: 'propriete', titre: 'Ce que conserve la symétrie', texte: "La symétrie orthogonale conserve les longueurs, les mesures d'angles, l'alignement et les aires. Le symétrique d'un segment est un segment de même longueur ; celui d'une droite est une droite ; celui d'un cercle est un cercle de même rayon." },
      { type: 'definition', titre: "Axe de symétrie d'une figure", texte: "Une droite est un axe de symétrie d'une figure si le symétrique de la figure par rapport à cette droite est la figure elle-même. Un triangle équilatéral a 3 axes de symétrie, un carré 4, un rectangle 2, un cercle une infinité (tous ses diamètres)." }
    ],
    methodes: [
      { titre: "Construire le symétrique d'un point avec l'équerre", etapes: [
        "Trace la perpendiculaire à (d) passant par A ; elle coupe (d) en H.",
        "Mesure AH.",
        "Place A' sur cette perpendiculaire, de l'autre côté de (d), tel que $HA' = HA$."
      ] },
      { titre: 'Sur un quadrillage', etapes: [
        "Compte le nombre de carreaux entre A et (d), en te déplaçant perpendiculairement à (d).",
        "Traverse (d) et avance du même nombre de carreaux dans la même direction.",
        "Si (d) suit une diagonale des carreaux, déplace-toi selon l'autre diagonale."
      ] },
      { titre: 'Construire la médiatrice au compas', etapes: [
        "Avec un écartement plus grand que la moitié de AB, trace deux arcs de centre A, de part et d'autre de $[AB]$.",
        "Sans changer l'écartement, trace deux arcs de centre B qui coupent les premiers.",
        "La droite qui passe par les deux points d'intersection est la médiatrice de $[AB]$."
      ] }
    ],
    exemple: {
      enonce: "ABC est un triangle tel que $AB = 5$ cm et $\\widehat{ABC} = 40°$. On construit son symétrique A'B'C' par rapport à une droite (d). Donner la longueur $A'B'$ et la mesure de l'angle $\\widehat{A'B'C'}$.",
      solution: [
        "La symétrie conserve les longueurs : $A'B' = AB = 5$ cm.",
        "Elle conserve les mesures d'angles : $\\widehat{A'B'C'} = \\widehat{ABC} = 40°$."
      ]
    },
    erreurs: [
      "Reporter la distance parallèlement à l'axe au lieu de perpendiculairement (surtout quand l'axe est oblique).",
      "Oublier qu'un point situé sur l'axe est son propre symétrique.",
      "Confondre symétrie et « glissement » : la figure symétrique est retournée, comme dans un miroir."
    ],
    flashcards: [
      { q: "Symétrique d'un point situé sur l'axe ?", r: "le point lui-même" },
      { q: "Médiatrice de $[AB]$ ?", r: "la droite perpendiculaire à $[AB]$ passant par son milieu" },
      { q: "Nombre d'axes de symétrie d'un carré ?", r: "4" },
      { q: "$[AB]$ mesure 6 cm. Et son symétrique ?", r: "6 cm aussi" },
      { q: "M est sur la médiatrice de $[AB]$. Que vérifie-t-il ?", r: "$MA = MB$" }
    ],
    contexte: {
      titre: "Le motif d'un tissu brodé",
      enonce: "Un brodeur de Thiès dessine un motif symétrique par rapport à une droite (d) : il a tracé la moitié gauche. Un point A de cette moitié est à 3 cm de (d), un segment mesure $4{,}5$ cm et un angle mesure 65°. Où placer le symétrique de A ? Quelles mesures auront le segment et l'angle symétriques ?",
      solution: [
        "Le symétrique A' est sur la perpendiculaire à (d) passant par A, de l'autre côté de (d), lui aussi à 3 cm de (d).",
        "La symétrie conserve les longueurs : le segment symétrique mesure $4{,}5$ cm.",
        "Elle conserve les angles : l'angle symétrique mesure 65°."
      ]
    }
  };

  EM.contenu['6e-triangles'] = {
    resume: "Construire des triangles à partir de leurs côtés, reconnaître les triangles particuliers (isocèle, équilatéral, rectangle), tracer une hauteur et calculer périmètre et aire.",
    objectifs: [
      "Utiliser le vocabulaire : sommet, côté, angle, côté opposé, base",
      "Construire un triangle connaissant les longueurs de ses trois côtés (règle et compas)",
      "Reconnaître et construire un triangle isocèle, équilatéral, rectangle",
      "Tracer une hauteur d'un triangle",
      "Calculer le périmètre et l'aire d'un triangle"
    ],
    cours: [
      { type: 'definition', titre: 'Triangle', texte: "Un triangle ABC a trois sommets A, B, C, trois côtés $[AB]$, $[BC]$, $[CA]$ et trois angles. Le côté $[BC]$ est le côté opposé au sommet A." },
      { type: 'definition', titre: 'Triangles particuliers', texte: "<b>Isocèle</b> : deux côtés de même longueur ; leur sommet commun est le sommet principal et le troisième côté est la base. <b>Équilatéral</b> : trois côtés de même longueur. <b>Rectangle</b> : un angle droit ; le côté opposé à l'angle droit est l'hypoténuse. Un triangle peut être à la fois rectangle et isocèle." },
      { type: 'propriete', titre: 'Propriétés', texte: "Dans un triangle isocèle, les deux angles à la base ont la même mesure, et la médiatrice de la base est un axe de symétrie. Dans un triangle équilatéral, les trois angles ont la même mesure et il y a trois axes de symétrie." },
      { type: 'definition', titre: 'Hauteur et aire', texte: "La hauteur issue de A est la droite qui passe par A et qui est perpendiculaire au côté opposé $[BC]$. Aire d'un triangle : $A = \\dfrac{\\text{base} \\times \\text{hauteur}}{2}$." },
      { type: 'remarque', titre: 'Construction au compas', texte: "Pour construire ABC avec $AB = 6$ cm, $AC = 4$ cm et $BC = 5$ cm : on trace $[AB]$, puis un arc de cercle de centre A et de rayon 4 cm et un arc de centre B et de rayon 5 cm ; C est l'un de leurs points d'intersection." }
    ],
    methodes: [
      { titre: 'Construire un triangle connaissant ses trois côtés', etapes: [
        "Trace le plus grand côté avec la règle.",
        "Écarte le compas de la longueur du deuxième côté et trace un arc depuis la première extrémité.",
        "Écarte le compas de la longueur du troisième côté et trace un arc depuis l'autre extrémité.",
        "Le troisième sommet est à l'intersection des arcs ; trace les côtés et code la figure."
      ] },
      { titre: "Reconnaître la nature d'un triangle", etapes: [
        "Compare les longueurs des côtés (deux égales ? trois égales ?).",
        "Regarde s'il y a un angle droit (donné dans l'énoncé ou codé sur la figure).",
        "Donne la nature la plus précise : rectangle isocèle plutôt que rectangle, équilatéral plutôt qu'isocèle."
      ] }
    ],
    exemple: {
      enonce: "Construire un triangle EFG isocèle en E tel que $EF = 6$ cm et $FG = 4$ cm. Calculer son périmètre.",
      solution: [
        "Isocèle en E : $EG = EF = 6$ cm ; la base est $[FG]$.",
        "Construction : on trace $[FG]$ de 4 cm, puis deux arcs de rayon 6 cm de centres F et G ; ils se coupent en E.",
        "Périmètre : $6 + 6 + 4 = 16$ cm."
      ]
    },
    erreurs: [
      "Dire seulement « isocèle » pour un triangle équilatéral : l'équilatéral est un isocèle particulier, on donne la nature la plus précise.",
      "Confondre un côté et une hauteur.",
      "Mal régler l'écartement du compas lors de la construction."
    ],
    flashcards: [
      { q: "Triangle qui a 3 côtés de même longueur ?", r: "équilatéral" },
      { q: "Triangle qui a 2 côtés de même longueur ?", r: "isocèle" },
      { q: "Nom du côté opposé à l'angle droit ?", r: "l'hypoténuse" },
      { q: "Périmètre d'un triangle équilatéral de côté 7 cm ?", r: "21 cm" },
      { q: "Isocèle de côtés égaux 5 cm et de base 6 cm : périmètre ?", r: "16 cm" }
    ],
    contexte: {
      titre: "Le pignon d'une case de Kédougou",
      enonce: "Le pignon d'une case a la forme d'un triangle isocèle de base 6 m et de côtés égaux 4 m ; sa hauteur relative à la base mesure environ $2{,}6$ m. Calculer la longueur de la frise décorative qui fait le tour du pignon, puis l'aire approximative à peindre.",
      solution: [
        "Périmètre : $4 + 4 + 6 = 14$ m de frise.",
        "Aire : $\\dfrac{6 \\times 2{,}6}{2} = 7{,}8$ m² environ."
      ]
    }
  };

  EM.contenu['6e-quadrilateres'] = {
    resume: "Reconnaître, décrire et construire les quadrilatères particuliers (rectangle, losange, carré) à partir de leurs côtés, de leurs angles et de leurs diagonales.",
    objectifs: [
      "Utiliser le vocabulaire : côtés consécutifs, côtés opposés, diagonales",
      "Connaître les définitions du rectangle, du losange et du carré",
      "Connaître les propriétés de leurs diagonales et de leurs axes de symétrie",
      "Construire ces quadrilatères avec les instruments",
      "Calculer leurs périmètres et leurs aires"
    ],
    cours: [
      { type: 'definition', titre: 'Vocabulaire', texte: "Dans le quadrilatère ABCD, $[AB]$ et $[BC]$ sont des côtés consécutifs, $[AB]$ et $[CD]$ des côtés opposés ; $[AC]$ et $[BD]$ sont les diagonales." },
      { type: 'definition', titre: 'Rectangle, losange, carré', texte: "Un <b>rectangle</b> est un quadrilatère qui a quatre angles droits. Un <b>losange</b> est un quadrilatère qui a quatre côtés de même longueur. Un <b>carré</b> est un quadrilatère qui a quatre angles droits et quatre côtés de même longueur : c'est à la fois un rectangle et un losange." },
      { type: 'propriete', titre: 'Propriétés du rectangle', texte: "Ses côtés opposés sont parallèles et de même longueur. Ses diagonales ont la même longueur et se coupent en leur milieu. Il a deux axes de symétrie : les médiatrices de ses côtés." },
      { type: 'propriete', titre: 'Propriétés du losange', texte: "Ses côtés opposés sont parallèles. Ses diagonales sont perpendiculaires et se coupent en leur milieu. Ses deux diagonales sont ses axes de symétrie." },
      { type: 'propriete', titre: 'Propriétés du carré', texte: "Il a toutes les propriétés du rectangle et du losange : ses diagonales ont la même longueur, sont perpendiculaires et se coupent en leur milieu. Il a quatre axes de symétrie." },
      { type: 'formule', titre: 'Périmètres et aires', texte: "Rectangle : $P = 2 \\times (L + l)$ et $A = L \\times l$. Carré : $P = 4 \\times c$ et $A = c \\times c$. Losange : $P = 4 \\times c$ et $A = \\dfrac{D \\times d}{2}$." }
    ],
    methodes: [
      { titre: 'Reconnaître un quadrilatère particulier', etapes: [
        "Relève ce que l'on sait : angles droits ? côtés égaux ? diagonales ?",
        "Quatre angles droits → rectangle ; quatre côtés égaux → losange ; les deux → carré.",
        "N'affirme que ce qui est sûr : quatre côtés égaux ne suffisent pas pour dire « carré »."
      ] },
      { titre: 'Construire un losange connaissant ses diagonales', etapes: [
        "Trace la première diagonale $[AC]$ et place son milieu O.",
        "Trace la perpendiculaire à $[AC]$ passant par O.",
        "Place B et D sur cette perpendiculaire, de part et d'autre de O, à la distance $\\dfrac{BD}{2}$.",
        "Trace les quatre côtés."
      ] }
    ],
    exemple: {
      enonce: "ABCD est un losange de centre O tel que $AC = 8$ cm et $BD = 6$ cm. Calculer $AO$ et $BO$, puis l'aire du losange. Sachant que $AB = 5$ cm, calculer son périmètre.",
      solution: [
        "Les diagonales se coupent en leur milieu : $AO = 8 \\div 2 = 4$ cm et $BO = 6 \\div 2 = 3$ cm.",
        "Aire : $\\dfrac{8 \\times 6}{2} = 24$ cm².",
        "Les quatre côtés mesurent 5 cm : périmètre $4 \\times 5 = 20$ cm."
      ]
    },
    erreurs: [
      "Croire que les diagonales d'un losange ont toujours la même longueur (c'est vrai seulement pour le carré).",
      "Dire qu'un carré n'est pas un rectangle.",
      "Conclure « carré » à partir de « quatre côtés égaux » seulement : c'est un losange."
    ],
    flashcards: [
      { q: "Quadrilatère qui a 4 angles droits ?", r: "un rectangle" },
      { q: "Quadrilatère qui a 4 côtés de même longueur ?", r: "un losange" },
      { q: "Diagonales d'un rectangle ?", r: "même longueur, même milieu" },
      { q: "Diagonales d'un losange ?", r: "perpendiculaires, même milieu" },
      { q: "Nombre d'axes de symétrie d'un carré ?", r: "4" },
      { q: "Aire d'un losange de diagonales 10 cm et 6 cm ?", r: "30 cm²" }
    ],
    contexte: {
      titre: 'Le carrelage de la cour',
      enonce: "Pour décorer une cour, on utilise des carreaux en forme de losange dont les diagonales mesurent 30 cm et 20 cm. Calculer l'aire d'un carreau en cm² puis en m², et le nombre de carreaux nécessaires pour couvrir 6 m² (sans perte).",
      solution: [
        "Aire d'un carreau : $\\dfrac{30 \\times 20}{2} = 300$ cm².",
        "300 cm² $= 0{,}03$ m² (car 1 m² $= 10\\,000$ cm²).",
        "Nombre de carreaux : $6 \\div 0{,}03 = 200$ carreaux."
      ]
    }
  };

  EM.contenu['6e-perimetres-aires'] = {
    resume: "Calculer des périmètres et des aires de figures usuelles et composées, convertir les unités de longueur et d'aire et résoudre des problèmes concrets.",
    objectifs: [
      "Distinguer périmètre et aire",
      "Calculer le périmètre et l'aire du carré, du rectangle, du triangle, du parallélogramme, du losange et du disque",
      "Calculer l'aire d'une figure composée par addition ou soustraction d'aires",
      "Convertir des unités d'aire (m², dm², cm², ha, a, ca)",
      "Résoudre des problèmes de clôture, de carrelage et de champs"
    ],
    cours: [
      { type: 'definition', titre: 'Périmètre et aire', texte: "Le périmètre d'une figure est la longueur de son contour ; son aire est la mesure de sa surface. Deux figures peuvent avoir la même aire et des périmètres différents : un carré de 4 cm de côté et un rectangle de 8 cm sur 2 cm ont la même aire, 16 cm², mais leurs périmètres valent 16 cm et 20 cm." },
      { type: 'formule', titre: "Formules d'aire", texte: "Rectangle : $L \\times l$. Carré : $c \\times c$. Triangle : $\\dfrac{b \\times h}{2}$. Parallélogramme : $b \\times h$. Losange : $\\dfrac{D \\times d}{2}$. Disque : $\\pi \\times r \\times r$." },
      { type: 'propriete', titre: 'Figures composées', texte: "L'aire d'une figure formée de plusieurs morceaux est la somme des aires des morceaux ; si l'on a retiré un morceau, on soustrait son aire." },
      { type: 'definition', titre: "Unités d'aire", texte: "1 m² $= 100$ dm² $= 10\\,000$ cm² ; 1 km² $= 100$ ha ; 1 ha $= 100$ a $= 10\\,000$ m² ; 1 a $= 100$ m² $= 100$ ca. Dans le tableau de conversion, chaque unité d'aire occupe deux colonnes." },
      { type: 'remarque', titre: 'Attention aux unités', texte: "Avant de calculer, exprime toutes les longueurs dans la même unité. Une aire calculée avec des longueurs en m s'exprime en m²." }
    ],
    methodes: [
      { titre: "Calculer l'aire d'une figure composée", etapes: [
        "Repère les figures simples qui composent la figure (ou celle qui a été retirée).",
        "Calcule les longueurs manquantes si nécessaire.",
        "Calcule chaque aire, puis additionne ou soustrais."
      ] },
      { titre: 'Convertir des aires', etapes: [
        "Trace le tableau des unités d'aire avec deux colonnes par unité.",
        "Place le nombre en mettant le chiffre des unités dans la colonne de droite de l'unité de départ.",
        "Lis le résultat dans l'unité d'arrivée en complétant par des zéros : 3 m² $= 30\\,000$ cm²."
      ] }
    ],
    exemple: {
      enonce: "Un terrain rectangulaire de 40 m sur 25 m contient une maison de base carrée de 12 m de côté. Calculer l'aire du terrain non bâti, en m² puis en ares.",
      solution: [
        "Aire du terrain : $40 \\times 25 = 1\\,000$ m².",
        "Aire de la maison : $12 \\times 12 = 144$ m².",
        "Aire non bâtie : $1\\,000 - 144 = 856$ m² $= 8{,}56$ a."
      ]
    },
    erreurs: [
      "Additionner les côtés pour calculer une aire, ou écrire une aire en m au lieu de m².",
      "Convertir les aires comme des longueurs : 1 m² $= 100$ dm² et non 10 dm².",
      "Calculer le périmètre d'une figure composée en additionnant les périmètres des morceaux : les côtés communs ne font pas partie du contour."
    ],
    flashcards: [
      { q: "1 m² = combien de cm² ?", r: "$10\\,000$ cm²" },
      { q: "3 ha = combien de m² ?", r: "$30\\,000$ m²" },
      { q: "Aire d'un parallélogramme de base 8 cm et de hauteur 5 cm ?", r: "40 cm²" },
      { q: "Aire d'un triangle de base 10 cm et de hauteur 7 cm ?", r: "35 cm²" },
      { q: "250 a = combien d'hectares ?", r: "$2{,}5$ ha" }
    ],
    contexte: {
      titre: "Le jardin de l'école de Fatick",
      enonce: "Le jardin rectangulaire d'une école de Fatick mesure 30 m sur 18 m. On y creuse un bassin circulaire de 2 m de rayon et on plante des salades sur le reste. Calculer l'aire plantée ($\\pi \\approx 3{,}14$) et la longueur de grillage pour entourer le jardin.",
      solution: [
        "Aire du jardin : $30 \\times 18 = 540$ m².",
        "Aire du bassin : $2 \\times 2 \\times 3{,}14 = 12{,}56$ m².",
        "Aire plantée : $540 - 12{,}56 = 527{,}44$ m².",
        "Grillage : $(30 + 18) \\times 2 = 96$ m."
      ]
    }
  };

  EM.contenu['6e-solides'] = {
    resume: "Décrire le pavé droit et le cube, les représenter en perspective cavalière, construire leurs patrons et calculer leurs volumes.",
    objectifs: [
      "Décrire un pavé droit et un cube : faces, arêtes, sommets",
      "Représenter un pavé droit en perspective cavalière",
      "Reconnaître et construire un patron de cube et de pavé droit",
      "Calculer le volume d'un pavé droit et d'un cube, et l'aire totale de leurs faces",
      "Convertir des unités de volume et de capacité"
    ],
    cours: [
      { type: 'definition', titre: 'Pavé droit et cube', texte: "Un pavé droit (ou parallélépipède rectangle) a 6 faces rectangulaires, 12 arêtes et 8 sommets ; ses faces opposées sont identiques. Un cube est un pavé droit dont les 6 faces sont des carrés identiques." },
      { type: 'definition', titre: 'Perspective cavalière', texte: "La face avant est dessinée en vraie grandeur ; les arêtes « fuyantes » sont parallèles entre elles et raccourcies ; les arêtes cachées sont dessinées en pointillés." },
      { type: 'definition', titre: 'Patron', texte: "Un patron d'un solide est une figure plane qui, après pliage, permet de fabriquer ce solide sans que les faces se superposent. Un patron de cube est formé de 6 carrés ; il existe 11 patrons différents du cube." },
      { type: 'formule', titre: 'Volumes et aire totale', texte: "Pavé droit : $V = L \\times l \\times h$. Cube d'arête $a$ : $V = a \\times a \\times a$. Aire totale du pavé droit (aire du patron) : $2 \\times (L \\times l + L \\times h + l \\times h)$." },
      { type: 'definition', titre: 'Unités de volume et de capacité', texte: "1 m³ $= 1\\,000$ dm³ ; 1 dm³ $= 1\\,000$ cm³. Capacités : 1 dm³ $= 1$ L ; 1 cm³ $= 1$ mL ; 1 m³ $= 1\\,000$ L. Dans le tableau de conversion, chaque unité de volume occupe trois colonnes." }
    ],
    methodes: [
      { titre: 'Calculer un volume', etapes: [
        "Exprime les trois dimensions dans la même unité.",
        "Multiplie longueur × largeur × hauteur.",
        "Écris l'unité de volume (cm³, dm³, m³) et convertis en litres si on te le demande."
      ] },
      { titre: 'Vérifier un patron de pavé droit', etapes: [
        "Compte les faces : il en faut 6, identiques deux à deux.",
        "Vérifie que deux côtés qui se rejoignent au pliage ont la même longueur.",
        "Imagine le pliage : aucune face ne doit se superposer à une autre."
      ] }
    ],
    exemple: {
      enonce: "Un aquarium a la forme d'un pavé droit de 60 cm de long, 30 cm de large et 40 cm de haut. Calculer son volume en cm³ puis en litres. Combien de litres contient-il s'il est rempli aux trois quarts ?",
      solution: [
        "$V = 60 \\times 30 \\times 40 = 72\\,000$ cm³.",
        "$72\\,000$ cm³ $= 72$ dm³ $= 72$ L.",
        "Aux trois quarts : $72 \\div 4 \\times 3 = 54$ L."
      ]
    },
    erreurs: [
      "Confondre aire (cm²) et volume (cm³).",
      "Écrire 1 m³ = 100 dm³ : c'est 1 000 dm³.",
      "Multiplier des dimensions exprimées dans des unités différentes."
    ],
    flashcards: [
      { q: "Faces, arêtes et sommets d'un pavé droit ?", r: "6 faces, 12 arêtes, 8 sommets" },
      { q: "Volume d'un cube de 4 cm d'arête ?", r: "64 cm³" },
      { q: "1 dm³ = combien de litres ?", r: "1 L" },
      { q: "$2{,}5$ m³ = combien de litres ?", r: "$2\\,500$ L" },
      { q: "Volume d'un pavé de 5 cm sur 3 cm sur 2 cm ?", r: "30 cm³" }
    ],
    contexte: {
      titre: "L'abreuvoir du troupeau",
      enonce: "Un éleveur de Matam construit un abreuvoir en forme de pavé droit de $2{,}5$ m de long, $0{,}8$ m de large et $0{,}6$ m de profondeur. Calculer son volume et sa capacité en litres. Le troupeau boit 300 L par jour : pendant combien de jours un abreuvoir plein suffit-il ?",
      solution: [
        "$V = 2{,}5 \\times 0{,}8 \\times 0{,}6 = 1{,}2$ m³.",
        "Capacité : $1{,}2 \\times 1\\,000 = 1\\,200$ L.",
        "Durée : $1\\,200 \\div 300 = 4$ jours."
      ]
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
