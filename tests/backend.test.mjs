/**
 * Tests du mini-backend de paiement (api/_lib.js) :
 *  - la signature des codes est cryptographiquement correcte ;
 *  - un code signé par le backend est accepté par le front (clé publique) ;
 *  - creer-session et recuperer-code se comportent correctement (Stripe mocké).
 *
 * On n'atteint jamais le vrai Stripe : `fetch` est remplacé le temps du test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../api/_lib.js';

// Clé privée de démonstration dont la publique est embarquée dans license.js.
const DEMO_PRIVATE_PKCS8 =
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggjjnHEQiw24/qP6dC7dbNBcziauvrjHsAYrGXo1GewGhRANCAASj7J1oU3Duvg8SFmUBWHeZvS5TCOQbgmuTlgZOts+jdsn1H1hYvrouVuIEG9kD0JyTRZZnfCILx9ex0O14k5NV';

test('signAccessCode produit un code accepté par le front (clé publique embarquée)', async () => {
  process.env.LICENSE_PRIVATE_KEY = DEMO_PRIVATE_PKCS8;
  const code = lib.signAccessCode({ plan: 'annuel', jours: 365, id: 'TEST-1' });
  assert.match(code, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

  // Le front vérifie avec la clé PUBLIQUE de license.js — doit accepter.
  const { verifyCodeSignature } = await import('../plagiat/js/core/license.js');
  const r = await verifyCodeSignature(code);
  assert.equal(r.ok, true);
  assert.equal(r.payload.plan, 'annuel');
});

test('signAccessCode échoue proprement sans clé privée', () => {
  delete process.env.LICENSE_PRIVATE_KEY;
  assert.throws(() => lib.signAccessCode({ plan: 'annuel', jours: 30, id: 'X' }), /LICENSE_PRIVATE_KEY/);
});

test('coreCreerSession appelle Stripe et renvoie l’URL de paiement', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  process.env.STRIPE_PRICE_ANNUEL = 'price_annuel_123';
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return {
      ok: true,
      json: async () => ({ id: 'cs_test_1', url: 'https://checkout.stripe.com/pay/cs_test_1' }),
    };
  };
  try {
    const { status, body } = await lib.coreCreerSession({ plan: 'annuel', origin: 'https://veritex.app' });
    assert.equal(status, 200);
    assert.equal(body.url, 'https://checkout.stripe.com/pay/cs_test_1');
    // A bien tapé l'API Stripe avec le bon prix et une URL de retour.
    assert.match(calls[0].url, /checkout\/sessions/);
    assert.match(calls[0].opts.body, /price_annuel_123/);
    assert.match(decodeURIComponent(calls[0].opts.body), /paiement=reussi/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('coreCreerSession refuse une offre sans prix configuré', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  delete process.env.STRIPE_PRICE_MENSUEL;
  const { status, body } = await lib.coreCreerSession({ plan: 'mensuel', origin: 'https://veritex.app' });
  assert.equal(status, 400);
  assert.match(body.error, /STRIPE_PRICE_MENSUEL/);
});

test('coreRecupererCode délivre un code seulement si la session est payée', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  process.env.LICENSE_PRIVATE_KEY = DEMO_PRIVATE_PKCS8;
  const realFetch = globalThis.fetch;

  // 1) Session payée → code délivré.
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ id: 'cs_1', payment_status: 'paid', metadata: { plan: 'annuel' } }),
  });
  try {
    const paid = await lib.coreRecupererCode({ session_id: 'cs_1' });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.plan, 'annuel');
    const { verifyCodeSignature } = await import('../plagiat/js/core/license.js');
    assert.equal((await verifyCodeSignature(paid.body.code)).ok, true);

    // 2) Session impayée → pas de code.
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ id: 'cs_2', payment_status: 'unpaid' }),
    });
    const unpaid = await lib.coreRecupererCode({ session_id: 'cs_2' });
    assert.equal(unpaid.status, 402);
    assert.ok(!unpaid.body.code);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('coreRecupererCode exige un session_id', async () => {
  const { status } = await lib.coreRecupererCode({ session_id: '' });
  assert.equal(status, 400);
});
