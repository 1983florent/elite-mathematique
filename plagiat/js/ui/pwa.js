/**
 * Intégration « application installable » (PWA).
 *
 * Enregistre le service worker (fonctionnement hors ligne), capte l'invite
 * d'installation du navigateur et l'expose via un bouton discret. Rien de tout
 * cela n'est requis pour utiliser l'application : c'est un confort qui, une
 * fois l'app installée, lui donne son icône, sa fenêtre propre et un accès
 * sans connexion.
 *
 * Le module est inerte hors d'un navigateur (tests Node) et sous `file://`,
 * où les service workers ne sont pas disponibles.
 *
 * @module ui/pwa
 */

/**
 * @param {{onInstallable: (show: boolean) => void, onOffline: () => void, notify: (m: string, k?: string) => void}} hooks
 * @returns {{promptInstall: () => Promise<void>}}
 */
export function setupPwa(hooks) {
  const noop = { promptInstall: async () => {} };
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return noop;

  /** @type {any} */
  let deferredPrompt = null;

  // 1. Enregistrement du service worker (uniquement en http/https).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const register = () => {
      navigator.serviceWorker
        // Le chemin est résolu à partir de la racine du scope de la page :
        // `sw.js` vit à côté d'`index.html`. On évite `import.meta.url` car,
        // dans la version en fichier unique, il ne pointe pas vers un vrai
        // fichier, mais ce cas est déjà écarté par `file://` plus haut.
        .register('./sw.js', { scope: './' })
        .then((registration) => {
          // Une nouvelle version disponible ? On l'active dès qu'elle est prête.
          registration.addEventListener('updatefound', () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                hooks.notify?.(
                  'Une nouvelle version est prête. Elle sera active au prochain lancement.',
                  'info',
                );
              }
            });
          });
        })
        .catch(() => {
          /* l'application reste utilisable sans mode hors ligne */
        });
    };
    // `setupPwa` est appelé après quelques `await` : le chargement de la page
    // peut être déjà terminé, auquel cas l'écouteur « load » ne se déclenche
    // jamais. On enregistre donc immédiatement dans ce cas.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }

  // 2. Invite d'installation (Chrome, Edge, navigateurs Chromium).
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    hooks.onInstallable?.(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hooks.onInstallable?.(false);
    hooks.notify?.('Application installée. Vous la retrouverez avec vos autres logiciels.', 'succes');
  });

  return {
    async promptInstall() {
      if (!deferredPrompt) {
        hooks.notify?.(
          "L'installation n'est pas proposée ici. Sur ordinateur, utilisez le menu du navigateur " +
            '(icône d’installation dans la barre d’adresse, ou « Installer cette application »). ' +
            'Sur iPhone/iPad : Partager ▸ Sur l’écran d’accueil.',
          'info',
        );
        return;
      }
      const prompt = deferredPrompt;
      deferredPrompt = null;
      hooks.onInstallable?.(false);
      try {
        prompt.prompt();
        await prompt.userChoice;
      } catch {
        /* l'utilisateur a fermé l'invite */
      }
    },
  };
}

/**
 * Indique si l'application tourne en mode installé (fenêtre autonome).
 * @returns {boolean}
 */
export function isInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // Safari iOS
    /** @type {any} */ (window.navigator).standalone === true
  );
}
