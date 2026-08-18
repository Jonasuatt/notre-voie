# Notre Voie — CMS 2 Rédaction

Interface de production éditoriale : saisie par format, checklist de vérification, mises à jour Live, fact-check Vérité ou Intox, workflow de validation par rôle, statistiques de lecture. Consomme [`../api`](../api) — voir [le cahier des charges](../docs/cahier-des-charges.md) §2.2.

## Démarrage

```bash
npm install
npm run dev   # http://localhost:3002
```

**Comptes de démonstration** (identiques à `api/prisma/seed.js`) — mot de passe individuel par compte, généré aléatoirement et transmis une seule fois, jamais commité. Rotation : `api/prisma/rotate-passwords.js`.

| Email | Rôle | Peut... |
|---|---|---|
| redacteur@notrevoienews.com | REDACTEUR | Créer, modifier ses brouillons, soumettre |
| chef-politique@notrevoienews.com | CHEF_SERVICE | + Valider |
| redacteur-en-chef@notrevoienews.com | REDACTEUR_EN_CHEF | + Publier / Dépublier |
| secretaire-general@notrevoienews.com | SECRETAIRE_GENERAL | + Publier / Dépublier |
| admin@notrevoienews.com | ADMIN | Tout |
| regie@notrevoienews.com | REGIE | Lecture — la régie utilise le CMS 1 (phase 2), pas cet outil |

## Mode démonstration sans base de données

Comme pour `web/`, tant que l'API réelle n'est pas joignable (pas de Postgres dans cet environnement de développement), chaque appel bascule automatiquement sur `src/services/mockBackend.js` — un backend simulé en mémoire qui respecte **exactement** le même contrat que l'API réelle (mêmes règles de rôle, mêmes transitions de statut, même blocage de la checklist avant validation). Ça permet de dérouler et démontrer tout le workflow éditorial de bout en bout sans base de données. Voir `docs/DECISIONS.md` (#12).

⚠️ Ce mode est **en mémoire et non persistant** : un rechargement complet de la page réinitialise les données de démo. Dès qu'une vraie API/base répond, le CMS bascule dessus automatiquement — aucun code à changer.

## Workflow éditorial

```
BROUILLON --[soumettre, auteur]--> EN_RELECTURE --[valider, chef de service+]--> VALIDE --[publier, rédacteur en chef+]--> PUBLIE
                                                                                              PUBLIE --[dépublier]--> DEPUBLIE
```

La validation est bloquée côté API (et anticipée côté interface) tant que la checklist n'est pas complète, pour les formats `FLASH` et `VERITE_OU_INTOX`.

## Pages

| Route | Contenu |
|---|---|
| `/` | Tableau de bord — compteurs par statut, articles en attente de validation, activité récente |
| `/articles` | Liste filtrable (statut, format, rubrique) |
| `/articles/nouveau`, `/articles/:id` | Éditeur — champs par format, aperçu instantané web/mobile, checklist, fil Live, fact-check, actions de workflow |
| `/prix-vie-chere` | Alimente le ticker Vie chère du site public |
| `/editions` | Kiosque numérique — mise en ligne des PDF de l'édition papier |
