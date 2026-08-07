/**
 * Analyse forensique : détection des procédés de camouflage employés pour
 * tromper les détecteurs de plagiat.
 *
 * Trois familles de fraude sont recherchées :
 *   • les **homoglyphes** — lettres cyrilliques ou grecques visuellement
 *     identiques aux latines (« а » cyrillique dans « analyse ») qui cassent
 *     la correspondance mot à mot ;
 *   • les **caractères invisibles** — espaces de largeur nulle, gluons,
 *     marques directionnelles insérés au milieu des mots ;
 *   • le **texte dissimulé** dans le .docx lui-même — texte blanc, masqué
 *     (`w:vanish`) ou en corps minuscule, détecté par le lecteur de document
 *     et transmis ici pour synthèse.
 *
 * @module core/forensics
 */

/** Homoglyphes fréquents → équivalent latin. */
export const HOMOGLYPHS = new Map([
  // Cyrillique minuscule
  ['а', 'a'], ['е', 'e'], ['о', 'o'], ['р', 'p'],
  ['с', 'c'], ['у', 'y'], ['х', 'x'], ['і', 'i'],
  ['ѕ', 's'], ['ј', 'j'], ['һ', 'h'], ['ԁ', 'd'],
  ['ԛ', 'q'], ['ԝ', 'w'],
  // Cyrillique majuscule
  ['А', 'A'], ['В', 'B'], ['Е', 'E'], ['К', 'K'],
  ['М', 'M'], ['Н', 'H'], ['О', 'O'], ['Р', 'P'],
  ['С', 'C'], ['Т', 'T'], ['Х', 'X'], ['У', 'Y'],
  ['І', 'I'], ['Ѕ', 'S'], ['Ј', 'J'],
  // Grec
  ['ο', 'o'], ['α', 'a'], ['ν', 'v'], ['ρ', 'p'],
  ['υ', 'u'], ['ι', 'i'], ['κ', 'k'], ['Ο', 'O'],
  ['Α', 'A'], ['Β', 'B'], ['Ε', 'E'], ['Ζ', 'Z'],
  ['Η', 'H'], ['Ι', 'I'], ['Κ', 'K'], ['Μ', 'M'],
  ['Ν', 'N'], ['Ρ', 'P'], ['Τ', 'T'], ['Υ', 'Y'],
  ['Χ', 'X'],
]);

/** Caractères invisibles suspects → libellé lisible. */
const INVISIBLES = new Map([
  ['\u200b', 'espace de largeur nulle'],
  ['\u200c', 'antiliant de largeur nulle'],
  ['\u200d', 'liant de largeur nulle'],
  ['\u2060', 'gluon de mots'],
  ['\ufeff', 'marque d\u2019ordre des octets'],
  ['\u00ad', 'trait d\u2019union conditionnel'],
  ['\u034f', 'liant de graph\u00e8mes'],
  ['\u180e', 's\u00e9parateur de voyelles mongol'],
]);

