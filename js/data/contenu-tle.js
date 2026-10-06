/*
 * ELITE MATHÉMATIQUE — contenu pédagogique des classes de Terminale (BAC).
 * Tle S1 et Tle S2 (chapitres ts-…, ts1-…) ; Tle L (chapitres tl-…).
 * Les problèmes « au Sénégal » utilisent des données fictives mais plausibles.
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  EM.contenu = EM.contenu || {};

  /* ================================================================== */
  /* Tle S1 / S2 — Limites et continuité                                 */
  /* ================================================================== */
  EM.contenu['ts-limites'] = {
    resume: "Calculer des limites (opérations, formes indéterminées, comparaison, composition), les interpréter graphiquement par des asymptotes et exploiter la continuité grâce au théorème des valeurs intermédiaires.",
    objectifs: [
      "Calculer la limite d'une somme, d'un produit, d'un quotient et lever une forme indéterminée",
      "Utiliser les théorèmes de comparaison (dont le théorème des gendarmes) et la limite d'une fonction composée",
      "Interpréter graphiquement une limite : asymptotes verticale, horizontale, oblique et branches paraboliques",
      "Justifier la continuité d'une fonction sur un intervalle",
      "Démontrer qu'une équation $f(x) = k$ admet une unique solution sur un intervalle et l'encadrer"
    ],
    cours: [
      { type: 'definition', titre: 'Limites et asymptotes', texte: "Si $\\lim\\limits_{x \\to a} f(x) = \\pm\\infty$, la droite d'équation $x = a$ est <b>asymptote verticale</b> à $\\mathcal{C}_f$.<br>Si $\\lim\\limits_{x \\to \\pm\\infty} f(x) = \\ell$, la droite d'équation $y = \\ell$ est <b>asymptote horizontale</b>.<br>Si $\\lim\\limits_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$, la droite d'équation $y = ax + b$ est <b>asymptote oblique</b>." },
      { type: 'propriete', titre: 'Formes indéterminées', texte: "Les opérations sur les limites ne permettent pas de conclure dans quatre cas : « $+\\infty - \\infty$ », « $0 \\times \\infty$ », « $\\dfrac{\\infty}{\\infty}$ » et « $\\dfrac{0}{0}$ ». On lève l'indétermination en factorisant, en simplifiant, en multipliant par la quantité conjuguée ou en reconnaissant un taux d'accroissement." },
      { type: 'propriete', titre: 'Polynômes et fonctions rationnelles en $\\pm\\infty$', texte: "En $+\\infty$ ou en $-\\infty$, une fonction polynôme a la même limite que son terme de plus haut degré, et une fonction rationnelle a la même limite que le quotient des termes de plus haut degré de son numérateur et de son dénominateur.<br>Exemple : $\\lim\\limits_{x \\to +\\infty} \\dfrac{2x^2 - x}{5x^2 + 3} = \\lim\\limits_{x \\to +\\infty} \\dfrac{2x^2}{5x^2} = \\dfrac{2}{5}$." },
      { type: 'theoreme', titre: 'Théorèmes de comparaison', texte: "Si $f(x) \\geq g(x)$ au voisinage de $+\\infty$ et $\\lim\\limits_{x \\to +\\infty} g(x) = +\\infty$, alors $\\lim\\limits_{x \\to +\\infty} f(x) = +\\infty$.<br><b>Théorème des gendarmes</b> : si $g(x) \\leq f(x) \\leq h(x)$ au voisinage de $+\\infty$ et si $g$ et $h$ ont la même limite finie $\\ell$, alors $\\lim\\limits_{x \\to +\\infty} f(x) = \\ell$." },
      { type: 'theoreme', titre: 'Limite d\'une fonction composée', texte: "Si $\\lim\\limits_{x \\to a} u(x) = b$ et $\\lim\\limits_{X \\to b} v(X) = c$, alors $\\lim\\limits_{x \\to a} v(u(x)) = c$ ($a$, $b$, $c$ réels ou infinis).<br>Exemple : $\\lim\\limits_{x \\to +\\infty} \\sqrt{\\dfrac{4x + 1}{x}} = \\sqrt{4} = 2$." },
      { type: 'definition', titre: 'Continuité', texte: "$f$ est continue en $a$ si $\\lim\\limits_{x \\to a} f(x) = f(a)$ ; elle est continue sur un intervalle $I$ si elle est continue en tout point de $I$. Les fonctions polynômes, rationnelles, racine carrée, $\\ln$, $\\exp$, $\\sin$ et $\\cos$ sont continues sur chaque intervalle de leur ensemble de définition ; sommes, produits, quotients et composées de fonctions continues sont continus." },
      { type: 'theoreme', titre: 'Théorème des valeurs intermédiaires (bijection)', texte: "Si $f$ est <b>continue</b> et <b>strictement monotone</b> sur $[a \\,;\\, b]$, alors pour tout réel $k$ compris entre $f(a)$ et $f(b)$, l'équation $f(x) = k$ admet une <b>unique</b> solution dans $[a \\,;\\, b]$. En particulier, si $f(a) \\times f(b) < 0$, l'équation $f(x) = 0$ admet une unique solution dans $]a \\,;\\, b[$." },
      { type: 'remarque', titre: 'Branches paraboliques', texte: "Si $\\lim\\limits_{x \\to +\\infty} f(x) = \\pm\\infty$ et $\\lim\\limits_{x \\to +\\infty} \\dfrac{f(x)}{x} = \\pm\\infty$, la courbe admet une branche parabolique de direction $(Oy)$ ; si $\\lim\\limits_{x \\to +\\infty} \\dfrac{f(x)}{x} = 0$, une branche parabolique de direction $(Ox)$." }
    ],
    methodes: [
      { titre: 'Lever une forme indéterminée en $\\pm\\infty$', etapes: [
        "Repère la forme indéterminée en appliquant d'abord les règles opératoires.",
        "Factorise le numérateur et le dénominateur par leur terme prépondérant (plus haut degré, $e^x$, $x$…).",
        "Simplifie, puis utilise les limites de référence pour conclure."
      ] },
      { titre: 'Montrer que $f(x) = 0$ admet une unique solution $\\alpha$ dans $[a \\,;\\, b]$', etapes: [
        "Justifie que $f$ est continue sur $[a \\,;\\, b]$.",
        "Montre que $f$ est strictement monotone sur $[a \\,;\\, b]$ (signe de $f'$ ou tableau de variations).",
        "Calcule $f(a)$ et $f(b)$ et vérifie qu'ils sont de signes contraires.",
        "Conclus avec le théorème des valeurs intermédiaires, puis encadre $\\alpha$ par balayage à la calculatrice."
      ] }
    ],
    exemple: {
      enonce: "Soit $f(x) = x^3 + x - 1$. Montrer que l'équation $f(x) = 0$ admet une unique solution $\\alpha$ dans $[0 \\,;\\, 1]$, puis donner un encadrement de $\\alpha$ d'amplitude $10^{-1}$.",
      solution: [
        "$f$ est une fonction polynôme : elle est continue sur $\\R$.",
        "$f'(x) = 3x^2 + 1 > 0$ : $f$ est strictement croissante sur $\\R$.",
        "$f(0) = -1 < 0$ et $f(1) = 1 > 0$ : d'après le théorème des valeurs intermédiaires, l'équation $f(x) = 0$ admet une unique solution $\\alpha$ dans $]0 \\,;\\, 1[$.",
        "$f(0{,}6) = -0{,}184 < 0$ et $f(0{,}7) = 0{,}043 > 0$, donc $0{,}6 < \\alpha < 0{,}7$."
      ]
    },
    erreurs: [
      "Écrire « $\\infty - \\infty = 0$ » ou « $0 \\times \\infty = 0$ » : ce sont des formes indéterminées, il faut transformer l'expression.",
      "Affirmer l'unicité de la solution avec le théorème des valeurs intermédiaires sans avoir justifié la stricte monotonie.",
      "Oublier d'étudier séparément la limite à gauche et la limite à droite quand le dénominateur s'annule : le signe du dénominateur décide entre $+\\infty$ et $-\\infty$."
    ],
    flashcards: [
      { q: "Les quatre formes indéterminées ?", r: "$+\\infty - \\infty$, $0 \\times \\infty$, $\\dfrac{\\infty}{\\infty}$ et $\\dfrac{0}{0}$" },
      { q: "$\\lim\\limits_{x \\to +\\infty} \\dfrac{2x^2 - x}{5x^2 + 3}$ ?", r: "$\\dfrac{2}{5}$ (quotient des termes de plus haut degré)" },
      { q: "$\\lim\\limits_{x \\to 0^-} \\dfrac{1}{x}$ ?", r: "$-\\infty$" },
      { q: "Théorème des gendarmes ?", r: "Si $g \\leq f \\leq h$ et $\\lim g = \\lim h = \\ell$, alors $\\lim f = \\ell$." },
      { q: "Quand $y = ax + b$ est-elle asymptote oblique en $+\\infty$ ?", r: "Quand $\\lim\\limits_{x \\to +\\infty} [f(x) - (ax + b)] = 0$." },
      { q: "$f$ continue en $a$ signifie…", r: "$\\lim\\limits_{x \\to a} f(x) = f(a)$" },
      { q: "Corollaire du théorème des valeurs intermédiaires ?", r: "$f$ continue et strictement monotone sur $[a \\,;\\, b]$, $k$ entre $f(a)$ et $f(b)$ : $f(x) = k$ a une unique solution dans $[a \\,;\\, b]$." },
      { q: "$\\lim\\limits_{x \\to +\\infty} \\dfrac{\\sin x}{x}$ ?", r: "$0$, car $-\\dfrac{1}{x} \\leq \\dfrac{\\sin x}{x} \\leq \\dfrac{1}{x}$ pour $x > 0$ (gendarmes)." }
    ],
    contexte: {
      titre: 'Le coût moyen d\'un atelier de couture à Dakar',
      enonce: "Un atelier de Dakar fabrique des sacs en wax. Les frais fixes mensuels sont de $150\\,000$ F CFA et chaque sac coûte $2\\,000$ F CFA de matière. Le coût moyen d'un sac, pour $x$ sacs fabriqués, est $C(x) = \\dfrac{2\\,000x + 150\\,000}{x}$. Calculer $\\lim\\limits_{x \\to +\\infty} C(x)$ et l'interpréter, puis déterminer à partir de combien de sacs le coût moyen devient inférieur à $2\\,100$ F CFA.",
      solution: [
        "$C(x) = 2\\,000 + \\dfrac{150\\,000}{x}$ et $\\lim\\limits_{x \\to +\\infty} \\dfrac{150\\,000}{x} = 0$, donc $\\lim\\limits_{x \\to +\\infty} C(x) = 2\\,000$.",
        "Interprétation : plus on fabrique de sacs, plus les frais fixes sont « dilués » ; le coût moyen se rapproche du coût de la matière, $2\\,000$ F CFA. Graphiquement, la droite $y = 2\\,000$ est asymptote horizontale.",
        "$C(x) < 2\\,100 \\iff \\dfrac{150\\,000}{x} < 100 \\iff x > 1\\,500$ : il faut fabriquer au moins $1\\,501$ sacs dans le mois."
      ]
    },
    histoire: "Le mathématicien français Augustin-Louis Cauchy a donné, dans son <em>Cours d'analyse</em> de l'École polytechnique (1821), l'une des premières définitions précises des notions de limite et de continuité."
  };

  /* ================================================================== */
  /* Dérivabilité et étude de fonctions                                  */
  /* ================================================================== */
  EM.contenu['ts-derivabilite'] = {
    resume: "Étudier la dérivabilité d'une fonction, dériver des fonctions composées et réciproques, en déduire les variations et les extremums, puis mener l'étude complète d'une fonction comme au BAC.",
    objectifs: [
      "Étudier la dérivabilité en un point à l'aide du taux d'accroissement et interpréter graphiquement (tangente, demi-tangentes)",
      "Calculer la dérivée d'une fonction composée et d'une fonction réciproque",
      "Déterminer le sens de variation et les extremums d'une fonction",
      "Utiliser l'inégalité des accroissements finis",
      "Mener une étude complète : ensemble de définition, limites, asymptotes, variations, centre ou axe de symétrie, point d'inflexion, courbe"
    ],
    cours: [
      { type: 'definition', titre: 'Nombre dérivé et tangente', texte: "$f$ est dérivable en $a$ si le taux d'accroissement $\\dfrac{f(a + h) - f(a)}{h}$ admet une limite finie quand $h \\to 0$ ; cette limite est le nombre dérivé $f'(a)$. La tangente à $\\mathcal{C}_f$ au point d'abscisse $a$ a pour équation $y = f'(a)(x - a) + f(a)$.<br>Si le taux tend vers $\\pm\\infty$, la courbe admet une demi-tangente verticale ; si les limites à gauche et à droite sont finies mais différentes, c'est un point anguleux." },
      { type: 'formule', titre: 'Opérations sur les dérivées', texte: "$(u + v)' = u' + v'$ ; $(ku)' = ku'$ ; $(uv)' = u'v + uv'$ ; $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$ ; $\\left(\\dfrac{1}{v}\\right)' = -\\dfrac{v'}{v^2}$ ; $(u^n)' = nu'u^{n-1}$ ; $(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$ ; $(\\cos u)' = -u'\\sin u$ ; $(\\sin u)' = u'\\cos u$." },
      { type: 'theoreme', titre: 'Dérivée d\'une fonction composée', texte: "Si $u$ est dérivable en $x$ et $v$ dérivable en $u(x)$, alors $v \\circ u$ est dérivable en $x$ et $$(v \\circ u)'(x) = u'(x) \\times v'(u(x)).$$ Exemple : $\\left(\\cos(3x + 1)\\right)' = -3\\sin(3x + 1)$." },
      { type: 'theoreme', titre: 'Dérivée et sens de variation', texte: "Sur un intervalle $I$ : si $f' > 0$ (sauf éventuellement en des points isolés où elle s'annule), $f$ est strictement croissante ; si $f' < 0$, $f$ est strictement décroissante ; si $f' = 0$, $f$ est constante.<br>Si $f'$ s'annule <b>en changeant de signe</b> en $a$, $f$ admet un extremum local en $a$." },
      { type: 'theoreme', titre: 'Fonction réciproque', texte: "Si $f$ est continue et strictement monotone sur un intervalle $I$, elle réalise une bijection de $I$ sur $J = f(I)$. Si $f$ est dérivable en $a$ avec $f'(a) \\neq 0$, alors $f^{-1}$ est dérivable en $b = f(a)$ et $$(f^{-1})'(b) = \\dfrac{1}{f'(a)}.$$ Dans un repère orthonormé, les courbes de $f$ et $f^{-1}$ sont symétriques par rapport à la droite $y = x$." },
      { type: 'theoreme', titre: 'Inégalité des accroissements finis', texte: "Si $f$ est dérivable sur $[a \\,;\\, b]$ et $m \\leq f'(x) \\leq M$ pour tout $x$, alors $m(b - a) \\leq f(b) - f(a) \\leq M(b - a)$.<br>Si $|f'(x)| \\leq M$ sur un intervalle $I$, alors $|f(x) - f(y)| \\leq M|x - y|$ pour tous $x, y$ de $I$." },
      { type: 'propriete', titre: 'Symétries et point d\'inflexion', texte: "Le point $\\Omega(a \\,;\\, b)$ est centre de symétrie de $\\mathcal{C}_f$ si, pour tout $x$ tel que $2a - x \\in D_f$, $f(2a - x) + f(x) = 2b$. La droite $x = a$ est axe de symétrie si $f(2a - x) = f(x)$.<br>Si $f''$ s'annule en changeant de signe en $a$, le point d'abscisse $a$ est un point d'inflexion : la courbe y traverse sa tangente." }
    ],
    methodes: [
      { titre: 'Étudier la dérivabilité en un point $a$', etapes: [
        "Calcule $\\lim\\limits_{x \\to a} \\dfrac{f(x) - f(a)}{x - a}$, à gauche et à droite si nécessaire.",
        "Limite finie (la même des deux côtés) : $f$ est dérivable en $a$ et la tangente a pour coefficient directeur cette limite.",
        "Limites finies différentes : point anguleux (deux demi-tangentes). Limite infinie : demi-tangente verticale."
      ] },
      { titre: 'Plan d\'étude d\'une fonction (BAC)', etapes: [
        "Détermine $D_f$ et, si possible, une parité ou un élément de symétrie.",
        "Calcule les limites aux bornes de $D_f$ et déduis-en les asymptotes.",
        "Calcule $f'(x)$, étudie son signe et dresse le tableau de variations complet.",
        "Cherche les points particuliers (intersections avec les axes, tangentes demandées, position par rapport à une asymptote), puis trace la courbe."
      ] }
    ],
    exemple: {
      enonce: "Soit $f(x) = \\dfrac{x^2 + 3}{x - 1}$. Déterminer $D_f$, calculer $f'(x)$, étudier les variations de $f$ et ses extremums locaux.",
      solution: [
        "$D_f = \\R \\setminus \\{1\\} = ]-\\infty \\,;\\, 1[ \\cup ]1 \\,;\\, +\\infty[$.",
        "$f'(x) = \\dfrac{2x(x - 1) - (x^2 + 3)}{(x - 1)^2} = \\dfrac{x^2 - 2x - 3}{(x - 1)^2} = \\dfrac{(x + 1)(x - 3)}{(x - 1)^2}$.",
        "$(x - 1)^2 > 0$ sur $D_f$ : $f'(x)$ a le signe de $(x + 1)(x - 3)$. $f$ est croissante sur $]-\\infty \\,;\\, -1]$ et sur $[3 \\,;\\, +\\infty[$, décroissante sur $[-1 \\,;\\, 1[$ et sur $]1 \\,;\\, 3]$.",
        "Maximum local $f(-1) = -2$ ; minimum local $f(3) = 6$. De plus $f(x) = x + 1 + \\dfrac{4}{x - 1}$ : la droite $y = x + 1$ est asymptote oblique et $x = 1$ asymptote verticale."
      ]
    },
    erreurs: [
      "Oublier le facteur $u'$ dans la dérivée d'une composée : $(e^{3x})' = 3e^{3x}$ et non $e^{3x}$.",
      "Conclure à un extremum dès que $f'(a) = 0$ : il faut un changement de signe de $f'$ (la fonction $x \\mapsto x^3$ n'a pas d'extremum en $0$).",
      "Étudier le signe du seul numérateur de $f'(x)$ sans vérifier le signe du dénominateur.",
      "Confondre la courbe de $f^{-1}$ avec celle de $\\dfrac{1}{f}$."
    ],
    flashcards: [
      { q: "$(v \\circ u)'(x)$ ?", r: "$u'(x) \\times v'(u(x))$" },
      { q: "$(\\sqrt{u})'$ ?", r: "$\\dfrac{u'}{2\\sqrt{u}}$" },
      { q: "$\\left(\\dfrac{u}{v}\\right)'$ ?", r: "$\\dfrac{u'v - uv'}{v^2}$" },
      { q: "Équation de la tangente au point d'abscisse $a$ ?", r: "$y = f'(a)(x - a) + f(a)$" },
      { q: "$(f^{-1})'(b)$ avec $b = f(a)$ ?", r: "$\\dfrac{1}{f'(a)}$, si $f'(a) \\neq 0$" },
      { q: "Inégalité des accroissements finis ?", r: "Si $|f'| \\leq M$ sur $I$ : $|f(b) - f(a)| \\leq M|b - a|$." },
      { q: "$\\Omega(a \\,;\\, b)$ centre de symétrie de $\\mathcal{C}_f$ ?", r: "$f(2a - x) + f(x) = 2b$" },
      { q: "Point d'inflexion ?", r: "$f''$ s'annule en changeant de signe : la courbe traverse sa tangente." },
      { q: "$(\\cos u)'$ ?", r: "$-u'\\sin u$" }
    ],
    contexte: {
      titre: 'Une boîte en tôle à Thiès',
      enonce: "Un artisan de Thiès dispose de plaques de tôle carrées de $60$ cm de côté. Il découpe un carré de côté $x$ cm à chaque coin puis relève les bords pour obtenir une boîte sans couvercle de volume $V(x) = x(60 - 2x)^2$, avec $0 < x < 30$. Pour quelle valeur de $x$ le volume est-il maximal ?",
      solution: [
        "$V'(x) = (60 - 2x)^2 + x \\times 2(60 - 2x)(-2) = (60 - 2x)(60 - 2x - 4x) = (60 - 2x)(60 - 6x)$.",
        "Sur $]0 \\,;\\, 30[$, $60 - 2x > 0$ : $V'(x)$ a le signe de $60 - 6x$, positif pour $x < 10$ et négatif pour $x > 10$.",
        "$V$ est maximal pour $x = 10$ cm : $V(10) = 10 \\times 40^2 = 16\\,000$ cm³, soit $16$ litres."
      ]
    },
    histoire: "La notation $f'(x)$ pour la dérivée a été introduite par Joseph-Louis Lagrange à la fin du XVIIIe siècle ; Leibniz utilisait la notation $\\dfrac{dy}{dx}$, toujours employée en physique."
  };

  /* ================================================================== */
  /* Suites numériques                                                   */
  /* ================================================================== */
  EM.contenu['ts-suites'] = {
    resume: "Raisonner par récurrence, étudier le sens de variation et la convergence d'une suite, en particulier des suites récurrentes $u_{n+1} = f(u_n)$ et $u_{n+1} = au_n + b$.",
    objectifs: [
      "Démontrer une propriété par récurrence",
      "Étudier le sens de variation d'une suite et montrer qu'elle est majorée, minorée ou bornée",
      "Utiliser les théorèmes de convergence : suite monotone bornée, comparaison, gendarmes",
      "Étudier une suite récurrente $u_{n+1} = f(u_n)$ et déterminer sa limite",
      "Utiliser une suite géométrique auxiliaire pour étudier $u_{n+1} = au_n + b$"
    ],
    cours: [
      { type: 'theoreme', titre: 'Raisonnement par récurrence', texte: "Pour démontrer qu'une propriété $P(n)$ est vraie pour tout entier $n \\geq n_0$ :<br>1. <b>Initialisation</b> : on vérifie $P(n_0)$.<br>2. <b>Hérédité</b> : on suppose $P(n)$ vraie pour un entier $n \\geq n_0$ fixé et on démontre $P(n + 1)$.<br>3. <b>Conclusion</b> : $P(n)$ est vraie pour tout $n \\geq n_0$." },
      { type: 'formule', titre: 'Suites arithmétiques et géométriques', texte: "Arithmétique de raison $r$ : $u_n = u_0 + nr$ ; somme de termes consécutifs $= \\text{(nombre de termes)} \\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$.<br>Géométrique de raison $q$ : $u_n = u_0 q^n$ ; pour $q \\neq 1$, $1 + q + q^2 + \\dots + q^n = \\dfrac{1 - q^{n+1}}{1 - q}$." },
      { type: 'propriete', titre: 'Limite de $q^n$', texte: "Si $q > 1$ : $\\lim q^n = +\\infty$. Si $q = 1$ : $q^n = 1$. Si $-1 < q < 1$ : $\\lim q^n = 0$. Si $q \\leq -1$ : $(q^n)$ n'a pas de limite." },
      { type: 'theoreme', titre: 'Convergence monotone', texte: "Toute suite croissante et majorée converge ; toute suite décroissante et minorée converge. Une suite croissante non majorée tend vers $+\\infty$." },
      { type: 'theoreme', titre: 'Comparaison et gendarmes', texte: "Si $u_n \\leq v_n$ à partir d'un certain rang et $\\lim u_n = +\\infty$, alors $\\lim v_n = +\\infty$.<br>Si $u_n \\leq v_n \\leq w_n$ et si $(u_n)$ et $(w_n)$ convergent vers la même limite $\\ell$, alors $(v_n)$ converge vers $\\ell$." },
      { type: 'theoreme', titre: 'Suites $u_{n+1} = f(u_n)$', texte: "Si $(u_n)$ converge vers $\\ell$ et si $f$ est continue en $\\ell$, alors $\\ell$ vérifie $f(\\ell) = \\ell$ : on cherche la limite parmi les solutions de cette équation." },
      { type: 'propriete', titre: 'Suites $u_{n+1} = au_n + b$ ($a \\neq 1$)', texte: "Le réel $\\ell = \\dfrac{b}{1 - a}$ vérifie $\\ell = a\\ell + b$. La suite $v_n = u_n - \\ell$ est géométrique de raison $a$, donc $u_n = (u_0 - \\ell)a^n + \\ell$. Si $-1 < a < 1$, $(u_n)$ converge vers $\\ell$." }
    ],
    methodes: [
      { titre: 'Démontrer par récurrence un encadrement $0 \\leq u_n \\leq 2$', etapes: [
        "Initialisation : vérifie l'encadrement pour le premier terme.",
        "Hérédité : suppose $0 \\leq u_n \\leq 2$ pour un $n$ fixé ; applique la fonction $f$ (si elle est croissante, elle conserve l'ordre) pour obtenir $f(0) \\leq u_{n+1} \\leq f(2)$, puis compare à $0$ et $2$.",
        "Conclus pour tout entier $n$."
      ] },
      { titre: 'Étudier une suite $u_{n+1} = au_n + b$', etapes: [
        "Calcule $\\ell$ solution de $\\ell = a\\ell + b$ (ou utilise la suite $v_n$ donnée par l'énoncé).",
        "Montre que $v_{n+1} = av_n$ : $(v_n)$ est géométrique ; calcule $v_0$.",
        "Écris $v_n = v_0 a^n$ puis $u_n = v_n + \\ell$.",
        "Déduis la limite à partir de celle de $a^n$."
      ] }
    ],
    exemple: {
      enonce: "Soit $(u_n)$ définie par $u_0 = 1$ et $u_{n+1} = \\sqrt{u_n + 2}$. Montrer que $0 < u_n < 2$ pour tout $n$, que $(u_n)$ est croissante, puis qu'elle converge et calculer sa limite.",
      solution: [
        "La fonction $f : x \\mapsto \\sqrt{x + 2}$ est croissante sur $[-2 \\,;\\, +\\infty[$.",
        "Initialisation : $0 < u_0 = 1 < 2$. Hérédité : si $0 < u_n < 2$, alors $\\sqrt{2} < \\sqrt{u_n + 2} < \\sqrt{4}$, donc $0 < u_{n+1} < 2$. Conclusion : $0 < u_n < 2$ pour tout $n$.",
        "$u_{n+1} - u_n = \\dfrac{(u_n + 2) - u_n^2}{\\sqrt{u_n + 2} + u_n} = \\dfrac{(2 - u_n)(1 + u_n)}{\\sqrt{u_n + 2} + u_n} > 0$ : la suite est croissante.",
        "Croissante et majorée par $2$, elle converge vers $\\ell \\geq 0$ avec $\\ell = \\sqrt{\\ell + 2}$, soit $\\ell^2 - \\ell - 2 = 0$ : $\\ell = 2$ ($\\ell = -1$ est exclu)."
      ]
    },
    erreurs: [
      "Dans l'hérédité, supposer la propriété vraie « pour tout $n$ » : on la suppose pour un entier $n$ fixé, et on démontre le rang $n + 1$.",
      "Croire qu'une suite croissante tend forcément vers $+\\infty$ : si elle est majorée, elle converge.",
      "Résoudre $f(\\ell) = \\ell$ sans avoir prouvé la convergence, ou garder une solution incompatible avec les bornes de la suite.",
      "Confondre le nombre de termes : de $u_0$ à $u_n$ il y a $n + 1$ termes."
    ],
    flashcards: [
      { q: "Terme général d'une suite géométrique ?", r: "$u_n = u_0 q^n$ (ou $u_n = u_p q^{n-p}$)" },
      { q: "$1 + q + q^2 + \\dots + q^n$ ($q \\neq 1$) ?", r: "$\\dfrac{1 - q^{n+1}}{1 - q}$" },
      { q: "$1 + 2 + \\dots + n$ ?", r: "$\\dfrac{n(n + 1)}{2}$" },
      { q: "$\\lim q^n$ si $-1 < q < 1$ ?", r: "$0$" },
      { q: "Suite croissante et majorée ?", r: "Elle converge." },
      { q: "Les trois étapes d'une récurrence ?", r: "Initialisation, hérédité, conclusion." },
      { q: "$u_{n+1} = au_n + b$ : suite auxiliaire ?", r: "$v_n = u_n - \\ell$ avec $\\ell = \\dfrac{b}{1 - a}$ : géométrique de raison $a$." },
      { q: "$u_{n+1} = f(u_n)$ converge vers $\\ell$, $f$ continue : que vérifie $\\ell$ ?", r: "$f(\\ell) = \\ell$" }
    ],
    contexte: {
      titre: 'Un bassin de tilapias à Richard-Toll',
      enonce: "Un bassin de pisciculture de Richard-Toll contient $4\\,000$ tilapias. Chaque mois, $20$ % des poissons sont pêchés puis on introduit $600$ alevins. On note $u_n$ le nombre de poissons après $n$ mois : $u_0 = 4\\,000$ et $u_{n+1} = 0{,}8u_n + 600$. Exprimer $u_n$ en fonction de $n$ et étudier l'évolution à long terme.",
      solution: [
        "$\\ell = 0{,}8\\ell + 600 \\iff 0{,}2\\ell = 600 \\iff \\ell = 3\\,000$.",
        "$v_n = u_n - 3\\,000$ vérifie $v_{n+1} = 0{,}8u_n + 600 - 3\\,000 = 0{,}8(u_n - 3\\,000) = 0{,}8v_n$ : géométrique de raison $0{,}8$, avec $v_0 = 1\\,000$.",
        "$u_n = 1\\,000 \\times 0{,}8^n + 3\\,000$. Comme $0 < 0{,}8 < 1$, $\\lim u_n = 3\\,000$ : la population se stabilise autour de $3\\,000$ tilapias."
      ]
    },
    histoire: "Le raisonnement par récurrence est utilisé de façon explicite au XVIIe siècle par Blaise Pascal dans son <em>Traité du triangle arithmétique</em>."
  };

  /* ================================================================== */
  /* Primitives                                                          */
  /* ================================================================== */
  EM.contenu['ts-primitives'] = {
    resume: "Déterminer les primitives d'une fonction à l'aide du tableau des primitives usuelles et des formes composées ($u'u^n$, $\\dfrac{u'}{u}$, $u'e^u$…), puis trouver la primitive qui vérifie une condition donnée.",
    objectifs: [
      "Connaître la définition d'une primitive et le théorème d'existence pour les fonctions continues",
      "Utiliser le tableau des primitives usuelles et la linéarité",
      "Reconnaître les formes $u'u^n$, $\\dfrac{u'}{u^2}$, $\\dfrac{u'}{\\sqrt{u}}$, $\\dfrac{u'}{u}$, $u'e^u$, $u'\\cos u$",
      "Déterminer la primitive qui prend une valeur donnée en un point"
    ],
    cours: [
      { type: 'definition', titre: 'Primitive', texte: "Soit $f$ définie sur un intervalle $I$. Une <b>primitive</b> de $f$ sur $I$ est une fonction $F$ dérivable sur $I$ telle que $F' = f$." },
      { type: 'theoreme', titre: 'Existence et ensemble des primitives', texte: "Toute fonction continue sur un intervalle $I$ admet des primitives sur $I$. Si $F$ est l'une d'elles, les primitives de $f$ sont les fonctions $x \\mapsto F(x) + C$, $C \\in \\R$. Pour $x_0 \\in I$ et $y_0$ réel, il existe une <b>unique</b> primitive $G$ de $f$ telle que $G(x_0) = y_0$." },
      { type: 'formule', titre: 'Primitives usuelles', texte: "$x^n \\to \\dfrac{x^{n+1}}{n + 1}$ ($n \\neq -1$) ; $\\dfrac{1}{x^2} \\to -\\dfrac{1}{x}$ ; $\\dfrac{1}{\\sqrt{x}} \\to 2\\sqrt{x}$ ; $\\dfrac{1}{x} \\to \\ln x$ sur $]0 \\,;\\, +\\infty[$ ; $e^x \\to e^x$ ; $\\cos x \\to \\sin x$ ; $\\sin x \\to -\\cos x$ ; $\\cos(ax + b) \\to \\dfrac{1}{a}\\sin(ax + b)$ ; $e^{ax + b} \\to \\dfrac{1}{a}e^{ax + b}$ ($a \\neq 0$)." },
      { type: 'formule', titre: 'Formes composées', texte: "$u'u^n \\to \\dfrac{u^{n+1}}{n + 1}$ ($n \\neq -1$) ; $\\dfrac{u'}{u^2} \\to -\\dfrac{1}{u}$ ; $\\dfrac{u'}{\\sqrt{u}} \\to 2\\sqrt{u}$ ($u > 0$) ; $\\dfrac{u'}{u} \\to \\ln|u|$ ; $u'e^u \\to e^u$ ; $u'\\cos u \\to \\sin u$ ; $u'\\sin u \\to -\\cos u$." },
      { type: 'propriete', titre: 'Linéarité', texte: "Si $F$ et $G$ sont des primitives de $f$ et $g$, alors $aF + bG$ est une primitive de $af + bg$. Il n'y a <b>pas</b> de formule générale pour la primitive d'un produit ou d'un quotient." },
      { type: 'remarque', titre: 'Linéariser pour primitiver', texte: "$\\cos^2 x = \\dfrac{1 + \\cos 2x}{2}$ et $\\sin^2 x = \\dfrac{1 - \\cos 2x}{2}$. Ainsi une primitive de $\\cos^2 x$ est $\\dfrac{x}{2} + \\dfrac{\\sin 2x}{4}$." }
    ],
    methodes: [
      { titre: 'Trouver une primitive d\'une forme composée', etapes: [
        "Repère la fonction $u$ et calcule $u'$.",
        "Fais apparaître exactement $u'$ en ajustant une constante multiplicative : $\\dfrac{x}{x^2 + 1} = \\dfrac{1}{2} \\times \\dfrac{2x}{x^2 + 1}$.",
        "Applique la formule correspondante, puis vérifie en dérivant."
      ] },
      { titre: 'Primitive vérifiant $F(x_0) = y_0$', etapes: [
        "Écris la forme générale $F(x) = G(x) + C$.",
        "Remplace $x$ par $x_0$ et résous $G(x_0) + C = y_0$.",
        "Donne $F$ avec la valeur de $C$ trouvée."
      ] }
    ],
    exemple: {
      enonce: "Déterminer la primitive $F$ sur $\\R$ de $f(x) = \\dfrac{x}{(x^2 + 1)^2}$ telle que $F(0) = 1$.",
      solution: [
        "Avec $u(x) = x^2 + 1$, $u'(x) = 2x$ : $f(x) = \\dfrac{1}{2} \\times \\dfrac{u'(x)}{u(x)^2}$.",
        "Une primitive de $\\dfrac{u'}{u^2}$ est $-\\dfrac{1}{u}$, donc $F(x) = -\\dfrac{1}{2(x^2 + 1)} + C$.",
        "$F(0) = -\\dfrac{1}{2} + C = 1$ donne $C = \\dfrac{3}{2}$ : $F(x) = \\dfrac{3}{2} - \\dfrac{1}{2(x^2 + 1)}$."
      ]
    },
    erreurs: [
      "Oublier de compenser le facteur $u'$ : une primitive de $e^{3x}$ est $\\dfrac{1}{3}e^{3x}$, pas $e^{3x}$.",
      "Penser qu'une primitive d'un produit est le produit des primitives.",
      "Oublier la constante $C$ alors que l'énoncé impose une condition $F(x_0) = y_0$."
    ],
    flashcards: [
      { q: "Primitive de $x^n$ ($n \\neq -1$) ?", r: "$\\dfrac{x^{n+1}}{n + 1}$" },
      { q: "Primitive de $\\dfrac{1}{x^2}$ ?", r: "$-\\dfrac{1}{x}$" },
      { q: "Primitive de $\\dfrac{1}{\\sqrt{x}}$ ?", r: "$2\\sqrt{x}$" },
      { q: "Primitive de $\\dfrac{u'}{u}$ ?", r: "$\\ln|u|$" },
      { q: "Primitive de $u'e^u$ ?", r: "$e^u$" },
      { q: "Primitive de $u'u^n$ ?", r: "$\\dfrac{u^{n+1}}{n + 1}$" },
      { q: "Primitive de $\\sin(ax + b)$ ?", r: "$-\\dfrac{1}{a}\\cos(ax + b)$" },
      { q: "Primitive de $e^{ax + b}$ ?", r: "$\\dfrac{1}{a}e^{ax + b}$" },
      { q: "Deux primitives d'une même fonction sur un intervalle…", r: "… diffèrent d'une constante." }
    ],
    contexte: {
      titre: 'Une pirogue au départ de Kayar',
      enonce: "Une pirogue motorisée quitte le port de Kayar. Sa vitesse, en km/h, $t$ heures après le départ est $v(t) = 20 - 4t$ pour $0 \\leq t \\leq 5$. La distance parcourue $d(t)$, en km, est la primitive de $v$ qui s'annule en $0$. Exprimer $d(t)$ et calculer la distance parcourue jusqu'à l'arrêt.",
      solution: [
        "Une primitive de $v$ est $20t - 2t^2$, donc $d(t) = 20t - 2t^2 + C$ et $d(0) = C = 0$.",
        "La pirogue s'arrête quand $v(t) = 0$, soit $t = 5$ h.",
        "$d(5) = 100 - 50 = 50$ km."
      ]
    }
  };

  /* ================================================================== */
  /* Logarithme népérien                                                 */
  /* ================================================================== */
  EM.contenu['ts-logarithme'] = {
    resume: "La fonction logarithme népérien $\\ln$, primitive de $x \\mapsto \\dfrac{1}{x}$ sur $]0 \\,;\\, +\\infty[$ qui s'annule en $1$ : propriétés algébriques, étude, limites de référence, équations et inéquations.",
    objectifs: [
      "Connaître la définition de $\\ln$ et ses propriétés algébriques",
      "Résoudre des équations et des inéquations comportant des logarithmes, en tenant compte des conditions d'existence",
      "Connaître les limites de référence et les croissances comparées",
      "Dériver $\\ln u$ et étudier des fonctions comportant $\\ln$",
      "Connaître le logarithme décimal et ses usages"
    ],
    cours: [
      { type: 'definition', titre: 'Définition', texte: "La fonction logarithme népérien, notée $\\ln$, est l'unique primitive de $x \\mapsto \\dfrac{1}{x}$ sur $]0 \\,;\\, +\\infty[$ qui s'annule en $1$. Ainsi $\\ln 1 = 0$, $(\\ln x)' = \\dfrac{1}{x}$, et le nombre $e \\approx 2{,}718$ est défini par $\\ln e = 1$." },
      { type: 'propriete', titre: 'Propriétés algébriques', texte: "Pour $a > 0$, $b > 0$ et $n$ entier relatif : $\\ln(ab) = \\ln a + \\ln b$ ; $\\ln\\dfrac{1}{a} = -\\ln a$ ; $\\ln\\dfrac{a}{b} = \\ln a - \\ln b$ ; $\\ln(a^n) = n\\ln a$ ; $\\ln\\sqrt{a} = \\dfrac{1}{2}\\ln a$." },
      { type: 'propriete', titre: 'Sens de variation', texte: "$\\ln$ est strictement croissante sur $]0 \\,;\\, +\\infty[$. Pour $a > 0$ et $b > 0$ : $\\ln a = \\ln b \\iff a = b$ ; $\\ln a < \\ln b \\iff a < b$. En particulier $\\ln x < 0 \\iff 0 < x < 1$ et $\\ln x > 0 \\iff x > 1$." },
      { type: 'formule', titre: 'Limites de référence', texte: "$\\lim\\limits_{x \\to +\\infty} \\ln x = +\\infty$ ; $\\lim\\limits_{x \\to 0^+} \\ln x = -\\infty$ ; $\\lim\\limits_{x \\to +\\infty} \\dfrac{\\ln x}{x} = 0$ ; $\\lim\\limits_{x \\to 0^+} x\\ln x = 0$ ; $\\lim\\limits_{x \\to +\\infty} \\dfrac{\\ln x}{x^n} = 0$ ; $\\lim\\limits_{x \\to 0} \\dfrac{\\ln(1 + x)}{x} = 1$ ; $\\lim\\limits_{x \\to 1} \\dfrac{\\ln x}{x - 1} = 1$." },
      { type: 'formule', titre: 'Dérivées', texte: "Si $u$ est dérivable et strictement positive sur $I$, $(\\ln u)' = \\dfrac{u'}{u}$. Si $u$ ne s'annule pas, $(\\ln|u|)' = \\dfrac{u'}{u}$ : c'est l'origine de la primitive $\\ln|u|$ de $\\dfrac{u'}{u}$." },
      { type: 'definition', titre: 'Logarithme décimal', texte: "$\\log x = \\dfrac{\\ln x}{\\ln 10}$ pour $x > 0$. Il a les mêmes propriétés algébriques que $\\ln$, avec $\\log 10 = 1$ et $\\log 10^n = n$. Il sert par exemple à définir le pH d'une solution ou le niveau sonore en décibels." },
      { type: 'remarque', titre: 'Courbe de $\\ln$', texte: "La tangente au point $(1 \\,;\\, 0)$ a pour équation $y = x - 1$ et la courbe est en dessous : $\\ln x \\leq x - 1$ pour tout $x > 0$. L'axe des ordonnées est asymptote verticale et la courbe admet une branche parabolique de direction $(Ox)$ en $+\\infty$." }
    ],
    methodes: [
      { titre: 'Résoudre une équation avec $\\ln$', etapes: [
        "Écris les conditions d'existence et détermine l'ensemble de validité $D$.",
        "Transforme l'équation en $\\ln A = \\ln B$ grâce aux propriétés algébriques (ou en $\\ln A = k$, soit $A = e^k$).",
        "Résous $A = B$, puis ne garde que les solutions qui appartiennent à $D$."
      ] },
      { titre: 'Résoudre une inéquation avec $\\ln$', etapes: [
        "Détermine l'ensemble de validité $D$.",
        "Écris l'inéquation sous la forme $\\ln A < \\ln B$ : elle équivaut à $A < B$ car $\\ln$ est strictement croissante.",
        "Résous, puis prends l'intersection avec $D$."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\R$ l'équation $\\ln(x - 1) + \\ln(x + 1) = \\ln 3$.",
      solution: [
        "Conditions : $x - 1 > 0$ et $x + 1 > 0$, soit $D = ]1 \\,;\\, +\\infty[$.",
        "Sur $D$ : $\\ln[(x - 1)(x + 1)] = \\ln 3 \\iff x^2 - 1 = 3 \\iff x^2 = 4$.",
        "$x = 2$ ou $x = -2$ ; seul $2$ appartient à $D$ : $S = \\{2\\}$."
      ]
    },
    erreurs: [
      "Écrire $\\ln(a + b) = \\ln a + \\ln b$ : c'est faux ! La bonne formule est $\\ln(ab) = \\ln a + \\ln b$.",
      "Oublier les conditions d'existence : $\\ln(x - 3)$ n'existe que pour $x > 3$.",
      "Écrire $(\\ln u)' = \\dfrac{1}{u}$ au lieu de $\\dfrac{u'}{u}$.",
      "Écrire $\\ln(x^2) = 2\\ln x$ pour tout $x \\neq 0$ : c'est $2\\ln|x|$."
    ],
    flashcards: [
      { q: "$\\ln(ab)$ ?", r: "$\\ln a + \\ln b$" },
      { q: "$\\ln\\dfrac{a}{b}$ ?", r: "$\\ln a - \\ln b$" },
      { q: "$\\ln(a^n)$ ?", r: "$n\\ln a$" },
      { q: "$\\ln 1$ et $\\ln e$ ?", r: "$0$ et $1$" },
      { q: "$\\lim\\limits_{x \\to +\\infty} \\dfrac{\\ln x}{x}$ ?", r: "$0$" },
      { q: "$\\lim\\limits_{x \\to 0^+} x\\ln x$ ?", r: "$0$" },
      { q: "$\\lim\\limits_{x \\to 0} \\dfrac{\\ln(1 + x)}{x}$ ?", r: "$1$" },
      { q: "$(\\ln u)'$ ?", r: "$\\dfrac{u'}{u}$" },
      { q: "Signe de $\\ln x$ ?", r: "Négatif sur $]0 \\,;\\, 1[$, nul en $1$, positif sur $]1 \\,;\\, +\\infty[$." }
    ],
    contexte: {
      titre: 'Un placement à la banque',
      enonce: "Moussa place $500\\,000$ F CFA à intérêts composés au taux annuel de $6$ %. Son capital après $n$ années est $C_n = 500\\,000 \\times 1{,}06^n$. Au bout de combien d'années son capital dépassera-t-il $800\\,000$ F CFA ?",
      solution: [
        "$C_n > 800\\,000 \\iff 1{,}06^n > 1{,}6 \\iff n\\ln 1{,}06 > \\ln 1{,}6$ (car $\\ln$ est strictement croissante).",
        "$\\ln 1{,}06 > 0$, donc $n > \\dfrac{\\ln 1{,}6}{\\ln 1{,}06} \\approx 8{,}07$.",
        "Il faudra attendre $9$ ans."
      ]
    },
    histoire: "Le mot « logarithme » a été créé par l'Écossais John Napier (Neper), qui publia en 1614 ses premières tables de logarithmes pour simplifier les longs calculs des astronomes : une multiplication devient une addition."
  };

  /* ================================================================== */
  /* Exponentielle et puissances                                         */
  /* ================================================================== */
  EM.contenu['ts-exponentielle'] = {
    resume: "La fonction exponentielle, réciproque de $\\ln$ : propriétés algébriques, équations, inéquations, limites et croissances comparées ; fonctions exponentielles de base $a$ et fonctions puissances.",
    objectifs: [
      "Connaître la définition de $\\exp$ comme réciproque de $\\ln$ et ses propriétés algébriques",
      "Résoudre des équations et inéquations comportant des exponentielles (changement d'inconnue $X = e^x$)",
      "Connaître les limites de référence et les croissances comparées",
      "Dériver $e^u$ et étudier des fonctions comportant $\\exp$",
      "Utiliser $a^x = e^{x\\ln a}$ et $x^\\alpha = e^{\\alpha\\ln x}$"
    ],
    cours: [
      { type: 'definition', titre: 'Définition', texte: "La fonction exponentielle est la bijection réciproque de $\\ln$ : elle est définie sur $\\R$, à valeurs dans $]0 \\,;\\, +\\infty[$, et pour tout réel $x$ et tout $y > 0$ : $$y = e^x \\iff x = \\ln y.$$ Ainsi $e^0 = 1$, $e^1 = e$, $\\ln(e^x) = x$ et $e^{\\ln y} = y$." },
      { type: 'propriete', titre: 'Propriétés algébriques', texte: "Pour tous réels $a$ et $b$ et tout entier $n$ : $e^{a + b} = e^a e^b$ ; $e^{-a} = \\dfrac{1}{e^a}$ ; $e^{a - b} = \\dfrac{e^a}{e^b}$ ; $(e^a)^n = e^{na}$. Pour tout réel $x$, $e^x > 0$." },
      { type: 'propriete', titre: 'Variations et dérivée', texte: "$\\exp$ est strictement croissante sur $\\R$ : $e^a = e^b \\iff a = b$ et $e^a < e^b \\iff a < b$. Elle est égale à sa dérivée : $(e^x)' = e^x$, et $(e^u)' = u'e^u$." },
      { type: 'formule', titre: 'Limites de référence', texte: "$\\lim\\limits_{x \\to +\\infty} e^x = +\\infty$ ; $\\lim\\limits_{x \\to -\\infty} e^x = 0$ ; $\\lim\\limits_{x \\to +\\infty} \\dfrac{e^x}{x} = +\\infty$ ; $\\lim\\limits_{x \\to +\\infty} \\dfrac{e^x}{x^n} = +\\infty$ ; $\\lim\\limits_{x \\to -\\infty} xe^x = 0$ ; $\\lim\\limits_{x \\to 0} \\dfrac{e^x - 1}{x} = 1$." },
      { type: 'definition', titre: 'Exponentielle de base $a$ et puissances', texte: "Pour $a > 0$ et $x$ réel : $a^x = e^{x\\ln a}$ ; la fonction $x \\mapsto a^x$ est croissante si $a > 1$, décroissante si $0 < a < 1$, et sa dérivée est $(\\ln a)a^x$.<br>Pour $\\alpha$ réel et $x > 0$ : $x^\\alpha = e^{\\alpha\\ln x}$, de dérivée $\\alpha x^{\\alpha - 1}$. Exemple : $\\sqrt{x} = x^{\\frac{1}{2}}$." },
      { type: 'remarque', titre: 'Courbe de $\\exp$', texte: "Dans un repère orthonormé, les courbes de $\\exp$ et de $\\ln$ sont symétriques par rapport à la droite $y = x$. La tangente en $(0 \\,;\\, 1)$ a pour équation $y = x + 1$ et $e^x \\geq x + 1$ pour tout réel $x$. L'axe des abscisses est asymptote en $-\\infty$." }
    ],
    methodes: [
      { titre: 'Résoudre $e^{2x} + be^x + c = 0$', etapes: [
        "Pose $X = e^x$ avec $X > 0$ : l'équation devient $X^2 + bX + c = 0$.",
        "Résous cette équation du second degré.",
        "Garde seulement les racines strictement positives $X_i$ et écris $x = \\ln X_i$."
      ] },
      { titre: 'Lever une forme indéterminée avec $\\exp$', etapes: [
        "Factorise par le terme prépondérant, en général $e^x$ en $+\\infty$.",
        "Utilise les croissances comparées : $\\dfrac{x^n}{e^x} \\to 0$ en $+\\infty$, $x^n e^x \\to 0$ en $-\\infty$.",
        "Conclus avec les règles opératoires."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\R$ l'équation $e^{2x} - 3e^x - 4 = 0$.",
      solution: [
        "On pose $X = e^x > 0$ : $X^2 - 3X - 4 = 0$, de discriminant $\\Delta = 25$.",
        "Les racines sont $X = 4$ et $X = -1$ ; $e^x = -1$ est impossible.",
        "$e^x = 4 \\iff x = \\ln 4 = 2\\ln 2$ : $S = \\{2\\ln 2\\}$."
      ]
    },
    erreurs: [
      "Écrire $e^{a + b} = e^a + e^b$ : c'est faux, $e^{a + b} = e^a \\times e^b$.",
      "Garder une solution $X \\leq 0$ dans $e^x = X$ : l'exponentielle est toujours strictement positive.",
      "Oublier $u'$ dans $(e^u)' = u'e^u$ : $(e^{-x^2})' = -2xe^{-x^2}$."
    ],
    flashcards: [
      { q: "$e^{a + b}$ ?", r: "$e^a \\times e^b$" },
      { q: "$e^{\\ln y}$ ($y > 0$) et $\\ln(e^x)$ ?", r: "$y$ et $x$" },
      { q: "$(e^u)'$ ?", r: "$u'e^u$" },
      { q: "$\\lim\\limits_{x \\to +\\infty} \\dfrac{e^x}{x}$ ?", r: "$+\\infty$" },
      { q: "$\\lim\\limits_{x \\to -\\infty} xe^x$ ?", r: "$0$" },
      { q: "$\\lim\\limits_{x \\to 0} \\dfrac{e^x - 1}{x}$ ?", r: "$1$" },
      { q: "$a^x$ en fonction de $\\exp$ ?", r: "$a^x = e^{x\\ln a}$" },
      { q: "Signe de $e^x$ ?", r: "Toujours strictement positif." }
    ],
    contexte: {
      titre: 'Une culture de bactéries dans un laboratoire de Dakar',
      enonce: "Dans un laboratoire de Dakar, le nombre de bactéries d'une culture, $t$ heures après le début de l'expérience, est $N(t) = 500e^{0{,}7t}$. Au bout de combien de temps la culture dépassera-t-elle $10\\,000$ bactéries ?",
      solution: [
        "$N(t) > 10\\,000 \\iff e^{0{,}7t} > 20 \\iff 0{,}7t > \\ln 20$ (car $\\ln$ est strictement croissante).",
        "$t > \\dfrac{\\ln 20}{0{,}7} \\approx 4{,}28$.",
        "La culture dépasse $10\\,000$ bactéries au bout d'environ $4$ h $17$ min."
      ]
    },
    histoire: "Le nombre $e$ apparaît à la fin du XVIIe siècle chez Jacques Bernoulli, qui étudiait les intérêts composés : $\\left(1 + \\frac{1}{n}\\right)^n$ se rapproche de $e \\approx 2{,}718$ quand $n$ devient grand. C'est Leonhard Euler qui lui a donné la notation $e$ au XVIIIe siècle."
  };

  /* @@CONTENU@@ */
})(typeof window !== 'undefined' ? window : globalThis);
