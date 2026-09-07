# Notre Voie — Plateforme digitale
## Cahier des charges (Phase 0 — Cadrage)

Version 0.1 — document de travail, à valider avant tout développement.

Sources utilisées pour ce cadrage : `notre-voie-rubriques-formats-modules.docx`, `notre-voie-maquette-produit.html`, `notre-voie-pitch-investisseur.pptx`, 10 numéros PDF du journal papier (n°7961 à 7970, août 2026), logo officiel — tous fournis dans `Notre Voie Document/`.

---

## 1. Contexte

**Notre Voie** est le quotidien du Groupe **La Refondation S.A.** (capital 10 000 000 FCFA, RC CI-ABJ-1998-B-225931), 5000 exemplaires/jour, 8 pages, 300 FCFA. Rubriques historiques : Politique, Économie, Société, Culture, Régions, Sport. Siège : Rivéra Palmeraie, Abidjan. Site actuel : notrevoienews.com.

**Organigramme rédactionnel actuel** (utile pour les rôles CMS) :
- Président du Conseil d'Administration : Barthélémy Gnépa
- Directeur Général : Guillaume Liby
- Directeur de la publication : Félix Teha Dessrait
- Rédacteur en chef : Charles Bédé
- Secrétaire général de la rédaction : Coulibaly Zié Oumar
- Chefs de service : Politique & Régions (Benjamin Koré) · Économie & Société (Coulibaly Zié Oumar) · Culture (Edmond Gomon) · Commercial & Marketing (Claude Akho)

**Constat marché** (pitch investisseur) : 7,55 M d'utilisateurs réseaux sociaux en Côte d'Ivoire, 52-59 % de l'attention captée par créateurs/influenceurs face aux médias traditionnels. 12,8 M d'internautes (39,6 % de pénétration, encore >60 % hors ligne), 137 % de pénétration mobile, 3 opérateurs mobile money déjà largement adoptés (Orange, MTN, Moov).

**Vision** : faire de Notre Voie « la première plateforme d'information nouvelle génération de Côte d'Ivoire — aussi rapide que les réseaux sociaux, aussi fiable qu'un journal », en s'appuyant sur la crédibilité éditoriale existante.

---

## 2. Périmètre fonctionnel — 3 briques

Les trois briques partagent la **même donnée éditoriale et publicitaire** (une seule base, un seul pilotage).

### 2.1 CMS 1 — Administration (« La Refondation »)
Web, usage interne (direction + régie).
- Gestion des comptes/rôles rédaction et commercial
- Régie publicitaire : création de campagnes, ciblage par rubrique/région/format, formats natifs façon carte d'article
- Tableau de bord annonceur (statistiques de diffusion en temps réel, argument commercial différenciant)
- Facturation des campagnes
- Vue consolidée abonnements + paiements à l'article + revenus pub

### 2.2 CMS 2 — Rédaction (production éditoriale)
Web + **PWA mobile** dédiée (publication depuis le terrain, quasi instantanée).
- Modèles de saisie pré-configurés par format (Flash / Édition / Décryptage / Live)
- Médiathèque multi-format (texte, photo légendée, vidéo courte, audio, PDF de l'édition papier)
- Checklist de vérification avant publication (obligatoire pour Flash et Vérité ou Intox)
- Aperçu instantané du rendu web + mobile avant mise en ligne
- Statistiques de lecture en temps réel par article, visibles par la rédaction
- Workflow de validation par rôle (rédacteur → chef de service → rédacteur en chef / secrétaire général)

### 2.3 CMS 2 — Grand public (diffusion)
Site web (SSR/SEO) + **application mobile native** (Play Store + App Store).
- Accueil : bandeau Flash façon stories, résumé du jour (« 5 choses à retenir »), ticker Vie chère, grille de rubriques, bloc Vérité ou Intox, badges de contenu
- Fiche article : lecture + écoute audio, badges de format, paywall souple
- Kiosque/Archives : éditions précédentes en PDF, articles archivés par date/rubrique
- Galerie photo légendée, flux vidéo dédié, flux audio/podcast dédié
- Abonnement + paiement à l'article (mobile money / carte)
- Notifications push (fil « quotidien » et fil « flash »)

---

## 3. Contenu éditorial

### 3.1 Rubriques (10)
Politique, **Refondation** *(nouveau)*, Économie, **Vie chère** *(nouveau, avec widget de suivi des prix)*, Société, Régions, **Diaspora** *(nouveau)*, Culture, Sport, **Vérité ou Intox** *(nouveau)*.

### 3.2 Rubriques de service (4)
Photos légendées · Vidéos · Audio/Podcasts · Archives/Kiosque numérique.

### 3.3 Formats d'article (7)
| Format | Description | Emplacement |
|---|---|---|
| Flash | Info ultra-courte, publiée en quelques minutes | Bandeau stories, notification push |
| Édition du quotidien | Article structuré, contenu de référence du jour | Une du site, fil « édition du jour » mobile |
| Décryptage | Analyse approfondie, graphiques/chronologie | Rubrique dédiée |
| Live | Couverture en direct avec mises à jour successives | Badge « DIRECT » |
| Vidéo courte | Résumé visuel < 90s, format vertical | Cartes d'articles, partage WhatsApp |
| Audio / journal parlé | Version audio de l'article ou de l'édition | Bouton « écouter » sur chaque article |
| Vérité ou Intox | Fact-check court, publié en priorité en Flash | Rubrique dédiée + reprise en Flash |

### 3.4 Modules transversaux (visibles sur la maquette fournie)
Bandeau Flash (stories) · Résumé du jour · Ticker Vie chère · Bloc Vérité ou Intox en avant sur l'accueil · Badges de contenu par carte · **Paywall souple** (abonnement ou paiement à l'unité, jamais de mur bloquant sans alternative) · Écoute audio sur chaque article · Galerie photo légendée · Kiosque/Archives PDF.

