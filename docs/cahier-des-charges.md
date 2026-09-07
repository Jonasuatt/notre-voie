# Notre Voie — Plateforme digitale
## Cahier des charges — version 1.0

**7 septembre 2026.** Cette version remplace le cadrage initial (v0.1, août 2026), rédigé avant tout développement et conservé sous [`cahier-des-charges-v0-cadrage.md`](cahier-des-charges-v0-cadrage.md).

> **Comment lire ce document.** Il décrit trois choses, toujours distinguées :
> - ✅ ce qui est **construit et en ligne** ;
> - ⚠ ce qui **appartient à la direction** — un arbitrage, pas un développement ;
> - 💡 ce qui est **proposé mais n'existe pas** (partie III), pour ouvrir la discussion.
>
> La direction ne disposant pas de cahier des charges, la plateforme existante sert de base concrète : il est plus simple d'amender ce qui fonctionne que d'écrire dans le vide. Rien de ce qui est marqué 💡 n'a été commencé.

---

# Partie I — Contexte et fondations

## 1. Le journal

**Notre Voie** est le quotidien du Groupe **La Refondation S.A.** (capital 10 000 000 FCFA, RC CI-ABJ-1998-B-225931) : 5 000 exemplaires par jour, 8 pages, 300 FCFA. Rubriques historiques : Politique, Économie, Société, Culture, Régions, Sport. Siège à Rivéra Palmeraie, Abidjan. Site historique : notrevoienews.com.

**Organigramme rédactionnel** — fondement des rôles dans les CMS :

| Fonction | Titulaire |
|---|---|
| Président du Conseil d'Administration | Barthélémy Gnépa |
| Directeur Général | Guillaume Liby |
| Directeur de la publication | Félix Teha Dessrait |
| Rédacteur en chef | Charles Bédé |
| Secrétaire général de la rédaction | Coulibaly Zié Oumar |
| Chefs de service | Politique & Régions (Benjamin Koré) · Économie & Société (Coulibaly Zié Oumar) · Culture (Edmond Gomon) · Commercial & Marketing (Claude Akho) |

## 2. Le marché et ses contraintes

12,8 millions d'internautes ivoiriens (39,6 % de pénétration — plus de 60 % de la population reste hors ligne), 137 % de pénétration mobile, 7,55 millions d'utilisateurs de réseaux sociaux. Entre 52 et 59 % de l'attention est captée par les créateurs et influenceurs, au détriment des médias traditionnels. Trois opérateurs de mobile money sont déjà largement adoptés.

Deux constats ont guidé chaque décision technique :

- **La connexion est chère et irrégulière.** D'où la lecture hors connexion sur mobile, et le soin porté au poids des pages.
- **Le paiement passe par le mobile money**, pas par la carte bancaire.

**Vision retenue** : faire de Notre Voie « la première plateforme d'information nouvelle génération de Côte d'Ivoire — aussi rapide que les réseaux sociaux, aussi fiable qu'un journal », en s'appuyant sur la crédibilité éditoriale acquise.

---

# Partie II — Ce qui existe aujourd'hui

## 3. Architecture d'ensemble

Cinq briques partageant une **base de données unique** :

| Brique | Destinataire | État |
|---|---|---|
| API | Socle commun | ✅ En production |
| Site public | Lecteurs (web) | ✅ En production |
| CMS Rédaction | Journalistes | ✅ En production |
| CMS Administration & Régie | Direction, régie | ✅ En production |
| Application mobile | Lecteurs (Android) | ✅ Installable — pas publiée sur les stores |

## 4. Le site public — deux éditions

Le site s'ouvre sur un **portail** offrant deux portes, correspondant à deux rédactions distinctes.

**Le Quotidien** — l'édition fidèle au journal papier. L'accueil est bâti sur l'édition du jour : la Une en grand, puis les pages intérieures, chacune renvoyant vers les rubriques qu'elle traite.

**Info en direct** — l'édition animée par la rédaction web : fil continu, formats courts, direct, vérification des rumeurs. Identité visuelle distincte, dérivée des couleurs du logo, pour que le lecteur sache d'un coup d'œil où il se trouve.

Un **mega-menu** organise la navigation en cinq piliers, chacun déroulant ses rubriques, ses sous-rubriques et ses derniers articles réels.

### 4.1 Taxonomie

**49 rubriques** : 42 éditoriales (dont 26 sous-rubriques) et 7 de service.

