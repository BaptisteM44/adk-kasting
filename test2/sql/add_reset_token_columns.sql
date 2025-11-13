-- Ajouter les colonnes pour le reset password dans la table comediens
ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Créer un index pour améliorer les performances de recherche par token
CREATE INDEX IF NOT EXISTS idx_comediens_reset_token ON comediens(reset_token) WHERE reset_token IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN comediens.reset_token IS 'Token de réinitialisation de mot de passe (32 bytes hex)';
COMMENT ON COLUMN comediens.reset_token_expiry IS 'Date d''expiration du token de reset (1 heure après génération)';
