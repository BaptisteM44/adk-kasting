-- Script de test pour la migration de deuxième agence
-- À exécuter après la migration pour valider

-- 1. Vérifier la structure de la table comediens
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'comediens' 
AND table_schema = 'public'
AND column_name LIKE '%agency%' OR column_name LIKE '%agent%'
ORDER BY ordinal_position;

-- 2. Test d'insertion avec deuxième agence
INSERT INTO comediens (
  email, 
  first_name, 
  last_name, 
  display_name, 
  phone, 
  domiciliation, 
  zip_code, 
  country,
  birth_date,
  gender,
  nationality,
  city,
  height,
  hair_color,
  eye_color,
  ethnicity,
  build,
  experience_level,
  native_language,
  -- Première agence
  agency_name,
  agent_name,
  agent_email,
  agent_phone,
  -- Deuxième agence
  agency_name_2,
  agent_name_2,
  agent_email_2,
  agent_phone_2
) VALUES (
  'test.migration@example.com',
  'Test',
  'Migration',
  'Test Migration',
  '+32 123 45 67 89',
  'Bruxelles',
  '1000',
  'Belgique',
  '1990-01-01',
  'Masculin',
  'Belge',
  'Bruxelles',
  180,
  'Brun',
  'Marron',
  'Européen',
  'Mince',
  'Débutant',
  'Français',
  -- Première agence
  'Agence Principale',
  'Agent Principal',
  'agent@agenceprincipal.com',
  '+32 111 11 11 11',
  -- Deuxième agence
  'Agence Secondaire',
  'Agent Secondaire',
  'agent@agencesecondaire.com',
  '+32 222 22 22 22'
);

-- 3. Vérifier que l'insertion a fonctionné
SELECT 
  email,
  first_name,
  last_name,
  agency_name,
  agent_name,
  agent_email,
  agency_name_2,
  agent_name_2,
  agent_email_2
FROM comediens 
WHERE email = 'test.migration@example.com';

-- 4. Nettoyer le test
DELETE FROM comediens WHERE email = 'test.migration@example.com';

-- 5. Statistiques sur l'utilisation des deuxièmes agences
SELECT 
  COUNT(*) as total_comediens,
  COUNT(agency_name) as avec_agence_1,
  COUNT(agency_name_2) as avec_agence_2,
  ROUND(
    COUNT(agency_name_2)::numeric / COUNT(*)::numeric * 100, 2
  ) as pourcentage_double_agence
FROM comediens;