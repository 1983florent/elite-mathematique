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
d'installer les mises à jour par-dessus l'ancienne version. Pour le Play Store, il faut :

1. créer une clé de publication **privée** (à ne jamais publier) :
   `keytool -genkeypair -keystore publication.jks -alias elite -keyalg RSA -keysize 2048 -validity 10000` ;
2. compiler un *Android App Bundle* signé : Android Studio → *Build → Generate Signed Bundle / APK* ;
3. déposer le fichier `.aab` dans la Google Play Console.

## Fonctions propres à Android

- Bouton retour du téléphone : revient à la page précédente du logiciel.
- Liens WhatsApp et e-mail : ouverts dans les applications correspondantes.
- Fiches enseignant : impression ou enregistrement en PDF (A4).
- Progression : export par le menu de partage, import par le sélecteur de fichiers.
