import { useState } from 'react';
import toast from 'react-hot-toast';
import { articlesAPI } from '../services/api';
import { VERDICT_LABELS } from '../utils/constants';

// Détail de vérification pour un article Vérité ou Intox — cf. cahier des
// charges §3.3.
export default function FactCheckPanel({ article, onUpdated }) {
  const fc = article.factCheck;
  const [verdict, setVerdict] = useState(fc?.verdict || 'NON_VERIFIABLE');
  const [rumeurOrigine, setRumeurOrigine] = useState(fc?.rumeurOrigine || '');
  const [sourceRumeur, setSourceRumeur] = useState(fc?.sourceRumeur || '');
  const [preuves, setPreuves] = useState(fc?.preuves || '');
  const [saving, setSaving] = useState(false);

  const enregistrer = async () => {
    setSaving(true);
    try {
      await articlesAPI.creerFactCheck(article.id, { verdict, rumeurOrigine, sourceRumeur, preuves });
      onUpdated();
      toast.success('Fact-check enregistré.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm">Fact-check — Vérité ou Intox</h3>

      <div className="mt-3">
        <label className="label">Verdict</label>
        <select className="input" value={verdict} onChange={(e) => setVerdict(e.target.value)}>
          {Object.entries(VERDICT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="mt-3">
        <label className="label">Rumeur d&apos;origine</label>
        <input className="input" value={rumeurOrigine} onChange={(e) => setRumeurOrigine(e.target.value)} placeholder="Description de la rumeur identifiée" />
      </div>
      <div className="mt-3">
        <label className="label">Source de la rumeur</label>
        <input className="input" value={sourceRumeur} onChange={(e) => setSourceRumeur(e.target.value)} placeholder="WhatsApp, Facebook, TikTok…" />
      </div>
      <div className="mt-3">
        <label className="label">Éléments de preuve</label>
        <textarea className="input" rows={3} value={preuves} onChange={(e) => setPreuves(e.target.value)} placeholder="Sources citées, démentis officiels…" />
      </div>

      <button type="button" onClick={enregistrer} disabled={saving} className="btn-primary mt-4">
        {fc ? 'Mettre à jour le fact-check' : 'Enregistrer le fact-check'}
      </button>
    </div>
  );
}
