import Link from 'next/link';

// Pastille bicolore reprise de la maquette produit — utilisée dans le
// header et le footer. Le PNG officiel (logo.png) reste disponible pour
// la Une / les partages sociaux via <Image src="/logo.png" .../>.
export default function LogoPill({ small = false, href = '/' }) {
  const size = small ? 'h-[26px] text-[11px] px-[9px]' : 'h-9 text-[15px] px-[13px]';
  return (
    <Link href={href} className="inline-flex items-center rounded-full overflow-hidden shadow-sm font-serif font-extrabold">
      <span className={`bg-navy text-white flex items-center ${size}`}>Notre</span>
      <span className={`bg-white text-coral font-black flex items-center ${size}`}>Voie</span>
    </Link>
  );
}
