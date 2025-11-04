# Mapping complet : Page Profil ↔ Base de données

## 📊 Analyse complète des champs affichés

### ✅ Champs affichés correctement (avec données WordPress)

| Champ affiché | Variable utilisée | Colonne BDD | Type BDD | Données? |
|---------------|-------------------|-------------|----------|----------|
| **Nom complet** | `first_name`, `last_name` | `first_name`, `last_name` | TEXT | ✅ Oui |
| **Âge** | Calculé depuis `birth_date` | `birth_date` | DATE | ✅ Oui |
| **Photos** | `photos_normalized` | `actor_photo1-5` | TEXT (URLs) | ✅ Oui |
| **Email** | `email` | `email` | TEXT | ✅ Oui |
| **Téléphone** | `phone` | `phone` | TEXT | ✅ Oui |
| **Téléphone fixe** | `phone_fixe` | `phone_fixe` | TEXT | ⚠️ Partial |
| **Nationalité** | `nationality` | `nationality` | TEXT | ✅ Oui |
| **Genre** | `gender` | `gender` | TEXT | ✅ Oui |
| **Type (ethnicity)** | `ethnicity` | `ethnicity` | TEXT | ✅ Oui |
| **Corpulence** | `build` | `build` | TEXT | ✅ Oui |
| **Taille** | `height` | `height` | INTEGER | ✅ Oui |
| **Cheveux** | `hair_color` | `hair_color` | TEXT | ✅ Oui |
| **Yeux** | `eye_color` | `eye_color` | TEXT | ✅ Oui |
| **Adresse (street)** | `street` | `street` | TEXT | ⚠️ Partial |
| **Code postal** | `zip_code` | `zip_code` | TEXT | ⚠️ Partial |
| **Ville** | `city` | `city` | TEXT | ✅ Oui |
| **Pays** | `country` | `country` | TEXT | ⚠️ Partial |
| **Domiciliation** | `domiciliation` | `domiciliation` | TEXT | ⚠️ Partial |
| **Showreel** | `showreel_url` | `showreel_url` | TEXT | ⚠️ Partial |
| **Vidéo 1** | `video_1_url` | `video_1_url` | TEXT | ⚠️ Partial |
| **Vidéo 2** | `video_2_url` | `video_2_url` | TEXT | ⚠️ Partial |
| **Site web** | `website_url` | `website_url` | TEXT | ⚠️ Partial |
| **Facebook** | `facebook_url` | `facebook_url` | TEXT | ⚠️ Partial |
| **IMDb** | `imdb_url` | `imdb_url` | TEXT | ⚠️ Partial |
| **LinkedIn** | `linkedin_url` | `linkedin_url` | TEXT | ⚠️ Partial |
| **Instagram** | `instagram_url` | `instagram_url` | TEXT | ⚠️ Partial |
| **Autre profil** | `other_profile_url` | `other_profile_url` | TEXT | ⚠️ Partial |
| **Niveau expérience** | `experience_level` | `experience_level` | TEXT | ✅ Oui (6952) |
| **CV PDF** | `cv_pdf_url` | `cv_pdf_url` | TEXT | ⚠️ Partial |
| **Autor. parentale** | `parental_authorization_url` | `parental_authorization_url` | TEXT | ⚠️ Rare |

### ⚠️ Champs avec données normalisées (WordPress → Conversion)

| Champ affiché | Variable utilisée | Colonne BDD WordPress | Normalisation |
|---------------|-------------------|----------------------|---------------|
| **Langues (tous)** | `languages_fluent_normalized`, `languages_notions_normalized` | `actor_languages_native`, `actor_languages_notions` | ✅ `phpUnserialize()` |
| **Langue maternelle** | `native_language_normalized` | `actor_languages_native` | ✅ Premier élément |
| **Domaine d'activité** | `desired_activities_normalized` | `wp_activity_domain` | ✅ `phpUnserialize()` |
| **Permis de conduire** | `driving_licenses_normalized` | `actor_driving_license` | ✅ `phpUnserialize()` |
| **Danse** | `dance_skills_normalized` | `actor_dance_skills` | ✅ `phpUnserialize()` |
| **Musique** | `music_skills_normalized` | `actor_music_skills` | ✅ `phpUnserialize()` |
| **Compétences diverses** | `diverse_skills_normalized` | `wp_skills` | ✅ `phpUnserialize()` |

