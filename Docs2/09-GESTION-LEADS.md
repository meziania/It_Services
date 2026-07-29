# Gestion des leads

> Source : `docs/lead-management.md`

## Objectif

Transformer les opportunités à fort score en **actions de vente** concrètes.

Les leads viennent de l’**intelligence**, pas d’une saisie manuelle type CRM froid.

## Cycle de vie

```text
Signaux → Score opportunité → Lead → Qualification → Contact
  → RDV → Proposition → Client (WON) ou LOST
```

## Création automatique

Conditions configurables, exemples :

- Score ≥ 70 (seuil à définir)  
- Signal stratégique seul (ex. AO IT > X MAD)  
- Combo : embauche dev + article expansion  

## Contenu d’un lead

- Entreprise liée  
- Score, priorité, statut  
- Date création  
- **Pourquoi** (texte + signaux + confiance)  
- Timeline signaux  
- Services suggérés  
- Département / rôle suggéré  
- Piste de contact (email public, LinkedIn pro — pas spam automatisé par la plateforme)  
- Notes, relances, historique statuts  

## Statuts recommandés

`NEW`, `QUALIFIED`, `CONTACTED`, `WAITING_RESPONSE`, `MEETING_PLANNED`, `MEETING_COMPLETED`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`, `ARCHIVED`

## Priorité

From score ; override manuel possible.

## « Pourquoi ce lead ? »

Champ **obligatoire** : signaux, dates, liens sources — crédibilité en prospection.

## Anti-doublon leads

Avant création : lead ouvert déjà existant pour même entreprise / même opportunité ?

## Relances

Planifier appels, emails, LinkedIn, RDV, visite (hors envoi auto massif — la plateforme **suggère**, tu exécutes).

## Propriété

Owner, équipe, date assignation, dernière / prochaine activité.

## Dashboard leads

Nouveaux du jour, haute priorité, relances en retard, RDV semaine, propositions, gagnés/perdus, taux conversion, score moyen, délai réponse.

## Recherche & export

Filtres ; export CSV / Excel ; PDF/API plus tard.

## Notifications

Nouveau lead fort, score augmenté, nouveau signal, relance due, lead assigné, RDV demain, proposition en attente.

## Critères d’acceptation

- Génération auto  
- Raison explicite  
- Services + contacts suggérés  
- Pas de doublons  
- Relances + historique  
- Score entreprise synchronisé  

Pour un **solo dev**, simplifier : moins de statuts, export vers Notion/Trello optionnel en V2.

Suite : **[10-DASHBOARD-ET-ADMIN.md](10-DASHBOARD-ET-ADMIN.md)**
