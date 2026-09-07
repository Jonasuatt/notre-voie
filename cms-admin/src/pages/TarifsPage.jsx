import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tarifsAPI } from '../services/api';
import Aide from '../components/Aide';

const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} F`;

// Grille tarifaire de la régie et simulateur de devis.
//
// Le total est calculé par l'API et non ici : c'est un prix annoncé à un
// annonceur, il ne doit pas dépendre de la version de l'écran ouverte dans le
// navigateur du commercial.
export default function TarifsPage() {
  const [grille, setGrille] = useState({ tarifs: [], options: [] });
  const [chargement, setChargement] = useState(true);

  const [calibre, setCalibre] = useState('');
  const [optionsCochees, setOptionsCochees] = useState([]);
  const [publiReportage, setPubliReportage] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [devis, setDevis] = useState(null);
  const [calcul, setCalcul] = useState(false);

  useEffect(() => {
    tarifsAPI
      .getAll()
      .then((r) => {
        setGrille(r.data);
        setCalibre(r.data.tarifs[0]?.code || '');
      })
      .catch(() => toast.error('Grille tarifaire indisponible.'))
      .finally(() => setChargement(false));
  }, []);

  const tarifChoisi = grille.tarifs.find((t) => t.code === calibre);
  const publiPossible = Boolean(tarifChoisi?.tarifPubliReportageHT);

  const calculer = async () => {
    setCalcul(true);
    try {
      const { data } = await tarifsAPI.devis({
        code: calibre,
        options: optionsCochees,
        publiReportage: publiReportage && publiPossible,
        quantite,
      });
      setDevis(data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Calcul impossible.');
    } finally {
      setCalcul(false);
    }
  };

  const basculer = (code) =>
    setOptionsCochees((liste) => (liste.includes(code) ? liste.filter((c) => c !== code) : [...liste, code]));

  if (chargement) return <p className="text-muted text-sm">Chargement de la grille…</p>;

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-ink">Tarifs publicitaires</h1>
          <Aide>
            Un calibre est un emplacement du journal : son code (C60, C32…), ses dimensions en
            millimètres et son prix. Les majorations s&apos;appliquent toutes au montant hors taxes de
            départ, jamais les unes sur les autres — l&apos;ordre dans lequel vous les cochez ne change
            donc pas le total. Le publi-reportage n&apos;existe que sur quatre calibres, à un tarif qui
            lui est propre.
          </Aide>
        </div>
        <p className="text-muted text-sm mt-1">
          Grille officielle du journal. Les prix sont hors taxes.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* -------- Grille -------- */}
        <section className="bg-white rounded-xl border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream text-left">
                  <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">Calibre</th>
                  <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">Dimensions</th>
                  <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted text-right">Tarif HT</th>
                  <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted text-right">Publi-reportage</th>
                </tr>
              </thead>
              <tbody>
                {grille.tarifs.map((t) => (
                  <tr
                    key={t.code}
                    onClick={() => { setCalibre(t.code); setDevis(null); }}
                    className={`border-t border-line cursor-pointer transition ${
                      t.code === calibre ? 'bg-navy/5' : 'hover:bg-cream/60'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-mono font-semibold text-ink">{t.code}</span>
                      {t.libelle && <span className="text-muted ml-2">{t.libelle}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted tabular-nums">
                      {t.largeurMm ? `${t.largeurMm} × ${t.hauteurMm} mm` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{fcfa(t.tarifHT)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {t.tarifPubliReportageHT ? fcfa(t.tarifPubliReportageHT) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* -------- Simulateur -------- */}
        <section className="bg-white rounded-xl border border-line p-5 lg:sticky lg:top-4">
          <h2 className="font-bold text-ink">Établir un devis</h2>
          <p className="text-muted text-xs mt-1 mb-4">
            Choisissez un calibre dans la grille, puis les options.
          </p>

          <label className="block text-xs font-semibold text-ink mb-1">Calibre</label>
          <select
            value={calibre}
            onChange={(e) => { setCalibre(e.target.value); setDevis(null); }}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
          >
            {grille.tarifs.map((t) => (
              <option key={t.code} value={t.code}>
                {t.code} — {t.libelle || `${t.largeurMm} × ${t.hauteurMm} mm`}
              </option>
            ))}
          </select>

          <label className="block text-xs font-semibold text-ink mb-1">Nombre de parutions</label>
          <input
            type="number"
            min="1"
            value={quantite}
            onChange={(e) => { setQuantite(Number(e.target.value)); setDevis(null); }}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3 tabular-nums"
          />

          <label className={`flex items-center gap-2 text-sm mb-3 ${publiPossible ? '' : 'opacity-40'}`}>
            <input
              type="checkbox"
              checked={publiReportage && publiPossible}
              disabled={!publiPossible}
              onChange={(e) => { setPubliReportage(e.target.checked); setDevis(null); }}
            />
            Publi-reportage
            {!publiPossible && <span className="text-[11px] text-muted">(C60, C62, C41, C32)</span>}
          </label>

          <p className="text-xs font-semibold text-ink mb-1.5">Options</p>
          <div className="space-y-1.5 mb-4">
            {grille.options.map((o) => (
              <label key={o.code} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={optionsCochees.includes(o.code)}
                  onChange={() => { basculer(o.code); setDevis(null); }}
                  className="mt-1"
                />
                <span>
                  {o.libelle}{' '}
                  <span className={`font-mono text-[11px] ${o.type === 'REMISE' ? 'text-emerald-600' : 'text-coral'}`}>
                    {o.type === 'REMISE' ? '−' : '+'}
                    {o.estForfait ? fcfa(o.valeur) : `${o.valeur} %`}
                  </span>
                  {o.note && <span className="block text-[11px] text-muted leading-snug">{o.note}</span>}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={calculer}
            disabled={calcul || !calibre}
            className="w-full bg-navy text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
          >
            {calcul ? 'Calcul…' : 'Calculer'}
          </button>

          {devis && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
                {devis.calibre.code} · {devis.calibre.dimensions}
                {devis.quantite > 1 && ` · ${devis.quantite} parutions`}
              </p>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted">{devis.publiReportage ? 'Publi-reportage' : 'Tarif de base'}</dt>
                  <dd className="tabular-nums">{fcfa(devis.base)}</dd>
                </div>
                {devis.lignes.map((l) => (
                  <div key={l.code} className="flex justify-between">
                    <dt className="text-muted">
                      {l.libelle} <span className="font-mono text-[11px]">{l.detail}</span>
                    </dt>
                    <dd className={`tabular-nums ${l.montant < 0 ? 'text-emerald-600' : ''}`}>{fcfa(l.montant)}</dd>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-2 border-t border-line font-bold text-ink">
                  <dt>Total hors taxes</dt>
                  <dd className="tabular-nums">{fcfa(devis.totalHT)}</dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      </div>

      <p className="text-xs text-muted mt-5">
        Régie publicitaire — AKHO A. Claude · 05 05 99 00 03 / 07 07 62 82 80 · akhonotrevoie@gmail.com
      </p>
    </div>
  );
}
