import Link from 'next/link';
import Image from 'next/image';

// Bloc "dossier" façon nytimes.com : un intitulé de section (rubrique ou
// thème), puis une liste resserrée de titres courts séparés par de fines
// lignes — la façon dont le NYT regroupe une actualité en plusieurs entrées
// (ex. "Guerre au Moyen-Orient") plutôt qu'une grille de grandes cartes.
// `avecVignette` ajoute une petite miniature carrée à chaque ligne.
export default function ClusterArticles({ titre, couleur, articles, basePath = '', avecVignette = false }) {
  if (!articles?.length) return null;

  return (
    <div>
      <h3
        className="font-mono text-[10.5px] font-bold uppercase tracking-widest pb-2 border-b"
        style={{ color: couleur || '#22D3EE', borderColor: '#232B45' }}
      >
        {titre}
      </h3>
      <ul>
        {articles.map((a) => (
          <li key={a.id} className="border-t first:border-t-0 py-3 flex gap-3 items-start group" style={{ borderColor: '#232B45' }}>
            {avecVignette && a.imageUneUrl && (
              <Link href={`${basePath}/article/${a.slug}`} className="relative w-[52px] h-[52px] rounded overflow-hidden shrink-0 bg-navy2 block">
                <Image src={a.imageUneUrl} alt="" fill sizes="52px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </Link>
            )}
            <div className="min-w-0">
              <Link href={`${basePath}/article/${a.slug}`} className="font-serif text-[14.5px] leading-snug hover:text-[#22D3EE] transition-colors">
                {a.titre}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
