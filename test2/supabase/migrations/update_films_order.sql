-- Migration : Ajouter hero_order et collaboration_order à la place de order_index
-- Date : 2025-01-29

-- Ajouter les nouvelles colonnes
ALTER TABLE films
ADD COLUMN IF NOT EXISTS hero_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS collaboration_order INTEGER DEFAULT 0;

-- Copier order_index dans les deux nouvelles colonnes
UPDATE films
SET hero_order = order_index,
    collaboration_order = order_index;

-- Supprimer l'ancienne colonne et son index
DROP INDEX IF EXISTS idx_films_order_index;
ALTER TABLE films DROP COLUMN IF EXISTS order_index;

-- Créer les nouveaux index
CREATE INDEX IF NOT EXISTS idx_films_hero_order ON films(hero_order);
CREATE INDEX IF NOT EXISTS idx_films_collaboration_order ON films(collaboration_order);

-- Vérifier
SELECT id, title, show_in_hero, hero_order, show_in_collaborations, collaboration_order FROM films ORDER BY hero_order LIMIT 5;
