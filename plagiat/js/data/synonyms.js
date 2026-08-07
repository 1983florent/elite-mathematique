/**
 * Ressources lexicales de l'humanisation.
 *
 * Règle de construction : **toutes les variantes d'un groupe partagent la même
 * catégorie grammaticale, le même genre et le même nombre**. Une substitution
 * ne peut donc pas casser l'accord. Les cas d'élision (« l'analyse » →
 * « le tableau ») sont en outre vérifiés à l'exécution.
 *
 * @module data/synonyms
 */

/** Verbes conjugués ou à l'infinitif, forme pour forme. */
export const VERBS_FR = {
  montre: ['révèle', 'indique', 'met en évidence', 'fait apparaître'],
  montrent: ['révèlent', 'indiquent', 'mettent en évidence'],
  montrer: ['révéler', 'indiquer', 'mettre en évidence', 'établir'],
  démontre: ['établit', 'prouve', 'atteste'],
  démontrer: ['établir', 'prouver', 'attester'],
  utilise: ['emploie', 'exploite', 'mobilise', 'recourt à'],
  utilisent: ['emploient', 'exploitent', 'mobilisent'],
  utiliser: ['employer', 'exploiter', 'mobiliser'],
  constitue: ['représente', 'forme', 'compose'],
  constituent: ['représentent', 'forment', 'composent'],
  effectue: ['réalise', 'accomplit', 'mène'],
  effectuer: ['réaliser', 'accomplir', 'mener'],
  obtient: ['recueille', 'atteint', 'décroche'],
  obtenir: ['recueillir', 'atteindre', 'décrocher'],
  propose: ['suggère', 'avance', 'met en avant'],
  proposent: ['suggèrent', 'avancent'],
  proposer: ['suggérer', 'avancer', 'mettre en avant'],
  analyse: ['examine', 'étudie', 'décortique'],
  analyser: ['examiner', 'étudier', 'décortiquer'],
  explique: ['éclaire', 'justifie', 'rend compte de'],
  expliquer: ['éclairer', 'justifier', 'rendre compte de'],
  définit: ['caractérise', 'délimite', 'précise'],
  définir: ['caractériser', 'délimiter', 'préciser'],
  souligne: ['insiste sur', 'met l’accent sur', 'relève'],
  souligner: ['insister sur', 'mettre l’accent sur', 'relever'],
  observe: ['constate', 'remarque', 'relève'],
  observer: ['constater', 'remarquer', 'relever'],
  augmente: ['progresse', 'croît', 's’accroît'],
  augmenter: ['progresser', 'croître', 's’accroître'],
  diminue: ['recule', 'décroît', 's’amenuise'],
  diminuer: ['reculer', 'décroître', 's’amenuiser'],
  compare: ['confronte', 'rapproche', 'met en regard'],
  comparer: ['confronter', 'rapprocher', 'mettre en regard'],
  conclut: ['achève', 'clôt', 'termine'],
  conclure: ['achever', 'clore', 'terminer'],
  vérifie: ['contrôle', 'valide', 's’assure de'],
  vérifier: ['contrôler', 'valider', 's’assurer de'],
  calcule: ['évalue', 'détermine', 'estime'],
  calculer: ['évaluer', 'déterminer', 'estimer'],
  possède: ['présente', 'comporte', 'détient'],
  possèdent: ['présentent', 'comportent', 'détiennent'],
  contient: ['renferme', 'comprend', 'englobe'],
  contiennent: ['renferment', 'comprennent', 'englobent'],
  nécessite: ['exige', 'suppose', 'réclame'],
  nécessitent: ['exigent', 'supposent', 'réclament'],
  concerne: ['touche', 'vise', 'porte sur'],
  concernent: ['touchent', 'visent', 'portent sur'],
  apparaît: ['se manifeste', 'surgit', 'se dessine'],
  développe: ['approfondit', 'déploie', 'élabore'],
  développer: ['approfondir', 'déployer', 'élaborer'],
  améliore: ['perfectionne', 'affine', 'optimise'],
  améliorer: ['perfectionner', 'affiner', 'optimiser'],
  identifie: ['repère', 'distingue', 'reconnaît'],
  identifier: ['repérer', 'distinguer', 'reconnaître'],
};

