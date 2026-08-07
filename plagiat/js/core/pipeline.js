/**
 * Orchestration complète d'une analyse de plagiat.
 *
 * Enchaînement : extraction du document → segmentation → sélection des
 * requêtes → interrogation des moteurs → récupération des sources →
 * comparaison locale → calcul des scores → rapport.
 *
 * Le module ne dépend d'aucune API du DOM : il tourne indifféremment dans un
 * Web Worker, sur le fil principal (repli) ou sous Node pour les tests.
 *
 * @module core/pipeline
 */

import { readDocx, countWords } from './docx-reader.js';
import {
  tokenize,
  spanText,
  splitSentences,
  detectLanguage,
  normalizeWord,
  isStop,
  STOPWORDS,
} from './text.js';
import {
  buildDocumentIndex,
  matchSource,
  findInternalDuplication,
  unionCoverage,
  subtractRanges,
  attributeTokens,
  classify,
} from './matcher.js';
import { RequestQueue, NetworkError, NET_ERRORS } from './net.js';
import {
  getProvider,
  providerReadiness,
  createProviderContext,
  fetchPageText,
} from './providers.js';
import { ResponseCache } from './store.js';
import { scanForensics } from './forensics.js';
import { analyzeAiSignals } from './ai-detector.js';
import { checkCitations } from './citations.js';
import { matchFingerprint, validateFingerprint } from './compare.js';

/** Profils d'analyse : compromis entre exhaustivité et nombre de requêtes. */
export const DEPTH_PROFILES = {
  rapide: {
    label: 'Rapide',
    maxQueries: 20,
    resultsPerQuery: 3,
    maxSources: 80,
    description: 'Un balayage large en une minute environ.',
  },
  standard: {
    label: 'Standard',
    maxQueries: 60,
    resultsPerQuery: 5,
    maxSources: 200,
    description: 'Le meilleur compromis pour un mémoire ou un article.',
  },
  approfondi: {
    label: 'Approfondi',
    maxQueries: 150,
    resultsPerQuery: 6,
    maxSources: 400,
    description: 'Échantillonnage dense, recommandé avant un dépôt officiel.',
  },
  integral: {
    label: 'Intégral',
    maxQueries: 1200,
    resultsPerQuery: 8,
    maxSources: 1200,
    description:
      'Chaque passage du document est soumis aux moteurs. Long, et gourmand en quota.',
  },
};

/** Longueur visée d'un bloc de requête, en mots. */
const CHUNK_WORDS = 34;
const CHUNK_MIN_WORDS = 12;

/**
 * @typedef {Object} ProgressEvent
 * @property {string} phase
 * @property {string} message
 * @property {number} [current]
 * @property {number} [total]
 * @property {number} ratio  progression globale 0..1
 */

const PHASE_WEIGHTS = [
  ['lecture', 0.08],
  ['segmentation', 0.04],
  ['recherche', 0.34],
  ['sources', 0.26],
  ['comparaison', 0.22],
  ['synthese', 0.06],
];

/** Calcule la progression globale à partir de la phase courante. */
function globalRatio(phase, local) {
  let before = 0;
  for (const [name, weight] of PHASE_WEIGHTS) {
    if (name === phase) return Math.min(1, before + weight * clamp01(local));
    before += weight;
  }
  return Math.min(1, before);
}

/** @param {number} v */
function clamp01(v) {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}

/* ------------------------------------------------------------------ *
 * Segmentation et zones exclues
 * ------------------------------------------------------------------ */

const BIBLIO_HEADING =
  /^\s*(?:\d+[.)\s]*)?(?:bibliographie|r[ée]f[ée]rences?(?:\s+bibliographiques?)?|references|works\s+cited|sources?(?:\s+consult[ée]es)?|webographie|sitographie)\s*:?\s*$/i;

/**
 * Localise la section bibliographique éventuelle.
 * @param {import('./docx-reader.js').DocxParagraph[]} paragraphs
 * @param {number} textLength
 * @returns {{start: number, end: number, title: string}|null}
 */
