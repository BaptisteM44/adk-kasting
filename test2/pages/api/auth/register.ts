// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { phpSerialize } from '@/lib/php-serialize'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      domiciliation,
      street,
      zip_code,
      city,
      country,
      birth_date,
      gender,
      nationality,
      height,
      hair_color,
      eye_color,
      ethnicity,
      build,
      experience_level,
      native_language,
      // Arrays qui seront sérialisés
      wp_skills,
      driving_licenses,
      dance_skills,
      music_skills,
      languages_fluent,
      languages_notions,
      desired_activities,
      // Agent
      agency_name,
      agent_name,
      agent_email,
      agent_phone,
      agency_name_2,
      agent_name_2,
      agent_email_2,
      agent_phone_2,
      // Réseaux sociaux
      website_url,
      facebook_url,
      imdb_url,
      linkedin_url,
      other_profile_url,
      // Vidéos
      showreel_url,
      // Expérience
      experience,
      certificates,
      // Photos (à mapper vers actor_photo1-5)
      photos
    } = req.body

    // Validation des champs obligatoires
    if (!email || !password || !first_name || !last_name || !phone || !birth_date) {
      return res.status(400).json({
        message: 'Tous les champs obligatoires doivent être remplis'
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer le comédien avec is_active = false par défaut
    const { data: comedien, error } = await supabase
      .from('comediens')
      .insert({
        // Authentification
        email,
        user_pass: hashedPassword,

        // Informations générales
        first_name,
        last_name,
        display_name: `${first_name} ${last_name}`,
        birth_date: birth_date || '',
        gender: gender || 'Masculin',
        nationality: nationality || '',

        // Coordonnées
        phone: phone || '',
        domiciliation: domiciliation || '',
        street: street || '',
        zip_code: zip_code || '',
        city: city || '',
        country: country || '',

        // Caractéristiques physiques
        height: height || null,
        build: build || '',
        ethnicity: ethnicity || '',
        hair_color: hair_color || '',
        eye_color: eye_color || '',

        // Langues - sérialisées au format WordPress
        native_language: native_language || '',
        // actor_languages_native combine langue maternelle + langues parlées couramment
        actor_languages_native: phpSerialize([
          ...(native_language ? [native_language] : []),
          ...(languages_fluent || [])
        ]),
        actor_languages_notions: phpSerialize(languages_notions || []),

        // Compétences - sérialisées au format WordPress
        wp_skills: phpSerialize(wp_skills || []),
        actor_driving_license: phpSerialize(driving_licenses || []),
        actor_dance_skills: phpSerialize(dance_skills || []),
        actor_music_skills: phpSerialize(music_skills || []),

        // Arrays PostgreSQL (PAS sérialisés) - null si vides
        dance_skills: dance_skills && dance_skills.length > 0 ? dance_skills : null,
        music_skills: music_skills && music_skills.length > 0 ? music_skills : null,

        // Activités désirées - sérialisées au format WordPress
        wp_activity_domain: phpSerialize(desired_activities || []),

        // Photos - array PostgreSQL (PAS JSON) - null si vide
        photos: photos && photos.length > 0 ? photos : null,

        // Agent
        agency_name: agency_name || '',
        agent_name: agent_name || '',
        agent_email: agent_email || '',
        agent_phone: agent_phone || '',
        agency_name_2: agency_name_2 || '',
        agent_name_2: agent_name_2 || '',
        agent_email_2: agent_email_2 || '',
        agent_phone_2: agent_phone_2 || '',

        // Réseaux sociaux
        website_url: website_url || '',
        facebook_url: facebook_url || '',
        imdb_url: imdb_url || '',
        linkedin_url: linkedin_url || '',
        other_profile_url: other_profile_url || '',

        // Vidéos
        showreel_url: showreel_url || '',
        actor_video1: showreel_url || '',

        // Expérience
        experience_level: experience_level || '',
        experience: experience || '',
        certificates: certificates || '',

        // Statut
        is_active: false // Important : profil en attente de validation
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création comédien:', error)
      return res.status(500).json({
        message: 'Erreur lors de la création du compte'
      })
    }

    return res.status(201).json({
      message: 'Inscription réussie ! Votre profil est en attente de validation.',
      comedien: {
        id: comedien.id,
        email: comedien.email,
        first_name: comedien.first_name,
        last_name: comedien.last_name,
        is_active: comedien.is_active
      }
    })

  } catch (error: any) {
    console.error('Erreur inscription:', error)
    return res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription'
    })
  }
}
