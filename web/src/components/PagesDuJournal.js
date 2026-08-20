import Link from 'next/link';
import Image from 'next/image';
import { formatDateRange } from '@/lib/format';

// Reproduit la maquette papier : chaque vignette est la vraie page imprimée
// du numéro du jour (pas une illustration), et renvoie vers la rubrique
// réellement traitée sur cette page — déduite du texte de la page elle-même
// (cf. api/prisma/seed.js seedEditionPages), jamais une association devinée.
//
// Disposition demandée : la Une en tête d'une grille à 3 colonnes, suivie
// des pages du numéro (page 1 exclue — c'est la Une elle-même, déjà
// affichée). Avec 7 pages restantes, la grille se répartit naturellement
// en 2 auprès de la Une, 3 en dessous, 2 par la suite.
export default function PagesDuJournal({ edition, basePath = '' }) {
  if (!edition?.couvertureUrl) return null;
  const pages = (edition.pages || []).filter((p) => p.numeroPage !== 1);

  return (
    <div className="mt-8">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Les pages du journal</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <a href={edition.pdfUrl} target="_blank" rel="noreferrer" className="group">
          <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden shadow-xl border border-line group-hover:shadow-2xl transition-shadow">
            <Image src={edition.couvertureUrl} alt={`Une n°${edition.numero}`} fill sizes="(max-width: 640px) 50vw, 300px" priority className="object-cover" />
          </div>
          <div className="mt-2 text-center">
            <span className="block font-mono text-[11px] text-muted">
              N°{edition.numero} — {formatDateRange(edition.dateParution, edition.dateFin)}
            </span>
            <span className="text-[11px] font-bold text-coral group-hover:underline">Lire le journal (PDF) →</span>
          </div>
        </a>

        {pages.map((p) => {
          const rubrique = p.rubriques?.[0];
          const vignette = (
            <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden border border-line shadow-xl group-hover:shadow-2xl transition-shadow">
              <Image src={p.imageUrl} alt={`Page ${p.numeroPage}`} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover" />
            </div>
          );
          return rubrique ? (
            <Link key={p.id} href={`${basePath}/rubrique/${rubrique}`} className="group">
              {vignette}
              <span className="block text-center font-mono text-[11px] text-muted mt-2">Page {p.numeroPage}</span>
            </Link>
          ) : (
            <div key={p.id}>
              {vignette}
              <span className="block text-center font-mono text-[11px] text-muted mt-2">Page {p.numeroPage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
