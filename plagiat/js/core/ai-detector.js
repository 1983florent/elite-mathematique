/**
 * Indices stylistiques de rédaction assistée par IA.
 *
 * Aucun détecteur — commercial ou non — ne peut *prouver* qu'un texte a été
 * écrit par une machine. Ce module ne prétend pas le faire : il mesure des
 * **régularités stylistiques** connues pour être plus fréquentes dans les
 * textes générés (rythme uniforme, charnières stéréotypées, attaques de
 * phrases répétitives, ponctuation appauvrie) et les restitue une à une,
 * chiffrées et vérifiables, pour nourrir un jugement humain.
 *
 * Le calcul est déterministe et entièrement local.
 *
 * @module core/ai-detector
 */

import { tokenize, splitSentences, normalizeWord, isStop, stem } from './text.js';

/** Avertissement à afficher avec tout score. */
export const AI_DISCLAIMER =
  'Ces indices mesurent des régularités de style, pas une origine. Un texte très ' +
  'normé (rapport technique, résumé imposé) peut les présenter sans IA, et un texte ' +
  'généré puis retravaillé peut y échapper. Aucune décision ne doit reposer sur ce ' +
  'seul score.';

/** Tournures sur-représentées dans les textes générés (formes normalisées). */
const AI_PHRASES = [
  // Français
  'il est important de noter', 'il est important de souligner',
  'il convient de noter', 'il convient de souligner',
  'il est essentiel de', 'il est crucial de',
  'dans le monde d’aujourd’hui', "dans le monde d'aujourd'hui",
  'dans un monde en constante évolution', 'joue un rôle crucial',
  'joue un rôle essentiel', 'un large éventail de',
  'une multitude de', 'il est indéniable que',
  'force est de constater', 'en constante évolution',
  'véritable enjeu', 'plongeons dans', 'explorons',
  'que ce soit pour', 'n’hésitez pas à', "n'hésitez pas à",
  'en somme', 'en définitive', 'il est possible de constater',
  'cela permet de mettre en évidence', 'aspect fondamental',
  // Anglais
  'it is important to note', 'it is worth noting', 'in today’s world',
  "in today's world", 'plays a crucial role', 'a wide range of',
  'delve into', 'delves into', 'rich tapestry', 'in the realm of',
  'it is essential to', 'navigating the', 'ever-evolving', 'furthermore',
  'in conclusion', 'to summarize', 'this highlights the importance of',
];

/** Connecteurs susceptibles d'ouvrir mécaniquement les phrases. */
const CONNECTOR_OPENERS = new Set(
  `de plus,en outre,par ailleurs,cependant,toutefois,neanmoins,en effet,ainsi,
   donc,par consequent,en conclusion,en resume,tout d abord,ensuite,enfin,
   premierement,deuxiemement,troisiemement,en somme,en definitive,notamment,
   moreover,furthermore,additionally,however,therefore,in conclusion,firstly,
   secondly,finally,overall,in summary`
    .split(',')
    .map((s) => s.trim().replace(/\s+/g, ' ')),
);

const PUNCT_KINDS = [';', ':', '—', '(', '«', '!', '?', '…'];

/** @param {number} v */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** @param {number} v */
const round1 = (v) => Math.round(v * 10) / 10;

/** Forme comparable d'une phrase pour la recherche de tournures. */
function comparable(text) {
  return text.toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ');
}

/** Nombre de mots d'une chaîne. */
function wordCount(s) {
  const m = s.match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

/** Moyenne et écart-type d'une série. */
function stats(values) {
  if (!values.length) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance) };
}

/**
 * @typedef {Object} AiIndicator
 * @property {string} id
 * @property {string} label
 * @property {string} detail   valeur mesurée, formulée en clair
 * @property {number} value    0..1 (1 = très typé IA)
 * @property {number} weight
 */

/**
 * Calcule les indices stylistiques d'un texte.
 *
 * @param {string} text
 * @returns {{score: number, band: {code: string, label: string, color: string},
 *            reliable: boolean, indicators: AiIndicator[],
 *            paragraphs: {index: number, excerpt: string, score: number, reasons: string[]}[],
 *            disclaimer: string}}
 */
