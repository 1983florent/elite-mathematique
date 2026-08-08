/**
 * Mur d'accès (paywall) : la modale qui présente les offres, ouvre la page de
 * paiement du prestataire et permet d'activer un code d'accès.
 *
 * L'interface est traduite via i18n et la marque via `branding`. Aucune donnée
 * de paiement ne transite ici : on redirige vers la page sécurisée du
 * prestataire, et l'activation se fait par un code signé vérifié localement.
 *
 * @module ui/paywall
 */

import { el, clear, notify } from './dom.js';
import { t } from '../core/i18n.js';
import { BRAND } from '../core/branding.js';
import {
  LICENSE_CONFIG,
  getEntitlement,
  redeemCode,
  checkoutUrl,
  configuredProviders,
  createBackendCheckout,
} from '../core/license.js';

const PROVIDER_LABEL = {
  stripe: 'Carte bancaire',
  paypal: 'PayPal',
  mobileMoney: 'Mobile Money (Wave, Orange…)',
};

/**
 * Affiche le mur d'accès.
 * @param {{onUnlocked?: () => void}} [hooks]
 * @returns {Promise<void>}
 */
export async function showPaywall(hooks = {}) {
  const entitlement = await getEntitlement();

  const overlay = el('div', { class: 'modale', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('paywall.title', { app: BRAND.name }) });
  const close = () => overlay.remove();

  const features = [
    'paywall.feature.unlimited',
    'paywall.feature.forensic',
    'paywall.feature.ai',
    'paywall.feature.certificate',
    'paywall.feature.support',
  ].map((k) => el('li', {}, t(k)));

  const plans = el('div', { class: 'offres' },
    LICENSE_CONFIG.plans.map((plan) =>
      el('div', { class: `offre${plan.highlight ? ' offre--vedette' : ''}` }, [
        plan.highlight ? el('span', { class: 'offre__ruban' }, '★') : null,
        el('div', { class: 'offre__prix' }, [
          el('strong', {}, plan.priceLabel),
          el('span', { class: 'discret' }, ' ' + t(plan.periodKey)),
        ]),
        el('button', {
          type: 'button',
          class: 'bouton bouton--primaire',
          onclick: () => startCheckout(plan.id),
        }, t('paywall.subscribe')),
      ]),
    ),
  );

  // Boutons prestataires (si configurés).
  const providers = configuredProviders();
  const providerRow = providers.length
    ? el('div', { class: 'prestataires' }, providers.map((p) =>
        el('button', {
          type: 'button',
          class: 'bouton bouton--discret',
          onclick: () => {
            const url = checkoutUrl(p, LICENSE_CONFIG.plans[0].id);
            if (url) window.open(url, '_blank', 'noopener');
          },
        }, PROVIDER_LABEL[p] || p)))
    : null;

  const codeInput = el('input', {
    type: 'text',
    placeholder: t('paywall.codePlaceholder'),
    autocomplete: 'off',
    spellcheck: false,
    class: 'code-input',
  });

  const redeem = el('button', {
    type: 'button',
    class: 'bouton bouton--primaire',
    onclick: async () => {
      const code = codeInput.value.trim();
      if (!code) return;
      redeem.disabled = true;
      const r = await redeemCode(code);
      redeem.disabled = false;
      if (r.ok) {
        notify(t('paywall.codeAccepted'), 'succes');
        close();
        hooks.onUnlocked?.();
      } else {
        notify(`${t('paywall.invalidCode')} ${r.error || ''}`, 'erreur');
      }
    },
  }, t('paywall.redeem'));

  /** Lance le paiement pour une offre. */
  async function startCheckout(planId) {
    // 1) Backend sécurisé : crée une session de paiement (clé secrète côté
    //    serveur). Redirige dans le même onglet pour revenir avec le code.
    const backendUrl = await createBackendCheckout(planId);
    if (backendUrl) {
      window.location.href = backendUrl;
      return;
    }
    // 2) Repli : lien de paiement statique (Stripe/Mobile Money/PayPal).
    for (const p of ['stripe', 'mobileMoney', 'paypal']) {
      const url = checkoutUrl(p, planId);
      if (url) {
        window.open(url, '_blank', 'noopener');
        return;
      }
    }
    // 3) Rien de configuré : on invite à utiliser un code d'accès.
    notify(
      'Le paiement en ligne n’est pas encore configuré. Utilisez un code d’accès, ou contactez ' +
        LICENSE_CONFIG.supportEmail + '.',
      'info',
      9000,
    );
  }

  const trialLine =
    entitlement.status === 'trial'
      ? el('p', { class: 'discret' }, t('paywall.trialLeft', { n: entitlement.trialLeft }))
      : entitlement.status === 'expired'
        ? el('p', { class: 'alerte alerte--attention' }, 'Votre abonnement a expiré.')
        : null;

  // Moyens de paiement affichés explicitement.
  const paiements = el('div', { class: 'paywall__paiements' }, [
    el('span', { class: 'discret' }, t('paywall.methods')),
    el('div', { class: 'paywall__moyens' },
      ['Wave', 'Orange Money', 'Moov Money', 'MTN MoMo', 'Carte bancaire'].map((m) =>
        el('span', { class: 'moyen' }, m)),
    ),
  ]);

  const card = el('div', { class: 'modale__carte paywall' }, [
    el('button', { type: 'button', class: 'modale__fermer', 'aria-label': t('action.close'), onclick: close }, '×'),
    el('span', { class: 'etiquette-premium' }, t('paywall.badge')),
    el('h2', {}, t('paywall.title', { app: BRAND.name })),
    el('p', { class: 'paywall__soustitre' }, t('paywall.subtitle')),
    el('ul', { class: 'paywall__atouts' }, features),
    plans,
    paiements,
    providerRow,
    el('div', { class: 'paywall__code' }, [
      el('label', { class: 'discret' }, t('paywall.haveCode')),
      el('div', { class: 'paywall__code-ligne' }, [codeInput, redeem]),
    ]),
    trialLine,
    el('p', { class: 'discret paywall__securite' }, t('paywall.securityNote')),
    el('div', { class: 'paywall__pied' }, [
      el('button', { type: 'button', class: 'bouton bouton--discret', onclick: close }, t('paywall.later')),
    ]),
  ]);

  overlay.append(card);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.body.append(overlay);
  // Focus pour l'accessibilité.
  setTimeout(() => codeInput.focus(), 50);
}

/**
 * Met à jour un élément d'en-tête indiquant l'état de l'abonnement.
 * @param {HTMLElement} node
 */
export async function renderEntitlementBadge(node) {
  if (!node) return;
  const e = await getEntitlement();
  clear(node);
  if (e.status === 'active') {
    node.append(el('span', { class: 'etiquette etiquette--succes' }, t('paywall.active')));
  } else if (e.status === 'trial') {
    node.append(el('span', { class: 'etiquette etiquette--neutre' }, t('paywall.trialLeft', { n: e.trialLeft })));
  } else {
    node.append(
      el('button', { type: 'button', class: 'bouton bouton--premium', onclick: () => showPaywall() }, '✦ ' + t('paywall.badge')),
    );
  }
}
