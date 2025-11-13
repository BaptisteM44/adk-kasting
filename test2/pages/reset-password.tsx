import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ResetPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse.')
        setTimeout(() => router.push('/connexion'), 3000)
      } else {
        setError(data.message || 'Une erreur est survenue')
      }
    } catch (err: any) {
      setError('Impossible de se connecter au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Réinitialiser le mot de passe - ADK Kasting</title>
      </Head>

      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          Mot de passe oublié ?
        </h1>

        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ marginBottom: '30px', color: '#666', textAlign: 'center' }}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="votre@email.com"
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                color: '#c00',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{
                padding: '12px',
                background: '#efe',
                border: '1px solid #cfc',
                borderRadius: '4px',
                color: '#070',
                marginBottom: '20px'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="/connexion"
                style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        input:focus {
          outline: none;
          border-color: #000;
        }
        button:hover:not(:disabled) {
          background: #333;
        }
        a:hover {
          color: #000;
        }
      `}</style>
    </Layout>
  )
}
