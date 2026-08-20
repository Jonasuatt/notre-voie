import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getRubriques, getTicker, getFactChecks, getCampagnesActives, getEditions } from '@/lib/api';
import FlashBar from '@/components/FlashBar';
import DerniereMinute from '@/components/DerniereMinute';
import TickerVieChere from '@/components/TickerVieChere';
import RubriqueTabs from '@/components/RubriqueTabs';
import ArticleCard from '@/components/ArticleCard';
import FactCheckBlock from '@/components/FactCheckBlock';
import FormatBadge from '@/components/FormatBadge';
import PubCard from '@/components/PubCard';
import DeverrouillerPdf from '@/components/DeverrouillerPdf';
import ImageProtegee from '@/components/ImageProtegee';
import { timeAgo, formatDateRange } from '@/lib/format';

const BASE_PATH = '/info-direct';

// Quotidien : la Une et le fil changent chaque jour, jamais figés au build.
export const dynamic = 'force-dynamic';

export default async function QuotidienAccueilPage() {
  const [{ articles }, rubriques, prix, factChecks, campagnes, editions] = await Promise.all([
    getArticles({ pageSize: 24, portail: 'INFO_DIRECT' }),
    getRubriques(),
    getTicker(),
    getFactChecks(),
    getCampagnesActives({ format: 'NATIVE_CARTE' }),
    getEditions({ pageSize: 1 }),
  ]);
  const uneDuJour = editions?.[0];

  const flashEtLive = articles.filter((a) => a.format === 'FLASH' || a.format === 'LIVE').slice(0, 8);
  const une = articles[0];
  const resumeDuJour = articles.slice(1, 6);
  const grille = articles.slice(0, 9);
  const directEnCours = articles.find((a) => a.format === 'LIVE');
  const pub = campagnes?.[0];

  return (
    <>
      <TickerVieChere prix={prix} />
      <DerniereMinute articles={articles.slice(0, 6)} basePath={BASE_PATH} />

      {directEnCours && (
        <Link href={`${BASE_PATH}/article/${directEnCours.slug}`} className="block bg-ink text-white">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-coral text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
            </span>
            <span className="text-[13px] font-medium truncate hover:text-coral transition-colors">{directEnCours.titre}</span>
          </div>
        </Link>
      )}

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-8">
        {(uneDuJour?.couvertureUrl || resumeDuJour.length > 0) && (
          <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8">
            {uneDuJour?.couvertureUrl && (
              <div>
                <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden shadow-xl border border-line">
                  <ImageProtegee src={uneDuJour.couvertureUrl} alt={`Une n°${uneDuJour.numero}`} fill sizes="(max-width: 1024px) 100vw, 380px" priority className="object-cover" />
                </div>
                <span className="font-mono text-[11px] text-muted mt-3 block">
                  N°{uneDuJour.numero} — {formatDateRange(uneDuJour.dateParution, uneDuJour.dateFin)}
                </span>
                <DeverrouillerPdf editionId={uneDuJour.id} verrouille={uneDuJour.verrouille} />
              </div>
            )}

            <div className="bg-navy rounded-[10px] p-5 text-white">
              <h3 className="font-serif text-[16px] mb-1">5 choses à retenir aujourd&apos;hui</h3>
              <ol className="pl-0 text-[12.5px] text-[#D8DCEA]">
                {resumeDuJour.map((a, i) => (
                  <li key={a.id} className="flex gap-2.5 py-2.5 border-t border-white/10 first:border-t-0">
                    <span className="font-mono text-[#22D3EE] font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <Link href={`${BASE_PATH}/article/${a.slug}`} className="hover:text-white leading-snug">{a.titre}</Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Article vedette — tiré du numéro du jour, en pleine taille, juste après le bloc Une + 5 choses. */}
        {une && (
          <Link href={`${BASE_PATH}/article/${une.slug}`} className="group block mt-8">
            <div className="relative h-[220px] sm:h-[300px] rounded-[10px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
              {une.imageUneUrl && (
                <Image src={une.imageUneUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 1180px" className="object-cover" />
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
              {une.chapo && <p className="text-muted text-[14.5px] mt-2.5 leading-relaxed max-w-2xl">{une.chapo}</p>}
              <div className="flex gap-3 items-center mt-3.5 font-mono text-[11px] text-muted">
                <span>{timeAgo(une.publieLe)}</span>
                {une.auteur && <span>· {une.auteur.prenom} {une.auteur.nom}</span>}
              </div>
            </div>
          </Link>
        )}

        <FactCheckBlock factChecks={factChecks} basePath={BASE_PATH} />
      </section>

      <FlashBar articles={flashEtLive} basePath={BASE_PATH} />

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
        <RubriqueTabs rubriques={rubriques} basePath={BASE_PATH} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {grille.slice(0, 5).map((a) => (
            <ArticleCard key={a.id} article={a} basePath={BASE_PATH} />
          ))}
          {pub && <PubCard campagne={pub} />}
          {grille.slice(5).map((a) => (
            <ArticleCard key={a.id} article={a} basePath={BASE_PATH} />
          ))}
        </div>
      </section>
    </>
  );
}
