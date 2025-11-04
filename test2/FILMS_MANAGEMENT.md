# 🎬 Gestion des Films - ADK-KASTING

## Vue d'ensemble

Le système de gestion des films permet aux administrateurs de gérer les images de films affichées sur le site, avec deux zones d'affichage distinctes :
- **Carousel Hero** : Carousel animé sur la page d'accueil
- **Section Collaborations** : Grille défilante des collaborations

## 🚀 Comment utiliser

### Accéder au dashboard de gestion des films

1. Connectez-vous en tant qu'admin
2. Allez sur `/dashboard`
3. Cliquez sur le bouton **"🎬 Gérer les Films"**
4. Vous serez redirigé vers `/dashboard/films`

### Ajouter un nouveau film

1. Cliquez sur le bouton **"+ Ajouter un film"**
2. Remplissez le formulaire :
   - **Titre*** : Titre du film (obligatoire)
   - **Année*** : Année de sortie (obligatoire)
   - **Image*** : Upload d'une image (obligatoire)
   - **Ordre d'affichage** : Numéro pour l'ordre (0 par défaut)
   - **☑️ Afficher dans le carousel Hero** : Cochez pour afficher sur la page d'accueil
   - **☑️ Afficher dans la section Collaborations** : Cochez pour afficher dans les collaborations
3. Cliquez sur **"Ajouter"**

### Modifier un film existant

1. Cliquez sur le bouton **"✏️ Modifier"** du film à éditer
2. Modifiez les champs souhaités
3. Vous pouvez changer l'image en uploadant une nouvelle
4. Cliquez sur **"Mettre à jour"**

### Supprimer un film

1. Cliquez sur le bouton **"🗑️ Supprimer"**
2. Confirmez la suppression

## 📁 Architecture technique

### Fichiers créés

#### Base de données
- **`/supabase/migrations/create_films_table.sql`**
  - Table `films` avec tous les champs
  - Champs : `id`, `title`, `year`, `image_url`, `order_index`, `is_active`, `show_in_hero`, `show_in_collaborations`
  - RLS (Row Level Security) activé
  - Policies : lecture publique, écriture admin only

#### APIs
- **`/pages/api/films.ts`** (publique)
  - `GET /api/films` : Récupère tous les films actifs
  - Query params : `?show_in_hero=true` ou `?show_in_collaborations=true`

- **`/pages/api/admin/films.ts`** (admin only)
  - `GET /api/admin/films` : Liste tous les films (incluant inactifs)
  - `POST /api/admin/films` : Créer un film
  - `PUT /api/admin/films` : Modifier un film
  - `DELETE /api/admin/films` : Supprimer un film

#### Interface
- **`/pages/dashboard/films.tsx`**
  - Interface complète de gestion CRUD
  - Upload d'images vers Supabase Storage
  - Cases à cocher pour zones d'affichage
  - Modal pour ajout/édition

#### Intégrations
- **`/pages/index.tsx`** : Modifié pour charger les films depuis l'API (show_in_hero=true)
- **`/components/CollaborationsSection.tsx`** : Modifié pour charger depuis l'API (show_in_collaborations=true)
- **`/pages/dashboard.tsx`** : Ajout du bouton "Gérer les Films"

## 🔄 Migration depuis JSON

Les films existants dans `/data/films.json` ont été migrés dans la table Supabase avec :
- `show_in_hero = true`
- `show_in_collaborations = true`

Les composants gardent un fallback vers le fichier JSON si l'API échoue.

## 📝 Notes importantes

### Upload d'images
- Les images sont uploadées dans le bucket Supabase `images/films/`
- Format recommandé : JPG, PNG, WEBP
- Taille recommandée : 800x1200px (ratio 2:3)

### Ordre d'affichage
- Les films sont triés par `order_index` (ascendant)
- Plus petit nombre = affiché en premier
- Permet de contrôler l'ordre exact du carousel et des collaborations

### Zones d'affichage
- Un film peut être dans **aucune**, **une seule**, ou **les deux** zones
- Si un film n'est coché nulle part, il ne sera affiché nul part (mais reste dans la DB)
- Vous pouvez avoir des films différents dans le Hero et les Collaborations

### Statut actif/inactif
- Par défaut, les films créés sont actifs (`is_active = true`)
- Pour désactiver sans supprimer, modifiez directement dans Supabase (à ajouter dans l'UI si besoin)

## 🛠️ Développement futur

Améliorations possibles :
- Bouton on/off pour activer/désactiver sans supprimer
- Drag & drop pour réorganiser l'ordre visuellement
- Prévisualisation du carousel en temps réel
- Catégories de films
- Metadata supplémentaires (réalisateur, acteurs, synopsis)

## 🔒 Sécurité

- ✅ Seuls les admins peuvent créer/modifier/supprimer des films
- ✅ RLS Supabase activé sur la table `films`
- ✅ Validation des inputs côté serveur
- ✅ Upload d'images sécurisé via Supabase Storage

---

**🎉 Le système est maintenant opérationnel !**

Pour toute question ou amélioration, consultez ce document ou contactez le développeur.
