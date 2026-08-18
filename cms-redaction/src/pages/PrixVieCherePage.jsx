import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { prixVieChereAPI } from '../services/api';

const EMPTY = { produit: '', unite: '', prix: '', variationPct: '' };

// Alimente le ticker Vie chère du site public — cf. cahier des charges §3.4.
export default function PrixVieCherePage() {
  const [prix, setPrix] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => prixVieChereAPI.ticker().then((r) => setPrix(r.data.prix)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.produit || !form.unite || form.prix === '') {
      toast.error('Produit, unité et prix sont requis.');
      return;
    }
    setSaving(true);
    try {
      await prixVieChereAPI.create({
        produit: form.produit,
        unite: form.unite,
        prix: Number(form.prix),
        variationPct: form.variationPct === '' ? undefined : Number(form.variationPct),
      });
      setForm(EMPTY);
      toast.success('Relevé ajouté au ticker.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ajout impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold">Ticker Vie chère</h1>
      <p className="text-gray-500 text-sm mt-1">Prix de première nécessité affichés en bandeau sur l&apos;accueil du site.</p>

      <form onSubmit={submit} className="card p-5 mt-6 grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="label">Produit</label>
          <input className="input" value={form.produit} onChange={set('produit')} placeholder="Riz (sac 50kg)" />
        </div>
        <div>
          <label className="label">Unité</label>
          <input className="input" value={form.unite} onChange={set('unite')} placeholder="sac, litre…" />
        </div>
        <div>
          <label className="label">Prix (FCFA)</label>
          <input type="number" className="input" value={form.prix} onChange={set('prix')} />
        </div>
        <div>
          <label className="label">Variation (%)</label>
          <input type="number" step="0.1" className="input" value={form.variationPct} onChange={set('variationPct')} placeholder="1.8 ou -0.5" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary h-[38px]">Ajouter</button>
      </form>

      <div className="card mt-6 divide-y divide-gray-100">
        {loading ? (
          <p className="p-6 text-sm text-gray-400 text-center">Chargement…</p>
        ) : prix.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">Aucun relevé pour le moment.</p>
        ) : (
          prix.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm font-medium">{p.produit}</span>
              <span className="text-sm font-mono">{p.prix.toLocaleString('fr-FR')} FCFA / {p.unite}</span>
              {p.variationPct != null && (
                <span className={`text-xs font-bold ${p.variationPct > 0 ? 'text-red-500' : p.variationPct < 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {p.variationPct > 0 ? '▲' : p.variationPct < 0 ? '▼' : '='} {Math.abs(p.variationPct)}%
                </span>
              )}
              <span className="text-[11px] text-gray-400 font-mono">{formatDistanceToNow(new Date(p.dateReleve), { addSuffix: true, locale: fr })}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
