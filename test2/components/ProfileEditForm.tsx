// components/ProfileEditForm.tsx
// Formulaire d'édition de profil - Structure identique au formulaire d'inscription
import React, { useState, useEffect } from 'react'
import FileUpload from './ui/FileUpload'

interface ProfileEditFormProps {
  comedien: any
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ProfileEditForm({ comedien, onSave, onCancel, loading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialiser avec les données du comédien
    setFormData({
      ...comedien,
      // S'assurer que les tableaux existent
      languages_fluent: comedien.languages_fluent_normalized || [],
      languages_notions: comedien.languages_notions_normalized || [],
      driving_licenses: comedien.driving_licenses_normalized || [],
      dance_skills: comedien.dance_skills_normalized || [],
      music_skills: comedien.music_skills_normalized || [],
      diverse_skills: comedien.diverse_skills_normalized || [],
      desired_activities: comedien.desired_activities_normalized || [],
    })
  }, [comedien])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev: any) => {
      const currentArray = prev[field] || []
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const renderError = (field: string) => {
    return errors[field] ? <span className="field-error">{errors[field]}</span> : null
  }

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div className="form-wrapper">
      
      {/* Informations générales */}
      <section className="form-section">
        <h3>Informations personnelles</h3>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="last_name">Nom</label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
              placeholder="Nom"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="first_name">Prénom</label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
              placeholder="Prénom"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="birth_date">Date de naissance</label>
            <input
              type="date"
              id="birth_date"
              value={formData.birth_date || ''}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              required
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="gender">Genre</label>
            <select
              id="gender"
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            >
              <option value="">Genre</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="nationality">Nationalité</label>
          <input
            type="text"
            id="nationality"
            value={formData.nationality || ''}
            onChange={(e) => handleChange('nationality', e.target.value)}
            placeholder="Nationalité"
          />
        </div>
      </section>

      {/* Coordonnées personnelles */}
      <section className="form-section">
        <h3>Coordonnées personnelles</h3>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="phone">Téléphone mobile</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              placeholder="Tél mobile"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              placeholder="email@exemple.com"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="domiciliation">Région de domiciliation</label>
          <select
            id="domiciliation"
            value={formData.domiciliation || ''}
            onChange={(e) => handleChange('domiciliation', e.target.value)}
          >
            <option value="">Sélectionner votre région</option>
            <option value="Bruxelles-Capitale">Bruxelles-Capitale</option>
            <option value="Wallonie">Wallonie</option>
            <option value="Flandre">Flandre</option>
            <option value="France">France</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="street">Adresse postale</label>
          <input
            type="text"
            id="street"
            value={formData.street || ''}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder="Adresse postale"
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="zip_code">Code postal</label>
            <input
              type="text"
              id="zip_code"
              value={formData.zip_code || ''}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="Code postal"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="city">Ville</label>
            <input
              type="text"
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ville"
            />
          </div>
        </div>
      </section>

      {/* Coordonnées agent */}
      <section className="form-section">
        <h3>Coordonnées agent (optionnel)</h3>
        
        <h4>Agence principale</h4>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="agency_name">Agence</label>
            <input
              type="text"
              id="agency_name"
              value={formData.agency_name || ''}
              onChange={(e) => handleChange('agency_name', e.target.value)}
              placeholder="Nom de l'agence"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="agent_name">Nom de l'agent</label>
            <input
              type="text"
              id="agent_name"
              value={formData.agent_name || ''}
              onChange={(e) => handleChange('agent_name', e.target.value)}
              placeholder="Prénom Nom"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="agent_email">Email de l'agent</label>
            <input
              type="email"
              id="agent_email"
              value={formData.agent_email || ''}
              onChange={(e) => handleChange('agent_email', e.target.value)}
              placeholder="agent@agence.com"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="agent_phone">Téléphone de l'agent</label>
            <input
              type="tel"
              id="agent_phone"
              value={formData.agent_phone || ''}
              onChange={(e) => handleChange('agent_phone', e.target.value)}
              placeholder="Tél"
            />
          </div>
        </div>

        <h4>Deuxième agence (optionnel)</h4>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="agency_name_2">Agence 2</label>
            <input
              type="text"
              id="agency_name_2"
              value={formData.agency_name_2 || ''}
              onChange={(e) => handleChange('agency_name_2', e.target.value)}
              placeholder="Nom de la deuxième agence"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="agent_name_2">Nom de l'agent 2</label>
            <input
              type="text"
              id="agent_name_2"
              value={formData.agent_name_2 || ''}
              onChange={(e) => handleChange('agent_name_2', e.target.value)}
              placeholder="Prénom Nom"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="agent_email_2">Email de l'agent 2</label>
            <input
              type="email"
              id="agent_email_2"
              value={formData.agent_email_2 || ''}
              onChange={(e) => handleChange('agent_email_2', e.target.value)}
              placeholder="agent2@agence.com"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="agent_phone_2">Téléphone de l'agent 2</label>
            <input
              type="tel"
              id="agent_phone_2"
              value={formData.agent_phone_2 || ''}
              onChange={(e) => handleChange('agent_phone_2', e.target.value)}
              placeholder="Tél"
            />
          </div>
        </div>
      </section>

      {/* Caractéristiques physiques */}
      <section className="form-section">
        <h3>Caractéristiques physiques</h3>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="height">Taille (en cm)</label>
            <input
              type="number"
              id="height"
              min="60"
              max="220"
              value={formData.height || 170}
              onChange={(e) => handleChange('height', parseInt(e.target.value) || 170)}
              placeholder="170"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="build">Corpulence</label>
            <select
              id="build"
              value={formData.build || ''}
              onChange={(e) => handleChange('build', e.target.value)}
            >
              <option value="">Sélectionner</option>
              <option value="Mince">Mince</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Forte">Forte</option>
              <option value="Athlétique">Athlétique</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="ethnicity">Type</label>
            <select
              id="ethnicity"
              value={formData.ethnicity || ''}
              onChange={(e) => handleChange('ethnicity', e.target.value)}
            >
              <option value="">Sélectionner</option>
              <option value="Européen">Européen</option>
              <option value="Nord africain">Nord africain</option>
              <option value="Africain">Africain</option>
              <option value="Métis">Métis</option>
              <option value="Asiatique">Asiatique</option>
              <option value="Eurasien">Eurasien</option>
              <option value="Méditerranéen">Méditerranéen</option>
              <option value="Nordique">Nordique</option>
              <option value="Latino">Latino</option>
              <option value="Indien / Pakistanais">Indien / Pakistanais</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <div className="form-field">
            <label htmlFor="hair_color">Couleur des cheveux</label>
            <select
              id="hair_color"
              value={formData.hair_color || ''}
              onChange={(e) => handleChange('hair_color', e.target.value)}
            >
              <option value="">Sélectionner</option>
              <option value="Blond">Blond</option>
              <option value="Chatain clair">Chatain clair</option>
              <option value="Chatain foncé">Chatain foncé</option>
              <option value="Brun">Brun</option>
              <option value="Roux">Roux</option>
              <option value="Noir">Noir</option>
              <option value="Gris">Gris</option>
              <option value="Blanc">Blanc</option>
              <option value="Chauve">Chauve</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="eye_color">Couleur des yeux</label>
          <select
            id="eye_color"
            value={formData.eye_color || ''}
            onChange={(e) => handleChange('eye_color', e.target.value)}
          >
            <option value="">Sélectionner</option>
            <option value="Bleu">Bleu</option>
            <option value="Vert">Vert</option>
            <option value="Brun">Brun</option>
            <option value="Noisette">Noisette</option>
            <option value="Bleu-gris">Bleu-gris</option>
          </select>
        </div>
      </section>

      {/* Langues */}
      <section className="form-section">
        <h3>Langues</h3>
        
        <div className="form-field">
          <label htmlFor="native_language">Langue maternelle</label>
          <select
            id="native_language"
            value={formData.native_language || formData.native_language_normalized || ''}
            onChange={(e) => handleChange('native_language', e.target.value)}
          >
            <option value="">Sélectionner</option>
            <option value="Français">Français</option>
            <option value="Néerlandais">Néerlandais</option>
            <option value="Anglais">Anglais</option>
            <option value="Allemand">Allemand</option>
            <option value="Espagnol">Espagnol</option>
            <option value="Italien">Italien</option>
            <option value="Portugais">Portugais</option>
            <option value="Arabe">Arabe</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-field">
          <label>Parlé(es) couramment</label>
          <div className="checkbox-group">
            {['Français', 'Néerlandais', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Portugais', 'Arabe'].map(langue => (
              <label key={langue} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.languages_fluent || []).includes(langue)}
                  onChange={(e) => handleArrayChange('languages_fluent', langue, e.target.checked)}
                />
                {langue}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label>Notions</label>
          <div className="checkbox-group">
            {['Français', 'Néerlandais', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Portugais', 'Arabe'].map(langue => (
              <label key={langue} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.languages_notions || []).includes(langue)}
                  onChange={(e) => handleArrayChange('languages_notions', langue, e.target.checked)}
                />
                {langue}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Compétences */}
      <section className="form-section">
        <h3>Compétences artistiques</h3>
        
        <div className="form-field">
          <label>Permis de conduire</label>
          <div className="checkbox-group">
            {['Auto', 'Moto', 'Camion', 'Avion / hélicoptère'].map(permis => (
              <label key={permis} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.driving_licenses || []).includes(permis)}
                  onChange={(e) => handleArrayChange('driving_licenses', permis, e.target.checked)}
                />
                {permis}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label>Compétences de danse</label>
          <div className="checkbox-group">
            {['Classique', 'Salsa', 'Tango', 'Rock', 'Danse de salon', 'Hip hop'].map(danse => (
              <label key={danse} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.dance_skills || []).includes(danse)}
                  onChange={(e) => handleArrayChange('dance_skills', danse, e.target.checked)}
                />
                {danse}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label>Compétences musicales</label>
          <div className="checkbox-group">
            {['Piano', 'Guitare', 'Violon', 'Batterie', 'Saxophone / Trompette', 'Flûte','Autre (à vent)','Autre (à cordes)'].map(musique => (
              <label key={musique} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.music_skills || []).includes(musique)}
                  onChange={(e) => handleArrayChange('music_skills', musique, e.target.checked)}
                />
                {musique}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label>Autres compétences</label>
          <div className="checkbox-group">
            {['Doublage', 'Chant', 'Acrobatie', 'Art martial', 'Equitation', 'Sport de combat'].map(skill => (
              <label key={skill} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.diverse_skills || []).includes(skill)}
                  onChange={(e) => handleArrayChange('diverse_skills', skill, e.target.checked)}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Réseaux sociaux */}
      <section className="form-section">
        <h3>Site web et profils</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="website_url">Site web personnel</label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url || ''}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="Site web"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="facebook_url">Facebook</label>
            <input
              type="url"
              id="facebook_url"
              value={formData.facebook_url || ''}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
              placeholder="Facebook"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="imdb_url">Profil IMDB</label>
            <input
              type="url"
              id="imdb_url"
              value={formData.imdb_url || ''}
              onChange={(e) => handleChange('imdb_url', e.target.value)}
              placeholder="IMDB"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="linkedin_url">Profil LinkedIn</label>
            <input
              type="url"
              id="linkedin_url"
              value={formData.linkedin_url || ''}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="LinkedIn"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="other_profile_url">Autres profils</label>
          <input
            type="url"
            id="other_profile_url"
            value={formData.other_profile_url || ''}
            onChange={(e) => handleChange('other_profile_url', e.target.value)}
            placeholder="Autres"
          />
        </div>
      </section>

      {/* Vidéos */}
      <section className="form-section">
        <h3>Vidéos & Showreel</h3>
        
        <div className="form-field">
          <label htmlFor="showreel_url">Showreel principal</label>
          <input
            type="url"
            id="showreel_url"
            value={formData.showreel_url || ''}
            onChange={(e) => handleChange('showreel_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="actor_video1">Vidéo 1</label>
            <input
              type="url"
              id="actor_video1"
              value={formData.actor_video1 || ''}
              onChange={(e) => handleChange('actor_video1', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="form-field">
            <label htmlFor="actor_video2">Vidéo 2</label>
            <input
              type="url"
              id="actor_video2"
              value={formData.actor_video2 || ''}
              onChange={(e) => handleChange('actor_video2', e.target.value)}
              placeholder="https://vimeo.com/..."
            />
          </div>
        </div>
      </section>

      {/* Expérience */}
      <section className="form-section">
        <h3>Expérience & Formation</h3>
        
        <div className="form-field">
          <label htmlFor="experience_level">Niveau d'expérience</label>
          <select
            id="experience_level"
            value={formData.experience_level || ''}
            onChange={(e) => handleChange('experience_level', e.target.value)}
          >
            <option value="">Sélectionner votre niveau</option>
            <option value="Aucune">Aucune expérience</option>
            <option value="Amateur">Amateur</option>
            <option value="Etudiant">Étudiant</option>
            <option value="Semi-professionnel">Semi-professionnel</option>
            <option value="Professionnel">Professionnel</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="experience">Expérience professionnelle</label>
          <textarea
            id="experience"
            value={formData.experience || ''}
            onChange={(e) => handleChange('experience', e.target.value)}
            placeholder="Décrivez vos expériences professionnelles : films, théâtre, publicités, etc."
            rows={6}
          />
        </div>

        <div className="form-field">
          <label htmlFor="certificates">Formation & Diplômes</label>
          <textarea
            id="certificates"
            value={formData.certificates || ''}
            onChange={(e) => handleChange('certificates', e.target.value)}
            placeholder="Formations en art dramatique, diplômes, stages, workshops, etc."
            rows={4}
          />
        </div>

        <div className="form-field">
          <label>Sphère(s) d'activité(s) désirée(s)</label>
          <div className="checkbox-group">
            {[
              'Long métrage', 'Court métrage', 'Film d\'étudiant', 
              'Publicité', 'Doublage', 'Films d\'entreprise', 'Films institutionnels'
            ].map(activite => (
              <label key={activite} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.desired_activities || []).includes(activite)}
                  onChange={(e) => handleArrayChange('desired_activities', activite, e.target.checked)}
                />
                {activite}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Boutons d'action */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button" disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="save-button" disabled={loading}>
          {loading ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
        </button>
      </div>

      </div>
    </form>
  )
}
