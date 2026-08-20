'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// La Une devient cliquable : un clic ouvre un message plutôt que le PDF
// directement — abonné (code validé) → le PDF s'ouvre ; non-abonné → invité
// à passer à l'abonnement. Le système d'abonnement réel (compte, paiement)
// arrivera plus tard ; pour l'instant, la clé d'accès est le code communiqué
// aux abonnés (cf. CMS Rédaction, Edition.codeAcces).
//
// Protection anti-téléchargement : calque transparent au-dessus de l'image
// (le clic droit du navigateur ne cible jamais l'<img>, "Enregistrer l'image
// sous…" n'apparaît alors plus dans la plupart des navigateurs). Frein réel,
// pas une protection totale — aucun site ne peut empêcher une capture d'écran.
export default function UneVerrouillee({ editionId, verrouille, couvertureUrl, numero, sizes, priority, basePath = '' }) {
  const [ouvert, setOuvert] = useState(false);
  const [code, setCode] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const valider = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const res = await fetch(`${API_URL}/api/editions/${editionId}/deverrouiller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error || 'Code invalide.');
        return;
      }
      window.open(data.pdfUrl, '_blank', 'noopener,noreferrer');
      setOuvert(false);
      setCode('');
    } catch {
      setErreur('Connexion impossible. Réessayez.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="absolute inset-0 w-full h-full text-left cursor-pointer"
        aria-label={`Accéder au PDF du n°${numero}`}
      >
        <Image src={couvertureUrl} alt={`Une n°${numero}`} fill sizes={sizes} priority={priority} className="object-cover" draggable={false} />
        <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setOuvert(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[380px] w-full text-center" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-coral font-bold">Numéro N°{numero}</span>
            <h3 className="font-serif text-[20px] mt-2">Accéder au PDF</h3>

            {!verrouille ? (
              <p className="text-muted text-[13.5px] mt-3">Le PDF de ce numéro n&apos;est pas disponible en téléchargement.</p>
            ) : (
              <>
                <p className="text-muted text-[13.5px] mt-2">Ce PDF est réservé aux abonnés Notre Voie.</p>
                <Link
                  href={`${basePath}/abonnement`}
                  className="block bg-coral text-white font-bold text-[13.5px] px-6 py-3 rounded-full mt-5"
                >
                  Passer à l&apos;abonnement →
                </Link>

                <p className="text-muted text-[11.5px] mt-5 mb-2">Déjà abonné ? Saisissez votre code d&apos;accès :</p>
                <form onSubmit={valider} className="flex items-center gap-2 justify-center">
                  <input
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code abonné"
                    className="border border-line rounded px-2 py-1.5 text-[12.5px] font-mono uppercase w-[140px]"
                  />
                  <button type="submit" disabled={chargement || !code} className="text-[12px] font-bold text-white bg-ink rounded px-3 py-1.5 disabled:opacity-50">
                    {chargement ? '…' : 'Ouvrir'}
                  </button>
                </form>
                {erreur && <p className="text-[11px] text-red-600 mt-2">{erreur}</p>}
              </>
            )}

            <button onClick={() => setOuvert(false)} className="text-[11.5px] text-muted mt-5 hover:underline">Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