/** Noms communs, regroupés par genre et nombre identiques. */
export const NOUNS_FR = {
  étude: ['recherche', 'enquête', 'analyse'],
  études: ['recherches', 'enquêtes', 'analyses'],
  résultat: ['constat', 'aboutissement'],
  résultats: ['constats', 'aboutissements'],
  méthode: ['démarche', 'approche', 'procédure'],
  méthodes: ['démarches', 'approches', 'procédures'],
  objectif: ['but', 'dessein'],
  objectifs: ['buts', 'desseins'],
  problème: ['obstacle', 'écueil'],
  problèmes: ['obstacles', 'écueils'],
  solution: ['réponse', 'issue', 'parade'],
  solutions: ['réponses', 'issues'],
  exemple: ['cas', 'échantillon'],
  exemples: ['cas', 'échantillons'],
  différence: ['distinction', 'divergence', 'nuance'],
  différences: ['distinctions', 'divergences', 'nuances'],
  importance: ['portée', 'ampleur'],
  domaine: ['champ', 'secteur', 'terrain'],
  domaines: ['champs', 'secteurs', 'terrains'],
  travail: ['ouvrage', 'labeur'],
  travaux: ['ouvrages', 'chantiers'],
  question: ['interrogation', 'problématique'],
  questions: ['interrogations', 'problématiques'],
  élément: ['composant', 'facteur'],
  éléments: ['composants', 'facteurs'],
  raison: ['motif', 'cause'],
  raisons: ['motifs', 'causes'],
  manière: ['façon', 'modalité'],
  manières: ['façons', 'modalités'],
  partie: ['portion', 'fraction'],
  parties: ['portions', 'fractions'],
  ensemble: ['groupe', 'agrégat'],
  processus: ['mécanisme', 'enchaînement'],
  moyen: ['outil', 'levier'],
  moyens: ['outils', 'leviers'],
  effet: ['impact', 'retentissement'],
  effets: ['impacts', 'retentissements'],
  point: ['aspect', 'volet'],
  points: ['aspects', 'volets'],
  cadre: ['contexte', 'périmètre'],
  niveau: ['degré', 'échelon'],
  niveaux: ['degrés', 'échelons'],
};

/** Adjectifs, forme pour forme (genre et nombre conservés). */
export const ADJECTIVES_FR = {
  important: ['notable', 'considérable', 'majeur'],
  importante: ['notable', 'considérable', 'majeure'],
  importants: ['notables', 'considérables', 'majeurs'],
  importantes: ['notables', 'considérables', 'majeures'],
  grand: ['vaste', 'large'],
  grande: ['vaste', 'large'],
  grands: ['vastes', 'larges'],
  grandes: ['vastes', 'larges'],
  principal: ['essentiel', 'central'],
  principale: ['essentielle', 'centrale'],
  principaux: ['essentiels', 'centraux'],
  principales: ['essentielles', 'centrales'],
  différent: ['distinct', 'dissemblable'],
  différente: ['distincte', 'dissemblable'],
  différents: ['distincts', 'variés'],
  différentes: ['distinctes', 'variées'],
  nécessaire: ['indispensable', 'requis'],
  nécessaires: ['indispensables', 'requis'],
  possible: ['envisageable', 'réalisable'],
  possibles: ['envisageables', 'réalisables'],
  nombreux: ['multiples', 'abondants'],
  nombreuses: ['multiples', 'abondantes'],
  complexe: ['élaboré', 'touffu'],
  complexes: ['élaborés', 'touffus'],
  simple: ['élémentaire', 'sobre'],
  simples: ['élémentaires', 'sobres'],
  utile: ['profitable', 'précieux'],
  utiles: ['profitables', 'précieux'],
  efficace: ['performant', 'probant'],
  efficaces: ['performants', 'probants'],
  clair: ['limpide', 'net'],
  claire: ['limpide', 'nette'],
  précis: ['exact', 'rigoureux'],
  précise: ['exacte', 'rigoureuse'],
  récent: ['nouveau', 'inédit'],
  récente: ['nouvelle', 'inédite'],
};

