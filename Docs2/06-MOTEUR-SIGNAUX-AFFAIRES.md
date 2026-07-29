# Moteur de signaux métier (Business Signal Engine)

> Source : `docs/business-signal-engine.md`

## Rôle

Transformer l’info publique brute en **intelligence commerciale structurée**, entre collecte et génération de leads.

```text
Internet → Documents → Business Events → Business Signals
  → Prédiction opportunité → Score lead
```

## Signal métier

Toute info publique indiquant un **changement** dans l’entreprise.

## Catégories (doc originale)

### Croissance

Nouvelle usine, extension, capacité, filiale, export, nouveau produit.

### Infrastructure

Entrepôt, bâtiment industriel, plateforme logistique, etc.

### Ressources humaines

Embauches achats, logistique, directeur usine, entrepôt, maintenance…

### Procurement

AO public/privé, appel d’offres, achat équipement.

### Investissement

Capitaux, IDE, acquisition, fusion, partenariat.

### Conformité

Certifications ISO, environnement, sécurité.

## Pipeline

```text
Document → Texte → Entités → Business Event (fait)
  → Business Signal (interprétation) → Prédiction besoins
```

- **Event** = factuel, sans interprétation (« publié AO #123 », « offre emploi Dev React »)  
- **Signal** = sens commercial (« projet application », « renforcement équipe digital »)

## Confiance du signal

Dépend de : nombre de sources, qualité source, récence, répétition, complétude, confiance extraction.

## Poids exemples (configurables)

| Signal (doc) | Poids |
| --- | --- |
| Nouvelle usine | 100 |
| Extension usine | 90 |
| Construction entrepôt | 100 |
| AO public | 95 |
| Investissement industriel | 90 |
| Embauche responsable achats | 40 |
| Embauche logistique | 45 |
| Croissance export | 35 |
| Certification ISO | 20 |

Tu dupliques / remplaces cette table pour l’IT dans **[14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md](14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md)**.

## Expiration (decay)

Les signaux **perdent** de l’importance avec le temps → focus sur opportunités **actives**.

## Agrégation

Un seul signal rarement suffit ; **plusieurs signaux** = intention d’achat plus crédible.

Exemple règle (editable sans redeploy code) :

```text
IF ExtensionUsine AND EmbaucheLogistique THEN Score +25
```

Version IT :

```text
IF PublicTender_IT AND EmbaucheDeveloppeur THEN Score +30
```

## Product mapping

Chaque signal mappe vers des **offres** que tu vends (doc : solutions MGCE ; toi : site, app, API, maintenance).

## Opportunity Engine (combinaison)

```text
Entreprise + Signaux + Taille + Secteur + Activité récente + Confiance → Score 0-100
```

## Explicabilité

Le commercial (ou toi) doit voir **pourquoi** le score est élevé — liste des signaux, poids, dates, sources.

## Widgets dashboard suggérés

Entreprises actives, derniers signaux, AO, embauches procurement/logistique, heat map opportunités, top de la semaine.

Pour IT : widget « AO IT », « Recrutement tech », « Sites technos obsolètes ».

## Couche IA (futur)

Compléter les règles déterministes pour textes ambigus (articles longs, communiqués vagues).

Suite : **[07-ENRICHISSEMENT-ENTREPRISES.md](07-ENRICHISSEMENT-ENTREPRISES.md)**, **[08-MOTEUR-SCORING-OPPORTUNITES.md](08-MOTEUR-SCORING-OPPORTUNITES.md)**
