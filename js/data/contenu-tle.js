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

  /* ================================================================== */
  /* Calcul intégral                                                     */
  /* ================================================================== */
  EM.contenu['ts-integrales'] = {
    resume: "Calculer une intégrale à l'aide d'une primitive, l'interpréter comme une aire, utiliser ses propriétés (linéarité, Chasles, positivité, valeur moyenne) et l'intégration par parties ; calculer des aires et des volumes.",
    objectifs: [
      "Calculer une intégrale à l'aide d'une primitive",
      "Utiliser la linéarité, la relation de Chasles et les propriétés de comparaison",
      "Calculer une valeur moyenne et utiliser l'inégalité de la moyenne",
      "Calculer une intégrale par parties",
      "Calculer une aire plane (en unités d'aire puis en cm²) et un volume de solide de révolution"
    ],
    cours: [
      { type: 'definition', titre: 'Intégrale d\'une fonction continue', texte: "Si $f$ est continue sur un intervalle $I$ contenant $a$ et $b$, et si $F$ est une primitive de $f$ sur $I$ : $$\\int_a^b f(x)\\,dx = \\left[F(x)\\right]_a^b = F(b) - F(a).$$ Ce nombre ne dépend pas de la primitive choisie." },
      { type: 'propriete', titre: 'Linéarité et relation de Chasles', texte: "$\\displaystyle\\int_a^b (\\alpha f + \\beta g) = \\alpha\\int_a^b f + \\beta\\int_a^b g$ ; $\\displaystyle\\int_a^c f = \\int_a^b f + \\int_b^c f$ ; $\\displaystyle\\int_b^a f = -\\int_a^b f$ ; $\\displaystyle\\int_a^a f = 0$." },
      { type: 'propriete', titre: 'Positivité, comparaison, valeur moyenne', texte: "Pour $a \\leq b$ : si $f \\geq 0$ sur $[a \\,;\\, b]$, alors $\\displaystyle\\int_a^b f \\geq 0$ ; si $f \\leq g$, alors $\\displaystyle\\int_a^b f \\leq \\int_a^b g$.<br><b>Inégalité de la moyenne</b> : si $m \\leq f \\leq M$ sur $[a \\,;\\, b]$, alors $m(b - a) \\leq \\displaystyle\\int_a^b f \\leq M(b - a)$. La <b>valeur moyenne</b> de $f$ sur $[a \\,;\\, b]$ est $\\mu = \\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$." },
      { type: 'theoreme', titre: 'Intégration par parties', texte: "Si $u$ et $v$ sont dérivables sur $[a \\,;\\, b]$ à dérivées continues : $$\\int_a^b u(x)v'(x)\\,dx = \\left[u(x)v(x)\\right]_a^b - \\int_a^b u'(x)v(x)\\,dx.$$" },
      { type: 'propriete', titre: 'Calcul d\'aires', texte: "Si $f \\geq 0$ sur $[a \\,;\\, b]$, l'aire du domaine limité par $\\mathcal{C}_f$, l'axe des abscisses et les droites $x = a$ et $x = b$ vaut $\\displaystyle\\int_a^b f(x)\\,dx$ unités d'aire. Si $f \\geq g$ sur $[a \\,;\\, b]$, l'aire entre les deux courbes vaut $\\displaystyle\\int_a^b [f(x) - g(x)]\\,dx$ u.a.<br>Avec $\\|\\vec{i}\\| = p$ cm et $\\|\\vec{j}\\| = q$ cm : $1$ u.a. $= pq$ cm²." },
      { type: 'formule', titre: 'Volume d\'un solide de révolution', texte: "Le solide obtenu en faisant tourner autour de l'axe $(Ox)$ la portion de courbe de $f$ sur $[a \\,;\\, b]$ a pour volume $$V = \\pi\\int_a^b [f(x)]^2\\,dx \\text{ unités de volume.}$$" },
      { type: 'theoreme', titre: 'Fonction définie par une intégrale', texte: "Si $f$ est continue sur $I$ et $a \\in I$, la fonction $F : x \\mapsto \\displaystyle\\int_a^x f(t)\\,dt$ est l'unique primitive de $f$ sur $I$ qui s'annule en $a$ : $F' = f$." }
    ],
    methodes: [
      { titre: 'Choisir $u$ et $v\'$ dans une intégration par parties', etapes: [
        "Prends pour $u$ le facteur qui se simplifie en le dérivant (un polynôme, ou $\\ln x$).",
        "Prends pour $v'$ un facteur dont tu connais une primitive ($e^{x}$, $\\sin x$, $\\cos x$, $x^n$).",
        "Calcule $u'$ et $v$, applique la formule, puis calcule la nouvelle intégrale (plus simple)."
      ] },
      { titre: 'Calculer une aire entre deux courbes', etapes: [
        "Étudie le signe de $f(x) - g(x)$ sur l'intervalle (factorisation, étude de fonction).",
        "Découpe l'intervalle si le signe change et intègre $|f - g|$ sur chaque morceau.",
        "Donne le résultat en u.a., puis convertis en cm² avec l'unité graphique."
      ] }
    ],
    exemple: {
      enonce: "Calculer $I = \\displaystyle\\int_1^e x\\ln x\\,dx$.",
      solution: [
        "On pose $u(x) = \\ln x$ et $v'(x) = x$ ; alors $u'(x) = \\dfrac{1}{x}$ et $v(x) = \\dfrac{x^2}{2}$.",
        "$I = \\left[\\dfrac{x^2}{2}\\ln x\\right]_1^e - \\displaystyle\\int_1^e \\dfrac{x}{2}\\,dx = \\dfrac{e^2}{2} - \\left[\\dfrac{x^2}{4}\\right]_1^e = \\dfrac{e^2}{2} - \\dfrac{e^2 - 1}{4}$.",
        "Donc $I = \\dfrac{e^2 + 1}{4}$."
      ]
    },
    erreurs: [
      "Oublier qu'une aire est positive : si $f \\leq 0$ sur $[a \\,;\\, b]$, l'aire vaut $-\\displaystyle\\int_a^b f(x)\\,dx$.",
      "Se tromper dans la conversion des unités : avec $\\|\\vec{i}\\| = 2$ cm et $\\|\\vec{j}\\| = 3$ cm, $1$ u.a. $= 6$ cm².",
      "Dans une intégration par parties avec $\\ln x$, prendre $v'(x) = \\ln x$ : c'est $\\ln x$ qu'il faut dériver.",
      "Oublier le signe moins devant $\\displaystyle\\int u'v$ dans la formule."
    ],
    flashcards: [
      { q: "$\\displaystyle\\int_a^b f(x)\\,dx$ avec $F$ primitive de $f$ ?", r: "$F(b) - F(a)$" },
      { q: "Relation de Chasles ?", r: "$\\displaystyle\\int_a^c f = \\int_a^b f + \\int_b^c f$" },
      { q: "Formule d'intégration par parties ?", r: "$\\displaystyle\\int_a^b uv' = [uv]_a^b - \\int_a^b u'v$" },
      { q: "Valeur moyenne de $f$ sur $[a \\,;\\, b]$ ?", r: "$\\mu = \\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$" },
      { q: "Aire entre $\\mathcal{C}_f$ et $\\mathcal{C}_g$ si $f \\geq g$ ?", r: "$\\displaystyle\\int_a^b [f(x) - g(x)]\\,dx$ u.a." },
      { q: "Volume de révolution autour de $(Ox)$ ?", r: "$V = \\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx$" },
      { q: "$\\displaystyle\\int_0^1 e^x\\,dx$ ?", r: "$e - 1$" },
      { q: "$\\displaystyle\\int_1^e \\dfrac{1}{x}\\,dx$ ?", r: "$1$" },
      { q: "Dérivée de $x \\mapsto \\displaystyle\\int_a^x f(t)\\,dt$ ?", r: "$f(x)$" }
    ],
    contexte: {
      titre: 'Une parcelle maraîchère au bord du fleuve à Saint-Louis',
      enonce: "Un maraîcher de Saint-Louis cultive une parcelle limitée par une route rectiligne (l'axe des abscisses) et par la berge du fleuve, modélisée par la courbe de $f(x) = 4 - \\dfrac{x^2}{4}$ pour $-4 \\leq x \\leq 4$ (unité : l'hectomètre). Calculer l'aire de la parcelle en hectares.",
      solution: [
        "Sur $[-4 \\,;\\, 4]$, $f(x) = \\dfrac{16 - x^2}{4} \\geq 0$ : l'aire vaut $\\displaystyle\\int_{-4}^{4} \\left(4 - \\dfrac{x^2}{4}\\right)dx$.",
        "$\\displaystyle\\int_{-4}^{4} \\left(4 - \\dfrac{x^2}{4}\\right)dx = \\left[4x - \\dfrac{x^3}{12}\\right]_{-4}^{4} = \\left(16 - \\dfrac{16}{3}\\right) - \\left(-16 + \\dfrac{16}{3}\\right) = \\dfrac{64}{3}$.",
        "$1$ hm² $= 1$ ha, donc la parcelle mesure $\\dfrac{64}{3} \\approx 21{,}3$ hectares."
      ]
    },
    histoire: "Le symbole $\\int$, un S allongé pour « somme », a été introduit par Gottfried Wilhelm Leibniz en 1675. Newton et Leibniz ont découvert, chacun de leur côté, le lien entre aires et primitives."
  };

  /* ================================================================== */
  /* Équations différentielles                                           */
  /* ================================================================== */
  EM.contenu['ts-equations-differentielles'] = {
    resume: "Résoudre les équations différentielles $y' = ay + b$, $y'' + \\omega^2 y = 0$ et $y'' + ay' + by = 0$, déterminer la solution vérifiant des conditions initiales et modéliser des phénomènes d'évolution (refroidissement, désintégration, croissance).",
    objectifs: [
      "Résoudre $y' = ay$ et $y' = ay + b$ ; trouver la solution qui vérifie une condition initiale",
      "Résoudre l'équation $y'' + \\omega^2 y = 0$",
      "Résoudre $y'' + ay' + by = 0$ à l'aide de l'équation caractéristique",
      "Modéliser un phénomène d'évolution par une équation différentielle et l'exploiter"
    ],
    cours: [
      { type: 'theoreme', titre: 'Équation $y\' = ay$', texte: "Les solutions sur $\\R$ de $y' = ay$ ($a$ réel) sont les fonctions $x \\mapsto ke^{ax}$, $k \\in \\R$. Pour tous réels $x_0$ et $y_0$, il existe une unique solution vérifiant $y(x_0) = y_0$ : $x \\mapsto y_0 e^{a(x - x_0)}$." },
      { type: 'theoreme', titre: 'Équation $y\' = ay + b$ ($a \\neq 0$)', texte: "La fonction constante $x \\mapsto -\\dfrac{b}{a}$ est une solution particulière. Les solutions sont les fonctions $$x \\mapsto ke^{ax} - \\dfrac{b}{a}, \\quad k \\in \\R.$$" },
      { type: 'theoreme', titre: 'Équation $y\'\' + \\omega^2 y = 0$ ($\\omega \\neq 0$)', texte: "Les solutions sont les fonctions $x \\mapsto A\\cos(\\omega x) + B\\sin(\\omega x)$, $A$ et $B$ réels ; elles s'écrivent aussi $x \\mapsto C\\cos(\\omega x + \\varphi)$. Il existe une unique solution vérifiant $y(x_0) = y_0$ et $y'(x_0) = y_1$." },
      { type: 'theoreme', titre: 'Équation $y\'\' + ay\' + by = 0$', texte: "On résout l'équation caractéristique $r^2 + ar + b = 0$, de discriminant $\\Delta$ :<br>• $\\Delta > 0$, racines $r_1$, $r_2$ : $y = \\alpha e^{r_1 x} + \\beta e^{r_2 x}$ ;<br>• $\\Delta = 0$, racine double $r_0$ : $y = (\\alpha x + \\beta)e^{r_0 x}$ ;<br>• $\\Delta < 0$, racines $p \\pm iq$ : $y = e^{px}\\left(\\alpha\\cos(qx) + \\beta\\sin(qx)\\right)$." },
      { type: 'propriete', titre: 'Conditions initiales', texte: "Une équation du premier ordre a une unique solution vérifiant une condition $y(x_0) = y_0$ ; une équation du second ordre a une unique solution vérifiant deux conditions $y(x_0) = y_0$ et $y'(x_0) = y_1$." },
      { type: 'remarque', titre: 'Modèles classiques', texte: "<b>Refroidissement</b> (loi de Newton) : $\\theta' = -k(\\theta - \\theta_a)$, donc $\\theta(t) = \\theta_a + (\\theta_0 - \\theta_a)e^{-kt}$.<br><b>Désintégration radioactive</b> : $N' = -\\lambda N$, $N(t) = N_0e^{-\\lambda t}$, demi-vie $T = \\dfrac{\\ln 2}{\\lambda}$.<br><b>Croissance d'une population</b> : $P' = kP$, temps de doublement $\\dfrac{\\ln 2}{k}$." }
    ],
    methodes: [
      { titre: 'Résoudre $y\' = ay + b$ avec une condition initiale', etapes: [
        "Écris l'équation sous la forme $y' = ay + b$ et identifie $a$ et $b$.",
        "Donne la solution générale $y = ke^{ax} - \\dfrac{b}{a}$.",
        "Utilise la condition $y(x_0) = y_0$ pour calculer $k$."
      ] },
      { titre: 'Résoudre $y\'\' + ay\' + by = 0$ avec $y(0)$ et $y\'(0)$', etapes: [
        "Écris l'équation caractéristique $r^2 + ar + b = 0$ et calcule $\\Delta$.",
        "Écris la solution générale selon le signe de $\\Delta$.",
        "Dérive la solution générale, puis traduis $y(0)$ et $y'(0)$ en un système de deux équations ; résous-le."
      ] }
    ],
    exemple: {
      enonce: "Déterminer la solution $f$ de $y'' - 3y' + 2y = 0$ telle que $f(0) = 1$ et $f'(0) = 0$.",
      solution: [
        "Équation caractéristique : $r^2 - 3r + 2 = 0$, de racines $r_1 = 1$ et $r_2 = 2$.",
        "Solutions : $f(x) = \\alpha e^{x} + \\beta e^{2x}$, et $f'(x) = \\alpha e^{x} + 2\\beta e^{2x}$.",
        "$f(0) = \\alpha + \\beta = 1$ et $f'(0) = \\alpha + 2\\beta = 0$, d'où $\\beta = -1$ et $\\alpha = 2$.",
        "$f(x) = 2e^{x} - e^{2x}$."
      ]
    },
    erreurs: [
      "Pour $y' = ay + b$, oublier la solution particulière constante $-\\dfrac{b}{a}$.",
      "Confondre $y'' + \\omega^2 y = 0$ (solutions trigonométriques) et $y'' - \\omega^2 y = 0$ (solutions $\\alpha e^{\\omega x} + \\beta e^{-\\omega x}$).",
      "Écrire $y' + 2y = 0 \\iff y = ke^{2x}$ : ici $y' = -2y$, donc $y = ke^{-2x}$.",
      "Appliquer la condition sur $y'(0)$ sans avoir dérivé correctement la solution générale."
    ],
    flashcards: [
      { q: "Solutions de $y' = ay$ ?", r: "$x \\mapsto ke^{ax}$, $k \\in \\R$" },
      { q: "Solutions de $y' = ay + b$ ($a \\neq 0$) ?", r: "$x \\mapsto ke^{ax} - \\dfrac{b}{a}$" },
      { q: "Solutions de $y'' + \\omega^2 y = 0$ ?", r: "$x \\mapsto A\\cos(\\omega x) + B\\sin(\\omega x)$" },
      { q: "Équation caractéristique de $y'' + ay' + by = 0$ ?", r: "$r^2 + ar + b = 0$" },
      { q: "Solutions si $\\Delta = 0$ (racine double $r_0$) ?", r: "$x \\mapsto (\\alpha x + \\beta)e^{r_0 x}$" },
      { q: "Solutions si les racines sont $p \\pm iq$ ?", r: "$x \\mapsto e^{px}(\\alpha\\cos qx + \\beta\\sin qx)$" },
      { q: "Demi-vie d'un corps radioactif ?", r: "$T = \\dfrac{\\ln 2}{\\lambda}$" },
      { q: "Loi de refroidissement de Newton ?", r: "$\\theta' = -k(\\theta - \\theta_a)$" }
    ],
    contexte: {
      titre: 'Dater un fragment de bois',
      enonce: "Lors de fouilles archéologiques (données fictives), on trouve un fragment de bois qui ne contient plus que $60$ % du carbone 14 qu'il contenait à l'origine. Le nombre $N(t)$ de noyaux de carbone 14 vérifie $N' = -\\lambda N$, avec une demi-vie de $5\\,730$ ans. Estimer l'âge du fragment.",
      solution: [
        "$N(t) = N_0e^{-\\lambda t}$ et $N(5\\,730) = \\dfrac{N_0}{2}$ donne $\\lambda = \\dfrac{\\ln 2}{5\\,730}$.",
        "$N(t) = 0{,}6N_0 \\iff e^{-\\lambda t} = 0{,}6 \\iff t = \\dfrac{-\\ln 0{,}6}{\\lambda} = \\dfrac{5\\,730 \\times \\ln\\frac{1}{0{,}6}}{\\ln 2}$.",
        "$t \\approx 4\\,220$ : le fragment a environ $4\\,200$ ans."
      ]
    },
    histoire: "Isaac Newton a énoncé au début du XVIIIe siècle une loi de refroidissement : la vitesse de refroidissement d'un corps est proportionnelle à l'écart entre sa température et celle du milieu ambiant. C'est l'une des premières équations différentielles utilisées en physique."
  };

  /* ================================================================== */
  /* Nombres complexes                                                   */
  /* ================================================================== */
  EM.contenu['ts-complexes'] = {
    resume: "Les nombres complexes : formes algébrique, trigonométrique et exponentielle, conjugué, module et argument, formules de Moivre et d'Euler, équations du second degré dans $\\C$, racines $n$-ièmes et interprétation géométrique.",
    objectifs: [
      "Calculer avec la forme algébrique : somme, produit, quotient, conjugué",
      "Déterminer le module et un argument ; passer d'une forme à une autre (algébrique, trigonométrique, exponentielle)",
      "Utiliser les formules de Moivre et d'Euler (puissances, linéarisation)",
      "Résoudre une équation du second degré dans $\\C$ ; déterminer les racines carrées et les racines $n$-ièmes d'un nombre complexe",
      "Interpréter géométriquement module et argument : distances, angles, alignement, nature d'un triangle"
    ],
    cours: [
      { type: 'definition', titre: 'Forme algébrique et conjugué', texte: "Tout nombre complexe s'écrit de manière unique $z = a + ib$ avec $a, b$ réels et $i^2 = -1$ : $a = \\operatorname{Re}(z)$, $b = \\operatorname{Im}(z)$. Le conjugué de $z$ est $\\overline{z} = a - ib$ ; $z\\overline{z} = a^2 + b^2$, $\\overline{z + z'} = \\overline{z} + \\overline{z'}$, $\\overline{zz'} = \\overline{z}\\,\\overline{z'}$." },
      { type: 'definition', titre: 'Module, argument et formes', texte: "$|z| = \\sqrt{a^2 + b^2}$. Pour $z \\neq 0$, un argument $\\theta = \\arg z$ (défini à $2\\pi$ près) vérifie $\\cos\\theta = \\dfrac{a}{|z|}$ et $\\sin\\theta = \\dfrac{b}{|z|}$.<br>Forme trigonométrique : $z = r(\\cos\\theta + i\\sin\\theta)$ ; forme exponentielle : $z = re^{i\\theta}$, avec $r = |z|$." },
      { type: 'propriete', titre: 'Règles de calcul', texte: "$|zz'| = |z||z'|$ ; $\\left|\\dfrac{z}{z'}\\right| = \\dfrac{|z|}{|z'|}$ ; $\\arg(zz') = \\arg z + \\arg z'$ ; $\\arg\\dfrac{z}{z'} = \\arg z - \\arg z'$ ; $\\arg(z^n) = n\\arg z$ ; $\\arg\\overline{z} = -\\arg z$ (à $2\\pi$ près). En notation exponentielle : $re^{i\\theta} \\times r'e^{i\\theta'} = rr'e^{i(\\theta + \\theta')}$." },
      { type: 'formule', titre: 'Formules de Moivre et d\'Euler', texte: "Moivre : $(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$, soit $\\left(e^{i\\theta}\\right)^n = e^{in\\theta}$.<br>Euler : $\\cos\\theta = \\dfrac{e^{i\\theta} + e^{-i\\theta}}{2}$ et $\\sin\\theta = \\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i}$ (utiles pour linéariser $\\cos^n x$ et $\\sin^n x$)." },
      { type: 'theoreme', titre: 'Équation du second degré dans $\\C$', texte: "Pour $az^2 + bz + c = 0$ ($a \\neq 0$), $\\Delta = b^2 - 4ac$. Si $\\delta$ est une racine carrée de $\\Delta$ ($\\delta^2 = \\Delta$), les solutions sont $z = \\dfrac{-b \\pm \\delta}{2a}$.<br>Coefficients réels et $\\Delta < 0$ : $z = \\dfrac{-b \\pm i\\sqrt{-\\Delta}}{2a}$ (solutions conjuguées)." },
      { type: 'propriete', titre: 'Racines $n$-ièmes', texte: "Les solutions de $z^n = Re^{i\\varphi}$ ($R > 0$) sont les $n$ nombres $z_k = R^{\\frac{1}{n}}e^{i\\frac{\\varphi + 2k\\pi}{n}}$, $k \\in \\{0, 1, \\dots, n - 1\\}$. Leurs images sont les sommets d'un polygone régulier à $n$ côtés." },
      { type: 'propriete', titre: 'Interprétation géométrique', texte: "Si $A$ et $B$ ont pour affixes $z_A$ et $z_B$ : $AB = |z_B - z_A|$ et $(\\vec{u}, \\vect{AB}) = \\arg(z_B - z_A)$. $\\left(\\vect{AB}, \\vect{AC}\\right) = \\arg\\dfrac{z_C - z_A}{z_B - z_A}$ : $A$, $B$, $C$ sont alignés si ce quotient est réel ; $(AB) \\perp (AC)$ s'il est imaginaire pur." }
    ],
    methodes: [
      { titre: 'Écrire un nombre complexe sous forme exponentielle', etapes: [
        "Calcule $r = |z| = \\sqrt{a^2 + b^2}$.",
        "Calcule $\\cos\\theta = \\dfrac{a}{r}$ et $\\sin\\theta = \\dfrac{b}{r}$ et reconnais un angle remarquable (attention au quadrant).",
        "Écris $z = re^{i\\theta}$."
      ] },
      { titre: 'Racines carrées de $Z = A + iB$', etapes: [
        "Cherche $\\delta = x + iy$ avec $\\delta^2 = Z$ : $x^2 - y^2 = A$ et $2xy = B$.",
        "Ajoute l'égalité des modules : $x^2 + y^2 = |Z| = \\sqrt{A^2 + B^2}$.",
        "Déduis $x^2$ et $y^2$, puis choisis les signes grâce au signe de $B = 2xy$."
      ] },
      { titre: 'Linéariser $\\cos^3 x$', etapes: [
        "Écris $\\cos^3 x = \\left(\\dfrac{e^{ix} + e^{-ix}}{2}\\right)^3$ et développe avec le binôme.",
        "Regroupe : $\\dfrac{1}{8}\\left(e^{3ix} + e^{-3ix} + 3(e^{ix} + e^{-ix})\\right)$.",
        "Conclus : $\\cos^3 x = \\dfrac{\\cos 3x + 3\\cos x}{4}$."
      ] }
    ],
    exemple: {
      enonce: "Soit $z = 1 + i\\sqrt{3}$. Écrire $z$ sous forme exponentielle, puis calculer $z^6$.",
      solution: [
        "$|z| = \\sqrt{1 + 3} = 2$ ; $\\cos\\theta = \\dfrac{1}{2}$ et $\\sin\\theta = \\dfrac{\\sqrt{3}}{2}$, donc $\\theta = \\dfrac{\\pi}{3}$ et $z = 2e^{i\\frac{\\pi}{3}}$.",
        "Moivre : $z^6 = 2^6e^{i \\times 6 \\times \\frac{\\pi}{3}} = 64e^{2i\\pi} = 64$."
      ]
    },
    erreurs: [
      "Écrire $|a + ib| = a + b$ ou $\\sqrt{a + b}$ : le module est $\\sqrt{a^2 + b^2}$.",
      "Déterminer l'argument avec la seule tangente : vérifie les signes de $\\cos\\theta$ et $\\sin\\theta$ pour choisir le bon quadrant.",
      "Oublier que $i^2 = -1$ en développant $(a + ib)^2 = a^2 - b^2 + 2iab$.",
      "Donner un argument hors de $]-\\pi \\,;\\, \\pi]$ quand on demande l'argument principal."
    ],
    flashcards: [
      { q: "$|a + ib|$ ?", r: "$\\sqrt{a^2 + b^2}$" },
      { q: "$z\\overline{z}$ ?", r: "$|z|^2 = a^2 + b^2$" },
      { q: "Forme exponentielle de $1 + i$ ?", r: "$\\sqrt{2}e^{i\\frac{\\pi}{4}}$" },
      { q: "Forme exponentielle de $i$ ?", r: "$e^{i\\frac{\\pi}{2}}$" },
      { q: "Formule de Moivre ?", r: "$(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta$" },
      { q: "Formules d'Euler ?", r: "$\\cos\\theta = \\dfrac{e^{i\\theta} + e^{-i\\theta}}{2}$, $\\sin\\theta = \\dfrac{e^{i\\theta} - e^{-i\\theta}}{2i}$" },
      { q: "$\\arg(zz')$ ?", r: "$\\arg z + \\arg z'$ (à $2\\pi$ près)" },
      { q: "Solutions de $z^2 + 4 = 0$ ?", r: "$2i$ et $-2i$" },
      { q: "Racines cubiques de l'unité ?", r: "$1$, $e^{i\\frac{2\\pi}{3}}$ et $e^{-i\\frac{2\\pi}{3}}$" },
      { q: "$A$, $B$, $C$ alignés ?", r: "$\\dfrac{z_C - z_A}{z_B - z_A}$ est réel." }
    ],
    contexte: {
      titre: 'Un circuit électrique à Ziguinchor',
      enonce: "En courant alternatif, un électricien de Ziguinchor modélise deux dipôles par des impédances complexes $Z_1 = 3 + 4i$ et $Z_2 = 1 - i$ (en ohms). Montés en série, ils équivalent à $Z = Z_1 + Z_2$. Calculer $Z$, son module (l'impédance en ohms) et un argument (le déphasage).",
      solution: [
        "$Z = (3 + 1) + (4 - 1)i = 4 + 3i$.",
        "$|Z| = \\sqrt{16 + 9} = 5$ : l'impédance vaut $5$ ohms.",
        "$\\cos\\theta = \\dfrac{4}{5}$ et $\\sin\\theta = \\dfrac{3}{5}$ : $\\theta \\approx 0{,}64$ rad (environ $37$°)."
      ]
    },
    histoire: "Au XVIe siècle, les algébristes italiens Cardan et Bombelli manipulent des racines carrées de nombres négatifs pour résoudre des équations du troisième degré. La notation $i$ a été introduite par Leonhard Euler à la fin du XVIIIe siècle."
  };

  /* ================================================================== */
  /* Similitudes directes                                                */
  /* ================================================================== */
  EM.contenu['ts-similitudes'] = {
    resume: "Utiliser les nombres complexes pour étudier les transformations du plan : translations, homothéties, rotations et similitudes directes d'écriture $z' = az + b$.",
    objectifs: [
      "Reconnaître l'écriture complexe d'une translation, d'une homothétie, d'une rotation",
      "Déterminer les éléments caractéristiques (centre, rapport, angle) d'une similitude directe d'écriture $z' = az + b$",
      "Déterminer l'écriture complexe d'une similitude directe de centre, rapport et angle donnés",
      "Utiliser les propriétés de conservation et la composée de similitudes directes"
    ],
    cours: [
      { type: 'formule', titre: 'Écritures complexes des transformations usuelles', texte: "Translation de vecteur $\\vec{w}$ d'affixe $b$ : $z' = z + b$.<br>Homothétie de centre $\\Omega(\\omega)$ et de rapport $k$ réel non nul : $z' - \\omega = k(z - \\omega)$.<br>Rotation de centre $\\Omega(\\omega)$ et d'angle $\\theta$ : $z' - \\omega = e^{i\\theta}(z - \\omega)$." },
      { type: 'definition', titre: 'Similitude directe', texte: "La similitude directe de centre $\\Omega(\\omega)$, de rapport $k > 0$ et d'angle $\\theta$ est la composée (commutative) de l'homothétie de centre $\\Omega$ et de rapport $k$ et de la rotation de centre $\\Omega$ et d'angle $\\theta$. Son écriture complexe est $$z' - \\omega = ke^{i\\theta}(z - \\omega).$$" },
      { type: 'theoreme', titre: 'Écriture $z\' = az + b$', texte: "Soit $f$ la transformation d'écriture $z' = az + b$ avec $a \\neq 0$.<br>• Si $a = 1$ : $f$ est la translation de vecteur d'affixe $b$.<br>• Si $a \\neq 1$ : $f$ est la similitude directe de rapport $k = |a|$, d'angle $\\theta = \\arg a$ et de centre le point invariant $\\Omega$ d'affixe $\\omega = \\dfrac{b}{1 - a}$." },
      { type: 'propriete', titre: 'Propriétés', texte: "Une similitude directe de rapport $k$ multiplie les distances par $k$ et les aires par $k^2$ ; elle conserve les angles orientés, l'alignement, le parallélisme, l'orthogonalité et le contact. Si $|a| = 1$, c'est une rotation ; si $a$ est réel ($a \\neq 1$), c'est une homothétie." },
      { type: 'propriete', titre: 'Composée et réciproque', texte: "La composée de deux similitudes directes de rapports $k$, $k'$ et d'angles $\\theta$, $\\theta'$ est une similitude directe de rapport $kk'$ et d'angle $\\theta + \\theta'$ (ou une translation). La réciproque d'une similitude directe de rapport $k$ et d'angle $\\theta$ est la similitude de même centre, de rapport $\\dfrac{1}{k}$ et d'angle $-\\theta$." },
      { type: 'theoreme', titre: 'Similitude définie par deux points et leurs images', texte: "Si $A \\neq B$ et $A' \\neq B'$, il existe une unique similitude directe $s$ telle que $s(A) = A'$ et $s(B) = B'$. Son rapport est $\\dfrac{A'B'}{AB}$ et son angle est $\\left(\\vect{AB}, \\vect{A'B'}\\right)$." }
    ],
    methodes: [
      { titre: 'Éléments caractéristiques de $z\' = az + b$', etapes: [
        "Vérifie que $a \\neq 1$ (sinon c'est une translation).",
        "Rapport : $k = |a|$ ; angle : $\\theta = \\arg a$ (forme exponentielle de $a$).",
        "Centre : résous $\\omega = a\\omega + b$, soit $\\omega = \\dfrac{b}{1 - a}$ (multiplie par le conjugué pour obtenir la forme algébrique)."
      ] },
      { titre: 'Écriture complexe de $s$ telle que $s(A) = A\'$ et $s(B) = B\'$', etapes: [
        "Écris $z_{A'} = az_A + b$ et $z_{B'} = az_B + b$.",
        "Soustrais : $a = \\dfrac{z_{B'} - z_{A'}}{z_B - z_A}$, puis $b = z_{A'} - az_A$.",
        "Déduis-en le rapport, l'angle et le centre."
      ] }
    ],
    exemple: {
      enonce: "Déterminer les éléments caractéristiques de la transformation $s$ d'écriture complexe $z' = (1 + i)z - i$.",
      solution: [
        "$a = 1 + i \\neq 1$ : $s$ est une similitude directe.",
        "Rapport : $|1 + i| = \\sqrt{2}$ ; angle : $\\arg(1 + i) = \\dfrac{\\pi}{4}$.",
        "Centre : $\\omega = \\dfrac{-i}{1 - (1 + i)} = \\dfrac{-i}{-i} = 1$. Donc $\\Omega$ a pour affixe $1$."
      ]
    },
    erreurs: [
      "Prendre $b$ pour l'affixe du centre : le centre est $\\omega = \\dfrac{b}{1 - a}$.",
      "Donner un rapport négatif : pour $a = -2$, le rapport de la similitude est $|a| = 2$ et l'angle est $\\pi$ (c'est l'homothétie de rapport $-2$).",
      "Confondre similitude directe ($z' = az + b$) et similitude indirecte ($z' = a\\overline{z} + b$)."
    ],
    flashcards: [
      { q: "Écriture complexe d'une rotation de centre $\\Omega(\\omega)$, d'angle $\\theta$ ?", r: "$z' - \\omega = e^{i\\theta}(z - \\omega)$" },
      { q: "Écriture complexe d'une homothétie de centre $\\Omega(\\omega)$, de rapport $k$ ?", r: "$z' - \\omega = k(z - \\omega)$" },
      { q: "$z' = az + b$, $a \\neq 1$ : rapport et angle ?", r: "Rapport $|a|$, angle $\\arg a$." },
      { q: "$z' = az + b$, $a \\neq 1$ : centre ?", r: "$\\omega = \\dfrac{b}{1 - a}$" },
      { q: "Effet d'une similitude de rapport $k$ sur les aires ?", r: "Elles sont multipliées par $k^2$." },
      { q: "Composée de similitudes de rapports $k$, $k'$ et d'angles $\\theta$, $\\theta'$ ?", r: "Rapport $kk'$, angle $\\theta + \\theta'$ (ou une translation)." },
      { q: "$z' = iz$ ?", r: "Rotation de centre $O$ et d'angle $\\dfrac{\\pi}{2}$." }
    ],
    contexte: {
      titre: 'Un motif de tissu dessiné à Dakar',
      enonce: "Une créatrice de tissus de Dakar transforme un motif sur ordinateur : elle le fait tourner d'un quart de tour (angle $\\dfrac{\\pi}{2}$) autour du point $\\Omega$ d'affixe $1 + i$ et l'agrandit deux fois. Déterminer l'écriture complexe de cette similitude et l'image du point $A$ d'affixe $3 + i$.",
      solution: [
        "$z' - \\omega = 2e^{i\\frac{\\pi}{2}}(z - \\omega) = 2i(z - \\omega)$ avec $\\omega = 1 + i$.",
        "$z' = 2iz + (1 + i)(1 - 2i) = 2iz + 3 - i$.",
        "$z_{A'} = 2i(3 + i) + 3 - i = 6i - 2 + 3 - i = 1 + 5i$."
      ]
    }
  };

  /* ================================================================== */
  /* Dénombrement et probabilités                                        */
  /* ================================================================== */
  EM.contenu['ts-probabilites'] = {
    resume: "Dénombrer (p-listes, arrangements, combinaisons), calculer des probabilités, utiliser les probabilités conditionnelles et la formule des probabilités totales, étudier des variables aléatoires et la loi binomiale.",
    objectifs: [
      "Dénombrer à l'aide des p-listes, des arrangements $A_n^p$ et des combinaisons $C_n^p$",
      "Calculer des probabilités dans une situation d'équiprobabilité",
      "Utiliser les probabilités conditionnelles, l'indépendance et la formule des probabilités totales",
      "Déterminer la loi d'une variable aléatoire, son espérance $E(X)$, sa variance $V(X)$ et son écart type $\\sigma(X)$",
      "Reconnaître et utiliser une loi binomiale (épreuves de Bernoulli répétées)"
    ],
    cours: [
      { type: 'formule', titre: 'Dénombrement', texte: "Tirages successifs <b>avec remise</b> de $p$ éléments parmi $n$ : $n^p$ p-listes.<br>Tirages successifs <b>sans remise</b> : $A_n^p = \\dfrac{n!}{(n - p)!} = n(n - 1)\\cdots(n - p + 1)$ arrangements.<br>Tirages <b>simultanés</b> : $C_n^p = \\dfrac{n!}{p!(n - p)!}$ combinaisons. On a $C_n^p = C_n^{n-p}$ et $C_n^p = C_{n-1}^{p-1} + C_{n-1}^p$ (triangle de Pascal)." },
      { type: 'definition', titre: 'Probabilité', texte: "$P(\\Omega) = 1$, $P(\\overline{A}) = 1 - P(A)$, $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. En situation d'équiprobabilité : $P(A) = \\dfrac{\\Card(A)}{\\Card(\\Omega)}$." },
      { type: 'definition', titre: 'Probabilité conditionnelle et indépendance', texte: "Si $P(B) \\neq 0$ : $P_B(A) = \\dfrac{P(A \\cap B)}{P(B)}$, donc $P(A \\cap B) = P(B) \\times P_B(A)$. Deux événements $A$ et $B$ sont indépendants si $P(A \\cap B) = P(A) \\times P(B)$." },
      { type: 'theoreme', titre: 'Formule des probabilités totales', texte: "Si $B_1, \\dots, B_n$ forment une partition de $\\Omega$ (de probabilités non nulles), alors pour tout événement $A$ : $$P(A) = P(B_1)P_{B_1}(A) + \\dots + P(B_n)P_{B_n}(A).$$ Sur un arbre pondéré : on multiplie les probabilités le long d'un chemin et on additionne les chemins qui mènent à $A$." },
      { type: 'definition', titre: 'Variable aléatoire', texte: "Si $X$ prend les valeurs $x_1, \\dots, x_k$ avec les probabilités $p_i = P(X = x_i)$ : $E(X) = \\sum x_i p_i$ ; $V(X) = \\sum x_i^2 p_i - [E(X)]^2$ ; $\\sigma(X) = \\sqrt{V(X)}$. La fonction de répartition est $F(x) = P(X \\leq x)$. Dans un jeu, si $X$ est le gain, le jeu est équitable lorsque $E(X) = 0$." },
      { type: 'theoreme', titre: 'Loi binomiale', texte: "On répète $n$ fois, de façon indépendante, une épreuve à deux issues dont le succès a la probabilité $p$. Le nombre $X$ de succès suit la loi binomiale $\\mathcal{B}(n \\,;\\, p)$ : $$P(X = k) = C_n^k p^k (1 - p)^{n - k}, \\quad E(X) = np, \\quad V(X) = np(1 - p).$$" }
    ],
    methodes: [
      { titre: 'Choisir le bon outil de dénombrement', etapes: [
        "L'ordre compte-t-il ? (tirages successifs, codes, classements) : oui, p-listes ou arrangements ; non (tirages simultanés, comités) : combinaisons.",
        "Les répétitions sont-elles possibles ? Avec remise : $n^p$ ; sans remise : $A_n^p$.",
        "Pour « au moins un », passe par l'événement contraire « aucun »."
      ] },
      { titre: 'Utiliser un arbre pondéré', etapes: [
        "Construis l'arbre : premier niveau la partition (machines, zones…), second niveau l'événement étudié.",
        "Multiplie le long des branches pour obtenir $P(B_i \\cap A)$.",
        "Additionne les chemins menant à $A$ (probabilités totales), puis calcule $P_A(B_i) = \\dfrac{P(B_i \\cap A)}{P(A)}$ si on « remonte » l'arbre."
      ] },
      { titre: 'Reconnaître une loi binomiale', etapes: [
        "Identifie une épreuve à deux issues (succès / échec) de probabilité de succès $p$.",
        "Vérifie qu'elle est répétée $n$ fois de façon identique et indépendante (tirages avec remise ou assimilés).",
        "Conclus : le nombre de succès $X$ suit $\\mathcal{B}(n \\,;\\, p)$."
      ] }
    ],
    exemple: {
      enonce: "Une usine de Thiès produit des pièces dont $3$ % sont défectueuses. On prélève $10$ pièces (tirages assimilés à des tirages avec remise) et on note $X$ le nombre de pièces défectueuses. Calculer $P(X = 0)$, $P(X \\geq 1)$ et $E(X)$.",
      solution: [
        "$X$ suit la loi binomiale $\\mathcal{B}(10 \\,;\\, 0{,}03)$.",
        "$P(X = 0) = 0{,}97^{10} \\approx 0{,}737$.",
        "$P(X \\geq 1) = 1 - P(X = 0) \\approx 0{,}263$.",
        "$E(X) = 10 \\times 0{,}03 = 0{,}3$."
      ]
    },
    erreurs: [
      "Confondre $P_A(B)$ et $P_B(A)$ : la condition est en indice.",
      "Utiliser des combinaisons pour des tirages successifs : l'ordre compte, il faut des arrangements ou des p-listes.",
      "Croire que deux événements incompatibles sont indépendants : c'est faux dès que leurs probabilités sont non nulles.",
      "Oublier le coefficient $C_n^k$ dans la formule de la loi binomiale."
    ],
    flashcards: [
      { q: "$C_n^p$ ?", r: "$\\dfrac{n!}{p!(n - p)!}$ : nombre de tirages simultanés de $p$ éléments parmi $n$." },
      { q: "$A_n^p$ ?", r: "$\\dfrac{n!}{(n - p)!}$ : tirages successifs sans remise." },
      { q: "Nombre de tirages successifs avec remise de $p$ éléments parmi $n$ ?", r: "$n^p$" },
      { q: "$P_B(A)$ ?", r: "$\\dfrac{P(A \\cap B)}{P(B)}$" },
      { q: "$A$ et $B$ indépendants ?", r: "$P(A \\cap B) = P(A)P(B)$" },
      { q: "Formule des probabilités totales (partition $B$, $\\overline{B}$) ?", r: "$P(A) = P(B)P_B(A) + P(\\overline{B})P_{\\overline{B}}(A)$" },
      { q: "$V(X)$ ?", r: "$E(X^2) - [E(X)]^2$" },
      { q: "Loi binomiale : $P(X = k)$ ?", r: "$C_n^k p^k(1 - p)^{n - k}$" },
      { q: "Espérance et variance de $\\mathcal{B}(n \\,;\\, p)$ ?", r: "$E(X) = np$ et $V(X) = np(1 - p)$" }
    ],
    contexte: {
      titre: 'Un test de dépistage du paludisme',
      enonce: "Dans un district sanitaire (données fictives), $8$ % des personnes testées ont le paludisme. Le test rapide est positif pour $95$ % des malades et pour $2$ % des personnes non malades. Une personne a un test positif : quelle est la probabilité qu'elle soit malade ?",
      solution: [
        "On note $M$ « être malade » et $T$ « test positif » : $P(M) = 0{,}08$, $P_M(T) = 0{,}95$, $P_{\\overline{M}}(T) = 0{,}02$.",
        "Probabilités totales : $P(T) = 0{,}08 \\times 0{,}95 + 0{,}92 \\times 0{,}02 = 0{,}076 + 0{,}0184 = 0{,}0944$.",
        "$P_T(M) = \\dfrac{P(M \\cap T)}{P(T)} = \\dfrac{0{,}076}{0{,}0944} \\approx 0{,}805$ : environ $80$ % des tests positifs correspondent à des malades ; un second test de confirmation reste utile."
      ]
    },
    histoire: "La théorie des probabilités est née en 1654 de la correspondance entre Blaise Pascal et Pierre de Fermat sur le « problème des partis » : comment partager équitablement la mise d'un jeu interrompu."
  };

  /* ================================================================== */
  /* Statistiques à deux variables                                       */
  /* ================================================================== */
  EM.contenu['ts-statistiques'] = {
    resume: "Étudier une série statistique double : nuage de points, point moyen, covariance, coefficient de corrélation linéaire et ajustement linéaire par la méthode des moindres carrés pour faire des estimations.",
    objectifs: [
      "Représenter une série double par un nuage de points et déterminer le point moyen $G$",
      "Calculer les variances, la covariance et le coefficient de corrélation linéaire $r$",
      "Déterminer une droite de régression par la méthode des moindres carrés",
      "Utiliser un ajustement linéaire pour faire une estimation et juger de sa pertinence",
      "Exploiter un tableau à double entrée (séries marginales, fréquences conditionnelles)"
    ],
    cours: [
      { type: 'definition', titre: 'Nuage de points et point moyen', texte: "Une série double $(x_i \\,;\\, y_i)$, $1 \\leq i \\leq n$, est représentée par le nuage des points $M_i(x_i \\,;\\, y_i)$. Le point moyen est $G(\\bar{x} \\,;\\, \\bar{y})$ avec $\\bar{x} = \\dfrac{1}{n}\\sum x_i$ et $\\bar{y} = \\dfrac{1}{n}\\sum y_i$." },
      { type: 'formule', titre: 'Variance et covariance', texte: "$V(x) = \\dfrac{1}{n}\\sum x_i^2 - \\bar{x}^2$, $\\sigma(x) = \\sqrt{V(x)}$ ; $$\\operatorname{cov}(x, y) = \\dfrac{1}{n}\\sum x_i y_i - \\bar{x}\\,\\bar{y}.$$" },
      { type: 'definition', titre: 'Coefficient de corrélation linéaire', texte: "$r = \\dfrac{\\operatorname{cov}(x, y)}{\\sigma(x)\\sigma(y)}$, avec $-1 \\leq r \\leq 1$. Plus $|r|$ est proche de $1$, plus les points sont proches d'une droite ; le signe de $r$ est celui de la pente. En pratique, on considère souvent l'ajustement linéaire justifié lorsque $|r| \\geq 0{,}87$." },
      { type: 'theoreme', titre: 'Droite de régression (moindres carrés)', texte: "La droite de régression de $y$ en $x$ est la droite $y = ax + b$ qui rend minimale la somme $\\sum (y_i - ax_i - b)^2$ : $$a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}, \\qquad b = \\bar{y} - a\\bar{x}.$$ Elle passe par le point moyen $G$. La droite de régression de $x$ en $y$ est $x = a'y + b'$ avec $a' = \\dfrac{\\operatorname{cov}(x, y)}{V(y)}$ ; on a $r^2 = aa'$." },
      { type: 'propriete', titre: 'Tableau à double entrée', texte: "Les totaux des lignes et des colonnes donnent les séries marginales. La fréquence conditionnelle de la modalité $x_i$ sachant $y_j$ est l'effectif $n_{ij}$ divisé par l'effectif total de la colonne $y_j$." },
      { type: 'remarque', titre: 'Méthode de Mayer', texte: "Une méthode plus rapide consiste à partager le nuage (ordonné selon $x$) en deux sous-nuages de même effectif, à calculer leurs points moyens $G_1$ et $G_2$ et à prendre la droite $(G_1G_2)$, qui passe aussi par $G$." }
    ],
    methodes: [
      { titre: 'Déterminer la droite de régression de $y$ en $x$', etapes: [
        "Dresse un tableau avec les colonnes $x_i$, $y_i$, $x_i^2$, $x_iy_i$ (et $y_i^2$ si on demande $r$) et calcule les sommes.",
        "Calcule $\\bar{x}$, $\\bar{y}$, $V(x)$ et $\\operatorname{cov}(x, y)$.",
        "Calcule $a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$ puis $b = \\bar{y} - a\\bar{x}$ ; vérifie que $G$ est sur la droite."
      ] },
      { titre: 'Faire une estimation', etapes: [
        "Calcule $r$ pour vérifier que l'ajustement linéaire est pertinent.",
        "Remplace $x$ par la valeur donnée dans $y = ax + b$ (ou résous $ax + b = y_0$ pour estimer $x$).",
        "Reste prudent pour une extrapolation éloignée des données."
      ] }
    ],
    exemple: {
      enonce: "On donne la série : $x_i$ : $1$, $2$, $3$, $4$, $5$ et $y_i$ : $2$, $4$, $5$, $4$, $6$. Déterminer $G$, la droite de régression de $y$ en $x$ et le coefficient $r$.",
      solution: [
        "$\\bar{x} = 3$ et $\\bar{y} = 4{,}2$ : $G(3 \\,;\\, 4{,}2)$.",
        "$\\sum x_i^2 = 55$, donc $V(x) = 11 - 9 = 2$ ; $\\sum x_iy_i = 71$, donc $\\operatorname{cov}(x, y) = 14{,}2 - 12{,}6 = 1{,}6$.",
        "$a = \\dfrac{1{,}6}{2} = 0{,}8$ et $b = 4{,}2 - 0{,}8 \\times 3 = 1{,}8$ : $y = 0{,}8x + 1{,}8$.",
        "$\\sum y_i^2 = 97$, donc $V(y) = 19{,}4 - 17{,}64 = 1{,}76$ et $r = \\dfrac{1{,}6}{\\sqrt{2 \\times 1{,}76}} \\approx 0{,}85$."
      ]
    },
    erreurs: [
      "Oublier de retrancher $\\bar{x}\\,\\bar{y}$ dans le calcul de la covariance.",
      "Confondre la droite de régression de $y$ en $x$ et celle de $x$ en $y$ : elles sont différentes (sauf si $|r| = 1$).",
      "Faire une extrapolation très loin des données observées : l'estimation devient peu fiable.",
      "Arrondir trop tôt les résultats intermédiaires : garde au moins quatre décimales jusqu'à la fin."
    ],
    flashcards: [
      { q: "Coordonnées du point moyen ?", r: "$G(\\bar{x} \\,;\\, \\bar{y})$" },
      { q: "$\\operatorname{cov}(x, y)$ ?", r: "$\\dfrac{1}{n}\\sum x_iy_i - \\bar{x}\\,\\bar{y}$" },
      { q: "Coefficient de corrélation $r$ ?", r: "$\\dfrac{\\operatorname{cov}(x, y)}{\\sigma(x)\\sigma(y)}$" },
      { q: "Pente $a$ de la droite de régression de $y$ en $x$ ?", r: "$a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$" },
      { q: "Ordonnée à l'origine $b$ ?", r: "$b = \\bar{y} - a\\bar{x}$" },
      { q: "Par quel point passe la droite de régression ?", r: "Par le point moyen $G$." },
      { q: "Que signifie $r$ proche de $-1$ ?", r: "Forte corrélation linéaire négative (points proches d'une droite décroissante)." },
      { q: "Lien entre $r$, $a$ et $a'$ ?", r: "$r^2 = aa'$" }
    ],
    contexte: {
      titre: 'Pluie et arachide dans le bassin arachidier',
      enonce: "Dans la région de Kaolack (données fictives), on a relevé la pluviométrie $x$ (en centaines de mm) et le rendement $y$ de l'arachide (en quintaux par hectare) : $x$ : $4$, $5$, $6$, $7$, $8$ et $y$ : $6$, $8$, $9$, $11$, $12$. Déterminer la droite de régression de $y$ en $x$ et estimer le rendement pour une pluviométrie de $900$ mm.",
      solution: [
        "$\\bar{x} = 6$, $\\bar{y} = 9{,}2$ ; $\\sum x_i^2 = 190$ donc $V(x) = 38 - 36 = 2$ ; $\\sum x_iy_i = 291$ donc $\\operatorname{cov}(x, y) = 58{,}2 - 55{,}2 = 3$.",
        "$a = \\dfrac{3}{2} = 1{,}5$ et $b = 9{,}2 - 1{,}5 \\times 6 = 0{,}2$ : $y = 1{,}5x + 0{,}2$. De plus $r \\approx 0{,}99$ : l'ajustement est très bon.",
        "Pour $900$ mm, $x = 9$ : $y \\approx 1{,}5 \\times 9 + 0{,}2 = 13{,}7$ quintaux par hectare."
      ]
    },
    histoire: "La méthode des moindres carrés a été publiée en 1805 par Adrien-Marie Legendre ; Carl Friedrich Gauss affirma l'avoir utilisée dès 1795 pour calculer des orbites d'astres."
  };

  /* ================================================================== */
  /* Tle S1 — Arithmétique                                               */
  /* ================================================================== */
  EM.contenu['ts1-arithmetique'] = {
    resume: "Divisibilité dans $\\Z$, division euclidienne, congruences, PGCD et PPCM, théorèmes de Bézout et de Gauss, nombres premiers et équations diophantiennes $ax + by = c$.",
    objectifs: [
      "Utiliser la division euclidienne et les congruences (restes des puissances, critères de divisibilité)",
      "Calculer un PGCD par l'algorithme d'Euclide et utiliser le PPCM",
      "Appliquer les théorèmes de Bézout et de Gauss",
      "Décomposer un entier en produit de facteurs premiers ; utiliser le petit théorème de Fermat",
      "Résoudre une équation diophantienne $ax + by = c$"
    ],
    cours: [
      { type: 'theoreme', titre: 'Division euclidienne', texte: "Pour tout $a \\in \\Z$ et tout $b \\in \\N^*$, il existe un unique couple $(q \\,;\\, r)$ d'entiers tel que $a = bq + r$ et $0 \\leq r < b$ ; $q$ est le quotient et $r$ le reste." },
      { type: 'definition', titre: 'Congruences', texte: "Soit $n \\geq 2$. $a \\equiv b \\; [n]$ signifie que $n$ divise $a - b$, c'est-à-dire que $a$ et $b$ ont le même reste dans la division par $n$. Si $a \\equiv b \\; [n]$ et $c \\equiv d \\; [n]$, alors $a + c \\equiv b + d$, $ac \\equiv bd$ et $a^k \\equiv b^k \\; [n]$ pour tout entier naturel $k$." },
      { type: 'theoreme', titre: 'PGCD et algorithme d\'Euclide', texte: "Si $a = bq + r$, alors $\\operatorname{PGCD}(a, b) = \\operatorname{PGCD}(b, r)$. Dans l'algorithme d'Euclide, le PGCD est le dernier reste non nul. De plus $\\operatorname{PGCD}(a, b) \\times \\operatorname{PPCM}(a, b) = |ab|$." },
      { type: 'theoreme', titre: 'Théorème de Bézout', texte: "$a$ et $b$ sont premiers entre eux si et seulement s'il existe des entiers $u$ et $v$ tels que $au + bv = 1$. Plus généralement, il existe toujours $u$, $v$ tels que $au + bv = \\operatorname{PGCD}(a, b)$ (algorithme d'Euclide étendu)." },
      { type: 'theoreme', titre: 'Théorème de Gauss', texte: "Si $a$ divise $bc$ et si $a$ est premier avec $b$, alors $a$ divise $c$. Conséquence : si $a$ et $b$ sont premiers entre eux et divisent $n$, alors $ab$ divise $n$." },
      { type: 'theoreme', titre: 'Nombres premiers', texte: "Tout entier $n \\geq 2$ se décompose de façon unique (à l'ordre près) en produit de nombres premiers. Il existe une infinité de nombres premiers. <b>Petit théorème de Fermat</b> : si $p$ est premier et ne divise pas $a$, alors $a^{p-1} \\equiv 1 \\; [p]$." },
      { type: 'propriete', titre: 'Équation $ax + by = c$', texte: "Soit $d = \\operatorname{PGCD}(a, b)$. L'équation a des solutions entières si et seulement si $d$ divise $c$. Si $(x_0 \\,;\\, y_0)$ est une solution particulière et $a = da'$, $b = db'$, les solutions sont les couples $(x_0 + b'k \\,;\\, y_0 - a'k)$, $k \\in \\Z$." }
    ],
    methodes: [
      { titre: 'Reste de la division de $a^n$ par $m$', etapes: [
        "Calcule les restes de $a, a^2, a^3, \\dots$ modulo $m$ jusqu'à trouver $a^p \\equiv 1 \\; [m]$.",
        "Écris la division euclidienne $n = pq + r$.",
        "Conclus : $a^n = (a^p)^q \\times a^r \\equiv a^r \\; [m]$."
      ] },
      { titre: 'Résoudre $ax + by = c$ dans $\\Z^2$', etapes: [
        "Calcule $d = \\operatorname{PGCD}(a, b)$ ; s'il ne divise pas $c$, il n'y a pas de solution ; sinon divise l'équation par $d$.",
        "Trouve une solution particulière $(x_0 \\,;\\, y_0)$ (évidente ou par Bézout multipliée par $c$).",
        "Soustrais les deux égalités : $a'(x - x_0) = -b'(y - y_0)$, puis applique le théorème de Gauss.",
        "Écris les solutions générales et vérifie-les."
      ] }
    ],
    exemple: {
      enonce: "Résoudre dans $\\Z^2$ l'équation $5x + 3y = 1$.",
      solution: [
        "$\\operatorname{PGCD}(5, 3) = 1$ : il y a des solutions. Solution particulière : $(2 \\,;\\, -3)$ car $10 - 9 = 1$.",
        "Si $5x + 3y = 1$, alors $5(x - 2) = -3(y + 3)$. $3$ divise $5(x - 2)$ et est premier avec $5$ : d'après Gauss, $3$ divise $x - 2$, donc $x = 2 + 3k$.",
        "Alors $-3(y + 3) = 15k$, soit $y = -3 - 5k$.",
        "Réciproquement ces couples conviennent : $S = \\{(2 + 3k \\,;\\, -3 - 5k),\\ k \\in \\Z\\}$."
      ]
    },
    erreurs: [
      "Appliquer le théorème de Gauss sans vérifier que les deux nombres sont premiers entre eux.",
      "Donner un reste négatif : dans la division euclidienne, $0 \\leq r < b$ ($-7 = 3 \\times (-3) + 2$).",
      "« Simplifier » une congruence : $2a \\equiv 2b \\; [6]$ n'entraîne pas $a \\equiv b \\; [6]$ ($a = 0$, $b = 3$).",
      "Oublier la réciproque dans la résolution d'une équation diophantienne."
    ],
    flashcards: [
      { q: "$a \\equiv b \\; [n]$ signifie…", r: "$n$ divise $a - b$." },
      { q: "Lien PGCD / PPCM ?", r: "$\\operatorname{PGCD}(a, b) \\times \\operatorname{PPCM}(a, b) = |ab|$" },
      { q: "Théorème de Bézout ?", r: "$a$ et $b$ premiers entre eux $\\iff$ il existe $u$, $v$ entiers avec $au + bv = 1$." },
      { q: "Théorème de Gauss ?", r: "$a \\mid bc$ et $\\operatorname{PGCD}(a, b) = 1 \\Rightarrow a \\mid c$" },
      { q: "Petit théorème de Fermat ?", r: "$p$ premier, $p \\nmid a$ : $a^{p-1} \\equiv 1 \\; [p]$" },
      { q: "Quand $ax + by = c$ a-t-elle des solutions ?", r: "Quand $\\operatorname{PGCD}(a, b)$ divise $c$." },
      { q: "Reste de $10^n$ dans la division par $9$ ?", r: "$1$, car $10 \\equiv 1 \\; [9]$." },
      { q: "Dernier reste non nul de l'algorithme d'Euclide ?", r: "Le PGCD." }
    ],
    contexte: {
      titre: 'Payer avec des pièces de 100 et de 250 F CFA',
      enonce: "Au marché de Touba, Ibrahima doit payer exactement $1\\,400$ F CFA avec uniquement des pièces de $100$ F CFA et de $250$ F CFA. De combien de façons peut-il le faire ?",
      solution: [
        "On cherche les entiers naturels $x$ et $y$ tels que $100x + 250y = 1\\,400$, soit $2x + 5y = 28$.",
        "$2x = 28 - 5y$ doit être pair et positif : $y$ est pair et $5y \\leq 28$, donc $y \\in \\{0 \\,;\\, 2 \\,;\\, 4\\}$.",
        "On obtient $(x \\,;\\, y) = (14 \\,;\\, 0)$, $(9 \\,;\\, 2)$ ou $(4 \\,;\\, 4)$ : il y a $3$ façons de payer."
      ]
    },
    histoire: "L'algorithme qui porte le nom d'Euclide figure dans le livre VII de ses <em>Éléments</em>, vers 300 av. J.-C. La notation des congruences a été introduite par Carl Friedrich Gauss en 1801 dans ses <em>Disquisitiones arithmeticae</em>."
  };

  /* ================================================================== */
  /* Tle S1 — Coniques                                                   */
  /* ================================================================== */
  EM.contenu['ts1-coniques'] = {
    resume: "Définir les coniques (parabole, ellipse, hyperbole) par foyer, directrice et excentricité, utiliser leurs équations réduites et déterminer leurs éléments caractéristiques.",
    objectifs: [
      "Connaître la définition d'une conique par foyer, directrice et excentricité",
      "Reconnaître la nature d'une conique à partir de son équation, réduite ou non",
      "Déterminer les éléments caractéristiques : centre, sommets, foyers, directrices, excentricité, asymptotes",
      "Utiliser la définition bifocale de l'ellipse et de l'hyperbole et tracer une conique"
    ],
    cours: [
      { type: 'definition', titre: 'Définition par foyer et directrice', texte: "Soit $F$ un point, $(D)$ une droite ne passant pas par $F$ et $e > 0$. L'ensemble des points $M$ tels que $\\dfrac{MF}{MH} = e$, où $H$ est le projeté orthogonal de $M$ sur $(D)$, est une conique de foyer $F$, de directrice $(D)$ et d'excentricité $e$ : une <b>parabole</b> si $e = 1$, une <b>ellipse</b> si $0 < e < 1$, une <b>hyperbole</b> si $e > 1$." },
      { type: 'propriete', titre: 'Parabole $y^2 = 2px$ ($p > 0$)', texte: "Foyer $F\\left(\\dfrac{p}{2} \\,;\\, 0\\right)$, directrice $x = -\\dfrac{p}{2}$, sommet $O$, axe focal $(Ox)$, excentricité $1$. De même $x^2 = 2py$ a pour foyer $F\\left(0 \\,;\\, \\dfrac{p}{2}\\right)$." },
      { type: 'propriete', titre: 'Ellipse $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$ ($a > b > 0$)', texte: "$c = \\sqrt{a^2 - b^2}$ ; foyers $F(c \\,;\\, 0)$ et $F'(-c \\,;\\, 0)$ ; excentricité $e = \\dfrac{c}{a} < 1$ ; directrices $x = \\pm\\dfrac{a^2}{c}$ ; sommets $(\\pm a \\,;\\, 0)$ et $(0 \\,;\\, \\pm b)$. Définition bifocale : $MF + MF' = 2a$." },
      { type: 'propriete', titre: 'Hyperbole $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$', texte: "$c = \\sqrt{a^2 + b^2}$ ; foyers $(\\pm c \\,;\\, 0)$ ; excentricité $e = \\dfrac{c}{a} > 1$ ; directrices $x = \\pm\\dfrac{a^2}{c}$ ; sommets $(\\pm a \\,;\\, 0)$ ; asymptotes $y = \\pm\\dfrac{b}{a}x$. Définition bifocale : $|MF - MF'| = 2a$." },
      { type: 'remarque', titre: 'Équation non réduite', texte: "Pour une équation $Ax^2 + By^2 + Cx + Dy + E = 0$, on complète les carrés, puis on pose $X = x - x_\\Omega$ et $Y = y - y_\\Omega$ (changement d'origine en $\\Omega$). Dans les cas non dégénérés : $AB > 0$ donne une ellipse (un cercle si $A = B$), $AB < 0$ une hyperbole, $AB = 0$ une parabole." },
      { type: 'remarque', titre: 'Le cercle', texte: "Le cercle est un cas limite d'ellipse ($a = b$, donc $c = 0$) : on lui attribue l'excentricité $0$. Il n'a pas de directrice." }
    ],
    methodes: [
      { titre: 'Reconnaître une conique d\'équation non réduite', etapes: [
        "Regroupe les termes en $x$ et en $y$ et complète les carrés.",
        "Divise par le second membre pour obtenir $\\dfrac{X^2}{\\alpha} \\pm \\dfrac{Y^2}{\\beta} = 1$ avec $X = x - x_\\Omega$, $Y = y - y_\\Omega$.",
        "Identifie la nature, $a$, $b$, puis $c$ et $e$.",
        "Reviens au repère initial pour donner le centre, les foyers et les sommets."
      ] }
    ],
    exemple: {
      enonce: "Déterminer la nature et les éléments caractéristiques de la conique d'équation $x^2 + 4y^2 - 2x - 3 = 0$.",
      solution: [
        "$x^2 - 2x = (x - 1)^2 - 1$, donc l'équation s'écrit $(x - 1)^2 + 4y^2 = 4$, soit $\\dfrac{(x - 1)^2}{4} + y^2 = 1$.",
        "C'est une ellipse de centre $\\Omega(1 \\,;\\, 0)$, avec $a = 2$ et $b = 1$, d'axe focal parallèle à $(Ox)$.",
        "$c = \\sqrt{4 - 1} = \\sqrt{3}$, $e = \\dfrac{\\sqrt{3}}{2}$ ; foyers $(1 + \\sqrt{3} \\,;\\, 0)$ et $(1 - \\sqrt{3} \\,;\\, 0)$."
      ]
    },
    erreurs: [
      "Utiliser $c^2 = a^2 + b^2$ pour une ellipse (c'est $c^2 = a^2 - b^2$), ou l'inverse pour une hyperbole.",
      "Oublier de revenir au repère initial après un changement d'origine : les foyers de l'ellipse de l'exemple sont $(1 \\pm \\sqrt{3} \\,;\\, 0)$, pas $(\\pm\\sqrt{3} \\,;\\, 0)$.",
      "Prendre pour $a$ le plus petit demi-axe d'une ellipse : $a$ est le demi-grand axe, porté par l'axe focal."
    ],
    flashcards: [
      { q: "Nature d'une conique d'excentricité $e$ ?", r: "Parabole si $e = 1$, ellipse si $e < 1$, hyperbole si $e > 1$." },
      { q: "Foyer et directrice de $y^2 = 2px$ ?", r: "$F\\left(\\dfrac{p}{2} \\,;\\, 0\\right)$ et $x = -\\dfrac{p}{2}$" },
      { q: "Ellipse : relation entre $a$, $b$, $c$ ?", r: "$c^2 = a^2 - b^2$" },
      { q: "Hyperbole : relation entre $a$, $b$, $c$ ?", r: "$c^2 = a^2 + b^2$" },
      { q: "Excentricité d'une ellipse ou d'une hyperbole ?", r: "$e = \\dfrac{c}{a}$" },
      { q: "Asymptotes de $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$ ?", r: "$y = \\pm\\dfrac{b}{a}x$" },
      { q: "Définition bifocale de l'ellipse ?", r: "$MF + MF' = 2a$" },
      { q: "Directrices de l'ellipse $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$ ?", r: "$x = \\pm\\dfrac{a^2}{c}$" }
    ],
    contexte: {
      titre: 'Une antenne parabolique à Dakar',
      enonce: "Une antenne parabolique installée sur un toit de Dakar a une section en forme de parabole d'équation $y^2 = 2px$ (sommet en $O$). Elle mesure $80$ cm de diamètre et $10$ cm de profondeur. À quelle distance du sommet faut-il placer le récepteur, qui doit se trouver au foyer ?",
      solution: [
        "Le bord de l'antenne correspond au point $(10 \\,;\\, 40)$ (profondeur $10$ cm, demi-diamètre $40$ cm).",
        "Ce point est sur la parabole : $40^2 = 2p \\times 10$, donc $2p = 160$ et $p = 80$.",
        "Le foyer est $F\\left(\\dfrac{p}{2} \\,;\\, 0\\right) = (40 \\,;\\, 0)$ : le récepteur se place à $40$ cm du sommet."
      ]
    },
    histoire: "Vers 200 av. J.-C., Apollonius de Perge consacre aux coniques un grand traité, <em>Les Coniques</em> ; c'est à lui que l'on doit les noms d'ellipse, de parabole et d'hyperbole."
  };

  /* ================================================================== */
  /* Tle S1 — Produit vectoriel                                          */
  /* ================================================================== */
  EM.contenu['ts1-espace'] = {
    resume: "Le produit vectoriel dans l'espace orienté : définition, coordonnées, propriétés et applications aux aires, aux volumes, aux équations de plans et aux distances.",
    objectifs: [
      "Connaître la définition géométrique du produit vectoriel et ses propriétés",
      "Calculer les coordonnées de $\\vec{u} \\wedge \\vec{v}$ dans un repère orthonormé direct",
      "Calculer l'aire d'un triangle ou d'un parallélogramme et le volume d'un tétraèdre",
      "Déterminer un vecteur normal et une équation cartésienne d'un plan ; calculer la distance d'un point à un plan ou à une droite"
    ],
    cours: [
      { type: 'definition', titre: 'Produit vectoriel', texte: "L'espace est orienté. Si $\\vec{u}$ et $\\vec{v}$ sont colinéaires, $\\vec{u} \\wedge \\vec{v} = \\vec{0}$. Sinon, $\\vec{u} \\wedge \\vec{v}$ est le vecteur orthogonal à $\\vec{u}$ et à $\\vec{v}$, tel que $(\\vec{u}, \\vec{v}, \\vec{u} \\wedge \\vec{v})$ soit une base directe, et de norme $\\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\sin\\theta$, où $\\theta$ est l'angle géométrique des deux vecteurs." },
      { type: 'propriete', titre: 'Propriétés', texte: "$\\vec{v} \\wedge \\vec{u} = -\\vec{u} \\wedge \\vec{v}$ (antisymétrie) ; le produit vectoriel est bilinéaire ; $\\vec{u} \\wedge \\vec{v} = \\vec{0}$ si et seulement si $\\vec{u}$ et $\\vec{v}$ sont colinéaires. Dans une base orthonormée directe : $\\vec{i} \\wedge \\vec{j} = \\vec{k}$, $\\vec{j} \\wedge \\vec{k} = \\vec{i}$, $\\vec{k} \\wedge \\vec{i} = \\vec{j}$." },
      { type: 'formule', titre: 'Coordonnées', texte: "Dans un repère orthonormé direct, si $\\vec{u}(x \\,;\\, y \\,;\\, z)$ et $\\vec{v}(x' \\,;\\, y' \\,;\\, z')$ : $$\\vec{u} \\wedge \\vec{v} = (yz' - zy' \\,;\\, zx' - xz' \\,;\\, xy' - yx').$$" },
      { type: 'propriete', titre: 'Aires et volumes', texte: "Aire du parallélogramme $ABDC$ : $\\left\\|\\vect{AB} \\wedge \\vect{AC}\\right\\|$ ; aire du triangle $ABC$ : $\\dfrac{1}{2}\\left\\|\\vect{AB} \\wedge \\vect{AC}\\right\\|$.<br>Volume du tétraèdre $ABCD$ : $\\dfrac{1}{6}\\left|\\left(\\vect{AB} \\wedge \\vect{AC}\\right) \\cdot \\vect{AD}\\right|$ (le produit $\\left(\\vec{u} \\wedge \\vec{v}\\right) \\cdot \\vec{w}$ est le produit mixte)." },
      { type: 'propriete', titre: 'Plans et distances', texte: "Si $A$, $B$, $C$ ne sont pas alignés, $\\vec{n} = \\vect{AB} \\wedge \\vect{AC}$ est normal au plan $(ABC)$ ; une équation est $ax + by + cz + d = 0$ avec $\\vec{n}(a \\,;\\, b \\,;\\, c)$.<br>Distance de $M_0(x_0 \\,;\\, y_0 \\,;\\, z_0)$ au plan : $\\dfrac{|ax_0 + by_0 + cz_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}$. Distance de $M$ à la droite $(A, \\vec{u})$ : $\\dfrac{\\left\\|\\vect{AM} \\wedge \\vec{u}\\right\\|}{\\|\\vec{u}\\|}$." }
    ],
    methodes: [
      { titre: 'Équation du plan passant par $A$, $B$, $C$', etapes: [
        "Calcule les coordonnées de $\\vect{AB}$ et $\\vect{AC}$.",
        "Calcule $\\vec{n} = \\vect{AB} \\wedge \\vect{AC}$ (il ne doit pas être nul).",
        "Écris $ax + by + cz + d = 0$ avec $\\vec{n}(a \\,;\\, b \\,;\\, c)$ et trouve $d$ en écrivant que $A$ appartient au plan.",
        "Vérifie avec $B$ et $C$."
      ] }
    ],
    exemple: {
      enonce: "Soient $A(1 \\,;\\, 0 \\,;\\, 0)$, $B(0 \\,;\\, 2 \\,;\\, 0)$ et $C(0 \\,;\\, 0 \\,;\\, 3)$. Déterminer une équation du plan $(ABC)$, l'aire du triangle $ABC$ et la distance de $O$ au plan $(ABC)$.",
      solution: [
        "$\\vect{AB}(-1 \\,;\\, 2 \\,;\\, 0)$ et $\\vect{AC}(-1 \\,;\\, 0 \\,;\\, 3)$, donc $\\vec{n} = \\vect{AB} \\wedge \\vect{AC} = (6 \\,;\\, 3 \\,;\\, 2)$.",
        "$(ABC) : 6x + 3y + 2z + d = 0$ et $A \\in (ABC)$ donne $d = -6$ : $6x + 3y + 2z - 6 = 0$.",
        "$\\|\\vec{n}\\| = \\sqrt{36 + 9 + 4} = 7$, donc l'aire de $ABC$ vaut $\\dfrac{7}{2}$ u.a.",
        "Distance de $O$ au plan : $\\dfrac{|-6|}{7} = \\dfrac{6}{7}$."
      ]
    },
    erreurs: [
      "Se tromper dans l'ordre des produits pour la deuxième coordonnée : c'est $zx' - xz'$ (et non $xz' - zx'$).",
      "Oublier le facteur $\\dfrac{1}{2}$ pour l'aire d'un triangle ou $\\dfrac{1}{6}$ pour le volume d'un tétraèdre.",
      "Utiliser la formule des coordonnées dans un repère qui n'est pas orthonormé direct."
    ],
    flashcards: [
      { q: "Coordonnées de $\\vec{u} \\wedge \\vec{v}$ ?", r: "$(yz' - zy' \\,;\\, zx' - xz' \\,;\\, xy' - yx')$" },
      { q: "$\\|\\vec{u} \\wedge \\vec{v}\\|$ ?", r: "$\\|\\vec{u}\\| \\, \\|\\vec{v}\\| \\sin\\theta$" },
      { q: "$\\vec{v} \\wedge \\vec{u}$ ?", r: "$-\\vec{u} \\wedge \\vec{v}$" },
      { q: "$\\vec{u} \\wedge \\vec{v} = \\vec{0}$ ?", r: "Si et seulement si $\\vec{u}$ et $\\vec{v}$ sont colinéaires." },
      { q: "Aire du triangle $ABC$ ?", r: "$\\dfrac{1}{2}\\left\\|\\vect{AB} \\wedge \\vect{AC}\\right\\|$" },
      { q: "Volume du tétraèdre $ABCD$ ?", r: "$\\dfrac{1}{6}\\left|\\left(\\vect{AB} \\wedge \\vect{AC}\\right) \\cdot \\vect{AD}\\right|$" },
      { q: "$\\vec{i} \\wedge \\vec{j}$ dans une base orthonormée directe ?", r: "$\\vec{k}$" },
      { q: "Distance d'un point à un plan ?", r: "$\\dfrac{|ax_0 + by_0 + cz_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}$" }
    ],
    contexte: {
      titre: 'La toiture d\'un hangar à Kaolack',
      enonce: "Un pan de toiture triangulaire d'un hangar de Kaolack a pour sommets $A(0 \\,;\\, 0 \\,;\\, 3)$, $B(8 \\,;\\, 0 \\,;\\, 3)$ et $C(4 \\,;\\, 5 \\,;\\, 6)$ dans un repère orthonormé direct (unité : le mètre). Quelle surface de tôle faut-il pour le couvrir ?",
      solution: [
        "$\\vect{AB}(8 \\,;\\, 0 \\,;\\, 0)$ et $\\vect{AC}(4 \\,;\\, 5 \\,;\\, 3)$, donc $\\vect{AB} \\wedge \\vect{AC} = (0 \\times 3 - 0 \\times 5 \\,;\\, 0 \\times 4 - 8 \\times 3 \\,;\\, 8 \\times 5 - 0 \\times 4) = (0 \\,;\\, -24 \\,;\\, 40)$.",
        "$\\left\\|\\vect{AB} \\wedge \\vect{AC}\\right\\| = \\sqrt{576 + 1\\,600} = \\sqrt{2\\,176} = 8\\sqrt{34}$.",
        "Aire $= \\dfrac{1}{2} \\times 8\\sqrt{34} = 4\\sqrt{34} \\approx 23{,}3$ m² de tôle (sans compter les recouvrements)."
      ]
    }
  };

  /* ================================================================== */
  /* Tle L — Étude de fonctions                                          */
  /* ================================================================== */
  EM.contenu['tl-fonctions'] = {
    resume: "Étudier des fonctions polynômes et rationnelles simples : ensemble de définition, limites, dérivée, tableau de variations, tangente, asymptotes et courbe représentative.",
    objectifs: [
      "Déterminer l'ensemble de définition d'une fonction",
      "Calculer des limites simples aux bornes et repérer les asymptotes",
      "Calculer une dérivée, étudier son signe et dresser le tableau de variations",
      "Déterminer une équation de la tangente en un point",
      "Tracer une courbe et l'utiliser pour résoudre graphiquement une équation"
    ],
    cours: [
      { type: 'definition', titre: 'Ensemble de définition', texte: "Une fonction polynôme est définie sur $\\R$. Une fonction rationnelle $\\dfrac{P(x)}{Q(x)}$ est définie pour les $x$ tels que $Q(x) \\neq 0$. On note $D_f$ l'ensemble de définition." },
      { type: 'formule', titre: 'Dérivées usuelles', texte: "$(k)' = 0$ ; $(x^n)' = nx^{n-1}$ ; $\\left(\\dfrac{1}{x}\\right)' = -\\dfrac{1}{x^2}$ ; $(u + v)' = u' + v'$ ; $(ku)' = ku'$ ; $(uv)' = u'v + uv'$ ; $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$." },
      { type: 'theoreme', titre: 'Signe de la dérivée et variations', texte: "Si $f'(x) > 0$ sur un intervalle (sauf en des points isolés), $f$ y est strictement croissante ; si $f'(x) < 0$, elle est strictement décroissante. Si $f'$ s'annule en changeant de signe en $a$, $f$ admet un extremum (maximum ou minimum) en $a$." },
      { type: 'propriete', titre: 'Limites et asymptotes', texte: "En $\\pm\\infty$, un polynôme a la même limite que son terme de plus haut degré ; une fonction rationnelle, la même limite que le quotient des termes de plus haut degré.<br>Si $\\lim\\limits_{x \\to a} f(x) = \\pm\\infty$ : asymptote verticale $x = a$. Si $\\lim\\limits_{x \\to \\pm\\infty} f(x) = \\ell$ : asymptote horizontale $y = \\ell$." },
      { type: 'formule', titre: 'Tangente', texte: "La tangente à $\\mathcal{C}_f$ au point d'abscisse $a$ a pour équation $y = f'(a)(x - a) + f(a)$ ; son coefficient directeur est $f'(a)$." }
    ],
    methodes: [
      { titre: 'Étudier une fonction', etapes: [
        "Détermine $D_f$.",
        "Calcule les limites aux bornes de $D_f$ et repère les asymptotes.",
        "Calcule $f'(x)$, étudie son signe (factorisation, discriminant, tableau de signes).",
        "Dresse le tableau de variations avec les extremums, puis trace la courbe avec quelques points et tangentes."
      ] }
    ],
    exemple: {
      enonce: "Étudier les variations de $f(x) = x^3 - 3x + 1$ et donner l'équation de la tangente au point d'abscisse $0$.",
      solution: [
        "$D_f = \\R$ ; $f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$.",
        "$f'(x) > 0$ sur $]-\\infty \\,;\\, -1[$ et sur $]1 \\,;\\, +\\infty[$, $f'(x) < 0$ sur $]-1 \\,;\\, 1[$.",
        "$f$ est croissante, puis décroissante, puis croissante : maximum local $f(-1) = 3$, minimum local $f(1) = -1$.",
        "$f(0) = 1$ et $f'(0) = -3$ : la tangente en $0$ a pour équation $y = -3x + 1$."
      ]
    },
    erreurs: [
      "Oublier les valeurs interdites d'une fonction rationnelle.",
      "Confondre le signe de $f$ et le signe de $f'$ : c'est le signe de $f'$ qui donne les variations.",
      "Dans l'équation de la tangente, oublier d'ajouter $f(a)$ ou écrire $(x + a)$ au lieu de $(x - a)$."
    ],
    flashcards: [
      { q: "$(x^n)'$ ?", r: "$nx^{n-1}$" },
      { q: "$\\left(\\dfrac{1}{x}\\right)'$ ?", r: "$-\\dfrac{1}{x^2}$" },
      { q: "$(uv)'$ ?", r: "$u'v + uv'$" },
      { q: "$f'(x) > 0$ sur un intervalle ?", r: "$f$ est strictement croissante sur cet intervalle." },
      { q: "Équation de la tangente en $a$ ?", r: "$y = f'(a)(x - a) + f(a)$" },
      { q: "$\\lim\\limits_{x \\to +\\infty} \\dfrac{3x + 1}{x - 2}$ ?", r: "$3$ : la droite $y = 3$ est asymptote horizontale." },
      { q: "$D_f$ pour $f(x) = \\dfrac{2}{x - 5}$ ?", r: "$\\R \\setminus \\{5\\}$" }
    ],
    contexte: {
      titre: 'Une coopérative de jus de fruits à Ziguinchor',
      enonce: "Une coopérative de Ziguinchor produit des jus de bissap et de mangue. Pour $x$ centaines de bouteilles vendues ($0 \\leq x \\leq 60$), son bénéfice, en milliers de F CFA, est $B(x) = -x^2 + 60x - 500$. Combien de bouteilles doit-elle vendre pour un bénéfice maximal ? Quel est ce bénéfice ?",
      solution: [
        "$B'(x) = -2x + 60$ : $B'(x) > 0$ pour $x < 30$ et $B'(x) < 0$ pour $x > 30$.",
        "$B$ est maximal pour $x = 30$, c'est-à-dire $3\\,000$ bouteilles.",
        "$B(30) = -900 + 1\\,800 - 500 = 400$ : le bénéfice maximal est de $400\\,000$ F CFA."
      ]
    }
  };

  /* ================================================================== */
  /* Tle L — Logarithme et exponentielle                                 */
  /* ================================================================== */
  EM.contenu['tl-logarithme-exponentielle'] = {
    resume: "Découvrir les fonctions $\\ln$ et $\\exp$, leurs propriétés de calcul, résoudre des équations et inéquations simples et les utiliser pour des problèmes d'évolution (intérêts composés, population).",
    objectifs: [
      "Connaître les propriétés algébriques de $\\ln$ et de $\\exp$",
      "Résoudre des équations et inéquations simples avec $\\ln$ et $\\exp$",
      "Connaître le sens de variation et les limites usuelles de $\\ln$ et $\\exp$",
      "Dériver des fonctions simples comportant $\\ln$ ou $\\exp$",
      "Résoudre une inéquation $q^n > A$ à l'aide du logarithme"
    ],
    cours: [
      { type: 'definition', titre: 'Les fonctions $\\ln$ et $\\exp$', texte: "$\\ln$ est définie sur $]0 \\,;\\, +\\infty[$, $\\exp$ sur $\\R$ ; elles sont réciproques l'une de l'autre : pour $x$ réel et $y > 0$, $y = e^x \\iff x = \\ln y$. On a $\\ln 1 = 0$, $\\ln e = 1$, $e^0 = 1$ et $e \\approx 2{,}718$." },
      { type: 'propriete', titre: 'Règles de calcul', texte: "Pour $a > 0$, $b > 0$ : $\\ln(ab) = \\ln a + \\ln b$ ; $\\ln\\dfrac{a}{b} = \\ln a - \\ln b$ ; $\\ln(a^n) = n\\ln a$.<br>Pour $x$, $y$ réels : $e^{x + y} = e^x e^y$ ; $e^{-x} = \\dfrac{1}{e^x}$ ; $e^{\\ln a} = a$ ; $\\ln(e^x) = x$." },
      { type: 'propriete', titre: 'Variations et équations', texte: "$\\ln$ et $\\exp$ sont strictement croissantes. Donc $\\ln a = \\ln b \\iff a = b$, $\\ln a < \\ln b \\iff a < b$, $e^a < e^b \\iff a < b$. Pour $c > 0$ : $e^x = c \\iff x = \\ln c$. Pour tout réel $k$ : $\\ln x = k \\iff x = e^k$." },
      { type: 'formule', titre: 'Limites et dérivées', texte: "$\\lim\\limits_{x \\to +\\infty} \\ln x = +\\infty$, $\\lim\\limits_{x \\to 0^+} \\ln x = -\\infty$, $\\lim\\limits_{x \\to +\\infty} e^x = +\\infty$, $\\lim\\limits_{x \\to -\\infty} e^x = 0$.<br>$(\\ln x)' = \\dfrac{1}{x}$ ; $(e^x)' = e^x$ ; $(e^{ax + b})' = ae^{ax + b}$." },
      { type: 'remarque', titre: 'Signe', texte: "$e^x > 0$ pour tout réel $x$. $\\ln x < 0$ sur $]0 \\,;\\, 1[$ et $\\ln x > 0$ sur $]1 \\,;\\, +\\infty[$." }
    ],
    methodes: [
      { titre: 'Résoudre $q^n > A$ (avec $q > 1$)', etapes: [
        "Applique $\\ln$, qui est croissante : $n\\ln q > \\ln A$.",
        "Divise par $\\ln q > 0$ : $n > \\dfrac{\\ln A}{\\ln q}$ (si $0 < q < 1$, $\\ln q < 0$ et le sens change).",
        "Calcule la valeur à la calculatrice et donne le plus petit entier $n$ qui convient."
      ] }
    ],
    exemple: {
      enonce: "Déterminer le plus petit entier naturel $n$ tel que $2^n > 1\\,000$.",
      solution: [
        "$2^n > 1\\,000 \\iff n\\ln 2 > \\ln 1\\,000$.",
        "$\\ln 2 > 0$, donc $n > \\dfrac{\\ln 1\\,000}{\\ln 2} \\approx 9{,}97$.",
        "Le plus petit entier est $n = 10$ (en effet $2^{10} = 1\\,024$)."
      ]
    },
    erreurs: [
      "Écrire $\\ln(a + b) = \\ln a + \\ln b$ : c'est faux.",
      "Oublier que $\\ln x$ n'existe que pour $x > 0$.",
      "Oublier de changer le sens d'une inégalité en divisant par $\\ln q < 0$ (quand $0 < q < 1$)."
    ],
    flashcards: [
      { q: "$\\ln(ab)$ ?", r: "$\\ln a + \\ln b$" },
      { q: "$\\ln(a^n)$ ?", r: "$n\\ln a$" },
      { q: "$e^{\\ln 5}$ ?", r: "$5$" },
      { q: "$\\ln(e^3)$ ?", r: "$3$" },
      { q: "Solution de $e^x = 7$ ?", r: "$x = \\ln 7$" },
      { q: "Solution de $\\ln x = 2$ ?", r: "$x = e^2$" },
      { q: "$(e^{3x})'$ ?", r: "$3e^{3x}$" },
      { q: "$\\ln 1$ et $e^0$ ?", r: "$0$ et $1$" }
    ],
    contexte: {
      titre: 'La population d\'une commune de Diourbel',
      enonce: "Une commune de la région de Diourbel compte $18\\,000$ habitants en 2025 et sa population augmente de $3$ % par an. Au bout de combien d'années aura-t-elle doublé ?",
      solution: [
        "Après $n$ années, la population est $18\\,000 \\times 1{,}03^n$. On cherche $1{,}03^n > 2$.",
        "$n\\ln 1{,}03 > \\ln 2 \\iff n > \\dfrac{\\ln 2}{\\ln 1{,}03} \\approx 23{,}4$.",
        "La population aura doublé au bout de $24$ ans, en 2049."
      ]
    }
  };

  /* ================================================================== */
  /* Tle L — Suites numériques                                           */
  /* ================================================================== */
  EM.contenu['tl-suites'] = {
    resume: "Suites arithmétiques et géométriques, suites $u_{n+1} = au_n + b$, sommes de termes et applications à l'épargne, aux intérêts et à l'évolution d'une population.",
    objectifs: [
      "Reconnaître une suite arithmétique ou géométrique et calculer un terme quelconque",
      "Calculer la somme de termes consécutifs",
      "Étudier le sens de variation et la limite d'une suite géométrique",
      "Étudier une suite $u_{n+1} = au_n + b$ à l'aide d'une suite auxiliaire géométrique",
      "Résoudre des problèmes d'intérêts simples ou composés"
    ],
    cours: [
      { type: 'definition', titre: 'Suites arithmétiques', texte: "$(u_n)$ est arithmétique de raison $r$ si $u_{n+1} = u_n + r$ pour tout $n$. Alors $u_n = u_0 + nr$ (ou $u_n = u_1 + (n - 1)r$). Somme de termes consécutifs : $S = \\text{(nombre de termes)} \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$." },
      { type: 'definition', titre: 'Suites géométriques', texte: "$(u_n)$ est géométrique de raison $q$ si $u_{n+1} = qu_n$ pour tout $n$. Alors $u_n = u_0q^n$. Pour $q \\neq 1$, la somme de $N$ termes consécutifs vaut $\\text{(premier terme)} \\times \\dfrac{1 - q^N}{1 - q}$." },
      { type: 'propriete', titre: 'Pourcentages et suites géométriques', texte: "Augmenter une quantité de $t$ % revient à la multiplier par $1 + \\dfrac{t}{100}$ ; la diminuer de $t$ %, à la multiplier par $1 - \\dfrac{t}{100}$. Un capital placé à intérêts composés au taux $t$ % évolue selon une suite géométrique : $C_n = C_0\\left(1 + \\dfrac{t}{100}\\right)^n$." },
      { type: 'propriete', titre: 'Limite d\'une suite géométrique', texte: "Si $q > 1$ et $u_0 > 0$, $(u_n)$ est croissante et tend vers $+\\infty$. Si $0 < q < 1$, $\\lim q^n = 0$ et $(u_n)$ tend vers $0$." },
      { type: 'propriete', titre: 'Suites $u_{n+1} = au_n + b$', texte: "On cherche le réel $\\ell$ tel que $\\ell = a\\ell + b$. La suite $v_n = u_n - \\ell$ est géométrique de raison $a$ ; donc $u_n = (u_0 - \\ell)a^n + \\ell$. Si $0 < a < 1$, $(u_n)$ converge vers $\\ell$." }
    ],
    methodes: [
      { titre: 'Reconnaître une suite arithmétique ou géométrique', etapes: [
        "Calcule $u_{n+1} - u_n$ : s'il est constant, la suite est arithmétique.",
        "Sinon, calcule $\\dfrac{u_{n+1}}{u_n}$ (termes non nuls) : s'il est constant, la suite est géométrique.",
        "Dans un énoncé : « on ajoute la même quantité » donne une suite arithmétique, « on multiplie par le même nombre » (pourcentage) une suite géométrique."
      ] }
    ],
    exemple: {
      enonce: "Un capital de $200\\,000$ F CFA est placé à intérêts composés au taux annuel de $5$ %. Exprimer le capital $C_n$ après $n$ années et calculer $C_{10}$.",
      solution: [
        "Chaque année le capital est multiplié par $1{,}05$ : $(C_n)$ est géométrique de raison $1{,}05$ et $C_n = 200\\,000 \\times 1{,}05^n$.",
        "$C_{10} = 200\\,000 \\times 1{,}05^{10} \\approx 325\\,779$ F CFA."
      ]
    },
    erreurs: [
      "Confondre $u_n = u_0 + nr$ et $u_n = u_1 + nr$ : vérifie l'indice du premier terme.",
      "Se tromper sur le nombre de termes d'une somme : de $u_1$ à $u_{12}$ il y a $12$ termes, de $u_0$ à $u_{12}$ il y en a $13$.",
      "Traduire une hausse de $5$ % par une multiplication par $0{,}05$ au lieu de $1{,}05$."
    ],
    flashcards: [
      { q: "Terme général d'une suite arithmétique ?", r: "$u_n = u_0 + nr$" },
      { q: "Terme général d'une suite géométrique ?", r: "$u_n = u_0q^n$" },
      { q: "Somme de termes d'une suite arithmétique ?", r: "$\\text{nombre de termes} \\times \\dfrac{\\text{premier} + \\text{dernier}}{2}$" },
      { q: "Somme de $N$ termes d'une suite géométrique ?", r: "$\\text{premier} \\times \\dfrac{1 - q^N}{1 - q}$" },
      { q: "Coefficient multiplicateur d'une hausse de $8$ % ?", r: "$1{,}08$" },
      { q: "$\\lim q^n$ si $0 < q < 1$ ?", r: "$0$" },
      { q: "Capital après $n$ ans à intérêts composés au taux $t$ % ?", r: "$C_n = C_0\\left(1 + \\dfrac{t}{100}\\right)^n$" }
    ],
    contexte: {
      titre: 'Épargner pour la Tabaski',
      enonce: "Pour préparer la Tabaski, Awa dépose $10\\,000$ F CFA le premier mois dans une caisse d'épargne, puis chaque mois $1\\,000$ F CFA de plus que le mois précédent. Combien aura-t-elle déposé au total au bout de $12$ mois ?",
      solution: [
        "Les dépôts forment une suite arithmétique de premier terme $u_1 = 10\\,000$ et de raison $1\\,000$ : $u_{12} = 10\\,000 + 11 \\times 1\\,000 = 21\\,000$.",
        "Total : $S = 12 \\times \\dfrac{10\\,000 + 21\\,000}{2} = 186\\,000$ F CFA."
      ]
    }
  };

  /* ================================================================== */
  /* Tle L — Statistiques à deux variables                               */
  /* ================================================================== */
  EM.contenu['tl-statistiques'] = {
    resume: "Représenter une série statistique double par un nuage de points, calculer le point moyen, la covariance et le coefficient de corrélation, déterminer une droite d'ajustement et faire des estimations.",
    objectifs: [
      "Représenter une série double par un nuage de points et placer le point moyen $G$",
      "Calculer la variance, la covariance et le coefficient de corrélation linéaire",
      "Déterminer une droite d'ajustement (méthode de Mayer ou des moindres carrés)",
      "Utiliser la droite d'ajustement pour faire une estimation"
    ],
    cours: [
      { type: 'definition', titre: 'Point moyen', texte: "Pour une série $(x_i \\,;\\, y_i)$ de $n$ points, le point moyen est $G(\\bar{x} \\,;\\, \\bar{y})$ avec $\\bar{x} = \\dfrac{x_1 + \\dots + x_n}{n}$ et $\\bar{y} = \\dfrac{y_1 + \\dots + y_n}{n}$." },
      { type: 'formule', titre: 'Variance et covariance', texte: "$V(x) = \\dfrac{1}{n}\\sum x_i^2 - \\bar{x}^2$ et $\\operatorname{cov}(x, y) = \\dfrac{1}{n}\\sum x_iy_i - \\bar{x}\\,\\bar{y}$." },
      { type: 'definition', titre: 'Coefficient de corrélation linéaire', texte: "$r = \\dfrac{\\operatorname{cov}(x, y)}{\\sqrt{V(x)V(y)}}$ est compris entre $-1$ et $1$. Si $|r|$ est proche de $1$ (en pratique $|r| \\geq 0{,}87$), un ajustement affine est justifié." },
      { type: 'theoreme', titre: 'Droite des moindres carrés', texte: "La droite de régression de $y$ en $x$ a pour équation $y = ax + b$ avec $a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$ et $b = \\bar{y} - a\\bar{x}$. Elle passe par $G$." },
      { type: 'remarque', titre: 'Méthode de Mayer', texte: "On partage le nuage en deux groupes de même effectif (selon les valeurs croissantes de $x$), on calcule leurs points moyens $G_1$ et $G_2$ : la droite $(G_1G_2)$ est une droite d'ajustement qui passe par $G$." }
    ],
    methodes: [
      { titre: 'Faire un ajustement et une estimation', etapes: [
        "Calcule $\\bar{x}$, $\\bar{y}$, $V(x)$ et $\\operatorname{cov}(x, y)$ à l'aide d'un tableau.",
        "Calcule $a$ et $b$ et écris l'équation de la droite.",
        "Remplace $x$ par la valeur demandée pour estimer $y$."
      ] }
    ],
    exemple: {
      enonce: "Au marché de Thiaroye (données fictives), le prix $x$ du kilogramme d'oignon (en centaines de F CFA) et la quantité vendue $y$ (en tonnes) sont : $x$ : $2$, $3$, $4$, $5$, $6$ ; $y$ : $50$, $44$, $40$, $33$, $28$. Déterminer la droite de régression de $y$ en $x$ et estimer la quantité vendue pour un prix de $700$ F CFA.",
      solution: [
        "$\\bar{x} = 4$, $\\bar{y} = 39$ ; $\\sum x_i^2 = 90$ donc $V(x) = 18 - 16 = 2$.",
        "$\\sum x_iy_i = 725$ donc $\\operatorname{cov}(x, y) = 145 - 156 = -11$.",
        "$a = \\dfrac{-11}{2} = -5{,}5$ et $b = 39 + 5{,}5 \\times 4 = 61$ : $y = -5{,}5x + 61$.",
        "Pour $x = 7$ : $y = -38{,}5 + 61 = 22{,}5$ tonnes."
      ]
    },
    erreurs: [
      "Oublier de retrancher $\\bar{x}\\,\\bar{y}$ dans la covariance.",
      "Inverser les rôles de $x$ et de $y$ dans la formule de la pente.",
      "Faire confiance à une estimation très éloignée des données observées."
    ],
    flashcards: [
      { q: "Point moyen ?", r: "$G(\\bar{x} \\,;\\, \\bar{y})$" },
      { q: "Covariance ?", r: "$\\dfrac{1}{n}\\sum x_iy_i - \\bar{x}\\,\\bar{y}$" },
      { q: "Pente de la droite des moindres carrés ?", r: "$a = \\dfrac{\\operatorname{cov}(x, y)}{V(x)}$" },
      { q: "Ordonnée à l'origine ?", r: "$b = \\bar{y} - a\\bar{x}$" },
      { q: "Signe de $r$ quand $y$ diminue lorsque $x$ augmente ?", r: "Négatif." },
      { q: "Méthode de Mayer ?", r: "Droite passant par les points moyens $G_1$ et $G_2$ des deux moitiés du nuage." }
    ],
    contexte: {
      titre: 'Heures de révision et notes au BAC blanc',
      enonce: "Dans une classe de Terminale L de Mbour (données fictives), on a relevé le nombre $x$ d'heures de révision par semaine et la note $y$ au BAC blanc de cinq élèves : $x$ : $2$, $4$, $5$, $7$, $8$ ; $y$ : $8$, $10$, $11$, $13$, $15$. Déterminer le point moyen et la droite de régression de $y$ en $x$, puis estimer la note d'un élève qui révise $6$ heures.",
      solution: [
        "$\\bar{x} = \\dfrac{26}{5} = 5{,}2$ et $\\bar{y} = \\dfrac{57}{5} = 11{,}4$ : $G(5{,}2 \\,;\\, 11{,}4)$.",
        "$\\sum x_i^2 = 158$ donc $V(x) = 31{,}6 - 27{,}04 = 4{,}56$ ; $\\sum x_iy_i = 322$ donc $\\operatorname{cov}(x, y) = 64{,}4 - 59{,}28 = 5{,}12$.",
        "$a = \\dfrac{5{,}12}{4{,}56} \\approx 1{,}12$ et $b \\approx 11{,}4 - 1{,}1228 \\times 5{,}2 \\approx 5{,}56$ : $y \\approx 1{,}12x + 5{,}56$.",
        "Pour $x = 6$ : $y \\approx 1{,}1228 \\times 6 + 5{,}56 \\approx 12{,}3$ sur $20$."
      ]
    }
  };

  /* ================================================================== */
  /* Tle L — Dénombrement et probabilités                                */
  /* ================================================================== */
  EM.contenu['tl-probabilites'] = {
    resume: "Dénombrer à l'aide d'arbres, de listes, d'arrangements et de combinaisons, calculer des probabilités simples et étudier une variable aléatoire (loi, espérance) pour juger si un jeu est équitable.",
    objectifs: [
      "Dénombrer à l'aide d'un arbre, du principe multiplicatif, des arrangements et des combinaisons",
      "Calculer la probabilité d'un événement dans une situation d'équiprobabilité",
      "Utiliser l'événement contraire et la probabilité d'une réunion",
      "Déterminer la loi d'une variable aléatoire et son espérance"
    ],
    cours: [
      { type: 'formule', titre: 'Dénombrement', texte: "Principe multiplicatif : si un choix se fait en deux étapes avec $n$ puis $p$ possibilités, il y a $n \\times p$ possibilités. Factorielle : $n! = 1 \\times 2 \\times \\dots \\times n$.<br>Arrangements (ordre, sans répétition) : $A_n^p = n(n - 1)\\cdots(n - p + 1)$. Combinaisons (sans ordre) : $C_n^p = \\dfrac{A_n^p}{p!}$." },
      { type: 'definition', titre: 'Probabilité', texte: "Dans une situation d'équiprobabilité, $P(A) = \\dfrac{\\Card(A)}{\\Card(\\Omega)} = \\dfrac{\\text{nombre de cas favorables}}{\\text{nombre de cas possibles}}$. Une probabilité est comprise entre $0$ et $1$." },
      { type: 'propriete', titre: 'Événements', texte: "$P(\\overline{A}) = 1 - P(A)$ ; $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ ; si $A$ et $B$ sont incompatibles ($A \\cap B = \\varnothing$), $P(A \\cup B) = P(A) + P(B)$." },
      { type: 'definition', titre: 'Variable aléatoire et espérance', texte: "Une variable aléatoire $X$ associe un nombre à chaque issue. Sa loi donne les probabilités $p_i = P(X = x_i)$ (leur somme vaut $1$). Son espérance est $E(X) = x_1p_1 + x_2p_2 + \\dots + x_kp_k$ : c'est la valeur moyenne de $X$ sur un grand nombre d'expériences." },
      { type: 'remarque', titre: 'Jeu équitable', texte: "Si $X$ est le gain algébrique d'un joueur, le jeu est favorable au joueur si $E(X) > 0$, défavorable si $E(X) < 0$, équitable si $E(X) = 0$." }
    ],
    methodes: [
      { titre: 'Calculer une probabilité par dénombrement', etapes: [
        "Décris l'univers $\\Omega$ et calcule $\\Card(\\Omega)$ (combinaisons pour un tirage simultané).",
        "Compte les issues favorables à l'événement.",
        "Divise : $P(A) = \\dfrac{\\Card(A)}{\\Card(\\Omega)}$. Pour « au moins un », utilise l'événement contraire."
      ] }
    ],
    exemple: {
      enonce: "Une urne contient $3$ boules rouges et $2$ boules vertes. On tire simultanément $2$ boules. Calculer la probabilité d'obtenir deux boules rouges, puis celle d'obtenir au moins une boule verte.",
      solution: [
        "$\\Card(\\Omega) = C_5^2 = 10$.",
        "Deux rouges : $C_3^2 = 3$ tirages, donc $P = \\dfrac{3}{10}$.",
        "« Au moins une verte » est le contraire de « deux rouges » : $P = 1 - \\dfrac{3}{10} = \\dfrac{7}{10}$."
      ]
    },
    erreurs: [
      "Utiliser des arrangements pour un tirage simultané (l'ordre ne compte pas : combinaisons).",
      "Oublier de vérifier que la somme des probabilités d'une loi vaut $1$.",
      "Additionner les probabilités de deux événements qui ne sont pas incompatibles sans retrancher $P(A \\cap B)$."
    ],
    flashcards: [
      { q: "$5!$ ?", r: "$120$" },
      { q: "$C_5^2$ ?", r: "$10$" },
      { q: "$A_5^2$ ?", r: "$20$" },
      { q: "$P(\\overline{A})$ ?", r: "$1 - P(A)$" },
      { q: "$P(A \\cup B)$ ?", r: "$P(A) + P(B) - P(A \\cap B)$" },
      { q: "Espérance $E(X)$ ?", r: "$\\sum x_iP(X = x_i)$" },
      { q: "Jeu équitable ?", r: "$E(X) = 0$" }
    ],
    contexte: {
      titre: 'La tombola de la kermesse',
      enonce: "À la kermesse d'un lycée de Louga, un billet de tombola coûte $500$ F CFA. Sur $200$ billets, $2$ font gagner $10\\,000$ F CFA, $10$ font gagner $2\\,000$ F CFA, les autres ne gagnent rien. On note $X$ le gain algébrique (gain moins prix du billet) d'un acheteur. Déterminer la loi de $X$ et $E(X)$. Le jeu est-il favorable à l'acheteur ?",
      solution: [
        "$X$ prend les valeurs $9\\,500$, $1\\,500$ et $-500$ avec les probabilités $\\dfrac{2}{200} = 0{,}01$, $\\dfrac{10}{200} = 0{,}05$ et $\\dfrac{188}{200} = 0{,}94$.",
        "$E(X) = 9\\,500 \\times 0{,}01 + 1\\,500 \\times 0{,}05 - 500 \\times 0{,}94 = 95 + 75 - 470 = -300$.",
        "$E(X) < 0$ : le jeu est défavorable à l'acheteur, qui perd en moyenne $300$ F CFA par billet ; c'est ce qui permet à la kermesse de financer ses activités."
      ]
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);