/** Adverbes et locutions adverbiales — les substitutions les plus sûres. */
export const ADVERBS_FR = {
  également: ['aussi', 'de même', 'pareillement'],
  souvent: ['fréquemment', 'régulièrement', 'bien des fois'],
  toujours: ['systématiquement', 'invariablement'],
  généralement: ['le plus souvent', 'en règle générale', 'habituellement'],
  particulièrement: ['spécialement', 'tout spécialement', 'singulièrement'],
  notamment: ['en particulier', 'entre autres'],
  rapidement: ['vite', 'promptement', 'sans tarder'],
  clairement: ['nettement', 'sans ambiguïté'],
  précisément: ['exactement', 'au juste'],
  évidemment: ['bien sûr', 'à l’évidence'],
  simplement: ['seulement', 'sans détour'],
  parfois: ['quelquefois', 'à l’occasion', 'de temps à autre'],
  ainsi: ['de la sorte', 'de cette façon'],
  vraiment: ['réellement', 'véritablement'],
  très: ['fort', 'extrêmement', 'bien'],
};

/**
 * Connecteurs logiques : varier ces charnières est ce qui change le plus
 * nettement la « musique » d'un texte.
 */
export const CONNECTORS_FR = {
  'de plus': ['par ailleurs', 'en outre', 'qui plus est', 'ajoutons que'],
  'en outre': ['de surcroît', 'par ailleurs', 'qui plus est'],
  'par ailleurs': ['de plus', 'en outre', 'du reste'],
  'cependant': ['toutefois', 'néanmoins', 'pour autant'],
  'toutefois': ['cependant', 'néanmoins', 'reste que'],
  'néanmoins': ['pour autant', 'cependant', 'malgré tout'],
  'en effet': ['de fait', 'c’est que', 'et pour cause'],
  'par conséquent': ['dès lors', 'aussi', 'd’où'],
  'donc': ['dès lors', 'partant', 'aussi'],
  'ainsi': ['de la sorte', 'c’est pourquoi'],
  'en conclusion': ['pour finir', 'au terme de ce parcours', 'en dernier lieu'],
  'en résumé': ['pour résumer', 'en bref', 'en somme'],
  'tout d’abord': ['pour commencer', 'en premier lieu', 'd’entrée'],
  'ensuite': ['puis', 'dans un second temps', 'par la suite'],
  'enfin': ['pour finir', 'en dernier lieu', 'reste'],
  'premièrement': ['pour commencer', 'en premier lieu'],
  'deuxièmement': ['ensuite', 'en second lieu'],
  'c’est-à-dire': ['autrement dit', 'soit', 'en clair'],
  'notamment': ['en particulier', 'entre autres'],
  'par exemple': ['ainsi', 'pour ne citer que cela', 'à titre d’illustration'],
  'afin de': ['pour', 'dans le but de', 'en vue de'],
  'grâce à': ['par le biais de', 'à la faveur de'],
  'en raison de': ['du fait de', 'à cause de', 'sous l’effet de'],
  'il est possible de': ['on peut', 'rien n’empêche de'],
  'de nos jours': ['aujourd’hui', 'à l’heure actuelle'],
};

/**
 * Contraintes propres aux connecteurs. « ainsi » ne doit pas être remplacé
 * dans la locution comparative « ainsi que ».
 */
export const CONNECTOR_GUARDS = {
  ainsi: /^\s*que\b/i,
};

/**
 * Tournures lourdes ou stéréotypées, y compris les tics d'écriture des
 * modèles de langue, remplacées par une formulation directe.
 */
