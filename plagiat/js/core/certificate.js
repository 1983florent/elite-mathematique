/**
 * Certificat d'originalité, le différenciateur de Veritex.
 *
 * À partir d'un rapport d'analyse, on produit une attestation canonique
 * (nom du document, empreinte SHA-256 du fichier, taux d'originalité, score IA,
 * moteurs interrogés…), scellée par un condensé SHA-256. Le sceau rend le
 * certificat infalsifiable : toute altération d'un champ change le sceau, ce
 * que la vérification détecte. Si l'éditeur configure un point de signature
 * serveur, le certificat porte en plus une signature ECDSA vérifiable avec la
 * clé publique embarquée (même infrastructure que les licences).
 *
 * Le module fonctionne dans le navigateur, dans un worker et sous Node
 * (Web Crypto `crypto.subtle`).
 *
 * @module core/certificate
 */

import { BRAND } from './branding.js';
import { LICENSE_CONFIG } from './license.js';

/** Emblème Veritex (data URI) pour un certificat autonome. */
const EMBLEM_URI =
  'data:image/png;base64,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';

/** Version du format de certificat (pour compatibilité future). */
export const CERT_VERSION = 1;

/** Point de signature serveur (optionnel). Vide = certificat scellé non signé. */
export const CERT_CONFIG = {
  /** URL POST recevant { seal } et renvoyant { signature } (base64url, ECDSA P-256). */
  signEndpoint: '',
  /** URL publique où un tiers peut vérifier un certificat (affichée sur le document). */
  verifyUrl: '',
};

/* ------------------------------------------------------------------ *
 * Utilitaires bas niveau
 * ------------------------------------------------------------------ */

const enc = new TextEncoder();

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(text) {
  if (!globalThis.crypto?.subtle) {
    // Repli déterministe (FNV-1a 128 bits) si Web Crypto est indisponible.
    return fnv128(text);
  }
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return toHex(hash);
}

/** Repli non cryptographique (uniquement si `crypto.subtle` manque). */
function fnv128(str) {
  let h1 = 0x811c9dc5, h2 = 0x811c9dc5 ^ 0x9e3779b9, h3 = 0xcbf29ce4, h4 = 0x84222325;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ ((c << 3) | (c >>> 5)), 0x01000193);
    h3 = Math.imul(h3 ^ ((c * 131) & 0xffff), 0x01000193);
    h4 = Math.imul(h4 ^ ((c * 977) & 0xffff), 0x01000193);
  }
  const u = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return u(h1) + u(h2) + u(h3) + u(h4);
}

/**
 * Sérialisation canonique : clés triées récursivement pour que le sceau soit
 * reproductible indépendamment de l'ordre d'insertion.
 * @param {any} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
  }
  return JSON.stringify(value === undefined ? null : value);
}

/** Code lisible dérivé du sceau : VX-XXXX-XXXX-XXXX. */
export function humanCode(seal) {
  const s = seal.toUpperCase().replace(/[^0-9A-F]/g, '');
  return 'VX-' + (s.slice(0, 4) || '0000') + '-' + (s.slice(4, 8) || '0000') + '-' + (s.slice(8, 12) || '0000');
}

/* ------------------------------------------------------------------ *
 * Construction
 * ------------------------------------------------------------------ */

/**
 * @typedef {Object} Certificate
 * @property {number} v
 * @property {string} app
 * @property {string} certId
 * @property {string} issuedAt
 * @property {Object} attestation
 * @property {string} seal            condensé SHA-256 de l'attestation canonique
 * @property {string} code            code lisible VX-XXXX-XXXX-XXXX
 * @property {string} [signature]     signature ECDSA (base64url) si signé serveur
 */

/**
 * Construit et scelle un certificat à partir d'un rapport d'analyse.
 * @param {any} report
 * @param {{plan?: string, sign?: boolean}} [options]
 * @returns {Promise<Certificate>}
 */
