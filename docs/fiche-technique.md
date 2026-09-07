# Notre Voie — Fiche technique

**7 septembre 2026.** Document de référence sur l'architecture, les technologies, l'hébergement et l'exploitation de la plateforme. Complète le [cahier des charges](cahier-des-charges.md), qui traite du périmètre fonctionnel.

---

## 1. Vue d'ensemble

Cinq applications autour d'une base de données unique. Aucune ne parle directement à la base : **tout passe par l'API**, qui centralise les règles métier, l'authentification et le paywall.

```
                        ┌──────────────────┐
                        │   PostgreSQL     │
                        └────────▲─────────┘
                                 │  (réseau privé)
                        ┌────────┴─────────┐
                        │       API        │  Node.js / Express / Prisma
                        └────────▲─────────┘
                                 │  HTTPS / JSON
        ┌──────────────┬─────────┼─────────────┬──────────────┐
   Site public   CMS Rédaction  CMS Admin   App mobile    (à venir)
    Next.js       React/Vite   React/Vite  React Native
```

**Pourquoi ce découpage.** Le paywall en est la raison principale : la découpe de l'article est faite par l'API, jamais par le client. Si elle était laissée au navigateur ou au téléphone, le texte complet transiterait quand même et le blocage serait contournable en lisant la réponse réseau.

---

## 2. Les cinq briques

| Brique | Technologie | Rôle |
|---|---|---|
| **API** | Node.js, Express 4, Prisma 5, PostgreSQL 16 | Règles métier, authentification, paywall, médias |
| **Site public** | Next.js 14 (App Router), React 18, Tailwind | Lecture web, rendu serveur |
| **CMS Rédaction** | React 18, Vite, React Router, Tailwind | Production éditoriale |
| **CMS Administration** | React 18, Vite, React Router, Tailwind | Direction, régie, abonnements |
| **Application mobile** | React Native 0.86, Expo SDK 57 | Lecture Android |

### 2.1 Pourquoi Next.js pour le site public, et Vite pour les CMS

Un quotidien vit de son référencement et du partage sur les réseaux — WhatsApp et Facebook lisent le HTML renvoyé par le serveur pour composer leur aperçu. Une application monopage classique renverrait une page vide à ces robots : les articles seraient mal indexés et les partages sans titre ni image. Next.js rend les pages côté serveur, ce qui règle les deux.

Les CMS, eux, sont des outils internes : personne ne les partage ni ne les cherche sur Google. Le rendu serveur y serait une complexité sans contrepartie — d'où Vite, plus simple et plus rapide à développer.

### 2.2 Pourquoi Expo pour le mobile

Une seule base de code pour Android et iOS, et surtout une chaîne de compilation infogérée : produire un APK ne demande pas d'installer l'environnement Android complet. La contrepartie est une dépendance à la version du SDK Expo, qui impose une montée de version périodique — celle du SDK 55 vers 57 a été faite le 6 septembre 2026.

---

## 3. Modèle de données

**19 tables**, regroupées par domaine :

| Domaine | Tables |
|---|---|
| Éditorial | `Article`, `Rubrique`, `Media`, `LiveUpdate`, `FactCheck`, `ChecklistItem` |
| Journal papier | `Edition`, `EditionPage` |
| Personnes | `Staff` (rédaction), `Reader` (lecteurs) |
| Monétisation | `Abonnement`, `Transaction`, `CodeLecture` |
| Régie | `Annonceur`, `CampagnePub`, `FactureCampagne` |
| Mesure et service | `ArticleVue`, `Notification`, `PrixVieChere` |

**Points de conception notables :**

- **`Rubrique` référence elle-même** (`parentId`) : les sous-rubriques du mega-menu sont des rubriques ordinaires rattachées à une parente, plutôt qu'un second type d'objet. Une seule table, une seule logique.
- **`Article.portails`** est une liste : un même article peut paraître sur Le Quotidien, sur Info en direct, ou les deux. C'est ce qui permet deux éditions sans dupliquer le contenu.
- **`Staff` et `Reader` sont séparés.** Un journaliste et un abonné n'ont ni les mêmes droits, ni le même cycle de vie, ni les mêmes données personnelles. Les confondre dans une table `User` unique aurait mêlé deux régimes de sécurité.
- **`CodeLecture`** porte une date d'expiration et un compteur d'usage : l'accès des abonnés ne dépend pas de la création d'un compte.

