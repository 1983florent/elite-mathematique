/**
 * Construction des documents Word servant de fixtures.
 *
 * Les archives sont assemblées ici par une implémentation ZIP **indépendante**
 * de celle du projet (`node:zlib` + écriture manuelle des en-têtes) : les tests
 * du lecteur valident donc bien le lecteur, et non un aller-retour avec notre
 * propre écrivain. Rien de binaire n'est versionné.
 */

import { deflateRawSync, crc32 } from 'node:zlib';

const encoder = new TextEncoder();

/**
 * Assemble une archive ZIP minimale.
 * @param {{name: string, data: string}[]} files
 * @param {{compress?: boolean}} [options]
 * @returns {Buffer}
 */
export function buildZip(files, options = {}) {
  const compress = options.compress !== false;
  /** @type {Buffer[]} */
  const parts = [];
  /** @type {Buffer[]} */
  const central = [];
  let offset = 0;

  for (const file of files) {
    const raw = Buffer.from(encoder.encode(file.data));
    const payload = compress ? Buffer.from(deflateRawSync(raw)) : raw;
    const method = compress ? 8 : 0;
    const nameBytes = Buffer.from(file.name, 'utf8');
    const sum = crc32(raw) >>> 0;

    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(sum, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    nameBytes.copy(local, 30);

    parts.push(local, payload);

    const record = Buffer.alloc(46 + nameBytes.length);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x0800, 8);
    record.writeUInt16LE(method, 10);
    record.writeUInt32LE(sum, 16);
    record.writeUInt32LE(payload.length, 20);
    record.writeUInt32LE(raw.length, 24);
    record.writeUInt16LE(nameBytes.length, 28);
    record.writeUInt32LE(offset, 42);
    nameBytes.copy(record, 46);
    central.push(record);

    offset += local.length + payload.length;
  }

  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...parts, directory, end]);
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const CORE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
<dc:title>M&#233;moire de recherche</dc:title>
<dc:creator>Florent Ndiaye</dc:creator>
<cp:lastModifiedBy>Florent</cp:lastModifiedBy>
<dcterms:created>2025-01-05T10:00:00Z</dcterms:created>
<dcterms:modified>2025-02-01T12:00:00Z</dcterms:modified>
</cp:coreProperties>`;

const APP = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<Application>Microsoft Office Word</Application><Pages>3</Pages><Words>124</Words><Characters>800</Characters><Company>Elite Math</Company>
</Properties>`;

