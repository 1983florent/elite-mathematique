/**
 * Rendu des résultats d'analyse dans l'application.
 *
 * Le texte annoté est construit par lots pour rester fluide même sur un
 * document de plusieurs centaines de milliers de caractères.
 *
 * @module ui/results
 */

import { el, clear, num, nextFrame } from './dom.js';
import {
  buildSegments,
  MATCH_STYLES,
  formatDuration,
  formatDate,
  domainOf,
  gaugeSvg,
} from '../core/report.js';
import { t } from '../core/i18n.js';

/** Nombre de caractères rendus par lot dans le texte annoté. */
const RENDER_BATCH = 60_000;
/** Au-delà, l'affichage du texte annoté est proposé par tranches. */
const INITIAL_LIMIT = 200_000;

/**
 * Construit l'ensemble du bloc de résultats.
 *
 * @param {HTMLElement} host
 * @param {any} report
 * @param {{onExport: (format: string) => void, onHumanize: () => void}} actions
 */
export function renderResults(host, report, actions) {
  clear(host);
  host.hidden = false;

  host.append(
    synthesisCard(report, actions),
    documentCard(report),
    sourcesCard(report),
    annotatedCard(report),
  );
  if (report.forensics) host.append(forensicsCard(report));
  if (report.ai) host.append(aiCard(report));
  if (report.citations) host.append(citationsCard(report));
  if (report.passages.length) host.append(passagesCard(report));
  if ((report.internal || []).length) host.append(internalCard(report));
  host.append(methodCard(report));

  host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Carte de synthèse : jauge, répartition, indicateurs, exports. */
function synthesisCard(report, actions) {
  const { scores } = report;
  const gauge = el('div', {
    html: gaugeSvg(scores.tauxNet, scores.niveau.color, 'Taux de similitude net'),
  });

  const repartition = el('div', { class: 'repartition' });
  const parts = [
    ['identique', scores.repartition.identique],
    ['modifie', scores.repartition.modifie],
    ['paraphrase', scores.repartition.paraphrase],
  ];
  for (const [type, value] of parts) {
    if (value <= 0) continue;
    repartition.append(
      el('span', {
        style: { width: `${value}%`, background: MATCH_STYLES[type].border },
        title: `${MATCH_STYLES[type].label} : ${value} %`,
      }),
    );
  }
  repartition.append(
    el('span', {
      style: { width: `${Math.max(0, scores.repartition.original)}%`, background: 'var(--bordure)' },
      title: `Contenu original : ${scores.repartition.original} %`,
    }),
  );

  const legende = el('div', { class: 'legende' }, [
    ...parts.map(([type]) =>
      el('span', {}, [
        el('span', {
          class: 'pastille',
          style: {
            background: MATCH_STYLES[type].background,
            outline: `1px solid ${MATCH_STYLES[type].border}`,
          },
        }),
        MATCH_STYLES[type].label,
      ]),
    ),
    el('span', {}, [
      el('span', { class: 'pastille', style: { background: 'var(--bordure)' } }),
      'Contenu original',
    ]),
  ]);

  const kpi = el('div', { class: 'kpi' }, [
    kpiBox('Similitude brute', `${scores.tauxBrut} %`),
    kpiBox('Originalité', `${scores.originalite} %`),
    kpiBox('Mots analysés', num(scores.motsAnalyses)),
    kpiBox('Sources retenues', num(scores.sourcesTotal)),
    kpiBox('Passages détectés', num(scores.passagesTotal)),
    kpiBox('Durée', formatDuration(report.durationMs)),
  ]);

  const certLabel = t('cert.generate') === 'cert.generate' ? "Certificat d'originalité" : t('cert.generate');
  const exportButtons = el('div', { class: 'actions' }, [
    el('button', { type: 'button', class: 'bouton bouton--premium', title: certLabel,
      onclick: () => actions.onExport('certificate') }, '✦ ' + certLabel),
    el('button', { type: 'button', class: 'bouton bouton--primaire',
      onclick: () => actions.onExport('docx') }, 'Rapport Word (.docx)'),
    el('button', { type: 'button', class: 'bouton bouton--discret',
      onclick: () => actions.onExport('html') }, 'Rapport HTML'),
    el('button', { type: 'button', class: 'bouton bouton--discret',
      onclick: () => actions.onExport('json') }, 'Données JSON'),
    el('button', { type: 'button', class: 'bouton bouton--discret',
      onclick: () => actions.onExport('csv') }, 'Passages CSV'),
    el('button', { type: 'button', class: 'bouton bouton--discret',
      onclick: () => actions.onExport('print') }, 'Imprimer / PDF'),
    el('button', { type: 'button', class: 'bouton bouton--discret',
      onclick: () => actions.onHumanize() }, 'Retravailler le texte'),
  ]);

  const card = el('section', { class: 'carte' }, [
    el('h2', {}, 'Synthèse'),
    el('div', { class: 'synthese' }, [
      gauge,
      el('div', { class: 'synthese__chiffres' }, [
        el('p', {}, [
          el('strong', { style: { color: scores.niveau.color } }, scores.niveau.label),
          ` — ${scores.tauxNet} % du texte analysé correspond à des sources identifiées.`,
        ]),
        repartition,
        legende,
        kpi,
      ]),
    ]),
    exportButtons,
  ]);

  for (const warning of report.warnings || []) {
    card.append(el('div', { class: 'alerte alerte--attention' }, warning));
  }
  for (const error of report.errors || []) {
    card.append(
      el('div', { class: 'alerte alerte--danger' }, `${error.engine} : ${error.message}`),
    );
  }
  return card;
}

/** @param {string} label @param {string} value */
function kpiBox(label, value) {
  return el('div', {}, [el('span', {}, label), el('strong', {}, value)]);
}

/** Carte descriptive du document analysé. */
function documentCard(report) {
  const doc = report.document;
  const rows = [
    ['Fichier', doc.name],
    doc.meta.title && ['Titre', doc.meta.title],
    doc.meta.creator && ['Auteur déclaré', doc.meta.creator],
    [
      'Volume',
      `${num(doc.stats.words)} mots · ${num(doc.stats.characters)} caractères · ${num(
        doc.stats.pages,
      )} page(s)${doc.stats.pagesEstimated ? ' (estimé)' : ''}`,
    ],
    ['Langue détectée', languageLabel(doc.language)],
    ['Analyse', `${formatDate(report.generatedAt)} — réf. ${report.id}`],
    doc.digest && ['Empreinte SHA-256', doc.digest],
  ].filter(Boolean);

  return el('section', { class: 'carte' }, [
    el('h2', {}, 'Document analysé'),
    el('div', { class: 'tableau-defilant' }, [
      el('table', {}, [
        el(
          'tbody',
          {},
          rows.map(([key, value]) =>
            el('tr', {}, [
              el('th', { style: { width: '210px' } }, key),
              el('td', { style: key === 'Empreinte SHA-256' ? { wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '.8rem' } : {} }, value),
            ]),
          ),
        ),
      ]),
    ]),
  ]);
}

/** @param {{lang: string, confidence: number}} language */
function languageLabel(language) {
  const names = { fr: 'français', en: 'anglais', inconnue: 'indéterminée' };
  const name = names[language?.lang] || 'indéterminée';
  return language?.confidence
    ? `${name} (confiance ${Math.round(language.confidence * 100)} %)`
    : name;
}

/** Tableau des sources identifiées. */
function sourcesCard(report) {
  if (!report.sources.length) {
    return el('section', { class: 'carte' }, [
      el('h2', {}, 'Sources identifiées'),
      el(
        'p',
        { class: 'discret' },
        "Aucune source correspondante n'a été trouvée dans les bases interrogées. Cela ne garantit pas l'originalité du document : seules les bases activées ont été consultées.",
      ),
    ]);
  }

  const rows = report.sources.map((source, i) =>
    el('tr', {}, [
      el('td', { class: 'num' }, String(i + 1)),
      el('td', {}, [
        source.url
          ? el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' },
              source.title || source.url)
          : el('span', {}, source.title || '—'),
        source.url ? el('div', { class: 'discret' }, domainOf(source.url)) : null,
      ]),
      el('td', {}, source.providerName || source.provider || ''),
      el('td', { class: 'num' }, `${source.percent} %`),
      el('td', { class: 'num' }, String(source.passages.length)),
      el('td', { class: 'num' }, `${Math.round((source.maxSimilarity || 0) * 100)} %`),
    ]),
  );

  return el('section', { class: 'carte' }, [
    el('h2', {}, `Sources identifiées (${report.sources.length})`),
    el('div', { class: 'tableau-defilant' }, [
      el('table', {}, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', { class: 'num' }, 'N°'),
            el('th', {}, 'Source'),
            el('th', {}, 'Moteur'),
            el('th', { class: 'num' }, 'Part du document'),
            el('th', { class: 'num' }, 'Passages'),
            el('th', { class: 'num' }, 'Similarité max.'),
          ]),
        ]),
        el('tbody', {}, rows),
      ]),
    ]),
  ]);
}

