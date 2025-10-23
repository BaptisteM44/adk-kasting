-- Créer le bucket pour les photos de comédiens si il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('comedien-photos', 'comedien-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS : Tout le monde peut voir les photos (lecture publique)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'comedien-photos');

-- Politique RLS : Seuls les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'comedien-photos' 
  AND auth.role() = 'authenticated'
);

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres photos ou admin peut tout supprimer
CREATE POLICY "Users can delete own photos or admin can delete all"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'comedien-photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM comediens
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Politique RLS : Les utilisateurs peuvent mettre à jour leurs propres photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'comedien-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
