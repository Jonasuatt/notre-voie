const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function genPassword(len = 14) {
  return crypto.randomBytes(len).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
}

// Rubriques éditoriales — cf. cahier des charges §3.1 (docx "rubriques-formats-modules")
const RUBRIQUES_EDITORIALES = [
  { nom: 'Politique', angleEditorial: "Vie institutionnelle, gouvernement, partis, Assemblée nationale", couleur: '#0B6FA8' },
  { nom: 'Refondation', angleEditorial: "Suivi des réformes institutionnelles, décryptage des lois et de leur application concrète", couleur: '#0E8FD6' },
  { nom: 'Économie', angleEditorial: "Entreprises, finances publiques, secteurs productifs (cacao, pétrole, mines)", couleur: '#0B6FA8' },
  { nom: 'Vie chère', angleEditorial: "Prix, pouvoir d'achat, emploi — avec un widget de suivi des prix de première nécessité", couleur: '#E6008C' },
  { nom: 'Société', angleEditorial: "Éducation, santé, quotidien des Ivoiriens", couleur: '#0B6FA8' },
  { nom: 'Régions', angleEditorial: "Actualité hyperlocale hors Abidjan (infrastructures, gouvernance locale, vie quotidienne)", couleur: '#0B6FA8' },
  { nom: 'Diaspora', angleEditorial: "Transferts d'argent, démarches administratives, actualité des communautés à l'étranger", couleur: '#E8B84B' },
  { nom: 'Culture', angleEditorial: "Musique, mode, langue (nouchi), cinéma, patrimoine", couleur: '#E6008C' },
  { nom: 'Sport', angleEditorial: "Priorité au football et sport local (championnat ivoirien), pas seulement l'international", couleur: '#0B6FA8' },
  { nom: 'Vérité ou Intox', angleEditorial: "Vérification des rumeurs et vidéos virales identifiées sur les réseaux sociaux", couleur: '#E8B84B' },
];

// Rubriques propres à la rédaction web (Info en direct) — pas de matière
// première dans les PDF du journal imprimé, donc absentes du Quotidien (cf.
// RubriqueTabs.js et Header.js). Retenues après synthèse de propositions
// Gemini/DeepSeek soumises par l'utilisateur : les 4 manques les plus
// consensuels entre les deux, sans redondance avec les rubriques existantes.
// Créées vides : aucun article n'est inventé pour les peupler.
const RUBRIQUES_INFO_DIRECT = [
  { nom: 'Éducation', angleEditorial: "Examens, bourses, universités, grèves scolaires — la vie étudiante et scolaire ivoirienne", couleur: '#0E8FD6' },
  { nom: 'Santé', angleEditorial: "Alertes sanitaires, prévention, système de santé, nutrition", couleur: '#E6008C' },
  { nom: 'Environnement', angleEditorial: "Cadre de vie, inondations, gestion des déchets, développement durable", couleur: '#0B6FA8' },
  { nom: 'Numérique', angleEditorial: "Fintech (Orange Money, Wave), arnaques en ligne, intelligence artificielle, startups tech", couleur: '#E8B84B' },
];

// Rubriques de service — cf. cahier des charges §3.2
const RUBRIQUES_SERVICE = [
  { nom: 'Photos légendées', angleEditorial: "Reportages et événements racontés en images, chaque photo légendée et créditée" },
  { nom: 'Vidéos', angleEditorial: "Reportages vidéo ordinaires et enquêtes filmées — le direct a sa propre rubrique (Live TV)" },
  { nom: 'Live TV', angleEditorial: "Productions filmées en direct et leur archivage : plateaux, retransmissions, événements couverts en vidéo" },
  { nom: 'Audio / Podcasts', angleEditorial: "Articles écoutés, interviews, journal parlé quotidien" },
  { nom: 'Archives / Kiosque numérique', angleEditorial: "Éditions précédentes du journal consultables en PDF, articles archivés par date et par rubrique" },
  { nom: 'Nécrologie', angleEditorial: "Avis de décès, communiqués et messages de remerciement aux familles" },
  { nom: 'Test', angleEditorial: "Article vitrine de démonstration — n'apparaît pas dans la navigation principale" },
];

// Sous-rubriques du mega-menu Info en direct (cf. proposition Gemini
// soumise et validée explicitement par l'utilisateur pour intégration en
// base — angleEditorial repris de la proposition). Chaque entrée référence
// le slug d'une rubrique parente déjà seedée ci-dessus ; `parentSlug: null`
// pour "Opinions & Tribunes" et "Histoire de Côte d'Ivoire", qui n'ont pas
// de rubrique parente naturelle et deviennent des rubriques Info en direct
// de premier niveau (comme Éducation/Santé/Environnement/Numérique).
// Volontairement omis (confirmé explicitement par l'utilisateur : "Ne pas
// changer") : "Direct & Flashs" (= la page /direct existante) et "Le
// Kiosque PDF" (= la page /kiosque existante) — pas de vraie rubrique de
// classification, redites de fonctionnalités déjà présentes sur le site.
// Créées vides : aucun article n'est inventé pour les peupler.
const SOUS_RUBRIQUES = [
  { parentSlug: 'politique', nom: 'Élections & Partis', angleEditorial: 'Actu RHDP, PPA-CI, PDCI-RDA, partis indépendants' },
  { parentSlug: 'politique', nom: 'Institutions & Lois', angleEditorial: 'Assemblée nationale, Sénat, décrets présidentiels' },
  { parentSlug: 'regions', nom: 'Abidjan & Communes', angleEditorial: 'Actu Cocody, Yopougon, Abobo, Marcory, Treichville, Plateau' },
  { parentSlug: 'regions', nom: 'Vie des Régions', angleEditorial: 'Poro, Gbêkê, San-Pédro, Indénié-Djuablin, Tonkpi' },
  { parentSlug: 'refondation', nom: 'Diplomatie & CEDEAO', angleEditorial: 'Relations internationales, Union Africaine, coopération sous-régionale' },
  { parentSlug: 'diaspora', nom: 'Diaspora Ivoire', angleEditorial: 'Communautés en Europe, Amérique et Afrique' },

  { parentSlug: 'vie-chere', nom: 'Le Panier de la Ménagère', angleEditorial: 'Évolution des prix des marchés, vivrier, carburant, loyers' },
  { parentSlug: 'economie', nom: 'Agro-industrie & Export', angleEditorial: 'Filières cacao, anacarde, hévéa, palmier à huile, café' },
  { parentSlug: 'economie', nom: 'Emploi & Concours', angleEditorial: 'Offres d\'emploi, concours de la fonction publique (ENA, CAFOP, INFAS)' },
  { parentSlug: 'numerique', nom: 'Tech & Startups', angleEditorial: 'Écosystème numérique d\'Abidjan, IA, fintech, agtech' },
  { parentSlug: 'education', nom: 'Système Éducatif', angleEditorial: 'Rentrée scolaire, examens nationaux (BAC, BEPC, CEPE), universités' },
  { parentSlug: 'sante', nom: 'Santé & Prévention', angleEditorial: 'Couverture Maladie Universelle (CMU), hôpitaux, campagnes de vaccination' },
  { parentSlug: 'environnement', nom: 'Cadre de vie & Climat', angleEditorial: 'Saison des pluies, infrastructures routières, gestion des déchets, SOTRA' },

  { parentSlug: 'culture', nom: 'Showbiz & Musique', angleEditorial: 'Rap Ivoire, coupé-décalé, zouglou, afrobeats, sorties d\'albums' },
  { parentSlug: 'culture', nom: 'Gastronomie & Maquis', angleEditorial: 'Le guide des maquis, tendances culinaires (attiéké-poisson, garba, sauce graine)' },
  { parentSlug: 'culture', nom: 'Arts & Spectacles', angleEditorial: 'Cinéma, théâtre, FEMUA, défilés de mode, expositions' },
  { parentSlug: 'sport', nom: 'Éléphants & Football National', angleEditorial: 'Sélection nationale, Ligue 1 Lonaci, mercato local' },
  { parentSlug: 'sport', nom: 'Sports Internationaux', angleEditorial: 'Champions League, Premier League, NBA, UFC' },
  { parentSlug: 'necrologie', nom: 'Carnet Noir', angleEditorial: 'Avis de décès, hommages nationaux, programmes des obsèques' },

  { parentSlug: 'verite-ou-intox', nom: 'Fact-Checking Web', angleEditorial: 'Désintox des rumeurs virales sur Facebook, TikTok et WhatsApp' },
  { parentSlug: 'verite-ou-intox', nom: 'Grands Format', angleEditorial: 'Enquêtes d\'immersion et reportages d\'investigation' },
  { parentSlug: null, nom: 'Opinions & Tribunes', angleEditorial: 'Analyses signées par des experts, politologues et universitaires' },
  { parentSlug: null, nom: 'Histoire de Côte d\'Ivoire', angleEditorial: 'Archives historiques, figures marquantes et rétrospectives' },

  { parentSlug: 'audio-podcasts', nom: 'Le Débat du Jour', angleEditorial: 'Émissions de podcast audio à écouter en ligne' },
  { parentSlug: 'videos', nom: 'Reportages Vidéo', angleEditorial: 'Micro-trottoirs, coulisses des marchés, interventions en direct' },
  { parentSlug: 'videos', nom: 'Formats Verticaux', angleEditorial: 'Vidéos courtes au format TikTok/Reels pour les réseaux sociaux' },
  { parentSlug: 'videos', nom: 'Interviews Exclusives', angleEditorial: 'Entretiens vidéo et audio grand format' },
  { parentSlug: 'photos-legendees', nom: 'Rétro Photo', angleEditorial: 'Les plus beaux clichés et l\'actualité de la semaine en images' },
];

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedRubriques() {
  let ordre = 0;
  for (const r of RUBRIQUES_EDITORIALES) {
    await prisma.rubrique.upsert({
      where: { slug: slugify(r.nom) },
      update: {},
      create: { ...r, slug: slugify(r.nom), type: 'EDITORIALE', ordre: ordre++ },
    });
  }
  for (const r of RUBRIQUES_INFO_DIRECT) {
    await prisma.rubrique.upsert({
      where: { slug: slugify(r.nom) },
      update: {},
      create: { ...r, slug: slugify(r.nom), type: 'EDITORIALE', ordre: ordre++ },
    });
  }
  ordre = 0;
  for (const r of RUBRIQUES_SERVICE) {
    await prisma.rubrique.upsert({
      where: { slug: slugify(r.nom) },
      update: {},
      create: { ...r, slug: slugify(r.nom), type: 'SERVICE', ordre: ordre++ },
    });
  }
  console.log(`✔ ${RUBRIQUES_EDITORIALES.length + RUBRIQUES_INFO_DIRECT.length + RUBRIQUES_SERVICE.length} rubriques créées/à jour.`);
}

