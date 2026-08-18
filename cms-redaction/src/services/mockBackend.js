// Backend simulé en mémoire — s'active automatiquement quand l'API réelle
// (notre-voie-api) est injoignable (pas encore déployée / pas de base
// Postgres dans cet environnement). Reproduit le contrat exact de l'API
// (mêmes formes de réponse, mêmes règles de rôle et de workflow) pour que
// la démo du CMS soit fidèle, et pour qu'aucun code ne change une fois la
// vraie API branchée. Voir docs/DECISIONS.md.
//
// Mot de passe du mode simulé LOCAL uniquement — sans rapport avec les vrais
// comptes de prisma/seed.js (qui ont chacun un mot de passe individuel
// régénéré, cf. docs/DECISIONS.md #27). Ce mock ne parle à aucune base
// réelle, ce mot de passe n'a donc aucune valeur à protéger.
const DEMO_PASSWORD = 'demo-local-uniquement';

export const MOCK_STAFF = [
  { id: 's1', email: 'admin@notrevoienews.com', nom: 'Gnépa', prenom: 'Barthélémy', role: 'ADMIN', service: 'Direction' },
  { id: 's2', email: 'redacteur-en-chef@notrevoienews.com', nom: 'Bédé', prenom: 'Charles', role: 'REDACTEUR_EN_CHEF', service: 'Rédaction' },
  { id: 's3', email: 'secretaire-general@notrevoienews.com', nom: 'Coulibaly', prenom: 'Zié Oumar', role: 'SECRETAIRE_GENERAL', service: 'Rédaction' },
  { id: 's4', email: 'chef-politique@notrevoienews.com', nom: 'Koré', prenom: 'Benjamin', role: 'CHEF_SERVICE', service: 'Politique & Régions' },
  { id: 's5', email: 'chef-culture@notrevoienews.com', nom: 'Gomon', prenom: 'Edmond', role: 'CHEF_SERVICE', service: 'Culture' },
  { id: 's6', email: 'regie@notrevoienews.com', nom: 'Akho', prenom: 'Claude', role: 'REGIE', service: 'Commercial & Marketing' },
  { id: 's7', email: 'redacteur@notrevoienews.com', nom: 'Zébé', prenom: 'Arthur', role: 'REDACTEUR', service: 'Sport' },
];

const RUBRIQUES = [
  { id: 'r1', slug: 'politique', nom: 'Politique', type: 'EDITORIALE', couleur: '#0B6FA8' },
  { id: 'r2', slug: 'refondation', nom: 'Refondation', type: 'EDITORIALE', couleur: '#0E8FD6' },
  { id: 'r3', slug: 'economie', nom: 'Économie', type: 'EDITORIALE', couleur: '#0B6FA8' },
  { id: 'r4', slug: 'vie-chere', nom: 'Vie chère', type: 'EDITORIALE', couleur: '#E6008C' },
  { id: 'r5', slug: 'societe', nom: 'Société', type: 'EDITORIALE', couleur: '#0B6FA8' },
  { id: 'r6', slug: 'regions', nom: 'Régions', type: 'EDITORIALE', couleur: '#0B6FA8' },
  { id: 'r7', slug: 'diaspora', nom: 'Diaspora', type: 'EDITORIALE', couleur: '#E8B84B' },
  { id: 'r8', slug: 'culture', nom: 'Culture', type: 'EDITORIALE', couleur: '#E6008C' },
  { id: 'r9', slug: 'sport', nom: 'Sport', type: 'EDITORIALE', couleur: '#0B6FA8' },
  { id: 'r10', slug: 'verite-ou-intox', nom: 'Vérité ou Intox', type: 'EDITORIALE', couleur: '#E8B84B' },
  { id: 'r11', slug: 'photos-legendees', nom: 'Photos légendées', type: 'SERVICE' },
  { id: 'r12', slug: 'videos', nom: 'Vidéos', type: 'SERVICE' },
];