**Volumétrie au 7 septembre 2026** : 245 éditions · 1 960 pages · 4 325 articles · 49 rubriques.

---

## 4. API

**14 familles de routes** sous `/api` : `auth`, `rubriques`, `articles`, `media`, `editions`, `prix-vie-chere`, `notifications`, `abonnements`, `codes-lecture`, `paiements`, `campagnes`, `verite-ou-intox`, `staff`, `admin`.

**Authentification** — jetons JWT, deux publics distincts : `authStaff` pour les CMS, `authReader` pour les lecteurs. Mots de passe hachés avec bcrypt.

**Paywall** — trois clés ouvrent un article payant : un abonnement actif, un paiement de cet article, ou un code de lecture valide. À défaut, l'API renvoie les 700 premiers signes du corps, coupés à la fin d'un paragraphe.

**Protections** — `helmet` (en-têtes HTTP), `express-rate-limit` (limitation des tentatives de connexion), `express-validator` (validation des entrées), CORS restreint à une liste explicite d'origines.

---

## 5. Médias

**Cloudinary** héberge images, audio et PDF.

⚠ **Deux comptes coexistent aujourd'hui**, et c'est un point de dette à traiter :

| Compte | Contenu |
|---|---|
| `ataat5bs` | Fonds historique : photos d'articles, podcasts, 10 premiers numéros. **Identifiants perdus** — seul Railway les détient encore. |
| `zxjwlw7r` | Compte dédié au journal : les 245 numéros d'archives et tout nouvel envoi. |

Les médias de l'ancien compte restent accessibles tant qu'il existe. **Si ce compte venait à être fermé ou expiré, ces médias disparaîtraient.** Les remigrer vers le compte dédié demande un accès à `ataat5bs` — à récupérer, ou à défaut il faudra retélécharger et redéposer ce fonds.

**Les pages du journal sont dérivées à la volée** depuis le PDF (transformation `pg_N`) : aucune image n'est stockée en double. La contrepartie est que chaque page consultée consomme une transformation dans le quota Cloudinary — c'est le poste à surveiller si le kiosque devient très fréquenté.

**Réglage requis** : *Allow delivery of PDF and ZIP files* doit rester activé dans les paramètres de sécurité du compte, sinon couvertures et pages renvoient une erreur.

---

## 6. Hébergement

**Railway**, projet `notre-voie`, environnement `production`. Voir [`infrastructure.md`](infrastructure.md) pour le détail des services, des variables et des incidents.

| Service | URL |
|---|---|
| API | https://api-production-d7919.up.railway.app |
| Site public | https://web-production-8c1e3.up.railway.app |
| CMS Rédaction | https://cms-redaction-production.up.railway.app |
| CMS Administration | https://cms-admin-production-fd71.up.railway.app |

⚠ **L'API s'endort faute de trafic.** Sa première réponse après une période calme demande une douzaine de secondes, les suivantes moins d'une. C'est un comportement de l'offre gratuite, pas un défaut de l'application. Conséquences pratiques :

- le délai d'attente de l'application mobile est fixé à 30 secondes ;
- **il faut réveiller l'API quelques minutes avant toute démonstration** ;
- une offre payante supprimerait cette mise en veille.

**Base de données** : volume persistant de 500 Mo. Le schéma est synchronisé et les données de référence réinjectées à chaque démarrage de l'API.

⚠ **Aucune sauvegarde automatique n'est configurée à ce jour.** C'est le principal risque d'exploitation : une perte de la base ferait perdre les articles saisis depuis les CMS. Les archives, elles, sont reconstructibles depuis les PDF d'origine et les scripts d'import. **À traiter avant toute montée en charge réelle.**

---

## 7. Sécurité

**Acquis :**
- Mots de passe individuels par compte, hachés ; plus aucun mot de passe partagé.
- `JWT_SECRET` propre à la production, stocké uniquement dans les variables Railway.
- CORS restreint à une liste explicite d'origines, vérifiée.
- Le PDF complet d'un numéro n'est jamais exposé dans une réponse de liste : il faut présenter un code valide.
- Le code de lecture est conservé dans un cookie inaccessible aux scripts de la page, et transmis par le serveur à l'API.

