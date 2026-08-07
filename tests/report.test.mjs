import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32 as zlibCrc32 } from 'node:zlib';

import { createZip, crc32 } from '../plagiat/js/core/zip-writer.js';
import { ZipArchive } from '../plagiat/js/core/zip-reader.js';
import { DocxBuilder, escapeXml } from '../plagiat/js/core/docx-writer.js';
import { readDocx } from '../plagiat/js/core/docx-reader.js';
import {
  buildSegments,
  renderReportHtml,
  buildReportDocx,
  reportToJson,
  summarize,
  escapeHtml,
  gaugeSvg,
  formatDuration,
  domainOf,
} from '../plagiat/js/core/report.js';
import { analyzeDocument } from '../plagiat/js/core/pipeline.js';
import { DEFAULT_SETTINGS } from '../plagiat/js/core/store.js';

const encoder = new TextEncoder();

test('crc32 concorde avec zlib', () => {
  for (const value of ['', 'a', 'Le théorème de Pythagore', 'x'.repeat(10000)]) {
    const bytes = encoder.encode(value);
    assert.equal(crc32(bytes), zlibCrc32(Buffer.from(bytes)) >>> 0, `crc de « ${value.slice(0, 12)} »`);
  }
});

test('createZip produit une archive relisible', async () => {
  const blob = await createZip([
    { name: 'hello.txt', data: 'Bonjour le monde' },
    { name: 'dossier/gros.txt', data: 'répétition '.repeat(2000) },
    { name: 'binaire.bin', data: new Uint8Array([0, 1, 2, 250, 255]) },
  ]);
  const zip = await ZipArchive.open(blob);
  assert.deepEqual(zip.list().sort(), ['binaire.bin', 'dossier/gros.txt', 'hello.txt']);
  assert.equal(await zip.readText('hello.txt'), 'Bonjour le monde');
  assert.equal(await zip.readText('dossier/gros.txt'), 'répétition '.repeat(2000));
  assert.deepEqual(
    Array.from(await zip.read('binaire.bin')),
    [0, 1, 2, 250, 255],
  );
});

test('escapeXml neutralise les caractères interdits', () => {
  assert.equal(escapeXml('a < b & c > d'), 'a &lt; b &amp; c &gt; d');
  assert.equal(escapeXml('guillemet " et \''), 'guillemet &quot; et &apos;');
  assert.equal(escapeXml('avec\u0000contrôle'), 'aveccontrôle');
});

test('DocxBuilder produit un .docx que le lecteur relit correctement', async () => {
  const builder = new DocxBuilder({ title: 'Test', creator: 'Élite' });
  builder.heading('Titre principal', 1);
  builder.paragraph('Un paragraphe simple avec des accents : é à ù.');
  builder.paragraph([
    { text: 'Texte ', bold: true },
    { text: 'surligné', shade: 'FDE2E1' },
    { text: ' et ' },
    { text: 'un lien', href: 'https://exemple.org/page' },
  ]);
  builder.table([
    ['Colonne A', 'Colonne B'],
    ['Valeur 1', 'Valeur 2'],
  ]);
  builder.pageBreak();
  builder.heading('Seconde partie', 2);
  builder.paragraph('Contenu final < avec & caractères spéciaux >.');

  const blob = await builder.toBlob();
  assert.ok(blob.size > 800);
  assert.equal(
    blob.type,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );

  const doc = await readDocx(blob);
  assert.match(doc.text, /Titre principal/);
  assert.match(doc.text, /accents : é à ù/);
  assert.match(doc.text, /Texte surligné et un lien/);
  assert.match(doc.text, /Colonne A/);
  assert.match(doc.text, /Valeur 2/);
  assert.match(doc.text, /caractères spéciaux/);
  assert.equal(doc.meta.title, 'Test');
  assert.equal(doc.meta.creator, 'Élite');

  const heading = doc.paragraphs.find((p) => p.text === 'Titre principal');
  assert.equal(heading.kind, 'heading');
  assert.equal(heading.level, 1);
  assert.ok(doc.paragraphs.some((p) => p.kind === 'table'));
});

test('buildSegments attribue chaque caractère au passage le plus grave', () => {
  const text = 'AAAABBBBCCCCDDDD';
  const { segments } = buildSegments(text, [
    { charStart: 0, charEnd: 8, type: 'paraphrase', similarity: 0.5, sourceKey: 'S1' },
    { charStart: 4, charEnd: 12, type: 'identique', similarity: 1, sourceKey: 'S2' },
  ]);
  assert.deepEqual(
    segments.map((s) => [s.text, s.type, s.sourceKey]),
    [
      ['AAAA', 'paraphrase', 'S1'],
      ['BBBBCCCC', 'identique', 'S2'],
      ['DDDD', null, null],
    ],
  );
  // Le texte reste intégralement restitué.
  assert.equal(segments.map((s) => s.text).join(''), text);
});

