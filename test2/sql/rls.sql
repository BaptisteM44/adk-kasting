-- sql/rls.sql
-- Row Level Security (RLS) pour ADKcasting

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE comediens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_ratings ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Tout le monde peut voir les profils publics" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Seuls les admins peuvent insérer des profils" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour films
CREATE POLICY "Tout le monde peut voir les films actifs" ON films
    FOR SELECT USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les films" ON films
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour comediens
CREATE POLICY "Tout le monde peut voir les comédiens actifs" ON comediens
    FOR SELECT USING (is_active = true);

CREATE POLICY "Les admins peuvent voir tous les comédiens" ON comediens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Les comédiens peuvent mettre à jour leur propre profil" ON comediens
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Seuls les admins peuvent insérer des comédiens" ON comediens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Seuls les admins peuvent supprimer des comédiens" ON comediens
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour admin_ratings
CREATE POLICY "Seuls les admins peuvent voir les notes" ON admin_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Seuls les admins peuvent noter" ON admin_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = admin_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Les admins peuvent modifier leurs propres notes" ON admin_ratings
    FOR UPDATE USING (
        auth.uid() = admin_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Les admins peuvent supprimer leurs propres notes" ON admin_ratings
    FOR DELETE USING (
        auth.uid() = admin_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Fonction pour créer un profil utilisateur automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'public');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
