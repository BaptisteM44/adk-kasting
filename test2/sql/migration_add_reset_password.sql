-- Ajouter les colonnes pour la réinitialisation de mot de passe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Créer un index pour améliorer les performances de recherche par token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Commentaires
COMMENT ON COLUMN users.reset_token IS 'Token de réinitialisation de mot de passe (expire après 1h)';
COMMENT ON COLUMN users.reset_token_expiry IS 'Date d''expiration du token de réinitialisation';
