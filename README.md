# ELITE MATHEMATIQUE

Site vitrine de l'application ELITE MATHEMATIQUE, augmenté d'un **analyseur de
plagiat pour documents Word** et d'un **moteur d'humanisation de texte**.

- Page d'accueil : `index.html`
- Application d'analyse : `plagiat/index.html`

---

## L'analyseur de plagiat

Une application web autonome — HTML, CSS et JavaScript, sans framework ni
dépendance externe — qui lit un document `.docx`, calcule son taux de
similitude, produit un rapport détaillé et propose une réécriture assistée.

### Ce qu'elle fait

| Fonction | Détail |
|---|---|
| Lecture `.docx` | Archive ZIP lue par plages, `word/document.xml` parcouru **en flux** : aucune limite de taille ni de nombre de pages. Corps, titres, listes, tableaux, zones de texte, notes de bas de page et de fin, en-têtes/pieds de page, suivi des modifications, métadonnées. |
| Recherche de sources | Wikipédia (fr/en), Wikisource, Wikilivres, OpenAlex, Crossref, Semantic Scholar, HAL — sans clé. Google Programmable Search, Serper, Brave, Tavily, SearXNG et point d'accès personnalisé — avec votre clé. |
| Corpus local | Comparaison intégrale, **hors ligne**, avec vos propres documents de référence (`.docx`, `.odt`, `.txt`, `.md`). |
| Détection | Deux passes : n-grammes littéraux (n = 8) sur tous les mots, et n-grammes sur mots pleins racinisés (n = 4) pour la paraphrase. Chaînage par diagonale puis vérification par alignement (plus longue sous-séquence commune). |
| Scores | Taux brut, taux net (hors citations et bibliographie), indice d'originalité, répartition copie littérale / copie modifiée / paraphrase, part attribuée à chaque source, répétitions internes. |
| Rapport | Texte annoté, tableau des sources, passages côte à côte, méthodologie et limites. Export **Word (.docx)**, **HTML autonome**, **JSON**, **CSV** et **PDF** (impression). |
| Analyse forensique | Détection des procédés de camouflage : **homoglyphes** (lettres cyrilliques/grecques déguisées), **caractères invisibles**, marques bidi, et **texte dissimulé dans le .docx** (blanc, masqué `w:vanish`, corps minuscule). |
| Indices IA | Régularités stylistiques associées à la génération automatique (rythme, tournures, attaques de phrases, lexique). Indices, jamais preuve — avertissement systématique. |
| Citations | Vérification croisée : références **orphelines** (citées, absentes de la biblio) et entrées **jamais citées**, styles auteur-année et numérique. |
| Comparaison | Confrontation directe de deux documents (copies, versions), avec couverture croisée et passages communs. |
| Empreintes | Signatures partageables d'une source (corrigé, anciennes copies) : vérifier un document contre elles **sans divulguer le texte** de la source. |
| Historique | Analyses conservées localement, réouvrables ; décamoufleur de texte ; réglages de sensibilité (stricte / normale / large). |
| Humanisation | Réécriture déterministe : tournures stéréotypées, périphrases nominales, connecteurs, synonymes contextuels, découpage et fusion de phrases, voix passive, typographie française. Citations, formules, références, URL et code sont préservés. |

### Ce qu'elle ne fait pas

- Elle ne consulte **que les bases activées**. Les archives fermées des
  universités et les bases commerciales lui sont inaccessibles : un taux nul
  ne prouve rien à leur sujet.
- Une similitude n'est pas un plagiat. Citations référencées, définitions
  consacrées et formules mathématiques produisent légitimement des
  correspondances : **chaque passage doit être vérifié à la main**.
- Le rapport est une aide à la relecture, pas une décision institutionnelle.

### Confidentialité

Le document est lu et analysé **dans le navigateur**. Il n'est transmis à
aucun serveur, y compris celui qui héberge le site. Seules de courtes requêtes
de recherche — quelques phrases — partent vers les moteurs activés. Clés d'API,
réglages, cache et historique restent dans le stockage local du navigateur et
le bouton « Effacer toutes mes données » les supprime.

---

## Utilisation

L'application se décline en quatre formes, de la plus légère à la plus intégrée.

### Version hébergée (site web)

L'application utilise des modules ES et des Web Workers : servie en HTTP, elle
exécute l'analyse dans un worker et l'interface reste fluide. Une ouverture
directe en `file://` ne fonctionne pas — c'est à cela que sert la version en
fichier unique ci-dessous.

```bash
npm run serve            # http://localhost:8080/plagiat/
```

En production, tout hébergement statique suffit — GitHub Pages convient tel quel.

### Application installable (PWA)

Servie en HTTPS (GitHub Pages, par exemple), l'application est **installable**
depuis Chrome ou Edge : bouton « ⤓ Installer » ou icône dans la barre
d'adresse. Elle obtient alors son icône, sa fenêtre propre et **fonctionne hors
ligne** — un service worker met en cache l'intégralité de l'application. Les
ressources associées sont générées par :

```bash
npm run assets           # icônes PNG + service worker
```

### Application de bureau (Windows, macOS, Linux)

