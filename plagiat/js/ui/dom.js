/**
 * Petites aides DOM partagées par les vues. Pas de framework : la surface
 * dont l'application a besoin tient en quelques fonctions.
 *
 * @module ui/dom
 */

/** @param {string} selector @param {ParentNode} [root] */
export const $ = (selector, root = document) => root.querySelector(selector);

/** @param {string} selector @param {ParentNode} [root] */
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Crée un élément.
 * @param {string} tag
 * @param {Record<string, any>} [props] attributs ; `class`, `dataset`, `html`, `on*`
 * @param {(Node|string)[]|Node|string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node && key !== 'list') {
      node[key] = value;
    } else {
      node.setAttribute(key, value === true ? '' : value);
    }
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** @param {Element} node */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Formate un nombre à la française. */
export function num(value, decimals = 0) {
  return Number(value ?? 0).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Formate une taille en octets. */
export function bytes(value) {
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let size = Number(value) || 0;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(size < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

/**
 * Affiche une notification éphémère.
 * @param {string} message
 * @param {'info'|'succes'|'erreur'} [kind]
 * @param {number} [durationMs]
 */
export function notify(message, kind = 'info', durationMs = 6000) {
  const host = $('#notifications');
  if (!host) return;
  const node = el('div', { class: `notification notification--${kind}`, role: 'status' }, message);
  host.append(node);
  const remove = () => node.remove();
  setTimeout(remove, durationMs);
  node.addEventListener('click', remove);
}

/**
 * Déclenche le téléchargement d'un contenu.
 * @param {Blob|string} content
 * @param {string} filename
 * @param {string} [mime]
 */
export function download(content, filename, mime = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Retarde l'exécution jusqu'à la fin d'une rafale d'appels.
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} delay
 * @returns {F}
 */
export function debounce(fn, delay = 250) {
  let timer = 0;
  return /** @type {any} */ (
    (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    }
  );
}

/** Laisse le navigateur respirer entre deux lots de travail. */
export function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Copie un texte dans le presse-papiers, avec repli. */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = el('textarea', { value: text, style: { position: 'fixed', opacity: '0' } });
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
