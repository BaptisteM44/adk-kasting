# Copilot Instructions for ADKcasting

## Architecture & Structure
- **Monorepo** : Deux dossiers principaux : `adk-app/` (Next.js front) et `test2/` (legacy, scripts, composants, SQL, types partagés).
- **Composants clés** : 
  - `components/ComedienFilters.tsx` : Filtres dynamiques pour la recherche de comédiens (voir mapping SQL plus bas).
  - `components/ComedienCard.tsx` : Affichage des profils comédiens.
  - `lib/supabase.ts` : Client et requêtes Supabase (PostgreSQL).
  - `pages/` : Routage Next.js (pages, API, dashboard, etc).
- **Types partagés** : `test2/types/index.ts` centralise tous les types TypeScript (Comedien, ComedienFilters, etc).
- **SQL** : Migrations et scripts dans `test2/sql/` (voir `migration_wp_data_final.sql` pour la structure des comédiens).

## Filtres & Mapping (important pour l’IA)
- Les filtres front (`ComedienFilters`) ne correspondent pas toujours aux colonnes SQL :
  - `diverse_skills` (front) → `wp_skills` (SQL)
  - `driving_licenses` (front) → `actor_driving_license` (SQL)
  - `languages` (front) → `actor_languages_native` (SQL)
  - `nationality` (front) → `actor_nationality` (SQL)
  - `experience_level` (front) → `wp_experience` (SQL)
- Toujours vérifier le mapping dans les requêtes ou lors de l’ajout de nouveaux filtres.

## Workflows & Commandes
- **Démarrage local** : `npm run dev` (dans `adk-app/` ou racine selon config).
- **Installation** : `npm install` (racine ou dossier concerné).
- **Migration DB** : Exécuter les scripts SQL dans l’ordre indiqué dans le README (`schema.sql`, `functions.sql`, `rls.sql`, puis migrations).
- **Variables d’environnement** : `.env.local` à la racine, copier depuis `.env.example`.

## Conventions & Patterns
- **Types** : Toujours étendre ou modifier dans `test2/types/index.ts`.
- **UI** : Utiliser les composants de `components/ui/` pour cohérence visuelle.
- **Sécurité** : RLS activé côté Supabase, attention aux droits dans les requêtes.
- **PDF** : Génération via `lib/pdf.ts`.
- **Données** : Accès et mutations via Supabase (voir `lib/supabase.ts`).

## Bonnes pratiques spécifiques
- Pour tout nouveau filtre ou champ, synchroniser : composant, type, mapping SQL, et requête.
- Pour debug, voir les scripts dans `test2/scripts/`.
- Les pages Next.js sont dans `test2/pages/` (legacy) et `adk-app/src/app/` (nouveau front).

## Exemples
- Pour ajouter un filtre « Compétence », ajouter la clé dans `ComedienFilters`, le champ dans le composant, et mapper vers la colonne SQL cible.
- Pour une requête Supabase filtrée :
  ```ts
  // Ex : filtrer sur la compétence WordPress
  .eq('wp_skills', filters.diverse_skills)
  ```

---

Pour toute modification structurelle, vérifier : types, composants, mapping SQL, et scripts de migration.
