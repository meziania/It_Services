# Hébergement de ServiceIt-scanner

## Déploiement en cours

| Composant | Statut | URL |
| --- | --- | --- |
| Web Next.js | **Déployé** | https://serviceit-scanner.vercel.app |
| API NestJS | **À faire sur Railway** | — |
| PostgreSQL | **À faire sur Railway** | — |

---

## Architecture retenue

| Composant | Hébergeur | Pourquoi |
| --- | --- | --- |
| API NestJS (`apps/api`) | Railway (Docker) | Process long-running : le scheduler `@nestjs/schedule` et les scrapers ont besoin d'un serveur toujours allumé |
| PostgreSQL | Railway (add-on managé) | Même réseau privé que l'API |
| Web Next.js (`apps/web`) | Vercel | Next.js natif, CDN, HTTPS gratuit |

Redis et RabbitMQ sont présents dans `docker/docker-compose.yml` mais ne sont
référencés nulle part dans le code : inutile de les héberger.

L'API **ne peut pas** tourner sur Vercel : les fonctions serverless s'arrêtent
après chaque requête, donc les crons et les scrapes longs ne s'exécuteraient
jamais.

---

## 1. API + base de données sur Railway

1. Créer un compte sur [railway.app](https://railway.app) et cliquer sur
   **New Project → Deploy from GitHub repo**, puis choisir ce dépôt.
2. Railway détecte le `Dockerfile` à la racine et construit l'API
   automatiquement.
3. Dans le projet, **New → Database → PostgreSQL**.
4. Sur le service API, onglet **Variables**, ajouter :

   | Variable | Valeur |
   | --- | --- |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (référence Railway) |
   | `JWT_SECRET` | une valeur aléatoire longue (voir plus bas) |
   | `API_CORS_ORIGIN` | `https://serviceit-scanner.vercel.app` |
   | `NODE_ENV` | `production` |

   `PORT` est injecté automatiquement par Railway, ne pas le définir.

5. Onglet **Settings → Networking → Generate Domain** pour obtenir l'URL
   publique de l'API (ex. `https://serviceit-scanner-api.up.railway.app`).
6. Vérifier : ouvrir `https://<url-api>/health`.

Les migrations Prisma (`prisma migrate deploy`) sont jouées automatiquement au
démarrage du conteneur via le script `start:api`.

### Générer un `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 2. Web sur Vercel

1. Sur [vercel.com](https://vercel.com) : **Add New → Project**, importer le
   dépôt.
2. Laisser le **Root Directory** sur la racine du dépôt : le `vercel.json`
   fourni configure déjà le build du workspace `apps/web`.
3. Variable d'environnement à ajouter :

   | Variable | Valeur |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | l'URL publique de l'API Railway, **sans slash final** |

4. Déployer, puis revenir sur Railway pour mettre `API_CORS_ORIGIN` à jour avec
   le domaine Vercel définitif.

`NEXT_PUBLIC_API_URL` est injectée au moment du build : après l'avoir modifiée,
il faut relancer un déploiement pour qu'elle soit prise en compte.

---

## 3. Compte administrateur

L'inscription se fait via la page `/register` du site déployé. Le premier
compte créé devient administrateur.

---

## Alternative : tout sur un seul VPS

Le `Dockerfile` est autonome, donc n'importe quel hébergeur Docker fonctionne
(Render, Fly.io, Coolify, VPS Hetzner/OVH) :

```bash
docker build -t serviceit-api .
docker run -d -p 3011:3011 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e API_CORS_ORIGIN="https://mon-domaine.com" \
  serviceit-api
```

---

## Variables d'environnement — récapitulatif

### API

| Variable | Requis | Détail |
| --- | --- | --- |
| `DATABASE_URL` | oui | Chaîne de connexion PostgreSQL |
| `JWT_SECRET` | oui | Secret de signature des sessions |
| `API_CORS_ORIGIN` | oui | Origines autorisées, séparées par des virgules |
| `PORT` | non | Fourni par l'hébergeur, défaut `3011` |
| `SMTP_*` | non | Envoi d'emails d'outreach (sprints ultérieurs) |

### Web

| Variable | Requis | Détail |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | oui | URL publique de l'API |