const BIDI_RE = /[\u202a-\u202e\u2066-\u2069]/g;
const LATIN_RE = /[A-Za-z\u00c0-\u024f]/;
const CYRILLIC_RE = /[\u0400-\u04ff]/;
const GREEK_RE = /[\u0370-\u03ff]/;
const WORD_RE = /[\p{L}][\p{L}’'-]*/gu;

/**
 * @typedef {Object} ForensicReport
 * @property {{word: string, index: number, cleaned: string}[]} mixedWords
 * @property {number} homoglyphCount
 * @property {{char: string, label: string, count: number}[]} invisibles
 * @property {number} invisibleCount
 * @property {number} bidiCount
 * @property {{type: string, text: string, part?: string}[]} hiddenRuns
 * @property {'aucun'|'indice'|'alerte'} severity
 * @property {string[]} findings  synthèse lisible de chaque constat
 */

/**
 * Balaye un texte à la recherche de procédés de camouflage.
 *
 * @param {string} text
 * @param {{hiddenRuns?: {type: string, text: string, part?: string}[]}} [extras]
 *        éléments relevés par le lecteur .docx (texte blanc, masqué, minuscule)
 * @returns {ForensicReport}
 */
export function scanForensics(text, extras = {}) {
  /** @type {{word: string, index: number, cleaned: string}[]} */
  const mixedWords = [];
  let homoglyphCount = 0;

  WORD_RE.lastIndex = 0;
  let m;
  while ((m = WORD_RE.exec(text)) !== null) {
    const word = m[0];
    const latin = LATIN_RE.test(word);
    const other = CYRILLIC_RE.test(word) || GREEK_RE.test(word);
    if (!(latin && other)) continue;
    let cleaned = '';
    for (const ch of word) {
      if (HOMOGLYPHS.has(ch)) {
        homoglyphCount++;
        cleaned += HOMOGLYPHS.get(ch);
      } else {
        cleaned += ch;
      }
    }
    if (mixedWords.length < 80) {
      mixedWords.push({ word, index: m.index, cleaned });
    }
  }

  /** @type {Map<string, number>} */
  const invisibleCounts = new Map();
  for (const ch of text) {
    if (INVISIBLES.has(ch)) {
      invisibleCounts.set(ch, (invisibleCounts.get(ch) || 0) + 1);
    }
  }
  const invisibles = [...invisibleCounts.entries()].map(([char, count]) => ({
    char,
    label: INVISIBLES.get(char),
    count,
  }));
  const invisibleCount = invisibles.reduce((s, e) => s + e.count, 0);
  const bidiCount = (text.match(BIDI_RE) || []).length;

  const hiddenRuns = (extras.hiddenRuns || []).filter(
    (r) => r.text && r.text.trim().length > 0,
  );

  /** @type {string[]} */
  const findings = [];
  if (mixedWords.length) {
    findings.push(
      `${mixedWords.length} mot(s) mêlant alphabets latin et cyrillique/grec — procédé classique pour tromper la comparaison (ex. « ${mixedWords[0].word} »).`,
    );
  }
  if (invisibleCount) {
    findings.push(
      `${invisibleCount} caractère(s) invisible(s) (${invisibles
        .map((e) => `${e.count} ${e.label}`)
        .join(', ')}) susceptibles de fragmenter les mots aux yeux d'un détecteur.`,
    );
  }
  if (bidiCount) {
    findings.push(
      `${bidiCount} marque(s) de direction d'écriture (bidi), inhabituelles dans un texte académique et capables d'inverser l'ordre apparent des caractères.`,
    );
  }
  const hiddenWords = hiddenRuns.reduce(
    (s, r) => s + (r.text.match(/[\p{L}\p{N}]+/gu) || []).length,
    0,
  );
  if (hiddenRuns.length) {
    const types = [...new Set(hiddenRuns.map((r) => r.type))];
    const labels = {
      masque: 'texte masqué (w:vanish)',
      blanc: 'texte écrit en blanc',
      minuscule: 'texte en corps quasi nul',
    };
    findings.push(
      `${hiddenWords} mot(s) dissimulé(s) dans le fichier Word : ${types
        .map((t) => labels[t] || t)
        .join(', ')}. Ce contenu est invisible à l'impression mais lu par les détecteurs — un procédé de bourrage bien connu.`,
    );
  }

  const severity =
    hiddenRuns.length || homoglyphCount >= 3 || bidiCount
      ? 'alerte'
      : findings.length
        ? 'indice'
        : 'aucun';

  return {
    mixedWords,
    homoglyphCount,
    invisibles,
    invisibleCount,
    bidiCount,
    hiddenRuns: hiddenRuns.slice(0, 100),
    severity,
    findings,
  };
}

/**
 * Restaure un texte camouflé : homoglyphes ramenés au latin, invisibles et
 * marques bidi retirés. Utile pour ré-analyser un document suspect.
 *
 * @param {string} text
 * @returns {string}
 */
export function decloakText(text) {
  let out = '';
  for (const ch of text) {
    if (INVISIBLES.has(ch)) continue;
    out += HOMOGLYPHS.get(ch) ?? ch;
  }
  return out.replace(BIDI_RE, '');
}
