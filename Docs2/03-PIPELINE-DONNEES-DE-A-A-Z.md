# Pipeline de données — De A à Z

Ce chapitre décrit **tout le parcours** d’une information, du moment où elle existe sur Internet jusqu’à ce qu’elle devienne un **lead** dans ton outil. C’est la colonne vertébrale du projet ; les autres fichiers détaillent chaque étape.

## Vue d’ensemble (une phrase par étape)

1. **Découverte** — On trouve une URL, une entreprise, ou un document via une source configurée.  
2. **Crawl / téléchargement** — On récupère HTML, PDF, RSS, JSON, etc.  
3. **Stockage brut** — Rien n’est jeté ; le document original est archivé.  
4. **Extraction** — Texte propre, métadonnées, liens.  
5. **Normalisation** — Noms, téléphones, emails, dates, montants au format unique.  
6. **Détection d’entités** — Entreprises, contacts, événements candidats.  
7. **Matching entreprise** — Éviter les doublons (ICE, site web, nom, etc.).  
8. **Enrichissement** — La fiche entreprise s’améliore à chaque passage.  
9. **Événement métier** — Fait objectif (« publication AO le 12/03 »).  
10. **Signal métier** — Interprétation (« achat IT / expansion digitale »).  
11. **Score d’opportunité** — Priorisation 0–100 avec breakdown.explicable.  
12. **Lead** — Si seuils atteints, création automatique avec raison + suggestions.  
13. **Dashboard / API** — Consultation, recherche, admin, export.

## Schéma global

```text
                    ┌─────────────────────────────────────────┐
                    │           SOURCES (configurables)        │
                    │  gov, news, jobs, AO, sites entreprises  │
                    └────────────────────┬────────────────────┘
                                         │
                                         v
                              ┌──────────────────┐
                              │  Scraper / Crawler│
                              │  (workers)        │
                              └────────┬─────────┘
                                       │
                                       v
                              ┌──────────────────┐
                              │  raw_documents    │  ← preuve, reprocess possible
                              └────────┬─────────┘
                                       │
                                       v
                              ┌──────────────────┐
                              │  Extractor        │  HTML/PDF/OCR
                              └────────┬─────────┘
                                       │
                                       v
                              ┌──────────────────┐
                              │  Normalisation    │
                              └────────┬─────────┘
                                       │
                                       v
                              ┌──────────────────┐
                              │ Entity resolution │  doublons entreprises
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    v                                      v
           ┌────────────────┐                    ┌────────────────┐
           │ companies +     │                    │ business_events │
           │ contacts enrichis│                    │ job_postings    │
           └────────┬────────┘                    │ public_tenders  │
                    │                             └────────┬────────┘
                    │                                      │
                    └──────────────────┬───────────────────┘
                                       v
                              ┌──────────────────┐
                              │ Business Signal   │
                              │ Engine            │
                              └────────┬─────────┘
                                       v
                              ┌──────────────────┐
                              │ Opportunity       │
                              │ Scoring Engine    │
                              └────────┬─────────┘
                                       v
                              ┌──────────────────┐
                              │ Leads             │
                              └────────┬─────────┘
                                       v
                              ┌──────────────────┐
                              │ Next.js Dashboard │
                              │ NestJS API        │
                              └──────────────────┘
```

## Qui fait quoi ? (séparation des responsabilités)

| Composant | Fait | Ne fait pas |
| --- | --- | --- |
| **API NestJS** | Auth, CRUD, recherche, lancer jobs, permissions | Crawl long, OCR, scoring lourd |
| **Workers** | Crawl, extract, enrich, score, lead gen | Exposer des endpoints HTTP publics |
| **RabbitMQ** | Files entre workers | Stocker la vérité métier |
| **PostgreSQL** | Source de vérité (entreprises, docs, scores, leads) | Cache volatile |
| **Redis** | Cache, état temporaire, files si besoin | Remplacer Postgres |
| **Scraper** | Fetch, store raw, publish job suivant | Décider du score final, envoyer emails |

## Cycle de vie des données (règle d’or)

```text
Discover → Download → Extract → Normalize → Validate → Match → Enrich → Score → Publish (lead / UI)
```

Chaque étape est **indépendante** : tu peux améliorer l’extracteur et **retraiter** les `raw_documents` sans recrawler.

## Philosophie « ne jamais écraser »

Pour chaque valeur (email, adresse, ICE, description) :

- **Source** (nom, URL, type, priorité A–F)  
- **Date de découverte** et **dernière vérification**  
- **Score de confiance**  
- **Historique** (ancienne valeur conservée)  
- **Valeur primaire** = meilleure source selon règles (ex. gouvernement > annuaire générique)

Indispensable pour la **crédibilité** quand tu contactes un client (« on a vu votre AO sur marchespublics.gov.ma »).

## Files RabbitMQ (enchaînement typique)

```text
Crawler
  → queue Document
    → Extractor
      → queue Normalization
        → Entity Matching
          → queue Enrichment
            → queue Scoring
              → queue Lead Generation
```

Les workers **ne se parlent pas directement** ; tout passe par les queues (scalable, résilient).

## Événements métier (extensibilité)

Exemples d’événements internes (bus / logs / futures intégrations) :

- `CompanyCreated`, `CompanyUpdated`  
- `DocumentDownloaded`, `DocumentProcessed`  
- `WebsiteCrawled`  
- `BusinessSignalDetected`  
- `ScoreUpdated`  
- `LeadGenerated`  

## Exemple concret (adapté IT)

**Entrée** — Article : « La société ABC lance une marketplace B2B ».

| Étape | Résultat |
| --- | --- |
| Raw doc | HTML article archivé |
| Extract | Texte + date + auteur |
| Normalize | « ABC Industries SARL », Casablanca |
| Match | Fusion avec fiche existante (site abc.ma) |
| Event | `ProductLaunch` / `DigitalProject` |
| Signal | `NewDigitalPlatform` (poids configurable) |
| Prédiction besoins | App web, API, paiement, admin dashboard |
| Score | +25 signal, +10 activité récente → 78/100 |
| Lead | Créé si seuil ≥ 75 ; priorité HIGH |

**Toi** : tu vois le lead avec explication et tu prospectes avec un angle pertinent.

## Gestion d’erreurs (obligatoire en prod)

Chaque worker :

- Retries avec **backoff** (immédiat, 1 min, 5 min, 30 min)  
- **Dead letter queue** si échec définitif  
- Notification / log structuré  
- **Retry manuel** depuis l’admin  

Jamais supprimer silencieusement un job failed.

## Logs structurés (minimum)

Timestamp, module, worker, job ID, company ID, source, durée, status, message d’erreur — centralisés pour debug crawler vs scoring.

## Liens vers le détail

- Sources : **[04-SOURCES-DE-DONNEES-MAROC.md](04-SOURCES-DE-DONNEES-MAROC.md)**  
- Scrapers : **[05-FRAMEWORK-SCRAPERS.md](05-FRAMEWORK-SCRAPERS.md)**  
- Signaux : **[06-MOTEUR-SIGNAUX-AFFAIRES.md](06-MOTEUR-SIGNAUX-AFFAIRES.md)**  
- Score : **[08-MOTEUR-SCORING-OPPORTUNITES.md](08-MOTEUR-SCORING-OPPORTUNITES.md)**  
- Leads : **[09-GESTION-LEADS.md](09-GESTION-LEADS.md)**  
- Tables : **[11-MODELE-DONNEES.md](11-MODELE-DONNEES.md)**
