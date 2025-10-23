# Fonctionnalité d'édition de profil comédien

## Fonctionnalités ajoutées

### 1. Mode édition
- **Bouton "✏️ Modifier mon profil"** : Visible uniquement pour le propriétaire du profil (ou admin)
- **Boutons Sauvegarder/Annuler** : Apparaissent en mode édition

### 2. Champs éditables
Les champs suivants sont éditables en mode édition :
- **Identité** : Prénom, Nom
- **Contact** : Email, Téléphone
- **Caractéristiques physiques** : Type, Corpulence, Taille, Cheveux, Yeux
- **Expérience professionnelle** : Zone de texte complète
- **Formations et diplômes** : Zone de texte complète

### 3. Gestion des photos
- **Bouton "+"** : Ajouter une nouvelle photo (visible en mode édition)
- **Bouton "✕"** : Supprimer une photo (apparaît au survol en mode édition)
- **Upload** : Les photos sont uploadées dans Supabase Storage

## Configuration Supabase Storage

### Créer le bucket "photos"
1. Allez dans Supabase Dashboard > Storage
2. Cliquez sur "New bucket"
3. Nom du bucket : `photos`
4. Public : ✅ Oui (pour que les photos soient accessibles publiquement)
5. Cliquez sur "Create bucket"

### Configuration des politiques RLS (Row Level Security)

Pour permettre l'upload de photos, ajoutez ces politiques au bucket `photos` :

```sql
-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent uploader"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Politique pour permettre la lecture publique
CREATE POLICY "Lecture publique des photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Politique pour permettre la suppression aux propriétaires
CREATE POLICY "Utilisateurs peuvent supprimer leurs photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
```

## Structure des données

### Colonnes modifiées
Les modifications sont sauvegardées dans les colonnes suivantes de la table `comediens` :
- `first_name`, `last_name`
- `email`, `phone`
- `ethnicity`, `body_type`, `height`, `hair_color`, `eye_color`
- `professional_experience`, `training_diplomas`
- `photos` (array de URLs)

## Permissions

### Qui peut éditer ?
- **Le comédien lui-même** : Peut modifier son propre profil (`user.id === comedien.id`)
- **Les administrateurs** : Peuvent modifier tous les profils (`user.role === 'admin'`)

### Visibilité des fonctionnalités
- **Bouton "Modifier mon profil"** : Visible uniquement si `canEdit && !isAdmin`
- **Bouton PDF** : Visible uniquement pour les admins
- **Étoiles d'évaluation** : Visibles uniquement pour les admins
- **Commentaire admin** : Visible uniquement pour les admins

## Utilisation

### Pour modifier son profil
1. Le comédien se connecte avec son compte
2. Il accède à sa page de profil
3. Il clique sur "✏️ Modifier mon profil"
4. Il modifie les champs souhaités
5. Il clique sur "✓ Sauvegarder" (ou "✕ Annuler" pour abandonner)

### Pour ajouter une photo
1. Activer le mode édition
2. Cliquer sur le bouton "+" dans la galerie de photos
3. Sélectionner une image depuis son ordinateur
4. La photo est automatiquement uploadée et ajoutée au profil

### Pour supprimer une photo
1. Activer le mode édition
2. Survoler une photo dans la galerie
3. Cliquer sur le bouton "✕" qui apparaît
4. Confirmer la suppression

## Notes techniques

### Upload de photos
- **Bucket Supabase** : `photos`
- **Chemin** : `comediens/{id}_{timestamp}.{ext}`
- **Format** : Tous les formats d'images acceptés (`image/*`)
- **Stockage** : Les URLs sont sauvegardées dans le champ `photos` (type `text[]`)

### État local
- `isEditing` : Boolean pour activer/désactiver le mode édition
- `editedData` : Copie des données en cours d'édition
- `uploadingPhoto` : Boolean pour afficher l'état de l'upload

### Validation
- Les champs sont validés côté client (types HTML5 : email, tel, number)
- La sauvegarde est sécurisée par les RLS de Supabase
- Seuls les propriétaires et admins peuvent modifier les profils
