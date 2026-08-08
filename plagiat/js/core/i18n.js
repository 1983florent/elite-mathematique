/**
 * Internationalisation, le moteur qui rend l'application utilisable dans
 * toutes les langues.
 *
 * Principes :
 *   • **La langue de la machine est la valeur par défaut** (`navigator.language`),
 *     sauf choix explicite mémorisé par l'utilisateur.
 *   • Toute chaîne visible passe par `t('clé')`. Les éléments HTML statiques
 *     portent `data-i18n` (texte), `data-i18n-html` (contenu riche) ou
 *     `data-i18n-attr="attr:clé,attr:clé"` (attributs comme `placeholder`).
 *   • L'écriture droite-à-gauche (arabe, hébreu, persan, ourdou) bascule
 *     automatiquement `dir="rtl"` sur la page.
 *   • Une langue non traduite retombe proprement sur l'anglais puis le
 *     français ; un traducteur automatique branché à l'exécution peut combler
 *     le reste (voir `setAutoTranslator`).
 *
 * Le module est inerte hors navigateur (les fonctions existent, `t()`
 * fonctionne pour les tests Node).
 *
 * @module core/i18n
 */

import { LOCALES } from '../data/locales.js';

/** Langues proposées dans le sélecteur, avec nom natif et direction. */
export const LANGUAGES = [
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
];

const RTL = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi']);
const BASE = 'fr';
const FALLBACKS = ['en', 'fr'];

/** État courant. */
let current = BASE;
/** @type {((lang: string) => void)[]} */
const listeners = [];
/** @type {null | ((key: string, text: string, lang: string) => string)} */
let autoTranslator = null;
/** Cache des traductions automatiques résolues. */
const autoCache = new Map();

/**
 * Sélecteur canonique d'une langue (« fr-CA » → « fr », « zh-Hans » → « zh »).
 * @param {string} code
 * @returns {string}
 */
export function canonical(code) {
  if (!code) return BASE;
  const short = String(code).toLowerCase().split(/[-_]/)[0];
  return short;
}

/**
 * Détermine la langue de départ : préférence mémorisée, puis langue de la
 * machine, puis langue de base.
 * @param {string} [saved]
 * @returns {string}
 */
export function detectLanguage(saved) {
  if (saved && hasLocale(saved)) return canonical(saved);
  const nav =
    typeof navigator !== 'undefined'
      ? navigator.languages || [navigator.language]
      : [];
  for (const l of nav) {
    const c = canonical(l);
    if (hasLocale(c)) return c;
  }
  // Langue de la machine même si non traduite : on la garde pour l'auto-traduction.
  const first = nav.length ? canonical(nav[0]) : BASE;
  return first || BASE;
}

/** @param {string} code @returns {boolean} */
export function hasLocale(code) {
  return Object.prototype.hasOwnProperty.call(LOCALES, canonical(code));
}

/** Direction d'écriture d'une langue. */
export function direction(code) {
  const known = LANGUAGES.find((l) => l.code === canonical(code));
  if (known) return known.dir;
  return RTL.has(canonical(code)) ? 'rtl' : 'ltr';
}

/** Langue courante. */
export function getLanguage() {
  return current;
}

/**
 * Branche un traducteur automatique pour les langues non fournies.
 * @param {(key: string, sourceText: string, lang: string) => string} fn
 */
export function setAutoTranslator(fn) {
  autoTranslator = fn;
}

/**
 * Traduit une clé. Les paramètres `{nom}` sont interpolés.
 * @param {string} key
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
export function t(key, params) {
  let value = lookup(key, current);
  if (value === undefined) {
    // Repli : anglais, français, puis la clé elle-même.
    for (const f of FALLBACKS) {
      value = lookup(key, f);
      if (value !== undefined) break;
    }
    if (value === undefined) value = key;
    // Auto-traduction éventuelle pour la langue courante.
    if (autoTranslator && !hasLocale(current)) {
      const cacheKey = `${current}:${key}`;
      if (autoCache.has(cacheKey)) {
        value = autoCache.get(cacheKey);
      } else {
        try {
          const translated = autoTranslator(key, value, current);
          if (translated) {
            autoCache.set(cacheKey, translated);
            value = translated;
          }
        } catch {
          /* on garde le repli */
        }
      }
    }
  }
  return params ? interpolate(value, params) : value;
}

/** @param {string} key @param {string} lang */
function lookup(key, lang) {
  const table = LOCALES[canonical(lang)];
  return table ? table[key] : undefined;
}

/** @param {string} template @param {Record<string, any>} params */
function interpolate(template, params) {
  return template.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] !== undefined ? String(params[name]) : m,
  );
}

/**
 * Change la langue courante, met à jour la page et prévient les abonnés.
 * @param {string} code
 * @param {Document|HTMLElement} [root]
 */
export function setLanguage(code, root) {
  current = canonical(code);
  if (typeof document !== 'undefined') {
    const dir = direction(current);
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('dir', dir);
    applyDom(root || document);
  }
  for (const cb of listeners) {
    try {
      cb(current);
    } catch {
      /* un abonné défaillant ne bloque pas les autres */
    }
  }
}

/** Abonne une fonction aux changements de langue. */
export function onLanguageChange(cb) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

/**
 * Applique les traductions à un arbre DOM (éléments marqués `data-i18n*`).
 * @param {ParentNode} root
 */
export function applyDom(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return;

  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.getAttribute('data-i18n'));
  }
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    // Format : "placeholder:cle.placeholder, title:cle.title"
    for (const pair of el.getAttribute('data-i18n-attr').split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
}

/**
 * Liste enrichie des langues disponibles (traduites) et détectées.
 * @returns {{code: string, name: string, dir: string, translated: boolean}[]}
 */
export function availableLanguages() {
  return LANGUAGES.map((l) => ({ ...l, translated: hasLocale(l.code) }));
}
