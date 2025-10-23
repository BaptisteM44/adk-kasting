'use client'

export function ProfileActions() {
  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Lien copié dans le presse-papiers !')
  }

  return (
    <div className="mt-12 text-center space-x-4 print:hidden">
      <a 
        href="/comediens" 
        className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
      >
        ← Retour à la liste
      </a>
      
      <button 
        onClick={handlePrint}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        🖨️ Imprimer le profil
      </button>
      
      <button 
        onClick={handleShare}
        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
      >
        🔗 Partager
      </button>
    </div>
  )
}
