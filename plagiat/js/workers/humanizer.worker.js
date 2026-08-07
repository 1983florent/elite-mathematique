/**
 * Worker d'humanisation : réécrit un texte long sans figer l'interface.
 *
 * Protocole :
 *   → { type: 'humaniser', id, text, options }
 *   ← { type: 'progression', id, payload: {ratio} }
 *   ← { type: 'termine', id, payload }
 *   ← { type: 'erreur', id, payload }
 *
 * @module workers/humanizer.worker
 */

import { humanize } from '../core/humanizer.js';
import { serializeError } from '../core/errors.js';

self.onmessage = (event) => {
  const { type, id, text, options } = event.data || {};
  if (type !== 'humaniser') return;
  try {
    const result = humanize(text, options, (ratio) =>
      self.postMessage({ type: 'progression', id, payload: { ratio } }),
    );
    self.postMessage({ type: 'termine', id, payload: result });
  } catch (err) {
    self.postMessage({ type: 'erreur', id, payload: serializeError(err) });
  }
};
