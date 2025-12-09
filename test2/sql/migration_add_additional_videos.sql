-- Migration: Ajouter la colonne pour vidéos supplémentaires
-- À exécuter dans Supabase SQL Editor

BEGIN;

-- Ajouter la colonne pour stocker un array de vidéos supplémentaires
ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS additional_videos TEXT[];

COMMIT;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comediens'
AND column_name = 'additional_videos';
