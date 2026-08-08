/**
 * Tests du certificat d'originalité : construction, scellement, vérification
 * d'intégrité (détection d'altération) et rendu HTML.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCertificate,
  verifyCertificate,
  renderCertificateHtml,
  canonicalJson,
  humanCode,
  sealSvg,
} from '../plagiat/js/core/certificate.js';

/** Rapport d'analyse minimal, façon pipeline. */
function fakeReport(overrides = {}) {
  return {
    id: 'RAP-20260808120000',
    generatedAt: '2026-08-08T12:00:00.000Z',
    durationMs: 4200,
    document: {
      name: 'memoire.docx',
      digest: 'a'.repeat(64),
      stats: { words: 5321, characters: 31890 },
      language: 'fr',
    },
    analysis: {
      depthLabel: 'Approfondie',
      providers: [{ name: 'Wikipédia' }, { name: 'Crossref' }],
      chunksQueried: 42,
      sourcesExamined: 120,
    },
    scores: { tauxNet: 12, tauxBrut: 18, niveau: { code: 'moderate' }, sourcesTotal: 7 },
    sources: [],
    ai: { score: 34 },
    forensics: { severity: 'low' },
    citations: { orphans: [1], uncited: [] },
    ...overrides,
  };
}

test('canonicalJson trie les clés récursivement', () => {
  const a = canonicalJson({ b: 1, a: { d: 4, c: 3 } });
  const b = canonicalJson({ a: { c: 3, d: 4 }, b: 1 });
  assert.equal(a, b);
  assert.equal(a, '{"a":{"c":3,"d":4},"b":1}');
});

test('humanCode produit un format VX-XXXX-XXXX-XXXX', () => {
  const c = humanCode('3f9a2b7c8e10ffff');
  assert.match(c, /^VX-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.equal(c, 'VX-3F9A-2B7C-8E10');
});

test('buildCertificate scelle une attestation cohérente', async () => {
  const cert = await buildCertificate(fakeReport(), { plan: 'annuel' });
  assert.equal(cert.app, 'Veritex');
  assert.equal(cert.v, 1);
  assert.equal(cert.attestation.results.originalityScore, 88); // 100 - 12
  assert.equal(cert.attestation.document.digestSha256, 'a'.repeat(64));
  assert.equal(cert.attestation.issuer.plan, 'annuel');
  assert.match(cert.certId, /^CERT-AAAAAAAA-20260808$/);
  assert.match(cert.seal, /^[0-9a-f]{64}$/); // SHA-256 hex
  assert.match(cert.code, /^VX-/);
});

test('verifyCertificate accepte un certificat intact', async () => {
  const cert = await buildCertificate(fakeReport());
  const res = await verifyCertificate(cert);
  assert.equal(res.valid, true);
  assert.equal(res.signed, false);
  assert.equal(res.attestation.results.originalityScore, 88);
});

test('verifyCertificate accepte aussi la version JSON sérialisée', async () => {
  const cert = await buildCertificate(fakeReport());
  const res = await verifyCertificate(JSON.stringify(cert));
  assert.equal(res.valid, true);
});

test('verifyCertificate détecte une altération du taux', async () => {
  const cert = await buildCertificate(fakeReport());
  // Un fraudeur gonfle son score d'originalité sans re-sceller.
  cert.attestation.results.originalityScore = 100;
  cert.attestation.results.matchRateNet = 0;
  const res = await verifyCertificate(cert);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'seal');
});

test('verifyCertificate détecte une altération du nom de document', async () => {
  const cert = await buildCertificate(fakeReport());
  cert.attestation.document.name = 'autre.docx';
  const res = await verifyCertificate(cert);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'seal');
});

test('verifyCertificate rejette un format non certificat', async () => {
  const res = await verifyCertificate('{"hello":"world"}');
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'format');
});

test('deux documents différents ont des sceaux différents', async () => {
  const a = await buildCertificate(fakeReport());
  const b = await buildCertificate(fakeReport({ document: { name: 'x.docx', digest: 'b'.repeat(64), stats: { words: 10 }, language: 'en' } }));
  assert.notEqual(a.seal, b.seal);
  assert.notEqual(a.code, b.code);
});

test('renderCertificateHtml produit un document autonome et sûr', async () => {
  const cert = await buildCertificate(fakeReport());
  const html = renderCertificateHtml(cert);
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /Certificat d(&#39;|')originalité/); // apostrophe échappée en HTML
  assert.match(html, /88%/); // score d'originalité
  assert.match(html, /VX-/); // code lisible
  assert.ok(html.includes(cert.seal)); // sceau imprimé
  // Le JSON vérifiable est intégré.
  assert.ok(html.includes('&quot;seal&quot;') || html.includes(cert.certId));
});

test('renderCertificateHtml échappe le nom de document (anti-XSS)', async () => {
  const cert = await buildCertificate(
    fakeReport({ document: { name: '<img src=x onerror=alert(1)>.docx', digest: 'c'.repeat(64), stats: { words: 5 }, language: 'fr' } }),
  );
  const html = renderCertificateHtml(cert);
  assert.ok(!html.includes('<img src=x onerror'));
  assert.ok(html.includes('&lt;img'));
});

test('sealSvg est déterministe et renvoie du SVG', () => {
  const s1 = sealSvg('3f9a2b7c8e10a1b2c3d4e5f6', 120);
  const s2 = sealSvg('3f9a2b7c8e10a1b2c3d4e5f6', 120);
  assert.equal(s1, s2);
  assert.match(s1, /^<svg /);
  assert.match(s1, /viewBox="0 0 120 120"/);
});
