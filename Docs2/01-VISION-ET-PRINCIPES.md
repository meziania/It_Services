# Vision et principes

> Source : `docs/overview.md`

## Vision

Trouver des clients ne devrait pas dépendre du hasard.

Au Maroc, les entreprises laissent chaque jour des **empreintes digitales** :

- Extensions d’usine, entrepôts, investissements logistiques  
- Marchés publics  
- Campagnes de recrutement  
- Nouvelles lignes de production, acquisitions foncières  

Ce sont des **signaux métier**. La plateforme les transforme en **intelligence structurée** pour prioriser qui contacter **tôt**.

Pour un développeur, les mêmes signaux incluent aussi : recrutement tech, AO informatique, lancement digital, site vieillissant, etc.

## Nom et rôle du projet

**Moroccan B2B Lead Intelligence Platform** (repo : opportunities-scanner) :

- Découvre, surveille et **enrichit** des entreprises marocaines  
- **N’est pas** un CRM classique  
- Objectif : découvrir des **futurs clients** avant qu’ils ne soient évidents

## Sources de collecte (continu)

- Portails gouvernementaux  
- Sites d’entreprises  
- Presse / news  
- Marchés publics  
- Job boards  
- Annuaires industriels  
- Annonces entreprises  
- (Futur) réseaux sociaux  

## Philosophie : les entreprises ne disent pas « on cherche un fournisseur »

Elles laissent des **signaux** :

| Signal (exemples doc originale) | Équivalent IT possible |
| --- | --- |
| Extension usine | Nouveau produit digital à supporter |
| Recrutement achats | Recrutement dev / product owner |
| Marché public construction | AO « développement application » |
| Investissement industriel | Levée de fonds / expansion → budget IT |

**Objectif** : détecter les signaux et les **rattacher à la bonne entreprise**, pas seulement empiler des noms.

## Principes fondamentaux

### 1. Les entreprises évoluent en continu

Une fiche n’est jamais « terminée ». Chaque crawl l’améliore.

### 2. Ne jamais remplacer les données sans trace

Chaque valeur garde : source, date découverte, dernière vérif, confiance.

### 3. Tout est traçable

Chaque champ en base doit remonter à une **preuve** (URL, PDF, article).

### 4. Timeline par entreprise

Historique des changements, pas seulement l’état actuel.

### 5. Le dynamique bat le statique

**Statique** : ville, téléphone, site, email.  
**Dynamique** : embauches, investissements, projets, AO, expansion.

→ Le dynamique predit le **besoin futur** (y compris besoin de dev / web / mobile).

## Différenciation

| Outils classiques | Cette plateforme |
| --- | --- |
| « Qui sont les entreprises ? » | « Qui ** prépare** un investissement / projet où IT est pertinent ? » |

## Objectifs principaux (checklist produit)

- [ ] Découvrir automatiquement des entreprises MA  
- [ ] Crawler en continu  
- [ ] Normaliser les infos  
- [ ] Dédupliquer  
- [ ] Base entreprises évolutive  
- [ ] Détecter événements / signaux  
- [ ] Scores de confiance et d’opportunité  
- [ ] Prédire besoins probables  
- [ ] Générer leads qualifiés  
- [ ] Aider à prioriser la prospection  

## Définition : Business Signal

Information publique indiquant qu’une entreprise **change**, **investit**, **s’étend**, ou **prépare un projet**.

Exemples doc : extension usine, entrepôt, AO public, embauche directeur logistique…  
Exemples IT : embauche développeur, AO site web, certification ISO avec portail client, etc.

## Exemple d’opportunité (format attendu en UI)

**Article** : « ABC Industries annonce une nouvelle ligne de production. »

| Couche | Valeur |
| --- | --- |
| Signal | Augmentation capacité production |
| Besoins prédits (industriel) | Entrepôt, rack, portes… |
| Besoins prédits (IT) | WMS, traceability app, site B2B commandes |
| Score | 91/100 |
| Contacts suggérés | CEO, Ops, Achats — ou DSI / IT Manager |

→ **Lead qualifié** avec justification.

## Vision long terme

Plus grande base marocaine **enrichie en continu**, capable de **prédire** des opportunités commerciales avant qu’elles soient visibles partout.

Chaque crawler, source, événement et enrichissement rend le système plus intelligent.
