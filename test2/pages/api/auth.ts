// pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, email, password } = req.body

  try {
    switch (action) {
      case 'signIn':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError

        return res.status(200).json({ data: signInData })

      case 'signOut':
        const { error: signOutError } = await supabase.auth.signOut()

        if (signOutError) throw signOutError

        return res.status(200).json({ success: true })

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}
