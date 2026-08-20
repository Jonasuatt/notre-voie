import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { articlesAPI, rubriquesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { StatutBadge, FormatBadge, PaywallBadge } from '../components/Badges';
import { STATUT_LABELS, FORMAT_LABELS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ArticlesListPage() {
  const { portailActif } = useAuth();
  const estInfoDirect = portailActif === 'INFO_DIRECT';
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [rubriques, setRubriques] = useState([]);
  const [loading, setLoading] = useState(true);

  const statut = searchParams.get('statut') || '';
  const format = searchParams.get('format') || '';
  const rubrique = searchParams.get('rubrique') || '';

  useEffect(() => {
    rubriquesAPI.getAll().then((r) => setRubriques(r.data.rubriques));
  }, []);

  useEffect(() => {
    setLoading(true);
    articlesAPI
      .listCms({ statut: statut || undefined, format: format || undefined, rubrique: rubrique || undefined, portail: portailActif, pageSize: 50 })
      .then((r) => {
        setArticles(r.data.articles);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [statut, format, rubrique, portailActif]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{estInfoDirect ? 'Le fil' : 'Articles'}</h1>
        <Link to="/articles/nouveau" className="btn-primary">+ Nouvel article</Link>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <select className="input w-auto" value={statut} onChange={(e) => updateFilter('statut', e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input w-auto" value={format} onChange={(e) => updateFilter('format', e.target.value)}>
          <option value="">Tous les formats</option>
          {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input w-auto" value={rubrique} onChange={(e) => updateFilter('rubrique', e.target.value)}>
          <option value="">Toutes les rubriques</option>
          {rubriques.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
        </select>
      </div>

      <div className="card mt-5">
        {loading ? (
          <p className="p-8 text-center text-sm" style={estInfoDirect ? { color: '#6B7694' } : undefined}>Chargement…</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-center text-sm" style={estInfoDirect ? { color: '#6B7694' } : undefined}>Aucun article ne correspond à ces filtres.</p>
        ) : estInfoDirect ? (
          // Disposition dense, horodatage en tête, titre en serif — fil de
          // rédaction plutôt que liste éditoriale classique (cf. DashboardPage).
          <>
            <p className="px-5 py-3 text-xs font-mono" style={{ color: '#6B7694', borderBottom: '1px solid #232B45' }}>{total} résultat{total > 1 ? 's' : ''}</p>
            {articles.map((a, i) => (
              <Link
                key={a.id}
                to={`/articles/${a.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #1c2740' }}
              >
                <span className="font-mono text-[10.5px] shrink-0 tabular-nums" style={{ color: '#6B7694' }}>
                  {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true, locale: fr })}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wide shrink-0 hidden sm:inline" style={{ color: a.rubrique?.couleur || '#22D3EE' }}>
                  {a.rubrique?.nom}
                </span>
                <span className="flex-1 font-serif text-[14.5px] truncate">{a.titre}</span>
                <StatutBadge statut={a.statut} />
              </Link>
            ))}
          </>
        ) : (
          <>
            <p className="px-5 py-3 text-xs text-gray-400 font-mono border-b border-gray-100">{total} résultat{total > 1 ? 's' : ''}</p>
            <div className="divide-y divide-gray-100">
              {articles.map((a) => (
                <Link key={a.id} to={`/articles/${a.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition">
                  <FormatBadge format={a.format} />
                  <span className="flex-1 text-sm font-medium truncate">{a.titre}</span>
                  <PaywallBadge paywall={a.paywall} />
                  <span className="text-[11px] text-gray-400 shrink-0" style={{ color: a.rubrique?.couleur }}>{a.rubrique?.nom}</span>
                  <span className="text-[11px] font-mono text-gray-400 shrink-0 hidden sm:inline">
                    {a.auteur?.prenom} {a.auteur?.nom} · {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true, locale: fr })}
                  </span>
                  <StatutBadge statut={a.statut} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
