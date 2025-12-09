// pages/inscription.tsx
import React, { useState } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/Layout'
import InscriptionFormComplete from '@/components/InscriptionFormComplete'
import type { InscriptionFormData } from '@/types'

const Inscription: React.FC = () => {
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
            <Link href="/connexion" style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Se connecter
            </Link>
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
              <p>Pour vous inscrire, il vous suffit de remplir le formulaire ci-dessous afin de faire partie de notre base de données. Vous ne serez donc pas visible en ligne. Pour l’inscription d’un mineur d’âge, une autorisation parentale signée est obligatoire. Il vous faut, pour cela, télécharger le formulaire lors de l’inscription… et nous le renvoyer dûment signé.
                  <br /> <br />
                  L’expérience professionnelle n’est pas indispensable à l’inscription. 
                  Si vous n’avez jamais joué ou si votre parcours nous semble trop ténu, un test filmé vous sera, au préalable, proposé. 
                  C’est suite à ce test que nous validerons ou non cette inscription.
                  <br />
                  <b><u>Attention : Veuillez n'effectuer aucun paiement avant validation!</u></b>
                  <br />
                  <br />
                  L’inscription est gratuite et ouverte à tous les comédien(ne)s professionnel(le)s ou non, domicilié(e)s en Belgique, à partir de l’âge de 7 ans. 
                  Toutefois, notre site offre également la possibilité de rendre votre profil accessible à tous.tes et pas uniquement en interne. <br /> 
                  Pour cela il vous suffira de virer la somme de 25 euros sur notre numéro de compte BE75 0689 0495 4251. 
                  <br /> Cette participation aux frais est unique. <br />
                  Pour en savoir plus, n’hésitez pas à consulter notre FAQ.
                  <br />
                  <br />
                  Nous attirons votre attention sur la nécessité d’enrichir et de mettre à jour régulièrement votre profil avec des photos récentes et surtout avec une bande démo ou des extraits filmés dès que vous en avez la possibilité. 
                  Les premières sélections se font très souvent sur base de votre matériel. 
                  </p>
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