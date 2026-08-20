import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getRubriques, getTicker, getFactChecks, getCampagnesActives } from '@/lib/api';
import FlashBar from '@/components/FlashBar';
import TickerVieChere from '@/components/TickerVieChere';
import RubriqueTabs from '@/components/RubriqueTabs';
import ArticleCard from '@/components/ArticleCard';
import FactCheckBlock from '@/components/FactCheckBlock';
import FormatBadge from '@/components/FormatBadge';
import PubCard from '@/components/PubCard';
import { timeAgo } from '@/lib/format';

// Quotidien : la Une et le fil changent chaque jour, jamais figés au build.
export const dynamic = 'force-dynamic';

export default async function AccueilPage() {
  const [{ articles }, rubriques, prix, factChecks, campagnes] = await Promise.all([
    getArticles({ pageSize: 24 }),
    getRubriques(),
    getTicker(),
    getFactChecks(),
    getCampagnesActives({ format: 'NATIVE_CARTE' }),
  ]);

  const flashEtLive = articles.filter((a) => a.format === 'FLASH' || a.format === 'LIVE').slice(0, 8);
  const une = articles[0];
  const resumeDuJour = articles.slice(1, 6);
  const grille = articles.slice(0, 9);
  const directEnCours = articles.find((a) => a.format === 'LIVE');
  const pub = campagnes?.[0];

  return (
    <>
      <FlashBar articles={flashEtLive} />
      <TickerVieChere prix={prix} />

      {directEnCours && (
        <Link href={`/article/${directEnCours.slug}`} className="block bg-ink text-white">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-coral text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
            </span>
            <span className="text-[13px] font-medium truncate hover:text-coral transition-colors">{directEnCours.titre}</span>
          </div>
        </Link>
      )}

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-8">
        {une && (
          <div className="grid lg:grid-cols-[1.55fr_1fr] gap-7">
            <Link href={`/article/${une.slug}`} className="group">
              <div className="relative h-[220px] sm:h-[300px] rounded-[10px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
                {une.imageUneUrl && (
                  <Image src={une.imageUneUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" priority className="object-cover" />
                )}
                <FormatBadge format={une.format} />
              </div>
              <div className="pt-4">
                <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: une.rubrique?.couleur }}>
                  {une.rubrique?.nom}
                </span>
                <h2 className="font-serif text-[26px] sm:text-[28px] leading-tight mt-2 group-hover:text-coral transition-colors">
                  {une.titre}
                </h2>
                {une.chapo && <p className="text-muted text-[14.5px] mt-2.5 leading-relaxed">{une.chapo}</p>}
                <div className="flex gap-3 items-center mt-3.5 font-mono text-[11px] text-muted">
                  <span>{timeAgo(une.publieLe)}</span>
                  {une.auteur && <span>· {une.auteur.prenom} {une.auteur.nom}</span>}
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-[18px]">
              <div className="bg-navy rounded-[10px] p-5 text-white">
                <h3 className="font-serif text-[16px] mb-3">5 choses à retenir aujourd&apos;hui</h3>
                <ol className="list-decimal pl-[18px] space-y-2.5 text-[12.5px] text-[#D8DCEA]">
                  {resumeDuJour.map((a) => (
                    <li key={a.id}>
                      <Link href={`/article/${a.slug}`} className="hover:text-white">{a.titre}</Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        <FactCheckBlock factChecks={factChecks} />
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
        <RubriqueTabs rubriques={rubriques} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {grille.slice(0, 5).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
          {pub && <PubCard campagne={pub} />}
          {grille.slice(5).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </>
  );
}
