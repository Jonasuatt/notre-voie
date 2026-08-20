import Link from 'next/link';
import { formatDateRange } from '@/lib/format';
import UneVerrouillee from './UneVerrouillee';
import ImageProtegee from './ImageProtegee';

// Reproduit la maquette papier : chaque vignette est la vraie page imprimée
// du numéro du jour (pas une illustration), et renvoie vers la rubrique
// réellement traitée sur cette page — déduite du texte de la page elle-même
// (cf. api/prisma/seed.js seedEditionPages), jamais une association devinée.
//
// Le PDF téléchargeable n'est plus lié depuis le site : la lecture se fait
// uniquement page par page, en image (cf. §"empêcher le téléchargement").
//
// Disposition : la Une en tête d'une grille à 3 colonnes, suivie des pages
// du numéro (page 1 exclue — c'est la Une elle-même, déjà affichée). Avec
// 7 pages restantes, la grille se répartit naturellement en 2 auprès de la
// Une, 3 en dessous, 2 par la suite.
export default function PagesDuJournal({ edition, basePath = '' }) {
  if (!edition?.couvertureUrl) return null;
  const pages = (edition.pages || []).filter((p) => p.numeroPage !== 1);

  return (
    <div className="mt-8">
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Les pages du journal</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div>
          <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden shadow-xl border border-line">
            <UneVerrouillee
              editionId={edition.id} verrouille={edition.verrouille} couvertureUrl={edition.couvertureUrl}
              numero={edition.numero} sizes="(max-width: 640px) 50vw, 300px" priority basePath={basePath}
            />
          </div>
          <span className="block text-center font-mono text-[11px] text-muted mt-2">
            N°{edition.numero} — {formatDateRange(edition.dateParution, edition.dateFin)}
          </span>
        </div>

        {pages.map((p) => {
          const rubrique = p.rubriques?.[0];
          const vignette = (
            <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden border border-line shadow-xl group-hover:shadow-2xl transition-shadow">
              <ImageProtegee src={p.imageUrl} alt={`Page ${p.numeroPage}`} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover" />
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
