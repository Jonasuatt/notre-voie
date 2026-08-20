import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { StatutBadge, FormatBadge } from '../components/Badges';
import { STATUT_LABELS } from '../utils/constants';
import { PORTAIL_LABELS } from '../utils/portails';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUTS = ['BROUILLON', 'EN_RELECTURE', 'VALIDE', 'PUBLIE', 'DEPUBLIE'];

export default function DashboardPage() {
  const { staff, portailActif } = useAuth();
  const [counts, setCounts] = useState(null);
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      Promise.all(STATUTS.map((statut) => articlesAPI.listCms({ statut, portail: portailActif, pageSize: 1 }).then((r) => [statut, r.data.total]))),
      articlesAPI.listCms({ portail: portailActif, pageSize: 8 }),
    ])
      .then(([statutResults, recentsRes]) => {
        setCounts(Object.fromEntries(statutResults));
        setRecents(recentsRes.data.articles);
      })
      .finally(() => setLoading(false));
  }, [portailActif]);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold">Bonjour {staff?.prenom} 👋</h1>
      <p className="text-gray-500 text-sm mt-1">
        Vue d&apos;ensemble de la production éditoriale — espace <strong>{PORTAIL_LABELS[portailActif] || portailActif}</strong>.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-7">
        {STATUTS.map((statut) => (
          <div key={statut} className="card p-4">
            <p className="text-2xl font-bold">{loading ? '…' : counts[statut]}</p>
            <StatutBadge statut={statut} />
          </div>
        ))}
      </div>

      {counts?.EN_RELECTURE > 0 && (
        <Link
          to="/articles?statut=EN_RELECTURE"
          className="block mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium hover:bg-amber-100 transition"
        >
          ⏳ {counts.EN_RELECTURE} article{counts.EN_RELECTURE > 1 ? 's' : ''} en attente de validation — à traiter en priorité.
        </Link>
      )}

      <div className="card mt-8">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-sm">Articles récemment modifiés</h2>
          <Link to="/articles" className="text-navy text-xs font-semibold hover:underline">Voir tout →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {!loading && recents.length === 0 && (
            <p className="p-6 text-sm text-gray-400 text-center">Aucun article pour le moment. Créez le premier !</p>
          )}
          {recents.map((a) => (
            <Link key={a.id} to={`/articles/${a.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition">
              <FormatBadge format={a.format} />
              <span className="flex-1 text-sm font-medium truncate">{a.titre}</span>
              <span className="text-[11px] font-mono text-gray-400 shrink-0">
                {a.auteur?.prenom} {a.auteur?.nom} · {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true, locale: fr })}
              </span>
              <StatutBadge statut={a.statut} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