export async function buildCertificate(report, options = {}) {
  const scores = report.scores || {};
  const doc = report.document || {};
  const originality = Math.max(0, Math.round((100 - (scores.tauxNet ?? 0)) * 10) / 10);

  const attestation = {
    document: {
      name: doc.name || 'document',
      digestSha256: doc.digest || '',
      words: doc.stats?.words ?? null,
      characters: doc.stats?.characters ?? null,
      language: doc.language || null,
    },
    results: {
      originalityScore: originality,
      matchRateNet: scores.tauxNet ?? null,
      matchRateGross: scores.tauxBrut ?? null,
      level: scores.niveau?.code || null,
      sourcesRetained: scores.sourcesTotal ?? report.sources?.length ?? 0,
      aiLikelihood: report.ai ? report.ai.score : null,
      forensicSeverity: report.forensics ? report.forensics.severity : null,
      citationIssues: report.citations
        ? (report.citations.orphans?.length || 0) + (report.citations.uncited?.length || 0)
        : null,
    },
    analysis: {
      depth: report.analysis?.depthLabel || report.analysis?.depth || null,
      engines: (report.analysis?.providers || []).map((p) => p.name || p.id || p).filter(Boolean),
      chunksQueried: report.analysis?.chunksQueried ?? null,
      sourcesExamined: report.analysis?.sourcesExamined ?? null,
      reportId: report.id || null,
      analyzedAt: report.generatedAt || null,
    },
    issuer: {
      product: BRAND.name,
      publisher: BRAND.publisher,
      plan: options.plan || null,
    },
  };

  const issuedAt = new Date(report.generatedAt || Date.now()).toISOString();
  const certId =
    'CERT-' +
    (attestation.document.digestSha256 || '').slice(0, 8).toUpperCase() +
    '-' +
    issuedAt.slice(0, 10).replace(/-/g, '');

  const sealBase = canonicalJson({ certId, issuedAt, v: CERT_VERSION, attestation });
  const seal = await sha256Hex(sealBase);

  /** @type {Certificate} */
  const cert = {
    v: CERT_VERSION,
    app: BRAND.name,
    certId,
    issuedAt,
    attestation,
    seal,
    code: humanCode(seal),
  };

  if (options.sign && CERT_CONFIG.signEndpoint) {
    try {
      const sig = await requestSignature(seal);
      if (sig) cert.signature = sig;
    } catch {
      /* signature indisponible : le certificat reste scellé */
    }
  }

  return cert;
}

/** Demande une signature serveur du sceau (optionnel). */
async function requestSignature(seal) {
  const res = await fetch(CERT_CONFIG.signEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seal }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.signature || null;
}

/* ------------------------------------------------------------------ *
 * Vérification
 * ------------------------------------------------------------------ */

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Vérifie l'intégrité (et la signature si présente) d'un certificat.
 * @param {Certificate|string} input  objet certificat ou sa version JSON
 * @returns {Promise<{valid: boolean, reason?: string, signed: boolean, attestation?: Object, cert?: Certificate}>}
 */
export async function verifyCertificate(input) {
  let cert;
  try {
    cert = typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    return { valid: false, reason: 'format', signed: false };
  }
  if (!cert || typeof cert !== 'object' || !cert.attestation || !cert.seal) {
    return { valid: false, reason: 'format', signed: false };
  }

  const sealBase = canonicalJson({
    certId: cert.certId,
    issuedAt: cert.issuedAt,
    v: cert.v ?? CERT_VERSION,
    attestation: cert.attestation,
  });
  const expected = await sha256Hex(sealBase);
  if (expected !== cert.seal) {
    return { valid: false, reason: 'seal', signed: false, cert };
  }

  const signed = Boolean(cert.signature);
  if (signed) {
    const ok = await verifySignature(cert.seal, cert.signature);
    if (!ok) return { valid: false, reason: 'signature', signed: true, cert };
  }

  return { valid: true, signed, attestation: cert.attestation, cert };
}

