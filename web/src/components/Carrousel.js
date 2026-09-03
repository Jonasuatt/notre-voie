'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { timeAgo } from '@/lib/format';

// Carrousel horizontal (scroll-snap natif, flèches de navigation) pour
// "Enquêtes & Décryptage" — met en avant les formats longs (DECRYPTAGE)
// avec un mouvement naturel plutôt qu'une grille figée.
export default function Carrousel({ titre, articles, basePath = '' }) {
  const pisteRef = useRef(null);
  if (!articles?.length) return null;

  function defiler(direction) {
    const piste = pisteRef.current;
    if (!piste) return;
    piste.scrollBy({ left: direction * (piste.clientWidth * 0.8), behavior: 'smooth' });
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-6 border-b" style={{ borderColor: '#6E7897' }}>
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A9B2C9' }}>{titre}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => defiler(-1)}
            aria-label="Précédent"
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{ borderColor: '#6E7897', color: '#E7EBF7' }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => defiler(1)}
            aria-label="Suivant"
            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{ borderColor: '#6E7897', color: '#E7EBF7' }}
          >
            ›
          </button>
        </div>
      </div>

      <div ref={pisteRef} className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-fine">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`${basePath}/article/${a.slug}`}
            className="group block shrink-0 w-[260px] snap-start"
          >
            {a.imageUneUrl && (
              <div className="relative aspect-video rounded-[8px] overflow-hidden mb-2.5 bg-[#525E78]">
                <Image src={a.imageUneUrl} alt="" fill sizes="260px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: a.rubrique?.couleur || '#22D3EE' }}>{a.rubrique?.nom}</span>
            <h4 className="font-serif text-[15px] leading-snug mt-1 line-clamp-3 group-hover:text-[#22D3EE] transition-colors">{a.titre}</h4>
            <span className="font-mono text-[10.5px] mt-1.5 block" style={{ color: '#A9B2C9' }}>{timeAgo(a.publieLe)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
