import Link from 'next/link';
import Image from 'next/image';

// Bloc "ACTUALITÉS" façon bas de page nytimes.com : une colonne par
// rubrique, chacune avec un article en tête (photo + titre + accroche) et
// 2-3 titres courts en dessous, séparées par de fines lignes verticales.
// Remplace la grille uniforme de cartes identiques.
export default function ColonneActualites({ colonnes, basePath = '', titre = 'Actualités' }) {
  if (!colonnes?.length) return null;

  return (
    <div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest pb-3 mb-6 border-b" style={{ borderColor: '#232B45', color: '#8993B0' }}>
        {titre}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-8 gap-y-10">
        {colonnes.map(([nom, g], i) => {
          const [tete, ...reste] = g.articles;
          return (
            <div key={nom} className={i > 0 ? 'sm:pl-8 sm:border-l' : ''} style={i > 0 ? { borderColor: '#232B45' } : undefined}>
              <span className="block font-mono text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: g.couleur || '#22D3EE' }}>
                {nom}
              </span>

              {tete && (
                <Link href={`${basePath}/article/${tete.slug}`} className="group block mb-4">
                  {tete.imageUneUrl && (
                    <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-2.5">
                      <Image src={tete.imageUneUrl} alt="" fill sizes="220px" className="object-cover" />
                    </div>
                  )}
                  <h4 className="font-serif text-[15px] leading-snug group-hover:text-[#22D3EE] transition-colors">{tete.titre}</h4>
                  {tete.chapo && <p className="text-[12px] mt-1.5 leading-snug" style={{ color: '#8993B0' }}>{tete.chapo}</p>}
                </Link>
              )}

              {reste.length > 0 && (
                <ul>
                  {reste.map((a) => (
                    <li key={a.id} className="border-t py-2.5 first:border-t-0" style={{ borderColor: '#232B45' }}>
                      <Link href={`${basePath}/article/${a.slug}`} className="text-[13px] leading-snug hover:text-[#22D3EE] transition-colors">
                        {a.titre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
