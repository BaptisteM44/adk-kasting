// components/InscriptionFormComplete.tsx
import React, { useState } from 'react'
import type { InscriptionFormData } from '@/types'
import FileUpload from './ui/FileUpload'

interface InscriptionFormCompleteProps {
  onSubmit: (data: InscriptionFormData) => void
  loading?: boolean
}

export default function InscriptionFormComplete({ onSubmit, loading = false }: InscriptionFormCompleteProps) {
  const [formData, setFormData] = useState<InscriptionFormData>({
    // Informations générales
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    nationality: '',
    
    // Données de connexion  
    email: '',
    password: '',
    
    // Coordonnées personnelles
    phone: '',
    domiciliation: '',
    street: '',
    zip_code: '',
    city: '',
    country: 'Belgique',
    
    // Caractéristiques physiques
    height: 170,
    build: '',
    ethnicity: '',
    hair_color: '',
    eye_color: '',
    
    // Langues (WordPress format)
    native_language: '',
    languages_fluent: [],
    languages_notions: [],
    
    // Compétences (WordPress format)
    driving_licenses: [],
    dance_skills: [],
    music_skills: [],
    wp_skills: [],
    
    // Agence/Agent (WordPress format)
    agency_name: '',
    agent_name: '',
    agent_email: '',
    agent_phone: '',
    
    // Deuxième agence/agent (optionnel)
    agency_name_2: '',
    agent_name_2: '',
    agent_email_2: '',
    agent_phone_2: '',
    
    // Réseaux sociaux (WordPress format)
    website_url: '',
    facebook_url: '',
    imdb_url: '',
    linkedin_url: '',
    other_profile_url: '',
    
    // Photos (WordPress format - 5 photos)
    photos: [],
    
    // Vidéos (WordPress format)
    showreel_url: '',
    video_1_url: '',
    video_2_url: '',
    
    // Expérience
    experience_level: '',
    desired_activities: [],
    professional_experience: '',
    training_diplomas: '',

    // Fichiers (WordPress format)
    cv_pdf_url: '',
    parental_authorization_url: ''
  })

  const [files, setFiles] = useState<{
    cv_file: File | null
    parental_auth_file: File | null
    photo_files: (File | null)[] // 5 photos WordPress
  }>({
    cv_file: null,
    parental_auth_file: null,
    photo_files: [null, null, null, null, null] // 5 photos max
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  // Fonction pour vérifier si l'utilisateur est mineur
  const isMinor = (birthDate: string): boolean => {
    return calculateAge(birthDate) < 18
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation des champs requis
    if (!formData.first_name.trim()) newErrors.first_name = 'Le prénom est requis'
    if (!formData.last_name.trim()) newErrors.last_name = 'Le nom est requis'
    if (!formData.birth_date) newErrors.birth_date = 'La date de naissance est requise'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.nationality) newErrors.nationality = 'La nationalité est requise'
    if (!formData.domiciliation) newErrors.domiciliation = 'La domiciliation est requise'
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'
    if (!formData.zip_code.trim()) newErrors.zip_code = 'Le code postal est requis'

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    // Validation des activités désirées
    if (!formData.desired_activities || formData.desired_activities.length === 0) {
      newErrors.desired_activities = 'Veuillez sélectionner au moins une activité'
    }

    // Validation autorisation parentale pour les mineurs
    if (formData.birth_date && isMinor(formData.birth_date)) {
      if (!files.parental_auth_file) {
        newErrors.parental_auth_file = 'L\'autorisation parentale est obligatoire pour les mineurs'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof InscriptionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Supprimer l'erreur si le champ est maintenant valide
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayChange = (field: keyof InscriptionFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value)
      return { ...prev, [field]: newArray }
    })
    
    // Supprimer l'erreur pour les activités si au moins une est sélectionnée
    if (field === 'desired_activities' && checked && errors.desired_activities) {
      setErrors(prev => ({ ...prev, desired_activities: '' }))
    }
  }

  const handleFileChange = (fileType: 'cv_file' | 'parental_auth_file', file: File | null) => {
    setFiles(prev => ({ ...prev, [fileType]: file }))
  }

  const handlePhotoChange = (index: number, file: File | null) => {
    const newPhotoFiles = [...files.photo_files]
    newPhotoFiles[index] = file
    setFiles(prev => ({ ...prev, photo_files: newPhotoFiles }))
  }

  const renderError = (field: string) => {
    return errors[field] ? <span className="field-error">{errors[field]}</span> : null
  }

  return (
    <form onSubmit={handleSubmit} className="inscription-form-complete">
      <div className="form-wrapper">
      
      {/* Informations générales */}
      <section className="form-section">
        <h3>Formulaire d’inscription</h3>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="last_name">Nom</label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
              className={errors.last_name ? 'error' : ''}
              placeholder="Nom"
            />
            {renderError('last_name')}
          </div>
          
          <div className="form-field">
            <label htmlFor="first_name">Prénom</label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
              className={errors.first_name ? 'error' : ''}
              placeholder="Prénom"
            />
            {renderError('first_name')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="birth_date">Date de naissance</label>
            <input
              type="date"
              id="birth_date"
              value={formData.birth_date}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              required
              className={errors.birth_date ? 'error' : ''}
              placeholder="Date de naissance"
            />
            {renderError('birth_date')}
          </div>
          
          <div className="form-field">
            <label htmlFor="gender">Genre</label>
            <select
              id="gender"
              value={formData.gender}
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
          <select
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            required
            className={errors.nationality ? 'error' : ''}
          >
            <option value="">Sélectionner votre nationalité</option>
            <option value="Afghane">Afghane</option>
            <option value="Albanaise">Albanaise</option>
            <option value="Algerienne">Algerienne</option>
            <option value="Allemande">Allemande</option>
            <option value="Americaine">Americaine</option>
            <option value="Andorrane">Andorrane</option>
            <option value="Angolaise">Angolaise</option>
            <option value="Antiguaise et barbudienne">Antiguaise et barbudienne</option>
            <option value="Argentine">Argentine</option>
            <option value="Armenienne">Armenienne</option>
            <option value="Australienne">Australienne</option>
            <option value="Autrichienne">Autrichienne</option>
            <option value="Azerbaïdjanaise">Azerbaïdjanaise</option>
            <option value="Bahamienne">Bahamienne</option>
            <option value="Bahreinienne">Bahreinienne</option>
            <option value="Bangladaise">Bangladaise</option>
            <option value="Barbadienne">Barbadienne</option>
            <option value="Belge">Belge</option>
            <option value="Belizienne">Belizienne</option>
            <option value="Beninoise">Beninoise</option>
            <option value="Bhoutanaise">Bhoutanaise</option>
            <option value="Bielorusse">Bielorusse</option>
            <option value="Birmane">Birmane</option>
            <option value="Bissau-Guinéenne">Bissau-Guinéenne</option>
            <option value="Bolivienne">Bolivienne</option>
            <option value="Bosnienne">Bosnienne</option>
            <option value="Botswanaise">Botswanaise</option>
            <option value="Bresilienne">Bresilienne</option>
            <option value="Britannique">Britannique</option>
            <option value="Bruneienne">Bruneienne</option>
            <option value="Bulgare">Bulgare</option>
            <option value="Burkinabe">Burkinabe</option>
            <option value="Burundaise">Burundaise</option>
            <option value="Cambodgienne">Cambodgienne</option>
            <option value="Camerounaise">Camerounaise</option>
            <option value="Canadienne">Canadienne</option>
            <option value="Cap-verdienne">Cap-verdienne</option>
            <option value="Centrafricaine">Centrafricaine</option>
            <option value="Chilienne">Chilienne</option>
            <option value="Chinoise">Chinoise</option>
            <option value="Chypriote">Chypriote</option>
            <option value="Colombienne">Colombienne</option>
            <option value="Comorienne">Comorienne</option>
            <option value="Congolaise">Congolaise</option>
            <option value="Costaricaine">Costaricaine</option>
            <option value="Croate">Croate</option>
            <option value="Cubaine">Cubaine</option>
            <option value="Danoise">Danoise</option>
            <option value="Djiboutienne">Djiboutienne</option>
            <option value="Dominicaine">Dominicaine</option>
            <option value="Dominiquaise">Dominiquaise</option>
            <option value="Egyptienne">Egyptienne</option>
            <option value="Emirienne">Emirienne</option>
            <option value="Equato-guineenne">Equato-guineenne</option>
            <option value="Equatorienne">Equatorienne</option>
            <option value="Erythreenne">Erythreenne</option>
            <option value="Espagnole">Espagnole</option>
            <option value="Est-timoraise">Est-timoraise</option>
            <option value="Estonienne">Estonienne</option>
            <option value="Ethiopienne">Ethiopienne</option>
            <option value="Fidjienne">Fidjienne</option>
            <option value="Finlandaise">Finlandaise</option>
            <option value="Française">Française</option>
            <option value="Gabonaise">Gabonaise</option>
            <option value="Gambienne">Gambienne</option>
            <option value="Georgienne">Georgienne</option>
            <option value="Ghaneenne">Ghaneenne</option>
            <option value="Grenadienne">Grenadienne</option>
            <option value="Guatemalteque">Guatemalteque</option>
            <option value="Guineenne">Guineenne</option>
            <option value="Guyanienne">Guyanienne</option>
            <option value="Haïtienne">Haïtienne</option>
            <option value="Hellenique">Hellenique</option>
            <option value="Hondurienne">Hondurienne</option>
            <option value="Hongroise">Hongroise</option>
            <option value="Indienne">Indienne</option>
            <option value="Indonesienne">Indonesienne</option>
            <option value="Irakienne">Irakienne</option>
            <option value="Iranienne">Iranienne</option>
            <option value="Irlandaise">Irlandaise</option>
            <option value="Islandaise">Islandaise</option>
            <option value="Israélienne">Israélienne</option>
            <option value="Italienne">Italienne</option>
            <option value="Ivoirienne">Ivoirienne</option>
            <option value="Jamaïcaine">Jamaïcaine</option>
            <option value="Japonaise">Japonaise</option>
            <option value="Jordanienne">Jordanienne</option>
            <option value="Kazakhstanaise">Kazakhstanaise</option>
            <option value="Kenyane">Kenyane</option>
            <option value="Kirghize">Kirghize</option>
            <option value="Kiribatienne">Kiribatienne</option>
            <option value="Kittitienne-et-nevicienne">Kittitienne-et-nevicienne</option>
            <option value="Kossovienne">Kossovienne</option>
            <option value="Koweitienne">Koweitienne</option>
            <option value="Laotienne">Laotienne</option>
            <option value="Lesothane">Lesothane</option>
            <option value="Lettone">Lettone</option>
            <option value="Libanaise">Libanaise</option>
            <option value="Liberienne">Liberienne</option>
            <option value="Libyenne">Libyenne</option>
            <option value="Liechtensteinoise">Liechtensteinoise</option>
            <option value="Lituanienne">Lituanienne</option>
            <option value="Luxembourgeoise">Luxembourgeoise</option>
            <option value="Macedonienne">Macedonienne</option>
            <option value="Malaisienne">Malaisienne</option>
            <option value="Malawienne">Malawienne</option>
            <option value="Maldivienne">Maldivienne</option>
            <option value="Malgache">Malgache</option>
            <option value="Malienne">Malienne</option>
            <option value="Maltaise">Maltaise</option>
            <option value="Marocaine">Marocaine</option>
            <option value="Marshallaise">Marshallaise</option>
            <option value="Mauricienne">Mauricienne</option>
            <option value="Mauritanienne">Mauritanienne</option>
            <option value="Mexicaine">Mexicaine</option>
            <option value="Micronesienne">Micronesienne</option>
            <option value="Moldave">Moldave</option>
            <option value="Monegasque">Monegasque</option>
            <option value="Mongole">Mongole</option>
            <option value="Montenegrine">Montenegrine</option>
            <option value="Mozambicaine">Mozambicaine</option>
            <option value="Namibienne">Namibienne</option>
            <option value="Nauruane">Nauruane</option>
            <option value="Neerlandaise">Neerlandaise</option>
            <option value="Neo-zelandaise">Neo-zelandaise</option>
            <option value="Nepalaise">Nepalaise</option>
            <option value="Nicaraguayenne">Nicaraguayenne</option>
            <option value="Nigeriane">Nigeriane</option>
            <option value="Nigerienne">Nigerienne</option>
            <option value="Nord-coréenne">Nord-coréenne</option>
            <option value="Norvegienne">Norvegienne</option>
            <option value="Omanaise">Omanaise</option>
            <option value="Ougandaise">Ougandaise</option>
            <option value="Ouzbeke">Ouzbeke</option>
            <option value="Pakistanaise">Pakistanaise</option>
            <option value="Palau">Palau</option>
            <option value="Palestinienne">Palestinienne</option>
            <option value="Panameenne">Panameenne</option>
            <option value="Papouane-neoguineenne">Papouane-neoguineenne</option>
            <option value="Paraguayenne">Paraguayenne</option>
            <option value="Peruvienne">Peruvienne</option>
            <option value="Philippine">Philippine</option>
            <option value="Polonaise">Polonaise</option>
            <option value="Portoricaine">Portoricaine</option>
            <option value="Portugaise">Portugaise</option>
            <option value="Qatarienne">Qatarienne</option>
            <option value="Roumaine">Roumaine</option>
            <option value="Russe">Russe</option>
            <option value="Rwandaise">Rwandaise</option>
            <option value="Saint-lucienne">Saint-lucienne</option>
            <option value="Saint-marinaise">Saint-marinaise</option>
            <option value="Saint-vincentaise-et-grenadine">Saint-vincentaise-et-grenadine</option>
            <option value="Salomonaise">Salomonaise</option>
            <option value="Salvadorienne">Salvadorienne</option>
            <option value="Samoane">Samoane</option>
            <option value="Santomeenne">Santomeenne</option>
            <option value="Saoudienne">Saoudienne</option>
            <option value="Senegalaise">Senegalaise</option>
            <option value="Serbe">Serbe</option>
            <option value="Seychelloise">Seychelloise</option>
            <option value="Sierra-leonaise">Sierra-leonaise</option>
            <option value="Singapourienne">Singapourienne</option>
            <option value="Slovaque">Slovaque</option>
            <option value="Slovene">Slovene</option>
            <option value="Somalienne">Somalienne</option>
            <option value="Soudanaise">Soudanaise</option>
            <option value="Sri-lankaise">Sri-lankaise</option>
            <option value="Sud-africaine">Sud-africaine</option>
            <option value="Sud-coréenne">Sud-coréenne</option>
            <option value="Suedoise">Suedoise</option>
            <option value="Suisse">Suisse</option>
            <option value="Surinamaise">Surinamaise</option>
            <option value="Swazie">Swazie</option>
            <option value="Syrienne">Syrienne</option>
            <option value="Tadjike">Tadjike</option>
            <option value="Taiwanaise">Taiwanaise</option>
            <option value="Tanzanienne">Tanzanienne</option>
            <option value="Tchadienne">Tchadienne</option>
            <option value="Tcheque">Tcheque</option>
            <option value="Thaïlandaise">Thaïlandaise</option>
            <option value="Togolaise">Togolaise</option>
            <option value="Tonguienne">Tonguienne</option>
            <option value="Trinidadienne">Trinidadienne</option>
            <option value="Tunisienne">Tunisienne</option>
            <option value="Turkmene">Turkmene</option>
            <option value="Turque">Turque</option>
            <option value="Tuvaluane">Tuvaluane</option>
            <option value="Ukrainienne">Ukrainienne</option>
            <option value="Uruguayenne">Uruguayenne</option>
            <option value="Vanuatuane">Vanuatuane</option>
            <option value="Venezuelienne">Venezuelienne</option>
            <option value="Vietnamienne">Vietnamienne</option>
            <option value="Yemenite">Yemenite</option>
            <option value="Zambienne">Zambienne</option>
            <option value="Zimbabweenne">Zimbabweenne</option>
          </select>
          {renderError('nationality')}
        </div>
      </section>

      {/* Données de connexion */}
      <section className="form-section">
        <h3>Données de connexion</h3>
        
        <div className="form-field">
          <label htmlFor="email">Adresse email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className={errors.email ? 'error' : ''}
            placeholder="votre.email@exemple.com"
          />
          {renderError('email')}
        </div>
        
        <div className="form-field">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            className={errors.password ? 'error' : ''}
            placeholder="Au moins 6 caractères"
            minLength={6}
          />
          {renderError('password')}
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
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              className={errors.phone ? 'error' : ''}
              placeholder="Tél mobile"
            />
            {renderError('phone')}
          </div>
          
          <div className="form-field">
            <label htmlFor="phone_fixe">Téléphone fixe</label>
            <input
              type="tel"
              id="phone_fixe"
              value={formData.phone_fixe || ''}
              onChange={(e) => handleChange('phone_fixe', e.target.value)}
              placeholder="Tél fixe (optionnel)"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="domiciliation">Région de domiciliation</label>
          <select
            id="domiciliation"
            value={formData.domiciliation}
            onChange={(e) => handleChange('domiciliation', e.target.value)}
            required
            className={errors.domiciliation ? 'error' : ''}
          >
            <option value="">Sélectionner votre région</option>
            <option value="Bruxelles-Capitale">Bruxelles-Capitale</option>
            <option value="Wallonie">Wallonie</option>
            <option value="Flandre">Flandre</option>
            <option value="France">France</option>
            <option value="Autre">Autre</option>
          </select>
          {renderError('domiciliation')}
        </div>

        <div className="form-field">
          <label htmlFor="street">Adresse postale</label>
          <input
            type="text"
            id="street"
            value={formData.street || ''}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder="Adresse postale (optionnel)"
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="zip_code">Code postal</label>
            <input
              type="text"
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              required
              className={errors.zip_code ? 'error' : ''}
              placeholder="Code postal"
            />
            {renderError('zip_code')}
          </div>
          
          <div className="form-field">
            <label htmlFor="city">Ville</label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
              className={errors.city ? 'error' : ''}
              placeholder="Ville"
            />
            {renderError('city')}
          </div>
        </div>
      </section>

      {/* 📸 Section Photos WordPress (5 photos) */}
      <section className="form-section">
        <h3>Photos de profil</h3>
        <p className="section-description">Téléchargez jusqu'à 5 photos professionnelles (JPG/PNG, max 5MB chacune)</p>
        
        <div className="photos-upload-grid">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="photo-upload-slot">
              <FileUpload
                id={`photo_${index + 1}`}
                label={`Photo ${index + 1}${index === 0 ? ' (principale)' : ''}`}
                accept=".jpg,.jpeg,.png,.webp"
                value={files.photo_files[index]}
                onChange={(file) => handlePhotoChange(index, file)}
                description={index === 0 ? "Photo principale" : "Photo secondaire"}
                maxSize={5}
                required={index === 0} // Seule la première photo est obligatoire
              />
            </div>
          ))}
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
              value={formData.height}
              onChange={(e) => handleChange('height', parseInt(e.target.value) || 170)}
              required
              placeholder="170"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="build">Corpulence</label>
            <select
              id="build"
              value={formData.build}
              onChange={(e) => handleChange('build', e.target.value)}
              required
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
              value={formData.ethnicity}
              onChange={(e) => handleChange('ethnicity', e.target.value)}
              required
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
              value={formData.hair_color}
              onChange={(e) => handleChange('hair_color', e.target.value)}
              required
            >
              <option value="">Sélectionner</option>
              <option value="Blond">Blond</option>
              <option value="Chatain">Chatain clair</option>
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
            value={formData.eye_color}
            onChange={(e) => handleChange('eye_color', e.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            <option value="Bleu">Bleu</option>
            <option value="Vert">Vert</option>
            <option value="Brun">Brun</option>
            <option value="Noisette">Noisette</option>
            <option value="Noir">Bleu-gris</option>
          </select>
        </div>
      </section>

      {/* Langues WordPress détaillées */}
      <section className="form-section">
        <h3>Langues</h3>
        
        <div className="form-field">
          <label htmlFor="native_language">Langue(s) maternelle(s)</label>
          <select
            id="native_language"
            value={formData.native_language}
            onChange={(e) => handleChange('native_language', e.target.value)}
            required
          >
            <option value="">Sélectionner votre langue maternelle</option>
            <option value="Anglais">Anglais</option>
            <option value="Français">Français</option>
            <option value="Néerlandais">Néerlandais</option>
            <option value="Abkhaze">Abkhaze</option>
            <option value="Aceh">Aceh</option>
            <option value="Acoli">Acoli</option>
            <option value="Adangme">Adangme</option>
            <option value="Adyghéen">Adyghéen</option>
            <option value="Afar">Afar</option>
            <option value="Afrihili">Afrihili</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Aghem">Aghem</option>
            <option value="Aïnou">Aïnou</option>
            <option value="Akan">Akan</option>
            <option value="Akkadien">Akkadien</option>
            <option value="Akoose">Akoose</option>
            <option value="Alabama">Alabama</option>
            <option value="Albanais">Albanais</option>
            <option value="Aléoute">Aléoute</option>
            <option value="Allemand">Allemand</option>
            <option value="Allemand autrichien">Allemand autrichien</option>
            <option value="Allemand palatin">Allemand palatin</option>
            <option value="Allemand suisse">Allemand suisse</option>
            <option value="Altaï du Sud">Altaï du Sud</option>
            <option value="Amazighe de l'Atlas central">Amazighe de l'Atlas central</option>
            <option value="Amazighe standard marocain">Amazighe standard marocain</option>
            <option value="Amharique">Amharique</option>
            <option value="Ancien anglais">Ancien anglais</option>
            <option value="Ancien français">Ancien français</option>
            <option value="Ancien haut allemand">Ancien haut allemand</option>
            <option value="Ancien irlandais">Ancien irlandais</option>
            <option value="Angika">Angika</option>
            <option value="Anglais américain">Anglais américain</option>
            <option value="Anglais australien">Anglais australien</option>
            <option value="Anglais britannique">Anglais britannique</option>
            <option value="Anglais canadien">Anglais canadien</option>
            <option value="Ao">Ao</option>
            <option value="Arabe">Arabe</option>
            <option value="Arabe algérien">Arabe algérien</option>
            <option value="Arabe égyptien">Arabe égyptien</option>
            <option value="Arabe marocain">Arabe marocain</option>
            <option value="Arabe najdi">Arabe najdi</option>
            <option value="Arabe standard moderne">Arabe standard moderne</option>
            <option value="Arabe tchadien">Arabe tchadien</option>
            <option value="Arabe tunisien">Arabe tunisien</option>
            <option value="Aragonais">Aragonais</option>
            <option value="Araméen">Araméen</option>
            <option value="Araméen samaritain">Araméen samaritain</option>
            <option value="Araona">Araona</option>
            <option value="Arapaho">Arapaho</option>
            <option value="Arawak">Arawak</option>
            <option value="Arménien">Arménien</option>
            <option value="Assamais">Assamais</option>
            <option value="Assou">Assou</option>
            <option value="Asturien">Asturien</option>
            <option value="Atsam">Atsam</option>
            <option value="Avar">Avar</option>
            <option value="Avestique">Avestique</option>
            <option value="Awadhi">Awadhi</option>
            <option value="Aymara">Aymara</option>
            <option value="Azéri">Azéri</option>
            <option value="Bachkir">Bachkir</option>
            <option value="Badaga">Badaga</option>
            <option value="Bafia">Bafia</option>
            <option value="Bafut">Bafut</option>
            <option value="Bakhtiari">Bakhtiari</option>
            <option value="Balinais">Balinais</option>
            <option value="Baloutchi">Baloutchi</option>
            <option value="Baloutchi occidental">Baloutchi occidental</option>
            <option value="Bambara">Bambara</option>
            <option value="Bamoun">Bamoun</option>
            <option value="Banjar">Banjar</option>
            <option value="Bas-allemand">Bas-allemand</option>
            <option value="Bas-prussien">Bas-prussien</option>
            <option value="Bas-saxon néerlandais">Bas-saxon néerlandais</option>
            <option value="Bas-silésien">Bas-silésien</option>
            <option value="Bas-sorabe">Bas-sorabe</option>
            <option value="Basque">Basque</option>
            <option value="Bassa">Bassa</option>
            <option value="Batak toba">Batak toba</option>
            <option value="Bavarois">Bavarois</option>
            <option value="Bedja">Bedja</option>
            <option value="Bemba">Bemba</option>
            <option value="Béna">Béna</option>
            <option value="Bengali">Bengali</option>
            <option value="Betawi">Betawi</option>
            <option value="Bhojpuri">Bhojpuri</option>
            <option value="Bichelamar">Bichelamar</option>
            <option value="Biélorusse">Biélorusse</option>
            <option value="Bikol">Bikol</option>
            <option value="Bini">Bini</option>
            <option value="Birman">Birman</option>
            <option value="Bishnupriya">Bishnupriya</option>
            <option value="Blin">Blin</option>
            <option value="Bodo">Bodo</option>
            <option value="Bosniaque">Bosniaque</option>
            <option value="Boulou">Boulou</option>
            <option value="Bouriate">Bouriate</option>
            <option value="Brahoui">Brahoui</option>
            <option value="Braj">Braj</option>
            <option value="Breton">Breton</option>
            <option value="Bugi">Bugi</option>
            <option value="Bulgare">Bulgare</option>
            <option value="Caddo">Caddo</option>
            <option value="Caingangue">Caingangue</option>
            <option value="Cantonais">Cantonais</option>
            <option value="Capiznon">Capiznon</option>
            <option value="Capverdien">Capverdien</option>
            <option value="Carélien">Carélien</option>
            <option value="Caribe">Caribe</option>
            <option value="Catalan">Catalan</option>
            <option value="Cayuga">Cayuga</option>
            <option value="Cebuano">Cebuano</option>
            <option value="Chakma">Chakma</option>
            <option value="Chambala">Chambala</option>
            <option value="Chamorro">Chamorro</option>
            <option value="Cherokee">Cherokee</option>
            <option value="Cheyenne">Cheyenne</option>
            <option value="Chibcha">Chibcha</option>
            <option value="Chinois">Chinois</option>
            <option value="Chinois littéraire">Chinois littéraire</option>
            <option value="Chinois simplifié">Chinois simplifié</option>
            <option value="Chinois traditionnel">Chinois traditionnel</option>
            <option value="Chipewyan">Chipewyan</option>
            <option value="Chleuh">Chleuh</option>
            <option value="Choctaw">Choctaw</option>
            <option value="Chuuk">Chuuk</option>
            <option value="Cinghalais">Cinghalais</option>
            <option value="Cisena">Cisena</option>
            <option value="Comorien">Comorien</option>
            <option value="Copte">Copte</option>
            <option value="Coréen">Coréen</option>
            <option value="Cornique">Cornique</option>
            <option value="Corse">Corse</option>
            <option value="Cree">Cree</option>
            <option value="Creek">Creek</option>
            <option value="Créole haïtien">Créole haïtien</option>
            <option value="Créole jamaïcain">Créole jamaïcain</option>
            <option value="Créole louisianais">Créole louisianais</option>
            <option value="Créole mauricien">Créole mauricien</option>
            <option value="Créole seychellois">Créole seychellois</option>
            <option value="Croate">Croate</option>
            <option value="Dakota">Dakota</option>
            <option value="Danois">Danois</option>
            <option value="Dargwa">Dargwa</option>
            <option value="Dari">Dari</option>
            <option value="Dari zoroastrien">Dari zoroastrien</option>
            <option value="Dazaga">Dazaga</option>
            <option value="Delaware">Delaware</option>
            <option value="Dinka">Dinka</option>
            <option value="Diola-fogny">Diola-fogny</option>
            <option value="Dioula">Dioula</option>
            <option value="Dogri">Dogri</option>
            <option value="Dogrib">Dogrib</option>
            <option value="Douala">Douala</option>
            <option value="Dusun central">Dusun central</option>
            <option value="Dzongkha">Dzongkha</option>
            <option value="Écossais">Écossais</option>
            <option value="Éfik">Éfik</option>
            <option value="Égyptien ancien">Égyptien ancien</option>
            <option value="Ékadjouk">Ékadjouk</option>
            <option value="Élamite">Élamite</option>
            <option value="Embou">Embou</option>
            <option value="Émilien">Émilien</option>
            <option value="Erzya">Erzya</option>
            <option value="Esclave">Esclave</option>
            <option value="Espagnol">Espagnol</option>
            <option value="Espéranto">Espéranto</option>
            <option value="Estonien">Estonien</option>
            <option value="Estrémègne">Estrémègne</option>
            <option value="European Spanish">European Spanish</option>
            <option value="Éwé">Éwé</option>
            <option value="Éwondo">Éwondo</option>
            <option value="Fang">Fang</option>
            <option value="Fanti">Fanti</option>
            <option value="Féroïen">Féroïen</option>
            <option value="Fidjien">Fidjien</option>
            <option value="Filipino">Filipino</option>
            <option value="Finnois">Finnois</option>
            <option value="Finnois tornédalien">Finnois tornédalien</option>
            <option value="Flamand">Flamand</option>
            <option value="Flamand occidental">Flamand occidental</option>
            <option value="Fon">Fon</option>
            <option value="Français cadien">Français cadien</option>
            <option value="Français canadien">Français canadien</option>
            <option value="Français suisse">Français suisse</option>
            <option value="Francique ripuaire">Francique ripuaire</option>
            <option value="Franconien du Main">Franconien du Main</option>
            <option value="Francoprovençal">Francoprovençal</option>
            <option value="Frioulan">Frioulan</option>
            <option value="Frison du Nord">Frison du Nord</option>
            <option value="Frison occidental">Frison occidental</option>
            <option value="Frison oriental">Frison oriental</option>
            <option value="Ga">Ga</option>
            <option value="Gaélique écossais">Gaélique écossais</option>
            <option value="Gagaouze">Gagaouze</option>
            <option value="Galicien">Galicien</option>
            <option value="Gallois">Gallois</option>
            <option value="Gan">Gan</option>
            <option value="Ganda">Ganda</option>
            <option value="Gayo">Gayo</option>
            <option value="Gbaya">Gbaya</option>
            <option value="Géorgien">Géorgien</option>
            <option value="Ghomala">Ghomala</option>
            <option value="Gilaki">Gilaki</option>
            <option value="Gilbertin">Gilbertin</option>
            <option value="Gondi">Gondi</option>
            <option value="Gorontalo">Gorontalo</option>
            <option value="Gothique">Gothique</option>
            <option value="Goudjerati">Goudjerati</option>
            <option value="Grebo">Grebo</option>
            <option value="Grec">Grec</option>
            <option value="Grec ancien">Grec ancien</option>
            <option value="Groenlandais">Groenlandais</option>
            <option value="Guarani">Guarani</option>
            <option value="Guègue">Guègue</option>
            <option value="Guèze">Guèze</option>
            <option value="Gurenne">Gurenne</option>
            <option value="Gusii">Gusii</option>
            <option value="Gwichʼin">Gwichʼin</option>
            <option value="Haida">Haida</option>
            <option value="Hakka">Hakka</option>
            <option value="Haoussa">Haoussa</option>
            <option value="Haut-sorabe">Haut-sorabe</option>
            <option value="Hawaien">Hawaien</option>
            <option value="Hébreu">Hébreu</option>
            <option value="Héréro">Héréro</option>
            <option value="Hiligaynon">Hiligaynon</option>
            <option value="Hindi">Hindi</option>
            <option value="Hindi fidjien">Hindi fidjien</option>
            <option value="Hiri motu">Hiri motu</option>
            <option value="Hittite">Hittite</option>
            <option value="Hmong">Hmong</option>
            <option value="Hongrois">Hongrois</option>
            <option value="Hupa">Hupa</option>
            <option value="Iakoute">Iakoute</option>
            <option value="Iban">Iban</option>
            <option value="Ibibio">Ibibio</option>
            <option value="Ido">Ido</option>
            <option value="Igbo">Igbo</option>
            <option value="Ilokano">Ilokano</option>
            <option value="Indonésien">Indonésien</option>
            <option value="Ingouche">Ingouche</option>
            <option value="Ingrien">Ingrien</option>
            <option value="Interlingua">Interlingua</option>
            <option value="Interlingue">Interlingue</option>
            <option value="Inuktitut">Inuktitut</option>
            <option value="Inupiaq">Inupiaq</option>
            <option value="Irlandais">Irlandais</option>
            <option value="Islandais">Islandais</option>
            <option value="Italien">Italien</option>
            <option value="Japonais">Japonais</option>
            <option value="Jargon chinook">Jargon chinook</option>
            <option value="Javanais">Javanais</option>
            <option value="Jju">Jju</option>
            <option value="Judéo-arabe">Judéo-arabe</option>
            <option value="Judéo-persan">Judéo-persan</option>
            <option value="Jute">Jute</option>
            <option value="K'iche'">K'iche'</option>
            <option value="Kabardin">Kabardin</option>
            <option value="Kabyle">Kabyle</option>
            <option value="Kachin">Kachin</option>
            <option value="Kachoube">Kachoube</option>
            <option value="Kako">Kako</option>
            <option value="Kalendjin">Kalendjin</option>
            <option value="Kalmouk">Kalmouk</option>
            <option value="Kamba">Kamba</option>
            <option value="Kanembou">Kanembou</option>
            <option value="Kannada">Kannada</option>
            <option value="Kanouri">Kanouri</option>
            <option value="Karakalpak">Karakalpak</option>
            <option value="Karatchaï balkar">Karatchaï balkar</option>
            <option value="Kashmiri">Kashmiri</option>
            <option value="Kawi">Kawi</option>
            <option value="Kazakh">Kazakh</option>
            <option value="Kényang">Kényang</option>
            <option value="Khasi">Khasi</option>
            <option value="Khmer">Khmer</option>
            <option value="Khotanais">Khotanais</option>
            <option value="Khowar">Khowar</option>
            <option value="Kiga">Kiga</option>
            <option value="Kikuyu">Kikuyu</option>
            <option value="Kimboundou">Kimboundou</option>
            <option value="Kinaray-a">Kinaray-a</option>
            <option value="Kirghize">Kirghize</option>
            <option value="Kirmanjki">Kirmanjki</option>
            <option value="Klingon">Klingon</option>
            <option value="Kom">Kom</option>
            <option value="Komi">Komi</option>
            <option value="Komi-permiak">Komi-permiak</option>
            <option value="Kongo">Kongo</option>
            <option value="Konkani">Konkani</option>
            <option value="Konkani de Goa">Konkani de Goa</option>
            <option value="Koro">Koro</option>
            <option value="Kosraéen">Kosraéen</option>
            <option value="Kotava">Kotava</option>
            <option value="Kouanyama">Kouanyama</option>
            <option value="Koumyk">Koumyk</option>
            <option value="Kourroukh">Kourroukh</option>
            <option value="Koyra chiini">Koyra chiini</option>
            <option value="Koyraboro senni">Koyraboro senni</option>
            <option value="Kpellé">Kpellé</option>
            <option value="Krio">Krio</option>
            <option value="Kurde">Kurde</option>
            <option value="Kurde du Sud">Kurde du Sud</option>
            <option value="Kutenai">Kutenai</option>
            <option value="Kwasio">Kwasio</option>
            <option value="Ladino">Ladino</option>
            <option value="Lahnda">Lahnda</option>
            <option value="Lakota">Lakota</option>
            <option value="Lamba">Lamba</option>
            <option value="Langi">Langi</option>
            <option value="Langue des signes américaine">Langue des signes américaine</option>
            <option value="Langue indéterminée">Langue indéterminée</option>
            <option value="Lao">Lao</option>
            <option value="Latgalien">Latgalien</option>
            <option value="Latin">Latin</option>
            <option value="Latin American Spanish">Latin American Spanish</option>
            <option value="Laze">Laze</option>
            <option value="Letton">Letton</option>
            <option value="Lezghien">Lezghien</option>
            <option value="Ligure">Ligure</option>
            <option value="Limbourgeois">Limbourgeois</option>
            <option value="Lingala">Lingala</option>
            <option value="Lingua franca nova">Lingua franca nova</option>
            <option value="Lituanien">Lituanien</option>
            <option value="Livonien">Livonien</option>
            <option value="Lojban">Lojban</option>
            <option value="Lombard">Lombard</option>
            <option value="Lori du Nord">Lori du Nord</option>
            <option value="Lozi">Lozi</option>
            <option value="Luba-katanga">Luba-katanga</option>
            <option value="Luba-lulua">Luba-lulua</option>
            <option value="Luhya">Luhya</option>
            <option value="Luiseño">Luiseño</option>
            <option value="Lunda">Lunda</option>
            <option value="Luo">Luo</option>
            <option value="Lushaï">Lushaï</option>
            <option value="Luxembourgeois">Luxembourgeois</option>
            <option value="Maba">Maba</option>
            <option value="Macédonien">Macédonien</option>
            <option value="Madouraï">Madouraï</option>
            <option value="Mafa">Mafa</option>
            <option value="Magahi">Magahi</option>
            <option value="Maithili">Maithili</option>
            <option value="Makassar">Makassar</option>
            <option value="Makhuwa-meetto">Makhuwa-meetto</option>
            <option value="Makondé">Makondé</option>
            <option value="Malais">Malais</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Maldivien">Maldivien</option>
            <option value="Malgache">Malgache</option>
            <option value="Maltais">Maltais</option>
            <option value="Mandan">Mandan</option>
            <option value="Mandchou">Mandchou</option>
            <option value="Mandingue">Mandingue</option>
            <option value="Manipuri">Manipuri</option>
            <option value="Mannois">Mannois</option>
            <option value="Maori">Maori</option>
            <option value="Mapuche">Mapuche</option>
            <option value="Marathe">Marathe</option>
            <option value="Mari">Mari</option>
            <option value="Mari occidental">Mari occidental</option>
            <option value="Marshallais">Marshallais</option>
            <option value="Marwarî">Marwarî</option>
            <option value="Massaï">Massaï</option>
            <option value="Matchamé">Matchamé</option>
            <option value="Mazandérani">Mazandérani</option>
            <option value="Médumba">Médumba</option>
            <option value="Mendé">Mendé</option>
            <option value="Mentawaï">Mentawaï</option>
            <option value="Mérou">Mérou</option>
            <option value="Méta'">Méta'</option>
            <option value="Mexican Spanish">Mexican Spanish</option>
            <option value="Micmac">Micmac</option>
            <option value="Minangkabau">Minangkabau</option>
            <option value="Mingrélien">Mingrélien</option>
            <option value="Minnan">Minnan</option>
            <option value="Mirandais">Mirandais</option>
            <option value="Mohawk">Mohawk</option>
            <option value="Moksa">Moksa</option>
            <option value="Moldave">Moldave</option>
            <option value="Mongo">Mongo</option>
            <option value="Mongol">Mongol</option>
            <option value="Monténégrin">Monténégrin</option>
            <option value="Moré">Moré</option>
            <option value="Moundang">Moundang</option>
            <option value="Moyen anglais">Moyen anglais</option>
            <option value="Moyen français">Moyen français</option>
            <option value="Moyen haut-allemand">Moyen haut-allemand</option>
            <option value="Moyen irlandais">Moyen irlandais</option>
            <option value="Moyen néerlandais">Moyen néerlandais</option>
            <option value="Multilingue">Multilingue</option>
            <option value="Myènè">Myènè</option>
            <option value="N'ko">N'ko</option>
            <option value="Nama">Nama</option>
            <option value="Napolitain">Napolitain</option>
            <option value="Nauruan">Nauruan</option>
            <option value="Navaho">Navaho</option>
            <option value="Ndébélé du Nord">Ndébélé du Nord</option>
            <option value="Ndébélé du Sud">Ndébélé du Sud</option>
            <option value="Ndonga">Ndonga</option>
            <option value="Népalais">Népalais</option>
            <option value="Newari">Newari</option>
            <option value="Newarî classique">Newarî classique</option>
            <option value="Ngambay">Ngambay</option>
            <option value="Ngiemboon">Ngiemboon</option>
            <option value="Ngomba">Ngomba</option>
            <option value="Nheengatu">Nheengatu</option>
            <option value="Nias">Nias</option>
            <option value="Niuéen">Niuéen</option>
            <option value="Nogaï">Nogaï</option>
            <option value="Norvégien">Norvégien</option>
            <option value="Norvégien bokmål">Norvégien bokmål</option>
            <option value="Norvégien nynorsk">Norvégien nynorsk</option>
            <option value="Novial">Novial</option>
            <option value="Nuer">Nuer</option>
            <option value="Nyamwezi">Nyamwezi</option>
            <option value="Nyanja">Nyanja</option>
            <option value="Nyankolé">Nyankolé</option>
            <option value="Nyoro">Nyoro</option>
            <option value="Nzema">Nzema</option>
            <option value="Occitan">Occitan</option>
            <option value="Ojibwa">Ojibwa</option>
            <option value="Oriya">Oriya</option>
            <option value="Oromo">Oromo</option>
            <option value="Osage">Osage</option>
            <option value="Ossète">Ossète</option>
            <option value="Oudmourte">Oudmourte</option>
            <option value="Ougaritique">Ougaritique</option>
            <option value="Ouïghour">Ouïghour</option>
            <option value="Oumboundou">Oumboundou</option>
            <option value="Ourdou">Ourdou</option>
            <option value="Ouzbek">Ouzbek</option>
            <option value="Pachto">Pachto</option>
            <option value="Pahlavi">Pahlavi</option>
            <option value="Palau">Palau</option>
            <option value="Pali">Pali</option>
            <option value="Pampangan">Pampangan</option>
            <option value="Pangasinan">Pangasinan</option>
            <option value="Papiamento">Papiamento</option>
            <option value="Pendjabi">Pendjabi</option>
            <option value="Pennsilvänisch">Pennsilvänisch</option>
            <option value="Persan">Persan</option>
            <option value="Persan ancien">Persan ancien</option>
            <option value="Peul">Peul</option>
            <option value="Phénicien">Phénicien</option>
            <option value="Picard">Picard</option>
            <option value="Pidgin nigérian">Pidgin nigérian</option>
            <option value="Piémontais">Piémontais</option>
            <option value="Pohnpei">Pohnpei</option>
            <option value="Polonais">Polonais</option>
            <option value="Pontique">Pontique</option>
            <option value="Portugais">Portugais</option>
            <option value="Portugais brésilien">Portugais brésilien</option>
            <option value="Portugais européen">Portugais européen</option>
            <option value="Provençal ancien">Provençal ancien</option>
            <option value="Prussien">Prussien</option>
            <option value="Quechua">Quechua</option>
            <option value="Quichua du Haut-Chimborazo">Quichua du Haut-Chimborazo</option>
            <option value="Racine">Racine</option>
            <option value="Rajasthani">Rajasthani</option>
            <option value="Rapanui">Rapanui</option>
            <option value="Rarotongien">Rarotongien</option>
            <option value="Rifain">Rifain</option>
            <option value="Romagnol">Romagnol</option>
            <option value="Romanche">Romanche</option>
            <option value="Romani">Romani</option>
            <option value="Rombo">Rombo</option>
            <option value="Rotuman">Rotuman</option>
            <option value="Roumain">Roumain</option>
            <option value="Roundi">Roundi</option>
            <option value="Roviana">Roviana</option>
            <option value="Russe">Russe</option>
            <option value="Ruthène">Ruthène</option>
            <option value="Rwa">Rwa</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Saho">Saho</option>
            <option value="Sambourou">Sambourou</option>
            <option value="Sami d'Inari">Sami d'Inari</option>
            <option value="Sami de Lule">Sami de Lule</option>
            <option value="Sami du Nord">Sami du Nord</option>
            <option value="Sami du Sud">Sami du Sud</option>
            <option value="Sami skolt">Sami skolt</option>
            <option value="Samoan">Samoan</option>
            <option value="Samogitien">Samogitien</option>
            <option value="Sandawe">Sandawe</option>
            <option value="Sangho">Sangho</option>
            <option value="Sangu">Sangu</option>
            <option value="Sans contenu linguistique">Sans contenu linguistique</option>
            <option value="Sanskrit">Sanskrit</option>
            <option value="Santal">Santal</option>
            <option value="Sarde">Sarde</option>
            <option value="Sarde sassarais">Sarde sassarais</option>
            <option value="Sasak">Sasak</option>
            <option value="Saterlandais">Saterlandais</option>
            <option value="Saurashtra">Saurashtra</option>
            <option value="Sélayar">Sélayar</option>
            <option value="Selkoupe">Selkoupe</option>
            <option value="Seneca">Seneca</option>
            <option value="Serbe">Serbe</option>
            <option value="Serbo-croate">Serbo-croate</option>
            <option value="Sérèr">Sérèr</option>
            <option value="Séri">Séri</option>
            <option value="Shan">Shan</option>
            <option value="Shona">Shona</option>
            <option value="Sicilien">Sicilien</option>
            <option value="Sidamo">Sidamo</option>
            <option value="Siksika">Siksika</option>
            <option value="Silésien">Silésien</option>
            <option value="Sindhi">Sindhi</option>
            <option value="Slavon d'église">Slavon d'église</option>
            <option value="Slovaque">Slovaque</option>
            <option value="Slovène">Slovène</option>
            <option value="Soga">Soga</option>
            <option value="Sogdien">Sogdien</option>
            <option value="Somali">Somali</option>
            <option value="Soninké">Soninké</option>
            <option value="Sorani">Sorani</option>
            <option value="Sotho du Nord">Sotho du Nord</option>
            <option value="Sotho du Sud">Sotho du Sud</option>
            <option value="Soukouma">Soukouma</option>
            <option value="Soundanais">Soundanais</option>
            <option value="Soussou">Soussou</option>
            <option value="Sranan tongo">Sranan tongo</option>
            <option value="Suédois">Suédois</option>
            <option value="Suisse allemand">Suisse allemand</option>
            <option value="Sumérien">Sumérien</option>
            <option value="Swahili">Swahili</option>
            <option value="Swahili du Congo">Swahili du Congo</option>
            <option value="Swati">Swati</option>
            <option value="Symboles Bliss">Symboles Bliss</option>
            <option value="Syriaque">Syriaque</option>
            <option value="Syriaque classique">Syriaque classique</option>
            <option value="Tadjik">Tadjik</option>
            <option value="Tagalog">Tagalog</option>
            <option value="Tahitien">Tahitien</option>
            <option value="Taita">Taita</option>
            <option value="Talysh">Talysh</option>
            <option value="Tamacheq">Tamacheq</option>
            <option value="Tamoul">Tamoul</option>
            <option value="Taroko">Taroko</option>
            <option value="Tasawaq">Tasawaq</option>
            <option value="Tatar">Tatar</option>
            <option value="Tati caucasien">Tati caucasien</option>
            <option value="Tchaghataï">Tchaghataï</option>
            <option value="Tchèque">Tchèque</option>
            <option value="Tchétchène">Tchétchène</option>
            <option value="Tchouvache">Tchouvache</option>
            <option value="Télougou">Télougou</option>
            <option value="Temne">Temne</option>
            <option value="Tereno">Tereno</option>
            <option value="Teso">Teso</option>
            <option value="Tetum">Tetum</option>
            <option value="Thaï">Thaï</option>
            <option value="Tibétain">Tibétain</option>
            <option value="Tigré">Tigré</option>
            <option value="Tigrigna">Tigrigna</option>
            <option value="Tiv">Tiv</option>
            <option value="Tlingit">Tlingit</option>
            <option value="Tok pisin">Tok pisin</option>
            <option value="Tokelau">Tokelau</option>
            <option value="Tonga nyasa">Tonga nyasa</option>
            <option value="Tonguien">Tonguien</option>
            <option value="Toulou">Toulou</option>
            <option value="Toumbouka">Toumbouka</option>
            <option value="Touroyc">Touroyc</option>
            <option value="Touvain">Touvain</option>
            <option value="Tsakhour">Tsakhour</option>
            <option value="Tsakonien">Tsakonien</option>
            <option value="Tsimshian">Tsimshian</option>
            <option value="Tsonga">Tsonga</option>
            <option value="Tswana">Tswana</option>
            <option value="Turc">Turc</option>
            <option value="Turc de Crimée">Turc de Crimée</option>
            <option value="Turc ottoman">Turc ottoman</option>
            <option value="Turkmène">Turkmène</option>
            <option value="Tuvalu">Tuvalu</option>
            <option value="Twi">Twi</option>
            <option value="Tyap">Tyap</option>
            <option value="Ukrainien">Ukrainien</option>
            <option value="Vaï">Vaï</option>
            <option value="Valaque">Valaque</option>
            <option value="Venda">Venda</option>
            <option value="Vénitien">Vénitien</option>
            <option value="Vepse">Vepse</option>
            <option value="Vietnamien">Vietnamien</option>
            <option value="Vieux norrois">Vieux norrois</option>
            <option value="Volapük">Volapük</option>
            <option value="Võro">Võro</option>
            <option value="Vote">Vote</option>
            <option value="Vunjo">Vunjo</option>
            <option value="Walamo">Walamo</option>
            <option value="Wallon">Wallon</option>
            <option value="Walser">Walser</option>
            <option value="Waray">Waray</option>
            <option value="Warlpiri">Warlpiri</option>
            <option value="Washo">Washo</option>
            <option value="Wayuu">Wayuu</option>
            <option value="Wolof">Wolof</option>
            <option value="Wu">Wu</option>
            <option value="Xhosa">Xhosa</option>
            <option value="Xiang">Xiang</option>
            <option value="Yangben">Yangben</option>
            <option value="Yao">Yao</option>
            <option value="Yapois">Yapois</option>
            <option value="Yemba">Yemba</option>
            <option value="Yi du Sichuan">Yi du Sichuan</option>
            <option value="Yiddish">Yiddish</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Youpik central">Youpik central</option>
            <option value="Zapotèque">Zapotèque</option>
            <option value="Zarma">Zarma</option>
            <option value="Zazaki">Zazaki</option>
            <option value="Zélandais">Zélandais</option>
            <option value="Zenaga">Zenaga</option>
            <option value="Zhuang">Zhuang</option>
            <option value="Zoulou">Zoulou</option>
            <option value="Zuñi">Zuñi</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="languages_fluent_select">Langues parlées couramment</label>
          <select
            id="languages_fluent_select"
            value=""
            onChange={(e) => {
              if (e.target.value && !(formData.languages_fluent || []).includes(e.target.value)) {
                handleChange('languages_fluent', [...(formData.languages_fluent || []), e.target.value])
              }
            }}
          >
            <option value="">Ajouter une langue parlée couramment</option>
            <option value="Anglais">Anglais</option>
            <option value="Français">Français</option>
            <option value="Néerlandais">Néerlandais</option>
            <option value="Abkhaze">Abkhaze</option>
            <option value="Aceh">Aceh</option>
            <option value="Acoli">Acoli</option>
            <option value="Adangme">Adangme</option>
            <option value="Adyghéen">Adyghéen</option>
            <option value="Afar">Afar</option>
            <option value="Afrihili">Afrihili</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Aghem">Aghem</option>
            <option value="Aïnou">Aïnou</option>
            <option value="Akan">Akan</option>
            <option value="Akkadien">Akkadien</option>
            <option value="Akoose">Akoose</option>
            <option value="Alabama">Alabama</option>
            <option value="Albanais">Albanais</option>
            <option value="Aléoute">Aléoute</option>
            <option value="Allemand">Allemand</option>
            <option value="Allemand autrichien">Allemand autrichien</option>
            <option value="Allemand palatin">Allemand palatin</option>
            <option value="Allemand suisse">Allemand suisse</option>
            <option value="Altaï du Sud">Altaï du Sud</option>
            <option value="Amazighe de l'Atlas central">Amazighe de l'Atlas central</option>
            <option value="Amazighe standard marocain">Amazighe standard marocain</option>
            <option value="Amharique">Amharique</option>
            <option value="Ancien anglais">Ancien anglais</option>
            <option value="Ancien français">Ancien français</option>
            <option value="Ancien haut allemand">Ancien haut allemand</option>
            <option value="Ancien irlandais">Ancien irlandais</option>
            <option value="Angika">Angika</option>
            <option value="Anglais américain">Anglais américain</option>
            <option value="Anglais australien">Anglais australien</option>
            <option value="Anglais britannique">Anglais britannique</option>
            <option value="Anglais canadien">Anglais canadien</option>
            <option value="Ao">Ao</option>
            <option value="Arabe">Arabe</option>
            <option value="Arabe algérien">Arabe algérien</option>
            <option value="Arabe égyptien">Arabe égyptien</option>
            <option value="Arabe marocain">Arabe marocain</option>
            <option value="Arabe najdi">Arabe najdi</option>
            <option value="Arabe standard moderne">Arabe standard moderne</option>
            <option value="Arabe tchadien">Arabe tchadien</option>
            <option value="Arabe tunisien">Arabe tunisien</option>
            <option value="Aragonais">Aragonais</option>
            <option value="Araméen">Araméen</option>
            <option value="Araméen samaritain">Araméen samaritain</option>
            <option value="Araona">Araona</option>
            <option value="Arapaho">Arapaho</option>
            <option value="Arawak">Arawak</option>
            <option value="Arménien">Arménien</option>
            <option value="Assamais">Assamais</option>
            <option value="Assou">Assou</option>
            <option value="Asturien">Asturien</option>
            <option value="Atsam">Atsam</option>
            <option value="Avar">Avar</option>
            <option value="Avestique">Avestique</option>
            <option value="Awadhi">Awadhi</option>
            <option value="Aymara">Aymara</option>
            <option value="Azéri">Azéri</option>
            <option value="Bachkir">Bachkir</option>
            <option value="Badaga">Badaga</option>
            <option value="Bafia">Bafia</option>
            <option value="Bafut">Bafut</option>
            <option value="Bakhtiari">Bakhtiari</option>
            <option value="Balinais">Balinais</option>
            <option value="Baloutchi">Baloutchi</option>
            <option value="Baloutchi occidental">Baloutchi occidental</option>
            <option value="Bambara">Bambara</option>
            <option value="Bamoun">Bamoun</option>
            <option value="Banjar">Banjar</option>
            <option value="Bas-allemand">Bas-allemand</option>
            <option value="Bas-prussien">Bas-prussien</option>
            <option value="Bas-saxon néerlandais">Bas-saxon néerlandais</option>
            <option value="Bas-silésien">Bas-silésien</option>
            <option value="Bas-sorabe">Bas-sorabe</option>
            <option value="Basque">Basque</option>
            <option value="Bassa">Bassa</option>
            <option value="Batak toba">Batak toba</option>
            <option value="Bavarois">Bavarois</option>
            <option value="Bedja">Bedja</option>
            <option value="Bemba">Bemba</option>
            <option value="Béna">Béna</option>
            <option value="Bengali">Bengali</option>
            <option value="Betawi">Betawi</option>
            <option value="Bhojpuri">Bhojpuri</option>
            <option value="Bichelamar">Bichelamar</option>
            <option value="Biélorusse">Biélorusse</option>
            <option value="Bikol">Bikol</option>
            <option value="Bini">Bini</option>
            <option value="Birman">Birman</option>
            <option value="Bishnupriya">Bishnupriya</option>
            <option value="Blin">Blin</option>
            <option value="Bodo">Bodo</option>
            <option value="Bosniaque">Bosniaque</option>
            <option value="Boulou">Boulou</option>
            <option value="Bouriate">Bouriate</option>
            <option value="Brahoui">Brahoui</option>
            <option value="Braj">Braj</option>
            <option value="Breton">Breton</option>
            <option value="Bugi">Bugi</option>
            <option value="Bulgare">Bulgare</option>
            <option value="Caddo">Caddo</option>
            <option value="Caingangue">Caingangue</option>
            <option value="Cantonais">Cantonais</option>
            <option value="Capiznon">Capiznon</option>
            <option value="Capverdien">Capverdien</option>
            <option value="Carélien">Carélien</option>
            <option value="Caribe">Caribe</option>
            <option value="Catalan">Catalan</option>
            <option value="Cayuga">Cayuga</option>
            <option value="Cebuano">Cebuano</option>
            <option value="Chakma">Chakma</option>
            <option value="Chambala">Chambala</option>
            <option value="Chamorro">Chamorro</option>
            <option value="Cherokee">Cherokee</option>
            <option value="Cheyenne">Cheyenne</option>
            <option value="Chibcha">Chibcha</option>
            <option value="Chinois">Chinois</option>
            <option value="Chinois littéraire">Chinois littéraire</option>
            <option value="Chinois simplifié">Chinois simplifié</option>
            <option value="Chinois traditionnel">Chinois traditionnel</option>
            <option value="Chipewyan">Chipewyan</option>
            <option value="Chleuh">Chleuh</option>
            <option value="Choctaw">Choctaw</option>
            <option value="Chuuk">Chuuk</option>
            <option value="Cinghalais">Cinghalais</option>
            <option value="Cisena">Cisena</option>
            <option value="Comorien">Comorien</option>
            <option value="Copte">Copte</option>
            <option value="Coréen">Coréen</option>
            <option value="Cornique">Cornique</option>
            <option value="Corse">Corse</option>
            <option value="Cree">Cree</option>
            <option value="Creek">Creek</option>
            <option value="Créole haïtien">Créole haïtien</option>
            <option value="Créole jamaïcain">Créole jamaïcain</option>
            <option value="Créole louisianais">Créole louisianais</option>
            <option value="Créole mauricien">Créole mauricien</option>
            <option value="Créole seychellois">Créole seychellois</option>
            <option value="Croate">Croate</option>
            <option value="Dakota">Dakota</option>
            <option value="Danois">Danois</option>
            <option value="Dargwa">Dargwa</option>
            <option value="Dari">Dari</option>
            <option value="Dari zoroastrien">Dari zoroastrien</option>
            <option value="Dazaga">Dazaga</option>
            <option value="Delaware">Delaware</option>
            <option value="Dinka">Dinka</option>
            <option value="Diola-fogny">Diola-fogny</option>
            <option value="Dioula">Dioula</option>
            <option value="Dogri">Dogri</option>
            <option value="Dogrib">Dogrib</option>
            <option value="Douala">Douala</option>
            <option value="Dusun central">Dusun central</option>
            <option value="Dzongkha">Dzongkha</option>
            <option value="Écossais">Écossais</option>
            <option value="Éfik">Éfik</option>
            <option value="Égyptien ancien">Égyptien ancien</option>
            <option value="Ékadjouk">Ékadjouk</option>
            <option value="Élamite">Élamite</option>
            <option value="Embou">Embou</option>
            <option value="Émilien">Émilien</option>
            <option value="Erzya">Erzya</option>
            <option value="Esclave">Esclave</option>
            <option value="Espagnol">Espagnol</option>
            <option value="Espéranto">Espéranto</option>
            <option value="Estonien">Estonien</option>
            <option value="Estrémègne">Estrémègne</option>
            <option value="European Spanish">European Spanish</option>
            <option value="Éwé">Éwé</option>
            <option value="Éwondo">Éwondo</option>
            <option value="Fang">Fang</option>
            <option value="Fanti">Fanti</option>
            <option value="Féroïen">Féroïen</option>
            <option value="Fidjien">Fidjien</option>
            <option value="Filipino">Filipino</option>
            <option value="Finnois">Finnois</option>
            <option value="Finnois tornédalien">Finnois tornédalien</option>
            <option value="Flamand">Flamand</option>
            <option value="Flamand occidental">Flamand occidental</option>
            <option value="Fon">Fon</option>
            <option value="Français cadien">Français cadien</option>
            <option value="Français canadien">Français canadien</option>
            <option value="Français suisse">Français suisse</option>
            <option value="Francique ripuaire">Francique ripuaire</option>
            <option value="Franconien du Main">Franconien du Main</option>
            <option value="Francoprovençal">Francoprovençal</option>
            <option value="Frioulan">Frioulan</option>
            <option value="Frison du Nord">Frison du Nord</option>
            <option value="Frison occidental">Frison occidental</option>
            <option value="Frison oriental">Frison oriental</option>
            <option value="Ga">Ga</option>
            <option value="Gaélique écossais">Gaélique écossais</option>
            <option value="Gagaouze">Gagaouze</option>
            <option value="Galicien">Galicien</option>
            <option value="Gallois">Gallois</option>
            <option value="Gan">Gan</option>
            <option value="Ganda">Ganda</option>
            <option value="Gayo">Gayo</option>
            <option value="Gbaya">Gbaya</option>
            <option value="Géorgien">Géorgien</option>
            <option value="Ghomala">Ghomala</option>
            <option value="Gilaki">Gilaki</option>
            <option value="Gilbertin">Gilbertin</option>
            <option value="Gondi">Gondi</option>
            <option value="Gorontalo">Gorontalo</option>
            <option value="Gothique">Gothique</option>
            <option value="Goudjerati">Goudjerati</option>
            <option value="Grebo">Grebo</option>
            <option value="Grec">Grec</option>
            <option value="Grec ancien">Grec ancien</option>
            <option value="Groenlandais">Groenlandais</option>
            <option value="Guarani">Guarani</option>
            <option value="Guègue">Guègue</option>
            <option value="Guèze">Guèze</option>
            <option value="Gurenne">Gurenne</option>
            <option value="Gusii">Gusii</option>
            <option value="Gwichʼin">Gwichʼin</option>
            <option value="Haida">Haida</option>
            <option value="Hakka">Hakka</option>
            <option value="Haoussa">Haoussa</option>
            <option value="Haut-sorabe">Haut-sorabe</option>
            <option value="Hawaien">Hawaien</option>
            <option value="Hébreu">Hébreu</option>
            <option value="Héréro">Héréro</option>
            <option value="Hiligaynon">Hiligaynon</option>
            <option value="Hindi">Hindi</option>
            <option value="Hindi fidjien">Hindi fidjien</option>
            <option value="Hiri motu">Hiri motu</option>
            <option value="Hittite">Hittite</option>
            <option value="Hmong">Hmong</option>
            <option value="Hongrois">Hongrois</option>
            <option value="Hupa">Hupa</option>
            <option value="Iakoute">Iakoute</option>
            <option value="Iban">Iban</option>
            <option value="Ibibio">Ibibio</option>
            <option value="Ido">Ido</option>
            <option value="Igbo">Igbo</option>
            <option value="Ilokano">Ilokano</option>
            <option value="Indonésien">Indonésien</option>
            <option value="Ingouche">Ingouche</option>
            <option value="Ingrien">Ingrien</option>
            <option value="Interlingua">Interlingua</option>
            <option value="Interlingue">Interlingue</option>
            <option value="Inuktitut">Inuktitut</option>
            <option value="Inupiaq">Inupiaq</option>
            <option value="Irlandais">Irlandais</option>
            <option value="Islandais">Islandais</option>
            <option value="Italien">Italien</option>
            <option value="Japonais">Japonais</option>
            <option value="Jargon chinook">Jargon chinook</option>
            <option value="Javanais">Javanais</option>
            <option value="Jju">Jju</option>
            <option value="Judéo-arabe">Judéo-arabe</option>
            <option value="Judéo-persan">Judéo-persan</option>
            <option value="Jute">Jute</option>
            <option value="K'iche'">K'iche'</option>
            <option value="Kabardin">Kabardin</option>
            <option value="Kabyle">Kabyle</option>
            <option value="Kachin">Kachin</option>
            <option value="Kachoube">Kachoube</option>
            <option value="Kako">Kako</option>
            <option value="Kalendjin">Kalendjin</option>
            <option value="Kalmouk">Kalmouk</option>
            <option value="Kamba">Kamba</option>
            <option value="Kanembou">Kanembou</option>
            <option value="Kannada">Kannada</option>
            <option value="Kanouri">Kanouri</option>
            <option value="Karakalpak">Karakalpak</option>
            <option value="Karatchaï balkar">Karatchaï balkar</option>
            <option value="Kashmiri">Kashmiri</option>
            <option value="Kawi">Kawi</option>
            <option value="Kazakh">Kazakh</option>
            <option value="Kényang">Kényang</option>
            <option value="Khasi">Khasi</option>
            <option value="Khmer">Khmer</option>
            <option value="Khotanais">Khotanais</option>
            <option value="Khowar">Khowar</option>
            <option value="Kiga">Kiga</option>
            <option value="Kikuyu">Kikuyu</option>
            <option value="Kimboundou">Kimboundou</option>
            <option value="Kinaray-a">Kinaray-a</option>
            <option value="Kirghize">Kirghize</option>
            <option value="Kirmanjki">Kirmanjki</option>
            <option value="Klingon">Klingon</option>
            <option value="Kom">Kom</option>
            <option value="Komi">Komi</option>
            <option value="Komi-permiak">Komi-permiak</option>
            <option value="Kongo">Kongo</option>
            <option value="Konkani">Konkani</option>
            <option value="Konkani de Goa">Konkani de Goa</option>
            <option value="Koro">Koro</option>
            <option value="Kosraéen">Kosraéen</option>
            <option value="Kotava">Kotava</option>
            <option value="Kouanyama">Kouanyama</option>
            <option value="Koumyk">Koumyk</option>
            <option value="Kourroukh">Kourroukh</option>
            <option value="Koyra chiini">Koyra chiini</option>
            <option value="Koyraboro senni">Koyraboro senni</option>
            <option value="Kpellé">Kpellé</option>
            <option value="Krio">Krio</option>
            <option value="Kurde">Kurde</option>
            <option value="Kurde du Sud">Kurde du Sud</option>
            <option value="Kutenai">Kutenai</option>
            <option value="Kwasio">Kwasio</option>
            <option value="Ladino">Ladino</option>
            <option value="Lahnda">Lahnda</option>
            <option value="Lakota">Lakota</option>
            <option value="Lamba">Lamba</option>
            <option value="Langi">Langi</option>
            <option value="Langue des signes américaine">Langue des signes américaine</option>
            <option value="Langue indéterminée">Langue indéterminée</option>
            <option value="Lao">Lao</option>
            <option value="Latgalien">Latgalien</option>
            <option value="Latin">Latin</option>
            <option value="Latin American Spanish">Latin American Spanish</option>
            <option value="Laze">Laze</option>
            <option value="Letton">Letton</option>
            <option value="Lezghien">Lezghien</option>
            <option value="Ligure">Ligure</option>
            <option value="Limbourgeois">Limbourgeois</option>
            <option value="Lingala">Lingala</option>
            <option value="Lingua franca nova">Lingua franca nova</option>
            <option value="Lituanien">Lituanien</option>
            <option value="Livonien">Livonien</option>
            <option value="Lojban">Lojban</option>
            <option value="Lombard">Lombard</option>
            <option value="Lori du Nord">Lori du Nord</option>
            <option value="Lozi">Lozi</option>
            <option value="Luba-katanga">Luba-katanga</option>
            <option value="Luba-lulua">Luba-lulua</option>
            <option value="Luhya">Luhya</option>
            <option value="Luiseño">Luiseño</option>
            <option value="Lunda">Lunda</option>
            <option value="Luo">Luo</option>
            <option value="Lushaï">Lushaï</option>
            <option value="Luxembourgeois">Luxembourgeois</option>
            <option value="Maba">Maba</option>
            <option value="Macédonien">Macédonien</option>
            <option value="Madouraï">Madouraï</option>
            <option value="Mafa">Mafa</option>
            <option value="Magahi">Magahi</option>
            <option value="Maithili">Maithili</option>
            <option value="Makassar">Makassar</option>
            <option value="Makhuwa-meetto">Makhuwa-meetto</option>
            <option value="Makondé">Makondé</option>
            <option value="Malais">Malais</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Maldivien">Maldivien</option>
            <option value="Malgache">Malgache</option>
            <option value="Maltais">Maltais</option>
            <option value="Mandan">Mandan</option>
            <option value="Mandchou">Mandchou</option>
            <option value="Mandingue">Mandingue</option>
            <option value="Manipuri">Manipuri</option>
            <option value="Mannois">Mannois</option>
            <option value="Maori">Maori</option>
            <option value="Mapuche">Mapuche</option>
            <option value="Marathe">Marathe</option>
            <option value="Mari">Mari</option>
            <option value="Mari occidental">Mari occidental</option>
            <option value="Marshallais">Marshallais</option>
            <option value="Marwarî">Marwarî</option>
            <option value="Massaï">Massaï</option>
            <option value="Matchamé">Matchamé</option>
            <option value="Mazandérani">Mazandérani</option>
            <option value="Médumba">Médumba</option>
            <option value="Mendé">Mendé</option>
            <option value="Mentawaï">Mentawaï</option>
            <option value="Mérou">Mérou</option>
            <option value="Méta'">Méta'</option>
            <option value="Mexican Spanish">Mexican Spanish</option>
            <option value="Micmac">Micmac</option>
            <option value="Minangkabau">Minangkabau</option>
            <option value="Mingrélien">Mingrélien</option>
            <option value="Minnan">Minnan</option>
            <option value="Mirandais">Mirandais</option>
            <option value="Mohawk">Mohawk</option>
            <option value="Moksa">Moksa</option>
            <option value="Moldave">Moldave</option>
            <option value="Mongo">Mongo</option>
            <option value="Mongol">Mongol</option>
            <option value="Monténégrin">Monténégrin</option>
            <option value="Moré">Moré</option>
            <option value="Moundang">Moundang</option>
            <option value="Moyen anglais">Moyen anglais</option>
            <option value="Moyen français">Moyen français</option>
            <option value="Moyen haut-allemand">Moyen haut-allemand</option>
            <option value="Moyen irlandais">Moyen irlandais</option>
            <option value="Moyen néerlandais">Moyen néerlandais</option>
            <option value="Multilingue">Multilingue</option>
            <option value="Myènè">Myènè</option>
            <option value="N'ko">N'ko</option>
            <option value="Nama">Nama</option>
            <option value="Napolitain">Napolitain</option>
            <option value="Nauruan">Nauruan</option>
            <option value="Navaho">Navaho</option>
            <option value="Ndébélé du Nord">Ndébélé du Nord</option>
            <option value="Ndébélé du Sud">Ndébélé du Sud</option>
            <option value="Ndonga">Ndonga</option>
            <option value="Népalais">Népalais</option>
            <option value="Newari">Newari</option>
            <option value="Newarî classique">Newarî classique</option>
            <option value="Ngambay">Ngambay</option>
            <option value="Ngiemboon">Ngiemboon</option>
            <option value="Ngomba">Ngomba</option>
            <option value="Nheengatu">Nheengatu</option>
            <option value="Nias">Nias</option>
            <option value="Niuéen">Niuéen</option>
            <option value="Nogaï">Nogaï</option>
            <option value="Norvégien">Norvégien</option>
            <option value="Norvégien bokmål">Norvégien bokmål</option>
            <option value="Norvégien nynorsk">Norvégien nynorsk</option>
            <option value="Novial">Novial</option>
            <option value="Nuer">Nuer</option>
            <option value="Nyamwezi">Nyamwezi</option>
            <option value="Nyanja">Nyanja</option>
            <option value="Nyankolé">Nyankolé</option>
            <option value="Nyoro">Nyoro</option>
            <option value="Nzema">Nzema</option>
            <option value="Occitan">Occitan</option>
            <option value="Ojibwa">Ojibwa</option>
            <option value="Oriya">Oriya</option>
            <option value="Oromo">Oromo</option>
            <option value="Osage">Osage</option>
            <option value="Ossète">Ossète</option>
            <option value="Oudmourte">Oudmourte</option>
            <option value="Ougaritique">Ougaritique</option>
            <option value="Ouïghour">Ouïghour</option>
            <option value="Oumboundou">Oumboundou</option>
            <option value="Ourdou">Ourdou</option>
            <option value="Ouzbek">Ouzbek</option>
            <option value="Pachto">Pachto</option>
            <option value="Pahlavi">Pahlavi</option>
            <option value="Palau">Palau</option>
            <option value="Pali">Pali</option>
            <option value="Pampangan">Pampangan</option>
            <option value="Pangasinan">Pangasinan</option>
            <option value="Papiamento">Papiamento</option>
            <option value="Pendjabi">Pendjabi</option>
            <option value="Pennsilvänisch">Pennsilvänisch</option>
            <option value="Persan">Persan</option>
            <option value="Persan ancien">Persan ancien</option>
            <option value="Peul">Peul</option>
            <option value="Phénicien">Phénicien</option>
            <option value="Picard">Picard</option>
            <option value="Pidgin nigérian">Pidgin nigérian</option>
            <option value="Piémontais">Piémontais</option>
            <option value="Pohnpei">Pohnpei</option>
            <option value="Polonais">Polonais</option>
            <option value="Pontique">Pontique</option>
            <option value="Portugais">Portugais</option>
            <option value="Portugais brésilien">Portugais brésilien</option>
            <option value="Portugais européen">Portugais européen</option>
            <option value="Provençal ancien">Provençal ancien</option>
            <option value="Prussien">Prussien</option>
            <option value="Quechua">Quechua</option>
            <option value="Quichua du Haut-Chimborazo">Quichua du Haut-Chimborazo</option>
            <option value="Racine">Racine</option>
            <option value="Rajasthani">Rajasthani</option>
            <option value="Rapanui">Rapanui</option>
            <option value="Rarotongien">Rarotongien</option>
            <option value="Rifain">Rifain</option>
            <option value="Romagnol">Romagnol</option>
            <option value="Romanche">Romanche</option>
            <option value="Romani">Romani</option>
            <option value="Rombo">Rombo</option>
            <option value="Rotuman">Rotuman</option>
            <option value="Roumain">Roumain</option>
            <option value="Roundi">Roundi</option>
            <option value="Roviana">Roviana</option>
            <option value="Russe">Russe</option>
            <option value="Ruthène">Ruthène</option>
            <option value="Rwa">Rwa</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Saho">Saho</option>
            <option value="Sambourou">Sambourou</option>
            <option value="Sami d'Inari">Sami d'Inari</option>
            <option value="Sami de Lule">Sami de Lule</option>
            <option value="Sami du Nord">Sami du Nord</option>
            <option value="Sami du Sud">Sami du Sud</option>
            <option value="Sami skolt">Sami skolt</option>
            <option value="Samoan">Samoan</option>
            <option value="Samogitien">Samogitien</option>
            <option value="Sandawe">Sandawe</option>
            <option value="Sangho">Sangho</option>
            <option value="Sangu">Sangu</option>
            <option value="Sans contenu linguistique">Sans contenu linguistique</option>
            <option value="Sanskrit">Sanskrit</option>
            <option value="Santal">Santal</option>
            <option value="Sarde">Sarde</option>
            <option value="Sarde sassarais">Sarde sassarais</option>
            <option value="Sasak">Sasak</option>
            <option value="Saterlandais">Saterlandais</option>
            <option value="Saurashtra">Saurashtra</option>
            <option value="Sélayar">Sélayar</option>
            <option value="Selkoupe">Selkoupe</option>
            <option value="Seneca">Seneca</option>
            <option value="Serbe">Serbe</option>
            <option value="Serbo-croate">Serbo-croate</option>
            <option value="Sérèr">Sérèr</option>
            <option value="Séri">Séri</option>
            <option value="Shan">Shan</option>
            <option value="Shona">Shona</option>
            <option value="Sicilien">Sicilien</option>
            <option value="Sidamo">Sidamo</option>
            <option value="Siksika">Siksika</option>
            <option value="Silésien">Silésien</option>
            <option value="Sindhi">Sindhi</option>
            <option value="Slavon d'église">Slavon d'église</option>
            <option value="Slovaque">Slovaque</option>
            <option value="Slovène">Slovène</option>
            <option value="Soga">Soga</option>
            <option value="Sogdien">Sogdien</option>
            <option value="Somali">Somali</option>
            <option value="Soninké">Soninké</option>
            <option value="Sorani">Sorani</option>
            <option value="Sotho du Nord">Sotho du Nord</option>
            <option value="Sotho du Sud">Sotho du Sud</option>
            <option value="Soukouma">Soukouma</option>
            <option value="Soundanais">Soundanais</option>
            <option value="Soussou">Soussou</option>
            <option value="Sranan tongo">Sranan tongo</option>
            <option value="Suédois">Suédois</option>
            <option value="Suisse allemand">Suisse allemand</option>
            <option value="Sumérien">Sumérien</option>
            <option value="Swahili">Swahili</option>
            <option value="Swahili du Congo">Swahili du Congo</option>
            <option value="Swati">Swati</option>
            <option value="Symboles Bliss">Symboles Bliss</option>
            <option value="Syriaque">Syriaque</option>
            <option value="Syriaque classique">Syriaque classique</option>
            <option value="Tadjik">Tadjik</option>
            <option value="Tagalog">Tagalog</option>
            <option value="Tahitien">Tahitien</option>
            <option value="Taita">Taita</option>
            <option value="Talysh">Talysh</option>
            <option value="Tamacheq">Tamacheq</option>
            <option value="Tamoul">Tamoul</option>
            <option value="Taroko">Taroko</option>
            <option value="Tasawaq">Tasawaq</option>
            <option value="Tatar">Tatar</option>
            <option value="Tati caucasien">Tati caucasien</option>
            <option value="Tchaghataï">Tchaghataï</option>
            <option value="Tchèque">Tchèque</option>
            <option value="Tchétchène">Tchétchène</option>
            <option value="Tchouvache">Tchouvache</option>
            <option value="Télougou">Télougou</option>
            <option value="Temne">Temne</option>
            <option value="Tereno">Tereno</option>
            <option value="Teso">Teso</option>
            <option value="Tetum">Tetum</option>
            <option value="Thaï">Thaï</option>
            <option value="Tibétain">Tibétain</option>
            <option value="Tigré">Tigré</option>
            <option value="Tigrigna">Tigrigna</option>
            <option value="Tiv">Tiv</option>
            <option value="Tlingit">Tlingit</option>
            <option value="Tok pisin">Tok pisin</option>
            <option value="Tokelau">Tokelau</option>
            <option value="Tonga nyasa">Tonga nyasa</option>
            <option value="Tonguien">Tonguien</option>
            <option value="Toulou">Toulou</option>
            <option value="Toumbouka">Toumbouka</option>
            <option value="Touroyc">Touroyc</option>
            <option value="Touvain">Touvain</option>
            <option value="Tsakhour">Tsakhour</option>
            <option value="Tsakonien">Tsakonien</option>
            <option value="Tsimshian">Tsimshian</option>
            <option value="Tsonga">Tsonga</option>
            <option value="Tswana">Tswana</option>
            <option value="Turc">Turc</option>
            <option value="Turc de Crimée">Turc de Crimée</option>
            <option value="Turc ottoman">Turc ottoman</option>
            <option value="Turkmène">Turkmène</option>
            <option value="Tuvalu">Tuvalu</option>
            <option value="Twi">Twi</option>
            <option value="Tyap">Tyap</option>
            <option value="Ukrainien">Ukrainien</option>
            <option value="Vaï">Vaï</option>
            <option value="Valaque">Valaque</option>
            <option value="Venda">Venda</option>
            <option value="Vénitien">Vénitien</option>
            <option value="Vepse">Vepse</option>
            <option value="Vietnamien">Vietnamien</option>
            <option value="Vieux norrois">Vieux norrois</option>
            <option value="Volapük">Volapük</option>
            <option value="Võro">Võro</option>
            <option value="Vote">Vote</option>
            <option value="Vunjo">Vunjo</option>
            <option value="Walamo">Walamo</option>
            <option value="Wallon">Wallon</option>
            <option value="Walser">Walser</option>
            <option value="Waray">Waray</option>
            <option value="Warlpiri">Warlpiri</option>
            <option value="Washo">Washo</option>
            <option value="Wayuu">Wayuu</option>
            <option value="Wolof">Wolof</option>
            <option value="Wu">Wu</option>
            <option value="Xhosa">Xhosa</option>
            <option value="Xiang">Xiang</option>
            <option value="Yangben">Yangben</option>
            <option value="Yao">Yao</option>
            <option value="Yapois">Yapois</option>
            <option value="Yemba">Yemba</option>
            <option value="Yi du Sichuan">Yi du Sichuan</option>
            <option value="Yiddish">Yiddish</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Youpik central">Youpik central</option>
            <option value="Zapotèque">Zapotèque</option>
            <option value="Zarma">Zarma</option>
            <option value="Zazaki">Zazaki</option>
            <option value="Zélandais">Zélandais</option>
            <option value="Zenaga">Zenaga</option>
            <option value="Zhuang">Zhuang</option>
            <option value="Zoulou">Zoulou</option>
            <option value="Zuñi">Zuñi</option>
          </select>
          {formData.languages_fluent && formData.languages_fluent.length > 0 && (
            <div className="selected-languages">
              {formData.languages_fluent.map((lang, index) => (
                <span key={index} className="language-tag">
                  {lang}
                  <button 
                    type="button" 
                    onClick={() => {
                      const newLanguages = formData.languages_fluent?.filter((_, i) => i !== index) || []
                      handleChange('languages_fluent', newLanguages)
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="languages_notions_select">Langues avec notions</label>
          <select
            id="languages_notions_select"
            value=""
            onChange={(e) => {
              if (e.target.value && !(formData.languages_notions || []).includes(e.target.value)) {
                handleChange('languages_notions', [...(formData.languages_notions || []), e.target.value])
              }
            }}
          >
            <option value="">Ajouter une langue avec notions</option>
            <option value="Anglais">Anglais</option>
            <option value="Français">Français</option>
            <option value="Néerlandais">Néerlandais</option>
            <option value="Abkhaze">Abkhaze</option>
            <option value="Aceh">Aceh</option>
            <option value="Acoli">Acoli</option>
            <option value="Adangme">Adangme</option>
            <option value="Adyghéen">Adyghéen</option>
            <option value="Afar">Afar</option>
            <option value="Afrihili">Afrihili</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Aghem">Aghem</option>
            <option value="Aïnou">Aïnou</option>
            <option value="Akan">Akan</option>
            <option value="Akkadien">Akkadien</option>
            <option value="Akoose">Akoose</option>
            <option value="Alabama">Alabama</option>
            <option value="Albanais">Albanais</option>
            <option value="Aléoute">Aléoute</option>
            <option value="Allemand">Allemand</option>
            <option value="Allemand autrichien">Allemand autrichien</option>
            <option value="Allemand palatin">Allemand palatin</option>
            <option value="Allemand suisse">Allemand suisse</option>
            <option value="Altaï du Sud">Altaï du Sud</option>
            <option value="Amazighe de l'Atlas central">Amazighe de l'Atlas central</option>
            <option value="Amazighe standard marocain">Amazighe standard marocain</option>
            <option value="Amharique">Amharique</option>
            <option value="Ancien anglais">Ancien anglais</option>
            <option value="Ancien français">Ancien français</option>
            <option value="Ancien haut allemand">Ancien haut allemand</option>
            <option value="Ancien irlandais">Ancien irlandais</option>
            <option value="Angika">Angika</option>
            <option value="Anglais américain">Anglais américain</option>
            <option value="Anglais australien">Anglais australien</option>
            <option value="Anglais britannique">Anglais britannique</option>
            <option value="Anglais canadien">Anglais canadien</option>
            <option value="Ao">Ao</option>
            <option value="Arabe">Arabe</option>
            <option value="Arabe algérien">Arabe algérien</option>
            <option value="Arabe égyptien">Arabe égyptien</option>
            <option value="Arabe marocain">Arabe marocain</option>
            <option value="Arabe najdi">Arabe najdi</option>
            <option value="Arabe standard moderne">Arabe standard moderne</option>
            <option value="Arabe tchadien">Arabe tchadien</option>
            <option value="Arabe tunisien">Arabe tunisien</option>
            <option value="Aragonais">Aragonais</option>
            <option value="Araméen">Araméen</option>
            <option value="Araméen samaritain">Araméen samaritain</option>
            <option value="Araona">Araona</option>
            <option value="Arapaho">Arapaho</option>
            <option value="Arawak">Arawak</option>
            <option value="Arménien">Arménien</option>
            <option value="Assamais">Assamais</option>
            <option value="Assou">Assou</option>
            <option value="Asturien">Asturien</option>
            <option value="Atsam">Atsam</option>
            <option value="Avar">Avar</option>
            <option value="Avestique">Avestique</option>
            <option value="Awadhi">Awadhi</option>
            <option value="Aymara">Aymara</option>
            <option value="Azéri">Azéri</option>
            <option value="Bachkir">Bachkir</option>
            <option value="Badaga">Badaga</option>
            <option value="Bafia">Bafia</option>
            <option value="Bafut">Bafut</option>
            <option value="Bakhtiari">Bakhtiari</option>
            <option value="Balinais">Balinais</option>
            <option value="Baloutchi">Baloutchi</option>
            <option value="Baloutchi occidental">Baloutchi occidental</option>
            <option value="Bambara">Bambara</option>
            <option value="Bamoun">Bamoun</option>
            <option value="Banjar">Banjar</option>
            <option value="Bas-allemand">Bas-allemand</option>
            <option value="Bas-prussien">Bas-prussien</option>
            <option value="Bas-saxon néerlandais">Bas-saxon néerlandais</option>
            <option value="Bas-silésien">Bas-silésien</option>
            <option value="Bas-sorabe">Bas-sorabe</option>
            <option value="Basque">Basque</option>
            <option value="Bassa">Bassa</option>
            <option value="Batak toba">Batak toba</option>
            <option value="Bavarois">Bavarois</option>
            <option value="Bedja">Bedja</option>
            <option value="Bemba">Bemba</option>
            <option value="Béna">Béna</option>
            <option value="Bengali">Bengali</option>
            <option value="Betawi">Betawi</option>
            <option value="Bhojpuri">Bhojpuri</option>
            <option value="Bichelamar">Bichelamar</option>
            <option value="Biélorusse">Biélorusse</option>
            <option value="Bikol">Bikol</option>
            <option value="Bini">Bini</option>
            <option value="Birman">Birman</option>
            <option value="Bishnupriya">Bishnupriya</option>
            <option value="Blin">Blin</option>
            <option value="Bodo">Bodo</option>
            <option value="Bosniaque">Bosniaque</option>
            <option value="Boulou">Boulou</option>
            <option value="Bouriate">Bouriate</option>
            <option value="Brahoui">Brahoui</option>
            <option value="Braj">Braj</option>
            <option value="Breton">Breton</option>
            <option value="Bugi">Bugi</option>
            <option value="Bulgare">Bulgare</option>
            <option value="Caddo">Caddo</option>
            <option value="Caingangue">Caingangue</option>
            <option value="Cantonais">Cantonais</option>
            <option value="Capiznon">Capiznon</option>
            <option value="Capverdien">Capverdien</option>
            <option value="Carélien">Carélien</option>
            <option value="Caribe">Caribe</option>
            <option value="Catalan">Catalan</option>
            <option value="Cayuga">Cayuga</option>
            <option value="Cebuano">Cebuano</option>
            <option value="Chakma">Chakma</option>
            <option value="Chambala">Chambala</option>
            <option value="Chamorro">Chamorro</option>
            <option value="Cherokee">Cherokee</option>
            <option value="Cheyenne">Cheyenne</option>
            <option value="Chibcha">Chibcha</option>
            <option value="Chinois">Chinois</option>
            <option value="Chinois littéraire">Chinois littéraire</option>
            <option value="Chinois simplifié">Chinois simplifié</option>
            <option value="Chinois traditionnel">Chinois traditionnel</option>
            <option value="Chipewyan">Chipewyan</option>
            <option value="Chleuh">Chleuh</option>
            <option value="Choctaw">Choctaw</option>
            <option value="Chuuk">Chuuk</option>
            <option value="Cinghalais">Cinghalais</option>
            <option value="Cisena">Cisena</option>
            <option value="Comorien">Comorien</option>
            <option value="Copte">Copte</option>
            <option value="Coréen">Coréen</option>
            <option value="Cornique">Cornique</option>
            <option value="Corse">Corse</option>
            <option value="Cree">Cree</option>
            <option value="Creek">Creek</option>
            <option value="Créole haïtien">Créole haïtien</option>
            <option value="Créole jamaïcain">Créole jamaïcain</option>
            <option value="Créole louisianais">Créole louisianais</option>
            <option value="Créole mauricien">Créole mauricien</option>
            <option value="Créole seychellois">Créole seychellois</option>
            <option value="Croate">Croate</option>
            <option value="Dakota">Dakota</option>
            <option value="Danois">Danois</option>
            <option value="Dargwa">Dargwa</option>
            <option value="Dari">Dari</option>
            <option value="Dari zoroastrien">Dari zoroastrien</option>
            <option value="Dazaga">Dazaga</option>
            <option value="Delaware">Delaware</option>
            <option value="Dinka">Dinka</option>
            <option value="Diola-fogny">Diola-fogny</option>
            <option value="Dioula">Dioula</option>
            <option value="Dogri">Dogri</option>
            <option value="Dogrib">Dogrib</option>
            <option value="Douala">Douala</option>
            <option value="Dusun central">Dusun central</option>
            <option value="Dzongkha">Dzongkha</option>
            <option value="Écossais">Écossais</option>
            <option value="Éfik">Éfik</option>
            <option value="Égyptien ancien">Égyptien ancien</option>
            <option value="Ékadjouk">Ékadjouk</option>
            <option value="Élamite">Élamite</option>
            <option value="Embou">Embou</option>
            <option value="Émilien">Émilien</option>
            <option value="Erzya">Erzya</option>
            <option value="Esclave">Esclave</option>
            <option value="Espagnol">Espagnol</option>
            <option value="Espéranto">Espéranto</option>
            <option value="Estonien">Estonien</option>
            <option value="Estrémègne">Estrémègne</option>
            <option value="European Spanish">European Spanish</option>
            <option value="Éwé">Éwé</option>
            <option value="Éwondo">Éwondo</option>
            <option value="Fang">Fang</option>
            <option value="Fanti">Fanti</option>
            <option value="Féroïen">Féroïen</option>
            <option value="Fidjien">Fidjien</option>
            <option value="Filipino">Filipino</option>
            <option value="Finnois">Finnois</option>
            <option value="Finnois tornédalien">Finnois tornédalien</option>
            <option value="Flamand">Flamand</option>
            <option value="Flamand occidental">Flamand occidental</option>
            <option value="Fon">Fon</option>
            <option value="Français cadien">Français cadien</option>
            <option value="Français canadien">Français canadien</option>
            <option value="Français suisse">Français suisse</option>
            <option value="Francique ripuaire">Francique ripuaire</option>
            <option value="Franconien du Main">Franconien du Main</option>
            <option value="Francoprovençal">Francoprovençal</option>
            <option value="Frioulan">Frioulan</option>
            <option value="Frison du Nord">Frison du Nord</option>
            <option value="Frison occidental">Frison occidental</option>
            <option value="Frison oriental">Frison oriental</option>
            <option value="Ga">Ga</option>
            <option value="Gaélique écossais">Gaélique écossais</option>
            <option value="Gagaouze">Gagaouze</option>
            <option value="Galicien">Galicien</option>
            <option value="Gallois">Gallois</option>
            <option value="Gan">Gan</option>
            <option value="Ganda">Ganda</option>
            <option value="Gayo">Gayo</option>
            <option value="Gbaya">Gbaya</option>
            <option value="Géorgien">Géorgien</option>
            <option value="Ghomala">Ghomala</option>
            <option value="Gilaki">Gilaki</option>
            <option value="Gilbertin">Gilbertin</option>
            <option value="Gondi">Gondi</option>
            <option value="Gorontalo">Gorontalo</option>
            <option value="Gothique">Gothique</option>
            <option value="Goudjerati">Goudjerati</option>
            <option value="Grebo">Grebo</option>
            <option value="Grec">Grec</option>
            <option value="Grec ancien">Grec ancien</option>
            <option value="Groenlandais">Groenlandais</option>
            <option value="Guarani">Guarani</option>
            <option value="Guègue">Guègue</option>
            <option value="Guèze">Guèze</option>
            <option value="Gurenne">Gurenne</option>
            <option value="Gusii">Gusii</option>
            <option value="Gwichʼin">Gwichʼin</option>
            <option value="Haida">Haida</option>
            <option value="Hakka">Hakka</option>
            <option value="Haoussa">Haoussa</option>
            <option value="Haut-sorabe">Haut-sorabe</option>
            <option value="Hawaien">Hawaien</option>
            <option value="Hébreu">Hébreu</option>
            <option value="Héréro">Héréro</option>
            <option value="Hiligaynon">Hiligaynon</option>
            <option value="Hindi">Hindi</option>
            <option value="Hindi fidjien">Hindi fidjien</option>
            <option value="Hiri motu">Hiri motu</option>
            <option value="Hittite">Hittite</option>
            <option value="Hmong">Hmong</option>
            <option value="Hongrois">Hongrois</option>
            <option value="Hupa">Hupa</option>
            <option value="Iakoute">Iakoute</option>
            <option value="Iban">Iban</option>
            <option value="Ibibio">Ibibio</option>
            <option value="Ido">Ido</option>
            <option value="Igbo">Igbo</option>
            <option value="Ilokano">Ilokano</option>
            <option value="Indonésien">Indonésien</option>
            <option value="Ingouche">Ingouche</option>
            <option value="Ingrien">Ingrien</option>
            <option value="Interlingua">Interlingua</option>
            <option value="Interlingue">Interlingue</option>
            <option value="Inuktitut">Inuktitut</option>
            <option value="Inupiaq">Inupiaq</option>
            <option value="Irlandais">Irlandais</option>
            <option value="Islandais">Islandais</option>
            <option value="Italien">Italien</option>
            <option value="Japonais">Japonais</option>
            <option value="Jargon chinook">Jargon chinook</option>
            <option value="Javanais">Javanais</option>
            <option value="Jju">Jju</option>
            <option value="Judéo-arabe">Judéo-arabe</option>
            <option value="Judéo-persan">Judéo-persan</option>
            <option value="Jute">Jute</option>
            <option value="K'iche'">K'iche'</option>
            <option value="Kabardin">Kabardin</option>
            <option value="Kabyle">Kabyle</option>
            <option value="Kachin">Kachin</option>
            <option value="Kachoube">Kachoube</option>
            <option value="Kako">Kako</option>
            <option value="Kalendjin">Kalendjin</option>
            <option value="Kalmouk">Kalmouk</option>
            <option value="Kamba">Kamba</option>
            <option value="Kanembou">Kanembou</option>
            <option value="Kannada">Kannada</option>
            <option value="Kanouri">Kanouri</option>
            <option value="Karakalpak">Karakalpak</option>
            <option value="Karatchaï balkar">Karatchaï balkar</option>
            <option value="Kashmiri">Kashmiri</option>
            <option value="Kawi">Kawi</option>
            <option value="Kazakh">Kazakh</option>
            <option value="Kényang">Kényang</option>
            <option value="Khasi">Khasi</option>
            <option value="Khmer">Khmer</option>
            <option value="Khotanais">Khotanais</option>
            <option value="Khowar">Khowar</option>
            <option value="Kiga">Kiga</option>
            <option value="Kikuyu">Kikuyu</option>
            <option value="Kimboundou">Kimboundou</option>
            <option value="Kinaray-a">Kinaray-a</option>
            <option value="Kirghize">Kirghize</option>
            <option value="Kirmanjki">Kirmanjki</option>
            <option value="Klingon">Klingon</option>
            <option value="Kom">Kom</option>
            <option value="Komi">Komi</option>
            <option value="Komi-permiak">Komi-permiak</option>
            <option value="Kongo">Kongo</option>
            <option value="Konkani">Konkani</option>
            <option value="Konkani de Goa">Konkani de Goa</option>
            <option value="Koro">Koro</option>
            <option value="Kosraéen">Kosraéen</option>
            <option value="Kotava">Kotava</option>
            <option value="Kouanyama">Kouanyama</option>
            <option value="Koumyk">Koumyk</option>
            <option value="Kourroukh">Kourroukh</option>
            <option value="Koyra chiini">Koyra chiini</option>
            <option value="Koyraboro senni">Koyraboro senni</option>
            <option value="Kpellé">Kpellé</option>
            <option value="Krio">Krio</option>
            <option value="Kurde">Kurde</option>
            <option value="Kurde du Sud">Kurde du Sud</option>
            <option value="Kutenai">Kutenai</option>
            <option value="Kwasio">Kwasio</option>
            <option value="Ladino">Ladino</option>
            <option value="Lahnda">Lahnda</option>
            <option value="Lakota">Lakota</option>
            <option value="Lamba">Lamba</option>
            <option value="Langi">Langi</option>
            <option value="Langue des signes américaine">Langue des signes américaine</option>
            <option value="Langue indéterminée">Langue indéterminée</option>
            <option value="Lao">Lao</option>
            <option value="Latgalien">Latgalien</option>
            <option value="Latin">Latin</option>
            <option value="Latin American Spanish">Latin American Spanish</option>
            <option value="Laze">Laze</option>
            <option value="Letton">Letton</option>
            <option value="Lezghien">Lezghien</option>
            <option value="Ligure">Ligure</option>
            <option value="Limbourgeois">Limbourgeois</option>
            <option value="Lingala">Lingala</option>
            <option value="Lingua franca nova">Lingua franca nova</option>
            <option value="Lituanien">Lituanien</option>
            <option value="Livonien">Livonien</option>
            <option value="Lojban">Lojban</option>
            <option value="Lombard">Lombard</option>
            <option value="Lori du Nord">Lori du Nord</option>
            <option value="Lozi">Lozi</option>
            <option value="Luba-katanga">Luba-katanga</option>
            <option value="Luba-lulua">Luba-lulua</option>
            <option value="Luhya">Luhya</option>
            <option value="Luiseño">Luiseño</option>
            <option value="Lunda">Lunda</option>
            <option value="Luo">Luo</option>
            <option value="Lushaï">Lushaï</option>
            <option value="Luxembourgeois">Luxembourgeois</option>
            <option value="Maba">Maba</option>
            <option value="Macédonien">Macédonien</option>
            <option value="Madouraï">Madouraï</option>
            <option value="Mafa">Mafa</option>
            <option value="Magahi">Magahi</option>
            <option value="Maithili">Maithili</option>
            <option value="Makassar">Makassar</option>
            <option value="Makhuwa-meetto">Makhuwa-meetto</option>
            <option value="Makondé">Makondé</option>
            <option value="Malais">Malais</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Maldivien">Maldivien</option>
            <option value="Malgache">Malgache</option>
            <option value="Maltais">Maltais</option>
            <option value="Mandan">Mandan</option>
            <option value="Mandchou">Mandchou</option>
            <option value="Mandingue">Mandingue</option>
            <option value="Manipuri">Manipuri</option>
            <option value="Mannois">Mannois</option>
            <option value="Maori">Maori</option>
            <option value="Mapuche">Mapuche</option>
            <option value="Marathe">Marathe</option>
            <option value="Mari">Mari</option>
            <option value="Mari occidental">Mari occidental</option>
            <option value="Marshallais">Marshallais</option>
            <option value="Marwarî">Marwarî</option>
            <option value="Massaï">Massaï</option>
            <option value="Matchamé">Matchamé</option>
            <option value="Mazandérani">Mazandérani</option>
            <option value="Médumba">Médumba</option>
            <option value="Mendé">Mendé</option>
            <option value="Mentawaï">Mentawaï</option>
            <option value="Mérou">Mérou</option>
            <option value="Méta'">Méta'</option>
            <option value="Mexican Spanish">Mexican Spanish</option>
            <option value="Micmac">Micmac</option>
            <option value="Minangkabau">Minangkabau</option>
            <option value="Mingrélien">Mingrélien</option>
            <option value="Minnan">Minnan</option>
            <option value="Mirandais">Mirandais</option>
            <option value="Mohawk">Mohawk</option>
            <option value="Moksa">Moksa</option>
            <option value="Moldave">Moldave</option>
            <option value="Mongo">Mongo</option>
            <option value="Mongol">Mongol</option>
            <option value="Monténégrin">Monténégrin</option>
            <option value="Moré">Moré</option>
            <option value="Moundang">Moundang</option>
            <option value="Moyen anglais">Moyen anglais</option>
            <option value="Moyen français">Moyen français</option>
            <option value="Moyen haut-allemand">Moyen haut-allemand</option>
            <option value="Moyen irlandais">Moyen irlandais</option>
            <option value="Moyen néerlandais">Moyen néerlandais</option>
            <option value="Multilingue">Multilingue</option>
            <option value="Myènè">Myènè</option>
            <option value="N'ko">N'ko</option>
            <option value="Nama">Nama</option>
            <option value="Napolitain">Napolitain</option>
            <option value="Nauruan">Nauruan</option>
            <option value="Navaho">Navaho</option>
            <option value="Ndébélé du Nord">Ndébélé du Nord</option>
            <option value="Ndébélé du Sud">Ndébélé du Sud</option>
            <option value="Ndonga">Ndonga</option>
            <option value="Népalais">Népalais</option>
            <option value="Newari">Newari</option>
            <option value="Newarî classique">Newarî classique</option>
            <option value="Ngambay">Ngambay</option>
            <option value="Ngiemboon">Ngiemboon</option>
            <option value="Ngomba">Ngomba</option>
            <option value="Nheengatu">Nheengatu</option>
            <option value="Nias">Nias</option>
            <option value="Niuéen">Niuéen</option>
            <option value="Nogaï">Nogaï</option>
            <option value="Norvégien">Norvégien</option>
            <option value="Norvégien bokmål">Norvégien bokmål</option>
            <option value="Norvégien nynorsk">Norvégien nynorsk</option>
            <option value="Novial">Novial</option>
            <option value="Nuer">Nuer</option>
            <option value="Nyamwezi">Nyamwezi</option>
            <option value="Nyanja">Nyanja</option>
            <option value="Nyankolé">Nyankolé</option>
            <option value="Nyoro">Nyoro</option>
            <option value="Nzema">Nzema</option>
            <option value="Occitan">Occitan</option>
            <option value="Ojibwa">Ojibwa</option>
            <option value="Oriya">Oriya</option>
            <option value="Oromo">Oromo</option>
            <option value="Osage">Osage</option>
            <option value="Ossète">Ossète</option>
            <option value="Oudmourte">Oudmourte</option>
            <option value="Ougaritique">Ougaritique</option>
            <option value="Ouïghour">Ouïghour</option>
            <option value="Oumboundou">Oumboundou</option>
            <option value="Ourdou">Ourdou</option>
            <option value="Ouzbek">Ouzbek</option>
            <option value="Pachto">Pachto</option>
            <option value="Pahlavi">Pahlavi</option>
            <option value="Palau">Palau</option>
            <option value="Pali">Pali</option>
            <option value="Pampangan">Pampangan</option>
            <option value="Pangasinan">Pangasinan</option>
            <option value="Papiamento">Papiamento</option>
            <option value="Pendjabi">Pendjabi</option>
            <option value="Pennsilvänisch">Pennsilvänisch</option>
            <option value="Persan">Persan</option>
            <option value="Persan ancien">Persan ancien</option>
            <option value="Peul">Peul</option>
            <option value="Phénicien">Phénicien</option>
            <option value="Picard">Picard</option>
            <option value="Pidgin nigérian">Pidgin nigérian</option>
            <option value="Piémontais">Piémontais</option>
            <option value="Pohnpei">Pohnpei</option>
            <option value="Polonais">Polonais</option>
            <option value="Pontique">Pontique</option>
            <option value="Portugais">Portugais</option>
            <option value="Portugais brésilien">Portugais brésilien</option>
            <option value="Portugais européen">Portugais européen</option>
            <option value="Provençal ancien">Provençal ancien</option>
            <option value="Prussien">Prussien</option>
            <option value="Quechua">Quechua</option>
            <option value="Quichua du Haut-Chimborazo">Quichua du Haut-Chimborazo</option>
            <option value="Racine">Racine</option>
            <option value="Rajasthani">Rajasthani</option>
            <option value="Rapanui">Rapanui</option>
            <option value="Rarotongien">Rarotongien</option>
            <option value="Rifain">Rifain</option>
            <option value="Romagnol">Romagnol</option>
            <option value="Romanche">Romanche</option>
            <option value="Romani">Romani</option>
            <option value="Rombo">Rombo</option>
            <option value="Rotuman">Rotuman</option>
            <option value="Roumain">Roumain</option>
            <option value="Roundi">Roundi</option>
            <option value="Roviana">Roviana</option>
            <option value="Russe">Russe</option>
            <option value="Ruthène">Ruthène</option>
            <option value="Rwa">Rwa</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Saho">Saho</option>
            <option value="Sambourou">Sambourou</option>
            <option value="Sami d'Inari">Sami d'Inari</option>
            <option value="Sami de Lule">Sami de Lule</option>
            <option value="Sami du Nord">Sami du Nord</option>
            <option value="Sami du Sud">Sami du Sud</option>
            <option value="Sami skolt">Sami skolt</option>
            <option value="Samoan">Samoan</option>
            <option value="Samogitien">Samogitien</option>
            <option value="Sandawe">Sandawe</option>
            <option value="Sangho">Sangho</option>
            <option value="Sangu">Sangu</option>
            <option value="Sans contenu linguistique">Sans contenu linguistique</option>
            <option value="Sanskrit">Sanskrit</option>
            <option value="Santal">Santal</option>
            <option value="Sarde">Sarde</option>
            <option value="Sarde sassarais">Sarde sassarais</option>
            <option value="Sasak">Sasak</option>
            <option value="Saterlandais">Saterlandais</option>
            <option value="Saurashtra">Saurashtra</option>
            <option value="Sélayar">Sélayar</option>
            <option value="Selkoupe">Selkoupe</option>
            <option value="Seneca">Seneca</option>
            <option value="Serbe">Serbe</option>
            <option value="Serbo-croate">Serbo-croate</option>
            <option value="Sérèr">Sérèr</option>
            <option value="Séri">Séri</option>
            <option value="Shan">Shan</option>
            <option value="Shona">Shona</option>
            <option value="Sicilien">Sicilien</option>
            <option value="Sidamo">Sidamo</option>
            <option value="Siksika">Siksika</option>
            <option value="Silésien">Silésien</option>
            <option value="Sindhi">Sindhi</option>
            <option value="Slavon d'église">Slavon d'église</option>
            <option value="Slovaque">Slovaque</option>
            <option value="Slovène">Slovène</option>
            <option value="Soga">Soga</option>
            <option value="Sogdien">Sogdien</option>
            <option value="Somali">Somali</option>
            <option value="Soninké">Soninké</option>
            <option value="Sorani">Sorani</option>
            <option value="Sotho du Nord">Sotho du Nord</option>
            <option value="Sotho du Sud">Sotho du Sud</option>
            <option value="Soukouma">Soukouma</option>
            <option value="Soundanais">Soundanais</option>
            <option value="Soussou">Soussou</option>
            <option value="Sranan tongo">Sranan tongo</option>
            <option value="Suédois">Suédois</option>
            <option value="Suisse allemand">Suisse allemand</option>
            <option value="Sumérien">Sumérien</option>
            <option value="Swahili">Swahili</option>
            <option value="Swahili du Congo">Swahili du Congo</option>
            <option value="Swati">Swati</option>
            <option value="Symboles Bliss">Symboles Bliss</option>
            <option value="Syriaque">Syriaque</option>
            <option value="Syriaque classique">Syriaque classique</option>
            <option value="Tadjik">Tadjik</option>
            <option value="Tagalog">Tagalog</option>
            <option value="Tahitien">Tahitien</option>
            <option value="Taita">Taita</option>
            <option value="Talysh">Talysh</option>
            <option value="Tamacheq">Tamacheq</option>
            <option value="Tamoul">Tamoul</option>
            <option value="Taroko">Taroko</option>
            <option value="Tasawaq">Tasawaq</option>
            <option value="Tatar">Tatar</option>
            <option value="Tati caucasien">Tati caucasien</option>
            <option value="Tchaghataï">Tchaghataï</option>
            <option value="Tchèque">Tchèque</option>
            <option value="Tchétchène">Tchétchène</option>
            <option value="Tchouvache">Tchouvache</option>
            <option value="Télougou">Télougou</option>
            <option value="Temne">Temne</option>
            <option value="Tereno">Tereno</option>
            <option value="Teso">Teso</option>
            <option value="Tetum">Tetum</option>
            <option value="Thaï">Thaï</option>
            <option value="Tibétain">Tibétain</option>
            <option value="Tigré">Tigré</option>
            <option value="Tigrigna">Tigrigna</option>
            <option value="Tiv">Tiv</option>
            <option value="Tlingit">Tlingit</option>
            <option value="Tok pisin">Tok pisin</option>
            <option value="Tokelau">Tokelau</option>
            <option value="Tonga nyasa">Tonga nyasa</option>
            <option value="Tonguien">Tonguien</option>
            <option value="Toulou">Toulou</option>
            <option value="Toumbouka">Toumbouka</option>
            <option value="Touroyc">Touroyc</option>
            <option value="Touvain">Touvain</option>
            <option value="Tsakhour">Tsakhour</option>
            <option value="Tsakonien">Tsakonien</option>
            <option value="Tsimshian">Tsimshian</option>
            <option value="Tsonga">Tsonga</option>
            <option value="Tswana">Tswana</option>
            <option value="Turc">Turc</option>
            <option value="Turc de Crimée">Turc de Crimée</option>
            <option value="Turc ottoman">Turc ottoman</option>
            <option value="Turkmène">Turkmène</option>
            <option value="Tuvalu">Tuvalu</option>
            <option value="Twi">Twi</option>
            <option value="Tyap">Tyap</option>
            <option value="Ukrainien">Ukrainien</option>
            <option value="Vaï">Vaï</option>
            <option value="Valaque">Valaque</option>
            <option value="Venda">Venda</option>
            <option value="Vénitien">Vénitien</option>
            <option value="Vepse">Vepse</option>
            <option value="Vietnamien">Vietnamien</option>
            <option value="Vieux norrois">Vieux norrois</option>
            <option value="Volapük">Volapük</option>
            <option value="Võro">Võro</option>
            <option value="Vote">Vote</option>
            <option value="Vunjo">Vunjo</option>
            <option value="Walamo">Walamo</option>
            <option value="Wallon">Wallon</option>
            <option value="Walser">Walser</option>
            <option value="Waray">Waray</option>
            <option value="Warlpiri">Warlpiri</option>
            <option value="Washo">Washo</option>
            <option value="Wayuu">Wayuu</option>
            <option value="Wolof">Wolof</option>
            <option value="Wu">Wu</option>
            <option value="Xhosa">Xhosa</option>
            <option value="Xiang">Xiang</option>
            <option value="Yangben">Yangben</option>
            <option value="Yao">Yao</option>
            <option value="Yapois">Yapois</option>
            <option value="Yemba">Yemba</option>
            <option value="Yi du Sichuan">Yi du Sichuan</option>
            <option value="Yiddish">Yiddish</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Youpik central">Youpik central</option>
            <option value="Zapotèque">Zapotèque</option>
            <option value="Zarma">Zarma</option>
            <option value="Zazaki">Zazaki</option>
            <option value="Zélandais">Zélandais</option>
            <option value="Zenaga">Zenaga</option>
            <option value="Zhuang">Zhuang</option>
            <option value="Zoulou">Zoulou</option>
            <option value="Zuñi">Zuñi</option>
          </select>
          {formData.languages_notions && formData.languages_notions.length > 0 && (
            <div className="selected-languages">
              {formData.languages_notions.map((lang, index) => (
                <span key={index} className="language-tag">
                  {lang}
                  <button 
                    type="button" 
                    onClick={() => {
                      const newLanguages = formData.languages_notions?.filter((_, i) => i !== index) || []
                      handleChange('languages_notions', newLanguages)
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compétences WordPress détaillées */}
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
            {['Doublage', 'Chant', 'Acrobatie', 'Arts martial', 'Equitation', 'Sport de combat'].map(skill => (
              <label key={skill} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.wp_skills || []).includes(skill)}
                  onChange={(e) => handleArrayChange('wp_skills', skill, e.target.checked)}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 🌐 Réseaux sociaux WordPress */}
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
              placeholder="Linkedin"
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

      {/* 🎬 Médias & Vidéos WordPress */}
      <section className="form-section">
        <h3>Vidéos & Showreel</h3>
        <p className="section-description">Ajoutez vos vidéos professionnelles (liens YouTube, Vimeo, etc.)</p>
        
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
            <label htmlFor="video_1_url">Vidéo 1</label>
            <input
              type="url"
              id="video_1_url"
              value={formData.video_1_url || ''}
              onChange={(e) => handleChange('video_1_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="video_2_url">Vidéo 2</label>
            <input
              type="url"
              id="video_2_url"
              value={formData.video_2_url || ''}
              onChange={(e) => handleChange('video_2_url', e.target.value)}
              placeholder="https://vimeo.com/..."
            />
          </div>
        </div>
      </section>

      {/* Expérience WordPress enrichie */}
      <section className="form-section">
        <h3>Expérience & Formation</h3>
        
        <div className="form-field">
          <label htmlFor="experience_level">Niveau d'expérience</label>
          <select
            id="experience_level"
            value={formData.experience_level}
            onChange={(e) => handleChange('experience_level', e.target.value)}
            required
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
          <label htmlFor="professional_experience">Expérience professionnelle</label>
          <textarea
            id="professional_experience"
            value={formData.professional_experience || ''}
            onChange={(e) => handleChange('professional_experience', e.target.value)}
            placeholder="Décrivez vos expériences professionnelles : films, théâtre, publicités, etc."
            rows={4}
          />
        </div>

        <div className="form-field">
          <label htmlFor="training_diplomas">Formation & Diplômes</label>
          <textarea
            id="training_diplomas"
            value={formData.training_diplomas || ''}
            onChange={(e) => handleChange('training_diplomas', e.target.value)}
            placeholder="Formations en art dramatique, diplômes, stages, workshops, etc."
            rows={3}
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
          {renderError('desired_activities')}
        </div>
      </section>

      {/* 📄 Section Fichiers */}
      <section className="form-section">
        <h3>Documents</h3>
        
        {/* Message d'information pour les mineurs */}
        {formData.birth_date && isMinor(formData.birth_date) && (
          <div className="parental-auth-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <p className="alert-title">
                <strong>Vous êtes mineur(e) ({calculateAge(formData.birth_date)} ans)</strong>
              </p>
              <p className="alert-description">
                L'autorisation parentale signée est <strong>obligatoire</strong> pour valider votre inscription.
              </p>
              <a 
                href="/documents/autorisation-parentale-ADK.pdf" 
                download 
                className="download-template-link"
              >
                📄 Télécharger le modèle d'autorisation parentale
              </a>
              <p className="alert-instructions">
                Imprimez le document, faites-le signer par vos parents/tuteurs légaux, 
                puis scannez-le ou prenez-le en photo pour le télécharger ci-dessous.
              </p>
            </div>
          </div>
        )}
        
        <div className="form-row">
          <FileUpload
            id="cv_file"
            label="CV (PDF)"
            accept=".pdf"
            value={files.cv_file}
            onChange={(file) => handleFileChange('cv_file', file)}
            description="Téléchargez votre CV au format PDF (max 10MB)"
            maxSize={10}
          />
          
          {/* Autorisation parentale - affichage conditionnel */}
          {formData.birth_date && isMinor(formData.birth_date) && (
            <div className="form-field">
              <FileUpload
                id="parental_auth_file"
                label="Autorisation parentale (OBLIGATOIRE)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                value={files.parental_auth_file}
                onChange={(file) => handleFileChange('parental_auth_file', file)}
                description="Document signé par vos parents - PDF, DOC ou image (max 5MB)"
                maxSize={5}
                required={true}
              />
              {errors.parental_auth_file && (
                <span className="field-error">{errors.parental_auth_file}</span>
              )}
            </div>
          )}
        </div>
      </section>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Inscription...' : 'S\'inscrire'}
      </button>
      
      </div>
    </form>
  )
}