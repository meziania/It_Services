# Deux projets différents — `docs/` vs `Docs2/`

## Projet société (stage) → dossier `docs/`

- **Contexte** : entreprise où tu fais le stage.
- **Produit** : plateforme **Lead Intelligence B2B Maroc** (pas un CRM).
- **Sources typiques** : OMPIC, marchés publics, presse MA, sites entreprises, ReKrute, zones industrielles…
- **Logique** : signaux métier (investissement, AO, embauche…) → score → leads pour **équipe commerciale** (ex. MGCE / industrie).
- **Langue doc** : anglais, spec officielle du repo.

→ Tu t’alignes sur **`docs/`** + ce que ton encadrant de stage demande.

---

## Projet personnel → dossier `Docs2/` (+ chapitre dédié)

- **Contexte** : **ton** outil freelance, pas celui de la société.
- **Objectif** : scanner des **plateformes où des clients publient déjà un besoin IT**, pas seulement « deviner » via la presse marocaine.
- **Sources cœur missions freelance** (demandes clients) :
  - **Mostaql** (مشاريع مفتوحة — projets IT arabophones)
  - **Khamsat** (طلبات الخدمات — buyer requests)
  - **Fiverr** (buyer requests — plus tard / méthode autorisée)
  - Compléments : ReKrute (missions), Marchés publics (AO), LinkedIn / Indeed (optionnel)
- **Résultat UI** :
  - Liste d’**opportunités** (offre / mission IT freelance)
  - **Contact** affiché quand c’est public (email, téléphone, profil, lien messagerie plateforme)
  - **Proposition de service** générée **à partir du texte de l’offre** (template + personnalisation)
  - Action : **email** et/ou **WhatsApp** (lien `wa.me` ou numéro) — idéalement **semi-manuel** au début (tu valides avant envoi)

→ Spec détaillée : **[16-PROJET-PERSONNEL-SCANNER-FREELANCE.md](16-PROJET-PERSONNEL-SCANNER-FREELANCE.md)**

---

## Ce qui se recycle entre les deux projets

Même si les **sites** ne sont pas les mêmes, tu peux réutiliser des **idées techniques** de `docs/` :

| Idée `docs/` | Projet perso |
| --- | --- |
| Scraper framework (config, schedule, retry) | 1 adapter par plateforme |
| `raw_documents` + reprocess | Garder le texte de l’offre |
| Normalisation + dédup | Éviter la même offre 10 fois |
| Score + « pourquoi » | Prioriser les meilleures missions |
| Leads + historique | Suivre contacté / répondu / gagné |

Ce qui **change** surtout :

| Société (`docs/`) | Perso (`Docs2` ch. 16) |
| --- | --- |
| Entité = **entreprise marocaine** | Entité = **offre / client** (personne ou société) |
| Signaux indirects (news, AO gov) | Besoin **explicite** dans l’annonce |
| Pas d’envoi mail/WhatsApp dans la spec | **Outreach** au cœur du produit perso |
| Sources MA B2B | Marketplaces & job boards **internationaux + MA** |

---

## Par où lire pour **ton** projet perso

1. **[16-PROJET-PERSONNEL-SCANNER-FREELANCE.md](16-PROJET-PERSONNEL-SCANNER-FREELANCE.md)** — vision, sources, pipeline, contacts, messages  
2. **[02-ARCHITECTURE-ET-COMPOSANTS.md](02-ARCHITECTURE-ET-COMPOSANTS.md)** — stack (API, workers, DB) si tu codes pareil  
3. **[05-FRAMEWORK-SCRAPERS.md](05-FRAMEWORK-SCRAPERS.md)** — contrat scraper (adapté par site)  
4. Chapitres **04 / 06 / 14** marocains → **optionnels** pour le perso, utiles seulement si tu ajoutes ReKrute / marchespublics plus tard

Les fichiers **01–15** restent une **référence** dérivée de `docs/` (stage + culture projet) ; le perso ne doit **pas** copier toute la roadmap MGCE.