export function analyzeAiSignals(text) {
  const tokens = tokenize(text);
  const totalWords = tokens.count;

  if (totalWords < 120) {
    return {
      score: 0,
      band: bandFor(0),
      reliable: false,
      indicators: [],
      paragraphs: [],
      disclaimer:
        'Texte trop court (moins de 120 mots) pour que les régularités de style aient un sens statistique.',
    };
  }

  const sentences = splitSentences(text);
  const sentenceTexts = sentences.map((s) => text.slice(s.start, s.end));
  const sentenceLengths = sentenceTexts.map(wordCount).filter((n) => n > 0);
  const lower = comparable(text);

  /** @type {AiIndicator[]} */
  const indicators = [];

  // 1. Tournures stéréotypées.
  let phraseHits = 0;
  /** @type {Map<string, number>} */
  const phraseDetail = new Map();
  for (const phrase of AI_PHRASES) {
    let idx = 0;
    let count = 0;
    while ((idx = lower.indexOf(phrase, idx)) !== -1) {
      count++;
      idx += phrase.length;
    }
    if (count) {
      phraseHits += count;
      phraseDetail.set(phrase, count);
    }
  }
  const per1000 = (phraseHits / totalWords) * 1000;
  indicators.push({
    id: 'tournures',
    label: 'Tournures stéréotypées',
    detail: phraseHits
      ? `${phraseHits} occurrence(s), soit ${round1(per1000)} pour 1 000 mots (ex. « ${[...phraseDetail.keys()][0]} »)`
      : 'aucune tournure typique relevée',
    value: clamp01(per1000 / 6),
    weight: 3,
  });

  // 2. Uniformité du rythme des phrases.
  const { mean, sd } = stats(sentenceLengths);
  const burstiness = mean ? sd / mean : 0;
  indicators.push({
    id: 'rythme',
    label: 'Uniformité du rythme',
    detail: `variabilité des longueurs de phrase : ${round1(burstiness * 100) / 100} (un texte humain dépasse généralement 0,45)`,
    value: sentenceLengths.length >= 8 ? clamp01((0.45 - burstiness) / 0.35) : 0,
    weight: 2,
  });

  // 3. Phrases ouvertes par un connecteur.
  let connectorStarts = 0;
  for (const s of sentenceTexts) {
    const head = normalizeWord(s.trim().split(/[\s,]+/).slice(0, 3).join(' '));
    if (
      CONNECTOR_OPENERS.has(head) ||
      CONNECTOR_OPENERS.has(head.split(' ').slice(0, 2).join(' ')) ||
      CONNECTOR_OPENERS.has(head.split(' ')[0])
    ) {
      connectorStarts++;
    }
  }
  const connectorRatio = sentenceTexts.length
    ? connectorStarts / sentenceTexts.length
    : 0;
  indicators.push({
    id: 'connecteurs',
    label: 'Phrases ouvertes par un connecteur',
    detail: `${connectorStarts} phrase(s) sur ${sentenceTexts.length} (${Math.round(connectorRatio * 100)} %)`,
    value: clamp01((connectorRatio - 0.15) / 0.35),
    weight: 1.5,
  });

  // 4. Attaques de phrase répétitives.
  /** @type {Map<string, number>} */
  const openers = new Map();
  for (const s of sentenceTexts) {
    const first = normalizeWord((s.trim().match(/^[\p{L}’'-]+/u) || [''])[0]);
    if (!first) continue;
    openers.set(first, (openers.get(first) || 0) + 1);
  }
  const topOpener = [...openers.entries()].sort((a, b) => b[1] - a[1])[0];
  const openerRatio =
    topOpener && sentenceTexts.length >= 6
      ? topOpener[1] / sentenceTexts.length
      : 0;
  indicators.push({
    id: 'attaques',
    label: 'Attaques de phrase répétitives',
    detail: topOpener
      ? `« ${topOpener[0]} » ouvre ${topOpener[1]} phrase(s) sur ${sentenceTexts.length}`
      : 'échantillon insuffisant',
    value: clamp01((openerRatio - 0.14) / 0.28),
    weight: 1.5,
  });

  // 5. Richesse lexicale (fenêtres de 400 mots pleins).
  /** @type {string[]} */
  const contentStems = [];
  for (let i = 0; i < tokens.count; i++) {
    if (!isStop(tokens, i)) {
      contentStems.push(stem(normalizeWord(tokens.text.slice(tokens.start[i], tokens.end[i]))));
    }
  }
  let minTtr = 1;
  const WINDOW = 400;
  if (contentStems.length >= WINDOW) {
    for (let i = 0; i + WINDOW <= contentStems.length; i += WINDOW >> 1) {
      const unique = new Set(contentStems.slice(i, i + WINDOW));
      minTtr = Math.min(minTtr, unique.size / WINDOW);
    }
  } else if (contentStems.length >= 120) {
    minTtr = new Set(contentStems).size / contentStems.length;
  }
  indicators.push({
    id: 'lexique',
    label: 'Richesse lexicale',
    detail: `diversité minimale observée : ${Math.round(minTtr * 100)} % de racines distinctes`,
    value: clamp01((0.5 - minTtr) / 0.22),
    weight: 1,
  });

  // 6. Variété de la ponctuation expressive.
  const kinds = PUNCT_KINDS.filter((p) => text.includes(p)).length;
  indicators.push({
    id: 'ponctuation',
    label: 'Ponctuation expressive',
    detail: `${kinds} signe(s) sur ${PUNCT_KINDS.length} (point-virgule, tiret, parenthèse, question…)`,
    value: totalWords >= 300 ? clamp01(1 - kinds / 5) : 0,
    weight: 1,
  });

  // 7. Paragraphes calibrés.
  const paragraphSizes = text
    .split('\n')
    .map((p) => wordCount(p))
    .filter((n) => n >= 20);
  let paraValue = 0;
  let paraDetail = 'moins de cinq paragraphes substantiels';
  if (paragraphSizes.length >= 5) {
    const ps = stats(paragraphSizes);
    const cv = ps.mean ? ps.sd / ps.mean : 1;
    paraValue = clamp01((0.35 - cv) / 0.3);
    paraDetail = `écart relatif des tailles de paragraphe : ${Math.round(cv * 100)} %`;
  }
  indicators.push({
    id: 'paragraphes',
    label: 'Paragraphes calibrés',
    detail: paraDetail,
    value: paraValue,
    weight: 1,
  });

  const totalWeight = indicators.reduce((s, i) => s + i.weight, 0);
  const score = Math.round(
    (indicators.reduce((s, i) => s + i.value * i.weight, 0) / totalWeight) * 100,
  );

  // Paragraphes les plus typés, pour orienter la relecture.
  const paragraphs = [];
  const rawParagraphs = text.split('\n');
  let offset = 0;
  rawParagraphs.forEach((p, index) => {
    const words = wordCount(p);
    if (words >= 30) {
      const pl = comparable(p);
      let hits = 0;
      for (const phrase of AI_PHRASES) if (pl.includes(phrase)) hits++;
      const pSentences = splitSentences(p).map((s) => wordCount(p.slice(s.start, s.end)));
      const pStats = stats(pSentences.filter((n) => n > 0));
      const pBurst = pStats.mean ? pStats.sd / pStats.mean : 1;
      const reasons = [];
      if (hits) reasons.push(`${hits} tournure(s) stéréotypée(s)`);
      if (pSentences.length >= 3 && pBurst < 0.25) reasons.push('rythme très uniforme');
      const pScore = clamp01(hits / 3) * 0.6 + (pSentences.length >= 3 ? clamp01((0.3 - pBurst) / 0.3) : 0) * 0.4;
      if (reasons.length && pScore > 0.15) {
        paragraphs.push({
          index,
          excerpt: p.slice(0, 180) + (p.length > 180 ? '…' : ''),
          score: Math.round(pScore * 100),
          reasons,
        });
      }
    }
    offset += p.length + 1;
  });
  void offset;
  paragraphs.sort((a, b) => b.score - a.score);

  return {
    score,
    band: bandFor(score),
    reliable: totalWords >= 250,
    indicators,
    paragraphs: paragraphs.slice(0, 8),
    disclaimer: AI_DISCLAIMER,
  };
}

/** @param {number} score */
export function bandFor(score) {
  if (score < 25) {
    return { code: 'faible', label: 'Indices faibles', color: '#1b8a5a' };
  }
  if (score < 50) {
    return { code: 'modere', label: 'Indices modérés', color: '#c9a227' };
  }
  if (score < 70) {
    return { code: 'marque', label: 'Indices marqués', color: '#e07b39' };
  }
  return { code: 'tres-marque', label: 'Indices très marqués', color: '#c0392b' };
}
