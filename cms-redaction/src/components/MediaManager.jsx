import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { mediaAPI } from '../services/api';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, StarIcon } from '@heroicons/react/24/outline';

const ICONS = { PHOTO: PhotoIcon, VIDEO: VideoCameraIcon, AUDIO: MusicalNoteIcon, PDF: PhotoIcon };

function Thumb({ media }) {
  if (media.type === 'PHOTO') return <img src={media.url} alt={media.legende || ''} className="w-full h-full object-cover" />;
  if (media.type === 'VIDEO') return <video src={media.url} className="w-full h-full object-cover" muted />;
  const Icon = ICONS[media.type] || PhotoIcon;
  return <div className="w-full h-full flex items-center justify-center bg-gray-100"><Icon className="w-8 h-8 text-gray-400" /></div>;
}

// Bloc d'illustration réutilisable pour un article : galerie photo légendée
// (multiple, réordonnable) ou média unique (vidéo/audio). Permet de
// téléverser un fichier, de coller un lien externe (YouTube, SoundCloud…),
// ou de piocher un média déjà en photothèque — cf. cahier des charges
// §1.1 (Photos légendées, Vidéos, Audio) et §3 (Galerie photo légendée).
export default function MediaManager({ articleId, type, title, multiple = false, onSetPrincipale }) {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [urlForm, setUrlForm] = useState(null); // { url, legende, credit } | null
  const [picker, setPicker] = useState(null); // liste photothèque | null
  const fileRef = useRef(null);

  const load = useCallback(() => {
    if (!articleId) return;
    mediaAPI.list({ articleId, type }).then((r) => setItems([...r.data.medias].sort((a, b) => a.ordre - b.ordre)));
  }, [articleId, type]);

  useEffect(() => { load(); }, [load]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaAPI.upload(file, { type, articleId, ordre: items.length });
      toast.success('Média ajouté.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import impossible.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submitUrl = async (e) => {
    e.preventDefault();
    if (!urlForm?.url) return;
    try {
      await mediaAPI.create({ type, url: urlForm.url, legende: urlForm.legende, credit: urlForm.credit, articleId, ordre: items.length });
      setUrlForm(null);
      toast.success('Média ajouté.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ajout impossible.');
    }
  };

  const patch = (id, field, value) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };
  const save = (id, field, value) => mediaAPI.update(id, { [field]: value }).catch(() => toast.error('Enregistrement impossible.'));

  const detach = async (id) => {
    await mediaAPI.update(id, { articleId: null });
    toast.success('Média retiré de l\'article (conservé en photothèque).');
    load();
  };

  const move = async (index, dir) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await mediaAPI.reorder(next.map((m) => m.id));
  };

  const openPicker = () => mediaAPI.list({ type, unattached: true, pageSize: 24 }).then((r) => setPicker(r.data.medias));
  const attachFromPicker = async (id) => {
    await mediaAPI.update(id, { articleId, ordre: items.length });
    setPicker(null);
    load();
  };

  if (!articleId) {
    return (
      <div className="card p-5">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">Enregistrez d&apos;abord le brouillon pour pouvoir ajouter des médias.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary text-xs" onClick={openPicker}>Depuis la photothèque</button>
          <button type="button" className="btn-secondary text-xs" onClick={() => setUrlForm({ url: '', legende: '', credit: '' })}>Depuis une URL</button>
          <label className="btn-primary text-xs cursor-pointer">
            {uploading ? 'Import…' : 'Téléverser'}
            <input ref={fileRef} type="file" accept={type === 'PHOTO' ? 'image/*' : type === 'VIDEO' ? 'video/*' : 'audio/*'} className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>

      {urlForm && (
        <form onSubmit={submitUrl} className="mt-3 grid sm:grid-cols-3 gap-2 items-end bg-gray-50 rounded-lg p-3">
          <div className="sm:col-span-3">
            <label className="label">URL (YouTube, Cloudinary, SoundCloud…)</label>
            <input className="input" required value={urlForm.url} onChange={(e) => setUrlForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" />
          </div>
          <div>
            <label className="label">Légende</label>
            <input className="input" value={urlForm.legende} onChange={(e) => setUrlForm((f) => ({ ...f, legende: e.target.value }))} />
          </div>
          <div>
            <label className="label">Crédit</label>
            <input className="input" value={urlForm.credit} onChange={(e) => setUrlForm((f) => ({ ...f, credit: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs">Ajouter</button>
            <button type="button" className="btn-secondary text-xs" onClick={() => setUrlForm(null)}>Annuler</button>
          </div>
        </form>
      )}

      {picker && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500">Photothèque — médias non rattachés</p>
            <button type="button" className="text-xs text-gray-400 hover:text-ink" onClick={() => setPicker(null)}>Fermer</button>
          </div>
          {picker.length === 0 ? (
            <p className="text-xs text-gray-400">Aucun média disponible en stock pour ce type.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {picker.map((m) => (
                <button key={m.id} type="button" onClick={() => attachFromPicker(m.id)} className="aspect-square rounded-md overflow-hidden border border-gray-200 hover:ring-2 hover:ring-coral">
                  <Thumb media={m} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-gray-400 mt-3">Aucun média pour l&apos;instant.</p>
      ) : (
        <div className={multiple ? 'grid sm:grid-cols-2 gap-3 mt-4' : 'space-y-3 mt-4'}>
          {items.map((m, index) => (
            <div key={m.id} className="flex gap-3 border border-gray-100 rounded-lg p-3">
              <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
                <Thumb media={m} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  className="input py-1 text-xs" placeholder="Légende"
                  value={m.legende || ''}
                  onChange={(e) => patch(m.id, 'legende', e.target.value)}
                  onBlur={(e) => save(m.id, 'legende', e.target.value)}
                />
                <input
                  className="input py-1 text-xs" placeholder="Crédit (photographe/source)"
                  value={m.credit || ''}
                  onChange={(e) => patch(m.id, 'credit', e.target.value)}
                  onBlur={(e) => save(m.id, 'credit', e.target.value)}
                />
                <div className="flex items-center gap-2 pt-0.5">
                  {onSetPrincipale && (
                    <button type="button" onClick={() => onSetPrincipale(m.url)} className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline">
                      <StarIcon className="w-3.5 h-3.5" /> Image principale
                    </button>
                  )}
                  {multiple && (
                    <>
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-ink disabled:opacity-30"><ArrowUpIcon className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="text-gray-400 hover:text-ink disabled:opacity-30"><ArrowDownIcon className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                  <button type="button" onClick={() => detach(m.id)} className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-600">
                    <TrashIcon className="w-3.5 h-3.5" /> Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
