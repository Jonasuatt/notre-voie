import { FORMAT_LABELS } from '../utils/constants';

// Aperçu instantané du rendu avant mise en ligne — cf. cahier des charges
// §2.2. Reprend la palette/typo du site public (web/) sans dépendre de lui.
export default function ArticlePreview({ form, rubrique }) {
  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm mb-3">Aperçu instantané</h3>
      <div className="grid sm:grid-cols-[1fr_260px] gap-5">
        {/* Aperçu carte web */}
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-2">Carte web</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-[320px]">
            <div className="relative h-[110px] bg-gradient-to-br from-navy to-navy-600">
              <span className="absolute top-2 left-2 bg-white/95 text-[9px] font-mono font-bold px-1.5 py-1 rounded">
                {FORMAT_LABELS[form.format]}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[9px] font-mono uppercase" style={{ color: rubrique?.couleur || '#0B6FA8' }}>{rubrique?.nom || '—'}</span>
              <p className="font-serif text-[14px] leading-snug mt-1 line-clamp-2">{form.titre || 'Titre de l\'article…'}</p>
              {form.chapo && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{form.chapo}</p>}
            </div>
          </div>
        </div>

        {/* Aperçu mobile (fil vertical) */}
        <div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-2">Fil mobile</p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white w-[240px] mx-auto">
            <div className="h-[100px] bg-gradient-to-br from-navy to-navy-600" />
            <div className="p-3">
              <span className="text-[9px] font-mono uppercase" style={{ color: rubrique?.couleur || '#0B6FA8' }}>{rubrique?.nom || '—'}</span>
              <p className="font-serif text-[13px] leading-snug mt-1">{form.titre || 'Titre de l\'article…'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
