# Notre Voie — CMS 1 Administration & Régie publicitaire

Interface d'administration : vue consolidée des revenus (abonnements, paiements à l'article, régie), gestion des campagnes publicitaires (ciblage rubrique/région/format, statistiques de diffusion, facturation), gestion des comptes du personnel. Consomme [`../api`](../api) — voir [le cahier des charges](../docs/cahier-des-charges.md) §2.1.

## Démarrage

```bash
npm install
npm run dev   # http://localhost:3004
```

**Comptes de démonstration** — mot de passe individuel par compte, généré aléatoirement au premier déploiement et transmis une seule fois (jamais commité) :

| Email | Rôle | Accès |
|---|---|---|
| admin@notrevoienews.com | ADMIN | Tableau de bord, Campagnes, Annonceurs, **Comptes** |
| regie@notrevoienews.com | REGIE | Tableau de bord, Campagnes, Annonceurs |

Pour régénérer tous les mots de passe (rotation), voir `api/prisma/rotate-passwords.js` — s'exécute avec `DATABASE_PUBLIC_URL` (proxy TCP Railway) en variable `DATABASE_URL`, la base n'étant pas joignable depuis un poste local via `railway run`.

Tout autre rôle (rédaction) est rejeté à la connexion avec un message explicite — ce CMS n'est pas destiné à la rédaction (voir `cms-redaction/`).

## Pages

| Route | Contenu |
|---|---|
| `/` | Tableau de bord — revenu total engagé, lecteurs/abonnements, régie (campagnes actives, budget, factures impayées), rédaction |
| `/campagnes`, `/campagnes/:id` | Création (ciblage rubriques + régions + format), workflow de statut (Brouillon → En attente → Active ⇄ Pause → Terminée), impressions/clics/CTR, facturation |
| `/annonceurs` | Portefeuille annonceurs |
| `/comptes` (ADMIN uniquement) | Création de comptes staff, changement de rôle, activation/désactivation |

## Sécurité par rôle

Le contrôle d'accès existe à **deux niveaux**, l'API étant la vraie barrière :
1. **API** — chaque route staff est protégée par `requireRole(...)` (ex : `/api/staff` réservé à `ADMIN`)
2. **Interface** — la navigation masque les liens non autorisés, et `RequireRole` bloque l'affichage d'une page même en accès direct par URL (évite un écran vide/confus, ne remplace pas la protection API)
