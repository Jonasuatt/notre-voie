'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Navigation "mega-menu" façon nytimes.com pour Info en direct : au survol
// (desktop) ou au clic (tactile), chaque pilier déroule un panneau avec ses
// rubriques et ses derniers articles réels — pas de sous-catégories
// inventées. cf. demande explicite : "Tout le menu" + présentation NYT.
export default function MegaMenu({ piliers, basePath }) {
  const [ouvert, setOuvert] = useState(null);
  const fermerTimeout = useRef(null);
  const conteneurRef = useRef(null);

  function ouvrir(cle) {
    clearTimeout(fermerTimeout.current);
    setOuvert(cle);
  }
  function fermerDifferee() {
    fermerTimeout.current = setTimeout(() => setOuvert(null), 150);
  }

  // Clic en dehors ou touche Échap : ferme le panneau ouvert (utile au
  // clic/tactile, qui ne déclenche pas onMouseLeave).
  useEffect(() => {
    if (!ouvert) return;
    function surClicExterieur(e) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target)) setOuvert(null);
    }
    function surEchap(e) {
      if (e.key === 'Escape') setOuvert(null);
    }
    document.addEventListener('mousedown', surClicExterieur);
    document.addEventListener('keydown', surEchap);
    return () => {
      document.removeEventListener('mousedown', surClicExterieur);
      document.removeEventListener('keydown', surEchap);
    };
  }, [ouvert]);

  return (
    <div ref={conteneurRef} className="flex items-center gap-6 relative">
      {piliers.map((pilier) => (
        <div key={pilier.cle} onMouseEnter={() => ouvrir(pilier.cle)} onMouseLeave={fermerDifferee}>
          <button
            type="button"
            onClick={() => ouvrir(pilier.cle)}
            className={`hover:text-[#22D3EE] transition-colors ${ouvert === pilier.cle ? 'text-[#22D3EE]' : ''}`}
            aria-expanded={ouvert === pilier.cle}
          >
            {pilier.label}
          </button>

          {ouvert === pilier.cle && (
            <div
              className="fixed left-0 right-0 top-[72px] bg-[#454F66] border-t border-b border-[#6E7897] shadow-2xl z-40"
              onMouseEnter={() => ouvrir(pilier.cle)}
              onMouseLeave={fermerDifferee}
            >
              <div
                className={`max-w-[1180px] mx-auto px-8 py-8 grid gap-10 min-h-[280px] ${
                  pilier.blocSecours ? 'grid-cols-[220px_1fr_240px]' : 'grid-cols-[220px_1fr]'
                }`}
              >
                <div>
                  <span className="block font-mono text-[10.5px] uppercase tracking-widest text-[#A9B2C9] mb-3">Rubriques</span>
                  <ul className="space-y-2">
                    {pilier.liensRubriques.map((r) => (
                      <li key={r.href}>
                        <Link
                          href={`${basePath}${r.href}`}
                          onClick={() => setOuvert(null)}
                          className="inline-block text-[14px] font-normal text-[#E7EBF7] hover:text-[#22D3EE] hover:translate-x-1 transition-all"
                        >
                          {r.label}
                        </Link>
                        {r.sousRubriques?.length > 0 && (
                          <ul className="mt-1.5 ml-3 space-y-1 border-l border-[#6E7897] pl-3">
                            {r.sousRubriques.map((sr) => (
                              <li key={sr.href}>
                                <Link
                                  href={`${basePath}${sr.href}`}
                                  onClick={() => setOuvert(null)}
                                  className="inline-block text-[12.5px] text-[#A9B2C9] hover:text-[#22D3EE] hover:translate-x-1 transition-all"
                                >
                                  {sr.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                    {pilier.liensSupplementaires?.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={`${basePath}${l.href}`}
                          onClick={() => setOuvert(null)}
                          className="inline-flex items-center gap-2 text-[14px] font-normal text-[#E7EBF7] hover:text-[#22D3EE] hover:translate-x-1 transition-all"
                        >
                          {l.pastilleLive && <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse shrink-0" />}
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {pilier.aLaUne.length > 0 && (
                  <div>
                    <span className="block font-mono text-[10.5px] uppercase tracking-widest text-[#A9B2C9] mb-3">En ce moment</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      {pilier.aLaUne.map((a) => (
                        <Link
                          key={a.id}
                          href={`${basePath}/article/${a.slug}`}
                          onClick={() => setOuvert(null)}
                          className="group flex gap-3"
                        >
                          {a.imageUneUrl && (
                            <div className="relative w-[76px] h-[76px] shrink-0 rounded-[6px] overflow-hidden bg-[#525E78]">
                              <Image src={a.imageUneUrl} alt="" fill sizes="76px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: a.rubrique?.couleur || '#22D3EE' }}>
                              {a.rubrique?.nom}
                            </span>
                            <p className="text-[13px] leading-snug mt-1 font-serif line-clamp-2 group-hover:text-[#22D3EE] transition-colors">
                              {a.titre}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {pilier.blocSecours && <BlocSecours secours={pilier.blocSecours} basePath={basePath} onNaviguer={() => setOuvert(null)} />}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Bloc mis en avant à droite quand un pilier a peu d'articles ("En ce
// moment" < 3) — toujours du vrai contenu/lien du site, jamais un widget
// factice (pas de formulaire newsletter/WhatsApp inexistant côté site).
function BlocSecours({ secours, basePath, onNaviguer }) {
  const conteneur = 'rounded-[10px] border border-[#6E7897] bg-[#4B5570] p-4 flex flex-col h-full';

  if (secours.type === 'kiosque' && secours.edition) {
    const { edition } = secours;
    return (
      <div className={conteneur}>
        <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#A9B2C9] mb-3">Kiosque numérique</span>
        <div className="relative aspect-[3/4] rounded-[6px] overflow-hidden mb-3 bg-[#404A5E]">
          <Image src={edition.couvertureUrl} alt={`Une n°${edition.numero}`} fill sizes="200px" className="object-cover" />
        </div>
        <p className="text-[12px] text-[#A9B2C9] mb-3">N°{edition.numero} — édition du jour</p>
        <Link
          href={`${basePath}/kiosque`}
          onClick={onNaviguer}
          className="mt-auto text-center text-[12.5px] font-bold bg-[#22D3EE] text-[#0a0e1a] rounded-full py-2 hover:brightness-95 transition"
        >
          Télécharger le numéro
        </Link>
      </div>
    );
  }

  if (secours.type === 'audio' && secours.article) {
    const { article } = secours;
    return (
      <div className={conteneur}>
        <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#A9B2C9] mb-3">🎧 Dernier podcast</span>
        <p className="text-[14px] font-serif leading-snug mb-3">{article.titre}</p>
        <Link
          href={`${basePath}/article/${article.slug}`}
          onClick={onNaviguer}
          className="mt-auto text-center text-[12.5px] font-bold bg-[#22D3EE] text-[#0a0e1a] rounded-full py-2 hover:brightness-95 transition"
        >
          Écouter
        </Link>
        <Link
          href={`${basePath}/rubrique/audio-podcasts`}
          onClick={onNaviguer}
          className="mt-2 text-center text-[12px] text-[#A9B2C9] hover:text-[#22D3EE] transition-colors"
        >
          Tous les épisodes →
        </Link>
      </div>
    );
  }

  // Fallback universel : abonnement (page réelle existante).
  return (
    <div className={conteneur}>
      <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#A9B2C9] mb-3">Notre Voie</span>
      <p className="text-[14px] font-serif leading-snug mb-3">Un accès illimité au site et à l&apos;application, ou à l&apos;article.</p>
      <Link
        href={`${basePath}/abonnement`}
        onClick={onNaviguer}
        className="mt-auto text-center text-[12.5px] font-bold bg-[#22D3EE] text-[#0a0e1a] rounded-full py-2 hover:brightness-95 transition"
      >
        S&apos;abonner
      </Link>
    </div>
  );
}
