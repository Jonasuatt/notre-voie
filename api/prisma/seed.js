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

async function main() {
  await seedRubriques();
  await seedStaff();
  const dejaDesReleves = await prisma.prixVieChere.count();
  if (dejaDesReleves === 0) await seedPrixVieChere();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
