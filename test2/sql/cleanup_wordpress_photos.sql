-- Supprimer UNIQUEMENT les anciennes colonnes WordPress de photos
-- ⚠️ À exécuter APRÈS avoir vérifié que toutes les photos sont dans photos[]
-- À exécuter dans Supabase SQL Editor

-- ÉTAPE 1 : Vérification finale avant suppression
SELECT
  'Comédiens avec SEULEMENT photos WordPress (risque perte)' as warning,
  COUNT(*) as count
FROM comediens
WHERE
  (actor_photo1 IS NOT NULL OR
   actor_photo2 IS NOT NULL OR
   actor_photo3 IS NOT NULL OR
   actor_photo4 IS NOT NULL OR
   actor_photo5 IS NOT NULL)
  AND (photos IS NULL OR array_length(photos, 1) = 0);

-- ⚠️ Si le résultat est > 0, NE PAS CONTINUER ! Vous perdrez des photos !
-- ✅ Si le résultat est 0, vous pouvez continuer

-- ÉTAPE 2 : Supprimer UNIQUEMENT les colonnes de photos WordPress
ALTER TABLE comediens
  DROP COLUMN IF EXISTS actor_photo1,
  DROP COLUMN IF EXISTS actor_photo2,
  DROP COLUMN IF EXISTS actor_photo3,
  DROP COLUMN IF EXISTS actor_photo4,
  DROP COLUMN IF EXISTS actor_photo5,
  DROP COLUMN IF EXISTS actor_photo_1;

-- ÉTAPE 3 : Vérifier que les colonnes sont bien supprimées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comediens'
  AND table_schema = 'public'
  AND column_name LIKE '%photo%'
ORDER BY column_name;

-- Résultat attendu : seulement "photos" et "profile_picture" devraient rester