### 🔴 Champs affichés MAIS utilisant des colonnes VIDES

| Champ affiché | Variable | Colonne utilisée | Devrait utiliser | Données? |
|---------------|----------|------------------|------------------|----------|
| **Compétences** (ligne 1367) | `diverse_skills_normalized` | `diverse_skills` (array) | `wp_skills` (TEXT PHP) | ❌ 0 vs ✅ 4942 |
| **Permis** (ligne 1298) | `driving_licenses_normalized` | `driving_licenses` (array) | `actor_driving_license` (TEXT PHP) | ❌ 0 vs ✅ 4107 |
| **Langues** (toutes lignes) | `languages_fluent_normalized`, etc. | `languages`, `languages_fluent` (arrays) | `actor_languages_native`, `actor_languages_notions` (TEXT PHP) | ❌ 0 vs ✅ 7667 |
| **Danse** (ligne 1321) | `dance_skills_normalized` | `dance_skills` (array) | `actor_dance_skills` (TEXT PHP) | ❌ 0 vs ✅ ??? |
| **Musique** (ligne 1344) | `music_skills_normalized` | `music_skills` (array) | `actor_music_skills` (TEXT PHP) | ❌ 0 vs ✅ ??? |

### 🟡 Champs WordPress affichés via fallback

| Section | Code (ligne) | Colonnes testées | Notes |
|---------|--------------|------------------|-------|
| **Expérience** | 1605-1621 | `professional_experience` \|\| `experience` \|\| `wp_experience` | ✅ Fallback correct |
| **Formations** | 1625-1641 | `training_diplomas` \|\| `certificates` | ✅ Fallback correct |
| **CV** | 524 | `cv_pdf_url` \|\| `actor_resume` | ✅ Fallback correct |

### 🔍 Colonnes WordPress importantes ABSENTES de la page

| Colonne WordPress | Description | Contient données? | Pourquoi absente? |
|-------------------|-------------|-------------------|-------------------|
| `actor_resume` | CV complet (texte long) | ✅ Oui | Utilisé comme fallback pour CV PDF |
| `wp_experience` | Expérience WordPress | ✅ Oui (4985) | Utilisé comme fallback |
| `actor_nationality` | Nationalité WordPress | ⚠️ À vérifier | Doublon avec `nationality`? |
| `actor_agency_name` | Agence WordPress | ⚠️ À vérifier | Devrait remplacer `agency_name`? |
| `actor_agent_name` | Agent WordPress | ⚠️ À vérifier | Devrait remplacer `agent_name`? |

---

## 🚨 PROBLÈMES CRITIQUES identifiés

### Problème 1 : La fonction `normalizeComedienData` ne marche pas correctement

**Ligne 62 du code** :
```typescript
const normalized = normalizeComedienData(data)
```

Cette fonction est censée désérialiser les données PHP, MAIS :
- ❌ Les variables `*_normalized` sont utilisées partout
- ❌ Ces variables viennent de colonnes VIDES (`diverse_skills`, `languages`, etc.)
- ❌ Les vraies données WordPress ne sont PAS utilisées

**Vérification nécessaire** : Regarder `lib/wordpress-compat.ts` pour voir ce que fait `normalizeComedienData()`.

### Problème 2 : Édition de profil utilise les mauvaises colonnes

