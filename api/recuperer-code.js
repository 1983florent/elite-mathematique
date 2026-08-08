/**
 * GET /api/recuperer-code?session_id=cs_...
 * Vérifie chez Stripe que la session est payée, puis renvoie un code d'accès
 * signé { code, plan }. Aucune base de données requise.
 * (Wrapper Vercel ; logique dans _lib.js.)
 */
import { coreRecupererCode, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });

  try {
    const session_id = (req.query && req.query.session_id) || '';
    const { status, body: out } = await coreRecupererCode({ session_id });
    return res.status(status).json(out);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
  }
}
