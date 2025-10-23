/**
 * Compatibilité avec les mots de passe WordPress (phpass)
 * 
 * WordPress utilise phpass pour hasher les mots de passe.
 * Ce module permet de valider les anciens mots de passe WordPress
 * tout en supportant les nouveaux mots de passe bcrypt.
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * Classe PasswordHash compatible avec WordPress phpass
 * Basée sur la classe PasswordHash de WordPress
 */
class WordPressPasswordHash {
  private itoa64: string = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  private iterationCountLog2: number = 8
  private portableHashes: boolean = true

  /**
   * Encode un nombre en base64
   */
  private encode64(input: Buffer, count: number): string {
    let output = ''
    let i = 0

    do {
      let value = input[i++]
      output += this.itoa64[value & 0x3f]

      if (i < count) {
        value |= input[i] << 8
      }

      output += this.itoa64[(value >> 6) & 0x3f]

      if (i++ >= count) {
        break
      }

      if (i < count) {
        value |= input[i] << 16
      }

      output += this.itoa64[(value >> 12) & 0x3f]

      if (i++ >= count) {
        break
      }

      output += this.itoa64[(value >> 18) & 0x3f]
    } while (i < count)

    return output
  }

  /**
   * Hash un mot de passe avec un salt donné
   */
  private cryptPrivate(password: string, setting: string): string {
    let output = '*0'

    if (setting.substring(0, 2) === output) {
      output = '*1'
    }

    const id = setting.substring(0, 3)

    if (id !== '$P$' && id !== '$H$') {
      return output
    }

    const countLog2 = this.itoa64.indexOf(setting[3])

    if (countLog2 < 7 || countLog2 > 30) {
      return output
    }

    let count = 1 << countLog2
    const salt = setting.substring(4, 12)

    if (salt.length !== 8) {
      return output
    }

    let hash = crypto.createHash('md5').update(salt + password).digest()

    do {
      hash = crypto.createHash('md5').update(Buffer.concat([hash, Buffer.from(password)])).digest()
    } while (--count)

    output = setting.substring(0, 12)
    output += this.encode64(hash, 16)

    return output
  }

  /**
   * Vérifie si un mot de passe correspond au hash
   */
  checkPassword(password: string, storedHash: string): boolean {
    const hash = this.cryptPrivate(password, storedHash)
    return hash === storedHash
  }
}

/**
 * Vérifie un mot de passe contre un hash WordPress ou bcrypt
 * 
 * @param password - Le mot de passe en clair
 * @param hash - Le hash stocké (WordPress phpass ou bcrypt)
 * @returns Promise<boolean> - true si le mot de passe est correct
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false
  }

  // Détecter le type de hash
  if (hash.startsWith('$P$') || hash.startsWith('$H$')) {
    // Hash WordPress (phpass)
    console.log('🔐 Vérification avec hash WordPress (phpass)')
    const wpHash = new WordPressPasswordHash()
    return wpHash.checkPassword(password, hash)
  } else if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    // Hash bcrypt
    console.log('🔐 Vérification avec hash bcrypt')
    return await bcrypt.compare(password, hash)
  } else {
    console.warn('⚠️ Format de hash non reconnu:', hash.substring(0, 10) + '...')
    return false
  }
}

/**
 * Hash un mot de passe avec bcrypt (pour les nouveaux utilisateurs)
 * 
 * @param password - Le mot de passe en clair
 * @returns Promise<string> - Le hash bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * Vérifie si un hash est au format WordPress
 */
export function isWordPressHash(hash: string): boolean {
  return hash.startsWith('$P$') || hash.startsWith('$H$')
}

/**
 * Vérifie si un hash est au format bcrypt
 */
export function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')
}
