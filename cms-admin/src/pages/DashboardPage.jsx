import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatFCFA } from '../utils/constants';

function Tile({ label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <p className="text-2xl font-bold" style={accent ? { color: accent } : undefined}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { staff } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.get().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const revenuTotal = stats
    ? stats.abonnements.revenuTotal + stats.paiementsArticle.revenuTotal + stats.regie.budgetEngage
    : 0;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold">Bonjour {staff?.prenom} 👋</h1>
      <p className="text-gray-500 text-sm mt-1">Vue consolidée — lecteurs, abonnements, paiements à l&apos;article et régie publicitaire.</p>

      {loading ? (
        <p className="text-sm text-gray-400 mt-8">Chargement…</p>
      ) : (
        <>
          <div className="mt-7">
            <div className="card p-6 bg-navy text-white">
              <p className="text-xs uppercase font-mono tracking-widest text-white/60">Revenu total engagé (indicatif)</p>
              <p className="text-4xl font-bold mt-1">{formatFCFA(revenuTotal)}</p>
              <p className="text-[11px] text-white/50 mt-2">
                Double base de revenus — lecteurs et annonceurs — cf. cahier des charges §4.
              </p>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-8 mb-3">Lecteurs &amp; abonnements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Tile label="Lecteurs inscrits" value={stats.lecteurs.total} />
            <Tile label="Abonnements actifs" value={stats.abonnements.actifs} accent="#0B6FA8" />
            <Tile label="Revenu abonnements" value={formatFCFA(stats.abonnements.revenuTotal)} />
            <Tile label="Paiements à l'article" value={stats.paiementsArticle.total} sub={formatFCFA(stats.paiementsArticle.revenuTotal)} />
          </div>

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-8 mb-3">Régie publicitaire</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Tile label="Campagnes actives" value={stats.regie.campagnesActives} accent="#E6008C" />
            <Tile label="Budget engagé" value={formatFCFA(stats.regie.budgetEngage)} />
            <Tile
              label="Factures impayées"
              value={stats.regie.facturesImpayees}
              accent={stats.regie.facturesImpayees > 0 ? '#DC2626' : undefined}
            />
            <Link to="/campagnes" className="card p-5 flex flex-col justify-center items-center text-navy font-semibold text-sm hover:bg-navy-50 transition">
              Voir les campagnes →
            </Link>
          </div>

          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-8 mb-3">Rédaction</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Tile label="Articles publiés" value={stats.redaction.articlesPublies} />
            <Tile label="Personnel actif" value={stats.redaction.staffActif} />
          </div>
        </>
      )}
    </div>
  );
}
