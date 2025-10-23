import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { normalizeComedienData } from '../../lib/wordpress-compat'
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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
      console.log('🔍 DEBUG languages:', {
        languages: data.languages,
        languages_fluent: data.languages_fluent,
        type_languages: typeof data.languages,
        type_languages_fluent: typeof data.languages_fluent
      })
      
      // Normaliser les données WordPress sérialisées
      const normalized = normalizeComedienData(data)
      console.log('🔍 DEBUG normalized:', normalized.languages_fluent_normalized)
      setComedien(normalized)
      setEditedData(normalized) // Initialiser les données éditables
      setAdminComment(data.admin_comment || '')
      
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
      const { error } = await supabase
        .from('comediens')
        .update({ admin_comment: adminComment })
        .eq('id', id)
      
      if (error) throw error
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
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() // Empêcher le scroll
    if (!canEdit) return
    
    try {
      setLoading(true)
      
      const formData = editedData
      
      // Préparer TOUTES les données à sauvegarder (tous les champs du formulaire)
      const dataToSave: any = {
        // Informations générales
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date,
        gender: formData.gender,
        nationality: formData.nationality,
        
        // Coordonnées
        phone: formData.phone,
        email: formData.email,
        domiciliation: formData.domiciliation,
        street: formData.street,
        zip_code: formData.zip_code,
        city: formData.city,
        country: formData.country,
        
        // Caractéristiques physiques
        height: formData.height,
        build: formData.build,
        ethnicity: formData.ethnicity,
        hair_color: formData.hair_color,
        eye_color: formData.eye_color,
        
        // Langues
        native_language: formData.native_language,
        languages_fluent: formData.languages_fluent,
        languages_notions: formData.languages_notions,
        
        // Compétences
        driving_licenses: formData.driving_licenses,
        dance_skills: formData.dance_skills,
        music_skills: formData.music_skills,
        diverse_skills: formData.diverse_skills,
        
        // Agent
        agency_name: formData.agency_name,
        agent_name: formData.agent_name,
        agent_email: formData.agent_email,
        agent_phone: formData.agent_phone,
        agency_name_2: formData.agency_name_2,
        agent_name_2: formData.agent_name_2,
        agent_email_2: formData.agent_email_2,
        agent_phone_2: formData.agent_phone_2,
        
        // Réseaux sociaux
        website_url: formData.website_url,
        facebook_url: formData.facebook_url,
        imdb_url: formData.imdb_url,
        linkedin_url: formData.linkedin_url,
        other_profile_url: formData.other_profile_url,
        
        // Vidéos
        showreel_url: formData.showreel_url,
        video_1_url: formData.video_1_url,
        video_2_url: formData.video_2_url,
        
        // Expérience
        experience_level: formData.experience_level,
        desired_activities: formData.desired_activities,
        professional_experience: formData.professional_experience,
        training_diplomas: formData.training_diplomas,
      }
      
      const { error } = await supabase
        .from('comediens')
        .update(dataToSave)
        .eq('id', id)
      
      if (error) throw error
      
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
    setEditedData((prev: any) => {
      const currentArray = prev[field] || []
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter((item: string) => item !== value) }
      }
    })
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
      const currentPhotos = comedien.photos_normalized || []
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
      const currentPhotos = comedien.photos_normalized || []
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
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
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
  
  // Utiliser les photos normalisées et filtrer les URLs invalides + exclure les photos WordPress
  const photos = (comedien.photos_normalized || []).filter((photo: string) => 
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
                  {(comedien.cv_pdf_url || comedien.actor_resume) && (
                    <a 
                      href={comedien.cv_pdf_url || comedien.actor_resume} 
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
                        const { generateComedienPDF } = await import('../../lib/pdf-simple');
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
                    <span className="key-info-label">Âge</span>
                    <span className="key-info-value">{age ? `${age} ans` : 'Non spécifié'}</span>
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
                      </div>
                    ) : (
                      comedien.desired_activities_normalized && comedien.desired_activities_normalized.length > 0
                        ? comedien.desired_activities_normalized.join(', ')
                        : 'Non spécifié'
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
                            <option value="Chatain">Chatain clair</option>
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
                                if (e.target.value && !(editedData.languages_fluent || []).includes(e.target.value)) {
                                  handleFieldChange('languages_fluent', [...(editedData.languages_fluent || []), e.target.value]);
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
                            {(editedData.languages_fluent || []).length > 0 && (
                              <div className="edit-checkbox-group" style={{ marginTop: '8px' }}>
                                {(editedData.languages_fluent || []).map((lang: string) => (
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
                                        const newLangs = (editedData.languages_fluent || []).filter((l: string) => l !== lang);
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
                                if (e.target.value && !(editedData.languages_notions || []).includes(e.target.value)) {
                                  handleFieldChange('languages_notions', [...(editedData.languages_notions || []), e.target.value]);
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
                            {(editedData.languages_notions || []).length > 0 && (
                              <div className="edit-checkbox-group" style={{ marginTop: '8px' }}>
                                {(editedData.languages_notions || []).map((lang: string) => (
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
                                        const newLangs = (editedData.languages_notions || []).filter((l: string) => l !== lang);
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
                            </div>
                          ) : (
                            comedien.dance_skills_normalized.join(', ')
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
                            </div>
                          ) : (
                            comedien.music_skills_normalized.join(', ')
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
                              {['Doublage', 'Chant', 'Acrobatie', 'Arts martial', 'Equitation', 'Sport de combat'].map(comp => (
                                <label key={comp}>
                                  <input 
                                    type="checkbox" 
                                    checked={(editedData.diverse_skills || []).includes(comp)}
                                    onChange={(e) => handleArrayChange('diverse_skills', comp, e.target.checked)}
                                  />
                                  {comp}
                                </label>
                              ))}
                            </div>
                          ) : (
                            comedien.diverse_skills_normalized.join(', ')
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
                    {(comedien.video_1_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Vidéo 1</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.video_1_url || ''} 
                              onChange={(e) => handleFieldChange('video_1_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.video_1_url} target="_blank" rel="noopener noreferrer">Voir la vidéo 1</a>
                          )}
                        </span>
                      </div>
                    )}
                    {(comedien.video_2_url || isEditing) && (
                      <div className="key-info-item">
                        <span className="key-info-label">Vidéo 2</span>
                        <span className="key-info-value">
                          {isEditing ? (
                            <input 
                              type="url" 
                              value={editedData.video_2_url || ''} 
                              onChange={(e) => handleFieldChange('video_2_url', e.target.value)}
                              className="edit-input-inline"
                              placeholder="https://..."
                              style={{ minWidth: '250px' }}
                            />
                          ) : (
                            <a href={comedien.video_2_url} target="_blank" rel="noopener noreferrer">Voir la vidéo 2</a>
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
                    {comedien.cv_pdf_url && (
                      <div className="key-info-item">
                        <span className="key-info-label">CV</span>
                        <span className="key-info-value">
                          <a href={comedien.cv_pdf_url} target="_blank" rel="noopener noreferrer">Télécharger le CV</a>
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
              {(comedien.professional_experience || comedien.experience || comedien.wp_experience || isEditing) && (
                <div className="profile-section">
                  <h2>Expérience professionnelle</h2>
                  <div className="text-content">
                    {isEditing ? (
                      <textarea 
                        value={editedData.professional_experience || ''} 
                        onChange={(e) => handleFieldChange('professional_experience', e.target.value)}
                        className="edit-textarea"
                        rows={8}
                        placeholder="Décrivez votre expérience professionnelle..."
                      />
                    ) : (
                      comedien.professional_experience || comedien.experience || comedien.wp_experience
                    )}
                  </div>
                </div>
              )}

              {/* === SECTION FORMATIONS (avec fond blanc) === */}
              {(comedien.training_diplomas || comedien.certificates || isEditing) && (
                <div className="profile-section">
                  <h2>Formations et diplômes</h2>
                  <div className="text-content">
                    {isEditing ? (
                      <textarea 
                        value={editedData.training_diplomas || ''} 
                        onChange={(e) => handleFieldChange('training_diplomas', e.target.value)}
                        className="edit-textarea"
                        rows={8}
                        placeholder="Décrivez vos formations et diplômes..."
                      />
                    ) : (
                      comedien.training_diplomas || comedien.certificates
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

