import Link from 'next/link';
import Image from 'next/image';
import FormatBadge from './FormatBadge';
import { timeAgo } from '@/lib/format';

export default function ArticleCard({ article, basePath = '' }) {
  return (
    <Link href={`${basePath}/article/${article.slug}`} className="block bg-white rounded-[10px] border border-line overflow-hidden group">
      <div className="relative aspect-video bg-gradient-to-br from-navy2 to-navy overflow-hidden">
        {article.imageUneUrl && (
          <Image
            src={article.imageUneUrl} alt="" fill sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <FormatBadge format={article.format} />
        {article.paywall === 'PAYANT' && (
          <span className="absolute top-2.5 right-2.5 bg-ink/70 text-white text-[9px] font-mono px-1.5 py-1 rounded">Abonnés</span>
        )}
        {(article.format === 'VIDEO_COURTE' || article.format === 'LIVE') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
            <span className="w-10 h-10 rounded-full bg-white/85 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0e1a"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </div>
        )}
        {article.dureeEcouteSec && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
            {Math.floor(article.dureeEcouteSec / 60)}:{String(article.dureeEcouteSec % 60).padStart(2, '0')}
          </span>
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