/** Texte du document avec les passages surlignés. */
function annotatedCard(report) {
  const container = el('div', { class: 'texte-document' });
  const card = el('section', { class: 'carte' }, [
    el('h2', {}, 'Texte annoté'),
    el('div', { class: 'legende', style: { marginBottom: '10px' } },
      Object.entries(MATCH_STYLES)
        .filter(([key]) => key !== 'interne')
        .map(([, style]) =>
          el('span', {}, [
            el('span', {
              class: 'pastille',
              style: { background: style.background, outline: `1px solid ${style.border}` },
            }),
            style.label,
          ]),
        )),
    container,
  ]);

  const sourceRank = new Map(report.sources.map((s, i) => [s.key, i + 1]));
  const limit = Math.min(report.text.length, INITIAL_LIMIT);
  const { segments, truncated } = buildSegments(report.text, report.passages, {
    maxChars: limit,
  });

  // Rendu par lots : le premier lot s'affiche immédiatement, la suite arrive
  // au fil des trames d'animation.
  (async () => {
    let batch = document.createDocumentFragment();
    let size = 0;
    for (const segment of segments) {
      if (!segment.type) {
        batch.append(document.createTextNode(segment.text));
      } else {
        const style = MATCH_STYLES[segment.type] || MATCH_STYLES.paraphrase;
        const rank = sourceRank.get(segment.sourceKey);
        batch.append(
          el(
            'mark',
            {
              class: segment.type,
              title: `${style.label}${rank ? ` — source n° ${rank}` : ''}`,
            },
            segment.text,
          ),
        );
      }
      size += segment.text.length;
      if (size >= RENDER_BATCH) {
        container.append(batch);
        batch = document.createDocumentFragment();
        size = 0;
        await nextFrame();
      }
    }
    container.append(batch);
    if (truncated) {
      card.append(
        el(
          'p',
          { class: 'discret' },
          `Affichage limité aux ${num(limit)} premiers caractères pour rester fluide. La liste des passages ci-dessous et les exports couvrent l'intégralité du document.`,
        ),
      );
    }
  })();

  return card;
}

