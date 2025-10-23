# Structure des Permis de Conduire

## Migration WordPress → Supabase

### Source WordPress
- **Table**: `wp_usermeta`
- **Clé**: `actor_driving_license`
- **Format**: Tableau PHP sérialisé
- **Exemple**: `a:2:{i:0;s:2:"B";i:1;s:7:"Camion";}` → `['B', 'Camion']`

### Destination Supabase
- **Table**: `comedien_skills`
- **Structure**:
  ```sql
  CREATE TABLE comedien_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comedien_id UUID REFERENCES comediens(id) ON DELETE CASCADE,
    skill_category VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

### Exemples de données
```sql
-- Pour un comédien ayant les permis Auto et Camion
INSERT INTO comedien_skills VALUES
  (gen_random_uuid(), 'comedien-uuid-123', 'driving', 'Auto'),
  (gen_random_uuid(), 'comedien-uuid-123', 'driving', 'Camion');
```

## Types de Permis Supportés

D'après les données actuelles de la base :

- **Auto** : 3,968 comédiens (permis voiture)
- **Moto** : 439 comédiens (permis moto)  
- **Camion** : 88 comédiens (permis poids lourd)
- **Avion / hélicoptère** : 14 comédiens (permis pilote)

## Utilisation dans le Code

### API Endpoint
```typescript
GET /api/comediens?driving_license=Auto
GET /api/comediens?driving_license=Moto
GET /api/comediens?driving_license=Camion
GET /api/comediens?driving_license=Avion%20/%20hélicoptère
```

### Fonctions utilitaires
```typescript
import { getComedienDrivingLicenses, formatDrivingLicenses } from '@/lib/driving-licenses'

// Récupérer les permis d'un comédien
const licenses = await getComedienDrivingLicenses(comedienId)

// Formater pour l'affichage
const formatted = formatDrivingLicenses(['Auto', 'Moto']) // "Auto, Moto"
```

### Filtres
```typescript
// Interface mise à jour
interface ComedienFilters {
  driving_license?: string // 'Auto', 'Moto', 'Camion', 'Avion / hélicoptère'
}
```

## Migration des Données

Si vous devez migrer des données depuis WordPress, voici le processus :

1. **Extraire** les données de `wp_usermeta` avec `meta_key = 'actor_driving_license'`
2. **Désérialiser** le tableau PHP : `unserialize($meta_value)`
3. **Insérer** chaque permis comme une ligne séparée dans `comedien_skills`

### Script PHP de migration (exemple)
```php
$stmt = $pdo->prepare("SELECT user_id, meta_value FROM wp_usermeta WHERE meta_key = 'actor_driving_license'");
$stmt->execute();

foreach ($stmt->fetchAll() as $row) {
    $licenses = unserialize($row['meta_value']);
    foreach ($licenses as $license) {
        $insert = $supabase->insert('comedien_skills', [
            'comedien_id' => $row['user_id'],
            'skill_category' => 'driving',
            'skill_name' => $license
        ]);
    }
}
```
