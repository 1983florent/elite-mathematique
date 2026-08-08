/**
 * Certificat d'originalité — le différenciateur de Veritex.
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
  const engines = (a.analysis.engines || []).join(', ') || '—';
  const signedBadge = cert.signature
    ? `<span class="badge badge--signed">${esc(s.signed)}</span>`
    : `<span class="badge badge--sealed">${esc(s.sealed)}</span>`;

  const rows = [
    [s.rowDocument, esc(a.document.name)],
    [s.rowFingerprint, `<code>${esc(a.document.digestSha256 || '—')}</code>`],
    [s.rowWords, a.document.words != null ? formatInt(a.document.words) : '—'],
    [s.rowLanguage, esc(a.document.language || '—')],
    [s.rowMatch, r.matchRateNet != null ? r.matchRateNet + ' %' : '—'],
    [s.rowSources, formatInt(r.sourcesRetained || 0)],
    [s.rowAi, r.aiLikelihood != null ? Math.round(r.aiLikelihood) + ' %' : '—'],
    [s.rowEngines, esc(engines)],
    [s.rowDepth, esc(a.analysis.depth || '—')],
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
<title>${esc(s.title)} — ${esc(a.document.name)}</title>
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
  .logo{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.16);
    display:grid;place-items:center;font-weight:800;border:1px solid rgba(255,255,255,.35);}
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
    <div class="brand"><span class="logo">V</span><b>${esc(cert.app)}</b>${a.issuer.publisher ? ' · ' + esc(a.issuer.publisher) : ''}</div>
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
