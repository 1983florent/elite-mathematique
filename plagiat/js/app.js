/**
 * Contrôleur de l'application : onglets, état, câblage des trois panneaux.
 *
 * @module app
 */

import { $, $$, el, clear, num, bytes, notify, download, debounce, copyToClipboard } from './ui/dom.js';
import { renderResults } from './ui/results.js';

import { readDocx, readOdt, DocxError } from './core/docx-reader.js';
import { AnalysisRunner, HumanizeRunner } from './core/runner.js';
import { DEPTH_PROFILES } from './core/pipeline.js';
import { PROVIDERS, READERS, providerReadiness, createProviderContext, testProvider } from './core/providers.js';
import { RequestQueue } from './core/net.js';
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  ResponseCache,
  clear as clearStore,
  eraseEverything,
  storageUsage,
} from './core/store.js';
import { renderReportHtml, buildReportDocx, reportToJson } from './core/report.js';
import { DocxBuilder } from './core/docx-writer.js';
import { HUMANIZE_DEFAULTS, OPERATION_LABELS, wordDiff } from './core/humanizer.js';
import { userMessage } from './core/errors.js';

/* ------------------------------------------------------------------ *
 * État
 * ------------------------------------------------------------------ */

const state = {
  settings: { ...DEFAULT_SETTINGS },
  /** @type {File|null} */
  file: null,
  /** @type {any|null} document extrait, réutilisé par l'analyse */
  prepared: null,
  /** @type {{name: string, text: string}[]} */
  corpus: [],
  /** @type {any|null} */
  report: null,
  /** @type {any|null} */
  humanized: null,
  analyzing: false,
};

const analysisRunner = new AnalysisRunner();
const humanizeRunner = new HumanizeRunner();

/* ------------------------------------------------------------------ *
 * Thème
 * ------------------------------------------------------------------ */

function applyTheme(theme) {
  const resolved =
    theme === 'auto'
      ? window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'sombre'
        : 'clair'
      : theme;
  document.documentElement.dataset.theme = resolved;
  const icon = $('#icone-theme');
  if (icon) icon.textContent = resolved === 'sombre' ? '☀' : '☾';
}

function setupTheme() {
  applyTheme(state.settings.theme);
  $('#btn-theme').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    state.settings.theme = current === 'sombre' ? 'clair' : 'sombre';
    applyTheme(state.settings.theme);
    persist();
  });
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (state.settings.theme === 'auto') applyTheme('auto');
  });
}

/* ------------------------------------------------------------------ *
 * Onglets
 * ------------------------------------------------------------------ */

const TABS = ['analyse', 'humanisation', 'reglages', 'aide'];

function showTab(name) {
  for (const tab of TABS) {
    const button = $(`#onglet-${tab}`);
    const panel = $(`#panneau-${tab}`);
    const active = tab === name;
    button.classList.toggle('actif', active);
    button.setAttribute('aria-selected', String(active));
    panel.hidden = !active;
  }
  if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
}

function setupTabs() {
  for (const tab of TABS) {
    $(`#onglet-${tab}`).addEventListener('click', () => showTab(tab));
  }
  const initial = location.hash.replace('#', '');
  showTab(TABS.includes(initial) ? initial : 'analyse');
}

/* ------------------------------------------------------------------ *
 * Persistance des réglages
 * ------------------------------------------------------------------ */

const persist = debounce(() => {
  saveSettings(state.settings).catch(() => {
    notify("Impossible d'enregistrer les réglages dans ce navigateur.", 'erreur');
  });
}, 400);

/* ------------------------------------------------------------------ *
 * Panneau « Analyse »
 * ------------------------------------------------------------------ */

function setupDropZone() {
  const zone = $('#zone-depot');
  const input = $('#fichier');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', () => {
    if (input.files?.[0]) loadDocument(input.files[0]);
  });

  for (const type of ['dragenter', 'dragover']) {
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add('survol');
    });
  }
  for (const type of ['dragleave', 'drop']) {
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.remove('survol');
    });
  }
  zone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) loadDocument(file);
  });

  $('#btn-retirer-fichier').addEventListener('click', () => {
    state.file = null;
    state.prepared = null;
    input.value = '';
    $('#info-fichier').hidden = true;
    updateAnalysisSummary();
  });

  $('#texte-colle').addEventListener('input', debounce(updateAnalysisSummary, 300));
}

