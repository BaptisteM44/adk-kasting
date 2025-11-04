#!/usr/bin/env node

/**
 * Script de conversion des images de films locales en WebP
 * Convertit toutes les images du dossier public/images/films/ en WebP optimisé
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  quality: 80,        // Qualité WebP (0-100)
  maxWidth: 1920,     // Largeur maximale
  maxHeight: 2560,    // Hauteur maximale
  format: 'webp',     // Format de sortie
  sourceDir: path.join(__dirname, '../public/images/films'),
  backupDir: path.join(__dirname, '../public/images/films/backup'),
};

// Extensions d'images à convertir
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

/**
 * Obtenir la taille d'un fichier en octets
 */
async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
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
 * Convertir une image en WebP
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  📸 ${path.basename(inputPath)} - ${metadata.width}x${metadata.height}`);

    // Redimensionner si nécessaire
    let pipeline = image;
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      console.log(`  🔧 Redimensionné à max ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
    }

    // Convertir en WebP
    await pipeline
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    // Statistiques
    const originalSize = await getFileSize(inputPath);
    const newSize = await getFileSize(outputPath);
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`  💾 ${formatSize(originalSize)} → ${formatSize(newSize)} (-${reduction}%)`);
    console.log(`  ✅ Sauvegardé: ${path.basename(outputPath)}\n`);

    return {
      originalPath: inputPath,
      newPath: outputPath,
      originalSize,
      newSize,
      reduction: parseFloat(reduction),
    };
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}\n`);
    throw error;
  }
}

/**
 * Créer le dossier de backup
 */
async function createBackupDir() {
  try {
    await fs.mkdir(CONFIG.backupDir, { recursive: true });
    console.log(`📁 Dossier de backup créé: ${CONFIG.backupDir}\n`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Déplacer les fichiers originaux vers le backup
 */
async function backupOriginal(originalPath) {
  const fileName = path.basename(originalPath);
  const backupPath = path.join(CONFIG.backupDir, fileName);

  try {
    await fs.rename(originalPath, backupPath);
    console.log(`  📦 Original sauvegardé dans backup/`);
  } catch (error) {
    console.error(`  ⚠️  Erreur backup: ${error.message}`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🎬 Conversion des images de films en WebP\n');
  console.log(`📂 Dossier source: ${CONFIG.sourceDir}`);
  console.log(`⚙️  Configuration: WebP ${CONFIG.quality}%, max ${CONFIG.maxWidth}x${CONFIG.maxHeight}px\n`);

  try {
    // Vérifier que le dossier existe
    await fs.access(CONFIG.sourceDir);

    // Lire tous les fichiers
    const files = await fs.readdir(CONFIG.sourceDir);

    // Filtrer uniquement les images
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('❌ Aucune image à convertir trouvée.\n');
      return;
    }

    console.log(`📊 ${imageFiles.length} image(s) à convertir\n`);
    console.log('─'.repeat(60) + '\n');

    // Créer le dossier de backup
    await createBackupDir();

    // Convertir chaque image
    const results = [];
    for (const file of imageFiles) {
      const inputPath = path.join(CONFIG.sourceDir, file);
      const outputName = path.basename(file, path.extname(file)) + '.webp';
      const outputPath = path.join(CONFIG.sourceDir, outputName);

      console.log(`🔄 Conversion de: ${file}`);

      try {
        const result = await convertToWebP(inputPath, outputPath);
        results.push(result);

        // Déplacer l'original vers backup
        await backupOriginal(inputPath);
      } catch (error) {
        console.error(`❌ Échec de la conversion de ${file}: ${error.message}\n`);
      }
    }

    // Rapport final
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RAPPORT DE CONVERSION\n');

    if (results.length > 0) {
      const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
      const totalReduction = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);

      console.log(`✅ ${results.length}/${imageFiles.length} image(s) convertie(s) avec succès`);
      console.log(`💾 Taille totale originale: ${formatSize(totalOriginal)}`);
      console.log(`💾 Taille totale nouvelle: ${formatSize(totalNew)}`);
      console.log(`📉 Réduction totale: -${totalReduction}% (~${formatSize(totalOriginal - totalNew)} économisés)\n`);

      console.log('📝 Fichiers convertis:');
      results.forEach(r => {
        console.log(`   • ${path.basename(r.newPath)} (-${r.reduction}%)`);
      });

      console.log('\n📦 Les fichiers originaux ont été déplacés dans:');
      console.log(`   ${CONFIG.backupDir}`);
      console.log('\n💡 Si tout fonctionne bien, vous pouvez supprimer le dossier backup/');
    } else {
      console.log('❌ Aucune image n\'a pu être convertie.\n');
    }

    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécution
main();
