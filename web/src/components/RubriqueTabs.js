import Link from 'next/link';
import { RUBRIQUES_WEB_UNIQUEMENT } from '@/lib/rubriques';

export default function RubriqueTabs({ rubriques, active, basePath = '' }) {
  const estQuotidien = basePath === '/quotidien';
  // Les sous-rubriques (parentId défini — cf. mega-menu Info en direct) ne
  // s'affichent qu'imbriquées dans le mega-menu, jamais dans ces onglets
  // plats : sinon ~25 nouveaux onglets noieraient les rubriques principales.
  const sansSousRubriques = rubriques.filter((r) => !r.parentId);
  const visibles = estQuotidien ? sansSousRubriques.filter((r) => !RUBRIQUES_WEB_UNIQUEMENT.includes(r.slug)) : sansSousRubriques;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href={basePath || '/'}
        className={`text-[12.5px] font-bold px-4 py-[9px] rounded-full border ${
          !active ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-line hover:border-navy'
        }`}
      >
        Toutes
      </Link>
      {visibles.filter((r) => r.type === 'EDITORIALE').map((rub) => (
        <Link
          key={rub.id}
          href={`${basePath}/rubrique/${rub.slug}`}
          className={`text-[12.5px] font-bold px-4 py-[9px] rounded-full border ${
            active === rub.slug ? 'text-white border-transparent' : 'bg-white text-muted border-line hover:border-navy'
          }`}
          style={active === rub.slug ? { background: rub.couleur || '#0B6FA8' } : undefined}
        >
          {rub.nom}
        </Link>
      ))}
    </div>
  );
}
