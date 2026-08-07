/**
 * Couche réseau : file d'attente à concurrence limitée, régulation par hôte,
 * reprise sur erreur et classification des pannes.
 *
 * L'application interroge des services publics depuis le navigateur ; les
 * causes d'échec sont donc nombreuses (CORS, quota, hors ligne, clé invalide).
 * Chaque erreur est traduite en message actionnable plutôt qu'en « Failed to
 * fetch », afin que l'utilisateur sache quoi corriger.
 *
 * @module core/net
 */

/** Catégories d'erreur réseau exposées à l'interface. */
export const NET_ERRORS = {
  OFFLINE: 'hors-ligne',
  CORS: 'cors',
  TIMEOUT: 'delai',
  RATE_LIMIT: 'quota',
  AUTH: 'authentification',
  SERVER: 'serveur',
  NOT_FOUND: 'introuvable',
  ABORTED: 'annule',
  UNKNOWN: 'inconnu',
};

/** Erreur réseau enrichie d'une catégorie et d'un conseil. */
export class NetworkError extends Error {
  /**
   * @param {string} kind
   * @param {string} message
   * @param {{status?: number, url?: string, hint?: string, cause?: unknown}} [info]
   */
  constructor(kind, message, info = {}) {
    super(message);
    this.name = 'NetworkError';
    this.kind = kind;
    this.status = info.status ?? 0;
    this.url = info.url ?? '';
    this.hint = info.hint ?? '';
    this.cause = info.cause;
  }
}

/**
 * Construit un message d'erreur explicite à partir d'une réponse HTTP.
 * @param {Response} response
 * @param {string} providerName
 * @returns {NetworkError}
 */
export function httpError(response, providerName) {
  const { status } = response;
  if (status === 401 || status === 403) {
    return new NetworkError(
      NET_ERRORS.AUTH,
      `${providerName} : accès refusé (HTTP ${status}).`,
      {
        status,
        url: response.url,
        hint: "Vérifiez la clé d'API et les domaines autorisés dans votre compte.",
      },
    );
  }
  if (status === 429) {
    return new NetworkError(
      NET_ERRORS.RATE_LIMIT,
      `${providerName} : quota ou débit dépassé (HTTP 429).`,
      {
        status,
        url: response.url,
        hint: 'Réduisez le nombre de requêtes dans les réglages ou réessayez plus tard.',
      },
    );
  }
  if (status === 404) {
    return new NetworkError(
      NET_ERRORS.NOT_FOUND,
      `${providerName} : ressource introuvable (HTTP 404).`,
      { status, url: response.url },
    );
  }
  if (status >= 500) {
    return new NetworkError(
      NET_ERRORS.SERVER,
      `${providerName} : service indisponible (HTTP ${status}).`,
      { status, url: response.url, hint: 'Réessayez dans quelques minutes.' },
    );
  }
  return new NetworkError(
    NET_ERRORS.UNKNOWN,
    `${providerName} : réponse inattendue (HTTP ${status}).`,
    { status, url: response.url },
  );
}

/**
 * Traduit une exception de `fetch` en erreur exploitable.
 * @param {unknown} err
 * @param {string} providerName
 * @param {string} url
 * @returns {NetworkError}
 */
export function transportError(err, providerName, url) {
  if (err instanceof NetworkError) return err;
  const isAbort =
    err && typeof err === 'object' && /** @type {any} */ (err).name === 'AbortError';
  if (isAbort) {
    return new NetworkError(NET_ERRORS.ABORTED, 'Requête annulée.', { url, cause: err });
  }
  const offline =
    typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline) {
    return new NetworkError(
      NET_ERRORS.OFFLINE,
      'Aucune connexion internet détectée.',
      {
        url,
        hint: "L'analyse en ligne nécessite une connexion. Le corpus local reste utilisable.",
        cause: err,
      },
    );
  }
  return new NetworkError(
    NET_ERRORS.CORS,
    `${providerName} : requête bloquée par le navigateur.`,
    {
      url,
      hint:
        "Le service n'autorise pas les appels directs depuis une page web (CORS). " +
        'Activez un relais dans les réglages, ou choisissez un autre moteur.',
      cause: err,
    },
  );
}

/**
 * File d'exécution à concurrence bornée, avec délai minimal entre deux
 * requêtes vers un même hôte (politesse envers les API publiques).
 */
