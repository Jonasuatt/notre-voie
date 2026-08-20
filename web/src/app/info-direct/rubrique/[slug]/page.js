import { notFound } from 'next/navigation';
import { getArticles, getRubriques, getCampagnesActives } from '@/lib/api';
import RubriqueTabs from '@/components/RubriqueTabs';
import ArticleCard from '@/components/ArticleCard';
import PubCard from '@/components/PubCard';

const BASE_PATH = '/info-direct';

export async function generateMetadata({ params }) {
  const rubriques = await getRubriques();
  const rubrique = rubriques.find((r) => r.slug === params.slug);
  return { title: rubrique ? rubrique.nom : 'Rubrique' };
}

export default async function RubriquePage({ params, searchParams }) {
  const date = searchParams?.date || '';
  const rubriques = await getRubriques();
  const rubrique = rubriques.find((r) => r.slug === params.slug);
  if (!rubrique) notFound();

  const [{ articles, total }, campagnes] = await Promise.all([
    getArticles({ rubrique: params.slug, date: date || undefined, pageSize: 30, portail: 'INFO_DIRECT' }),
    getCampagnesActives({ rubrique: params.slug, format: 'NATIVE_CARTE' }),
  ]);
  const pub = campagnes?.[0];

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: rubrique.couleur }}>Rubrique</span>
        <h1 className="font-serif text-[30px] mt-1">{rubrique.nom}</h1>
        {rubrique.angleEditorial && <p className="text-muted text-[14px] mt-2 max-w-2xl">{rubrique.angleEditorial}</p>}
      </div>

      <RubriqueTabs rubriques={rubriques} active={params.slug} basePath={BASE_PATH} />

      {/* Filtre par date de parution, propre à cette rubrique — pour
          retrouver un jour précis sans repasser par la recherche générale. */}
      <form method="GET" className="flex flex-wrap items-end gap-3 mb-6 -mt-2">
        <div>
          <label className="block text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1">Jour de parution</label>
          <input type="date" name="date" defaultValue={date} className="border border-line rounded-md px-3 py-1.5 text-[13px] bg-transparent" />
        </div>
        <button type="submit" className="text-[12.5px] font-bold px-4 py-1.5 rounded-full" style={{ background: '#22D3EE', color: '#0a0e1a' }}>Filtrer</button>
        {date && (
          <a href={`${BASE_PATH}/rubrique/${params.slug}`} className="text-[12.5px] font-semibold text-muted hover:text-ink px-1 py-1.5">
            Réinitialiser
          </a>
        )}
      </form>

      {articles.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">
          {date ? 'Aucun article de cette rubrique publié ce jour-là.' : 'Aucun article publié dans cette rubrique pour le moment.'}
        </p>
      ) : (
        <>
          <p className="text-muted text-[12.5px] font-mono mb-4">{total} article{total > 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {articles.slice(0, 5).map((a) => (
              <ArticleCard key={a.id} article={a} basePath={BASE_PATH} />
            ))}
            {pub && <PubCard campagne={pub} />}
            {articles.slice(5).map((a) => (
              <ArticleCard key={a.id} article={a} basePath={BASE_PATH} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
