import test from 'node:test';
import assert from 'node:assert/strict';
import { sign, createPrivateKey } from 'node:crypto';

import { BRAND, tagline } from '../plagiat/js/core/branding.js';
import {
  t,
  canonical,
  detectLanguage,
  direction,
  hasLocale,
  setLanguage,
  getLanguage,
  availableLanguages,
  onLanguageChange,
} from '../plagiat/js/core/i18n.js';
import {
  verifyCodeSignature,
  redeemCode,
  getEntitlement,
  hasAccess,
  consumeTrial,
  checkoutUrl,
  LICENSE_CONFIG,
} from '../plagiat/js/core/license.js';

/* -------------------------------------------------------------------------- */
/* Marque                                                                     */
/* -------------------------------------------------------------------------- */

test('la marque est centralisée et cohérente', () => {
  assert.equal(typeof BRAND.name, 'string');
  assert.ok(BRAND.name.length > 0);
  assert.equal(tagline('fr'), BRAND.tagline.fr);
  assert.equal(tagline('xx'), BRAND.tagline.en); // repli
});

/* -------------------------------------------------------------------------- */
/* Internationalisation                                                       */
/* -------------------------------------------------------------------------- */

test('canonical réduit les variantes régionales', () => {
  assert.equal(canonical('fr-CA'), 'fr');
  assert.equal(canonical('zh-Hans-CN'), 'zh');
  assert.equal(canonical('EN_US'), 'en');
  assert.equal(canonical(''), 'fr');
});

test('t() traduit, interpole et retombe proprement', () => {
  setLanguage('fr');
  assert.equal(t('nav.analyse'), 'Analyse');
  setLanguage('en');
  assert.equal(t('nav.analyse'), 'Analysis');
  setLanguage('es');
  assert.equal(t('nav.analyse'), 'Análisis');
  // Clé absente en espagnol → repli anglais.
  assert.equal(t('action.close'), 'Close');
  // Interpolation.
  assert.equal(t('paywall.title', { app: 'Veritex' }), 'Desbloquea todo el poder de Veritex');
  // Clé totalement inconnue → la clé elle-même.
  assert.equal(t('cle.inexistante'), 'cle.inexistante');
  setLanguage('fr');
});

test('direction gère l’écriture droite-à-gauche', () => {
  assert.equal(direction('ar'), 'rtl');
  assert.equal(direction('he'), 'rtl');
  assert.equal(direction('fr'), 'ltr');
  assert.equal(direction('zh'), 'ltr');
});

test('les langues clés sont bien traduites', () => {
  for (const code of ['fr', 'en', 'es', 'pt', 'de', 'it', 'ar', 'zh', 'ru', 'sw']) {
    assert.ok(hasLocale(code), `locale ${code} présente`);
    setLanguage(code);
    const label = t('nav.analyse');
    assert.ok(label && label !== 'nav.analyse', `nav.analyse traduit en ${code}`);
  }
  setLanguage('fr');
});

test('detectLanguage privilégie la préférence puis retombe sur une langue connue', () => {
  assert.equal(detectLanguage('pt-BR'), 'pt');
  assert.equal(detectLanguage('xx'), detectLanguage('xx')); // stable
  assert.ok(availableLanguages().some((l) => l.code === 'ar' && l.dir === 'rtl'));
});

test('onLanguageChange notifie les abonnés', () => {
  let seen = null;
  const off = onLanguageChange((l) => (seen = l));
  setLanguage('de');
  assert.equal(seen, 'de');
  assert.equal(getLanguage(), 'de');
  off();
  setLanguage('fr');
  assert.equal(seen, 'de'); // désabonné : plus de notification
});

/* -------------------------------------------------------------------------- */
/* Accès payant                                                               */
/* -------------------------------------------------------------------------- */

/** Paire de démonstration, indépendante de la clé de PRODUCTION de license.js.
 *  Les tests épinglent la clé publique de démo pour rester autonomes. */
const DEMO_PRIVATE_PKCS8 =
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggjjnHEQiw24/qP6dC7dbNBcziauvrjHsAYrGXo1GewGhRANCAASj7J1oU3Duvg8SFmUBWHeZvS5TCOQbgmuTlgZOts+jdsn1H1hYvrouVuIEG9kD0JyTRZZnfCILx9ex0O14k5NV';
const DEMO_PUBLIC_SPKI =
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEo+ydaFNw7r4PEhZlAVh3mb0uUwjkG4Jrk5YGTrbPo3bJ9R9YWL66LlbiBBvZA9Cck0WWZ3wiC8fXsdDteJOTVQ==';
LICENSE_CONFIG.publicKeySpki = DEMO_PUBLIC_SPKI;

