# Système de Statuts des Profils Comédiens

## Vue d'ensemble

Le système utilise **4 statuts** pour gérer le cycle de vie des profils :

### 1. **`pending`** - En attente de validation
- **Couleur**: Orange 🟠
- **Description**: Nouveau profil inscrit, en attente de validation par un admin
- **Visible au public**: ❌ Non
- **Accès comédien**: ✅ Peut éditer son profil

### 2. **`approved`** - Validé (non payé)
- **Couleur**: Bleu 🔵
- **Description**: Profil validé par un admin, mais comédien n'a pas encore payé
- **Visible au public**: ❌ Non
- **Accès comédien**: ✅ Peut éditer son profil
- **Note**: Peut voir un message pour effectuer le paiement

### 3. **`published`** - Publié (payé)
- **Couleur**: Vert 🟢
- **Description**: Comédien a payé, profil visible publiquement
- **Visible au public**: ✅ Oui
- **Accès comédien**: ✅ Peut éditer son profil

### 4. **`trash`** - Supprimé
- **Couleur**: Rouge 🔴
- **Description**: Profil supprimé ou rejeté
- **Visible au public**: ❌ Non
- **Accès comédien**: ❌ Accès restreint

## Workflow Normal

```
Inscription
    ↓
[pending] ← En attente de validation admin
    ↓
[approved] ← Admin valide le profil
    ↓
[published] ← Comédien paye → Visible au public
```

## Actions Admin (Dashboard)

Dans le dashboard admin, vous pouvez :

1. **Filtrer par statut**:
   - "En attente de validation" → Voir les nouveaux inscrits
   - "Validés (non payés)" → Voir ceux qui attendent de payer
   - "Publiés (payés)" → Voir les profils publics
   - "Supprimés" → Voir les profils archivés

2. **Boutons d'action** pour chaque profil:
   - **✓ Publier (payé)** - Marquer comme payé et rendre public
   - **👍 Valider** - Approuver le profil (attend paiement)
   - **⏸ En attente** - Remettre en attente de validation
   - **🗑 Supprimer** - Archiver/supprimer le profil

## Installation / Migration

### Étape 1: Exécuter la migration SQL

Copiez-collez ce contenu dans l'éditeur SQL de Supabase :

\`\`\`sql
-- Migration: Ajouter le statut "approved"
BEGIN;

ALTER TABLE comediens
DROP CONSTRAINT IF EXISTS comediens_status_check;

ALTER TABLE comediens
ADD CONSTRAINT comediens_status_check
CHECK (status IN ('pending', 'approved', 'published', 'trash'));

-- Mettre à jour le trigger
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

### Étape 2: Vérifier les données

Après la migration, vérifiez la répartition des statuts :

\`\`\`sql
SELECT
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM comediens
GROUP BY status
ORDER BY status;
\`\`\`

## Fichiers Modifiés

1. **`types/index.ts`** - Type ComedienStatus mis à jour
2. **`pages/dashboard.tsx`** - Interface admin avec nouveau statut
3. **`pages/api/comediens/[id]/status.ts`** - API de changement de statut
4. **`sql/migration_add_approved_status.sql`** - Migration SQL

## Visibilité Publique

### API `/api/comediens` (liste publique)

L'API continue de filtrer par `status = 'published'` pour ne montrer que les profils payés.

```typescript
// pages/api/comediens.ts (ligne ~66)
query = query.eq('status', 'published')
```

### RLS (Row Level Security)

Les politiques Supabase permettent :
- **Public**: Voir uniquement les profils `published`
- **Admins**: Voir tous les statuts
- **Comédiens**: Voir leur propre profil quel que soit le statut

## Intégration Paiement (À venir)

Pour intégrer le système de paiement :

1. Après validation admin → Profil passe en `approved`
2. Envoyer email au comédien avec lien de paiement
3. Après paiement réussi → Profil passe en `published`
4. Profil devient visible au public

### Code exemple pour le paiement :

```typescript
// Après succès du paiement Stripe/PayPal
const response = await fetch(`/api/comediens/${comedienId}/status`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'published',
    isAdmin: true // ou vérifier le token de paiement
  })
})
```

## Questions Fréquentes

**Q: Que se passe-t-il si un profil `published` ne paye plus ?**
R: L'admin peut le remettre en `approved` ou `pending` manuellement depuis le dashboard.

**Q: Un comédien peut-il éditer son profil quand il est `approved` ?**
R: Oui, tous les statuts sauf `trash` permettent l'édition par le comédien lui-même.

**Q: Comment savoir combien de profils sont en attente de paiement ?**
R: Dans le dashboard admin, sélectionnez le filtre "Validés (non payés)" pour voir la liste.

**Q: Les profils `approved` sont-ils visibles quelque part ?**
R: Non, seuls les profils `published` sont visibles au public. Les autres statuts ne sont visibles que dans le dashboard admin.
