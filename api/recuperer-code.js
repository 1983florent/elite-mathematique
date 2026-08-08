/**
 * GET /api/recuperer-code?transaction=<id>&plan=<offre>
 * Vérifie chez FedaPay que la transaction est approuvée, puis renvoie un code
 * d'accès signé { code, plan }. Aucune base de données requise.
 * (Wrapper Vercel ; logique dans _lib.js.)
 */
import { coreRecupererCode, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });

  try {
    const q = req.query || {};
    const transaction = q.transaction || q.id || q.session_id || '';
    const { status, body: out } = await coreRecupererCode({ transaction, plan: q.plan });
    return res.status(status).json(out);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
  }
}
