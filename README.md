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
| Rapport | Texte annoté, tableau des sources, passages côte à côte, méthodologie et limites. Export **Word (.docx)**, **HTML autonome**, **JSON** et **PDF** (impression). |
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

L'application utilise des modules ES et des Web Workers : elle doit être
servie en HTTP. Une ouverture directe en `file://` ne fonctionne pas.

```bash
npm run serve            # http://localhost:8080/plagiat/
```

En production, tout fichier statique suffit — GitHub Pages convient tel quel.

### Tests

```bash
npm test                 # 89 tests : ZIP, DOCX, texte, correspondance,
                         # pipeline, humanisation, rapport et exports
```

---

## Organisation du code

```
plagiat/
├── index.html                 application (onglets Analyse, Humanisation, Réglages, Aide)
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
    │   ├── report.js          rapport HTML, Word et JSON
    │   ├── runner.js          worker avec repli sur le fil principal
    │   └── errors.js          sérialisation des erreurs
    ├── data/synonyms.js       lexique annoté (catégorie grammaticale, contraintes)
    ├── ui/                    aides DOM et rendu des résultats
    └── workers/               workers d'analyse et d'humanisation

docs/relais-cloudflare.js      relais CORS prêt à déployer (recherche + lecture de pages)
tools/serve.mjs                serveur statique de développement
tests/                         tests Node du cœur applicatif
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
