import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { articlesAPI, rubriquesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS, PAYWALL_LABELS, ROLES_VALIDATION } from '../utils/constants';
import ChecklistPanel from '../components/ChecklistPanel';
import LiveUpdatesPanel from '../components/LiveUpdatesPanel';
import FactCheckPanel from '../components/FactCheckPanel';
import WorkflowActions from '../components/WorkflowActions';
import ArticlePreview from '../components/ArticlePreview';
import MediaManager from '../components/MediaManager';

const EMPTY_FORM = {
  titre: '', chapo: '', contenuHtml: '', format: 'EDITION', rubriqueId: '',
  rubriquesSecondairesIds: [], paywall: 'LIBRE', tags: '', imageUneUrl: '', datePublicationPrevue: '',
  portails: ['QUOTIDIEN'],
};

const PORTAIL_LABELS = { QUOTIDIEN: 'Le Quotidien', INFO_DIRECT: 'Info en direct' };

export default function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staff } = useAuth();

  const [rubriques, setRubriques] = useState([]);
  const [article, setArticle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Deux rédactions, deux portails : un article peut alimenter Le Quotidien,
  // Info en direct, ou les deux à la fois.
  const togglePortail = (portail) => {
    setForm((f) => {
      const deja = f.portails.includes(portail);
      const suivant = deja ? f.portails.filter((p) => p !== portail) : [...f.portails, portail];
      return { ...f, portails: suivant.length ? suivant : f.portails }; // au moins un portail
    });
  };

  const loadArticle = useCallback(() => {
    if (!id) return;
    return articlesAPI.getById(id).then(({ data }) => {
      setArticle(data.article);
      setForm({
        titre: data.article.titre || '',
        chapo: data.article.chapo || '',
        contenuHtml: data.article.contenuHtml || '',
        format: data.article.format,
        rubriqueId: data.article.rubriqueId,
        rubriquesSecondairesIds: (data.article.rubriquesSecondaires || []).map((r) => r.id),
        paywall: data.article.paywall,
        tags: (data.article.tags || []).join(', '),
        imageUneUrl: data.article.imageUneUrl || '',
        datePublicationPrevue: data.article.datePublicationPrevue ? data.article.datePublicationPrevue.slice(0, 16) : '',
        portails: data.article.portails?.length ? data.article.portails : ['QUOTIDIEN'],
      });
    });
  }, [id]);

  useEffect(() => {
    rubriquesAPI.getAll().then((r) => setRubriques(r.data.rubriques));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      loadArticle().finally(() => setLoading(false));
    }
  }, [id, loadArticle]);

  const rubriqueActive = rubriques.find((r) => r.id === form.rubriqueId);

  const canEditContent = !article || article.statut !== 'PUBLIE' || ROLES_VALIDATION.includes(staff.role);

  // Définir l'image principale depuis la galerie : mise à jour du formulaire
  // + persistance immédiate si l'article existe déjà (pas besoin de cliquer
  // "Enregistrer" pour que la Une soit prise en compte).
  const setPrincipale = async (url) => {
    setForm((f) => ({ ...f, imageUneUrl: url }));
    if (article) {
      try {
        await articlesAPI.update(article.id, { imageUneUrl: url });
        toast.success('Image principale mise à jour.');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Mise à jour impossible.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.rubriqueId) {
      toast.error('Titre et rubrique sont requis.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      datePublicationPrevue: form.datePublicationPrevue || null,
    };
    try {
      if (article) {
        await articlesAPI.update(article.id, payload);
        await loadArticle();
        toast.success('Article enregistré.');
      } else {
        const { data } = await articlesAPI.create(payload);
        toast.success('Brouillon créé.');
        navigate(`/articles/${data.article.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Chargement…</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{article ? 'Modifier l\'article' : 'Nouvel article'}</h1>
          {article && <p className="text-xs text-gray-400 font-mono mt-1">Auteur : {article.auteur?.prenom} {article.auteur?.nom}</p>}
        </div>
      </div>

      {article && <div className="mt-5"><WorkflowActions article={article} staff={staff} onUpdated={loadArticle} /></div>}

      <form onSubmit={handleSave} className="card p-6 mt-5 space-y-5">
        <div>
          <label className="label">Format</label>
          <select className="input" value={form.format} onChange={set('format')} disabled={!canEditContent}>
            {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">{FORMAT_DESCRIPTIONS[form.format]}</p>
        </div>

        <div>
          <label className="label">Titre</label>
          <input className="input" value={form.titre} onChange={set('titre')} disabled={!canEditContent} required />
        </div>

        <div>
          <label className="label">Chapo (accroche)</label>
          <textarea className="input" rows={2} value={form.chapo} onChange={set('chapo')} disabled={!canEditContent} />
        </div>

        <div>
          <label className="label">Contenu</label>
          <textarea className="input font-mono text-xs" rows={10} value={form.contenuHtml} onChange={set('contenuHtml')} disabled={!canEditContent} placeholder="<p>Corps de l'article en HTML…</p>" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Rubrique principale</label>
            <select className="input" value={form.rubriqueId} onChange={set('rubriqueId')} disabled={!canEditContent} required>
              <option value="">— Choisir —</option>
              {rubriques.filter((r) => r.type === 'EDITORIALE').map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Accès</label>
            <select className="input" value={form.paywall} onChange={set('paywall')} disabled={!canEditContent}>
              {Object.entries(PAYWALL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Portail(s) de diffusion</label>
          <div className="flex gap-4 mt-1">
            {Object.entries(PORTAIL_LABELS).map(([valeur, libelle]) => (
              <label key={valeur} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.portails.includes(valeur)}
                  onChange={() => togglePortail(valeur)}
                  disabled={!canEditContent}
                />
                {libelle}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Le Quotidien reprend le contenu du journal papier ; Info en direct est animé au quotidien par la rédaction web.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Image principale (URL)</label>
            <input className="input" value={form.imageUneUrl} onChange={set('imageUneUrl')} disabled={!canEditContent} placeholder="https://res.cloudinary.com/…" />
          </div>
          <div>
            <label className="label">Publication programmée (optionnel)</label>
            <input type="datetime-local" className="input" value={form.datePublicationPrevue} onChange={set('datePublicationPrevue')} disabled={!canEditContent} />
          </div>
        </div>

        <div>
          <label className="label">Mots-clés (séparés par une virgule)</label>
          <input className="input" value={form.tags} onChange={set('tags')} disabled={!canEditContent} placeholder="cacao, ports, gouvernement" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving || !canEditContent} className="btn-primary">
            {saving ? 'Enregistrement…' : article ? 'Enregistrer les modifications' : 'Créer le brouillon'}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <ArticlePreview form={form} rubrique={rubriqueActive} />
      </div>

      <div className="mt-5 space-y-5">
        <MediaManager articleId={article?.id} type="PHOTO" title="Photos légendées / Galerie" multiple onSetPrincipale={setPrincipale} />
        <MediaManager articleId={article?.id} type="VIDEO" title="Vidéo" />
        <MediaManager articleId={article?.id} type="AUDIO" title="Audio" />
      </div>

      {article && (article.format === 'FLASH' || article.format === 'VERITE_OU_INTOX') && (
        <div className="mt-5"><ChecklistPanel article={article} onUpdated={loadArticle} canEdit={canEditContent} /></div>
      )}

      {article && article.format === 'VERITE_OU_INTOX' && (
        <div className="mt-5"><FactCheckPanel article={article} onUpdated={loadArticle} /></div>
      )}

      {article && article.format === 'LIVE' && (
        <div className="mt-5"><LiveUpdatesPanel article={article} onUpdated={loadArticle} /></div>
      )}

      {article && (
        <p className="text-xs text-gray-400 font-mono mt-5">
          👁 {article.vuesTotal?.toLocaleString('fr-FR')} lectures au total
        </p>
      )}
    </div>
  );
}
