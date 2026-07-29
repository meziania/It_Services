# Framework scrapers

> Source : `docs/scraper-framework.md`

## Objectif

Collecter l’info publique marocaine via un système **réutilisable** : une source = même cycle de vie, config différente.

Chaque scraper doit être facile à : ajouter, configurer, activer/désactiver, planifier, monitorer, retry, debugger.

## Responsabilités

### Le scraper DOIT

- Fetch pages, télécharger documents  
- Extraire texte brut, détecter liens  
- Stocker réponses brutes  
- Publier le job suivant (queue)  

### Le scraper NE DOIT PAS

- Décider qu’une entreprise est un lead  
- Calculer le score final  
- Écraser directement la fiche entreprise  
- Envoyer des emails / contacter des gens  

(Séparation claire avec Signal Engine + Scoring + Leads.)

## Cycle de vie standard

```text
Discover → Crawl → Store Raw → Extract → Normalize
  → Detect Entities → Match Company → Detect Events
  → Enrich → Score → Generate Lead
```

Les étapes après « Store Raw » sont souvent **d’autres workers**.

## Contrat scraper (méthodes)

```text
discover()
crawl()
download()
extract()
normalize()
classify()
store()
publishNextJob()
```

## Configuration d’une source (champs)

Nom, type, URL de base, priorité, actif/inactif, fréquence, max pages, max depth, timeout, retries, JS requis ?, proxy ?, domaines autorisés, paths bloqués, headers/cookies JSON, config JSON libre.

## Types de source

`OFFICIAL`, `NEWS`, `JOB_BOARD`, `TENDER`, `COMPANY_WEBSITE`, `DIRECTORY`, `INDUSTRIAL_ZONE`, `MAPS`, `SOCIAL`, `OTHER`

## Stratégie par type

### Officiel (OMPIC, DirectInfo, MCINET, CRI)

Lent, respect robots.txt, stocker brut, extraire noms légaux et annonces ; privilégier listes publiques, RSS, sitemaps.

### News

RSS si dispo, pages catégories, liens articles, stocker article brut, détecter événements dans le texte.

### Job boards

Recherches par **titres** configurables (doc : logistique ; toi : dev, digital, DSI).  
Extraire : entreprise, titre, ville, date.  
Classer en signaux RH.  
**Pas** de données personnelles privées.

### Marchés publics

Mots-clés (construction dans doc ; **+ logiciel, site, application** pour toi).  
Télécharger PDF publics, extraire acheteur, ref, ville, deadline, catégorie ; OCR plus tard si scan.

### Sites entreprises

Homepage → liens internes → pages prioritaires ; emails, tél, adresses ; profondeur limitée.

## Pages prioritaires (sites MA)

`/`, `/about`, `/a-propos`, `/qui-sommes-nous`, `/actualites`, `/blog`, `/recrutement`, `/contact`, `/projects`, etc.

## Découverte de liens

`<a href>`, canonical, sitemap.xml, robots.txt, RSS, JSON-LD.

## Extraction contenu

HTML : retirer nav, footer, pubs, cookies, scripts.  
PDF : texte natif + préparation OCR ; métadonnées, titre, pages.

## Normalisation

Noms entreprises, emails, phones MA, sites, adresses, villes/régions, dates, montants, devises, intitulés poste, noms d’événements.

## Détection entreprise

Suffixes MA : SARL, SA, SAS, SNC, GIE, Coopérative, Association, Holding, Groupe + NER + champs structurés (job, AO, domaine).

## Détection doublon avant insert

ICE, RC, IF, domaine email/web, téléphone, nom normalisé, adresse, ville.

## Détection événements

Après extraction ; le scraper émet des **candidats**, pas la décision finale signal.

## Erreurs à gérer sans crash worker

Timeout, DNS, HTTP 4xx/5xx, HTML invalide, PDF illisible, encoding, rate limit, URL dupliquée.

## Retry

```text
T1 immédiat → T2 +1 min → T3 +5 min → T4 +30 min → dead-letter
```

## Anti-doublon URL

Normaliser URL, retirer tracking/fragment, hash, skip si crawl récent.

## Sortie standardisée scraper

Metadata source, raw_document_id, status, content_type, liens, entreprises, contacts, événements candidats, errors[].

## Services réutilisables à coder (MVP)

HttpFetcher, HtmlParser, PdfExtractor, TextCleaner, LinkExtractor, EmailExtractor, PhoneExtractor, CompanyExtractor, EventClassifier, DocumentStorageService, QueuePublisher.

## Priorité MVP scrapers (doc)

1. Crawler site entreprise  
2. Crawler presse / articles  
3. Job board  
4. Marchés publics  

Pour **dev IT**, monter **job board + AO IT** en parallèle du site entreprise si tu manques de temps.

## Critères d’acceptation framework

- Source créée depuis dashboard  
- Enable/disable, run manuel, schedule  
- Raw + texte extrait stockés  
- Entreprises + événements candidats détectés  
- Échecs loggés + retry  
- URLs dup ignorées  
- Pipeline via RabbitMQ  

Suite : **[06-MOTEUR-SIGNAUX-AFFAIRES.md](06-MOTEUR-SIGNAUX-AFFAIRES.md)**
