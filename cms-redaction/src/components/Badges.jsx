import { STATUT_LABELS, STATUT_COLORS, FORMAT_LABELS, PAYWALL_LABELS } from '../utils/constants';

export function StatutBadge({ statut }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${STATUT_COLORS[statut] || 'bg-gray-100 text-gray-600'}`}>
      {STATUT_LABELS[statut] || statut}
    </span>
  );
}

export function FormatBadge({ format }) {
  return (
    <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-full bg-navy-50 text-navy-700 border border-navy-100">
      {FORMAT_LABELS[format] || format}
    </span>
  );
}

export function PaywallBadge({ paywall }) {
  if (paywall !== 'PAYANT') return null;
  return <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gold-50 text-amber-800">{PAYWALL_LABELS.PAYANT}</span>;
}
