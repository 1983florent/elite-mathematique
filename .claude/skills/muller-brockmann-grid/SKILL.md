---
name: muller-brockmann-grid
description: Kit d'implémentation Müller-Brockmann pour le dépôt elite-mathematique — fichiers concrets prêts à poser dans le projet : tokens grid-system.json, feuille grid.css (variables, grille, rythme vertical, thèmes clair/sombre, trame de contrôle), gabarit template.html et script d'audit verify_grid.py. Utilise ce skill pour tout travail de mise en page ou de style sur ce dépôt (index.html, nouvelles pages), ou dès qu'il faut des livrables concrets plutôt que la seule méthode : variables CSS à copier, page de départ, vérification automatique des valeurs hors grille. Complémentaire du skill muller-brockmann-grid-systems, qui porte la méthode générale et s'applique à tous les projets.
---

# Müller-Brockmann — Kit d'implémentation

Ce skill transpose la méthode de Josef Müller-Brockmann (*Grid Systems in Graphic Design*, 1981)
au web moderne. Objectif : produire des pages **objectives, lisibles et ordonnées**, où chaque
décision (colonne, marge, taille, espace) découle d'un système et non du goût du moment.

> **Deux skills, deux rôles.** `muller-brockmann-grid-systems` (installé au niveau du profil)
> porte la méthode : l'attitude, la séquence de construction, les arbitrages. Le présent skill
> porte l'**outillage** de ce dépôt : des fichiers à copier et un script à lancer. Les deux
> partagent la même base (unité 8px, interlignage 24px, une linéale, composition asymétrique),
> donc ils ne se contredisent pas — en cas de doute sur une valeur, la méthode fait autorité et
> les fichiers d'ici s'y ajustent.

L'idée centrale de Müller-Brockmann : la grille n'est pas un carcan décoratif, c'est un
**instrument de clarté**. Elle rend le rapport entre les éléments vérifiable, donc discutable,
donc améliorable. Quand un designer ne sait pas justifier une valeur, c'est presque toujours
qu'il n'a pas de système.

## Démarche en 6 étapes

Suis cet ordre. Chaque étape fige des valeurs dont dépend la suivante ; sauter une étape
oblige à retoucher au pixel plus tard.

1. **Poser l'unité de base.** Choisir l'interlignage du texte courant (par défaut `16px/24px`).
   Cet interlignage divisé par 3 donne l'unité de base (`8px`). *Tout* espace vertical de la
   page sera un multiple de cette unité — c'est ce qui produit le rythme.
2. **Choisir le nombre de champs (colonnes).** Müller-Brockmann travaillait en 2, 3, 4, 5, 6 ou
   8 champs selon la densité d'information. Sur le web, garder **4 / 8 / 12 colonnes** selon la
   largeur d'écran : une même mise en page se recompose sans changer de logique.
   Détails et critères de choix : `references/grilles.md`.
3. **Fixer marges et gouttières.** La gouttière vaut *un interlignage* (24px) : les colonnes
   voisines partagent la même respiration que les lignes de texte. Les marges latérales
   augmentent avec la largeur d'écran (24 / 48 / 64px).
4. **Dériver l'échelle typographique** de l'unité de base : toutes les hauteurs de ligne sont
   des multiples de 8. Voir `references/typographie.md` pour l'échelle complète, la longueur de
   ligne (mesure) et la hiérarchie.
5. **Composer en asymétrie.** Occuper les champs de façon inégale (par ex. titre sur 4 colonnes,
   texte sur 6, une colonne laissée vide). Le vide est un élément actif, pas un reste.
   Voir `references/composition-couleur.md`.
6. **Vérifier.** Activer la trame de contrôle (`data-mb-debug` sur `<body>`) et lancer
   `scripts/verify_grid.py` sur le CSS produit. Toute valeur hors grille est soit corrigée,
   soit justifiée explicitement.

## Ressources livrées

