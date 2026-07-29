# Modèle de données (base PostgreSQL)

> Source : `docs/database-design.md`

## Objectif

Supporter l’**enrichissement continu** : tout ce qu’on apprend sur une entreprise, dans le temps, avec preuves.

## 5 règles

1. Ne jamais faire confiance à une seule source  
2. Garder l’historique des sources  
3. Ne pas écraser — merger avec confiance + primaire  
4. Stocker documents bruts (reprocess)  
5. Séparer **données brutes** vs **intelligence** (events, scores, leads)

## Tables principales

### Auth

- `users` — id, nom, email, password_hash, role_id, actif, timestamps  
- `roles` — Admin, Sales, Manager, Developer, Viewer  
- `permissions` — ex. `company.read`, `lead.assign`, `scraper.run`

### Entreprise (fiche + multivalué)

- `companies` — infos primaires « meilleures connues »  
- `company_identifiers` — ICE, RC, IF, CNSS, VAT…  
- `company_websites`, `company_emails`, `company_phones`, `company_addresses`, `company_social_links`

### Sources & documents

- `crawler_sources` — config + schedule  
- `raw_documents` — contenu original + statut traitement  
- `extracted_documents` — texte nettoyé

### Intelligence métier

- `business_events` — faits / signaux détectés  
- `job_postings` — offres (signaux RH)  
- `public_tenders` — AO

### Scoring

- `opportunity_scores` — score actuel par entreprise  
- `score_breakdowns` — détail composants (explicabilité)

### Leads

- `leads`, `lead_notes`, `lead_history`

### Contacts

- `contacts` — décideurs publics

### Crawler ops

- `crawler_runs`, `crawler_jobs`, `crawler_logs`

## Relations (résumé)

```text
Company → identifiers, websites, emails, phones, addresses, social,
          contacts, business_events, job_postings, public_tenders,
          opportunity_scores, leads

CrawlerSource → raw_documents, crawler_runs, crawler_jobs

RawDocument → extracted_document, events, jobs, tenders
```

## Flux enrichissement

```text
Nouvelle valeur → Entreprise existe ? → Valeur existe ?
  → Compare confiance → Stocke source → Update primaire si mieux
  → Recalc confiance entreprise → Recalc score opportunité
```

## Règle critique scrapers

**Interdit** d’écrire directement les champs finaux `companies` sans pipeline :

```text
Scraper → RawDocument → ExtractedDocument → NormalizedData
  → CompanyMatching → CompanyUpdate
```

## Implémentation

Prisma + migrations nommées, jamais modifier une migration déjà mergée.

Suite : **[12-ROADMAP-SPRINTS.md](12-ROADMAP-SPRINTS.md)**