**Lignes 120-182** : La sauvegarde utilise :
```typescript
diverse_skills: formData.diverse_skills,          // ❌ Colonne VIDE
driving_licenses: formData.driving_licenses,      // ❌ Colonne VIDE
dance_skills: formData.dance_skills,              // ❌ Colonne VIDE
music_skills: formData.music_skills,              // ❌ Colonne VIDE
languages_fluent: formData.languages_fluent,      // ❌ Colonne VIDE
languages_notions: formData.languages_notions,    // ❌ Colonne VIDE
```

**Devrait utiliser** :
```typescript
wp_skills: phpSerialize(formData.diverse_skills),              // ✅ Colonne WordPress
actor_driving_license: phpSerialize(formData.driving_licenses), // ✅ Colonne WordPress
actor_dance_skills: phpSerialize(formData.dance_skills),        // ✅ Colonne WordPress
actor_music_skills: phpSerialize(formData.music_skills),        // ✅ Colonne WordPress
actor_languages_native: phpSerialize(formData.languages_fluent), // ✅ Colonne WordPress
actor_languages_notions: phpSerialize(formData.languages_notions), // ✅ Colonne WordPress
```

### Problème 3 : Les checkboxes en mode édition modifient les mauvais arrays

**Exemple ligne 1308** :
```typescript
checked={(editedData.driving_licenses || []).includes(permis)}
onChange={(e) => handleArrayChange('driving_licenses', permis, e.target.checked)}
```

❌ Modifie `driving_licenses` (colonne VIDE)
✅ Devrait modifier un array temporaire qui sera sérialisé vers `actor_driving_license`

---

## ✅ Solutions recommandées

### Solution 1 : Vérifier `normalizeComedienData()`

```bash
# Regarder ce fichier
cat test2/lib/wordpress-compat.ts
```

Cette fonction DOIT :
1. Lire `wp_skills`, `actor_driving_license`, etc. (colonnes WordPress)
2. Désérialiser le PHP avec `phpUnserialize()`
3. Retourner `*_normalized` avec les arrays JavaScript

### Solution 2 : Corriger la sauvegarde du profil

Dans `[id].tsx` lignes 120-182, transformer les arrays avant la sauvegarde :

```typescript
// Au lieu d'écrire directement les arrays
const dataToSave = {
  // ... autres champs ...
  wp_skills: phpSerialize(formData.diverse_skills),
  actor_driving_license: phpSerialize(formData.driving_licenses),
  // etc.
}
```

### Solution 3 : Documenter le mapping complet

Créer une constante qui map les champs du formulaire aux colonnes BDD :

```typescript
const FIELD_TO_COLUMN_MAPPING = {
  diverse_skills: 'wp_skills',
  driving_licenses: 'actor_driving_license',
  dance_skills: 'actor_dance_skills',
  music_skills: 'actor_music_skills',
  languages_fluent: 'actor_languages_native',
  languages_notions: 'actor_languages_notions',
  desired_activities: 'wp_activity_domain',
}
```

---

## 📝 Actions prioritaires

### URGENT 🔴
1. **Vérifier `lib/wordpress-compat.ts`** - Est-ce qu'il désérialise correctement?
2. **Tester l'affichage réel** - Les compétences/permis s'affichent-ils sur les profils?
3. **Tester l'édition** - Est-ce que les modifications sont sauvegardées?

### HAUTE PRIORITÉ 🟠
4. Corriger la sauvegarde pour utiliser les colonnes WordPress
5. Créer/vérifier `phpSerialize()` et `phpUnserialize()`
6. Mettre à jour le formulaire d'inscription avec le même système

### MOYENNE PRIORITÉ 🟡
7. Vérifier les doublons (`nationality` vs `actor_nationality`, etc.)
8. Ajouter les colonnes WordPress manquantes si nécessaire
9. Nettoyer les colonnes vides créées par erreur

---

## 🔍 Pour vérifier maintenant

```bash
# 1. Vérifier la fonction de normalisation
cat test2/lib/wordpress-compat.ts | grep -A 30 "normalizeComedienData"

# 2. Vérifier si les compétences s'affichent réellement
node test2/scripts/check-column-data.js
```
