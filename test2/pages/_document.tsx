// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Meta tags par défaut */}
        <meta name="apple-mobile-web-app-title" content="ADK-KASTING" />
        <meta name="description" content="ADK-KASTING - Plateforme de casting professionnel" />
        <meta name="keywords" content="casting, comédiens, acteurs, cinéma, théâtre, Belgique, Bruxelles" />
        <meta name="author" content="ADK-KASTING" />

        {/* Theme color */}
        <meta name="theme-color" content="#393939" />
        <meta name="msapplication-TileColor" content="#393939" />

        {/* Sécurité */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
