# Projet personnel — Scanner opportunités freelance IT

## Vision (ton besoin)

Tu veux un outil qui :

1. **Parcourt** des sites où des clients cherchent déjà un prestataire IT (freelance / mission).
2. **Filtre** ce qui correspond à tes services (web, mobile, API, etc.).
3. **Affiche** l’offre + **contact** (email, WhatsApp, lien plateforme) quand c’est disponible.
4. **Propose** un message / une offre de service **basée sur le texte de leur annonce** (pas un mail générique).
5. Te permet d’**envoyer** (email ou ouvrir WhatsApp) — de préférence après relecture.

Question centrale **perso** :

> **Qui publie maintenant un besoin IT que je peux servir, comment le contacter, et quoi lui dire ?**

---

## Sources (missions freelance — vision actuelle)

| Plateforme | Type de contenu | Intérêt IT | Accès technique (réaliste) |
| --- | --- | --- | --- |
| **Mostaql** | مشاريع مفتوحة (client → freelance) | Très fort (missions) | Listing public HTML — **adapter implémenté** |
| **Khamsat** | طلبات الخدمات غير الموجودة | Très fort (demandes) | Listing public ; détail parfois login — **adapter implémenté** |
| **ReKrute** | Offres / missions MA | Fort local | Adapter implémenté (filtre freelance) |
| **Marchés publics** | AO IT | Fort (gros tickets) | Adapter + enrichissement détail |
| **Fiverr** | Buyer Requests | Direct freelance | Scraping fragile / CGU — **plus tard**, méthode autorisée |
| **LinkedIn** | Jobs, posts « hiring » | Très fort | API / export manuel avant automatisation |
| **Indeed / JobMaroc** | Offres emploi / contract | Fort | Anti-bot fréquent ; optionnel |

**Cœur produit** : **Mostaql + Khamsat** (besoins clients explicites). Job boards / AO restent des compléments. Fiverr reste hors MVP automatisé.

---

## Pipeline adapté (perso)

```text
Plateforme (Fiverr / LinkedIn / Indeed / JobMaroc / …)
  → Adapter scraper ou API
  → raw_offers (texte + URL + date + plateforme)
  → Extraction structurée :
       titre, description, budget, délai, stack, localisation, type (freelance/ CDI)
  → Classification IT (web / mobile / fullstack / WordPress / …)
  → Score pertinence (match avec TON profil)
  → Contact discovery :
       email / phone / WhatsApp dans l’annonce
       sinon lien « postuler sur la plateforme »
       (pas de scraping agressif de données perso LinkedIn)
  → Génération proposition (template + résumé offre + tes services)
  → Dashboard : liste + actions Email / WhatsApp / Copier message
  → Historique : vu / contacté / répondu / ignoré
```

Pas obligatoire au MVP : enrichissement « entreprise marocaine ICE », signaux presse, OMPIC.

---

## Modèle de données (simplifié)

### `platform_sources`

Nom (Indeed, JobMaroc…), config, actif, fréquence.

### `job_offers` (ou `freelance_opportunities`)

- `platform`, `external_id`, `url`
- `title`, `description_raw`, `description_clean`
- `published_at`, `deadline`, `budget_text`, `location`, `remote`
- `offer_type` : `FREELANCE`, `CONTRACT`, `FULL_TIME`, `BUYER_REQUEST`
- `it_category` : `WEB`, `MOBILE`, `FULLSTACK`, `DEVOPS`, `OTHER`
- `match_score`, `match_reasons[]`
- `status` : `NEW`, `CONTACTED`, `REPLIED`, `WON`, `LOST`, `SKIP`

### `offer_contacts`

- `offer_id`
- `type` : `EMAIL`, `PHONE`, `WHATSAPP`, `PLATFORM_MESSAGE`
- `value` (email, tel E164, URL profil)
- `source` : `IN_POST`, `USER_ADDED`
- `confidence`

### `outreach_messages`

- `offer_id`
- `channel` : `EMAIL`, `WHATSAPP`
- `subject`, `body` (généré + édité par toi)
- `sent_at`, `status`

### `raw_documents`

