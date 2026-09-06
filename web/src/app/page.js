import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getKiosqueResume, getRubriques } from '@/lib/api';
import { formatDateRange, timeAgo } from '@/lib/format';

export const metadata = { title: 'Notre Voie' };
// Rendu à la demande, comme les autres pages de contenu : la page montre des
// chiffres et des articles réels, elle ne doit pas figer l'état du build.
export const dynamic = 'force-dynamic';

// Portail d'entrée. Deux rédactions, deux portes — mais la page ne s'y limite
// plus : elle donne à voir ce que contient réellement la plateforme (la une du
// jour, le fonds d'archives, les formats de la rédaction web). Chiffres et
// contenus viennent de l'API, jamais d'exemples fabriqués : une rubrique vide
// ne s'affiche pas.
const SERVICES = [
  { slug: 'live-tv', icone: '📡', portail: 'info-direct' },
  { slug: 'videos', icone: '🎬', portail: 'info-direct' },
  { slug: 'audio-podcasts', icone: '🎧', portail: 'info-direct' },
  { slug: 'photos-legendees', icone: '📷', portail: 'info-direct' },
];

export default async function PortailPage() {
  const [uneDuJour, direct, kiosque, rubriques] = await Promise.all([
    getArticles({ portail: 'QUOTIDIEN', pageSize: 4 }),
    getArticles({ portail: 'INFO_DIRECT', pageSize: 3 }),
    getKiosqueResume({ pageSize: 4 }),
    getRubriques(),
  ]);

  const editoriales = rubriques.filter((r) => r.type === 'EDITORIALE' && !r.parentId);
  const services = SERVICES
    .map((s) => ({ ...s, rubrique: rubriques.find((r) => r.slug === s.slug) }))
    .filter((s) => s.rubrique);
  const derniere = kiosque.editions[0];

  return (
    <div className="min-h-screen bg-[#072742] text-[#EAF3FB]">
      <header className="px-6 pt-14 pb-10 text-center">
        <Link href="/" className="inline-flex bg-white rounded-[8px] overflow-hidden shadow-lg">
          <Image src="/logo.png" alt="Notre Voie" width={233} height={90} priority style={{ height: 62, width: 'auto' }} />
        </Link>
        <h1 className="font-serif text-[28px] sm:text-[34px] max-w-xl mx-auto leading-tight mt-8">
          Aussi rapide que les réseaux sociaux, aussi fiable qu&apos;un journal
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A9C6DD] mt-4">Choisissez votre édition</p>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            href="/info-direct"
            className="group bg-[#0B3358] border border-[#4FB3F0]/30 rounded-2xl p-8 hover:-translate-y-1 transition-transform shadow-xl"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-[#4FB3F0] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FB3F0] dot-live" /> L&apos;actualité au fil de l&apos;eau
            </span>
            <h2 className="font-serif text-[26px] mt-2 group-hover:text-[#4FB3F0] transition-colors">Info en direct</h2>
            <p className="text-[#A9C6DD] text-[14px] mt-3 leading-relaxed">
              L&apos;édition animée au quotidien par la rédaction web : direct, vidéo, podcasts et vérification des rumeurs.
            </p>
            <span className="inline-block mt-5 text-[13px] font-bold text-[#4FB3F0]">Entrer →</span>
          </Link>

          <Link href="/quotidien" className="group bg-white rounded-2xl p-8 hover:-translate-y-1 transition-transform shadow-xl">
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#E90895] font-bold">Le journal, chaque jour</span>
            <h2 className="font-serif text-[26px] text-[#14141F] mt-2">Le Quotidien</h2>
            <p className="text-[#5A6070] text-[14px] mt-3 leading-relaxed">
              L&apos;édition fidèle au journal papier : rubriques traditionnelles, Une du jour, kiosque numérique et archives.
            </p>
            <span className="inline-block mt-5 text-[13px] font-bold text-[#0B6FA8]">Entrer →</span>
          </Link>
        </div>

        {uneDuJour.articles?.length > 0 && (
          <Section titre="À la une du Quotidien" lien="/quotidien" libelleLien="Tout le journal">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {uneDuJour.articles.map((a) => (
                <Link key={a.id} href={`/quotidien/article/${a.slug}`} className="group block">
                  <div className="relative aspect-video rounded-[8px] overflow-hidden bg-[#12456F] mb-2.5">
                    {a.imageUneUrl && (
                      <Image src={a.imageUneUrl} alt="" fill sizes="260px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-[#4FB3F0]">{a.rubrique?.nom}</span>
                  <h3 className="font-serif text-[15px] leading-snug mt-1 line-clamp-3 group-hover:text-[#4FB3F0] transition-colors">{a.titre}</h3>
                  <span className="font-mono text-[10.5px] text-[#A9C6DD] mt-1.5 block">{timeAgo(a.publieLe)}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {derniere && (
          <Section titre="Kiosque numérique" lien="/quotidien/kiosque" libelleLien="Feuilleter les archives">
            <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
              <Link href="/quotidien/kiosque" className="block">
                <div className="relative aspect-[3/4] rounded-[8px] overflow-hidden bg-[#12456F] shadow-xl">
                  {derniere.couvertureUrl && (
                    <Image src={derniere.couvertureUrl} alt={`Une du n°${derniere.numero}`} fill sizes="220px" className="object-cover" />
                  )}
                </div>
                <span className="font-mono text-[10.5px] text-[#A9C6DD] block mt-2 text-center">
                  N°{derniere.numero} — {formatDateRange(derniere.dateParution, derniere.dateFin)}
                </span>
              </Link>
              <div>
                <p className="text-[15px] leading-relaxed text-[#CFE3F3]">
                  Chaque parution est archivée en PDF, page à page, et ses articles restent consultables au jour de leur sortie.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  <Chiffre valeur={kiosque.total} libelle="numéros archivés" />
                  <Chiffre valeur={kiosque.total * 8} libelle="pages consultables" />
                  <Chiffre valeur={editoriales.length} libelle="rubriques" />
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {editoriales.slice(0, 10).map((r) => (
                    <Link
                      key={r.id}
                      href={`/quotidien/rubrique/${r.slug}`}
                      className="font-mono text-[11px] uppercase tracking-wide border border-[#2E6D9E] rounded-full px-3 py-1.5 text-[#CFE3F3] hover:border-[#4FB3F0] hover:text-[#4FB3F0] transition-colors"
                    >
                      {r.nom}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}

        {direct.articles?.length > 0 && (
          <Section titre="En ce moment sur Info en direct" lien="/info-direct" libelleLien="Suivre le direct">
            <div className="grid sm:grid-cols-3 gap-6">
              {direct.articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/info-direct/article/${a.slug}`}
                  className="group block bg-[#0B3358] rounded-xl p-5 border border-[#2E6D9E] hover:border-[#4FB3F0] transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wide text-[#4FB3F0]">{a.rubrique?.nom}</span>
                  <h3 className="font-serif text-[15.5px] leading-snug mt-1.5 line-clamp-3">{a.titre}</h3>
                  <span className="font-mono text-[10.5px] text-[#A9C6DD] mt-2 block">{timeAgo(a.publieLe)}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {services.length > 0 && (
          <Section titre="Les formats de la rédaction web">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.portail}/rubrique/${s.slug}`}
                  className="group bg-[#0B3358] border border-[#2E6D9E] rounded-xl p-5 hover:border-[#4FB3F0] transition-colors"
                >
                  <span className="text-[22px]">{s.icone}</span>
                  <h3 className="font-serif text-[16px] mt-2 group-hover:text-[#4FB3F0] transition-colors">{s.rubrique.nom}</h3>
                  {s.rubrique.angleEditorial && (
                    <p className="text-[12.5px] text-[#A9C6DD] mt-1.5 leading-snug line-clamp-3">{s.rubrique.angleEditorial}</p>
                  )}
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>

      <footer className="border-t border-[#2E6D9E] py-8 text-center">
        <p className="text-[#A9C6DD] text-[11px] font-mono">© {new Date().getFullYear()} Notre Voie — La Refondation</p>
      </footer>
    </div>
  );
}

function Section({ titre, lien, libelleLien, children }) {
  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between gap-4 pb-3 mb-6 border-b border-[#2E6D9E]">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#A9C6DD]">{titre}</h2>
        {lien && (
          <Link href={lien} className="font-mono text-[11px] text-[#4FB3F0] hover:underline shrink-0">
            {libelleLien} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Chiffre({ valeur, libelle }) {
  return (
    <div>
      <span className="font-serif text-[26px] text-[#4FB3F0] block leading-none">{valeur.toLocaleString('fr-FR')}</span>
      <span className="font-mono text-[10.5px] uppercase tracking-wide text-[#A9C6DD]">{libelle}</span>
    </div>
  );
}
