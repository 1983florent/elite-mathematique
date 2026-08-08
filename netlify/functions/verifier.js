/** Netlify Function — POST /api/verifier. */
import { coreVerifier, corsHeaders } from '../../api/_lib.js';

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders() };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const { status, body: out } = await coreVerifier({ reference: body.reference });
    return { statusCode: status, headers, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: err.status || 500, headers, body: JSON.stringify({ error: err.message || 'Erreur serveur.' }) };
  }
};
