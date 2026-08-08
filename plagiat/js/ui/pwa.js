/**
 * Application **100 % en ligne**.
 *
 * Ce module garantit qu'aucune version installable ou hors ligne ne subsiste :
 *  - il n'enregistre PAS de service worker ;
 *  - il **désenregistre** tout service worker et vide les caches laissés par
 *    une visite précédente ;
 *  - il **neutralise** l'invite d'installation du navigateur.
 *
 * Le module est inerte hors d'un navigateur (tests Node) et sous `file://`.
 *
 * @module ui/pwa
 */

/**
 * @param {{onInstallable?: (show: boolean) => void, notify?: (m: string, k?: string) => void}} [hooks]
 * @returns {{promptInstall: () => Promise<void>}}
 */
export function setupPwa(hooks = {}) {
  const noop = { promptInstall: async () => {} };
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return noop;

  // Retire tout service worker / cache d'une version antérieure, afin que
  // l'application fonctionne uniquement en ligne (aucun mode hors ligne).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (typeof caches !== 'undefined') {
      caches
        .keys?.()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }

  // Empêche le navigateur de proposer l'installation sur le bureau.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    hooks.onInstallable?.(false);
  });

  return noop;
}

/**
 * Application purement en ligne : jamais « installée ».
 * @returns {boolean}
 */
export function isInstalled() {
  return false;
}
