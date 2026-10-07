/*
 * Jeu d'icônes d'ELITE MATHÉMATIQUE : tracés au trait (24 × 24), couleur héritée du texte.
 * EM.icon('livre') -> '<svg …>…</svg>'
 */
(function (root) {
  'use strict';
  var EM = root.EM = root.EM || {};

  var P = {
    accueil: '<path d="M3.5 10.5 12 4l8.5 6.5"/><path d="M5.5 9v10.5h4.5v-6h4v6h4.5V9"/>',
    livre: '<path d="M4 5.5c2.6-1.3 5.3-1.3 8 0v14c-2.7-1.3-5.4-1.3-8 0z"/><path d="M12 5.5c2.7-1.3 5.4-1.3 8 0v14c-2.6-1.3-5.3-1.3-8 0"/>',
    programme: '<path d="m12 3.5 8.5 4.25L12 12 3.5 7.75z"/><path d="m3.5 12 8.5 4.25L20.5 12"/><path d="m3.5 16.25 8.5 4.25 8.5-4.25"/>',
    infini: '<path d="M12 12c-1.8-2.4-3.3-3.6-5-3.6a3.6 3.6 0 0 0 0 7.2c1.7 0 3.2-1.2 5-3.6zm0 0c1.8 2.4 3.3 3.6 5 3.6a3.6 3.6 0 0 0 0-7.2c-1.7 0-3.2 1.2-5 3.6z"/>',
    cible: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
    boussole: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    carte: '<path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    curseurs: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    copie: '<path d="M6.5 3.5h8l3.5 3.5v13.5h-11.5z"/><path d="M14.5 3.5V7H18"/><path d="m9 14 2 2 4-4.5"/>',
    cartes: '<rect x="3.5" y="7.5" width="13" height="12" rx="2"/><path d="M7.5 7.5V5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2h-2"/>',
    fiole: '<path d="M9.5 3.5h5M10.5 3.5v5.5l-5.2 8.6A1.9 1.9 0 0 0 7 20.5h10a1.9 1.9 0 0 0 1.7-2.9L13.5 9V3.5"/><path d="M7.5 15h9"/>',
    tableau: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M12 15.5v4M8.5 19.5h7"/><path d="m7 12 3-3 2.5 2 4-4"/>',
    trophee: '<path d="M7.5 4.5h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6.5h-3a3 3 0 0 0 3 4M16.5 6.5h3a3 3 0 0 1-3 4"/><path d="M12 14v3.5M8.5 20h7l-1-2.5h-5z"/>',
    colonnes: '<path d="M3.5 9 12 4.5 20.5 9z"/><path d="M5.5 9v8M9.8 9v8M14.2 9v8M18.5 9v8"/><path d="M3.5 20h17M4.5 17h15"/>',
    memento: '<path d="M6.5 3.5h11v17l-5.5-3.5-5.5 3.5z"/><path d="M9.5 8h5M9.5 11h5"/>',
    chrono: '<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3.5h4M18.5 7.5l1.2-1.2"/>',
    recherche: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
    lune: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
    soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    plus: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    fermer: '<path d="m6 6 12 12M18 6 6 18"/>',
    droite: '<path d="m9 5 7 7-7 7"/>',
    gauche: '<path d="m15 5-7 7 7 7"/>',
    bas: '<path d="m5 9 7 7 7-7"/>',
    fleche: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    valide: '<path d="m4.5 12.5 5 5 10-11"/>',
    croix: '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
    ampoule: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.5a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2v1h5v-1c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3.5z"/>',
    oeil: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    partager: '<circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="m8.2 10.8 7-3.6M8.2 13.2l7 3.6"/>',
    imprimer: '<path d="M6.5 9V3.5h11V9"/><rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M6.5 14h11v6.5h-11z"/>',
    telecharger: '<path d="M12 3.5v12M7 10.5l5 5 5-5"/><path d="M4.5 20.5h15"/>',
    televerser: '<path d="M12 15.5v-12M7 8.5l5-5 5 5"/><path d="M4.5 20.5h15"/>',
    flamme: '<path d="M12 20.5a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-9-1.5 1.5-2 3-2 4.5-1-1-1.5-2-1.5-3.5-2.5 2-5 5-5 8a6 6 0 0 0 6 6z"/>',
    etoile: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
    medaille: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 10 6 3.5h4l2 4.5 2-4.5h4L15.5 10"/><path d="m12 12 .9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
    pouls: '<path d="M3 12h4l2.5-6 4 12 2.5-6h5"/>',
    rafraichir: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    telephone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    courrier: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 6.5 8 6.5 8-6.5"/>',
    copier: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    courbe: '<path d="M3.5 3.5v17h17"/><path d="M6.5 16c2.5-9 5.5-10 8-4s4 3 5-2"/>',
    calculatrice: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6.5h8v3H8z"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
    sigma: '<path d="M17.5 5.5V4H6.5l6 8-6 8h11v-1.5"/>',
    parabole: '<path d="M3.5 20.5h17M12 3.5v17"/><path d="M5 5c2 9 5 11 7 11s5-2 7-11"/>',
    systeme: '<path d="M7.5 4c-2 0-2 1.5-2 4s-1.5 4-2 4c.5 0 2 1.5 2 4s0 4 2 4"/><path d="M10 8.5h10M10 15.5h10"/>',
    diese: '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4.5 9h16M3.5 15h16"/>',
    barres: '<path d="M3.5 20.5h17"/><path d="M6.5 20.5v-6M11 20.5V8M15.5 20.5v-9M20 20.5V5"/>',
    de: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
    orbite: '<circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)"/>',
    cercle: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12 18 6M12 12h8.5"/>',
    regle: '<rect x="2.5" y="7.5" width="19" height="9" rx="1.5"/><path d="M6.5 7.5v4M10 7.5v2.5M13.5 7.5v4M17 7.5v2.5"/>',
    utilisateur: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    ecole: '<path d="m2.5 9 9.5-5 9.5 5-9.5 5z"/><path d="M6.5 11v5c3 2.5 8 2.5 11 0v-5M21.5 9v5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
    coeur: '<path d="M12 19.5s-7.5-4.5-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.5-7.5 10-7.5 10z"/>',
    horloge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    lecture: '<path d="M7 4.5v15l12-7.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.5h.01"/>',
    attention: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
    crayon: '<path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 3L8 18.5z"/><path d="m13.5 7 3 3"/>',
    lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };

  /** Icône SVG ; opts : { taille (px), titre (texte accessible), classe } */
  EM.icon = function (nom, opts) {
    opts = opts || {};
    var d = P[nom] || P.info;
    var t = opts.taille ? ' width="' + opts.taille + '" height="' + opts.taille + '"' : '';
    var a11y = opts.titre ? ' role="img" aria-label="' + String(opts.titre).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true"';
    return '<svg class="ico' + (opts.classe ? ' ' + opts.classe : '') + '" viewBox="0 0 24 24"' + t + a11y +
      ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  };
  EM.icon.noms = Object.keys(P);
})(typeof window !== 'undefined' ? window : globalThis);
