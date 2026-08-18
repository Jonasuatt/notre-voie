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

export const FORMAT_PUB_LABELS = {
  NATIVE_CARTE: 'Natif (carte article)',
  BANNIERE: 'Bannière',
  TICKER_SPONSOR: 'Sponsoring ticker/rubrique',
};

export const STATUT_CAMPAGNE_LABELS = {
  BROUILLON: 'Brouillon',
  EN_ATTENTE_VALIDATION: 'En attente de validation',
  ACTIVE: 'Active',
  EN_PAUSE: 'En pause',
  TERMINEE: 'Terminée',
};

export const STATUT_CAMPAGNE_COLORS = {
  BROUILLON: 'bg-gray-100 text-gray-600',
  EN_ATTENTE_VALIDATION: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EN_PAUSE: 'bg-orange-100 text-orange-700',
  TERMINEE: 'bg-gray-200 text-gray-500',
};

export const STATUT_FACTURE_LABELS = {
  EMISE: 'Émise',
  PAYEE: 'Payée',
  EN_RETARD: 'En retard',
  ANNULEE: 'Annulée',
};

export const STATUT_FACTURE_COLORS = {
  EMISE: 'bg-blue-100 text-blue-700',
  PAYEE: 'bg-emerald-100 text-emerald-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULEE: 'bg-gray-100 text-gray-500',
};

export function formatFCFA(montant) {
  if (montant === null || montant === undefined) return '—';
  return `${Number(montant).toLocaleString('fr-FR')} FCFA`;
}
