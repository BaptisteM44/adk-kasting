// scripts/analyze-doublons.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function analyzeDoublons() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 ANALYSE DES DOUBLONS D\'EMAILS\n');
  
  try {
    // Récupérer tous les comédiens actifs
    const { data: allComediens, error } = await supabase
      .from('comediens')
      .select('id, email, display_name, first_name, last_name, is_active, created_at, phone, domiciliation')
      .eq('is_active', true)
      .order('email, created_at');
    
    if (error) throw error;
    
    // Grouper par email
    const emailGroups = {};
    allComediens.forEach(comedien => {
      if (!emailGroups[comedien.email]) {
        emailGroups[comedien.email] = [];
      }
      emailGroups[comedien.email].push(comedien);
    });
    
    // Analyser les doublons
    const doublons = Object.entries(emailGroups).filter(([_, comediens]) => comediens.length > 1);
    
    console.log(`📧 ${doublons.length} emails avec doublons trouvés:\n`);
    
    const recommendations = [];
    
    doublons.forEach(([email, comediens], index) => {
      console.log(`${index + 1}. ${email} (${comediens.length} comptes):`);
      
      comediens.forEach((c, i) => {
        const isComplete = c.first_name && c.last_name && c.phone;
        const isAdmin = c.display_name.toLowerCase().includes('admin');
        
        console.log(`   ${i + 1}. ${c.display_name}`);
        console.log(`      - ID: ${c.id}`);
        console.log(`      - Nom complet: ${c.first_name || 'N/A'} ${c.last_name || 'N/A'}`);
        console.log(`      - Téléphone: ${c.phone || 'N/A'}`);
        console.log(`      - Domiciliation: ${c.domiciliation || 'N/A'}`);
        console.log(`      - Créé: ${c.created_at?.substr(0, 10)}`);
        console.log(`      - Profil complet: ${isComplete ? '✅' : '❌'}`);
        console.log(`      - Type admin: ${isAdmin ? '⚠️' : '👤'}`);
        console.log('');
      });
      
      // Recommandation automatique
      const realProfiles = comediens.filter(c => 
        c.first_name && 
        c.last_name && 
        !c.display_name.toLowerCase().includes('admin')
      );
      
      const adminProfiles = comediens.filter(c => 
        c.display_name.toLowerCase().includes('admin')
      );
      
      let recommendation = '';
      if (realProfiles.length === 1 && adminProfiles.length >= 1) {
        recommendation = `GARDER: ${realProfiles[0].display_name} (${realProfiles[0].id})\nSUPPRIMER: ${adminProfiles.map(a => a.display_name).join(', ')}`;
      } else if (realProfiles.length > 1) {
        recommendation = `FUSIONNER: Choisir le plus complet parmi ${realProfiles.map(r => r.display_name).join(', ')}`;
      } else {
        recommendation = `MANUEL: Analyse manuelle requise`;
      }
      
      console.log(`💡 RECOMMANDATION: ${recommendation}\n`);
      console.log('─'.repeat(80) + '\n');
      
      recommendations.push({
        email,
        comediens,
        recommendation,
        autoCleanable: realProfiles.length === 1 && adminProfiles.length >= 1
      });
    });
    
    // Résumé
    console.log('📊 RÉSUMÉ:');
    console.log(`- Total emails uniques: ${Object.keys(emailGroups).length}`);
    console.log(`- Emails avec doublons: ${doublons.length}`);
    console.log(`- Total comédiens actifs: ${allComediens.length}`);
    console.log(`- Nettoyage automatique possible: ${recommendations.filter(r => r.autoCleanable).length} cas`);
    
    // Générer script de nettoyage
    console.log('\n🧹 SCRIPT DE NETTOYAGE AUTOMATIQUE:');
    console.log('Les cas suivants peuvent être nettoyés automatiquement:\n');
    
    recommendations
      .filter(r => r.autoCleanable)
      .forEach(({ email, comediens }) => {
        const toDelete = comediens.filter(c => c.display_name.toLowerCase().includes('admin'));
        toDelete.forEach(c => {
          console.log(`-- Supprimer: UPDATE comediens SET is_active = false WHERE id = '${c.id}'; -- ${c.display_name} (${email})`);
        });
      });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  analyzeDoublons();
}

module.exports = { analyzeDoublons };