import Link from 'next/link';
import Image from 'next/image';

// Reproduit la maquette papier : chaque vignette est la vraie page imprimée
// du numéro du jour (pas une illustration), et renvoie vers la rubrique
// réellement traitée sur cette page — déduite du texte de la page elle-même
// (cf. api/prisma/seed.js seedEditionPages), jamais une association devinée.
export default function PagesDuJournal({ pages, basePath = '' }) {
  if (!pages?.length) return null;

  return (
    <div className="mt-8">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Les pages du journal</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {pages.map((p) => {
          const rubrique = p.rubriques?.[0];
          const contenu = (
            <>
              <div className="relative w-[110px] aspect-[210/297] rounded-[6px] overflow-hidden border border-line shadow-sm group-hover:shadow-md transition-shadow">
                <Image src={p.imageUrl} alt={`Page ${p.numeroPage}`} fill sizes="110px" className="object-cover" />
              </div>
              <span className="block text-center font-mono text-[10.5px] text-muted mt-1.5">Page {p.numeroPage}</span>
            </>
          );
          return rubrique ? (
            <Link key={p.id} href={`${basePath}/rubrique/${rubrique}`} className="flex-none w-[110px] group">
              {contenu}
            </Link>
          ) : (
            <div key={p.id} className="flex-none w-[110px]">
              {contenu}
            </div>
          );
        })}
      </div>
    </div>
  );
}
