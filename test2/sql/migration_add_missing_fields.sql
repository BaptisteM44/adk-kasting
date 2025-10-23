-- Migration pour ajouter les champs manquants du formulaire d'inscription
-- À exécuter dans Supabase SQL Editor
-- ATTENTION: Cette migration ajoute des colonnes à la table existante

-- Ajout des nouveaux champs à la table comediens
ALTER TABLE comediens 
ADD COLUMN IF NOT EXISTS phone_fixe TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Belgique',
ADD COLUMN IF NOT EXISTS languages_fluent TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_notions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS driving_licenses TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS diverse_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS desired_activities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS showreel_url TEXT,
ADD COLUMN IF NOT EXISTS video_1_url TEXT,
ADD COLUMN IF NOT EXISTS video_2_url TEXT,
ADD COLUMN IF NOT EXISTS agency_name TEXT,
ADD COLUMN IF NOT EXISTS agent_name TEXT,
ADD COLUMN IF NOT EXISTS agent_email TEXT,
ADD COLUMN IF NOT EXISTS agent_phone TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS imdb_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS other_profile_url TEXT,
ADD COLUMN IF NOT EXISTS professional_experience TEXT,
ADD COLUMN IF NOT EXISTS training_diplomas TEXT,
ADD COLUMN IF NOT EXISTS cv_pdf_url TEXT;

-- Migration des données existantes
-- Déplacer l'image de profil vers le premier élément du tableau photos
UPDATE comediens 
SET photos = ARRAY[profile_picture]
WHERE profile_picture IS NOT NULL AND profile_picture != '';

-- Remplir zip_code avec une valeur par défaut basée sur la ville (si nécessaire)
UPDATE comediens 
SET zip_code = '1000' -- Code postal par défaut pour Bruxelles
WHERE zip_code IS NULL;

-- Ajout des nouveaux index pour les performances
CREATE INDEX IF NOT EXISTS idx_comediens_languages_fluent ON comediens USING GIN(languages_fluent);
CREATE INDEX IF NOT EXISTS idx_comediens_languages_notions ON comediens USING GIN(languages_notions);
CREATE INDEX IF NOT EXISTS idx_comediens_driving_licenses ON comediens USING GIN(driving_licenses);
CREATE INDEX IF NOT EXISTS idx_comediens_diverse_skills ON comediens USING GIN(diverse_skills);
CREATE INDEX IF NOT EXISTS idx_comediens_desired_activities ON comediens USING GIN(desired_activities);
CREATE INDEX IF NOT EXISTS idx_comediens_photos ON comediens USING GIN(photos);
CREATE INDEX IF NOT EXISTS idx_comediens_zip_code ON comediens(zip_code);
CREATE INDEX IF NOT EXISTS idx_comediens_country ON comediens(country);

-- Mise à jour du trigger pour inclure les nouveaux champs dans updated_at
-- (Le trigger existant fonctionne déjà pour toutes les colonnes)

COMMENT ON COLUMN comediens.languages IS 'Langues maternelles';
COMMENT ON COLUMN comediens.languages_fluent IS 'Langues parlées couramment';
COMMENT ON COLUMN comediens.languages_notions IS 'Notions de langues';
COMMENT ON COLUMN comediens.driving_licenses IS 'Types de permis: Auto, Moto, Camion, Avion / hélicoptère';
COMMENT ON COLUMN comediens.diverse_skills IS 'Chant, Doublage, Acrobatie, Art martial, Sport de combat, Equitation';
COMMENT ON COLUMN comediens.desired_activities IS 'Long métrage, Court métrage, Film d''étudiant, Publicité, Doublage, Films d''entreprise, Films institutionnels';
COMMENT ON COLUMN comediens.photos IS 'URLs des photos (maximum 5)';
COMMENT ON COLUMN comediens.professional_experience IS 'Expériences professionnelles (texte libre)';
COMMENT ON COLUMN comediens.training_diplomas IS 'Formations et diplômes (texte libre)';

-- Vérification des nouvelles colonnes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'comediens' 
AND column_name IN ('phone_fixe', 'languages_fluent', 'photos', 'agent_name', 'zip_code')
ORDER BY column_name;