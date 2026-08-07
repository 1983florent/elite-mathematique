/**
 * Génère les icônes de l'application (PWA et bureau) sans aucune dépendance.
 *
 * Les PNG sont dessinés pixel par pixel puis encodés à la main via `zlib` :
 * un carré arrondi bleu marque, sur lequel se détache une loupe dorée —
 * l'analyse, la recherche. Les variantes « maskable » ménagent une zone de
 * sécurité pour les masques ronds d'Android et de Windows.
 *
 *   node tools/make-icons.mjs
 *
 * @module tools/make-icons
 */

import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

/* ------------------------------------------------------------------ *
 * Encodeur PNG minimal (RGBA, non entrelacé)
 * ------------------------------------------------------------------ */

/** CRC-32 pour les blocs PNG. */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Assemble un bloc PNG (longueur, type, données, CRC). */
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'latin1');
  const body = Buffer.concat([typeBuf, data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/**
 * Encode un tampon RGBA en PNG.
 * @param {number} size
 * @param {Uint8Array} rgba  size*size*4 octets
 * @returns {Buffer}
 */
function encodePng(size, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // profondeur 8 bits
  ihdr[9] = 6; // couleur RGBA
  // compression / filtre / entrelacement = 0

  // Chaque ligne est préfixée d'un octet de filtre (0 = aucun).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    );
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ *
 * Dessin
 * ------------------------------------------------------------------ */

const MARINE = [30, 42, 120]; // #1e2a78
const MARINE_FONCE = [22, 32, 92];
const OR = [251, 192, 45]; // #fbc02d
const BLANC = [255, 255, 255];

/** Mélange deux couleurs. */
function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Dessine l'icône dans un tampon RGBA.
 *
 * @param {number} size
 * @param {boolean} maskable  ménage une zone de sécurité (mark plus petit)
 * @returns {Uint8Array}
 */
function drawIcon(size, maskable) {
  const rgba = new Uint8Array(size * size * 4);
  const s = size;
  // Échantillonnage 3×3 par pixel pour un antialiasing correct.
  const SUB = 3;

  // Fond : carré arrondi (transparent hors du rayon) sur les variantes non
  // maskable ; plein bord à bord sur les maskable (le masque s'en charge).
  const radius = maskable ? 0 : s * 0.22;
  const pad = maskable ? s * 0.14 : s * 0.0; // zone de sécurité pour le contenu

  // Géométrie de la loupe.
  const cx = s * (maskable ? 0.44 : 0.43);
  const cy = s * (maskable ? 0.44 : 0.43);
  const ringOuter = s * (maskable ? 0.19 : 0.235);
  const ringInner = s * (maskable ? 0.125 : 0.155);
  // Manche : segment épais entre deux points.
  const hx0 = cx + ringOuter * 0.72;
  const hy0 = cy + ringOuter * 0.72;
  const hx1 = s * (maskable ? 0.70 : 0.75);
  const hy1 = s * (maskable ? 0.70 : 0.75);
  const handleHalf = s * (maskable ? 0.045 : 0.05);

  /** Distance d'un point au segment [0,1]. */
  const distToSegment = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx;
    const qy = ay + t * dy;
    return Math.hypot(px - qx, py - qy);
  };

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SUB; sy++) {
        for (let sx = 0; sx < SUB; sx++) {
          const px = x + (sx + 0.5) / SUB;
          const py = y + (sy + 0.5) / SUB;

          // --- Fond ---
          let inBackground = true;
          if (radius > 0) {
            // Carré arrondi : coins découpés.
            const dxr = Math.max(radius - px, px - (s - radius), 0);
            const dyr = Math.max(radius - py, py - (s - radius), 0);
            if (Math.hypot(dxr, dyr) > radius) inBackground = false;
          }

          let cr = 0;
          let cg = 0;
          let cb = 0;
          let ca = 0;

          if (inBackground) {
            // Dégradé diagonal discret.
            const t = (px + py) / (2 * s);
            const bg = mix(MARINE, MARINE_FONCE, t);
            cr = bg[0];
            cg = bg[1];
            cb = bg[2];
            ca = 255;
          }

          // --- Loupe (par-dessus le fond) ---
          const inSafe = px >= pad && py >= pad && px <= s - pad && py <= s - pad;
          if (inSafe || !maskable) {
            const dCenter = Math.hypot(px - cx, py - cy);
            const dHandle = distToSegment(px, py, hx0, hy0, hx1, hy1);
            const onRing = dCenter <= ringOuter && dCenter >= ringInner;
            const onHandle = dHandle <= handleHalf && dCenter >= ringInner * 0.9;
            const onGlass = dCenter < ringInner;

            if (onRing || onHandle) {
              cr = OR[0];
              cg = OR[1];
              cb = OR[2];
              ca = 255;
            } else if (onGlass) {
              // Verre légèrement clair.
              const glass = mix(MARINE, BLANC, 0.14);
              cr = glass[0];
              cg = glass[1];
              cb = glass[2];
              ca = 255;
            }
          }

          r += cr;
          g += cg;
          b += cb;
          a += ca;
        }
      }

      const n = SUB * SUB;
      const i = (y * s + x) * 4;
      rgba[i] = Math.round(r / n);
      rgba[i + 1] = Math.round(g / n);
      rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = Math.round(a / n);
    }
  }
  return rgba;
}

/* ------------------------------------------------------------------ *
 * Génération
 * ------------------------------------------------------------------ */

async function main() {
  const iconDir = join(ROOT, 'plagiat/icons');
  const desktopDir = join(ROOT, 'desktop/build');
  await mkdir(iconDir, { recursive: true });
  await mkdir(desktopDir, { recursive: true });

  const targets = [
    { size: 192, maskable: false, path: join(iconDir, 'icon-192.png') },
    { size: 512, maskable: false, path: join(iconDir, 'icon-512.png') },
    { size: 192, maskable: true, path: join(iconDir, 'icon-192-maskable.png') },
    { size: 512, maskable: true, path: join(iconDir, 'icon-512-maskable.png') },
    { size: 512, maskable: false, path: join(iconDir, 'favicon-512.png') },
    // Icône de l'application de bureau (electron-builder attend ≥ 512).
    { size: 512, maskable: false, path: join(desktopDir, 'icon.png') },
    { size: 1024, maskable: false, path: join(desktopDir, 'icon-1024.png') },
  ];

  for (const t of targets) {
    const png = encodePng(t.size, drawIcon(t.size, t.maskable));
    await writeFile(t.path, png);
    console.log(`${t.path.replace(ROOT + '/', '')} — ${t.size}×${t.size}, ${(png.length / 1024).toFixed(1)} Ko`);
  }
  void dirname;
}

main();
