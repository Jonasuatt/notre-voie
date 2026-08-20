import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { campagnesAPI, annonceursAPI, rubriquesAPI } from '../services/api';
import { StatutCampagneBadge } from '../components/Badges';
import { FORMAT_PUB_LABELS, formatFCFA } from '../utils/constants';

const EMPTY = {
  nom: '', formatPub: 'NATIVE_CARTE', annonceurId: '', rubriqueIds: [], regionsCiblees: '',
  dateDebut: '', dateFin: '', budget: '', titre: '', imageUrl: '', lienUrl: '', texteCTA: 'En savoir plus',
};

export default function CampagnesPage() {
  const [campagnes, setCampagnes] = useState([]);
  const [annonceurs, setAnnonceurs] = useState([]);
  const [rubriques, setRubriques] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => campagnesAPI.getAll().then((r) => setCampagnes(r.data.campagnes)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    annonceursAPI.getAll().then((r) => setAnnonceurs(r.data.annonceurs));
    rubriquesAPI.getAll('EDITORIALE').then((r) => setRubriques(r.data.rubriques));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleRubrique = (id) => {
    setForm((f) => ({
      ...f,
      rubriqueIds: f.rubriqueIds.includes(id) ? f.rubriqueIds.filter((x) => x !== id) : [...f.rubriqueIds, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.annonceurId || !form.dateDebut || !form.dateFin || !form.budget) {
      return toast.error('Champs requis manquants.');
    }
    setSaving(true);
    try {
      await campagnesAPI.create({
        ...form,
        budget: Number(form.budget),
        regionsCiblees: form.regionsCiblees.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Campagne créée.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campagnes publicitaires</h1>
          <p className="text-gray-500 text-sm mt-1">Ciblage par rubrique, région et format — cf. cahier des charges §5.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? 'Annuler' : '+ Nouvelle campagne'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-6 mt-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nom de la campagne</label>
              <input className="input" value={form.nom} onChange={set('nom')} placeholder="Ex : Campagne rentrée Orange Money" />
            </div>
            <div>
              <label className="label">Annonceur</label>
              <select className="input" value={form.annonceurId} onChange={set('annonceurId')}>
                <option value="">— Choisir —</option>
                {annonceurs.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Format publicitaire</label>
              <select className="input" value={form.formatPub} onChange={set('formatPub')}>
                {Object.entries(FORMAT_PUB_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget (FCFA)</label>
              <input type="number" className="input" value={form.budget} onChange={set('budget')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date de début</label>
              <input type="date" className="input" value={form.dateDebut} onChange={set('dateDebut')} />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input type="date" className="input" value={form.dateFin} onChange={set('dateFin')} />
            </div>
          </div>

          <div>
            <label className="label">Rubriques ciblées</label>
            <div className="flex flex-wrap gap-2">
              {rubriques.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRubrique(r.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    form.rubriqueIds.includes(r.id) ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {r.nom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Régions ciblées (séparées par une virgule)</label>
            <input className="input" value={form.regionsCiblees} onChange={set('regionsCiblees')} placeholder="Abidjan, Bouaké, Diaspora France" />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="label mb-3">Créatif affiché sur le site public</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Accroche</label>
                <input className="input" value={form.titre} onChange={set('titre')} placeholder="Ex : Envoyez de l'argent en Côte d'Ivoire en 30 secondes" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Image (URL)</label>
                <input className="input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://res.cloudinary.com/…" />
              </div>
              <div>
                <label className="label">Lien de destination</label>
                <input className="input" value={form.lienUrl} onChange={set('lienUrl')} placeholder="https://…" />
              </div>
              <div>
                <label className="label">Texte du bouton</label>
                <input className="input" value={form.texteCTA} onChange={set('texteCTA')} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Création…' : 'Créer la campagne'}</button>
          </div>
        </form>
      )}

      <div className="card mt-6">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">Chargement…</p>
        ) : campagnes.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Aucune campagne pour le moment.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {campagnes.map((c) => (
              <Link key={c.id} to={`/campagnes/${c.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="flex-1 text-sm font-medium truncate">{c.nom}</span>
                <span className="text-xs text-gray-400">{c.annonceur?.nom}</span>
                <span className="text-xs font-mono text-gray-400">{formatFCFA(c.budget)}</span>
                <span className="text-xs font-mono text-gray-400">👁 {c.impressions} · 🖱 {c.clics}</span>
                <StatutCampagneBadge statut={c.statut} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