- **Éditoriales** : Politique, Refondation, Économie, Vie chère, Société, Régions, Diaspora, Culture, Sport, Vérité ou Intox, Éducation, Santé, Environnement, Numérique, Opinions & Tribunes, Histoire de Côte d'Ivoire — et leurs sous-rubriques.
- **De service** : Photos légendées, Vidéos, Live TV, Audio/Podcasts, Archives/Kiosque, Nécrologie, Direct & Flashs.

**Live TV** est né d'une demande explicite : les productions filmées en direct et leur archivage méritaient une entrée propre, distincte de *Médias & Multimédia*, réservé aux reportages ordinaires et aux enquêtes.

### 4.2 Formats d'article

Sept formats, chacun avec son badge et son traitement : **Flash** (info courte, notification push), **Édition** (article de référence), **Décryptage** (analyse), **Live** (couverture en continu), **Vidéo courte**, **Audio** (journal parlé), **Vérité ou Intox** (fact-check avec verdict et preuves).

## 5. Le kiosque et le fonds d'archives

**245 numéros** en ligne, du n°7730 (27 août 2025) au n°7984 (4-6 septembre 2026) : **1 960 pages** et **4 119 articles** extraits du texte des PDF.

Deux points que la direction doit connaître :

- **Les dates viennent de l'ours imprimé sur chaque Une**, jamais déduites du numéro. Cette relecture a révélé deux erreurs : un numéro à cheval sur le nouvel an daté d'un an de trop, et dix numéros décalés d'un jour lors d'une saisie manuelle antérieure. Les deux sont corrigés.
- **L'extraction du texte n'est pas parfaite.** Le journal compose une partie de ses corps en petite capitale : la casse d'origine est perdue, et les noms propres au milieu d'une phrase ne sont pas récupérables — les deviner reviendrait à inventer. La majuscule de début de phrase, elle, est restaurée. Il subsiste des scories : un fragment de légende photo dans un corps, un intertitre mal rattaché. Sur 4 119 articles tirés d'une maquette de presse, c'est le prix d'un fonds disponible immédiatement plutôt que ressaisi à la main. Chaque article reste corrigeable depuis le CMS.

Les pages sont rendues à la volée depuis les PDF, sans stocker d'image supplémentaire.

## 6. Modèle économique

### 6.1 Paywall souple — ✅ en service

Le lecteur n'est jamais arrêté par un mur sec. Il lit les **700 premiers signes**, coupés à la fin d'un paragraphe et fondus en bas de bloc, puis trois issues lui sont offertes : s'abonner, payer ce seul article, ou saisir le code reçu par mail.

La découpe est faite par l'API. Si elle était laissée au navigateur, le texte complet transiterait quand même et le blocage serait contournable.

**Règle actuelle** : les dix derniers numéros restent en lecture libre, le fonds plus ancien est payant. ⚠ *Arbitrage direction.*

### 6.2 Code de lecture — ✅ en service

L'abonné reçoit un code par mail. Ce code ouvre tous les articles payants jusqu'à son échéance, **sans compte à créer** — ce qui lève l'obstacle principal à l'abonnement dans le contexte local. Il est vérifié par l'API, conservé dans un cookie inaccessible aux scripts de la page, et présenté par le serveur à chaque lecture. La régie crée, prolonge et révoque les codes, et suit leur usage.

### 6.3 Paiement — ⚠ structuré, non branché

**C'est la principale réserve de ce document.** Le modèle de données, les transactions et le point d'entrée du webhook existent ; **aucun opérateur n'est raccordé**. Une transaction est créée en attente et rien ne la confirme. Concrètement : **un lecteur ne peut pas encore payer**.

Raccorder Orange Money — le plus mature des trois — demande un contrat marchand, des clés d'API et la vérification de signature du webhook. **C'est une démarche commerciale et contractuelle avant d'être un développement.** Tant qu'elle n'est pas engagée, seuls les codes de lecture ouvrent l'accès payant.

### 6.4 Régie publicitaire — ✅ structurée

Annonceurs, campagnes ciblées par rubrique, région et format, statistiques de diffusion et facturation sont modélisés et pilotables depuis le CMS Administration.

**La grille tarifaire officielle est en base** : les 28 calibres du tarif papier (C10 à C68) avec leurs dimensions et leurs prix hors taxes, les emplacements de première de couverture, les tarifs publi-reportage et l'encartage. Majorations et remises — quadrichromie +50 %, couleur +30 %, frais techniques +20 %, emplacement de rigueur +30 %, remise culture et sport −50 % — sont modélisées : la régie ajuste un taux sans intervention technique.

