/**
 * Détection de passages communs entre le document analysé et une source.
 *
 * Principe (proche de MOSS / Winnowing) :
 *   1. le document est indexé **une seule fois** sous forme d'empreintes de
 *      n-grammes, stockées dans deux tableaux typés triés par hachage ;
 *   2. chaque source est ensuite balayée contre cet index, ce qui donne des
 *      « graines » (position document, position source) ;
 *   3. les graines sont chaînées par diagonale pour reconstituer des passages
 *      maximaux, tolérants aux insertions et suppressions ;
 *   4. chaque passage est vérifié par un alignement (plus longue
 *      sous-séquence commune) qui donne une similarité et un type.
 *
 * Deux passes complémentaires sont effectuées : une passe « verbatim » sur
 * tous les jetons (n = 8) et une passe « paraphrase » sur les seuls mots
 * pleins racinisés (n = 4).
 *
 * @module core/matcher
 */

import { buildStream, fingerprint } from './text.js';

/** Paramètres par défaut du moteur de correspondance. */
export const MATCH_DEFAULTS = {
  kExact: 8,
  kParaphrase: 4,
  /** Écart maximal, en empreintes, entre deux graines d'un même passage. */
  maxSeedGap: 12,
  /** Décalage de diagonale toléré lors de la fusion (insertions/suppressions). */
  diagonalTolerance: 40,
  /** Longueur minimale d'un passage retenu, en jetons. */
  minTokensExact: 10,
  minTokensParaphrase: 16,
  /** Similarité minimale d'un passage pour être conservé. */
  minSimilarity: 0.34,
  /** Au-delà, un n-gramme est considéré comme du remplissage et ignoré. */
  maxPostingsPerHash: 40,
  /** Garde-fou global sur le nombre de graines traitées par source. */
  maxSeeds: 250_000,
  /** Taille de fenêtre de winnowing (1 = toutes les empreintes). */
  winnow: 1,
};

/** Seuils de classification des passages. */
export const MATCH_TYPES = [
  { min: 0.85, type: 'identique', label: 'Copie littérale' },
  { min: 0.62, type: 'modifie', label: 'Copie légèrement modifiée' },
  { min: 0.0, type: 'paraphrase', label: 'Paraphrase probable' },
];

/**
 * Tri par base 256 (4 passes) de paires (clé 32 bits, valeur).
 * Beaucoup plus rapide qu'un `Array.sort` avec comparateur sur un million
 * d'entrées, et sans allocation d'objets.
 *
 * @param {Uint32Array} keys
 * @param {Int32Array} values
 * @returns {{keys: Uint32Array, values: Int32Array}}
 */
export function radixSortPairs(keys, values) {
  const n = keys.length;
  let srcK = keys;
  let srcV = values;
  let dstK = new Uint32Array(n);
  let dstV = new Int32Array(n);
  const counts = new Uint32Array(256);

  for (let shift = 0; shift < 32; shift += 8) {
    counts.fill(0);
    for (let i = 0; i < n; i++) counts[(srcK[i] >>> shift) & 0xff]++;
    let sum = 0;
    for (let b = 0; b < 256; b++) {
      const c = counts[b];
      counts[b] = sum;
      sum += c;
    }
    for (let i = 0; i < n; i++) {
      const b = (srcK[i] >>> shift) & 0xff;
      const j = counts[b]++;
      dstK[j] = srcK[i];
      dstV[j] = srcV[i];
    }
    const tk = srcK;
    srcK = dstK;
    dstK = tk;
    const tv = srcV;
    srcV = dstV;
    dstV = tv;
  }
  return { keys: srcK, values: srcV };
}

/**
 * Index inversé compact : hachages triés + positions associées.
 */
export class FingerprintIndex {
  /**
   * @param {Uint32Array} hash
   * @param {Int32Array} pos
   * @param {number} k
   */
  constructor(hash, pos, k) {
    const sorted = radixSortPairs(hash.slice(), pos.slice());
    this.hash = sorted.keys;
    this.pos = sorted.values;
    this.k = k;
  }

