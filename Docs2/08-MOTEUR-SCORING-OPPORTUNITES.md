# Moteur de scoring opportunités

> Source : `docs/opportunity-scoring-engine.md`

## Objectif

Prioriser les entreprises selon la **probabilité** qu’elles aient besoin de tes services prochainement.

Doc originale : produits MGCE.  
**Toi** : sites web, apps mobile, apps web, intégrations, maintenance, conseil digital.

## Philosophie

Le **dynamique** (événements récents) pèse plus que le statique (ville, ancienneté SARL).

Prioriser : nouveaux projets, embauches, AO, investissements, lancements produits, **projets IT explicites**.

## Score 0–100

| Plage | Niveau |
| --- | --- |
| 0–20 | Très faible |
| 21–40 | Faible |
| 41–60 | Moyen |
| 61–80 | Élevé |
| 81–100 | Très élevé |

Recalcul **après chaque enrichissement** significatif.

## Composants du score (doc — ajustables)

| Composant | Poids doc |
| --- | --- |
| Profil entreprise | 20 % |
| Signaux métier | 40 % |
| Infrastructure | 15 % |
| Qualité données | 10 % |
| Activité récente | 15 % |

Pour **IT**, tu peux remplacer « Infrastructure » par « Maturité digitale / dette technique détectée » (stack, SSL, mobile-friendly).

## Multiplicateurs

- **Secteur** (retail, banque, startup, industrie…)  
- **Région** (Casablanca, Tanger, etc.)  

→ Configurables dans l’admin, pas en dur dans le code.

## Decay temporel

Un signal de janvier pèse moins qu’un signal de cette semaine.

## Catégories d’opportunité (doc)

Entrepôt, structure acier, rack, froid, portes industrielles, mezzanine…

**Équivalent IT** (à créer dans ta config) :

- `WEB_SITE_NEW`, `WEB_REDESIGN`, `ECOMMERCE`  
- `MOBILE_APP`, `WEB_APP_SAAS`  
- `PUBLIC_TENDER_IT`  
- `API_INTEGRATION`, `PORTAL_B2B`  
- `MAINTENANCE_SUPPORT`  

## Recommandation produit / service

Automatique depuis le mapping signal → catalogue **tes** prestations.

## Contact recommandé

Selon signaux : DSI pour AO IT ; Marketing pour site vitrine ; DG pour PME sans IT dédié.

## Priorité lead

Dérivée du score (+ ajustement manuel).

## Création auto de lead

Si score > seuil **ou** combo de signaux stratégiques (configurable).

## Explicabilité (obligatoire)

Breakdown visible : chaque composant, chaque signal, date, source.

## Widgets

Top opportunités, tendance, meilleur score semaine, par région / secteur, signaux du jour.

## Critères d’acceptation

- Score pour chaque entreprise suivie  
- Recalcul auto  
- Règles configurables  
- Recommandations services  
- Priorité leads  
- Nouveaux signaux → impact score immédiat  
- Compréhensible par un humain en 30 secondes  

Voir mapping IT détaillé : **[14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md](14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md)**

Suite : **[09-GESTION-LEADS.md](09-GESTION-LEADS.md)**
