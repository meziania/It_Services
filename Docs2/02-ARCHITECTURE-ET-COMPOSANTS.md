# Architecture et composants

> Source : `docs/architecture.md`

## Architecture haut niveau

Modulaire, **orientée événements**. Travail lourd en **workers asynchrones** pour scaler horizontalement.

```text
Internet
  → Sources officielles / sites / news
  → Discovery Engine
  → Scraper Framework
  → Raw Document Store
  → Content Extraction
  → Normalisation
  → Entity Resolution
  → Companies / Contacts / Events
  → Business Signal Engine
  → Opportunity Engine
  → Lead Intelligence
  → Dashboard / API
```

## Stack recommandée

| Couche | Techno | Rôle |
| --- | --- | --- |
| Frontend | Next.js, React, TailwindCSS, TanStack | UI, recherche, dashboard, admin |
| API | NestJS, Prisma, PostgreSQL | Auth, CRUD, orchestration workers |
| Workers | Node (ou autre) + RabbitMQ | Crawl, OCR, IA, scoring, dédup |
| Cache / files | Redis, RabbitMQ | Cache, queues |
| Vérité | PostgreSQL | Toutes les données métier |

**Règle** : l’API ne lance **pas** de tâches longues ; elle enqueue.

## Modules applicatifs

```text
Authentication, Users, Companies, Contacts, Sources, Scrapers,
Crawler Jobs, Documents, Events, Signals, Scores, Leads,
Dashboard, Administration, Monitoring
```

Chaque module reste **indépendant** (feature-first).

## Structure de repo recommandée

```text
apps/
  api/
  web/
workers/
  crawler/
  extractor/
  enrichment/
  scoring/
  ai/
packages/
  shared/
  database/
  types/
  utils/
docker/
docs/   (ou Docs2 pour ta doc perso)
scripts/
```

## Backend en couches

```text
Controllers → Services → Repositories → Database
```

- **Controllers** : validation requête, appel service, réponse HTTP  
- **Services** : logique métier uniquement  
- **Repositories** : accès DB uniquement  
- Pas de logique métier dans les controllers  

## Workers

Opérations coûteuses :

- Crawl, PDF, OCR, parse HTML  
- Extraction IA  
- Validation email  
- Scoring opportunité  
- Détection doublons  

Workers = consommateurs de queues, **pas d’API publique**.

## Scaling

Ajouter des instances worker (crawl, extract, score) **sans changer** le code API.

## Config

**100 % variables d’environnement** : URLs, secrets, timeouts, noms de queues, DB.

## Principes de design

Modulaire, scalable, observable, recoverable, extensible, event-driven, fault-tolerant, AI-ready, cloud-ready, **Docker first**.

## Pour ton fork « dev IT »

Tu peux :

- Garder la même architecture  
- Ajouter un worker `signals-it` ou des règles dans l’admin  
- Multiplier les types de sources (ReKrute mots-clés « développeur », AO IT)  
- Même monorepo, mêmes queues — seule la **config signaux / produits** change

Voir **[02-ARCHITECTURE-ET-COMPOSANTS.md]** — fichier courant ; suite logique : **[05-FRAMEWORK-SCRAPERS.md](05-FRAMEWORK-SCRAPERS.md)**.
