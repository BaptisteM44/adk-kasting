# ✅ Vérification finale : Correspondance Formulaires ↔ Base de données

## 📊 Résumé de l'analyse

J'ai analysé **3 composants principaux** et vérifié leur correspondance avec la base de données WordPress :

1. **Formulaire d'inscription** (`InscriptionFormComplete.tsx`)
2. **Page de profil** (`[id].tsx`)
3. **Normalisation WordPress** (`wordpress-compat.ts`)

---

## ✅ CE QUI FONCTIONNE

### 1. Affichage des profils ✅

La fonction `normalizeComedienData()` **fonctionne correctement** :

```typescript
// Ligne 137-139 de wordpress-compat.ts
diverse_skills_normalized: normalizeLanguages(comedien, 'diverse_skills').length > 0
  ? normalizeLanguages(comedien, 'diverse_skills')  // Essaie la colonne vide
  : normalizeLanguages(comedien, 'wp_skills'),       // ✅ Fallback WordPress
```

**Résultat** : Les compétences, permis, langues, etc. **s'affichent correctement** car la fonction fait un fallback vers les colonnes WordPress qui contiennent les vraies données.

### 2. Désérialisation PHP ✅

La fonction `unserializePHP()` convertit correctement :

```
// Entrée WordPress (PHP sérialisé)
a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}

// Sortie JavaScript
["Chant", "Doublage"]
```

### 3. Photos ✅

Les photos WordPress (`actor_photo1-5`) sont combinées avec les nouvelles photos :

```typescript
// Ligne 146-165 de wordpress-compat.ts
photos_normalized: [...newPhotos, ...wpPhotos] // Combine les deux sources
```

---

## ❌ CE QUI NE FONCTIONNE PAS

### 1. Sauvegarde lors de l'édition de profil ❌

**Problème** : Quand un utilisateur modifie son profil, les données sont sauvegardées dans les **mauvaises colonnes** (colonnes vides).

**Code problématique** (`[id].tsx` lignes 120-182) :

```typescript
const dataToSave = {
  // ...
  diverse_skills: formData.diverse_skills,        // ❌ Sauvegarde dans colonne VIDE
  driving_licenses: formData.driving_licenses,    // ❌ Sauvegarde dans colonne VIDE
  dance_skills: formData.dance_skills,            // ❌ Sauvegarde dans colonne VIDE
  music_skills: formData.music_skills,            // ❌ Sauvegarde dans colonne VIDE
  languages_fluent: formData.languages_fluent,    // ❌ Sauvegarde dans colonne VIDE
  languages_notions: formData.languages_notions,  // ❌ Sauvegarde dans colonne VIDE
}
```

**Conséquence** :
- ❌ Les modifications ne sont PAS sauvegardées
- ❌ Les données WordPress ne sont PAS mises à jour
- ❌ L'utilisateur croit avoir modifié son profil mais rien ne change

### 2. Inscription de nouveaux comédiens ❌

**Problème** : Le formulaire d'inscription envoie des **arrays JavaScript** mais doit envoyer du **texte PHP sérialisé**.

**Code problématique** (`InscriptionFormComplete.tsx`) :

```typescript
// Formulaire envoie
{
  wp_skills: ["Chant", "Doublage"],           // ❌ Array JavaScript
  driving_licenses: ["Auto", "Moto"],         // ❌ Array JavaScript
}

// BDD attend
{
  wp_skills: 'a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}',  // ✅ PHP sérialisé
  actor_driving_license: 'a:2:{i:0;s:4:"Auto";i:1;s:4:"Moto";}',  // ✅ PHP sérialisé
}
```

**Conséquence** :
- ❌ L'inscription échoue silencieusement
- ❌ Ou les données sont sauvegardées au mauvais format
- ❌ Les nouveaux profils n'auront PAS de compétences/permis visibles

---

## 🔧 SOLUTIONS REQUISES

### Solution 1 : Créer une fonction de sérialisation PHP

