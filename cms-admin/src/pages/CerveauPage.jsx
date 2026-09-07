import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cerveauAPI, rubriquesAPI } from '../services/api';
import Aide from '../components/Aide';

const dateCourte = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Le Cerveau numérique — la mémoire du journal.
//
// Il cherche dans tout ce qui a été publié et rapproche les papiers d'un même
// sujet. La recherche est faite par la base : elle est immédiate, ne coûte
// rien à l'usage, et fonctionne aussi bien sur un fonds de quatre mille
// articles que sur celui de demain.
export default function CerveauPage() {
  const [apercu, setApercu] = useState(null);
  const [rubriques, setRubriques] = useState([]);

  const [q, setQ] = useState('');
  const [rubrique, setRubrique] = useState('');
  const [depuis, setDepuis] = useState('');
  const [jusqua, setJusqua] = useState('');

  const [resultats, setResultats] = useState(null);
  const [total, setTotal] = useState(0);
  const [recherche, setRecherche] = useState(false);
  const [similaires, setSimilaires] = useState(null);

  useEffect(() => {
    cerveauAPI.apercu().then((r) => setApercu(r.data)).catch(() => {});
    rubriquesAPI
      .getAll()
      .then((r) => setRubriques((r.data.rubriques || []).filter((x) => !x.parentId)))
      .catch(() => {});
  }, []);

  const chercher = async (e) => {
    e?.preventDefault();
    if (q.trim().length < 2) return toast.error('Indiquez au moins deux caractères.');
    setRecherche(true);
    setSimilaires(null);
    try {
      const { data } = await cerveauAPI.recherche({
        q: q.trim(),
        ...(rubrique ? { rubrique } : {}),
        ...(depuis ? { depuis } : {}),
        ...(jusqua ? { jusqua } : {}),
        pageSize: 30,
      });
      setResultats(data.resultats);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Recherche impossible.');
    } finally {
      setRecherche(false);
    }
  };

  const rapprocher = async (article) => {
    try {
      const { data } = await cerveauAPI.similaires(article.id);
      setSimilaires({ source: article, liste: data.similaires });
      if (!data.similaires.length) toast('Aucun autre article sur ce sujet.');
    } catch {
      toast.error('Rapprochement impossible.');
    }
  };

  return (
    <div className="max-w-5xl">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-ink">Cerveau numérique</h1>
          <Aide>
            La mémoire du journal. Cherchez dans tout ce qui a été publié : les guillemets imposent une
            expression exacte (&laquo;&nbsp;conseil café-cacao&nbsp;&raquo;), le signe moins écarte un mot
            (orpaillage -Bouaflé), et OR accepte l&apos;un ou l&apos;autre. Sur chaque résultat, «&nbsp;Sujets
            liés&nbsp;» retrouve les papiers déjà écrits sur la même affaire.
          </Aide>
        </div>
        {apercu && (
          <p className="text-muted text-sm mt-1">
            {apercu.articles.toLocaleString('fr-FR')} articles · {apercu.editions} numéros ·{' '}
            {apercu.medias.toLocaleString('fr-FR')} médias
            {apercu.couverture?.debut && (
              <> · de {dateCourte(apercu.couverture.debut)} à {dateCourte(apercu.couverture.fin)}</>
            )}
          </p>
        )}
      </header>

      <form onSubmit={chercher} className="bg-white rounded-xl border border-line p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Un nom, un lieu, une affaire…"
            className="flex-1 border border-line rounded-lg px-3.5 py-2.5 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={recherche}
            className="bg-navy text-white font-semibold text-sm rounded-lg px-6 py-2.5 disabled:opacity-50"
          >
            {recherche ? 'Recherche…' : 'Chercher'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <select
            value={rubrique}
            onChange={(e) => setRubrique(e.target.value)}
            className="border border-line rounded-lg px-3 py-1.5 text-[13px]"
          >
            <option value="">Toutes les rubriques</option>
            {rubriques.map((r) => (
              <option key={r.slug} value={r.slug}>{r.nom}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-[13px] text-muted">
            du
            <input type="date" value={depuis} onChange={(e) => setDepuis(e.target.value)}
              className="border border-line rounded-lg px-2 py-1.5" />
          </label>
          <label className="flex items-center gap-1.5 text-[13px] text-muted">
            au
            <input type="date" value={jusqua} onChange={(e) => setJusqua(e.target.value)}
              className="border border-line rounded-lg px-2 py-1.5" />
          </label>
        </div>
      </form>

      {similaires && (
        <section className="bg-white rounded-xl border border-navy/30 p-4 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Sujets liés à</p>
              <p className="font-semibold text-ink text-sm mt-0.5">{similaires.source.titre}</p>
            </div>
            <button onClick={() => setSimilaires(null)} className="text-muted text-xs hover:text-ink">Fermer</button>
          </div>
          <ul className="mt-3 space-y-2">
            {similaires.liste.map((a) => (
              <li key={a.id} className="flex items-start gap-2.5 text-sm">
                <span className="font-mono text-[10px] uppercase mt-1 shrink-0" style={{ color: a.rubriqueCouleur }}>
                  {a.rubriqueNom}
                </span>
                <span className="flex-1">{a.titre}</span>
                <span className="text-muted text-[11.5px] tabular-nums shrink-0">{dateCourte(a.publieLe)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resultats && (
        <section>
          <p className="text-muted text-sm mb-3">
            {total.toLocaleString('fr-FR')} résultat{total > 1 ? 's' : ''}
            {total > resultats.length && ` — les ${resultats.length} plus proches`}
          </p>

          {resultats.length === 0 && (
            <p className="text-muted text-sm bg-white rounded-xl border border-line p-6 text-center">
              Rien trouvé. Essayez un terme plus large, ou retirez un filtre.
            </p>
          )}

          <ul className="space-y-2.5">
            {resultats.map((a) => (
              <li key={a.id} className="bg-white rounded-xl border border-line p-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: a.rubriqueCouleur }}>
                    {a.rubriqueNom}
                  </span>
                  <span className="text-muted text-[11.5px] tabular-nums">{dateCourte(a.publieLe)}</span>
                  {a.statut !== 'PUBLIE' && (
                    <span className="font-mono text-[9.5px] uppercase tracking-wider bg-cream text-muted px-1.5 py-0.5 rounded">
                      {a.statut}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-ink mt-1">{a.titre}</h3>
                {a.extrait && (
                  // Le surlignage vient de la base : les termes trouvés sont
                  // encadrés de <mark>, jamais de HTML d'article.
                  <p
                    className="text-[13.5px] text-muted leading-relaxed mt-1.5 [&_mark]:bg-gold/30 [&_mark]:text-ink [&_mark]:rounded-sm [&_mark]:px-0.5"
                    dangerouslySetInnerHTML={{ __html: a.extrait }}
                  />
                )}
                <button
                  onClick={() => rapprocher(a)}
                  className="text-navy text-[12.5px] font-semibold mt-2 hover:underline"
                >
                  Sujets liés →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!resultats && apercu?.parRubrique?.length > 0 && (
        <section className="bg-white rounded-xl border border-line p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-3">Ce que le Cerveau a en mémoire</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {apercu.parRubrique.map((r) => (
              <li key={r.slug} className="flex items-center justify-between text-sm border-b border-line/60 py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.couleur || '#999' }} />
                  {r.nom}
                </span>
                <span className="tabular-nums text-muted">{r.total.toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
