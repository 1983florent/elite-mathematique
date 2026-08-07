import test from 'node:test';
import assert from 'node:assert/strict';

import {
  humanize,
  maskProtected,
  unmaskProtected,
  elisionCompatible,
  splitLongSentence,
  mergeShortSentences,
  moveFrontedAdverbial,
  frenchTypography,
  wordDiff,
} from '../plagiat/js/core/humanizer.js';

const SAMPLE = [
  "Il est important de noter que la méthode utilisée permet d'obtenir des résultats significatifs.",
  "De plus, cette étude montre une différence importante entre les deux groupes, mais il convient de souligner que l'échantillon reste limité, ce qui invite à la prudence.",
  'En 2019, les chercheurs ont observé un phénomène analogue dans plusieurs laboratoires européens.',
].join('\n');

test('humanize est déterministe à graine constante', () => {
  const a = humanize(SAMPLE, { seed: 12345 });
  const b = humanize(SAMPLE, { seed: 12345 });
  assert.equal(a.text, b.text);
  assert.deepEqual(a.operations, b.operations);
});

test('humanize modifie réellement le texte et le documente', () => {
  const result = humanize(SAMPLE, { seed: 7, intensity: 0.9 });
  assert.notEqual(result.text, SAMPLE);
  assert.ok(result.changes.length > 0, 'les paragraphes modifiés sont listés');
  assert.ok(Object.keys(result.operations).length > 0, 'les opérations sont comptées');
  assert.ok(result.stats.changedWords > 0);
  assert.ok(result.stats.changeRatio > 0 && result.stats.changeRatio <= 100);
});

test('intensité nulle : le texte reste inchangé', () => {
  const result = humanize(SAMPLE, { seed: 7, intensity: 0, operations: { typography: false } });
  assert.equal(result.text, SAMPLE);
  assert.equal(result.changes.length, 0);
});

test('la structure en paragraphes est préservée', () => {
  const source = 'Premier paragraphe assez long pour être retravaillé.\n\nDeuxième paragraphe.';
  const result = humanize(source, { seed: 3, intensity: 1 });
  assert.equal(result.text.split('\n').length, source.split('\n').length);
  assert.equal(result.text.split('\n')[1], '');
});

test('les zones protégées ne sont jamais réécrites', () => {
  const source =
    'Voir https://fr.wikipedia.org/wiki/Théorème_de_Pythagore pour les détails. ' +
    'Comme le dit l’auteur : « il est important de noter que tout converge ». ' +
    'La formule $a^2 + b^2 = c^2$ est classique (Dupont, 2019) [12]. ' +
    'Écrire à maths.florent@gmail.com pour en discuter davantage et longuement.';
  const result = humanize(source, { seed: 99, intensity: 1 });

  assert.ok(result.text.includes('https://fr.wikipedia.org/wiki/Théorème_de_Pythagore'));
  assert.ok(result.text.includes('$a^2 + b^2 = c^2$'));
  assert.ok(result.text.includes('(Dupont, 2019)'));
  assert.ok(result.text.includes('[12]'));
  assert.ok(result.text.includes('maths.florent@gmail.com'));
  assert.ok(
    result.text.includes('« il est important de noter que tout converge »'),
    'la citation est intacte : ' + result.text,
  );
});

test('maskProtected et unmaskProtected sont réversibles', () => {
  const source = 'Texte avec https://exemple.org et « une citation » et $x^2$.';
  const { masked, slots } = maskProtected(source);
  assert.ok(!masked.includes('https://exemple.org'));
  assert.equal(unmaskProtected(masked, slots), source);
});

test('elisionCompatible protège les élisions françaises', () => {
  assert.equal(elisionCompatible("l'", 'analyse'), true);
  assert.equal(elisionCompatible("l'", 'tableau'), false);
  assert.equal(elisionCompatible('le ', 'tableau'), true);
  assert.equal(elisionCompatible('le ', 'analyse'), false);
  assert.equal(elisionCompatible('un ', 'analyse'), true, 'pas de contrainte connue');
});

