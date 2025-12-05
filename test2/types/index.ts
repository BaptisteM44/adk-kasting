// types/index.ts

export interface User {
  id: string
  email: string
  role: 'public' | 'comedien' | 'admin'
  created_at: string
  updated_at: string
}

export interface Comedien {
  id: string
  user_id?: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  phone: string
  domiciliation: string
  profile_picture?: string

  // Adresse complète
  street?: string
  zip_code: string
  country: string

  // Informations personnelles
  birth_date: string
  age?: number
  gender: 'Masculin' | 'Féminin' | 'Autre'
  nationality: string
  city: string

  // Caractéristiques physiques
  height: number // en cm
  hair_color: string
  eye_color: string
  ethnicity: string // Type dans tes filtres
  build: string

  // Compétences
  experience_level: string
  native_language: string

  // Photos et médias (WordPress format)
  photos: string[] // URLs des photos (max 5) - format migré
  actor_photo1?: string // Photo 1 WordPress
  actor_photo2?: string // Photo 2 WordPress  
  actor_photo3?: string // Photo 3 WordPress
  actor_photo4?: string // Photo 4 WordPress
  actor_photo5?: string // Photo 5 WordPress
  actor_photo_1?: string // Variante photo WordPress
  showreel_url?: string // URL showreel (format migré)
  actor_showreal?: string // Showreel WordPress
  actor_video1?: string // Vidéo 1 WordPress
  actor_video2?: string // Vidéo 2 WordPress
  actor_video3?: string // Vidéo 3 WordPress

  // Agent/Agence (WordPress format détaillé)
  agency_name?: string // Format migré
  agent_name?: string // Format migré
  agent_email?: string // Format migré
  agent_phone?: string // Format migré
  actor_agency_name?: string // Nom agence WordPress
  actor_agency_email?: string // Email agence WordPress
  actor_agency_phone?: string // Téléphone agence WordPress
  actor_agent_name?: string // Nom agent WordPress
  actor_agent_email?: string // Email agent WordPress
  actor_agent_phone?: string // Téléphone agent WordPress

  // Deuxième agence/agent (extension pour formulaire)
  agency_name_2?: string
  agent_name_2?: string
  agent_email_2?: string
  agent_phone_2?: string

  // Réseaux sociaux et web (WordPress format détaillé)
  website_url?: string // Format migré
  imdb_url?: string // Format migré
  facebook_url?: string // Format migré
  linkedin_url?: string // Format migré
  other_profile_url?: string // Format migré
  actor_profile_facebook?: string // Facebook WordPress
  actor_profile_imdb?: string // IMDB WordPress
  actor_profile_linkedin?: string // LinkedIn WordPress
  actor_profile_other?: string // Autre profil WordPress
  user_url?: string // URL utilisateur WordPress

  // Formations et expérience (WordPress format détaillé)
  actor_resume?: string // CV WordPress - LE VRAI CV !
  certificates?: string // Certificats WordPress
  experience?: string // Expérience WordPress (différent de experience_level)

  // Compétences détaillées (WordPress format)
  actor_dance_skills?: string // Compétences danse WordPress
  actor_music_skills?: string // Compétences musique WordPress
  skills?: string // Compétences générales WordPress
  actor_driving_license?: string // Permis WordPress

  // Compétences personnalisées (champs "Autre") - arrays pour multiples valeurs
  dance_skills_other?: string[] // Compétences de danse personnalisées
  music_skills_other?: string[] // Compétences musicales personnalisées
  diverse_skills_other?: string[] // Autres compétences personnalisées
  desired_activities_other?: string[] // Activités souhaitées personnalisées

  // Langues détaillées (WordPress format - 3 niveaux)
  actor_languages_native?: string // 1. Langues maternelles WordPress (PHP serialized)
  languages?: string // 2. Langues parlées couramment WordPress (PHP serialized)
  actor_languages_notions?: string // 3. Notions langues WordPress (PHP serialized)
  actor_languages_native_other?: string // Autres langues maternelles WordPress
  actor_languages_native2?: string // Langue maternelle 2 WordPress
  actor_languages_notions_other?: string // Autres notions WordPress
  actor_languages_other?: string // Autres langues WordPress

  // Contact détaillé (WordPress format)
  mobile_number?: string // Mobile WordPress
  phone_number?: string // Téléphone WordPress
  user_email?: string // Email WordPress
  
  // Infos personnelles WordPress
  actor_nationality?: string // Nationalité WordPress
  actor_size?: string // Taille WordPress (peut différer de height)
  wp_experience?: string // Expérience WordPress (éviter conflit)
  fielddata?: string // Données de champ WordPress
  wp_fielddata?: string // Données de champ WordPress (éviter conflit)
  wp_activity_domain?: string // Domaine d'activité WordPress (éviter conflit)
  wp_skills?: string // Compétences WordPress (éviter conflit)
  wp_mobile_number?: string // Mobile WordPress (éviter conflit)
  wp_phone_number?: string // Téléphone WordPress (éviter conflit)
  wp_user_email?: string // Email WordPress (éviter conflit)

  // Fichiers administratifs
  parental_authorization_url?: string // URL de l'autorisation parentale (optionnel)

  // Métadonnées
  admin_rating?: number // 1-5 étoiles, seulement visible par admins
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface AdminRating {
  id: string
  comedien_id: string
  admin_id: string
  rating: number // 1-5
  notes?: string
  created_at: string
  updated_at: string
}

export interface AdminComment {
  id: string
  comedien_id: string
  admin_id: string
  admin_name: string
  comment: string
  created_at: string
  updated_at: string
}

// Formulaire d'inscription
export interface InscriptionFormData {
  // Informations générales
  first_name: string
  last_name: string
  birth_date: string
  gender: 'Masculin' | 'Féminin' | 'Autre' | ''
  nationality: string
  profile_picture?: string

