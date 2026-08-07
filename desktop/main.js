/**
 * Processus principal de l'application de bureau ELITE MATHEMATIQUE.
 *
 * L'application affiche l'analyseur dans une fenêtre native. Le contenu est
 * servi par un petit serveur local (voir `server.js`) afin que les Web Workers
 * et le stockage IndexedDB fonctionnent pleinement — l'expérience est celle de
 * la version hébergée, mais entièrement hors ligne et installée sur la machine.
 *
 * Sécurité : `contextIsolation` activé, `nodeIntegration` désactivé. Les liens
 * externes (moteurs de recherche, documentation) s'ouvrent dans le navigateur
 * par défaut, jamais dans la fenêtre de l'application.
 *
 * @module desktop/main
 */

'use strict';

const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('node:path');
const { startServer } = require('./server');

/** Racine des ressources : dépôt en développement, dossier empaqueté sinon. */
function resolveRoot() {
  // En production, `plagiat/` et `logo.png` sont copiés via extraResources.
  if (app.isPackaged) return path.join(process.resourcesPath, 'app');
  return path.join(__dirname, '..');
}

/** @type {{url: string, close: () => void}|null} */
let serverHandle = null;
/** @type {BrowserWindow|null} */
let mainWindow = null;

async function createWindow() {
  try {
    serverHandle = await startServer(resolveRoot());
  } catch (err) {
    dialog.showErrorBox(
      'Démarrage impossible',
      "Le service local n'a pas pu démarrer :\n" + String(err && err.message),
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: '#1e2a78',
    title: 'ELITE MATHEMATIQUE — Analyseur de plagiat',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadURL(serverHandle.url);

  // Les liens externes s'ouvrent dans le navigateur du système.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(serverHandle.url.slice(0, serverHandle.url.indexOf('/plagiat')))) {
      event.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/** Menu applicatif localisé. */
function buildMenu() {
  const isMac = process.platform === 'darwin';
  /** @type {Electron.MenuItemConstructorOptions[]} */
  const template = [
    ...(isMac
      ? [{ role: 'appMenu' }]
      : []),
    {
      label: 'Fichier',
      submenu: [isMac ? { role: 'close', label: 'Fermer' } : { role: 'quit', label: 'Quitter' }],
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Recharger' },
        { role: 'toggleDevTools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn', label: 'Agrandir' },
        { role: 'zoomOut', label: 'Réduire' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
      ],
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'ELITE MATHEMATIQUE — Analyseur de plagiat',
              detail:
                'Analyse de plagiat, humanisation, analyse forensique et vérification ' +
                'des citations. Tout le traitement a lieu sur cet ordinateur ; aucun ' +
                'document n’est transmis à un serveur.\n\nVersion ' +
                app.getVersion() +
                '.',
              buttons: ['Fermer'],
            });
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Une seule instance : un second lancement réactive la fenêtre existante.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    buildMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (serverHandle) serverHandle.close();
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    if (serverHandle) serverHandle.close();
  });
}
