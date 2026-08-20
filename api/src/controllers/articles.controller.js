const slugify = require('slugify');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Rôles habilités à valider/publier (chaîne éditoriale, cf. cahier des charges §2.2)
const ROLES_VALIDATION = ['CHEF_SERVICE', 'REDACTEUR_EN_CHEF', 'SECRETAIRE_GENERAL', 'ADMIN'];
const ROLES_PUBLICATION = ['REDACTEUR_EN_CHEF', 'SECRETAIRE_GENERAL', 'ADMIN'];

function uniqueSlug(titre) {
  const base = slugify(titre, { lower: true, strict: true }).slice(0, 80);
  return `${base}-${Date.now().toString(36)}`;
}

// Retire le corps de l'article si le lecteur n'a pas d'accès payant,
// pour appliquer le paywall souple côté API (le client ne doit pas
// avoir à faire confiance à un flag côté front).
async function applyPaywall(article, reader) {
  if (article.paywall === 'LIBRE' || !article) return article;

  if (reader) {
    const abonnementActif = await prisma.abonnement.findFirst({
      where: { readerId: reader.id, statut: 'ACTIF', dateFin: { gte: new Date() } },
    });
    if (abonnementActif) return article;

    const paiementArticle = await prisma.transaction.findFirst({
      where: { readerId: reader.id, articleId: article.id, type: 'PAIEMENT_ARTICLE', statut: 'REUSSI' },
    });
    if (paiementArticle) return article;
  }

  // Accès non débloqué : on renvoie uniquement le teaser (chapo), jamais le corps complet.
  return { ...article, contenuHtml: null, paywallLocked: true };
}

