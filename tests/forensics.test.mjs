import test from 'node:test';
import assert from 'node:assert/strict';

import { scanForensics, decloakText, HOMOGLYPHS } from '../plagiat/js/core/forensics.js';
import { analyzeAiSignals, bandFor } from '../plagiat/js/core/ai-detector.js';
import {
  extractCitations,
  extractBibliography,
  checkCitations,
} from '../plagiat/js/core/citations.js';
import {
  compareTexts,
  createFingerprint,
  validateFingerprint,
  matchFingerprint,
} from '../plagiat/js/core/compare.js';
import { tokenize } from '../plagiat/js/core/text.js';

/* -------------------------------------------------------------------------- */
/* Forensique                                                                 */
/* -------------------------------------------------------------------------- */

test('scanForensics repère les homoglyphes cyrilliques', () => {
  // « thеorеme » contient deux « е » cyrilliques (U+0435).
  const r = scanForensics('Le thеorеme de Pythagore reste vrai.');
  assert.equal(r.mixedWords.length, 1);
  assert.equal(r.mixedWords[0].cleaned, 'theoreme');
  assert.equal(r.homoglyphCount, 2);
  assert.equal(r.findings.length >= 1, true);
});

test('scanForensics repère les caractères invisibles et bidi', () => {
  const r = scanForensics('mot​caché et direction‮inversée.');
  assert.equal(r.invisibleCount, 1);
  assert.equal(r.bidiCount, 1);
  assert.equal(r.severity, 'alerte'); // bidi déclenche l'alerte
});

test('scanForensics remonte le texte dissimulé du .docx', () => {
  const r = scanForensics('Texte normal visible.', {
    hiddenRuns: [
      { type: 'blanc', text: 'mots invisibles en blanc ajoutés pour tromper' },
      { type: 'masque', text: '   ' }, // espace pur : ignoré
    ],
  });
  assert.equal(r.hiddenRuns.length, 1);
  assert.equal(r.severity, 'alerte');
  assert.match(r.findings.at(-1), /dissimulé/);
});

test('scanForensics ne signale rien sur un texte propre', () => {
  const r = scanForensics('Un texte parfaitement ordinaire, sans aucune ruse.');
  assert.equal(r.severity, 'aucun');
  assert.equal(r.findings.length, 0);
});

test('decloakText restaure un texte camouflé', () => {
  assert.equal(decloakText('thеorеme​'), 'theoreme');
  assert.ok(HOMOGLYPHS.size > 30);
});

/* -------------------------------------------------------------------------- */
/* Indices IA                                                                 */
/* -------------------------------------------------------------------------- */

test('analyzeAiSignals note plus haut un texte stéréotypé et uniforme', () => {
  const humain =
    'Le vieux pont tenait bon. Chaque hiver, pourtant, une pierre cédait. ' +
    "Mon grand-père racontait qu'un maçon l'avait bâti seul, à mains nues, en trois étés brûlants. " +
    'Personne ne le croyait. Moi si. Les traces de son ciseau couraient encore sur la voûte, ' +
    'nettes, obstinées, comme une signature que le temps refusait d’effacer tout à fait.';
  const machine = Array.from({ length: 8 }, (_, i) =>
    'Il est important de noter que cet aspect joue un rôle crucial dans le domaine. ' +
    'De plus, il convient de souligner que ce facteur reste essentiel pour la compréhension globale. ' +
    `En outre, cette dimension mérite une attention particulière au point numéro ${i}.`,
  ).join(' ');

  const rMachine = analyzeAiSignals(machine);
  const rHumain = analyzeAiSignals(humain.repeat(2));
  assert.ok(rMachine.score > rHumain.score, `${rMachine.score} vs ${rHumain.score}`);
  assert.ok(rMachine.score > 45, `score machine ${rMachine.score}`);
  assert.ok(rMachine.indicators.length >= 6);
  assert.ok(rMachine.disclaimer.length > 0);
});

test('analyzeAiSignals refuse de conclure sur un texte trop court', () => {
  const r = analyzeAiSignals('Trois mots seulement.');
  assert.equal(r.reliable, false);
  assert.equal(r.score, 0);
});

test('bandFor couvre chaque palier', () => {
  assert.equal(bandFor(10).code, 'faible');
  assert.equal(bandFor(35).code, 'modere');
  assert.equal(bandFor(60).code, 'marque');
  assert.equal(bandFor(85).code, 'tres-marque');
});

/* -------------------------------------------------------------------------- */
/* Citations                                                                  */
/* -------------------------------------------------------------------------- */

