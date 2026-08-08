/**
 * Construction du rapport de plagiat : segmentation colorée du texte, rendu
 * HTML autonome, export Word et export JSON.
 *
 * @module core/report
 */

import { DocxBuilder } from './docx-writer.js';
import { BRAND } from './branding.js';

/** Palette et libellés associés aux types de correspondance. */
export const MATCH_STYLES = {
  identique: {
    label: 'Copie littérale',
    background: '#fde2e1',
    border: '#c0392b',
    docxShade: 'FDE2E1',
    docxColor: 'C0392B',
  },
  modifie: {
    label: 'Copie légèrement modifiée',
    background: '#fdf0d5',
    border: '#d68910',
    docxShade: 'FDF0D5',
    docxColor: 'B9770E',
  },
  paraphrase: {
    label: 'Paraphrase probable',
    background: '#e3f0fb',
    border: '#2471a3',
    docxShade: 'E3F0FB',
    docxColor: '1F618D',
  },
  interne: {
    label: 'Répétition interne',
    background: '#efe3fb',
    border: '#7d3c98',
    docxShade: 'EFE3FB',
    docxColor: '6C3483',
  },
};

const TYPE_PRIORITY = { identique: 3, modifie: 2, paraphrase: 1, interne: 1 };

/**
 * @typedef {Object} Segment
 * @property {string} text
 * @property {string|null} type
 * @property {string|null} sourceKey
 * @property {number} start
 * @property {number} end
 */

/**
 * Découpe le texte du document en segments, chaque caractère étant attribué au
 * passage le plus « grave » qui le recouvre.
 *
 * @param {string} text
 * @param {{charStart: number, charEnd: number, type: string, similarity: number, sourceKey: string}[]} passages
 * @param {{maxChars?: number}} [options]
 * @returns {{segments: Segment[], truncated: boolean}}
 */
export function buildSegments(text, passages, options = {}) {
  const maxChars = options.maxChars ?? Infinity;
  const limit = Math.min(text.length, maxChars);
  const truncated = limit < text.length;

  if (!passages.length) {
    return {
      segments: limit ? [{ text: text.slice(0, limit), type: null, sourceKey: null, start: 0, end: limit }] : [],
      truncated,
    };
  }

  // `owner` retient l'indice du passage gagnant pour chaque caractère.
  const owner = new Int32Array(limit).fill(-1);
  const strength = new Float32Array(limit);
  passages.forEach((p, index) => {
    const start = Math.max(0, Math.min(limit, p.charStart | 0));
    const end = Math.max(0, Math.min(limit, p.charEnd | 0));
    const score = (TYPE_PRIORITY[p.type] || 1) + (p.similarity || 0);
    for (let i = start; i < end; i++) {
      if (score > strength[i]) {
        strength[i] = score;
        owner[i] = index;
      }
    }
  });

  /** @type {Segment[]} */
  const segments = [];
  let cursor = 0;
  for (let i = 1; i <= limit; i++) {
    if (i === limit || owner[i] !== owner[cursor]) {
      const index = owner[cursor];
      segments.push({
        text: text.slice(cursor, i),
        type: index >= 0 ? passages[index].type : null,
        sourceKey: index >= 0 ? passages[index].sourceKey : null,
        start: cursor,
        end: i,
      });
      cursor = i;
    }
  }
  return { segments, truncated };
}

/** Échappe le texte destiné à du HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Formate une durée en minutes et secondes. */
export function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s`;
}

/** Formate une date ISO en français. */
export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/** Nom d'hôte lisible d'une URL. */
export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Jauge circulaire en SVG.
 * @param {number} percent
 * @param {string} color
 * @param {string} label
 */
export function gaugeSvg(percent, color, label) {
  const value = Math.max(0, Math.min(100, percent));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  return `<svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="${escapeHtml(
    label,
  )} : ${value} %">
  <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#e6e9f2" stroke-width="14"/>
  <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${color}" stroke-width="14"
          stroke-linecap="round" stroke-dasharray="${filled.toFixed(1)} ${circumference.toFixed(1)}"
          transform="rotate(-90 80 80)"/>
  <text x="80" y="76" text-anchor="middle" font-size="34" font-weight="700" fill="${color}">${value}</text>
  <text x="80" y="100" text-anchor="middle" font-size="15" fill="#5a6480">%</text>
