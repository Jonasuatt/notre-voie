# Infrastructure — Railway

Provisionné le 17 août 2026. Workspace Railway : `jonasuatt's Projects`.

## Projet

- **Nom** : `notre-voie`
- **ID projet** : `3964e6e4-2e93-4893-805e-09703241b8b0`
- **Environnement** : `production` (`c975ac10-6f2e-40f7-8dc6-668d2490e19f`)
- Dashboard : https://railway.com/project/3964e6e4-2e93-4893-805e-09703241b8b0

## Services et URLs publiques

| Service | Rôle | URL publique |
|---|---|---|
| **Postgres** | Base de données | Pas d'accès public direct (réseau privé + proxy TCP, cf. plus bas) |
| **api** | API Notre Voie | **https://api-production-d7919.up.railway.app** |
| **web** | Site public (Next.js) | **https://web-production-8c1e3.up.railway.app** |
| **cms-redaction** | CMS 2 Rédaction (Vite) | **https://cms-redaction-production.up.railway.app** |
| **cms-admin** | CMS 1 Administration/Régie (Vite) | **https://cms-admin-production-fd71.up.railway.app** |

`api` référence la base via `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (réseau privé Railway, jamais exposé publiquement) — c'est le canal utilisé pour les migrations (`prisma db push`) et le seed, exécutés automatiquement à chaque démarrage du service (`npm start`). Postgres a aussi un volume persistant **500 Mo** (`postgres-volume`, monté sur `/var/lib/postgresql/data` — voir incident du 18/08 ci-dessous) et un proxy TCP public (`DATABASE_PUBLIC_URL`, utile pour un accès externe ponctuel, ex. un client SQL de bureau ou un script local — pas utilisé par les apps).

⚠️ **`railway run` n'atteint pas le réseau privé Railway depuis un poste local** (`postgres.railway.internal` n'est résolvable que depuis l'intérieur de Railway). Pour un accès ponctuel à la base depuis un poste local (script, Prisma Studio), utiliser `DATABASE_PUBLIC_URL` en override de `DATABASE_URL` — cf. Commandes utiles.

## Déploiement — comment ça marche

Chaque service est déployé par upload direct du dossier local via le CLI Railway (`railway up`), pas encore de dépôt Git/CI :

```bash
cd api            # ou web, cms-redaction, cms-admin
railway link -p 3964e6e4-2e93-4893-805e-09703241b8b0 -e production -s <nom-du-service>
railway up --service <nom-du-service> --detach
```

**Chaque dossier a son propre `.railwayignore`** (`node_modules/`, `.next/` ou `dist/`, `.env`) — indispensable : sans dépôt Git, `railway up` ne peut pas déduire quoi exclure d'un `.gitignore`, et essayer d'uploader `node_modules/` (~250 Mo) provoque des erreurs de connexion. C'est l'erreur rencontrée et corrigée lors du déploiement de `web/`.

`NEXT_PUBLIC_API_URL` (web) et `VITE_API_URL` (cms-redaction, cms-admin) sont des variables **injectées au moment du build** (Next.js et Vite les figent dans le bundle) — elles sont définies sur chaque service Railway *avant* le premier `railway up`.

## Sécurité

- **CORS restreint** — `CORS_ORIGINS` sur `api` liste désormais explicitement les 3 domaines de production + les ports de dev locaux (3000/3002/3003/3004) + les ports Metro/Expo web (8081/19006) pour l'aperçu web de `mobile/`. Vérifié : une origine inconnue ne reçoit pas l'en-tête `Access-Control-Allow-Origin`.
- ~~Mot de passe unique de démo (`NotreVoie2026!`) partagé par les 7 comptes staff~~ **régénéré le 18/08** — chaque compte a désormais un mot de passe individuel aléatoire (généré et affiché une seule fois par `api/prisma/rotate-passwords.js`, jamais committé). Le seed (`api/prisma/seed.js`) ne crée plus jamais de mot de passe partagé, y compris sur un environnement neuf.
- **`JWT_SECRET`** régénéré à la même occasion (invalide tous les jetons émis avant la rotation), stocké uniquement dans les variables Railway du service `api`.
- **Mot de passe Postgres (`POSTGRES_PASSWORD`)** — **volontairement pas encore tourné.** Sur l'image `postgres:16` brute, ce mot de passe n'est appliqué par le conteneur qu'à la toute première initialisation d'un volume vide ; le changer maintenant (volume déjà initialisé avec des données) désynchroniserait la variable d'environnement du mot de passe réel du rôle en base et casserait la connexion. Une vraie rotation demande un `ALTER ROLE ... WITH PASSWORD` exécuté en SQL sur l'instance vivante, suivi d'une mise à jour synchronisée des variables — à faire posément, pas en même temps qu'une réparation d'incident.
- La base ne contient que des **données de démonstration** (rubriques, comptes nommés d'après l'organigramme réel, 5 articles d'exemple, relevés Vie chère fictifs).

## Incident du 18/08 — perte de données Postgres (résolu)

Le service `Postgres` (image `postgres:16` brute, pas le plugin managé Railway) avait été provisionné **sans volume attaché**. Chaque redémarrage de conteneur repartait donc d'un disque vide — silencieusement, sans erreur de provisioning visible. Conséquence : toutes les tables (staff, articles, rubriques...) ont disparu entre le 17/08 21h10 et le 18/08 07h14, l'API renvoyait 500 sur toutes les routes touchant la base.

**Correction** : volume `postgres-volume` (500 Mo) créé et attaché sur `/var/lib/postgresql/data`, puis `api` redéployé pour repousser le schéma Prisma et réamorcer les données. Impact réel nul — uniquement des données de démonstration, aucun utilisateur ni contenu réel n'existait au moment de l'incident.

## Commandes utiles

```bash
# Statut de tous les services
railway status

# Logs d'un service
railway logs --service api

# Accès ponctuel à la vraie base depuis un poste local (proxy TCP public,
# à ne jamais committer) — ex. Prisma Studio :
cd api
railway variables --service Postgres --kv | grep DATABASE_PUBLIC_URL
DATABASE_URL="<valeur ci-dessus>" npx prisma studio

# Lister/attacher un volume (cf. incident du 18/08)
railway volume list --json
MSYS_NO_PATHCONV=1 railway volume --service <id> add --mount-path "/chemin" --json
```
