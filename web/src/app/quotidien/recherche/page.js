import { getArticles, getRubriques } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';

const BASE_PATH = '/quotidien';

export const metadata = { title: 'Recherche' };

// Archivage et recherche — par jour de parution, mot-clé (titre/sujet) et
// rubrique. Cf. demande explicite : le site étant celui d'un quotidien,
// le contenu change chaque jour et doit rester consultable a posteriori
// par numéro/jour, sujet ou rubrique.
export default async function RecherchePage({ searchParams }) {
  const q = searchParams?.q || '';
  const rubrique = searchParams?.rubrique || '';
  const date = searchParams?.date || '';

  const aUneRecherche = Boolean(q || rubrique || date);

  const [rubriques, resultats] = await Promise.all([
    getRubriques(),
    aUneRecherche ? getArticles({ q: q || undefined, rubrique: rubrique || undefined, date: date || undefined, pageSize: 40, portail: 'QUOTIDIEN' }) : Promise.resolve({ articles: [], total: 0 }),
  ]);

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
      <span className="font-mono text-[11px] uppercase tracking-widest text-coral">Archives</span>
      <h1 className="font-serif text-[30px] mt-1">Rechercher un article</h1>
      <p className="text-muted text-[14px] mt-2 max-w-2xl">
        Par jour de parution, par mot-clé ou par rubrique — tout le fonds documentaire de Notre Voie, jour après jour.
      </p>

      <form method="GET" action={`${BASE_PATH}/recherche`} className="grid sm:grid-cols-4 gap-3 mt-6 bg-white border border-line rounded-[10px] p-5">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-mono uppercase tracking-wide text-muted mb-1.5">Mot-clé / sujet</label>
          <input type="text" name="q" defaultValue={q} placeholder="Un nom, un lieu, un sujet…" className="w-full border border-line rounded-md px-3 py-2 text-[14px]" />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wide text-muted mb-1.5">Rubrique</label>
          <select name="rubrique" defaultValue={rubrique} className="w-full border border-line rounded-md px-3 py-2 text-[14px] bg-white">
            <option value="">Toutes</option>
            {rubriques.filter((r) => r.type === 'EDITORIALE').map((r) => (
              <option key={r.id} value={r.slug}>{r.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wide text-muted mb-1.5">Jour de parution</label>
          <input type="date" name="date" defaultValue={date} className="w-full border border-line rounded-md px-3 py-2 text-[14px]" />
        </div>
        <div className="sm:col-span-4 flex justify-end gap-2">
          {aUneRecherche && (
            <a href={`${BASE_PATH}/recherche`} className="text-[13px] font-semibold text-muted hover:text-ink px-4 py-2">Réinitialiser</a>
          )}
          <button type="submit" className="bg-navy text-white font-bold text-[13px] px-5 py-2.5 rounded-full hover:brightness-95 transition">
            Rechercher
          </button>
        </div>
      </form>

      <div className="mt-8">
        {!aUneRecherche ? (
          <p className="text-muted text-sm py-12 text-center border-t border-line">Choisissez au moins un critère pour lancer la recherche.</p>
        ) : resultats.articles.length === 0 ? (
          <p className="text-muted text-sm py-12 text-center border-t border-line">Aucun article ne correspond à ces critères.</p>
        ) : (
          <>
            <p className="text-muted text-[12.5px] font-mono mb-4">{resultats.total} résultat{resultats.total > 1 ? 's' : ''}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
              {resultats.articles.map((a) => (
                <ArticleCard key={a.id} article={a} basePath={BASE_PATH} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
