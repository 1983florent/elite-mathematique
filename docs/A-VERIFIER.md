# Points à vérifier avec les programmes officiels

Le logiciel a été construit à partir de la connaissance générale des programmes de mathématiques du Sénégal.
Les documents officiels mentionnés lors de la demande n'étaient pas joints au dépôt : voici les points
dont l'alignement exact mérite d'être confirmé. Pour corriger :

- l'ordre, le titre ou la classe d'un chapitre : `js/data/programme.js` ;
- le cours d'un chapitre : `js/data/contenu-*.js` ;
- un type d'exercice : `js/gen/*.js` (chaque générateur indique ses `chapitres`).

## Organisation générale

- **Classes couvertes** : CM2 (CFEE), 6e à 3e (BFEM), 2nde S et L, 1ère S1, S2 et L, Terminales S1, S2 et L.
  Les séries S3, L1a, L1b, L2 et L' ne sont pas distinguées.
- **Durées des examens blancs** : indicatives (CFEE 1 h, BFEM 2 h, BAC S1/S2 4 h, BAC L 2 h).
- **Structure des sujets** : BFEM = activités numériques (10 pts) + activités géométriques (10 pts) ;
  BAC S = deux exercices (4 + 4 pts) + un problème (12 pts) ; BAC L = deux exercices (5 + 5 pts) + un problème (10 pts).
  Dans le logiciel, le « problème » est composé de plusieurs exercices indépendants d'analyse.

## Élémentaire et 6e

- Intérêt simple au CM2 : classique dans les problèmes du CFEE, présence actuelle à confirmer.
- Somme de fractions de même dénominateur, bissectrice et angles adjacents en 6e.
- Volontairement laissés hors de la 6e : somme des angles du triangle (vue en 5e), nombres premiers et division par un décimal (en remarque).

## 5e et 4e

- Angles alternes-externes en 5e ; bissectrice, inégalité triangulaire et aire du losange en 5e.
- Intervalles en 4e : l'exercice d'inéquation accepte une réponse en intervalle **ou** en inégalité (« x < 3 »).
- Équations « dans ℚ » en 4e.

## 3e et 2nde L

- Valeur absolue en 3e ($\sqrt{a^2} = |a|$ et « écrire sans valeur absolue »).
- Applications affines par intervalles : seulement mentionnées dans le cours.
- Systèmes d'inéquations : exercice de type QCM (« quel point est solution »), sans hachurage de région.
- TVA à 18 % présentée comme taux normal au Sénégal (2nde L).

## 2nde S et 1ère L

- Quartiles en 2nde S (définition par le rang ⌈N/4⌉).
- Rotations limitées au quart de tour en 2nde S ; géométrie dans l'espace limitée au cube.
- Équation de la tangente en 1ère L ; année commerciale de 360 jours pour les intérêts.

## 1ère S1 et S2

- Périmètre de « Statistiques » en 1ère S2 (une variable ; deux variables seulement introduites).
- 1ère S1 : distance et représentation paramétrique dans l'espace ; composées de transformations.
- Théorème des gendarmes en 1ère ; formules de transformation somme→produit non traitées.

## Terminales

- « Statistiques à deux variables » est rattaché à la Tle S1 et à la Tle S2 : à confirmer pour la S1.
- Tle L : loi binomiale et probabilités conditionnelles non incluses.
- Seuil $|r| \geq 0{,}87$ pour justifier un ajustement linéaire, présenté comme une convention usuelle.
- Tle S1 : similitudes indirectes et isométries non couvertes ; coniques à axes parallèles aux axes du repère.
- Tle L : la limite $\lim\limits_{x \to +\infty} \dfrac{\ln x}{x} = 0$ n'est pas au cours ; elle est « admise » dans l'énoncé du problème de Tle L qui en a besoin.
- Tle S1, coniques : seulement foyer, directrice, excentricité et définition bifocale (pas de tangentes aux coniques).
- 1ère S : le nombre de solutions de $f(x) = m$ lu dans le tableau de variation repose sur une propriété admise.
- Angles et arguments : la réponse attendue est la mesure principale (le correcteur n'accepte pas une mesure « à $2\pi$ près »).

## Exercices complémentaires du collège

- 4e, vecteurs : le niveau 3 (somme de vecteurs en coordonnées, règle du parallélogramme) relève peut-être plutôt de la 3e.
- 4e, applications linéaires : le tarif du taxi (avec prise en charge) cite « application affine » en simple remarque.
- 3e, polygones réguliers inscrits : les corrections utilisent $\cos 30^\circ = \dfrac{\sqrt{3}}{2}$ (supposé connu en 3e).
- Ordres de grandeur utilisés comme données d'énoncé, **non** comme statistiques officielles : fréquentation mensuelle du TER, pluies d'hivernage à Ziguinchor, températures à Tambacounda, règle des 65°–75° pour une échelle, rayon terrestre de 6 370 km.

## Missions Sénégal

- Les données chiffrées des missions (prix, tarifs d'eau, forfaits, pluviométrie, rendements…) sont **fictives** et présentées comme « données de la mission » : elles ne prétendent pas refléter les prix ou statistiques réels.
- 1ère S : une mission rattachée à la S1 (dénombrement, suites), une autre à la S2 (dérivation, optimisation).
