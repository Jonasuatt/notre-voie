// Évite les try/catch répétés dans chaque contrôleur : toute erreur
// (y compris une rejection de promesse) est transmise à errorHandler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
