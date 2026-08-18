import { LABEL_FORMAT } from '@/lib/format';

// Badge de format affiché sur chaque carte d'article — indique le
// traitement (Flash, Direct, Vidéo...) avant même le clic, cf. cahier
// des charges §3.4 "Badges de contenu".
export default function FormatBadge({ format }) {
  const isLive = format === 'LIVE';
  return (
    <span className="absolute top-2.5 left-2.5 bg-white/95 text-ink font-mono text-[9.5px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 tracking-wide">
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-coral dot-live" />}
      {LABEL_FORMAT[format] || format}
    </span>
  );
}
