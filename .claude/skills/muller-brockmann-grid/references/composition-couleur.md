# Composition, images et couleur

## L'asymétrie comme méthode

Le centrage était la mise en page par défaut de la typographie classique ; le Style suisse l'a
abandonné parce qu'il place tous les éléments sur un seul axe et rend donc toutes les relations
identiques. L'asymétrie, elle, oblige à décider : cet élément est-il plus important que celui-ci ?
La grille fournit ensuite les positions possibles, ce qui empêche l'arbitraire.

En pratique, dans une section :

- Ne pas occuper tous les champs. Une section où le texte s'arrête au champ 8 sur 12, laissant
  4 champs vides à droite, est plus tendue et plus lisible qu'un bloc pleine largeur.
- Faire varier le point de départ d'une section à l'autre, mais entre **peu d'axes** : par
  exemple le champ 1 et le champ 6, jamais 1, 3, 4, 7 au hasard.
- Le vide n'est pas ce qui reste : c'est la contrepartie de la densité. Une page qui n'a de
  blanc nulle part n'a pas de hiérarchie ; une page uniformément aérée non plus.

## Images

Trois règles suffisent :

1. **Largeur = nombre entier de champs.** Une image qui déborde d'un demi-champ détruit
   visuellement la grille que tout le reste s'efforce d'établir.
2. **Hauteur = multiple du module** (48px), ou un rapport fixe (`aspect-ratio`). Utiliser
   `object-fit: cover` : recadrer plutôt que déformer, et surtout plutôt que laisser l'image
   dicter la hauteur du bloc.
3. **Traitement uniforme.** Si une image est en noir et blanc, toutes le sont. Si l'une porte
   un filet, toutes en portent un. Un traitement hétérogène se lit comme un défaut.

La légende va sous l'image, en `mb-caption`, calée sur le même bord gauche. C'est un des rares
endroits où le petit texte gris est justifié : il indique un rang inférieur dans la hiérarchie.

## Couleur

**Noir, blanc, gris + une seule couleur d'accent.** Cette contrainte n'est pas un appauvrissement :
elle donne à l'accent un pouvoir de signalement absolu. Dès qu'une deuxième couleur d'accent
apparaît, le lecteur ne sait plus laquelle regarder en premier, et les deux perdent leur fonction.

Le rouge (`#e30613`) est le choix historique, mais n'importe quelle teinte saturée fonctionne du
moment qu'elle reste unique. Réserver l'accent à :

- les liens et les éléments interactifs au survol,
- un état (erreur, sélection, élément actif),
- un repère de lecture rare et volontaire (un chiffre, un mot dans un titre).

Ne **pas** l'utiliser pour : colorer un fond de section, distinguer des titres, égayer une carte.

Les gris portent tout le reste. Trois niveaux d'encre suffisent : `--mb-ink` (texte principal),
`--mb-ink-muted` (secondaire), `--mb-ink-faint` (tertiaire, à employer rarement). Un quatrième
niveau ne se distinguerait plus des autres.

### Contraste

Vérifier les rapports de contraste : 4,5:1 minimum pour le corps de texte, 3:1 pour les grandes
tailles et les bordures d'éléments interactifs. `--mb-ink-faint` sur `--mb-paper` ne passe pas
le seuil pour du corps de texte — le réserver aux éléments décoratifs ou aux très grandes tailles.

La palette du système est déclinée en thème clair et sombre dans `assets/grid.css` : le clair est
défini sur `:root` nu, le sombre uniquement en surcharge des jetons de couleur. Aucune couleur ne
doit être définie *uniquement* à l'intérieur d'un bloc `@media` ou `[data-theme]`, sinon elle
disparaît dans l'autre thème.

## Filets et surfaces

Le filet (`border-top: 1px`) est l'outil de séparation par défaut du style suisse : il structure
sans créer de boîte. Une épaisseur unique sur toute la page ; un filet de 2px en noir pour marquer
une rupture majeure.

Éviter les cartes à ombre portée et coins arrondis : elles détachent l'élément du plan de la page
et le désolidarisent des champs de la grille. Si un bloc doit se distinguer du fond, employer
`--mb-surface` (un gris très clair) avec des angles vifs — ou simplement un filet et du blanc.

## Mouvement

Le mouvement sert à rendre compréhensible un **changement d'état** : une transition de 120 à
200ms sur une couleur au survol, une apparition de panneau. Pas d'animation d'entrée au défilement,
pas de parallaxe : elles retardent la lecture pour ne rien communiquer, et contredisent
l'objectivité que la grille cherche à établir.
