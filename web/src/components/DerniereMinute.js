import Link from 'next/link';
import { timeAgo } from '@/lib/format';

// Bandeau "Dernière minute" — strip horodaté façon lemonde.fr, en
// défilement continu comme le Flash Info (mêmes keyframes ticker-*, cf.
// globals.css) : contenu dupliqué une fois pour une boucle sans coupure,
// pause au survol.
export default function DerniereMinute({ articles, basePath = '' }) {
  if (!articles?.length) return null;
  const boucle = [...articles, ...articles];

  return (
    <div className="border-y border-[#2E6D9E] bg-[#0B3358] overflow-hidden">
      <div className="max-w-[1180px] mx-auto flex items-stretch">
        <span className="flex-none flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#4FB3F0] px-4 py-2.5 border-r border-[#2E6D9E] z-10 bg-[#0B3358]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4FB3F0] dot-live" /> Dernière minute
        </span>
        <div className="ticker-piste flex-1 overflow-hidden">
          <div className="ticker-defiler flex items-stretch w-max" style={{ '--ticker-duree': `${Math.max(articles.length * 14, 60)}s` }}>
            {boucle.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`${basePath}/article/${a.slug}`}
                className="flex-none flex items-center gap-2.5 px-4 py-2.5 border-r border-[#2E6D9E] hover:bg-white/5 transition-colors"
              >
                <span className="font-mono text-[10.5px] text-[#A9C6DD] tabular-nums">{timeAgo(a.publieLe)}</span>
                <span className="text-[12.5px] text-[#EAF3FB] whitespace-nowrap">{a.titre}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