function il(n) {
  return new Date(Date.now() - n * 60000).toISOString();
}
function staffRef(id) {
  const s = MOCK_STAFF.find((x) => x.id === id);
  return s ? { id: s.id, nom: s.nom, prenom: s.prenom } : null;
}

let ARTICLES = [
  {
    id: 'a1', slug: 'flash-delegation-cedeao', titre: 'Une délégation de la CEDEAO attendue à Abidjan', chapo: 'Information confirmée par le protocole d\'État.',
    contenuHtml: '<p>Suivi en cours.</p>', tags: ['CEDEAO'], format: 'FLASH', statut: 'EN_RELECTURE', paywall: 'LIBRE',
    rubriqueId: 'r1', auteurId: 's7', valideParId: null, imageUneUrl: null, dureeEcouteSec: null, vuesTotal: 340,
    publieLe: null, updatedAt: il(30), createdAt: il(60),
    checklist: [
      { id: 'c1', libelle: 'Source primaire identifiée', verifie: true, verifieParId: 's7' },
      { id: 'c2', libelle: 'Deuxième source recoupée', verifie: false, verifieParId: null },
      { id: 'c3', libelle: "Auteur/média d'origine du contenu vérifié", verifie: false, verifieParId: null },
    ],
    liveUpdates: [], factCheck: null, rubriquesSecondaires: [],
  },
  {
    id: 'a2', slug: 'vie-chere-riz-hausse', titre: 'Le prix du sac de riz importé repart à la hausse', chapo: "Après plusieurs semaines de stabilité.",
    contenuHtml: '<p>Sur le marché de gros, les grossistes constatent la même tendance.</p>', tags: ['riz'], format: 'EDITION', statut: 'PUBLIE', paywall: 'LIBRE',
    rubriqueId: 'r4', auteurId: 's4', valideParId: 's2', imageUneUrl: null, dureeEcouteSec: 95, vuesTotal: 12300,
    publieLe: il(320), updatedAt: il(320), createdAt: il(400),
    checklist: [], liveUpdates: [], factCheck: null, rubriquesSecondaires: [],
  },
  {
    id: 'a3', slug: 'live-finale-championnat', titre: 'Finale du championnat : suivez la rencontre', chapo: 'Notre Voie couvre en direct.',
    contenuHtml: '<p>Coup d\'envoi donné.</p>', tags: ['football'], format: 'LIVE', statut: 'PUBLIE', paywall: 'LIBRE',
    rubriqueId: 'r9', auteurId: 's7', valideParId: 's2', imageUneUrl: null, dureeEcouteSec: null, vuesTotal: 8900,
    publieLe: il(38), updatedAt: il(4), createdAt: il(40),
    checklist: [],
    liveUpdates: [
      { id: 'lu1', contenu: "45e minute : la première période s'achève sur un score nul et vierge.", horodatage: il(4), auteurId: 's7' },
      { id: 'lu2', contenu: "Coup d'envoi de la rencontre.", horodatage: il(38), auteurId: 's7' },
    ],
    factCheck: null, rubriquesSecondaires: [],
  },
  {
    id: 'a4', slug: 'brouillon-korhogo-marche', titre: 'Korhogo inaugure son nouveau marché couvert', chapo: 'Attendue depuis trois ans.',
    contenuHtml: '', tags: [], format: 'EDITION', statut: 'BROUILLON', paywall: 'LIBRE',
    rubriqueId: 'r6', auteurId: 's7', valideParId: null, imageUneUrl: null, dureeEcouteSec: null, vuesTotal: 0,
    publieLe: null, updatedAt: il(10), createdAt: il(10),
    checklist: [], liveUpdates: [], factCheck: null, rubriquesSecondaires: [],
  },
];

