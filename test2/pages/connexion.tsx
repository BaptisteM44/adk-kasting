// pages/connexion.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Layout } from '@/components/Layout'
import { useAuth } from '@/components/AuthProvider'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const Connexion: React.FC = () => {
  const router = useRouter()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn(formData.email, formData.password)
      
      if (result.success) {
        // Récupérer l'ID du comédien et rediriger vers son profil
        const response = await fetch('/api/comediens')
        if (response.ok) {
          const data = await response.json()
          // Chercher le comédien correspondant à l'email de l'utilisateur
          const comedien = data.data?.find((c: any) => c.email === formData.email)
          
          if (comedien) {
            router.push(`/comediens/${comedien.id}`)
          } else {
            // Si pas de profil comédien trouvé, rediriger vers la page d'accueil
            router.push('/')
          }
        } else {
          // Fallback vers la page d'accueil en cas d'erreur
          router.push('/')
        }
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="connexion">
        <div className="connexion__container">
          <div className="connexion__card">
            <h1 className="text-title">Connexion</h1>
            
            <form onSubmit={handleSubmit} className="connexion__form">
              {error && (
                <div className="alert alert--error">
                  {error}
                </div>
              )}

              <div className="form-group">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  placeholder="Votre mot de passe"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn--primary btn--large btn--full-width"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="connexion__links">
              <p>
                Pas encore de compte ?{' '}
                <Link href="/inscription" className="link--primary">
                  S'inscrire
                </Link>
              </p>
              <p>
                <Link href="/reset-password" className="link--secondary">
                  Mot de passe oublié ?
                </Link>
              </p>
            </div>

            <div className="connexion__info">
              <h3 className="text-body">Informations importantes :</h3>
              <ul>
                <li className="text-body">Votre profil doit être validé par notre équipe avant d'être publié</li>
                <li className="text-body">Les admins peuvent accéder au dashboard de gestion</li>
                <li className="text-body">Les comédiens peuvent modifier leur profil une fois connectés</li>
              </ul>
            </div>

            <div className="connexion__status">
              <div className="alert alert--warning">
                <h4 className="text-body">⚠️ Système d'authentification en cours de finalisation</h4>
                <p className="text-body">La base de données nécessite une mise à jour pour activer l'inscription et la connexion.</p>
                <p className="text-body">Consultez le fichier <code>setup-database.sh</code> pour les instructions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .connexion {
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 2rem 0;
        }

        .connexion__container {
          max-width: 500px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .connexion__card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .connexion__card h1 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .connexion__form {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .connexion__links {
          text-align: center;
          margin-bottom: 2rem;
        }

        .connexion__links p {
          margin-bottom: 0.5rem;
        }

        .link--primary {
          color: #0070f3;
          text-decoration: none;
          font-weight: 500;
        }

        .link--secondary {
          color: #666;
          text-decoration: none;
        }

        .connexion__info {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .connexion__info h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .connexion__info ul {
          list-style: none;
          padding: 0;
        }

        .connexion__info li {
          padding: 0.25rem 0;
          padding-left: 1rem;
          position: relative;
        }

        .connexion__info li:before {
          content: "•";
          color: #0070f3;
          position: absolute;
          left: 0;
        }

        .connexion__status {
          margin-top: 1rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert--error {
          background-color: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .alert--warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .alert h4 {
          margin: 0 0 0.5rem 0;
        }

        .alert p {
          margin: 0.5rem 0;
        }

        .alert code {
          background: rgba(0,0,0,0.1);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .connexion__container {
            max-width: 100%;
          }
          
          .connexion__card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export default Connexion