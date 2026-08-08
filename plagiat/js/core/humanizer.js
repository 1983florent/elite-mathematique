/**
 * Humanisation de texte : réécriture stylistique déterministe.
 *
 * L'objectif est de rendre un texte plus vivant et plus personnel, varier les
 * charnières, casser les phrases interminables, supprimer les tournures
 * stéréotypées, alterner les longueurs, sans en altérer le sens ni toucher
 * aux passages qui doivent rester intacts : citations, formules, références,
 * URL et code.
 *
 * Le traitement est **déterministe** : à texte, réglages et graine identiques,
 * le résultat l'est aussi, ce qui permet de le vérifier et de le reproduire.
 *
 * @module core/humanizer
 */

import { hash32, splitSentences, styleMetrics, normalizeWord } from './text.js';
import { lexiconFor, CONNECTOR_GUARDS } from '../data/synonyms.js';

/** Réglages par défaut de l'humanisation. */
export const HUMANIZE_DEFAULTS = {
  lang: 'auto',
  /** Intensité globale, 0 (aucun changement) à 1 (réécriture maximale). */
  intensity: 0.6,
  seed: 0,
  preserveQuotes: true,
  maxSentenceWords: 30,
  minSentenceWords: 7,
  operations: {
    phrases: true,
    nominalizations: true,
    connectors: true,
    synonyms: true,
    fillers: true,
    passive: true,
    splitLong: true,
    mergeShort: true,
    reorder: true,
    typography: true,
  },
};

/** Libellés lisibles des opérations, pour le rapport de modifications. */
export const OPERATION_LABELS = {
  phrases: 'Tournures stéréotypées reformulées',
  nominalizations: 'Périphrases nominales simplifiées',
  connectors: 'Connecteurs logiques variés',
  synonyms: 'Synonymes contextuels',
  fillers: 'Mots de remplissage retirés',
  passive: 'Voix passive impersonnelle rendue active',
  splitLong: 'Phrases trop longues scindées',
  mergeShort: 'Phrases courtes fusionnées',
  reorder: 'Compléments circonstanciels déplacés',
  typography: 'Typographie française corrigée',
};

/* ------------------------------------------------------------------ *
 * Aléatoire reproductible
 * ------------------------------------------------------------------ */

/** @param {number} seed */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Zones protégées
 * ------------------------------------------------------------------ */

const PLACEHOLDER_START = '\ue000';
const PLACEHOLDER_END = '\ue001';
/** Délimiteurs distincts pour le texte *inséré* par une transformation. */
const INSERT_START = '\ue002';
const INSERT_END = '\ue003';
const ANY_PLACEHOLDER = /[\ue000\ue002]\d+[\ue001\ue003]/g;

/**
 * Protège un texte fraîchement inséré : sans cela, une locution remplacée
 * pourrait être retouchée par l'étape suivante (« un large éventail de » →
 * « beaucoup de » → « grandement de »).
 *
 * @param {string} replacement
 * @param {string[]} inserts
 * @returns {string}
 */
function protectInsert(replacement, inserts) {
  inserts.push(replacement);
  return `${INSERT_START}${inserts.length - 1}${INSERT_END}`;
}

/**
 * Restaure les textes insérés.
 * @param {string} text
 * @param {string[]} inserts
 */
function restoreInserts(text, inserts) {
  return text.replace(
    new RegExp(`${INSERT_START}(\\d+)${INSERT_END}`, 'g'),
    (match, index) => inserts[Number(index)] ?? match,
  );
}

