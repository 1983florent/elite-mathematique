import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeDocument,
  buildChunks,
  selectChunks,
  chunkQueries,
  findBibliographySection,
  findQuotedRanges,
  charRangeToTokens,
  computeScores,
  canonicalUrl,
  riskLevel,
  DEPTH_PROFILES,
} from '../plagiat/js/core/pipeline.js';
import { PROVIDERS } from '../plagiat/js/core/providers.js';
import { tokenize } from '../plagiat/js/core/text.js';
import { DEFAULT_SETTINGS } from '../plagiat/js/core/store.js';
import { fixtureBlob } from './helpers.mjs';

/** Source « web » simulée, servie par un fournisseur de test. */
const FAKE_SOURCE = {
  title: 'Topologie générale — cours',
  url: 'https://exemple.org/topologie',
  text:
    "La topologie générale étudie les propriétés des espaces qui demeurent " +
    "inchangées sous l'effet des déformations continues. Un espace topologique est " +
    "un ensemble muni d'une famille de parties appelées ouverts, stable par union " +
    "quelconque et par intersection finie. La notion de continuité se reformule " +
    "alors sans recourir à la distance.",
};

/** Enregistre un fournisseur de test, puis le retire. */
function withFakeProvider(fn) {
  const provider = {
    id: 'test-provider',
    name: 'Fournisseur de test',
    group: 'ouvert',
    kind: 'web',
    needsKey: [],
    calls: 0,
    async search() {
      provider.calls++;
      return [
        {
          id: 'test:1',
          title: FAKE_SOURCE.title,
          url: FAKE_SOURCE.url,
          snippet: FAKE_SOURCE.text.slice(0, 120),
          text: FAKE_SOURCE.text,
          provider: 'test-provider',
          providerName: 'Fournisseur de test',
          kind: 'web',
        },
      ];
    },
  };
  PROVIDERS.push(provider);
  return Promise.resolve(fn(provider)).finally(() => {
    const i = PROVIDERS.indexOf(provider);
    if (i >= 0) PROVIDERS.splice(i, 1);
  });
}

const PERSONNEL =
  "Ce mémoire retrace une expérience de terrain menée durant deux saisons dans la " +
  "vallée du fleuve. Les entretiens conduits auprès des maraîchers ont nourri une " +
  "réflexion strictement personnelle sur la gestion de l'eau.";

test('canonicalUrl normalise pour la déduplication', () => {
  assert.equal(
    canonicalUrl('https://Exemple.org/page/?utm_source=x#section'),
    'https://exemple.org/page',
  );
  assert.equal(canonicalUrl('pas une url'), 'pas une url');
});

test('riskLevel qualifie chaque palier', () => {
  assert.equal(riskLevel(2).code, 'faible');
  assert.equal(riskLevel(10).code, 'modere');
  assert.equal(riskLevel(20).code, 'eleve');
  assert.equal(riskLevel(55).code, 'critique');
});

test('buildChunks découpe sur les phrases et couvre le texte', () => {
  const text = Array.from(
    { length: 30 },
    (_, i) => `Phrase numéro ${i} contenant un vocabulaire suffisamment varié pour être interrogée.`,
  ).join(' ');
  const tokens = tokenize(text);
  const chunks = buildChunks(text, tokens);
  assert.ok(chunks.length > 5);
  for (const c of chunks) {
    assert.ok(c.tokenEnd > c.tokenStart);
    assert.ok(c.words >= 12);
    assert.ok(c.score > 0);
  }
  // Les blocs se suivent sans se chevaucher.
  for (let i = 1; i < chunks.length; i++) {
    assert.ok(chunks[i].tokenStart >= chunks[i - 1].tokenEnd);
  }
});

test('selectChunks échantillonne uniformément sur tout le document', () => {
  const chunks = Array.from({ length: 500 }, (_, i) => ({
    start: i * 100,
    end: i * 100 + 90,
    tokenStart: i * 20,
    tokenEnd: i * 20 + 18,
    words: 18,
    score: (i % 7) + 1,
  }));
  const selected = selectChunks(chunks, 25);
  assert.equal(selected.length, 25);
  // Premier et dernier cinquième du document représentés.
  assert.ok(selected[0].tokenStart < 500);
  assert.ok(selected.at(-1).tokenStart > 9000);
  // Budget supérieur au nombre de blocs : tout est retenu.
  assert.equal(selectChunks(chunks, 10_000).length, 500);
  assert.deepEqual(selectChunks([], 10), []);
});

