/**
 * Utilitaires partagés par les tests Node.
 * Les modules du cœur applicatif sont volontairement sans dépendance au DOM :
 * ils s'exécutent donc tels quels sous Node comme dans le navigateur.
 */
import { fixtureBuffer } from './fixtures.mjs';

/**
 * Charge une fixture sous forme de Blob, comme un File du navigateur.
 * Les documents sont construits à la volée (voir `fixtures.mjs`) : aucun
 * fichier binaire n'est versionné.
 *
 * @param {string} name
 * @returns {Promise<Blob>}
 */
export async function fixtureBlob(name) {
  return new Blob([fixtureBuffer(name)]);
}

/** Texte pseudo-aléatoire reproductible (générateur mulberry32). */
export function makeRandom(seed = 42) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