export const PHRASES_FR = [
  { from: 'il est important de noter que', to: ['notons que', 'à noter :', 'précisons que'] },
  { from: 'il est important de souligner que', to: ['soulignons que', 'retenons que'] },
  { from: 'il convient de noter que', to: ['notons que', 'observons que'] },
  { from: 'il convient de souligner que', to: ['soulignons que', 'insistons :'] },
  { from: 'il est essentiel de comprendre que', to: ['comprenons bien que', 'retenons que'] },
  { from: 'il est crucial de', to: ['il faut absolument', 'on doit impérativement'] },
  { from: 'il est intéressant de noter que', to: ['fait notable :', 'curieusement,'] },
  { from: 'dans le monde d’aujourd’hui', to: ['aujourd’hui', 'à notre époque'] },
  { from: 'dans le monde actuel', to: ['aujourd’hui', 'de nos jours'] },
  { from: 'joue un rôle crucial dans', to: ['pèse lourd dans', 'est déterminant pour'] },
  { from: 'joue un rôle important dans', to: ['compte beaucoup dans', 'pèse sur'] },
  { from: 'plonger dans', to: ['examiner', 'aborder'] },
  { from: 'un large éventail de', to: ['toute une série de', 'une vaste palette de'] },
  { from: 'une multitude de', to: ['une quantité de', 'une foule de'] },
  { from: 'en fin de compte', to: ['au bout du compte', 'finalement'] },
  { from: 'force est de constater que', to: ['on constate que', 'de fait,'] },
  { from: 'il va sans dire que', to: ['bien sûr,', 'évidemment,'] },
  { from: 'dans le cadre de', to: ['pour', 'lors de', 'au sein de'] },
  { from: 'au niveau de', to: ['pour', 'dans', 'quant à'] },
  { from: 'en termes de', to: ['pour ce qui est de', 'quant à'] },
  { from: 'de manière significative', to: ['nettement', 'sensiblement'] },
  { from: 'de façon significative', to: ['nettement', 'sensiblement'] },
  { from: 'un certain nombre de', to: ['un bon nombre de', 'une série de'] },
  { from: 'la majorité des', to: ['la plupart des', 'l’essentiel des'] },
  { from: 'il est nécessaire de', to: ['il faut', 'on doit'] },
  { from: 'il est possible que', to: ['peut-être que', 'il se peut que'] },
  { from: 'permet de mettre en évidence', to: ['révèle', 'fait ressortir'] },
  { from: 'permet de', to: ['autorise à'] },
  { from: 'permet d’', to: ['autorise à '] },
  { from: 'permettent de', to: ['autorisent à'] },
  { from: 'permettent d’', to: ['autorisent à '] },
];

/**
 * Périphrases nominales lourdes → verbe unique. Cette réécriture rend le
 * texte nettement plus direct.
 */
export const NOMINALIZATIONS_FR = [
  { from: 'procéder à l’analyse de', to: 'analyser' },
  { from: 'procéder à une analyse de', to: 'analyser' },
  { from: 'procéder à l’étude de', to: 'étudier' },
  { from: 'effectuer une comparaison entre', to: 'comparer' },
  { from: 'réaliser une étude de', to: 'étudier' },
  { from: 'faire une description de', to: 'décrire' },
  { from: 'apporter une amélioration à', to: 'améliorer' },
  { from: 'donner une explication de', to: 'expliquer' },
  { from: 'avoir la possibilité de', to: 'pouvoir' },
  { from: 'être en mesure de', to: 'pouvoir' },
  { from: 'avoir pour objectif de', to: 'viser à' },
  { from: 'prendre en considération', to: 'considérer' },
  { from: 'mettre en application', to: 'appliquer' },
  { from: 'mettre en évidence', to: 'révéler' },
  { from: 'faire l’objet d’une étude', to: 'être étudié' },
  { from: 'est de nature à', to: 'peut' },
];

/** Mots de remplissage supprimables sans perte de sens. */
export const FILLERS_FR = [
  'très',
  'vraiment',
  'assez',
  'plutôt',
  'quelque peu',
  'relativement',
  'globalement',
  'en quelque sorte',
  'pour ainsi dire',
  'il faut bien le dire',
  'de toute évidence',
];

/* ------------------------------------------------------------------ *
 * Anglais
 * ------------------------------------------------------------------ */