Un **simulateur de devis** calcule le montant depuis le CMS : calibre, nombre de parutions, publi-reportage, options. Le calcul est fait par l'API, jamais par le navigateur — c'est un prix annoncé à un annonceur.

Trois formats de diffusion sponsorisée sont prévus dans le modèle : **article sponsorisé**, **publi-reportage** et **rubrique sponsorisée**.

⚠ **Règle déontologique à tenir** : tout contenu payé par un annonceur doit être identifié comme tel pour le lecteur, visiblement et sans ambiguïté. L'affichage de cette mention sur le site et l'application reste à faire. C'est ce qui sépare un journal d'un support publicitaire, et un manquement se paierait en crédibilité — le capital que la plateforme est censée valoriser.

### 6.5 Prix

| Élément | Valeur actuelle | Statut |
|---|---|---|
| Numéro papier | 300 FCFA | Référence |
| Article à l'unité | 100 FCFA | ⚠ À valider |
| Abonnement mensuel / annuel | Non fixé | ⚠ À définir |

⚠ **Incohérence à trancher** : le paywall annonce 100 FCFA tandis que le service de paiement retient 200 FCFA par défaut. Les deux sont des hypothèses ; la régie fixe la bonne, et elle deviendra unique.

## 7. Application mobile

Android, installable. Elle reprend l'organisation du site : portail d'entrée, puis deux éditions ayant chacune sa barre d'onglets et sa couleur.

- **Le Quotidien** : Accueil (la Une et les pages du jour), Rubriques, Kiosque, Hors connexion, Profil
- **Info en direct** : Direct, Rubriques, Vérité ou Intox, Profil

**Le kiosque mobile** ouvre chaque Une en plein écran, agrandissable au pincement pour lire les titres. Quinze secondes plus tard, l'accès au numéro complet est proposé — c'est l'étalage du kiosque transposé : on regarde la devanture, puis on achète.

**Le lecteur intégré** affiche les huit pages, feuilletables et zoomables, sans dépendre d'une application PDF tierce que le téléphone n'a pas toujours.

**La lecture hors connexion** conserve les pages d'un numéro débloqué : charger le journal quand le réseau est bon, le lire plus tard sans rien consommer.

⚠ **Publication sur les stores** : l'app est distribuée en interne. Le Play Store demande une fiche, des visuels, une politique de confidentialité et des frais d'inscription ; l'App Store suppose en outre un développement iOS non engagé.

## 8. Les deux CMS

**Rédaction** — modèles par format, médiathèque, checklist de vérification avant publication, workflow rédacteur → chef de service → rédacteur en chef, statistiques de lecture, gestion des éditions et du kiosque.

**Administration & Régie** — comptes et rôles, régie publicitaire, abonnements et transactions, codes de lecture, notifications push, vue consolidée des revenus.

Chacun dispose d'un **guide d'utilisation intégré** et de **bulles d'aide** sur les écrans.

---

# Partie III — 💡 Propositions d'évolution

> **Aucun des modules de cette partie n'existe.** Ils sont décrits pour nourrir la réflexion de la direction : chacun indique ce qu'il apporte, ce qu'il suppose, et sa difficulté relative. Le but est que la discussion parte de propositions concrètes plutôt que d'une page blanche — et que la direction puisse en écarter, en amender, ou en ajouter.

### Légende de l'effort
**Léger** : quelques jours · **Moyen** : quelques semaines · **Lourd** : un chantier à part entière, souvent avec une dépendance externe.

## 9. Revenus complémentaires

### 9.1 💡 Avis de décès et faire-part payants — *effort léger, revenu immédiat*
La rubrique Nécrologie existe déjà comme espace éditorial. En faire un **service payant en libre-service** — une famille dépose un avis, choisit un format, paie, l'avis paraît après validation — s'appuie sur un usage social profondément ancré et sur une source de revenus que la presse ouest-africaine exploite de longue date en version papier. C'est probablement le module au meilleur rapport revenu/effort de cette liste.
**Suppose** : le paiement raccordé, une grille tarifaire, un circuit de validation rédactionnelle.

### 9.2 💡 Petites annonces — *effort moyen*
Emploi, immobilier, véhicules, services. Même logique de dépôt en libre-service avec validation. Génère du trafic récurrent et fidélise une audience différente de l'audience d'information.
**Suppose** : le paiement raccordé, une modération, une politique de contenu.