/** Vérifie la signature ECDSA du sceau avec la clé publique embarquée. */
async function verifySignature(seal, signature) {
  try {
    if (!globalThis.crypto?.subtle || !LICENSE_CONFIG.publicKeySpki) return false;
    const key = await crypto.subtle.importKey(
      'spki',
      b64urlToBytes(LICENSE_CONFIG.publicKeySpki.replace(/-/g, '+').replace(/_/g, '/')),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      b64urlToBytes(signature),
      enc.encode(seal),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Rendu visuel
 * ------------------------------------------------------------------ */

/**
 * Sceau visuel déterministe (« hologramme ») dérivé des octets du sceau.
 * Motif unique par document, difficile à reproduire à l'identique.
 * @param {string} seal
 * @param {number} [size]
 * @returns {string} balise SVG
 */
export function sealSvg(seal, size = 120) {
  const bytes = [];
  for (let i = 0; i + 1 < seal.length; i += 2) bytes.push(parseInt(seal.slice(i, i + 2), 16) || 0);
  while (bytes.length < 32) bytes.push(0);
  const c1 = BRAND.colors.primary;
  const c2 = BRAND.colors.accent;
  const cx = size / 2;
  const cy = size / 2;
  const rings = [];
  // Guilloché : rosaces concentriques pilotées par les octets.
  for (let k = 0; k < 6; k++) {
    const petals = 6 + (bytes[k] % 10);
    const r = size * (0.16 + k * 0.055);
    const rot = (bytes[k + 6] / 255) * 360;
    let d = '';
    for (let a = 0; a <= petals; a++) {
      const ang = (a / petals) * Math.PI * 2 + (rot * Math.PI) / 180;
      const wobble = 1 + 0.28 * Math.sin(a * (2 + (bytes[k + 12] % 4)));
      const x = cx + Math.cos(ang) * r * wobble;
      const y = cy + Math.sin(ang) * r * wobble;
      d += (a === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    rings.push(
      `<path d="${d}Z" fill="none" stroke="${k % 2 ? c2 : c1}" stroke-width="${(0.6 + (bytes[k + 18] % 3) * 0.25).toFixed(2)}" opacity="${(0.35 + k * 0.09).toFixed(2)}"/>`,
    );
  }
  // Points cardinaux dérivés des derniers octets.
  let dots = '';
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const rr = size * (0.42 + (bytes[(i + 20) % 32] % 5) * 0.012);
    dots += `<circle cx="${(cx + Math.cos(ang) * rr).toFixed(1)}" cy="${(cy + Math.sin(ang) * rr).toFixed(1)}" r="${(1 + (bytes[i] % 3)).toFixed(1)}" fill="${i % 2 ? c1 : c2}" opacity="0.7"/>`;
  }
  return (
    `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Sceau de sécurité">` +
    `<circle cx="${cx}" cy="${cy}" r="${size * 0.47}" fill="none" stroke="${c1}" stroke-width="1.5" opacity="0.5"/>` +
    rings.join('') +
    dots +
    `<circle cx="${cx}" cy="${cy}" r="${size * 0.06}" fill="${c1}"/>` +
    `</svg>`
  );
}

/** Échappement HTML minimal. */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/**
 * Rendu HTML autonome du certificat (imprimable / exportable en PDF).
 * @param {Certificate} cert
 * @param {{strings?: Record<string,string>}} [options]
 * @returns {string}
 */
export function renderCertificateHtml(cert, options = {}) {
  const s = { ...CERT_STRINGS, ...(options.strings || {}) };
  const a = cert.attestation;
  const r = a.results;
  const orig = r.originalityScore ?? 0;
  const gaugeColor = orig >= 85 ? '#16a34a' : orig >= 65 ? '#f59e0b' : '#dc2626';
  const issued = new Date(cert.issuedAt);
  const dateStr = isNaN(issued) ? cert.issuedAt : issued.toLocaleString();
  const engines = (a.analysis.engines || []).join(', ') || '-';
  const signedBadge = cert.signature
    ? `<span class="badge badge--signed">${esc(s.signed)}</span>`
    : `<span class="badge badge--sealed">${esc(s.sealed)}</span>`;

  const rows = [
    [s.rowDocument, esc(a.document.name)],
    [s.rowFingerprint, `<code>${esc(a.document.digestSha256 || '-')}</code>`],
    [s.rowWords, a.document.words != null ? formatInt(a.document.words) : '-'],
    [s.rowLanguage, esc(a.document.language || '-')],
    [s.rowMatch, r.matchRateNet != null ? r.matchRateNet + ' %' : '-'],
    [s.rowSources, formatInt(r.sourcesRetained || 0)],
    [s.rowAi, r.aiLikelihood != null ? Math.round(r.aiLikelihood) + ' %' : '-'],
    [s.rowEngines, esc(engines)],
    [s.rowDepth, esc(a.analysis.depth || '-')],
    [s.rowAnalyzedAt, esc(a.analysis.analyzedAt ? new Date(a.analysis.analyzedAt).toLocaleString() : dateStr)],
  ]
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`)
    .join('');

  const verifyLine = CERT_CONFIG.verifyUrl
    ? `<p class="verify">${esc(s.verifyAt)} <strong>${esc(CERT_CONFIG.verifyUrl)}</strong></p>`
    : `<p class="verify">${esc(s.verifyIn)}</p>`;

  const payload = esc(JSON.stringify(cert));

  return `<!doctype html><html lang="${esc(a.document.language || 'fr')}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.title)}, ${esc(a.document.name)}</title>
<style>
  :root{--p:${BRAND.colors.primary};--a:${BRAND.colors.accent};--ink:#1f2430;--muted:#6b7280;--line:#e5e7eb;}
  *{box-sizing:border-box;}
  body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:var(--ink);margin:0;background:#eef0f7;padding:24px;}
  .sheet{max-width:820px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;
    box-shadow:0 20px 60px rgba(31,36,48,.15);border:1px solid var(--line);}
  .head{position:relative;padding:34px 40px;color:#fff;
    background:linear-gradient(135deg,var(--p),#7c3aed 70%);overflow:hidden;}
  .head::after{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;
    background:radial-gradient(circle,rgba(245,158,11,.55),transparent 70%);}
  .brand{display:flex;align-items:center;gap:12px;font-size:14px;letter-spacing:.14em;text-transform:uppercase;opacity:.92;}
  .brand b{font-size:20px;letter-spacing:.04em;}
  .logo{width:40px;height:40px;border-radius:10px;background:#fff;object-fit:contain;padding:3px;}
  h1{margin:14px 0 4px;font-size:30px;position:relative;}
  .subtitle{opacity:.9;margin:0;position:relative;}
  .body{padding:30px 40px;}
  .top{display:flex;gap:28px;align-items:center;flex-wrap:wrap;justify-content:space-between;}
  .score{display:flex;align-items:center;gap:18px;}
  .ring{--v:${orig};width:132px;height:132px;border-radius:50%;display:grid;place-items:center;
    background:conic-gradient(${gaugeColor} calc(var(--v)*1%),#eceef4 0);}
  .ring>div{width:104px;height:104px;background:#fff;border-radius:50%;display:grid;place-items:center;text-align:center;}
  .ring .num{font-size:32px;font-weight:800;color:${gaugeColor};line-height:1;}
  .ring .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:4px;}
  .seal{text-align:center;}
  .seal .code{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;letter-spacing:.05em;margin-top:6px;}
  .badge{display:inline-block;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;}
  .badge--signed{background:#dcfce7;color:#166534;}
  .badge--sealed{background:#e0e7ff;color:#3730a3;}
  table{width:100%;border-collapse:collapse;margin-top:22px;font-size:14px;}
  th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top;}
  th{width:34%;color:var(--muted);font-weight:600;}
  td code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;word-break:break-all;}
  .verify{margin-top:20px;font-size:13px;color:var(--muted);}
  .foot{padding:18px 40px 30px;border-top:1px dashed var(--line);font-size:12px;color:var(--muted);}
  details{margin-top:12px;}
  summary{cursor:pointer;color:var(--p);font-weight:600;}
  .payload{white-space:pre-wrap;word-break:break-all;font-family:ui-monospace,Menlo,Consolas,monospace;
    font-size:10px;background:#f7f8fc;border:1px solid var(--line);border-radius:8px;padding:10px;margin-top:8px;color:#374151;}
  @media print{body{background:#fff;padding:0;}.sheet{box-shadow:none;border:none;border-radius:0;}details{display:none;}}
</style></head><body>
<div class="sheet">
  <div class="head">
    <div class="brand"><img class="logo" src="${EMBLEM_URI}" alt=""><b>${esc(cert.app)}</b>${a.issuer.publisher ? ' · ' + esc(a.issuer.publisher) : ''}</div>
    <h1>${esc(s.title)}</h1>
    <p class="subtitle">${esc(s.subtitle)}</p>
  </div>
  <div class="body">
    <div class="top">
      <div class="score">
        <div class="ring"><div><div class="num">${orig}%</div><div class="lbl">${esc(s.originality)}</div></div></div>
        <div>
          <div style="font-size:13px;color:var(--muted)">${esc(s.certId)}</div>
          <div style="font-family:ui-monospace,monospace;font-weight:700">${esc(cert.certId)}</div>
          <div style="margin-top:8px">${signedBadge}</div>
          <div style="font-size:13px;color:var(--muted);margin-top:8px">${esc(s.issued)}: ${esc(dateStr)}</div>
        </div>
      </div>
      <div class="seal">
        ${sealSvg(cert.seal, 120)}
        <div class="code">${esc(cert.code)}</div>
      </div>
    </div>
    <table>${rows}</table>
    ${verifyLine}
  </div>
  <div class="foot">
    <div>${esc(s.integrity)}</div>
    <div style="margin-top:6px">SHA-256 · ${esc(cert.seal)}</div>
    <details><summary>${esc(s.embedded)}</summary><div class="payload">${payload}</div></details>
  </div>
</div>
</body></html>`;
}

function formatInt(n) {
  try {
    return Number(n).toLocaleString();
  } catch {
    return String(n);
  }
}

/** Libellés par défaut (français) ; surchargés via i18n à l'appel. */
export const CERT_STRINGS = {
  title: "Certificat d'originalité",
  subtitle: 'Attestation vérifiable générée après analyse anti-plagiat.',
  originality: 'Originalité',
  certId: 'Identifiant du certificat',
  issued: 'Émis le',
  signed: '✔ Signé numériquement',
  sealed: '● Scellé (SHA-256)',
  rowDocument: 'Document',
  rowFingerprint: 'Empreinte du fichier (SHA-256)',
  rowWords: 'Nombre de mots',
  rowLanguage: 'Langue',
  rowMatch: 'Taux de correspondance',
  rowSources: 'Sources retenues',
  rowAi: 'Probabilité de rédaction par IA',
  rowEngines: 'Moteurs interrogés',
  rowDepth: "Profondeur d'analyse",
  rowAnalyzedAt: 'Analysé le',
  verifyAt: 'Vérifiez ce certificat sur :',
  verifyIn: "Vérifiable dans Veritex (onglet Outils › Vérifier un certificat) en collant ce fichier.",
  integrity: "Le sceau SHA-256 garantit l'intégrité : toute modification d'un champ le rend invalide.",
  embedded: 'Données vérifiables intégrées (JSON)',
};
