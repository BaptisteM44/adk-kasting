-- sql/functions.sql
-- Fonctions utilitaires pour ADKcasting

-- Fonction pour calculer l'âge à partir de la date de naissance
CREATE OR REPLACE FUNCTION calculate_age(birth_date TEXT)
RETURNS INTEGER AS $$
DECLARE
    age INTEGER;
    birth_parts TEXT[];
    birth_date_parsed DATE;
BEGIN
    -- Vérifier le format DD-MM-YYYY
    IF birth_date !~ '^\d{2}-\d{2}-\d{4}$' THEN
        RETURN NULL;
    END IF;

    -- Parser la date
    birth_parts := string_to_array(birth_date, '-');

    -- Vérifier les valeurs
    IF (birth_parts[1]::INTEGER NOT BETWEEN 1 AND 31) OR
       (birth_parts[2]::INTEGER NOT BETWEEN 1 AND 12) OR
       (birth_parts[3]::INTEGER NOT BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)) THEN
        RETURN NULL;
    END IF;

    -- Créer la date
    birth_date_parsed := make_date(
        birth_parts[3]::INTEGER, 
        birth_parts[2]::INTEGER, 
        birth_parts[1]::INTEGER
    );

    -- Calculer l'âge
    age := EXTRACT(YEAR FROM AGE(birth_date_parsed));

    RETURN age;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rechercher des comédiens avec filtres avancés
CREATE OR REPLACE FUNCTION search_comediens(
    p_gender TEXT DEFAULT NULL,
    p_age_min INTEGER DEFAULT NULL,
    p_age_max INTEGER DEFAULT NULL,
    p_ethnicity TEXT DEFAULT NULL,
    p_languages TEXT DEFAULT NULL,
    p_hair_color TEXT DEFAULT NULL,
    p_eye_color TEXT DEFAULT NULL,
    p_nationality TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_height_min INTEGER DEFAULT NULL,
    p_height_max INTEGER DEFAULT NULL,
    p_driving_license BOOLEAN DEFAULT NULL,
    p_experience_level TEXT DEFAULT NULL,
    p_build TEXT DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    phone TEXT,
    domiciliation TEXT,
    profile_picture TEXT,
    birth_date TEXT,
    calculated_age INTEGER,
    gender TEXT,
    nationality TEXT,
    city TEXT,
    height INTEGER,
    hair_color TEXT,
    eye_color TEXT,
    ethnicity TEXT,
    build TEXT,
    experience_level TEXT,
    native_language TEXT,
    languages TEXT[],
    dance_skills TEXT[],
    music_skills TEXT[],
    driving_license BOOLEAN,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
    total_records BIGINT;
BEGIN
    offset_val := (p_page - 1) * p_limit;

    -- Compter le total d'abord
    SELECT COUNT(*) INTO total_records
    FROM comediens c
    WHERE c.is_active = true
      AND (p_gender IS NULL OR c.gender = p_gender)
      AND (p_ethnicity IS NULL OR c.ethnicity = p_ethnicity)
      AND (p_hair_color IS NULL OR c.hair_color = p_hair_color)
      AND (p_eye_color IS NULL OR c.eye_color = p_eye_color)
      AND (p_nationality IS NULL OR c.nationality ILIKE '%' || p_nationality || '%')
      AND (p_city IS NULL OR c.city ILIKE '%' || p_city || '%')
      AND (p_languages IS NULL OR array_to_string(c.languages, ' ') ILIKE '%' || p_languages || '%')
      AND (p_height_min IS NULL OR c.height >= p_height_min)
      AND (p_height_max IS NULL OR c.height <= p_height_max)
      AND (p_driving_license IS NULL OR c.driving_license = p_driving_license)
      AND (p_experience_level IS NULL OR c.experience_level = p_experience_level)
      AND (p_build IS NULL OR c.build = p_build)
      AND (
        (p_age_min IS NULL AND p_age_max IS NULL) OR
        (
          calculate_age(c.birth_date) IS NOT NULL AND
          calculate_age(c.birth_date) BETWEEN COALESCE(p_age_min, 0) AND COALESCE(p_age_max, 150)
        )
      );

    -- Retourner les résultats paginés
    RETURN QUERY
    SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.display_name,
        c.phone,
        c.domiciliation,
        c.profile_picture,
        c.birth_date,
        calculate_age(c.birth_date) as calculated_age,
        c.gender,
        c.nationality,
        c.city,
        c.height,
        c.hair_color,
        c.eye_color,
        c.ethnicity,
        c.build,
        c.experience_level,
        c.native_language,
        c.languages,
        c.dance_skills,
        c.music_skills,
        c.driving_license,
        c.created_at,
        total_records
    FROM comediens c
    WHERE c.is_active = true
      AND (p_gender IS NULL OR c.gender = p_gender)
      AND (p_ethnicity IS NULL OR c.ethnicity = p_ethnicity)
      AND (p_hair_color IS NULL OR c.hair_color = p_hair_color)
      AND (p_eye_color IS NULL OR c.eye_color = p_eye_color)
      AND (p_nationality IS NULL OR c.nationality ILIKE '%' || p_nationality || '%')
      AND (p_city IS NULL OR c.city ILIKE '%' || p_city || '%')
      AND (p_languages IS NULL OR array_to_string(c.languages, ' ') ILIKE '%' || p_languages || '%')
      AND (p_height_min IS NULL OR c.height >= p_height_min)
      AND (p_height_max IS NULL OR c.height <= p_height_max)
      AND (p_driving_license IS NULL OR c.driving_license = p_driving_license)
      AND (p_experience_level IS NULL OR c.experience_level = p_experience_level)
      AND (p_build IS NULL OR c.build = p_build)
      AND (
        (p_age_min IS NULL AND p_age_max IS NULL) OR
        (
          calculate_age(c.birth_date) IS NOT NULL AND
          calculate_age(c.birth_date) BETWEEN COALESCE(p_age_min, 0) AND COALESCE(p_age_max, 150)
        )
      )
    ORDER BY c.last_name, c.first_name
    LIMIT p_limit
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_comediens BIGINT,
    active_comediens BIGINT,
    rated_comediens BIGINT,
    average_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM comediens) as total_comediens,
        (SELECT COUNT(*) FROM comediens WHERE is_active = true) as active_comediens,
        (SELECT COUNT(DISTINCT comedien_id) FROM admin_ratings) as rated_comediens,
        (SELECT ROUND(AVG(rating), 2) FROM admin_ratings) as average_rating;
END;
$$ LANGUAGE plpgsql;
