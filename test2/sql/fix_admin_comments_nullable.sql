-- Modifier la contrainte admin_id pour autoriser NULL
-- Car tous les admins n'existent pas forcément dans auth.users

ALTER TABLE admin_comments
DROP CONSTRAINT IF EXISTS admin_comments_admin_id_fkey;

-- Recréer la contrainte en autorisant NULL et avec SET NULL au lieu de CASCADE
ALTER TABLE admin_comments
ADD CONSTRAINT admin_comments_admin_id_fkey
FOREIGN KEY (admin_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Vérifier que la colonne admin_id autorise NULL (devrait déjà être le cas)
-- Si ce n'est pas le cas, la modifier :
-- ALTER TABLE admin_comments ALTER COLUMN admin_id DROP NOT NULL;
