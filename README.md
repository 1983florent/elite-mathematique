# ELITE MATHÉMATIQUE

**Le programme sénégalais de mathématiques, du CM2 à la Terminale, transformé en logiciel interactif.**
Gratuit, utilisable sur téléphone, et fonctionnant **sans connexion internet** une fois ouvert.

## Ce que contient le logiciel

| Rubrique | Contenu |
|---|---|
| 📚 **Programme** | CM2 (CFEE), 6e, 5e, 4e, 3e (BFEM), 2nde S et L, 1ère S1, S2 et L, Terminales S1, S2 et L (BAC). Pour chaque chapitre : objectifs, cours (définitions, théorèmes, formules), méthodes pas à pas, exemple corrigé, pièges fréquents, problème tiré de la vie au Sénégal, anecdote historique. |
| ♾️ **Exercices à l'infini** | Des générateurs créent des exercices toujours nouveaux, sur 3 niveaux, avec indices progressifs, vérification automatique de la réponse et correction détaillée. |
| 🔗 **Code d'exercice** | Chaque exercice a un code : le même code redonne exactement le même exercice, ce qui permet de le partager entre élèves et professeurs. |
| ☀️ **Défi du jour** | Le même exercice pour tous les élèves d'une classe, le même jour, à partager sur WhatsApp. |
| 🩺 **Diagnostic** | Un test rapide repère les chapitres fragiles et propose un parcours de remédiation ; le « test des prérequis » remonte aux classes précédentes. |
| 📝 **Examens blancs** | CFEE, BFEM (activités numériques et géométriques), BAC S1, S2 et L (exercices et problème), devoirs surveillés : chronométrés, notés sur 20 avec mention, corrigés. Un code de sujet permet à toute une classe de composer sur le même sujet. |
| 🗂️ **Révision espacée** | Cartes de définitions et de formules, présentées selon la méthode des boîtes de Leitner. |
| 🧪 **Laboratoire** | Grapheur (zéros, extremums, intersections, dérivée, tableau de valeurs), calculatrice exacte, second degré pas à pas, systèmes par pivot de Gauss, arithmétique (Euclide, Bézout), statistiques (une et deux variables), probabilités (loi binomiale), nombres complexes, cercle trigonométrique, conversions d'unités. |
| 👩🏾‍🏫 **Espace enseignant** | Fiches d'exercices imprimables avec corrigé, et leur version interactive pour les élèves (lien à partager). |
| 🏆 **Progrès** | Maîtrise par chapitre, carte de maîtrise de tout le programme, points, rangs, badges, série de jours, historique des examens, export et import de la progression. |

## Utilisation

- **En ligne** : publier le dossier sur n'importe quel hébergement statique (par exemple GitHub Pages) et ouvrir `index.html`.
- **Sur Android** : ouvrir le site dans Chrome, puis menu ⋮ → « Installer l'application ». Elle fonctionne ensuite hors connexion.
- **Sans internet du tout** : copier le dossier (clé USB, carte mémoire, partage de fichiers) et ouvrir `index.html` dans un navigateur.

Aucune installation, aucun compte, aucune donnée envoyée : la progression reste sur l'appareil.

## Organisation du code

```
index.html              page unique de l'application
css/style.css           styles (thème clair et sombre, impression des fiches)
js/lib/                 moteur : hasard reproductible, fractions, analyseur d'expressions, figures SVG
js/data/programme.js    ossature du programme sénégalais (classes, chapitres, prérequis)
js/data/contenu-*.js    cours, méthodes, exemples, cartes, problèmes « au Sénégal »
js/gen/*.js             générateurs d'exercices
js/views/, js/tools/    pages de l'application et outils du laboratoire
vendor/katex/           affichage des formules (KaTeX, licence MIT), intégré pour le hors ligne
sw.js                   mise en cache pour l'usage hors connexion
tests/run.js            banc de tests
```

## Tests

```sh
node tests/run.js              # vérifie tous les générateurs, le contenu et la cohérence des fichiers
node tests/run.js --seeds 300  # plus de tirages par générateur
```

Le banc de tests produit des milliers d'exercices et vérifie que chaque formule s'affiche, que la réponse attendue
est acceptée par le correcteur et qu'aucune écriture fautive (`+ -3`, `NaN`…) n'apparaît.

## Contribuer

Professeurs et contributeurs peuvent ajouter des chapitres, des cartes ou des générateurs : voir [docs/CONTRIBUER.md](docs/CONTRIBUER.md).

## Contact et soutien

Wave / Orange Money : (+221) 70 601 31 69 · maths.florent@gmail.com
