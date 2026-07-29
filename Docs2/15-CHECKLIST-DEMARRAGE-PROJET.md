# Checklist avant de commencer à coder

Utilise cette liste pour t’aligner sur **`docs/`** et **`Docs2/`** avant d’implémenter ton fork.

## Compréhension produit

- [ ] Je sais expliquer la différence CRM vs Lead Intelligence (**[00](00-CONTEXTE-DEVELOPPEUR-IT.md)**, **[01](01-VISION-ET-PRINCIPES.md)**)
- [ ] Je connais le pipeline A→Z (**[03](03-PIPELINE-DONNEES-DE-A-A-Z.md)**)
- [ ] J’ai défini **mes** services (web, mobile, web app) et signaux IT (**[14](14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md)**)

## Périmètre MVP

- [ ] 2–4 sources choisies : ex. ReKrute IT, Marchés Publics IT, 1 média RSS, crawl site entreprise
- [ ] Seuils lead et poids signaux écrits quelque part ( même un `config/opportunities-it.json` )
- [ ] Je accepte de livrer dashboard simple avant admin complet (**[12](12-ROADMAP-SPRINTS.md)** raccourci solo)

## Technique

- [ ] Stack validée : NestJS + Next.js + Prisma + Postgres + RabbitMQ + Redis + Docker (**[02](02-ARCHITECTURE-ET-COMPOSANTS.md)**)
- [ ] Structure monorepo décidée (**[13](13-STANDARDS-DEVELOPPEMENT.md)**)
- [ ] Règle : scrapers → raw_documents only (**[11](11-MODELE-DONNEES.md)**)

## Données & qualité

- [ ] Stratégie dedup ICE / site / nom (**[04](04-SOURCES-DE-DONNEES-MAROC.md)**)
- [ ] Politique rétention documents bruts + reprocess
- [ ] Chaque lead affiche **pourquoi** + sources (**[09](09-GESTION-LEADS.md)**)

## Ops

- [ ] Retries + dead-letter pour workers (**[05](05-FRAMEWORK-SCRAPERS.md)**)
- [ ] Logs structurés
- [ ] `.env.example` sans secrets

## Légal

- [ ] Sources publiques only ; pas d’automated spam
- [ ] Respect robots.txt / rate limits sur sources officielles

## Mapping doc originale → Docs2

| `docs/` | `Docs2/` |
| --- | --- |
| overview.md | 01-VISION-ET-PRINCIPES.md |
| architecture.md | 02-ARCHITECTURE-ET-COMPOSANTS.md |
| — | 03-PIPELINE-DONNEES-DE-A-A-Z.md |
| data-sources.md | 04-SOURCES-DE-DONNEES-MAROC.md |
| scraper-framework.md | 05-FRAMEWORK-SCRAPERS.md |
| business-signal-engine.md | 06 + 14 |
| company-enrichment-engine.md | 07 |
| opportunity-scoring-engine.md | 08 + 14 |
| lead-management.md | 09 |
| dashboard-administration.md | 10 |
| database-design.md | 11 |
| development-roadmap.md | 12 |
| development-standards.md | 13 |

## État actuel du repo

À la date de création de Docs2, le dépôt contient surtout **la documentation** (`docs/`), pas encore le code apps/workers. Ton implémentation suivra la roadmap à partir de zéro (ou d’un autre repo).

## Premier commit code suggéré (quand tu seras prêt)

Sprint 1 uniquement : Docker Compose + API health + DB migrate + page web « hello » — rien de crawler tant que raw_documents schema n’existe pas.

---

**Index général** : **[README.md](README.md)**
