-- Migration : Ajout du champ autorisation parentale
-- Date: 2025-10-14
-- Description: Ajoute la colonne pour stocker l'URL de l'autorisation parentale des mineurs

-- Ajouter la colonne parental_authorization_url
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS parental_authorization_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN comediens.parental_authorization_url 
IS 'URL du document d''autorisation parentale (obligatoire pour les mineurs de moins de 18 ans)';

-- Vérification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comediens' 
  AND column_name = 'parental_authorization_url';
