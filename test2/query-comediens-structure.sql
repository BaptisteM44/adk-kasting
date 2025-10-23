-- Requête pour voir la structure complète de la table comediens
-- Copiez-collez cette requête dans l'éditeur SQL de Supabase

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'comediens' 
ORDER BY ordinal_position;

-- OU pour voir des exemples de données avec toutes les colonnes :

SELECT * FROM comediens LIMIT 3;