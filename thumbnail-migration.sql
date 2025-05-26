-- Migration to add thumbnail_path to videos table and update unlock_type constraint
-- Run this in your Supabase SQL editor if you already have videos in your database

-- Add thumbnail_path column if it doesn't exist
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Drop the existing constraint
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_unlock_type_check;

-- Add the new constraint that includes 'now'
ALTER TABLE videos ADD CONSTRAINT videos_unlock_type_check 
CHECK (unlock_type IN ('now', 'age', 'date', 'milestone'));

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' AND column_name = 'thumbnail_path';

SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'videos_unlock_type_check'; 