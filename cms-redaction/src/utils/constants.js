// Labels français des énumérations Prisma — cf. api/prisma/schema.prisma

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  REGIE: 'Régie publicitaire',
  REDACTEUR: 'Rédacteur',
  CHEF_SERVICE: 'Chef de service',
  REDACTEUR_EN_CHEF: 'Rédacteur en chef',
  SECRETAIRE_GENERAL: 'Secrétaire général',
};

export const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  REGIE: 'bg-amber-100 text-amber-800',
  REDACTEUR: 'bg-blue-100 text-blue-700',
  CHEF_SERVICE: 'bg-purple-100 text-purple-700',
  REDACTEUR_EN_CHEF: 'bg-navy-100 text-navy-700',
  SECRETAIRE_GENERAL: 'bg-emerald-100 text-emerald-700',
};

export const ROLES_VALIDATION = ['CHEF_SERVICE', 'REDACTEUR_EN_CHEF', 'SECRETAIRE_GENERAL', 'ADMIN'];
export const ROLES_PUBLICATION = ['REDACTEUR_EN_CHEF', 'SECRETAIRE_GENERAL', 'ADMIN'];

export const FORMAT_LABELS = {
  FLASH: 'Flash',
  EDITION: 'Édition',
  DECRYPTAGE: 'Décryptage',
  LIVE: 'Live',
  VIDEO_COURTE: 'Vidéo courte',
  AUDIO: 'Audio',
  VERITE_OU_INTOX: 'Vérité ou Intox',
};

export const FORMAT_DESCRIPTIONS = {
  FLASH: 'Information ultra-courte, publiée en quelques minutes, façon story — vérifiée mais rapide.',
  EDITION: "Article structuré et mis en page, le contenu de référence du jour.",
  DECRYPTAGE: 'Explication approfondie d\'un sujet complexe, appuyée sur des graphiques ou une chronologie.',
  LIVE: "Couverture en direct d'un événement, avec mises à jour successives.",
  VIDEO_COURTE: "Résumé visuel d'un sujet en moins de 90 secondes, format vertical mobile.",
  AUDIO: "Version audio de l'article ou de l'édition, écoutable en déplacement.",
  VERITE_OU_INTOX: 'Fact-check court, preuve à l\'appui, publié en priorité en format Flash.',
};

export const STATUT_LABELS = {
  BROUILLON: 'Brouillon',
  EN_RELECTURE: 'En relecture',
  VALIDE: 'Validé',
  PUBLIE: 'Publié',
  DEPUBLIE: 'Dépublié',
};

export const STATUT_COLORS = {
  BROUILLON: 'bg-gray-100 text-gray-600',
  EN_RELECTURE: 'bg-amber-100 text-amber-800',
  VALIDE: 'bg-blue-100 text-blue-700',
  PUBLIE: 'bg-emerald-100 text-emerald-700',
  DEPUBLIE: 'bg-red-100 text-red-700',
};

export const PAYWALL_LABELS = { LIBRE: 'Libre', PAYANT: 'Payant (abonnés)' };

export const VERDICT_LABELS = { VRAI: 'Vrai', FAUX: 'Faux', TROMPEUR: 'Trompeur', NON_VERIFIABLE: 'Non vérifiable' };

// Checklist créée automatiquement à la création d'un article Flash/Vérité ou
// Intox côté API (voir api/src/controllers/articles.controller.js) — reprise
// ici uniquement pour afficher un aperçu avant création.
export const CHECKLIST_DEFAUT = [
  'Source primaire identifiée',
  'Deuxième source recoupée',
  "Auteur/média d'origine du contenu vérifié",
];
