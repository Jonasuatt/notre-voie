import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PortailGate from './PortailGate';
import { ROLE_LABELS, ROLE_COLORS } from '../utils/constants';
import {
  HomeIcon, NewspaperIcon, BanknotesIcon, BookOpenIcon, PhotoIcon, ArchiveBoxIcon,
  ArrowRightOnRectangleIcon, PlusCircleIcon,
} from '@heroicons/react/24/outline';

const PORTAIL_LABELS = { QUOTIDIEN: 'Le Quotidien', INFO_DIRECT: 'Info en direct' };

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true },
  { to: '/articles', label: 'Articles', icon: NewspaperIcon },
  { to: '/articles?statut=PUBLIE', label: 'Archives (articles publiés)', icon: ArchiveBoxIcon },
  { to: '/mediatheque', label: 'Photothèque', icon: PhotoIcon },
  { to: '/prix-vie-chere', label: 'Vie chère (ticker)', icon: BanknotesIcon },
  { to: '/editions', label: 'Kiosque / Éditions', icon: BookOpenIcon },
];

export default function Layout() {
  const { staff, logout, portailActif, setPortailActif } = useAuth();
  const navigate = useNavigate();

  return (
    <PortailGate>
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ink text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="inline-flex items-center rounded-full overflow-hidden font-serif font-extrabold text-[14px]">
            <span className="bg-navy text-white px-3 py-1.5">Notre</span>
            <span className="bg-white text-coral font-black px-3 py-1.5">Voie</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-2">CMS 2 — Rédaction</p>
        </div>

        {/* Sélecteur d'espace de travail — deux rédactions distinctes,
            cf. PortailGate.jsx. Change le filtre appliqué au tableau de
            bord et à la liste des articles, et pré-coche le portail par
            défaut d'un nouvel article. */}
        <div className="px-3 pt-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1 mb-1.5">Espace de travail</p>
          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            {Object.entries(PORTAIL_LABELS).map(([valeur, libelle]) => (
              <button
                key={valeur}
                onClick={() => setPortailActif(valeur)}
                className={`flex-1 text-[11.5px] font-semibold px-2 py-1.5 rounded-md transition ${
                  portailActif === valeur ? 'bg-coral text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {libelle}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-navy text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}

          <button
            onClick={() => navigate('/articles/nouveau')}
            className="w-full mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-coral text-white hover:brightness-95 transition"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Nouvel article
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm font-semibold">{staff?.prenom} {staff?.nom}</p>
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[staff?.role] || 'bg-white/10 text-white'}`}>
            {ROLE_LABELS[staff?.role] || staff?.role}
          </span>
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center gap-2 text-white/60 hover:text-white text-xs"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-gray-50">
        <Outlet />
      </main>
    </div>
    </PortailGate>
  );
}
