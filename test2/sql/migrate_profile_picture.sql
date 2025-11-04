-- Synchroniser profile_picture avec photos[0] (première photo du tableau)
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour profile_picture pour qu'il pointe vers la première photo de photos[]
UPDATE comediens
SET profile_picture = photos[1]  -- PostgreSQL arrays commencent à 1
WHERE photos IS NOT NULL
  AND array_length(photos, 1) > 0
  AND (profile_picture IS NULL OR profile_picture = '');

-- 2. Vérifier le résultat
SELECT
  id,
  display_name,
  profile_picture,
  array_length(photos, 1) as nb_photos,
  photos[1] as premiere_photo
FROM comediens
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0
LIMIT 10;

-- 3. Statistiques
SELECT
  'Total comédiens avec photos' as category,
  COUNT(*) as count
FROM comediens
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0

UNION ALL

SELECT
  'Profile picture synchronisé',
  COUNT(*)
FROM comediens
WHERE photos IS NOT NULL
  AND array_length(photos, 1) > 0
  AND profile_picture = photos[1]

UNION ALL

SELECT
  'Profile picture manquant ou différent',
  COUNT(*)
FROM comediens
WHERE photos IS NOT NULL
  AND array_length(photos, 1) > 0
  AND (profile_picture IS NULL OR profile_picture != photos[1]);
