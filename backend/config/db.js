const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set – database calls will fail');
}

// Service-role client (bypasses RLS, for server-side operations)
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function connectDB() {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connected');
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    // Don't exit – allow app to start even without DB (for health checks)
  }
}

module.exports = { connectDB, supabase };

