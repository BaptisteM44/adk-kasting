-- Script SQL pour créer des données de test
-- À exécuter dans Supabase SQL Editor

-- Insérer un comédien de test en attente de validation
INSERT INTO comediens (
  email,
  password,
  first_name,
  last_name,
  display_name,
  phone,
  domiciliation,
  birth_date,
  age,
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
  is_active
) VALUES (
  'test@comedien.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewVyVa2e8/8kk12q', -- password123
  'Jean',
  'Dupont',
  'Jean Dupont',
  '0123456789',
  'Paris',
  '15-05-1990',
  33,
  'Masculin',
  'Française',
  'Paris',
  175,
  'Brun',
  'Marron',
  'Caucasien',
  'Mince',
  'Intermédiaire',
  'Français',
  false -- En attente de validation
);

-- Insérer un comédien validé
INSERT INTO comediens (
  email,
  password,
  first_name,
  last_name,
  display_name,
  phone,
  domiciliation,
  birth_date,
  age,
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
  is_active
) VALUES (
  'marie@comedienne.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewVyVa2e8/8kk12q', -- password123
  'Marie',
  'Martin',
  'Marie Martin',
  '0987654321',
  'Lyon',
  '20-08-1995',
  28,
  'Féminin',
  'Française',
  'Lyon',
  165,
  'Blonde',
  'Bleu',
  'Caucasien',
  'Mince',
  'Confirmé',
  'Français',
  true -- Validé
);

-- Insérer quelques commentaires de test
INSERT INTO admin_comments (
  comedien_id,
  admin_id,
  admin_name,
  comment
) VALUES (
  (SELECT id FROM comediens WHERE email = 'marie@comedienne.com'),
  'admin-id',
  'Admin Test',
  'Excellent profil, très professionnel lors du casting.'
);

INSERT INTO admin_comments (
  comedien_id,
  admin_id,
  admin_name,
  comment
) VALUES (
  (SELECT id FROM comediens WHERE email = 'marie@comedienne.com'),
  'admin-id',
  'Admin Test',
  'Rappeler pour le prochain projet de série TV.'
);