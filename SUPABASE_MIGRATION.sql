-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  how_found_us TEXT,
  use_case TEXT,
  user_type TEXT,
  company_name TEXT,
  company_size TEXT,
  onboarding_completed TEXT DEFAULT 'false',
  has_youtube_channel TEXT,
  channel_description TEXT,
  selected_niche TEXT,
  channel_name TEXT,
  channel_logo TEXT,
  default_mood TEXT,
  default_pace TEXT,
  default_category TEXT,
  default_media_source TEXT,
  default_aspect_ratio TEXT,
  notifications_enabled TEXT DEFAULT 'false',
  email_notifications_enabled TEXT DEFAULT 'false'
);

-- Create generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

-- Create render_jobs table
CREATE TABLE IF NOT EXISTS render_jobs (
  job_id VARCHAR PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'queued',
  progress TEXT NOT NULL DEFAULT '0',
  video_url TEXT,
  error TEXT,
  request_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create youtube_channels table
CREATE TABLE IF NOT EXISTS youtube_channels (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL UNIQUE,
  channel_title TEXT NOT NULL,
  channel_description TEXT,
  thumbnail_url TEXT,
  subscriber_count TEXT,
  video_count TEXT,
  view_count TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  connected_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_synced_at TIMESTAMP
);

-- Create youtube_uploads table
CREATE TABLE IF NOT EXISTS youtube_uploads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  youtube_channel_id TEXT NOT NULL,
  youtube_video_id TEXT,
  render_job_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'uploading',
  progress TEXT DEFAULT '0',
  video_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP,
  error TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_type ON generation_history(type);
CREATE INDEX IF NOT EXISTS idx_generation_history_expires_at ON generation_history(expires_at);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_user_id ON youtube_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_uploads_user_id ON youtube_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_uploads_youtube_channel_id ON youtube_uploads(youtube_channel_id);
