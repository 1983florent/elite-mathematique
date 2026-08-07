/**
 * Lecteur ZIP à accès aléatoire, conçu pour les très gros fichiers.
 *
 * Plutôt que de charger l'archive entière en mémoire, on lit uniquement les
 * plages utiles via `Blob.slice()` : fin du fichier (EOCD), répertoire central,
 * puis les entrées demandées. Un .docx de 300 Mo se lit donc sans jamais
 * matérialiser plus que la partie réellement exploitée.
 *
 * Prend en charge ZIP64, les méthodes « stored » (0) et « deflate » (8), et
 * expose les entrées soit en `Uint8Array`, soit en flux (`ReadableStream`)
 * pour un traitement incrémental.
 *
 * @module core/zip-reader
 */

import { inflateRaw, inflateRawAuto, hasNativeInflate } from './inflate.js';

const SIG_EOCD = 0x06054b50;
const SIG_EOCD64 = 0x06064b50;
const SIG_EOCD64_LOC = 0x07064b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

const EOCD_MIN_SIZE = 22;
const MAX_COMMENT = 0xffff;

/** Erreur levée pour toute archive ZIP invalide ou non prise en charge. */
export class ZipError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ZipError';
  }
}

/**
 * @typedef {Object} ZipEntry
 * @property {string} name          chemin interne (ex. `word/document.xml`)
 * @property {number} method        0 = stored, 8 = deflate
 * @property {number} compressedSize
 * @property {number} uncompressedSize
 * @property {number} headerOffset  décalage de l'en-tête local
 * @property {number} crc32
 * @property {boolean} isDirectory
 */

const utf8 = new TextDecoder('utf-8');

/** @param {Blob} blob @param {number} start @param {number} end */
async function readSlice(blob, start, end) {
  const clamped = Math.min(end, blob.size);
  const buf = await blob.slice(Math.max(0, start), clamped).arrayBuffer();
  return new DataView(buf);
}

/**
 * Localise l'« End Of Central Directory » en balayant la fin du fichier.
 * @param {Blob} blob
 * @returns {Promise<{view: DataView, offsetInFile: number, position: number}>}
 */
async function findEocd(blob) {
  const maxScan = Math.min(blob.size, EOCD_MIN_SIZE + MAX_COMMENT);
  const start = blob.size - maxScan;
  const view = await readSlice(blob, start, blob.size);
  for (let i = view.byteLength - EOCD_MIN_SIZE; i >= 0; i--) {
    if (view.getUint32(i, true) === SIG_EOCD) {
      return { view, offsetInFile: start, position: i };
    }
  }
  throw new ZipError(
    "Signature ZIP introuvable : le fichier n'est pas une archive valide (un .docx est une archive ZIP).",
  );
}

/**
 * Lit le répertoire central, en gérant la variante ZIP64.
 * @param {Blob} blob
 * @returns {Promise<{start: number, size: number, count: number}>}
 */
async function locateCentralDirectory(blob) {
  const { view, offsetInFile, position } = await findEocd(blob);

  let count = view.getUint16(position + 10, true);
  let size = view.getUint32(position + 12, true);
  let start = view.getUint32(position + 16, true);

  const needsZip64 =
    count === 0xffff || size === 0xffffffff || start === 0xffffffff;

  if (needsZip64) {
    // Le localisateur ZIP64 précède immédiatement l'EOCD classique.
    const locPos = position - 20;
    const locAbsolute = offsetInFile + locPos;
    if (locPos < 0) throw new ZipError('Localisateur ZIP64 manquant.');
    const loc =
      locPos >= 0 && view.getUint32(locPos, true) === SIG_EOCD64_LOC
        ? view
        : await readSlice(blob, locAbsolute, locAbsolute + 20);
    const base = loc === view ? locPos : 0;
    if (loc.getUint32(base, true) !== SIG_EOCD64_LOC) {
      throw new ZipError('Localisateur ZIP64 invalide.');
    }
    const eocd64Offset = Number(loc.getBigUint64(base + 8, true));
    const z = await readSlice(blob, eocd64Offset, eocd64Offset + 56);
    if (z.getUint32(0, true) !== SIG_EOCD64) {
      throw new ZipError('Enregistrement ZIP64 invalide.');
    }
    count = Number(z.getBigUint64(32, true));
    size = Number(z.getBigUint64(40, true));
    start = Number(z.getBigUint64(48, true));
  }

  return { start, size, count };
}