test('extractCitations lit les appels auteur-année et numériques', () => {
  const text =
    'Comme le montre (Dupont, 2019), la méthode tient. Nadeau (2020) le confirme. ' +
    'Voir aussi [12] et [3, 5-7] pour les détails.';
  const { authorYear, numeric } = extractCitations(text);
  const auteurs = authorYear.map((c) => `${c.key}:${c.year}`).sort();
  assert.deepEqual(auteurs, ['dupont:2019', 'nadeau:2020']);
  const nums = numeric.flatMap((n) => n.numbers).sort((a, b) => a - b);
  assert.deepEqual(nums, [3, 5, 6, 7, 12]);
});

test('checkCitations détecte orphelines et jamais citées', () => {
  // Les décalages sont dérivés du texte pour rester exacts.
  const lignes = [
    'Selon (Dupont, 2019), tout va bien. On cite aussi (Martin, 2021).',
    'Bibliographie',
    'DUPONT, Jean (2019). Un livre. Paris.',
    'LEROY, Anne (2015). Jamais appelée. Lyon.',
  ];
  const text = lignes.join('\n');
  const paragraphs = [];
  let pos = 0;
  for (const ligne of lignes) {
    paragraphs.push({ text: ligne, start: pos, end: pos + ligne.length });
    pos += ligne.length + 1;
  }
  const biblioRange = { start: paragraphs[1].start, end: text.length };
  const c = checkCitations(text, paragraphs, biblioRange);

  assert.equal(c.style, 'auteur-annee');
  assert.equal(c.hasBibliography, true);
  // Martin 2021 est cité mais absent de la biblio → orphelin.
  assert.ok(c.orphans.some((o) => o.key === 'martin'));
  // Dupont 2019 est apparié.
  assert.ok(!c.orphans.some((o) => o.key === 'dupont'));
  // Leroy 2015 figure en biblio mais n'est jamais cité.
  assert.ok(c.uncited.some((u) => u.keys.includes('leroy')));
});

test('extractBibliography ne retient que les entrées datées', () => {
  const paragraphs = [
    { text: 'Références', start: 0, end: 10 },
    { text: 'SMITH, John (2018). A study. Oxford University Press.', start: 11, end: 63 },
    { text: 'Une ligne sans date ni sens.', start: 64, end: 92 },
  ];
  const entries = extractBibliography(paragraphs, { start: 0, end: 92 });
  assert.equal(entries.length, 1);
  assert.ok(entries[0].keys.includes('smith'));
  assert.deepEqual(entries[0].years, ['2018']);
});

/* -------------------------------------------------------------------------- */
/* Comparaison et empreintes                                                  */
/* -------------------------------------------------------------------------- */

const DOC_A =
  "La topologie générale étudie les propriétés des espaces qui demeurent " +
  "inchangées sous l'effet des déformations continues. Un espace topologique est " +
  "un ensemble muni d'une famille de parties appelées ouverts.";

test('compareTexts mesure la couverture croisée', () => {
  const partage = `Introduction propre.\n${DOC_A}\nConclusion originale distincte.`;
  const autre = `Préambule différent.\n${DOC_A}\nAutre fin encore.`;
  const r = compareTexts(partage, autre);
  assert.ok(r.coverageA > 40 && r.coverageA < 100, `couverture A ${r.coverageA}`);
  assert.ok(r.passages.length >= 1);
  assert.match(r.passages[0].aText, /topologi/);
  assert.ok(['forte-parente', 'quasi-identiques'].includes(r.verdict.code));

  const independant = compareTexts(
    'Un texte entièrement personnel sur la pêche en rivière au petit matin.',
    'Un autre sujet, celui de la cuisine traditionnelle du sud-ouest français.',
  );
  assert.equal(independant.verdict.code, 'independants');
});

test('createFingerprint ne divulgue pas le texte et reste vérifiable', () => {
  const fp = createFingerprint('Corrigé 2024', DOC_A);
  assert.equal(validateFingerprint(fp).ok, true);
  assert.ok(fp.hashes.length > 10);
  assert.ok(fp.words > 20);
  // On ne doit retrouver aucun mot du texte dans l'empreinte sérialisée.
  const json = JSON.stringify(fp);
  assert.doesNotMatch(json, /topologie|espace|ouverts/i);

  // Un document reprenant DOC_A est repéré par l'empreinte.
  const suspect = tokenize(`Blabla introductif.\n${DOC_A}\nBlabla final.`);
  const m = matchFingerprint(suspect, fp);
  assert.ok(m.ratio > 0.3, `ratio ${m.ratio}`);

  // Un document sans rapport ne l'est pas.
  const propre = tokenize('Une dissertation sur un tout autre thème sans lien aucun.');
  assert.ok(matchFingerprint(propre, fp).ratio < 0.05);
});

test('validateFingerprint rejette les fichiers étrangers', () => {
  assert.equal(validateFingerprint(null).ok, false);
  assert.equal(validateFingerprint({ format: 'autre' }).ok, false);
  assert.equal(validateFingerprint({ format: 'elite-empreinte', hashes: [] }).ok, false);
});
