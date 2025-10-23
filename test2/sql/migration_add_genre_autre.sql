-- Migration pour ajouter "Autre" comme option de genre
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer l'ancienne contrainte CHECK sur le genre
ALTER TABLE comediens DROP CONSTRAINT IF EXISTS comediens_gender_check;

-- 2. Ajouter la nouvelle contrainte CHECK incluant "Autre"
ALTER TABLE comediens ADD CONSTRAINT comediens_gender_check 
CHECK (gender IN ('Masculin', 'Féminin', 'Autre'));

-- 3. Vérifier que la contrainte a été appliquée
SELECT conname, consrc FROM pg_constraint 
WHERE conname = 'comediens_gender_check';