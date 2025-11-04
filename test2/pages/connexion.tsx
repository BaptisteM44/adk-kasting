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