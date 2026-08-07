/**
 * Sérialisation des erreurs pour le passage entre worker et fil principal.
 * Une erreur transmise telle quelle perd son type et ses champs : on la
 * réduit donc à un objet simple, puis on la reconstitue de l'autre côté.
 *
 * @module core/errors
 */

/**
 * @param {unknown} err
 * @returns {{name: string, message: string, kind?: string, hint?: string, status?: number}}
 */
export function serializeError(err) {
  if (!err || typeof err !== 'object') {
    return { name: 'Error', message: String(err ?? 'Erreur inconnue') };
  }
  const e = /** @type {any} */ (err);
  return {
    name: e.name || 'Error',
    message: e.message || String(e),
    kind: e.kind,
    hint: e.hint,
    status: e.status,
    stack: typeof e.stack === 'string' ? e.stack.split('\n').slice(0, 4).join('\n') : '',
  };
}

/**
 * Reconstitue une erreur à partir de sa forme sérialisée.
 * @param {any} payload
 * @returns {Error}
 */
export function deserializeError(payload) {
  const error = new Error(payload?.message || 'Erreur inconnue');
  error.name = payload?.name || 'Error';
  Object.assign(error, {
    kind: payload?.kind,
    hint: payload?.hint,
    status: payload?.status,
    remoteStack: payload?.stack,
  });
  return error;
}

/**
 * Message lisible destiné à l'utilisateur, conseil inclus.
 * @param {any} err
 * @returns {string}
 */
export function userMessage(err) {
  if (!err) return 'Erreur inconnue.';
  const message = err.message || String(err);
  return err.hint ? `${message} ${err.hint}` : message;
}
