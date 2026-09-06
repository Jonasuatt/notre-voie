import { useState, useId } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Bulle d'aide contextuelle. Posée à côté d'un titre ou d'un champ, elle
// explique en une phrase à quoi sert l'écran et ce qu'il attend — la
// rédaction n'a pas à retenir le guide pour se servir de l'outil.
// Accessible : le contenu est lié au bouton et s'ouvre aussi au clavier.
export default function Aide({ children, position = 'droite' }) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const placement = position === 'gauche' ? 'right-0' : 'left-0';

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="Aide"
        aria-expanded={ouvert}
        aria-describedby={ouvert ? id : undefined}
        onClick={() => setOuvert((o) => !o)}
        onMouseEnter={() => setOuvert(true)}
        onMouseLeave={() => setOuvert(false)}
        onBlur={() => setOuvert(false)}
        className="text-gray-400 hover:text-navy transition-colors"
      >
        <QuestionMarkCircleIcon className="w-[18px] h-[18px]" />
      </button>
      {ouvert && (
        <span
          id={id}
          role="tooltip"
          className={`absolute top-6 ${placement} z-30 w-64 rounded-lg bg-ink text-white text-[12.5px] leading-relaxed p-3 shadow-xl font-normal normal-case tracking-normal`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
