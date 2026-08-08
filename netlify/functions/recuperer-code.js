/** Netlify Function — GET /api/recuperer-code?session_id=... */
import { coreRecupererCode, corsHeaders } from '../../api/_lib.js';

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
  try {
    const session_id = (event.queryStringParameters && event.queryStringParameters.session_id) || '';
    const { status, body: out } = await coreRecupererCode({ session_id });
    return { statusCode: status, headers, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: err.status || 500, headers, body: JSON.stringify({ error: err.message || 'Erreur serveur.' }) };
  }
};
