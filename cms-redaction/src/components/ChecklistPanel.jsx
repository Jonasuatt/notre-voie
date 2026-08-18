import toast from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { articlesAPI } from '../services/api';

// Checklist de vérification obligatoire avant validation d'un Flash ou
// d'un Vérité ou Intox — cf. cahier des charges §2.2. Les items sont créés
// automatiquement par l'API à la création de l'article.
export default function ChecklistPanel({ article, onUpdated, canEdit }) {
  if (!article.checklist?.length) return null;

  const cocher = async (itemId) => {
    try {
      await articlesAPI.cocherChecklist(article.id, itemId);
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible.');
    }
  };

  const complete = article.checklist.every((i) => i.verifie);

  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm flex items-center gap-2">
        Checklist de vérification
        {complete && <span className="text-emerald-600 text-xs font-semibold">✓ Complète</span>}
      </h3>
      <p className="text-xs text-gray-500 mt-0.5">Obligatoire avant validation pour ce format.</p>
      <ul className="mt-3 space-y-2">
        {article.checklist.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={item.verifie || !canEdit}
              onClick={() => cocher(item.id)}
              className={`flex items-center gap-2 text-sm w-full text-left ${item.verifie ? 'text-emerald-700' : 'text-gray-600 hover:text-navy'}`}
            >
              <CheckCircleIcon className={`w-5 h-5 shrink-0 ${item.verifie ? 'text-emerald-500' : 'text-gray-300'}`} />
              {item.libelle}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
