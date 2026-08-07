/**
 * Fournisseurs de sources interrogés sur internet.
 *
 * Deux familles :
 *   • **ouverts** — utilisables immédiatement, sans clé, et qui autorisent les
 *     appels directs depuis un navigateur (en-têtes CORS permissifs) ;
 *   • **moteurs à clé** — l'utilisateur fournit sa propre clé d'API, stockée
 *     uniquement dans son navigateur et envoyée directement au service.
 *
 * Chaque fournisseur expose `search()` et, quand c'est possible, `fetchText()`
 * qui rapatrie le texte intégral : la comparaison locale est d'autant plus
 * fiable qu'elle porte sur le document complet plutôt que sur un extrait.
 *
 * @module core/providers
 */

import { request, withParams, hostOf, NetworkError, NET_ERRORS } from './net.js';

/** Retire les balises HTML d'un extrait. */
export function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Reconstitue un résumé à partir de l'index inversé d'OpenAlex.
 * @param {Record<string, number[]>|null|undefined} inverted
 * @returns {string}
 */
export function fromInvertedIndex(inverted) {
  if (!inverted) return '';
  /** @type {string[]} */
  const positions = [];
  for (const [word, list] of Object.entries(inverted)) {
    for (const p of list) positions[p] = word;
  }
  return positions.filter(Boolean).join(' ');
}

/**
 * @typedef {Object} SourceCandidate
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string} snippet
 * @property {string} provider
 * @property {string} providerName
 * @property {string} kind
 * @property {string} [text] texte intégral déjà disponible
 * @property {Object} [raw] données propres au fournisseur
 */

/**
 * Fabrique un fournisseur MediaWiki (Wikipédia, Wikisource, Wikibooks…).
 * @param {{id: string, name: string, host: string, kind: string, defaultEnabled?: boolean}} cfg
 */
function mediawiki(cfg) {
  return {
    id: cfg.id,
    name: cfg.name,
    group: 'ouvert',
    kind: cfg.kind,
    defaultEnabled: cfg.defaultEnabled ?? false,
    needsKey: [],
    rateMs: 150,
    description:
      'Recherche plein texte puis récupération de l’article complet en texte brut.',
    docUrl: `https://${cfg.host}/w/api.php`,

    /**
     * @param {string} query
     * @param {ProviderContext} ctx
     * @returns {Promise<SourceCandidate[]>}
     */
    async search(query, ctx) {
      const url = withParams(`https://${cfg.host}/w/api.php`, {
        action: 'query',
        format: 'json',
        formatversion: 2,
        origin: '*',
        list: 'search',
        srsearch: query,
        srlimit: ctx.resultsPerQuery,
        srnamespace: 0,
        srprop: 'snippet|wordcount',
      });
      const data = await ctx.call(url, { providerName: cfg.name });
      const results = data?.query?.search ?? [];
      return results.map((r) => ({
        id: `${cfg.id}:${r.pageid}`,
        title: r.title,
        url: `https://${cfg.host}/wiki/${encodeURIComponent(
          String(r.title).replace(/ /g, '_'),
        )}`,
        snippet: stripHtml(r.snippet || ''),
        provider: cfg.id,
        providerName: cfg.name,
        kind: cfg.kind,
        raw: { pageid: r.pageid, host: cfg.host, words: r.wordcount },
      }));
    },

    /**
     * @param {SourceCandidate} candidate
     * @param {ProviderContext} ctx
     */
    async fetchText(candidate, ctx) {
      const url = withParams(`https://${candidate.raw.host}/w/api.php`, {
        action: 'query',
        format: 'json',
        formatversion: 2,
        origin: '*',
        prop: 'extracts',
        explaintext: 1,
        exlimit: 1,
        pageids: candidate.raw.pageid,
        redirects: 1,
      });
      const data = await ctx.call(url, { providerName: cfg.name });
      const page = data?.query?.pages?.[0];
      return page?.extract || '';
    },
  };
}

