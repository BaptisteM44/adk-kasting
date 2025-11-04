-- Script de nettoyage des tables inutilisées
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer la table admin_comments (non utilisée)
DROP TABLE IF EXISTS admin_comments CASCADE;

-- 2. Supprimer la table images (non utilisée)
DROP TABLE IF EXISTS images CASCADE;

-- 3. OPTIONNEL : Vérifier si la table users est vraiment nécessaire
-- (Si vous utilisez uniquement auth.users de Supabase, vous pouvez la supprimer)
-- DROP TABLE IF EXISTS users CASCADE;

-- Note : Ne PAS supprimer :
-- - comediens (table principale)
-- - films (utilisée pour carousel)
-- - user_profiles (utilisée pour les rôles admin)
