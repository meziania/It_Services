# Sources de données — Maroc

> Source : `docs/data-sources.md`

## Objectif

Surveiller en continu l’information **publique** business au Maroc. La qualité du scanner = qualité des sources + traçabilité.

Pour **chaque** valeur collectée, garder :

- Nom et URL source  
- Type de source  
- Date découverte, dernière vérification  
- Score de confiance  
- Document brut  
- Statut de traitement  

## Catégories

```text
Gouvernement officiel
Registres / OMPIC
Marchés publics
Presse
Sites entreprises
Job boards
Annuaires / zones industrielles
Maps
Social (futur)
```

## Priorité des sources (A → F)

| Niveau | Type | Règle |
| --- | --- | --- |
| A | Gouvernement | Écrase les infos non officielles si conflit (avec historique) |
| B | Site entreprise | Très fiable pour contact / activité |
| C | Marché public | Signal d’achat fort |
| D | Presse reconnue | Signaux projets / investissements |
| E | Annuaire pro | Découverte |
| F | Site générique | Faible confiance |

## Sources officielles (à intégrer progressivement)

| Source | URL | Intérêt |
| --- | --- | --- |
| OMPIC | https://www.ompic.ma | ICE, statut légal |
| DirectInfo | https://www.directinfo.ma | Infos légales |
| Marchés Publics | https://www.marchespublics.gov.ma | **AO — crucial pour projets IT publics** |
| MCINET | https://www.mcinet.gov.ma | Investissements industriels |
| Morocco Now / AMDIE | https://www.morocconow.com | IDE |
| CGEM | https://www.cgem.ma | Écosystème entreprises |

Futur : ANCFCC, PortNet, ONCF, etc.

## CRIs (centres régionaux d’investissement)

Casablanca (casainvest.ma), Agadir, Fès-Meknès, Rabat, Tanger — annonces d’implantation = signaux croissance (souvent besoin site + outils).

## Presse (signaux projets)

medias24.com, lematin.ma, leconomiste.com, industries.ma, challenge.ma, leseco.ma, lavieeco.com, mapnews.ma

Signaux typiques : extension, investissement, entrepôt, acquisition, partenariat — **et** transformation digitale si tu ajoutes des mots-clés / NLP.

## Job boards — **très important pour un dev**

| Source | URL |
| --- | --- |
| ReKrute | https://www.rekrute.com |
| Emploi.ma | https://www.emploi.ma |
| LinkedIn Jobs | https://www.linkedin.com/jobs |
| Pages carrières des sites entreprises | (découverte via crawl) |

**Signaux doc originale** : directeur achats, logistique, usine…  
**Signaux IT à configurer** :

- Développeur web / mobile / full stack  
- Chef de projet digital, Product Owner  
- DSI, IT Manager, DevOps  
- Designer UX/UI, Data engineer  
- « Digital transformation », « e-commerce »

→ Recrutement tech = budget et urgence souvent plus haute qu’un simple « refonte un jour ».

## Sites entreprises

Toute entreprise découverte → **cible de crawl**.

Pages prioritaires : `/`, about, actualités, blog, presse, carrières, contact, projets, services, produits, investisseurs.

Le crawler suit les liens internes (depth + max pages configurables).

**Pour IT** : détecter stack (WordPress vieux, pas de HTTPS, pas de mobile) via enrichissement tech — voir **[07-ENRICHISSEMENT-ENTREPRISES.md](07-ENRICHISSEMENT-ENTREPRISES.md)**.

## Annuaires & zones industrielles

Google Maps, Kompass, chambres de commerce, parcs (Tanger Med, MidParc, Technopolis, etc.) → **découverte** de centaines d’entreprises à enrichir ensuite.

## Marchés publics (procurement)

Marchés Publics, achats établissements publics, ports, universités, hôpitaux…

Mots-clés doc : construction, entrepôt…  
**Mots-clés IT à crawler** : développement, logiciel, application, site web, hébergement, maintenance informatique, cybersécurité, ERP, digitalisation.

## Fréquences de crawl suggérées

| Source | Fréquence |
| --- | --- |
| Gouvernement | Hebdo |
| News / RSS | Horaire |
| Job boards | Quotidien |
| Sites entreprises | Hebdo |
| Annuaires / maps | Mensuel |
| Marchés publics | Quotidien |

## Stratégie découverte

Ne pas partir d’une liste fixe : **découvrir** depuis les sources → queue → crawl → persister.

## Documents bruts

Formats : HTML, PDF, DOC/DOCX, XML, RSS, JSON, CSV, TXT — **toujours** conserver l’original.

## Anti-doublon entreprise (avant création)

Chercher par : ICE, RC, site web, email, téléphone, nom, adresse, lieu Maps.  
Confiance basse → **tâche de revue humaine**, pas fusion automatique.

## Sources futures

LinkedIn, Google Business, Google News, rapports annuels, API entreprises, newsletters, etc.

## Action pour ton projet

1. MVP : **site entreprise** + **news RSS** + **ReKrute (IT titles)** + **Marchés Publics (keywords IT)**  
2. Enrichir avec OMPIC / DirectInfo pour ICE et légal  
3. Élargir CRIs et presse  

Détail scrapers : **[05-FRAMEWORK-SCRAPERS.md](05-FRAMEWORK-SCRAPERS.md)**
