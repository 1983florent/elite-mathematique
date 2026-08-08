# Backend de paiement Veritex (`api/`) — FedaPay

Mini-backend **sans dépendance** qui garde les secrets côté serveur. Le
front-end ne connaît que la clé **publique** et l'URL `/api`.

Prestataire : **FedaPay** (Wave, Orange Money, Moov, MTN, cartes — FCFA/XOF).

## Pourquoi un backend ?

Une clé secrète de paiement (`sk_...`) ou une clé privée de signature ne
doivent **jamais** vivre dans le code front-end : n'importe qui les extrairait
avec « Inspecter / F12 ». Ces fonctions détiennent seules les secrets (via des
variables d'environnement) et créent les transactions.

## Points d'entrée

| Méthode | Chemin | Rôle |
|--------|--------|------|
| POST | `/api/creer-session` | Crée une transaction FedaPay → `{ url }` (page de paiement) |
| GET  | `/api/recuperer-code?transaction=<id>` | Vérifie l'approbation chez FedaPay puis renvoie un code d'accès signé `{ code, plan }` |
| POST | `/api/verifier` | Contrôle serveur optionnel |

Aucune base de données : la preuve de paiement est lue directement chez FedaPay.

## Variables d'environnement

Voir `.env.example`. À définir dans Netlify/Vercel :

- `FEDAPAY_SECRET_KEY` — clé secrète FedaPay (`sk_sandbox_…` en test,
  `sk_live_…` en production). La base de l'API est déduite automatiquement.
- `AMOUNT_MENSUEL`, `AMOUNT_ANNUEL` — prix en FCFA (doivent correspondre aux
  libellés de `plagiat/js/core/license.js`).
- `LICENSE_PRIVATE_KEY` — clé privée ECDSA (PKCS8 base64) ; la publique
  correspondante va dans `plagiat/js/core/license.js` (`publicKeySpki`).

## Flux complet

1. L'utilisateur clique « S'abonner » → le front POST `/api/creer-session`.
2. Le backend crée la transaction FedaPay (clé secrète), demande le jeton de
   paiement et renvoie son URL.
3. L'utilisateur paie sur la page FedaPay (Wave, Orange Money…), puis revient
   sur `…/?paiement=reussi&id=<transaction>&status=approved`.
4. Le front GET `/api/recuperer-code?transaction=<id>`.
5. Le backend vérifie chez FedaPay que la transaction est **approuvée**, signe
   un code d'accès (clé privée) et le renvoie.
6. Le front active l'accès (le code est vérifié par la clé publique).

## Passer de test à production

Remplacez simplement `FEDAPAY_SECRET_KEY` (`sk_sandbox_…` → `sk_live_…`) dans
les variables d'environnement, puis redéployez. Rien d'autre à changer.
