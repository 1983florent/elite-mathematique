/**
 * Décompression DEFLATE brute (RFC 1951) en JavaScript pur.
 *
 * Utilisée uniquement comme repli lorsque `DecompressionStream('deflate-raw')`
 * n'est pas disponible (Safari < 16.4, Firefox < 113, navigateurs anciens).
 * L'implémentation suit la logique canonique de `puff.c` : tables de Huffman
 * décrites par (compteurs, symboles) et décodage bit à bit, ce qui privilégie
 * la compacité et la correction sur la vitesse brute.
 *
 * @module core/inflate
 */

const LENGTH_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67,
  83, 99, 115, 131, 163, 195, 227, 258,
];
const LENGTH_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
  5, 5, 0,
];
const DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
  1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
  11, 12, 12, 13, 13,
];
/** Ordre de transmission des longueurs de code du « code de codes ». */
const CLEN_ORDER = [
  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
];

const MAX_BITS = 15;

/** Erreur levée lorsque le flux DEFLATE est corrompu ou tronqué. */
export class InflateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InflateError';
  }
}

/**
 * Construit une table de Huffman canonique à partir des longueurs de code.
 * @param {Uint8Array|number[]} lengths longueur de code de chaque symbole (0 = absent)
 * @param {number} n nombre de symboles
 * @returns {{counts: Int32Array, symbols: Int32Array}}
 */
function buildHuffman(lengths, n) {
  const counts = new Int32Array(MAX_BITS + 1);
  for (let i = 0; i < n; i++) counts[lengths[i]]++;
  counts[0] = 0;

  // Vérifie que le code n'est ni sur-souscrit ni (sauf cas dégénéré) incomplet.
  let left = 1;
  for (let len = 1; len <= MAX_BITS; len++) {
    left <<= 1;
    left -= counts[len];
    if (left < 0) throw new InflateError('code de Huffman sur-souscrit');
  }

  const offsets = new Int32Array(MAX_BITS + 2);
  for (let len = 1; len <= MAX_BITS; len++) {
    offsets[len + 1] = offsets[len] + counts[len];
  }
  const symbols = new Int32Array(n);
  for (let sym = 0; sym < n; sym++) {
    if (lengths[sym]) symbols[offsets[lengths[sym]]++] = sym;
  }
  return { counts, symbols };
}

/** Lecteur de bits LSB-first sur un tampon d'octets. */
class BitReader {
  /** @param {Uint8Array} bytes */
  constructor(bytes) {
    this.bytes = bytes;
    this.pos = 0; // prochain octet à consommer
    this.bitBuf = 0;
    this.bitCnt = 0;
  }

  /**
   * Lit `need` bits (0..24) et les renvoie, LSB d'abord.
   * @param {number} need
   * @returns {number}
   */
  bits(need) {
    let val = this.bitBuf;
    while (this.bitCnt < need) {
      if (this.pos >= this.bytes.length) {
        throw new InflateError('flux DEFLATE tronqué');
      }
      val |= this.bytes[this.pos++] << this.bitCnt;
      this.bitCnt += 8;
    }
    this.bitBuf = val >>> need;
    this.bitCnt -= need;
    return val & ((1 << need) - 1);
  }

  /** Aligne le lecteur sur la frontière d'octet suivante. */
  alignToByte() {
    this.bitBuf = 0;
    this.bitCnt = 0;
  }

  /**
   * Décode un symbole avec la table de Huffman fournie.
   * @param {{counts: Int32Array, symbols: Int32Array}} table
   * @returns {number}
   */
  decode(table) {
    const { counts, symbols } = table;
    let code = 0;
    let first = 0;
    let index = 0;
    for (let len = 1; len <= MAX_BITS; len++) {
      code |= this.bits(1);
      const count = counts[len];
      if (code - first < count) return symbols[index + (code - first)];
      index += count;
      first = (first + count) << 1;
      code <<= 1;
    }
    throw new InflateError('symbole de Huffman invalide');
  }
}

/** Tampon de sortie à croissance amortie. */
class OutBuffer {
  /** @param {number} initial */
  constructor(initial) {
    this.buf = new Uint8Array(Math.max(1024, initial | 0));
    this.len = 0;
  }

  /** @param {number} extra */
  ensure(extra) {
    const needed = this.len + extra;
    if (needed <= this.buf.length) return;
    let size = this.buf.length;
    while (size < needed) size = size < 1 << 24 ? size * 2 : size + (1 << 24);
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.len));
    this.buf = next;
  }

  /** @param {number} byte */
  push(byte) {
    this.ensure(1);
    this.buf[this.len++] = byte;
  }

  /** @param {Uint8Array} chunk */
  append(chunk) {
    this.ensure(chunk.length);
    this.buf.set(chunk, this.len);
    this.len += chunk.length;
  }

  /**
   * Copie `length` octets depuis `distance` octets en arrière (LZ77).
   * @param {number} distance
   * @param {number} length
   */
  copyBack(distance, length) {
    if (distance > this.len) {
      throw new InflateError('distance LZ77 hors du dictionnaire');
    }
    this.ensure(length);
    let src = this.len - distance;
    const buf = this.buf;
    for (let i = 0; i < length; i++) buf[this.len++] = buf[src++];
  }

  /** @returns {Uint8Array} */
  result() {
    return this.buf.subarray(0, this.len);
  }
}

let FIXED_LIT = null;
let FIXED_DIST = null;

