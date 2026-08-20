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

// Numéro couvrant plusieurs jours (week-end, jour férié) : "14 - 16 août
// 2026" plutôt que deux dates complètes redondantes ; si les mois diffèrent,
// affiche les deux en entier.
export function formatDateRange(debut, fin) {
  if (!fin) return formatDate(debut);
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return formatDate(debut);
  if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
    return `${d1.getDate()} - ${d2.getDate()} ${MOIS[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  return `${formatDate(debut)} - ${formatDate(fin)}`;
}

export function formatFCFA(montant) {
  if (montant === null || montant === undefined) return '';
  return `${Number(montant).toLocaleString('fr-FR')} FCFA`;
}

export const LABEL_FORMAT = {
  FLASH: 'Flash',
  EDITION: 'Édition',
  DECRYPTAGE: 'Décryptage',
  LIVE: 'Direct',
  VIDEO_COURTE: 'Vidéo',
  AUDIO: 'Audio',
  VERITE_OU_INTOX: 'Vérité ou Intox',
};