function b64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Fabrique un code d'accès signé, comme le ferait le serveur du vendeur. */
function makeCode(payload) {
  const payloadPart = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const key = createPrivateKey({
    key: Buffer.from(DEMO_PRIVATE_PKCS8, 'base64'),
    format: 'der',
    type: 'pkcs8',
  });
  const sig = sign('sha256', Buffer.from(payloadPart, 'utf8'), { key, dsaEncoding: 'ieee-p1363' });
  return `${payloadPart}.${b64url(sig)}`;
}

test('un code signé valide est accepté ; un code falsifié est rejeté', async () => {
  const future = Math.floor(Date.now() / 1000) + 3600 * 24 * 30;
  const code = makeCode({ plan: 'annuel', exp: future, id: 'CLIENT-1' });

  const res = await verifyCodeSignature(code);
  assert.equal(res.ok, true, res.error);
  assert.equal(res.payload.plan, 'annuel');

  // Falsification de la charge utile : signature invalide.
  const [, sig] = code.split('.');
  const forgedPayload = b64url(Buffer.from(JSON.stringify({ plan: 'annuel', exp: future, id: 'PIRATE' })));
  const forged = `${forgedPayload}.${sig}`;
  const bad = await verifyCodeSignature(forged);
  assert.equal(bad.ok, false);

  assert.equal((await verifyCodeSignature('nimportequoi')).ok, false);
});

test('redeemCode active l’abonnement et débloque l’accès', async () => {
  const future = Math.floor(Date.now() / 1000) + 3600 * 24 * 365;
  const code = makeCode({ plan: 'annuel', exp: future, id: 'CLIENT-2' });

  const before = await getEntitlement();
  assert.ok(['trial', 'locked'].includes(before.status));

  const r = await redeemCode(code);
  assert.equal(r.ok, true, r.error);

  const after = await getEntitlement();
  assert.equal(after.status, 'active');
  assert.equal(after.plan, 'annuel');
  assert.equal(await hasAccess(), true);
});

test('un code expiré est refusé', async () => {
  const past = Math.floor(Date.now() / 1000) - 10;
  const code = makeCode({ plan: 'mensuel', exp: past, id: 'CLIENT-3' });
  const r = await redeemCode(code);
  assert.equal(r.ok, false);
  assert.match(r.error, /expir/i);
});

test('le compteur d’essais gratuits fonctionne', async () => {
  // Repartir d'un état neuf : le magasin mémoire est partagé, on force le compteur.
  const { put } = await import('../plagiat/js/core/store.js');
  // On teste le mécanisme d'essai indépendamment de la config de production
  // (où freeTrials vaut 0 : première utilisation payante).
  const savedFree = LICENSE_CONFIG.freeTrials;
  LICENSE_CONFIG.freeTrials = 2;
  await put('settings', 'entitlement', { trialUsed: 0 });
  const start = await getEntitlement();
  assert.equal(start.status, 'trial');
  assert.equal(start.trialLeft, 2);
  await consumeTrial();
  const next = await getEntitlement();
  assert.equal(next.trialUsed, 1);
  LICENSE_CONFIG.freeTrials = savedFree;
});

test('sans essai gratuit (freeTrials 0), la première utilisation est verrouillée', async () => {
  const { put } = await import('../plagiat/js/core/store.js');
  const savedFree = LICENSE_CONFIG.freeTrials;
  LICENSE_CONFIG.freeTrials = 0;
  await put('settings', 'entitlement', { trialUsed: 0 });
  const e = await getEntitlement();
  assert.equal(e.status, 'locked');
  assert.equal(await hasAccess(), false);
  LICENSE_CONFIG.freeTrials = savedFree;
});

test('checkoutUrl compose l’URL du prestataire', () => {
  const saved = LICENSE_CONFIG.checkout.stripe;
  LICENSE_CONFIG.checkout.stripe = 'https://buy.stripe.com/test?plan={plan}';
  assert.equal(checkoutUrl('stripe', 'annuel'), 'https://buy.stripe.com/test?plan=annuel');
  assert.equal(checkoutUrl('paypal', 'annuel'), ''); // non configuré
  LICENSE_CONFIG.checkout.stripe = saved;
});
