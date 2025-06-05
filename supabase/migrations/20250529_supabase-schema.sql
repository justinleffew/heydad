-- Create children table
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('now', 'age', 'date', 'milestone')),
  unlock_age INTEGER,
  unlock_date DATE,
  unlock_milestone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_children junction table
CREATE TABLE video_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, child_id)
);

-- Enable RLS on all tables
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_children ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for children table
CREATE POLICY "Users can view their own children" ON children
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children" ON children
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children" ON children
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children" ON children
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for videos table
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for video_children table
CREATE POLICY "Users can view video_children for their videos" ON video_children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_children.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert video_children for their videos" ON video_children
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_children.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update video_children for their videos" ON video_children
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_children.video_id 
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete video_children for their videos" ON video_children
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_children.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);

-- Create storage policies
CREATE POLICY "Users can upload their own videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_unlock_type ON videos(unlock_type);
CREATE INDEX idx_video_children_video_id ON video_children(video_id);
CREATE INDEX idx_video_children_child_id ON video_children(child_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 