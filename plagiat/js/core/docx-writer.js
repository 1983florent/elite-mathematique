/**
 * Génération d'un document Word (.docx) à partir de blocs simples.
 *
 * Sert à exporter le rapport de plagiat dans le format attendu par les
 * établissements : titres hiérarchisés, tableaux bordés, passages surlignés,
 * liens cliquables et pied de page numéroté.
 *
 * @module core/docx-writer
 */

import { createZip } from './zip-writer.js';
import { BRAND } from './branding.js';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Échappe le texte destiné à un nœud XML. */
export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Les caractères de contrôle sont interdits en XML 1.0.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
}

/**
 * @typedef {Object} Run
 * @property {string} text
 * @property {boolean} [bold]
 * @property {boolean} [italic]
 * @property {string} [color]      couleur du texte, ex. `C0392B`
 * @property {string} [shade]      fond du texte, ex. `FDE8E8`
 * @property {number} [size]       taille en points
 * @property {string} [href]       lien externe
 * @property {boolean} [breakAfter]
 */

/** Constructeur de document Word. */
export class DocxBuilder {
  /** @param {{title?: string, creator?: string, subject?: string}} [meta] */
  constructor(meta = {}) {
    this.meta = meta;
    /** @type {string[]} */
    this.body = [];
    /** @type {{id: string, target: string}[]} */
    this.links = [];
  }