// Sous-rubriques du mega-menu — cf. SOUS_RUBRIQUES ci-dessus. Doit tourner
// après seedRubriques() (parents déjà en base) et après une migration
// Prisma ayant ajouté Rubrique.parentId (cf. schema.prisma).
async function seedSousRubriques() {
  let ordre = 100; // après les rubriques de premier niveau
  let crees = 0;
  for (const sr of SOUS_RUBRIQUES) {
    const parent = sr.parentSlug ? await prisma.rubrique.findUnique({ where: { slug: sr.parentSlug } }) : null;
    if (sr.parentSlug && !parent) {
      console.warn(`⚠ Sous-rubrique "${sr.nom}" ignorée : parent "${sr.parentSlug}" introuvable.`);
      continue;
    }
    const slug = slugify(sr.nom);
    const existe = await prisma.rubrique.findUnique({ where: { slug } });
    if (existe) continue;
    await prisma.rubrique.create({
      data: {
        nom: sr.nom, slug, type: 'EDITORIALE', angleEditorial: sr.angleEditorial,
        couleur: parent?.couleur || null, ordre: ordre++, parentId: parent?.id || null,
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} sous-rubrique(s) créée(s).`);
}

// Comptes rédaction/administration — cf. organigramme rédactionnel réel
// (cahier des charges §1). Chaque compte reçoit un mot de passe individuel
// et aléatoire à sa création (jamais un mot de passe partagé). Ce mot de
// passe n'est affiché qu'une seule fois, dans la sortie console de ce seed,
// au moment de la création du compte — il n'est jamais stocké en clair ni
// committé. Sur un environnement déjà initialisé (update: {}), ce seed ne
// touche pas aux mots de passe existants.
async function seedStaff() {
  const comptes = [
    { email: 'admin@notrevoienews.com', nom: 'Gnépa', prenom: 'Barthélémy', role: 'ADMIN', service: 'Direction' },
    { email: 'redacteur-en-chef@notrevoienews.com', nom: 'Bédé', prenom: 'Charles', role: 'REDACTEUR_EN_CHEF', service: 'Rédaction' },
    { email: 'secretaire-general@notrevoienews.com', nom: 'Coulibaly', prenom: 'Zié Oumar', role: 'SECRETAIRE_GENERAL', service: 'Rédaction' },
    { email: 'chef-politique@notrevoienews.com', nom: 'Koré', prenom: 'Benjamin', role: 'CHEF_SERVICE', service: 'Politique & Régions' },
    { email: 'chef-culture@notrevoienews.com', nom: 'Gomon', prenom: 'Edmond', role: 'CHEF_SERVICE', service: 'Culture' },
    { email: 'regie@notrevoienews.com', nom: 'Akho', prenom: 'Claude', role: 'REGIE', service: 'Commercial & Marketing' },
    { email: 'redacteur@notrevoienews.com', nom: 'Zébé', prenom: 'Arthur', role: 'REDACTEUR', service: 'Sport' },
  ];

  const comptesCrees = [];
  for (const c of comptes) {
    const existant = await prisma.staff.findUnique({ where: { email: c.email } });
    if (existant) continue;
    const motDePasse = genPassword(14);
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    await prisma.staff.create({ data: { ...c, motDePasseHash } });
    comptesCrees.push({ email: c.email, motDePasse });
  }

  if (comptesCrees.length > 0) {
    console.log(`\n✔ ${comptesCrees.length} nouveaux comptes staff créés — mots de passe (à transmettre une seule fois) :`);
    for (const c of comptesCrees) console.log(`  ${c.email.padEnd(38)} ${c.motDePasse}`);
  } else {
    console.log(`✔ ${comptes.length} comptes staff déjà existants, inchangés.`);
  }
}

async function seedPrixVieChere() {
  const releves = [
    { produit: 'Riz (sac 50kg)', unite: 'sac', prix: 22500, variationPct: 1.8 },
    { produit: 'Huile végétale', unite: 'litre', prix: 1450, variationPct: -0.5 },
    { produit: 'Essence', unite: 'litre', prix: 890, variationPct: 0 },
    { produit: 'Transport (Gbaka urbain)', unite: 'trajet', prix: 300, variationPct: 0 },
  ];
  for (const r of releves) {
    await prisma.prixVieChere.create({ data: r });
  }
  console.log(`✔ ${releves.length} relevés Vie chère initiaux créés.`);
}

// Articles de lancement — contenu réel du n°7970 (14-16 août 2026), tiré des
// archives PDF fournies par la rédaction, repris ici pour donner une
// première visibilité au site public dès la mise en production. Chaque
// article est attribué au vrai journaliste du service correspondant
// (organigramme de la p.7 du journal papier). Idempotent via upsert sur le
// slug — ne s'exécute qu'une fois (garde sur le compte total d'articles).
async function seedArticles() {
  const rubrique = async (nom) => prisma.rubrique.findUniqueOrThrow({ where: { slug: slugify(nom) } });
  const staff = async (email) => prisma.staff.findUniqueOrThrow({ where: { email } });

  const [politique, economie, societe, regions, culture, sport, veriteOuIntox] = await Promise.all(
    ['Politique', 'Économie', 'Société', 'Régions', 'Culture', 'Sport', 'Vérité ou Intox'].map(rubrique)
  );
  const [redacteurEnChef, secretaireGeneral, chefPolitique, chefCulture, redacteurSport] = await Promise.all([
    staff('redacteur-en-chef@notrevoienews.com'),
    staff('secretaire-general@notrevoienews.com'),
    staff('chef-politique@notrevoienews.com'),
    staff('chef-culture@notrevoienews.com'),
    staff('redacteur@notrevoienews.com'),
  ]);

  const h = (heures) => new Date(Date.now() - heures * 3600 * 1000);

  const articles = [
    {
      slug: 'pouvoir-ternit-image-republique-arrestation-pasteur-jeremie-koffi',
      titre: "Arrestation du pasteur Jérémie Koffi dans la violence : le pouvoir ternit l'image de la République",
      chapo: "Le prophète David Jérémie a subi une opération chirurgicale en détention, à en croire le procureur de la République.",
      contenuHtml: `<p>L'actualité de ces dernières heures est marquée en Côte d'Ivoire par l'arrestation d'un homme de Dieu qui se fait appeler pasteur Jérémie Koffi — à l'état civil, N'Guessan Koffi Aimé. Cette arrestation, filmée en partie par le concerné lui-même peu avant d'être mis aux arrêts dans la commune d'Abobo, est confirmée par le procureur près le tribunal de première instance d'Abidjan-Plateau, Koné Braman Oumar.</p>
<p>Les images documentant l'interpellation du chef religieux par un commando cagoulé sont problématiques : descente musclée, violences inouïes, destruction, saccage du domicile, brutalités sur le concerné devant sa famille. Certains témoignages des voisins de l'infortuné ont même fait état de vol dans la maison.</p>
<p>Il serait reproché à ce guide religieux de s'être réjoui de la mort d'un ancien chef de guerre de la rébellion armée, Kouakou Fofié Martin, précédemment commandant de la région militaire de Daloa. Jusqu'à preuve du contraire, N'Guessan Koffi Aimé est présumé innocent — la question posée ici n'est pas celle du fond, mais celle de la forme utilisée pour l'interpeller.</p>`,
      tags: ['justice', 'arrestation', 'Abobo'],
      format: 'EDITION', rubrique: politique, auteur: redacteurEnChef, heures: 12,
    },
    {
      slug: 'une-curieuse-operation-chirurgicale-du-pasteur',
      titre: 'Le pasteur Jérémie Koffi est-il mort ? La rumeur qui a enflammé les réseaux sociaux',
      chapo: "Une rumeur donnait l'homme de Dieu pour mort après son arrestation. Le procureur d'Abidjan a formellement démenti.",
      contenuHtml: `<p><strong>La rumeur :</strong> après l'arrestation musclée du pasteur Jérémie Koffi le 10 août 2026 à Abobo, des publications ont circulé sur les réseaux sociaux affirmant sa mort en détention, à la suite des violences subies lors de son interpellation.</p>
<p><strong>Les faits vérifiés :</strong> le chef du parquet d'Abidjan, Koné Braman Oumar, a communiqué que l'intéressé, s'étant plaint d'une douleur à la poitrine, a été conduit à l'Institut de cardiologie d'Abidjan. Les examens ayant révélé une artère du cœur bouchée, il a subi une intervention chirurgicale, réalisée avec succès. Son état est stable.</p>
<p><strong>Verdict :</strong> l'annonce de sa mort, largement partagée, est fausse. Une interrogation demeure toutefois documentée par des témoignages concordants : les circonstances de son arrestation, elles, restent contestées.</p>`,
      tags: ['fact-check', 'réseaux sociaux'],
      format: 'VERITE_OU_INTOX', rubrique: veriteOuIntox, auteur: redacteurEnChef, heures: 10,
      factCheck: { verdict: 'TROMPEUR', rumeurOrigine: "Le pasteur Jérémie Koffi serait mort en détention après son arrestation à Abobo.", sourceRumeur: 'Publications virales sur les réseaux sociaux ivoiriens', preuves: "Communiqué du procureur près le tribunal de première instance d'Abidjan-Plateau (13 août 2026), confirmant une hospitalisation et une opération réussie." },
    },
    {
      slug: 'korhogo-defi-pour-le-pdci-rda',
      titre: 'Korhogo, un défi pour le PDCI-RDA dans la commémoration éclatée de ses 80 ans',
      chapo: 'Après Abidjan, Bouaké, Abengourou et Daloa, le vieux parti prépare sa mobilisation dans le nord du pays.',
      contenuHtml: `<p>Le parti fondé par feu Félix Houphouët-Boigny et présidé par Tidjane Thiam poursuit sa route dans la commémoration de ses 80 ans d'existence. Le PDCI-RDA s'apprête à investir la ville de Korhogo pour y marquer cet événement, après les rassemblements tenus à Bouaké, Abengourou et Daloa.</p>
<p>En allant à Korhogo, le PDCI-RDA fait-il un saut dans le vide ? La question se pose compte tenu de la situation sociopolitique qui prévaut dans le pays depuis 2011 : depuis l'arrivée au pouvoir du RHDP, la partie nord est perçue par certains comme un territoire moins fréquenté par l'opposition politique.</p>
<p>Le meeting concerne les militants des régions de Séguéla, Odienné, Boundiali, Ferké et Korhogo, appelés à se retrouver pour commémorer les 80 ans du parti.</p>`,
      tags: ['PDCI-RDA', 'Korhogo', 'politique partisane'],
      format: 'EDITION', rubrique: politique, auteur: chefPolitique, heures: 30,
    },
    {
      slug: 'faille-cachee-scandale-39-milliards-fraude-dgi',
      titre: 'Présumée fraude à la DGI : la faille cachée derrière le scandale des 39 milliards',
      chapo: "Dégrèvement fiscal frauduleux, signature électronique usurpée, dix agents arrêtés : décryptage d'un scandale qui révèle une gouvernance numérique fragile.",
      contenuHtml: `<p>Un dégrèvement fiscal frauduleux estimé à plus de 39 milliards de francs CFA, une signature électronique de Directeur général usurpée, dix agents arrêtés : le scandale qui secoue la Direction générale des Impôts de Côte d'Ivoire depuis fin juillet 2026 a toutes les apparences d'une affaire pénale. C'en est une. Mais c'est d'abord la démonstration de ce qui se produit quand une administration digitalise ses services sans digitaliser sa gouvernance de la sécurité.</p>
<p>Le cœur du dossier tient en une phrase : des dégrèvements fiscaux ont été validés grâce à l'usurpation de la signature électronique du directeur général. Pour un expert en sécurité des systèmes d'information, c'est le symptôme classique d'un dispositif d'authentification insuffisamment robuste — absence de séparation stricte entre celui qui initie, valide et signe un acte ; absence de module matériel de sécurité dédié à la clé de signature.</p>
<p>Quatre chantiers apparaissent prioritaires : sécuriser structurellement l'identité numérique des cadres habilités, fiabiliser la plateforme e-impôt par des tests de charge systématiques, fermer la boucle de traçabilité financière entre recouvrement et reversement au Trésor, et doter la DGI d'une gouvernance de la sécurité de l'information à la hauteur des enjeux.</p>`,
      tags: ['DGI', 'fraude fiscale', 'cybersécurité'],
      format: 'DECRYPTAGE', rubrique: economie, auteur: secretaireGeneral, heures: 14,
    },
    {
      slug: 'anp-interpelle-medias-usage-ethique-intelligence-artificielle',
      titre: "L'ANP interpelle les médias sur un usage éthique et responsable de l'intelligence artificielle",
      chapo: "L'Autorité nationale de la presse a organisé une session de son programme « ANP Academy » consacrée au journalisme face à l'IA.",
      contenuHtml: `<p>L'Autorité nationale de la presse (ANP) a organisé, à son siège de Cocody-Angré, la 42ème session de son programme « ANP Academy », au profit des professionnels des médias, sur le thème « Le journaliste face à l'intelligence artificielle : entre éthique, responsabilité et innovation ».</p>
<p>Le président de l'ANP, Sanogo Bakary, a invité les professionnels des médias à faire preuve de discernement dans l'utilisation des nouveaux outils technologiques : « Utilisons avec beaucoup d'intelligence, l'intelligence artificielle. »</p>
<p>Le formateur a rappelé que cinq valeurs doivent guider le journaliste dans l'utilisation de l'IA : la vérité, l'intégrité, l'indépendance, le respect de la dignité humaine et la responsabilité sociale — avec, en toute circonstance, la nécessité de vérifier toute information produite ou obtenue à l'aide de l'IA avant sa publication.</p>`,
      tags: ['ANP', 'intelligence artificielle', 'déontologie'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 20,
    },
    {
      slug: 'fete-de-yorokloi-2026-ouragahio-femme-bhete-celebree',
      titre: 'Fête de Yorokloi 2026 à Ouragahio : la femme Bhété célébrée',
      chapo: "Après Asnières-sur-Seine, Montreuil, Guibéroua et Issia, c'est la ville d'Ouragahio qui accueille l'édition 2026.",
      contenuHtml: `<p>L'édition 2026 de la fête de Yorokloi se tient à Ouragahio, dans le département de Gagnoa, dans le centre-ouest ivoirien. En pays Bhété, la Yoroklô (Youroudjou) a une importance capitale dans le socle de la structure familiale : ce sont les retombées de sa dot que ses parents utilisent pour épouser les femmes de ses frères.</p>
<p>L'association Parlons Bhété rendra hommage à la Yoroklô la plus âgée de chacun des 47 villages d'Ouragahio à travers des dons, et offrira des kits de naissance aux filles nées le 17 juin 2026 — date officielle d'institution de la fête — dans les maternités de la commune.</p>
<p>La fête sera présidée par le préfet de la région du Gôh, parrainée par Mme Koundé Henriette, sous les auspices du maire de la commune d'Ouragahio.</p>`,
      tags: ['culture Bhété', 'Ouragahio', 'traditions'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 8,
    },
    {
      slug: 'commissaire-kounvolo-coulibaly-lance-campagne-fppn',
      titre: 'Élection du DG du Fonds de prévoyance de la police nationale : le commissaire Kounvolo Coulibaly lance sa campagne',
      chapo: "Dans un luxueux restaurant d'Abidjan Cocody Riviera 3, le candidat a décliné son programme devant les sommités de la police nationale.",
      contenuHtml: `<p>Candidat à l'élection du directeur général du Fonds de prévoyance de la police nationale (FPPN), le commissaire principal Kounvolo Coulibaly a lancé sa campagne électorale sur les chapeaux de roue, en présence de toutes les sommités de la police nationale.</p>
<p>Parmi ses projets phares : la certification du FPPN aux normes ISO, la revalorisation du patrimoine immobilier du Fonds — siège, clinique médicale du policier — la construction d'une clinique à l'intérieur du pays, et l'élaboration d'un manuel de la politique d'épargne et de crédit.</p>
<p>Faisant l'état des lieux, il a déploré la crise de confiance dans la gestion du Fonds et le manque de communication entre le Fonds et les policiers. L'élection du nouveau directeur général est prévue le 20 août prochain à Abidjan.</p>`,
      tags: ['police nationale', 'FPPN', 'élection'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 18,
    },
    {
      slug: 'jeunes-presentent-priorites-gouvernement-journee-internationale-jeunesse',
      titre: 'Journée internationale de la jeunesse : les jeunes présentent leurs priorités au gouvernement',
      chapo: "La 2e édition des consultations nationales de la jeunesse a fait émerger trois priorités : drogues, réseaux sociaux et intelligence artificielle.",
      contenuHtml: `<p>La jeunesse ivoirienne a présenté ses préoccupations lors de la Journée internationale de la jeunesse et à l'occasion de la 2e édition des consultations nationales de la jeunesse, au Parc des expositions d'Abidjan. Ces échanges ont fait émerger trois priorités majeures portées par les jeunes : la lutte contre les drogues et produits addictifs, l'utilisation responsable des réseaux sociaux et les enjeux liés à l'intelligence artificielle.</p>
<p>Le président du Conseil national des jeunes de Côte d'Ivoire, Ibrahima Diabaté, a souligné que 86 % des préoccupations exprimées en 2025 ont, à ce jour, été prises en compte.</p>
<p>Pour le Premier ministre, Robert Beugré Mambé, « le Gouvernement va faire sa part, à travers une méthode simple : écouter, agir, rendre compte et vérifier ». Il a instruit le ministre chargé de la Jeunesse de garantir la transparence dans la mise en œuvre du Fonds d'appui aux organisations de jeunesse.</p>`,
      tags: ['jeunesse', 'gouvernement', 'consultations nationales'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 26,
    },
    {
      slug: 'cinq-morts-chavirement-pirogue-fleuve-cavally-toulepleu',
      titre: "Toulepleu : cinq morts dans le chavirement d'une pirogue sur le fleuve Cavally",
      chapo: "Une mère et ses trois enfants figurent parmi les victimes d'un naufrage entre Pantroya et Grié 2, dans le département de Toulépleu.",
      contenuHtml: `<p>Cinq personnes, dont une mère et ses trois enfants, sont mortes dans le chavirement d'une pirogue survenu lors d'une traversée du fleuve Cavally, entre Pantroya et Grié 2, deux villages de la sous-préfecture de Bakoubly, département de Toulépleu.</p>
<p>La distance entre les deux rives, estimée à moins de 100 mètres, ne devait demander qu'environ une minute de traversée. Mais au cours du trajet, la pirogue a brusquement chaviré, précipitant les six passagers et le piroguier dans les eaux du fleuve. Le piroguier et deux passagers sont parvenus à regagner la rive.</p>
<p>Les cinq victimes ont été inhumées au bord du fleuve Cavally, avec l'autorisation des services compétents et de la gendarmerie, qui a ouvert une enquête pour déterminer les circonstances exactes du chavirement.</p>`,
      tags: ['fait divers', 'Toulépleu', 'fleuve Cavally'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 40,
    },
    {
      slug: 'bouake-jeunesse-18-pays-sous-region-conclave',
      titre: 'Bouaké : la jeunesse de 18 pays de la sous-région en conclave',
      chapo: "7e édition du Forum sous-régional de la Jeunesse, autour de la prévention des conflits et de la construction de sociétés pacifiques.",
      contenuHtml: `<p>Bouaké, la capitale du Centre, accueille la 7e édition du Forum sous-régional de la Jeunesse, organisée à l'initiative du Réseau ouest-africain pour la paix, la sécurité et les droits de l'Homme (ROAPDH). Cette rencontre rassemble des jeunes leaders venus de 18 pays de la sous-région, autour du thème « Jeunesse et coopération régionale : implication des jeunes dans la prévention des conflits ».</p>
<p>Le président du ROAPDH, Koudjovi Gadje, a estimé que l'année 2026 constitue une période décisive pour l'Afrique de l'Ouest et le Sahel, citant l'inflation, le chômage des jeunes, les effets du changement climatique et la désinformation parmi les défis à relever.</p>
<p>« Avec plus de 60 % de la population ayant moins de 25 ans, l'Afrique de l'Ouest et le Sahel constituent l'une des régions les plus jeunes du monde », a-t-il indiqué, appelant les jeunes à devenir acteurs et moteurs du développement.</p>`,
      tags: ['Bouaké', 'jeunesse', 'coopération régionale'],
      format: 'EDITION', rubrique: regions, auteur: chefPolitique, heures: 36,
    },
    {
      slug: 'election-fif-clubs-exigent-300-millions-subvention',
      titre: 'Élection à la FIF : des clubs exigent 300 millions FCFA de subvention annuelle avant de voter',
      chapo: "Idriss Diallo, candidat unique au scrutin du 12 septembre, sous pression de certains clubs de Ligue 1.",
      contenuHtml: `<p>La liste des membres proposés pour le comité exécutif d'Idriss Diallo, président sortant de la Fédération ivoirienne de football (FIF) et candidat unique au scrutin du 12 septembre prochain, est connue depuis le 10 août. La plupart d'entre eux sont issus de l'équipe dirigeante du mandat écoulé.</p>
<p>Bien qu'étant seul candidat, Idriss Diallo devra nécessairement obtenir la majorité des suffrages exprimés, soit 50 % + 1 voix, car le plébiscite par acclamations n'est pas prévu par les textes de la FIF.</p>
<p>Dans ce contexte, certains clubs seraient à l'œuvre pour obtenir l'engagement du président sortant à procéder à une augmentation conséquente des subventions qui leur sont allouées — une exigence de 300 millions FCFA contre les 100 millions FCFA actuellement versés, en échange de leur soutien.</p>`,
      tags: ['FIF', 'football', 'Idriss Diallo'],
      format: 'EDITION', rubrique: sport, auteur: redacteurSport, heures: 22,
    },
    {
      slug: 'ousmane-diomande-nottingham-forest-osa-540-millions',
      titre: "Ousmane Diomandé à Nottingham Forest : l'OSA devrait empocher 540 millions FCFA",
      chapo: "Le défenseur international ivoirien quitte le Sporting CP pour l'Angleterre, pour un montant de 40 millions d'euros.",
      contenuHtml: `<p>Après trois saisons et demie passées au Sporting CP, Ousmane Diomandé quitte le Portugal pour l'Angleterre. Le défenseur international ivoirien (16 sélections) s'est engagé avec Nottingham Forest jusqu'en 2030 pour un montant de 40 millions d'euros. À 22 ans, il retrouve son coéquipier en sélection, Ibrahim Sangaré.</p>
<p>Le transfert étant désormais acté, son club formateur d'Abidjan, l'OSA (Olympique Sport d'Abobo), devrait percevoir un bonus estimé à 524 millions FCFA au titre du mécanisme de solidarité de la FIFA. Sol FC, où Ousmane Diomandé a évolué une année avant son départ à l'étranger, pourrait également percevoir environ 131 millions FCFA.</p>`,
      tags: ['football', 'transfert', 'Nottingham Forest'],
      format: 'FLASH', rubrique: sport, auteur: redacteurSport, heures: 6,
    },
  ];

  let crees = 0;
  for (const a of articles) {
    const existant = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (existant) continue;
    const publieLe = h(a.heures);
    await prisma.article.create({
      data: {
        slug: a.slug, titre: a.titre, chapo: a.chapo, contenuHtml: a.contenuHtml, tags: a.tags,
        format: a.format, statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: a.rubrique.id, auteurId: a.auteur.id, valideParId: redacteurEnChef.id,
        publieLe, createdAt: publieLe, updatedAt: publieLe,
        vuesTotal: Math.floor(200 + Math.random() * 4000),
        ...(a.factCheck ? { factCheck: { create: { ...a.factCheck, realiseParId: a.auteur.id } } } : {}),
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} article(s) de lancement créé(s) (${articles.length - crees} déjà existant(s)).`);
}

// Second lot — contenu réel des n°7965 à 7969 (6-13 août 2026), pour
// étoffer l'archive avec un vrai historique sur plusieurs jours. Même
// principe d'attribution (chef du service concerné) et d'idempotence
// (upsert implicite via vérification du slug).
async function seedArticlesBatch2() {
  const rubrique = async (nom) => prisma.rubrique.findUniqueOrThrow({ where: { slug: slugify(nom) } });
  const staff = async (email) => prisma.staff.findUniqueOrThrow({ where: { email } });

  const [politique, economie, societe, regions, culture, sport] = await Promise.all(
    ['Politique', 'Économie', 'Société', 'Régions', 'Culture', 'Sport'].map(rubrique)
  );
  const [redacteurEnChef, secretaireGeneral, chefPolitique, chefCulture, redacteurSport] = await Promise.all([
    staff('redacteur-en-chef@notrevoienews.com'),
    staff('secretaire-general@notrevoienews.com'),
    staff('chef-politique@notrevoienews.com'),
    staff('chef-culture@notrevoienews.com'),
    staff('redacteur@notrevoienews.com'),
  ]);

  const h = (heures) => new Date(Date.now() - heures * 3600 * 1000);

  const articles = [
    // --- n°7965 (06-09 août) — heures ~145-200h avant "maintenant" ---
    {
      slug: 'affi-nguessan-souverainete-veritable-institutions-fortes',
      titre: "66e anniversaire de l'indépendance : Pascal Affi N'Guessan appelle à une « souveraineté véritable » et à des institutions fortes",
      chapo: "Dans son message du 7 août, le président du FPI appelle à un nouveau pacte national fondé sur le dialogue, la justice et la réconciliation.",
      contenuHtml: `<p>Soixante-six ans après son accession à la souveraineté, la Côte d'Ivoire doit encore, selon Pascal Affi N'Guessan, président du Front populaire ivoirien (FPI), franchir une étape définitive : passer d'une indépendance symbolique à une véritable autonomie politique, économique et sociale.</p>
<p>« L'indépendance ne se résume pas à un drapeau, à un hymne national ou à une reconnaissance internationale. Elle se mesure à la capacité d'un peuple à décider librement de son destin, à maîtriser son économie, à protéger ses richesses », a-t-il déclaré, dressant un bilan contrasté des six décennies écoulées.</p>
<p>Le président du FPI a appelé solennellement le chef de l'État à poser des actes d'apaisement : libération des personnes détenues pour des affaires liées à la vie politique, ouverture d'un dialogue franc avec l'ensemble des forces politiques, et réorientation des priorités du gouvernement vers la lutte contre la vie chère et la création d'emplois pour les jeunes.</p>`,
      tags: ['FPI', 'Affi N\'Guessan', 'indépendance'],
      format: 'EDITION', rubrique: politique, auteur: chefPolitique, heures: 190,
    },
    {
      slug: 'cacao-ivoirien-or-brun-epreuve-records',
      titre: 'Cacao ivoirien : l\'or brun à l\'épreuve de ses propres records',
      chapo: "2 800 FCFA le kilogramme bord champ en octobre, contre 1 200 FCFA six mois plus tard : le grand écart de la campagne cacaoyère 2025-2026.",
      contenuHtml: `<p>Premier producteur mondial avec environ 40 % de l'offre planétaire, la Côte d'Ivoire tire de la fève brune 15 à 20 % de son PIB et fait vivre, directement ou indirectement, près de six millions de personnes. Le 1er octobre 2025, le prix bord champ record de 2 800 FCFA/kg avait été porté par des cours mondiaux exceptionnellement élevés — avant que le marché ne se retourne brutalement, les cours internationaux chutant d'environ 70 % dès décembre 2025.</p>
<p>Face à cette crise, le chef de l'État a arbitré à la hausse un prix intermédiaire de 1 200 FCFA/kg, annoncé le 4 mars par le ministre de l'Agriculture Bruno Nabagné Koné, au prix d'une subvention de plus de 231 milliards de FCFA. La récolte a néanmoins surpris par son ampleur, dépassant finalement les 2 millions de tonnes, un record.</p>
<p>L'échéance de septembre 2026 approche pour la carte du producteur et le Système national de traçabilité, qui deviendront obligatoires afin d'endiguer la contrebande transfrontalière et de mettre la filière en conformité avec le règlement européen sur la déforestation (EUDR).</p>`,
      tags: ['cacao', 'agriculture', 'prix bord champ'],
      format: 'DECRYPTAGE', rubrique: economie, auteur: secretaireGeneral, heures: 185,
    },
    {
      slug: 'gaha-carine-reine-guemon-finale-awoulaba-2026',
      titre: 'Finale Awoulaba 2026 : Gaha Carine, reine du Guémon',
      chapo: "Élue le 25 juillet au palais de la Culture Bernard Dadié, la nouvelle reine de beauté ivoirienne a reçu un million FCFA et plusieurs lots des partenaires de l'événement.",
      contenuHtml: `<p>Gaha Carine, de la région du Guémon, est l'Awoulaba de l'édition 2026 du concours de beauté. Cette année, un accent particulier a été mis sur le savoir-faire culinaire, permettant aux candidates de montrer leurs talents en la matière. L'édition 2026 était placée sous le thème : « L'éducation de la jeune fille : un investissement pour l'avenir ».</p>
<p>« Le rêve de Pol Dokui était de célébrer la beauté naturelle, la dignité, l'intelligence et l'identité culturelle de la femme ivoirienne, nous poursuivons cette vision avec la même passion », a déclaré la présidente Reine Dokui, présidente du Comité Awoulaba Côte d'Ivoire (CACI), épouse du défunt Paul Dokui, initiateur du concours.</p>
<p>Kouadio Amenan Glwadys, de la région du Bélier, est élue première Saraman, et Djite Achicha Sarrah, de Bingerville, deuxième Saraman. Le concours Awoulaba met en lumière l'élégance, la morphologie naturelle et toute l'authenticité de la beauté africaine.</p>`,
      tags: ['Awoulaba', 'concours de beauté', 'culture'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 180,
    },
    {
      slug: 'dabou-planteur-retrouve-mort-plantation-cosrou',
      titre: 'Dabou : un planteur retrouvé mort dans sa plantation',
      chapo: "Akpa Michel, 75 ans, a été retrouvé sans vie dans sa plantation d'hévéa à Cosrou. Deux de ses fils, recherchés dans le cadre de l'enquête, demeurent introuvables.",
      contenuHtml: `<p>Cosrou, un village situé à une trentaine de kilomètres de Dabou, est sous le choc après le meurtre d'Akpa Michel, un planteur de 75 ans retrouvé sans vie dans sa plantation d'hévéa. Selon les premiers témoignages, le septuagénaire s'était rendu dans sa plantation avec un saigneur pour acheminer une importante quantité de latex. À son retour, le saigneur découvre Akpa Michel sans vie, victime de graves blessures.</p>
<p>Les premiers constats ont intrigué les enquêteurs : ni l'argent du planteur, ni son téléphone portable, ni même le latex récolté n'ont été emportés. Selon des sources locales, un conflit familial opposait depuis plusieurs années Akpa Michel à sa seconde épouse, alimentant diverses hypothèses au sein du village.</p>
<p>Saisis de l'affaire, les éléments de la gendarmerie nationale ont ouvert une enquête afin d'établir les circonstances exactes de ce meurtre et d'identifier les auteurs. Les deux fils du défunt sont recherchés pour être entendus dans le cadre des investigations.</p>`,
      tags: ['fait divers', 'Dabou', 'Cosrou'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 175,
    },
    {
      slug: 'retour-herve-renard-elephants-pari-progression',
      titre: 'Retour d\'Hervé Renard chez les Éléphants : le pari de la progression',
      chapo: "La Fédération ivoirienne de football a confié les rênes de la zone technique des Éléphants au Français Hervé Renard, en remplacement d'Émerse Faé.",
      contenuHtml: `<p>Hervé Renard a la réputation d'avoir assez d'autorité pour se faire entendre sur le terrain et dans les vestiaires, surtout dans l'équité relative aux listes des joueurs sélectionnés et au onze titulaire. « Le meilleur schéma est celui qui s'adapte le mieux à l'effectif. La priorité, ce sont les joueurs. Pas le système », expliquait-il en 2018.</p>
<p>Depuis la CAN remportée en 2015 avec les Ivoiriens, le technicien n'a pas glané de titre majeur, mais son parcours (Lille, sélections marocaine et saoudienne, équipe nationale féminine de France) est couvert de plusieurs expériences. Il fonde principalement ses dispositions tactiques sur le 4-5-1, avec un milieu renforcé et un pressing haut.</p>
<p>« Sélectionner les joueurs les plus en forme possible. On peut avoir eu une énorme carrière ou beaucoup de sélections mais si on n'est pas performant, c'est difficile d'évoluer au haut niveau », a-t-il expliqué, laissant présager de multiples réaménagements dans l'effectif version Hervé Renard.</p>`,
      tags: ['football', 'Éléphants', 'Hervé Renard'],
      format: 'EDITION', rubrique: sport, auteur: redacteurSport, heures: 170,
    },
    // --- n°7966 (10 août) — heures ~120-150h ---
    {
      slug: 'discours-nation-ouattara-promesses-epreuve-faits',
      titre: "Discours à la Nation du chef de l'État : les promesses de Ouattara à l'épreuve des faits",
      chapo: "Langue de bois, démagogie, déni de réalité : l'adresse à la Nation du 6 août n'a pas convaincu, entre vie chère occultée et prisonniers d'opinion passés sous silence.",
      contenuHtml: `<p>Plusieurs termes viennent à l'esprit à l'analyse de l'adresse du chef de l'État à la Nation, à la faveur de la commémoration des 66 ans de l'indépendance de la Côte d'Ivoire, le 7 août 2026 : la langue de bois, la démagogie, ou le déni de réalité.</p>
<p>La question des prisonniers d'opinion a été occultée : la grâce présidentielle accordée à plus de 4000 détenus concerne les délits mineurs de droit commun, tandis que des milliers d'opposants emprisonnés en lien avec les crises électorales restent, pour la plupart, accusés de terrorisme ou d'atteinte à la sûreté de l'État — des chefs d'inculpation de notoriété politique.</p>
<p>Sur la filière café-cacao, aucun mot non plus : les paysans, selon l'éditorialiste, ne profitent pas de leur cacao et les 291 milliards FCFA dégagés pour le racheter n'auraient pas été utilisés dans la transparence. « Les Ivoiriens ne sont pas tombés de la dernière pluie », conclut l'analyse, rappelant la promesse jamais tenue de faire la lumière sur la rébellion armée.</p>`,
      tags: ['Ouattara', 'discours à la Nation', 'analyse'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: redacteurEnChef, heures: 145,
    },
    {
      slug: 'exportation-or-monte-puissance-face-cacao',
      titre: "Exportation des matières premières : l'or monte en puissance face au cacao",
      chapo: "Les recettes d'exportation de l'or non monétaire sont passées de 90,3 milliards FCFA en 2010 à 1 906 milliards en 2024, selon une analyse de l'économiste Mamadou Koulibaly.",
      contenuHtml: `<p>La progression spectaculaire des recettes d'exportation de l'or en Côte d'Ivoire modifie progressivement la structure des ressources extérieures du pays. « Si en 2010 les recettes d'exportation de l'or ne représentaient qu'environ 5 % des recettes d'exportation du cacao, ce ratio est passé à plus de 43 % en 2024 », observe Mamadou Koulibaly, professeur d'économie et ancien ministre de l'Économie et des Finances.</p>
<p>Le taux de croissance annuel moyen des recettes du cacao s'établit à 5,77 % entre 2010 et 2024, contre 22,5 % pour l'or. Le cacao demeure largement devant l'or en valeur absolue, mais la rapidité de la progression aurifère témoigne d'une diversification progressive des recettes d'exportation ivoiriennes.</p>
<p>L'économiste insiste sur le coût environnemental de cette mutation : « Le boom de la production d'or se paye avec la destruction des eaux », résume-t-il, alors que certaines formes de production cacaoyère se développent déjà « au prix de la destruction du couvert forestier ».</p>`,
      tags: ['or', 'cacao', 'exportations'],
      format: 'EDITION', rubrique: economie, auteur: secretaireGeneral, heures: 140,
    },
    {
      slug: 'alepe-kossandji-six-morts-violences-conflit-foncier',
      titre: 'Alépé : six morts dans des violences liées à un conflit foncier à Kossandji',
      chapo: "Un différend sur l'exploitation d'une parcelle familiale a dégénéré en violences intercommunautaires meurtrières dans cette sous-préfecture située à 67 km d'Alépé.",
      contenuHtml: `<p>Six personnes ont été tuées, plusieurs autres blessées et d'importants dégâts matériels enregistrés à Kossandji, à la suite de violences survenues dans un contexte de conflit foncier opposant des membres de la communauté autochtone Akyé à des habitants allochtones, notamment Lobi et Mossi, selon l'enquête de l'AIP.</p>
<p>Le litige a dégénéré le 4 août après la destruction de plants de manioc, provoquant une altercation au cours de laquelle une femme a été blessée. Dans la nuit du mardi au mercredi, des individus armés ont attaqué le village, faisant six morts et détruisant magasins et boutiques. De nombreux habitants ont fui vers un poste des Eaux et Forêts ou des localités voisines.</p>
<p>Le président de l'Assemblée nationale, Patrick Achi, et le député de la circonscription, N'Cho Christophe, ont présenté leurs condoléances aux familles endeuillées et appelé les populations à la retenue et à la préservation de la cohésion sociale. Une enquête doit être ouverte pour établir les responsabilités.</p>`,
      tags: ['Alépé', 'Kossandji', 'conflit foncier'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 135,
    },
    {
      slug: 'president-gabonais-experience-ivoirienne-relogement',
      titre: "Relogement des populations impactées par les grands projets : le président gabonais s'imprègne de l'expérience ivoirienne",
      chapo: "Brice Clotaire Oligui Nguema a visité la cité de relogement de Songon Ayewahi, où plus de 400 ménages touchés par le 4e pont d'Abidjan ont été réinstallés.",
      contenuHtml: `<p>Le président de la République gabonaise s'est d'abord rendu au 4e pont d'Abidjan pour s'imprégner de l'expérience ivoirienne en matière de relogement des populations impactées par les grands projets d'infrastructures, avant de se rendre à la cité de relogement de Songon Ayewahi. Il a offert un logement de deux pièces à des parents d'une fillette ainsi que 10 millions FCFA aux résidents de la cité.</p>
<p>Le directeur général de l'Agence de gestion des routes (AGEROUTE), Fabrice Coulibaly, a indiqué qu'environ 20 000 ménages ont été affectés par le projet. « À ce jour, près de 18 000 ménages ont été entièrement indemnisés, tandis qu'environ 2000 dossiers sont en cours de traitement », a-t-il précisé.</p>
<p>Concernant le relogement, 437 ménages ont opté pour une indemnisation en nature et ont été réinstallés sur les sites de Songon Ayewahi, réalisés dans le cadre du Projet de transport urbain d'Abidjan (PTUA).</p>`,
      tags: ['Songon Ayewahi', '4e pont', 'relogement'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 130,
    },
    // --- n°7967 (11 août) — heures ~95-120h ---
    {
      slug: 'hausse-carburant-gouvernement-impuissant-lache-ivoiriens',
      titre: 'Hausse du prix du carburant : le Gouvernement impuissant lâche les Ivoiriens',
      chapo: "Le porte-parole du Gouvernement, Amadou Coulibaly, évoque une augmentation contrainte par la crise au Moyen-Orient et les engagements pris avec le FMI.",
      contenuHtml: `<p>« Nous avons été contraints de procéder à cette augmentation qui reste contenue puisque c'est environ 3,5 % globalement d'augmentation par rapport à l'ancien prix. Mais cela nécessite quand même plus de 200 milliards de subvention de l'État », a déclaré le ministre de la Communication, Amadou Coulibaly, au sortir du conseil des ministres.</p>
<p>Le porte-parole du Gouvernement évoque, parmi les raisons de cette flambée, la crise armée au Moyen-Orient et ses conséquences sur le transport du gaz et du pétrole, ainsi que les contraintes liées au respect des engagements pris avec le Fonds monétaire international. « Nous essayons de contenir ce déficit dans les limites de ce que nous avons convenu avec le Fonds monétaire », a-t-il reconnu.</p>
<p>« Le Gouvernement fait vite le choix de sacrifier le peuple pour ne pas se mettre à dos le FMI », commente l'éditorial, qui interroge la solidité de l'assise économique du pays au regard de la croissance dont il se prévaut par ailleurs.</p>`,
      tags: ['carburant', 'FMI', 'pouvoir d\'achat'],
      format: 'EDITION', rubrique: politique, auteur: chefPolitique, heures: 115,
    },
    {
      slug: 'grace-presidentielle-clemence-ouattara-portes-politique',
      titre: 'Grâce présidentielle : la clémence de Ouattara s\'arrête aux portes du politique',
      chapo: "Le président Ouattara a signé deux décrets accordant la liberté à 4 661 détenus de droit commun, mais aucun geste envers les personnes détenues pour des affaires liées à la vie politique.",
      contenuHtml: `<p>À la veille du 66e anniversaire de l'indépendance, le président Alassane Ouattara a signé deux décrets accordant la liberté à 4 661 détenus de droit commun : grâce présidentielle pour 2 064 d'entre eux, remise de peine pour 2 597 autres condamnés à un reliquat inférieur à trente-six mois.</p>
<p>Le même jour, le président du FPI, Pascal Affi N'Guessan, appelait à la libération des personnes détenues pour des affaires liées à la vie politique. La distinction opérée par le chef de l'État est explicite : ses décrets ciblent des détenus de droit commun condamnés pour des infractions mineures, une catégorie qui exclut par définition les dossiers à connotation politique.</p>
<p>Or la loi ivoirienne ne limite pas le droit de grâce présidentielle à cette seule catégorie. Rien, sur le plan constitutionnel, n'empêchait un geste plus large — ce choix dessine, en creux, une ligne de fracture persistante entre le pouvoir et une partie de l'opposition.</p>`,
      tags: ['grâce présidentielle', 'détenus politiques', 'FPI'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: chefPolitique, heures: 110,
    },
    {
      slug: 'litige-foncier-modeste-procureur-suspend-decision-grand-bassam',
      titre: 'Litige foncier sur un projet immobilier à Modeste : un procureur général suspend la décision du tribunal de Grand-Bassam',
      chapo: "Le tribunal de première instance de Grand-Bassam avait ordonné le déguerpissement de la société Italia Construction et la démolition de logements haut standing déjà vendus.",
      contenuHtml: `<p>Le procureur près la Cour d'appel d'Abidjan, Sory Naye Henriette, a requis qu'il soit sursis à l'exécution de la décision du tribunal de première instance de Grand-Bassam, laquelle ordonnait le déguerpissement de la société Italia Construction d'un terrain urbain de 10 000 m² et la démolition de ses constructions.</p>
<p>En attendant la décision de la Cour d'appel saisie par la société, les acquéreurs qui ont payé très cher ces logements — appartements et villas basses — retiennent leur souffle face à ce « séisme immobilier » auquel ils ne s'attendaient pas.</p>
<p>« L'exécution immédiate de ce jugement étant susceptible d'entraîner des conséquences manifestement excessives et difficilement réversibles pour les parties concernées », le Parquet général a requis le sursis, précisant que cette décision ne préjuge en rien du fond du litige ni des droits respectifs des parties.</p>`,
      tags: ['foncier', 'Grand-Bassam', 'justice'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 105,
    },
    // --- n°7968 (12 août) — heures ~70-95h ---
    {
      slug: 'ouattara-yopougon-prisonniers-opinion-vie-chere-orpaillage',
      titre: 'Prisonniers d\'opinion, vie chère, ordures, orpaillage illégal… Ouattara était à Yopougon, et la suite ?',
      chapo: "Le défilé militaire du 66e anniversaire a marqué les esprits, mais les grands maux dénoncés par la rédaction restent sans réponse dans l'adresse du chef de l'État.",
      contenuHtml: `<p>Le président de la République était le 7 août dans la commune de Yopougon, choisie pour accueillir les festivités de 2026. Il s'y est rendu avec l'armée de la Côte d'Ivoire pour un défilé militaire présenté comme une démonstration de force. Mais après le faste, la question demeure : et après ?</p>
<p>Sur la vie chère, aucune réponse forte n'a été donnée depuis Yopougon. L'augmentation du prix du carburant qui a précédé la fête nationale a été un non-événement pour le chef de l'État, dont les compatriotes ne sont pourtant pas logés à la même enseigne que lui face à cette charge économique.</p>
<p>L'orpaillage illégal, devenu un « véritable cancer » pour le gouvernement selon plusieurs préfets, n'a pas davantage été abordé, pas plus que la prolifération des ordures ménagères à Abidjan, dénoncée de longue date par le président du FPI Pascal Affi N'Guessan.</p>`,
      tags: ['Ouattara', 'Yopougon', 'orpaillage', 'vie chère'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: redacteurEnChef, heures: 90,
    },
    {
      slug: 'bictogo-brigade-salubrite-yopougon',
      titre: "Commune de Yopougon : Bictogo annonce la création d'une brigade de salubrité",
      chapo: "Le député-maire a aussi acté la pérennisation du Village de l'Indépendance, qui a accueilli jusqu'à 7500 visiteurs par jour durant les festivités.",
      contenuHtml: `<p>Le député-maire de Yopougon, Adama Bictogo, a annoncé la création d'une brigade de salubrité indépendante de la police municipale, ainsi que la pérennisation du Village de l'Indépendance, au terminus 47, lors d'une réunion extraordinaire du conseil municipal.</p>
<p>« On va rapidement rouvrir », a annoncé Bictogo, précisant qu'un espace numérique consacré à la formation et aux start-up sera intégré au site, ainsi qu'un guichet de financement doté de 500 millions FCFA destiné à soutenir des projets portés par les jeunes.</p>
<p>Sur le volet salubrité, la nouvelle brigade, placée sous l'autorité directe du cabinet du maire, viendra renforcer l'action des 50 chefs de comités locaux d'assainissement déjà mobilisés dans les quartiers de la commune.</p>`,
      tags: ['Yopougon', 'Bictogo', 'salubrité'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 85,
    },
    {
      slug: 'daloa-38-millions-voles-caches-puits',
      titre: '38 millions volés cachés dans un puits à Daloa',
      chapo: "Un vigile de l'entreprise cambriolée, âgé de 37 ans, a reconnu son implication dans le vol de plus de 47 millions FCFA et l'agression mortelle du gardien de nuit.",
      contenuHtml: `<p>Le cambriolage d'une importante société à Daloa a eu lieu dans la nuit du 2 au 3 août dernier : plus de 47 millions FCFA volés, le bureau du responsable de zone incendié, et le gardien de nuit, âgé de 60 ans, violemment agressé. Grièvement blessé, il a succombé à ses blessures au Centre hospitalier régional de Daloa.</p>
<p>Les enquêtes de la Brigade de recherche et d'intervention (BRI) se sont rapidement orientées vers un homme connaissant bien les lieux. Interpellé le 5 août, B.M., de nationalité malienne, a reconnu son implication dans le cambriolage et l'agression mortelle de son collègue.</p>
<p>Une perquisition à son domicile a permis de découvrir une partie du butin cachée dans une fosse septique : 38 425 400 FCFA ont été récupérés. Le suspect a été placé en garde à vue, et les enquêteurs poursuivent leurs investigations pour retrouver le reliquat.</p>`,
      tags: ['Daloa', 'cambriolage', 'fait divers'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 80,
    },
    // --- n°7969 (13 août) — heures ~45-65h ---
    {
      slug: 'affi-nguessan-gouvernement-complice-orpaillage',
      titre: "Exploitation minière tous azimuts : Affi N'Guessan accuse « le Gouvernement est complice de l'orpaillage »",
      chapo: "Pour le président du FPI, l'orpaillage illégal expose les régions à la famine en détournant l'agriculture de ses bras valides, avec la complicité d'autorités locales.",
      contenuHtml: `<p>« Si aujourd'hui les choses n'avancent pas, c'est parce que le gouvernement actuel n'a pas intérêt à ce que cela avance. Puisqu'il connaît tous ceux qui sont dans ce réseau et que, quelque part, il est complice de ce qui se passe », a déclaré Pascal Affi N'Guessan dans une interview accordée à un média en ligne.</p>
<p>L'ancien Premier ministre indexe aussi les autorités locales : « Il y a des autorités administratives et sécuritaires qui sont souvent impliquées dans l'orpaillage clandestin. Ce sont elles-mêmes qui entretiennent les réseaux. » Il révèle que son propre village, dans le Moronou, est concerné, avec des terres attribuées à des entreprises minières semi-industrielles.</p>
<p>Comme solution, il propose d'encadrer la délivrance des agréments et de responsabiliser les propriétaires terriens : « Il faut impliquer les propriétaires terriens dans la lutte contre l'orpaillage clandestin et les considérer comme complices s'ils ne font rien pour empêcher que leurs terres soient exploitées illégalement. »</p>`,
      tags: ['orpaillage', 'Affi N\'Guessan', 'environnement'],
      format: 'EDITION', rubrique: politique, auteur: chefPolitique, heures: 60,
    },
    {
      slug: 'financement-medias-gouvernement-capter-recettes-publicitaires',
      titre: 'Financement des médias : le gouvernement veut mieux capter les recettes du marché publicitaire',
      chapo: "Un atelier réuni à Grand-Bassam constate un écart croissant entre la progression du marché publicitaire ivoirien et les recettes de la Taxe sur la Publicité effectivement recouvrées.",
      contenuHtml: `<p>Pour l'Agence de soutien et de développement des médias (ASDM), la question est devenue urgente : seulement 2,384 milliards FCFA de Taxe sur la Publicité (TSP) ont été recouvrés et effectivement affectés à l'agence entre 2022 et août 2026, alors que le financement de son Plan stratégique 2024-2026 en attend près de 7 milliards.</p>
<p>Les investissements publicitaires sont pourtant passés de 38 milliards FCFA en 2022 à 49 milliards en 2024. En appliquant le taux de 3 % à cette valeur du marché, l'ASDM aurait potentiellement dû recevoir bien davantage — un écart estimé à environ 747 millions FCFA pour 2023 et 2024 selon l'expert-consultant Yao Angara.</p>
<p>« Une agence sans ressources suffisantes est une ambition sans bras pour agir », a martelé le ministre de la Communication, Amadou Coulibaly, plaidant pour un dispositif digitalisé rapprochant déclarations des entreprises, encaissements du Trésor et reversements à l'ASDM.</p>`,
      tags: ['médias', 'taxe publicité', 'ASDM'],
      format: 'EDITION', rubrique: economie, auteur: secretaireGeneral, heures: 55,
    },
    {
      slug: 'derives-mercantiles-certains-pretres',
      titre: 'Contribution : les dérives mercantiles de certains prêtres',
      chapo: "Un ancien prêtre dénonce la multiplication des célébrations d'anniversaires d'ordination, contraires aux directives de la Conférence des évêques catholiques de Côte d'Ivoire.",
      contenuHtml: `<p>« On voit des prêtres célébrer 1, 5, 10, 13, 20, 22, 26, 30, 35, 40 ou 41 ans de sacerdoce », s'insurge l'auteur de cette contribution, rappelant que la Conférence des évêques catholiques de Côte d'Ivoire a clairement dit non aux célébrations intermédiaires, seuls les jubilés des 25, 50, 75 et 100 ans méritant d'être célébrés avec faste.</p>
<p>Au début de l'année pastorale 2025-2026, Mgr Ignace Bessi a rappelé cette décision, insistant sur le fait que les quêtes, dons et offrandes sont faits pour la vie de l'Église et non pour un individu, fût-il prêtre ou évêque. Un rappel qui, selon l'auteur, reste trop souvent lettre morte.</p>
<p>« Il est temps que chaque évêque mette fin à ces dérives mercantiles qui sont une atteinte au vœu de pauvreté », conclut la contribution, qui appelle à des anniversaires « sobres, discrets et strictement personnels » en dehors des grands jubilés.</p>`,
      tags: ['Église catholique', 'contribution', 'société'],
      format: 'DECRYPTAGE', rubrique: culture, auteur: chefCulture, heures: 50,
    },
    {
      slug: 'yan-diomande-real-madrid-impossible-dire-non',
      titre: 'Yan Diomandé : « Quand le Real appelle, impossible de dire non »',
      chapo: "Arrivé du RB Leipzig, l'international ivoirien évoque avec enthousiasme ses premiers jours au Real Madrid et sa relation avec José Mourinho.",
      contenuHtml: `<p>« Avant tout, je tiens à remercier José Mourinho. C'est précisément grâce à José et à la confiance que m'ont accordée les dirigeants du club que j'ai aujourd'hui la chance de porter le maillot du Real », a déclaré Yan Diomandé après son arrivée au Real Madrid.</p>
<p>Le joueur s'est montré impressionné par l'environnement du vestiaire : « Être côte à côte avec de tels joueurs de premier plan est une sensation incroyable. Avant, je regardais leurs matchs uniquement à la télévision, et maintenant je suis assis avec eux dans le même vestiaire. »</p>
<p>« Lorsqu'un club comme le Real Madrid vous appelle, vous ne pouvez absolument pas dire non. Je veux atteindre les sommets avec ce club et aider mon équipe à remporter tous les trophées possibles », a conclu l'international ivoirien.</p>`,
      tags: ['football', 'Real Madrid', 'mercato'],
      format: 'FLASH', rubrique: sport, auteur: redacteurSport, heures: 45,
    },
  ];

  let crees = 0;
  for (const a of articles) {
    const existant = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (existant) continue;
    const publieLe = h(a.heures);
    await prisma.article.create({
      data: {
        slug: a.slug, titre: a.titre, chapo: a.chapo, contenuHtml: a.contenuHtml, tags: a.tags,
        format: a.format, statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: a.rubrique.id, auteurId: a.auteur.id, valideParId: redacteurEnChef.id,
        publieLe, createdAt: publieLe, updatedAt: publieLe,
        vuesTotal: Math.floor(200 + Math.random() * 4000),
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} article(s) du second lot créé(s) (${articles.length - crees} déjà existant(s)).`);
}

// Troisième lot — contenu réel des n°7961 à 7964 (31 juillet-5 août 2026),
// les 4 derniers numéros de l'archive PDF fournie. Complète l'historique
// vers l'amont (avant le n°7965 déjà seedé). Même principe d'attribution
// et d'idempotence que les lots précédents.
async function seedArticlesBatch3() {
  const rubrique = async (nom) => prisma.rubrique.findUniqueOrThrow({ where: { slug: slugify(nom) } });
  const staff = async (email) => prisma.staff.findUniqueOrThrow({ where: { email } });

  const [politique, economie, societe, regions, culture, sport] = await Promise.all(
    ['Politique', 'Économie', 'Société', 'Régions', 'Culture', 'Sport'].map(rubrique)
  );
  const [redacteurEnChef, secretaireGeneral, chefPolitique, chefCulture, redacteurSport, regie] = await Promise.all([
    staff('redacteur-en-chef@notrevoienews.com'),
    staff('secretaire-general@notrevoienews.com'),
    staff('chef-politique@notrevoienews.com'),
    staff('chef-culture@notrevoienews.com'),
    staff('redacteur@notrevoienews.com'),
    staff('regie@notrevoienews.com'),
  ]);

  const h = (heures) => new Date(Date.now() - heures * 3600 * 1000);

  const articles = [
    // --- n°7961 (31 juillet-2 août) — heures ~285-310h ---
    {
      slug: 'cote-ivoire-demene-sortir-guepier-blanchiment-capitaux',
      titre: 'Blanchiment de capitaux et financement du terrorisme : la Côte d\'Ivoire se démène pour sortir du guêpier',
      chapo: "Maintenue sur la liste grise du GAFI lors de la plénière de juin 2026 à Paris, la Côte d'Ivoire mise sur le nouveau Pôle pénal économique et financier pour convaincre d'ici la plénière d'octobre.",
      contenuHtml: `<p>La Côte d'Ivoire figure toujours sur la liste grise du Groupe d'action financière (GAFI) et sur la liste noire de l'Union européenne en matière de blanchiment de capitaux et de financement du terrorisme. Des rumeurs avaient annoncé sa sortie prématurée, mais elle a bel et bien été maintenue lors de la session de juin 2026 à Paris — seules l'Algérie et la Namibie en sont sorties à cette occasion.</p>
<p>Une mission cruciale d'évaluateurs du GAFI est attendue en Côte d'Ivoire en septembre 2026, pour vérifier sur le terrain l'application concrète des réformes. Les autorités espèrent une décision de retrait officiel dès la plénière d'octobre 2026, si cette visite confirme les progrès. L'installation fin juillet du Pôle pénal économique et financier dans son nouveau siège de Cocody 2 Plateaux se veut une vitrine institutionnelle.</p>
<p>Mais des procès concernent jusque-là essentiellement de « petits calibres » : l'absence de personnalités politiques ou de hauts fonctionnaires parmi les poursuites interroge sur la réalité de la volonté de lutte contre le blanchiment au sommet de l'État.</p>`,
      tags: ['GAFI', 'blanchiment de capitaux', 'justice'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: redacteurEnChef, heures: 300,
    },
    {
      slug: 'bedie-le-sphinx-de-daoukro-il-y-a-trois-ans',
      titre: 'Commémoration du décès de l\'ancien président ivoirien : Bédié, le Sphinx de Daoukro, il y a trois ans',
      chapo: "Des messes ont été célébrées à Pépressou, son village natal, et à la paroisse Saint-Jean de Cocody, en présence de nombreux cadres du PDCI-RDA.",
      contenuHtml: `<p>Cela fait trois ans que l'ancien président ivoirien Aimé Henri Konan Bédié, surnommé le « Sphinx de Daoukro », s'est éteint, le 1er août 2023. Des messes ont été célébrées en sa mémoire, l'une dans son village natal de Pépressou, dans la sous-préfecture de Daoukro, l'autre à la paroisse catholique Saint-Jean de Cocody.</p>
<p>Le secrétaire exécutif du PDCI-RDA, Calice Yapo Yapo, l'ancien secrétaire exécutif Maurice Kacou Guikahué et plusieurs autres figures du parti se sont rendus à Pépressou pour ce moment de recueillement aux côtés de la veuve, Henriette Konan Bédié.</p>
<p>Économiste, diplomate et président de la République de 1993 à 1999, Henri Konan Bédié aura mené une vie riche : ambassadeur à 26 ans, ministre de l'Économie et des Finances, président de l'Assemblée nationale, avant d'accéder à la magistrature suprême à la mort de Félix Houphouët-Boigny puis de lancer, en 2015, l'« Appel de Daoukro » en faveur d'Alassane Ouattara.</p>`,
      tags: ['PDCI-RDA', 'Henri Konan Bédié', 'commémoration'],
      format: 'EDITION', rubrique: politique, auteur: chefPolitique, heures: 290,
    },
    {
      slug: 'assemblee-nationale-deputes-95-pourcent-electeurs-non-choisis',
      titre: 'Boycott des élections, dispersion des voix, abstention : l\'Assemblée nationale et ces députés que 95 % des électeurs n\'ont pas choisis',
      chapo: "Avec un taux de participation national de 35,04 % aux législatives du 27 décembre 2025, plusieurs députés doivent leur siège à moins d'un électeur inscrit sur vingt.",
      contenuHtml: `<p>Sur 8 597 092 électeurs inscrits, seuls 3 012 094 se sont déplacés aux législatives du 27 décembre 2025, soit un taux de participation national de 35,04 %. Une abstention massive à laquelle le boycott appelé par le PPA-CI de Laurent Gbagbo n'est pas étranger, combinée à une multiplication des candidatures indépendantes.</p>
<p>À Gagnoa (circonscription 069), quinze candidats se sont affrontés pour un seul siège : le vainqueur, l'indépendant Moussa Konaté, l'a emporté avec 18,72 % des suffrages exprimés — soit à peine 4 % du corps électoral total de 46 572 inscrits. À Kossou, le journaliste Léandre Kouakou Kouhouré Koffi a été élu avec seulement 5,3 % du corps électoral.</p>
<p>Sur le plan strictement juridique, ces élus disposent de la plénitude de leurs prérogatives : le droit électoral ivoirien, comme la plupart des systèmes à scrutin majoritaire à un tour, ne connaît pas de seuil minimal de participation. Mais la légitimité politique ne se limite pas à la légalité, et la question de la représentativité réelle des élus reste entière.</p>`,
      tags: ['Assemblée nationale', 'législatives', 'abstention'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: chefPolitique, heures: 225,
    },
    {
      slug: 'cherte-carburant-loyer-vivres-transport-pouvoir-achat-souffrance',
      titre: 'Cherté du carburant, du loyer, des vivres, du transport, de l\'électricité : le pouvoir d\'achat en souffrance',
      chapo: "Entre loyers impayables, « pas-de-porte » redoutés et panier de la ménagère qui se vide chaque jour, le quotidien devient difficilement soutenable pour les ménages les plus vulnérables.",
      contenuHtml: `<p>Pour un logement de deux pièces, il faut débourser par mois 150 000 FCFA pour être généreux, sinon dans certains quartiers c'est au-delà de 250 000 FCFA. Le salaire étant maigre, le travailleur n'a pas la capacité de souscrire à un projet immobilier pour s'offrir une maison — il est condamné à louer jusqu'au soir de sa vie.</p>
<p>Dans le secteur de l'immobilier commercial, le phénomène redouté des « pas-de-porte » — des millions à débourser, non remboursables, sans rapport avec la caution — prend la forme d'une escroquerie bien huilée contre laquelle le gouvernement manque de volonté, freinant l'entrepreneuriat qu'il prétend par ailleurs encourager.</p>
<p>Le prix minimum du maïs braisé, pourtant semé et récolté en Côte d'Ivoire, est de 200 FCFA. Le riz local est plus cher que le riz importé. « Le panier de la ménagère est un désert. Le coût du transport ruine », résume l'article, qui rappelle que le kilogramme de viande a doublé pour atteindre 3 500 à 4 000 FCFA depuis 2011.</p>`,
      tags: ['vie chère', 'pouvoir d\'achat', 'loyer'],
      format: 'DECRYPTAGE', rubrique: politique, auteur: chefPolitique, heures: 215,
    },
    // --- Économie ---
    {
      slug: 'vrai-tresor-afrique-pas-sous-la-terre-eco-2027',
      titre: 'ECO 2027 : le vrai trésor de l\'Afrique n\'est pas sous la terre',
      chapo: "Dans sa rubrique « Au cœur de l'économie », l'économiste et banquier Guillaume Liby dépasse le mythe d'une monnaie garantie par l'or : la solidité monétaire naît d'économies productives, pas de coffres pleins.",
      contenuHtml: `<p>« Nos pays disposent d'importantes réserves d'or, nous pouvons donc créer une monnaie nationale souveraine » : cet argument, qui revient avec insistance à l'approche de l'entrée en vigueur de l'ECO en 2027, repose sur une confusion entre richesse minière d'un pays et fondements d'une monnaie moderne, explique Guillaume Liby.</p>
<p>Depuis la suspension par Richard Nixon, en 1971, de la convertibilité du dollar en or, aucune grande monnaie internationale n'est plus adossée au métal précieux. « Au XIXe siècle, la richesse faisait la monnaie par l'or ; au XXIe siècle, la richesse fait la monnaie par la production », résume l'économiste, citant l'exemple de Singapour, sans mine d'or mais à la monnaie parmi les plus solides d'Asie.</p>
<p>« La véritable question est : sommes-nous capables de construire une économie suffisamment forte pour donner naturellement de la valeur à notre monnaie ? », interroge-t-il, plaidant pour une souveraineté monétaire qui « commence dans les champs modernisés, les usines, les ports, les universités » plutôt que dans les coffres d'une banque centrale.</p>`,
      tags: ['ECO 2027', 'monnaie', 'économie'],
      format: 'DECRYPTAGE', rubrique: economie, auteur: secretaireGeneral, heures: 295,
    },
    {
      slug: 'accord-cote-ivoire-botswana-or-africain-richesse-durable',
      titre: 'Accord Côte d\'Ivoire-Botswana : le pari de l\'or africain transformé en richesse durable',
      chapo: "Premier accord de coopération minière entre les deux pays, signé à Gaborone, avec le Botswana comme modèle de gestion responsable des ressources naturelles.",
      contenuHtml: `<p>La Côte d'Ivoire et le Botswana ont signé leur premier accord de coopération dans les secteurs des mines et de l'énergie, un partenariat qui marque une nouvelle orientation : passer de la simple exploitation des ressources naturelles à la création d'une industrie minière intégrée et génératrice de valeur.</p>
<p>Le choix du Botswana comme partenaire n'est pas un hasard : grâce au diamant, ce pays a réussi à construire une chaîne de valeur complète, de l'exploration à la commercialisation, en utilisant les revenus miniers pour soutenir son développement. Pour la Côte d'Ivoire, dont les découvertes aurifères de Koné, Tanda-Iguela et Doropo renforcent l'attractivité, l'objectif est de s'inspirer de cette expérience.</p>
<p>« La véritable réussite d'un secteur extractif ne se mesure pas uniquement au volume des découvertes, mais à sa capacité à générer une dynamique économique endogène », a résumé Mamadou Sangafowa-Coulibaly, ministre des Mines, du Pétrole et de l'Énergie.</p>`,
      tags: ['Botswana', 'mines', 'coopération'],
      format: 'EDITION', rubrique: economie, auteur: secretaireGeneral, heures: 270,
    },
    {
      slug: 'abondance-petroliere-ne-profite-pas-aux-ivoiriens',
      titre: 'Énième hausse des prix du carburant : l\'abondance pétrolière qui ne profite pas aux Ivoiriens',
      chapo: "Malgré les gisements Baleine et Calao, la Côte d'Ivoire reste exposée aux prix internationaux : le consortium d'exploitation associe ENI (47 %), Vitol (30 %) et PETROCI (23 %) seulement.",
      contenuHtml: `<p>Le litre de super sans plomb est passé de 820 à 905 FCFA en trois mois à peine, tandis que le gasoil a grimpé de 655 à 725 FCFA. À chaque hausse, la même explication officielle revient : la conjoncture internationale. Mais cette justification mérite d'être interrogée à la lumière d'un paradoxe — la Côte d'Ivoire produit désormais son propre pétrole, et pourtant ses citoyens paient leur carburant de plus en plus cher.</p>
<p>Dans le montage du gisement Baleine, présenté comme une découverte de classe mondiale, la participation ivoirienne demeure minoritaire : le groupe italien ENI y détient environ 47 %, le négociant Vitol 30 %, et PETROCI, le bras pétrolier de l'État, environ 23 % seulement.</p>
<p>Second paradoxe : la Société ivoirienne de raffinage ne serait pas configurée pour traiter de manière optimale le brut extrait de Baleine, qui continue de s'approvisionner sur le marché international. La Côte d'Ivoire produit donc du pétrole brut, mais reste exposée aux prix internationaux des produits raffinés qu'elle consomme.</p>`,
      tags: ['pétrole', 'Baleine', 'carburant'],
      format: 'DECRYPTAGE', rubrique: economie, auteur: secretaireGeneral, heures: 210,
    },
    // --- Société ---
    {
      slug: '13e-prix-national-excellence-80-laureats-primes',
      titre: '13e édition du Prix national d\'Excellence : 80 lauréats primés',
      chapo: "Chaque lauréat, sur 3977 candidatures enregistrées, a reçu des mains du président Alassane Ouattara un trophée, un diplôme et une récompense de 10 millions FCFA.",
      contenuHtml: `<p>Quatre-vingts lauréats sur les 3 977 candidatures enregistrées ont été primés au palais de la présidence de la République, lors de la cérémonie de la 13e édition du Prix national d'Excellence présidée par le chef de l'État. Ces lauréats se répartissent en 45 personnes physiques et 35 personnes morales, dont 11 administrations publiques et 13 entreprises privées.</p>
<p>Dans le domaine de l'Éducation nationale, Ismaël Ivan Kien a été distingué comme meilleur élève au CEPE, Kouakou Guy Stéphane Dongo au BEPC et Bi Tra Aymard Yvan Gouli au baccalauréat. Dans le domaine de la Communication, Marie-Laure N'Goran a été distinguée pour le développement des médias.</p>
<p>Ces 80 lauréats seront les invités spéciaux du président de la République lors des festivités du 66e anniversaire de l'indépendance, prévues sur le boulevard de la Solidarité, à Yopougon.</p>`,
      tags: ['prix national d\'excellence', 'distinction'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 245,
    },
    {
      slug: 'bin-sin-bin-mourir-un-luxe-en-cote-ivoire',
      titre: 'Bin Sin Bin : mourir, un luxe en Côte d\'Ivoire',
      chapo: "Formol facturé en double, cercueil facturé au prix d'un modèle XXL, « organisation obsèques » facturée pour un service jamais rendu : le calvaire tarifaire des familles endeuillées, sans aucune grille de contrôle de l'État.",
      contenuHtml: `<p>Combien vaut un mort en Côte d'Ivoire ? Question absurde ? Pas pour les pompes funèbres, qui, elles, ont déjà la réponse chiffrée, gonflée et facturée sans honte. Le jour de la levée du corps, la facture tombe : formol facturé en double sans explication, cercueil en simple bois blanc facturé au prix d'un modèle XXL, manutention déclinée en quatre lignes pour un seul et même geste.</p>
<p>Ce ne sont pas des erreurs de facturation. C'est une méthode, tolérée dans le silence complice des cliniques qui empochent leur commission sur chaque corps enlevé, et dans le silence assourdissant de l'État, qui ne fixe aucune grille tarifaire, n'exerce aucun contrôle.</p>
<p>« Un pays qui laisse mourir sa population deux fois — une fois dans la maladie, une fois dans la facture — n'a plus rien d'un État protecteur », dénonce la chronique, qui appelle le ministère du Commerce et celui de la Santé à ouvrir les dossiers et fixer une grille tarifaire.</p>`,
      tags: ['pompes funèbres', 'chronique', 'consommation'],
      format: 'DECRYPTAGE', rubrique: societe, auteur: regie, heures: 218,
    },
    {
      slug: 'ecole-catholique-ecrase-moyennes-nationales-examens-2026',
      titre: 'Résultats des examens à grand tirage 2025-2026 : l\'école catholique écrase les moyennes nationales',
      chapo: "98,18 % de réussite au CEPE contre 85,76 % au niveau national, 88,74 % au BEPC contre 52,17 % : l'Éducation catholique confirme son leadership avec 521 établissements et 143 096 élèves.",
      contenuHtml: `<p>L'école catholique en Côte d'Ivoire confirme une fois de plus son rang de référence. Au Certificat d'études primaires élémentaires, l'Éducation catholique enregistre un taux historique de réussite de 98,18 %, contre 85,76 % au niveau national. Au BEPC, l'écart atteint plus de 36 points (88,74 % contre 52,17 %), et au Baccalauréat, plus de 27 points (67,89 % contre 40,60 %).</p>
<p>« Ces écarts, parmi les plus élevés observés dans le pays, traduisent l'efficacité de notre accompagnement des élèves jusqu'au terme du cycle secondaire », s'est félicité le père Félicien Guessé, secrétaire exécutif national de l'Éducation catholique (SENEC).</p>
<p>L'institution s'appuie sur un vaste réseau de 521 établissements accueillant 143 096 élèves, encadrés par 4 956 enseignants et personnels administratifs, avec des ratios jugés favorables : 29 élèves par enseignant au préscolaire, 40 au primaire et 27 au secondaire.</p>`,
      tags: ['éducation catholique', 'examens', 'résultats scolaires'],
      format: 'EDITION', rubrique: societe, auteur: secretaireGeneral, heures: 208,
    },
    // --- Culture ---
    {
      slug: 'finale-awoulaba-reines-afrique-sonia-nguessan-moronou',
      titre: 'Finale Awoulaba Reines d\'Afrique : Sonia N\'Guessan du Moronou sur le trône',
      chapo: "La candidate du Moronou, 43 ans et mère de 6 enfants, a battu Nakan Traoré de six points (188 contre 182 sur 220), dans une soirée glamour au palais de la Culture de Treichville.",
      contenuHtml: `<p>Mlle Malan Sonia Nadège épouse N'Guessan, de la région du Moronou, détient le trône du concours Awoulaba Reines d'Afrique. Elle a battu Mlle Nakan Traoré, première Saraman, de six points seulement — 188 contre 182 sur 220 — au terme d'une bataille rude dans la salle François Bernard Lougah du palais de la Culture d'Abidjan-Treichville.</p>
<p>Son âge, 43 ans, ses six enfants et la conservation de son physique sont, à l'en croire, les atouts qui ont milité en sa faveur. La nouvelle beauté ivoirienne place son mandat sous l'autonomisation de la femme : « La femme dans son foyer doit avoir une indépendance financière et contribuer aux dépenses dans le but d'éviter les tensions et conflits. »</p>
<p>Isabelle Tano, directrice générale des Loisirs représentant la ministre de la Culture, a salué un concours qui « doit inspirer les jeunes et contribuer à la promotion de la destination ivoirienne » — la vitrine du patrimoine culturel du pays.</p>`,
      tags: ['Awoulaba', 'concours de beauté', 'Moronou'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 265,
    },
    {
      slug: 'marie-laure-ngoran-sacree-lauréate-prix-excellence-medias',
      titre: 'Prix national d\'Excellence 2026 pour le développement des médias : Marie-Laure N\'Goran sacrée lauréate',
      chapo: "Présentatrice-vedette du Journal Télévisé de 20H et fraîchement élue présidente de l'UNJCI, elle a reçu sa distinction des mains du président Alassane Ouattara.",
      contenuHtml: `<p>« Mon premier sentiment, c'est la reconnaissance », a déclaré Marie-Laure N'Goran, présidente de l'Union nationale des journalistes de Côte d'Ivoire (UNJCI), après avoir reçu le Prix national d'Excellence 2026 pour le développement des médias, au palais de la présidence de la République.</p>
<p>« Recevoir ce prix au moment même où les confrères me confient la présidence de l'UNJCI, c'est pour moi un signe que l'engagement, le travail bien fait et l'éthique finissent toujours par être vus et reconnus », s'est-elle félicitée, fixant trois priorités : le journaliste, l'excellence et la crédibilité, et l'unité de la corporation.</p>
<p>Présentatrice-vedette du Journal Télévisé de 20H et triple lauréate du prix « Ebony du Meilleur Présentateur », Marie-Laure N'Goran s'impose depuis 2011 comme une figure majeure des médias ivoiriens, également fondatrice de la plateforme « Les Marielordivoire ».</p>`,
      tags: ['UNJCI', 'médias', 'distinction'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 240,
    },
    {
      slug: 'amah-helene-enflamme-palais-culture-identite-agni',
      titre: 'Concert à Treichville : Amah Hélène enflamme le Palais de la Culture et célèbre l\'identité Agni',
      chapo: "La diva de la musique tradi-moderne agni a rempli la salle de 4000 places, portée par des délégations venues de tout le Moronou.",
      contenuHtml: `<p>La diva de la musique tradi-moderne agni, Amah Hélène, a offert un concert d'exception au Palais de la Culture de Treichville. Ce rendez-vous culturel restera gravé dans les mémoires des populations du Moronou et de l'ensemble de la communauté agni, venues nombreuses célébrer l'une des plus grandes voix de la musique traditionnelle ivoirienne.</p>
<p>La salle de 4 000 places, archicomble, a vibré durant plusieurs heures au rythme des sonorités agni. La communion entre l'artiste et son public a constitué l'un des temps forts de la soirée, les spectateurs reprenant en chœur la plupart des chansons.</p>
<p>Au-delà du spectacle, ce concert a constitué une véritable célébration de l'identité culturelle agni, démontrant que la valorisation des cultures locales demeure un puissant facteur de cohésion et de transmission des valeurs.</p>`,
      tags: ['musique agni', 'concert', 'Moronou'],
      format: 'EDITION', rubrique: culture, auteur: chefCulture, heures: 212,
    },
    // --- Régions ---
    {
      slug: 'incendie-orphelinat-mamie-therese-gouvernement-prise-en-charge',
      titre: 'Après l\'incendie dans un orphelinat, le gouvernement annonce la prise en charge des brûlés',
      chapo: "Deux nourrissons sont morts brûlés vifs à l'orphelinat Mamie Thérèse d'Abengourou ; la ministre de la Femme, de la Famille et de l'Enfant, Nassénéba Touré, s'est rendue au chevet des blessés.",
      contenuHtml: `<p>Après l'incendie meurtrier survenu à l'orphelinat Mamie Thérèse, le ministre de la Communication Amadou Coulibaly et la ministre de la Femme, de la Famille et de l'Enfant, Nassénéba Touré, se sont rendus à l'Établissement public hospitalier régional et à l'orphelinat pour exprimer leur compassion.</p>
<p>« Deux de nos enfants nous ont quittés. Nous partageons la douleur de tous », a déclaré Nassénéba Touré, annonçant une prise en charge médicale, psychologique et sociale des pensionnaires et du personnel. Deux autres nourrissons brûlés ont survécu.</p>
<p>Les enfants évacués sont provisoirement accueillis dans un centre de la petite enfance du ministère. « Notre objectif est qu'avant la prochaine rentrée scolaire, un site conforme aux normes et dûment agréé soit identifié », a-t-elle précisé. Ce drame intervient moins de deux semaines après un premier incendie dans le même établissement.</p>`,
      tags: ['Abengourou', 'incendie', 'orphelinat'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 285,
    },
    {
      slug: 'bouna-deux-allogenes-condamnes-20-ans-tentative-meurtre',
      titre: 'Bouna : deux allogènes condamnés à 20 ans de prison pour tentative de meurtre sur un bouvier',
      chapo: "Criblé de balles et jeté dans un trou pour effacer les traces, le bouvier de Govitan a survécu et identifié l'un de ses agresseurs, habitant du village.",
      contenuHtml: `<p>Le tribunal de première instance de Bouna a infligé une peine de 20 ans de prison ferme à deux ressortissants étrangers reconnus coupables de tentative de meurtre sur un bouvier, dans le département de Téhini. Les faits remontent au 9 novembre 2024, près de Govitan, un village proche de la frontière avec le Burkina Faso.</p>
<p>Grièvement blessé par des tirs de fusil de calibre 12, le bouvier a été jeté dans un trou par ses agresseurs, qui le croyaient mort, pendant que son complice convoyait le troupeau volé vers l'autre côté de la frontière. Profitant d'un sursaut de lucidité, la victime est parvenue à s'extirper de la fosse et à rejoindre son village.</p>
<p>Le lendemain, l'un des malfaiteurs est revenu sur les lieux pour refermer le trou et effacer les preuves — à sa grande surprise, la victime avait disparu. Elle a formellement identifié l'un de ses agresseurs, permettant l'interpellation des deux hommes. Quant aux bœufs volés, ils restent à ce jour introuvables.</p>`,
      tags: ['Bouna', 'justice', 'fait divers'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 218,
    },
    {
      slug: 'bangolo-brule-essence-incendie-domicile',
      titre: 'Bangolo : il la brûle en l\'aspergeant d\'essence et incendie son domicile',
      chapo: "Pris de colère après avoir été surpris en infidélité, un homme de 28 ans a aspergé d'essence sa compagne et incendié la maison, avec leur fille dans les bras de la victime.",
      contenuHtml: `<p>La brigade de gendarmerie de Bangolo a interpellé le présumé auteur d'une tentative de meurtre consécutive à l'incendie volontaire d'une habitation, survenu à Gaoya. Le suspect, B. Franck, 28 ans, est soupçonné d'avoir délibérément mis le feu à une maisonnette dans laquelle dormait une jeune femme, qui a réussi à s'extraire des flammes à temps.</p>
<p>Selon les habitants du village, les faits trouvent leur origine dans un différend sentimental : le suspect aurait agi par crise de jalousie après avoir été surpris en flagrant délit d'infidélité par sa compagne.</p>
<p>Marquée dans sa chair et traumatisée, la victime, K.E., a raconté aux forces de l'ordre : « Prise de colère du fait de mes remontrances, il prend de l'essence dans le réservoir de sa moto, entre dans ma chambre, m'asperge d'essence ainsi que tous les biens meubles et incendie tout à l'aide d'un briquet. » Elle portait leur fille au dos au moment des faits.</p>`,
      tags: ['Bangolo', 'violence conjugale', 'fait divers'],
      format: 'FLASH', rubrique: regions, auteur: chefPolitique, heures: 205,
    },
    // --- Sport ---
    {
      slug: 'fifa-bute-uefa-concacaf-vente-parts-coupe-du-monde',
      titre: 'Vente des parts de la Coupe du monde : la FIFA bute sur l\'UEFA et la CONCACAF',
      chapo: "La FIFA veut créer une société commerciale sur la valeur marchande de la Coupe du monde, avec 20 % détenus par des investisseurs privés — l'UEFA dénonce un projet qui piétine « l'âme du football ».",
      contenuHtml: `<p>La FIFA a confirmé son projet de création d'une société commerciale sur la valeur marchande de la Coupe du monde, liée à la diffusion, au sponsoring, à la billetterie et aux licences, dont 20 % seraient détenus par des investisseurs privés. L'instance va travailler avec la banque JP Morgan pour ce projet baptisé FIFA Forward Enterprise, qui pourrait lever plus de 2 400 milliards FCFA.</p>
<p>Mais l'UEFA rejette l'objectif et accuse l'instance de piétiner « l'âme et la gouvernance du football qui ne sont pas des biens que l'on puisse échanger en l'absence totale de transparence sur les bénéficiaires financiers ». La Confédération nord et centraméricaine (CONCACAF) dénonce elle aussi un « projet flou et solitaire ».</p>
<p>Pour la FIFA, l'émanation de 211 fédérations à travers le monde doit préalablement approuver tout projet allant dans ce sens. L'instance annonce avoir lancé « un processus de consultation ». Affaire à suivre.</p>`,
      tags: ['FIFA', 'Coupe du monde', 'gouvernance'],
      format: 'EDITION', rubrique: sport, auteur: redacteurSport, heures: 280,
    },
    {
      slug: 'emerse-fae-vire-fif-je-suis-decu-oui',
      titre: 'Viré par la FIF : Émerse Faé, « je suis déçu, oui »',
      chapo: "Champion d'Afrique 2023 puis qualifié pour le Mondial 2026, le sélectionneur des Éléphants voit son contrat non renouvelé sans explication détaillée.",
      contenuHtml: `<p>« Le Comité Exécutif de la Fédération Ivoirienne de Football exprime sa profonde reconnaissance à Monsieur Émerse Faé pour son engagement, son professionnalisme et les services rendus à la tête de la Sélection nationale A », écrit la FIF dans un communiqué annonçant le non-renouvellement de son contrat, arrivé à terme le 31 juillet 2026.</p>
<p>« Hier matin, les dirigeants m'ont appelé pour me dire qu'il n'y aurait pas de prolongation. Ça s'est fait d'un coup, sans explication (…) Je suis déçu, oui. Cette équipe possède un énorme potentiel », a confié Émerse Faé au journal français L'Équipe.</p>
<p>Nommé sélectionneur par intérim en janvier 2024, il avait réussi l'exploit de conduire les Éléphants au sacre continental la même année, avant d'enchaîner qualification à la CAN 2025 et à la phase finale du Mondial 2026 — au total 36 matchs, 25 victoires, pour 2,19 points par match.</p>`,
      tags: ['Émerse Faé', 'Éléphants', 'FIF'],
      format: 'EDITION', rubrique: sport, auteur: redacteurSport, heures: 260,
    },
    {
      slug: 'qui-etait-franco-baresi-mort-31-juillet-2026',
      titre: 'Mort le 31 juillet 2026 : qui était Franco Baresi ?',
      chapo: "Le légendaire libero de l'AC Milan des années 1980-1990, triple vainqueur de la Coupe des clubs champions européens, est mort à 66 ans.",
      contenuHtml: `<p>Franco Baresi, le légendaire défenseur italien du grand AC Milan des années 1980 et 1990, est mort à l'âge de 66 ans, le 31 juillet. C'est une grande figure du football mondial que les moins de 20 ans ne peuvent pas connaître.</p>
<p>Avec le Milan AC, où il a effectué toute sa carrière après y avoir été intégré dès 1974, il a remporté trois Coupes des clubs champions européens (1989, 1990, 1994) et six titres de champion d'Italie, aux côtés de Paolo Maldini, dans la grande défense de fer de l'ère Arrigo Sacchi.</p>
<p>Champion du monde avec l'Italie en 1982 (sans jouer) et finaliste du Mondial 1994 face au Brésil, où il a raté son tir au but, Baresi est considéré comme l'un des plus grands liberos de l'histoire, avec 719 matchs disputés en rouge et noir et 81 sélections en Nazionale.</p>`,
      tags: ['Franco Baresi', 'AC Milan', 'nécrologie'],
      format: 'FLASH', rubrique: sport, auteur: redacteurSport, heures: 262,
    },
    {
      slug: 'herve-renard-retrouve-les-elephants',
      titre: 'Football : Hervé Renard retrouve les Éléphants',
      chapo: "Champion d'Afrique 2015 avec la Côte d'Ivoire, le technicien français revient officiellement comme sélectionneur de l'équipe nationale A, sur décision du président de la FIF Idriss Diallo.",
      contenuHtml: `<p>« La Fédération Ivoirienne de Football informe la famille du football ivoirien, ses associations membres, ses partenaires institutionnels et commerciaux et le grand public, que M. Hervé Jean-Marie Roger Renard est désigné en qualité de sélectionneur-entraîneur de l'équipe nationale A de Côte d'Ivoire », lit-on dans le communiqué de la fédération.</p>
<p>Hervé Renard retrouve donc les Éléphants qu'il avait conduits sur le toit de l'Afrique en 2015, lorsqu'il leur a permis de décrocher leur deuxième titre continental. « Champion d'Afrique avec la Côte d'Ivoire en 2015, M. Hervé Renard effectue son retour à la tête des Éléphants avec pour mission de conduire la sélection nationale dans la préparation et la participation aux prochaines compétitions internationales », explique le président de la FIF, Idriss Diallo.</p>
<p>Âgé de 58 ans, Hervé Renard est le premier sélectionneur à avoir remporté la CAN avec deux sélections différentes (Zambie 2012, Côte d'Ivoire 2015). Il a aussi conduit le Maroc au Mondial 2018 et l'Arabie saoudite au Mondial 2022, avant de diriger l'équipe de France féminine puis la Tunisie au Mondial 2026.</p>`,
      tags: ['Hervé Renard', 'Éléphants', 'sélectionneur'],
      format: 'EDITION', rubrique: sport, auteur: redacteurSport, heures: 210,
    },
  ];

  let crees = 0;
  for (const a of articles) {
    const existant = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (existant) continue;
    const publieLe = h(a.heures);
    await prisma.article.create({
      data: {
        slug: a.slug, titre: a.titre, chapo: a.chapo, contenuHtml: a.contenuHtml, tags: a.tags,
        format: a.format, statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: a.rubrique.id, auteurId: a.auteur.id, valideParId: redacteurEnChef.id,
        publieLe, createdAt: publieLe, updatedAt: publieLe,
        vuesTotal: Math.floor(200 + Math.random() * 4000),
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} article(s) du troisième lot créé(s) (${articles.length - crees} déjà existant(s)).`);
}

// Photothèque — premier lot de vraies photos, extraites des archives PDF du
// journal (n°7961 à 7969) via PyMuPDF, puis hébergées sur Cloudinary.
// Chaque photo rattachée à son article (galerie + image principale) via son
// slug ; une photo sans slug reste "en stock" dans la photothèque.
// Idempotent : vérifie l'URL Cloudinary avant de créer.
async function seedMediaBatch1() {
  const medias = [
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174451/notre-voie/photo/amqgywoe3g9gwiirg6wq.jpg", legende: "Le chef de l'État ivoirien face au dossier GAFI.", credit: "DR", articleSlug: "cote-ivoire-demene-sortir-guepier-blanchiment-capitaux" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174453/notre-voie/photo/clnaefkk1eertnmrtmnc.jpg", legende: "Les deux ministres en train de signer la convention qui lie les deux pays.", credit: "DR", articleSlug: "accord-cote-ivoire-botswana-or-africain-richesse-durable" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174455/notre-voie/photo/foxktrypnl9zsn654eq4.jpg", legende: "Dominique Ouattara s'adressant aux Premières dames d'Afrique à Luanda.", credit: "DR", articleSlug: null },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174457/notre-voie/photo/pon4najzxrvzyp4h1nfy.jpg", legende: "Nassénéba Touré au chevet des blessés.", credit: "DR", articleSlug: "incendie-orphelinat-mamie-therese-gouvernement-prise-en-charge" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174459/notre-voie/photo/frbivchkbxbam0htwdle.jpg", legende: "Gianni Infantino et Donald Trump font à nouveau parler d'eux.", credit: "DR", articleSlug: "fifa-bute-uefa-concacaf-vente-parts-coupe-du-monde" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174461/notre-voie/photo/w9eryzaofho8brgnif5r.jpg", legende: "L'illustre disparu, Henri Konan Bédié, a vécu et servi son pays.", credit: "DR", articleSlug: "bedie-le-sphinx-de-daoukro-il-y-a-trois-ans" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174463/notre-voie/photo/xa26wxqrtblgu39u4xw9.jpg", legende: "Merci Faé !", credit: "DR", articleSlug: "emerse-fae-vire-fif-je-suis-decu-oui" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174465/notre-voie/photo/cykylehdculbynan2g1d.jpg", legende: "La photo de famille des lauréats et du chef de l'État et son épouse.", credit: "DR", articleSlug: "13e-prix-national-excellence-80-laureats-primes" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174467/notre-voie/photo/g5f47g2vyxpbyrgzqxax.jpg", legende: "Marie-Laure N'Goran, entre le président Alassane Ouattara et son épouse Dominique Ouattara.", credit: "DR", articleSlug: "marie-laure-ngoran-sacree-lauréate-prix-excellence-medias" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174469/notre-voie/photo/apvzshdtshkci961b9nt.jpg", legende: "Franco Baresi.", credit: "DR", articleSlug: "qui-etait-franco-baresi-mort-31-juillet-2026" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174471/notre-voie/photo/dfrrhrd4dubkosfhhu2x.jpg", legende: "Les dernières législatives ont vu des candidats devenir députés sans la majorité des suffrages inscrits.", credit: "DR", articleSlug: "assemblee-nationale-deputes-95-pourcent-electeurs-non-choisis" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174472/notre-voie/photo/kxh9iodevzlsmtusexqm.jpg", legende: "La Côte d'Ivoire, un pays riche, un sous-sol généreux mais des populations ruinées par la cherté de la vie.", credit: "DR", articleSlug: "cherte-carburant-loyer-vivres-transport-pouvoir-achat-souffrance" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174474/notre-voie/photo/ftdgntcozhmotmxnrozs.jpg", legende: "Un rassemblement discipliné et responsable dans une célèbre école catholique d'Abidjan Cocody.", credit: "DR", articleSlug: "ecole-catholique-ecrase-moyennes-nationales-examens-2026" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174476/notre-voie/photo/crhuyp04vxeye2i9xck5.jpg", legende: "Sale temps pour ces criminels.", credit: "DR", articleSlug: "bouna-deux-allogenes-condamnes-20-ans-tentative-meurtre" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174478/notre-voie/photo/kpnlmqsyo2qlq60nm33s.jpg", legende: "Hervé Renard retrouve le banc ivoirien qu'il convoitait tant.", credit: "DR", articleSlug: "herve-renard-retrouve-les-elephants" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174479/notre-voie/photo/pcuvio7aummxg4xboz9f.jpg", legende: "Pascal Affi N'Guessan, président du Front populaire ivoirien.", credit: "DR", articleSlug: "affi-nguessan-souverainete-veritable-institutions-fortes" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174482/notre-voie/photo/tijpqig19vbytvi4q3mh.jpg", legende: "La filière café-cacao ivoirienne face au grand écart des prix.", credit: "DR", articleSlug: "cacao-ivoirien-or-brun-epreuve-records" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174485/notre-voie/photo/cznnmaapayuctzz5yxpr.jpg", legende: "Gaha Carine, la nouvelle reine de beauté ivoirienne Awoulaba 2026.", credit: "DR", articleSlug: "gaha-carine-reine-guemon-finale-awoulaba-2026" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174486/notre-voie/photo/th8w4r4obepb6obgmwtx.jpg", legende: "Cosrou, un village sous le choc après le meurtre d'un planteur.", credit: "DR", articleSlug: "dabou-planteur-retrouve-mort-plantation-cosrou" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174488/notre-voie/photo/daelax4rmn1nwq95h9ub.jpg", legende: "Adresse à la Nation du chef de l'État, à la veille des 66 ans de l'indépendance.", credit: "DR", articleSlug: "discours-nation-ouattara-promesses-epreuve-faits" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174490/notre-voie/photo/xd2iprtst5ogshatkb7f.jpg", legende: "Exportations ivoiriennes : la montée en puissance de l'or face au cacao.", credit: "DR", articleSlug: "exportation-or-monte-puissance-face-cacao" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174492/notre-voie/photo/qkolvn1tmdxk4bm03sdd.jpg", legende: "Le président gabonais Brice Clotaire Oligui Nguema à la cité de relogement de Songon Ayewahi.", credit: "DR", articleSlug: "president-gabonais-experience-ivoirienne-relogement" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174494/notre-voie/photo/pl77u8lfljb5ppneieif.jpg", legende: "Violences intercommunautaires à Kossandji, dans la sous-préfecture d'Alépé.", credit: "DR", articleSlug: "alepe-kossandji-six-morts-violences-conflit-foncier" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174496/notre-voie/photo/sdkpgaa7yqauftoyh6pg.jpg", legende: "Nouvelle hausse du prix du carburant à la pompe.", credit: "DR", articleSlug: "hausse-carburant-gouvernement-impuissant-lache-ivoiriens" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174497/notre-voie/photo/ejfghhvqgqjrrukzusbw.jpg", legende: "Grâce présidentielle : 4661 détenus de droit commun libérés.", credit: "DR", articleSlug: "grace-presidentielle-clemence-ouattara-portes-politique" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174499/notre-voie/photo/ecdjfzrsv9rhpjdt0aef.jpg", legende: "Le litige foncier autour d'un projet immobilier à Grand-Bassam.", credit: "DR", articleSlug: "litige-foncier-modeste-procureur-suspend-decision-grand-bassam" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174501/notre-voie/photo/q0qx8222w2ef5b6lwyux.jpg", legende: "Le président de la République lors du défilé militaire du 66e anniversaire, à Yopougon.", credit: "DR", articleSlug: "ouattara-yopougon-prisonniers-opinion-vie-chere-orpaillage" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174502/notre-voie/photo/idn8mbakt3c66b3zfjc8.jpg", legende: "Le député-maire de Yopougon, Adama Bictogo, annonce la création d'une brigade de salubrité.", credit: "DR", articleSlug: "bictogo-brigade-salubrite-yopougon" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174504/notre-voie/photo/kayokuvghbbghccgmdsw.jpg", legende: "Le cambriolage d'une société à Daloa qui a coûté la vie au gardien de nuit.", credit: "DR", articleSlug: "daloa-38-millions-voles-caches-puits" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174506/notre-voie/photo/q3hisng0twmig8arfysv.jpg", legende: "Pascal Affi N'Guessan accuse le gouvernement d'être complice de l'orpaillage illégal.", credit: "DR", articleSlug: "affi-nguessan-gouvernement-complice-orpaillage" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174508/notre-voie/photo/fuxokdzolnph2r12fjbc.jpg", legende: "Amadou Coulibaly, au centre, en compagnie du préfet du département de Grand-Bassam.", credit: "DR", articleSlug: "financement-medias-gouvernement-capter-recettes-publicitaires" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174510/notre-voie/photo/mytzxmomqyt2vdpmcxjw.jpg", legende: "Jean-Claude Djéréké interpelle les prêtres sur les dérives mercantiles.", credit: "DR", articleSlug: "derives-mercantiles-certains-pretres" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174512/notre-voie/photo/v1zte0s0mksiweaiqvfn.jpg", legende: "Yan Diomandé, trop heureux d'être au Real de Mourinho.", credit: "DR", articleSlug: "yan-diomande-real-madrid-impossible-dire-non" },
  ];

  let crees = 0;
  for (const m of medias) {
    const existant = await prisma.media.findFirst({ where: { url: m.url } });
    if (existant) continue;
    let articleId = null;
    if (m.articleSlug) {
      const article = await prisma.article.findUnique({ where: { slug: m.articleSlug } });
      if (article) {
        articleId = article.id;
        // La première photo rattachée à l'article devient aussi son image
        // principale (Une / carte d'article), si elle n'en a pas déjà une.
        if (!article.imageUneUrl) {
          await prisma.article.update({ where: { id: article.id }, data: { imageUneUrl: m.url } });
        }
      }
    }
    await prisma.media.create({
      data: { type: 'PHOTO', url: m.url, legende: m.legende, credit: m.credit, articleId },
    });
    crees++;
  }
  console.log(`✔ ${crees} photo(s) réelle(s) importée(s) dans la photothèque (${medias.length - crees} déjà existante(s)).`);
}

// Correctif — les 33 photos du premier lot avaient été extraites du flux
// PDF brut (bytes de l'image telle que stockée) sans tenir compte de la
// matrice de rotation appliquée par la page à l'affichage : elles
// ressortaient toutes à l'envers. Nouvelle extraction par rendu de la
// région de page (qui applique la bonne orientation), réhébergée sur
// Cloudinary. Ici on ne fait que remplacer l'URL des Media déjà en base
// (et l'imageUneUrl des articles qui la référençaient) — idempotent.
async function fixMediaBatch1Rotation() {
  const remplacements = [
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174451/notre-voie/photo/amqgywoe3g9gwiirg6wq.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175376/notre-voie/photo-v2/dwsbiacxnelx2b99wmuv.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174453/notre-voie/photo/clnaefkk1eertnmrtmnc.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175378/notre-voie/photo-v2/ehpwwjjebaxfcowgywdf.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174455/notre-voie/photo/foxktrypnl9zsn654eq4.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175381/notre-voie/photo-v2/gryaahlsenwwy0gj2mee.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174457/notre-voie/photo/pon4najzxrvzyp4h1nfy.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175383/notre-voie/photo-v2/l1cqcmtzviij7metsepf.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174459/notre-voie/photo/frbivchkbxbam0htwdle.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175385/notre-voie/photo-v2/h8c5k8bggmgxialiopt7.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174461/notre-voie/photo/w9eryzaofho8brgnif5r.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175387/notre-voie/photo-v2/vt2et1wiykrlrw6tbofd.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174463/notre-voie/photo/xa26wxqrtblgu39u4xw9.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175390/notre-voie/photo-v2/bkcmtk8n5qw18hyup200.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174467/notre-voie/photo/g5f47g2vyxpbyrgzqxax.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175393/notre-voie/photo-v2/mdyki75lnvyjmwhncsbc.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174465/notre-voie/photo/cykylehdculbynan2g1d.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175396/notre-voie/photo-v2/tncsn2jrke3xko1jfmeh.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174469/notre-voie/photo/apvzshdtshkci961b9nt.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175398/notre-voie/photo-v2/x4oz56yxlnkupwcx4iwm.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174471/notre-voie/photo/dfrrhrd4dubkosfhhu2x.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175400/notre-voie/photo-v2/hbuyk2pr63bwqygtikn5.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174472/notre-voie/photo/kxh9iodevzlsmtusexqm.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175402/notre-voie/photo-v2/qmrr6puikwfehvonvk3e.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174474/notre-voie/photo/ftdgntcozhmotmxnrozs.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175404/notre-voie/photo-v2/b45oinabwnzizgjj7if0.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174476/notre-voie/photo/crhuyp04vxeye2i9xck5.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175406/notre-voie/photo-v2/lqa3wreqkfl9boxbbif1.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174478/notre-voie/photo/kpnlmqsyo2qlq60nm33s.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175408/notre-voie/photo-v2/rnhfawad2vxc0dj46nw6.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174479/notre-voie/photo/pcuvio7aummxg4xboz9f.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175410/notre-voie/photo-v2/ff0t3enzbufidnkeaonv.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174482/notre-voie/photo/tijpqig19vbytvi4q3mh.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175413/notre-voie/photo-v2/gijgjidchndsjvktfkat.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174485/notre-voie/photo/cznnmaapayuctzz5yxpr.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175416/notre-voie/photo-v2/rbfcqlod3busk7vqwzt2.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174486/notre-voie/photo/th8w4r4obepb6obgmwtx.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175418/notre-voie/photo-v2/lxrxlbio3pjlqhagldvc.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174488/notre-voie/photo/daelax4rmn1nwq95h9ub.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175420/notre-voie/photo-v2/gimyisqrfirjpoofgzzx.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174490/notre-voie/photo/xd2iprtst5ogshatkb7f.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175422/notre-voie/photo-v2/erxqxiv1wuvavpjfoyxq.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174492/notre-voie/photo/qkolvn1tmdxk4bm03sdd.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175424/notre-voie/photo-v2/r9ecsxrixivsv4taw3i3.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174494/notre-voie/photo/pl77u8lfljb5ppneieif.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175426/notre-voie/photo-v2/fmsqrrv9srmithgw2nlm.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174496/notre-voie/photo/sdkpgaa7yqauftoyh6pg.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175428/notre-voie/photo-v2/wulefnmjkrevkkry2yuu.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174497/notre-voie/photo/ejfghhvqgqjrrukzusbw.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175431/notre-voie/photo-v2/cljr3brfyc2tlevzuahf.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174499/notre-voie/photo/ecdjfzrsv9rhpjdt0aef.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175433/notre-voie/photo-v2/rgp8mflewwnbljpyjlrs.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174501/notre-voie/photo/q0qx8222w2ef5b6lwyux.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175435/notre-voie/photo-v2/p8d3sjs8chebrrndzoiv.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174502/notre-voie/photo/idn8mbakt3c66b3zfjc8.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175437/notre-voie/photo-v2/dzphlybmuemythkzxkp9.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174504/notre-voie/photo/kayokuvghbbghccgmdsw.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175439/notre-voie/photo-v2/xwkpf2lcssiquycofjdi.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174506/notre-voie/photo/q3hisng0twmig8arfysv.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175441/notre-voie/photo-v2/br3dc4vzqgnuzdardgnt.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174508/notre-voie/photo/fuxokdzolnph2r12fjbc.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175444/notre-voie/photo-v2/bswe2usdtuolmw3ft4hz.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174510/notre-voie/photo/mytzxmomqyt2vdpmcxjw.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175446/notre-voie/photo-v2/okzgvv4fcahuxlqu3zrl.jpg" },
    { oldUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787174512/notre-voie/photo/v1zte0s0mksiweaiqvfn.jpg", newUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175448/notre-voie/photo-v2/gusq89xnpxdra2edluet.jpg" },
  ];

  let corriges = 0;
  for (const { oldUrl, newUrl } of remplacements) {
    const media = await prisma.media.findFirst({ where: { url: oldUrl } });
    if (!media) continue;
    await prisma.media.update({ where: { id: media.id }, data: { url: newUrl } });
    if (media.articleId) {
      const article = await prisma.article.findUnique({ where: { id: media.articleId } });
      if (article && article.imageUneUrl === oldUrl) {
        await prisma.article.update({ where: { id: article.id }, data: { imageUneUrl: newUrl } });
      }
    }
    corriges++;
  }
  console.log(`✔ ${corriges} photo(s) réorientée(s) (URL remplacée) sur ${remplacements.length}.`);
}

// Photothèque — second lot, complète les 12 articles du n°7970 (les seuls
// jusque-là sans image, ce qui les rendait invisibles en photo sur
// l'accueil puisque ce sont les plus récents). Une même photo peut illustrer
// deux articles (pasteur Jérémie Koffi / Vérité ou Intox) — dédoublonnage
// sur (url, articleSlug), pas seulement sur l'url.
async function seedMediaBatch7970() {
  const medias = [
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177133/notre-voie/photo-v2/ydy6z4intaheufl8yijb.jpg", legende: "Le prophète David Jérémie a subi une opération chirurgicale en détention, à en croire le procureur de la République.", credit: "DR", articleSlug: "pouvoir-ternit-image-republique-arrestation-pasteur-jeremie-koffi" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177136/notre-voie/photo-v2/xectdgfjxytouwqu2lpa.jpg", legende: "Le secrétaire exécutif du PDCI et les militants mettent le cap sur Korhogo.", credit: "DR", articleSlug: "korhogo-defi-pour-le-pdci-rda" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177138/notre-voie/photo-v2/ik11c8oqjhlez9yftnfv.jpg", legende: "Pour Georges Aka, le scandale des 39 milliards révèle l'urgence d'une refonte de la sécurité numérique de la DGI.", credit: "DR", articleSlug: "faille-cachee-scandale-39-milliards-fraude-dgi" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177140/notre-voie/photo-v2/v4r3qolvugli1853tmk0.jpg", legende: "Selon Dr William Yoboué Kouamé, l'intelligence artificielle peut être un précieux outil au service du journalisme.", credit: "DR", articleSlug: "anp-interpelle-medias-usage-ethique-intelligence-artificielle" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177142/notre-voie/photo-v2/oibcyv8k3qvuuwy8oozq.jpg", legende: "L'édition 2026 de la fête aura une connotation Bhété.", credit: "DR", articleSlug: "fete-de-yorokloi-2026-ouragahio-femme-bhete-celebree" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177144/notre-voie/photo-v2/rjlsmrib3ru77wtsw5yq.jpg", legende: "Le commissaire principal Kounvolo Coulibaly.", credit: "DR", articleSlug: "commissaire-kounvolo-coulibaly-lance-campagne-fppn" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177146/notre-voie/photo-v2/orvf8n9u7l4ypt075zqn.jpg", legende: "Les jeunes ont reçu assez de promesses du gouvernement.", credit: "DR", articleSlug: "jeunes-presentent-priorites-gouvernement-journee-internationale-jeunesse" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177147/notre-voie/photo-v2/nkep87wnm2bsmqxlv2zc.jpg", legende: "Une vue du fleuve Cavally.", credit: "DR", articleSlug: "cinq-morts-chavirement-pirogue-fleuve-cavally-toulepleu" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177149/notre-voie/photo-v2/ohlaekkosqtiiqcyr5vd.jpg", legende: "Une vue des participants au Forum.", credit: "DR", articleSlug: "bouake-jeunesse-18-pays-sous-region-conclave" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177151/notre-voie/photo-v2/xagmdfzfemfjuxwus0ht.jpg", legende: "Idriss Diallo sous pression avant le scrutin.", credit: "DR", articleSlug: "election-fif-clubs-exigent-300-millions-subvention" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177153/notre-voie/photo-v2/xmp8ibbb2gs2acm8ooac.jpg", legende: "Ousmane Diomandé dans les couleurs de son nouveau club.", credit: "DR", articleSlug: "ousmane-diomande-nottingham-forest-osa-540-millions" },
    { url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177133/notre-voie/photo-v2/ydy6z4intaheufl8yijb.jpg", legende: "Le pasteur Jérémie Koffi, alias prophète David Jérémie.", credit: "DR", articleSlug: "une-curieuse-operation-chirurgicale-du-pasteur" },
  ];

  let crees = 0;
  for (const m of medias) {
    const article = await prisma.article.findUnique({ where: { slug: m.articleSlug } });
    if (!article) continue;
    const existant = await prisma.media.findFirst({ where: { url: m.url, articleId: article.id } });
    if (existant) continue;
    await prisma.media.create({ data: { type: 'PHOTO', url: m.url, legende: m.legende, credit: m.credit, articleId: article.id } });
    if (!article.imageUneUrl) {
      await prisma.article.update({ where: { id: article.id }, data: { imageUneUrl: m.url } });
    }
    crees++;
  }
  console.log(`✔ ${crees} photo(s) du n°7970 importée(s) (${medias.length - crees} déjà existante(s)).`);
}

// Rubrique "Test" — article vitrine réunissant tous les formats de contenu
// pris en charge par la plateforme (image légendée, galerie/album photo,
// vidéo, audio), pour démonstration. La vidéo et l'audio sont des fichiers
// de démonstration générés (pas de contenu éditorial réel associé).
async function seedTestShowcase() {
  const testRubrique = await prisma.rubrique.findUniqueOrThrow({ where: { slug: 'test' } });
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });

  const imageUne = "https://res.cloudinary.com/ataat5bs/image/upload/v1787175396/notre-voie/photo-v2/tncsn2jrke3xko1jfmeh.jpg";

  const article = await prisma.article.upsert({
    where: { slug: 'article-vitrine-tous-les-formats' },
    update: {},
    create: {
      slug: 'article-vitrine-tous-les-formats',
      titre: 'Article vitrine : tous les formats de Notre Voie réunis',
      chapo: "Une image principale légendée, un album photo d'un événement, une vidéo intégrée et une version audio — la démonstration de ce que la plateforme sait produire pour un seul et même article.",
      contenuHtml: `<p>Cet article n'est pas une actualité : c'est une démonstration technique, pensée pour présenter en un seul endroit tous les formats de contenu pris en charge par la plateforme Notre Voie.</p>
<p><strong>Image principale légendée</strong> — visible en haut de cette page, avec sa légende et son crédit photographe, exactement comme pour un article éditorial classique.</p>
<p><strong>Galerie photo</strong> — en bas de cet article, une sélection de photos réelles déjà publiées dans d'autres articles, réunies ici pour illustrer le module "album photo d'un événement".</p>
<p><strong>Vidéo et audio</strong> — un fichier de démonstration de chaque type, pour vérifier l'intégration technique (lecteur vidéo, lecteur audio) avant qu'un vrai reportage vidéo ou qu'un vrai journal parlé ne soit produit par la rédaction.</p>
<p>Cette rubrique "Test" n'apparaît pas dans le menu principal du site — elle reste accessible uniquement par lien direct, pour ne pas être confondue avec du contenu éditorial réel.</p>`,
      tags: ['démonstration', 'vitrine'],
      format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
      rubriqueId: testRubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
      imageUneUrl: imageUne, dureeEcouteSec: 90,
      publieLe: new Date(), createdAt: new Date(), updatedAt: new Date(), vuesTotal: 1,
    },
  });

  const medias = [
    { type: 'PHOTO', url: imageUne, legende: "80 lauréats du 13e Prix national d'Excellence, avec le président Alassane Ouattara et son épouse.", credit: 'DR', ordre: 0 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175416/notre-voie/photo-v2/rbfcqlod3busk7vqwzt2.jpg", legende: 'Gaha Carine, reine Awoulaba 2026.', credit: 'DR', ordre: 1 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177142/notre-voie/photo-v2/oibcyv8k3qvuuwy8oozq.jpg", legende: "L'édition 2026 de la fête de Yorokloi, à Ouragahio.", credit: 'DR', ordre: 2 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177149/notre-voie/photo-v2/ohlaekkosqtiiqcyr5vd.jpg", legende: 'Forum sous-régional de la Jeunesse, à Bouaké.', credit: 'DR', ordre: 3 },
    { type: 'VIDEO', url: "https://res.cloudinary.com/ataat5bs/video/upload/v1787188801/notre-voie/video/tewr9l19qvn9hlkoiomx.mp4", legende: 'Vidéo de démonstration — intégration du lecteur vidéo.', credit: 'Notre Voie', dureeSec: 6, ordre: 0 },
    { type: 'AUDIO', url: "https://res.cloudinary.com/ataat5bs/video/upload/v1787188805/notre-voie/audio/nqsc7oe1ydqvvw2iwafk.mp3", legende: 'Audio de démonstration — intégration du lecteur audio.', credit: 'Notre Voie', dureeSec: 8, ordre: 0 },
  ];
  for (const m of medias) {
    const existant = await prisma.media.findFirst({ where: { url: m.url, articleId: article.id } });
    if (existant) continue;
    await prisma.media.create({ data: { ...m, articleId: article.id } });
  }
  console.log('✔ Article vitrine "Test" prêt (galerie + vidéo + audio de démonstration).');
}

// Rubrique de service "Nécrologie" — article d'accueil expliquant comment
// publier un avis (contenu réel repris de l'encart du journal papier).
// Aucune fausse annonce de décès n'est générée : seule la description du
// service, avec les vraies coordonnées publiées par la rédaction.
async function seedNecrologie() {
  const rubrique = await prisma.rubrique.findUniqueOrThrow({ where: { slug: 'necrologie' } });
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });

  // Rubrique de service : contenu commun aux deux rédactions (comme le
  // Kiosque), donc diffusée sur les deux portails plutôt que réservée au
  // Quotidien — d'où le update explicite (et pas seulement le create) pour
  // corriger aussi la ligne déjà en base.
  await prisma.article.upsert({
    where: { slug: 'notre-service-de-necrologie-avis-et-communiques' },
    update: { portails: ['QUOTIDIEN', 'INFO_DIRECT'] },
    create: {
      slug: 'notre-service-de-necrologie-avis-et-communiques',
      titre: 'Notre service de Nécrologie : avis et communiqués',
      chapo: "Publication de communiqués, avis de décès avec photo et messages de remerciement aux familles — Notre Voie vous accompagne.",
      contenuHtml: `<p>Vous souhaitez faire publier un communiqué ou rendre un dernier hommage à un être cher disparu ? Notre Voie vous accompagne :</p>
<ul>
<li>Publication de communiqués de tout genre</li>
<li>Publication d'avis de décès avec photo</li>
<li>Messages de remerciement aux familles</li>
<li>Formats adaptés à votre budget</li>
</ul>
<p>Contactez notre service des annonces au <strong>05 05 99 00 03</strong>, ou rendez-vous directement à nos bureaux, sis à la Riviera Palmeraie, en face de la station Ola Énergie.</p>
<p><em>Honorer leur mémoire, c'est perpétuer leur histoire.</em></p>`,
      tags: ['nécrologie', 'communiqué', 'service'],
      format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
      rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
      imageUneUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787190429/notre-voie/photo-v2/yo11nf5kxkoo9ix5tgqr.jpg",
      portails: ['QUOTIDIEN', 'INFO_DIRECT'],
      publieLe: new Date(), createdAt: new Date(), updatedAt: new Date(), vuesTotal: 1,
    },
  });
  console.log('✔ Rubrique Nécrologie prête.');
}

// Rubrique de service "Photos légendées" — comme la Nécrologie et le
// Kiosque, un service commun aux deux rédactions plutôt qu'un contenu
// éditorial du seul Quotidien. La galerie reprend de vraies photos déjà
// publiées ailleurs sur le site (mêmes légendes, mêmes crédits) : aucune
// image ni légende n'est inventée pour l'occasion.
async function seedPhotosLegendees() {
  const rubrique = await prisma.rubrique.findUniqueOrThrow({ where: { slug: 'photos-legendees' } });
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });

  const imageUne = "https://res.cloudinary.com/ataat5bs/image/upload/v1787175396/notre-voie/photo-v2/tncsn2jrke3xko1jfmeh.jpg";

  const article = await prisma.article.upsert({
    where: { slug: 'photos-legendees-nos-evenements-en-images' },
    update: { portails: ['QUOTIDIEN', 'INFO_DIRECT'] },
    create: {
      slug: 'photos-legendees-nos-evenements-en-images',
      titre: 'Photos légendées : nos événements en images',
      chapo: "Une sélection de photos déjà publiées dans nos articles, réunies ici — chaque image légendée et créditée, comme dans le journal.",
      contenuHtml: `<p>Cette rubrique réunit une sélection de photos de reportage déjà publiées dans nos articles — cérémonies, distinctions, rassemblements — chacune avec sa légende et son crédit d'origine, comme dans le journal papier.</p>`,
      tags: ['photos', 'reportage', 'service'],
      format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
      rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
      imageUneUrl: imageUne,
      portails: ['QUOTIDIEN', 'INFO_DIRECT'],
      publieLe: new Date(), createdAt: new Date(), updatedAt: new Date(), vuesTotal: 1,
    },
  });

  const medias = [
    { type: 'PHOTO', url: imageUne, legende: "80 lauréats du 13e Prix national d'Excellence, avec le président Alassane Ouattara et son épouse.", credit: 'DR', ordre: 0 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787175416/notre-voie/photo-v2/rbfcqlod3busk7vqwzt2.jpg", legende: 'Gaha Carine, reine Awoulaba 2026.', credit: 'DR', ordre: 1 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177142/notre-voie/photo-v2/oibcyv8k3qvuuwy8oozq.jpg", legende: "L'édition 2026 de la fête de Yorokloi, à Ouragahio.", credit: 'DR', ordre: 2 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787177149/notre-voie/photo-v2/ohlaekkosqtiiqcyr5vd.jpg", legende: 'Forum sous-régional de la Jeunesse, à Bouaké.', credit: 'DR', ordre: 3 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192157/notre-voie/photo-v2/ee5zzcdigjjsuv9y9z61.jpg", legende: "Amah Hélène en concert au Palais de la Culture de Treichville.", credit: 'DR', ordre: 4 },
    { type: 'PHOTO', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192159/notre-voie/photo-v2/eosvjkzoc5yfj4wwuwj7.jpg", legende: 'Sonia N\'Guessan, reine Awoulaba Afrique du Moronou.', credit: 'DR', ordre: 5 },
  ];
  for (const m of medias) {
    const existant = await prisma.media.findFirst({ where: { url: m.url, articleId: article.id } });
    if (existant) continue;
    await prisma.media.create({ data: { ...m, articleId: article.id } });
  }
  console.log('✔ Rubrique Photos légendées prête (galerie + deux portails).');
}

// Espace publicitaire — en l'absence de vrai annonceur en régie, un encart
// "maison" fait la promotion de l'abonnement Notre Voie (pratique standard
// de la presse quand un emplacement pub n'est pas vendu), pour que le
// module natif soit visible et testable sur le site public.
async function seedRegieDemo() {
  const dejaCree = await prisma.campagnePub.findFirst({ where: { imageUrl: { contains: 'notre-voie/pub' } } });
  if (dejaCree) return;

  let annonceur = await prisma.annonceur.findFirst({ where: { nom: 'Notre Voie (encart maison)' } });
  if (!annonceur) {
    annonceur = await prisma.annonceur.create({ data: { nom: 'Notre Voie (encart maison)', contact: 'Régie interne' } });
  }

  const dansUnAn = new Date(Date.now() + 365 * 24 * 3600 * 1000);
  await prisma.campagnePub.create({
    data: {
      nom: 'Encart maison — Abonnement',
      formatPub: 'NATIVE_CARTE',
      statut: 'ACTIVE',
      annonceurId: annonceur.id,
      regionsCiblees: [],
      dateDebut: new Date(),
      dateFin: dansUnAn,
      budget: 0,
      titre: "Notre Voie — Chaque jour, l'info vérifiée",
      imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787190269/notre-voie/pub/p2nfdsb6gyforb0gds2t.jpg",
      lienUrl: '/abonnement',
      texteCTA: "S'abonner",
    },
  });
  console.log('✔ Encart publicitaire maison créé (espace pub visible tant qu\'aucun vrai annonceur n\'est en régie).');
}

// Photo manquante ponctuelle — l'article "retour d'Hervé Renard" (n°7965)
// n'avait pas reçu de photo lors du lot précédent.
async function seedMediaGap1() {
  const article = await prisma.article.findUnique({ where: { slug: 'retour-herve-renard-elephants-pari-progression' } });
  if (!article || article.imageUneUrl) return;
  const url = "https://res.cloudinary.com/ataat5bs/image/upload/v1787190154/notre-voie/photo-v2/pjtz5gqbzim0foua8k1c.jpg";
  await prisma.media.create({ data: { type: 'PHOTO', url, legende: "Hervé Renard en conférence de presse.", credit: 'DR', articleId: article.id } });
  await prisma.article.update({ where: { id: article.id }, data: { imageUneUrl: url } });
  console.log('✔ Photo ajoutée pour "retour-herve-renard-elephants-pari-progression".');
}

// Complète les 6 derniers articles sans image. Faute d'avoir pu retracer
// avec certitude leur photo d'origine dans les PDF, ces images sont choisies
// pour leur pertinence thématique (secteur, ambiance, décor) plutôt que
// pour une correspondance exacte avec la scène décrite — à remplacer par la
// rédaction si une photo plus précise est disponible.
async function seedMediaGap2() {
  const remplissages = [
    { slug: 'vrai-tresor-afrique-pas-sous-la-terre-eco-2027', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787191902/notre-voie/photo-v2/wyj5nugyi7hhm332mlru.jpg", legende: "La puissance d'une monnaie dépend de la force de l'économie qui la porte." },
    { slug: 'abondance-petroliere-ne-profite-pas-aux-ivoiriens', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192154/notre-voie/photo-v2/d2conipswybgl8igutt9.jpg", legende: "Infrastructures énergétiques et portuaires à Abidjan (photo d'illustration)." },
    { slug: 'bin-sin-bin-mourir-un-luxe-en-cote-ivoire', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787190429/notre-voie/photo-v2/yo11nf5kxkoo9ix5tgqr.jpg", legende: "Photo d'illustration." },
    { slug: 'amah-helene-enflamme-palais-culture-identite-agni', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192157/notre-voie/photo-v2/ee5zzcdigjjsuv9y9z61.jpg", legende: "Événement culturel (photo d'illustration)." },
    { slug: 'finale-awoulaba-reines-afrique-sonia-nguessan-moronou', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192159/notre-voie/photo-v2/eosvjkzoc5yfj4wwuwj7.jpg", legende: "Photo d'illustration." },
    { slug: 'bangolo-brule-essence-incendie-domicile', url: "https://res.cloudinary.com/ataat5bs/image/upload/v1787192162/notre-voie/photo-v2/ganvdd34ku37dacokewp.jpg", legende: "Vie quotidienne en région (photo d'illustration)." },
  ];
  let crees = 0;
  for (const r of remplissages) {
    const article = await prisma.article.findUnique({ where: { slug: r.slug } });
    if (!article || article.imageUneUrl) continue;
    await prisma.media.create({ data: { type: 'PHOTO', url: r.url, legende: r.legende, credit: 'DR', articleId: article.id } });
    await prisma.article.update({ where: { id: article.id }, data: { imageUneUrl: r.url } });
    crees++;
  }
  console.log(`✔ ${crees} photo(s) de remplissage ajoutée(s) (${remplissages.length - crees} déjà pourvue(s)).`);
}

// Kiosque numérique — les 10 Unes réelles (PDF + couverture) des numéros
// déjà exploités pour le contenu éditorial. Chaque parution devient
// consultable et téléchargeable, jour après jour — cf. demande explicite
// de l'utilisateur (archivage par numéro et par jour de parution).
// Généré depuis l'extraction réelle des PDF (api/prisma/journal-pages/) —
// numéro d'édition, numéro de page, rubrique(s) détectée(s) sur cette page,
// URL Cloudinary de la page. Aucune donnée inventée.
const EDITION_PAGES = {
  7961: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248733/notre-voie/journal-pages/7961-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248736/notre-voie/journal-pages/7961-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248739/notre-voie/journal-pages/7961-p3.jpg" },
    { numeroPage: 4, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248742/notre-voie/journal-pages/7961-p4.jpg" },
    { numeroPage: 5, rubriques: ["economie", "societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248745/notre-voie/journal-pages/7961-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe", "culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248747/notre-voie/journal-pages/7961-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248750/notre-voie/journal-pages/7961-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248754/notre-voie/journal-pages/7961-p8.jpg" },
  ],
  7962: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248757/notre-voie/journal-pages/7962-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248760/notre-voie/journal-pages/7962-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248762/notre-voie/journal-pages/7962-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248765/notre-voie/journal-pages/7962-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248768/notre-voie/journal-pages/7962-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248770/notre-voie/journal-pages/7962-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248774/notre-voie/journal-pages/7962-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248776/notre-voie/journal-pages/7962-p8.jpg" },
  ],
  7963: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248779/notre-voie/journal-pages/7963-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248782/notre-voie/journal-pages/7963-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248784/notre-voie/journal-pages/7963-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248787/notre-voie/journal-pages/7963-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248790/notre-voie/journal-pages/7963-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248793/notre-voie/journal-pages/7963-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248796/notre-voie/journal-pages/7963-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248798/notre-voie/journal-pages/7963-p8.jpg" },
  ],
  7964: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248801/notre-voie/journal-pages/7964-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248804/notre-voie/journal-pages/7964-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248807/notre-voie/journal-pages/7964-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248813/notre-voie/journal-pages/7964-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248815/notre-voie/journal-pages/7964-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248818/notre-voie/journal-pages/7964-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248821/notre-voie/journal-pages/7964-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248824/notre-voie/journal-pages/7964-p8.jpg" },
  ],
  7965: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248827/notre-voie/journal-pages/7965-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248831/notre-voie/journal-pages/7965-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787248834/notre-voie/journal-pages/7965-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249049/notre-voie/journal-pages/7965-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249051/notre-voie/journal-pages/7965-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249054/notre-voie/journal-pages/7965-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249057/notre-voie/journal-pages/7965-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249061/notre-voie/journal-pages/7965-p8.jpg" },
  ],
  7966: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249070/notre-voie/journal-pages/7966-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249075/notre-voie/journal-pages/7966-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249081/notre-voie/journal-pages/7966-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249087/notre-voie/journal-pages/7966-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249107/notre-voie/journal-pages/7966-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249110/notre-voie/journal-pages/7966-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249114/notre-voie/journal-pages/7966-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249134/notre-voie/journal-pages/7966-p8.jpg" },
  ],
  7967: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249137/notre-voie/journal-pages/7967-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249141/notre-voie/journal-pages/7967-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249143/notre-voie/journal-pages/7967-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249146/notre-voie/journal-pages/7967-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249149/notre-voie/journal-pages/7967-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249153/notre-voie/journal-pages/7967-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249157/notre-voie/journal-pages/7967-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249162/notre-voie/journal-pages/7967-p8.jpg" },
  ],
  7968: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249165/notre-voie/journal-pages/7968-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249168/notre-voie/journal-pages/7968-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249170/notre-voie/journal-pages/7968-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249174/notre-voie/journal-pages/7968-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249192/notre-voie/journal-pages/7968-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249195/notre-voie/journal-pages/7968-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249198/notre-voie/journal-pages/7968-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249202/notre-voie/journal-pages/7968-p8.jpg" },
  ],
  7969: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249205/notre-voie/journal-pages/7969-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249218/notre-voie/journal-pages/7969-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249221/notre-voie/journal-pages/7969-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249224/notre-voie/journal-pages/7969-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249228/notre-voie/journal-pages/7969-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249231/notre-voie/journal-pages/7969-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249235/notre-voie/journal-pages/7969-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249239/notre-voie/journal-pages/7969-p8.jpg" },
  ],
  7970: [
    { numeroPage: 1, rubriques: [], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249242/notre-voie/journal-pages/7970-p1.jpg" },
    { numeroPage: 2, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249246/notre-voie/journal-pages/7970-p2.jpg" },
    { numeroPage: 3, rubriques: ["politique"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249249/notre-voie/journal-pages/7970-p3.jpg" },
    { numeroPage: 4, rubriques: ["economie"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249255/notre-voie/journal-pages/7970-p4.jpg" },
    { numeroPage: 5, rubriques: ["culture"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249260/notre-voie/journal-pages/7970-p5.jpg" },
    { numeroPage: 6, rubriques: ["societe"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249266/notre-voie/journal-pages/7970-p6.jpg" },
    { numeroPage: 7, rubriques: ["regions"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249269/notre-voie/journal-pages/7970-p7.jpg" },
    { numeroPage: 8, rubriques: ["sport"], imageUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787249272/notre-voie/journal-pages/7970-p8.jpg" },
  ],
};

// Insère les pages réelles de chaque numéro (image + rubrique détectée sur
// la page elle-même) — idempotent : upsert par (editionId, numeroPage).
async function seedEditionPages() {
  let inserees = 0;
  for (const [numeroStr, pages] of Object.entries(EDITION_PAGES)) {
    const numero = Number(numeroStr);
    const edition = await prisma.edition.findUnique({ where: { numero } });
    if (!edition) continue;
    for (const p of pages) {
      const existant = await prisma.editionPage.findUnique({
        where: { editionId_numeroPage: { editionId: edition.id, numeroPage: p.numeroPage } },
      });
      if (existant) continue;
      await prisma.editionPage.create({
        data: { editionId: edition.id, numeroPage: p.numeroPage, rubriques: p.rubriques, imageUrl: p.imageUrl },
      });
      inserees++;
    }
  }
  console.log(`✔ ${inserees} page(s) de journal insérée(s).`);
}

// Code d'accès de démonstration pour le numéro 7970 — à communiquer aux
// abonnés (SMS, email…) ou à changer depuis le CMS Rédaction (Kiosque /
// Éditions) à tout moment ; ce seed ne fait que l'amorcer une première fois
// (idempotent, ne touche pas à un code déjà défini par la rédaction).
async function seedCodeAccesDemo() {
  const edition = await prisma.edition.findUnique({ where: { numero: 7970 } });
  if (!edition || edition.codeAcces) return;
  await prisma.edition.update({ where: { id: edition.id }, data: { codeAcces: 'NV7970-DEMO' } });
  console.log('✔ Code d\'accès NV7970-DEMO défini pour le n°7970.');
}

async function seedEditions() {
  const editions = [
    { numero: 7961, dateParution: "2026-07-30", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194110/notre-voie/edition/nv5erwj7eoplvj4f7i5q.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194106/notre-voie/une/elo8nuazwzz1vboa9oma.jpg" },
    { numero: 7962, dateParution: "2026-08-02", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194134/notre-voie/edition/bgiv3jjdh52xrtgsxvly.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194116/notre-voie/une/ayoxfemzpk5zzr3j9v61.jpg" },
    { numero: 7963, dateParution: "2026-08-03", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194145/notre-voie/edition/ydxvowlmmlu3khqyywai.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194142/notre-voie/une/fbowe4pxmh89zfmstizk.jpg" },
    { numero: 7964, dateParution: "2026-08-04", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194156/notre-voie/edition/zwajzjdktdf7tdnekou0.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194152/notre-voie/une/u1sgqhh2iluhnvkvrlfu.jpg" },
    { numero: 7965, dateParution: "2026-08-05", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194183/notre-voie/edition/lfxr5dvcozufmreyajnp.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194180/notre-voie/une/slfbemm2o4wqfbrvpf0g.jpg" },
    { numero: 7966, dateParution: "2026-08-09", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194205/notre-voie/edition/oh05g5ivqyb3ymxpxxu1.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194189/notre-voie/une/lz6sev48w7dzammn19a5.jpg" },
    { numero: 7967, dateParution: "2026-08-10", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194230/notre-voie/edition/zdlvjayaluxvvslxl1pk.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194226/notre-voie/une/hypvqkegvqltbzhdsg2h.jpg" },
    { numero: 7968, dateParution: "2026-08-11", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194252/notre-voie/edition/fvcoevdjb0p7yqoeedun.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194248/notre-voie/une/syaogsrh5tpfrkcifb4l.jpg" },
    { numero: 7969, dateParution: "2026-08-12", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194273/notre-voie/edition/pflgks5n2g8prebaqpwo.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194258/notre-voie/une/vvlasul5jauvrzzzfbn8.jpg" },
    { numero: 7970, dateParution: "2026-08-13", pdfUrl: "https://res.cloudinary.com/ataat5bs/raw/upload/v1787194281/notre-voie/edition/b1tqrmwkyfoogt6l4cra.pdf", couvertureUrl: "https://res.cloudinary.com/ataat5bs/image/upload/v1787194278/notre-voie/une/d6hdl8ejmd9fgmjlhplf.jpg" },
  ];
  let crees = 0;
  for (const e of editions) {
    const existant = await prisma.edition.findUnique({ where: { numero: e.numero } });
    if (existant) continue;
    await prisma.edition.create({ data: { ...e, dateParution: new Date(e.dateParution) } });
    crees++;
  }
  console.log(`✔ ${crees} édition(s) ajoutée(s) au kiosque (${editions.length - crees} déjà présente(s)).`);
}

// Correctif — les articles avaient été publiés avec une date relative au
// moment du seed ("il y a Xh"), sans rapport avec la vraie date de
// parution du numéro papier dont ils sont issus. Résultat : la recherche
// par jour et les liens "Voir les articles du jour" depuis le Kiosque ne
// retrouvaient rien. Ici, chaque article est aligné sur la date réelle de
// son numéro d'origine — idempotent (peut être rejoué sans risque, fixe
// toujours la même date absolue).
async function fixArticleDates() {
  const dates = [
    { slug: "pouvoir-ternit-image-republique-arrestation-pasteur-jeremie-koffi", date: "2026-08-13" },
    { slug: "une-curieuse-operation-chirurgicale-du-pasteur", date: "2026-08-13" },
    { slug: "korhogo-defi-pour-le-pdci-rda", date: "2026-08-13" },
    { slug: "faille-cachee-scandale-39-milliards-fraude-dgi", date: "2026-08-13" },
    { slug: "anp-interpelle-medias-usage-ethique-intelligence-artificielle", date: "2026-08-13" },
    { slug: "fete-de-yorokloi-2026-ouragahio-femme-bhete-celebree", date: "2026-08-13" },
    { slug: "commissaire-kounvolo-coulibaly-lance-campagne-fppn", date: "2026-08-13" },
    { slug: "jeunes-presentent-priorites-gouvernement-journee-internationale-jeunesse", date: "2026-08-13" },
    { slug: "cinq-morts-chavirement-pirogue-fleuve-cavally-toulepleu", date: "2026-08-13" },
    { slug: "bouake-jeunesse-18-pays-sous-region-conclave", date: "2026-08-13" },
    { slug: "election-fif-clubs-exigent-300-millions-subvention", date: "2026-08-13" },
    { slug: "ousmane-diomande-nottingham-forest-osa-540-millions", date: "2026-08-13" },
    { slug: "cote-ivoire-demene-sortir-guepier-blanchiment-capitaux", date: "2026-07-30" },
    { slug: "accord-cote-ivoire-botswana-or-africain-richesse-durable", date: "2026-07-30" },
    { slug: "incendie-orphelinat-mamie-therese-gouvernement-prise-en-charge", date: "2026-07-30" },
    { slug: "fifa-bute-uefa-concacaf-vente-parts-coupe-du-monde", date: "2026-07-30" },
    { slug: "bedie-le-sphinx-de-daoukro-il-y-a-trois-ans", date: "2026-08-02" },
    { slug: "emerse-fae-vire-fif-je-suis-decu-oui", date: "2026-08-02" },
    { slug: "13e-prix-national-excellence-80-laureats-primes", date: "2026-08-03" },
    { slug: "marie-laure-ngoran-sacree-lauréate-prix-excellence-medias", date: "2026-08-03" },
    { slug: "qui-etait-franco-baresi-mort-31-juillet-2026", date: "2026-08-03" },
    { slug: "assemblee-nationale-deputes-95-pourcent-electeurs-non-choisis", date: "2026-08-04" },
    { slug: "cherte-carburant-loyer-vivres-transport-pouvoir-achat-souffrance", date: "2026-08-04" },
    { slug: "ecole-catholique-ecrase-moyennes-nationales-examens-2026", date: "2026-08-04" },
    { slug: "bouna-deux-allogenes-condamnes-20-ans-tentative-meurtre", date: "2026-08-04" },
    { slug: "herve-renard-retrouve-les-elephants", date: "2026-08-04" },
    { slug: "affi-nguessan-souverainete-veritable-institutions-fortes", date: "2026-08-05" },
    { slug: "cacao-ivoirien-or-brun-epreuve-records", date: "2026-08-05" },
    { slug: "gaha-carine-reine-guemon-finale-awoulaba-2026", date: "2026-08-05" },
    { slug: "dabou-planteur-retrouve-mort-plantation-cosrou", date: "2026-08-05" },
    { slug: "discours-nation-ouattara-promesses-epreuve-faits", date: "2026-08-09" },
    { slug: "exportation-or-monte-puissance-face-cacao", date: "2026-08-09" },
    { slug: "president-gabonais-experience-ivoirienne-relogement", date: "2026-08-09" },
    { slug: "alepe-kossandji-six-morts-violences-conflit-foncier", date: "2026-08-09" },
    { slug: "hausse-carburant-gouvernement-impuissant-lache-ivoiriens", date: "2026-08-10" },
    { slug: "grace-presidentielle-clemence-ouattara-portes-politique", date: "2026-08-10" },
    { slug: "litige-foncier-modeste-procureur-suspend-decision-grand-bassam", date: "2026-08-10" },
    { slug: "ouattara-yopougon-prisonniers-opinion-vie-chere-orpaillage", date: "2026-08-11" },
    { slug: "bictogo-brigade-salubrite-yopougon", date: "2026-08-11" },
    { slug: "daloa-38-millions-voles-caches-puits", date: "2026-08-11" },
    { slug: "affi-nguessan-gouvernement-complice-orpaillage", date: "2026-08-12" },
    { slug: "financement-medias-gouvernement-capter-recettes-publicitaires", date: "2026-08-12" },
    { slug: "derives-mercantiles-certains-pretres", date: "2026-08-12" },
    { slug: "yan-diomande-real-madrid-impossible-dire-non", date: "2026-08-12" },
    { slug: "vrai-tresor-afrique-pas-sous-la-terre-eco-2027", date: "2026-07-30" },
    { slug: "abondance-petroliere-ne-profite-pas-aux-ivoiriens", date: "2026-07-30" },
    { slug: "bin-sin-bin-mourir-un-luxe-en-cote-ivoire", date: "2026-08-02" },
    { slug: "finale-awoulaba-reines-afrique-sonia-nguessan-moronou", date: "2026-08-03" },
    { slug: "amah-helene-enflamme-palais-culture-identite-agni", date: "2026-08-04" },
    { slug: "bangolo-brule-essence-incendie-domicile", date: "2026-07-30" },
    { slug: "retour-herve-renard-elephants-pari-progression", date: "2026-08-05" },
  ];

  let index = 0;
  let corriges = 0;
  for (const d of dates) {
    // Étalé sur la journée (8h + 20 min par article de la même date) pour un
    // ordre de lecture réaliste plutôt qu'un empilement à minuit pile.
    const heureMinutes = 8 * 60 + (index % 30) * 20;
    const publieLe = new Date(`${d.date}T00:00:00.000Z`);
    publieLe.setUTCMinutes(publieLe.getUTCMinutes() + heureMinutes);
    index++;

    const article = await prisma.article.findUnique({ where: { slug: d.slug } });
    if (!article) continue;
    await prisma.article.update({
      where: { id: article.id },
      data: { publieLe, createdAt: publieLe, updatedAt: publieLe },
    });
    corriges++;
  }
  console.log(`✔ ${corriges} article(s) réaligné(s) sur la vraie date de leur numéro d'origine.`);
}

// Contenu propre au portail "Info en direct" — deux rédactions distinctes
// (cf. §"deux rédactions" du cahier des charges) : Le Quotidien reprend tel
// quel le contenu du journal papier, tandis qu'Info en direct est animé au
// quotidien par la rédaction web, dans un style éditorial différent — plus
// condensé, factuel en tête de texte, pensé pour la lecture rapide en
// mobilité. Chaque article ci-dessous est une réécriture, dans ce style,
// d'un fait déjà vérifié et publié ailleurs sur Notre Voie (aucun fait
// nouveau n'est inventé) : seule la forme change, pas le fond.
async function seedInfoDirectFlashs() {
  const [politique, refondation, economie, societe, regions, culture, sport, verite] = await Promise.all([
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'politique' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'refondation' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'economie' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'societe' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'regions' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'culture' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'sport' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'verite-ou-intox' } }),
  ]);
  const [redacteurEnChef, secretaireGeneral, chefPolitique, chefCulture, redacteurSport] = await Promise.all([
    prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } }),
    prisma.staff.findUniqueOrThrow({ where: { email: 'secretaire-general@notrevoienews.com' } }),
    prisma.staff.findUniqueOrThrow({ where: { email: 'chef-politique@notrevoienews.com' } }),
    prisma.staff.findUniqueOrThrow({ where: { email: 'chef-culture@notrevoienews.com' } }),
    prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur@notrevoienews.com' } }),
  ]);

  const items = [
    {
      slug: 'flash-carburant-hausse-3-5-pourcent-subvention-200-milliards',
      titre: 'Carburant : +3,5 % à la pompe, l\'État absorbe plus de 200 milliards de subvention',
      chapo: "Le porte-parole du Gouvernement l'a confirmé au sortir du Conseil des ministres : la hausse est contrainte, entre crise au Moyen-Orient et engagements pris avec le FMI.",
      contenuHtml: `<p><strong>L'essentiel</strong> — Le prix du carburant augmente d'environ 3,5 % à la pompe. Coût pour l'État : plus de 200 milliards de FCFA de subvention.</p>
<ul>
<li>Cause invoquée : la crise au Moyen-Orient, qui renchérit le transport du gaz et du pétrole.</li>
<li>Le Gouvernement dit vouloir « contenir le déficit dans les limites convenues avec le FMI ».</li>
<li>Réaction attendue dans les prochains jours des syndicats de transporteurs.</li>
</ul>
<p>Ce que Notre Voie suit pour vous : l'impact sur les prix du transport en commun, premier poste de dépense touché en général dans les 72 heures suivant une hausse.</p>`,
      tags: ['carburant', 'FMI', 'pouvoir d\'achat'],
      format: 'FLASH', rubriqueId: politique.id, auteurId: chefPolitique.id,
    },
    {
      slug: 'flash-gafi-liste-grise-pole-penal-economique-financier',
      titre: 'Blanchiment de capitaux : la Côte d\'Ivoire maintenue sur la liste grise du GAFI',
      chapo: "Verdict tombé lors de la session de juin 2026 à Paris : l'Algérie et la Namibie sortent, pas Abidjan. Le pays mise sur une mission d'évaluateurs en septembre pour convaincre en octobre.",
      contenuHtml: `<p><strong>L'essentiel</strong> — La Côte d'Ivoire reste sur la liste grise du GAFI et sur la liste noire de l'UE en matière de blanchiment de capitaux et de financement du terrorisme.</p>
<ul>
<li>Prochaine étape : une mission d'évaluateurs du GAFI attendue en Côte d'Ivoire en septembre 2026.</li>
<li>Décision de retrait espérée à la plénière d'octobre 2026, si la mission confirme les progrès.</li>
<li>Le nouveau Pôle pénal économique et financier vient de s'installer à Cocody 2 Plateaux.</li>
</ul>
<p>Point de vigilance : jusqu'ici, les procédures ouvertes concernent essentiellement de « petits calibres » — aucune personnalité politique ou haut fonctionnaire n'a encore été poursuivi.</p>`,
      tags: ['GAFI', 'blanchiment de capitaux', 'justice'],
      format: 'FLASH', rubriqueId: refondation.id, auteurId: redacteurEnChef.id,
    },
    {
      slug: 'flash-cacao-2800-a-1200-fcfa-effondrement-cours-mondiaux',
      titre: 'Cacao : du record de 2 800 FCFA/kg à la chute des cours en cinq mois',
      chapo: "Le prix bord champ a été divisé par plus de deux entre octobre 2025 et mars 2026. L'État a arbitré à la hausse un prix intermédiaire de 1 200 FCFA/kg, au prix d'une subvention de plus de 231 milliards de FCFA.",
      contenuHtml: `<p><strong>Les chiffres</strong></p>
<ul>
<li>2 800 FCFA/kg : prix bord champ record atteint le 1er octobre 2025.</li>
<li>-70 % : chute des cours mondiaux dès décembre 2025.</li>
<li>1 200 FCFA/kg : prix intermédiaire arbitré par le chef de l'État, annoncé le 4 mars 2026.</li>
<li>231 milliards FCFA : coût de la subvention publique associée.</li>
<li>Plus de 2 millions de tonnes : récolte finalement enregistrée, un record malgré la crise des prix.</li>
</ul>
<p>À surveiller d'ici septembre 2026 : l'entrée en vigueur obligatoire de la carte du producteur et du Système national de traçabilité, exigés par le règlement européen sur la déforestation (EUDR).</p>`,
      tags: ['cacao', 'agriculture', 'prix bord champ'],
      format: 'FLASH', rubriqueId: economie.id, auteurId: secretaireGeneral.id,
    },
    {
      slug: 'flash-catholique-98-pourcent-reussite-cepe-2026',
      titre: 'Examens 2026 : l\'école catholique creuse l\'écart avec la moyenne nationale',
      chapo: "98,18 % de réussite au CEPE contre 85,76 % au niveau national ; 88,74 % au BEPC contre 52,17 %. Le réseau catholique compte 521 établissements et plus de 143 000 élèves.",
      contenuHtml: `<p><strong>Les résultats, rubrique par rubrique</strong></p>
<ul>
<li>CEPE : 98,18 % (catholique) contre 85,76 % (national) — écart de 12,4 points.</li>
<li>BEPC : 88,74 % contre 52,17 % — écart de 36,6 points.</li>
<li>Baccalauréat : 67,89 % contre 40,60 % — écart de 27,3 points.</li>
</ul>
<p>« Ces écarts traduisent l'efficacité de notre accompagnement des élèves jusqu'au terme du cycle secondaire », commente le père Félicien Guessé, secrétaire exécutif national de l'Éducation catholique. Le réseau revendique des ratios favorables : 29 élèves par enseignant au préscolaire, 40 au primaire, 27 au secondaire.</p>`,
      tags: ['éducation catholique', 'examens', 'résultats scolaires'],
      format: 'FLASH', rubriqueId: societe.id, auteurId: secretaireGeneral.id,
    },
    {
      slug: 'flash-jeunesse-trois-priorites-drogues-reseaux-sociaux-ia',
      titre: 'Consultations nationales de la jeunesse : trois priorités remontent au Gouvernement',
      chapo: "Drogues, usage responsable des réseaux sociaux, intelligence artificielle : voici ce que les jeunes ont mis sur la table lors de la 2e édition des consultations nationales, au Parc des expositions d'Abidjan.",
      contenuHtml: `<p><strong>Ce qu'il faut retenir</strong></p>
<ul>
<li>3 priorités portées par les jeunes : lutte contre les drogues, réseaux sociaux, intelligence artificielle.</li>
<li>86 % des préoccupations exprimées en 2025 auraient déjà été prises en compte, selon le CNJ-CI.</li>
<li>Le Premier ministre Robert Beugré Mambé promet une méthode « écouter, agir, rendre compte, vérifier ».</li>
</ul>
<p>Instruction donnée : le ministre chargé de la Jeunesse doit garantir la transparence dans la mise en œuvre du Fonds d'appui aux organisations de jeunesse.</p>`,
      tags: ['jeunesse', 'gouvernement', 'consultations nationales'],
      format: 'FLASH', rubriqueId: societe.id, auteurId: chefPolitique.id,
    },
    {
      slug: 'flash-toulepleu-cinq-morts-naufrage-pirogue-cavally',
      titre: 'Toulépleu : cinq morts noyés en traversant le fleuve Cavally',
      chapo: "Une mère et ses trois enfants figurent parmi les victimes. La pirogue a chaviré sur une distance de moins de 100 mètres, entre Pantroya et Grié 2.",
      contenuHtml: `<p><strong>Les faits</strong> — Six passagers et un piroguier traversaient le fleuve Cavally entre Pantroya et Grié 2 (sous-préfecture de Bakoubly, département de Toulépleu) quand l'embarcation a chaviré. Le piroguier et deux passagers ont regagné la rive ; cinq personnes, dont une mère et ses trois enfants, sont mortes noyées.</p>
<p>Les corps ont été inhumés au bord du fleuve, avec l'autorisation des services compétents. La gendarmerie a ouvert une enquête pour établir les circonstances exactes du drame.</p>`,
      tags: ['fait divers', 'Toulépleu', 'fleuve Cavally'],
      format: 'FLASH', rubriqueId: regions.id, auteurId: chefPolitique.id,
    },
    {
      slug: 'flash-alepe-kossandji-six-morts-conflit-foncier',
      titre: 'Alépé : six morts dans un conflit foncier qui dégénère à Kossandji',
      chapo: "Un différend autour d'une parcelle a viré aux violences intercommunautaires. Le président de l'Assemblée nationale a appelé à la retenue.",
      contenuHtml: `<p><strong>Chronologie</strong></p>
<ul>
<li>4 août : destruction de plants de manioc, une femme blessée lors d'une altercation.</li>
<li>Nuit suivante : attaque armée du village de Kossandji (67 km d'Alépé) — 6 morts, magasins et boutiques détruits.</li>
<li>De nombreux habitants fuient vers un poste des Eaux et Forêts ou des localités voisines.</li>
</ul>
<p>Le président de l'Assemblée nationale, Patrick Achi, et le député de la circonscription ont présenté leurs condoléances et appelé à la préservation de la cohésion sociale. Une enquête est en cours pour établir les responsabilités.</p>`,
      tags: ['Alépé', 'Kossandji', 'conflit foncier'],
      format: 'FLASH', rubriqueId: regions.id, auteurId: chefPolitique.id,
    },
    {
      slug: 'flash-amah-helene-palais-culture-treichville-4000-places',
      titre: 'Amah Hélène fait salle comble au Palais de la Culture de Treichville',
      chapo: "4 000 places archicombles pour la diva de la musique tradi-moderne agni, portée par des délégations venues de tout le Moronou.",
      contenuHtml: `<p>La communauté agni s'est massivement déplacée pour ce concert événement : salle pleine durant plusieurs heures, public reprenant en chœur la plupart des chansons.</p>
<p>Au-delà du spectacle, la soirée a été vécue comme une célébration de l'identité culturelle agni — nouvelle démonstration que la valorisation des musiques locales reste un puissant facteur de cohésion.</p>`,
      tags: ['musique agni', 'concert', 'Moronou'],
      format: 'FLASH', rubriqueId: culture.id, auteurId: chefCulture.id,
    },
    {
      slug: 'flash-diomande-nottingham-forest-540-millions-osa',
      titre: 'Ousmane Diomandé file à Nottingham Forest, l\'OSA empoche environ 540 millions FCFA',
      chapo: "Le défenseur international quitte le Sporting CP pour 40 millions d'euros. Son club formateur d'Abidjan touche un bonus de solidarité FIFA estimé à 524 millions FCFA.",
      contenuHtml: `<p><strong>Le transfert</strong></p>
<ul>
<li>Ousmane Diomandé (22 ans, 16 sélections), Sporting CP → Nottingham Forest, contrat jusqu'en 2030.</li>
<li>Montant : 40 millions d'euros.</li>
<li>Retrouvailles en club avec Ibrahim Sangaré, son coéquipier en sélection.</li>
</ul>
<p>Côté ivoirien : l'OSA (Olympique Sport d'Abobo), club formateur, percevrait environ 524 millions FCFA au titre du mécanisme de solidarité FIFA ; Sol FC, son club juste avant l'exil, environ 131 millions FCFA.</p>`,
      tags: ['football', 'transfert', 'Nottingham Forest'],
      format: 'FLASH', rubriqueId: sport.id, auteurId: redacteurSport.id,
    },
    {
      slug: 'flash-fif-clubs-300-millions-avant-de-voter',
      titre: 'Élection à la FIF : des clubs réclament 300 millions FCFA de subvention avant de voter',
      chapo: "Un bras de fer financier s'installe en coulisses à l'approche du scrutin fédéral, entre clubs et candidats à la présidence.",
      contenuHtml: `<p>À quelques semaines de l'élection à la tête de la Fédération ivoirienne de football, plusieurs clubs conditionnent leur soutien à une subvention annuelle de 300 millions FCFA. Les tractations se poursuivent en coulisses, chaque camp cherchant à sécuriser les voix nécessaires.</p>
<p>Notre Voie suit les prises de position des différents candidats sur ce dossier, qui pourrait peser lourd dans l'issue du scrutin.</p>`,
      tags: ['FIF', 'football', 'élection'],
      format: 'FLASH', rubriqueId: sport.id, auteurId: redacteurSport.id,
    },
    {
      slug: 'flash-verif-pasteur-jeremie-koffi-rumeur-deces',
      titre: 'Vérité ou Intox : non, le pasteur Jérémie Koffi n\'est pas mort',
      chapo: "Une rumeur de décès a enflammé les réseaux sociaux après son arrestation. Notre Voie a vérifié : elle est fausse.",
      contenuHtml: `<p><strong>La rumeur</strong> — Des publications virales ont affirmé que le pasteur Jérémie Koffi, arrêté dans un contexte de violence, serait mort en détention.</p>
<p><strong>Les faits vérifiés</strong> — Cette information est fausse. Aucune source officielle ni aucun proche n'a confirmé un quelconque décès ; l'arrestation elle-même reste, elle, un fait établi et suivi par la rédaction.</p>
<p>Notre Voie rappelle l'importance de vérifier une information avant de la partager, en particulier lorsqu'elle concerne un décès.</p>`,
      tags: ['vérité ou intox', 'fact-check', 'réseaux sociaux'],
      format: 'FLASH', rubriqueId: verite.id, auteurId: redacteurEnChef.id,
    },
  ];

  let crees = 0;
  for (const item of items) {
    const existe = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existe) continue;
    const maintenant = new Date();
    await prisma.article.create({
      data: {
        slug: item.slug, titre: item.titre, chapo: item.chapo, contenuHtml: item.contenuHtml,
        tags: item.tags, format: item.format, statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: item.rubriqueId, auteurId: item.auteurId, valideParId: redacteurEnChef.id,
        portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} article(s) "Info en direct" créé(s) (portail INFO_DIRECT).`);
}

// Illustration des articles "Info en direct" — chaque flash étant la
// réécriture condensée d'un fait déjà couvert (et déjà illustré) côté
// Quotidien, on réutilise la vraie photo de l'événement plutôt que d'en
// générer une nouvelle : même fait, même image, deux formats d'écriture.
async function seedInfoDirectImages() {
  const mapping = {
    'flash-carburant-hausse-3-5-pourcent-subvention-200-milliards':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787175428/notre-voie/photo-v2/wulefnmjkrevkkry2yuu.jpg',
    'flash-gafi-liste-grise-pole-penal-economique-financier':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787175376/notre-voie/photo-v2/dwsbiacxnelx2b99wmuv.jpg',
    'flash-cacao-2800-a-1200-fcfa-effondrement-cours-mondiaux':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787175413/notre-voie/photo-v2/gijgjidchndsjvktfkat.jpg',
    'flash-catholique-98-pourcent-reussite-cepe-2026':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787175404/notre-voie/photo-v2/b45oinabwnzizgjj7if0.jpg',
    'flash-jeunesse-trois-priorites-drogues-reseaux-sociaux-ia':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787177146/notre-voie/photo-v2/orvf8n9u7l4ypt075zqn.jpg',
    'flash-toulepleu-cinq-morts-naufrage-pirogue-cavally':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787177147/notre-voie/photo-v2/nkep87wnm2bsmqxlv2zc.jpg',
    'flash-alepe-kossandji-six-morts-conflit-foncier':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787175426/notre-voie/photo-v2/fmsqrrv9srmithgw2nlm.jpg',
    'flash-amah-helene-palais-culture-treichville-4000-places':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787192157/notre-voie/photo-v2/ee5zzcdigjjsuv9y9z61.jpg',
    'flash-diomande-nottingham-forest-540-millions-osa':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787177153/notre-voie/photo-v2/xmp8ibbb2gs2acm8ooac.jpg',
    'flash-fif-clubs-300-millions-avant-de-voter':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787177151/notre-voie/photo-v2/xagmdfzfemfjuxwus0ht.jpg',
    'flash-verif-pasteur-jeremie-koffi-rumeur-deces':
      'https://res.cloudinary.com/ataat5bs/image/upload/v1787177133/notre-voie/photo-v2/ydy6z4intaheufl8yijb.jpg',
  };

  let illustres = 0;
  for (const [slug, imageUneUrl] of Object.entries(mapping)) {
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article || article.imageUneUrl) continue;
    await prisma.article.update({ where: { slug }, data: { imageUneUrl } });
    illustres++;
  }
  console.log(`✔ ${illustres} article(s) "Info en direct" illustré(s).`);
}

// Lot de PRÉVISUALISATION INTERNE, à la demande explicite de l'utilisateur —
// pour tester la disposition réelle des nouvelles rubriques avant validation
// par les responsables de la Refondation. Texte de base issu d'une
// proposition Gemini soumise par l'utilisateur (sujets plausibles, style
// générique, pas de citation attribuée à une personne réelle nommée) ;
// photos réelles de l'utilisateur (Gragbalilié, événement communautaire),
// réutilisées comme illustration même hors-contexte, avec son accord
// explicite. Repérable et supprimable via le tag "apercu-interne".
// Exclu volontairement : le lot Deepseek (trop de faits institutionnels
// précis inventés) et toute nécrologie fictive (jamais, sous aucun prétexte).
async function seedApercuInterne() {
  const [education, sante, environnement, numerique] = await Promise.all([
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'education' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'sante' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'environnement' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'numerique' } }),
  ]);
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });

  const PHOTOS = {
    action: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572373/notre-voie/preview-gragbalilie/1-action.jpg',
    accueil: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572377/notre-voie/preview-gragbalilie/2-accueil.jpg',
    huddle: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572381/notre-voie/preview-gragbalilie/3-huddle.jpg',
    doyenne: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572385/notre-voie/preview-gragbalilie/4-doyenne.jpg',
    riviere: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572389/notre-voie/preview-gragbalilie/5-riviere.jpg',
    chateauEau: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787572393/notre-voie/preview-gragbalilie/6-chateau-eau.jpg',
  };

  const items = [
    {
      slug: 'apercu-rentree-scolaire-2026-2027-mesures-lycees',
      titre: "Rentrée scolaire 2026-2027 : de nouvelles mesures pour désengorger les lycées publics",
      chapo: "À l'approche de la nouvelle année scolaire, le ministère de l'Éducation nationale a dévoilé un train de réformes visant à améliorer les conditions d'apprentissage et à réduire les effectifs pléthoriques dans les grandes villes.",
      contenuHtml: `<p>Abidjan, Bouaké, San-Pédro… Les grands centres urbains font face chaque année au même défi : l'afflux massif d'élèves dans les établissements secondaires publics. Pour y remédier, les autorités ont confirmé la mise en service de dix nouveaux collèges de proximité dès ce mois de septembre.</p>
<p>Par ailleurs, la plateforme d'orientation en ligne est optimisée pour éviter les tracasseries administratives aux parents d'élèves. Les syndicats d'enseignants saluent ces avancées tout en appelant à un suivi rigoureux de la dotation en kits scolaires.</p>`,
      rubriqueId: education.id, imageUneUrl: PHOTOS.huddle,
    },
    {
      slug: 'apercu-campagne-vaccination-paludisme-zones-rurales',
      titre: "Campagne nationale : lutte renforcée contre le paludisme dans les zones rurales",
      chapo: "Une vaste opération de sensibilisation et de distribution de moustiquaires imprégnées a débuté ce week-end dans le Grand Nord, avec l'implication des agents de santé communautaires.",
      contenuHtml: `<p>Le paludisme demeure l'un des premiers motifs de consultation médicale dans les centres de santé de première catégorie. Pour inverser la tendance, le Programme national de lutte contre le paludisme déploie une stratégie de proximité ciblée sur les mères et les jeunes enfants.</p>
<p>Dans les villages visités, des équipes mobiles procèdent à des dépistages gratuits et distribuent des traitements préventifs. Les autorités sanitaires rappellent que la salubrité autour des habitations et l'utilisation systématique des moustiquaires restent les barrières les plus efficaces contre la transmission du parasite.</p>`,
      rubriqueId: sante.id, imageUneUrl: PHOTOS.doyenne,
    },
    {
      slug: 'apercu-abidjan-gestion-dechets-plastiques',
      titre: "Abidjan : vers une gestion plus intelligente des déchets plastiques",
      chapo: "Entre initiatives citoyennes et innovations, les municipalités tentent de transformer le problème des sachets plastiques en opportunité économique pour la jeunesse.",
      contenuHtml: `<p>Se promener dans certains quartiers d'Abidjan après une forte pluie rappelle l'urgence de la question environnementale. Face à l'accumulation des déchets plastiques, de jeunes entrepreneurs ivoiriens développent des solutions de collecte sélective et de recyclage en pavés autobloquants ou en mobilier urbain.</p>
<p>Des campagnes de ramassage citoyen sont programmées le dernier samedi de chaque mois pour encourager un changement durable des comportements.</p>`,
      rubriqueId: environnement.id, imageUneUrl: PHOTOS.chateauEau,
    },
    {
      slug: 'apercu-startups-ia-agriculture-locale',
      titre: "Startups ivoiriennes : quand l'intelligence artificielle s'invite dans l'agriculture locale",
      chapo: "De jeunes ingénieurs d'Abidjan conçoivent des applications mobiles et des capteurs connectés pour aider les producteurs de cacao et d'anacarde à optimiser leurs rendements.",
      contenuHtml: `<p>L'innovation technologique n'est plus l'exclusivité des grandes métropoles occidentales. En Côte d'Ivoire, l'écosystème tech s'empare des défis du secteur agricole. Grâce à des outils de vision par ordinateur et des algorithmes d'analyse météo, des plateformes locales permettent désormais aux agriculteurs de détecter les maladies des cultures avant qu'elles ne ravagent les plantations.</p>
<p>Cette transition numérique, couplée au développement de la formation aux métiers du code, positionne le pays comme l'un des hubs technologiques d'Afrique de l'Ouest.</p>`,
      rubriqueId: numerique.id, imageUneUrl: PHOTOS.accueil,
    },
  ];

  let crees = 0;
  for (const item of items) {
    const existe = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existe) continue;
    const maintenant = new Date();
    await prisma.article.create({
      data: {
        slug: item.slug, titre: item.titre, chapo: item.chapo, contenuHtml: item.contenuHtml,
        tags: ['apercu-interne'], format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: item.rubriqueId, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: item.imageUneUrl, portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    crees++;
  }

  // Galerie "Rétro Photo" — pour tester le module photothèque/album, avec de
  // vraies légendes décrivant réellement ce que montrent les photos (un
  // événement communautaire à Gragbalilié), même si elles illustrent ici une
  // rubrique différente de leur contenu réel.
  const galerieSlug = 'apercu-retro-photo-semaine';
  let galerie = await prisma.article.findUnique({ where: { slug: galerieSlug } });
  if (!galerie) {
    const maintenant = new Date();
    galerie = await prisma.article.create({
      data: {
        slug: galerieSlug,
        titre: "Rétro Photo : la semaine en images",
        chapo: "Plongée en images dans un événement communautaire — ici, un rassemblement villageois à Gragbalilié.",
        contenuHtml: `<p>Cette rubrique réunit chaque semaine une sélection de photos de reportage. Aperçu de test : rassemblement communautaire à Gragbalilié, 21-23 août 2026.</p>`,
        tags: ['apercu-interne'], format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: (await prisma.rubrique.findUniqueOrThrow({ where: { slug: 'photos-legendees' } })).id,
        auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: PHOTOS.riviere, portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    const photosGalerie = [
      { url: PHOTOS.riviere, legende: "Rassemblement au bord de la rivière, Gragbalilié.", credit: 'DR', ordre: 0 },
      { url: PHOTOS.action, legende: "Match de football communautaire, Gragbalilié.", credit: 'DR', ordre: 1 },
      { url: PHOTOS.accueil, legende: "Accueil des équipes par les autorités villageoises, Gragbalilié.", credit: 'DR', ordre: 2 },
      { url: PHOTOS.huddle, legende: "Les jeunes joueurs rassemblés avant la rencontre, Gragbalilié.", credit: 'DR', ordre: 3 },
      { url: PHOTOS.doyenne, legende: "Une doyenne du village, Gragbalilié.", credit: 'DR', ordre: 4 },
    ];
    for (const p of photosGalerie) {
      await prisma.media.create({ data: { type: 'PHOTO', articleId: galerie.id, ...p } });
    }
  }

  console.log(`✔ ${crees} article(s) d'aperçu interne créé(s) + galerie Rétro Photo.`);
}

// Vidéos (YouTube, embarquées telles quelles) et interviews audio (fichiers
// réels uploadés sur Cloudinary) — rubriques service "Vidéos" et
// "Audio / Podcasts". Étiquetés apercu-interne : la rédaction doit encore
// les remplacer par des articles/reportages définitifs après validation de
// la présentation (cf. demande explicite). Deux vidéos partagées par
// l'utilisateur (danse TikTok, extrait Masaka Kids Afrikana) sont
// volontairement exclues : elles appartiennent à d'autres créateurs.
async function seedVideosEtAudios() {
  const [videos, audio] = await Promise.all([
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'videos' } }),
    prisma.rubrique.findUniqueOrThrow({ where: { slug: 'audio-podcasts' } }),
  ]);
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });

  const VIDEOS = [
    {
      slug: 'apercu-video-traitement-distribution-eau',
      titre: "Reportage vidéo : le traitement et la distribution de l'eau",
      chapo: "Un reportage filmé sur les châteaux d'eau et les étapes de traitement de l'eau de surface avant sa distribution.",
      youtubeUrl: 'https://youtu.be/E399t7JsY2w',
    },
    {
      slug: 'apercu-video-interview-notre-voie-tv',
      titre: 'Interview filmée — Notre Voie TV',
      chapo: "Un entretien réalisé par Notre Voie TV.",
      youtubeUrl: 'https://youtu.be/UzYtP-KA9o4',
    },
    {
      slug: 'apercu-video-synacvtcci-patente-vtc',
      titre: 'Chauffeurs VTC : ce que précise le SYNACVTCCI sur la patente transport',
      chapo: "Dans un communiqué, le Syndicat national des chauffeurs VTC de Côte d'Ivoire indique que ses adhérents ne sont pas concernés par les contrôles de patente transport actuellement en cours dans le District Autonome d'Abidjan.",
      youtubeUrl: 'https://youtu.be/-URzktf2f2w',
    },
    {
      slug: 'apercu-video-temoignage-filme',
      titre: 'Vidéo : un témoignage filmé',
      chapo: 'Une vidéo courte, sans contexte éditorial vérifié pour le moment.',
      youtubeUrl: 'https://youtu.be/cDm2_WSX_UM',
    },
  ];

  let videosCrees = 0;
  for (const v of VIDEOS) {
    const existe = await prisma.article.findUnique({ where: { slug: v.slug } });
    if (existe) continue;
    const idYoutube = v.youtubeUrl.split('/').pop();
    const vignette = `https://img.youtube.com/vi/${idYoutube}/hqdefault.jpg`;
    const maintenant = new Date();
    const article = await prisma.article.create({
      data: {
        slug: v.slug, titre: v.titre, chapo: v.chapo, contenuHtml: null,
        tags: ['apercu-interne'], format: 'VIDEO_COURTE', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: videos.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: vignette, portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    await prisma.media.create({ data: { type: 'VIDEO', url: v.youtubeUrl, articleId: article.id } });
    videosCrees++;
  }

  // Interviews audio réelles (fichiers uploadés vers Cloudinary).
  // .mp3 : format de livraison demandé à Cloudinary à la volée (transcodage
  // depuis le .3gp stocké), pour une compatibilité audio HTML5 maximale.
  const AUDIOS = [
    { slug: 'apercu-audio-cardinal-bessi', nom: 'Cardinal Bessi', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787580448/audio-interviews/cardinal-bessi.mp3', duree: 2301 },
    { slug: 'apercu-audio-dakouri-benson', nom: 'Dakouri Benson', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787580736/audio-interviews/dakouri-benson.mp3', duree: 1411 },
    { slug: 'apercu-audio-dion-yaye-robert', nom: 'Dion Yayé Robert', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787580844/audio-interviews/dion-yaye-robert.mp3', duree: 2604 },
    { slug: 'apercu-audio-fondation-dakoury-marus-tresor', nom: 'Fondation Dakoury Marus Trésor', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787580882/audio-interviews/fondation-dakoury-marus-tresor.mp3', duree: 678 },
    { slug: 'apercu-audio-gnanzi-guela-anicet', nom: 'Gnanzi Guéla Anicet', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787580962/audio-interviews/gnanzi-guela-anicet.mp3', duree: 1162 },
    { slug: 'apercu-audio-jean-louis-billon', nom: 'Jean Louis Billon', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787581116/audio-interviews/jean-louis-billon.mp3', duree: 2442 },
    { slug: 'apercu-audio-rugby-andrea', nom: 'Rugby Andrea', url: 'https://res.cloudinary.com/ataat5bs/video/upload/v1787581191/audio-interviews/rugby-andrea.mp3', duree: 2986 },
  ];

  let audiosCrees = 0;
  for (const a of AUDIOS) {
    const existe = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (existe) continue;
    const maintenant = new Date();
    const article = await prisma.article.create({
      data: {
        slug: a.slug, titre: `Entretien avec ${a.nom}`, chapo: `Interview audio réalisée par la rédaction.`, contenuHtml: null,
        tags: ['apercu-interne'], format: 'AUDIO', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: audio.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: null, portails: ['INFO_DIRECT'], dureeEcouteSec: a.duree,
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    await prisma.media.create({ data: { type: 'AUDIO', url: a.url, dureeSec: a.duree, legende: `Entretien avec ${a.nom}`, articleId: article.id } });
    audiosCrees++;
  }

  console.log(`✔ ${videosCrees} vidéo(s) + ${audiosCrees} audio(s) d'aperçu interne créé(s).`);
}

// Un article d'aperçu par sous-rubrique du mega-menu (cf. SOUS_RUBRIQUES),
// fournis texte pour texte par l'utilisateur pour visualiser l'affichage.
// "Direct & Flashs" est rattaché à Abidjan & Communes (thème proche, en
// format FLASH) et "Le Kiosque PDF" est volontairement omis — cf.
// SOUS_RUBRIQUES : ni l'un ni l'autre n'est une rubrique réelle, ce sont
// des redites de pages déjà existantes (/direct, /kiosque).
async function seedApercuSousRubriques() {
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });
  const PHOTOS = [
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572373/notre-voie/preview-gragbalilie/1-action.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572377/notre-voie/preview-gragbalilie/2-accueil.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572381/notre-voie/preview-gragbalilie/3-huddle.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572385/notre-voie/preview-gragbalilie/4-doyenne.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572389/notre-voie/preview-gragbalilie/5-riviere.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572393/notre-voie/preview-gragbalilie/6-chateau-eau.jpg',
  ];

  const items = [
    { slug: 'apercu-rhdp-ppaci-strategies-locales', rubrique: 'elections-partis', titre: "RHDP et PPA-CI : Les états-majors affûtent leurs stratégies pour les locales", chapo: "À quelques mois des prochaines échéances, les formations politiques intensifient les meetings de mobilisation sur l'ensemble du territoire national." },
    { slug: 'apercu-assemblee-nationale-modernisation-justice', rubrique: 'institutions-lois', titre: "Assemblée Nationale : Vote d'un projet de loi sur la modernisation de la justice", chapo: "Les députés ont adopté à la majorité le texte visant à dématérialiser les procédures administratives et à accélérer le traitement des dossiers judiciaires." },
    { slug: 'apercu-cocody-yopougon-eclairage-public', rubrique: 'abidjan-communes', titre: "Cocody et Yopougon : Lancement des travaux d'extension de l'éclairage public", chapo: "Les municipalités abidjanaises renforcent le réseau électrique dans les quartiers périphériques pour améliorer la sécurité nocturne des usagers." },
    { slug: 'apercu-poro-centre-culturel-korhogo', rubrique: 'vie-des-regions', titre: "Région du Poro : Inauguration d'un nouveau centre culturel à Korhogo", chapo: "Cet espace dédié à la jeunesse et aux arts traditionnels vise à promouvoir le patrimoine artisanal et culturel du septentrion ivoirien." },
    { slug: 'apercu-sommet-cedeao-stabilite-sous-regionale', rubrique: 'diplomatie-cedeao', titre: "Sommet de la CEDEAO : La Côte d'Ivoire réaffirme son engagement pour la stabilité sous-régionale", chapo: "En réunion extraordinaire, les chefs d'État ont fait le point sur la coopération sécuritaire et la fluidité des échanges commerciaux inter-états." },
    { slug: 'apercu-diaspora-france-forum-investisseurs', rubrique: 'diaspora-ivoire', titre: "Diaspora de France : Succès du premier forum des investisseurs ivoiriens à Paris", chapo: "Plus de 500 cadres et entrepreneurs de la diaspora se sont réunis pour échanger sur les opportunités de création d'entreprises à Abidjan." },
    { slug: 'apercu-flash-5e-pont-trafic-fluide', rubrique: 'abidjan-communes', format: 'FLASH', titre: "[FLASH 14H30] Trafic fluide sur le 5e pont après l'intervention des services d'urgence", chapo: "L'incident technique survenu en mi-journée a été entièrement résorbé par les équipes d'assistance routière." },

    { slug: 'apercu-marches-abidjan-plafonnement-riz-huile', rubrique: 'le-panier-de-la-menagere', titre: "Marchés d'Abidjan : Maintien du plafonnement des prix du riz et de l'huile", chapo: "Les contrôles du Ministère du Commerce se renforcent sur les marchés pour veiller au respect des barèmes sur les produits de première nécessité." },
    { slug: 'apercu-anacarde-previsions-recolte-2026', rubrique: 'agro-industrie-export', titre: "Filière Anacarde : Des prévisions de récolte en hausse pour la campagne 2026", chapo: "Grâce aux récents investissements dans la transformation locale, le secteur prévoit une augmentation significative des revenus d'exportation." },
    { slug: 'apercu-fintech-ivoirienne-levee-fonds', rubrique: 'tech-startups', titre: "Fintech ivoirienne : Une levée de fonds de 2 millions de dollars pour démocratiser l'épargne", chapo: "La jeune pousse abidjanaise ambitionne d'étendre ses services de transfert d'argent et d'épargne mobile à l'ensemble de la zone UEMOA." },
    { slug: 'apercu-concours-fonction-publique-inscriptions', rubrique: 'emploi-concours', titre: "Concours de la Fonction Publique : Ouverture officielle des inscriptions en ligne", chapo: "Le Ministère invite les candidats à valider leurs dossiers sur la plateforme numérique dédiée avant la date limite fixée au mois prochain." },
    { slug: 'apercu-tablettes-educatives-lycees-techniques', rubrique: 'systeme-educatif', titre: "Formation professionnelle : Dotation de tablettes éducatives dans les lycées techniques", chapo: "Un programme pilote de numérisation des supports pédagogiques démarre dans cinq grandes régions universitaires du pays." },
    { slug: 'apercu-cmu-7-millions-assures', rubrique: 'sante-prevention', titre: "CMU : Franchissement du cap des 7 millions d'assurés immatriculés", chapo: "La Couverture Maladie Universelle intensifie ses campagnes de proximité dans les gares routières et les marchés pour enrôler les travailleurs du secteur informel." },
    { slug: 'apercu-inondations-curage-bingerville', rubrique: 'cadre-de-vie-climat', titre: "Prévention des inondations : Travaux de curage préventifs à Bingerville", chapo: "Les autorités municipales déploient des chantiers d'aménagement pour sécuriser les canaux d'évacuation d'eau avant les fortes pluies." },

    { slug: 'apercu-rap-ivoire-records-streaming', rubrique: 'showbiz-musique', titre: "Rap Ivoire : Nouveaux records de streaming pour les artistes locaux", chapo: "La scène urbaine ivoirienne confirme sa domination ouest-africaine avec des millions d'écoutes accumulées sur les plateformes légales." },
    { slug: 'apercu-ligue1-lonaci-asec-tete-classement', rubrique: 'elephants-football-national', titre: "Ligue 1 Lonaci : L'ASEC Mimosas prend la tête du classement", chapo: "Les Jaune et Noir se sont imposés (2-0) au Stade Félix Houphouët-Boigny lors du choc de la journée de championnat." },
    { slug: 'apercu-legion-ivoirienne-europe-performances', rubrique: 'sports-internationaux', titre: "Légion ivoirienne en Europe : Performances remarquées en grands championnats", chapo: "Retour sur les prestations du week-end des internationaux ivoiriens évoluant en Premier League et en Ligue 1 française." },
    { slug: 'apercu-guide-garba-marcory', rubrique: 'gastronomie-maquis', titre: "Guide d'Abidjan : Les trois meilleures adresses pour déguster un Garba à Marcory", chapo: "Sélection des espaces incontournables où la semoule de manioc et le thon frit font la fierté de la gastronomie urbaine." },
    { slug: 'apercu-femua-prochaine-edition-anoumabo', rubrique: 'arts-spectacles', titre: "FEMUA : Les grandes lignes de la prochaine édition dévoilées à Anoumabo", chapo: "Les organisateurs annoncent un plateau artistique international varié couplé à des actions sociales dans l'intérieur du pays." },
    { slug: 'apercu-hommage-figure-presse-lettres', rubrique: 'carnet-noir', titre: "Disparition : Hommage à une grande figure de la presse et des lettres ivoiriennes", chapo: "La communauté journalistique salue la mémoire d'un éditorialiste chevronné qui a marqué plusieurs décennies d'information." },

    { slug: 'apercu-intox-frais-transfert-argent', rubrique: 'fact-checking-web', titre: "Vérité ou Intox : Non, les frais de transfert d'argent n'ont pas augmenté", chapo: "Une fausse capture d'écran circulant sur WhatsApp sème la confusion. La direction des impôts et les opérateurs démentent cette rumeur." },
    { slug: 'apercu-enquete-transport-lagunaire-abidjan', rubrique: 'grands-format', titre: "Enquête : Dans les coulisses de la logistique du transport lagunaire à Abidjan", chapo: "Entre bateaux-bus modernes et pirogues traditionnelles, immersion au cœur du transit quotidien de milliers d'Abidjanais sur la lagune Ébrié." },
    { slug: 'apercu-tribune-ia-emancipation-jeunesse', rubrique: 'opinions-tribunes', titre: "Tribune : « L'Intelligence Artificielle, levier d'émancipation pour la jeunesse »", chapo: "Analyse signée par un enseignant-chercheur de l'Université Félix Houphouët-Boigny sur les opportunités du numérique pour les étudiants." },
    { slug: 'apercu-retrospective-yamoussoukro-architecture', rubrique: 'histoire-de-cote-d-ivoire', titre: "Rétrospective : La planification de Yamoussoukro et son architecture emblématique", chapo: "Retour sur les étapes clés du développement de la capitale politique ivoirienne et de ses grands monuments nationaux." },

    { slug: 'apercu-podcast-secteur-informel-bouake', rubrique: 'le-debat-du-jour', titre: "Podcast : Comment moderniser le secteur informel sans fragiliser les commerçants ?", chapo: "[12 min d'écoute] Débat audio entre économistes et représentants des commerçants du grand marché de Bouaké." },
    { slug: 'apercu-video-patrouilles-securite-routiere', rubrique: 'reportages-video', titre: "Vidéo : Immersion avec les patrouilles de la sécurité routière sur les grands axes", chapo: "[Reportage 2 min 30] Suivez nos caméras au cœur du dispositif de prévention et de contrôle du trafic à Abidjan." },
    { slug: 'apercu-reels-astuces-verifier-information', rubrique: 'formats-verticaux', titre: "Reels / TikTok : 3 astuces rapides pour vérifier une information sur Internet", chapo: "Un format vidéo d'une minute expliquant les réflexes simples à adopter pour ne pas tomber dans le piège des intox sur les réseaux sociaux." },
    { slug: 'apercu-galerie-festival-arts-sanwi', rubrique: 'retro-photo', titre: "Galerie Photo : Les plus beaux clichés du Festival des Arts du Sanwi", chapo: "Série photographique capturant la richesse des danses traditionnelles, des parures et du patrimoine du Sud-Est ivoirien." },
    { slug: 'apercu-interview-ministre-numerique-startups', rubrique: 'interviews-exclusives', titre: "Entretien vidéo : Le Ministre du Numérique répond aux questions des startups", chapo: "Échange direct sur le soutien aux jeunes entreprises technologiques, le coût d'accès à Internet et les programmes de formation au code." },
  ];

  let crees = 0;
  for (const [i, item] of items.entries()) {
    const existe = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existe) continue;
    const rubrique = await prisma.rubrique.findUnique({ where: { slug: item.rubrique } });
    if (!rubrique) {
      console.warn(`⚠ Article d'aperçu "${item.slug}" ignoré : rubrique "${item.rubrique}" introuvable.`);
      continue;
    }
    const maintenant = new Date();
    await prisma.article.create({
      data: {
        slug: item.slug, titre: item.titre, chapo: item.chapo, contenuHtml: `<p>${item.chapo}</p>`,
        tags: ['apercu-interne'], format: item.format || 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: PHOTOS[i % PHOTOS.length], portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} article(s) d'aperçu de sous-rubrique créé(s).`);
}

// 3 formats longs (Enquête/Dossier/Reportage) par pilier, fournis
// intégralement par l'utilisateur — format DECRYPTAGE pour les
// enquêtes/dossiers (« analyse approfondie »), EDITION pour les
// reportages. Chacun rattaché à la sous-rubrique la plus pertinente.
async function seedApercuEnquetesDossiersReportages() {
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });
  const PHOTOS = [
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572373/notre-voie/preview-gragbalilie/1-action.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572377/notre-voie/preview-gragbalilie/2-accueil.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572381/notre-voie/preview-gragbalilie/3-huddle.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572385/notre-voie/preview-gragbalilie/4-doyenne.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572389/notre-voie/preview-gragbalilie/5-riviere.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572393/notre-voie/preview-gragbalilie/6-chateau-eau.jpg',
  ];

  const items = [
    { slug: 'apercu-enquete-financement-partis-politiques', rubrique: 'politique', format: 'DECRYPTAGE',
      titre: "Enquête : Les dessous du financement des partis politiques avant les grandes échéances",
      chapo: "À l'approche des grands rendez-vous électoraux, l'argent reste le nerf de la guerre. Entre cotisations des militants, appuis de la diaspora et fonds privés, plongée dans les réseaux d'influence et les circuits financiers qui alimentent les états-majors politiques.",
      contenuHtml: `<p>Comment s'organisent les budgets de campagne à Abidjan et à l'intérieur du pays ? Alors que la loi encadre théoriquement les contributions, la réalité du terrain montre une prolifération de financements informels. Nos investigations révèlent le rôle clé des clubs de soutien et des hommes d'affaires locaux dans l'organisation des meetings et le déploiement logistique dans les 31 régions du pays.</p>` },
    { slug: 'apercu-dossier-decentralisation-communes-abidjan', rubrique: 'abidjan-communes', format: 'DECRYPTAGE',
      titre: "Dossier : Décentralisation et gouvernance locale : Quel bilan pour les communes d'Abidjan ?",
      chapo: "De Yopougon à Cocody en passant par Abobo, le transfert de compétences du gouvernement central vers les municipalités produit des résultats contrastés. Analyse comparative de l'efficacité budgétaire et des services publics.",
      contenuHtml: `<ul><li><strong>Volet 1 :</strong> Collecte des taxes locales et autonomie financière des mairies.</li><li><strong>Volet 2 :</strong> Aménagement urbain et voirie : le défi des chantiers d'assainissement.</li><li><strong>Volet 3 :</strong> Parole aux citoyens : le baromètre de satisfaction des habitants par commune.</li></ul>` },
    { slug: 'apercu-reportage-patrouille-nuit-yopougon', rubrique: 'abidjan-communes', format: 'EDITION',
      titre: "Reportage : Une nuit en patrouille avec les unités de sécurisation à Yopougon",
      chapo: "De 22h à 5h du matin, nos reporters ont embarqué avec les forces de police dans la plus grande commune de Côte d'Ivoire. Immersion au cœur d'une opération de contrôle et de prévention.",
      contenuHtml: `<p>Le gyrophare bleu balaye les ruelles éclairées de Sicogi. Au poste de commandement mobile, les appels radio s'enchaînent. Entre régulation des zones de rassemblement nocturne et interventions d'urgence sur les axes principaux, le reportage dévoile la réalité de la sécurité de proximité dans les quartiers populaires.</p>` },

    { slug: 'apercu-enquete-speculation-fonciere-grand-abidjan', rubrique: 'economie', format: 'DECRYPTAGE',
      titre: "Enquête : Spéculation foncière dans le Grand Abidjan : Qui profite de la hausse des coûts du logement ?",
      chapo: "Bingerville, Songon, Grand-Bassam : l'étalement urbain transforme les terres agricoles en chantiers immobiliers. Une spéculation effrénée qui pèse directement sur le portefeuille des ménages.",
      contenuHtml: `<p>En retraçant les transactions de plusieurs parcelles urbaines, cette enquête met en lumière les failles du processus d'attestation villageoise, le rôle des intermédiaires non agréés et l'impact direct sur les loyers de la capitale économique.</p>` },
    { slug: 'apercu-dossier-transformation-locale-cacao', rubrique: 'agro-industrie-export', format: 'DECRYPTAGE',
      titre: "Dossier : Transformation locale du cacao : La Côte d'Ivoire en passe de réussir son pari industriel ?",
      chapo: "Premier producteur mondial, le pays accélère la transformation de ses fèves sur le sol national. État des lieux d'une mutation stratégique de l'économie ivoirienne.",
      contenuHtml: `<ul><li><strong>Analyse :</strong> Capacités de broyage installées et niveau de transformation effective.</li><li><strong>Enjeux :</strong> L'impact sur la création d'emplois industriels pour les jeunes diplômés.</li><li><strong>Perspective :</strong> Les marchés émergents et la consommation locale de chocolat artisanaux.</li></ul>` },
    { slug: 'apercu-reportage-marche-gouro-adjame', rubrique: 'le-panier-de-la-menagere', format: 'EDITION',
      titre: "Reportage : Au cœur du marché de Gouro à Adjamé : Le périple des vivriers du champ à l'assiette",
      chapo: "Arrivée des camions à 4h du matin, négociations serrées et chargement des grossistes : immersion dans le poumon du ravitaillement alimentaire abidjanais.",
      contenuHtml: `<p>Les moteurs des camions venus du Centre et du Nord vrombissent encore dans la pénombre. Les commerçantes, pièces maîtresses de la chaîne de distribution, s'affairent autour des sacs de banane, de piment et de manioc. Reportage vivant sur la réalité logistique qui fixe le prix de la nourriture au quotidien.</p>` },

    { slug: 'apercu-enquete-economie-cachee-rap-ivoire', rubrique: 'showbiz-musique', format: 'DECRYPTAGE',
      titre: "Enquête : L'économie cachée du Rap Ivoire : Entre streams, concerts et contrats de marque",
      chapo: "Devenu le genre musical dominant chez les jeunes, le Rap Ivoire brasse des millions de FCFA. Mais comment vivent réellement les artistes et leurs producteurs derrière les réseaux sociaux ?",
      contenuHtml: `<p>Analyse des revenus générés par les plateformes de streaming en Afrique de l'Ouest, transparence des droits d'auteur et rentabilité des spectacles en salle face aux modèles de sponsoring corporate.</p>` },
    { slug: 'apercu-dossier-heritage-stades-nationaux', rubrique: 'sport', format: 'DECRYPTAGE',
      titre: "Dossier : L'héritage des grandes infrastructures sportives : Quelle gestion pour les stades nationaux ?",
      chapo: "Un réseau de stades modernes couvre désormais le territoire national. Quel est le plan de rentabilisation et de maintenance de ces complexes omnisports ?",
      contenuHtml: `<ul><li><strong>Infrastructures :</strong> État des lieux des stades d'Ebimpé, Bouaké, San-Pédro, Korhogo et Yamoussoukro.</li><li><strong>Modèle économique :</strong> Accueil d'événements culturels, matchs internationaux et concession privée.</li><li><strong>Formation :</strong> L'accès des centres de formation locaux à ces installations de pointe.</li></ul>` },
    { slug: 'apercu-reportage-maquis-marcory-zone4', rubrique: 'gastronomie-maquis', format: 'EDITION',
      titre: "Reportage : Dans les coulisses d'un maquis mythique de Marcory Zone 4",
      chapo: "Entre l'odeur de la grillade de poisson, le son coupé-décalé et le ballet des serveurs, immersion dans l'art de recevoir à l'ivoirienne à la tombée de la nuit.",
      contenuHtml: `<p>À partir de 19h, la terrasse ne désemplit pas. Le gérant orchestre les commandes avec une précision d'horloger pendant que le maître-grilleur surveille les braises. Le reportage capture cette ambiance unique où dirigeants d'entreprises, artistes et noctambules se croisent autour de la gastronomie locale.</p>` },

    { slug: 'apercu-enquete-cybercriminalite-ia', rubrique: 'grands-format', format: 'DECRYPTAGE',
      titre: "Enquête : Traque de la cybercriminalité : Comment les escroqueries en ligne s'adaptent à l'IA",
      chapo: "Usurpation d'identité vocale, faux profils ultra-réalistes et hameçonnage ciblé : la lutte contre la délinquance numérique franchit un nouveau cap technologique.",
      contenuHtml: `<p>Les experts en cybersécurité et les unités spécialisées de la police dévoilent les nouvelles techniques d'usurpation utilisées sur le web et les mécanismes de coopération avec les banques et opérateurs télécoms pour bloquer les flux financiers frauduleux.</p>` },
    { slug: 'apercu-dossier-anatomie-desinformation-web', rubrique: 'fact-checking-web', format: 'DECRYPTAGE',
      titre: "Dossier : Anatomie de la désinformation sur le web ivoirien : Circuits et méthodes de contagion",
      chapo: "Des groupes WhatsApp familiaux aux pages Facebook à fort trafic, étude de la propagation des rumeurs et des contenus manipulés.",
      contenuHtml: `<ul><li><strong>Cartographie :</strong> Comment une fausse information prend naissance et devient virale en moins de 2 heures.</li><li><strong>Fact-Checking :</strong> Les outils de vérification d'images et d'extraits sonores.</li><li><strong>Prévention :</strong> Rôle de la sensibilisation dans le milieu scolaire et universitaire.</li></ul>` },
    { slug: 'apercu-reportage-24h-cellule-fact-checking', rubrique: 'grands-format', format: 'EDITION',
      titre: "Reportage : 24 heures au sein d'une cellule de vérification de l'information (Fact-Checking)",
      chapo: "Face au flux ininterrompu de publications sur les réseaux sociaux, les journalistes de la rédaction traquent les images tronquées et les faux communiqués.",
      contenuHtml: `<p>Horodatage, géolocalisation de vidéos, contact direct avec les sources officielles : suivez pas à pas la déconstruction d'un faux communiqué ministériel qui s'est répandu sur le web en cours de matinée.</p>` },

    { slug: 'apercu-enquete-guerre-attention-tiktok', rubrique: 'formats-verticaux', format: 'DECRYPTAGE',
      titre: "Enquête : La guerre de l'attention : Comment les créateurs TikTok bousculent les médias traditionnels",
      chapo: "Avec des vidéos de 60 secondes, de jeunes vidéastes cumulent plus d'audience que certains plateaux télé. Une mutation majeure dans l'accès à l'information.",
      contenuHtml: `<p>Analyse des modèles de création de contenu d'information sur les réseaux sociaux. Cette enquête compare le coût de production, la rapidité de diffusion et le niveau de confiance accordé par les jeunes générations aux journalistes vs les influenceurs.</p>` },
    { slug: 'apercu-dossier-essor-podcast-video-afrique-ouest', rubrique: 'le-debat-du-jour', format: 'DECRYPTAGE',
      titre: "Dossier : L'essor du Podcast vidéo en Afrique de l'Ouest : Nouveau carrefour du débat d'idées",
      chapo: "Longtemps réservé au format audio, le podcast filmé s'impose à Abidjan comme l'espace privilégié des interviews de fond et des débats sociétaux.",
      contenuHtml: `<ul><li><strong>Tendance :</strong> La montée en puissance des studios d'enregistrement indépendants à Abidjan.</li><li><strong>Audience :</strong> Qui écoute et regarde les podcasts de décryptage politique et économique ?</li><li><strong>Monétisation :</strong> Placements de produits, abonnements et partenariats de diffusion.</li></ul>` },
    { slug: 'apercu-reportage-tournage-lagunaire', rubrique: 'reportages-video', format: 'EDITION',
      titre: "Reportage : Tournage lagunaire : Dans l'objectif des caméras d'un grand reportage vidéo",
      chapo: "Équipés de drones, de stabilisateurs et de micros haute précision, nos équipes vidéo ont sillonné la lagune Ébrié pour capturer la vie des transporteurs maritimes.",
      contenuHtml: `<p>Du lever du jour au quai d'Abobo-Doumé jusqu'à la traversée vers Treichville, les coulisses d'un tournage multimédia : réglages techniques, contraintes de prise de vue sur l'eau et interviews sur le vif auprès des usagers des bateaux-bus.</p>` },
  ];

  let crees = 0;
  for (const [i, item] of items.entries()) {
    const existe = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existe) continue;
    const rubrique = await prisma.rubrique.findUnique({ where: { slug: item.rubrique } });
    if (!rubrique) {
      console.warn(`⚠ Article d'aperçu "${item.slug}" ignoré : rubrique "${item.rubrique}" introuvable.`);
      continue;
    }
    const maintenant = new Date();
    await prisma.article.create({
      data: {
        slug: item.slug, titre: item.titre, chapo: item.chapo, contenuHtml: item.contenuHtml,
        tags: ['apercu-interne'], format: item.format, statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: PHOTOS[i % PHOTOS.length], portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    crees++;
  }
  console.log(`✔ ${crees} enquête(s)/dossier(s)/reportage(s) d'aperçu créé(s).`);
}

// Troisième lot : un trio Enquête/Dossier/Reportage par sous-rubrique
// (texte intégralement fourni par l'utilisateur). Format dérivé du préfixe
// du titre : Enquête/Dossier → DECRYPTAGE, Reportage → EDITION (même
// convention que seedApercuEnquetesDossiersReportages). "Direct & Flashs"
// et "Le Kiosque PDF" restent volontairement exclus comme rubriques (cf.
// SOUS_RUBRIQUES : "Ne pas changer", confirmé explicitement par
// l'utilisateur) — leurs 6 articles sont rattachés à la sous-rubrique
// existante la plus proche (Abidjan & Communes, Grands Format, Histoire de
// Côte d'Ivoire) plutôt qu'à une nouvelle rubrique.
async function seedApercuTriosSousRubriques() {
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });
  const PHOTOS = [
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572373/notre-voie/preview-gragbalilie/1-action.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572377/notre-voie/preview-gragbalilie/2-accueil.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572381/notre-voie/preview-gragbalilie/3-huddle.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572385/notre-voie/preview-gragbalilie/4-doyenne.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572389/notre-voie/preview-gragbalilie/5-riviere.jpg',
    'https://res.cloudinary.com/ataat5bs/image/upload/v1787572393/notre-voie/preview-gragbalilie/6-chateau-eau.jpg',
  ];

  const LOTS = [
    { rubrique: 'elections-partis', items: [
      ["Enquête : Les budgets de pré-campagne : d'où viennent les fonds des états-majors ?", "Enquête exclusive sur le circuit de financement des partis politiques, la traçabilité des dons de partisans et le rôle des clubs de soutien privés."],
      ["Dossier : Cartographie des forces politiques dans les 31 régions du pays", "Analyse détaillée région par région du poids électoral des grandes formations et des candidats indépendants."],
      ["Reportage : Nuit de tension au siège d'un parti lors du choix des candidats", "Immersion de 12 heures au cœur des négociations fermées pour l'obtention des investitures officielles."],
    ] },
    { rubrique: 'institutions-lois', items: [
      ["Enquête : Lois sur le foncier rural : pourquoi leur application piétine sur le terrain", "Investigation sur les blocages administratifs et coutumiers qui freinent la délivrance des certificats fonciers."],
      ["Dossier : La dématérialisation des services publics : le bilan des réformes", "État des lieux des démarches administratives numérisées, de l'état civil aux passeports."],
      ["Reportage : Dans les coulisses d'une séance à huis clos à l'Assemblée Nationale", "Reportage au plus près des députés pendant le vote crucial d'un projet de loi budgétaire."],
    ] },
    { rubrique: 'abidjan-communes', items: [
      ["Enquête : Marchés publics municipaux : opacité ou transparence dans l'attribution ?", "Révélations sur les procédures de passation de marchés pour les chantiers de voirie dans les mairies abidjanaises."],
      ["Dossier : Le grand comparatif des budgets des 10 communes d'Abidjan", "Analyse chiffrée des ressources financières, des dépenses d'investissement et des priorités de chaque municipalité."],
      ["Reportage : 24 heures avec la brigade de salubrité de la mairie d'Abobo", "Suivi nocturne et diurne des agents municipaux luttant contre les dépôts sauvages d'ordures."],
      // Direct & Flashs, rattaché ici (pas de rubrique dédiée — cf. commentaire de fonction).
      ["Enquête : Comment les fausses alertes perturbent le traitement de l'information d'urgence", "Analyse des mécanismes de vérification au sein de la rédaction pour valider une alerte en moins de 3 minutes."],
      ["Dossier : Dispositifs d'urgence nationale : la chaîne de commandement en cas de crise", "Présentation des protocoles d'alerte des sapeurs-pompiers, du Samu et de la police nationale."],
      ["Reportage : Au cœur de la centrale d'information trafic lors d'une alerte météo à Abidjan", "Reportage en direct avec les régulateurs du trafic routier pendant une pluie diluvienne."],
    ] },
    { rubrique: 'vie-des-regions', items: [
      ["Enquête : Conflits communautaires dans le Poro : les vraies causes de la pression foncière", "Enquête de terrain auprès des éleveurs et agriculteurs pour comprendre la résurgence des litiges pastoraux."],
      ["Dossier : Désenclavement du Tonkpi : l'impact des nouvelles pistes rurales sur le commerce", "Bilan des infrastructures routières livrées dans l'Ouest et leur effet direct sur l'évacuation des produits agricoles."],
      ["Reportage : Jour de grand marché transfrontalier à Pogo", "Carnet de route au cœur des échanges commerciaux et du contrôle douanier à la frontière du septentrion."],
    ] },
    { rubrique: 'diplomatie-cedeao', items: [
      ["Enquête : Les réseaux d'influence de la diplomatie ivoirienne en Afrique de l'Ouest", "Investigation sur les canaux d'amitié et de médiation utilisés pour préserver la stabilité sous-régionale."],
      ["Dossier : La libre circulation des marchandises en zone CEDEAO à l'épreuve des tracas routiers", "Étude comparative des coûts et délais de transport de marchandises entre Abidjan, Bamako et Ouagadougou."],
      ["Reportage : Dans les pas des délégations lors du Sommet diplomatique d'Abidjan", "Chronique des coulisses, du protocole d'État et des négociations informelles entre diplomates."],
    ] },
    { rubrique: 'diaspora-ivoire', items: [
      ["Enquête : Transferts d'argent de la diaspora : la guerre des frais cachés des opérateurs", "Décryptage des commissions prélevées sur les envois de fonds depuis l'Europe et l'Amérique vers Abidjan."],
      ["Dossier : Le retour des diplômés de la diaspora : opportunités et réalités du marché local", "Enquête sur les repats ivoiriens, les secteurs qui recrutent et les freins à l'intégration professionnelle."],
      ["Reportage : Immersion au Forum des investisseurs de la diaspora ivoirienne à Paris", "Rencontre avec des entrepreneurs expatriés désireux de lancer des projets industriels au pays."],
    ] },

    { rubrique: 'le-panier-de-la-menagere', items: [
      ["Enquête : La chaîne des intermédiaires : pourquoi la tomate coûte trois fois plus cher à Abidjan", "Enquête sur les spéculateurs et les coopératives grossistes qui fixent les prix avant le marché de détail."],
      ["Dossier : 5 ans d'évolution des prix des produits de première nécessité en Côte d'Ivoire", "Tableau comparatif des prix du riz, de l'huile, de la viande et du sucre sur la demi-décennie écoulée."],
      ["Reportage : Aux côtés d'une famille de Koumassi gérant son budget mensuel au marché", "Suivi d'une mère de famille dans ses arbitrages quotidiens face à la cherté de la vie."],
    ] },
    { rubrique: 'agro-industrie-export', items: [
      ["Enquête : Les réseaux de fuite du cacao brut aux frontières terrestres", "Investigation sur les circuits de contrebande des fèves vers les pays voisins en période de campagne."],
      ["Dossier : Transformation de l'anacarde : de la récolte en brousse aux usines d'Abidjan", "État des lieux du taux de décorticage national et des mesures d'incitation aux usiniers."],
      ["Reportage : Dans les chaînes de conditionnement d'une coopérative agricole à San-Pédro", "Reportage photo-texte au milieu des sacs de café et de cacao prêts pour l'embarquement portuaire."],
    ] },
    { rubrique: 'tech-startups', items: [
      ["Enquête : Levées de fonds des startups abidjanaises : entre annonces spectaculaires et réalité financière", "Révélations sur le taux de survie réel des pépites de la fintech ivoirienne après leur premier tour de table."],
      ["Dossier : La guerre des applications de paiement et de transfert d'argent mobile", "Analyse comparative des frais, de la couverture réseau et des fonctionnalités des géants du mobile money."],
      ["Reportage : 48 heures au cœur d'un Hackathon de développeurs à Cocody", "Immersion parmi les jeunes ingénieurs concevant des solutions d'intelligence artificielle pour l'agriculture."],
    ] },
    { rubrique: 'emploi-concours', items: [
      ["Enquête : Le marché noir des faux sujets et corrigés de concours sur WhatsApp", "Enquête sur les arnaques ciblant les candidats aux concours administratifs et les réseaux de fraudeurs traqués par la police."],
      ["Dossier : Guide complet des concours nationaux : effectifs, conditions et taux d'admissibilité", "Relevé exhaustif des données d'admission de l'ENA, de l'INFAS, du CAFOP et des écoles militaires."],
      ["Reportage : Au cœur de la longue file d'attente du dépôt des dossiers de candidature", "Récit de vie et témoignages de diplômés en quête d'une place dans la fonction publique."],
    ] },
    { rubrique: 'systeme-educatif', items: [
      ["Enquête : Les cours du soir payants dans les lycées publics : tolérance ou abus ?", "Investigation sur les pratiques tarifaires parallèles instaurées dans certains établissements secondaires."],
      ["Dossier : Enseignement privé sous contrat : niveau d'encadrement et subventions de l'État", "Évaluation de la qualité d'apprentissage dans les grandes écoles et collèges privés agréés."],
      ["Reportage : Une journée d'immersion dans un collège de proximité en zone rurale", "Découverte du quotidien des élèves et enseignants loin des commodités des grandes métropoles."],
    ] },
    { rubrique: 'sante-prevention', items: [
      ["Enquête : Faux médicaments et pharmacie par terre : la filière d'approvisionnement démantelée", "Enquête sur les saisies de médicaments contrefaits dans les marchés informels et les ports d'entrée."],
      ["Dossier : Bilan de la CMU : taux de couverture, pharmacies affiliées et reste à charge", "Radiographie complète du système de Couverture Maladie Universelle et des défis du secteur informel."],
      ["Reportage : Garde de nuit aux urgences du CHU de Yopougon", "Carnet d'immersion auprès des médecins et infirmiers au chevet des patients durant un week-end d'affluence."],
    ] },
    { rubrique: 'cadre-de-vie-climat', items: [
      ["Enquête : Permis de construire en zones inondables : qui valide les chantiers à risque ?", "Enquête sur le non-respect du plan d'urbanisme à Abidjan et les responsabilités partagées lors des glissements de terrain."],
      ["Dossier : Recyclage des déchets plastiques : l'urgence d'une filière industrielle", "État des lieux des volumes de bouteilles et sachets rejetés, et des rares unités de transformation."],
      ["Reportage : Sur les chantiers de curage des canaux d'évacuation avant la grande saison des pluies", "Suivi des engins de terrassement et des ouvriers nettoyant les bassins d'orage d'Indénié."],
    ] },

    { rubrique: 'showbiz-musique', items: [
      ["Enquête : Le business des concerts au Palais de la Culture : combien gagnent vraiment les artistes ?", "Enquête sur la rentabilité des spectacles, la répartition des billets et les coûts d'organisation."],
      ["Dossier : L'exportation de la musique ivoirienne : du Coupé-Décalé au Rap Ivoire sur les scènes mondiales", "Panorama des artistes locaux sous contrat avec des majors internationales et des festivals étrangers."],
      ["Reportage : Dans l'intimité d'un studio d'enregistrement à Koumassi lors de la création d'un tube", "Immersion avec un beatmaker et un chanteur durant 8 heures de composition en continu."],
    ] },
    { rubrique: 'elephants-football-national', items: [
      ["Enquête : Centres de formation de quartier : pépinières de talents ou miroirs aux alouettes ?", "Investigation sur les centres de football non agréés promettant des essais en Europe contre de l'argent."],
      ["Dossier : Le modèle économique des clubs de Ligue 1 Lonaci à l'épreuve du manque de public", "Analyse des recettes de billetterie, des droits TV et du sponsoring des clubs du championnat national."],
      ["Reportage : Jour de derby ASEC - Africa au Stade Félix Houphouët-Boigny côté virage supporters", "Ambiance, chants et ferveur populaire vécus depuis les gradins des deux plus grands clubs du pays."],
    ] },
    { rubrique: 'sports-internationaux', items: [
      ["Enquête : Les réseaux d'expatriation des jeunes basketteurs ivoiriens vers les académies étrangères", "Enquête sur les bourses d'études et de sport proposées aux espoirs locaux aux États-Unis et en Europe."],
      ["Dossier : Les Éléphants omnisports sur la scène internationale : bilan et perspectives", "Résultats et performances des athlètes ivoiriens en taekwondo, athlétisme, basket et rugby."],
      ["Reportage : Nuit de retransmission de finale européenne dans un grin de passionnés à Treichville", "Reportage sur l'engouement du public abidjanais pour les grands championnats de football internationaux."],
    ] },
    { rubrique: 'gastronomie-maquis', items: [
      ["Enquête : Hygiène et traçabilité des produits de la mer servis dans les espaces de restauration", "Investigation sur les chaînes de froid de l'approvisionnement en poisson frais dans les maquis."],
      ["Dossier : L'Attiéké ivoirien : processus d'homologation internationale et enjeux d'exportation", "Analyse de la protection du label Attiéké et du développement des PME d'exportation de semoule de manioc."],
      ["Reportage : Dès 5h du matin avec les braiseurs de Garba de Treichville", "Immersion auprès des garbakés, du nettoyage du poisson au rush de la pause de mi-journée."],
    ] },
    { rubrique: 'arts-spectacles', items: [
      ["Enquête : Statut de l'artiste en Côte d'Ivoire : pourquoi les comédiens peinent à cotiser", "Révélations sur l'absence de couverture sociale minimale pour les comédiens, plasticiens et danseurs."],
      ["Dossier : Le renouveau du cinéma ivoirien : essor des séries TV et des plateformes de streaming", "Bilan des coproductions audiovisuelles locales financées par des groupes télévisuels régionaux."],
      ["Reportage : Répétition générale de la Troupe Nationale de Danse à la Cité des Arts", "Reportage visuel sur la transmission des danses traditionnelles aux nouvelles générations de danseurs."],
    ] },
    { rubrique: 'carnet-noir', items: [
      ["Enquête : Le coût financier des funérailles : la flambée des tarifs des prestations mortuaires", "Investigation sur les budgets imposants consacrés aux obsèques et sur le marché des pompes funèbres."],
      ["Dossier : Les rites funéraires traditionnels face aux contraintes de la vie urbaine moderne", "Étude sociologique sur l'adaptation des veillées et cérémonies coutumières en milieu métropolitain."],
      ["Reportage : Pendant la veillée traditionnelle d'hommage à un notable en pays Akan", "Récit empreint de gravité sur l'organisation des cérémonies de séparation et les chants de deuil."],
    ] },

    { rubrique: 'fact-checking-web', items: [
      ["Enquête : Qui orchestre les fermes à clics et la création de fausses rumeurs sur Facebook ?", "Enquête technique sur les identités numériques factices créées pour générer du buzz payant ou de la manipulation."],
      ["Dossier : Les 10 plus gros canulars numériques démontés cette année en Côte d'Ivoire", "Compilations des intox ayant circulé sur WhatsApp et explications pas à pas des techniques de décryptage."],
      ["Reportage : Une journée avec la cellule de vérification face à la propagation d'une vidéo tronquée", "Chronique minutée de la déconstruction d'un montage vidéo malveillant par la rédaction."],
    ] },
    { rubrique: 'grands-format', items: [
      ["Enquête : L'orpaillage clandestin : désastre écologique et circuits d'évacuation de l'or", "Longue enquête d'investigation sur les sites d'extraction illégale et la pollution des cours d'eau."],
      ["Dossier : Trente ans de mutations urbaines à Abidjan : de la « Perle des lagunes » à la mégapole", "Un grand dossier rétrospectif appuyé sur des cartes et des données démographiques historiques."],
      ["Reportage : 72 heures à bord du train voyageurs reliant Abidjan à l'intérieur du pays", "Carnet de voyage ferroviaire retraçant les escales, les paysages et la vie des passagers."],
      // Le Kiosque PDF, rattaché ici (pas de rubrique dédiée — cf. commentaire de fonction).
      ["Enquête : La crise du papier journal : comment la hausse des coûts accélère la transition numérique", "Investigation sur le coût des intrants d'imprimerie et le basculement des abonnés vers les liseuses PDF."],
      ["Reportage : Dans le bruit des rotatives d'imprimerie à 2 heures du matin lors du bouclage", "Coulisses de la fabrication physique du journal, du transfert informatique à l'expédition des liasses."],
    ] },
    { rubrique: 'opinions-tribunes', items: [
      ["Enquête : L'influence des laboratoires d'idées et universités sur les choix politiques nationaux", "Enquête sur le rôle réel des chercheurs et économistes indépendants dans les réformes étatiques."],
      ["Dossier : Anthologie des meilleures tribunes citoyennes sur la jeunesse et l'avenir du continent", "Sélection de textes engagés rédigés par la société civile, des intellectuels et des étudiants."],
      ["Reportage : Au cœur d'un café-débat contradictoire sur le campus de l'Université Félix Houphouët-Boigny", "Reportage vivant au milieu des échanges passionnés des étudiants lors d'une conférence académique."],
    ] },
    { rubrique: 'histoire-de-cote-d-ivoire', items: [
      ["Enquête : La quête des trésors royaux et pièces archéologiques conservés à l'étranger", "Investigation sur les démarches administratives engagées pour le rapatriement des biens culturels nationaux."],
      ["Dossier : La saga des grands barrages hydroélectriques : de Kossou à Soubré", "Histoire de l'indépendance énergétique ivoirienne à travers la construction de ses infrastructures majeures."],
      ["Reportage : Visite guidée dans les réserves secrètes du Musée des Civilisations d'Abidjan", "Découverte de pièces historiques centenaires conservées hors de la vue du grand public."],
      // Le Kiosque PDF, rattaché ici (pas de rubrique dédiée — cf. commentaire de fonction).
      ["Dossier : Un siècle de Unes historiques : l'histoire de la Côte d'Ivoire à travers la presse papier", "Une sélection des premières pages de journaux ayant immortalisé les grands événements du pays."],
    ] },

    { rubrique: 'le-debat-du-jour', items: [
      ["Enquête : L'économie du podcast audio en Afrique de l'Ouest : sponsors ou financement propre ?", "Investigation sur les modèles de monétisation des producteurs de contenus audio indépendants."],
      ["Dossier : Sélection des 5 émissions audio incontournables pour décrypter l'actualité ivoirienne", "Guide d'écoute et analyse du positionnement des talk-shows audio du moment."],
      ["Reportage : Dans le studio lors de l'enregistrement en direct du débat sur la transition numérique", "Coulisses techniques : prise de son, gestion du temps de parole et régie audio."],
    ] },
    { rubrique: 'reportages-video', items: [
      ["Enquête : Les risques du reportage vidéo sur le terrain : la protection des journalistes d'images", "Enquête sur les conditions de travail des caméramans lors de la couverture de zones de tension ou de catastrophes."],
      ["Dossier : La révolution du matériel de tournage : du caméscope lourd au smartphone 4K", "Analyse de la transformation des outils de production audiovisuelle de presse."],
      ["Reportage : Tournage embarqué sur une pirogue de patrouille lagunaire", "Reportage vidéo sur les techniques de cadrage et de prise de son en milieu aquatique."],
    ] },
    { rubrique: 'formats-verticaux', items: [
      ["Enquête : L'addiction aux algorithmes vidéo : comment captiver les 15-25 ans sans dénaturer l'information", "Investigation sur la stratégie des rédactions pour adapter la rigueur journalistique aux formats courts de 60 secondes."],
      ["Dossier : Méthodologie : condenser un dossier d'enquête en 3 vidéos verticales dynamiques", "Guide de découpage scénaristique, d'incrustation de sous-titres et d'animation graphique pour mobile."],
      ["Reportage : Dans la « Creator Room » du journal où les journalistes tournent les vidéos TikTok du jour", "Découverte du processus d'écriture, d'enregistrement face caméra et de montage sur smartphone."],
    ] },
    { rubrique: 'retro-photo', items: [
      ["Enquête : Le marché des archives photographiques de presse : préservation et droits d'auteur", "Enquête sur la conservation des négatifs originaux et la numérisation des trésors photographiques nationaux."],
      ["Dossier : Un demi-siècle de clichés : les grands jalons de l'histoire du pays en images", "Exposition virtuelle des photos emblématiques de la Côte d'Ivoire de 1960 à nos jours."],
      ["Reportage : Dans les pas d'un photojournaliste accrédité lors d'une cérémonie officielle au Palais", "Suivi des placements, du choix des focales et du traitement instantané des clichés d'actualité."],
    ] },
    { rubrique: 'interviews-exclusives', items: [
      ["Enquête : Les exigences des conseillers en communication avant un grand entretien politique", "Coulisses des négociations sur le format, la durée et les conditions d'interview des personnalités publiques."],
      ["Dossier : Rétrospective des interviews télévisées qui ont fait basculer l'opinion publique", "Analyse des tirades, des révélations et des grands face-à-face journalistiques de la presse ivoirienne."],
      ["Reportage : Les 30 minutes de préparation en coulisses avant l'arrivée de l'invité VIP sur le plateau", "Récit de l'effervescence en régie, des tests d'éclairage et des derniers brief-journalistes."],
    ] },
  ];

  let crees = 0;
  let i = 0;
  for (const lot of LOTS) {
    const rubrique = await prisma.rubrique.findUnique({ where: { slug: lot.rubrique } });
    if (!rubrique) {
      console.warn(`⚠ Lot d'aperçu ignoré : rubrique "${lot.rubrique}" introuvable.`);
      continue;
    }
    for (const [titre, chapo] of lot.items) {
      const corps = titre.replace(/^(Enquête|Dossier|Reportage)\s*:\s*/, '');
      const slug = 'apercu-b3-' + slugify(corps).slice(0, 60);
      const format = titre.startsWith('Reportage') ? 'EDITION' : 'DECRYPTAGE';
      i++;
      const existe = await prisma.article.findUnique({ where: { slug } });
      if (existe) continue;
      const maintenant = new Date();
      await prisma.article.create({
        data: {
          slug, titre, chapo, contenuHtml: `<p>${chapo}</p>`,
          tags: ['apercu-interne'], format, statut: 'PUBLIE', paywall: 'LIBRE',
          rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
          imageUneUrl: PHOTOS[i % PHOTOS.length], portails: ['INFO_DIRECT'],
          publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
        },
      });
      crees++;
    }
  }
  console.log(`✔ ${crees} article(s) du 3e lot d'aperçu (trios enquête/dossier/reportage) créé(s).`);
}

async function main() {
  await seedRubriques();
  await seedSousRubriques();
  await seedStaff();
  const dejaDesReleves = await prisma.prixVieChere.count();
  if (dejaDesReleves === 0) await seedPrixVieChere();
  const dejaDesArticles = await prisma.article.count();
  if (dejaDesArticles === 0) await seedArticles();
  const batch2Existe = await prisma.article.findUnique({ where: { slug: 'affi-nguessan-souverainete-veritable-institutions-fortes' } });
  if (!batch2Existe) await seedArticlesBatch2();
  const batch3Existe = await prisma.article.findUnique({ where: { slug: 'cote-ivoire-demene-sortir-guepier-blanchiment-capitaux' } });
  if (!batch3Existe) await seedArticlesBatch3();
  const mediaBatch1Existe = await prisma.media.findFirst({ where: { url: { contains: 'notre-voie/photo/amqgywoe3g9gwiirg6wq' } } });
  if (!mediaBatch1Existe) await seedMediaBatch1();
  const rotationAFaireExiste = await prisma.media.findFirst({ where: { url: { contains: 'notre-voie/photo/amqgywoe3g9gwiirg6wq' } } });
  if (rotationAFaireExiste) await fixMediaBatch1Rotation();
  const mediaBatch7970Existe = await prisma.media.findFirst({ where: { url: { contains: 'notre-voie/photo-v2/ydy6z4intaheufl8yijb' } } });
  if (!mediaBatch7970Existe) await seedMediaBatch7970();
  const testExiste = await prisma.article.findUnique({ where: { slug: 'article-vitrine-tous-les-formats' } });
  if (!testExiste) await seedTestShowcase();
  await seedNecrologie();
  await seedPhotosLegendees();
  await seedRegieDemo();
  await seedMediaGap1();
  await seedMediaGap2();
  const dejaDesEditions = await prisma.edition.count();
  if (dejaDesEditions === 0) await seedEditions();
  await seedEditionPages();
  await seedCodeAccesDemo();
  await fixArticleDates();
  await seedInfoDirectFlashs();
  await seedInfoDirectImages();
  await seedApercuInterne();
  await seedVideosEtAudios();
  await seedApercuSousRubriques();
  await seedApercuEnquetesDossiersReportages();
  await seedApercuTriosSousRubriques();
  await seedWaloFestival();
}

// Reportage réel sur le Walo Festival & Patrimoine Dida (3ᵉ édition,
// Gragbalilié, 21-23 août 2026) — texte et photos fournis par l'utilisateur
// (document "Walo Festival & Patrimoine Dida.docx", signé Jonas Ouattara),
// à partir d'entretiens de terrain réels avec des sources nommées.
// Contenu réel, publié normalement (pas de tag apercu-interne) : à la
// différence des lots précédents, il ne s'agit pas d'un contenu de test
// mais d'un reportage effectivement mené par l'utilisateur.
async function seedWaloFestival() {
  const redacteurEnChef = await prisma.staff.findUniqueOrThrow({ where: { email: 'redacteur-en-chef@notrevoienews.com' } });
  const CREDIT = 'Jonas Ouattara';
  const P = {
    crowd: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771032/notre-voie/walo-festival/img_0310.jpg',
    equipe: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771037/notre-voie/walo-festival/img_0361.jpg',
    riviere1: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771040/notre-voie/walo-festival/img_0850.jpg',
    riviere2: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771044/notre-voie/walo-festival/img_0754.jpg',
    foufou: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771048/notre-voie/walo-festival/img_0603.jpg',
    cuisine: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771052/notre-voie/walo-festival/img_0156.jpg',
    feu: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771065/notre-voie/walo-festival/img_0428.jpg',
    foot: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771080/notre-voie/walo-festival/img_0008.jpg',
    dignitaire: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771084/notre-voie/walo-festival/img_0997.jpg',
    doyenne: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771099/notre-voie/walo-festival/img_0069.jpg',
    bois: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771112/notre-voie/walo-festival/img_0192.jpg',
    doyenne2: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771137/notre-voie/walo-festival/img_0903.jpg',
    foule: 'https://res.cloudinary.com/ataat5bs/image/upload/v1787771141/notre-voie/walo-festival/img_1354.jpg',
  };

  const items = [
    {
      slug: 'walo-festival-2026-gragbalilie-3e-edition', rubrique: 'vie-des-regions', imageUneUrl: P.crowd,
      titre: "Walo Festival 2026 : trois jours de fraternité à Gragbalilié",
      chapo: "Du 21 au 23 août, le village de Gragbalilié, dans le département de Lakota, a vécu sa 3ᵉ édition du Walo Festival & Patrimoine Dida — sport, danse traditionnelle et retrouvailles familiales, sous une philosophie assumée : ici, personne ne repart les mains vides.",
      contenuHtml: `<p>Seize kilomètres de piste séparent Gragbalilié de Lakota. C'est au bout de cette route de latérite que le village a organisé, du 21 au 23 août, la 3ᵉ édition du Walo Festival &amp; Patrimoine Dida, sous la présidence de la Mutuelle de Développement de Gragbalilié (MUDG) et de son président, M. Guéyoun Eric Kagba.</p>
<p>Le festival est né d'un geste intime. « Initialement, je voulais honorer la mémoire de mon père parce qu'il travaillait. Et puis, ce à quoi je travaille, mon père n'a jamais eu l'occasion d'en profiter », confie Éric Guéyoun. « Et puis après, j'ai pensé à l'idée de réunir la cohésion sociale. » L'événement puise dans une tradition aujourd'hui disparue, le <em>Dida sa kalimati</em> — des rencontres amicales inter-villages sans enjeu financier, où l'on partageait le riz dans l'esprit de l'hospitalité.</p>
<p>Le premier jour a été marqué par le deuil : la veille de l'ouverture, le parrain de l'événement, M. Gadji Mathieu, a perdu son frère aîné. Une journée de sobriété a été décrétée, la fanfare n'a pas joué. Le lendemain, les délégations des villages invités ont été accueillies sous l'abri à palabre, avant une procession vers la rivière sacrée Zoukou pour un rite d'immersion et de purification.</p>
<p>Le deuxième jour a été celui du tournoi de football intervillage — féminin et masculin, à égalité de trophées — puis d'une soirée animée par une fanfare et un cracheur de feu. Le troisième jour a réuni les troupes de danse traditionnelle maquillées au kaolin blanc, la compétition de Gbanyan-nya et le concours Bangoran, avant la cérémonie de remise des prix.</p>
<p>Le principe fondateur du festival tient en une phrase d'Éric Guéyoun : « Le Walo Festival, ce n'est pas une compétition comme les autres. […] Tout le monde gagne. Il y a une coupe pour le premier, le deuxième, le troisième et même le quatrième. […] Ce ne sont pas de grandes récompenses, mais ce sont des montants symboliques pour faire plaisir à chacun. Pour qu'on tisse des amitiés. »</p>
<p>Pour cette édition, le festival a reçu le soutien d'un premier sponsor institutionnel, la Fondation Dakouri Marius Trésor, ainsi que la présence de délégations de la diaspora venues de Paris et du Canada.</p>`,
      galerie: [
        { url: P.equipe, legende: "L'équipe organisatrice de la MUDG sur scène, lors de la soirée du festival.", credit: CREDIT },
        { url: P.foule, legende: "Public venu assister aux festivités à Gragbalilié.", credit: CREDIT },
      ],
    },
    {
      slug: 'zoukou-riviere-sacree-gragbalilie', rubrique: 'histoire-de-cote-d-ivoire', imageUneUrl: P.riviere1,
      titre: "Le Zoukou, la rivière sacrée qui veille sur Gragbalilié",
      chapo: "À quelques centaines de mètres du village, la rivière Do — appelée localement Zoukou — est un lieu d'immersion rituelle, mais aussi un site chargé d'histoire : les habitants racontent comment leurs ancêtres s'y réfugiaient pendant les guerres tribales et la colonisation.",
      contenuHtml: `<p>La section de la rivière Do qui traverse le territoire de Gragbalilié porte un nom propre : le Zoukou, ou Zuku-Klé en langue Dida, qui signifie « la quantité », « le grand nombre ». Un nom qui rappelle, selon la tradition orale, l'installation d'ancêtres venus en nombre après une longue migration depuis la Basse-Côte.</p>
<p>On n'entre pas dans ce lieu sans précaution. Le rite d'entrée est immuable : la libation, pour invoquer les esprits avant toute activité. Les gardiens du site racontent un épisode survenu lors du nettoyage des abords, peu avant le festival : « La bouteille de liqueur que nous avons déposée, personne ne l'a touchée. Mais elle seule, elle s'est explosée et puis toute la boisson est versée. Donc on a arrêté le travail et on a pris une nouvelle bouteille pour invoquer les esprits. »</p>
<p>Le Zoukou n'est pas seulement un lieu de recueillement. Il occupe une place dans la mémoire des conflits qui ont marqué la région. « Quand on faisait les guerres tribales […], quand nos parents bataillaient, quand ils traversent, ils viennent derrière ici. Les autres ne peuvent plus traverser parce qu'ils ne savent pas nager », racontent les gardiens du lieu. La même stratégie aurait servi pendant la colonisation : « Quand les blancs viennent, c'est la panique. […] Dès qu'ils arrivent ici, le colon se perd. Il ne peut plus les retrouver. »</p>
<p>Les gardiens du Zoukou évoquent aujourd'hui un potentiel touristique, à condition d'encadrer les visites : le site est profond, et un étranger ne doit jamais s'y aventurer seul. « Nous souhaitons qu'avec le soutien d'investisseurs et du ministère du Tourisme, ce site sacré et naturel puisse être aménagé pour accueillir des visiteurs dans le respect de nos traditions. »</p>`,
      galerie: [
        { url: P.riviere2, legende: "Rite d'immersion dans les eaux du Zoukou, lors du premier jour du festival.", credit: CREDIT },
      ],
    },
    {
      slug: 'gbanyan-nya-danse-nee-a-gragbalilie', rubrique: 'showbiz-musique', imageUneUrl: P.doyenne2,
      titre: "Gbanyan-nya : la danse née à Gragbalilié qui a conquis le pays Dida",
      chapo: "Danse acrobatique exécutée au son des tam-tams, le Gbanyan-nya (ou Agba Nye Nye) est aujourd'hui pratiqué dans toute la région Dida. Mais le genre est né à Gragbalilié même, où sa compétition constitue le cœur artistique du Walo Festival.",
      contenuHtml: `<p>Danseurs enduits de kaolin blanc, vêtus du pagne traditionnel kamandjè, exécutant des figures acrobatiques au son lourd des tam-tams : le Gbanyan-nya est, selon les mots d'Éric Guéyoun, « un genre musical créé dans notre village. […] Les gens écoutent ça chez nous. Et tout le monde essaie de le reproduire aujourd'hui. Mais les gens ignorent que c'est venu d'ici. »</p>
<p>Le Chef Douto Dakoury Niadré Benson, Chef central de Gragbalilié, en parle comme d'un héritage familial autant que collectif : « La culture Dida, je ne sais pas, mais c'est un don. Moi qui vous parle, ma maman a été la meilleure chanteuse de tout Lakota. Elle s'appelait Koudou Tato Janette. […] Quand je vais me déshabiller et puis faire la Gbanyan-nya, vous n'allez pas me reconnaître ! »</p>
<p>Au Walo Festival, la compétition de Gbanyan-nya permet de comparer les interprétations des différents villages invités et de désigner les meilleurs groupes — une manière, selon les organisateurs, de faire vivre la tradition devant les jeunes générations plutôt que de la laisser s'éteindre.</p>
<p>L'habillement traditionnel occupe une place centrale dans ces prestations : les hommes portent le pagne d'apparat à l'épaule, les femmes le violacé caractéristique des doyennes du village, agrémenté de colliers de perles.</p>`,
      galerie: [],
    },
    {
      slug: 'sauce-dida-gastronomie-sans-artifice', rubrique: 'gastronomie-maquis', imageUneUrl: P.foufou,
      titre: "La sauce Dida, une gastronomie sans artifice",
      chapo: "Piment écrasé, eau, huile rouge : la sauce Dida authentique, telle que décrite par le Chef de Gragbalilié, se prépare sans oignon, sans tomate et sans condiments industriels. Au Walo Festival, la « consommation publique du foufou » pilé au mortier est un temps fort à part entière.",
      contenuHtml: `<p>« La vraie sauce Dida, vous prenez du piment. Vous l'écrasez bien. Et puis, avec un peu d'eau mélangée. Et on prend de l'huile rouge. Et puis, on te fait une sauce agréable. Il n'y a pas d'huile raffinée dedans. Il n'y a pas de tomate. Il n'y a pas d'oignon. Il n'y a pas de condiments artificiels », décrit le Chef Douto Dakoury Niadré Benson.</p>
<p>Au Walo Festival, cette cuisine se prépare à grande échelle et en public. « On a voulu que ce soit une consommation publique, une préparation à grande échelle », explique Éric Guéyoun, président de la MUDG, qui présente le foufou comme « la nourriture de notre terroir, la nourriture qui est très prisée ».</p>
<p>Dans les cours familiales, le son cadencé des pilons frappant le foufou dans d'imposants mortiers en bois résonne d'une cour à l'autre pendant les trois jours du festival, tandis que les femmes préparent en grandes quantités une sauce claire à l'aubergine, au gombo et aux champignons pour nourrir les délégations des villages invités, hébergées dans les familles du village.</p>`,
      galerie: [
        { url: P.cuisine, legende: "Préparation des repas pour les délégations invitées, dans une cour de Gragbalilié.", credit: CREDIT },
        { url: P.bois, legende: "Réserve de bois pour la cuisson, dans une cour du village.", credit: CREDIT },
      ],
    },
    {
      slug: 'canton-dieco-routes-sante-education-chef-interpelle', rubrique: 'regions', imageUneUrl: P.dignitaire,
      titre: "Routes, santé, éducation : le chef du canton Dieco interpelle l'État",
      chapo: "Chef central de Gragbalilié et chef du canton Dieco, Douto Dakoury Niadré Benson a profité du Walo Festival pour porter devant les caméras les besoins de ses 18 villages : l'enclavement, en premier lieu, mais aussi la santé et l'éducation.",
      contenuHtml: `<p>Gragbalilié se trouve à seize kilomètres de piste de Lakota — trente minutes à deux heures de trajet selon la saison. « Sans route, on ne peut rien faire. Sans route, on ne peut rien faire », insiste le Chef Douto Dakoury Niadré Benson, à la tête du collectif des chefs traditionnels du département de Lakota. « Il y a un côté de mon canton qui vient se plaindre à moi. Et quand je vais voir le patron à Guivo, à Lakota : "Non, on vient demain. Non, on vient après-demain. Ta voiture ne peut pas aller là-bas." »</p>
<p>Son appel au président de la République est direct : « Il a fait beaucoup, mais il reste beaucoup à faire. On va construire un dispensaire nous-mêmes. Il n'est qu'à nous aider à faire la route. »</p>
<p>Le chef salue en revanche un progrès net : l'électrification. Les 18 villages du canton Dieco sont désormais tous raccordés au réseau. « Il n'y a aucun village de mon canton qui est en manque d'électricité. […] On dit vraiment merci au Président de la République. »</p>
<p>Sur l'éducation, deux collèges de proximité ont été construits, à Base 2 et Base 4 — une avancée saluée, mais jugée insuffisante face à l'éloignement de villages comme Béga, Gécoco, Dagobwa ou Dagodou. Sur la santé, l'absence de centre médical reste une urgence : le canton se dit prêt à construire son propre dispensaire, avec ou sans l'aide de l'État.</p>`,
      galerie: [],
    },
    {
      slug: 'fondation-dakouri-marius-tresor-sponsor-walo-festival', rubrique: 'diaspora-ivoire', imageUneUrl: P.doyenne,
      titre: "La Fondation Dakouri Marius Trésor, sponsor officiel du Walo Festival",
      chapo: "Fils de Gragbalilié établi aux États-Unis, Dakouri Marius Trésor a créé il y a deux ans une fondation qui soutient veuves, personnes démunies et projets culturels dans le canton Dieco. Pour sa première participation au Walo Festival, elle en est devenue le sponsor officiel.",
      contenuHtml: `<p>Retenu hors du pays, le fondateur n'a pas pu se déplacer à Gragbalilié : il a été représenté par une délégation de dix personnes venue d'Abidjan, conduite par M. Djessa Attebi Filao, directeur exécutif de la Fondation Dakouri Marius Trésor.</p>
<p>« Très attaché à son canton, il soutient les veuves, les personnes démunies et finance des projets culturels », explique M. Djessa Attebi Filao. La fondation, créée il y a deux ans, a notamment porté secours à des ressortissants de Lakota touchés par les incidents survenus à Abidjan (Koumassi et Port-Bouët), accompagné la Fête des Mères et soutenu plusieurs activités culturelles liées au patrimoine Dida.</p>
<p>Pour cette 3ᵉ édition du Walo Festival, la délégation a assuré la représentation officielle du sponsor durant les trois jours : réceptions protocolaires, présence aux compétitions sportives et culturelles, et participation à la remise des trophées et des enveloppes de soutien.</p>
<p>La fondation affiche une ambition plus large : « Les prochaines éditions, nous allons étendre au mieux le nombre de villages à inviter », indique M. Djessa Attebi Filao, qui évoque aussi un projet de dispensaire pour le canton, sous réserve des autorisations nécessaires auprès du ministère de la Santé.</p>`,
      galerie: [],
    },
  ];

  let crees = 0;
  for (const item of items) {
    const existe = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existe) continue;
    const rubrique = await prisma.rubrique.findUnique({ where: { slug: item.rubrique } });
    if (!rubrique) {
      console.warn(`⚠ Article Walo Festival "${item.slug}" ignoré : rubrique "${item.rubrique}" introuvable.`);
      continue;
    }
    const maintenant = new Date();
    const article = await prisma.article.create({
      data: {
        slug: item.slug, titre: item.titre, chapo: item.chapo, contenuHtml: item.contenuHtml,
        tags: ['walo-festival', 'gragbalilie', 'patrimoine-dida'], format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
        rubriqueId: rubrique.id, auteurId: redacteurEnChef.id, valideParId: redacteurEnChef.id,
        imageUneUrl: item.imageUneUrl, portails: ['INFO_DIRECT'],
        publieLe: maintenant, createdAt: maintenant, updatedAt: maintenant, vuesTotal: 1,
      },
    });
    for (const [i, g] of item.galerie.entries()) {
      await prisma.media.create({ data: { type: 'PHOTO', articleId: article.id, url: g.url, legende: g.legende, credit: g.credit, ordre: i } });
    }
    crees++;
  }
  console.log(`✔ ${crees} article(s) Walo Festival créé(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
