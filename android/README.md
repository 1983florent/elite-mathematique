# ELITE MATHÉMATIQUE pour Android

L'application Android embarque tout le logiciel web (cours, exercices, examens, labo) : elle fonctionne **sans connexion**
et ne demande **aucune permission**. Android 5.0 ou plus.

## Obtenir l'APK

- **Automatiquement** : à chaque mise à jour du dépôt, GitHub Actions lance le banc de tests puis compile l'APK
  (workflow « Application Android »). L'APK se télécharge dans l'onglet *Actions* → dernière exécution → *Artifacts*
  → `elite-mathematique-apk`. Sur la branche principale (`main`), il est aussi publié dans la release « Application Android » :
  https://github.com/1983florent/elite-mathematique/releases/download/android/elite-mathematique.apk
- **Sur un ordinateur** : ouvrir le dossier `android/` dans Android Studio, puis *Build → Build APK(s)*,
  ou en ligne de commande : `cd android && ./gradlew assembleDebug`
  (l'APK est dans `app/build/outputs/apk/debug/`).

À chaque compilation, le logiciel web (`index.html`, `css/`, `js/`, `vendor/`, `icons/`) est recopié dans l'application :
il n'y a qu'une seule version du code à maintenir.

## Installer sur un téléphone

Envoyer le fichier `.apk` sur le téléphone (WhatsApp, câble, Bluetooth…), l'ouvrir, puis autoriser l'installation
d'applications de « sources inconnues » si Android le demande.

## Publier sur le Play Store

L'APK automatique est signé avec une clé de débogage commune (`app/debug.keystore`, non secrète), ce qui permet
d'installer les mises à jour par-dessus l'ancienne version. Pour le Play Store, GitHub Actions produit aussi un
**App Bundle** (`.aab`) signé avec la clé d'envoi privée, fournie par les secrets du dépôt.
Toutes les étapes (compte, secrets, fiche, tests, publication) : [docs/PLAY-STORE.md](../docs/PLAY-STORE.md).

## Fonctions propres à Android

- Bouton ou geste « retour » : revient à la page précédente du logiciel (retour prédictif d'Android 13 et plus).
- Affichage bord à bord (Android 15 et plus) : le contenu s'écarte des barres système et du clavier.
- Liens WhatsApp et e-mail : ouverts dans les applications correspondantes.
- Fiches enseignant : impression ou enregistrement en PDF (A4).
- Progression : export par le menu de partage, import par le sélecteur de fichiers.
