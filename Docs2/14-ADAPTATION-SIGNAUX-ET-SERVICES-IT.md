# Adaptation signaux et services IT (développeur web / mobile)

Ce chapitre **n’existe pas tel quel** dans `docs/` : il traduit la même mécanique MGCE vers **ton** métier.

## Idée centrale

Le moteur ne change pas :

```text
Document → Event → Signal → Mapping services → Score → Lead
```

Tu changes les **dictionnaires** : mots-clés crawl, types de signaux, poids, catalogues de prestations.

## Catalogue de services (exemple à personnaliser)

| Code | Service |
| --- | --- |
| `SVC_WEB_VITRINE` | Site vitrine / corporate |
| `SVC_WEB_REDESIGN` | Refonte UX/UI + perf |
| `SVC_ECOMMERCE` | Boutique en ligne |
| `SVC_WEB_APP` | Application web / SaaS |
| `SVC_MOBILE` | App iOS/Android (React Native, Flutter…) |
| `SVC_API` | API REST/GraphQL, intégrations |
| `SVC_MAINTENANCE` | TMA, hébergement, monitoring |
| `SVC_CONSULTING` | Audit digital, cahier des charges |

## Signaux IT à définir en admin

### Procurement (fort)

| Signal | Déclencheurs | Poids suggéré | Services |
| --- | --- | --- | --- |
| `AO_PUBLIC_IT` | MP : logiciel, site, app, hébergement, MA informatique | 95 | WEB_APP, API, MAINTENANCE |
| `AO_PRIVATE_IT` | Appels d’offres privés (presse, sites) | 85 | WEB_APP, ECOMMERCE |

### RH (moyen à fort selon titre)

| Signal | Déclencheurs | Poids | Services |
| --- | --- | --- | --- |
| `HIRING_DEV` | dev, développeur, full stack, front, back | 55 | WEB_APP, MOBILE, MAINTENANCE |
| `HIRING_MOBILE` | mobile, iOS, Android, Flutter | 60 | MOBILE |
| `HIRING_DSI` | DSI, IT Manager, responsable informatique | 50 | CONSULTING, WEB_APP |
| `HIRING_DIGITAL` | chef projet digital, product owner, UX | 45 | WEB_REDESIGN, WEB_APP |
| `HIRING_DATA` | data engineer, BI | 40 | API, WEB_APP |

### Croissance / presse

| Signal | Déclencheurs | Poids | Services |
| --- | --- | --- | --- |
| `NEW_BRANCH` | Nouvelle succursale, filiale | 40 | VITRINE, ECOMMERCE localisé |
| `NEW_PRODUCT` | Lancement produit consumer/B2B | 50 | MOBILE, WEB_APP |
| `FUNDRAISE_DIGITAL` | Levée de fonds + mots digital/platform | 70 | WEB_APP, MOBILE |
| `MARKETPLACE_LAUNCH` | marketplace, plateforme B2B | 85 | WEB_APP, API, ECOMMERCE |

### Maturité digitale (enrichissement technique)

| Signal | Déclencheurs | Poids | Services |
| --- | --- | --- | --- |
| `NO_WEBSITE` | Entreprise connue sans site | 35 | VITRINE |
| `OUTDATED_STACK` | WP vieux, pas HTTPS, tech détectée obsolète | 30 | REDESIGN |
| `NO_MOBILE_FRIENDLY` | (audit lighthouse futur) | 25 | REDESIGN, MOBILE |

Combiner plusieurs signaux faibles peut créer un lead fort (même principe que doc : usine + embauche logistique).

## Règles combo (exemples)

```text
IF AO_PUBLIC_IT THEN Score +40, Lead auto si > 75

IF HIRING_DEV AND NEW_PRODUCT THEN Score +25

IF OUTDATED_STACK AND HIRING_DIGITAL THEN Score +20, suggest REDESIGN + WEB_APP

IF NO_WEBSITE AND company_size > SME_threshold THEN Score +15
```

## Mots-clés crawl — Marchés publics (FR + AR partiel)

développement, logiciel, application, site web, portail, intranet, extranet, mobile, maintenance informatique, hébergement, infogérance, cybersécurité, ERP, digitalisation, numérique, système d'information

## Mots-clés job boards

développeur, developer, full stack, front-end, back-end, React, Angular, Vue, Node, Java, mobile, Flutter, React Native, DevOps, DSI, digital, e-commerce, Shopify, WordPress (parfois client veut migrer)

## Multiplicateurs secteur (exemple)

| Secteur | Mult. | Raison |
| --- | --- | --- |
| Retail / distribution | 1.3 | e-commerce fréquent |
| Banque / assurance | 1.2 | apps sécurisées, budgets |
| Startup / tech | 1.4 | produit digital natif |
| Industrie lourde | 1.0 | projets plus longs, moins site-only |
| Tourisme / hôtellerie | 1.2 | booking, apps mobile |

## Multiplicateurs région

Configurable (Casablanca, Rabat, Tanger…) selon où tu peux te déplacer ou remote.

## Exemple lead complet (IT)

**Entreprise** : LogiMaroc SARL  
**Signaux** :

1. AO « développement portail clients » — 92 confiance — hier  
2. Offre « Développeur Laravel » — 80 — il y a 3 jours  
3. Site WordPress 5.x sans HTTPS — 95 — enrichissement  

**Score** : 84 — Very High  
**Services** : WEB_APP, API, MAINTENANCE  
**Contact** : DSI / Direction générale (pas de DSI → DG)  
**Pourquoi** : texte auto généré depuis signaux + liens  

## Différencier plusieurs « types d’opportunités »

Utilise des **tags** ou **catégories d’opportunité** sur le même moteur :

- Filtre dashboard : « Mobile only », « AO public », « PME sans site »  
- Même entreprise peut avoir score global + scores par **vertical** (mobile vs web)

## Légal & éthique

- Données **publiques** uniquement  
- Pas de scraping agressif de LinkedIn profils privés en MVP  
- RGPD / loi 09-08 MA : finalité prospection B2B légitime, opt-out respectueux  
- La plateforme **ne spam pas** ; elle prépare la prospection **humaine**

## Prochaine étape

Copie ce tableau dans ta config admin (JSON/YAML) au sprint 11–12, et aligne les scrapers sprint 5 sur les mots-clés ci-dessus.

Retour pipeline : **[03-PIPELINE-DONNEES-DE-A-A-Z.md](03-PIPELINE-DONNEES-DE-A-A-Z.md)**