/**
 * Charge et pré-analyse le document déposé.
 * @param {File} file
 */
async function loadDocument(file) {
  state.file = file;
  state.prepared = null;
  $('#info-fichier').hidden = false;
  $('#nom-fichier').textContent = file.name;
  $('#details-fichier').textContent = `${bytes(file.size)} — lecture en cours…`;

  try {
    const doc = await readDocx(file, {
      includeNotes: state.settings.includeNotes,
      includeHeadersFooters: state.settings.includeHeadersFooters,
    });
    state.prepared = doc;
    $('#details-fichier').textContent =
      `${bytes(file.size)} · ${num(doc.stats.words)} mots · ${num(doc.stats.pages)} page(s)` +
      `${doc.stats.pagesEstimated ? ' (estimé)' : ''} · ${num(doc.paragraphs.length)} paragraphes`;
    if (doc.truncated) {
      notify('Document très volumineux : seule la première partie sera analysée.', 'erreur', 9000);
    }
  } catch (err) {
    state.file = null;
    state.prepared = null;
    $('#info-fichier').hidden = true;
    $('#fichier').value = '';
    notify(
      err instanceof DocxError ? err.message : `Lecture impossible : ${userMessage(err)}`,
      'erreur',
      12000,
    );
  }
  updateAnalysisSummary();
}

function setupCorpus() {
  const input = $('#fichiers-corpus');
  input.addEventListener('change', async () => {
    for (const file of [...(input.files || [])]) {
      try {
        state.corpus.push({ name: file.name, text: await readAnyText(file) });
      } catch (err) {
        notify(`${file.name} : ${userMessage(err)}`, 'erreur');
      }
    }
    input.value = '';
    renderCorpus();
    updateAnalysisSummary();
  });
}

/**
 * Extrait le texte d'un fichier de référence, quel que soit son format.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function readAnyText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx') || name.endsWith('.docm')) {
    return (await readDocx(file)).text;
  }
  if (name.endsWith('.odt')) return (await readOdt(file)).text;
  return file.text();
}

function renderCorpus() {
  const list = $('#liste-corpus');
  clear(list);
  state.corpus.forEach((entry, index) => {
    list.append(
      el('li', {}, [
        el('span', {}, `${entry.name} — ${num(entry.text.length)} caractères`),
        el(
          'button',
          {
            type: 'button',
            class: 'bouton bouton--discret',
            onclick: () => {
              state.corpus.splice(index, 1);
              renderCorpus();
              updateAnalysisSummary();
            },
          },
          'Retirer',
        ),
      ]),
    );
  });
}

function setupProfiles() {
  const host = $('#profils');
  clear(host);
  for (const [key, profile] of Object.entries(DEPTH_PROFILES)) {
    const input = el('input', {
      type: 'radio',
      name: 'profondeur',
      value: key,
      checked: state.settings.depth === key,
      onchange: () => {
        state.settings.depth = key;
        persist();
        $$('.profil', host).forEach((n) => n.classList.toggle('actif', n.dataset.key === key));
        updateAnalysisSummary();
      },
    });
    host.append(
      el(
        'label',
        {
          class: `profil${state.settings.depth === key ? ' actif' : ''}`,
          dataset: { key },
        },
        [
          input,
          el('span', {}, [
            el('strong', {}, profile.label),
            el('span', { class: 'discret' }, ` ${profile.description}`),
            el('br'),
            el(
              'span',
              { class: 'discret' },
              `jusqu'à ${num(profile.maxQueries)} requêtes par moteur, ${profile.resultsPerQuery} résultats par requête`,
            ),
          ]),
        ],
      ),
    );
  }
}

/** Met à jour l'estimation affichée avant le lancement. */
function updateAnalysisSummary() {
  const host = $('#resume-analyse');
  const pasted = $('#texte-colle').value.trim();
  const hasInput = Boolean(state.prepared || pasted);
  $('#btn-analyser').disabled = !hasInput || state.analyzing;

  const activeProviders = (state.settings.providers || [])
    .map((id) => PROVIDERS.find((p) => p.id === id))
    .filter((p) => p && providerReadiness(p, state.settings).ready);

  $('#etat-moteurs').textContent = activeProviders.length
    ? `Moteurs actifs : ${activeProviders.map((p) => p.name).join(', ')}.`
    : "Aucun moteur actif — seuls le corpus local et les répétitions internes seront analysés. Activez un moteur dans l'onglet Réglages.";

  clear(host);
  if (!hasInput) {
    host.append(el('p', { class: 'discret' }, 'Choisissez un document ou collez un texte pour lancer l’analyse.'));
    return;
  }

  const words = state.prepared ? state.prepared.stats.words : countRoughWords(pasted);
  const profile = DEPTH_PROFILES[state.settings.depth] || DEPTH_PROFILES.standard;
  const blocks = Math.max(1, Math.round(words / 34));
  const queries = Math.min(blocks, profile.maxQueries);
  const requests = queries * Math.max(1, activeProviders.length);
  const seconds = Math.ceil((requests * 0.35) / Math.max(1, state.settings.concurrency));

  host.append(
    el('ul', {}, [
      el('li', {}, `${num(words)} mots à comparer, découpés en ${num(blocks)} blocs.`),
      el('li', {}, `${num(queries)} blocs seront soumis aux moteurs (${Math.round((queries / blocks) * 100)} % du texte).`),
      el('li', {}, `≈ ${num(requests)} requêtes réseau, soit environ ${formatSeconds(seconds)} d'attente.`),
      state.corpus.length
        ? el('li', {}, `${state.corpus.length} document(s) de référence comparés intégralement, hors ligne.`)
        : null,
      el(
        'li',
        { class: 'discret' },
        'La comparaison porte sur la totalité du texte : l’échantillonnage ne concerne que la découverte des sources.',
      ),
    ]),
  );
}

