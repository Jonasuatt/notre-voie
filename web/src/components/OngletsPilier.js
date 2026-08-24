'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { timeAgo } from '@/lib/format';

// Module à onglets pour un pilier de l'accueil — bascule entre 3
// sous-thèmes (ex. Politique / Régions / Diaspora) sans rechargement de
// page. Données déjà pré-récupérées côté serveur (cf. lib/onglets.js) :
// aucun fetch client, uniquement du vrai contenu déjà publié.
export default function OngletsPilier({ titre, onglets, basePath = '' }) {
  const [actif, setActif] = useState(0);
  if (!onglets?.length) return null;
  const courant = onglets[actif] || onglets[0];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 pb-3 mb-6 border-b" style={{ borderColor: '#232B45' }}>
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#8993B0' }}>{titre}</h3>
        <div className="flex gap-1.5">
          {onglets.map((o, i) => (
            <button
              key={o.slug}
              type="button"
              onClick={() => setActif(i)}
              className={`text-[12.5px] font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                i === actif ? 'bg-[#22D3EE] text-[#0a0e1a]' : 'text-[#8993B0] hover:text-[#E7EBF7]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courant.articles.map((a) => (
          <Link key={a.id} href={`${basePath}/article/${a.slug}`} className="group block">
            {a.imageUneUrl && (
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden mb-2.5 bg-[#171d30]">
                <Image src={a.imageUneUrl} alt="" fill sizes="260px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                {(a.format === 'VIDEO_COURTE' || a.format === 'LIVE') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                    <span className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#0a0e1a"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </div>
                )}
              </div>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: a.rubrique?.couleur || '#22D3EE' }}>{a.rubrique?.nom}</span>
            <h4 className="font-serif text-[15px] leading-snug mt-1 line-clamp-2 group-hover:text-[#22D3EE] transition-colors">{a.titre}</h4>
            <span className="font-mono text-[10.5px] mt-1.5 block" style={{ color: '#8993B0' }}>{timeAgo(a.publieLe)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