  /** @returns {number} nombre d'empreintes indexées */
  get size() {
    return this.hash.length;
  }

  /**
   * Renvoie l'intervalle `[from, to)` des positions associées à un hachage.
   *
   * Le balayage s'arrête dès que `maxWidth` est dépassé : l'appelant sait
   * alors que le n-gramme est trop fréquent (formule toute faite, en-tête
   * répété) et l'ignore, sans coût proportionnel au nombre d'occurrences.
   *
   * @param {number} h
   * @param {number} [maxWidth]
   * @returns {[number, number]}
   */
  lookup(h, maxWidth = Infinity) {
    const arr = this.hash;
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid] < h) lo = mid + 1;
      else hi = mid;
    }
    if (lo >= arr.length || arr[lo] !== h) return [0, 0];
    const limit = Math.min(arr.length, lo + maxWidth + 1);
    let end = lo + 1;
    while (end < limit && arr[end] === h) end++;
    return [lo, end];
  }
}

/**
 * @typedef {Object} DocumentIndex
 * @property {import('./text.js').TokenStream} tokens
 * @property {{index: FingerprintIndex, map: Int32Array, k: number}} exact
 * @property {{index: FingerprintIndex, map: Int32Array, k: number}} paraphrase
 * @property {typeof MATCH_DEFAULTS} options
 */

/**
 * Indexe le document analysé (opération réalisée une seule fois).
 *
 * @param {import('./text.js').TokenStream} tokens
 * @param {Partial<typeof MATCH_DEFAULTS>} [options]
 * @returns {DocumentIndex}
 */
export function buildDocumentIndex(tokens, options = {}) {
  const opts = { ...MATCH_DEFAULTS, ...options };
  // Sur les très gros documents, le winnowing divise la taille de l'index
  // sans perdre les passages d'au moins `w + k - 1` jetons.
  const winnow =
    options.winnow !== undefined
      ? options.winnow
      : tokens.count > 400_000
        ? 4
        : tokens.count > 150_000
          ? 2
          : 1;

  const fullStream = buildStream(tokens, false);
  const contentStream = buildStream(tokens, true);

  const fpExact = fingerprint(fullStream, opts.kExact, winnow);
  const fpPara = fingerprint(contentStream, opts.kParaphrase, winnow);

  return {
    tokens,
    options: { ...opts, winnow },
    exact: {
      index: new FingerprintIndex(fpExact.hash, fpExact.pos, opts.kExact),
      map: fullStream.map,
      k: opts.kExact,
      streamLength: fullStream.hash.length,
    },
    paraphrase: {
      index: new FingerprintIndex(fpPara.hash, fpPara.pos, opts.kParaphrase),
      map: contentStream.map,
      k: opts.kParaphrase,
      streamLength: contentStream.hash.length,
    },
  };
}

/**
 * @typedef {Object} PassageMatch
 * @property {number} qStart  premier jeton du document
 * @property {number} qEnd    dernier jeton (exclu)
 * @property {number} sStart  premier jeton de la source
 * @property {number} sEnd    dernier jeton de la source (exclu)
 * @property {number} similarity  0..1
 * @property {string} type    `identique` | `modifie` | `paraphrase`
 * @property {number} seeds   nombre de graines ayant soutenu le passage
 * @property {string} mode    `verbatim` | `paraphrase`
 */

/**
 * Chaîne les graines d'une passe en passages candidats.
 *
 * @param {{q: Int32Array, s: Int32Array, n: number}} seeds
 * @param {number} k
 * @param {typeof MATCH_DEFAULTS} opts
 * @returns {{qs: number, qe: number, ss: number, se: number, seeds: number}[]}
 */