test('chunkQueries produit une phrase exacte et des mots-clés', () => {
  const text =
    "Le théorème de Pythagore établit une relation fondamentale entre les côtés d'un triangle rectangle.";
  const tokens = tokenize(text);
  const chunk = { start: 0, end: text.length, tokenStart: 0, tokenEnd: tokens.count };
  const q = chunkQueries(text, tokens, chunk);
  assert.match(q.phrase, /théorème de Pythagore/);
  assert.ok(q.phrase.length <= 240);
  assert.match(q.keywords, /Pythagore/);
  assert.doesNotMatch(q.keywords, /\ble\b/);
});

test('findBibliographySection localise la section finale', () => {
  const paragraphs = [
    { text: 'Introduction', start: 0, end: 12, kind: 'heading', level: 1 },
    { text: 'Contenu du mémoire.', start: 13, end: 32, kind: 'body', level: 0 },
    { text: 'Bibliographie', start: 33, end: 46, kind: 'heading', level: 1 },
    { text: 'DUPONT, J. (2019). Topologie.', start: 47, end: 76, kind: 'body', level: 0 },
  ];
  const section = findBibliographySection(paragraphs, 76);
  assert.ok(section);
  assert.equal(section.start, 33);
  assert.equal(section.end, 76);
  assert.equal(findBibliographySection(paragraphs.slice(0, 2), 32), null);
});

test('findQuotedRanges repère les citations longues', () => {
  const text =
    'Il écrit : « la topologie est la géométrie du caoutchouc élastique » puis conclut. ' +
    'Un « mot » court est ignoré.';
  const ranges = findQuotedRanges(text);
  assert.equal(ranges.length, 1);
  assert.match(text.slice(ranges[0].start, ranges[0].end), /caoutchouc/);
});

test('charRangeToTokens convertit précisément les bornes', () => {
  const text = 'alpha beta gamma delta epsilon';
  const tokens = tokenize(text);
  const range = charRangeToTokens(tokens, text.indexOf('beta'), text.indexOf('delta'));
  assert.equal(range.start, 1);
  assert.equal(range.end, 3);
});

test('computeScores : document sans correspondance = 100 % original', () => {
  const tokens = tokenize(PERSONNEL);
  const scores = computeScores({
    tokens,
    passages: [],
    sourceReports: [],
    excludedRanges: [],
  });
  assert.equal(scores.tauxBrut, 0);
  assert.equal(scores.tauxNet, 0);
  assert.equal(scores.originalite, 100);
  assert.equal(scores.niveau.code, 'faible');
  assert.equal(scores.repartition.original, 100);
});

test('computeScores exclut citations et bibliographie du taux net', () => {
  const tokens = tokenize(Array.from({ length: 100 }, (_, i) => `mot${i}`).join(' '));
  const passages = [{ qStart: 0, qEnd: 40, similarity: 1, type: 'identique' }];
  const scores = computeScores({
    tokens,
    passages,
    sourceReports: [{ key: 'S1', passages }],
    excludedRanges: [{ start: 0, end: 20 }],
  });
  assert.equal(scores.tauxBrut, 40);
  // 20 mots restants sur 80 analysables.
  assert.equal(scores.tauxNet, 25);
  assert.equal(scores.motsExclus, 20);
  assert.equal(scores.perSource.get('S1'), 40);
  assert.equal(scores.repartition.identique, 40);
});

