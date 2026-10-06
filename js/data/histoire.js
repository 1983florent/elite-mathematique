/*
 * ELITE MATHÉMATIQUE — « Grands noms des mathématiques ».
 * D'abord l'Afrique, puis le monde arabo-musulman, puis le reste du monde.
 * Règles : uniquement des faits largement documentés, dates prudentes (« vers »),
 * aucune citation inventée ; les traditions incertaines sont présentées comme telles.
 * `chapitres` : identifiants de js/data/programme.js, du plus pertinent au moins pertinent
 * (les trois premiers sont affichés sur la fiche).
 */
(function (root) {
  'use strict';
  var EM = root.EM;

  EM.histoire = [

    /* ============================ AFRIQUE ============================ */
    {
      nom: "L'os d'Ishango",
      epoque: 'Il y a environ 20 000 ans',
      lieu: 'Ishango, lac Édouard (RD Congo)',
      domaine: 'Numération',
      region: 'Afrique',
      texte: "L'os d'Ishango est un petit os d'animal couvert d'entailles, découvert en 1950 par le géologue belge Jean de Heinzelin de Braucourt sur le site d'Ishango, au bord du lac Édouard, dans l'actuelle République démocratique du Congo. Il est daté d'environ 20 000 ans, selon les estimations les plus courantes. Ses entailles sont disposées en trois colonnes et regroupées avec soin. Sur l'une des colonnes, on compte des groupes de $11$, $13$, $17$ et $19$ entailles : ce sont exactement les nombres premiers compris entre $10$ et $20$. Les spécialistes discutent encore de la signification de ces marques (comptage, calendrier, coïncidence…), mais l'os d'Ishango compte parmi les plus anciens témoignages connus d'une activité de comptage.",
      anecdote: "Un petit éclat de quartz est fixé à l'une de ses extrémités, peut-être pour graver. L'os est aujourd'hui exposé à l'Institut royal des sciences naturelles de Belgique, à Bruxelles.",
      chapitres: ['cm2-numeration', '6e-multiples-diviseurs', '6e-entiers']
    },
    {
      nom: 'Ahmès et le papyrus Rhind',
      epoque: 'vers 1650 av. J.-C.',
      lieu: 'Égypte ancienne',
      domaine: 'Arithmétique, géométrie',
      region: 'Afrique',
      texte: "Vers 1650 av. J.-C., le scribe égyptien Ahmès recopie un texte plus ancien d'environ deux siècles : c'est le papyrus Rhind, l'un des plus importants documents mathématiques de l'Égypte ancienne. On y trouve des tables de calcul et des problèmes résolus : partages de pains, aires de champs, volumes de greniers. Les Égyptiens écrivaient les fractions comme des sommes de fractions de numérateur $1$ toutes différentes (à quelques exceptions près, comme $\\dfrac{2}{3}$), par exemple $\\dfrac{2}{5} = \\dfrac{1}{3} + \\dfrac{1}{15}$. Pour l'aire d'un disque de diamètre $d$, ils prenaient celle d'un carré de côté $\\dfrac{8}{9}d$, ce qui revient à utiliser $\\pi \\approx \\dfrac{256}{81} \\approx 3{,}16$. Certains problèmes cherchent une « quantité » inconnue : ce sont déjà des équations du premier degré, résolues par la méthode de la « fausse position ».",
      anecdote: "Un problème célèbre du papyrus demande la quantité qui, ajoutée à son septième, donne $19$. En langage moderne : $x + \\dfrac{x}{7} = 19$, d'où $x = \\dfrac{133}{8} = 16{,}625$. Le papyrus doit son nom à l'Écossais Alexander Henry Rhind, qui l'acheta à Louxor en 1858 ; il est conservé au British Museum, à Londres.",
      chapitres: ['cm2-fractions', '6e-fractions', '4e-equations', '6e-cercle']
    },
    {
      nom: 'Euclide',
      epoque: 'vers 300 av. J.-C.',
      lieu: 'Alexandrie (Égypte)',
      domaine: 'Géométrie, arithmétique',
      region: 'Afrique',
      texte: "Euclide enseigne à Alexandrie, en Égypte, vers 300 av. J.-C. Il y rédige les <em>Éléments</em>, treize livres qui rassemblent la géométrie et l'arithmétique de son temps. Sa méthode a marqué toute l'histoire des mathématiques : partir de définitions et de quelques propriétés admises (les postulats), puis démontrer chaque résultat à partir des précédents. On y trouve les propriétés des triangles, des parallèles et du cercle, le théorème de Pythagore, mais aussi la méthode des divisions successives pour calculer le PGCD de deux entiers (l'algorithme d'Euclide) et la démonstration qu'il existe une infinité de nombres premiers. Traduits en arabe puis en latin, les <em>Éléments</em> ont servi de manuel pendant plus de deux mille ans.",
      anecdote: "On ne sait presque rien de sa vie : ni sa date de naissance ni son lieu d'origine ne sont connus avec certitude. Son œuvre, elle, compte parmi les livres les plus recopiés, traduits et imprimés de l'histoire.",
      chapitres: ['5e-pgcd-ppcm', '6e-perpendiculaires-paralleles', '5e-triangles', 'ts1-arithmetique', '6e-droites']
    },
    {
      nom: 'Ératosthène',
      epoque: 'IIIe siècle av. J.-C.',
      lieu: 'Cyrène (Libye) et Alexandrie (Égypte)',
      domaine: 'Géométrie, arithmétique',
      region: 'Afrique',
      texte: "Né à Cyrène, dans l'actuelle Libye, Ératosthène dirige au IIIe siècle av. J.-C. la grande bibliothèque d'Alexandrie. Il est célèbre pour avoir estimé la circonférence de la Terre par un raisonnement de géométrie. Le jour du solstice d'été, à midi, le Soleil est à la verticale de Syène (aujourd'hui Assouan) : les objets verticaux n'y ont pas d'ombre. Au même moment, à Alexandrie, l'ombre d'une tige verticale montre que les rayons font avec la verticale un angle de $\\dfrac{1}{50}$ de tour, soit $7{,}2^\\circ$. Les rayons du Soleil étant parallèles, cet angle est égal à l'angle au centre de la Terre entre les deux villes (ce sont des angles alternes-internes). Les deux villes étant distantes d'environ $5\\,000$ stades, la circonférence vaut environ $50 \\times 5\\,000 = 250\\,000$ stades.",
      anecdote: "On lui doit aussi le « crible d'Ératosthène » pour trouver les nombres premiers : on écrit la liste des entiers, puis on barre les multiples de $2$, de $3$, de $5$… ; les nombres qui restent sont premiers. La longueur exacte du stade qu'il utilisait n'est pas connue avec certitude, mais l'ordre de grandeur de son résultat est remarquablement juste.",
      chapitres: ['5e-angles', '6e-multiples-diviseurs', '5e-proportionnalite', '6e-cercle']
    },
    {
      nom: 'Hypatie',
      epoque: 'IVe – Ve siècle (morte en 415)',
      lieu: 'Alexandrie (Égypte)',
      domaine: 'Géométrie, astronomie',
      region: 'Afrique',
      texte: "Hypatie est la fille du mathématicien et astronome Théon d'Alexandrie, avec qui elle travaille. Elle devient elle-même une enseignante réputée de philosophie, de mathématiques et d'astronomie, dans une ville qui est alors l'un des grands centres scientifiques du monde. Les sources anciennes lui attribuent des commentaires de grands traités, comme l'<em>Arithmétique</em> de Diophante et les <em>Coniques</em> d'Apollonius. Aucun de ses écrits ne nous est parvenu de façon certaine. Elle est assassinée en 415, lors de violents troubles à Alexandrie.",
      anecdote: "Hypatie est l'une des premières femmes mathématiciennes dont la vie soit connue par des témoignages. Elle est devenue un symbole de la place des femmes dans les sciences.",
      chapitres: ['ts1-coniques']
    },
    {
      nom: 'Souleymane Bachir Diagne',
      epoque: 'né en 1955',
      lieu: 'Saint-Louis (Sénégal)',
      domaine: 'Philosophie, histoire de la logique',
      region: 'Afrique',
      texte: "Philosophe sénégalais né en 1955 à Saint-Louis, Souleymane Bachir Diagne est agrégé de philosophie. En 1988, il soutient en France une thèse de doctorat d'État consacrée à l'algèbre de la logique de George Boole, mathématicien anglais du XIXe siècle, puis publie en 1989 le livre <em>Boole, l'oiseau de nuit en plein jour</em>. Dans l'algèbre de Boole, une proposition vaut $1$ (vraie) ou $0$ (fausse), et la règle $x^2 = x$ exprime que poser deux fois la même condition ne change rien. Ce calcul logique est à la base du fonctionnement des circuits des ordinateurs. Souleymane Bachir Diagne a enseigné à l'université Cheikh Anta Diop de Dakar à partir de 1982, puis aux États-Unis, notamment à l'université Columbia de New York. Ses travaux portent aussi sur la philosophie dans le monde islamique et en Afrique.",
      anecdote: "Résoudre $x^2 = x$, c'est un exercice de 3e : $x^2 - x = 0 \\iff x(x - 1) = 0 \\iff x = 0$ ou $x = 1$. Les deux solutions sont exactement les deux valeurs de la logique de Boole.",
      chapitres: ['3e-equations', '3e-calcul-algebrique']
    },
    {
      nom: 'AIMS Sénégal',
      epoque: 'depuis 2011',
      lieu: 'Mbour (Sénégal)',
      domaine: 'Formation et recherche en sciences mathématiques',
      region: 'Afrique',
      texte: "L'Institut africain des sciences mathématiques (AIMS, de l'anglais <em>African Institute for Mathematical Sciences</em>) est un réseau panafricain de centres d'excellence. Le premier centre a été fondé en 2003 à Muizenberg, près du Cap, en Afrique du Sud, à l'initiative du physicien Neil Turok. Le centre du Sénégal, ouvert en 2011 à Mbour, sur la Petite-Côte, est le deuxième du réseau. Il accueille des étudiants venus de tout le continent pour une formation de niveau master en sciences mathématiques, et il abrite un centre de recherche.",
      anecdote: "Le centre de recherche d'AIMS Sénégal est né en 2013 avec la création d'une chaire de recherche en mathématiques et applications, soutenue par la fondation allemande Alexander von Humboldt et confiée au mathématicien sénégalais Mouhamed Moustapha Fall.",
      chapitres: []
    },
    {
      nom: 'Mouhamed Moustapha Fall',
      epoque: 'XXIe siècle',
      lieu: 'Sénégal (AIMS Sénégal, Mbour)',
      domaine: 'Analyse, équations aux dérivées partielles',
      region: 'Afrique',
      texte: "Mouhamed Moustapha Fall est un mathématicien sénégalais. Diplômé de l'université Gaston-Berger de Saint-Louis en 2004, il poursuit sa formation à Trieste, en Italie, au Centre international de physique théorique (ICTP), puis à l'École internationale d'études avancées (SISSA), où il obtient son doctorat en 2009. Après des postes en Belgique, en Allemagne (comme boursier de la fondation Alexander von Humboldt) et en Italie, il devient en 2013 titulaire de la chaire de recherche « Mathématiques et applications » d'AIMS Sénégal, soutenue par cette même fondation. Ses recherches portent sur les équations aux dérivées partielles et l'analyse géométrique : des équations qui relient une fonction de plusieurs variables à ses dérivées et qui décrivent, par exemple, la forme de certaines surfaces ou des phénomènes physiques.",
      anecdote: "Sorti major de sa promotion à l'université Gaston-Berger en 2004, il a été sélectionné pour le programme de diplôme en mathématiques de l'ICTP : un parcours qui a commencé au Sénégal et l'y a ramené.",
      chapitres: ['ts-equations-differentielles', 'ts-derivabilite']
    },

    /* ===================== MONDE ARABO-MUSULMAN ====================== */
    {
      nom: 'Al-Khwârizmî',
      epoque: 'IXe siècle',
      lieu: 'Bagdad',
      domaine: 'Algèbre, numération',
      region: 'Monde arabo-musulman',
      texte: "Muhammad ibn Mûsâ al-Khwârizmî travaille à Bagdad au IXe siècle, à la « Maison de la sagesse », un centre de savoir où l'on traduit et prolonge les œuvres grecques, persanes et indiennes. Vers 820–830, il écrit un traité de calcul par « restauration » (<em>al-jabr</em>) et « comparaison » (<em>al-muqâbala</em>), qui présente de façon systématique la résolution des équations du premier et du second degré. Le mot « algèbre » vient de <em>al-jabr</em>. Il explique aussi le calcul avec les chiffres indiens et la numération de position. Traduit en latin, cet ouvrage a contribué à faire connaître ces chiffres en Europe, et la forme latine de son nom, <em>Algoritmi</em>, a donné le mot « algorithme ».",
      anecdote: "Ses équations sont entièrement écrites en mots. L'un de ses exemples célèbres, « un carré et dix racines égalent trente-neuf », s'écrit aujourd'hui $x^2 + 10x = 39$. Il le résout en complétant un carré : $x^2 + 10x + 25 = 64$, donc $(x + 5)^2 = 64$, d'où $x + 5 = 8$ et $x = 3$. Il ne retenait que les solutions positives.",
      chapitres: ['3e-equations', '2s-second-degre', '3e-calcul-algebrique', '4e-equations', '1l-equations']
    },
    {
      nom: 'Ibn al-Haytham',
      epoque: 'vers 965 – vers 1040',
      lieu: 'Bassora (Irak) et Le Caire (Égypte)',
      domaine: 'Optique, géométrie',
      region: 'Monde arabo-musulman',
      texte: "Né à Bassora vers 965, Ibn al-Haytham, appelé Alhazen en Europe, passe une grande partie de sa vie au Caire. Il y écrit, entre 1011 et 1021 environ, un grand <em>Livre de l'optique</em> (<em>Kitâb al-Manâzir</em>). Il y montre que nous voyons parce que la lumière venue des objets entre dans l'œil, et non parce que l'œil émettrait des rayons. Surtout, il appuie ses affirmations sur des expériences soigneusement décrites, ce qui fait de lui l'un des pionniers de la méthode expérimentale. Il étudie la réflexion et la réfraction de la lumière à l'aide de la géométrie : sur un miroir, l'angle d'incidence est égal à l'angle de réflexion, une loi déjà connue des Grecs qu'il utilise dans des situations bien plus difficiles.",
      anecdote: "Un problème de géométrie porte son nom : le « problème d'Alhazen », qui consiste à trouver le point d'un miroir sphérique où un rayon doit se réfléchir pour aller d'un point donné à un autre. En 2015, l'Année internationale de la lumière, proclamée par les Nations unies, a célébré les mille ans de son <em>Livre de l'optique</em>.",
      chapitres: ['6e-symetrie-orthogonale', '5e-angles', '2s-transformations']
    },
    {
      nom: 'Omar Khayyam',
      epoque: 'vers 1048 – vers 1131',
      lieu: 'Nichapour (Perse, actuel Iran)',
      domaine: 'Algèbre, astronomie',
      region: 'Monde arabo-musulman',
      texte: "Né à Nichapour, en Perse, Omar Khayyam est à la fois mathématicien, astronome, philosophe et poète. Dans son traité d'algèbre, il classe de façon systématique les équations du troisième degré, comme $x^3 + ax = b$ avec $a$ et $b$ positifs. Il montre comment construire leurs solutions positives par la géométrie, en faisant se couper deux coniques, par exemple un cercle et une parabole. Au service du sultan seldjoukide Malik Shah, il participe à la réforme du calendrier qui aboutit au calendrier dit « jalâlî », remarquablement précis. Il a aussi calculé avec une grande précision la durée de l'année solaire.",
      anecdote: "En Europe, il est surtout connu comme poète : ses quatrains (<em>Rubâiyât</em>) ont été rendus célèbres en 1859 par la traduction anglaise d'Edward FitzGerald.",
      chapitres: ['1s-polynomes', 'ts1-coniques', '2s-second-degre']
    },
    {
      nom: 'Al-Kashi',
      epoque: 'vers 1380 – 1429',
      lieu: 'Kashan (Perse) et Samarcande',
      domaine: 'Calcul, trigonométrie',
      region: 'Monde arabo-musulman',
      texte: "Ghiyath al-Din Jamshid al-Kashi, né à Kashan, en Perse, travaille à Samarcande (dans l'actuel Ouzbékistan) auprès du prince astronome Ulugh Beg et de son observatoire. C'est un calculateur exceptionnel : en 1424, dans son <em>Traité de la circonférence</em>, il obtient $2\\pi$ avec $16$ décimales exactes, un record qui tiendra plus d'un siècle et demi. Dans <em>La Clé de l'arithmétique</em> (1427), il utilise et explique les fractions décimales. En France, on donne son nom à la relation qui généralise le théorème de Pythagore à un triangle quelconque : $$a^2 = b^2 + c^2 - 2bc\\cos\\hat{A}.$$ Cette relation était connue sous forme géométrique depuis Euclide ; Al-Kashi en a donné une forme adaptée aux calculs trigonométriques.",
      anecdote: "Pour son calcul de $\\pi$, il a utilisé des polygones réguliers de $3 \\times 2^{28}$ côtés, soit plus de huit cents millions de côtés !",
      chapitres: ['1s-produit-scalaire', '6e-decimaux', '6e-cercle', '3e-angles-inscrits']
    },

    /* ========================= RESTE DU MONDE ======================== */
    {
      nom: 'Thalès de Milet',
      epoque: 'VIe siècle av. J.-C.',
      lieu: 'Milet (côte de l\'actuelle Turquie)',
      domaine: 'Géométrie',
      region: 'Reste du monde',
      texte: "Thalès vit à Milet, une cité grecque d'Asie Mineure, au VIe siècle av. J.-C. Les Grecs le considéraient comme l'un des premiers savants à avoir cherché à expliquer le monde par la raison. Aucun de ses écrits ne nous est parvenu : ce que l'on sait de lui vient d'auteurs bien plus tardifs. La tradition lui attribue un voyage en Égypte et plusieurs résultats de géométrie, par exemple : les angles à la base d'un triangle isocèle sont égaux. On ne sait pas s'il connaissait le théorème qui porte son nom en France ; ce résultat sur les parallèles et les longueurs proportionnelles figure en tout cas dans les <em>Éléments</em> d'Euclide.",
      anecdote: "Selon la tradition, il aurait mesuré la hauteur d'une pyramide d'Égypte grâce aux ombres : au moment où l'ombre d'un bâton est égale à sa hauteur, l'ombre de la pyramide est égale à la hauteur de la pyramide. Dans les pays anglophones, le « théorème de Thalès » désigne un autre résultat : un triangle inscrit dans un cercle, dont un côté est un diamètre, est rectangle.",
      chapitres: ['3e-thales', '3e-angles-inscrits', '5e-triangles', '4e-cercle-tangente']
    },
    {
      nom: 'Pythagore',
      epoque: 'VIe siècle av. J.-C.',
      lieu: 'Samos (Grèce) et Crotone (Italie du Sud)',
      domaine: 'Arithmétique, géométrie',
      region: 'Reste du monde',
      texte: "Pythagore naît sur l'île grecque de Samos, puis fonde à Crotone, dans le sud de l'Italie, une communauté de disciples, les pythagoriciens, à la fois école de pensée et mode de vie. Pour eux, les nombres entiers sont la clé de l'univers : ils étudient les nombres pairs et impairs, les nombres « figurés » (triangulaires, carrés) et les rapports de nombres en musique. Pythagore n'a laissé aucun écrit, et il est difficile de distinguer ce qu'il a trouvé lui-même de ce que ses disciples ont découvert. Le théorème qui porte son nom était d'ailleurs connu bien avant lui : des tablettes babyloniennes écrites plus de mille ans plus tôt montrent que la relation $a^2 + b^2 = c^2$ était déjà utilisée. On attribue aux pythagoriciens la découverte que le côté et la diagonale d'un carré n'ont pas de commune mesure : en langage moderne, $\\sqrt{2}$ ne s'écrit pas comme un quotient de deux entiers. C'est la première rencontre avec les nombres irrationnels.",
      anecdote: "Le triplet $(3 \\,;\\, 4 \\,;\\, 5)$ est le plus simple des triplets pythagoriciens : $3^2 + 4^2 = 9 + 16 = 25 = 5^2$. Une corde fermée partagée par des nœuds en $12$ intervalles égaux permet donc de former un triangle de côtés $3$, $4$ et $5$, et ainsi de construire un angle droit sur le terrain.",
      chapitres: ['4e-pythagore', '3e-racines', '2s-calcul-reel']
    },
    {
      nom: 'Archimède',
      epoque: 'vers 287 – 212 av. J.-C.',
      lieu: 'Syracuse (Sicile)',
      domaine: 'Géométrie, mécanique',
      region: 'Reste du monde',
      texte: "Archimède vit à Syracuse, cité grecque de Sicile, et compte parmi les plus grands savants de l'Antiquité. En encadrant le cercle entre des polygones réguliers inscrits et circonscrits, jusqu'à $96$ côtés, il démontre que $$3 + \\frac{10}{71} < \\pi < 3 + \\frac{1}{7}.$$ Il calcule aussi l'aire de la sphère et le volume de la boule : la boule occupe les deux tiers du cylindre dans lequel elle est exactement contenue ($\\dfrac{4}{3}\\pi r^3$ contre $2\\pi r^3$). Pour obtenir ces résultats, il découpe les figures en morceaux de plus en plus fins, une idée qui annonce le calcul intégral. En physique, on lui doit la théorie du levier et le principe qui porte son nom sur les corps plongés dans un liquide.",
      anecdote: "Il considérait le résultat sur la sphère et le cylindre comme l'une de ses plus belles découvertes et avait souhaité qu'une sphère dans un cylindre soit représentée sur sa tombe. Plus d'un siècle après sa mort, l'orateur romain Cicéron raconte avoir retrouvé cette tombe grâce à ce dessin. Archimède est mort en 212 av. J.-C., lors de la prise de Syracuse par les Romains.",
      chapitres: ['6e-cercle', '3e-espace', '5e-prisme-cylindre', 'ts-integrales']
    },
    {
      nom: 'Fibonacci (Léonard de Pise)',
      epoque: 'vers 1170 – vers 1250',
      lieu: 'Pise (Italie) et Béjaïa (Algérie)',
      domaine: 'Arithmétique, suites',
      region: 'Reste du monde',
      texte: "Léonard de Pise passe une partie de sa jeunesse à Béjaïa (Bougie), dans l'actuelle Algérie, où son père représente les marchands de Pise. Il y apprend le calcul avec les chiffres indo-arabes, qu'il approfondit lors de voyages autour de la Méditerranée. En 1202, il publie le <em>Liber Abaci</em> (« livre du calcul »), qui montre aux marchands européens les avantages de ces chiffres et de la numération de position, avec le zéro, sur les chiffres romains. Le livre contient un problème célèbre de couples de lapins qui se reproduisent chaque mois : leurs nombres successifs forment la suite $1, 1, 2, 3, 5, 8, 13, 21, \\dots$, où chaque terme est la somme des deux précédents : $u_{n+2} = u_{n+1} + u_n$. Le quotient de deux termes consécutifs se rapproche du nombre d'or $\\varphi = \\dfrac{1 + \\sqrt{5}}{2} \\approx 1{,}618$.",
      anecdote: "Le nom « Fibonacci », contraction de <em>filius Bonacci</em> (« fils de Bonacci »), ne s'est imposé que bien plus tard, au XIXe siècle.",
      chapitres: ['1s-suites', 'ts-suites', 'cm2-numeration', 'tl-suites']
    },
    {
      nom: 'René Descartes',
      epoque: '1596 – 1650',
      lieu: 'France, Pays-Bas, Suède',
      domaine: 'Géométrie analytique',
      region: 'Reste du monde',
      texte: "Philosophe et mathématicien français, René Descartes publie en 1637 le <em>Discours de la méthode</em>, suivi de trois essais, dont <em>La Géométrie</em>. Il y montre comment traduire un problème de géométrie en équations et le résoudre par le calcul algébrique : c'est l'une des sources de la géométrie analytique, qui permet aujourd'hui de décrire une droite par une équation comme $y = ax + b$. On lui doit des notations encore utilisées : les dernières lettres de l'alphabet ($x$, $y$, $z$) pour les inconnues, les premières ($a$, $b$, $c$) pour les quantités connues, et les exposants comme dans $x^3$. Le repère « cartésien » porte son nom.",
      anecdote: "Il a vécu une grande partie de sa vie aux Pays-Bas. Invité par la reine Christine de Suède, il meurt à Stockholm en 1650.",
      chapitres: ['3e-reperage', '5e-reperage', '2s-droites', '3e-applications-affines']
    },
    {
      nom: 'Pierre de Fermat',
      epoque: 'début du XVIIe siècle – 1665',
      lieu: 'Toulouse (France)',
      domaine: 'Théorie des nombres, probabilités',
      region: 'Reste du monde',
      texte: "Magistrat à Toulouse, Pierre de Fermat fait des mathématiques pendant son temps libre et fait connaître ses découvertes par des lettres. Il développe, à la même époque que Descartes et indépendamment de lui, la géométrie analytique, et met au point une méthode pour trouver les maximums et les minimums, qui annonce le calcul des dérivées. En 1654, sa correspondance avec Blaise Pascal sur le partage des mises d'un jeu interrompu pose les bases du calcul des probabilités. Il est surtout célèbre en théorie des nombres : son « petit théorème » affirme que si $p$ est un nombre premier et $a$ un entier non divisible par $p$, alors $$a^{p-1} \\equiv 1 \\pmod p.$$",
      anecdote: "Dans la marge de son exemplaire de l'<em>Arithmétique</em> de Diophante, Fermat a noté que l'équation $x^n + y^n = z^n$ n'a pas de solution en entiers strictement positifs pour $n \\geq 3$, en affirmant que la marge était trop étroite pour contenir sa démonstration. Ce « dernier théorème de Fermat » a résisté plus de trois siècles, jusqu'à la démonstration du mathématicien britannique Andrew Wiles, achevée en 1994.",
      chapitres: ['ts1-arithmetique', 'ts-probabilites', '1s-derivation']
    },
    {
      nom: 'Blaise Pascal',
      epoque: '1623 – 1662',
      lieu: 'Clermont, Rouen et Paris (France)',
      domaine: 'Probabilités, dénombrement, géométrie',
      region: 'Reste du monde',
      texte: "Né à Clermont (aujourd'hui Clermont-Ferrand), Blaise Pascal montre très jeune un talent exceptionnel : adolescent, il écrit un essai sur les coniques. Vers 19 ans, pour aider son père chargé de calculs d'impôts, il invente une machine à calculer mécanique, la « pascaline », capable d'additionner et de soustraire. En 1654, sa correspondance avec Fermat sur le « problème des partis » fonde le calcul des probabilités. La même année, il rédige le <em>Traité du triangle arithmétique</em>, où il étudie le tableau de nombres qui porte aujourd'hui son nom et l'applique aux combinaisons : $$C_n^p = C_{n-1}^{p-1} + C_{n-1}^p.$$ Il y emploie de façon explicite le raisonnement par récurrence.",
      anecdote: "Ce triangle de nombres était connu bien avant lui, notamment en Chine et dans le monde arabo-persan. Pascal s'est aussi illustré en physique : l'unité de pression, le pascal, porte son nom.",
      chapitres: ['1s-denombrement', 'ts-probabilites', 'tl-probabilites', 'ts-suites']
    },
    {
      nom: 'Isaac Newton',
      epoque: 'XVIIe – XVIIIe siècle (mort en 1727)',
      lieu: 'Angleterre (Cambridge, Londres)',
      domaine: 'Analyse, physique',
      region: 'Reste du monde',
      texte: "Isaac Newton étudie puis enseigne à l'université de Cambridge. Dans les années 1660, il met au point sa « méthode des fluxions », une première forme du calcul différentiel et intégral : il sait calculer la vitesse de variation d'une quantité (sa dérivée) et retrouver une quantité à partir de sa vitesse de variation (une primitive). En 1687, dans les <em>Principes mathématiques de la philosophie naturelle</em>, il énonce les lois du mouvement et la loi de la gravitation universelle, qui explique à la fois la chute des corps et le mouvement elliptique des planètes autour du Soleil. On lui doit aussi une méthode de calcul de valeurs approchées des solutions d'une équation, et des travaux d'optique sur la décomposition de la lumière blanche par un prisme.",
      anecdote: "Newton et Leibniz ont découvert le calcul différentiel chacun de leur côté, ce qui a provoqué une longue querelle de priorité. Pendant les trente dernières années de sa vie, Newton a aussi dirigé la Monnaie royale d'Angleterre, qui fabriquait les pièces.",
      chapitres: ['1s-derivation', 'ts-primitives', 'ts-equations-differentielles', 'ts-integrales', 'ts1-coniques']
    },
    {
      nom: 'Gottfried Wilhelm Leibniz',
      epoque: '1646 – 1716',
      lieu: 'Leipzig, Paris, Hanovre',
      domaine: 'Analyse, logique',
      region: 'Reste du monde',
      texte: "Philosophe, diplomate et mathématicien allemand, Leibniz développe le calcul différentiel et intégral indépendamment de Newton, notamment pendant son séjour à Paris dans les années 1670, et le publie à partir de 1684. Ses notations, très efficaces, sont toujours utilisées : $\\dfrac{dy}{dx}$ pour la dérivée et le symbole $\\displaystyle\\int$, un S allongé pour « somme », pour l'intégrale : $$\\int_a^b f(x)\\,dx.$$ Il construit aussi une machine à calculer capable de multiplier, et étudie le système binaire, où tous les nombres s'écrivent avec seulement $0$ et $1$ : par exemple, $13$ s'écrit $1101$ en binaire, car $13 = 8 + 4 + 1$. Il rêve enfin d'un langage universel qui permettrait de raisonner en calculant, une idée qui annonce la logique mathématique.",
      anecdote: "En 1703, il présente l'arithmétique binaire dans un article écrit en français pour l'Académie royale des sciences de Paris. Ce système est aujourd'hui celui de tous les ordinateurs.",
      chapitres: ['ts-integrales', '1s-derivation', 'ts-primitives', 'cm2-numeration']
    },
    {
      nom: 'Leonhard Euler',
      epoque: '1707 – 1783',
      lieu: 'Bâle (Suisse), Saint-Pétersbourg, Berlin',
      domaine: 'Analyse, nombres, géométrie',
      region: 'Reste du monde',
      texte: "Né à Bâle, en Suisse, Leonhard Euler travaille surtout à Saint-Pétersbourg et à Berlin. C'est l'un des mathématiciens les plus productifs de l'histoire : ses œuvres complètes occupent plus de soixante-dix volumes. Il a imposé beaucoup de notations que tu utilises : $f(x)$ pour une fonction, $e$ pour la base des logarithmes népériens, $i$ pour un nombre dont le carré vaut $-1$, $\\sum$ pour une somme ; il a aussi popularisé $\\pi$. Il établit la formule $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$, d'où l'on tire $e^{i\\pi} + 1 = 0$, qui relie les nombres $e$, $i$, $\\pi$, $1$ et $0$. On lui doit aussi la relation $S - A + F = 2$ entre les nombres de sommets, d'arêtes et de faces d'un polyèdre convexe (pour un cube : $8 - 12 + 6 = 2$).",
      anecdote: "Euler a perdu presque complètement la vue dans les dernières années de sa vie, sans que sa production ralentisse : il menait ses calculs de tête, grâce à une mémoire prodigieuse, et les dictait.",
      chapitres: ['ts-complexes', 'ts-exponentielle', '2s-fonctions', '3e-espace']
    },
    {
      nom: 'Carl Friedrich Gauss',
      epoque: '1777 – 1855',
      lieu: 'Brunswick et Göttingen (Allemagne)',
      domaine: 'Nombres, algèbre, astronomie',
      region: 'Reste du monde',
      texte: "Surnommé le « prince des mathématiciens », Carl Friedrich Gauss naît à Brunswick dans une famille modeste. En 1796, alors qu'il n'a pas encore 19 ans, il montre qu'on peut construire à la règle et au compas un polygone régulier à $17$ côtés : c'est la première avancée sur cette question depuis l'Antiquité. En 1801, ses <em>Recherches arithmétiques</em> fondent la théorie moderne des nombres et introduisent la notation des congruences $a \\equiv b \\pmod n$. La même année, il calcule l'orbite de Cérès, un astre que les astronomes avaient perdu de vue, et qui est retrouvé là où il l'avait prévu. La méthode d'élimination utilisée pour résoudre les systèmes d'équations linéaires porte son nom (« pivot de Gauss »), même si elle était connue bien avant lui, notamment en Chine.",
      anecdote: "Selon une anecdote racontée par l'un de ses premiers biographes, et peut-être embellie depuis, le jeune Gauss aurait calculé très vite la somme des entiers de $1$ à $100$ demandée par son maître, en les associant par paires de somme $101$ : $$1 + 2 + \\dots + 100 = \\frac{100 \\times 101}{2} = 5\\,050.$$",
      chapitres: ['2s-systemes', 'ts1-arithmetique', '1s-suites', '3e-angles-inscrits']
    },
    {
      nom: 'Sophie Germain',
      epoque: '1776 – 1831',
      lieu: 'Paris (France)',
      domaine: 'Théorie des nombres, élasticité',
      region: 'Reste du monde',
      texte: "Pendant la Révolution française, la jeune Sophie Germain se passionne pour les mathématiques en lisant les livres de la bibliothèque de son père, malgré l'opposition de ses parents au début. Les femmes n'étant pas admises à l'École polytechnique, elle se procure les cours et envoie un travail au mathématicien Lagrange sous le nom d'un ancien élève, « Monsieur Le Blanc ». Lagrange, impressionné, découvre qu'il s'agit d'une jeune femme et l'encourage. Elle correspond ensuite avec Gauss sur la théorie des nombres, d'abord sous le même pseudonyme. En 1816, elle remporte le prix de l'Académie des sciences pour ses travaux sur les vibrations des surfaces élastiques : c'est la première femme à recevoir un prix de cette Académie. On appelle aujourd'hui « nombre premier de Sophie Germain » un nombre premier $p$ tel que $2p + 1$ soit aussi premier, comme $2$, $3$, $5$, $11$ ou $23$.",
      anecdote: "En 1806, quand les troupes françaises occupent Brunswick, la ville de Gauss, elle craint qu'il ne connaisse le sort d'Archimède et demande à un général ami de sa famille de veiller sur lui. C'est ainsi que Gauss apprend que son correspondant « Le Blanc » est une femme.",
      chapitres: ['ts1-arithmetique', '6e-multiples-diviseurs', '5e-pgcd-ppcm']
    },
    {
      nom: 'Évariste Galois',
      epoque: '1811 – 1832',
      lieu: 'Bourg-la-Reine et Paris (France)',
      domaine: 'Algèbre',
      region: 'Reste du monde',
      texte: "Évariste Galois se passionne très jeune pour les mathématiques, mais échoue deux fois au concours d'entrée de l'École polytechnique. Il s'attaque à une question ouverte depuis des siècles : quand peut-on résoudre une équation polynomiale « par radicaux », c'est-à-dire avec les opérations usuelles et des racines, comme on résout $ax^2 + bx + c = 0$ grâce à $\\sqrt{\\Delta}$ ? Pour y répondre, il étudie les permutations des solutions d'une équation et dégage la notion de « groupe », devenue centrale dans toutes les mathématiques. Ses mémoires, envoyés à l'Académie des sciences, sont mal compris de son vivant. Républicain engagé, il est arrêté à deux reprises et meurt en mai 1832, à vingt ans, des suites d'un duel.",
      anecdote: "La veille du duel, il écrit à son ami Auguste Chevalier une longue lettre qui résume ses découvertes. Ses travaux ne sont publiés qu'en 1846, par le mathématicien Joseph Liouville, qui en reconnaît l'importance.",
      chapitres: ['2s-second-degre', '1s-polynomes', 'ts-complexes']
    },
    {
      nom: 'Ada Lovelace',
      epoque: '1815 – 1852',
      lieu: 'Londres (Royaume-Uni)',
      domaine: 'Calcul, débuts de l\'informatique',
      region: 'Reste du monde',
      texte: "Fille du poète Lord Byron, Ada Lovelace reçoit, à la demande de sa mère, une solide éducation mathématique. Elle se lie avec l'inventeur Charles Babbage, qui conçoit une « machine analytique » : une machine à calculer mécanique programmable, qui ne sera jamais construite. En 1843, elle traduit en anglais un article de l'ingénieur italien Luigi Menabrea sur cette machine et y ajoute des notes plus longues que l'article lui-même. L'une d'elles décrit pas à pas comment la machine pourrait calculer une suite de nombres (les nombres de Bernoulli) : on la considère souvent comme le premier programme informatique publié. Elle imagine aussi que de telles machines pourraient traiter autre chose que des nombres, par exemple de la musique.",
      anecdote: "Un langage de programmation développé à la fin des années 1970 pour le département de la Défense des États-Unis porte son prénom : Ada.",
      chapitres: ['1s-suites', 'ts-suites']
    },
    {
      nom: 'Emmy Noether',
      epoque: '1882 – 1935',
      lieu: 'Erlangen et Göttingen (Allemagne), puis États-Unis',
      domaine: 'Algèbre, physique mathématique',
      region: 'Reste du monde',
      texte: "Emmy Noether grandit à Erlangen, en Allemagne, où son père enseigne les mathématiques à l'université. À une époque où les femmes sont à peine admises dans les universités allemandes, elle obtient un doctorat en 1907. En 1915, les mathématiciens David Hilbert et Felix Klein l'invitent à Göttingen, où elle enseigne pendant plusieurs années sans titre officiel ni salaire. En 1918, elle démontre un théorème fondamental pour la physique : à chaque symétrie d'un système correspond une grandeur qui se conserve (par exemple, l'énergie). Elle devient ensuite l'une des fondatrices de l'algèbre moderne, qui étudie des structures comme les groupes et les anneaux. Chassée de son poste en 1933 par le régime nazi parce qu'elle est juive, elle part enseigner aux États-Unis, au Bryn Mawr College, où elle meurt en 1935.",
      anecdote: "À Göttingen, n'ayant pas le droit d'enseigner en son nom propre, elle a d'abord donné des cours officiellement annoncés sous le nom de Hilbert.",
      chapitres: ['2s-transformations', '1s-polynomes', 'ts1-arithmetique']
    },
    {
      nom: 'Srinivasa Ramanujan',
      epoque: '1887 – 1920',
      lieu: 'Inde et Cambridge (Royaume-Uni)',
      domaine: 'Théorie des nombres, séries',
      region: 'Reste du monde',
      texte: "Né dans le sud de l'Inde dans une famille modeste, Srinivasa Ramanujan apprend presque seul les mathématiques avancées à partir de quelques livres et remplit des cahiers entiers de formules nouvelles. En 1913, alors employé de bureau à Madras, il envoie une lettre pleine de résultats au mathématicien britannique G. H. Hardy, à Cambridge. Hardy reconnaît un talent exceptionnel et le fait venir en Angleterre en 1914. Ensemble, ils obtiennent des résultats remarquables, notamment sur les partitions d'un entier, c'est-à-dire ses écritures comme somme d'entiers positifs : $4$, $3 + 1$, $2 + 2$, $2 + 1 + 1$ et $1 + 1 + 1 + 1$ sont les $5$ partitions de $4$. Élu à la Royal Society de Londres en 1918, il rentre en Inde en 1919, gravement malade, et meurt en 1920 à 32 ans. Ses cahiers sont encore étudiés aujourd'hui.",
      anecdote: "Hardy a raconté qu'en rendant visite à Ramanujan malade, il était venu dans un taxi portant le numéro $1729$, nombre qui lui semblait sans intérêt. Ramanujan lui répondit aussitôt que c'était au contraire le plus petit entier qui s'écrit de deux façons différentes comme somme de deux cubes : $$1729 = 1^3 + 12^3 = 9^3 + 10^3.$$",
      chapitres: ['4e-puissances', 'ts1-arithmetique', 'ts-suites']
    },
    {
      nom: 'Alan Turing',
      epoque: '1912 – 1954',
      lieu: 'Royaume-Uni (Cambridge, Bletchley Park, Manchester)',
      domaine: 'Logique, informatique, cryptographie',
      region: 'Reste du monde',
      texte: "Mathématicien britannique, Alan Turing publie en 1936 un article fondateur dans lequel il imagine une machine abstraite, la « machine de Turing », capable d'exécuter n'importe quel algorithme : c'est le modèle théorique des ordinateurs. Il y montre aussi qu'il existe des problèmes qu'aucun algorithme ne peut résoudre. Pendant la Seconde Guerre mondiale, à Bletchley Park, il joue un rôle clé dans le décryptage des messages chiffrés par la machine allemande Enigma. Après la guerre, il participe à la conception des premiers ordinateurs et s'interroge, en 1950, sur la possibilité pour une machine de penser, en proposant un test qui porte aujourd'hui son nom. Il meurt en 1954, à 41 ans.",
      anecdote: "Le prix Turing, souvent présenté comme le « prix Nobel de l'informatique », porte son nom depuis 1966, et son portrait figure depuis 2021 sur les billets de 50 livres sterling de la Banque d'Angleterre.",
      chapitres: ['ts1-arithmetique']
    },
    {
      nom: 'Katherine Johnson',
      epoque: '1918 – 2020',
      lieu: 'Virginie-Occidentale et Virginie (États-Unis)',
      domaine: 'Calcul de trajectoires spatiales',
      region: 'Reste du monde',
      texte: "Née en Virginie-Occidentale, Katherine Johnson est une mathématicienne afro-américaine. Élève brillante, elle termine ses études universitaires à 18 ans, dans un pays où la ségrégation raciale limite fortement les possibilités offertes aux Noirs. Entrée en 1953 au centre de recherche de Langley, qui deviendra un centre de la NASA, elle calcule des trajectoires d'avions puis d'engins spatiaux à l'aide de la géométrie analytique et des équations du mouvement. En 1961, elle effectue l'analyse de trajectoire du vol d'Alan Shepard, premier Américain dans l'espace, et en 1962 elle vérifie, à la demande de l'astronaute John Glenn lui-même, les calculs de l'ordinateur pour son vol en orbite autour de la Terre. Elle participe ensuite aux calculs de la mission Apollo 11, qui conduit les premiers humains sur la Lune en 1969.",
      anecdote: "En 2015, à 97 ans, elle reçoit la médaille présidentielle de la Liberté, la plus haute distinction civile des États-Unis. Son histoire, avec celle de ses collègues Dorothy Vaughan et Mary Jackson, est racontée dans le film <em>Les Figures de l'ombre</em> (2016).",
      chapitres: ['ts1-coniques', 'ts-equations-differentielles', '3e-trigonometrie']
    },
    {
      nom: 'Maryam Mirzakhani',
      epoque: '1977 – 2017',
      lieu: 'Téhéran (Iran) et Stanford (États-Unis)',
      domaine: 'Géométrie, systèmes dynamiques',
      region: 'Reste du monde',
      texte: "Née à Téhéran, Maryam Mirzakhani remporte deux médailles d'or aux Olympiades internationales de mathématiques, en 1994 et en 1995, la seconde avec un score parfait. Après un doctorat à l'université Harvard, elle devient professeure à l'université Stanford, en Californie. Ses recherches portent sur la géométrie des surfaces courbes, en particulier des surfaces dites « hyperboliques », et sur les plus courts chemins que l'on peut tracer sur elles (les géodésiques). En 2014, elle devient la première femme, et la première personne iranienne, à recevoir la médaille Fields, l'une des plus prestigieuses récompenses en mathématiques. Elle meurt d'un cancer en 2017, à 40 ans.",
      anecdote: "Son anniversaire, le 12 mai, a été choisi pour célébrer chaque année les femmes en mathématiques dans le monde entier.",
      chapitres: ['2s-espace', '3e-espace']
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