function chainSeeds(seeds, k, opts) {
  const n = seeds.n;
  if (n === 0) return [];

  // Tri par diagonale (q - s) puis par q, via un tri radix sur la diagonale
  // décalée pour rester positive.
  const order = new Int32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  const diag = new Uint32Array(n);
  const BIAS = 1 << 30;
  for (let i = 0; i < n; i++) diag[i] = (seeds.q[i] - seeds.s[i] + BIAS) >>> 0;
  const byDiag = radixSortPairs(diag.slice(), order);

  /** @type {{qs: number, qe: number, ss: number, se: number, seeds: number}[]} */
  const runs = [];
  let i = 0;
  while (i < byDiag.keys.length) {
    let j = i;
    while (j < byDiag.keys.length && byDiag.keys[j] === byDiag.keys[i]) j++;

    // Graines d'une même diagonale, triées par position document.
    const group = Array.from(byDiag.values.subarray(i, j), (idx) => idx);
    group.sort((a, b) => seeds.q[a] - seeds.q[b]);

    let qs = seeds.q[group[0]];
    let qe = qs + k;
    let ss = seeds.s[group[0]];
    let se = ss + k;
    let count = 1;
    for (let g = 1; g < group.length; g++) {
      const idx = group[g];
      const q = seeds.q[idx];
      if (q - qe <= opts.maxSeedGap) {
        qe = Math.max(qe, q + k);
        se = Math.max(se, seeds.s[idx] + k);
        count++;
      } else {
        runs.push({ qs, qe, ss, se, seeds: count });
        qs = q;
        qe = q + k;
        ss = seeds.s[idx];
        se = ss + k;
        count = 1;
      }
    }
    runs.push({ qs, qe, ss, se, seeds: count });
    i = j;
  }

  // Fusion inter-diagonales : un passage réécrit produit plusieurs diagonales
  // voisines qu'il faut recoller.
  runs.sort((a, b) => a.qs - b.qs || a.ss - b.ss);
  /** @type {typeof runs} */
  const merged = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (
      last &&
      run.qs - last.qe <= opts.maxSeedGap * 2 &&
      run.ss >= last.ss - opts.diagonalTolerance &&
      run.ss - last.se <= opts.diagonalTolerance
    ) {
      last.qe = Math.max(last.qe, run.qe);
      last.se = Math.max(last.se, run.se);
      last.ss = Math.min(last.ss, run.ss);
      last.seeds += run.seeds;
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

/**
 * Longueur de la plus longue sous-séquence commune entre deux suites de
 * hachages, en mémoire O(min(n, m)).
 *
 * @param {Uint32Array} a
 * @param {Uint32Array} b
 * @returns {number}
 */
export function lcsLength(a, b) {
  const n = a.length;
  const m = b.length;
  if (!n || !m) return 0;
  let prev = new Int32Array(m + 1);
  let cur = new Int32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1];
    cur[0] = 0;
    for (let j = 1; j <= m; j++) {
      cur[j] = ai === b[j - 1]
        ? prev[j - 1] + 1
        : cur[j - 1] >= prev[j]
          ? cur[j - 1]
          : prev[j];
    }
    // Permutation des lignes : chaque case de `cur` est réécrite au tour
    // suivant, aucune remise à zéro n'est nécessaire.
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }
  return prev[m];
}

/**
 * Similarité de Dice sur multiensembles — repli économique quand
 * l'alignement complet serait trop coûteux.
 * @param {Uint32Array} a
 * @param {Uint32Array} b
 */
export function multisetDice(a, b) {
  if (!a.length || !b.length) return 0;
  /** @type {Map<number, number>} */
  const counts = new Map();
  for (const h of a) counts.set(h, (counts.get(h) || 0) + 1);
  let common = 0;
  for (const h of b) {
    const c = counts.get(h);
    if (c > 0) {
      counts.set(h, c - 1);
      common++;
    }
  }
  return (2 * common) / (a.length + b.length);
}

const MAX_DP_CELLS = 1_600_000;

/**
 * Similarité d'alignement entre deux plages de jetons.
 * @param {Uint32Array} a
 * @param {Uint32Array} b
 * @returns {number} 0..1
 */
