-- sql/schema.sql
-- Schéma de base de données pour ADKcasting
-- À exécuter dans Supabase SQL Editor

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs (complément à auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'comedien', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des films pour le carousel
CREATE TABLE IF NOT EXISTS films (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des comédiens
CREATE TABLE IF NOT EXISTS comediens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Informations de base
  email TEXT NOT NULL UNIQUE,
  user_pass TEXT, -- Mot de passe haché WordPress (optionnel pour nouveaux utilisateurs)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_fixe TEXT, -- Téléphone fixe (optionnel)
  domiciliation TEXT NOT NULL,
  profile_picture TEXT,

  -- Adresse complète
  street TEXT, -- Adresse postale
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Belgique',

  -- Informations personnelles
  birth_date TEXT, -- Format DD-MM-YYYY
  age INTEGER, -- Calculé à partir de birth_date
  gender TEXT NOT NULL CHECK (gender IN ('Masculin', 'Féminin', 'Autre')),
  nationality TEXT NOT NULL,
  city TEXT NOT NULL,

  -- Caractéristiques physiques
  height INTEGER NOT NULL, -- en cm
  hair_color TEXT NOT NULL,
  eye_color TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  build TEXT NOT NULL,

  -- Compétences
  experience_level TEXT NOT NULL,
  native_language TEXT NOT NULL,
  languages TEXT[] DEFAULT '{}',
  languages_fluent TEXT[] DEFAULT '{}', -- Langues parlées couramment
  languages_notions TEXT[] DEFAULT '{}', -- Notions de langues
  dance_skills TEXT[] DEFAULT '{}',
  music_skills TEXT[] DEFAULT '{}',
  driving_license BOOLEAN DEFAULT false,
  driving_licenses TEXT[] DEFAULT '{}', -- ['Auto', 'Moto', 'Camion', 'Avion / hélicoptère']
  diverse_skills TEXT[] DEFAULT '{}', -- Chant, Doublage, Acrobatie, etc.
  desired_activities TEXT[] DEFAULT '{}', -- Long métrage, Court métrage, etc.

  -- Photos et médias
  photos TEXT[] DEFAULT '{}', -- URLs des 5 photos maximum
  showreel_url TEXT,
  video_1_url TEXT,
  video_2_url TEXT,

  -- Agent/Agence
  agency_name TEXT,
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,

  -- Deuxième agence (optionnel)
  agency_name_2 TEXT,
  agent_name_2 TEXT,
  agent_email_2 TEXT,
  agent_phone_2 TEXT,

  -- Réseaux sociaux et web
  website_url TEXT,
  imdb_url TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  other_profile_url TEXT,

  -- Formations et expérience
  professional_experience TEXT, -- Expériences professionnelles (texte libre)
  training_diplomas TEXT, -- Formations et diplômes (texte libre)
  cv_pdf_url TEXT, -- URL du CV PDF

  -- Métadonnées
  is_active BOOLEAN DEFAULT false, -- Par défaut en attente de validation
  admin_rating INTEGER CHECK (admin_rating >= 1 AND admin_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des commentaires administratifs
CREATE TABLE IF NOT EXISTS admin_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comedien_id UUID REFERENCES comediens(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_name TEXT NOT NULL DEFAULT 'Admin',
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_comediens_active ON comediens(is_active);
CREATE INDEX IF NOT EXISTS idx_comediens_gender ON comediens(gender);
CREATE INDEX IF NOT EXISTS idx_comediens_ethnicity ON comediens(ethnicity);
CREATE INDEX IF NOT EXISTS idx_comediens_city ON comediens(city);
CREATE INDEX IF NOT EXISTS idx_comediens_nationality ON comediens(nationality);
CREATE INDEX IF NOT EXISTS idx_comediens_height ON comediens(height);
CREATE INDEX IF NOT EXISTS idx_comediens_hair_color ON comediens(hair_color);
CREATE INDEX IF NOT EXISTS idx_comediens_eye_color ON comediens(eye_color);
CREATE INDEX IF NOT EXISTS idx_comediens_experience ON comediens(experience_level);
CREATE INDEX IF NOT EXISTS idx_comediens_languages ON comediens USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_comediens_languages_fluent ON comediens USING GIN(languages_fluent);
CREATE INDEX IF NOT EXISTS idx_comediens_driving_licenses ON comediens USING GIN(driving_licenses);
CREATE INDEX IF NOT EXISTS idx_comediens_desired_activities ON comediens USING GIN(desired_activities);
CREATE INDEX IF NOT EXISTS idx_comediens_name ON comediens(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_films_active_order ON films(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_admin_comments_comedien ON admin_comments(comedien_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_films_updated_at 
    BEFORE UPDATE ON films 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comediens_updated_at 
    BEFORE UPDATE ON comediens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_comments_updated_at 
    BEFORE UPDATE ON admin_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données d'exemple pour les films
INSERT INTO films (title, year, image_url, order_index) VALUES
('Inception', 2010, '/films/inception.jpg', 1),
('Interstellar', 2014, '/films/interstellar.jpg', 2),
('The Dark Knight', 2008, '/films/dark-knight.jpg', 3),
('Pulp Fiction', 1994, '/films/pulp-fiction.jpg', 4),
('The Matrix', 1999, '/films/matrix.jpg', 5),
('Goodfellas', 1990, '/films/goodfellas.jpg', 6),
('The Godfather', 1972, '/films/godfather.jpg', 7),
('Casablanca', 1942, '/films/casablanca.jpg', 8)
ON CONFLICT DO NOTHING;

-- Comptes d'exemple (à créer dans Supabase Auth puis lier ici)
-- Admin: admin@ADKcasting.com / admin123
-- Comédien: comedien@ADKcasting.com / comedien123
