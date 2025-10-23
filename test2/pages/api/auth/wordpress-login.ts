import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Fonction pour vérifier les mots de passe WordPress
function verifyWordPressPassword(password: string, hash: string): boolean {
  // WordPress peut utiliser différents formats de hash
  
  // 1. Vérifier si c'est un hash bcrypt (WordPress moderne)
  if (hash.startsWith('$2') || hash.startsWith('$P$') || hash.startsWith('$H$')) {
    try {
      return bcrypt.compareSync(password, hash)
    } catch (error) {
      console.error('Erreur bcrypt:', error)
    }
  }
  
  // 2. Vérifier si c'est un hash MD5 (ancien WordPress)
  if (hash.length === 32) {
    const md5Hash = crypto.createHash('md5').update(password).digest('hex')
    return md5Hash === hash
  }
  
  // 3. Hash WordPress PHPass (format $P$ ou $H$)
  if (hash.startsWith('$P$') || hash.startsWith('$H$')) {
    return verifyPHPassHash(password, hash)
  }
  
  return false
}

// Implémentation simplifiée de PHPass pour WordPress
function verifyPHPassHash(password: string, hash: string): boolean {
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  
  if (hash.length !== 34) return false
  
  const count_log2 = itoa64.indexOf(hash[3])
  if (count_log2 < 7 || count_log2 > 30) return false
  
  const count = 1 << count_log2
  const salt = hash.slice(4, 12)
  
  let hashResult = crypto.createHash('md5').update(salt + password).digest()
  
  for (let i = 0; i < count; i++) {
    hashResult = crypto.createHash('md5').update(hashResult.toString('binary') + password).digest()
  }
  
  const output = hash.slice(0, 12) + encode64(hashResult, 16)
  return output === hash
}

function encode64(input: Buffer, count: number): string {
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let output = ''
  let i = 0
  
  do {
    let value = input[i++] || 0
    output += itoa64[value & 0x3f]
    
    if (i < count) {
      value |= (input[i] || 0) << 8
    }
    output += itoa64[(value >> 6) & 0x3f]
    
    if (i++ >= count) break
    
    if (i < count) {
      value |= (input[i] || 0) << 16
    }
    output += itoa64[(value >> 12) & 0x3f]
    
    if (i++ >= count) break
    
    output += itoa64[(value >> 18) & 0x3f]
  } while (i < count)
  
  return output
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' })
  }

  try {
    // 1. Chercher l'utilisateur dans la table comediens avec user_pass
    const { data: comedien, error: comedienError } = await supabase
      .from('comediens')
      .select('id, email, user_pass, user_id, first_name, last_name')
      .eq('email', email)
      .single()

    if (comedienError || !comedien) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' })
    }

    // 2. Vérifier le mot de passe WordPress
    if (!comedien.user_pass) {
      return res.status(401).json({ message: 'Mot de passe non configuré' })
    }

    const isValidPassword = verifyWordPressPassword(password, comedien.user_pass)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect' })
    }

    // 3. Si le comédien n'a pas encore de compte Supabase Auth, en créer un
    let supabaseUser = null
    
    if (comedien.user_id) {
      // Vérifier si l'utilisateur existe toujours dans Supabase Auth
      const { data: existingUser } = await supabase.auth.admin.getUserById(comedien.user_id)
      supabaseUser = existingUser.user
    }
    
    if (!supabaseUser) {
      // Créer un compte Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password, // Utiliser le mot de passe en clair pour Supabase
        email_confirm: true // Confirmer automatiquement l'email
      })

      if (createError) {
        console.error('Erreur création utilisateur Supabase:', createError)
        return res.status(500).json({ message: 'Erreur lors de la création du compte' })
      }

      supabaseUser = newUser.user

      // Mettre à jour le comedien avec l'ID Supabase
      await supabase
        .from('comediens')
        .update({ user_id: supabaseUser.id })
        .eq('id', comedien.id)

      // Créer le profil utilisateur avec le rôle comedien
      await supabase
        .from('user_profiles')
        .insert([{
          id: supabaseUser.id,
          role: 'comedien'
        }])
    }

    // 4. Créer une session Supabase
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (signInError) {
      console.error('Erreur connexion:', signInError)
      return res.status(500).json({ message: 'Erreur lors de la connexion' })
    }

    res.status(200).json({
      success: true,
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'comedien',
        comedien_id: comedien.id,
        first_name: comedien.first_name,
        last_name: comedien.last_name
      },
      session: session
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    res.status(500).json({ message: 'Erreur serveur interne' })
  }
}