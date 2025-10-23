// components/ComedienFilters.tsx
import React, { useState } from 'react'
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
  { value: 'Chatain', label: 'Chatain clair' },        // ✅ Sans accent
  { value: 'Chatain foncé', label: 'Chatain foncé' },  // ✅ Ajouté
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
  { value: 'Brun', label: 'Brun' },              // ✅ Changé de Marron    { value: 'Noisette', label: 'Noisette' },
     { value: 'Bleu-gris', label: 'Bleu-gris' }     // ✅ Changé de Gris
  ]

  const buildOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Mince', label: 'Mince' },
    { value: 'Moyenne', label: 'Moyenne' },      // ✅ Changé
    { value: 'Athlétique', label: 'Athlétique' }, // ✅ Changé
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
    { value: 'Américaine', label: 'Américaine' },
    { value: 'Britannique', label: 'Britannique' },
    { value: 'Allemande', label: 'Allemande' },
    { value: 'Italienne', label: 'Italienne' },
    { value: 'Espagnole', label: 'Espagnole' },
    { value: 'Portugaise', label: 'Portugaise' },
    { value: 'Néerlandaise', label: 'Néerlandaise' },
    { value: 'Autre', label: 'Autre' }
  ]

    const wp_skills = [
    { value: '', label: 'Indifférent' },
    { value: 'Chant', label: 'Chant' },
    { value: 'Doublage', label: 'Doublage' },
    { value: 'Acrobatie', label: 'Acrobatie' },
    { value: 'Art martial', label: 'Art martial' },
    { value: 'Sport de combat', label: 'Sport de combat' },
    { value: 'Équitation', label: 'Équitation' }
  ]

  const drivingLicenseOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Auto', label: 'Auto' },
    { value: 'Moto', label: 'Moto' },
    { value: 'Camion', label: 'Camion' },
    { value: 'Avion / hélicoptère', label: 'Avion / hélicoptère' }
  ]

  const desiredActivitiesOptions = [
    { value: '', label: 'Indifférent' },
    { value: 'Long métrage', label: 'Long métrage' },
    { value: 'Court métrage', label: 'Court métrage' },
    { value: 'Film d\'étudiant', label: 'Film d\'étudiant' },
    { value: 'Publicité', label: 'Publicité' },
    { value: 'Doublage', label: 'Doublage' },
    { value: 'Films d\'entreprise', label: 'Films d\'entreprise' },
    { value: 'Films institutionnels', label: 'Films institutionnels' }
  ]

  return (
    <div className="filters">
      <div className="filters__header">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2>Filtres de recherche</h2>
          {resultCount !== undefined && (
            <span className="filters__live-count">
              {loading ? 'Recherche...' : `${resultCount} comédien(s)`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="filters__toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '− Masquer' : '+ Plus de filtres'}
          </button>
        </div>
      </div>

      {/* Filtres de base - ordre spécifique */}
      <div className="filters__main-row">
        <div className="filters__left">
          <Input
            value={filters.name || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            placeholder="Nom, prénom..."
          />
          <Button variant="outline" onClick={onReset}>
            Réinitialiser
          </Button>
        </div>
        
        <div className="filters__right">
          <Select
            label="Genre"
            value={filters.gender || ''}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            options={genderOptions}
          />
          
          <div className="filters__age-group">
            <Input
              label="Âge min"
              type="number"
              min="1"
              max="99"
              value={filters.age_min || ''}
              onChange={(e) => handleFilterChange('age_min', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="18"
            />
            <Input
              label="Âge max"
              type="number"
              min="1"
              max="99"
              value={filters.age_max || ''}
              onChange={(e) => handleFilterChange('age_max', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="65"
            />
          </div>

          <Select
            label="Langue"
            value={filters.languages_fluent || ''}
            onChange={(e) => handleFilterChange('languages_fluent', e.target.value)}
            options={languageOptions}
          />

          <Select
            label="Type"
            value={filters.ethnicity || ''}
            onChange={(e) => handleFilterChange('ethnicity', e.target.value)}
            options={ethnicityOptions}
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="filters__grid" style={{ marginTop: '1.5rem' }}>
          <Select
            label="Corpulence"
            value={filters.build || ''}
            onChange={(e) => handleFilterChange('build', e.target.value)}
            options={buildOptions}
          />

          <Select
            label="Langue maternelle"
            value={filters.languages || ''}
            onChange={(e) => handleFilterChange('languages', e.target.value)}
            options={languageOptions}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              label="Taille min (cm)"
              type="number"
              min="140"
              max="220"
              value={filters.height_min || ''}
              onChange={(e) => handleFilterChange('height_min', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="140"
            />
            <Input
              label="Taille max (cm)"
              type="number"
              min="140"
              max="220"
              value={filters.height_max || ''}
              onChange={(e) => handleFilterChange('height_max', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="220"
            />
          </div>

          <Select
            label="Couleur des cheveux"
            value={filters.hair_color || ''}
            onChange={(e) => handleFilterChange('hair_color', e.target.value)}
            options={hairColorOptions}
          />

          <Select
            label="Couleur des yeux"
            value={filters.eye_color || ''}
            onChange={(e) => handleFilterChange('eye_color', e.target.value)}
            options={eyeColorOptions}
          />

          <Input
            label="Ville"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="ex: Bruxelles, Paris"
          />

          <Select
            label="Nationalité"
            value={filters.nationality || ''}
            onChange={(e) => handleFilterChange('nationality', e.target.value)}
            options={nationalityOptions}
          />

          <Select
            label="Niveau d'expérience"
            value={filters.experience_level || ''}
            onChange={(e) => handleFilterChange('experience_level', e.target.value)}
            options={experienceLevelOptions}
          />

          <Select
              label="Compétences (wp)"
            value={filters.wp_skills || ''}
            onChange={(e) => handleFilterChange('wp_skills', e.target.value)}
            options={wp_skills}
          />

          <Select
            label="Permis de conduire"
            value={filters.driving_licenses || ''}
            onChange={(e) => handleFilterChange('driving_licenses', e.target.value)}
            options={drivingLicenseOptions}
          />

          <Select
            label="Activités désirées"
            value={filters.desired_activities || ''}
            onChange={(e) => handleFilterChange('desired_activities', e.target.value)}
            options={desiredActivitiesOptions}
          />
        </div>
      )}
    </div>
  )
}