test('les substitutions ne produisent pas de « le analyse »', () => {
  const source = Array.from(
    { length: 40 },
    (_, i) => `Le résultat numéro ${i} montre une différence importante entre les méthodes employées.`,
  ).join(' ');
  const result = humanize(source, { seed: 5, intensity: 1 });
  // Lookbehind unicode : « \\b » est insensible aux lettres accentuées.
  assert.doesNotMatch(result.text, /(?<![\p{L}\p{N}])(le|la|de|ce|ne|je|se|me|te|que) [aeiouéèêàâîô]/iu);
  assert.doesNotMatch(result.text, /(?<![\p{L}\p{N}])[cdjlmnst]['’][bcdfgjklmnpqrstvwxz]/iu);
});

test('splitLongSentence coupe sur un séparateur sûr', () => {
  const long =
    "Le raisonnement demande une initialisation rigoureuse au premier rang, mais il exige aussi une hérédité solide pour tous les rangs suivants.";
  const split = splitLongSentence(long);
  assert.ok(split, 'une coupure est trouvée');
  assert.match(split, /\. Mais /);
  assert.equal(splitLongSentence('Phrase courte.'), null);
});

test('mergeShortSentences ne fusionne que ce qui est sûr', () => {
  assert.equal(
    mergeShortSentences('Le calcul est simple.', 'Il donne le résultat.'),
    'Le calcul est simple, et il donne le résultat.',
  );
  // Un nom propre en tête ne doit pas être mis en minuscule.
  assert.equal(mergeShortSentences('Le calcul est simple.', 'Pythagore le savait.'), null);
  // Une question garde son autonomie.
  assert.equal(mergeShortSentences('Est-ce clair ?', 'Il le pense.'), null);
});

test('moveFrontedAdverbial déplace le complément en fin de phrase', () => {
  assert.equal(
    moveFrontedAdverbial('En 2019, les chercheurs ont observé un phénomène analogue.'),
    'Les chercheurs ont observé un phénomène analogue en 2019.',
  );
  assert.equal(moveFrontedAdverbial('Les chercheurs ont observé un phénomène.'), null);
});

test('frenchTypography applique les espaces fines', () => {
  const out = frenchTypography("Voici;un test... Il dit «bonjour» à 14:30! Clair?");
  assert.match(out, /Voici ;/);
  assert.match(out, /…/);
  assert.match(out, /« bonjour »/);
  assert.match(out, /14:30 !/, 'les heures ne sont pas séparées');
  assert.match(out, /Clair \?/);
});

test('wordDiff met en évidence les mots ajoutés et retirés', () => {
  const diff = wordDiff('le chat noir dort', 'le chien noir dort');
  const removed = diff.filter((d) => d.type === 'retire').map((d) => d.text.trim()).join('');
  const added = diff.filter((d) => d.type === 'ajoute').map((d) => d.text.trim()).join('');
  assert.equal(removed, 'chat');
  assert.equal(added, 'chien');
  assert.equal(
    diff.map((d) => (d.type === 'retire' ? '' : d.text)).join(''),
    'le chien noir dort',
  );
});

test('les tournures stéréotypées disparaissent à forte intensité', () => {
  const source =
    "Il est important de noter que ce point compte beaucoup. " +
    "Dans le monde d'aujourd'hui, un large éventail de solutions existe. " +
    "Il convient de souligner que la question reste ouverte.";
  const result = humanize(source, { seed: 1, intensity: 1 });
  assert.doesNotMatch(result.text.toLowerCase(), /il est important de noter que/);
  assert.doesNotMatch(result.text.toLowerCase(), /un large éventail de/);
});

test("l'anglais utilise son propre lexique", () => {
  const source =
    'It is important to note that the method shows significant results in many studies.';
  const result = humanize(source, { seed: 2, intensity: 1, lang: 'en' });
  assert.equal(result.lang, 'en');
  assert.notEqual(result.text, source);
  // Pas de typographie française sur un texte anglais.
  assert.doesNotMatch(result.text, / /);
});

test('humanize supporte un texte volumineux sans exploser', () => {
  const paragraph =
    "De plus, cette étude montre une différence importante entre les deux groupes analysés, " +
    "mais il convient de souligner que l'échantillon reste limité.";
  const source = Array.from({ length: 2000 }, () => paragraph).join('\n');
  const t0 = Date.now();
  const result = humanize(source, { seed: 4, intensity: 0.6 });
  const elapsed = Date.now() - t0;
  assert.equal(result.text.split('\n').length, 2000);
  assert.ok(elapsed < 20000, `humanisation trop lente : ${elapsed} ms`);
});

test('un second passage ne dégrade pas le texte', () => {
  const first = humanize(SAMPLE, { seed: 21, intensity: 0.8 });
  const second = humanize(first.text, { seed: 21, intensity: 0.8 });
  // Le contenu reste cohérent : pas d'explosion ni d'effondrement du volume.
  const ratio = second.text.length / SAMPLE.length;
  assert.ok(ratio > 0.7 && ratio < 1.4, `ratio de longueur ${ratio}`);
  assert.doesNotMatch(second.text, /[\ue000-\ue003]/, 'aucun jeton de masquage résiduel');
});

test('les ambiguïtés nom / verbe sont respectées', () => {
  const source =
    "Cette analyse montre un résultat. La montre indique l'heure. " +
    "Il analyse les données puis il montre le graphique obtenu ce jour.";
  // Toutes les graines doivent respecter la catégorie grammaticale.
  for (let seed = 1; seed <= 25; seed++) {
    const out = humanize(source, { seed, intensity: 1 }).text;
    assert.match(out, /[Cc]ette analyse/, `graine ${seed} : « cette analyse » reste un nom`);
    // La fusion de deux phrases courtes peut mettre « la » en minuscule.
    assert.match(out, /[Ll]a montre indique/, `graine ${seed} : « la montre » reste un nom`);
  }
});

test('les locutions figées ne sont pas disloquées', () => {
  const source =
    "Le résultat reste ainsi que prévu par le comité. " +
    "Le point de vue défendu ici demeure inchangé pour tout le monde. " +
    "Il analyse ensuite les données recueillies sur le terrain de l'étude.";
  for (let seed = 1; seed <= 25; seed++) {
    const out = humanize(source, { seed, intensity: 1 }).text;
    assert.match(out, /ainsi que prévu/, `graine ${seed} : « ainsi que » intact`);
    assert.match(out, /point de vue/, `graine ${seed} : « point de vue » intact`);
    assert.doesNotMatch(out, /\bpuis les données/, `graine ${seed} : connecteur médian intact`);
  }
});

test("l'élision reste correcte après une locution remplacée", () => {
  const source =
    "Dans le monde d'aujourd'hui, un large éventail de solutions techniques existe " +
    "et une multitude de exemples le confirment.";
  for (let seed = 1; seed <= 25; seed++) {
    const out = humanize(source, { seed, intensity: 1 }).text;
    assert.doesNotMatch(
      out,
      /(?<![\p{L}\p{N}])de [aeiouéèêàâîô]/iu,
      `graine ${seed} : élision manquante dans « ${out} »`,
    );
  }
});

test('les verbes à complément prépositionnel gardent leur préposition', () => {
  const source = "La méthode permet d'obtenir des résultats et permet de comparer les groupes.";
  for (let seed = 1; seed <= 25; seed++) {
    const out = humanize(source, { seed, intensity: 1 }).text;
    assert.doesNotMatch(out, /rend possible d[’']obtenir/, `graine ${seed}`);
    assert.match(out, /(permet|autorise à)/, `graine ${seed}`);
  }
});

test('les connecteurs en tête ne sont pas déplacés en fin de phrase', () => {
  assert.equal(
    moveFrontedAdverbial("En outre, l'échantillon retenu reste très limité cette année."),
    null,
  );
  assert.equal(
    moveFrontedAdverbial('En revanche, les données recueillies confirment cette hypothèse.'),
    null,
  );
  // Un véritable complément circonstanciel reste déplaçable.
  assert.equal(
    moveFrontedAdverbial('Au printemps, les mesures relevées sur le terrain ont changé.'),
    'Les mesures relevées sur le terrain ont changé au printemps.',
  );
});

test('les adjectifs des locutions impersonnelles ne sont pas isolés', () => {
  const source =
    "Il est important de noter que le résultat tient. Il est nécessaire de vérifier chaque étape. " +
    "Il est possible de conclure ainsi sur ce point précis du raisonnement.";
  for (let seed = 1; seed <= 25; seed++) {
    const out = humanize(source, { seed, intensity: 1 }).text;
    // Soit la locution entière est reformulée, soit elle reste intacte.
    assert.doesNotMatch(
      out,
      /est (considérable|notable|majeur|indispensable|requis|envisageable|réalisable) d/i,
      `graine ${seed} : « ${out} »`,
    );
  }
});
