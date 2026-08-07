/**
 * Lancement des traitements lourds, avec repli automatique.
 *
 * Les Web Workers de type module ne sont pas disponibles partout (navigateurs
 * anciens, contextes `file://`). Le `Runner` tente d'abord le worker ; s'il
 * échoue, il exécute exactement le même code sur le fil principal. La seule
 * différence perceptible est la fluidité de l'interface, jamais le résultat.
 *
 * @module core/runner
 */

import { deserializeError } from './errors.js';

/** Base commune aux deux lanceurs. */
class WorkerRunner {
  /**
   * @param {URL} workerUrl
   * @param {string} requestType type de message de démarrage
   */
  constructor(workerUrl, requestType) {
    this.workerUrl = workerUrl;
    this.requestType = requestType;
    /** @type {Worker|null} */
    this.worker = null;
    this.workerFailed = false;
    this.sequence = 0;
    /** @type {AbortController|null} */
    this.localAbort = null;
  }

  /** Indique si l'exécution a lieu dans un worker. */
  get usesWorker() {
    return this.worker !== null;
  }

  /** Crée le worker, ou renvoie `null` si l'environnement ne le permet pas. */
  ensureWorker() {
    if (this.worker || this.workerFailed) return this.worker;
    try {
      if (typeof Worker !== 'function') throw new Error('Worker indisponible');
      this.worker = new Worker(this.workerUrl, { type: 'module' });
    } catch {
      this.workerFailed = true;
      this.worker = null;
    }
    return this.worker;
  }

  /** Marque le worker comme inutilisable et le libère. */
  #discardWorker() {
    this.workerFailed = true;
    try {
      this.worker?.terminate();
    } catch {
      /* le worker peut déjà être arrêté */
    }
    this.worker = null;
  }

  /**
   * Envoie une tâche au worker.
   * @param {Record<string, any>} message
   * @param {(payload: any) => void} onProgress
   * @returns {Promise<any>}
   */
  postToWorker(message, onProgress) {
    const worker = this.worker;
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        worker.removeEventListener('message', handler);
        worker.removeEventListener('error', onWorkerError);
        worker.removeEventListener('messageerror', onWorkerError);
      };
      const handler = (event) => {
        const data = event.data || {};
        if (data.id !== id) return;
        if (data.type === 'progression') {
          onProgress?.(data.payload);
        } else if (data.type === 'termine') {
          cleanup();
          resolve(data.payload);
        } else if (data.type === 'erreur') {
          cleanup();
          reject(deserializeError(data.payload));
        }
      };
      // Un module de worker qui ne se charge pas déclenche `error` sans jamais
      // répondre : sans ce garde-fou, l'appel resterait suspendu.
      const onWorkerError = (event) => {
        cleanup();
        this.#discardWorker();
        const error = new Error(
          event?.message || "Le worker n'a pas pu démarrer.",
        );
        error.workerStartupFailure = true;
        reject(error);
      };
      worker.addEventListener('message', handler);
      worker.addEventListener('error', onWorkerError);
      worker.addEventListener('messageerror', onWorkerError);
      worker.postMessage({ ...message, id, type: this.requestType });
    });
  }

  /** Interrompt la tâche en cours. */
  cancel() {
    this.localAbort?.abort();
    if (this.worker) this.worker.postMessage({ type: 'annuler' });
  }

  /** Libère le worker. */
  dispose() {
    try {
      this.worker?.terminate();
    } catch {
      /* ignore */
    }
    this.worker = null;
  }
}

/** Lanceur d'analyse de plagiat. */
export class AnalysisRunner extends WorkerRunner {
  constructor() {
    super(new URL('../workers/analyzer.worker.js', import.meta.url), 'analyser');
  }

  /**
   * @param {any} input
   * @param {any} settings
   * @param {{onProgress?: (e: any) => void}} [hooks]
   * @returns {Promise<any>}
   */
  async analyze(input, settings, hooks = {}) {
    const onProgress = hooks.onProgress || (() => {});
    const worker = this.ensureWorker();
    if (worker) {
      try {
        return await this.postToWorker({ input, settings }, onProgress);
      } catch (err) {
        // Seul un échec de démarrage justifie de rejouer en local : une erreur
        // d'analyse doit remonter telle quelle.
        if (!err?.workerStartupFailure) throw err;
      }
    }

    const { analyzeDocument } = await import('./pipeline.js');
    this.localAbort = new AbortController();
    try {
      return await analyzeDocument(input, settings, {
        onProgress,
        signal: this.localAbort.signal,
      });
    } finally {
      this.localAbort = null;
    }
  }
}

/** Lanceur d'humanisation. */
export class HumanizeRunner extends WorkerRunner {
  constructor() {
    super(new URL('../workers/humanizer.worker.js', import.meta.url), 'humaniser');
  }

  /**
   * @param {string} text
   * @param {any} options
   * @param {{onProgress?: (e: any) => void}} [hooks]
   * @returns {Promise<any>}
   */
  async run(text, options, hooks = {}) {
    const onProgress = hooks.onProgress || (() => {});
    const worker = this.ensureWorker();
    if (worker) {
      try {
        return await this.postToWorker({ text, options }, onProgress);
      } catch (err) {
        if (!err?.workerStartupFailure) throw err;
      }
    }
    const { humanize } = await import('./humanizer.js');
    return humanize(text, options, (ratio) => onProgress({ ratio }));
  }
}
