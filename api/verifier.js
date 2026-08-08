/**
 * POST /api/verifier  { reference: "..." }
 * Point de contrôle serveur optionnel (verifyEndpoint). Renvoie { active }.
 * (Wrapper Vercel ; logique dans _lib.js.)
 */
import { coreVerifier, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { status, body: out } = await coreVerifier({ reference: body.reference });
    return res.status(status).json(out);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
  }
}
