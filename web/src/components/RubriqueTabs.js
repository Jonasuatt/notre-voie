import Link from 'next/link';

// Vérité ou Intox est un format propre à la rédaction web (pas de matière
// première dans les PDF du journal papier) — masqué des onglets du
// Quotidien, cf. Header.js.
export default function RubriqueTabs({ rubriques, active, basePath = '' }) {
  const estQuotidien = basePath === '/quotidien';
  const visibles = estQuotidien ? rubriques.filter((r) => r.slug !== 'verite-ou-intox') : rubriques;
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
