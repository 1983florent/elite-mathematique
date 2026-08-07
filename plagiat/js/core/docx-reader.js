/**
 * Extraction de texte depuis un document Microsoft Word (.docx / .docm).
 *
 * L'analyse est **incrémentale** : `word/document.xml` est consommé sous forme
 * de flux et découpé en paragraphes au fil de l'eau, sans jamais construire
 * d'arbre DOM. Un mémoire de 1 000 pages passe donc sans difficulté là où
 * `DOMParser` saturerait la mémoire.
 *
 * Sont pris en charge : corps de texte, titres, listes, tableaux, zones de
 * texte, notes de bas de page et de fin, en-têtes/pieds de page, suivi des
 * modifications (le texte supprimé est ignoré, le texte inséré est conservé)
 * et métadonnées `docProps`.
 *
 * @module core/docx-reader
 */

import { ZipArchive, ZipError } from './zip-reader.js';

/** Erreur d'analyse d'un document Word. */
export class DocxError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DocxError';
  }
}

/**
 * @typedef {Object} DocxParagraph
 * @property {string} text    texte du paragraphe (déjà nettoyé)
 * @property {number} start   décalage du premier caractère dans le texte global
 * @property {number} end     décalage de fin (exclu)
 * @property {string} kind    `body` | `heading` | `list` | `table` | `note` | `header` | `footer`
 * @property {number} level   niveau de titre (0 si non applicable)
 * @property {string} part    partie d'origine (`document`, `footnotes`, …)
 */

/**
 * @typedef {Object} DocxDocument
 * @property {string} text
 * @property {DocxParagraph[]} paragraphs
 * @property {Object} meta
 * @property {Object} stats
 * @property {boolean} truncated
 */

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Décode les entités XML d'une chaîne.
 * @param {string} s
 * @returns {string}
 */
export function decodeXmlEntities(s) {
  if (s.indexOf('&') === -1) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    const value = ENTITIES[body];
    return value === undefined ? match : value;
  });
}

/**
 * Récupère la valeur d'un attribut dans le corps brut d'une balise.
 * @param {string} tagBody
 * @param {string} attr
 * @returns {string|null}
 */
function attr(tagBody, attr_) {
  const idx = tagBody.indexOf(attr_ + '=');
  if (idx === -1) return null;
  const quote = tagBody[idx + attr_.length + 1];
  if (quote !== '"' && quote !== "'") return null;
  const start = idx + attr_.length + 2;
  const end = tagBody.indexOf(quote, start);
  if (end === -1) return null;
  return decodeXmlEntities(tagBody.slice(start, end));
}

/**
 * Normalise le texte d'un paragraphe : espaces insécables, tabulations,
 * espaces multiples et césures automatiques.
 * @param {string} s
 * @returns {string}
 */
