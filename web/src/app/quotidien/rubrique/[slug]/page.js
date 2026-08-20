import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getArticles, getRubriques, getCampagnesActives, getEditions } from '@/lib/api';
import RubriqueTabs from '@/components/RubriqueTabs';
import ArticleCard from '@/components/ArticleCard';
import PubCard from '@/components/PubCard';

const BASE_PATH = '/quotidien';

export async function generateMetadata({ params }) {
  const rubriques = await getRubriques();
  const rubrique = rubriques.find((r) => r.slug === params.slug);
  return { title: rubrique ? rubrique.nom : 'Rubrique' };
}

export default async function RubriquePage({ params }) {
  const rubriques = await getRubriques();
  const rubrique = rubriques.find((r) => r.slug === params.slug);
  if (!rubrique) notFound();

  const [{ articles, total }, campagnes, editions] = await Promise.all([
    getArticles({ rubrique: params.slug, pageSize: 30, portail: 'QUOTIDIEN' }),
    getCampagnesActives({ rubrique: params.slug, format: 'NATIVE_CARTE' }),
    getEditions({ pageSize: 1 }),
  ]);
  const pub = campagnes?.[0];
  // Page(s) du numéro du jour où cette rubrique est réellement traitée
  // (cf. PagesDuJournal / seedEditionPages) — même logique que l'accueil.
  const pagesRubrique = (editions?.[0]?.pages || []).filter((p) => p.rubriques?.includes(params.slug));

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8 flex flex-wrap items-start gap-8">
        <div className="flex-1 min-w-[240px]">
          <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: rubrique.couleur }}>Rubrique</span>
          <h1 className="font-serif text-[30px] mt-1">{rubrique.nom}</h1>
          {rubrique.angleEditorial && <p className="text-muted text-[14px] mt-2 max-w-2xl">{rubrique.angleEditorial}</p>}
        </div>

        {pagesRubrique.length > 0 && (
          <div className="flex gap-6 shrink-0">
            {pagesRubrique.map((p) => (
              <div key={p.id} className="w-[300px]">
                <div className="relative w-[300px] aspect-[3/4] rounded-[10px] overflow-hidden border border-line shadow-xl">
                  <Image src={p.imageUrl} alt={`Page ${p.numeroPage}`} fill sizes="300px" className="object-cover" onContextMenu={(e) => e.preventDefault()} draggable={false} />
                </div>
                <span className="block text-center font-mono text-[11px] text-muted mt-2">Page {p.numeroPage}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <RubriqueTabs rubriques={rubriques} active={params.slug} basePath={BASE_PATH} />

      {articles.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">Aucun article publié dans cette rubrique pour le moment.</p>
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