---

## 4. Modèle économique

Trois flux de revenus dès le lancement :
1. **Abonnements** — accès illimité mensuel/annuel, site + app
2. **Paiement à l'article** — micro-transaction mobile money ou carte, lecteur non abonné
3. **Régie publicitaire** — campagnes ciblées, pilotées et facturées depuis le CMS 1

---

## 5. Proposition d'architecture technique

Réutilisation de la stack éprouvée sur le projet Langues Ivoire, avec un ajustement pour les besoins SEO du site public (un journal vit du référencement — une SPA pure serait pénalisante).

| Brique | Stack proposée | Justification |
|---|---|---|
| **API** | Node.js/Express + Prisma + PostgreSQL, Redis (cache/rate-limit), Cloudinary (médias) | Identique à Langues Ivoire — capitalise sur l'expérience acquise |
| **CMS 1 (admin/régie)** | React + Vite (SPA), Tailwind | Usage interne uniquement, SEO non pertinent → SPA classique comme Langues Ivoire CMS |
| **CMS 2 (rédaction) — web** | React + Vite (SPA), Tailwind | Idem, usage interne |
| **CMS 2 (rédaction) — mobile** | PWA (même codebase React, responsive) | Évite un 2e store d'app pour un outil interne ; publication terrain instantanée |
| **Site public** | **⚠ à trancher** — Next.js (SSR/SSG) recommandé plutôt qu'une SPA Vite | Un quotidien dépend fortement du SEO et du partage social (WhatsApp/Facebook preview) ; une SPA sans rendu serveur pénaliserait fortement l'indexation et les partages |
| **App mobile grand public** | React Native / Expo (comme Langues Ivoire mobile) | Cohérence avec l'écosystème existant, build EAS déjà maîtrisé |
| **Paiement** | Intégration mobile money (Orange Money, MTN MoMo, Moov Money) + carte bancaire | Infrastructure de paiement déjà largement adoptée localement |
| **Notifications** | Push (Expo Notifications côté app, Web Push côté site) | Fil « quotidien » et fil « flash » |

**Points à trancher avec vous avant Phase 1** :
- Next.js pour le site public : à valider (impact sur la stack "identique à Langues Ivoire", mais fort impact SEO/partage)
- Hébergement cible (Railway déjà utilisé pour Langues Ivoire ?) et nom de domaine (notrevoienews.com existant — accès à transférer/administrer ?)
- Fournisseur mobile money à intégrer en premier (API Orange Money CI généralement la plus mature)
- Reprise ou non du contenu de notrevoienews.com existant (migration d'archives ?)

---

## 6. Modèle de données — entités principales (esquisse)

- **User** (rôle : admin, régie, rédacteur, chef_service, rédacteur_en_chef, secrétaire_général, abonné, lecteur)
- **Rubrique** (les 10 + service)
- **Article** (rubrique, format, statut de workflow, auteur, médias liés, paywall: libre/payant)
- **Média** (photo légendée, vidéo, audio, PDF d'édition)
- **Édition** (numéro, date, PDF complet — kiosque)
- **FactCheck** (spécialisation Article pour Vérité ou Intox : verdict, preuves)
- **PrixVieChere** (produit, prix, variation, date — alimente le ticker)
- **Abonnement** (type, durée, statut, moyen de paiement)
- **Transaction** (paiement à l'article ou abonnement, moyen : mobile money/carte)
- **CampagnePub** (annonceur, ciblage rubrique/région/format, budget, statistiques de diffusion)
- **Notification** (fil quotidien / fil flash)

---

## 7. Roadmap indicative (5 à 7 mois selon périmètre validé)

| Phase | Contenu |
|---|---|
| 0 — Cadrage | Ce document + choix techniques définitifs + maquettes (base déjà fournie) |
| 1 — CMS 2 | Rédaction + site public + abonnement |
| 2 — CMS 1 | Administration & régie publicitaire |
| 3 — Mobile | PWA rédaction + app native grand public |
| 4 — Lancement | Recette, hébergement, formation, mise en production |

---

## 8. Prochaines étapes proposées

1. Valider ou arbitrer les points ouverts de la section 5 (en particulier Next.js vs Vite pour le site public)
2. Valider le modèle de données ci-dessus (section 6) avant de générer le schéma Prisma
3. Découper la Phase 1 (CMS 2) en tickets de développement
4. Initialiser les dépôts : `api/`, `cms-redaction/`, `web/`, `mobile/` (et `cms-admin/` en phase 2)
