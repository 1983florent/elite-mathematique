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
import { renderReportHtml, buildReportDocx, reportToJson, reportToCsv, summarize } from './core/report.js';
import { DocxBuilder } from './core/docx-writer.js';
import { HUMANIZE_DEFAULTS, OPERATION_LABELS, wordDiff } from './core/humanizer.js';
import { userMessage } from './core/errors.js';
import { compareTexts, createFingerprint, validateFingerprint } from './core/compare.js';
import { decloakText } from './core/forensics.js';
import { setupPwa } from './ui/pwa.js';
import { BRAND } from './core/branding.js';
import {
  t,
  setLanguage,
  detectLanguage,
  availableLanguages,
  onLanguageChange,
  applyDom,
} from './core/i18n.js';
import { hasAccess, consumeTrial, getEntitlement } from './core/license.js';
import { showPaywall, renderEntitlementBadge } from './ui/paywall.js';
import {
  buildCertificate,
  renderCertificateHtml,
  verifyCertificate,
  CERT_STRINGS,
} from './core/certificate.js';
import { put as storePut, all as storeAll, remove as storeRemove, clear as storeClear } from './core/store.js';

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
  /** @type {{name: string, fp: any}[]} */
  fingerprints: [],
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

const TABS = ['analyse', 'humanisation', 'outils', 'reglages', 'aide'];

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

  const empreintes = $('#fichiers-empreintes');
  empreintes.addEventListener('change', async () => {
    for (const file of [...(empreintes.files || [])]) {
      try {
        const data = JSON.parse(await file.text());
        const check = validateFingerprint(data);
        if (!check.ok) {
          notify(`${file.name} : ${check.error}`, 'erreur');
          continue;
        }
        state.fingerprints.push({ name: data.name || file.name, fp: data });
      } catch {
        notify(`${file.name} : fichier JSON illisible.`, 'erreur');
      }
    }
    empreintes.value = '';
    renderFingerprints();
    updateAnalysisSummary();
  });
}