test('analyse complète : le passage copié est détecté et attribué', async () => {
  await withFakeProvider(async (provider) => {
    const docText = [
      PERSONNEL,
      FAKE_SOURCE.text,
      "La suite du mémoire développe une méthodologie originale d'observation participante.",
    ].join('\n');

    const progress = [];
    const report = await analyzeDocument(
      { text: docText, name: 'memoire.docx' },
      { ...DEFAULT_SETTINGS, providers: ['test-provider'], depth: 'rapide', cacheEnabled: false },
      { onProgress: (e) => progress.push(e) },
    );

    assert.ok(provider.calls > 0, 'le moteur a été interrogé');
    assert.equal(report.sources.length, 1);
    const source = report.sources[0];
    assert.equal(source.title, FAKE_SOURCE.title);
    assert.ok(source.percent > 20, `part attribuée : ${source.percent} %`);
    assert.ok(source.passages.length >= 1);
    assert.match(source.passages[0].documentText, /topologi/);
    assert.match(source.passages[0].sourceText, /topologi/);

    assert.ok(report.scores.tauxBrut > 25, `taux brut ${report.scores.tauxBrut}`);
    assert.ok(report.scores.tauxBrut < 80);
    assert.equal(
      report.scores.originalite,
      Math.round((100 - report.scores.tauxNet) * 10) / 10,
    );
    assert.ok(report.scores.repartition.identique > 0);

    // Progression : monotone et complète.
    assert.ok(progress.length > 3);
    let last = -1;
    for (const p of progress) {
      assert.ok(p.ratio >= last - 1e-9, `progression non monotone : ${p.ratio} < ${last}`);
      last = p.ratio;
    }
    assert.ok(last >= 0.99);

    assert.equal(report.analysis.providers[0].id, 'test-provider');
    assert.ok(report.analysis.chunksQueried > 0);
    assert.ok(report.analysis.chunksQueried <= DEPTH_PROFILES.rapide.maxQueries);
    assert.ok(report.id.startsWith('RAP-'));
    assert.equal(report.errors.length, 0);
  });
});

test('analyse sans moteur : texte original, avertissement explicite', async () => {
  const report = await analyzeDocument(
    { text: PERSONNEL, name: 'note.txt' },
    { ...DEFAULT_SETTINGS, providers: [], cacheEnabled: false },
  );
  assert.equal(report.scores.tauxBrut, 0);
  assert.equal(report.sources.length, 0);
  assert.ok(report.warnings.some((w) => /Aucun moteur actif/.test(w)));
});

test('corpus local : comparaison hors ligne fonctionnelle', async () => {
  const docText = `${PERSONNEL}\n${FAKE_SOURCE.text}`;
  const report = await analyzeDocument(
    {
      text: docText,
      name: 'memoire.docx',
      corpus: [{ name: 'cours-topologie.docx', text: FAKE_SOURCE.text }],
    },
    { ...DEFAULT_SETTINGS, providers: [], cacheEnabled: false },
  );
  assert.equal(report.sources.length, 1);
  assert.equal(report.sources[0].title, 'cours-topologie.docx');
  assert.equal(report.sources[0].provider, 'corpus');
  assert.ok(report.scores.tauxBrut > 25);
  assert.equal(report.analysis.corpusDocuments, 1);
});

test('analyse d’un vrai fichier .docx de bout en bout', async () => {
  const report = await analyzeDocument(
    { file: await fixtureBlob('sample.docx'), name: 'sample.docx' },
    { ...DEFAULT_SETTINGS, providers: [], cacheEnabled: false },
  );
  assert.equal(report.document.meta.title, 'Mémoire de recherche');
  assert.equal(report.document.stats.pages, 3);
  assert.match(report.text, /Pythagore/);
  assert.ok(report.document.digest.length === 64, 'empreinte SHA-256 calculée');
  assert.equal(report.scores.tauxBrut, 0);
});

test("l'annulation interrompt l'analyse", async () => {
  await withFakeProvider(async () => {
    const controller = new AbortController();
    const docText = Array.from(
      { length: 200 },
      (_, i) => `Paragraphe ${i} du document avec un contenu suffisamment varié pour être découpé.`,
    ).join('\n');
    const promise = analyzeDocument(
      { text: docText, name: 'long.docx' },
      { ...DEFAULT_SETTINGS, providers: ['test-provider'], depth: 'approfondi', cacheEnabled: false },
      { signal: controller.signal },
    );
    controller.abort();
    await assert.rejects(promise, /interrompue/);
  });
});

test('les erreurs de moteur sont consignées sans bloquer l’analyse', async () => {
  const broken = {
    id: 'moteur-casse',
    name: 'Moteur en panne',
    group: 'ouvert',
    kind: 'web',
    needsKey: [],
    async search() {
      throw new Error('service indisponible');
    },
  };
  PROVIDERS.push(broken);
  try {
    const report = await analyzeDocument(
      { text: PERSONNEL, name: 'note.txt' },
      { ...DEFAULT_SETTINGS, providers: ['moteur-casse'], depth: 'rapide', cacheEnabled: false },
    );
    assert.ok(report.errors.length >= 1);
    assert.match(report.errors[0].message, /service indisponible/);
    assert.equal(report.scores.tauxBrut, 0);
  } finally {
    PROVIDERS.splice(PROVIDERS.indexOf(broken), 1);
  }
});