Comme `docs/` : garder HTML/JSON brut pour reprocess.

---

## Affichage contact

**Afficher seulement** :

- Ce qui est **dans l’annonce publique** ou fourni par **API officielle**.
- Numéro : bouton **WhatsApp** `https://wa.me/<country><number>?text=<message encode>`.

**Ne pas** promettre « tous les emails LinkedIn » sans source légale — UX honnête : « Contacter via LinkedIn » si pas d’email public.

---

## Proposition de service basée sur l’offre

Flux suggéré :

1. **Parser** l’offre : stack (React, WordPress…), type (site, app, bugfix), budget, urgence.
2. **Mapper** vers tes packs (voir [14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md](14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md)).
3. **Générer** un brouillon (règles + templates ; IA optionnelle plus tard) :
   - 1 phrase qui reprend **leur** besoin (preuve que tu as lu)
   - 2–3 bullets **ce que tu livres**
   - 1 CTA (call, devis, délai)
4. **Toi** relis, modifies, envois.

Exemple structure :

```text
Objet : [Their title] — proposition [Ton prénom]

Bonjour,

J’ai vu votre annonce pour [reprise titre] ([plateforme], [date]).
Vous mentionnez [extrait stack/besoin]. Je peux vous proposer :
- ...
- Délai indicatif : ...
- Disponible pour un court échange cette semaine.

Cordialement,
[Ton nom] — [portfolio]
```

---

## Email vs WhatsApp

| Canal | Quand | Implémentation MVP |
| --- | --- | --- |
| **Email** | Email public dans l’offre | `mailto:` ou envoi via SMTP (SendGrid) **après clic « Envoyer »** |
| **WhatsApp** | Tél MA / international dans l’offre | Lien `wa.me` + message pré-rempli ; **pas** d’API WhatsApp Business obligatoire au début |

Éviter l’**envoi automatique massif** (spam, ban, réputation). MVP = **1 clic = 1 envoi validé par toi**.

---

## Scoring (match avec toi)

Poids exemples configurables :

| Critère | Points |
| --- | --- |
| Mot-clé « freelance » / « remote » | +15 |
| Stack que tu maîtrises | +20 |
| Budget mentionné / cohérent | +10 |
| Offre < 48 h | +15 |
| CDI only alors que tu vises freelance | −30 |
| Hors IT | exclude |

---

## Architecture technique (recommandée)

Même esprit que [02-ARCHITECTURE-ET-COMPOSANTS.md](02-ARCHITECTURE-ET-COMPOSANTS.md) :

- **Next.js** : liste offres, détail, éditeur message, boutons contact  
- **NestJS + Prisma + Postgres** : offres, contacts, historique  
- **Workers + queue** : fetch Indeed/JobMaroc/… (1 worker par adapter)  
- **Redis/RabbitMQ** : optionnel dès que plusieurs sources

Adapters :

```text
workers/adapters/
  jobmaroc/
  indeed/
  linkedin/   # API first
  fiverr/
  amazon/     # selon scope
```

---

## Roadmap MVP perso (court)

1. DB + CRUD offres manuelles (test UI messages WhatsApp/email)  
2. **1 scraper** JobMaroc (ou Indeed) + dedup URL  
3. Classification IT + score  
4. Génération message template  
5. Historique outreach  
6. 2e plateforme  
7. LinkedIn / Fiverr via méthode **autorisée**

---

## Risques à connaître (important)

- **CGU** : Fiverr, LinkedIn, Indeed interdisent souvent le scraping non autorisé → privilégier API, alertes email, ou outils conformes.
- **WhatsApp / email mass** : risque spam ; rester manuel/semi-auto.
- **Données perso** : RGPD / loi 09-08 — finalité claire, pas de revente de contacts.

---

## Lien avec le stage (`docs/`)

Le stage = intelligence **entreprises MA** + signaux indirects.  
Ton perso = **offres explicites** + **contact** + **pitch**.  
Tu peux coder **deux apps** ou **un monorepo** avec `apps/scanner-ma` (stage) et `apps/scanner-freelance` (perso) partageant `packages/scraper-core`.

Retour index : **[README.md](README.md)**
