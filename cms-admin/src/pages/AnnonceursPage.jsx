import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { annonceursAPI } from '../services/api';

const EMPTY = { nom: '', contact: '', email: '', telephone: '' };

export default function AnnonceursPage() {
  const [annonceurs, setAnnonceurs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => annonceursAPI.getAll().then((r) => setAnnonceurs(r.data.annonceurs)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nom) return toast.error('Le nom de l\'annonceur est requis.');
    setSaving(true);
    try {
      await annonceursAPI.create(form);
      setForm(EMPTY);
      toast.success('Annonceur ajouté.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ajout impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold">Annonceurs</h1>
      <p className="text-gray-500 text-sm mt-1">Portefeuille d&apos;annonceurs de la régie publicitaire.</p>

      <form onSubmit={submit} className="card p-5 mt-6 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="label">Nom</label>
          <input className="input" value={form.nom} onChange={set('nom')} placeholder="Ex : Orange CI" />
        </div>
        <div>
          <label className="label">Contact</label>
          <input className="input" value={form.contact} onChange={set('contact')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={set('email')} />
        </div>
        <div className="flex gap-2">
          <input className="input" value={form.telephone} onChange={set('telephone')} placeholder="Téléphone" />
          <button type="submit" disabled={saving} className="btn-primary shrink-0">Ajouter</button>
        </div>
      </form>

      <div className="card mt-6 divide-y divide-gray-100">
        {loading ? (
          <p className="p-6 text-sm text-gray-400 text-center">Chargement…</p>
        ) : annonceurs.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">Aucun annonceur pour le moment.</p>
        ) : (
          annonceurs.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm font-medium">{a.nom}</span>
              <span className="text-xs text-gray-400">{a.contact}</span>
              <span className="text-xs text-gray-400">{a.email}</span>
              <span className="text-xs text-gray-400 font-mono">{a.telephone}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
