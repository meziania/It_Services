# Hébergement de ServiceIt-scanner

## Architecture recommandée (gratuit)

| Composant | Hébergeur | Coût |
| --- | --- | --- |
| Web Next.js (`apps/web`) | **Vercel** | Gratuit |
| PostgreSQL | **Neon** | Gratuit (0,5 GB) |
| API NestJS (`apps/api`) | **Fly.io** | Gratuit (limité, always-on possible) |

L'API **ne peut pas** tourner sur Vercel : scrapers + cron ont besoin d'un
processus long-running.

---

## 1. Base de données Neon

Déjà configurée. Variables :

| Variable | URL Neon |
| --- | --- |
| `DATABASE_URL` | **Pooled** (host avec `-pooler`) |
| `DIRECT_DATABASE_URL` | **Direct** (sans `-pooler`) — optionnel, dérivé auto au boot |

---

## 2. API sur Fly.io (recommandé)

Le fichier `fly.toml` est prêt à la racine du dépôt.

### Installation CLI (Windows)

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
$env:Path += ";$env:USERPROFILE\.fly\bin"
fly auth login
```

### Premier déploiement

```powershell
cd C:\Users\Abderrahmane MEZIANI\Desktop\ServiceIt-scanner
fly launch --no-deploy --copy-config --yes
fly secrets set `
  DATABASE_URL="postgresql://...@...-pooler.../neondb?sslmode=require" `
  JWT_SECRET="votre-secret-long" `
  API_CORS_ORIGIN="https://serviceit-scanner.vercel.app"
fly deploy
```

URL de l'API : `https://serviceit-scanner-api.fly.dev`

Vérifier : `https://serviceit-scanner-api.fly.dev/health`

### Générer un JWT_SECRET

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 3. Web sur Vercel

Variable **obligatoire** :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL Fly.io, **sans slash final** |

```powershell
vercel env add NEXT_PUBLIC_API_URL production
# Coller : https://serviceit-scanner-api.fly.dev
vercel --prod
```

---

## 4. Compte administrateur

Pas d'inscription publique. Créer un admin en local :

```powershell
$env:DATABASE_URL="postgresql://...neon...?sslmode=require"
node packages/database/scripts/seed-admin.js
```

Identifiants par défaut du script :

- Email : `admin@serviceit-scanner.app`
- Mot de passe : `ServiceIt2026!`

Personnaliser :

```powershell
$env:ADMIN_EMAIL="votre@email.com"
$env:ADMIN_PASSWORD="VotreMotDePasse!"
node packages/database/scripts/seed-admin.js
```

---

## Alternative temporaire : API en local + tunnel

Si Fly.io n'est pas encore configuré, tu peux tester avec l'API sur ton PC :

```powershell
# Terminal 1 — API (Neon dans .env ou variables)
npm run start:api

# Terminal 2 — tunnel public gratuit
npx localtunnel --port 3011
```

Copie l'URL du tunnel dans `NEXT_PUBLIC_API_URL` sur Vercel, puis `vercel --prod`.

Limitation : l'API n'est en ligne que quand ton PC tourne.

---

## Variables d'environnement — récapitulatif

### API (Fly.io secrets)

| Variable | Requis |
| --- | --- |
| `DATABASE_URL` | oui |
| `JWT_SECRET` | oui |
| `API_CORS_ORIGIN` | oui |
| `PORT` | non (Fly injecte 3011 via fly.toml) |

### Web (Vercel)

| Variable | Requis |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | oui |
