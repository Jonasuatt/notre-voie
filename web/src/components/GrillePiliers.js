import Link from 'next/link';
import Image from 'next/image';
import { timeAgo } from '@/lib/format';

// Bloc "Actualités" du bas de l'accueil — grille asymétrique 8+4 plutôt
// qu'une grille uniforme à 5 colonnes trop étroites (retour explicite :
// "les titres sont compressés"). Colonne principale (8/12) : 2x2 grandes
// cartes visuelles pour les piliers majeurs. Colonne latérale (4/12) :
// titres courts empilés pour le reste — rien n'est perdu, juste hiérarchisé.
export default function GrillePiliers({ colonnes, basePath = '', titre = 'Actualités' }) {
  if (!colonnes?.length) return null;

  const principales = colonnes.slice(0, 4);
  const cartesPrincipales = principales.map(([nom, g]) => ({ nom, couleur: g.couleur, article: g.articles[0] })).filter((c) => c.article);
  const resteParColonne = [
    ...principales.map(([nom, g]) => [nom, { couleur: g.couleur, articles: g.articles.slice(1) }]),
    ...colonnes.slice(4),
  ].filter(([, g]) => g.articles.length > 0);

  return (
    <div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest pb-3 mb-6 border-b" style={{ borderColor: '#5B6480', color: '#8993B0' }}>
        {titre}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-8">
          {cartesPrincipales.map(({ nom, couleur, article }) => (
            <Link key={article.id} href={`${basePath}/article/${article.slug}`} className="group block">
              {article.imageUneUrl && (
                <div className={`relative rounded-[8px] overflow-hidden mb-3 bg-[#404A63] ${nom === 'Formats Verticaux' ? 'aspect-[9/16] max-h-64 mx-auto max-w-[220px]' : 'aspect-video'}`}>
                  <Image src={article.imageUneUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  {(article.format === 'VIDEO_COURTE' || article.format === 'LIVE') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                      <span className="w-11 h-11 rounded-full bg-white/85 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0e1a"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </div>
                  )}
                  {article.dureeEcouteSec && (
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                      {Math.floor(article.dureeEcouteSec / 60)}:{String(article.dureeEcouteSec % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
              )}
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest" style={{ color: couleur || '#22D3EE' }}>{nom}</span>
              <h4 className="font-serif text-[17px] leading-snug mt-1.5 group-hover:text-[#22D3EE] transition-colors">{article.titre}</h4>
              {article.chapo && <p className="text-[12.5px] mt-1.5 leading-snug line-clamp-2" style={{ color: '#B8C0D9' }}>{article.chapo}</p>}
              <span className="font-mono text-[10.5px] mt-2 block" style={{ color: '#8993B0' }}>{timeAgo(article.publieLe)}</span>
            </Link>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-7">
          {resteParColonne.map(([nom, g]) => (
            <div key={nom}>
              <span className="block font-mono text-[10.5px] font-bold uppercase tracking-widest mb-2" style={{ color: g.couleur || '#22D3EE' }}>{nom}</span>
              <ul>
                {g.articles.map((a) => (
                  <li key={a.id} className="border-t py-2.5 first:border-t-0" style={{ borderColor: '#5B6480' }}>
                    <Link href={`${basePath}/article/${a.slug}`} className="text-[13px] leading-snug text-[#E7EBF7] hover:text-[#22D3EE] transition-colors">{a.titre}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