function tidy(s) {
  return s
    .replace(/\u00ad/g, '') // trait d'union conditionnel
    .replace(/[\t\f\r]+/g, ' ')
    .replace(/[\u00a0\u202f\u2009]/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

/**
 * Scanner XML incrémental spécialisé WordprocessingML.
 *
 * Émet un événement par paragraphe (`w:p`, `text:p` pour l'ODT) sans conserver
 * plus que le paragraphe courant en mémoire.
 */
export class WordScanner {
  /**
   * @param {(para: {text: string, kind: string, level: number}) => void} onParagraph
   * @param {{paragraphTags?: string[], textTags?: string[], skipTags?: string[], captureAll?: boolean}} [options]
   */
  constructor(onParagraph, options = {}) {
    this.onParagraph = onParagraph;
    this.paragraphTags = new Set(options.paragraphTags || ['w:p']);
    this.textTags = new Set(options.textTags || ['w:t']);
    this.skipTags = new Set(
      options.skipTags || ['w:delText', 'w:instrText', 'mc:Fallback'],
    );
    // `captureAll` capture toute donnée textuelle rencontrée dans un
    // paragraphe (format ODF), au lieu des seules balises de texte (OOXML).
    this.captureAll = options.captureAll === true;

    this.buf = '';
    /** @type {string[]} */
    this.chunks = [];
    this.inParagraph = false;
    this.captureDepth = 0; // > 0 lorsqu'on est dans une balise de texte
    this.skipDepth = 0; // > 0 lorsqu'on est dans une zone à ignorer
    this.tableDepth = 0;
    this.noteDepth = 0;
    this.level = 0;
    this.kind = 'body';
    this.pendingSeparator = '';
  }

  /** Vrai lorsque les données textuelles courantes doivent être conservées. */
  get capturing() {
    if (this.skipDepth > 0) return false;
    return this.captureDepth > 0 || (this.captureAll && this.inParagraph);
  }

  /**
   * Fournit un nouveau fragment de XML.
   * @param {string} str
   */
  write(str) {
    this.buf += str;
    this.#process(false);
  }

  /** Signale la fin du flux et vide les tampons. */
  end() {
    this.#process(true);
    if (this.inParagraph) this.#flushParagraph();
    this.buf = '';
  }

  #flushParagraph() {
    const raw = this.chunks.join('');
    this.chunks.length = 0;
    this.inParagraph = false;
    const text = tidy(raw);
    const level = this.level;
    let kind = this.kind;
    if (this.tableDepth > 0) kind = 'table';
    this.level = 0;
    this.kind = 'body';
    if (text) this.onParagraph({ text, kind, level });
  }

  /**
   * @param {string} name
   * @param {string} body
   * @param {boolean} selfClosing
   */
  #openTag(name, body, selfClosing) {
    if (this.skipTags.has(name)) {
      if (!selfClosing) this.skipDepth++;
      return;
    }
    if (this.skipDepth > 0) return;

    if (this.paragraphTags.has(name)) {
      if (this.inParagraph) this.#flushParagraph();
      this.inParagraph = true;
      this.chunks.length = 0;
      this.level = 0;
      this.kind = this.noteDepth > 0 ? 'note' : 'body';
      if (selfClosing) this.#flushParagraph();
      return;
    }

    if (this.textTags.has(name)) {
      if (!selfClosing) this.captureDepth++;
      return;
    }

    switch (name) {
      case 'w:tbl':
        this.tableDepth++;
        break;
      case 'w:tc':
      case 'w:tab':
        // Sépare les cellules et tabulations par une espace explicite.
        if (this.inParagraph) this.chunks.push(' ');
        break;
      case 'w:br':
      case 'w:cr':
        if (this.inParagraph) this.chunks.push('\n');
        break;
      case 'w:pStyle': {
        const val = attr(body, 'w:val') || '';
        const heading = /^(?:Heading|Titre|Ttulo|berschrift)(\d+)$/i.exec(
          val.replace(/[^A-Za-z0-9]/g, ''),
        );
        if (heading) {
          this.kind = 'heading';
          this.level = Math.min(9, parseInt(heading[1], 10) || 1);
        } else if (/^(?:ListParagraph|Paragraphedeliste)$/i.test(
            val.replace(/[^A-Za-z0-9]/g, ''))) {
          this.kind = 'list';
        } else if (/quote|citation/i.test(val)) {
          this.kind = 'quote';
        }
        break;
      }
      case 'w:numPr':
        if (this.kind === 'body') this.kind = 'list';
        break;
      case 'w:footnote':
      case 'w:endnote':
        this.noteDepth++;
        break;
      default:
        break;
    }
  }

  /** @param {string} name */
  #closeTag(name) {
    if (this.skipTags.has(name)) {
      if (this.skipDepth > 0) this.skipDepth--;
      return;
    }
    if (this.skipDepth > 0) return;

    if (this.paragraphTags.has(name)) {
      if (this.inParagraph) this.#flushParagraph();
      return;
    }
    if (this.textTags.has(name)) {
      if (this.captureDepth > 0) this.captureDepth--;
      return;
    }
    if (name === 'w:tbl' && this.tableDepth > 0) this.tableDepth--;
    if ((name === 'w:footnote' || name === 'w:endnote') && this.noteDepth > 0) {
      this.noteDepth--;
    }
  }

  /**
   * Consomme le tampon courant.
   * @param {boolean} isFinal
   */
  #process(isFinal) {
    const buf = this.buf;
    let pos = 0;
    const len = buf.length;

    while (pos < len) {
      const lt = buf.indexOf('<', pos);
      if (lt === -1) {
        // Tant que le flux continue, on conserve le texte final dans le tampon :
        // une entité (`&#233;`) peut être coupée entre deux fragments.
        if (!isFinal) break;
        if (this.capturing) {
          this.chunks.push(decodeXmlEntities(buf.slice(pos)));
        }
        pos = len;
        break;
      }

      if (lt > pos && this.capturing) {
        this.chunks.push(decodeXmlEntities(buf.slice(pos, lt)));
      }
      // Le texte qui précède la balise est consommé : si la balise est
      // incomplète, seul le fragment `<…` restera dans le tampon.
      pos = lt;

      // Commentaires, CDATA et instructions de traitement.
      if (buf.startsWith('<!--', lt)) {
        const end = buf.indexOf('-->', lt + 4);
        if (end === -1) {
          if (!isFinal) break;
          pos = len;
          break;
        }
        pos = end + 3;
        continue;
      }
      if (buf.startsWith('<![CDATA[', lt)) {
        const end = buf.indexOf(']]>', lt + 9);
        if (end === -1) {
          if (!isFinal) break;
          pos = len;
          break;
        }
        if (this.capturing) {
          this.chunks.push(buf.slice(lt + 9, end));
        }
        pos = end + 3;
        continue;
      }

      // Recherche du '>' fermant en respectant les valeurs d'attributs.
      let gt = -1;
      let quote = '';
      for (let i = lt + 1; i < len; i++) {
        const c = buf[i];
        if (quote) {
          if (c === quote) quote = '';
        } else if (c === '"' || c === "'") {
          quote = c;
        } else if (c === '>') {
          gt = i;
          break;
        }
      }
      if (gt === -1) {
        if (!isFinal) break; // balise à cheval sur deux fragments
        pos = len;
        break;
      }

      const inner = buf.slice(lt + 1, gt);
      if (inner[0] === '?' || inner[0] === '!') {
        pos = gt + 1;
        continue;
      }

      const isClosing = inner[0] === '/';
      const selfClosing = inner.endsWith('/');
      const body = isClosing ? inner.slice(1) : inner;
      let nameEnd = 0;
      while (
        nameEnd < body.length &&
        !' \t\n\r/'.includes(body[nameEnd])
      ) {
        nameEnd++;
      }
      const name = body.slice(0, nameEnd);

      if (isClosing) this.#closeTag(name);
      else this.#openTag(name, body, selfClosing);

      pos = gt + 1;
    }

    this.buf = pos >= len ? '' : buf.slice(pos);
  }
}

