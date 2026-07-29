# Standards de développement

> Source : `docs/development-standards.md`

## Objectif

Code maintenable, scalable, compréhensible en équipe (ou par toi dans 6 mois).

## Principes

KISS, SOLID, DRY, clean code, feature-first, DDD où utile, event-driven, **Docker first**.

## Structure (rappel)

```text
apps/api, apps/web
workers/crawler, extractor, enrichment, scoring, ai
packages/database, shared, types, ui, config
docker/, scripts/, tests/, .github/
```

Organiser par **feature** : `companies`, `contacts`, `sources`, `documents`, `signals`, `leads`, `users`, `dashboard`.

## API

- Validation entrée/sortie  
- Codes HTTP corrects  
- Erreurs structurées  
- Swagger à jour  

## DTOs

Ne **jamais** exposer les entités Prisma brutes.

## Services vs repositories

- Services = logique métier  
- Repositories = DB only (pas de score, pas d’email)

## Workers

Idempotents, retries, logs, events de fin.

## Queues

**Une responsabilité par queue.**

## Secrets

Variables d’env uniquement ; `.env` jamais commité.

## Logs

Structurés ; pas de données sensibles.

## Erreurs

Code, message humain, détails tech, timestamp, trace ID — pas de stack en prod.

## Git

Branches : `feature/...`, `bugfix/...`, `hotfix/...`, `refactor/...`  
Commits : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

## PR

Issue liée, description, comment tester, screenshots UI, CI verte.

## Docker

`docker compose up` suffit pour un nouveau dev.

## Tests (priorité)

Unit → integration → e2e.

## CI/CD cible

```text
Lint → Tests → Build → Docker → Security scan → Deploy → Smoke
```

## Definition of Done

Compile, tests OK, doc à jour, Docker build, Swagger, logs, errors, review, merge main.

## Vision finale (rappel)

Ce n’est ni un simple scraper, ni un CRM, ni un annuaire.

> **Quelle entreprise marocaine est la plus susceptible de devenir mon prochain client IT — et pourquoi maintenant ?**

Chaque module sert cette question.