/** Fournisseurs disponibles, dans l'ordre d'affichage. */
export const PROVIDERS = [
  mediawiki({
    id: 'wikipedia-fr',
    name: 'Wikipédia (français)',
    host: 'fr.wikipedia.org',
    kind: 'encyclopedie',
    defaultEnabled: true,
  }),
  mediawiki({
    id: 'wikipedia-en',
    name: 'Wikipedia (anglais)',
    host: 'en.wikipedia.org',
    kind: 'encyclopedie',
    defaultEnabled: true,
  }),
  mediawiki({
    id: 'wikisource-fr',
    name: 'Wikisource (français)',
    host: 'fr.wikisource.org',
    kind: 'litterature',
  }),
  mediawiki({
    id: 'wikibooks-fr',
    name: 'Wikilivres (français)',
    host: 'fr.wikibooks.org',
    kind: 'manuel',
  }),

  {
    id: 'openalex',
    name: 'OpenAlex (publications scientifiques)',
    group: 'academique',
    kind: 'article',
    defaultEnabled: true,
    needsKey: [],
    rateMs: 200,
    description:
      '250 millions de travaux universitaires. Le résumé est reconstitué et comparé.',
    docUrl: 'https://docs.openalex.org/',

    async search(query, ctx) {
      const url = withParams('https://api.openalex.org/works', {
        search: query,
        per_page: ctx.resultsPerQuery,
        mailto: ctx.settings.contactEmail || undefined,
        select: 'id,doi,title,abstract_inverted_index,publication_year,primary_location,authorships',
      });
      const data = await ctx.call(url, { providerName: 'OpenAlex' });
      return (data?.results ?? []).map((w) => {
        const abstract = fromInvertedIndex(w.abstract_inverted_index);
        const authors = (w.authorships || [])
          .slice(0, 3)
          .map((a) => a.author?.display_name)
          .filter(Boolean)
          .join(', ');
        return {
          id: `openalex:${w.id}`,
          title: w.title || 'Sans titre',
          url: w.doi || w.primary_location?.landing_page_url || w.id,
          snippet: abstract.slice(0, 300),
          text: abstract ? `${w.title}. ${abstract}` : '',
          provider: 'openalex',
          providerName: 'OpenAlex',
          kind: 'article',
          raw: { year: w.publication_year, authors },
        };
      });
    },
  },

  {
    id: 'crossref',
    name: 'Crossref (DOI et résumés)',
    group: 'academique',
    kind: 'article',
    defaultEnabled: true,
    needsKey: [],
    rateMs: 250,
    description: 'Métadonnées et résumés de plus de 150 millions de publications.',
    docUrl: 'https://api.crossref.org/',

    async search(query, ctx) {
      const url = withParams('https://api.crossref.org/works', {
        'query.bibliographic': query,
        rows: ctx.resultsPerQuery,
        select: 'DOI,title,abstract,URL,author,issued,container-title,type',
        mailto: ctx.settings.contactEmail || undefined,
      });
      const data = await ctx.call(url, { providerName: 'Crossref' });
      return (data?.message?.items ?? []).map((it) => {
        const title = Array.isArray(it.title) ? it.title[0] : it.title || 'Sans titre';
        const abstract = it.abstract ? stripHtml(it.abstract) : '';
        const authors = (it.author || [])
          .slice(0, 3)
          .map((a) => [a.given, a.family].filter(Boolean).join(' '))
          .join(', ');
        return {
          id: `crossref:${it.DOI}`,
          title,
          url: it.URL || `https://doi.org/${it.DOI}`,
          snippet: abstract.slice(0, 300),
          text: abstract ? `${title}. ${abstract}` : '',
          provider: 'crossref',
          providerName: 'Crossref',
          kind: 'article',
          raw: {
            doi: it.DOI,
            authors,
            year: it.issued?.['date-parts']?.[0]?.[0],
            journal: Array.isArray(it['container-title'])
              ? it['container-title'][0]
              : '',
          },
        };
      });
    },
  },

  {
    id: 'semanticscholar',
    name: 'Semantic Scholar',
    group: 'academique',
    kind: 'article',
    defaultEnabled: false,
    needsKey: [],
    optionalKey: 'semanticScholarKey',
    rateMs: 1100,
    description:
      'Résumés d’articles scientifiques. Sans clé, le service limite fortement le débit.',
    docUrl: 'https://api.semanticscholar.org/api-docs/',

    async search(query, ctx) {
      const url = withParams(
        'https://api.semanticscholar.org/graph/v1/paper/search',
        {
          query,
          limit: ctx.resultsPerQuery,
          fields: 'title,abstract,url,year,authors,externalIds',
        },
      );
      const key = ctx.settings.keys?.semanticScholarKey;
      const data = await ctx.call(url, {
        providerName: 'Semantic Scholar',
        headers: key ? { 'x-api-key': key } : undefined,
      });
      return (data?.data ?? []).map((p) => ({
        id: `s2:${p.paperId}`,
        title: p.title || 'Sans titre',
        url: p.url || '',
        snippet: (p.abstract || '').slice(0, 300),
        text: p.abstract ? `${p.title}. ${p.abstract}` : '',
        provider: 'semanticscholar',
        providerName: 'Semantic Scholar',
        kind: 'article',
        raw: {
          year: p.year,
          authors: (p.authors || []).slice(0, 3).map((a) => a.name).join(', '),
        },
      }));
    },
  },

  {
    id: 'hal',
    name: 'HAL (archive ouverte française)',
    group: 'academique',
    kind: 'these',
    defaultEnabled: false,
    needsKey: [],
    rateMs: 300,
    description:
      'Thèses, mémoires et articles francophones. Idéal pour les travaux universitaires en français.',
    docUrl: 'https://api.archives-ouvertes.fr/docs',

    async search(query, ctx) {
      const url = withParams('https://api.archives-ouvertes.fr/search/', {
        q: query,
        fl: 'docid,title_s,abstract_s,uri_s,authFullName_s,producedDateY_i,docType_s',
        rows: ctx.resultsPerQuery,
        wt: 'json',
      });
      const data = await ctx.call(url, { providerName: 'HAL' });
      return (data?.response?.docs ?? []).map((d) => {
        const title = Array.isArray(d.title_s) ? d.title_s[0] : d.title_s || 'Sans titre';
        const abstract = Array.isArray(d.abstract_s)
          ? d.abstract_s[0]
          : d.abstract_s || '';
        return {
          id: `hal:${d.docid}`,
          title,
          url: d.uri_s || '',
          snippet: abstract.slice(0, 300),
          text: abstract ? `${title}. ${abstract}` : '',
          provider: 'hal',
          providerName: 'HAL',
          kind: 'these',
          raw: {
            authors: (d.authFullName_s || []).slice(0, 3).join(', '),
            year: d.producedDateY_i,
            type: d.docType_s,
          },
        };
      });
    },
  },

  {
    id: 'google-cse',
    name: 'Google Programmable Search',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['googleApiKey', 'googleCx'],
    rateMs: 300,
    description:
      'Recherche web Google via votre moteur personnalisé. 100 requêtes gratuites par jour.',
    docUrl: 'https://developers.google.com/custom-search/v1/overview',
    keyFields: [
      { key: 'googleApiKey', label: 'Clé d’API Google' },
      { key: 'googleCx', label: 'Identifiant du moteur (cx)' },
    ],

    async search(query, ctx) {
      const url = withParams('https://www.googleapis.com/customsearch/v1', {
        key: ctx.settings.keys.googleApiKey,
        cx: ctx.settings.keys.googleCx,
        q: query,
        num: Math.min(10, ctx.resultsPerQuery),
        safe: 'off',
      });
      const data = await ctx.call(url, {
        providerName: 'Google Programmable Search',
        noCache: false,
      });
      return (data?.items ?? []).map((it, i) => ({
        id: `gcse:${it.cacheId || it.link || i}`,
        title: it.title,
        url: it.link,
        snippet: it.snippet || '',
        provider: 'google-cse',
        providerName: 'Google',
        kind: 'web',
        raw: { display: it.displayLink },
      }));
    },
  },

  {
    id: 'serper',
    name: 'Serper.dev (Google)',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['serperKey'],
    rateMs: 200,
    description: 'Accès aux résultats Google. 2 500 requêtes offertes à l’inscription.',
    docUrl: 'https://serper.dev/',
    keyFields: [{ key: 'serperKey', label: 'Clé d’API Serper' }],

    async search(query, ctx) {
      const data = await ctx.call('https://google.serper.dev/search', {
        method: 'POST',
        providerName: 'Serper',
        headers: {
          'X-API-KEY': ctx.settings.keys.serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: ctx.resultsPerQuery,
          hl: ctx.settings.searchLanguage || 'fr',
        }),
      });
      return (data?.organic ?? []).map((it, i) => ({
        id: `serper:${it.link || i}`,
        title: it.title,
        url: it.link,
        snippet: it.snippet || '',
        provider: 'serper',
        providerName: 'Serper',
        kind: 'web',
      }));
    },
  },

  {
    id: 'brave',
    name: 'Brave Search API',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['braveKey'],
    rateMs: 1100,
    description:
      'Index web indépendant. Peut exiger un relais : Brave restreint les appels navigateur.',
    docUrl: 'https://brave.com/search/api/',
    keyFields: [{ key: 'braveKey', label: 'Clé d’abonnement Brave' }],

    async search(query, ctx) {
      const url = withParams('https://api.search.brave.com/res/v1/web/search', {
        q: query,
        count: ctx.resultsPerQuery,
      });
      const data = await ctx.call(url, {
        providerName: 'Brave Search',
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': ctx.settings.keys.braveKey,
        },
      });
      return (data?.web?.results ?? []).map((it, i) => ({
        id: `brave:${it.url || i}`,
        title: it.title,
        url: it.url,
        snippet: stripHtml(it.description || ''),
        provider: 'brave',
        providerName: 'Brave',
        kind: 'web',
      }));
    },
  },

  {
    id: 'tavily',
    name: 'Tavily',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['tavilyKey'],
    rateMs: 300,
    description:
      'Recherche web qui renvoie directement le contenu des pages : idéal pour la comparaison intégrale.',
    docUrl: 'https://tavily.com/',
    keyFields: [{ key: 'tavilyKey', label: 'Clé d’API Tavily' }],

    async search(query, ctx) {
      const data = await ctx.call('https://api.tavily.com/search', {
        method: 'POST',
        providerName: 'Tavily',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: ctx.settings.keys.tavilyKey,
          query,
          max_results: ctx.resultsPerQuery,
          include_raw_content: true,
          search_depth: 'basic',
        }),
      });
      return (data?.results ?? []).map((it, i) => ({
        id: `tavily:${it.url || i}`,
        title: it.title,
        url: it.url,
        snippet: (it.content || '').slice(0, 300),
        text: it.raw_content || it.content || '',
        provider: 'tavily',
        providerName: 'Tavily',
        kind: 'web',
      }));
    },
  },

  {
    id: 'searxng',
    name: 'Instance SearXNG',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['searxngUrl'],
    rateMs: 400,
    description:
      'Votre propre instance SearXNG (métamoteur libre). L’instance doit autoriser le format JSON et votre domaine.',
    docUrl: 'https://docs.searxng.org/',
    keyFields: [
      { key: 'searxngUrl', label: 'URL de l’instance', placeholder: 'https://searx.exemple.org' },
    ],

    async search(query, ctx) {
      const base = String(ctx.settings.keys.searxngUrl || '').replace(/\/+$/, '');
      const url = withParams(`${base}/search`, {
        q: query,
        format: 'json',
        language: ctx.settings.searchLanguage || 'fr',
      });
      const data = await ctx.call(url, { providerName: 'SearXNG' });
      return (data?.results ?? []).slice(0, ctx.resultsPerQuery).map((it, i) => ({
        id: `searxng:${it.url || i}`,
        title: it.title,
        url: it.url,
        snippet: it.content || '',
        provider: 'searxng',
        providerName: 'SearXNG',
        kind: 'web',
      }));
    },
  },

  {
    id: 'custom',
    name: 'Point d’accès personnalisé',
    group: 'moteur',
    kind: 'web',
    defaultEnabled: false,
    needsKey: ['customEndpoint'],
    rateMs: 200,
    description:
      'Votre propre service (relais Cloudflare, backend interne…). Doit répondre {"results":[{"title","url","snippet","text"}]}.',
    docUrl: '',
    keyFields: [
      {
        key: 'customEndpoint',
        label: 'URL du service',
        placeholder: 'https://exemple.workers.dev/recherche?q={query}',
      },
      { key: 'customToken', label: 'Jeton (facultatif)', optional: true },
    ],

    async search(query, ctx) {
      const template = String(ctx.settings.keys.customEndpoint || '');
      const url = template.includes('{query}')
        ? template.replace('{query}', encodeURIComponent(query))
        : withParams(template, { q: query });
      const token = ctx.settings.keys.customToken;
      const data = await ctx.call(url, {
        providerName: 'Service personnalisé',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const items = Array.isArray(data) ? data : (data?.results ?? []);
      return items.slice(0, ctx.resultsPerQuery).map((it, i) => ({
        id: `custom:${it.url || i}`,
        title: it.title || it.url || 'Résultat',
        url: it.url || '',
        snippet: it.snippet || '',
        text: it.text || it.content || '',
        provider: 'custom',
        providerName: 'Service personnalisé',
        kind: 'web',
      }));
    },
  },
];

/** @param {string} id */
export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) || null;
}

