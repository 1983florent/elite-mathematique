/**
 * Accès payant — droits d'utilisation et vérification des codes d'accès.
 *
 * Modèle : **freemium**. L'utilisateur dispose d'un nombre d'analyses d'essai
 * gratuites, puis doit activer un abonnement pour continuer. L'activation se
 * fait soit par un **code d'accès signé** (vérifiable hors ligne grâce à une
 * clé publique embarquée — impossible à falsifier sans la clé privée du
 * vendeur), soit via une page de paiement du prestataire (Stripe, Mobile
 * Money, PayPal) qui, après paiement, délivre ce code.
 *
 * Sécurité — à lire : la vérification du code est cryptographiquement sûre
 * (personne ne peut fabriquer un code valide sans votre clé privée). En
 * revanche, un compteur d'essais purement local reste contournable par un
 * utilisateur technique ; pour un contrôle strict des abonnements, doublez-le
 * d'une vérification côté serveur (`config.verifyEndpoint`).
 *
 * @module core/license
 */

import { get as storeGet, put as storePut } from './store.js';

/**
 * Configuration commerciale. **À personnaliser** lors de la mise en ligne :
 * remplacez la clé publique de démonstration par la vôtre et renseignez les
 * liens de paiement fournis par votre prestataire.
 */
export const LICENSE_CONFIG = {
  /** Clé publique ECDSA P-256 (SPKI base64) qui valide les codes d'accès.
   *  DÉMONSTRATION — à remplacer par votre clé publique en production. */
  publicKeySpki:
    'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEo+ydaFNw7r4PEhZlAVh3mb0uUwjkG4Jrk5YGTrbPo3bJ9R9YWL66LlbiBBvZA9Cck0WWZ3wiC8fXsdDteJOTVQ==',

  /** Nombre d'analyses gratuites avant de demander un paiement. */
  freeTrials: 1,

  /** Offres affichées dans le mur d'accès. Prix purement indicatifs ici. */
  plans: [
    { id: 'mensuel', priceLabel: '4,99 €', periodKey: 'paywall.month', highlight: false },
    { id: 'annuel', priceLabel: '39,99 €', periodKey: 'paywall.year', highlight: true },
  ],

  /**
   * Liens de paiement par prestataire. Chaque valeur est l'URL vers laquelle
   * l'utilisateur est redirigé pour payer. Laissez vide pour masquer le
   * prestataire. `{plan}` est remplacé par l'identifiant de l'offre.
   */
  checkout: {
    stripe: '', // ex. https://buy.stripe.com/xxxx: lien de paiement Stripe
    paypal: '', // ex. https://www.paypal.com/ncp/payment/xxxx
    mobileMoney: '', // ex. page Wave / Orange Money
  },

  /**
   * URL de base du mini-backend de paiement (dossier `api/` de ce dépôt,
   * déployé sur Vercel/Netlify). La clé SECRÈTE Stripe et la clé PRIVÉE de
   * signature n'y vivent QUE côté serveur — jamais dans ce code front-end.
   * - Vide (`''`) : le backend est servi sur la MÊME origine que l'app
   *   (appels relatifs vers `/api/...`). C'est le cas si vous déployez tout
   *   ensemble (recommandé).
   * - Sinon, URL absolue du backend, ex. `https://api.mondomaine.com`.
   */
  backendBaseUrl: '',

  /** Vérification d'abonnement côté serveur (facultative mais recommandée). */
  verifyEndpoint: '', // ex. https://votre-serveur/verifier

  /** Coordonnées affichées en cas de problème de paiement. */
  supportEmail: 'maths.florent@gmail.com',
};

const STORE_KEY = 'entitlement';

/** @typedef {{plan: string, exp: number, id: string, iat?: number}} LicensePayload */

/* ------------------------------------------------------------------ *
 * Outils base64url
 * ------------------------------------------------------------------ */

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64ToBytes(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const decoder = new TextDecoder();

/* ------------------------------------------------------------------ *
 * Vérification cryptographique du code
 * ------------------------------------------------------------------ */

/**
 * Vérifie la signature d'un code d'accès et renvoie sa charge utile.
 *
 * Format du code : `<payloadBase64url>.<signatureBase64url>`, la signature
 * étant une ECDSA P-256 (SHA-256) sur les octets UTF-8 du payload.
 *
 * @param {string} code
 * @returns {Promise<{ok: true, payload: LicensePayload} | {ok: false, error: string}>}
 */
export async function verifyCodeSignature(code) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return { ok: false, error: 'Environnement sans cryptographie.' };

  const parts = String(code).trim().split('.');
  if (parts.length !== 2) return { ok: false, error: 'Format de code invalide.' };
  const [payloadPart, sigPart] = parts;

  let payload;
  try {
    payload = JSON.parse(decoder.decode(b64urlToBytes(payloadPart)));
  } catch {
    return { ok: false, error: 'Code illisible.' };
  }

  try {
    const key = await subtle.importKey(
      'spki',
      b64ToBytes(LICENSE_CONFIG.publicKeySpki),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    const ok = await subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      b64urlToBytes(sigPart),
      new TextEncoder().encode(payloadPart),
    );
    if (!ok) return { ok: false, error: 'Signature non valide.' };
  } catch {
    return { ok: false, error: 'Vérification impossible.' };
  }

  return { ok: true, payload };
}

/* ------------------------------------------------------------------ *
 * État des droits
 * ------------------------------------------------------------------ */

/**
 * @typedef {Object} Entitlement
 * @property {'trial'|'active'|'expired'|'locked'} status
 * @property {string|null} plan
 * @property {number|null} expiresAt   horodatage (ms) ou null
 * @property {number} trialUsed
 * @property {number} trialLeft
 */

