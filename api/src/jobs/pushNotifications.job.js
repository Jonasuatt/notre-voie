// Job périodique : diffuse automatiquement les notifications créées mais pas
// encore envoyées (cf. docs/DECISIONS.md #6 — l'événement éditorial est
// séparé de la diffusion technique). Un clic manuel via
// `POST /api/notifications/:id/envoyer` reste possible et prioritaire ;
// ce job est un filet de sécurité qui rattrape tout ce qui n'a pas été
// envoyé à la main, sans bloquer la publication d'un article si le service
// de push est momentanément indisponible.
const cron = require('node-cron');
const prisma = require('../config/prisma');
const { sendExpoPush } = require('../services/expoPush');

async function diffuserNotificationsEnAttente() {
  const enAttente = await prisma.notification.findMany({
    where: { envoyeLe: null },
    include: { article: { select: { slug: true } } },
    orderBy: { createdAt: 'asc' },
    take: 20, // limite un run à un volume raisonnable ; le reste passera au prochain tick
  });

  for (const notification of enAttente) {
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

    await prisma.notification.update({
      where: { id: notification.id },
      data: { envoyeLe: new Date() },
    });

    console.log(
      `✔ Notification "${notification.titre}" diffusée (${diffusion.envoyes} envoyées, ${diffusion.echecs} échecs sur ${destinataires.length} destinataires éligibles).`
    );
  }
}

// Toutes les minutes — assez réactif pour un fil "Flash", peu coûteux en repos.
function demarrerJobNotifications() {
  cron.schedule('* * * * *', () => {
    diffuserNotificationsEnAttente().catch((e) => {
      console.error('Erreur job notifications push :', e);
    });
  });
  console.log('✔ Job de diffusion des notifications push démarré (toutes les minutes).');
}

module.exports = { demarrerJobNotifications, diffuserNotificationsEnAttente };
