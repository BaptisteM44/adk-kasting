-- Migration: Ajout des champs pour une deuxième agence
-- Date: 14 octobre 2025
-- Description: Ajoute les colonnes pour permettre aux comédiens d'avoir une deuxième agence/agent

-- Ajouter les colonnes pour la deuxième agence
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS agency_name_2 TEXT,
ADD COLUMN IF NOT EXISTS agent_name_2 TEXT,
ADD COLUMN IF NOT EXISTS agent_email_2 TEXT,
ADD COLUMN IF NOT EXISTS agent_phone_2 TEXT;

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN comediens.agency_name_2 IS 'Nom de la deuxième agence (optionnel)';
COMMENT ON COLUMN comediens.agent_name_2 IS 'Nom de l''agent de la deuxième agence (optionnel)';
COMMENT ON COLUMN comediens.agent_email_2 IS 'Email de l''agent de la deuxième agence (optionnel)';
COMMENT ON COLUMN comediens.agent_phone_2 IS 'Téléphone de l''agent de la deuxième agence (optionnel)';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comediens' 
AND column_name IN ('agency_name_2', 'agent_name_2', 'agent_email_2', 'agent_phone_2')
ORDER BY column_name;