/**
 * Lit une partie XML sous forme de flux et alimente le scanner.
 * @param {ZipArchive} zip
 * @param {string} partName
 * @param {WordScanner} scanner
 */
async function feedPart(zip, partName, scanner) {
  const stream = await zip.stream(partName);
  const reader = stream.pipeThrough(new TextDecoderStream('utf-8')).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    scanner.write(value);
  }
}

/**
 * Localise les parties du document via `[Content_Types].xml`.
 * @param {ZipArchive} zip
 */
async function locateParts(zip) {
  /** @type {{main: string|null, footnotes: string[], endnotes: string[], headers: string[], footers: string[]}} */
  const parts = {
    main: null,
    footnotes: [],
    endnotes: [],
    headers: [],
    footers: [],
  };

  let ct = '';
  try {
    ct = await zip.readText('[Content_Types].xml');
  } catch {
    ct = '';
  }

  const overrideRe = /<Override\b[^>]*>/g;
  let m;
  while ((m = overrideRe.exec(ct))) {
    const tag = m[0];
    const partName = (attr(tag, 'PartName') || '').replace(/^\//, '');
    const type = attr(tag, 'ContentType') || '';
    if (!partName || !zip.has(partName)) continue;
    if (/wordprocessingml\..*main\+xml/.test(type)) parts.main = partName;
    else if (/wordprocessingml\.footnotes\+xml/.test(type)) parts.footnotes.push(partName);
    else if (/wordprocessingml\.endnotes\+xml/.test(type)) parts.endnotes.push(partName);
    else if (/wordprocessingml\.header\+xml/.test(type)) parts.headers.push(partName);
    else if (/wordprocessingml\.footer\+xml/.test(type)) parts.footers.push(partName);
  }

  // Repli sur les noms conventionnels si [Content_Types].xml est absent.
  if (!parts.main) {
    for (const candidate of ['word/document.xml', 'word/document2.xml']) {
      if (zip.has(candidate)) {
        parts.main = candidate;
        break;
      }
    }
  }
  if (!parts.main) {
    const guess = zip.list().find((n) => /^word\/document\d*\.xml$/i.test(n));
    if (guess) parts.main = guess;
  }
  if (!parts.footnotes.length && zip.has('word/footnotes.xml')) {
    parts.footnotes.push('word/footnotes.xml');
  }
  if (!parts.endnotes.length && zip.has('word/endnotes.xml')) {
    parts.endnotes.push('word/endnotes.xml');
  }
  return parts;
}

/**
 * Extrait les métadonnées `docProps/core.xml` et `docProps/app.xml`.
 * @param {ZipArchive} zip
 */
async function readMetadata(zip) {
  const meta = {
    title: '',
    subject: '',
    creator: '',
    lastModifiedBy: '',
    created: '',
    modified: '',
    keywords: '',
    application: '',
    company: '',
    pages: 0,
    wordsDeclared: 0,
    charactersDeclared: 0,
  };

  /** @param {string} xml @param {string} tag */
  const pick = (xml, tag) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const m = re.exec(xml);
    return m ? decodeXmlEntities(m[1]).trim() : '';
  };

  try {
    const core = await zip.readText('docProps/core.xml');
    meta.title = pick(core, 'dc:title');
    meta.subject = pick(core, 'dc:subject');
    meta.creator = pick(core, 'dc:creator');
    meta.lastModifiedBy = pick(core, 'cp:lastModifiedBy');
    meta.created = pick(core, 'dcterms:created');
    meta.modified = pick(core, 'dcterms:modified');
    meta.keywords = pick(core, 'cp:keywords');
  } catch {
    /* métadonnées facultatives */
  }

  try {
    const app = await zip.readText('docProps/app.xml');
    meta.application = pick(app, 'Application');
    meta.company = pick(app, 'Company');
    meta.pages = parseInt(pick(app, 'Pages'), 10) || 0;
    meta.wordsDeclared = parseInt(pick(app, 'Words'), 10) || 0;
    meta.charactersDeclared = parseInt(pick(app, 'Characters'), 10) || 0;
  } catch {
    /* métadonnées facultatives */
  }

  return meta;
}

