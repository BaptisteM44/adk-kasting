import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import sharp from 'sharp';
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 2560,
  format: 'webp' as const,
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

// Désactiver le body parser par défaut de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialiser Supabase avec service role key pour bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Parser le formulaire multipart
 */
async function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: CONFIG.maxFileSize,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

/**
 * Convertir une image en WebP
 */
async function convertToWebP(inputPath: string): Promise<{ buffer: Buffer; width: number; height: number }> {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Redimensionner si nécessaire
    let pipeline = image;
    if (metadata.width && metadata.height &&
        (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight)) {
      pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convertir en WebP
    const buffer = await pipeline
      .webp({ quality: CONFIG.quality })
      .toBuffer();

    const finalMetadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
    };
  } catch (error) {
    throw new Error(`Erreur conversion WebP: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Uploader vers Supabase Storage
 */
async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const webpFileName = `${timestamp}-${randomId}.webp`;
    const filePath = `films/${webpFileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw new Error(`Erreur upload Supabase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Handler principal
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Autoriser uniquement POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Utilisez POST.'
    });
  }

  try {
    // Parser le formulaire
    const { files } = await parseForm(req);

    // Récupérer le fichier
    const fileArray = Array.isArray(files.image) ? files.image : [files.image];
    const file = fileArray[0] as File;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier reçu. Assurez-vous d\'envoyer un fichier avec le champ "image".'
      });
    }

    // Valider le type MIME
    if (!CONFIG.allowedMimeTypes.includes(file.mimetype || '')) {
      return res.status(400).json({
        success: false,
        error: `Type de fichier non autorisé: ${file.mimetype}. Types acceptés: ${CONFIG.allowedMimeTypes.join(', ')}`
      });
    }

    // Valider la taille
    if (file.size > CONFIG.maxFileSize) {
      return res.status(400).json({
        success: false,
        error: `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum: ${CONFIG.maxFileSize / 1024 / 1024} MB`
      });
    }

    console.log(`📸 Conversion de: ${file.originalFilename || 'image'} (${(file.size / 1024).toFixed(2)} KB)`);

    // Convertir en WebP
    const { buffer, width, height } = await convertToWebP(file.filepath);
    const newSize = buffer.length;
    const reduction = ((file.size - newSize) / file.size * 100).toFixed(1);

    console.log(`✅ Converti en WebP: ${(newSize / 1024).toFixed(2)} KB (${width}x${height}px, -${reduction}%)`);

    // Uploader vers Supabase
    const publicUrl = await uploadToSupabase(buffer, file.originalFilename || 'image');

    console.log(`☁️  Uploadé: ${publicUrl}`);

    // Nettoyer le fichier temporaire
    try {
      await fs.unlink(file.filepath);
    } catch (error) {
      console.warn('⚠️  Erreur nettoyage fichier temporaire:', error);
    }

    // Retourner la réponse
    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        originalSize: file.size,
        newSize,
        width,
        height,
        reduction: parseFloat(reduction),
        format: 'webp',
      },
      message: `Image convertie en WebP avec succès (-${reduction}%)`,
    });

  } catch (error) {
    console.error('❌ Erreur upload:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload',
    });
  }
}
