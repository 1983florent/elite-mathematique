# Application de bureau — Analyseur ELITE MATHEMATIQUE

Version installable sur ordinateur (Windows, macOS, Linux). L'application
ouvre l'analyseur dans une fenêtre native ; tout le traitement reste local et
fonctionne **hors ligne**. Sous le capot, un petit serveur sur la boucle locale
(`127.0.0.1`) sert l'application, ce qui active les Web Workers et la
persistance des réglages — l'expérience complète de la version hébergée, mais
en logiciel installé.

## Construire l'installateur

Il faut [Node.js](https://nodejs.org) 18 ou plus. Ensuite, depuis ce dossier :

```bash
npm install          # récupère Electron (~200 Mo, une seule fois)
npm run dist         # produit l'installateur pour VOTRE système
```

L'installateur apparaît dans `desktop/dist/` :

| Système | Fichier produit | Installation |
|---|---|---|
| **Windows** | `Analyseur ELITE Setup 1.0.0.exe` | double-clic ; installe l'app, raccourcis Bureau et menu Démarrer. Une version *portable* `.exe` est aussi produite (aucune installation). |
| **macOS** | `Analyseur ELITE MATHEMATIQUE-1.0.0.dmg` | ouvrir le `.dmg`, glisser l'app dans Applications. |
| **Linux** | `.AppImage` (exécutable autonome) et `.deb` | rendre l'`.AppImage` exécutable et le lancer, ou installer le `.deb`. |

Chaque système produit son propre format ; pour fabriquer l'installateur
Windows depuis macOS/Linux (ou l'inverse), voir la documentation
d'[electron-builder](https://www.electron.build/multi-platform-build). Le plus
simple reste de lancer `npm run dist` sur une machine du système visé.

Cibles explicites, au besoin :

```bash
npm run dist:win     # Windows (.exe NSIS + portable)
npm run dist:mac     # macOS (.dmg)
npm run dist:linux   # Linux (.AppImage + .deb)
```

## Essayer sans construire l'installateur

```bash
npm install
npm start            # lance l'application directement
```

## Comment c'est fait

```
desktop/
├── main.js        processus principal Electron : fenêtre, menu, cycle de vie
├── server.js      serveur statique local (127.0.0.1) servant plagiat/
├── preload.js     isolation du contexte (surface d'exposition nulle)
├── package.json   dépendances + configuration electron-builder
└── build/         icônes de l'application (générées par tools/make-icons.mjs)
```

Le code de l'analyseur lui-même n'est pas dupliqué : au moment de
l'empaquetage, le dossier `plagiat/` du dépôt et `logo.png` sont copiés dans les
ressources de l'application (`extraResources`). Pour mettre à jour l'app,
régénérez si besoin les icônes et le service worker à la racine du dépôt
(`node tools/make-icons.mjs && node tools/make-sw.mjs`), puis reconstruisez.

## Sécurité

`contextIsolation` activé, `nodeIntegration` désactivé, `sandbox` activé : la
page n'a aucun accès à Node ni au système de fichiers. Le serveur local
n'écoute que sur `127.0.0.1` et ne sert que le dossier de l'application. Les
liens externes (moteurs de recherche, documentation) s'ouvrent dans le
navigateur par défaut, jamais dans la fenêtre.