export function alignmentSimilarity(a, b) {
  if (!a.length || !b.length) return 0;
  if (a.length * b.length > MAX_DP_CELLS) return multisetDice(a, b);
  const lcs = lcsLength(a, b);
  return (2 * lcs) / (a.length + b.length);
}

/** @param {number} similarity */
export function classify(similarity) {
  for (const t of MATCH_TYPES) if (similarity >= t.min) return t;
  return MATCH_TYPES[MATCH_TYPES.length - 1];
}

/**
 * Exécute une passe de correspondance (verbatim ou paraphrase).
 *
 * @param {{index: FingerprintIndex, map: Int32Array, k: number}} side index du document
 * @param {{hash: Uint32Array, pos: Int32Array}} sourceFp empreintes de la source
 * @param {Int32Array} sourceMap flux source → indices de jetons
 * @param {import('./text.js').TokenStream} qTokens
 * @param {import('./text.js').TokenStream} sTokens
 * @param {typeof MATCH_DEFAULTS} opts
 * @param {string} mode
 * @returns {PassageMatch[]}
 */
function runPass(side, sourceFp, sourceMap, qTokens, sTokens, opts, mode) {
  const { index, map, k } = side;
  if (index.size === 0 || sourceFp.hash.length === 0) return [];

  // --- 1. Collecte des graines -------------------------------------------
  const qSeeds = [];
  const sSeeds = [];
  for (let i = 0; i < sourceFp.hash.length; i++) {
    const [from, to] = index.lookup(sourceFp.hash[i], opts.maxPostingsPerHash);
    const width = to - from;
    if (width === 0 || width > opts.maxPostingsPerHash) continue;
    for (let p = from; p < to; p++) {
      qSeeds.push(index.pos[p]);
      sSeeds.push(sourceFp.pos[i]);
      if (qSeeds.length >= opts.maxSeeds) break;
    }
    if (qSeeds.length >= opts.maxSeeds) break;
  }
  if (qSeeds.length === 0) return [];

  const seeds = {
    q: Int32Array.from(qSeeds),
    s: Int32Array.from(sSeeds),
    n: qSeeds.length,
  };

  // --- 2. Chaînage --------------------------------------------------------
  const runs = chainSeeds(seeds, k, opts);
  const minTokens =
    mode === 'verbatim' ? opts.minTokensExact : opts.minTokensParaphrase;

  /** @type {PassageMatch[]} */
  const matches = [];
  for (const run of runs) {
    // Passage du repère « flux » au repère « jetons du document ».
    const qStart = map[clamp(run.qs, 0, map.length - 1)];
    const qEnd = Math.min(
      qTokens.count,
      map[clamp(run.qe - 1, 0, map.length - 1)] + 1,
    );
    const sStart = sourceMap[clamp(run.ss, 0, sourceMap.length - 1)];
    const sEnd = Math.min(
      sTokens.count,
      sourceMap[clamp(run.se - 1, 0, sourceMap.length - 1)] + 1,
    );
    if (qEnd - qStart < minTokens || sEnd - sStart < minTokens) continue;

    const similarity = alignmentSimilarity(
      qTokens.hash.subarray(qStart, qEnd),
      sTokens.hash.subarray(sStart, sEnd),
    );
    if (similarity < opts.minSimilarity) continue;

    matches.push({
      qStart,
      qEnd,
      sStart,
      sEnd,
      similarity,
      type: classify(similarity).type,
      seeds: run.seeds,
      mode,
    });
  }
  return matches;
}

/** @param {number} v @param {number} lo @param {number} hi */
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Fusionne les passages qui se recouvrent dans le document.
 * @param {PassageMatch[]} matches
 * @returns {PassageMatch[]}
 */
