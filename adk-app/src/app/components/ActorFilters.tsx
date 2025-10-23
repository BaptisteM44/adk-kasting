
// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// interface FilterValues {
//   genre?: string
//   age_min?: string
//   age_max?: string
//   langue?: string
//   experience?: string
//   domiciliation?: string
//   yeux?: string
//   cheveux?: string
//   nationalite?: string
//   ethnicite?: string
//   ville?: string
//   pays?: string
//   taille?: string
//   corpulence?: string
//   danse?: string
//   musique?: string
//   permis?: string
// }

// export function ActorFilters() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
  
//   const [filters, setFilters] = useState<FilterValues>({
//     genre: searchParams.get('genre') || '',
//     age_min: searchParams.get('age_min') || '',
//     age_max: searchParams.get('age_max') || '',
//     langue: searchParams.get('langue') || '',
//     experience: searchParams.get('experience') || '',
//     domiciliation: searchParams.get('domiciliation') || '',
//     yeux: searchParams.get('yeux') || '',
//     cheveux: searchParams.get('cheveux') || '',
//     nationalite: searchParams.get('nationalite') || '',
//     ethnicite: searchParams.get('ethnicite') || '',
//     ville: searchParams.get('ville') || '',
//     pays: searchParams.get('pays') || '',
//     taille: searchParams.get('taille') || '',
//     corpulence: searchParams.get('corpulence') || '',
//     danse: searchParams.get('danse') || '',
//     musique: searchParams.get('musique') || '',
//     permis: searchParams.get('permis') || '',
//   })

//   const handleFilterChange = (key: keyof FilterValues, value: string) => {
//     setFilters(prev => ({ ...prev, [key]: value }))
//   }

