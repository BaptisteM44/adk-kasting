-- Migration: Ajouter Instagram et TikTok
-- À exécuter dans Supabase SQL Editor

BEGIN;

-- Ajouter les colonnes Instagram et TikTok
ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

COMMIT;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comediens'
AND column_name IN ('instagram_url', 'tiktok_url');