function renderFingerprints() {
  const list = $('#liste-empreintes');
  clear(list);
  state.fingerprints.forEach((entry, index) => {
    list.append(
      el('li', {}, [
        el('span', {}, `${entry.name} — ${num(entry.fp.hashes.length)} signatures`),
        el('button', {
          type: 'button',
          class: 'bouton bouton--discret',
          onclick: () => {
            state.fingerprints.splice(index, 1);
            renderFingerprints();
            updateAnalysisSummary();
          },
        }, 'Retirer'),
      ]),
    );
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

  // Mur d'accès : une analyse d'essai gratuite, puis abonnement requis.
  if (!(await hasAccess())) {
    showPaywall({ onUnlocked: () => { refreshEntitlementBadge(); runAnalysis(); } });
    return;
  }

  state.analyzing = true;
  $('#btn-analyser').disabled = true;
  $('#btn-annuler').hidden = false;
  $('#carte-progression').hidden = false;
  $('#resultats').hidden = true;
  const journal = $('#journal');
  clear(journal);
  setProgress(0, 'Préparation…');

  const input = state.prepared
    ? {
        prepared: state.prepared,
        file: state.file,
        name: state.file?.name,
        corpus: state.corpus,
        fingerprints: state.fingerprints,
      }
    : {
        text: pasted,
        name: 'Texte collé',
        corpus: state.corpus,
        fingerprints: state.fingerprints,
      };

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
    // Décompter une analyse d'essai (sans effet si un abonnement est actif).
    await consumeTrial();
    refreshEntitlementBadge();
    saveToHistory(report);
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
    if (format === 'csv') {
      download(reportToCsv(report), `passages-${base}.csv`, 'text/csv;charset=utf-8');
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
      return;
    }
    if (format === 'certificate' || format === 'certificate-print') {
      notify(t('cert.building'));
      const plan = (await getEntitlement()).plan || null;
      const cert = await buildCertificate(report, { plan, sign: true });
      const html = renderCertificateHtml(cert, { strings: certificateStrings() });
      // On conserve le certificat scellé dans l'historique local.
      try {
        await storePut('certificats', { id: cert.certId, ...cert });
      } catch {
        /* stockage optionnel */
      }
      if (format === 'certificate-print') {
        const win = window.open('', '_blank');
        if (!win) {
          notify("Le navigateur a bloqué l'ouverture de la fenêtre.", 'erreur');
          return;
        }
        win.document.write(html);
        win.document.close();
        win.addEventListener('load', () => win.print(), { once: true });
        setTimeout(() => {
          try {
            if (win.document.readyState === 'complete') win.print();
          } catch {
            /* fenêtre déjà fermée */
          }
        }, 700);
      } else {
        download(html, `certificat-${base}.html`, 'text/html;charset=utf-8');
        download(JSON.stringify(cert, null, 2), `certificat-${base}.json`, 'application/json');
      }
      notify(t('cert.ready'), 'succes');
      return;
    }
  } catch (err) {
    notify(`Export impossible : ${userMessage(err)}`, 'erreur');
  }
}

/**
 * Traduit les libellés du certificat via i18n, avec repli sur les libellés FR
 * embarqués dans le module `certificate`.
 * @returns {Record<string,string>}
 */
function certificateStrings() {
  const out = {};
  for (const key of Object.keys(CERT_STRINGS)) {
    const translated = t('cert.doc.' + key);
    out[key] = translated === 'cert.doc.' + key ? CERT_STRINGS[key] : translated;
  }
  return out;
}

/**
 * Affiche le verdict de vérification d'un certificat.
 * @param {HTMLElement} box
 * @param {{valid:boolean, reason?:string, signed:boolean, attestation?:any, cert?:any}} res
 */
function renderCertVerdict(box, res) {
  clear(box);
  if (res.valid) {
    box.className = 'cert-resultat cert-resultat--ok';
    const a = res.attestation;
    const orig = a?.results?.originalityScore;
    box.append(
      el('p', { class: 'cert-resultat__titre' },
        (res.signed ? '✔ ' : '● ') + t(res.signed ? 'cert.verify.validSigned' : 'cert.verify.validSealed')),
      el('dl', { class: 'cert-resultat__details' }, [
        el('dt', {}, t('cert.doc.rowDocument')), el('dd', {}, a?.document?.name || '—'),
        el('dt', {}, 'Certificat'), el('dd', {}, res.cert?.certId || '—'),
        el('dt', {}, t('cert.doc.originality')), el('dd', {}, orig != null ? orig + ' %' : '—'),
        el('dt', {}, 'Code'), el('dd', {}, res.cert?.code || '—'),
      ]),
    );
  } else {
    box.className = 'cert-resultat cert-resultat--erreur';
    const reasons = {
      format: t('cert.verify.badFormat'),
      seal: t('cert.verify.badSeal'),
      signature: t('cert.verify.badSignature'),
    };
    box.append(
      el('p', { class: 'cert-resultat__titre' }, '✖ ' + t('cert.verify.invalid')),
      el('p', {}, reasons[res.reason] || res.reason || ''),
    );
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
  bindCheckbox('#analyse-forensique', 'forensics');
  bindCheckbox('#analyse-ia', 'detectAI');
  bindCheckbox('#analyse-citations', 'checkCitations');
  bindSelect('#sensibilite', 'sensitivity');

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

function bindSelect(selector, key) {
  const input = $(selector);
  if (!input) return;
  if (state.settings[key]) input.value = state.settings[key];
  input.addEventListener('change', () => {
    state.settings[key] = input.value;
    persist();
    updateAnalysisSummary();
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
 * Panneau « Outils »
 * ------------------------------------------------------------------ */

function setupTools() {
  // Comparaison de deux documents.
  $('#btn-comparer').addEventListener('click', async () => {
    const button = $('#btn-comparer');
    button.disabled = true;
    button.textContent = 'Comparaison…';
    try {
      const textA = await toolText('#compare-a', '#compare-a-texte');
      const textB = await toolText('#compare-b', '#compare-b-texte');
      if (!textA.trim() || !textB.trim()) {
        notify('Fournissez les deux documents à comparer.', 'erreur');
        return;
      }
      renderComparison(compareTexts(textA, textB));
    } catch (err) {
      notify(`Comparaison impossible : ${userMessage(err)}`, 'erreur');
    } finally {
      button.disabled = false;
      button.textContent = 'Comparer';
    }
  });

  // Création d'empreinte.
  $('#btn-creer-empreinte').addEventListener('click', async () => {
    try {
      const text = await toolText('#empreinte-fichier', '#empreinte-texte');
      if (!text.trim()) {
        notify('Fournissez le texte source de l’empreinte.', 'erreur');
        return;
      }
      const nom = $('#empreinte-nom').value.trim() || 'source';
      const fp = createFingerprint(nom, text);
      download(JSON.stringify(fp), `empreinte-${slug(nom)}.json`, 'application/json');
      $('#etat-empreinte').textContent =
        `Empreinte créée : ${num(fp.hashes.length)} signatures pour ${num(fp.words)} mots. ` +
        `Le texte source n’y figure pas et ne peut pas en être reconstitué.`;
    } catch (err) {
      notify(`Création impossible : ${userMessage(err)}`, 'erreur');
    }
  });

  // Décamouflage.
  $('#btn-decloak').addEventListener('click', () => {
    const source = $('#decloak-source').value;
    if (!source.trim()) return;
    const cleaned = decloakText(source);
    $('#decloak-resultat').value = cleaned;
    $('#btn-decloak-copier').disabled = !cleaned;
    const removed = [...source].length - [...cleaned].length;
    const changed = countDifferences(source, cleaned);
    $('#etat-decloak').textContent = changed
      ? `${changed} caractère(s) suspect(s) traité(s), ${removed} supprimé(s).`
      : 'Aucun caractère suspect trouvé : le texte est déjà propre.';
  });
  $('#btn-decloak-copier').addEventListener('click', async () => {
    const ok = await copyToClipboard($('#decloak-resultat').value);
    notify(ok ? 'Texte copié.' : 'Copie impossible.', ok ? 'succes' : 'erreur');
  });

  // Vérification d'un certificat d'originalité.
  const certFile = $('#cert-fichier');
  if (certFile) {
    certFile.addEventListener('change', async () => {
      const f = certFile.files?.[0];
      if (!f) return;
      try {
        $('#cert-source').value = await f.text();
      } catch {
        notify('Lecture du fichier impossible.', 'erreur');
      }
    });
  }
  const btnCert = $('#btn-verifier-cert');
  if (btnCert) {
    btnCert.addEventListener('click', async () => {
      const raw = $('#cert-source').value.trim();
      const box = $('#cert-resultat');
      box.hidden = false;
      if (!raw) {
        box.className = 'cert-resultat cert-resultat--erreur';
        box.textContent = t('cert.verify.empty');
        return;
      }
      const res = await verifyCertificate(raw);
      renderCertVerdict(box, res);
    });
  }

  $('#btn-vider-historique').addEventListener('click', async () => {
    if (!confirm('Effacer tout l’historique des analyses de ce navigateur ?')) return;
    await storeClear('reports');
    renderHistory();
    notify('Historique vidé.', 'succes');
  });

  renderHistory();
}

/** Récupère le texte d'un couple (fichier, zone de texte). */
async function toolText(fileSelector, textSelector) {
  const file = $(fileSelector).files?.[0];
  if (file) return readAnyText(file);
  return $(textSelector).value;
}

/** Compte les positions où deux chaînes diffèrent (approximation). */
function countDifferences(a, b) {
  const ca = [...a];
  const cb = [...b];
  let diff = Math.abs(ca.length - cb.length);
  for (let i = 0; i < Math.min(ca.length, cb.length); i++) {
    if (ca[i] !== cb[i]) diff++;
  }
  return diff;
}

/** Rend le résultat d'une comparaison de documents. */
function renderComparison(result) {
  const host = $('#resultat-comparaison');
  clear(host);

  host.append(
    el('div', { class: 'alerte alerte--info', style: { marginTop: '16px' } }, [
      el('strong', {}, `${result.verdict.label}. `),
      `Le document A est couvert à ${result.coverageA} % par B, et B à ${result.coverageB} % par A. ` +
        `Similarité lexicale globale : ${result.lexicalSimilarity} %.`,
    ]),
  );

  if (!result.passages.length) {
    host.append(el('p', { class: 'discret' }, 'Aucun passage commun significatif.'));
    return;
  }

  host.append(el('h3', {}, `Passages communs (${result.passages.length})`));
  for (const p of result.passages.slice(0, 40)) {
    host.append(
      el('article', { class: 'passage' }, [
        el('div', { class: 'passage__meta' }, [
          el('span', { class: 'pastille-type', style: { background: 'var(--fond-doux)' } }, p.typeLabel),
          el('span', {}, `${Math.round(p.similarity * 100)} %`),
          el('span', {}, `${p.words} mots`),
        ]),
        el('div', { class: 'passage__cotes' }, [
          el('div', {}, [el('h4', {}, 'Document A'), p.aText.slice(0, 800)]),
          el('div', {}, [el('h4', {}, 'Document B'), p.bText.slice(0, 800)]),
        ]),
      ]),
    );
  }
}

/** @param {string} s */
function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'source';
}

/* ------------------------------------------------------------------ *
 * Historique
 * ------------------------------------------------------------------ */

async function saveToHistory(report) {
  try {
    const entry = summarize(report);
    // On conserve le rapport complet, mais borné en taille.
    const json = reportToJson(report, { includeText: true });
    await storePut('reports', report.id, { summary: entry, report: json });
    renderHistory();
  } catch {
    /* l'historique est un confort, pas un impératif */
  }
}

async function renderHistory() {
  const host = $('#liste-historique');
  if (!host) return;
  clear(host);
  let rows = [];
  try {
    rows = await storeAll('reports');
  } catch {
    rows = [];
  }
  if (!rows.length) {
    host.append(el('p', { class: 'discret' }, 'Aucune analyse enregistrée pour le moment.'));
    return;
  }
  rows.sort((a, b) => (b.value?.summary?.generatedAt || '').localeCompare(a.value?.summary?.generatedAt || ''));

  const table = el('div', { class: 'tableau-defilant' }, [
    el('table', {}, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', {}, 'Date'),
          el('th', {}, 'Document'),
          el('th', { class: 'num' }, 'Taux net'),
          el('th', { class: 'num' }, 'IA'),
          el('th', {}, ''),
        ]),
      ]),
      el('tbody', {}, rows.slice(0, 40).map((row) => {
        const s = row.value?.summary || {};
        return el('tr', {}, [
          el('td', { class: 'discret' }, s.generatedAt ? new Date(s.generatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'),
          el('td', {}, [
            el('a', {
              href: '#',
              onclick: (e) => {
                e.preventDefault();
                reopenReport(row.value?.report);
              },
            }, s.name || 'document'),
          ]),
          el('td', { class: 'num' }, s.tauxNet != null ? `${s.tauxNet} %` : '—'),
          el('td', { class: 'num' }, s.aiScore != null ? `${s.aiScore}` : '—'),
          el('td', {}, [
            el('button', {
              type: 'button',
              class: 'bouton bouton--discret',
              onclick: () => removeHistory(row.key),
            }, 'Suppr.'),
          ]),
        ]);
      })),
    ]),
  ]);
  host.append(table);
}

async function removeHistory(key) {
  await storeRemove('reports', key);
  renderHistory();
}

function reopenReport(json) {
  if (!json) {
    notify('Ce rapport ne contient pas assez de données pour être rouvert.', 'erreur');
    return;
  }
  try {
    const report = JSON.parse(json);
    state.report = report;
    renderResults($('#resultats'), report, {
      onExport: exportReport,
      onHumanize: () => {
        $('#texte-source').value = report.text || '';
        updateSourceStats();
        showTab('humanisation');
      },
    });
    showTab('analyse');
    $('#resultats').hidden = false;
  } catch {
    notify('Rapport illisible.', 'erreur');
  }
}

/* ------------------------------------------------------------------ *
 * Langues (internationalisation)
 * ------------------------------------------------------------------ */

function setupI18n() {
  // Nom de marque centralisé.
  const marque = $('#marque-nom');
  if (marque) marque.textContent = BRAND.name;

  // Langue de départ : préférence enregistrée, sinon langue de la machine.
  const lang = detectLanguage(state.settings.language);

  const select = $('#selecteur-langue');
  if (select) {
    clear(select);
    for (const l of availableLanguages()) {
      select.append(
        el('option', { value: l.code, selected: l.code === lang }, l.name),
      );
    }
    select.addEventListener('change', () => {
      state.settings.language = select.value;
      persist();
      setLanguage(select.value);
    });
  }

  // Applique la langue (traduit le DOM, gère l'écriture droite-à-gauche).
  setLanguage(lang);

  // À chaque changement de langue, rafraîchir les éléments dynamiques.
  onLanguageChange(() => {
    updateAnalysisSummary();
    refreshEntitlementBadge();
  });

  refreshEntitlementBadge();
}

function refreshEntitlementBadge() {
  renderEntitlementBadge($('#badge-abonnement')).catch(() => {});
}

/* ------------------------------------------------------------------ *
 * Installation (PWA)
 * ------------------------------------------------------------------ */

function setupInstall() {
  const button = $('#btn-installer');
  const pwa = setupPwa({
    notify,
    onInstallable: (show) => {
      if (button) button.hidden = !show;
    },
  });
  button?.addEventListener('click', () => pwa.promptInstall());
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
  setupI18n();
  setupProfiles();
  setupAnalysis();
  setupHumanize();
  setupTools();
  setupSettings();
  setupInstall();
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
