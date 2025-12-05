// components/ComedienFilters.tsx
import React, { useState, useEffect } from 'react'
import { Input, Select } from './ui/Input'
import { Button } from './ui/Button'
import type { ComedienFilters as ComedienFiltersType } from '@/types'

interface ComedienFiltersProps {
  filters: ComedienFiltersType
  onFiltersChange: (filters: ComedienFiltersType) => void
  onReset: () => void
  resultCount?: number
  loading?: boolean
}

export const ComedienFilters: React.FC<ComedienFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  resultCount,
  loading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customSkills, setCustomSkills] = useState<{
    dance_skills: string[]
    music_skills: string[]
    diverse_skills: string[]
    desired_activities: string[]
  }>({
    dance_skills: [],
    music_skills: [],
    diverse_skills: [],
    desired_activities: []
  })

  // Charger les compétences personnalisées depuis l'API
  useEffect(() => {
    fetch('/api/skills/custom')
      .then(res => res.json())
      .then(data => {
        setCustomSkills({
          dance_skills: data.dance_skills || [],
          music_skills: data.music_skills || [],
          diverse_skills: data.diverse_skills || [],
          desired_activities: data.desired_activities || []
        })
      })
      .catch(err => console.error('Erreur chargement compétences:', err))
  }, [])

  const handleFilterChange = (key: keyof ComedienFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  // Options pour les selects
  const genderOptions = [
    { value: '', label: 'Tous' },
    { value: 'Masculin', label: 'Masculin' },
    { value: 'Féminin', label: 'Féminin' },
    { value: 'Autre', label: 'Autre' }
  ]

  const ethnicityOptions = [
    { value: '', label: 'Toutes' },
    { value: 'Européen', label: 'Européen' },
    { value: 'Nord africain', label: 'Nord africain' },
    { value: 'Africain', label: 'Africain' },
    { value: 'Métis', label: 'Métis' },
    { value: 'Asiatique', label: 'Asiatique' },
    { value: 'Eurasien', label: 'Eurasien' },
    { value: 'Méditerranéen', label: 'Méditerranéen' },
    { value: 'Nordique', label: 'Nordique' },
    { value: 'Latino', label: 'Latino' },
    { value: 'Indien / Pakistanais', label: 'Indien / Pakistanais' }
  ]

  const hairColorOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Blond', label: 'Blond' },
    { value: 'Brun', label: 'Brun' },
  { value: 'Chatain clair', label: 'Chatain clair' },       
  { value: 'Chatain foncé', label: 'Chatain foncé' },  
    { value: 'Roux', label: 'Roux' },
    { value: 'Noir', label: 'Noir' },
    { value: 'Gris', label: 'Gris' },
    { value: 'Blanc', label: 'Blanc' },
    { value: 'Chauve', label: 'Chauve' }
  ]

  const eyeColorOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Bleu', label: 'Bleu' },
    { value: 'Vert', label: 'Vert' },
  { value: 'Brun', label: 'Brun' },           
     { value: 'Bleu-gris', label: 'Bleu-gris' }    
  ]

  const buildOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Mince', label: 'Mince' },
    { value: 'Moyenne', label: 'Moyenne' }, 
    { value: 'Athlétique', label: 'Athlétique' },
    { value: 'Forte', label: 'Forte' }
  ]

  const experienceLevelOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Aucune', label: 'Aucune' },
    { value: 'Amateur', label: 'Amateur' },
    { value: 'Etudiant', label: 'Etudiant' },
    { value: 'Professionnel', label: 'Professionnel' },
    { value: 'Semi-professionnel', label: 'Semi-professionnel' }

  ]

  const languageOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Français', label: 'Français' },
    { value: 'Anglais', label: 'Anglais' },
    { value: 'Espagnol', label: 'Espagnol' },
    { value: 'Italien', label: 'Italien' },
    { value: 'Allemand', label: 'Allemand' },
    { value: 'Néerlandais', label: 'Néerlandais' },
    { value: 'Portugais', label: 'Portugais' },
    { value: 'Russe', label: 'Russe' },
    { value: 'Arabe', label: 'Arabe' },
    { value: 'Chinois', label: 'Chinois' },
    { value: 'Japonais', label: 'Japonais' }
  ]

  const nationalityOptions = [
    { value: '', label: 'Toutes' },
    { value: 'Française', label: 'Française' },
    { value: 'Belge', label: 'Belge' },
    { value: 'Suisse', label: 'Suisse' },
    { value: 'Canadienne', label: 'Canadienne' },
    { value: 'Americaine', label: 'Américaine' },
    { value: 'Britannique', label: 'Britannique' },
    { value: 'Allemande', label: 'Allemande' },
    { value: 'Italienne', label: 'Italienne' },
    { value: 'Espagnole', label: 'Espagnole' },
    { value: 'Portugaise', label: 'Portugaise' },
    { value: 'Néerlandaise', label: 'Néerlandaise' },
    { value: 'Autre', label: 'Autre' }
  ]

  // Compétences de danse - fusionner prédéfinies + personnalisées
  const predefinedDanceSkills = ['Classique', 'Salsa', 'Tango', 'Rock', 'Danse de salon', 'Hip hop']
  const allDanceSkills = Array.from(new Set([...predefinedDanceSkills, ...customSkills.dance_skills])).sort()
  const danceSkillsOptions = [
    { value: '', label: 'Indifférent' },
    ...allDanceSkills.map(skill => ({ value: skill, label: skill }))
  ]

  // Compétences musicales - fusionner prédéfinies + personnalisées
  const predefinedMusicSkills = ['Piano', 'Guitare', 'Violon', 'Batterie', 'Saxophone / Trompette', 'Flûte', 'Autre (à vent)', 'Autre (à cordes)']
  const allMusicSkills = Array.from(new Set([...predefinedMusicSkills, ...customSkills.music_skills])).sort()
  const musicSkillsOptions = [
    { value: '', label: 'Indifférent' },
    ...allMusicSkills.map(skill => ({ value: skill, label: skill }))
  ]

  // Compétences diverses - fusionner prédéfinies + personnalisées
  const predefinedDiverseSkills = ['Chant', 'Doublage', 'Acrobatie', 'Art martial', 'Sport de combat', 'Equitation']
  const allDiverseSkills = Array.from(new Set([...predefinedDiverseSkills, ...customSkills.diverse_skills])).sort()
  const diverse_skills = [
    { value: '', label: 'Indifférent' },
    ...allDiverseSkills.map(skill => ({ value: skill, label: skill }))
  ]

  const drivingLicenseOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Auto', label: 'Auto' },
    { value: 'Moto', label: 'Moto' },
    { value: 'Camion', label: 'Camion' },
    { value: 'Avion / hélicoptère', label: 'Avion / hélicoptère' }
  ]

  // Activités souhaitées - fusionner prédéfinies + personnalisées
  const predefinedActivities = ['Long métrage', 'Court métrage', 'Film d\'étudiant', 'Publicité', 'Doublage', 'Films d\'entreprise', 'Films institutionnels']
  const allActivities = Array.from(new Set([...predefinedActivities, ...customSkills.desired_activities])).sort()
  const desiredActivitiesOptions = [
    { value: '', label: 'Indifférent' },
    ...allActivities.map(activity => ({ value: activity, label: activity }))
  ]

  return (
    <div className="filters">
      <div className="filters__single-row">
        <div className="filters__title-group">
          <h2>Filtres de recherche</h2>
          {resultCount !== undefined && (
            <span className="filters__live-count">
              {loading ? 'Recherche...' : `${resultCount} comédien(s)`}
            </span>
          )}
        </div>

        <Input
          value={filters.name || ''}
          onChange={(e) => handleFilterChange('name', e.target.value)}
          placeholder="Nom, prénom..."
        />

        <Select
          value={filters.gender || ''}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
          options={genderOptions}
          placeholder="Genre"
        />

        <Input
          className='input_age'
          type="number"
          min="1"
          max="99"
          value={filters.age_min || ''}
          onChange={(e) => handleFilterChange('age_min', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Âge min"
        />
        <Input
          className='input_age'
          type="number"
          min="1"
          max="99"
          value={filters.age_max || ''}
          onChange={(e) => handleFilterChange('age_max', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Âge max"
        />

        <Select
          value={filters.languages_fluent || ''}
          onChange={(e) => handleFilterChange('languages_fluent', e.target.value)}
          options={languageOptions}
          placeholder="Langue maternelle"
        />

        <Select
          value={filters.ethnicity || ''}
          onChange={(e) => handleFilterChange('ethnicity', e.target.value)}
          options={ethnicityOptions}
          placeholder="Origine ethnique"
        />

        <Button variant="outline" onClick={onReset}>
          Réinitialiser
        </Button>

        <button
          className="filters__toggle-icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '×' : '+'}
        </button>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="filters__grid" style={{ marginTop: '1.5rem' }}>
          <Select
            value={filters.build || ''}
            onChange={(e) => handleFilterChange('build', e.target.value)}
            options={buildOptions}
            placeholder="Morphologie"
          />

          <Select
            value={filters.languages || ''}
            onChange={(e) => handleFilterChange('languages', e.target.value)}
            options={languageOptions}
            placeholder="Autre langue"
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              className='input_taille'
              type="number"
              min="140"
              max="220"
              value={filters.height_min || ''}
              onChange={(e) => handleFilterChange('height_min', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Taille min"
            />
            <Input
              className='input_taille'
              type="number"
              min="140"
              max="220"
              value={filters.height_max || ''}
              onChange={(e) => handleFilterChange('height_max', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Taille max"
            />
          </div>

          <Select
            value={filters.hair_color || ''}
            onChange={(e) => handleFilterChange('hair_color', e.target.value)}
            options={hairColorOptions}
            placeholder="Couleur de cheveux"
          />

          <Select
            value={filters.eye_color || ''}
            onChange={(e) => handleFilterChange('eye_color', e.target.value)}
            options={eyeColorOptions}
            placeholder="Couleur des yeux"
          />

          <Input
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Ville"
          />

          <Select
            value={filters.nationality || ''}
            onChange={(e) => handleFilterChange('nationality', e.target.value)}
            options={nationalityOptions}
            placeholder="Nationalité"
          />

          <Select
            value={filters.experience_level || ''}
            onChange={(e) => handleFilterChange('experience_level', e.target.value)}
            options={experienceLevelOptions}
            placeholder="Niveau d'expérience"
          />

          <Select
            value={filters.dance_skills || ''}
            onChange={(e) => handleFilterChange('dance_skills', e.target.value)}
            options={danceSkillsOptions}
            placeholder="Compétences de danse"
          />

          <Select
            value={filters.music_skills || ''}
            onChange={(e) => handleFilterChange('music_skills', e.target.value)}
            options={musicSkillsOptions}
            placeholder="Compétences musicales"
          />

          <Select
            value={filters.wp_skills || ''}
            onChange={(e) => handleFilterChange('wp_skills', e.target.value)}
            options={diverse_skills}
            placeholder="Compétences"
          />

          <Select
            value={filters.driving_licenses || ''}
            onChange={(e) => handleFilterChange('driving_licenses', e.target.value)}
            options={drivingLicenseOptions}
            placeholder="Permis de conduire"
          />

          <Select
            value={filters.desired_activities || ''}
            onChange={(e) => handleFilterChange('desired_activities', e.target.value)}
            options={desiredActivitiesOptions}
            placeholder="Activités souhaitées"
          />
        </div>
      )}
    </div>
  )
}
