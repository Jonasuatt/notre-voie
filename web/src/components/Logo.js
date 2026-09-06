import Link from 'next/link';
import Image from 'next/image';

// Logo officiel du journal (public/logo.png, 1080×418). Remplace l'ancienne
// pastille bicolore reconstituée en CSS : une seule source d'identité pour
// le header, le footer, la Une et les partages sociaux. Ratio 2.583:1, la
// hauteur pilote la largeur.
export default function LogoPill({ small = false, href = '/' }) {
  const h = small ? 26 : 38;
  return (
    <Link href={href} className="inline-flex items-center shrink-0 bg-white rounded-[6px] overflow-hidden" aria-label="Notre Voie — accueil">
      <Image src="/logo.png" alt="Notre Voie" width={Math.round(h * 2.583)} height={h} priority className="h-auto w-auto" style={{ height: h }} />
    </Link>
  );
}
