# Veritex — Guide de mise en ligne et d'exploitation

Ce guide explique comment **héberger Veritex**, l'**adapter à votre marque**,
**activer les paiements** et **générer les codes d'accès** de vos clients.
Tout est déjà en place : il ne reste qu'à renseigner vos informations.

---

## 1. Héberger l'application

Veritex est une application web **statique** (aucun serveur applicatif requis) :
elle tourne entièrement dans le navigateur du visiteur, et aucun document
analysé ne quitte sa machine.

1. Prenez le dossier **`plagiat/`** (fourni tel quel dans le zip
   `Veritex-web-a-heberger.zip`).
2. Déposez-le chez n'importe quel hébergeur statique : **Netlify, Vercel,
   Cloudflare Pages, GitHub Pages, OVH, un simple dossier Apache/Nginx…**
3. L'adresse d'entrée est `plagiat/index.html`.

> Une version **fichier unique** (`Veritex.html`) existe aussi : elle
> fonctionne par simple double-clic, sans hébergement. Idéale pour une démo ou
> un usage hors ligne. En ligne, préférez le dossier `plagiat/` (plus rapide,
> installable, met les réglages en cache).

### HTTPS obligatoire pour les fonctions avancées

Servez le site en **HTTPS**. C'est nécessaire pour l'installation (PWA), le
service worker (mode hors ligne) et la cryptographie des certificats/codes.

---

## 2. Changer la marque (nom, couleurs, éditeur)

Tout est centralisé dans **un seul fichier** :
`plagiat/js/core/branding.js`.

```js
export const BRAND = {
  name: 'Veritex',                 // ← le nom affiché partout
  publisher: 'ELITE MATHEMATIQUE', // ← votre société / éditeur
  supportEmail: 'maths.florent@gmail.com',
  colors: { primary: '#4f46e5', accent: '#f59e0b' }, // ← charte graphique
  tagline: { fr: '…', en: '…' },
};
```

Modifiez ces valeurs et **toute l'application** (en-tête, titre de l'onglet,
paywall, certificat, manifeste PWA) se met à jour.

---

## 3. Les langues (déjà automatique)

Veritex détecte **la langue de la machine du visiteur** et l'applique par
défaut, parmi 14 langues intégrées (français, anglais, espagnol, portugais,
allemand, italien, néerlandais, russe, **arabe (droite-à-gauche)**, chinois,
hindi, swahili, turc, japonais). Le visiteur peut en changer via le sélecteur
🌐 dans l'en-tête.

- Les libellés du **cœur de l'interface** sont traduits dans les 14 langues.
- Pour les textes non encore traduits, l'application **retombe proprement** sur
  l'anglais puis le français (jamais de texte manquant).
- Pour ajouter/compléter une langue : `plagiat/js/data/locales.js`
  (il suffit d'ajouter les clés manquantes ; voir les entrées `fr`/`en`).
- Option avancée : un **traducteur automatique** peut être branché pour couvrir
  toutes les langues du monde à la volée — voir `setAutoTranslator()` dans
  `plagiat/js/core/i18n.js`.

---

## 4. Activer les paiements

Le modèle est **freemium** : `N` analyses d'essai gratuites (par défaut **1**),
puis un mur d'accès propose l'abonnement.

> ⚠️ **Sécurité — à lire.** Une clé secrète de paiement (`sk_…`) ne doit
> **jamais** vivre dans le code front-end : n'importe qui l'extrait avec « F12 ».
> C'est pourquoi Veritex est livré avec un **mini-backend** (dossier `api/`) qui
> détient seul les secrets, via des variables d'environnement. Le front ne
> connaît que la clé **publique** et l'URL `/api`.
>
> Prestataire : **FedaPay** (Wave, Orange Money, Moov, MTN, cartes — FCFA),
> adapté à l'Afrique de l'Ouest.

### Architecture (déjà en place)

```
Navigateur (front)                     Backend serverless (api/)
-----------------                      -------------------------
« S'abonner »  -- POST /api/creer-session -->  crée la transaction FedaPay
                                               (FEDAPAY_SECRET_KEY)
              <---------- { url } -----------
  redirige vers la page FedaPay … paiement (Wave, Orange Money…) …
  retour: /?paiement=reussi&id=<transaction>
              -- GET /api/recuperer-code --->  vérifie l'approbation chez
                                               FedaPay, signe un code
                                               (LICENSE_PRIVATE_KEY)
              <---------- { code } ----------
  active l'accès (vérifié par la clé PUBLIQUE)
```

Aucune base de données : la preuve de paiement est lue directement chez FedaPay.
Le client peut aussi entrer **un code d'accès** que vous lui envoyez à la main
(voir §5).

### Ce que vous configurez

**a) Côté front — `plagiat/js/core/license.js` :**

