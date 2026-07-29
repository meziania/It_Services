# Contexte — Développeur et recherche de clients IT

## Le problème

En tant que développeur (freelance ou petit studio), trouver des clients qui veulent un **site vitrine**, **e-commerce**, **SaaS**, **app mobile**, **refonte**, **intégration API**, etc. ne se résume pas à « avoir une bonne portfolio » :

- Les entreprises **annoncent rarement** : « on cherche un dev pour notre app ».
- Elles laissent des **traces publiques** : recrutement digital, appels d’offres IT, lancement de filiale, site obsolète, levée de fonds, nouvelle marque, marché public « développement logiciel », etc.

**Opportunity Scanner** (nom du repo : `opportunities-scanner`) est conçu pour **surveiller le web marocain**, détecter ces traces, les rattacher à une **entreprise**, calculer un **score d’opportunité**, et produire des **leads actionnables** — avant que tout le monde ne voie la même info sur LinkedIn.

## Ce que ce projet n’est pas

| Outil | Rôle |
| --- | --- |
| CRM (HubSpot, etc.) | Gère les relations **après** que tu as un contact |
| Annuaire (Kompass, Google Maps) | Liste des entreprises **sans** « pourquoi les contacter **now** » |
| Simple scraper | Télécharge des pages **sans** intelligence (signaux, score, leads) |

## Ce que c’est

Une **plateforme d’intelligence commerciale B2B** :

```text
Internet (sources publiques)
  → Collecte & documents bruts
  → Extraction & normalisation
  → Résolution d’entités (une seule fiche entreprise)
  → Détection d’événements & signaux métier
  → Enrichissement continu de la fiche entreprise
  → Score d’opportunité (0–100) + explication
  → Génération de leads qualifiés
  → Dashboard / API
  → (optionnel) export vers ton CRM
```

## CRM classique vs Lead Intelligence

**CRM :**

```text
Prospect → Appel → RDV → Client
```

**Cette plateforme :**

```text
Internet → Données → Signaux → Besoins probables → Classement → Leads → CRM / toi
```

Tu **alimentes** ton pipeline ; tu ne remplaces pas la vente humaine.

## Adaptation à ton métier (IT)

La documentation source (`docs/`) parle souvent de produits industriels (entrepôt, structure métallique, etc.) et de **MGCE**. **La mécanique reste identique** ; seuls changent :

1. **Les signaux** que tu considères importants (ex. recrutement « développeur », AO « site web », « digitalisation »).
2. **Le mapping produit** : au lieu de « rack palette », tu proposes « site e-commerce », « app React Native », « refonte WordPress », « API + dashboard ».
3. **Les multiplicateurs** (secteur, région) : startups Casablanca vs PME agro à Agadir, etc.

Voir **[14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md](14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md)** pour des exemples concrets.

## Types d’« opportunités » que le système peut couvrir

Le scanner ne se limite pas à un seul type. Chaque **source + règle de signal** peut cibler :

- **Sites web** : entreprise sans site, site non responsive, technos obsolètes détectées, nouvelle marque sans présence web.
- **Apps mobile** : recrutement mobile, annonce produit consumer, concurrence qui lance une app.
- **Apps / plateformes web** : SaaS, portail client, intranet, marketplace.
- **Projets publics IT** : marchés publics (développement, maintenance, hébergement, cybersécurité).
- **Digitalisation générale** : transformation digitale, ERP, e-commerce, fintech, etc.

Tu configures **plusieurs profils de scoring** ou **tags d’opportunité** (Warehouse Opportunity → `WEB_REDESIGN`, `MOBILE_APP`, `PUBLIC_TENDER_IT`, etc.).

## Résultat attendu pour toi

Quand la plateforme tourne, tu ouvres le dashboard et tu vois par exemple :

- **Société X** — Score 87/100  
- **Pourquoi** : appel d’offres « plateforme web », + recrutement « Chef de projet digital », + article « ouverture nouvelle succursale »  
- **Services suggérés** : application web sur mesure, site multi-langues  
- **Contact suggéré** : Direction IT / DSI / Marketing digital  
- **Sources** : liens vers AO PDF, offre d’emploi, article presse  

Tu décides d’appeler, envoyer une proposition, ou ignorer — avec **contexte**, pas une liste froide.

## Prochaine lecture

- Flux complet : **[03-PIPELINE-DONNEES-DE-A-A-Z.md](03-PIPELINE-DONNEES-DE-A-A-Z.md)**  
- Principes métier : **[01-VISION-ET-PRINCIPES.md](01-VISION-ET-PRINCIPES.md)**  
- Plan de build : **[12-ROADMAP-SPRINTS.md](12-ROADMAP-SPRINTS.md)**