function countRoughWords(text) {
  const m = text.match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

function formatSeconds(seconds) {
  if (seconds < 60) return `${seconds} s`;
  return `${Math.round(seconds / 60)} min`;
}

const PHASE_LABELS = {
  lecture: 'Lecture du document',
  segmentation: 'Découpage et indexation',
  recherche: 'Interrogation des moteurs',
  sources: 'Récupération des sources',
  comparaison: 'Comparaison',
  synthese: 'Synthèse',
};

function setupAnalysis() {
  $('#btn-analyser').addEventListener('click', runAnalysis);
  $('#btn-annuler').addEventListener('click', () => {
    analysisRunner.cancel();
    notify('Interruption demandée…');
  });
}

async function runAnalysis() {
  if (state.analyzing) return;
  const pasted = $('#texte-colle').value.trim();
  if (!state.prepared && !pasted) return;

  state.analyzing = true;
  $('#btn-analyser').disabled = true;
  $('#btn-annuler').hidden = false;
  $('#carte-progression').hidden = false;
  $('#resultats').hidden = true;
  const journal = $('#journal');
  clear(journal);
  setProgress(0, 'Préparation…');

  const input = state.prepared
    ? { prepared: state.prepared, file: state.file, name: state.file?.name, corpus: state.corpus }
    : { text: pasted, name: 'Texte collé', corpus: state.corpus };

  let lastPhase = '';
  try {
    const report = await analysisRunner.analyze(input, { ...state.settings }, {
      onProgress: (event) => {
        setProgress(event.ratio, event.message);
        if (event.phase !== lastPhase) {
          lastPhase = event.phase;
          journal.prepend(el('li', {}, `${PHASE_LABELS[event.phase] || event.phase} — ${event.message}`));
        }
      },
    });
    state.report = report;
    renderResults($('#resultats'), report, {
      onExport: exportReport,
      onHumanize: () => {
        $('#texte-source').value = report.text;
        updateSourceStats();
        showTab('humanisation');
      },
    });
    notify(
      `Analyse terminée : ${report.scores.tauxNet} % de similitude nette, ${report.scores.sourcesTotal} source(s).`,
      'succes',
      9000,
    );
  } catch (err) {
    const message = userMessage(err);
    if (/interrompue|annul/i.test(message)) notify('Analyse interrompue.', 'info');
    else notify(`Analyse impossible : ${message}`, 'erreur', 14000);
  } finally {
    state.analyzing = false;
    $('#btn-annuler').hidden = true;
    $('#carte-progression').hidden = true;
    updateAnalysisSummary();
  }
}

function setProgress(ratio, message) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio || 0)) * 100);
  $('#remplissage-progression').style.width = `${percent}%`;
  $('#barre-progression').setAttribute('aria-valuenow', String(percent));
  $('#message-progression').textContent = `${percent} % — ${message}`;
}