  /** Enregistre un lien externe et renvoie son identifiant de relation. */
  #linkId(target) {
    const existing = this.links.find((l) => l.target === target);
    if (existing) return existing.id;
    const id = `rIdL${this.links.length + 1}`;
    this.links.push({ id, target });
    return id;
  }

  /**
   * Sérialise une suite de segments de texte.
   * @param {Run[]} runs
   */
  #runs(runs) {
    return runs
      .map((run) => {
        const props = [];
        if (run.bold) props.push('<w:b/>');
        if (run.italic) props.push('<w:i/>');
        if (run.color) props.push(`<w:color w:val="${run.color}"/>`);
        if (run.shade) {
          props.push(`<w:shd w:val="clear" w:color="auto" w:fill="${run.shade}"/>`);
        }
        if (run.size) {
          props.push(`<w:sz w:val="${run.size * 2}"/><w:szCs w:val="${run.size * 2}"/>`);
        }
        if (run.href) props.push('<w:rStyle w:val="Lien"/>');
        const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';

        // Les sauts de ligne internes deviennent des <w:br/>.
        const pieces = String(run.text ?? '').split('\n');
        const content = pieces
          .map(
            (piece, i) =>
              `${i > 0 ? '<w:br/>' : ''}<w:t xml:space="preserve">${escapeXml(piece)}</w:t>`,
          )
          .join('');
        const xml = `<w:r>${rPr}${content}</w:r>`;
        return run.href
          ? `<w:hyperlink r:id="${this.#linkId(run.href)}">${xml}</w:hyperlink>`
          : xml;
      })
      .join('');
  }

  /**
   * Ajoute un paragraphe.
   * @param {string|Run[]} content
   * @param {{style?: string, align?: 'left'|'center'|'right'|'both', spacingAfter?: number, shade?: string, indent?: number}} [options]
   */
  paragraph(content, options = {}) {
    const runs = typeof content === 'string' ? [{ text: content }] : content;
    const props = [];
    if (options.style) props.push(`<w:pStyle w:val="${options.style}"/>`);
    if (options.align) {
      const map = { left: 'left', center: 'center', right: 'right', both: 'both' };
      props.push(`<w:jc w:val="${map[options.align]}"/>`);
    }
    if (options.indent) props.push(`<w:ind w:left="${options.indent}"/>`);
    if (options.shade) {
      props.push(`<w:shd w:val="clear" w:color="auto" w:fill="${options.shade}"/>`);
    }
    props.push(`<w:spacing w:after="${options.spacingAfter ?? 120}"/>`);
    this.body.push(
      `<w:p><w:pPr>${props.join('')}</w:pPr>${this.#runs(runs)}</w:p>`,
    );
    return this;
  }

  /**
   * Ajoute un titre.
   * @param {string} text
   * @param {number} [level]
   */
  heading(text, level = 1) {
    return this.paragraph([{ text }], {
      style: `Titre${Math.min(4, Math.max(1, level))}`,
      spacingAfter: 160,
    });
  }

  /** Ajoute une ligne vide. */
  spacer() {
    this.body.push('<w:p/>');
    return this;
  }

  /** Insère un saut de page. */
  pageBreak() {
    this.body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    return this;
  }

  /**
   * Ajoute un tableau.
   * @param {(string|Run[])[][]} rows première ligne = en-tête
   * @param {{widths?: number[], headerShade?: string}} [options]
   */
  table(rows, options = {}) {
    if (!rows.length) return this;
    const widths = options.widths || [];
    const headerShade = options.headerShade || 'E8ECF7';

    const borders =
      '<w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
        .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="C9D2E8"/>`)
        .join('') +
      '</w:tblBorders>';

    const xmlRows = rows
      .map((row, rowIndex) => {
        const cells = row
          .map((cell, cellIndex) => {
            const runs = typeof cell === 'string' ? [{ text: cell, bold: rowIndex === 0 }] : cell;
            const width = widths[cellIndex]
              ? `<w:tcW w:w="${widths[cellIndex]}" w:type="dxa"/>`
              : '';
            const shade =
              rowIndex === 0
                ? `<w:shd w:val="clear" w:color="auto" w:fill="${headerShade}"/>`
                : '';
            return (
              `<w:tc><w:tcPr>${width}${shade}<w:vAlign w:val="center"/></w:tcPr>` +
              `<w:p><w:pPr><w:spacing w:after="40"/></w:pPr>${this.#runs(runs)}</w:p></w:tc>`
            );
          })
          .join('');
        const header = rowIndex === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
        return `<w:tr>${header}${cells}</w:tr>`;
      })
      .join('');

    this.body.push(
      '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>' +
        borders +
        '<w:tblLayout w:type="fixed"/></w:tblPr>' +
        xmlRows +
        '</w:tbl><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>',
    );
    return this;
  }

  /** Feuille de styles minimale mais complète. */
  #styles() {
    const heading = (id, size, color, spacing) =>
      `<w:style w:type="paragraph" w:styleId="Titre${id}"><w:name w:val="heading ${id}"/>` +
      `<w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="${id - 1}"/>` +
      `<w:spacing w:before="${spacing}" w:after="120"/></w:pPr>` +
      `<w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${size * 2}"/></w:rPr></w:style>`;

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:style>
${heading(1, 20, '1E2A78', 320)}
${heading(2, 15, '1E2A78', 260)}
${heading(3, 13, '33417F', 220)}
${heading(4, 11, '33417F', 180)}
<w:style w:type="character" w:styleId="Lien"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Citation"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="567"/></w:pPr><w:rPr><w:i/><w:color w:val="444444"/></w:rPr></w:style>
</w:styles>`;
  }

  /** Produit le fichier .docx. */
  async toBlob() {
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="${DOCX_MIME}.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="${DOCX_MIME}.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

    const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
${this.links
  .map(
    (l) =>
      `<Relationship Id="${l.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(
        l.target,
      )}" TargetMode="External"/>`,
  )
  .join('')}
</Relationships>`;

    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${this.body.join('')}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
</w:body></w:document>`;

    const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${escapeXml(this.meta.title || 'Rapport de plagiat')}</dc:title>
<dc:subject>${escapeXml(this.meta.subject || '')}</dc:subject>
<dc:creator>${escapeXml(this.meta.creator || BRAND.name)}</dc:creator>
<cp:lastModifiedBy>${escapeXml(this.meta.creator || BRAND.name)}</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;

    const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<Application>${escapeXml(BRAND.name)} - Analyseur de plagiat</Application>
</Properties>`;

    return createZip(
      [
        { name: '[Content_Types].xml', data: contentTypes },
        { name: '_rels/.rels', data: rels },
        { name: 'word/document.xml', data: document },
        { name: 'word/_rels/document.xml.rels', data: documentRels },
        { name: 'word/styles.xml', data: this.#styles() },
        { name: 'docProps/core.xml', data: core },
        { name: 'docProps/app.xml', data: app },
      ],
      { mimeType: DOCX_MIME },
    );
  }
}