### 9.3 💡 Abonnement institutionnel — *effort moyen*
Un compte unique pour une administration, une entreprise ou une école, ouvrant l'accès à N lecteurs. Les institutions paient volontiers un abonnement groupé là où les particuliers hésitent, et le recouvrement est plus simple : une facture au lieu de mille micro-paiements.
**Suppose** : la gestion multi-comptes, la facturation.

### 9.4 💡 Offres accessibles aux petits annonceurs — *effort léger, marché nouveau*

Le plus petit calibre du tarif papier est à 20 000 FCFA. Un coiffeur, un mécanicien, une couturière, un vendeur de pièces détachées ne peuvent pas y entrer — alors qu'ils sont des milliers et qu'aucun quotidien ne les sert.

Trois formules à étudier :

- **L'annonce à la ligne**, de 1 000 à 5 000 FCFA, dans une page dédiée. Le prix d'un plat de maquis, pas d'une campagne.
- **La formule artisan**, un petit encart numérique récurrent à prix mensuel fixe — de l'ordre de 15 000 FCFA — sans négociation ni devis. La simplicité vaut ici autant que le prix : un artisan n'a pas de service marketing.
- **Le tarif de première annonce**, une remise de découverte pour un annonceur qui n'a jamais acheté d'espace. Le premier achat est l'obstacle ; les suivants viennent seuls.

Le volume compense le prix unitaire, et ces annonceurs deviennent une base de revenus indépendante des grands comptes — donc moins sensible aux aléas politiques qui pèsent sur la publicité institutionnelle.

**Suppose** : le paiement raccordé, un dépôt en libre-service, une modération.

### 9.5 💡 Offre coopératives et groupements — *effort moyen, ancrage territorial*

Les coopératives structurent l'économie rurale ivoirienne — café-cacao, anacarde, hévéa, vivriers. Elles ont des moyens collectifs qu'aucun de leurs membres n'a seul, une actualité réelle (campagnes d'achat, prix garantis, assemblées générales, certifications) et un besoin de visibilité auprès des pouvoirs publics.

- **L'espace mutualisé** : la coopérative achète un emplacement, ses membres s'y partagent quelques lignes chacun.
- **Le publi-reportage coopératif**, au tarif C32 ou C41, sur une campagne ou une réalisation.
- **L'abonnement groupé** pour les responsables, qui rejoint l'abonnement institutionnel (§9.3).

L'intérêt dépasse le chiffre d'affaires : ces annonceurs amènent une matière éditoriale que le journal cherche déjà — les Régions, la Vie chère, l'agriculture — à condition de tenir la frontière entre ce qui est acheté et ce qui est écrit par la rédaction.

**Suppose** : un démarchage de terrain, une grille dédiée, et la mention de contenu sponsorisé mentionnée au §6.4.

### 9.6 💡 Espace annonceur en libre-service — *effort moyen à lourd*
Aujourd'hui la régie saisit les campagnes. Un espace où l'annonceur dépose lui-même sa création, choisit son ciblage et suit ses statistiques réduit la charge de la régie et rend le tableau de bord temps réel — déjà identifié comme argument commercial différenciant — directement démontrable.
**Suppose** : le paiement raccordé, une validation avant diffusion.

## 10. Audience et diffusion

### 10.1 💡 Diffusion WhatsApp — *effort moyen, dépendance externe*
WhatsApp est le premier canal de circulation de l'information en Côte d'Ivoire. Un canal officiel diffusant les titres du jour et les flashs y placerait le journal là où l'audience se trouve déjà, plutôt que d'espérer qu'elle vienne.
**Suppose** : un compte WhatsApp Business API — facturé à la conversation — et une discipline éditoriale sur la fréquence. **Réserve** : le coût croît avec l'audience, à modéliser avant de s'engager.

### 10.2 💡 Infolettre quotidienne — *effort léger*
Le journal en résumé chaque matin par mail : cinq titres, un lien. C'est le canal le moins cher, celui qui appartient au journal — contrairement à un réseau social — et il alimente naturellement la conversion vers l'abonnement.
**Suppose** : un service d'envoi, une gestion du consentement et du désabonnement.