</svg>`;
}

/** Barre de répartition des types de correspondance. */
export function distributionBar(repartition) {
  const parts = [
    ['identique', repartition.identique],
    ['modifie', repartition.modifie],
    ['paraphrase', repartition.paraphrase],
  ].filter(([, value]) => value > 0);
  const original = Math.max(0, repartition.original);

  const cells = parts
    .map(
      ([type, value]) =>
        `<span class="bar-part" style="width:${value}%;background:${MATCH_STYLES[type].border}" title="${MATCH_STYLES[type].label} : ${value} %"></span>`,
    )
    .join('');
  return `<div class="bar">${cells}<span class="bar-part" style="width:${original}%;background:#dfe4ee" title="Contenu original : ${original} %"></span></div>`;
}

/* ------------------------------------------------------------------ *
 * Rendu HTML autonome
 * ------------------------------------------------------------------ */

const REPORT_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin:0; font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:#1c2233; background:#f5f6fa; line-height:1.6; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 32px 24px 64px; }
header.report { background:#1e2a78; color:#fff; padding:32px 24px; }
header.report .wrap { padding: 0; }
header.report h1 { margin:0 0 6px; font-size:1.6rem; }
header.report p { margin:0; opacity:.85; }
.card { background:#fff; border:1px solid #e3e7f0; border-radius:14px; padding:22px; margin-top:20px; }
.card h2 { margin:0 0 14px; font-size:1.18rem; color:#1e2a78; }
.card h3 { margin:22px 0 8px; font-size:1rem; color:#33417f; }
.summary { display:flex; gap:26px; align-items:center; flex-wrap:wrap; }
.summary .figures { flex:1 1 320px; min-width:260px; }
.kpi { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-top:12px; }
.kpi div { background:#f7f8fc; border:1px solid #e8ecf5; border-radius:10px; padding:10px 12px; }
.kpi span { display:block; font-size:.78rem; color:#5a6480; text-transform:uppercase; letter-spacing:.03em; }
.kpi strong { font-size:1.25rem; }
.bar { display:flex; height:16px; border-radius:8px; overflow:hidden; background:#dfe4ee; margin:12px 0 6px; }
.bar-part { display:block; height:100%; }
.legend { display:flex; gap:16px; flex-wrap:wrap; font-size:.85rem; color:#4a5570; }
.legend span.swatch { display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:6px; vertical-align:-1px; }
table { width:100%; border-collapse:collapse; font-size:.92rem; }
th, td { text-align:left; padding:9px 10px; border-bottom:1px solid #eceff6; vertical-align:top; }
th { background:#f2f4fb; color:#33417f; font-weight:600; position:sticky; top:0; }
td.num, th.num { text-align:right; white-space:nowrap; }
a { color:#1155cc; }
.doc-text { white-space:pre-wrap; font-size:.95rem; background:#fff; border:1px solid #e8ecf5; border-radius:10px; padding:18px; max-height:70vh; overflow:auto; }
mark { padding:1px 2px; border-radius:3px; border-bottom:2px solid; }
.passage { border:1px solid #e8ecf5; border-radius:10px; padding:14px; margin-bottom:14px; }
.passage .meta { font-size:.82rem; color:#5a6480; margin-bottom:8px; display:flex; gap:12px; flex-wrap:wrap; }
.passage .side { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.passage .side > div { background:#fafbfe; border:1px solid #eef1f8; border-radius:8px; padding:10px; font-size:.9rem; }
.passage .side h4 { margin:0 0 6px; font-size:.78rem; text-transform:uppercase; letter-spacing:.04em; color:#5a6480; }
.pill { display:inline-block; padding:2px 9px; border-radius:999px; font-size:.76rem; font-weight:600; }
.muted { color:#5a6480; font-size:.88rem; }
.warn { background:#fff8e6; border:1px solid #f2dfa7; border-radius:10px; padding:12px 14px; margin-top:10px; font-size:.9rem; }
.err { background:#fdeceb; border:1px solid #f3c4c0; border-radius:10px; padding:12px 14px; margin-top:10px; font-size:.9rem; }
footer.report { text-align:center; color:#5a6480; font-size:.82rem; padding:26px 16px 40px; }
@media (max-width:720px) { .passage .side { grid-template-columns:1fr; } }
@media print {
  body { background:#fff; }
  .card { break-inside: avoid; border-color:#ccc; }
  .doc-text { max-height:none; overflow:visible; }
  header.report { background:#1e2a78 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  mark { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
}
`;

/**
 * Produit un rapport HTML complet et autonome (aucune ressource externe).
 *
 * @param {any} report
 * @param {{maxAnnotatedChars?: number}} [options]
 * @returns {string}
 */
