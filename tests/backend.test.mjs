/**
 * Tests du mini-backend de paiement FedaPay (api/_lib.js) :
 *  - la signature des codes est cryptographiquement correcte ;
 *  - un code signé par le backend est accepté par le front (clé publique) ;
 *  - creer-session et recuperer-code se comportent correctement (FedaPay mocké).
 *
 * On n'atteint jamais le vrai FedaPay : `fetch` est remplacé le temps du test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../api/_lib.js';
import { LICENSE_CONFIG } from '../plagiat/js/core/license.js';

// Paire de démonstration ; on épingle sa clé publique pour rester indépendant
// de la clé de PRODUCTION embarquée dans license.js.
const DEMO_PRIVATE_PKCS8 =
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggjjnHEQiw24/qP6dC7dbNBcziauvrjHsAYrGXo1GewGhRANCAASj7J1oU3Duvg8SFmUBWHeZvS5TCOQbgmuTlgZOts+jdsn1H1hYvrouVuIEG9kD0JyTRZZnfCILx9ex0O14k5NV';
LICENSE_CONFIG.publicKeySpki =
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEo+ydaFNw7r4PEhZlAVh3mb0uUwjkG4Jrk5YGTrbPo3bJ9R9YWL66LlbiBBvZA9Cck0WWZ3wiC8fXsdDteJOTVQ==';

function withFedapaySecret() {
  process.env.FEDAPAY_SECRET_KEY = 'sk_sandbox_fake';
  process.env.LICENSE_PRIVATE_KEY = DEMO_PRIVATE_PKCS8;
}

test('signAccessCode produit un code accepté par le front (clé publique embarquée)', async () => {
  process.env.LICENSE_PRIVATE_KEY = DEMO_PRIVATE_PKCS8;
  const code = lib.signAccessCode({ plan: 'annuel', jours: 365, id: 'TEST-1' });
  assert.match(code, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const { verifyCodeSignature } = await import('../plagiat/js/core/license.js');
  const r = await verifyCodeSignature(code);
  assert.equal(r.ok, true);
  assert.equal(r.payload.plan, 'annuel');
});

test('signAccessCode échoue proprement sans clé privée', () => {
  delete process.env.LICENSE_PRIVATE_KEY;
  assert.throws(() => lib.signAccessCode({ plan: 'annuel', jours: 30, id: 'X' }), /LICENSE_PRIVATE_KEY/);
});

test('coreCreerSession crée une transaction FedaPay et renvoie l’URL de paiement', async () => {
  withFedapaySecret();
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    if (url.endsWith('/transactions')) {
      return { ok: true, json: async () => ({ 'v1/transaction': { id: 4242, status: 'pending' } }) };
    }
    if (url.includes('/transactions/4242/token')) {
      return { ok: true, json: async () => ({ token: 'tok_abc', url: 'https://sandbox-process.fedapay.com/tok_abc' }) };
    }
    return { ok: false, json: async () => ({ message: 'unexpected' }) };
  };
  try {
    const { status, body } = await lib.coreCreerSession({ plan: 'annuel', origin: 'https://veritex-plagiat.netlify.app' });
    assert.equal(status, 200);
    assert.equal(body.url, 'https://sandbox-process.fedapay.com/tok_abc');
    assert.equal(body.transaction, '4242');
    // La transaction a bien été créée avec un montant et l'URL de retour.
    const createBody = JSON.parse(calls[0].opts.body);
    assert.equal(createBody.currency.iso, 'XOF');
    assert.equal(createBody.amount, 25000);
    assert.match(createBody.callback_url, /paiement=reussi/);
    // Le jeton de paiement a été demandé sur la bonne transaction.
    assert.match(calls[1].url, /\/transactions\/4242\/token$/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('coreCreerSession refuse une offre inconnue', async () => {
  withFedapaySecret();
  const { status, body } = await lib.coreCreerSession({ plan: 'gratuit', origin: 'https://x' });
  assert.equal(status, 400);
  assert.match(body.error, /inconnue/i);
});

test('coreRecupererCode délivre un code seulement si la transaction est approuvée', async () => {
  withFedapaySecret();
  const realFetch = globalThis.fetch;

  // 1) Transaction approuvée → code délivré.
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ 'v1/transaction': { id: 4242, status: 'approved', amount: 25000 } }),
  });
  try {
    const paid = await lib.coreRecupererCode({ transaction: '4242', plan: 'annuel' });
    assert.equal(paid.status, 200);
    assert.equal(paid.body.plan, 'annuel');
    const { verifyCodeSignature } = await import('../plagiat/js/core/license.js');
    assert.equal((await verifyCodeSignature(paid.body.code)).ok, true);

    // 2) Transaction non payée → pas de code.
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ 'v1/transaction': { id: 7, status: 'declined' } }),
    });
    const unpaid = await lib.coreRecupererCode({ transaction: '7' });
    assert.equal(unpaid.status, 402);
    assert.ok(!unpaid.body.code);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('coreRecupererCode déduit l’offre du montant si le plan est absent', async () => {
  withFedapaySecret();
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ 'v1/transaction': { id: 9, status: 'approved', amount: 3000 } }),
  });
  try {
    const r = await lib.coreRecupererCode({ transaction: '9' });
    assert.equal(r.status, 200);
    assert.equal(r.body.plan, 'mensuel');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('coreRecupererCode exige une transaction', async () => {
  const { status } = await lib.coreRecupererCode({ transaction: '' });
  assert.equal(status, 400);
});
