import Link from 'next/link';
import LogoPill from './Logo';

const NAV_COMMUNE = [
  { href: '', label: 'Accueil' },
  { href: '/rubrique/politique', label: 'Politique' },
  { href: '/rubrique/economie', label: 'Économie' },
  { href: '/rubrique/vie-chere', label: 'Vie chère' },
  { href: '/rubrique/sport', label: 'Sport' },
];

// Vérité ou Intox et Direct sont des formats propres à la rédaction web —
// pas de matière première dans les PDF du journal papier. Le Quotidien
// reste donc un miroir fidèle de l'imprimé (cf. demande explicite de
// cohérence avec les données PDF) ; ces deux rubriques restent réservées à
// Info en direct.
const NAV_INFO_DIRECT_UNIQUEMENT = [
  { href: '/verite-ou-intox', label: 'Vérité ou Intox' },
  { href: '/direct', label: 'Direct' },
];

const NAV_FIN = [
  { href: '/kiosque', label: 'Kiosque' },
  { href: '/rubrique/photos-legendees', label: 'Photos légendées' },
  { href: '/rubrique/necrologie', label: 'Nécrologie' },
];

// `basePath` — préfixe de section ("/quotidien" ou "/info-direct"), pour
// que ce composant partagé fonctionne dans les deux portails sans dupliquer
// le code (cf. §"deux rédactions" — Le Quotidien / Info en direct).
export default function Header({ basePath = '' }) {
  const estInfoDirect = basePath === '/info-direct';
  const NAV = [...NAV_COMMUNE, ...(estInfoDirect ? NAV_INFO_DIRECT_UNIQUEMENT : []), ...NAV_FIN];
  return (
    <header className="bg-white border-b border-line sticky top-0 z-30">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoPill href={basePath || '/'} />
          {estInfoDirect && (
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-coral">
              <span className="w-1.5 h-1.5 rounded-full bg-coral dot-live" /> En direct
            </span>
          )}
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold">
          {NAV.map((item) => (
            <Link key={item.href || 'accueil'} href={`${basePath}${item.href}` || '/'} className="hover:text-coral transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`${basePath}/recherche`} aria-label="Rechercher" className="p-2 text-ink hover:text-coral transition-colors">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <Link
            href={`${basePath}/abonnement`}
            className="bg-coral text-white font-bold text-[13px] px-[18px] py-[10px] rounded-full hover:brightness-95 transition"
          >
            S&apos;abonner
          </Link>
        </div>
      </div>
    </header>
  );
}
