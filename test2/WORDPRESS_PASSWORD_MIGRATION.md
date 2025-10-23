# Système d'Authentification - Compatibilité WordPress

## 🎯 Objectif

Permettre aux utilisateurs WordPress existants de se connecter au nouveau site avec leurs **mêmes identifiants** (email + mot de passe), tout en migrant progressivement vers un système bcrypt plus sécurisé.

## 🔐 Compatibilité des Mots de Passe

### Types de hash supportés

1. **WordPress phpass** (`$P$...` ou `$H$...`)
   - Format utilisé par l'ancien site WordPress
   - Basé sur la classe `PasswordHash` de WordPress
   - Utilise MD5 itéré avec salt

2. **bcrypt** (`$2a$...`, `$2b$...`, `$2y$...`)
   - Format moderne utilisé pour les nouveaux utilisateurs
   - Plus sécurisé que phpass
   - Standard de l'industrie

### Migration automatique

Lors de la première connexion réussie d'un utilisateur WordPress :

1. ✅ Le système vérifie le mot de passe avec le hash WordPress
2. ✅ Si valide, l'utilisateur est connecté
3. 🔄 Le hash est automatiquement converti en bcrypt
4. ✅ Les connexions suivantes utiliseront bcrypt

## 📁 Fichiers Importants

### `/lib/wordpress-password.ts`
Module de compatibilité contenant :
- `verifyPassword()` - Vérifie un mot de passe (WordPress ou bcrypt)
- `hashPassword()` - Hash un nouveau mot de passe avec bcrypt
- `isWordPressHash()` - Détecte un hash WordPress
- `isBcryptHash()` - Détecte un hash bcrypt

### `/pages/api/auth/login.ts`
API de connexion mise à jour :
```typescript
// Vérifie le mot de passe (compatible WordPress ET bcrypt)
const isPasswordValid = await verifyPassword(password, comedien.user_pass)

// Migration automatique vers bcrypt
if (isPasswordValid && isWordPressHash(comedien.user_pass)) {
  const newHash = await hashPassword(password)
  await supabase
    .from('comediens')
    .update({ user_pass: newHash })
    .eq('id', comedien.id)
}
```

## 🧪 Tests

### Vérifier les types de hash dans la base

Exécutez cette requête SQL dans Supabase SQL Editor :

```sql
-- Compter les différents types de hashs
SELECT 
  CASE 
    WHEN user_pass LIKE '$P$%' OR user_pass LIKE '$H$%' THEN 'WordPress (phpass)'
    WHEN user_pass LIKE '$2a$%' OR user_pass LIKE '$2b$%' OR user_pass LIKE '$2y$%' THEN 'bcrypt'
    WHEN user_pass IS NULL THEN 'Pas de mot de passe'
    ELSE 'Format inconnu'
  END AS hash_type,
  COUNT(*) as count
FROM comediens
GROUP BY hash_type
ORDER BY count DESC;
```

### Tester la compatibilité WordPress

```bash
# Test unitaire
npm run test:wordpress-password

# Vérifier les hash dans la DB
npm run check:wordpress-hash
```

### Test manuel

1. Trouvez un compte WordPress dont vous connaissez le mot de passe
2. Allez sur `/connexion`
3. Entrez email et mot de passe
4. ✅ La connexion devrait fonctionner
5. 🔄 Vérifiez dans la console que le hash a été migré vers bcrypt

## 🔒 Sécurité

### Anciennes sessions WordPress
⚠️ Les anciennes sessions WordPress ne sont **pas** compatibles avec le nouveau système. Les utilisateurs doivent se reconnecter.

### Tokens de session
- Format : JWT (JSON Web Token)
- Durée : 7 jours
- Stockage : localStorage (sera amélioré avec httpOnly cookies)

### Mot de passe oublié
Le système de reset de mot de passe est disponible :
- Page `/reset-password` - Demande de reset
- Page `/nouveau-mot-de-passe` - Définir nouveau mot de passe
- Token de reset valide 1 heure
- Nouveau mot de passe hashé avec bcrypt

## 📊 Migration Progressive

```
État initial (WordPress):
├── 8,914 comédiens
├── ~8,914 hash WordPress (phpass)
└── 0 hash bcrypt

État après 1 mois:
├── 8,914 comédiens
├── ~7,500 hash WordPress (utilisateurs inactifs)
├── ~1,400 hash bcrypt (utilisateurs actifs)
└── Migration automatique à chaque connexion

État après 6 mois:
├── 8,914 comédiens
├── ~6,000 hash WordPress (comptes dormants)
├── ~2,900 hash bcrypt (utilisateurs réguliers)
└── Comptes inactifs peuvent être archivés
```

## 🚀 Prochaines Améliorations

1. **Session persistante**
   - [ ] Ajouter localStorage + secure cookies
   - [ ] Implémenter refresh tokens
   - [ ] Session survit au refresh de page

2. **Sécurité renforcée**
   - [ ] httpOnly cookies pour les tokens
   - [ ] CSRF protection
   - [ ] Rate limiting sur login
   - [ ] 2FA optionnel

3. **Migration forcée**
   - [ ] Après 1 an, forcer reset pour les hash WordPress restants
   - [ ] Email de notification aux utilisateurs inactifs

## 📝 Notes Techniques

### Format WordPress phpass

Structure du hash : `$P$B<salt><hash>`
- `$P$` ou `$H$` : Identifiant du format
- `B` : Nombre d'itérations (8 = 256 itérations)
- 8 caractères : Salt
- 22 caractères : Hash MD5 itéré encodé en base64

### Format bcrypt

Structure du hash : `$2b$10$<salt><hash>`
- `$2b$` : Version de bcrypt
- `10` : Cost factor (2^10 = 1024 itérations)
- 22 caractères : Salt
- 31 caractères : Hash

## ❓ FAQ

**Q: Que se passe-t-il si je change mon mot de passe WordPress ?**
R: Le hash WordPress sera utilisé jusqu'à votre première connexion sur le nouveau site, puis migré vers bcrypt.

**Q: Puis-je forcer la migration de tous les hash maintenant ?**
R: Non recommandé. Sans connaître les mots de passe en clair, on ne peut pas les re-hasher. La migration automatique à la connexion est la solution la plus sûre.

**Q: Les mots de passe WordPress sont-ils sécurisés ?**
R: Phpass est moins sécurisé que bcrypt moderne, d'où la migration automatique. Mais il reste acceptable pour une transition.

**Q: Combien de temps durera la transition ?**
R: Dépend de l'activité des utilisateurs. Les utilisateurs actifs seront migrés en quelques semaines/mois. Les comptes dormants peuvent rester en WordPress indéfiniment.
