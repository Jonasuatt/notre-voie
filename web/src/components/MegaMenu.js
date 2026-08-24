'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Navigation "mega-menu" façon nytimes.com pour Info en direct : au survol
// (desktop) ou au clic (tactile), chaque pilier déroule un panneau avec ses
// rubriques et ses derniers articles réels — pas de sous-catégories
// inventées. cf. demande explicite : "Tout le menu" + présentation NYT.
export default function MegaMenu({ piliers, basePath }) {
  const [ouvert, setOuvert] = useState(null);
  const fermerTimeout = useRef(null);

  function ouvrir(cle) {
    clearTimeout(fermerTimeout.current);
    setOuvert(cle);
  }
  function fermerDifferee() {
    fermerTimeout.current = setTimeout(() => setOuvert(null), 150);
  }

  return (
    <div className="flex items-center gap-6 relative">
      {piliers.map((pilier) => (
        <div key={pilier.cle} onMouseEnter={() => ouvrir(pilier.cle)} onMouseLeave={fermerDifferee}>
          <button
            type="button"
            onClick={() => setOuvert((c) => (c === pilier.cle ? null : pilier.cle))}
            className={`hover:text-[#22D3EE] transition-colors ${ouvert === pilier.cle ? 'text-[#22D3EE]' : ''}`}
            aria-expanded={ouvert === pilier.cle}
          >
            {pilier.label}
          </button>

          {ouvert === pilier.cle && (
            <div
              className="fixed left-0 right-0 top-[72px] bg-[#0d1220] border-t border-b border-[#232B45] shadow-2xl z-40"
              onMouseEnter={() => ouvrir(pilier.cle)}
              onMouseLeave={fermerDifferee}
            >
              <div className="max-w-[1180px] mx-auto px-8 py-8 grid grid-cols-[220px_1fr] gap-10">
                <div>
                  <span className="block font-mono text-[10.5px] uppercase tracking-widest text-[#8993B0] mb-3">Rubriques</span>
                  <ul className="space-y-2">
                    {pilier.liensRubriques.map((r) => (
                      <li key={r.href}>
                        <Link
                          href={`${basePath}${r.href}`}
                          onClick={() => setOuvert(null)}
                          className="text-[14px] font-normal text-[#E7EBF7] hover:text-[#22D3EE] transition-colors"
                        >
                          {r.label}
                        </Link>
                      </li>
                    ))}
                    {pilier.liensSupplementaires?.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={`${basePath}${l.href}`}
                          onClick={() => setOuvert(null)}
                          className="text-[14px] font-normal text-[#E7EBF7] hover:text-[#22D3EE] transition-colors"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {pilier.aLaUne.length > 0 && (
                  <div>
                    <span className="block font-mono text-[10.5px] uppercase tracking-widest text-[#8993B0] mb-3">En ce moment</span>
                    <div className="grid grid-cols-4 gap-6">
                      {pilier.aLaUne.map((a) => (
                        <Link
                          key={a.id}
                          href={`${basePath}/article/${a.slug}`}
                          onClick={() => setOuvert(null)}
                          className="group block"
                        >
                          {a.imageUneUrl && (
                            <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-2 bg-[#171d30]">
                              <Image src={a.imageUneUrl} alt="" fill sizes="200px" className="object-cover" />
                            </div>
                          )}
                          <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: a.rubrique?.couleur || '#22D3EE' }}>
                            {a.rubrique?.nom}
                          </span>
                          <p className="text-[13px] leading-snug mt-1 font-serif group-hover:text-[#22D3EE] transition-colors">{a.titre}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
