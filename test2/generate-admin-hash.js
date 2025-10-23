// Script temporaire pour générer un hash admin
const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);
    
    console.log('Mot de passe:', password);
    console.log('Hash généré:', hash);
    console.log('');
    console.log('Commande SQL à exécuter dans Supabase:');
    console.log('');
    console.log(`DELETE FROM comediens WHERE email = 'admin@adk.com';`);
    console.log('');
    console.log(`INSERT INTO comediens (email, first_name, last_name, display_name, domiciliation, user_pass, is_active) VALUES ('admin@adk.com', 'Admin', 'ADK', 'Administrateur ADK', 'Bruxelles', '${hash}', true);`);
    console.log('');
    
    // Test de vérification
    const isValid = await bcrypt.compare(password, hash);
    console.log('Vérification:', isValid ? '✅ Hash correct' : '❌ Hash incorrect');
}

generateHash().catch(console.error);