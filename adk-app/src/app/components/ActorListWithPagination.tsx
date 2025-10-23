
// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/app/lib/supabase'
// import type { Actor, Filters } from '@/app/comediens/page'

// function calculateAge(birthDate?: string | null): string {
//   if (!birthDate || birthDate.trim() === '') return 'Âge non renseigné'
//   try {
//     const date = new Date(birthDate)
//     if (isNaN(date.getTime())) return 'Âge non renseigné'
//     const today = new Date()
//     let age = today.getFullYear() - date.getFullYear()
//     const m = today.getMonth() - date.getMonth()
//     if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--
//     if (age < 0 || age > 120) return 'Âge non renseigné'
//     return `${age} ans`
//   } catch { return 'Âge non renseigné' }
// }

// interface ActorListProps {
//   initialActors: Actor[]
//   initialFilters: Filters
//   totalCount: number
// }

// export function ActorListWithPagination({
//   initialActors,
//   initialFilters,
//   totalCount,
// }: ActorListProps) {
//   // ✅ Debug logs
//   console.log('ActorListWithPagination reçu:', {
//     initialActors: initialActors?.length,
//     totalCount,
//     firstActor: initialActors?.[0]
//   })

//   // ✅ Validation des données d'entrée
//   const validActors = Array.isArray(initialActors) ? initialActors : []
  
//   const [actors, setActors] = useState<Actor[]>(validActors)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [loading, setLoading] = useState(false)
//   const [hasMore, setHasMore] = useState(validActors.length < totalCount)

//   useEffect(() => {
//     console.log('useEffect triggered:', { initialActors: initialActors?.length, totalCount })
//     setActors(validActors)
//     setCurrentPage(1)
//     setHasMore(validActors.length < totalCount)
//   }, [initialActors, totalCount])

//   async function loadMore() {
//     if (loading || !hasMore) return
//     setLoading(true)
//     try {
//       const nextPage = currentPage + 1
// const { data, error } = await supabase.rpc('get_actors_with_filters_paginated', {
//   gender_filter: initialFilters.genre || null,
//   age_min: initialFilters.age_min ? Number(initialFilters.age_min) : null,
//   age_max: initialFilters.age_max ? Number(initialFilters.age_max) : null,
//   language_filter: initialFilters.langue || null,
//   experience_filter: initialFilters.experience || null,
//   domiciliation_filter: initialFilters.domiciliation || null,
//   eye_color_filter: initialFilters.yeux || null,
//   hair_color_filter: initialFilters.cheveux || null,
//   // ✅ Ajout des nouveaux filtres
//   nationality_filter: initialFilters.nationalite || null,
//   ethnicity_filter: initialFilters.ethnicite || null,
//   city_filter: initialFilters.ville || null,
//   country_filter: initialFilters.pays || null,
//   size_filter: initialFilters.taille || null,
//   build_filter: initialFilters.corpulence || null,
//   dance_skills_filter: initialFilters.danse || null,
//   music_skills_filter: initialFilters.musique || null,
//   driving_license_filter: initialFilters.permis || null,
//   page_num: nextPage,
//   page_size: 25,
// })

      
//       if (error) throw error
      
//       if (data && data.length > 0) {
//         setActors(prev => {
//           const newActors = [...prev, ...data]
//           // ✅ CORRECTION : Calculer hasMore avec la nouvelle longueur
//           setHasMore(newActors.length < totalCount)
//           return newActors
//         })
//         setCurrentPage(nextPage)
//       } else {
//         setHasMore(false)
//       }
//     } catch (err) {
//       console.error('Erreur lors du chargement:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ✅ Affichage de debug pour vérifier que le composant se rend
//   console.log('Rendu du composant:', { actorsLength: actors.length, totalCount })

//   // ✅ Gestion des cas edge
//   if (actors.length === 0 && totalCount === 0) {
//     return (
//       <div className="text-center text-gray-500 py-12">
//         <p>Aucun comédien trouvé pour ces critères.</p>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="mb-6 flex justify-between items-center">
//         <p className="text-gray-600">
//           <strong>{actors.length}</strong> comédien{actors.length > 1 ? 's' : ''} affiché{actors.length > 1 ? 's' : ''} sur <strong>{totalCount}</strong> trouvé{totalCount > 1 ? 's' : ''}
//         </p>
//         {actors.length < totalCount && (
//           <span className="text-xs text-gray-500">Page {currentPage} • {actors.length}/{totalCount} profils</span>
//         )}
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {actors.map(actor => {
//           const fullName = [actor.first_name, actor.last_name].filter(Boolean).join(' ') || actor.display_name
//           const age = calculateAge(actor.birth_date)
          
//           return (
//             <div
//               key={actor.id}
//               className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
//             >
// <img
//   src={actor.profilepicture || '/images/avatar-placeholder.jpg'}
//   alt={`Photo de ${fullName}`}
//   className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
//   onError={(e) => {
//     const target = e.target as HTMLImageElement;
//     // ✅ Fallback simple avec emoji
//     target.style.display = 'none';
//     const placeholder = target.parentElement?.querySelector('.avatar-placeholder') as HTMLElement;
//     if (!placeholder) {
//       const div = document.createElement('div');
//       div.className = 'avatar-placeholder w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 mx-auto mb-4';
//       div.textContent = '👤';
//       target.parentElement?.insertBefore(div, target);
//     }
//   }}
// />


//               <h2 className="font-bold text-lg text-center mb-2">{fullName}</h2>
//               <div className="text-sm text-gray-600 text-center space-y-1">
//                 <div><span className="mr-2">🎂</span>{age}</div>
//                 <div><span className="mr-2">📧</span>{actor.user_email}</div>
//                 <div><span className="mr-2">📞</span>{actor.phone_number || 'Non renseigné'}</div>
//                 {actor.city && (
//                   <div><span className="mr-2">📍</span>{actor.city}</div>
//                 )}
//                 {actor.country && (
//                   <div><span className="mr-2">🌍</span>{actor.country}</div>
//                 )}
//               </div>
//               <div className="mt-4 text-center">
//                 <a
//                   href={`/comediens/${actor.id}`}
//                   className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
//                 >
//                   Voir le profil →
//                 </a>
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       {hasMore && (
//         <div className="mt-8 text-center">
//           <button
//             onClick={loadMore}
//             disabled={loading}
//             className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//           >
//             {loading ? 'Chargement...' : `Charger plus (${totalCount - actors.length} restants)`}
//           </button>
//         </div>
//       )}

//       {!hasMore && actors.length > 0 && (
//         <div className="mt-8 text-center">
//           <p className="text-gray-500 italic">
//             Tous les comédiens correspondant aux critères ont été chargés ({totalCount} au total)
//           </p>
//         </div>
//       )}

//       {actors.length === 0 && totalCount > 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">
//             Aucun comédien trouvé pour ces critères. Essayez de modifier vos filtres.
//           </p>
//         </div>
//       )}
//     </>
//   )
// }
