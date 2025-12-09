# Guide de Déploiement VPS - ADK-KASTING

## Prérequis sur votre VPS

Votre VPS doit avoir :
- **Ubuntu 20.04+** ou **Debian 11+**
- **Node.js 20+** (recommandé, minimum 18)
- **npm** ou **pnpm**
- **PM2** (pour gérer l'application)
- **Nginx** (reverse proxy)
- **Git**
- Accès root ou sudo

---

## 1. Connexion au VPS

```bash
ssh root@147.79.101.169
```

---

## 2. Installation des dépendances

### Node.js 20 (recommandé)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### PM2 (gestionnaire de processus)
```bash
sudo npm install -g pm2
```

### Nginx (si pas déjà installé)
```bash
sudo apt update
sudo apt install -y nginx
```

---

## 3. Configuration du projet

### A. Cloner le repository
```bash
cd /var/www  # ou votre dossier préféré
sudo git clone https://github.com/BaptisteM44/adk-kasting.git
sudo chown -R $USER:$USER adk-kasting
cd adk-kasting/test2
```

### B. Installer les dépendances
```bash
npm install --production
```

### C. Créer le fichier `.env.local`
```bash
nano .env.local
```

Copier-coller votre configuration (même que en local) :
```env
NEXT_PUBLIC_SUPABASE_URL=https://mhkrjhxpqovmawlhvarn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa3JqaHhwcW92bWF3bGh2YXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTQ0MzYsImV4cCI6MjA2NzU3MDQzNn0.PdkckuT7ik7GJ9d7eY9owsgxewO0d0Yszc58T8lMTiA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa3JqaHhwcW92bWF3bGh2YXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTk5NDQzNiwiZXhwIjoyMDY3NTcwNDM2fQ.NV332aBzD_jfL-cVprO93mRagSy2zNSLY3l9DK3sfXk

# URL du site en production
NEXT_PUBLIC_SITE_URL=https://adk-kasting.com/

# SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=michael@adk-kasting.com
SMTP_PASSWORD=Easyrider2019$$
EMAIL_FROM=michael@adk-kasting.com
ADMIN_EMAIL=michael@adk-kasting.com
```

**⚠️ IMPORTANT** : Changez `NEXT_PUBLIC_SITE_URL` avec votre vrai nom de domaine !

### D. Build de production
```bash
npm run build
```

---

## 4. Configuration PM2

### Créer le fichier PM2 ecosystem
```bash
nano ecosystem.config.js
```

Contenu :
```javascript
module.exports = {
  apps: [{
    name: 'adk-kasting',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/adk-kasting/test2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Démarrer l'application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Copier-coller la commande générée
```

### Commandes PM2 utiles
```bash
pm2 status          # Voir le statut
pm2 logs adk-kasting  # Voir les logs
pm2 restart adk-kasting  # Redémarrer
pm2 stop adk-kasting     # Arrêter
pm2 delete adk-kasting   # Supprimer
```

---

## 5. Configuration Nginx

### Créer le fichier de configuration
```bash
sudo nano /etc/nginx/sites-available/adk-kasting
```

Contenu :
```nginx
server {
    listen 80;
    server_name adk-kasting.com www.adk-kasting.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/adk-kasting /etc/nginx/sites-enabled/
sudo nginx -t  # Tester la configuration
sudo systemctl restart nginx
```

---

## 6. Configuration SSL avec Let's Encrypt (HTTPS)

### Installer Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Générer le certificat SSL
```bash
sudo certbot --nginx -d adk-kasting.com -d www.adk-kasting.com
```

Suivez les instructions. Certbot va automatiquement :
- Générer le certificat SSL
- Modifier la config Nginx pour activer HTTPS
- Configurer le renouvellement automatique

### Tester le renouvellement automatique
```bash
sudo certbot renew --dry-run
```

---

## 7. Configuration DNS

Dans votre registrar (OVH, Gandi, etc.), ajoutez ces enregistrements DNS :

```
Type    Nom                  Valeur
A       votre-domaine.com    IP_DE_VOTRE_VPS
A       www                  IP_DE_VOTRE_VPS
```

Attendre 5-30 minutes pour la propagation DNS.

---

## 8. Vérification finale

### Tester l'application
```bash
curl http://localhost:3000  # Devrait retourner du HTML
```

### Tester Nginx
```bash
curl https://adk-kasting.com/  # Devrait retourner votre site
```

### Vérifier les logs
```bash
pm2 logs adk-kasting
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 9. Mises à jour futures

Quand vous faites des changements :

```bash
cd /var/www/adk-kasting/test2
git pull origin main
npm install  # Si nouvelles dépendances
npm run build
pm2 restart adk-kasting
```

---

## 10. Sécurité (optionnel mais recommandé)

### Firewall UFW
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban (protection contre brute force)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Dépannage

### L'application ne démarre pas
```bash
pm2 logs adk-kasting  # Voir les erreurs
```

### Port 3000 déjà utilisé
```bash
sudo lsof -i :3000  # Voir quel process utilise le port
sudo kill -9 PID    # Tuer le process
```

### Problème Nginx
```bash
sudo nginx -t  # Tester la config
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Espace disque plein
```bash
df -h  # Voir l'espace disponible
pm2 flush  # Vider les logs PM2
```

---

## Structure finale sur le VPS

```
/var/www/adk-kasting/
├── test2/
│   ├── .next/          # Build Next.js
│   ├── node_modules/   # Dépendances
│   ├── pages/
│   ├── components/
│   ├── .env.local      # Variables d'env (IMPORTANT!)
│   ├── package.json
│   └── ecosystem.config.js
└── .git/
```

---

## Checklist de déploiement

- [ ] VPS avec Ubuntu/Debian
- [ ] Node.js 20+ installé
- [ ] PM2 installé
- [ ] Nginx installé
- [ ] Projet cloné
- [ ] `.env.local` créé avec bonnes valeurs
- [ ] `npm install` exécuté
- [ ] `npm run build` réussi
- [ ] PM2 configuré et démarré
- [ ] Nginx configuré
- [ ] DNS configurés (A records)
- [ ] SSL Let's Encrypt activé
- [ ] Site accessible via HTTPS
- [ ] Emails de reset password testés

---

## Support

Si vous avez des problèmes :
1. Vérifier les logs PM2 : `pm2 logs`
2. Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Tester la connexion Supabase
4. Vérifier la configuration DNS
