# Dashboard et administration

> Source : `docs/dashboard-administration.md`

## Objectif

Répondre chaque matin : **« Où je focus aujourd’hui ? »**

## Vue dashboard

- Résumé du jour  
- Top opportunités  
- Derniers signaux  
- Entreprises « qui accélèrent »  
- Derniers AO  
- Dernières offres d’emploi pertinentes  
- Santé système (crawlers, queues)  

## KPI cards (exemples)

Total entreprises, découvertes/enrichies aujourd’hui, signaux du jour, leads haute priorité, crawlers actifs, workers, taille queues, taux succès, jobs failed, complétude connaissance, score moyen.

## Analytics

Entreprises, opportunités, signaux, AO, hiring, sources, workers, queues, activité récente.

## Recherche globale

Entreprises, sites, emails, phones, ICE/RC, contacts, villes, secteurs, AO, jobs, signaux, leads.

## Fiche entreprise (page dédiée)

Infos générales, contacts, adresses, sites, signaux, timeline, score + breakdown, services suggérés, docs bruts / articles / AO / jobs liés, historique leads, historique crawls, % complétude.

## Administration (modules)

Users, rôles, permissions, **sources**, **scrapers**, queues, workers, **définitions signaux**, **règles opportunité**, **mapping produits/services**, régions, industries, keywords, settings, API keys, logs.

## Gestion sources

CRUD, enable/disable, run now, pause, duplicate, logs, stats.

## Signaux configurables

Pas de signaux uniquement hardcodés — editable via admin (JSON/rules engine).

## Scheduler

Horaire, 6h, daily, weekly, monthly, manual.

## Logs centralisés

Filtre + recherche.

## Rapports

Top secteurs/régions, entreprises actives, plus grosses opportunités, sources les plus utiles, perf crawlers, conversion leads.

## Critère « dashboard terminé »

En quelques minutes : ce qui a changé, où prospecter, si la plateforme est saine.

## MVP minimal pour toi seul

Même sans admin complète au début :

1. Liste entreprises + score + signaux  
2. Liste leads NEW avec « pourquoi »  
3. Page source : run crawl + voir errors  
4. Health : queue depth + last run  

Le reste peut suivre la roadmap **[12-ROADMAP-SPRINTS.md](12-ROADMAP-SPRINTS.md)**.