/** Détail des passages, avec pagination interne. */
function passagesCard(report) {
  const PAGE = 25;
  const list = el('div', {});
  let shown = 0;

  const sourceRank = new Map(report.sources.map((s, i) => [s.key, i + 1]));
  const more = el('button', { type: 'button', class: 'bouton bouton--discret' }, 'Afficher plus de passages');

  const renderPage = () => {
    const slice = report.passages.slice(shown, shown + PAGE);
    for (const passage of slice) {
      const style = MATCH_STYLES[passage.type] || MATCH_STYLES.paraphrase;
      const source = report.sources.find((s) => s.key === passage.sourceKey);
      list.append(
        el('article', { class: 'passage' }, [
          el('div', { class: 'passage__meta' }, [
            el('span', {
              class: 'pastille-type',
              style: { background: style.background, color: style.border },
            }, style.label),
            el('span', {}, `Similarité ${Math.round(passage.similarity * 100)} %`),
            el('span', {}, `${passage.words} mots`),
            el('span', {}, [
              `Source n° ${sourceRank.get(passage.sourceKey) ?? '—'} : `,
              source?.url
                ? el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' },
                    source.title || source.url)
                : el('span', {}, source?.title || 'inconnue'),
            ]),
          ]),
          el('div', { class: 'passage__cotes' }, [
            el('div', {}, [
              el('h4', {}, 'Dans votre document'),
              el('span', {}, truncate(passage.documentText, 1200)),
            ]),
            el('div', {}, [
              el('h4', {}, 'Dans la source'),
              el('span', {}, truncate(passage.sourceText, 1200)),
            ]),
          ]),
        ]),
      );
    }
    shown += slice.length;
    more.hidden = shown >= report.passages.length;
    more.textContent = `Afficher plus de passages (${report.passages.length - shown} restants)`;
  };

  more.addEventListener('click', renderPage);
  renderPage();

  return el('section', { class: 'carte' }, [
    el('h2', {}, `Détail des passages (${report.passages.length})`),
    el(
      'p',
      { class: 'discret' },
      'Comparez chaque passage avec sa source avant de conclure : une citation correctement référencée apparaît ici comme une correspondance.',
    ),
    list,
    more,
  ]);
}

