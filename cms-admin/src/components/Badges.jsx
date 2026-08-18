import { STATUT_CAMPAGNE_LABELS, STATUT_CAMPAGNE_COLORS, STATUT_FACTURE_LABELS, STATUT_FACTURE_COLORS, ROLE_LABELS, ROLE_COLORS } from '../utils/constants';

export function StatutCampagneBadge({ statut }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${STATUT_CAMPAGNE_COLORS[statut] || 'bg-gray-100 text-gray-600'}`}>
      {STATUT_CAMPAGNE_LABELS[statut] || statut}
    </span>
  );
}

export function StatutFactureBadge({ statut }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${STATUT_FACTURE_COLORS[statut] || 'bg-gray-100 text-gray-600'}`}>
      {STATUT_FACTURE_LABELS[statut] || statut}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
