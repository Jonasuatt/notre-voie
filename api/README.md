# Notre Voie — API

API REST (Node.js/Express + Prisma/PostgreSQL) servant les trois briques de la plateforme : CMS 1 (Administration/Régie), CMS 2 (Rédaction + PWA), site public et application mobile. Voir [le cahier des charges](../docs/cahier-des-charges.md) pour le contexte produit complet.

## Démarrage

```bash
cp .env.example .env      # renseigner DATABASE_URL, JWT_SECRET, etc.
npm install
npm run db:migrate        # crée les tables en base
npm run db:seed           # rubriques éditoriales/service + comptes staff de démo + ticker Vie chère
npm run dev
```

Comptes de démonstration créés par le seed — chacun reçoit un mot de passe individuel généré aléatoirement à la création, affiché **une seule fois** dans la sortie console du seed (jamais stocké en clair, jamais commité) :

| Email | Rôle |
|---|---|
| admin@notrevoienews.com | ADMIN |
| redacteur-en-chef@notrevoienews.com | REDACTEUR_EN_CHEF |
| secretaire-general@notrevoienews.com | SECRETAIRE_GENERAL |
| chef-politique@notrevoienews.com | CHEF_SERVICE |
| chef-culture@notrevoienews.com | CHEF_SERVICE |
| regie@notrevoienews.com | REGIE |
| redacteur@notrevoienews.com | REDACTEUR |

Rotation à tout moment : `node prisma/rotate-passwords.js` (en local, avec `DATABASE_URL` pointé sur `DATABASE_PUBLIC_URL` du service Postgres — la base n'est pas joignable depuis un poste local via le réseau privé Railway). Régénère un mot de passe par compte, les affiche une seule fois, et n'écrit rien sur disque.

## Architecture

- `prisma/schema.prisma` — modèle de données complet (19 modèles, cf. commentaires en tête de fichier)
- `src/app.js` — point d'entrée Express (sécurité, CORS, rate-limit, montage des routes)
- `src/middleware/auth.js` — deux espaces d'authentification JWT distincts : `authStaff` (CMS 1/2) et `authReader` (grand public), plus `optionalReader` pour les routes publiques sensibles au paywall
- `src/controllers/` — logique métier, un fichier par domaine
- `src/routes/` — déclaration des endpoints et des permissions par rôle

## Endpoints principaux

| Domaine | Base | Détail |
|---|---|---|
| Auth | `/api/auth` | `staff/login`, `reader/register`, `reader/login`, `.../me` |
| Rubriques | `/api/rubriques` | Liste publique + gestion ADMIN |
| Articles | `/api/articles` | Flux public paywall-aware, CRUD rédaction, workflow `soumettre → valider → publier`, live updates, checklist |
| Fact-check | `/api/verite-ou-intox`, `/api/articles/:id/fact-check` | Rubrique Vérité ou Intox |
| Éditions | `/api/editions` | Kiosque numérique (PDF) |
| Vie chère | `/api/prix-vie-chere` | Ticker accueil |
| Notifications | `/api/notifications` | Fils Quotidien / Flash |
| Abonnements & paiements | `/api/abonnements`, `/api/paiements` | Paywall souple — abonnement ou paiement à l'article |
| Régie | `/api/campagnes` | Campagnes, ciblage, statistiques de diffusion, facturation |

## Workflow éditorial (Article.statut)

```
BROUILLON → (soumettre, auteur) → EN_RELECTURE → (valider, chef de service+) → VALIDE → (publier, rédacteur en chef+) → PUBLIE
```

La validation est bloquée tant que la checklist de vérification n'est pas complète pour les formats `FLASH` et `VERITE_OU_INTOX`. La publication crée automatiquement une `Notification` (fil `FLASH` pour Flash/Vérité ou Intox, `QUOTIDIEN` sinon) — son envoi effectif (push Expo / Web Push) est un webhook séparé à brancher en phase 3 Mobile.

## Décisions techniques prises pour ce cadrage

Voir [DECISIONS.md](../docs/DECISIONS.md) pour l'ensemble des arbitrages faits sans validation préalable (staff/reader séparés, contenu HTML plutôt que JSON riche, multi-rubriquage secondaire, prix d'abonnement indicatifs, etc.) — à corriger librement si besoin.