let PRIX = [
  { id: 'p1', produit: 'Riz (sac 50kg)', unite: 'sac', prix: 22500, variationPct: 1.8, dateReleve: il(200) },
  { id: 'p2', produit: 'Huile végétale', unite: 'litre', prix: 1450, variationPct: -0.5, dateReleve: il(200) },
  { id: 'p3', produit: 'Essence', unite: 'litre', prix: 890, variationPct: 0, dateReleve: il(200) },
];

let EDITIONS = [
  { id: 'e1', numero: 7970, dateParution: il(1440), pdfUrl: '#', couvertureUrl: null, prix: 300 },
  { id: 'e2', numero: 7969, dateParution: il(2880), pdfUrl: '#', couvertureUrl: null, prix: 300 },
];

function fail(status, message) {
  const e = new Error(message);
  e.response = { status, data: { error: message } };
  throw e;
}

function currentStaffId() {
  const token = localStorage.getItem('nv_staff_token');
  if (!token || !token.startsWith('mock.')) return null;
  return token.slice(5);
}
function currentStaff() {
  const id = currentStaffId();
  return MOCK_STAFF.find((s) => s.id === id) || null;
}

function withRefs(a) {
  return {
    ...a,
    rubrique: RUBRIQUES.find((r) => r.id === a.rubriqueId) || null,
    rubriquesSecondaires: a.rubriquesSecondaires || [],
    auteur: staffRef(a.auteurId),
    validePar: a.valideParId ? staffRef(a.valideParId) : null,
  };
}