/**
 * Analyse le champ « extra » ZIP64 (0x0001) d'une entrée du répertoire central.
 * @param {DataView} view
 * @param {number} offset
 * @param {number} length
 * @param {{uncompressedSize: number, compressedSize: number, headerOffset: number}} entry
 */
function applyZip64Extra(view, offset, length, entry) {
  let pos = offset;
  const end = offset + length;
  while (pos + 4 <= end) {
    const id = view.getUint16(pos, true);
    const size = view.getUint16(pos + 2, true);
    let field = pos + 4;
    if (id === 0x0001) {
      if (entry.uncompressedSize === 0xffffffff && field + 8 <= end) {
        entry.uncompressedSize = Number(view.getBigUint64(field, true));
        field += 8;
      }
      if (entry.compressedSize === 0xffffffff && field + 8 <= end) {
        entry.compressedSize = Number(view.getBigUint64(field, true));
        field += 8;
      }
      if (entry.headerOffset === 0xffffffff && field + 8 <= end) {
        entry.headerOffset = Number(view.getBigUint64(field, true));
        field += 8;
      }
      return;
    }
    pos = field + size;
  }
}

/** Archive ZIP ouverte en lecture aléatoire. */
export class ZipArchive {
  /**
   * @param {Blob} blob
   * @param {Map<string, ZipEntry>} entries
   */
  constructor(blob, entries) {
    this.blob = blob;
    /** @type {Map<string, ZipEntry>} */
    this.entries = entries;
  }

  /**
   * Ouvre une archive et charge son répertoire central.
   * @param {Blob|File} blob
   * @returns {Promise<ZipArchive>}
   */
  static async open(blob) {
    if (!blob || typeof blob.slice !== 'function') {
      throw new ZipError('Source illisible : un Blob ou File est attendu.');
    }
    if (blob.size < EOCD_MIN_SIZE) {
      throw new ZipError('Fichier trop petit pour être une archive ZIP.');
    }

    const { start, size, count } = await locateCentralDirectory(blob);
    const view = await readSlice(blob, start, start + size);
    /** @type {Map<string, ZipEntry>} */
    const entries = new Map();

    let pos = 0;
    for (let i = 0; i < count && pos + 46 <= view.byteLength; i++) {
      if (view.getUint32(pos, true) !== SIG_CENTRAL) {
        break; // Répertoire central tronqué : on garde ce qui a été lu.
      }
      const flags = view.getUint16(pos + 8, true);
      const method = view.getUint16(pos + 10, true);
      const crc32 = view.getUint32(pos + 16, true);
      const nameLen = view.getUint16(pos + 28, true);
      const extraLen = view.getUint16(pos + 30, true);
      const commentLen = view.getUint16(pos + 32, true);

      const entry = {
        name: '',
        method,
        crc32,
        compressedSize: view.getUint32(pos + 20, true),
        uncompressedSize: view.getUint32(pos + 24, true),
        headerOffset: view.getUint32(pos + 42, true),
        isDirectory: false,
      };

      const nameBytes = new Uint8Array(
        view.buffer,
        view.byteOffset + pos + 46,
        nameLen,
      );
      // Le bit 11 signale un nom UTF-8 ; les autres cas restent lisibles en
      // ASCII pour les noms normalisés d'un .docx.
      entry.name = utf8.decode(nameBytes);
      void flags;

      if (extraLen) {
        applyZip64Extra(view, pos + 46 + nameLen, extraLen, entry);
      }
      entry.isDirectory =
        entry.name.endsWith('/') && entry.uncompressedSize === 0;

      if (!entry.isDirectory) entries.set(entry.name, entry);
      pos += 46 + nameLen + extraLen + commentLen;
    }

    if (entries.size === 0) {
      throw new ZipError('Archive ZIP vide ou illisible.');
    }
    return new ZipArchive(blob, entries);
  }

