# Migration: Passage de tous les comédiens en statut "approved"

## Contexte

Actuellement, tous les comédiens existants ont le statut `published` (visible au public).
L'objectif est de les mettre en statut `approved` (validés mais non payés) pour que :

1. ✅ Tous les profils restent **validés** par les admins
2. ❌ Mais ne soient **plus visibles au public** tant qu'ils n'ont pas payé
3. 💰 Seuls ceux qui paient passeront en `published` et seront visibles

## Étape 1: Exécuter la migration SQL "approved"

**Fichier**: `test2/sql/migration_add_approved_status.sql`

Copiez-collez dans l'éditeur SQL de Supabase :

\`\`\`sql
BEGIN;

-- 1. Modifier la contrainte CHECK pour inclure 'approved'
ALTER TABLE comediens
DROP CONSTRAINT IF EXISTS comediens_status_check;

ALTER TABLE comediens
ADD CONSTRAINT comediens_status_check
CHECK (status IN ('pending', 'approved', 'published', 'trash'));

-- 2. Mettre à jour le trigger is_active
DROP TRIGGER IF EXISTS trigger_sync_is_active ON comediens;
DROP FUNCTION IF EXISTS sync_is_active();

CREATE OR REPLACE FUNCTION sync_is_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_is_active
BEFORE INSERT OR UPDATE OF status ON comediens
FOR EACH ROW
EXECUTE FUNCTION sync_is_active();

COMMIT;
\`\`\`

## Étape 2: Mettre tous les profils en "approved"

**Fichier**: `test2/sql/update_all_to_approved.sql`

Copiez-collez dans l'éditeur SQL de Supabase :

\`\`\`sql
BEGIN;

-- Vérifier AVANT
SELECT status, COUNT(*) as nombre
FROM comediens
GROUP BY status;

-- Mettre TOUS les profils "published" en "approved"
UPDATE comediens
SET status = 'approved'
WHERE status = 'published';

-- Vérifier APRÈS
SELECT
    status,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM comediens
GROUP BY status
ORDER BY status;

COMMIT;
\`\`\`

## Résultat Attendu

Après la migration :

| Statut | Nombre | Description |
|--------|--------|-------------|
| `approved` | ~9000 | Profils validés, en attente de paiement |
| `pending` | 0-10 | Nouveaux profils en attente de validation |
| `published` | 0 | Aucun profil public (tous doivent payer) |
| `trash` | 0-50 | Profils supprimés/rejetés |

## Impact sur le Site

### Frontend Public (test.adk-kasting.com)
- ❌ **AUCUN profil ne sera visible** (liste de comédiens vide)
- Ceci est NORMAL car personne n'a encore payé
- L'API `/api/comediens` filtre par `status = 'published'`

### Dashboard Admin
- ✅ Voir les profils validés dans le filtre **"Validés (non payés)"**
- ✅ Pagination : charge 50 profils à la fois
- ✅ Bouton "Charger plus" pour voir les suivants
- ✅ Compteur : "Profils validés non payés (50 / 9000)"

### Actions Admin
1. **👍 Valider** - Déjà validés, pas de changement
2. **✓ Publier (payé)** - Marque comme payé → devient visible au public
3. **⏸ En attente** - Remet en attente de validation
4. **🗑 Supprimer** - Archive le profil

## Workflow de Paiement

### Pour rendre un profil public

**Option 1: Manuellement via Dashboard**
1. Admin se connecte au dashboard
2. Filtre sur "Validés (non payés)"
3. Trouve le comédien qui a payé
4. Clique sur "✓ Publier (payé)"
5. Le profil devient visible au public

**Option 2: Automatiquement via API (futur)**
```typescript
// Après succès du paiement Stripe/PayPal
await fetch(`/api/comediens/${comedienId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'published',
    isAdmin: true
  })
})
```

## Améliorations Apportées

### 1. Pagination Dashboard
- **Avant**: Chargeait 1000+ profils d'un coup (très lent)
- **Après**: Charge 50 profils, bouton "Charger plus" pour la suite
- **Avantage**: Dashboard rapide même avec 9000 profils

### 2. Compteur Intelligent
- Affiche : "Profils validés non payés (50 / 9000)"
- Montre combien sont chargés vs combien au total
- Se met à jour automatiquement

### 3. Statuts Visibles
- Badge coloré sur chaque profil
- Vert = Publié (payé)
- Bleu = Validé (non payé) ← NOUVEAUTÉ
- Orange = En attente
- Rouge = Supprimé

## FAQ

**Q: Pourquoi le site public est vide après la migration ?**
R: Normal ! Tous les profils sont en `approved` (validés mais non payés). Ils ne redeviendront visibles qu'après paiement.

**Q: Comment savoir qui a payé ?**
R: Vous devez avoir un système de paiement (Stripe, PayPal, etc.) qui notifie votre backend. À ce moment, changez le statut en `published`.

**Q: Un comédien peut-il voir son propre profil ?**
R: Oui ! Les RLS permettent aux comédiens de voir leur propre profil quel que soit le statut.

**Q: Peut-on annuler la migration ?**
R: Oui, exécutez :
\`\`\`sql
UPDATE comediens SET status = 'published' WHERE status = 'approved';
\`\`\`

**Q: Le dashboard est lent avec 9000 profils ?**
R: Non, grâce à la pagination (50 par 50). Seuls 50 profils sont chargés initialement.

## Fichiers Modifiés

1. `test2/pages/dashboard.tsx` - Pagination + compteur
2. `test2/sql/migration_add_approved_status.sql` - Ajout statut approved
3. `test2/sql/update_all_to_approved.sql` - Migration des données
4. `test2/types/index.ts` - Type ComedienStatus
5. `test2/pages/api/comediens/[id]/status.ts` - API changement statut

## Prochaines Étapes

1. ✅ Exécuter les 2 migrations SQL
2. ✅ Vérifier le dashboard admin
3. ⏳ Mettre en place le système de paiement
4. ⏳ Connecter le paiement à l'API de changement de statut
5. ⏳ Tester le workflow complet
