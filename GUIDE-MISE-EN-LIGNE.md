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
puis un mur d'accès propose l'abonnement. Deux façons de débloquer l'accès :

- **A. Redirection vers votre page de paiement** (Stripe, PayPal, Mobile Money).
- **B. Code d'accès signé** que vous remettez au client après paiement.

Les deux se configurent dans **`plagiat/js/core/license.js`** →
`LICENSE_CONFIG` :

```js
export const LICENSE_CONFIG = {
  publicKeySpki: '…',   // ← VOTRE clé publique (voir §5) — REMPLACER la démo
  freeTrials: 1,        // ← nombre d'analyses gratuites

  plans: [              // ← vos offres et prix
    { id: 'mensuel', priceLabel: '4,99 €',  periodKey: 'paywall.month' },
    { id: 'annuel',  priceLabel: '39,99 €', periodKey: 'paywall.year', highlight: true },
  ],

  checkout: {           // ← COLLEZ ICI vos liens de paiement
    stripe: '',         //   ex. https://buy.stripe.com/xxxxxxxx
    paypal: '',         //   ex. https://www.paypal.com/ncp/payment/xxxxxxxx
    mobileMoney: '',    //   ex. votre page Wave / Orange Money
  },

  verifyEndpoint: '',   // ← (optionnel) vérification d'abonnement côté serveur
  supportEmail: 'maths.florent@gmail.com',
};
```

**Le plus simple pour démarrer** : créez un *Payment Link* Stripe (ou un bouton
PayPal), collez son URL dans `checkout.stripe` (ou `checkout.paypal`). Le bouton
« S'abonner » y redirige. Aucune donnée de carte ne transite jamais par
Veritex : le paiement se fait sur la page sécurisée du prestataire.

> **Mobile Money (Afrique)** : `checkout.mobileMoney` accepte n'importe quelle
> URL de paiement (Wave, Orange Money, une page PayDunya/CinetPay, etc.).

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

**Automatisation** : branchez cette commande sur le *webhook* « paiement
réussi » de Stripe/PayPal pour envoyer le code automatiquement.

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

## 7. Vérifier que tout marche

```bash
npm test                 # 128 tests (moteur, i18n, licence, certificat…)
npm run assets           # régénère icônes + service worker
npm run build            # régénère la version fichier unique (dist/Veritex.html)
npm run serve            # sert le site en local pour un test navigateur
```

---

## Récapitulatif : ce qu'il vous reste à faire

| Étape | Fichier | Action |
|------|---------|--------|
| Marque | `js/core/branding.js` | Nom, éditeur, couleurs |
| Clé | `js/core/license.js` | Coller votre `publicKeySpki` (§5a) |
| Paiement | `js/core/license.js` | Coller vos liens `checkout.*` (§4) |
| Prix | `js/core/license.js` | Ajuster `plans` |
| Codes | `tools/make-license.mjs` | Générer après paiement (§5b) |

Tout le reste — design, langues, analyse, humanisation, forensique, IA,
citations, comparaison, empreintes, certificat, PWA, mode hors ligne — est
**déjà opérationnel**.
