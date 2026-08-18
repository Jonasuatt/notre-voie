import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { articlesAPI, rubriquesAPI } from '../services/api';
import { StatutBadge, FormatBadge, PaywallBadge } from '../components/Badges';
import { STATUT_LABELS, FORMAT_LABELS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ArticlesListPage() {
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
      .listCms({ statut: statut || undefined, format: format || undefined, rubrique: rubrique || undefined, pageSize: 50 })
      .then((r) => {
        setArticles(r.data.articles);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [statut, format, rubrique]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
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
          <p className="p-8 text-center text-sm text-gray-400">Chargement…</p>
        ) : articles.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Aucun article ne correspond à ces filtres.</p>
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
