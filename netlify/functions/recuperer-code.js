/** Netlify Function — GET /api/recuperer-code?transaction=<id>&plan=<offre> */
import { coreRecupererCode, corsHeaders } from '../../api/_lib.js';

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
  try {
    const q = event.queryStringParameters || {};
    const transaction = q.transaction || q.id || q.session_id || '';
    const { status, body: out } = await coreRecupererCode({ transaction, plan: q.plan });
    return { statusCode: status, headers, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: err.status || 500, headers, body: JSON.stringify({ error: err.message || 'Erreur serveur.' }) };
  }
};
