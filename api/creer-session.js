/**
 * POST /api/creer-session  { plan: "mensuel" | "annuel" }
 * Crée une session de paiement Stripe et renvoie { url }.
 * (Wrapper Vercel ; la logique est dans _lib.js, partagée avec Netlify.)
 */
import { coreCreerSession, corsHeaders } from './_lib.js';

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const origin =
      body.origin ||
      req.headers.origin ||
      (req.headers.host ? 'https://' + req.headers.host : '');
    const { status, body: out } = await coreCreerSession({ plan: body.plan, origin });
    return res.status(status).json(out);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Erreur serveur.' });
  }
}
