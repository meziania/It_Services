# Hébergement de ServiceIt-scanner

## Architecture recommandée (Neon + Vercel + API Docker)

| Composant | Hébergeur | Coût |
| --- | --- | --- |
| Web Next.js (`apps/web`) | **Vercel** | Gratuit |
| PostgreSQL | **Neon** | Gratuit (0,5 GB) |
| API NestJS (`apps/api`) | **Render / Railway / Fly.io** | Gratuit (limité) ou ~5 $/mois |

L'API **ne peut pas** tourner sur Vercel : les fonctions serverless s'arrêtent
après chaque requête, donc les crons et les scrapes longs ne s'exécuteraient
jamais.

Redis et RabbitMQ sont dans `docker/docker-compose.yml` mais ne sont pas
utilisés par le code : inutile de les héberger.

---

## Déploiement en cours

| Composant | Statut | URL |
| --- | --- | --- |
| Web Next.js | Déployé sur Vercel | https://serviceit-scanner.vercel.app |
| PostgreSQL | À configurer sur Neon | — |
| API NestJS | À déployer (Render / Railway) | — |

---

## 1. Base de données sur Neon

1. Créer un projet sur [neon.tech](https://neon.tech).
2. Créer une base `serviceit_scanner`.
3. Copier les deux URLs depuis le dashboard Neon :

   | Variable | URL Neon |
   | --- | --- |
   | `DATABASE_URL` | **Pooled connection** (avec `-pooler` dans le host) |
   | `DIRECT_DATABASE_URL` | **Direct connection** (sans pooler) |

   Ajouter `?sslmode=require` si absent.

4. Appliquer les migrations en local (une seule fois) :

   ```bash
   # Coller les URLs Neon dans packages/database/.env puis :
   npm run prisma:deploy
   ```

---

## 2. API sur Render (gratuit, blueprint fourni)

1. Aller sur [render.com](https://render.com) → **New → Blueprint**.
2. Connecter le dépôt GitHub `meziania/It_Services`.
3. Render lit `render.yaml` et crée le service Docker.
4. Dans **Environment**, renseigner :

   | Variable | Valeur |
   | --- | --- |
   | `DATABASE_URL` | URL pooled Neon |
   | `DIRECT_DATABASE_URL` | URL directe Neon |
   | `JWT_SECRET` | secret aléatoire (voir ci-dessous) |
   | `API_CORS_ORIGIN` | `https://serviceit-scanner.vercel.app` |

5. Une fois déployé, noter l'URL publique (ex. `https://serviceit-scanner-api.onrender.com`).
6. Vérifier : `https://<url-api>/health`.

> **Limitation du plan gratuit Render** : le service s'endort après ~15 min
> d'inactivité. Les scrapers automatiques ne tourneront pas en continu.
> Pour du 24/7, utiliser Railway (~5 $/mois) ou Oracle Cloud Always Free.

### Alternative : Railway

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub**.
2. Railway détecte le `Dockerfile` à la racine.
3. Variables identiques à Render (Neon URLs + JWT + CORS).
4. **Settings → Networking → Generate Domain**.

Les migrations Prisma (`prisma migrate deploy`) sont jouées au démarrage via
`npm run start:api`.

### Générer un `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 3. Web sur Vercel

Projet déjà lié : `serviceit-scanner`.

1. Variable d'environnement **obligatoire** :

   | Variable | Valeur |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | URL publique de l'API, **sans slash final** |

2. Redéployer après avoir ajouté la variable (elle est injectée au build).

   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel --prod
   ```

3. Mettre à jour `API_CORS_ORIGIN` sur l'API avec le domaine Vercel définitif.

---

## 4. Compte administrateur

L'inscription se fait via `/register` sur le site déployé. Le premier compte
créé devient administrateur.

---

## Variables d'environnement — récapitulatif

### API

| Variable | Requis | Détail |
| --- | --- | --- |
| `DATABASE_URL` | oui | URL pooled PostgreSQL (Neon) |
| `DIRECT_DATABASE_URL` | oui | URL directe pour les migrations Prisma |
| `JWT_SECRET` | oui | Secret de signature des sessions |
| `API_CORS_ORIGIN` | oui | Origines autorisées, séparées par des virgules |
| `PORT` | non | Fourni par l'hébergeur, défaut `3011` |

### Web (Vercel)

| Variable | Requis | Détail |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | oui | URL publique de l'API |

---

## Test local Docker (optionnel)

```bash
docker build -t serviceit-api .
docker run -d -p 3011:3011 \
  -e DATABASE_URL="postgresql://..." \
  -e DIRECT_DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e API_CORS_ORIGIN="http://localhost:3020" \
  serviceit-api
```