const DEFAULT_OPTIONS = {
  includeNotes: true,
  includeHeadersFooters: false,
  includeTables: true,
  maxChars: 40_000_000,
};

/**
 * Lit un document Word et renvoie son texte structuré.
 *
 * @param {Blob|File} file
 * @param {Partial<typeof DEFAULT_OPTIONS>} [options]
 * @returns {Promise<DocxDocument>}
 */
export async function readDocx(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Détection des formats voisins pour un message d'erreur explicite.
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0) {
    throw new DocxError(
      "Ce fichier est un document Word 97-2003 (.doc). Enregistrez-le au format .docx depuis Word (Fichier ▸ Enregistrer sous ▸ Document Word) puis relancez l'analyse.",
    );
  }
  if (!(head[0] === 0x50 && head[1] === 0x4b)) {
    throw new DocxError(
      "Format non reconnu : un fichier .docx est attendu (archive ZIP contenant word/document.xml).",
    );
  }

  let zip;
  try {
    zip = await ZipArchive.open(file);
  } catch (err) {
    if (err instanceof ZipError) throw new DocxError(err.message);
    throw err;
  }

  const parts = await locateParts(zip);
  if (!parts.main) {
    throw new DocxError(
      "Archive ZIP valide mais sans partie principale WordprocessingML : ce n'est pas un document Word.",
    );
  }

  const meta = await readMetadata(zip);

  /** @type {DocxParagraph[]} */
  const paragraphs = [];
  /** @type {string[]} */
  const pieces = [];
  let offset = 0;
  let truncated = false;

  /** @param {string} partLabel */
  const makeSink = (partLabel) => (para) => {
    if (truncated) return;
    if (!opts.includeTables && para.kind === 'table') return;
    const text = para.text;
    if (offset + text.length > opts.maxChars) {
      truncated = true;
      return;
    }
    paragraphs.push({
      text,
      start: offset,
      end: offset + text.length,
      kind: para.kind,
      level: para.level,
      part: partLabel,
    });
    pieces.push(text);
    offset += text.length + 1; // séparateur '\n' ajouté au join
  };

  await feedPartWith(zip, parts.main, makeSink('document'));

  if (opts.includeNotes) {
    for (const p of parts.footnotes) await feedPartWith(zip, p, makeSink('footnotes'));
    for (const p of parts.endnotes) await feedPartWith(zip, p, makeSink('endnotes'));
  }
  if (opts.includeHeadersFooters) {
    for (const p of parts.headers) await feedPartWith(zip, p, makeSink('headers'));
    for (const p of parts.footers) await feedPartWith(zip, p, makeSink('footers'));
  }

  const text = pieces.join('\n');
  const words = countWords(text);

  return {
    text,
    paragraphs,
    meta,
    truncated,
    stats: {
      characters: text.length,
      words,
      paragraphs: paragraphs.length,
      // Word déclare parfois le nombre de pages : sinon on estime à 300 mots/page.
      pages: meta.pages || Math.max(1, Math.round(words / 300)),
      pagesEstimated: !meta.pages,
      parts: {
        main: parts.main,
        footnotes: parts.footnotes.length,
        endnotes: parts.endnotes.length,
        headers: parts.headers.length,
        footers: parts.footers.length,
      },
    },
  };
}

