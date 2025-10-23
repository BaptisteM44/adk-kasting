/**
 * Script de réessai pour les photos WordPress qui ont échoué lors de la migration
 * 
 * Ce script :
 * 1. Trouve tous les comédiens avec encore des URLs WordPress
 * 2. Réessaye de migrer uniquement ces photos
 * 3. Fait plusieurs tentatives avec délai pour les erreurs 503
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Charger les variables d'environnement depuis .env.local
const envPath = path.join(__dirname, '..', '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Comedien {
  id: string;
  first_name: string;
  last_name: string;
  photos: string[];
}

// Configuration
const MAX_RETRIES = 3; // Nombre de tentatives par photo
const RETRY_DELAY = 2000; // Délai entre les tentatives (ms)
const PAUSE_BETWEEN_PHOTOS = 100; // Pause entre chaque photo
const PAUSE_BETWEEN_COMEDIENS = 500; // Pause entre chaque comédien

let stats = {
  comediensTotal: 0,
  comediensTraites: 0,
  photosWordpressTrouvees: 0,
  photosMigrees: 0,
  photosEchecs: 0,
  photosDejaSupabase: 0
};

/**
 * Télécharge une image depuis une URL
 */
async function downloadImage(url: string, retryCount = 0): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    if (!response.ok) {
      if (response.status === 503 && retryCount < MAX_RETRIES) {
        console.log(`    ⏳ HTTP 503, réessai ${retryCount + 1}/${MAX_RETRIES} dans ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return downloadImage(url, retryCount + 1);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.buffer();
    return buffer;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES && (error.message.includes('timeout') || error.message.includes('ECONNRESET'))) {
      console.log(`    ⏳ Erreur réseau, réessai ${retryCount + 1}/${MAX_RETRIES} dans ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return downloadImage(url, retryCount + 1);
    }
    return null;
  }
}

/**
 * Upload une image vers Supabase Storage
 */
async function uploadToSupabase(
  comedienId: string,
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('comedien-photos')
      .upload(`${comedienId}/${filename}`, buffer, {
        contentType: getContentType(filename),
        upsert: false
      });

    if (error) {
      // Si le fichier existe déjà, on le considère comme un succès
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        const { data: publicUrlData } = supabase.storage
          .from('comedien-photos')
          .getPublicUrl(`${comedienId}/${filename}`);
        return publicUrlData.publicUrl;
      }
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('comedien-photos')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error(`    ❌ Erreur upload Supabase: ${error.message}`);
    return null;
  }
}

/**
 * Détermine le content-type basé sur l'extension
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

/**
 * Extrait le nom de fichier d'une URL
 */
function extractFilename(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
}

/**
 * Pause
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formate la taille en bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Migre les photos WordPress d'un comédien
 */
