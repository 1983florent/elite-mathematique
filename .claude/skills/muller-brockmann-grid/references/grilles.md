# Choisir et exploiter la grille

## Combien de champs ?

Müller-Brockmann choisissait le nombre de champs d'après la **quantité et la nature de
l'information**, pas d'après la taille du support. Le principe se transpose tel quel :

| Champs | Convient à | Risque |
| --- | --- | --- |
| 2 | Texte long, essai, page « une idée » | Rigide dès qu'il y a des images de tailles variées |
| 3 | Article avec notes latérales, blog | Peu de variantes de disposition |
| 4 | Base mobile universelle ; page de contenu simple | Insuffisant pour un tableau de bord |
| 6 | Site vitrine, portfolio, page produit | — |
| 8 | Base tablette ; catalogues | Demande de la discipline |
| 12 | Base desktop par défaut : divisible par 2, 3, 4, 6 | Invite à trop de variations si on ne se limite pas |

**Défaut recommandé pour le web : 4 / 8 / 12.** Ces trois valeurs partagent les mêmes diviseurs
utiles, donc une disposition « moitié / tiers / quart » reste exprimable à chaque largeur.
C'est ce que fait `assets/grid.css`.

Le piège classique n'est pas de choisir 12 colonnes, c'est de les utiliser toutes différemment
sur chaque section. Fixe **deux ou trois dispositions** pour tout le site (par exemple : pleine
largeur, 8 colonnes décalées de 2, deux blocs de 6) et réutilise-les. La répétition est ce qui
rend la grille perceptible ; sans répétition, elle n'existe que dans le code.

## Marges et gouttières

- **Gouttière = un interlignage** (24px). Les colonnes respirent comme les lignes de texte, et
  l'œil retrouve la même mesure horizontalement et verticalement. Sous 640px elle tombe à 16px
  (deux unités) : à cette largeur, une gouttière de 24px mangerait la colonne elle-même.
- **Marges latérales croissantes** : 24px (mobile), 48px (tablette), 72px (desktop). La marge
  n'est pas de l'espace perdu : elle isole le bloc de texte du bord de l'écran, comme le blanc
  tournant isole la justification d'une page imprimée.
- **Largeur maximale 1440px.** Au-delà, les lignes s'allongent et la lecture se dégrade ; mieux
  vaut laisser croître la marge que la colonne.

## Champs modulaires (Rasterfelder)

La grille de Müller-Brockmann est un damier, pas seulement des colonnes : elle découpe aussi
la hauteur en **champs** séparés par une gouttière horizontale. Sur le web, cela se traduit par
une hauteur de module — ici 48px, soit 6 lignes de base — dont les blocs et images sont des
multiples.

En pratique : plutôt que de laisser une image prendre la hauteur qu'elle veut, on lui donne un
rapport (`aspect-ratio`) ou une hauteur multiple du module, et on recadre avec
`object-fit: cover`. L'image s'adapte à la grille, jamais l'inverse.

## Dispositions de référence

Ces trois dispositions couvrent la majorité des besoins d'un site vitrine. Les valeurs
`--span-l` / `--start-l` s'écrivent en style inline sur les enfants de `.mb-grid`.

**1. Titre décalé, texte en second champ** — la disposition la plus caractéristique du style
suisse. Le décalage crée une tension que le centrage détruirait.

```html
<div class="mb-grid">
  <h2 style="--span-l:4">Fonctionnalités</h2>
  <div class="mb-flow mb-measure" style="--span-l:6; --start-l:6">
    <p>…</p>
  </div>
</div>
```

**2. Deux blocs égaux** — comparaison, alternance texte/image.

```html
<div class="mb-grid">
  <div style="--span-m:4; --span-l:6">…</div>
  <div style="--span-m:4; --span-l:6">…</div>
</div>
```

**3. Série de trois ou quatre** — cartes, chiffres clés, étapes. Sur mobile, chaque élément
prend les 4 champs disponibles et s'empile ; aucune règle supplémentaire n'est nécessaire.

```html
<div class="mb-grid">
  <div style="--span-s:4; --span-m:4; --span-l:4">…</div>
  <div style="--span-s:4; --span-m:4; --span-l:4">…</div>
  <div style="--span-s:4; --span-m:4; --span-l:4">…</div>
</div>
```

## Vérifier la grille

Ajoute `data-mb-debug` sur `<body>` : la trame des lignes de base et les colonnes s'affichent en
surimpression. Trois questions à se poser en la regardant :

1. Les débuts de bloc tombent-ils sur une ligne de base ? Sinon, un espacement n'est pas un
   multiple de 8.
2. Les bords gauches s'alignent-ils sur peu d'axes distincts ? Beaucoup d'axes différents =
   dispositions non réutilisées.
3. Le vide est-il réparti ou bien concentré là où il crée un contraste ? Un blanc uniforme
   partout est aussi inexpressif qu'une page saturée.
