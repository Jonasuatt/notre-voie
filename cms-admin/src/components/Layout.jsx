import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../utils/constants';
import {
  HomeIcon, MegaphoneIcon, BuildingStorefrontIcon, UsersIcon, LifebuoyIcon,
  ArrowRightOnRectangleIcon, CurrencyDollarIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true, roles: ['ADMIN', 'REGIE'] },
  { to: '/campagnes', label: 'Campagnes', icon: MegaphoneIcon, roles: ['ADMIN', 'REGIE'] },
  { to: '/annonceurs', label: 'Annonceurs', icon: BuildingStorefrontIcon, roles: ['ADMIN', 'REGIE'] },
  { to: '/tarifs', label: 'Tarifs', icon: CurrencyDollarIcon, roles: ['ADMIN', 'REGIE'] },
  { to: '/cerveau', label: 'Cerveau numérique', icon: SparklesIcon, roles: ['ADMIN', 'REGIE'] },
  { to: '/comptes', label: 'Comptes', icon: UsersIcon, roles: ['ADMIN'] },
  { to: '/guide', label: "Guide d'utilisation", icon: LifebuoyIcon, roles: ['ADMIN', 'REGIE'] },
];

export default function Layout() {
  const { staff, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ink text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <img src="/logo.png" alt="Notre Voie" className="h-8 w-auto rounded-[5px] bg-white" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-2">CMS 1 — Administration</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.filter((item) => item.roles.includes(staff?.role)).map(({ to, label, icon: Icon, exact }) => (
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
  );
}
