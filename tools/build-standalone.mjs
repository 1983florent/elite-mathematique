/**
 * Construction de la version « fichier unique » de l'analyseur.
 *
 * Le résultat est un seul .html contenant l'interface, la feuille de style et
 * la totalité du code : il s'ouvre par double-clic, sans serveur ni connexion,
 * et fonctionne depuis une clé USB.
 *
 *   node tools/build-standalone.mjs [destination]
 *
 * Le regroupement est volontairement minimal et ne gère que ce que le projet
 * utilise réellement : imports nommés, exports nommés, imports dynamiques.
 * Il n'y a ni minification ni transformation de syntaxe — le code livré reste
 * exactement celui du dépôt, lisible et vérifiable.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const JS_ROOT = join(ROOT, 'plagiat/js');
const ENTRY = join(JS_ROOT, 'app.js');

/** Identifiant d'un module : son chemin relatif à `plagiat/js`. */
const idOf = (file) => relative(JS_ROOT, file).split('\\').join('/');

/* ------------------------------------------------------------------ *
 * Transformation d'un module
 * ------------------------------------------------------------------ */

const IMPORT_RE = /^import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm;
const EXPORT_DECL_RE = /^export\s+(async\s+)?(function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm;
const DYNAMIC_IMPORT_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

/**
 * Réécrit un module ES en fonction de fabrique.
 *
 * @param {string} source
 * @param {string} file chemin absolu du module
 * @returns {{code: string, deps: string[]}}
 */
function transform(source, file) {
  /** @type {string[]} */
  const deps = [];
  const here = dirname(file);

  /** Résout une spécification relative en identifiant de module. */
  const resolveSpec = (spec) => {
    const target = idOf(resolve(here, spec));
    if (!deps.includes(target)) deps.push(target);
    return target;
  };

  let code = source;

  // import { a, b as c } from './x.js';  →  const { a, b: c } = __req('x.js');
  code = code.replace(IMPORT_RE, (match, names, spec) => {
    const target = resolveSpec(spec);
    const bindings = names
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const alias = /^(\S+)\s+as\s+(\S+)$/.exec(part);
        return alias ? `${alias[1]}: ${alias[2]}` : part;
      })
      .join(', ');
    return `const { ${bindings} } = __req(${JSON.stringify(target)});`;
  });

  // await import('./x.js')  →  await Promise.resolve(__req('x.js'))
  code = code.replace(DYNAMIC_IMPORT_RE, (match, spec) => {
    if (!spec.startsWith('.')) return match;
    return `Promise.resolve(__req(${JSON.stringify(resolveSpec(spec))}))`;
  });

  // Les workers séparés n'existent pas dans un fichier unique.
  code = code.replace(
    /new URL\(\s*['"][^'"]+['"]\s*,\s*import\.meta\.url\s*\)/g,
    'null',
  );

  // export function f  →  function f   (les noms sont exposés à la fin)
  /** @type {string[]} */
  const exported = [];
  code = code.replace(EXPORT_DECL_RE, (match, isAsync, kind, name) => {
    exported.push(name);
    return `${isAsync || ''}${kind} ${name}`;
  });

  if (/^export\s/m.test(code)) {
    const stray = /^export\s.*$/m.exec(code);
    throw new Error(
      `Forme d'export non prise en charge dans ${idOf(file)} : ${stray?.[0]}`,
    );
  }

  if (exported.length) {
    code += `\n\nObject.assign(__exports, { ${exported.join(', ')} });\n`;
  }
  return { code, deps };
}

/* ------------------------------------------------------------------ *
 * Parcours du graphe
 * ------------------------------------------------------------------ */

/**
 * Charge tous les modules atteignables depuis l'entrée, en ordre de
 * dépendance (les feuilles d'abord).
 *
 * @param {string} entry
 * @returns {Promise<{id: string, code: string}[]>}
 */
async function collectModules(entry) {
  /** @type {Map<string, {id: string, code: string, deps: string[]}>} */
  const modules = new Map();

  const visit = async (file) => {
    const id = idOf(file);
    if (modules.has(id)) return;
    modules.set(id, null); // marque de visite, évite les boucles
    const source = await readFile(file, 'utf8');
    const { code, deps } = transform(source, file);
    modules.set(id, { id, code, deps });
    for (const dep of deps) await visit(join(JS_ROOT, dep));
  };
  await visit(entry);

  // Tri topologique : un module est émis après ses dépendances.
  /** @type {{id: string, code: string}[]} */
  const ordered = [];
  const seen = new Set();
  const emit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    const module = modules.get(id);
    if (!module) return;
    for (const dep of module.deps) emit(dep);
    ordered.push({ id: module.id, code: module.code });
  };
  emit(idOf(entry));
  return ordered;
}

/* ------------------------------------------------------------------ *
 * Assemblage du document
 * ------------------------------------------------------------------ */

