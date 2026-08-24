// Mega-menu façon nytimes.com — 5 grands piliers regroupant les ~18
// rubriques d'Info en direct, pour ne pas surcharger la barre de
// navigation. Uniquement Info en direct : Le Quotidien garde son menu
// plat (mêmes rubriques que le journal papier, cf. Header.js).
//
// Chaque pilier ne référence que des rubriques réellement seedées
// (api/prisma/seed.js) — aucun "sujet chaud" ou sous-catégorie inventée
// qui ne correspondrait à aucun contenu réel. `secours` désigne le bloc à
// afficher quand un pilier a moins de 3 articles en "En ce moment" (cf.
// construireSecours ci-dessous) — toujours du vrai contenu/lien existant,
// jamais un widget factice (pas de formulaire newsletter/WhatsApp qui
// n'existe pas côté site).
export const PILIERS_MEGA_MENU = [
  {
    cle: 'actualites-politique',
    label: 'Actualités & Politique',
    rubriques: ['politique', 'refondation', 'regions', 'diaspora'],
    liensSupplementaires: [{ label: 'Direct', href: '/direct', pastilleLive: true }],
    secours: 'abonnement',
  },
  {
    cle: 'economie-societe',
    label: 'Économie & Société',
    rubriques: ['economie', 'vie-chere', 'societe', 'education', 'sante', 'environnement', 'numerique'],
    secours: 'abonnement',
  },
  {
    cle: 'culture-sport',
    label: 'Culture & Sport',
    rubriques: ['culture', 'sport', 'necrologie'],
    secours: 'abonnement',
  },
  {
    cle: 'enquetes-decryptage',
    label: 'Enquêtes & Décryptage',
    // opinions-tribunes / histoire-de-cote-d-ivoire : rubriques Info en
    // direct de premier niveau, sans parent naturel (cf. SOUS_RUBRIQUES,
    // api/prisma/seed.js).
    rubriques: ['verite-ou-intox', 'opinions-tribunes', 'histoire-de-cote-d-ivoire'],
    liensSupplementaires: [{ label: 'Kiosque numérique', href: '/kiosque' }],
    secours: 'kiosque',
  },
  {
    cle: 'medias-multimedia',
    label: 'Médias & Multimédia',
    rubriques: ['videos', 'audio-podcasts', 'photos-legendees'],
    secours: 'audio',
  },
];

function construireSecours(type, contexte) {
  if (type === 'kiosque' && contexte?.edition?.couvertureUrl) {
    return { type: 'kiosque', edition: contexte.edition };
  }
  if (type === 'audio' && contexte?.dernierAudio) {
    return { type: 'audio', article: contexte.dernierAudio };
  }
  // Fallback universel — toujours disponible, page réelle existante.
  return { type: 'abonnement' };
}

// Construit les données prêtes-à-afficher du mega-menu à partir des
// rubriques et des articles déjà récupérés (une seule requête chacune,
// partagées par tout le layout Info en direct — pas d'appel API par
// pilier). `contexte` fournit la dernière édition (Une) et le dernier
// audio publié, pour les blocs de secours. Purement synchrone : aucune
// donnée n'est inventée, seulement regroupée.
export function construireMegaMenu(rubriques, articles, contexte = {}) {
  const rubriqueParSlug = new Map(rubriques.map((r) => [r.slug, r]));
  const sousRubriquesParParentId = new Map();
  for (const r of rubriques) {
    if (!r.parentId) continue;
    if (!sousRubriquesParParentId.has(r.parentId)) sousRubriquesParParentId.set(r.parentId, []);
    sousRubriquesParParentId.get(r.parentId).push(r);
  }

  return PILIERS_MEGA_MENU.map((pilier) => {
    // "En ce moment" couvre aussi les articles des sous-rubriques (une
    // fois qu'elles auront du contenu réel), pas seulement des rubriques
    // principales du pilier.
    const slugsSet = new Set(pilier.rubriques);
    for (const slug of pilier.rubriques) {
      const parent = rubriqueParSlug.get(slug);
      if (parent) for (const sr of sousRubriquesParParentId.get(parent.id) || []) slugsSet.add(sr.slug);
    }

    const liensRubriques = pilier.rubriques
      .map((slug) => rubriqueParSlug.get(slug))
      .filter(Boolean)
      .map((r) => ({
        label: r.nom,
        href: `/rubrique/${r.slug}`,
        couleur: r.couleur,
        sousRubriques: (sousRubriquesParParentId.get(r.id) || []).map((sr) => ({ label: sr.nom, href: `/rubrique/${sr.slug}` })),
      }));

    const aLaUne = articles.filter((a) => slugsSet.has(a.rubrique?.slug)).slice(0, 4);
    const blocSecours = aLaUne.length < 3 ? construireSecours(pilier.secours, contexte) : null;

    return { ...pilier, liensRubriques, aLaUne, blocSecours };
  }).filter((pilier) => pilier.liensRubriques.length > 0 || pilier.liensSupplementaires?.length > 0);
}
