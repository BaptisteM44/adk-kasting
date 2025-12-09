-- Migration: Ajouter colonne status et migrer is_active
-- Auteur: Claude
-- Date: 2025-12-07
-- Description: Remplace le système binaire is_active par un système de statuts à 3 niveaux

BEGIN;

-- 1. Ajouter la nouvelle colonne status
ALTER TABLE comediens
ADD COLUMN status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'published', 'trash'));

-- 2. Migrer les données existantes : is_active → status
UPDATE comediens
SET status = CASE
  WHEN is_active = true THEN 'published'
  WHEN is_active = false THEN 'pending'
  ELSE 'pending'
END;

-- 3. Définir tous les profils existants comme 'published' (demande user)
-- Cette étape écrase la précédente pour mettre TOUS les profils à 'published'
UPDATE comediens
SET status = 'published';

-- 4. Rendre la colonne NOT NULL maintenant qu'elle a des valeurs
ALTER TABLE comediens
ALTER COLUMN status SET NOT NULL;

-- 5. Créer un index pour optimiser les requêtes par status
CREATE INDEX idx_comediens_status ON comediens(status);

-- 6. Supprimer l'ancien index sur is_active
DROP INDEX IF EXISTS idx_comediens_active;

-- 7. GARDER la colonne is_active pour compatibilité descendante (synchro)
-- On la met à jour automatiquement avec un trigger
CREATE OR REPLACE FUNCTION sync_is_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_is_active
BEFORE INSERT OR UPDATE OF status ON comediens
FOR EACH ROW
EXECUTE FUNCTION sync_is_active();

-- 8. Mettre à jour is_active pour les profils existants
UPDATE comediens
SET is_active = (status = 'published');

COMMIT;

-- Vérification post-migration
-- Décommenter pour vérifier les résultats:
-- SELECT status, COUNT(*) as count FROM comediens GROUP BY status;
-- SELECT status, is_active, COUNT(*) as count FROM comediens GROUP BY status, is_active;
