import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function NewPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setTokenValid(true)
      } else {
        setError('Ce lien est invalide ou a expiré.')
      }
    } catch (err) {
      setError('Erreur de validation du lien.')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Votre mot de passe a été modifié avec succès !')
        setTimeout(() => router.push('/connexion'), 2000)
      } else {
        setError(data.message || 'Erreur lors de la modification du mot de passe')
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Validation du lien...</p>
        </div>
      </Layout>
    )
  }

  if (!tokenValid) {
    return (
      <Layout>
        <div style={{ maxWidth: '500px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Lien invalide</h1>
          <p style={{ color: '#c00', marginBottom: '30px' }}>{error}</p>
          <a href="/reset-password" style={{ color: '#000', textDecoration: 'underline' }}>
            Demander un nouveau lien
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Nouveau mot de passe - ADK Kasting</title>
      </Head>

      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          Nouveau mot de passe
        </h1>

        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Confirmez votre mot de passe"
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
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Modification en cours...' : 'Modifier mon mot de passe'}
            </button>
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
      `}</style>
    </Layout>
  )
}
