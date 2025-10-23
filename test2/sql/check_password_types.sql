-- Vérifier les types de hashs dans la base de données

-- Compter les différents types de hashs
SELECT 
  CASE 
    WHEN user_pass LIKE '$P$%' OR user_pass LIKE '$H$%' THEN 'WordPress (phpass)'
    WHEN user_pass LIKE '$2a$%' OR user_pass LIKE '$2b$%' OR user_pass LIKE '$2y$%' THEN 'bcrypt'
    WHEN user_pass IS NULL THEN 'Pas de mot de passe'
    ELSE 'Format inconnu'
  END AS hash_type,
  COUNT(*) as count
FROM comediens
GROUP BY hash_type
ORDER BY count DESC;

-- Afficher quelques exemples de chaque type
SELECT 
  id,
  email,
  display_name,
  LEFT(user_pass, 40) as hash_preview,
  CASE 
    WHEN user_pass LIKE '$P$%' OR user_pass LIKE '$H$%' THEN 'WordPress'
    WHEN user_pass LIKE '$2a$%' OR user_pass LIKE '$2b$%' OR user_pass LIKE '$2y$%' THEN 'bcrypt'
    ELSE 'Autre'
  END AS hash_type
FROM comediens
WHERE user_pass IS NOT NULL
LIMIT 10;