/** Construit (une seule fois) les tables de Huffman fixes du bloc de type 1. */
function fixedTables() {
  if (FIXED_LIT) return { lit: FIXED_LIT, dist: FIXED_DIST };
  const litLengths = new Uint8Array(288);
  litLengths.fill(8, 0, 144);
  litLengths.fill(9, 144, 256);
  litLengths.fill(7, 256, 280);
  litLengths.fill(8, 280, 288);
  FIXED_LIT = buildHuffman(litLengths, 288);
  FIXED_DIST = buildHuffman(new Uint8Array(30).fill(5), 30);
  return { lit: FIXED_LIT, dist: FIXED_DIST };
}

/**
 * Lit les tables de Huffman dynamiques d'un bloc de type 2.
 * @param {BitReader} reader
 */
function dynamicTables(reader) {
  const nlen = reader.bits(5) + 257;
  const ndist = reader.bits(5) + 1;
  const ncode = reader.bits(4) + 4;
  if (nlen > 286 || ndist > 30) {
    throw new InflateError('nombre de codes dynamiques invalide');
  }

  const clenLengths = new Uint8Array(19);
  for (let i = 0; i < ncode; i++) clenLengths[CLEN_ORDER[i]] = reader.bits(3);
  const clenTable = buildHuffman(clenLengths, 19);

  const lengths = new Uint8Array(nlen + ndist);
  let index = 0;
  while (index < nlen + ndist) {
    const sym = reader.decode(clenTable);
    if (sym < 16) {
      lengths[index++] = sym;
    } else if (sym === 16) {
      if (index === 0) throw new InflateError('répétition sans code précédent');
      const prev = lengths[index - 1];
      let repeat = 3 + reader.bits(2);
      while (repeat-- > 0 && index < lengths.length) lengths[index++] = prev;
    } else if (sym === 17) {
      let repeat = 3 + reader.bits(3);
      while (repeat-- > 0 && index < lengths.length) lengths[index++] = 0;
    } else {
      let repeat = 11 + reader.bits(7);
      while (repeat-- > 0 && index < lengths.length) lengths[index++] = 0;
    }
  }

  return {
    lit: buildHuffman(lengths.subarray(0, nlen), nlen),
    dist: buildHuffman(lengths.subarray(nlen), ndist),
  };
}

/**
 * Décompresse un flux DEFLATE brut (sans en-tête zlib ni gzip).
 *
 * @param {Uint8Array} data données compressées
 * @param {number} [expectedSize] taille décompressée attendue (pré-allocation)
 * @returns {Uint8Array} données décompressées
 */
export function inflateRaw(data, expectedSize = 0) {
  const reader = new BitReader(data);
  const out = new OutBuffer(expectedSize || data.length * 4);

  for (;;) {
    const isFinal = reader.bits(1);
    const type = reader.bits(2);

    if (type === 0) {
      // Bloc stocké : aligné sur l'octet, longueur + complément.
      reader.alignToByte();
      if (reader.pos + 4 > data.length) {
        throw new InflateError('bloc stocké tronqué');
      }
      const len = data[reader.pos] | (data[reader.pos + 1] << 8);
      const nlen = data[reader.pos + 2] | (data[reader.pos + 3] << 8);
      reader.pos += 4;
      if ((len ^ 0xffff) !== nlen) {
        throw new InflateError('longueur de bloc stocké incohérente');
      }
      if (reader.pos + len > data.length) {
        throw new InflateError('bloc stocké tronqué');
      }
      out.append(data.subarray(reader.pos, reader.pos + len));
      reader.pos += len;
    } else if (type === 1 || type === 2) {
      const { lit, dist } = type === 1 ? fixedTables() : dynamicTables(reader);
      for (;;) {
        const sym = reader.decode(lit);
        if (sym < 256) {
          out.push(sym);
        } else if (sym === 256) {
          break;
        } else {
          const li = sym - 257;
          if (li >= LENGTH_BASE.length) {
            throw new InflateError('code de longueur invalide');
          }
          const length = LENGTH_BASE[li] + reader.bits(LENGTH_EXTRA[li]);
          const dsym = reader.decode(dist);
          if (dsym >= DIST_BASE.length) {
            throw new InflateError('code de distance invalide');
          }
          const distance = DIST_BASE[dsym] + reader.bits(DIST_EXTRA[dsym]);
          out.copyBack(distance, length);
        }
      }
    } else {
      throw new InflateError('type de bloc DEFLATE réservé');
    }

    if (isFinal) break;
  }

  return out.result();
}

/**
 * Indique si l'API native de décompression est utilisable.
 * @returns {boolean}
 */
export function hasNativeInflate() {
  try {
    return (
      typeof DecompressionStream === 'function' &&
      !!new DecompressionStream('deflate-raw')
    );
  } catch {
    return false;
  }
}

/**
 * Décompresse un flux DEFLATE brut en privilégiant l'API native.
 * @param {Uint8Array} data
 * @param {number} [expectedSize]
 * @returns {Promise<Uint8Array>}
 */
export async function inflateRawAuto(data, expectedSize = 0) {
  if (hasNativeInflate()) {
    try {
      const stream = new Blob([data])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'));
      const buf = await new Response(stream).arrayBuffer();
      return new Uint8Array(buf);
    } catch {
      // Certaines implémentations rejettent les flux légèrement non conformes :
      // on retombe alors sur le décodeur JavaScript, plus tolérant.
    }
  }
  return inflateRaw(data, expectedSize);
}
