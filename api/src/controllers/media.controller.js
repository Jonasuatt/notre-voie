const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Médiathèque (CMS 2 — illustration des articles) : photos légendées,
// galeries, vidéos et audios. Un Media sans articleId est un élément
// "en stock" dans la photothèque, réutilisable sur plusieurs articles ;
// une fois rattaché (articleId renseigné), il illustre cet article
// précis — cf. cahier des charges §1.1 (Photos légendées / Vidéos /
// Audio) et §3 (Galerie photo légendée, module transversal).

const MIME_TO_TYPE = { image: 'PHOTO', video: 'VIDEO', audio: 'AUDIO', application: 'PDF' };
const RESOURCE_TYPE = { PHOTO: 'image', VIDEO: 'video', AUDIO: 'video', PDF: 'raw' }; // Cloudinary route l'audio via "video"

function inferType(mimetype = '') {
  const kind = mimetype.split('/')[0];
  return MIME_TO_TYPE[kind] || 'PHOTO';
}

// POST /api/media/upload — dépose un fichier (photo, vidéo, audio, PDF)
// sur Cloudinary et crée l'entrée Media correspondante. `articleId` est
// optionnel : omis, le média rejoint la photothèque libre.
const upload = asyncHandler(async (req, res) => {
  if (!isConfigured) {
    return res.status(503).json({ error: "Hébergement média non configuré (variables CLOUDINARY_* manquantes sur l'API)." });
  }
  if (!req.file) return res.status(422).json({ error: 'Aucun fichier reçu.' });

  const type = req.body.type && ['PHOTO', 'VIDEO', 'AUDIO', 'PDF'].includes(req.body.type) ? req.body.type : inferType(req.file.mimetype);
  const { articleId, legende, credit, ordre } = req.body;

  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: RESOURCE_TYPE[type], folder: `notre-voie/${type.toLowerCase()}` },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  const media = await prisma.media.create({
    data: {
      type,
      url: uploaded.secure_url,
      legende: legende || null,
      credit: credit || null,
      dureeSec: uploaded.duration ? Math.round(uploaded.duration) : null,
      ordre: ordre ? Number(ordre) : 0,
      ...(articleId ? { article: { connect: { id: articleId } } } : {}),
    },
  });
  res.status(201).json({ media });
});

// POST /api/media — rattache un média déjà hébergé ailleurs (lien YouTube,
// Facebook, SoundCloud, PDF externe…) sans passer par l'upload Cloudinary.
// Utile pour la vidéo/l'audio quand la rédaction préfère intégrer un lien
// existant plutôt que réhéberger un gros fichier.
const create = asyncHandler(async (req, res) => {
  const { type, url, legende, credit, articleId, dureeSec, ordre } = req.body;
  if (!type || !['PHOTO', 'VIDEO', 'AUDIO', 'PDF'].includes(type)) return res.status(422).json({ error: 'Type de média invalide.' });
  if (!url) return res.status(422).json({ error: 'URL requise.' });

  const media = await prisma.media.create({
    data: {
      type,
      url,
      legende: legende || null,
      credit: credit || null,
      dureeSec: dureeSec ? Number(dureeSec) : null,
      ordre: ordre ? Number(ordre) : 0,
      ...(articleId ? { article: { connect: { id: articleId } } } : {}),
    },
  });
  res.status(201).json({ media });
});

// GET /api/media — photothèque/médiathèque : parcours et recherche.
// ?unattached=true ne retourne que les médias pas encore liés à un article
// (le "stock" à piocher pour illustrer un nouvel article).
const list = asyncHandler(async (req, res) => {
  const { type, q, unattached, articleId, page = 1, pageSize = 40 } = req.query;
  const take = Math.min(Number(pageSize) || 40, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    ...(type ? { type } : {}),
    ...(unattached === 'true' ? { articleId: null } : {}),
    ...(articleId ? { articleId } : {}),
    ...(q ? { OR: [{ legende: { contains: q, mode: 'insensitive' } }, { credit: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  const [medias, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: [{ createdAt: 'desc' }], take, skip }),
    prisma.media.count({ where }),
  ]);
  res.json({ medias, total, page: Number(page), pageSize: take });
});

// PATCH /api/media/:id — légende, crédit, rattachement/détachement à un
// article, position dans une galerie (ordre).
const update = asyncHandler(async (req, res) => {
  const { legende, credit, ordre, articleId, dureeSec } = req.body;
  const media = await prisma.media.update({
    where: { id: req.params.id },
    data: {
      ...(legende !== undefined ? { legende } : {}),
      ...(credit !== undefined ? { credit } : {}),
      ...(ordre !== undefined ? { ordre: Number(ordre) } : {}),
      ...(dureeSec !== undefined ? { dureeSec: dureeSec === null ? null : Number(dureeSec) } : {}),
      ...(articleId !== undefined ? (articleId ? { article: { connect: { id: articleId } } } : { article: { disconnect: true } }) : {}),
    },
  });
  res.json({ media });
});

// PATCH /api/media/reorder — réordonne une galerie d'un seul geste
// (ids dans l'ordre d'affichage voulu).
const reorder = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(422).json({ error: 'Liste ids requise.' });
  await prisma.$transaction(ids.map((mediaId, index) => prisma.media.update({ where: { id: mediaId }, data: { ordre: index } })));
  res.json({ ok: true });
});

// DELETE /api/media/:id
const remove = asyncHandler(async (req, res) => {
  await prisma.media.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = { upload, create, list, update, reorder, remove };
