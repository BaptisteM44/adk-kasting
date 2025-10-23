// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { verifyPassword, isWordPressHash, hashPassword } from '@/lib/wordpress-password'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    console.log('Tentative de connexion:', { email, password }) // Debug

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' })
    }

    // Chercher d'abord dans les comédiens (admins et utilisateurs normaux)
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('*')
      .eq('email', email)

    console.log('Résultat recherche comedien:', { comediens: comediens?.length || 0, error })

    if (error) {
      console.log('Erreur de recherche:', error)
      return res.status(500).json({ message: 'Erreur serveur' })
    }

    if (!comediens || comediens.length === 0) {
      console.log('Aucun comédien trouvé avec cet email')
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // S'il y a plusieurs utilisateurs, prendre le premier actif
    const comedien = comediens.find(c => c.is_active) || comediens[0]
    console.log('Comédien sélectionné:', { 
      id: comedien.id, 
      email: comedien.email, 
      display_name: comedien.display_name, 
      is_active: comedien.is_active 
    })

    // Vérifier si le comédien est actif
    if (!comedien.is_active) {
      console.log('Compte non activé')
      return res.status(401).json({ message: 'Compte non activé' })
    }

    // Cas spécial pour l'admin
    if (email === 'admin@adk.com' && password === 'admin123') {
      console.log('Connexion admin détectée')
      const token = jwt.sign(
        { 
          id: comedien.id, 
          email: comedien.email, 
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return res.status(200).json({
        token,
        user: {
          id: comedien.id,
          email: comedien.email,
          display_name: comedien.display_name,
          role: 'admin'
        }
      })
    }

    // Pour les utilisateurs normaux
    console.log('Test de vérification du mot de passe')
    
    if (!comedien.user_pass) {
      console.log('Aucun mot de passe stocké pour cet utilisateur')
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // Vérifier le mot de passe (compatible WordPress phpass ET bcrypt)
    const isPasswordValid = await verifyPassword(password, comedien.user_pass)
    console.log('Résultat vérification:', isPasswordValid)

    if (!isPasswordValid) {
      console.log('Mot de passe incorrect')
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // Si l'utilisateur avait un ancien hash WordPress, le migrer vers bcrypt
    if (isWordPressHash(comedien.user_pass)) {
      console.log('🔄 Migration du hash WordPress vers bcrypt...')
      try {
        const newHash = await hashPassword(password)
        await supabase
          .from('comediens')
          .update({ user_pass: newHash })
          .eq('id', comedien.id)
        console.log('✅ Hash migré vers bcrypt')
      } catch (error) {
        console.warn('⚠️ Erreur lors de la migration du hash:', error)
        // On continue quand même la connexion
      }
    }

    // Connexion réussie
    console.log('Connexion réussie pour:', comedien.email)
    
    const token = jwt.sign(
      { 
        id: comedien.id, 
        email: comedien.email, 
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      user: {
        id: comedien.id,
        email: comedien.email,
        display_name: comedien.display_name,
        role: 'user'
      }
    })

  } catch (error: any) {
    console.error('Erreur dans l\'API login:', error)
    return res.status(500).json({ message: 'Erreur serveur interne' })
  }
}