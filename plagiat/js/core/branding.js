/**
 * Identité de la marque — **source unique**.
 *
 * Tout le nom, le sous-titre et les couleurs de l'application passent par ici :
 * changer le nom commercial ne demande qu'une seule modification, propagée
 * partout (interface, rapports, application de bureau, PWA).
 *
 * @module core/branding
 */

/** Configuration de marque. Modifiable en un seul endroit. */
export const BRAND = {
  /** Nom commercial affiché partout. */
  name: 'Veritex',
  /** Accroche courte, sous le nom. */
  tagline: {
    fr: "L'authenticité de vos écrits, prouvée.",
    en: 'The authenticity of your writing, proven.',
  },
  /** Éditeur (bas de page, métadonnées). Vide par défaut : renseignez le nom
   *  de votre société ici lors de la mise en ligne, ou laissez vide. */
  publisher: '',
  /** Domaine/URL public (à renseigner lors de la mise en ligne). */
  url: '',
  /** Adresse de support. */
  supportEmail: 'maths.florent@gmail.com',
  /** Couleurs de marque (reprises par le thème et les icônes). */
  colors: {
    primary: '#4f46e5',
    primaryDark: '#3730a3',
    accent: '#f59e0b',
    ink: '#0f1222',
  },
};

/**
 * Accroche dans une langue donnée, avec repli anglais puis français.
 * @param {string} lang
 * @returns {string}
 */
export function tagline(lang) {
  return BRAND.tagline[lang] || BRAND.tagline.en || BRAND.tagline.fr;
}
