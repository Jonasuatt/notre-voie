# Notre Voie — Application mobile (grand public)

Application React Native / Expo pour les lecteurs : accueil (bandeau Flash, ticker Vie chère, résumé du jour), fiche article avec paywall souple, rubriques, kiosque numérique, Vérité ou Intox, compte lecteur et abonnement. Consomme [`../api`](../api) — voir [le cahier des charges](../docs/cahier-des-charges.md) §2.3.

## Démarrage

```bash
npm install
npx expo start        # QR code — à scanner avec Expo Go (iOS/Android)
npx expo start --web  # aperçu rapide dans un navigateur, pratique en développement
```

Par défaut, l'app appelle l'API en production : `https://api-production-d7919.up.railway.app/api` (via `EXPO_PUBLIC_API_URL` dans `.env`, injecté au build).

## Écrans

| Écran | Contenu |
|---|---|
| Accueil | Bandeau Flash (stories), ticker Vie chère, Une, résumé du jour, bloc Vérité ou Intox |
| Rubriques | Filtrage par rubrique (tabs horizontaux) |
| Article | Badges de format, mises à jour Live, verdict fact-check, paywall souple, paiement à l'article |
| Kiosque | Éditions PDF archivées |
| Vérité ou Intox | Flux des vérifications |
| Profil | Connexion / inscription / statut d'abonnement / déconnexion |
| Abonnement | Formules mensuel/annuel |

## Notifications push

`src/notifications/registerPush.js` demande la permission et enregistre le token Expo Push via `PATCH /api/auth/reader/me` dès qu'un lecteur est connecté (uniquement sur un vrai appareil — jamais en simulateur/web, cf. `expo-device`). L'envoi effectif des notifications (fils "quotidien"/"flash") reste à brancher côté serveur — l'API crée déjà les `Notification` en base à la publication d'un article (voir `api/src/controllers/articles.controller.js`), il manque un job qui les pousse réellement aux tokens enregistrés.

## Vérification effectuée

L'app a été testée via `expo start --web` (react-native-web) contre la vraie API en production : accueil, ticker, badges de format, et données réelles (bylines, timestamps) confirmés à l'écran. **Non testé dans cet environnement** : interactions tactiles natives (aucun simulateur iOS/Android ni Expo Go disponible en sandbox) — à vérifier sur un vrai appareil ou un simulateur avant mise en production. Voir `docs/DECISIONS.md`.

## Build

```bash
npx eas build --platform android
npx eas build --platform ios
```

⚠️ Un projet EAS (`eas.json`, identifiants Expo) n'est pas encore configuré — cf. le patch build EAS déjà en place pour Langues Ivoire, à adapter si besoin.