  // Données de connexion
  email: string
  password: string

  // Coordonnées personnelles
  phone: string // mobile
  phone_fixe?: string // téléphone fixe
  domiciliation: string
  street?: string
  zip_code: string
  city: string
  country: string

  // Coordonnées agent
  agency_name?: string
  agent_name?: string
  agent_email?: string
  agent_phone?: string

  // Deuxième agence/agent (optionnel)
  agency_name_2?: string
  agent_name_2?: string
  agent_email_2?: string
  agent_phone_2?: string

  // Photos (5 maximum)
  photos?: string[]

  // Vidéos
  showreel_url?: string
  video_1_url?: string
  video_2_url?: string

  // Site web et profils
  website_url?: string
  imdb_url?: string
  facebook_url?: string
  linkedin_url?: string
  other_profile_url?: string

  // Caractéristiques physiques
  height: number
  build: string
  ethnicity: string // Type
  hair_color: string
  eye_color: string

  // Langues
  native_language: string // Langue(s) maternelle(s)
  languages_fluent?: string[] // Langues parlées couramment
  languages_notions?: string[] // Langues avec notions

  // Compétences (arrays pour le formulaire, sérialisés en PHP pour BDD)
  wp_skills?: string[] // Compétences diverses
  diverse_skills?: string[] // Alias pour wp_skills
  dance_skills?: string[] // Classique, Tango, Salsa, Rock, Hip hop, Danse de salon
  music_skills?: string[] // Guitare, Piano, Violon, Batterie, etc.
  driving_licenses?: string[] // Auto, Moto, Camion, Avion / hélicoptère

  // Compétences personnalisées (champs "Autre") - arrays pour multiples valeurs
  dance_skills_other?: string[] // Compétences de danse personnalisées
  music_skills_other?: string[] // Compétences musicales personnalisées
  diverse_skills_other?: string[] // Autres compétences personnalisées
  desired_activities_other?: string[] // Activités souhaitées personnalisées

  // Expérience
  experience_level: string
  desired_activities?: string[] // Long métrage, Court métrage, etc.
  experience?: string // Expérience professionnelle
  professional_experience?: string // Alias pour experience
  certificates?: string // Formations et diplômes
  training_diplomas?: string // Alias pour certificates

  // Fichiers administratifs
  parental_authorization_url?: string // URL de l'autorisation parentale (optionnel)
}

export interface Film {
  id: string
  title: string
  year: number
  image_url: string
  hero_order: number
  collaboration_order: number
  show_in_hero: boolean
  show_in_collaborations: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ComedienFilters {
  // Filtres de base
  gender?: string
  age_min?: number
  age_max?: number
  languages?: string // Langues maternelles → colonne BDD: actor_languages_native (PHP serialized)
  languages_fluent?: string // Langues parlées couramment → colonne BDD: actor_languages_native (PHP serialized)
  ethnicity?: string // Type

  // Filtres avancés
  height_min?: number
  height_max?: number
  hair_color?: string
  eye_color?: string
  nationality?: string // → colonnes BDD: actor_nationality OU nationality
  dance_skills?: string // Compétences de danse → colonne BDD: actor_dance_skills + dance_skills_other
  music_skills?: string // Compétences musicales → colonne BDD: actor_music_skills + music_skills_other
  wp_skills?: string // Compétences diverses → colonne BDD: wp_skills (PHP serialized)
  driving_licenses?: string // Permis → colonne BDD: actor_driving_license (PHP serialized) - Types: 'Auto', 'Moto', 'Camion', 'Avion / hélicoptère'
  city?: string
  experience_level?: string
  build?: string
  desired_activities?: string // Activités → colonne BDD: wp_activity_domain (PHP serialized) - Long métrage, Court métrage, etc.

  // Recherche par nom
  name?: string // Recherche dans first_name, last_name et display_name

  // NOTE: Les colonnes WordPress stockent les arrays au format PHP sérialisé
  // Exemple: a:1:{i:0;s:5:"Chant";} = ["Chant"]
  // Les filtres utilisent ILIKE pour chercher dans ces données sérialisées
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Types pour l'auth
export interface AuthState {
  user: User | null
  comedien?: Comedien | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Comedien>) => Promise<void>
}

// Types pour les API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ComedienData {
  id: string
  first_name: string
  last_name: string
  display_name: string
  email: string
  birth_date: string
  gender: string
  nationality: string
  actor_nationality: string
  profile_picture: string
  phone: string
  mobile_phone: string
  domiciliation: string
  street: string
  zip_code: string
  city: string
  country: string
  height: number
  size: number
  build: string
  hair_color: string
  eye_color: string
  ethnicity: string
  agency_name: string
  agency_email: string
  agency_phone: string
  agent_name: string
  agent_email: string
  agent_phone: string
  showreel_url: string
  website_url: string
  imdb_url: string
  facebook_url: string
  linkedin_url: string
  other_profile_url: string
  experience_level: string
  actor_resume: string
  certificates: string
  experience: string
  admin_rating: number
  user_id: string
}

export interface ComedienPhoto {
  id: string
  photo_url: string
  photo_order: number
}

export interface ComedienVideo {
  id: string
  video_url: string
  video_type: string
}

export interface ComedienSkill {
  id: string
  comedien_id: string // Ajout du lien vers le comédien
  skill_category: string
  skill_name: string
}

export interface ComedienLanguage {
  id: string
  language: string
  level: string
}

// Extension de l'interface Comedien pour inclure les skills
export interface ComedienWithSkills extends Comedien {
  skills_array?: ComedienSkill[] // Toutes les compétences (format array)
}