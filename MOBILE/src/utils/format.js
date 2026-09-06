const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function formatDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

export function timeAgo(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.round(diffH / 24);
  if (diffJ < 7) return `il y a ${diffJ} j`;
  return formatDate(dateLike);
}

export function formatFCFA(montant) {
  if (montant === null || montant === undefined) return '';
  return `${Number(montant).toLocaleString('fr-FR')} FCFA`;
}

// Période de parution : un numéro de week-end couvre plusieurs jours, il faut
// alors afficher les deux bornes (« 4 - 6 sept. 2026 »).
export function formatDateRange(debut, fin) {
  if (!fin) return formatDate(debut);
  const d = new Date(debut);
  const f = new Date(fin);
  const memeMois = d.getMonth() === f.getMonth() && d.getFullYear() === f.getFullYear();
  const jour = (x) => x.getDate();
  return memeMois
    ? `${jour(d)} - ${formatDate(fin)}`
    : `${formatDate(debut)} - ${formatDate(fin)}`;
}
