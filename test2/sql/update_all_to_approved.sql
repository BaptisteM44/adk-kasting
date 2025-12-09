-- Migration: Mettre tous les comédiens actuellement "published" en "approved"
-- Objectif: Tous les profils sont validés mais en attente de paiement
-- Seuls ceux qui paient passeront en "published" (visible au public)

BEGIN;

-- 1. Vérifier le nombre de profils concernés
SELECT
    status,
    COUNT(*) as nombre
FROM comediens
GROUP BY status
ORDER BY status;

-- 2. Mettre TOUS les profils "published" en "approved"
UPDATE comediens
SET status = 'approved'
WHERE status = 'published';

-- 3. Vérifier le résultat
SELECT
    status,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM comediens
GROUP BY status
ORDER BY status;

-- 4. Note importante:
-- Le trigger sync_is_active() mettra automatiquement is_active = false
-- car seuls les profils 'published' ont is_active = true

COMMIT;

-- Vérification finale: tous les profils devraient être en "approved" ou "pending"
SELECT
    'Total comédiens' as info,
    COUNT(*) as nombre
FROM comediens
UNION ALL
SELECT
    'Profils approved (validés non payés)',
    COUNT(*)
FROM comediens
WHERE status = 'approved'
UNION ALL
SELECT
    'Profils pending (en attente validation)',
    COUNT(*)
FROM comediens
WHERE status = 'pending'
UNION ALL
SELECT
    'Profils published (payés et publics)',
    COUNT(*)
FROM comediens
WHERE status = 'published';
