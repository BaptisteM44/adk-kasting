-- Migration : Ajouter des colonnes pour les compétences personnalisées "Autre"
-- Date : 3 décembre 2025

-- Ajouter les colonnes pour stocker les compétences personnalisées (arrays pour multiples valeurs)
ALTER TABLE comediens
ADD COLUMN IF NOT EXISTS dance_skills_other TEXT[],
ADD COLUMN IF NOT EXISTS music_skills_other TEXT[],
ADD COLUMN IF NOT EXISTS diverse_skills_other TEXT[],
ADD COLUMN IF NOT EXISTS desired_activities_other TEXT[];

-- Commentaires sur les colonnes
COMMENT ON COLUMN comediens.dance_skills_other IS 'Compétences de danse personnalisées saisies par l''utilisateur (champ "Autre")';
COMMENT ON COLUMN comediens.music_skills_other IS 'Compétences musicales personnalisées saisies par l''utilisateur (champ "Autre")';
COMMENT ON COLUMN comediens.diverse_skills_other IS 'Autres compétences personnalisées saisies par l''utilisateur (champ "Autre")';
COMMENT ON COLUMN comediens.desired_activities_other IS 'Activités souhaitées personnalisées saisies par l''utilisateur (champ "Autre")';
