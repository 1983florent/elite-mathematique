/**
 * Relais CORS pour l'analyseur de plagiat ELITE MATHEMATIQUE.
 *
 * À déployer sur Cloudflare Workers (offre gratuite suffisante). Il rend deux
 * services que le navigateur ne peut pas assurer seul :
 *
 *   1. `/recherche?q=…`  — interroge un moteur web et renvoie le format
 *      attendu par le « point d'accès personnalisé » de l'application ;
 *   2. `/lire?url=…`     — récupère le texte d'une page tierce, ce que la
 *      politique d'origine du navigateur interdit.
 *
 * Les clés d'API restent chez vous : elles vivent dans les variables
 * d'environnement du Worker et ne transitent jamais par le navigateur.
 *
 * ─── Déploiement ────────────────────────────────────────────────────────────
 *   npm install -g wrangler
 *   wrangler init mon-relais && cp relais-cloudflare.js mon-relais/src/index.js
 *   wrangler secret put SERPER_KEY        # facultatif
 *   wrangler secret put ACCES_JETON       # recommandé : protège votre relais
 *   wrangler deploy
 *
 * ─── Réglages dans l'application ────────────────────────────────────────────
 *   Moteur « Point d'accès personnalisé » :
 *     URL     https://mon-relais.workers.dev/recherche?q={query}
 *     Jeton   la valeur de ACCES_JETON
 *   Lecteur de page « Relais personnel » :
 *     Gabarit https://mon-relais.workers.dev/lire?url={url}
 */

/** Domaines autorisés à appeler ce relais. Adaptez à votre site. */
const ORIGINES_AUTORISEES = [
  'https://1983florent.github.io',
  'http://localhost:8080',
  'http://localhost:8137',
];

/** Taille maximale d'une page rapatriée (2 Mo). */
const TAILLE_MAX = 2 * 1024 * 1024;

export default {
  /**
   * @param {Request} request
   * @param {{SERPER_KEY?: string, GOOGLE_KEY?: string, GOOGLE_CX?: string, ACCES_JETON?: string}} env
   */
  async fetch(request, env) {
    const origine = request.headers.get('Origin') || '';
    const enTetes = enTetesCors(origine);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: enTetes });
    }

    // Jeton partagé : empêche que votre quota soit consommé par des tiers.
    if (env.ACCES_JETON) {
      const fourni = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      if (fourni !== env.ACCES_JETON) {
        return json({ error: 'Jeton manquant ou invalide.' }, 401, enTetes);
      }
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/recherche') {
        const requete = url.searchParams.get('q') || '';
        if (!requete) return json({ results: [] }, 200, enTetes);
        return json({ results: await rechercher(requete, env) }, 200, enTetes);
      }

      if (url.pathname === '/lire') {
        const cible = url.searchParams.get('url') || '';
        if (!/^https?:\/\//i.test(cible)) {
          return json({ error: 'URL absente ou invalide.' }, 400, enTetes);
        }
        const texte = await lirePage(cible);
        return new Response(texte, {
          headers: { ...enTetes, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    } catch (err) {
      return json({ error: String(err?.message || err) }, 502, enTetes);
    }

    return json({ error: 'Chemin inconnu. Utilisez /recherche ou /lire.' }, 404, enTetes);
  },
};

/** @param {string} origine */
function enTetesCors(origine) {
  const autorisee = ORIGINES_AUTORISEES.includes(origine) ? origine : ORIGINES_AUTORISEES[0];
  return {
    'Access-Control-Allow-Origin': autorisee,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** @param {any} data @param {number} status @param {Record<string, string>} headers */
function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Interroge le moteur configuré et normalise la réponse.
 * @param {string} requete
 * @param {any} env
 * @returns {Promise<{title: string, url: string, snippet: string}[]>}
 */
async function rechercher(requete, env) {
  if (env.SERPER_KEY) {
    const reponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': env.SERPER_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: requete, num: 8, hl: 'fr' }),
    });
    if (!reponse.ok) throw new Error(`Serper a répondu ${reponse.status}`);
    const data = await reponse.json();
    return (data.organic || []).map((r) => ({
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
    }));
  }

  if (env.GOOGLE_KEY && env.GOOGLE_CX) {
    const cible = new URL('https://www.googleapis.com/customsearch/v1');
    cible.searchParams.set('key', env.GOOGLE_KEY);
    cible.searchParams.set('cx', env.GOOGLE_CX);
    cible.searchParams.set('q', requete);
    cible.searchParams.set('num', '10');
    const reponse = await fetch(cible);
    if (!reponse.ok) throw new Error(`Google a répondu ${reponse.status}`);
    const data = await reponse.json();
    return (data.items || []).map((r) => ({
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
    }));
  }

  throw new Error(
    "Aucun moteur configuré : définissez SERPER_KEY, ou GOOGLE_KEY et GOOGLE_CX.",
  );
}

/**
 * Rapatrie une page et en extrait le texte brut.
 * @param {string} cible
 * @returns {Promise<string>}
 */
async function lirePage(cible) {
  const reponse = await fetch(cible, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EliteMathPlagiat/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!reponse.ok) throw new Error(`La page a répondu ${reponse.status}`);

  const type = reponse.headers.get('Content-Type') || '';
  const brut = (await reponse.text()).slice(0, TAILLE_MAX);
  if (!/html/i.test(type)) return brut;

  return brut
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(?:p|div|li|h[1-6]|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
