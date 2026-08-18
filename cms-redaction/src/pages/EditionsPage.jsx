import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { editionsAPI } from '../services/api';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

const EMPTY = { numero: '', dateParution: '', pdfUrl: '', couvertureUrl: '', prix: '300' };

// Kiosque numérique — mise en ligne du PDF de l'édition papier du jour,
// cf. cahier des charges §3.1 (rubrique de service Archives/Kiosque).
export default function EditionsPage() {
  const [editions, setEditions] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => editionsAPI.getAll({ pageSize: 30 }).then((r) => setEditions(r.data.editions)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.numero || !form.dateParution || !form.pdfUrl) {
      toast.error('Numéro, date de parution et PDF sont requis.');
      return;
    }
    setSaving(true);
    try {
      await editionsAPI.create({ ...form, numero: Number(form.numero), prix: Number(form.prix) });
      setForm(EMPTY);
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
          <label className="label">Date de parution</label>
          <input type="date" className="input" value={form.dateParution} onChange={set('dateParution')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">URL du PDF</label>
          <input className="input" value={form.pdfUrl} onChange={set('pdfUrl')} placeholder="https://res.cloudinary.com/…/edition-7971.pdf" />
        </div>
        <div>
          <label className="label">URL de couverture (optionnel)</label>
          <input className="input" value={form.couvertureUrl} onChange={set('couvertureUrl')} />
        </div>
        <div>
          <label className="label">Prix (FCFA)</label>
          <input type="number" className="input" value={form.prix} onChange={set('prix')} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">Ajouter au kiosque</button>
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
              <div className="h-[100px] rounded bg-gradient-to-b from-navy to-navy-600" />
              <p className="text-[11px] font-mono mt-2">N°{e.numero}</p>
              <p className="text-[10px] text-gray-400">{formatDate(new Date(e.dateParution), 'd MMM yyyy', { locale: fr })}</p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
