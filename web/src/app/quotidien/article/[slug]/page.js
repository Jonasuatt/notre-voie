import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug } from '@/lib/api';
import FormatBadge from '@/components/FormatBadge';
import Paywall from '@/components/Paywall';
import { formatDate, timeAgo } from '@/lib/format';

const BASE_PATH = '/quotidien';

const VERDICT_STYLE = {
  VRAI: { label: 'Vrai', color: '#4ADE80' },
  FAUX: { label: 'Faux', color: '#E6008C' },
  TROMPEUR: { label: 'Trompeur', color: '#E8B84B' },
  NON_VERIFIABLE: { label: 'Non vérifiable', color: '#6B7280' },
};

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Article introuvable' };
  return {
    title: article.titre,
    description: article.chapo,
    openGraph: { title: article.titre, description: article.chapo, type: 'article' },
  };
}

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const verrouille = article.paywallLocked;
  const verdict = article.factCheck ? VERDICT_STYLE[article.factCheck.verdict] : null;
  const medias = article.medias || [];
  const imagePrincipale = article.imageUneUrl ? medias.find((m) => m.url === article.imageUneUrl) : null;
  const galerie = medias.filter((m) => m.type === 'PHOTO' && m.url !== article.imageUneUrl).sort((a, b) => a.ordre - b.ordre);
  const video = medias.find((m) => m.type === 'VIDEO');
  const audio = medias.find((m) => m.type === 'AUDIO');

  return (
    <article className="max-w-[720px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center gap-2.5 flex-wrap">
        <FormatBadge format={article.format} />
        <Link href={`${BASE_PATH}/rubrique/${article.rubrique?.slug}`} className="font-mono text-[11px] uppercase tracking-wide" style={{ color: article.rubrique?.couleur }}>
          {article.rubrique?.nom}
        </Link>
        {article.rubriquesSecondaires?.map((r) => (
          <Link key={r.id} href={`${BASE_PATH}/rubrique/${r.slug}`} className="font-mono text-[11px] uppercase tracking-wide text-muted">
            + {r.nom}
          </Link>
        ))}
      </div>

      <h1 className="font-serif text-[28px] sm:text-[32px] leading-tight mt-3">{article.titre}</h1>
      {article.chapo && <p className="text-muted text-[16px] mt-3 leading-relaxed">{article.chapo}</p>}

      <div className="flex flex-wrap items-center gap-4 mt-5 py-4 border-t border-b border-line font-mono text-[11px] text-muted">
        {article.auteur && <span>{article.auteur.prenom} {article.auteur.nom}</span>}
        <span>{formatDate(article.publieLe)} · {timeAgo(article.publieLe)}</span>
        {article.dureeEcouteSec && (
          <button className="flex items-center gap-1.5 text-navy font-bold">
            🎧 Écouter ({Math.round(article.dureeEcouteSec / 60)} min)
          </button>
        )}
        <span>👁 {article.vuesTotal?.toLocaleString('fr-FR')} lectures</span>
      </div>

      <figure className="mt-6">
        <div className="relative h-[280px] sm:h-[400px] rounded-[10px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
          {article.imageUneUrl && (
            <Image src={article.imageUneUrl} alt={imagePrincipale?.legende || article.titre} fill sizes="720px" priority className="object-cover" />
          )}
        </div>
        {imagePrincipale?.legende && (
          <figcaption className="text-[12px] text-muted mt-2 leading-snug">
            {imagePrincipale.legende}
            {imagePrincipale.credit && <span className="text-muted/70"> — {imagePrincipale.credit}</span>}
          </figcaption>
        )}
      </figure>

      {video && (
        <figure className="mt-6">
          {/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(video.url) ? (
            <div className="relative aspect-video rounded-[10px] overflow-hidden bg-ink">
              <iframe
                src={video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="absolute inset-0 w-full h-full" allowFullScreen title={video.legende || 'Vidéo'}
              />
            </div>
          ) : (
            <video src={video.url} controls className="w-full rounded-[10px] bg-ink" />
          )}
          {video.legende && (
            <figcaption className="text-[12px] text-muted mt-2 leading-snug">
              {video.legende}{video.credit && <span className="text-muted/70"> — {video.credit}</span>}
            </figcaption>
          )}
        </figure>
      )}

      {audio && (
        <div className="mt-6 bg-cream border border-line rounded-[10px] p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-wide text-muted mb-2">🎧 {audio.legende || 'Version audio'}</p>
          <audio src={audio.url} controls className="w-full" />
        </div>
      )}

      {article.factCheck && (
        <div className="mt-6 border-l-4 rounded-r-lg bg-[#FBF3E4] p-5" style={{ borderColor: verdict.color }}>
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: verdict.color }}>
            Verdict Vérité ou Intox : {verdict.label}
          </span>
          {article.factCheck.rumeurOrigine && (
            <p className="text-[13.5px] mt-2"><b>Rumeur :</b> {article.factCheck.rumeurOrigine}{article.factCheck.sourceRumeur ? ` (source : ${article.factCheck.sourceRumeur})` : ''}</p>
          )}
          {article.factCheck.preuves && <p className="text-[13.5px] mt-1.5"><b>Éléments de vérification :</b> {article.factCheck.preuves}</p>}
        </div>
      )}

      {article.format === 'LIVE' && article.liveUpdates?.length > 0 && (
        <div className="mt-6 space-y-4">
          {article.liveUpdates.map((u) => (
            <div key={u.id} className="flex gap-3 pl-3 border-l-2 border-coral">
              <div>
                <span className="font-mono text-[10.5px] text-coral font-bold">{timeAgo(u.horodatage)}</span>
                <p className="text-[14.5px] mt-1">{u.contenu}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {verrouille ? (
        <Paywall article={article} basePath={BASE_PATH} />
      ) : (
        article.contenuHtml && (
          <div className="prose-article mt-7 text-[16px] text-ink" dangerouslySetInnerHTML={{ __html: article.contenuHtml }} />
        )
      )}

      {galerie.length > 0 && (
        <div className="mt-8 pt-6 border-t border-line">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-4">Galerie photo</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {galerie.map((m) => (
              <figure key={m.id}>
                <div className="relative h-[220px] rounded-[10px] overflow-hidden bg-navy2">
                  <Image src={m.url} alt={m.legende || ''} fill sizes="360px" className="object-cover" />
                </div>
                {m.legende && (
                  <figcaption className="text-[12px] text-muted mt-2 leading-snug">
                    {m.legende}{m.credit && <span className="text-muted/70"> — {m.credit}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-5 border-t border-line">
          {article.tags.map((t) => (
            <span key={t} className="font-mono text-[10.5px] bg-cream border border-line rounded-full px-3 py-1 text-muted">#{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}
