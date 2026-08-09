# Typographie

Dans le Style typographique international, la typographie *est* le design : elle porte la
hiérarchie, la structure et le ton. Tout ce qui n'est pas typographie ou image est en principe
superflu.

## Le choix de la police

Une linéale neutre — Helvetica, Neue Haas Grotesk, Univers, Akzidenz-Grotesk, ou Inter côté web.
La police ne commente pas le texte : elle le rend lisible. Une police à caractère marqué
(script, serif à fort contraste, display) ajoute un propos que la grille ne peut pas ordonner.

Une seule famille suffit pour un site entier. Si une seconde est nécessaire, la réserver à un
usage fonctionnel distinct (monospace pour du code ou des chiffres alignés), jamais à un
« contraste esthétique ».

**Deux graisses : 400 et 700.** Les graisses intermédiaires (500, 600) créent des différences
que l'œil perçoit sans pouvoir les hiérarchiser — le lecteur voit qu'il y a une distinction,
mais pas laquelle. C'est le contraire du but recherché.

## L'échelle

Chaque hauteur de ligne est un multiple de 8 : c'est ce qui garantit que le texte retombe sur
la trame quelle que soit la taille employée.

| Rôle | Taille | Interligne | Usage |
| --- | --- | --- | --- |
| `mb-display` | 72px | 80px | Titre d'accueil unique, rarement plus d'une fois par site |
| `h1` | 48px | 56px | Titre de page |
| `h2` | 32px | 40px | Titre de section |
| `h3` | 24px | 32px | Sous-section |
| `mb-lede` | 20px | 32px | Chapeau introductif, une seule fois par page |
| corps | 16px | 24px | Texte courant — le point de départ de tout le système |
| `mb-small` | 14px | 24px | Notes, mentions secondaires |
| `mb-caption` | 12px | 16px | Légende d'image, métadonnée |
| `mb-label` | 12px | 16px | Étiquette de champ en capitales espacées |

Sur mobile, réduire uniquement les deux tailles les plus grandes (`display` et `h1`) ; le corps
de texte reste à 16px, en dessous la lecture se dégrade et les navigateurs mobiles zooment
d'eux-mêmes sur les champs de formulaire.

```css
@media (max-width: 40em) {
  :root {
    --mb-size-display: 2.5rem; --mb-lh-display: 3rem;   /* 40 / 48 */
    --mb-size-h1: 2rem;        --mb-lh-h1: 2.5rem;      /* 32 / 40 */
  }
}
```

## La mesure (longueur de ligne)

45 à 75 caractères par ligne, idéalement 66 (`--mb-measure`). Au-delà, l'œil perd la ligne
suivante au retour ; en deçà, le rythme de lecture se hache.

Sur une grille de 12 champs à 1440px, un bloc de 6 champs approche naturellement cette mesure —
c'est une raison de plus de ne pas étendre le texte sur toute la largeur. Applique `.mb-measure`
à tout paragraphe long, même quand la colonne est déjà étroite : c'est une sécurité qui ne coûte
rien.

## Hiérarchie sans ornement

Trois leviers, dans cet ordre de préférence :

1. **La position.** Un titre isolé en tête de colonne, ou décalé sur un autre axe, est déjà
   hiérarchisé sans changer de taille.
2. **L'espace.** Beaucoup de blanc avant un titre, peu après : le blanc rattache le titre au
   texte qu'il annonce. C'est ce que fait `.mb-flow` — 48px avant un `h2`, 16px après.
3. **La taille et la graisse.** En dernier, et par sauts nets. Deux niveaux dont les tailles
   sont proches (18 et 20px) se lisent comme une erreur, pas comme une hiérarchie.

Ce qu'il faut éviter : souligner pour insister (l'italique ou le gras le fait mieux, et le
souligné appartient aux liens), mettre en majuscules un texte long (la forme des mots disparaît,
la lecture ralentit), colorer un titre pour le distinguer (la couleur d'accent doit rester
réservée au signal).

## Réglages fins

- **Interlettrage négatif sur les grandes tailles.** Une police dessinée pour le corps de texte
  paraît trop espacée à 48px : `letter-spacing: -0.02em` compense. À l'inverse, le petit texte en
  capitales a besoin d'espacement positif (`0.08em`).
- **Chiffres tabulaires** pour toute colonne de nombres : `font-variant-numeric: tabular-nums`.
  Sans cela, les chiffres de largeurs différentes désalignent les colonnes.
- **`text-wrap: balance`** sur les titres courts : répartit les mots entre les lignes au lieu de
  laisser un mot orphelin.
- **Césure** sur les colonnes étroites : `hyphens: auto` avec `lang="fr"` correctement déclaré,
  faute de quoi la césure appliquera les règles de l'anglais.
