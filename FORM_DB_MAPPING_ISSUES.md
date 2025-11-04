# Problèmes de correspondance Formulaires ↔ Base de données

## ⚠️ Problème principal : Format des données

Les **formulaires** utilisent des **Arrays JavaScript** mais la **BDD** stocke au **format PHP sérialisé** (TEXT).

### Exemple :
```typescript
// Dans le formulaire (JavaScript)
wp_skills: ["Chant", "Doublage"]

// Dans la BDD (PHP sérialisé)
wp_skills: "a:2:{i:0;s:5:\"Chant\";i:1;s:8:\"Doublage\";}"
```

---

## 🔴 Incohérences détectées

### 1. **Champs Array → TEXT PHP**

| Champ Formulaire | Type Form | Colonne BDD | Type BDD | Status |
|------------------|-----------|-------------|----------|--------|
| `wp_skills` | Array | `wp_skills` | TEXT (PHP) | ❌ Incompatible |
| `driving_licenses` | Array | `actor_driving_license` | TEXT (PHP) | ❌ Incompatible |
| `dance_skills` | Array | `actor_dance_skills` | TEXT (PHP) | ❌ Incompatible |
| `music_skills` | Array | `actor_music_skills` | TEXT (PHP) | ❌ Incompatible |
| `languages_fluent` | Array | `actor_languages_native` | TEXT (PHP) | ❌ Incompatible |
| `languages_notions` | Array | `actor_languages_notions` | TEXT (PHP) | ❌ Incompatible |
| `desired_activities` | Array | `wp_activity_domain` | TEXT (PHP) | ❌ Incompatible |

### 2. **Colonnes WordPress importantes manquantes dans le formulaire**

| Colonne BDD | Description | Dans formulaire? |
|-------------|-------------|------------------|
| `actor_resume` | CV WordPress (texte long avec expériences) | ❌ NON |
| `wp_experience` | Expérience professionnelle WordPress | ⚠️ Doublon avec `experience_level`? |
| `actor_nationality` | Nationalité WordPress | ⚠️ Doublon avec `nationality`? |

**Note importante** : `actor_resume` contient les expériences professionnelles détaillées (CV complet) des comédiens WordPress. C'est un champ critique qui n'est pas dans le formulaire d'inscription !

### 3. **Mapping ambigu**

| Champ Formulaire | Mapping actuel | Devrait être |
|------------------|----------------|--------------|
| `native_language` | ❓ | `actor_languages_native` |
| `photos` (Array) | ❓ | `actor_photo1`, `actor_photo2`, ... `actor_photo5` |

---

## ✅ Solutions recommandées

### Solution 1 : Convertir les Arrays en PHP sérialisé lors de la soumission

Créer une fonction helper pour convertir les arrays :

```typescript
// lib/php-serialize.ts
export function phpSerialize(arr: string[]): string {
  if (!arr || arr.length === 0) return '';

  let result = `a:${arr.length}:{`;
  arr.forEach((item, index) => {
    result += `i:${index};s:${item.length}:"${item}";`;
  });
  result += '}';
  return result;
}

export function phpUnserialize(str: string): string[] {
  if (!str) return [];

  // Regex pour extraire les valeurs d'une string PHP sérialisée
  const matches = str.match(/s:\d+:"([^"]+)"/g);
  if (!matches) return [];

  return matches.map(match => {
    const value = match.match(/s:\d+:"([^"]+)"/);
    return value ? value[1] : '';
  });
}
```

### Solution 2 : Ajouter les champs manquants dans le formulaire

**Dans `InscriptionFormComplete.tsx`** :
1. Ajouter `actor_resume` (textarea pour CV détaillé)
2. Mapper correctement `native_language` → `actor_languages_native`
3. Gérer `photos` → `actor_photo1` à `actor_photo5`

### Solution 3 : Créer un middleware de transformation

**Dans l'API** (`pages/api/auth/register.ts` ou équivalent) :

```typescript
// Avant d'insérer dans la BDD
const transformedData = {
  ...formData,
  wp_skills: phpSerialize(formData.wp_skills),
  actor_driving_license: phpSerialize(formData.driving_licenses),
  actor_dance_skills: phpSerialize(formData.dance_skills),
  actor_music_skills: phpSerialize(formData.music_skills),
  actor_languages_native: phpSerialize(formData.languages_fluent),
  actor_languages_notions: phpSerialize(formData.languages_notions),
  wp_activity_domain: phpSerialize(formData.desired_activities),
  // Mapper les photos
  actor_photo1: formData.photos?.[0] || null,
  actor_photo2: formData.photos?.[1] || null,
  actor_photo3: formData.photos?.[2] || null,
  actor_photo4: formData.photos?.[3] || null,
  actor_photo5: formData.photos?.[4] || null,
};
```

---

## 🎯 Actions prioritaires

### Priorité HAUTE 🔴
1. **Créer la fonction `phpSerialize()` / `phpUnserialize()`**
2. **Transformer les arrays avant insertion en BDD**
3. **Ajouter le champ `actor_resume` (CV) dans le formulaire**

### Priorité MOYENNE 🟠
4. Mapper correctement `photos` → `actor_photo1-5`
5. Vérifier les doublons (`nationality` vs `actor_nationality`)
6. Vérifier `experience_level` vs `wp_experience`

### Priorité BASSE 🟢
7. Nettoyer les colonnes vides créées par erreur (`diverse_skills`, `driving_licenses` array, etc.)

---

## 📊 État actuel

- ✅ Les **filtres** fonctionnent (utilisent ILIKE sur les colonnes WordPress)
- ✅ L'**affichage** des profils fonctionne (lit les colonnes WordPress)
- ❌ L'**inscription** risque de ne pas fonctionner (format incompatible)
- ❌ L'**édition de profil** risque de ne pas fonctionner (format incompatible)

---

## 🔍 Pour vérifier

```bash
# Vérifier les données actuelles
node test2/scripts/check-column-data.js

# Vérifier le mapping
node test2/scripts/verify-form-db-mapping.js
```