/** Motifs dont le contenu ne doit jamais être réécrit. */
function protectedPatterns(preserveQuotes) {
  const patterns = [
    /https?:\/\/[^\s<>"']+/g, // URL
    /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, // adresses e-mail
    /\$[^$\n]{1,200}\$/g, // mathématiques en ligne
    /\\\([\s\S]{1,300}?\\\)/g,
    /\\\[[\s\S]{1,600}?\\\]/g,
    /`[^`\n]{1,200}`/g, // code
    /\[\d+(?:\s*[,;–-]\s*\d+)*\]/g, // références numérotées
    /\([^()]{0,90}?\b(?:1[5-9]\d{2}|20\d{2})\b[^()]{0,30}?\)/g, // (Auteur, 2020)
  ];
  if (preserveQuotes) {
    patterns.push(/«[\s\S]{0,1500}?»/g, /“[\s\S]{0,1500}?”/g, /"[^"\n]{8,1500}"/g);
  }
  return patterns;
}

/**
 * Remplace les zones protégées par des jetons neutres.
 * @param {string} text
 * @param {boolean} preserveQuotes
 * @returns {{masked: string, slots: string[]}}
 */
export function maskProtected(text, preserveQuotes = true) {
  /** @type {string[]} */
  const slots = [];
  let masked = text;
  for (const re of protectedPatterns(preserveQuotes)) {
    masked = masked.replace(re, (match) => {
      // Ne masque pas ce qui contient déjà un jeton (motifs imbriqués).
      if (match.includes(PLACEHOLDER_START)) return match;
      slots.push(match);
      return `${PLACEHOLDER_START}${slots.length - 1}${PLACEHOLDER_END}`;
    });
  }
  return { masked, slots };
}

/**
 * Restaure les zones protégées.
 * @param {string} text
 * @param {string[]} slots
 */
export function unmaskProtected(text, slots) {
  return text.replace(
    new RegExp(`${PLACEHOLDER_START}(\\d+)${PLACEHOLDER_END}`, 'g'),
    (match, index) => slots[Number(index)] ?? match,
  );
}

/* ------------------------------------------------------------------ *
 * Outils lexicaux
 * ------------------------------------------------------------------ */

/** Échappe une chaîne pour l'insérer dans une expression régulière. */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Rend une expression tolérante aux deux formes d'apostrophe. */
function apostropheTolerant(pattern) {
  return pattern.replace(/['’]/g, "['’]");
}

/** Reporte la casse du mot d'origine sur son remplaçant. */
function applyCase(original, replacement) {
  if (!original) return replacement;
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

const VOWEL_START = /^[aeiouyàâäéèêëîïôöûüh]/i;

/** Mots qui s'élident : le remplaçant doit commencer par une voyelle. */
const ELIDED_BEFORE = /(?:^|[\s(])(?:[cdjlmnst]|qu|jusqu|lorsqu|puisqu|quoiqu)['’]$/i;
/** Déterminants non élidés : le remplaçant doit commencer par une consonne. */
const NON_ELIDED_BEFORE = /(?:^|[\s(])(?:le|la|de|ce|ne|je|se|me|te|que)\s$/i;

/**
 * Vérifie qu'une substitution ne casse pas l'élision française.
 * @param {string} before texte précédant immédiatement le mot
 * @param {string} replacement
 * @returns {boolean}
 */
export function elisionCompatible(before, replacement) {
  const tail = before.slice(-12);
  const startsWithVowel = VOWEL_START.test(replacement);
  if (ELIDED_BEFORE.test(tail)) return startsWithVowel;
  if (NON_ELIDED_BEFORE.test(tail)) return !startsWithVowel;
  return true;
}

/* ------------------------------------------------------------------ *
 * Transformations au fil du texte
 * ------------------------------------------------------------------ */

/**
 * Remplace des expressions figées (locutions, tics d'écriture).
 * @param {string} text
 * @param {{from: string, to: string[]}[]} rules
 * @param {() => number} rnd
 * @param {number} probability
 * @param {{count: number}} counter
 */
function replacePhrases(text, rules, rnd, probability, counter, inserts) {
  let out = text;
  for (const rule of rules) {
    const re = new RegExp(apostropheTolerant(escapeRe(rule.from)), 'gi');
    out = out.replace(re, (match) => {
      if (rnd() > probability) return match;
      const choice = rule.to[Math.floor(rnd() * rule.to.length)];
      counter.count++;
      return protectInsert(applyCase(match, choice), inserts);
    });
  }
  return out;
}

/**
 * Remplace les périphrases nominales par le verbe correspondant.
 * @param {string} text
 * @param {{from: string, to: string}[]} rules
 * @param {() => number} rnd
 * @param {number} probability
 * @param {{count: number}} counter
 */
function replaceNominalizations(text, rules, rnd, probability, counter, inserts) {
  let out = text;
  for (const rule of rules) {
    const re = new RegExp(apostropheTolerant(escapeRe(rule.from)), 'gi');
    out = out.replace(re, (match) => {
      if (rnd() > probability) return match;
      counter.count++;
      return protectInsert(applyCase(match, rule.to), inserts);
    });
  }
  return out;
}

/**
 * Varie les connecteurs logiques.
 * @param {string} text
 * @param {Record<string, string[]>} connectors
 * @param {() => number} rnd
 * @param {number} probability
 * @param {{count: number}} counter
 */
function replaceConnectors(text, connectors, rnd, probability, counter, inserts) {
  let out = text;
  for (const [from, options] of Object.entries(connectors)) {
    // Un connecteur n'est remplacé qu'en tête de proposition : « il analyse
    // ensuite les données » ne doit pas devenir « il analyse puis les données ».
    const re = new RegExp(
      `(^|[.!?;:,]\\s+)(${apostropheTolerant(escapeRe(from))})(?=[\\s,])`,
      'gi',
    );
    const guard = CONNECTOR_GUARDS[from];
    out = out.replace(re, (match, prefix, word, offset) => {
      if (rnd() > probability) return match;
      if (guard && guard.test(out.slice(offset + match.length))) return match;
      counter.count++;
      const choice = applyCase(word, options[Math.floor(rnd() * options.length)]);
      return prefix + protectInsert(choice, inserts);
    });
  }
  return out;
}

/** Supprime les intensifieurs vides. */
function removeFillers(text, fillers, rnd, probability, counter) {
  let out = text;
  for (const filler of fillers) {
    const re = new RegExp(`\\s\\b${apostropheTolerant(escapeRe(filler))}\\b`, 'gi');
    out = out.replace(re, (match) => {
      if (rnd() > probability * 0.7) return match;
      counter.count++;
      return '';
    });
  }
  return out;
}

/** Passifs impersonnels courants rendus actifs. */
const PASSIVE_FR = [
  { from: 'il est démontré que', to: 'on démontre que' },
  { from: 'il a été démontré que', to: 'on a démontré que' },
  { from: 'il est observé que', to: 'on observe que' },
  { from: 'il a été observé que', to: 'on a observé que' },
  { from: 'il est constaté que', to: 'on constate que' },
  { from: 'il est admis que', to: 'on admet que' },
  { from: 'il est reconnu que', to: 'on reconnaît que' },
  { from: 'il est considéré que', to: 'on considère que' },
  { from: 'il est supposé que', to: 'on suppose que' },
  { from: 'il est établi que', to: 'on a établi que' },
  { from: 'il est montré que', to: 'on montre que' },
  { from: 'il est souvent dit que', to: 'on dit souvent que' },
  { from: 'il peut être conclu que', to: 'on peut conclure que' },
  { from: 'il convient de rappeler que', to: 'rappelons que' },
  { from: 'cela peut être expliqué par', to: 'cela s’explique par' },
  { from: 'ces résultats peuvent être interprétés comme', to: 'on peut lire ces résultats comme' },
];

/**
 * Déterminants : un verbe précédé d'un déterminant est en réalité un nom
 * (« cette analyse », « la montre »).
 */
const DETERMINER_BEFORE =
  /(?:^|[\s(\u00ab"])(?:le|la|les|un|une|des|du|au|aux|ce|cet|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|chaque|quelques|plusieurs|certains|certaines|tout|toute|tous|toutes|[ldcmjstn][\u2019'])\s*$/i;

/**
 * Pronoms sujets : un nom précédé d'un pronom est en réalité un verbe
 * (« il analyse »).
 */
const PRONOUN_BEFORE =
  /(?:^|[\s(])(?:je|tu|il|elle|on|nous|vous|ils|elles|qui|ne|se|y|[njs][\u2019'])\s*$/i;

/**
 * Substitution de synonymes mot à mot, avec garde-fous d'élision, de
 * catégorie grammaticale et de locution figée.
 *
 * @param {string} text
 * @param {Record<string, {options: string[], pos: string, notFollowedBy?: RegExp}>} words
 * @param {() => number} rnd
 * @param {number} probability
 * @param {{count: number}} counter
 */
function replaceWords(text, words, rnd, probability, counter, inserts = []) {
  const re = /\p{L}[\p{L}\u2019'-]*/gu;
  let result = '';
  let last = 0;
  let match;
  /** @type {Set<string>} évite de remplacer deux fois le même mot dans la phrase */
  const used = new Set();

  while ((match = re.exec(text)) !== null) {
    const word = match[0];
    const key = word.toLowerCase();
    const entry = words[key];
    if (!entry || !entry.options.length) continue;
    if (used.has(key)) continue;
    if (rnd() > probability) continue;

    // Le contexte gauche est rétabli : un texte inséré juste avant
    // (« … toute une série de ») conditionne l'élision du remplaçant.
    const before = restoreInserts(text.slice(0, match.index), inserts);
    const after = text.slice(match.index + word.length);

    // Locutions figées : « ainsi que », « permet de », « point de vue »…
    if (entry.notFollowedBy && entry.notFollowedBy.test(after)) continue;
    // Levée d'ambiguïté nom / verbe.
    if (entry.pos === 'verbe' && DETERMINER_BEFORE.test(before)) continue;
    if (entry.pos === 'nom' && PRONOUN_BEFORE.test(before)) continue;

    const candidates = entry.options.filter((o) => elisionCompatible(before, o));
    if (candidates.length === 0) continue;

    const choice = applyCase(word, candidates[Math.floor(rnd() * candidates.length)]);
    result += text.slice(last, match.index) + choice;
    last = match.index + word.length;
    used.add(key);
    counter.count++;
  }
  return result + text.slice(last);
}

/* ------------------------------------------------------------------ *
 * Transformations de phrases
 * ------------------------------------------------------------------ */

/** Séparateurs sur lesquels une phrase trop longue peut être scindée. */
const SPLIT_POINTS = [
  { re: /\s;\s/, join: '. ', keep: '' },
  { re: /,\s+c['’]est pourquoi\s+/i, join: '. ', keep: 'C’est pourquoi ' },
  { re: /,\s+mais\s+/i, join: '. ', keep: 'Mais ' },
  { re: /,\s+or\s+/i, join: '. ', keep: 'Or ' },
  { re: /,\s+donc\s+/i, join: '. ', keep: 'Donc ' },
  { re: /,\s+cependant\s+/i, join: '. ', keep: 'Cependant, ' },
  { re: /,\s+toutefois\s+/i, join: '. ', keep: 'Toutefois, ' },
  { re: /,\s+néanmoins\s+/i, join: '. ', keep: 'Néanmoins, ' },
  { re: /,\s+par conséquent\s+/i, join: '. ', keep: 'Par conséquent, ' },
  { re: /,\s+en revanche\s+/i, join: '. ', keep: 'En revanche, ' },
  { re: /\s+alors que\s+/i, join: '. ', keep: 'Dans le même temps, ' },
];

/** Compte les mots, en ignorant les jetons de masquage. */
function wordCount(s) {
  const m = s.replace(ANY_PLACEHOLDER, ' ').match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

/** @param {string} s */
function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Scinde une phrase trop longue en deux, si un point de coupure sûr existe.
 * @param {string} sentence
 * @returns {string|null}
 */
export function splitLongSentence(sentence) {
  const total = wordCount(sentence);
  if (total < 8) return null;
  let best = null;
  for (const point of SPLIT_POINTS) {
    const m = point.re.exec(sentence);
    if (!m) continue;
    const left = sentence.slice(0, m.index);
    const right = sentence.slice(m.index + m[0].length);
    if (wordCount(left) < 6 || wordCount(right) < 6) continue;
    // On privilégie la coupure la plus proche du milieu.
    const balance = Math.abs(0.5 - wordCount(left) / total);
    if (!best || balance < best.balance) {
      best = { balance, left, right, point };
    }
  }
  if (!best) return null;
  const left = best.left.replace(/[\s,;]+$/, '');
  const right = best.point.keep
    ? best.point.keep + best.right.replace(/^\s+/, '')
    : capitalize(best.right.replace(/^\s+/, ''));
  return `${left}. ${right}`;
}

/** Mots pouvant démarrer une proposition après fusion (mise en minuscule sûre). */
const SAFE_LOWERCASE_START =
  /^(il|elle|ils|elles|on|ce|cet|cette|ces|le|la|les|un|une|des|du|leur|leurs|son|sa|ses|notre|nos|votre|vos|cela|c['’]est|celui|celle|chaque|tout|toute|tous|toutes|plusieurs|certains|certaines|lorsque|quand|si|puisque|car|parce)\b/i;

/**
 * Fusionne deux phrases courtes en une seule.
 * @param {string} a
 * @param {string} b
 * @returns {string|null}
 */
export function mergeShortSentences(a, b) {
  const left = a.replace(/\s*[.!?]+\s*$/, '');
  if (/[!?]\s*$/.test(a)) return null;
  const right = b.trim();
  if (!SAFE_LOWERCASE_START.test(right)) return null;
  const joined = right[0].toLowerCase() + right.slice(1);
  return `${left}, et ${joined}`;
}

/** Compléments circonstanciels déplaçables en fin de phrase. */
const FRONTED_ADVERBIAL =
  /^((?:En|Au|Aux|Dans|Depuis|Après|Avant|Selon|Lors de|À partir de|Grâce à|Au cours de|Durant|Pendant)\b[^,]{2,60}),\s+/;

/**
 * Locutions qui commencent comme un complément circonstanciel mais qui sont en
 * réalité des connecteurs logiques : les déplacer en fin de phrase produirait
 * « … reste limité en outre. »
 */
const FRONTED_CONNECTORS = new Set(
  `en outre|en effet|en revanche|en conclusion|en resume|en particulier|en general|
   en realite|en fait|en somme|en principe|en definitive|en dernier lieu|en premier lieu|
   en second lieu|en consequence|en contrepartie|en parallele|en substance|en clair|
   en bref|en tout cas|en ce sens|en effet meme|au contraire|au demeurant|au surplus|
   au final|au reste|au demeurant|dans ce cas|dans ce contexte|dans cette optique|
   dans cette perspective|dans un premier temps|dans un second temps|dans l ensemble|
   dans la mesure|depuis lors|apres tout|avant tout|selon nous|selon lui|selon elle`
    .split('|')
    .map((s) => s.trim().replace(/\s+/g, ' ')),
);

/** Forme comparable d'une locution : minuscules, sans accent ni apostrophe. */
function plainForm(text) {
  return normalizeWord(text).replace(/['\u2019]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Déplace un complément circonstanciel initial vers la fin de la phrase.
 * @param {string} sentence
 * @returns {string|null}
 */
export function moveFrontedAdverbial(sentence) {
  const m = FRONTED_ADVERBIAL.exec(sentence);
  if (!m) return null;
  if (FRONTED_CONNECTORS.has(plainForm(m[1]))) return null;
  const rest = sentence.slice(m[0].length);
  if (wordCount(rest) < 6) return null;
  const punctuation = /([.!?]+["»”']?)\s*$/.exec(rest);
  const body = punctuation ? rest.slice(0, punctuation.index) : rest;
  const tail = punctuation ? punctuation[1] : '';
  const adverbial = m[1][0].toLowerCase() + m[1].slice(1);
  return `${capitalize(body.trim())} ${adverbial}${tail}`;
}

/* ------------------------------------------------------------------ *
 * Typographie française
 * ------------------------------------------------------------------ */

/**
 * Applique les règles typographiques françaises usuelles.
 * @param {string} text
 * @returns {string}
 */
export function frenchTypography(text) {
  const NARROW = '\u202f'; // espace fine insécable
  return text
    .replace(/\s*\.\.\.(?!\.)/g, '\u2026')
    .replace(/([a-zA-Z\u00e0-\u00ff])'/g, '$1\u2019')
    .replace(/\s+([,.])/g, '$1')
    .replace(/([,;:!?])(?=[^\s\d])/g, '$1 ')
    // Espace fine avant ; ! ? et avant : sauf entre chiffres (« 14:30 », « 3:2 »).
    .replace(/([^\s])[ \t\u00a0\u202f]*([;!?])/g, `$1${NARROW}$2`)
    .replace(/([^\s])[ \t\u00a0\u202f]*:(?=\D|$)/g, `$1${NARROW}:`)
    .replace(/\u00ab\s*/g, `\u00ab${NARROW}`)
    .replace(/\s*\u00bb/g, `${NARROW}\u00bb`)
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\u202f{2,}/g, NARROW);
}


/* ------------------------------------------------------------------ *
 * Différentiel
 * ------------------------------------------------------------------ */

/**
 * Différentiel mot à mot entre deux phrases (plus longue sous-séquence
 * commune). Les phrases étant courtes, l'algorithme quadratique suffit.
 *
 * @param {string} before
 * @param {string} after
 * @returns {{type: 'egal'|'retire'|'ajoute', text: string}[]}
 */
export function wordDiff(before, after) {
  const a = before.split(/(\s+)/).filter((s) => s !== '');
  const b = after.split(/(\s+)/).filter((s) => s !== '');
  const n = a.length;
  const m = b.length;
  if (n * m > 250_000) {
    return [
      { type: 'retire', text: before },
      { type: 'ajoute', text: after },
    ];
  }

  const dp = new Int32Array((n + 1) * (m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * (m + 1) + j] =
        a[i] === b[j]
          ? dp[(i + 1) * (m + 1) + j + 1] + 1
          : Math.max(dp[(i + 1) * (m + 1) + j], dp[i * (m + 1) + j + 1]);
    }
  }

  /** @type {{type: 'egal'|'retire'|'ajoute', text: string}[]} */
  const out = [];
  const push = (type, text) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('egal', a[i]);
      i++;
      j++;
    } else if (dp[(i + 1) * (m + 1) + j] >= dp[i * (m + 1) + j + 1]) {
      push('retire', a[i++]);
    } else {
      push('ajoute', b[j++]);
    }
  }
  while (i < n) push('retire', a[i++]);
  while (j < m) push('ajoute', b[j++]);
  return out;
}

/* ------------------------------------------------------------------ *
 * Point d'entrée
 * ------------------------------------------------------------------ */

/**
 * Réécrit un texte selon les réglages fournis.
 *
 * @param {string} text
 * @param {Partial<typeof HUMANIZE_DEFAULTS>} [options]
 * @param {(ratio: number) => void} [onProgress]
 * @returns {{text: string, changes: any[], operations: Record<string, number>, stats: any}}
 */
export function humanize(text, options = {}, onProgress) {
  const opts = {
    ...HUMANIZE_DEFAULTS,
    ...options,
    operations: { ...HUMANIZE_DEFAULTS.operations, ...(options.operations || {}) },
  };
  const source = String(text || '');
  if (!source.trim()) {
    return {
      text: source,
      changes: [],
      operations: {},
      stats: { before: styleMetrics(source), after: styleMetrics(source), changedWords: 0, changeRatio: 0 },
    };
  }

  const lang = opts.lang === 'auto' ? guessLanguage(source) : opts.lang;
  const lexicon = lexiconFor(lang);
  const rnd = mulberry32(opts.seed || hash32(source));
  const probability = Math.min(1, Math.max(0, opts.intensity));

  /** @type {Record<string, {count: number}>} */
  const counters = {};
  for (const key of Object.keys(OPERATION_LABELS)) counters[key] = { count: 0 };

  /** @type {{start: number, end: number, before: string, after: string}[]} */
  const changes = [];
  const paragraphs = source.split('\n');
  /** @type {string[]} */
  const rebuilt = [];
  let offset = 0;

  paragraphs.forEach((paragraph, pIndex) => {
    if (!paragraph.trim()) {
      rebuilt.push(paragraph);
      offset += paragraph.length + 1;
      return;
    }

    const { masked, slots } = maskProtected(paragraph, opts.preserveQuotes);
    const sentences = splitSentences(masked);
    const hasSentences = sentences.length > 0;
    const pieces = hasSentences
      ? sentences.map((s) => masked.slice(s.start, s.end))
      : [masked];
    /** Séparateurs conservés entre les phrases (espaces, ponctuation isolée). */
    const gaps = [];
    let cursor = 0;
    for (const s of sentences) {
      gaps.push(masked.slice(cursor, s.start));
      cursor = s.end;
    }
    const trailing = hasSentences ? masked.slice(cursor) : '';

    /** @type {string[]} */
    let processed = pieces.map((sentence) => {
      let out = sentence;
      /** Textes insérés par les étapes précédentes, protégés des suivantes. */
      const inserts = [];
      if (opts.operations.phrases) {
        out = replacePhrases(out, lexicon.phrases, rnd, probability, counters.phrases, inserts);
      }
      if (opts.operations.passive && lang === 'fr') {
        out = replaceNominalizations(out, PASSIVE_FR, rnd, probability, counters.passive, inserts);
      }
      if (opts.operations.nominalizations) {
        out = replaceNominalizations(
          out,
          lexicon.nominalizations,
          rnd,
          probability,
          counters.nominalizations,
          inserts,
        );
      }
      if (opts.operations.connectors) {
        out = replaceConnectors(
          out,
          lexicon.connectors,
          rnd,
          probability,
          counters.connectors,
          inserts,
        );
      }
      if (opts.operations.fillers) {
        out = removeFillers(out, lexicon.fillers, rnd, probability, counters.fillers);
      }
      if (opts.operations.synonyms) {
        out = replaceWords(out, lexicon.words, rnd, probability, counters.synonyms, inserts);
      }
      // Les insertions redeviennent du texte ordinaire pour les
      // transformations de structure qui suivent.
      out = restoreInserts(out, inserts);
      if (opts.operations.reorder && lang === 'fr' && rnd() < probability * 0.5) {
        const moved = moveFrontedAdverbial(out);
        if (moved) {
          out = moved;
          counters.reorder.count++;
        }
      }
      if (opts.operations.splitLong && wordCount(out) > opts.maxSentenceWords) {
        const split = splitLongSentence(out);
        if (split) {
          out = split;
          counters.splitLong.count++;
        }
      }
      return out;
    });

    if (opts.operations.mergeShort) {
      /** @type {string[]} */
      const merged = [];
      for (let i = 0; i < processed.length; i++) {
        const current = processed[i];
        const next = processed[i + 1];
        if (
          next &&
          wordCount(current) < opts.minSentenceWords &&
          wordCount(next) < opts.minSentenceWords &&
          rnd() < probability
        ) {
          const fusion = mergeShortSentences(current, next);
          if (fusion) {
            merged.push(fusion);
            counters.mergeShort.count++;
            i++;
            continue;
          }
        }
        merged.push(current);
      }
      processed = merged;
    }

    // Réassemblage en conservant les séparateurs d'origine autant que possible.
    let rebuiltParagraph = '';
    for (let i = 0; i < processed.length; i++) {
      rebuiltParagraph += (gaps[i] ?? (i === 0 ? '' : ' ')) + processed[i];
    }
    rebuiltParagraph += trailing;

    if (opts.operations.typography && lang === 'fr') {
      const before = rebuiltParagraph;
      rebuiltParagraph = frenchTypography(rebuiltParagraph);
      if (before !== rebuiltParagraph) counters.typography.count++;
    }

    const finalParagraph = unmaskProtected(rebuiltParagraph, slots).trim();
    if (finalParagraph !== paragraph.trim()) {
      changes.push({
        start: offset,
        end: offset + paragraph.length,
        before: paragraph,
        after: finalParagraph,
        index: pIndex,
      });
    }
    rebuilt.push(finalParagraph);
    offset += paragraph.length + 1;

    if (onProgress && pIndex % 25 === 0) {
      onProgress(pIndex / Math.max(1, paragraphs.length));
    }
  });

  const result = rebuilt.join('\n');
  const before = styleMetrics(source);
  const after = styleMetrics(result);
  const changedWords = changes.reduce(
    (sum, c) => sum + countChangedWords(c.before, c.after),
    0,
  );

  /** @type {Record<string, number>} */
  const operations = {};
  for (const [key, counter] of Object.entries(counters)) {
    if (counter.count > 0) operations[key] = counter.count;
  }

  return {
    text: result,
    changes,
    operations,
    lang,
    stats: {
      before,
      after,
      changedWords,
      changeRatio: before.words ? Math.round((changedWords / before.words) * 1000) / 10 : 0,
      paragraphsChanged: changes.length,
      paragraphsTotal: paragraphs.filter((p) => p.trim()).length,
    },
  };
}

/** Compte les mots réellement modifiés entre deux versions d'un paragraphe. */
function countChangedWords(before, after) {
  const diff = wordDiff(before, after);
  let count = 0;
  for (const part of diff) {
    if (part.type === 'ajoute') count += wordCount(part.text);
  }
  return count;
}

/** Détection de langue rapide, suffisante pour choisir le lexique. */
function guessLanguage(text) {
  const sample = normalizeWord(text.slice(0, 4000));
  const fr = (sample.match(/\b(le|la|les|des|une|est|dans|pour|que|qui|avec|sur)\b/g) || []).length;
  const en = (sample.match(/\b(the|and|of|to|in|that|is|for|with|are)\b/g) || []).length;
  return en > fr ? 'en' : 'fr';
}
