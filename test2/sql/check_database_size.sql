-- Script pour vérifier la taille de la database et identifier ce qui prend de la place
-- À exécuter dans Supabase SQL Editor

-- 1. Taille totale de chaque table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Nombre de lignes par table
SELECT
  'comediens' as table_name,
  COUNT(*) as row_count
FROM comediens
UNION ALL
SELECT 'films', COUNT(*) FROM films
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE true
UNION ALL
SELECT 'admin_comments', COUNT(*) FROM admin_comments WHERE true
UNION ALL
SELECT 'images', COUNT(*) FROM images WHERE true
ORDER BY row_count DESC;

-- 3. Nombre de comédiens avec photos
SELECT
  'Total comédiens' as category,
  COUNT(*) as count
FROM comediens
UNION ALL
SELECT
  'Avec photos nouvelles (photos[])',
  COUNT(*)
FROM comediens
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0
UNION ALL
SELECT
  'Avec photos WordPress (actor_photo1-5)',
  COUNT(*)
FROM comediens
WHERE
  actor_photo1 IS NOT NULL OR
  actor_photo2 IS NOT NULL OR
  actor_photo3 IS NOT NULL OR
  actor_photo4 IS NOT NULL OR
  actor_photo5 IS NOT NULL;

-- 4. Colonnes prenant le plus de place (texte long)
SELECT
  COUNT(*) as comediens_avec_experience,
  AVG(LENGTH(experience)) as avg_length_experience
FROM comediens
WHERE experience IS NOT NULL;

SELECT
  COUNT(*) as comediens_avec_certificates,
  AVG(LENGTH(certificates)) as avg_length_certificates
FROM comediens
WHERE certificates IS NOT NULL;
