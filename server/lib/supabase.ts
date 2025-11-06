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
  console.log('✅ Supabase client initialized successfully');
  
  // Verify table exists
  (async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('generation_history')
        .select('*', { head: true, count: 'exact' })
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.error('❌ Table "generation_history" does not exist!');
          console.error('📋 Please run the SQL migration in SUPABASE_MIGRATION.sql in your Supabase dashboard');
        } else {
          console.error('⚠️ Error checking generation_history table:', error.message);
        }
      } else {
        console.log('✅ Table "generation_history" exists and is accessible');
      }
    } catch (err) {
      console.error('⚠️ Could not verify generation_history table:', err);
    }
  })();
} else {
  console.warn('⚠️ Supabase client not initialized - missing credentials');
  console.warn('supabaseUrl:', supabaseUrl ? 'SET' : 'NOT SET');
  console.warn('supabaseKey:', supabaseKey ? 'SET' : 'NOT SET');
}

export { supabase };

export interface GenerationHistory {
  id: string;
  user_id: string;
  type: 'script' | 'channel_name' | 'video_idea' | 'thumbnail' | 'audio';
  prompt?: string;
  result: any;
  created_at: string;
  expires_at: string;
}
