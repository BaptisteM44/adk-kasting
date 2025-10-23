// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
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
      native_language
    } = req.body

    // Validation des champs obligatoires
    if (!email || !password || !first_name || !last_name || !phone || !birth_date) {
      return res.status(400).json({ 
        message: 'Tous les champs obligatoires doivent être remplis' 
      })
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('comediens')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un compte avec cet email existe déjà' 
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Calculer l'âge approximatif
    const birthYear = new Date(birth_date).getFullYear()
    const currentYear = new Date().getFullYear()
    const calculatedAge = currentYear - birthYear

    // Créer le comédien avec is_active = false par défaut
    const { data: comedien, error } = await supabase
      .from('comediens')
      .insert({
        email,
        user_pass: hashedPassword, // Utiliser user_pass au lieu de password
        first_name,
        last_name,
        display_name: `${first_name} ${last_name}`,
        phone: phone || '',
        domiciliation: domiciliation || '',
        birth_date: birth_date || '',
        gender: gender || 'Masculin',
        nationality: nationality || 'Française',
        city: city || '',
        height: height || 170,
        hair_color: hair_color || '',
        eye_color: eye_color || '',
        ethnicity: ethnicity || '',
        build: build || '',
        experience_level: experience_level || 'Débutant',
        native_language: native_language || 'Français',
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

    // TODO: Envoyer un email de confirmation à l'admin
    // TODO: Envoyer un email de bienvenue au comédien

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