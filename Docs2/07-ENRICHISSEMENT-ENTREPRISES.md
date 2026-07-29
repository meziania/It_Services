# Enrichissement entreprises (Company Enrichment Engine)

> Source : `docs/company-enrichment-engine.md`

## Objectif

Améliorer **en continu** chaque fiche entreprise. Jamais « terminé ».

```text
Classique : Entreprise → Save → Fin

Ici : Collect → Compare → Validate → Enrich → Score
  → Attendre nouvelles données → Repeat
```

## Sources d’enrichissement

Sites web, presse, AO, gouvernement, annuaires, job boards, Maps (futur), rapports financiers (futur).

## Catégories de données

| Catégorie | Exemples |
| --- | --- |
| Légal | ICE, RC, IF, statut, forme juridique |
| Contact | Site, emails, tél, adresse, GPS |
| Business | Description, activités, produits, secteur, mots-clés |
| Technique | CMS, analytics, hosting, SSL, stack (**clé pour vendre du web**) |
| Commercial | Taille estimée, effectifs, signaux, score, statut lead |
| Infra | Usine, entrepôt, bureaux (contexte projet) |
| RH | Offres ouvertes, tendances recrutement |

## Site web entreprise

Extraire : mission, produits, services, projets, références, partenaires, news, carrières, contacts.

## Découverte contacts

Dirigeants et rôles **publics** : DG, achats, logistique, usine — plus **DSI, IT Manager, Marketing digital** pour ton cas.

Uniquement infos professionnelles publiques (légal / éthique).

## Mots-clés & classification

Industries : agro, auto, textile, logistique, retail, pharma, énergie, etc.  
→ Sert aux **multiplicateurs** de score (ex. retail → e-commerce plus probable).

## Détection technos site

WordPress, Shopify, PrestaShop, Drupal, Laravel, Next.js, GA, GTM, Pixel, Cloudflare…

**Usage dev** : WordPress 4.x + pas SSL + pas responsive → signal faible « RefonteSiteWeb » + enrichissement score.

## Fiabilité source (confiance)

| Source | Confiance |
| --- | --- |
| Gouvernement | 100 |
| Site entreprise | 95 |
| AO public | 90 |
| Presse fiable | 85 |
| Job board | 80 |
| Maps | 75 |
| Annuaire | 70 |
| Site générique | 50 |

## Conflits

Deux valeurs différentes → **garder les deux**, primaire = source la plus fiable, historique intact.

## Pipeline queue

```text
Raw Document → Détection entreprise → Enrichissement site
  → Contacts → Keywords → Classification → Signaux
  → Update entreprise → Scoring
```

## Retraitement

Documents bruts en base → améliorer parsers / règles **sans** recrawler.

## Historique enrichissement

Date, worker, source, champ, ancienne/nouvelle valeur, confiance, raison.

## Critères d’acceptation

- Fiches qui s’améliorent dans le temps  
- Pas d’écrasement sans historique  
- Source + confiance sur chaque valeur  
- Contacts, keywords, classification auto  
- Timeline entreprise  
- Retraitement possible  
- Score recalculé après enrichissement  

Suite : **[08-MOTEUR-SCORING-OPPORTUNITES.md](08-MOTEUR-SCORING-OPPORTUNITES.md)**
