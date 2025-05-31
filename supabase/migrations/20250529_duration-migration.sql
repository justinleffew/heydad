-- Add duration column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Create index for duration column
CREATE INDEX IF NOT EXISTS idx_videos_duration ON videos(duration);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND column_name = 'duration';

-- Show table structure using standard SQL
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos'
ORDER BY ordinal_position; 