/** @param {string} format */
async function exportReport(format) {
  const report = state.report;
  if (!report) return;
  const base = (report.document.name || 'document').replace(/\.[^.]+$/, '');

  try {
    if (format === 'json') {
      download(reportToJson(report, { includeText: true }), `rapport-${base}.json`, 'application/json');
      return;
    }
    if (format === 'html') {
      download(renderReportHtml(report), `rapport-${base}.html`, 'text/html;charset=utf-8');
      return;
    }
    if (format === 'docx') {
      notify('Génération du rapport Word…');
      download(await buildReportDocx(report), `rapport-${base}.docx`);
      return;
    }
    if (format === 'print') {
      const win = window.open('', '_blank');
      if (!win) {
        notify("Le navigateur a bloqué l'ouverture de la fenêtre d'impression.", 'erreur');
        return;
      }
      win.document.write(renderReportHtml(report));
      win.document.close();
      win.addEventListener('load', () => win.print(), { once: true });
      // Certains navigateurs déclenchent `load` avant l'ajout de l'écouteur.
      setTimeout(() => {
        try {
          if (win.document.readyState === 'complete') win.print();
        } catch {
          /* fenêtre déjà fermée */
        }
      }, 700);
    }
  } catch (err) {
    notify(`Export impossible : ${userMessage(err)}`, 'erreur');
  }
}

/* ------------------------------------------------------------------ *
 * Panneau « Humanisation »
 * ------------------------------------------------------------------ */

function setupHumanize() {
  const operations = $('#liste-operations');
  clear(operations);
  for (const [key, label] of Object.entries(OPERATION_LABELS)) {
    operations.append(
      el('label', {}, [
        el('input', {
          type: 'checkbox',
          checked: HUMANIZE_DEFAULTS.operations[key] !== false,
          dataset: { operation: key },
        }),
        label,
      ]),
    );
  }

  const intensity = $('#intensite');
  intensity.addEventListener('input', () => {
    $('#valeur-intensite').textContent = `${intensity.value} %`;
  });

  $('#texte-source').addEventListener('input', debounce(updateSourceStats, 300));

  $('#btn-importer-analyse').addEventListener('click', () => {
    const text = state.report?.text || state.prepared?.text;
    if (!text) {
      notify("Analysez d'abord un document, ou importez un fichier ici.", 'erreur');
      return;
    }
    $('#texte-source').value = text;
    updateSourceStats();
  });

  $('#fichier-humanisation').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      $('#texte-source').value = await readAnyText(file);
      updateSourceStats();
    } catch (err) {
      notify(`Lecture impossible : ${userMessage(err)}`, 'erreur');
    }
    event.target.value = '';
  });

  $('#btn-humaniser').addEventListener('click', runHumanize);

  $('#btn-copier-humanise').addEventListener('click', async () => {
    const ok = await copyToClipboard($('#texte-humanise').value);
    notify(ok ? 'Texte copié.' : 'Copie impossible : sélectionnez le texte manuellement.', ok ? 'succes' : 'erreur');
  });

  $('#btn-docx-humanise').addEventListener('click', async () => {
    const text = $('#texte-humanise').value;
    if (!text.trim()) return;
    const builder = new DocxBuilder({ title: 'Texte humanisé', creator: 'ELITE MATHEMATIQUE' });
    for (const paragraph of text.split('\n')) {
      if (paragraph.trim()) builder.paragraph(paragraph);
      else builder.spacer();
    }
    download(await builder.toBlob(), 'texte-humanise.docx');
  });

  $('#btn-verifier-humanise').addEventListener('click', () => {
    const text = $('#texte-humanise').value;
    if (!text.trim()) return;
    $('#texte-colle').value = text;
    state.file = null;
    state.prepared = null;
    $('#info-fichier').hidden = true;
    showTab('analyse');
    updateAnalysisSummary();
    runAnalysis();
  });
}

