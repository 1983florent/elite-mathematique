/**
 * Comparaison directe de deux documents et empreintes partageables.
 *
 * - `compareTexts` confronte deux textes complets (deux copies d'étudiants,
 *   deux versions d'un mémoire) et restitue la couverture croisée et les
 *   passages communs.
 *
 * - Les **empreintes** répondent à un besoin de confidentialité : un
 *   enseignant peut publier l'empreinte d'un sujet corrigé ou d'anciennes
 *   copies, une simple liste de hachages, sans jamais diffuser le texte.
 *   Quiconque possède l'empreinte peut vérifier qu'un document ne recopie pas
 *   la source, mais ne peut pas la reconstituer.
 *
 * @module core/compare
 */

import { tokenize, spanText, buildStream, fingerprint } from './text.js';
import {
  buildDocumentIndex,
  matchSource,
  unionCoverage,
  multisetDice,
  classify,
} from './matcher.js';

/**
 * Confronte deux textes complets.
 *
 * @param {string} textA
 * @param {string} textB
 * @param {{minTokens?: number}} [options]
 */
export function compareTexts(textA, textB, options = {}) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const index = buildDocumentIndex(tokensA);
  const matches = matchSource(index, tokensB, {
    minTokensExact: options.minTokens ?? 8,
  });

  const coverageA = unionCoverage(matches).covered / Math.max(1, tokensA.count);
  const coverageB =
    unionCoverage(matches.map((m) => ({ qStart: m.sStart, qEnd: m.sEnd })))
      .covered / Math.max(1, tokensB.count);

  const contentA = buildStream(tokensA, true);
  const contentB = buildStream(tokensB, true);
  const dice = multisetDice(contentA.hash, contentB.hash);

  const passages = matches
    .map((m) => ({
      aStart: m.qStart,
      aEnd: m.qEnd,
      bStart: m.sStart,
      bEnd: m.sEnd,
      words: m.qEnd - m.qStart,
      similarity: Math.round(m.similarity * 1000) / 1000,
      type: m.type,
      typeLabel: classify(m.similarity).label,
      aText: spanText(tokensA, m.qStart, m.qEnd),
      bText: spanText(tokensB, m.sStart, m.sEnd),
    }))
    .sort((x, y) => y.words - x.words);

  return {
    aWords: tokensA.count,
    bWords: tokensB.count,
    coverageA: pct(coverageA),
    coverageB: pct(coverageB),
    lexicalSimilarity: pct(dice),
    passages,
    verdict: verdictFor(Math.max(coverageA, coverageB)),
  };
}

/** @param {number} v */
function pct(v) {
  return Math.round(v * 1000) / 10;
}

/** @param {number} coverage 0..1 */
function verdictFor(coverage) {
  if (coverage >= 0.6) {
    return { code: 'quasi-identiques', label: 'Documents quasi identiques' };
  }
  if (coverage >= 0.25) {
    return { code: 'forte-parente', label: 'Forte parenté' };
  }
  if (coverage >= 0.08) {
    return { code: 'emprunts-ponctuels', label: 'Emprunts ponctuels' };
  }
  return { code: 'independants', label: 'Documents indépendants' };
}

/* ------------------------------------------------------------------ *
 * Empreintes
 * ------------------------------------------------------------------ */

export const FINGERPRINT_FORMAT = 'elite-empreinte';
export const FINGERPRINT_VERSION = 1;
const FINGERPRINT_K = 8;

/**
 * Construit l'empreinte partageable d'un texte.
 *
 * Seuls des hachages 32 bits de n-grammes en sont extraits : le texte
 * d'origine ne peut pas être reconstitué à partir du fichier.
 *
 * @param {string} name nom affiché (ex. « Corrigé 2024 »)
 * @param {string} text
 * @returns {{format: string, version: number, name: string, createdAt: string,
 *            words: number, k: number, hashes: number[]}}
 */
export function createFingerprint(name, text) {
  const tokens = tokenize(text);
  const stream = buildStream(tokens, false);
  const fp = fingerprint(stream, FINGERPRINT_K, 1);
  const unique = [...new Set(fp.hash)].sort((a, b) => a - b);
  return {
    format: FINGERPRINT_FORMAT,
    version: FINGERPRINT_VERSION,
    name: String(name || 'document'),
    createdAt: new Date().toISOString(),
    words: tokens.count,
    k: FINGERPRINT_K,
    hashes: unique,
  };
}

/**
 * Valide un fichier d'empreinte désérialisé.
 * @param {any} data
 * @returns {{ok: true, fp: any}|{ok: false, error: string}}
 */
export function validateFingerprint(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Fichier illisible.' };
  }
  if (data.format !== FINGERPRINT_FORMAT) {
    return { ok: false, error: 'Ce fichier n’est pas une empreinte ELITE.' };
  }
  if (!Array.isArray(data.hashes) || !data.hashes.length) {
    return { ok: false, error: 'Empreinte vide.' };
  }
  if (!Number.isInteger(data.k) || data.k < 3 || data.k > 16) {
    return { ok: false, error: 'Paramètre k invalide.' };
  }
  return { ok: true, fp: data };
}

/**
 * Localise dans un document les passages couverts par une empreinte.
 *
 * Le texte de la source restant inconnu, seule la partie « document » des
 * correspondances est restituée, c'est le but du format.
 *
 * @param {import('./text.js').TokenStream} tokens document analysé
 * @param {{k: number, hashes: number[]}} fp
 * @returns {{ranges: {start: number, end: number}[], covered: number, ratio: number}}
 */
export function matchFingerprint(tokens, fp) {
  const stream = buildStream(tokens, false);
  const grams = fingerprint(stream, fp.k, 1);
  const wanted = new Set(fp.hashes);

  /** @type {{qStart: number, qEnd: number}[]} */
  const hits = [];
  for (let i = 0; i < grams.hash.length; i++) {
    if (wanted.has(grams.hash[i])) {
      hits.push({ qStart: grams.pos[i], qEnd: grams.pos[i] + fp.k });
    }
  }
  const { covered, ranges } = unionCoverage(hits);
  return {
    ranges,
    covered,
    ratio: tokens.count ? covered / tokens.count : 0,
  };
}