export function renderReportHtml(report, options = {}) {
  const maxAnnotated = options.maxAnnotatedChars ?? 300_000;
  const { scores, document: doc, analysis } = report;
  const { segments, truncated } = buildSegments(report.text || '', report.passages || [], {
    maxChars: maxAnnotated,
  });

  const sourceIndex = new Map(report.sources.map((s, i) => [s.key, i + 1]));

  const annotated = segments
    .map((seg) => {
      const escaped = escapeHtml(seg.text);
      if (!seg.type) return escaped;
      const style = MATCH_STYLES[seg.type] || MATCH_STYLES.paraphrase;
      const rank = sourceIndex.get(seg.sourceKey);
      return `<mark style="background:${style.background};border-color:${style.border}" title="${escapeHtml(
        style.label,
      )}${rank ? ` — source n° ${rank}` : ''}">${escaped}</mark>`;
    })
    .join('');

  const legend = Object.entries(MATCH_STYLES)
    .filter(([key]) => key !== 'interne' || (report.internal || []).length)
    .map(
      ([, style]) =>
        `<span><span class="swatch" style="background:${style.background};outline:1px solid ${style.border}"></span>${style.label}</span>`,
    )
    .join('');

  const sourcesRows = report.sources
    .map((source, i) => {
      const domain = domainOf(source.url);
      const link = source.url
        ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            source.title || source.url,
          )}</a>`
        : escapeHtml(source.title || '—');
      return `<tr>
      <td class="num">${i + 1}</td>
      <td>${link}${domain ? `<div class="muted">${escapeHtml(domain)}</div>` : ''}</td>
      <td>${escapeHtml(source.providerName || source.provider || '')}</td>
      <td class="num">${source.percent?.toFixed?.(1) ?? source.percent} %</td>
      <td class="num">${source.passages.length}</td>
      <td class="num">${Math.round((source.maxSimilarity || 0) * 100)} %</td>
    </tr>`;
    })
    .join('');

  const passagesHtml = report.passages
    .slice(0, 400)
    .map((p) => {
      const style = MATCH_STYLES[p.type] || MATCH_STYLES.paraphrase;
      const source = report.sources.find((s) => s.key === p.sourceKey);
      const rank = sourceIndex.get(p.sourceKey);
      return `<article class="passage">
      <div class="meta">
        <span class="pill" style="background:${style.background};color:${style.border}">${escapeHtml(style.label)}</span>
        <span>Similarité ${Math.round(p.similarity * 100)} %</span>
        <span>${p.words} mots</span>
        <span>Source n° ${rank ?? '—'} : ${escapeHtml(source?.title || 'inconnue')}</span>
      </div>
      <div class="side">
        <div><h4>Document analysé</h4>${escapeHtml(truncateText(p.documentText, 900))}</div>
        <div><h4>Source</h4>${escapeHtml(truncateText(p.sourceText, 900))}</div>
      </div>
    </article>`;
    })
    .join('');

  const internalHtml = (report.internal || [])
    .slice(0, 60)
    .map(
      (d) => `<article class="passage">
      <div class="meta">
        <span class="pill" style="background:${MATCH_STYLES.interne.background};color:${MATCH_STYLES.interne.border}">Répétition interne</span>
        <span>${d.words} mots</span>
      </div>
      <div class="side">
        <div><h4>Première occurrence</h4>${escapeHtml(truncateText(d.aText, 600))}</div>
        <div><h4>Seconde occurrence</h4>${escapeHtml(truncateText(d.bText, 600))}</div>
      </div>
    </article>`,
    )
    .join('');

  const enginesRows = (analysis.providers || [])
    .map(
      (e) => `<tr>
      <td>${escapeHtml(e.name)}</td>
      <td class="num">${e.queries}</td>
      <td class="num">${e.results}</td>
      <td>${e.errors.length ? escapeHtml(e.errors[0]) : '—'}</td>
    </tr>`,
    )
    .join('');

  const warnings = (report.warnings || [])
    .map((w) => `<div class="warn">${escapeHtml(w)}</div>`)
    .join('');
  const errors = (report.errors || [])
    .map((e) => `<div class="err">${escapeHtml(e.message)}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rapport de plagiat — ${escapeHtml(doc.name)}</title>
<style>${REPORT_CSS}</style>
</head>
<body>
<header class="report"><div class="wrap">
  <h1>Rapport d'analyse de similitude</h1>
  <p>${escapeHtml(doc.name)} — ${formatDate(report.generatedAt)} — réf. ${escapeHtml(report.id)}</p>
</div></header>

<div class="wrap">

  <section class="card">
    <h2>Synthèse</h2>
    <div class="summary">
      ${gaugeSvg(scores.tauxNet, scores.niveau.color, 'Taux de similitude net')}
      <div class="figures">
        <p><strong style="color:${scores.niveau.color}">${escapeHtml(scores.niveau.label)}</strong> —
        ${scores.tauxNet} % du texte analysé correspond à des sources identifiées
        (${scores.tauxBrut} % avant exclusion des citations et de la bibliographie).</p>
        ${distributionBar(scores.repartition)}
        <div class="legend">${legend}<span><span class="swatch" style="background:#dfe4ee"></span>Contenu original</span></div>
        <div class="kpi">
          <div><span>Originalité</span><strong>${scores.originalite} %</strong></div>
          <div><span>Mots analysés</span><strong>${scores.motsAnalyses.toLocaleString('fr-FR')}</strong></div>
          <div><span>Sources retenues</span><strong>${scores.sourcesTotal}</strong></div>
          <div><span>Passages détectés</span><strong>${scores.passagesTotal}</strong></div>
        </div>
      </div>
    </div>
    ${warnings}${errors}
  </section>

  <section class="card">
    <h2>Document analysé</h2>
    <table>
      <tbody>
        <tr><th>Fichier</th><td>${escapeHtml(doc.name)}</td></tr>
        ${doc.meta.title ? `<tr><th>Titre</th><td>${escapeHtml(doc.meta.title)}</td></tr>` : ''}
        ${doc.meta.creator ? `<tr><th>Auteur déclaré</th><td>${escapeHtml(doc.meta.creator)}</td></tr>` : ''}
        <tr><th>Volume</th><td>${doc.stats.words.toLocaleString('fr-FR')} mots · ${doc.stats.characters.toLocaleString('fr-FR')} caractères · ${doc.stats.pages} page(s)${doc.stats.pagesEstimated ? ' (estimé)' : ''}</td></tr>
        <tr><th>Langue détectée</th><td>${escapeHtml(languageLabel(doc.language))}</td></tr>
        ${doc.digest ? `<tr><th>Empreinte SHA-256</th><td style="word-break:break-all;font-family:monospace;font-size:.8rem">${escapeHtml(doc.digest)}</td></tr>` : ''}
        <tr><th>Durée de l'analyse</th><td>${formatDuration(report.durationMs)}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>Sources identifiées</h2>
    ${
      report.sources.length
        ? `<table><thead><tr><th class="num">N°</th><th>Source</th><th>Moteur</th><th class="num">Part du document</th><th class="num">Passages</th><th class="num">Similarité max.</th></tr></thead><tbody>${sourcesRows}</tbody></table>`
        : '<p class="muted">Aucune source correspondante n’a été identifiée.</p>'
    }
  </section>

  <section class="card">
    <h2>Texte annoté</h2>
    <div class="legend" style="margin-bottom:10px">${legend}</div>
    <div class="doc-text">${annotated}</div>
    ${truncated ? '<p class="muted">Affichage limité aux premiers caractères du document ; la liste des passages ci-dessous reste complète.</p>' : ''}
  </section>

  ${
    report.passages.length
      ? `<section class="card"><h2>Détail des passages (${report.passages.length})</h2>${passagesHtml}
      ${report.passages.length > 400 ? '<p class="muted">Seuls les 400 premiers passages sont détaillés ici ; l’export JSON les contient tous.</p>' : ''}</section>`
      : ''
  }

  ${
    internalHtml
      ? `<section class="card"><h2>Répétitions internes</h2>
      <p class="muted">Passages répétés à l’identique à deux endroits éloignés du document. Ils n’entrent pas dans le taux de similitude, mais signalent souvent un copier-coller interne.</p>
      ${internalHtml}</section>`
      : ''
  }

  ${forensicsHtml(report)}
  ${aiHtml(report)}
  ${citationsHtml(report)}

  <section class="card">
    <h2>Méthodologie et paramètres</h2>
    <table>
      <tbody>
        <tr><th>Profil d'analyse</th><td>${escapeHtml(analysis.depthLabel || analysis.depth)}</td></tr>
        <tr><th>Blocs interrogés</th><td>${analysis.chunksQueried} sur ${analysis.chunksTotal} (${Math.round(analysis.samplingRatio * 100)} % du texte soumis aux moteurs)</td></tr>
        <tr><th>Requêtes réseau</th><td>${analysis.requestCount} (cache : ${analysis.cache?.ratio ?? 0} % de réutilisation)</td></tr>
        <tr><th>Sources examinées</th><td>${analysis.sourcesExamined} téléchargées, ${analysis.sourcesRetained} retenues</td></tr>
        <tr><th>Corpus local</th><td>${analysis.corpusDocuments} document(s) de référence</td></tr>
        <tr><th>Exclusions</th><td>${analysis.excludedWords.toLocaleString('fr-FR')} mots exclus${analysis.bibliography ? ' (bibliographie détectée)' : ''}${analysis.quotedRanges ? `, ${analysis.quotedRanges} citation(s)` : ''}</td></tr>
      </tbody>
    </table>
    <h3>Moteurs interrogés</h3>
    ${
      enginesRows
        ? `<table><thead><tr><th>Moteur</th><th class="num">Requêtes</th><th class="num">Résultats</th><th>Incident</th></tr></thead><tbody>${enginesRows}</tbody></table>`
        : '<p class="muted">Aucun moteur en ligne n’a été utilisé.</p>'
    }
    <h3>Comment lire ce rapport</h3>
    <p class="muted">
      Le <strong>taux brut</strong> est la part du document couverte par au moins un passage
      correspondant à une source. Le <strong>taux net</strong> retire les citations correctement
      encadrées et la bibliographie. Un taux élevé n'est pas en soi une preuve de plagiat :
      les citations référencées, les formules consacrées et les expressions techniques
      produisent légitimement des correspondances. À l'inverse, un taux nul ne garantit rien
      pour les sources absentes des bases interrogées : ${escapeHtml(
        (analysis.providers || []).map((p) => p.name).join(', ') || 'aucune',
      )}.
      Chaque passage doit être vérifié manuellement avant toute conclusion.
    </p>
  </section>

</div>
<footer class="report">Rapport produit localement par ${escapeHtml(BRAND.name)} — aucun document n'a été transmis à un serveur.</footer>
</body>
</html>`;
}

/** Section forensique du rapport HTML. */
function forensicsHtml(report) {
  const f = report.forensics;
  if (!f) return '';
  if (f.severity === 'aucun') {
    return `<section class="card"><h2>Analyse forensique</h2>
      <p class="muted">Aucun procédé de camouflage détecté : pas d'homoglyphes, de caractères invisibles ni de texte dissimulé dans le fichier.</p></section>`;
  }
  const findings = f.findings.map((x) => `<div class="${f.severity === 'alerte' ? 'err' : 'warn'}">${escapeHtml(x)}</div>`).join('');
  const mixed = f.mixedWords.length
    ? `<h3>Mots à alphabets mélangés</h3><p class="muted">${f.mixedWords
        .slice(0, 20)
        .map((w) => `« ${escapeHtml(w.word)} » → « ${escapeHtml(w.cleaned)} »`)
        .join(' · ')}</p>`
    : '';
  const hidden = f.hiddenRuns.length
    ? `<h3>Texte dissimulé dans le fichier Word</h3><table><thead><tr><th>Procédé</th><th>Contenu</th></tr></thead><tbody>${f.hiddenRuns
        .slice(0, 20)
        .map(
          (r) =>
            `<tr><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.text.slice(0, 300))}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '';
  return `<section class="card"><h2>Analyse forensique — procédés de camouflage</h2>${findings}${mixed}${hidden}</section>`;
}

