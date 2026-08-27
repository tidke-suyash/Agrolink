const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./env');

/**
 * Server-side Supabase client using the service_role key.
 * This has ADMIN-level access — bypasses RLS.
 * Use ONLY on the backend, never expose to the frontend.
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
