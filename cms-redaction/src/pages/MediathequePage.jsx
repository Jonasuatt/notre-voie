import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { mediaAPI } from '../services/api';
import { MEDIA_TYPE_LABELS } from '../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrashIcon, MusicalNoteIcon, DocumentIcon } from '@heroicons/react/24/outline';

// Photothèque / médiathèque : archive de tous les médias déjà importés,
// rattachés à un article ou "en stock" — cf. cahier des charges §1.1
// (Archives / Kiosque numérique — "valorise le fonds documentaire").
export default function MediathequePage() {
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    mediaAPI.list({ type: type || undefined, q: q || undefined, pageSize: 80 })
      .then((r) => setMedias(r.data.medias))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = (e) => { e.preventDefault(); load(); };

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement ce média ?')) return;
    try {
      await mediaAPI.remove(id);
      toast.success('Média supprimé.');
      setMedias((m) => m.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Suppression impossible.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Photothèque</h1>
      <p className="text-gray-500 text-sm mt-1">Archive des photos, vidéos et audios importés — rattachés à un article ou en stock, prêts à être réutilisés.</p>

      <div className="flex flex-wrap gap-3 mt-5">
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          {Object.entries(MEDIA_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <form onSubmit={search} className="flex gap-2">
          <input className="input w-64" placeholder="Rechercher une légende ou un crédit…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="btn-secondary text-sm">Rechercher</button>
        </form>
      </div>

      {loading ? (
        <p className="p-8 text-center text-sm text-gray-400">Chargement…</p>
      ) : medias.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-400">Aucun média trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5">
          {medias.map((m) => (
            <div key={m.id} className="card overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                {m.type === 'PHOTO' && <img src={m.url} alt={m.legende || ''} className="w-full h-full object-cover" />}
                {m.type === 'VIDEO' && <video src={m.url} className="w-full h-full object-cover" muted />}
                {m.type === 'AUDIO' && <div className="w-full h-full flex items-center justify-center"><MusicalNoteIcon className="w-8 h-8 text-gray-400" /></div>}
                {m.type === 'PDF' && <div className="w-full h-full flex items-center justify-center"><DocumentIcon className="w-8 h-8 text-gray-400" /></div>}
                <button
                  type="button" onClick={() => remove(m.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                  title="Supprimer définitivement"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
                {!m.articleId && (
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wide bg-white/90 text-gray-500 px-1.5 py-0.5 rounded">En stock</span>
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-medium truncate">{m.legende || <span className="text-gray-300 italic">Sans légende</span>}</p>
                <p className="text-[10px] text-gray-400 truncate">{m.credit || '—'} · {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true, locale: fr })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