/** Section « indices IA » du rapport HTML. */
function aiHtml(report) {
  const ai = report.ai;
  if (!ai) return '';
  if (!ai.indicators.length) {
    return `<section class="card"><h2>Indices de rédaction assistée par IA</h2><p class="muted">${escapeHtml(ai.disclaimer)}</p></section>`;
  }
  const rows = ai.indicators
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.label)}</td><td>${escapeHtml(i.detail)}</td><td class="num">${Math.round(i.value * 100)}</td></tr>`,
    )
    .join('');
  const paragraphs = ai.paragraphs.length
    ? `<h3>Paragraphes les plus typés</h3>${ai.paragraphs
        .map(
          (p) =>
            `<div class="warn"><strong>Paragraphe ${p.index + 1}</strong> (${escapeHtml(p.reasons.join(', '))})<br>${escapeHtml(p.excerpt)}</div>`,
        )
        .join('')}`
    : '';
  return `<section class="card"><h2>Indices de rédaction assistée par IA</h2>
    <div class="summary">${gaugeSvg(ai.score, ai.band.color, 'Indices IA')}
    <div class="figures"><p><strong style="color:${ai.band.color}">${escapeHtml(ai.band.label)}</strong>${ai.reliable ? '' : ' — échantillon court, fiabilité réduite'}</p>
    <table><thead><tr><th>Indicateur</th><th>Mesure</th><th class="num">/100</th></tr></thead><tbody>${rows}</tbody></table>
    </div></div>${paragraphs}
    <p class="muted">${escapeHtml(ai.disclaimer)}</p></section>`;
}

/** Section citations du rapport HTML. */
function citationsHtml(report) {
  const c = report.citations;
  if (!c) return '';
  if (c.style === 'aucune') {
    return `<section class="card"><h2>Citations et bibliographie</h2>
      <p class="muted">Aucun appel de citation détecté dans le corps du texte${c.hasBibliography ? ', alors qu’une bibliographie existe' : ''}.</p></section>`;
  }
  const orphans = c.orphans.length
    ? `<h3>Références orphelines (${c.orphans.length})</h3><table><thead><tr><th>Appel</th><th>Contexte</th></tr></thead><tbody>${c.orphans
        .slice(0, 20)
        .map((o) => `<tr><td>${escapeHtml(o.author)}, ${escapeHtml(o.year)}</td><td class="muted">${escapeHtml(o.context)}</td></tr>`)
        .join('')}</tbody></table>`
    : '';
  const uncited = c.uncited.length
    ? `<h3>Entrées jamais citées (${c.uncited.length})</h3>${c.uncited
        .slice(0, 20)
        .map((u) => `<div class="warn">${escapeHtml(u.text)}</div>`)
        .join('')}`
    : '';
  const numeric = c.numericIssues.map((i) => `<div class="err">${escapeHtml(i)}</div>`).join('');
  return `<section class="card"><h2>Citations et bibliographie</h2>
    <p>Style détecté : <strong>${escapeHtml(c.style)}</strong> — ${c.inTextCount} appel(s) dans le texte, ${c.entryCount} entrée(s) en bibliographie, ${Math.round(c.matchedRatio * 100)} % des appels appariés.</p>
    ${orphans}${uncited}${numeric}
    ${!c.orphans.length && !c.uncited.length && !c.numericIssues.length ? '<p class="muted">Appels et bibliographie concordent.</p>' : ''}
  </section>`;
}

/** @param {{lang: string, confidence: number}} language */
function languageLabel(language) {
  if (!language) return 'indéterminée';
  const names = { fr: 'français', en: 'anglais', inconnue: 'indéterminée' };
  const name = names[language.lang] || language.lang;
  return language.confidence
    ? `${name} (confiance ${Math.round(language.confidence * 100)} %)`
    : name;
}

/** @param {string} text @param {number} max */
function truncateText(text, max) {
  const value = String(text || '');
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

/* ------------------------------------------------------------------ *
 * Export Word
 * ------------------------------------------------------------------ */

/**
 * Produit le rapport au format .docx.
 *
 * @param {any} report
 * @param {{maxAnnotatedChars?: number, maxPassages?: number}} [options]
 * @returns {Promise<Blob>}
 */
export async function buildReportDocx(report, options = {}) {
  const maxPassages = options.maxPassages ?? 300;
  const { scores, document: doc, analysis } = report;
  const builder = new DocxBuilder({
    title: `Rapport de plagiat — ${doc.name}`,
    creator: BRAND.name,
    subject: 'Analyse de similitude',
  });

  builder.heading("Rapport d'analyse de similitude", 1);
  builder.paragraph(
    [
      { text: doc.name, bold: true },
      { text: `  •  ${formatDate(report.generatedAt)}  •  réf. ${report.id}` },
    ],
    { spacingAfter: 240 },
  );

  builder.heading('Synthèse', 2);
  builder.paragraph([
    { text: `${scores.tauxNet} % `, bold: true, size: 22, color: scores.niveau.color.replace('#', '') },
    { text: `de similitude nette — ${scores.niveau.label}.` },
  ]);
  builder.table(
    [
      ['Indicateur', 'Valeur'],
      ['Taux de similitude brut', `${scores.tauxBrut} %`],
      ['Taux de similitude net (hors citations et bibliographie)', `${scores.tauxNet} %`],
      ["Indice d'originalité", `${scores.originalite} %`],
      ['Copie littérale', `${scores.repartition.identique} %`],
      ['Copie légèrement modifiée', `${scores.repartition.modifie} %`],
      ['Paraphrase probable', `${scores.repartition.paraphrase} %`],
      ['Mots analysés', scores.motsAnalyses.toLocaleString('fr-FR')],
      ['Mots exclus du calcul', scores.motsExclus.toLocaleString('fr-FR')],
      ['Sources retenues', String(scores.sourcesTotal)],
      ['Passages détectés', String(scores.passagesTotal)],
    ],
    { widths: [6000, 3000] },
  );

  builder.heading('Document analysé', 2);
  builder.table(
    [
      ['Propriété', 'Valeur'],
      ['Fichier', doc.name],
      ['Titre', doc.meta.title || '—'],
      ['Auteur déclaré', doc.meta.creator || '—'],
      [
        'Volume',
        `${doc.stats.words.toLocaleString('fr-FR')} mots · ${doc.stats.pages} page(s)${
          doc.stats.pagesEstimated ? ' (estimé)' : ''
        }`,
      ],
      ['Langue détectée', languageLabel(doc.language)],
      ['Empreinte SHA-256', doc.digest || '—'],
      ["Durée de l'analyse", formatDuration(report.durationMs)],
    ],
    { widths: [3000, 6000] },
  );

  builder.heading('Sources identifiées', 2);
  if (report.sources.length) {
    builder.table(
      [
        ['N°', 'Source', 'Moteur', 'Part', 'Passages'],
        ...report.sources.map((s, i) => [
          String(i + 1),
          s.url
            ? [{ text: s.title || s.url, href: s.url }]
            : [{ text: s.title || '—' }],
          s.providerName || s.provider || '',
          `${s.percent} %`,
          String(s.passages.length),
        ]),
      ],
      { widths: [600, 4200, 1800, 1000, 1000] },
    );
  } else {
    builder.paragraph('Aucune source correspondante n’a été identifiée.', {
      style: 'Citation',
    });
  }

  if (report.passages.length) {
    builder.pageBreak();
    builder.heading('Détail des passages', 2);
    report.passages.slice(0, maxPassages).forEach((p, index) => {
      const style = MATCH_STYLES[p.type] || MATCH_STYLES.paraphrase;
      const source = report.sources.find((s) => s.key === p.sourceKey);
      builder.heading(
        `Passage ${index + 1} — ${style.label} (${Math.round(p.similarity * 100)} %)`,
        3,
      );
      builder.paragraph(
        [
          { text: 'Source : ', bold: true },
          source?.url
            ? { text: source.title || source.url, href: source.url }
            : { text: source?.title || 'inconnue' },
        ],
        { spacingAfter: 60 },
      );
      builder.paragraph([{ text: 'Dans le document : ', bold: true }], { spacingAfter: 40 });
      builder.paragraph([{ text: truncateText(p.documentText, 1500), shade: style.docxShade }], {
        indent: 340,
        spacingAfter: 60,
      });
      builder.paragraph([{ text: 'Dans la source : ', bold: true }], { spacingAfter: 40 });
      builder.paragraph([{ text: truncateText(p.sourceText, 1500), italic: true }], {
        indent: 340,
        spacingAfter: 160,
      });
    });
    if (report.passages.length > maxPassages) {
      builder.paragraph(
        `${report.passages.length - maxPassages} passage(s) supplémentaire(s) figurent dans l'export JSON.`,
        { style: 'Citation' },
      );
    }
  }

  if ((report.internal || []).length) {
    builder.heading('Répétitions internes', 2);
    builder.paragraph(
      'Passages répétés à l’identique à deux endroits éloignés du document.',
      { style: 'Citation' },
    );
    builder.table(
      [
        ['Mots', 'Première occurrence', 'Seconde occurrence'],
        ...report.internal.slice(0, 40).map((d) => [
          String(d.words),
          truncateText(d.aText, 400),
          truncateText(d.bText, 400),
        ]),
      ],
      { widths: [800, 4100, 4100] },
    );
  }

  // Analyses complémentaires.
  if (report.forensics && report.forensics.severity !== 'aucun') {
    builder.heading('Analyse forensique — procédés de camouflage', 2);
    for (const f of report.forensics.findings) {
      builder.paragraph([{ text: '• ' }, { text: f }], { spacingAfter: 60 });
    }
    if (report.forensics.hiddenRuns.length) {
      builder.table(
        [
          ['Procédé', 'Contenu dissimulé'],
          ...report.forensics.hiddenRuns.slice(0, 20).map((r) => [r.type, truncateText(r.text, 400)]),
        ],
        { widths: [2000, 7000] },
      );
    }
  }

  if (report.ai && report.ai.indicators.length) {
    builder.heading('Indices de rédaction assistée par IA', 2);
    builder.paragraph([
      { text: `${report.ai.score} / 100 — ${report.ai.band.label}. `, bold: true },
      { text: report.ai.disclaimer, italic: true },
    ]);
    builder.table(
      [
        ['Indicateur', 'Mesure', '/100'],
        ...report.ai.indicators.map((i) => [i.label, truncateText(i.detail, 200), String(Math.round(i.value * 100))]),
      ],
      { widths: [3000, 5000, 1000] },
    );
  }

  if (report.citations && report.citations.style !== 'aucune') {
    builder.heading('Citations et bibliographie', 2);
    builder.paragraph(
      `Style ${report.citations.style} — ${report.citations.inTextCount} appel(s), ` +
        `${report.citations.entryCount} entrée(s), ` +
        `${Math.round(report.citations.matchedRatio * 100)} % appariés.`,
    );
    if (report.citations.orphans.length) {
      builder.heading('Références orphelines', 3);
      builder.table(
        [
          ['Appel', 'Contexte'],
          ...report.citations.orphans.slice(0, 25).map((o) => [`${o.author}, ${o.year}`, truncateText(o.context, 300)]),
        ],
        { widths: [2500, 6500] },
      );
    }
    if (report.citations.uncited.length) {
      builder.heading('Entrées jamais citées', 3);
      for (const u of report.citations.uncited.slice(0, 25)) {
        builder.paragraph(truncateText(u.text, 400), { style: 'Citation' });
      }
    }
  }

  builder.pageBreak();
  builder.heading('Méthodologie et paramètres', 2);
  builder.table(
    [
      ['Paramètre', 'Valeur'],
      ["Profil d'analyse", analysis.depthLabel || analysis.depth],
      [
        'Échantillonnage',
        `${analysis.chunksQueried} blocs interrogés sur ${analysis.chunksTotal} (${Math.round(
          analysis.samplingRatio * 100,
        )} % du texte)`,
      ],
      ['Requêtes réseau', String(analysis.requestCount)],
      [
        'Sources',
        `${analysis.sourcesExamined} examinées, ${analysis.sourcesRetained} retenues`,
      ],
      ['Corpus local', `${analysis.corpusDocuments} document(s)`],
      [
        'Moteurs',
        (analysis.providers || []).map((p) => `${p.name} (${p.queries} req.)`).join(', ') ||
          'aucun',
      ],
      ['Mots exclus', `${analysis.excludedWords.toLocaleString('fr-FR')}`],
    ],
    { widths: [3000, 6000] },
  );

  builder.heading('Comment lire ce rapport', 3);
  builder.paragraph(
    "Le taux brut correspond à la part du document couverte par au moins un passage " +
      "retrouvé dans une source. Le taux net en retire les citations correctement " +
      'encadrées et la bibliographie. Un taux élevé ne prouve pas le plagiat : les ' +
      'citations référencées et les formulations techniques consacrées produisent ' +
      'légitimement des correspondances. À l’inverse, un taux faible ne garantit rien ' +
      'pour les sources absentes des bases interrogées. Chaque passage signalé doit ' +
      'être vérifié manuellement avant toute conclusion.',
  );
  builder.paragraph(
    'Rapport produit localement dans le navigateur : le document analysé n’a été transmis à aucun serveur.',
    { style: 'Citation' },
  );

  return builder.toBlob();
}