/**
 * Alimente un scanner Word sur une partie donnée.
 * @param {ZipArchive} zip
 * @param {string} partName
 * @param {(p: {text: string, kind: string, level: number}) => void} sink
 */
async function feedPartWith(zip, partName, sink) {
  const scanner = new WordScanner(sink);
  await feedPart(zip, partName, scanner);
  scanner.end();
}

/**
 * Compte les mots d'une chaîne (lettres, chiffres, apostrophes, traits d'union).
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const m = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

/**
 * Lit un document OpenDocument (.odt) — utile pour le corpus de référence.
 * @param {Blob|File} file
 * @returns {Promise<{text: string, paragraphs: DocxParagraph[]}>}
 */
export async function readOdt(file) {
  const zip = await ZipArchive.open(file);
  if (!zip.has('content.xml')) {
    throw new DocxError("Archive ODF sans content.xml.");
  }
  /** @type {DocxParagraph[]} */
  const paragraphs = [];
  const pieces = [];
  let offset = 0;
  const scanner = new WordScanner(
    (para) => {
      paragraphs.push({
        text: para.text,
        start: offset,
        end: offset + para.text.length,
        kind: 'body',
        level: 0,
        part: 'content',
      });
      pieces.push(para.text);
      offset += para.text.length + 1;
    },
    {
      paragraphTags: ['text:p', 'text:h'],
      textTags: [],
      captureAll: true,
      skipTags: ['office:annotation', 'office:binary-data'],
    },
  );
  await feedPart(zip, 'content.xml', scanner);
  scanner.end();
  return { text: pieces.join('\n'), paragraphs };
}
