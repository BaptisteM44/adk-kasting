-- Forcer la synchronisation de profile_picture avec photos[0]
-- Pour TOUS les comédiens qui ont des photos (peu importe l'ancien profile_picture)
-- À exécuter dans Supabase SQL Editor

-- OPTION 1 : Mettre à jour TOUS les profile_picture (recommandé)
-- Cela écrase les anciennes valeurs et force la synchronisation
UPDATE comediens
SET profile_picture = photos[1]  -- PostgreSQL arrays commencent à 1
WHERE photos IS NOT NULL
  AND array_length(photos, 1) > 0;

-- Vérifier le résultat
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

-- Exemples de résultat
SELECT
  id,
  display_name,
  profile_picture,
  photos[1] as premiere_photo,
  CASE
    WHEN profile_picture = photos[1] THEN '✅ Synchronisé'
    ELSE '❌ Différent'
  END as status
FROM comediens
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0
LIMIT 10;