export function mergeMatches(matches) {
  if (matches.length <= 1) return matches.slice();
  const sorted = matches.slice().sort((a, b) => a.qStart - b.qStart || b.qEnd - a.qEnd);
  /** @type {PassageMatch[]} */
  const out = [];
  for (const m of sorted) {
    const last = out[out.length - 1];
    // On fusionne uniquement si les passages se recouvrent réellement et
    // pointent vers une zone voisine de la source.
    if (
      last &&
      m.qStart <= last.qEnd &&
      Math.abs(m.sStart - last.sEnd) < 400 + (last.sEnd - last.sStart)
    ) {
      const weightA = last.qEnd - last.qStart;
      const weightB = m.qEnd - m.qStart;
      last.similarity =
        (last.similarity * weightA + m.similarity * weightB) / (weightA + weightB);
      last.qEnd = Math.max(last.qEnd, m.qEnd);
      last.sStart = Math.min(last.sStart, m.sStart);
      last.sEnd = Math.max(last.sEnd, m.sEnd);
      last.seeds += m.seeds;
      last.type = classify(last.similarity).type;
      if (m.mode !== last.mode) last.mode = 'mixte';
    } else {
      out.push({ ...m });
    }
  }
  return out;
}

/**
 * Compare le document indexé à une source et renvoie les passages communs.
 *
 * @param {DocumentIndex} docIndex
 * @param {import('./text.js').TokenStream} sourceTokens
 * @param {Partial<typeof MATCH_DEFAULTS>} [options]
 * @returns {PassageMatch[]}
 */
export function matchSource(docIndex, sourceTokens, options = {}) {
  const opts = { ...docIndex.options, ...options };
  if (sourceTokens.count < opts.kExact) return [];

  const srcFull = buildStream(sourceTokens, false);
  const srcContent = buildStream(sourceTokens, true);

  const exact = runPass(
    docIndex.exact,
    fingerprint(srcFull, docIndex.exact.k, opts.winnow),
    srcFull.map,
    docIndex.tokens,
    sourceTokens,
    opts,
    'verbatim',
  );
  const para = runPass(
    docIndex.paraphrase,
    fingerprint(srcContent, docIndex.paraphrase.k, opts.winnow),
    srcContent.map,
    docIndex.tokens,
    sourceTokens,
    opts,
    'paraphrase',
  );

  return mergeMatches([...exact, ...para]);
}

/**
 * Détecte les répétitions internes au document (auto-plagiat, copier-coller
 * entre chapitres).
 *
 * @param {DocumentIndex} docIndex
 * @param {{minDistance?: number, minTokens?: number}} [options]
 * @returns {{aStart: number, aEnd: number, bStart: number, bEnd: number, similarity: number}[]}
 */
