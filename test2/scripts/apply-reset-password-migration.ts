// scripts/apply-reset-password-migration.ts
import { supabase } from '../lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  console.log('🔧 Application de la migration pour le reset de mot de passe...\n')

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'sql', 'migration_add_reset_password.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 Contenu de la migration :')
    console.log('─'.repeat(80))
    console.log(sqlContent)
    console.log('─'.repeat(80))
    console.log()

    // Exécuter la migration
    console.log('⚙️ Exécution de la migration...')
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent })

    if (error) {
      // Si la fonction exec_sql n'existe pas, essayons directement
      console.log('⚠️ La fonction exec_sql n\'existe pas, exécution directe...')
      
      // Diviser les commandes SQL
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

      for (const command of commands) {
        console.log(`\n🔹 Exécution : ${command.substring(0, 60)}...`)
        
        // Pour les ALTER TABLE, on doit utiliser une approche différente
        if (command.includes('ALTER TABLE')) {
          const { error: alterError } = await supabase.rpc('exec', { 
            query: command 
          })
          
          if (alterError) {
            console.error(`❌ Erreur : ${alterError.message}`)
          } else {
            console.log('✅ Commande exécutée')
          }
        }
      }
    } else {
      console.log('✅ Migration appliquée avec succès !')
    }

    // Vérifier que les colonnes ont été ajoutées
    console.log('\n🔍 Vérification des colonnes...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification :', columnsError.message)
    } else {
      const firstRow = columns?.[0] || {}
      const hasResetToken = 'reset_token' in firstRow
      const hasResetTokenExpiry = 'reset_token_expiry' in firstRow
      
      console.log(`reset_token : ${hasResetToken ? '✅' : '❌'}`)
      console.log(`reset_token_expiry : ${hasResetTokenExpiry ? '✅' : '❌'}`)
      
      if (hasResetToken && hasResetTokenExpiry) {
        console.log('\n🎉 Migration complétée avec succès !')
        console.log('Le système de réinitialisation de mot de passe est prêt à être utilisé.')
      } else {
        console.log('\n⚠️ Les colonnes n\'ont pas été détectées.')
        console.log('Vous devrez peut-être exécuter la migration manuellement dans Supabase SQL Editor.')
        console.log(`\n📋 Voici les commandes SQL à exécuter :\n`)
        console.log(sqlContent)
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'application de la migration :', error.message)
    console.log('\n💡 Solution alternative :')
    console.log('Copiez le contenu de sql/migration_add_reset_password.sql')
    console.log('et exécutez-le manuellement dans Supabase SQL Editor')
  }
}

applyMigration()
