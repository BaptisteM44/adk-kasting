// pages/_app.tsx
import React from 'react'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/components/AuthProvider'
import '@/styles/globals.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp
