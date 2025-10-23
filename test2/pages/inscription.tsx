// pages/inscription.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/Layout'
import InscriptionFormComplete from '@/components/InscriptionFormComplete'
import type { InscriptionFormData } from '@/types'

const Inscription: React.FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: InscriptionFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'inscription')
      }

      setSuccess(true)
      setTimeout(() => router.push('/connexion'), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="inscription-success">
          <div className="success-card">
            <h1 className="text-title">✅ Inscription réussie !</h1>
            <p className="text-body">Votre compte a été créé avec succès.</p>
            <p className="text-body"><strong>Important :</strong> Votre profil est en attente de validation par notre équipe.</p>
            <p className="text-body">Vous recevrez un email de confirmation une fois votre profil approuvé.</p>
            <p className="text-body">Redirection vers la page de connexion...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="inscription">
        <div className="inscription__container">
          {/* Section Comment ça fonctionne */}
          <div className="inscription__info-section">
            <div className="hero-content">
              <h2>Comment ça fonctionne ?</h2>
              <p>L’inscription est gratuite et ouverte à tous les comédien(ne)s professionnel(le)s ou non, domicilié(e)s en Belgique, à partir de l’âge de 7 ans. Elle remplace l’envoi des cv’s, bandes démo, photos et facilite grandement l’accès à nos castings. 
                  <br /> <br />
                  Pour vous inscrire, il vous suffit de remplir le formulaire ci-dessous.
                  Pour l’inscription d’un mineur d’âge, une autorisation parentale, signée, est obligatoire. Il vous faut, pour cela, télécharger le formulaire lors de l’inscription… et nous le renvoyer dûment signé.</p>
              <a href="/documents/autorisation-parentale.pdf" download className="download-button">
                <svg className="download-icon" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Autorisation Parentale
              </a>
            </div>
          </div>

          {error && (
            <div className="alert alert--error">
              {error}
            </div>
          )}

          <InscriptionFormComplete 
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Inscription