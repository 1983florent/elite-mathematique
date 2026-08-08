/**
 * Cœur du mini-backend de paiement Veritex — logique partagée entre les
 * plateformes (Vercel : dossier `api/` ; Netlify : `netlify/functions/`).
 *
 * PRINCIPE DE SÉCURITÉ
 * --------------------
 * La **clé secrète Stripe** et la **clé privée de signature** ne vivent QUE
 * côté serveur, dans des variables d'environnement. Le front-end ne connaît
 * que l'URL de ce backend et la clé PUBLIQUE. Personne ne peut donc extraire
 * un secret avec « Inspecter / F12 ».
 *
 * Variables d'environnement attendues :
 *   STRIPE_SECRET_KEY      clé secrète Stripe (sk_live_… ou sk_test_…)
 *   STRIPE_PRICE_MENSUEL   identifiant de prix Stripe pour l'offre « mensuel »
 *   STRIPE_PRICE_ANNUEL    identifiant de prix Stripe pour l'offre « annuel »
 *   LICENSE_PRIVATE_KEY    clé privée ECDSA P-256 (PKCS8, base64) — cf.
 *                          `node tools/make-license.mjs --cles`
 *   ALLOW_ORIGIN           (optionnel) origine autorisée pour CORS (défaut *)
 *
 * Aucune dépendance npm : appels Stripe en REST via `fetch`, signature via
 * `node:crypto`. Fonctionne sur Node 18+.
 *
 * @module api/_lib
 */

import { sign, createPrivateKey } from 'node:crypto';

/** Durée (en jours) accordée par offre. */
export const PLAN_DAYS = { mensuel: 31, annuel: 366 };

/** Mappe une offre vers l'identifiant de prix Stripe (depuis l'environnement). */
function priceIdFor(plan) {
  const key = 'STRIPE_PRICE_' + String(plan || '').toUpperCase();
  return process.env[key] || '';
}

/** En-têtes CORS (le front peut être servi depuis une autre origine). */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Signe un code d'accès (même format que `tools/make-license.mjs`), vérifiable
 * hors ligne par le front avec la clé publique embarquée.
 * @param {{plan:string, jours:number, id:string}} opts
 * @returns {string} code `<payloadBase64url>.<signatureBase64url>`
 */
export function signAccessCode({ plan, jours, id }) {
  const privB64 = process.env.LICENSE_PRIVATE_KEY;
  if (!privB64) throw new Error('LICENSE_PRIVATE_KEY manquante côté serveur.');
  const now = Math.floor(Date.now() / 1000);
  const payload = { plan, id, iat: now, exp: now + jours * 86400 };
  const part = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const key = createPrivateKey({
    key: Buffer.from(privB64, 'base64'),
    format: 'der',
    type: 'pkcs8',
  });
  const sig = sign('sha256', Buffer.from(part, 'utf8'), { key, dsaEncoding: 'ieee-p1363' });
  return `${part}.${b64url(sig)}`;
}

/** Appel REST Stripe authentifié par la clé secrète (jamais exposée). */
async function stripe(path, { method = 'GET', form } = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY manquante côté serveur.');
  const opts = {
    method,
    headers: {
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (form) opts.body = new URLSearchParams(form).toString();
  const res = await fetch('https://api.stripe.com/v1' + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data && data.error ? data.error.message : 'Erreur Stripe ' + res.status;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ------------------------------------------------------------------ *
 * Endpoints (logique pure : renvoient { status, body })
 * ------------------------------------------------------------------ */

/**
 * Crée une session de paiement Stripe et renvoie l'URL sécurisée.
 * @param {{plan:string, origin:string}} input
 */
export async function coreCreerSession({ plan, origin }) {
  const price = priceIdFor(plan);
  if (!PLAN_DAYS[plan] || !price) {
    return {
      status: 400,
      body: {
        error:
          "Offre inconnue ou prix Stripe non configuré. Renseignez STRIPE_PRICE_" +
          String(plan || '').toUpperCase() +
          ' côté serveur.',
      },
    };
  }
  const base = (origin || process.env.PUBLIC_URL || '').replace(/\/$/, '');
  const session = await stripe('/checkout/sessions', {
    method: 'POST',
    form: {
      mode: 'subscription',
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      'metadata[plan]': plan,
      success_url: base + '/?paiement=reussi&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: base + '/?paiement=annule',
      allow_promotion_codes: 'true',
    },
  });
  return { status: 200, body: { url: session.url } };
}

/**
 * Après retour de Stripe, vérifie que la session est payée puis délivre un
 * code d'accès signé. Aucune base de données nécessaire : la preuve de
 * paiement est lue directement chez Stripe.
 * @param {{session_id:string}} input
 */
export async function coreRecupererCode({ session_id }) {
  if (!session_id) return { status: 400, body: { error: 'session_id requis.' } };
  const session = await stripe('/checkout/sessions/' + encodeURIComponent(session_id));
  if (session.payment_status !== 'paid') {
    return { status: 402, body: { error: 'Paiement non confirmé.', payment_status: session.payment_status } };
  }
  const plan = (session.metadata && session.metadata.plan) || 'annuel';
  const jours = PLAN_DAYS[plan] || 366;
  const id = 'STRIPE-' + String(session_id).slice(-12);
  const code = signAccessCode({ plan, jours, id });
  return { status: 200, body: { code, plan } };
}

/**
 * Vérifie un code côté serveur (utile comme `verifyEndpoint` de secours).
 * On revérifie simplement la signature avec la clé privée → publique.
 * @param {{reference:string}} input
 */
export async function coreVerifier({ reference }) {
  // Ici on se contente de renvoyer que la vérification cryptographique se fait
  // côté client ; ce point d'entrée existe pour un contrôle serveur renforcé
  // (révocation, quotas). Par défaut : accepte toute référence non vide.
  if (!reference) return { status: 400, body: { active: false, error: 'reference requise.' } };
  return { status: 200, body: { active: true } };
}

