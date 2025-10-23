-- Migration optimisée pour récupérer TOUTES les données wp_usermeta manquantes
-- Corriger les conflits avec les colonnes existantes

-- ============================================================================
-- 1. AJOUTER SEULEMENT LES COLONNES MANQUANTES À LA TABLE comediens
-- ============================================================================

-- Photos (5 photos potentielles) - LE PLUS IMPORTANT !
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo1 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo3 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo4 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo5 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo_1 TEXT; -- variante

-- Vidéos et showreel - IMPORTANT !
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

-- Agence et agent (détaillé) - attention aux noms différents des existants
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

-- Contact détaillé
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS user_url TEXT;

-- Autres champs utiles
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS fielddata TEXT;

-- ============================================================================
-- 2. MIGRATION DES DONNÉES DEPUIS wp_usermeta (VERSION OPTIMISÉE)
-- ============================================================================

-- Méthode plus rapide avec UPDATE direct
UPDATE comediens SET
    -- Photos WordPress (PRIORITÉ 1)
    actor_photo1 = wp_data.actor_photo1,
    actor_photo2 = wp_data.actor_photo2,
    actor_photo3 = wp_data.actor_photo3,
    actor_photo4 = wp_data.actor_photo4,
    actor_photo5 = wp_data.actor_photo5,
    actor_photo_1 = wp_data.actor_photo_1,
    
    -- Showreel et vidéos (PRIORITÉ 2)
    actor_showreal = wp_data.actor_showreal,
    actor_video1 = wp_data.actor_video1,
    actor_video2 = wp_data.actor_video2,
    actor_video3 = wp_data.actor_video3,
    
    -- Compétences
    actor_dance_skills = wp_data.actor_dance_skills,
    actor_music_skills = wp_data.actor_music_skills,
    skills = wp_data.skills,
    
    -- Langues
    actor_languages_native = wp_data.actor_languages_native,
    actor_languages_native_other = wp_data.actor_languages_native_other,
    actor_languages_native2 = wp_data.actor_languages_native2,
    actor_languages_notions = wp_data.actor_languages_notions,
    actor_languages_notions_other = wp_data.actor_languages_notions_other,
    actor_languages_other = wp_data.actor_languages_other,
    
    -- Permis
    actor_driving_license = wp_data.actor_driving_license,
    
    -- Agence/Agent WordPress (différents des colonnes existantes)
    actor_agency_name = wp_data.actor_agency_name,
    actor_agency_email = wp_data.actor_agency_email,
    actor_agency_phone = wp_data.actor_agency_phone,
    actor_agent_name = wp_data.actor_agent_name,
    actor_agent_email = wp_data.actor_agent_email,
    actor_agent_phone = wp_data.actor_agent_phone,
    
    -- Réseaux sociaux
    actor_profile_facebook = wp_data.actor_profile_facebook,
    actor_profile_imdb = wp_data.actor_profile_imdb,
    actor_profile_linkedin = wp_data.actor_profile_linkedin,
    actor_profile_other = wp_data.actor_profile_other,
    
    -- Contact
    mobile_number = wp_data.mobile_number,
    phone_number = wp_data.phone_number,
    user_email = wp_data.user_email,
    user_url = wp_data.user_url,
    
    -- Autres
    fielddata = wp_data.fielddata,
    
    -- Mettre à jour timestamp
    updated_at = NOW()

