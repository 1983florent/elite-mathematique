# Backend de paiement Veritex (`api/`)

Mini-backend **sans dépendance** qui garde les secrets côté serveur. Le
front-end ne connaît que la clé **publique** et l'URL `/api`.

## Pourquoi un backend ?

Une clé secrète de paiement (Stripe `sk_…`) ou une clé privée de signature ne
doivent **jamais** vivre dans le code front-end : n'importe qui les extrairait
avec « Inspecter / F12 ». Ces fonctions détiennent seules les secrets (via des
variables d'environnement) et créent les transactions.

## Points d'entrée

| Méthode | Chemin | Rôle |
|--------|--------|------|
| POST | `/api/creer-session` | Crée une session de paiement Stripe → `{ url }` |
| GET  | `/api/recuperer-code?session_id=…` | Vérifie le paiement chez Stripe puis renvoie un code d'accès signé `{ code, plan }` |
| POST | `/api/verifier` | Contrôle serveur optionnel (`verifyEndpoint`) |

Aucune base de données : la preuve de paiement est lue directement chez Stripe.

## Variables d'environnement

Voir `.env.example`. À définir dans Vercel/Netlify :

- `STRIPE_SECRET_KEY` — clé secrète Stripe.
- `STRIPE_PRICE_MENSUEL`, `STRIPE_PRICE_ANNUEL` — identifiants de prix Stripe.
- `LICENSE_PRIVATE_KEY` — clé privée ECDSA (PKCS8 base64) ; la publique
  correspondante va dans `plagiat/js/core/license.js` (`publicKeySpki`).

## Déploiement

- **Vercel** : le dossier `api/` est détecté automatiquement comme fonctions
  serverless. Rien à configurer (voir `vercel.json` à la racine).
- **Netlify** : les fonctions sont dans `netlify/functions/` et réutilisent le
  même cœur `api/_lib.js` ; les redirections `/api/*` sont dans `netlify.toml`.

Le front et le backend sont servis sur la **même origine** : les appels `/api`
sont relatifs, donc aucune configuration CORS n'est nécessaire.

## Flux complet

1. L'utilisateur clique « S'abonner » → le front POST `/api/creer-session`.
2. Le backend crée la session Stripe (clé secrète) et renvoie l'URL.
3. L'utilisateur paie sur la page Stripe, puis revient sur
   `…/?paiement=reussi&session_id=cs_…`.
4. Le front GET `/api/recuperer-code?session_id=…`.
5. Le backend vérifie chez Stripe que la session est **payée**, signe un code
   d'accès (clé privée) et le renvoie.
6. Le front active l'accès (le code est vérifié par la clé publique).
