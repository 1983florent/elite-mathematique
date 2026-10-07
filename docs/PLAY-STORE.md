# Publier ELITE MATHÉMATIQUE sur le Google Play Store

Ce guide suit l'ordre de la Play Console. Ce qui est déjà prêt dans le dépôt :

- l'application cible **Android 16 (API 36)**, niveau exigé depuis le 31 août 2026 ;
- GitHub Actions produit l'**App Bundle** (`.aab`, format obligatoire du Play Store), signé avec la clé d'envoi ;
- le numéro de version augmente tout seul à chaque compilation (exigé pour chaque nouvel envoi) ;
- la **politique de confidentialité** (`confidentialite.html`), intégrée à l'appli et publiée avec le site ;
- les **textes et visuels** de la fiche : dossier [`play-store/`](../play-store/fiche.md).

Identifiant de l'application (définitif une fois publié) : `sn.elitemathematique.app`.

---

## 1. Créer le compte développeur

1. Aller sur https://play.google.com/console et s'inscrire avec un compte Google (frais uniques de 25 $).
2. Choisir **compte personnel** (ou **organisation** si une structure existe, avec un numéro D-U-N-S).
3. Faire vérifier son identité (pièce d'identité, téléphone) : cela peut prendre quelques jours.

> **Important pour un compte personnel créé après le 13 novembre 2023** : avant de pouvoir publier pour tout le monde,
> Google exige un **test fermé avec au moins 12 testeurs** inscrits **pendant 14 jours d'affilée** (étape 6).
> Les comptes d'organisation en sont dispensés.

## 2. Mettre la clé d'envoi dans GitHub

La clé d'envoi signe chaque App Bundle. Elle n'est **jamais** enregistrée dans le dépôt : GitHub la garde dans des secrets.

Dans GitHub : dépôt `elite-mathematique` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**,
puis créer ces quatre secrets (les valeurs sont dans le document `SECRETS-GITHUB.txt` remis avec la clé) :

| Nom du secret | Valeur |
|---|---|
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | contenu du fichier `cle-base64.txt` |
| `ANDROID_UPLOAD_KEYSTORE_PASSWORD` | mot de passe de la clé |
| `ANDROID_UPLOAD_KEY_PASSWORD` | même mot de passe |
| `ANDROID_UPLOAD_KEY_ALIAS` | `elite-envoi` |

Ensuite, à chaque mise à jour du dépôt (ou via *Actions* → *Application Android* → *Run workflow*), l'exécution produit
l'artefact **`elite-mathematique-play-store`** contenant `elite-mathematique-play.aab`, prêt à déposer.
Sans les secrets, l'artefact s'appelle `elite-mathematique-play-non-signe.aab` et le Play Store le refusera.

Garder précieusement `cle-envoi-elite-mathematique.jks` et son mot de passe (par exemple dans un Google Drive personnel).
En cas de perte, la clé d'envoi peut être remplacée depuis la Play Console (*Intégrité de l'application*).

## 3. Publier la politique de confidentialité

Le Play Store exige une adresse web publique. Elle sera :
**https://1983florent.github.io/elite-mathematique/confidentialite.html**

Pour l'activer : fusionner cette branche dans `main`, puis dans GitHub → **Settings** → **Pages** → *Source* : **GitHub Actions**.
Le workflow « Site web » publie alors le site et la page de confidentialité.

## 4. Créer l'application dans la Play Console

*Créer une application* :

- Nom : **ELITE MATHÉMATIQUE** · Langue par défaut : **français (France)**
- **Application** (pas un jeu) · **Gratuite**
- Cocher les déclarations (règles du programme, lois d'exportation des États-Unis).

## 5. Remplir « Contenu de l'application »

Réponses qui correspondent au logiciel tel qu'il est :

| Rubrique | Réponse |
|---|---|
| Politique de confidentialité | l'adresse de l'étape 3 |
| Accès à l'application | Toutes les fonctionnalités sont accessibles sans restriction (aucun compte) |
| Annonces | **Non**, l'application ne contient pas d'annonces |
| Classification du contenu | Catégorie « Référence, actualités ou enseignement » ; répondre **Non** à toutes les questions (violence, langage, drogues, jeux d'argent, interactions entre utilisateurs, partage de position, achats numériques). Classification attendue : tout public |
| Public cible | Voir l'encadré ci-dessous |
| Sécurité des données | « Votre application collecte-t-elle ou partage-t-elle des données ? » **Non**. Tout reste sur l'appareil ; l'application n'a même pas l'autorisation d'accès à internet |
| Identifiant publicitaire | L'application **n'utilise pas** l'identifiant publicitaire |
| Application gouvernementale | Non |
| Fonctionnalités financières | Aucune |
| Santé | Aucune fonctionnalité de santé |
| Application d'actualités | Non |

> **Public cible.** Le logiciel s'adresse à des élèves dès le CM2, donc à des enfants de moins de 13 ans, et aussi aux
> lycéens et aux enseignants. Cocher les tranches d'âge concernées (par exemple 9-12, 13-15, 16-17 et 18 ans et plus).
> Dès qu'une tranche de moins de 13 ans est cochée, le **règlement « Familles »** s'applique. L'application le respecte :
> pas de publicité, aucune donnée collectée, aucun kit de développement tiers.
> L'appel aux dons (Wave / Orange Money) est masqué dans l'application Android : le règlement des paiements de Google Play
> interdit d'orienter vers un moyen de paiement extérieur. Il reste visible sur le site web.

## 6. Tester, puis publier

1. **Test interne** (facultatif, immédiat) : *Tester* → *Tests internes* → créer une version, déposer `elite-mathematique-play.aab`.
   Accepter la **signature d'application par Google Play** proposée au premier envoi.
2. **Test fermé** (obligatoire pour un compte personnel récent) : *Tests fermés* → créer une liste d'au moins **12 testeurs**
   (adresses Gmail d'élèves, de parents ou de collègues), déposer l'App Bundle, envoyer le lien d'inscription.
   Les testeurs doivent rester inscrits **14 jours d'affilée**.
3. *Tableau de bord* → **Demander l'accès à la production** (questions sur le test : déroulement, retours obtenus).
4. **Production** : créer une version, déposer l'App Bundle, choisir les pays (au minimum le Sénégal), envoyer pour examen.
   L'examen par Google prend en général quelques jours.

## 7. Mettre à jour l'application

À chaque modification du logiciel, GitHub Actions produit un nouvel App Bundle avec un numéro de version plus grand.
Dans la Play Console : *Production* (ou une piste de test) → *Créer une version* → déposer le nouveau `.aab` →
coller les notes de version → envoyer pour examen.

## Fiche du Play Store

Textes prêts à copier et visuels aux bons formats : [`play-store/fiche.md`](../play-store/fiche.md).
