import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/Layout'
import { useAuth } from '@/components/AuthProvider'
import { AuthGuard } from '@/components/AuthGuard'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import type { Comedien } from '@/types'

interface AdminComment {
  id: string
  comedien_id: string
  admin_name: string
  comment: string
  created_at: string
}

interface ComedienWithComments extends Comedien {
  admin_comments?: AdminComment[]
}

// Composant StatusBadge pour afficher le statut
const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    published: { bg: '#22c55e', text: '#fff' },      // Vert - Payé et public
    approved: { bg: '#3b82f6', text: '#fff' },       // Bleu - Validé mais non payé
    pending: { bg: '#f59e0b', text: '#fff' },        // Orange - En attente de validation
    trash: { bg: '#ef4444', text: '#fff' }           // Rouge - Supprimé
  }
  const labels = {
    published: 'Publié (payé)',
    approved: 'Validé (non payé)',
    pending: 'En attente',
    trash: 'Supprimé'
  }
  const color = colors[status as keyof typeof colors] || colors.pending

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: color.bg,
      color: color.text,
      display: 'inline-block'
    }}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

export default function DashboardPage() {
  return (
    <Layout showPageTitle={false}>
      <AuthGuard requireAuth>
        <DashboardContent />
      </AuthGuard>
    </Layout>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pendingComediens, setPendingComediens] = useState<ComedienWithComments[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingComediens()
    }
  }, [user, statusFilter])

  const fetchPendingComediens = async () => {
    try {
      // Utilise l'API qui contourne RLS avec service_role key
      const params = new URLSearchParams({
        include_all_statuses: 'true',
        status: statusFilter || 'pending',
        limit: '1000' // Charger tous les profils avec ce statut
      })
      const response = await fetch(`/api/comediens?${params}`)
      const json = await response.json()

      if (json.message) throw new Error(json.message)
      setPendingComediens(json.data || [])
    } catch (error: any) {
      console.error('Erreur chargement profils:', error)
    }
  }

  const handleStatusChange = async (comedienId: string, newStatus: string) => {
    const confirmMessages = {
      published: 'Voulez-vous vraiment marquer ce profil comme PAYÉ et le rendre public ?',
      approved: 'Voulez-vous vraiment VALIDER ce profil ? (Il restera non public jusqu\'au paiement)',
      pending: 'Voulez-vous vraiment remettre ce profil EN ATTENTE de validation ?',
      trash: 'Voulez-vous vraiment SUPPRIMER ce profil ?'
    }

    if (!confirm(confirmMessages[newStatus as keyof typeof confirmMessages])) return

    setLoading(true)
    try {
      const response = await fetch(`/api/comediens/${comedienId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isAdmin: true })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du changement de statut')
      }

      const data = await response.json()
      setMessage(data.message || 'Statut modifié avec succès !')

      // Switcher automatiquement au filtre correspondant au nouveau statut
      setStatusFilter(newStatus)
    } catch (error: any) {
      setMessage('Erreur: ' + error.message)
      console.error('Erreur changement statut:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  // Rediriger les non-admins
  if (user.role !== 'admin') {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    )
  }

  const messageStyle = {
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    backgroundColor: message.includes('Erreur') ? '#fee' : '#efe',
    border: '1px solid ' + (message.includes('Erreur') ? '#e74c3c' : '#0070f3'),
    color: message.includes('Erreur') ? '#e74c3c' : '#0070f3'
  }

  return (
    <>
      <Head>
        <title>Validation des inscriptions - ADK</title>
      </Head>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Dashboard Admin</h1>
          <Link href="/dashboard/films">
            <Button style={{
              backgroundColor: '#393939',
              color: 'white',
              border: '1px solid #393939',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 500
            }}>
              🎬 Gérer les Films
            </Button>
          </Link>
        </div>

        {message && <div style={messageStyle}>{message}</div>}

        <div style={{ marginBottom: '40px', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>
              {statusFilter === 'pending' && `Inscriptions en attente (${pendingComediens.length})`}
              {statusFilter === 'approved' && `Profils validés non payés (${pendingComediens.length})`}
              {statusFilter === 'published' && `Profils publiés (${pendingComediens.length})`}
              {statusFilter === 'trash' && `Profils supprimés (${pendingComediens.length})`}
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="pending">En attente de validation</option>
              <option value="approved">Validés (non payés)</option>
              <option value="published">Publiés (payés)</option>
              <option value="trash">Supprimés</option>
            </select>
          </div>
          {pendingComediens.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              {statusFilter === 'pending' && 'Aucune inscription en attente'}
              {statusFilter === 'approved' && 'Aucun profil validé en attente de paiement'}
              {statusFilter === 'published' && 'Aucun profil publié'}
              {statusFilter === 'trash' && 'Aucun profil supprimé'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingComediens.map((comedien) => (
                <div
                  key={comedien.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>{comedien.first_name} {comedien.last_name}</h3>
                        <StatusBadge status={comedien.status} />
                      </div>
                      <p><strong>Email:</strong> {comedien.email}</p>
                      <p><strong>Téléphone:</strong> {comedien.phone}</p>
                      <p><strong>Date de naissance:</strong> {comedien.birth_date ? new Date(comedien.birth_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Taille:</strong> {comedien.height ? `${comedien.height} cm` : 'N/A'}</p>
                      <p><strong>Cheveux:</strong> {comedien.hair_color || 'N/A'}</p>
                      <p><strong>Yeux:</strong> {comedien.eye_color || 'N/A'}</p>
                      <p><strong>Inscription:</strong> {new Date(comedien.created_at).toLocaleDateString()}</p>
                      
                      {comedien.admin_comments && comedien.admin_comments.length > 0 && (
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '10px', 
                          backgroundColor: '#fff3cd', 
                          border: '1px solid #ffc107',
                          borderRadius: '4px'
                        }}>
                          <strong>Notes admin:</strong>
                          {comedien.admin_comments.map((comment) => (
                            <div key={comment.id} style={{ marginTop: '5px', fontSize: '14px' }}>
                              <span style={{ color: '#856404' }}>
                                {comment.comment}
                              </span>
                              <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                                - {comment.admin_name} ({new Date(comment.created_at).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      <Button
                        onClick={() => handleStatusChange(comedien.id, 'published')}
                        disabled={loading || comedien.status === 'published'}
                        style={{
                          backgroundColor: comedien.status === 'published' ? '#ddd' : '#22c55e',
                          color: 'white',
                          border: '1px solid ' + (comedien.status === 'published' ? '#ddd' : '#22c55e'),
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: comedien.status === 'published' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ✓ Publier (payé)
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comedien.id, 'approved')}
                        disabled={loading || comedien.status === 'approved'}
                        style={{
                          backgroundColor: comedien.status === 'approved' ? '#ddd' : '#3b82f6',
                          color: 'white',
                          border: '1px solid ' + (comedien.status === 'approved' ? '#ddd' : '#3b82f6'),
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: comedien.status === 'approved' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        👍 Valider
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comedien.id, 'pending')}
                        disabled={loading || comedien.status === 'pending'}
                        style={{
                          backgroundColor: comedien.status === 'pending' ? '#ddd' : '#f59e0b',
                          color: 'white',
                          border: '1px solid ' + (comedien.status === 'pending' ? '#ddd' : '#f59e0b'),
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: comedien.status === 'pending' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ⏸ En attente
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comedien.id, 'trash')}
                        disabled={loading || comedien.status === 'trash'}
                        style={{
                          backgroundColor: comedien.status === 'trash' ? '#ddd' : 'white',
                          color: comedien.status === 'trash' ? '#999' : '#d32f2f',
                          border: '1px solid #d32f2f',
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          cursor: comedien.status === 'trash' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        🗑 Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
