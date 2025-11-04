-- Analyser toutes les colonnes qui contiennent des URLs WordPress
-- À exécuter dans Supabase SQL Editor

-- 1. Statistiques globales des URLs WordPress par type
SELECT
  'Showreel (showreel_url)' as type_url,
  COUNT(*) as total,
  COUNT(CASE WHEN showreel_url LIKE '%wp-content%' OR showreel_url LIKE '%wordpress%' THEN 1 END) as wordpress_urls
FROM comediens
WHERE showreel_url IS NOT NULL

UNION ALL

SELECT
  'Vidéos WordPress (actor_video1-3)',
  COUNT(*),
  COUNT(CASE WHEN
    actor_video1 LIKE '%wp-content%' OR actor_video1 LIKE '%wordpress%' OR
    actor_video2 LIKE '%wp-content%' OR actor_video2 LIKE '%wordpress%' OR
    actor_video3 LIKE '%wp-content%' OR actor_video3 LIKE '%wordpress%'
  THEN 1 END)
FROM comediens
WHERE actor_video1 IS NOT NULL OR actor_video2 IS NOT NULL OR actor_video3 IS NOT NULL

UNION ALL

SELECT
  'CV/Resume (actor_resume)',
  COUNT(*),
  COUNT(CASE WHEN actor_resume LIKE '%wp-content%' OR actor_resume LIKE '%wordpress%' THEN 1 END)
FROM comediens
WHERE actor_resume IS NOT NULL

UNION ALL

SELECT
  'Profil Facebook',
  COUNT(*),
  COUNT(CASE WHEN actor_profile_facebook LIKE '%wp-content%' OR actor_profile_facebook LIKE '%wordpress%' THEN 1 END)
FROM comediens
WHERE actor_profile_facebook IS NOT NULL

UNION ALL

SELECT
  'Profil IMDB',
  COUNT(*),
  COUNT(CASE WHEN actor_profile_imdb LIKE '%wp-content%' OR actor_profile_imdb LIKE '%wordpress%' THEN 1 END)
FROM comediens
WHERE actor_profile_imdb IS NOT NULL

UNION ALL

SELECT
  'Site web (user_url)',
  COUNT(*),
  COUNT(CASE WHEN user_url LIKE '%wp-content%' OR user_url LIKE '%wordpress%' THEN 1 END)
FROM comediens
WHERE user_url IS NOT NULL;

-- 2. Exemples d'URLs WordPress pour vérifier si elles sont encore accessibles
SELECT
  id,
  display_name,
  'actor_resume' as type,
  actor_resume as url
FROM comediens
WHERE actor_resume LIKE '%wp-content%' OR actor_resume LIKE '%wordpress%'
LIMIT 5

UNION ALL

SELECT
  id,
  display_name,
  'showreel_url',
  showreel_url
FROM comediens
WHERE showreel_url LIKE '%wp-content%' OR showreel_url LIKE '%wordpress%'
LIMIT 5

UNION ALL

SELECT
  id,
  display_name,
  'actor_video1',
  actor_video1
FROM comediens
WHERE actor_video1 LIKE '%wp-content%' OR actor_video1 LIKE '%wordpress%'
LIMIT 5;

-- 3. Total de fichiers WordPress encore référencés
SELECT
  'Total URLs WordPress dans la base' as statistic,
  COUNT(*) as count
FROM (
  SELECT id FROM comediens WHERE showreel_url LIKE '%wp-content%' OR showreel_url LIKE '%wordpress%'
  UNION
  SELECT id FROM comediens WHERE actor_resume LIKE '%wp-content%' OR actor_resume LIKE '%wordpress%'
  UNION
  SELECT id FROM comediens WHERE actor_video1 LIKE '%wp-content%' OR actor_video1 LIKE '%wordpress%'
  UNION
  SELECT id FROM comediens WHERE actor_video2 LIKE '%wp-content%' OR actor_video2 LIKE '%wordpress%'
  UNION
  SELECT id FROM comediens WHERE actor_video3 LIKE '%wp-content%' OR actor_video3 LIKE '%wordpress%'
  UNION
  SELECT id FROM comediens WHERE user_url LIKE '%wp-content%' OR user_url LIKE '%wordpress%'
) as wp_urls;
