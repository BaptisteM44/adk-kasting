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

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingComediens()
    }
  }, [user])

  const fetchPendingComediens = async () => {
    try {
      const { data, error } = await supabase
        .from('comediens')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingComediens(data || [])
    } catch (error: any) {
      console.error('Erreur chargement inscriptions en attente:', error)
    }
  }

  const validateComedien = async (comedienId: string) => {
    if (!confirm('Voulez-vous vraiment valider cette inscription ?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('comediens')
        .update({ is_active: true })
        .eq('id', comedienId)

      if (error) throw error

      setMessage('Comédien validé avec succès !')
      await fetchPendingComediens()
    } catch (error: any) {
      setMessage('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const rejectComedien = async (comedienId: string) => {
    if (!confirm('Voulez-vous vraiment rejeter et supprimer cette inscription ?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('comediens')
        .delete()
        .eq('id', comedienId)

      if (error) throw error

      setMessage('Inscription rejetée et supprimée')
      await fetchPendingComediens()
    } catch (error: any) {
      setMessage('Erreur: ' + error.message)
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
          <h2>Inscriptions en attente ({pendingComediens.length})</h2>
          {pendingComediens.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune inscription en attente</p>
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
                      <h3>{comedien.first_name} {comedien.last_name}</h3>
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
                        onClick={() => validateComedien(comedien.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: '#393939',
                          color: 'white',
                          border: '1px solid #393939',
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500
                        }}
                      >
                        ✓ Valider
                      </Button>
                      <Button
                        onClick={() => rejectComedien(comedien.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: 'white',
                          color: '#d32f2f',
                          border: '1px solid #d32f2f',
                          minWidth: '120px',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: 500
                        }}
                      >
                        ✕ Rejeter
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
