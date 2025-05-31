-- Migration to add image_path to children table and create storage bucket for child images
-- Run this in your Supabase SQL editor

-- Add image_path column to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Create storage bucket for child images
INSERT INTO storage.buckets (id, name, public) VALUES ('child-images', 'child-images', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for child images
CREATE POLICY "Users can upload their own child images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'child-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own child images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'child-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own child images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'child-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own child images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'child-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'children' AND column_name = 'image_path'; 