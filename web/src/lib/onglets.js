import { getArticles } from './api';

// Regroupe les articles d'une rubrique ET de ses sous-rubriques (même
// logique que construireMegaMenu) — utilisé pour alimenter un onglet
// "Politique" avec Élections & Partis / Institutions & Lois, etc. Aucune
// donnée inventée : uniquement des rubriques réellement seedées.
export async function getArticlesRubriqueEtEnfants(rubriques, slug, portail, pageSize = 4) {
  const rubrique = rubriques.find((r) => r.slug === slug);
  if (!rubrique) return [];
  const enfants = rubriques.filter((r) => r.parentId === rubrique.id);
  const slugs = [slug, ...enfants.map((e) => e.slug)];
  const resultats = await Promise.all(slugs.map((s) => getArticles({ rubrique: s, portail, pageSize })));
  return resultats
    .flatMap((r) => r.articles)
    .sort((a, b) => new Date(b.publieLe) - new Date(a.publieLe))
    .slice(0, pageSize);
}

// Construit les onglets d'un widget (ex : Politique / Régions / Diaspora)
// à partir d'une liste de {label, slug}. Ignore silencieusement un onglet
// sans aucun article (rubrique vide pour l'instant).
export async function construireOnglets(rubriques, definitions, portail, pageSize = 4) {
  const resultats = await Promise.all(
    definitions.map(async (d) => ({ ...d, articles: await getArticlesRubriqueEtEnfants(rubriques, d.slug, portail, pageSize) }))
  );
  return resultats.filter((o) => o.articles.length > 0);
}
