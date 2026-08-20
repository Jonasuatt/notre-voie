import Link from 'next/link';
import { timeAgo } from '@/lib/format';

// Bandeau "Dernière minute" — inspiré du strip horodaté en tête de
// lemonde.fr : une ligne compacte, heure + titre, pour montrer que le fil
// vit en continu. Complète le FlashBar (bulles façon story) sans le
// remplacer ; propre à Info en direct, pas de vraie fraîcheur minute par
// minute à reproduire côté Quotidien (contenu du jour, pas du direct).
export default function DerniereMinute({ articles, basePath = '' }) {
  if (!articles?.length) return null;

  return (
    <div className="border-y border-[#232B45] bg-[#0a0e1a]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 flex items-stretch gap-0 overflow-x-auto">
        <span className="flex-none flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-[#22D3EE] pr-4 py-2.5 border-r border-[#232B45]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] dot-live" /> Dernière minute
        </span>
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`${basePath}/article/${a.slug}`}
            className="flex-none flex items-center gap-2.5 px-4 py-2.5 border-r border-[#232B45] last:border-r-0 hover:bg-white/5 transition-colors"
          >
            <span className="font-mono text-[10.5px] text-[#8993B0] tabular-nums">{timeAgo(a.publieLe)}</span>
            <span className="text-[12.5px] text-[#E7EBF7] whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis">{a.titre}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