export function findInternalDuplication(docIndex, options = {}) {
  const minDistance = options.minDistance ?? 200;
  const minTokens = options.minTokens ?? 24;
  const { index, map, k } = docIndex.exact;
  const tokens = docIndex.tokens;

  /** @type {Map<number, number[]>} */
  const groups = new Map();
  for (let i = 0; i < index.size; ) {
    let j = i + 1;
    while (j < index.size && index.hash[j] === index.hash[i]) j++;
    if (j - i > 1 && j - i <= 12) {
      groups.set(index.hash[i], Array.from(index.pos.subarray(i, j)));
    }
    i = j;
  }

  /** @type {{aStart: number, aEnd: number, bStart: number, bEnd: number, similarity: number}[]} */
  const pairs = [];
  const seen = new Set();
  for (const positions of groups.values()) {
    positions.sort((a, b) => a - b);
    for (let a = 0; a < positions.length; a++) {
      for (let b = a + 1; b < positions.length; b++) {
        const pa = positions[a];
        const pb = positions[b];
        if (pb - pa < minDistance) continue;
        const key = `${pa >> 4}:${pb >> 4}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Extension gloutonne de part et d'autre de la graine commune.
        let left = 0;
        while (
          pa - left - 1 >= 0 &&
          tokens.hash[map[pa - left - 1]] === tokens.hash[map[pb - left - 1]]
        ) {
          left++;
        }
        let right = k;
        while (
          pb + right < map.length &&
          tokens.hash[map[pa + right]] === tokens.hash[map[pb + right]]
        ) {
          right++;
        }
        const length = left + right;
        if (length < minTokens) continue;
        pairs.push({
          aStart: map[pa - left],
          aEnd: map[Math.min(map.length - 1, pa + right - 1)] + 1,
          bStart: map[pb - left],
          bEnd: map[Math.min(map.length - 1, pb + right - 1)] + 1,
          similarity: 1,
        });
      }
    }
  }

  pairs.sort((x, y) => y.aEnd - y.aStart - (x.aEnd - x.aStart));
  /** @type {typeof pairs} */
  const kept = [];
  for (const p of pairs) {
    if (kept.some((q) => p.aStart < q.aEnd && p.aEnd > q.aStart)) continue;
    kept.push(p);
    if (kept.length >= 50) break;
  }
  return kept.sort((a, b) => a.aStart - b.aStart);
}

/**
 * Union de plages de jetons, en nombre de jetons couverts.
 * @param {{qStart: number, qEnd: number}[]} matches
 * @returns {{covered: number, ranges: {start: number, end: number}[]}}
 */
export function unionCoverage(matches) {
  if (!matches.length) return { covered: 0, ranges: [] };
  const sorted = matches
    .map((m) => ({ start: m.qStart, end: m.qEnd }))
    .sort((a, b) => a.start - b.start);
  /** @type {{start: number, end: number}[]} */
  const ranges = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= cur.end) {
      cur.end = Math.max(cur.end, sorted[i].end);
    } else {
      ranges.push(cur);
      cur = { ...sorted[i] };
    }
  }
  ranges.push(cur);
  const covered = ranges.reduce((sum, r) => sum + (r.end - r.start), 0);
  return { covered, ranges };
}

/**
 * Soustrait des plages exclues (citations, bibliographie) d'une couverture.
 * @param {{start: number, end: number}[]} ranges
 * @param {{start: number, end: number}[]} excluded
 * @returns {{start: number, end: number}[]}
 */
export function subtractRanges(ranges, excluded) {
  if (!excluded.length) return ranges;
  const sortedEx = excluded.slice().sort((a, b) => a.start - b.start);
  /** @type {{start: number, end: number}[]} */
  const out = [];
  for (const r of ranges) {
    let segments = [{ ...r }];
    for (const ex of sortedEx) {
      /** @type {{start: number, end: number}[]} */
      const next = [];
      for (const seg of segments) {
        if (ex.end <= seg.start || ex.start >= seg.end) {
          next.push(seg);
          continue;
        }
        if (ex.start > seg.start) next.push({ start: seg.start, end: ex.start });
        if (ex.end < seg.end) next.push({ start: ex.end, end: seg.end });
      }
      segments = next;
    }
    out.push(...segments);
  }
  return out.filter((r) => r.end > r.start);
}

/**
 * Attribue chaque jeton couvert à la source dont le passage est le plus fiable.
 *
 * @param {{sourceId: string, matches: {qStart: number, qEnd: number, similarity: number}[]}[]} perSource
 * @param {number} tokenCount
 * @returns {Map<string, number>} identifiant de source → jetons attribués
 */
export function attributeTokens(perSource, tokenCount) {
  const owner = new Int32Array(tokenCount).fill(-1);
  const score = new Float32Array(tokenCount);
  const ids = perSource.map((s) => s.sourceId);

  perSource.forEach((entry, sourceIdx) => {
    for (const m of entry.matches) {
      const weight = m.similarity;
      const end = Math.min(tokenCount, m.qEnd);
      for (let i = Math.max(0, m.qStart); i < end; i++) {
        if (weight > score[i]) {
          score[i] = weight;
          owner[i] = sourceIdx;
        }
      }
    }
  });

  /** @type {Map<string, number>} */
  const totals = new Map();
  for (let i = 0; i < tokenCount; i++) {
    if (owner[i] < 0) continue;
    const id = ids[owner[i]];
    totals.set(id, (totals.get(id) || 0) + 1);
  }
  return totals;
}