/** Répétitions internes au document. */
function internalCard(report) {
  return el('section', { class: 'carte' }, [
    el('h2', {}, `Répétitions internes (${report.internal.length})`),
    el(
      'p',
      { class: 'discret' },
      "Passages répétés à l'identique à deux endroits éloignés du document. Ils n'entrent pas dans le taux de similitude, mais révèlent souvent un copier-coller interne.",
    ),
    ...report.internal.slice(0, 40).map((d) =>
      el('article', { class: 'passage' }, [
        el('div', { class: 'passage__meta' }, [
          el('span', {
            class: 'pastille-type',
            style: {
              background: MATCH_STYLES.interne.background,
              color: MATCH_STYLES.interne.border,
            },
          }, 'Répétition interne'),
          el('span', {}, `${d.words} mots`),
        ]),
        el('div', { class: 'passage__cotes' }, [
          el('div', {}, [el('h4', {}, 'Première occurrence'), truncate(d.aText, 700)]),
          el('div', {}, [el('h4', {}, 'Seconde occurrence'), truncate(d.bText, 700)]),
        ]),
      ]),
    ),
  ]);
}

/** Analyse forensique : procédés de camouflage. */
function forensicsCard(report) {
  const f = report.forensics;
  const severityLabel = {
    aucun: ['Aucun camouflage détecté', 'var(--succes)'],
    indice: ['Indices de camouflage', 'var(--alerte)'],
    alerte: ['Camouflage détecté', 'var(--danger)'],
  }[f.severity];

  const card = el('section', { class: 'carte' }, [
    el('h2', {}, 'Analyse forensique'),
    el('p', {}, [
      el('span', {
        class: `pastille-type`,
        style: { background: 'var(--fond-doux)', color: severityLabel[1] },
      }, severityLabel[0]),
    ]),
  ]);

  if (f.severity === 'aucun') {
    card.append(
      el('p', { class: 'discret' },
        "Ni homoglyphes, ni caractères invisibles, ni texte dissimulé dans le fichier. Le document ne présente aucun signe de manipulation destinée à tromper un détecteur."),
    );
    return card;
  }

  for (const finding of f.findings) {
    card.append(el('div', { class: f.severity === 'alerte' ? 'alerte alerte--danger' : 'alerte alerte--attention' }, finding));
  }

  if (f.mixedWords.length) {
    card.append(
      el('h3', {}, 'Mots à alphabets mélangés'),
      el('p', { class: 'discret' },
        f.mixedWords.slice(0, 25).map((w) => `« ${w.word} » → « ${w.cleaned} »`).join('  ·  ')),
    );
  }
  if (f.hiddenRuns.length) {
    card.append(
      el('h3', {}, 'Texte dissimulé dans le fichier Word'),
      el('div', { class: 'tableau-defilant' }, [
        el('table', {}, [
          el('thead', {}, [el('tr', {}, [el('th', {}, 'Procédé'), el('th', {}, 'Contenu')])]),
          el('tbody', {}, f.hiddenRuns.slice(0, 20).map((r) =>
            el('tr', {}, [el('td', {}, r.type), el('td', {}, truncate(r.text, 300))]))),
        ]),
      ]),
    );
  }
  return card;
}

