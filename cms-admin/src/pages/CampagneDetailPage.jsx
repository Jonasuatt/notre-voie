import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { campagnesAPI } from '../services/api';
import { StatutCampagneBadge, StatutFactureBadge } from '../components/Badges';
import { formatFCFA } from '../utils/constants';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

const TRANSITIONS = {
  BROUILLON: ['EN_ATTENTE_VALIDATION'],
  EN_ATTENTE_VALIDATION: ['ACTIVE', 'BROUILLON'],
  ACTIVE: ['EN_PAUSE', 'TERMINEE'],
  EN_PAUSE: ['ACTIVE', 'TERMINEE'],
  TERMINEE: [],
};
const STATUT_ACTION_LABEL = {
  EN_ATTENTE_VALIDATION: 'Soumettre à validation',
  ACTIVE: 'Activer',
  EN_PAUSE: 'Mettre en pause',
  TERMINEE: 'Terminer',
  BROUILLON: 'Repasser en brouillon',
};

export default function CampagneDetailPage() {
  const { id } = useParams();
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [factureForm, setFactureForm] = useState({ montant: '', dateEcheance: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return campagnesAPI.getOne(id).then((r) => setCampagne(r.data.campagne));
  }, [id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const changerStatut = async (statut) => {
    try {
      await campagnesAPI.changerStatut(id, statut);
      toast.success('Statut mis à jour.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible.');
    }
  };

  const creerFacture = async (e) => {
    e.preventDefault();
    if (!factureForm.montant || !factureForm.dateEcheance) return toast.error('Montant et échéance requis.');
    setSaving(true);
    try {
      await campagnesAPI.facturer(id, factureForm);
      setFactureForm({ montant: '', dateEcheance: '' });
      toast.success('Facture émise.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Émission impossible.');
    } finally {
      setSaving(false);
    }
  };

  const changerStatutFacture = async (factureId, statut) => {
    try {
      await campagnesAPI.changerStatutFacture(id, factureId, statut);
      toast.success('Facture mise à jour.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible.');
    }
  };

  if (loading || !campagne) return <div className="p-8 text-sm text-gray-400">Chargement…</div>;

  const ctr = campagne.impressions > 0 ? ((campagne.clics / campagne.impressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campagne.nom}</h1>
          <p className="text-gray-500 text-sm mt-1">{campagne.annonceur?.nom}</p>
        </div>
        <StatutCampagneBadge statut={campagne.statut} />
      </div>

      <div className="flex gap-2 mt-4">
        {TRANSITIONS[campagne.statut]?.map((s) => (
          <button key={s} onClick={() => changerStatut(s)} className="btn-secondary">
            {STATUT_ACTION_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="card p-4">
          <p className="text-2xl font-bold">{campagne.impressions.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Impressions</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{campagne.clics.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 mt-1">Clics</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{ctr}%</p>
          <p className="text-xs text-gray-500 mt-1">Taux de clic (CTR)</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{formatFCFA(campagne.budget)}</p>
          <p className="text-xs text-gray-500 mt-1">Budget</p>
        </div>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-bold text-sm mb-3">Ciblage</h3>
        <p className="text-xs text-gray-500 mb-1">Rubriques</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {campagne.rubriquesCiblees.length ? campagne.rubriquesCiblees.map((r) => (
            <span key={r.id} className="text-[11px] bg-navy-50 text-navy-700 px-2 py-1 rounded-full">{r.nom}</span>
          )) : <span className="text-xs text-gray-400">Toutes rubriques</span>}
        </div>
        <p className="text-xs text-gray-500 mb-1">Régions</p>
        <div className="flex flex-wrap gap-1.5">
          {campagne.regionsCiblees.length ? campagne.regionsCiblees.map((r) => (
            <span key={r} className="text-[11px] bg-coral-50 text-coral px-2 py-1 rounded-full">{r}</span>
          )) : <span className="text-xs text-gray-400">Toutes régions</span>}
        </div>
        <p className="text-xs text-gray-400 mt-3 font-mono">
          {formatDate(new Date(campagne.dateDebut), 'd MMM yyyy', { locale: fr })} → {formatDate(new Date(campagne.dateFin), 'd MMM yyyy', { locale: fr })}
        </p>
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-bold text-sm mb-3">Facturation</h3>

        <form onSubmit={creerFacture} className="flex gap-3 items-end mb-4">
          <div className="flex-1">
            <label className="label">Montant (FCFA)</label>
            <input type="number" className="input" value={factureForm.montant} onChange={(e) => setFactureForm((f) => ({ ...f, montant: e.target.value }))} />
          </div>
          <div className="flex-1">
            <label className="label">Échéance</label>
            <input type="date" className="input" value={factureForm.dateEcheance} onChange={(e) => setFactureForm((f) => ({ ...f, dateEcheance: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">Émettre</button>
        </form>

        <div className="divide-y divide-gray-100">
          {campagne.factures.length === 0 && <p className="text-xs text-gray-400 py-3">Aucune facture émise.</p>}
          {campagne.factures.map((f) => (
            <div key={f.id} className="flex items-center gap-3 py-3">
              <span className="text-sm font-medium flex-1">{formatFCFA(f.montant)}</span>
              <span className="text-xs text-gray-400 font-mono">Échéance {formatDate(new Date(f.dateEcheance), 'd MMM yyyy', { locale: fr })}</span>
              <StatutFactureBadge statut={f.statut} />
              {f.statut === 'EMISE' && (
                <div className="flex gap-1.5">
                  <button onClick={() => changerStatutFacture(f.id, 'PAYEE')} className="text-[11px] text-emerald-700 font-semibold hover:underline">Marquer payée</button>
                  <button onClick={() => changerStatutFacture(f.id, 'EN_RETARD')} className="text-[11px] text-red-600 font-semibold hover:underline">En retard</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
