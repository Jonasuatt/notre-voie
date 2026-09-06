import * as fixtures from './fixtures';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// Toute la donnée passe par l'API réelle en priorité. Si elle est
// injoignable (pas encore déployée / base non peuplée), on retombe sur
// des fixtures de démonstration de même forme, pour ne jamais présenter
// une page cassée. Voir docs/DECISIONS.md — à retirer une fois l'API en
// production avec des données réelles.
async function apiFetch(path, { revalidate = 60, fallback, entetes } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate }, ...(entetes ? { headers: entetes } : {}) });
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

export async function getArticles({ rubrique, format, q, date, dateDebut, dateFin, portail, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (rubrique) params.set('rubrique', rubrique);
  if (format) params.set('format', format);
  if (q) params.set('q', q);
  if (date) params.set('date', date);
  if (dateDebut) params.set('dateDebut', dateDebut);
  if (dateFin) params.set('dateFin', dateFin);
  if (portail) params.set('portail', portail);
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

// Code de lecture de l'abonné, déposé en cookie par /acces après vérification.
// Il est relu ici côté serveur et transmis à l'API : c'est elle qui décide de
// débloquer, le site ne fait que porter la clé.
async function codeLectureDuLecteur() {
  try {
    const { cookies } = await import('next/headers');
    return cookies().get('nv_code_lecture')?.value || null;
  } catch {
    return null;
  }
}

export async function getArticleBySlug(slug) {
  let fromFixtures = fixtures.ARTICLES.find((a) => a.slug === slug) || null;
  // En mode démo (sans lecteur connecté), on reproduit le comportement
  // paywall souple réel de l'API : le corps est masqué pour un article
  // payant tant qu'aucun accès n'est débloqué.
  if (fromFixtures && fromFixtures.paywall === 'PAYANT') {
    fromFixtures = { ...fromFixtures, contenuHtml: null, paywallLocked: true };
  }
  const code = await codeLectureDuLecteur();
  const data = await apiFetch(`/api/articles/${slug}`, {
    // Pas de cache partagé quand un code est présenté : la réponse dépend
    // alors du lecteur.
    revalidate: code ? 0 : 30,
    entetes: code ? { 'x-code-lecture': code } : undefined,
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

// Kiosque avec son volume total — l'accueil affiche l'ampleur du fonds.
export async function getKiosqueResume({ pageSize = 4 } = {}) {
  const data = await apiFetch(`/api/editions?page=1&pageSize=${pageSize}`, {
    revalidate: 3600,
    fallback: { editions: fixtures.EDITIONS, total: fixtures.EDITIONS.length },
  });
  return { editions: data.editions || [], total: data.total || 0 };
}

export async function getEditions({ page = 1, pageSize = 12 } = {}) {
  const data = await apiFetch(`/api/editions?page=${page}&pageSize=${pageSize}`, {
    revalidate: 3600,
    fallback: { editions: fixtures.EDITIONS },
  });
  return data.editions;
}
