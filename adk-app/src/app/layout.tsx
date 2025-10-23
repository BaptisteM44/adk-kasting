import { Navbar } from '@/app/components/Navbar'
import './globals.css'

export const metadata = {
  title: 'ADK Casting - Agence de comédiens',
  description: 'Découvrez nos comédiens professionnels et trouvez le talent parfait pour vos projets.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 ADK Casting. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
