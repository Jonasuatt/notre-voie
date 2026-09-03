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
    <div className="border-y border-[#6E7897] bg-[#404A5E] overflow-hidden">
      <div className="max-w-[1180px] mx-auto flex items-stretch">
        <span className="flex-none flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#22D3EE] px-4 py-2.5 border-r border-[#6E7897] z-10 bg-[#404A5E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] dot-live" /> Dernière minute
        </span>
        <div className="ticker-piste flex-1 overflow-hidden">
          <div className="ticker-defiler flex items-stretch w-max" style={{ '--ticker-duree': `${Math.max(articles.length * 14, 60)}s` }}>
            {boucle.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`${basePath}/article/${a.slug}`}
                className="flex-none flex items-center gap-2.5 px-4 py-2.5 border-r border-[#6E7897] hover:bg-white/5 transition-colors"
              >
                <span className="font-mono text-[10.5px] text-[#A9B2C9] tabular-nums">{timeAgo(a.publieLe)}</span>
                <span className="text-[12.5px] text-[#E7EBF7] whitespace-nowrap">{a.titre}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
