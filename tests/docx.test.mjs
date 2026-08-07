import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';

import { inflateRaw } from '../plagiat/js/core/inflate.js';
import { ZipArchive } from '../plagiat/js/core/zip-reader.js';
import { readDocx, countWords, decodeXmlEntities, WordScanner } from '../plagiat/js/core/docx-reader.js';
import { fixtureBlob, makeRandom } from './helpers.mjs';

test('inflateRaw décode ce que zlib compresse (données aléatoires)', () => {
  const rnd = makeRandom(7);
  for (const size of [0, 1, 17, 1024, 65536, 300000]) {
    const src = new Uint8Array(size);
    for (let i = 0; i < size; i++) src[i] = Math.floor(rnd() * 256);
    const packed = new Uint8Array(deflateRawSync(Buffer.from(src)));
    const out = inflateRaw(packed, size);
    assert.equal(out.length, size, `taille pour ${size} octets`);
    assert.deepEqual(Buffer.from(out), Buffer.from(src));
  }
});

test('inflateRaw décode du texte très répétitif (retours arrière LZ77)', () => {
  const text = 'Le théorème de Pythagore. '.repeat(5000);
  const src = Buffer.from(text, 'utf8');
  for (const level of [0, 1, 6, 9]) {
    const packed = new Uint8Array(deflateRawSync(src, { level }));
    const out = inflateRaw(packed, src.length);
    assert.equal(Buffer.from(out).toString('utf8'), text, `niveau ${level}`);
  }
});

test('inflateRaw signale un flux tronqué au lieu de boucler', () => {
  const packed = new Uint8Array(deflateRawSync(Buffer.from('x'.repeat(5000))));
  assert.throws(() => inflateRaw(packed.subarray(0, 10)), /tronqué|invalide|sur-souscrit/);
});

test('ZipArchive lit le répertoire central (deflate et stored)', async () => {
  for (const name of ['sample.docx', 'sample-stored.docx']) {
    const zip = await ZipArchive.open(await fixtureBlob(name));
    assert.ok(zip.has('word/document.xml'), `${name} : document.xml présent`);
    assert.ok(zip.has('[Content_Types].xml'));
    const xml = await zip.readText('word/document.xml');
    assert.match(xml, /<w:document/);
    assert.match(xml, /Pythagore/);
  }
});

test('ZipArchive expose un flux décompressé', async () => {
  const zip = await ZipArchive.open(await fixtureBlob('sample.docx'));
  const stream = await zip.stream('word/document.xml');
  const reader = stream.getReader();
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
  }
  assert.ok(total > 500, 'le flux restitue le contenu complet');
});

test('ZipArchive refuse une archive invalide avec un message clair', async () => {
  await assert.rejects(
    () => ZipArchive.open(new Blob([new Uint8Array(200)])),
    /Signature ZIP introuvable/,
  );
});

test('decodeXmlEntities gère les entités nommées et numériques', () => {
  assert.equal(decodeXmlEntities('a &amp; b'), 'a & b');
  assert.equal(decodeXmlEntities('&lt;math&gt;'), '<math>');
  assert.equal(decodeXmlEntities('&#233;t&#233;'), 'été');
  assert.equal(decodeXmlEntities('&#x2264;'), '≤');
  assert.equal(decodeXmlEntities('sans entité'), 'sans entité');
  assert.equal(decodeXmlEntities('&inconnue;'), '&inconnue;');
});