export function findBibliographySection(paragraphs, textLength) {
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i];
    if (p.text.length > 120 || !BIBLIO_HEADING.test(p.text)) continue;
    // Une bibliographie occupe la fin du document : on s'arrête au premier
    // titre de niveau supérieur ou égal rencontré ensuite.
    let end = textLength;
    for (let j = i + 1; j < paragraphs.length; j++) {
      const q = paragraphs[j];
      if (q.kind === 'heading' && (p.kind !== 'heading' || q.level <= p.level)) {
        end = q.start;
        break;
      }
    }
    return { start: p.start, end, title: p.text };
  }
  return null;
}

/**
 * Repère les passages entre guillemets d'au moins `minWords` mots.
 * @param {string} text
 * @param {number} [minWords]
 * @returns {{start: number, end: number}[]}
 */
export function findQuotedRanges(text, minWords = 6) {
  /** @type {{start: number, end: number}[]} */
  const ranges = [];
  const patterns = [
    /«([\s\S]{10,1200}?)»/g,
    /“([\s\S]{10,1200}?)”/g,
    /"([^"\n]{10,1200}?)"/g,
  ];
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (countWords(m[1]) >= minWords) {
        ranges.push({ start: m.index, end: m.index + m[0].length });
      }
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

/**
 * Convertit une plage de caractères en plage de jetons.
 * @param {import('./text.js').TokenStream} tokens
 * @param {number} charStart
 * @param {number} charEnd
 * @returns {{start: number, end: number}}
 */
export function charRangeToTokens(tokens, charStart, charEnd) {
  const start = lowerBound(tokens.start, charStart, tokens.count);
  let end = lowerBound(tokens.start, charEnd, tokens.count);
  while (end > start && tokens.end[end - 1] > charEnd) end--;
  return { start, end: Math.max(start, end) };
}

