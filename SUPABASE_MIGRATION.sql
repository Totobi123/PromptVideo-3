-- Supabase Migration: Generation History Table
-- This table stores user generation history for scripts, channel names, video ideas, and thumbnails
-- Records auto-expire after 2 hours

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('script', 'channel_name', 'video_idea', 'thumbnail', 'audio')),
  prompt TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);

-- Create index on expires_at for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_generation_history_expires_at ON generation_history(expires_at);

-- Create index on type for filtered queries
CREATE INDEX IF NOT EXISTS idx_generation_history_type ON generation_history(type);

-- Create composite index for common query pattern (user_id + type + expires_at)
CREATE INDEX IF NOT EXISTS idx_generation_history_user_type_expires 
ON generation_history(user_id, type, expires_at DESC);

-- Enable Row Level Security
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own history
CREATE POLICY "Users can view own history" ON generation_history
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Authenticated users can insert their own history
CREATE POLICY "Users can insert own history" ON generation_history
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own history
CREATE POLICY "Users can delete own history" ON generation_history
  FOR DELETE
  USING (auth.uid()::text = user_id);

COMMENT ON TABLE generation_history IS 'Stores user generation history with 2-hour expiration';
COMMENT ON COLUMN generation_history.type IS 'Type of generation: script, channel_name, video_idea, thumbnail, or audio';
COMMENT ON COLUMN generation_history.result IS 'JSON result from the generation endpoint';
COMMENT ON COLUMN generation_history.expires_at IS 'When this history record should be deleted (2 hours from creation)';