Le dossier [`desktop/`](desktop/) contient un projet Electron qui produit un
**installateur natif** (`.exe`, `.dmg`, `.AppImage`) :

```bash
cd desktop
npm install              # récupère Electron (~200 Mo, une seule fois)
npm run dist             # installateur pour votre système, dans desktop/dist/
```

Voir [`desktop/README.md`](desktop/README.md). L'application ouvre l'analyseur
dans une fenêtre native, avec un serveur local interne (workers + persistance),
entièrement hors ligne.

### Version en fichier unique

```bash
npm run build            # dist/analyseur-plagiat.html  (~335 Ko)
```

Un seul `.html` contenant l'interface, la feuille de style et la totalité du
code. Il s'ouvre par double-clic, sans serveur, et fonctionne depuis une clé
USB. Deux différences avec la version hébergée : l'analyse s'exécute sur le fil
principal (l'interface peut se figer quelques instants sur un très gros
document), et les réglages ne sont pas conservés d'une ouverture à l'autre
lorsque la page vient d'un fichier local — IndexedDB y est indisponible.

Le regroupement (`tools/build-standalone.mjs`) ne fait qu'assembler : ni
minification, ni transformation de syntaxe. Le code livré reste celui du dépôt,
lisible et vérifiable.

### Tests

```bash
npm test                 # 104 tests : ZIP, DOCX, texte, correspondance,
                         # pipeline, humanisation, forensique, IA,
                         # citations, comparaison, rapport et exports
```

---

## Organisation du code

```
plagiat/
├── index.html                 application (onglets Analyse, Humanisation, Outils, Réglages, Aide)
├── css/app.css                thèmes clair et sombre, impression, responsive
└── js/
    ├── app.js                 contrôleur : état, onglets, câblage
    ├── core/
    │   ├── inflate.js         DEFLATE en JavaScript (repli si DecompressionStream absent)
    │   ├── zip-reader.js      lecture ZIP à accès aléatoire, ZIP64
    │   ├── zip-writer.js      écriture ZIP (export .docx)
    │   ├── docx-reader.js     extraction incrémentale du texte Word
    │   ├── docx-writer.js     génération de documents Word
    │   ├── text.js            tokenisation, phrases, racinisation, empreintes
    │   ├── matcher.js         index de n-grammes, chaînage, alignement
    │   ├── pipeline.js        orchestration complète de l'analyse
    │   ├── providers.js       moteurs de recherche et bases documentaires
    │   ├── net.js             file d'attente, régulation, erreurs typées
    │   ├── store.js           IndexedDB : réglages, cache, corpus, rapports
    │   ├── humanizer.js       réécriture stylistique
    │   ├── forensics.js       détection de camouflage (homoglyphes, texte caché)
    │   ├── ai-detector.js     indices stylistiques de rédaction par IA
    │   ├── citations.js       vérification croisée citations / bibliographie
    │   ├── compare.js         comparaison de documents et empreintes
    │   ├── report.js          rapport HTML, Word, JSON et CSV
    │   ├── runner.js          worker avec repli sur le fil principal
    │   └── errors.js          sérialisation des erreurs
    ├── data/synonyms.js       lexique annoté (catégorie grammaticale, contraintes)
    ├── ui/                    aides DOM, rendu des résultats, intégration PWA
    └── workers/               workers d'analyse et d'humanisation
├── manifest.webmanifest      manifeste d'application installable (PWA)
├── sw.js                     service worker hors ligne (généré)
└── icons/                    icônes de l'application (générées)

desktop/                       application de bureau Electron (win/mac/linux)
docs/relais-cloudflare.js      relais CORS prêt à déployer (recherche + lecture de pages)
tools/serve.mjs                serveur statique de développement
tools/build-standalone.mjs     assemblage de la version en fichier unique
tools/make-icons.mjs           génère les icônes PNG (sans dépendance)
tools/make-sw.mjs              génère le service worker
tests/                         tests Node du cœur applicatif (fixtures générées)
```

Les modules de `core/` ne dépendent d'aucune API du DOM : ils tournent
indifféremment dans un Web Worker, sur le fil principal ou sous Node.

---

## Configurer un moteur web

Sans clé, la couverture se limite aux encyclopédies et bases scientifiques
ouvertes. Pour interroger le Web, ajoutez une clé dans l'onglet **Réglages** :

- **Google Programmable Search** — créez un moteur sur
  `programmablesearchengine.google.com` en cochant « rechercher sur tout le
  Web », relevez son `cx`, puis générez une clé d'API « Custom Search » dans la
  console Google Cloud. 100 requêtes gratuites par jour.
- **Serper.dev** — inscription gratuite, 2 500 requêtes offertes.
- **Tavily** — renvoie le contenu des pages, ce qui améliore nettement la
  détection sans lecteur externe.
- **SearXNG** — votre instance doit autoriser le format JSON et votre domaine.
- **Point d'accès personnalisé** — voir `docs/relais-cloudflare.js`, qui garde
  vos clés côté serveur et sert aussi de lecteur de pages.

Un bouton **Tester** vérifie chaque moteur et affiche la cause exacte d'un
échec (clé refusée, quota dépassé, appel bloqué par la politique d'origine…).

---

## Licence

MIT.
