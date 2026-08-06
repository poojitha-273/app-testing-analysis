-- ==========================================
-- SUPABASE STORAGE BUCKET & POLICIES SETUP
-- ==========================================

-- 1. Create the 'app-files' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-files', 'app-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Storage Row Level Security (RLS) Policies
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'app-files'
  AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-files'
  AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'app-files'
  AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'app-files'
  AND name LIKE (auth.uid()::text || '/%')
);
