-- Script pour nettoyer les anciennes colonnes WordPress inutilisées
-- À exécuter dans Supabase SQL Editor

-- ÉTAPE 1 : Vérifier s'il y a des photos dans actor_photo1-5 qui ne sont PAS dans photos[]
-- (pour ne pas perdre de données)
SELECT
  id,
  display_name,
  array_length(photos, 1) as nb_photos_nouvelles,
  CASE WHEN actor_photo1 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN actor_photo2 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN actor_photo3 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN actor_photo4 IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN actor_photo5 IS NOT NULL THEN 1 ELSE 0 END as nb_photos_wp
FROM comediens
WHERE
  actor_photo1 IS NOT NULL OR
  actor_photo2 IS NOT NULL OR
  actor_photo3 IS NOT NULL OR
  actor_photo4 IS NOT NULL OR
  actor_photo5 IS NOT NULL
ORDER BY display_name;

-- ÉTAPE 2 : OPTIONNEL - Nettoyer les colonnes WordPress si les photos sont migrées
-- ⚠️ NE PAS EXÉCUTER si vous n'êtes pas sûr que les photos sont migrées !
--
-- UPDATE comediens SET
--   actor_photo1 = NULL,
--   actor_photo2 = NULL,
--   actor_photo3 = NULL,
--   actor_photo4 = NULL,
--   actor_photo5 = NULL,
--   actor_photo_1 = NULL
-- WHERE photos IS NOT NULL AND array_length(photos, 1) > 0;

-- ÉTAPE 3 : OPTIONNEL - Supprimer complètement les colonnes WordPress
-- ⚠️ IRRÉVERSIBLE ! Ne pas exécuter sans sauvegarde
--
-- ALTER TABLE comediens
--   DROP COLUMN IF EXISTS actor_photo1,
--   DROP COLUMN IF EXISTS actor_photo2,
--   DROP COLUMN IF EXISTS actor_photo3,
--   DROP COLUMN IF EXISTS actor_photo4,
--   DROP COLUMN IF EXISTS actor_photo5,
--   DROP COLUMN IF EXISTS actor_photo_1;

-- Nettoyer aussi les autres colonnes WordPress redondantes
-- ALTER TABLE comediens
--   DROP COLUMN IF EXISTS actor_showreal,
--   DROP COLUMN IF EXISTS actor_video1,
--   DROP COLUMN IF EXISTS actor_video2,
--   DROP COLUMN IF EXISTS actor_video3,
--   DROP COLUMN IF EXISTS user_url,
--   DROP COLUMN IF EXISTS actor_profile_facebook,
--   DROP COLUMN IF EXISTS actor_profile_imdb,
--   DROP COLUMN IF EXISTS actor_profile_linkedin,
--   DROP COLUMN IF EXISTS actor_profile_other;
