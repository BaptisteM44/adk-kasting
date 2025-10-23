// // pages/comediens/index.tsx
// import React, { useState, useEffect, useCallback } from 'react'
// import Head from 'next/head'
// import { supabase } from '@/lib/supabase'
// import { ComedienFilters } from '@/components/ComedienFilters'
// import { ComedienCard } from '@/components/ComedienCard'
// import { Button } from '@/components/ui/Button'
// import type { Comedien, ComedienFilters as Filters, PaginatedResponse } from '@/types'

// export default function ComediensPage() {
//   const [comediens, setComediens] = useState<Comedien[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [totalCount, setTotalCount] = useState(0)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [hasMore, setHasMore] = useState(true)

//   const [filters, setFilters] = useState<Filters>({})

//   const pageSize = 12

//   const fetchComediens = useCallback(async (page = 1, currentFilters = filters, append = false) => {
//     setLoading(true)
//     setError('')

//     try {
//       let query = supabase
//         .from('comediens')
//         .select('*', { count: 'exact' })
//         .eq('is_active', true)

//       // Appliquer les filtres
//       if (currentFilters.gender) {
//         query = query.eq('gender', currentFilters.gender)
//       }

//       if (currentFilters.ethnicity) {
//         query = query.eq('ethnicity', currentFilters.ethnicity)
//       }

//       if (currentFilters.age_min || currentFilters.age_max) {
//         const currentYear = new Date().getFullYear()

//         if (currentFilters.age_max) {
//           const minBirthYear = currentYear - currentFilters.age_max
//           query = query.gte('birth_date', `01-01-${minBirthYear}`)
//         }

//         if (currentFilters.age_min) {
//           const maxBirthYear = currentYear - currentFilters.age_min
//           query = query.lte('birth_date', `31-12-${maxBirthYear}`)
//         }
//       }

//       if (currentFilters.languages) {
//         query = query.ilike('languages', `%${currentFilters.languages}%`)
//       }

//       if (currentFilters.hair_color) {
//         query = query.eq('hair_color', currentFilters.hair_color)
//       }

//       if (currentFilters.eye_color) {
//         query = query.eq('eye_color', currentFilters.eye_color)
//       }

//       if (currentFilters.nationality) {
//         query = query.ilike('nationality', `%${currentFilters.nationality}%`)
//       }

//       if (currentFilters.city) {
//         query = query.ilike('city', `%${currentFilters.city}%`)
//       }

//       if (currentFilters.height_min) {
//         query = query.gte('height', currentFilters.height_min)
//       }

//       if (currentFilters.height_max) {
//         query = query.lte('height', currentFilters.height_max)
//       }

//       if (currentFilters.driving_license !== undefined) {
//         query = query.eq('driving_license', currentFilters.driving_license)
//       }

//       // Pagination
//       const startIndex = (page - 1) * pageSize
//       query = query
//         .order('last_name')
//         .range(startIndex, startIndex + pageSize - 1)

//       const { data, error, count } = await query

//       if (error) throw error

//       if (append) {
//         setComediens(prev => [...prev, ...(data || [])])
//       } else {
//         setComediens(data || [])
//       }

//       setTotalCount(count || 0)
//       setHasMore((data?.length || 0) === pageSize)
//       setCurrentPage(page)
//     } catch (error: any) {
//       setError(error.message)
//       console.error('Erreur lors du chargement des comédiens:', error)
//     } finally {
//       setLoading(false)
//     }
//   }, [filters])

//   useEffect(() => {
//     fetchComediens(1, filters, false)
//   }, [filters])

//   const handleFiltersChange = (newFilters: Filters) => {
//     setFilters(newFilters)
//     setCurrentPage(1)
//   }

//   const handleFiltersReset = () => {
//     setFilters({})
//     setCurrentPage(1)
//   }

//   const handleLoadMore = () => {
//     if (!loading && hasMore) {
//       fetchComediens(currentPage + 1, filters, true)
//     }
//   }

//   return (
//     <>
//       <Head>
//         <title>Comédiens - ADKcasting</title>
//         <meta 
//           name="description" 
//           content="Découvrez plus de 9000 comédiens professionnels sur ADKcasting. Filtrez par âge, genre, compétences et localisation pour trouver le talent parfait." 
//         />
//       </Head>

//       <div className="container">
//         <section className="section">
//           <div className="text-center" style={{ marginBottom: '3rem' }}>
//             <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//               Nos Comédiens
//             </h1>
//             <p style={{ fontSize: '1.2rem', color: '#666' }}>
//               Découvrez {totalCount} comédiens professionnels et trouvez le talent parfait pour votre projet
//             </p>
//           </div>

//           <ComedienFilters
//             filters={filters}
//             onFiltersChange={handleFiltersChange}
//             onReset={handleFiltersReset}
//             resultCount={totalCount}
//             loading={loading}
//           />

//           {error && (
//             <div style={{
//               padding: '1rem',
//               marginBottom: '2rem',
//               backgroundColor: '#fdf2f2',
//               border: '1px solid #e74c3c',
//               borderRadius: '8px',
//               color: '#e74c3c'
//             }}>
//               Erreur: {error}
//             </div>
//           )}