FROM (
    SELECT 
        wu.user_email,
        MAX(CASE WHEN um.meta_key = 'actor_photo1' THEN um.meta_value END) as actor_photo1,
        MAX(CASE WHEN um.meta_key = 'actor_photo2' THEN um.meta_value END) as actor_photo2,
        MAX(CASE WHEN um.meta_key = 'actor_photo3' THEN um.meta_value END) as actor_photo3,
        MAX(CASE WHEN um.meta_key = 'actor_photo4' THEN um.meta_value END) as actor_photo4,
        MAX(CASE WHEN um.meta_key = 'actor_photo5' THEN um.meta_value END) as actor_photo5,
        MAX(CASE WHEN um.meta_key = 'actor_photo_1' THEN um.meta_value END) as actor_photo_1,
        MAX(CASE WHEN um.meta_key = 'actor_showreal' THEN um.meta_value END) as actor_showreal,
        MAX(CASE WHEN um.meta_key = 'actor_video1' THEN um.meta_value END) as actor_video1,
        MAX(CASE WHEN um.meta_key = 'actor_video2' THEN um.meta_value END) as actor_video2,
        MAX(CASE WHEN um.meta_key = 'actor_video3' THEN um.meta_value END) as actor_video3,
        MAX(CASE WHEN um.meta_key = 'actor_dance_skills' THEN um.meta_value END) as actor_dance_skills,
        MAX(CASE WHEN um.meta_key = 'actor_music_skills' THEN um.meta_value END) as actor_music_skills,
        MAX(CASE WHEN um.meta_key = 'skills' THEN um.meta_value END) as skills,
        MAX(CASE WHEN um.meta_key = 'actor_languages_native' THEN um.meta_value END) as actor_languages_native,
        MAX(CASE WHEN um.meta_key = 'actor_languages_native_other' THEN um.meta_value END) as actor_languages_native_other,
        MAX(CASE WHEN um.meta_key = 'actor_languages_native2' THEN um.meta_value END) as actor_languages_native2,
        MAX(CASE WHEN um.meta_key = 'actor_languages_notions' THEN um.meta_value END) as actor_languages_notions,
        MAX(CASE WHEN um.meta_key = 'actor_languages_notions_other' THEN um.meta_value END) as actor_languages_notions_other,
        MAX(CASE WHEN um.meta_key = 'actor_languages_other' THEN um.meta_value END) as actor_languages_other,
        MAX(CASE WHEN um.meta_key = 'actor_driving_license' THEN um.meta_value END) as actor_driving_license,
        MAX(CASE WHEN um.meta_key = 'actor_agency_name' THEN um.meta_value END) as actor_agency_name,
        MAX(CASE WHEN um.meta_key = 'actor_agency_email' THEN um.meta_value END) as actor_agency_email,
        MAX(CASE WHEN um.meta_key = 'actor_agency_phone' THEN um.meta_value END) as actor_agency_phone,
        MAX(CASE WHEN um.meta_key = 'actor_agent_name' THEN um.meta_value END) as actor_agent_name,
        MAX(CASE WHEN um.meta_key = 'actor_agent_email' THEN um.meta_value END) as actor_agent_email,
        MAX(CASE WHEN um.meta_key = 'actor_agent_phone' THEN um.meta_value END) as actor_agent_phone,
        MAX(CASE WHEN um.meta_key = 'actor_profile_facebook' THEN um.meta_value END) as actor_profile_facebook,
        MAX(CASE WHEN um.meta_key = 'actor_profile_imdb' THEN um.meta_value END) as actor_profile_imdb,
        MAX(CASE WHEN um.meta_key = 'actor_profile_linkedin' THEN um.meta_value END) as actor_profile_linkedin,
        MAX(CASE WHEN um.meta_key = 'actor_profile_other' THEN um.meta_value END) as actor_profile_other,
        MAX(CASE WHEN um.meta_key = 'mobile_number' THEN um.meta_value END) as mobile_number,
        MAX(CASE WHEN um.meta_key = 'phone_number' THEN um.meta_value END) as phone_number,
        MAX(CASE WHEN um.meta_key = 'user_email' THEN um.meta_value END) as user_email,
        MAX(CASE WHEN um.meta_key = 'user_url' THEN um.meta_value END) as user_url,
        MAX(CASE WHEN um.meta_key = 'fielddata' THEN um.meta_value END) as fielddata
    FROM wp_users wu
    JOIN wp_usermeta um ON wu.ID = um.user_id
    WHERE um.meta_key IN (
        'actor_photo1', 'actor_photo2', 'actor_photo3', 'actor_photo4', 'actor_photo5', 'actor_photo_1',
        'actor_showreal', 'actor_video1', 'actor_video2', 'actor_video3',
        'actor_dance_skills', 'actor_music_skills', 'skills',
        'actor_languages_native', 'actor_languages_native_other', 'actor_languages_native2',
        'actor_languages_notions', 'actor_languages_notions_other', 'actor_languages_other',
        'actor_driving_license',
        'actor_agency_name', 'actor_agency_email', 'actor_agency_phone',
        'actor_agent_name', 'actor_agent_email', 'actor_agent_phone',
        'actor_profile_facebook', 'actor_profile_imdb', 'actor_profile_linkedin', 'actor_profile_other',
        'mobile_number', 'phone_number', 'user_email', 'user_url', 'fielddata'
    )
    GROUP BY wu.user_email
) wp_data
WHERE comediens.email = wp_data.user_email;

-- ============================================================================
-- 3. VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Compter les nouvelles données récupérées
SELECT 
    COUNT(*) as total_comediens,
    COUNT(actor_resume) as avec_cv_existant,
    COUNT(actor_photo1) as avec_photo1_nouveau,
    COUNT(actor_photo2) as avec_photo2_nouveau,
    COUNT(actor_photo3) as avec_photo3_nouveau,
    COUNT(actor_photo4) as avec_photo4_nouveau,
    COUNT(actor_photo5) as avec_photo5_nouveau,
    COUNT(actor_showreal) as avec_showreel_nouveau,
    COUNT(actor_profile_facebook) as avec_facebook_nouveau
FROM comediens;

-- Voir quelques exemples de récupération
SELECT 
    id, first_name, last_name,
    CASE WHEN actor_photo1 IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_photo1,
    CASE WHEN actor_photo2 IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_photo2,
    CASE WHEN actor_showreal IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_showreel,
    CASE WHEN actor_profile_facebook IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_facebook
FROM comediens 
WHERE actor_photo1 IS NOT NULL OR actor_showreal IS NOT NULL
LIMIT 10;

-- Message de succès
SELECT 'Migration terminée avec succès ! 🎉' as status;