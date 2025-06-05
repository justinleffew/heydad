-- Migration to add Cloudflare video ID support
-- Run this in your Supabase SQL editor

-- Add cloudflare_video_id column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS cloudflare_video_id TEXT;

-- Create index for cloudflare_video_id
CREATE INDEX IF NOT EXISTS idx_videos_cloudflare_video_id ON videos(cloudflare_video_id);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' AND column_name = 'cloudflare_video_id';

-- Show the updated table structure
\d videos; 