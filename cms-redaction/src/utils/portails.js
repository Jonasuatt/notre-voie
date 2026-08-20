// Deux rédactions, deux portails — Info en direct affiché en premier partout
// dans le CMS (cf. même ordre déjà choisi sur le portail public web/src/app/page.js),
// chacun avec sa propre identité visuelle pour qu'on ne les confonde jamais :
// Info en direct = thème sombre/cyan (rédaction web) ; Le Quotidien = thème
// clair/corail (journal imprimé).
export const PORTAILS = [
  {
    valeur: 'INFO_DIRECT',
    label: 'Info en direct',
    accroche: "L'actualité au fil de l'eau",
    description: 'Rédaction web animée au quotidien, style éditorial et rubriques propres.',
    accent: '#22D3EE',
    fond: '#0a0e1a',
    texte: '#E7EBF7',
  },
  {
    valeur: 'QUOTIDIEN',
    label: 'Le Quotidien',
    accroche: 'Le journal, chaque jour',
    description: 'Contenu déversé tel que présent dans les PDF du journal imprimé, rubriques traditionnelles.',
    accent: '#E6008C',
    fond: '#FFFFFF',
    texte: '#111318',
  },
];

export const PORTAIL_LABELS = Object.fromEntries(PORTAILS.map((p) => [p.valeur, p.label]));
