/**
 * Petit serveur statique interne à l'application de bureau.
 *
 * L'analyseur exploite des modules ES et des Web Workers : les servir en HTTP
 * (sur la boucle locale) plutôt qu'en `file://` garantit le fonctionnement des
 * workers et la persistance IndexedDB. Le serveur n'écoute que sur 127.0.0.1
 * et ne sert que le dossier de l'application — jamais le reste du disque.
 *
 * @module desktop/server
 */

'use strict';

const http = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const { join, normalize, extname } = require('node:path');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Démarre le serveur local et renvoie l'URL de base de l'application.
 *
 * @param {string} root répertoire racine servi (contient `plagiat/`)
 * @param {number} [preferredPort] port stable (préserve le stockage local)
 * @returns {Promise<{url: string, port: number, close: () => void}>}
 */
function startServer(root, preferredPort = 43117) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let path = join(root, normalize(decodeURIComponent(url.pathname)));
      if (!path.startsWith(root)) {
        res.writeHead(403).end('Interdit');
        return;
      }
      const info = await stat(path).catch(() => null);
      if (info && info.isDirectory()) path = join(path, 'index.html');

      const body = await readFile(path);
      res.writeHead(200, {
        'Content-Type': TYPES[extname(path)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Introuvable');
    }
  });

  return new Promise((resolve, reject) => {
    /** Essaie une série de ports, du préféré vers des replis. */
    const tryPort = (port, attemptsLeft) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
          tryPort(port + 1, attemptsLeft - 1);
        } else {
          reject(err);
        }
      });
      server.listen(port, '127.0.0.1', () => {
        const actual = server.address().port;
        resolve({
          url: `http://127.0.0.1:${actual}/plagiat/`,
          port: actual,
          close: () => server.close(),
        });
      });
    };
    tryPort(preferredPort, 20);
  });
}

module.exports = { startServer };
