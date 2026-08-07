/**
 * Vérification croisée des citations et de la bibliographie.
 *
 * Deux contrôles complémentaires, précieux pour un mémoire :
 *   • chaque appel de citation « (Auteur, année) » du corps du texte doit
 *     correspondre à une entrée de la bibliographie — sinon la référence est
 *     **orpheline** ;
 *   • chaque entrée de la bibliographie doit être citée au moins une fois —
 *     sinon elle est **jamais citée** (bourrage de bibliographie).
 *
 * Le style numérique « [12] » est également contrôlé par bornes.
 *
 * @module core/citations
 */

import { normalizeWord } from './text.js';

/** Appels auteur-année entre parenthèses : (Dupont, 2019), (Nadeau et al., 2020b)… */
const PAREN_RE =
  /\(([A-ZÀ-Ý][\p{L}’'-]+(?:\s+(?:et\s+al\.?|&\s+[A-ZÀ-Ý][\p{L}’'-]+|et\s+[A-ZÀ-Ý][\p{L}’'-]+))?),?\s+((?:1[5-9]|20)\d{2}[a-c]?)(?:\s*,\s*p{1,2}\.?\s*\d+(?:[–-]\d+)?)?\)/gu;

/** Appels narratifs : « Dupont (2019) montre que… ». */
const NARRATIVE_RE =
  /\b([A-ZÀ-Ý][\p{L}’'-]{2,})\s+\(((?:1[5-9]|20)\d{2}[a-c]?)\)/gu;

/** Appels numériques : [12], [3, 7], [4-6]. */
const NUMERIC_RE = /\[(\d{1,3}(?:\s*[,;]\s*\d{1,3}|\s*[–-]\s*\d{1,3})*)\]/g;

const YEAR_RE = /\b((?:1[5-9]|20)\d{2})[a-c]?\b/;

/**
 * @typedef {Object} Citation
 * @property {string} author   nom tel qu'écrit
 * @property {string} key      nom normalisé
 * @property {string} year
 * @property {number} index    position dans le texte
 * @property {string} context  extrait environnant
 */

/**
 * Extrait les appels de citation du corps du texte.
 * @param {string} text
 * @returns {{authorYear: Citation[], numeric: {numbers: number[], index: number}[]}}
 */
export function extractCitations(text) {
  /** @type {Citation[]} */
  const authorYear = [];
  /** @type {Set<string>} dédoublonnage (auteur, année, position arrondie) */
  const seen = new Set();

  const push = (author, year, index) => {
    const key = normalizeWord(author.replace(/\s+et\s+al\.?$/i, '').replace(/\s*&.*$/, ''));
    const id = `${key}|${year}|${index >> 6}`;
    if (seen.has(id)) return;
    seen.add(id);
    authorYear.push({
      author,
      key,
      year,
      index,
      context: text.slice(Math.max(0, index - 40), index + 60).replace(/\s+/g, ' ').trim(),
    });
  };

  PAREN_RE.lastIndex = 0;
  let m;
  while ((m = PAREN_RE.exec(text)) !== null) push(m[1], m[2], m.index);

  NARRATIVE_RE.lastIndex = 0;
  while ((m = NARRATIVE_RE.exec(text)) !== null) push(m[1], m[2], m.index);

  /** @type {{numbers: number[], index: number}[]} */
  const numeric = [];
  NUMERIC_RE.lastIndex = 0;
  while ((m = NUMERIC_RE.exec(text)) !== null) {
    /** @type {number[]} */
    const numbers = [];
    for (const part of m[1].split(/[,;]/)) {
      const range = part.split(/[–-]/).map((s) => parseInt(s.trim(), 10));
      if (range.length === 2 && range.every(Number.isFinite) && range[1] > range[0] && range[1] - range[0] < 60) {
        for (let n = range[0]; n <= range[1]; n++) numbers.push(n);
      } else if (Number.isFinite(range[0])) {
        numbers.push(range[0]);
      }
    }
    if (numbers.length) numeric.push({ numbers, index: m.index });
  }

  return { authorYear, numeric };
}

/**
 * @typedef {Object} BiblioEntry
 * @property {string} text     entrée complète (tronquée)
 * @property {string[]} keys   noms propres normalisés de l'entrée
 * @property {string[]} years  années trouvées
 * @property {number} start
 */

/**
 * Analyse les entrées de la section bibliographique.
 *
 * @param {{text: string, start: number, end: number}[]} paragraphs
 * @param {{start: number, end: number}} range bornes de la bibliographie
 * @returns {BiblioEntry[]}
 */
export function extractBibliography(paragraphs, range) {
  /** @type {BiblioEntry[]} */
  const entries = [];
  for (const p of paragraphs) {
    if (p.start < range.start || p.start >= range.end) continue;
    const body = p.text.replace(/^\s*(?:\[\d+\]|\d+[.)])\s*/, '');
    if (body.length < 15) continue; // titre de section, ligne vide…
    const years = [];
    const yearRe = new RegExp(YEAR_RE.source, 'g');
    let ym;
    while ((ym = yearRe.exec(body)) !== null) years.push(ym[1]);
    if (!years.length) continue; // pas une référence datée
    /** @type {string[]} */
    const keys = [];
    const nameRe = /\b([A-ZÀ-Ý][\p{L}’'-]{2,})\b/gu;
    let nm;
    while ((nm = nameRe.exec(body.slice(0, 120))) !== null && keys.length < 6) {
      const key = normalizeWord(nm[1]);
      if (!keys.includes(key)) keys.push(key);
    }
    if (!keys.length) continue;
    entries.push({
      text: body.length > 220 ? `${body.slice(0, 220)}…` : body,
      keys,
      years,
      start: p.start,
    });
  }
  return entries;
}

/**
 * Contrôle croisé complet.
 *
 * @param {string} text texte intégral du document
 * @param {{text: string, start: number, end: number}[]} paragraphs
 * @param {{start: number, end: number}|null} biblioRange
 * @returns {{
 *   style: 'auteur-annee'|'numerique'|'mixte'|'aucune',
 *   inTextCount: number, entryCount: number,
 *   orphans: Citation[], uncited: BiblioEntry[],
 *   numericIssues: string[], matchedRatio: number,
 *   hasBibliography: boolean,
 * }}
 */
export function checkCitations(text, paragraphs, biblioRange) {
  // Les appels sont cherchés hors bibliographie pour ne pas se compter eux-mêmes.
  const bodyEnd = biblioRange ? biblioRange.start : text.length;
  const body = text.slice(0, bodyEnd);
  const { authorYear, numeric } = extractCitations(body);

  const entries = biblioRange
    ? extractBibliography(paragraphs, biblioRange)
    : [];

  /** Année identique à un suffixe près (2019 ≈ 2019b). */
  const sameYear = (a, b) => a.replace(/[a-c]$/, '') === b.replace(/[a-c]$/, '');

  /** @type {Citation[]} */
  const orphans = [];
  const citedEntries = new Set();
  for (const citation of authorYear) {
    const match = entries.findIndex(
      (e) =>
        e.keys.includes(citation.key) &&
        e.years.some((y) => sameYear(y, citation.year)),
    );
    if (match >= 0) citedEntries.add(match);
    else orphans.push(citation);
  }

  const uncited = entries.filter((entry, i) => {
    if (citedEntries.has(i)) return false;
    // Style numérique : une entrée peut n'être appelée que par son numéro.
    if (numeric.length) return false;
    return true;
  });

  /** @type {string[]} */
  const numericIssues = [];
  if (numeric.length) {
    const max = entries.length;
    const outOfRange = new Set();
    for (const call of numeric) {
      for (const n of call.numbers) {
        if (max && (n < 1 || n > max)) outOfRange.add(n);
      }
    }
    if (outOfRange.size) {
      numericIssues.push(
        `Appel(s) [${[...outOfRange].sort((a, b) => a - b).join(', ')}] hors des ${max} entrées de la bibliographie.`,
      );
    }
    if (!entries.length) {
      numericIssues.push(
        `${numeric.length} appel(s) numérique(s) mais aucune bibliographie détectée.`,
      );
    }
  }

  const style =
    authorYear.length && numeric.length
      ? 'mixte'
      : authorYear.length
        ? 'auteur-annee'
        : numeric.length
          ? 'numerique'
          : 'aucune';

  const inTextCount = authorYear.length + numeric.length;
  const matchedRatio = authorYear.length
    ? (authorYear.length - orphans.length) / authorYear.length
    : numeric.length && !numericIssues.length
      ? 1
      : 0;

  return {
    style,
    inTextCount,
    entryCount: entries.length,
    orphans: orphans.slice(0, 50),
    uncited: uncited.slice(0, 50),
    numericIssues,
    matchedRatio: Math.round(matchedRatio * 100) / 100,
    hasBibliography: Boolean(biblioRange),
  };
}
