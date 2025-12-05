import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { normalizeComedienData } from '../../lib/wordpress-compat'
import { phpSerialize } from '../../lib/php-serialize'
import { Button } from '../../components/ui/Button'
import Head from 'next/head'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../components/AuthProvider'
import { AdminStars } from '../../components/AdminStars'

export default function ComedienProfile() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  
  const [comedien, setComedien] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null) // Photo sélectionnée
  const [adminComment, setAdminComment] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<any>({})
  const [originalData, setOriginalData] = useState<any>({}) // Données originales de la base
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // États pour gérer l'affichage des champs "Autre"
  const [showOtherDance, setShowOtherDance] = useState(false)
  const [showOtherMusic, setShowOtherMusic] = useState(false)
  const [showOtherDiverse, setShowOtherDiverse] = useState(false)
  const [showOtherActivities, setShowOtherActivities] = useState(false)

  // États pour l'input temporaire de chaque catégorie
  const [tempDance, setTempDance] = useState('')
  const [tempMusic, setTempMusic] = useState('')
  const [tempDiverse, setTempDiverse] = useState('')
  const [tempActivities, setTempActivities] = useState('')

  // Vérifier si l'utilisateur peut éditer ce profil
  const canEdit = user && (user.role === 'admin' || user.id === id)
  const isAdmin = user?.role === 'admin'

  // Debug pour voir ce que contient user
  useEffect(() => {
    console.log('🔍 USER DEBUG:', { user, canEdit, isAdmin, comedienId: id })
  }, [user, id])

  useEffect(() => {
    if (!id) return
    fetchComedien()
  }, [id])

  const fetchComedien = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('comediens')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      // Debug: voir ce que contient languages
      console.log('🔍 DEBUG RAW DATA from DB:', {
        languages: data.languages,
        actor_languages_notions: data.actor_languages_notions,
        birth_date: data.birth_date,
        type_languages: typeof data.languages,
        type_notions: typeof data.actor_languages_notions
      })

      // Normaliser les données WordPress sérialisées pour l'affichage
      const normalized = normalizeComedienData(data)
      console.log('🔍 DEBUG NORMALIZED:', {
        languages_fluent_normalized: normalized.languages_fluent_normalized,
        languages_notions_normalized: normalized.languages_notions_normalized,
        birth_date: normalized.birth_date
      })
      // Fonction helper pour copier un objet en profondeur avec arrays indépendants
      const deepCopyWithArrays = (obj: any) => {
        const copy: any = {}
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            copy[key] = [...obj[key]] // Copie indépendante des arrays
          } else if (obj[key] && typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
            copy[key] = deepCopyWithArrays(obj[key]) // Récursif pour objets imbriqués
          } else {
            copy[key] = obj[key]
          }
        }
        return copy
      }

      // Ajouter les custom skills aux données normalisées
      const comedienWithCustomSkills = {
        ...normalized,
        dance_skills_other: data.dance_skills_other || [],
        music_skills_other: data.music_skills_other || [],
        diverse_skills_other: data.diverse_skills_other || [],
        desired_activities_other: data.desired_activities_other || []
      }

      // Créer une copie vraiment indépendante pour comedien
      const comedienCopy = deepCopyWithArrays(comedienWithCustomSkills)
      setComedien(comedienCopy)

      // Créer une copie indépendante pour editedData avec les champs pour les checkboxes
      const editedCopy = deepCopyWithArrays(comedienWithCustomSkills)
      editedCopy.dance_skills = [...(editedCopy.dance_skills_normalized || [])]
      editedCopy.music_skills = [...(editedCopy.music_skills_normalized || [])]
      editedCopy.diverse_skills = [...(editedCopy.diverse_skills_normalized || [])]
      editedCopy.desired_activities = [...(editedCopy.desired_activities_normalized || [])]
      editedCopy.driving_licenses = [...(editedCopy.driving_licenses_normalized || [])]
      editedCopy.languages_fluent = [...(editedCopy.languages_fluent_normalized || [])]
      editedCopy.languages_notions = [...(editedCopy.languages_notions_normalized || [])]

      setEditedData(editedCopy)

      // Vérifier que les copies sont vraiment indépendantes
      console.log('🔍 INIT - comedienCopy === editedCopy?', comedienCopy === editedCopy)
      console.log('🔍 INIT - comedienCopy.dance_skills_normalized === editedCopy.dance_skills_normalized?',
        comedienCopy.dance_skills_normalized === editedCopy.dance_skills_normalized)

      setOriginalData(data) // Garder les données brutes pour comparaison
      setAdminComment(data.admin_comment || '')

      // Initialiser les états des champs "Autre"
      setShowOtherDance(Array.isArray(data.dance_skills_other) && data.dance_skills_other.length > 0)
      setShowOtherMusic(Array.isArray(data.music_skills_other) && data.music_skills_other.length > 0)
      setShowOtherDiverse(Array.isArray(data.diverse_skills_other) && data.diverse_skills_other.length > 0)
      setShowOtherActivities(Array.isArray(data.desired_activities_other) && data.desired_activities_other.length > 0)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveComment = async () => {
    if (!isAdmin) return

    try {
      setIsSavingComment(true)

      const response = await fetch(`/api/comediens/${id}/comment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: adminComment,
          isAdmin: true
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erreur lors de la sauvegarde')
      }

      alert('Commentaire sauvegardé !')
    } catch (error: any) {
      alert('Erreur lors de la sauvegarde : ' + error.message)
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleEditToggle = () => {
    if (!canEdit) return
    if (isEditing) {
      // Si on annule, restaurer les données originales
      setEditedData(comedien)
    }
    setIsEditing(!isEditing)
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => {
      const updated = { ...prev, [field]: value }

      // Synchroniser les champs _normalized pour les arrays et certains champs
      if (field === 'languages_fluent' || field === 'languages_notions' ||
          field === 'driving_licenses' || field === 'dance_skills' ||
          field === 'music_skills' || field === 'diverse_skills' ||
          field === 'desired_activities') {
        updated[`${field}_normalized`] = value
      }

      if (field === 'native_language') {
        updated['native_language_normalized'] = value
      }

      return updated
    })
  }

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() // Empêcher le scroll
    if (!canEdit) return

    try {
      setLoading(true)

      const formData = editedData
      const dataToSave: any = {}

      // Mapping des champs simples (pas de sérialisation nécessaire)
      const simpleFields = [
        'first_name', 'last_name', 'birth_date', 'gender', 'nationality',
        'phone', 'mobile_phone', 'email', 'domiciliation', 'street', 'zip_code', 'city', 'country',
        'height', 'build', 'ethnicity', 'hair_color', 'eye_color',
        'native_language',
        'agency_name', 'agent_name', 'agent_email', 'agent_phone',
        'agency_name_2', 'agent_name_2', 'agent_email_2', 'agent_phone_2',
        'website_url', 'facebook_url', 'imdb_url', 'linkedin_url', 'other_profile_url',
        'showreel_url', 'actor_video1', 'actor_video2',
        'experience_level', 'experience', 'certificates'
      ]

      // Ne sauvegarder que les champs simples qui ont changé
      simpleFields.forEach(field => {
        if (formData[field] !== comedien[field]) {
          dataToSave[field] = formData[field]
        }
      })

      // Helper pour comparer deux arrays
      const arraysEqual = (a: any[], b: any[]) => {
        if (!a && !b) return true
        if (!a || !b) return false
        if (a.length !== b.length) return false
        return a.every((val, i) => val === b[i])
      }

      // Détecter les changements dans les arrays et les sauvegarder DIRECTEMENT (pas de sérialisation)
      // PostgreSQL/Supabase gère les arrays nativement
      const arrayFields = [
        {
          normalized: 'languages_fluent_normalized',
          dbField: 'actor_languages_native'  // Corrigé : était 'languages', maintenant 'actor_languages_native'
        },
        {
          normalized: 'languages_notions_normalized',
          dbField: 'actor_languages_notions'
        },
        {
          normalized: 'driving_licenses_normalized',
          dbField: 'actor_driving_license'
        },
        {
          normalized: 'dance_skills_normalized',
          dbField: 'actor_dance_skills'
        },
        {
          normalized: 'music_skills_normalized',
          dbField: 'actor_music_skills'
        },
        {
          normalized: 'diverse_skills_normalized',
          dbField: 'wp_skills'
        },
        {
          normalized: 'desired_activities_normalized',
          dbField: 'wp_activity_domain'
        }
      ]

      arrayFields.forEach(({ normalized, dbField }) => {
        if (!arraysEqual(formData[normalized], comedien[normalized])) {
          // Sauvegarder l'array DIRECTEMENT (pas de sérialisation PHP)
          const arrayValue = formData[normalized] || []
          dataToSave[dbField] = arrayValue.length > 0 ? arrayValue : []
        }
      })

      // Vérifier native_language séparément
      if (formData.native_language_normalized !== comedien.native_language_normalized) {
        dataToSave.native_language = formData.native_language_normalized
        const nativeArray = formData.native_language_normalized ? [formData.native_language_normalized] : []
        dataToSave.actor_languages_native = nativeArray
      }

      // Sauvegarder les compétences personnalisées (custom skills)
      const customSkillFields = ['dance_skills_other', 'music_skills_other', 'diverse_skills_other', 'desired_activities_other']
      customSkillFields.forEach(field => {
        if (!arraysEqual(formData[field], comedien[field])) {
          dataToSave[field] = formData[field] || []
        }
      })

      // Debug: afficher ce qui va être sauvegardé
      console.log('🔍 DEBUG dataToSave:', dataToSave)
      console.log('🔍 DEBUG formData:', formData)
      console.log('🔍 DEBUG comedien:', comedien)
      console.log('🔍 DEBUG dance_skills_normalized changed?', !arraysEqual(formData.dance_skills_normalized, comedien.dance_skills_normalized))
      console.log('🔍 DEBUG dance_skills_normalized formData:', formData.dance_skills_normalized)
      console.log('🔍 DEBUG dance_skills_normalized comedien:', comedien.dance_skills_normalized)
      console.log('🔍 DEBUG dance_skills_other changed?', !arraysEqual(formData.dance_skills_other, comedien.dance_skills_other))
      console.log('🔍 DEBUG dance_skills_other formData:', formData.dance_skills_other)
      console.log('🔍 DEBUG dance_skills_other comedien:', comedien.dance_skills_other)

      // Si aucun champ n'a changé, ne rien faire
      if (Object.keys(dataToSave).length === 0) {
        alert('Aucune modification détectée')
        setLoading(false)
        return
      }

      console.log('💾 SAVE - Envoi à l\'API:', dataToSave)

      // Utiliser l'API route qui a les permissions admin
      const response = await fetch(`/api/comediens?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()
      console.log('💾 SAVE - Résultat:', result)

      alert('Profil mis à jour avec succès !')
      setIsEditing(false)
      fetchComedien() // Recharger les données
    } catch (error: any) {
      alert('Erreur lors de la sauvegarde : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    console.log('🔍 handleArrayChange called:', { field, value, checked })
    setEditedData((prev: any) => {
      const currentArray = prev[field] || prev[`${field}_normalized`] || []
      console.log('🔍 handleArrayChange - currentArray:', currentArray)
      let newArray
      if (checked) {
        newArray = [...currentArray, value]
      } else {
        newArray = currentArray.filter((item: string) => item !== value)
      }
      console.log('🔍 handleArrayChange - newArray:', newArray)
      const updated = {
        ...prev,
        [field]: [...newArray],  // Copie indépendante
        [`${field}_normalized`]: [...newArray]  // Copie indépendante pour le champ normalized
      }
      console.log('🔍 handleArrayChange - updated[dance_skills_normalized]:', updated.dance_skills_normalized)
      return updated
    })
  }

  // Fonction pour ajouter une compétence personnalisée
  const addCustomSkill = (field: string, value: string, setTemp: (v: string) => void) => {
    if (!value.trim()) return
    const current = editedData[field] || []
    if (!current.includes(value.trim())) {
      setEditedData((prev: any) => ({
        ...prev,
        [field]: [...current, value.trim()]
      }))
    }
    setTemp('')
  }

  // Fonction pour supprimer une compétence personnalisée
  const removeCustomSkill = (field: string, value: string) => {
    const current = editedData[field] || []
    setEditedData((prev: any) => ({
      ...prev,
      [field]: current.filter((item: string) => item !== value)
    }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit || !event.target.files || event.target.files.length === 0) return
    
    setUploadingPhoto(true)
    
    try {
      const file = event.target.files[0]
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La photo ne doit pas dépasser 5MB')
      }
      
      // Convertir le fichier en base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      const fileBase64 = await base64Promise
      
      // Appeler l'API d'upload
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileBase64,
          comedienId: id
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'upload')
      }
      
      const { photoUrl } = await response.json()
      
      // Ajouter la photo au tableau de photos
      const currentPhotos = comedien.photos || []
      const updatedPhotos = [...currentPhotos, photoUrl]
      
      // Sauvegarder dans la base de données
      const { error: updateError } = await supabase
        .from('comediens')
        .update({ photos: updatedPhotos })
        .eq('id', id)
      
      if (updateError) throw updateError
      
      // Recharger les données
      await fetchComedien()
      alert('Photo ajoutée avec succès !')
    } catch (error: any) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload : ' + error.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!canEdit) return
    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return
    
    try {
      // Retirer la photo du tableau
      const currentPhotos = comedien.photos || []
      const updatedPhotos = currentPhotos.filter((p: string) => p !== photoUrl)
      
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('comediens')
        .update({ photos: updatedPhotos })
        .eq('id', id)
      
      if (error) throw error
      
      // Recharger les données
      await fetchComedien()
      alert('Photo supprimée !')
    } catch (error: any) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  const calculateAge = (birthDate: string) => {
    console.log('🔍 calculateAge input:', birthDate, typeof birthDate)
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    console.log('🔍 birth date parsed:', birth, 'isValid:', !isNaN(birth.getTime()))
    if (isNaN(birth.getTime())) return null // Date invalide
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
    console.log('🔍 calculated age:', calculatedAge)
    return calculatedAge
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) return (
    <Layout>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
        Chargement...
      </div>
    </Layout>
  )
  
  if (error) return (
    <Layout>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#dc3545'}}>
        Erreur: {error}
      </div>
    </Layout>
  )
  
  if (!comedien) return (
    <Layout>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#dc3545'}}>
        Comédien non trouvé
      </div>
    </Layout>
  )

  const age = calculateAge(comedien.birth_date)
  
  // Utiliser les photos et filtrer les URLs invalides + exclure les photos WordPress
  const photos = (comedien.photos || []).filter((photo: string) =>
    photo &&
    photo.trim() !== '' &&
    !photo.includes('undefined') &&
    !photo.includes('null') &&
    !photo.includes('wp-content') && // Exclure les photos WordPress
    !photo.includes('adk-kasting.com/wp-content') // Exclure les anciennes URLs WordPress
  )
  
  // Nom complet pour le H1 : TOUJOURS prénom + nom
  const fullName = `${comedien.first_name || ''} ${comedien.last_name || ''}`.trim() || 'Comédien'
  
  // Display name pour le title (peut être email si pas de nom)
  const displayName = comedien.display_name_normalized || fullName
  
  // Photo principale : la sélectionnée ou la première
  const mainPhoto = selectedPhoto || (photos.length > 0 ? photos[0] : null)

  return (
    <Layout showPageTitle={false}>
      <Head>
        <title>{displayName} - ADK Kasting</title>
      </Head>
      
      <div className="comedien-profile">
        <div className="profile-content">
          {/* Bouton retour en haut à droite */}
          <button onClick={handleBack} className="back-button">
            ← Retour
          </button>

          {/* Layout principal : Photo + Infos */}
          <div className="profile-main">
            
            {/* Section Photo (gauche) - GALERIE COMPLÈTE */}
            <div className="profile-photo-section">
              {photos.length > 0 ? (
                <div className="photos-layout">
                  {/* Photo principale */}
                  <div className="main-photo">
                    <img 
                      src={mainPhoto}
                      alt={`${fullName} - Photo principale`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-profile.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Toutes les vignettes */}
                  <div className="photo-thumbnails">
                    {photos.map((photo: string, index: number) => (
                      <div key={index} className="thumbnail-wrapper">
                        <img 
                          src={photo}
                          alt={`${fullName} - Photo ${index + 1}`}
                          className={mainPhoto === photo ? 'active' : ''}
                          onClick={() => setSelectedPhoto(photo)}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            // Cacher complètement l'image en cas d'erreur
                            img.style.display = 'none';
                          }}
                        />
                        {isEditing && canEdit && (
                          <button 
                            className="delete-photo-btn"
                            onClick={() => handleDeletePhoto(photo)}
                            title="Supprimer cette photo"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Bouton d'ajout de photo (toujours visible si canEdit) */}
                    {canEdit && (
                      <label className="add-photo-btn" title="Ajouter une photo">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          style={{ display: 'none' }}
                        />
                        <span>{uploadingPhoto ? '⏳' : '+'}</span>
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-photo">
                  {isEditing && canEdit ? (
                    <div className="photos-layout">
                      <div className="main-photo placeholder-main">
                        <span>📷</span>
                        <p>Aucune photo</p>
                      </div>
                      <div className="photo-thumbnails">
                        <label className="add-photo-btn" title="Ajouter une photo">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            style={{ display: 'none' }}
                          />
                          <span>{uploadingPhoto ? '⏳' : '+'}</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="placeholder-photo">
                      <span>📷</span>
                      <p>Aucune photo</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section Infos (centre) - TOUTES LES DONNÉES DU FORMULAIRE */}
            <div className="profile-info-section">
              
              {/* Boutons d'édition (visible uniquement si canEdit) */}
              {canEdit && (
                <div className="edit-buttons" style={{ marginBottom: '20px' }}>
                  {!isEditing ? (
                    <button onClick={handleEditToggle} className="edit-profile-button">
                      ✏️ {isAdmin ? 'Modifier ce profil' : 'Modifier mon profil'}
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button onClick={handleSaveProfile} className="save-button" disabled={loading}>
                        {loading ? 'Sauvegarde...' : '✓ Sauvegarder'}
                      </button>
                      <button onClick={handleEditToggle} className="cancel-button">
                        ✕ Annuler
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Titre principal avec nom complet + Étoiles admin + Bouton PDF */}
              <div className="profile-header-row">
                <h1 className="profile-main-title">
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={editedData.first_name || ''} 
                        onChange={(e) => handleFieldChange('first_name', e.target.value)}
                        placeholder="Prénom"
                        className="edit-input-inline"
                      />
                      <input 
                        type="text" 
                        value={editedData.last_name || ''} 
                        onChange={(e) => handleFieldChange('last_name', e.target.value)}
                        placeholder="Nom"
                        className="edit-input-inline"
                      />
                    </div>
                  ) : (
                    fullName
                  )}
                </h1>
                <div className="profile-header-actions">
                  {isAdmin && (
                    <AdminStars 
                      comedienId={id as string} 
                      rating={comedien.admin_rating || 0}
                      isAdmin={isAdmin}
                      onRatingUpdate={(newRating) => {
                        setComedien({ ...comedien, admin_rating: newRating });
                      }}
                      size="medium"
                      showLabel={false}
                    />
                  )}
                  {comedien.actor_resume && (
                    <a
                      href={comedien.actor_resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cv-button"
                    >
                      📄 CV
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        const { generateComedienPDF } = await import('../../lib/pdf-generator');
                        await generateComedienPDF(comedien);
                      }}
                      className="pdf-button"
                    >
                      📝 PDF
                    </button>
                  )}
                </div>
              </div>
              
              {/* === BLOC INFOS CLÉS (sans fond blanc) + COMMENTAIRE ADMIN === */}
              <div className="profile-key-info-with-comment">
                {/* Colonne gauche : Infos clés */}
                <div className="profile-key-info">
                  <div className="key-info-item">
                    <span className="key-info-label">{isEditing ? 'Date de naissance' : 'Âge'}</span>
                    <span className="key-info-value">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedData.birth_date || ''}
                          onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                          className="edit-input-inline"
                        />
                      ) : (
                        age ? `${age} ans` : 'Non spécifié'
                      )}
                    </span>
                  </div>
                <div className="key-info-item">
                  <span className="key-info-label">Langues</span>
                  <span className="key-info-value">
                    {(() => {
                      const allLangs: string[] = [];
                      if (comedien.native_language_normalized) allLangs.push(comedien.native_language_normalized);
                      if (comedien.languages_fluent_normalized?.length > 0) allLangs.push(...comedien.languages_fluent_normalized);
                      if (comedien.languages_notions_normalized?.length > 0) allLangs.push(...comedien.languages_notions_normalized);
                      // Déduplication manuelle
                      const uniqueLangs = allLangs.filter((lang, index) => allLangs.indexOf(lang) === index);
                      return uniqueLangs.length > 0 ? uniqueLangs.join(', ') : 'Non spécifié';
                    })()}
                  </span>
                </div>
                <div className="key-info-item">
                  <span className="key-info-label">Domaine</span>
                  <span className="key-info-value">
                    {isEditing ? (
                      <div className="edit-checkbox-group">
                        {[
                          'Long métrage', 'Court métrage', 'Film d\'étudiant',
                          'Publicité', 'Doublage', 'Films d\'entreprise', 'Films institutionnels'
                        ].map(activite => (
                          <label key={activite}>
                            <input
                              type="checkbox"
                              checked={(editedData.desired_activities || []).includes(activite)}
                              onChange={(e) => handleArrayChange('desired_activities', activite, e.target.checked)}
                            />
                            {activite}
                          </label>
                        ))}
                        <label>
                          <input
                            type="checkbox"
                            checked={showOtherActivities}
                            onChange={(e) => {
                              setShowOtherActivities(e.target.checked)
                              if (!e.target.checked) {
                                setEditedData((prev: any) => ({ ...prev, desired_activities_other: [] }))
                                setTempActivities('')
                              }
                            }}
                          />
                          Autre
                        </label>
                      </div>
                    ) : (
                      <>
                        {comedien.desired_activities_normalized && comedien.desired_activities_normalized.length > 0
                          ? comedien.desired_activities_normalized.join(', ')
                          : 'Non spécifié'}
                        {(editedData.desired_activities_other || []).length > 0 && (
                          <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                            Autres: {(editedData.desired_activities_other || []).join(', ')}
                          </div>
                        )}
                      </>
                    )}
                    {showOtherActivities && isEditing && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            placeholder="Ajouter une activité souhaitée"
                            value={tempActivities}
                            onChange={(e) => setTempActivities(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomSkill('desired_activities_other', tempActivities, setTempActivities)
                              }
                            }}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                          <button
                            type="button"
                            onClick={() => addCustomSkill('desired_activities_other', tempActivities, setTempActivities)}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #393939', backgroundColor: '#393939', color: 'white', cursor: 'pointer' }}
                          >
                            Ajouter
                          </button>
                        </div>
                        {(editedData.desired_activities_other || []).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(editedData.desired_activities_other || []).map((activity: string) => (
                              <span key={activity} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '20px', fontSize: '14px' }}>
                                {activity}
                                <button
                                  type="button"
                                  onClick={() => removeCustomSkill('desired_activities_other', activity)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </span>
                </div>
                <div className="key-info-item">
                  <span className="key-info-label">Mail</span>
                  <span className="key-info-value">
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={editedData.email || ''} 
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="edit-input-inline"
                      />
                    ) : (
                      <a href={`mailto:${comedien.email}`}>{comedien.email}</a>
                    )}
                  </span>
                </div>
                  <div className="key-info-item">
                    <span className="key-info-label">Tél</span>
                    <span className="key-info-value">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="edit-input-inline"
                        />
                      ) : (
                        comedien.phone ? <a href={`tel:${comedien.phone}`}>{comedien.phone}</a> : 'Non spécifié'
                      )}
                    </span>
                  </div>
                  <div className="key-info-item">
                    <span className="key-info-label">Tél mobile</span>
                    <span className="key-info-value">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.mobile_phone || ''}
                          onChange={(e) => handleFieldChange('mobile_phone', e.target.value)}
                          className="edit-input-inline"
                        />
                      ) : (
                        comedien.mobile_phone ? <a href={`tel:${comedien.mobile_phone}`}>{comedien.mobile_phone}</a> : 'Non spécifié'
                      )}
                    </span>
                  </div>
                </div>

                {/* Colonne droite : Commentaire admin */}
                {isAdmin && (
                  <div className="admin-comment-column">
                    {!showCommentForm ? (
                      <div className="comment-display">
                        {adminComment ? (
                          <>
                            <div className="comment-text">{adminComment}</div>
                            <button 
                              onClick={() => setShowCommentForm(true)}
                              className="comment-edit-btn"
                            >
                              Modifier
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setShowCommentForm(true)}
                            className="comment-add-btn"
                          >
                            + Ajouter un commentaire
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="comment-form">
                        <input
                          type="text"
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          placeholder="Commentaire privé..."
                          className="comment-input"
                        />
                        <button 
                          onClick={async () => {
                            await handleSaveComment();
                            setShowCommentForm(false);
                          }}
                          disabled={isSavingComment}
                          className="comment-save-btn"
                        >
                          {isSavingComment ? '...' : '✓'}
                        </button>
                        <button 
                          onClick={() => setShowCommentForm(false)}
                          className="comment-cancel-btn"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* === BLOC 2 COLONNES : CARACTÉRISTIQUES PHYSIQUES + LANGUES DÉTAILLÉES === */}
              <div className="profile-two-columns">
                {/* Colonne gauche : Caractéristiques physiques */}
                <div className="profile-column">
                  <h3>Caractéristiques physiques</h3>
                  <div className="column-items">
                    <div className="key-info-item">
                      <span className="key-info-label">Type</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <select 
                            value={editedData.ethnicity || ''} 
                            onChange={(e) => handleFieldChange('ethnicity', e.target.value)}
                            className="edit-input-inline"
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
                        ) : (
                          comedien.ethnicity || 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Corpulence</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <select 
                            value={editedData.build || ''} 
                            onChange={(e) => handleFieldChange('build', e.target.value)}
                            className="edit-input-inline"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Mince">Mince</option>
                            <option value="Moyenne">Moyenne</option>
                            <option value="Forte">Forte</option>
                            <option value="Athlétique">Athlétique</option>
                          </select>
                        ) : (
                          comedien.build || 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Taille</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input 
                              type="number" 
                              value={editedData.height || ''} 
                              onChange={(e) => handleFieldChange('height', parseInt(e.target.value) || '')}
                              className="edit-input-inline"
                              style={{ width: '80px' }}
                              min="60"
                              max="220"
                            />
                            <span>cm</span>
                          </div>
                        ) : (
                          comedien.height ? `${comedien.height} cm` : 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Cheveux</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <select 
                            value={editedData.hair_color || ''} 
                            onChange={(e) => handleFieldChange('hair_color', e.target.value)}
                            className="edit-input-inline"
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
                        ) : (
                          comedien.hair_color || 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Yeux</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <select 
                            value={editedData.eye_color || ''} 
                            onChange={(e) => handleFieldChange('eye_color', e.target.value)}
                            className="edit-input-inline"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Bleu">Bleu</option>
                            <option value="Vert">Vert</option>
                            <option value="Brun">Brun</option>
                            <option value="Noisette">Noisette</option>
                            <option value="Noir">Bleu-gris</option>
                          </select>
                        ) : (
                          comedien.eye_color || 'Non spécifié'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colonne droite : Langues détaillées */}
                <div className="profile-column">
                  <h3>Langues</h3>
                  <div className="column-items">
                    <div className="key-info-item">
                      <span className="key-info-label">Maternelle</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <select 
                            value={editedData.native_language || ''} 
                            onChange={(e) => handleFieldChange('native_language', e.target.value)}
                            className="edit-input-inline"
                            style={{ minWidth: '200px' }}
                          >
                            <option value="">Sélectionner votre langue maternelle</option>
                            <option value="Anglais">Anglais</option>
                            <option value="Français">Français</option>
                            <option value="Néerlandais">Néerlandais</option>
                            <option value="Allemand">Allemand</option>
                            <option value="Espagnol">Espagnol</option>
                            <option value="Italien">Italien</option>
                            <option value="Portugais">Portugais</option>
                            <option value="Arabe">Arabe</option>
                            <option value="Chinois">Chinois</option>
                            <option value="Russe">Russe</option>
                            <option value="Japonais">Japonais</option>
                            <option value="Polonais">Polonais</option>
                            <option value="Roumain">Roumain</option>
                            <option value="Turc">Turc</option>
                            <option value="Grec">Grec</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Coréen">Coréen</option>
                            <option value="Suédois">Suédois</option>
                            <option value="Norvégien">Norvégien</option>
                            <option value="Danois">Danois</option>
                            <option value="Finnois">Finnois</option>
                          </select>
                        ) : (
                          comedien.native_language_normalized || 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Couramment</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <div>
                            <select 
                              value="" 
                              onChange={(e) => {
                                if (e.target.value && !(editedData.languages_fluent_normalized || []).includes(e.target.value)) {
                                  handleFieldChange('languages_fluent', [...(editedData.languages_fluent_normalized || []), e.target.value]);
                                }
                              }}
                              className="edit-input-inline"
                              style={{ minWidth: '200px', marginBottom: '8px' }}
                            >
                              <option value="">Ajouter une langue parlée couramment</option>
                              <option value="Anglais">Anglais</option>
                              <option value="Français">Français</option>
                              <option value="Néerlandais">Néerlandais</option>
                              <option value="Allemand">Allemand</option>
                              <option value="Espagnol">Espagnol</option>
                              <option value="Italien">Italien</option>
                              <option value="Portugais">Portugais</option>
                              <option value="Arabe">Arabe</option>
                              <option value="Chinois">Chinois</option>
                              <option value="Russe">Russe</option>
                              <option value="Japonais">Japonais</option>
                              <option value="Polonais">Polonais</option>
                              <option value="Roumain">Roumain</option>
                              <option value="Turc">Turc</option>
                              <option value="Grec">Grec</option>
                            </select>
                            {(editedData.languages_fluent_normalized || []).length > 0 && (
                              <div className="edit-checkbox-group" style={{ marginTop: '8px' }}>
                                {(editedData.languages_fluent_normalized || []).map((lang: string) => (
                                  <span key={lang} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    background: '#E5E7EB',
                                    borderRadius: '4px',
                                    marginRight: '6px'
                                  }}>
                                    {lang}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newLangs = (editedData.languages_fluent_normalized || []).filter((l: string) => l !== lang);
                                        handleFieldChange('languages_fluent', newLangs);
                                      }}
                                      style={{
                                        marginLeft: '6px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#EF4444'
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          comedien.languages_fluent_normalized && comedien.languages_fluent_normalized.length > 0
                            ? comedien.languages_fluent_normalized.join(', ')
                            : 'Non spécifié'
                        )}
                      </span>
                    </div>
                    <div className="key-info-item">
                      <span className="key-info-label">Notions</span>
                      <span className="key-info-value">
                        {isEditing ? (
                          <div>
                            <select 
                              value="" 
                              onChange={(e) => {
                                if (e.target.value && !(editedData.languages_notions_normalized || []).includes(e.target.value)) {
                                  handleFieldChange('languages_notions', [...(editedData.languages_notions_normalized || []), e.target.value]);
                                }
                              }}
                              className="edit-input-inline"
                              style={{ minWidth: '200px', marginBottom: '8px' }}
                            >
                              <option value="">Ajouter une langue avec notions</option>
                              <option value="Anglais">Anglais</option>
                              <option value="Français">Français</option>
                              <option value="Néerlandais">Néerlandais</option>
                              <option value="Allemand">Allemand</option>
                              <option value="Espagnol">Espagnol</option>
                              <option value="Italien">Italien</option>
                              <option value="Portugais">Portugais</option>
                              <option value="Arabe">Arabe</option>
                              <option value="Chinois">Chinois</option>
                              <option value="Russe">Russe</option>
                              <option value="Japonais">Japonais</option>
                              <option value="Polonais">Polonais</option>
                              <option value="Roumain">Roumain</option>
                              <option value="Turc">Turc</option>
                              <option value="Grec">Grec</option>
                            </select>
                            {(editedData.languages_notions_normalized || []).length > 0 && (
                              <div className="edit-checkbox-group" style={{ marginTop: '8px' }}>
                                {(editedData.languages_notions_normalized || []).map((lang: string) => (
                                  <span key={lang} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    background: '#E5E7EB',
                                    borderRadius: '4px',
                                    marginRight: '6px'
                                  }}>
                                    {lang}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newLangs = (editedData.languages_notions_normalized || []).filter((l: string) => l !== lang);
                                        handleFieldChange('languages_notions', newLangs);
                                      }}
                                      style={{
                                        marginLeft: '6px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#EF4444'
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          comedien.languages_notions_normalized && comedien.languages_notions_normalized.length > 0
                            ? comedien.languages_notions_normalized.join(', ')
                            : 'Non spécifié'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* === BLOC 2 COLONNES : AGENT 1 + AGENT 2 === */}
              {(comedien.agency_name || comedien.agent_name || comedien.agency_name_2 || comedien.agent_name_2) && (
                <div className="profile-two-columns">
                  {/* Colonne gauche : Agent 1 */}
                  {(comedien.agency_name || comedien.agent_name) && (
                    <div className="profile-column">
                      <h3>Agence / Agent 1</h3>
                      <div className="column-items">
                        <div className="key-info-item">
                          <span className="key-info-label">Agence</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editedData.agency_name || ''} 
                                onChange={(e) => handleFieldChange('agency_name', e.target.value)}
                                className="edit-input-inline"
                                placeholder="Nom de l'agence"
                              />
                            ) : (
                              comedien.agency_name || 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Agent</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editedData.agent_name || ''} 
                                onChange={(e) => handleFieldChange('agent_name', e.target.value)}
                                className="edit-input-inline"
                                placeholder="Nom de l'agent"
                              />
                            ) : (
                              comedien.agent_name || 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Email</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="email" 
                                value={editedData.agent_email || ''} 
                                onChange={(e) => handleFieldChange('agent_email', e.target.value)}
                                className="edit-input-inline"
                                placeholder="email@agence.com"
                              />
                            ) : (
                              comedien.agent_email ? <a href={`mailto:${comedien.agent_email}`}>{comedien.agent_email}</a> : 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Tél</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="tel" 
                                value={editedData.agent_phone || ''} 
                                onChange={(e) => handleFieldChange('agent_phone', e.target.value)}
                                className="edit-input-inline"
                                placeholder="06 12 34 56 78"
                              />
                            ) : (
                              comedien.agent_phone ? <a href={`tel:${comedien.agent_phone}`}>{comedien.agent_phone}</a> : 'Non spécifié'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Colonne droite : Agent 2 */}
                  {(comedien.agency_name_2 || comedien.agent_name_2) && (
                    <div className="profile-column">
                      <h3>Agence / Agent 2</h3>
                      <div className="column-items">
                        <div className="key-info-item">
                          <span className="key-info-label">Agence</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editedData.agency_name_2 || ''} 
                                onChange={(e) => handleFieldChange('agency_name_2', e.target.value)}
                                className="edit-input-inline"
                                placeholder="Nom de l'agence"
                              />
                            ) : (
                              comedien.agency_name_2 || 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Agent</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editedData.agent_name_2 || ''} 
                                onChange={(e) => handleFieldChange('agent_name_2', e.target.value)}
                                className="edit-input-inline"
                                placeholder="Nom de l'agent"
                              />
                            ) : (
                              comedien.agent_name_2 || 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Email</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="email" 
                                value={editedData.agent_email_2 || ''} 
                                onChange={(e) => handleFieldChange('agent_email_2', e.target.value)}
                                className="edit-input-inline"
                                placeholder="email@agence.com"
                              />
                            ) : (
                              comedien.agent_email_2 ? <a href={`mailto:${comedien.agent_email_2}`}>{comedien.agent_email_2}</a> : 'Non spécifié'
                            )}
                          </span>
                        </div>
                        <div className="key-info-item">
                          <span className="key-info-label">Tél</span>
                          <span className="key-info-value">
                            {isEditing ? (
                              <input 
                                type="tel" 
                                value={editedData.agent_phone_2 || ''} 
                                onChange={(e) => handleFieldChange('agent_phone_2', e.target.value)}
                                className="edit-input-inline"
                                placeholder="06 12 34 56 78"
                              />
                            ) : (
                              comedien.agent_phone_2 ? <a href={`tel:${comedien.agent_phone_2}`}>{comedien.agent_phone_2}</a> : 'Non spécifié'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === AUTRES INFORMATIONS EN 2 COLONNES === */}
              <div className="profile-two-columns">
                {/* Colonne gauche : Identité et coordonnées */}
                <div className="profile-column">
                  <h3>Informations personnelles</h3>
                  <div className="column-items">
                    {(comedien.gender || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Genre</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <select 
                              value={editedData.gender || ''} 
                              onChange={(e) => handleFieldChange('gender', e.target.value)}
                              className="edit-input-inline"
                            >
                              <option value="">Genre</option>
                              <option value="Masculin">Masculin</option>
                              <option value="Féminin">Féminin</option>
                              <option value="Autre">Autre</option>
                            </select>
                          ) : (
                            comedien.gender
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.nationality || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Nationalité</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editedData.nationality || ''} 
                              onChange={(e) => handleFieldChange('nationality', e.target.value)}
                              className="edit-input-inline"
                              placeholder="Française"
                            />
                          ) : (
                            comedien.nationality
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.domiciliation || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Domiciliation</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <select 
                              value={editedData.domiciliation || ''} 
                              onChange={(e) => handleFieldChange('domiciliation', e.target.value)}
                              className="edit-input-inline"
                            >
                              <option value="">Sélectionner votre région</option>
                              <option value="Bruxelles-Capitale">Bruxelles-Capitale</option>
                              <option value="Wallonie">Wallonie</option>
                              <option value="Flandre">Flandre</option>
                              <option value="France">France</option>
                              <option value="Autre">Autre</option>
                            </select>
                          ) : (
                            comedien.domiciliation
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.street || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Rue</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editedData.street || ''} 
                              onChange={(e) => handleFieldChange('street', e.target.value)}
                              className="edit-input-inline"
                              placeholder="Rue"
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            comedien.street
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.zip_code || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Code postal</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editedData.zip_code || ''} 
                              onChange={(e) => handleFieldChange('zip_code', e.target.value)}
                              className="edit-input-inline"
                              placeholder="75001"
                              style={{ minWidth: '100px' }}
                            />
                          ) : (
                            comedien.zip_code
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.city || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Ville</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editedData.city || ''} 
                              onChange={(e) => handleFieldChange('city', e.target.value)}
                              className="edit-input-inline"
                              placeholder="Paris"
                            />
                          ) : (
                            comedien.city
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.country || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Pays</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editedData.country || ''} 
                              onChange={(e) => handleFieldChange('country', e.target.value)}
                              className="edit-input-inline"
                              placeholder="France"
                            />
                          ) : (
                            comedien.country
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne droite : Compétences et réseaux sociaux */}
                <div className="profile-column">
                  <h3>Compétences & Réseaux</h3>
                  <div className="column-items">
                    {((comedien.driving_licenses_normalized && comedien.driving_licenses_normalized.length > 0) || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Permis</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <div className="edit-checkbox-group">
                              {['Auto', 'Moto', 'Camion', 'Avion / hélicoptère'].map(permis => (
                                <label key={permis}>
                                  <input 
                                    type="checkbox" 
                                    checked={(editedData.driving_licenses || []).includes(permis)}
                                    onChange={(e) => handleArrayChange('driving_licenses', permis, e.target.checked)}
                                  />
                                  {permis}
                                </label>
                              ))}
                            </div>
                          ) : (
                            comedien.driving_licenses_normalized.join(', ')
                          )}
                        </span>
                      </div>
                    )}
                    {((comedien.dance_skills_normalized && comedien.dance_skills_normalized.length > 0) || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Danse</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <div className="edit-checkbox-group">
                              {['Classique', 'Salsa', 'Tango', 'Rock', 'Danse de salon', 'Hip hop'].map(danse => (
                                <label key={danse}>
                                  <input
                                    type="checkbox"
                                    checked={(editedData.dance_skills || []).includes(danse)}
                                    onChange={(e) => handleArrayChange('dance_skills', danse, e.target.checked)}
                                  />
                                  {danse}
                                </label>
                              ))}
                              <label>
                                <input
                                  type="checkbox"
                                  checked={showOtherDance}
                                  onChange={(e) => {
                                    setShowOtherDance(e.target.checked)
                                    if (!e.target.checked) {
                                      setEditedData((prev: any) => ({ ...prev, dance_skills_other: [] }))
                                      setTempDance('')
                                    }
                                  }}
                                />
                                Autre
                              </label>
                            </div>
                          ) : (
                            <>
                              {comedien.dance_skills_normalized.join(', ')}
                              {(editedData.dance_skills_other || []).length > 0 && (
                                <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                                  Autres: {(editedData.dance_skills_other || []).join(', ')}
                                </div>
                              )}
                            </>
                          )}
                          {showOtherDance && isEditing && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Ajouter une compétence de danse"
                                  value={tempDance}
                                  onChange={(e) => setTempDance(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addCustomSkill('dance_skills_other', tempDance, setTempDance)
                                    }
                                  }}
                                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addCustomSkill('dance_skills_other', tempDance, setTempDance)}
                                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #393939', backgroundColor: '#393939', color: 'white', cursor: 'pointer' }}
                                >
                                  Ajouter
                                </button>
                              </div>
                              {(editedData.dance_skills_other || []).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {(editedData.dance_skills_other || []).map((skill: string) => (
                                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '20px', fontSize: '14px' }}>
                                      {skill}
                                      <button
                                        type="button"
                                        onClick={() => removeCustomSkill('dance_skills_other', skill)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </span>
                      </div>
                    )}
                    {((comedien.music_skills_normalized && comedien.music_skills_normalized.length > 0) || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Musique</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <div className="edit-checkbox-group">
                              {['Piano', 'Guitare', 'Violon', 'Batterie', 'Saxophone / Trompette', 'Flûte', 'Autre (à vent)', 'Autre (à cordes)'].map(musique => (
                                <label key={musique}>
                                  <input
                                    type="checkbox"
                                    checked={(editedData.music_skills || []).includes(musique)}
                                    onChange={(e) => handleArrayChange('music_skills', musique, e.target.checked)}
                                  />
                                  {musique}
                                </label>
                              ))}
                              <label>
                                <input
                                  type="checkbox"
                                  checked={showOtherMusic}
                                  onChange={(e) => {
                                    setShowOtherMusic(e.target.checked)
                                    if (!e.target.checked) {
                                      setEditedData((prev: any) => ({ ...prev, music_skills_other: [] }))
                                      setTempMusic('')
                                    }
                                  }}
                                />
                                Autre
                              </label>
                            </div>
                          ) : (
                            <>
                              {comedien.music_skills_normalized.join(', ')}
                              {(editedData.music_skills_other || []).length > 0 && (
                                <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                                  Autres: {(editedData.music_skills_other || []).join(', ')}
                                </div>
                              )}
                            </>
                          )}
                          {showOtherMusic && isEditing && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Ajouter une compétence musicale"
                                  value={tempMusic}
                                  onChange={(e) => setTempMusic(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addCustomSkill('music_skills_other', tempMusic, setTempMusic)
                                    }
                                  }}
                                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addCustomSkill('music_skills_other', tempMusic, setTempMusic)}
                                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #393939', backgroundColor: '#393939', color: 'white', cursor: 'pointer' }}
                                >
                                  Ajouter
                                </button>
                              </div>
                              {(editedData.music_skills_other || []).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {(editedData.music_skills_other || []).map((skill: string) => (
                                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '20px', fontSize: '14px' }}>
                                      {skill}
                                      <button
                                        type="button"
                                        onClick={() => removeCustomSkill('music_skills_other', skill)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </span>
                      </div>
                    )}
                    {((comedien.diverse_skills_normalized && comedien.diverse_skills_normalized.length > 0) || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Compétences</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <div className="edit-checkbox-group">
                              {['Doublage', 'Chant', 'Acrobatie', 'Art martial', 'Equitation', 'Sport de combat'].map(comp => (
                                <label key={comp}>
                                  <input
                                    type="checkbox"
                                    checked={(editedData.diverse_skills || []).includes(comp)}
                                    onChange={(e) => handleArrayChange('diverse_skills', comp, e.target.checked)}
                                  />
                                  {comp}
                                </label>
                              ))}
                              <label>
                                <input
                                  type="checkbox"
                                  checked={showOtherDiverse}
                                  onChange={(e) => {
                                    setShowOtherDiverse(e.target.checked)
                                    if (!e.target.checked) {
                                      setEditedData((prev: any) => ({ ...prev, diverse_skills_other: [] }))
                                      setTempDiverse('')
                                    }
                                  }}
                                />
                                Autre
                              </label>
                            </div>
                          ) : (
                            <>
                              {comedien.diverse_skills_normalized.join(', ')}
                              {(editedData.diverse_skills_other || []).length > 0 && (
                                <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                                  Autres: {(editedData.diverse_skills_other || []).join(', ')}
                                </div>
                              )}
                            </>
                          )}
                          {showOtherDiverse && isEditing && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Ajouter une compétence"
                                  value={tempDiverse}
                                  onChange={(e) => setTempDiverse(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addCustomSkill('diverse_skills_other', tempDiverse, setTempDiverse)
                                    }
                                  }}
                                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addCustomSkill('diverse_skills_other', tempDiverse, setTempDiverse)}
                                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #393939', backgroundColor: '#393939', color: 'white', cursor: 'pointer' }}
                                >
                                  Ajouter
                                </button>
                              </div>
                              {(editedData.diverse_skills_other || []).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {(editedData.diverse_skills_other || []).map((skill: string) => (
                                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f0f0f0', borderRadius: '20px', fontSize: '14px' }}>
                                      {skill}
                                      <button
                                        type="button"
                                        onClick={() => removeCustomSkill('diverse_skills_other', skill)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.website_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Site web</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.website_url || ''} 
                              onChange={(e) => handleFieldChange('website_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.website_url} target="_blank" rel="noopener noreferrer">{comedien.website_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.facebook_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Facebook</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.facebook_url || ''} 
                              onChange={(e) => handleFieldChange('facebook_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://facebook.com/..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.facebook_url} target="_blank" rel="noopener noreferrer">{comedien.facebook_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.imdb_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">IMDb</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.imdb_url || ''} 
                              onChange={(e) => handleFieldChange('imdb_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://imdb.com/..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.imdb_url} target="_blank" rel="noopener noreferrer">{comedien.imdb_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.linkedin_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">LinkedIn</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.linkedin_url || ''} 
                              onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://linkedin.com/..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.linkedin_url} target="_blank" rel="noopener noreferrer">{comedien.linkedin_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.instagram_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Instagram</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.instagram_url || ''} 
                              onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://instagram.com/..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.instagram_url} target="_blank" rel="noopener noreferrer">{comedien.instagram_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.other_profile_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Autre profil</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.other_profile_url || ''} 
                              onChange={(e) => handleFieldChange('other_profile_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.other_profile_url} target="_blank" rel="noopener noreferrer">{comedien.other_profile_url}</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.showreel_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Showreel</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.showreel_url || ''} 
                              onChange={(e) => handleFieldChange('showreel_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.showreel_url} target="_blank" rel="noopener noreferrer">Voir le showreel</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.actor_video1 || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Vidéo 1</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedData.actor_video1 || ''}
                              onChange={(e) => handleFieldChange('actor_video1', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.actor_video1} target="_blank" rel="noopener noreferrer">Voir la vidéo 1</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.actor_video2 || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Vidéo 2</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedData.actor_video2 || ''}
                              onChange={(e) => handleFieldChange('actor_video2', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.actor_video2} target="_blank" rel="noopener noreferrer">Voir la vidéo 2</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.experience_level || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Niveau exp.</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <select 
                              value={editedData.experience_level || ''} 
                              onChange={(e) => handleFieldChange('experience_level', e.target.value)}
                              className="edit-input-inline"
                            >
                              <option value="">Sélectionner votre niveau</option>
                              <option value="Aucune">Aucune expérience</option>
                              <option value="Amateur">Amateur</option>
                              <option value="Etudiant">Étudiant</option>
                              <option value="Semi-professionnel">Semi-professionnel</option>
                              <option value="Professionnel">Professionnel</option>
                            </select>
                          ) : (
                            comedien.experience_level
                          )}
                        </span>
                      </div>
                    )}
                    {comedien.actor_resume && (
                      <div className="key-info-item">
                        <span className="key-info-label">CV</span>
                        <span className="key-info-value">
                          <a href={comedien.actor_resume} target="_blank" rel="noopener noreferrer">Télécharger le CV</a>
                        </span>
                      </div>
                    )}
                    {age && age < 18 && comedien.parental_authorization_url && (
                      <div className="key-info-item">
                        <span className="key-info-label">Autor. parent.</span>
                        <span className="key-info-value">
                          <a href={comedien.parental_authorization_url} target="_blank" rel="noopener noreferrer">Télécharger</a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* === SECTION EXPÉRIENCE (avec fond blanc) === */}
              {(comedien.experience || comedien.wp_experience || isEditing) && (
                <div className="profile-section">
                  <h2>Expérience professionnelle</h2>
                  <div className="text-content">
                    {isEditing ? (
                      <textarea
                        value={editedData.experience || ''}
                        onChange={(e) => handleFieldChange('experience', e.target.value)}
                        className="edit-textarea"
                        rows={8}
                        placeholder="Décrivez votre expérience professionnelle..."
                      />
                    ) : (
                      comedien.experience || comedien.wp_experience
                    )}
                  </div>
                </div>
              )}

              {/* === SECTION FORMATIONS (avec fond blanc) === */}
              {(comedien.certificates || isEditing) && (
                <div className="profile-section">
                  <h2>Formations et diplômes</h2>
                  <div className="text-content">
                    {isEditing ? (
                      <textarea
                        value={editedData.certificates || ''}
                        onChange={(e) => handleFieldChange('certificates', e.target.value)}
                        className="edit-textarea"
                        rows={8}
                        placeholder="Décrivez vos formations et diplômes..."
                      />
                    ) : (
                      comedien.certificates
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </Layout>
  )
}

