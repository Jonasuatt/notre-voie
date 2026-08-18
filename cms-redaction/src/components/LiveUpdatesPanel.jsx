import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { articlesAPI } from '../services/api';

// Mises à jour successives d'un article Live (badge DIRECT) — cf. cahier
// des charges §3.3.
export default function LiveUpdatesPanel({ article, onUpdated }) {
  const [contenu, setContenu] = useState('');
  const [sending, setSending] = useState(false);

  const ajouter = async () => {
    if (!contenu.trim()) return;
    setSending(true);
    try {
      await articlesAPI.ajouterLiveUpdate(article.id, contenu.trim());
      setContenu('');
      onUpdated();
      toast.success('Mise à jour publiée.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publication impossible.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral animate-pulse" /> Fil Direct
      </h3>

      <div className="flex gap-2 mt-3">
        <textarea
          className="input flex-1 resize-none"
          rows={2}
          placeholder="Ajouter une mise à jour…"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
        />
        <button type="button" onClick={ajouter} disabled={sending || !contenu.trim()} className="btn-primary self-end">
          Publier
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {(article.liveUpdates || []).map((u) => (
          <li key={u.id} className="border-l-2 border-coral pl-3">
            <span className="text-[11px] font-mono text-coral font-bold">
              {formatDistanceToNow(new Date(u.horodatage), { addSuffix: true, locale: fr })}
            </span>
            <p className="text-sm mt-0.5">{u.contenu}</p>
          </li>
        ))}
        {(!article.liveUpdates || article.liveUpdates.length === 0) && (
          <p className="text-xs text-gray-400">Aucune mise à jour publiée pour l&apos;instant.</p>
        )}
      </ul>
    </div>
  );
}
