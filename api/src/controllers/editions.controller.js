const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Gabarit de pagination du journal — constaté de façon identique sur les 10
// numéros déjà archivés (page 1 = citation du jour/Une, 2-3 = Politique,
// 4 = Économie, 5 = Culture, 6 = Société, 7 = Régions, 8 = Sport). Sert de
// rubriquage par défaut à l'archivage automatique d'un nouveau numéro ; si
// la maquette change un jour, seules les pages hors gabarit resteront sans
// rubrique assignée (jamais une rubrique devinée au hasard).
const GABARIT_PAGES = {
  2: ['politique'], 3: ['politique'], 4: ['economie'], 5: ['culture'], 6: ['societe'], 7: ['regions'], 8: ['sport'],
};

// Retrouve le public_id Cloudinary à partir de l'URL sécurisée renvoyée à
// l'upload (…/image/upload/v123456/notre-voie/pdf/xxxxx.pdf -> notre-voie/pdf/xxxxx).
function publicIdDepuisUrl(url) {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return m ? m[1] : null;
}

// Archive chaque page du PDF en image (une par page, via la transformation
// Cloudinary pg_N) et lui associe la rubrique du gabarit ci-dessus. Best
// effort : si Cloudinary n'est pas configuré ou que la lecture des pages
// échoue, l'édition reste créée sans page — le PDF complet reste consultable.
async function archiverPagesDuNumero(edition, pdfUrl) {
  if (!isConfigured) return;
  const publicId = publicIdDepuisUrl(pdfUrl);
  if (!publicId) return;

  try {
    const info = await cloudinary.api.resource(publicId, { resource_type: 'image', pages: true });
    const nbPages = info.pages || 1;

    for (let n = 1; n <= nbPages; n++) {
      const imageUrl = cloudinary.url(publicId, { resource_type: 'image', page: n, format: 'jpg', secure: true, transformation: [{ quality: 'auto' }] });
      await prisma.editionPage.upsert({
        where: { editionId_numeroPage: { editionId: edition.id, numeroPage: n } },
        update: {},
        create: { editionId: edition.id, numeroPage: n, imageUrl, rubriques: GABARIT_PAGES[n] || [] },
      });
    }
  } catch (err) {
    console.error('Archivage automatique des pages impossible :', err.message);
  }
}

// GET /api/editions — kiosque numérique (public). `pdfUrl` et `codeAcces`
// sont volontairement exclus : le PDF n'est plus accessible qu'après avoir
// saisi le code abonné, via POST /:id/deverrouiller (cf. plus bas) — sinon
// n'importe qui pourrait lire l'URL directement dans la réponse de l'API.
const list = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [editions, total] = await Promise.all([
    prisma.edition.findMany({
      orderBy: { dateParution: 'desc' },
      take,
      skip,
      select: {
        id: true, numero: true, dateParution: true, dateFin: true, couvertureUrl: true, prix: true, createdAt: true,
        // A-t-elle un code configuré ? (booléen dérivé, sans révéler le PDF)
        codeAcces: true,
        // Pages du numéro (image + rubrique réellement traitée sur cette
        // page) — affichées sur l'accueil du Quotidien et dans chaque
        // rubrique, cf. §"pages du journal".
        pages: { orderBy: { numeroPage: 'asc' } },
      },
    }),
    prisma.edition.count(),
  ]);
  // On ne renvoie qu'un booléen "verrouillable", jamais le code lui-même.
  const editionsPublic = editions.map(({ codeAcces, ...e }) => ({ ...e, verrouille: Boolean(codeAcces) }));
  res.json({ editions: editionsPublic, total, page: Number(page), pageSize: take });
});

// POST /api/editions/:id/deverrouiller — saisie du code abonné pour
// débloquer le PDF complet d'un numéro. Pas de compte lecteur requis pour
// l'instant (le code, communiqué aux abonnés par la rédaction/régie, est
// la seule clé) — cf. note à l'utilisateur sur l'étape suivante possible
// (rattacher ce contrôle à un vrai compte abonné une fois l'authentification
// lecteur branchée côté site public).
const deverrouiller = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const edition = await prisma.edition.findUnique({ where: { id: req.params.id } });
  if (!edition) return res.status(404).json({ error: 'Édition introuvable.' });

  if (!edition.codeAcces) {
    return res.status(403).json({ error: "Le PDF de ce numéro n'est pas disponible en téléchargement." });
  }
  if (!code || code.trim().toUpperCase() !== edition.codeAcces.trim().toUpperCase()) {
    return res.status(403).json({ error: 'Code invalide.' });
  }
  res.json({ pdfUrl: edition.pdfUrl });
});

// POST /api/editions — CMS 2, mise en ligne du PDF de l'édition papier.
// `dateFin` optionnelle : numéro couvrant plusieurs jours (week-end, jour
// férié), ex. "du vendredi au dimanche".
const create = asyncHandler(async (req, res) => {
  const { numero, dateParution, dateFin, pdfUrl, couvertureUrl, prix, codeAcces } = req.body;
  if (!numero || !dateParution || !pdfUrl) {
    return res.status(422).json({ error: 'Numéro, date de parution et PDF sont requis.' });
  }
  const edition = await prisma.edition.create({
    data: {
      numero: Number(numero),
      dateParution: new Date(dateParution),
      dateFin: dateFin ? new Date(dateFin) : null,
      pdfUrl,
      couvertureUrl,
      prix: prix ? Number(prix) : undefined,
      codeAcces: codeAcces || null,
    },
  });

  // Archivage automatique des pages (image par page + rubrique du gabarit) —
  // le numéro reste consultable même si cette étape échoue, elle ne bloque
  // donc pas la réponse ; les pages apparaîtront dès qu'elle aura réussi.
  archiverPagesDuNumero(edition, pdfUrl).catch(() => {});

  res.status(201).json({ edition });
});

module.exports = { list, create, deverrouiller };