//           {comediens.length === 0 && !loading ? (
//             <div className="text-center" style={{ padding: '3rem 0' }}>
//               <h3 style={{ marginBottom: '1rem' }}>Aucun comédien trouvé</h3>
//               <p style={{ color: '#666', marginBottom: '1.5rem' }}>
//                 Essayez d'ajuster vos critères de recherche pour voir plus de résultats.
//               </p>
//               <Button variant="outline" onClick={handleFiltersReset}>
//                 Réinitialiser les filtres
//               </Button>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid--3" style={{ marginBottom: '2rem' }}>
//                 {comediens.map((comedien) => (
//                   <ComedienCard key={comedien.id} comedien={comedien} />
//                 ))}
//               </div>

//               {hasMore && (
//                 <div className="text-center">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={handleLoadMore}
//                     loading={loading}
//                   >
//                     Charger plus de comédiens
//                   </Button>
//                 </div>
//               )}

//               {!hasMore && comediens.length > 0 && (
//                 <div className="text-center" style={{ padding: '2rem 0', color: '#666' }}>
//                   <p>Vous avez vu tous les comédiens correspondant à vos critères.</p>
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//       </div>
//     </>
//   )
// }
// 
import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Layout } from '@/components/Layout'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ComedienFilters } from '@/components/ComedienFilters'
import { ComedienCard } from '@/components/ComedienCard'
import { Button } from '@/components/ui/Button'
import type { Comedien, ComedienFilters as Filters } from '@/types'

export default function ComediensPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<Filters>({})
  const [comediens, setComediens] = useState<Comedien[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  
  const pageSize = 24

  // Debug: Afficher l'état de l'utilisateur
  useEffect(() => {
    console.log('👤 État utilisateur dans comediens/index:', {
      user: user,
      role: user?.role,
      isAdmin: user?.role === 'admin'
    })
  }, [user])

  const fetchComediens = useCallback(async (page = 1, currentFilters = filters, append = false) => {
    setLoading(true)
    setError('')

    try {
      // Utiliser l'API au lieu de requêtes Supabase directes
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      })

      // Ajouter les filtres aux paramètres
      if (currentFilters.gender) params.append('gender', currentFilters.gender)
      if (currentFilters.ethnicity) params.append('ethnicity', currentFilters.ethnicity)
      if (currentFilters.age_min) params.append('age_min', currentFilters.age_min.toString())
      if (currentFilters.age_max) params.append('age_max', currentFilters.age_max.toString())
      if (currentFilters.languages) params.append('languages', currentFilters.languages)
      if (currentFilters.languages_fluent) params.append('languages_fluent', currentFilters.languages_fluent)
      if (currentFilters.hair_color) params.append('hair_color', currentFilters.hair_color)
      if (currentFilters.eye_color) params.append('eye_color', currentFilters.eye_color)
      if (currentFilters.nationality) params.append('nationality', currentFilters.nationality)
      if (currentFilters.city) params.append('city', currentFilters.city)
      if (currentFilters.height_min) params.append('height_min', currentFilters.height_min.toString())
      if (currentFilters.height_max) params.append('height_max', currentFilters.height_max.toString())
      if (currentFilters.driving_licenses) params.append('driving_licenses', currentFilters.driving_licenses)
      if (currentFilters.experience_level) params.append('experience_level', currentFilters.experience_level)
      if (currentFilters.build) params.append('build', currentFilters.build)
      if (currentFilters.diverse_skills) params.append('diverse_skills', currentFilters.diverse_skills)
      if (currentFilters.desired_activities) params.append('desired_activities', currentFilters.desired_activities)
      if (currentFilters.name) params.append('name', currentFilters.name)

      const response = await fetch(`/api/comediens?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Erreur lors du chargement')

      if (append) setComediens(prev => [...prev, ...result.data])
      else setComediens(result.data)

      setTotalCount(result.pagination.total)
      setHasMore(result.data.length === pageSize)
      setCurrentPage(page)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchComediens(1, filters, false)
  }, [filters, fetchComediens])

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleFiltersReset = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchComediens(currentPage + 1, filters, true)
    }
  }
 return (
    <Layout>
      <Head>
        <title>Comédiens - ADKcasting</title>
        <meta name="description" content="Découvrez plus de 9000 comédiens professionnels sur ADKcasting. Filtrez par âge, genre, compétences et localisation pour trouver le talent parfait." />
      </Head>
      <div className="container">
        <section className="section">
          <ComedienFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
            resultCount={totalCount}
            loading={loading}
          />
          {error && (
            <div style={{
              padding: '1rem',
              marginBottom: '2rem',
              backgroundColor: '#fdf2f2',
              border: '1px solid #e74c3c',
              borderRadius: '8px',
              color: '#e74c3c'
            }}>Erreur: {error}</div>
          )}
          {comediens.length === 0 && !loading ? (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <h3 className="text-title">Aucun comédien trouvé</h3>
              <Button variant="outline" onClick={handleFiltersReset}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <>
              <div className="grid grid--comediens">
                {comediens.map((comedien) => (
                  <ComedienCard key={comedien.id} comedien={comedien} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center" style={{ marginTop: '2rem' }}>
                  <Button variant="outline" onClick={handleLoadMore} loading={loading}>
                    Charger plus de comédiens
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  )

}
