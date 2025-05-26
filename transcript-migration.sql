-- Migration to add transcript support to videos table
-- Run this in your Supabase SQL editor

-- Add transcript column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Add transcript_generated_at timestamp for tracking when transcript was created
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript_generated_at TIMESTAMP WITH TIME ZONE;

-- Create index for transcript search (for future full-text search functionality)
CREATE INDEX IF NOT EXISTS idx_videos_transcript ON videos USING gin(to_tsvector('english', transcript));

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' AND column_name IN ('transcript', 'transcript_generated_at');

-- Show the updated table structure
\d videos; 