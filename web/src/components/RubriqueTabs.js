import Link from 'next/link';

export default function RubriqueTabs({ rubriques, active }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href="/"
        className={`text-[12.5px] font-bold px-4 py-[9px] rounded-full border ${
          !active ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-line hover:border-navy'
        }`}
      >
        Toutes
      </Link>
      {rubriques.filter((r) => r.type === 'EDITORIALE').map((rub) => (
        <Link
          key={rub.id}
          href={`/rubrique/${rub.slug}`}
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
