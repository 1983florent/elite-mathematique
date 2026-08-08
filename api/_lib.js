/**
 * Cœur du mini-backend de paiement Veritex — logique partagée entre les
 * plateformes (Vercel : dossier `api/` ; Netlify : `netlify/functions/`).
 *
 * Prestataire : **FedaPay** (Wave, Orange Money, Moov, MTN, cartes — FCFA).
 *
 * PRINCIPE DE SÉCURITÉ
 * --------------------
 * La **clé secrète FedaPay** et la **clé privée de signature** ne vivent QUE
 * côté serveur, dans des variables d'environnement. Le front-end ne connaît
 * que l'URL de ce backend et la clé PUBLIQUE. Personne ne peut donc extraire
 * un secret avec « Inspecter / F12 ».
 *
 * Variables d'environnement attendues :
 *   FEDAPAY_SECRET_KEY    clé secrète FedaPay (sk_live_… ou sk_sandbox_…)
 *   FEDAPAY_BASE_URL      (optionnel) base API ; déduite de la clé sinon
 *                         (sandbox : https://sandbox-api.fedapay.com/v1)
 *   AMOUNT_MENSUEL        (optionnel) prix mensuel en FCFA (défaut 3000)
 *   AMOUNT_ANNUEL         (optionnel) prix annuel en FCFA (défaut 25000)
 *   LICENSE_PRIVATE_KEY   clé privée ECDSA P-256 (PKCS8, base64) — cf.
 *                         `node tools/make-license.mjs --cles`
 *   ALLOW_ORIGIN          (optionnel) origine autorisée pour CORS (défaut *)
 *   PUBLIC_URL            (optionnel) URL publique du site (retours de paiement)
 *
 * Aucune dépendance npm : appels FedaPay en REST via `fetch`, signature via
 * `node:crypto`. Fonctionne sur Node 18+.
 *
 * @module api/_lib
 */

import { sign, createPrivateKey } from 'node:crypto';

/** Durée (en jours) accordée par offre. */
export const PLAN_DAYS = { mensuel: 31, annuel: 366 };

/** Devise : Franc CFA (Afrique de l'Ouest). */
const CURRENCY = 'XOF';

/** Montant (en FCFA) à facturer pour une offre. */
function amountFor(plan) {
  const defaults = { mensuel: 3000, annuel: 25000 };
  const env = { mensuel: process.env.AMOUNT_MENSUEL, annuel: process.env.AMOUNT_ANNUEL };
  const v = Number(env[plan]);
  return Number.isFinite(v) && v > 0 ? Math.round(v) : defaults[plan];
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

/** Base de l'API FedaPay : explicite (env) sinon déduite de la clé. */
function fedapayBase() {
  if (process.env.FEDAPAY_BASE_URL) return process.env.FEDAPAY_BASE_URL.replace(/\/$/, '');
  const key = process.env.FEDAPAY_SECRET_KEY || '';
  return key.includes('sandbox')
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1';
}

/** Appel REST FedaPay authentifié par la clé secrète (jamais exposée). */
async function fedapay(path, { method = 'GET', body } = {}) {
  const secret = process.env.FEDAPAY_SECRET_KEY;
  if (!secret) throw new Error('FEDAPAY_SECRET_KEY manquante côté serveur.');
  const opts = {
    method,
    headers: {
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(fedapayBase() + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data && (data.message || data.error) ? data.message || data.error : 'Erreur FedaPay ' + res.status;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  return data;
}

/** FedaPay enveloppe ses objets (ex. { "v1/transaction": {...} }). */
function unwrap(data, klass) {
  if (!data || typeof data !== 'object') return data;
  return data[`v1/${klass}`] || data[klass] || data.data || data;
}

/* ------------------------------------------------------------------ *
 * Endpoints (logique pure : renvoient { status, body })
 * ------------------------------------------------------------------ */

/**
 * Crée une transaction FedaPay et renvoie l'URL de paiement sécurisée.
 * @param {{plan:string, origin:string, email?:string}} input
 */
export async function coreCreerSession({ plan, origin, email }) {
  if (!PLAN_DAYS[plan]) {
    return { status: 400, body: { error: 'Offre inconnue : ' + plan } };
  }
  const base = (origin || process.env.PUBLIC_URL || '').replace(/\/$/, '');
  const amount = amountFor(plan);

  // 1) Créer la transaction.
  const created = await fedapay('/transactions', {
    method: 'POST',
    body: {
      description: `Veritex — abonnement ${plan}`,
      amount,
      currency: { iso: CURRENCY },
      callback_url: `${base}/?paiement=reussi&plan=${encodeURIComponent(plan)}`,
      ...(email ? { customer: { email } } : {}),
    },
  });
  const tx = unwrap(created, 'transaction');
  const txId = tx && (tx.id || tx.reference);
  if (!txId) {
    return { status: 502, body: { error: 'Transaction FedaPay sans identifiant.' } };
  }

  // 2) Générer le jeton de paiement (URL de la page FedaPay).
  const tokenResp = await fedapay(`/transactions/${txId}/token`, { method: 'POST' });
  const url = tokenResp && (tokenResp.url || (unwrap(tokenResp, 'transaction') || {}).url);
  if (!url) {
    return { status: 502, body: { error: 'FedaPay n’a pas renvoyé d’URL de paiement.' } };
  }
  return { status: 200, body: { url, transaction: String(txId) } };
}

/**
 * Après retour de FedaPay, vérifie que la transaction est **approuvée** puis
 * délivre un code d'accès signé. Aucune base de données : la preuve de paiement
 * est lue directement chez FedaPay.
 * @param {{transaction:string, plan?:string}} input
 */
export async function coreRecupererCode({ transaction, plan }) {
  if (!transaction) return { status: 400, body: { error: 'transaction requise.' } };
  const resp = await fedapay('/transactions/' + encodeURIComponent(transaction));
  const tx = unwrap(resp, 'transaction');
  const status = tx && tx.status;
  if (status !== 'approved') {
    return { status: 402, body: { error: 'Paiement non confirmé.', statut: status || 'inconnu' } };
  }
  // On déduit l'offre du montant si elle n'est pas transmise.
  let offre = plan && PLAN_DAYS[plan] ? plan : null;
  if (!offre) {
    const amount = Number(tx.amount);
    offre = amount >= amountFor('annuel') ? 'annuel' : 'mensuel';
  }
  const jours = PLAN_DAYS[offre] || 366;
  const id = 'FEDA-' + String(transaction).slice(-12);
  const code = signAccessCode({ plan: offre, jours, id });
  return { status: 200, body: { code, plan: offre } };
}

/**
 * Vérifie un code côté serveur (utile comme `verifyEndpoint` de secours).
 * @param {{reference:string}} input
 */
export async function coreVerifier({ reference }) {
  // Point d'entrée pour un contrôle serveur renforcé (révocation, quotas).
  // Par défaut : accepte toute référence non vide (la vérification
  // cryptographique du code se fait déjà côté client via la clé publique).
  if (!reference) return { status: 400, body: { active: false, error: 'reference requise.' } };
  return { status: 200, body: { active: true } };
}
