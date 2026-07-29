# Roadmap de développement (sprints)

> Source : `docs/development-roadmap.md`

## Philosophie

Construire **incrémentalement**. Chaque sprint = morceau **fonctionnel** du pipeline :

```text
Collect → Store → Normalize → Understand → Enrich → Score → Recommend → Leads
```

## Phase 1 — Fondation plateforme

| Sprint | Livrable |
| --- | --- |
| 1 — Env | Docker Compose : Postgres, Redis, RabbitMQ, NestJS, Next.js, Prisma, Swagger, ESLint, Prettier, Husky, `.env` |
| 2 — Auth | JWT, RBAC, users, roles, permissions |
| 3 — Admin | Users, settings, **gestion sources** (CRUD minimal) |

## Phase 2 — Intelligence entreprises

| Sprint | Livrable |
| --- | --- |
| 4 — Companies | CRUD, search, profil, timeline, confiance, complétude |
| 5 — Scrapers | Registry, config, schedule, retry, monitoring, raw storage |
| 6 — Queues | RabbitMQ : discovery, crawl, extract, normalize, match, enrich, score, lead |
| 7 — Documents | HTML/PDF extract, boilerplate removal, metadata, langue |
| 8 — Cleaning | Normalisation noms, adresses, emails, phones MA, dates, montants |
| 9 — Entity resolution | Dedup ICE, RC, web, email, phone, nom, adresse |

## Phase 3 — Intelligence métier

| Sprint | Livrable |
| --- | --- |
| 10 — Enrichment | Site, contacts, keywords, secteur, tech stack, timeline |
| 11 — Signals | Détection usine/entrepôt/AO/RH/invest (+ **tes signaux IT**) |
| 12 — Scoring | Règles config, mapping services, score + explain |
| 13 — Leads | Auto-gen, assignation, notes, relances, notifs |

## Phase 4 — Plateforme

| Sprint | Livrable |
| --- | --- |
| 14 — Dashboard | KPIs, opportunités, signaux, rapports |
| 15 — Monitoring | Queues, workers, sources, health, logs |
| 16 — Search | Recherche globale |

## Critères MVP (doc)

- [ ] Entreprises découvertes auto  
- [ ] Sources configurables  
- [ ] Docs stockés + traités  
- [ ] Normalisation + anti-doublon  
- [ ] Enrichissement  
- [ ] Signaux détectés  
- [ ] Scores calculés  
- [ ] Leads générés  
- [ ] Dashboard opérationnel  
- [ ] Docker deploy  
- [ ] Swagger à jour  

## Version 2 (plus tard)

IA signaux, LinkedIn, contact discovery IA, recherche sémantique, OCR, modèles prédictifs, Maps, intégration CRM, automation sales, multi-tenant SaaS.

## Raccourci recommandé pour dev solo (IT)

Si tu veux des **clients plus vite**, compresse ainsi :

1. **Sprint 1** (Docker + DB + API minimal)  
2. **Sprint 5+6+7** en un bloc : 2 scrapers (jobs IT + AO) + raw + extract  
3. **Sprint 4+9** light : fiche entreprise + dedup basique  
4. **Sprint 11+12+13** minimal : 10 signaux IT + score simple + liste leads  
5. **Sprint 14** ultra simple : table leads + entreprises  

Auth multi-user et admin complet peuvent attendre si tu es seul.

## Ordre de lecture avec la doc

Chaque sprint mappe aux chapitres Docs2 :

- Scrapers → **[05-FRAMEWORK-SCRAPERS.md](05-FRAMEWORK-SCRAPERS.md)**  
- Signals/Score/Leads → **06, 08, 09**  
- DB → **[11-MODELE-DONNEES.md](11-MODELE-DONNEES.md)**