export class RequestQueue {
  /**
   * @param {{concurrency?: number, minIntervalMs?: number}} [options]
   */
  constructor(options = {}) {
    this.concurrency = Math.max(1, options.concurrency ?? 4);
    this.minIntervalMs = options.minIntervalMs ?? 120;
    this.active = 0;
    /** @type {{task: () => Promise<any>, resolve: Function, reject: Function, host: string}[]} */
    this.pending = [];
    /** @type {Map<string, number>} */
    this.lastCall = new Map();
    this.stopped = false;
  }

  /** Vide la file et rejette les tâches en attente. */
  clear() {
    this.stopped = true;
    const pending = this.pending.splice(0, this.pending.length);
    for (const item of pending) {
      item.reject(new NetworkError(NET_ERRORS.ABORTED, 'Analyse interrompue.'));
    }
  }

  /** Remet la file en service après un `clear()`. */
  resume() {
    this.stopped = false;
  }

  /**
   * Planifie une tâche.
   * @template T
   * @param {() => Promise<T>} task
   * @param {string} [host] clé de régulation (hôte de l'URL)
   * @returns {Promise<T>}
   */
  run(task, host = 'default') {
    if (this.stopped) {
      return Promise.reject(
        new NetworkError(NET_ERRORS.ABORTED, 'Analyse interrompue.'),
      );
    }
    return new Promise((resolve, reject) => {
      this.pending.push({ task, resolve, reject, host });
      this.#pump();
    });
  }

  #pump() {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const item = this.pending.shift();
      this.active++;
      this.#execute(item);
    }
  }

  /** @param {{task: () => Promise<any>, resolve: Function, reject: Function, host: string}} item */
  async #execute(item) {
    try {
      const last = this.lastCall.get(item.host) || 0;
      const wait = last + this.minIntervalMs - Date.now();
      if (wait > 0) await sleep(wait);
      this.lastCall.set(item.host, Date.now());
      item.resolve(await item.task());
    } catch (err) {
      item.reject(err);
    } finally {
      this.active--;
      this.#pump();
    }
  }
}

/** @param {number} ms */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @typedef {Object} FetchOptions
 * @property {string} [method]
 * @property {Record<string, string>} [headers]
 * @property {string} [body]
 * @property {AbortSignal} [signal]
 * @property {number} [timeoutMs]
 * @property {number} [retries]
 * @property {string} [providerName]
 * @property {'json'|'text'} [as]
 */

/**
 * `fetch` avec délai maximal, reprises exponentielles et erreurs typées.
 *
 * @param {string} url
 * @param {FetchOptions} [options]
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    signal,
    timeoutMs = 20000,
    retries = 2,
    providerName = 'Service',
    as = 'json',
  } = options;

  let attempt = 0;
  for (;;) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', onAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });

      if (!response.ok) {
        const error = httpError(response, providerName);
        const retryable =
          error.kind === NET_ERRORS.RATE_LIMIT || error.kind === NET_ERRORS.SERVER;
        if (retryable && attempt < retries) {
          await backoff(attempt++, response);
          continue;
        }
        throw error;
      }

      return as === 'text' ? await response.text() : await response.json();
    } catch (err) {
      const netErr = transportError(err, providerName, url);
      if (
        netErr.kind === NET_ERRORS.ABORTED &&
        signal &&
        signal.aborted
      ) {
        throw netErr;
      }
      if (
        attempt < retries &&
        (netErr.kind === NET_ERRORS.SERVER ||
          netErr.kind === NET_ERRORS.RATE_LIMIT ||
          netErr.kind === NET_ERRORS.ABORTED)
      ) {
        // Un abandon non demandé provient du délai maximal : on retente.
        await backoff(attempt++);
        continue;
      }
      throw netErr;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    }
  }
}

/**
 * Attente exponentielle avec gigue, en respectant `Retry-After` si fourni.
 * @param {number} attempt
 * @param {Response} [response]
 */
async function backoff(attempt, response) {
  let delay = Math.min(8000, 500 * 2 ** attempt);
  const header = response?.headers?.get?.('retry-after');
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) delay = Math.min(15000, seconds * 1000);
  }
  await sleep(delay + Math.random() * 250);
}

/**
 * Extrait l'hôte d'une URL, pour la régulation par service.
 * @param {string} url
 * @returns {string}
 */
export function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return 'inconnu';
  }
}

/**
 * Assemble une URL avec ses paramètres de requête.
 * @param {string} base
 * @param {Record<string, string|number|undefined|null>} params
 * @returns {string}
 */
export function withParams(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}
