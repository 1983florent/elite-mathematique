/**
 * Worker d'analyse : exécute tout le pipeline (lecture du .docx, requêtes
 * réseau, comparaison) hors du fil principal, afin que l'interface reste
 * fluide même sur un document de plusieurs milliers de pages.
 *
 * Protocole de messages :
 *   → { type: 'analyser', id, input, settings }
 *   → { type: 'annuler' }
 *   ← { type: 'progression', id, payload }
 *   ← { type: 'termine', id, payload }
 *   ← { type: 'erreur', id, payload }
 *
 * @module workers/analyzer.worker
 */

import { analyzeDocument } from '../core/pipeline.js';
import { serializeError } from '../core/errors.js';

/** @type {AbortController|null} */
let current = null;

self.onmessage = async (event) => {
  const { type, id, input, settings } = event.data || {};

  if (type === 'annuler') {
    current?.abort();
    return;
  }

  if (type !== 'analyser') return;

  current = new AbortController();
  try {
    const report = await analyzeDocument(input, settings, {
      signal: current.signal,
      onProgress: (payload) => self.postMessage({ type: 'progression', id, payload }),
    });
    self.postMessage({ type: 'termine', id, payload: report });
  } catch (err) {
    self.postMessage({ type: 'erreur', id, payload: serializeError(err) });
  } finally {
    current = null;
  }
};
