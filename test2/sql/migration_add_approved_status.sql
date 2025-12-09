-- Migration: Ajouter le statut "approved" (validé mais non payé)
-- Workflow: pending → approved → published (ou trash à tout moment)

BEGIN;

-- 1. Modifier la contrainte CHECK pour inclure 'approved'
ALTER TABLE comediens
DROP CONSTRAINT IF EXISTS comediens_status_check;

ALTER TABLE comediens
ADD CONSTRAINT comediens_status_check
CHECK (status IN ('pending', 'approved', 'published', 'trash'));

-- 2. Mettre à jour le trigger is_active pour qu'il reste synchro
-- Seuls les profils 'published' sont actifs (is_active = true)
DROP TRIGGER IF EXISTS trigger_sync_is_active ON comediens;
DROP FUNCTION IF EXISTS sync_is_active();

CREATE OR REPLACE FUNCTION sync_is_active()
RETURNS TRIGGER AS $$
BEGIN
  -- Seuls les profils 'published' (payés) sont publics
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_is_active
BEFORE INSERT OR UPDATE OF status ON comediens
FOR EACH ROW
EXECUTE FUNCTION sync_is_active();

-- 3. Vérifier les valeurs actuelles
SELECT status, COUNT(*) as count
FROM comediens
GROUP BY status;

-- 4. Note: Les profils existants avec status='published' restent 'published'
--    Les nouveaux profils auront status='pending' par défaut

COMMIT;

-- Vérification finale
SELECT
  status,
  COUNT(*) as total,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as pourcentage
FROM comediens
GROUP BY status
ORDER BY status;
