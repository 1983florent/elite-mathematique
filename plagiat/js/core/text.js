/**
 * Traitement linguistique : normalisation, tokenisation avec décalages,
 * segmentation en phrases, racinisation légère et empreintes n-grammes.
 *
 * Contrainte de conception : **aucune chaîne de caractères n'est conservée par
 * jeton**. Un document d'un million de mots tient dans quelques mégaoctets de
 * tableaux typés, et le texte d'un jeton se retrouve à la demande via ses
 * décalages dans le texte source.
 *
 * @module core/text
 */

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

/** Remplacements typographiques appliqués avant toute analyse. */
const TYPO_MAP = new Map([
  ['\u2018', "'"], ['\u2019', "'"], ['\u201a', "'"], ['\u201b', "'"],
  ['\u201c', '"'], ['\u201d', '"'], ['\u201e', '"'], ['\u00ab', '"'],
  ['\u00bb', '"'], ['\u2013', '-'], ['\u2014', '-'], ['\u2212', '-'],
  ['\u2026', '...'], ['\u00a0', ' '], ['\u202f', ' '], ['\u2009', ' '],
  ['\u200b', ''], ['\ufeff', ''],
]);

/**
 * Uniformise apostrophes, guillemets, tirets et espaces insécables.
 * @param {string} s
 * @returns {string}
 */
export function normalizeTypography(s) {
  let out = '';
  for (const ch of s) out += TYPO_MAP.has(ch) ? TYPO_MAP.get(ch) : ch;
  return out;
}

const LIGATURES = /[œŒæÆ]/g;
const LIG_MAP = { œ: 'oe', Œ: 'oe', æ: 'ae', Æ: 'ae' };

/**
 * Forme canonique d'un mot : minuscules, sans accent ni ligature.
 * @param {string} w
 * @returns {string}
 */
