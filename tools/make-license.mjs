/**
 * Génère un code d'accès signé pour l'application.
 *
 * À exécuter **côté vendeur** (sur votre machine ou votre serveur, après un
 * paiement confirmé). Le code produit est remis à l'acheteur ; il l'active
 * dans l'application, qui vérifie la signature avec la clé publique embarquée.
 *
 * Génération d'une paire de clés (à faire une fois) :
 *   node tools/make-license.mjs --cles
 *   → copiez la clé PUBLIQUE dans plagiat/js/core/license.js (publicKeySpki)
 *   → gardez la clé PRIVÉE secrète (ne la mettez jamais dans l'application).
 *
 * Génération d'un code (30 jours par défaut) :
 *   node tools/make-license.mjs --priv <CLE_PRIVEE_B64> --plan annuel --jours 365 --id CLIENT-42
 *
 * @module tools/make-license
 */

import { generateKeyPairSync, sign, createPrivateKey } from 'node:crypto';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

if (process.argv.includes('--cles')) {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pub = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const priv = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
  console.log('# Clé PUBLIQUE — à coller dans license.js (publicKeySpki) :');
  console.log(pub);
  console.log('\n# Clé PRIVÉE — À GARDER SECRÈTE (jamais dans l’application) :');
  console.log(priv);
  process.exit(0);
}

const privB64 = arg('priv');
if (!privB64) {
  console.error(
    'Usage : node tools/make-license.mjs --priv <CLE_PRIVEE_B64> [--plan annuel] [--jours 365] [--id CLIENT]\n' +
      '        node tools/make-license.mjs --cles   (pour créer une paire de clés)',
  );
  process.exit(1);
}

const plan = arg('plan', 'annuel');
const jours = parseInt(arg('jours', '30'), 10);
const id = arg('id', 'CLIENT-' + Math.floor(Date.now() / 1000));

const payload = {
  plan,
  id,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + jours * 86400,
};

const payloadPart = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
const key = createPrivateKey({ key: Buffer.from(privB64, 'base64'), format: 'der', type: 'pkcs8' });
const sig = sign('sha256', Buffer.from(payloadPart, 'utf8'), { key, dsaEncoding: 'ieee-p1363' });
const code = `${payloadPart}.${b64url(sig)}`;

console.log(`# Code d'accès — offre « ${plan} », ${jours} jours, client ${id} :`);
console.log(code);
