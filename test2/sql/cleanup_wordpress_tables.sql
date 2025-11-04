-- Supprimer les tables WordPress inutilisées
-- À exécuter dans Supabase SQL Editor
-- ⚠️ IRRÉVERSIBLE - Faites une sauvegarde avant !

-- Tables WordPress qui ne sont JAMAIS utilisées dans le code
DROP TABLE IF EXISTS wp_meta CASCADE;
DROP TABLE IF EXISTS wp_users CASCADE;
DROP TABLE IF EXISTS actor_essentials CASCADE;
DROP TABLE IF EXISTS comedien_skills CASCADE;
DROP TABLE IF EXISTS comedien_photos CASCADE;
DROP TABLE IF EXISTS comedien_video CASCADE;
DROP TABLE IF EXISTS comedien_languages CASCADE;
DROP TABLE IF EXISTS admin_ratings CASCADE;

-- Vérification : afficher les tables restantes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Tables qui DOIVENT rester :
-- ✅ comediens - Table principale
-- ✅ films - Carousel et collaborations
-- ✅ user_profiles - Rôles (admin/comedien)
-- ✅ users - Authentification
-- ✅ admin_comments - API commentaires admin
-- ✅ images - Dashboard films