**Réserves connues :**
- ⚠ Le mot de passe PostgreSQL n'a pas été renouvelé depuis la création. Le changer demande une opération SQL sur l'instance vivante suivie d'une mise à jour synchronisée des variables — à faire posément, pas dans l'urgence.
- ⚠ Le webhook de paiement n'a pas encore de vérification de signature : elle devra être écrite au moment du raccordement de l'opérateur, sinon n'importe qui pourrait déclarer une transaction réussie.

---

## 8. Application mobile — spécificités

**Distribution** : APK signé par EAS, distribution interne. **Le keystore est conservé par EAS** — c'est lui qui fera foi pour toute publication ultérieure sur le Play Store ; une mise à jour signée autrement serait refusée.

⚠ **Installation** : sur le téléphone de test (Samsung, Android 12), l'installation depuis l'explorateur de fichiers échoue avec un message générique, y compris depuis le stockage interne et avec un paquet valide. L'installation par câble fonctionne du premier coup :

```bash
adb install -r notre-voie.apk
```

C'est aussi la seule voie qui donne un message d'erreur exploitable en cas de problème.

**Lecture hors connexion** : les pages d'un numéro débloqué sont copiées dans l'espace privé de l'application, un dossier par numéro, avec un index local. Ce sont les **pages en images** qui sont conservées, et non le PDF : elles s'affichent dans le lecteur intégré sans dépendre d'une application tierce que le téléphone n'a pas toujours.

**Poids** : environ 78 Mo, dont près de la moitié en bibliothèques `x86` et `x86_64` qui ne servent qu'aux émulateurs. Les retirer demande un greffon de compilation spécifique — `expo-build-properties` n'expose pas ce réglage. Chantier d'optimisation identifié, non traité.

---

## 9. Chaîne de production du fonds d'archives

Deux scripts, dans `api/scripts/` :

| Script | Rôle |
|---|---|
| `parse-unes.py` | Lit l'ours imprimé sur chaque Une pour en extraire numéro et dates de parution |
| `extraire-articles.py` | Segmente chaque page en articles : titre, surtitre, chapô, signature, corps |
| `importer-unes.js` | Dépose les PDF sur Cloudinary et produit le manifeste |

**La segmentation s'appuie sur les tailles de composition** : au-delà de 18 points c'est un titre, entre 11 et 18 un chapô, en dessous le corps, sous 7,5 l'ours. Trois pièges propres à une maquette de presse sont traités explicitement :

- **deux articles côte à côte**, dont un simple tri vertical mélangeait les corps — le rattachement se fait par bande de colonnes ;
- **la lettrine** composée dans un bloc séparé, qui amputait le premier mot ;
- **l'ours et les mentions légales** en pied de page, qui polluaient le texte.

Les mots césurés sont recollés, les caractères de contrôle retirés — un octet nul avait mis l'API en boucle de redémarrage, PostgreSQL les refusant.

**Garde-fou** : l'import des archives ne peut plus interrompre le démarrage de l'API. Un enrichissement qui échoue est journalisé, jamais fatal.

---

## 10. Points de vigilance — synthèse

| Sujet | Risque | Action |
|---|---|---|
| **Sauvegardes de la base** | Perte définitive des saisies rédactionnelles | Configurer une sauvegarde régulière — **priorité haute** |
| **Compte Cloudinary historique** | Disparition des médias si le compte ferme | Récupérer l'accès à `ataat5bs`, ou remigrer |
| **Mise en veille de l'API** | Première ouverture à 12 s | Offre payante, ou réveil avant démonstration |
| **Webhook de paiement** | Transaction déclarée réussie par un tiers | Vérifier la signature au raccordement |
| **Mot de passe PostgreSQL** | Jamais renouvelé | Rotation planifiée, hors urgence |
| **Poids de l'APK** | 78 Mo, moitié inutile | Greffon de compilation à écrire |

---

## 11. Documents liés

- [`cahier-des-charges.md`](cahier-des-charges.md) — périmètre fonctionnel, modèle économique, propositions d'évolution
- [`infrastructure.md`](infrastructure.md) — hébergement, déploiement, incidents
- [`DECISIONS.md`](DECISIONS.md) — journal des choix techniques