function updateSourceStats() {
  const text = $('#texte-source').value;
  $('#stats-source').textContent = text.trim()
    ? `${num(countRoughWords(text))} mots · ${num(text.length)} caractères`
    : '';
}

async function runHumanize() {
  const text = $('#texte-source').value;
  if (!text.trim()) {
    notify('Aucun texte à retravailler.', 'erreur');
    return;
  }

  const operations = {};
  for (const input of $$('#liste-operations input[data-operation]')) {
    operations[input.dataset.operation] = input.checked;
  }

  const button = $('#btn-humaniser');
  button.disabled = true;
  button.textContent = 'Réécriture…';

  try {
    const result = await humanizeRunner.run(text, {
      intensity: Number($('#intensite').value) / 100,
      lang: $('#langue-humanisation').value,
      seed: Number($('#graine').value) || 0,
      operations,
    });
    state.humanized = result;
    $('#texte-humanise').value = result.text;
    $('#stats-humanise').textContent =
      `${num(result.stats.after.words)} mots · ${result.stats.changeRatio} % du texte réécrit · ` +
      `${result.stats.paragraphsChanged}/${result.stats.paragraphsTotal} paragraphes modifiés`;
    for (const id of ['#btn-copier-humanise', '#btn-docx-humanise', '#btn-verifier-humanise']) {
      $(id).disabled = false;
    }
    renderHumanizeReport(result);
    notify(`Texte réécrit : ${result.stats.changeRatio} % de mots modifiés.`, 'succes');
  } catch (err) {
    notify(`Humanisation impossible : ${userMessage(err)}`, 'erreur');
  } finally {
    button.disabled = false;
    button.textContent = 'Humaniser';
  }
}

/** Affiche le détail des opérations et le différentiel. */
function renderHumanizeReport(result) {
  $('#carte-diff').hidden = false;

  const operations = $('#tableau-operations');
  clear(operations);
  const rows = Object.entries(result.operations);
  operations.append(
    rows.length
      ? el('div', { class: 'tableau-defilant' }, [
          el('table', {}, [
            el('thead', {}, [el('tr', {}, [el('th', {}, 'Opération'), el('th', { class: 'num' }, 'Occurrences')])]),
            el('tbody', {}, rows.map(([key, count]) =>
              el('tr', {}, [
                el('td', {}, OPERATION_LABELS[key] || key),
                el('td', { class: 'num' }, num(count)),
              ]))),
          ]),
        ])
      : el('p', { class: 'discret' }, 'Aucune modification appliquée : augmentez l’intensité ou activez davantage d’opérations.'),
  );

  const before = result.stats.before;
  const after = result.stats.after;
  const metrics = [
    ['Nombre de mots', before.words, after.words],
    ['Phrases', before.sentences, after.sentences],
    ['Longueur moyenne des phrases', before.avgSentenceLength, after.avgSentenceLength],
    ['Variabilité du rythme', before.burstiness, after.burstiness],
    ['Richesse lexicale', before.typeTokenRatio, after.typeTokenRatio],
    ['Lisibilité (Flesch adapté)', before.readability, after.readability],
  ];
  const comparison = $('#comparatif-style');
  clear(comparison);
  comparison.append(
    el('h3', {}, 'Indicateurs de style'),
    el('div', { class: 'tableau-defilant' }, [
      el('table', {}, [
        el('thead', {}, [
          el('tr', {}, [el('th', {}, 'Indicateur'), el('th', { class: 'num' }, 'Avant'), el('th', { class: 'num' }, 'Après')]),
        ]),
        el('tbody', {}, metrics.map(([label, a, b]) =>
          el('tr', {}, [
            el('td', {}, label),
            el('td', { class: 'num' }, String(a)),
            el('td', { class: 'num' }, String(b)),
          ]))),
      ]),
    ]),
  );

  const diff = $('#diff');
  clear(diff);
  for (const change of result.changes.slice(0, 80)) {
    const bloc = el('div', { class: 'diff__bloc' });
    for (const part of wordDiff(change.before, change.after)) {
      if (part.type === 'egal') bloc.append(document.createTextNode(part.text));
      else if (part.type === 'retire') bloc.append(el('del', {}, part.text));
      else bloc.append(el('ins', {}, part.text));
    }
    diff.append(bloc);
  }
  if (result.changes.length > 80) {
    diff.append(
      el('p', { class: 'discret' }, `${result.changes.length - 80} paragraphe(s) modifié(s) supplémentaire(s) non affiché(s).`),
    );
  }
}