/* ------------------------------------------------------------------ *
 * Export JSON
 * ------------------------------------------------------------------ */

/**
 * Sérialise le rapport en JSON.
 * @param {any} report
 * @param {{includeText?: boolean}} [options]
 * @returns {string}
 */
export function reportToJson(report, options = {}) {
  const copy = { ...report };
  if (!options.includeText) {
    delete copy.text;
    delete copy.paragraphs;
  }
  return JSON.stringify(copy, null, 2);
}

/**
 * Export CSV des passages détectés (séparateur point-virgule, tableur français).
 * @param {any} report
 * @returns {string}
 */
export function reportToCsv(report) {
  const echapper = (v) => {
    const s = String(v ?? '').replace(/\r?\n/g, ' ');
    return /[";]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lignes = [
    ['n', 'source', 'moteur', 'url', 'type', 'similarite_pct', 'mots', 'extrait_document', 'extrait_source'],
  ];
  const rang = new Map(report.sources.map((src, i) => [src.key, i + 1]));
  report.passages.forEach((p, i) => {
    const src = report.sources.find((x) => x.key === p.sourceKey);
    lignes.push([
      i + 1,
      src?.title || '',
      src?.providerName || src?.provider || '',
      src?.url || '',
      p.typeLabel || p.type,
      Math.round(p.similarity * 100),
      p.words,
      p.documentText,
      p.sourceText,
      rang.get(p.sourceKey) ?? '',
    ]);
  });
  // BOM pour qu'Excel reconnaisse l'UTF-8.
  return '\ufeff' + lignes.map((l) => l.map(echapper).join(';')).join('\r\n');
}

/**
 * Résumé compact destiné à l'historique local.
 * @param {any} report
 */
export function summarize(report) {
  return {
    id: report.id,
    generatedAt: report.generatedAt,
    name: report.document.name,
    words: report.document.stats.words,
    tauxNet: report.scores.tauxNet,
    tauxBrut: report.scores.tauxBrut,
    niveau: report.scores.niveau.code,
    sources: report.scores.sourcesTotal,
    durationMs: report.durationMs,
    aiScore: report.ai ? report.ai.score : null,
    forensicSeverity: report.forensics ? report.forensics.severity : null,
    citationIssues: report.citations
      ? report.citations.orphans.length + report.citations.uncited.length
      : null,
  };
}
