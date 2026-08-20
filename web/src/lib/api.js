import * as fixtures from './fixtures';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// Toute la donnée passe par l'API réelle en priorité. Si elle est
// injoignable (pas encore déployée / base non peuplée), on retombe sur
// des fixtures de démonstration de même forme, pour ne jamais présenter
// une page cassée. Voir docs/DECISIONS.md — à retirer une fois l'API en
// production avec des données réelles.
async function apiFetch(path, { revalidate = 60, fallback } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
    return await res.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[notre-voie-web] API indisponible (${API_URL}${path}), bascule sur les données de démonstration —`, err.message, err.cause);
    }
    return fallback;
  }
}

export async function getRubriques() {
  const data = await apiFetch('/api/rubriques', { fallback: { rubriques: fixtures.RUBRIQUES } });
  return data.rubriques;
}

export async function getArticles({ rubrique, format, q, date, dateDebut, dateFin, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (rubrique) params.set('rubrique', rubrique);
  if (format) params.set('format', format);
  if (q) params.set('q', q);
  if (date) params.set('date', date);
  if (dateDebut) params.set('dateDebut', dateDebut);
  if (dateFin) params.set('dateFin', dateFin);
  params.set('page', page);
  params.set('pageSize', pageSize);

  let filtered = fixtures.ARTICLES;
  if (rubrique) filtered = filtered.filter((a) => a.rubrique.slug === rubrique);
  if (format) filtered = filtered.filter((a) => a.format === format);
  if (q) filtered = filtered.filter((a) => a.titre.toLowerCase().includes(q.toLowerCase()));
  if (date) filtered = filtered.filter((a) => a.publieLe?.slice(0, 10) === date);

  const data = await apiFetch(`/api/articles?${params.toString()}`, {
    fallback: { articles: filtered, total: filtered.length },
  });
  return data;
}

export async function getArticleBySlug(slug) {
  let fromFixtures = fixtures.ARTICLES.find((a) => a.slug === slug) || null;
  // En mode démo (sans lecteur connecté), on reproduit le comportement
  // paywall souple réel de l'API : le corps est masqué pour un article
  // payant tant qu'aucun accès n'est débloqué.
  if (fromFixtures && fromFixtures.paywall === 'PAYANT') {
    fromFixtures = { ...fromFixtures, contenuHtml: null, paywallLocked: true };
  }
  const data = await apiFetch(`/api/articles/${slug}`, {
    revalidate: 30,
    fallback: { article: fromFixtures },
  });
  return data.article;
}

export async function getTicker() {
  const data = await apiFetch('/api/prix-vie-chere', { revalidate: 300, fallback: { prix: fixtures.PRIX_VIE_CHERE } });
  return data.prix;
}

export async function getFactChecks() {
  const factChecksFixtures = fixtures.ARTICLES.filter((a) => a.factCheck).map((a) => ({ article: a, ...a.factCheck }));
  const data = await apiFetch('/api/verite-ou-intox', { fallback: { factChecks: factChecksFixtures } });
  return data.factChecks;
}

export async function getCampagnesActives({ rubrique, format } = {}) {
  const params = new URLSearchParams();
  if (rubrique) params.set('rubrique', rubrique);
  if (format) params.set('format', format);
  const data = await apiFetch(`/api/campagnes/actives?${params.toString()}`, { revalidate: 120, fallback: { campagnes: [] } });
  return data.campagnes;
}

export async function getEditions({ page = 1, pageSize = 12 } = {}) {
  const data = await apiFetch(`/api/editions?page=${page}&pageSize=${pageSize}`, {
    revalidate: 3600,
    fallback: { editions: fixtures.EDITIONS },
  });
  return data.editions;
}
