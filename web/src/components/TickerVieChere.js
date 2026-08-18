import { formatFCFA } from '@/lib/format';

// Ticker de prix (riz, huile, essence, transport...) — "un contenu que
// personne d'autre ne propose de façon aussi visible" (cahier des charges §3.4).
export default function TickerVieChere({ prix }) {
  if (!prix?.length) return null;

  return (
    <div className="bg-ink text-white py-[11px] overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 flex items-center gap-6">
        <span className="font-mono text-[11px] bg-coral px-2.5 py-1 rounded shrink-0 tracking-wide">VIE CHÈRE</span>
        <div className="flex gap-8 font-mono text-[12px] overflow-x-auto whitespace-nowrap">
          {prix.map((p) => {
            const hausse = (p.variationPct || 0) > 0;
            const baisse = (p.variationPct || 0) < 0;
            return (
              <span key={p.id} className="shrink-0">
                {p.produit} <b>{formatFCFA(p.prix)}</b>
                {hausse && <span className="text-[#F87171] ml-1">▲ {p.variationPct}%</span>}
                {baisse && <span className="text-[#4ADE80] ml-1">▼ {Math.abs(p.variationPct)}%</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
