import Link from 'next/link';
import LogoPill from './Logo';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/rubrique/politique', label: 'Politique' },
  { href: '/rubrique/economie', label: 'Économie' },
  { href: '/rubrique/vie-chere', label: 'Vie chère' },
  { href: '/rubrique/sport', label: 'Sport' },
  { href: '/verite-ou-intox', label: 'Vérité ou Intox' },
  { href: '/direct', label: 'Direct' },
  { href: '/kiosque', label: 'Kiosque' },
  { href: '/rubrique/necrologie', label: 'Nécrologie' },
];

export default function Header() {
  return (
    <header className="bg-white border-b border-line sticky top-0 z-30">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-6">
        <LogoPill />
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-coral transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/abonnement"
          className="shrink-0 bg-coral text-white font-bold text-[13px] px-[18px] py-[10px] rounded-full hover:brightness-95 transition"
        >
          S&apos;abonner
        </Link>
      </div>
    </header>
  );
}