test('buildSegments gère un document sans correspondance et la troncature', () => {
  const plain = buildSegments('texte simple', []);
  assert.equal(plain.segments.length, 1);
  assert.equal(plain.truncated, false);

  const cut = buildSegments('0123456789', [], { maxChars: 4 });
  assert.equal(cut.segments[0].text, '0123');
  assert.equal(cut.truncated, true);
});

test('escapeHtml, gaugeSvg, formatDuration, domainOf', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  const svg = gaugeSvg(42, '#c0392b', 'Taux');
  assert.match(svg, /<svg/);
  assert.match(svg, />42</);
  assert.match(gaugeSvg(250, '#000', 'x'), />100</, 'valeur bornée à 100');
  assert.equal(formatDuration(4500), '5 s');
  assert.equal(formatDuration(125000), '2 min 05 s');
  assert.equal(domainOf('https://www.exemple.org/page'), 'exemple.org');
  assert.equal(domainOf('pas-une-url'), '');
});

/** Rapport réaliste produit par le pipeline, réutilisé par plusieurs tests. */
async function makeReport() {
  const SOURCE =
    "La topologie générale étudie les propriétés des espaces qui demeurent " +
    "inchangées sous l'effet des déformations continues. Un espace topologique est " +
    "un ensemble muni d'une famille de parties appelées ouverts.";
  const docText =
    "Ce mémoire présente une réflexion personnelle sur la gestion de l'eau dans la vallée.\n" +
    SOURCE +
    "\nLa conclusion revient sur les apports méthodologiques de ce travail de terrain.";
  return analyzeDocument(
    { text: docText, name: 'memoire.docx', corpus: [{ name: 'cours.docx', text: SOURCE }] },
    { ...DEFAULT_SETTINGS, providers: [], cacheEnabled: false },
  );
}

test('renderReportHtml produit un document autonome et sûr', async () => {
  const report = await makeReport();
  report.document.name = '<script>alert(1)</script>.docx';
  const html = renderReportHtml(report);

  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<title>Rapport de plagiat/);
  assert.match(html, /Taux de similitude net|similitude nette|de similitude/);
  assert.match(html, /cours\.docx/, 'la source locale figure dans le tableau');
  assert.match(html, /topologi/, 'le texte annoté est présent');
  assert.match(html, /<mark /, 'les passages sont surlignés');
  assert.match(html, /Méthodologie et paramètres/);

  // Aucune ressource externe, et pas d'injection possible via le nom du fichier.
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert/);
  assert.doesNotMatch(html, /src="https?:\/\//);
  assert.doesNotMatch(html, /<link[^>]+href="https?:\/\//);
});

test('buildReportDocx produit un .docx complet et relisible', async () => {
  const report = await makeReport();
  const blob = await buildReportDocx(report);
  const doc = await readDocx(blob);

  assert.match(doc.text, /Rapport d'analyse de similitude/);
  assert.match(doc.text, /Synthèse/);
  assert.match(doc.text, /Taux de similitude brut/);
  assert.match(doc.text, /Sources identifiées/);
  assert.match(doc.text, /cours\.docx/);
  assert.match(doc.text, /Détail des passages/);
  assert.match(doc.text, /Méthodologie et paramètres/);
  assert.match(doc.text, /Comment lire ce rapport/);
  assert.ok(doc.paragraphs.filter((p) => p.kind === 'heading').length >= 5);
});

test('reportToJson et summarize restent exploitables', async () => {
  const report = await makeReport();

  const light = JSON.parse(reportToJson(report));
  assert.equal(light.text, undefined, 'le texte intégral est exclu par défaut');
  assert.equal(light.id, report.id);
  assert.ok(Array.isArray(light.sources));
  assert.equal(typeof light.scores.tauxNet, 'number');
  assert.equal(typeof light.scores.perSource, 'object');

  const full = JSON.parse(reportToJson(report, { includeText: true }));
  assert.equal(typeof full.text, 'string');

  const digest = summarize(report);
  assert.equal(digest.name, 'memoire.docx');
  assert.equal(digest.tauxNet, report.scores.tauxNet);
  assert.ok(['faible', 'modere', 'eleve', 'critique'].includes(digest.niveau));
});
