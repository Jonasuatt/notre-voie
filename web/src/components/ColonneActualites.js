import Link from 'next/link';
import Image from 'next/image';

// Icône décorative devant l'intitulé d'une colonne, pour les rubriques
// service facilement identifiables visuellement (retour explicite :
// "icône micro/casque pour Audio, appareil photo pour Photos légendées").
const ICONE_COLONNE = {
  'Audio / Podcasts': '🎧',
  'Vidéos': '🎬',
  'Photos légendées': '📷',
  'Nécrologie': '🕯️',
};

// Nombre de colonnes du grid selon le nombre réel de groupes fournis —
// évite un grand espace vide à droite quand moins de 5 rubriques ont du
// contenu (ex. 2 dossiers sur une grille prévue pour 5) plutôt que
// d'inventer des rubriques vides pour combler la largeur.
function classesGrille(n) {
  if (n <= 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-1 md:grid-cols-2';
  if (n === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (n === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
}

// Bloc "ACTUALITÉS" façon bas de page nytimes.com : une colonne par
// rubrique, chacune avec un article en tête (photo + titre + accroche) et
// 2-3 titres courts en dessous, séparées par de fines lignes verticales.
// `styleCartes` habille chaque colonne d'une carte à hauteur égale
// (flex h-full) — utilisé pour "Aussi sur Info en direct", dont les
// colonnes ont des volumes de texte très inégaux (Vidéos/Audio vs
// Photos légendées).
export default function ColonneActualites({ colonnes, basePath = '', titre = 'Actualités', styleCartes = false }) {
  if (!colonnes?.length) return null;

  return (
    <div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest pb-3 mb-6 border-b" style={{ borderColor: '#232B45', color: '#8993B0' }}>
        {titre}
      </h3>
      <div className={`grid ${classesGrille(colonnes.length)} gap-x-8 gap-y-10`}>
        {colonnes.map(([nom, g], i) => {
          const [tete, ...reste] = g.articles;
          const vertical = nom === 'Formats Verticaux';
          const contenu = (
            <>
              <span className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: g.couleur || '#22D3EE' }}>
                {ICONE_COLONNE[nom] && <span aria-hidden>{ICONE_COLONNE[nom]}</span>}
                {nom}
              </span>

              {tete && (
                <Link href={`${basePath}/article/${tete.slug}`} className="group block mb-4">
                  {tete.imageUneUrl && (
                    <div className={`relative rounded-[6px] overflow-hidden mb-2.5 bg-[#171d30] ${vertical ? 'aspect-[9/16] max-h-64 mx-auto max-w-[180px]' : 'aspect-video'}`}>
                      <Image src={tete.imageUneUrl} alt="" fill sizes="220px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      {(tete.format === 'VIDEO_COURTE' || tete.format === 'LIVE') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                          <span className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#0a0e1a"><path d="M8 5v14l11-7z" /></svg>
                          </span>
                        </div>
                      )}
                      {tete.dureeEcouteSec && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white font-mono text-[9.5px] px-1.5 py-0.5 rounded">
                          {Math.floor(tete.dureeEcouteSec / 60)}:{String(tete.dureeEcouteSec % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  )}
                  <h4 className="font-serif text-[15px] leading-snug group-hover:text-[#22D3EE] transition-colors">{tete.titre}</h4>
                  {tete.chapo && <p className="text-[12px] mt-1.5 leading-snug" style={{ color: '#B8C0D9' }}>{tete.chapo}</p>}
                </Link>
              )}

              {reste.length > 0 && (
                <ul>
                  {reste.map((a) => (
                    <li key={a.id} className="border-t py-2.5 first:border-t-0" style={{ borderColor: '#232B45' }}>
                      <Link href={`${basePath}/article/${a.slug}`} className="text-[13px] leading-snug text-[#E7EBF7] hover:text-[#22D3EE] transition-colors">
                        {a.titre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          );

          if (styleCartes) {
            return (
              <div key={nom} className="flex flex-col justify-between h-full bg-[#131a2b]/60 p-5 rounded-xl border" style={{ borderColor: '#232B45' }}>
                <div>{contenu}</div>
              </div>
            );
          }

          return (
            <div key={nom} className={i > 0 ? 'sm:pl-8 sm:border-l' : ''} style={i > 0 ? { borderColor: '#232B45' } : undefined}>
              {contenu}
            </div>
          );
        })}
      </div>
    </div>
  );
}