```js
export const LICENSE_CONFIG = {
  publicKeySpki: '…',   // ← VOTRE clé publique (voir §5) — REMPLACER la démo
  freeTrials: 1,        // ← nombre d'analyses gratuites
  plans: [ /* offres et prix affichés, en FCFA */ ],
  backendBaseUrl: '',   // ← vide = backend sur la même origine (recommandé)
  supportEmail: 'maths.florent@gmail.com',
};
```

**b) Côté serveur — variables d'environnement** (dans Netlify/Vercel, voir §8) :

| Variable | Valeur |
|----------|--------|
| `FEDAPAY_SECRET_KEY` | votre clé secrète FedaPay (`sk_sandbox_…` en test, `sk_live_…` en prod) |
| `AMOUNT_MENSUEL` | prix mensuel en FCFA (ex. `3000`) |
| `AMOUNT_ANNUEL` | prix annuel en FCFA (ex. `25000`) |
| `LICENSE_PRIVATE_KEY` | votre clé privée de signature (PKCS8 base64, §5) |

Modèle complet : `api/.env.example`. Détails : `api/README.md`.

> **Test → production :** commencez avec la clé `sk_sandbox_…` (paiements
> fictifs). Quand tout marche, remplacez-la par `sk_live_…` et redéployez :
> la base de l'API bascule automatiquement en production.
>
> **Vos gains :** l'argent des clients arrive sur votre **compte FedaPay** ;
> vous le retirez ensuite vers votre Wave / Orange Money depuis le tableau de
> bord FedaPay. Aucun numéro à mettre dans le code.

---

## 5. Générer vos clés et les codes d'accès des clients

Les codes d'accès sont **signés cryptographiquement** (ECDSA P-256) : personne
ne peut en fabriquer un valide sans votre clé privée. Veritex les vérifie hors
ligne grâce à la clé publique embarquée.

### a) Créer votre paire de clés (une seule fois)

```bash
node tools/make-license.mjs --cles
```

- Copiez la **clé PUBLIQUE** affichée dans `license.js` → `publicKeySpki`.
- Gardez la **clé PRIVÉE** secrète (jamais dans l'application, jamais en ligne).

### b) Délivrer un code après un paiement

```bash
node tools/make-license.mjs --priv <CLE_PRIVEE> --plan annuel --jours 365 --id CLIENT-42
```

Cela imprime un code du type `eyJ….n0Se…`. Remettez-le au client (par e-mail).
Il le colle dans le paywall (« J'ai un code d'accès » → **Activer**) et l'accès
s'ouvre jusqu'à l'échéance.

**Automatisation** : le backend délivre déjà les codes automatiquement après un
paiement FedaPay. La commande ci-dessus ne sert qu'à générer un code **à la
main** (offre spéciale, dépannage, paiement reçu hors ligne).

---

## 6. Le certificat d'originalité (votre atout unique)

Après chaque analyse, l'utilisateur peut générer un **Certificat d'originalité**
(bouton ✦). C'est un document imprimable (HTML/PDF) qui atteste le taux
d'originalité, l'empreinte SHA-256 du fichier, le score IA, les moteurs
interrogés — le tout **scellé par un condensé SHA-256** et un **sceau visuel**
unique par document.

- N'importe qui peut le **vérifier** dans Veritex (onglet *Outils › Vérifier un
  certificat*) : toute altération d'un champ est détectée.
