# Obtenir le fichier `.exe` (Windows) — trois façons

L'installateur Windows ne peut pas être fabriqué sur un Mac ou sous Linux
sans outils supplémentaires ; le plus fiable est de le construire sur Windows,
ou de laisser GitHub le faire. Voici les trois voies, de la plus simple à la
plus manuelle.

## 1. Laisser GitHub le construire (aucun logiciel à installer)

Le dépôt contient un automatisme (`.github/workflows/build-desktop.yml`) qui
fabrique les installateurs Windows, macOS et Linux sur les machines de GitHub.

1. Poussez le projet sur GitHub (voir le dépôt).
2. Onglet **Actions** ▸ « Construire les applications de bureau » ▸
   **Run workflow**.
3. À la fin (quelques minutes), ouvrez l'exécution et téléchargez
   **`installateurs-Windows`** dans la section **Artifacts** : vous y trouverez
   le `.exe`.

Astuce : si vous poussez une étiquette de version (`git tag v1.0.0 &&
git push --tags`), une **Release** est créée avec les trois installateurs
attachés, prêts à télécharger.

## 2. Sur un PC Windows, en deux commandes

1. Installez [Node.js](https://nodejs.org) (version LTS).
2. Ouvrez « Invite de commandes » ou « PowerShell » dans le dossier `desktop`
   et lancez :

   ```bat
   npm install
   npm run dist:win
   ```

3. L'installateur `Analyseur ELITE Setup 1.0.0.exe` apparaît dans
   `desktop\dist\`. Une version **portable** (`.exe` sans installation) est
   aussi produite.

## 3. Sans installer (version portable immédiate)

Si vous ne voulez rien construire du tout : le fichier
**`analyseur-plagiat.html`** s'ouvre par double-clic sur n'importe quel
ordinateur, sans installation. C'est la même application, dans un seul fichier.

---

### Pourquoi pas un `.exe` déjà prêt ici ?

Fabriquer un `.exe` Windows depuis un autre système d'exploitation exige
l'outil *Wine*, absent de l'environnement de préparation ; et un installateur
Electron pèse 100 à 200 Mo, au-delà de ce qui peut être transmis directement.
Les méthodes ci-dessus produisent le `.exe` là où c'est prévu — sur Windows,
ou sur les serveurs de GitHub — sans ces limites.
