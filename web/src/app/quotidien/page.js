import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getTicker, getEditions } from '@/lib/api';
import TickerVieChere from '@/components/TickerVieChere';
import PagesDuJournal from '@/components/PagesDuJournal';
import { formatDateRange } from '@/lib/format';

const BASE_PATH = '/quotidien';

// Quotidien : la Une et le fil changent chaque jour, jamais figés au build.
export const dynamic = 'force-dynamic';

export default async function QuotidienAccueilPage() {
  const [{ articles }, prix, editions] = await Promise.all([
    getArticles({ pageSize: 24, portail: 'QUOTIDIEN' }),
    getTicker(),
    getEditions({ pageSize: 1 }),
  ]);
  const uneDuJour = editions?.[0];

  // Le Quotidien reprend le contenu du journal papier tel quel : pas de
  // couverture "En direct" (format propre à la rédaction web, cf. Header.js).
  const flashEtLive = articles.filter((a) => a.format === 'FLASH').slice(0, 8);
  const resumeDuJour = articles.slice(0, 5);

  return (
    <>
      <TickerVieChere prix={prix} />

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-8">
        {uneDuJour?.couvertureUrl && (
          <div className="max-w-[300px]">
            <a href={uneDuJour.pdfUrl} target="_blank" rel="noreferrer" className="block group">
              <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden shadow-xl border border-line">
                <Image src={uneDuJour.couvertureUrl} alt={`Une n°${uneDuJour.numero}`} fill sizes="(max-width: 1024px) 100vw, 300px" priority className="object-cover" />
              </div>
            </a>
            <div className="flex items-center justify-between mt-3">
              <span className="font-mono text-[11px] text-muted">
                N°{uneDuJour.numero} — {formatDateRange(uneDuJour.dateParution, uneDuJour.dateFin)}
              </span>
              <a href={uneDuJour.pdfUrl} target="_blank" rel="noreferrer" className="text-[11.5px] font-bold text-coral hover:underline shrink-0 ml-3">
                Lire le journal (PDF) →
              </a>
            </div>
          </div>
        )}

        {/* Les pages du journal — reprise fidèle de la maquette papier, chaque
            page renvoie vers la rubrique qui y est réellement traitée. */}
        <PagesDuJournal pages={uneDuJour?.pages} basePath={BASE_PATH} />

        {/* Flash (à gauche) et 5 choses à retenir (en face) — deux façons
            complémentaires de rejoindre l'actualité du jour. */}
        {(flashEtLive.length > 0 || resumeDuJour.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {flashEtLive.length > 0 && (
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Flash</h3>
                <div className="flex flex-wrap gap-3">
                  {flashEtLive.map((a) => (
                    <Link
                      key={a.id}
                      href={`${BASE_PATH}/article/${a.slug}`}
                      className="text-[13px] font-medium bg-cream border border-line rounded-full px-4 py-2 hover:border-coral hover:text-coral transition-colors"
                    >
                      {a.titre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {resumeDuJour.length > 0 && (
              <div className="bg-navy rounded-[10px] p-5 text-white">
                <h3 className="font-serif text-[16px] mb-3">5 choses à retenir aujourd&apos;hui</h3>
                <ol className="list-decimal pl-[18px] space-y-2.5 text-[12.5px] text-[#D8DCEA]">
                  {resumeDuJour.map((a) => (
                    <li key={a.id}>
                      <Link href={`${BASE_PATH}/article/${a.slug}`} className="hover:text-white">{a.titre}</Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
