import { supabase } from '@/app/lib/supabase'
import type { NextRequest } from 'next/server'

interface Actor {
  id: number
  display_name: string
  user_email: string
  photo_url?: string | null
  gender?: string | null
  city?: string | null
  experience_level?: string | null
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const gender = searchParams.get('gender') || null

  try {
    const offset = (page - 1) * 50
    
    const { data, error } = await supabase
      .from('wp_users')
      .select('id, display_name, user_email')
      .range(offset, offset + 49)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transformation des données
    const actors: Actor[] = (data || []).map(user => ({
      id: user.id,
      display_name: user.display_name,
      user_email: user.user_email,
      photo_url: null,
      gender: null,
      city: null,
      experience_level: null
    }))

    return new Response(JSON.stringify(actors), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: 'Erreur serveur interne' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