//   const applyFilters = () => {
//     const params = new URLSearchParams()
    
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value && value.trim() !== '') {
//         params.set(key, value)
//       }
//     })
    
//     router.push(`/comediens?${params.toString()}`)
//   }

//   const clearFilters = () => {
//     setFilters({
//       genre: '', age_min: '', age_max: '', langue: '', experience: '',
//       domiciliation: '', yeux: '', cheveux: '', nationalite: '', ethnicite: '',
//       ville: '', pays: '', taille: '', corpulence: '', danse: '', musique: '', permis: ''
//     })
//     router.push('/comediens')
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//       <h2 className="text-xl font-bold text-gray-900 mb-4">Filtrer les comédiens</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        
//         {/* Genre */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
//           <select
//             value={filters.genre || ''}
//             onChange={(e) => handleFilterChange('genre', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Tous</option>
//             <option value="Masculin">Masculin</option>
//             <option value="Féminin">Féminin</option>
//             <option value="Non-binaire">Non-binaire</option>
//           </select>
//         </div>

//         {/* Âge minimum */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Âge min</label>
//           <input
//             type="number"
//             min="16"
//             max="80"
//             value={filters.age_min || ''}
//             onChange={(e) => handleFilterChange('age_min', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: 25"
//           />
//         </div>

//         {/* Âge maximum */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Âge max</label>
//           <input
//             type="number"
//             min="16"
//             max="80"
//             value={filters.age_max || ''}
//             onChange={(e) => handleFilterChange('age_max', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: 35"
//           />
//         </div>

//         {/* Couleur des yeux */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Yeux</label>
//           <select
//             value={filters.yeux || ''}
//             onChange={(e) => handleFilterChange('yeux', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Bleu">Bleus</option>
//             <option value="Vert">Verts</option>
//             <option value="Marron">Marrons</option>
//             <option value="Noisette">Noisette</option>
//             <option value="Gris">Gris</option>
//           </select>
//         </div>

//         {/* Couleur des cheveux */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Cheveux</label>
//           <select
//             value={filters.cheveux || ''}
//             onChange={(e) => handleFilterChange('cheveux', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Blond">Blonds</option>
//             <option value="Brun">Bruns</option>
//             <option value="Châtain">Châtains</option>
//             <option value="Roux">Roux</option>
//             <option value="Noir">Noirs</option>
//             <option value="Gris">Gris</option>
//             <option value="Blanc">Blancs</option>
//           </select>
//         </div>

//         {/* Expérience */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
//           <select
//             value={filters.experience || ''}
//             onChange={(e) => handleFilterChange('experience', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Tous niveaux</option>
//             <option value="Débutant">Débutant</option>
//             <option value="Intermédiaire">Intermédiaire</option>
//             <option value="Expérimenté">Expérimenté</option>
//             <option value="Professionnel">Professionnel</option>
//           </select>
//         </div>

//         {/* Langue */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
//           <select
//             value={filters.langue || ''}
//             onChange={(e) => handleFilterChange('langue', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Français">Français</option>
//             <option value="Anglais">Anglais</option>
//             <option value="Espagnol">Espagnol</option>
//             <option value="Italien">Italien</option>
//             <option value="Allemand">Allemand</option>
//           </select>
//         </div>

//         {/* Ville */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
//           <input
//             type="text"
//             value={filters.ville || ''}
//             onChange={(e) => handleFilterChange('ville', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: Paris, Lyon..."
//           />
//         </div>

//         {/* Domiciliation/Région */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
//           <input
//             type="text"
//             value={filters.domiciliation || ''}
//             onChange={(e) => handleFilterChange('domiciliation', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: Île-de-France..."
//           />
//         </div>

//         {/* Nationalité */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
//           <select
//             value={filters.nationalite || ''}
//             onChange={(e) => handleFilterChange('nationalite', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Française">Française</option>
//             <option value="Belge">Belge</option>
//             <option value="Suisse">Suisse</option>
//             <option value="Canadienne">Canadienne</option>
//             <option value="Autre">Autre</option>
//           </select>
//         </div>

//         {/* Ethnie */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicité</label>
//           <select
//             value={filters.ethnicite || ''}
//             onChange={(e) => handleFilterChange('ethnicite', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Caucasien">Caucasien</option>
//             <option value="Africain">Africain</option>
//             <option value="Asiatique">Asiatique</option>
//             <option value="Métissé">Métissé</option>
//             <option value="Autre">Autre</option>
//           </select>
//         </div>

//         {/* Compétences danse */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Danse</label>
//           <input
//             type="text"
//             value={filters.danse || ''}
//             onChange={(e) => handleFilterChange('danse', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: Classique, Hip-hop..."
//           />
//         </div>

//         {/* Compétences musicales */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Musique</label>
//           <input
//             type="text"
//             value={filters.musique || ''}
//             onChange={(e) => handleFilterChange('musique', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: Piano, Chant..."
//           />
//         </div>

//         {/* Permis de conduire */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Permis</label>
//           <select
//             value={filters.permis || ''}
//             onChange={(e) => handleFilterChange('permis', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Peu importe</option>
//             <option value="Oui">Oui</option>
//             <option value="Non">Non</option>
//           </select>
//         </div>

//         {/* Taille */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
//           <input
//             type="text"
//             value={filters.taille || ''}
//             onChange={(e) => handleFilterChange('taille', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Ex: 170, 180..."
//           />
//         </div>

//         {/* Corpulence */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Corpulence</label>
//           <select
//             value={filters.corpulence || ''}
//             onChange={(e) => handleFilterChange('corpulence', e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Toutes</option>
//             <option value="Mince">Mince</option>
//             <option value="Normale">Normale</option>
//             <option value="Athlétique">Athlétique</option>
//             <option value="Forte">Forte</option>
//           </select>
//         </div>
//       </div>

//       {/* Boutons d'action */}
//       <div className="flex gap-4">
//         <button
//           onClick={applyFilters}
//           className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
//         >
//           Appliquer les filtres
//         </button>
//         <button
//           onClick={clearFilters}
//           className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
//         >
//           Réinitialiser
//         </button>
//       </div>
//     </div>
//   )
// }
