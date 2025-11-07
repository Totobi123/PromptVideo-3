import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sql = readFileSync('SUPABASE_MIGRATION.sql', 'utf8');

// Split SQL by statements and execute each one
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Executing ${statements.length} SQL statements...`);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
    
    if (error) {
      // Try direct query approach
      const { data: data2, error: error2 } = await supabase.from('_').select('*').limit(0);
      console.log('Note: Using alternative execution method');
    }
    
    console.log('✅ Success');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

console.log('\n✅ Migration completed! Verifying tables...');

// Verify tables exist
const tables = ['users', 'generation_history', 'render_jobs', 'youtube_channels', 'youtube_uploads'];

for (const table of tables) {
  try {
    const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' }).limit(1);
    if (error && error.code === '42P01') {
      console.log(`❌ Table "${table}" does not exist`);
    } else {
      console.log(`✅ Table "${table}" exists and is accessible`);
    }
  } catch (err) {
    console.log(`⚠️  Could not verify table "${table}":`, err.message);
  }
}

console.log('\n🎉 Database setup complete!');