/** Recherche dichotomique du premier indice dont la valeur est ≥ `value`. */
function lowerBound(arr, value, length) {
  let lo = 0;
  let hi = length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/* ------------------------------------------------------------------ *
 * Sélection des requêtes
 * ------------------------------------------------------------------ */

/**
 * Découpe le document en blocs interrogeables alignés sur les phrases.
 *
 * @param {string} text
 * @param {import('./text.js').TokenStream} tokens
 * @returns {{start: number, end: number, tokenStart: number, tokenEnd: number, words: number, score: number}[]}
 */
export function buildChunks(text, tokens) {
  const sentences = splitSentences(text);
  /** @type {{start: number, end: number, tokenStart: number, tokenEnd: number, words: number, score: number}[]} */
  const chunks = [];

  let bufStart = -1;
  let bufEnd = -1;
  let bufWords = 0;

  const flush = () => {
    if (bufStart < 0 || bufWords < CHUNK_MIN_WORDS) {
      bufStart = -1;
      bufWords = 0;
      return;
    }
    const range = charRangeToTokens(tokens, bufStart, bufEnd);
    if (range.end - range.start >= CHUNK_MIN_WORDS) {
      chunks.push({
        start: bufStart,
        end: bufEnd,
        tokenStart: range.start,
        tokenEnd: range.end,
        words: range.end - range.start,
        score: distinctiveness(tokens, range.start, range.end),
      });
    }
    bufStart = -1;
    bufWords = 0;
  };

  for (const s of sentences) {
    const words = countWords(text.slice(s.start, s.end));
    if (words === 0) continue;
    if (bufStart < 0) {
      bufStart = s.start;
      bufEnd = s.end;
      bufWords = words;
    } else {
      bufEnd = s.end;
      bufWords += words;
    }
    if (bufWords >= CHUNK_WORDS) flush();
  }
  flush();
  return chunks;
}

/**
 * Score de « distinctivité » d'un bloc : plus il contient de mots rares,
 * longs ou capitalisés, plus il est susceptible d'identifier une source.
 *
 * @param {import('./text.js').TokenStream} tokens
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function distinctiveness(tokens, from, to) {
  let score = 0;
  const seen = new Set();
  for (let i = from; i < to; i++) {
    if (isStop(tokens, i)) continue;
    const raw = tokens.text.slice(tokens.start[i], tokens.end[i]);
    const norm = normalizeWord(raw);
    if (seen.has(norm)) continue;
    seen.add(norm);
    score += Math.min(4, norm.length / 3);
    // Un nom propre en milieu de phrase est un excellent point d'entrée.
    if (i > from && /^\p{Lu}/u.test(raw)) score += 1.5;
    if (/\d/.test(raw)) score += 0.5;
  }
  return score;
}

/**
 * Choisit les blocs à soumettre aux moteurs.
 *
 * L'échantillonnage est **stratifié** : le document est découpé en autant de
 * tranches que de requêtes autorisées, et le bloc le plus distinctif de chaque
 * tranche est retenu. La couverture reste ainsi uniforme du début à la fin,
 * quelle que soit la taille du document.
 *
 * @param {ReturnType<typeof buildChunks>} chunks
 * @param {number} budget
 * @returns {ReturnType<typeof buildChunks>}
 */
export function selectChunks(chunks, budget) {
  if (chunks.length === 0) return [];
  if (budget >= chunks.length) return chunks.slice();

  const perBucket = chunks.length / budget;
  /** @type {typeof chunks} */
  const selected = [];
  for (let b = 0; b < budget; b++) {
    const from = Math.floor(b * perBucket);
    const to = Math.min(chunks.length, Math.floor((b + 1) * perBucket));
    let best = null;
    for (let i = from; i < to; i++) {
      if (!best || chunks[i].score > best.score) best = chunks[i];
    }
    if (best) selected.push(best);
  }
  return selected;
}

/**
 * Prépare les deux formes de requête d'un bloc : phrase exacte (moteurs web)
 * et mots-clés (moteurs documentaires).
 *
 * @param {string} text
 * @param {import('./text.js').TokenStream} tokens
 * @param {{start: number, end: number, tokenStart: number, tokenEnd: number}} chunk
 */
export function chunkQueries(text, tokens, chunk) {
  const raw = text
    .slice(chunk.start, chunk.end)
    .replace(/\s+/g, ' ')
    .replace(/["«»“”]/g, '')
    .trim();

  // Phrase exacte : bornée pour rester dans les limites des moteurs.
  const words = raw.split(' ');
  const phrase = words.slice(0, 32).join(' ').slice(0, 240).trim();

  // Mots-clés : les termes pleins les plus longs, sans doublon.
  /** @type {string[]} */
  const keywords = [];
  const seen = new Set();
  for (let i = chunk.tokenStart; i < chunk.tokenEnd && keywords.length < 12; i++) {
    if (isStop(tokens, i)) continue;
    const word = tokens.text.slice(tokens.start[i], tokens.end[i]);
    const norm = normalizeWord(word);
    if (norm.length < 4 || seen.has(norm) || STOPWORDS.has(norm)) continue;
    seen.add(norm);
    keywords.push(word);
  }

  return { phrase, keywords: keywords.join(' ') || phrase };
}

/* ------------------------------------------------------------------ *
 * Analyse
 * ------------------------------------------------------------------ */

/** Normalise une URL pour la déduplication des résultats. */
export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    for (const param of [...u.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$|^ref$/i.test(param)) u.searchParams.delete(param);
    }
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return String(url || '').trim().toLowerCase();
  }
}

/** Empreinte SHA-256 d'un fichier, pour l'identification du rapport. */
async function fileDigest(blob) {
  try {
    if (!globalThis.crypto?.subtle) return '';
    const buf = await blob.slice(0, 64 * 1024 * 1024).arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(hash)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

/**
 * @typedef {Object} AnalyzeInput
 * @property {Blob} [file]        document Word à analyser
 * @property {string} [text]      texte brut (mode « coller du texte »)
 * @property {string} [name]      nom affiché
 * @property {{name: string, text: string}[]} [corpus] documents de référence locaux
 */

/**
 * Lance une analyse complète.
 *
 * @param {AnalyzeInput} input
 * @param {any} settings
 * @param {{onProgress?: (e: ProgressEvent) => void, signal?: AbortSignal}} [hooks]
 * @returns {Promise<any>} rapport d'analyse
 */
export async function analyzeDocument(input, settings, hooks = {}) {
  const startedAt = Date.now();
  const onProgress = hooks.onProgress || (() => {});
  const signal = hooks.signal;
  const warnings = [];
  const errors = [];

  /** @param {string} phase @param {string} message @param {number} [local] @param {any} [extra] */
  const report = (phase, message, local = 0, extra = {}) => {
    onProgress({ phase, message, ratio: globalRatio(phase, local), ...extra });
  };
  const checkAbort = () => {
    if (signal?.aborted) {
      throw new NetworkError(NET_ERRORS.ABORTED, 'Analyse interrompue par l’utilisateur.');
    }
  };

  const profile = DEPTH_PROFILES[settings.depth] || DEPTH_PROFILES.standard;
  /** Sensibilité de correspondance : seuil de similarité minimal. */
  const SENSITIVITY = { stricte: 0.45, normale: 0.34, large: 0.28 };
  const minSimilarity = SENSITIVITY[settings.sensitivity] ?? SENSITIVITY.normale;

  /* --- 1. Lecture du document ---------------------------------------- */
  report('lecture', 'Ouverture du document…', 0.1);
  /** @type {any} */
  let doc;
  if (input.prepared) {
    // Le document a déjà été extrait (par exemple pour afficher ses
    // statistiques avant l'analyse) : inutile de le relire.
    doc = input.prepared;
  } else if (input.file) {
    doc = await readDocx(input.file, {
      includeNotes: settings.includeNotes,
      includeHeadersFooters: settings.includeHeadersFooters,
    });
  } else {
    const text = String(input.text || '');
    doc = {
      text,
      paragraphs: splitParagraphs(text),
      meta: { title: input.name || 'Texte collé', creator: '' },
      truncated: false,
      stats: {
        characters: text.length,
        words: countWords(text),
        paragraphs: 0,
        pages: Math.max(1, Math.round(countWords(text) / 300)),
        pagesEstimated: true,
        parts: {},
      },
    };
    doc.stats.paragraphs = doc.paragraphs.length;
  }
  checkAbort();
  if (doc.truncated) {
    warnings.push(
      'Le document dépasse la taille maximale traitée : seule la première partie a été analysée.',
    );
  }
  if (doc.stats.words < 40) {
    warnings.push(
      'Document très court : le taux calculé sur moins de 40 mots n’a guère de valeur statistique.',
    );
  }

  report('lecture', `Document lu : ${doc.stats.words.toLocaleString('fr-FR')} mots`, 1);

  /* --- 2. Segmentation ------------------------------------------------ */
  report('segmentation', 'Analyse de la structure…', 0.2);
  const tokens = tokenize(doc.text);
  const language = detectLanguage(tokens);

  /** @type {{start: number, end: number}[]} */
  const excludedTokenRanges = [];
  const bibliography = findBibliographySection(doc.paragraphs, doc.text.length);
  if (settings.excludeBibliography && bibliography) {
    excludedTokenRanges.push(
      charRangeToTokens(tokens, bibliography.start, bibliography.end),
    );
  }
  let quotedRanges = [];
  if (settings.excludeQuotes) {
    quotedRanges = findQuotedRanges(doc.text);
    for (const q of quotedRanges) {
      excludedTokenRanges.push(charRangeToTokens(tokens, q.start, q.end));
    }
  }
  const excludedTokens = unionCoverage(
    excludedTokenRanges.map((r) => ({ qStart: r.start, qEnd: r.end })),
  );

  report('segmentation', 'Indexation du document…', 0.6);
  const docIndex = buildDocumentIndex(tokens);
  const chunks = buildChunks(doc.text, tokens);
  const selected = selectChunks(chunks, profile.maxQueries);
  checkAbort();
  report(
    'segmentation',
    `${chunks.length} blocs identifiés, ${selected.length} soumis aux moteurs`,
    1,
  );

  /* --- 3. Moteurs ----------------------------------------------------- */
  const queue = new RequestQueue({
    concurrency: Math.max(1, Math.min(8, settings.concurrency || 4)),
    minIntervalMs: 120,
  });
  const cache = new ResponseCache({ enabled: settings.cacheEnabled !== false });
  let requestCount = 0;
  const ctx = createProviderContext({
    queue,
    cache,
    settings,
    signal,
    resultsPerQuery: settings.resultsPerQuery || profile.resultsPerQuery,
    onRequest: (info) => {
      if (!info.cached) requestCount++;
    },
  });

  /** @type {any[]} */
  const engines = [];
  const activeProviders = [];
  for (const id of settings.providers || []) {
    const provider = getProvider(id);
    if (!provider) continue;
    const readiness = providerReadiness(provider, settings);
    if (!readiness.ready) {
      warnings.push(
        `${provider.name} : ignoré, configuration incomplète (${readiness.missing.join(', ')}).`,
      );
      continue;
    }
    activeProviders.push(provider);
    engines.push({
      id: provider.id,
      name: provider.name,
      group: provider.group,
      queries: 0,
      results: 0,
      errors: [],
    });
  }

  if (activeProviders.length === 0 && !(input.corpus || []).length) {
    warnings.push(
      'Aucun moteur actif : seule la détection de répétitions internes a pu être effectuée.',
    );
  }

  /* --- 4. Recherche --------------------------------------------------- */
  /** @type {Map<string, any>} */
  const candidates = new Map();
  const totalSearches = selected.length * Math.max(1, activeProviders.length);
  let searchDone = 0;

  if (activeProviders.length > 0) {
    report('recherche', 'Interrogation des moteurs…', 0);
    for (const chunk of selected) {
      checkAbort();
      const queries = chunkQueries(doc.text, tokens, chunk);
      const jobs = activeProviders.map(async (provider) => {
        const engine = engines.find((e) => e.id === provider.id);
        const query =
          provider.group === 'moteur' ? `"${queries.phrase}"` : queries.keywords;
        try {
          const results = await provider.search(query, ctx);
          engine.queries++;
          engine.results += results.length;
          for (const result of results) {
            const key = canonicalUrl(result.url) || result.id;
            const existing = candidates.get(key);
            if (existing) {
              existing.hits++;
              if (!existing.text && result.text) existing.text = result.text;
              if (!existing.chunks.includes(chunk)) existing.chunks.push(chunk);
            } else if (candidates.size < profile.maxSources) {
              candidates.set(key, { ...result, key, hits: 1, chunks: [chunk] });
            }
          }
        } catch (err) {
          recordEngineError(engine, err, errors);
        } finally {
          searchDone++;
          report(
            'recherche',
            `Recherche ${searchDone}/${totalSearches} — ${candidates.size} sources repérées`,
            searchDone / Math.max(1, totalSearches),
            { current: searchDone, total: totalSearches },
          );
        }
      });
      await Promise.all(jobs);
    }
  }

  /* --- 5. Récupération du texte des sources --------------------------- */
  const candidateList = [...candidates.values()].sort((a, b) => b.hits - a.hits);
  let fetched = 0;
  const withText = [];

  if (candidateList.length) {
    report('sources', 'Récupération du contenu des sources…', 0);
  }
  const fetchJobs = candidateList.map((candidate) => async () => {
    try {
      if (!candidate.text) {
        const provider = getProvider(candidate.provider);
        if (provider?.fetchText) {
          candidate.text = await provider.fetchText(candidate, ctx);
        }
      }
      if (!candidate.text && settings.reader && settings.reader !== 'aucun') {
        candidate.text = await fetchPageText(candidate.url, ctx);
      }
      if (!candidate.text) candidate.text = candidate.snippet || '';
      candidate.words = countWords(candidate.text);
      if (candidate.words >= 8) withText.push(candidate);
    } catch (err) {
      const engine = engines.find((e) => e.id === candidate.provider);
      if (engine) recordEngineError(engine, err, errors, true);
      if (candidate.snippet) {
        candidate.text = candidate.snippet;
        candidate.words = countWords(candidate.text);
        if (candidate.words >= 8) withText.push(candidate);
      }
    } finally {
      fetched++;
      report(
        'sources',
        `Source ${fetched}/${candidateList.length} — ${candidate.title?.slice(0, 60) || ''}`,
        fetched / Math.max(1, candidateList.length),
        { current: fetched, total: candidateList.length },
      );
    }
  });

  await runSequentialBatches(fetchJobs, Math.max(1, settings.concurrency || 4), checkAbort);

  /* --- 6. Comparaison ------------------------------------------------- */
  /** @type {any[]} */
  const sourceReports = [];
  /** @type {any[]} */
  const allPassages = [];

  const comparisons = [
    ...withText.map((c) => ({ kind: 'web', candidate: c })),
    ...(input.corpus || []).map((c, i) => ({
      kind: 'corpus',
      candidate: {
        key: `corpus:${i}`,
        id: `corpus:${i}`,
        title: c.name,
        url: '',
        provider: 'corpus',
        providerName: 'Corpus local',
        kind: 'local',
        text: c.text,
        words: countWords(c.text),
        snippet: c.text.slice(0, 200),
      },
    })),
  ];

  let compared = 0;
  for (const item of comparisons) {
    checkAbort();
    const candidate = item.candidate;
    const sourceTokens = tokenize(candidate.text);
    const matches = matchSource(docIndex, sourceTokens, {
      minTokensExact: Math.max(6, settings.minPassageWords || 10),
      minSimilarity,
    });

    if (matches.length) {
      const passages = matches.map((m) => ({
        sourceKey: candidate.key,
        qStart: m.qStart,
        qEnd: m.qEnd,
        similarity: Math.round(m.similarity * 1000) / 1000,
        type: m.type,
        typeLabel: classify(m.similarity).label,
        mode: m.mode,
        words: m.qEnd - m.qStart,
        documentText: spanText(tokens, m.qStart, m.qEnd),
        sourceText: spanText(sourceTokens, m.sStart, m.sEnd),
        charStart: tokens.start[m.qStart],
        charEnd: tokens.end[Math.min(tokens.count - 1, m.qEnd - 1)],
      }));
      allPassages.push(...passages);
      sourceReports.push({
        key: candidate.key,
        title: candidate.title,
        url: candidate.url,
        provider: candidate.provider,
        providerName: candidate.providerName,
        kind: candidate.kind,
        words: candidate.words,
        snippet: candidate.snippet,
        meta: candidate.raw || {},
        passages,
        matchedWords: unionCoverage(matches).covered,
        maxSimilarity: Math.max(...matches.map((m) => m.similarity)),
      });
    }

    compared++;
    report(
      'comparaison',
      `Comparaison ${compared}/${comparisons.length}`,
      compared / Math.max(1, comparisons.length),
      { current: compared, total: comparisons.length },
    );
  }

  /* --- 6 bis. Empreintes locales --------------------------------------- */
  for (const [fpIndex, entry] of (input.fingerprints || []).entries()) {
    checkAbort();
    const check = validateFingerprint(entry.fp ?? entry);
    if (!check.ok) {
      warnings.push(`Empreinte « ${entry.name || fpIndex + 1} » ignorée : ${check.error}`);
      continue;
    }
    const fp = check.fp;
    const result = matchFingerprint(tokens, fp);
    if (!result.ranges.length) continue;
    const key = `empreinte:${fpIndex}`;
    const passages = result.ranges.map((r) => ({
      sourceKey: key,
      qStart: r.start,
      qEnd: r.end,
      similarity: 1,
      type: 'identique',
      typeLabel: 'Copie littérale',
      mode: 'empreinte',
      words: r.end - r.start,
      documentText: spanText(tokens, r.start, r.end),
      sourceText: '(le texte de la source n’est pas inclus dans l’empreinte)',
      charStart: tokens.start[r.start],
      charEnd: tokens.end[Math.min(tokens.count - 1, r.end - 1)],
    }));
    allPassages.push(...passages);
    sourceReports.push({
      key,
      title: fp.name || entry.name || `Empreinte ${fpIndex + 1}`,
      url: '',
      provider: 'empreinte',
      providerName: 'Empreinte locale',
      kind: 'empreinte',
      words: fp.words || 0,
      snippet: 'Comparaison par empreinte : le texte de la source reste confidentiel.',
      meta: { createdAt: fp.createdAt },
      passages,
      matchedWords: result.covered,
      maxSimilarity: 1,
    });
  }

  /* --- 7. Répétitions internes ---------------------------------------- */
  let internal = [];
  if (settings.detectInternalDuplication !== false) {
    report('synthese', 'Recherche de répétitions internes…', 0.2);
    internal = findInternalDuplication(docIndex).map((d) => ({
      ...d,
      aText: spanText(tokens, d.aStart, d.aEnd),
      bText: spanText(tokens, d.bStart, d.bEnd),
      words: d.aEnd - d.aStart,
    }));
  }

  /* --- 8. Scores ------------------------------------------------------ */
  report('synthese', 'Calcul des scores…', 0.6);
  const scores = computeScores({
    tokens,
    passages: allPassages,
    sourceReports,
    excludedRanges: excludedTokens.ranges,
  });

  for (const source of sourceReports) {
    source.percent = scores.perSource.get(source.key) || 0;
    source.attributedWords = Math.round(
      (source.percent / 100) * tokens.count,
    );
  }
  sourceReports.sort((a, b) => b.percent - a.percent || b.matchedWords - a.matchedWords);

  /* --- 8 bis. Analyses complémentaires --------------------------------- */
  let forensics = null;
  if (settings.forensics !== false) {
    report('synthese', 'Analyse forensique…', 0.7);
    forensics = scanForensics(doc.text, { hiddenRuns: doc.suspiciousRuns || [] });
    if (forensics.severity === 'alerte') {
      warnings.push(
        'Des procédés de camouflage ont été relevés (voir la section forensique) : le taux de similitude peut être artificiellement abaissé.',
      );
    }
  }

  let ai = null;
  if (settings.detectAI !== false) {
    report('synthese', 'Indices stylistiques…', 0.8);
    ai = analyzeAiSignals(doc.text);
  }

  let citations = null;
  if (settings.checkCitations !== false) {
    report('synthese', 'Vérification des citations…', 0.9);
    citations = checkCitations(
      doc.text,
      doc.paragraphs,
      bibliography ? { start: bibliography.start, end: bibliography.end } : null,
    );
  }

  // Le rapport doit rester sérialisable en JSON : la table d'attribution
  // devient un objet simple une fois les pourcentages reportés sur les sources.
  scores.perSource = Object.fromEntries(scores.perSource);

  const sampledWords = selected.reduce((sum, c) => sum + c.words, 0);
  const durationMs = Date.now() - startedAt;

  report('synthese', 'Rapport prêt', 1);

  return {
    id: `RAP-${new Date(startedAt).toISOString().slice(0, 19).replace(/[-:T]/g, '')}`,
    generatedAt: new Date(startedAt).toISOString(),
    durationMs,
    document: {
      name: input.name || doc.meta.title || 'document.docx',
      size: input.file?.size || doc.text.length,
      digest: input.file ? await fileDigest(input.file) : '',
      meta: doc.meta,
      stats: doc.stats,
      language,
      truncated: doc.truncated,
    },
    text: doc.text,
    paragraphs: doc.paragraphs,
    analysis: {
      depth: settings.depth,
      depthLabel: profile.label,
      chunksTotal: chunks.length,
      chunksQueried: selected.length,
      sampledWords,
      samplingRatio: tokens.count ? Math.min(1, sampledWords / tokens.count) : 0,
      requestCount,
      cache: cache.stats(),
      tokenCount: tokens.count,
      excludedWords: excludedTokens.covered,
      bibliography,
      quotedRanges: quotedRanges.length,
      providers: engines,
      sourcesExamined: candidateList.length,
      sourcesRetained: sourceReports.length,
      corpusDocuments: (input.corpus || []).length,
    },
    scores,
    sources: sourceReports,
    passages: allPassages.sort((a, b) => a.qStart - b.qStart),
    internal,
    forensics,
    ai,
    citations,
    warnings,
    errors,
  };
}

/**
 * Découpe un texte brut en pseudo-paragraphes (mode « coller du texte »).
 * @param {string} text
 */
function splitParagraphs(text) {
  const out = [];
  let offset = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed) {
      const start = offset + line.indexOf(trimmed);
      out.push({
        text: trimmed,
        start,
        end: start + trimmed.length,
        kind: 'body',
        level: 0,
        part: 'texte',
      });
    }
    offset += line.length + 1;
  }
  return out;
}

/**
 * Consigne l'erreur d'un moteur sans interrompre l'analyse.
 * @param {any} engine
 * @param {unknown} err
 * @param {any[]} errors
 * @param {boolean} [minor]
 */
function recordEngineError(engine, err, errors, minor = false) {
  if (err instanceof NetworkError && err.kind === NET_ERRORS.ABORTED) throw err;
  const message =
    err instanceof NetworkError
      ? err.hint
        ? `${err.message} ${err.hint}`
        : err.message
      : String(err?.message || err);
  if (engine && !engine.errors.includes(message)) engine.errors.push(message);
  if (!minor && !errors.some((e) => e.message === message)) {
    errors.push({ engine: engine?.id || 'inconnu', message });
  }
}

/**
 * Exécute des tâches par lots de taille bornée, en vérifiant l'annulation.
 * @param {(() => Promise<any>)[]} jobs
 * @param {number} size
 * @param {() => void} checkAbort
 */
async function runSequentialBatches(jobs, size, checkAbort) {
  for (let i = 0; i < jobs.length; i += size) {
    checkAbort();
    await Promise.all(jobs.slice(i, i + size).map((job) => job()));
  }
}

/**
 * Calcule tous les indicateurs chiffrés du rapport.
 *
 * @param {{tokens: import('./text.js').TokenStream, passages: any[], sourceReports: any[], excludedRanges: {start: number, end: number}[]}} params
 */
export function computeScores({ tokens, passages, sourceReports, excludedRanges }) {
  const total = tokens.count || 1;

  const globalUnion = unionCoverage(passages);
  const netRanges = subtractRanges(globalUnion.ranges, excludedRanges);
  const netCovered = netRanges.reduce((sum, r) => sum + (r.end - r.start), 0);
  const excludedCount = excludedRanges.reduce((sum, r) => sum + (r.end - r.start), 0);
  const analyzable = Math.max(1, total - excludedCount);

  // Répartition par type, en donnant la priorité au type le plus grave.
  const priority = { identique: 3, modifie: 2, paraphrase: 1 };
  const ownerType = new Uint8Array(total);
  for (const p of passages) {
    const rank = priority[p.type] || 1;
    const end = Math.min(total, p.qEnd);
    for (let i = Math.max(0, p.qStart); i < end; i++) {
      if (rank > ownerType[i]) ownerType[i] = rank;
    }
  }
  let identique = 0;
  let modifie = 0;
  let paraphrase = 0;
  for (let i = 0; i < total; i++) {
    if (ownerType[i] === 3) identique++;
    else if (ownerType[i] === 2) modifie++;
    else if (ownerType[i] === 1) paraphrase++;
  }

  const perSourceTokens = attributeTokens(
    sourceReports.map((s) => ({ sourceId: s.key, matches: s.passages })),
    total,
  );
  /** @type {Map<string, number>} */
  const perSource = new Map();
  for (const [key, count] of perSourceTokens) {
    perSource.set(key, round1((count / total) * 100));
  }

  const rawRate = (globalUnion.covered / total) * 100;
  const netRate = (netCovered / analyzable) * 100;

  return {
    /** Taux brut : part du document couverte par au moins une correspondance. */
    tauxBrut: round1(rawRate),
    /** Taux net : citations et bibliographie retirées du calcul. */
    tauxNet: round1(netRate),
    originalite: round1(100 - netRate),
    motsTotal: total,
    motsCouverts: globalUnion.covered,
    motsCouvertsNets: netCovered,
    motsExclus: excludedCount,
    motsAnalyses: analyzable,
    repartition: {
      identique: round1((identique / total) * 100),
      modifie: round1((modifie / total) * 100),
      paraphrase: round1((paraphrase / total) * 100),
      original: round1(((total - identique - modifie - paraphrase) / total) * 100),
    },
    passagesTotal: passages.length,
    sourcesTotal: sourceReports.length,
    perSource,
    niveau: riskLevel(netRate),
  };
}

/** @param {number} n */
function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Interprétation qualitative du taux net.
 * @param {number} rate
 */
export function riskLevel(rate) {
  if (rate < 5) return { code: 'faible', label: 'Similitude faible', color: '#1b8a5a' };
  if (rate < 15) {
    return { code: 'modere', label: 'Similitude modérée', color: '#c9a227' };
  }
  if (rate < 30) {
    return { code: 'eleve', label: 'Similitude élevée', color: '#e07b39' };
  }
  return { code: 'critique', label: 'Similitude critique', color: '#c0392b' };
}
