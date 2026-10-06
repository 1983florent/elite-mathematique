# Contribuer à ELITE MATHÉMATIQUE

Ce guide explique comment ajouter ou corriger un chapitre, une carte de révision ou un générateur d'exercices.
Aucune compilation n'est nécessaire : ce sont des fichiers JavaScript simples, chargés par `index.html`.

## Organisation des fichiers

| Fichier | Rôle |
|---|---|
| `js/data/programme.js` | Ossature du programme sénégalais : classes, chapitres (identifiants), prérequis |
| `js/data/contenu-*.js` | Contenu de chaque chapitre : objectifs, cours, méthodes, exemple, cartes, problème « au Sénégal » |
| `js/gen/*.js` | Générateurs d'exercices (énoncés aléatoires + correction détaillée + vérification automatique) |
| `js/lib/core.js` | Hasard reproductible (`EM.RNG`), fractions (`EM.Frac`, `EM.F`), écriture TeX (`EM.T`), registre `EM.gen` |
| `js/lib/parser.js` | Lecture des réponses des élèves et vérification (`EM.check`) |
| `js/lib/figures.js` | Figures SVG (`EM.fig`) |
| `tests/run.js` | Banc de tests : `node tests/run.js` |

## Écrire les mathématiques

Le texte est du HTML ; les formules sont en TeX entre `$…$` (dans la ligne) ou `$$…$$` (centrées), rendues par KaTeX.
Raccourcis disponibles : `\R`, `\N`, `\Z`, `\Q`, `\C`, `\D`, `\vect{AB}` (vecteur), `\Card`.
Ne jamais utiliser le symbole `$` pour une monnaie : on écrit « F CFA ».

## Contenu d'un chapitre

```js
EM.contenu['3e-thales'] = {
  resume: 'Une phrase qui présente le chapitre.',
  objectifs: ['Calculer une longueur avec le théorème de Thalès', '…'],
  cours: [
    { type: 'definition', titre: '…', texte: 'HTML + $TeX$' },
    { type: 'theoreme',   titre: 'Théorème de Thalès', texte: '…' },
    { type: 'propriete',  titre: '…', texte: '…' },
    { type: 'formule',    titre: '…', texte: '…' },
    { type: 'remarque',   titre: '…', texte: '…' }
  ],
  methodes: [{ titre: 'Comment calculer une longueur', etapes: ['…', '…'] }],
  exemple: { enonce: '…', solution: ['étape 1', 'étape 2'] },
  erreurs: ['Piège fréquent : …'],
  flashcards: [{ q: 'Question courte', r: 'Réponse courte' }],
  contexte: { titre: 'Au port de pêche de Kayar', enonce: '…', solution: ['…'] },
  histoire: 'Anecdote historique vérifiable (facultatif).'
};
```

## Générateur d'exercices

```js
EM.gen.register({
  id: 'thales-longueur',            // unique
  titre: 'Calculer une longueur avec le théorème de Thalès',
  chapitres: ['3e-thales'],         // identifiants de js/data/programme.js
  niveaux: 2,                       // 1 = application directe … 3 = approfondissement
  examen: true,                     // peut figurer dans un sujet d'examen blanc
  gen: function (rng, niveau) {
    return {
      enonce: '…',
      figure: EM.fig.fit(points).poly(points).svg(),   // facultatif
      questions: [{ label: '$MN =$', type: 'number', reponse: 4.5, unite: 'cm' }],
      indices: ['aide 1', 'aide 2'],
      solution: ['étape 1', 'étape 2'],
      aide: 'Consigne de saisie facultative'
    };
  }
});
```

Types de questions :

| type | `reponse` | L'élève écrit |
|---|---|---|
| `number` | nombre, `EM.F(3, 4)` ou chaîne `'2*sqrt(3)'` ; `tol` pour une valeur arrondie | `0,75`, `3/4`, `2√3`, `π/2` |
| `set` | tableau de nombres (vide = ∅) | `-3 ; 2`, `∅` |
| `tuple` | tableau ordonné (coordonnées, couple solution) | `(1 ; -2)` |
| `expr` | expression en `x` (`variable`, `domaine` facultatifs) | `6x - 2`, `2(3x-1)` |
| `choice` | indice dans `choix` | un clic |
| `text` | liste de réponses acceptées | `croissante` |
| `interval` | `{ a, b, ouvA, ouvB }` | `]-∞ ; 3]` |

`reponseTex` (facultatif) fixe l'écriture de la réponse dans la correction.

Outils utiles : `rng.int(a, b)`, `rng.nz(a, b)` (non nul), `rng.pick(tab)`, `rng.shuffle(tab)`, `rng.dec(a, b, d)` ;
`EM.T.num(x)` (écriture française), `EM.T.poly([a, b, c])`, `EM.T.mono(c, 'x', premier)`, `EM.T.signed(x)`,
`EM.T.par(x)` (parenthèses si négatif), `EM.T.sqrt(n)`, `EM.T.set(tab)`, `EM.T.interval(a, b, ouvA, ouvB)`, `EM.T.fcfa(x)` ;
`EM.ar.gcd`, `EM.ar.lcm`, `EM.ar.primeFactors`, `EM.ar.sqrtSimplify` ; `EM.fig.fit(points)` puis `.poly`, `.seg`, `.point`,
`.segLabel`, `.rightAngle`, `.angle`, `.circle`, `.vector`, `.axes`, `.curve`, `.rect`, `.svg()`.

## Vérifier

```sh
node tests/run.js                # tout
node tests/run.js --only 3e      # un niveau
node tests/run.js --seeds 300    # plus de tirages
node tests/run.js --strict       # tout chapitre doit avoir son contenu
```

Le banc de tests produit des centaines d'exercices par générateur et vérifie que les formules s'affichent,
que la réponse attendue est bien acceptée et qu'aucune écriture comme `+ -3`, `NaN` ou `undefined` n'apparaît.
