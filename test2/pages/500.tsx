// pages/500.tsx
import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import logoADK from '../images/Logo-ADK-KASTING.jpeg'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Erreur serveur - ADK-KASTING</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="error-page">
        <div className="error-page__container">
          <img
            className="error_img"
            src={logoADK.src}
            alt="ADK-KASTING"
          />

          <h1 className="error-page__code">500</h1>
          <h2 className="error-page__title">Erreur serveur</h2>
          <p className="error-page__description">
            Une erreur s'est produite sur nos serveurs. Nos équipes ont été notifiées et travaillent à résoudre le problème.
          </p>

          <Link href="/" className="error-page__button">
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F0F0F0;
          padding: 1rem;
        }

        .error-page__container {
          text-align: center;
          max-width: 600px;
          width: 100%;
          background: white;
          padding: 3rem 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .error_img {
          width: 100%;
          max-width: 400px;
          height: auto;
          display: block;
          margin: 0 auto 2rem auto;
        }

        .error-page__logo {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .error-page__code {
          font-size: 8rem;
          font-weight: 700;
          color: #393939;
          margin: 0;
          line-height: 1;
          font-family: 'Inter', sans-serif;
        }

        .error-page__title {
          font-size: 2rem;
          font-weight: 400;
          color: #393939;
          margin: 1rem 0;
          font-family: 'Inter', sans-serif;
        }

        .error-page__description {
          font-size: 1.125rem;
          color: #666;
          margin: 1rem 0 2rem;
          line-height: 1.6;
        }

        .error-page__button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          background: #393939;
          color: white;
          text-decoration: none;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid #393939;
          font-family: 'Inter', sans-serif;
        }

        .error-page__button:hover {
          background: #2a2a2a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .error-page {
            padding: 1rem;
          }

          .error-page__container {
            padding: 2rem 1.5rem;
          }

          .error_img {
            max-width: 300px;
            margin-bottom: 1.5rem;
          }

          .error-page__code {
            font-size: 5rem;
          }

          .error-page__title {
            font-size: 1.5rem;
          }

          .error-page__description {
            font-size: 1rem;
          }

          .error-page__button {
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .error-page {
            padding: 0.5rem;
          }

          .error-page__container {
            padding: 1.5rem 1rem;
          }

          .error_img {
            max-width: 250px;
            margin-bottom: 1rem;
          }

          .error-page__code {
            font-size: 4rem;
          }

          .error-page__title {
            font-size: 1.25rem;
          }

          .error-page__description {
            font-size: 0.9rem;
            margin: 0.75rem 0 1.5rem;
          }

          .error-page__button {
            padding: 10px 18px;
            font-size: 0.85rem;
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </>
  )
}
