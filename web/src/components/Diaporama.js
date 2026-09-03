import Link from 'next/link';
import Image from 'next/image';

// Diaporama d'album photo — enchaînement automatique en fondu, 100% CSS
// (cf. globals.css @keyframes diaporama-fondu) : pas de JS, donc reste un
// composant serveur. Alimenté par les vraies photos légendées déjà
// récupérées par la page d'accueil, avec leurs légendes et crédits réels.
const DUREE_PAR_PHOTO = 5; // secondes — doit correspondre au découpage du keyframe

export default function Diaporama({ photos, basePath = '', titre = 'Album photo' }) {
  if (!photos?.length) return null;
  const slides = photos.slice(0, 6);
  const cycle = slides.length * DUREE_PAR_PHOTO;

  return (
    <div className="mb-10">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest pb-3 mb-5 border-b" style={{ borderColor: '#5B6480', color: '#8993B0' }}>
        {titre}
      </h3>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#404A63] border" style={{ borderColor: '#5B6480' }}>
        {slides.map((p, i) => (
          <figure
            key={p.id}
            className="diaporama-slide absolute inset-0"
            style={{ animationDuration: `${cycle}s`, animationDelay: `${i * DUREE_PAR_PHOTO}s` }}
          >
            <Image src={p.url} alt={p.legende || ''} fill sizes="(max-width: 1024px) 100vw, 1120px" className="object-cover" />
            {p.legende && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pt-10 pb-4 text-[13.5px] text-white leading-snug">
                {p.legende}
                {p.credit && <span className="text-white/60"> — {p.credit}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <Link
        href={`${basePath}/rubrique/photos-legendees`}
        className="inline-block mt-3 font-mono text-[11px] uppercase tracking-widest text-[#22D3EE] hover:underline"
      >
        Voir toutes les photos →
      </Link>
    </div>
  );
}
