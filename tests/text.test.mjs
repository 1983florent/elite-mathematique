import test from 'node:test';
import assert from 'node:assert/strict';

import {
  tokenize,
  tokenText,
  spanText,
  splitSentences,
  normalizeWord,
  normalizeTypography,
  stem,
  detectLanguage,
  buildStream,
  fingerprint,
  styleMetrics,
  hash32,
} from '../plagiat/js/core/text.js';

test('normalizeWord retire accents, ligatures et casse', () => {
  assert.equal(normalizeWord('Élève'), 'eleve');
  assert.equal(normalizeWord('CŒUR'), 'coeur');
  assert.equal(normalizeWord('naïve'), 'naive');
  assert.equal(normalizeWord('Français'), 'francais');
});

test('normalizeTypography uniformise apostrophes et guillemets', () => {
  assert.equal(normalizeTypography('l’élève'), "l'élève");
  assert.equal(normalizeTypography('« citation »'), '" citation "');
  assert.equal(normalizeTypography('a b'), 'a b');
  assert.equal(normalizeTypography('trois…'), 'trois...');
});

test('stem rapproche les formes fléchies', () => {
  assert.equal(stem('analyses'), stem('analyse'));
  assert.equal(stem('fonctions'), stem('fonction'));
  assert.equal(stem('demontrer'), stem('demontre'));
  assert.equal(stem('national'), stem('nationaux'));
  assert.equal(stem('mots'), stem('mot'));
  assert.equal(stem('theoremes'), stem('theoreme'));
  // Les mots très courts restent intacts pour éviter les rapprochements abusifs.
  assert.equal(stem('cas'), 'cas');
  assert.notEqual(stem('triangle'), stem('theoreme'));
});

test('tokenize conserve les décalages exacts et gère les élisions', () => {
  const text = "L'élève résout l’équation ; peut-être 3,14 fois.";
  const t = tokenize(text);
  const words = [];
  for (let i = 0; i < t.count; i++) words.push(tokenText(t, i));
  assert.deepEqual(words, ['élève', 'résout', 'équation', 'peut-être', '3', '14', 'fois']);
  for (let i = 0; i < t.count; i++) {
    assert.equal(text.slice(t.start[i], t.end[i]), words[i]);
  }
  assert.equal(spanText(t, 0, 2), "élève résout");
});

test('tokenize marque les mots vides', () => {
  const t = tokenize('le chat de la maison');
  const stops = [];
  for (let i = 0; i < t.count; i++) stops.push((t.flags[i] & 1) !== 0);
  assert.deepEqual(stops, [true, false, true, true, false]);
});

test('splitSentences respecte abréviations, initiales et décimales', () => {
  const text =
    "M. Dupont a démontré le théorème. Le nombre π vaut 3.14 environ. " +
    'Est-ce clair ? Oui ! Cf. la page 12 pour la suite.';
  const parts = splitSentences(text).map((s) => text.slice(s.start, s.end).trim());
  assert.deepEqual(parts, [
    'M. Dupont a démontré le théorème.',
    'Le nombre π vaut 3.14 environ.',
    'Est-ce clair ?',
    'Oui !',
    'Cf. la page 12 pour la suite.',
  ]);
});

test('splitSentences coupe aux retours à la ligne et gère les guillemets', () => {
  const text = 'Premier titre\nIl a dit « bonjour ». Puis il est parti.';
  const parts = splitSentences(text).map((s) => text.slice(s.start, s.end).trim());
  assert.deepEqual(parts, [
    'Premier titre',
    'Il a dit « bonjour ».',
    'Puis il est parti.',
  ]);
});

test('splitSentences renvoie des décalages cohérents', () => {
  const text = 'Une phrase. Une autre phrase plus longue ! Et une fin.';
  for (const s of splitSentences(text)) {
    assert.ok(s.end > s.start);
    assert.ok(text.slice(s.start, s.end).trim().length > 0);
  }
  const last = splitSentences(text).at(-1);
  assert.equal(text.slice(last.start, last.end).trim(), 'Et une fin.');
});

test('detectLanguage distingue le français de l’anglais', () => {
  const fr = tokenize(
    'Le théorème de Pythagore est une relation entre les côtés du triangle rectangle, ' +
      'et il permet de calculer la longueur de l’hypoténuse à partir des deux autres côtés.',
  );
  const en = tokenize(
    'The Pythagorean theorem is a relation between the sides of a right triangle, ' +
      'and it allows you to compute the length of the hypotenuse from the other two sides.',
  );
  assert.equal(detectLanguage(fr).lang, 'fr');
  assert.equal(detectLanguage(en).lang, 'en');
  assert.equal(detectLanguage(tokenize('xyz')).lang, 'inconnue');
});

test('buildStream filtre les mots vides et garde la correspondance', () => {
  const t = tokenize('le chat de la maison bleue');
  const content = buildStream(t, true);
  assert.equal(content.hash.length, 3);
  const kept = Array.from(content.map).map((i) => tokenText(t, i));
  assert.deepEqual(kept, ['chat', 'maison', 'bleue']);
});

test('fingerprint produit n-k+1 empreintes, stables et sensibles au contenu', () => {
  const a = tokenize('un texte de démonstration parfaitement identique pour le test');
  const b = tokenize('un texte de démonstration parfaitement identique pour le test');
  const c = tokenize('un texte de démonstration légèrement différent pour le test');
  const sa = buildStream(a, false);
  const sb = buildStream(b, false);
  const sc = buildStream(c, false);

  const fa = fingerprint(sa, 4);
  assert.equal(fa.hash.length, sa.hash.length - 4 + 1);
  assert.deepEqual(Array.from(fa.hash), Array.from(fingerprint(sb, 4).hash));
  assert.notDeepEqual(Array.from(fa.hash), Array.from(fingerprint(sc, 4).hash));
});

test('fingerprint avec winnowing reste inclus dans les empreintes complètes', () => {
  const t = tokenize(
    Array.from({ length: 200 }, (_, i) => `mot${i % 37} suite${i % 11}`).join(' '),
  );
  const stream = buildStream(t, false);
  const all = new Set(fingerprint(stream, 5, 1).hash);
  const winnowed = fingerprint(stream, 5, 4);
  assert.ok(winnowed.hash.length > 0);
  assert.ok(winnowed.hash.length < all.size);
  for (const h of winnowed.hash) assert.ok(all.has(h), 'empreinte issue du flux complet');
});

test('hash32 est déterministe et bien réparti', () => {
  assert.equal(hash32('theoreme'), hash32('theoreme'));
  assert.notEqual(hash32('theoreme'), hash32('theoremes'));
  const seen = new Set();
  for (let i = 0; i < 20000; i++) seen.add(hash32('mot' + i));
  assert.ok(seen.size > 19990, `collisions inattendues : ${20000 - seen.size}`);
});

test('styleMetrics calcule des indicateurs de style plausibles', () => {
  const m = styleMetrics(
    'Le chat dort. Le grand chien noir court très vite dans le jardin fleuri du voisin. Oui.',
  );
  assert.equal(m.sentences, 3);
  assert.ok(m.words > 15);
  assert.ok(m.burstiness > 0, 'la variabilité des phrases est mesurée');
  assert.ok(m.typeTokenRatio > 0 && m.typeTokenRatio <= 1);
  assert.ok(Number.isFinite(m.readability));
});
