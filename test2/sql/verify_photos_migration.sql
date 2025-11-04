-- Vérifier si les photos WordPress sont déjà dans le tableau photos[]
-- À exécuter dans Supabase SQL Editor

-- 1. Comédiens qui ont SEULEMENT des photos WordPress (pas dans photos[])
SELECT
  id,
  display_name,
  actor_photo1,
  actor_photo2,
  actor_photo3,
  actor_photo4,
  actor_photo5,
  array_length(photos, 1) as nb_photos_nouvelles
FROM comediens
WHERE
  (actor_photo1 IS NOT NULL OR
   actor_photo2 IS NOT NULL OR
   actor_photo3 IS NOT NULL OR
   actor_photo4 IS NOT NULL OR
   actor_photo5 IS NOT NULL)
  AND (photos IS NULL OR array_length(photos, 1) = 0)
ORDER BY display_name
LIMIT 20;

-- 2. Statistiques globales
SELECT
  'Total comédiens' as category,
  COUNT(*) as count
FROM comediens

UNION ALL

SELECT
  'Avec photos[] (nouveau système)',
  COUNT(*)
FROM comediens
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0

UNION ALL

SELECT
  'Avec actor_photo1-5 (WordPress)',
  COUNT(*)
FROM comediens
WHERE
  actor_photo1 IS NOT NULL OR
  actor_photo2 IS NOT NULL OR
  actor_photo3 IS NOT NULL OR
  actor_photo4 IS NOT NULL OR
  actor_photo5 IS NOT NULL

UNION ALL

SELECT
  'Ont les DEUX systèmes',
  COUNT(*)
FROM comediens
WHERE
  (photos IS NOT NULL AND array_length(photos, 1) > 0)
  AND
  (actor_photo1 IS NOT NULL OR
   actor_photo2 IS NOT NULL OR
   actor_photo3 IS NOT NULL OR
   actor_photo4 IS NOT NULL OR
   actor_photo5 IS NOT NULL)

UNION ALL

SELECT
  'SEULEMENT WordPress (risque perte)',
  COUNT(*)
FROM comediens
WHERE
  (actor_photo1 IS NOT NULL OR
   actor_photo2 IS NOT NULL OR
   actor_photo3 IS NOT NULL OR
   actor_photo4 IS NOT NULL OR
   actor_photo5 IS NOT NULL)
  AND (photos IS NULL OR array_length(photos, 1) = 0);

-- 3. Exemples d'URLs WordPress pour voir si elles sont encore accessibles
SELECT
  id,
  display_name,
  actor_photo1
FROM comediens
WHERE actor_photo1 IS NOT NULL
LIMIT 5;
