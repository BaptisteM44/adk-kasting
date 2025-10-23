-- Migration optimisée pour récupérer les données WordPress SANS conflit
-- Évite les colonnes existantes qui causent des erreurs de type

-- ============================================================================
-- 1. AJOUTER SEULEMENT LES COLONNES MANQUANTES (éviter les conflits)
-- ============================================================================

-- Photos WordPress (5 photos potentielles)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo1 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo3 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo4 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_photo5 TEXT;

-- CV et documents WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_resume TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS certificates TEXT;

-- Vidéos et showreel WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_showreal TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video1 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_video3 TEXT;

-- Compétences détaillées WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_dance_skills TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_music_skills TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_skills TEXT; -- éviter conflit avec 'skills' existant

-- Langues WordPress (garder les noms d'origine)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native_other TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_native2 TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_notions TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_notions_other TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_languages_other TEXT;

-- Permis WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_driving_license TEXT;

-- Agence et agent WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_name TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agency_phone TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_name TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_agent_phone TEXT;

-- Réseaux sociaux WordPress
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_facebook TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_imdb TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_linkedin TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_profile_other TEXT;

-- Infos personnelles WordPress (éviter conflits)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_nationality TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_experience TEXT; -- éviter conflit
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS actor_size TEXT; -- taille WordPress

-- Contact WordPress (éviter conflits avec colonnes existantes)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_mobile_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_phone_number TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_user_email TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS user_url TEXT;

-- Autres champs WordPress (éviter conflits)
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_fielddata TEXT;
ALTER TABLE comediens ADD COLUMN IF NOT EXISTS wp_activity_domain TEXT;

-- ============================================================================
-- 2. MIGRATION EFFICACE DES DONNÉES - UPDATE DIRECT AVEC JOINTURE
-- ============================================================================

-- Mettre à jour toutes les données en une seule requête optimisée
UPDATE comediens 
SET 
    -- Photos WordPress
    actor_photo1 = wp_data.actor_photo1,
    actor_photo2 = wp_data.actor_photo2,
    actor_photo3 = wp_data.actor_photo3,
    actor_photo4 = wp_data.actor_photo4,
    actor_photo5 = wp_data.actor_photo5,
    
    -- CV et documents
    actor_resume = wp_data.actor_resume,
    certificates = wp_data.certificates,
    
    -- Vidéos
    actor_showreal = wp_data.actor_showreal,
    actor_video1 = wp_data.actor_video1,
    actor_video2 = wp_data.actor_video2,
    actor_video3 = wp_data.actor_video3,
    
    -- Compétences
    actor_dance_skills = wp_data.actor_dance_skills,
    actor_music_skills = wp_data.actor_music_skills,
    wp_skills = wp_data.skills,
    
    -- Langues WordPress
    actor_languages_native = wp_data.actor_languages_native,
    actor_languages_native_other = wp_data.actor_languages_native_other,
    actor_languages_native2 = wp_data.actor_languages_native2,
    actor_languages_notions = wp_data.actor_languages_notions,
    actor_languages_notions_other = wp_data.actor_languages_notions_other,
    actor_languages_other = wp_data.actor_languages_other,
    
    -- Permis
    actor_driving_license = wp_data.actor_driving_license,
    
    -- Agence/Agent
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
    
    -- Infos personnelles
    actor_nationality = wp_data.actor_nationality,
    wp_experience = wp_data.experience,
    actor_size = wp_data.size,
    
    -- Contact
    wp_mobile_number = wp_data.mobile_number,
    wp_phone_number = wp_data.phone_number,
    wp_user_email = wp_data.user_email,
    user_url = wp_data.user_url,
    
    -- Autres
    wp_fielddata = wp_data.fielddata,
    wp_activity_domain = wp_data.activity_domain,
    
    -- Timestamp
    updated_at = NOW()

FROM (
    SELECT 
        wu.user_email as wp_user_email,
        MAX(CASE WHEN um.meta_key = 'actor_photo1' THEN um.meta_value END) as actor_photo1,
        MAX(CASE WHEN um.meta_key = 'actor_photo2' THEN um.meta_value END) as actor_photo2,
        MAX(CASE WHEN um.meta_key = 'actor_photo3' THEN um.meta_value END) as actor_photo3,
        MAX(CASE WHEN um.meta_key = 'actor_photo4' THEN um.meta_value END) as actor_photo4,
        MAX(CASE WHEN um.meta_key = 'actor_photo5' THEN um.meta_value END) as actor_photo5,
        MAX(CASE WHEN um.meta_key = 'actor_resume' THEN um.meta_value END) as actor_resume,
        MAX(CASE WHEN um.meta_key = 'certificates' THEN um.meta_value END) as certificates,
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
        MAX(CASE WHEN um.meta_key = 'actor_nationality' THEN um.meta_value END) as actor_nationality,
        MAX(CASE WHEN um.meta_key = 'experience' THEN um.meta_value END) as experience,
        MAX(CASE WHEN um.meta_key = 'size' THEN um.meta_value END) as size,
        MAX(CASE WHEN um.meta_key = 'mobile_number' THEN um.meta_value END) as mobile_number,
        MAX(CASE WHEN um.meta_key = 'phone_number' THEN um.meta_value END) as phone_number,
        MAX(CASE WHEN um.meta_key = 'user_email' THEN um.meta_value END) as user_email,
        MAX(CASE WHEN um.meta_key = 'user_url' THEN um.meta_value END) as user_url,
        MAX(CASE WHEN um.meta_key = 'fielddata' THEN um.meta_value END) as fielddata,
        MAX(CASE WHEN um.meta_key = 'activity_domain' THEN um.meta_value END) as activity_domain
    FROM wp_users wu
    JOIN wp_usermeta um ON wu.ID = um.user_id
    WHERE um.meta_key IN (
        'actor_photo1', 'actor_photo2', 'actor_photo3', 'actor_photo4', 'actor_photo5',
        'actor_resume', 'certificates', 'actor_showreal', 'actor_video1', 'actor_video2', 'actor_video3',
        'actor_dance_skills', 'actor_music_skills', 'skills',
        'actor_languages_native', 'actor_languages_native_other', 'actor_languages_native2',
        'actor_languages_notions', 'actor_languages_notions_other', 'actor_languages_other',
        'actor_driving_license', 'actor_agency_name', 'actor_agency_email', 'actor_agency_phone',
        'actor_agent_name', 'actor_agent_email', 'actor_agent_phone',
        'actor_profile_facebook', 'actor_profile_imdb', 'actor_profile_linkedin', 'actor_profile_other',
        'actor_nationality', 'experience', 'size', 'mobile_number', 'phone_number',
        'user_email', 'user_url', 'fielddata', 'activity_domain'
    )
    GROUP BY wu.user_email
) wp_data
WHERE comediens.email = wp_data.wp_user_email;

-- ============================================================================
-- 3. VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Compter les données récupérées
SELECT 
    COUNT(*) as total_comediens,
    COUNT(actor_resume) as avec_cv,
    COUNT(actor_showreal) as avec_showreel,
    COUNT(actor_photo1) as avec_photo1,
    COUNT(actor_photo2) as avec_photo2,
    COUNT(actor_photo3) as avec_photo3,
    COUNT(actor_photo4) as avec_photo4,
    COUNT(actor_photo5) as avec_photo5,
    COUNT(actor_profile_facebook) as avec_facebook,
    COUNT(actor_profile_imdb) as avec_imdb
FROM comediens;

-- Exemples de données récupérées
SELECT 
    id, first_name, last_name,
    CASE WHEN actor_resume IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_cv,
    CASE WHEN actor_showreal IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_showreel,
    CASE WHEN actor_photo1 IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_photo1,
    CASE WHEN actor_photo2 IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_photo2,
    CASE WHEN actor_profile_facebook IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_facebook
FROM comediens 
WHERE actor_resume IS NOT NULL OR actor_showreal IS NOT NULL
LIMIT 5;