'use client'
import { useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo ou nom du site */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              ADK Casting
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/comediens" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Nos comédien-nes
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              À propos
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              FAQ
            </Link>
          </div>

          {/* Boutons d'actions desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/inscription"
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
            >
              Inscrivez-vous
            </Link>
            <Link
              href="/connexion"
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
            >
              Se connecter
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/comediens" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Nos comédien-nes
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                href="/faq" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  href="/inscription"
                  className="block w-full text-center px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscrivez-vous
                </Link>
                <Link
                  href="/connexion"
                  className="block w-full text-center px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
