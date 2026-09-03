# Déploiement API sur Oracle Cloud Always Free

Architecture :

| Composant | Où |
| --- | --- |
| Web | Vercel (déjà fait) |
| DB | Neon (déjà fait) |
| API | **Oracle Cloud VM** (Docker) |

---

## Étape 1 — Créer le compte Oracle Cloud (toi, navigateur)

1. Va sur : https://www.oracle.com/cloud/free/
2. Clique **Start for free**
3. Choisis une région (ex. **Frankfurt** `eu-frankfurt-1` ou **Amsterdam**)
4. Remplis le formulaire (email, pays, **carte** pour vérification — Oracle ne facture pas le Always Free si tu restes dans les limites)
5. Attends l'activation du compte (parfois quelques minutes / heures)

> Si le compte reste en "Pending", vérifie ton email Oracle.

---

## Étape 2 — Créer une VM Always Free (ARM Ampere)

1. Dashboard OCI → **Compute → Instances → Create instance**
2. Nom : `serviceit-api`
3. **Image** : Canonical Ubuntu 22.04 (ou Oracle Linux 8)
4. **Shape** : **VM.Standard.A1.Flex** (Ampere ARM)  
   - OCPUs : `1`  
   - Memory : `6 GB` (ou 4 GB si limite atteinte)
5. **Networking** : laisse le VCN par défaut, coche **Assign a public IPv4 address**
6. **SSH keys** :  
   - Soit **Generate a key pair** (télécharge la clé privée)  
   - Soit colle ta clé publique Windows
7. **Create**

### Ouvrir le port 3011 (firewall OCI)

1. Instance → **Subnet** → **Security List** → **Add Ingress Rules**
2. Source : `0.0.0.0/0`
3. Destination port : `3011`
4. Protocol : TCP

### Firewall Ubuntu (sur la VM)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 3011/tcp
sudo ufw enable
```

---

## Étape 3 — Générer une clé SSH sur Windows (si besoin)

Dans PowerShell :

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\oracle_serviceit -N '""'
Get-Content $env:USERPROFILE\.ssh\oracle_serviceit.pub
```

Colle le contenu `.pub` dans Oracle au moment de créer l'instance.

---

## Étape 4 — Connexion SSH

```powershell
# Remplace IP et user (ubuntu ou opc selon l'image)
ssh -i $env:USERPROFILE\.ssh\oracle_serviceit ubuntu@IP_PUBLIQUE
```

---

## Étape 5 — Installer Docker sur la VM

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER
# Déconnecte-toi / reconnecte-toi pour que le groupe docker s'applique
```

---

## Étape 6 — Déployer l'API

Sur la VM :

```bash
git clone https://github.com/meziania/It_Services.git
cd It_Services

# Créer le fichier d'environnement (NE PAS committer)
cat > .env.production <<'EOF'
DATABASE_URL=postgresql://neondb_owner:MOT_DE_PASSE@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=is8WEAZeHI61uejurV4uFIistgeJByLa-Syz0fq1hYQoOZZmsQAwuNfOuFGq1Foc
API_CORS_ORIGIN=https://serviceit-scanner.vercel.app
NODE_ENV=production
PORT=3011
EOF

docker build -t serviceit-api .
docker run -d --name serviceit-api --restart unless-stopped \
  -p 3011:3011 --env-file .env.production \
  serviceit-api
```

Vérifier :

```bash
curl http://127.0.0.1:3011/health
# puis depuis ton PC :
# http://IP_PUBLIQUE:3011/health
```

---

## Étape 7 — Relier Vercel

```powershell
vercel env rm NEXT_PUBLIC_API_URL production --yes
echo "http://IP_PUBLIQUE:3011" | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod
```

(Plus tard : domaine HTTPS avec Caddy/Nginx + Let's Encrypt.)

---

## Identifiants app

| | |
| --- | --- |
| Login | https://serviceit-scanner.vercel.app/login |
| Email | `admin@serviceit-scanner.app` |
| Mot de passe | `ServiceIt2026!` |

---

## Astuces Always Free

- Laisse la VM **active** (sinon Oracle peut la récupérer après inactivité prolongée)
- Shape **A1.Flex ARM** = le plus généreux en gratuit
- Si "Out of capacity" dans une région, essaie une autre région Always Free