/**
 * Indique si un fournisseur dispose de tout ce qu'il lui faut pour tourner.
 * @param {any} provider
 * @param {{keys: Record<string, string>}} settings
 * @returns {{ready: boolean, missing: string[]}}
 */
export function providerReadiness(provider, settings) {
  const missing = (provider.needsKey || []).filter(
    (k) => !settings.keys || !String(settings.keys[k] || '').trim(),
  );
  return { ready: missing.length === 0, missing };
}

/* ------------------------------------------------------------------ *
 * Récupération du texte d'une page web quelconque
 * ------------------------------------------------------------------ */

/** Modes de récupération du contenu des pages web. */
export const READERS = [
  {
    id: 'aucun',
    name: 'Extraits seulement',
    description:
      'Ne compare que les extraits renvoyés par le moteur. Aucune requête supplémentaire.',
  },
  {
    id: 'jina',
    name: 'Lecteur r.jina.ai',
    description:
      'Service public qui convertit une page web en texte, appelable depuis le navigateur.',
  },
  {
    id: 'relais',
    name: 'Relais personnel',
    description:
      'Votre propre relais CORS. Gabarit avec {url}, par exemple https://exemple.workers.dev/?url={url}',
  },
  {
    id: 'direct',
    name: 'Accès direct',
    description:
      'Tente de lire la page sans intermédiaire. Ne fonctionne que sur les sites qui l’autorisent.',
  },
];

