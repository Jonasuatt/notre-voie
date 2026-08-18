const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendExpoPush } = require('../services/expoPush');

// GET /api/notifications — fils "quotidien" / "flash" (public, pour affichage centre de notifications)
const list = asyncHandler(async (req, res) => {
  const { fil, page = 1, pageSize = 30 } = req.query;
  const take = Math.min(Number(pageSize) || 30, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = { envoyeLe: { not: null }, ...(fil ? { fil } : {}) };
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { envoyeLe: 'desc' }, take, skip, include: { article: { select: { slug: true, titre: true, imageUneUrl: true } } } }),
    prisma.notification.count({ where }),
  ]);
  res.json({ notifications, total, page: Number(page), pageSize: take });
});

// POST /api/notifications/:id/envoyer — diffuse une notification en attente
// vers les lecteurs abonnés au fil concerné (Expo Push, app mobile). Le site
// web n'a pas de canal Web Push branché pour l'instant — seule l'app est
// notifiée ; le centre de notifications web lit `GET /api/notifications`.
const envoyer = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
    include: { article: { select: { slug: true } } },
  });
  if (!notification) return res.status(404).json({ error: 'Notification introuvable.' });
  if (notification.envoyeLe) return res.status(409).json({ error: 'Cette notification a déjà été envoyée.' });

  const champPreference = notification.fil === 'FLASH' ? 'notifFlash' : 'notifQuotidien';
  const destinataires = await prisma.reader.findMany({
    where: { isActive: true, pushToken: { not: null }, [champPreference]: true },
    select: { pushToken: true },
  });

  const diffusion = await sendExpoPush(
    destinataires.map((r) => r.pushToken),
    {
      title: notification.titre,
      body: notification.contenu || '',
      data: notification.articleId
        ? { articleId: notification.articleId, articleSlug: notification.article?.slug }
        : {},
    }
  );

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { envoyeLe: new Date() },
  });

  res.json({
    notification: updated,
    diffusion: { destinatairesEligibles: destinataires.length, ...diffusion },
  });
});

module.exports = { list, envoyer };
