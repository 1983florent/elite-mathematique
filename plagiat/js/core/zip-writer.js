/**
 * Écriture d'archives ZIP (utilisée pour produire le rapport au format .docx).
 *
 * Compression `deflate` via `CompressionStream` quand le navigateur la
 * propose, sinon stockage sans compression, les deux sont conformes à la
 * spécification ZIP et Word ouvre indifféremment les deux.
 *
 * @module core/zip-writer
 */

/** Table CRC-32 (polynôme 0xEDB88320), construite une seule fois. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * CRC-32 d'un tampon d'octets.
 * @param {Uint8Array} data
 * @returns {number}
 */
export function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();

/**
 * Compresse en `deflate` brut si l'API native est disponible.
 * @param {Uint8Array} data
 * @returns {Promise<{data: Uint8Array, method: number}>}
 */
async function maybeDeflate(data) {
  if (data.length < 256 || typeof CompressionStream !== 'function') {
    return { data, method: 0 };
  }
  try {
    const stream = new Blob([data])
      .stream()
      .pipeThrough(new CompressionStream('deflate-raw'));
    const packed = new Uint8Array(await new Response(stream).arrayBuffer());
    // On ne garde la compression que si elle apporte quelque chose.
    return packed.length < data.length
      ? { data: packed, method: 8 }
      : { data, method: 0 };
  } catch {
    return { data, method: 0 };
  }
}

/**
 * Construit une archive ZIP.
 *
 * @param {{name: string, data: string|Uint8Array}[]} files
 * @param {{mimeType?: string}} [options]
 * @returns {Promise<Blob>}
 */
export async function createZip(files, options = {}) {
  /** @type {Uint8Array[]} */
  const chunks = [];
  /** @type {{name: Uint8Array, crc: number, compressed: number, uncompressed: number, offset: number, method: number}[]} */
  const central = [];
  let offset = 0;

  for (const file of files) {
    const raw = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const nameBytes = encoder.encode(file.name);
    const { data: payload, method } = await maybeDeflate(raw);
    const crc = crc32(raw);

    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true); // version minimale
    view.setUint16(6, 0x0800, true); // noms en UTF-8
    view.setUint16(8, method, true);
    view.setUint16(10, 0, true); // heure
    view.setUint16(12, 0x21, true); // date (1980-01-01) : archive reproductible
    view.setUint32(14, crc, true);
    view.setUint32(18, payload.length, true);
    view.setUint32(22, raw.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    header.set(nameBytes, 30);

    chunks.push(header, payload);
    central.push({
      name: nameBytes,
      crc,
      compressed: payload.length,
      uncompressed: raw.length,
      offset,
      method,
    });
    offset += header.length + payload.length;
  }

  const centralStart = offset;
  for (const entry of central) {
    const record = new Uint8Array(46 + entry.name.length);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true); // version d'écriture
    view.setUint16(6, 20, true); // version minimale
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, entry.method, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0x21, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.compressed, true);
    view.setUint32(24, entry.uncompressed, true);
    view.setUint16(28, entry.name.length, true);
    view.setUint32(42, entry.offset, true);
    record.set(entry.name, 46);
    chunks.push(record);
    offset += record.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, central.length, true);
  endView.setUint16(10, central.length, true);
  endView.setUint32(12, offset - centralStart, true);
  endView.setUint32(16, centralStart, true);
  chunks.push(end);

  return new Blob(chunks, {
    type: options.mimeType || 'application/zip',
  });
}