/* ------------------------------------------------------------------ *
 * Panneau « Réglages »
 * ------------------------------------------------------------------ */

const GROUP_LABELS = {
  ouvert: 'Bases ouvertes — sans clé',
  academique: 'Bases académiques — sans clé',
  moteur: 'Moteurs web — clé personnelle requise',
};

function setupSettings() {
  const host = $('#liste-fournisseurs');
  clear(host);

  let lastGroup = '';
  for (const provider of PROVIDERS) {
    if (provider.group !== lastGroup) {
      lastGroup = provider.group;
      host.append(el('h3', {}, GROUP_LABELS[provider.group] || provider.group));
    }
    host.append(providerCard(provider));
  }

  const readers = $('#liste-lecteurs');
  clear(readers);
  for (const reader of READERS) {
    readers.append(
      el('label', {}, [
        el('input', {
          type: 'radio',
          name: 'lecteur',
          value: reader.id,
          checked: state.settings.reader === reader.id,
          onchange: () => {
            state.settings.reader = reader.id;
            $('#champ-relais').hidden = reader.id !== 'relais';
            persist();
          },
        }),
        el('span', {}, [el('strong', {}, reader.name), el('br'), el('span', { class: 'discret' }, reader.description)]),
      ]),
    );
  }
  $('#champ-relais').hidden = state.settings.reader !== 'relais';
  bindText('#relais-lecteur', () => state.settings.keys.readerProxy, (v) => {
    state.settings.keys.readerProxy = v;
  });

  bindNumber('#concurrence', 'concurrency');
  bindNumber('#resultats-par-requete', 'resultsPerQuery');
  bindText('#email-contact', () => state.settings.contactEmail, (v) => {
    state.settings.contactEmail = v;
  });

  bindCheckbox('#exclure-citations', 'excludeQuotes');
  bindCheckbox('#exclure-biblio', 'excludeBibliography');
  bindCheckbox('#inclure-notes', 'includeNotes');
  bindCheckbox('#inclure-entetes', 'includeHeadersFooters');
  bindCheckbox('#detecter-interne', 'detectInternalDuplication');
  bindCheckbox('#cache-actif', 'cacheEnabled');

  $('#btn-vider-cache').addEventListener('click', async () => {
    await clearStore('cache');
    notify('Cache des sources vidé.', 'succes');
    refreshStorageUsage();
  });

  $('#btn-tout-effacer').addEventListener('click', async () => {
    if (!confirm('Effacer les réglages, les clés d’API, le cache et l’historique enregistrés dans ce navigateur ?')) {
      return;
    }
    await eraseEverything();
    state.settings = { ...DEFAULT_SETTINGS, keys: { ...DEFAULT_SETTINGS.keys } };
    notify('Toutes les données locales ont été effacées.', 'succes');
    location.reload();
  });

  refreshStorageUsage();
}

