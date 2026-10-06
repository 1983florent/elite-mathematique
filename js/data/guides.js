/*
 * ELITE MATHÉMATIQUE — « Réussir son examen » : guides du CFEE, du BFEM, du BAC S1/S2, du BAC L,
 * et guide transversal « Méthodes de travail ».
 * L'organisation des épreuves est décrite de façon volontairement générale : la durée, le barème
 * et les coefficients officiels figurent sur le sujet, la convocation et les textes de l'examen.
 */
(function (root) {
  'use strict';
  var EM = root.EM;

  EM.guides = [

    /* ================================================================== */
    /* CFEE (CM2)                                                          */
    /* ================================================================== */
    {
      id: 'cfee',
      titre: 'Réussir le CFEE',
      classe: 'cm2',
      resume: "Le Certificat de fin d'études élémentaires (CFEE) termine l'école élémentaire. En mathématiques, il vérifie que tu sais calculer, mesurer, tracer et résoudre des problèmes de la vie courante. Voici comment t'y préparer et réussir le jour J.",
      sections: [
        { titre: "Comprendre l'épreuve",
          texte: "L'épreuve de mathématiques du CFEE comporte en général des questions courtes (opérations, fractions, conversions, mesures, géométrie) et un ou plusieurs <b>problèmes</b> tirés de la vie courante : achats au marché, partage d'une récolte, clôture d'un champ, trajet en car… Le nombre d'exercices, la durée et le barème peuvent changer d'une session à l'autre : ton maître ou ta maîtresse te les précisera, et ta convocation indique le lieu et l'heure de l'épreuve.",
          points: [
            "Dans un problème, les questions se suivent : le résultat de la question 1 sert souvent à la question 2.",
            "Chaque réponse doit être justifiée par une opération : un résultat seul, sans calcul, rapporte peu de points.",
            "La propreté compte : le correcteur doit pouvoir suivre ton raisonnement d'un coup d'œil."
          ] },
        { titre: 'Lire un problème sans se tromper',
          texte: "Lis l'énoncé <b>deux fois</b> : la première pour comprendre l'histoire, la seconde, crayon en main, pour relever les données. Souligne les nombres avec leurs unités et encadre la question posée. Demande-toi : « Qu'est-ce que je cherche ? De quoi ai-je besoin pour le trouver ? » Un petit schéma (le champ, le trajet, le partage) aide souvent à voir quelle opération faire.",
          points: [
            "Repère les mots qui annoncent une opération : « en tout », « chacun », « de plus que », « de moins que », « le reste »…",
            "Avant de calculer, vérifie que toutes les données sont dans la même unité.",
            "Une donnée peut ne servir à rien : ne l'utilise pas à tout prix."
          ] },
        { titre: 'Présenter une solution complète',
          texte: "Pour chaque question, écris ce que tu calcules (en mots), l'opération avec son résultat et son unité, puis une phrase-réponse. Exemple : <i>un commerçant achète $25$ sacs de riz à $15\\,000$ F CFA le sac. Il paie $12\\,500$ F CFA de transport et revend tout le riz pour $420\\,000$ F CFA. Quel est son bénéfice ?</i><br>Prix d'achat : $25 \\times 15\\,000 = 375\\,000$ F CFA.<br>Prix de revient : $375\\,000 + 12\\,500 = 387\\,500$ F CFA.<br>Bénéfice : $420\\,000 - 387\\,500 = 32\\,500$ F CFA.<br><b>Réponse</b> : le commerçant réalise un bénéfice de $32\\,500$ F CFA.",
          points: [
            "Pose les opérations au brouillon, puis recopie proprement les calculs utiles sur la copie.",
            "N'oublie jamais l'unité : F CFA, m, m², L, kg, h…",
            "Termine par une phrase qui répond exactement à la question posée."
          ] },
        { titre: 'Les formules à connaître par cœur',
          texte: "Ces formules reviennent dans presque tous les sujets : récite-les jusqu'à les connaître sans hésiter.<br><b>Périmètres</b> : rectangle $P = (L + l) \\times 2$ ; carré $P = c \\times 4$ ; cercle $P = D \\times 3{,}14$ ($D$ est le diamètre).<br><b>Aires</b> : rectangle $A = L \\times l$ ; carré $A = c \\times c$ ; triangle $A = \\dfrac{b \\times h}{2}$ ; trapèze $A = \\dfrac{(B + b) \\times h}{2}$ ; losange $A = \\dfrac{D \\times d}{2}$ ; disque $A = r \\times r \\times 3{,}14$.<br><b>Volumes</b> : pavé droit $V = L \\times l \\times h$ ; cube $V = c \\times c \\times c$.<br><b>Commerce</b> : $\\text{prix de revient} = \\text{prix d'achat} + \\text{frais}$ ; $\\text{bénéfice} = \\text{prix de vente} - \\text{prix de revient}$ ; $\\text{perte} = \\text{prix de revient} - \\text{prix de vente}$.<br><b>Vitesse</b> : $\\text{distance} = \\text{vitesse} \\times \\text{durée}$.<br><b>Pourcentage</b> : 20 % de $3\\,500$ F CFA, c'est $3\\,500 \\times \\dfrac{20}{100} = 700$ F CFA.<br><b>Échelle</b> : $\\text{distance sur le plan} = \\text{distance réelle} \\times \\text{échelle}$, les deux distances étant dans la même unité.<br><b>Moyenne</b> : somme des valeurs divisée par le nombre de valeurs." },
        { titre: 'Conversions et durées : les pièges classiques',
          texte: "Beaucoup de points se perdent sur les unités. Utilise un tableau de conversion et retiens : $1\\ \\text{km} = 1\\,000\\ \\text{m}$ ; $1\\ \\text{t} = 1\\,000\\ \\text{kg}$ ; $1\\ \\text{m}^2 = 100\\ \\text{dm}^2$ ; $1\\ \\text{ha} = 10\\,000\\ \\text{m}^2$ ; $1\\ \\text{L} = 1\\ \\text{dm}^3$ ; $1\\ \\text{h} = 60\\ \\text{min}$.<br>Pour les aires, on passe d'une unité à la suivante en multipliant ou en divisant par $100$ ; pour les volumes, par $1\\,000$.<br>Les durées ne sont pas des nombres décimaux : 1 h 30 min, c'est $1{,}5$ h et non $1{,}30$ h. Pour calculer une durée de 8 h 45 min à 11 h 20 min, écris 11 h 20 min = 10 h 80 min ; la durée est 10 h 80 min − 8 h 45 min = 2 h 35 min.",
          points: [
            "Convertis toutes les données dans la même unité <b>avant</b> de calculer.",
            "Un résultat bizarre (un champ de 3 m², une bouteille de 150 L) signale souvent une erreur de conversion."
          ] },
        { titre: 'Géométrie : tracer avec soin',
          texte: "Les constructions se font au crayon bien taillé, avec la règle, l'équerre et le compas. Commence par une figure à main levée au brouillon pour comprendre ce qui est demandé, puis trace la figure en respectant les mesures données. Nomme les points, code les angles droits et les longueurs égales. Vérifie à la fin : un carré a quatre angles droits et quatre côtés égaux, un rectangle a quatre angles droits, les diagonales d'un losange sont perpendiculaires.",
          points: [
            "Pour un cercle, ouvre le compas de la longueur du <b>rayon</b>, c'est-à-dire la moitié du diamètre.",
            "Cube : 6 faces carrées, 12 arêtes, 8 sommets. Pavé droit : 6 faces rectangulaires, 12 arêtes, 8 sommets."
          ] },
        { titre: 'Gérer son temps le jour J',
          texte: "Lis tout le sujet avant de commencer et repère les exercices que tu sais faire tout de suite : commence par eux, cela donne confiance. Ne reste pas bloqué longtemps sur une question : passe à la suivante et reviens-y à la fin. Garde du temps pour relire : vérifie les calculs, les unités et les phrases-réponses.",
          points: [
            "Note sur ton brouillon l'heure de début et l'heure de fin de l'épreuve.",
            "Vérifie l'ordre de grandeur : $25$ sacs à $15\\,000$ F CFA coûtent moins que $30 \\times 15\\,000 = 450\\,000$ F CFA ; un résultat de $3\\,750\\,000$ F CFA est donc faux."
          ] },
        { titre: 'Les dernières semaines',
          texte: "Chaque jour, un peu de calcul mental (tables de multiplication, multiplier ou diviser par $10$, $100$, $1\\,000$) et un problème complet. Refais des sujets des années précédentes en te chronométrant. Demande à un parent ou à un camarade de t'interroger sur les formules. À l'élémentaire, les opérations se font en général à la main : entraîne-toi à les poser, y compris avec des nombres décimaux." }
      ],
      checklist: [
        "La veille : préparer le sac avec la convocation ou le document demandé.",
        "Deux stylos bleus, un crayon à papier, une gomme, un taille-crayon.",
        "Règle graduée, équerre, compas, rapporteur.",
        "Relire une dernière fois les formules de périmètres, d'aires et de volumes, puis se reposer.",
        "Se coucher tôt et prendre un bon petit-déjeuner.",
        "Vérifier l'heure et le lieu de l'épreuve ; partir en avance.",
        "Une bouteille d'eau si c'est permis, une montre simple pour suivre le temps.",
        "Au début : écrire son nom ou son numéro là où on le demande, puis lire tout le sujet.",
        "Avant de rendre : relire chaque réponse, vérifier les unités et les phrases-réponses."
      ],
      erreurs: [
        "Confondre périmètre (le tour de la figure, en m) et aire (la surface, en m²).",
        "Utiliser le diamètre au lieu du rayon pour l'aire du disque : $r = D \\div 2$.",
        "Mal convertir les aires : $1$ m² $= 100$ dm², et non $10$ dm².",
        "Écrire 1 h 30 min $= 1{,}30$ h au lieu de $1{,}5$ h.",
        "Oublier les frais (transport, impôts) dans le prix de revient.",
        "Mal placer la virgule dans une multiplication de décimaux : $2{,}5 \\times 1{,}2 = 3$, et non $30$ ou $0{,}3$.",
        "Donner un résultat sans unité ou sans phrase-réponse.",
        "Faire un calcul juste… qui répond à une autre question que celle posée."
      ]
    },

    /* ================================================================== */
    /* BFEM (3e)                                                           */
    /* ================================================================== */
    {
      id: 'bfem',
      titre: 'Réussir le BFEM',
      classe: '3e',
      resume: "Le Brevet de fin d'études moyennes (BFEM) termine le cycle moyen. L'épreuve de mathématiques porte sur ce que tu as appris au collège, avec le programme de 3e au centre. Ce guide t'aide à t'organiser, à rédiger comme on l'attend et à éviter les erreurs qui coûtent cher.",
      sections: [
        { titre: "Comprendre l'épreuve",
          texte: "Le sujet est en général partagé en deux grandes parties : les <b>activités numériques</b> (racines carrées, calcul algébrique, équations et inéquations, systèmes, applications affines, statistiques) et les <b>activités géométriques</b> (Thalès, Pythagore, trigonométrie, vecteurs et repérage, angles inscrits, géométrie dans l'espace). Les deux parties ont souvent un poids comparable, et chacune contient plusieurs exercices. La durée et le barème sont indiqués sur le sujet ; l'heure et le lieu, sur ta convocation.",
          points: [
            "Les exercices sont en général indépendants : un exercice difficile ne doit pas te faire perdre les points des autres.",
            "Dans un même exercice, les questions s'enchaînent : « en déduire » signale qu'il faut utiliser le résultat précédent.",
            "Le programme de 3e s'appuie sur tout le collège : fractions, puissances, Pythagore, proportionnalité…"
          ] },
        { titre: 'Gérer ton temps',
          texte: "Prends 5 à 10 minutes pour lire tout le sujet, en notant au brouillon, pour chaque exercice, « facile », « moyen » ou « difficile ». Commence par la partie où tu te sens le plus à l'aise. Répartis ensuite ton temps à peu près selon les points : un exercice qui vaut le quart des points mérite environ le quart du temps. Garde une dizaine de minutes à la fin pour relire.",
          points: [
            "Écris sur ton brouillon l'heure à laquelle tu dois passer à la partie suivante.",
            "Bloqué depuis plusieurs minutes ? Laisse un espace sur la copie, passe à la suite et reviens-y.",
            "Ne rédige pas tout deux fois : cherche au brouillon, puis rédige directement au propre les étapes importantes."
          ] },
        { titre: "Lire l'énoncé : les verbes de la consigne",
          texte: "Lis chaque exercice en entier avant de répondre à la première question : la suite t'indique souvent la méthode. Reporte les données sur une figure à main levée au brouillon. Puis repère ce que chaque verbe attend de toi :",
          points: [
            "<b>Calculer</b> : donner le résultat en montrant les étapes du calcul.",
            "<b>Justifier, démontrer, montrer que</b> : citer les données, la propriété utilisée, puis conclure. Le résultat est souvent donné : même si tu n'y arrives pas, tu peux l'utiliser pour la suite.",
            "<b>En déduire</b> : utiliser la question précédente, sans tout refaire.",
            "<b>Vérifier</b> : remplacer, puis constater que l'égalité est vraie.",
            "<b>Construire</b> : tracer avec les instruments en laissant les traits de construction.",
            "<b>Valeur exacte</b> : garder $\\sqrt{2}$, $\\pi$ ou les fractions. <b>Valeur approchée</b> : respecter l'arrondi demandé (au dixième, au centième…)."
          ] },
        { titre: 'Rédiger : les phrases que le correcteur attend',
          texte: "Une bonne rédaction suit toujours le même plan : <b>données</b>, puis <b>propriété</b>, puis <b>conclusion</b>. Quelques modèles :<br><b>Théorème de Thalès.</b> Dans le triangle $ABC$, $M \\in [AB]$, $N \\in [AC]$ et $(MN) \\parallel (BC)$. D'après le théorème de Thalès : $$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}.$$ Avec $AM = 3$ cm, $AB = 6$ cm et $BC = 10$ cm, on obtient $MN = \\dfrac{AM \\times BC}{AB} = \\dfrac{3 \\times 10}{6} = 5$ cm.<br><b>Réciproque de Pythagore.</b> D'une part $BC^2 = 10^2 = 100$ ; d'autre part $AB^2 + AC^2 = 6^2 + 8^2 = 36 + 64 = 100$. Donc $BC^2 = AB^2 + AC^2$ et, d'après la réciproque du théorème de Pythagore, le triangle $ABC$ est rectangle en $A$.<br><b>Trigonométrie.</b> Dans ce triangle $ABC$ rectangle en $A$ : $\\cos \\widehat{ABC} = \\dfrac{AB}{BC} = \\dfrac{6}{10} = 0{,}6$.<br><b>Équation.</b> $3x - 7 = 2x + 1 \\iff 3x - 2x = 1 + 7 \\iff x = 8$. L'ensemble des solutions est $S = \\{8\\}$.",
          points: [
            "Nomme toujours le théorème ou la propriété que tu utilises.",
            "Pour la réciproque de Thalès, vérifie que les points sont alignés <b>dans le même ordre</b>, puis compare $\\dfrac{AM}{AB}$ et $\\dfrac{AN}{AC}$.",
            "Termine par une phrase de conclusion, avec l'unité."
          ] },
        { titre: 'Activités numériques : à savoir par cœur',
          texte: "<b>Identités remarquables</b> : $(a + b)^2 = a^2 + 2ab + b^2$ ; $(a - b)^2 = a^2 - 2ab + b^2$ ; $(a + b)(a - b) = a^2 - b^2$.<br><b>Racines carrées</b> ($a \\geq 0$, $b \\geq 0$) : $\\sqrt{ab} = \\sqrt{a}\\sqrt{b}$ ; $\\sqrt{a^2} = |a|$ pour tout réel $a$ ; $\\dfrac{1}{\\sqrt{a}} = \\dfrac{\\sqrt{a}}{a}$ si $a > 0$.<br><b>Équation produit nul</b> : $A \\times B = 0 \\iff A = 0$ ou $B = 0$.<br><b>Inéquations</b> : multiplier ou diviser les deux membres par un nombre négatif change le sens de l'inégalité.<br><b>Application affine</b> $f(x) = ax + b$ : $a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$ et $b = f(0)$.<br><b>Statistiques</b> : moyenne $\\bar{x} = \\dfrac{n_1x_1 + n_2x_2 + \\dots + n_px_p}{N}$ ; la médiane partage la série rangée en deux groupes de même effectif ; le mode est la valeur (ou la classe) de plus grand effectif.",
          points: [
            "Pour factoriser, cherche d'abord un facteur commun, puis une identité remarquable.",
            "Pour un système, choisis la substitution si une inconnue s'isole facilement, sinon la combinaison ; vérifie le couple trouvé dans les deux équations.",
            "Pour une inéquation, donne les solutions sous forme d'inégalité ou d'intervalle, et représente-les si on te le demande."
          ] },
        { titre: 'Activités géométriques : à savoir par cœur',
          texte: "<b>Pythagore</b> : si $ABC$ est rectangle en $A$, alors $BC^2 = AB^2 + AC^2$.<br><b>Trigonométrie</b> (triangle rectangle) : $\\cos \\hat{B} = \\dfrac{\\text{côté adjacent}}{\\text{hypoténuse}}$ ; $\\sin \\hat{B} = \\dfrac{\\text{côté opposé}}{\\text{hypoténuse}}$ ; $\\tan \\hat{B} = \\dfrac{\\text{côté opposé}}{\\text{côté adjacent}}$ ; $\\cos^2 x + \\sin^2 x = 1$ et $\\tan x = \\dfrac{\\sin x}{\\cos x}$.<br><b>Repérage</b> : $\\vect{AB}\\,(x_B - x_A \\,;\\, y_B - y_A)$ ; milieu $I\\left(\\dfrac{x_A + x_B}{2} \\,;\\, \\dfrac{y_A + y_B}{2}\\right)$ ; distance $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$ dans un repère orthonormé.<br><b>Vecteurs</b> : $\\vec{u}\\,(x \\,;\\, y)$ et $\\vec{v}\\,(x' \\,;\\, y')$ sont colinéaires si et seulement si $xy' - x'y = 0$.<br><b>Droites</b> : parallèles si elles ont le même coefficient directeur ; perpendiculaires (repère orthonormé) si $aa' = -1$.<br><b>Cercle</b> : un angle inscrit mesure la moitié de l'angle au centre qui intercepte le même arc.<br><b>Espace</b> : aire de la sphère $\\mathcal{A} = 4\\pi R^2$ ; volume de la boule $V = \\dfrac{4}{3}\\pi R^3$ ; pyramide et cône $V = \\dfrac{1}{3} \\times \\mathcal{B} \\times h$." },
        { titre: 'Construire une figure propre',
          texte: "Une figure juste aide à trouver la solution et rapporte souvent des points à elle seule. Fais d'abord une figure à main levée au brouillon, codée avec toutes les données. Sur la copie, trace en vraie grandeur si c'est demandé, au crayon bien taillé, avec la règle, l'équerre, le compas et le rapporteur. Laisse les traits de construction (arcs de cercle) : ils montrent ta méthode. Nomme tous les points et code les angles droits et les longueurs égales.",
          points: [
            "Le cercle circonscrit à un triangle rectangle a pour centre le milieu de l'hypoténuse.",
            "Dans un repère, respecte l'unité demandée et gradue les deux axes.",
            "Ne « lis » jamais une longueur sur la figure : calcule-la."
          ] },
        { titre: 'Les dernières semaines',
          texte: "Refais des sujets du BFEM des années précédentes en temps réel, puis corrige-toi avec soin. Reprends chaque jour, quelques minutes, tes fiches de formules. Pour chaque erreur, note dans un carnet la règle que tu avais oubliée, et relis ce carnet avant l'examen. Si la calculatrice est autorisée (vérifie-le), entraîne-toi avec <b>ta</b> calculatrice sur la trigonométrie et les statistiques, pour ne pas découvrir ses touches le jour J." }
      ],
      checklist: [
        "Convocation et pièce d'identité (ou le document demandé par ton établissement).",
        "Deux stylos (bleu ou noir), crayon, gomme, taille-crayon.",
        "Règle, équerre, compas, rapporteur.",
        "Calculatrice si elle est autorisée, avec des piles en bon état, réglée en mode <b>degrés</b> pour la trigonométrie.",
        "La veille : repérer le centre d'examen et le trajet, relire une fiche de formules, préparer le sac, se coucher tôt.",
        "Le jour J : petit-déjeuner, arrivée en avance, montre pour suivre le temps, eau si c'est permis.",
        "Téléphone : respecter le règlement du centre ; il ne doit pas être utilisé pendant l'épreuve.",
        "Au début : remplir l'en-tête de la copie, lire tout le sujet, choisir l'ordre des exercices.",
        "Avant de rendre : relire, vérifier les unités, les arrondis et les conclusions, numéroter les questions."
      ],
      erreurs: [
        "Écrire $(a + b)^2 = a^2 + b^2$ : il manque le double produit $2ab$.",
        "Écrire $\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$ : c'est faux, par exemple $\\sqrt{9 + 16} = 5$ et non $7$.",
        "Oublier de changer le sens d'une inégalité en divisant par un nombre négatif.",
        "Appliquer le théorème de Thalès sans avoir justifié le parallélisme, ou la réciproque sans vérifier l'ordre des points.",
        "Appliquer le théorème de Pythagore dans un triangle dont on ne sait pas qu'il est rectangle.",
        "Confondre côté adjacent et côté opposé, ou laisser la calculatrice en mode radians.",
        "Arrondir trop tôt : garde les valeurs exactes jusqu'au résultat final.",
        "Chercher la médiane sans avoir rangé la série, ou confondre médiane et moyenne.",
        "Oublier l'ensemble des solutions $S$, l'unité ou la phrase de conclusion."
      ]
    },

    /* ================================================================== */
    /* BAC S1 / S2                                                         */
    /* ================================================================== */
    {
      id: 'bac-s',
      titre: 'Réussir le BAC S1/S2',
      classe: 'tle-s1',
      classes: ['tle-s1', 'tle-s2'],
      resume: "En séries S1 et S2, les mathématiques sont une matière à fort coefficient. Le sujet demande de la technique (limites, dérivées, intégrales, complexes) et de la rigueur dans la rédaction. Ce guide t'explique comment aborder un sujet long, gérer ton temps et rédiger comme le correcteur l'attend.",
      sections: [
        { titre: "Comprendre l'épreuve",
          texte: "Le sujet comporte en général plusieurs <b>exercices</b> indépendants et un <b>problème</b>. Les exercices portent souvent sur les nombres complexes et les similitudes, les probabilités, les suites, les statistiques à deux variables et, en S1, l'arithmétique ou les coniques. Le problème est le plus souvent une étude de fonction (logarithme, exponentielle), prolongée par une suite, un calcul d'aire ou une équation différentielle ; il pèse lourd dans la note. Les sujets de S1 et de S2 sont différents. La durée et le barème figurent sur le sujet ; pour le coefficient, renseigne-toi auprès de ton établissement.",
          points: [
            "Les exercices rapportent des points rapidement : ne les néglige pas.",
            "Le problème est construit en parties (A, B, C…) : la partie A prépare souvent la partie B (par exemple, le signe d'une fonction auxiliaire $g$ donne le signe de $f'$).",
            "Un résultat donné par l'énoncé (« montrer que… ») peut être utilisé dans la suite, même si tu n'as pas réussi à le démontrer."
          ] },
        { titre: 'Gérer ton temps',
          texte: "Prends 10 à 15 minutes pour lire tout le sujet et décider de l'ordre de traitement. Répartis ensuite le temps à peu près selon les points : si le problème compte pour la moitié des points, il mérite environ la moitié du temps. Beaucoup de candidats commencent par les exercices qu'ils maîtrisent le mieux, puis consacrent un long bloc continu au problème. Garde un quart d'heure à la fin pour relire et compléter.",
          points: [
            "Fixe-toi une heure limite pour chaque exercice et respecte-la.",
            "Une question bloquante ? Écris clairement que tu admets le résultat (« J'admets que… ») et continue.",
            "Un calcul qui s'allonge sur des pages cache souvent une méthode plus courte, suggérée par la question précédente."
          ] },
        { titre: 'Lire le problème comme une histoire',
          texte: "Avant de calculer, parcours tout le problème : les questions de la fin éclairent celles du début. Repère les objets (fonction $f$, courbe $\\mathcal{C}$, suite $(u_n)$, aire $\\mathcal{A}$) et ce qu'on te demande d'établir. Les consignes les plus fréquentes :",
          points: [
            "<b>Étudier les variations</b> : dérivée, signe de la dérivée, tableau de variations complet avec les limites.",
            "<b>Interpréter graphiquement</b> : traduire une limite en asymptote, un nombre dérivé en tangente.",
            "<b>Montrer que l'équation $f(x) = 0$ admet une unique solution $\\alpha$</b> : continuité, stricte monotonie et changement de signe.",
            "<b>Donner un encadrement de $\\alpha$</b> : la calculatrice aide à trouver, mais il faut écrire les images qui justifient l'encadrement.",
            "<b>Calculer une aire</b> : une intégrale en unités d'aire, puis la conversion en cm² si l'énoncé la demande."
          ] },
        { titre: "Rédiger en analyse : les phrases clés",
          texte: "Le correcteur note la démarche autant que le résultat. Quelques modèles :<br><b>Dérivabilité.</b> La fonction $f$ est dérivable sur $]0 \\,;\\, +\\infty[$ comme somme et produit de fonctions dérivables sur cet intervalle, et pour tout $x > 0$, $f'(x) = \\dots$<br><b>Solution unique.</b> La fonction $f$ est continue et strictement croissante sur $[1 \\,;\\, 2]$, et $f(1) < 0 < f(2)$. D'après le théorème des valeurs intermédiaires appliqué à une fonction strictement monotone, l'équation $f(x) = 0$ admet une unique solution $\\alpha$ dans $[1 \\,;\\, 2]$.<br><b>Asymptote.</b> Comme $\\displaystyle\\lim_{x \\to +\\infty} \\left[f(x) - (2x + 1)\\right] = 0$, la droite d'équation $y = 2x + 1$ est asymptote oblique à $\\mathcal{C}$ en $+\\infty$.<br><b>Récurrence.</b> Montrons par récurrence que, pour tout $n \\in \\N$, $0 < u_n < 2$. <i>Initialisation</i> : $u_0 = 1$, donc $0 < u_0 < 2$. <i>Hérédité</i> : supposons que $0 < u_n < 2$ pour un entier $n$ et montrons que $0 < u_{n+1} < 2$… <i>Conclusion</i> : la propriété est vraie au rang $0$ et héréditaire, donc elle est vraie pour tout $n \\in \\N$." },
        { titre: 'Rédiger en algèbre et en probabilités',
          texte: "<b>Discriminant.</b> Calculons le discriminant de $z^2 - 2z + 5 = 0$ : $\\Delta = (-2)^2 - 4 \\times 5 = -16 = (4i)^2$. Comme $\\Delta < 0$, l'équation admet dans $\\C$ deux solutions conjuguées : $z_1 = \\dfrac{2 - 4i}{2} = 1 - 2i$ et $z_2 = 1 + 2i$.<br><b>Forme exponentielle.</b> Pour $z = 1 + i$ : $|z| = \\sqrt{1^2 + 1^2} = \\sqrt{2}$ ; $\\cos\\theta = \\dfrac{\\sqrt{2}}{2}$ et $\\sin\\theta = \\dfrac{\\sqrt{2}}{2}$, donc $\\theta = \\dfrac{\\pi}{4}$ à $2\\pi$ près, et $z = \\sqrt{2}\\,e^{i\\frac{\\pi}{4}}$.<br><b>Loi binomiale.</b> On répète $5$ fois, de façon indépendante, une épreuve de Bernoulli dont la probabilité de succès est $p = 0{,}3$. La variable $X$ qui compte les succès suit la loi binomiale $\\mathcal{B}(5 \\,;\\, 0{,}3)$, donc $P(X = 2) = C_5^2 \\times 0{,}3^2 \\times 0{,}7^3 = 0{,}3087$.",
          points: [
            "Définis toujours les événements avec des lettres avant de calculer : « Notons $R$ l'événement… ».",
            "Justifie le modèle (équiprobabilité, épreuves indépendantes) avant d'appliquer une formule.",
            "Donne les probabilités sous forme exacte (fraction), puis décimale si on te le demande."
          ] },
        { titre: 'Analyse : à savoir par cœur',
          texte: "<b>Dérivées</b> : $(u^n)' = nu'u^{n-1}$ ; $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$ ; $(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$ ; $(\\ln u)' = \\dfrac{u'}{u}$ ; $(e^u)' = u'e^u$.<br><b>Tangente</b> au point d'abscisse $a$ : $y = f'(a)(x - a) + f(a)$.<br><b>Logarithme et exponentielle</b> ($a > 0$, $b > 0$) : $\\ln(ab) = \\ln a + \\ln b$ ; $\\ln\\left(\\dfrac{a}{b}\\right) = \\ln a - \\ln b$ ; $\\ln(a^n) = n\\ln a$ ; $e^{x + y} = e^x e^y$ ; $e^{\\ln a} = a$.<br><b>Limites de référence</b> : $\\displaystyle\\lim_{x \\to +\\infty} \\frac{\\ln x}{x} = 0$ ; $\\displaystyle\\lim_{x \\to 0^+} x\\ln x = 0$ ; $\\displaystyle\\lim_{x \\to +\\infty} \\frac{e^x}{x} = +\\infty$ ; $\\displaystyle\\lim_{x \\to -\\infty} xe^x = 0$ ; $\\displaystyle\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$ ; $\\displaystyle\\lim_{x \\to 0} \\frac{\\ln(1 + x)}{x} = 1$.<br><b>Intégrales</b> : $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$ ; par parties, $\\displaystyle\\int_a^b u'v\\,dx = \\big[uv\\big]_a^b - \\int_a^b uv'\\,dx$.<br><b>Suites</b> : arithmétique $u_n = u_0 + nr$ ; géométrique $u_n = u_0q^n$ ; $1 + q + \\dots + q^n = \\dfrac{1 - q^{n+1}}{1 - q}$ pour $q \\neq 1$.<br><b>Équations différentielles</b> : les solutions de $y' = ay$ sont $y = Ce^{ax}$ ; celles de $y'' + \\omega^2y = 0$ sont $y = A\\cos(\\omega x) + B\\sin(\\omega x)$ ; pour $y'' + ay' + by = 0$, on résout l'équation caractéristique $r^2 + ar + b = 0$." },
        { titre: 'Algèbre, géométrie et probabilités : à savoir par cœur',
          texte: "<b>Nombres complexes</b> : pour $z = a + ib$, $|z| = \\sqrt{a^2 + b^2}$, $\\bar{z} = a - ib$ et $z\\bar{z} = |z|^2$ ; forme exponentielle $z = re^{i\\theta}$ avec $r = |z|$ et $\\theta = \\arg z$ ; $|zz'| = |z|\\,|z'|$ et $\\arg(zz') = \\arg z + \\arg z'$ à $2\\pi$ près ; formule de Moivre $(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$ ; formules d'Euler $\\cos\\theta = \\dfrac{e^{i\\theta} + e^{-i\\theta}}{2}$ et $\\sin\\theta = \\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i}$.<br><b>Similitude directe</b> $z' = az + b$ avec $a \\neq 0$ et $a \\neq 1$ : rapport $|a|$, angle $\\arg a$, centre d'affixe $\\dfrac{b}{1 - a}$.<br><b>Probabilités</b> : $P(\\overline{A}) = 1 - P(A)$ ; $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ ; $P_B(A) = \\dfrac{P(A \\cap B)}{P(B)}$ ; loi binomiale $P(X = k) = C_n^k\\,p^k(1 - p)^{n-k}$, d'espérance $np$ ; $E(X) = \\sum x_ip_i$ et $V(X) = E(X^2) - \\left(E(X)\\right)^2$.<br><b>Statistiques à deux variables</b> : $\\operatorname{cov}(x, y) = \\dfrac{1}{N}\\sum n_ix_iy_i - \\bar{x}\\,\\bar{y}$ ; $r = \\dfrac{\\operatorname{cov}(x, y)}{\\sigma_x\\sigma_y}$ ; droite de régression de $y$ en $x$ : $y = ax + b$ avec $a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$ et $b = \\bar{y} - a\\bar{x}$.<br><b>En S1</b> : théorème de Bézout ($a$ et $b$ sont premiers entre eux si et seulement s'il existe des entiers $u$ et $v$ tels que $au + bv = 1$) ; théorème de Gauss ; petit théorème de Fermat ($a^{p-1} \\equiv 1 \\pmod p$ si $p$ est premier et ne divise pas $a$) ; coniques définies par foyer et directrice : $MF = e \\times MH$." },
        { titre: "Le problème d'analyse : la méthode type",
          texte: "La plupart des problèmes suivent le même chemin. Entraîne-toi à le dérouler sans hésiter :",
          points: [
            "<b>Ensemble de définition</b> : $\\ln u$ exige $u > 0$ ; un quotient exige un dénominateur non nul ; $\\sqrt{u}$ exige $u \\geq 0$.",
            "<b>Limites</b> aux bornes, avec leur interprétation : asymptote verticale ($x = a$), horizontale ($y = b$) ou oblique ($y = ax + b$).",
            "<b>Dérivée</b> : justifier la dérivabilité, calculer $f'(x)$ et l'écrire sous une forme dont le signe est facile à étudier (produit ou quotient factorisé).",
            "<b>Tableau de variations</b> complet : signe de $f'$, sens de variation, valeurs des extremums et limites.",
            "<b>Points particuliers</b> : tangentes demandées, intersections avec les axes, position de la courbe par rapport à une asymptote (signe de $f(x) - (ax + b)$).",
            "<b>Courbe</b> : respecter l'unité graphique, tracer d'abord les asymptotes et les tangentes, placer quelques points calculés, vérifier l'accord avec le tableau.",
            "<b>Aire</b> : si $f \\geq g$ sur $[a \\,;\\, b]$, $\\mathcal{A} = \\displaystyle\\int_a^b \\left(f(x) - g(x)\\right)dx$ unités d'aire ; avec une unité de $2$ cm sur chaque axe, $1$ u.a. $= 4$ cm²."
          ] },
        { titre: 'Calculatrice et vérifications',
          texte: "La calculatrice (si elle est autorisée : vérifie le règlement) sert à contrôler, pas à remplacer la justification. Utilise-la pour vérifier le signe d'une expression en quelques points, calculer des images pour tracer la courbe, encadrer $\\alpha$, contrôler une intégrale ou une probabilité. Pour les fonctions trigonométriques en analyse et pour les arguments, règle-la en mode <b>radians</b>.",
          points: [
            "Une probabilité est comprise entre $0$ et $1$ ; une aire est positive ; $-1 \\leq r \\leq 1$.",
            "Si ton tableau dit que $f$ est croissante, ta courbe doit monter : compare-les.",
            "Vérifie une primitive en la dérivant, et une solution d'équation en la remplaçant."
          ] }
      ],
      checklist: [
        "Convocation et pièce d'identité.",
        "Stylos (bleu ou noir) de rechange, crayon, gomme, règle, équerre, compas, rapporteur.",
        "Calculatrice autorisée, piles ou batterie vérifiées ; savoir passer des degrés aux radians et utiliser le tableau de valeurs.",
        "La veille : relire la fiche de formules (dérivées, limites, complexes, probabilités), préparer le sac, repérer le centre, dormir.",
        "Le jour J : arriver en avance, avec une montre et de l'eau si c'est permis ; téléphone selon le règlement du centre.",
        "Au début : remplir l'en-tête de la copie, lire tout le sujet, choisir l'ordre de traitement.",
        "Pendant : indiquer clairement le numéro de chaque exercice et de chaque question.",
        "À la fin : relire les conclusions et les unités (u.a., cm²), numéroter les feuilles."
      ],
      erreurs: [
        "Écrire $\\ln(a + b) = \\ln a + \\ln b$ ou $e^{a + b} = e^a + e^b$ : c'est faux.",
        "Oublier l'ensemble de définition, en particulier la condition $u(x) > 0$ pour $\\ln u(x)$.",
        "Donner un tableau de variations sans les limites ni les valeurs des extremums.",
        "Affirmer qu'une solution est unique sans invoquer la stricte monotonie.",
        "Faire une récurrence sans initialisation, ou utiliser dans l'hérédité ce qu'on veut démontrer.",
        "Lever une forme indéterminée au hasard : factorise par le terme dominant ou utilise une limite de référence.",
        "Se tromper d'argument : pour $z = -1 + i$, l'argument est $\\dfrac{3\\pi}{4}$ et non $-\\dfrac{\\pi}{4}$ ; vérifie toujours les signes de $\\cos\\theta$ et de $\\sin\\theta$.",
        "Confondre arrangements et combinaisons, ou trouver une probabilité supérieure à $1$ sans s'en inquiéter.",
        "Oublier de convertir l'aire en cm² quand l'énoncé le demande."
      ]
    },

    /* ================================================================== */
    /* BAC L                                                               */
    /* ================================================================== */
    {
      id: 'bac-l',
      titre: 'Réussir le BAC L',
      classe: 'tle-l',
      resume: "En Terminale L, l'épreuve de mathématiques récompense le travail régulier : beaucoup de questions sont des applications directes du cours. Ce guide t'aide à ne laisser aucun point facile, à aborder sereinement l'étude de fonction et à rédiger clairement.",
      sections: [
        { titre: "Comprendre l'épreuve",
          texte: "Le sujet comporte en général des <b>exercices</b> (suites, statistiques à deux variables, dénombrement et probabilités, parfois pourcentages) et un <b>problème</b> d'étude de fonction, souvent avec le logarithme népérien ou l'exponentielle. Le coefficient des mathématiques dépend de ta série et la durée figure sur le sujet : renseigne-toi auprès de ton établissement.",
          points: [
            "Les exercices ressemblent souvent aux exemples du cours : ce sont des points à ne pas laisser.",
            "Le problème est découpé en petites questions guidées : avance question par question.",
            "Même si les mathématiques ne sont pas ta matière principale, chaque point gagné compte dans la moyenne."
          ] },
        { titre: 'Gérer ton temps',
          texte: "Lis tout le sujet avant de commencer. Débute par l'exercice que tu maîtrises le mieux (souvent les statistiques ou les suites) pour prendre confiance, puis consacre un bloc de temps continu au problème. Répartis le temps à peu près selon les points et garde une dizaine de minutes pour relire.",
          points: [
            "Note sur ton brouillon l'heure à laquelle tu dois passer au problème.",
            "Une question te bloque ? Passe à la suivante : les questions d'un problème sont souvent indépendantes ou s'appuient sur un résultat donné."
          ] },
        { titre: 'Rédiger : des modèles à suivre',
          texte: "Chaque réponse doit être justifiée par un calcul ou une propriété du cours, puis conclue par une phrase. Quelques modèles :<br><b>Suite géométrique.</b> Une somme de $200\\,000$ F CFA est placée à $5$ % par an à intérêts composés. Chaque année, le capital est multiplié par $1 + \\dfrac{5}{100} = 1{,}05$, donc $C_{n+1} = 1{,}05\\,C_n$. La suite $(C_n)$ est géométrique de raison $q = 1{,}05$ et de premier terme $C_0 = 200\\,000$ ; ainsi $C_n = 200\\,000 \\times 1{,}05^n$.<br><b>Équation avec logarithme.</b> Pour $x > 0$ : $\\ln x = 2 \\iff x = e^2$. Comme $e^2 > 0$, l'ensemble des solutions est $S = \\{e^2\\}$.<br><b>Équation avec exponentielle.</b> $e^{2x - 1} = 3 \\iff 2x - 1 = \\ln 3 \\iff x = \\dfrac{1 + \\ln 3}{2}$.<br><b>Probabilité.</b> Une urne contient $3$ boules rouges et $2$ vertes ; on en tire $2$ simultanément. Notons $A$ l'événement « obtenir deux boules rouges ». Les tirages sont équiprobables, donc $P(A) = \\dfrac{\\Card(A)}{\\Card(\\Omega)} = \\dfrac{C_3^2}{C_5^2} = \\dfrac{3}{10}$." },
        { titre: 'Les formules à connaître par cœur',
          texte: "<b>Logarithme</b> ($a > 0$, $b > 0$) : $\\ln 1 = 0$ ; $\\ln e = 1$ ; $\\ln(ab) = \\ln a + \\ln b$ ; $\\ln\\left(\\dfrac{a}{b}\\right) = \\ln a - \\ln b$ ; $\\ln(a^n) = n\\ln a$.<br><b>Exponentielle</b> : $e^0 = 1$ ; $e^{a + b} = e^a \\times e^b$ ; $e^{\\ln x} = x$ pour $x > 0$ ; $\\ln(e^x) = x$.<br><b>Dérivées</b> : $(\\ln x)' = \\dfrac{1}{x}$ ; $(e^x)' = e^x$ ; $(\\ln u)' = \\dfrac{u'}{u}$ ; $(e^u)' = u'e^u$ ; $(uv)' = u'v + uv'$ ; $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$.<br><b>Limites</b> : $\\displaystyle\\lim_{x \\to +\\infty} \\ln x = +\\infty$ ; $\\displaystyle\\lim_{x \\to 0^+} \\ln x = -\\infty$ ; $\\displaystyle\\lim_{x \\to +\\infty} e^x = +\\infty$ ; $\\displaystyle\\lim_{x \\to -\\infty} e^x = 0$.<br><b>Suites</b> : arithmétique $u_n = u_0 + nr$, et la somme de $k$ termes consécutifs vaut $k \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$ ; géométrique $u_n = u_0 \\times q^n$, et $u_0 + u_1 + \\dots + u_{n-1} = u_0 \\times \\dfrac{1 - q^n}{1 - q}$ pour $q \\neq 1$.<br><b>Pourcentages</b> : augmenter de $t$ % revient à multiplier par $1 + \\dfrac{t}{100}$ ; diminuer de $t$ %, à multiplier par $1 - \\dfrac{t}{100}$.<br><b>Statistiques</b> : point moyen $G(\\bar{x} \\,;\\, \\bar{y})$ ; $V(x) = \\dfrac{1}{n}\\sum x_i^2 - \\bar{x}^2$ ; $\\operatorname{cov}(x, y) = \\dfrac{1}{n}\\sum x_iy_i - \\bar{x}\\,\\bar{y}$ ; $r = \\dfrac{\\operatorname{cov}(x, y)}{\\sqrt{V(x)V(y)}}$ ; droite de régression $y = ax + b$ avec $a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$ et $b = \\bar{y} - a\\bar{x}$.<br><b>Dénombrement et probabilités</b> : $n! = 1 \\times 2 \\times \\dots \\times n$ ; $A_n^p = \\dfrac{n!}{(n - p)!}$ ; $C_n^p = \\dfrac{n!}{p!\\,(n - p)!}$ ; $P(\\overline{A}) = 1 - P(A)$ ; $E(X) = \\sum x_ip_i$." },
        { titre: "Le problème : l'étude de fonction pas à pas",
          texte: "Les étapes sont presque toujours les mêmes : ensemble de définition, limites aux bornes, dérivée, signe de la dérivée, tableau de variations, puis courbe. Exemple : $f(x) = x - 1 - \\ln x$ sur $]0 \\,;\\, +\\infty[$. On a $f'(x) = 1 - \\dfrac{1}{x} = \\dfrac{x - 1}{x}$. Comme $x > 0$, $f'(x)$ a le signe de $x - 1$ : $f$ est décroissante sur $]0 \\,;\\, 1]$ et croissante sur $[1 \\,;\\, +\\infty[$. Son minimum est $f(1) = 0$, donc $f(x) \\geq 0$ pour tout $x > 0$, c'est-à-dire $\\ln x \\leq x - 1$.",
          points: [
            "Écris la dérivée sous une forme factorisée : son signe se lit alors facilement.",
            "Dans le tableau de variations, fais figurer les limites et les valeurs des extremums.",
            "Pour tracer la courbe, place d'abord les asymptotes et quelques points calculés, puis vérifie l'accord avec le tableau."
          ] },
        { titre: 'Statistiques et probabilités : la méthode',
          texte: "Pour une série double, présente les calculs dans un tableau (colonnes $x_i$, $y_i$, $x_i^2$, $x_iy_i$) et fais les sommes : tu limites les erreurs et le correcteur suit ta démarche. Utilise le mode statistique de la calculatrice, si elle est autorisée, pour <b>vérifier</b> $\\bar{x}$, $\\bar{y}$ et $r$. En probabilités, commence toujours par décrire l'univers et compter ses issues : l'ordre compte-t-il (arrangements) ou non (combinaisons) ? Y a-t-il remise ($n^p$ issues) ?",
          points: [
            "« Au moins un » : passe par l'événement contraire.",
            "Garde les fractions exactes, puis donne une valeur décimale si on te la demande.",
            "Une estimation par la droite d'ajustement se conclut par une phrase : « On peut estimer que… »."
          ] },
        { titre: 'Les dernières semaines',
          texte: "Refais des sujets du BAC L des années précédentes, en temps limité, et corrige-toi avec soin. Apprends les formules de la fiche par petites doses chaque jour plutôt qu'en une seule fois. Reprends en priorité les points qui reviennent chaque année : étude de fonction avec $\\ln$ ou $\\exp$, suites, ajustement affine, dénombrement. Pour chaque erreur, note la bonne règle dans un carnet et relis-le avant l'examen." }
      ],
      checklist: [
        "Convocation et pièce d'identité.",
        "Stylos de rechange, crayon, gomme, règle, équerre, compas.",
        "Calculatrice si elle est autorisée, avec des piles en bon état ; savoir utiliser son mode statistique.",
        "La veille : relire la fiche de formules (ln, exp, suites, statistiques, dénombrement), préparer le sac, repérer le centre, dormir.",
        "Le jour J : arriver en avance, avec une montre et de l'eau si c'est permis ; téléphone selon le règlement du centre.",
        "Au début : remplir l'en-tête de la copie, lire tout le sujet, choisir l'ordre de traitement.",
        "À la fin : relire les conclusions, les arrondis et la numérotation des questions."
      ],
      erreurs: [
        "Écrire $\\ln(a + b) = \\ln a + \\ln b$ : c'est $\\ln(ab)$ qui vaut $\\ln a + \\ln b$.",
        "Écrire $e^{a + b} = e^a + e^b$ : en réalité $e^{a + b} = e^a \\times e^b$.",
        "Oublier la condition $x > 0$ pour $\\ln x$ et garder une « solution » négative.",
        "Se tromper de premier terme : $u_n = u_0q^n$ si la suite commence à $u_0$, mais $u_n = u_1q^{n-1}$ si elle commence à $u_1$.",
        "Croire qu'une hausse de 10 % suivie d'une baisse de 10 % ramène au prix de départ : $1{,}1 \\times 0{,}9 = 0{,}99$, on a perdu 1 %.",
        "Utiliser des arrangements pour un tirage simultané (l'ordre ne compte pas : combinaisons).",
        "Arrondir trop tôt dans les calculs de variance et de covariance.",
        "Tracer une droite d'ajustement qui ne passe pas par le point moyen $G$.",
        "Donner un tableau de variations sans les limites."
      ]
    },

    /* ================================================================== */
    /* MÉTHODES DE TRAVAIL (toutes classes)                                */
    /* ================================================================== */
    {
      id: 'methodes',
      titre: 'Méthodes de travail',
      classe: null,
      resume: "Bien travailler, cela s'apprend. Ces méthodes, valables du CM2 à la Terminale, t'aident à retenir plus longtemps, à t'entraîner efficacement, à travailler avec d'autres, à gérer ton stress et à vérifier tes résultats.",
      sections: [
        { titre: 'Organiser ses révisions',
          texte: "Commence tôt. Quelques semaines avant l'examen, fais la liste de tous les chapitres et classe-les en trois groupes : « je maîtrise », « à revoir », « je ne comprends pas ». Construis un planning réaliste, semaine par semaine, qui revient plusieurs fois sur chaque chapitre et garde des créneaux pour des sujets complets. Des séances courtes et régulières valent mieux qu'une longue nuit blanche : par exemple 40 à 50 minutes de travail concentré, puis une pause de 5 à 10 minutes.",
          points: [
            "Commence chaque séance par ce qui est le plus difficile, quand tu es encore frais.",
            "Mélange les chapitres d'une séance à l'autre : tu t'entraînes ainsi à reconnaître la bonne méthode, comme le jour de l'examen.",
            "Prévois aussi du repos, du sport et du temps en famille ; le sommeil aide à fixer ce que tu as appris."
          ] },
        { titre: 'La révision espacée',
          texte: "On oublie vite ce qu'on vient d'apprendre, mais chaque révision ralentit l'oubli. L'idée de la révision espacée : revoir une notion à des intervalles de plus en plus longs, par exemple le lendemain, trois jours plus tard, une semaine plus tard, puis un mois plus tard. À chaque fois, <b>interroge-toi</b> au lieu de simplement relire : cache ta fiche et essaie de retrouver la formule, refais l'exercice sans regarder la correction. C'est cet effort pour se souvenir qui fixe durablement les connaissances.",
          points: [
            "Utilise des cartes de révision : une question d'un côté, la réponse de l'autre. Celles que tu rates reviennent plus souvent, celles que tu réussis plus rarement.",
            "Dix minutes de cartes chaque jour valent mieux que deux heures une fois par semaine.",
            "Note dans ton agenda quand revoir chaque chapitre."
          ] },
        { titre: "S'entraîner activement",
          texte: "Relire son cours donne l'impression de savoir ; seul l'exercice montre si l'on sait vraiment. Pour chaque chapitre : apprends les définitions et les propriétés, refais les exemples du cours sans regarder la solution, puis cherche des exercices de difficulté croissante. Quand tu bloques, cherche au moins quelques minutes avant de regarder la correction ; ensuite, refais l'exercice seul le lendemain.",
          points: [
            "Tiens un carnet d'erreurs : pour chaque erreur, écris la bonne règle et un exemple. Relis-le avant chaque devoir.",
            "Explique une méthode à voix haute, comme si tu l'enseignais : là où ton explication bloque, tu as trouvé ce qu'il faut revoir.",
            "Fais des fiches courtes (formules, méthodes types, pièges) : une fiche par chapitre suffit."
          ] },
        { titre: 'Travailler à plusieurs',
          texte: "Réviser en groupe de trois ou quatre est très efficace si le groupe est organisé. Fixez à chaque séance un objectif précis (un chapitre, un sujet d'examen) et une durée. Chacun prépare un exercice à l'avance et l'explique aux autres, qui posent des questions et vérifient. Interrogez-vous mutuellement sur les formules et les définitions.",
          points: [
            "Expliquer à un camarade oblige à mettre de l'ordre dans ses idées : c'est l'une des meilleures façons d'apprendre.",
            "Celui qui comprend moins vite n'est pas un poids : en lui expliquant, tu consolides tes propres connaissances.",
            "Téléphones rangés pendant la séance ; la pause vient après le travail.",
            "Le groupe ne remplace pas le travail personnel : chacun refait ensuite les exercices seul."
          ] },
        { titre: 'Utiliser le brouillon',
          texte: "Le brouillon est ton espace de recherche, et personne ne le note : profites-en. Fais-y une figure à main levée avec toutes les données, des essais, des calculs intermédiaires. Organise-le quand même : numérote les exercices et les questions pour retrouver vite un calcul. En revanche, ne rédige pas toute la solution au brouillon pour la recopier ensuite : tu perdrais un temps précieux. Cherche au brouillon, puis rédige directement au propre les étapes importantes.",
          points: [
            "Partage ta feuille de brouillon en zones, une par exercice.",
            "Encadre les résultats trouvés au brouillon pour les recopier sans erreur.",
            "Note sur le brouillon l'heure à laquelle tu dois passer à l'exercice suivant."
          ] },
        { titre: 'Vérifier ses résultats',
          texte: "Quelques réflexes permettent de repérer la plupart des erreurs avant de rendre ta copie :",
          points: [
            "<b>Remplacer</b> : une solution d'équation se vérifie en la remplaçant. Pour $2x + 3 = 11$, on trouve $x = 4$ ; vérification : $2 \\times 4 + 3 = 11$.",
            "<b>Tester une valeur</b> : un développement se contrôle avec un nombre simple. Pour $(x + 3)^2 = x^2 + 6x + 9$, avec $x = 2$ : $(2 + 3)^2 = 25$ et $4 + 12 + 9 = 25$.",
            "<b>Ordre de grandeur</b> : $49 \\times 21$ est proche de $50 \\times 20 = 1\\,000$ ; un résultat de $10\\,290$ est donc faux (le bon résultat est $1\\,029$).",
            "<b>Vraisemblance</b> : une longueur est positive, l'hypoténuse est le plus grand côté d'un triangle rectangle, une probabilité est comprise entre $0$ et $1$, un prix après remise est plus petit qu'avant.",
            "<b>Unités</b> : une aire s'exprime en unités carrées, un volume en unités cubes ; toutes les données doivent être dans la même unité.",
            "<b>Contrôler par une autre voie</b> : dériver une primitive trouvée, comparer le signe d'une dérivée avec l'allure de la courbe, refaire un calcul avec la calculatrice quand elle est permise."
          ] },
        { titre: 'Gérer le stress',
          texte: "Un peu de stress aide à se concentrer ; trop de stress bloque. Le meilleur remède est la préparation : plus tu as traité de sujets dans les conditions de l'examen, plus le jour J te semblera familier. Si tu sens la panique monter, pose ton stylo et respire lentement plusieurs fois : inspire par le nez en comptant jusqu'à quatre, expire doucement en comptant jusqu'à six. Puis reprends par une question facile pour retrouver confiance.",
          points: [
            "Dors suffisamment les jours qui précèdent l'examen : une nuit blanche fait perdre plus de points qu'elle n'en fait gagner.",
            "Mange et bois normalement, et évite l'excès de café ou de boissons énergisantes.",
            "Bloqué sur une question ? Ce n'est pas un échec : passe à la suite et reviens-y plus tard.",
            "Entre deux épreuves, ne compare pas tes réponses avec celles des autres : concentre-toi sur la suivante.",
            "Parle de ton stress à tes parents, à un professeur ou à un camarade : tu n'es pas seul."
          ] },
        { titre: 'Tirer parti du logiciel',
          texte: "Pour chaque chapitre, lis le cours et les méthodes, puis fais les exercices : ils changent à chaque tirage, avec des indices et une correction détaillée. Révise les formules avec les cartes de révision espacée, qui reviennent au bon moment. Quand un chapitre est maîtrisé, entraîne-toi sur un examen blanc chronométré, dans les conditions du jour J." }
      ],
      checklist: [
        "La veille : préparer le sac (convocation, pièce d'identité, stylos, instruments, calculatrice si elle est autorisée) et le poser près de la porte.",
        "La veille : relire ses fiches et son carnet d'erreurs, sans attaquer de nouveau chapitre.",
        "Régler le réveil en gardant une marge pour les imprévus de transport.",
        "Le jour J : petit-déjeuner, eau, arrivée en avance.",
        "En début d'épreuve : lire tout le sujet, repérer les exercices faciles, planifier son temps.",
        "En fin d'épreuve : relire, vérifier, numéroter les pages et les questions."
      ],
      erreurs: [
        "Relire son cours sans jamais s'interroger, et croire qu'on le sait.",
        "Tout réviser la dernière nuit.",
        "Ne refaire que les exercices qu'on sait déjà faire.",
        "Regarder la correction dès qu'on bloque, sans chercher.",
        "Travailler avec le téléphone allumé à côté de soi.",
        "Négliger le sommeil pendant la période des examens.",
        "Rédiger toute la solution au brouillon, puis manquer de temps pour la recopier."
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
