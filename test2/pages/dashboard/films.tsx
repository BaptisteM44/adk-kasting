// pages/dashboard/films.tsx
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Layout } from '@/components/Layout'
import { useAuth } from '@/components/AuthProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface Film {
  id: string
  title: string
  year: number
  image_url: string
  show_in_hero: boolean
  show_in_collaborations: boolean
  hero_order: number
  collaboration_order: number
  is_active: boolean
  created_at: string
}

export default function DashboardFilmsPage() {
  return (
    <Layout showPageTitle={false}>
      <AuthGuard requireAuth>
        <DashboardFilmsContent />
      </AuthGuard>
    </Layout>
  )
}

function DashboardFilmsContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingFilm, setEditingFilm] = useState<Film | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    image_url: '',
    show_in_hero: false,
    show_in_collaborations: false,
    hero_order: 0,
    collaboration_order: 0
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchFilms()
    }
  }, [user])

  const fetchFilms = async () => {
    try {
      const response = await fetch('/api/admin/films')
      const data = await response.json()

      if (response.ok) {
        setFilms(data.films || [])
      }
    } catch (error) {
      console.error('Erreur chargement films:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valider la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      setMessage(`Erreur: Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum: 5 MB`)
      return
    }

    setUploadingImage(true)
    setMessage('Conversion en WebP et upload en cours...')

    try {
      // Créer FormData avec le fichier
      const formData = new FormData()
      formData.append('image', file)

      // Envoyer vers l'API de conversion
      const response = await fetch('/api/admin/upload-film-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload')
      }

      // Mettre à jour l'URL de l'image
      setFormData(prev => ({ ...prev, image_url: result.data.url }))

      // Afficher un message de succès avec les détails de la compression
      const originalSizeMB = (result.data.originalSize / 1024 / 1024).toFixed(2)
      const newSizeKB = (result.data.newSize / 1024).toFixed(2)
      setMessage(
        `✅ Image convertie en WebP avec succès!\n` +
        `Taille originale: ${originalSizeMB} MB → ${newSizeKB} KB (-${result.data.reduction}%)\n` +
        `Dimensions: ${result.data.width}x${result.data.height}px`
      )
    } catch (error: any) {
      setMessage('❌ Erreur upload image: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const method = editingFilm ? 'PUT' : 'POST'
      const body = editingFilm
        ? { ...formData, id: editingFilm.id }
        : formData

      const response = await fetch('/api/admin/films', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setShowModal(false)
        setEditingFilm(null)
        resetForm()
        await fetchFilms()
      } else {
        setMessage('Erreur: ' + data.message)
      }
    } catch (error: any) {
      setMessage('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce film ?')) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/films', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        await fetchFilms()
      } else {
        setMessage('Erreur: ' + data.message)
      }
    } catch (error: any) {
      setMessage('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (film: Film) => {
    setEditingFilm(film)
    setFormData({
      title: film.title,
      year: film.year,
      image_url: film.image_url,
      show_in_hero: film.show_in_hero,
      show_in_collaborations: film.show_in_collaborations,
      hero_order: film.hero_order || 0,
      collaboration_order: film.collaboration_order || 0
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      image_url: '',
      show_in_hero: false,
      show_in_collaborations: false,
      hero_order: 0,
      collaboration_order: 0
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingFilm(null)
    resetForm()
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion des Films - ADK</title>
      </Head>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Gestion des Films</h1>
          <Button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#393939',
              color: 'white',
              border: '1px solid #393939',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            + Ajouter un film
          </Button>
        </div>

        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.includes('Erreur') ? '#fee' : '#efe',
            border: '1px solid ' + (message.includes('Erreur') ? '#e74c3c' : '#0070f3'),
            color: message.includes('Erreur') ? '#e74c3c' : '#0070f3'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gap: '15px' }}>
          {films.map((film) => (
            <div
              key={film.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fff',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
              }}
            >
              {film.image_url && (
                <img
                  src={film.image_url}
                  alt={film.title}
                  style={{
                    width: '120px',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3>{film.title} ({film.year})</h3>
                <p>
                  <strong>Affichage:</strong>{' '}
                  {film.show_in_hero && `🎬 Hero (ordre: ${film.hero_order})`}{' '}
                  {film.show_in_hero && film.show_in_collaborations && '|'}{' '}
                  {film.show_in_collaborations && `🤝 Collaborations (ordre: ${film.collaboration_order})`}
                  {!film.show_in_hero && !film.show_in_collaborations && '❌ Nulle part'}
                </p>
                <p><strong>Statut:</strong> {film.is_active ? '✅ Actif' : '❌ Inactif'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <Button
                  onClick={() => openEditModal(film)}
                  disabled={loading}
                  style={{
                    backgroundColor: 'white',
                    color: '#393939',
                    border: '1px solid #E5E5E5',
                    minWidth: '100px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}
                >
                  ✏️ Modifier
                </Button>
                <Button
                  onClick={() => handleDelete(film.id)}
                  disabled={loading}
                  style={{
                    backgroundColor: 'white',
                    color: '#d32f2f',
                    border: '1px solid #d32f2f',
                    minWidth: '100px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </div>
          ))}

          {films.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              Aucun film enregistré
            </p>
          )}
        </div>

        {/* Modal Ajout/Édition */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2>{editingFilm ? 'Modifier le film' : 'Ajouter un film'}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Année *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    min="1900"
                    max="2100"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ marginBottom: '10px' }}
                  />
                  {uploadingImage && <p>Upload en cours...</p>}
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      style={{
                        width: '200px',
                        height: 'auto',
                        borderRadius: '4px',
                        marginTop: '10px'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Ordre Hero</label>
                    <input
                      type="number"
                      value={formData.hero_order}
                      onChange={(e) => setFormData({ ...formData, hero_order: parseInt(e.target.value) })}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>Pour le carousel de la page d'accueil</small>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Ordre Collaborations</label>
                    <input
                      type="number"
                      value={formData.collaboration_order}
                      onChange={(e) => setFormData({ ...formData, collaboration_order: parseInt(e.target.value) })}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>Pour la section Collaborations</small>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.show_in_hero}
                      onChange={(e) => setFormData({ ...formData, show_in_hero: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Afficher dans le carousel Hero (page d'accueil)
                  </label>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.show_in_collaborations}
                      onChange={(e) => setFormData({ ...formData, show_in_collaborations: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Afficher dans la section Collaborations
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    style={{
                      backgroundColor: 'white',
                      color: '#393939',
                      border: '1px solid #E5E5E5',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontWeight: 500
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.image_url}
                    style={{
                      backgroundColor: '#393939',
                      color: 'white',
                      border: '1px solid #393939',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontWeight: 500
                    }}
                  >
                    {loading ? 'Enregistrement...' : editingFilm ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
