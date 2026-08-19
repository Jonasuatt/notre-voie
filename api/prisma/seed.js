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

// Rubriques de service — cf. cahier des charges §3.2
const RUBRIQUES_SERVICE = [
  { nom: 'Photos légendées', angleEditorial: "Reportages et événements racontés en images, chaque photo légendée et créditée" },
  { nom: 'Vidéos', angleEditorial: "Toutes les vidéos courtes et les directs regroupés dans un seul flux dédié" },
  { nom: 'Audio / Podcasts', angleEditorial: "Articles écoutés, interviews, journal parlé quotidien" },
  { nom: 'Archives / Kiosque numérique', angleEditorial: "Éditions précédentes du journal consultables en PDF, articles archivés par date et par rubrique" },
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
  ordre = 0;
  for (const r of RUBRIQUES_SERVICE) {
    await prisma.rubrique.upsert({
      where: { slug: slugify(r.nom) },
      update: {},
      create: { ...r, slug: slugify(r.nom), type: 'SERVICE', ordre: ordre++ },
    });
  }
  console.log(`✔ ${RUBRIQUES_EDITORIALES.length + RUBRIQUES_SERVICE.length} rubriques créées/à jour.`);
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

async function main() {
  await seedRubriques();
  await seedStaff();
  const dejaDesReleves = await prisma.prixVieChere.count();
  if (dejaDesReleves === 0) await seedPrixVieChere();
  const dejaDesArticles = await prisma.article.count();
  if (dejaDesArticles === 0) await seedArticles();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