  /** @returns {string[]} liste des chemins internes */
  list() {
    return [...this.entries.keys()];
  }

  /** @param {string} name @returns {boolean} */
  has(name) {
    return this.entries.has(name);
  }

  /**
   * Calcule la plage d'octets compressés d'une entrée (lecture de l'en-tête local).
   * @param {ZipEntry} entry
   * @returns {Promise<{start: number, end: number}>}
   */
  async dataRange(entry) {
    const head = await readSlice(
      this.blob,
      entry.headerOffset,
      entry.headerOffset + 30,
    );
    if (head.byteLength < 30 || head.getUint32(0, true) !== SIG_LOCAL) {
      throw new ZipError(`En-tête local invalide pour « ${entry.name} ».`);
    }
    const nameLen = head.getUint16(26, true);
    const extraLen = head.getUint16(28, true);
    const start = entry.headerOffset + 30 + nameLen + extraLen;
    return { start, end: start + entry.compressedSize };
  }

  /**
   * Lit une entrée complète et la renvoie décompressée.
   * @param {string} name
   * @returns {Promise<Uint8Array>}
   */
  async read(name) {
    const entry = this.entries.get(name);
    if (!entry) throw new ZipError(`Entrée « ${name} » absente de l'archive.`);
    const { start, end } = await this.dataRange(entry);
    const raw = new Uint8Array(
      await this.blob.slice(start, end).arrayBuffer(),
    );
    if (entry.method === 0) return raw;
    if (entry.method === 8) return inflateRawAuto(raw, entry.uncompressedSize);
    throw new ZipError(
      `Méthode de compression ${entry.method} non prise en charge pour « ${name} ».`,
    );
  }

  /**
   * Lit une entrée et la décode en texte UTF-8.
   * @param {string} name
   * @returns {Promise<string>}
   */
  async readText(name) {
    return utf8.decode(await this.read(name));
  }

  /**
   * Ouvre une entrée sous forme de flux d'octets décompressés.
   *
   * C'est la voie privilégiée pour `word/document.xml`, qui peut peser
   * plusieurs centaines de mégaoctets une fois décompressé.
   *
   * @param {string} name
   * @returns {Promise<ReadableStream<Uint8Array>>}
   */
  async stream(name) {
    const entry = this.entries.get(name);
    if (!entry) throw new ZipError(`Entrée « ${name} » absente de l'archive.`);
    const { start, end } = await this.dataRange(entry);
    const slice = this.blob.slice(start, end);

    if (entry.method === 0) return slice.stream();
    if (entry.method !== 8) {
      throw new ZipError(
        `Méthode de compression ${entry.method} non prise en charge pour « ${name} ».`,
      );
    }

    if (hasNativeInflate()) {
      try {
        return slice.stream().pipeThrough(new DecompressionStream('deflate-raw'));
      } catch {
        // On bascule sur le décodeur JavaScript ci-dessous.
      }
    }

    const raw = new Uint8Array(await slice.arrayBuffer());
    const data = inflateRaw(raw, entry.uncompressedSize);
    return new ReadableStream({
      start(controller) {
        // Découpage en blocs de 1 Mio pour que le consommateur reste réactif.
        const CHUNK = 1 << 20;
        for (let i = 0; i < data.length; i += CHUNK) {
          controller.enqueue(data.subarray(i, Math.min(i + CHUNK, data.length)));
        }
        controller.close();
      },
    });
  }

  /**
   * Taille totale décompressée de l'archive (utile pour estimer la charge).
   * @returns {number}
   */
  totalUncompressedSize() {
    let total = 0;
    for (const entry of this.entries.values()) total += entry.uncompressedSize;
    return total;
  }
}
