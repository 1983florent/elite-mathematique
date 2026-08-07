import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenize, spanText } from '../plagiat/js/core/text.js';
import {
  buildDocumentIndex,
  matchSource,
  findInternalDuplication,
  unionCoverage,
  subtractRanges,
  attributeTokens,
  radixSortPairs,
  lcsLength,
  multisetDice,
  alignmentSimilarity,
  classify,
  mergeMatches,
} from '../plagiat/js/core/matcher.js';
import { makeRandom } from './helpers.mjs';

/** Texte original servant de « source » dans les scénarios. */
const SOURCE_TEXT = `
La topologie générale étudie les propriétés des espaces qui demeurent
inchangées sous l'effet des déformations continues. Un espace topologique est
un ensemble muni d'une famille de parties appelées ouverts, stable par union
quelconque et par intersection finie. La notion de continuité se reformule
alors sans recourir à la distance, ce qui étend considérablement le champ
d'application de l'analyse classique. Les espaces métriques constituent un cas
particulier fondamental, où la topologie découle directement d'une distance.
`.trim();

const FILLER = `
Cette section présente un raisonnement entièrement personnel sur la manière
dont un étudiant peut aborder son mémoire de fin de cycle. Nous insistons sur
l'importance du plan détaillé, de la relecture croisée et du calendrier de
rédaction. Rien de ce paragraphe ne provient d'un ouvrage extérieur.
`.trim();

test('radixSortPairs trie les paires par clé croissante', () => {
  const rnd = makeRandom(3);
  const n = 5000;
  const keys = new Uint32Array(n);
  const values = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    keys[i] = Math.floor(rnd() * 0xffffffff) >>> 0;
    values[i] = i;
  }
  const expected = Array.from(keys)
    .map((k, i) => [k, i])
    .sort((a, b) => a[0] - b[0]);
  const sorted = radixSortPairs(keys.slice(), values.slice());
  for (let i = 0; i < n; i++) {
    assert.equal(sorted.keys[i], expected[i][0], `clé ${i}`);
    assert.equal(sorted.values[i], expected[i][1], `valeur ${i}`);
  }
});

test('lcsLength et multisetDice se comportent comme attendu', () => {
  const a = Uint32Array.from([1, 2, 3, 4, 5]);
  const b = Uint32Array.from([1, 9, 3, 9, 5]);
  assert.equal(lcsLength(a, a), 5);
  assert.equal(lcsLength(a, b), 3);
  assert.equal(lcsLength(a, Uint32Array.from([])), 0);
  assert.equal(alignmentSimilarity(a, a), 1);
  assert.equal(multisetDice(a, a), 1);
  assert.ok(multisetDice(a, b) > 0.5 && multisetDice(a, b) < 1);
});

test('classify range les similarités dans les bons types', () => {
  assert.equal(classify(0.99).type, 'identique');
  assert.equal(classify(0.7).type, 'modifie');
  assert.equal(classify(0.4).type, 'paraphrase');
});

test('copie littérale : le passage est retrouvé avec une similarité maximale', () => {
  const copied = SOURCE_TEXT.split('\n').slice(0, 4).join('\n');
  const docText = `${FILLER}\n${copied}\n${FILLER}`;
  const docTokens = tokenize(docText);
  const index = buildDocumentIndex(docTokens);
  const matches = matchSource(index, tokenize(SOURCE_TEXT));

  assert.ok(matches.length >= 1, 'au moins un passage détecté');
  const best = matches.reduce((a, b) => (b.qEnd - b.qStart > a.qEnd - a.qStart ? b : a));
  assert.equal(best.type, 'identique');
  assert.ok(best.similarity > 0.9, `similarité ${best.similarity}`);

  const found = spanText(docTokens, best.qStart, best.qEnd);
  assert.match(found, /topologie générale/);
  assert.match(found, /déformations continues/);

  const { covered } = unionCoverage(matches);
  const rate = covered / docTokens.count;
  assert.ok(rate > 0.25 && rate < 0.75, `taux de couverture ${rate}`);
});

test('texte entièrement personnel : aucun passage retenu', () => {
  const docTokens = tokenize(`${FILLER}\n${FILLER.replace(/mémoire/g, 'travail')}`);
  const index = buildDocumentIndex(docTokens);
  const matches = matchSource(index, tokenize(SOURCE_TEXT));
  assert.equal(matches.length, 0, JSON.stringify(matches));
});

test('paraphrase : passage reformulé détecté avec une similarité intermédiaire', () => {
  // Même contenu, mots-outils et ordre partiellement modifiés.
  const paraphrased =
    "La topologie générale examine les propriétés des espaces restant " +
    "inchangées lorsqu'on leur applique des déformations continues. " +
    "Un espace topologique désigne un ensemble muni d'une famille de parties " +
    "nommées ouverts, stable par union quelconque et par intersection finie.";
  const docTokens = tokenize(`${FILLER}\n${paraphrased}\n${FILLER}`);
  const index = buildDocumentIndex(docTokens);
  const matches = matchSource(index, tokenize(SOURCE_TEXT));

  assert.ok(matches.length >= 1, 'la paraphrase est détectée');
  const best = matches.reduce((a, b) => (b.similarity > a.similarity ? b : a));
  assert.ok(best.similarity >= 0.34, `similarité ${best.similarity}`);
  assert.ok(
    ['paraphrase', 'modifie', 'identique'].includes(best.type),
    `type ${best.type}`,
  );
  assert.match(spanText(docTokens, best.qStart, best.qEnd), /topologi/);
  // Le passage reformulé doit être moins bien noté qu'une copie littérale.
  const verbatim = tokenize(`${FILLER}\n${SOURCE_TEXT}\n${FILLER}`);
  const verbatimBest = matchSource(buildDocumentIndex(verbatim), tokenize(SOURCE_TEXT))
    .reduce((a, b) => (b.similarity > a.similarity ? b : a));
  assert.ok(
    verbatimBest.similarity > best.similarity,
    `copie ${verbatimBest.similarity} vs paraphrase ${best.similarity}`,
  );
});