export function normalizeWord(w) {
  return w
    .toLowerCase()
    .replace(LIGATURES, (m) => LIG_MAP[m])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/* ------------------------------------------------------------------ *
 * Mots vides
 * ------------------------------------------------------------------ */

const STOPWORDS_FR = `a afin ai aie aient aies ainsi ait alors apres au aucun aucune
auquel aura aurai auraient aurais aurait auras aurez auriez aurions aurons auront
aussi autant autre autres aux auxquelles auxquels avaient avais avait avant avec
avez aviez avions avoir avons ayant ayez ayons beaucoup bien car ce ceci cela celle
celles celui cependant certain certaine certaines certains ces cet cette ceux chacun
chaque chez ci comme comment concernant dans de dedans dehors deja delà depuis des
desormais desquelles desquels dessous dessus deux devant devers devra devrait doit
doivent donc dont du duquel durant elle elles en encore entre envers environ es est
et etaient etais etait etant etc ete etes etiez etions etre eu eue eues eurent eus
eut eux fait faire fais faisait fait faites fois font furent fus fut hors ici il ils
je jusqu jusque la laquelle le lequel les lesquelles lesquels leur leurs lors lorsque
lui ma mais malgre me meme memes mes mien mienne miens moi moins mon ne ni nombreux
non nos notamment notre nous nul on ont ou ouias oui outre par parce parfois parmi
pas pendant peu peut peuvent plus plusieurs plutot possible pour pourquoi pourtant
pouvait pouvoir premier premiere pres puis puisque qu quand quant que quel quelle
quelles quelque quelques quels qui quoi sa sans sauf se selon sera serai seraient
serait seras serez seriez serions serons seront ses si sien sienne siens soi soient
sois soit sommes son sont sous soyez soyons suis sur surtout ta tandis tant te tel
telle telles tels tes tien tienne tiens toi ton toujours tous tout toute toutes tres
trop tu un une unes uns va vais vers via voici voila vos votre vous vu y etait ete`
  .split(/\s+/)
  .filter(Boolean);

const STOPWORDS_EN = `a about above after again against all am an and any are aren as
at be because been before being below between both but by can cannot could did do
does doing don down during each few for from further had has have having he her here
hers herself him himself his how i if in into is it its itself just me more most my
myself no nor not of off on once only or other ought our ours ourselves out over own
same she should so some such than that the their theirs them themselves then there
these they this those through to too under until up very was we were what when where
which while who whom why with would you your yours yourself yourselves`
  .split(/\s+/)
  .filter(Boolean);

/** @type {Set<string>} */
export const STOPWORDS = new Set([...STOPWORDS_FR, ...STOPWORDS_EN]);
/** @type {Set<string>} */
export const STOPWORDS_FR_SET = new Set(STOPWORDS_FR);
/** @type {Set<string>} */
export const STOPWORDS_EN_SET = new Set(STOPWORDS_EN);

/* ------------------------------------------------------------------ *
 * Racinisation légère
 * ------------------------------------------------------------------ */

/**
 * Suffixes retirés après désingularisation, du plus long au plus court.
 *
 * La liste mêle français et anglais : l'objectif n'est pas la justesse
 * linguistique mais la **stabilité**, c'est-à-dire produire la même racine
 * pour toutes les formes fléchies d'un même lemme.
 */
const SUFFIXES = [
  // Français
  'issement', 'atrice', 'ateur', 'ement', 'ance', 'ence', 'isme', 'iste',
  'aient', 'erent', 'irent', 'eront', 'iront', 'erais', 'erait', 'euse',
  'ment', 'ant', 'ent', 'eur', 'ons', 'ont', 'iez', 'ee', 'er', 'ir', 'ez',
  'ai', 'at',
  // Anglais
  'ational', 'iveness', 'fulness', 'ousness', 'ization', 'ation', 'ivity',
  'ness', 'ing', 'ied', 'ive', 'ful', 'ous', 'ed', 'ly',
  // Voyelle finale (commune aux deux langues)
  'e',
].sort((a, b) => b.length - a.length);

/**
 * Racinisation approximative, volontairement prudente : elle sert uniquement à
 * rapprocher des formes fléchies lors de la détection de paraphrase.
 *
 * Deux étapes : désingularisation puis retrait d'un suffixe, avec une racine
 * minimale de trois caractères pour éviter les rapprochements abusifs.
 *
 * @param {string} word forme déjà normalisée (minuscule, sans accent)
 * @returns {string}
 */
export function stem(word) {
  if (word.length < 4) return word;
  if (/^\d/.test(word)) return word;

  let w = word;

  // 1. Pluriels : « chevaux » → « cheval », « bateaux » → « bateau ».
  if (w.length > 5 && w.endsWith('eaux')) w = w.slice(0, -1);
  else if (w.length > 4 && w.endsWith('aux')) w = w.slice(0, -3) + 'al';
  else if (w.length >= 4 && (w.endsWith('s') || w.endsWith('x'))) w = w.slice(0, -1);

  // 2. Suffixe dérivationnel le plus long possible.
  for (const suffix of SUFFIXES) {
    if (w.length - suffix.length >= 3 && w.endsWith(suffix)) {
      return w.slice(0, -suffix.length);
    }
  }
  return w;
}

/* ------------------------------------------------------------------ *
 * Hachage
 * ------------------------------------------------------------------ */

/**
 * Hachage 32 bits (FNV-1a suivi d'un brassage final).
 * @param {string} s
 * @param {number} [seed]
 * @returns {number} entier non signé
 */
export function hash32(s, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/* ------------------------------------------------------------------ *
 * Tokenisation
 * ------------------------------------------------------------------ */

const WORD_RE = /[\p{L}\p{N}]+(?:['\u2019\u02bc][\p{L}\p{N}]+|-[\p{L}\p{N}]+)*/gu;
// Élisions françaises : « l'analyse » doit produire le jeton « analyse ».
const ELISION_RE = /^(?:[cdjlmnst]|qu|jusqu|lorsqu|puisqu|quoiqu)['\u2019\u02bc]/i;

/**
 * @typedef {Object} TokenStream
 * @property {string} text            texte source (référence, non copié)
 * @property {number} count           nombre de jetons
 * @property {Int32Array} start       décalage de début de chaque jeton
 * @property {Int32Array} end         décalage de fin (exclu)
 * @property {Uint32Array} hash       hachage de la racine du jeton
 * @property {Uint8Array} flags       bit 0 = mot vide, bit 1 = numérique
 */

const FLAG_STOP = 1;
const FLAG_NUM = 2;

/**
 * Découpe un texte en jetons en conservant les décalages d'origine.
 *
 * @param {string} text
 * @returns {TokenStream}
 */
export function tokenize(text) {
  const starts = [];
  const ends = [];
  const hashes = [];
  const flags = [];

  WORD_RE.lastIndex = 0;
  let m;
  while ((m = WORD_RE.exec(text)) !== null) {
    let raw = m[0];
    let offset = m.index;

    // Retire l'élision initiale (« l'élève » → « élève ») tout en gardant
    // le décalage correct dans le texte d'origine.
    const elision = ELISION_RE.exec(raw);
    if (elision && raw.length > elision[0].length) {
      offset += elision[0].length;
      raw = raw.slice(elision[0].length);
    }

    const norm = normalizeWord(raw);
    if (!norm) continue;

    starts.push(offset);
    ends.push(offset + raw.length);

    let f = 0;
    if (STOPWORDS.has(norm)) f |= FLAG_STOP;
    if (/^\d/.test(norm)) f |= FLAG_NUM;
    flags.push(f);
    hashes.push(hash32(stem(norm)));
  }

  return {
    text,
    count: starts.length,
    start: Int32Array.from(starts),
    end: Int32Array.from(ends),
    hash: Uint32Array.from(hashes),
    flags: Uint8Array.from(flags),
  };
}

/**
 * Indique si le jeton `i` est un mot vide.
 * @param {TokenStream} tokens
 * @param {number} i
 */
export function isStop(tokens, i) {
  return (tokens.flags[i] & FLAG_STOP) !== 0;
}

/**
 * Restitue le texte original d'un jeton.
 * @param {TokenStream} tokens
 * @param {number} i
 */
export function tokenText(tokens, i) {
  return tokens.text.slice(tokens.start[i], tokens.end[i]);
}

/**
 * Restitue le texte original couvrant les jetons `[from, to)`.
 * @param {TokenStream} tokens
 * @param {number} from
 * @param {number} to
 */
export function spanText(tokens, from, to) {
  if (to <= from) return '';
  const a = tokens.start[Math.max(0, from)];
  const b = tokens.end[Math.min(tokens.count - 1, to - 1)];
  return tokens.text.slice(a, b);
}

/**
 * Détecte la langue dominante par densité de mots vides.
 * @param {TokenStream} tokens
 * @returns {{lang: 'fr'|'en'|'inconnue', confidence: number}}
 */
export function detectLanguage(tokens) {
  let fr = 0;
  let en = 0;
  const limit = Math.min(tokens.count, 5000);
  for (let i = 0; i < limit; i++) {
    const w = normalizeWord(tokenText(tokens, i));
    if (STOPWORDS_FR_SET.has(w)) fr++;
    if (STOPWORDS_EN_SET.has(w)) en++;
  }
  const total = fr + en;
  if (total < 10) return { lang: 'inconnue', confidence: 0 };
  const lang = fr >= en ? 'fr' : 'en';
  const confidence = Math.max(fr, en) / total;
  return { lang, confidence };
}

/* ------------------------------------------------------------------ *
 * Segmentation en phrases
 * ------------------------------------------------------------------ */

const ABBREVIATIONS = new Set([
  'm', 'mm', 'mme', 'mmes', 'mlle', 'mlles', 'dr', 'drs', 'pr', 'me', 'mes',
  'st', 'ste', 'sts', 'stes', 'cf', 'ed', 'eds', 'vol', 'vols', 'no', 'nos',
  'art', 'arts', 'fig', 'figs', 'p', 'pp', 'ex', 'etc', 'av', 'apr', 'al',
  'ibid', 'op', 'cit', 'env', 'chap', 'sect', 'trad', 'dir', 'coll', 'tome',
  'ref', 'refs', 'eq', 'th', 'prop', 'def', 'lem', 'cor', 'resp', 'inc',
  'ltd', 'co', 'jr', 'sr', 'vs', 'i.e', 'e.g', 'j.-c', 'apr.j.-c', 'univ',
  'jan', 'fev', 'mar', 'avr', 'juil', 'sept', 'oct', 'nov', 'dec',
]);

/**
 * Découpe un texte en phrases.
 *
 * Les abréviations courantes, les initiales, les nombres décimaux et les
 * guillemets fermants sont gérés pour éviter les coupures parasites.
 *
 * @param {string} text
 * @param {number} [baseOffset] décalage à ajouter aux positions renvoyées
 * @returns {{start: number, end: number}[]}
 */
export function splitSentences(text, baseOffset = 0) {
  /** @type {{start: number, end: number}[]} */
  const out = [];
  const len = text.length;
  let start = 0;
  let i = 0;

  while (i < len) {
    const ch = text[i];

    if (ch === '\n') {
      // Un saut de ligne clôt toujours la phrase courante.
      if (i > start && text.slice(start, i).trim()) {
        out.push({ start: baseOffset + start, end: baseOffset + i });
      }
      i++;
      start = i;
      continue;
    }

    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== '…') {
      i++;
      continue;
    }

    // Consomme les points de suspension et la ponctuation redoublée.
    let stop = i + 1;
    while (stop < len && '.!?…'.includes(text[stop])) stop++;
    // Guillemets et parenthèses fermantes appartiennent encore à la phrase.
    while (stop < len && '"\u00bb)]\'\u2019\u201d'.includes(text[stop])) stop++;

    if (ch === '.') {
      // Nombre décimal (3.14) ou numérotation (1.2.3) : pas une fin de phrase.
      const prev = text[i - 1];
      const next = text[stop];
      if (prev >= '0' && prev <= '9' && next >= '0' && next <= '9') {
        i = stop;
        continue;
      }
      // Abréviation ou initiale.
      let wordStart = i - 1;
      while (wordStart >= 0 && /[\p{L}\p{N}.\-]/u.test(text[wordStart])) wordStart--;
      const word = normalizeWord(text.slice(wordStart + 1, i));
      if (word.length === 1 && /[a-z]/.test(word)) {
        i = stop;
        continue; // initiale (« J. Dupont »)
      }
      if (ABBREVIATIONS.has(word) || ABBREVIATIONS.has(word.replace(/\.$/, ''))) {
        i = stop;
        continue;
      }
    }

    // Une fin de phrase doit être suivie d'un blanc puis d'un début de phrase.
    let j = stop;
    while (j < len && (text[j] === ' ' || text[j] === '\t')) j++;
    const isEnd =
      j >= len ||
      text[j] === '\n' ||
      /[\p{Lu}0-9"\u00ab(\[\u2014-]/u.test(text[j]);

    if (isEnd && j > stop) {
      if (text.slice(start, stop).trim()) {
        out.push({ start: baseOffset + start, end: baseOffset + stop });
      }
      start = j;
      i = j;
      continue;
    }
    if (isEnd && j >= len) {
      if (text.slice(start, stop).trim()) {
        out.push({ start: baseOffset + start, end: baseOffset + stop });
      }
      start = stop;
      i = stop;
      continue;
    }
    i = stop;
  }

  if (start < len && text.slice(start).trim()) {
    out.push({ start: baseOffset + start, end: baseOffset + len });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Flux d'empreintes
 * ------------------------------------------------------------------ */

/**
 * @typedef {Object} Fingerprints
 * @property {Uint32Array} hash  empreinte de chaque n-gramme retenu
 * @property {Int32Array} pos    indice du premier jeton du n-gramme
 * @property {number} k          taille du n-gramme
 */

/**
 * Construit un flux dérivé (tous les jetons, ou seulement les mots pleins).
 *
 * @param {TokenStream} tokens
 * @param {boolean} contentOnly retire les mots vides et les nombres isolés
 * @returns {{hash: Uint32Array, map: Int32Array}}
 */
export function buildStream(tokens, contentOnly) {
  if (!contentOnly) {
    const map = new Int32Array(tokens.count);
    for (let i = 0; i < tokens.count; i++) map[i] = i;
    return { hash: tokens.hash, map };
  }
  const hash = new Uint32Array(tokens.count);
  const map = new Int32Array(tokens.count);
  let n = 0;
  for (let i = 0; i < tokens.count; i++) {
    if (tokens.flags[i] & FLAG_STOP) continue;
    if (tokens.end[i] - tokens.start[i] < 2) continue;
    hash[n] = tokens.hash[i];
    map[n] = i;
    n++;
  }
  return { hash: hash.subarray(0, n), map: map.subarray(0, n) };
}

/**
 * Calcule les empreintes de n-grammes, avec « winnowing » facultatif.
 *
 * Le winnowing (algorithme de Schleimer & al., utilisé par MOSS) ne conserve
 * que le minimum local de chaque fenêtre : l'index est allégé tout en
 * garantissant la détection de tout passage commun d'au moins `w + k - 1`
 * jetons.
 *
 * @param {{hash: Uint32Array}} stream
 * @param {number} k taille du n-gramme
 * @param {number} [w] taille de fenêtre de winnowing (1 = désactivé)
 * @returns {Fingerprints}
 */
export function fingerprint(stream, k, w = 1) {
  const src = stream.hash;
  const n = src.length;
  if (n < k) return { hash: new Uint32Array(0), pos: new Int32Array(0), k };

  const total = n - k + 1;
  const grams = new Uint32Array(total);
  for (let i = 0; i < total; i++) {
    // Polynôme de hachage sur k jetons ; k reste petit (4 à 10).
    let h = 0x9e3779b1;
    for (let j = 0; j < k; j++) {
      h = (Math.imul(h, 0x85ebca6b) ^ src[i + j]) >>> 0;
      h = ((h << 13) | (h >>> 19)) >>> 0;
    }
    grams[i] = h >>> 0;
  }

  if (w <= 1) {
    const pos = new Int32Array(total);
    for (let i = 0; i < total; i++) pos[i] = i;
    return { hash: grams, pos, k };
  }

  // Winnowing : minimum de chaque fenêtre glissante, sans doublon consécutif.
  const outHash = new Uint32Array(total);
  const outPos = new Int32Array(total);
  let count = 0;
  let lastSelected = -1;
  const windows = total - w + 1;
  for (let i = 0; i < windows; i++) {
    let minIdx = i;
    for (let j = i + 1; j < i + w; j++) {
      if (grams[j] <= grams[minIdx]) minIdx = j; // le plus à droite en cas d'égalité
    }
    if (minIdx !== lastSelected) {
      outHash[count] = grams[minIdx];
      outPos[count] = minIdx;
      count++;
      lastSelected = minIdx;
    }
  }
  return {
    hash: outHash.subarray(0, count),
    pos: outPos.subarray(0, count),
    k,
  };
}

/* ------------------------------------------------------------------ *
 * Mesures de style
 * ------------------------------------------------------------------ */

/**
 * Indicateurs lexicaux et stylistiques d'un texte.
 * @param {string} text
 */
export function styleMetrics(text) {
  const tokens = tokenize(text);
  const sentences = splitSentences(text);
  const lengths = sentences.map((s) => {
    const sub = text.slice(s.start, s.end);
    return (sub.match(WORD_RE) || []).length;
  });
  const words = tokens.count || 1;
  const mean = lengths.length
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length
    : 0;
  const variance = lengths.length
    ? lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length
    : 0;

  const unique = new Set();
  for (let i = 0; i < tokens.count; i++) {
    unique.add(normalizeWord(tokenText(tokens, i)));
  }
  let stopCount = 0;
  for (let i = 0; i < tokens.count; i++) if (tokens.flags[i] & FLAG_STOP) stopCount++;

  const syllables = estimateSyllables(text);
  return {
    words: tokens.count,
    characters: text.length,
    sentences: sentences.length,
    avgSentenceLength: round2(mean),
    sentenceLengthStdDev: round2(Math.sqrt(variance)),
    /** Variabilité de la longueur des phrases : plus c'est haut, plus le
     *  rythme est « humain ». */
    burstiness: round2(mean ? Math.sqrt(variance) / mean : 0),
    typeTokenRatio: round2(unique.size / words),
    stopwordRatio: round2(stopCount / words),
    /** Indice de lisibilité Flesch adapté au français (Kandel & Moles). */
    readability: round2(
      207 - 1.015 * (mean || 0) - 73.6 * (syllables / words),
    ),
  };
}

/** @param {number} n */
function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Estimation du nombre de syllabes (groupes voyelliques).
 * @param {string} text
 */
export function estimateSyllables(text) {
  const m = normalizeWord(text).match(/[aeiouy]+/g);
  return m ? m.length : 0;
}