/**
 * Récupère le texte d'une page web selon le mode configuré.
 *
 * @param {string} url
 * @param {ProviderContext} ctx
 * @returns {Promise<string>}
 */
export async function fetchPageText(url, ctx) {
  const mode = ctx.settings.reader || 'aucun';
  if (!url || mode === 'aucun') return '';

  let target = url;
  if (mode === 'jina') {
    target = `https://r.jina.ai/${url}`;
  } else if (mode === 'relais') {
    const template = String(ctx.settings.keys?.readerProxy || '');
    if (!template) return '';
    target = template.includes('{url}')
      ? template.replace('{url}', encodeURIComponent(url))
      : template + encodeURIComponent(url);
  }

  const raw = await ctx.call(target, {
    providerName: 'Lecteur de page',
    as: 'text',
    timeoutMs: 25000,
    retries: 1,
  });
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  return /<\/?[a-z][\s\S]*>/i.test(text.slice(0, 2000)) ? stripHtml(text) : text;
}

/* ------------------------------------------------------------------ *
 * Contexte d'exécution
 * ------------------------------------------------------------------ */

/**
 * @typedef {Object} ProviderContext
 * @property {(url: string, options?: any) => Promise<any>} call
 * @property {any} settings
 * @property {number} resultsPerQuery
 * @property {AbortSignal} [signal]
 */

