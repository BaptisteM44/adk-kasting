-- Migration : Créer la table films pour gérer les images de films
-- Date : 2025-01-29

-- Créer la table films
CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_hero BOOLEAN DEFAULT false,
  show_in_collaborations BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_films_is_active ON films(is_active);
CREATE INDEX IF NOT EXISTS idx_films_order_index ON films(order_index);
CREATE INDEX IF NOT EXISTS idx_films_show_in_hero ON films(show_in_hero);
CREATE INDEX IF NOT EXISTS idx_films_show_in_collaborations ON films(show_in_collaborations);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_films_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER trigger_update_films_updated_at
  BEFORE UPDATE ON films
  FOR EACH ROW
  EXECUTE FUNCTION update_films_updated_at();

-- Insérer les films existants depuis le JSON
INSERT INTO films (title, year, image_url, order_index, is_active, show_in_hero, show_in_collaborations) VALUES
  ('Reflet dans un diamand Mort', 2013, '/images/films/image1.jpg', 1, true, true, true),
  ('La trève', 2001, '/images/films/augure.jpg', 2, true, true, true),
  ('l''art d''être heureux', 2013, '/images/films/l''artd''êtreheureux.jpg', 3, true, true, true),
  ('L''Hiver Dernier', 2022, '/images/films/image1.jpg', 4, true, true, true),
  ('La Volante', 2020, '/images/films/augure.jpg', 5, true, true, true),
  ('Hunted', 2024, '/images/films/l''artd''êtreheureux.jpg', 6, true, true, true),
  ('El Joven Karl Marx', 2019, '/images/films/image1.jpg', 7, true, true, true),
  ('Fils Unique', 2021, '/images/films/augure.jpg', 8, true, true, true),
  ('Les Amours Perdues', 2023, '/images/films/l''artd''êtreheureux.jpg', 9, true, true, true),
  ('Nuit Blanche', 2018, '/images/films/image1.jpg', 10, true, true, true),
  ('Le Dernier Voyage', 2017, '/images/films/augure.jpg', 11, true, true, true),
  ('Mémoires Oubliées', 2016, '/images/films/l''artd''êtreheureux.jpg', 12, true, true, true)
ON CONFLICT DO NOTHING;

-- Activer Row Level Security (RLS)
ALTER TABLE films ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut lire les films actifs
CREATE POLICY "Films actifs publics" ON films
  FOR SELECT
  USING (is_active = true);

-- Policy : Seuls les admins peuvent modifier les films
CREATE POLICY "Seuls les admins peuvent modifier films" ON films
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM comediens
      WHERE comediens.id::text = auth.uid()::text
      AND comediens.role = 'admin'
    )
  );

COMMENT ON TABLE films IS 'Table pour gérer les films affichés sur le site (carousel hero et section collaborations)';
COMMENT ON COLUMN films.show_in_hero IS 'Afficher ce film dans le carousel hero de la page d''accueil';
COMMENT ON COLUMN films.show_in_collaborations IS 'Afficher ce film dans la section Collaborations';
COMMENT ON COLUMN films.order_index IS 'Ordre d''affichage (plus petit = affiché en premier)';