/** Indices de rédaction assistée par IA. */
function aiCard(report) {
  const ai = report.ai;
  const card = el('section', { class: 'carte' }, [el('h2', {}, 'Indices de rédaction assistée par IA')]);

  if (!ai.indicators.length) {
    card.append(el('p', { class: 'discret' }, ai.disclaimer));
    return card;
  }

  card.append(
    el('div', { class: 'synthese' }, [
      el('div', { html: gaugeSvg(ai.score, ai.band.color, 'Indices IA') }),
      el('div', { class: 'synthese__chiffres' }, [
        el('p', {}, [
          el('strong', { style: { color: ai.band.color } }, ai.band.label),
          ai.reliable ? '' : ' — échantillon court, fiabilité réduite',
        ]),
        el('div', { class: 'tableau-defilant' }, [
          el('table', {}, [
            el('thead', {}, [el('tr', {}, [el('th', {}, 'Indicateur'), el('th', {}, 'Mesure'), el('th', { class: 'num' }, '/100')])]),
            el('tbody', {}, ai.indicators.map((i) =>
              el('tr', {}, [
                el('td', {}, i.label),
                el('td', { class: 'discret' }, i.detail),
                el('td', { class: 'num' }, String(Math.round(i.value * 100))),
              ]))),
          ]),
        ]),
      ]),
    ]),
  );

  if (ai.paragraphs.length) {
    card.append(el('h3', {}, 'Paragraphes les plus typés'));
    for (const p of ai.paragraphs) {
      card.append(
        el('div', { class: 'alerte alerte--attention' }, [
          el('strong', {}, `Paragraphe ${p.index + 1} `),
          el('span', { class: 'discret' }, `(${p.reasons.join(', ')})`),
          el('br'),
          p.excerpt,
        ]),
      );
    }
  }
  card.append(el('div', { class: 'alerte alerte--info' }, ai.disclaimer));
  return card;
}