### 10.3 💡 Édition en langues nationales — *effort lourd, fort différenciant*
Une sélection d'articles traduits ou résumés en baoulé, dioula, bété. Aucun quotidien ivoirien ne le fait sérieusement. Cela adresse la part de la population que le français écrit tient à l'écart, et prolongerait naturellement le savoir-faire déjà réuni sur un autre projet de la maison.
**Suppose** : des traducteurs, un choix de langues, et probablement une version audio — l'oralité étant plus naturelle que l'écrit pour ces langues. **C'est un projet éditorial autant que technique.**

### 10.4 💡 Journal parlé quotidien — *effort moyen*
Le format Audio existe déjà article par article. Un vrai **journal parlé de cinq minutes**, publié chaque matin, se prête à l'écoute en taxi, au marché, en travaillant — et se partage sur WhatsApp.
**Suppose** : un temps de studio quotidien, ou une synthèse vocale de qualité acceptable.

### 10.5 💡 Alertes personnalisées — *effort léger*
Les notifications push existent en deux fils, quotidien et flash. Laisser le lecteur choisir ses rubriques augmente la pertinence et réduit le désabonnement.

## 11. Éditorial et confiance

### 11.1 💡 Espace commentaires modéré — *effort moyen*
Il engage le lecteur et retient l'attention, mais **expose le journal** : la modération est une charge quotidienne et un risque juridique. À n'ouvrir qu'avec une règle claire et quelqu'un pour la tenir. À défaut, mieux vaut s'abstenir.

### 11.2 💡 Vérité ou Intox en libre-service — *effort léger*
Un formulaire par lequel un lecteur soumet une rumeur à vérifier. Nourrit la rubrique, crée un lien direct avec l'audience et documente ce qui circule réellement.

### 11.3 💡 Dossiers thématiques suivis — *effort léger*
Regrouper les articles d'un même sujet au long cours — une élection, un procès, une crise — en une page qui se construit dans le temps. Valorise le fonds d'archives et améliore le référencement.

## 12. Exploitation

### 12.1 💡 Statistiques d'audience certifiées — *effort moyen*
Les statistiques de lecture existent en interne. Une mesure exportable et opposable est ce que réclament les annonceurs sérieux pour justifier un budget.

### 12.2 💡 Import assisté du journal papier — *effort moyen*
Aujourd'hui l'import du PDF est un travail d'atelier. Un écran du CMS où la maquette est déposée, découpée automatiquement puis corrigée par la rédaction rendrait la publication quotidienne autonome — sans intervention technique.

### 12.3 💡 Recherche avancée dans les archives — *effort moyen*
4 119 articles sont en base. Une recherche par période, rubrique et mot-clé, avec mise en évidence, transforme ce fonds en outil de travail — pour la rédaction comme pour les abonnés, et justifie à elle seule un abonnement pour un chercheur ou une institution.

---

# Partie IV — Décisions et suites

## 13. Ce qui reste à faire sur l'existant

| Chantier | Nature | Priorité |
|---|---|---|
| Raccordement mobile money | Contractuel puis technique | **Haute** — conditionne tout revenu direct |
| Grille tarifaire | Décision commerciale | **Haute** |
| Publication Play Store | Administratif + frais | Moyenne |
| Envoi automatique des codes par mail | Technique | Moyenne |
| Application iOS | Développement | À arbitrer |
| Relecture du fonds d'archives | Éditorial, au fil de l'eau | Basse |
| Migration du domaine notrevoienews.com | Administratif | À arbitrer |

## 14. Décisions attendues de la direction

1. **Grille tarifaire** — prix de l'article à l'unité, de l'abonnement mensuel et annuel.
2. **Frontière du paywall** — quelle part du fonds reste en lecture libre.
3. **Opérateur de paiement** — lequel raccorder en premier, et qui engage la démarche marchande.
4. **Publication sur les stores** — Android seul, ou Android et iOS.
5. **Domaine** — conserver notrevoienews.com, et sous quelle forme.
6. **Politique d'archives** — le fonds extrait doit-il être relu avant d'être pleinement exposé.
7. **Priorités parmi les propositions** de la partie III — lesquelles retenir, dans quel ordre.

## 15. Documents liés

- [`fiche-technique.md`](fiche-technique.md) — architecture, technologies, hébergement, sécurité, exploitation
- [`infrastructure.md`](infrastructure.md) — hébergement Railway, déploiement, incidents
- [`DECISIONS.md`](DECISIONS.md) — journal des choix techniques et de leurs raisons
- [`cahier-des-charges-v0-cadrage.md`](cahier-des-charges-v0-cadrage.md) — cadrage initial, conservé pour mémoire
