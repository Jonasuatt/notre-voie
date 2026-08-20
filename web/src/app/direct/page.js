import Link from 'next/link';
import Image from 'next/image';
import { getArticles } from '@/lib/api';
import { timeAgo } from '@/lib/format';

export const metadata = { title: 'En direct' };

// Fil des couvertures en direct (format LIVE) — élection, match, actualité
// chaude avec mises à jour successives. Cf. cahier des charges §2 (format
// Live) et §3 (badge "DIRECT" en Une).
export default async function DirectPage() {
  const { articles } = await getArticles({ format: 'LIVE', pageSize: 20 });

  return (
    <section className="max-w-[820px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 bg-coral text-white text-[11px] font-bold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
        </span>
      </div>
      <h1 className="font-serif text-[30px] mt-3">Les directs</h1>
      <p className="text-muted text-[14px] mt-2">Couvertures en direct : élections, matchs, actualité chaude — mises à jour au fil de l&apos;événement.</p>

      {articles.length === 0 ? (
        <p className="text-muted text-sm py-16 text-center border-t border-line mt-8">Aucun direct en cours pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {articles.map((a) => (
            <Link key={a.id} href={`/article/${a.slug}`} className="flex gap-4 bg-white border border-line rounded-[10px] overflow-hidden group">
              <div className="relative w-[140px] h-[110px] shrink-0 bg-gradient-to-br from-navy2 to-navy">
                {a.imageUneUrl && <Image src={a.imageUneUrl} alt="" fill sizes="140px" className="object-cover" />}
              </div>
              <div className="py-3 pr-4 min-w-0">
                <span className="font-mono text-[10.5px] uppercase tracking-wide" style={{ color: a.rubrique?.couleur }}>{a.rubrique?.nom}</span>
                <h2 className="font-serif text-[17px] leading-snug mt-1 group-hover:text-coral transition-colors">{a.titre}</h2>
                <p className="font-mono text-[10.5px] text-muted mt-2">Mis à jour {timeAgo(a.updatedAt || a.publieLe)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
