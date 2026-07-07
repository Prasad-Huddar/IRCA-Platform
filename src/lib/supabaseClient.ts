import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://biugkzihccnfjcvrctmv.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_wv0LXzfmXsWv-b1pBnajKA_cC0rK5LJ';

// Create Supabase client with auth handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false, // We use custom auth, so disable built-in refresh
    persistSession: false,   // We manage our own sessions in 'user_sessions' table, disable GoTrue persistence
    detectSessionInUrl: false
  }
});

// Create admin client for operations that need service role access
// WARNING: This client is currently using the ANON key, not the SERVICE_ROLE key.
// It will NOT have admin privileges and will be subject to RLS policies associated with the 'anon' role.
// To use real admin privileges, you must provide the SERVICE_ROLE_KEY.
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
});
