import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { staffAPI } from '../services/api';
import { RoleBadge } from '../components/Badges';
import { ROLE_LABELS } from '../utils/constants';

const EMPTY = { nom: '', prenom: '', email: '', motDePasse: '', role: 'REDACTEUR', service: '', telephone: '' };

export default function ComptesPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => staffAPI.getAll().then((r) => setStaff(r.data.staff)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email || !form.motDePasse) return toast.error('Champs requis manquants.');
    setSaving(true);
    try {
      await staffAPI.create(form);
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Compte créé.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActif = async (member) => {
    try {
      await staffAPI.update(member.id, { isActive: !member.isActive });
      toast.success(member.isActive ? 'Compte désactivé.' : 'Compte réactivé.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible.');
    }
  };

  const changerRole = async (member, role) => {
    try {
      await staffAPI.update(member.id, { role });
      toast.success('Rôle mis à jour.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible.');
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comptes</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des accès CMS 1 (Administration/Régie) et CMS 2 (Rédaction).</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? 'Annuler' : '+ Nouveau compte'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-6 mt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom</label>
            <input className="input" value={form.prenom} onChange={set('prenom')} />
          </div>
          <div>
            <label className="label">Nom</label>
            <input className="input" value={form.nom} onChange={set('nom')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Mot de passe temporaire</label>
            <input type="password" className="input" value={form.motDePasse} onChange={set('motDePasse')} />
          </div>
          <div>
            <label className="label">Rôle</label>
            <select className="input" value={form.role} onChange={set('role')}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Service</label>
            <input className="input" value={form.service} onChange={set('service')} placeholder="Ex : Politique & Régions" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">Créer le compte</button>
          </div>
        </form>
      )}

      <div className="card mt-6 divide-y divide-gray-100">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">Chargement…</p>
        ) : (
          staff.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={`text-sm font-medium flex-1 ${!m.isActive ? 'text-gray-400 line-through' : ''}`}>
                {m.prenom} {m.nom}
              </span>
              <span className="text-xs text-gray-400">{m.email}</span>
              <span className="text-xs text-gray-400">{m.service}</span>
              <select
                className="text-xs border border-gray-200 rounded-md px-2 py-1"
                value={m.role}
                onChange={(e) => changerRole(m, e.target.value)}
              >
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button
                onClick={() => toggleActif(m)}
                className={`text-[11px] font-semibold ${m.isActive ? 'text-red-600' : 'text-emerald-600'} hover:underline`}
              >
                {m.isActive ? 'Désactiver' : 'Réactiver'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
