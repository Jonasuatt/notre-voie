// Mega-menu façon nytimes.com — 5 grands piliers regroupant les ~18
// rubriques d'Info en direct, pour ne pas surcharger la barre de
// navigation. Uniquement Info en direct : Le Quotidien garde son menu
// plat (mêmes rubriques que le journal papier, cf. Header.js).
//
// Chaque pilier ne référence que des rubriques réellement seedées
// (api/prisma/seed.js) — aucun "sujet chaud" ou sous-catégorie inventée
// qui ne correspondrait à aucun contenu réel.
export const PILIERS_MEGA_MENU = [
  {
    cle: 'actualites-politique',
    label: 'Actualités & Politique',
    rubriques: ['politique', 'refondation', 'regions', 'diaspora'],
    liensSupplementaires: [{ label: 'Direct', href: '/direct' }],
  },
  {
    cle: 'economie-societe',
    label: 'Économie & Société',
    rubriques: ['economie', 'vie-chere', 'societe', 'education', 'sante', 'environnement', 'numerique'],
  },
  {
    cle: 'culture-sport',
    label: 'Culture & Sport',
    rubriques: ['culture', 'sport', 'necrologie'],
  },
  {
    cle: 'enquetes-decryptage',
    label: 'Enquêtes & Décryptage',
    rubriques: ['verite-ou-intox'],
    liensSupplementaires: [{ label: 'Kiosque numérique', href: '/kiosque' }],
  },
  {
    cle: 'medias-multimedia',
    label: 'Médias & Multimédia',
    rubriques: ['videos', 'audio-podcasts', 'photos-legendees'],
  },
];

// Construit les données prêtes-à-afficher du mega-menu à partir des
// rubriques et des articles déjà récupérés (une seule requête chacun,
// partagée par tout le layout Info en direct — pas d'appel API par
// pilier). Purement synchrone : aucune donnée n'est inventée, seulement
// regroupée.
export function construireMegaMenu(rubriques, articles) {
  const rubriqueParSlug = new Map(rubriques.map((r) => [r.slug, r]));

  return PILIERS_MEGA_MENU.map((pilier) => {
    const slugsSet = new Set(pilier.rubriques);
    const liensRubriques = pilier.rubriques
      .map((slug) => rubriqueParSlug.get(slug))
      .filter(Boolean)
      .map((r) => ({ label: r.nom, href: `/rubrique/${r.slug}`, couleur: r.couleur }));

    const aLaUne = articles.filter((a) => slugsSet.has(a.rubrique?.slug)).slice(0, 4);

    return { ...pilier, liensRubriques, aLaUne };
  }).filter((pilier) => pilier.liensRubriques.length > 0 || pilier.liensSupplementaires?.length > 0);
}
