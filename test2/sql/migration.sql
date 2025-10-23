-- Migration pour ajouter les colonnes manquantes à la table comediens
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne age si elle n'existe pas
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Ajouter la colonne password si elle n'existe pas  
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Mettre à jour is_active par défaut à false
ALTER TABLE comediens 
ALTER COLUMN is_active SET DEFAULT false;

-- Créer la table admin_comments si elle n'existe pas
CREATE TABLE IF NOT EXISTS admin_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comedien_id UUID REFERENCES comediens(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_name TEXT NOT NULL DEFAULT 'Admin',
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter l'index pour les commentaires
CREATE INDEX IF NOT EXISTS idx_admin_comments_comedien ON admin_comments(comedien_id);

-- Trigger pour updated_at sur admin_comments
CREATE TRIGGER update_admin_comments_updated_at 
    BEFORE UPDATE ON admin_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();