```typescript
// test2/lib/php-serialize.ts
export function phpSerialize(arr: string[]): string {
  if (!arr || arr.length === 0) return '';

  let result = `a:${arr.length}:{`;
  arr.forEach((item, index) => {
    const itemStr = String(item);
    result += `i:${index};s:${itemStr.length}:"${itemStr}";`;
  });
  result += '}';
  return result;
}

// Exemples
phpSerialize(["Chant"])
// → "a:1:{i:0;s:5:"Chant";}"

phpSerialize(["Chant", "Doublage"])
// → "a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}"
```

### Solution 2 : Corriger la sauvegarde du profil

```typescript
// Dans [id].tsx, fonction handleSaveProfile
const dataToSave = {
  // Champs simples (TEXT)
  first_name: formData.first_name,
  last_name: formData.last_name,
  email: formData.email,
  // ...

  // Champs WordPress (sérialiser les arrays)
  wp_skills: phpSerialize(formData.diverse_skills || []),
  actor_driving_license: phpSerialize(formData.driving_licenses || []),
  actor_dance_skills: phpSerialize(formData.dance_skills || []),
  actor_music_skills: phpSerialize(formData.music_skills || []),
  actor_languages_native: phpSerialize(formData.languages_fluent || []),
  actor_languages_notions: phpSerialize(formData.languages_notions || []),
  wp_activity_domain: phpSerialize(formData.desired_activities || []),
}
```

### Solution 3 : Corriger le formulaire d'inscription

**Option A** : Sérialiser côté client avant envoi

```typescript
// Dans InscriptionFormComplete.tsx, fonction handleSubmit
const formDataToSend = {
  ...formData,
  wp_skills: phpSerialize(formData.wp_skills),
  driving_licenses_serialized: phpSerialize(formData.driving_licenses),
  // Et mapper vers les bonnes colonnes BDD
}
```

**Option B** : Sérialiser côté serveur dans l'API

```typescript
// Dans pages/api/auth/register.ts
const dbData = {
  ...userData,
  wp_skills: phpSerialize(userData.wp_skills),
  actor_driving_license: phpSerialize(userData.driving_licenses),
  actor_dance_skills: phpSerialize(userData.dance_skills),
  actor_music_skills: phpSerialize(userData.music_skills),
  actor_languages_native: phpSerialize(userData.languages_fluent),
  actor_languages_notions: phpSerialize(userData.languages_notions),
  wp_activity_domain: phpSerialize(userData.desired_activities),
}
```

---

## 📋 Mapping complet : Champs formulaire → Colonnes BDD

| Champ formulaire | Type formulaire | Colonne BDD WordPress | Type BDD | Transformation |
|------------------|----------------|----------------------|----------|----------------|
| `wp_skills` | `string[]` | `wp_skills` | TEXT | `phpSerialize()` |
| `driving_licenses` | `string[]` | `actor_driving_license` | TEXT | `phpSerialize()` |
| `dance_skills` | `string[]` | `actor_dance_skills` | TEXT | `phpSerialize()` |
| `music_skills` | `string[]` | `actor_music_skills` | TEXT | `phpSerialize()` |
| `languages_fluent` | `string[]` | `actor_languages_native` | TEXT | `phpSerialize()` |
| `languages_notions` | `string[]` | `actor_languages_notions` | TEXT | `phpSerialize()` |
| `desired_activities` | `string[]` | `wp_activity_domain` | TEXT | `phpSerialize()` |
| `native_language` | `string` | `actor_languages_native` | TEXT | Ajouter au début de l'array |
| `first_name` | `string` | `first_name` | TEXT | Aucune |
| `last_name` | `string` | `last_name` | TEXT | Aucune |
| `email` | `string` | `email` | TEXT | Aucune |
| `phone` | `string` | `phone` | TEXT | Aucune |
| `birth_date` | `string` | `birth_date` | DATE | Aucune |
| `gender` | `string` | `gender` | TEXT | Aucune |
| `nationality` | `string` | `nationality` | TEXT | Aucune |
| `height` | `number` | `height` | INTEGER | Aucune |
| `build` | `string` | `build` | TEXT | Aucune |
| `ethnicity` | `string` | `ethnicity` | TEXT | Aucune |
| `hair_color` | `string` | `hair_color` | TEXT | Aucune |
| `eye_color` | `string` | `eye_color` | TEXT | Aucune |
| `city` | `string` | `city` | TEXT | Aucune |
| `experience_level` | `string` | `experience_level` | TEXT | Aucune |
| `professional_experience` | `string` | `professional_experience` | TEXT | Aucune |
| `training_diplomas` | `string` | `training_diplomas` | TEXT | Aucune |
| `photos` | `string[]` | `actor_photo1-5` | TEXT (URLs) | Mapper vers 5 colonnes |

---

## 🎯 Actions prioritaires (par ordre)

### CRITIQUE 🔴 (À faire MAINTENANT)

1. **Créer `lib/php-serialize.ts`** avec les fonctions `phpSerialize()` et `phpUnserialize()` (alias de `unserializePHP`)
2. **Corriger `[id].tsx` handleSaveProfile** pour sérialiser avant sauvegarde
3. **Tester l'édition de profil** avec un comédien existant

### HAUTE PRIORITÉ 🟠 (Cette semaine)

4. **Corriger le formulaire d'inscription** pour utiliser les bonnes colonnes
5. **Mapper `photos[]` vers `actor_photo1-5`** correctement
6. **Tester l'inscription complète** d'un nouveau comédien

### MOYENNE PRIORITÉ 🟡 (Prochaines semaines)

7. Vérifier les doublons (`nationality` vs `actor_nationality`)
8. Nettoyer les colonnes vides (`diverse_skills`, `languages`, etc.)
9. Ajouter validation côté serveur pour les données sérialisées

---

## ✅ CE QUI EST DÉJÀ BON

- ✅ L'**affichage** fonctionne grâce aux fallbacks WordPress
- ✅ La **désérialisation** PHP fonctionne
- ✅ Les **photos WordPress** s'affichent
- ✅ Les **filtres de recherche** utilisent les bonnes colonnes
- ✅ La **persistance des filtres** avec localStorage fonctionne
- ✅ L'**ordre aléatoire** des comédiens fonctionne

---

## 📊 Statistiques des données

| Colonne WordPress | Enregistrements | Colonne vide | Enregistrements |
|-------------------|----------------|--------------|-----------------|
| `wp_skills` | ✅ 4942 | `diverse_skills` | ❌ 0 |
| `actor_driving_license` | ✅ 4107 | `driving_licenses` | ❌ 0 |
| `actor_languages_native` | ✅ 7667 | `languages` | ❌ 0 |
| `actor_languages_notions` | ⚠️ À vérifier | `languages_notions` | ❌ 0 |
| `actor_dance_skills` | ⚠️ À vérifier | `dance_skills` | ❌ 0 |
| `actor_music_skills` | ⚠️ À vérifier | `music_skills` | ❌ 0 |
| `wp_activity_domain` | ⚠️ À vérifier | `desired_activities` | ❌ 0 |
| `experience_level` | ✅ 6952 | `wp_experience` | ✅ 4985 |

---

## 🔍 Pour vérifier

```bash
# Vérifier les données actuelles
cd test2
node scripts/check-column-data.js

# Vérifier le mapping
node scripts/verify-form-db-mapping.js

# Tester l'édition (après corrections)
npm run dev
# Aller sur un profil, cliquer "Modifier", changer une compétence, sauvegarder
# Recharger la page → vérifier si le changement persiste
```