test('un passage court et banal ne déclenche pas de correspondance', () => {
  const docTokens = tokenize(
    `${FILLER} Un espace topologique est un ensemble. ${FILLER}`,
  );
  const index = buildDocumentIndex(docTokens);
  const matches = matchSource(index, tokenize(SOURCE_TEXT));
  const { covered } = unionCoverage(matches);
  assert.ok(
    covered / docTokens.count < 0.1,
    `couverture trop élevée : ${covered}/${docTokens.count}`,
  );
});

test('le winnowing conserve la détection des longs passages copiés', () => {
  const copied = SOURCE_TEXT;
  const docText = `${FILLER}\n${copied}\n${FILLER}`;
  const docTokens = tokenize(docText);
  for (const winnow of [1, 2, 4]) {
    const index = buildDocumentIndex(docTokens, { winnow });
    const matches = matchSource(index, tokenize(SOURCE_TEXT), { winnow });
    const { covered } = unionCoverage(matches);
    assert.ok(
      covered > tokenize(copied).count * 0.8,
      `winnow=${winnow} : ${covered} jetons couverts`,
    );
  }
});

test('findInternalDuplication repère un copier-coller entre chapitres', () => {
  const repeated =
    "Le raisonnement par récurrence repose sur deux étapes distinctes : " +
    "l'initialisation qui vérifie la propriété au premier rang, puis " +
    "l'hérédité qui la propage de tout rang au rang suivant.";
  const middle = Array.from({ length: 300 }, (_, i) => `remplissage${i}`).join(' ');
  const docTokens = tokenize(`${repeated}\n${middle}\n${repeated}`);
  const index = buildDocumentIndex(docTokens);
  const dup = findInternalDuplication(index);
  assert.ok(dup.length >= 1, 'répétition détectée');
  assert.match(spanText(docTokens, dup[0].aStart, dup[0].aEnd), /récurrence/);
});

test('unionCoverage fusionne les plages qui se chevauchent', () => {
  const { covered, ranges } = unionCoverage([
    { qStart: 0, qEnd: 10 },
    { qStart: 5, qEnd: 20 },
    { qStart: 30, qEnd: 35 },
  ]);
  assert.equal(covered, 25);
  assert.deepEqual(ranges, [
    { start: 0, end: 20 },
    { start: 30, end: 35 },
  ]);
});

test('subtractRanges retire les zones exclues', () => {
  const result = subtractRanges(
    [{ start: 0, end: 100 }],
    [
      { start: 10, end: 20 },
      { start: 90, end: 120 },
    ],
  );
  assert.deepEqual(result, [
    { start: 0, end: 10 },
    { start: 20, end: 90 },
  ]);
  assert.deepEqual(subtractRanges([{ start: 0, end: 5 }], []), [
    { start: 0, end: 5 },
  ]);
});

test('attributeTokens donne chaque jeton à la source la plus probante', () => {
  const totals = attributeTokens(
    [
      { sourceId: 'A', matches: [{ qStart: 0, qEnd: 10, similarity: 0.5 }] },
      { sourceId: 'B', matches: [{ qStart: 5, qEnd: 20, similarity: 0.9 }] },
    ],
    30,
  );
  assert.equal(totals.get('A'), 5); // jetons 0..4
  assert.equal(totals.get('B'), 15); // jetons 5..19
});

test('mergeMatches recolle les passages contigus et pondère la similarité', () => {
  const merged = mergeMatches([
    { qStart: 0, qEnd: 10, sStart: 0, sEnd: 10, similarity: 1, type: 'identique', seeds: 3, mode: 'verbatim' },
    { qStart: 8, qEnd: 20, sStart: 8, sEnd: 20, similarity: 0.5, type: 'paraphrase', seeds: 2, mode: 'paraphrase' },
    { qStart: 400, qEnd: 420, sStart: 900, sEnd: 920, similarity: 0.8, type: 'modifie', seeds: 4, mode: 'verbatim' },
  ]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].qEnd, 20);
  assert.equal(merged[0].mode, 'mixte');
  assert.ok(merged[0].similarity > 0.5 && merged[0].similarity < 1);
  assert.equal(merged[1].qStart, 400);
});

test("l'indexation d'un gros document reste rapide", () => {
  const rnd = makeRandom(11);
  const lex = Array.from({ length: 4000 }, (_, i) => `lexeme${i}`);
  const words = Array.from({ length: 200_000 }, () => lex[Math.floor(rnd() * lex.length)]);
  const text = words.join(' ');
  const t0 = Date.now();
  const tokens = tokenize(text);
  const index = buildDocumentIndex(tokens);
  const elapsed = Date.now() - t0;
  assert.equal(tokens.count, 200_000);
  assert.ok(index.exact.index.size > 0);
  // Large marge : le but est de détecter une régression algorithmique.
  assert.ok(elapsed < 15000, `indexation trop lente : ${elapsed} ms`);
});
