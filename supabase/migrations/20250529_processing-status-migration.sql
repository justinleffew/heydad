-- Migration to add processing status to videos table
-- Run this in your Supabase SQL editor

-- Add processing status columns
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Create index for processing status
CREATE INDEX IF NOT EXISTS idx_videos_processing_status ON videos(processing_status);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' AND column_name IN ('processing_status', 'processing_progress', 'processing_error');

-- Show the updated table structure
\d videos; 