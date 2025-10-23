-- Migration complète pour récupérer TOUTES les données wp_usermeta
-- Garder les noms d'origine, ne rien perdre !

-- ============================================================================
-- 1. AJOUTER TOUTES LES COLONNES MANQUANTES À LA TABLE comediens
-- ============================================================================

-- Photos (5 photos potentielles)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo1 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo3 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo4 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo5 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo_1 TEXT; -- variante

-- CV et documents
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_resume TEXT; -- LE VRAI CV !
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS certificates TEXT;

-- Vidéos et showreel
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_showreal TEXT; -- LE VRAI SHOWREEL !
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video1 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video3 TEXT;

-- Compétences détaillées
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_dance_skills TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_music_skills TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS skills TEXT;

-- Langues détaillées (garder les noms WP)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native_other TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_notions TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_notions_other TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_other TEXT;

-- Permis et conduite
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_driving_license TEXT;

-- Agence et agent (détaillé)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_name TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_phone TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_name TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_phone TEXT;

-- Réseaux sociaux (garder noms WP)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_facebook TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_imdb TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_linkedin TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_other TEXT;

-- Infos personnelles manquantes
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_nationality TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS experience TEXT; -- différent de experience_level
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_size TEXT; -- taille WordPress (différent de height)

-- Contact détaillé
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS user_url TEXT;

-- Autres champs utiles
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS fielddata TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS activity_domain TEXT;

-- ============================================================================
-- 2. MIGRATION DES DONNÉES DEPUIS wp_usermeta
-- ============================================================================

-- Fonction pour migrer toutes les données en une fois
DO $$
DECLARE
    rec RECORD;
    user_data JSONB;
BEGIN
    -- Pour chaque utilisateur dans comediens, récupérer ses métadonnées
    FOR rec IN SELECT id, email FROM comediens LOOP
        -- Construire un objet JSON avec toutes les métadonnées
        SELECT jsonb_object_agg(um.meta_key, um.meta_value) INTO user_data
        FROM wp_users wu
        JOIN wp_usermeta um ON wu.ID = um.user_id
        WHERE wu.user_email = rec.email;
        
        IF user_data IS NOT NULL THEN
            -- Mettre à jour le comédien avec toutes ses données
            UPDATE comediens SET
                -- Photos
                actor_photo1 = user_data->>'actor_photo1',
                actor_photo2 = user_data->>'actor_photo2',
                actor_photo3 = user_data->>'actor_photo3',
                actor_photo4 = user_data->>'actor_photo4',
                actor_photo5 = user_data->>'actor_photo5',
                actor_photo_1 = user_data->>'actor_photo_1',
                
                -- CV et documents
                actor_resume = user_data->>'actor_resume',
                certificates = user_data->>'certificates',
                
                -- Vidéos
                actor_showreal = user_data->>'actor_showreal',
                actor_video1 = user_data->>'actor_video1',
                actor_video2 = user_data->>'actor_video2',
                actor_video3 = user_data->>'actor_video3',
                
                -- Compétences
                actor_dance_skills = user_data->>'actor_dance_skills',
                actor_music_skills = user_data->>'actor_music_skills',
                skills = user_data->>'skills',
                
                -- Langues
                actor_languages_native = user_data->>'actor_languages_native',
                actor_languages_native_other = user_data->>'actor_languages_native_other',
                actor_languages_native2 = user_data->>'actor_languages_native2',
                actor_languages_notions = user_data->>'actor_languages_notions',
                actor_languages_notions_other = user_data->>'actor_languages_notions_other',
                actor_languages_other = user_data->>'actor_languages_other',
                
                -- Permis
                actor_driving_license = user_data->>'actor_driving_license',
                
                -- Agence/Agent
                actor_agency_name = user_data->>'actor_agency_name',
                actor_agency_email = user_data->>'actor_agency_email',
                actor_agency_phone = user_data->>'actor_agency_phone',
                actor_agent_name = user_data->>'actor_agent_name',
                actor_agent_email = user_data->>'actor_agent_email',
                actor_agent_phone = user_data->>'actor_agent_phone',
                
                -- Réseaux sociaux
                actor_profile_facebook = user_data->>'actor_profile_facebook',
                actor_profile_imdb = user_data->>'actor_profile_imdb',
                actor_profile_linkedin = user_data->>'actor_profile_linkedin',
                actor_profile_other = user_data->>'actor_profile_other',
                
                -- Infos personnelles
                actor_nationality = user_data->>'actor_nationality',
                experience = user_data->>'experience',
                actor_size = user_data->>'size',
                
                -- Contact
                mobile_number = user_data->>'mobile_number',
                phone_number = user_data->>'phone_number',
                user_email = user_data->>'user_email',
                user_url = user_data->>'user_url',
                
                -- Autres
                fielddata = user_data->>'fielddata',
                activity_domain = user_data->>'activity_domain',
                
                -- Mettre à jour timestamp
                updated_at = NOW()
                
            WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 3. VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Compter les CV récupérés
SELECT 
    COUNT(*) as total_comediens,
    COUNT(actor_resume) as avec_cv,
    COUNT(actor_showreal) as avec_showreel,
    COUNT(actor_photo1) as avec_photo1,
    COUNT(actor_photo2) as avec_photo2,
    COUNT(actor_photo3) as avec_photo3,
    COUNT(actor_photo4) as avec_photo4,
    COUNT(actor_photo5) as avec_photo5
FROM comediens;

-- Voir quelques exemples
SELECT 
    id, first_name, last_name,
    CASE WHEN actor_resume IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_cv,
    CASE WHEN actor_showreal IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_showreel,
    CASE WHEN actor_photo1 IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_photo1
FROM comediens 
WHERE actor_resume IS NOT NULL OR actor_showreal IS NOT NULL
LIMIT 10;