// GET /api/articles — flux public (Une, rubriques, recherche)
const listPublic = asyncHandler(async (req, res) => {
  const { rubrique, format, tag, q, date, dateDebut, dateFin, portail, page = 1, pageSize = 20 } = req.query;
  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  // Archivage par jour de parution — soit une journée précise (?date=2026-08-13),
  // soit une plage (?dateDebut=…&dateFin=…), cf. cahier des charges "recherche
  // par jour, titre/sujet ou rubrique".
  let publieLeFiltre;
  if (date) {
    const debut = new Date(`${date}T00:00:00.000Z`);
    const fin = new Date(`${date}T23:59:59.999Z`);
    publieLeFiltre = { gte: debut, lte: fin };
  } else if (dateDebut || dateFin) {
    publieLeFiltre = {
      ...(dateDebut ? { gte: new Date(`${dateDebut}T00:00:00.000Z`) } : {}),
      ...(dateFin ? { lte: new Date(`${dateFin}T23:59:59.999Z`) } : {}),
    };
  }

  const where = {
    statut: 'PUBLIE',
    ...(rubrique ? { rubrique: { slug: rubrique } } : { rubrique: { type: 'EDITORIALE' } }), // fil général = rubriques éditoriales uniquement ; les rubriques de service (Nécrologie, Test…) ne doivent jamais concurrencer l'actualité en Une, seulement accessibles via leur propre page
    ...(format ? { format } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(portail ? { portails: { has: portail } } : {}), // "QUOTIDIEN" ou "INFO_DIRECT" — cf. cahier des charges, deux rédactions/portails distincts
    ...(publieLeFiltre ? { publieLe: publieLeFiltre } : {}),
    ...(q ? { OR: [{ titre: { contains: q, mode: 'insensitive' } }, { chapo: { contains: q, mode: 'insensitive' } }, { contenuHtml: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publieLe: 'desc' },
      take,
      skip,
      include: { rubrique: true, medias: true, factCheck: true, auteur: { select: { id: true, nom: true, prenom: true, photo: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  res.json({ articles, total, page: Number(page), pageSize: take });
});

// GET /api/articles/:slug — fiche article publique, avec paywall souple
const getBySlug = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { slug: req.params.slug },
    include: {
      rubrique: true,
      rubriquesSecondaires: true,
      medias: true,
      liveUpdates: { orderBy: { horodatage: 'desc' } },
      factCheck: true,
      auteur: { select: { id: true, nom: true, prenom: true, photo: true } },
    },
  });
  if (!article || article.statut !== 'PUBLIE') {
    return res.status(404).json({ error: 'Article introuvable.' });
  }

  const withPaywall = await applyPaywall(article, req.reader);
  res.json({ article: withPaywall });
});

// GET /api/articles/cms — liste rédaction (tous statuts, filtrage par service)
const listCms = asyncHandler(async (req, res) => {
  const { statut, format, rubrique, auteurId, portail, page = 1, pageSize = 30 } = req.query;
  const take = Math.min(Number(pageSize) || 30, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    ...(statut ? { statut } : {}),
    ...(format ? { format } : {}),
    ...(rubrique ? { rubriqueId: rubrique } : {}),
    ...(auteurId ? { auteurId } : {}),
    // Espace de travail choisi dans le CMS (cf. sélecteur de portail) — pour
    // que chaque rédaction ne voie que son propre fil, tout en gardant les
    // contenus partagés (Kiosque, Nécrologie, Photos légendées…) visibles
    // des deux côtés puisqu'ils portent les deux valeurs.
    ...(portail ? { portails: { has: portail } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
      include: { rubrique: true, auteur: { select: { id: true, nom: true, prenom: true } }, validePar: { select: { id: true, nom: true, prenom: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  res.json({ articles, total, page: Number(page), pageSize: take });
});

// GET /api/articles/cms/:id — détail rédaction (tous statuts, sans filtre paywall —
// contrairement à getBySlug qui est réservé aux articles PUBLIE pour le grand public)
const getOneCms = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    include: {
      rubrique: true,
      rubriquesSecondaires: true,
      medias: true,
      liveUpdates: { orderBy: { horodatage: 'desc' } },
      factCheck: true,
      checklist: true,
      auteur: { select: { id: true, nom: true, prenom: true } },
      validePar: { select: { id: true, nom: true, prenom: true } },
    },
  });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  res.json({ article });
});

// POST /api/articles — création d'un brouillon (CMS 2, tout rôle rédaction)
const create = asyncHandler(async (req, res) => {
  const { titre, chapo, contenuHtml, format, rubriqueId, rubriquesSecondairesIds, paywall, tags, imageUneUrl, portails } = req.body;
  if (!titre || !rubriqueId) {
    return res.status(422).json({ error: 'Titre et rubrique sont requis.' });
  }

  const article = await prisma.article.create({
    data: {
      titre,
      slug: uniqueSlug(titre),
      chapo,
      contenuHtml,
      format: format || 'EDITION',
      paywall: paywall || 'LIBRE',
      tags: tags || [],
      imageUneUrl,
      rubriqueId,
      auteurId: req.staff.id,
      // Portail(s) de diffusion — Le Quotidien et/ou Info en direct (cf. §
      // "deux rédactions"). Par défaut QUOTIDIEN seul (cf. schema.prisma) si
      // la rédaction ne précise rien.
      ...(portails && portails.length ? { portails } : {}),
      ...(rubriquesSecondairesIds && rubriquesSecondairesIds.length
        ? { rubriquesSecondaires: { connect: rubriquesSecondairesIds.map((id) => ({ id })) } }
        : {}),
      // La checklist de vérification est obligatoire pour Flash et Vérité ou Intox (cf. cahier des charges §2.2)
      ...((format === 'FLASH' || format === 'VERITE_OU_INTOX')
        ? {
            checklist: {
              create: [
                { libelle: 'Source primaire identifiée' },
                { libelle: 'Deuxième source recoupée' },
                { libelle: "Auteur/média d'origine du contenu vérifié" },
              ],
            },
          }
        : {}),
    },
    include: { rubrique: true, checklist: true },
  });

  res.status(201).json({ article });
});

// PATCH /api/articles/:id — édition (auteur ou hiérarchie éditoriale)
const update = asyncHandler(async (req, res) => {
  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Article introuvable.' });

  const estAuteur = existing.auteurId === req.staff.id;
  const peutEditerAutrui = ROLES_VALIDATION.includes(req.staff.role);
  if (!estAuteur && !peutEditerAutrui) {
    return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres articles." });
  }
  if (existing.statut === 'PUBLIE' && !peutEditerAutrui) {
    return res.status(403).json({ error: 'Un article publié ne peut être modifié que par la hiérarchie éditoriale.' });
  }

  const { titre, chapo, contenuHtml, format, rubriqueId, rubriquesSecondairesIds, paywall, tags, imageUneUrl, datePublicationPrevue, portails } = req.body;

  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      titre,
      chapo,
      contenuHtml,
      format,
      paywall,
      tags,
      imageUneUrl,
      rubriqueId,
      portails,
      datePublicationPrevue: datePublicationPrevue ? new Date(datePublicationPrevue) : undefined,
      ...(rubriquesSecondairesIds
        ? { rubriquesSecondaires: { set: rubriquesSecondairesIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { rubrique: true },
  });

  res.json({ article });
});

// POST /api/articles/:id/soumettre — BROUILLON → EN_RELECTURE
const soumettre = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.auteurId !== req.staff.id) return res.status(403).json({ error: "Seul l'auteur peut soumettre l'article." });
  if (article.statut !== 'BROUILLON') return res.status(409).json({ error: 'Seul un brouillon peut être soumis.' });

  const updated = await prisma.article.update({ where: { id: article.id }, data: { statut: 'EN_RELECTURE' } });
  res.json({ article: updated });
});

// POST /api/articles/:id/valider — EN_RELECTURE → VALIDE (chef de service+)
const valider = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id }, include: { checklist: true } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.statut !== 'EN_RELECTURE') return res.status(409).json({ error: 'Seul un article en relecture peut être validé.' });

  const checklistIncomplete = article.checklist.some((item) => !item.verifie);
  if (checklistIncomplete) {
    return res.status(409).json({ error: 'La checklist de vérification doit être complétée avant validation.' });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { statut: 'VALIDE', valideParId: req.staff.id },
  });
  res.json({ article: updated });
});

