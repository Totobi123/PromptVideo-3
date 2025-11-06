import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export { supabase };

export interface GenerationHistory {
  id: string;
  user_id: string;
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail';
  prompt?: string;
  result: any;
  created_at: string;
  expires_at: string;
}
