import { useState } from 'react';
import toast from 'react-hot-toast';
import { articlesAPI } from '../services/api';
import { StatutBadge } from './Badges';
import { ROLES_VALIDATION, ROLES_PUBLICATION } from '../utils/constants';

// Boutons d'action du workflow éditorial : BROUILLON → EN_RELECTURE →
// VALIDE → PUBLIE / DEPUBLIE — cf. cahier des charges §2.2 et
// api/prisma/schema.prisma (StatutArticle).
export default function WorkflowActions({ article, staff, onUpdated }) {
  const [busy, setBusy] = useState(false);

  const estAuteur = article.auteurId === staff.id;
  const peutValider = ROLES_VALIDATION.includes(staff.role);
  const peutPublier = ROLES_PUBLICATION.includes(staff.role);

  const run = async (action, fn) => {
    setBusy(true);
    try {
      await fn();
      onUpdated();
      toast.success(action);
    } catch (err) {
      toast.error(err.response?.data?.error || "Action impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
      <div>
        <span className="text-xs text-gray-500 block mb-1">Statut actuel</span>
        <StatutBadge statut={article.statut} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {article.statut === 'BROUILLON' && estAuteur && (
          <button disabled={busy} onClick={() => run('Article soumis à la relecture.', () => articlesAPI.soumettre(article.id))} className="btn-primary">
            Soumettre pour relecture
          </button>
        )}
        {article.statut === 'EN_RELECTURE' && peutValider && (
          <button disabled={busy} onClick={() => run('Article validé.', () => articlesAPI.valider(article.id))} className="btn-primary">
            Valider
          </button>
        )}
        {article.statut === 'VALIDE' && peutPublier && (
          <button disabled={busy} onClick={() => run('Article publié.', () => articlesAPI.publier(article.id))} className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
            Publier
          </button>
        )}
        {article.statut === 'PUBLIE' && peutPublier && (
          <button disabled={busy} onClick={() => run('Article dépublié.', () => articlesAPI.depublier(article.id))} className="bg-red-50 text-red-700 border border-red-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50">
            Dépublier
          </button>
        )}
        {article.statut === 'DEPUBLIE' && <span className="text-xs text-gray-400 italic">Article retiré de la diffusion.</span>}
      </div>
    </div>
  );
}