/**
 * Construit le contexte passé aux fournisseurs : appels régulés, mis en cache
 * et annulables.
 *
 * @param {{queue: import('./net.js').RequestQueue, cache: any, settings: any, signal?: AbortSignal, resultsPerQuery?: number, onRequest?: (info: any) => void}} deps
 * @returns {ProviderContext}
 */
export function createProviderContext(deps) {
  const { queue, cache, settings, signal, onRequest } = deps;

  return {
    settings,
    signal,
    resultsPerQuery: deps.resultsPerQuery ?? 5,

    async call(url, options = {}) {
      const method = options.method || 'GET';
      const cacheable = options.noCache !== true && cache;
      const cacheKey = `${method} ${url}${options.body ? ' ' + options.body : ''}`;

      if (cacheable) {
        const hit = await cache.get(cacheKey);
        if (hit !== undefined) {
          onRequest?.({ url, cached: true });
          return hit;
        }
      }

      const result = await queue.run(
        () =>
          request(url, {
            ...options,
            method,
            signal,
            as: options.as || 'json',
          }),
        hostOf(url),
      );

      onRequest?.({ url, cached: false });
      if (cacheable) await cache.set(cacheKey, result);
      return result;
    },
  };
}

/**
 * Teste la disponibilité d'un fournisseur avec une requête réelle mais légère.
 *
 * @param {any} provider
 * @param {ProviderContext} ctx
 * @returns {Promise<{ok: boolean, count: number, message: string, kind?: string}>}
 */
export async function testProvider(provider, ctx) {
  const ready = providerReadiness(provider, ctx.settings);
  if (!ready.ready) {
    return {
      ok: false,
      count: 0,
      kind: 'configuration',
      message: `Configuration incomplète : ${ready.missing.join(', ')}.`,
    };
  }
  try {
    const results = await provider.search('théorème de Pythagore démonstration', {
      ...ctx,
      resultsPerQuery: 3,
    });
    return {
      ok: true,
      count: results.length,
      message: results.length
        ? `Connexion établie — ${results.length} résultat(s).`
        : 'Connexion établie, mais aucun résultat pour la requête de test.',
    };
  } catch (err) {
    const netErr = err instanceof NetworkError
      ? err
      : new NetworkError(NET_ERRORS.UNKNOWN, String(err?.message || err));
    return {
      ok: false,
      count: 0,
      kind: netErr.kind,
      message: netErr.hint ? `${netErr.message} ${netErr.hint}` : netErr.message,
    };
  }
}
