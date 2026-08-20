import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { editionsAPI, mediaAPI } from '../services/api';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

const EMPTY = { numero: '', dateParution: '', dateFin: '', pdfUrl: '', couvertureUrl: '', prix: '300' };

function formatPlage(dateParution, dateFin) {
  const d1 = new Date(dateParution);
  const debut = formatDate(d1, 'd MMM yyyy', { locale: fr });
  if (!dateFin) return debut;
  const d2 = new Date(dateFin);
  const memesMoisEtAn = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  return memesMoisEtAn
    ? `${d1.getDate()} - ${formatDate(d2, 'd MMM yyyy', { locale: fr })}`
    : `${debut} - ${formatDate(d2, 'd MMM yyyy', { locale: fr })}`;
}

// Kiosque numérique — mise en ligne du PDF de l'édition papier du jour,
// cf. cahier des charges §3.1 (rubrique de service Archives/Kiosque). Le
// PDF et la couverture sont de vrais fichiers importés (archivés sur
// Cloudinary), pas des URL à coller à la main. `dateFin` couvre les
// numéros à cheval sur plusieurs jours (week-end, jour férié).
export default function EditionsPage() {
  const [editions, setEditions] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [plagePlusieursJours, setPlagePlusieursJours] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCouverture, setUploadingCouverture] = useState(false);

  const load = () => editionsAPI.getAll({ pageSize: 30 }).then((r) => setEditions(r.data.editions)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const { data } = await mediaAPI.upload(file, { type: 'PDF' });
      setForm((f) => ({ ...f, pdfUrl: data.media.url }));
      toast.success('PDF importé et archivé.');
    } catch (err) {
      toast.error(err.response?.data?.error || "Import du PDF impossible.");
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleUploadCouverture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCouverture(true);
    try {
      const { data } = await mediaAPI.upload(file, { type: 'PHOTO' });
      setForm((f) => ({ ...f, couvertureUrl: data.media.url }));
      toast.success('Couverture importée.');
    } catch (err) {
      toast.error(err.response?.data?.error || "Import de la couverture impossible.");
    } finally {
      setUploadingCouverture(false);
      e.target.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.numero || !form.dateParution || !form.pdfUrl) {
      toast.error('Numéro, date de parution et PDF sont requis.');
      return;
    }
    setSaving(true);
    try {
      await editionsAPI.create({
        ...form,
        numero: Number(form.numero),
        dateFin: plagePlusieursJours ? form.dateFin || null : null,
        prix: Number(form.prix),
      });
      setForm(EMPTY);
      setPlagePlusieursJours(false);
      toast.success('Édition ajoutée au kiosque.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ajout impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold">Kiosque numérique</h1>
      <p className="text-gray-500 text-sm mt-1">Mettez en ligne le PDF de l&apos;édition papier du jour.</p>

      <form onSubmit={submit} className="card p-5 mt-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">N° d&apos;édition</label>
          <input type="number" className="input" value={form.numero} onChange={set('numero')} placeholder="7971" />
        </div>
        <div>
          <label className="label">Prix (FCFA)</label>
          <input type="number" className="input" value={form.prix} onChange={set('prix')} />
        </div>

        <div className={plagePlusieursJours ? '' : 'sm:col-span-2'}>
          <label className="label">Date de parution</label>
          <input type="date" className="input" value={form.dateParution} onChange={set('dateParution')} />
        </div>
        {plagePlusieursJours && (
          <div>
            <label className="label">Jusqu&apos;au (dernier jour couvert)</label>
            <input type="date" className="input" value={form.dateFin} onChange={set('dateFin')} />
          </div>
        )}
        <div className="sm:col-span-2 -mt-2">
          <label className="inline-flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox" checked={plagePlusieursJours}
              onChange={(e) => { setPlagePlusieursJours(e.target.checked); if (!e.target.checked) setForm((f) => ({ ...f, dateFin: '' })); }}
            />
            Ce numéro couvre plusieurs jours (week-end, jour férié) — ex. &laquo; du vendredi au dimanche &raquo;
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="label">PDF de l&apos;édition</label>
          {form.pdfUrl ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <span className="text-xs text-emerald-700 font-medium flex-1 truncate">✔ PDF importé</span>
              <a href={form.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-navy underline">Voir</a>
              <button type="button" onClick={() => setForm((f) => ({ ...f, pdfUrl: '' }))} className="text-xs text-gray-400 hover:text-red-600">Retirer</button>
            </div>
          ) : (
            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
              {uploadingPdf ? 'Import en cours…' : 'Importer le PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleUploadPdf} disabled={uploadingPdf} />
            </label>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="label">Couverture / Une (optionnel)</label>
          {form.couvertureUrl ? (
            <div className="flex items-center gap-3">
              <img src={form.couvertureUrl} alt="Aperçu de la Une" className="w-16 aspect-[3/4] object-cover rounded border border-gray-200" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, couvertureUrl: '' }))} className="text-xs text-gray-400 hover:text-red-600">Retirer</button>
            </div>
          ) : (
            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
              {uploadingCouverture ? 'Import en cours…' : 'Importer la couverture'}
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadCouverture} disabled={uploadingCouverture} />
            </label>
          )}
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving || uploadingPdf || uploadingCouverture} className="btn-primary">
            {saving ? 'Ajout…' : 'Ajouter au kiosque'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {loading ? (
          <p className="text-sm text-gray-400 col-span-full text-center py-8">Chargement…</p>
        ) : editions.length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full text-center py-8">Aucune édition en ligne.</p>
        ) : (
          editions.map((e) => (
            <a key={e.id} href={e.pdfUrl} target="_blank" rel="noreferrer" className="card p-3 text-center hover:border-navy transition">
              {e.couvertureUrl ? (
                <img src={e.couvertureUrl} alt={`Une n°${e.numero}`} className="h-[100px] w-full object-cover rounded" />
              ) : (
                <div className="h-[100px] rounded bg-gradient-to-b from-navy to-navy-600" />
              )}
              <p className="text-[11px] font-mono mt-2">N°{e.numero}</p>
              <p className="text-[10px] text-gray-400">{formatPlage(e.dateParution, e.dateFin)}</p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
