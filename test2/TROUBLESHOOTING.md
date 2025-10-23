# 🔧 Guide de Résolution des Erreurs - Plateforme ADK

## ✅ **Problèmes résolus**

### 1. Erreur Next.js : Invalid `<Link>` with `<a>` child
**Problème** : Erreur dans `/pages/connexion.tsx`
**Solution** : ✅ Corrigé - suppression des balises `<a>` dans les composants `<Link>`

### 2. Erreur Base de données : "Could not find the 'age' column"
**Problème** : La table `comediens` dans Supabase manque des colonnes
**Solution** : ✅ Code simplifié + script de migration fourni

---

## 🌐 **Application maintenant disponible sur :**
**URL** : http://localhost:3002

### 📍 **Pages fonctionnelles :**
- ✅ **Accueil** : http://localhost:3002
- ✅ **Inscription** : http://localhost:3002/inscription  
- ✅ **Connexion** : http://localhost:3002/connexion
- ✅ **Dashboard** : http://localhost:3002/dashboard
- ✅ **Comédiens** : http://localhost:3002/comediens

---

## 📋 **Pour tester l'inscription :**

### Étape 1 : Aller sur l'inscription
- **URL directe** : http://localhost:3002/inscription
- **Ou depuis l'accueil** : Bouton "Devenir comédien"
- **Ou depuis le header** : Bouton "S'inscrire"

### Étape 2 : Remplir le formulaire
```
📧 Email: test@exemple.com
🔒 Mot de passe: monmotdepasse123
👤 Prénom: Jean
👤 Nom: Dupont
📱 Téléphone: 0123456789
🏠 Domiciliation: Paris
📅 Date naissance: 1990-05-15
⚥ Genre: Masculin
🌍 Nationalité: Française
🏙️ Ville: Paris
📏 Taille: 175
💇 Cheveux: Brun
👁️ Yeux: Marron
🌍 Origine: Caucasien
🏃 Corpulence: Mince
🎭 Expérience: Débutant
🗣️ Langue: Français
```

### Étape 3 : Si erreur de base de données
**Exécuter dans Supabase SQL Editor :**

```sql
-- 1. Ajouter les colonnes manquantes
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Créer la table admin_comments
CREATE TABLE IF NOT EXISTS admin_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comedien_id UUID REFERENCES comediens(id) ON DELETE CASCADE,
  admin_id TEXT,
  admin_name TEXT NOT NULL DEFAULT 'Admin',
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 **Comptes de test disponibles :**

### Admin
```
Email: admin@adk.com
Password: admin123
Accès: Dashboard de validation
```

### Comédien validé  
```
Email: marie@comedienne.com
Password: password123
Statut: Compte actif
```

---

## 🔍 **Diagnostic des erreurs courantes :**

### Si l'inscription ne fonctionne toujours pas :

1. **Vérifier la console du navigateur** (F12)
   - Chercher les erreurs JavaScript
   - Noter les erreurs de réseau (onglet Network)

2. **Vérifier les logs du serveur**
   - Regarder le terminal où tourne `npm run dev`
   - Noter les erreurs d'API

3. **Vérifier Supabase**
   - S'assurer que les tables existent
   - Vérifier la configuration de connexion

### Si la connexion échoue :
1. **Tester avec les comptes fournis**
2. **Vérifier que Supabase est configuré**
3. **S'assurer que les tables existent**

---

## 📁 **Fichiers modifiés récemment :**

- ✅ `/pages/connexion.tsx` - Liens Next.js corrigés
- ✅ `/pages/api/auth/register.ts` - Colonnes simplifiées
- ✅ `/components/Header.tsx` - Boutons inscription/connexion ajoutés
- ✅ `/pages/index.tsx` - Bouton "Devenir comédien" ajouté
- ✅ `/sql/migration.sql` - Script de migration créé

---

## 🚀 **Prochaines étapes si tout fonctionne :**

1. ✅ Tester l'inscription avec vos données
2. ✅ Se connecter en admin pour valider
3. ✅ Tester la connexion comédien
4. ✅ Ajouter des commentaires admin
5. 📧 Configurer l'envoi d'emails
6. 🎨 Personnaliser le design

---

## 📞 **Si vous avez encore des erreurs :**

1. **Partagez-moi** :
   - Les messages d'erreur exacts de la console
   - Les logs du terminal Next.js 
   - Captures d'écran si utile

2. **Je peux** :
   - Debugger le problème spécifique
   - Créer des solutions alternatives
   - Simplifier l'implémentation

L'application est maintenant beaucoup plus stable ! 🎉