/** Marque ELITE MATHEMATIQUE en SVG, encodée pour rester autonome. */
const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="12" fill="#1e2a78"/>' +
  '<text x="32" y="44" font-family="Georgia,serif" font-size="38" font-weight="700" ' +
  'text-anchor="middle" fill="#fbc02d">&#931;</text></svg>';
const LOGO_URI = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

async function build(destination) {
  const html = await readFile(join(ROOT, 'plagiat/index.html'), 'utf8');
  const css = await readFile(join(ROOT, 'plagiat/css/app.css'), 'utf8');
  const modules = await collectModules(ENTRY);

  const bundle = `(() => {
'use strict';
// L'exécution a lieu sur le fil principal : un fichier unique ne peut pas
// charger de worker séparé. Le résultat est identique, seule la fluidité de
// l'interface diffère sur les très gros documents.
globalThis.ELITE_SANS_WORKER = true;

const __registre = Object.create(null);
const __cache = Object.create(null);

function __req(id) {
  if (__cache[id]) return __cache[id].exports;
  const module = { exports: {} };
  __cache[id] = module;
  const fabrique = __registre[id];
  if (!fabrique) throw new Error('Module introuvable : ' + id);
  fabrique(module.exports, __req);
  return module.exports;
}

${modules
  .map(
    (m) => `__registre[${JSON.stringify(m.id)}] = function (__exports, __req) {
${m.code}
};`,
  )
  .join('\n\n')}

__req(${JSON.stringify(idOf(ENTRY))});
})();`;

  // Le remplacement passe par une fonction : sous forme de chaîne, les motifs
  // « $& », « $1 »… présents dans le code inliné seraient interprétés par
  // String.replace et corrompraient le résultat.
  const remplacer = (texte, cible, contenu) => {
    if (!texte.includes(cible)) {
      throw new Error(`Repère absent du gabarit : ${cible.slice(0, 60)}`);
    }
    return texte.replace(cible, () => contenu);
  };

  let out = html;

  // Les ressources propres à la version installable (manifeste PWA, icônes PNG
  // séparées) n'ont pas de sens dans un fichier unique : on les retire pour
  // éviter des requêtes vouées à échouer sous file://.
  const retirerSiPresent = (texte, motif) => texte.replace(motif, '');
  out = retirerSiPresent(out, '<link rel="manifest" href="manifest.webmanifest">\n');
  out = retirerSiPresent(
    out,
    '<link rel="icon" type="image/png" sizes="512x512" href="icons/favicon-512.png">\n',
  );
  out = retirerSiPresent(out, '<link rel="apple-touch-icon" href="icons/icon-192.png">\n');
  // Le bouton « Installer » ne s'applique pas au fichier unique.
  out = retirerSiPresent(
    out,
    /<button type="button" id="btn-installer"[\s\S]*?<\/button>\n\s*/,
  );

  out = remplacer(out, '<link rel="stylesheet" href="css/app.css">', `<style>\n${css}\n</style>`);
  out = remplacer(out, '<link rel="icon" href="../logo.png">', `<link rel="icon" href="${LOGO_URI}">`);
  out = remplacer(
    out,
    '<script type="module" src="js/app.js"></script>',
    `<script>\n${bundle}\n</script>`,
  );
  // Version autonome : pas de site autour, la marque n'est plus un lien.
  out = remplacer(
    out,
    '<a class="entete__marque" href="../index.html">',
    '<span class="entete__marque">',
  );
  out = remplacer(
    out,
    '<span class="entete__logo" aria-hidden="true">V</span>\n      <span id="marque-nom">Veritex</span>\n    </a>',
    '<span class="entete__logo" aria-hidden="true">V</span>\n      <span id="marque-nom">Veritex</span>\n    </span>',
  );

  if (out.includes('href="css/app.css"') || out.includes('src="js/app.js"')) {
    throw new Error("L'inlining a échoué : des ressources externes subsistent.");
  }

  // Mention explicite du mode d'exécution, visible dans l'onglet Aide.
  out = remplacer(
    out,
    '<h2>Confidentialité</h2>',
    '<h2>Version en fichier unique</h2>\n      <p>Vous utilisez la version autonome : tout le code tient dans cette page. ' +
      'Elle fonctionne par double-clic, sans serveur. Deux différences avec la version hébergée : ' +
      "l'analyse s'exécute sur le fil principal (l'interface peut se figer quelques instants sur un très gros document), " +
      "et les réglages ne sont pas conservés d'une ouverture à l'autre lorsque la page est ouverte depuis un fichier local.</p>\n\n" +
      '      <h2>Confidentialité</h2>',
  );

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, out, 'utf8');
  return { path: destination, size: Buffer.byteLength(out), modules: modules.length };
}

const destination = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, 'dist/Veritex.html');

const result = await build(destination);
console.log(
  `${relative(ROOT, result.path)} — ${result.modules} modules, ${(result.size / 1024).toFixed(0)} Ko`,
);
