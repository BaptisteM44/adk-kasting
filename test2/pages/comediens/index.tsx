import React, { useState, useEffect, useCallback, useRef } from 'react'
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

  // Charger les filtres depuis localStorage au démarrage
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('comediens_filters')
      return savedFilters ? JSON.parse(savedFilters) : {}
    }
    return {}
  })

  const [comediens, setComediens] = useState<Comedien[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const pageSize = 25

  // Sauvegarder les filtres dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('comediens_filters', JSON.stringify(filters))
    }
  }, [filters])

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
      if (currentFilters.wp_skills) params.append('wp_skills', currentFilters.wp_skills)
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

  // Intersection Observer pour les animations d'apparition
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate')
        }
      })
    }, observerOptions)

    // Observer tous les éléments avec la classe comedien-card-reveal
    const animatedElements = document.querySelectorAll('.comedien-card-reveal')
    animatedElements.forEach(el => observer.observe(el))

    // Cleanup
    return () => {
      animatedElements.forEach(el => observer.unobserve(el))
    }
  }, [comediens]) // Re-run quand les comédiens changent

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
        <section className="section comediens-section">
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
                  <div key={comedien.id} className="comedien-card-reveal">
                    <ComedienCard comedien={comedien} />
                  </div>
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
