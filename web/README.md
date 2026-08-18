# Notre Voie — Site public (Next.js)

Site grand public (accueil, rubriques, fiche article, kiosque, Vérité ou Intox, abonnement) — SSR/SEO, consomme [`../api`](../api).

## Démarrage

```bash
npm install
npm run dev   # http://localhost:3000
```

Par défaut, le site tente d'appeler l'API sur `http://localhost:4000`. Tant que l'API n'est pas démarrée avec une base peuplée, chaque appel bascule automatiquement sur des **données de démonstration** (`src/lib/fixtures.js`), avec exactement la même forme que les vraies réponses API — aucune page ne casse, et le comportement (paywall souple compris) reste fidèle. Voir `docs/DECISIONS.md` (#9) et `src/lib/api.js`.

Pour pointer vers une API déployée :

```bash
NEXT_PUBLIC_API_URL=https://api.notrevoienews.com npm run dev
```

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil : bandeau Flash (stories), ticker Vie chère, Une + résumé du jour, bloc Vérité ou Intox, grille de rubriques |
| `/rubrique/[slug]` | Flux d'une rubrique |
| `/article/[slug]` | Fiche article — badges de format, écoute audio, mises à jour Live, verdict fact-check, paywall souple |
| `/verite-ou-intox` | Flux des vérifications |
| `/kiosque` | Éditions PDF archivées |
| `/abonnement` | Formules d'abonnement (paywall souple) |

## Design

Palette et typographies reprises telles quelles de `notre-voie-maquette-produit.html` (Fraunces/Inter/Space Mono, navy/coral/gold) — voir `tailwind.config.js`.