export const mockBackend = {
  login(email, motDePasse) {
    const s = MOCK_STAFF.find((x) => x.email === email);
    if (!s || motDePasse !== DEMO_PASSWORD) fail(401, 'Identifiants incorrects.');
    return { token: `mock.${s.id}`, staff: s };
  },
  getMe() {
    const s = currentStaff();
    if (!s) fail(401, 'Authentification requise.');
    return { staff: s };
  },
  getRubriques(type) {
    return { rubriques: type ? RUBRIQUES.filter((r) => r.type === type) : RUBRIQUES };
  },
  listCms({ statut, format, rubrique, auteurId } = {}) {
    let list = ARTICLES.filter((a) =>
      (!statut || a.statut === statut) &&
      (!format || a.format === format) &&
      (!rubrique || a.rubriqueId === rubrique) &&
      (!auteurId || a.auteurId === auteurId)
    );
    list = [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return { articles: list.map(withRefs), total: list.length };
  },
  getById(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    return { article: withRefs(a) };
  },
  create(data) {
    const staff = currentStaff();
    if (!staff) fail(401, 'Authentification requise.');
    if (!data.titre || !data.rubriqueId) fail(422, 'Titre et rubrique sont requis.');
    const id = `a${Date.now()}`;
    const article = {
      id, slug: `${data.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      titre: data.titre, chapo: data.chapo || '', contenuHtml: data.contenuHtml || '',
      format: data.format || 'EDITION', statut: 'BROUILLON', paywall: data.paywall || 'LIBRE',
      tags: data.tags || [], imageUneUrl: data.imageUneUrl || null, rubriqueId: data.rubriqueId,
      rubriquesSecondaires: (data.rubriquesSecondairesIds || []).map((rid) => RUBRIQUES.find((r) => r.id === rid)).filter(Boolean),
      auteurId: staff.id, valideParId: null, vuesTotal: 0, publieLe: null,
      datePublicationPrevue: data.datePublicationPrevue || null,
      updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
      checklist: (data.format === 'FLASH' || data.format === 'VERITE_OU_INTOX')
        ? [
            { id: `c${Date.now()}-1`, libelle: 'Source primaire identifiée', verifie: false },
            { id: `c${Date.now()}-2`, libelle: 'Deuxième source recoupée', verifie: false },
            { id: `c${Date.now()}-3`, libelle: "Auteur/média d'origine du contenu vérifié", verifie: false },
          ]
        : [],
      liveUpdates: [], factCheck: null,
    };
    ARTICLES = [article, ...ARTICLES];
    return { article: withRefs(article) };
  },
  update(id, data) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    Object.assign(a, {
      ...(data.titre !== undefined ? { titre: data.titre } : {}),
      ...(data.chapo !== undefined ? { chapo: data.chapo } : {}),
      ...(data.contenuHtml !== undefined ? { contenuHtml: data.contenuHtml } : {}),
      ...(data.format !== undefined ? { format: data.format } : {}),
      ...(data.paywall !== undefined ? { paywall: data.paywall } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.imageUneUrl !== undefined ? { imageUneUrl: data.imageUneUrl } : {}),
      ...(data.rubriqueId !== undefined ? { rubriqueId: data.rubriqueId } : {}),
      ...(data.datePublicationPrevue !== undefined ? { datePublicationPrevue: data.datePublicationPrevue } : {}),
      updatedAt: new Date().toISOString(),
    });
    return { article: withRefs(a) };
  },
  soumettre(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    if (a.statut !== 'BROUILLON') fail(409, 'Seul un brouillon peut être soumis.');
    a.statut = 'EN_RELECTURE'; a.updatedAt = new Date().toISOString();
    return { article: withRefs(a) };
  },
  valider(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    if (a.statut !== 'EN_RELECTURE') fail(409, 'Seul un article en relecture peut être validé.');
    if (a.checklist.some((c) => !c.verifie)) fail(409, 'La checklist de vérification doit être complétée avant validation.');
    const staff = currentStaff();
    a.statut = 'VALIDE'; a.valideParId = staff?.id; a.updatedAt = new Date().toISOString();
    return { article: withRefs(a) };
  },
  publier(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    if (a.statut !== 'VALIDE') fail(409, 'Seul un article validé peut être publié.');
    a.statut = 'PUBLIE'; a.publieLe = new Date().toISOString(); a.updatedAt = new Date().toISOString();
    return { article: withRefs(a) };
  },
  depublier(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    a.statut = 'DEPUBLIE'; a.updatedAt = new Date().toISOString();
    return { article: withRefs(a) };
  },
  ajouterLiveUpdate(id, contenu) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) fail(404, 'Article introuvable.');
    if (a.format !== 'LIVE') fail(409, "Cette action n'est disponible que pour le format Live.");
    const staff = currentStaff();
    const update = { id: `lu${Date.now()}`, contenu, horodatage: new Date().toISOString(), auteurId: staff?.id };
    a.liveUpdates = [update, ...a.liveUpdates];
    a.updatedAt = new Date().toISOString();
    return { liveUpdate: update };
  },
  cocherChecklist(articleId, itemId) {
    const a = ARTICLES.find((x) => x.id === articleId);
    if (!a) fail(404, 'Article introuvable.');
    const item = a.checklist.find((c) => c.id === itemId);
    if (!item) fail(404, 'Élément de checklist introuvable.');
    item.verifie = true;
    return { item };
  },
  creerFactCheck(articleId, data) {
    const a = ARTICLES.find((x) => x.id === articleId);
    if (!a) fail(404, 'Article introuvable.');
    if (a.format !== 'VERITE_OU_INTOX') fail(409, "Le fact-check ne s'applique qu'au format Vérité ou Intox.");
    a.factCheck = { ...data, articleId };
    return { factCheck: a.factCheck };
  },
  ticker() {
    return { prix: [...PRIX].sort((a, b) => new Date(b.dateReleve) - new Date(a.dateReleve)) };
  },
  createPrix(data) {
    const releve = { id: `p${Date.now()}`, dateReleve: new Date().toISOString(), ...data };
    PRIX = [releve, ...PRIX];
    return { releve };
  },
  editionsGetAll() {
    return { editions: [...EDITIONS].sort((a, b) => b.numero - a.numero) };
  },
  editionsCreate(data) {
    const edition = { id: `e${Date.now()}`, ...data };
    EDITIONS = [edition, ...EDITIONS];
    return { edition };
  },
};
