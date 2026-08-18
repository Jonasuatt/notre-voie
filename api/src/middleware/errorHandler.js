// Gestionnaire d'erreurs central. Traduit les erreurs Prisma connues en
// réponses HTTP lisibles plutôt que de laisser fuiter la stack technique.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: `Cette valeur existe déjà (${(err.meta && err.meta.target) || 'champ unique'}).` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: "Ressource introuvable." });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: "Référence invalide vers une ressource liée." });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Erreur interne du serveur.' : err.message;
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
