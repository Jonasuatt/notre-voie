'use client';

import { useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// Format publicitaire natif : même gabarit qu'une carte d'article (cf.
// cahier des charges §5 — "formats publicitaires natifs inspirés des
// cartes d'articles, moins intrusifs, mieux intégrés à la lecture"),
// clairement étiqueté "Sponsorisé" pour ne jamais induire en erreur.
export default function PubCard({ campagne }) {
  const compteRendu = useRef(false);

  useEffect(() => {
    if (compteRendu.current || !campagne?.id) return;
    compteRendu.current = true;
    fetch(`${API_URL}/api/campagnes/${campagne.id}/impression`, { method: 'POST' }).catch(() => {});
  }, [campagne?.id]);

  if (!campagne) return null;

  const enregistrerClic = () => {
    fetch(`${API_URL}/api/campagnes/${campagne.id}/clic`, { method: 'POST' }).catch(() => {});
  };

  return (
    <a
      href={campagne.lienUrl || '#'}
      target="_blank"
      rel="noopener sponsored"
      onClick={enregistrerClic}
      className="block bg-white rounded-[10px] border border-line overflow-hidden group"
    >
      <div className="relative h-[150px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
        {campagne.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campagne.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-muted text-[9px] font-mono uppercase tracking-wide px-1.5 py-1 rounded">Sponsorisé</span>
      </div>
      <div className="p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-wide text-muted">{campagne.annonceur?.nom}</div>
        <h4 className="font-serif text-[16.5px] leading-snug mt-2 group-hover:text-coral transition-colors">
          {campagne.titre}
        </h4>
        <span className="inline-block mt-3 text-[12px] font-bold text-navy group-hover:text-coral transition-colors">
          {campagne.texteCTA || 'En savoir plus'} →
        </span>
      </div>
    </a>
  );
}
