// pages/api/skills/custom.ts
// API pour récupérer toutes les compétences personnalisées saisies par les utilisateurs
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    // Extraire et dédupliquer toutes les compétences personnalisées
    const danceSkills = new Set<string>()
    const musicSkills = new Set<string>()
    const diverseSkills = new Set<string>()
    const desiredActivities = new Set<string>()

    // Récupérer les compétences de danse personnalisées
    const { data: danceData } = await supabase
      .from('comediens')
      .select('dance_skills_other')
      .not('dance_skills_other', 'is', null)

    danceData?.forEach(comedien => {
      if (Array.isArray(comedien.dance_skills_other)) {
        comedien.dance_skills_other.forEach((skill: string) => {
          if (skill?.trim()) danceSkills.add(skill.trim())
        })
      }
    })

    // Récupérer les compétences musicales personnalisées
    const { data: musicData } = await supabase
      .from('comediens')
      .select('music_skills_other')
      .not('music_skills_other', 'is', null)

    musicData?.forEach(comedien => {
      if (Array.isArray(comedien.music_skills_other)) {
        comedien.music_skills_other.forEach((skill: string) => {
          if (skill?.trim()) musicSkills.add(skill.trim())
        })
      }
    })

    // Récupérer les compétences diverses personnalisées
    const { data: diverseData } = await supabase
      .from('comediens')
      .select('diverse_skills_other')
      .not('diverse_skills_other', 'is', null)

    diverseData?.forEach(comedien => {
      if (Array.isArray(comedien.diverse_skills_other)) {
        comedien.diverse_skills_other.forEach((skill: string) => {
          if (skill?.trim()) diverseSkills.add(skill.trim())
        })
      }
    })

    // Récupérer les activités désirées personnalisées
    const { data: activitiesData } = await supabase
      .from('comediens')
      .select('desired_activities_other')
      .not('desired_activities_other', 'is', null)

    activitiesData?.forEach(comedien => {
      if (Array.isArray(comedien.desired_activities_other)) {
        comedien.desired_activities_other.forEach((activity: string) => {
          if (activity?.trim()) desiredActivities.add(activity.trim())
        })
      }
    })

    // Convertir en arrays triés
    return res.status(200).json({
      dance_skills: Array.from(danceSkills).sort(),
      music_skills: Array.from(musicSkills).sort(),
      diverse_skills: Array.from(diverseSkills).sort(),
      desired_activities: Array.from(desiredActivities).sort()
    })

  } catch (error: any) {
    console.error('Erreur API skills/custom:', error)
    return res.status(500).json({ message: 'Erreur serveur: ' + error.message })
  }
}