/** Lit l'état des droits, en tenant compte de l'expiration. */
export async function getEntitlement() {
  const saved = (await storeGet('settings', STORE_KEY)) || {};
  const trialUsed = saved.trialUsed || 0;
  const trialLeft = Math.max(0, LICENSE_CONFIG.freeTrials - trialUsed);
  const now = Date.now();

  if (saved.plan && saved.expiresAt && saved.expiresAt > now) {
    return { status: 'active', plan: saved.plan, expiresAt: saved.expiresAt, trialUsed, trialLeft };
  }
  if (saved.plan && saved.expiresAt && saved.expiresAt <= now) {
    return { status: 'expired', plan: saved.plan, expiresAt: saved.expiresAt, trialUsed, trialLeft };
  }
  if (trialLeft > 0) {
    return { status: 'trial', plan: null, expiresAt: null, trialUsed, trialLeft };
  }
  return { status: 'locked', plan: null, expiresAt: null, trialUsed, trialLeft };
}

/** Indique si l'utilisateur peut lancer une analyse premium. */
export async function hasAccess() {
  const e = await getEntitlement();
  return e.status === 'active' || (e.status === 'trial' && e.trialLeft > 0);
}

/** Consomme une analyse d'essai (sans effet si un abonnement est actif). */
export async function consumeTrial() {
  const e = await getEntitlement();
  if (e.status === 'active') return;
  const saved = (await storeGet('settings', STORE_KEY)) || {};
  saved.trialUsed = (saved.trialUsed || 0) + 1;
  await storePut('settings', STORE_KEY, saved);
}

/**
 * Active un code d'accès après vérification de sa signature et de sa validité.
 * @param {string} code
 * @returns {Promise<{ok: boolean, error?: string, expiresAt?: number, plan?: string}>}
 */
export async function redeemCode(code) {
  const res = await verifyCodeSignature(code);
  if (!res.ok) return { ok: false, error: res.error };

  const { plan, exp } = res.payload;
  const expiresAt = typeof exp === 'number' ? (exp < 1e12 ? exp * 1000 : exp) : 0;
  if (!expiresAt || expiresAt <= Date.now()) {
    return { ok: false, error: 'Code expiré.' };
  }

  const saved = (await storeGet('settings', STORE_KEY)) || {};
  saved.plan = plan || 'premium';
  saved.expiresAt = expiresAt;
  saved.code = code;
  await storePut('settings', STORE_KEY, saved);
  return { ok: true, expiresAt, plan: saved.plan };
}

/**
 * Vérifie un abonnement auprès du serveur (si configuré). Sert à confirmer un
 * paiement par carte/mobile money côté prestataire.
 * @param {string} reference identifiant de session/commande
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function verifyWithServer(reference) {
  if (!LICENSE_CONFIG.verifyEndpoint) {
    return { ok: false, error: 'Vérification serveur non configurée.' };
  }
  try {
    const res = await fetch(LICENSE_CONFIG.verifyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    if (!res.ok) return { ok: false, error: `Serveur : HTTP ${res.status}` };
    const data = await res.json();
    if (data.code) return redeemCode(data.code);
    if (data.expiresAt && data.plan) {
      const saved = (await storeGet('settings', STORE_KEY)) || {};
      saved.plan = data.plan;
      saved.expiresAt = data.expiresAt;
      await storePut('settings', STORE_KEY, saved);
      return { ok: true };
    }
    return { ok: false, error: 'Réponse du serveur inexploitable.' };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/**
 * URL de paiement pour un prestataire et une offre donnés.
 * @param {'stripe'|'paypal'|'mobileMoney'} provider
 * @param {string} plan
 * @returns {string}
 */
export function checkoutUrl(provider, plan) {
  const tpl = LICENSE_CONFIG.checkout[provider];
  if (!tpl) return '';
  return tpl.replace('{plan}', encodeURIComponent(plan || ''));
}

/** Prestataires de paiement effectivement configurés. */
export function configuredProviders() {
  return Object.entries(LICENSE_CONFIG.checkout)
    .filter(([, url]) => url && url.trim())
    .map(([name]) => name);
}

/** Construit une URL vers le mini-backend (`/api/...`). */
function apiUrl(path) {
  const base = (LICENSE_CONFIG.backendBaseUrl || '').replace(/\/$/, '');
  return `${base}/api/${path}`;
}

/**
 * Demande au backend de créer une session de paiement sécurisée (la clé
 * secrète reste côté serveur). Renvoie l'URL de paiement, ou `null` si aucun
 * backend n'est déployé/configuré.
 * @param {string} planId
 * @returns {Promise<string|null>}
 */
export async function createBackendCheckout(planId) {
  try {
    const res = await fetch(apiUrl('creer-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, origin: location.origin }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null; // pas de backend joignable → on retombera sur un lien statique
  }
}

/**
 * Après retour du prestataire (`?paiement=reussi&session_id=…`), récupère le
 * code d'accès signé auprès du backend (qui vérifie le paiement chez Stripe)
 * et l'active. À appeler au chargement de l'application.
 * @param {string} sessionId
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function claimCodeAfterPayment(sessionId) {
  if (!sessionId) return { ok: false, error: 'session_id manquant.' };
  try {
    const res = await fetch(apiUrl('recuperer-code') + '?session_id=' + encodeURIComponent(sessionId));
    if (!res.ok) return { ok: false, error: `Backend : HTTP ${res.status}` };
    const data = await res.json();
    if (!data.code) return { ok: false, error: data.error || 'Code non délivré.' };
    return redeemCode(data.code);
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}
