# Guide de nettoyage Supabase

Ce guide vous aide à alléger votre base Supabase et rester dans le plan gratuit (500 MB database + 1 GB storage).

## ✅ Ce qui a été fait dans le code

- ✅ Mise à jour de `lib/wordpress-compat.ts` pour utiliser `photos[]` au lieu de combiner avec `actor_photo1-5`
- ✅ Le code utilise maintenant uniquement le tableau `photos[]` moderne
- ✅ Les anciennes colonnes WordPress peuvent maintenant être supprimées sans casser le code

## 📋 Étapes à suivre dans Supabase

### **Étape 1 : Vérifier les photos** 🔍

Allez dans **Supabase > SQL Editor**, créez une nouvelle requête, et copiez-collez le contenu de :

📄 `sql/verify_photos_migration.sql`

Puis cliquez sur **Run** pour exécuter.

Cela va vous montrer :
- ✅ Combien de comédiens ont leurs photos dans `photos[]`
- ⚠️ Combien ont SEULEMENT des photos WordPress (risque de perte)

**Si le résultat "SEULEMENT WordPress (risque perte)" = 0, vous pouvez continuer !**

---

### **Étape 2 : Synchroniser profile_picture** 📸

Toujours dans **SQL Editor**, copiez-collez le contenu de :

📄 `sql/force_sync_profile_picture.sql`

Puis cliquez sur **Run** pour exécuter.

Cela va :
- Mettre à jour `profile_picture` pour pointer vers la première photo de `photos[]`
- Forcer la synchronisation pour TOUS les comédiens

---

### **Étape 3 : Supprimer les tables inutilisées** 🗑️

Copiez-collez le contenu de :

📄 `sql/cleanup_unused_tables.sql`

Cela va supprimer :
- ❌ `admin_comments` (API non utilisée)
- ❌ `images` (non utilisée)

**Économie estimée : ~50-100 MB**

---

### **Étape 4 : Supprimer les colonnes WordPress** 🧹

⚠️ **IRRÉVERSIBLE** - Faites une sauvegarde avant !

Copiez-collez le contenu de :

📄 `sql/cleanup_wordpress_photos.sql`

Cela va supprimer les colonnes WordPress de photos :
- Photos : `actor_photo1-5`, `actor_photo_1`

**Économie estimée : ~10-50 MB**

---

## 📊 Vérifier l'économie réalisée

Après nettoyage, exécutez dans **SQL Editor** :

📄 `sql/check_database_size.sql`

Cela affichera :
- 📏 Taille de chaque table
- 📈 Nombre de lignes
- 💾 Utilisation totale

---

## ⚠️ Important

### **Tables à GARDER** (ne PAS supprimer) :
- ✅ `comediens` - Table principale
- ✅ `films` - Carousel et collaborations
- ✅ `user_profiles` - Rôles (admin/comedien)

### **Bucket Storage à GARDER** :
- ✅ `comedien-photos` - Stocke les nouvelles photos

### **Tables supprimées** :
- ❌ `admin_comments` - Non utilisée
- ❌ `images` - Non utilisée

---

## 🔄 Si vous voulez annuler

Si vous avez fait une erreur, vous pouvez restaurer depuis :
- Supabase Dashboard > Settings > Backups
- Les backups quotidiens sont conservés 7 jours (plan gratuit)

---

## 📈 Résultat attendu

**Avant nettoyage :**
- Database : ~200-300 MB (avec colonnes WordPress)
- Storage : Variable selon les photos

**Après nettoyage :**
- Database : ~100-200 MB (colonnes WordPress supprimées)
- Storage : Inchangé (les photos restent)

**Total économisé : ~60-150 MB de database** 🎉

---

## 🚀 Prochaines étapes (optionnel)

Si vous approchez encore de la limite, vous pouvez :

1. **Compresser les images** dans le bucket `comedien-photos`
2. **Limiter le nombre de photos** par comédien (ex: max 3-5)
3. **Archiver** les comédiens inactifs

---

**Questions ?** Vérifiez d'abord avec les scripts de vérification avant de supprimer quoi que ce soit !
