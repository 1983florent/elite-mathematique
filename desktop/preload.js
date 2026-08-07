/**
 * Script de préchargement (isolation du contexte).
 *
 * L'application n'a besoin d'aucun pont vers Node : tout son traitement est
 * du JavaScript de navigateur standard. Ce fichier existe pour rendre
 * l'intention explicite — surface d'exposition volontairement nulle — et
 * réserver un point d'extension sûr si un besoin futur l'exigeait.
 *
 * @module desktop/preload
 */

'use strict';

// Aucune API Node n'est exposée à la page : contextIsolation + preload vide
// = surface d'attaque minimale.