/** Paragraphe WordprocessingML, avec style facultatif. */
function para(text, style) {
  const properties = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  return `<w:p>${properties}<w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

/** Corps du document d'exemple : couvre les cas délicats de l'extraction. */
const SAMPLE_BODY = [
  para('Introduction g&#233;n&#233;rale', 'Titre1'),
  para(
    'Le th&#233;or&#232;me de Pythagore &#233;tablit une relation fondamentale dans un triangle rectangle.',
  ),
  // Suivi des modifications : l'insertion est gardée, la suppression écartée.
  '<w:p><w:ins><w:r><w:t xml:space="preserve">Texte ins&#233;r&#233;. </w:t></w:r></w:ins>' +
    '<w:del><w:r><w:delText>TEXTE SUPPRIME</w:delText></w:r></w:del>' +
    '<w:r><w:t>Fin.</w:t></w:r></w:p>',
  // Code de champ : ne doit pas polluer le texte.
  '<w:p><w:r><w:instrText> PAGE \\* MERGEFORMAT </w:instrText></w:r>' +
    '<w:r><w:t>Page visible</w:t></w:r></w:p>',
  // Saut de ligne interne.
  '<w:p><w:r><w:t>Ligne un</w:t><w:br/><w:t>Ligne deux</w:t></w:r></w:p>',
  // Tableau.
  `<w:tbl><w:tr><w:tc>${para('Cellule A')}</w:tc><w:tc>${para('Cellule B')}</w:tc></w:tr></w:tbl>`,
  // AlternateContent : on garde le Choice, pas le Fallback (sinon doublon).
  '<w:p><mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">' +
    '<mc:Choice Requires="wps"><w:r><w:t>Choix moderne</w:t></w:r></mc:Choice>' +
    '<mc:Fallback><w:r><w:t>REPLI ANCIEN</w:t></w:r></mc:Fallback>' +
    '</mc:AlternateContent></w:p>',
  para('Symboles &amp; entit&#233;s : &lt;math&gt; &#8804; 5 &#8212; ok'),
  para(
    'Un paragraphe suffisamment long pour servir de base &#224; la d&#233;tection de similarit&#233; entre documents, avec un vocabulaire vari&#233; et distinctif.',
  ),
].join('');

/** @param {string} body */
function documentXml(body) {
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    `<w:body>${body}<w:sectPr/></w:body></w:document>`
  );
}

const FOOTNOTES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  '<w:footnote w:id="1"><w:p><w:r><w:t>Note de bas de page importante.</w:t></w:r></w:p></w:footnote>' +
  '</w:footnotes>';

/** Corps du gros document : 3 000 paragraphes, environ 126 000 mots. */
function bigBody() {
  const lexique = [
    'analyse', 'fonction', 'd&#233;riv&#233;e', 'int&#233;grale', 'matrice', 'vecteur',
    'espace', 'topologie', 'probabilit&#233;', 'statistique', 'th&#233;or&#232;me',
    'd&#233;monstration', 'hypoth&#232;se', 'convergence', 'suite', 's&#233;rie',
    'limite', 'continuit&#233;', 'ensemble', 'application',
  ];
  const paragraphes = [];
  for (let i = 0; i < 3000; i++) {
    const mots = [];
    for (let j = 0; j < 40; j++) mots.push(lexique[(i * 7 + j) % lexique.length]);
    paragraphes.push(para(`Paragraphe ${i} : ${mots.join(' ')}.`));
  }
  return paragraphes.join('');
}

/** Constructeurs des fixtures, indexés par nom de fichier. */
const BUILDERS = {
  'sample.docx': () =>
    buildZip(
      [
        { name: '[Content_Types].xml', data: CONTENT_TYPES },
        { name: '_rels/.rels', data: RELS },
        { name: 'word/document.xml', data: documentXml(SAMPLE_BODY) },
        { name: 'word/footnotes.xml', data: FOOTNOTES },
        { name: 'docProps/core.xml', data: CORE },
        { name: 'docProps/app.xml', data: APP },
      ],
      { compress: true },
    ),

  // Même contenu, mais entrées « stored » : valide le chemin sans décompression.
  'sample-stored.docx': () =>
    buildZip(
      [
        { name: '[Content_Types].xml', data: CONTENT_TYPES },
        { name: '_rels/.rels', data: RELS },
        { name: 'word/document.xml', data: documentXml(SAMPLE_BODY) },
        { name: 'word/footnotes.xml', data: FOOTNOTES },
        { name: 'docProps/core.xml', data: CORE },
        { name: 'docProps/app.xml', data: APP },
      ],
      { compress: false },
    ),

  'big.docx': () =>
    buildZip(
      [
        {
          name: '[Content_Types].xml',
          data: CONTENT_TYPES.replace(
            '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>\n',
            '',
          ),
        },
        { name: '_rels/.rels', data: RELS },
        { name: 'word/document.xml', data: documentXml(bigBody()) },
      ],
      { compress: true },
    ),
};

/** @type {Map<string, Buffer>} */
const cache = new Map();

/**
 * Renvoie le contenu d'une fixture, construit une seule fois par exécution.
 * @param {string} name
 * @returns {Buffer}
 */
export function fixtureBuffer(name) {
  if (!cache.has(name)) {
    const build = BUILDERS[name];
    if (!build) throw new Error(`Fixture inconnue : ${name}`);
    cache.set(name, build());
  }
  return cache.get(name);
}

/** Noms des fixtures disponibles. */
export const FIXTURE_NAMES = Object.keys(BUILDERS);
