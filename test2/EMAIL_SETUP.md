# Configuration des emails ADK-KASTING

## 📧 Système d'emails implémenté

Le système envoie automatiquement 3 types d'emails :

1. **Email de bienvenue** au comédien (après inscription)
2. **Email de notification** aux admins (nouvelle inscription)
3. **Email de réinitialisation** de mot de passe

---

## 🔧 Configuration

### Option 1 : SMTP Hostinger (Production - Recommandé)

Lorsque tu auras accès au compte Hostinger, ajoute ces variables dans `.env.local` :

```env
# SMTP Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@adk-kasting.com
SMTP_PASSWORD=ton_mot_de_passe_email_hostinger

# Adresses
EMAIL_FROM=info@adk-kasting.com
ADMIN_EMAIL=admin@adk-kasting.com

# URL du site (pour les liens dans les emails)
NEXT_PUBLIC_SITE_URL=https://adk-kasting.com
```

**Comment obtenir ces infos depuis Hostinger :**
1. Connecte-toi à ton compte Hostinger
2. Va dans "Emails" > "Gestion des emails"
3. Les paramètres SMTP sont disponibles dans les paramètres du compte email
4. `SMTP_HOST` est généralement `smtp.hostinger.com` ou similaire
5. `SMTP_USER` est ton adresse email complète (ex: `info@adk-kasting.com`)
6. `SMTP_PASSWORD` est le mot de passe de ce compte email

---

### Option 2 : Resend (Tests - Gratuit)

Pour tester immédiatement sans attendre Hostinger :

1. Crée un compte gratuit sur [Resend](https://resend.com) (100 emails/jour gratuit)
2. Obtiens ta clé API
3. Ajoute dans `.env.local` :

```env
# Resend API (pour tests)
RESEND_API_KEY=re_ta_cle_api_ici

# Adresses
EMAIL_FROM=onboarding@resend.dev  # Email de test Resend
ADMIN_EMAIL=ton_email@gmail.com   # Pour recevoir les tests

# URL du site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note :** Avec Resend gratuit, tu ne peux envoyer qu'à ton email vérifié. Parfait pour tester !

---

## 🧪 Tester les emails

### Test en mode développement

Le système détecte automatiquement si la configuration email n'est pas disponible et :
- Log les emails dans la console au lieu de les envoyer
- Ne bloque pas l'inscription si l'email échoue

### Pour tester l'inscription :
1. Va sur `/inscription`
2. Remplis le formulaire
3. Vérifie dans la console du serveur :
   - `✅ Email envoyé` si configuré
   - `📧 Email non envoyé (pas de config)` sinon

### Pour tester la réinitialisation de mot de passe :
1. Va sur `/reset-password`
2. Entre un email
3. En mode dev, le lien de réinitialisation s'affiche dans la réponse API

---

## 📝 Contenu des emails

Les emails sont en **texte simple** (pas de HTML compliqué) :

### Email de bienvenue
```
Sujet : Bienvenue sur ADK-KASTING !

Bonjour [Prénom],

Merci de vous être inscrit(e) sur ADK-KASTING.

Votre profil est actuellement en attente de validation...
```

### Email notification admin
```
Sujet : Nouvelle inscription - [Nom Prénom]

Une nouvelle inscription nécessite votre validation :

Nom : [...]
Email : [...]
Lien dashboard : [...]
```

### Email réinitialisation
```
Sujet : Réinitialisation de votre mot de passe

Bonjour,

Cliquez sur ce lien pour créer un nouveau mot de passe :
[Lien sécurisé]

Ce lien expire dans 1 heure.
```

---

## ⚙️ Personnalisation

Pour modifier les textes des emails, édite le fichier : `/lib/email.ts`

Fonctions disponibles :
- `sendWelcomeEmail(comedien)` - Bienvenue
- `sendAdminNotificationEmail(comedien)` - Notification admin
- `sendPasswordResetEmail(email, token, link)` - Reset password
- `sendProfileApprovedEmail(comedien)` - Profil validé (bonus, pas encore utilisé)

---

## 🚨 Dépannage

### Les emails ne sont pas envoyés

1. **Vérifie la console** - Des logs indiquent le statut
2. **Vérifie `.env.local`** - Les variables sont bien définies ?
3. **SMTP Hostinger** - Le compte email existe ? Mot de passe correct ?
4. **Firewall** - Le port 465 est ouvert ?

### Erreur "Authentication failed"

- Vérifie `SMTP_USER` (doit être l'email complet)
- Vérifie `SMTP_PASSWORD` (mot de passe du compte email)
- Certains hébergeurs nécessitent d'activer "SMTP" dans les paramètres

### Les emails vont en spam

- Configure SPF, DKIM et DMARC chez Hostinger
- Utilise une adresse FROM qui existe vraiment (`info@adk-kasting.com`)
- Évite les mots "spam" dans les sujets

---

## 📊 Monitoring

En production, surveille :
- Les logs de `console.log` pour les emails envoyés
- Les erreurs `console.error` pour les échecs
- Le quota de ton service email (Hostinger ou Resend)

---

## 🔒 Sécurité

- ✅ Les mots de passe ne sont **jamais** envoyés par email
- ✅ Les tokens de reset expirent après 1 heure
- ✅ Les échecs d'email ne bloquent pas l'inscription
- ✅ Les adresses email sont normalisées (lowercase)

---

**Besoin d'aide ?** Contacte-moi ou consulte la doc Hostinger pour le SMTP.