| Fichier | Rôle | Quand le lire / l'utiliser |
| --- | --- | --- |
| `grid-system.json` | Tokens du système (unité, grilles, échelle typo, couleurs, espacements) | Source de vérité des valeurs ; à traduire en variables CSS, config Tailwind ou thème JS |
| `assets/grid.css` | Feuille prête à l'emploi : variables, grille CSS, rythme vertical, thème clair/sombre, trame de contrôle | À copier dans le projet et importer en premier |
| `assets/template.html` | Page de départ complète appliquant le système | Point de départ d'un nouveau site ; à lire pour voir le système en situation |
| `references/grilles.md` | Choix du nombre de champs, marges, champs modulaires, exemples de dispositions | Étapes 2–3, ou dès qu'une mise en page résiste |
| `references/typographie.md` | Échelle, interlignages, mesure, hiérarchie, réglages fins | Étape 4, ou pour tout arbitrage de taille de texte |
| `references/composition-couleur.md` | Asymétrie, images cadrées sur la grille, palette restreinte, filets | Étape 5 |
| `scripts/verify_grid.py` | Audite un fichier CSS/HTML et signale les valeurs hors grille | Étape 6, avant de livrer |

## Règles qui font la différence

Ces points sont ceux qu'on perd en premier quand on improvise, et ceux qui distinguent
visuellement une page « suisse » d'une page ordinaire.

- **Aucun nombre magique.** Chaque marge, padding, hauteur de ligne s'exprime en multiples de
  l'unité de base, via les variables `--mb-space-*`. Une valeur comme `13px` ou `1.35` signale
  qu'une décision a été prise hors système.
- **Aligner par le bord gauche.** Texte ferré à gauche, drapeau à droite. Le texte justifié
  crée des lézardes irrégulières que la grille ne peut pas rattraper ; le texte centré casse
  l'axe de lecture. Le centrage se réserve à un élément isolé et volontaire.
- **Hiérarchie par la position et le poids, pas par l'ornement.** Deux graisses (regular, bold)
  et trois à quatre tailles suffisent. Pas d'ombre portée, pas de dégradé décoratif, pas de
  coins très arrondis : ce qui n'informe pas encombre.
- **Une seule couleur d'accent.** Noir, blancs et gris portent la structure ; le rouge (ou une
  autre teinte unique) ne sert qu'à signaler — un lien, un état, un repère. Dès qu'une deuxième
  couleur d'accent apparaît, aucune des deux ne signale plus rien.
- **Images cadrées sur les champs.** Une image occupe un nombre entier de colonnes et une
  hauteur multiple de l'unité ; elle se recadre (`object-fit: cover`) plutôt que de déformer la
  grille.
- **La grille se rompt consciemment.** Un élément peut déborder pour créer un accent — mais
  parce qu'on l'a décidé, et une seule fois par page. Une rupture répétée n'est plus un accent,
  c'est du désordre.

## Adapter à un projet existant

Quand une page existe déjà (comme `index.html` d'un site en cours), ne pas repartir de zéro :

1. Importer `assets/grid.css` et retirer les valeurs en dur qu'il remplace.
2. Remplacer les conteneurs à `max-width` arbitraire par `.mb-page` + `.mb-grid`.
3. Convertir les espacements existants au multiple de 8 le plus proche, puis relire la page —
   les écarts corrigés se voient immédiatement.
4. Réduire la palette : garder une seule couleur d'accent, passer le reste en gris neutres.
5. Lancer `scripts/verify_grid.py` et traiter les signalements restants.

## Intégration selon la pile technique

- **HTML/CSS simple** : copier `assets/grid.css`, partir de `assets/template.html`.
- **Tailwind** : reporter `grid-system.json` dans `theme.extend` (`spacing` en multiples de 8,
  `fontSize` avec les couples taille/interlignage, `colors` réduits à la palette du fichier).
  Éviter les classes arbitraires `[13px]` qui contournent le système.
- **React / composants** : exposer les tokens en variables CSS sur `:root` et n'utiliser que
  `var(--mb-*)` dans les styles ; garder la grille dans un composant `Page`/`Grid` unique.
- **Artifact HTML autonome** : inliner `grid.css` dans une balise `<style>` ; le fichier gère
  déjà les thèmes clair et sombre selon les conventions attendues.