async function migrateComedienPhotos(comedien: Comedien): Promise<void> {
  const { id, first_name, last_name, photos } = comedien;
  const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Inconnu';

  // Filtrer uniquement les photos WordPress
  const wordpressPhotos = photos.filter(photo => 
    photo && (photo.includes('wp-content') || photo.includes('adk-kasting.com/wp-content'))
  );

  if (wordpressPhotos.length === 0) {
    return; // Pas de photos WordPress, on passe
  }

  stats.comediensTraites++;
  stats.photosWordpressTrouvees += wordpressPhotos.length;

  const progress = Math.round((stats.comediensTraites / stats.comediensTotal) * 100);
  
  console.log(`\n[${progress}%] 👤 ${name} (${stats.comediensTraites}/${stats.comediensTotal})`);
  console.log('─'.repeat(40));
  console.log(`  📷 ${wordpressPhotos.length} photo(s) WordPress à réessayer`);

  const newPhotos: string[] = [];
  const otherPhotos = photos.filter(photo => 
    photo && !photo.includes('wp-content') && !photo.includes('adk-kasting.com/wp-content')
  );

  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (let i = 0; i < wordpressPhotos.length; i++) {
    const wpUrl = wordpressPhotos[i];
    const photoNum = i + 1;
    
    console.log(`\n  [${photoNum}/${wordpressPhotos.length}] ${wpUrl.substring(0, 80)}...`);

    // Télécharger l'image
    console.log(`    ⬇️  Téléchargement...`);
    const imageBuffer = await downloadImage(wpUrl);

    if (!imageBuffer) {
      console.log(`    ❌ ÉCHEC du téléchargement`);
      errorCount++;
      // On garde l'URL WordPress pour une prochaine tentative
      newPhotos.push(wpUrl);
      await sleep(PAUSE_BETWEEN_PHOTOS);
      continue;
    }

    console.log(`    ✓ Téléchargé (${formatBytes(imageBuffer.length)})`);

    // Générer un nom de fichier unique
    const originalFilename = extractFilename(wpUrl);
    const ext = originalFilename.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filename = `${timestamp}_${photoNum}.${ext}`;

    // Upload vers Supabase
    console.log(`    ⬆️  Upload vers Supabase: ${id}/${filename}`);
    const supabaseUrl = await uploadToSupabase(id, imageBuffer, filename);

    if (supabaseUrl) {
      console.log(`    ✅ Migré avec succès`);
      newPhotos.push(supabaseUrl);
      successCount++;
      stats.photosMigrees++;
    } else {
      console.log(`    ❌ ÉCHEC de l'upload`);
      errorCount++;
      // On garde l'URL WordPress pour une prochaine tentative
      newPhotos.push(wpUrl);
    }

    await sleep(PAUSE_BETWEEN_PHOTOS);
  }

  // Combiner avec les photos déjà Supabase
  const allPhotos = [...otherPhotos, ...newPhotos];

  // Mettre à jour la base de données
  if (successCount > 0) {
    console.log(`\n  💾 Mise à jour de la base de données...`);
    const { error } = await supabase
      .from('comediens')
      .update({ photos: allPhotos })
      .eq('id', id);

    if (error) {
      console.error(`  ❌ Erreur mise à jour DB: ${error.message}`);
    } else {
      console.log(`  ✅ Base de données mise à jour (${successCount} nouvelles URLs)`);
    }
  }

  if (errorCount > 0) {
    stats.photosEchecs += errorCount;
  }

  await sleep(PAUSE_BETWEEN_COMEDIENS);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   🔄 RÉESSAI DE MIGRATION DES PHOTOS WORDPRESS ÉCHOUÉES         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('⏳ Recherche des comédiens avec photos WordPress restantes...\n');

  // Récupérer tous les comédiens avec des photos WordPress
  const { data: comediens, error } = await supabase
    .from('comediens')
    .select('id, first_name, last_name, photos')
    .not('photos', 'is', null);

  if (error) {
    console.error('❌ Erreur lors de la récupération des comédiens:', error);
    process.exit(1);
  }

  // Filtrer uniquement ceux qui ont encore des URLs WordPress
  const comediensWithWP = comediens.filter(c => 
    c.photos && c.photos.some((photo: string) => 
      photo && (photo.includes('wp-content') || photo.includes('adk-kasting.com/wp-content'))
    )
  );

  stats.comediensTotal = comediensWithWP.length;

  console.log('═'.repeat(80));
  console.log(`📊 ${comediensWithWP.length} comédien(s) avec photos WordPress à réessayer`);
  console.log('═'.repeat(80));
  console.log(`⚙️  Paramètres:`);
  console.log(`   - Tentatives par photo: ${MAX_RETRIES}`);
  console.log(`   - Délai entre tentatives: ${RETRY_DELAY}ms`);
  console.log(`   - Pause entre photos: ${PAUSE_BETWEEN_PHOTOS}ms`);
  console.log(`   - Pause entre comédiens: ${PAUSE_BETWEEN_COMEDIENS}ms`);
  console.log('═'.repeat(80));

  if (comediensWithWP.length === 0) {
    console.log('\n✨ Aucune photo WordPress restante ! Migration complète ! 🎉\n');
    process.exit(0);
  }

  const startTime = Date.now();

  // Traiter chaque comédien
  for (const comedien of comediensWithWP) {
    await migrateComedienPhotos(comedien);
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  // Afficher les statistiques finales
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('═'.repeat(80));
  console.log(`  Comédiens traités:             ${stats.comediensTraites}`);
  console.log(`  Total de photos WordPress:     ${stats.photosWordpressTrouvees}`);
  console.log(`  Photos migrées avec succès:    ${stats.photosMigrees} ✅`);
  console.log(`  Photos en erreur:              ${stats.photosEchecs} ❌`);
  if (stats.photosWordpressTrouvees > 0) {
    const successRate = Math.round((stats.photosMigrees / stats.photosWordpressTrouvees) * 100);
    console.log(`  Taux de réussite:              ${successRate}%`);
  }
  console.log(`  Durée totale:                  ${duration}s`);
  console.log('═'.repeat(80));
  console.log('\n✨ Réessai terminé !\n');
}

main().catch(console.error);
