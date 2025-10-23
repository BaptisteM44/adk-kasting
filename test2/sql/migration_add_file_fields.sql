-- Migration pour ajouter les champs de fichiers manquants
-- À exécuter dans Supabase SQL Editor

-- Ajouter le champ pour l'autorisation parentale
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS parental_authorization_url TEXT;

-- Ajouter commentaire pour documentation
COMMENT ON COLUMN comediens.parental_authorization_url IS 'URL du fichier d''autorisation parentale (optionnel, pour mineurs)';

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comediens' 
AND column_name IN ('parental_authorization_url', 'cv_pdf_url');