// POST /api/articles/:id/publier — VALIDE → PUBLIE (rédacteur en chef+)
const publier = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.statut !== 'VALIDE') return res.status(409).json({ error: 'Seul un article validé peut être publié.' });

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { statut: 'PUBLIE', publieLe: new Date() },
  });

  // Flash et Vérité ou Intox déclenchent le fil "flash" (info urgente),
  // les autres formats alimentent le fil "quotidien".
  await prisma.notification.create({
    data: {
      titre: updated.titre,
      contenu: updated.chapo,
      fil: updated.format === 'FLASH' || updated.format === 'VERITE_OU_INTOX' ? 'FLASH' : 'QUOTIDIEN',
      articleId: updated.id,
    },
  });

  res.json({ article: updated });
});

// POST /api/articles/:id/depublier
const depublier = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { statut: 'DEPUBLIE', depublieLe: new Date() },
  });
  res.json({ article });
});

// POST /api/articles/:id/live — ajout d'une mise à jour (format LIVE, badge DIRECT)
const ajouterLiveUpdate = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.format !== 'LIVE') return res.status(409).json({ error: "Cette action n'est disponible que pour le format Live." });

  const { contenu } = req.body;
  if (!contenu) return res.status(422).json({ error: 'Contenu requis.' });

  const liveUpdate = await prisma.liveUpdate.create({
    data: { contenu, articleId: article.id, auteurId: req.staff.id },
  });
  res.status(201).json({ liveUpdate });
});

// PATCH /api/articles/:articleId/checklist/:itemId — coche un point de la checklist avant publication
const cocherChecklist = asyncHandler(async (req, res) => {
  const item = await prisma.checklistItem.update({
    where: { id: req.params.itemId },
    data: { verifie: true, verifieLe: new Date(), verifieParId: req.staff.id },
  });
  res.json({ item });
});

// POST /api/articles/:id/vue — journalise une lecture (temps réel côté rédaction)
const enregistrerVue = asyncHandler(async (req, res) => {
  const { source } = req.body;
  await prisma.$transaction([
    prisma.articleVue.create({
      data: { articleId: req.params.id, readerId: req.reader ? req.reader.id : null, source, region: req.reader ? req.reader.region : null },
    }),
    prisma.article.update({ where: { id: req.params.id }, data: { vuesTotal: { increment: 1 } } }),
  ]);
  res.status(204).end();
});

module.exports = {
  ROLES_VALIDATION,
  ROLES_PUBLICATION,
  listPublic,
  getBySlug,
  listCms,
  getOneCms,
  create,
  update,
  soumettre,
  valider,
  publier,
  depublier,
  ajouterLiveUpdate,
  cocherChecklist,
  enregistrerVue,
};