test('readDocx extrait le texte, les métadonnées et les statistiques', async () => {
  const doc = await readDocx(await fixtureBlob('sample.docx'));

  assert.match(doc.text, /Introduction générale/);
  assert.match(doc.text, /théorème de Pythagore/);
  assert.match(doc.text, /Note de bas de page importante/, 'notes incluses');

  // Suivi des modifications : l'insertion est gardée, la suppression écartée.
  assert.match(doc.text, /Texte inséré/);
  assert.doesNotMatch(doc.text, /TEXTE SUPPRIME/);

  // Les codes de champ ne doivent pas polluer le texte.
  assert.doesNotMatch(doc.text, /MERGEFORMAT/);
  assert.match(doc.text, /Page visible/);

  // AlternateContent : on garde le Choice, pas le Fallback (sinon doublon).
  assert.match(doc.text, /Choix moderne/);
  assert.doesNotMatch(doc.text, /REPLI ANCIEN/);

  // Sauts de ligne et tableaux.
  assert.match(doc.text, /Ligne un\nLigne deux/);
  assert.match(doc.text, /Cellule A/);
  assert.match(doc.text, /Cellule B/);

  // Entités.
  assert.match(doc.text, /Symboles & entités : <math> ≤ 5 — ok/);

  assert.equal(doc.meta.title, 'Mémoire de recherche');
  assert.equal(doc.meta.creator, 'Florent Ndiaye');
  assert.equal(doc.stats.pages, 3);
  assert.equal(doc.stats.pagesEstimated, false);
  assert.ok(doc.stats.words > 40);
  assert.equal(doc.truncated, false);
});

test('readDocx renseigne des décalages de paragraphe exacts', async () => {
  const doc = await readDocx(await fixtureBlob('sample.docx'));
  for (const p of doc.paragraphs) {
    assert.equal(
      doc.text.slice(p.start, p.end),
      p.text,
      `décalages du paragraphe « ${p.text.slice(0, 30)} »`,
    );
  }
  const heading = doc.paragraphs.find((p) => p.kind === 'heading');
  assert.ok(heading, 'le style Titre1 est reconnu');
  assert.equal(heading.level, 1);
  assert.ok(doc.paragraphs.some((p) => p.kind === 'table'), 'cellules marquées');
  assert.ok(doc.paragraphs.some((p) => p.part === 'footnotes'));
});

test('readDocx traite un document volumineux', async () => {
  const doc = await readDocx(await fixtureBlob('big.docx'));
  assert.equal(doc.paragraphs.length, 3000);
  assert.ok(doc.stats.words > 110000, `mots comptés : ${doc.stats.words}`);
  assert.equal(doc.stats.pagesEstimated, true);
  assert.ok(doc.stats.pages > 300);
  const last = doc.paragraphs[doc.paragraphs.length - 1];
  assert.equal(doc.text.slice(last.start, last.end), last.text);
});

test('readDocx rejette un .doc binaire avec une consigne utile', async () => {
  const ole = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
  await assert.rejects(() => readDocx(new Blob([ole])), /Word 97-2003/);
});

test('WordScanner est insensible au découpage du flux', async () => {
  const xml =
    '<w:document><w:body>' +
    '<w:p><w:pPr><w:pStyle w:val="Titre2"/></w:pPr><w:r><w:t xml:space="preserve">Chapitre </w:t></w:r><w:r><w:t>premier</w:t></w:r></w:p>' +
    '<w:p><w:r><w:t>Deuxième paragraphe &#233;crit ici.</w:t></w:r></w:p>' +
    '</w:body></w:document>';

  const reference = [];
  const whole = new WordScanner((p) => reference.push(p));
  whole.write(xml);
  whole.end();
  assert.deepEqual(
    reference.map((p) => p.text),
    ['Chapitre premier', 'Deuxième paragraphe écrit ici.'],
  );
  assert.equal(reference[0].kind, 'heading');
  assert.equal(reference[0].level, 2);

  // Le même XML, coupé à chaque position possible, doit donner le même résultat.
  for (let cut = 1; cut < xml.length; cut++) {
    const got = [];
    const scanner = new WordScanner((p) => got.push(p));
    scanner.write(xml.slice(0, cut));
    scanner.write(xml.slice(cut));
    scanner.end();
    assert.deepEqual(
      got.map((p) => p.text),
      reference.map((p) => p.text),
      `coupure à ${cut}`,
    );
  }
});

test('countWords compte les mots composés comme un seul mot', () => {
  // « peut-être » et « qu'il » comptent chacun pour un mot, comme dans Word.
  assert.equal(countWords("peut-être qu'il viendra"), 3);
  assert.equal(countWords(''), 0);
  assert.equal(countWords('123 456,78 €'), 3);
});
