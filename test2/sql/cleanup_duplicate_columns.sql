-- Nettoyage des colonnes en double créées par erreur
-- Ces colonnes sont vides ou contiennent des données corrompues
-- Les vraies données sont dans les colonnes WordPress (actor_*, wp_*)

-- ATTENTION: Vérifiez d'abord que ces colonnes ne sont pas utilisées!
-- Vous pouvez commenter les colonnes que vous voulez garder

ALTER TABLE comediens DROP COLUMN IF EXISTS dance_skills;
ALTER TABLE comediens DROP COLUMN IF EXISTS music_skills;
ALTER TABLE comediens DROP COLUMN IF EXISTS diverse_skills;
ALTER TABLE comediens DROP COLUMN IF EXISTS driving_licenses;
ALTER TABLE comediens DROP COLUMN IF EXISTS languages;
ALTER TABLE comediens DROP COLUMN IF EXISTS languages_fluent;

-- Afficher les colonnes restantes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comediens'
  AND column_name LIKE '%skill%'
  OR column_name LIKE '%danc%'
  OR column_name LIKE '%music%'
  OR column_name LIKE '%driv%'
ORDER BY column_name;
