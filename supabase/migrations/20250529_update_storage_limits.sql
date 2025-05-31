-- Update storage bucket configuration to allow larger files
UPDATE storage.buckets
SET file_size_limit = 209715200  -- 200MB in bytes
WHERE id = 'videos';

-- Verify the change
SELECT id, name, file_size_limit
FROM storage.buckets
WHERE id = 'videos'; 