-- Migration : Ajouter les colonnes show_in_hero et show_in_collaborations à la table films existante
-- Date : 2025-01-29

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE films
ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_in_collaborations BOOLEAN DEFAULT false;

-- Mettre à jour les films existants pour qu'ils apparaissent partout par défaut
UPDATE films
SET show_in_hero = true, show_in_collaborations = true
WHERE show_in_hero IS NULL OR show_in_collaborations IS NULL;

-- Vérifier que ça a fonctionné
SELECT id, title, show_in_hero, show_in_collaborations FROM films LIMIT 5;
