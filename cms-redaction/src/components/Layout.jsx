import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PortailGate from './PortailGate';
import { PORTAILS } from '../utils/portails';
import { ROLE_LABELS, ROLE_COLORS } from '../utils/constants';
import {
  HomeIcon, NewspaperIcon, BanknotesIcon, BookOpenIcon, PhotoIcon, ArchiveBoxIcon,
  ArrowRightOnRectangleIcon, PlusCircleIcon,
} from '@heroicons/react/24/outline';

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
  const portail = PORTAILS.find((p) => p.valeur === portailActif);

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
          {/* Rappel visuel de l'espace de travail actif, en toutes lettres —
              évite de devoir regarder le sélecteur pour savoir où l'on est. */}
          {portail && (
            <span className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10.5px] font-bold" style={{ color: portail.accent }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: portail.accent }} />
              {portail.label}
            </span>
          )}
        </div>

        {/* Sélecteur d'espace de travail — deux rédactions distinctes,
            cf. PortailGate.jsx. Change le filtre appliqué au tableau de
            bord et à la liste des articles, et pré-coche le portail par
            défaut d'un nouvel article. */}
        <div className="px-3 pt-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1 mb-1.5">Espace de travail</p>
          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            {PORTAILS.map((p) => (
              <button
                key={p.valeur}
                onClick={() => setPortailActif(p.valeur)}
                className="flex-1 text-[11.5px] font-semibold px-2 py-1.5 rounded-md transition"
                style={
                  portailActif === p.valeur
                    ? { background: p.accent, color: p.valeur === 'QUOTIDIEN' ? '#FFFFFF' : p.fond }
                    : { color: 'rgba(255,255,255,0.6)' }
                }
              >
                {p.label}
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