/** Vérification croisée des citations. */
function citationsCard(report) {
  const c = report.citations;
  const card = el('section', { class: 'carte' }, [el('h2', {}, 'Citations et bibliographie')]);

  if (c.style === 'aucune') {
    card.append(el('p', { class: 'discret' },
      `Aucun appel de citation détecté dans le corps du texte${c.hasBibliography ? ", alors qu'une bibliographie existe." : '.'}`));
    return card;
  }

  card.append(
    el('p', {}, [
      'Style détecté : ', el('strong', {}, c.style),
      ` — ${num(c.inTextCount)} appel(s) dans le texte, ${num(c.entryCount)} entrée(s) en bibliographie, ${Math.round(c.matchedRatio * 100)} % des appels appariés.`,
    ]),
  );

  if (c.orphans.length) {
    card.append(
      el('h3', {}, `Références orphelines (${c.orphans.length})`),
      el('p', { class: 'discret' }, 'Citées dans le texte mais absentes de la bibliographie.'),
      el('div', { class: 'tableau-defilant' }, [
        el('table', {}, [
          el('thead', {}, [el('tr', {}, [el('th', {}, 'Appel'), el('th', {}, 'Contexte')])]),
          el('tbody', {}, c.orphans.slice(0, 25).map((o) =>
            el('tr', {}, [el('td', {}, `${o.author}, ${o.year}`), el('td', { class: 'discret' }, o.context)]))),
        ]),
      ]),
    );
  }
  if (c.uncited.length) {
    card.append(
      el('h3', {}, `Entrées jamais citées (${c.uncited.length})`),
      el('p', { class: 'discret' }, 'Présentes en bibliographie mais jamais appelées dans le texte.'),
      ...c.uncited.slice(0, 25).map((u) => el('div', { class: 'alerte alerte--attention' }, u.text)),
    );
  }
  for (const issue of c.numericIssues) {
    card.append(el('div', { class: 'alerte alerte--danger' }, issue));
  }
  if (!c.orphans.length && !c.uncited.length && !c.numericIssues.length) {
    card.append(el('p', { class: 'discret' }, 'Appels de citation et bibliographie concordent.'));
  }
  return card;
}

/** Méthodologie, moteurs et limites. */
function methodCard(report) {
  const a = report.analysis;
  const rows = [
    ["Profil d'analyse", a.depthLabel || a.depth],
    [
      'Échantillonnage',
      `${num(a.chunksQueried)} blocs interrogés sur ${num(a.chunksTotal)} — ${Math.round(
        a.samplingRatio * 100,
      )} % du texte soumis aux moteurs`,
    ],
    ['Requêtes réseau', `${num(a.requestCount)} (cache réutilisé à ${a.cache?.ratio ?? 0} %)`],
    ['Sources', `${num(a.sourcesExamined)} examinées, ${num(a.sourcesRetained)} retenues`],
    ['Corpus local', `${num(a.corpusDocuments)} document(s)`],
    [
      'Exclusions',
      `${num(a.excludedWords)} mots exclus${a.bibliography ? ' — bibliographie détectée' : ''}${
        a.quotedRanges ? ` — ${a.quotedRanges} citation(s)` : ''
      }`,
    ],
  ];

  const engines = (a.providers || []).map((e) =>
    el('tr', {}, [
      el('td', {}, e.name),
      el('td', { class: 'num' }, String(e.queries)),
      el('td', { class: 'num' }, String(e.results)),
      el('td', {}, e.errors.length ? e.errors[0] : '—'),
    ]),
  );

  return el('section', { class: 'carte' }, [
    el('h2', {}, 'Méthodologie et limites'),
    el('div', { class: 'tableau-defilant' }, [
      el('table', {}, [
        el('tbody', {}, rows.map(([k, v]) =>
          el('tr', {}, [el('th', { style: { width: '210px' } }, k), el('td', {}, v)]))),
      ]),
    ]),
    engines.length ? el('h3', {}, 'Moteurs interrogés') : null,
    engines.length
      ? el('div', { class: 'tableau-defilant' }, [
          el('table', {}, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', {}, 'Moteur'),
                el('th', { class: 'num' }, 'Requêtes'),
                el('th', { class: 'num' }, 'Résultats'),
                el('th', {}, 'Incident'),
              ]),
            ]),
            el('tbody', {}, engines),
          ]),
        ])
      : null,
    el('div', { class: 'alerte alerte--info' }, [
      el('strong', {}, 'Comment lire ce taux. '),
      "Le taux brut est la part du document couverte par au moins un passage retrouvé dans une source ; le taux net en retire les citations encadrées et la bibliographie. Un taux élevé n'est pas une preuve de plagiat, et un taux nul ne garantit rien pour les bases non interrogées. Chaque passage signalé doit être vérifié manuellement.",
    ]),
  ]);
}

/** @param {string} text @param {number} max */
function truncate(text, max) {
  const value = String(text || '');
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