export const WORDS_EN = {
  shows: ['reveals', 'indicates', 'demonstrates'],
  show: ['reveal', 'indicate', 'demonstrate'],
  uses: ['employs', 'relies on', 'draws on'],
  use: ['employ', 'rely on', 'draw on'],
  important: ['significant', 'notable', 'weighty'],
  significant: ['marked', 'substantial', 'sizeable'],
  many: ['numerous', 'a good number of', 'plenty of'],
  method: ['approach', 'procedure', 'technique'],
  methods: ['approaches', 'procedures', 'techniques'],
  result: ['outcome', 'finding'],
  results: ['outcomes', 'findings'],
  study: ['investigation', 'inquiry'],
  studies: ['investigations', 'inquiries'],
  problem: ['issue', 'difficulty'],
  problems: ['issues', 'difficulties'],
  therefore: ['hence', 'so', 'as a result'],
  however: ['yet', 'that said', 'still'],
  moreover: ['what is more', 'on top of that', 'besides'],
  furthermore: ['besides', 'in addition', 'what is more'],
  additionally: ['also', 'besides'],
  finally: ['lastly', 'to close'],
  utilize: ['use'],
  utilizes: ['uses'],
  demonstrate: ['show', 'establish'],
  approximately: ['about', 'roughly'],
  numerous: ['many', 'plenty of'],
};

export const PHRASES_EN = [
  { from: 'it is important to note that', to: ['note that', 'worth noting:'] },
  { from: 'it is worth noting that', to: ['note that', 'notably,'] },
  { from: 'in today’s world', to: ['today', 'these days'] },
  { from: "in today's world", to: ['today', 'these days'] },
  { from: 'plays a crucial role in', to: ['matters a great deal in', 'drives'] },
  { from: 'a wide range of', to: ['many', 'all sorts of'] },
  { from: 'delve into', to: ['examine', 'dig into'] },
  { from: 'in order to', to: ['to'] },
  { from: 'due to the fact that', to: ['because'] },
  { from: 'a large number of', to: ['many'] },
  { from: 'it should be noted that', to: ['note that'] },
];

/**
 * Contraintes propres à certains mots, vérifiées au moment de la substitution.
 * `notFollowedBy` bloque le remplacement devant une locution figée
 * (« ainsi que », « permet de »…).
 */
const GUARDS = {
  ainsi: { notFollowedBy: /^\s*que\b/i },
  également: { notFollowedBy: /^\s*que\b/i },
  aussi: { notFollowedBy: /^\s*que\b/i },
  point: { notFollowedBy: /^\s*de\s+vue\b/i },
  moyen: { notFollowedBy: /^\s*(?:de|d[\u2019']|\u00e2ge)/i },
  moyens: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  manière: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  raison: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  cadre: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  effet: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  travail: { notFollowedBy: /^\s*(?:de|d[\u2019'])/i },
  simple: { notFollowedBy: /^\s*(?:fait|d[\u2019'])/i },
};

/** Dictionnaire complet par langue, prêt à l'emploi. */
export function lexiconFor(lang) {
  if (lang === 'en') {
    return {
      words: buildWords([[WORDS_EN, 'mot']]),
      phrases: PHRASES_EN,
      nominalizations: [],
      connectors: {},
      fillers: ['very', 'really', 'quite', 'basically', 'actually'],
    };
  }
  return {
    words: buildWords([
      [VERBS_FR, 'verbe'],
      [NOUNS_FR, 'nom'],
      [ADJECTIVES_FR, 'adjectif'],
      [ADVERBS_FR, 'adverbe'],
    ]),
    phrases: PHRASES_FR,
    nominalizations: NOMINALIZATIONS_FR,
    connectors: CONNECTORS_FR,
    fillers: FILLERS_FR,
  };
}

/**
 * Fusionne plusieurs dictionnaires en annotant chaque entrée de sa catégorie
 * grammaticale et de ses contraintes éventuelles.
 *
 * @param {[Record<string, string[]>, string][]} sources
 * @returns {Record<string, {options: string[], pos: string, notFollowedBy?: RegExp}>}
 */
function buildWords(sources) {
  /** @type {Record<string, any>} */
  const words = {};
  for (const [dict, pos] of sources) {
    for (const [word, options] of Object.entries(dict)) {
      const cleaned = options.filter((o) => o.toLowerCase() !== word.toLowerCase());
      if (!cleaned.length) continue;
      if (words[word]) {
        // Mot appartenant à deux catégories (« analyse », « montre ») :
        // la substitution devient trop risquée, on l'écarte.
        words[word] = { options: [], pos: 'ambigu' };
        continue;
      }
      words[word] = { options: cleaned, pos, ...(GUARDS[word] || {}) };
    }
  }
  return words;
}
