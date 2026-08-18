import Link from 'next/link';
import FormatBadge from './FormatBadge';
import { timeAgo } from '@/lib/format';

export default function ArticleCard({ article }) {
  return (
    <Link href={`/article/${article.slug}`} className="block bg-white rounded-[10px] border border-line overflow-hidden group">
      <div className="relative h-[150px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
        <FormatBadge format={article.format} />
        {article.paywall === 'PAYANT' && (
          <span className="absolute top-2.5 right-2.5 bg-ink/70 text-white text-[9px] font-mono px-1.5 py-1 rounded">Abonnés</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-wide" style={{ color: article.rubrique?.couleur || '#0B6FA8' }}>
          {article.rubrique?.nom}
        </div>
        <h4 className="font-serif text-[16.5px] leading-snug mt-2 group-hover:text-coral transition-colors">
          {article.titre}
        </h4>
        {article.chapo && <p className="text-muted text-[13px] mt-2 line-clamp-2">{article.chapo}</p>}
        <div className="flex items-center gap-3 mt-3 font-mono text-[10.5px] text-muted">
          <span>{timeAgo(article.publieLe)}</span>
          {article.dureeEcouteSec ? <span>· 🎧 {Math.round(article.dureeEcouteSec / 60)} min</span> : null}
        </div>
      </div>
    </Link>
  );
}
