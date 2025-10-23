// import { supabase } from '@/app/lib/supabase'
// import { notFound } from 'next/navigation'
// import { ActorImage } from '@/app/components/ActorImage'
// import { ProfileActions } from '@/app/components/ProfileActions'

// // Interface et composants utilitaires restent identiques...
// interface CompleteActorProfile {
//     id: number
//     display_name: string
//     user_email: string
//     user_registered: string
//     phone?: string | null
//     mobile_number?: string | null
//     street?: string | null
//     zip_code?: string | null
//     city?: string | null
//     country?: string | null
//     first_name?: string | null
//     last_name?: string | null
//     nickname?: string | null
//     description?: string | null
//     gender?: string | null
//     birth_date?: string | null
//     actor_nationality?: string | null
//     size?: string | null
//     build_type?: string | null
//     hair_color?: string | null
//     eye_color?: string | null
//     ethnicity?: string | null
//     profilepicture?: string | null
//     actor_resume?: string | null
//     experience_level?: string | null
//     experience?: string | null
//     actor_agent_name?: string | null
//     actor_agent_email?: string | null
//     actor_agent_phone?: string | null
//     actor_agency_name?: string | null
//     actor_driving_license?: string | null
//     certificates?: string | null
//     actor_languages_native?: string | null
//     languages?: string | null
//     actor_languages_notions?: string | null
//     actor_profile_imdb?: string | null
//     actor_profile_facebook?: string | null
//     actor_profile_linkedin?: string | null
//     actor_profile_other?: string | null
//     hide_gender?: string | null
//     hide_hair_color?: string | null
//     hide_size?: string | null
//     hide_experience_level?: string | null
//     domiciliation?: string | null
//   }

// function InfoSection({ title, children, className = "", isEmpty = false }: { 
//   title: string
//   children: React.ReactNode
//   className?: string 
//   isEmpty?: boolean
// }) {
//   if (isEmpty) return null
  
//   return (
//     <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
//       <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
//         {title}
//       </h2>
//       {children}
//     </div>
//   )
// }

// function InfoItem({ label, value, isHidden = false, className = "" }: { 
//   label: string
//   value?: string | null
//   isHidden?: boolean 
//   className?: string
// }) {
//   if (isHidden || !value || value.trim() === '') {
//     return null
//   }
  
//   return (
//     <div className={`flex flex-col sm:flex-row sm:items-start mb-3 ${className}`}>
//       <dt className="font-medium text-gray-600 sm:w-1/3 mb-1 sm:mb-0">
//         {label} :
//       </dt>
//       <dd className="text-gray-800 sm:w-2/3 break-words">
//         {value}
//       </dd>
//     </div>
//   )
// }

// export default async function ProfilComedienPage({ 
//   params 
// }: { 
//   params: Promise<{ id: string }> 
// }) {
//   const resolvedParams = await params
//   const actorId = parseInt(resolvedParams.id)

//   if (isNaN(actorId)) {
//     return notFound()
//   }

//   const { data, error } = await supabase.rpc('get_complete_actor_profile', { 
//     actor_id: actorId 
//   })

//   if (error || !data || data.length === 0) {
//     return notFound()
//   }

//   const actor: CompleteActorProfile = data[0]

//   const isHidden = (field: string): boolean => {
//     switch (field) {
//       case 'gender': return actor.hide_gender === '1'
//       case 'hair_color': return actor.hide_hair_color === '1'
//       case 'size': return actor.hide_size === '1'
//       case 'experience_level': return actor.hide_experience_level === '1'
//       default: return false
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
        
//         {/* En-tête du profil */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white mb-8">
//           <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            
//             {/* Photo de profil - CORRECTION: utilisation du Client Component */}
//             <div className="flex-shrink-0">
//               <ActorImage
//                 src={actor.profilepicture}
//                 alt={`Photo de ${actor.display_name}`}
//                 className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
//               />
//             </div>
            
//             {/* Informations principales */}
//             <div className="text-center lg:text-left flex-grow">
//               <h1 className="text-4xl lg:text-5xl font-bold mb-2">
//                 {actor.first_name}
//                 {actor.last_name}
//               </h1>
              
//               <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
//                 {actor.experience_level && !isHidden('experience_level') && (
//                   <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
//                     🎭 {actor.experience_level}
//                   </span>
//                 )}
                
//                 {actor.city && (
//                   <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
//                     📍 {actor.city}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           {/* Colonne principale */}
//           <div className="xl:col-span-2 space-y-8">
            
