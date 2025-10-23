-- Migration : Ajouter la colonne admin_comment pour les commentaires privés des admins
-- Date : 18 octobre 2025

-- Ajouter la colonne admin_comment à la table comediens
ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS admin_comment TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN comediens.admin_comment IS 'Commentaire privé des administrateurs sur le comédien (visible uniquement pour les admins)';
