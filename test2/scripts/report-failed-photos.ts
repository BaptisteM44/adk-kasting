/**
 * Script pour générer un rapport des photos WordPress qui ont échoué
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Charger les variables d'environnement
const envPath = path.join(__dirname, '..', '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface FailedPhoto {
  comedienId: string
  comedienName: string
  photoUrl: string
  index: number
}

async function generateReport() {
  console.log('\n🔍 Recherche des comédiens avec photos WordPress...\n')

  const { data: comediens, error } = await supabase
    .from('comediens')
    .select('id, first_name, last_name, photos')
    .not('photos', 'is', null)

  if (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }

  const failedPhotos: FailedPhoto[] = []
  let totalWordpressUrls = 0

  for (const comedien of comediens) {
    if (!comedien.photos) continue

    const wpPhotos = comedien.photos.filter((photo: string) =>
      photo && (photo.includes('wp-content') || photo.includes('adk-kasting.com/wp-content'))
    )

    totalWordpressUrls += wpPhotos.length

    wpPhotos.forEach((url: string, index: number) => {
      failedPhotos.push({
        comedienId: comedien.id,
        comedienName: `${comedien.first_name || ''} ${comedien.last_name || ''}`.trim(),
        photoUrl: url,
        index: index + 1
      })
    })
  }

  console.log(`\n📊 Résultats :`)
  console.log(`   - Comédiens avec photos WordPress : ${failedPhotos.length > 0 ? Math.ceil(failedPhotos.length / 4) : 0}`)
  console.log(`   - Total URLs WordPress restantes : ${totalWordpressUrls}`)
  console.log(`   - Taux d'échec : ${((totalWordpressUrls / 33814) * 100).toFixed(2)}%\n`)

  if (failedPhotos.length === 0) {
    console.log('✨ Aucune photo WordPress restante !\n')
    return
  }

  // Générer le rapport CSV
  const csvHeader = 'Comédien,ID,Photo URL,Index\n'
  const csvRows = failedPhotos.map(p => 
    `"${p.comedienName}","${p.comedienId}","${p.photoUrl}",${p.index}`
  ).join('\n')

  const csvContent = csvHeader + csvRows
  const reportPath = path.join(__dirname, '..', 'logs', 'failed-photos-report.csv')

  fs.writeFileSync(reportPath, csvContent, 'utf-8')

  console.log(`✅ Rapport généré : ${reportPath}\n`)

  // Afficher quelques exemples
  console.log('📋 Exemples de photos échouées :\n')
  failedPhotos.slice(0, 10).forEach(p => {
    console.log(`   👤 ${p.comedienName}`)
    console.log(`      ${p.photoUrl}\n`)
  })

  if (failedPhotos.length > 10) {
    console.log(`   ... et ${failedPhotos.length - 10} autres (voir le rapport CSV)\n`)
  }
}

generateReport().catch(console.error)