//             {/* Informations personnelles */}
//             <InfoSection title="Informations personnelles">
//               <dl className="space-y-3">
//                 <InfoItem label="Email" value={actor.user_email} />
//                 <InfoItem label="Téléphone" value={actor.phone} />
//                 <InfoItem 
//                   label="Genre" 
//                   value={actor.gender} 
//                   isHidden={isHidden('gender')} 
//                 />
//                 <InfoItem label="Ville" value={actor.city} />
//                 <InfoItem label="Nationalité" value={actor.actor_nationality} />
//               </dl>
//             </InfoSection>

//             {/* Caractéristiques physiques */}
//             <InfoSection title="Caractéristiques physiques">
//               <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <InfoItem 
//                   label="Taille" 
//                   value={actor.size} 
//                   isHidden={isHidden('size')} 
//                 />
//                 <InfoItem 
//                   label="Couleur des cheveux" 
//                   value={actor.hair_color} 
//                   isHidden={isHidden('hair_color')} 
//                 />
//                 <InfoItem label="Couleur des yeux" value={actor.eye_color} />
//                 <InfoItem label="Corpulence" value={actor.build_type} />
//               </dl>
//             </InfoSection>

//             {/* Expérience */}
//             <InfoSection title="Expérience professionnelle">
//               <dl className="space-y-4">
//                 <InfoItem 
//                   label="Niveau d'expérience" 
//                   value={actor.experience_level} 
//                   isHidden={isHidden('experience_level')} 
//                 />
                
//                 {actor.experience && (
//                   <div>
//                     <dt className="font-medium text-gray-600 mb-2">
//                       Description de l'expérience :
//                     </dt>
//                     <dd className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
//                       {actor.experience}
//                     </dd>
//                   </div>
//                 )}
//               </dl>
//             </InfoSection>
//           </div>

//           {/* Colonne latérale */}
//           <div className="space-y-8">
            
//             {/* Agent et représentation */}
//             {(actor.actor_agent_name || actor.actor_agency_name) && (
//               <InfoSection title="Agent et représentation">
//                 <dl className="space-y-3">
//                   <InfoItem label="Agence" value={actor.actor_agency_name} />
//                   <InfoItem label="Nom de l'agent" value={actor.actor_agent_name} />
//                   <InfoItem label="Email agent" value={actor.actor_agent_email} />
//                   <InfoItem label="Téléphone agent" value={actor.actor_agent_phone} />
//                 </dl>
//               </InfoSection>
//             )}

//             {/* Informations du compte */}
//             <InfoSection title="Informations du compte">
//               <dl className="space-y-2 text-sm">
//                 <InfoItem 
//                   label="Membre depuis" 
//                   value={new Date(actor.user_registered).toLocaleDateString('fr-FR')} 
//                 />
//                 <InfoItem label="ID utilisateur" value={actor.id.toString()} />
//               </dl>
//             </InfoSection>
//           </div>
//         </div>

//         {/* Actions - CORRECTION: utilisation du Client Component */}
//         <ProfileActions />
//       </div>
//     </main>
//   )
// }

import { supabase } from '@/app/lib/supabase'
import { notFound } from 'next/navigation'

interface ActorProfile {
  id: number
  display_name: string
  user_email: string
  first_name?: string
  last_name?: string
  birth_date?: string
  phone_number?: string
  profilepicture?: string
  city?: string
  country?: string
  gender?: string
  eye_color?: string
  hair_color?: string
  languages?: string
  experience_level?: string
}

function calculateAge(birthDate?: string): string {
  if (!birthDate) return 'Non renseigné'
  try {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return `${age} ans`
  } catch {
    return 'Non renseigné'
  }
}

export default async function ActorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const { data, error } = await supabase.rpc('get_complete_actor_profile', {
    actor_id: parseInt(id)
  })

  if (error || !data || data.length === 0) {
    notFound()
  }

  const actor: ActorProfile = data[0]
  const fullName = [actor.first_name, actor.last_name].filter(Boolean).join(' ') || actor.display_name

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={actor.profilepicture || '/images/avatar-placeholder.jpg'}
                alt={`Photo de ${fullName}`}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{fullName}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700">Âge</h3>
                  <p className="text-gray-600">{calculateAge(actor.birth_date)}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Genre</h3>
                  <p className="text-gray-600">{actor.gender || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Ville</h3>
                  <p className="text-gray-600">{actor.city || 'Non renseignée'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Pays</h3>
                  <p className="text-gray-600">{actor.country || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Yeux</h3>
                  <p className="text-gray-600">{actor.eye_color || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Cheveux</h3>
                  <p className="text-gray-600">{actor.hair_color || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Langues</h3>
                  <p className="text-gray-600">{actor.languages || 'Non renseignées'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Expérience</h3>
                  <p className="text-gray-600">{actor.experience_level || 'Non renseignée'}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <a
                  href={`mailto:${actor.user_email}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Contacter
                </a>
                <a
                  href="/comediens"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Retour à la liste
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