- **Signature forte (optionnelle)** : pour une attestation vérifiable par des
  tiers avec votre clé, exposez un point de signature serveur et renseignez
  `CERT_CONFIG.signEndpoint` dans `plagiat/js/core/certificate.js`. Le
  certificat portera alors une signature ECDSA vérifiable avec la clé publique.

---

## 7. Déployer sur Vercel ou Netlify

Le dépôt est **prêt à déployer** : site statique + fonctions de paiement, avec
`vercel.json` et `netlify.toml` déjà fournis. Le front et le backend sont sur la
**même origine** (appels `/api` relatifs), aucune configuration CORS.

> Veritex est servi **à la racine** du site (ex. `https://mondomaine.com/`) :
> `netlify.toml` publie le dossier `plagiat/`, et `vercel.json` fait la même
> chose par réécriture. Rien à ajouter.

### Vercel

1. Poussez le dépôt sur GitHub (voir §8).
2. Sur **vercel.com** → *Add New… → Project* → importez le dépôt GitHub.
3. Framework Preset : **Other** (aucun build). Cliquez *Deploy*.
4. *Settings → Environment Variables* : ajoutez `FEDAPAY_SECRET_KEY`,
   `AMOUNT_MENSUEL`, `AMOUNT_ANNUEL`, `LICENSE_PRIVATE_KEY` (cf. §4b). *Redeploy*.
5. Le dossier `api/` devient automatiquement vos fonctions serverless.

### Netlify

1. Poussez le dépôt sur GitHub (voir §8).
2. Sur **netlify.com** → *Add new site → Import an existing project* →
   choisissez le dépôt.
3. Laissez les réglages par défaut (le `netlify.toml` fait le nécessaire :
   `publish = .`, fonctions dans `netlify/functions`, redirections `/api/*`).
4. *Site settings → Environment variables* : mêmes variables qu'en §4b.
5. *Deploy*.

Dans les deux cas, Vercel/Netlify **redéploie tout seul** à chaque `git push`.

## 8. Déposer sur GitHub

Le code est déjà versionné (git). Pour l'envoyer sur votre dépôt GitHub :

```bash
git remote set-url origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin <branche>
```

(Ou créez le dépôt sur github.com puis suivez les instructions « …or push an
existing repository ».)

## 9. Vérifier que tout marche

```bash
npm test                 # 134 tests (moteur, i18n, licence, certificat, backend)
npm run assets           # régénère icônes + service worker
npm run build            # régénère la version fichier unique (dist/Veritex.html)
npm run serve            # sert le site en local pour un test navigateur
```

---

## Récapitulatif : ce qu'il vous reste à faire

| Étape | Où | Action |
|------|----|--------|
| Marque | `plagiat/js/core/branding.js` | Nom, couleurs (éditeur laissé vide) |
| Clé publique | `plagiat/js/core/license.js` | Coller votre `publicKeySpki` (§5a) |
| Prix | `plagiat/js/core/license.js` | Ajuster `plans` |
| Secrets paiement | Netlify/Vercel (variables d'env.) | `FEDAPAY_SECRET_KEY`, `AMOUNT_*`, `LICENSE_PRIVATE_KEY` (§4b) |
| Déploiement | Vercel ou Netlify | Importer le dépôt GitHub (§7) |
| Codes manuels | `tools/make-license.mjs` | Générer un code à la main si besoin (§5b) |

Tout le reste — design, langues, analyse, humanisation, forensique, IA,
citations, comparaison, empreintes, certificat, PWA, mode hors ligne — est
**déjà opérationnel**.
