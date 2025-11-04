#!/usr/bin/env node

/**
 * Script de conversion des images de films Supabase Storage en WebP
 * Convertit toutes les images du bucket images/films/ en WebP optimisé
 * et met à jour la base de données avec les nouvelles URLs
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');

// Configuration
const CONFIG = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 2560,
  format: 'webp',
  bucketName: 'images',
  folderPath: 'films/',
  tempDir: path.join(__dirname, '../temp-films'),
};

// Extensions d'images à convertir
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// Initialiser Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Créer le dossier temporaire
 */
async function createTempDir() {
  try {
    await fs.mkdir(CONFIG.tempDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Nettoyer le dossier temporaire
 */
async function cleanupTempDir() {
  try {
    const files = await fs.readdir(CONFIG.tempDir);
    for (const file of files) {
      await fs.unlink(path.join(CONFIG.tempDir, file));
    }
    await fs.rmdir(CONFIG.tempDir);
  } catch (error) {
    console.error('⚠️  Erreur nettoyage temp:', error.message);
  }
}

/**
 * Formater la taille en format lisible
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Lister toutes les images du bucket
 */
async function listFilmImages() {
  try {
    const { data, error } = await supabase.storage
      .from(CONFIG.bucketName)
      .list(CONFIG.folderPath, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      throw error;
    }

    // Filtrer uniquement les images non-WebP
    const images = data.filter(file => {
      const ext = path.extname(file.name).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    return images;
  } catch (error) {
    console.error('❌ Erreur liste images:', error.message);
    return [];
  }
}

/**
 * Télécharger une image depuis Supabase
 */
async function downloadImage(fileName) {
  try {
    const filePath = CONFIG.folderPath + fileName;
    const { data, error } = await supabase.storage
      .from(CONFIG.bucketName)
      .download(filePath);

    if (error) {
      throw error;
    }

    // Sauvegarder temporairement
    const tempPath = path.join(CONFIG.tempDir, fileName);
    const buffer = Buffer.from(await data.arrayBuffer());
    await fs.writeFile(tempPath, buffer);

    return { tempPath, originalSize: buffer.length };
  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Convertir une image en WebP
 */
async function convertToWebP(inputPath) {
  try {
    const outputName = path.basename(inputPath, path.extname(inputPath)) + '.webp';
    const outputPath = path.join(CONFIG.tempDir, outputName);

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Redimensionner si nécessaire
    let pipeline = image;
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convertir en WebP
    await pipeline
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    return { outputPath, outputName, newSize: stats.size };
  } catch (error) {
    console.error(`❌ Erreur conversion:`, error.message);
    throw error;
  }
}

/**
 * Uploader l'image WebP sur Supabase
 */
async function uploadWebP(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const uploadPath = CONFIG.folderPath + fileName;

    const { data, error } = await supabase.storage
      .from(CONFIG.bucketName)
      .upload(uploadPath, fileBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(CONFIG.bucketName)
      .getPublicUrl(uploadPath);

    return publicUrl;
  } catch (error) {
    console.error(`❌ Erreur upload ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Mettre à jour la base de données avec la nouvelle URL
 */
async function updateDatabaseUrls(oldUrl, newUrl) {
  try {
    // Récupérer tous les films qui utilisent cette URL
    const { data: films, error: selectError } = await supabase
      .from('films')
      .select('id, title, image_url')
      .eq('image_url', oldUrl);

    if (selectError) {
      throw selectError;
    }

    if (!films || films.length === 0) {
      console.log('  ℹ️  Aucun film n\'utilise cette URL dans la DB');
      return 0;
    }

    // Mettre à jour tous les films
    const { error: updateError } = await supabase
      .from('films')
      .update({ image_url: newUrl })
      .eq('image_url', oldUrl);

    if (updateError) {
      throw updateError;
    }

    console.log(`  ✅ ${films.length} film(s) mis à jour dans la DB`);
    films.forEach(film => console.log(`     • ${film.title}`));

    return films.length;
  } catch (error) {
    console.error('  ❌ Erreur mise à jour DB:', error.message);
    return 0;
  }
}

/**
 * Supprimer l'ancienne image du bucket
 */
async function deleteOldImage(fileName) {
  try {
    const filePath = CONFIG.folderPath + fileName;
    const { error } = await supabase.storage
      .from(CONFIG.bucketName)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    console.log(`  🗑️  Ancienne image supprimée: ${fileName}`);
  } catch (error) {
    console.error(`  ⚠️  Erreur suppression ${fileName}:`, error.message);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🎬 Conversion des images de films Supabase Storage en WebP\n');
  console.log(`☁️  Bucket: ${CONFIG.bucketName}/${CONFIG.folderPath}`);
  console.log(`⚙️  Configuration: WebP ${CONFIG.quality}%, max ${CONFIG.maxWidth}x${CONFIG.maxHeight}px\n`);

  try {
    // Vérifier la connexion Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      console.error('   Assurez-vous que .env contient:');
      console.error('   - NEXT_PUBLIC_SUPABASE_URL');
      console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
      process.exit(1);
    }

    // Créer le dossier temporaire
    await createTempDir();
    console.log(`📁 Dossier temporaire créé: ${CONFIG.tempDir}\n`);

    // Lister les images
    console.log('🔍 Recherche des images à convertir...\n');
    const images = await listFilmImages();

    if (images.length === 0) {
      console.log('✅ Aucune image à convertir (toutes sont déjà en WebP ou le dossier est vide)\n');
      await cleanupTempDir();
      return;
    }

    console.log(`📊 ${images.length} image(s) à convertir\n`);
    console.log('─'.repeat(60) + '\n');

    // Convertir chaque image
    const results = [];
    let totalDbUpdates = 0;

    for (const image of images) {
      console.log(`🔄 Traitement de: ${image.name}`);

      try {
        // 1. Télécharger
        console.log('  📥 Téléchargement...');
        const { tempPath, originalSize } = await downloadImage(image.name);

        // 2. Convertir
        console.log('  🔧 Conversion en WebP...');
        const { outputPath, outputName, newSize } = await convertToWebP(tempPath);

        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        console.log(`  💾 ${formatSize(originalSize)} → ${formatSize(newSize)} (-${reduction}%)`);

        // 3. Uploader
        console.log('  📤 Upload vers Supabase...');
        const newUrl = await uploadWebP(outputPath, outputName);
        console.log(`  ✅ Nouvelle URL: ${newUrl}`);

        // 4. Mettre à jour la base de données
        console.log('  🔄 Mise à jour de la base de données...');
        const oldUrl = supabase.storage
          .from(CONFIG.bucketName)
          .getPublicUrl(CONFIG.folderPath + image.name).data.publicUrl;

        const updatedCount = await updateDatabaseUrls(oldUrl, newUrl);
        totalDbUpdates += updatedCount;

        // 5. Supprimer l'ancienne image
        if (updatedCount > 0 || images.length === 1) {
          await deleteOldImage(image.name);
        }

        results.push({
          originalName: image.name,
          newName: outputName,
          originalSize,
          newSize,
          reduction: parseFloat(reduction),
          newUrl,
          dbUpdates: updatedCount,
        });

        console.log(`  ✅ Terminé!\n`);

        // Nettoyer les fichiers temporaires
        await fs.unlink(tempPath);
        await fs.unlink(outputPath);

      } catch (error) {
        console.error(`  ❌ Échec pour ${image.name}: ${error.message}\n`);
      }
    }

    // Nettoyer
    await cleanupTempDir();

    // Rapport final
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RAPPORT DE CONVERSION\n');

    if (results.length > 0) {
      const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
      const totalReduction = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);

      console.log(`✅ ${results.length}/${images.length} image(s) convertie(s) avec succès`);
      console.log(`💾 Taille totale originale: ${formatSize(totalOriginal)}`);
      console.log(`💾 Taille totale nouvelle: ${formatSize(totalNew)}`);
      console.log(`📉 Réduction totale: -${totalReduction}% (~${formatSize(totalOriginal - totalNew)} économisés)`);
      console.log(`🗄️  ${totalDbUpdates} enregistrement(s) mis à jour dans la base de données\n`);

      console.log('📝 Fichiers convertis:');
      results.forEach(r => {
        console.log(`   • ${r.originalName} → ${r.newName} (-${r.reduction}%)`);
        if (r.dbUpdates > 0) {
          console.log(`     └─ ${r.dbUpdates} film(s) mis à jour`);
        }
      });
    } else {
      console.log('❌ Aucune image n\'a pu être convertie.\n');
    }

    console.log('\n' + '═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    await cleanupTempDir();
    process.exit(1);
  }
}

// Exécution
main();
