/**
 * Persistance locale : réglages, cache des réponses réseau, corpus de
 * référence et historique des rapports.
 *
 * Tout reste dans le navigateur de l'utilisateur — aucun document, aucune clé
 * d'API et aucun rapport ne quitte la machine. IndexedDB est utilisé quand il
 * est disponible (y compris dans les workers) ; sinon un repli mémoire prend
 * le relais sans casser l'application.
 *
 * @module core/store
 */

const DB_NAME = 'elite-plagiat';
const DB_VERSION = 1;
const STORES = ['settings', 'cache', 'corpus', 'reports'];

/** @type {Promise<IDBDatabase|null>|null} */
let dbPromise = null;

/** Ouvre (et crée au besoin) la base IndexedDB. */
function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'key' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return dbPromise;
}

/** Repli mémoire utilisé quand IndexedDB est indisponible. */
const memory = new Map(STORES.map((name) => [name, new Map()]));

/**
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest} action
 */
function transact(db, storeName, mode, action) {
  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(storeName, mode);
    } catch (err) {
      reject(err);
      return;
    }
    const request = action(tx.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Lit une valeur.
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function get(storeName, key) {
  const db = await openDatabase();
  if (!db) return memory.get(storeName)?.get(key);
  try {
    const row = await transact(db, storeName, 'readonly', (s) => s.get(key));
    return row?.value;
  } catch {
    return memory.get(storeName)?.get(key);
  }
}

/**
 * Écrit une valeur.
 * @param {string} storeName
 * @param {string} key
 * @param {any} value
 */
export async function put(storeName, key, value) {
  const db = await openDatabase();
  if (!db) {
    memory.get(storeName)?.set(key, value);
    return;
  }
  try {
    await transact(db, storeName, 'readwrite', (s) =>
      s.put({ key, value, ts: Date.now() }),
    );
  } catch {
    memory.get(storeName)?.set(key, value);
  }
}

/**
 * Supprime une valeur.
 * @param {string} storeName
 * @param {string} key
 */
export async function remove(storeName, key) {
  const db = await openDatabase();
  memory.get(storeName)?.delete(key);
  if (!db) return;
  try {
    await transact(db, storeName, 'readwrite', (s) => s.delete(key));
  } catch {
    /* le repli mémoire a déjà été mis à jour */
  }
}

/**
 * Renvoie toutes les entrées d'un magasin.
 * @param {string} storeName
 * @returns {Promise<{key: string, value: any, ts: number}[]>}
 */
export async function all(storeName) {
  const db = await openDatabase();
  if (!db) {
    return [...(memory.get(storeName)?.entries() ?? [])].map(([key, value]) => ({
      key,
      value,
      ts: 0,
    }));
  }
  try {
    const rows = await transact(db, storeName, 'readonly', (s) => s.getAll());
    return rows || [];
  } catch {
    return [];
  }
}

/**
 * Vide un magasin.
 * @param {string} storeName
 */
export async function clear(storeName) {
  memory.get(storeName)?.clear();
  const db = await openDatabase();
  if (!db) return;
  try {
    await transact(db, storeName, 'readwrite', (s) => s.clear());
  } catch {
    /* rien à faire */
  }
}

/**
 * Cache des réponses réseau, avec durée de vie et purge automatique.
 */
export class ResponseCache {
  /** @param {{ttlMs?: number, maxEntries?: number, enabled?: boolean}} [options] */
  constructor(options = {}) {
    this.ttlMs = options.ttlMs ?? 7 * 24 * 3600 * 1000;
    this.maxEntries = options.maxEntries ?? 4000;
    this.enabled = options.enabled !== false;
    /** @type {Map<string, any>} cache de premier niveau, par session */
    this.hot = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /** @param {string} key */
  async get(key) {
    if (!this.enabled) return undefined;
    if (this.hot.has(key)) {
      this.hits++;
      return this.hot.get(key);
    }
    const row = await get('cache', key);
    if (row && Date.now() - row.ts < this.ttlMs) {
      this.hits++;
      this.hot.set(key, row.data);
      return row.data;
    }
    this.misses++;
    return undefined;
  }

  /** @param {string} key @param {any} data */
  async set(key, data) {
    if (!this.enabled) return;
    this.hot.set(key, data);
    // Les très grosses réponses ne sont gardées qu'en mémoire vive.
    try {
      const size = JSON.stringify(data)?.length ?? 0;
      if (size > 1_500_000) return;
    } catch {
      return;
    }
    await put('cache', key, { data, ts: Date.now() });
  }

  /** Supprime les entrées expirées et limite la taille du cache. */
  async purge() {
    const rows = await all('cache');
    const now = Date.now();
    const stale = rows.filter((r) => now - (r.value?.ts ?? 0) > this.ttlMs);
    for (const row of stale) await remove('cache', row.key);

    const remaining = rows.length - stale.length;
    if (remaining > this.maxEntries) {
      const fresh = rows
        .filter((r) => now - (r.value?.ts ?? 0) <= this.ttlMs)
        .sort((a, b) => (a.value?.ts ?? 0) - (b.value?.ts ?? 0));
      for (const row of fresh.slice(0, remaining - this.maxEntries)) {
        await remove('cache', row.key);
      }
    }
  }

  /** Statistiques d'efficacité du cache. */
  stats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      ratio: total ? Math.round((this.hits / total) * 100) : 0,
    };
  }
}

/* ------------------------------------------------------------------ *
 * Réglages
 * ------------------------------------------------------------------ */

/** Réglages par défaut de l'application. */
export const DEFAULT_SETTINGS = {
  /** Profil d'analyse : rapide | standard | approfondi | integral */
  depth: 'standard',
  providers: ['wikipedia-fr', 'wikipedia-en', 'openalex', 'crossref'],
  reader: 'aucun',
  searchLanguage: 'fr',
  contactEmail: '',
  concurrency: 4,
  resultsPerQuery: 5,
  maxQueries: 60,
  cacheEnabled: true,
  includeNotes: true,
  includeHeadersFooters: false,
  excludeQuotes: true,
  excludeBibliography: true,
  detectInternalDuplication: true,
  minPassageWords: 10,
  theme: 'auto',
  /** Clés d'API : conservées uniquement dans ce navigateur. */
  keys: {
    googleApiKey: '',
    googleCx: '',
    serperKey: '',
    braveKey: '',
    tavilyKey: '',
    searxngUrl: '',
    customEndpoint: '',
    customToken: '',
    semanticScholarKey: '',
    readerProxy: '',
  },
};

/** Charge les réglages persistés, fusionnés avec les valeurs par défaut. */
export async function loadSettings() {
  const saved = (await get('settings', 'current')) || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    keys: { ...DEFAULT_SETTINGS.keys, ...(saved.keys || {}) },
  };
}

/** @param {any} settings */
export async function saveSettings(settings) {
  await put('settings', 'current', settings);
}

/** Efface toutes les données locales (réglages, cache, corpus, rapports). */
export async function eraseEverything() {
  for (const name of STORES) await clear(name);
}

/**
 * Taille approximative occupée par l'application, si le navigateur l'expose.
 * @returns {Promise<{usage: number, quota: number}|null>}
 */
export async function storageUsage() {
  try {
    if (navigator?.storage?.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return { usage, quota };
    }
  } catch {
    /* information facultative */
  }
  return null;
}