/** Carte de configuration d'un fournisseur. */
function providerCard(provider) {
  const enabled = (state.settings.providers || []).includes(provider.id);
  const status = el('p', { class: 'fournisseur__etat discret' }, '');

  const toggle = el('input', {
    type: 'checkbox',
    checked: enabled,
    onchange: (event) => {
      const list = new Set(state.settings.providers || []);
      if (event.target.checked) list.add(provider.id);
      else list.delete(provider.id);
      state.settings.providers = [...list];
      persist();
      updateAnalysisSummary();
    },
  });

  const testButton = el(
    'button',
    {
      type: 'button',
      class: 'bouton bouton--discret',
      onclick: async () => {
        testButton.disabled = true;
        status.textContent = 'Test en cours…';
        status.className = 'fournisseur__etat discret';
        const context = createProviderContext({
          queue: new RequestQueue({ concurrency: 1, minIntervalMs: 0 }),
          cache: new ResponseCache({ enabled: false }),
          settings: state.settings,
          resultsPerQuery: 3,
        });
        const result = await testProvider(provider, context);
        status.textContent = result.message;
        status.className = `fournisseur__etat ${result.ok ? 'etiquette etiquette--succes' : 'etiquette etiquette--danger'}`;
        testButton.disabled = false;
      },
    },
    'Tester',
  );

  const card = el('div', { class: 'fournisseur' }, [
    el('div', { class: 'fournisseur__entete' }, [
      el('label', {}, [toggle, provider.name]),
      testButton,
    ]),
    el('p', { class: 'discret', style: { margin: '6px 0 0' } }, provider.description || ''),
  ]);

  if (provider.keyFields?.length) {
    const fields = el('div', { class: 'fournisseur__cles' });
    for (const field of provider.keyFields) {
      fields.append(
        el('label', { class: 'champ' }, [
          el('span', {}, field.label),
          el('input', {
            type: field.key.toLowerCase().includes('url') || field.key.toLowerCase().includes('endpoint')
              ? 'text'
              : 'password',
            value: state.settings.keys[field.key] || '',
            placeholder: field.placeholder || '',
            autocomplete: 'off',
            spellcheck: false,
            oninput: (event) => {
              state.settings.keys[field.key] = event.target.value.trim();
              persist();
              updateAnalysisSummary();
            },
          }),
        ]),
      );
    }
    card.append(fields);
  }

  if (provider.docUrl) {
    card.append(
      el('p', { class: 'discret', style: { margin: '8px 0 0' } }, [
        'Documentation : ',
        el('a', { href: provider.docUrl, target: '_blank', rel: 'noopener noreferrer' }, provider.docUrl),
      ]),
    );
  }
  card.append(status);
  return card;
}

function bindCheckbox(selector, key) {
  const input = $(selector);
  if (!input) return;
  input.checked = state.settings[key] !== false;
  input.addEventListener('change', () => {
    state.settings[key] = input.checked;
    persist();
  });
}

function bindNumber(selector, key) {
  const input = $(selector);
  if (!input) return;
  input.value = String(state.settings[key] ?? '');
  input.addEventListener('change', () => {
    const value = Number(input.value);
    if (Number.isFinite(value)) {
      state.settings[key] = value;
      persist();
      updateAnalysisSummary();
    }
  });
}

function bindText(selector, get, set) {
  const input = $(selector);
  if (!input) return;
  input.value = get() || '';
  input.addEventListener('input', () => {
    set(input.value.trim());
    persist();
  });
}

async function refreshStorageUsage() {
  const node = $('#usage-stockage');
  const usage = await storageUsage();
  node.textContent = usage
    ? `Espace utilisé par l'application : ${bytes(usage.usage)} sur ${bytes(usage.quota)} disponibles.`
    : "Ce navigateur n'indique pas l'espace utilisé.";
}

/* ------------------------------------------------------------------ *
 * Démarrage
 * ------------------------------------------------------------------ */

async function start() {
  try {
    state.settings = await loadSettings();
  } catch {
    state.settings = { ...DEFAULT_SETTINGS, keys: { ...DEFAULT_SETTINGS.keys } };
  }

  setupTheme();
  setupTabs();
  setupDropZone();
  setupCorpus();
  setupProfiles();
  setupAnalysis();
  setupHumanize();
  setupSettings();
  updateAnalysisSummary();
  updateSourceStats();

  window.addEventListener('beforeunload', (event) => {
    if (state.analyzing) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}

start();
